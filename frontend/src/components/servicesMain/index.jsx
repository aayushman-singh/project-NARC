import React from 'react';
import { Link } from 'react-router-dom';

const GlassCard = ({ title, description, buttonText, buttonLink }) => (
  <div className="bg-white flex items-center bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl  p-8 border border-white border-opacity-20 flex flex-col justify-between">
    <div>
      <h3 className="text-2xl font-semibold text-white mb-4">{title}</h3>
      <p className="text-lg text-gray-300 mb-6">{description}</p>
    </div>
    <Link
      to={buttonLink}
      className="inline-block px-6 py-3 text-lg font-semibold bg-blue-600 bg-opacity-70 text-white rounded-full hover:bg-opacity-85 transition-all text-center"
    >
      {buttonText}
    </Link>
  </div>
);

const ServicesMain = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white flex items-center justify-center">
        {/* Fixed video background */}
        <video
        className="fixed top-0 left-0 w-auto h-auto min-w-full min-h-full object-cover z-0 "
        autoPlay
        loop
        muted
      >
        <source src="/videos/vecteezy_digital-spinning-hologram-globe-of-planet-earth_26687898.mp4" type="video/mp4" />
        
      </video>
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
      <div className="relative z-10 container mx-auto px-4">
        <h1 className="text-7xl  font-bold text-center bg-clip-text text-transparent text-white mb-12">
          Choose Your Investigation Path
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
  <GlassCard
    title="Social Media Investigation Tools"
    description="Access our cutting-edge tools designed specifically for investigating social media platforms. "
    buttonText="Explore Social Media Tools"
    buttonLink="/services"
  />
  <GlassCard
    title="OSINT Tools"
    description="Utilize Open Source Intelligence (OSINT) tools to gather and analyze publicly available information. "
    buttonText="Discover OSINT Tools"
    buttonLink="/osint"
  />
  <GlassCard
    title="Profile Analysis"
    description="Analyze social media profiles with advanced tools. Gain insights into user activity, engagement, and follower growth."
    buttonText="Start Profile Analysis"
    buttonLink="/profileAnalysis"
  />
</div>

      </div>
    </div>
  );
};

export default ServicesMain;