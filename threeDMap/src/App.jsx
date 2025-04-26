// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Country from './components/CountryMap';
import StateMap from './components/StateMap';
import CityMap from './components/CityMap';

const Home = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/country');
  };

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={handleClick}>Go to Country Page</button>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/country" element={<Country />} />
        <Route path="/map/:stateName" element={<StateMap />} />
        <Route path="/map/:stateName/:cityName" element={<CityMap />} />
      </Routes>
    </Router>
  );
};

export default App;
