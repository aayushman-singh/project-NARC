import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CursorFollower = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    // GSAP animation to smoothly follow the cursor
    const handleMouseMove = (e) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.2, // Controls the smoothness of the animation
        ease: 'power2.out',
      });
    };

    // Add event listener for mouse movement
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup event listener when component unmounts
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-5 h-5 bg-black rounded-full pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2"
    ></div>
  );
};

export default CursorFollower;
