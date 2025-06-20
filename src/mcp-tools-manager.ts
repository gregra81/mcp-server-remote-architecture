import type {
  MCPCapabilities,
  MCPTool,
  MCPToolDefinition,
  MCPToolResult,
} from './types/mcp';
import { allTools } from './tools/index.js';

/**
 * MCP Tools Manager - manages and executes all available tools
 * Tools are imported generically from the tools directory
 */
export class MCPToolsManager {
  private tools: Map<string, MCPToolDefinition>;

  constructor() {
    this.tools = new Map();
    this.initializeTools();
  }

  /**
   * Initialize available tools by loading them from the tools directory
   */
  private initializeTools(): void {
    // Load all tools generically from the tools directory
    allTools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });

    console.log(
      `Initialized ${this.tools.size} tools: ${Array.from(this.tools.keys()).join(', ')}`
    );
  }

  /**
   * Get server capabilities
   */
  public getCapabilities(): MCPCapabilities {
    return {
      tools: {
        supported: true,
        listChanged: false,
      },
      resources: {
        supported: false,
      },
      prompts: {
        supported: false,
      },
      logging: {
        supported: true,
      },
    };
  }

  /**
   * Get all available tools
   */
  public getTools(): MCPTool[] {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));
  }

  /**
   * Call a specific tool
   */
  public async callTool(
    toolName: string,
    parameters: Record<string, any>
  ): Promise<MCPToolResult> {
    const tool = this.tools.get(toolName);

    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    // Validate parameters against schema (basic validation)
    const requiredParams = tool.inputSchema.required || [];
    for (const param of requiredParams) {
      if (!(param in parameters)) {
        throw new Error(`Required parameter '${param}' is missing`);
      }
    }

    // Call the tool handler
    try {
      const result = await tool.handler(parameters);
      return {
        tool: toolName,
        result: result,
        executedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      throw new Error(`Tool execution failed: ${error.message}`);
    }
  }
}
