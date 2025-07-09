import React from 'react';
import { SignIn, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

interface AuthWrapperProps {
  children: React.ReactNode;
}

/**
 * Authentication wrapper component using Clerk
 * Handles sign-in and role-based access
 */
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, isLoaded } = useUser();

  // Show loading while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <img src="/logo.svg" alt="Table 1837" />
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <div className="auth-screen">
          <motion.div 
            className="auth-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="auth-title">Table 1837 Tavern</h1>
            <p className="auth-subtitle">Staff Portal</p>
            <div className="auth-box">
              <SignIn 
                appearance={{
                  elements: {
                    rootBox: "auth-clerk-root",
                    card: "auth-clerk-card",
                    headerTitle: "auth-clerk-title",
                    primaryButton: "magnetic-button",
                    formFieldInput: "auth-input",
                  },
                  variables: {
                    colorPrimary: "#d1a054",
                    colorBackground: "rgba(0, 0, 0, 0.8)",
                    colorText: "#ffffff",
                    colorInputBackground: "rgba(255, 255, 255, 0.05)",
                    colorInputText: "#ffffff",
                    borderRadius: "0.5rem",
                  }
                }}
              />
            </div>
          </motion.div>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="app-authenticated">
          <div className="user-menu">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "user-avatar",
                  userButtonTrigger: "user-button-trigger",
                },
                variables: {
                  colorPrimary: "#d1a054",
                }
              }}
            />
            {user && (
              <span className="user-info">
                {user.firstName || user.username || 'Staff'}
                <span className="user-role">
                  {user.publicMetadata?.role || 'Server'}
                </span>
              </span>
            )}
          </div>
          {children}
        </div>
      </SignedIn>
    </>
  );
};