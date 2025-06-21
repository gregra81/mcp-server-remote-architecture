import express from 'express';
import fs from 'fs';
import path from 'path';
const app = express();
const port = 3001;
// Parse JSON bodies
app.use(express.json());

// Load remote tools from JSON file
let remoteTools = [];
try {
  const jsonPath = path.join(
    process.cwd(),
    'examples',
    'remote-tools-api-example.json'
  );
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  const toolsData = JSON.parse(jsonData);

  // Update executeUrls to point to localhost for this server
  remoteTools = toolsData.tools.map(tool => ({
    ...tool,
    executeUrl: `http://localhost:${port}/tools/${tool.name.replace('_', '-')}`,
  }));

  console.log(`📋 Loaded ${remoteTools.length} tools from JSON file`);
} catch (error) {
  console.error('❌ Failed to load tools from JSON file:', error.message);
  process.exit(1);
}
// Endpoint to list available remote tools
app.get('/mcp/tools', (req, res) => {
  const response = {
    tools: remoteTools,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});
// Tool implementations
const toolImplementations = {
  calculate_tax: parameters => {
    const { amount, rate, currency = 'USD' } = parameters;

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

    return {
      originalAmount: amount,
      taxRate: rate,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      currency: currency,
      calculation: `${amount} + (${amount} × ${rate}) = ${totalAmount}`,
    };
  },

  send_email: parameters => {
    const { to, subject, body, html = false } = parameters;

    // Validate required parameters
    if (!to || !subject || !body) {
      throw new Error(
        'Missing required parameters: to, subject, and body are required'
      );
    }

    // Mock email sending
    return {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to: to,
      subject: subject,
      bodyLength: body.length,
      format: html ? 'html' : 'text',
      status: 'sent',
      message: `Email successfully sent to ${to}`,
    };
  },

  image_ocr: parameters => {
    const {
      imageUrl,
      imageBase64,
      language = 'en',
      confidence = 0.8,
    } = parameters;

    // Validate that either imageUrl or imageBase64 is provided
    if (!imageUrl && !imageBase64) {
      throw new Error('Either imageUrl or imageBase64 must be provided');
    }

    // Mock OCR processing
    const mockText =
      'This is mock extracted text from the image. In a real implementation, this would use an OCR service like Tesseract, Google Cloud Vision, or AWS Textract.';

    return {
      extractedText: mockText,
      confidence: confidence,
      language: language,
      source: imageUrl ? 'url' : 'base64',
      wordCount: mockText.split(' ').length,
      processingTime: Math.floor(Math.random() * 3000) + 500, // 500-3500ms
    };
  },

  database_query: parameters => {
    const { query, parameters: queryParams = {}, limit = 100 } = parameters;

    // Validate required parameters
    if (!query) {
      throw new Error('SQL query is required');
    }

    // Basic validation for read-only queries
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery.startsWith('select')) {
      throw new Error('Only SELECT queries are allowed');
    }

    // Mock database results
    const mockResults = [
      {
        id: 1,
        name: 'Sample Record 1',
        value: 123.45,
        created_at: '2024-01-01T10:00:00Z',
      },
      {
        id: 2,
        name: 'Sample Record 2',
        value: 67.89,
        created_at: '2024-01-01T11:00:00Z',
      },
      {
        id: 3,
        name: 'Sample Record 3',
        value: 234.56,
        created_at: '2024-01-01T12:00:00Z',
      },
    ];

    return {
      query: query,
      parameters: queryParams,
      rowCount: Math.min(mockResults.length, limit),
      executionTime: Math.floor(Math.random() * 100) + 10, // 10-110ms
      results: mockResults.slice(0, limit),
    };
  },
};

// Generic route handler for all tools
remoteTools.forEach(tool => {
  const routePath = `/tools/${tool.name.replace('_', '-')}`;

  app.post(routePath, (req, res) => {
    try {
      const request = req.body;
      const parameters = request.parameters || {};

      // Find the implementation for this tool
      const implementation = toolImplementations[tool.name];
      if (!implementation) {
        throw new Error(`No implementation found for tool: ${tool.name}`);
      }

      // Execute the tool
      const result = implementation(parameters);

      const response = {
        success: true,
        result: result,
        executedAt: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      const response = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executedAt: new Date().toISOString(),
      };

      res.status(400).json(response);
    }
  });
});
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'Remote MCP Tools Server',
    toolsCount: remoteTools.length,
  });
});
// Generic error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  const response = {
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

  // Show all tool endpoints dynamically
  remoteTools.forEach(tool => {
    const routePath = `/tools/${tool.name.replace('_', '-')}`;
    console.log(`   POST ${routePath} - ${tool.description}`);
  });

  console.log('');
  console.log(`💡 To use with MCPToolsManager, configure:`);
  console.log(`   toolsUrl: 'http://localhost:${port}/mcp/tools'`);
  console.log(`📄 Tools loaded from: examples/remote-tools-api-example.json`);
});
export default app;
