import React, { useState } from 'react';
import './style.css'; // Import your CSS file

// Font Awesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

// Import images
import backgroundImage1 from './Background 1.jpg';
import backgroundImage2 from './Background 2.jpg';
import backgroundImage3 from './Background 3.jpg';
import backgroundImage4 from './Background 5.jpg';
import backgroundImage5 from './SIH Flowchart 4.png';

const Home = () => {
  const [items, setItems] = useState([
    {
      backgroundImage: `url(${backgroundImage4})`,
      name: 'OUR TEAM',
      description: 'Meet our Team.',
      link: '#',
      buttonLabel: 'See More',
    },
    {
      backgroundImage: `url(${backgroundImage1})`,
      name: 'Cipher Edgers',
      description: '"Happy to have you, let’s get started!"',
      link: '',
      buttonLabel: 'See More',
    },
    {
      backgroundImage: `url(${backgroundImage2})`,
      name: 'WHO WE ARE?',
      description: 'We Identify users behind drug trafficking on messaging platforms like Telegram, WhatsApp, etc.',
      buttonLabel: 'See More',
    },
    {
      backgroundImage: `url(${backgroundImage3})`,
      name: 'SERVICES',
      link: '/services',
      description: 'Checkout our services!',
      buttonLabel: 'See More',
    },
    {
      backgroundImage: `url(${backgroundImage5})`,
    },
  ]);

  const handleNext = () => {
    setItems((prevItems) => [...prevItems.slice(1), prevItems[0]]);
  };

  const handlePrev = () => {
    setItems((prevItems) => [prevItems[prevItems.length - 1], ...prevItems.slice(0, -1)]);
  };

  return (
    <div className="container">
      <div className="slide">
        {items.map((item, index) => (
          <div
            key={index}
            className="item"
            style={{ backgroundImage: item.backgroundImage }}
          >
            <div className="content">
              {item.name && <div className="name">{item.name}</div>}
              {item.description && <div className="des">{item.description}</div>}
              {item.buttonLabel && (
                <button>
                  {item.link ? <a href={item.link}>{item.buttonLabel}</a> : item.buttonLabel}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="button">
        <button className="prev" onClick={handlePrev}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button className="next" onClick={handleNext}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  );
};

export default Home;
