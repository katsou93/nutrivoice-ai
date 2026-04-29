import { NextRequest, NextResponse } from 'next/server'

const GUEST_CODE = process.env.GUEST_CODE ?? 'nutrivoice2025'
const SERVER_API_KEY = process.env.ANTHROPIC_API_KEY ?? ''

export async function POST(req: NextRequest) {
  const { message, userProfile, healthProfile, apiKey, guestCode } = await req.json()

  // Auth: eigener Key oder Gastcode
  let key = ''
  if (guestCode && guestCode === GUEST_CODE) {
    key = SERVER_API_KEY
  } else if (apiKey) {
    key = apiKey
  } else {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const systemPrompt = `Du bist NutriVoice AI – ein Ernährungsberater der Mahlzeitenpläne erstellt.

NUTZERPROFIL:
${JSON.stringify(userProfile ?? {}, null, 2)}

GESUNDHEITSPROFIL & BESONDERHEITEN:
${healthProfile || 'Keine Angaben'}

AUFGABE: Erstelle einen konkreten Mahlzeitenplan basierend auf der Anfrage.
Antworte IMMER mit gültigem JSON in diesem Format:

{
  "title": "Titel des Plans",
  "description": "Kurze Beschreibung",
  "days": [
    {
      "date": "YYYY-MM-DD oder 'heute' oder 'morgen' oder 'Tag 1'",
      "label": "Montag, 28. April",
      "meals": [
        {
          "mealType": "breakfast",
          "items": [
            {
              "name": "Haferflocken mit Banane",
              "calories": 380,
              "protein": 12,
              "carbs": 65,
              "fat": 8,
              "amount": 250,
              "unit": "g"
            }
          ],
          "totalCalories": 380
        }
      ],
      "totalCalories": 2100,
      "totalProtein": 150,
      "totalCarbs": 240,
      "totalFat": 70
    }
  ]
}

Heute ist: ${new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
Aktuelle Uhrzeit: ${new Date().toLocaleTimeString('de-DE')}

Berücksichtige unbedingt Allergien und Gesundheitsaspekte aus dem Profil.
Gib KEINE Erklärungen außerhalb des JSON.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
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
