import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { fakeMessages } from "./fakeMessages";
import { askAiQuestion } from "./aiChatApi";

const AiChatPopup = ({ onClose }) => {
  const [aiMessages, setAiMessages] = useState(fakeMessages);
  const [aiInput, setAiInput] = useState("");
  const aiEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const sendMessage = async () => {
    if (!aiInput.trim()) return;

    const userQuestion = aiInput;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: userQuestion,
    };

    const typingMsg = {
      id: Date.now() + 1,
      sender: "bot",
      text: "Thinking...",
      typing: true,
    };

    setAiMessages((prev) => [...prev, userMsg, typingMsg]);
    setAiInput("");

    try {
      const res = await askAiQuestion(userQuestion);

      setAiMessages((prev) =>
        prev
          .filter((msg) => !msg.typing)
          .concat({
            id: Date.now() + 2,
            sender: "bot",
            text: res.answer, // 👈 Markdown allowed here
          })
      );
    } catch (error) {
      setAiMessages((prev) =>
        prev
          .filter((msg) => !msg.typing)
          .concat({
            id: Date.now() + 2,
            sender: "bot",
            text: "⚠️ **Error:** Something went wrong. Please try again.",
          })
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="ai-chat-popup">
      {/* HEADER */}
      <div className="ai-chat-header">
        <span>AI Assistant</span>
        <button className="ai-chat-close" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* BODY */}
      <div className="ai-chat-body">
        {aiMessages.map((msg) => (
          <div
            key={msg.id}
            className={`ai-chat-msg ${
              msg.sender === "user" ? "ai-user" : "ai-bot"
            }`}
          >
            {msg.sender === "bot" ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.text}
              </ReactMarkdown>
            ) : (
              msg.text
            )}
          </div>
        ))}
        <div ref={aiEndRef} />
      </div>

      {/* INPUT */}
      <div className="ai-chat-input-area">
        <input
          className="ai-chat-input"
          type="text"
          placeholder="Type your message..."
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button className="ai-chat-send" onClick={sendMessage}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default AiChatPopup;
