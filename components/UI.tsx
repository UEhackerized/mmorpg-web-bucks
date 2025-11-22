
import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { getNpcResponse } from '../services/geminiService';
import { Item, Equipment } from '../types';
import { SKILL_CONFIGS } from '../logic/skillConfig';
import { SHOP_CONFIGS } from '../logic/shopConfig';
import { NPC_CONFIGS } from '../logic/npcConfig';
import { createItem } from '../logic/itemFactory'; // For display lookup
import { inputSystem } from '../logic/inputSystem';
import { getRefinementConfig } from '../logic/refinementSystem';
import { getQuestForLevel, getQuestById } from '../logic/questConfig';

// Drag Drop Context
let draggedItem: { page: number, slot: number, type: 'inventory' } | { slotName: keyof Equipment, type: 'equipment' } | null = null;

const Tooltip: React.FC<{ item: Item, position: { x: number, y: number } }> = ({ item, position }) => {
    return (
        <div 
            className="fixed z-[100] bg-[#1a0f0a] border border-[#cfb53b] p-2 text-xs font-serif w-48 pointer-events-none shadow-[0_0_10px_black]"
            style={{ top: position.y, left: position.x + 10 }}
        >
            <div className="text-[#cfb53b] font-bold text-sm mb-1">{item.name} {item.upgradeLevel > 0 ? `+${item.upgradeLevel}` : ''}</div>
            <div className="text-gray-400 italic mb-2">{item.rarity} {item.type}</div>
            {item.requiredLevel > 0 && <div className="text-red-400">Level Required: {item.requiredLevel}</div>}
            <div className="space-y-1 mt-2 border-t border-gray-700 pt-1">
                {[...item.baseBonuses, ...item.extraBonuses].map((b, i) => {
                    // Display accurate stats with upgrade calc
                    const upgradeMult = 1 + (item.upgradeLevel * 0.1);
                    const val = ['ATTACK','DEFENSE','MAX_HP'].includes(b.type) ? Math.floor(b.value * upgradeMult) : b.value;
                    return (
                        <div key={i} className="flex justify-between text-blue-300">
                            <span>{b.type.replace('_', ' ')}</span>
                            <span>+{val}</span>
                        </div>
                    )
                })}
            </div>
             <div className="text-gray-500 text-[10px] italic mt-2 border-t border-gray-800">{item.description}</div>
        </div>
    )
}

