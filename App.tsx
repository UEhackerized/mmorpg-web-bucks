
import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UI } from './components/UI';
import { useGameStore } from './store';
import { GameState, CharacterClass } from './types';

const App: React.FC = () => {
  const { gameState, setGameState, resetGame, loadGame, setPlayerIdentity, playerName } = useGameStore();
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
  const [inputName, setInputName] = useState('');
  
  // Initial Load
  useEffect(() => {
      loadGame();
  }, [loadGame]);

  const handleStartGame = () => {
      if (!inputName.trim()) {
          alert("Please enter a name!");
          return;
      }

      // Update store
      setPlayerIdentity(inputName, selectedClass);
      
      // Play Sound "Shit" (User Request: "başlarken karakter shit diye bağırsın")
      if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance("Shit!");
          utterance.rate = 1.2;
          utterance.pitch = 0.8; 
          utterance.volume = 1.0;
          window.speechSynthesis.speak(utterance);
      }
      
      // If resetting logic is needed for a fresh start
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
          <div className="w-full h-full flex flex-col items-center justify-center bg-black relative select-none overflow-hidden">
              {/* Background Image (Generic Fantasy Landscape) */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{ backgroundImage: "url('https://picsum.photos/seed/metin2bg/1920/1080?grayscale')" }}
              ></div>

              {/* Golden Frame UI Container */}
              <div className="z-10 w-full h-full flex flex-col items-center justify-between py-12">
                  
                  {/* Logo Area */}
                  <div className="text-center">
                      <h1 className="text-7xl font-serif text-[#cfb53b] drop-shadow-[0_4px_4px_rgba(0,0,0,1)] tracking-widest border-b-2 border-[#cfb53b] pb-2 inline-block">
                          METIN2
                      </h1>
                      <p className="text-gray-400 mt-2 tracking-[0.5em] uppercase text-sm">Web Legacy</p>
                  </div>

                  {/* Character Selection Platform */}
                  <div className="flex gap-8 items-end justify-center h-1/2 w-full max-w-5xl px-4">
                      {(['warrior', 'ninja', 'sura', 'shaman'] as CharacterClass[]).map((cls) => {
                          const isSelected = selectedClass === cls;
                          return (
                              <div 
                                 key={cls}
                                 onClick={() => setSelectedClass(cls)}
                                 className={`
                                    relative w-48 h-full transition-all duration-300 cursor-pointer group
                                    flex flex-col justify-end items-center pb-8
                                    ${isSelected ? 'scale-110 z-20' : 'scale-95 opacity-60 hover:opacity-90'}
                                 `}
                              >
                                  {/* Character Silhouette / Representation */}
                                  <div className={`
                                      w-full h-3/4 mb-4 bg-gradient-to-t from-black/80 to-transparent 
                                      flex items-end justify-center
                                      border-b-4 ${isSelected ? 'border-[#cfb53b]' : 'border-gray-700'}
                                  `}>
                                      <div className={`w-24 h-48 mb-2 transition-colors duration-500 shadow-[0_0_30px_rgba(0,0,0,0.8)]
                                          ${cls === 'warrior' ? 'bg-blue-700' : cls === 'ninja' ? 'bg-pink-700' : cls === 'sura' ? 'bg-gray-200' : 'bg-purple-600'}
                                      `}></div>
                                  </div>

                                  {/* Name Label */}
                                  <div className={`
                                      text-2xl font-serif font-bold uppercase tracking-wider transition-colors
                                      ${isSelected ? 'text-[#cfb53b] drop-shadow-[0_0_10px_rgba(207,181,59,0.8)]' : 'text-gray-500'}
                                  `}>
                                      {cls}
                                  </div>
                              </div>
                          )
                      })}
                  </div>

                  {/* Bottom Controls */}
                  <div className="flex flex-col items-center gap-6 bg-black/80 p-8 border-t-2 border-[#cfb53b] w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)]">
                      <div className="flex flex-col items-center gap-2 w-full">
                          <label className="text-[#cfb53b] font-serif text-sm uppercase tracking-widest">Character Name</label>
                          <input 
                              type="text" 
                              value={inputName}
                              onChange={(e) => setInputName(e.target.value)}
                              className="bg-[#1a0f0a] border-2 border-[#5d4037] text-[#cfb53b] text-center p-3 font-serif text-2xl w-full max-w-md focus:border-[#cfb53b] focus:outline-none placeholder-gray-700"
                              placeholder="Enter Name..."
                              maxLength={12}
                          />
                      </div>

                      <button 
                        onClick={handleStartGame}
                        className="px-16 py-4 bg-gradient-to-b from-[#8B0000] to-[#3a0000] border-2 border-[#cfb53b] text-[#cfb53b] font-serif text-2xl hover:brightness-125 transition-all shadow-[0_0_15px_rgba(218,165,32,0.3)] uppercase font-bold tracking-widest"
                      >
                        Start Game
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  if (gameState === GameState.DEAD) {
      return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/90 text-white z-50 absolute inset-0">
              <h1 className="text-6xl font-serif text-red-500 mb-8 drop-shadow-lg">YOU DIED</h1>
              <button 
                onClick={() => resetGame()}
                className="px-8 py-3 bg-gray-900 border border-gray-500 hover:bg-gray-800 transition-colors"
              >
                Return to City
              </button>
          </div>
      )
  }

  return (
    <div 
        className="relative w-full h-full select-none overflow-hidden"
        onContextMenu={(e) => e.preventDefault()} 
    >
      <GameCanvas />
      <UI />
    </div>
  );
};

export default App;
