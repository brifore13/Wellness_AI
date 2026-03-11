import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSession } from '../contexts/SessionContext';
import Sidebar from '../components/Sidebar';
import ChatBubble from '../components/ChatBubble';
import { FaHeartbeat } from 'react-icons/fa';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://127.0.0.1:8001';

const checkinQuestions = [
  {
    id: 1, type: 'ai', category: 'nutrition',
    text: "How did you feel about your nutrition choices today?",
    buttons: ["Excellent", "Good", "Okay", "Poor"],
  },
  {
    id: 2, type: 'ai', category: 'sleep',
    text: "How would you rate your sleep last night?",
    buttons: ["Very good", "Good", "Okay", "Poor"],
  },
  {
    id: 3, type: 'ai', category: 'fitness',
    text: "Did you complete your planned fitness activity today?",
    buttons: ["Yes, completed", "Partially completed", "No, skipped"],
  },
  {
    id: 4, type: 'ai', category: 'stress',
    text: "How would you rate your stress levels today?",
    buttons: ["Low", "Moderate", "High", "Very high"],
  },
  {
    id: 5, type: 'ai', category: 'completion',
    text: "Thanks for completing your check-in. Generating your recommendation...",
    buttons: [],
  },
];

const gridBg = {
  backgroundImage: 'linear-gradient(rgba(136,189,242,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(136,189,242,0.04) 1px, transparent 1px)',
  backgroundSize: '48px 48px',
};

function DailyCheckin() {
  const { session, guestMode } = useSession();
  const [messages, setMessages] = useState([checkinQuestions[0]]);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [todayRecommendation, setTodayRecommendation] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (guestMode) { setChecking(false); return; }
    const checkTodayCheckin = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/checkin/today`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        if (response.data.exists) {
          setAlreadyCompleted(true);
          setTodayRecommendation(response.data.checkin?.recommendation || null);
        }
      } catch (error) {
        console.error('Error checking today check-in:', error);
      } finally {
        setChecking(false);
      }
    };
    checkTodayCheckin();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleButtonClick = async (buttonText) => {
    if (isCompleted || loading) return;
    const currentQuestion = checkinQuestions[currentStep];
    const updatedResponses = { ...responses, [currentQuestion.category]: buttonText };
    setResponses(updatedResponses);
    setMessages(prev => [...prev, { type: 'user', text: buttonText }]);
    const nextStep = currentStep + 1;
    if (nextStep < checkinQuestions.length) {
      setTimeout(() => {
        const nextQuestion = checkinQuestions[nextStep];
        setMessages(prev => [...prev, nextQuestion]);
        setCurrentStep(nextStep);
        if (nextQuestion.category === 'completion') submitCheckin(updatedResponses);
      }, 800);
    }
  };

  const submitCheckin = async (finalResponses) => {
    setLoading(true);
    try {
      let recommendation;
      if (guestMode) {
        const response = await axios.post(`${AI_SERVICE_URL}/recommend`, { daily_checkin: finalResponses });
        recommendation = response.data.response;
      } else {
        const response = await axios.post(
          `${BACKEND_URL}/api/checkin/submit`, finalResponses,
          { headers: { Authorization: `Bearer ${session.token}` } }
        );
        if (response.data.success) recommendation = response.data.recommendation;
      }
      if (recommendation) {
        setTimeout(() => {
          setMessages(prev => [...prev, { type: 'ai', text: `Recommendation: ${recommendation}` }]);
          setIsCompleted(true);
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting check-in:', error);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'ai',
          text: error.response?.data?.detail || "Couldn't save your check-in. Please try again."
        }]);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading screen ──
  if (checking) {
    return (
      <div className="flex h-screen bg-wa-bg">
        <div className="fixed inset-0 pointer-events-none z-0" style={gridBg} />
        <Sidebar />
        <div className="flex-1 ml-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-wa-accent-lt" />
        </div>
      </div>
    );
  }

  // ── Already completed screen ──
  if (alreadyCompleted) {
    return (
      <div className="flex h-screen bg-wa-bg" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div className="fixed inset-0 pointer-events-none z-0" style={gridBg} />
        <Sidebar />
        <div className="flex-1 ml-20 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-wa-accent/20 border border-wa-accent-lt/25">
              <FaHeartbeat size={26} className="text-wa-accent-lt" />
            </div>
            <h1 className="text-3xl font-bold text-wa-text mb-3" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
              You're all checked in!
            </h1>
            <p className="text-wa-dim text-sm mb-8">
              Great work today. Come back tomorrow for your next check-in.
            </p>
            {todayRecommendation && (
              <div
                className="text-left p-5 rounded-xl border border-wa-accent/20"
                style={{ backgroundColor: 'rgba(46,61,74,0.8)' }}
              >
                <p className="text-[10px] font-semibold text-wa-dim uppercase tracking-widest mb-2">
                  Today's Recommendation
                </p>
                <p className="text-wa-text text-sm leading-relaxed">{todayRecommendation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main check-in screen ──
  return (
    <div className="flex h-screen bg-wa-bg" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none z-0" style={gridBg} />
      <Sidebar />

      <div className="flex-1 ml-20 overflow-y-auto relative z-10">
        <div className="w-full max-w-2xl mx-auto">

          {/* Sticky header */}
          <div
            className="sticky top-0 z-10 text-center py-6 px-6 border-b border-wa-accent/20"
            style={{ backgroundColor: 'rgba(56,73,89,0.92)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
          >
            <h1 className="text-2xl font-bold text-wa-text mb-1" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
              Daily Check-In
            </h1>
            <p className="text-wa-dim text-xs">Let's see how you're doing today</p>
          </div>

          {/* Messages */}
          <div className="space-y-4 px-6 pt-6 pb-64">
            {messages.map((msg, idx) => {
              const isActiveQuestion = msg.id === checkinQuestions[currentStep]?.id;
              if (msg.type === 'ai') {
                return (
                  <ChatBubble
                    key={idx}
                    message={msg.text}
                    icon={null}
                    speed={10}
                    buttons={isActiveQuestion ? msg.buttons : []}
                    onButtonClick={handleButtonClick}
                  />
                );
              }
              return (
                <div key={idx} className="flex justify-end">
                  <div
                    className="px-4 py-3 text-sm leading-relaxed max-w-xs"
                    style={{
                      backgroundColor: 'rgba(106,137,167,0.25)',
                      color: '#f0f4f8',
                      borderRadius: '18px 18px 4px 18px',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wa-accent-lt" />
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyCheckin;
