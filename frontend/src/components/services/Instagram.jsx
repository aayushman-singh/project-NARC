import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const RenderInstagramData = ({ instagramData }) => {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

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

      {/* Posts Section */}
      <div className="mt-10">
        <h4 className="text-2xl font-bold text-pink-500 mb-6">Posts</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(instagramData.posts || []).map((post) => (
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
                  src={post.url}
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
                  {post.caption || "No caption available"}
                </p>
                <div className="flex justify-between mt-2">
                  <span className="text-pink-400 text-sm">
                    {post.likesCount || 0} likes
                  </span>
                  <span className="text-pink-400 text-sm">
                    {post.commentsCount || 0} comments
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
    </div>
  );
};

export default RenderInstagramData;
