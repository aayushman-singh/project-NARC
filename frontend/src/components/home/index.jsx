import React from 'react';
import { Link } from 'react-scroll';

const Card = ({ icon, title, children }) => (
  <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-20 rounded-xl p-6 flex flex-col items-center">
    {icon}
    <h3 className="text-2xl font-semibold mb-4 text-white">{title}</h3>
    <p className="text-gray-300 text-center">{children}</p>
  </div>
);

const GlassButton = ({ to, children }) => (
  <Link
    to={to}
    smooth={true}
    duration={500}
    className="mt-8 inline-block px-8 py-4 text-lg font-semibold bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-20 rounded-full text-white hover:bg-opacity-20 transition-all"
  >
    {children}
  </Link>
);

// Custom Icon components
const ShieldIcon = () => (
  <svg className="w-16 h-16 mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-16 h-16 mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const GlassCard = ({ title, children }) => (
  <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
    <h3 className="text-2xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-lg text-gray-300">{children}</p>
  </div>
);

const TeamMember = ({ name, role, description }) => (
  <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 text-center">
    <h3 className="text-2xl font-semibold text-white mb-2">{name}</h3>
    <p className="text-lg text-blue-400 mb-2">{role}</p>
    <p className="text-gray-300">{description}</p>
  </div>
);

const FileTextIcon = () => (
  <svg className="w-16 h-16 mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const Home = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white min-h-screen">
      {/* Section 1: Home */}
      <section className="h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-20 text-center">
          <h1 className="text-5xl sm:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 py-4">
            Welcome to Tattletale
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mt-4 max-w-3xl mx-auto">
            Streamline your social media investigations with our automated parsing and documentation tool.
          </p>
          <GlassButton to="about">
            Learn More
          </GlassButton>
        </div>
      </section>

      {/* Section 2: About */}
      <section id="about" className="min-h-screen flex flex-col justify-center items-center px-4 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto z-10">
          <h2 className="text-5xl font-bold mb-12 text-center">Who We Are</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card icon={<ShieldIcon />} title="Secure Investigation">
              Our Social Media Investigator Tool is designed to enhance digital forensics in law enforcement investigations. We provide a secure, automated solution for examining social media accounts across various platforms.
            </Card>
            <Card icon={<SearchIcon />} title="Comprehensive Analysis">
              We offer seamless integration with major social media platforms, allowing investigators to automatically parse and analyze data from posts, messages, timelines, friend lists, and more. Our tool minimizes human error and enhances the efficiency of digital investigations.
            </Card>
            <Card icon={<FileTextIcon />} title="Automated Documentation">
              Our mission is to streamline the documentation process in social media investigations. We provide automated screenshot capture and report generation, ensuring that all gathered evidence is properly documented and can withstand legal scrutiny.
            </Card>
          </div>
          <p className="text-lg text-gray-300 max-w-4xl mt-12 text-center mx-auto">
            Available in both Android and Windows versions, our tool ensures compatibility with various examination scenarios. Whether you're investigating on a desktop or need to access accounts that only open on mobile devices, we've got you covered.
          </p>
        </div>
      </section>

      {/* Section 3: Services */}
      <section id="services" className="min-h-screen w-full flex items-center justify-center relative py-20">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-20 container mx-auto px-4">
          <h2 className="text-5xl sm:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-8">
            Our Services
          </h2>
          <p className="text-xl sm:text-2xl text-gray-300 mt-4 max-w-3xl mx-auto text-center mb-12">
            Our comprehensive services cover data scraping, tracking, and investigative reporting on major social media platforms. We ensure that even the most discreet activities leave a trail that can be analyzed, tracked, and documented.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassCard title="Instagram Investigation">
              Track hashtags, users, posts, and messages to uncover drug-related activities. Receive comprehensive reports with captured screenshots and analysis.
            </GlassCard>
            <GlassCard title="Telegram & WhatsApp Monitoring">
              Monitor messages, user profiles, group activities, and media for any signs of illegal activity. Automatically parse, document, and report suspicious behavior in real-time.
            </GlassCard>
            <GlassCard title="Cross-Platform Reports">
              Generate detailed reports that combine evidence from multiple platforms, offering a holistic view of an individual's online activities.
            </GlassCard>
          </div>
          <div className="text-center mt-12">
            <a
              href="/services"
              className="inline-block px-8 py-4 text-lg font-semibold bg-blue-600 bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all"
            >
              Explore Services
            </a>
          </div>
        </div>
      </section>

      {/* Section 4: Team */}
      <section id="team" className="min-h-screen flex flex-col justify-center items-center relative py-20">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-20 container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-8">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-300 max-w-4xl text-center mx-auto mb-12">
            Our team consists of cybersecurity experts, data scientists, and investigators with years of experience in digital forensics. They are committed to ensuring that Tattletale remains the top choice for online crime investigations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