const InventorySlotUI: React.FC<{ item: Item | null, index: number, page: number }> = ({ item, index, page }) => {
    const { moveItem, useItem, shopOpen, sellItem, refinementOpen, setRefinementItem } = useGameStore();
    const [hoverPos, setHoverPos] = useState<{x:number, y:number} | null>(null);

    const handleDragStart = (e: React.DragEvent) => {
        if (!item) return;
        draggedItem = { page, slot: index, type: 'inventory' };
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedItem) return;
        if (draggedItem.type === 'inventory') {
            moveItem(draggedItem.page, draggedItem.slot, page, index);
        } else if (draggedItem.type === 'equipment') {
             useGameStore.getState().unequipItem(draggedItem.slotName);
        }
        draggedItem = null;
    };

    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!item) return;
        
        if (shopOpen) {
            sellItem(page, index);
        } else if (refinementOpen) {
            setRefinementItem(page, index);
        } else {
            useItem(page, index);
        }
    };

    // GLOW EFFECT
    let borderClass = "border-gray-700 hover:border-yellow-500";
    let glowStyle = {};
    
    if (item && item.upgradeLevel >= 7) {
        if (item.upgradeLevel === 7) {
            borderClass = "border-white";
            glowStyle = { boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.5)' };
        } else if (item.upgradeLevel === 8) {
            borderClass = "border-cyan-400";
            glowStyle = { boxShadow: 'inset 0 0 10px rgba(0, 255, 255, 0.6)' };
        } else if (item.upgradeLevel >= 9) {
            borderClass = "border-red-500 animate-pulse";
            glowStyle = { boxShadow: 'inset 0 0 15px rgba(255, 0, 68, 0.7)' };
        }
    }

    return (
        <div 
            className={`w-8 h-8 bg-[#0a0503] border ${borderClass} relative group`}
            style={glowStyle}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onContextMenu={handleRightClick}
            onMouseEnter={(e) => setHoverPos({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHoverPos(null)}
        >
            {item && (
                <div draggable onDragStart={handleDragStart} className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
                    <div className="w-6 h-6 rounded-sm shadow-sm" style={{ backgroundColor: item.icon }}></div>
                    {item.quantity > 1 && <span className="absolute bottom-0 right-0 text-[9px] font-bold text-white bg-black/50 px-0.5">{item.quantity}</span>}
                    {item.upgradeLevel > 0 && <span className="absolute top-0 right-0 text-[9px] font-bold text-[#cfb53b] drop-shadow-md">+{item.upgradeLevel}</span>}
                </div>
            )}
            {item && hoverPos && <Tooltip item={item} position={hoverPos} />}
        </div>
    )
}

const EquipmentSlot: React.FC<{ slotName: keyof Equipment, icon: string }> = ({ slotName, icon }) => {
    const { equipment, unequipItem } = useGameStore();
    const item = equipment[slotName];
    const [hoverPos, setHoverPos] = useState<{x:number, y:number} | null>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (draggedItem && draggedItem.type === 'inventory') {
            useGameStore.getState().equipItem(draggedItem.page, draggedItem.slot);
        }
        draggedItem = null;
    };
    
    const handleDragStart = (e: React.DragEvent) => {
        if (!item) return;
        draggedItem = { slotName, type: 'equipment' };
    };

    // GLOW EFFECT
    let borderClass = "border-gray-600";
    let glowStyle = {};
    
    if (item && item.upgradeLevel >= 7) {
        if (item.upgradeLevel === 7) {
            borderClass = "border-white";
            glowStyle = { boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.5)' };
        } else if (item.upgradeLevel === 8) {
            borderClass = "border-cyan-400";
            glowStyle = { boxShadow: 'inset 0 0 10px rgba(0, 255, 255, 0.6)' };
        } else if (item.upgradeLevel >= 9) {
            borderClass = "border-red-500 animate-pulse";
            glowStyle = { boxShadow: 'inset 0 0 15px rgba(255, 0, 68, 0.7)' };
        }
    }

    return (
        <div 
            className={`w-10 h-10 bg-[#0a0503] border ${borderClass} flex items-center justify-center relative`}
            style={glowStyle}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onContextMenu={(e) => { e.preventDefault(); unequipItem(slotName); }}
            onMouseEnter={(e) => setHoverPos({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHoverPos(null)}
        >
             {item ? (
                 <div draggable onDragStart={handleDragStart} className="w-8 h-8 relative" style={{ backgroundColor: item.icon }}>
                    {item.upgradeLevel > 0 && <span className="absolute top-0 right-0 text-[9px] font-bold text-[#cfb53b] drop-shadow-md">+{item.upgradeLevel}</span>}
                 </div>
             ) : (
                 <span className="text-gray-700 text-[9px]">{icon}</span>
             )}
             {item && hoverPos && <Tooltip item={item} position={hoverPos} />}
        </div>
    )
}

// --- PANELS ---

const NpcDialogue: React.FC = () => {
    const { npcDialogueOpen, currentNpcId, setNpcDialogue, enemies, activeQuest, completedQuests, playerLevel, acceptQuest, completeQuest } = useGameStore();
    const [dialogueText, setDialogueText] = useState<string>("");
    const [questAction, setQuestAction] = useState<'start' | 'finish' | null>(null);
    const [availableQuestId, setAvailableQuestId] = useState<string | null>(null);

    useEffect(() => {
        if (!npcDialogueOpen || !currentNpcId) return;
        
        const npc = enemies.find(e => e.id === currentNpcId);
        if (!npc) return;

        let text = `Greetings, traveler. I am the ${npc.name}.`;
        let action = null;
        let questId = null;

        // 1. Check for Active Quest Turn-in
        if (activeQuest && activeQuest.isReadyToTurnIn) {
            const questConfig = getQuestById(activeQuest.questId);
            if (questConfig && questConfig.npcId === npc.configId) {
                text = questConfig.dialogComplete;
                action = 'finish';
                questId = questConfig.id;
            }
        } 
        // 2. Check for Active Quest Progress (Incomplete)
        else if (activeQuest) {
             const questConfig = getQuestById(activeQuest.questId);
             if (questConfig && questConfig.npcId === npc.configId) {
                 text = questConfig.dialogProgress;
             }
        }
        // 3. Check for New Available Quest
        else {
             // Find a quest for this level that hasn't been completed
             // We loop down from current level to find missed quests, or just check current level
             // Metin2 usually gives 1 quest per level.
             
             // Check if there is a quest for my level
             const levelQuest = getQuestForLevel(playerLevel);
             
             if (levelQuest && levelQuest.npcId === npc.configId && !completedQuests.includes(levelQuest.id)) {
                 text = levelQuest.dialogStart;
                 action = 'start';
                 questId = levelQuest.id;
             } else {
                 // Flavour text if no quests
                 if (npc.configId === 'v1_guide') text = "Patrolling the village is hard work. Keep moving.";
                 if (npc.configId === 'v1_general') text = "The Metin Stones are a threat to us all.";
             }
        }

        setDialogueText(text);
        setQuestAction(action as any);
        setAvailableQuestId(questId);

    }, [npcDialogueOpen, currentNpcId, activeQuest, completedQuests, playerLevel]);

    if (!npcDialogueOpen) return null;

    const npc = enemies.find(e => e.id === currentNpcId);
    if (!npc) return null;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-[#1a0f0a] border-4 border-[#cfb53b] shadow-2xl z-50 pointer-events-auto font-serif">
            <div className="bg-[#2a1810] p-2 border-b border-[#cfb53b] flex justify-between items-center">
                <span className="text-[#cfb53b] font-bold text-lg">{npc.name}</span>
                <button onClick={() => setNpcDialogue(false, null)} className="text-red-500 font-bold hover:text-red-300 text-xl">X</button>
            </div>
            <div className="p-6 flex gap-4">
                 <div className="w-20 h-20 bg-black border border-gray-600 flex items-center justify-center">
                      {/* Placeholder NPC Portrait */}
                      <div className="w-16 h-16" style={{ backgroundColor: npc.color }}></div>
                 </div>
                 <div className="flex-1 text-gray-200 text-sm leading-relaxed italic">
                     "{dialogueText}"
                 </div>
            </div>
            <div className="p-4 border-t border-[#cfb53b] bg-[#0a0503] flex justify-end gap-2">
                 {questAction === 'start' && availableQuestId && (
                     <button 
                        onClick={() => acceptQuest(availableQuestId)}
                        className="px-4 py-2 bg-green-900 border border-green-600 text-green-100 hover:bg-green-800 font-bold"
                     >
                         Accept Mission
                     </button>
                 )}
                 {questAction === 'finish' && (
                     <button 
                        onClick={() => completeQuest()}
                        className="px-4 py-2 bg-yellow-900 border border-yellow-600 text-yellow-100 hover:bg-yellow-800 font-bold animate-pulse"
                     >
                         Complete Mission
                     </button>
                 )}
                 <button 
                    onClick={() => setNpcDialogue(false, null)}
                    className="px-4 py-2 bg-gray-800 border border-gray-600 text-white hover:bg-gray-700"
                 >
                    Close
                 </button>
            </div>
        </div>
    )
}

const RefinementPanel: React.FC = () => {
    const { refinementOpen, setRefinementOpen, itemToUpgrade, inventory, upgradeItem, playerYang, setRefinementItem } = useGameStore();
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (draggedItem && draggedItem.type === 'inventory') {
            setRefinementItem(draggedItem.page, draggedItem.slot);
        }
        draggedItem = null;
    };

    if (!refinementOpen) return null;

    let item = null;
    let config = null;
    let nextLevel = 0;

    if (itemToUpgrade) {
        item = inventory.pages[itemToUpgrade.page].slots[itemToUpgrade.slot];
        if (item) {
            config = getRefinementConfig(item.upgradeLevel);
            nextLevel = item.upgradeLevel + 1;
        }
    }

    return (
        <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] bg-[#1a0f0a] border-2 border-[#cfb53b] text-white font-serif shadow-[0_0_20px_rgba(0,0,0,0.8)] z-50 pointer-events-auto"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
             <div className="bg-gradient-to-r from-[#3e2723] to-[#2a1810] p-2 border-b border-[#cfb53b] flex justify-between items-center">
                <span className="font-bold text-[#cfb53b] drop-shadow-md">Blacksmith</span>
                <button onClick={() => setRefinementOpen(false)} className="text-red-500 font-bold hover:text-red-300 px-2">X</button>
            </div>
            <div className="p-6 flex flex-col items-center gap-4 bg-black/40">
                {item ? (
                    <>
                        <div className="text-center">
                             <div className="text-gray-300 mb-1 text-sm">Do you want to improve?</div>
                             <div className="text-lg text-[#cfb53b] font-bold drop-shadow-md">{item.name} +{nextLevel}</div>
                        </div>
                        
                        <div className="relative w-20 h-20 border-2 border-[#5d4037] flex items-center justify-center bg-black shadow-inner">
                             <div className="w-12 h-12" style={{ backgroundColor: item.icon }}></div>
                             {item.upgradeLevel > 0 && <div className="absolute top-1 right-1 text-yellow-500 font-bold text-xs">+{item.upgradeLevel}</div>}
                        </div>

                        {config ? (
                            <div className="w-full bg-black/50 p-3 border border-gray-700 rounded space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Success Chance:</span>
                                    <span className={`${config.successChance > 0.5 ? 'text-green-400' : 'text-red-400'} font-bold`}>
                                        {(config.successChance * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Required Yang:</span>
                                    <span className={`${playerYang >= config.cost ? 'text-yellow-400' : 'text-red-500'} font-bold`}>
                                        {config.cost}
                                    </span>
                                </div>
                                <div className="text-[10px] text-red-400 text-center italic mt-1 pt-1 border-t border-gray-700">
                                    If failed, the item will be destroyed!
                                </div>
                            </div>
                        ) : (
                            <div className="text-red-500 font-bold animate-pulse">Max Level Reached</div>
                        )}

                        {config && (
                            <div className="flex gap-3 w-full mt-2">
                                <button 
                                    onClick={upgradeItem}
                                    disabled={playerYang < config.cost}
                                    className={`flex-1 py-2 font-bold border shadow-md transition-all ${playerYang >= config.cost ? 'bg-green-900 border-green-700 text-green-100 hover:bg-green-800 hover:scale-105' : 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed'}`}
                                >
                                    Yes
                                </button>
                                <button 
                                    onClick={() => setRefinementOpen(false)} 
                                    className="flex-1 py-2 bg-red-900 border border-red-700 text-red-100 hover:bg-red-800 font-bold shadow-md hover:scale-105 transition-all"
                                >
                                    No
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-gray-500 text-center py-10 border-2 border-dashed border-gray-700 w-full rounded bg-black/20">
                        <div className="mb-2 text-2xl opacity-50">⚒️</div>
                        <div className="text-sm">Drag Item Here</div>
                        <div className="text-xs italic opacity-70">Right click inventory item</div>
                    </div>
                )}
            </div>
        </div>
    )
}

const CharacterPanel: React.FC = () => {
    const { statWindowOpen, setStatWindowOpen, stats, statPoints, increaseStat, playerLevel, playerXp, getDerivedStats, playerName, playerClass } = useGameStore();
    if (!statWindowOpen) return null;
    const derived = getDerivedStats();

    return (
        <div className="absolute top-20 left-20 w-[280px] bg-[#1a0f0a] border-2 border-[#cfb53b] text-white font-serif shadow-2xl z-40 pointer-events-auto">
            <div className="bg-[#2a1810] p-1 border-b border-[#cfb53b] flex justify-between items-center cursor-move">
                <span className="font-bold text-[#cfb53b] px-2 text-sm">Character (C)</span>
                <button onClick={() => setStatWindowOpen(false)} className="text-red-500 font-bold hover:text-red-300 px-2">X</button>
            </div>
            <div className="p-4 space-y-4 text-sm">
                <div>
                    <div className="flex justify-between text-yellow-500 font-bold border-b border-gray-700 pb-1">
                        <span className="capitalize">{playerClass}</span>
                        <span>Lv. {playerLevel}</span>
                    </div>
                     <div className="text-center text-gray-300 my-1">{playerName}</div>
                    <div className="flex justify-between text-gray-400 mt-1"><span>EXP</span><span>{playerXp}</span></div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-green-400 font-bold"><span>Points:</span><span>{statPoints}</span></div>
                    {[{ label: 'VIT', key: 'vit', desc: 'HP/Def' }, { label: 'INT', key: 'int', desc: 'Magic' }, { label: 'STR', key: 'str', desc: 'Attack' }, { label: 'DEX', key: 'dex', desc: 'Spd/Crit' }].map((s) => (
                        <div key={s.key} className="flex items-center justify-between bg-black/30 p-1 px-2 rounded">
                             <div className="flex flex-col"><span className="text-yellow-100 font-bold">{s.label}</span><span className="text-[9px] text-gray-500">{s.desc}</span></div>
                             <div className="flex items-center gap-2">
                                 <span className="text-lg">{stats[s.key as keyof typeof stats]}</span>
                                 {statPoints > 0 && <button onClick={() => increaseStat(s.key as any)} className="w-5 h-5 bg-yellow-700 hover:bg-yellow-600 text-white text-xs flex items-center justify-center rounded border border-yellow-500">+</button>}
                             </div>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-600 pt-2 space-y-1 text-gray-300 text-xs">
                     <div className="flex justify-between"><span>Attack:</span> <span className="text-white">{derived.attack}</span></div>
                     <div className="flex justify-between"><span>Magic:</span> <span className="text-white">{derived.magic}</span></div>
                     <div className="flex justify-between"><span>Defense:</span> <span className="text-white">{derived.defense}</span></div>
                     <div className="flex justify-between"><span>Crit:</span> <span className="text-white">{(derived.critChance * 100).toFixed(1)}%</span></div>
                     <div className="flex justify-between"><span>Speed:</span> <span className="text-white">{derived.speed.toFixed(0)}</span></div>
                </div>
            </div>
        </div>
    )
}

const SkillPanel: React.FC = () => {
    const { skillWindowOpen, setSkillWindowOpen, skills, levelUpSkill } = useGameStore();
    if (!skillWindowOpen) return null;

    return (
        <div className="absolute top-20 left-96 w-[300px] bg-[#1a0f0a] border-2 border-[#cfb53b] text-white font-serif shadow-2xl z-40 pointer-events-auto">
             <div className="bg-[#2a1810] p-1 border-b border-[#cfb53b] flex justify-between items-center cursor-move">
                <span className="font-bold text-[#cfb53b] px-2 text-sm">Skills (K)</span>
                <button onClick={() => setSkillWindowOpen(false)} className="text-red-500 font-bold hover:text-red-300 px-2">X</button>
            </div>
            <div className="p-4 space-y-4">
                 <div className="flex justify-between text-green-400 font-bold text-sm border-b border-gray-700 pb-1">
                     <span>Skill Points:</span>
                     <span>{skills.skillPoints}</span>
                 </div>
                 <div className="space-y-2">
                     {skills.learned.map(skill => {
                         const config = SKILL_CONFIGS[skill.skillId];
                         if (!config) return null;
                         return (
                             <div key={skill.skillId} className="flex items-center gap-2 bg-black/30 p-2 rounded border border-gray-700">
                                 <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: config.icon }}>
                                     {skill.currentLevel > 0 ? <span className="font-bold text-white">{skill.currentLevel}</span> : <span className="text-gray-500 text-xs">Locked</span>}
                                 </div>
                                 <div className="flex-1">
                                     <div className="text-yellow-200 text-sm font-bold">{config.name}</div>
                                     <div className="text-[10px] text-gray-400">{config.description}</div>
                                 </div>
                                 {skills.skillPoints > 0 && skill.currentLevel < 20 && (
                                     <button onClick={() => levelUpSkill(skill.skillId)} className="w-6 h-6 bg-yellow-700 hover:bg-yellow-600 text-white text-xs rounded border border-yellow-500">+</button>
                                 )}
                             </div>
                         )
                     })}
                 </div>
            </div>
        </div>
    )
}

const InventoryPanel: React.FC = () => {
    const { inventoryOpen, setInventoryOpen, inventory, playerYang } = useGameStore();
    if (!inventoryOpen) return null;
    
    const activePage = inventory.pages[inventory.activePageIndex];
    
    return (
        <div className="absolute top-20 right-20 w-[340px] bg-[#1a0f0a] border-2 border-[#8B4513] rounded shadow-2xl pointer-events-auto font-serif z-40">
            <div className="bg-[#2a1810] p-1 border-b border-[#8B4513] flex justify-between items-center cursor-move">
                <span className="text-[#cfb53b] font-bold text-sm px-2">Inventory (I)</span>
                <button onClick={() => setInventoryOpen(false)} className="text-red-500 font-bold px-2 hover:text-red-300">X</button>
            </div>
            <div className="flex flex-row">
                <div className="w-24 bg-[#0a0503] p-2 border-r border-[#8B4513] flex flex-col items-center gap-2">
                    <EquipmentSlot slotName="helmet" icon="Helm" />
                    <div className="flex gap-2"><EquipmentSlot slotName="weapon" icon="Wpn" /><EquipmentSlot slotName="armor" icon="Arm" /></div>
                    <EquipmentSlot slotName="boots" icon="Boot" />
                </div>
                <div className="flex-1 p-2 bg-[#1a0f0a]">
                    <div className="grid grid-cols-5 gap-1 mb-2">
                        {activePage.slots.map((item, idx) => (<InventorySlotUI key={idx} item={item} index={idx} page={inventory.activePageIndex} />))}
                    </div>
                    <div className="flex justify-center gap-2">{[0, 1].map(i => (<button key={i} onClick={() => useGameStore.setState(s => ({ inventory: { ...s.inventory, activePageIndex: i } }))} className={`w-6 h-6 text-xs border ${inventory.activePageIndex === i ? 'border-yellow-500 text-yellow-500' : 'border-gray-600 text-gray-500'}`}>{i+1}</button>))}</div>
                    <div className="text-right mt-2 text-xs text-yellow-500 border-t border-gray-700 pt-1">{playerYang.toLocaleString()} Yang</div>
                </div>
            </div>
        </div>
    )
}

const ShopPanel: React.FC = () => {
    const { shopOpen, setShopOpen, buyItem, activeShopId, playerYang } = useGameStore();
    
    if (!shopOpen || !activeShopId) return null;
    
    const config = SHOP_CONFIGS[activeShopId];
    if (!config) return null;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-[#1a0f0a] border-2 border-[#8B4513] rounded-sm shadow-2xl z-50 pointer-events-auto font-serif">
            <div className="bg-[#2a1810] p-2 border-b border-[#8B4513] flex justify-between items-center">
                <span className="text-yellow-500 font-bold">{config.name}</span>
                <button onClick={() => setShopOpen(false)} className="text-red-500 font-bold px-2 hover:text-red-300">X</button>
            </div>
            <div className="p-2 grid grid-cols-4 gap-1 bg-[#0a0503] max-h-80 overflow-y-auto">
                {config.items.map((shopItem, i) => {
                    // Re-create a dummy item to get display properties
                    const dummy = createItem(shopItem.itemId);
                    if (!dummy) return null;
                    
                    return (
                         <div key={i} 
                              className="relative w-20 h-28 bg-[#1a0f0a] border border-gray-700 hover:border-yellow-500 cursor-pointer flex flex-col items-center justify-between p-1 group"
                              onClick={() => buyItem(shopItem.itemId, shopItem.price)}
                         >
                             <div className="text-[9px] text-gray-300 text-center leading-tight h-6 overflow-hidden">{dummy.name}</div>
                             <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: dummy.icon }}></div>
                             <div className="text-[10px] text-yellow-500 font-bold">{shopItem.price} Y</div>
                             <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-xs text-white font-bold">Buy</div>
                         </div>
                    )
                })}
            </div>
            <div className="bg-[#2a1810] p-2 border-t border-[#8B4513] flex justify-between text-xs">
                 <span className="text-yellow-600">My Yang:</span><span className="text-white">{playerYang.toLocaleString()}</span>
                 <span className="text-gray-500 italic">Right click inventory to sell</span>
            </div>
        </div>
    )
}

const QuestPanel: React.FC = () => {
    const { questLogOpen, setQuestLogOpen, activeQuest, completedQuests } = useGameStore();
    if (!questLogOpen) return null;

    let currentQuestConfig = null;
    if (activeQuest) {
        currentQuestConfig = getQuestById(activeQuest.questId);
    }

    return (
        <div className="absolute top-32 left-10 w-[320px] bg-[#1a0f0a] border-2 border-[#cfb53b] text-white font-serif shadow-2xl z-40 pointer-events-auto">
             <div className="bg-[#2a1810] p-1 border-b border-[#cfb53b] flex justify-between items-center cursor-move">
                <span className="font-bold text-[#cfb53b] px-2 text-sm">Quest Log (J)</span>
                <button onClick={() => setQuestLogOpen(false)} className="text-red-500 font-bold hover:text-red-300 px-2">X</button>
            </div>
            <div className="p-4 text-sm text-gray-300 h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-600">
                
                <div className="mb-4">
                    <div className="text-yellow-500 font-bold border-b border-gray-700 mb-2">Current Mission</div>
                    {activeQuest && currentQuestConfig ? (
                        <div className="bg-black/30 p-2 rounded border border-gray-700">
                             <div className="font-bold text-white mb-1">{currentQuestConfig.title}</div>
                             <div className="text-xs text-gray-400 italic mb-2">{currentQuestConfig.description}</div>
                             
                             <div className="text-xs text-green-400">
                                 Objective: {currentQuestConfig.targetEnemyId?.replace('_', ' ')} 
                                 <span className="ml-2 font-bold">({activeQuest.currentCount} / {currentQuestConfig.requiredCount})</span>
                             </div>

                             {activeQuest.isReadyToTurnIn && (
                                 <div className="mt-2 text-yellow-400 font-bold animate-pulse">
                                     Return to NPC to complete!
                                 </div>
                             )}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center italic">No active mission.</div>
                    )}
                </div>

                <div>
                    <div className="text-gray-500 font-bold border-b border-gray-700 mb-2">Completed ({completedQuests.length})</div>
                    <ul className="list-none space-y-1 text-xs text-gray-500">
                        {completedQuests.map(qid => {
                            const q = getQuestById(qid);
                            return q ? <li key={qid} className="line-through">{q.title}</li> : null;
                        })}
                    </ul>
                </div>

            </div>
        </div>
    )
}

const MapPanel: React.FC = () => {
    const { mapOpen, setMapOpen, playerPosition } = useGameStore();
    if (!mapOpen) return null;
    // Coordinate transform for full map view
    const mapX = 150 + playerPosition[0] * 2; 
    const mapY = 150 + playerPosition[2] * 2; 

    return (
        <div className="absolute inset-20 bg-[#1a0f0a] border-2 border-[#cfb53b] z-50 pointer-events-auto flex flex-col shadow-2xl">
             <div className="bg-[#2a1810] p-1 border-b border-[#cfb53b] flex justify-between items-center">
                <span className="font-bold text-[#cfb53b] px-2">World Map (M)</span>
                <button onClick={() => setMapOpen(false)} className="text-red-500 font-bold hover:text-red-300 px-2">X</button>
            </div>
            <div className="flex-1 bg-black/80 relative overflow-hidden flex items-center justify-center">
                <div className="w-[300px] h-[300px] bg-green-900/50 rounded-full border border-green-700 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-green-500/20 text-4xl font-bold">MAP VIEW</div>
                    {/* Player Dot */}
                    <div className="absolute w-3 h-3 bg-red-500 rounded-full border border-white" style={{ left: mapX, top: mapY, transform: 'translate(-50%, -50%)' }}></div>
                </div>
            </div>
        </div>
    )
}

const SystemMenuOverlay: React.FC = () => {
    const { systemMenuOpen, setSystemMenuOpen, resetGame, saveGame } = useGameStore();
    if (!systemMenuOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/70 z-[60] flex items-center justify-center pointer-events-auto">
            <div className="w-64 bg-[#1a0f0a] border-2 border-[#cfb53b] p-4 flex flex-col gap-4 text-center shadow-2xl">
                <h2 className="text-[#cfb53b] font-serif text-xl font-bold border-b border-gray-700 pb-2">System Menu</h2>
                <button onClick={() => setSystemMenuOpen(false)} className="bg-gray-800 text-white py-2 border border-gray-600 hover:bg-gray-700">Resume Game</button>
                <button onClick={() => { saveGame(); setSystemMenuOpen(false); }} className="bg-gray-800 text-green-400 py-2 border border-gray-600 hover:bg-gray-700">Save Game</button>
                <button onClick={() => { resetGame(); setSystemMenuOpen(false); window.location.reload(); }} className="bg-red-900 text-white py-2 border border-red-700 hover:bg-red-800">Log Out</button>
            </div>
        </div>
    )
}

// --- HUD COMPONENTS ---

const PlayerStatusHUD: React.FC = () => {
    const { playerHp, playerMaxHp, playerMp, playerMaxMp, playerXp, playerLevel, getExpRequired, statPoints, skills, playerName, playerClass } = useGameStore();
    
    return (
        <div className="fixed bottom-4 left-4 w-64 pointer-events-auto">
             <div className="relative bg-gray-900/80 border-2 border-[#cfb53b] rounded-lg p-2 font-serif text-white shadow-lg group">
                <div className="flex justify-between mb-1">
                    <span className="font-bold text-[#cfb53b] capitalize">{playerName} ({playerClass})</span>
                    <span>Lv. {playerLevel}</span>
                </div>
                {/* HP Bar */}
                <div className="relative h-4 bg-gray-800 rounded-sm mb-1 border border-gray-600">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-300" style={{ width: `${(playerHp / playerMaxHp) * 100}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold drop-shadow-md z-10 text-white">{Math.floor(playerHp)} / {playerMaxHp}</span>
                </div>
                {/* MP Bar */}
                <div className="relative h-3 bg-gray-800 rounded-sm border border-gray-600 mb-1">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-700 to-blue-500" style={{ width: `${(playerMp / playerMaxMp) * 100}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold drop-shadow-md z-10 text-white">{Math.floor(playerMp)} / {playerMaxMp}</span>
                </div>
                
                {/* XP Orb Bar */}
                 <div className="flex gap-0.5 mt-1">
                    {[0, 1, 2, 3].map((orb) => {
                        const totalBallXp = getExpRequired(playerLevel) / 4;
                        const currentBallXp = Math.max(0, playerXp - (orb * totalBallXp));
                        const fill = Math.min(1, currentBallXp / totalBallXp);
                        return <div key={orb} className="relative flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-600"><div className="h-full bg-yellow-500 transition-all duration-300" style={{ width: `${fill * 100}%` }} /></div>
                    })}
                 </div>

                {/* Stat Point Indicator */}
                {(statPoints > 0 || skills.skillPoints > 0) && (
                    <div className="absolute -top-8 left-0 flex gap-2">
                        {statPoints > 0 && <div className="bg-[#cfb53b] text-black text-[10px] font-bold px-2 py-1 rounded border border-white shadow-lg animate-bounce cursor-pointer" onClick={() => useGameStore.setState({ statWindowOpen: true })}>STATS +</div>}
                        {skills.skillPoints > 0 && <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded border border-white shadow-lg animate-bounce cursor-pointer" onClick={() => useGameStore.setState({ skillWindowOpen: true })}>SKILLS +</div>}
                    </div>
                )}
             </div>
        </div>
    )
}

const SkillBarHUD: React.FC = () => {
    const { skills, activateSkill, activeBuffs, activeQuickslotBar } = useGameStore();
    
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-2">
            {/* Quickslot Bar Selection */}
            <div className="flex gap-2 text-xs text-gray-400">
                {[1, 2, 3, 4].map(n => (
                    <span key={n} className={activeQuickslotBar === n ? "text-yellow-500 font-bold" : ""}>F{n}</span>
                ))}
            </div>

            {/* Buffs */}
            <div className="flex gap-1 mb-1">
                {activeBuffs.map((buff, i) => (
                     <div key={i} className="w-6 h-6 rounded-full bg-gray-800 border border-green-500 flex items-center justify-center overflow-hidden" title="Active Buff">
                         <div className="w-full h-full opacity-80" style={{ backgroundColor: SKILL_CONFIGS[buff.skillId]?.icon || '#fff' }}></div>
                     </div>
                ))}
            </div>

            <div className="flex gap-1 bg-gray-900/90 p-1 border border-[#cfb53b] rounded shadow-xl">
                {skills.slots.map((skillId, idx) => {
                    if (!skillId) return <div key={idx} className="w-10 h-10 bg-gray-800 border border-gray-600 flex items-center justify-center text-gray-600 text-xs">{idx+1}</div>;
                    
                    const config = SKILL_CONFIGS[skillId];
                    const state = skills.learned.find(s => s.skillId === skillId);
                    const cooldown = state?.currentCooldown || 0;
                    
                    return (
                        <div 
                            key={idx} 
                            className="relative w-10 h-10 bg-gray-800 border border-gray-600 flex items-center justify-center cursor-pointer overflow-hidden group"
                            onClick={() => activateSkill(idx)}
                            title={config?.name}
                        >
                            <div className="absolute top-0 left-1 z-10 text-white drop-shadow-md text-xs font-bold">{idx + 1}</div>
                            <div className="w-full h-full" style={{ backgroundColor: config?.icon || '#444' }}></div>
                            
                            {(state?.currentLevel || 0) === 0 && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-[8px] text-red-400 font-bold">LOCKED</div>
                            )}

                            {cooldown > 0 && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">{Math.ceil(cooldown)}</span>
                                </div>
                            )}
                        </div>
                    )
                })}
                
                {/* Potion Slot */}
                 <div className="relative w-10 h-10 bg-gray-800 border border-gray-600 flex items-center justify-center cursor-pointer border-l-2 border-gray-500 ml-2" onClick={() => useGameStore.getState().usePotion()}>
                     <span className="absolute top-0 left-1 z-10 text-white drop-shadow-md text-xs font-bold"></span>
                     <div className="w-6 h-6 rounded-full bg-red-600 border border-red-300 shadow-[0_0_5px_red]"></div>
                </div>
            </div>
        </div>
    )
}

const ChatWindow: React.FC = () => {
    const { chatLog, addChatMessage } = useGameStore();
    const [inputMsg, setInputMsg] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [chatLog]);

    return (
        <div className="fixed bottom-28 left-4 w-80 h-40 bg-black/40 hover:bg-black/60 transition-colors rounded p-2 pointer-events-auto flex flex-col border border-gray-700/50">
            <div className="flex-1 overflow-y-auto mb-1 text-xs font-sans space-y-0.5 scrollbar-thin scrollbar-thumb-yellow-600">
                {chatLog.map((msg, idx) => (
                    <div key={idx} className={`${msg.isSystem ? 'text-[#ffeb3b]' : 'text-white'} drop-shadow-md`}>
                        {msg.sender !== 'System' && <span className="font-bold text-[#cfb53b] mr-1">{msg.sender}:</span>}
                        {msg.text}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <input 
                className="w-full bg-black/50 border border-gray-600 text-white text-xs p-1 rounded focus:outline-none focus:border-[#cfb53b]" 
                placeholder="Press Enter to chat..." 
                value={inputMsg} 
                onChange={(e) => setInputMsg(e.target.value)} 
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputMsg.trim()) {
                        addChatMessage({ sender: 'You', text: inputMsg });
                        setInputMsg('');
                    }
                }} 
            />
        </div>
    )
}

const MinimapHUD: React.FC = () => {
    const { gameTime, playerPosition } = useGameStore();
    
    const hours = Math.floor(gameTime);
    const minutes = Math.floor((gameTime - hours) * 60);
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const coordX = Math.floor(Math.abs(playerPosition[0] * 2 + 400));
    const coordY = Math.floor(Math.abs(playerPosition[2] * 2 + 400));

    return (
        <div className="fixed top-4 right-4 pointer-events-auto flex flex-col items-end gap-2">
            <div className="w-32 h-32 rounded-full border-4 border-[#cfb53b] bg-black/50 relative overflow-hidden shadow-lg">
                {/* Dynamic Minimap Dot */}
                <div className="absolute w-2 h-2 bg-red-600 rounded-full shadow-[0_0_4px_red] transition-transform duration-100" 
                     style={{ 
                         top: '50%', 
                         left: '50%', 
                         transform: `translate(${playerPosition[0]}px, ${playerPosition[2]}px)` 
                     }} 
                />
                <div className="absolute inset-0 flex items-center justify-center text-gray-500/50 text-[10px] font-bold pointer-events-none">Map 1 (M)</div>
            </div>
            <div className="flex flex-col items-end">
                <div className="bg-black/70 border border-[#cfb53b] px-2 py-1 text-yellow-400 font-serif font-bold text-sm rounded">{timeString}</div>
                <div className="text-xs text-[#cfb53b] font-bold mt-1 drop-shadow-md">{coordX}, {coordY}</div>
            </div>
        </div>
    )
}

const TargetStatusHUD: React.FC = () => {
    const { targetId, enemies } = useGameStore();
    const target = enemies.find(e => e.id === targetId);

    if (!target || target.isDead) return null;

    const isMetin = target.type === 'metin';
    const percent = (target.hp / target.maxHp) * 100;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 pointer-events-auto w-64">
            <div className="bg-black/80 border border-red-900 p-1 rounded shadow-lg text-center">
                <div className={`text-xs font-bold mb-0.5 ${isMetin ? 'text-purple-400' : 'text-red-400'}`}>
                    Lv.{target.level} {target.name}
                </div>
                <div className="relative h-3 bg-gray-900 border border-gray-700 rounded-sm">
                    <div className="h-full bg-red-600 transition-all duration-200" style={{ width: `${percent}%` }}></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-bold drop-shadow-md">{Math.floor(target.hp)} / {target.maxHp}</span>
                </div>
            </div>
        </div>
    )
}

