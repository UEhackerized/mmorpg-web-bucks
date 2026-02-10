
import { create } from 'zustand';
import { Entity, GameState, ChatMessage, FloatingText, Drop, PlayerStats, DerivedStats, Inventory, Equipment, Item, ItemType, ItemBonus, EnemyConfig, PlayerSkills, ActiveBuff, CharacterClass, ActiveQuestState } from './types';
import { ENEMY_CONFIGS } from './logic/enemyConfig';
import { METIN_CONFIGS } from './logic/metinConfig';
import { LOOT_TABLES } from './logic/lootTables';
import { NPC_CONFIGS } from './logic/npcConfig';
import { SHOP_CONFIGS } from './logic/shopConfig';
import { updateEnemyAI } from './logic/enemyAI';
import { SKILL_CONFIGS } from './logic/skillConfig';
import { executeSkillLogic } from './logic/skillSystem';
import { createItem } from './logic/itemFactory';
import { generateLootDrops } from './logic/lootSystem';
import { getRefinementConfig } from './logic/refinementSystem';
import { getQuestForLevel, getQuestById } from './logic/questConfig';
import * as THREE from 'three';

const AI_ACTIVE_DISTANCE = 60; // Distance to run AI updates

interface GameStore {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  gameTime: number; 
  playerName: string;
  playerClass: CharacterClass;
  setPlayerIdentity: (name: string, cls: CharacterClass) => void;
  isLeveledUp: boolean;
  resetLevelUpFlag: () => void;
  playerPosition: [number, number, number];
  playerRotation: number;
  setPlayerPosition: (pos: [number, number, number], rot?: number) => void;
  // Click-to-Move State
  moveDestination: [number, number, number] | null;
  setMoveDestination: (pos: [number, number, number] | null) => void;
  
