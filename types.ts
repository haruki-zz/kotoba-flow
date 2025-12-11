
export interface ExampleSentence {
  japanese: string;
  romaji: string;
  english: string;
  chinese: string;
}

export interface WordData {
  id: string;
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
  meaningZh: string;
  examples: ExampleSentence[];
  imageUrl?: string; // Generated or placeholder
  audioBase64?: string; // Cached TTS
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Story {
  japanese: string;
  english: string;
  title: string;
  date: string;
}

export enum AppView {
  LEARN = 'LEARN',
  HISTORY = 'HISTORY',
  STORY = 'STORY'
}
