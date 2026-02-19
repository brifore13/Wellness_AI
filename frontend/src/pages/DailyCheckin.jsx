import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from '../contexts/SessionContext';
import Sidebar from '../components/Sidebar';
import ChatBubble from '../components/ChatBubble';
import bennyIcon from '../assets/benny_icon.png';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

const checkinQuestions = [
  {
    id: 1,
    type: 'ai',
    text: "Hi! Ready for our daily check-in? How did you feel about your nutrition choices today?",
    category: "nutrition",
    buttons: ["Excellent", "Good", "Okay", "Poor"],
  },
  {
    id: 2,
    type: 'ai',
    text: "And how would you rate your sleep last night?",
    category: "sleep",
    buttons: ["Very good", "Good", "Okay", "Poor"],
  },
  {
    id: 3,
    type: 'ai',
    text: "Now for fitness. Did you complete your planned fitness activity today?",
    category: "fitness",
    buttons: ["Yes, completed", "Partially completed", "No, skipped"],
  },
  {
    id: 4,
    type: 'ai',
    text: "Finally, let's check in on your well-being. How would you rate your stress levels today?",
    category: "stress",
    buttons: ["Low", "Moderate", "High", "Very high"],
  },
  {
    id: 5,
    type: 'ai',
    text: "Thanks for completing your check-in! Wait for Benny's personalized recommendation...",
    category: "completion",
    buttons: [],
  },
];

function DailyCheckin() {
  const { session } = useSession();
  const [messages, setMessages] = useState([checkinQuestions[0]]);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [todayRecommendation, setTodayRecommendation] = useState(null);

  useEffect(() => {
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

  const handleButtonClick = async (buttonText) => {
    if (isCompleted || loading) return;

    const currentQuestion = checkinQuestions[currentStep];
    
    // Store response
    const updatedResponses = {
      ...responses,
      [currentQuestion.category]: buttonText
    };
    setResponses(updatedResponses);

    // Add user message
    const userMessage = { type: 'user', text: buttonText };
    setMessages(prev => [...prev, userMessage]);

    const nextStep = currentStep + 1;

    if (nextStep < checkinQuestions.length) {
      // Add next question
      setTimeout(() => {
        const nextQuestion = checkinQuestions[nextStep];
        setMessages(prev => [...prev, nextQuestion]);
        setCurrentStep(nextStep);

        // If completion message, submit to backend
        if (nextQuestion.category === 'completion') {
          submitCheckin(updatedResponses);
        }
      }, 800);
    }
  };

  const submitCheckin = async (finalResponses) => {
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/checkin/submit`,
        finalResponses,
        {
          headers: {
            'Authorization': `Bearer ${session.token}`
          }
        }
      );

      if (response.data.success && response.data.recommendation) {
        // Add Benny's recommendation
        setTimeout(() => {
          const recommendationMessage = {
            type: 'ai',
            text: `Benny's Recommendation: ${response.data.recommendation}`
          };
          setMessages(prev => [...prev, recommendationMessage]);
          setIsCompleted(true);
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting check-in:', error);
      
      const errorMessage = {
        type: 'ai',
        text: error.response?.data?.detail || "Sorry, I couldn't save your check-in. Please try again."
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (alreadyCompleted) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-20 flex items-center justify-center p-6">
          <div className="w-full max-w-lg text-center">
            <img src={bennyIcon} alt="Benny the Beaver" className="w-24 h-24 mb-6 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-800 mb-3">You're all checked in!</h1>
            <p className="text-gray-500 text-lg mb-6">Great work today. Come back tomorrow for your next check-in.</p>
            {todayRecommendation && (
              <div className="bg-white rounded-lg shadow-sm p-6 text-left">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Today's Recommendation</p>
                <p className="text-gray-800">{todayRecommendation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-20 overflow-y-auto p-6">
        <div className="w-full max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <img
              src={bennyIcon}
              alt="Benny the Beaver"
              className="w-20 h-20 mb-4 mx-auto"
            />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Daily Check-In
            </h1>
            <p className="text-gray-600">
              Let's see how you're doing today
            </p>
          </div>

          <div className="space-y-4">
            {messages.map((msg, idx) => {
              const isActiveQuestion = msg.id === checkinQuestions[currentStep]?.id;
              if (msg.type === 'ai') {
                return (
                  <ChatBubble
                    key={idx}
                    message={msg.text}
                    icon={bennyIcon}
                    speed={10}
                    buttons={isActiveQuestion ? msg.buttons : []}
                    onButtonClick={handleButtonClick}
                  />
                );
              }
              
              return (
                <div key={idx} className="flex justify-end">
                  <div className="bg-black text-white font-semibold p-4 rounded-lg max-w-md">
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyCheckin;