# MCP SSE Server

A full-featured **Model Context Protocol (MCP)** server implementation using **Server-Sent Events (SSE)** with example HTTP POST tools.

## 🚀 Features

- **SSE-based MCP Server**: Real-time communication using Server-Sent Events
- **HTTP POST Tool**: Generic tool for making POST requests to any API
- **Weather API Tool**: Example integration with OpenWeatherMap API
- **Post Creation Tool**: Example using JSONPlaceholder API
- **Web Client**: Interactive HTML client for testing
- **Test Suite**: Automated testing scripts
- **Error Handling**: Comprehensive error handling and validation

## 🏗️ Architecture

```
mcp-sse-server/
├── src/
│   ├── server.js           # Main Express server with SSE endpoints
│   └── mcp-server.js       # MCP server implementation with tools
├── examples/
│   ├── client.html         # Interactive web client
│   └── test-tools.js       # Automated testing script
├── package.json
└── README.md
```

## 🛠️ Installation

1. **Clone or create the project**:
   ```bash
   mkdir mcp-sse-server
   cd mcp-sse-server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### SSE Endpoint
- **GET** `/mcp/sse` - Server-Sent Events stream for real-time communication

### HTTP Endpoints
- **GET** `/health` - Health check endpoint
- **GET** `/mcp/tools` - List available tools
- **POST** `/mcp/call-tool` - Execute a tool

## 🔧 Available Tools

### 1. `http_post` - Generic HTTP POST Tool
Makes HTTP POST requests to external APIs.

**Parameters**:
- `url` (string, required): Target URL
- `data` (object, required): JSON data to send
- `headers` (object, optional): Additional headers
- `timeout` (number, optional): Request timeout in ms

**Example**:
```json
{
  "tool": "http_post",
  "parameters": {
    "url": "https://httpbin.org/post",
    "data": {"message": "Hello World!"},
    "headers": {"User-Agent": "MCP-Client"},
    "timeout": 5000
  }
}
```

### 2. `get_weather` - Weather Information Tool
Gets weather data using OpenWeatherMap API (or returns mock data).

**Parameters**:
- `city` (string, required): City name
- `apiKey` (string, optional): OpenWeatherMap API key
- `units` (string, optional): Temperature units (metric/imperial/kelvin)

**Example**:
```json
{
  "tool": "get_weather",
  "parameters": {
    "city": "London",
    "units": "metric"
  }
}
```

### 3. `create_post` - Post Creation Tool
Creates posts using JSONPlaceholder API.

**Parameters**:
- `title` (string, required): Post title
- `body` (string, required): Post content
- `userId` (number, optional): User ID

**Example**:
```json
{
  "tool": "create_post",
  "parameters": {
    "title": "My Post",
    "body": "Post content here",
    "userId": 1
  }
}
```

## 🌐 Web Client Usage

1. **Open the client**: Navigate to `examples/client.html` in your browser
2. **Connect**: Click "Connect to MCP Server" to establish SSE connection
3. **Load Tools**: Click "Load Tools" to see available tools
4. **Test Tools**: Use the forms to test different tools:
   - **HTTP POST**: Send requests to any API
   - **Weather**: Get weather information
   - **Create Post**: Create test posts

## 🧪 Testing

### Automated Testing
Run the test suite:
```bash
node examples/test-tools.js
```

### Manual Testing with curl

**Health Check**:
```bash
curl http://localhost:3000/health
```

**List Tools**:
```bash
curl http://localhost:3000/mcp/tools
```

**Call HTTP POST Tool**:
```bash
curl -X POST http://localhost:3000/mcp/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "http_post",
    "parameters": {
      "url": "https://httpbin.org/post",
      "data": {"test": true},
      "headers": {"User-Agent": "curl-test"}
    }
  }'
```

**Test SSE Connection**:
```bash
curl -N http://localhost:3000/mcp/sse
```

## 🔄 MCP Protocol Implementation

This server implements key MCP protocol features:

### Server-Sent Events (SSE)
- Real-time bidirectional communication
- Connection management with keep-alive
- Event streaming for tool responses

### Tool System
- Dynamic tool registration
- JSON Schema validation
- Error handling and reporting
- Extensible architecture

### Capabilities
- Tools: ✅ Supported
- Resources: ❌ Not implemented
- Prompts: ❌ Not implemented  
- Logging: ✅ Supported

## 🚀 Extending the Server

### Adding New Tools

1. **Create tool handler** in `src/mcp-server.js`:
```javascript
async myCustomToolHandler(parameters) {
  const { param1, param2 } = parameters;
  
  try {
    // Your tool logic here
    const result = await someApiCall(param1, param2);
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

2. **Register the tool** in `initializeTools()`:
```javascript
this.tools.set('my_custom_tool', {
  name: 'my_custom_tool',
  description: 'Description of what this tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Description of param1'
      },
      param2: {
        type: 'number',
        description: 'Description of param2'
      }
    },
    required: ['param1']
  },
  handler: this.myCustomToolHandler.bind(this)
});
```

## 🐛 Debugging

### Server Logs
The server provides detailed logging:
- Client connections/disconnections
- Tool executions
- Error messages

### Client Debugging
The web client includes:
- Real-time connection status
- Server message log
- Request/response inspection

## 🔒 Security Considerations

- **Input Validation**: All tool parameters are validated
- **Timeout Protection**: HTTP requests have configurable timeouts
- **Error Handling**: Sensitive information is not exposed in errors
- **CORS**: Configured for development (adjust for production)

## 📚 Protocol References

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Server-Sent Events Standard](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your changes with tests
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Happy coding with MCP! 🚀** 