// ENEO Operations Hub - WebSocket Hook
// Hook pour gérer la connexion WebSocket temps réel

import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { WebSocketMessage, Message } from '../types';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8082';

export const useWebSocket = (interventionId?: number) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  
  const { 
    addChatMessage, 
    setWebsocketConnected,
    updateIntervention,
    updateAgent 
  } = useAppStore();

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000; // 3 secondes

  const connectWebSocket = () => {
    if (!interventionId) return;

    try {
      const wsUrl = `${WS_BASE_URL}/ws/chat/${interventionId}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected for intervention:', interventionId);
        setWebsocketConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const wsMessage: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', wsMessage);

          switch (wsMessage.type) {
            case 'new_message':
              const message = wsMessage.data as Message;
              addChatMessage(message);
              break;
              
            case 'intervention_update':
              const intervention = wsMessage.data as any;
              updateIntervention(intervention);
              break;
              
            case 'agent_update':
              const agent = wsMessage.data as any;
              updateAgent(agent);
              break;
              
            default:
              console.warn('Unknown WebSocket message type:', wsMessage.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWebsocketConnected(false);
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setWebsocketConnected(false);
        
        // Tentative de reconnexion automatique
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(`Tentative de reconnexion ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, RECONNECT_INTERVAL);
        } else {
          console.error('Nombre maximum de tentatives de reconnexion atteint');
        }
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setWebsocketConnected(false);
    }
  };

  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
    
    setWebsocketConnected(false);
    reconnectAttemptsRef.current = 0;
  };

  const sendMessage = (content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'send_message',
        data: { content },
        timestamp: new Date().toISOString(),
      };
      
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
      throw new Error('WebSocket connection is not available');
    }
  };

  useEffect(() => {
    if (interventionId) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [interventionId]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    disconnect: disconnectWebSocket,
    reconnect: connectWebSocket,
  };
};