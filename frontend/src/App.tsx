import React, { useState } from 'react';
import './styles/global.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'wine', label: 'Wine List' },
    { id: 'cocktails', label: 'Cocktails' },
    { id: 'happy-hour', label: 'Happy Hour' },
    { id: 'events', label: 'Events' },
    { id: 'reservations', label: 'Reservations' },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">Table 1837</h1>
          <nav className="navigation">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        {activeTab === 'home' && (
          <div className="hero-section">
            <h2 className="hero-title">Table 1837 Tavern</h2>
            <p className="hero-subtitle">Glen Rock, PA</p>
            <p className="hero-description">Premium dining experience in a historic setting</p>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="content-section">
            <h2>Our Menu</h2>
            <p>Seasonal dishes crafted with local ingredients.</p>
          </div>
        )}

        {activeTab === 'wine' && (
          <div className="content-section">
            <h2>Wine Selection</h2>
            <p>Curated wines from around the world.</p>
          </div>
        )}

        {activeTab === 'cocktails' && (
          <div className="content-section">
            <h2>Signature Cocktails</h2>
            <p>Handcrafted cocktails by our expert mixologists.</p>
          </div>
        )}

        {activeTab === 'happy-hour' && (
          <div className="content-section">
            <h2>Happy Hour Specials</h2>
            <p>Join us Tuesday-Friday, 4-6 PM</p>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="content-section">
            <h2>Private Events</h2>
            <p>Host your special occasion with us.</p>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="content-section">
            <h2>Book a Table</h2>
            <p>Reserve your table online or call us at (717) 555-1837</p>
          </div>
        )}

        <section className="info-section">
          <div className="hours">
            <h3>Hours</h3>
            <p>Tuesday - Thursday: 4:00 PM - 10:00 PM</p>
            <p>Friday - Saturday: 4:00 PM - 11:00 PM</p>
            <p>Sunday: 11:00 AM - 9:00 PM</p>
          </div>
          <div className="contact">
            <h3>Contact</h3>
            <p>123 Main Street</p>
            <p>Glen Rock, PA 17327</p>
            <p>(717) 555-1837</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2024 Table 1837 Tavern. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;