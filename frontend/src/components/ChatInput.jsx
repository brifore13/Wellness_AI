import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const ChatInput = ({ onSubmit, placeholder = "Type your message..." }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
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
          className="w-full border border-gray-300 p-4 pr-16 rounded-xl text-lg resize-none placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          rows={3}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="absolute bottom-4 right-4 text-blue-600 disabled:text-gray-300 hover:text-blue-700 transition-colors"
        >
          <FaPaperPlane size={24} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;