import axios, { AxiosResponse } from 'axios';
import { ZodSchema, ZodError } from 'zod';
import type {
  MCPCapabilities,
  MCPTool,
  MCPToolDefinition,
  MCPToolResult,
  RemoteToolDefinition,
  RemoteToolsApiResponse,
  RemoteToolExecutionRequest,
  RemoteToolExecutionResponse,
  CombinedToolDefinition,
  RemoteApiConfig,
} from './types/mcp.js';
import { isRemoteToolDefinition, isLocalToolDefinition } from './types/mcp.js';
import { allTools } from './tools/index.js';
import { ToolConfigManager } from './tool-config.js';

/**
 * MCP Tools Manager - manages and executes both local and remote tools
 * Local tools are imported from the tools directory
 * Remote tools are loaded from external APIs
 */
export class MCPToolsManager {
  private tools: Map<string, CombinedToolDefinition>;
  private localTools: Map<string, MCPToolDefinition>;
  private remoteTools: Map<string, RemoteToolDefinition>;
  private remoteApiConfig: RemoteApiConfig;
  private onToolsChangedCallback?: () => void;
  private toolConfigManager: ToolConfigManager;

  constructor(remoteApiConfig: RemoteApiConfig = { enabled: false }) {
    this.tools = new Map();
    this.localTools = new Map();
    this.remoteTools = new Map();
    this.remoteApiConfig = remoteApiConfig;
    this.toolConfigManager = new ToolConfigManager();
  }

  /**
   * Set a callback to be called when tools are refreshed
   */
  public setOnToolsChangedCallback(callback: () => void): void {
    this.onToolsChangedCallback = callback;
  }

  /**
   * Initialize the tools manager by loading local and remote tools
   */
  public async initialize(): Promise<void> {
    // Load local tools first
    this.initializeLocalTools();

    // Load remote tools if enabled
    if (this.remoteApiConfig.enabled) {
      await this.loadRemoteTools();
    }

    // Initialize tool configuration manager with all available tools
    const allToolNames = [
      ...Array.from(this.localTools.keys()),
      ...Array.from(this.remoteTools.keys()),
    ];
    await this.toolConfigManager.initialize(allToolNames);

    // If remote tools were loaded after initial config creation, update the config
    if (this.remoteApiConfig.enabled && this.remoteTools.size > 0) {
      await this.toolConfigManager.updateWithNewTools(allToolNames);
    }

    // Combine all tools into the main tools map
    this.combineTools();

    console.log(
      `Initialized ${this.tools.size} tools (${this.localTools.size} local, ${this.remoteTools.size} remote): ${Array.from(this.tools.keys()).join(', ')}`
    );
  }

  /**
   * Initialize local tools by loading them from the tools directory
   */
  private initializeLocalTools(): void {
    allTools.forEach(tool => {
      this.localTools.set(tool.name, tool);
    });
  }

  /**
   * Load remote tools from external API
   */
  private async loadRemoteTools(): Promise<void> {
    if (!this.remoteApiConfig.toolsUrl) {
      console.warn('Remote API enabled but no toolsUrl provided');
      return;
    }

    const maxRetries = this.remoteApiConfig.retryAttempts || 3;
    const retryDelay = this.remoteApiConfig.retryDelay || 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `Loading remote tools from ${this.remoteApiConfig.toolsUrl} (attempt ${attempt}/${maxRetries})`
        );

