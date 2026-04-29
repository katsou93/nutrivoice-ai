'use client'

import { useStore } from '@/lib/store'
import { useState } from 'react'
import { Onboarding } from '@/components/Onboarding'
import { Dashboard } from '@/components/Dashboard'
import { VoiceInput } from '@/components/VoiceInput'
import { ChatView } from '@/components/ChatView'
import { PlanView } from '@/components/PlanView'
import { ProfileView } from '@/components/ProfileView'
import { CalendarView } from '@/components/CalendarView'
import { InspirationView } from '@/components/InspirationView'
import { AvatarView } from '@/components/AvatarView'
import { AvatarView } from '@/components/AvatarView'
import { ActivityView } from '@/components/ActivityView'
import { Home, User, Mic, CalendarDays, Key, Sparkles, Dumbbell } from 'lucide-react'
import { toast } from 'sonner'

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'calendar', label: 'Kalender', icon: CalendarDays },
  { id: 'voice', label: '', icon: Mic },
  { id: 'activity', label: 'Sport', icon: Dumbbell },
  { id: 'profile', label: 'Profil', icon: User },
]

function GuestLogin() {
  const setGuestCode = useStore(s => s.setGuestCode)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function verify() {
    if (!code.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/guest-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'test', context: '', guestCode: code.trim() }),
      })
      if (res.status === 401) {
        toast.error('Falscher Code – frag den App-Besitzer nach dem richtigen Code')
      } else {
        setGuestCode(code.trim())
        toast.success('Willkommen! Du bist jetzt eingeloggt 🎉')
      }
    } catch {
      toast.error('Verbindungsfehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/30">
        <Key size={28} className="text-white" />
      </div>
      <h1 className="text-2xl font-display font-bold text-white mb-2">Gastcode eingeben</h1>
      <p className="text-zinc-400 text-sm text-center mb-8">
        Du hast einen Gastcode bekommen? Gib ihn hier ein – kein eigener API Key nötig.
      </p>
      <div className="w-full max-w-sm space-y-4">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && verify()}
          placeholder="Gastcode eingeben"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-center font-mono tracking-wider outline-none focus:border-brand-500 transition-colors"
          autoCapitalize="none"
        />
        <button
          onClick={verify}
          disabled={!code.trim() || loading}
          className="w-full py-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-40 text-white font-semibold rounded-xl transition-all active:scale-95"
        >
          {loading ? 'Prüfe...' : 'Einloggen 🚀'}
        </button>
      </div>
    </div>
  )
}

function OnboardingOrGuest() {
  const [mode, setMode] = useState<'choose' | 'guest' | 'own'>('choose')
  if (mode === 'guest') return <GuestLogin />
  if (mode === 'own') return <Onboarding />
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/30">
        <Mic size={28} className="text-white" />
      </div>
      <h1 className="text-3xl font-display font-bold text-white mb-2">NutriVoice AI</h1>
      <p className="text-zinc-400 text-sm text-center mb-10">Wie möchtest du einloggen?</p>
      <div className="w-full max-w-sm space-y-4">
        <button onClick={() => setMode('guest')} className="w-full p-5 bg-zinc-900 border border-zinc-800 hover:border-brand-500 rounded-2xl text-left transition-all">
          <div className="flex items-center gap-3 mb-1">
            <Key size={20} className="text-brand-400" />
            <span className="text-white font-semibold">Gastcode eingeben</span>
          </div>
          <p className="text-zinc-500 text-sm">Du hast einen Code bekommen? Kein eigener API Key nötig.</p>
        </button>
        <button onClick={() => setMode('own')} className="w-full p-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl text-left transition-all">
          <div className="flex items-center gap-3 mb-1">
            <User size={20} className="text-zinc-400" />
            <span className="text-white font-semibold">Eigenen Account erstellen</span>
          </div>
          <p className="text-zinc-500 text-sm">Mit eigenem Anthropic API Key einrichten.</p>
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const profile = useStore(s => s.profile)
  const isGuest = useStore(s => s.isGuest)
  const [tab, setTab] = useState('home')

  if (!profile) return <OnboardingOrGuest />

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col max-w-lg mx-auto relative">
      <main className="flex-1 pb-24 overflow-y-auto">
        {tab === 'home' && <Dashboard onVoice={() => setTab('voice')} />}
        {tab === 'calendar' && <CalendarView onVoice={() => setTab('voice')} />}
        {tab === 'voice' && <VoiceInput onDone={() => setTab('home')} />}
        {tab === 'chat' && <ChatView />}
        {tab === 'activity' && <ActivityView />}
        {tab === 'inspiration' && <InspirationView />}
        {tab === 'avatar' && <AvatarView />}
        {tab === 'profile' && <ProfileView />}
        {tab === 'avatar' && <AvatarView />}
        {tab === 'inspiration' && <InspirationView />}
        {tab === 'avatar' && <AvatarView />}
        {tab === 'profile' && <ProfileView />}
        {tab === 'avatar' && <AvatarView />}
        {tab === 'profile' && <ProfileView />}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-zinc-900/95 backdrop-blur border-t border-zinc-800 flex items-center justify-around h-20 px-2 z-50">
        {TABS.map((t) => {
          const Icon = t.icon
          const isCenter = t.id === 'voice'
          const isActive = tab === t.id
          if (isCenter) {
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="relative -mt-6 w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/40 hover:bg-brand-400 transition-all active:scale-95">
                <Icon size={24} className="text-white" />
                {isActive && <span className="absolute inset-0 rounded-full border-2 border-brand-300 animate-ping" />}
              </button>
            )
          }
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${isActive ? 'text-brand-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Icon size={20} />
              <span className="text-xs">{t.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
