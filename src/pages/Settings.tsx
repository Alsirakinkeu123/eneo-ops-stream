// ENEO Operations Hub - Paramètres et Configuration
// Page de configuration du système et préférences

import React, { useState } from 'react';
import { motion } from 'framer-motion';

import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  Users,
  MapPin,
  Wifi,
  Save,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { toast } from '../hooks/use-toast';

const Settings: React.FC = () => {
  const [loading, setSaving] = useState(false);
  
  // États pour les paramètres
  const [systemSettings, setSystemSettings] = useState({
    companyName: 'ENEO Cameroun',
    refreshInterval: '20',
    maxAgents: '100',
    mapDefaultZoom: '12',
    enableNotifications: true,
    enableGeolocation: true,
    enableAutoAssign: false,
    maintenanceMode: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newIntervention: true,
    statusChange: true,
    agentOffline: true,
    systemAlert: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  const [apiSettings, setApiSettings] = useState({
    baseUrl: 'http://localhost:8082',
    wsUrl: 'ws://localhost:8082',
    googleMapsKey: '',
    backupEnabled: true,
    logLevel: 'info',
  });

  // Sauvegarde des paramètres
  const handleSaveSettings = async (section: string) => {
    setSaving(true);
    
    // Simulation de sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Paramètres sauvegardés",
      description: `Les paramètres ${section} ont été mis à jour avec succès.`,
    });
    
    setSaving(false);
  };

  // Test de connexion
  const handleTestConnection = async () => {
    setSaving(true);
    
    try {
      // Simulation de test de connexion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Connexion réussie",
        description: "La connexion à l'API backend fonctionne correctement.",
      });
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur backend.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
                <SettingsIcon className="h-6 w-6 text-primary" />
                Paramètres & Configuration
              </h1>
              <p className="text-muted-foreground">
                Configuration du système ENEO Operations Hub
              </p>
            </div>
            
            <Badge variant="outline" className="text-sm">
              <Shield className="h-4 w-4 mr-2" />
              Administrateur
            </Badge>
          </div>
        </motion.div>

        {/* Configuration en onglets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Tabs defaultValue="system" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="system">Système</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="api">API & Intégrations</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
            </TabsList>

            {/* Paramètres Système */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Configuration Générale
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Nom de l'entreprise</Label>
                      <Input
                        id="companyName"
                        value={systemSettings.companyName}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          companyName: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="refreshInterval">Intervalle de rafraîchissement (secondes)</Label>
                      <Input
                        id="refreshInterval"
                        type="number"
                        value={systemSettings.refreshInterval}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          refreshInterval: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxAgents">Nombre maximum d'agents</Label>
                      <Input
                        id="maxAgents"
                        type="number"
                        value={systemSettings.maxAgents}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          maxAgents: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mapDefaultZoom">Zoom par défaut de la carte</Label>
                      <Input
                        id="mapDefaultZoom"
                        type="number"
                        value={systemSettings.mapDefaultZoom}
                        onChange={(e) => setSystemSettings({
                          ...systemSettings,
                          mapDefaultZoom: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Options Système</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notifications en temps réel</Label>
                        <p className="text-sm text-muted-foreground">
                          Activer les notifications push pour les nouvelles interventions
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.enableNotifications}
                        onCheckedChange={(checked) => setSystemSettings({
                          ...systemSettings,
                          enableNotifications: checked
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Géolocalisation automatique</Label>
                        <p className="text-sm text-muted-foreground">
                          Centrer automatiquement la carte sur les nouvelles interventions
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.enableGeolocation}
                        onCheckedChange={(checked) => setSystemSettings({
                          ...systemSettings,
                          enableGeolocation: checked
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Assignation automatique</Label>
                        <p className="text-sm text-muted-foreground">
                          Assigner automatiquement les interventions aux agents disponibles
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.enableAutoAssign}
                        onCheckedChange={(checked) => setSystemSettings({
                          ...systemSettings,
                          enableAutoAssign: checked
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-orange-600">Mode maintenance</Label>
                        <p className="text-sm text-muted-foreground">
                          Désactiver temporairement l'accès au système
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.maintenanceMode}
                        onCheckedChange={(checked) => setSystemSettings({
                          ...systemSettings,
                          maintenanceMode: checked
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleSaveSettings('système')}
                      disabled={loading}
                      className="gradient-primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Préférences de Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Notifications d'événements</h4>
                    
                    {Object.entries({
                      newIntervention: 'Nouvelle intervention',
                      statusChange: 'Changement de statut',
                      agentOffline: 'Agent hors ligne',
                      systemAlert: 'Alerte système'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label>{label}</Label>
                        <Switch
                          checked={notificationSettings[key as keyof typeof notificationSettings]}
                          onCheckedChange={(checked) => setNotificationSettings({
                            ...notificationSettings,
                            [key]: checked
                          })}
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Canaux de notification</h4>
                    
                    <div className="flex items-center justify-between">
                      <Label>Notifications par email</Label>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: checked
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Notifications SMS</Label>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({
                          ...notificationSettings,
                          smsNotifications: checked
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleSaveSettings('notifications')}
                      disabled={loading}
                      className="gradient-primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API & Intégrations */}
            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    Configuration API & Intégrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="baseUrl">URL de l'API Backend</Label>
                      <Input
                        id="baseUrl"
                        value={apiSettings.baseUrl}
                        onChange={(e) => setApiSettings({
                          ...apiSettings,
                          baseUrl: e.target.value
                        })}
                        placeholder="http://localhost:8082"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="wsUrl">URL WebSocket</Label>
                      <Input
                        id="wsUrl"
                        value={apiSettings.wsUrl}
                        onChange={(e) => setApiSettings({
                          ...apiSettings,
                          wsUrl: e.target.value
                        })}
                        placeholder="ws://localhost:8082"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="googleMapsKey">Clé API Google Maps</Label>
                      <Input
                        id="googleMapsKey"
                        type="password"
                        value={apiSettings.googleMapsKey}
                        onChange={(e) => setApiSettings({
                          ...apiSettings,
                          googleMapsKey: e.target.value
                        })}
                        placeholder="Entrez votre clé API Google Maps"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Options avancées</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Sauvegarde automatique</Label>
                        <p className="text-sm text-muted-foreground">
                          Effectuer une sauvegarde quotidienne des données
                        </p>
                      </div>
                      <Switch
                        checked={apiSettings.backupEnabled}
                        onCheckedChange={(checked) => setApiSettings({
                          ...apiSettings,
                          backupEnabled: checked
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleTestConnection}
                      disabled={loading}
                      variant="outline"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Tester la connexion
                    </Button>
                    
                    <Button 
                      onClick={() => handleSaveSettings('API')}
                      disabled={loading}
                      className="gradient-primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sécurité */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Sécurité & Sauvegarde
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Gestion des données</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-auto p-4">
                          <div className="flex flex-col items-center gap-2">
                            <Download className="h-6 w-6" />
                            <div className="text-center">
                              <p className="font-medium">Exporter les données</p>
                              <p className="text-xs text-muted-foreground">Télécharger toutes les données</p>
                            </div>
                          </div>
                        </Button>
                        
                        <Button variant="outline" className="h-auto p-4">
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-6 w-6" />
                            <div className="text-center">
                              <p className="font-medium">Importer des données</p>
                              <p className="text-xs text-muted-foreground">Restaurer depuis une sauvegarde</p>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Informations système</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Version de l'application</p>
                        <p className="text-muted-foreground">v2.1.0</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Dernière sauvegarde</p>
                        <p className="text-muted-foreground">{new Date().toLocaleDateString('fr-FR')}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Environnement</p>
                        <p className="text-muted-foreground">Production</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Base de données</p>
                        <p className="text-success">Connectée</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;