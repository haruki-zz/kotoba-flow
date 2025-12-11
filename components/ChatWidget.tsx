import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { ChatMessage, WordData } from '../types';
import { chatWithContext } from '../services/geminiService';

interface ChatWidgetProps {
    word: WordData;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ word }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Reset chat when word changes
    useEffect(() => {
        setMessages([{
            role: 'model',
            text: `Hi! I'm your tutor for "${word.kanji}". Ask me about nuance, grammar, or usage!`,
            timestamp: Date.now()
        }]);
    }, [word.id]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Convert app chat format to simple history for service
            const history = messages.map(m => ({ role: m.role, text: m.text }));
            const response = await chatWithContext(word, history, userMsg.text);
            
            if (response) {
                const aiMsg: ChatMessage = { role: 'model', text: response, timestamp: Date.now() };
                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I lost my train of thought. Try again?", timestamp: Date.now() }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
            <div className="bg-emerald-600 p-4 text-white flex items-center gap-2">
                <Bot size={20} />
                <h3 className="font-bold">AI Sensei</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                            msg.role === 'user' 
                            ? 'bg-emerald-500 text-white rounded-br-none' 
                            : 'bg-white text-gray-700 shadow-sm border border-gray-200 rounded-bl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-full px-4 py-2 text-xs text-gray-500 animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about this word..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatWidget;