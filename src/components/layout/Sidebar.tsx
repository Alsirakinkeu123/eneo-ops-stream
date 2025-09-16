// ENEO Operations Hub - Sidebar Component
// Navigation principale avec logo ENEO et menu

import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Map, 
  Settings, 
  Users, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar, interventions, agents } = useAppStore();

  // Calcul des statistiques pour les badges
  const pendingInterventions = interventions.filter(i => i.status === 'pending').length;
  const inProgressInterventions = interventions.filter(i => i.status === 'in-progress').length;
  const onlineAgents = agents.filter(a => a.status === 'online').length;

  const menuItems = [
    {
      icon: Map,
      label: 'Carte & Interventions',
      path: '/',
      badge: pendingInterventions + inProgressInterventions,
    },
    {
      icon: Users,
      label: 'Gestion Agents',
      path: '/agents',
      badge: onlineAgents,
    },
    {
      icon: Activity,
      label: 'Statistiques',
      path: '/statistics',
    },
    {
      icon: Settings,
      label: 'Paramètres',
      path: '/settings',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    // Fermer la sidebar sur mobile après navigation
    if (window.innerWidth < 1024 && !sidebarCollapsed) {
      toggleSidebar();
    }
  };

  return (
    <motion.aside
      className="bg-card border-r border-border shadow-lg h-screen"
      initial={{ width: sidebarCollapsed ? 80 : 280 }}
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="h-full flex flex-col">
        {/* Header avec Logo ENEO */}
        <div className="p-6 border-b border-border">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-bold text-primary">ENEO</h2>
                <p className="text-xs text-muted-foreground">Operations Hub</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <Button
                    variant={location.pathname === item.path ? "default" : "ghost"}
                    size="lg"
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full justify-start gap-3 transition-eneo ${
                      sidebarCollapsed ? 'px-3' : 'px-4'
                    } ${location.pathname === item.path ? 'gradient-primary text-white shadow-md' : 'hover:bg-secondary'}`}
                  >
                    <Icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : ''}`} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge 
                            variant={location.pathname === item.path ? "secondary" : "outline"} 
                            className="ml-auto text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            className="w-full transition-eneo hover:bg-primary hover:text-white"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Réduire
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;