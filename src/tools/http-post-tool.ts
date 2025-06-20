import axios, { AxiosInstance, AxiosResponse } from 'axios';
import https from 'https';
import type {
  MCPToolDefinition,
  HttpPostParameters,
  HttpPostResult,
} from '../types/mcp.js';

// Configure axios to ignore SSL certificate errors for testing
const axiosInstance: AxiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  timeout: 10000,
});

/**
 * Generic HTTP POST handler
 */
export async function httpPostHandler(
  parameters: Record<string, any>
): Promise<HttpPostResult> {
  const {
    url,
    data,
    headers = {},
    timeout = 5000,
  } = parameters as HttpPostParameters;

  try {
    const config = {
      timeout,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const response: AxiosResponse = await axiosInstance.post(url, data, config);

    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status || undefined,
      statusText: error.response?.statusText || undefined,
      timestamp: new Date().toISOString(),
    };
  }
}

export const httpPostTool: MCPToolDefinition = {
  name: 'http_post',
  description: 'Make HTTP POST requests to external APIs',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to send the POST request to',
      },
      data: {
        type: 'object',
        description: 'The JSON data to send in the request body',
      },
      headers: {
        type: 'object',
        description: 'Additional headers to include in the request',
        default: {},
      },
      timeout: {
        type: 'number',
        description: 'Request timeout in milliseconds',
        default: 5000,
      },
    },
    required: ['url', 'data'],
  },
  handler: httpPostHandler,
};
