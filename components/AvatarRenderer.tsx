'use client'

import type { AvatarType } from '@/lib/avatar'

interface AvatarProps {
  type: AvatarType
  equippedItems: Record<string, string>
  size?: number
  animated?: boolean
}

// SVG Avatar components for each type
function PandaAvatar({ items, size }: { items: Record<string, string>, size: number }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="60" cy="85" rx="32" ry="28" fill="#f5f5f5" stroke="#1a1a1a" strokeWidth="2"/>
      {/* Black ear patches */}
      <circle cx="30" cy="30" r="16" fill="#1a1a1a"/>
      <circle cx="90" cy="30" r="16" fill="#1a1a1a"/>
      {/* Head */}
      <circle cx="60" cy="48" r="34" fill="#f5f5f5" stroke="#1a1a1a" strokeWidth="2"/>
      {/* Eye patches */}
      <ellipse cx="45" cy="46" rx="12" ry="10" fill="#1a1a1a"/>
      <ellipse cx="75" cy="46" rx="12" ry="10" fill="#1a1a1a"/>
      {/* Eyes */}
      <circle cx="45" cy="46" r="5" fill="white"/>
      <circle cx="75" cy="46" r="5" fill="white"/>
      <circle cx="47" cy="45" r="3" fill="#1a1a1a"/>
      <circle cx="77" cy="45" r="3" fill="#1a1a1a"/>
      <circle cx="48" cy="44" r="1" fill="white"/>
      <circle cx="78" cy="44" r="1" fill="white"/>
      {/* Nose */}
      <ellipse cx="60" cy="56" rx="5" ry="3" fill="#ff9eb5"/>
      {/* Mouth */}
      <path d="M52 62 Q60 70 68 62" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Arms */}
      <ellipse cx="25" cy="88" rx="12" ry="8" fill="#1a1a1a" transform="rotate(-20 25 88)"/>
      <ellipse cx="95" cy="88" rx="12" ry="8" fill="#1a1a1a" transform="rotate(20 95 88)"/>
      {/* Legs */}
      <ellipse cx="45" cy="108" rx="10" ry="8" fill="#1a1a1a"/>
      <ellipse cx="75" cy="108" rx="10" ry="8" fill="#1a1a1a"/>
      {/* Belly circle */}
      <ellipse cx="60" cy="88" rx="18" ry="14" fill="#e8e8e8"/>
    </svg>
  )
}

function AvocadoAvatar({ items, size }: { items: Record<string, string>, size: number }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      {/* Avocado body - outer green */}
      <ellipse cx="60" cy="68" rx="38" ry="46" fill="#2d5a27"/>
      {/* Outer body skin */}
      <ellipse cx="60" cy="65" rx="34" ry="42" fill="#4a7c3f"/>
      {/* Inner flesh */}
      <ellipse cx="60" cy="68" rx="28" ry="36" fill="#c8e6a0"/>
      {/* Pit/seed */}
      <ellipse cx="60" cy="78" rx="16" ry="18" fill="#8B4513"/>
      <ellipse cx="60" cy="76" rx="13" ry="15" fill="#A0522D"/>
      {/* Face on the flesh */}
      {/* Eyes */}
      <circle cx="50" cy="58" r="5" fill="white" stroke="#333" strokeWidth="1"/>
      <circle cx="70" cy="58" r="5" fill="white" stroke="#333" strokeWidth="1"/>
      <circle cx="52" cy="57" r="3" fill="#333"/>
      <circle cx="72" cy="57" r="3" fill="#333"/>
      <circle cx="53" cy="56" r="1" fill="white"/>
      <circle cx="73" cy="56" r="1" fill="white"/>
      {/* Smile */}
      <path d="M50 66 Q60 74 70 66" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
      {/* Rosy cheeks */}
      <circle cx="43" cy="65" r="6" fill="#ff9eb5" opacity="0.5"/>
      <circle cx="77" cy="65" r="6" fill="#ff9eb5" opacity="0.5"/>
      {/* Stem */}
      <rect x="57" y="18" width="6" height="14" rx="3" fill="#5C3D11"/>
      <ellipse cx="60" cy="17" rx="8" ry="5" fill="#2d5a27"/>
      {/* Arms */}
      <ellipse cx="18" cy="75" rx="10" ry="6" fill="#4a7c3f" transform="rotate(-30 18 75)"/>
      <ellipse cx="102" cy="75" rx="10" ry="6" fill="#4a7c3f" transform="rotate(30 102 75)"/>
    </svg>
  )
}

