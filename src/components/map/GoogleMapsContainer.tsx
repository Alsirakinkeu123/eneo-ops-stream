// ENEO Operations Hub - Google Maps Container
// Composant principal pour afficher la carte avec marqueurs

import React, { useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { Intervention, Agent, MarkerData } from '../../types';
import { api } from '../../services/api';
import { toast } from '../../hooks/use-toast';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

const GoogleMapsContainer: React.FC = () => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = React.useState<MarkerData | null>(null);
  
  const {
    interventions,
    agents,
    mapCenter,
    mapZoom,
    setMapCenter,
    setMapZoom,
    setSelectedIntervention,
    updateIntervention,
  } = useAppStore();

  // Conversion des interventions et agents en marqueurs
  const markers: MarkerData[] = React.useMemo(() => {
    const interventionMarkers: MarkerData[] = interventions.map(intervention => ({
      id: intervention.id,
      position: { lat: intervention.latitude, lng: intervention.longitude },
      type: 'intervention',
      status: intervention.status,
      title: `Intervention #${intervention.id} - ${intervention.clientName}`,
      data: intervention,
    }));

    const agentMarkers: MarkerData[] = agents
      .filter(agent => agent.latitude && agent.longitude)
      .map(agent => ({
        id: agent.id + 10000, // Éviter les conflits d'ID
        position: { lat: agent.latitude!, lng: agent.longitude! },
        type: 'agent',
        status: agent.status,
        title: `Agent ${agent.name}`,
        data: agent,
      }));

    return [...interventionMarkers, ...agentMarkers];
  }, [interventions, agents]);

  // Fonction pour obtenir l'icône selon le type et statut
  const getMarkerIcon = (marker: MarkerData): google.maps.Icon => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    
    if (marker.type === 'intervention') {
      switch (marker.status) {
        case 'pending':
          return { url: `${baseUrl}orange-dot.png`, scaledSize: new google.maps.Size(32, 32) };
        case 'in-progress':
          return { url: `${baseUrl}blue-dot.png`, scaledSize: new google.maps.Size(32, 32) };
        case 'completed':
          return { url: `${baseUrl}green-dot.png`, scaledSize: new google.maps.Size(32, 32) };
        case 'cancelled':
          return { url: `${baseUrl}red-dot.png`, scaledSize: new google.maps.Size(32, 32) };
        default:
          return { url: `${baseUrl}yellow-dot.png`, scaledSize: new google.maps.Size(32, 32) };
      }
    } else {
      // Agent markers
      return marker.status === 'online'
        ? { url: `${baseUrl}green-pushpin.png`, scaledSize: new google.maps.Size(24, 24) }
        : { url: `${baseUrl}grey-pushpin.png`, scaledSize: new google.maps.Size(24, 24) };
    }
  };

  // Gestionnaire de drag des marqueurs d'intervention
  const handleMarkerDragEnd = useCallback(async (marker: MarkerData, event: google.maps.MapMouseEvent) => {
    if (marker.type !== 'intervention' || !event.latLng) return;

    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    
    try {
      const updatedIntervention = await api.interventions.update(marker.id, {
        latitude: newLat,
        longitude: newLng,
      });
      
      updateIntervention(updatedIntervention);
      toast({
        title: "Position mise à jour",
        description: `L'intervention #${marker.id} a été déplacée.`,
      });
    } catch (error) {
      console.error('Error updating intervention position:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la position.",
        variant: "destructive",
      });
    }
  }, [updateIntervention]);

  // Gestionnaire de clic sur marqueur
  const handleMarkerClick = (marker: MarkerData) => {
    if (marker.type === 'intervention') {
      setSelectedIntervention(marker.data as Intervention);
    }
    setSelectedMarker(marker);
  };

  // Chargement de la carte
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Centrage de la carte quand il y a des nouvelles données
  useEffect(() => {
    if (mapRef.current && markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(marker => {
        bounds.extend(marker.position);
      });
      mapRef.current.fitBounds(bounds);
    }
  }, [markers]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">Clé API Google Maps manquante</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full h-full rounded-lg overflow-hidden shadow-eneo-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat: mapCenter.latitude, lng: mapCenter.longitude }}
          zoom={mapZoom}
          options={defaultOptions}
          onLoad={handleMapLoad}
          onCenterChanged={() => {
            if (mapRef.current) {
              const center = mapRef.current.getCenter();
              if (center) {
                setMapCenter({
                  latitude: center.lat(),
                  longitude: center.lng(),
                });
              }
            }
          }}
          onZoomChanged={() => {
            if (mapRef.current) {
              setMapZoom(mapRef.current.getZoom() || 12);
            }
          }}
        >
          {/* Marqueurs */}
          {markers.map(marker => (
            <Marker
              key={`${marker.type}-${marker.id}`}
              position={marker.position}
              title={marker.title}
              icon={getMarkerIcon(marker)}
              draggable={marker.type === 'intervention'}
              onClick={() => handleMarkerClick(marker)}
              onDragEnd={(event) => handleMarkerDragEnd(marker, event)}
            />
          ))}

          {/* InfoWindow pour le marqueur sélectionné */}
          {selectedMarker && (
            <InfoWindow
              position={selectedMarker.position}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm mb-1">{selectedMarker.title}</h3>
                {selectedMarker.type === 'intervention' && (
                  <div className="text-xs text-gray-600">
                    <p>Status: {(selectedMarker.data as Intervention).status}</p>
                    <p>Client: {(selectedMarker.data as Intervention).clientName}</p>
                  </div>
                )}
                {selectedMarker.type === 'agent' && (
                  <div className="text-xs text-gray-600">
                    <p>Status: {(selectedMarker.data as Agent).status}</p>
                    <p>Email: {(selectedMarker.data as Agent).email}</p>
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </motion.div>
  );
};

export default GoogleMapsContainer;