import React, { useState ,useEffect} from "react";

// Parent Component to Display All Users' Tweets
const XTweetsDisplay = ({ apiData }) => {
  console.log('Full API Data:', apiData); // Log entire data
  console.log('Data Type:', typeof apiData); // Check data type
  console.log('Data Length:', apiData?.length); // Check array length

  const [selectedUserId, setSelectedUserId] = useState(null);

  

  if (!apiData || apiData.length === 0) {
    return <p className="text-gray-400">No user data available.</p>;
  }

  const handleUserSelect = (event) => {
    setSelectedUserId(event.target.value);
  };

  // Log selected user finding process
  const selectedUser = selectedUserId 
    ? apiData.find((user) => {
      console.log('Checking User:', user._id, 'Against:', selectedUserId);
      return user._id === selectedUserId;
    })
    : null;

  console.log('Selected User:', selectedUser); // Log selected user

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

      {/* Display Selected User's Tweets */}
      {selectedUser ? (
        <XTweets 
          tweets={selectedUser.tweets} 
          timeline={selectedUser.timeline} 
        />
      ) : (
        <p className="text-gray-400">Select a user to view their tweets.</p>
      )}
    </div>
  );
};
// Component to Render Individual Tweets
const XTweets = ({ tweets, timeline }) => {
  if (!tweets || tweets.length === 0) {
    return <p className="text-gray-400">No tweets available for this user.</p>;
  }

  return (
    <div className="space-y-4">
      {tweets.map((tweet, index) => (
        <div key={index} className="bg-gray-700 p-4 rounded-md mt-4">
          <h3 className="text-xl font-bold mb-2">
            <a
              href={tweet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              Tweet ID: {tweet.id_str}
            </a>
          </h3>
          <p className="text-gray-300 mb-2">{tweet.full_text}</p>

          <div className="flex flex-col text-gray-400 text-sm">
            <div className="mb-2">
              <strong>Created At:</strong> {tweet.created_at}
            </div>
            <div className="mb-2">
              <strong>Language:</strong> {tweet.lang}
            </div>
            <div className="flex space-x-4 mb-2">
              <span>
                <strong>Retweets:</strong> {tweet.retweet_count}
              </span>
              <span>
                <strong>Favorites:</strong> {tweet.favorite_count}
              </span>
              <span>
                <strong>Replies:</strong> {tweet.reply_count}
              </span>
              <span>
                <strong>Quotes:</strong> {tweet.quote_count}
              </span>
            </div>
            <div className="mb-2">
              <strong>Possibly Sensitive:</strong>{" "}
              {tweet.possibly_sensitive ? "Yes" : "No"}
            </div>
            <div className="mb-2">
              <strong>Views:</strong> {tweet.views_count || "N/A"}
            </div>
            <div className="mb-4">
              <strong>User:</strong> {tweet.user.name} (@{tweet.user.screen_name})
              <br />
              <strong>Description:</strong>{" "}
              {tweet.user.description || "No description available"}
              <br />
              <strong>Followers:</strong> {tweet.user.followers_count} |{" "}
              <strong>Friends:</strong> {tweet.user.friends_count}
              <br />
              <strong>Profile Image:</strong>{" "}
              <a
                href={tweet.user.profile_image_url_https}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                View Image
              </a>
            </div>
            <div className="mb-2">
              <strong>Entities:</strong>
              <ul className="list-disc ml-5">
                <li>
                  <strong>Hashtags:</strong>{" "}
                  {tweet.entities.hashtags.length
                    ? tweet.entities.hashtags.join(", ")
                    : "None"}
                </li>
                <li>
                  <strong>URLs:</strong>{" "}
                  {tweet.entities.urls.length
                    ? tweet.entities.urls.join(", ")
                    : "None"}
                </li>
                <li>
                  <strong>User Mentions:</strong>{" "}
                  {tweet.entities.user_mentions.length
                    ? tweet.entities.user_mentions.join(", ")
                    : "None"}
                </li>
              </ul>
            </div>
          </div>

          {/* Timeline Section */}
          {timeline && (
            <div className="bg-gray-800 p-4 mt-4 rounded-md">
              <h3 className="text-lg font-bold text-blue-400 mb-2">Timeline</h3>
              <p className="text-gray-300">
                <a
                  href={timeline}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  View Timeline
                </a>
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default XTweetsDisplay;
