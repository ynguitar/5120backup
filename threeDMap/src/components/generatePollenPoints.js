import limit from 'p-limit';
import Worker from "@/workers/randomPointWorker.js?worker";
import * as turf from "@turf/turf";

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
        const area = turf.area(feature);
        const density = 1 / 10000;
        const totalPoints = Math.ceil(area * density);
        const numWorkers = 2;
        const pointsPerWorker = Math.ceil(totalPoints / numWorkers);
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
                features: allPoints
              };
              allPointsBySuburb[suburbName] = { pollengeojson: pollenGeoJSON,feature:feature };
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
