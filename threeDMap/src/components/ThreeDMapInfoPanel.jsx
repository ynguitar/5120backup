// ThreeDMapInfoPanel.jsx
import React from 'react';

const ThreeDMapInfoPanel = ({ suburb }) => {
  if (!suburb) return null;
    // console.log('看下灰色框数据',suburb);
  return (
    <div
      className="fixed top-0 left-0 h-screen w-[10%] bg-gray-800 bg-opacity-70 text-white p-4 z-50 overflow-y-auto"
    >
        <h2 className="text-lg font-bold mb-2">{suburb.name}</h2>
        <p>Forest: {suburb.weather}</p>
        <p>Pollen: {suburb.pollen}</p>
        <div className="mt-2">
        <p className="font-semibold">Pollen distribution floor: </p>
        <p className="text-sm">{suburb.floor}</p>
        </div>
        <div className="mt-2">
        <p className="font-semibold">Wind level: </p>
        <p className="text-sm">{suburb.WindLevel}</p>
        </div>
        <div className="mt-2">
        <p className="font-semibold">Wind direction: </p>
        <p className="text-sm">{suburb.WindDirect}</p>
        </div>
    </div>
  );
};

export default ThreeDMapInfoPanel;
