import React from 'react';
import { Loader2, Plus, Sparkles, Volume2 } from 'lucide-react';
import Flashcard from '../Flashcard';
import ChatWidget from '../ChatWidget';
import { WordData } from '../../types';

interface LearnViewProps {
  inputWord: string;
  loading: boolean;
  history: WordData[];
  currentWord: WordData | null;
  onInputChange: (value: string) => void;
  onSearch: () => void;
  onSelectHistoryWord: (word: WordData) => void;
  onPlayHistoryAudio: (word: WordData) => Promise<void>;
  onPlayWordAudio: () => void;
  onPlaySentence: (text: string) => Promise<void>;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
}

const LearnView: React.FC<LearnViewProps> = ({
  inputWord,
  loading,
  history,
  currentWord,
  onInputChange,
  onSearch,
  onSelectHistoryWord,
  onPlayHistoryAudio,
  onPlayWordAudio,
  onPlaySentence,
  onGenerateImage,
  isGeneratingImage,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-start justify-center flex-1">
                
      {/* Left: Input & History Snippet */}
      <div className="w-full md:w-1/4 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">New Word</label>
              <div className="flex gap-2">
                  <input 
                      type="text"
                      value={inputWord}
                      onChange={(e) => onInputChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                      placeholder="e.g. 冒険"
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                  />
                  <button 
                      onClick={onSearch}
                      disabled={loading || !inputWord}
                      className="bg-emerald-600 text-white rounded-xl px-4 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                      {loading ? <Loader2 className="animate-spin" /> : <Plus />}
                  </button>
              </div>
          </div>

          {history.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 flex-1 hidden md:block">
                  <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Recent</h3>
                  <div className="space-y-3">
                      {history.slice(0, 5).map(w => (
                          <div key={w.id} onClick={() => onSelectHistoryWord(w)} className="cursor-pointer group flex items-center justify-between p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                              <div className="min-w-0">
                                  <p className="font-bold text-gray-800 truncate">{w.kanji}</p>
                                  <p className="text-xs text-gray-500 truncate">{w.meaning}</p>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); onPlayHistoryAudio(w); }} className="text-gray-300 hover:text-emerald-500 flex-shrink-0">
                                  <Volume2 size={16} />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>

      {/* Center: Flashcard */}
      <div className="w-full md:w-2/5 flex justify-center">
          {currentWord ? (
              <Flashcard 
                  word={currentWord} 
                  onPlayAudio={onPlayWordAudio}
                  onPlaySentence={onPlaySentence}
                  onGenerateImage={onGenerateImage}
                  isGeneratingImage={isGeneratingImage}
              />
          ) : (
              <div className="h-[600px] w-full max-w-md border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 gap-4">
                  <Sparkles className="text-emerald-200" size={48} />
                  <p>Search a word to start learning</p>
              </div>
          )}
      </div>

      {/* Right: AI Chat */}
      <div className="w-full md:w-1/3 h-[600px]">
           {currentWord ? (
              <ChatWidget word={currentWord} />
           ) : (
              <div className="h-full bg-white/50 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 text-sm p-8 text-center">
                  AI Tutor is waiting for your first word...
              </div>
           )}
      </div>
  </div>
  );
};

export default LearnView;
