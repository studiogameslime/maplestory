const label = (en: string, he: string) => ({ en, he })
// Hand-authored scenarios. None of these figures are imported game data.
export const drops = [
  {
    id: 'moss',
    monster: label('Moss Slime', 'ריר ירקרק'),
    level: 12,
    map: label('Fern Hollow', 'עמק השרכים'),
    item: label('Mana Elixir', 'שיקוי מאנה'),
    art: 'potion',
    chance: 2.5,
  },
  {
    id: 'fox',
    monster: label('Ember Fox', 'שועל גחלים'),
    level: 32,
    map: label('Copperwood Trail', 'שביל הנחושת'),
    item: label('Work Gloves', 'כפפות עבודה'),
    art: 'glove',
    chance: 0.3,
  },
  {
    id: 'owl',
    monster: label('Moon Owl', 'ינשוף ירח'),
    level: 38,
    map: label('Lantern Grove', 'חורשת הפנסים'),
    item: label('Scroll for DEX', 'מגילת זריזות'),
    art: 'scroll',
    chance: null,
  },
  {
    id: 'sprite',
    monster: label('Frost Sprite', 'פיית כפור'),
    level: 45,
    map: label('Frostfall Ridge', 'רכס הכפור'),
    item: label('Icicle Throwing-Stars', 'כוכבי זריקה קרחוניים'),
    art: 'stars',
    chance: 0.15,
  },
]
export const quests = [
  {
    id: 'lamps',
    title: label('Lanterns for the crossing', 'פנסים למעבר'),
    level: 15,
    prereq: label('Speak to the ferryman', 'דברו עם מפעיל המעבורת'),
    reward: label('5 Mana Elixirs', '5 שיקויי מאנה'),
    xp: 800,
    qty: 5,
    unit: 300,
  },
  {
    id: 'forge',
    title: label('A favor for the smith', 'טובה לנפח'),
    level: 30,
    prereq: label(
      'Complete Lanterns for the crossing',
      'השלימו את פנסים למעבר',
    ),
    reward: label('1 pair of Work Gloves', 'זוג כפפות עבודה'),
    xp: 2500,
    qty: 1,
    unit: 240000,
  },
  {
    id: 'archive',
    title: label('The lost field notes', 'רשימות השטח האבודות'),
    level: 40,
    prereq: label(
      'Bring the archivist three field notes',
      'הביאו לארכיונאי שלוש רשימות שטח',
    ),
    reward: label('1 Scroll for DEX', 'מגילת זריזות אחת'),
    xp: 4200,
    qty: 1,
    unit: 89000,
  },
]
