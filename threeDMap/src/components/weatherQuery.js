import { fetchWeatherApi } from 'openmeteo';

// async function fetchForecastWithLimit(tasks, limit = 10) {
//     const results = [];
//     const executing = [];
  
//     for (const task of tasks) {
//       const p = task().then(result => {
//         results.push(result);
//       });
//       executing.push(p);
  
//       if (executing.length >= limit) {
//         await Promise.race(executing);
//         // 删除已经完成的
//         executing.splice(executing.findIndex(p => p.isFulfilled || p.isRejected), 1);
//       }
//     }
//     await Promise.all(executing);
//     return results;
//   }


export async function fetchForecast(latitude, longitude) {
    const today = new Date();
    const tomorrow = new Date();
    today.setDate(tomorrow.getDate() - 1);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const params = {
        latitude,
        longitude,
        start_date: formatDate(today),
        end_date: formatDate(tomorrow),
        daily: ["temperature_2m_mean", "wind_speed_10m_max", "wind_direction_10m_dominant", "precipitation_sum", "snowfall_sum", "weather_code", "rain_sum"],
    };
    const url = "https://archive-api.open-meteo.com/v1/archive";

    try {
        const responses = await fetchWeatherApi(url, params);
        const response = responses[0];

        const utcOffsetSeconds = response.utcOffsetSeconds();
        const daily = response.daily();

        const weatherData = {
        daily: {
            time: [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())].map(
            (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
            ),
            temperature2mMean: daily.variables(0).valuesArray(),
            windSpeed10mMax: daily.variables(1).valuesArray(),
            windDirection10mDominant: daily.variables(2).valuesArray(),
            precipitationSum: daily.variables(3).valuesArray(),
            snowfallSum: daily.variables(4).valuesArray(),
            weatherCode: daily.variables(5).valuesArray(),
            rainSum: daily.variables(6).valuesArray(),
        },
        };

        return weatherData;
    } catch (error) {
        console.error("Error fetching forecast:", error);
        return null;
    }
  }
  
  export async function fetchPollen(latitude, longitude) {
    try {
        // 模拟 API 返回空的 JSON 数据
        const data = {}; 
    
        console.log("Pollen Data:", data,latitude,longitude);
        return data;
      } catch (error) {
        console.error('Error:', error);
        return null; 
      }
  }