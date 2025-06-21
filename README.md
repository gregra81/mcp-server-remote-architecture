# MCP Tools Demo

A **Model Context Protocol (MCP)** implementation showcasing clean, modular tool architecture with **local and remote tools** support and an interactive browser client.

## 🌟 Features

- **🏗️ Clean Architecture**: Modular tool design with `MCPToolsManager`
- **🔧 8 Demo Tools**: 4 local + 4 remote tools working seamlessly together
- **🌐 Remote Tools Support**: Load tools dynamically from external APIs
- **🌐 Browser Client**: Interactive web interface for testing all tools
- **📡 Multiple Server Options**: Stdio, Simple HTTP, and Remote Tools servers
- **🔒 Type Safety**: Full TypeScript implementation with Zod validation

## 🚀 Quick Start

### 1. Installation

```bash
git clone <your-repo-url>
cd mcp-hello-world
npm install
```

### 2. Full Demo (Local + Remote Tools)

Start both servers for the complete experience:

```bash
# Terminal 1: Start remote tools server (4 remote tools)
npm run start:remote

# Terminal 2: Start HTTP server (4 local + 4 remote = 8 total tools)
npm run start:http
```

Then open: **http://localhost:3000/examples/client.html**

### 3. Local Tools Only

```bash
# Just local tools (4 tools)
REMOTE_TOOLS_ENABLED=false npm run start:http
```

### 4. Command Line Usage (Cursor/Claude)

```bash
npm run build
node dist/index.js  # Stdio MCP server
```

## 🏗️ Architecture

### Modular Structure

```
mcp-hello-world/
├── src/
│   ├── index.ts                 # Main MCP stdio server
│   ├── mcp-tools-manager.ts     # Generic tools manager (local + remote)
│   ├── simple-http-server.ts    # HTTP wrapper with remote tools support
│   ├── tools/                   # 🏠 Local tools directory
│   │   ├── index.ts            # Tools exports and registry
│   │   ├── greg-test-tool.ts   # Mood testing tool
│   │   ├── http-post-tool.ts   # Generic HTTP POST
│   │   ├── weather-tool.ts     # Weather API integration
│   │   └── create-post-tool.ts # JSONPlaceholder posts
│   └── types/mcp.ts            # TypeScript definitions
├── examples/
│   ├── client.html             # 🌐 Interactive browser client
│   ├── remote-tools-api-example.json      # Remote tools definition
│   └── remote-tool-server-example.js     # 🌐 Remote tools server
└── dist/                       # Compiled JavaScript
```

### Key Design Principles

- **Single Source of Truth**: Local tools in `src/tools/`, remote tools via API
- **Generic Manager**: `MCPToolsManager` automatically loads all tools
- **Hot-loadable**: Remote tools can be added/updated without restart
- **Multiple Interfaces**: Same tools work with stdio, HTTP, and browser

## 🔧 Available Tools

### 🏠 Local Tools (4)
1. **🎭 Greg Test** (`greg-test`) - Mood testing tool
2. **🌐 HTTP POST** (`http_post`) - Generic HTTP requests
3. **🌤️ Weather** (`get_weather`) - Weather API with OpenWeatherMap
4. **📄 Create Post** (`create_post`) - JSONPlaceholder integration

### 🌐 Remote Tools (4)
1. **🧮 Calculate Tax** (`calculate_tax`) - Tax calculations
2. **📧 Send Email** (`send_email`) - Mock email sending
3. **🖼️ Image OCR** (`image_ocr`) - Mock text extraction
4. **🗄️ Database Query** (`database_query`) - Mock SQL queries

## 🌐 Remote Tools Support

Load tools dynamically from external APIs alongside local tools.

### Quick Configuration

```typescript
const toolsManager = new MCPToolsManager({
  enabled: true,
  toolsUrl: 'http://localhost:3001/mcp/tools',
  timeout: 5000,
  retryAttempts: 2,
});

await toolsManager.initialize();
```

### Remote Tools API Format

Your remote API should return:

```json
{
  "tools": [
    {
      "name": "calculate_tax",
      "description": "Calculate tax for given amount",
      "executeUrl": "https://api.example.com/tools/calculate-tax",
      "method": "POST",
      "inputSchema": {
        "type": "object",
        "properties": {
          "amount": {"type": "number"},
          "rate": {"type": "number"}
        },
        "required": ["amount", "rate"]
      }
    }
  ]
}
```

### Environment Configuration

```bash
export REMOTE_TOOLS_ENABLED=true              # Enable/disable remote tools
export REMOTE_TOOLS_URL=http://localhost:3001/mcp/tools
export REMOTE_TOOLS_TIMEOUT=5000
export REMOTE_TOOLS_RETRY_ATTEMPTS=2
```

## 🌐 Browser Client

The interactive web client dynamically loads and displays **ALL available tools**:

### Features
- **🔍 Auto-Discovery**: Loads all tools from server (local + remote)
- **🎯 Quick Tests**: One-click testing for all 8 tools
- **📊 Tool Statistics**: Shows local vs remote breakdown
- **✅ Health Monitoring**: Real-time server status
- **🔄 Dynamic Updates**: Reflects tool availability in real-time

### Usage
1. Start servers: `npm run start:remote && npm run start:http`
2. Open: http://localhost:3000/examples/client.html
3. Click "Load Available Tools" to see all 8 tools
4. Use quick test buttons or detailed tool information

## 🚀 Running the Servers

### HTTP Server (Browser Demo)
```bash
npm run start:http      # Local tools only
# OR with remote tools:
npm run start:remote    # Terminal 1: Remote tools server
npm run start:http      # Terminal 2: HTTP server (8 tools total)
```

### Stdio Server (Cursor/Claude Integration)
```bash
npm run build
node dist/index.js
```

Then add to your MCP configuration:
```json
{
  "mcpServers": {
    "demo-tools": {
      "command": "node",
      "args": ["path/to/mcp-server-remote-architecture/dist/index.js"]
    }
  }
}
```

## 🧪 Testing

### Quick API Tests
```bash
# Test tool endpoints
curl http://localhost:3000/mcp/tools          # All tools
curl http://localhost:3000/mcp/tools/local    # Local tools only  
curl http://localhost:3000/mcp/tools/remote   # Remote tools only

# Test specific tools
curl http://localhost:3000/mcp/test/greg-test
curl http://localhost:3000/mcp/test/calculate_tax  # Remote tool
```

### Tool Calls
```bash
curl -X POST http://localhost:3000/mcp/call-tool \
  -H "Content-Type: application/json" \
  -d '{"tool": "calculate_tax", "parameters": {"amount": 100, "rate": 0.08}}'
```

## 🔧 Adding New Tools

### Local Tools
1. Create `src/tools/my-tool.ts`
2. Export from `src/tools/index.ts`
3. Done! Auto-loaded everywhere.

### Remote Tools
1. Add tool definition to your remote API
2. Implement the execution endpoint
3. Tools appear automatically when server loads

## 📄 License

MIT License - see LICENSE file for details.
