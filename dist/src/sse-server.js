import express from 'express';
import cors from 'cors';
import { MCPServer } from './mcp-server.js';
const app = express();
const port = Number(process.env.PORT) || 3000;
// Middleware
app.use(cors());
app.use(express.json());
// Create MCP server instance
const mcpServer = new MCPServer();
// SSE endpoint for MCP communication
app.get('/mcp/sse', (req, res) => {
    // Set up SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });
    // Handle client connection
    const clientId = Date.now().toString();
    console.log(`Client ${clientId} connected to MCP SSE`);
    // Send initial connection message
    res.write(`data: ${JSON.stringify({
        type: 'connection',
        clientId: clientId,
        message: 'Connected to MCP Server'
    })}\n\n`);
    // Send server capabilities
    res.write(`data: ${JSON.stringify({
        type: 'capabilities',
        capabilities: mcpServer.getCapabilities()
    })}\n\n`);
    // Handle client disconnect
    req.on('close', () => {
        console.log(`Client ${clientId} disconnected from MCP SSE`);
    });
    // Keep connection alive
    const keepAlive = setInterval(() => {
        res.write(`data: ${JSON.stringify({
            type: 'ping',
            timestamp: new Date().toISOString()
        })}\n\n`);
    }, 30000);
    req.on('close', () => {
        clearInterval(keepAlive);
    });
});
// HTTP endpoint for MCP tool calls
app.post('/mcp/call-tool', async (req, res) => {
    try {
        const { tool, parameters } = req.body;
        if (!tool || !parameters) {
            res.status(400).json({
                error: 'Missing tool or parameters'
            });
            return;
        }
        console.log(`Executing tool: ${tool} with parameters:`, parameters);
        const result = await mcpServer.callTool(tool, parameters);
        const response = {
            success: true,
            result: result
        };
        res.json(response);
    }
    catch (error) {
        console.error('Tool execution error:', error);
        const errorResponse = {
            success: false,
            error: error.message
        };
        res.status(500).json(errorResponse);
    }
});
// Get available tools
app.get('/mcp/tools', (req, res) => {
    res.json({
        tools: mcpServer.getTools()
    });
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: 'MCP SSE Server'
    });
});
// Start server
app.listen(port, () => {
    console.log(`🚀 MCP SSE Server running on port ${port}`);
    console.log(`📡 SSE endpoint: http://localhost:${port}/mcp/sse`);
    console.log(`🔧 Tool call endpoint: http://localhost:${port}/mcp/call-tool`);
    console.log(`📋 Available tools: http://localhost:${port}/mcp/tools`);
});
//# sourceMappingURL=sse-server.js.map