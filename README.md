# MCP Tools Demo

A **Model Context Protocol (MCP)** implementation showcasing clean, modular tool architecture with **local and remote tools** support and an interactive browser client.

## 🌟 Features

- **🏗️ Clean Architecture**: Modular tool design with `MCPToolsManager`
- **🔧 8 Demo Tools**: 4 local + 4 remote tools working seamlessly together
- **🌐 Remote Tools Support**: Load tools dynamically from external APIs
- **🌐 Browser Client**: Interactive web interface for testing all tools
- **🔧 Admin Panel**: Powerful web-based tool management with on/off toggles
- **⚡ Tool Configuration**: JSON-based tool state management with persistence
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

Then open:

- **Client Interface**: http://localhost:3000/examples/client.html
- **Admin Panel**: http://localhost:3000/examples/admin.html

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
│   ├── tool-config.ts          # 🔧 Tool configuration manager
│   ├── tools/                   # 🏠 Local tools directory
│   │   ├── index.ts            # Tools exports and registry
│   │   ├── greg-test-tool.ts   # Mood testing tool
│   │   ├── http-post-tool.ts   # Generic HTTP POST
│   │   ├── weather-tool.ts     # Weather API integration
│   │   └── create-post-tool.ts # JSONPlaceholder posts
│   └── types/mcp.ts            # TypeScript definitions
├── examples/
│   ├── client.html             # 🌐 Interactive browser client
│   ├── admin.html              # 🔧 Admin panel for tool management
│   ├── remote-tools-api-example.json      # Remote tools definition
│   └── remote-tool-server-example.js     # 🌐 Remote tools server
├── tool-config.json            # ⚡ Tool configuration state
└── dist/                       # Compiled JavaScript
```

### Key Design Principles

- **Single Source of Truth**: Local tools in `src/tools/`, remote tools via API
- **Generic Manager**: `MCPToolsManager` automatically loads all tools
- **Tool Configuration**: JSON-based persistent tool state management
- **Hot-loadable**: Remote tools can be added/updated without restart
- **Multiple Interfaces**: Same tools work with stdio, HTTP, and browser
- **Admin Control**: Web-based tool management with real-time toggles

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
          "amount": { "type": "number" },
          "rate": { "type": "number" }
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

## 🔧 Admin Panel

**Powerful web-based tool management interface** for controlling tool availability:

### Features

- **🎛️ Tool Toggles**: Enable/disable individual tools with visual switches
- **📊 Real-time Statistics**: Live dashboard showing enabled/disabled counts
- **⚡ Bulk Operations**: Enable All / Disable All tools at once
- **🔄 Auto-refresh**: Automatically syncs with server every 30 seconds
- **🎨 Modern UI**: Beautiful, responsive interface with visual feedback
- **💾 Persistent State**: Tool configurations saved to `tool-config.json`

### Default Behavior

**All tools are disabled by default** - you must enable them via the admin panel.

### Usage

1. Start server: `npm run start:http`
2. Open admin panel: http://localhost:3000/examples/admin.html
3. Toggle tools on/off as needed
4. Use client interface to test: http://localhost:3000/examples/client.html

### Tool Configuration File

The admin panel manages `tool-config.json` with this structure:

```json
[
  {
    "toolName": "greg-test",
    "enabled": true
  },
  {
    "toolName": "http_post",
    "enabled": false
  }
]
```

## 🌐 Browser Client

The interactive web client dynamically loads and displays **ONLY enabled tools**:

### Features

- **🔍 Auto-Discovery**: Loads enabled tools from server (local + remote)
- **🎯 Quick Tests**: One-click testing for enabled tools
- **📊 Tool Statistics**: Shows local vs remote breakdown
- **✅ Health Monitoring**: Real-time server status
- **🔄 Dynamic Updates**: Reflects tool availability in real-time

### Usage

1. Start servers: `npm run start:remote && npm run start:http`
2. Enable tools in admin panel: http://localhost:3000/examples/admin.html
3. Use client interface: http://localhost:3000/examples/client.html
4. Click "Load Available Tools" to see enabled tools
5. Use quick test buttons or detailed tool information

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

**Important for Cursor/Claude**:

- **All tools are disabled by default** - you'll see 0 tools initially
- **Enable tools first**: Use the admin panel to enable desired tools
  1. Run: `npm run start:http`
  2. Open: http://localhost:3000/examples/admin.html
  3. Enable tools you want to use
  4. Restart Cursor's MCP connection to see tools
- **Tool state persists** across server restarts

## 🔧 Admin API Endpoints

The server provides dedicated admin endpoints for tool management:

### GET `/admin/tools`

Get all tool configurations (enabled and disabled):

```json
{
  "success": true,
  "tools": [
    {
      "toolName": "greg-test",
      "enabled": true,
      "type": "local",
      "description": "amazing tool"
    }
  ],
  "count": 4
}
```

### POST `/admin/tools/:toolName/toggle`

Toggle a tool's enabled/disabled state:

```bash
curl -X POST http://localhost:3000/admin/tools/greg-test/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

Response:

```json
{
  "success": true,
  "message": "Tool 'greg-test' enabled",
  "toolName": "greg-test",
  "enabled": true,
  "timestamp": "2025-06-21T18:29:38.323Z"
}
```

## 🔧 Troubleshooting

### Cursor/Claude Shows 0 Tools

**Problem**: MCP server shows red dot and 0 tools in Cursor
**Solution**:

1. Tools are disabled by default - enable them via admin panel
2. Ensure tool configuration file exists in project directory
3. Restart Cursor's MCP connection after enabling tools

### Tool Configuration Not Found

**Problem**: Server creates new config with all tools disabled
**Solution**: Tool config uses absolute paths - works regardless of working directory

## 🧪 Testing

### Quick API Tests

```bash
# Test tool endpoints
curl http://localhost:3000/mcp/tools          # Enabled tools only
curl http://localhost:3000/mcp/tools/local    # Enabled local tools only
curl http://localhost:3000/mcp/tools/remote   # Enabled remote tools only

# Test admin endpoints
curl http://localhost:3000/admin/tools         # All tool configurations
curl -X POST http://localhost:3000/admin/tools/greg-test/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'                       # Enable a tool

# Test specific tools (only if enabled)
curl http://localhost:3000/mcp/test/greg-test
curl http://localhost:3000/mcp/test/calculate_tax  # Remote tool
```

### Tool Calls

```bash
# Note: Tools must be enabled first via admin panel
curl -X POST http://localhost:3000/mcp/call-tool \
  -H "Content-Type: application/json" \
  -d '{"tool": "calculate_tax", "parameters": {"amount": 100, "rate": 0.08}}'
```

## 🔧 Adding New Tools

### Local Tools

1. Create `src/tools/my-tool.ts`
2. Export from `src/tools/index.ts`
3. Restart server to load new tool
4. **Enable the tool via admin panel** (disabled by default)

### Remote Tools

1. Add tool definition to your remote API
2. Implement the execution endpoint
3. Refresh remote tools or restart server
4. **Enable the tool via admin panel** (disabled by default)

### Tool State Management

- **All new tools are disabled by default**
- Use the admin panel to enable/disable tools
- Tool states persist in `tool-config.json`
- Only enabled tools appear in `/mcp/tools` endpoints

## 📄 License

MIT License - see LICENSE file for details.
