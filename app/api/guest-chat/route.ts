import { NextRequest, NextResponse } from 'next/server'

// Gastzugang: nutzt den API Key vom Server (Vercel Env Variable)
// Gäste müssen keinen eigenen Key eingeben

const GUEST_CODE = process.env.GUEST_CODE ?? 'nutrivoice2025'
const SERVER_API_KEY = process.env.ANTHROPIC_API_KEY ?? ''

export async function POST(req: NextRequest) {
  const { messages, context, guestCode } = await req.json()

  // Prüfe Gastcode
  if (guestCode !== GUEST_CODE) {
    return NextResponse.json({ error: 'Ungültiger Gastcode' }, { status: 401 })
  }

  if (!SERVER_API_KEY) {
    return NextResponse.json({ error: 'Server API Key nicht konfiguriert' }, { status: 500 })
  }

  const systemPrompt = `Du bist NutriVoice AI – ein wissenschaftlich fundierter, freundlicher Ernährungsberater.
WICHTIG: Basiere alle Ratschläge auf wissenschaftlichem Konsens. Sei direkt und konkret. Antworte auf Deutsch.
Du kannst Kalorien und Makros berechnen, Mahlzeiten vorschlagen, Fortschritt analysieren.
Gib KEINE medizinischen Diagnosen.
NUTZERPROFIL & HEUTIGER STATUS:
${context}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SERVER_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    })
    const data = await response.json()
    const text = data.content?.find((b: any) => b.type === 'text')?.text ?? 'Fehler beim Antworten.'
    return NextResponse.json({ reply: text })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
