// ENEO Operations Hub - Zustand Global Store
// Gestion centralisée de l'état de l'application

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AppState, Intervention, Agent, Message, InterventionStatus, Coordinates } from '../types';

interface AppActions {
  // Interventions Actions
  setInterventions: (interventions: Intervention[]) => void;
  updateIntervention: (intervention: Intervention) => void;
  setSelectedIntervention: (intervention: Intervention | null) => void;
  setInterventionFilter: (filter: InterventionStatus | 'all') => void;
  
  // Agents Actions
  setAgents: (agents: Agent[]) => void;
  updateAgent: (agent: Agent) => void;
  
  // UI Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDetailsPanelOpen: (open: boolean) => void;
  setDetailsPanelTab: (tab: 'details' | 'chat') => void;
  
  // Map Actions
  setMapCenter: (center: Coordinates) => void;
  setMapZoom: (zoom: number) => void;
  
  // Chat Actions
  setChatMessages: (messages: Message[]) => void;
  addChatMessage: (message: Message) => void;
  setWebsocketConnected: (connected: boolean) => void;
  
  // Loading Actions
  setLoadingInterventions: (loading: boolean) => void;
  setLoadingAgents: (loading: boolean) => void;
  setSendingMessage: (sending: boolean) => void;
  
  // Utility Actions
  resetState: () => void;
}

const initialState: AppState = {
  // Interventions
  interventions: [],
  selectedIntervention: null,
  interventionFilter: 'all',
  
  // Agents
  agents: [],
  
  // UI State
  sidebarCollapsed: false,
  detailsPanelOpen: false,
  detailsPanelTab: 'details',
  
  // Map State (Centre de Douala par défaut)
  mapCenter: { latitude: 4.0511, longitude: 9.7679 },
  mapZoom: 12,
  
  // Chat State
  chatMessages: [],
  websocketConnected: false,
  
  // Loading States
  loadingInterventions: false,
  loadingAgents: false,
  sendingMessage: false,
};

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Interventions Actions
      setInterventions: (interventions) =>
        set({ interventions }, false, 'setInterventions'),
      
      updateIntervention: (updatedIntervention) =>
        set((state) => ({
          interventions: state.interventions.map(intervention =>
            intervention.id === updatedIntervention.id ? updatedIntervention : intervention
          ),
          selectedIntervention: state.selectedIntervention?.id === updatedIntervention.id
            ? updatedIntervention
            : state.selectedIntervention,
        }), false, 'updateIntervention'),
      
      setSelectedIntervention: (intervention) =>
        set({ 
          selectedIntervention: intervention,
          detailsPanelOpen: !!intervention,
          detailsPanelTab: 'details'
        }, false, 'setSelectedIntervention'),
      
      setInterventionFilter: (filter) =>
        set({ interventionFilter: filter }, false, 'setInterventionFilter'),

      // Agents Actions
      setAgents: (agents) =>
        set({ agents }, false, 'setAgents'),
      
      updateAgent: (updatedAgent) =>
        set((state) => ({
          agents: state.agents.map(agent =>
            agent.id === updatedAgent.id ? updatedAgent : agent
          ),
        }), false, 'updateAgent'),

      // UI Actions
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }), false, 'toggleSidebar'),
      
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),
      
      setDetailsPanelOpen: (open) =>
        set((state) => ({
          detailsPanelOpen: open,
          selectedIntervention: open ? state.selectedIntervention : null,
        }), false, 'setDetailsPanelOpen'),
      
      setDetailsPanelTab: (tab) =>
        set({ detailsPanelTab: tab }, false, 'setDetailsPanelTab'),

      // Map Actions
      setMapCenter: (center) =>
        set({ mapCenter: center }, false, 'setMapCenter'),
      
      setMapZoom: (zoom) =>
        set({ mapZoom: zoom }, false, 'setMapZoom'),

      // Chat Actions
      setChatMessages: (messages) =>
        set({ chatMessages: messages }, false, 'setChatMessages'),
      
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        }), false, 'addChatMessage'),
      
      setWebsocketConnected: (connected) =>
        set({ websocketConnected: connected }, false, 'setWebsocketConnected'),

      // Loading Actions
      setLoadingInterventions: (loading) =>
        set({ loadingInterventions: loading }, false, 'setLoadingInterventions'),
      
      setLoadingAgents: (loading) =>
        set({ loadingAgents: loading }, false, 'setLoadingAgents'),
      
      setSendingMessage: (sending) =>
        set({ sendingMessage: sending }, false, 'setSendingMessage'),

      // Utility Actions
      resetState: () =>
        set(initialState, false, 'resetState'),
    }),
    {
      name: 'eneo-operations-store',
    }
  )
);