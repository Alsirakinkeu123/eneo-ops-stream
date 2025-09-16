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
    <div className="min-h-screen bg-background w-full flex relative">
      {/* Overlay pour mobile quand sidebar ouverte */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => {}} // Sera géré par le store
        />
      )}
      
      {/* Sidebar avec gestion mobile */}
      <div className={`
        fixed lg:relative z-50 lg:z-auto
        ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        transition-transform duration-300 ease-in-out
        lg:transition-none
      `}>
        <Sidebar />
      </div>
      
      {/* Zone de Contenu Principale */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />
        
        {/* Contenu Principal avec Animation et Responsivité */}
        <motion.main 
          className="flex-1 p-3 sm:p-4 lg:p-6 overflow-hidden"
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