// Export all individual tools
export { httpPostTool, httpPostHandler } from './http-post-tool.js';
export { weatherTool, getWeatherHandler } from './weather-tool.js';
export { createPostTool, createPostHandler } from './create-post-tool.js';
export { gregTestTool, gregTestHandler } from './greg-test-tool.js';

// Import all tools for the main export
import { httpPostTool } from './http-post-tool.js';
import { weatherTool } from './weather-tool.js';
import { createPostTool } from './create-post-tool.js';
import { gregTestTool } from './greg-test-tool.js';

// Export a collection of all tools
export const allTools = [
  httpPostTool,
  weatherTool,
  createPostTool,
  gregTestTool,
];
