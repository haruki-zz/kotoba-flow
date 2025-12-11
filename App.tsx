import React, { useState } from 'react';
import { AppView, WordData, Story } from './types';
import { analyzeWord, generateMnemonicImage, generateSpeech, generateStoryFromWords } from './services/geminiService';
import NavigationBar from './components/NavigationBar';
import LearnView from './components/views/LearnView';
import StoryView from './components/views/StoryView';
import HistoryView from './components/views/HistoryView';
import { playBase64PcmAudio } from './utils/audio';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LEARN);
  const [inputWord, setInputWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [history, setHistory] = useState<WordData[]>([]);
  const [story, setStory] = useState<Story | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [isPlayingStory, setIsPlayingStory] = useState(false);

  // History / Calendar State
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const handleSearch = async () => {
    if (!inputWord.trim()) return;
    setLoading(true);
    try {
      const details = await analyzeWord(inputWord);
      
      const newWord: WordData = {
        ...details,
        id: crypto.randomUUID(),
        audioBase64: "",
        createdAt: Date.now(),
        imageUrl: ""
      };

      generateSpeech(details.kanji).then(audio => {
          setCurrentWord(prev => prev && prev.id === newWord.id ? { ...prev, audioBase64: audio } : prev);
          setHistory(prev => prev.map(w => w.id === newWord.id ? { ...w, audioBase64: audio } : w));
      }).catch(console.error);

      setCurrentWord(newWord);
      setHistory(prev => [newWord, ...prev]); 
      setInputWord('');
    } catch (error) {
      alert("Failed to analyze word. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!currentWord) return;
    setImageLoading(true);
    try {
        const base64Img = await generateMnemonicImage(currentWord.kanji, currentWord.meaning);
        if (base64Img) {
            const updatedWord = { ...currentWord, imageUrl: base64Img };
            setCurrentWord(updatedWord);
            setHistory(prev => prev.map(w => w.id === updatedWord.id ? updatedWord : w));
        }
    } catch (e) {
        console.error(e);
    } finally {
        setImageLoading(false);
    }
  };

  const handlePlayWordAudio = async () => {
    if (!currentWord) return;
    
    let audio = currentWord.audioBase64;
    if (!audio) {
        try {
            audio = await generateSpeech(currentWord.kanji);
            const updatedWord = { ...currentWord, audioBase64: audio };
            setCurrentWord(updatedWord);
            setHistory(prev => prev.map(w => w.id === updatedWord.id ? updatedWord : w));
        } catch (e) { console.error(e); return; }
    }
    await playBase64PcmAudio(audio);
  };

  const handlePlayHistoryAudio = async (word: WordData) => {
      let audio = word.audioBase64;
      if (!audio) {
          audio = await generateSpeech(word.kanji);
          setHistory(prev => prev.map(w => w.id === word.id ? { ...w, audioBase64: audio } : w));
      }
      await playBase64PcmAudio(audio || "");
  };

  const handlePlaySentence = async (text: string) => {
      try {
          const audio = await generateSpeech(text);
          await playBase64PcmAudio(audio);
      } catch (e) {
          console.error(e);
      }
  };

  const handleCreateStory = async () => {
    setView(AppView.STORY);
    if (history.length === 0) return;
    if (story) return;
    
    setIsGeneratingStory(true);
    try {
        const recentWords = history.slice(0, 5);
        const storyData = await generateStoryFromWords(recentWords);
        setStory({ ...storyData, date: new Date().toLocaleDateString() });
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingStory(false);
    }
  };

  const handlePlayStory = async () => {
      if (!story) return;
      setIsPlayingStory(true);
      try {
          const audio = await generateSpeech(story.japanese);
          await playBase64PcmAudio(audio);
      } catch (e) {
          console.error(e);
      } finally {
          setIsPlayingStory(false);
      }
  };

  const handleDeleteWord = (id: string) => {
      setHistory(prev => prev.filter(w => w.id !== id));
      if (currentWord?.id === id) {
          setCurrentWord(null);
      }
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  return (
    <div className="min-h-screen bg-[#F2F7F5] text-gray-800 font-sans selection:bg-emerald-200">
      
      <NavigationBar 
        view={view}
        onSelectLearn={() => setView(AppView.LEARN)}
        onSelectStory={handleCreateStory}
        onSelectHistory={() => setView(AppView.HISTORY)}
      />

      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto min-h-screen flex flex-col">
        
        {view === AppView.LEARN && (
          <LearnView 
            inputWord={inputWord}
            loading={loading}
            history={history}
            currentWord={currentWord}
            onInputChange={setInputWord}
            onSearch={handleSearch}
            onSelectHistoryWord={setCurrentWord}
            onPlayHistoryAudio={handlePlayHistoryAudio}
            onPlayWordAudio={handlePlayWordAudio}
            onPlaySentence={handlePlaySentence}
            onGenerateImage={handleGenerateImage}
            isGeneratingImage={imageLoading}
          />
        )}

        {view === AppView.STORY && (
          <StoryView 
            story={story}
            isGeneratingStory={isGeneratingStory}
            isPlayingStory={isPlayingStory}
            onPlayStory={handlePlayStory}
            onCreateStory={handleCreateStory}
            onGoLearn={() => setView(AppView.LEARN)}
          />
        )}

        {view === AppView.HISTORY && (
          <HistoryView 
            history={history}
            historySearchQuery={historySearchQuery}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            onChangeSearchQuery={setHistorySearchQuery}
            onSelectDate={setSelectedDate}
            onChangeMonth={changeMonth}
            onPlayHistoryAudio={handlePlayHistoryAudio}
            onDeleteWord={handleDeleteWord}
          />
        )}

      </main>
    </div>
  );
};

export default App;
