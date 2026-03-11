import React from 'react';
import { useTypingEffect } from '../hooks/useTypingEffect';

const ChatBubble = ({ message, icon, buttons, onButtonClick, speed = 20, skipAnimation = false }) => {
  const displayedText = useTypingEffect(message, speed, skipAnimation);
  const isTypingComplete = displayedText === message;

  return (
    <div className="flex items-start mb-4">
      <div
        className="p-4 max-w-2xl text-sm leading-relaxed"
        style={{
          backgroundColor: 'rgba(46,61,74,0.9)',
          color: '#f0f4f8',
          borderRadius: '18px 18px 18px 4px',
          border: '1px solid rgba(136,189,242,0.15)',
        }}
      >
        <p>{displayedText}</p>

        {isTypingComplete && buttons && buttons.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {buttons.map((buttonText, idx) => (
              <button
                key={idx}
                onClick={() => onButtonClick(buttonText)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150
                           text-wa-accent-lt border border-wa-accent/30 bg-wa-accent/10
                           hover:bg-wa-accent/20 hover:border-wa-accent-lt/50"
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
