// MCP Protocol Types
import type { ZodSchema } from 'zod';

export interface MCPCapabilities {
  tools: {
    supported: boolean;
    listChanged: boolean;
  };
  resources: {
    supported: boolean;
  };
  prompts: {
    supported: boolean;
  };
  logging: {
    supported: boolean;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  default?: any;
}

export interface JSONSchemaProperty {
  type: string;
  description?: string;
  default?: any;
  enum?: string[];
  items?: JSONSchemaProperty;
}

export interface MCPToolCall {
  tool: string;
  parameters: Record<string, any>;
}

export interface MCPToolResult {
  tool: string;
  result: any;
  executedAt: string;
}

export interface MCPToolResponse {
  success: boolean;
  result?: MCPToolResult;
  error?: string;
}

// Server Event Types
export interface MCPConnectionEvent {
  type: 'connection';
  clientId: string;
  message: string;
}

export interface MCPCapabilitiesEvent {
  type: 'capabilities';
  capabilities: MCPCapabilities;
}

export interface MCPPingEvent {
  type: 'ping';
  timestamp: string;
}

export interface MCPStatusEvent {
  type: 'status';
  message: string;
  timestamp: string;
}

export interface MCPResultEvent {
  type: 'result';
  success: boolean;
  result: any;
  timestamp: string;
}

export interface MCPErrorEvent {
  type: 'error';
  success: boolean;
  error: string;
  timestamp: string;
}

export type MCPEvent =
  | MCPConnectionEvent
  | MCPCapabilitiesEvent
  | MCPPingEvent
  | MCPStatusEvent
  | MCPResultEvent
  | MCPErrorEvent;

// Tool Handler Types
export type MCPToolHandler = (parameters: Record<string, any>) => Promise<any>;

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  handler: MCPToolHandler;
  zodSchema?: ZodSchema; // Optional Zod schema for validation
}

// Remote Tool Types
export interface RemoteToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  zodSchema?: ZodSchema; // Zod schema for validation
  executeUrl: string; // URL to POST the request to
  method?: 'POST' | 'PUT' | 'PATCH'; // HTTP method, defaults to POST
  headers?: Record<string, string>; // Additional headers to send
  timeout?: number; // Request timeout in ms
}

export interface RemoteToolsApiResponse {
  tools: RemoteToolDefinition[];
  version?: string;
  timestamp?: string;
}

export interface RemoteToolExecutionRequest {
  tool: string;
  parameters: Record<string, any>;
  timestamp: string;
}

export interface RemoteToolExecutionResponse {
  success: boolean;
  result?: any;
  error?: string;
  executedAt: string;
}

// Combined Tool Definition (local or remote)
export type CombinedToolDefinition = MCPToolDefinition | RemoteToolDefinition;

// Type guards
export function isRemoteToolDefinition(tool: CombinedToolDefinition): tool is RemoteToolDefinition {
  return 'executeUrl' in tool;
}

export function isLocalToolDefinition(tool: CombinedToolDefinition): tool is MCPToolDefinition {
  return 'handler' in tool;
}

// HTTP Tool Types
export interface HttpPostParameters {
  url: string;
  data: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface HttpPostResult {
  success: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, any>;
  data?: any;
  error?: string;
  timestamp: string;
}

// Weather Tool Types
export interface WeatherParameters {
  city: string;
  apiKey?: string;
  units?: 'metric' | 'imperial' | 'kelvin';
}

export interface WeatherResult {
  success: boolean;
  mock?: boolean;
  city: string;
  country?: string;
  temperature: number;
  description: string;
  humidity: number;
  pressure?: number;
  windSpeed?: number;
  units: string;
  error?: string;
  timestamp: string;
}

// Create Post Tool Types
export interface CreatePostParameters {
  title: string;
  body: string;
  userId?: number;
}

export interface CreatePostResult {
  success: boolean;
  post?: {
    id: number;
    title: string;
    body: string;
    userId: number;
  };
  message?: string;
  error?: string;
  timestamp: string;
}

// Server Configuration Types
export interface ServerConfig {
  url: string;
  name: string;
  badge: string;
}

export interface ServerConfigs {
  sse: ServerConfig;
  streamable: ServerConfig;
}

export type ServerType = 'sse' | 'streamable';

// Remote API Configuration
export interface RemoteApiConfig {
  enabled: boolean;
  toolsUrl?: string; // URL to fetch available remote tools
  timeout?: number; // Request timeout in ms
  retryAttempts?: number; // Number of retry attempts
  retryDelay?: number; // Delay between retries in ms
}
