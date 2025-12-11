
import React, { useState, useEffect } from 'react';
import { WordData } from '../types';
import { Volume2, RotateCw, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';

interface FlashcardProps {
  word: WordData;
  onPlayAudio: () => void;
  onPlaySentence: (text: string) => Promise<void>;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, onPlayAudio, onPlaySentence, onGenerateImage, isGeneratingImage }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [playingSentenceIndex, setPlayingSentenceIndex] = useState<number | null>(null);

  // Reset flip state when word changes
  useEffect(() => {
    setIsFlipped(false);
  }, [word.id]);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleSentencePlay = async (e: React.MouseEvent, text: string, index: number) => {
    e.stopPropagation();
    if (playingSentenceIndex !== null) return;
    
    setPlayingSentenceIndex(index);
    try {
        await onPlaySentence(text);
    } finally {
        setPlayingSentenceIndex(null);
    }
  };

  return (
    <div className="group w-full max-w-md h-[600px] perspective-1000 cursor-pointer" onClick={handleFlip}>
      <div className={`relative w-full h-full duration-700 transform-style-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* FRONT */}
        <div className="absolute w-full h-full bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 backface-hidden border-2 border-emerald-50">
          <div className="absolute top-4 right-4 text-emerald-300">
             <RotateCw size={20} />
          </div>
          
          <div className="text-center space-y-8">
            <h2 className="text-7xl font-bold text-gray-800 font-sans-jp mb-2">{word.kanji}</h2>
            {word.kanji !== word.kana && (
                 <p className="text-4xl text-emerald-600 font-medium">{word.kana}</p>
            )}
            <p className="text-gray-400 font-mono text-xl">{word.romaji}</p>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPlayAudio();
            }}
            className="mt-16 w-20 h-20 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-700 transition-colors"
          >
            <Volume2 size={36} />
          </button>
          
          <div className="absolute bottom-8 text-sm text-gray-400">
            Tap to reveal meaning
          </div>
        </div>

        {/* BACK */}
        <div className="absolute w-full h-full bg-white rounded-3xl shadow-xl rotate-y-180 backface-hidden border-2 border-emerald-50 overflow-hidden flex flex-col">
            <div className="p-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-800">{word.kanji}</h3>
                        <div className="flex flex-col">
                           <p className="text-emerald-600 text-lg font-medium leading-tight">{word.meaning}</p>
                           <p className="text-gray-500 text-sm">{word.meaningZh}</p>
                        </div>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onPlayAudio();
                        }}
                        className="p-3 bg-emerald-50 rounded-full text-emerald-600 hover:bg-emerald-100 transition-colors"
                    >
                        <Volume2 size={24} />
                    </button>
                </div>

                {/* Image Section - Enlarge */}
                <div className="w-full h-72 bg-gray-100 rounded-2xl mb-6 overflow-hidden relative group/img flex items-center justify-center shrink-0 border border-emerald-50">
                    {word.imageUrl ? (
                        <img src={word.imageUrl} alt={word.meaning} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center p-4">
                             <ImageIcon className="mx-auto text-gray-300 mb-2" size={40} />
                             <p className="text-sm text-gray-400">No visual yet</p>
                        </div>
                    )}
                    
                    {!word.imageUrl && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onGenerateImage();
                            }}
                            disabled={isGeneratingImage}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white font-medium z-10"
                        >
                            {isGeneratingImage ? (
                                <span className="animate-pulse">Painting...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Sparkles size={20}/> Visualize</span>
                            )}
                        </button>
                    )}
                </div>

                {/* Examples */}
                <div className="space-y-4 pb-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Example Sentences</h4>
                    {word.examples.map((ex, idx) => (
                        <div key={idx} className="bg-emerald-50/50 p-4 rounded-xl text-sm border border-emerald-100/50 relative">
                            <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1">
                                    <p className="font-bold text-gray-800 text-base">{ex.japanese}</p>
                                    <p className="text-xs text-gray-500 font-mono">{ex.romaji}</p>
                                    <div className="mt-1">
                                      <p className="text-emerald-700 italic">{ex.english}</p>
                                      <p className="text-gray-500">{ex.chinese}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => handleSentencePlay(e, ex.japanese, idx)}
                                    className="text-emerald-400 hover:text-emerald-600 p-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                                    disabled={playingSentenceIndex !== null}
                                >
                                    {playingSentenceIndex === idx ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
             <div className="p-3 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100">
                Tap to flip back
             </div>
        </div>

      </div>
    </div>
  );
};

export default Flashcard;
