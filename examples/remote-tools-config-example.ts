import { MCPToolsManager } from '../src/mcp-tools-manager.js';
import type { RemoteApiConfig } from '../src/types/mcp.js';

// Example 1: Basic remote API configuration
const basicConfig: RemoteApiConfig = {
  enabled: true,
  toolsUrl: 'https://api.example.com/mcp/tools',
  timeout: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Example 2: Advanced configuration with environment variables
const advancedConfig: RemoteApiConfig = {
  enabled: process.env.REMOTE_TOOLS_ENABLED === 'true',
  toolsUrl: process.env.REMOTE_TOOLS_URL || 'https://api.mycompany.com/mcp/tools',
  timeout: parseInt(process.env.REMOTE_TOOLS_TIMEOUT || '10000'),
  retryAttempts: parseInt(process.env.REMOTE_TOOLS_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.REMOTE_TOOLS_RETRY_DELAY || '2000'),
};

// Example 3: Using the enhanced MCPToolsManager
async function exampleUsage() {
  // Create manager with remote API support
  const toolsManager = new MCPToolsManager(basicConfig);
  
  // Initialize (loads both local and remote tools)
  await toolsManager.initialize();
  
  // Get all tools (local + remote)
  const allTools = toolsManager.getTools();
  console.log('All available tools:', allTools.map(t => t.name));
  
  // Get local tools only
  const localTools = toolsManager.getToolsByType('local');
  console.log('Local tools:', localTools.map(t => t.name));
  
  // Get remote tools only
  const remoteTools = toolsManager.getToolsByType('remote');
  console.log('Remote tools:', remoteTools.map(t => t.name));
  
  // Get tool statistics
  const stats = toolsManager.getToolStats();
  console.log('Tool statistics:', stats);
  
  // Call a local tool
  try {
    const localResult = await toolsManager.callTool('greg-test', {
      feeling: 'excited about remote tools'
    });
    console.log('Local tool result:', localResult);
  } catch (error) {
    console.error('Local tool error:', error);
  }
  
  // Call a remote tool (if available)
  try {
    const remoteResult = await toolsManager.callTool('calculate_tax', {
      amount: 100,
      rate: 0.08,
      currency: 'USD'
    });
    console.log('Remote tool result:', remoteResult);
  } catch (error) {
    console.error('Remote tool error:', error);
  }
  
  // Refresh remote tools (reload from API)
  await toolsManager.refreshRemoteTools();
  console.log('Remote tools refreshed');
}

// Example 4: Environment-based configuration
export function createConfiguredToolsManager(): MCPToolsManager {
  const config: RemoteApiConfig = {
    enabled: process.env.NODE_ENV !== 'test' && process.env.REMOTE_TOOLS_ENABLED === 'true',
    toolsUrl: process.env.REMOTE_TOOLS_URL,
    timeout: parseInt(process.env.REMOTE_TOOLS_TIMEOUT || '10000'),
    retryAttempts: parseInt(process.env.REMOTE_TOOLS_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.REMOTE_TOOLS_RETRY_DELAY || '1000'),
  };
  
  return new MCPToolsManager(config);
}

// Example 5: Multiple remote APIs (would require extending the manager)
const multipleRemoteConfig: RemoteApiConfig = {
  enabled: true,
  toolsUrl: 'https://primary-tools.example.com/api/tools',
  timeout: 8000,
  retryAttempts: 2,
  retryDelay: 1500,
};

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleUsage().catch(console.error);
}

export {
  basicConfig,
  advancedConfig,
  multipleRemoteConfig,
  exampleUsage,
}; 