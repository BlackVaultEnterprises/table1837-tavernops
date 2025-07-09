import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassmorphicCard } from '../ui/GlassmorphicCard';

interface NavigationProps {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  scrollPosition: number;
}

const Navigation: React.FC<NavigationProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  scrollPosition 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  useEffect(() => {
    setIsScrolled(scrollPosition > 50);
  }, [scrollPosition]);

  return (
    <motion.nav 
      className={`navigation ${isScrolled ? 'navigation--scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="navigation__container">
        <motion.div 
          className="navigation__logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src="/logo.svg" alt="Table 1837" />
          <span className="navigation__location">Glen Rock</span>
        </motion.div>

        <div className="navigation__tabs">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              className={`navigation__tab ${activeTab === tab.id ? 'navigation__tab--active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              onHoverStart={() => setHoveredTab(tab.id)}
              onHoverEnd={() => setHoveredTab(null)}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <span>{tab.label}</span>
              <AnimatePresence>
                {(activeTab === tab.id || hoveredTab === tab.id) && (
                  <motion.div
                    className="navigation__tab-indicator"
                    layoutId="tab-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        <div className="navigation__actions">
          <motion.button 
            className="magnetic-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Reserve Table</span>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};