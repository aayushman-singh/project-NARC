import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, FileText, X, File, Image, Video, Music, Folder } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";

const getFileIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) return <Image className="w-6 h-6" />;
  if (mimeType.startsWith('video/')) return <Video className="w-6 h-6" />;
  if (mimeType.startsWith('audio/')) return <Music className="w-6 h-6" />;
  if (mimeType === 'application/vnd.google-apps.folder') return <Folder className="w-6 h-6" />;
  return <File className="w-6 h-6" />;
};

const DriveFileCard = ({ file }) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const openViewer = () => setIsViewerOpen(true);
  const closeViewer = () => setIsViewerOpen(false);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700/40 hover:border-blue-500/50 transition-all duration-300 ease-in-out">
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          {getFileIcon(file.mimeType)}
        </div>
        <div className="flex-1 min-w-0">
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
          className="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm font-medium flex items-center space-x-1"
        >
          <FileText className="w-4 h-4" />
          <span>View Details</span>
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
          <div
            className="bg-gray-900 p-6 rounded-lg relative max-w-lg w-full text-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeViewer}
              className="absolute top-3 right-3 bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-lg"
              aria-label="Close viewer"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <h3 className="text-2xl font-bold mb-4">{file.name}</h3>
            <div className="space-y-2">
              <p className="text-sm flex items-center space-x-2">
                <span className="font-semibold text-blue-400">Type:</span>
                <span className="flex items-center space-x-1">
                  {getFileIcon(file.mimeType)}
                  <span>{file.mimeType}</span>
                </span>
              </p>
              <p className="text-sm flex items-center space-x-2">
                <span className="font-semibold text-blue-400">Size:</span>
                <span>{(file.size / 1024).toFixed(2)} KB</span>
              </p>
              <p className="text-sm flex items-center space-x-2">
                <span className="font-semibold text-blue-400">Created:</span>
                <span>{new Date(file.createdTime).toLocaleString()}</span>
              </p>
            </div>
            <div className="mt-6">
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
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-6 rounded-xl shadow-lg border border-blue-700/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Avatar>
            <img src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.email}`} alt={user.email} />
          </Avatar>
          <h3 className="text-xl font-bold text-white">{user.email}</h3>
        </div>
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
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {user.driveFiles.map((file, index) => (
              <DriveFileCard key={index} file={file} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

const GoogleDriveUsers = ({ users }) => {
  if (!users || !Array.isArray(users)) {
    return <p className="text-white">No files available</p>;
  }

  return (
    <div className="space-y-6">
      {users.map((user, index) => (
        <GoogleDriveFiles key={index} user={user} />
      ))}
    </div>
  );
};

export default GoogleDriveUsers;

