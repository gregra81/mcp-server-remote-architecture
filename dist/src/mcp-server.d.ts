import type { MCPCapabilities, MCPTool, MCPToolResult } from './types/mcp.js';
/**
 * MCP Server implementation with tool support
 */
export declare class MCPServer {
    private tools;
    constructor();
    /**
     * Initialize available tools
     */
    private initializeTools;
    /**
     * Generic HTTP POST handler
     */
    private httpPostHandler;
    /**
     * Weather API handler (using OpenWeatherMap)
     */
    private getWeatherHandler;
    /**
     * JSONPlaceholder create post handler
     */
    private createPostHandler;
    /**
     * Get server capabilities
     */
    getCapabilities(): MCPCapabilities;
    /**
     * Get all available tools
     */
    getTools(): MCPTool[];
    /**
     * Call a specific tool
     */
    callTool(toolName: string, parameters: Record<string, any>): Promise<MCPToolResult>;
}
//# sourceMappingURL=mcp-server.d.ts.map