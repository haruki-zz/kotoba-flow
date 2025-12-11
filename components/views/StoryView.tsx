import React from 'react';
import { Feather, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { Story } from '../../types';

interface StoryViewProps {
  story: Story | null;
  isGeneratingStory: boolean;
  isPlayingStory: boolean;
  onPlayStory: () => void;
  onCreateStory: () => void;
  onGoLearn: () => void;
}

const StoryView: React.FC<StoryViewProps> = ({
  story,
  isGeneratingStory,
  isPlayingStory,
  onPlayStory,
  onCreateStory,
  onGoLearn,
}) => {
  return (
    <div className="max-w-3xl mx-auto w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-50 min-h-[600px]">
      <div className="bg-emerald-600 p-8 text-center text-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/japanese-asanoha.png')]"></div>
         <h2 className="text-4xl font-serif relative z-10 mb-2">Daily Story</h2>
         <p className="text-emerald-100 relative z-10">Weaving your learned words together</p>
         
         {story && (
             <button 
                 onClick={onPlayStory}
                 disabled={isPlayingStory}
                 className="relative z-10 mt-6 bg-white/20 hover:bg-white/30 text-white border border-white/40 px-6 py-2 rounded-full flex items-center justify-center gap-2 mx-auto transition-all backdrop-blur-sm"
             >
                 {isPlayingStory ? <Loader2 className="animate-spin" size={18} /> : <Volume2 size={18} />}
                 <span>Listen to Story</span>
             </button>
         )}
      </div>
      
      <div className="p-8 md:p-12">
         {isGeneratingStory ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                  <p className="text-gray-500 animate-pulse">Crafting a story...</p>
             </div>
         ) : story ? (
             <div className="space-y-8">
                 <div className="text-center">
                     <h3 className="text-2xl font-bold text-gray-800 mb-2">{story.title}</h3>
                     <p className="text-sm text-gray-400">{story.date}</p>
                 </div>
                 
                 <div className="prose prose-xl text-gray-700 leading-loose font-sans-jp text-justify">
                     {story.japanese}
                 </div>
                 
                 <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                     <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 text-emerald-600">Translation</h4>
                     <p className="text-gray-600 text-sm leading-relaxed">{story.english}</p>
                 </div>
                 
                 <div className="flex justify-center pt-8">
                     <button onClick={onCreateStory} className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold flex items-center gap-2">
                         <Sparkles size={16} /> Regenerate Story
                     </button>
                 </div>
             </div>
         ) : (
             <div className="text-center py-20 text-gray-400">
                 <Feather size={48} className="mx-auto mb-4 text-emerald-200" />
                 <p>Learn some words first, then create a story!</p>
                 <button 
                     onClick={onGoLearn}
                     className="mt-6 text-emerald-600 font-bold hover:underline"
                 >
                     Go Learn
                 </button>
             </div>
         )}
      </div>
   </div>
  );
};

export default StoryView;
