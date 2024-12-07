import React, { useState, useEffect } from "react";
import {
  InstagramLogo,
  WhatsappLogo,
  FacebookLogo,
  TelegramLogo,
  Envelope,
  TwitterLogo,
  FileCsv,
  FolderSimple,
  FilePdf,
  CloudArrowUp,
  Coins,
  X,
} from "phosphor-react";
import { FaGoogle } from "react-icons/fa";
import "./style.css";
import WhatsAppChats from "./Whatsapp";
import TelegramChats from "./Telegram";
import GmailChats from "./Gmail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from 'lucide-react';
import GoogleDriveUsers from "./GoogleDrive"
import FacebookData from "./Facebook";
import RenderInstagramData from "./Instagram";

import GoogleSection from "./GoogleSection"
const Services = () => {
  const [activeSection, setActiveSection] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [instagramData, setInstagramData] = useState(null);
  const [telegramData, setTelegramData] = useState(null);
  const [youtubeData, setYoutubeData] = useState(null);
  const [telegramChats, setTelegramChats] = useState([]);
  const [expandedChats, setExpandedChats] = useState({});
  const [googleSearchData, setGoogleSearchData] = useState(null);
  const [youtubeHistoryData, setYoutubeHistoryData] = useState(null);
  const [showGoogleSearchDetails, setShowGoogleSearchDetails] = useState(false);
  const [showYoutubeHistoryDetails, setShowYoutubeHistoryDetails] = useState(false);
  const [googleSearchDateRange, setGoogleSearchDateRange] = useState({ from: null, to: null });
  const [youtubeHistoryDateRange, setYoutubeHistoryDateRange] = useState({ from: null, to: null });
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState({
    visible: false,
    message: "",
    type: "info",
  });
  const [whatsappData, setWhatsappData] = useState(null);
  const [xData, setXData] = useState(null);
  const [facebookData, setFacebookData] = useState(null);
   const [gmailData, setGmailData] = useState(null);
   const [googleDriveData, setGoogleDriveData] = useState(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showTooltip, setShowTooltip] = useState({ messages: false, posts: false });
  const handleSectionClick = (section) => {
    setActiveSection((prev) => (prev === section ? "" : section));
  };
  const Tooltip = ({ text }) => (
    <div className="absolute bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg -mt-10 -ml-6 w-48">
      {text}
    </div>
  );
  const showAlert = (message, type = "info") => {
    setAlert({ visible: true, message, type });
    setTimeout(
      () => setAlert({ visible: false, message: "", type: "info" }),
      3000,
    );
  };

  const handleGmail = async (email) => {
    const dropdownElement = document.getElementById(`gmailDropdown`);
    const limit = parseInt(dropdownElement.value, 10);

     try {
       const response = await fetch("http://localhost:3006/auth-url", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email, limit }),
       });

       const data = await response.json();
       window.open(data.authUrl, "_blank");
     } catch (error) {
       console.error("Error initiating Gmail flow:", error);
     }
  };
  const handleGoogleDrive = async (email) => {
    const dropdownElement = document.getElementById(`googleDriveDropdown`);
    const limit = parseInt(dropdownElement.value, 10);
  
    try {
      const response = await fetch("http://localhost:3009/auth-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, limit }),
      });
  
      const data = await response.json();
      window.open(data.authUrl, "_blank");
    } catch (error) {
      console.error("Error initiating Google Drive flow:", error);
    }
  };
  
  const handleShowDetails = async (platform, requiresPassword = false) => {
    const platformConfig = {
      whatsapp: 3004,
      facebook: 3002,
      x: 3003,
      telegram: 3005,
      instagram: 3001,
      gmail: 3006,
      drive: 3009,
    };
  
    // Check if platform is valid
    const port = platformConfig[platform];
    if (!port) {
      console.error(`Platform "${platform}" is not supported or configured`);
      return;
    }
  
    // Retrieve the username based on the platform
    let username;
    if (platform === "drive") {
      username = email; // Use email state for "drive"
    } else {
      const usernameInput = document.getElementById(`${platform}Input`);
      username = usernameInput ? usernameInput.value : null;
    }
  
    // Retrieve password if required
    const password = requiresPassword
      ? document.getElementById(`${platform}Password`)?.value
      : null;
  
    if (!username) {
      console.error(`Username is required for platform "${platform}"`);
      showAlert("Please enter a username", "error");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const queryParams =
        requiresPassword && password
          ? `?password=${encodeURIComponent(password)}`
          : "";
  
      const response = await fetch(
        `http://localhost:${port}/${platform}/users/${username}${queryParams}`
      );
  
      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${platform}`);
      }
  
      const data = await response.json();
  
      // Dynamically update the state based on the platform
      switch (platform) {
        case "whatsapp":
          setWhatsappData(data);
          break;
        case "facebook":
          setFacebookData(data);
          break;
        case "x":
          setXData(data);
          break;
        case "telegram":
          setTelegramData(data);
          break;
        case "instagram":
          setInstagramData(data);
          break;
        case "gmail":
          setGmailData(data);
          break;
        case "drive":
          setGoogleDriveData(data);
          break;
        default:
          console.error("Unknown platform");
      }
  
      setShowDetails(true);
      showAlert("Data fetched successfully", "success");
    } catch (error) {
      console.error(`Error fetching data for ${platform}:`, error);
      showAlert("Failed to fetch data. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };
  

 

  const renderXTweets = (tweets, timeline) => {
    return tweets.map((tweet, index) => (
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
    ));
  };

  const handleSubmit = async (platform) => {
    const tagInputElement = document.getElementById(`${platform}Input`);
    const passwordInputElement = document.getElementById(`${platform}Password`);
    let pin, pinElement;
    const dropdownElement = document.getElementById(`${[platform]}Dropdown`);

    if (platform === "facebook") {
      pinElement = document.getElementById(`${platform}Pin`);
      if (!pinElement) {
        console.error(`${platform}Pin element not found`);
        alert("Please enter the PIN for Facebook");
        return;
      }
      pin = pinElement.value;
    }

    if (!tagInputElement) {
      console.error(`${platform}Input element not found`);
      showAlert("Please enter tags");
      return;
    }

    if (
      platform !== "whatsapp" &&
      platform !== "telegram" &&
      (!passwordInputElement || !passwordInputElement.value.trim())
    ) {
      console.error(`${platform}Password element not found`);
      showAlert("Please enter the password");
      return;
    }

    const baseUrl = "http://localhost";
    const tagInputValue = tagInputElement.value;
    const tagsArray = tagInputValue
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => (platform === "telegram" ? `+91${tag}` : tag));
    const limit = parseInt(dropdownElement.value, 10);
    const password =
      platform !== "whatsapp" && platform !== "telegram"
        ? passwordInputElement.value.trim()
        : undefined;
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    const userId = userInfo ? userInfo._id : "";

    const payload = { userId: userId, startUrls: tagsArray, limit: limit };
    if (platform === "facebook") {
      payload.password = password;
      payload.pin = pin ? pin.trim() : undefined;
    } else if (platform !== "whatsapp" || platform !== "telegram") {
      payload.password = password;
    }

    let apiEndpoint;
    const platformPorts = {
      instagram: 3001,
      facebook: 3002,
      x: 3003,
      whatsapp: 3004,
      telegram: 3005,
    };

    const port = platformPorts[platform];
    if (!port) {
      console.error("Unsupported platform:", platform);
      showAlert(
        "Unsupported platform. Please choose Instagram, Facebook, X, Whatsapp, or Telegram",
      );
      return;
    }

    apiEndpoint = `${baseUrl}:${port}/${platform}`;
    setIsLoading(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log(`Payload being sent to platform ${platform}:`, payload);

      showAlert("Account Scraped Successfully");

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error(`Error details:`, errorDetails);
        throw new Error(
          `Request failed for ${platform}: ${response.statusText}`,
        );
      }

      tagInputElement.value = "";
      if (passwordInputElement) passwordInputElement.value = "";
      if (pinElement) pinElement.value = "";
    } catch (error) {
      console.error(`Error submitting tags for ${platform}:`, error);
      showAlert("Failed to submit tags. Please try again.");
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
    <div className="min-h-screen pt-20 bg-gray-900 text-white p-8 relative">
      {alert.visible && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform ${
            alert.visible
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          } ${
            alert.type === "success"
              ? "bg-green-50 text-green-800 border-l-4 border-green-500"
              : alert.type === "error"
              ? "bg-red-50 text-red-800 border-l-4 border-red-500"
              : "bg-blue-50 text-blue-800 border-l-4 border-blue-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {alert.type === "success" && (
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {alert.type === "error" && (
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {alert.type === "info" && (
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
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
            <p className="text-gray-700 font-semibold">
              Processing your request...
            </p>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-8 text-center">
        Social Media Investigation Tool
      </h1>

      <div className="flex justify-center space-x-8 mb-8">
        <button
          onClick={() => handleSectionClick("instagram")}
          className="flex items-center space-x-2"
        >
          <InstagramLogo
            size={32}
            color={activeSection === "instagram" ? "#E1306C" : "#ccc"}
          />
          <span
            className={`text-lg ${
              activeSection === "instagram" ? "text-pink-500" : "text-gray-400"
            }`}
          >
            Instagram
          </span>
        </button>

        <button
          onClick={() => handleSectionClick("facebook")}
          className="flex items-center space-x-2"
        >
          <FacebookLogo
            size={32}
            color={activeSection === "facebook" ? "#3b5998" : "#ccc"}
          />
          <span
            className={`text-lg ${
              activeSection === "facebook" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            Facebook
          </span>
        </button>
        <button
          onClick={() => handleSectionClick("gmail")}
          className="flex items-center space-x-2"
        >
          <Envelope
            size={32}
            color={activeSection === "gmail" ? "#25D366" : "#ccc"}
          />
          <span
            className={`text-lg ${
              activeSection === "gmail" ? "text-green-500" : "text-gray-400"
            }`}
          >
            Gmail
          </span>
        </button>
        <button
          onClick={() => handleSectionClick("x")}
          className="flex items-center space-x-2"
        >
          <TwitterLogo
            size={32}
            color={activeSection === "x" ? "#1DA1F2" : "#ccc"}
          />
          <span
            className={`text-lg ${
              activeSection === "x" ? "text-blue-500" : "text-gray-400"
            }`}
          >
            X
          </span>
        </button>
        <button
    onClick={() => handleSectionClick("drive")}
    className="flex items-center space-x-2"
  >
    <FolderSimple
      size={32}
      color={activeSection === "drive" ? "#4285F4" : "#ccc"}
    />
    <span
      className={`text-lg ${
        activeSection === "drive" ? "text-blue-500" : "text-gray-400"
      }`}
    >
      Google Drive
    </span>
  </button>
        <button
          onClick={() => handleSectionClick("telegram")}
          className="flex items-center space-x-2"
        >
          <TelegramLogo
            size={32}
            color={activeSection === "telegram" ? "#0088cc" : "#ccc"}
          />
          <span
            className={`text-lg ${
              activeSection === "telegram" ? "text-blue-400" : "text-gray-400"
            }`}
          >
            Telegram
          </span>
        </button>
        <button
  onClick={() => handleSectionClick("google")}
  className="flex items-center space-x-2"
>
  <FaGoogle
    size={32}
    color={activeSection === "google" ? "#4285F4" : "#ccc"} // Google color when active
  />
  <span
    className={`text-lg ${activeSection === "google" ? "text-blue-500" : "text-gray-400"}`}
  >
    Google
  </span>
</button>
        <button
          onClick={() => handleSectionClick("whatsapp")}
          className="flex items-center space-x-2"
        >
          <WhatsappLogo
            size={32}
            color={activeSection === "whatsapp" ? "#25D366" : "#ccc"}
          />
          <span
            className={`text-lg ${
              activeSection === "whatsapp" ? "text-green-500" : "text-gray-400"
            }`}
          >
            WhatsApp
          </span>
        </button>
      </div>

      {activeSection === "instagram" && (
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
          <div className="flex items-center mt-4">
            Max posts:
            <span
              className="ml-2 text-gray-400 cursor-pointer relative group text-lg"
              aria-label="tooltip"
            >
              ℹ️
              <span className="absolute bottom-full   bg-gray-900 text-white text-sm rounded-md px-4 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                Specify the maximum number of posts to retrieve.
              </span>
            </span>
          </div>
          <div className="mt-2">{renderDropdown("instagram")}</div>

          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleSubmit("instagram")}
              className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
            <button
              onClick={() => handleShowDetails("instagram")}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Show Details
            </button>
          </div>
          {showDetails && instagramData && (
            <div className="mt-8">
              <RenderInstagramData instagramData={instagramData} />

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
                  <span className="text-md font-semibold">
                    Export to Blockchain
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSection === "whatsapp" && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-green-500">WhatsApp</h2>
          <input
            type="text"
            id="whatsappInput"
            placeholder="Enter phone number"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <div className="flex items-center">
            Max messages:
            <span
              className="ml-2 text-gray-400 cursor-pointer relative group text-lg"
              aria-label="tooltip"
            >
              ℹ️
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                Specify the maximum number of messages to retrieve.
              </span>
            </span>
          </div>
          <div className="mt-2">{renderDropdown("whatsapp")}</div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleSubmit("whatsapp")}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>

            <button
              onClick={() => handleShowDetails("whatsapp")}
              className=" bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
            >
              Show Details
            </button>
          </div>
          {whatsappData && showDetails && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-white">User Chats</h3>
              <WhatsAppChats chats={whatsappData.chats} />
            </div>
          )}
        </div>
      )}
      {activeSection === "x" && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-blue-500">
            X (formerly Twitter)
          </h2>
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
          <div className="flex items-center mt-4">
            Max posts:
            <span
              className="ml-2 text-gray-400 cursor-pointer relative group text-lg"
              aria-label="tooltip"
            >
              ℹ️
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                Specify the maximum number of posts to retrieve.
              </span>
            </span>
          </div>
          <div className="mt-2">{renderDropdown("x")}</div>
          {/* Assuming this renders the dropdown for the max posts */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleSubmit("x")}
              className=" bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
            <button
              onClick={() => handleShowDetails("x")}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Show Details
            </button>
          </div>
          {showDetails && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-blue-400 mb-4">Tweets</h3>
              {xData?.tweets?.length > 0 ? (
                renderXTweets(xData.tweets, xData.timeline)
              ) : (
                <p className="text-gray-400">No tweets available</p>
              )}
            </div>
          )}
        </div>
      )}

