import React from 'react';
import { BookOpen, Search, History as HistoryIcon, Feather } from 'lucide-react';
import { AppView } from '../types';

interface NavigationBarProps {
  view: AppView;
  onSelectLearn: () => void;
  onSelectStory: () => void;
  onSelectHistory: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  view,
  onSelectLearn,
  onSelectStory,
  onSelectHistory,
}) => {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-emerald-100">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-700">
          <BookOpen className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight">Kotoba Flow</h1>
        </div>
        <div className="flex gap-6 text-sm font-medium text-gray-500">
          <button 
              onClick={onSelectLearn}
              className={`hover:text-emerald-600 transition-colors flex items-center gap-1 ${view === AppView.LEARN ? 'text-emerald-600' : ''}`}
          >
              <Search size={16} /> Learn
          </button>
          <button 
              onClick={onSelectStory}
              className={`hover:text-emerald-600 transition-colors flex items-center gap-1 ${view === AppView.STORY ? 'text-emerald-600' : ''}`}
          >
              <Feather size={16} /> Story
          </button>
          <button 
              onClick={onSelectHistory}
              className={`hover:text-emerald-600 transition-colors flex items-center gap-1 ${view === AppView.HISTORY ? 'text-emerald-600' : ''}`}
          >
              <HistoryIcon size={16} /> History
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
