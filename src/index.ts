import { z } from 'zod';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// 1. Create an MCP server instance
const server = new Server(
  {
    name: 'cursor-tools',
    version: '2.0.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 2. Define the list of tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'greg-test',
        description: 'amazing tool',
        inputSchema: {
          type: 'object',
          properties: {
            feeling: {
              type: 'string',
              description: 'Your current mood',
            },
          },
          required: ['feeling'],
        },
      },
    ],
  };
});

const ToolSchema = z.object({
  feeling: z.string(),
});

const runFeelingTool = async (args: z.infer<typeof ToolSchema>) => {
  return {
    content: [
      {
        type: 'text',
        text: `Your feeling is ${args.feeling}`,
      },
    ],
  };
};

// 3. Implement the tool call logic
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'greg-test': {
        const validated = ToolSchema.parse(args);
        return await runFeelingTool(validated);
      }
      default:
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${request.params.name}`,
            },
          ],
        };
    }
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error: ${error}`,
        },
      ],
    };
  }
});

// 4. Start the MCP server with a stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Cursor Tools MCP Server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
