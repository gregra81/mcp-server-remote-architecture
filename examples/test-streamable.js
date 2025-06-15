import axios from 'axios';
import { Readable } from 'stream';

/**
 * Test client for the MCP Streamable HTTP Server
 */

const SERVER_URL = 'http://localhost:3001';

async function testStreamEndpoint() {
  console.log('🌊 Testing Streamable HTTP endpoint...\n');
  
  try {
    const response = await axios({
      method: 'get',
      url: `${SERVER_URL}/mcp/stream-simple`,
      responseType: 'stream',
      timeout: 10000
    });

    console.log('📡 Connected to stream. Listening for data...\n');

    let buffer = '';
    
    response.data.on('data', (chunk) => {
      buffer += chunk.toString();
      
      // Process complete JSON lines
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            console.log('📦 Received:', {
              type: data.type,
              message: data.message || 'N/A',
              timestamp: data.timestamp
            });
          } catch (e) {
            console.log('📦 Raw data:', line);
          }
        }
      }
    });

    response.data.on('end', () => {
      console.log('\n✅ Stream ended');
    });

    response.data.on('error', (error) => {
      console.error('❌ Stream error:', error.message);
    });

    // Let it run for a few seconds to see ping messages
    setTimeout(() => {
      response.data.destroy();
    }, 5000);

  } catch (error) {
    console.error('❌ Failed to connect to stream:', error.message);
  }
}

async function testStreamingToolCall() {
  console.log('\n⚡ Testing Streaming Tool Call...\n');
  
  try {
    const response = await axios({
      method: 'post',
      url: `${SERVER_URL}/mcp/call-tool-stream`,
      data: {
        tool: 'get_weather',
        parameters: {
          city: 'New York'
        }
      },
      responseType: 'stream',
      timeout: 10000
    });

    console.log('🔧 Tool execution started. Streaming response...\n');

    let buffer = '';
    
    response.data.on('data', (chunk) => {
      buffer += chunk.toString();
      
      // Process complete JSON lines
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            console.log('📦 Received:', data);
          } catch (e) {
            console.log('📦 Raw data:', line);
          }
        }
      }
    });

    response.data.on('end', () => {
      console.log('\n✅ Tool execution completed');
    });

    response.data.on('error', (error) => {
      console.error('❌ Tool execution error:', error.message);
    });

  } catch (error) {
    console.error('❌ Failed to execute streaming tool:', error.message);
  }
}

async function testRegularToolCall() {
  console.log('\n🔧 Testing Regular Tool Call (for comparison)...\n');
  
  try {
    const response = await axios.post(`${SERVER_URL}/mcp/call-tool`, {
      tool: 'create_post',
      parameters: {
        title: 'Test Post from Streamable Server',
        body: 'This is a test post created via the streamable HTTP MCP server'
      }
    });

    console.log('✅ Tool executed successfully:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Tool execution failed:', error.response?.data || error.message);
  }
}

async function testServerHealth() {
  console.log('\n❤️ Testing Server Health...\n');
  
  try {
    const response = await axios.get(`${SERVER_URL}/health`);
    console.log('✅ Server is healthy:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function testAvailableTools() {
  console.log('\n📋 Testing Available Tools...\n');
  
  try {
    const response = await axios.get(`${SERVER_URL}/mcp/tools`);
    console.log('✅ Available tools:');
    response.data.tools.forEach(tool => {
      console.log(`  • ${tool.name}: ${tool.description}`);
    });
  } catch (error) {
    console.error('❌ Failed to fetch tools:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting MCP Streamable HTTP Server Tests\n');
  console.log('Make sure the streamable server is running on port 3001');
  console.log('Run: npm run start:streamable\n');
  
  await testServerHealth();
  await testAvailableTools();
  await testRegularToolCall();
  await testStreamingToolCall();
  await testStreamEndpoint();
  
  console.log('\n🏁 All tests completed!');
  
  // Exit after stream test completes
  setTimeout(() => {
    process.exit(0);
  }, 6000);
}

runTests().catch(console.error); 