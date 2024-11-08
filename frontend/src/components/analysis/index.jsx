import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DataAnalysisPage = () => {
  const [username, setUsername] = useState('');
  const [showImage, setShowImage] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setShowImage(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-start p-4 space-y-8">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-100">Data Analysis</h1>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400"
            />
            <button
              type="submit"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 rounded-md transition duration-300 ${
                username.trim() 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
              disabled={!username.trim()}
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {showImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-4xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 blur opacity-25 rounded-lg"></div>
          <img
            src="/images/chart/flowchart.png"
            alt="Data Analysis Result"
            className="relative z-10 rounded-lg shadow-lg w-full"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <p className="text-white text-2xl font-bold bg-black bg-opacity-50 px-6 py-3 rounded">
              
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DataAnalysisPage;