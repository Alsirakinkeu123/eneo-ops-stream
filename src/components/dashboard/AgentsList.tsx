// ENEO Operations Hub - Liste des Agents
// Composant pour afficher les agents et leurs statuts

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Users, Mail, Phone, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Agent } from '../../types';

const AgentsList: React.FC = () => {
  const { agents, loadingAgents } = useAppStore();

  // Tri des agents: en ligne d'abord, puis par nom
  const sortedAgents = React.useMemo(() => {
    return [...agents].sort((a, b) => {
      // Priorité aux agents en ligne
      if (a.status === 'online' && b.status === 'offline') return -1;
      if (a.status === 'offline' && b.status === 'online') return 1;
      // Puis tri alphabétique par nom
      return a.name.localeCompare(b.name);
    });
  }, [agents]);

  // Statistiques
  const onlineAgents = agents.filter(a => a.status === 'online').length;
  const offlineAgents = agents.filter(a => a.status === 'offline').length;

  // Composant pour un agent
  const AgentItem: React.FC<{ agent: Agent; index: number }> = ({ agent, index }) => {
    // Calcul du temps écoulé depuis la dernière connexion
    const getLastSeenText = (lastSeenAt: string) => {
      const diff = Date.now() - new Date(lastSeenAt).getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 1) return 'À l\'instant';
      if (minutes < 60) return `Il y a ${minutes}min`;
      if (hours < 24) return `Il y a ${hours}h`;
      return `Il y a ${days}j`;
    };

    // Génération des initiales pour l'avatar
    const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-eneo">
          {/* Avatar avec indicateur de statut */}
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`/api/avatars/${agent.id}`} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(agent.name)}
              </AvatarFallback>
            </Avatar>
            
            {/* Indicateur de statut */}
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              agent.status === 'online' ? 'agent-online' : 'agent-offline'
            }`} />
          </div>

          {/* Informations agent */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground truncate">
                {agent.name}
              </p>
              <Badge 
                variant={agent.status === 'online' ? 'default' : 'secondary'}
                className={`text-xs ${
                  agent.status === 'online' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {agent.status === 'online' ? 'En ligne' : 'Hors ligne'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate">{agent.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{agent.phone}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{getLastSeenText(agent.lastSeenAt)}</span>
              </div>
            </div>

            {/* Nombre d'interventions assignées */}
            {agent.assignedInterventions && agent.assignedInterventions.length > 0 && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {agent.assignedInterventions.length} intervention(s) assignée(s)
                </Badge>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="shadow-eneo-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Agents
          <div className="ml-auto flex gap-2">
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
              {onlineAgents} en ligne
            </Badge>
            <Badge variant="outline" className="text-xs">
              {offlineAgents} hors ligne
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {loadingAgents ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Chargement...</div>
            </div>
          ) : agents.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Aucun agent trouvé</div>
            </div>
          ) : (
            sortedAgents.map((agent, index) => (
              <AgentItem key={agent.id} agent={agent} index={index} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentsList;