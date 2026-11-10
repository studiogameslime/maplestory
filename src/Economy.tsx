import { useState, type FormEvent } from 'react'
import {
  Calculator,
  CircleDollarSign,
  Crosshair,
  FlaskConical,
  Plus,
  ScrollText,
  Trash2,
} from 'lucide-react'
import {
  huntEstimate,
  positionProfit,
  potionEfficiency,
  scrollEstimate,
} from './domain'
import { useApp } from './state'
import { Empty, Heading } from './ui'

type NumberSpec = {
  name: string
  label: string
  initial: number
  max?: number
  whole?: boolean
  min?: number
}
function Model({
  fields,
  outputs,
}: {
  fields: NumberSpec[]
  outputs: (values: Record<string, number>) => [string, string][]
}) {
  const { t } = useApp()
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, String(f.initial)])),
  )
  const numbers = Object.fromEntries(
    Object.entries(values).map(([key, v]) => [key, Number(v)]),
  )
  const valid = fields.every(
    (f) =>
      values[f.name]?.trim() &&
      Number.isFinite(numbers[f.name]) &&
      numbers[f.name] >= (f.min ?? 0) &&
      numbers[f.name] <= (f.max ?? 1e12) &&
      (!f.whole || Number.isInteger(numbers[f.name])),
  )
  return (
    <>
      <div className="model-grid">
        {fields.map((f) => (
          <label key={f.name}>
            {f.label}
            <input
              type="number"
              value={values[f.name]}
              min={f.min ?? 0}
              max={f.max ?? 1e12}
              step={f.whole ? '1' : 'any'}
              onChange={(e) =>
                setValues({ ...values, [f.name]: e.target.value })
              }
            />
          </label>
        ))}
      </div>
      <div className="results" aria-live="polite">
        {valid ? (
          outputs(numbers).map(([label, value]) => (
            <div key={label}>
              <small>{label}</small>
              <strong>{value}</strong>
            </div>
          ))
        ) : (
          <p>
            {t(
              'Enter a valid number in every field to calculate.',
              'יש להזין ערך תקין בכל שדה כדי לחשב.',
            )}
          </p>
        )}
      </div>
    </>
  )
}
export function Hunt() {
  const { t, num } = useApp()
  return (
    <>
      <Heading
        title={t('Hunt Planner', 'תכנון ציד')}
        sub={t(
          'Model an hour of training with your own assumptions.',
          'הערכת שעת אימון לפי ההנחות שלכם.',
        )}
      />
      <section className="panel padded">
        <h2>
          <Crosshair className="mint-text" />
          {t('Training assumptions', 'הנחות אימון')}
        </h2>
        <p>
          {t(
            'Starting values are examples. Use your measured kill speed and potion spend.',
            'ערכי הפתיחה להמחשה. הזינו קצב הריגות ועלות שיקויים לפי המדידה שלכם.',
          )}
        </p>
        <Model
          fields={[
            {
              name: 'kills',
              label: t('Kills per hour', 'הריגות לשעה'),
              initial: 200,
            },
            {
              name: 'xp',
              label: t('EXP per kill', 'ניסיון להריגה'),
              initial: 75,
            },
            {
              name: 'mesos',
              label: t('Mesos per kill', 'מסוס להריגה'),
              initial: 50,
            },
            {
              name: 'chance',
              label: t('Drop chance (%)', 'סיכוי לשלל (%)'),
              initial: 1,
              max: 100,
            },
            {
              name: 'value',
              label: t('Net value per drop', 'שווי נקי לפריט'),
              initial: 2000,
            },
            {
              name: 'pots',
              label: t('Potion cost per hour', 'עלות שיקויים לשעה'),
              initial: 4500,
            },
          ]}
          outputs={(v) => {
            const r = huntEstimate(
              v.kills,
              v.xp,
              v.mesos,
              v.chance,
              v.value,
              v.pots,
            )
            return [
              [t('Expected EXP / hour', 'ניסיון צפוי לשעה'), num(r.xp)],
              [
                t('Expected net mesos / hour', 'מסוס נקי צפוי לשעה'),
                num(r.mesos),
              ],
            ]
          }}
        />
      </section>
    </>
  )
}
export function Calculators() {
  const { t, num } = useApp()
  const [tab, setTab] = useState('scrolls')
  return (
    <>
      <Heading
        title={t('Calculators', 'מחשבונים')}
        sub={t(
          'Compare upgrade odds and the cost of recovery.',
          'השוואת סיכויי שדרוג ועלויות התאוששות.',
        )}
      />
      <div className="tabs">
        <button
          aria-pressed={tab === 'scrolls'}
          onClick={() => setTab('scrolls')}
        >
          <ScrollText size={15} />
          {t('Scroll upgrades', 'שדרוג מגילות')}
        </button>
        <button
          aria-pressed={tab === 'potions'}
          onClick={() => setTab('potions')}
        >
          <FlaskConical size={15} />
          {t('Consumables', 'מתכלים')}
        </button>
      </div>
      <section className="panel padded">
        <h2>
          <Calculator className="accent" />
          {tab === 'scrolls'
            ? t('Scroll expected value', 'תוחלת שווי שדרוג')
            : t('Consumable efficiency', 'יעילות מתכלים')}
        </h2>
        {tab === 'scrolls' ? (
          <>
            <p>
              {t(
                'Assumes independent attempts, a fixed value gain per success, and no destruction penalty. Adjust the example inputs.',
                'המודל מניח ניסיונות עצמאיים, תוספת שווי קבועה לכל הצלחה וללא קנס השמדה. ערכי הפתיחה להמחשה.',
              )}
            </p>
            <Model
              key="scrolls"
              fields={[
                {
                  name: 'chance',
                  label: t('Success chance (%)', 'סיכוי הצלחה (%)'),
                  initial: 60,
                  max: 100,
                },
                {
                  name: 'attempts',
                  label: t('Available attempts', 'מספר ניסיונות'),
                  initial: 5,
                  whole: true,
                  max: 1000,
                },
                {
                  name: 'gain',
                  label: t(
                    'Value gain per success · mesos',
                    'תוספת שווי להצלחה · מסוס',
                  ),
                  initial: 50000,
                },
                {
                  name: 'cost',
                  label: t('Cost per scroll · mesos', 'עלות למגילה · מסוס'),
                  initial: 20000,
                },
              ]}
              outputs={(v) => {
                const r = scrollEstimate(v.chance, v.attempts, v.gain, v.cost)
                return [
                  [
                    t('At least one success', 'לפחות הצלחה אחת'),
                    num(r.atLeastOne * 100) + '%',
                  ],
                  [
                    t('Expected net value · mesos', 'שווי נקי צפוי · מסוס'),
                    num(r.expectedNet),
                  ],
                ]
              }}
            />
          </>
        ) : (
          <>
            <p>
              {t(
                'Use the amount actually restored per use, after any overheal. Starting values are examples.',
                'הזינו את הכמות המשוחזרת בפועל לאחר ריפוי עודף. ערכי הפתיחה להמחשה.',
              )}
            </p>
            <Model
              key="potions"
              fields={[
                {
                  name: 'price',
                  label: t('Price per potion · mesos', 'מחיר לשיקוי · מסוס'),
                  initial: 300,
                },
                {
                  name: 'points',
                  label: t('HP or MP restored', 'נקודות חיים או מאנה'),
                  initial: 150,
                  min: 1,
                },
              ]}
              outputs={(v) => [
                [
                  t('Mesos per point restored', 'מסוס לנקודה ששוחזרה'),
                  num(potionEfficiency(v.price, v.points)!),
                ],
              ]}
            />
          </>
        )}
      </section>
    </>
  )
}
export function Portfolio() {
  const { t, num, positions, setPositions } = useApp()
  const [sold, setSold] = useState(false)
  function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('item') ?? '').trim()
    const [qty, cost, value] = ['qty', 'cost', 'value'].map((k) =>
      Number(data.get(k)),
    )
    if (
      !name ||
      !Number.isInteger(qty) ||
      qty <= 0 ||
      [cost, value].some((v) => !Number.isFinite(v) || v < 0)
    )
      return
    setPositions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, qty, cost, value, sold },
    ])
    form.reset()
    setSold(false)
  }
  return (
    <>
      <Heading
        title={t('Portfolio', 'תיק השקעות')}
        sub={t(
          'Record holdings and completed trades using your own prices.',
          'רישום החזקות ועסקאות שהושלמו לפי המחירים שלכם.',
        )}
      />
      <div className="results portfolio-total">
        {[false, true].map((s) => (
          <div key={String(s)}>
            <small>
              {s
                ? t('Realized profit · mesos', 'רווח ממומש · מסוס')
                : t('Unrealized profit · mesos', 'רווח לא ממומש · מסוס')}
            </small>
            <strong>
              {num(
                positions
                  .filter((p) => p.sold === s)
                  .reduce((sum, p) => sum + positionProfit(p), 0),
              )}
            </strong>
          </div>
        ))}
      </div>
      <section className="panel padded">
        <h2>
          <CircleDollarSign className="accent" />
          {t('Record a position', 'הוספת רשומה')}
        </h2>
        <form className="trade-form" onSubmit={add}>
          <label>
            {t('Item name', 'שם פריט')}
            <input required maxLength={60} name="item" pattern=".*\S.*" />
          </label>
          <label>
            {t('Quantity', 'כמות')}
            <input
              type="number"
              name="qty"
              required
              defaultValue="1"
              min="1"
              max="1000000"
            />
          </label>
          <label>
            {t('Buy price per unit', 'מחיר קנייה ליחידה')}
            <input
              name="cost"
              type="number"
              min="0"
              max="1000000000000"
              required
            />
          </label>
          <label>
            {sold
              ? t('Net sale price per unit', 'מחיר מכירה נקי ליחידה')
              : t('Estimated net value per unit', 'שווי נקי משוער ליחידה')}
            <input
              name="value"
              type="number"
              min="0"
              max="1000000000000"
              required
            />
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={sold}
              onChange={(e) => setSold(e.target.checked)}
            />
            {t('Already sold', 'כבר נמכר')}
          </label>
          <button className="primary">
            <Plus size={16} />
            {t('Add entry', 'הוספת רשומה')}
          </button>
        </form>
      </section>
      <section className="panel padded">
        <h2>{t('Inventory ledger', 'יומן מלאי')}</h2>
        {positions.length ? (
          <ul className="ledger">
            {positions.map((p) => (
              <li key={p.id}>
                <div>
                  <strong dir="auto">{p.name}</strong>
                  <small>
                    {p.sold ? t('Sold', 'נמכר') : t('Holding', 'בהחזקה')} ·{' '}
                    {p.qty} × {num(p.cost)} → {num(p.value)}
                  </small>
                </div>
                <b dir="auto">{num(positionProfit(p))}</b>
                <button
                  aria-label={t('Remove', 'הסרת') + ' ' + p.name}
                  onClick={() =>
                    setPositions((prev) =>
                      prev.filter((row) => row.id !== p.id),
                    )
                  }
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title={t('No entries yet', 'אין רשומות עדיין')}>
            {t(
              'Add a holding or sale above to start your ledger.',
              'הוסיפו החזקה או מכירה כדי לפתוח יומן מלאי.',
            )}
          </Empty>
        )}
      </section>
    </>
  )
}
