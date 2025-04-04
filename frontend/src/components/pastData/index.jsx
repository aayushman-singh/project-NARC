import React, { useState, useEffect } from "react";
import {
  InstagramLogo,
  WhatsappLogo,
  FacebookLogo,
  TelegramLogo,
  TwitterLogo,
  FileCsv,
  FilePdf,
  CloudArrowUp,
  Coins,
  X,
} from "phosphor-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import "./style.css";


import FacebookData from "./FacebookSection";
import RenderInstagramData from "../services/Instagram";
import FacebookDataViewer from "./FacebookSection";
import WhatsAppChatsViewer from "./WhatsappSection";
import TelegramChatsDisplay from "./TelegramSection";
import XTweetsDisplay from "./TwitterSection"
import InstagramUsersViewer from "./InstagramSection"
const PastData = () => {
  const [activeSection, setActiveSection] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [instagramData, setInstagramData] = useState(null);
  const [telegramData, setTelegramData] = useState(null);
 
  const [alert, setAlert] = useState({
    visible: false,
    message: "",
    type: "info",
  });
  const [whatsappData, setWhatsappData] = useState(null);
  const [xData, setXData] = useState(null);
  const [facebookData, setFacebookData] = useState(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const handleSectionClick = (section) => {
    setActiveSection((prev) => (prev === section ? "" : section));
  };

  const showAlert = (message, type = "info") => {
    setAlert({ visible: true, message, type });
    setTimeout(
      () => setAlert({ visible: false, message: "", type: "info" }),
      3000,
    );
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
      console.error("Unknown platform or port not configured");
      return;
    }

    // const username = document.getElementById(`${platform}Input`).value;
    // const password = requiresPassword
    //   ? document.getElementById(`${platform}Password`).value
    //   : null;

    setIsLoading(true);

    try {
      const queryParams =
        requiresPassword && password
          ? `?password=${encodeURIComponent(password)}`
          : "";

      const response = await fetch(
        `http://localhost:${port}/${platform}/users`,
      );

      if (!response.ok) {
        throw new Error("User not found");
      }

      const data = await response.json();

      // Dynamically set the state based on the platform
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
        default:
          console.error("Unknown platform");
      }

      setShowDetails(true);
      showAlert("Data fetched successfully", "success");
    } catch (error) {
      showAlert("Failed to fetch data. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

 

 
  
  

  // const renderDropdown = (platform) => (
  //   <select
  //     id={`${platform}Dropdown`}
  //     className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
  //   >
  //     <option value="1">1</option>
  //     <option value="3">3</option>
  //     <option value="5">5</option>
  //     <option value="10">10</option>
  //     <option value="20">20</option>
  //     <option value="50">50</option>
  //     <option value="100">100</option>
  //     <option value="200">200</option>
  //   </select>
  // );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 relative">
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
        Past Data
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
            className={`text-lg ${activeSection === "instagram" ? "text-pink-500" : "text-gray-400"}`}
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
            className={`text-lg ${activeSection === "facebook" ? "text-blue-600" : "text-gray-400"}`}
          >
            Facebook
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
            className={`text-lg ${activeSection === "x" ? "text-blue-500" : "text-gray-400"}`}
          >
            X
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
            className={`text-lg ${activeSection === "telegram" ? "text-blue-400" : "text-gray-400"}`}
          >
            Telegram
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
            className={`text-lg ${activeSection === "whatsapp" ? "text-green-500" : "text-gray-400"}`}
          >
            WhatsApp
          </span>
        </button>
      </div>

      {activeSection === "instagram" && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-pink-500">Instagram</h2>
         
          <div className="flex space-x-4 mt-4">
           
            <button
              onClick={() => handleShowDetails("instagram")}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Show Details
            </button>
          </div>
          {showDetails && instagramData && (
            <div className="mt-8">
              <InstagramUsersViewer apiData = {instagramData}/>

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
         
          <div className="flex space-x-4 mt-4">
            

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
    <WhatsAppChatsViewer apiData={whatsappData} />

  </div>
)}


        </div>
      )}
      {activeSection === "x" && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-blue-500">
            X (formerly Twitter)
          </h2>
         
        
        
          <div className="flex space-x-4 mt-4">
           
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
   
      <XTweetsDisplay apiData={xData} />
   
    
  </div>
)}


        </div>
      )}

      {activeSection === "telegram" && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-blue-400">Telegram</h2>
         
          <div className="flex space-x-4 mt-4">
           
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
              <TelegramChatsDisplay apiData={telegramData} />
            </div>
          )}
        </div>
      )}

{activeSection === "facebook" && (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h2 className="text-2xl font-bold text-blue-600">Facebook</h2>
    
   
    <div className="flex space-x-4 mt-4">
     
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
          <FacebookDataViewer apiData={facebookData} />;
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

export default PastData;
