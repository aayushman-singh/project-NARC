import React, { useState } from "react";
import { ChevronDown, ChevronUp, X, ExternalLink, Image as ImageIcon } from "lucide-react";
import axios from "axios";

const TelegramChat = ({ chat, index }) => {
  const [isMediaExpanded, setIsMediaExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [chatLogs, setChatLogs] = useState(null);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [isChatLogsVisible, setIsChatLogsVisible] = useState(false);
  const [translatedLogs, setTranslatedLogs] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const toggleMedia = () => setIsMediaExpanded(!isMediaExpanded);
  const openImageViewer = (image) => setSelectedImage(image);
  const closeImageViewer = () => setSelectedImage(null);

  const fetchChatLogs = async () => {
    if (isChatLogsVisible) {
      setIsChatLogsVisible(false);
      return;
    }
    try {
      setIsLogsLoading(true);
      const response = await fetch(chat.logs);
      if (!response.ok) {
        throw new Error(`Failed to fetch chat logs: ${response.statusText}`);
      }
      const text = await response.text();
      setChatLogs(text);
      setTranslatedLogs(null); // Reset translated logs on new fetch
      setIsChatLogsVisible(true);
    } catch (error) {
      console.error(error.message);
      setChatLogs("Failed to load chat logs.");
      setIsChatLogsVisible(true);
    } finally {
      setIsLogsLoading(false);
    }
  };

  const translateText = async (text, targetLanguage) => {
    const apiKey = "AIzaSyCwqziN0xQTJUXtPRACkRwpMLrbY9P2uHg"; // Replace with your API key
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    try {
      const response = await axios.post(url, {
        q: text,
        target: targetLanguage,
      });
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error("Error translating text:", error);
      return "Translation failed.";
    }
  };

  const handleTranslate = async () => {
    if (!chatLogs || !selectedLanguage) return;
    setIsTranslating(true);
    const translated = await translateText(chatLogs, selectedLanguage);
    setTranslatedLogs(translated);
    setIsTranslating(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 to-gray-800 p-6 rounded-xl shadow-lg mt-6 border border-blue-700/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {chat.receiverUsername.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">
            {chat.receiverUsername}
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        {/* Existing media gallery and chat log fetching code */}
        <div className="flex justify-between items-center">
          <button
            onClick={fetchChatLogs}
            className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 group"
          >
            <span className="font-medium">
              {isChatLogsVisible ? "Close Chat History" : "View Chat History"}
            </span>
            <ExternalLink className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          <a
            href={chat.logs}
            className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200 group"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="font-medium">Open Chat Log</span>
            <ExternalLink className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      {isChatLogsVisible && (
        <div className="bg-gray-800/50 rounded-xl p-4 mt-4 overflow-auto max-h-64">
          {isLogsLoading ? (
            <p className="text-blue-300">Loading chat logs...</p>
          ) : (
            <pre className="text-gray-300 whitespace-pre-wrap">
              {translatedLogs || chatLogs}
            </pre>
          )}
          <div className="flex items-center mt-4 space-x-4">
            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isTranslating ? "Translating..." : "Translate"}
            </button>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-gray-800 text-white text-sm rounded-lg p-2"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="bn">Bengali</option>
              <option value="kn">Kannada</option>
              <option value="mr">Marathi</option>
              <option value="te">Telugu</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelegramChat;
