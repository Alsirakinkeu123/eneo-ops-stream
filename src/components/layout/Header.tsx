// ENEO Operations Hub - Header Component
// Header avec titre, indicateurs de statut et actions

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Menu, Wifi, WifiOff, Users, MapPin } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const Header: React.FC = () => {
  const { 
    toggleSidebar, 
    interventions, 
    agents, 
    websocketConnected,
    loadingInterventions,
    loadingAgents 
  } = useAppStore();

  // Calcul des statistiques
  const activeInterventions = interventions.filter(i => 
    i.status === 'pending' || i.status === 'in-progress'
  ).length;
  
  const onlineAgents = agents.filter(a => a.status === 'online').length;

  return (
    <motion.header 
      className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            ENEO Operations Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Supervision et gestion des interventions
          </p>
        </div>
      </div>

      {/* Right Section - Status Indicators */}
      <div className="flex items-center gap-4">
        {/* Interventions Actives */}
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <MapPin className="h-4 w-4 text-primary" />
          <Badge variant="secondary" className="font-medium">
            {loadingInterventions ? '...' : activeInterventions} interventions actives
          </Badge>
        </motion.div>

        {/* Agents En Ligne */}
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <Users className="h-4 w-4 text-success" />
          <Badge variant="outline" className="font-medium">
            {loadingAgents ? '...' : onlineAgents} agents en ligne
          </Badge>
        </motion.div>

        {/* Statut WebSocket */}
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          {websocketConnected ? (
            <>
              <Wifi className="h-4 w-4 text-success" />
              <Badge variant="outline" className="text-success border-success">
                Connecté
              </Badge>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-error" />
              <Badge variant="outline" className="text-error border-error">
                Déconnecté
              </Badge>
            </>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;