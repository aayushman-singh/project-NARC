import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';

const Header = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  return (
    <nav className="flex justify-between items-center w-full z-20 fixed top-0 left-0 h-16 px-6 shadow-md bg-black">
      {/* Logo Section */}
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors font-montserrat">
          NARC
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-x-4">
        {userLoggedIn ? (
          <button
            onClick={() => {
              doSignOut().then(() => {
                navigate('/login');
              });
            }}
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-800 transition-colors"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all"
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
