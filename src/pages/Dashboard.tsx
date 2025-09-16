// ENEO Operations Hub - Page Dashboard Principale
// Page principale avec carte, listes et panneaux de détails

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';
import { toast } from '../hooks/use-toast';

import DashboardLayout from '../components/layout/DashboardLayout';
import GoogleMapsContainer from '../components/map/GoogleMapsContainer';
import InterventionsList from '../components/dashboard/InterventionsList';
import AgentsList from '../components/dashboard/AgentsList';
import DetailsPanel from '../components/dashboard/DetailsPanel';

const Dashboard: React.FC = () => {
  const {
    setInterventions,
    setAgents,
    setLoadingInterventions,
    setLoadingAgents,
    detailsPanelOpen,
  } = useAppStore();

  // Chargement initial des données
  const loadInitialData = async () => {
    try {
      // Chargement des interventions
      setLoadingInterventions(true);
      const interventions = await api.interventions.getAll();
      setInterventions(interventions);
      
      // Chargement des agents
      setLoadingAgents(true);
      const agents = await api.agents.getAll();
      setAgents(agents);
      
      toast({
        title: "Données chargées",
        description: `${interventions.length} interventions et ${agents.length} agents chargés.`,
      });
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setLoadingInterventions(false);
      setLoadingAgents(false);
    }
  };

  // Rafraîchissement automatique toutes les 20 secondes
  useEffect(() => {
    loadInitialData();

    const interval = setInterval(() => {
      loadInitialData();
    }, 20000); // 20 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="h-full grid grid-cols-12 gap-6">
        {/* Colonne Gauche - Listes */}
        <motion.div 
          className="col-span-3 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <InterventionsList />
          <AgentsList />
        </motion.div>

        {/* Colonne Centrale - Carte */}
        <motion.div 
          className={`${detailsPanelOpen ? 'col-span-6' : 'col-span-9'} transition-all duration-300`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="h-full min-h-[600px] bg-card rounded-xl border border-border shadow-eneo-md overflow-hidden">
            <GoogleMapsContainer />
          </div>
        </motion.div>

        {/* Colonne Droite - Panneau de Détails */}
        {detailsPanelOpen && (
          <motion.div 
            className="col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <DetailsPanel />
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;