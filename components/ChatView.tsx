'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { sumMacros } from '@/lib/nutrition'
import { Send, Bot, User } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ChatView() {
  const { apiKey, plan, todayLog, guestCode, isGuest } = useStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hey! 👋 Ich bin dein KI-Ernährungsberater. Frag mich alles – was du heute noch essen solltest, ob ein Lebensmittel gut für dein Ziel ist, oder wie dein Fortschritt aussieht.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    const log = todayLog()
    const totals = sumMacros(log.entries)
    const context = plan ? `
Nutzerprofil: Ziel=${plan.targetCalories} kcal/Tag, Protein=${plan.protein}g, Kohlenhydrate=${plan.carbs}g, Fett=${plan.fat}g
Heute bisher: ${Math.round(totals.calories)} kcal, Protein: ${Math.round(totals.protein)}g, Kohlenhydrate: ${Math.round(totals.carbs)}g, Fett: ${Math.round(totals.fat)}g
Verbleibend: ${Math.round(plan.targetCalories - totals.calories)} kcal
Mahlzeiten heute: ${log.entries.map(e => e.name).join(', ') || 'Noch nichts'}
` : 'Kein Plan erstellt.'

    try {
      const endpoint = isGuest ? '/api/guest-chat' : '/api/chat'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context,
          apiKey: isGuest ? undefined : apiKey,
          guestCode: isGuest ? guestCode : undefined,
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setMessages(m => [...m, { role: 'assistant', content: data.reply }])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Fehler')
      setMessages(m => [...m, { role: 'assistant', content: '❌ Fehler beim Antworten. Bitte API Key prüfen.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen pb-20">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 border-b border-zinc-800">
        <h1 className="text-2xl font-display font-bold text-white">KI-Chat</h1>
        <p className="text-zinc-400 text-sm">Dein persönlicher Ernährungsberater</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-brand-500' : 'bg-zinc-700'}`}>
              {m.role === 'assistant' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white" />}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'assistant'
                ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-sm'
                : 'bg-brand-500 text-white rounded-tr-sm'
            }`}>
              {m.content.split('\n').map((line, j) => (
                <span key={j}>{line}{j < m.content.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: `${d}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {['Was soll ich noch essen?', 'Ist Tiramisu ok?', 'Wie ist mein Fortschritt?'].map(s => (
          <button
            key={s}
            onClick={() => { setInput(s); }}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-brand-500 hover:text-brand-400 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Frag mich alles..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand-500 transition-colors placeholder:text-zinc-600"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center disabled:opacity-40 hover:bg-brand-400 transition-all active:scale-95"
        >
          <Send size={18} className="text-white" />
        </button>
      </div>
    </div>
  )
}
