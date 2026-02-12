import React, { useState } from "react";
import AiChatPopup from "./AiChatPopup";
import "./aiChat.css";

function AiChatWidget() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <>
      <div
        className="ai-chat-fab"
        onClick={() => setAiOpen(!aiOpen)}
        title="AI Assistant"
      >
        🤖
      </div>

      {aiOpen && <AiChatPopup onClose={() => setAiOpen(false)} />}
    </>
  );
}

export default AiChatWidget;
