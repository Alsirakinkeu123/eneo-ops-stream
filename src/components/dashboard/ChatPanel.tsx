// ENEO Operations Hub - Panneau Chat
// Onglet chat avec WebSocket temps réel

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Send, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { api } from '../../services/api';
import { toast } from '../../hooks/use-toast';
import { Intervention, Message } from '../../types';

interface ChatPanelProps {
  intervention: Intervention;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ intervention }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const {
    chatMessages,
    setChatMessages,
    sendingMessage,
    setSendingMessage,
    websocketConnected,
  } = useAppStore();

  // Hook WebSocket
  const { isConnected, sendMessage } = useWebSocket(intervention.id);

  // Chargement de l'historique des messages
  const loadChatHistory = async () => {
    try {
      setIsLoadingMessages(true);
      const messages = await api.interventions.getMessages(intervention.id);
      setChatMessages(messages);
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des messages.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    loadChatHistory();
  }, [intervention.id]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Envoi de message
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const messageContent = messageInput.trim();
    setMessageInput('');

    try {
      setSendingMessage(true);

      // Envoi via API REST (fallback)
      await api.interventions.sendMessage(intervention.id, {
        content: messageContent,
      });

      // Essai d'envoi via WebSocket (temps réel)
      if (isConnected) {
        try {
          sendMessage(messageContent);
        } catch (wsError) {
          console.warn('WebSocket send failed, message sent via REST API:', wsError);
        }
      }

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé au client.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive",
      });
      // Restaurer le message en cas d'erreur
      setMessageInput(messageContent);
    } finally {
      setSendingMessage(false);
    }
  };

  // Gestion de l'appui sur Entrée
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Fonction pour obtenir les initiales de l'expéditeur
  const getSenderInitials = (senderName?: string) => {
    if (!senderName) return 'U';
    return senderName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Fonction pour formater l'heure
  const formatMessageTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Composant Message
  const MessageItem: React.FC<{ message: Message; index: number }> = ({ message, index }) => {
    const isFromClient = message.sender === 'client';
    const isFromAgent = message.sender === 'agent';
    const isFromAdmin = message.sender === 'admin';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`flex ${isFromClient ? 'justify-start' : 'justify-end'} mb-3`}
      >
        <div className={`max-w-[80%] ${isFromClient ? 'order-1' : 'order-2'}`}>
          <div className={`flex items-end gap-2 ${isFromClient ? '' : 'flex-row-reverse'}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              isFromClient 
                ? 'bg-blue-100 text-blue-800' 
                : isFromAgent 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-purple-100 text-purple-800'
            }`}>
              {getSenderInitials(message.senderName)}
            </div>

            {/* Bulle de message */}
            <div className={`rounded-2xl px-4 py-2 max-w-full ${
              isFromClient
                ? 'bg-muted text-foreground rounded-bl-sm'
                : isFromAgent
                  ? 'bg-success text-white rounded-br-sm'
                  : 'bg-primary text-white rounded-br-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              <div className={`flex items-center gap-2 mt-1 ${
                isFromClient ? 'justify-start' : 'justify-end'
              }`}>
                <span className={`text-xs ${
                  isFromClient ? 'text-muted-foreground' : 'text-white/70'
                }`}>
                  {formatMessageTime(message.createdAt)}
                </span>
                {message.senderName && (
                  <Badge variant="outline" className={`text-xs ${
                    isFromClient ? '' : 'border-white/30 text-white/70'
                  }`}>
                    {isFromClient ? 'Client' : isFromAgent ? 'Agent' : 'Admin'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      {/* Header du chat avec statut */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="font-medium">Discussion avec le client</span>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-success" />
                <Badge variant="outline" className="text-xs text-success border-success">
                  Temps réel
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-warning" />
                <Badge variant="outline" className="text-xs text-warning border-warning">
                  API uniquement
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Chargement des messages...</div>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aucun message pour le moment.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Commencez la discussion avec le client.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <AnimatePresence>
            {chatMessages.map((message, index) => (
              <MessageItem key={message.id} message={message} index={index} />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone d'envoi de message */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            disabled={sendingMessage}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sendingMessage}
            size="sm"
            className="gradient-primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {sendingMessage && (
          <p className="text-xs text-muted-foreground mt-1">Envoi en cours...</p>
        )}
      </div>
    </motion.div>
  );
};

export default ChatPanel;