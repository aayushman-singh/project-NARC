import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import axios from "axios";

const DiscordChat = ({ chat }) => {
  const [isMediaExpanded, setIsMediaExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [chatLogs, setChatLogs] = useState(null); // Stores chat logs
  const [isLogsLoading, setIsLogsLoading] = useState(false); // Indicates loading state
  const [isChatLogsVisible, setIsChatLogsVisible] = useState(false); // Controls visibility of chat logs
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Default to English

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
      const response = await fetch(chat.chats);

      if (!response.ok) {
        throw new Error(`Failed to fetch chat logs: ${response.statusText}`);
      }

      const text = await response.text();

      // Translate the logs
      const translatedLogs = await translateText(text, selectedLanguage);
      setChatLogs(translatedLogs);
      setIsChatLogsVisible(true); // Make logs visible
    } catch (error) {
      console.error(error.message);
      setChatLogs("Failed to load chat logs.");
      setIsChatLogsVisible(true);
    } finally {
      setIsLogsLoading(false);
    }
  };

  const translateText = async (text, targetLanguage) => {
    const apiKey = "AIzaSyCwqziN0xQTJUXtPRACkRwpMLrbY9P2uHg";
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    try {
      const response = await axios.post(url, {
        q: text,
        target: targetLanguage,
      });
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error("Translation failed:", error);
      return "Translation failed. Please try again.";
    }
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
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="bg-gray-700 text-white text-sm rounded-lg p-2"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
        </select>
      </div>

      <div className="space-y-4">
        {chat.screenshots && chat.screenshots.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
            <button
              onClick={toggleMedia}
              className="flex items-center justify-between w-full text-blue-400 hover:text-blue-300 transition-all duration-200 group"
              aria-expanded={isMediaExpanded}
            >
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span className="font-medium">
                  Media Gallery ({chat.screenshots.length})
                </span>
              </div>
              {isMediaExpanded ? (
                <ChevronUp className="h-5 w-5 transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 transition-transform duration-200" />
              )}
            </button>

            <div
              className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4 transition-all duration-300 ease-in-out ${
                isMediaExpanded
                  ? "opacity-100 max-h-[1000px]"
                  : "opacity-0 max-h-0 overflow-hidden"
              }`}
            >
              {chat.screenshots.map((mediaFile, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-lg overflow-hidden cursor-pointer bg-gray-700/50 aspect-square"
                  onClick={() => openImageViewer(mediaFile)}
                >
                  <img
                    src={mediaFile}
                    alt={`Media ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center p-3">
                    <span className="text-white text-sm font-medium">
                      View Full
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
            href={chat.chats}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
          >
            Open Chat Log
          </a>
        </div>
      </div>

      {isChatLogsVisible && (
        <div className="bg-gray-800/50 rounded-xl p-4 mt-4 overflow-auto max-h-64">
          {isLogsLoading ? (
            <p className="text-blue-300">Loading chat logs...</p>
          ) : (
            <pre className="text-gray-300 whitespace-pre-wrap">
              {chatLogs}
            </pre>
          )}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={closeImageViewer}
        >
          <div className="relative max-w-5xl w-full">
            <img
              src={selectedImage}
              alt="Full size media"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={closeImageViewer}
              className="absolute -top-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-lg"
              aria-label="Close image viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscordChat;
