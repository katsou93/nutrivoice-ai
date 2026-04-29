'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { AvatarRenderer } from './AvatarRenderer'
import {
  SHOP_ITEMS, AVATAR_LEVELS, getLevel, getNextLevel,
  getRarityColor, getRarityLabel,
  type AvatarType, type ItemCategory, type ShopItem
} from '@/lib/avatar'
import { ShoppingBag, Star, Lock, CheckCircle, X, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

const AVATAR_OPTIONS: { type: AvatarType; name: string; emoji: string; description: string }[] = [
  { type: 'panda', name: 'Panda', emoji: '🐼', description: 'Süß, stark, zen' },
  { type: 'avocado', name: 'Avocado', emoji: '🥑', description: 'Healthy, trendy, grün' },
  { type: 'pixel', name: 'Pixel-Held', emoji: '🕹️', description: '8-Bit Retro-Gamer' },
  { type: 'blob', name: 'DNA-Blob', emoji: '🧬', description: 'Mysteriös, kosmisch' },
  { type: 'frog', name: 'Frosch', emoji: '🐸', description: 'Entspannt, memeable' },
]

const CATEGORIES: { id: ItemCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'Alle', emoji: '✨' },
  { id: 'outfit', label: 'Outfits', emoji: '👗' },
  { id: 'hat', label: 'Kopf', emoji: '🎩' },
  { id: 'top', label: 'Oberteile', emoji: '👕' },
  { id: 'pants', label: 'Hosen', emoji: '👖' },
  { id: 'gloves', label: 'Handschuhe', emoji: '🧤' },
  { id: 'neck', label: 'Hals', emoji: '📿' },
  { id: 'glasses', label: 'Brillen', emoji: '👓' },
  { id: 'special', label: 'Spezial', emoji: '🌟' },
]

