
import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UI } from './components/UI';
import { useGameStore } from './store';
import { GameState, CharacterClass } from './types';

const App: React.FC = () => {
  const { gameState, setGameState, resetGame, loadGame, setPlayerIdentity, playerName } = useGameStore();
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
  const [inputName, setInputName] = useState('');
  
  useEffect(() => {
      loadGame();
  }, [loadGame]);

  const handleStartGame = () => {
      if (!inputName.trim()) {
          alert("Lütfen bir isim girin!");
          return;
      }
      setPlayerIdentity(inputName, selectedClass);
      
      if (gameState === GameState.MENU) {
           resetGame(); 
           useGameStore.setState({ 
               playerName: inputName, 
               playerClass: selectedClass 
           });
      }
      setGameState(GameState.PLAYING);
  };

  if (gameState === GameState.MENU) {
      return (
          <div className="w-full h-[100dvh] flex flex-col items-center bg-black relative select-none overflow-y-auto overflow-x-hidden touch-pan-y pt-safe pb-safe">
              <div 
                className="fixed inset-0 bg-cover bg-center opacity-40 pointer-events-none"
                style={{ backgroundImage: "url('https://picsum.photos/seed/metin2bg/1280/720?grayscale')" }}
              ></div>

              <div className="z-10 w-full min-h-full flex flex-col items-center justify-between py-6 px-4">
                  {/* Logo Section */}
                  <div className="text-center mb-4 shrink-0">
                      <h1 className="text-4xl md:text-8xl font-serif text-[#cfb53b] drop-shadow-[0_4px_10px_rgba(0,0,0,1)] tracking-widest border-b-2 md:border-b-4 border-[#cfb53b] pb-2 inline-block">
                          METIN2
                      </h1>
                      <p className="text-gray-400 mt-2 tracking-[0.3em] uppercase text-[10px] md:text-lg">Web Legacy</p>
                  </div>

                  {/* Character List - Responsive Grid */}
                  <div className="grid grid-cols-2 md:flex md:flex-row gap-3 md:gap-6 items-center justify-center w-full max-w-6xl px-2 my-4">
                      {(['warrior', 'ninja', 'sura', 'shaman'] as CharacterClass[]).map((cls) => {
                          const isSelected = selectedClass === cls;
                          return (
                              <div 
                                 key={cls}
                                 onClick={() => setSelectedClass(cls)}
                                 className={`
                                    relative w-full md:w-44 transition-all duration-300 cursor-pointer p-2 md:p-3 rounded-lg border-2
                                    flex flex-col items-center gap-1 md:gap-0
                                    ${isSelected ? 'bg-yellow-500/20 border-yellow-500 scale-105 z-20 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'bg-black/60 border-gray-800 opacity-60 hover:opacity-100'}
                                 `}
                              >
                                  <div className={`w-full aspect-[3/4] md:h-48 rounded shadow-inner flex-shrink-0
                                      ${cls === 'warrior' ? 'bg-blue-900' : cls === 'ninja' ? 'bg-pink-900' : cls === 'sura' ? 'bg-gray-400' : 'bg-purple-900'}
                                  `}></div>
                                  <div className={`
                                      text-sm md:text-xl font-serif font-bold uppercase tracking-widest mt-2 md:mt-4
                                      ${isSelected ? 'text-[#cfb53b]' : 'text-gray-500'}
                                  `}>
                                      {cls}
                                  </div>
                              </div>
                          )
                      })}
                  </div>

                  {/* Name Input & Start Button */}
                  <div className="w-full max-w-md bg-black/90 p-5 md:p-6 rounded-xl border border-yellow-600/50 shadow-2xl backdrop-blur-md shrink-0 mb-4">
                      <div className="flex flex-col gap-2 w-full mb-4 md:mb-6">
                          <label className="text-yellow-500 font-serif text-[10px] md:text-sm uppercase tracking-widest text-center">Karakter Adı</label>
                          <input 
                              type="text" 
                              value={inputName}
                              onChange={(e) => setInputName(e.target.value)}
                              className="bg-gray-950 border-2 border-yellow-900/50 text-yellow-500 text-center p-2 md:p-3 font-serif text-lg md:text-xl w-full focus:border-yellow-500 focus:outline-none rounded"
                              placeholder="İsim..."
                              maxLength={12}
                          />
                      </div>

                      <button 
                        onClick={handleStartGame}
                        className="w-full py-3 md:py-4 bg-gradient-to-b from-red-700 to-red-900 border-2 border-yellow-600 text-yellow-500 font-serif text-xl md:text-2xl hover:brightness-125 transition-all shadow-lg uppercase font-bold tracking-widest rounded active:scale-95"
                      >
                        Oyuna Başla
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  if (gameState === GameState.DEAD) {
      return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 text-white z-50 absolute inset-0">
              <h1 className="text-7xl font-serif text-red-600 mb-8 animate-pulse">ÖLDÜN</h1>
              <button 
                onClick={() => resetGame()}
                className="px-12 py-4 bg-gray-950 border-2 border-red-900 text-red-500 hover:bg-red-900 hover:text-white transition-all font-bold tracking-widest"
              >
                Şehirde Yeniden Doğ
              </button>
          </div>
      )
  }

  return (
    <div 
        className="relative w-full h-full select-none overflow-hidden touch-none"
        onContextMenu={(e) => e.preventDefault()} 
    >
      <GameCanvas />
      <UI />
    </div>
  );
};

export default App;
