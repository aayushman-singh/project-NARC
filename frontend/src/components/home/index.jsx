import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Card = ({ icon, title, children }) => (
  <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-20 rounded-xl p-6 flex flex-col items-center">
    {icon}
    <h3 className="text-2xl font-semibold mb-4 text-white">{title}</h3>
    <p className="text-gray-300 text-center">{children}</p>
  </div>
);

// const GlassButton = ({ to, children }) => (
//   <Link
//     to={to}
//     smooth={true}
//     duration={500}
//     className="mt-8 inline-block px-8 py-4 text-lg font-semibold bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-20 rounded-full text-white hover:bg-opacity-20 transition-all"
//   >
//     {children}
//   </Link>
// );

const ShieldIcon = () => (
  <svg
    className="w-16 h-16 mb-4 text-blue-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="w-16 h-16 mb-4 text-blue-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const FileTextIcon = () => (
  <svg
    className="w-16 h-16 mb-4 text-blue-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
const InstagramIcon = () => (
  <svg
    className="w-16 h-16 mb-4 text-blue-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const MessageIcon = () => (
  <svg
    className="w-16 h-16 mb-4 text-blue-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const CrossPlatformIcon = () => (
  <svg
    className="w-16 h-16 mb-4 text-blue-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Desktop */}
    <rect x="2" y="5" width="8" height="6" rx="1" />
    <line x1="2" y1="11" x2="10" y2="11" strokeWidth="2" />
    <path d="M2 13h8v1H2z" />

    {/* Tablet */}
    <rect x="14" y="3" width="6" height="9" rx="1" />
    <path d="M16 10h2" strokeWidth="2" />

    {/* Mobile */}
    <rect x="18" y="12" width="4" height="8" rx="1" />
    <path d="M19 17h2" strokeWidth="2" />

    {/* Connecting Lines */}
    <line x1="10" y1="8" x2="14" y2="6" strokeWidth="2" />
    <line x1="10" y1="8" x2="18" y2="15" strokeWidth="2" />
  </svg>
);

// const GlassCard = ({ title, children }) => (
//   <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
//     {icon}
//     <h3 className="text-2xl font-semibold text-white mb-3">{title}</h3>
//     <p className="text-lg text-gray-300">{children}</p>
//   </div>
// );

const TeamMember = ({ name, role, description, image }) => (
  <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-4 border border-white border-opacity-20 text-center w-64">
    <div className="relative w-[102.04px] h-[160px] mx-auto mb-4">
      <img
        src={image}
        alt={`${name}'s profile`}
        className="absolute top-0 left-0 w-full h-full object-cover rounded-sm"
      />
    </div>
    <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
    <p className="text-sm text-blue-600 mb-2">{role}</p>
    <p className="text-sm text-blue-600">{description}</p>
  </div>
);

const typewriterEffect = (element, delay = 0.5, speed = 0.05) => {
  const text = element.innerHTML;
  element.innerHTML = "";
  let idx = 0;

  const type = () => {
    if (idx < text.length) {
      element.innerHTML += text.charAt(idx);
      idx++;
      setTimeout(type, speed * 1000);
    }
  };
  setTimeout(type, delay * 1000);
};

const Home = () => {
  useEffect(() => {
    gsap.from(".hero-title", {
      opacity: 0,
      y: -50,
      duration: 1.5,
      ease: "power4.out",
    });

    document.querySelectorAll(".typewriter").forEach((heading) => {
      typewriterEffect(heading, 1, 0.05);
    });

    gsap.utils.toArray(".section").forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "bottom 20%",
          scrub: true,
        },
      });
    });

    gsap.utils.toArray(".card").forEach((card) => {
      gsap.from(card, {
        opacity: 0,
        scale: 0.8,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          end: "bottom 50%",
          scrub: true,
        },
      });
    });
  }, []);

  return (
    <div className="relative text-white">
      <video
        className="fixed top-0 left-0 w-auto h-auto min-w-full min-h-full object-cover z-0"
        autoPlay
        loop
        muted
      >
        <source
          src="/videos/vecteezy_digital-spinning-hologram-globe-of-planet-earth_26687898.mp4"
          type="video/mp4"
        />
      </video>

      <div className="relative z-10">
        <section className="min-h-screen flex items-center justify-center px-4 relative">
          <div className="text-center hero-title">
            <h1 className="text-5xl sm:text-7xl font-bold bg-clip-text text-transparent text-white py-4">
              Welcome to tattletale
            </h1>
            <p className="text-xl sm:text-2xl text-gray-200 mt-4 max-w-3xl mx-auto">
              Streamline your social media investigations with tattletale.
            </p>
            <div className="text-center mt-8">
              <Link
                to="/servicesMain"
                className="inline-block px-7 py-3 text-lg font-semibold bg-blue-600 bg-opacity-70 rounded-full hover:bg-opacity-75 transition-all"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="min-h-screen flex flex-col justify-center items-center px-4 py-16 text-white"
        >
          <div className="container mx-auto">
            <h2 className="text-7xl font-bold mb-12 text-center">Who We Are</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card
                icon={<ShieldIcon />}
                title="Secure Investigation"
                className="card"
              >
                Our Social Media Investigator Tool is designed to enhance
                digital forensics in law enforcement investigations.
              </Card>
              <Card
                icon={<SearchIcon />}
                title="Comprehensive Analysis"
                className="card"
              >
                We offer seamless integration with major social media platforms,
                allowing investigators to automatically parse and analyze data.
              </Card>
              <Card
                icon={<FileTextIcon />}
                title="Automated Documentation"
                className="card"
              >
                Our mission is to streamline the documentation process in social
                media investigations.
              </Card>
            </div>
            <p className="text-lg text-gray-300 max-w-4xl mt-12 text-center mx-auto">
              Available in both Android and Windows versions, our tool ensures
              compatibility with various examination scenarios.
            </p>
          </div>
        </section>

        <section
          id="services"
          className="min-h-screen w-full flex items-center justify-center py-20"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-7xl font-bold text-center bg-clip-text text-transparent text-white mb-8">
              Our Services
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 mt-4 max-w-3xl mx-auto text-center mb-12">
              Our comprehensive services cover data scraping, tracking, and
              investigative reporting on major social media platforms.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card title="Instagram Investigation" icon={<InstagramIcon />}>
                Track hashtags, users, posts, and messages to uncover
                drug-related activities.
              </Card>
              <Card title="Application Monitoring" icon={<MessageIcon />}>
                Monitor messages, user profiles and media for any signs of
                illegal activity.
              </Card>
              <Card title="Cross-Platform Reports" icon={<CrossPlatformIcon />}>
                Generate detailed reports that combine evidence from multiple
                platforms.
              </Card>
            </div>
            <div className="text-center mt-12">
              <Link
                to="/servicesMain"
                className="inline-block px-7 py-3 text-lg font-semibold bg-blue-600 bg-opacity-70 rounded-full hover:bg-opacity-75 transition-all"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </section>

        <section
          id="team"
          className="min-h-screen flex flex-col justify-center items-center py-20"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-7xl font-bold text-center bg-clip-text text-transparent text-white mb-8">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-300 max-w-4xl text-center mx-auto mb-12">
              Our team consists of cybersecurity experts, data scientists, and
              investigators with years of experience in digital forensics.
            </p>
            <div className="flex gap-8">
              <TeamMember
                name="Aayushman "
                role="Developer (Backend)"
                image="/images/teamMembers/aayushman.jpeg"
              />
              <TeamMember
                name="Arpit "
                role="Developer (Frontend)"
                image="/images/teamMembers/arpit.jpeg"
              />
              <TeamMember
                name="Kartik"
                role="Developer (Frontend)"
                image="/images/teamMembers/kartik.jpeg"
              />
              <TeamMember
                name="Abdul "
                role="Developer (ML)"
                image="/images/teamMembers/abdul.jpeg"
              />
              <TeamMember
                name="Arpita"
                role="Designer and Content Manager"
                image="/images/teamMembers/arpita.jpeg"
              />
              <TeamMember
                name="Rishabh"
                role="Designer and Video Editor"
                image="/images/teamMembers/rishab.jpeg"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