{activeSection === "google" && (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h2 className="text-2xl font-bold text-blue-500">Google</h2>
    <Tabs defaultValue="search" className="w-full mt-4">
      <TabsList className="grid w-full color-gray grid-cols-2">
        <TabsTrigger value="search" className="text-white bg-gray-700 hover:bg-gray-600">
          Google Search
        </TabsTrigger>
        <TabsTrigger value="youtube" className="text-white bg-gray-700 hover:bg-gray-600">
          YouTube History
        </TabsTrigger>
      </TabsList>
      <TabsContent value="search">
        <input
          type="email"
          placeholder="Enter Google account email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <div className="flex space-x-4 mt-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal text-white bg-gray-700 hover:bg-gray-600"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {googleSearchDateRange.from ? (
                  format(googleSearchDateRange.from, "dd-MM-yyyy")
                ) : (
                  <span className="text-blue-400">From Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={googleSearchDateRange.from}
                onSelect={(date) => setGoogleSearchDateRange({ ...googleSearchDateRange, from: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal text-white bg-gray-700 hover:bg-gray-600"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {googleSearchDateRange.to ? (
                  format(googleSearchDateRange.to, "dd-MM-yyyy")
                ) : (
                  <span className="text-blue-400">To Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={googleSearchDateRange.to}
                onSelect={(date) => setGoogleSearchDateRange({ ...googleSearchDateRange, to: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center mt-4">
          Max searches:
          <span
            className="ml-2 text-gray-400 cursor-pointer relative group text-lg"
            aria-label="tooltip"
          >
            ℹ️
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              Specify the maximum number of search results to retrieve.
            </span>
          </span>
        </div>
        <div className="mt-2">{renderDropdown("googleSearch")}</div>
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => handleGoogleSearch(email, googleSearchDateRange)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            Submit
          </button>
          <button
            onClick={() => handleShowDetails("googleSearch")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            Show Details
          </button>
        </div>
        {googleSearchData && showDetails && (
          <div className="mt-6">
            <h3 className="text-xl font-bold text-blue-400">Google Search History</h3>
            <GoogleSearchHistory data={googleSearchData} />
          </div>
        )}
      </TabsContent>
      <TabsContent value="youtube">
        <input
          type="email"
          placeholder="Enter YouTube account email"
          value={email}
          onChange={(e) => setYoutubeEmail(e.target.value)}
          className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <div className="flex space-x-4 mt-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal text-white bg-gray-700 hover:bg-gray-600"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {youtubeHistoryDateRange.from ? (
                  format(youtubeHistoryDateRange.from, "dd-MM-yyyy")
                ) : (
                  <span className="text-blue-400">From Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={youtubeHistoryDateRange.from}
                onSelect={(date) => setYoutubeHistoryDateRange({ ...youtubeHistoryDateRange, from: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal text-white bg-gray-700 hover:bg-gray-600"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {youtubeHistoryDateRange.to ? (
                  format(youtubeHistoryDateRange.to, "dd-MM-yyyy")
                ) : (
                  <span className="text-blue-400">To Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={youtubeHistoryDateRange.to}
                onSelect={(date) => setYoutubeHistoryDateRange({ ...youtubeHistoryDateRange, to: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center mt-4">
          Max videos:
          <span
            className="ml-2 text-gray-400 cursor-pointer relative group text-lg"
            aria-label="tooltip"
          >
            ℹ️
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              Specify the maximum number of YouTube history videos to retrieve.
            </span>
          </span>
        </div>
        <div className="mt-2">{renderDropdown("youtubeHistory")}</div>
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => handleYoutubeHistory(youtubeEmail, youtubeHistoryDateRange)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            Submit
          </button>
          <button
            onClick={() => handleShowDetails("youtubeHistory")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            Show Details
          </button>
        </div>
        {youtubeHistoryData && showDetails && (
          <div className="mt-6">
            <h3 className="text-xl font-bold text-blue-400">YouTube History</h3>
            <YouTubeHistory data={youtubeHistoryData} />
          </div>
        )}
      </TabsContent>
    </Tabs>
  </div>
)}


      {activeSection === "telegram" && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-blue-400">Telegram</h2>
          <input
            type="text"
            id="telegramInput"
            placeholder="Enter Telegram phone number"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex items-center">
            Max messages:
            <span
              className="ml-2 text-gray-400 cursor-pointer relative group text-lg"
              aria-label="tooltip"
            >
              ℹ️
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                Specify the maximum number of messages to retrieve.
              </span>
            </span>
          </div>
          <div className="mt-2">{renderDropdown("telegram")}</div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleSubmit("telegram")}
              className=" bg-blue-400 text-white px-6 py-2 rounded-md hover:bg-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
            <button
              onClick={() => handleShowDetails("telegram")}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Show Details
            </button>
          </div>
          {telegramData && showDetails && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-blue-300 mb-4">
                Chats
              </h3>
              <TelegramChats chats={telegramData.chats} />
            </div>
          )}
        </div>
      )}

      {activeSection === "gmail" && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-blue-400">Gmail</h2>
          <div className="mt-4">
            <label className="text-gray-400 text-sm">Email Address</label>
            <input
              type="email"
              
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-2 w-full p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            Max emails:
            <span
              className="ml-2 text-gray-400 cursor-pointer relative group text-lg"
              aria-label="tooltip"
            >
              ℹ️
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                Specify the maximum number of emails to retrieve.
              </span>
            </span>
          </div>
          <div className="mt-2">{renderDropdown("gmail")}</div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleGmail(email)}
              className=" bg-blue-400 text-white px-6 py-2 rounded-md hover:bg-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
            <button
              onClick={() => handleShowDetails("gmail")}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Show Details
            </button>
          </div>
          {gmailData && showDetails && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-blue-300 mb-4">
                Chats
              </h3>
              <GmailChats chats={gmailData.chats} />
            </div>
          )}
        </div>
      )}
{activeSection === "drive" && (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h2 className="text-2xl font-bold text-blue-400">Google Drive</h2>
    <div className="mt-4">
      <label className="text-gray-400 text-sm">Email Address</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="mt-2 w-full p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="flex items-center">
      Max files:
      <span
        className="ml-2 text-gray-400 cursor-pointer relative group text-lg"
        aria-label="tooltip"
      >
        ℹ️
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          Specify the maximum number of files to retrieve.
        </span>
      </span>
    </div>
    <div className="mt-2">{renderDropdown("googleDrive")}</div>
    <div className="flex space-x-4 mt-4">
      <button
        onClick={() => handleGoogleDrive(email)}
        className="bg-blue-400 text-white px-6 py-2 rounded-md hover:bg-blue-500 disabled:opacity-50"
        disabled={isLoading}
      >
        Submit
      </button>
      <button
      
        onClick={() => {
    console.log("Email:", email); // Debugging
    handleShowDetails("drive");
  }}
        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
      >
        Show Details
      </button>
    </div>
    {googleDriveData && showDetails && (
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-blue-300 mb-4">
          Files
        </h3>
        <GoogleDriveUsers users={googleDriveData} />
      </div>
    )}
  </div>
)}

      {activeSection === "facebook" && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-blue-600">Facebook</h2>
          <input
            type="text"
            id="facebookInput"
            placeholder="Enter email or phone number"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password"
            id="facebookPassword"
            placeholder="Enter Facebook password"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="pin"
            id="facebookPin"
            placeholder="Enter Facebook pin"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <div className="mt-4">
            <div className="flex items-center mt-4">
              Max posts:
              <span
                className="ml-2 text-gray-400 cursor-pointer relative group text-lg"
                aria-label="tooltip"
              >
                ℹ️
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm rounded-md px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  Specify the maximum number of posts to retrieve.
                </span>
              </span>
            </div>
            <div className="mt-2">{renderDropdown("facebook")}</div>
          </div>
          <p className="text-yellow-400 mt-4 mb-2 italic">
            Warning: A CAPTCHA may be required for verification.
          </p>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleSubmit("facebook")}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
            <button
              onClick={() => handleShowDetails("facebook")}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Show Details
            </button>
          </div>
          <div className="mt-8">
            {facebookData ? (
              <div>
                <FacebookData facebookData={facebookData} />
              </div>
            ) : (
              <p className="text-gray-400">No Facebook data loaded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
