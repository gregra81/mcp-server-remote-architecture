# MCP Tools Demo

A **Model Context Protocol (MCP)** implementation showcasing clean, modular tool architecture with multiple server options and an interactive browser client.

## 🌟 Features

- **🏗️ Clean Architecture**: Modular tool design with `MCPToolsManager`
- **🔧 4 Demo Tools**: HTTP POST, Weather API, Create Post, and Greg Test tools
- **🌐 Remote Tools Support**: Load tools dynamically from external APIs
- **🌐 Browser Client**: Interactive web interface for testing tools
- **📡 Multiple Server Options**: Stdio and Simple HTTP
- **🧪 Comprehensive Testing**: Automated test suites and manual testing options
- **🔒 Type Safety**: Full TypeScript implementation with Zod validation

## 🚀 Quick Start

### 1. Installation

```bash
git clone <your-repo-url>
cd mcp-hello-world
npm install
```

### 2. Browser Demo (Recommended)

Start the HTTP server and open the browser client:

```bash
npm run start:http
```

Then open: **http://localhost:3000/examples/client.html**

### 3. Command Line Usage

```bash
# Build the project
npm run build

# Test tools directly
node dist/index.js  # Stdio MCP server (for Cursor/Claude)
```

## Key Design Principles

- **Single Source of Truth**: All tools defined in `src/tools/` directory
- **Generic Manager**: `MCPToolsManager` automatically loads all tools
- **Modular Tools**: Each tool is self-contained with handler and schema
- **Multiple Interfaces**: Same tools work with stdio, HTTP, SSE, and streaming

## 🔧 Available Tools

### 1. 🎭 Greg Test Tool (`greg-test`)
Your amazing mood testing tool!

**Parameters**:
- `feeling` (string, required): Your current mood

**Example**:
```json
{
  "tool": "greg-test",
  "parameters": {
    "feeling": "excited about the new architecture"
  }
}
```

### 2. 🌐 HTTP POST Tool (`http_post`)
Make HTTP POST requests to any API.

**Parameters**:
- `url` (string, required): Target URL
- `data` (object, required): JSON data to send
- `headers` (object, optional): Additional headers
- `timeout` (number, optional): Request timeout in ms

### 3. 🌤️ Weather Tool (`get_weather`)
Get weather information using OpenWeatherMap API (or mock data).

**Parameters**:
- `city` (string, required): City name
- `apiKey` (string, optional): OpenWeatherMap API key
- `units` (string, optional): Temperature units (metric/imperial/kelvin)

### 4. 📄 Create Post Tool (`create_post`)
Create posts using JSONPlaceholder API.

**Parameters**:
- `title` (string, required): Post title
- `body` (string, required): Post content
- `userId` (number, optional): User ID

## 🌐 Remote Tools Support

The **MCPToolsManager** now supports loading tools from **external APIs** alongside local tools, enabling distributed tool architectures and dynamic tool discovery.

### ✨ Key Features

- **🔌 Plug & Play**: Load tools from any HTTP API
- **🔄 Dynamic Discovery**: Tools are fetched at runtime
- **🛡️ Robust Validation**: Zod schema validation with JSON Schema fallback
- **⚡ Fault Tolerance**: Graceful degradation when remote APIs are unavailable
- **🎯 Mixed Architecture**: Local and remote tools work seamlessly together
- **🔄 Refresh Capability**: Reload remote tools without restart

### 🚀 Quick Start with Remote Tools

#### 1. Basic Configuration

```typescript
import { MCPToolsManager } from './mcp-tools-manager.js';

const toolsManager = new MCPToolsManager({
  enabled: true,
  toolsUrl: 'https://api.example.com/mcp/tools',
  timeout: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
});

await toolsManager.initialize();
```

#### 2. Environment-Based Configuration

```typescript
const config = {
  enabled: process.env.REMOTE_TOOLS_ENABLED === 'true',
  toolsUrl: process.env.REMOTE_TOOLS_URL,
  timeout: parseInt(process.env.REMOTE_TOOLS_TIMEOUT || '10000'),
  retryAttempts: parseInt(process.env.REMOTE_TOOLS_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.REMOTE_TOOLS_RETRY_DELAY || '1000'),
};

const toolsManager = new MCPToolsManager(config);
await toolsManager.initialize();
```

### 📋 Remote Tools API Format

Your remote API should return a JSON response with this structure:

```json
{
  "version": "1.0",
  "timestamp": "2024-01-01T00:00:00Z",
  "tools": [
    {
      "name": "calculate_tax",
      "description": "Calculate tax for a given amount and rate",
      "executeUrl": "https://api.example.com/tools/calculate-tax",
      "method": "POST",
      "timeout": 5000,
      "headers": {
        "Authorization": "Bearer your-api-key",
        "X-Tool-Version": "1.0"
      },
      "inputSchema": {
        "type": "object",
        "properties": {
          "amount": {
            "type": "number",
            "description": "The amount to calculate tax for"
          },
          "rate": {
            "type": "number", 
            "description": "Tax rate as decimal (e.g., 0.08 for 8%)"
          },
          "currency": {
            "type": "string",
            "description": "Currency code",
            "default": "USD"
          }
        },
        "required": ["amount", "rate"]
      }
    }
  ]
}
```

### 🔧 Remote Tool Execution

