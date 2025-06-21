import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { MCPToolsManager } from './mcp-tools-manager.js';

const app: Express = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Create MCP Tools Manager instance
const toolsManager = new MCPToolsManager();

// Serve static files (including the client.html)
app.use('/examples', express.static(path.join(process.cwd(), 'examples')));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'MCP Tools HTTP Server',
  });
});

// Get available tools
app.get('/mcp/tools', (req: Request, res: Response) => {
  try {
    const tools = toolsManager.getTools();
    res.json({
      success: true,
      tools: tools,
      count: tools.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get server capabilities
app.get('/mcp/capabilities', (req: Request, res: Response) => {
  try {
    const capabilities = toolsManager.getCapabilities();
    res.json({
      success: true,
      capabilities: capabilities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Call a tool
app.post('/mcp/call-tool', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tool, parameters } = req.body;

    if (!tool) {
      res.status(400).json({
        success: false,
        error: 'Tool name is required',
      });
      return;
    }

    console.log(`🔧 Calling tool: ${tool} with parameters:`, parameters);

    const result = await toolsManager.callTool(tool, parameters || {});

    console.log(`✅ Tool result:`, result);

    res.json({
      success: true,
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Tool call failed:`, errorMessage);
    
    res.status(400).json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
});

// Test endpoint for direct tool testing
app.get('/mcp/test/:toolName', async (req: Request, res: Response): Promise<void> => {
  try {
    const { toolName } = req.params;
    let testParams: any = {};

    // Provide default test parameters for each tool
    switch (toolName) {
      case 'greg-test':
        testParams = { feeling: 'testing from browser' };
        break;
      case 'get_weather':
        testParams = { city: 'New York', units: 'metric' };
        break;
      case 'create_post':
        testParams = {
          title: 'Test Post from Browser',
          body: 'This post was created via browser test endpoint!',
          userId: 1,
        };
        break;
      case 'http_post':
        testParams = {
          url: 'https://httpbin.org/post',
          data: { message: 'Browser test', timestamp: new Date().toISOString() },
        };
        break;
      default:
        res.status(400).json({
          success: false,
          error: `No test parameters defined for tool: ${toolName}`,
        });
        return;
    }

    const result = await toolsManager.callTool(toolName, testParams);

    res.json({
      success: true,
      tool: toolName,
      testParameters: testParams,
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Initialize and start the server
async function startServer() {
  // Initialize the tools manager first
  await toolsManager.initialize();
  
  app.listen(port, () => {
    console.log(`🚀 MCP Tools HTTP Server running on http://localhost:${port}`);
    console.log(`📱 Open http://localhost:${port}/examples/client.html in your browser`);
    console.log(`🔧 Available endpoints:`);
    console.log(`   GET  /health - Health check`);
    console.log(`   GET  /mcp/tools - List available tools`);
    console.log(`   GET  /mcp/capabilities - Get server capabilities`);
    console.log(`   POST /mcp/call-tool - Call a tool`);
    console.log(`   GET  /mcp/test/:toolName - Test a tool with default parameters`);
  });
}

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app; 