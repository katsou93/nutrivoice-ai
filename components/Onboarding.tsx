'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { ACTIVITY_LEVELS, PAL_LABELS, type UserProfile, type ActivityLevel, type Sex, type Goal } from '@/lib/nutrition'
import { type AvatarType } from '@/lib/avatar'
import { AvatarRenderer } from './AvatarRenderer'
import { ChevronRight, ChevronLeft, Zap } from 'lucide-react'

const STEPS = ['Avatar', 'Willkommen', 'Körper', 'Ziel', 'Aktivität', 'API Key']

const AVATAR_OPTIONS: { type: AvatarType; name: string; emoji: string; description: string; level1: string }[] = [
  { type: 'panda', name: 'Panda', emoji: '🐼', description: 'Süß, stark, zen', level1: 'Baby Panda' },
  { type: 'avocado', name: 'Avocado', emoji: '🥑', description: 'Healthy, trendy, grün', level1: 'Unreife Avocado' },
  { type: 'pixel', name: 'Pixel-Held', emoji: '🕹️', description: '8-Bit Retro-Gamer', level1: '8-Bit Newbie' },
  { type: 'blob', name: 'DNA-Blob', emoji: '🧬', description: 'Mysteriös, kosmisch', level1: 'Mikrozelle' },
  { type: 'frog', name: 'Frosch', emoji: '🐸', description: 'Entspannt, memeable', level1: 'Kaulquappe' },
]

