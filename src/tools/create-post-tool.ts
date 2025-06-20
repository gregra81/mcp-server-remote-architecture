import axios, { AxiosInstance, AxiosResponse } from 'axios';
import https from 'https';
import type {
  MCPToolDefinition,
  CreatePostParameters,
  CreatePostResult,
} from '../types/mcp';

// Configure axios to ignore SSL certificate errors for testing
const axiosInstance: AxiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  timeout: 10000,
});

/**
 * JSONPlaceholder create post handler
 */
export async function createPostHandler(
  parameters: Record<string, any>
): Promise<CreatePostResult> {
  const { title, body, userId = 1 } = parameters as CreatePostParameters;

  try {
    const response: AxiosResponse = await axiosInstance.post(
      'https://jsonplaceholder.typicode.com/posts',
      {
        title,
        body,
        userId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      post: response.data,
      message: 'Post created successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

export const createPostTool: MCPToolDefinition = {
  name: 'create_post',
  description: 'Create a new post using JSONPlaceholder API (example API)',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'The title of the post',
      },
      body: {
        type: 'string',
        description: 'The body content of the post',
      },
      userId: {
        type: 'number',
        description: 'The user ID creating the post',
        default: 1,
      },
    },
    required: ['title', 'body'],
  },
  handler: createPostHandler,
};