When a remote tool is called, the MCPToolsManager sends a POST request to the tool's `executeUrl`:

**Request Format:**
```json
{
  "tool": "calculate_tax",
  "parameters": {
    "amount": 100,
    "rate": 0.08,
    "currency": "USD"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Response Format:**
```json
{
  "success": true,
  "result": {
    "originalAmount": 100,
    "taxRate": 0.08,
    "taxAmount": 8,
    "totalAmount": 108,
    "currency": "USD",
    "calculation": "100 + (100 × 0.08) = 108"
  },
  "executedAt": "2024-01-01T12:00:00Z"
}
```

### 🛠️ Creating a Remote Tools Server

Create your own remote tools server that implements the API:

```typescript
import express from 'express';

const app = express();
app.use(express.json());

// List available tools
app.get('/mcp/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: 'calculate_tax',
        description: 'Calculate tax for given amount',
        executeUrl: 'http://localhost:3001/tools/calculate-tax',
        method: 'POST',
        inputSchema: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            rate: { type: 'number' }
          },
          required: ['amount', 'rate']
        }
      }
    ]
  });
});

// Implement tool execution
app.post('/tools/calculate-tax', (req, res) => {
  const { amount, rate } = req.body.parameters;
  const taxAmount = amount * rate;
  
  res.json({
    success: true,
    result: {
      originalAmount: amount,
      taxAmount: taxAmount,
      totalAmount: amount + taxAmount
    },
    executedAt: new Date().toISOString()
  });
});

app.listen(3001);
```

### 📊 Managing Local vs Remote Tools

```typescript
// Get tool statistics
const stats = toolsManager.getToolStats();
console.log(stats); 
// { total: 6, local: 4, remote: 2, remoteApiEnabled: true }

// Get tools by type
const localTools = toolsManager.getToolsByType('local');
const remoteTools = toolsManager.getToolsByType('remote');

// Refresh remote tools without restart
await toolsManager.refreshRemoteTools();
```

### 🎯 Use Cases for Remote Tools

#### **Microservices Architecture**
```typescript
// Different services can provide specialized tools
const config = {
  enabled: true,
  toolsUrl: 'https://billing-service.company.com/mcp/tools'
};
```

#### **Third-Party Integrations**
```typescript
// External providers can offer tools via API
const config = {
  enabled: true,
  toolsUrl: 'https://api.external-provider.com/mcp/tools',
  headers: { 'Authorization': 'Bearer api-key' }
};
```

#### **Dynamic Tool Loading**
```typescript
// Tools can be deployed independently and discovered at runtime
const config = {
  enabled: true,
  toolsUrl: process.env.TOOLS_REGISTRY_URL
};
```

### 🔒 Security & Best Practices

- **🔐 Authentication**: Use API keys or tokens in headers
- **✅ Validation**: Always validate parameters before remote calls
- **⏱️ Timeouts**: Set appropriate timeouts for remote calls
- **🔄 Retry Logic**: Implement exponential backoff for failures
- **📊 Monitoring**: Log remote tool performance and failures
- **🛡️ Error Handling**: Never expose sensitive data in error messages

### 🧪 Testing Remote Tools

```bash
# Start example remote server (port 3001)
npm run start:remote

# Test enhanced manager with both local and remote tools
npx tsx examples/test-enhanced-manager.ts
```

The test will show:
- ✅ Local tools (4 loaded)
- ✅ Remote tools (2 loaded when server running)
- ✅ Parameter validation with Zod
- ✅ Graceful failure handling
- ✅ Tool statistics and filtering

### 🏗️ Architecture Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Tool Deployment** | Restart required | Hot-loadable via API |
| **Scaling** | Single process | Distributed services |
| **Updates** | Code deployment | API configuration |
| **Integration** | Direct code changes | External APIs |
| **Flexibility** | Static tool set | Dynamic discovery |

### 📁 Example Files

- `examples/remote-tools-api-example.json` - Complete API response example
- `examples/remote-tools-config-example.ts` - Configuration examples
- `examples/remote-tool-server-example.ts` - Sample remote server
- `examples/test-enhanced-manager.ts` - Test suite

## 🌐 Browser Client

The interactive web client provides a beautiful interface for testing all tools:

### Features
- **🔍 Auto-Discovery**: Automatically loads all available tools
- **🎯 Quick Tests**: One-click testing with default parameters
- **📋 Individual Forms**: Detailed input forms for each tool
- **📊 Real-time Logging**: Activity log with timestamps
- **✅ Health Monitoring**: Server connection status

### Usage
1. Start the HTTP server: `npm run start:http`
2. Open: http://localhost:3000/examples/client.html
3. Click "Check Server Health" to connect
4. Use "Load Available Tools" to see all tools
5. Test tools with quick buttons or detailed forms

## 🚀 Running the Servers

### 1. HTTP Server (Browser Demo)
```bash
npm run start:http      # Production build + start
```
**URL**: http://localhost:3000

### 2. Stdio Server (Cursor/Claude Integration)
```bash
npm run build
```

Then in your mcp servers setup add the following:

```
{
  "mcpServers": {
    "demo-mcp": {
        "command": "node",
        "args": [
            "~/Development/dead-simple-mcp-server/dist/index.js"
        ]
      }
    }
}

```

## 📄 License

MIT License - see LICENSE file for details.

