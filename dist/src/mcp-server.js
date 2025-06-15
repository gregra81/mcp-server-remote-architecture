import axios from 'axios';
import https from 'https';
// Configure axios to ignore SSL certificate errors for testing
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
    timeout: 10000
});
/**
 * MCP Server implementation with tool support
 */
export class MCPServer {
    constructor() {
        this.tools = new Map();
        this.initializeTools();
    }
    /**
     * Initialize available tools
     */
    initializeTools() {
        // HTTP POST tool
        this.tools.set('http_post', {
            name: 'http_post',
            description: 'Make HTTP POST requests to external APIs',
            inputSchema: {
                type: 'object',
                properties: {
                    url: {
                        type: 'string',
                        description: 'The URL to send the POST request to'
                    },
                    data: {
                        type: 'object',
                        description: 'The JSON data to send in the request body'
                    },
                    headers: {
                        type: 'object',
                        description: 'Additional headers to include in the request',
                        default: {}
                    },
                    timeout: {
                        type: 'number',
                        description: 'Request timeout in milliseconds',
                        default: 5000
                    }
                },
                required: ['url', 'data']
            },
            handler: this.httpPostHandler.bind(this)
        });
        // Weather API tool (example using a real API)
        this.tools.set('get_weather', {
            name: 'get_weather',
            description: 'Get weather information for a specific city using OpenWeatherMap API',
            inputSchema: {
                type: 'object',
                properties: {
                    city: {
                        type: 'string',
                        description: 'The city name to get weather for'
                    },
                    apiKey: {
                        type: 'string',
                        description: 'OpenWeatherMap API key (optional, uses demo data if not provided)'
                    },
                    units: {
                        type: 'string',
                        description: 'Temperature units (metric, imperial, kelvin)',
                        default: 'metric'
                    }
                },
                required: ['city']
            },
            handler: this.getWeatherHandler.bind(this)
        });
        // JSON placeholder POST tool (example with real endpoint)
        this.tools.set('create_post', {
            name: 'create_post',
            description: 'Create a new post using JSONPlaceholder API (example API)',
            inputSchema: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: 'The title of the post'
                    },
                    body: {
                        type: 'string',
                        description: 'The body content of the post'
                    },
                    userId: {
                        type: 'number',
                        description: 'The user ID creating the post',
                        default: 1
                    }
                },
                required: ['title', 'body']
            },
            handler: this.createPostHandler.bind(this)
        });
        console.log(`Initialized ${this.tools.size} tools`);
    }
    /**
     * Generic HTTP POST handler
     */
    async httpPostHandler(parameters) {
        const { url, data, headers = {}, timeout = 5000 } = parameters;
        try {
            const config = {
                timeout,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };
            const response = await axiosInstance.post(url, data, config);
            return {
                success: true,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data: response.data,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                status: error.response?.status || undefined,
                statusText: error.response?.statusText || undefined,
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * Weather API handler (using OpenWeatherMap)
     */
    async getWeatherHandler(parameters) {
        const { city, apiKey, units = 'metric' } = parameters;
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
                timestamp: new Date().toISOString()
            };
        }
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}`;
            const response = await axiosInstance.get(url);
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
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                city: city,
                temperature: 0,
                description: '',
                humidity: 0,
                units: units,
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * JSONPlaceholder create post handler
     */
    async createPostHandler(parameters) {
        const { title, body, userId = 1 } = parameters;
        try {
            const response = await axiosInstance.post('https://jsonplaceholder.typicode.com/posts', {
                title,
                body,
                userId
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                post: response.data,
                message: 'Post created successfully',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * Get server capabilities
     */
    getCapabilities() {
        return {
            tools: {
                supported: true,
                listChanged: false
            },
            resources: {
                supported: false
            },
            prompts: {
                supported: false
            },
            logging: {
                supported: true
            }
        };
    }
    /**
     * Get all available tools
     */
    getTools() {
        return Array.from(this.tools.values()).map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
        }));
    }
    /**
     * Call a specific tool
     */
    async callTool(toolName, parameters) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            throw new Error(`Tool '${toolName}' not found`);
        }
        // Validate parameters against schema (basic validation)
        const requiredParams = tool.inputSchema.required || [];
        for (const param of requiredParams) {
            if (!(param in parameters)) {
                throw new Error(`Required parameter '${param}' is missing`);
            }
        }
        // Call the tool handler
        try {
            const result = await tool.handler(parameters);
            return {
                tool: toolName,
                result: result,
                executedAt: new Date().toISOString()
            };
        }
        catch (error) {
            throw new Error(`Tool execution failed: ${error.message}`);
        }
    }
}
//# sourceMappingURL=mcp-server.js.map