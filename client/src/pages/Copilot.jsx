import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Bot, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Copilot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/copilot/history');
      setMessages(res.data.data);
    } catch (error) {
      console.error('Failed to fetch chat history', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/copilot/ask', { question: userMessage.content });
      setMessages(res.data.data.messages);
    } catch (error) {
      console.error('Failed to ask copilot', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-muted/20 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center text-text">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 text-muted hover:text-text transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Bot className="w-6 h-6 text-secondary mr-2" />
            <h1 className="text-xl font-bold">CloudGuardian AI Copilot</h1>
          </div>
          <span className="text-xs bg-primary/20 text-secondary px-2.5 py-1 rounded-full border border-primary/30">
            Powered by Gemini
          </span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <Bot className="w-16 h-16 text-muted mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-muted mb-2">How can I help you optimize your cloud?</h2>
              <p className="text-muted max-w-md mx-auto">
                Ask me  generate Terraform, AWS CLI commands, explain costs, or find security risks based on your latest scan.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary ml-3' : 'bg-muted/10 mr-3'
                  }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-text" /> : <Bot className="w-5 h-5 text-secondary" />}
                </div>

                <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-surface border border-muted/20 text-text rounded-tl-sm'
                  }`}>
                  <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                    {msg.content}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] flex-row">
                <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-muted/10 mr-3">
                  <Bot className="w-5 h-5 text-secondary" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-surface border border-muted/20 text-text rounded-tl-sm flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                  <span className="ml-3 text-muted text-sm font-medium">Analyzing infrastructure...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-surface border-t border-muted/20 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask about your AWS infrastructure (e.g. 'Write a terraform script to secure my S3 buckets')..."
              className="w-full bg-background border border-muted/20 rounded-xl py-3 pl-4 pr-12 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none max-h-32 outline-none transition-all"
              rows="2"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 rounded-lg bg-primary hover:bg-accent text-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-xs text-muted">
              Copilot uses your latest scan data as context. Press Shift + Enter for a new line.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Copilot;
