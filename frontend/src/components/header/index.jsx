import React from 'react';
import { Link } from 'react-scroll'; // for smooth scrolling
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';

const Header = () => {
  const { userLoggedIn } = useAuth();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 h-16 bg-black/30 backdrop-blur-lg shadow-lg flex justify-between items-center px-8 transition-all duration-300">
      {/* Logo Section */}
      <div className="text-2xl font-bold text-white font-montserrat cursor-pointer">
        <Link to="home" smooth={true} duration={500} className="hover:text-blue-400 transition-colors">
          tattletale
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center space-x-6">
        <Link
          to="about"
          smooth={true}
          duration={500}
          className="text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors"
        >
          About
        </Link>
        <Link
          to="services"
          smooth={true}
          duration={500}
          className="text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors"
        >
          Services
        </Link>
        <Link
          to="team"
          smooth={true}
          duration={500}
          className="text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors"
        >
          Team
        </Link>

        {userLoggedIn ? (
          <button
            onClick={() => doSignOut()}
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Header;
