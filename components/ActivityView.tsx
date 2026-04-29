'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { SPORTS, calculateCaloriesBurned, type ActivityEntry } from '@/lib/nutrition'
import { Flame, Trash2, Clock, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { toast } from 'sonner'

function localDateKey(d?: Date): string {
  const date = d ?? new Date()
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

const WEEK_DAYS = 7

export function ActivityView() {
  const { profile, plan, activities, addActivity, removeActivity } = useStore()
  const weightKg = profile?.weightKg ?? 75

  const [selectedSport, setSelectedSport] = useState(SPORTS[0])
  const [customSport, setCustomSport] = useState('')
  const [duration, setDuration] = useState(30)
  const [customMet, setCustomMet] = useState(5.0)
  const [notes, setNotes] = useState('')
  const [showSportPicker, setShowSportPicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(localDateKey())

  const isCustom = selectedSport.name === 'Anderes'
  const activeMet = isCustom ? customMet : selectedSport.met
  const preview = calculateCaloriesBurned(activeMet, duration, weightKg)
  const activeName = isCustom ? (customSport || 'Anderes') : selectedSport.name

  function logActivity() {
    if (duration <= 0) return
    const entry: ActivityEntry = {
      id: crypto.randomUUID(),
      sport: activeName,
      durationMinutes: duration,
      intensityMet: activeMet,
      caloriesBurned: preview,
      timestamp: new Date().toISOString(),
      date: selectedDate,
      notes: notes.trim() || undefined,
    }
    addActivity(selectedDate, entry)
    toast.success(`${activeName} (${duration} Min, ${preview} kcal) eingetragen ✅`)
    setNotes('')
  }

  // Weekly summary
  const today = new Date()
  const weekData = Array.from({ length: WEEK_DAYS }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (WEEK_DAYS - 1 - i))
    const key = localDateKey(d)
    const acts = activities[key] ?? []
    const burned = acts.reduce((s, a) => s + a.caloriesBurned, 0)
    return { key, day: d.toLocaleDateString('de-DE', { weekday: 'short' }), burned, acts, isToday: key === localDateKey() }
  })
  const totalWeekBurned = weekData.reduce((s, d) => s + d.burned, 0)
  const avgPerDay = Math.round(totalWeekBurned / WEEK_DAYS)
  const maxBurned = Math.max(...weekData.map(d => d.burned), 1)

  // Today's activities
  const todayActs = activities[localDateKey()] ?? []
  const todayBurned = todayActs.reduce((s, a) => s + a.caloriesBurned, 0)
  const netCalories = (plan?.targetCalories ?? 2000) + todayBurned

  return (
    <div className="px-4 pt-8 pb-4 space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Flame size={22} className="text-orange-400" /> Aktivitäten
        </h1>
        <p className="text-zinc-400 text-sm">Sport einloggen · Kalorienverbrauch berechnen</p>
      </div>

      {/* Today summary */}
      {todayBurned > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-orange-400 font-bold text-lg">🔥 {todayBurned} kcal verbrannt</p>
              <p className="text-zinc-400 text-sm">Neues Kalorienziel heute: <span className="text-white font-semibold">{netCalories} kcal</span></p>
            </div>
            <div className="text-right">
              <p className="text-zinc-500 text-xs">Basis + Sport</p>
              <p className="text-zinc-300 text-sm">{plan?.targetCalories ?? 2000} + {todayBurned}</p>
            </div>
          </div>
        </div>
      )}

      {/* Weekly chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-semibold">Diese Woche</h2>
          <div className="text-right">
            <p className="text-orange-400 font-bold">{totalWeekBurned} kcal</p>
            <p className="text-zinc-500 text-xs">Ø {avgPerDay} kcal/Tag</p>
          </div>
        </div>
        <div className="flex items-end gap-1.5 h-20">
          {weekData.map(d => (
            <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-md transition-all" style={{
                height: `${Math.max((d.burned / maxBurned) * 64, d.burned > 0 ? 4 : 0)}px`,
                backgroundColor: d.isToday ? '#f97316' : d.burned > 0 ? '#fb923c80' : '#27272a',
                minHeight: d.burned > 0 ? '4px' : '0',
              }}/>
              <span className={`text-xs ${d.isToday ? 'text-orange-400 font-bold' : 'text-zinc-500'}`}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Log Activity */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <h2 className="text-white font-semibold">Aktivität eintragen</h2>

        {/* Date selector */}
        <div>
          <label className="text-zinc-400 text-xs mb-1 block">Datum</label>
          <input
            type="date"
            value={selectedDate}
            max={localDateKey()}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-orange-500 transition-colors w-full"
          />
        </div>

        {/* Sport picker */}
        <div>
          <label className="text-zinc-400 text-xs mb-1 block">Sportart</label>
          <button
            onClick={() => setShowSportPicker(!showSportPicker)}
            className="w-full flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm"
          >
            <span>{selectedSport.emoji} {selectedSport.name}</span>
            {showSportPicker ? <ChevronUp size={16} className="text-zinc-400"/> : <ChevronDown size={16} className="text-zinc-400"/>}
          </button>

          {showSportPicker && (
            <div className="mt-2 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
              {SPORTS.map(s => (
                <button key={s.name} onClick={() => { setSelectedSport(s); setShowSportPicker(false) }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-zinc-700 transition-colors ${selectedSport.name === s.name ? 'text-orange-400' : 'text-zinc-300'}`}>
                  <span>{s.emoji} {s.name}</span>
                  <span className="text-zinc-500 text-xs">MET {s.met}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom sport name */}
        {isCustom && (
          <div>
            <label className="text-zinc-400 text-xs mb-1 block">Sportname</label>
            <input value={customSport} onChange={e => setCustomSport(e.target.value)}
              placeholder="z.B. Krav Maga, Padel, Surfen..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-orange-500"/>
            <div className="mt-2">
              <label className="text-zinc-400 text-xs mb-1 block">Intensität (MET-Wert: 2=leicht, 6=moderat, 10=intensiv)</label>
              <input type="number" value={customMet} onChange={e => setCustomMet(Number(e.target.value))}
                min={1} max={18} step={0.5}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-orange-500"/>
            </div>
          </div>
        )}

        {/* Duration */}
        <div>
          <label className="text-zinc-400 text-xs mb-2 block flex justify-between">
            <span>Dauer</span>
            <span className="text-white font-semibold">{duration} Min</span>
          </label>
          <input type="range" value={duration} onChange={e => setDuration(Number(e.target.value))}
            min={5} max={180} step={5}
            className="w-full accent-orange-500"/>
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>5 Min</span><span>1h</span><span>3h</span>
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
          <div>
            <p className="text-orange-400 font-bold text-lg">{preview} kcal</p>
            <p className="text-zinc-500 text-xs">≈ {activeName}, {duration} Min, {weightKg}kg</p>
          </div>
          <Flame size={28} className="text-orange-400 opacity-60"/>
        </div>

        {/* Notes */}
        <input value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Notiz (optional, z.B. 5km gelaufen)"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-orange-500 placeholder:text-zinc-600"/>

        <button onClick={logActivity} disabled={duration <= 0}
          className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white font-semibold rounded-xl transition-all active:scale-95">
          <Plus size={18}/> Eintragen
        </button>
      </div>

      {/* Today's activities */}
      {todayActs.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-white font-semibold">Heute</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {todayActs.map(a => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3 group">
                <div>
                  <p className="text-white font-medium">{a.sport}</p>
                  <p className="text-zinc-500 text-sm flex items-center gap-2">
                    <Clock size={12}/> {a.durationMinutes} Min
                    {a.notes && <span>· {a.notes}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-orange-400 font-bold">🔥 {a.caloriesBurned}</span>
                  <button onClick={() => removeActivity(localDateKey(), a.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {weekData.some(d => !d.isToday && d.acts.length > 0) && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-white font-semibold">Wochenverlauf</h2>
          </div>
          {weekData.filter(d => !d.isToday && d.acts.length > 0).reverse().map(d => (
            <div key={d.key} className="px-4 py-3 border-b border-zinc-800 last:border-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-400 text-sm">{new Date(d.key+'T12:00:00').toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'short'})}</span>
                <span className="text-orange-400 text-sm font-semibold">🔥 {d.burned} kcal</span>
              </div>
              {d.acts.map(a => (
                <div key={a.id} className="flex justify-between text-xs text-zinc-500 py-0.5">
                  <span>{a.sport} · {a.durationMinutes} Min</span>
                  <span>{a.caloriesBurned} kcal</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
