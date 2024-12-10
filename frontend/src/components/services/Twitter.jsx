import React, { useState } from "react";
import { ChevronDown, ChevronUp, X, ExternalLink, Image as ImageIcon } from "lucide-react";

const TwitterTweet = ({ tweet }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700/50">
      <h3 className="text-lg font-semibold text-blue-400 mb-2">
        <a
          href={tweet.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Tweet ID: {tweet.id_str}
        </a>
      </h3>
      <p className="text-gray-300 mb-4">{tweet.full_text}</p>
      <div className="text-sm text-gray-400 space-y-1">
        <div>
          <span className="font-semibold">Created At:</span> {tweet.created_at}
        </div>
        <div>
          <span className="font-semibold">Language:</span> {tweet.lang}
        </div>
        <div>
          <span className="font-semibold">Retweets:</span> {tweet.retweet_count}
          , <span className="font-semibold">Favorites:</span> {tweet.favorite_count}
          , <span className="font-semibold">Replies:</span> {tweet.reply_count}
        </div>
      </div>
    </div>
  );
};

const TwitterFollowers = ({ followers }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showModal, setShowModal] = useState(false);
  
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-md border border-gray-700/50">
        <button
          className="w-full flex justify-between items-center text-blue-400 hover:text-blue-300"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>Followers ({followers.length})</span>
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </button>
        {isExpanded && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {followers.slice(0, 20).map((follower, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 bg-gray-800 p-2 rounded-lg"
              >
                <img
                  src={follower.profilePic}
                  alt={follower.username}
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-gray-300">{follower.username}</span>
              </div>
            ))}
            {followers.length > 20 && (
              <button
                onClick={() => setShowModal(true)}
                className="text-blue-400 hover:text-blue-300 mt-2"
              >
                + {followers.length - 20} more
              </button>
            )}
          </div>
        )}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="All Followers"
        >
          {followers.map((follower, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 bg-gray-800 p-2 rounded-lg"
            >
              <img
                src={follower.profilePic}
                alt={follower.username}
                className="w-10 h-10 rounded-full"
              />
              <span className="text-gray-300">{follower.username}</span>
            </div>
          ))}
        </Modal>
      </div>
    );
  };
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-lg w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <div
          className="space-y-4 overflow-y-auto max-h-96" // Makes the list scrollable
        >
          {children}
        </div>
        </div>
      </div>
    );
  };
  const TwitterFollowing = ({ following }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showModal, setShowModal] = useState(false);
  
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-md border border-gray-700/50">
        <button
          className="w-full flex justify-between items-center text-blue-400 hover:text-blue-300"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>Following ({following.length})</span>
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </button>
        {isExpanded && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {following.slice(0, 20).map((followed, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 bg-gray-800 p-2 rounded-lg"
              >
                <img
                  src={followed.profilePic}
                  alt={followed.username}
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-gray-300">{followed.username}</span>
              </div>
            ))}
            {following.length > 20 && (
              <button
                onClick={() => setShowModal(true)}
                className="text-blue-400 hover:text-blue-300 mt-2"
              >
                + {following.length - 20} more
              </button>
            )}
          </div>
        )}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="All Following"
        >
          {following.map((followed, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 bg-gray-800 p-2 rounded-lg"
            >
              <img
                src={followed.profilePic}
                alt={followed.username}
                className="w-10 h-10 rounded-full"
              />
              <span className="text-gray-300">{followed.username}</span>
            </div>
          ))}
        </Modal>
      </div>
    );
  };
  

const TwitterTimeline = ({ timeline }) => {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700/50">
        <h3 className="text-lg font-semibold text-blue-400 mb-2">Timeline</h3>
        <a
          href={timeline}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          View Timeline
        </a>
      </div>
    );
  };

const TwitterDataDisplay = ({ data }) => {
  const { username, timeline, tweets, followers, following } = data;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-900 to-gray-800 p-6 rounded-xl shadow-lg border border-blue-700/20">
        <h2 className="text-2xl font-bold text-white mb-4">@{username}</h2>
        <TwitterTimeline timeline={timeline} />
      </div>

      <div className="space-y-6">
        {tweets.map((tweet, index) => (
          <TwitterTweet key={index} tweet={tweet} />
        ))}
      </div>

      <TwitterFollowers followers={followers} />
      <TwitterFollowing following={following} />
    </div>
  );
};

export default TwitterDataDisplay;
