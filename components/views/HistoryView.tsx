import React, { useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, History as HistoryIcon, Search, Trash2, Volume2, X } from 'lucide-react';
import { WordData } from '../../types';
import { getDaysInMonth, getFirstDayOfMonth, isSameDay } from '../../utils/date';

interface HistoryViewProps {
  history: WordData[];
  historySearchQuery: string;
  selectedDate: Date;
  currentMonth: Date;
  onChangeSearchQuery: (value: string) => void;
  onSelectDate: (value: Date) => void;
  onChangeMonth: (offset: number) => void;
  onPlayHistoryAudio: (word: WordData) => Promise<void>;
  onDeleteWord: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  historySearchQuery,
  selectedDate,
  currentMonth,
  onChangeSearchQuery,
  onSelectDate,
  onChangeMonth,
  onPlayHistoryAudio,
  onDeleteWord,
}) => {
  const filteredHistory = useMemo(() => {
    return history.filter(word => {
        if (historySearchQuery.trim()) {
            const q = historySearchQuery.toLowerCase();
            return word.kanji.includes(q) || 
                   word.kana.includes(q) || 
                   word.meaning.toLowerCase().includes(q) ||
                   word.meaningZh.includes(q) ||
                   word.romaji.toLowerCase().includes(q);
        } else {
            return isSameDay(new Date(word.createdAt), selectedDate);
        }
    });
  }, [history, historySearchQuery, selectedDate]);

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Calendar */}
          <div className="md:col-span-4 lg:col-span-3">
               <div className="bg-white rounded-2xl shadow-sm border border-emerald-50 p-6">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-800 text-lg">
                          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex gap-1">
                          <button onClick={() => onChangeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                              <ChevronLeft size={20} />
                          </button>
                          <button onClick={() => onChangeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                              <ChevronRight size={20} />
                          </button>
                      </div>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                          <div key={`empty-${i}`} />
                      ))}
                      {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                          const day = i + 1;
                          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                          const isSelected = isSameDay(date, selectedDate);
                          const hasData = history.some(w => isSameDay(new Date(w.createdAt), date));
                          
                          return (
                              <button
                                  key={day}
                                  onClick={() => {
                                      onSelectDate(date);
                                      onChangeSearchQuery('');
                                  }}
                                  className={`
                                      aspect-square rounded-full flex flex-col items-center justify-center text-sm relative transition-all
                                      ${isSelected 
                                          ? 'bg-emerald-600 text-white font-bold shadow-md' 
                                          : 'hover:bg-gray-50 text-gray-700'
                                      }
                                  `}
                              >
                                  {day}
                                  {hasData && !isSelected && (
                                      <span className="absolute bottom-1.5 w-1 h-1 bg-emerald-400 rounded-full"></span>
                                  )}
                              </button>
                          );
                      })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                          <span>Study active</span>
                      </div>
                  </div>
               </div>
          </div>

          {/* RIGHT COLUMN: List */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col">
              
              {/* Search & Header */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                   <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <HistoryIcon className="text-emerald-600" /> 
                      {historySearchQuery 
                          ? "Search Results" 
                          : isSameDay(selectedDate, new Date()) 
                              ? "Today's Words" 
                              : selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
                      }
                  </h2>
                  
                  <div className="relative w-full md:w-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                          type="text"
                          value={historySearchQuery}
                          onChange={(e) => onChangeSearchQuery(e.target.value)}
                          placeholder="Search learned words..."
                          className="pl-10 pr-10 py-2 rounded-full border-none bg-white shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none text-sm w-full md:w-64"
                      />
                      {historySearchQuery && (
                          <button 
                              onClick={() => onChangeSearchQuery('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                              <X size={14} />
                          </button>
                      )}
                  </div>
              </div>

              {/* Word Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHistory.map(word => (
                      <div key={word.id} className="bg-white rounded-xl p-4 shadow-sm border border-emerald-50 hover:shadow-md transition-all flex gap-3 relative group h-28">
                          {/* Delete Button */}
                          <button 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteWord(word.id);
                              }}
                              className="absolute top-2 right-2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 z-10"
                              title="Remove from history"
                          >
                              <Trash2 size={14} />
                          </button>

                          <div className="w-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 relative group/img">
                              <img src={word.imageUrl || `https://picsum.photos/seed/${word.meaning}/100`} alt={word.meaning} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors"></div>
                          </div>
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="flex items-center gap-2 mb-0.5">
                                  <h3 className="text-lg font-bold text-gray-800 truncate">{word.kanji}</h3>
                                  <button 
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          onPlayHistoryAudio(word);
                                      }} 
                                      className="text-emerald-500 hover:text-emerald-700 flex-shrink-0"
                                  >
                                      <Volume2 size={16} />
                                  </button>
                              </div>
                              <p className="text-emerald-600 text-sm truncate font-medium">{word.kana}</p>
                              <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-tight">{word.meaning} <br/> {word.meaningZh}</p>
                          </div>
                      </div>
                  ))}
              </div>

              {filteredHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                      <CalendarIcon size={32} className="mb-2 text-gray-300" />
                      <p>No words found for {historySearchQuery ? "this search" : "this date"}.</p>
                  </div>
              )}
          </div>
      </div>
  </div>
  );
};

export default HistoryView;
