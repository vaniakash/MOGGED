'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getSocket } from '@/lib/socket';
import { Home, MessageCircle, Send, UserX } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type Phase = 'connecting' | 'queue' | 'chat';

interface Message {
  id: string;
  senderId: string;
  text: string;
  isMe: boolean;
}

export default function ChatPageClient() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('connecting');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [opponentLeft, setOpponentLeft] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    // Register a persistent session id in localStorage or just use uuid
    let sid = localStorage.getItem('omogl_chat_sid');
    if (!sid) {
      sid = uuidv4();
      localStorage.setItem('omogl_chat_sid', sid);
    }

    const onConnect = () => {
      setPhase('queue');
      socket.emit('join_chat_queue', { sessionId: sid });
    };

    if (socket.connected) onConnect();
    socket.on('connect', onConnect);

    socket.on('chat_matched', ({ roomId }) => {
      setRoomId(roomId);
      setPhase('chat');
      setMessages([]);
      setOpponentLeft(false);
    });

    socket.on('chat_message', ({ senderId, text }) => {
      setMessages(prev => [...prev, { id: uuidv4(), senderId, text, isMe: false }]);
    });

    socket.on('chat_opponent_left', () => {
      setOpponentLeft(true);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('chat_matched');
      socket.off('chat_message');
      socket.off('chat_opponent_left');
      socket.emit('leave_chat_queue');
      // We don't disconnect fully because they might go to battle page, but we leave the chat queue.
    };
  }, []);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || opponentLeft || !roomId) return;
    
    const socket = getSocket();
    const text = inputText.trim();
    
    // Optimistic UI update
    setMessages(prev => [...prev, { id: uuidv4(), senderId: socket.id || 'me', text, isMe: true }]);
    socket.emit('chat_message', { roomId, text });
    setInputText('');
  };

  const handleNextMatch = () => {
    setPhase('queue');
    setRoomId(null);
    setMessages([]);
    setOpponentLeft(false);
    getSocket().emit('next_chat_match');
  };

  const handleHome = () => {
    getSocket().emit('leave_chat_queue');
    router.push('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#050508',
      color: '#f8fafc',
    }}>
      
      {/* ── HEADER ── */}
      <header style={{
        padding: '16px 24px',
        borderBottom: '1px solid #1e222a',
        background: '#0f1115',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="Omogl" style={{ height: 32, objectFit: 'contain' }} />
          <span style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#f87171',
            letterSpacing: '0.05em',
            padding: '4px 10px',
            background: 'rgba(248,113,113,0.1)',
            borderRadius: 6,
          }}>Stranger Love</span>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleNextMatch} style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #2a2f3a',
            background: '#181b21',
            color: '#f8fafc',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            Next <span style={{ color: '#64748b' }}>ESC</span>
          </button>
          <button onClick={handleHome} style={{
            width: 36, height: 36,
            borderRadius: 6,
            border: '1px solid #2a2f3a',
            background: '#181b21',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <Home size={16} />
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {phase === 'connecting' || phase === 'queue' ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 48, height: 48,
                borderRadius: '50%',
                border: '3px solid #1e222a',
                borderTopColor: '#f87171',
              }}
            />
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 24, fontFamily: 'Bebas Neue, cursive', letterSpacing: '0.05em', marginBottom: 8 }}>
                {phase === 'connecting' ? 'CONNECTING...' : 'FINDING STRANGER...'}
              </h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>Please wait while we match you with someone.</p>
            </div>
            
            <button onClick={handleHome} style={{
              marginTop: 24,
              padding: '10px 24px',
              borderRadius: 8,
              border: '1px solid #2a2f3a',
              background: '#0f1115',
              color: '#94a3b8',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 800, margin: '0 auto', width: '100%' }}>
            
            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: '24px 16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                color: '#64748b',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.05em',
                marginBottom: 16,
              }}>
                <span style={{ background: '#1e222a', padding: '4px 12px', borderRadius: 999 }}>
                  You are now chatting with a random stranger
                </span>
              </div>

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                  }}
                >
                  <div style={{
                    fontSize: 11,
                    color: '#64748b',
                    marginBottom: 4,
                    marginLeft: msg.isMe ? 0 : 4,
                    marginRight: msg.isMe ? 4 : 0,
                    textAlign: msg.isMe ? 'right' : 'left',
                    fontWeight: 600,
                  }}>
                    {msg.isMe ? 'YOU' : 'STRANGER'}
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 16,
                    borderBottomRightRadius: msg.isMe ? 4 : 16,
                    borderBottomLeftRadius: msg.isMe ? 16 : 4,
                    background: msg.isMe ? '#f8fafc' : '#181b21',
                    color: msg.isMe ? '#050508' : '#f8fafc',
                    border: msg.isMe ? 'none' : '1px solid #2a2f3a',
                    fontSize: 15,
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {opponentLeft && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    alignSelf: 'center',
                    marginTop: 32,
                    padding: '24px',
                    background: '#181b21',
                    border: '1px solid #2a2f3a',
                    borderRadius: 12,
                    textAlign: 'center',
                    maxWidth: 320,
                  }}
                >
                  <UserX size={32} color="#f87171" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 8 }}>Stranger Disconnected</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>They have left the chat.</div>
                  <button onClick={handleNextMatch} style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#f8fafc',
                    color: '#050508',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}>
                    Find Next Stranger
                  </button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
              padding: '16px',
              borderTop: '1px solid #1e222a',
              background: '#0f1115',
            }}>
              <form onSubmit={handleSend} style={{
                display: 'flex',
                gap: 12,
                opacity: opponentLeft ? 0.5 : 1,
                pointerEvents: opponentLeft ? 'none' : 'auto',
              }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    borderRadius: 8,
                    border: '1px solid #2a2f3a',
                    background: '#181b21',
                    color: '#f8fafc',
                    fontSize: 15,
                    outline: 'none',
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Escape') {
                      handleNextMatch();
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  style={{
                    width: 48,
                    borderRadius: 8,
                    border: 'none',
                    background: inputText.trim() ? '#f8fafc' : '#1e222a',
                    color: inputText.trim() ? '#050508' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                  }}
                >
                  <Send size={18} />
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#475569' }}>
                Press <kbd style={{ background: '#1e222a', padding: '2px 4px', borderRadius: 4, fontFamily: 'monospace' }}>ESC</kbd> to find next stranger
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
