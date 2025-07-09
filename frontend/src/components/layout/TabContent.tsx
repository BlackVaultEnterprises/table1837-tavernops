import React from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  component: React.ComponentType;
}

interface TabContentProps {
  activeTab: string;
  tabs: Tab[];
}

/**
 * TabContent component for seamless content transitions
 * Implements smooth animations between different sections
 */
const TabContent: React.FC<TabContentProps> = ({ activeTab, tabs }) => {
  const activeTabData = tabs.find(tab => tab.id === activeTab);
  
  if (!activeTabData) {
    return null;
  }
  
  const ActiveComponent = activeTabData.component;
  
  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="tab-content"
    >
      <ActiveComponent />
    </motion.div>
  );
};

export default TabContent;