import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const InstagramUsersViewer = ({ apiData }) => {
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

      {/* Display Selected User's Data */}
      {selectedUser ? (
        <RenderInstagramData instagramData={selectedUser} />
      ) : (
        <p className="text-gray-400">Select a user to view their Instagram data.</p>
      )}
    </div>
  );
};

const RenderInstagramData = ({ instagramData }) => {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  if (!instagramData) return null;

  return (
    <div className="mt-6 bg-gray-900 p-6 rounded-lg shadow-xl">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row md:space-x-6 items-center md:items-start">
        <img
          src={instagramData.profile[0].profilePicUrl}
          alt={`${instagramData.profile[0].username}'s profile`}
          className="w-32 h-32 rounded-full border-4 border-pink-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://via.placeholder.com/128?text=Profile+Not+Available";
          }}
        />
        <div className="mt-4 md:mt-0 text-center md:text-left">
          <h3 className="text-2xl font-bold text-white">
            {instagramData.profile[0].fullName}
          </h3>
          <p className="text-lg text-pink-400">
            @{instagramData.profile[0].username}
          </p>
          <p className="mt-2 text-gray-300">
            {instagramData.profile[0].biography}
          </p>
          <div className="flex justify-center md:justify-start space-x-6 mt-4">
            <p className="text-sm text-gray-300">
              <span className="font-bold text-pink-500">
                {instagramData.profile[0].followersCount}
              </span>{" "}
              followers
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-pink-500">
                {instagramData.profile[0].followsCount}
              </span>{" "}
              following
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-pink-500">
                {instagramData.profile[0].postsCount}
              </span>{" "}
              posts
            </p>
          </div>
        </div>
      </div>

      
      {/* Posts Section */}
      <div className="mt-10">
        <h4 className="text-2xl font-bold text-pink-500 mb-6">Posts</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {instagramData.posts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-800 p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105"
            >
              {post.type === "Video" ? (
                <video controls className="w-full h-64 object-cover rounded-md">
                  <source src={post.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={post.displayUrl}
                  alt={`Post ${post.id}`}
                  className="w-full h-64 object-cover rounded-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/300x300?text=Image+Not+Available";
                  }}
                />
              )}
              <div className="mt-4">
                <p className="text-white text-sm line-clamp-2">
                  {post.caption}
                </p>
                <div className="flex justify-between mt-2">
                  <span className="text-pink-400 text-sm">
                    {post.likesCount} likes
                  </span>
                  <span className="text-pink-400 text-sm">
                    {post.commentsCount} comments
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="mt-10">
        <h4 className="text-2xl font-bold text-pink-500 mb-6">Timeline</h4>
        <div className="space-y-6">
          {[1, 2, 3].map((timelineNum) => (
            <div
              key={timelineNum}
              className="bg-gray-800 p-4 rounded-lg shadow-md"
            >
              <img
                src={instagramData[`timeline_${timelineNum}`]}
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

      {/* Followers Section */}
      <div className="mt-10">
        <button
          onClick={() => setShowFollowers(!showFollowers)}
          className="flex items-center space-x-2 text-2xl font-bold text-pink-500 mb-4"
        >
          <span>Followers</span>
          <ChevronDown
            className={`w-6 h-6 transform transition-transform ${showFollowers ? "rotate-180" : ""}`}
          />
        </button>
        {showFollowers && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {instagramData.followers.map((follower, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-2 bg-gray-800 p-4 rounded-lg"
              >
                <img
                  src={follower.profilePicUrl}
                  alt={follower.username}
                  className="w-16 h-16 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/64?text=Not+Available";
                  }}
                />
                <span className="text-white text-sm text-center">
                  {follower.username}
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
            className={`w-6 h-6 transform transition-transform ${showFollowing ? "rotate-180" : ""}`}
          />
        </button>
        {showFollowing && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {instagramData.following.map((following, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-2 bg-gray-800 p-4 rounded-lg"
              >
                <img
                  src={following.profilePicUrl}
                  alt={following.username}
                  className="w-16 h-16 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/64?text=Not+Available";
                  }}
                />
                <span className="text-white text-sm text-center">
                  {following.username}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-10">
        <h4 className="text-2xl font-bold text-pink-500 mb-6">Chats</h4>
        <div className="space-y-6">
          {instagramData?.chats?.length > 0 ? (
            instagramData.chats.map((chat, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md">
                <p className="text-white text-sm">
                  <span className="font-bold">Receiver: </span>
                  {chat.receiverUsername}
                </p>
                <div className="mt-2">
                  <span className="text-pink-400 text-sm">Chat URL: </span>
                  <a
                    href={chat.chats}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    Open Chat
                  </a>
                </div>
                {chat.screenshots?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-pink-400 text-sm mb-2">Screenshots:</p>
                    <div className="grid grid-cols-2 gap-4">
                      {chat.screenshots.map((screenshot, i) => (
                        <div key={i} className="space-y-2">
                          <a
                            href={screenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                          >
                            <img
                              src={screenshot}
                              alt={`Screenshot ${i + 1}`}
                              className="rounded-lg shadow-md w-full h-auto"
                            />
                          </a>
                          <p className="text-white text-xs break-words">
                            <span className="font-bold">Link: </span>
                            <a
                              href={screenshot}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 underline"
                            >
                              {screenshot}
                            </a>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400">No chats available.</p>
          )}
        </div>
      </div>  

    </div>
  );
};

export default InstagramUsersViewer;
