import { useEffect, useState } from 'react';
import { getFloodAlerts } from '../api/getFloodAlerts';
import { getTrendingPlaces } from '../api/getTrendingPlaces';

export const useMapData = () => {
  const [places, setPlaces] = useState([]);
  const [floodAlerts, setFloodAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    Promise.all([getTrendingPlaces(), getFloodAlerts()]).then(([placeData, alertData]) => {
      if (!isActive) return;
      setPlaces(placeData);
      setFloodAlerts(alertData);
      setIsLoading(false);
    });
    return () => {
      isActive = false;
    };
  }, []);

  return { places, floodAlerts, isLoading };
};
