#!/usr/bin/env tsx
import axios from 'axios';
const SERVER_URL = 'http://localhost:3000';
console.log('🎪 MCP SSE Server Demo');
console.log('====================\n');
// Demo functions
async function demoHealthCheck() {
    console.log('🏥 Health Check:');
    try {
        const response = await axios.get(`${SERVER_URL}/health`);
        console.log(`   ✅ Server is ${response.data.status}`);
        console.log(`   📅 ${response.data.timestamp}\n`);
    }
    catch (error) {
        console.log('   ❌ Server is not responding\n');
        process.exit(1);
    }
}
async function demoToolsList() {
    console.log('🔧 Available Tools:');
    try {
        const response = await axios.get(`${SERVER_URL}/mcp/tools`);
        response.data.tools.forEach((tool, index) => {
            console.log(`   ${index + 1}. ${tool.name}: ${tool.description}`);
        });
        console.log();
    }
    catch (error) {
        console.log('   ❌ Could not fetch tools\n');
    }
}
async function demoHttpPost() {
    console.log('🌐 HTTP POST Tool Demo:');
    console.log('   📤 Sending POST request to httpbin.org...');
    try {
        const response = await axios.post(`${SERVER_URL}/mcp/call-tool`, {
            tool: 'http_post',
            parameters: {
                url: 'https://httpbin.org/post',
                data: {
                    demo: 'MCP Server Demo',
                    timestamp: new Date().toISOString(),
                    features: ['SSE', 'HTTP POST', 'Tool System']
                },
                headers: {
                    'User-Agent': 'MCP-Demo/1.0',
                    'X-Demo': 'true'
                }
            }
        });
        const result = response.data.result.result;
        if (result.success) {
            console.log(`   ✅ POST request successful (${result.status} ${result.statusText})`);
            console.log(`   📊 Response contains: ${Object.keys(result.data).join(', ')}`);
            console.log(`   🌍 Origin IP: ${result.data.origin}`);
        }
        else {
            console.log(`   ❌ POST request failed: ${result.error}`);
        }
        console.log();
    }
    catch (error) {
        console.log(`   ❌ Tool call failed: ${error.message}\n`);
    }
}
async function demoWeatherTool() {
    console.log('🌤️  Weather Tool Demo:');
    console.log('   🎲 Getting mock weather data...');
    try {
        const cities = ['Tokyo', 'London', 'New York', 'Sydney', 'Paris'];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        const response = await axios.post(`${SERVER_URL}/mcp/call-tool`, {
            tool: 'get_weather',
            parameters: {
                city: randomCity,
                units: 'metric'
            }
        });
        const result = response.data.result.result;
        if (result.success) {
            console.log(`   📍 ${result.city}: ${result.temperature}°C`);
            console.log(`   🌈 ${result.description}`);
            console.log(`   💧 Humidity: ${result.humidity}%`);
            console.log(`   🎭 Mock data: ${result.mock ? 'Yes' : 'No'}`);
        }
        console.log();
    }
    catch (error) {
        console.log(`   ❌ Weather check failed: ${error.message}\n`);
    }
}
async function demoCreatePost() {
    console.log('📝 Create Post Tool Demo:');
    console.log('   📋 Creating a test post...');
    try {
        const response = await axios.post(`${SERVER_URL}/mcp/call-tool`, {
            tool: 'create_post',
            parameters: {
                title: 'Demo Post from MCP Server',
                body: `This post was created by the MCP SSE Server demo at ${new Date().toLocaleString()}. It demonstrates the server's ability to make HTTP POST requests to external APIs!`,
                userId: Math.floor(Math.random() * 10) + 1
            }
        });
        const result = response.data.result.result;
        if (result.success) {
            console.log(`   ✅ Post created successfully!`);
            console.log(`   🆔 Post ID: ${result.post.id}`);
            console.log(`   📰 Title: "${result.post.title}"`);
            console.log(`   👤 User ID: ${result.post.userId}`);
        }
        console.log();
    }
    catch (error) {
        console.log(`   ❌ Post creation failed: ${error.message}\n`);
    }
}
async function demoSSEConnection() {
    console.log('📡 SSE Connection Demo:');
    console.log('   🔌 Connecting to SSE stream...');
    try {
        // Simulate SSE connection check
        const response = await axios.get(`${SERVER_URL}/mcp/sse`, {
            responseType: 'stream',
            timeout: 3000
        });
        console.log('   ✅ SSE endpoint is accessible');
        console.log('   📨 Receiving real-time events...');
        let eventCount = 0;
        response.data.on('data', (chunk) => {
            if (eventCount < 2) {
                const lines = chunk.toString().split('\n');
                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            console.log(`   📬 Event: ${data.type} ${data.message || data.clientId || ''}`);
                            eventCount++;
                        }
                        catch (e) {
                            // Ignore parse errors
                        }
                    }
                });
            }
        });
        // Close connection after a moment
        setTimeout(() => {
            response.data.destroy();
            console.log('   🔌 SSE connection closed\n');
        }, 2000);
    }
    catch (error) {
        console.log(`   ❌ SSE connection failed: ${error.message}\n`);
    }
}
// Main demo execution
async function runDemo() {
    try {
        await demoHealthCheck();
        await demoToolsList();
        await demoSSEConnection();
        await demoHttpPost();
        await demoWeatherTool();
        await demoCreatePost();
        console.log('🎉 Demo completed successfully!');
        console.log('💡 Try opening examples/client.html in your browser for an interactive demo');
        console.log('🌐 Or visit http://localhost:3000/mcp/sse to see the SSE stream directly');
    }
    catch (error) {
        console.error('❌ Demo failed:', error.message);
        process.exit(1);
    }
}
// Run the demo
runDemo();
//# sourceMappingURL=demo.js.map