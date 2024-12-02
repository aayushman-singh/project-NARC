import React, { useState, useRef, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Database, Clock, UserCheck, Menu, X } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const checkUserAuth = () => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUser(JSON.parse(storedUserInfo));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUserAuth();
    window.addEventListener("storage", checkUserAuth);

    return () => {
      window.removeEventListener("storage", checkUserAuth);
    };
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/10 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <Link to="/home" className="flex items-center space-x-2">
              <img src="/images/logo/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold text-white font-montserrat hover:text-blue-400 transition-colors duration-300">
                tattletale
              </span>
            </Link>
          </div>

          {/* Menu for Large Screens */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  to="profilePage"
                  className="text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors duration-300 relative group"
                >
                  {user.name}
                </Link>
                <ScrollLink
                  to="about"
                  smooth={true}
                  duration={500}
                  className="text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors duration-300 relative group"
                >
                  About
                </ScrollLink>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors duration-300 flex items-center"
                  >
                    Services
                    <svg
                      className={`ml-2 h-5 w-5 text-white transition-transform duration-300 ${
                        dropdownOpen ? 'rotate-180' : ''
                      }`}
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
                    <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden">
                      <Link
                        to="/services"
                        className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors duration-300"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Search className="mr-3 h-5 w-5 text-blue-400" />
                        <span>Social Media Investigation Tools</span>
                      </Link>
                      <Link
                        to="/osint"
                        className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors duration-300"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Database className="mr-3 h-5 w-5 text-blue-400" />
                        <span>OSINT Tools</span>
                      </Link>
                      <Link
                        to="/pastData"
                        className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors duration-300"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Clock className="mr-3 h-5 w-5 text-blue-400" />
                        <span>Past Data</span>
                      </Link>
                      <Link
                        to="/profileAnalysis"
                        className="flex items-center px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors duration-300"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <UserCheck className="mr-3 h-5 w-5 text-blue-400" />
                        <span>Profile Analysis</span>
                      </Link>
                    </div>
                  )}
                </div>

                <ScrollLink
                  to="team"
                  smooth={true}
                  duration={500}
                  className="text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors duration-300 relative group"
                >
                  Team
                </ScrollLink>

                <button
                  onClick={handleLogout}
                  className="bg-blue-600 text-white text-sm font-semibold px-5 py-1.5 rounded-full hover:bg-blue-700 transition-colors duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-blue-600 text-white text-sm font-semibold px-5 py-1.5 rounded-full hover:bg-blue-700 transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white text-sm font-semibold px-5 py-1.5 rounded-full hover:bg-green-700 transition-colors duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Hamburger Menu for Small Screens */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 space-y-3 pb-3">
            {user ? (
              <>
                <Link
                  to="profilePage"
                  className="block text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors duration-300"
                >
                  {user.name}
                </Link>
                <ScrollLink
                  to="about"
                  smooth={true}
                  duration={500}
                  className="block text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors duration-300 relative group"
                >
                  About
                </ScrollLink>
                <Link
                  to="/services"
                  className="block text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors duration-300 relative group"
                >
                  Services
                </Link>
                <ScrollLink
                  to="team"
                  smooth={true}
                  duration={500}
                  className="block text-white text-sm font-semibold cursor-pointer hover:text-blue-400 transition-colors duration-300 relative group"
                >
                  Team
                </ScrollLink>
                <button
                  onClick={handleLogout}
                  className="block w-full bg-blue-600 text-white text-sm font-semibold px-5 py-1.5 rounded-full hover:bg-blue-700 transition-colors duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block w-full bg-blue-600 text-white text-sm font-semibold px-5 py-1.5 rounded-full hover:bg-blue-700 transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full bg-green-600 text-white text-sm font-semibold px-5 py-1.5 rounded-full hover:bg-green-700 transition-colors duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
        <style jsx>{`
          .group::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 2px;
            bottom: -4px;
            left: 0;
            background-color: #60a5fa; /* Tailwind's blue-400 */
            transform: scaleX(0);
            transform-origin: bottom right;
            transition: transform 0.3s ease-out;
          }
          .group:hover::after {
            transform: scaleX(1);
            transform-origin: bottom left;
          }
        `}</style>
      </div>
    </nav>
  );
};

export default Header;

