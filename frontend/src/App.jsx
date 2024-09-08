import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Services from "./components/services";
import Header from "./components/header";
import Home from "./components/home";

import { AuthProvider } from "./contexts/authContext";
import { useRoutes } from "react-router-dom";

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
  ];

  let routesElement = useRoutes(routesArray);

  return (
    <AuthProvider>
      <Header />
      {/* Full screen height minus header with flex column */}
      <div className="w-full flex-grow flex flex-col pt-16 bg-gray-100">
        {routesElement}
      </div>
    </AuthProvider>
  );
}

export default App;
