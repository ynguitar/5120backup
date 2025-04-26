//Gaussian Plume Model
export function estimatePollenHeight({
    pollenType,
    pollenLevel,
    windSpeed,
    weather,
    thresholdRatio = 0.1
  }) {
    const pollenConcentrationLevels = {
      grass: [30, 100, 300, 800],
      weed: [20, 80, 200, 600],
      tree: [50, 200, 500, 1200]
    };
  
    const pollenTypeToHeight = {
      grass: 0.5,
      weed: 1.5,
      tree: 10
    };
  
    const concentrations = pollenConcentrationLevels[pollenType];
    if (!concentrations) {
      throw new Error(`Unknown pollen type: ${pollenType}`);
    }
  
    const C0 = concentrations[pollenLevel - 1] || concentrations[0];
    const H = pollenTypeToHeight[pollenType] || 1;
  
  
    let weatherFactor = 1;
    if (weather === 'sunny') weatherFactor = 0.8;
    if (weather === 'cloudy') weatherFactor = 1.0;
    if (weather === 'windy') weatherFactor = 1.2;
    if (weather === 'calm') weatherFactor = 1.5;
  
    const sigmaZBase = 0.1; 
    const windSpeedFactor = 1 + windSpeed / 10; 
  
    let z = H;
    const dz = 0.5;
  
    while (z < 100) {
      const sigmaZ = sigmaZBase * weatherFactor * windSpeedFactor * (z + 1);
  
      const C = (C0 / (Math.sqrt(2 * Math.PI) * sigmaZ)) * 
                Math.exp( -((z - H) ** 2) / (2 * (sigmaZ ** 2)) );
  
      if (C < C0 * thresholdRatio) {
        break;
      }
  
      z += dz;
    }
  
    const floor = Math.floor(z / 3);
    return floor;
  }
  