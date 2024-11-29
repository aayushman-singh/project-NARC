import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  X,
  Image as ImageIcon,
  MessageCircle,
} from "lucide-react";

// Parent Component to Display All Users
const FacebookDataViewer = ({ apiData }) => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  if (!apiData || apiData.length === 0) {
    return <p className="text-gray-400">No user data available.</p>;
  }

  const handleUserSelect = (event) => {
    setSelectedUserId(event.target.value);
  };

  const selectedUser =
    selectedUserId && apiData.find((user) => user._id === selectedUserId);

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

      {/* Display Selected User Data */}
      {selectedUser ? (
        <FacebookData facebookData={selectedUser} />
      ) : (
        <p className="text-gray-400">Select a user to view their details.</p>
      )}
    </div>
  );
};

// Individual Facebook Data Component
const FacebookData = ({ facebookData }) => {
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [isPostsExpanded, setIsPostsExpanded] = useState(false);
  const [isMessagesExpanded, setIsMessagesExpanded] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  if (!facebookData) return <p className="text-gray-400">No data available.</p>;

  // Extracting data from the provided structure
  const timelines = [
    facebookData.timeline_1,
    facebookData.timeline_2,
    facebookData.timeline_3,
  ].filter(Boolean);

  const friendsList = facebookData.friends_list || [];
  const posts = facebookData.posts || [];
  const messages = Object.keys(facebookData)
    .filter((key) => key.startsWith("messages_"))
    .map((key) => facebookData[key]);

  const toggleTimeline = () => setIsTimelineExpanded(!isTimelineExpanded);
  const togglePosts = () => setIsPostsExpanded(!isPostsExpanded);
  const toggleMessages = () => setIsMessagesExpanded(!isMessagesExpanded);
  const openTimelineViewer = (timeline) => setSelectedTimeline(timeline);
  const openPostViewer = (post) => setSelectedPost(post);
  const openMessageViewer = (message) => setSelectedMessage(message);
  const closeTimelineViewer = () => setSelectedTimeline(null);
  const closePostViewer = () => setSelectedPost(null);
  const closeMessageViewer = () => setSelectedMessage(null);

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
          data={posts.map((post) => post.s3Url)}
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
// Remaining Components: ExpandableSection and ImageViewer remain the same

export default FacebookDataViewer;
