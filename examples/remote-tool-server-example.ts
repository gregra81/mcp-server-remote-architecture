import express, { Request, Response } from 'express';
import type {
  RemoteToolsApiResponse,
  RemoteToolExecutionRequest,
  RemoteToolExecutionResponse,
  RemoteToolDefinition,
} from '../src/types/mcp.js';

const app = express();
const port = 3001;

// Parse JSON bodies
app.use(express.json());

// Sample remote tools that this server provides
const remoteTools: RemoteToolDefinition[] = [
  {
    name: 'calculate_tax',
    description: 'Calculate tax for a given amount and rate',
    executeUrl: 'http://localhost:3001/tools/calculate-tax',
    method: 'POST',
    timeout: 5000,
    inputSchema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'The amount to calculate tax for',
        },
        rate: {
          type: 'number',
          description: 'Tax rate as decimal (e.g., 0.08 for 8%)',
        },
        currency: {
          type: 'string',
          description: 'Currency code',
          default: 'USD',
        },
      },
      required: ['amount', 'rate'],
    },
  },
  {
    name: 'format_currency',
    description: 'Format a number as currency',
    executeUrl: 'http://localhost:3001/tools/format-currency',
    method: 'POST',
    timeout: 3000,
    inputSchema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'The amount to format',
        },
        currency: {
          type: 'string',
          description: 'Currency code',
          default: 'USD',
        },
        locale: {
          type: 'string',
          description: 'Locale for formatting',
          default: 'en-US',
        },
      },
      required: ['amount'],
    },
  },
];

// Endpoint to list available remote tools
app.get('/mcp/tools', (req: Request, res: Response) => {
  const response: RemoteToolsApiResponse = {
    tools: remoteTools,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };
  
  res.json(response);
});

// Implementation of calculate_tax tool
app.post('/tools/calculate-tax', (req: Request, res: Response) => {
  try {
    const request: RemoteToolExecutionRequest = req.body;
    const { amount, rate, currency = 'USD' } = request.parameters;
    
    // Validate parameters
    if (typeof amount !== 'number' || typeof rate !== 'number') {
      throw new Error('Amount and rate must be numbers');
    }
    
    if (amount < 0 || rate < 0 || rate > 1) {
      throw new Error('Invalid amount or rate values');
    }
    
    // Calculate tax
    const taxAmount = amount * rate;
    const totalAmount = amount + taxAmount;
    
    const response: RemoteToolExecutionResponse = {
      success: true,
      result: {
        originalAmount: amount,
        taxRate: rate,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        currency: currency,
        calculation: `${amount} + (${amount} × ${rate}) = ${totalAmount}`,
      },
      executedAt: new Date().toISOString(),
    };
    
    res.json(response);
  } catch (error) {
    const response: RemoteToolExecutionResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executedAt: new Date().toISOString(),
    };
    
    res.status(400).json(response);
  }
});

// Implementation of format_currency tool
app.post('/tools/format-currency', (req: Request, res: Response) => {
  try {
    const request: RemoteToolExecutionRequest = req.body;
    const { amount, currency = 'USD', locale = 'en-US' } = request.parameters;
    
    // Validate parameters
    if (typeof amount !== 'number') {
      throw new Error('Amount must be a number');
    }
    
    // Format currency
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    });
    
    const formattedAmount = formatter.format(amount);
    
    const response: RemoteToolExecutionResponse = {
      success: true,
      result: {
        originalAmount: amount,
        formattedAmount: formattedAmount,
        currency: currency,
        locale: locale,
        formatOptions: {
          style: 'currency',
          currency: currency,
        },
      },
      executedAt: new Date().toISOString(),
    };
    
    res.json(response);
  } catch (error) {
    const response: RemoteToolExecutionResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executedAt: new Date().toISOString(),
    };
    
    res.status(400).json(response);
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'Remote MCP Tools Server',
    toolsCount: remoteTools.length,
  });
});

// Generic error handler
app.use((error: Error, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', error);
  
  const response: RemoteToolExecutionResponse = {
    success: false,
    error: 'Internal server error',
    executedAt: new Date().toISOString(),
  };
  
  res.status(500).json(response);
});

// Start the server
app.listen(port, () => {
  console.log(`🌐 Remote MCP Tools Server running on http://localhost:${port}`);
  console.log(`📋 Available tools: ${remoteTools.map(t => t.name).join(', ')}`);
  console.log(`🔧 Endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /mcp/tools - List available remote tools`);
  console.log(`   POST /tools/calculate-tax - Calculate tax`);
  console.log(`   POST /tools/format-currency - Format currency`);
  console.log('');
  console.log(`💡 To use with MCPToolsManager, configure:`);
  console.log(`   toolsUrl: 'http://localhost:${port}/mcp/tools'`);
});

export default app; 