import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  User,
  Rss, // Replacing Feed with Rss
  FileText,
} from "lucide-react";

const MastodonProfile = ({ userData }) => {
  const [isFeedExpanded, setIsFeedExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [logs, setLogs] = useState(null);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [isLogsVisible, setIsLogsVisible] = useState(false);

  const toggleFeed = () => setIsFeedExpanded(!isFeedExpanded);
  const openImageViewer = (image) => setSelectedImage(image);
  const closeImageViewer = () => setSelectedImage(null);

  const fetchLogs = async () => {
    if (isLogsVisible) {
      setIsLogsVisible(false);
      return;
    }
    try {
      setIsLogsLoading(true);
      const response = await fetch(userData.logs);
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }
      const text = await response.text();
      setLogs(text);
      setIsLogsVisible(true);
    } catch (error) {
      console.error(error.message);
      setLogs("Failed to load logs.");
      setIsLogsVisible(true);
    } finally {
      setIsLogsLoading(false);
    }
  };

  const feeds = [
    { url: userData.feed, label: "Main Feed" },
    { url: userData.feed_1, label: "Feed 1" },
    { url: userData.feed_2, label: "Feed 2" },
    { url: userData.feed_3, label: "Feed 3" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/40 rounded-xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500">
            <img
              src={userData.profile_pic}
              alt={userData.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{userData.username}</h2>
            <a
              href={userData.profile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-200 text-sm flex items-center space-x-1"
            >
              <User className="h-4 w-4" />
              <span>View Profile</span>
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800/30 rounded-xl p-4">
            <button
              onClick={toggleFeed}
              className="flex items-center justify-between w-full text-blue-400 hover:text-blue-300 transition-all duration-200"
              aria-expanded={isFeedExpanded}
            >
              <div className="flex items-center space-x-2">
                <Rss className="h-5 w-5" /> {/* Replaced Feed with Rss */}
                <span className="font-medium">Feeds</span>
              </div>
              {isFeedExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            <div
              className={`mt-4 space-y-3 transition-all duration-300 ease-in-out ${
                isFeedExpanded
                  ? "opacity-100 max-h-[1000px]"
                  : "opacity-0 max-h-0 overflow-hidden"
              }`}
            >
              {feeds.map((feed, idx) => (
                <a
                  key={idx}
                  href={feed.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <span className="text-white">{feed.label}</span>
                  <ExternalLink className="h-4 w-4 text-blue-400" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={fetchLogs}
              className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              <FileText className="h-5 w-5" />
              <span className="font-medium">
                {isLogsVisible ? "Hide Logs" : "View Logs"}
              </span>
            </button>
            <a
              href={userData.logs}
              className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-medium">Download Logs</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {isLogsVisible && (
            <div className="bg-gray-800/30 rounded-xl p-4 overflow-auto max-h-64">
              {isLogsLoading ? (
                <p className="text-blue-300">Loading logs...</p>
              ) : (
                <pre className="text-gray-300 whitespace-pre-wrap">{logs}</pre>
              )}
            </div>
          )}
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
              alt="Full size"
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

export default MastodonProfile;
