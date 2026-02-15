import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSession } from '../contexts/SessionContext';
import Sidebar from '../components/Sidebar';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import bennyIcon from '../assets/benny_icon.png';

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://127.0.0.1:8001';

const GREETING_PROMPTS = [
  "Hi! I can help with nutrition, fitness, and stress. Where would you like to start?",
  "Hey! I'm all about helping you eat better, move more, and stress less. What's on your mind?",
  "Are you looking to boost your energy with better food, get stronger with fitness, or find your calm?",
];

function Chat() {
  const { session } = useSession();
  const [messages, setMessages] = useState(() => {
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    if (pendingMessage) return [];
    
    const randomIndex = Math.floor(Math.random() * GREETING_PROMPTS.length);
    return [{ type: 'ai', text: GREETING_PROMPTS[randomIndex] }];
  });
  
  const chatEndRef = useRef(null);

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
    const userMessage = { type: 'user', text: userInput };
    
    // Replace welcome message if it's the first user message
    const isFirstMessage = messages.length <= 1 && (!messages[0] || messages[0].type === 'ai');
    
    if (isFirstMessage) {
      setMessages([userMessage]);
    } else {
      setMessages(prev => [...prev, userMessage]);
    }

    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/chat`,
        { message: userInput },
        {
          headers: {
            'Authorization': `Bearer ${session.token}`
          }
        }
      );

      const aiMessage = { 
        type: 'ai', 
        text: response.data.response || "Sorry, something went wrong." 
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      
      const errorMessage = error.response?.data?.response || 
                          "Sorry, I couldn't connect to the server.";
      
      const aiMessage = { type: 'ai', text: errorMessage };
      setMessages(prev => [...prev, aiMessage]);
    }
  };

  const showWelcomeScreen = messages.length <= 1 && (!messages[0] || messages[0].type === 'ai');

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
              <ChatInput onSubmit={handleSubmit} />
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
                <ChatInput onSubmit={handleSubmit} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;