import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  X
} from "lucide-react";

const DriveFileCard = ({ file }) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const openViewer = () => setIsViewerOpen(true);
  const closeViewer = () => setIsViewerOpen(false);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700/40">
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-700">
          <FileText className="text-white w-6 h-6" />
        </div>
        <div>
          <h4 className="text-white text-lg font-semibold truncate">
            {file.name}
          </h4>
          <p className="text-blue-400 text-sm">
            {new Date(file.createdTime).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={openViewer}
          className="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm font-medium"
        >
          View Details
        </button>
        <a
          href={file.webViewLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors duration-200 text-sm font-medium"
        >
          <span>Open File</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {isViewerOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={closeViewer}
        >
          <div className="bg-gray-900 p-6 rounded-lg relative max-w-lg w-full text-white shadow-xl">
            <button
              onClick={closeViewer}
              className="absolute top-3 right-3 bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-lg"
              aria-label="Close viewer"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <h3 className="text-2xl font-bold mb-4">{file.name}</h3>
            <p className="text-sm">
              <strong>MIME Type:</strong> {file.mimeType}
            </p>
            <p className="text-sm">
              <strong>Size:</strong> {file.size} bytes
            </p>
            <p className="text-sm">
              <strong>Created:</strong>{" "}
              {new Date(file.createdTime).toLocaleString()}
            </p>
            <div className="mt-4">
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <span>Open File</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GoogleDriveFiles = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleFiles = () => setIsExpanded(!isExpanded);

  return (
    <div className="bg-gradient-to-br from-blue-900 to-gray-800 p-6 rounded-xl shadow-lg border border-blue-700/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">{user.email}</h3>
        <button
          onClick={toggleFiles}
          className="text-blue-400 hover:text-blue-300 flex items-center space-x-2 transition-colors duration-200"
        >
          <span>{isExpanded ? "Hide Files" : "Show Files"}</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {user.driveFiles.map((file, index) => (
            <DriveFileCard key={index} file={file} />
          ))}
        </div>
      )}
    </div>
  );
};

const GoogleDriveUsers = ({ users }) => {
  if (!users || !Array.isArray(users)) {
    return <p className="text-white">No files available</p>;
  }

  return (
    <div className="space-y-4">
      {users.map((user, index) => (
        <GoogleDriveFiles key={index} user={user} />
      ))}
    </div>
  );
};

export default GoogleDriveUsers;