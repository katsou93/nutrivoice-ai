'use client'

import { useStore } from '@/lib/store'
import { PAL_LABELS, ACTIVITY_LEVELS, calculatePlan, type ActivityLevel, type Goal, type Sex } from '@/lib/nutrition'
import { useState } from 'react'
import { toast } from 'sonner'
import { User, Key, RotateCcw } from 'lucide-react'

export function ProfileView() {
  const { profile, setProfile, apiKey, setApiKey, healthProfile, setHealthProfile } = useStore()
  const [newApiKey, setNewApiKey] = useState(apiKey)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...profile! })

  if (!profile) return null

  const plan = calculatePlan(profile)

  const saveProfile = () => {
    setProfile(form as typeof profile)
    setEditing(false)
    toast.success('Profil gespeichert ✅')
  }

  const saveApiKey = () => {
    setApiKey(newApiKey)
    toast.success('API Key gespeichert 🔑')
  }

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const goalLabels: Record<Goal, string> = {
    gain: '📈 Zunehmen',
    lose: '📉 Abnehmen',
    maintain: '⚖️ Halten',
  }

  return (
    <div className="px-4 pt-8 pb-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Profil</h1>
          <p className="text-zinc-400 text-sm">Deine Einstellungen</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:border-zinc-600 text-sm transition-colors"
        >
          {editing ? 'Abbrechen' : 'Bearbeiten'}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <User size={24} className="text-brand-400" />
          </div>
          <div>
            <p className="text-white font-bold">{profile.weightKg} kg • {profile.heightCm} cm</p>
            <p className="text-zinc-400 text-sm">{profile.age} Jahre • {profile.sex === 'male' ? 'Männlich' : 'Weiblich'}</p>
            <p className="text-brand-400 text-sm font-medium">{goalLabels[profile.goal]}</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => set('sex', 'male')} className={`p-3 rounded-xl border text-sm transition-all ${form.sex === 'male' ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-zinc-800 text-zinc-400'}`}>👨 Männlich</button>
              <button onClick={() => set('sex', 'female')} className={`p-3 rounded-xl border text-sm transition-all ${form.sex === 'female' ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-zinc-800 text-zinc-400'}`}>👩 Weiblich</button>
            </div>

            {[
              { label: 'Alter', key: 'age', unit: 'J' },
              { label: 'Gewicht', key: 'weightKg', unit: 'kg' },
              { label: 'Größe', key: 'heightCm', unit: 'cm' },
            ].map(f => (
              <div key={f.key} className="flex items-center gap-3 bg-zinc-800 rounded-xl px-4 py-2.5">
                <label className="text-zinc-400 text-sm w-20">{f.label}</label>
                <input
                  type="number"
                  value={form[f.key as keyof typeof form] as number}
                  onChange={e => set(f.key, Number(e.target.value))}
                  className="flex-1 bg-transparent text-white font-bold outline-none"
                />
                <span className="text-zinc-500 text-sm">{f.unit}</span>
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-zinc-400 text-sm">Ziel</label>
              <div className="grid grid-cols-3 gap-2">
                {(['gain', 'lose', 'maintain'] as Goal[]).map(g => (
                  <button key={g} onClick={() => set('goal', g)} className={`p-2 rounded-lg border text-xs transition-all ${form.goal === g ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-zinc-800 text-zinc-400'}`}>
                    {goalLabels[g]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-zinc-400 text-sm">Aktivitätslevel</label>
              {ACTIVITY_LEVELS.map(l => (
                <button key={l} onClick={() => set('activityLevel', l)} className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all ${form.activityLevel === l ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-zinc-800 text-zinc-400'}`}>
                  <span className="font-semibold">×{l}</span> – {PAL_LABELS[l as ActivityLevel]}
                </button>
              ))}
            </div>

            <button onClick={saveProfile} className="w-full py-3 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl transition-all">
              Speichern
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b border-zinc-800">
              <span className="text-zinc-400">Grundumsatz (BMR)</span>
              <span className="text-white font-medium">{plan.bmr} kcal</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-800">
              <span className="text-zinc-400">Gesamtumsatz (TDEE)</span>
              <span className="text-white font-medium">{plan.tdee} kcal</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-800">
              <span className="text-zinc-400">Aktivitätslevel</span>
              <span className="text-white font-medium">×{profile.activityLevel}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-400">Kalorienziel</span>
              <span className="text-brand-400 font-bold">{plan.targetCalories} kcal</span>
            </div>
          </div>
        )}
      </div>

      {/* Health Profile */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🏥</span>
          <h2 className="text-white font-display font-bold">Gesundheitsprofil & Besonderheiten</h2>
        </div>
        <p className="text-zinc-500 text-sm mb-3 leading-relaxed">
          Erkläre der KI alles Wichtige: Allergien, Unverträglichkeiten, Medikamente, Krankheiten, Ernährungsformen (vegan, keto...) oder andere Aspekte.
        </p>
        <textarea
          value={healthProfile}
          onChange={e => setHealthProfile(e.target.value)}
          placeholder="z.B. Ich bin laktoseintolerant, habe eine Nussallergie und ernähre mich hauptsächlich vegetarisch. Außerdem nehme ich Metformin, daher sollte ich wenig Zucker essen..."
          rows={5}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand-500 transition-colors placeholder:text-zinc-600 resize-none mb-3"
        />
        <button
          onClick={() => { setHealthProfile(healthProfile); toast.success('Gesundheitsprofil gespeichert ✅') }}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl text-sm transition-all"
        >
          Speichern
        </button>
        {healthProfile && (
          <div className="mt-3 bg-brand-500/10 border border-brand-500/20 rounded-xl p-3 text-xs text-zinc-400">
            ✅ Profil gespeichert – die KI berücksichtigt das bei allen Plänen und Empfehlungen
          </div>
        )}
      </div>

      {/* API Key */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Key size={16} className="text-zinc-400" />
          <h2 className="text-white font-display font-bold">Anthropic API Key</h2>
        </div>
        <div className="flex gap-2">
          <input
            type="password"
            value={newApiKey}
            onChange={e => setNewApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none focus:border-brand-500 transition-colors"
          />
          <button onClick={saveApiKey} className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl text-sm transition-all">
            Speichern
          </button>
        </div>
        <p className="text-xs text-zinc-600 mt-2">🔒 Nur lokal gespeichert • Nie an Server übertragen</p>
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          if (confirm('Wirklich alle Daten löschen?')) {
            localStorage.removeItem('nutrivoice-store')
            window.location.reload()
          }
        }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
      >
        <RotateCcw size={14} /> App zurücksetzen
      </button>
    </div>
  )
}
