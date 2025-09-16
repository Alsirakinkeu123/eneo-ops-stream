// ENEO Operations Hub - Layout Principal
// Layout avec Sidebar fixe et zone de contenu principale

import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen bg-background w-full flex">
      {/* Sidebar Fixe */}
      <Sidebar />
      
      {/* Zone de Contenu Principale */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />
        
        {/* Contenu Principal avec Animation */}
        <motion.main 
          className="flex-1 p-6 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;