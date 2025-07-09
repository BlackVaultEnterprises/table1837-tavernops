import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
  scrollPosition: number;
}

/**
 * Hero component matching Table 1837's aesthetic
 * Features parallax scrolling and glassmorphic overlays
 */
const Hero: React.FC<HeroProps> = ({ scrollPosition }) => {
  const parallaxOffset = scrollPosition * 0.5;
  
  return (
    <section className="hero">
      <motion.div 
        className="hero-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        style={{
          transform: `translateY(${parallaxOffset}px)`,
        }}
      >
        <div className="hero-text">
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Table 1837
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Glen Rock, PA
          </motion.p>
          
          <motion.p 
            className="hero-tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Country Elegance • Exceptional Cuisine • Timeless Experience
          </motion.p>
          
          <motion.div 
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <button className="magnetic-button hero-cta">
              <span>Make a Reservation</span>
            </button>
            <button className="magnetic-button hero-cta-secondary">
              <span>View Menu</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
      
      <div className="hero-overlay" />
    </section>
  );
};

export default Hero;