import React, { useState, useEffect } from 'react';
import { InstagramLogo, WhatsappLogo, FacebookLogo, TelegramLogo, TwitterLogo, FileCsv, FilePdf, CloudArrowUp, Coins } from 'phosphor-react';
import followersData from '../data/followers_log';  // Import followers data
import followingData from '../data/following_log';
import './style.css';

// Import the JSON data
import instagramData from '../data/Instagram.json';

const Services = () => {
  const [activeSection, setActiveSection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);


  const toggleFollowers = () => setShowFollowers(!showFollowers);
  const toggleFollowing = () => setShowFollowing(!showFollowing);
  const handleSectionClick = (section) => {
    setActiveSection((prev) => (prev === section ? '' : section));
  };
  const handleSubmit = async (platform) => {
    const tagInputElement = document.getElementById(`${platform}Input`);
    const passwordInputElement = document.getElementById(`${platform}Password`); // New password input element
  
    if (!tagInputElement) {
      console.error(`${platform}Input element not found`);
      alert('Please enter tags');
      return;
    }
  
    if (!passwordInputElement) {
      console.error(`${platform}Password element not found`);
      alert('Please enter the password');
      return;
    }
  
    // Update the base URL to your EC2 instance’s HTTPS endpoint
    const baseUrl = 'https://3.109.1.248'; // Replace with your AWS EC2 instance's public IP or domain
  
    const tagInputValue = tagInputElement.value;
    const tagsArray = tagInputValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    const password = passwordInputElement.value; // Get the password
  
    if (!password || password.trim() === "") {
      alert('Please enter the password');
      return;
    }
  
    const payload = {
      startUrls: tagsArray,
      password: password.trim(), // Add password to the payload
    };
  
    // Adjust the endpoint based on the platform (Instagram, Facebook, or X)
    let apiEndpoint;
    if (platform === 'instagram') {
      apiEndpoint = `${baseUrl}/instagram`; // AWS API route for Instagram
    } else if (platform === 'facebook') {
      apiEndpoint = `${baseUrl}/facebook`; // AWS API route for Facebook
    } else if (platform === 'x') {
      apiEndpoint = `${baseUrl}/x`; // AWS API route for X
    } else {
      console.error('Unsupported platform:', platform);
      alert('Unsupported platform. Please choose Instagram, Facebook, or X.');
      return;
    }
  
    setIsLoading(true);
  
    try {
      console.log(`Payload being sent to platform ${platform}:`, payload);
      const response1 = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response1.ok) {
        throw new Error(`First request failed for ${platform}: ${response1.statusText}`);
      }
  
      alert('User Submitted Successfully');
      tagInputElement.value = '';
      passwordInputElement.value = ''; // Clear the password input after submission
    } catch (error) {
      console.error(`Error submitting tags for ${platform}:`, error);
      alert('Failed to submit tags. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleShowDetails = () => {
    const username = document.getElementById('instagramInput').value;
    const user = instagramData.Instagram.instagram.find(u => u.username === username);
    if (user) {
      setUserData(user);
      setShowDetails(true);
    } else {
      alert('User not found');
    }
  };

  const DetailSection = ({ title, content }) => (
    <div className="bg-gray-700 p-4 rounded-md mt-4">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      {content}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 relative">
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold">Processing your request...</p>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-8 text-center">Social Media Investigation Tool</h1>

      {/* Section Headers */}
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

      {/* Instagram Section */}
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
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleSubmit('instagram')}
              className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
            <button
              onClick={handleShowDetails}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Show Details
            </button>
          </div>

          {showDetails && userData && (
            <div className="mt-8">
             <DetailSection
      title="Profile"
      content={
        <div>
          <p>Username: {userData.username}</p>
          <p>Full Name: {userData.full_name}</p>

          {/* Followers Dropdown */}
          <div>
            <p className="cursor-pointer" onClick={toggleFollowers}>
              Followers: {userData.followers} {showFollowers ? '▲' : '▼'}
            </p>
            {showFollowers && (
              <ul className="ml-4 list-disc">
                {followersData.map((follower, index) => (
                  <li key={index}>{follower}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Following Dropdown */}
          <div>
            <p className="cursor-pointer" onClick={toggleFollowing}>
              Following: {userData.following} {showFollowing ? '▲' : '▼'}
            </p>
            {showFollowing && (
              <ul className="ml-4 list-disc">
                {followingData.map((following, index) => (
                  <li key={index}>{following}</li>
                ))}
              </ul>
            )}
          </div>

          <p>Bio: {userData.biography}</p>
        </div>
      }
    />
              <DetailSection
                title="Posts"
                content={
                  <div>
                    {userData.posts.map((post, index) => (
                      <div key={index} className="mb-4 border border-gray-300 p-4 rounded-lg">
                        <p>Post ID: {post.post_id}</p>
                        <img
                          src={`/images/post/post${index + 1}.jpg`} // Dynamically generate the file name based on the index
                          alt={`Post ${index + 1}`}
                          className="w-full max-w-2xl my-2"
                        />
                      </div>
                    ))}
                  </div>
                }
              />



              <DetailSection
                title="Timeline"
                content={
                  <div>
                    {userData.timeline_screenshots.map((screenshot, index) => (
                      <div key={index}>
                        <p>Timeline ID: {screenshot.timeline_id}</p>

                        <img
                          src={`/images/timeline/timeline_aayushman3260_${index + 1}.png`} // Dynamically generate the file name based on the index
                          alt={`Timeline ${index + 1}`}
                          className="w-full max-w-2xl my-2"
                        />

                      </div>
                    ))}
                  </div>


                }
              />
              <DetailSection
                title="messages"
                content={
                  <DetailSection
                    title="messages"
                    content={
                      <img
                        src={`/images/screenshot/instagram_direct_first_message.png`} // Access the image from public/images/screenshot

                        className="w-full max-w-2xl h-auto my-2" // Adjust size as needed
                      />
                    }
                  />
                }
              />

              {/* Export Buttons - Show only when details are visible */}
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

      {/* WhatsApp Section */}
      {activeSection === 'whatsapp' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-green-500">WhatsApp</h2>
          <input
            type="text"
            id="whatsappInput"
            placeholder="Enter WhatsApp username"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={() => handleSubmit('whatsapp')}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
            disabled={isLoading}
          >
            Submit
          </button>
        </div>
      )}

      {/* X Section */}
      {activeSection === 'x' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-blue-500">X (formerly Twitter)</h2>
          <input
            type="text"
            id="xInput"
            placeholder="Enter X username"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password" id="xPassword"
            placeholder="Enter X password"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSubmit('x')}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={isLoading}
          >
            Submit
          </button>
        </div>
      )}

      {/* Telegram Section */}
      {activeSection === 'telegram' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-blue-400">Telegram</h2>
          <input
            type="text"
            id="telegramInput"
            placeholder="Enter Telegram username"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password" id="telegramPassword"
            placeholder="Enter Telegram password"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => handleSubmit('telegram')}
            className="mt-4 bg-blue-400 text-white px-6 py-2 rounded-md hover:bg-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
            Submit
          </button>
        </div>
      )}

      {/* Facebook Section */}
      {activeSection === 'facebook' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-blue-600">Facebook</h2>
          <input
            type="text"
            id="facebookInput"
            placeholder="Enter Facebook username"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password" id="facebookPassword"
            placeholder="Enter Facebook password"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={() => handleSubmit('facebook')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            Submit
          </button>
        </div>

      )}

    </div>

  );
};

export default Services;