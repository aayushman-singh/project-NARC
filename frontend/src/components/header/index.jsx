import React from 'react';
import { Link as ScrollLink } from 'react-scroll'; // For smooth scrolling
import { Link, useNavigate } from 'react-router-dom'; // For navigation
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';

const Header = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  const handleLogout = () => {
    doSignOut().then(() => {
      navigate('/login'); // Redirect to login page after logout
    });
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 h-16 bg-black/30 backdrop-blur-lg shadow-lg flex justify-between items-center px-8 transition-all duration-300">
      {/* Logo Section */}
      <div className="text-2xl font-bold text-white font-montserrat cursor-pointer">
        <ScrollLink to="home" smooth={true} duration={500} className="hover:text-blue-400 transition-colors">
          tattletale
        </ScrollLink>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center space-x-6">
        {userLoggedIn ? (
          <>
            <ScrollLink
              to="about"
              smooth={true}
              duration={500}
              className="text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors"
            >
              About
            </ScrollLink>
            <ScrollLink
              to="services"
              smooth={true}
              duration={500}
              className="text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors"
            >
              Services
            </ScrollLink>
            <ScrollLink
              to="team"
              smooth={true}
              duration={500}
              className="text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors"
            >
              Team
            </ScrollLink>

            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-green-800 transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;
