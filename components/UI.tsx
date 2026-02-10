
import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { inputSystem } from '../logic/inputSystem';

const Joystick: React.FC = () => {
    const [dragging, setDragging] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleStart = (e: any) => setDragging(true);
    const handleMove = (e: any) => {
        if (!dragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2, centerY = rect.top + rect.height / 2;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX, clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let dx = clientX - centerX, dy = clientY - centerY;
        const dist = Math.sqrt(dx*dx + dy*dy), maxDist = 35;
        if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; }
        setPos({ x: dx, y: dy });
        inputSystem.joystickVector = { x: dx / maxDist, y: -dy / maxDist };
    };
    const handleEnd = () => {
        setDragging(false);
        setPos({ x: 0, y: 0 });
        inputSystem.joystickVector = { x: 0, y: 0 };
    };

    return (
        <div 
            ref={containerRef}
            className="fixed bottom-32 left-10 w-28 h-28 bg-black/40 rounded-full border-2 border-white/20 flex items-center justify-center z-[100] lg:hidden touch-none"
            onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
        >
            <div className="w-12 h-12 bg-yellow-600/80 rounded-full shadow-[0_0_15px_rgba(202,138,4,0.5)]" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }} />
        </div>
    );
};

const SkillSlot: React.FC<{ index: number; label: string }> = ({ index, label }) => {
    const { activateSkill, skills } = useGameStore();
    const skillId = skills.slots[index];
    const skillState = skills.learned.find(s => s.skillId === skillId);
    const isCooldown = skillState && skillState.currentCooldown > 0;
    const progress = skillState ? (skillState.currentCooldown / 15) * 100 : 0; // Assuming 15s avg cooldown

    return (
        <div 
            onClick={() => activateSkill(index)}
            className="w-8 h-8 md:w-10 md:h-10 bg-gray-900 border border-gray-700 relative cursor-pointer hover:border-yellow-500 group overflow-hidden"
        >
            {skillId && <div className={`w-full h-full bg-blue-500/40 group-active:scale-95 transition-transform`} />}
            {isCooldown && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="absolute bottom-0 left-0 w-full bg-yellow-500/30" style={{ height: `${progress}%` }} />
                    <span className="text-[10px] text-white font-bold z-10">{Math.ceil(skillState.currentCooldown)}</span>
                </div>
            )}
            <div className="absolute bottom-0 right-0 bg-black/80 text-[8px] px-0.5 text-gray-400 border-tl border-gray-700">{label}</div>
        </div>
    );
};

