import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const ChatInput = ({ onSubmit, placeholder = "Type your message...", disabled = false }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          style={{
            backgroundColor: 'rgba(46,61,74,0.95)',
            color: '#f0f4f8',
            border: '1px solid rgba(136,189,242,0.2)',
            borderRadius: '12px',
          }}
          className="w-full p-4 pr-16 text-sm resize-none focus:outline-none placeholder-wa-dim/60
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:border-wa-accent-lt/50 transition-colors duration-150"
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="absolute bottom-4 right-4 transition-colors duration-150
                     text-wa-accent-lt disabled:text-wa-dim/30 hover:text-wa-text"
        >
          <FaPaperPlane size={18} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