const QuestTrackerHUD: React.FC = () => {
    const { activeQuest, questLogOpen } = useGameStore();
    // Hide if log is open to avoid duplicate info, or keep it as a small sticky
    if (questLogOpen || !activeQuest) return null;

    const questConfig = getQuestById(activeQuest.questId);
    if (!questConfig) return null;

    return (
        <div className="fixed top-32 left-4 pointer-events-auto w-48 animate-in fade-in slide-in-from-left duration-500">
            <div className="bg-black/40 border-l-2 border-[#cfb53b] p-2 font-serif text-white shadow-sm backdrop-blur-sm">
                <div className="text-[#cfb53b] text-xs font-bold uppercase mb-1 tracking-wider">Current Mission</div>
                <div className="text-sm font-bold">{questConfig.title}</div>
                <div className="text-xs mt-1 text-gray-300">
                    {questConfig.targetEnemyId?.replace('_', ' ')}: 
                    <span className={activeQuest.isReadyToTurnIn ? "text-green-400 font-bold ml-1" : "text-white ml-1"}>
                        {activeQuest.currentCount} / {questConfig.requiredCount}
                    </span>
                </div>
                {activeQuest.isReadyToTurnIn && (
                    <div className="text-[10px] text-yellow-400 mt-1 animate-pulse">Return to {NPC_CONFIGS[questConfig.npcId].name}</div>
                )}
            </div>
        </div>
    )
}

