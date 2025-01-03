import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Image as ImageIcon,
  Languages,
  Download 
} from "lucide-react";

const TelegramChat = ({ chat, index }) => {
  const [isMediaExpanded, setIsMediaExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [chatLogs, setChatLogs] = useState(null);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [isChatLogsVisible, setIsChatLogsVisible] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isDownloading, setIsDownloading] = useState(false);
  const toggleMedia = () => setIsMediaExpanded(!isMediaExpanded);
  const openImageViewer = (image) => setSelectedImage(image);
  const closeImageViewer = () => setSelectedImage(null);

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
      console.error("Error translating text:", error);
      return "Translation failed.";
    }
  };

  const handleTranslate = async () => {
    if (!chatLogs || !selectedLanguage) return;
    setIsTranslating(true);
    const translated = await translateText(chatLogs, selectedLanguage);
    setTranslatedText(translated);
    setIsTranslating(false);
  };
  const downloadReport = async () => {
    setIsDownloading(true);
    try {
      const response = await axios.post(
        "http://localhost:3005/telegram/generate-report",
        { username: username },
        { responseType: "blob" } // Ensure the response is treated as a file
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `telegram_report_${chat.receiverUsername}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download the report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };
  const fetchChatLogs = async () => {
    if (isChatLogsVisible) {
      setIsChatLogsVisible(false);
      setTranslatedText(null);
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
      setTranslatedText(null);
      setIsChatLogsVisible(true);
    } catch (error) {
      console.error(error.message);
      setChatLogs("Failed to load chat logs.");
      setIsChatLogsVisible(true);
    } finally {
      setIsLogsLoading(false);
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
       
      </div>

      <div className="space-y-4">
        {chat.media_files && chat.media_files.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
            <button
              onClick={toggleMedia}
              className="flex items-center justify-between w-full text-blue-400 hover:text-blue-300 transition-all duration-200 group"
              aria-expanded={isMediaExpanded}
            >
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span className="font-medium">
                  Media Gallery ({chat.media_files.length})
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
              {chat.media_files.map((mediaFile, idx) => (
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
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-xl p-4 mt-4 overflow-auto max-h-64">
            {isLogsLoading ? (
              <p className="text-blue-300">Loading chat logs...</p>
            ) : (
              <pre className="text-gray-300 whitespace-pre-wrap">
                {translatedText || chatLogs}
              </pre>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleTranslate}
              disabled={isTranslating || isLogsLoading}
              className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Languages className="h-4 w-4" />
              <span className="font-medium">
                {isTranslating ? "Translating..." : "Translate"}
              </span>
            </button>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-gray-800 text-white text-sm rounded-lg p-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

const TelegramChats = ({ chats }) => {
  return (
    <div className="space-y-6">
      {chats.map((chat, index) => (
        <TelegramChat key={index} chat={chat} index={index} />
      ))}
    </div>
  );
};

export default TelegramChats;