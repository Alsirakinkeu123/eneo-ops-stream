// ENEO Operations Hub - Liste des Interventions
// Composant pour afficher et filtrer les interventions

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Search, MapPin, Clock, User, Phone } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Intervention, InterventionStatus } from '../../types';

const InterventionsList: React.FC = () => {
  const {
    interventions,
    interventionFilter,
    setInterventionFilter,
    setSelectedIntervention,
    selectedIntervention,
    loadingInterventions,
  } = useAppStore();

  const [searchTerm, setSearchTerm] = React.useState('');

  // Filtrage des interventions
  const filteredInterventions = React.useMemo(() => {
    let filtered = interventions;

    // Filtre par statut
    if (interventionFilter !== 'all') {
      filtered = filtered.filter(i => i.status === interventionFilter);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(i =>
        i.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.problemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.id.toString().includes(searchTerm)
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [interventions, interventionFilter, searchTerm]);

  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatusColor = (status: InterventionStatus) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: InterventionStatus) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in-progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  // Composant pour une intervention
  const InterventionItem: React.FC<{ intervention: Intervention; index: number }> = ({ intervention, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className={`cursor-pointer transition-eneo hover-lift ${
          selectedIntervention?.id === intervention.id
            ? 'border-primary shadow-eneo-md bg-primary/5'
            : 'hover:shadow-eneo-sm'
        }`}
        onClick={() => setSelectedIntervention(intervention)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header avec ID et statut */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">#{intervention.id}</span>
              </div>
              <Badge className={`text-xs ${getStatusColor(intervention.status)}`}>
                {getStatusLabel(intervention.status)}
              </Badge>
            </div>

            {/* Informations client */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium">{intervention.clientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{intervention.clientPhone}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-2">
              {intervention.problemDescription}
            </p>

            {/* Date et agents assignés */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(intervention.createdAt).toLocaleDateString('fr-FR')}
              </div>
              {intervention.assignedAgents && intervention.assignedAgents.length > 0 && (
                <span className="text-success">
                  {intervention.assignedAgents.length} agent(s)
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Card className="h-fit shadow-eneo-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Interventions
          <Badge variant="outline" className="ml-auto">
            {loadingInterventions ? '...' : filteredInterventions.length}
          </Badge>
        </CardTitle>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une intervention..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Filtres par statut */}
        <Tabs value={interventionFilter} onValueChange={(value) => setInterventionFilter(value as InterventionStatus | 'all')}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all" className="text-xs">Toutes</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">En attente</TabsTrigger>
            <TabsTrigger value="in-progress" className="text-xs">En cours</TabsTrigger>
          </TabsList>

          <TabsContent value={interventionFilter} className="mt-0">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loadingInterventions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Chargement...</div>
                </div>
              ) : filteredInterventions.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Aucune intervention trouvée</div>
                </div>
              ) : (
                filteredInterventions.map((intervention, index) => (
                  <InterventionItem
                    key={intervention.id}
                    intervention={intervention}
                    index={index}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InterventionsList;