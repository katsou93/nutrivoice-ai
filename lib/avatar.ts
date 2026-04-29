// ============================================================
// NutriVoice AI – Avatar & Gamification System
// ============================================================

export type AvatarType = 'panda' | 'avocado' | 'pixel' | 'blob' | 'frog'
export type ItemCategory = 'outfit' | 'hat' | 'top' | 'pants' | 'gloves' | 'neck' | 'glasses' | 'special'
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface ShopItem {
  id: string
  name: string
  category: ItemCategory
  rarity: ItemRarity
  cost: number
  emoji: string
  description: string
  color?: string
  unlockLevel?: number
  avatarOnly?: AvatarType[] // null = all avatars
}

export interface AvatarLevel {
  level: number
  name: string
  minPoints: number
  emoji: string
}

// ── AVATAR-SPECIFIC LEVEL PROGRESSIONS ──────────────────────

export const AVATAR_LEVELS: Record<AvatarType, AvatarLevel[]> = {
  panda: [
    { level: 1, name: 'Baby Panda', minPoints: 0, emoji: '🐼' },
    { level: 2, name: 'Bambus-Knabberer', minPoints: 200, emoji: '🎋' },
    { level: 3, name: 'Rollender Panda', minPoints: 500, emoji: '⚫' },
    { level: 4, name: 'Kung-Fu Panda', minPoints: 1000, emoji: '🥋' },
    { level: 5, name: 'Chi-Meister', minPoints: 2000, emoji: '☯️' },
    { level: 6, name: 'Bambus-Weise', minPoints: 3500, emoji: '🏔️' },
    { level: 7, name: 'Legendärer Panda', minPoints: 5500, emoji: '👑' },
    { level: 8, name: 'Ewiger Panda-Geist', minPoints: 8000, emoji: '✨' },
  ],
  avocado: [
    { level: 1, name: 'Unreife Avocado', minPoints: 0, emoji: '🥑' },
    { level: 2, name: 'Leicht Weich', minPoints: 200, emoji: '💚' },
    { level: 3, name: 'Perfekt Reif', minPoints: 500, emoji: '🌟' },
    { level: 4, name: 'Guacamole-König', minPoints: 1000, emoji: '🫙' },
    { level: 5, name: 'Toast-Overlord', minPoints: 2000, emoji: '🍞' },
    { level: 6, name: 'Superfood-Guru', minPoints: 3500, emoji: '🌿' },
    { level: 7, name: 'Avo-Legend', minPoints: 5500, emoji: '💫' },
    { level: 8, name: 'Ewige Avocado', minPoints: 8000, emoji: '♾️' },
  ],
  pixel: [
    { level: 1, name: '8-Bit Newbie', minPoints: 0, emoji: '🕹️' },
    { level: 2, name: '16-Bit Läufer', minPoints: 200, emoji: '👾' },
    { level: 3, name: '32-Bit Athlet', minPoints: 500, emoji: '🏃' },
    { level: 4, name: '64-Bit Krieger', minPoints: 1000, emoji: '⚔️' },
    { level: 5, name: 'HD Held', minPoints: 2000, emoji: '🦸' },
    { level: 6, name: '4K Legende', minPoints: 3500, emoji: '🎮' },
    { level: 7, name: 'Ray-Tracing God', minPoints: 5500, emoji: '💻' },
    { level: 8, name: 'Unendliche FPS', minPoints: 8000, emoji: '∞' },
  ],
  blob: [
    { level: 1, name: 'Mikrozelle', minPoints: 0, emoji: '🔬' },
    { level: 2, name: 'Erste Teilung', minPoints: 200, emoji: '🧬' },
    { level: 3, name: 'Organismus', minPoints: 500, emoji: '🦠' },
    { level: 4, name: 'Mutation', minPoints: 1000, emoji: '⚗️' },
    { level: 5, name: 'Bewusstes Wesen', minPoints: 2000, emoji: '🧠' },
    { level: 6, name: 'Überorganismus', minPoints: 3500, emoji: '🌌' },
    { level: 7, name: 'Kosmische DNA', minPoints: 5500, emoji: '🌠' },
    { level: 8, name: 'Urzelle aller Welten', minPoints: 8000, emoji: '🌍' },
  ],
  frog: [
    { level: 1, name: 'Kaulquappe', minPoints: 0, emoji: '🐸' },
    { level: 2, name: 'Mini-Frosch', minPoints: 200, emoji: '🌿' },
    { level: 3, name: 'Laubfrosch', minPoints: 500, emoji: '🍃' },
    { level: 4, name: 'Sumpf-Boss', minPoints: 1000, emoji: '🏊' },
    { level: 5, name: 'Pepe der Weise', minPoints: 2000, emoji: '🎭' },
    { level: 6, name: 'Regen-König', minPoints: 3500, emoji: '🌧️' },
    { level: 7, name: 'Frosch-Legende', minPoints: 5500, emoji: '🏆' },
    { level: 8, name: 'Ewiger Frosch-Gott', minPoints: 8000, emoji: '✨' },
  ],
}

