// ============================================================
// NutriVoice AI - Wissenschaftliche Berechnungen
// Quellen: Mifflin et al. (1990), ACSM Guidelines
// ============================================================

export type Goal = 'gain' | 'lose' | 'maintain'
export type Sex = 'male' | 'female'
export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725 | 1.9

export interface UserProfile {
  age: number
  sex: Sex
  weightKg: number
  heightCm: number
  activityLevel: ActivityLevel
  goal: Goal
  targetWeightKg?: number
  weeklyRateKg?: number // 0.25 | 0.5 | 0.75 | 1.0
}

export interface NutritionPlan {
  bmr: number           // Grundumsatz (Mifflin-St-Jeor)
  tdee: number          // Gesamtumsatz
  targetCalories: number
  protein: number       // Gramm
  carbs: number         // Gramm
  fat: number           // Gramm
  weeklyChange: number  // kg/Woche (negativ = abnehmen)
  weeksToGoal: number | null
  warnings: string[]
}

// Mifflin-St-Jeor Formel (1990) - genauer als Harris-Benedict
export function calculateBMR(profile: UserProfile): number {
  const { weightKg, heightCm, age, sex } = profile
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return Math.round(sex === 'male' ? base + 5 : base - 161)
}

export function calculateTDEE(profile: UserProfile): number {
  return Math.round(calculateBMR(profile) * profile.activityLevel)
}

export function calculatePlan(profile: UserProfile): NutritionPlan {
  const warnings: string[] = []
  const bmr = calculateBMR(profile)
  const tdee = calculateTDEE(profile)
  const { weightKg, goal, weeklyRateKg = 0.5, sex } = profile

  // Kalorienziel berechnen
  // 1 kg Körpergewicht ≈ 7700 kcal
  const dailyDelta = Math.round((weeklyRateKg * 7700) / 7)
  let targetCalories: number
  let weeklyChange: number

  if (goal === 'gain') {
    targetCalories = tdee + dailyDelta
    weeklyChange = weeklyRateKg
    if (weeklyRateKg > 1.0) {
      warnings.push('Bei mehr als 1 kg/Woche nimmst du hauptsächlich Fett zu, nicht Muskeln. Empfehlung: max. 0,5–1 kg/Woche.')
    }
    if (dailyDelta > 800) {
      warnings.push(`Bei +${dailyDelta} kcal/Tag wird ein großer Teil als Fett gespeichert. Für Muskelaufbau: +300–500 kcal/Tag empfohlen.`)
    }
  } else if (goal === 'lose') {
    targetCalories = tdee - dailyDelta
    weeklyChange = -weeklyRateKg
    const minCalories = sex === 'male' ? 1500 : 1200
    if (targetCalories < minCalories) {
      targetCalories = minCalories
      warnings.push(`Kalorienminimum von ${minCalories} kcal/Tag aktiviert. Unter diesem Wert ist die Versorgung mit Mikronährstoffen gefährdet.`)
    }
    if (dailyDelta > 750) {
      warnings.push('Mehr als 750 kcal Defizit täglich erhöht den Muskelabbau signifikant. Empfehlung: max. 500–750 kcal/Tag.')
    }
  } else {
    targetCalories = tdee
    weeklyChange = 0
  }

  // Makros nach wissenschaftlichem Konsens
  let proteinPerKg: number
  if (goal === 'gain') {
    proteinPerKg = 2.0  // 1.6–2.2g/kg für Muskelaufbau (Morton et al. 2018)
  } else if (goal === 'lose') {
    proteinPerKg = 2.2  // erhöht beim Abnehmen (Helms et al. 2014)
  } else {
    proteinPerKg = 1.8
  }

  const protein = Math.round(weightKg * proteinPerKg)
  const fat = Math.round(Math.max(weightKg * 1.0, targetCalories * 0.25 / 9)) // min. 1g/kg
  const proteinCalories = protein * 4
  const fatCalories = fat * 9
  const carbCalories = Math.max(0, targetCalories - proteinCalories - fatCalories)
  const carbs = Math.round(carbCalories / 4)

  // Wochenziel
  let weeksToGoal: number | null = null
  if (profile.targetWeightKg && weeklyChange !== 0) {
    const diff = Math.abs(profile.targetWeightKg - weightKg)
    weeksToGoal = Math.ceil(diff / Math.abs(weeklyChange))
  }

  return {
    bmr,
    tdee,
    targetCalories,
    protein,
    carbs,
    fat,
    weeklyChange,
    weeksToGoal,
    warnings,
  }
}

