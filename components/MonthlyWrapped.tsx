'use client'

import { useStore } from '@/lib/store'
import { sumMacros } from '@/lib/nutrition'
import { useState } from 'react'
import { X, Trophy, TrendingUp, TrendingDown, Flame, Star } from 'lucide-react'

function localDateKey(d?: Date): string {
  const date = d ?? new Date()
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

export function MonthlyWrapped({ onClose }: { onClose: () => void }) {
  const { logs, activities, plan } = useStore()
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  const monthName = now.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

  // Collect all days in this month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1)
    const key = localDateKey(d)
    const log = logs[key]
    const acts = activities[key] ?? []
    const totals = log ? sumMacros(log.entries) : null
    return { key, log, totals, acts, burned: acts.reduce((s, a) => s + a.caloriesBurned, 0) }
  })

  const loggedDays = monthDays.filter(d => d.log && d.log.entries.length > 0)
  const activeDays = monthDays.filter(d => d.acts.length > 0)
  const totalCalories = loggedDays.reduce((s, d) => s + (d.totals?.calories ?? 0), 0)
  const totalProtein = loggedDays.reduce((s, d) => s + (d.totals?.protein ?? 0), 0)
  const totalBurned = monthDays.reduce((s, d) => s + d.burned, 0)
  const avgCalories = loggedDays.length ? Math.round(totalCalories / loggedDays.length) : 0
  const target = plan?.targetCalories ?? 2000

  // Top dishes
  const dishCount: Record<string, number> = {}
  loggedDays.forEach(d => d.log?.entries.forEach(e => {
    dishCount[e.name] = (dishCount[e.name] ?? 0) + 1
  }))
  const topDishes = Object.entries(dishCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Best streak
  let streak = 0, maxStreak = 0, current = 0
  monthDays.forEach(d => {
    if (d.log && d.log.entries.length > 0) {
      current++
      maxStreak = Math.max(maxStreak, current)
    } else {
      current = 0
    }
  })

  // Calorie goal days
  const onTargetDays = loggedDays.filter(d => {
    const cal = d.totals?.calories ?? 0
    return cal >= target * 0.85 && cal <= target * 1.15
  }).length

  // Top sport
  const sportCount: Record<string, number> = {}
  activeDays.forEach(d => d.acts.forEach(a => {
    sportCount[a.sport] = (sportCount[a.sport] ?? 0) + a.durationMinutes
  }))
  const topSport = Object.entries(sportCount).sort((a, b) => b[1] - a[1])[0]

  // Score / Grade
  const trackingRate = loggedDays.length / Math.min(now.getDate(), daysInMonth)
  const goalRate = loggedDays.length ? onTargetDays / loggedDays.length : 0
  const score = Math.round((trackingRate * 50 + goalRate * 50))
  const grade = score >= 80 ? '🏆 Ausgezeichnet' : score >= 60 ? '⭐ Gut' : score >= 40 ? '📈 Solide' : '💪 Weiter so'

  const [slide, setSlide] = useState(0)
  const slides = [
    // Slide 0: Overview
    <div key="overview" className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">🎊</div>
        <h2 className="text-2xl font-display font-bold text-white">{monthName}</h2>
        <p className="text-zinc-400">Dein Monatsrückblick</p>
      </div>
      <div className="text-center bg-brand-500/10 border border-brand-500/30 rounded-2xl p-6">
        <p className="text-5xl font-display font-bold text-brand-400">{score}</p>
        <p className="text-zinc-300 mt-1">{grade}</p>
        <p className="text-zinc-500 text-sm mt-2">{loggedDays.length} von {Math.min(now.getDate(), daysInMonth)} Tagen getrackt</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Ø Kalorien/Tag', value: `${avgCalories}`, unit: 'kcal', icon: '🍽️' },
          { label: 'Ziele erreicht', value: `${onTargetDays}`, unit: 'Tage', icon: '🎯' },
          { label: 'Sport-Tage', value: `${activeDays.length}`, unit: 'Tage', icon: '🏋️' },
          { label: 'Verbrannt', value: `${totalBurned.toLocaleString()}`, unit: 'kcal', icon: '🔥' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-800 rounded-xl p-3 text-center">
            <p className="text-xl">{s.icon}</p>
            <p className="text-white font-bold text-lg">{s.value} <span className="text-xs text-zinc-500 font-normal">{s.unit}</span></p>
            <p className="text-zinc-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>
    </div>,

    // Slide 1: Top dishes
    <div key="dishes" className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">🍽️</div>
        <h2 className="text-2xl font-display font-bold text-white">Lieblingsgerichte</h2>
        <p className="text-zinc-400">Was du diesen Monat am liebsten gegessen hast</p>
      </div>
      {topDishes.length === 0 ? (
        <p className="text-center text-zinc-600">Noch keine Daten</p>
      ) : topDishes.map(([name, count], i) => (
        <div key={name} className="flex items-center gap-3 bg-zinc-800 rounded-xl p-3">
          <span className="text-xl w-8 text-center">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{name}</p>
            <div className="h-1.5 bg-zinc-700 rounded-full mt-1.5">
              <div className="h-1.5 bg-brand-500 rounded-full" style={{ width: `${(count / topDishes[0][1]) * 100}%` }}/>
            </div>
          </div>
          <span className="text-zinc-400 text-sm shrink-0">{count}×</span>
        </div>
      ))}
    </div>,

    // Slide 2: Activity highlights
    <div key="activity" className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">⚡</div>
        <h2 className="text-2xl font-display font-bold text-white">Aktivität</h2>
        <p className="text-zinc-400">Deine Sport-Highlights</p>
      </div>
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5 text-center">
        <p className="text-4xl font-display font-bold text-orange-400">{totalBurned.toLocaleString()}</p>
        <p className="text-zinc-300">kcal durch Sport verbrannt</p>
        <p className="text-zinc-500 text-sm mt-1">in {activeDays.length} aktiven Tagen</p>
      </div>
      {topSport && (
        <div className="bg-zinc-800 rounded-2xl p-4 text-center">
          <Trophy size={24} className="text-amber-400 mx-auto mb-2"/>
          <p className="text-zinc-400 text-sm">Lieblingssport</p>
          <p className="text-white font-bold text-lg">{topSport[0]}</p>
          <p className="text-zinc-500 text-sm">{topSport[1]} Minuten gesamt</p>
        </div>
      )}
      {maxStreak > 1 && (
        <div className="bg-zinc-800 rounded-2xl p-4 text-center">
          <Star size={24} className="text-brand-400 mx-auto mb-2"/>
          <p className="text-zinc-400 text-sm">Längste Tracking-Streak</p>
          <p className="text-white font-bold text-lg">{maxStreak} Tage in Folge</p>
        </div>
      )}
    </div>,

    // Slide 3: Nutrition stats
    <div key="nutrition" className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">🧬</div>
        <h2 className="text-2xl font-display font-bold text-white">Nährwerte</h2>
        <p className="text-zinc-400">Deine Monatsbilanz</p>
      </div>
      {[
        { label: 'Kalorien gesamt', value: Math.round(totalCalories).toLocaleString(), unit: 'kcal', color: 'text-white', bar: avgCalories / target },
        { label: 'Protein gesamt', value: Math.round(totalProtein).toLocaleString(), unit: 'g', color: 'text-brand-400', bar: totalProtein / (loggedDays.length * (plan?.protein ?? 150)) },
        { label: 'Ø Kalorien/Tag', value: avgCalories.toLocaleString(), unit: 'kcal', color: 'text-blue-400', bar: avgCalories / target },
        { label: 'Ziel-Genauigkeit', value: `${Math.round(goalRate * 100)}`, unit: '%', color: 'text-amber-400', bar: goalRate },
      ].map(s => (
        <div key={s.label} className="bg-zinc-800 rounded-xl p-3">
          <div className="flex justify-between mb-1.5">
            <span className="text-zinc-400 text-sm">{s.label}</span>
            <span className={`font-bold ${s.color}`}>{s.value} <span className="text-zinc-500 font-normal text-xs">{s.unit}</span></span>
          </div>
          <div className="h-1.5 bg-zinc-700 rounded-full">
            <div className="h-1.5 rounded-full transition-all" style={{
              width: `${Math.min(s.bar * 100, 100)}%`,
              backgroundColor: s.bar > 1 ? '#ef4444' : s.bar > 0.85 ? '#22c55e' : '#3b82f6'
            }}/>
          </div>
        </div>
      ))}
    </div>,
  ]

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="w-full max-w-lg bg-zinc-950 border-t border-zinc-800 rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className={`h-1 rounded-full transition-all ${i === slide ? 'bg-brand-500 w-6' : 'bg-zinc-700 w-3'}`}/>
            ))}
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X size={20}/>
          </button>
        </div>

        {/* Content */}
        <div className="min-h-80">
          {slides[slide]}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {slide > 0 && (
            <button onClick={() => setSlide(s => s-1)}
              className="flex-1 py-3 border border-zinc-700 text-zinc-400 rounded-xl text-sm">
              ← Zurück
            </button>
          )}
          {slide < slides.length - 1 ? (
            <button onClick={() => setSlide(s => s+1)}
              className="flex-1 py-3 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl text-sm">
              Weiter →
            </button>
          ) : (
            <button onClick={onClose}
              className="flex-1 py-3 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl text-sm">
              Fertig 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
