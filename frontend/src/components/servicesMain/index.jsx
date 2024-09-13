import React from 'react';

const GlassCard = ({ title, description, buttonText, buttonLink }) => (
  <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 border border-white border-opacity-20 flex flex-col justify-between">
    <div>
      <h3 className="text-2xl font-semibold text-white mb-4">{title}</h3>
      <p className="text-lg text-gray-300 mb-6">{description}</p>
    </div>
    <a
      href={buttonLink}
      className="inline-block px-6 py-3 text-lg font-semibold bg-blue-600 bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all text-center"
    >
      {buttonText}
    </a>
  </div>
);

const Services1 = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
      <div className="relative z-10 container mx-auto px-4">
        <h1 className="text-5xl sm:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-12">
          Choose Your Investigation Path
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <GlassCard
            title="Social Media Investigation Tools"
            description="Access our cutting-edge tools designed specifically for investigating social media platforms. Track user activities, analyze posts, and generate comprehensive reports across various social networks."
            buttonText="Explore Social Media Tools"
            buttonLink="/services"
          />
          <GlassCard
            title="OSINT Tools"
            description="Utilize Open Source Intelligence (OSINT) tools to gather and analyze publicly available information. Enhance your investigations with powerful data collection and analysis capabilities from diverse online sources."
            buttonText="Discover OSINT Tools"
            buttonLink="/osint"
          />
        </div>
      </div>
    </div>
  );
};

export default Services1;