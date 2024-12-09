import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Services from "./components/services";
import Header from "./components/header";
import Home from "./components/home";
import ServicesMain from "./components/servicesMain";
import SearchPage from "./components/servicesOsint";
import { GoogleOAuthProvider } from '@react-oauth/google';
import InstagramDataDisplay from "./components/pastData";
import DataAnalysisPage from "./components/analysis";
// import CursorFollower from "./components/cursor";
import { AuthProvider } from "./contexts/authContext";
import GoogleDriveFileExplorer from "./components/services/GoogleDrive"
import { useRoutes } from "react-router-dom";
import ProfilePage from "./components/profile";
import ChatbotAvatar from "./components/chatbot/chatbotAvatar"
function App() {
  const routesArray = [
    {
      path: "*",
      element: <Login />,
    },
    {
      path: "/services",
      element: <Services />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/servicesMain",
      element: <ServicesMain />,
    },
    {
      path: "/osint",
      element: <SearchPage />,
    },
    {
      path: "/pastData",
      element: <InstagramDataDisplay />,
    },
    {
      path: "/profileAnalysis",
      element: <DataAnalysisPage />,
    },
    {
      path: "/profilePage",
      element: <ProfilePage/>,
    },
    {
      path: "/google",
      element: <GoogleDriveFileExplorer/>,
    },
   
  ];

  let routesElement = useRoutes(routesArray);

  return (
    <>
      {/* <CursorFollower/> */}
      <GoogleOAuthProvider clientId="218022995131-pkv99vvugfmhr73ua600lg44q362bbsj.apps.googleusercontent.com">
      <Header />
      {/* Full screen height minus header with flex column */}
      <div className="w-full flex-grow flex flex-col pt-16 bg-gray-700">
        {routesElement}
      </div>
      <ChatbotAvatar />
      </GoogleOAuthProvider>
    </>
  );
}

export default App;
