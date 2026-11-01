import { useState, useEffect } from 'react';
import { LayoutContext } from './LayoutContext';

export function LayoutProvider({ children }) {
  // Collapsed desktop state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('vault_sidebar_collapsed') === 'true';
  });

  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('vault_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  // Close mobile drawer on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <LayoutContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleSidebar,
        isMobileOpen,
        setIsMobileOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

