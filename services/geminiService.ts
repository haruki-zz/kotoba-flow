
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WordData, ExampleSentence } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Analyze Word (JSON Mode)
export const analyzeWord = async (word: string): Promise<Omit<WordData, 'id' | 'createdAt'>> => {
  const model = "gemini-2.5-flash";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze the Japanese word "${word}". Provide the Kanji (if applicable, otherwise use Hiragana/Katakana), Kana reading, Romaji, English meaning, Chinese meaning, and 2 helpful example sentences with their English and Chinese translations.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          kanji: { type: Type.STRING, description: "The word in Kanji" },
          kana: { type: Type.STRING, description: "The reading in Hiragana/Katakana" },
          romaji: { type: Type.STRING, description: "Romanized reading" },
          meaning: { type: Type.STRING, description: "English definition" },
          meaningZh: { type: Type.STRING, description: "Chinese definition" },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                japanese: { type: Type.STRING },
                romaji: { type: Type.STRING },
                english: { type: Type.STRING },
                chinese: { type: Type.STRING },
              },
              required: ["japanese", "romaji", "english", "chinese"]
            }
          }
        },
        required: ["kanji", "kana", "romaji", "meaning", "meaningZh", "examples"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text);
};

// 2. Generate Image (Visual Mnemonic)
export const generateMnemonicImage = async (word: string, meaning: string): Promise<string> => {
  // Use gemini-2.5-flash-image for standard generation.
  const model = "gemini-2.5-flash-image"; 
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a photorealistic, high-quality photograph representing the concept of "${meaning}" (Japanese word: ${word}). 
      
      Requirements:
      1. STYLE: Real life photography, cinematic lighting, 4k resolution, highly detailed. If the word is an object (e.g., lightning, cat, car), show a real photo of it. If it is abstract, use a realistic visual metaphor.
      2. COMPOSITION: Clean, centered subject, professional framing.
      
      CRITICAL NEGATIVE CONSTRAINTS:
      - DO NOT generate any text, kanji, hiragana, katakana, or english letters in the image.
      - NO cartoons, NO anime style, NO vector art, NO illustrations.
      - The image must be text-free.`,
      config: {
         // Note: outputMimeType is not directly supported in generateContent for images in the same way as JSON,
         // but the model returns parts. We rely on the SDK to handle the return format.
      }
    });

    // Check for inlineData in parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    return ""; // Fallback handled by UI
  } catch (e) {
    console.error("Image gen failed", e);
    return "";
  }
};

// 3. Text-to-Speech (Natural)
export const generateSpeech = async (text: string): Promise<string> => {
  const model = "gemini-2.5-flash-preview-tts";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
        parts: [{ text }]
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is usually good for clarity
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio || "";
};

// 4. Story Generation
export const generateStoryFromWords = async (words: WordData[]): Promise<{ japanese: string, english: string, title: string }> => {
  if (words.length === 0) return { japanese: "", english: "", title: "" };

  const wordList = words.map(w => `${w.kanji} (${w.meaning})`).join(", ");
  const model = "gemini-2.5-flash";

  const response = await ai.models.generateContent({
    model,
    contents: `Create a very short, funny, and coherent story (max 150 words) using these Japanese words: ${wordList}. 
    Output in JSON format with 'title' (in Japanese), 'japanese' (the story), and 'english' (translation).`,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                japanese: { type: Type.STRING },
                english: { type: Type.STRING }
            },
            required: ["title", "japanese", "english"]
        }
    }
  });

  const text = response.text;
  return text ? JSON.parse(text) : { japanese: "Error", english: "Error", title: "Error" };
};

// 5. Chat Helper
export const chatWithContext = async (
    currentWord: WordData, 
    history: {role: 'user' | 'model', text: string}[], 
    newMessage: string
) => {
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: [
            {
                role: "user",
                parts: [{ text: `I am learning the word ${currentWord.kanji} (${currentWord.kana}) which means ${currentWord.meaning} (Chinese: ${currentWord.meaningZh}). Please act as a helpful Japanese tutor. Keep answers concise.` }]
            },
            {
                role: "model",
                parts: [{ text: "Understood. I am your Japanese tutor. Ask me anything about this word, its nuance, usage, or grammar." }]
            },
            ...history.map(h => ({
                role: h.role,
                parts: [{ text: h.text }]
            }))
        ],
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
};