        const response: AxiosResponse<RemoteToolsApiResponse> = await axios.get(
          this.remoteApiConfig.toolsUrl,
          {
            timeout: this.remoteApiConfig.timeout || 5000,
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'MCPToolsManager/1.0',
            },
          }
        );

        if (response.data && response.data.tools) {
          response.data.tools.forEach(tool => {
            this.remoteTools.set(tool.name, tool);
          });
          console.log(
            `Successfully loaded ${response.data.tools.length} remote tools`
          );
          return;
        } else {
          throw new Error('Invalid response format: missing tools array');
        }
      } catch (error: any) {
        console.error(
          `Failed to load remote tools (attempt ${attempt}/${maxRetries}):`,
          error.message
        );

        if (attempt < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          console.error('Failed to load remote tools after all retry attempts');
        }
      }
    }
  }

  /**
   * Combine local and remote tools into the main tools map
   */
  private combineTools(): void {
    this.tools.clear();

    // Add local tools
    this.localTools.forEach((tool, name) => {
      this.tools.set(name, tool);
    });

    // Add remote tools (remote tools can override local ones with same name)
    this.remoteTools.forEach((tool, name) => {
      if (this.tools.has(name)) {
        console.warn(
          `Remote tool '${name}' is overriding local tool with same name`
        );
      }
      this.tools.set(name, tool);
    });
  }

  /**
   * Refresh remote tools by reloading them from the API
   */
  public async refreshRemoteTools(): Promise<void> {
    if (!this.remoteApiConfig.enabled) {
      return;
    }

    this.remoteTools.clear();
    await this.loadRemoteTools();

    // Update tool configuration to include new remote tools
    const allToolNames = [
      ...Array.from(this.localTools.keys()),
      ...Array.from(this.remoteTools.keys()),
    ];
    await this.toolConfigManager.updateWithNewTools(allToolNames);

    this.combineTools();

    // Notify that tools have changed
    if (this.onToolsChangedCallback) {
      this.onToolsChangedCallback();
    }
  }

  /**
   * Get server capabilities
   */
  public getCapabilities(): MCPCapabilities {
    return {
      tools: {
        supported: true,
        listChanged: true,
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
   * Get all available tools (only enabled tools)
   */
  public getTools(): MCPTool[] {
    return Array.from(this.tools.values())
      .filter(tool => this.toolConfigManager.isToolEnabled(tool.name))
      .map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }));
  }

  /**
   * Get tools by type (local or remote, only enabled tools)
   */
  public getToolsByType(type: 'local' | 'remote'): MCPTool[] {
    if (type === 'local') {
      return Array.from(this.localTools.values())
        .filter(tool => this.toolConfigManager.isToolEnabled(tool.name))
        .map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        }));
    } else {
      return Array.from(this.remoteTools.values())
        .filter(tool => this.toolConfigManager.isToolEnabled(tool.name))
        .map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        }));
    }
  }

  /**
   * Validate parameters using Zod schema if available, otherwise basic validation
   */
  private validateParameters(
    tool: CombinedToolDefinition,
    parameters: Record<string, any>
  ): void {
    // Try Zod validation first if schema is available
    if (tool.zodSchema) {
      try {
        tool.zodSchema.parse(parameters);
        return;
      } catch (error) {
        if (error instanceof ZodError) {
          const issues = error.issues
            .map(issue => `${issue.path.join('.')}: ${issue.message}`)
            .join(', ');
          throw new Error(`Validation failed: ${issues}`);
        }
        throw error;
      }
    }

    // Fallback to basic JSON schema validation
    const requiredParams = tool.inputSchema.required || [];
    for (const param of requiredParams) {
      if (!(param in parameters)) {
        throw new Error(`Required parameter '${param}' is missing`);
      }
    }

    // Basic type validation for properties
    if (tool.inputSchema.properties) {
      for (const [key, value] of Object.entries(parameters)) {
        const propSchema = tool.inputSchema.properties[key];
        if (propSchema && propSchema.type) {
          const actualType = typeof value;
          const expectedType = propSchema.type;

          if (expectedType === 'string' && actualType !== 'string') {
            throw new Error(`Parameter '${key}' must be a string`);
          }
          if (expectedType === 'number' && actualType !== 'number') {
            throw new Error(`Parameter '${key}' must be a number`);
          }
          if (expectedType === 'boolean' && actualType !== 'boolean') {
            throw new Error(`Parameter '${key}' must be a boolean`);
          }
          if (
            expectedType === 'object' &&
            (actualType !== 'object' || value === null)
          ) {
            throw new Error(`Parameter '${key}' must be an object`);
          }
        }
      }
    }
  }

  /**
   * Execute a remote tool by calling its executeUrl
   */
  private async executeRemoteTool(
    tool: RemoteToolDefinition,
    parameters: Record<string, any>
  ): Promise<any> {
    const requestData: RemoteToolExecutionRequest = {
      tool: tool.name,
      parameters,
      timestamp: new Date().toISOString(),
    };

    const method = tool.method || 'POST';
    const timeout = tool.timeout || 10000;
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'MCPToolsManager/1.0',
      ...tool.headers,
    };

    try {
      const response: AxiosResponse<RemoteToolExecutionResponse> = await axios({
        method,
        url: tool.executeUrl,
        data: requestData,
        headers,
        timeout,
      });

      if (response.data.success) {
        return response.data.result;
      } else {
        throw new Error(response.data.error || 'Remote tool execution failed');
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Remote tool execution failed: ${error.response.status} ${error.response.statusText}`
        );
      } else if (error.request) {
        throw new Error(
          `Remote tool execution failed: No response from server`
        );
      } else {
        throw new Error(`Remote tool execution failed: ${error.message}`);
      }
    }
  }

  /**
   * Call a specific tool (local or remote)
   */
  public async callTool(
    toolName: string,
    parameters: Record<string, any>
  ): Promise<MCPToolResult> {
    const tool = this.tools.get(toolName);

    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    // Check if tool is enabled
    if (!this.toolConfigManager.isToolEnabled(toolName)) {
      throw new Error(`Tool '${toolName}' is disabled`);
    }

    // Validate parameters
    this.validateParameters(tool, parameters);

    try {
      let result: any;

      if (isLocalToolDefinition(tool)) {
        // Execute local tool
        result = await tool.handler(parameters);
      } else if (isRemoteToolDefinition(tool)) {
        // Execute remote tool
        result = await this.executeRemoteTool(tool, parameters);
      } else {
        throw new Error(`Invalid tool type for '${toolName}'`);
      }

      return {
        tool: toolName,
        result: result,
        executedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      throw new Error(`Tool execution failed: ${error.message}`);
    }
  }

  /**
   * Get tool statistics
   */
  public getToolStats(): {
    total: number;
    local: number;
    remote: number;
    remoteApiEnabled: boolean;
  } {
    return {
      total: this.tools.size,
      local: this.localTools.size,
      remote: this.remoteTools.size,
      remoteApiEnabled: this.remoteApiConfig.enabled,
    };
  }

  // Admin methods for tool configuration management

  /**
   * Get all tool configurations (for admin panel)
   */
  public getToolConfigurations(): Array<{
    toolName: string;
    enabled: boolean;
    type: 'local' | 'remote';
    description: string;
  }> {
    const configs = this.toolConfigManager.getAllConfigs();
    return configs.map(config => {
      const tool = this.tools.get(config.toolName);
      const isLocal = this.localTools.has(config.toolName);
      return {
        toolName: config.toolName,
        enabled: config.enabled,
        type: isLocal ? 'local' : 'remote',
        description: tool?.description || 'No description available',
      };
    });
  }

  /**
   * Set tool enabled/disabled state (for admin panel)
   */
  public async setToolEnabled(
    toolName: string,
    enabled: boolean
  ): Promise<void> {
    if (!this.tools.has(toolName)) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    await this.toolConfigManager.setToolEnabled(toolName, enabled);

    // Notify that tools have changed
    if (this.onToolsChangedCallback) {
      this.onToolsChangedCallback();
    }
  }

  /**
   * Get all available tools (including disabled ones, for admin panel)
   */
  public getAllToolsForAdmin(): MCPTool[] {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));
  }
}
