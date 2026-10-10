import { supabase, isSupabaseConfigured } from './supabaseClient';
import { WeatherLog } from '../types';

export interface DailyForecastItem {
  date: string;
  day: string;
  high: string;
  low: string;
  cond: string;
  rainProb: string;
  wind: string;
  recommendedAction: string;
}

export interface LiveWeatherReport {
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  condition_desc: string;
  log_date: string;
  forecast_advisory: string;
  dailyForecast: DailyForecastItem[];
}

function interpretWmoCode(code: number): string {
  switch (code) {
    case 0:
      return 'Sunny & Clear';
    case 1:
      return 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Fog & Mist';
    case 51:
    case 53:
    case 55:
      return 'Light Drizzle';
    case 61:
      return 'Light Rain';
    case 63:
      return 'Moderate Rain';
    case 65:
      return 'Heavy Precipitation';
    case 80:
    case 81:
    case 82:
      return 'Rain Showers';
    case 95:
    case 96:
    case 99:
      return 'Thunderstorm Warning';
    default:
      return 'Partly Cloudy';
  }
}

function generateAdvisory(temp: number, humidity: number, rain: number, wind: number, rainProb = 0): string {
  if (rain > 2 || rainProb >= 50) {
    return 'Precipitation Warning: Postpone foliar nutrient and chemical spraying. Inspect perimeter farm trenches and clear drainage channels to prevent waterlogging around root zones.';
  }
  if (temp >= 35) {
    return 'High Thermal Index: Elevate early morning drip irrigation frequency (05:30 - 08:30) to mitigate crop evapotranspiration stress and preserve grain filling.';
  }
  if (humidity >= 80) {
    return 'Elevated Humidity Advisory: Micro-climate favors fungal pathogens (downy mildew & blight). Inspect crop canopy under-leaves and maintain recommended row ventilation.';
  }
  if (wind >= 25) {
    return 'Gust Advisory: High wind velocity detected. Delay high-pressure boom spraying to prevent pesticide drift and secure nursery polyhouse shade nets.';
  }
  return 'Optimal Atmospheric Window: Stable temperatures and moderate humidity favor fieldwork, harvest grain aeration, and scheduled drip fertigation.';
}

export const weatherService = {
  /**
   * Fetch live weather telemetry and 7-day predictive forecast using Open-Meteo
   */
  async getLiveWeather(locationName?: string, farmId?: string): Promise<LiveWeatherReport> {
    let lat = 19.9975;
    let lon = 73.7898;
    let resolvedLocation = locationName?.trim() || 'Nashik, Maharashtra';

    // Geocode if a specific location name is supplied
    if (locationName && locationName.trim()) {
      try {
        const cleanName = locationName.replace(/[^\w\s,]/gi, ' ').trim();
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanName)}&count=1&language=en&format=json`
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            lat = geoData.results[0].latitude;
            lon = geoData.results[0].longitude;
            const r = geoData.results[0];
            resolvedLocation = [r.name, r.admin1, r.country].filter(Boolean).join(', ');
          }
        }
      } catch (err) {
        console.warn('Geocoding service note: using default coordinates:', err);
      }
    }

    // Query Open-Meteo Forecast API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      throw new Error(`Weather service returned HTTP ${weatherRes.status}`);
    }

    const data = await weatherRes.json();
    const current = data.current || {};
    const daily = data.daily || {};

    const temp = Math.round((current.temperature_2m ?? 28) * 10) / 10;
    const humidity = Math.round(current.relative_humidity_2m ?? 65);
    const rainfall = Math.round((current.precipitation ?? 0) * 10) / 10;
    const windSpeed = Math.round((current.wind_speed_10m ?? 12) * 10) / 10;
    const condDesc = interpretWmoCode(current.weather_code ?? 0);
    const advisory = generateAdvisory(temp, humidity, rainfall, windSpeed);

    const dailyForecast: DailyForecastItem[] = [];
    const dates: string[] = daily.time || [];
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < Math.min(dates.length, 5); i++) {
      const d = new Date(dates[i]);
      const dayName = i === 0 ? 'Today' : daysOfWeek[d.getDay()];
      const high = `${Math.round(daily.temperature_2m_max?.[i] ?? 30)}°C`;
      const low = `${Math.round(daily.temperature_2m_min?.[i] ?? 20)}°C`;
      const rainProbVal = daily.precipitation_probability_max?.[i] ?? 0;
      const rainProb = `${rainProbVal}%`;
      const windVal = Math.round(daily.wind_speed_10m_max?.[i] ?? 12);
      const wind = `${windVal} km/h`;
      const dayCond = interpretWmoCode(daily.weather_code?.[i] ?? 0);

      let action = 'Optimal for field tilling & fertigation';
      if (rainProbVal >= 50) {
        action = 'Hold pesticide spray; precipitation anticipated';
      } else if ((daily.temperature_2m_max?.[i] ?? 0) >= 35) {
        action = 'Increase early drip irrigation; heat mitigation';
      } else if (windVal >= 22) {
        action = 'Postpone drone spraying; high wind velocity';
      }

      dailyForecast.push({
        date: dates[i],
        day: `${dayName} (${dates[i].slice(5)})`,
        high,
        low,
        cond: dayCond,
        rainProb,
        wind,
        recommendedAction: action
      });
    }

    const report: LiveWeatherReport = {
      location: resolvedLocation,
      latitude: lat,
      longitude: lon,
      temperature: temp,
      humidity,
      rainfall,
      wind_speed: windSpeed,
      condition_desc: condDesc,
      log_date: new Date().toISOString().split('T')[0],
      forecast_advisory: advisory,
      dailyForecast
    };

    // Optionally log to weather_logs if farmId is provided and Supabase is connected
    if (farmId && isSupabaseConfigured && supabase) {
      try {
        await supabase.from('weather_logs').insert([{
          farm_id: farmId,
          temperature: report.temperature,
          humidity: report.humidity,
          rainfall: report.rainfall,
          wind_speed: report.wind_speed,
          condition_desc: report.condition_desc,
          log_date: report.log_date,
          forecast_advisory: report.forecast_advisory
        }]);
      } catch (err) {
        console.warn('Auto weather logging note:', err);
      }
    }

    return report;
  },

  async getWeatherLogs(farmId?: string): Promise<WeatherLog[]> {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    let query = supabase.from('weather_logs').select('*');
    if (farmId) {
      query = query.eq('farm_id', farmId);
    }

    const { data, error } = await query.order('log_date', { ascending: false });
    if (error) {
      console.warn('Error fetching weather logs from Supabase:', error.message);
      return [];
    }
    return (data || []) as WeatherLog[];
  },

  async recordWeatherLog(log: Omit<WeatherLog, 'log_id'>): Promise<WeatherLog> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('weather_logs')
      .insert([{
        farm_id: log.farm_id,
        temperature: log.temperature,
        humidity: log.humidity,
        rainfall: log.rainfall ?? 0,
        wind_speed: log.wind_speed ?? 0,
        condition_desc: log.condition_desc,
        log_date: log.log_date || new Date().toISOString().split('T')[0],
        forecast_advisory: log.forecast_advisory || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error recording weather log:', error);
      throw new Error(error.message);
    }
    return data as WeatherLog;
  },

  async fetchLiveWeatherTelemetry(latitude: number, longitude: number): Promise<{
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    condition: string;
    advisory: string;
  }> {
    const report = await this.getLiveWeather();
    return {
      temperature: report.temperature,
      humidity: report.humidity,
      rainfall: report.rainfall,
      windSpeed: report.wind_speed,
      condition: report.condition_desc,
      advisory: report.forecast_advisory
    };
  }
};
