'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useCallback, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { getMealType, type FoodEntry } from '@/lib/nutrition'
import { Mic, MicOff, Send, ArrowLeft, CheckCircle, AlertTriangle, Keyboard } from 'lucide-react'
import { toast } from 'sonner'

interface ParsedEntry {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  amount: number
  unit: string
  mealType: FoodEntry['mealType']
  confidence: 'verified' | 'estimated' | 'unknown'
}

interface ParseResult {
  entries: ParsedEntry[]
  clarification: string | null
  message: string
}

// iOS Safari detection
function isIOS() {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function isSafari() {
  if (typeof window === 'undefined') return false
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

function hasSpeechRecognition() {
  if (typeof window === 'undefined') return false
  const w = window as any
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition)
}

export function VoiceInput({ onDone }: { onDone: () => void }) {
  const { apiKey, guestCode, isGuest, addEntry, today } = useStore()

  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [manualText, setManualText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [clarification, setClarification] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)

  const recogRef = useRef<any>(null)
  const listenRef = useRef(false) // stable ref for onend closure
  const isIOSDevice = useRef(false)

  useEffect(() => {
    isIOSDevice.current = isIOS()
    setSpeechSupported(hasSpeechRecognition())
    // iOS Safari: show keyboard by default as primary option
    if (isIOS() && isSafari()) setShowManual(true)
  }, [])

  const startListening = useCallback(() => {
    const w = window as any
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setShowManual(true)
      toast.error('Spracherkennung nicht verfügbar – bitte Text eingeben')
      return
    }

    const ios = isIOSDevice.current
    const recog = new SpeechRecognition()
    recog.lang = 'de-DE'
    recog.continuous = !ios        // iOS unterstützt continuous nicht zuverlässig
    recog.interimResults = !ios    // iOS: kein interimResults

    recog.onresult = (event: any) => {
      if (ios) {
        // iOS: nur finales Ergebnis, alles sammeln
        let all = ''
        for (let i = 0; i < event.results.length; i++) {
          all += event.results[i][0].transcript + ' '
        }
        setTranscript(prev => (prev + ' ' + all).trim())
      } else {
        // Desktop/Android: interim + final
        let final = ''
        let interim = ''
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i]
          if (r.isFinal) final += r[0].transcript + ' '
          else interim += r[0].transcript
        }
        setTranscript((final + interim).trim())
      }
    }

    recog.onend = () => {
      if (!ios && listenRef.current && recogRef.current === recog) {
        // Desktop: automatisch neu starten bei Denkpause
        try { recog.start() } catch {}
      } else if (ios && listenRef.current) {
        // iOS: neu starten damit man weiter sprechen kann
        try {
          const r2 = new SpeechRecognition()
          r2.lang = 'de-DE'
          r2.continuous = false
          r2.interimResults = false
          r2.onresult = recog.onresult
          r2.onend = recog.onend
          r2.onerror = recog.onerror
          r2.start()
          recogRef.current = r2
        } catch {}
      } else {
        setListening(false)
        listenRef.current = false
      }
    }

    recog.onerror = (e: any) => {
      if (e.error === 'no-speech') return // Denkpause – ignorieren
      if (e.error === 'not-allowed') {
        toast.error('Mikrofon-Zugriff verweigert. Bitte in Einstellungen erlauben.')
        setShowManual(true)
      }
      setListening(false)
      listenRef.current = false
    }

    try {
      recog.start()
      recogRef.current = recog
      listenRef.current = true
      setListening(true)
      if (!transcript) setTranscript('')
    } catch {
      toast.error('Konnte Mikrofon nicht starten')
      setShowManual(true)
    }
  }, [transcript])

  const stopListening = useCallback(() => {
    listenRef.current = false
    const recog = recogRef.current
    recogRef.current = null
    try { recog?.stop() } catch {}
    setListening(false)
  }, [])

  const parseFood = async (text: string) => {
    if (!text.trim()) return
    setLoading(true)
    setResult(null)
    const context = `Ziel: Kalorien tracken. Aktuelle Uhrzeit: ${new Date().toLocaleTimeString('de-DE')}`
    try {
      const endpoint = isGuest ? '/api/guest-parse' : '/api/parse-food'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context,
          apiKey: isGuest ? undefined : apiKey,
          guestCode: isGuest ? guestCode : undefined,
        }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? 'API Fehler') }
      const data: ParseResult = await res.json()
      setResult(data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Fehler beim Analysieren')
    } finally {
      setLoading(false)
    }
  }

  const confirmEntries = () => {
    if (!result?.entries.length) return
    const date = today()
    result.entries.forEach(e => {
      const entry: FoodEntry = {
        id: crypto.randomUUID(),
        name: e.name,
        calories: e.calories,
        protein: e.protein,
        carbs: e.carbs,
        fat: e.fat,
        amount: e.amount,
        unit: e.unit,
        mealType: e.mealType ?? getMealType(new Date().getHours()),
        timestamp: new Date().toISOString(),
        confidence: e.confidence ?? 'estimated',
      }
      addEntry(date, entry)
    })
    toast.success(`${result.entries.length} Eintrag/Einträge hinzugefügt ✅`)
    onDone()
  }

  const inputText = transcript || manualText
  const ios = isIOS() && isSafari()

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pt-8 pb-24">
      {/* Back */}
      <button onClick={onDone} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={18} /> Zurück
      </button>

      <h1 className="text-2xl font-display font-bold text-white mb-2">Was hast du gegessen?</h1>
      <p className="text-zinc-400 text-sm mb-6">
        {ios ? 'Tippe auf Mikrofon → sprich → tippe nochmal zum Stoppen' : 'Sprich oder tippe – ich analysiere es für dich.'}
      </p>

      {/* iOS Hinweis */}
      {ios && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-5 text-sm text-blue-300">
          📱 <strong>Safari Tipp:</strong> Tippe auf das Mikrofon, sprich, dann tippe nochmal zum Stoppen. Du kannst mehrmals hintereinander sprechen.
        </div>
      )}

      {/* Voice/Text Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowManual(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${!showManual ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-zinc-800 text-zinc-500'}`}
        >
          <Mic size={16} /> Sprache
        </button>
        <button
          onClick={() => setShowManual(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${showManual ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-zinc-800 text-zinc-500'}`}
        >
          <Keyboard size={16} /> Tippen
        </button>
      </div>

      {/* Voice Input */}
      {!showManual && (
        <div className="flex flex-col items-center mb-8">
          {/* Mikrofon Button – einfaches Tippen für iOS */}
          <button
            onClick={listening ? stopListening : startListening}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              listening
                ? 'bg-red-500 shadow-xl shadow-red-500/40'
                : 'bg-brand-500 shadow-xl shadow-brand-500/30 hover:bg-brand-400'
            }`}
          >
            {listening ? <MicOff size={36} className="text-white" /> : <Mic size={36} className="text-white" />}
            {listening && (
              <>
                <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
                <span className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping" style={{ animationDelay: '0.4s' }} />
              </>
            )}
          </button>
          <p className="text-zinc-500 text-sm mt-3">
            {listening ? '🔴 Läuft… tippe zum Stoppen' : 'Tippe zum Sprechen'}
          </p>
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-4">
          <p className="text-white">{transcript}</p>
          <button onClick={() => setTranscript('')} className="text-xs text-zinc-500 mt-2 hover:text-zinc-300">
            Löschen
          </button>
        </div>
      )}

      {/* Text Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={manualText}
          onChange={e => setManualText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && parseFood(inputText)}
          placeholder="z.B. '2 Toast mit Gouda und Espresso'"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand-500 transition-colors placeholder:text-zinc-600"
        />
        <button
          onClick={() => parseFood(inputText)}
          disabled={!inputText.trim() || loading}
          className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center disabled:opacity-40 hover:bg-brand-400 transition-all active:scale-95"
        >
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Send size={18} className="text-white" />
          }
        </button>
      </div>

      {/* Clarification */}
      {result?.clarification && (
        <div className="bg-zinc-900 border border-yellow-500/30 rounded-xl p-4 mb-4 space-y-3">
          <p className="text-yellow-400 text-sm">{result.clarification}</p>
          <div className="flex gap-2">
            <input value={clarification} onChange={e => setClarification(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && parseFood(clarification)}
              placeholder="Deine Antwort..." className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none" />
            <button onClick={() => parseFood(clarification)} className="px-4 py-2 bg-yellow-500 text-black rounded-lg text-sm font-semibold">OK</button>
          </div>
        </div>
      )}

      {/* Results */}
      {result?.entries && result.entries.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
            <CheckCircle size={16} className="text-brand-400" />
            <span className="text-white font-semibold">Erkannte Lebensmittel</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {result.entries.map((e, i) => (
              <div key={i} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{e.name}</span>
                    {e.confidence === 'estimated' && <AlertTriangle size={12} className="text-yellow-400" />}
                    {e.confidence === 'verified' && <CheckCircle size={12} className="text-brand-400" />}
                  </div>
                  <span className="text-white font-bold">{e.calories} kcal</span>
                </div>
                <div className="text-zinc-500 text-xs">{e.amount}{e.unit} • P: {e.protein}g • K: {e.carbs}g • F: {e.fat}g</div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-zinc-800">
            <p className="text-zinc-400 text-sm mb-3 italic">{result.message}</p>
            <button onClick={confirmEntries} className="w-full py-3 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl transition-all active:scale-95">
              Hinzufügen ✅
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
