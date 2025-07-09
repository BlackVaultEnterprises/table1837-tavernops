import React, { useRef, useEffect } from 'react';
import { motion, useTransform, useScroll } from 'framer-motion';

interface ParallaxBackgroundProps {
  scrollPosition: number;
}

const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({ scrollPosition }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.3, 0.7]);
  const blur = useTransform(scrollYProgress, [0, 0.5], [3, 8]);

  useEffect(() => {
    const updateParallax = () => {
      if (!containerRef.current) return;
      
      const speed = 0.5;
      const yPos = -(scrollPosition * speed);
      
      containerRef.current.style.transform = `translateY(${yPos}px)`;
    };

    updateParallax();
  }, [scrollPosition]);

  return (
    <div className="parallax-background" ref={containerRef}>
      <motion.div 
        className="parallax-layer"
        style={{ y }}
      >
        <img 
          src="/images/restaurant-hero.jpg" 
          alt="Table 1837 Ambiance"
          className="ken-burns"
        />
        <motion.div 
          className="parallax-overlay"
          style={{ 
            opacity,
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
          }}
        />
      </motion.div>
      
      <div className="grain-overlay" />
    </div>
  );
};