import React, { useState } from "react";
import { ChevronDown, ChevronUp, X, ExternalLink, Image as ImageIcon } from "lucide-react";

const TelegramChatsDisplay = ({ apiData }) => {
  const [selectedUsername, setSelectedUsername] = useState(null);

  const handleUserSelect = (event) => {
    const selectedUser = event.target.value;
    setSelectedUsername(selectedUser);
  };

  const selectedUserData = apiData.find(user => user.username === selectedUsername);

  return (
    <div className="space-y-8">
      {/* User Selection Dropdown */}
      <div className="mb-6">
        <label htmlFor="userDropdown" className="block text-gray-300 font-semibold mb-2">
          Select User:
        </label>
        <select
          id="userDropdown"
          value={selectedUsername || ""}
          onChange={handleUserSelect}
          className="w-full bg-gray-800 text-gray-300 border border-gray-700 rounded-lg p-2"
        >
          <option value="" disabled>Select a user</option>
          {apiData.map((user) => (
            <option key={user.username} value={user.username}>
              {user.username}
            </option>
          ))}
        </select>
      </div>

      {/* Display Selected User's Chats */}
      {selectedUserData ? (
        <div className="space-y-6">
          {selectedUserData.chats.map((chat, index) => (
            <div 
              key={index} 
              className="bg-gradient-to-br from-blue-900 to-gray-800 p-6 rounded-xl shadow-lg mt-6 border border-blue-700/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {chat.receiverUsername}
                </h3>
              </div>

              {chat.media_files && chat.media_files.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {chat.media_files.map((mediaFile, mediaIndex) => (
                    <img 
                      key={mediaIndex}
                      src={mediaFile} 
                      alt={`Media ${mediaIndex + 1}`} 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <a
                href={chat.logs}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-blue-400 hover:text-blue-300"
              >
                View Chat Logs
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">Select a user to view their chats.</p>
      )}
    </div>
  );
};

export default TelegramChatsDisplay;