import React, { useState } from 'react';
import './style.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "🧠 You can ask me any question, whether it's math, health, or anything else!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that can answer a wide range of questions, from math to general knowledge.' },
            { role: 'user', content: input }
          ],
          max_tokens: 150,
          n: 1,
          stop: null
        })
      });

      const data = await response.json();
      let botMessageText = data.choices[0]?.message.content.trim() || "Sorry, I couldn't process that.";

      // 1) Split the response into lines
      const lines = botMessageText.split('\n');

      // 2) Separate lines into "intro" vs. "numbered list items"
      const introLines = [];
      const listLines = [];

      for (const line of lines) {
        const trimmed = line.trim();
        // Check if it matches something like "1. Heart disease"
        const match = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (match) {
          // match[2] is the text after "1."
          listLines.push(match[2]);
        } else {
          // It's not a numbered line; treat as normal text
          introLines.push(trimmed);
        }
      }

      // 3) Build the final HTML
      let finalMessage = '';

      // If there's intro text, join it with <br/>
      if (introLines.length > 0) {
        finalMessage += introLines.join('<br/>');
      }

      // If there's both intro text AND list lines, add a <br/> gap
      if (introLines.length > 0 && listLines.length > 0) {
        finalMessage += '<br/>';
      }

      // If we found numbered lines, wrap them in an <ol>
      if (listLines.length > 0) {
        const listHtml = listLines.map(item => `<li>${item}</li>`).join('');
        finalMessage += `<ol>${listHtml}</ol>`;
      }

      const botMessage = { text: finalMessage, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      setMessages(prev => [...prev, { text: "Error communicating with AI.", sender: 'bot' }]);
    }

    setInput('');
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage(); // Trigger message send on Enter press
    }
  };

  return (
    <div className="chatbot-app">
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === 'bot' ? 'bot-message' : 'user-message'}>
            {/* Renders HTML (including <ol>, <li>, and <br/>) */}
            <div dangerouslySetInnerHTML={{ __html: msg.text }} />
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}  // Listen for key press
          placeholder="Ask me anything..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chatbot;
