'use client'

import { useState } from 'react'
import { useStore, type PlannedMeal } from '@/lib/store'
import { Send, Download, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

interface MealItem {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  amount: number
  unit: string
}

interface DayPlan {
  date: string
  label: string
  meals: { mealType: string; items: MealItem[]; totalCalories: number }[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

interface MealPlan {
  title: string
  description: string
  days: DayPlan[]
}

const QUICK_PROMPTS = [
  'Erstelle mir einen Wochenplan zum Zunehmen mit viel Protein',
  'Plane 3 Tage mit wenig Kohlenhydraten',
  'Gesunder Tagesplan für morgen',
  'Schnelle Mahlzeiten für die ganze Woche unter 30 Minuten Prep',
  'Vegetarischer Plan für 5 Tage',
  'Hochkalorischer Aufbauplan für diese Woche',
]

export function InspirationView() {
  const { profile, plan, healthProfile, apiKey, guestCode, isGuest, addPlannedMeal } = useStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MealPlan | null>(null)
  const [expandedDay, setExpandedDay] = useState<number>(0)
  const [importing, setImporting] = useState<Record<string, boolean>>({})

  async function generate(prompt: string) {
    if (!prompt.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const userProfile = profile ? {
        goal: profile.goal, weightKg: profile.weightKg,
        targetCalories: plan?.targetCalories,
        protein: plan?.protein, carbs: plan?.carbs, fat: plan?.fat,
      } : {}

      const res = await fetch('/api/plan-meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          userProfile,
          healthProfile,
          apiKey: isGuest ? undefined : apiKey,
          guestCode: isGuest ? guestCode : undefined,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      setExpandedDay(0)
    } catch (e: any) {
      toast.error(e.message ?? 'Fehler beim Generieren')
    } finally {
      setLoading(false)
    }
  }

  // Import a specific day's meals into the calendar
  function importDay(day: DayPlan, dateOverride?: string) {
    const today = new Date()

    // Determine target date
    let targetDate: string
    if (dateOverride) {
      targetDate = dateOverride
    } else if (day.date && day.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      targetDate = day.date
    } else {
      // 'morgen', 'Tag 1' etc → map to actual dates
      const offset = result?.days.indexOf(day) ?? 0
      const d = new Date(today)
      d.setDate(d.getDate() + 1 + offset) // start from tomorrow
      targetDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    }

    setImporting(prev => ({ ...prev, [day.label]: true }))
    let count = 0
    for (const meal of day.meals) {
      for (const item of meal.items) {
        addPlannedMeal(targetDate, {
          id: crypto.randomUUID(),
          mealType: meal.mealType as any,
          name: item.name,
          calories: item.calories ?? 0,
          protein: item.protein ?? 0,
          carbs: item.carbs ?? 0,
          fat: item.fat ?? 0,
          amount: item.amount ?? 100,
          unit: item.unit ?? 'g',
        })
        count++
      }
    }
    toast.success(`${count} Mahlzeiten in Kalender (${new Date(targetDate+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short'})}) importiert ✅`)
    setImporting(prev => ({ ...prev, [day.label]: false }))
  }

  function importAll() {
    if (!result) return
    result.days.forEach(day => importDay(day))
    toast.success(`Kompletter Plan (${result.days.length} Tage) importiert! 📅`)
  }

  const MEAL_LABELS: Record<string, string> = {
    breakfast:'🌅 Frühstück', lunch:'☀️ Mittag', snack:'🍎 Snack', dinner:'🌙 Abendessen'
  }

  return (
    <div className="px-4 pt-8 pb-4 space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Sparkles size={22} className="text-brand-400" /> Inspiration
        </h1>
        <p className="text-zinc-400 text-sm">KI erstellt Mahlzeitenpläne – direkt in Kalender importieren</p>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate(input)}
            placeholder="Was soll die KI planen?"
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand-500 transition-colors placeholder:text-zinc-600"
          />
          <button onClick={() => generate(input)} disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center disabled:opacity-40 hover:bg-brand-400 transition-all active:scale-95">
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <Send size={18} className="text-white"/>
            }
          </button>
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => { setInput(p); generate(p) }}
              className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-brand-500 hover:text-brand-400 transition-colors text-left">
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-zinc-400 text-sm">KI erstellt deinen Plan...</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-white font-display font-bold text-lg">{result.title}</h2>
                <p className="text-zinc-400 text-sm mt-1">{result.description}</p>
              </div>
              {result.days.length > 1 && (
                <button onClick={importAll}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-sm font-semibold transition-all active:scale-95">
                  <Download size={14}/> Alle
                </button>
              )}
            </div>
          </div>

          {/* Days */}
          {result.days.map((day, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              {/* Day header */}
              <button
                onClick={() => setExpandedDay(expandedDay === idx ? -1 : idx)}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="text-left">
                  <p className="text-white font-semibold">{day.label || day.date}</p>
                  <p className="text-zinc-400 text-sm">
                    {day.totalCalories} kcal · P:{day.totalProtein}g · K:{day.totalCarbs}g · F:{day.totalFat}g
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); importDay(day) }}
                    disabled={importing[day.label]}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-xs font-semibold transition-all"
                  >
                    <Download size={12}/> Import
                  </button>
                  {expandedDay === idx ? <ChevronUp size={16} className="text-zinc-500"/> : <ChevronDown size={16} className="text-zinc-500"/>}
                </div>
              </button>

              {/* Day meals expanded */}
              {expandedDay === idx && (
                <div className="divide-y divide-zinc-800">
                  {day.meals.map((meal, mi) => (
                    <div key={mi} className="px-4 py-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-zinc-300">{MEAL_LABELS[meal.mealType] ?? meal.mealType}</span>
                        <span className="text-xs text-zinc-500">{meal.totalCalories} kcal</span>
                      </div>
                      {meal.items.map((item, ii) => (
                        <div key={ii} className="py-1">
                          <div className="flex justify-between">
                            <span className="text-zinc-300 text-sm">{item.name}</span>
                            <span className="text-zinc-500 text-sm">{item.calories} kcal</span>
                          </div>
                          <p className="text-zinc-600 text-xs">{item.amount}{item.unit} · P:{item.protein}g · K:{item.carbs}g · F:{item.fat}g</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
