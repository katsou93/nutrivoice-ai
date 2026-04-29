import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, DayLog, FoodEntry, NutritionPlan, ActivityEntry, PlannedMeal } from './nutrition'
export type { ActivityEntry, PlannedMeal }
import { calculatePlan } from './nutrition'

interface AppState {
  // Onboarding
  profile: UserProfile | null
  plan: NutritionPlan | null
  setProfile: (p: UserProfile) => void

  // Daily logs
  logs: Record<string, DayLog>  // key: 'YYYY-MM-DD'
  addEntry: (date: string, entry: FoodEntry) => void
  removeEntry: (date: string, entryId: string) => void
  logWeight: (date: string, kg: number) => void
  logWater: (date: string, glasses: number) => void

  // Today helper
  today: () => string
  todayLog: () => DayLog

  // Gamification
  points: number
  addPoints: (amount: number) => void
  avatarType: AvatarType | null
  setAvatarType: (type: AvatarType) => void
  ownedItems: string[]
  equippedItems: Record<string, string> // category -> itemId
  buyItem: (itemId: string, cost: number) => boolean
  equipItem: (category: string, itemId: string) => void
  unequipItem: (category: string) => void
  streak: number
  lastLogDate: string
  updateStreak: (date: string) => void

  // Health profile
  healthProfile: string
  setHealthProfile: (profile: string) => void

  // Activities / Sport
  activities: Record<string, ActivityEntry[]>  // key: date
  addActivity: (date: string, activity: ActivityEntry) => void
  removeActivity: (date: string, activityId: string) => void
  getTotalBurnedToday: () => number

  // Planned meals
  addPlannedMeal: (date: string, meal: PlannedMeal) => void
  removePlannedMeal: (date: string, mealId: string) => void
  setPlannedNote: (date: string, note: string) => void
  confirmPlannedMeal: (date: string, mealId: string) => void

  // Gamification
  avatarType: AvatarType | null
  setAvatarType: (t: AvatarType) => void
  totalPoints: number
  addPoints: (pts: number) => void
  ownedItems: string[]
  equippedItems: string[]
  purchaseItem: (id: string, price: number) => void
  equipItem: (id: string) => void
  unequipItem: (id: string) => void

