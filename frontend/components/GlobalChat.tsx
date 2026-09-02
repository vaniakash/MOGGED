'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/lib/auth';

type ChatMessage = {
  id: string;
  user: string;
  text: string;
  timestamp: number;
};

export default function GlobalChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [anonName] = useState(`Anon-${Math.floor(Math.random() * 10000)}`);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    const handleHistory = (history: ChatMessage[]) => {
      setMessages(history);
    };

    const handleNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        const newMessages = [...prev, msg];
        return newMessages.length > 50 ? newMessages.slice(newMessages.length - 50) : newMessages;
      });
    };

    socket.on('global_chat_history', handleHistory);
    socket.on('receive_global_chat', handleNewMessage);

    return () => {
      socket.off('global_chat_history', handleHistory);
      socket.off('receive_global_chat', handleNewMessage);
    };
  }, []);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const senderName = user?.displayName || user?.username || anonName;
    const socket = getSocket();
    
    socket.emit('send_global_chat', {
      user: senderName,
      text: inputValue.trim(),
    });

    setInputValue('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            width: 320,
            height: 400,
            backgroundColor: '#0f1115',
            border: '1px solid #1e222a',
            borderRadius: 16,
            marginBottom: 12,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#161920',
              borderBottom: '1px solid #1e222a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: 15 }}>
              💬 Global Chat
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {messages.length === 0 && (
              <div style={{ color: '#475569', textAlign: 'center', marginTop: 20, fontSize: 13 }}>
                No messages yet. Say hi!
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} style={{ fontSize: 14 }}>
                <strong style={{ color: '#a855f7' }}>{m.user}:</strong>{' '}
                <span style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>{m.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '12px',
              borderTop: '1px solid #1e222a',
              display: 'flex',
              gap: 8,
              backgroundColor: '#161920',
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              maxLength={200}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #2d323c',
                background: '#0a0b0e',
                color: '#fff',
                outline: 'none',
                fontSize: 14,
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: inputValue.trim() ? '#a855f7' : '#334155',
                color: '#fff',
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                fontWeight: 600,
                transition: 'background 0.2s',
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            border: 'none',
            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
            color: '#fff',
            fontSize: 24,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(168,85,247,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          💬
        </button>
      )}
    </div>
  );
}
