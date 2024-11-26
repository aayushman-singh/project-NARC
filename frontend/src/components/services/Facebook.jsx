import React, { useState } from "react";
import { ChevronDown, ChevronUp, X, Image as ImageIcon, Calendar } from "lucide-react";

const FacebookData = ({ facebookData }) => {
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [isPostsExpanded, setIsPostsExpanded] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  if (!facebookData) return <p className="text-gray-400">No data available.</p>;

  // Extracting data from the provided structure
  const timelines = [
    facebookData.timeline_1,
    facebookData.timeline_2,
    facebookData.timeline_3,
  ].filter(Boolean);

  const friendsList = facebookData.friends_list || [];
  const posts = facebookData.posts || [];

  const toggleTimeline = () => setIsTimelineExpanded(!isTimelineExpanded);
  const togglePosts = () => setIsPostsExpanded(!isPostsExpanded);
  const openTimelineViewer = (timeline) => setSelectedTimeline(timeline);
  const openPostViewer = (post) => setSelectedPost(post);
  const closeTimelineViewer = () => setSelectedTimeline(null);
  const closePostViewer = () => setSelectedPost(null);

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
        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm mb-6">
          <button
            onClick={toggleTimeline}
            className="flex items-center justify-between w-full text-blue-400 hover:text-blue-300 transition-all duration-200 group"
            aria-expanded={isTimelineExpanded}
          >
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span className="font-medium">Timelines ({timelines.length})</span>
            </div>
            {isTimelineExpanded ? <ChevronUp /> : <ChevronDown />}
          </button>

          <div
            className={`grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 transition-all duration-300 ease-in-out ${
              isTimelineExpanded
                ? "opacity-100 max-h-[1000px]"
                : "opacity-0 max-h-0 overflow-hidden"
            }`}
          >
            {timelines.map((timeline, index) => (
              <div
                key={index}
                className="relative group bg-gray-700/50 rounded-lg cursor-pointer overflow-hidden aspect-video"
                onClick={() => openTimelineViewer(timeline)}
              >
                <img
                  src={timeline}
                  alt={`Timeline ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    View Full
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Viewer */}
      {selectedTimeline && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={closeTimelineViewer}
        >
          <div className="relative max-w-5xl w-full">
            <img
              src={selectedTimeline}
              alt="Full size timeline"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={closeTimelineViewer}
              className="absolute -top-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-lg"
              aria-label="Close timeline viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm mt-6">
          <button
            onClick={togglePosts}
            className="flex items-center justify-between w-full text-green-400 hover:text-green-300 transition-all duration-200 group"
            aria-expanded={isPostsExpanded}
          >
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span className="font-medium">Posts ({posts.length})</span>
            </div>
            {isPostsExpanded ? <ChevronUp /> : <ChevronDown />}
          </button>

          <div
            className={`grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 transition-all duration-300 ease-in-out ${
              isPostsExpanded
                ? "opacity-100 max-h-[1000px]"
                : "opacity-0 max-h-0 overflow-hidden"
            }`}
          >
            {posts.map((post, index) => (
              <div
                key={index}
                className="relative group bg-gray-700/50 rounded-lg cursor-pointer overflow-hidden aspect-video"
                onClick={() => openPostViewer(post)}
              >
                <img
                  src={post.s3Url}
                  alt={`Post ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    View Full
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Viewer */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={closePostViewer}
        >
          <div className="relative max-w-5xl w-full">
            <img
              src={selectedPost.s3Url}
              alt="Full size post"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={closePostViewer}
              className="absolute -top-2 -right-2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors duration-200 shadow-lg"
              aria-label="Close post viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
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

export default FacebookData;
