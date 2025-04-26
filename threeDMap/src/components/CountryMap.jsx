// src/components/LeafletMap.jsx
import { useEffect,React } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';


export default function LeafletMap() {
  const navigate = useNavigate();

  useEffect(() => {
    const map = L.map('map').setView([-25.2744, 133.7751], 4);

    fetch('/data/states.geojson')
      .then(res => res.json())
      .then(data => {
        const geojsonLayer = L.geoJSON(data, {
          style: () => ({
            color: "#0078A8",
            weight: 2,
            fillOpacity: 0.3,
          }),
          onEachFeature: (feature, layer) => {
            const stateName = feature.properties.STATE_NAME;

            layer.bindTooltip(stateName, {
              permanent: false,
              direction: "center",
            });

            layer.on('click', () => {
              // map.remove();
              navigate(`/map/${stateName}`);
            });
          }
        });

        geojsonLayer.addTo(map);
      })
      .catch(error => {
        console.error("加载 GeoJSON 失败:", error);
      });

    return () => {
      map.remove();
    };
  }, [navigate]);

  return <div id="map" style={{ height: '100vh', width: '100%' }} />;
}