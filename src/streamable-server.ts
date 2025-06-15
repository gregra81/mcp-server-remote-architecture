import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { MCPServer } from './mcp-server.js';
import type { MCPToolCall, MCPToolResponse, MCPEvent } from './types/mcp.js';

const app: Express = express();
const port: number = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create MCP server instance  
const mcpServer = new MCPServer();

// Streamable HTTP endpoint for MCP communication (chunked transfer encoding)
app.get('/mcp/stream', (req: Request, res: Response): void => {
  // Set up streaming headers
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Handle client connection
  const clientId: string = Date.now().toString();
  console.log(`Client ${clientId} connected to MCP Stream`);

  // Send initial connection message as chunked JSON
  const initialMessage = JSON.stringify({
    type: 'connection',
    clientId: clientId,
    message: 'Connected to MCP Streamable Server'
  }) + '\n';
  res.write(Buffer.from(initialMessage.length.toString(16) + '\r\n' + initialMessage + '\r\n', 'utf8'));

  // Send server capabilities
  const capabilitiesMessage = JSON.stringify({
    type: 'capabilities',
    capabilities: mcpServer.getCapabilities()
  }) + '\n';
  res.write(Buffer.from(capabilitiesMessage.length.toString(16) + '\r\n' + capabilitiesMessage + '\r\n', 'utf8'));

  // Handle client disconnect
  req.on('close', () => {
    console.log(`Client ${clientId} disconnected from MCP Stream`);
  });

  // Keep connection alive with streaming chunks
  const keepAlive = setInterval(() => {
    const pingMessage = JSON.stringify({
      type: 'ping',
      timestamp: new Date().toISOString()
    }) + '\n';
    res.write(Buffer.from(pingMessage.length.toString(16) + '\r\n' + pingMessage + '\r\n', 'utf8'));
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

// Alternative streaming endpoint with simpler chunk format
app.get('/mcp/stream-simple', (req: Request, res: Response): void => {
  // Set up streaming headers with simple chunking
  res.writeHead(200, {
    'Content-Type': 'application/x-ndjson', // Newline Delimited JSON
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Handle client connection
  const clientId: string = Date.now().toString();
  console.log(`Client ${clientId} connected to MCP Simple Stream`);

  // Send initial connection message
  const initialData: MCPEvent = {
    type: 'connection',
    clientId: clientId,
    message: 'Connected to MCP Streamable Server (Simple Format)'
  };
  res.write(JSON.stringify(initialData) + '\n');

  // Send server capabilities
  const capabilitiesData: MCPEvent = {
    type: 'capabilities',
    capabilities: mcpServer.getCapabilities()
  };
  res.write(JSON.stringify(capabilitiesData) + '\n');

  // Handle client disconnect
  req.on('close', () => {
    console.log(`Client ${clientId} disconnected from MCP Simple Stream`);
  });

  // Keep connection alive
  const keepAlive = setInterval(() => {
    const pingData: MCPEvent = {
      type: 'ping',
      timestamp: new Date().toISOString()
    };
    res.write(JSON.stringify(pingData) + '\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

// HTTP endpoint for MCP tool calls with streaming response
app.post('/mcp/call-tool-stream', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tool, parameters }: MCPToolCall = req.body;
    
    if (!tool || !parameters) {
      res.status(400).json({
        error: 'Missing tool or parameters'
      });
      return;
    }

    console.log(`Executing tool: ${tool} with parameters:`, parameters);

    // Set up streaming response
    res.writeHead(200, {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*'
    });

    // Send initial status
    const statusEvent: MCPEvent = {
      type: 'status',
      message: `Starting execution of tool: ${tool}`,
      timestamp: new Date().toISOString()
    };
    res.write(JSON.stringify(statusEvent) + '\n');

    // Execute tool and stream result
    const result = await mcpServer.callTool(tool, parameters);
    
    // Send final result
    const resultEvent: MCPEvent = {
      type: 'result',
      success: true,
      result: result,
      timestamp: new Date().toISOString()
    };
    res.write(JSON.stringify(resultEvent) + '\n');

    res.end();
  } catch (error: any) {
    console.error('Tool execution error:', error);
    
    // Send error in streaming format
    const errorEvent: MCPEvent = {
      type: 'error',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    res.write(JSON.stringify(errorEvent) + '\n');
    
    res.end();
  }
});

// Standard HTTP endpoint for MCP tool calls (same as original)
app.post('/mcp/call-tool', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tool, parameters }: MCPToolCall = req.body;
    
    if (!tool || !parameters) {
      res.status(400).json({
        error: 'Missing tool or parameters'
      });
      return;
    }

    console.log(`Executing tool: ${tool} with parameters:`, parameters);
    
    const result = await mcpServer.callTool(tool, parameters);
    
    const response: MCPToolResponse = {
      success: true,
      result: result
    };

    res.json(response);
  } catch (error: any) {
    console.error('Tool execution error:', error);
    
    const errorResponse: MCPToolResponse = {
      success: false,
      error: error.message
    };

    res.status(500).json(errorResponse);
  }
});

// Get available tools
app.get('/mcp/tools', (req: Request, res: Response): void => {
  res.json({
    tools: mcpServer.getTools()
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'MCP Streamable HTTP Server'
  });
});

// Start server
app.listen(port, (): void => {
  console.log(`🚀 MCP Streamable HTTP Server running on port ${port}`);
  console.log(`🌊 Streaming endpoint: http://localhost:${port}/mcp/stream`);
  console.log(`📡 Simple streaming endpoint: http://localhost:${port}/mcp/stream-simple`);
  console.log(`🔧 Tool call endpoint: http://localhost:${port}/mcp/call-tool`);
  console.log(`⚡ Streaming tool call endpoint: http://localhost:${port}/mcp/call-tool-stream`);
  console.log(`📋 Available tools: http://localhost:${port}/mcp/tools`);
}); 