  playerHp: number;
  playerMaxHp: number;
  playerMp: number;
  playerMaxMp: number;
  playerXp: number;
  playerLevel: number;
  playerYang: number;
  targetId: string | null;
  stats: PlayerStats;
  statPoints: number;
  increaseStat: (stat: keyof PlayerStats) => void;
  getDerivedStats: () => DerivedStats;
  getExpRequired: (level: number) => number;
  inventory: Inventory;
  equipment: Equipment;
  inventoryOpen: boolean;
  setInventoryOpen: (isOpen: boolean) => void;
  moveItem: (fromPage: number, fromSlot: number, toPage: number, toSlot: number) => void;
  splitItem: (page: number, slot: number, amount: number) => void;
  equipItem: (page: number, slot: number) => void;
  unequipItem: (slotName: keyof Equipment) => void;
  useItem: (page: number, slot: number) => void; 
  addItem: (item: Item) => boolean;
  removeItem: (page: number, slot: number) => void;
  statWindowOpen: boolean;
  setStatWindowOpen: (isOpen: boolean) => void;
  skillWindowOpen: boolean;
  setSkillWindowOpen: (isOpen: boolean) => void;
  mapOpen: boolean;
  setMapOpen: (isOpen: boolean) => void;
  questLogOpen: boolean;
  setQuestLogOpen: (isOpen: boolean) => void;
  systemMenuOpen: boolean;
  setSystemMenuOpen: (isOpen: boolean) => void;
  closeAllPanels: () => void;
  refinementOpen: boolean;
  itemToUpgrade: { page: number, slot: number } | null;
  setRefinementOpen: (isOpen: boolean) => void;
  setRefinementItem: (page: number, slot: number) => void;
  upgradeItem: () => void;
  activeQuest: ActiveQuestState | null;
  completedQuests: string[];
  acceptQuest: (questId: string) => void;
  completeQuest: () => void;
  updateQuestProgress: (enemyId: string) => void;
  skills: PlayerSkills;
  activeQuickslotBar: number;
  setActiveQuickslotBar: (bar: number) => void;
  activeBuffs: ActiveBuff[];
  levelUpSkill: (skillId: string) => void;
  activateSkill: (slotIndex: number) => void;
  lastSkillTime: Record<string, number>;
  setSkillUsed: (skillId: string) => void;
  enemies: Entity[];
  drops: Drop[];
  updateEnemy: (id: string, data: Partial<Entity>) => void;
  spawnEnemies: () => void;
  spawnEnemyAt: (configId: string, position: [number, number, number], aggro?: boolean) => void;
  damageEnemy: (id: string, amount: number, knockbackDir?: [number, number], isFinisher?: boolean) => void;
  setTarget: (id: string | null) => void;
  chatLog: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  floatingTexts: FloatingText[];
  addFloatingText: (text: Omit<FloatingText, 'id' | 'timestamp'>) => void;
  removeFloatingText: (id: string) => void;
  npcDialogueOpen: boolean;
  currentNpcId: string | null;
  setNpcDialogue: (isOpen: boolean, npcId: string | null) => void;
  interactWithNpc: (npcId: string) => void;
  shopOpen: boolean;
  activeShopId: string | null;
  setShopOpen: (isOpen: boolean) => void;
  buyItem: (templateId: string, cost: number) => void;
  sellItem: (page: number, slot: number) => void;
  takeDamage: (amount: number) => void;
  healPlayer: (amount: number) => void;
  usePotion: () => void; 
  gainXp: (amount: number) => void;
  pickupDrop: (dropId: string) => void;
  pickupAllNearby: () => void;
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
  tickGame: (delta: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: GameState.MENU,
  setGameState: (state) => set({ gameState: state }),
  gameTime: 12.0, 
  playerName: 'Player',
  playerClass: 'warrior',
  setPlayerIdentity: (name, cls) => set({ playerName: name, playerClass: cls }),
  isLeveledUp: false,
  resetLevelUpFlag: () => set({ isLeveledUp: false }),
  playerPosition: [0, 0, 0],
  playerRotation: 0,
  setPlayerPosition: (pos, rot) => set((state) => ({ 
      playerPosition: pos, 
      playerRotation: rot !== undefined ? rot : state.playerRotation 
  })),
  moveDestination: null,
  setMoveDestination: (pos) => set({ moveDestination: pos }),
  playerHp: 850, 
  playerMaxHp: 850,
  playerMp: 300,
  playerMaxMp: 300,
  playerXp: 0,
  playerLevel: 1,
  playerYang: 0,
  lastSkillTime: {},
  targetId: null,
  stats: { str: 5, vit: 5, dex: 5, int: 5 },
  statPoints: 0,
  statWindowOpen: false,
  setStatWindowOpen: (isOpen) => set({ statWindowOpen: isOpen }),
  skillWindowOpen: false,
  setSkillWindowOpen: (isOpen) => set({ skillWindowOpen: isOpen }),
  mapOpen: false,
  setMapOpen: (isOpen) => set({ mapOpen: isOpen }),
  questLogOpen: false,
  setQuestLogOpen: (isOpen) => set({ questLogOpen: isOpen }),
  systemMenuOpen: false,
  setSystemMenuOpen: (isOpen) => set({ systemMenuOpen: isOpen }),
  inventory: {
      activePageIndex: 0,
      pages: [{ slots: Array(45).fill(null) }, { slots: Array(45).fill(null) }]
  },
  equipment: {
      weapon: null, armor: null, helmet: null, shield: null, 
      boots: null, necklace: null, earrings: null, bracelet: null
  },
  inventoryOpen: false,
  setInventoryOpen: (isOpen) => set({ inventoryOpen: isOpen }),
  refinementOpen: false,
  itemToUpgrade: null,
  setRefinementOpen: (isOpen) => set({ refinementOpen: isOpen, itemToUpgrade: null }),
  setRefinementItem: (page, slot) => set({ itemToUpgrade: { page, slot }, refinementOpen: true }),
  upgradeItem: () => {
      const state = get();
      if (!state.itemToUpgrade) return;
      const { page, slot } = state.itemToUpgrade;
      const inv = { ...state.inventory };
      const item = inv.pages[page].slots[slot];
      if (!item) return;
      const config = getRefinementConfig(item.upgradeLevel);
      if (!config) {
          state.addChatMessage({ sender: 'Blacksmith', text: 'Bu eşya daha fazla yükseltilemez.' });
          return;
      }
      if (state.playerYang < config.cost) {
          state.addChatMessage({ sender: 'Blacksmith', text: 'Yeterli Yang yok.' });
          return;
      }
      const isSuccess = Math.random() <= config.successChance;
      if (isSuccess) {
          item.upgradeLevel += 1;
          set({ 
              inventory: inv, 
              playerYang: state.playerYang - config.cost,
              itemToUpgrade: null,
              refinementOpen: false
          });
          state.addChatMessage({ sender: 'Blacksmith', text: 'Yükseltme başarılı!' });
          state.addFloatingText({ position: [state.playerPosition[0], 2, state.playerPosition[2]], text: 'Başarılı!', color: '#00ff00' });
      } else {
          inv.pages[page].slots[slot] = null;
           set({ 
              inventory: inv, 
              playerYang: state.playerYang - config.cost,
              itemToUpgrade: null,
              refinementOpen: false
          });
          state.addChatMessage({ sender: 'Blacksmith', text: 'Yükseltme başarısız. Eşya yok oldu.' });
          state.addFloatingText({ position: [state.playerPosition[0], 2, state.playerPosition[2]], text: 'Başarısız...', color: '#ff0000' });
      }
      state.saveGame();
  },
  activeQuest: null,
  completedQuests: [],
  acceptQuest: (questId) => {
      set({ activeQuest: { questId, currentCount: 0, isReadyToTurnIn: false } });
      get().addChatMessage({ sender: 'Sistem', text: 'Görev kabul edildi!' });
      set({ npcDialogueOpen: false });
  },
  updateQuestProgress: (enemyConfigId) => {
      const state = get();
      if (!state.activeQuest) return;
      const config = getQuestById(state.activeQuest.questId);
      if (!config) return;
      if (config.targetEnemyId === enemyConfigId) {
          const newCount = state.activeQuest.currentCount + 1;
          if (newCount <= config.requiredCount) {
              set({ activeQuest: { ...state.activeQuest, currentCount: newCount } });
              if (newCount === config.requiredCount) {
                  set({ activeQuest: { ...state.activeQuest, currentCount: newCount, isReadyToTurnIn: true } });
                  state.addChatMessage({ sender: 'Sistem', text: 'Görev tamamlandı! NPC\'ye dön.' });
                  state.addFloatingText({ position: [state.playerPosition[0], 2, state.playerPosition[2]], text: 'Görev!', color: '#ffd700', scale: 1.5 });
              }
          }
      }
  },
  completeQuest: () => {
      const state = get();
      if (!state.activeQuest || !state.activeQuest.isReadyToTurnIn) return;
      const config = getQuestById(state.activeQuest.questId);
      if (!config) return;
      state.gainXp(config.reward.exp);
      set({ playerYang: state.playerYang + config.reward.yang });
      if (config.reward.itemTemplateId) {
          const item = createItem(config.reward.itemTemplateId, config.reward.itemCount || 1);
          if (item) state.addItem(item);
      }
      set({ 
          completedQuests: [...state.completedQuests, config.id],
          activeQuest: null,
          npcDialogueOpen: false
      });
      state.addChatMessage({ sender: 'Sistem', text: `Görev Tamamlandı: ${config.title}` });
      state.saveGame();
  },
  closeAllPanels: () => set({
      inventoryOpen: false,
      statWindowOpen: false,
      skillWindowOpen: false,
      mapOpen: false,
      questLogOpen: false,
      shopOpen: false,
      activeShopId: null,
      npcDialogueOpen: false,
      refinementOpen: false,
      itemToUpgrade: null,
      systemMenuOpen: false
  }),
  activeQuickslotBar: 1,
  setActiveQuickslotBar: (bar) => set({ activeQuickslotBar: bar }),
  skills: {
      slots: ['aura_sword', 'whirlwind', 'dash', 'sword_spin'],
      learned: [
          { skillId: 'aura_sword', currentLevel: 0, currentCooldown: 0 },
          { skillId: 'whirlwind', currentLevel: 0, currentCooldown: 0 },
          { skillId: 'dash', currentLevel: 0, currentCooldown: 0 },
          { skillId: 'sword_spin', currentLevel: 0, currentCooldown: 0 }
      ],
      skillPoints: 0
  },
  activeBuffs: [],
  enemies: [],
  drops: [],
  chatLog: [{ sender: 'Sistem', text: 'Metin2 Web Legacy\'ye hoş geldiniz!', isSystem: true }],
  floatingTexts: [],
  npcDialogueOpen: false,
  currentNpcId: null,
  setNpcDialogue: (isOpen, npcId) => set({ npcDialogueOpen: isOpen, currentNpcId: npcId }),
  interactWithNpc: (npcId) => {
      const state = get();
      const npc = state.enemies.find(e => e.id === npcId);
      if (!npc || npc.type !== 'npc') return;
      state.closeAllPanels();
      if (npc.shopId) {
          set({ shopOpen: true, activeShopId: npc.shopId, inventoryOpen: true });
      } else if (npc.npcType === 'blacksmith') {
          set({ refinementOpen: true, inventoryOpen: true });
          state.addChatMessage({ sender: 'Demirci', text: 'Eşyayı buraya sürükle.' });
      } else {
          set({ npcDialogueOpen: true, currentNpcId: npcId });
      }
  },
  shopOpen: false,
  activeShopId: null,
  setShopOpen: (isOpen) => set({ shopOpen: isOpen }),
  setTarget: (id) => set({ targetId: id }),
  setSkillUsed: (skillId) => {},
  getDerivedStats: () => {
    const { stats, playerLevel, equipment, activeBuffs } = get();
    let maxHp = 800 + (playerLevel * 40) + (stats.vit * 40);
    let maxMp = 200 + (playerLevel * 10) + (stats.int * 20);
    let attack = (playerLevel * 2) + (stats.str * 3) + (stats.dex * 1);
    let defense = (stats.vit * 2) + Math.floor(stats.dex / 3);
    let magic = (playerLevel * 5) + (stats.int * 4);
    let speed = 10 + (stats.dex * 0.1);
    let critChance = 0.05 + (stats.dex * 0.005);
    let evasion = stats.dex * 0.2;
    let attackSpeed = 1.0 + (stats.dex * 0.01);
    Object.values(equipment).filter(Boolean).forEach((item: any) => {
        const allBonuses = [...item.baseBonuses, ...item.extraBonuses];
        const upgradeMult = 1 + (item.upgradeLevel * 0.1);
        allBonuses.forEach((b: any) => {
            const val = ['ATTACK','DEFENSE','MAX_HP'].includes(b.type) ? Math.floor(b.value * upgradeMult) : b.value;
            switch(b.type) {
                case 'MAX_HP': maxHp += val; break;
                case 'ATTACK': attack += val; break;
                case 'DEFENSE': defense += val; break;
                case 'SKILL_ATTACK': magic += val; break;
                case 'MOVE_SPEED': speed += val; break;
                case 'ATTACK_SPEED': attackSpeed += (val / 100); break;
                case 'CRIT_CHANCE': critChance += val / 100; break;
            }
        });
    });
    activeBuffs.forEach(buff => {
        if (buff.modifiers.maxHp) maxHp += buff.modifiers.maxHp;
        if (buff.modifiers.attack) attack += buff.modifiers.attack;
        if (buff.modifiers.defense) defense += buff.modifiers.defense;
        if (buff.modifiers.magic) magic += buff.modifiers.magic;
        if (buff.modifiers.speed) speed += buff.modifiers.speed;
        if (buff.modifiers.attackSpeed) attackSpeed += buff.modifiers.attackSpeed;
    });
    if (get().playerMaxMp !== maxMp) set({ playerMaxMp: maxMp });
    return { maxHp, attack, defense, magic, speed, attackSpeed, critChance, evasion };
  },
  getExpRequired: (level) => Math.floor(300 * Math.pow(1.5, level - 1)),
  increaseStat: (stat) => set((state) => {
      if (state.statPoints <= 0) return {};
      return { stats: { ...state.stats, [stat]: state.stats[stat] + 1 }, statPoints: state.statPoints - 1 };
  }),
  levelUpSkill: (skillId) => set((state) => {
      if (state.skills.skillPoints <= 0) return {};
      const newLearned = state.skills.learned.map(s => {
          if (s.skillId === skillId && s.currentLevel < 20) {
              return { ...s, currentLevel: s.currentLevel + 1 };
          }
          return s;
      });
      return { skills: { ...state.skills, learned: newLearned, skillPoints: state.skills.skillPoints - 1 } };
  }),
  activateSkill: (slotIndex) => {
      const state = get();
      const skillId = state.skills.slots[slotIndex];
      if (!skillId) return;
      const skillState = state.skills.learned.find(s => s.skillId === skillId);
      if (!skillState || skillState.currentLevel === 0) {
          state.addChatMessage({ sender: 'Sistem', text: 'Beceri henüz öğrenilmedi.' });
          return;
      }
      if (skillState.currentCooldown > 0) {
          state.addChatMessage({ sender: 'Sistem', text: 'Beceri bekleme süresinde.' });
          return;
      }
      const config = SKILL_CONFIGS[skillId];
      if (!config) return;
      const levelData = config.levels[skillState.currentLevel - 1];
      if (state.playerMp < levelData.cost) {
          state.addChatMessage({ sender: 'Sistem', text: 'Yeterli SP yok.' });
          return;
      }
      const result = executeSkillLogic(config, skillState, {
          playerPos: state.playerPosition,
          playerRot: state.playerRotation,
          playerStats: state.stats,
          derivedStats: state.getDerivedStats(),
          enemies: state.enemies
      });
      result.damageMap.forEach(hit => {
          state.damageEnemy(hit.enemyId, hit.damage, hit.knockback, true);
      });
      if (result.newBuff) {
          set(s => ({ activeBuffs: [...s.activeBuffs, result.newBuff!] }));
          state.addFloatingText({ position: [state.playerPosition[0], 2, state.playerPosition[2]], text: config.name, color: '#00ffff' });
      }
      const newLearned = state.skills.learned.map(s => s.skillId === skillId ? { ...s, currentCooldown: config.baseCooldown - levelData.cooldownReduction } : s);
      set({ 
          playerMp: state.playerMp - levelData.cost,
          skills: { ...state.skills, learned: newLearned }
      });
  },
  addItem: (item) => {
    const state = get();
    const inventory = { ...state.inventory };
    if (item.stackable) {
      for (let p = 0; p < inventory.pages.length; p++) {
        for (let s = 0; s < inventory.pages[p].slots.length; s++) {
          const slotItem = inventory.pages[p].slots[s];
          if (slotItem && slotItem.templateId === item.templateId && slotItem.quantity < slotItem.maxStack) {
             const space = slotItem.maxStack - slotItem.quantity;
             const add = Math.min(space, item.quantity);
             slotItem.quantity += add;
             item.quantity -= add;
             if (item.quantity <= 0) {
                 set({ inventory });
                 return true;
             }
          }
        }
      }
    }
    for (let p = 0; p < inventory.pages.length; p++) {
      for (let s = 0; s < inventory.pages[p].slots.length; s++) {
        if (inventory.pages[p].slots[s] === null) {
            inventory.pages[p].slots[s] = item;
            set({ inventory });
            return true;
        }
      }
    }
    state.addChatMessage({ sender: 'Sistem', text: 'Envanter dolu.' });
    return false;
  },
  removeItem: (page, slot) => {
      const inv = { ...get().inventory };
      inv.pages[page].slots[slot] = null;
      set({ inventory: inv });
  },
  moveItem: (fp, fs, tp, ts) => {
      const state = get();
      const inv = { ...state.inventory };
      const itemFrom = inv.pages[fp].slots[fs];
      const itemTo = inv.pages[tp].slots[ts];
      if (!itemFrom) return;
      if (itemTo && itemFrom.templateId === itemTo.templateId && itemTo.stackable && itemTo.quantity < itemTo.maxStack) {
          const space = itemTo.maxStack - itemTo.quantity;
          const move = Math.min(space, itemFrom.quantity);
          itemTo.quantity += move;
          itemFrom.quantity -= move;
          if (itemFrom.quantity <= 0) inv.pages[fp].slots[fs] = null;
      } else {
          inv.pages[fp].slots[fs] = itemTo;
          inv.pages[tp].slots[ts] = itemFrom;
      }
      set({ inventory: inv });
  },
  splitItem: (p, s, a) => {},
  equipItem: (page, slot) => set(state => {
      const inv = { ...state.inventory };
      const equip = { ...state.equipment };
      const item = inv.pages[page].slots[slot];
      if (!item || !['weapon','armor','helmet','shield','boots','necklace','earrings','bracelet'].includes(item.type)) return {};
      if (item.requiredLevel > state.playerLevel) {
          state.addChatMessage({ sender: 'Sistem', text: `Bu eşya için seviye ${item.requiredLevel} gerekiyor.` });
          return {};
      }
      if (item.requiredClass && !item.requiredClass.includes(state.playerClass)) {
          state.addChatMessage({ sender: 'Sistem', text: `Bu eşya ${state.playerClass} tarafından giyilemez.` });
          return {};
      }
      const slotName = item.type as keyof Equipment;
      const currentEquip = equip[slotName];
      equip[slotName] = item;
      inv.pages[page].slots[slot] = currentEquip;
      return { inventory: inv, equipment: equip };
  }),
  unequipItem: (slotName) => set(state => {
      const equip = { ...state.equipment };
      const item = equip[slotName];
      if (!item) return {};
      if (state.addItem(item)) {
          equip[slotName] = null;
          return { equipment: equip };
      }
      return {};
  }),
  useItem: (page, slot) => {
      const state = get();
      const item = state.inventory.pages[page].slots[slot];
      if (!item) return;
      if (item.type === 'consumable') {
          if (item.templateId === 'potion_red') {
              state.healPlayer(item.baseBonuses[0].value);
              item.quantity--;
              if (item.quantity <= 0) {
                  const inv = { ...state.inventory };
                  inv.pages[page].slots[slot] = null;
                  set({ inventory: inv });
              }
          }
      } else {
          state.equipItem(page, slot);
      }
  },
  buyItem: (templateId, cost) => {
      const state = get();
      if (state.playerYang < cost) {
          state.addChatMessage({ sender: 'Sistem', text: 'Yeterli Yang yok.' });
          return;
      }
      const item = createItem(templateId);
      if (item && state.addItem(item)) {
          set({ playerYang: state.playerYang - cost });
          state.addChatMessage({ sender: 'Sistem', text: `${item.name} satın alındı.` });
      }
  },
  sellItem: (page, slot) => {
      const state = get();
      const item = state.inventory.pages[page].slots[slot];
      if (!item) return;
      const sellPrice = 10;
      set({ playerYang: state.playerYang + sellPrice });
      state.removeItem(page, slot);
      state.addChatMessage({ sender: 'Sistem', text: `${item.name} ${sellPrice} Yang karşılığında satıldı.` });
  },
  spawnEnemies: () => {
      const state = get();
      if (state.enemies.length > 0) return;
      const newEnemies: Entity[] = [];
      Object.values(NPC_CONFIGS).forEach(npcConf => {
          newEnemies.push({
              id: npcConf.id, configId: npcConf.id, type: 'npc', name: npcConf.name,
              position: npcConf.position, spawnOrigin: npcConf.position, rotationY: npcConf.rotation,
              npcType: npcConf.type, shopId: npcConf.shopId, color: npcConf.modelColor,
              hp: 9999, maxHp: 9999, level: 99, damage: 0, speed: 0,
              state: 'idle', stateTimer: 0, attackTimer: 0, isAggroed: false, isDead: false,
              attackRange: 0, aggroRange: 0
          });
      });
      for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 100 + Math.random() * 800;
          const pos: [number, number, number] = [Math.sin(angle) * dist, 0, Math.cos(angle) * dist];
          const conf = METIN_CONFIGS['metin_stone'];
          newEnemies.push({
              id: `metin-${i}`, configId: 'metin_stone', type: 'metin', name: conf.name, position: pos, spawnOrigin: pos, rotationY: 0,
              hp: conf.maxHP, maxHp: conf.maxHP, level: 5, damage: 0, speed: 0, state: 'idle', stateTimer: 0, attackTimer: 0, isAggroed: false, isDead: false,
              attackRange: 0, aggroRange: 0, triggeredWaves: []
          });
      }
      const spawnZone = (mobId: string, count: number, minRadius: number, maxRadius: number) => {
          const conf = ENEMY_CONFIGS[mobId];
          for (let i = 0; i < count; i++) {
              const angle = Math.random() * Math.PI * 2;
              const dist = minRadius + Math.random() * (maxRadius - minRadius);
              const pos: [number, number, number] = [Math.sin(angle) * dist, 0, Math.cos(angle) * dist];
              newEnemies.push({
                  id: `${mobId}-${Math.random()}`, configId: mobId, type: 'enemy', name: conf.name, position: pos, spawnOrigin: pos, rotationY: Math.random() * Math.PI * 2,
                  hp: conf.maxHp, maxHp: conf.maxHp, level: 1, damage: conf.damage, speed: conf.movementSpeed, expReward: conf.expReward,
                  state: 'idle', stateTimer: 0, attackTimer: 0, isAggroed: false, isDead: false,
                  attackRange: conf.attackRange, aggroRange: conf.detectionRadius
              });
          }
      }
      spawnZone('wild_dog', 20, 60, 150);
      spawnZone('wolf', 15, 150, 300);
      spawnZone('wild_boar', 10, 200, 400);
      spawnZone('bear', 10, 300, 600);
      spawnZone('tiger', 10, 500, 900);
      spawnZone('alpha_wolf', 5, 250, 500);
      set({ enemies: newEnemies });
  },
  spawnEnemyAt: (configId, position, aggro = false) => set(state => {
      const conf = ENEMY_CONFIGS[configId];
      if (!conf) return {};
      const newEnemy: Entity = {
          id: `${configId}-${Date.now()}-${Math.random()}`, configId: configId, type: 'enemy', name: conf.name, position: position, spawnOrigin: position, rotationY: Math.random() * Math.PI * 2,
          hp: conf.maxHp, maxHp: conf.maxHp, level: 1, damage: conf.damage, speed: conf.movementSpeed, expReward: conf.expReward,
          state: aggro ? 'chasing' : 'idle', stateTimer: 0, attackTimer: 0, isAggroed: aggro, isDead: false,
          attackRange: conf.attackRange, aggroRange: conf.detectionRadius, targetId: null
      };
      return { enemies: [...state.enemies, newEnemy] };
  }),
  updateEnemy: (id, data) => set(s => ({ enemies: s.enemies.map(e => e.id === id ? { ...e, ...data } : e) })),
  damageEnemy: (id, baseDmg, knockbackDir, isFinisher) => {
      const state = get();
      const enemy = state.enemies.find(e => e.id === id);
      if (!enemy || enemy.isDead) return;
      if (state.targetId !== id) set({ targetId: id });
      const derived = state.getDerivedStats();
      let finalDamage = baseDmg > 200 ? baseDmg : derived.attack * (baseDmg / 20);
      const isCrit = Math.random() < derived.critChance;
      if (isCrit) finalDamage *= 2.0;
      finalDamage = Math.floor(finalDamage * (0.95 + Math.random() * 0.1));
      const enemyDef = (enemy.level || 1) * 2;
      finalDamage = Math.max(1, finalDamage - enemyDef);
      const newHp = Math.max(0, enemy.hp - finalDamage);
      const isDead = newHp === 0;
      let updatedMetinData = {};
      if (enemy.type === 'metin' && enemy.configId) {
          const metinConf = METIN_CONFIGS[enemy.configId];
          if (metinConf) {
              const hpPercent = (newHp / enemy.maxHp) * 100;
              metinConf.spawnWaves.forEach(wave => {
                  if (hpPercent <= wave.triggerHPPercent && !(enemy.triggeredWaves || []).includes(wave.waveIndex)) {
                      for (let i=0; i<wave.count; i++) {
                          const angle = (Math.PI * 2 * i) / wave.count;
                          const rad = wave.spawnRadius;
                          const sx = enemy.position[0] + Math.sin(angle) * rad;
                          const sz = enemy.position[2] + Math.cos(angle) * rad;
                          state.spawnEnemyAt(wave.enemyConfigId, [sx, 0, sz], true);
                      }
                      updatedMetinData = { triggeredWaves: [...(enemy.triggeredWaves || []), wave.waveIndex] };
                      state.addChatMessage({ sender: 'Sistem', text: 'Metin Taşı güçlerini çağırdı!' });
                  }
              });
          }
      }
      let newPos = enemy.position;
      if (knockbackDir && enemy.type !== 'metin' && enemy.type !== 'npc') {
        const kbStrength = isFinisher ? 1.5 : 0.5;
        newPos = [enemy.position[0] + knockbackDir[0] * kbStrength, enemy.position[1], enemy.position[2] + knockbackDir[1] * kbStrength];
      }
      state.updateEnemy(id, { hp: newHp, isDead, deadTime: isDead ? Date.now() : undefined, lastHitTime: Date.now(), position: newPos, isAggroed: true, state: enemy.type === 'metin' ? 'idle' : 'chasing', ...updatedMetinData });
      state.addFloatingText({ position: [newPos[0], 2, newPos[2]], text: finalDamage.toString(), color: isCrit ? '#ffd700' : '#ffffff', scale: isCrit ? 2.0 : 1, isCritical: isCrit });
      if (isDead) {
          state.gainXp(enemy.expReward || 10);
          if (state.activeQuest && enemy.configId) state.updateQuestProgress(enemy.configId);
          let lootTableId = enemy.type === 'metin' ? (METIN_CONFIGS[enemy.configId!]?.lootTableId || '') : (ENEMY_CONFIGS[enemy.configId!]?.lootTableId || '');
          if (lootTableId && LOOT_TABLES[lootTableId]) {
             const newDrops = generateLootDrops(LOOT_TABLES[lootTableId], newPos);
             set(s => ({ drops: [...s.drops, ...newDrops] }));
          }
          state.saveGame();
      }
  },
  usePotion: () => {
      const state = get();
      for (let p = 0; p < state.inventory.pages.length; p++) {
          for (let s = 0; s < state.inventory.pages[p].slots.length; s++) {
              const item = state.inventory.pages[p].slots[s];
              if (item?.templateId === 'potion_red') {
                  state.useItem(p, s);
                  return;
              }
          }
      }
      state.addChatMessage({ sender: 'Sistem', text: 'İksir kalmadı!' });
  },
  healPlayer: (amount) => set(s => ({ playerHp: Math.min(s.playerMaxHp, s.playerHp + amount) })),
  pickupDrop: (id) => {
      const state = get();
      const drop = state.drops.find(d => d.id === id);
      if (!drop) return;
      if (drop.type === 'yang') {
          set(s => ({ playerYang: s.playerYang + drop.value }));
          state.addFloatingText({ position: [state.playerPosition[0], 2, state.playerPosition[2]], text: `+${drop.value} Yang`, color: '#ffd700' });
          set(s => ({ drops: s.drops.filter(d => d.id !== id) }));
      } else if (drop.type === 'item' && drop.item) {
          if (state.addItem(drop.item)) {
              state.addFloatingText({ position: [state.playerPosition[0], 2, state.playerPosition[2]], text: `${drop.item.name}`, color: '#00ff00' });
              set(s => ({ drops: s.drops.filter(d => d.id !== id) }));
          }
      }
      state.saveGame();
  },
  pickupAllNearby: () => {
      const state = get();
      const nearbyDrops = state.drops.filter(d => {
         const dist = Math.sqrt((d.position[0]-state.playerPosition[0])**2 + (d.position[2]-state.playerPosition[2])**2);
         return dist < 5;
      });
      nearbyDrops.forEach(d => state.pickupDrop(d.id));
      if (nearbyDrops.length === 0) {
          const npc = state.enemies.find(e => {
              if (e.type !== 'npc') return false;
              const dx = state.playerPosition[0] - e.position[0], dz = state.playerPosition[2] - e.position[2];
              return Math.sqrt(dx * dx + dz * dz) < 3;
          });
          if (npc) state.interactWithNpc(npc.id);
      }
  },
  addChatMessage: (msg) => set(s => ({ chatLog: [...s.chatLog.slice(-19), msg] })),
  addFloatingText: (t) => {
      const id = Math.random().toString();
      set(s => ({ floatingTexts: [...s.floatingTexts, { ...t, id, timestamp: Date.now() }] }));
      setTimeout(() => get().removeFloatingText(id), 1000);
  },
  removeFloatingText: (id) => set(s => ({ floatingTexts: s.floatingTexts.filter(t => t.id !== id) })),
  takeDamage: (amount) => set(s => {
      const def = s.getDerivedStats().defense;
      const dmg = Math.max(1, amount - def);
      const hp = Math.max(0, s.playerHp - dmg);
      return { playerHp: hp, gameState: hp === 0 ? GameState.DEAD : s.gameState };
  }),
  gainXp: (amount) => set(s => {
      let xp = s.playerXp + amount, lvl = s.playerLevel, sp = s.statPoints, skillP = s.skills.skillPoints, leveledUp = false;
      while(true) {
          const req = get().getExpRequired(lvl);
          if (xp >= req) { xp -= req; lvl++; sp += 3; skillP += 1; leveledUp = true; } else break;
      }
      if (leveledUp) s.addChatMessage({ sender: 'Sistem', text: `Seviye Atladın! Yeni Seviye: ${lvl}.` });
      return { playerXp: xp, playerLevel: lvl, statPoints: sp, skills: { ...s.skills, skillPoints: skillP }, isLeveledUp: leveledUp || s.isLeveledUp };
  }),
  saveGame: () => {
      const state = get();
      const saveData = {
          playerName: state.playerName, playerClass: state.playerClass, playerHp: state.playerHp, playerMp: state.playerMp,
          playerXp: state.playerXp, playerLevel: state.playerLevel, playerYang: state.playerYang, playerPosition: state.playerPosition,
          stats: state.stats, statPoints: state.statPoints, inventory: state.inventory, equipment: state.equipment,
          skills: state.skills, gameTime: state.gameTime, activeQuest: state.activeQuest, completedQuests: state.completedQuests
      };
      localStorage.setItem('metin2_save', JSON.stringify(saveData));
  },
  loadGame: () => {
      const saved = localStorage.getItem('metin2_save');
      if (saved) {
          const data = JSON.parse(saved);
          set({ ...data, gameState: GameState.PLAYING });
          get().spawnEnemies();
          get().addChatMessage({ sender: 'Sistem', text: 'Oyun yüklendi.' });
      }
  },
  resetGame: () => {
      localStorage.removeItem('metin2_save');
      set({ 
          gameState: GameState.PLAYING, playerHp: 850, playerLevel: 1, playerXp: 0, playerYang: 0,
          stats: { str: 5, vit: 5, dex: 5, int: 5 }, statPoints: 0,
          skills: { 
              slots: ['aura_sword', 'whirlwind', 'dash', 'sword_spin'], 
              learned: [
                  { skillId: 'aura_sword', currentLevel: 0, currentCooldown: 0 },
                  { skillId: 'whirlwind', currentLevel: 0, currentCooldown: 0 },
                  { skillId: 'dash', currentLevel: 0, currentCooldown: 0 },
                  { skillId: 'sword_spin', currentLevel: 0, currentCooldown: 0 }
              ], skillPoints: 0 
          },
          activeBuffs: [],
          inventory: { activePageIndex: 0, pages: [{ slots: Array(45).fill(null) }, { slots: Array(45).fill(null) }] },
          equipment: { weapon: null, armor: null, helmet: null, shield: null, boots: null, necklace: null, earrings: null, bracelet: null },
          enemies: [], drops: [], activeQuest: null, completedQuests: [], playerPosition: [0,0,0],
          moveDestination: null
      });
      get().spawnEnemies();
      get().addItem(createItem('sword_1'));
      get().addItem(createItem('potion_red', 10));
      get().equipItem(0,0);
  },
  tickGame: (delta) => {
      const state = get();
      if (state.gameState !== GameState.PLAYING) return;
      set({ gameTime: (state.gameTime + delta * 0.05) % 24 });
      const newLearned = state.skills.learned.map(s => ({ ...s, currentCooldown: Math.max(0, s.currentCooldown - delta) }));
      const newBuffs = state.activeBuffs.map(b => ({ ...b, remainingDuration: b.remainingDuration - delta })).filter(b => b.remainingDuration > 0);
      let newMp = state.playerMp < state.playerMaxMp ? Math.min(state.playerMaxMp, state.playerMp + (10 * delta)) : state.playerMp;
      let newHp = (state.playerHp < state.playerMaxHp && !state.targetId) ? Math.min(state.playerMaxMp, state.playerHp + (5 * delta)) : state.playerHp;
      if (state.skills.learned !== newLearned || state.activeBuffs !== newBuffs || newMp !== state.playerMp || newHp !== state.playerHp) {
          set({ skills: { ...state.skills, learned: newLearned }, activeBuffs: newBuffs, playerMp: newMp, playerHp: newHp });
      }
      const now = Date.now();
      const playerPos = state.playerPosition;
      let damageToTake = 0;
      const newEnemies = state.enemies.map(e => {
          if (e.isDead && e.type === 'enemy' && e.deadTime && (now - e.deadTime > 10000)) {
               return { ...e, isDead: false, hp: e.maxHp, state: 'idle', isAggroed: false, position: e.spawnOrigin, deadTime: undefined };
          }
          if (e.isDead || e.type === 'npc' || e.type === 'metin') return e;

          // AI CULLING: Only update AI if enemy is close to player
          const dx = e.position[0] - playerPos[0];
          const dz = e.position[2] - playerPos[2];
          const distSq = dx*dx + dz*dz;
          
          if (distSq > AI_ACTIVE_DISTANCE * AI_ACTIVE_DISTANCE) {
              return e; // Skip AI update for far away enemies
          }

          const conf = ENEMY_CONFIGS[e.configId!];
          if (!conf) return e;
          const res = updateEnemyAI(e, conf, [playerPos[0], playerPos[1], playerPos[2]], delta);
          if (res.didAttack) damageToTake += conf.damage;
          return res.updatedEnemy;
      });
      if (damageToTake > 0) get().takeDamage(damageToTake);
      set({ enemies: newEnemies });
  }
}));
