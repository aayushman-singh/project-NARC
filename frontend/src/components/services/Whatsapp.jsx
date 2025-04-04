import React, { useState } from "react";
import { ChevronDown, ChevronUp, X, Image as ImageIcon, ExternalLink } from "lucide-react";
import axios from "axios";

const WhatsAppChat = ({ chat, index }) => {
  const [isMediaExpanded, setIsMediaExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [chatLogs, setChatLogs] = useState(null); // Stores original chat logs
  const [translatedLogs, setTranslatedLogs] = useState(null); // Stores translated chat logs
  const [isLogsLoading, setIsLogsLoading] = useState(false); // Indicates loading state
  const [isChatLogsVisible, setIsChatLogsVisible] = useState(false); // Controls visibility of chat logs
  const [isTranslating, setIsTranslating] = useState(false); // Indicates translation loading state
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // Default translation language

  const toggleMedia = () => setIsMediaExpanded(!isMediaExpanded);
  const openImageViewer = (image) => setSelectedImage(image);
  const closeImageViewer = () => setSelectedImage(null);

  const fetchChatLogs = async () => {
    if (isChatLogsVisible) {
      // Close chat logs if already open
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
      setChatLogs(text);
      setIsChatLogsVisible(true); // Make logs visible
    } catch (error) {
      console.error(error.message);
      setChatLogs("Failed to load chat logs.");
      setIsChatLogsVisible(true);
    } finally {
      setIsLogsLoading(false);
    }
  };

  const translateChatLogs = async () => {
    if (!chatLogs || !selectedLanguage) return;
    setIsTranslating(true);

    const apiKey = "AIzaSyCwqziN0xQTJUXtPRACkRwpMLrbY9P2uHg"; // Replace with your API key
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    try {
      const response = await axios.post(url, {
        q: chatLogs,
        target: selectedLanguage,
      });

      setTranslatedLogs(response.data.data.translations[0].translatedText);
    } catch (error) {
      console.error("Error translating chat logs:", error);
      setTranslatedLogs("Translation failed.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-900 to-gray-800 p-6 rounded-xl shadow-lg mt-6 border border-green-700/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
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
        {chat.screenshots && chat.screenshots.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
            <button
              onClick={toggleMedia}
              className="flex items-center justify-between w-full text-green-400 hover:text-green-300 transition-all duration-200 group"
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
              {chat.screenshots.map((screenshot, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-lg overflow-hidden cursor-pointer bg-gray-700/50 aspect-square"
                  onClick={() => openImageViewer(screenshot)}
                >
                  <img
                    src={screenshot}
                    alt={`Screenshot ${idx + 1}`}
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
            className="inline-flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors duration-200 group"
          >
            <span className="font-medium">
              {isChatLogsVisible ? "Close Chat History" : "View Chat History"}
            </span>
            <ExternalLink className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        {isChatLogsVisible && (
          <div className="bg-gray-800/50 rounded-xl p-4 mt-4 overflow-auto max-h-64">
            {isLogsLoading ? (
              <p className="text-green-300">Loading chat logs...</p>
            ) : (
              <>
                <pre className="text-gray-300 whitespace-pre-wrap">{chatLogs}</pre>
                {translatedLogs && (
                  <div className="mt-4 bg-gray-700 p-3 rounded-lg text-gray-300">
                    <strong>Translated Logs:</strong>
                    <pre className="whitespace-pre-wrap">{translatedLogs}</pre>
                  </div>
                )}
                <div className="flex items-center mt-4 space-x-4">
                  <button
                    onClick={translateChatLogs}
                    disabled={isTranslating}
                    className="text-green-400 hover:text-green-300 transition-colors"
                  >
                    {isTranslating ? "Translating..." : "Translate Logs"}
                  </button>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-gray-800 text-white text-sm rounded-lg p-2"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={closeImageViewer}
        >
          <div className="relative max-w-5xl w-full">
            <img
              src={selectedImage}
              alt="Full size screenshot"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={closeImageViewer}
              className="absolute -top-2 -right-2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors duration-200 shadow-lg"
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

const WhatsAppChats = ({ chats }) => {
  return (
    <div className="space-y-6">
      {chats.map((chat, index) => (
        <WhatsAppChat key={index} chat={chat} index={index} />
      ))}
    </div>
  );
};

export default WhatsAppChats;
