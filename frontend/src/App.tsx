import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './components/layout/Navigation';
import Hero from './components/layout/Hero';
import ParallaxBackground from './components/layout/ParallaxBackground';
import TabContent from './components/layout/TabContent';
import ErrorBoundary from './components/ErrorBoundary';
import EightySixList from './components/staff/EightySixList';
import DynamicChecklists from './components/staff/DynamicChecklists';
import PourCostCalculator from './components/admin/PourCostCalculator';
import CommandPalette from './components/ui/CommandPalette';
import { useScrollPosition } from './hooks/useScrollPosition';
import { pusherService } from './services/pusher';
import './styles/design-tokens.css';
import './styles/glassmorphic.css';
import './styles/global.css';

const queryClient = new QueryClient();

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZnVua3ktY2xhbS03Ni5jbGVyay5hY2NvdW50cy5kZXYk';

interface Tab {
  id: string;
  label: string;
  component: React.ComponentType;
  requiresAuth?: boolean;
  roles?: string[];
}

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home');
  const scrollPosition = useScrollPosition();
  
  const tabs: Tab[] = [
    { id: 'home', label: 'Home', component: () => <Hero /> },
    { id: 'menu', label: 'Menu', component: () => <div className="content-section"><h2>Our Menu</h2><p>Seasonal dishes crafted with local ingredients.</p></div> },
    { id: 'wine', label: 'Wine List', component: () => <div className="content-section"><h2>Wine Selection</h2><p>Curated wines from around the world.</p></div> },
    { id: 'cocktails', label: 'Cocktails', component: () => <div className="content-section"><h2>Signature Cocktails</h2><p>Handcrafted cocktails by our expert mixologists.</p></div> },
    { id: 'happy-hour', label: 'Happy Hour', component: () => <div className="content-section"><h2>Happy Hour Specials</h2><p>Join us Tuesday-Friday, 4-6 PM</p></div> },
    { id: 'events', label: 'Events', component: () => <div className="content-section"><h2>Private Events</h2><p>Host your special occasion with us.</p></div> },
    { id: 'reservations', label: 'Reservations', component: () => <div className="content-section"><h2>Book a Table</h2><p>Reserve your table online or call us.</p></div> },
  ];

  return (
    <div className="app">
      <ParallaxBackground className={`scroll-${scrollPosition > 100 ? 'active' : 'inactive'}`} />
      <Navigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TabContent activeTab={activeTab} tabs={tabs} />
          </motion.div>
        </AnimatePresence>
      </main>
      {children}
    </div>
  );
};

const StaffDashboard: React.FC = () => {
  const { user } = useUser();
  
  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h1>Staff Dashboard</h1>
        <p>Welcome back, {user?.firstName || 'Team Member'}</p>
      </div>
      <div className="dashboard-grid">
        <EightySixList />
        <DynamicChecklists />
        {user?.publicMetadata?.role === 'manager' && <PourCostCalculator />}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    // Initialize Pusher for real-time features
    pusherService.initialize();
    
    // Command palette shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<PublicLayout><div /></PublicLayout>} />
              <Route path="/sign-in/*" element={<div className="auth-page"><SignIn routing="path" path="/sign-in" /></div>} />
              <Route path="/sign-up/*" element={<div className="auth-page"><SignUp routing="path" path="/sign-up" /></div>} />
              <Route path="/staff/*" element={<StaffDashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
          </ErrorBoundary>
        </Router>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default App;