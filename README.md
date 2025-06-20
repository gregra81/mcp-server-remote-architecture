# MCP Tools Demo

A **Model Context Protocol (MCP)** implementation showcasing clean, modular tool architecture with multiple server options and an interactive browser client.

## 🌟 Features

- **🏗️ Clean Architecture**: Modular tool design with `MCPToolsManager`
- **🔧 4 Demo Tools**: HTTP POST, Weather API, Create Post, and Greg Test tools
- **🌐 Browser Client**: Interactive web interface for testing tools
- **📡 Multiple Server Options**: Stdio and Simple HTTP
- **🧪 Comprehensive Testing**: Automated test suites and manual testing options
- **🔒 Type Safety**: Full TypeScript implementation with proper validation

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

