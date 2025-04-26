import { useParams, useNavigate } from 'react-router-dom';
import StateMap from '../components/StateMap';

export default function StatePage() {
  const { state } = useParams();
  const navigate = useNavigate();

  const handleCityClick = (cityName) => {
    navigate(`/map/${state}/${cityName}`);
  };

  return (
    <div>
      <h2>State Info</h2>
      <p>Sub state: {state}</p>
      <StateMap stateName={state} onCityClick={handleCityClick} />
    </div>
  );
}