function PixelAvatar({ items, size }: { items: Record<string, string>, size: number }) {
  const s = size
  // 8-bit pixel art style
  const px = (x: number, y: number, w: number, h: number, color: string) =>
    <rect key={`${x}${y}`} x={x*6} y={y*6} width={w*6} height={h*6} fill={color}/>

  return (
    <svg width={s} height={s} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      {/* Pixel body */}
      {/* Head */}
      <rect x="30" y="6" width="60" height="54" fill="#FDBCB4"/>
      {/* Hair */}
      <rect x="30" y="6" width="60" height="12" fill="#4a2800"/>
      {/* Eyes */}
      <rect x="42" y="30" width="12" height="12" fill="white"/>
      <rect x="66" y="30" width="12" height="12" fill="white"/>
      <rect x="48" y="33" width="6" height="6" fill="#1a1aff"/>
      <rect x="72" y="33" width="6" height="6" fill="#1a1aff"/>
      <rect x="48" y="33" width="3" height="3" fill="#000033"/>
      <rect x="72" y="33" width="3" height="3" fill="#000033"/>
      {/* Mouth */}
      <rect x="48" y="48" width="24" height="6" fill="#cc4444"/>
      <rect x="54" y="48" width="12" height="3" fill="white"/>
      {/* Pixel blush */}
      <rect x="36" y="42" width="6" height="6" fill="#ffaaaa"/>
      <rect x="78" y="42" width="6" height="6" fill="#ffaaaa"/>
      {/* Body */}
      <rect x="24" y="60" width="72" height="48" fill="#3355ff"/>
      {/* Arms */}
      <rect x="6" y="60" width="18" height="36" fill="#3355ff"/>
      <rect x="96" y="60" width="18" height="36" fill="#3355ff"/>
      {/* Hands */}
      <rect x="6" y="90" width="18" height="12" fill="#FDBCB4"/>
      <rect x="96" y="90" width="18" height="12" fill="#FDBCB4"/>
      {/* Legs */}
      <rect x="30" y="108" width="24" height="12" fill="#222266"/>
      <rect x="66" y="108" width="24" height="12" fill="#222266"/>
      {/* Pixel shine */}
      <rect x="54" y="30" width="3" height="3" fill="white"/>
      <rect x="78" y="30" width="3" height="3" fill="white"/>
    </svg>
  )
}

function BlobAvatar({ items, size }: { items: Record<string, string>, size: number }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      {/* Organic blob shape */}
      <path d="M60 10 C85 10 105 30 108 55 C112 82 95 108 68 112 C42 116 18 98 14 72 C10 46 35 10 60 10Z"
        fill="#7C3AED"/>
      {/* Inner glow */}
      <path d="M60 18 C82 18 100 36 102 58 C104 80 88 102 64 105 C40 108 20 92 18 70 C16 48 38 18 60 18Z"
        fill="#8B5CF6"/>
      {/* DNA pattern inside */}
      <path d="M40 45 Q60 55 80 45" fill="none" stroke="#a78bfa" strokeWidth="2" opacity="0.6"/>
      <path d="M40 60 Q60 50 80 60" fill="none" stroke="#a78bfa" strokeWidth="2" opacity="0.6"/>
      <path d="M40 75 Q60 65 80 75" fill="none" stroke="#a78bfa" strokeWidth="2" opacity="0.6"/>
      {/* Eyes */}
      <circle cx="46" cy="50" r="8" fill="white"/>
      <circle cx="74" cy="50" r="8" fill="white"/>
      <circle cx="48" cy="49" r="5" fill="#1e1b4b"/>
      <circle cx="76" cy="49" r="5" fill="#1e1b4b"/>
      <circle cx="49" cy="47" r="2" fill="white"/>
      <circle cx="77" cy="47" r="2" fill="white"/>
      {/* Tentacle arms */}
      <path d="M14 72 Q5 60 10 50 Q15 40 20 55" fill="none" stroke="#7C3AED" strokeWidth="8" strokeLinecap="round"/>
      <path d="M108 55 Q118 43 115 33 Q112 23 105 38" fill="none" stroke="#7C3AED" strokeWidth="8" strokeLinecap="round"/>
      {/* Smile */}
      <path d="M48 68 Q60 78 72 68" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Sparkles */}
      <circle cx="25" cy="30" r="2" fill="#c4b5fd"/>
      <circle cx="95" cy="25" r="2" fill="#c4b5fd"/>
      <circle cx="20" cy="90" r="2" fill="#c4b5fd"/>
    </svg>
  )
}