const QuickButtonsHUD: React.FC = () => {
    const { inventoryOpen, setInventoryOpen, statWindowOpen, setStatWindowOpen, skillWindowOpen, setSkillWindowOpen, mapOpen, setMapOpen, questLogOpen, setQuestLogOpen } = useGameStore();

    const Btn = ({ label, active, onClick, color }: any) => (
        <button 
            onClick={onClick}
            className={`w-8 h-8 flex items-center justify-center border ${active ? 'border-white bg-gray-700' : 'border-gray-600 bg-black/60'} hover:bg-gray-600 rounded shadow-md transition-colors font-bold text-xs ${color}`}
            title={label}
        >
            {label[0]}
        </button>
    );

    return (
        <div className="fixed bottom-32 right-4 pointer-events-auto flex flex-col gap-1">
            <Btn label="Character (C)" active={statWindowOpen} onClick={() => setStatWindowOpen(!statWindowOpen)} color="text-yellow-500" />
            <Btn label="Inventory (I)" active={inventoryOpen} onClick={() => setInventoryOpen(!inventoryOpen)} color="text-yellow-200" />
            <Btn label="Skills (K)" active={skillWindowOpen} onClick={() => setSkillWindowOpen(!skillWindowOpen)} color="text-blue-400" />
            <Btn label="Quests (J)" active={questLogOpen} onClick={() => setQuestLogOpen(!questLogOpen)} color="text-green-400" />
            <Btn label="Map (M)" active={mapOpen} onClick={() => setMapOpen(!mapOpen)} color="text-gray-400" />
            <Btn label="Menu (Esc)" active={false} onClick={() => useGameStore.setState({ systemMenuOpen: true })} color="text-red-400" />
        </div>
    )
}

