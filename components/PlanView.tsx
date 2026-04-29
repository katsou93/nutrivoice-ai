'use client'

import { useStore } from '@/lib/store'
import { calculatePlan } from '@/lib/nutrition'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Scale, TrendingUp, AlertCircle, Info } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function PlanView() {
  const { plan, profile, logs, logWeight, today } = useStore()
  const [weightInput, setWeightInput] = useState('')

  if (!plan || !profile) return null

  // Weight history for chart
  const weightData = Object.values(logs)
    .filter(l => l.weight)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map(l => ({ date: l.date.slice(5), kg: l.weight }))

  const handleLogWeight = () => {
    const kg = parseFloat(weightInput)
    if (isNaN(kg) || kg < 20 || kg > 300) {
      toast.error('Bitte ein gültiges Gewicht eingeben')
      return
    }
    logWeight(today(), kg)
    setWeightInput('')
    toast.success(`${kg} kg eingetragen ✅`)
  }

  // Projected goal
  const weeksToGoal = plan.weeksToGoal
  const projectedDate = weeksToGoal ? new Date(Date.now() + weeksToGoal * 7 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) : null

  return (
    <div className="px-4 pt-8 pb-4 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Dein Plan</h1>
        <p className="text-zinc-400 text-sm">Berechnet mit Mifflin-St-Jeor + PAL-Wert</p>
      </div>

      {/* Warnings */}
      {plan.warnings.map((w, i) => (
        <div key={i} className="flex gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-300">{w}</p>
        </div>
      ))}

      {/* Calorie Breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-white font-display font-bold">Kalorienbedarf</h2>

        {[
          { label: 'Grundumsatz (BMR)', value: plan.bmr, desc: 'Mifflin-St-Jeor Formel', color: 'text-zinc-300' },
          { label: `Gesamtumsatz (TDEE)`, value: plan.tdee, desc: `PAL ×${profile.activityLevel}`, color: 'text-blue-400' },
          { label: 'Dein Kalorienziel', value: plan.targetCalories, desc: profile.goal === 'gain' ? `+${plan.targetCalories - plan.tdee} kcal Überschuss` : profile.goal === 'lose' ? `-${plan.tdee - plan.targetCalories} kcal Defizit` : 'Erhaltung', color: 'text-brand-400' },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
            <div>
              <p className={`font-semibold ${row.color}`}>{row.label}</p>
              <p className="text-xs text-zinc-500">{row.desc}</p>
            </div>
            <span className="text-white font-bold text-lg">{row.value} <span className="text-zinc-500 text-sm font-normal">kcal</span></span>
          </div>
        ))}
      </div>

      {/* Makros */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-white font-display font-bold mb-4">Tägliche Makros</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Protein', value: plan.protein, color: 'bg-brand-500', desc: `${(plan.protein / profile.weightKg).toFixed(1)}g/kg` },
            { label: 'Kohlenhydrate', value: plan.carbs, color: 'bg-blue-500', desc: `${Math.round(plan.carbs * 4)} kcal` },
            { label: 'Fett', value: plan.fat, color: 'bg-amber-500', desc: `${Math.round(plan.fat * 9)} kcal` },
          ].map(m => (
            <div key={m.label} className="text-center bg-zinc-800 rounded-xl p-3">
              <div className={`w-2 h-2 rounded-full ${m.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-white">{m.value}<span className="text-sm font-normal text-zinc-400">g</span></p>
              <p className="text-xs text-zinc-400">{m.label}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{m.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 text-xs text-zinc-500">
          <Info size={12} className="shrink-0 mt-0.5" />
          <span>Protein-Ziel basiert auf {profile.goal === 'lose' ? '2,2' : '2,0'}g/kg nach wissenschaftlichem Konsens (Morton et al. 2018, Helms et al. 2014)</span>
        </div>
      </div>

      {/* Goal Timeline */}
      {projectedDate && profile.targetWeightKg && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-brand-400" />
            <h2 className="text-white font-display font-bold">Ziel-Prognose</h2>
          </div>
          <p className="text-zinc-400 text-sm">
            Bei {plan.weeklyChange > 0 ? '+' : ''}{plan.weeklyChange} kg/Woche erreichst du dein Ziel von{' '}
            <span className="text-white font-semibold">{profile.targetWeightKg} kg</span> voraussichtlich am
          </p>
          <p className="text-brand-400 font-display font-bold text-xl mt-1">{projectedDate}</p>
          <p className="text-zinc-500 text-xs mt-1">in ca. {weeksToGoal} Wochen</p>
        </div>
      )}

      {/* Weight Tracker */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Scale size={18} className="text-zinc-400" />
          <h2 className="text-white font-display font-bold">Gewichtsverlauf</h2>
        </div>

        {/* Log Weight */}
        <div className="flex gap-2 mb-5">
          <input
            type="number"
            value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogWeight()}
            placeholder="z.B. 74.5"
            step="0.1"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-brand-500 transition-colors"
          />
          <span className="flex items-center text-zinc-400 text-sm px-2">kg</span>
          <button
            onClick={handleLogWeight}
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl text-sm transition-all active:scale-95"
          >
            Eintragen
          </button>
        </div>

        {/* Chart */}
        {weightData.length >= 2 ? (
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weightData}>
              <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#22c55e' }}
                formatter={(v: number) => [`${v} kg`, 'Gewicht']}
              />
              <Line type="monotone" dataKey="kg" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-6 text-zinc-600">
            <p className="text-sm">Trage täglich dein Gewicht ein um den Verlauf zu sehen.</p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-xs text-zinc-600 pb-4">
        <Info size={12} className="shrink-0 mt-0.5" />
        <span>Diese App ersetzt keine professionelle Ernährungsberatung. Bei gesundheitlichen Fragen wende dich an einen Arzt.</span>
      </div>
    </div>
  )
}
