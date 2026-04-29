'use client'

import { useState } from 'react'
import { useStore, type PlannedMeal } from '@/lib/store'
import { sumMacros, MEAL_LABELS, type FoodEntry } from '@/lib/nutrition'
import { ChevronLeft, ChevronRight, Send, CheckCircle, Trash2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
const MEAL_LABELS_SHORT: Record<string, string> = { breakfast:'🌅 Frühstück', lunch:'☀️ Mittag', snack:'🍎 Snack', dinner:'🌙 Abendessen' }
const MEAL_ORDER: FoodEntry['mealType'][] = ['breakfast','lunch','snack','dinner']

function toKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
function getDaysInMonth(y: number, m: number) { return new Date(y, m+1, 0).getDate() }
function getFirstDay(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d-1 }

export function CalendarView({ onVoice }: { onVoice?: () => void }) {
  const { logs, plan, profile, healthProfile, apiKey, guestCode, isGuest,
    removeEntry, addPlannedMeal, removePlannedMeal, setPlannedNote, confirmPlannedMeal } = useStore()

  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(toKey(today))
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDay(year, month)
  const todayKey = toKey(today)
  const isFuture = selectedDate > todayKey
  const isPast = selectedDate <= todayKey
  const isToday = selectedDate === todayKey

  const selectedLog = logs[selectedDate] ?? { date: selectedDate, entries: [], plannedMeals: [] }
  const totals = sumMacros(selectedLog.entries)
  const targetCal = plan?.targetCalories ?? 2000
  const grouped: Record<string, FoodEntry[]> = {}
  selectedLog.entries.forEach(e => {
    if (!grouped[e.mealType]) grouped[e.mealType] = []
    grouped[e.mealType].push(e)
  })

  // AI plan for future day
  async function planWithAI() {
    if (!aiInput.trim()) return
    setAiLoading(true)
    try {
      const userProfile = profile ? {
        goal: profile.goal,
        weightKg: profile.weightKg,
        targetCalories: plan?.targetCalories,
        protein: plan?.protein,
        carbs: plan?.carbs,
        fat: plan?.fat,
      } : {}

      const message = `Plane für ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}: ${aiInput}`

      const res = await fetch('/api/plan-meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          userProfile,
          healthProfile,
          apiKey: isGuest ? undefined : apiKey,
          guestCode: isGuest ? guestCode : undefined,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Import the first day's meals as planned meals
      const day = data.days?.[0]
      if (!day?.meals) throw new Error('Keine Mahlzeiten erhalten')

      let count = 0
      for (const meal of day.meals) {
        for (const item of meal.items ?? []) {
          addPlannedMeal(selectedDate, {
            id: crypto.randomUUID(),
            mealType: meal.mealType as FoodEntry['mealType'],
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
      setAiInput('')
      toast.success(`${count} Mahlzeiten geplant ✅`)
    } catch (e: any) {
      toast.error(e.message ?? 'Fehler')
    } finally {
      setAiLoading(false)
    }
  }

  const plannedMeals = selectedLog.plannedMeals ?? []
  const groupedPlanned: Record<string, PlannedMeal[]> = {}
  plannedMeals.forEach(m => {
    if (!groupedPlanned[m.mealType]) groupedPlanned[m.mealType] = []
    groupedPlanned[m.mealType].push(m)
  })

  return (
    <div className="px-4 pt-8 pb-4 space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Kalender</h1>
        <p className="text-zinc-400 text-sm">Vergangenes ansehen · Zukunft mit KI planen</p>
      </div>

      {/* Month nav */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <button onClick={() => setViewDate(new Date(year, month-1, 1))} className="p-1 text-zinc-400 hover:text-white"><ChevronLeft size={20}/></button>
          <span className="text-white font-semibold">{MONTHS[month]} {year}</span>
          <button onClick={() => setViewDate(new Date(year, month+1, 1))} className="p-1 text-zinc-400 hover:text-white"><ChevronRight size={20}/></button>
        </div>
        <div className="grid grid-cols-7 px-2 pt-2">
          {DAYS.map(d => <div key={d} className="text-center text-xs text-zinc-500 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 px-2 pb-3 gap-y-1">
          {Array.from({length: firstDay}).map((_,i) => <div key={`e${i}`}/>)}
          {Array.from({length: daysInMonth}).map((_,i) => {
            const day = i+1
            const dk = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
            const log = logs[dk]
            const hasMeals = log?.entries?.length > 0
            const hasPlanned = (log?.plannedMeals?.length ?? 0) > 0
            const pct = hasMeals ? Math.min(sumMacros(log.entries).calories / targetCal, 1) : 0
            const isSel = dk === selectedDate
            const isTod = dk === todayKey
            const isFut = dk > todayKey
            return (
              <button key={day} onClick={() => setSelectedDate(dk)}
                className={`flex flex-col items-center py-1.5 rounded-xl transition-all ${isSel ? 'bg-brand-500 text-white' : isTod ? 'bg-zinc-800 text-brand-400' : 'text-zinc-300 hover:bg-zinc-800'}`}>
                <span className="text-sm font-semibold">{day}</span>
                {hasMeals && !isSel && <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{backgroundColor: pct > 0.9 ? '#22c55e' : pct > 0.5 ? '#f59e0b' : '#3b82f6'}}/>}
                {hasPlanned && !hasMeals && !isSel && <div className="w-1.5 h-1.5 rounded-full mt-0.5 bg-purple-400"/>}
                {isFut && !hasPlanned && !isSel && <div className="w-1.5 h-1.5 rounded-full mt-0.5 bg-transparent"/>}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-3 px-4 pb-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500 inline-block"/>Ziel erreicht</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/>Halb</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block"/>Geplant</span>
        </div>
      </div>

      {/* Selected Day */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">
              {new Date(selectedDate+'T12:00:00').toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'})}
              {isToday && <span className="ml-2 text-xs text-brand-400">Heute</span>}
              {isFuture && <span className="ml-2 text-xs text-purple-400">Zukunft</span>}
            </p>
            {selectedLog.entries.length > 0 && (
              <p className="text-zinc-400 text-sm">{Math.round(totals.calories)} / {targetCal} kcal</p>
            )}
          </div>
          {isToday && onVoice && (
            <button onClick={onVoice} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white rounded-lg text-sm font-semibold">
              <Plus size={14}/> Eintragen
            </button>
          )}
        </div>

        {/* FUTURE: AI Planning */}
        {isFuture && (
          <div className="p-4 space-y-4">
            {/* AI input */}
            <div>
              <p className="text-zinc-400 text-sm mb-2">🤖 Sag der KI was du essen möchtest:</p>
              <div className="flex gap-2">
                <input
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && planWithAI()}
                  placeholder="z.B. Hähnchen zum Mittag, leichtes Frühstück, viel Protein..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand-500 transition-colors placeholder:text-zinc-600"
                />
                <button onClick={planWithAI} disabled={!aiInput.trim() || aiLoading}
                  className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center disabled:opacity-40 hover:bg-brand-400 transition-all active:scale-95">
                  {aiLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Send size={18} className="text-white"/>}
                </button>
              </div>
            </div>

            {/* Planned meals from AI */}
            {plannedMeals.length > 0 && (
              <div className="space-y-2">
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Geplante Mahlzeiten</p>
                {MEAL_ORDER.map(mealType => {
                  const items = groupedPlanned[mealType]
                  if (!items?.length) return null
                  return (
                    <div key={mealType} className="bg-zinc-800 rounded-xl overflow-hidden">
                      <div className="px-3 py-2 border-b border-zinc-700 text-sm font-semibold text-zinc-300">
                        {MEAL_LABELS_SHORT[mealType]}
                      </div>
                      {items.map(m => (
                        <div key={m.id} className="flex items-center justify-between px-3 py-2 group">
                          <div>
                            <p className="text-white text-sm">{m.name}</p>
                            <p className="text-zinc-500 text-xs">{m.amount}{m.unit} · {m.calories} kcal · P:{m.protein}g K:{m.carbs}g F:{m.fat}g</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => confirmPlannedMeal(selectedDate, m.id)}
                              title="Als gegessen markieren"
                              className="opacity-0 group-hover:opacity-100 text-brand-400 hover:text-brand-300 transition-all">
                              <CheckCircle size={16}/>
                            </button>
                            <button onClick={() => removePlannedMeal(selectedDate, m.id)}
                              className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all">
                              <Trash2 size={14}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
                <p className="text-zinc-600 text-xs">✅ = Als gegessen markieren · 🗑 = Löschen</p>
              </div>
            )}

            {/* Free text note */}
            <div>
              <p className="text-zinc-500 text-xs mb-1">Oder einfach Notiz:</p>
              <textarea
                value={selectedLog.plannedNote ?? ''}
                onChange={e => setPlannedNote(selectedDate, e.target.value)}
                placeholder="Freestyle notizen für den Tag..."
                rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-brand-500 resize-none placeholder:text-zinc-600"
              />
            </div>
          </div>
        )}

        {/* PAST / TODAY: Logged meals */}
        {isPast && (
          <div>
            {selectedLog.entries.length === 0 && plannedMeals.length === 0 ? (
              <div className="px-4 py-8 text-center text-zinc-600 text-sm">
                {isToday ? 'Noch nichts eingetragen.' : 'Keine Einträge für diesen Tag.'}
              </div>
            ) : (
              <>
                {/* Macros summary */}
                {selectedLog.entries.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-zinc-800">
                    {[
                      {label:'Kalorien', value: Math.round(totals.calories), unit:'kcal', color:'text-white'},
                      {label:'Protein', value: Math.round(totals.protein), unit:'g', color:'text-brand-400'},
                      {label:'Kohlenhydrate', value: Math.round(totals.carbs), unit:'g', color:'text-blue-400'},
                      {label:'Fett', value: Math.round(totals.fat), unit:'g', color:'text-amber-400'},
                    ].map(m => (
                      <div key={m.label} className="text-center">
                        <p className={`font-bold ${m.color}`}>{m.value}<span className="text-xs font-normal text-zinc-500">{m.unit}</span></p>
                        <p className="text-xs text-zinc-500">{m.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Logged meals */}
                {MEAL_ORDER.map(meal => {
                  const entries = grouped[meal]
                  if (!entries?.length) return null
                  const mealTotal = sumMacros(entries)
                  return (
                    <div key={meal} className="px-4 py-3 border-b border-zinc-800 last:border-0">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-zinc-300">{MEAL_LABELS[meal]}</span>
                        <span className="text-xs text-zinc-500">{Math.round(mealTotal.calories)} kcal</span>
                      </div>
                      {entries.map(e => (
                        <div key={e.id} className="flex items-center justify-between py-1 group">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-300 text-sm">{e.name}</span>
                            <span className="text-zinc-600 text-xs">{e.amount}{e.unit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400 text-sm">{e.calories} kcal</span>
                            {isToday && (
                              <button onClick={() => removeEntry(selectedDate, e.id)}
                                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all">
                                <Trash2 size={13}/>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}

                {/* Planned meals for today (not yet confirmed) */}
                {plannedMeals.length > 0 && (
                  <div className="px-4 py-3">
                    <p className="text-purple-400 text-xs font-semibold mb-2">📋 Geplant (noch nicht gegessen)</p>
                    {plannedMeals.map(m => (
                      <div key={m.id} className="flex items-center justify-between py-1 group">
                        <div>
                          <span className="text-zinc-400 text-sm">{m.name}</span>
                          <span className="text-zinc-600 text-xs ml-2">{m.calories} kcal</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => confirmPlannedMeal(selectedDate, m.id)} className="text-brand-400 hover:text-brand-300 text-xs">✅ Gegessen</button>
                          <button onClick={() => removePlannedMeal(selectedDate, m.id)} className="text-zinc-600 hover:text-red-400"><Trash2 size={12}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
