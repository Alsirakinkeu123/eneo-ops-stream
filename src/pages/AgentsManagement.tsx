// ENEO Operations Hub - Gestion des Agents
// Page complète pour la gestion et supervision des agents

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';
import { toast } from '../hooks/use-toast';

import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Activity,
  User,
  Settings
} from 'lucide-react';

const AgentsManagement: React.FC = () => {
  const { agents, setAgents, loadingAgents, setLoadingAgents } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');

  // Chargement des agents
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoadingAgents(true);
        const agentsData = await api.agents.getAll();
        setAgents(agentsData);
      } catch (error) {
        console.error('Error loading agents:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les agents.",
          variant: "destructive",
        });
      } finally {
        setLoadingAgents(false);
      }
    };

    loadAgents();
  }, []);

  // Filtrage des agents
  const filteredAgents = React.useMemo(() => {
    let filtered = agents;

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.phone.includes(searchTerm)
      );
    }

    return filtered.sort((a, b) => {
      // En ligne d'abord, puis par nom
      if (a.status === 'online' && b.status === 'offline') return -1;
      if (a.status === 'offline' && b.status === 'online') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [agents, statusFilter, searchTerm]);

  // Statistiques
  const onlineAgents = agents.filter(a => a.status === 'online').length;
  const offlineAgents = agents.filter(a => a.status === 'offline').length;
  const totalInterventions = agents.reduce((sum, a) => sum + (a.assignedInterventions?.length || 0), 0);

  // Fonction utilitaires
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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

  // Composant Carte Agent
  const AgentCard: React.FC<{ agent: any; index: number }> = ({ agent, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="hover-lift transition-eneo">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar avec statut */}
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`/api/avatars/${agent.id}`} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {getInitials(agent.name)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                agent.status === 'online' ? 'agent-online' : 'agent-offline'
              }`} />
            </div>

            {/* Informations */}
            <div className="flex-1 space-y-3">
              {/* Nom et statut */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{agent.name}</h3>
                <Badge 
                  variant={agent.status === 'online' ? 'default' : 'secondary'}
                  className={
                    agent.status === 'online' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }
                >
                  {agent.status === 'online' ? 'En ligne' : 'Hors ligne'}
                </Badge>
              </div>

              {/* Contact */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{agent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{agent.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{getLastSeenText(agent.lastSeenAt)}</span>
                </div>
              </div>

              {/* Interventions et actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  {agent.assignedInterventions && agent.assignedInterventions.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {agent.assignedInterventions.length} intervention(s)
                    </Badge>
                  )}
                  {agent.latitude && agent.longitude && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      Géolocalisé
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-1" />
                    Détails
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Gestion des Agents
              </h1>
              <p className="text-muted-foreground">
                Supervision et management de l'équipe terrain
              </p>
            </div>
            
            <Button className="gradient-primary">
              <User className="h-4 w-4 mr-2" />
              Nouvel Agent
            </Button>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{onlineAgents}</p>
                  <p className="text-xs text-muted-foreground">Agents en ligne</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">{offlineAgents}</p>
                  <p className="text-xs text-muted-foreground">Agents hors ligne</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{totalInterventions}</p>
                  <p className="text-xs text-muted-foreground">Interventions assignées</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{agents.length}</p>
                  <p className="text-xs text-muted-foreground">Total agents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Recherche */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un agent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtre statut */}
                <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <TabsList>
                    <TabsTrigger value="all">Tous</TabsTrigger>
                    <TabsTrigger value="online">En ligne</TabsTrigger>
                    <TabsTrigger value="offline">Hors ligne</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Liste des agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {loadingAgents ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Chargement des agents...</p>
              </CardContent>
            </Card>
          ) : filteredAgents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun agent trouvé</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAgents.map((agent, index) => (
                <AgentCard key={agent.id} agent={agent} index={index} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AgentsManagement;