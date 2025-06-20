import type { MCPToolDefinition } from '../types/mcp';

/**
 * Greg test handler (simple feeling tool)
 */
export async function gregTestHandler(
  parameters: Record<string, any>
): Promise<{ feeling: string }> {
  const { feeling } = parameters;
  return {
    feeling: `Your feeling is ${feeling}`,
  };
}

export const gregTestTool: MCPToolDefinition = {
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
  handler: gregTestHandler,
};
