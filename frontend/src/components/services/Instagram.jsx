import React, { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

const RenderInstagramData = ({ instagramData }) => {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showChats, setShowChats] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [textContent, setTextContent] = useState("");

  // Fetch text content from the given URL
  useEffect(() => {
    if (instagramData.login_activity_logs) {
      fetch(instagramData.login_activity_logs)
        .then((response) => response.text())
        .then((data) => setTextContent(data))
        .catch((error) => {
          console.error("Failed to fetch text content:", error);
        });
    }
  }, [instagramData.login_activity_logs]);

  const openImageViewer = (image) => setSelectedImage(image);
  const closeImageViewer = () => setSelectedImage(null);

  if (!instagramData) return null;

  return (
    <div className="mt-6 bg-gray-900 p-6 rounded-lg shadow-xl">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row md:space-x-6 items-center md:items-start">
        <img
          src={instagramData.profile?.[0]?.profilePicUrl || ""}
          alt={`${instagramData.profile?.[0]?.username || "User"}'s profile`}
          className="w-32 h-32 rounded-full border-4 border-pink-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://via.placeholder.com/128?text=Profile+Not+Available";
          }}
        />
        <div className="mt-4 md:mt-0 text-center md:text-left">
          <h3 className="text-2xl font-bold text-white">
            {instagramData.profile?.[0]?.fullName || "Unknown"}
          </h3>
          <p className="text-lg text-pink-400">
            @{instagramData.profile?.[0]?.username || "unknown"}
          </p>
          <p className="mt-2 text-gray-300">
            {instagramData.profile?.[0]?.biography || "No bio available"}
          </p>
          <div className="flex justify-center md:justify-start space-x-6 mt-4">
            <p className="text-sm text-gray-300">
              <span className="font-bold text-pink-500">
                {instagramData.profile?.[0]?.followersCount || 0}
              </span>{" "}
              followers
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-pink-500">
                {instagramData.profile?.[0]?.followsCount || 0}
              </span>{" "}
              following
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-pink-500">
                {instagramData.profile?.[0]?.postsCount || 0}
              </span>{" "}
              posts
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="mt-10">
        <h4 className="text-2xl font-bold text-pink-500 mb-6">Timeline</h4>
        <div className="space-y-6">
          {[1, 2, 3].map((timelineNum) => (
            <div
              key={timelineNum}
              className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer"
              onClick={() => openImageViewer(instagramData[`timeline_${timelineNum}`])}
            >
              <img
                src={instagramData[`timeline_${timelineNum}`] || ""}
                alt={`Timeline screenshot ${timelineNum}`}
                className="w-full rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=Timeline+Not+Available";
                }}
              />
              <p className="text-pink-400 text-sm mt-2">
                Timeline Screenshot {timelineNum}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Item Section */}
      <div className="mt-10">
        <h4 className="text-2xl font-bold text-pink-500 mb-6">Item</h4>
        <div
          className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer"
          onClick={() => openImageViewer(instagramData.item_1)}
        >
          <img
            src={instagramData.item_1 || ""}
            alt="Item 1"
            className="w-full rounded-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/400x300?text=Item+Not+Available";
            }}
          />
          <p className="text-pink-400 text-sm mt-2">Item Screenshot</p>
        </div>
      </div>

      {/* Login Activity Logs */}
      <div className="mt-10">
        <h4 className="text-2xl font-bold text-pink-500 mb-6">
          Login Activity Logs
        </h4>
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          {textContent ? (
            <pre className="text-gray-300 whitespace-pre-wrap">{textContent}</pre>
          ) : (
            <p className="text-gray-400">Loading activity logs...</p>
          )}
          <a
            href={instagramData.login_activity_logs}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 mt-2 inline-block hover:underline"
          >
            Download Full Log
          </a>
        </div>
      </div>

  {/* Posts Section */}
