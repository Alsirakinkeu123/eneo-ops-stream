// ENEO Operations Hub - Statistiques et Analytics
// Page de visualisation des données et métriques

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';

const Statistics: React.FC = () => {
  const { interventions, agents } = useAppStore();
  
  // Calcul des métriques
  const metrics = React.useMemo(() => {
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Interventions par statut
    const byStatus = {
      pending: interventions.filter(i => i.status === 'pending').length,
      inProgress: interventions.filter(i => i.status === 'in-progress').length,
      completed: interventions.filter(i => i.status === 'completed').length,
      cancelled: interventions.filter(i => i.status === 'cancelled').length,
    };

    // Interventions par période
    const thisWeekInterventions = interventions.filter(i => 
      new Date(i.createdAt) >= thisWeek
    ).length;

    const thisMonthInterventions = interventions.filter(i => 
      new Date(i.createdAt) >= thisMonth
    ).length;

    // Agents statistiques
    const onlineAgents = agents.filter(a => a.status === 'online').length;
    const totalAssignments = agents.reduce((sum, a) => sum + (a.assignedInterventions?.length || 0), 0);

    // Taux de résolution
    const completedCount = byStatus.completed;
    const totalCount = interventions.length;
    const resolutionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      byStatus,
      thisWeekInterventions,
      thisMonthInterventions,
      onlineAgents,
      totalAssignments,
      resolutionRate,
      totalInterventions: totalCount,
      totalAgents: agents.length,
    };
  }, [interventions, agents]);

  // Données pour les graphiques
  const statusData = [
    { name: 'En attente', value: metrics.byStatus.pending, color: '#f97316' },
    { name: 'En cours', value: metrics.byStatus.inProgress, color: '#1A73E8' },
    { name: 'Terminées', value: metrics.byStatus.completed, color: '#22C55E' },
    { name: 'Annulées', value: metrics.byStatus.cancelled, color: '#ef4444' },
  ];

  // Données temporelles (simulation)
  const timeData = [
    { name: 'Lun', interventions: 12, completed: 8 },
    { name: 'Mar', interventions: 19, completed: 15 },
    { name: 'Mer', interventions: 15, completed: 12 },
    { name: 'Jeu', interventions: 22, completed: 18 },
    { name: 'Ven', interventions: 18, completed: 16 },
    { name: 'Sam', interventions: 8, completed: 7 },
    { name: 'Dim', interventions: 5, completed: 4 },
  ];

  // Performances agents (simulation)
  const agentPerformance = agents.slice(0, 5).map((agent, index) => ({
    name: agent.name.split(' ')[0],
    interventions: Math.floor(Math.random() * 20) + 5,
    satisfaction: Math.floor(Math.random() * 20) + 80,
  }));

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
                <Activity className="h-6 w-6 text-primary" />
                Statistiques & Analytics
              </h1>
              <p className="text-muted-foreground">
                Tableaux de bord et métriques de performance
              </p>
            </div>
            
            <Badge variant="outline" className="text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Mis à jour en temps réel
            </Badge>
          </div>
        </motion.div>

        {/* Métriques principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{metrics.totalInterventions}</p>
                  <p className="text-sm text-muted-foreground">Total Interventions</p>
                  <p className="text-xs text-green-600">+{metrics.thisWeekInterventions} cette semaine</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{metrics.resolutionRate}%</p>
                  <p className="text-sm text-muted-foreground">Taux de Résolution</p>
                  <p className="text-xs text-green-600">
                    {metrics.byStatus.completed}/{metrics.totalInterventions} résolues
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{metrics.onlineAgents}</p>
                  <p className="text-sm text-muted-foreground">Agents Actifs</p>
                  <p className="text-xs text-muted-foreground">sur {metrics.totalAgents} total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{metrics.byStatus.pending}</p>
                  <p className="text-sm text-muted-foreground">En Attente</p>
                  <p className="text-xs text-orange-600">Nécessite une action</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Graphiques et analyses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="interventions">Interventions</TabsTrigger>
              <TabsTrigger value="agents">Performances Agents</TabsTrigger>
              <TabsTrigger value="temporal">Analyse Temporelle</TabsTrigger>
            </TabsList>

            {/* Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Répartition par statut */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Répartition des Interventions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Évolution hebdomadaire */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Évolution Hebdomadaire
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="interventions" 
                          stroke="#1A73E8" 
                          name="Interventions"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completed" 
                          stroke="#22C55E" 
                          name="Terminées"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Interventions détaillées */}
            <TabsContent value="interventions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-600">En Attente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {metrics.byStatus.pending}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Interventions nécessitant une assignation
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-600">En Cours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {metrics.byStatus.inProgress}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Interventions actuellement traitées
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Terminées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {metrics.byStatus.completed}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Interventions résolues avec succès
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance des agents */}
            <TabsContent value="agents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance des Agents (Top 5)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={agentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="interventions" fill="#1A73E8" name="Interventions" />
                      <Bar dataKey="satisfaction" fill="#22C55E" name="Satisfaction %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analyse temporelle */}
            <TabsContent value="temporal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activité par Jour de la Semaine</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="interventions" fill="#1A73E8" name="Nouvelles Interventions" />
                      <Bar dataKey="completed" fill="#22C55E" name="Interventions Terminées" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Statistics;