import { NextRequest, NextResponse } from 'next/server'

const GUEST_CODE = process.env.GUEST_CODE ?? 'nutrivoice2025'
const SERVER_API_KEY = process.env.ANTHROPIC_API_KEY ?? ''

export async function POST(req: NextRequest) {
  const { message, context, guestCode } = await req.json()

  if (guestCode !== GUEST_CODE) {
    return NextResponse.json({ error: 'Ungültiger Gastcode' }, { status: 401 })
  }

  if (!SERVER_API_KEY) {
    return NextResponse.json({ error: 'Server API Key nicht konfiguriert' }, { status: 500 })
  }

  const systemPrompt = `Du bist NutriVoice AI, ein präziser Ernährungsassistent.
AUFGABE: Analysiere Benutzereingaben über gegessene Lebensmittel und gib IMMER JSON zurück.
REGELN:
- Schätze Portionsgrößen realistisch wenn nicht genannt
- Nährwerte basieren auf USDA FoodData Central Daten
- Markiere Schätzungen mit confidence: "estimated", verifizierte Daten mit "verified"
- mealType: breakfast (vor 11 Uhr), lunch (11-14 Uhr), snack (14-18 Uhr), dinner (nach 18 Uhr)
- Aktuelle Uhrzeit: ${new Date().toLocaleTimeString('de-DE')}
KONTEXT: ${context || 'Kein Kontext'}

Antworte NUR mit gültigem JSON:
{
  "entries": [{"name":"...","calories":0,"protein":0,"carbs":0,"fat":0,"amount":0,"unit":"g","mealType":"breakfast","confidence":"estimated"}],
  "clarification": null,
  "message": "Bestätigung auf Deutsch"
}`

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
        messages: [{ role: 'user', content: message }],
        system: systemPrompt,
      }),
    })
    const data = await response.json()
    const text = data.content?.[0]?.text ?? '{}'
    try {
      return NextResponse.json(JSON.parse(text))
    } catch {
      const clean = text.replace(/```json\n?|\n?```/g, '').trim()
      return NextResponse.json(JSON.parse(clean))
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