export function Onboarding() {
  const setProfile = useStore((s) => s.setProfile)
  const setApiKey = useStore((s) => s.setApiKey)
  const setAvatarType = useStore((s) => s.setAvatarType)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    selectedAvatar: 'panda' as AvatarType,
    age: 25,
    sex: 'male' as Sex,
    weightKg: 70,
    heightCm: 175,
    goal: 'gain' as Goal,
    targetWeightKg: 75,
    weeklyRateKg: 0.5,
    activityLevel: 1.375 as ActivityLevel,
    apiKey: '',
  })

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  function finish() {
    setApiKey(form.apiKey)
    setAvatarType(form.selectedAvatar)
    const profile: UserProfile = {
      age: form.age,
      sex: form.sex,
      weightKg: form.weightKg,
      heightCm: form.heightCm,
      goal: form.goal,
      targetWeightKg: form.targetWeightKg,
      weeklyRateKg: form.weeklyRateKg,
      activityLevel: form.activityLevel,
    }
    setProfile(profile)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
          <Zap size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">NutriVoice AI</h1>
        <p className="text-zinc-400 mt-1 text-sm">Schritt {step + 1} von {STEPS.length}: {STEPS[step]}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-6">
        <div className="h-1 bg-zinc-800 rounded-full">
          <div
            className="h-1 bg-brand-500 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="w-full max-w-sm">

        {/* Step 0: Avatar choice */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white">Wähle deinen Avatar</h2>
            <p className="text-zinc-400 text-sm">Dein Avatar wächst mit dir – jedes Level hat einzigartige Namen!</p>
            <div className="space-y-3">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.type}
                  onClick={() => set('selectedAvatar', av.type)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    form.selectedAvatar === av.type
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="w-14 h-14 shrink-0">
                    <AvatarRenderer type={av.type} equippedItems={{}} size={56} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold">{av.emoji} {av.name}</p>
                    <p className="text-zinc-400 text-xs">{av.description}</p>
                    <p className="text-brand-400 text-xs mt-0.5">Start: {av.level1}</p>
                  </div>
                  {form.selectedAvatar === av.type && (
                    <span className="text-brand-400 text-lg shrink-0">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-display font-bold text-white">Willkommen! 👋</h2>
            <p className="text-zinc-400 leading-relaxed">
              Ich bin dein KI-Ernährungsberater. Sag mir einfach was du gegessen hast – per Sprache oder Text – und ich tracke alles für dich.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {['🎙️ Voice-First Tracking', '🤖 KI-Analyse', '📊 Wissenschaftliche Pläne', '🎯 Persönliche Ziele'].map(f => (
                <div key={f} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300">{f}</div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Body data */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-display font-bold text-white">Deine Körperdaten</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => set('sex', 'male')}
                className={`p-4 rounded-xl border text-center transition-all ${form.sex === 'male' ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-zinc-800 text-zinc-400'}`}
              >
                👨 Männlich
              </button>
              <button
                onClick={() => set('sex', 'female')}
                className={`p-4 rounded-xl border text-center transition-all ${form.sex === 'female' ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-zinc-800 text-zinc-400'}`}
              >
                👩 Weiblich
              </button>
            </div>
            {[
              { label: 'Alter', key: 'age', unit: 'Jahre', min: 10, max: 100 },
              { label: 'Gewicht', key: 'weightKg', unit: 'kg', min: 30, max: 300 },
              { label: 'Größe', key: 'heightCm', unit: 'cm', min: 100, max: 250 },
            ].map(({ label, key, unit, min, max }) => (
              <div key={key}>
                <label className="text-sm text-zinc-400 mb-1 block">{label}</label>
                <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                  <input
                    type="number"
                    value={form[key as keyof typeof form] as number}
                    onChange={e => set(key, Number(e.target.value))}
                    min={min} max={max}
                    className="flex-1 bg-transparent text-white text-lg font-bold outline-none"
                  />
                  <span className="text-zinc-500 text-sm">{unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Goal */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-display font-bold text-white">Dein Ziel</h2>
            <div className="space-y-3">
              {[
                { id: 'gain', label: '📈 Zunehmen', desc: 'Muskeln aufbauen, Gewicht erhöhen' },
                { id: 'lose', label: '📉 Abnehmen', desc: 'Körperfett reduzieren' },
                { id: 'maintain', label: '⚖️ Halten', desc: 'Gewicht stabilisieren' },
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => set('goal', g.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${form.goal === g.id ? 'border-brand-500 bg-brand-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}
                >
                  <div className="font-semibold text-white">{g.label}</div>
                  <div className="text-sm text-zinc-400 mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
            {form.goal !== 'maintain' && (
              <>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Zielgewicht (kg)</label>
                  <input
                    type="number"
                    value={form.targetWeightKg}
                    onChange={e => set('targetWeightKg', Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-lg font-bold outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Tempo: {form.weeklyRateKg} kg/Woche</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0.25, 0.5, 0.75, 1.0].map(r => (
                      <button
                        key={r}
                        onClick={() => set('weeklyRateKg', r)}
                        className={`p-2 rounded-lg border text-sm font-semibold transition-all ${form.weeklyRateKg === r ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-zinc-800 text-zinc-400'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Activity */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white">Aktivitätslevel</h2>
            <p className="text-sm text-zinc-400">Basiert auf dem PAL-Wert nach ACSM-Richtlinien</p>
            {ACTIVITY_LEVELS.map(level => (
              <button
                key={level}
                onClick={() => set('activityLevel', level)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${form.activityLevel === level ? 'border-brand-500 bg-brand-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium text-sm">{PAL_LABELS[level]}</span>
                  <span className={`text-xs font-bold ${form.activityLevel === level ? 'text-brand-400' : 'text-zinc-500'}`}>×{level}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 5: API Key */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-xl font-display font-bold text-white">Anthropic API Key</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Für die KI-Features brauchst du einen API Key von{' '}
              <a href="https://console.anthropic.com" target="_blank" className="text-brand-400 underline">console.anthropic.com</a>
            </p>
            <input
              type="password"
              value={form.apiKey}
              onChange={e => set('apiKey', e.target.value)}
              placeholder="sk-ant-..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white font-mono text-sm outline-none focus:border-brand-500 transition-colors"
            />
            <p className="text-xs text-zinc-500">🔒 Nur lokal gespeichert – nie übertragen</p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-400">
              <p className="font-semibold text-white mb-1">Auch ohne API Key nutzbar:</p>
              <p>Manuelles Tracking und Berechnungen funktionieren offline.</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8 w-full max-w-sm">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:border-zinc-700 transition-colors"
          >
            <ChevronLeft size={18} /> Zurück
          </button>
        )}
        <button
          onClick={step === STEPS.length - 1 ? finish : () => setStep(s => s + 1)}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold transition-all active:scale-95"
        >
          {step === STEPS.length - 1 ? 'Loslegen 🚀' : 'Weiter'} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
