// ENEO Operations Hub - Détails d'Intervention
// Onglet détails avec informations éditables

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { 
  Save, 
  Users, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Clock, 
  Edit3 
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';
import { toast } from '../../hooks/use-toast';
import { Intervention } from '../../types';

interface InterventionDetailsProps {
  intervention: Intervention;
}

const InterventionDetails: React.FC<InterventionDetailsProps> = ({ intervention }) => {
  const { agents, updateIntervention } = useAppStore();
  
  // États pour l'édition
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(intervention.problemDescription);
  const [editedLatitude, setEditedLatitude] = useState(intervention.latitude.toString());
  const [editedLongitude, setEditedLongitude] = useState(intervention.longitude.toString());
  const [isSaving, setIsSaving] = useState(false);
  
  // États pour l'assignation d'équipe
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAgentIds, setSelectedAgentIds] = useState<number[]>(
    intervention.assignedAgents?.map(a => a.id) || []
  );
  const [isAssigning, setIsAssigning] = useState(false);

  // Sauvegarde des modifications
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const updatedIntervention = await api.interventions.update(intervention.id, {
        problemDescription: editedDescription,
        latitude: parseFloat(editedLatitude),
        longitude: parseFloat(editedLongitude),
      });
      
      updateIntervention(updatedIntervention);
      setIsEditing(false);
      
      toast({
        title: "Modification sauvegardée",
        description: "Les détails de l'intervention ont été mis à jour.",
      });
    } catch (error) {
      console.error('Error updating intervention:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Assignation d'équipe
  const handleAssignTeam = async () => {
    try {
      setIsAssigning(true);
      
      await api.interventions.assignAgents(intervention.id, {
        agentIds: selectedAgentIds,
      });
      
      // Mise à jour locale de l'intervention
      const assignedAgents = agents.filter(a => selectedAgentIds.includes(a.id));
      const updatedIntervention = {
        ...intervention,
        assignedAgents,
      };
      updateIntervention(updatedIntervention);
      
      setIsAssignDialogOpen(false);
      
      toast({
        title: "Équipe assignée",
        description: `${selectedAgentIds.length} agent(s) assigné(s) à l'intervention.`,
      });
    } catch (error) {
      console.error('Error assigning agents:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'assigner l'équipe.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Clôture de l'intervention
  const handleResolveIntervention = async () => {
    try {
      await api.interventions.resolve(intervention.id);
      
      const updatedIntervention = {
        ...intervention,
        status: 'completed' as const,
        updatedAt: new Date().toISOString(),
      };
      updateIntervention(updatedIntervention);
      
      toast({
        title: "Intervention clôturée",
        description: "L'intervention a été marquée comme terminée.",
      });
    } catch (error) {
      console.error('Error resolving intervention:', error);
      toast({
        title: "Erreur",
        description: "Impossible de clôturer l'intervention.",
        variant: "destructive",
      });
    }
  };

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in-progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 space-y-4 h-full overflow-y-auto"
    >
      {/* Statut et Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Badge className={getStatusColor(intervention.status)}>
              {getStatusLabel(intervention.status)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? 'Annuler' : 'Modifier'}
            </Button>
          </div>

          {/* Informations client */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{intervention.clientPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Créé le {new Date(intervention.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Description du problème</h4>
          {isEditing ? (
            <Textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Description du problème..."
              className="min-h-[100px]"
            />
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {intervention.problemDescription}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Coordonnées */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Localisation
          </h4>
          {isEditing ? (
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editedLatitude}
                  onChange={(e) => setEditedLatitude(e.target.value)}
                  placeholder="Latitude"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={editedLongitude}
                  onChange={(e) => setEditedLongitude(e.target.value)}
                  placeholder="Longitude"
                />
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>Lat: {intervention.latitude.toFixed(6)}</p>
              <p>Lng: {intervention.longitude.toFixed(6)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agents assignés */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Équipe assignée
            </h4>
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Assigner
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assigner une équipe</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez les agents à assigner à cette intervention.
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {agents.map(agent => (
                      <div key={agent.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`agent-${agent.id}`}
                          checked={selectedAgentIds.includes(agent.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAgentIds([...selectedAgentIds, agent.id]);
                            } else {
                              setSelectedAgentIds(selectedAgentIds.filter(id => id !== agent.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`agent-${agent.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {agent.name}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            agent.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {agent.status === 'online' ? 'En ligne' : 'Hors ligne'}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAssignTeam} disabled={isAssigning}>
                      {isAssigning ? 'Assignation...' : `Assigner ${selectedAgentIds.length} agent(s)`}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {intervention.assignedAgents && intervention.assignedAgents.length > 0 ? (
            <div className="space-y-2">
              {intervention.assignedAgents.map(agent => (
                <div key={agent.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span>{agent.name}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {agent.status === 'online' ? 'En ligne' : 'Hors ligne'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun agent assigné</p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        {isEditing && (
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full gradient-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </Button>
        )}

        {intervention.status !== 'completed' && !isEditing && (
          <Button
            onClick={handleResolveIntervention}
            variant="outline"
            className="w-full border-success text-success hover:bg-success hover:text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Clôturer l'intervention
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default InterventionDetails;