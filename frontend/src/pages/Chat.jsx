import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSession } from '../contexts/SessionContext';
import Sidebar from '../components/Sidebar';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import Auth from '../components/Auth';
import { FaHeartbeat } from 'react-icons/fa';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://127.0.0.1:8001';

const GREETING_PROMPTS = [
  "What are you working on? Training, nutrition, recovery, sleep — ask anything.",
  "What's the goal right now? I can help with training, nutrition, recovery, or sleep.",
  "What do you want to optimize? Give me the details and I'll give you a protocol.",
];

function Chat() {
  const { session, guestMode, enterGuestMode, getGuestInteractionCount, incrementGuestInteraction, GUEST_LIMIT } = useSession();

  const [messages, setMessages] = useState(() => {
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    if (pendingMessage) return [];

    const saved = sessionStorage.getItem('chat_messages');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(msg => msg.type === 'ai' ? { ...msg, skipAnimation: true } : msg);
    }

    const randomIndex = Math.floor(Math.random() * GREETING_PROMPTS.length);
    return [{ type: 'ai', text: GREETING_PROMPTS[randomIndex] }];
  });

  const [guestCount, setGuestCount] = useState(() => getGuestInteractionCount());
  const [showAuth, setShowAuth] = useState(false);
  const chatEndRef = useRef(null);

  const guestRemaining = GUEST_LIMIT - guestCount;
  const guestLimitReached = guestMode && guestCount >= GUEST_LIMIT;
  const showGuestWarning = guestMode && guestRemaining <= 5 && !guestLimitReached;

  useEffect(() => {
    sessionStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!session && !guestMode) enterGuestMode();
  }, []);

  useEffect(() => {
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    if (pendingMessage) {
      handleSubmit(pendingMessage);
      sessionStorage.removeItem('pendingMessage');
    }
  }, []);

  const handleSubmit = async (userInput) => {
    if (guestLimitReached) return;

    const userMessage = { type: 'user', text: userInput };
    const isFirstMessage = messages.length <= 1 && (!messages[0] || messages[0].type === 'ai');

    if (isFirstMessage) {
      setMessages([userMessage]);
    } else {
      setMessages(prev => [...prev, userMessage]);
    }

    try {
      let responseText;

      if (guestMode) {
        const guestId = parseInt(localStorage.getItem('guest_session_id') || '0');
        const response = await axios.post(`${AI_SERVICE_URL}/chat`, {
          message: userInput,
          user_id: guestId,
        });
        responseText = response.data.response || "Sorry, something went wrong.";
        const newCount = incrementGuestInteraction();
        setGuestCount(newCount);
      } else {
        const response = await axios.post(
          `${BACKEND_URL}/api/chat/message`,
          { message: userInput },
          { headers: { 'Authorization': `Bearer ${session.token}` } }
        );
        responseText = response.data.response || "Sorry, something went wrong.";
      }

      setMessages(prev => [...prev, { type: 'ai', text: responseText }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = error.response?.data?.response || "Sorry, I couldn't connect to the server.";
      setMessages(prev => [...prev, { type: 'ai', text: errorMessage }]);
    }
  };

  const showWelcomeScreen = messages.length <= 1 && (!messages[0] || messages[0].type === 'ai');

  return (
    <div className="flex h-screen bg-wa-bg" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(136,189,242,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(136,189,242,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <Sidebar />

      <div className="flex-1 ml-20 flex flex-col relative z-10">

        {showWelcomeScreen ? (
          /* ── Welcome screen ── */
          <div className="flex flex-col items-center justify-center flex-grow px-4 text-center">
            <div className="w-full max-w-2xl">

              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-wa-accent/20 border border-wa-accent-lt/25">
                <FaHeartbeat size={28} className="text-wa-accent-lt" />
              </div>

              <h2 className="text-4xl font-bold mb-3 text-wa-text" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
                Ask Benny
              </h2>
              <p className="text-wa-dim text-base mb-8 leading-relaxed">
                {messages[0]?.text}
              </p>

              <ChatInput onSubmit={handleSubmit} disabled={guestLimitReached} />

              {guestMode && (
                <p className="text-wa-dim/50 text-xs mt-4">
                  Guest mode · {guestRemaining} of {GUEST_LIMIT} free messages remaining
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* ── Message thread ── */}
            <div className="flex-grow overflow-y-auto p-6">
              <div className="w-full max-w-2xl mx-auto">
                {messages.map((msg, idx) =>
                  msg.type === 'ai' ? (
                    <ChatBubble
                      key={idx}
                      message={msg.text}
                      icon={null}
                      skipAnimation={msg.skipAnimation}
                    />
                  ) : (
                    <div key={idx} className="flex justify-end mb-4">
                      <div
                        className="px-4 py-3 rounded-2xl rounded-br-sm max-w-md text-sm leading-relaxed"
                        style={{ backgroundColor: 'rgba(106,137,167,0.25)', color: '#f0f4f8' }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  )
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* ── Input footer ── */}
            <div
              className="p-5 border-t border-wa-accent/20"
              style={{ backgroundColor: 'rgba(46,61,74,0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            >
              <div className="w-full max-w-2xl mx-auto">

                {/* Guest warning */}
                {showGuestWarning && (
                  <div className="mb-3 px-4 py-2 rounded-lg flex items-center justify-between border border-wa-accent/30 bg-wa-accent/10">
                    <p className="text-wa-dim text-sm">
                      {guestRemaining} free {guestRemaining === 1 ? 'message' : 'messages'} remaining
                    </p>
                    <button
                      onClick={() => setShowAuth(true)}
                      className="text-sm font-semibold text-wa-accent-lt hover:text-wa-text transition-colors duration-150"
                    >
                      Sign up for unlimited
                    </button>
                  </div>
                )}

                {/* Guest limit reached */}
                {guestLimitReached ? (
                  <div className="px-4 py-5 rounded-xl text-center border border-wa-accent/30 bg-wa-card">
                    <p className="text-wa-text font-medium mb-1">
                      You've used all {GUEST_LIMIT} free messages
                    </p>
                    <p className="text-wa-dim text-sm mb-4">
                      Create a free account to keep chatting with Benny.
                    </p>
                    <button
                      onClick={() => setShowAuth(true)}
                      className="bg-wa-accent hover:bg-wa-accent-lt hover:text-[#1a2530] text-white font-semibold py-2 px-6 rounded-lg transition-all duration-150"
                    >
                      Sign up — it's free
                    </button>
                  </div>
                ) : (
                  <ChatInput onSubmit={handleSubmit} />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <Auth isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

export default Chat;
