
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type CharacterClass = 'warrior' | 'ninja' | 'sura' | 'shaman';

export type EnemyState = 'idle' | 'chasing' | 'attacking' | 'returning' | 'dead';

export interface EnemyConfig {
  id: string;
  name: string;
  maxHp: number;
  damage: number;
  movementSpeed: number;
  detectionRadius: number; // Aggro range
  resetRadius: number;     // Leash range
  attackRange: number;
  attackCooldown: number;
  expReward: number;
  scale: number;
  color: string;
  lootTableId?: string;
}

export type NpcType = 'shop' | 'teleporter' | 'quest_giver' | 'guard' | 'blacksmith';

export interface NpcConfig {
  id: string;
  name: string;
  type: NpcType;
  position: [number, number, number];
  rotation: number;
  shopId?: string;
  modelColor: string;
}

export interface ShopItem {
  itemId: string; // Template ID
  price: number;
}

export interface ShopConfig {
  id: string;
  name: string;
  items: ShopItem[];
  allowSell: boolean;
}

export interface Entity {
  // Core Identity
  id: string;
  configId?: string; // Ref to EnemyConfig or NpcConfig
  type: 'enemy' | 'npc' | 'metin';
  name: string;
  
  // Position & Physics
  position: [number, number, number];
  spawnOrigin: [number, number, number];
  rotationY: number; // Facing direction in radians
  
  // Stats
  hp: number;
  maxHp: number;
  level: number;
  damage: number; // Current damage (can be buffed)
  speed: number;
  expReward?: number;
  
  // AI State Machine
  state: EnemyState;
  stateTimer: number;       // General purpose timer for states
  attackTimer: number;      // Cooldown for attacks
  isAggroed: boolean;
  targetId?: string | null; // Who they are chasing (usually player)

  // Metin Stone Specific
  triggeredWaves?: number[]; // Indices of waves already spawned

  // NPC Specific
  shopId?: string;
  npcType?: NpcType;

  // Status
  isDead: boolean;
  lastHitTime?: number;
  
  // Legacy/Visuals (to be phased out or kept for overrides)
  attackRange: number;
  aggroRange: number;
  color?: string;
  scale?: number;
}

export interface PlayerStats {
  str: number;
  vit: number;
  dex: number;
  int: number;
}

export interface DerivedStats {
  maxHp: number;
  attack: number;
  defense: number;
  magic: number; // Skill Damage
  speed: number; // Movement Speed
  attackSpeed: number; // Animation Speed Multiplier (1.0 = normal)
  critChance: number;
  evasion: number;
}

export interface ChatMessage {
  sender: string;
  text: string;
  isSystem?: boolean;
}

export interface FloatingText {
  id: string;
  position: [number, number, number];
  text: string;
  timestamp: number;
  color: string;
  scale?: number;
  isCritical?: boolean;
  isPiercing?: boolean;
}

export interface Drop {
  id: string; // Unique ID
  type: 'yang' | 'item';
  item?: Item; // The actual item object
  position: [number, number, number];
  value: number; // Gold amount or Item Quantity (redundant but useful)
  timestamp: number;
  autoDespawnAt: number;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  DEAD = 'DEAD'
}

// --- INVENTORY & ITEM SYSTEM ---

export type ItemType = 'weapon' | 'armor' | 'helmet' | 'shield' | 'boots' | 'earring' | 'necklace' | 'bracelet' | 'consumable' | 'material' | 'quest' | 'stone' | 'costume';
export type ItemRarity = 'normal' | 'rare' | 'epic' | 'legendary';
export type BonusType = 'STR' | 'DEX' | 'VIT' | 'INT' | 'MAX_HP' | 'ATTACK' | 'SKILL_ATTACK' | 'ATTACK_SPEED' | 'MOVE_SPEED' | 'CRIT_CHANCE' | 'DEFENSE' | 'EXP_RATE';

// Detailed Subtypes for logic (animation, slots, usage)
export type WeaponSubType = 'sword' | 'two_handed' | 'dagger' | 'bow' | 'bell' | 'fan';
export type ArmorSubType = 'body' | 'head' | 'shield' | 'wrist' | 'feet' | 'neck' | 'ear'; 
export type ConsumableSubType = 'potion' | 'scroll' | 'food' | 'fish';
export type MaterialSubType = 'ore' | 'refinement' | 'stone' | 'quest';
export type StoneSubType = 'weapon_stone' | 'armor_stone';
export type CostumeSubType = 'body_costume' | 'hair_costume' | 'weapon_costume';

export type ItemSubType = WeaponSubType | ArmorSubType | ConsumableSubType | MaterialSubType | StoneSubType | CostumeSubType | 'none';

export interface ItemBonus {
  type: BonusType;
  value: number;
}

