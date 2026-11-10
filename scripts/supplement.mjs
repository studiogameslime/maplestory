import { readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

// Reviewed immutable revisions. Keep this intentionally narrow: the upstream
// licenses factual reuse and asks consumers to avoid copying whole articles.
const revisions = [
  89507, 89506, 88324, 91652, 86109, 91043, 85563, 90616, 90756, 90787,
  90797, 90912, 90847, 91066, 90589, 89225, 91124, 91125, 90913, 86065,
  86498, 90876, 85604, 86671,
]
const wiki = 'https://mapleclassic.wiki'
const priceSubset = ['Red Potion', 'Blue Potion', 'Orange Potion', 'White Potion']
const selectedFields = {
  sell_price: 'NPC resale (mesos/item)', recovery_hp: 'HP restored',
  recovery_mp: 'MP restored', max_stack: 'Maximum stack', slots: 'Upgrade slots',
  stat_speed: 'Speed bonus', stat_weapon_attack: 'Weapon attack bonus',
  required_level: 'Required level', exp_reward: 'EXP reward', meso_reward: 'Mesos reward',
}
const sourcePage = name => wiki + '/wiki/' + encodeURIComponent(name.replaceAll(' ', '_'))
const normalizeUrl = url => decodeURIComponent(url).replaceAll(' ', '_')

function fields(block) {
  return Object.fromEntries([...block.matchAll(/(?:^|\|)\s*(\w+)\s*=\s*([^|\n{}]+)/g)]
    .map(([, key, value]) => [key, value.trim()]))
}

function number(value) {
  if (!/^\d+$/.test(value)) throw new Error('Invalid numeric wiki claim: ' + value)
  return Number(value)
}

function extract(page, fetched) {
  const revision = page.revisions[0]
  const text = revision.slots.main.content
  const box = /^\{\{Infobox (\w+)\s*\n([\s\S]*?)^\}\}/im.exec(text)
  if (!box) throw new Error('Missing infobox: ' + page.title)
  const attrs = fields(box[2])
  const title = page.title
  const base = {
    title, kind: ['throwable','equipment','weapon','armor'].includes(box[1].toLowerCase()) ? 'item' : box[1].toLowerCase(), gameId: attrs.id, category: attrs.subcategory,
    source: sourcePage(title), upstream: wiki + '/wiki/Special:PermanentLink/' + revision.revid,
    version: attrs.game_version, updated: revision.timestamp, fetched, status: 'Community reference',
    facts: {}, links: [], recipes: [],
  }
  if (!base.version) throw new Error('Missing version: ' + title)
  for (const [key, label] of Object.entries(selectedFields)) {
    if (attrs[key] !== undefined) base.facts[label] = number(attrs[key])
  }
  if (base.kind === 'quest') {
    for (const [, template, body] of text.matchAll(/\{\{(Quest required item|Quest reward|Quest enemy)\|([^{}]+)\}\}/gi)) {
      const row = fields(body)
      if (row.reward_type) continue // EXP and mesos are recorded on the infobox.
      if (row.choice_group || row.chance) throw new Error('Conditional reward requires separate modeling')
      const type = {'Quest required item':'requires_item','Quest reward':'rewards','Quest enemy':'requires_kill'}[template]
      base.links.push({target:row.item_id || row.monster_id, kind:row.monster_id?'monster':'item', type,
        quantity:number(row.quantity), version:row.game_version})
    }
  }
  if (title === 'Arturo') {
    for (const [, body] of text.matchAll(/\{\{Consumable shop item\|([^{}]+)\}\}/g)) {
      const row = fields(body)
      if (priceSubset.includes(row.item_id)) base.links.push({target:row.item_id, kind:'item',
        type:'sells', price:number(row.price), unit:'mesos/item', version:row.game_version})
    }
    if (base.links.length !== priceSubset.length) throw new Error('Shop projection incomplete')
  }
  if (title === 'Woodcrafting') {
    for (const [, block] of text.matchAll(/\{\{Recipe row\n([\s\S]*?)^\}\}/gm)) {
      const row = fields(block)
      if (!['5','6'].includes(row.recipe_id)) continue
      const ingredient = /\|\s*ingredients\s*=\s*\{\{i\|([^}]+)\}\}\s*&times;\s*(\d+)\s*$/m.exec(block)
      if (!ingredient) throw new Error('Unknown ingredient expression')
      base.recipes.push({id:row.recipe_id, professionId:row.profession_id, level:number(row.level),
        cost:number(row.meso_cost), exp:number(row.craft_exp), output:row.output_item, count:number(row.output_count),
        material:ingredient[1], quantity:number(ingredient[2]), version:row.game_version})
    }
    if (base.recipes.length !== 2) throw new Error('Missing pinned recipes')
  }
  if (title === 'Red Ribbon') {
    for (const pet of ['Brown Kitty','Brown Puppy']) {
      if (!attrs.description_en?.split(': ')[1]?.split(', ').includes(pet)) throw new Error('Pet compatibility claim missing')
      base.links.push({target:pet,kind:'item',type:'equippable_by',version:base.version})
    }
  }
  const success = text.match(/Success rate:\s*(\d+)%/)
  if (success && base.category === 'Scroll') base.facts['Scroll success (%)'] = number(success[1])
  if (title === 'Gloves Attack Scroll: Intermediate' && /Improves Weapon Attack on gloves\./.test(text)) {
    base.facts['Upgrade target category'] = 'Gloves'
  }
  return base
}

