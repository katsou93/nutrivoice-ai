'use client'

import { useStore } from '@/lib/store'
import { sumMacros, MEAL_LABELS, type FoodEntry } from '@/lib/nutrition'
import { Mic, Droplets, Plus, Trash2, TrendingUp, AlertCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface DashboardProps {
  onVoice: () => void
}

function CalorieRing({ current, target }: { current: number; target: number }) {
  const pct = Math.min(current / target, 1)
  const r = 72
  const circ = 2 * Math.PI * r
  const dash = pct * circ

  const color = pct > 1 ? '#ef4444' : pct > 0.85 ? '#f59e0b' : '#22c55e'

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#27272a" strokeWidth="12" />
        <circle
          cx="80" cy="80" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold text-white">{Math.round(current)}</span>
        <span className="text-xs text-zinc-400">von {target} kcal</span>
        <span className={`text-xs font-semibold mt-1 ${pct > 1 ? 'text-red-400' : 'text-brand-400'}`}>
          {pct > 1 ? `+${Math.round(current - target)} kcal` : `${Math.round(target - current)} übrig`}
        </span>
      </div>
    </div>
  )
}

function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const pct = Math.min((current / target) * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{label}</span>
        <span className="text-white font-medium">{Math.round(current)}g / {target}g</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function EntryItem({ entry, onDelete }: { entry: FoodEntry; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-zinc-800/50 last:border-0 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium truncate">{entry.name}</span>
          {entry.confidence === 'estimated' && (
            <span className="text-xs text-yellow-500 shrink-0">⚠️</span>
          )}
          {entry.confidence === 'verified' && (
            <span className="text-xs text-brand-400 shrink-0">✅</span>
          )}
        </div>
        <span className="text-zinc-500 text-xs">{entry.amount}{entry.unit} • P: {entry.protein}g K: {entry.carbs}g F: {entry.fat}g</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-white font-semibold text-sm">{entry.calories} kcal</span>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all p-1"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export function Dashboard({ onVoice }: DashboardProps) {
  const plan = useStore(s => s.plan)
  const addPoints = useStore(s => s.addPoints)
  const avatarType = useStore(s => s.avatarType)
  const points = useStore(s => s.points)
  const todayLog = useStore(s => s.todayLog)
  const removeEntry = useStore(s => s.removeEntry)
  const logWater = useStore(s => s.logWater)
  const today = useStore(s => s.today)

  const log = todayLog()
  const [showWrapped, setShowWrapped] = useState(false)
  const burnedToday = useStore(s => s.getTotalBurnedToday)()
  const adjustedTarget = (plan?.targetCalories ?? 2000) + burnedToday
  const totals = sumMacros(log.entries)
  const date = today()
  const water = log.water ?? 0

  if (!plan) return null

  // Group entries by meal type
  const grouped: Record<string, FoodEntry[]> = {}
  log.entries.forEach(e => {
    if (!grouped[e.mealType]) grouped[e.mealType] = []
    grouped[e.mealType].push(e)
  })

  const mealOrder: FoodEntry['mealType'][] = ['breakfast', 'lunch', 'snack', 'dinner']

  // AI tip
  const remainingCals = plan.targetCalories - totals.calories
  const tip = remainingCals > 500
    ? `Du hast noch ${Math.round(remainingCals)} kcal übrig. Zeit für eine Mahlzeit! 🍽️`
    : remainingCals > 0
    ? `Fast am Ziel! Noch ${Math.round(remainingCals)} kcal.`
    : `Tagesziel erreicht! +${Math.round(-remainingCals)} kcal Überschuss.`

  return (
    <div className="px-4 pt-8 pb-4 space-y-6">
      {showWrapped && <MonthlyWrapped onClose={() => setShowWrapped(false)} />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-500 text-sm">{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="text-2xl font-display font-bold text-white">Heute</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowWrapped(true)}
            className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all" title="Monatsrückblick">
            <Sparkles size={16} className="text-brand-400" />
          </button>
          <button onClick={onVoice}
            className="relative w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30 hover:bg-brand-400 transition-all active:scale-95">
            <Mic size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Points mini banner */}
      {avatarType && (
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
          <span className="text-zinc-400 text-sm">⭐ {points} Punkte</span>
          <span className="text-brand-400 text-sm font-semibold">🔥 Tracke heute für +50 Punkte</span>
        </div>
      )}

      {/* Calorie Ring */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <CalorieRing current={totals.calories} target={adjustedTarget} />

        <div className="grid grid-cols-3 gap-3 mt-5">
          <MacroBar label="Protein" current={totals.protein} target={plan.protein} color="#22c55e" />
          <MacroBar label="Kohlenhydrate" current={totals.carbs} target={plan.carbs} color="#3b82f6" />
          <MacroBar label="Fett" current={totals.fat} target={plan.fat} color="#f59e0b" />
        </div>
      </div>

      {/* Sport Bonus */}
      {burnedToday > 0 && (
        <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
          <span className="text-xl">🔥</span>
          <div>
            <p className="text-orange-400 text-sm font-semibold">{burnedToday} kcal durch Sport verbrannt</p>
            <p className="text-zinc-500 text-xs">Neues Ziel: {adjustedTarget} kcal (Basis + Sport)</p>
          </div>
        </div>
      )}

      {/* Points mini banner */}
      {avatarType && (
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
          <span className="text-zinc-400 text-sm">⭐ {points} Punkte</span>
          <span className="text-brand-400 text-xs font-semibold">Tracke für mehr Punkte →</span>
        </div>
      )}

      {/* AI Tip */}
      <div className="flex items-start gap-3 bg-brand-500/10 border border-brand-500/20 rounded-xl p-4">
        <TrendingUp size={16} className="text-brand-400 shrink-0 mt-0.5" />
        <p className="text-sm text-zinc-300">{tip}</p>
      </div>

      {/* Water */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Droplets size={16} />
            <span className="text-sm font-semibold">Wasser</span>
          </div>
          <span className="text-white font-bold">{water} / 8 Gläser</span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const newVal = i < water ? i : i + 1
                logWater(date, newVal)
              }}
              className={`flex-1 h-8 rounded-lg transition-all ${i < water ? 'bg-blue-500' : 'bg-zinc-800 hover:bg-zinc-700'}`}
            />
          ))}
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-3">
        <h2 className="text-white font-display font-bold text-lg">Mahlzeiten</h2>

        {log.entries.length === 0 && (
          <div className="text-center py-10 text-zinc-600">
            <AlertCircle size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Noch nichts eingetragen.</p>
            <p className="text-xs mt-1">Tippe auf 🎙️ und sag was du gegessen hast!</p>
          </div>
        )}

        {mealOrder.map(meal => {
          const entries = grouped[meal]
          if (!entries?.length) return null
          const mealTotal = sumMacros(entries)
          return (
            <div key={meal} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <span className="font-semibold text-white">{MEAL_LABELS[meal]}</span>
                <span className="text-zinc-400 text-sm font-medium">{Math.round(mealTotal.calories)} kcal</span>
              </div>
              <div className="px-4">
                {entries.map(e => (
                  <EntryItem
                    key={e.id}
                    entry={e}
                    onDelete={() => {
                      removeEntry(date, e.id)
                      toast.success(`${e.name} entfernt`)
                    }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
