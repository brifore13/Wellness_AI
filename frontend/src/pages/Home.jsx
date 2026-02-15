import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import Header from '../components/Header';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import Auth from '../components/Auth';
import bennyIcon from '../assets/benny_icon.png';

const GREETING_PROMPTS = [
  "Hi, I'm Benny, your wellness beaver! I can help with nutrition, fitness, and stress. Where would you like to start?",
  "Hey! Benny the wellness beaver, at your service. I'm all about helping you eat better, move more, and stress less. What's top of mind for you?",
  "Hi, I'm Benny! My goal is to help you feel great. Are you looking to boost your energy with better food, get stronger with fitness, or find your calm? Let me know!",
];

function Home() {
  const [messages, setMessages] = useState(() => {
    const randomIndex = Math.floor(Math.random() * GREETING_PROMPTS.length);
    return [{ type: 'ai', text: GREETING_PROMPTS[randomIndex] }];
  });
  const [showAuth, setShowAuth] = useState(false);
  const { session, loading } = useSession();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && session) {
      navigate('/chat');
    }
  }, [session, loading, navigate]);

  const handleSubmit = (userInput) => {
    const userMessage = { type: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);

    // Store message to use after login
    sessionStorage.setItem('pendingMessage', userInput);

    // Show sign-in prompt
    const aiMessage = { 
      type: 'ai', 
      text: "Thanks! Let's get you signed in to continue." 
    };

    setTimeout(() => {
      setMessages(prev => [...prev, aiMessage]);
      
      setTimeout(() => {
        setShowAuth(true);
      }, 500);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex flex-col items-center pt-16 px-4 pb-8">
        <img 
          src={bennyIcon} 
          alt="Benny the Beaver" 
          className="w-24 h-24 mb-4" 
        />
        <h1 className="text-4xl font-bold mb-2 text-gray-800">
          Welcome to Benny Wellness AI
        </h1>
        <p className="text-gray-600 mb-12 text-lg">
          Your personal wellness companion
        </p>

        <div className="w-full max-w-3xl">
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
          
          <ChatInput 
            onSubmit={handleSubmit}
            placeholder="Share your wellness goals..."
          />
        </div>
      </main>

      <Auth isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

export default Home;