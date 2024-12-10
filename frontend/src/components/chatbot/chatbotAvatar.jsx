import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Chatbot from './index'; // Assuming you have your Chatbot component

const ChatbotAvatar = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Avatar Button */}
      <button 
        onClick={toggleChatbot}
        className="bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-all duration-300 ease-in-out transform hover:scale-110"
        aria-label="Open Chatbot"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chatbot Modal */}
      {isChatbotOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 h-[500px] relative">
            <button 
              onClick={toggleChatbot}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Close Chatbot"
            >
              ✕
            </button>
            <Chatbot />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotAvatar;