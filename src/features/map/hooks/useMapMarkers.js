import { Marker } from 'maplibre-gl';
import { useEffect } from 'react';
import { createFloodMarkerElement, createPlaceMarkerElement, createUserMarkerElement } from '../utils/createMarkerElements';

const addMarker = (map, element, coordinates, onClick) => {
  if (onClick) {
    element.addEventListener('click', (event) => {
      event.stopPropagation();
      onClick();
    });
  }
  return new Marker({ element }).setLngLat(coordinates).addTo(map);
};

export const usePlaceMarkers = (map, places, selectedPlaceId, onSelect) => {
  useEffect(() => {
    if (!map) return undefined;
    const markers = places.map((place) =>
      addMarker(map, createPlaceMarkerElement(place, place.id === selectedPlaceId), place.location.coordinates, () =>
        onSelect(place.id),
      ),
    );
    return () => markers.forEach((marker) => marker.remove());
  }, [map, places, selectedPlaceId, onSelect]);
};

export const useFloodMarkers = (map, alerts, onSelect) => {
  useEffect(() => {
    if (!map) return undefined;
    const markers = alerts.map((alert) =>
      addMarker(map, createFloodMarkerElement(alert), alert.location.coordinates, () => onSelect(alert.id)),
    );
    return () => markers.forEach((marker) => marker.remove());
  }, [map, alerts, onSelect]);
};

export const useUserMarker = (map, coordinates) => {
  useEffect(() => {
    if (!map) return undefined;
    const marker = addMarker(map, createUserMarkerElement(), coordinates);
    return () => marker.remove();
  }, [map, coordinates]);
};
