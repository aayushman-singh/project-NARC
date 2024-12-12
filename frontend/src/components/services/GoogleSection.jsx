import React, { useState } from "react";
import { X, ExternalLink } from "lucide-react";

const ChatLogsViewer = ({ logsUrl }) => {
  const [isLogsVisible, setIsLogsVisible] = useState(false);
  const [chatLogs, setChatLogs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    if (isLogsVisible) {
      setIsLogsVisible(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(logsUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch chat logs");
      }
      const logs = await response.text();
      setChatLogs(logs);
      setIsLogsVisible(true);
    } catch (error) {
      console.error(error);
      setChatLogs("Error fetching logs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 to-gray-800 p-6 rounded-lg shadow-lg mt-6 border border-blue-700/20">
      <div className="flex justify-between items-center">
        <button
          onClick={fetchLogs}
          className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
        >
          {isLogsVisible ? "Hide Logs" : "View Chat Logs"}
        </button>
        <a
          href={logsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
        >
          Open Logs <ExternalLink className="h-4 w-4 inline-block ml-1" />
        </a>
      </div>

      {isLogsVisible && (
        <div className="bg-gray-800/50 mt-4 p-4 rounded-lg max-h-64 overflow-auto">
          {isLoading ? (
            <p className="text-blue-300">Loading chat logs...</p>
          ) : (
            <pre className="text-gray-300 whitespace-pre-wrap">
              {chatLogs}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

const GoogleInfo = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-900 to-gray-800 p-6 rounded-lg shadow-lg border border-blue-700/20">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {data.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-white text-2xl font-bold">{data.email}</h3>
        </div>
        <ChatLogsViewer logsUrl={data.logs[0]} />
      </div>
    </div>
  );
};

export default GoogleInfo;