export const UI: React.FC = () => {
  const { 
    playerHp, playerMaxHp, playerMp, playerMaxMp, playerXp, playerLevel, playerName,
    inventoryOpen, setInventoryOpen, statWindowOpen, setStatWindowOpen, skillWindowOpen, setSkillWindowOpen,
    getExpRequired, closeAllPanels
  } = useGameStore();

  const expRequired = getExpRequired(playerLevel);
  const expPercent = (playerXp / expRequired) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none font-sans select-none overflow-hidden touch-none">
        <Joystick />

        {/* TOP RIGHT: Minimap Area */}
        <div className="fixed top-4 right-4 flex flex-col items-end gap-2 pointer-events-auto">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-black/80 border-2 border-[#cfb53b]/50 rounded-full overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-500 rounded-full border border-white" />
                <div className="absolute bottom-1 right-1/2 translate-x-1/2 text-[8px] text-[#cfb53b] font-bold">CH1</div>
            </div>
        </div>

        {/* BOTTOM HUD: Classic Metin2 Style */}
        <div className="fixed bottom-0 left-0 w-full h-16 md:h-20 bg-gradient-to-t from-black to-transparent pointer-events-none flex items-end justify-center pb-2 px-4 z-50">
            <div className="w-full max-w-4xl flex items-center justify-between pointer-events-auto bg-black/80 border-t border-x border-[#cfb53b]/30 rounded-t-xl px-4 py-2 relative">
                
                {/* HP Globe (Left) */}
                <div className="flex items-center gap-2 group">
                    <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-900 border-2 border-red-900/50 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                        <div 
                            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-red-900 via-red-600 to-red-400 transition-all duration-500 shadow-[0_-5px_15px_rgba(220,38,38,0.5)]" 
                            style={{ height: `${(playerHp/playerMaxHp)*100}%` }} 
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-[8px] md:text-[10px] text-white font-bold drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                            {Math.floor(playerHp)}/{playerMaxHp}
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col">
                        <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-tighter">{playerName}</span>
                        <span className="text-gray-400 text-[9px]">Lv.{playerLevel}</span>
                    </div>
                </div>

                {/* Skill & Action Slots (Middle) */}
                <div className="flex items-center gap-1 md:gap-2">
                    <div className="grid grid-cols-4 gap-1">
                        <SkillSlot index={0} label="1" />
                        <SkillSlot index={1} label="2" />
                        <SkillSlot index={2} label="3" />
                        <SkillSlot index={3} label="4" />
                    </div>
                    <div className="w-[1px] h-8 bg-gray-700 mx-1 hidden md:block" />
                    <div className="grid grid-cols-4 gap-1 hidden md:grid">
                        <div className="w-10 h-10 bg-gray-900 border border-gray-700 flex items-center justify-center text-[8px] text-gray-500">F1</div>
                        <div className="w-10 h-10 bg-gray-900 border border-gray-700 flex items-center justify-center text-[8px] text-gray-500">F2</div>
                        <div className="w-10 h-10 bg-gray-900 border border-gray-700 flex items-center justify-center text-[8px] text-gray-500">F3</div>
                        <div className="w-10 h-10 bg-gray-900 border border-gray-700 flex items-center justify-center text-[8px] text-gray-500">F4</div>
                    </div>
                </div>

                {/* SP Globe (Right) */}
                <div className="flex items-center gap-2 group">
                    <div className="hidden md:flex flex-row gap-2 mr-2">
                        <button onClick={() => setStatWindowOpen(!statWindowOpen)} className="w-8 h-8 bg-gray-800 border border-[#cfb53b]/30 flex items-center justify-center text-[10px] text-[#cfb53b] hover:bg-[#cfb53b]/20">C</button>
                        <button onClick={() => setInventoryOpen(!inventoryOpen)} className="w-8 h-8 bg-gray-800 border border-[#cfb53b]/30 flex items-center justify-center text-[10px] text-[#cfb53b] hover:bg-[#cfb53b]/20">I</button>
                    </div>
                    <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-900 border-2 border-blue-900/50 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                        <div 
                            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-900 via-blue-600 to-blue-400 transition-all duration-500 shadow-[0_-5px_15px_rgba(37,99,235,0.5)]" 
                            style={{ height: `${(playerMp/playerMaxMp)*100}%` }} 
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-[8px] md:text-[10px] text-white font-bold drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                            {Math.floor(playerMp)}/{playerMaxMp}
                        </div>
                    </div>
                </div>

                {/* XP Bar (Absolute Bottom) */}
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gray-950 overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-yellow-700 to-yellow-400 transition-all duration-1000" 
                        style={{ width: `${expPercent}%` }} 
                    />
                </div>
            </div>
        </div>

        {/* MOBILE CONTROLS (Floating Right) */}
        <div className="fixed bottom-24 right-8 flex flex-col items-end gap-4 lg:hidden pointer-events-none">
            <button 
                onPointerDown={() => inputSystem.setActionActive('ATTACK_BASIC', true)}
                onPointerUp={() => inputSystem.setActionActive('ATTACK_BASIC', false)}
                className="w-24 h-24 bg-red-600/20 border-4 border-red-600/40 rounded-full flex items-center justify-center pointer-events-auto active:scale-90 transition-transform"
            >
                <span className="text-white font-black text-xl uppercase italic drop-shadow-lg">ATK</span>
            </button>
            <div className="flex gap-2 pointer-events-auto">
                <button onClick={() => useGameStore.getState().pickupAllNearby()} className="w-12 h-12 bg-green-600/30 border border-green-500/50 rounded-full text-white text-[10px] font-bold">Z</button>
                <button onClick={() => setInventoryOpen(!inventoryOpen)} className="w-12 h-12 bg-blue-600/30 border border-blue-500/50 rounded-full text-white text-[10px] font-bold">INV</button>
            </div>
        </div>

        {/* SIDE PANELS (Desktop Positioned) */}
        {inventoryOpen && (
            <div className="fixed inset-0 md:inset-auto md:top-20 md:right-10 bg-[#1a1a1a] md:w-80 p-4 border-2 border-[#cfb53b]/50 z-[100] pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col rounded-sm">
                <div className="flex justify-between items-center border-b border-[#cfb53b]/20 pb-2 mb-4">
                    <span className="text-[#cfb53b] font-bold uppercase tracking-widest text-xs font-serif">Envanter</span>
                    <button onClick={() => setInventoryOpen(false)} className="text-red-500 font-bold hover:scale-110 transition-transform px-2">X</button>
                </div>
                <div className="grid grid-cols-5 gap-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                    {Array.from({length: 45}).map((_, i) => (
                        <div key={i} className="aspect-square bg-black/60 border border-gray-800 rounded-sm hover:border-yellow-600/50 transition-colors cursor-pointer group relative">
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100" />
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-2 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-yellow-500 font-mono text-xs">Yang: 0</span>
                    <div className="flex gap-2">
                        <div className="w-4 h-4 bg-gray-800 border border-gray-700" title="I" />
                        <div className="w-4 h-4 bg-gray-800 border border-gray-700" title="II" />
                    </div>
                </div>
            </div>
        )}

        {statWindowOpen && (
            <div className="fixed inset-0 md:inset-auto md:top-20 md:left-10 bg-[#1a1a1a] md:w-72 p-4 border-2 border-[#cfb53b]/50 z-[100] pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col rounded-sm">
                 <div className="flex justify-between items-center border-b border-[#cfb53b]/20 pb-2 mb-4">
                    <span className="text-[#cfb53b] font-bold uppercase tracking-widest text-xs font-serif">Karakter</span>
                    <button onClick={() => setStatWindowOpen(false)} className="text-red-500 font-bold px-2">X</button>
                </div>
                <div className="flex flex-col gap-3 text-[11px]">
                    <div className="flex justify-between bg-black/40 p-2 border border-gray-800">
                        <span className="text-gray-400">VIT</span>
                        <span className="text-white font-bold">5</span>
                    </div>
                    <div className="flex justify-between bg-black/40 p-2 border border-gray-800">
                        <span className="text-gray-400">INT</span>
                        <span className="text-white font-bold">5</span>
                    </div>
                    <div className="flex justify-between bg-black/40 p-2 border border-gray-800">
                        <span className="text-gray-400">STR</span>
                        <span className="text-white font-bold">5</span>
                    </div>
                    <div className="flex justify-between bg-black/40 p-2 border border-gray-800">
                        <span className="text-gray-400">DEX</span>
                        <span className="text-white font-bold">5</span>
                    </div>
                    <div className="mt-4 space-y-1">
                        <div className="flex justify-between"><span className="text-gray-500">Saldırı Değeri:</span> <span className="text-white">15-20</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Savunma:</span> <span className="text-white">10</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Hareket Hızı:</span> <span className="text-white">100</span></div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
