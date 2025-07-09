import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navigation from './components/layout/Navigation';
import Hero from './components/layout/Hero';
import ParallaxBackground from './components/layout/ParallaxBackground';
import TabContent from './components/layout/TabContent';
import { useScrollPosition } from './hooks/useScrollPosition';
import './styles/design-tokens.css';
import './styles/glassmorphic.css';
import './styles/global.css';

interface Tab {
  id: string;
  label: string;
  component: React.ComponentType;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const scrollPosition = useScrollPosition();

  const tabs: Tab[] = [
    { id: 'home', label: 'Home', component: () => <div>Home Content</div> },
    { id: 'menu', label: 'Menu', component: () => <div>Menu Content</div> },
    { id: 'wine', label: 'Wine List', component: () => <div>Wine List</div> },
    { id: 'cocktails', label: 'Cocktails', component: () => <div>Signature Cocktails</div> },
    { id: 'happy-hour', label: 'Happy Hour', component: () => <div>Happy Hour Specials</div> },
    { id: 'events', label: 'Events', component: () => <div>Private Events</div> },
    { id: 'reservations', label: 'Reservations', component: () => <div>Book a Table</div> },
  ];

  useEffect(() => {
    // Preload fonts and critical assets
    Promise.all([
      document.fonts.load('400 1em Balthazar'),
      document.fonts.load('400 1em Roboto'),
      document.fonts.load('400 1em Cinzel'),
    ]).then(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <img src="/logo.svg" alt="Table 1837" />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <ParallaxBackground scrollPosition={scrollPosition} />
      
      <Navigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        scrollPosition={scrollPosition}
      />
      
      <Hero scrollPosition={scrollPosition} />
      
      <main className="main-content">
        <AnimatePresence mode="wait">
          <TabContent
            key={activeTab}
            activeTab={activeTab}
            tabs={tabs}
          />
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;