export function getLevel(avatarType: AvatarType, points: number): AvatarLevel {
  const levels = AVATAR_LEVELS[avatarType]
  let current = levels[0]
  for (const l of levels) {
    if (points >= l.minPoints) current = l
  }
  return current
}

export function getNextLevel(avatarType: AvatarType, points: number): AvatarLevel | null {
  const levels = AVATAR_LEVELS[avatarType]
  const cur = getLevel(avatarType, points)
  const next = levels.find(l => l.minPoints > points)
  return next ?? null
}

// ── ITEM CATALOG ─────────────────────────────────────────────

export const SHOP_ITEMS: ShopItem[] = [
  // ── OUTFITS (complete looks) – 25 items ──
  { id: 'outfit_chef', name: 'Koch-Meister', category: 'outfit', rarity: 'rare', cost: 300, emoji: '👨‍🍳', description: 'Klassische weiße Kochuniform mit Knöpfen', color: '#ffffff' },
  { id: 'outfit_astronaut', name: 'Astronaut', category: 'outfit', rarity: 'epic', cost: 600, emoji: '🧑‍🚀', description: 'NASA-Raumanzug für interstellare Fitness', color: '#c0c0c0' },
  { id: 'outfit_ninja', name: 'Ninja', category: 'outfit', rarity: 'epic', cost: 550, emoji: '🥷', description: 'Schwarzes Ninja-Gewand für stille Krieger', color: '#1a1a1a' },
  { id: 'outfit_viking', name: 'Wikinger', category: 'outfit', rarity: 'legendary', cost: 900, emoji: '⚔️', description: 'Nordische Krieger-Rüstung mit Pelz', color: '#8B4513', unlockLevel: 4 },
  { id: 'outfit_samurai', name: 'Samurai', category: 'outfit', rarity: 'legendary', cost: 950, emoji: '🗡️', description: 'Traditionelle japanische Samurai-Rüstung', color: '#DC143C', unlockLevel: 5 },
  { id: 'outfit_clown', name: 'Clown', category: 'outfit', rarity: 'common', cost: 150, emoji: '🤡', description: 'Buntes Clown-Outfit mit Pompons', color: '#FF4500' },
  { id: 'outfit_suit', name: 'Business-Anzug', category: 'outfit', rarity: 'rare', cost: 350, emoji: '💼', description: 'Schicker Maßanzug für das Corporate Life', color: '#2F4F4F' },
  { id: 'outfit_wizard', name: 'Zauberer', category: 'outfit', rarity: 'epic', cost: 700, emoji: '🧙', description: 'Magisches Gewand mit Sternen und Monden', color: '#4B0082' },
  { id: 'outfit_knight', name: 'Ritter', category: 'outfit', rarity: 'epic', cost: 650, emoji: '🛡️', description: 'Glänzende Ritter-Vollrüstung', color: '#A9A9A9' },
  { id: 'outfit_pirate', name: 'Pirat', category: 'outfit', rarity: 'rare', cost: 400, emoji: '🏴‍☠️', description: 'Klassisches Piraten-Outfit mit Mantel', color: '#8B0000' },
  { id: 'outfit_cowboy', name: 'Cowboy', category: 'outfit', rarity: 'rare', cost: 380, emoji: '🤠', description: 'Western-Outfit mit Lederweste', color: '#D2691E' },
  { id: 'outfit_superhero', name: 'Superheld', category: 'outfit', rarity: 'legendary', cost: 1000, emoji: '🦸', description: 'Cape und Anzug für echte Helden', color: '#0000FF', unlockLevel: 5 },
  { id: 'outfit_doctor', name: 'Arzt', category: 'outfit', rarity: 'common', cost: 200, emoji: '🥼', description: 'Weißer Arztkittel mit Stethoskop', color: '#F0F8FF' },
  { id: 'outfit_prison', name: 'Sträfling', category: 'outfit', rarity: 'common', cost: 120, emoji: '⛓️', description: 'Klassisches schwarz-weißes Sträfling-Look', color: '#696969' },
  { id: 'outfit_santa', name: 'Weihnachtsmann', category: 'outfit', rarity: 'rare', cost: 450, emoji: '🎅', description: 'Roter Weihnachtsmann-Anzug mit weißem Fell', color: '#FF0000' },
  { id: 'outfit_detective', name: 'Detektiv', category: 'outfit', rarity: 'rare', cost: 420, emoji: '🔍', description: 'Sherlock Holmes Trenchcoat-Look', color: '#6B6B6B' },
  { id: 'outfit_hawaiian', name: 'Hawaii-Hemd', category: 'outfit', rarity: 'common', cost: 100, emoji: '🌺', description: 'Buntes Blumen-Hemd für Urlaubsstimmung', color: '#FF69B4' },
  { id: 'outfit_royal', name: 'König', category: 'outfit', rarity: 'legendary', cost: 1200, emoji: '👑', description: 'Königliche Roben mit Hermelin', color: '#FFD700', unlockLevel: 6 },
  { id: 'outfit_sports', name: 'Sportstar', category: 'outfit', rarity: 'common', cost: 180, emoji: '⚽', description: 'Modernes Sport-Trikot', color: '#00FF00' },
  { id: 'outfit_hacker', name: 'Hacker', category: 'outfit', rarity: 'epic', cost: 580, emoji: '💻', description: 'Hoodie mit Matrixcode-Muster', color: '#00FF00' },
  { id: 'outfit_caveman', name: 'Höhlenmensch', category: 'outfit', rarity: 'common', cost: 130, emoji: '🦴', description: 'Primitives Fell-Gewand', color: '#DEB887' },
  { id: 'outfit_pharaoh', name: 'Pharao', category: 'outfit', rarity: 'legendary', cost: 1100, emoji: '𓂀', description: 'Ägyptischer Herrschergewand mit Gold', color: '#DAA520', unlockLevel: 6 },
  { id: 'outfit_robot', name: 'Roboter', category: 'outfit', rarity: 'epic', cost: 750, emoji: '🤖', description: 'Metall-Exoskelett Roboter-Anzug', color: '#708090' },
  { id: 'outfit_vampire', name: 'Vampir', category: 'outfit', rarity: 'rare', cost: 460, emoji: '🧛', description: 'Gotischer schwarzer Vampir-Umhang', color: '#4a0030' },
  { id: 'outfit_rainbow', name: 'Regenbogen', category: 'outfit', rarity: 'epic', cost: 620, emoji: '🌈', description: 'Komplett buntes Regenbogen-Outfit', color: '#FF0000' },

  // ── HATS – 25 items ──
  { id: 'hat_tophat', name: 'Zylinder', category: 'hat', rarity: 'rare', cost: 280, emoji: '🎩', description: 'Eleganter schwarzer Zylinder' },
  { id: 'hat_crown', name: 'Goldkrone', category: 'hat', rarity: 'legendary', cost: 800, emoji: '👑', description: 'Echte Königskrone aus Gold', unlockLevel: 4 },
  { id: 'hat_cap', name: 'Snapback', category: 'hat', rarity: 'common', cost: 80, emoji: '🧢', description: 'Trendige Snapback-Cap' },
  { id: 'hat_viking', name: 'Wikinger-Helm', category: 'hat', rarity: 'epic', cost: 500, emoji: '⛑️', description: 'Nordischer Helm mit Hörnern' },
  { id: 'hat_witch', name: 'Hexenhut', category: 'hat', rarity: 'rare', cost: 250, emoji: '🧙', description: 'Klassischer spitzer Hexenhut' },
  { id: 'hat_chef', name: 'Kochmütze', category: 'hat', rarity: 'common', cost: 100, emoji: '👨‍🍳', description: 'Hohe weiße Kochmütze' },
  { id: 'hat_cowboy', name: 'Cowboy-Hut', category: 'hat', rarity: 'rare', cost: 230, emoji: '🤠', description: 'Breiter westlicher Cowboy-Hut' },
  { id: 'hat_santa', name: 'Nikolausmütze', category: 'hat', rarity: 'common', cost: 90, emoji: '🎅', description: 'Rote Nikolausmütze mit Bommel' },
  { id: 'hat_graduation', name: 'Doktorhut', category: 'hat', rarity: 'rare', cost: 300, emoji: '🎓', description: 'Akademischer Doktorhut' },
  { id: 'hat_hardhat', name: 'Bauhelm', category: 'hat', rarity: 'common', cost: 70, emoji: '⛑️', description: 'Solider gelber Bauarbeiterhelm' },
  { id: 'hat_party', name: 'Party-Hut', category: 'hat', rarity: 'common', cost: 60, emoji: '🎉', description: 'Bunter Kegel-Party-Hut' },
  { id: 'hat_viking2', name: 'Spezialist-Helm', category: 'hat', rarity: 'epic', cost: 480, emoji: '🪖', description: 'Moderner taktischer Militärhelm' },
  { id: 'hat_beanie', name: 'Beanie', category: 'hat', rarity: 'common', cost: 75, emoji: '🧶', description: 'Gestrickte Wintermütze' },
  { id: 'hat_halo', name: 'Heiligenschein', category: 'hat', rarity: 'epic', cost: 550, emoji: '😇', description: 'Goldener Heiligenschein' },
  { id: 'hat_devil', name: 'Teufelshörner', category: 'hat', rarity: 'rare', cost: 320, emoji: '😈', description: 'Rote Teufelshörner' },
  { id: 'hat_fedora', name: 'Fedora', category: 'hat', rarity: 'rare', cost: 260, emoji: '🕵️', description: 'Klassischer brauner Fedora-Hut' },
  { id: 'hat_fez', name: 'Fez', category: 'hat', rarity: 'rare', cost: 240, emoji: '🎭', description: 'Roter türkischer Fez' },
  { id: 'hat_flower', name: 'Blumenkranz', category: 'hat', rarity: 'common', cost: 85, emoji: '🌸', description: 'Romantischer Blumenkranz' },
  { id: 'hat_propeller', name: 'Propeller-Mütze', category: 'hat', rarity: 'common', cost: 95, emoji: '🎡', description: 'Kindliche Mütze mit Propeller oben' },
  { id: 'hat_pharaoh', name: 'Nemes-Kopftuch', category: 'hat', rarity: 'legendary', cost: 900, emoji: '𓋹', description: 'Ägyptisches Pharao-Kopftuch', unlockLevel: 5 },
  { id: 'hat_mohawk', name: 'Iro', category: 'hat', rarity: 'rare', cost: 270, emoji: '🤘', description: 'Bunter Punk-Irokese' },
  { id: 'hat_mushroom', name: 'Pilz-Hut', category: 'hat', rarity: 'epic', cost: 490, emoji: '🍄', description: 'Mario-inspirierter Pilzhut' },
  { id: 'hat_afro', name: 'Afro', category: 'hat', rarity: 'rare', cost: 290, emoji: '🎵', description: 'Riesige fluffige Afro-Frisur' },
  { id: 'hat_jester', name: 'Narrenkappe', category: 'hat', rarity: 'rare', cost: 310, emoji: '🃏', description: 'Mittelalterliche Narrenkappe mit Schellen' },
  { id: 'hat_lightning', name: 'Blitz-Stirnband', category: 'hat', rarity: 'legendary', cost: 750, emoji: '⚡', description: 'Leuchtendes Energie-Stirnband', unlockLevel: 4 },

  // ── TOPS – 25 items ──
  { id: 'top_muscle', name: 'Muscle-Shirt', category: 'top', rarity: 'common', cost: 80, emoji: '💪', description: 'Ärmelloses Fitness-Shirt' },
  { id: 'top_tuxedo', name: 'Smoking-Hemd', category: 'top', rarity: 'rare', cost: 280, emoji: '🤵', description: 'Elegantes weißes Tuxedo-Hemd' },
  { id: 'top_hoodie', name: 'Oversized Hoodie', category: 'top', rarity: 'common', cost: 110, emoji: '👕', description: 'Gemütlicher Oversize-Hoodie' },
  { id: 'top_armor', name: 'Kettenhemd', category: 'top', rarity: 'epic', cost: 520, emoji: '⚔️', description: 'Mittelalterliches Kettenpanzer-Hemd' },
  { id: 'top_hawaiian', name: 'Hawaii-Shirt', category: 'top', rarity: 'common', cost: 75, emoji: '🌺', description: 'Buntes Blumen-Hemd' },
  { id: 'top_leather', name: 'Lederjacke', category: 'top', rarity: 'rare', cost: 340, emoji: '🏍️', description: 'Schwarze Rocker-Lederjacke' },
  { id: 'top_uniform', name: 'Military-Shirt', category: 'top', rarity: 'rare', cost: 260, emoji: '🎖️', description: 'Camouflage Militär-Hemd' },
  { id: 'top_formal', name: 'Business-Hemd', category: 'top', rarity: 'common', cost: 120, emoji: '👔', description: 'Bügelfreies Business-Hemd' },
  { id: 'top_stripe', name: 'Ringelshirt', category: 'top', rarity: 'common', cost: 90, emoji: '⚡', description: 'Französisches Marinière-Ringelshirt' },
  { id: 'top_cape', name: 'Helden-Cape', category: 'top', rarity: 'epic', cost: 600, emoji: '🦸', description: 'Flatterndes Superhelden-Cape' },
  { id: 'top_kimono', name: 'Kimono', category: 'top', rarity: 'rare', cost: 380, emoji: '🥋', description: 'Traditioneller japanischer Kimono-Oberteil' },
  { id: 'top_santa', name: 'Nikolaus-Jacke', category: 'top', rarity: 'common', cost: 100, emoji: '🎅', description: 'Rote Weihnachtsmann-Jacke' },
  { id: 'top_rainbow', name: 'Regenbogen-Pulli', category: 'top', rarity: 'rare', cost: 200, emoji: '🌈', description: 'Bunter Regenbogen-Pullover' },
  { id: 'top_torn', name: 'Zerrissenes Shirt', category: 'top', rarity: 'common', cost: 60, emoji: '🧟', description: 'Zerrissenes Zombie-Style-Shirt' },
  { id: 'top_gold', name: 'Gold-Kettenshirt', category: 'top', rarity: 'legendary', cost: 800, emoji: '✨', description: 'Shirt mit echten Goldketten', unlockLevel: 4 },
  { id: 'top_neon', name: 'Neon-Tank', category: 'top', rarity: 'rare', cost: 230, emoji: '💡', description: 'Leuchtend neon-grünes Tank-Top' },
  { id: 'top_turtleneck', name: 'Rollkragen', category: 'top', rarity: 'common', cost: 95, emoji: '🖤', description: 'Schwarzer Steve-Jobs-Rollkragen' },
  { id: 'top_fur', name: 'Pelzmantel', category: 'top', rarity: 'legendary', cost: 1000, emoji: '❄️', description: 'Luxuriöser weißer Pelzmantel', unlockLevel: 5 },
  { id: 'top_pirate', name: 'Piraten-Weste', category: 'top', rarity: 'rare', cost: 300, emoji: '🏴‍☠️', description: 'Ausgeblichene Piraten-Weste' },
  { id: 'top_polo', name: 'Polo-Shirt', category: 'top', rarity: 'common', cost: 85, emoji: '⛳', description: 'Klassisches Golf-Polo' },
  { id: 'top_wrestling', name: 'Wrestling-Weste', category: 'top', rarity: 'epic', cost: 450, emoji: '🤼', description: 'WWE-Style Wrestling-Outfit-Top' },
  { id: 'top_flannel', name: 'Flanell-Hemd', category: 'top', rarity: 'common', cost: 70, emoji: '🪵', description: 'Kariertes Holzfäller-Flanellhemd' },
  { id: 'top_dress', name: 'Abendkleid-Top', category: 'top', rarity: 'rare', cost: 350, emoji: '👗', description: 'Elegantes Abendkleid-Oberteil' },
  { id: 'top_matrix', name: 'Matrix-Mantel', category: 'top', rarity: 'legendary', cost: 950, emoji: '💊', description: 'Langer schwarzer Matrix-Duster', unlockLevel: 6 },
  { id: 'top_tank_usa', name: 'USA-Tank', category: 'top', rarity: 'common', cost: 65, emoji: '🇺🇸', description: 'Patriotisches Amerika-Tank-Top' },

  // ── PANTS – 25 items ──
  { id: 'pants_jeans', name: 'Ripped Jeans', category: 'pants', rarity: 'common', cost: 100, emoji: '👖', description: 'Angesagte zerrissene Jeans' },
  { id: 'pants_tuxedo', name: 'Smoking-Hose', category: 'pants', rarity: 'rare', cost: 250, emoji: '🤵', description: 'Elegante Smoking-Hose mit Seitenstreifen' },
  { id: 'pants_shorts', name: 'Cargo-Shorts', category: 'pants', rarity: 'common', cost: 80, emoji: '🩳', description: 'Khaki Cargo-Shorts mit Taschen' },
  { id: 'pants_armor', name: 'Beinschienen', category: 'pants', rarity: 'epic', cost: 480, emoji: '⚔️', description: 'Mittelalterliche Ritter-Beinschienen' },
  { id: 'pants_balloon', name: 'Pumphose', category: 'pants', rarity: 'rare', cost: 220, emoji: '🎪', description: 'Bunte orientalische Pumphose' },
  { id: 'pants_leather', name: 'Lederhose', category: 'pants', rarity: 'rare', cost: 300, emoji: '🏍️', description: 'Schwarze Biker-Lederhose' },
  { id: 'pants_sweatpants', name: 'Sweatpants', category: 'pants', rarity: 'common', cost: 70, emoji: '🛋️', description: 'Gemütliche graue Sweatpants' },
  { id: 'pants_kilt', name: 'Kilt', category: 'pants', rarity: 'rare', cost: 280, emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', description: 'Schottischer Karo-Kilt' },
  { id: 'pants_uniform', name: 'Tarnhose', category: 'pants', rarity: 'rare', cost: 240, emoji: '🎖️', description: 'Militärische Camouflage-Hose' },
  { id: 'pants_tutu', name: 'Ballett-Tutu', category: 'pants', rarity: 'epic', cost: 420, emoji: '🩰', description: 'Fluffiges pinkes Ballett-Tutu' },
  { id: 'pants_track', name: 'Trainingsanzug', category: 'pants', rarity: 'common', cost: 90, emoji: '🏃', description: 'Klassische Trainingsanzug-Hose mit Streifen' },
  { id: 'pants_yoga', name: 'Yoga-Leggings', category: 'pants', rarity: 'common', cost: 110, emoji: '🧘', description: 'Dehnbare Yoga-Leggings' },
  { id: 'pants_disco', name: 'Schlaghose', category: 'pants', rarity: 'rare', cost: 260, emoji: '🕺', description: '70er-Jahre Glitzer-Schlaghose' },
  { id: 'pants_surfer', name: 'Boardshorts', category: 'pants', rarity: 'common', cost: 85, emoji: '🏄', description: 'Bunte Surf-Boardshorts' },
  { id: 'pants_golden', name: 'Gold-Hose', category: 'pants', rarity: 'legendary', cost: 900, emoji: '✨', description: 'Glänzende Gold-Metallic-Hose', unlockLevel: 5 },
  { id: 'pants_ninja', name: 'Ninja-Hose', category: 'pants', rarity: 'rare', cost: 230, emoji: '🥷', description: 'Lockere schwarze Ninja-Hose' },
  { id: 'pants_plaid', name: 'Karos', category: 'pants', rarity: 'common', cost: 75, emoji: '🟥', description: 'Knallige Karo-Hose' },
  { id: 'pants_space', name: 'Space-Leggings', category: 'pants', rarity: 'epic', cost: 500, emoji: '🌌', description: 'Galaxie-Print Weltraum-Leggings' },
  { id: 'pants_wizard', name: 'Zauberer-Robe', category: 'pants', rarity: 'epic', cost: 460, emoji: '🧙', description: 'Unteres Teil einer Zauberer-Robe' },
  { id: 'pants_prison', name: 'Sträflings-Hose', category: 'pants', rarity: 'common', cost: 60, emoji: '⛓️', description: 'Schwarz-weiß gestreifte Sträflingshose' },
  { id: 'pants_formal', name: 'Anzughose', category: 'pants', rarity: 'rare', cost: 270, emoji: '💼', description: 'Maßgeschneiderte Business-Anzughose' },
  { id: 'pants_robe', name: 'Königsrobe', category: 'pants', rarity: 'legendary', cost: 1000, emoji: '👑', description: 'Samtrobe mit Goldstickerei', unlockLevel: 6 },
  { id: 'pants_swim', name: 'Badehose', category: 'pants', rarity: 'common', cost: 55, emoji: '🏊', description: 'Klassische Speedos' },
  { id: 'pants_cowboy', name: 'Cowboy-Hose', category: 'pants', rarity: 'rare', cost: 245, emoji: '🤠', description: 'Jeans mit Cowboy-Fransenstreifen' },
  { id: 'pants_matrix', name: 'Matrix-Hose', category: 'pants', rarity: 'legendary', cost: 880, emoji: '💊', description: 'Schwarze weite Matrix-Hose', unlockLevel: 5 },

  // ── GLOVES – 10 items ──
  { id: 'gloves_boxing', name: 'Boxhandschuhe', category: 'gloves', rarity: 'rare', cost: 280, emoji: '🥊', description: 'Rote Profi-Boxhandschuhe' },
  { id: 'gloves_opera', name: 'Abend-Handschuhe', category: 'gloves', rarity: 'epic', cost: 450, emoji: '👑', description: 'Lange weiße Abend-Handschuhe' },
  { id: 'gloves_winter', name: 'Fausthandschuhe', category: 'gloves', rarity: 'common', cost: 80, emoji: '🧤', description: 'Bunte gestrickte Winterhandschuhe' },
  { id: 'gloves_latex', name: 'Latex-Handschuhe', category: 'gloves', rarity: 'common', cost: 70, emoji: '🩺', description: 'Medizinische Latex-Handschuhe' },
  { id: 'gloves_golden', name: 'Goldene Handschuhe', category: 'gloves', rarity: 'legendary', cost: 800, emoji: '✨', description: 'Glänzende Goldene MJ-Handschuhe', unlockLevel: 4 },
  { id: 'gloves_fingerless', name: 'Fingerlose Handschuhe', category: 'gloves', rarity: 'rare', cost: 200, emoji: '🤘', description: 'Schwarze fingerlose Punk-Handschuhe' },
  { id: 'gloves_oven', name: 'Ofenhandschuhe', category: 'gloves', rarity: 'common', cost: 60, emoji: '🧤', description: 'Lustige Koch-Ofenhandschuhe' },
  { id: 'gloves_knight', name: 'Ritterhandschuhe', category: 'gloves', rarity: 'epic', cost: 500, emoji: '⚔️', description: 'Metallene Ritter-Panzerhandschuhe' },
  { id: 'gloves_baseball', name: 'Baseball-Handschuh', category: 'gloves', rarity: 'rare', cost: 240, emoji: '⚾', description: 'Brauner Leder-Baseball-Handschuh' },
  { id: 'gloves_space', name: 'Raumanzug-Handschuhe', category: 'gloves', rarity: 'epic', cost: 520, emoji: '🧑‍🚀', description: 'Dicke Astronauten-Handschuhe' },

  // ── NECK / TIES – 10 items ──
  { id: 'neck_bowtie', name: 'Fliege', category: 'neck', rarity: 'rare', cost: 200, emoji: '🎀', description: 'Klassische schwarze Smoking-Fliege' },
  { id: 'neck_necktie', name: 'Schlips', category: 'neck', rarity: 'common', cost: 90, emoji: '👔', description: 'Gepunkteter Business-Schlips' },
  { id: 'neck_scarf', name: 'Schal', category: 'neck', rarity: 'common', cost: 100, emoji: '🧣', description: 'Gestreifter Woll-Schal' },
  { id: 'neck_gold', name: 'Goldkette', category: 'neck', rarity: 'epic', cost: 600, emoji: '📿', description: 'Dicker Goldketten-Bling' },
  { id: 'neck_lei', name: 'Blumenkette', category: 'neck', rarity: 'common', cost: 80, emoji: '🌺', description: 'Hawaiianische Blumen-Lei' },
  { id: 'neck_vampire', name: 'Vampir-Cape', category: 'neck', rarity: 'rare', cost: 280, emoji: '🧛', description: 'Kurzes schwarzes Vampir-Cape-Kragen' },
  { id: 'neck_medal', name: 'Olympia-Medaille', category: 'neck', rarity: 'legendary', cost: 1000, emoji: '🥇', description: 'Goldmedaille der Champions', unlockLevel: 5 },
  { id: 'neck_pearls', name: 'Perlen', category: 'neck', rarity: 'rare', cost: 350, emoji: '🤍', description: 'Elegante Perlenkette' },
  { id: 'neck_dog', name: 'Hundehalsband', category: 'neck', rarity: 'common', cost: 70, emoji: '🐕', description: 'Cooles Nieten-Hundehalsband' },
  { id: 'neck_feather', name: 'Federkragen', category: 'neck', rarity: 'epic', cost: 480, emoji: '🦚', description: 'Bunter Pfauenfedern-Kragen' },

  // ── GLASSES – 10 items ──
  { id: 'glasses_nerd', name: 'Nerd-Brille', category: 'glasses', rarity: 'common', cost: 90, emoji: '🤓', description: 'Dicke schwarze Nerd-Hornbrille' },
  { id: 'glasses_sunglasses', name: 'Sonnenbrille', category: 'glasses', rarity: 'common', cost: 100, emoji: '😎', description: 'Coole schwarze Aviator-Sonnenbrille' },
  { id: 'glasses_monocle', name: 'Monokel', category: 'glasses', rarity: 'rare', cost: 280, emoji: '🧐', description: 'Elegantes Herren-Monokel' },
  { id: 'glasses_vr', name: 'VR-Brille', category: 'glasses', rarity: 'epic', cost: 600, emoji: '🥽', description: 'Futuristische VR-Headset-Brille' },
  { id: 'glasses_heart', name: 'Herzbrille', category: 'glasses', rarity: 'rare', cost: 200, emoji: '💕', description: 'Pinke Herzförmige Hippie-Brille' },
  { id: 'glasses_lab', name: 'Schutzbrille', category: 'glasses', rarity: 'common', cost: 80, emoji: '🥼', description: 'Wissenschaftliche Labor-Schutzbrille' },
  { id: 'glasses_ski', name: 'Skibrille', category: 'glasses', rarity: 'rare', cost: 240, emoji: '⛷️', description: 'Farbige Ski-Goggle' },
  { id: 'glasses_3d', name: '3D-Brille', category: 'glasses', rarity: 'common', cost: 75, emoji: '🎬', description: 'Klassische Rot-Blau 3D-Kino-Brille' },
  { id: 'glasses_gold', name: 'Goldrandbrille', category: 'glasses', rarity: 'legendary', cost: 750, emoji: '✨', description: 'Goldumrandete Luxus-Brille', unlockLevel: 4 },
  { id: 'glasses_xray', name: 'Röntgenbrille', category: 'glasses', rarity: 'epic', cost: 520, emoji: '👁️', description: 'Mysteriöse Röntgen-Sehbrille' },

  // ── SPECIAL COSMETICS – 25 items ──
  { id: 'special_brick', name: 'Brick-Handy (90er)', category: 'special', rarity: 'legendary', cost: 1500, emoji: '📱', description: 'Riesiges Motorola-Backstein-Handy der frühen 90er', unlockLevel: 5 },
  { id: 'special_gameboy', name: 'Original GameBoy', category: 'special', rarity: 'epic', cost: 800, emoji: '🕹️', description: 'Nintendo GameBoy aus 1989' },
  { id: 'special_baguette', name: 'Baguette', category: 'special', rarity: 'common', cost: 120, emoji: '🥖', description: 'Frisches französisches Baguette unterm Arm' },
  { id: 'special_lightsaber', name: 'Lichtschwert', category: 'special', rarity: 'legendary', cost: 1200, emoji: '⚡', description: 'Grünes Jedi-Lichtschwert', unlockLevel: 5 },
  { id: 'special_rubber_duck', name: 'Gummiente', category: 'special', rarity: 'common', cost: 80, emoji: '🦆', description: 'Gelbe Quietsche-Ente in der Hand' },
  { id: 'special_briefcase', name: 'Aktenkoffer', category: 'special', rarity: 'rare', cost: 300, emoji: '💼', description: 'Metallener Geheimdienstkkoffer' },
  { id: 'special_trophy', name: 'Pokal', category: 'special', rarity: 'epic', cost: 700, emoji: '🏆', description: 'Glänzender Sieger-Pokal' },
  { id: 'special_cactus', name: 'Kaktus', category: 'special', rarity: 'common', cost: 100, emoji: '🌵', description: 'Kleiner Kaktus in der Hand' },
  { id: 'special_balloon', name: 'Luftballon', category: 'special', rarity: 'common', cost: 70, emoji: '🎈', description: 'Roter Herzluftballon' },
  { id: 'special_sword', name: 'Excalibur', category: 'special', rarity: 'legendary', cost: 1100, emoji: '🗡️', description: 'Legendäres Schwert Excalibur', unlockLevel: 6 },
  { id: 'special_pizza', name: 'Pizzakarton', category: 'special', rarity: 'rare', cost: 250, emoji: '🍕', description: 'Offener Pizzakarton in der Hand' },
  { id: 'special_flag', name: 'Piraten-Flagge', category: 'special', rarity: 'rare', cost: 320, emoji: '🏴‍☠️', description: 'Riesige Totenkopf-Flagge' },
  { id: 'special_cd_player', name: 'Discman (90er)', category: 'special', rarity: 'epic', cost: 750, emoji: '💿', description: 'Sony Discman CD-Player mit Kopfhörern' },
  { id: 'special_tamagotchi', name: 'Tamagotchi', category: 'special', rarity: 'epic', cost: 680, emoji: '🥚', description: 'Original Tamagotchi virtuelles Haustier' },
  { id: 'special_shrek', name: 'Zwiebel', category: 'special', rarity: 'rare', cost: 400, emoji: '🧅', description: 'Zwiebel – denn Ogre haben Schichten' },
  { id: 'special_scepter', name: 'Königs-Zepter', category: 'special', rarity: 'legendary', cost: 1300, emoji: '🪄', description: 'Goldenes Königs-Herrschaftszeichen', unlockLevel: 6 },
  { id: 'special_camera', name: 'Retro-Kamera', category: 'special', rarity: 'rare', cost: 360, emoji: '📷', description: 'Polaroid-Kamera aus den 80ern' },
  { id: 'special_flamingo', name: 'Flamingo', category: 'special', rarity: 'epic', cost: 850, emoji: '🦩', description: 'Echter Flamingo auf dem Arm' },
  { id: 'special_pokeball', name: 'Pokéball', category: 'special', rarity: 'epic', cost: 720, emoji: '⚪', description: 'Original roter Pokéball' },
  { id: 'special_spray', name: 'Graffiti-Spray', category: 'special', rarity: 'rare', cost: 280, emoji: '🎨', description: 'Bunte Graffiti-Sprühflasche' },
  { id: 'special_magnet', name: 'Riesiger Magnet', category: 'special', rarity: 'common', cost: 130, emoji: '🧲', description: 'Übergroßer Hufeisen-Magnet' },
  { id: 'special_crystal_ball', name: 'Glaskugel', category: 'special', rarity: 'epic', cost: 650, emoji: '🔮', description: 'Mystische Wahrsager-Glaskugel' },
  { id: 'special_lunchbox', name: 'Bento-Box', category: 'special', rarity: 'common', cost: 110, emoji: '🍱', description: 'Japanische Bento-Lunchbox' },
  { id: 'special_jetpack', name: 'Jetpack', category: 'special', rarity: 'legendary', cost: 1400, emoji: '🚀', description: 'Futuristisches persönliches Jetpack', unlockLevel: 7 },
  { id: 'special_plunger', name: 'Klobürste', category: 'special', rarity: 'common', cost: 50, emoji: '🚽', description: 'Klassischer Klempner-Saugnapf-Stab' },
]

// ── POINTS EVENTS ─────────────────────────────────────────────

export interface PointEvent {
  id: string
  label: string
  points: number
  emoji: string
}

export const POINT_EVENTS: PointEvent[] = [
  { id: 'daily_log', label: 'Tag vollständig geloggt', points: 50, emoji: '✅' },
  { id: 'calorie_goal', label: 'Kalorienziel erreicht', points: 75, emoji: '🎯' },
  { id: 'protein_goal', label: 'Protein-Ziel erreicht', points: 40, emoji: '💪' },
  { id: 'water_goal', label: 'Wasserziel erreicht (8 Gläser)', points: 30, emoji: '💧' },
  { id: 'streak_3', label: '3-Tage-Streak', points: 100, emoji: '🔥' },
  { id: 'streak_7', label: '7-Tage-Streak', points: 300, emoji: '🔥🔥' },
  { id: 'streak_30', label: '30-Tage-Streak', points: 1000, emoji: '🏆' },
  { id: 'weight_logged', label: 'Gewicht eingetragen', points: 20, emoji: '⚖️' },
  { id: 'meal_planned', label: 'Mahlzeit geplant', points: 15, emoji: '📅' },
  { id: 'first_login', label: 'Erster Login', points: 100, emoji: '🎉' },
]

export function getRarityColor(rarity: ItemRarity): string {
  switch (rarity) {
    case 'common': return '#9ca3af'
    case 'rare': return '#3b82f6'
    case 'epic': return '#a855f7'
    case 'legendary': return '#f59e0b'
  }
}

export function getRarityLabel(rarity: ItemRarity): string {
  switch (rarity) {
    case 'common': return 'Gewöhnlich'
    case 'rare': return 'Selten'
    case 'epic': return 'Episch'
    case 'legendary': return 'Legendär'
  }
}