<div className="mt-10">
  <h4 className="text-2xl font-bold text-pink-500 mb-6">Posts</h4>
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {(instagramData.posts || []).map((post, index) => (
      <div
        key={index}
        className="bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer"
        onClick={() => openImageViewer(`https://cors-anywhere.herokuapp.com/${post.displayUrl}`)}
      >
        <img
          src={`https://cors-anywhere.herokuapp.com/${post.displayUrl}`}
          alt={`Post ${index + 1}`}
          className="w-full rounded-lg"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://via.placeholder.com/400x300?text=Post+Not+Available";
          }}
        />
        <div className="mt-2">
          <p className="text-pink-400 text-sm">
            {post.caption || "No caption available"}
          </p>
          <p className="text-gray-300 text-sm mt-1">
            <strong>Likes:</strong> {post.likesCount || 0}
          </p>
          <p className="text-gray-300 text-sm mt-1">
            <strong>Comments:</strong> {post.commentsCount || 0}
          </p>
          <p className="text-gray-300 text-sm mt-1">
            <strong>Timestamp:</strong>{" "}
            {new Date(post.timestamp).toLocaleString() || "N/A"}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>


      {/* Followers Section */}
      <div className="mt-10">
        <button
          onClick={() => setShowFollowers(!showFollowers)}
          className="flex items-center space-x-2 text-2xl font-bold text-pink-500 mb-4"
        >
          <span>Followers</span>
          <ChevronDown
            className={`w-6 h-6 transform transition-transform ${
              showFollowers ? "rotate-180" : ""
            }`}
          />
        </button>
        {showFollowers && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(instagramData.followers || []).map((follower, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-2 bg-gray-800 p-4 rounded-lg"
              >
                <img
                  src={follower.profilePicUrl || ""}
                  alt={follower.username || "Unknown"}
                  className="w-16 h-16 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/64?text=Not+Available";
                  }}
                />
                <span className="text-white text-sm text-center">
                  {follower.username || "Unknown"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Following Section */}
      <div className="mt-10">
        <button
          onClick={() => setShowFollowing(!showFollowing)}
          className="flex items-center space-x-2 text-2xl font-bold text-pink-500 mb-4"
        >
          <span>Following</span>
          <ChevronDown
            className={`w-6 h-6 transform transition-transform ${
              showFollowing ? "rotate-180" : ""
            }`}
          />
        </button>
        {showFollowing && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(instagramData.following || []).map((following, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-2 bg-gray-800 p-4 rounded-lg"
              >
                <img
                  src={following.profilePicUrl || ""}
                  alt={following.username || "Unknown"}
                  className="w-16 h-16 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/64?text=Not+Available";
                  }}
                />
                <span className="text-white text-sm text-center">
                  {following.username || "Unknown"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chats Section */}
      <div className="mt-10">
        <button
          onClick={() => setShowChats(!showChats)}
          className="flex items-center space-x-2 text-2xl font-bold text-pink-500 mb-4"
        >
          <span>Chats</span>
          <ChevronDown
            className={`w-6 h-6 transform transition-transform ${
              showChats ? "rotate-180" : ""
            }`}
          />
        </button>
        {showChats && (
          <div className="space-y-4">
            {(instagramData.chats || []).map((chat, index) => (
              <div
                key={index}
                className="bg-gray-800 p-4 rounded-lg shadow-md"
              >
                <h5 className="text-lg font-bold text-pink-400">
                  Chat with {chat.receiverUsername}
                </h5>
                <div className="mt-2">
                  <img
                    src={chat.screenshots?.[0] || ""}
                    alt={`Screenshot of chat with ${chat.receiverUsername}`}
                    className="w-full rounded-md cursor-pointer"
                    onClick={() => openImageViewer(chat.screenshots?.[0])}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/300x300?text=Screenshot+Not+Available";
                    }}
                  />
                  <p className="text-blue-400 text-sm mt-2">
                    <a
                      href={chat.chats}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Chat Log
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Viewer */}
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

export default RenderInstagramData;
