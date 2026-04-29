import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { messages, context, apiKey } = await req.json()

  if (!apiKey) {
    return NextResponse.json({ error: 'Kein API Key' }, { status: 401 })
  }

  const systemPrompt = `Du bist NutriVoice AI – ein wissenschaftlich fundierter, freundlicher Ernährungsberater.

WICHTIG:
- Basiere alle Ratschläge auf wissenschaftlichem Konsens (keine Pseudowissenschaft)
- Sei direkt und konkret, keine langen Einleitungen
- Antworte auf Deutsch
- Du kannst Kalorien und Makros berechnen, Mahlzeiten vorschlagen, Fortschritt analysieren
- Gib KEINE medizinischen Diagnosen
- Bei BMI < 17 oder > 40: empfehle Arztbesuch

NUTZERPROFIL & HEUTIGER STATUS:
${context}

Wenn der Nutzer fragt "was soll ich heute noch essen?" – berechne den Restbedarf und mache konkrete Vorschläge.
Wenn er fragt ob etwas ok ist – antworte ehrlich und kontextbezogen.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
    const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text ?? 'Fehler beim Antworten.'
    return NextResponse.json({ reply: text })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Fehler'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