export interface Item {
  id: string; // Unique instance ID
  templateId: string; // "sword_1", "potion_red"
  name: string;
  type: ItemType;
  subType?: ItemSubType; // Specific categorization
  icon: string; // CSS color for now
  stackable: boolean;
  maxStack: number;
  quantity: number;
  requiredLevel: number;
  requiredClass?: CharacterClass[]; // Restrict usage
  upgradeLevel: number; // 0-9
  rarity: ItemRarity;
  baseBonuses: ItemBonus[];
  extraBonuses: ItemBonus[];
  description?: string;
}

export interface InventoryPage {
  slots: (Item | null)[]; // Fixed size array
}

export interface Inventory {
  pages: InventoryPage[];
  activePageIndex: number;
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  helmet: Item | null;
  shield: Item | null;
  boots: Item | null;
  necklace: Item | null;
  earrings: Item | null;
  bracelet: Item | null;
}

// --- REFINEMENT SYSTEM ---

export interface RefinementLevelConfig {
  level: number;
  successChance: number; // 0.0 - 1.0
  cost: number;
}

// --- QUEST SYSTEM ---

export interface QuestReward {
  exp: number;
  yang: number;
  itemTemplateId?: string;
  itemCount?: number;
}

export interface QuestConfig {
  id: string;
  level: number;
  npcId: string; // Who gives/completes it
  title: string;
  description: string;
  
  // Dialogues
  dialogStart: string;
  dialogProgress: string;
  dialogComplete: string;
  
  // Objective
  targetEnemyId?: string; // Kill X enemy
  targetItemCount?: number; // Collect X items (future)
  requiredCount: number;
  
  reward: QuestReward;
}

export interface ActiveQuestState {
  questId: string;
  currentCount: number;
  isReadyToTurnIn: boolean;
}

// --- SKILL SYSTEM ---

export type SkillType = 'direct_damage' | 'melee_aoe' | 'buff';
export type AttributeScaling = 'STR' | 'DEX' | 'VIT' | 'INT' | 'NONE';

export interface SkillLevelScaling {
  level: number;
  powerMultiplier: number;
  cooldownReduction: number;
  cost: number;
}

export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  icon: string; // Color or path
  
  baseCooldown: number;
  castTime: number;
  attributeScaling: AttributeScaling;
  
  basePower: number; // Base dmg or effect
  range: number;     // Reach
  angle?: number;    // For cone AoE
  radius?: number;   // For circular AoE
  
  levels: SkillLevelScaling[]; // Data for levels 1-20 (M1)
}

export interface PlayerSkillState {
  skillId: string;
  currentLevel: number; // 0 = not learned
  currentCooldown: number;
}

export interface PlayerSkills {
  slots: (string | null)[]; // Array of 4 slots mapping to skill IDs
  learned: PlayerSkillState[]; // State of all skills
  skillPoints: number;
}

export interface ActiveBuff {
  skillId: string;
  remainingDuration: number;
  modifiers: Partial<DerivedStats>;
  vfxColor?: string;
}

// --- LOOT & METIN SYSTEM ---

export type LootEntryType = 'gold' | 'item';

export interface BaseLootEntry {
  id: string;
  type: LootEntryType;
  chance: number; // 0.0 - 1.0
  minQuantity: number;
  maxQuantity: number;
}

export interface GoldLootEntry extends BaseLootEntry {
  type: 'gold';
}

export interface ItemLootEntry extends BaseLootEntry {
  type: 'item';
  itemId: string; // matches templateId
}

export interface LootTable {
  id: string;
  entries: (GoldLootEntry | ItemLootEntry)[];
  rollCount?: number; // How many attempts
}

export interface MetinWaveConfig {
  waveIndex: number;
  enemyConfigId: string;
  count: number;
  triggerHPPercent: number; // 75, 50, 25
  spawnRadius: number;
}

export interface MetinConfig {
  id: string;
  name: string;
  maxHP: number;
  lootTableId: string;
  spawnWaves: MetinWaveConfig[];
}

// --- INPUT SYSTEM ---

export type InputAction = 
  | 'MOVE_FORWARD'
  | 'MOVE_BACKWARD'
  | 'MOVE_LEFT'
  | 'MOVE_RIGHT'
  | 'CAMERA_ROTATE_LEFT'  // Q
  | 'CAMERA_ROTATE_RIGHT' // E
  | 'ATTACK_BASIC'
  | 'USE_QUICKSLOT_1'
  | 'USE_QUICKSLOT_2'
  | 'USE_QUICKSLOT_3'
  | 'USE_QUICKSLOT_4'
  | 'USE_QUICKSLOT_5'
  | 'SWITCH_QUICKSLOT_BAR_1'
  | 'SWITCH_QUICKSLOT_BAR_2'
  | 'SWITCH_QUICKSLOT_BAR_3'
  | 'SWITCH_QUICKSLOT_BAR_4'
  | 'TOGGLE_INVENTORY'
  | 'TOGGLE_CHARACTER_PANEL'
  | 'TOGGLE_SKILL_PANEL'
  | 'TOGGLE_MAP'
  | 'TOGGLE_QUEST_LOG'
  | 'INTERACT_OR_PICKUP'
  | 'OPEN_MENU'
  | 'OPEN_CHAT';