export const PAL_LABELS: Record<ActivityLevel, string> = {
  1.2: 'Kaum Bewegung (Bürojob)',
  1.375: 'Leicht aktiv (1–3× Sport/Woche)',
  1.55: 'Moderat aktiv (3–5× Sport/Woche)',
  1.725: 'Sehr aktiv (6–7× Sport/Woche)',
  1.9: 'Extrem aktiv (körperl. Arbeit + Sport)',
}

export const ACTIVITY_LEVELS: ActivityLevel[] = [1.2, 1.375, 1.55, 1.725, 1.9]

export interface FoodEntry {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  amount: number
  unit: string
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner'
  timestamp: string
  confidence: 'verified' | 'estimated' | 'unknown'
}


export interface PlannedMeal {
  id: string
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner'
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  amount: number
  unit: string
}

export interface DayLog {
  date: string
  entries: FoodEntry[]
  weight?: number
  water?: number // Gläser
  plannedMeals?: PlannedMeal[]
  plannedNote?: string
}

export function sumMacros(entries: FoodEntry[]) {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

export function getMealType(hour: number): FoodEntry['mealType'] {
  if (hour < 11) return 'breakfast'
  if (hour < 14) return 'lunch'
  if (hour < 18) return 'snack'
  return 'dinner'
}

export const MEAL_LABELS = {
  breakfast: '🌅 Frühstück',
  lunch: '☀️ Mittagessen',
  snack: '🍎 Snack',
  dinner: '🌙 Abendessen',
}

// ============================================================
// Timezone-sichere Datumsfunktionen (wichtig für Deutschland UTC+1/+2)
// Immer lokale Zeit nutzen, NIEMALS toISOString() für Datumsgenerierung
// ============================================================

export function localDateKey(date?: Date): string {
  const d = date ?? new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function localNow(): Date {
  return new Date()
}

export function getMealTypeByLocalHour(): FoodEntry['mealType'] {
  const h = new Date().getHours()
  if (h < 11) return 'breakfast'
  if (h < 14) return 'lunch'
  if (h < 18) return 'snack'
  return 'dinner'
}

// MET-Werte für Sportarten (Ainsworth et al. 2011 Compendium)
export interface ActivityEntry {
  id: string
  sport: string
  durationMinutes: number
  intensityMet: number  // MET-Wert
  caloriesBurned: number
  timestamp: string
  date: string
  notes?: string
}

export const SPORTS: { name: string; met: number; emoji: string }[] = [
  { name: 'Laufen (leicht, ~8km/h)', met: 8.0, emoji: '🏃' },
  { name: 'Laufen (schnell, ~12km/h)', met: 11.5, emoji: '🏃' },
  { name: 'Radfahren (moderat)', met: 6.8, emoji: '🚴' },
  { name: 'Radfahren (intensiv)', met: 10.0, emoji: '🚴' },
  { name: 'Schwimmen', met: 6.0, emoji: '🏊' },
  { name: 'Krafttraining', met: 5.0, emoji: '🏋️' },
  { name: 'HIIT / Intervall', met: 10.3, emoji: '⚡' },
  { name: 'Yoga', met: 2.5, emoji: '🧘' },
  { name: 'Spaziergang', met: 3.5, emoji: '🚶' },
  { name: 'Fußball', met: 7.0, emoji: '⚽' },
  { name: 'Tennis', met: 7.3, emoji: '🎾' },
  { name: 'Basketball', met: 6.5, emoji: '🏀' },
  { name: 'Boxen', met: 9.8, emoji: '🥊' },
  { name: 'Tanzen', met: 5.5, emoji: '💃' },
  { name: 'Crossfit', met: 9.0, emoji: '💪' },
  { name: 'Klettern', met: 7.5, emoji: '🧗' },
  { name: 'Anderes', met: 5.0, emoji: '🏃' },
]

export function calculateCaloriesBurned(met: number, durationMinutes: number, weightKg: number): number {
  // Formel: Kalorien = MET × Gewicht(kg) × Zeit(h)
  return Math.round(met * weightKg * (durationMinutes / 60))
}
