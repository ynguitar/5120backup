import Worker from "@/workers/randomPointWorker.js?worker";

// suburbNames 是对象数组，每个对象有 { suburbName: string }
export async function generatePollenPointsBySuburbs(suburbNames) {
  const geojson = await fetch('/data/victoria_suburb_boundary.geojson').then(res => res.json());

  // 用于存储每个 suburb 对应的 pollen geojson
  const allPointsBySuburb = {};

  const workerPromises = suburbNames.map(({ suburbName }) => {
    const feature = geojson.features.find(f =>
      f.properties.vic_loca_2.toLowerCase() === suburbName.toLowerCase()
    );

    if (!feature) {
      console.warn(`No feature found for suburb: ${suburbName}`);
      return null; // 用 null 占位，后面 filter 掉
    }

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
          const { points } = event.data;
          allPoints.push(...points);
          finishedWorkers++;

          if (finishedWorkers === numWorkers) {
            // 生成 GeoJSON
            const pollenGeoJSON = {
              type: 'FeatureCollection',
              features: allPoints.map((point) => ({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [point.longitude, point.latitude],
                },
                properties: {},
              })),
            };

            // 存储数据
            allPointsBySuburb[suburbName] = {
              pollengeojson: pollenGeoJSON
            };

            workers.forEach(w => w.terminate());
            resolve();
          }
        };

        worker.onerror = (err) => {
          console.error(`Worker error in ${suburbName}:`, err);
          workers.forEach(w => w.terminate());
          resolve(); // 避免挂起，继续下一个
        };
      }
    });
  });

  // 过滤 null 的项，执行所有有效 promise
  await Promise.all(workerPromises.filter(Boolean));

  return allPointsBySuburb;
}