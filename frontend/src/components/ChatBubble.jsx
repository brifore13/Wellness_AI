import React from 'react';
import { useTypingEffect } from '../hooks/useTypingEffect';

const ChatBubble = ({ message, icon, buttons, onButtonClick, speed = 20, skipAnimation = false }) => {
  const displayedText = useTypingEffect(message, speed, skipAnimation);
  const isTypingComplete = displayedText === message;

  return (
    <div className="flex items-start mb-4">
      {icon && (
        <img 
          src={icon} 
          alt="Benny" 
          className="w-12 h-12 mr-3 rounded-full flex-shrink-0" 
        />
      )}
      <div className="bg-gray-100 p-4 rounded-lg max-w-2xl">
        <p className="text-lg text-gray-800">{displayedText}</p>
        
        {isTypingComplete && buttons && buttons.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {buttons.map((buttonText, idx) => (
              <button
                key={idx}
                onClick={() => onButtonClick(buttonText)}
                className="bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {buttonText}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;