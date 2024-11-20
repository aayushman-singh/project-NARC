import React, { useState, useEffect } from 'react';
import { InstagramLogo, WhatsappLogo, FacebookLogo, TelegramLogo, TwitterLogo,  FileCsv, FilePdf, CloudArrowUp, Coins, X } from 'phosphor-react';
import {  ChevronDown } from 'lucide-react'
import './style.css';



const Services = () => {
  const [activeSection, setActiveSection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [instagramData, setInstagramData] = useState(null);
  const [telegramData, setTelegramData] = useState(null);
  const [telegramChats, setTelegramChats] = useState([]);
  
  const [alert, setAlert] = useState({ visible: false, message: '', type: 'info' });
  const [whatsappData, setWhatsappData] = useState(null);
  const [xData, setXData] = useState(null); 
  const [facebookData, setFacebookData] = useState(null); 
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const handleSectionClick = (section) => {
    setActiveSection((prev) => (prev === section ? '' : section));
  };

 const showAlert = (message, type = 'info') => {
    setAlert({ visible: true, message, type });
    setTimeout(() => setAlert({ visible: false, message: '', type: 'info' }), 3000);
  };
  const handleShowDetails = async (platform, requiresPassword = false) => {
    const platformConfig = {
      whatsapp: 3004,
      facebook: 3002,
      x: 3003,
      telegram: 3005,
      instagram: 3001, 
    };
  
    const port = platformConfig[platform];
    if (!port) {
      console.error('Unknown platform or port not configured');
      return;
    }
  
    const username = document.getElementById(`${platform}Input`).value;
    const password = requiresPassword ? document.getElementById(`${platform}Password`).value : null;
  
    setIsLoading(true);
  
    try {
     
      const queryParams = requiresPassword && password 
        ? `?password=${encodeURIComponent(password)}` 
        : '';
        
      const response = await fetch(
        `http://localhost:${port}/${platform}/users/${username}${queryParams}`
      );
  
      if (!response.ok) {
        throw new Error('User not found');
      }
  
      const data = await response.json();
  
      // Dynamically set the state based on the platform
      switch (platform) {
        case 'whatsapp':
          setWhatsappData(data);
          break;
        case 'facebook':
          setFacebookData(data);
          break;
        case 'x':
          setXData(data);
          break;
        case 'telegram':
          setTelegramData(data);
          break;
        case 'instagram':
          setInstagramData(data);
          break;
        default:
          console.error('Unknown platform');
      }
  
      setShowDetails(true);
      showAlert('Data fetched successfully', 'success');
    } catch (error) {
      showAlert('Failed to fetch data. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  
 
  
  const renderFacebookData = (facebookData) => {
    if (!facebookData) return <p className="text-gray-400">No data available.</p>;
  
    return (
      <div>
        <h3 className="text-xl font-bold text-blue-400 mb-4">Facebook Details</h3>
  
        {/* Username Display */}
        <div className="text-lg font-semibold text-gray-300 mb-4">
          Username: <span className="text-blue-300">{facebookData.username}</span>
        </div>
  
        {/* Timelines */}
        <div className="mt-6">
          <h4 className="text-lg font-bold text-blue-300 mb-2">Timelines:</h4>
          {facebookData.timelines && facebookData.timelines.length > 0 ? (
            facebookData.timelines.map((timeline, index) => (
              <div key={index} className="mt-2">
                <a
                  href={timeline}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  Timeline {index + 1}
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No timelines available.</p>
          )}
        </div>
  
        {/* Posts */}
        <div className="mt-6">
          <h4 className="text-lg font-bold text-blue-300 mb-2">Posts:</h4>
          {facebookData.posts && facebookData.posts.length > 0 ? (
            facebookData.posts.map((post, index) => (
              <div key={index} className="mt-2">
                <a
                  href={post}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  Post {index + 1}
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No posts available.</p>
          )}
        </div>
  
        {/* Messages */}
        <div className="mt-10">
  <h4 className="text-2xl font-bold text-pink-500 mb-6">Messages</h4>
  <div className="space-y-6">
    {Array.isArray(instagramData.messages) && instagramData.messages.length > 0 ? (
      instagramData.messages.map((message, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md">
          {/* Display receiver username */}
          <p className="text-white text-sm font-semibold">Receiver: {message.receiverUsername}</p>

          {/* Display screenshots */}
          <div className="mt-4">
            <p className="text-gray-400 text-sm">Screenshots:</p>
            {Array.isArray(message.screenshots) ? (
              message.screenshots.map((screenshot, i) => (
                <a
                  key={i}
                  href={screenshot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline text-sm"
                >
                  Screenshot {i + 1}
                </a>
              ))
            ) : (
              <p className="text-gray-500 text-xs">No screenshots available</p>
            )}
          </div>

          {/* Display chat link */}
          <div className="mt-4">
            <p className="text-gray-400 text-sm">Chat:</p>
            {message.chats ? (
              <a
                href={message.chats}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline text-sm"
              >
                View Chat
              </a>
            ) : (
              <p className="text-gray-500 text-xs">No chat available</p>
            )}
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-400">No messages available.</p>
    )}
  </div>
</div>

      </div>
    );
  };
  const renderInstagramData = () => {
    if (!instagramData) return null

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
              e.target.src = 'https://via.placeholder.com/128?text=Profile+Not+Available';
            }}
          />
          <div className="mt-4 md:mt-0 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white">{instagramData.profile[0].fullName}</h3>
            <p className="text-lg text-pink-400">@{instagramData.profile[0].username}</p>
            <p className="mt-2 text-gray-300">{instagramData.profile[0].biography}</p>
            <div className="flex justify-center md:justify-start space-x-6 mt-4">
              <p className="text-sm text-gray-300"><span className="font-bold text-pink-500">{instagramData.profile[0].followersCount}</span> followers</p>
              <p className="text-sm text-gray-300"><span className="font-bold text-pink-500">{instagramData.profile[0].followsCount}</span> following</p>
              <p className="text-sm text-gray-300"><span className="font-bold text-pink-500">{instagramData.profile[0].postsCount}</span> posts</p>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mt-10">
          <h4 className="text-2xl font-bold text-pink-500 mb-6">Posts</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {instagramData.posts.map((post) => (
              <div key={post.id} className="bg-gray-800 p-4 rounded-lg shadow-md transform transition duration-300 hover:scale-105">
                {post.type === 'Video' ? (
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
                      e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Available';
                    }}
                  />
                )}
                <div className="mt-4">
                  <p className="text-white text-sm line-clamp-2">{post.caption}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-pink-400 text-sm">{post.likesCount} likes</span>
                    <span className="text-pink-400 text-sm">{post.commentsCount} comments</span>
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
              <div key={timelineNum} className="bg-gray-800 p-4 rounded-lg shadow-md">
                <img 
                  src={instagramData[`timeline_${timelineNum}`]} 
                  alt={`Timeline screenshot ${timelineNum}`}
                  className="w-full rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300?text=Timeline+Not+Available';
                  }}
                />
                <p className="text-pink-400 text-sm mt-2">Timeline Screenshot {timelineNum}</p>
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
            <ChevronDown className={`w-6 h-6 transform transition-transform ${showFollowers ? 'rotate-180' : ''}`} />
          </button>
          {showFollowers && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {instagramData.followers.map((follower, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 bg-gray-800 p-4 rounded-lg">
                  <img 
                    src={follower.profilePicUrl} 
                    alt={follower.username} 
                    className="w-16 h-16 rounded-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/64?text=Not+Available';
                    }}
                  />
                  <span className="text-white text-sm text-center">{follower.username}</span>
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
            <ChevronDown className={`w-6 h-6 transform transition-transform ${showFollowing ? 'rotate-180' : ''}`} />
          </button>
          {showFollowing && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {instagramData.following.map((following, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 bg-gray-800 p-4 rounded-lg">
                  <img 
                    src={following.profilePicUrl} 
                    alt={following.username} 
                    className="w-16 h-16 rounded-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/64?text=Not+Available';
                    }}
                  />
                  <span className="text-white text-sm text-center">{following.username}</span>
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
    )
  }
  
  const renderWhatsappChats = (chats) => {
    return chats.map((chat, index) => (
      <div key={index} className="bg-gray-700 p-4 rounded-md mt-4">
        <h3 className="text-xl font-bold mb-2">{chat.receiverUsername}</h3>
        <div className="space-y-2">
          <div>
            {chat.screenshots.map((screenshot, idx) => (
              <img key={idx} src={screenshot} alt={`Screenshot ${idx + 1}`} className="w-full rounded-md mb-2" />
            ))}
          </div>
          <a href={chat.chats} className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">
            View Chat Log
          </a>
        </div>
      </div>
    ));
  };
  const renderTelegramChats = (chats) => {
    return chats.map((chat, index) => (
      <div key={index} className="bg-gray-700 p-4 rounded-md mt-4">
        <h3 className="text-xl font-bold mb-2">{chat.receiverUsername}</h3>
        <div className="space-y-2">
          <div>
            {/* Media Section Dropdown */}
            {chat.media_files && chat.media_files.length > 0 && (
              <div>
                <button
                  className="flex items-center text-blue-500 hover:text-blue-700 mb-2"
                  onClick={() => {
                    // Toggle media visibility
                    const mediaSection = document.getElementById(`media-section-${index}`);
                    mediaSection.classList.toggle('hidden');
                  }}
                >
                  {/* Chevron Icon and "Media" Text */}
                  <span className="mr-2 text-lg font-semibold">Media</span>
                  <ChevronDown className="h-5 w-5" />
                </button>
  
                {/* Media Files Section */}
                <div id={`media-section-${index}`} className="hidden space-y-2">
                  {chat.media_files.map((mediaFile, idx) => (
                    <img
                      key={idx}
                      src={mediaFile}
                      alt={`Media File ${idx + 1}`}
                      className="w-full rounded-md mb-2"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <a
            href={chat.logs}
            className="text-blue-400 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Chat Log
          </a>
        </div>
      </div>
    ));
  };
  
  const renderXTweets = (tweets) => {
    return tweets.map((tweet, index) => (
      <div key={index} className="bg-gray-700 p-4 rounded-md mt-4">
        <h3 className="text-xl font-bold mb-2">
          <a href={tweet.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
            {tweet.id_str}
          </a>
        </h3>
        <p className="text-gray-300">{tweet.full_text}</p>
        <div className="flex space-x-4 mt-2 text-gray-400 text-sm">
          <span>Created at: {tweet.created_at}</span>
          <span>Lang: {tweet.lang}</span>
          <span>Retweets: {tweet.retweet_count}</span>
          <span>Favorites: {tweet.favorite_count}</span>
          <span>Replies: {tweet.reply_count}</span>
          <span>Quotes: {tweet.quote_count}</span>
        </div>
      </div>
    ));
  };
  
  const handleSubmit = async (platform) => {
    const tagInputElement = document.getElementById(`${platform}Input`);
    const passwordInputElement = document.getElementById(`${platform}Password`);
    let pin, pinElement;
    const dropdownElement = document.getElementById(`${[platform]}Dropdown`);

    if (platform === 'facebook') { 
      pinElement = document.getElementById(`${platform}Pin`);
      if (!pinElement) {
        console.error(`${platform}Pin element not found`);
        alert('Please enter the PIN for Facebook');
        return;
      }
      pin = pinElement.value;
    }
  
    if (!tagInputElement) {
      console.error(`${platform}Input element not found`);
      showAlert('Please enter tags');
      return;
    }
  
    if ((platform !== 'whatsapp' && platform !== 'telegram') && (!passwordInputElement || !passwordInputElement.value.trim())) {
      console.error(`${platform}Password element not found`);
      showAlert('Please enter the password');
      return;
    }
  
    const baseUrl = 'http://localhost'; 
    const tagInputValue = tagInputElement.value;
    const tagsArray = tagInputValue
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .map(tag => (platform === 'telegram' ? `+91${tag}` : tag));
    const limit = parseInt(dropdownElement.value, 10);
    const password = (platform !== 'whatsapp' && platform !== 'telegram') ? passwordInputElement.value.trim() : undefined;
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userId = userInfo ? userInfo._id : null; 

    const payload = { userId: userId,startUrls: tagsArray, limit: limit };
    if (platform === 'facebook') {
      payload.password = password;
      payload.pin = pin ? pin.trim() : undefined;
    } else if (platform !== 'whatsapp' || platform !== 'telegram') {
      payload.password = password;
    }
  
    let apiEndpoint;
    const platformPorts = {
      instagram: 3001,
      facebook: 3002,
      x: 3003,
      whatsapp: 3004,
      telegram: 3005
    };
    
    const port = platformPorts[platform];
    if (!port) {
      console.error('Unsupported platform:', platform);
      showAlert('Unsupported platform. Please choose Instagram, Facebook, X, Whatsapp, or Telegram');
      return;
    }
    
    apiEndpoint = `${baseUrl}:${port}/${platform}`;
    setIsLoading(true);
  
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log(`Payload being sent to platform ${platform}:`, payload);
     
      showAlert('Account Scraped Successfully');

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error(`Error details:`, errorDetails);
        throw new Error(`Request failed for ${platform}: ${response.statusText}`);
      }
      
  
      tagInputElement.value = '';
      if (passwordInputElement) passwordInputElement.value = '';
      if (pinElement) pinElement.value = ''; 

    } catch (error) {
      console.error(`Error submitting tags for ${platform}:`, error);
      showAlert('Failed to submit tags. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



    
  
  const DetailSection = ({ title, content }) => (
    <div className="bg-gray-700 p-4 rounded-md mt-4">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      {content}
    </div>
  );

  const renderDropdown = (platform) => (
    <select
      id={`${platform}Dropdown`}
      className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <option value="1">1</option>
      <option value="3">3</option>
      <option value="5">5</option>
      <option value="10">10</option>
      <option value="20">20</option>
      <option value="50">50</option>
      <option value="100">100</option>
      <option value="200">200</option>
    </select>
  );
    
  

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 relative">
     {alert.visible && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform ${
            alert.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          } ${
            alert.type === 'success'
              ? 'bg-green-50 text-green-800 border-l-4 border-green-500'
              : alert.type === 'error'
              ? 'bg-red-50 text-red-800 border-l-4 border-red-500'
              : 'bg-blue-50 text-blue-800 border-l-4 border-blue-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {alert.type === 'success' && (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {alert.type === 'error' && (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {alert.type === 'info' && (
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="ml-3 text-sm font-medium">{alert.message}</p>
            </div>
            <button
              onClick={() => setAlert({ ...alert, visible: false })}
              className="ml-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex h-8 w-8 items-center justify-center"
            >
              <span className="sr-only">Close</span>
              <X size={18} />
            </button>
          </div>
        </div>
      )}
     
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold">Processing your request...</p>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-8 text-center">Social Media Investigation Tool</h1>

      <div className="flex justify-center space-x-8 mb-8">
        <button onClick={() => handleSectionClick('instagram')} className="flex items-center space-x-2">
          <InstagramLogo size={32} color={activeSection === 'instagram' ? '#E1306C' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'instagram' ? 'text-pink-500' : 'text-gray-400'}`}>Instagram</span>
        </button>

        <button onClick={() => handleSectionClick('facebook')} className="flex items-center space-x-2">
          <FacebookLogo size={32} color={activeSection === 'facebook' ? '#3b5998' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'facebook' ? 'text-blue-600' : 'text-gray-400'}`}>Facebook</span>
        </button>

        <button onClick={() => handleSectionClick('x')} className="flex items-center space-x-2">
          <TwitterLogo size={32} color={activeSection === 'x' ? '#1DA1F2' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'x' ? 'text-blue-500' : 'text-gray-400'}`}>X</span>
        </button>

        <button onClick={() => handleSectionClick('telegram')} className="flex items-center space-x-2">
          <TelegramLogo size={32} color={activeSection === 'telegram' ? '#0088cc' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'telegram' ? 'text-blue-400' : 'text-gray-400'}`}>Telegram</span>
        </button>

        <button onClick={() => handleSectionClick('whatsapp')} className="flex items-center space-x-2">
          <WhatsappLogo size={32} color={activeSection === 'whatsapp' ? '#25D366' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'whatsapp' ? 'text-green-500' : 'text-gray-400'}`}>WhatsApp</span>
        </button>
      </div>

      {activeSection === 'instagram' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-pink-500">Instagram</h2>
          <input
            type="text"
            id="instagramInput"
            placeholder="Enter Instagram username"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="password"
            id="instagramPassword"
            placeholder="Enter Instagram password"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          Max posts: 
          {renderDropdown('instagram')}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleSubmit('instagram')}
              className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
            <button
              onClick={() => handleShowDetails('instagram')}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Show Details
            </button>
          </div>

          {showDetails && instagramData && (
            <div className="mt-8">
            {renderInstagramData()}
            
              <div className="flex mt-12 space-x-2">
                <button className="flex items-center space-x-2 bg-green-200 text-green-700 px-4 py-2 rounded-md hover:bg-green-300 transition-colors">
                  <FileCsv size={24} weight="bold" />
                  <span className="text-md font-semibold">Export to CSV</span>
                </button>
                <button className="flex items-center space-x-2 bg-red-200 text-red-700 px-4 py-2 rounded-md hover:bg-red-300 transition-colors">
                  <FilePdf size={24} weight="bold" />
                  <span className="text-md font-semibold">Export to PDF</span>
                </button>
                <button className="flex items-center space-x-2 bg-blue-200 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-300 transition-colors">
                  <CloudArrowUp size={24} weight="bold" />
                  <span className="text-md font-semibold">Export to Drive</span>
                </button>
                <button className="flex items-center space-x-2 bg-yellow-200 text-yellow-700 px-4 py-2 rounded-md hover:bg-yellow-300 transition-colors">
                  <Coins size={24} weight="bold" />
                  <span className="text-md font-semibold">Export to Blockchain</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

{activeSection === 'whatsapp' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-green-500">WhatsApp</h2>
          <input
            type="text"
            id="whatsappInput"
            placeholder="Enter phone number"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          />
             Max messages: 
             {renderDropdown('whatsapp')}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleShowDetails('whatsapp')}
              className=" bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
            >
              Show Details
            </button>
          </div>

          {whatsappData && showDetails && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-white">User Chats</h3>
              {renderWhatsappChats(whatsappData.chats)}
            </div>
          )}
        </div>
      )}
      {activeSection === 'x' && (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h2 className="text-2xl font-bold text-blue-500">X (formerly Twitter)</h2>
    <input
      type="text"
      id="xInput"
      placeholder="Enter X username, email, or phone number"
      className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
      type="password"
      id="xPassword"
      placeholder="Enter X password"
      className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    Max posts:
    {renderDropdown('x')} {/* Assuming this renders the dropdown for the max posts */}
    <div className="flex space-x-4 mt-4">
      <button
        onClick={() => handleSubmit('x')}
        className=" bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        disabled={isLoading}
      >
        Submit
      </button>
      <button
        onClick={() => handleShowDetails('x')}
        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
      >
        Show Details
      </button>
    </div>
    {showDetails && (
      <div className="mt-6">
        <h3 className="text-xl font-bold text-blue-400 mb-4">Tweets</h3>
        {xData?.tweets ? renderXTweets(xData.tweets) : <p>No tweets available</p>}
      </div>
    )}
  </div>
)}


      {activeSection === 'telegram' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-blue-400">Telegram</h2>
          <input
            type="text"
            id="telegramInput"
            placeholder="Enter Telegram phone number"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
           
          />
          Max messages:
          {renderDropdown('telegram')}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleSubmit('telegram')}
              className=" bg-blue-400 text-white px-6 py-2 rounded-md hover:bg-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
            <button
              onClick={() => handleShowDetails('telegram')}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Show Details
            </button>
          </div>
          {telegramData && showDetails && (
             <div className="mt-6">
             <h3 className="text-xl font-semibold text-blue-300 mb-4">Chats</h3>
             {renderTelegramChats(telegramData.chats)}
           </div>
          )}
        </div>
      )}

      {activeSection === 'facebook' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-blue-600">Facebook</h2>
          <input
            type="text"
            id="facebookInput"
            placeholder="Enter email or phone number"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password" id="facebookPassword"
            placeholder="Enter Facebook password"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="pin" id="facebookPin"
            placeholder="Enter Facebook pin"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        Max posts:
    {renderDropdown('facebook')}
    <p className="text-yellow-400 mt-4 mb-2 italic">Warning: A CAPTCHA may be required for verification.</p>
    <div className="flex space-x-4 mt-4">
      <button
        onClick={() => handleSubmit('facebook')}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        disabled={isLoading}
      >
        Submit
      </button>
      <button
        onClick={() => handleShowDetails('facebook')}
        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
      >
        Show Details
      </button>
    </div>
          <div className="mt-8">
      {facebookData ? renderFacebookData(facebookData) : <p className="text-gray-400">No Facebook data loaded yet.</p>}
    </div>
        </div>
      )}
    </div>
  );
};

export default Services;  