// --- MAIN UI COMPONENT ---

export const UI: React.FC = () => {
  // Handle Input Toggles
  useEffect(() => {
      const store = useGameStore.getState;
      const toggles = [
          inputSystem.onAction('TOGGLE_INVENTORY', () => store().setInventoryOpen(!store().inventoryOpen)),
          inputSystem.onAction('TOGGLE_CHARACTER_PANEL', () => store().setStatWindowOpen(!store().statWindowOpen)),
          inputSystem.onAction('TOGGLE_SKILL_PANEL', () => store().setSkillWindowOpen(!store().skillWindowOpen)),
          inputSystem.onAction('TOGGLE_MAP', () => store().setMapOpen(!store().mapOpen)),
          inputSystem.onAction('TOGGLE_QUEST_LOG', () => store().setQuestLogOpen(!store().questLogOpen)),
          inputSystem.onAction('OPEN_MENU', () => {
              const s = store();
              if (s.inventoryOpen || s.statWindowOpen || s.skillWindowOpen || s.mapOpen || s.questLogOpen || s.shopOpen || s.refinementOpen || s.npcDialogueOpen) {
                  s.closeAllPanels();
              } else {
                  s.setSystemMenuOpen(!s.systemMenuOpen);
              }
          })
      ];
      return () => toggles.forEach(u => u());
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none font-sans select-none">
        {/* HUD Elements (Always Visible) */}
        <PlayerStatusHUD />
        <SkillBarHUD />
        <ChatWindow />
        <MinimapHUD />
        <TargetStatusHUD />
        <QuestTrackerHUD />
        <QuickButtonsHUD />

        {/* Panels (Conditional) */}
        <InventoryPanel />
        <CharacterPanel />
        <SkillPanel />
        <MapPanel />
        <QuestPanel />
        <ShopPanel />
        <RefinementPanel />
        <NpcDialogue />
        <SystemMenuOverlay />
    </div>
  );
};