  // Settings
  apiKey: string
  setApiKey: (key: string) => void
  guestCode: string
  setGuestCode: (code: string) => void
  isGuest: boolean
  darkMode: boolean
  toggleDarkMode: () => void
}

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      plan: null,
      setProfile: (p) => {
        const plan = calculatePlan(p)
        set({ profile: p, plan })
      },

      logs: {},
      addEntry: (date, entry) =>
        set((s) => ({
          logs: {
            ...s.logs,
            [date]: {
              ...s.logs[date],
              date,
              entries: [...(s.logs[date]?.entries ?? []), entry],
            },
          },
        })),
      removeEntry: (date, id) =>
        set((s) => ({
          logs: {
            ...s.logs,
            [date]: {
              ...s.logs[date],
              entries: (s.logs[date]?.entries ?? []).filter((e) => e.id !== id),
            },
          },
        })),
      logWeight: (date, kg) =>
        set((s) => ({
          logs: { ...s.logs, [date]: { ...s.logs[date], date, entries: s.logs[date]?.entries ?? [], weight: kg } },
        })),
      logWater: (date, glasses) =>
        set((s) => ({
          logs: { ...s.logs, [date]: { ...s.logs[date], date, entries: s.logs[date]?.entries ?? [], water: glasses } },
        })),

      today: todayStr,
      todayLog: () => {
        const d = todayStr()
        return get().logs[d] ?? { date: d, entries: [] }
      },

      // Gamification
      points: 100, // start with 100 points
      addPoints: (amount) => set(s => ({ points: s.points + amount })),
      avatarType: null,
      setAvatarType: (type) => set({ avatarType: type }),
      ownedItems: [],
      equippedItems: {},
      buyItem: (itemId, cost) => {
        const s = useStore.getState()
        if (s.points < cost || s.ownedItems.includes(itemId)) return false
        useStore.setState({ points: s.points - cost, ownedItems: [...s.ownedItems, itemId] })
        return true
      },
      equipItem: (category, itemId) => set(s => ({ equippedItems: { ...s.equippedItems, [category]: itemId } })),
      unequipItem: (category) => set(s => {
        const eq = { ...s.equippedItems }
        delete eq[category]
        return { equippedItems: eq }
      }),
      streak: 0,
      lastLogDate: '',
      updateStreak: (date) => set(s => {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        if (s.lastLogDate === date) return s
        const newStreak = s.lastLogDate === yesterday ? s.streak + 1 : 1
        return { streak: newStreak, lastLogDate: date }
      }),

      healthProfile: '',
      setHealthProfile: (profile) => set({ healthProfile: profile }),

      activities: {},
      addActivity: (date, activity) =>
        set((s) => ({
          activities: {
            ...s.activities,
            [date]: [...(s.activities[date] ?? []), activity],
          },
        })),
      removeActivity: (date, id) =>
        set((s) => ({
          activities: {
            ...s.activities,
            [date]: (s.activities[date] ?? []).filter(a => a.id !== id),
          },
        })),
      getTotalBurnedToday: () => {
        const d = new Date()
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
        return (get().activities[key] ?? []).reduce((sum, a) => sum + a.caloriesBurned, 0)
      },

      addPlannedMeal: (date, meal) =>
        set((s) => ({
          logs: {
            ...s.logs,
            [date]: {
              ...s.logs[date],
              date,
              entries: s.logs[date]?.entries ?? [],
              plannedMeals: [...(s.logs[date]?.plannedMeals ?? []), meal],
            },
          },
        })),
      removePlannedMeal: (date, id) =>
        set((s) => ({
          logs: {
            ...s.logs,
            [date]: {
              ...s.logs[date],
              plannedMeals: (s.logs[date]?.plannedMeals ?? []).filter(m => m.id !== id),
            },
          },
        })),
      setPlannedNote: (date, note) =>
        set((s) => ({
          logs: {
            ...s.logs,
            [date]: { ...s.logs[date], date, entries: s.logs[date]?.entries ?? [], plannedNote: note },
          },
        })),
      confirmPlannedMeal: (date, id) =>
        set((s) => {
          const planned = s.logs[date]?.plannedMeals?.find(m => m.id === id)
          if (!planned) return s
          const entry: FoodEntry = {
            id: crypto.randomUUID(),
            name: planned.name,
            calories: planned.calories,
            protein: planned.protein,
            carbs: planned.carbs,
            fat: planned.fat,
            amount: planned.amount,
            unit: planned.unit,
            mealType: planned.mealType,
            timestamp: new Date().toISOString(),
            confidence: 'estimated',
          }
          return {
            logs: {
              ...s.logs,
              [date]: {
                ...s.logs[date],
                entries: [...(s.logs[date]?.entries ?? []), entry],
                plannedMeals: (s.logs[date]?.plannedMeals ?? []).filter(m => m.id !== id),
              },
            },
          }
        }),

      avatarType: null,
      setAvatarType: (t) => set({ avatarType: t }),
      totalPoints: 0,
      addPoints: (pts) => set(s => ({ totalPoints: s.totalPoints + pts })),
      ownedItems: [],
      equippedItems: [],
      purchaseItem: (id, price) => set(s => {
        if (s.totalPoints < price || s.ownedItems.includes(id)) return s
        return { totalPoints: s.totalPoints - price, ownedItems: [...s.ownedItems, id] }
      }),
      equipItem: (id) => set(s => ({
        equippedItems: s.ownedItems.includes(id) && !s.equippedItems.includes(id)
          ? [...s.equippedItems, id]
          : s.equippedItems
      })),
      unequipItem: (id) => set(s => ({ equippedItems: s.equippedItems.filter(i => i !== id) })),

      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),
      guestCode: '',
      setGuestCode: (code) => set({ guestCode: code, isGuest: !!code }),
      isGuest: false,
      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: 'nutrivoice-store' }
  )
)
