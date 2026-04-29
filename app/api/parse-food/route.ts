import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message, context, apiKey } = await req.json()

  if (!apiKey) {
    return NextResponse.json({ error: 'Kein API Key' }, { status: 401 })
  }

  const systemPrompt = `Du bist NutriVoice AI, ein präziser Ernährungsassistent.

AUFGABE: Analysiere Benutzereingaben über gegessene Lebensmittel und gib IMMER JSON zurück.

REGELN:
- Schätze Portionsgrößen realistisch wenn nicht genannt
- Nährwerte basieren auf USDA FoodData Central Daten
- Markiere Schätzungen mit confidence: "estimated", verifizierte Daten mit "verified"
- mealType: breakfast (vor 11 Uhr), lunch (11-14 Uhr), snack (14-18 Uhr), dinner (nach 18 Uhr)
- Aktuelle Uhrzeit: ${new Date().toLocaleTimeString('de-DE')}

KONTEXT DES NUTZERS:
${context || 'Kein Kontext verfügbar'}

Antworte NUR mit gültigem JSON in diesem Format:
{
  "entries": [
    {
      "name": "Lebensmittelname",
      "calories": 250,
      "protein": 15,
      "carbs": 30,
      "fat": 8,
      "amount": 200,
      "unit": "g",
      "mealType": "breakfast",
      "confidence": "estimated"
    }
  ],
  "clarification": null,
  "message": "Kurze Bestätigung auf Deutsch"
}

Falls du Rückfragen hast, setze entries: [] und clarification: "Deine Frage hier".`

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
        messages: [{ role: 'user', content: message }],
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return NextResponse.json({ error: err.error?.message ?? 'API Fehler' }, { status: response.status })
    }

    const data = await response.json()
    const text = data.content[0]?.text ?? '{}'

    try {
      const parsed = JSON.parse(text)
      return NextResponse.json(parsed)
    } catch {
      // Strip markdown fences if present
      const clean = text.replace(/```json\n?|\n?```/g, '').trim()
      const parsed = JSON.parse(clean)
      return NextResponse.json(parsed)
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unbekannter Fehler'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
