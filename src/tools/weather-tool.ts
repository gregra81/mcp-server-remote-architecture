import axios, { AxiosInstance, AxiosResponse } from 'axios';
import https from 'https';
import type {
  MCPToolDefinition,
  WeatherParameters,
  WeatherResult,
} from '../types/mcp';

// Configure axios to ignore SSL certificate errors for testing
const axiosInstance: AxiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  timeout: 10000,
});

/**
 * Weather API handler (using OpenWeatherMap)
 */
export async function getWeatherHandler(
  parameters: Record<string, any>
): Promise<WeatherResult> {
  const { city, apiKey, units = 'metric' } = parameters as WeatherParameters;

  // If no API key provided, return mock data
  if (!apiKey) {
    return {
      success: true,
      mock: true,
      city: city,
      temperature: Math.floor(Math.random() * 30) + 10,
      description: 'Mock weather data - partly cloudy',
      humidity: Math.floor(Math.random() * 50) + 30,
      units: units,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}`;

    const response: AxiosResponse = await axiosInstance.get(url);

    return {
      success: true,
      city: response.data.name,
      country: response.data.sys.country,
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      windSpeed: response.data.wind?.speed || 0,
      units: units,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      city: city,
      temperature: 0,
      description: '',
      humidity: 0,
      units: units,
      timestamp: new Date().toISOString(),
    };
  }
}

export const weatherTool: MCPToolDefinition = {
  name: 'get_weather',
  description:
    'Get weather information for a specific city using OpenWeatherMap API',
  inputSchema: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: 'The city name to get weather for',
      },
      apiKey: {
        type: 'string',
        description:
          'OpenWeatherMap API key (optional, uses demo data if not provided)',
      },
      units: {
        type: 'string',
        description: 'Temperature units (metric, imperial, kelvin)',
        default: 'metric',
      },
    },
    required: ['city'],
  },
  handler: getWeatherHandler,
};
