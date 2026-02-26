import { useNavigate } from 'react-router-dom';
import ExploreMap from '@/components/map/ExploreMap';

export default function TransportExploreMap() {
  const navigate = useNavigate();
  
  const urlParams = new URLSearchParams(window.location.search);
  const initialMode = urlParams.get('mode') || 'transport';

  return (
    <ExploreMap 
      mode={initialMode} 
      onBack={() => navigate(-1)}
    />
  );
  }