function FrogAvatar({ items, size }: { items: Record<string, string>, size: number }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="60" cy="82" rx="36" ry="30" fill="#22c55e"/>
      {/* Head */}
      <ellipse cx="60" cy="50" rx="38" ry="34" fill="#22c55e"/>
      {/* Eye bumps */}
      <circle cx="38" cy="30" r="14" fill="#22c55e" stroke="#16a34a" strokeWidth="1"/>
      <circle cx="82" cy="30" r="14" fill="#22c55e" stroke="#16a34a" strokeWidth="1"/>
      {/* Eyes */}
      <circle cx="38" cy="29" r="11" fill="#fef9c3"/>
      <circle cx="82" cy="29" r="11" fill="#fef9c3"/>
      <circle cx="38" cy="30" r="7" fill="#1a1a00"/>
      <circle cx="82" cy="30" r="7" fill="#1a1a00"/>
      <circle cx="40" cy="28" r="3" fill="white"/>
      <circle cx="84" cy="28" r="3" fill="white"/>
      {/* Nostirls */}
      <circle cx="53" cy="52" r="3" fill="#16a34a"/>
      <circle cx="67" cy="52" r="3" fill="#16a34a"/>
      {/* Mouth - big frog smile */}
      <path d="M38 62 Q60 80 82 62" fill="#dc2626" stroke="#16a34a" strokeWidth="1.5"/>
      <path d="M42 64 Q60 78 78 64" fill="#ef4444"/>
      {/* Tongue */}
      <ellipse cx="60" cy="72" rx="12" ry="6" fill="#f87171"/>
      {/* Belly */}
      <ellipse cx="60" cy="82" rx="24" ry="20" fill="#86efac"/>
      {/* Arms */}
      <path d="M24 82 Q12 90 14 100 Q16 108 26 105" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round"/>
      <path d="M96 82 Q108 90 106 100 Q104 108 94 105" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round"/>
      {/* Feet */}
      <ellipse cx="40" cy="108" rx="16" ry="8" fill="#22c55e"/>
      <ellipse cx="80" cy="108" rx="16" ry="8" fill="#22c55e"/>
      {/* Toe details */}
      <circle cx="30" cy="108" r="4" fill="#16a34a"/>
      <circle cx="40" cy="112" r="4" fill="#16a34a"/>
      <circle cx="50" cy="108" r="4" fill="#16a34a"/>
      <circle cx="70" cy="108" r="4" fill="#16a34a"/>
      <circle cx="80" cy="112" r="4" fill="#16a34a"/>
      <circle cx="90" cy="108" r="4" fill="#16a34a"/>
    </svg>
  )
}

// Item overlay - renders equipped items on top of avatar
function ItemOverlay({ items, size }: { items: Record<string, string>, size: number }) {
  const overlays: React.ReactNode[] = []

  // Hat overlay
  if (items.hat) {
    const hatEmojis: Record<string, string> = {
      hat_tophat: '🎩', hat_crown: '👑', hat_cap: '🧢', hat_witch: '🧙',
      hat_chef: '👨‍🍳', hat_cowboy: '🤠', hat_santa: '🎅', hat_graduation: '🎓',
      hat_party: '🎉', hat_beanie: '🧶', hat_halo: '😇', hat_devil: '😈',
      hat_fedora: '🕵️', hat_flower: '🌸', hat_propeller: '🎡', hat_mohawk: '🤘',
      hat_mushroom: '🍄', hat_lightning: '⚡', hat_fez: '🎭', hat_afro: '🎵',
      hat_jester: '🃏', hat_viking: '⛑️', hat_hardhat: '⛑️', hat_pharaoh: '𓋹',
    }
    const emoji = hatEmojis[items.hat] ?? '🎩'
    overlays.push(
      <text key="hat" x="60" y="20" textAnchor="middle" fontSize="28" style={{fontSize: 28}}>
        {emoji}
      </text>
    )
  }

  // Glasses overlay
  if (items.glasses) {
    const glassEmojis: Record<string, string> = {
      glasses_nerd: '🤓', glasses_sunglasses: '😎', glasses_monocle: '🧐',
      glasses_vr: '🥽', glasses_heart: '💕', glasses_lab: '🥼',
    }
    const emoji = glassEmojis[items.glasses] ?? '👓'
    overlays.push(
      <text key="glasses" x="60" y="58" textAnchor="middle" fontSize="20">
        {emoji}
      </text>
    )
  }

  // Special item overlay
  if (items.special) {
    overlays.push(
      <text key="special" x="95" y="100" textAnchor="middle" fontSize="22">
        {'📱'}
      </text>
    )
  }

  // Neck overlay
  if (items.neck) {
    const neckEmojis: Record<string, string> = {
      neck_bowtie: '🎀', neck_necktie: '👔', neck_scarf: '🧣',
      neck_gold: '📿', neck_lei: '🌺', neck_medal: '🥇',
    }
    const emoji = neckEmojis[items.neck] ?? '📿'
    overlays.push(
      <text key="neck" x="60" y="75" textAnchor="middle" fontSize="18">
        {emoji}
      </text>
    )
  }

  if (!overlays.length) return null

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {overlays}
    </svg>
  )
}

export function AvatarRenderer({ type, equippedItems, size = 120, animated = false }: AvatarProps) {
  const avatarComponents: Record<AvatarType, React.ComponentType<{items: Record<string, string>, size: number}>> = {
    panda: PandaAvatar,
    avocado: AvocadoAvatar,
    pixel: PixelAvatar,
    blob: BlobAvatar,
    frog: FrogAvatar,
  }

  const AvatarComponent = avatarComponents[type]

  return (
    <div
      className={`relative inline-block ${animated ? 'float' : ''}`}
      style={{ width: size, height: size }}
    >
      <AvatarComponent items={equippedItems} size={size} />
      <ItemOverlay items={equippedItems} size={size} />
    </div>
  )
}
