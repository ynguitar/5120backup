import limit from 'p-limit';
import Worker from "@/workers/randomPointWorker.js?worker";

export async function generatePollenPointsBySuburbs(suburbNames) {
  const geojson = await fetch('/data/victoria_suburb_boundary.geojson').then(res => res.json());
  const allPointsBySuburb = {};

  const limitConcurrency = limit(4); // 同时最多处理 4 个 suburb
  
  const tasks = suburbNames.map(({ suburbName }) =>
    limitConcurrency(() => {
      const feature = geojson.features.find(f =>
        f.properties.vic_loca_2.toLowerCase() === suburbName.toLowerCase()
      );
      if (!feature) return;

      return new Promise((resolve) => {
        const totalPoints = 100;
        const numWorkers = 2;
        const pointsPerWorker = totalPoints / numWorkers;
        const allPoints = [];
        const workers = [];
        let finishedWorkers = 0;

        for (let i = 0; i < numWorkers; i++) {
          const worker = new Worker();
          workers.push(worker);

          worker.postMessage({ feature, numPoints: pointsPerWorker });

          worker.onmessage = (event) => {
            allPoints.push(...event.data.points);
            finishedWorkers++;
            if (finishedWorkers === numWorkers) {
              const pollenGeoJSON = {
                type: 'FeatureCollection',
                features: allPoints.map((point) => ({
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] },
                  properties: {},
                })),
              };
              allPointsBySuburb[suburbName] = { pollengeojson: pollenGeoJSON };
              workers.forEach(w => w.terminate());
              resolve();
            }
          };

          worker.onerror = (err) => {
            console.error(`Worker error in ${suburbName}:`, err);
            workers.forEach(w => w.terminate());
            resolve();
          };
        }
      });
    })
  );

  await Promise.all(tasks);
  return allPointsBySuburb;
}
