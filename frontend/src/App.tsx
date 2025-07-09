import React from 'react';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="hero-section">
        <h1 className="hero-title">Table 1837 Tavern</h1>
        <p className="hero-subtitle">Glen Rock, PA</p>
      </header>
      
      <main className="main-content">
        <section className="info-section">
          <h2>Premium Dining Experience</h2>
          <p>Experience the finest cuisine in a historic setting.</p>
        </section>
        
        <section className="hours-section">
          <h2>Hours</h2>
          <div className="hours-grid">
            <div className="hours-item">
              <span className="day">Tuesday - Thursday</span>
              <span className="time">4:00 PM - 10:00 PM</span>
            </div>
            <div className="hours-item">
              <span className="day">Friday - Saturday</span>
              <span className="time">4:00 PM - 11:00 PM</span>
            </div>
            <div className="hours-item">
              <span className="day">Sunday</span>
              <span className="time">11:00 AM - 9:00 PM</span>
            </div>
          </div>
        </section>
        
        <section className="contact-section">
          <h2>Contact</h2>
          <p>123 Main Street, Glen Rock, PA 17327</p>
          <p>(717) 555-1837</p>
        </section>
      </main>
      
      <footer className="footer">
        <p>&copy; 2024 Table 1837 Tavern. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;