async function fetchSample() {
  const url = new URL('/api.php',wiki)
  url.search = new URLSearchParams({action:'query',prop:'revisions',revids:revisions.join('|'),
    rvslots:'main',rvprop:'ids|timestamp|content',format:'json',formatversion:'2'})
  const res = await fetch(url,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'MapleCompanion/1.0 (+https://github.com/studiogameslime/maplestory)'}})
  if (!res.ok) throw new Error('MapleClassic Wiki returned ' + res.status)
  const data = await res.json()
  const pages = data.query?.pages ?? []
  if (pages.length !== revisions.length || !pages.every(p=>revisions.includes(p.revisions?.[0]?.revid))) throw new Error('Revision set incomplete')
  const fetched = new Date().toISOString()
  return pages.map(page=>extract(page,fetched)).sort((a,b)=>a.title.localeCompare(b.title,'en'))
}

export async function applySupplement({entities,edges}, {cacheDir,offline}) {
  const file = join(cacheDir,'supplement.json')
  const pages = offline ? JSON.parse(await readFile(file,'utf8')) : await fetchSample()
  function match(kind,title) {
    const url = normalizeUrl(sourcePage(title))
    return entities.find(e=>e.kind === kind && normalizeUrl(e.source) === url)
  }
  function id(kind,title) {
    const row = match(kind,title)
    if (!row) throw new Error('No exact source-page match: '+kind+' / '+title)
    return row.id
  }
  const evidence = (p,version=p.version) => ({source:p.source,upstream:p.upstream,
    version:'Classic World '+version, updated:p.updated, fetched:p.fetched, status:p.status})
  for (const page of pages) {
    if (page.title === 'Woodcrafting') continue // Individual recipe assertions below.
    let row = match(page.kind,page.title)
    if (!row) {
      if (page.kind !== 'item' || !page.gameId) throw new Error('Unresolved wiki page '+page.title)
      row = {id:'item:wiki-'+page.gameId,kind:'item',name:page.title,category:page.category,...evidence(page)}
      entities.push(row)
    }
    if (!page.gameId || (row.gameId && row.gameId !== page.gameId)) throw new Error('Conflicting or missing game ID '+page.title)
    row.gameId = page.gameId
    row.facts ??= []
    for (const [name,value] of Object.entries({'Game ID':page.gameId,...page.facts})) row.facts.push({name,value,...evidence(page)})
  }
  for (const page of pages) {
    for (const {target,kind,version,...claim} of page.links) edges.push({
      from:id(claim.type === 'sells' ? 'shop' : page.kind,page.title),to:id(kind,target),...claim,...evidence(page,version)})
    for (const r of page.recipes) {
      const ev = evidence(page,r.version), recipe = 'recipe:'+r.professionId+'-'+r.id
      entities.push({id:recipe,kind:'recipe',name:r.output+' · '+r.material,gameId:r.id,
        properties:{Profession:page.title,'Profession ID':r.professionId,'Crafting level':r.level,
          'Meso cost':r.cost,'Crafting EXP':r.exp},...ev})
      edges.push({from:recipe,to:id('item',r.material),type:'material',quantity:r.quantity,...ev},
        {from:recipe,to:id('item',r.output),type:'produces',quantity:r.count,...ev})
    }
  }
  for (const scroll of pages.filter(p=>p.facts['Upgrade target category'])) {
    for (const equip of pages.filter(p=>p.kind==='item' && p.category===scroll.facts['Upgrade target category'] && p.version===scroll.version)) {
      edges.push({from:id('item',scroll.title),to:id('item',equip.title),type:'upgrades',...evidence(scroll),
        targetSource:equip.upstream,status:'Matched equipment category'})
    }
  }
  if (!offline) {
    const temp=file+'.'+process.pid+'.tmp'
    await writeFile(temp,JSON.stringify(pages,null,2)+'\n')
    await rename(temp,file)
  }
}
