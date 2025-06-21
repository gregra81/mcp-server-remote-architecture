import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { MCPToolsManager } from './mcp-tools-manager.js';
import type { RemoteApiConfig } from './types/mcp';

const app: Express = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Configure remote tools support
const remoteApiConfig: RemoteApiConfig = {
  enabled: process.env.REMOTE_TOOLS_ENABLED !== 'false', // Enabled by default, set to 'false' to disable
  toolsUrl: process.env.REMOTE_TOOLS_URL || 'http://localhost:3001/mcp/tools',
  timeout: parseInt(process.env.REMOTE_TOOLS_TIMEOUT || '5000'),
  retryAttempts: parseInt(process.env.REMOTE_TOOLS_RETRY_ATTEMPTS || '2'),
  retryDelay: parseInt(process.env.REMOTE_TOOLS_RETRY_DELAY || '1000'),
};

// Create MCP Tools Manager instance with remote tools support
const toolsManager = new MCPToolsManager(remoteApiConfig);

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
    const stats = toolsManager.getToolStats();

    res.json({
      success: true,
      tools: tools,
      count: tools.length,
      stats: stats,
      remoteApiEnabled: remoteApiConfig.enabled,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get local tools only
app.get('/mcp/tools/local', (req: Request, res: Response) => {
  try {
    const localTools = toolsManager.getToolsByType('local');
    res.json({
      success: true,
      tools: localTools,
      count: localTools.length,
      type: 'local',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get remote tools only
app.get('/mcp/tools/remote', (req: Request, res: Response) => {
  try {
    const remoteTools = toolsManager.getToolsByType('remote');
    res.json({
      success: true,
      tools: remoteTools,
      count: remoteTools.length,
      type: 'remote',
      remoteApiConfig: {
        enabled: remoteApiConfig.enabled,
        toolsUrl: remoteApiConfig.toolsUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Refresh remote tools
app.post(
  '/mcp/tools/refresh',
  async (req: Request, res: Response): Promise<void> => {
    try {
      await toolsManager.refreshRemoteTools();
      const stats = toolsManager.getToolStats();

      res.json({
        success: true,
        message: 'Remote tools refreshed successfully',
        stats: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

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
app.post(
  '/mcp/call-tool',
  async (req: Request, res: Response): Promise<void> => {
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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Tool call failed:`, errorMessage);

      res.status(400).json({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// Test endpoint for direct tool testing
app.get(
  '/mcp/test/:toolName',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { toolName } = req.params;
      let testParams: any = {};

      // Provide default test parameters for each tool
      switch (toolName) {
        case 'greg-test':
          testParams = {
            feeling: 'testing from browser with remote tools support',
          };
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
            data: {
              message: 'Browser test',
              timestamp: new Date().toISOString(),
            },
          };
          break;
        // Remote tools test parameters
        case 'calculate_tax':
          testParams = { amount: 100, rate: 0.08, currency: 'USD' };
          break;
        case 'send_email':
          testParams = {
            to: 'test@example.com',
            subject: 'Test Email from Browser',
            body: 'This is a test email sent via the browser interface.',
            html: false,
          };
          break;
        case 'image_ocr':
          testParams = {
            imageUrl: 'https://example.com/sample-image.jpg',
            language: 'en',
            confidence: 0.8,
          };
          break;
        case 'database_query':
          testParams = {
            query: 'SELECT * FROM users WHERE active = true',
            parameters: {},
            limit: 10,
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
  }
);

// Initialize and start the server
async function startServer() {
  // Initialize the tools manager first
  await toolsManager.initialize();

  const stats = toolsManager.getToolStats();

  app.listen(port, () => {
    console.log(`🚀 MCP Tools HTTP Server running on http://localhost:${port}`);
    console.log(
      `📱 Open http://localhost:${port}/examples/client.html in your browser`
    );
    console.log(`📊 Tool Statistics:`);
    console.log(`   📦 Total tools: ${stats.total}`);
    console.log(`   🏠 Local tools: ${stats.local}`);
    console.log(`   🌐 Remote tools: ${stats.remote}`);
    console.log(
      `   🔗 Remote API: ${stats.remoteApiEnabled ? 'Enabled' : 'Disabled'}`
    );
    if (stats.remoteApiEnabled) {
      console.log(`   📡 Remote URL: ${remoteApiConfig.toolsUrl}`);
    }
    console.log(`🔧 Available endpoints:`);
    console.log(`   GET  /health - Health check`);
    console.log(`   GET  /mcp/tools - List all available tools`);
    console.log(`   GET  /mcp/tools/local - List local tools only`);
    console.log(`   GET  /mcp/tools/remote - List remote tools only`);
    console.log(`   POST /mcp/tools/refresh - Refresh remote tools`);
    console.log(`   GET  /mcp/capabilities - Get server capabilities`);
    console.log(`   POST /mcp/call-tool - Call a tool`);
    console.log(
      `   GET  /mcp/test/:toolName - Test a tool with default parameters`
    );

    if (stats.remoteApiEnabled && stats.remote === 0) {
      console.log(`ℹ️  No remote tools loaded. Start remote server with:`);
      console.log(`   npm run start:remote`);
    }
  });
}

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
