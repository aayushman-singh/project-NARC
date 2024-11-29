import React, { useState } from "react";
import { ChevronDown, ChevronUp, X, Image as ImageIcon, ExternalLink } from "lucide-react";

// Parent Component to Display All Users
const WhatsAppChatsViewer = ({ apiData }) => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  if (!apiData || apiData.length === 0) {
    return <p className="text-gray-400">No user data available.</p>;
  }

  const handleUserSelect = (event) => {
    setSelectedUserId(event.target.value);
  };

  const selectedUser = selectedUserId && apiData.find((user) => user._id === selectedUserId);

  return (
    <div className="space-y-8">
      {/* Dropdown for User Selection */}
      <div className="mb-6">
        <label htmlFor="userDropdown" className="block text-gray-300 font-semibold mb-2">
          Select User:
        </label>
        <select
          id="userDropdown"
          value={selectedUserId || ""}
          onChange={handleUserSelect}
          className="w-full bg-gray-800 text-gray-300 border border-gray-700 rounded-lg p-2"
        >
          <option value="" disabled>
            Select a user
          </option>
          {apiData.map((user) => (
            <option key={user._id} value={user._id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>

      {/* Display Selected User's Chats */}
      {selectedUser ? (
        <WhatsAppChats chats={selectedUser.chats} />
      ) : (
        <p className="text-gray-400">Select a user to view their chats.</p>
      )}
    </div>
  );
};

// Individual WhatsApp Chat Component
const WhatsAppChat = ({ chat }) => {
  const [isMediaExpanded, setIsMediaExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const toggleMedia = () => setIsMediaExpanded(!isMediaExpanded);
  const openImageViewer = (image) => setSelectedImage(image);
  const closeImageViewer = () => setSelectedImage(null);

  return (
    <div className="bg-gradient-to-br from-green-900 to-gray-800 p-6 rounded-xl shadow-lg mt-6 border border-green-700/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {chat.receiverUsername.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">{chat.receiverUsername}</h3>
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
                <span className="font-medium">Media Gallery ({chat.screenshots.length})</span>
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
                    <span className="text-white text-sm font-medium">View Full</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <a
            href={chat.chats}
            className="inline-flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors duration-200 group"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="font-medium">View Chat History</span>
            <ExternalLink className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>
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

// Parent WhatsAppChats Component
const WhatsAppChats = ({ chats }) => {
  return (
    <div className="space-y-6">
      {chats.map((chat, index) => (
        <div key={index}>
          <WhatsAppChat chat={chat} />
        </div>
      ))}
    </div>
  );
};

export default WhatsAppChatsViewer;
