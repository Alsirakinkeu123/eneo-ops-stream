// ENEO Operations Hub - Panneau de Détails
// Panneau latéral avec onglets Détails et Chat

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import InterventionDetails from './InterventionDetails';
import ChatPanel from './ChatPanel';

const DetailsPanel: React.FC = () => {
  const {
    selectedIntervention,
    setDetailsPanelOpen,
    detailsPanelTab,
    setDetailsPanelTab,
  } = useAppStore();

  if (!selectedIntervention) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full shadow-eneo-lg border-l-4 border-l-primary">
        {/* Header avec fermeture */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Intervention #{selectedIntervention.id}</h3>
              <p className="text-sm text-muted-foreground">{selectedIntervention.clientName}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDetailsPanelOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Onglets */}
        <Tabs 
          value={detailsPanelTab} 
          onValueChange={(value) => setDetailsPanelTab(value as 'details' | 'chat')}
          className="h-full flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="details" className="h-full m-0">
              <InterventionDetails intervention={selectedIntervention} />
            </TabsContent>

            <TabsContent value="chat" className="h-full m-0">
              <ChatPanel intervention={selectedIntervention} />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </motion.div>
  );
};

export default DetailsPanel;