import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { MCPToolsManager } from './mcp-tools-manager.js';

// 1. Create an MCP tools manager instance
const toolsManager = new MCPToolsManager();

// 2. Create the MCP SDK server instance
const server = new Server(
  {
    name: 'demo-tools',
    version: '2.0.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 3. Handle list tools request - dynamically get all tools from MCPToolsManager
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolsManager.getTools(),
  };
});

// 4. Handle tool call requests - delegate to MCPToolsManager
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

// 5. Start the MCP server with a stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Cursor Tools MCP Server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
