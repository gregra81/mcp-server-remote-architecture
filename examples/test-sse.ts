#!/usr/bin/env tsx

import axios, { AxiosResponse } from 'axios';

const SERVER_URL: string = 'http://localhost:3000';

/**
 * Test the MCP SSE server tools
 */
async function testMCPSSEServer(): Promise<void> {
    console.log('🧪 Testing MCP SSE Server Tools\n');

    try {
        // Test 1: Health check
        console.log('1️⃣ Testing health endpoint...');
        const healthResponse: AxiosResponse = await axios.get(`${SERVER_URL}/health`);
        console.log('✅ Health check:', healthResponse.data);
        console.log();

        // Test 2: Get available tools
        console.log('2️⃣ Getting available tools...');
        const toolsResponse: AxiosResponse = await axios.get(`${SERVER_URL}/mcp/tools`);
        console.log('✅ Available tools:', toolsResponse.data.tools.length);
        toolsResponse.data.tools.forEach((tool: any) => {
            console.log(`   - ${tool.name}: ${tool.description}`);
        });
        console.log();

        // Test 3: HTTP POST tool with httpbin.org
        console.log('3️⃣ Testing HTTP POST tool...');
        const httpPostResult: AxiosResponse = await axios.post(`${SERVER_URL}/mcp/call-tool`, {
            tool: 'http_post',
            parameters: {
                url: 'https://httpbin.org/post',
                data: {
                    message: 'Hello from MCP SSE test!',
                    timestamp: new Date().toISOString(),
                    test: true
                },
                headers: {
                    'User-Agent': 'MCP-SSE-Test-Client/1.0'
                }
            }
        });
        console.log('✅ HTTP POST result:', httpPostResult.data.success ? 'Success' : 'Failed');
        console.log('   Response status:', httpPostResult.data.result.result.status);
        console.log();

        // Test 4: Weather tool (mock data)
        console.log('4️⃣ Testing weather tool (mock data)...');
        const weatherResult: AxiosResponse = await axios.post(`${SERVER_URL}/mcp/call-tool`, {
            tool: 'get_weather',
            parameters: {
                city: 'New York',
                units: 'metric'
            }
        });
        console.log('✅ Weather result:', weatherResult.data.success ? 'Success' : 'Failed');
        console.log('   Temperature:', weatherResult.data.result.result.temperature + '°C');
        console.log('   Mock data:', weatherResult.data.result.result.mock);
        console.log();

        // Test 5: Create post tool
        console.log('5️⃣ Testing create post tool...');
        const postResult: AxiosResponse = await axios.post(`${SERVER_URL}/mcp/call-tool`, {
            tool: 'create_post',
            parameters: {
                title: 'Test Post from MCP SSE Server',
                body: 'This post was created by the MCP SSE server test script!',
                userId: 42
            }
        });
        console.log('✅ Create post result:', postResult.data.success ? 'Success' : 'Failed');
        console.log('   Created post ID:', postResult.data.result.result.post.id);
        console.log();

        // Test 6: Error handling
        console.log('6️⃣ Testing error handling...');
        try {
            await axios.post(`${SERVER_URL}/mcp/call-tool`, {
                tool: 'non_existent_tool',
                parameters: {}
            });
        } catch (error: any) {
            console.log('✅ Error handling works:', error.response.status, error.response.data.error);
        }
        console.log();

        console.log('🎉 All SSE server tests completed successfully!');

    } catch (error: any) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        process.exit(1);
    }
}

// Test SSE connection
async function testSSEConnection(): Promise<void> {
    console.log('📡 Testing SSE connection...');
    
    try {
        // Note: This is a simplified test - in a real scenario you'd use EventSource
        const response: AxiosResponse = await axios.get(`${SERVER_URL}/mcp/sse`, {
            responseType: 'stream',
            timeout: 5000
        });
        
        console.log('✅ SSE endpoint is accessible');
        
        // Read first few chunks
        let chunks = 0;
        response.data.on('data', (chunk: Buffer) => {
            if (chunks < 3) {
                console.log('   SSE data:', chunk.toString().trim());
                chunks++;
            }
        });
        
        // Close after a short delay
        setTimeout(() => {
            response.data.destroy();
            console.log('✅ SSE connection test completed\n');
        }, 2000);
        
    } catch (error: any) {
        console.error('❌ SSE test failed:', error.message);
    }
}

// Main execution
async function main(): Promise<void> {
    console.log('🚀 MCP SSE Server Test Suite');
    console.log('=' .repeat(50));
    console.log('Make sure the SSE server is running on port 3000');
    console.log('Run: npm run start:sse\n');
    
    // Wait a moment for potential server startup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testSSEConnection();
    await testMCPSSEServer();
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { testMCPSSEServer, testSSEConnection }; 