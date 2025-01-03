import React, { useState } from "react";
import { ChevronDown, ChevronUp, X, MessageCircle } from "lucide-react";

const FacebookData = ({ facebookData }) => {
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [isPostsExpanded, setIsPostsExpanded] = useState(false);
  const [isMessagesExpanded, setIsMessagesExpanded] = useState(false);
  const [isChatsExpanded, setIsChatsExpanded] = useState(false);
  const [isScreenshotsExpanded, setIsScreenshotsExpanded] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  if (!facebookData) return <p className="text-gray-400">No data available.</p>;

  // Extracting data from the provided structure
  const timelines = [
    facebookData.timeline_1,
    facebookData.timeline_2,
    facebookData.timeline_3,
  ].filter(Boolean);

  const friendsList = facebookData.friends_list || [];
  const posts = [facebookData.post_1, facebookData.post_2, facebookData.post_3, facebookData.post_4, facebookData.post_5].filter(Boolean);
  const messages = Object.keys(facebookData)
    .filter((key) => key.startsWith("messages_"))
    .map((key) => facebookData[key]);
  
  const chats = facebookData.chats || [];
  const screenshots = facebookData.screenshots || [];

  const toggleTimeline = () => setIsTimelineExpanded(!isTimelineExpanded);
  const togglePosts = () => setIsPostsExpanded(!isPostsExpanded);
  const toggleMessages = () => setIsMessagesExpanded(!isMessagesExpanded);
  const toggleChats = () => setIsChatsExpanded(!isChatsExpanded);
  const toggleScreenshots = () => setIsScreenshotsExpanded(!isScreenshotsExpanded);

  const openTimelineViewer = (timeline) => setSelectedTimeline(timeline);
  const openPostViewer = (post) => setSelectedPost(post);
  const openMessageViewer = (message) => setSelectedMessage(message);
  const openChatViewer = (chat) => setSelectedChat(chat);
  const openScreenshotViewer = (screenshot) => setSelectedScreenshot(screenshot);

  const closeTimelineViewer = () => setSelectedTimeline(null);
  const closePostViewer = () => setSelectedPost(null);
  const closeMessageViewer = () => setSelectedMessage(null);
  const closeChatViewer = () => setSelectedChat(null);
  const closeScreenshotViewer = () => setSelectedScreenshot(null);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg mt-6 border border-gray-700/20">
      <h3 className="text-2xl font-bold text-blue-400 mb-4">Facebook Details</h3>

      {/* Username */}
      <div className="text-lg font-semibold text-gray-300 mb-4">
        Username: <span className="text-blue-300">{facebookData.username}</span>
      </div>

      {/* Profile Picture */}
      {facebookData.profile && (
        <div className="mb-6">
          <img
            src={facebookData.profile}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
        </div>
      )}

      {/* Timelines */}
      {timelines.length > 0 && (
        <ExpandableSection
          title="Timelines"
          data={timelines}
          isExpanded={isTimelineExpanded}
          toggleExpand={toggleTimeline}
          onItemClick={openTimelineViewer}
        />
      )}

      {/* Timeline Viewer */}
      {selectedTimeline && (
        <ImageViewer image={selectedTimeline} onClose={closeTimelineViewer} />
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <ExpandableSection
          title="Posts"
          data={posts.map((post) => post.png)}
          isExpanded={isPostsExpanded}
          toggleExpand={togglePosts}
          onItemClick={openPostViewer}
        />
      )}

      {/* Post Viewer */}
      {selectedPost && (
        <ImageViewer image={selectedPost} onClose={closePostViewer} />
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <ExpandableSection
          title="Messages"
          data={messages}
          isExpanded={isMessagesExpanded}
          toggleExpand={toggleMessages}
          onItemClick={openMessageViewer}
        />
      )}

      {/* Message Viewer */}
      {selectedMessage && (
        <ImageViewer image={selectedMessage} onClose={closeMessageViewer} />
      )}

      {/* Chats */}
      {chats.length > 0 && (
        <ExpandableSection
          title="Chats"
          data={chats}
          isExpanded={isChatsExpanded}
          toggleExpand={toggleChats}
          onItemClick={openChatViewer}
        />
      )}

      {/* Chat Viewer */}
      {selectedChat && (
        <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
          <h4 className="text-xl font-bold text-blue-300 mb-4">Chat with {selectedChat.receiverUsername}</h4>
          
          {/* Display Screenshots */}
          {selectedChat.screenshots && selectedChat.screenshots.length > 0 && (
            <div className="mb-4">
              <h5 className="text-lg font-semibold text-blue-400">Screenshots:</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {selectedChat.screenshots.map((screenshot, index) => (
                  <div key={index} className="relative group bg-gray-700/50 rounded-lg cursor-pointer overflow-hidden aspect-video">
                    <img
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">View Full</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display chat messages */}
          {selectedChat.chats && selectedChat.chats.length > 0 && (
            <div className="mb-4">
              <h5 className="text-lg font-semibold text-blue-400">Chat Messages:</h5>
              <ul className="space-y-2">
                {selectedChat.chats.map((chatMessage, index) => (
                  <li key={index} className="text-gray-300">{chatMessage}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={closeChatViewer}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-lg"
          >
            Close
          </button>
        </div>
      )}

      {/* Screenshots */}
      {screenshots.length > 0 && (
        <ExpandableSection
          title="Screenshots"
          data={screenshots}
          isExpanded={isScreenshotsExpanded}
          toggleExpand={toggleScreenshots}
          onItemClick={openScreenshotViewer}
        />
      )}

      {/* Screenshot Viewer */}
      {selectedScreenshot && (
        <ImageViewer image={selectedScreenshot} onClose={closeScreenshotViewer} />
      )}

      {/* Friends List */}
      {friendsList.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-bold text-pink-500 mb-2">Friends:</h4>
          <ul className="space-y-4">
            {friendsList.map((friend, index) => (
              <li key={index} className="flex items-center space-x-4">
                <img
                  src={friend.profilePicUrl}
                  alt={friend.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-blue-300 font-semibold">{friend.userName}</p>
                  <a
                    href={friend.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    View Profile
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ExpandableSection = ({ title, data, isExpanded, toggleExpand, onItemClick }) => (
  <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm mb-6">
    <button
      onClick={toggleExpand}
      className="flex items-center justify-between w-full text-blue-400 hover:text-blue-300 transition-all duration-200 group"
      aria-expanded={isExpanded}
    >
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5" />
        <span className="font-medium">{`${title} (${data.length})`}</span>
      </div>
      {isExpanded ? <ChevronUp /> : <ChevronDown />}
    </button>

    <div
      className={`grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 transition-all duration-300 ease-in-out ${
        isExpanded ? "opacity-100 max-h-[1000px]" : "opacity-0 max-h-0 overflow-hidden"
      }`}
    >
      {data.map((item, index) => (
        <div
          key={index}
          className="relative group bg-gray-700/50 rounded-lg cursor-pointer overflow-hidden aspect-video"
          onClick={() => onItemClick(item)}
        >
          <img
            src={item}
            alt={`${title} ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <span className="text-white text-sm font-medium">View Full</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ImageViewer = ({ image, onClose }) => (
  <div
    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <div className="relative max-w-5xl w-full">
      <img
        src={image}
        alt="Full size view"
        className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
      />
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-lg"
        aria-label="Close viewer"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  </div>
);

export default FacebookData;
