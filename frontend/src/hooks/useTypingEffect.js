import { useState, useEffect } from 'react';

export const useTypingEffect = (text, speed = 30, skipAnimation = false) => {
  const [displayedText, setDisplayedText] = useState(skipAnimation ? text : '');

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      return;
    }

    if (skipAnimation) {
      setDisplayedText(text);
      return;
    }

    let index = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      if (index < text.length) {
        index++;
        setDisplayedText(text.slice(0, index));
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, skipAnimation]);

  return displayedText;
};