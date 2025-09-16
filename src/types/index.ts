// ENEO Operations Hub - TypeScript Definitions
// Interfaces pour toutes les entités et API responses

export type InterventionStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type AgentStatus = 'online' | 'offline';
export type MessageSender = 'client' | 'agent' | 'admin';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Intervention {
  id: number;
  clientName: string;
  clientPhone: string;
  problemDescription: string;
  status: InterventionStatus;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  assignedAgents?: Agent[];
  messages?: Message[];
}

export interface Agent {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: AgentStatus;
  lastSeenAt: string;
  latitude?: number;
  longitude?: number;
  assignedInterventions?: number[];
}

export interface Message {
  id: number;
  interventionId: number;
  content: string;
  sender: MessageSender;
  senderName?: string;
  createdAt: string;
}

// API Request/Response Types
export interface CreateMessageRequest {
  content: string;
}

export interface UpdateInterventionRequest {
  problemDescription?: string;
  latitude?: number;
  longitude?: number;
}

export interface AssignAgentsRequest {
  agentIds: number[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'new_message' | 'intervention_update' | 'agent_update';
  data: Message | Intervention | Agent;
  timestamp: string;
}

// UI State Types
export interface AppState {
  // Interventions
  interventions: Intervention[];
  selectedIntervention: Intervention | null;
  interventionFilter: InterventionStatus | 'all';
  
  // Agents
  agents: Agent[];
  
  // UI State
  sidebarCollapsed: boolean;
  detailsPanelOpen: boolean;
  detailsPanelTab: 'details' | 'chat';
  
  // Map State
  mapCenter: Coordinates;
  mapZoom: number;
  
  // Chat State
  chatMessages: Message[];
  websocketConnected: boolean;
  
  // Loading States
  loadingInterventions: boolean;
  loadingAgents: boolean;
  sendingMessage: boolean;
}

// Google Maps Types
export interface MarkerData {
  id: number;
  position: { lat: number; lng: number };
  type: 'intervention' | 'agent';
  status: InterventionStatus | AgentStatus;
  title: string;
  data: Intervention | Agent;
}

// Form Types
export interface InterventionFormData {
  problemDescription: string;
  latitude: number;
  longitude: number;
}

export interface AssignTeamFormData {
  agentIds: number[];
}