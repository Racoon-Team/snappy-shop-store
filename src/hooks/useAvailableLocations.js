import { useEffect, useState } from 'react';
import axios from 'axios';

const useAvailableLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data } = await axios.get('/api/admin/available-locations');
        setLocations(data);
      } catch (error) {
        console.error('Error al obtener ubicaciones:', error);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return { locations, loading };
};

export default useAvailableLocations;
