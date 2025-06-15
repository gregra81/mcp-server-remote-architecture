#!/usr/bin/env tsx
import axios from 'axios';
const SERVER_URL = 'http://localhost:3001';
/**
 * Test the MCP Streamable HTTP server tools
 */
async function testMCPStreamableServer() {
    console.log('🧪 Testing MCP Streamable HTTP Server Tools\n');
    try {
        // Test 1: Health check
        console.log('1️⃣ Testing health endpoint...');
        const healthResponse = await axios.get(`${SERVER_URL}/health`);
        console.log('✅ Health check:', healthResponse.data);
        console.log();
        // Test 2: Get available tools
        console.log('2️⃣ Getting available tools...');
        const toolsResponse = await axios.get(`${SERVER_URL}/mcp/tools`);
        console.log('✅ Available tools:', toolsResponse.data.tools.length);
        toolsResponse.data.tools.forEach((tool) => {
            console.log(`   - ${tool.name}: ${tool.description}`);
        });
        console.log();
        // Test 3: HTTP POST tool with httpbin.org
        console.log('3️⃣ Testing HTTP POST tool...');
        const httpPostResult = await axios.post(`${SERVER_URL}/mcp/call-tool`, {
            tool: 'http_post',
            parameters: {
                url: 'https://httpbin.org/post',
                data: {
                    message: 'Hello from MCP Streamable test!',
                    timestamp: new Date().toISOString(),
                    test: true,
                    server: 'streamable-http'
                },
                headers: {
                    'User-Agent': 'MCP-Streamable-Test-Client/1.0'
                }
            }
        });
        console.log('✅ HTTP POST result:', httpPostResult.data.success ? 'Success' : 'Failed');
        console.log('   Response status:', httpPostResult.data.result.result.status);
        console.log();
        // Test 4: Weather tool (mock data)
        console.log('4️⃣ Testing weather tool (mock data)...');
        const weatherResult = await axios.post(`${SERVER_URL}/mcp/call-tool`, {
            tool: 'get_weather',
            parameters: {
                city: 'Tokyo',
                units: 'metric'
            }
        });
        console.log('✅ Weather result:', weatherResult.data.success ? 'Success' : 'Failed');
        console.log('   Temperature:', weatherResult.data.result.result.temperature + '°C');
        console.log('   Mock data:', weatherResult.data.result.result.mock);
        console.log();
        // Test 5: Create post tool
        console.log('5️⃣ Testing create post tool...');
        const postResult = await axios.post(`${SERVER_URL}/mcp/call-tool`, {
            tool: 'create_post',
            parameters: {
                title: 'Test Post from MCP Streamable Server',
                body: 'This post was created by the MCP Streamable HTTP server test script!',
                userId: 123
            }
        });
        console.log('✅ Create post result:', postResult.data.success ? 'Success' : 'Failed');
        console.log('   Created post ID:', postResult.data.result.result.post.id);
        console.log();
        // Test 6: Streaming tool call
        console.log('6️⃣ Testing streaming tool call...');
        const streamingResult = await axios.post(`${SERVER_URL}/mcp/call-tool-stream`, {
            tool: 'get_weather',
            parameters: {
                city: 'London',
                units: 'metric'
            }
        }, {
            responseType: 'stream'
        });
        console.log('✅ Streaming response received');
        let streamData = '';
        await new Promise((resolve) => {
            streamingResult.data.on('data', (chunk) => {
                streamData += chunk.toString();
            });
            streamingResult.data.on('end', () => {
                const lines = streamData.trim().split('\n');
                lines.forEach(line => {
                    try {
                        const data = JSON.parse(line);
                        console.log(`   📡 Stream event: ${data.type}`);
                        if (data.type === 'result') {
                            console.log(`   🌡️  Result: ${data.result.result.city} - ${data.result.result.temperature}°C`);
                        }
                    }
                    catch (e) {
                        // Ignore parse errors
                    }
                });
                resolve();
            });
        });
        console.log();
        // Test 7: Error handling
        console.log('7️⃣ Testing error handling...');
        try {
            await axios.post(`${SERVER_URL}/mcp/call-tool`, {
                tool: 'non_existent_tool',
                parameters: {}
            });
        }
        catch (error) {
            console.log('✅ Error handling works:', error.response.status, error.response.data.error);
        }
        console.log();
        console.log('🎉 All Streamable server tests completed successfully!');
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        process.exit(1);
    }
}
// Test streaming connections
async function testStreamableConnections() {
    console.log('🌊 Testing streamable connections...');
    try {
        // Test simple streaming endpoint
        console.log('📡 Testing simple streaming endpoint...');
        const response = await axios.get(`${SERVER_URL}/mcp/stream-simple`, {
            responseType: 'stream',
            timeout: 5000
        });
        console.log('✅ Simple streaming endpoint is accessible');
        // Read first few chunks
        let chunks = 0;
        let streamData = '';
        await new Promise((resolve) => {
            response.data.on('data', (chunk) => {
                if (chunks < 3) {
                    streamData += chunk.toString();
                    chunks++;
                }
            });
            response.data.on('end', resolve);
            // Auto-close after delay
            setTimeout(() => {
                response.data.destroy();
                resolve();
            }, 3000);
        });
        // Parse and display received data
        const lines = streamData.trim().split('\n');
        lines.forEach(line => {
            try {
                const data = JSON.parse(line);
                console.log(`   📨 Received: ${data.type} - ${data.message || data.clientId || 'capabilities'}`);
            }
            catch (e) {
                // Ignore parse errors
            }
        });
        console.log();
        // Test chunked streaming endpoint
        console.log('🔄 Testing chunked streaming endpoint...');
        const chunkedResponse = await axios.get(`${SERVER_URL}/mcp/stream`, {
            responseType: 'stream',
            timeout: 5000
        });
        console.log('✅ Chunked streaming endpoint is accessible');
        // Read first chunk
        await new Promise((resolve) => {
            let firstChunk = true;
            chunkedResponse.data.on('data', (chunk) => {
                if (firstChunk) {
                    console.log('   📦 Received chunked data format');
                    firstChunk = false;
                }
            });
            chunkedResponse.data.on('end', resolve);
            // Auto-close after delay
            setTimeout(() => {
                chunkedResponse.data.destroy();
                resolve();
            }, 2000);
        });
        console.log('✅ Streaming connection tests completed\n');
    }
    catch (error) {
        console.error('❌ Streaming test failed:', error.message);
    }
}
// Main execution
async function main() {
    console.log('🚀 MCP Streamable HTTP Server Test Suite');
    console.log('='.repeat(50));
    console.log('Make sure the Streamable server is running on port 3001');
    console.log('Run: npm run start:streamable\n');
    // Wait a moment for potential server startup
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testStreamableConnections();
    await testMCPStreamableServer();
}
// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
export { testMCPStreamableServer, testStreamableConnections };
//# sourceMappingURL=test-streamable.js.map