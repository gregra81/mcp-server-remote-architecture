import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { MCPToolsManager } from './mcp-tools-manager.js';

import type { RemoteApiConfig } from './types/mcp';

// Configure remote tools support
const remoteApiConfig: RemoteApiConfig = {
  enabled: process.env.REMOTE_TOOLS_ENABLED !== 'false', // Enabled by default, set to 'false' to disable
  toolsUrl: process.env.REMOTE_TOOLS_URL || 'http://localhost:3001/mcp/tools',
  timeout: parseInt(process.env.REMOTE_TOOLS_TIMEOUT || '5000'),
  retryAttempts: parseInt(process.env.REMOTE_TOOLS_RETRY_ATTEMPTS || '2'),
  retryDelay: parseInt(process.env.REMOTE_TOOLS_RETRY_DELAY || '1000'),
};

// 1. Create an MCP tools manager instance
const toolsManager = new MCPToolsManager(remoteApiConfig);

// 2. Create the MCP SDK server instance
const server = new Server(
  {
    name: 'demo-tools',
    version: '2.0.1',
  },
  {
    capabilities: {
      tools: {
        listChanged: true, // Declare that we support list change notifications
      },
    },
  }
);

// 3. Set up callback for when tools are refreshed
toolsManager.setOnToolsChangedCallback(() => {
  try {
    // Send notification that tools list has changed
    // Note: This follows the MCP specification but may not be supported by all clients
    // Claude Desktop as of 2024/2025 does not support this notification
    // GitHub Copilot and other clients may support it
    server.notification({
      method: 'notifications/tools/list_changed',
      params: {},
    });
    console.error(
      'Remote tools refreshed, sent list_changed notification to client'
    );
  } catch (error) {
    console.error('Failed to send list_changed notification:', error);
  }
});

// 4. Handle list tools request - dynamically get all tools from MCPToolsManager
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolsManager.getTools(),
  };
});

// 5. Handle tool call requests - delegate to MCPToolsManager
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    // Use MCPToolsManager to call the tool
    const result = await toolsManager.callTool(name, args || {});

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

// 6. Start the MCP server with a stdio transport
async function main() {
  // Initialize the tools manager first
  await toolsManager.initialize();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Cursor Tools MCP Server running on stdio');
  console.error(
    '- Claude Desktop: Currently does not support list_changed notifications'
  );
  console.error('- GitHub Copilot: Supports list_changed notifications');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
