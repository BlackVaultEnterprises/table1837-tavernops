import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navigation from './components/layout/Navigation';
import Hero from './components/layout/Hero';
import ParallaxBackground from './components/layout/ParallaxBackground';
import TabContent from './components/layout/TabContent';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthWrapper } from './components/auth/AuthWrapper';
import { useScrollPosition } from './hooks/useScrollPosition';
import { useUser } from '@clerk/clerk-react';
import { pusherService } from './services/pusher';
import './styles/design-tokens.css';
import './styles/glassmorphic.css';
import './styles/global.css';

interface Tab {
  id: string;
  label: string;
  component: React.ComponentType;
}

/**
 * Main application component for Table 1837 Tavern
 * Implements glassmorphic design with parallax effects
 */
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [fontLoadError, setFontLoadError] = useState(false);
  const scrollPosition = useScrollPosition();
  const { user } = useUser();
  
  // Determine if user needs authentication for certain features
  const requiresAuth = ['reservations', 'staff'].includes(activeTab);

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
    // Initialize Pusher service
    pusherService.initialize();
    
    // Preload fonts and critical assets with proper error handling
    const loadFonts = async () => {
      try {
        await Promise.all([
          document.fonts.load('400 1em Balthazar'),
          document.fonts.load('400 1em Roboto'),
          document.fonts.load('400 1em Cinzel'),
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load fonts:', error);
        setFontLoadError(true);
        // Continue loading even if fonts fail
        setIsLoading(false);
      }
    };

    loadFonts();
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
    <ErrorBoundary>
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
        
        {fontLoadError && (
          <div className="font-load-warning" style={{ display: 'none' }}>
            {/* Hidden warning for monitoring */}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;