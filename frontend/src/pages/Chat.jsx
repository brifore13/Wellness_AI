import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSession } from '../contexts/SessionContext';
import Sidebar from '../components/Sidebar';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import Auth from '../components/Auth';
import bennyIcon from '../assets/benny_icon.png';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://127.0.0.1:8001';

const GREETING_PROMPTS = [
  "Hi! I can help with nutrition, fitness, and stress. Where would you like to start?",
  "Hey! I'm all about helping you eat better, move more, and stress less. What's on your mind?",
  "Are you looking to boost your energy with better food, get stronger with fitness, or find your calm?",
];

function Chat() {
  const { session, guestMode, getGuestInteractionCount, incrementGuestInteraction, GUEST_LIMIT } = useSession();
  const [messages, setMessages] = useState(() => {
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    if (pendingMessage) return [];

    const randomIndex = Math.floor(Math.random() * GREETING_PROMPTS.length);
    return [{ type: 'ai', text: GREETING_PROMPTS[randomIndex] }];
  });
  const [guestCount, setGuestCount] = useState(() => getGuestInteractionCount());
  const [showAuth, setShowAuth] = useState(false);

  const chatEndRef = useRef(null);

  const guestRemaining = GUEST_LIMIT - guestCount;
  const guestLimitReached = guestMode && guestCount >= GUEST_LIMIT;

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle pending message from home page
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

    // Replace welcome message if it's the first user message
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
      const errorMessage = error.response?.data?.response ||
        "Sorry, I couldn't connect to the server.";
      setMessages(prev => [...prev, { type: 'ai', text: errorMessage }]);
    }
  };

  const showWelcomeScreen = messages.length <= 1 && (!messages[0] || messages[0].type === 'ai');

  // Guest banner shown when ≤ 5 messages remain (and not yet at limit)
  const showGuestWarning = guestMode && guestRemaining <= 5 && !guestLimitReached;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-20 flex flex-col">
        {showWelcomeScreen ? (
          <div className="flex flex-col items-center justify-center text-center flex-grow px-4">
            <div className="w-full max-w-3xl">
              <img
                src={bennyIcon}
                alt="Benny the Beaver"
                className="w-24 h-24 mb-4 mx-auto"
              />
              <h2 className="text-4xl font-bold mb-4 text-gray-800">
                Chat with Benny
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                {messages[0]?.text}
              </p>
              <ChatInput onSubmit={handleSubmit} disabled={guestLimitReached} />
              {guestMode && (
                <p className="text-gray-400 text-sm mt-4">
                  Guest mode · {guestRemaining} of {GUEST_LIMIT} free messages remaining
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto p-6">
              <div className="w-full max-w-3xl mx-auto">
                {messages.map((msg, idx) =>
                  msg.type === 'ai' ? (
                    <ChatBubble key={idx} message={msg.text} icon={bennyIcon} />
                  ) : (
                    <div key={idx} className="flex justify-end mb-4">
                      <div className="bg-blue-100 p-4 rounded-lg max-w-md">
                        <p className="text-lg">{msg.text}</p>
                      </div>
                    </div>
                  )
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            <div className="p-6 bg-white border-t">
              <div className="w-full max-w-3xl mx-auto">
                {showGuestWarning && (
                  <div className="mb-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                    <p className="text-amber-700 text-sm">
                      {guestRemaining} free {guestRemaining === 1 ? 'message' : 'messages'} remaining
                    </p>
                    <button
                      onClick={() => setShowAuth(true)}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Sign up for unlimited
                    </button>
                  </div>
                )}

                {guestLimitReached ? (
                  <div className="px-4 py-4 bg-gray-100 border border-gray-200 rounded-lg text-center">
                    <p className="text-gray-700 font-medium mb-1">
                      You've used all {GUEST_LIMIT} free messages
                    </p>
                    <p className="text-gray-500 text-sm mb-3">
                      Create a free account to keep chatting with Benny.
                    </p>
                    <button
                      onClick={() => setShowAuth(true)}
                      className="bg-black text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors"
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