export function AvatarView() {
  const {
    points, avatarType, setAvatarType,
    ownedItems, equippedItems, buyItem, equipItem, unequipItem,
    profile,
  } = useStore()

  const [tab, setTab] = useState<'avatar' | 'shop' | 'collection'>('avatar')
  const [category, setCategory] = useState<ItemCategory | 'all'>('all')
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [choosingAvatar, setChoosingAvatar] = useState(!avatarType)

  const currentAvatarType = avatarType ?? 'panda'
  const level = getLevel(currentAvatarType, points)
  const nextLevel = getNextLevel(currentAvatarType, points)
  const progressPct = nextLevel
    ? Math.round(((points - level.minPoints) / (nextLevel.minPoints - level.minPoints)) * 100)
    : 100

  const filteredItems = SHOP_ITEMS.filter(item =>
    category === 'all' || item.category === category
  )

  const ownedInCategory = SHOP_ITEMS.filter(i =>
    ownedItems.includes(i.id) && (category === 'all' || i.category === category)
  )

  function handleBuy(item: ShopItem) {
    if (ownedItems.includes(item.id)) {
      // Already owned – equip it
      equipItem(item.category, item.id)
      toast.success(`${item.emoji} ${item.name} angelegt!`)
      setSelectedItem(null)
      return
    }
    if (item.unlockLevel && level.level < item.unlockLevel) {
      toast.error(`Level ${item.unlockLevel} erforderlich! Du bist Level ${level.level}.`)
      return
    }
    const success = buyItem(item.id, item.cost)
    if (success) {
      equipItem(item.category, item.id)
      toast.success(`${item.emoji} ${item.name} gekauft & angelegt! -${item.cost} Punkte`)
      setSelectedItem(null)
    } else {
      toast.error(`Nicht genug Punkte! Brauchst ${item.cost}, hast ${points}.`)
    }
  }

  if (choosingAvatar) {
    return (
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-display font-bold text-white mb-2">Wähle deinen Avatar</h1>
        <p className="text-zinc-400 text-sm mb-6">Du kannst ihn später jederzeit wechseln</p>
        <div className="space-y-3">
          {AVATAR_OPTIONS.map(av => (
            <button
              key={av.type}
              onClick={() => { setAvatarType(av.type); setChoosingAvatar(false) }}
              className="w-full flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-brand-500 rounded-2xl p-4 transition-all active:scale-98"
            >
              <div className="w-20 h-20 shrink-0">
                <AvatarRenderer type={av.type} equippedItems={{}} size={80} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-lg">{av.emoji} {av.name}</p>
                <p className="text-zinc-400 text-sm">{av.description}</p>
                <p className="text-brand-400 text-xs mt-1">Level 1: {AVATAR_LEVELS[av.type][0].name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="pb-4">
      {/* Header with avatar preview */}
      <div className="bg-gradient-to-b from-brand-500/20 to-zinc-900 px-4 pt-8 pb-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 bg-zinc-800 rounded-2xl border-2 border-brand-500/30 flex items-center justify-center overflow-hidden">
              <AvatarRenderer type={currentAvatarType} equippedItems={equippedItems} size={112} animated />
            </div>
            <button
              onClick={() => setChoosingAvatar(true)}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs"
            >✏️</button>
          </div>

          {/* Level info */}
          <div className="flex-1 min-w-0">
            <p className="text-zinc-400 text-xs">
              {AVATAR_OPTIONS.find(a => a.type === currentAvatarType)?.name}
            </p>
            <p className="text-white font-display font-bold text-lg leading-tight">
              {level.emoji} {level.name}
            </p>
            <p className="text-brand-400 font-bold">Lvl {level.level} · {points} Punkte</p>

            {nextLevel && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>→ {nextLevel.name}</span>
                  <span>{nextLevel.minPoints - points} Punkte fehlen</span>
                </div>
                <div className="h-1.5 bg-zinc-700 rounded-full">
                  <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${progressPct}%` }}/>
                </div>
              </div>
            )}
            {!nextLevel && <p className="text-amber-400 text-xs mt-1">🏆 Max Level erreicht!</p>}
          </div>
        </div>

        {/* Equipped items preview */}
        {Object.keys(equippedItems).length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {Object.entries(equippedItems).map(([cat, itemId]) => {
              const item = SHOP_ITEMS.find(i => i.id === itemId)
              if (!item) return null
              return (
                <div key={cat} className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1">
                  <span className="text-sm">{item.emoji}</span>
                  <span className="text-zinc-300 text-xs">{item.name}</span>
                  <button onClick={() => unequipItem(cat)} className="text-zinc-600 hover:text-red-400 ml-1">
                    <X size={10}/>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 px-4">
        {[
          { id: 'avatar', label: 'Avatar', emoji: '🎭' },
          { id: 'shop', label: 'Shop', emoji: '🛒' },
          { id: 'collection', label: 'Sammlung', emoji: '📦' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === t.id ? 'text-brand-400 border-b-2 border-brand-500' : 'text-zinc-500'}`}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Avatar Tab - customize */}
      {tab === 'avatar' && (
        <div className="px-4 pt-4 space-y-4">
          <h2 className="text-white font-semibold">Anlegen</h2>
          {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
            const owned = SHOP_ITEMS.filter(i => ownedItems.includes(i.id) && i.category === cat.id)
            if (!owned.length) return null
            const equipped = equippedItems[cat.id]
            return (
              <div key={cat.id}>
                <p className="text-zinc-400 text-xs font-semibold uppercase mb-2">{cat.emoji} {cat.label}</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {equipped && (
                    <button onClick={() => unequipItem(cat.id)}
                      className="shrink-0 w-16 h-16 bg-zinc-800 border border-red-500/30 rounded-xl flex flex-col items-center justify-center text-xs text-zinc-500 hover:border-red-500 transition-colors">
                      <X size={14}/>
                      <span>Ablegen</span>
                    </button>
                  )}
                  {owned.map(item => (
                    <button key={item.id} onClick={() => equipItem(item.category, item.id)}
                      className={`shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center border transition-all ${equippedItems[item.category] === item.id ? 'border-brand-500 bg-brand-500/10' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'}`}>
                      <span className="text-2xl">{item.emoji}</span>
                      {equippedItems[item.category] === item.id && <CheckCircle size={10} className="text-brand-400 mt-0.5"/>}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
          {ownedItems.length === 0 && (
            <div className="text-center py-8 text-zinc-600">
              <ShoppingBag size={32} className="mx-auto mb-2 opacity-40"/>
              <p className="text-sm">Noch keine Items – geh in den Shop! 🛒</p>
            </div>
          )}
        </div>
      )}

      {/* Shop Tab */}
      {tab === 'shop' && (
        <div className="px-4 pt-4">
          {/* Points balance */}
          <div className="flex items-center justify-between mb-4 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
            <span className="text-zinc-400 text-sm">Dein Guthaben</span>
            <span className="text-brand-400 font-bold text-lg">⭐ {points} Punkte</span>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id as any)}
                className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${category === cat.id ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-zinc-700 text-zinc-500'}`}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div className="grid grid-cols-3 gap-3 pb-4">
            {filteredItems.map(item => {
              const owned = ownedItems.includes(item.id)
              const equipped = equippedItems[item.category] === item.id
              const locked = item.unlockLevel ? level.level < item.unlockLevel : false
              const rarityColor = getRarityColor(item.rarity)

              return (
                <button key={item.id} onClick={() => setSelectedItem(item)}
                  className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all active:scale-95 ${
                    equipped ? 'border-brand-500 bg-brand-500/10' :
                    owned ? 'border-zinc-600 bg-zinc-800' :
                    locked ? 'border-zinc-800 bg-zinc-900 opacity-60' :
                    'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                  }`}
                  style={{ borderColor: equipped ? undefined : rarityColor + '44' }}
                >
                  {/* Rarity gem */}
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: rarityColor }}/>

                  {/* Lock icon */}
                  {locked && <Lock size={10} className="absolute top-1.5 left-1.5 text-zinc-600"/>}

                  {/* Owned/equipped badge */}
                  {equipped && <CheckCircle size={10} className="absolute top-1.5 left-1.5 text-brand-400"/>}
                  {owned && !equipped && <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-zinc-500"/>}

                  <span className="text-3xl mb-1">{item.emoji}</span>
                  <p className="text-zinc-300 text-xs text-center leading-tight truncate w-full px-1">{item.name}</p>
                  <p className={`text-xs font-bold mt-0.5 ${owned ? 'text-zinc-500' : 'text-amber-400'}`}>
                    {owned ? '✓' : `⭐${item.cost}`}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Collection Tab */}
      {tab === 'collection' && (
        <div className="px-4 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Deine Sammlung</h2>
            <span className="text-zinc-400 text-sm">{ownedItems.length} / {SHOP_ITEMS.length} Items</span>
          </div>

          {/* Progress bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex justify-between text-xs text-zinc-500 mb-2">
              <span>Sammlungs-Fortschritt</span>
              <span>{Math.round((ownedItems.length / SHOP_ITEMS.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-zinc-700 rounded-full">
              <div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${(ownedItems.length / SHOP_ITEMS.length) * 100}%` }}/>
            </div>
          </div>

          {ownedItems.length === 0 ? (
            <div className="text-center py-8 text-zinc-600">
              <Star size={32} className="mx-auto mb-2 opacity-40"/>
              <p className="text-sm">Noch keine Items gesammelt!</p>
              <p className="text-xs mt-1">Verdiene Punkte durch tägliches Tracken</p>
            </div>
          ) : (
            CATEGORIES.filter(c => c.id !== 'all').map(cat => {
              const owned = SHOP_ITEMS.filter(i => ownedItems.includes(i.id) && i.category === cat.id)
              if (!owned.length) return null
              return (
                <div key={cat.id}>
                  <p className="text-zinc-400 text-xs font-semibold uppercase mb-2">{cat.emoji} {cat.label} ({owned.length})</p>
                  <div className="grid grid-cols-4 gap-2">
                    {owned.map(item => (
                      <div key={item.id}
                        className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 ${equippedItems[item.category] === item.id ? 'border-brand-500 bg-brand-500/10' : 'border-zinc-700 bg-zinc-800'}`}>
                        <span className="text-2xl">{item.emoji}</span>
                        <p className="text-zinc-400 text-xs text-center leading-tight truncate w-full px-0.5" style={{fontSize:9}}>{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 px-4 pb-4"
          onClick={() => setSelectedItem(null)}>
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4"
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{selectedItem.emoji}</span>
                <div>
                  <p className="text-white font-bold text-lg">{selectedItem.name}</p>
                  <p className="text-xs font-semibold" style={{ color: getRarityColor(selectedItem.rarity) }}>
                    ◆ {getRarityLabel(selectedItem.rarity)}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-zinc-500 hover:text-white">
                <X size={20}/>
              </button>
            </div>

            <p className="text-zinc-400 text-sm">{selectedItem.description}</p>

            {selectedItem.unlockLevel && level.level < selectedItem.unlockLevel && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
                <Lock size={14}/>
                <span>Erfordert Level {selectedItem.unlockLevel} ({AVATAR_LEVELS[currentAvatarType][selectedItem.unlockLevel - 1]?.name})</span>
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex-1 bg-zinc-800 rounded-xl p-3 text-center">
                <p className="text-zinc-500 text-xs">Preis</p>
                <p className="text-amber-400 font-bold text-lg">⭐ {selectedItem.cost}</p>
              </div>
              <div className="flex-1 bg-zinc-800 rounded-xl p-3 text-center">
                <p className="text-zinc-500 text-xs">Deine Punkte</p>
                <p className={`font-bold text-lg ${points >= selectedItem.cost ? 'text-brand-400' : 'text-red-400'}`}>⭐ {points}</p>
              </div>
            </div>

            <button
              onClick={() => handleBuy(selectedItem)}
              disabled={!!selectedItem.unlockLevel && level.level < selectedItem.unlockLevel}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: ownedItems.includes(selectedItem.id)
                  ? '#22c55e'
                  : points >= selectedItem.cost
                  ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                  : '#ef4444'
              }}
            >
              {ownedItems.includes(selectedItem.id)
                ? '✅ Anlegen'
                : points >= selectedItem.cost
                ? `🛒 Kaufen für ⭐ ${selectedItem.cost}`
                : `❌ Zu wenig Punkte (${selectedItem.cost - points} fehlen)`
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
