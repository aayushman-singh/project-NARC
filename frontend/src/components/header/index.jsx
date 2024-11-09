import React, { useState, useRef, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const checkUserAuth = () => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUser(JSON.parse(storedUserInfo));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUserAuth();
    window.addEventListener('storage', checkUserAuth);

    return () => {
      window.removeEventListener('storage', checkUserAuth);
    };
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 h-16 bg-black/30 backdrop-blur-lg shadow-lg flex justify-between items-center px-8 transition-all duration-300">
      <div className="flex items-center space-x-1">
        <Link to="/home">
          <img
            src="/images/logo/logo.png"
            alt="Logo"
            className="h-10"
          />
        </Link>
        <div className="text-2xl font-bold text-white font-montserrat cursor-pointer">
          <Link to="/home" className="hover:text-blue-400 transition-colors">
            tattletale
          </Link>
        </div>
      </div>

      <div className="flex items-center space-x-6 relative">
        {user ? (
          <>
            <ScrollLink
              to="about"
              smooth={true}
              duration={500}
              className="text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors"
            >
              About
            </ScrollLink>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors flex items-center"
              >
                Services
                <svg
                  className="ml-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06 0L10 10.91l3.71-3.7a.75.75 0 111.06 1.06l-4.25 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-50">
                  <Link
                    to="/services"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Social Media Investigation Tools
                  </Link>
                  <Link
                    to="/osint"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    OSINT Tools
                  </Link>
                  <Link
                    to="/pastData"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Past Data
                  </Link>
                </div>
              )}
            </div>

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
