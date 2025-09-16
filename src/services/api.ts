// ENEO Operations Hub - API Services
// Fonctions pour communiquer avec le backend REST API

import { 
  Intervention, 
  Agent, 
  Message, 
  ApiResponse, 
  CreateMessageRequest, 
  UpdateInterventionRequest, 
  AssignAgentsRequest 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Utilitaire pour les requêtes HTTP
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// === INTERVENTIONS API ===

export const interventionsApi = {
  // Récupérer toutes les interventions
  getAll: (): Promise<Intervention[]> =>
    apiRequest<Intervention[]>('/api/v1/admin/interventions'),

  // Mettre à jour une intervention (position, description)
  update: (id: number, data: UpdateInterventionRequest): Promise<Intervention> =>
    apiRequest<Intervention>(`/api/v1/admin/interventions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Assigner des agents à une intervention
  assignAgents: (id: number, data: AssignAgentsRequest): Promise<void> =>
    apiRequest<void>(`/api/v1/admin/interventions/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Résoudre/Clôturer une intervention
  resolve: (id: number): Promise<void> =>
    apiRequest<void>(`/api/v1/agent/interventions/${id}/resolve`, {
      method: 'POST',
    }),

  // Récupérer les messages d'une intervention
  getMessages: (id: number): Promise<Message[]> =>
    apiRequest<Message[]>(`/api/v1/admin/interventions/${id}/messages`),

  // Envoyer un message dans une intervention
  sendMessage: (id: number, data: CreateMessageRequest): Promise<Message> =>
    apiRequest<Message>(`/api/v1/admin/interventions/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// === AGENTS API ===

export const agentsApi = {
  // Récupérer tous les agents
  getAll: (): Promise<Agent[]> =>
    apiRequest<Agent[]>('/api/v1/admin/agents'),
};

// === UTILITAIRES ===

export const api = {
  interventions: interventionsApi,
  agents: agentsApi,
};

export default api;