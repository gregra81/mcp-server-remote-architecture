#!/usr/bin/env tsx
import { MCPToolsManager } from '../dist/mcp-tools-manager.js';
async function testEnhancedManager() {
  console.log('🧪 Testing Enhanced MCPToolsManager\n');
  // Test 1: Local tools only
  console.log('1️⃣ Testing with local tools only:');
  const localOnlyManager = new MCPToolsManager({ enabled: false });
  await localOnlyManager.initialize();
  const localStats = localOnlyManager.getToolStats();
  console.log('   📊 Stats:', localStats);
  const localTools = localOnlyManager.getTools();
  console.log('   🔧 Available tools:', localTools.map(t => t.name).join(', '));
  // Test local tool
  try {
    const result = await localOnlyManager.callTool('greg-test', {
      feeling: 'testing the enhanced architecture',
    });
    console.log('   ✅ Greg test result:', result.result);
  } catch (error) {
    console.log('   ❌ Greg test error:', error);
  }
  console.log('\n' + '─'.repeat(60) + '\n');
  // Test 2: Remote tools (will fail gracefully if server not running)
  console.log('2️⃣ Testing with remote tools (graceful failure expected):');
  const remoteConfig = {
    enabled: true,
    toolsUrl: 'http://localhost:3001/mcp/tools',
    timeout: 3000,
    retryAttempts: 1,
    retryDelay: 500,
  };
  const remoteManager = new MCPToolsManager(remoteConfig);
  await remoteManager.initialize();
  const remoteStats = remoteManager.getToolStats();
  console.log('   📊 Stats:', remoteStats);
  const allTools = remoteManager.getTools();
  console.log('   🔧 All tools:', allTools.map(t => t.name).join(', '));
  const localOnlyTools = remoteManager.getToolsByType('local');
  console.log('   🏠 Local tools:', localOnlyTools.map(t => t.name).join(', '));
  const remoteOnlyTools = remoteManager.getToolsByType('remote');
  console.log(
    '   🌐 Remote tools:',
    remoteOnlyTools.map(t => t.name).join(', ')
  );
  // Try to call a remote tool (will likely fail if server not running)
  if (remoteOnlyTools.length > 0) {
    try {
      console.log('   🧮 Trying remote tool:', remoteOnlyTools[0].name);
      const remoteResult = await remoteManager.callTool(
        remoteOnlyTools[0].name,
        {
          amount: 100,
          rate: 0.08,
        }
      );
      console.log('   ✅ Remote tool result:', remoteResult.result);
    } catch (error) {
      console.log(
        '   ⚠️  Remote tool failed (expected if server not running):',
        error instanceof Error ? error.message : error
      );
    }
  } else {
    console.log('   ℹ️  No remote tools loaded (server not running)');
  }
  console.log('\n' + '─'.repeat(60) + '\n');
  // Test 3: Tool validation
  console.log('3️⃣ Testing parameter validation:');
  try {
    await localOnlyManager.callTool('greg-test', {});
    console.log('   ❌ Should have failed validation');
  } catch (error) {
    console.log(
      '   ✅ Validation correctly caught missing parameter:',
      error instanceof Error ? error.message : error
    );
  }
  try {
    await localOnlyManager.callTool('get_weather', { city: 'London' });
    console.log('   ✅ Weather tool call succeeded with valid parameters');
  } catch (error) {
    console.log('   ❌ Weather tool failed:', error);
  }
  try {
    await localOnlyManager.callTool('get_weather', {});
    console.log('   ❌ Should have failed validation');
  } catch (error) {
    console.log(
      '   ✅ Validation correctly caught missing city parameter:',
      error instanceof Error ? error.message : error
    );
  }
  console.log('\n🎉 Enhanced MCPToolsManager test completed!');
  console.log('\n💡 To test remote tools:');
  console.log('   1. Run: npm run start:remote (in another terminal)');
  console.log('   2. Run this test again');
  console.log('   3. You should see remote tools loaded and working!');
}
// Run the test
testEnhancedManager().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
