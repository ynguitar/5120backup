import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as THREE from 'three';
import { Threebox } from 'threebox-map';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useParams } from 'react-router-dom';
import Worker from "@/workers/randomPointWorker.js?worker";
import 'mapbox-gl/dist/mapbox-gl.css';
import 'threebox-plugin/dist/threebox.css';
import 'mapbox-gl/dist/mapbox-gl.js';
import "./ThreeDmap.css";
import ThreeDMapInfoPanel from './ThreeDMapInfoPanel';
import { generatePollenPointsBySuburbs } from './generatePollenPoints';


const MapContainer = () => {
  const [loading, setLoading] = useState(true);
  const [pollenData, setPollenData] = useState({});
  const pollenDataRef = useRef({});
  
  useEffect(() => {
      const preloadData = async () => {
        setLoading(true); // 显示等待框
        const initSuburbs = async () => {
          const suburbList = await getSuburbsData(selectedCity);
          const result = await generatePollenPointsBySuburbs(suburbList); 
          console.log("结果呢？",result);
        setPollenData(result);
        
        setLoading(false);
      }
      initSuburbs();
      
      };
    
      preloadData();   
      // console.log("看看pollen数据",pollenData);
    }, []);
    useEffect(() => {
      pollenDataRef.current = pollenData;
    },[pollenData]);


    const {  cityName } = useParams();

    const selectedCity = cityName.toLowerCase();
    const mapContainerRef = useRef(null);
    // const map = useRef(null);
    const popup = useRef(null);
    const [hoveredSuburb, setHoveredSuburb] = useState({
      name: '',
      weather: '',
      pollen: '',
      floor: '',
      WindLevel: "",
      WindDirect: ""
    });
    
    // const [suburbList, setSuburbList] = useState([]);

    const add3DBuildings = (submap) => {
      const map = submap;
      const layers = map.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === "symbol" && layer.layout["text-field"]
      )?.id;
  
      map.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "height"]
            ],
            "fill-extrusion-opacity": 0.6
          }
        },
        labelLayerId
      );
    };

  
  useEffect(() => {
    // const fetchData = async () => {
    //   const response = await fetch(`/data/suburb_${selectedCity}.geojson`);
    //   const geoJSONData = await response.json();

    //   const list = geoJSONData.features.map((feature) => {
    //     const suburbName = feature.properties.name || "Unnamed Suburb";
    //     const coordinates = feature.geometry.coordinates;
    //     let longitude = 0;
    //     let latitude = 0;

    //     if (feature.geometry.type === "Point") {
    //       [longitude, latitude] = coordinates;
    //     } else if (feature.geometry.type === "MultiPoint") {
    //       [longitude, latitude] = coordinates[0];
    //     }

    //     return { suburbName, latitude, longitude };
    //   });

    //   setSuburbList(list);
    // };

    // if (selectedCity) fetchData();



    const loadSuburbs = async () => {
        const suburbList = await getSuburbsData(selectedCity);
        


    mapboxgl.accessToken = 
    "pk.eyJ1IjoibnlhbjAwMjUiLCJhIjoiY204dHBvdjdjMGRxajJyb2NhbTRuYnVzOCJ9.002RhpjH1--fp6uxHi1viA";

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [144.9631, -37.8136], // Melbourne
      zoom: 10,
    });
    
    map.on("load", () => {
        const points = [
          { lng: 144.9631, lat: -37.8116 },
          { lng: 144.9633, lat: -37.8136 },
          { lng: 144.9635, lat: -37.8126 }
        ];
        const geojson = {
          type: 'FeatureCollection',
          features: points.map((p) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [p.lng, p.lat],
            },
            properties: {
              size: Math.random() * 5 + 5,
            }
          }))
        };
        console.log("打印成功的", geojson);
        map.addSource('particles', {
          type: 'geojson',
          data: geojson,
        });
  
        map.addLayer({
          id: 'particles-layer',
          type: 'circle',
          source: 'particles',
          paint: {
            'circle-radius': ['get', 'size'],
            'circle-color': '#ff4d4d',
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff',
            'circle-translate': [0, 0],
            'circle-translate-anchor': 'viewport'
          }
        });
  
        let t = 0;
        const animateParticles = () => {
          t += 0.05;
          const floatOffset = Math.sin(t) * 2;
          const opacity = 0.6 + 0.3 * Math.sin(t);
  
          map.setPaintProperty('particles-layer', 'circle-translate', [0, floatOffset]);
          map.setPaintProperty('particles-layer', 'circle-opacity', opacity);
  
          requestAnimationFrame(animateParticles);
        };
        animateParticles();
  
        // const tb = new Threebox(map, map.getCanvas().getContext('webgl'), {
        //   defaultLights: true,
        // });
  
        // const three_points = [
        //   [144.9631, -37.8136],
        //   [144.9731, -37.8136],
        //   [144.9631, -37.8236],
        //   [144.9531, -37.8036]
        // ];
  
        // three_points.forEach((coord) => {
        //   const geometry = new THREE.SphereGeometry(10, 16, 16);
        //   const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        //   const sphere = new THREE.Mesh(geometry, material);
        //   tb.add(sphere, {
        //     lon: coord[0],
        //     lat: coord[1],
        //     altitude: 10000,
        //   });
        // });
        const size = 20;
        const pulsingDot = {
          width: size,
          height: size,
          data: new Uint8Array(size * size * 4),

          onAdd: function (map) {
            this.map = map;
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
          },

          render: function () {
            const duration = 50;
            const t = (performance.now() % duration) / duration;

            const radius = (size / 2) * 0.3;
            const outerRadius = (size / 2) * 0.7 * t + radius;
            const context = this.context;

            context.clearRect(0, 0, this.width, this.height);
            context.beginPath();
            context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
            context.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
            context.fill();

            context.beginPath();
            context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
            context.fillStyle = 'rgba(255, 100, 100, 1)';
            context.strokeStyle = 'white';
            context.lineWidth = 2 + 4 * (1 - t);
            context.fill();
            context.stroke();

            this.data = context.getImageData(0, 0, this.width, this.height).data;

            this.map && this.map.triggerRepaint();
            return true;
          }
        };
  
        map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
        map.addSource('dot-point', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [144.9631, -37.8136]
                }
              }
            ]
          }
        });
  
        map.addLayer({
          id: 'layer-with-pulsing-dot',
          type: 'symbol',
          source: 'dot-point',
          layout: {
            'icon-image': 'pulsing-dot'
          }
        });
  
        add3DBuildings(map);
        const paticleLayer = addParticlesWithThreeJS(map, [144.9631, -37.8136]);
        map.addLayer(paticleLayer);
  
        let lastSuburb = null;
  
        map.on('mousemove', (e) => {
          const lng = e.lngLat.lng;
          const lat = e.lngLat.lat;
          
          const nearestSuburb = getNearestSuburb(lng, lat,suburbList);
          if (!nearestSuburb || (lastSuburb && lastSuburb === nearestSuburb)) return;
  
          lastSuburb = nearestSuburb;
          
          const popupContent = `
            <div style="color: black; font-size: 14px;">
            <strong>Suburb name:</strong> ${nearestSuburb.suburbName}<br/>
            <strong>Pollen Info:</strong> ${'Level 1' || 'None'}
            <strong>Infection:</strong> ${'Grass' || 'Others'}
          `;
          if (lastSuburb) {
            setHoveredSuburb({
              name: lastSuburb,
              weather: "🌤️ Sunny and cloudy",
              pollen: "🌲 High",
              floor: "No. 3",
              WindLevel: "3",
              WindDirect: "Southeast"
            });
          } else {
            // 不在 mock 里的 suburb，就清空
            setHoveredSuburb({
              name: '',
              weather: '',
              pollen: '',
              floor: '',
              WindLevel: "",
              WindDirect: ""
            });
          }
          if (!popup.current) {
            popup.current = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false
            });
          }
  
          popup.current
            .setLngLat([lng, lat])
            .setHTML(popupContent)
            .addTo(map);
            const currentPollenData = pollenDataRef.current;
          console.log("初始化的花粉点位有没有？",currentPollenData);
          // fetch('/data/victoria_suburb_boundary.geojson')
          //   .then(res => res.json())
          //   .then(geojson => {
          //     const feature = geojson.features.find(f =>
          //       f.properties.vic_loca_2.toLowerCase() === nearestSuburb.suburbName.toLowerCase()
          //     );
              
          //     if (!feature) return;
  
          //     const workers = [];
          //     const totalPoints = 200;
          //     const numWorkers = 20;
          //     const pointsPerWorker = totalPoints / numWorkers;
          //     const allPoints = [];
          //     let finishedWorkers = 0;
          //     for (let i = 0; i < numWorkers; i++) {
          //       workers[i] = new Worker();
          //       workers[i].postMessage({
          //         feature,
          //         numPoints: pointsPerWorker
          //       });
  
          //       workers[i].onmessage = (event) => {
          //         const { points } = event.data;
          //         allPoints.push(...points);
          //         finishedWorkers++;
  
          //         if (finishedWorkers === numWorkers) {
          //           const pointGeojson = {
          //             type: 'FeatureCollection',
          //             features: allPoints
          //           };
          //           if (map.getSource('random-points')) {
          //             map.getSource('random-points').setData(JSON.parse(JSON.stringify(pointGeojson)));
          //           } else {
          //             map.addSource('random-points', {
          //               type: 'geojson',
          //               data: pointGeojson
          //             });
  
          //             map.addLayer({
          //               id: 'random-points-layer',
          //               type: 'circle',
          //               source: 'random-points',
          //               paint: {
          //                 'circle-radius': 6,
          //                 'circle-color': '#ff0000',
          //                 'circle-opacity': 0.8
          //               }
          //             });
          //             map.setLayoutProperty('random-points-layer', 'visibility', 'visible');
          //           }
          //         }
          //       };
          //     }
          //   });
        });
  
        map.on('mouseleave', () => {
          if (popup.current) {
            popup.current.remove();
          }
        });
      });

    return () => map.remove(); // 清理 map
  };
    
  loadSuburbs();
  
  }, [selectedCity]);






  const createParticleProgram = (gl) => {
    const vertexSource = `
      uniform mat4 u_matrix;
      attribute vec3 a_position;
      void main() {
        gl_Position = u_matrix * vec4(a_position, 1.0);
        gl_PointSize = 8.0;
      }`;

    const fragmentSource = `
      void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 0.8);
      }`;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    return program;
  };

  const createParticleBuffer = (gl, lngLatOrigin) => {
    const positions = [];
    let PARTICLE_COUNT = 10;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const lngOffset = (Math.random() - 0.5) * 0.001;
      const latOffset = (Math.random() - 0.5) * 0.001;
      const alt = Math.random() * 50;

      const coord = mapboxgl.MercatorCoordinate.fromLngLat(
        [lngLatOrigin[0] + lngOffset, lngLatOrigin[1] + latOffset],
        alt
      );

      positions.push(coord.x, coord.y, coord.z);
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return buffer;
  };

  const addParticlesWithThreeJS = (map, input_lgns) => {
    return {
      id: "particle-layer",
      type: "custom",
      renderingMode: "3d",
      onAdd: function (map, gl) {
        this.map = map;
        this.program = createParticleProgram(gl);
        this.buffer = createParticleBuffer(gl, input_lgns);
        this.aPosition = gl.getAttribLocation(this.program, "a_position");
        this.uMatrix = gl.getUniformLocation(this.program, "u_matrix");
      },
      render: function (gl, matrix) {
        gl.useProgram(this.program);
        gl.uniformMatrix4fv(this.uMatrix, false, matrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.aPosition);
        gl.vertexAttribPointer(this.aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.POINTS, 0, 100);
        this.map && this.map.triggerRepaint();
      }
    };
  };


  function getNearestSuburb(mouseLng, mouseLat, suburbList) {
    let nearest = null;
    let minDistance = Infinity;

    suburbList.forEach((suburb) => {
      const dx = suburb.longitude - mouseLng;
      const dy = suburb.latitude - mouseLat;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = suburb;
      }
    });

    return nearest;
  }


  async function getSuburbsData(cityName) {
    const geojsonPath = `/data/suburb_${cityName}.geojson`;
    
    const suburbList = [];

    try {
      const response = await fetch(geojsonPath);

      // const contentType = response.headers.get("content-type");
      if (!response.ok ) {
        throw new Error("Invalid GeoJSON file or path");
      }
      const geoJSONData = await response.json();

      geoJSONData.features.forEach((feature) => {
        const suburbName = feature.properties.name || "Unnamed Suburb";
        const coordinates = feature.geometry.coordinates;

        let longitude, latitude;
        if (feature.geometry.type === 'Point') {
          longitude = coordinates[0];
          latitude = coordinates[1];
        } else if (feature.geometry.type === 'MultiPoint') {
          longitude = coordinates[0][0];
          latitude = coordinates[0][1];
        } else {
          console.warn("Unsupported geometry type:", feature.geometry.type);
          return;
        }

        suburbList.push({
          suburbName: suburbName,
          latitude: latitude,
          longitude: longitude,
        });
      });

      return suburbList;
    } catch (error) {
      console.error("Error loading GeoJSON:", error);
      return [];
    }
  }

  return (
    // <div className="relative">
    //   <div
    //     className="absolute top-0 left-0 w-1/10 h-full bg-gray-800 bg-opacity-60 text-white p-4 z-50"
    //   >
    //     <ThreeDMapInfoPanel suburb={hoveredSuburb} />
    //   </div>
    //   <div id="map-container">
    //     <div id="map" ref={mapContainerRef} style={{ width: '100%', height: '100vh' }}></div>
    //   </div>
    // </div>
    <div className="relative w-full h-screen">

    {loading && (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            color: 'black',
            padding: '20px 40px',
            borderRadius: '10px',
            fontSize: '20px',
            fontWeight: 'bold',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}
        >
          Loading...
        </div>
      </div>
    )}

    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '10%',
        height: '100vh',
        backgroundColor: 'rgba(75, 85, 99, 0.6)',
        color: 'white',
        padding: '1rem',
        zIndex: 1000,
      }}
    >
      <ThreeDMapInfoPanel suburb={hoveredSuburb} />
    </div>


    
      {/* <div id="map-container">
        <div id="map" ref={mapContainerRef} style={{ width: '100%', height: '100vh' }}></div>
      </div> */}

      <div
          id="map-container"
          style={{
            pointerEvents: loading ? 'none' : 'auto', // 禁用地图交互
          }}
        >
          <div
            id="map"
            ref={mapContainerRef}
            style={{ width: '100%', height: '100vh' }}
          ></div>
        </div>

    </div>
  );
};

export default MapContainer;