/**
 * Flow Assistant Fake Chat - Test Suite
 *
 * Run this AFTER injecting both flow-assistant-config.js and flow-assistant-fake-chat.js
 * Tests each piece of functionality individually.
 *
 * Usage: Paste into browser console on a Dataiku Flow page
 */

(function() {
  'use strict';

  var testResults = [];
  var testCount = 0;
  var passCount = 0;

  function log(message, type) {
    var prefix = type === 'pass' ? '✓' : type === 'fail' ? '✗' : '→';
    var color = type === 'pass' ? 'color:#51cf66' : type === 'fail' ? 'color:#ff6b6b' : 'color:#888';
    console.log('%c' + prefix + ' ' + message, color);
  }

  function test(name, fn) {
    testCount++;
    try {
      var result = fn();
      if (result === true) {
        passCount++;
        log(name, 'pass');
        testResults.push({ name: name, passed: true });
      } else {
        log(name + ' - ' + (result || 'returned false'), 'fail');
        testResults.push({ name: name, passed: false, error: result });
      }
    } catch (e) {
      log(name + ' - ' + e.message, 'fail');
      testResults.push({ name: name, passed: false, error: e.message });
    }
  }

  function asyncTest(name, fn) {
    testCount++;
    return fn().then(function(result) {
      if (result === true) {
        passCount++;
        log(name, 'pass');
        testResults.push({ name: name, passed: true });
      } else {
        log(name + ' - ' + (result || 'returned false'), 'fail');
        testResults.push({ name: name, passed: false, error: result });
      }
    }).catch(function(e) {
      log(name + ' - ' + e.message, 'fail');
      testResults.push({ name: name, passed: false, error: e.message });
    });
  }

  function sleep(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
  }

  // ============================================
  // TEST SUITE
  // ============================================

  async function runTests() {
    console.log('%c\n=== Flow Assistant Fake Chat Tests ===\n', 'font-weight:bold;font-size:14px');

    // ----------------------------------------
    // 1. Prerequisites check
    // ----------------------------------------
    console.log('%c1. Prerequisites', 'font-weight:bold');

    test('window.fakeChatConfig exists', function() {
      return !!window.fakeChatConfig;
    });

    test('window.fakeChatState exists', function() {
      return !!window.fakeChatState;
    });

    test('window.fakeChat API exists', function() {
      return !!window.fakeChat;
    });

    test('fakeChatConfig has conversation array', function() {
      return Array.isArray(window.fakeChatConfig.conversation);
    });

    test('fakeChatConfig has flowSteps object', function() {
      return typeof window.fakeChatConfig.flowSteps === 'object';
    });

    // ----------------------------------------
    // 2. Flow visibility functions
    // ----------------------------------------
    console.log('%c\n2. Flow Visibility Functions', 'font-weight:bold');

    // First show all elements to have a clean state
    fakeChat.showAllFlow();
    await sleep(100);

    test('fakeChat.showAllFlow() makes elements visible', function() {
      var nodes = document.querySelectorAll('g[id^="zone__"]');
      var edges = document.querySelectorAll('g[id^="edge"]');
      if (nodes.length === 0 && edges.length === 0) {
        return 'No flow elements found on page (are you on the flow page?)';
      }
      var hiddenNodes = Array.from(nodes).filter(function(el) {
        return el.style.display === 'none';
      });
      var hiddenEdges = Array.from(edges).filter(function(el) {
        return el.style.display === 'none';
      });
      return hiddenNodes.length === 0 && hiddenEdges.length === 0;
    });

    // ----------------------------------------
    // 3. Reset function
    // ----------------------------------------
    console.log('%c\n3. Reset Function', 'font-weight:bold');

    // Set some state first
    window.fakeChatState.conversationIndex = 5;
    window.fakeChatState.revealedSteps = ['sources', 'parse'];
    window.fakeChatState.renderedMessages = ['<div>test</div>'];

    fakeChat.reset();

    test('fakeChat.reset() clears conversationIndex', function() {
      return window.fakeChatState.conversationIndex === 0;
    });

    test('fakeChat.reset() clears revealedSteps', function() {
      return window.fakeChatState.revealedSteps.length === 0;
    });

    test('fakeChat.reset() clears renderedMessages', function() {
      return window.fakeChatState.renderedMessages.length === 0;
    });

    test('fakeChat.reset() shows all flow elements', function() {
      var nodes = document.querySelectorAll('g[id^="zone__"]');
      if (nodes.length === 0) return 'No flow elements found';
      var hidden = Array.from(nodes).filter(function(el) {
        return el.style.display === 'none';
      });
      return hidden.length === 0;
    });

    // ----------------------------------------
    // 4. initFlow function
    // ----------------------------------------
    console.log('%c\n4. initFlow Function', 'font-weight:bold');

    fakeChat.initFlow();
    await sleep(500);

    test('fakeChat.initFlow() sets revealedSteps to sources', function() {
      var steps = window.fakeChatState.revealedSteps;
      return steps.length === 1 && steps[0] === 'sources';
    });

    test('fakeChat.initFlow() hides non-source elements', function() {
      // Check that parse step nodes are hidden
      var parseConfig = window.fakeChatConfig.flowSteps.parse;
      if (!parseConfig || !parseConfig.nodes || !parseConfig.nodes[0]) {
        return 'No parse step configured';
      }
      var parseNode = document.getElementById(parseConfig.nodes[0]);
      if (!parseNode) return 'Parse node not found in DOM';
      return parseNode.style.display === 'none';
    });

    test('fakeChat.initFlow() shows source elements', function() {
      var sourcesConfig = window.fakeChatConfig.flowSteps.sources;
      if (!sourcesConfig || !sourcesConfig.nodes || !sourcesConfig.nodes[0]) {
        return 'No sources step configured';
      }
      var sourceNode = document.getElementById(sourcesConfig.nodes[0]);
      if (!sourceNode) return 'Source node not found in DOM';
      return sourceNode.style.display !== 'none';
    });

    // ----------------------------------------
    // 5. revealStep function
    // ----------------------------------------
    console.log('%c\n5. revealStep Function', 'font-weight:bold');

    // Start fresh
    fakeChat.initFlow();
    await sleep(100);

    fakeChat.revealStep('parse');

    test('fakeChat.revealStep() adds to revealedSteps', function() {
      var steps = window.fakeChatState.revealedSteps;
      return steps.indexOf('parse') !== -1;
    });

    test('fakeChat.revealStep() shows parse elements', function() {
      var parseConfig = window.fakeChatConfig.flowSteps.parse;
      if (!parseConfig || !parseConfig.nodes || !parseConfig.nodes[0]) {
        return 'No parse step configured';
      }
      var parseNode = document.getElementById(parseConfig.nodes[0]);
      if (!parseNode) return 'Parse node not found in DOM';
      return parseNode.style.display !== 'none';
    });

    test('fakeChat.revealStep() keeps sources visible', function() {
      var sourcesConfig = window.fakeChatConfig.flowSteps.sources;
      if (!sourcesConfig || !sourcesConfig.nodes || !sourcesConfig.nodes[0]) {
        return 'No sources step configured';
      }
      var sourceNode = document.getElementById(sourcesConfig.nodes[0]);
      if (!sourceNode) return 'Source node not found in DOM';
      return sourceNode.style.display !== 'none';
    });

    test('fakeChat.revealStep() keeps later steps hidden', function() {
      var modelConfig = window.fakeChatConfig.flowSteps.model;
      if (!modelConfig || !modelConfig.nodes || !modelConfig.nodes[0]) {
        return 'No model step configured';
      }
      var modelNode = document.getElementById(modelConfig.nodes[0]);
      if (!modelNode) return 'Model node not found in DOM';
      return modelNode.style.display === 'none';
    });

    // ----------------------------------------
    // 6. Panel functions
    // ----------------------------------------
    console.log('%c\n6. Panel Functions', 'font-weight:bold');

    test('fakeChat.openPanel() function exists', function() {
      return typeof fakeChat.openPanel === 'function';
    });

    // ----------------------------------------
    // 7. Message advance
    // ----------------------------------------
    console.log('%c\n7. Advance Function', 'font-weight:bold');

    // Reset first
    fakeChat.reset();
    fakeChat.initFlow();
    await sleep(200);

    var startIndex = window.fakeChatState.conversationIndex;

    await asyncTest('fakeChat.advance() increments conversationIndex', async function() {
      await fakeChat.advance();
      return window.fakeChatState.conversationIndex === startIndex + 1;
    });

    await asyncTest('fakeChat.advance() creates message in DOM', async function() {
      await sleep(100);
      var messages = document.querySelectorAll('.fake-message');
      return messages.length > 0;
    });

    await asyncTest('fakeChat.advance() stores rendered message', async function() {
      return window.fakeChatState.renderedMessages.length > 0;
    });

    // ----------------------------------------
    // 8. API completeness
    // ----------------------------------------
    console.log('%c\n8. API Completeness', 'font-weight:bold');

    test('fakeChat.advance is a function', function() {
      return typeof fakeChat.advance === 'function';
    });

    test('fakeChat.reset is a function', function() {
      return typeof fakeChat.reset === 'function';
    });

    test('fakeChat.initFlow is a function', function() {
      return typeof fakeChat.initFlow === 'function';
    });

    test('fakeChat.openPanel is a function', function() {
      return typeof fakeChat.openPanel === 'function';
    });

    test('fakeChat.autoRun is a function', function() {
      return typeof fakeChat.autoRun === 'function';
    });

    test('fakeChat.showAllFlow is a function', function() {
      return typeof fakeChat.showAllFlow === 'function';
    });

    test('fakeChat.revealStep is a function', function() {
      return typeof fakeChat.revealStep === 'function';
    });

    // ----------------------------------------
    // Summary
    // ----------------------------------------
    console.log('%c\n=== Test Summary ===', 'font-weight:bold;font-size:14px');
    console.log('%c' + passCount + '/' + testCount + ' tests passed', passCount === testCount ? 'color:#51cf66;font-weight:bold' : 'color:#ff6b6b;font-weight:bold');

    if (passCount < testCount) {
      console.log('\nFailed tests:');
      testResults.filter(function(r) { return !r.passed; }).forEach(function(r) {
        console.log('  - ' + r.name + (r.error ? ': ' + r.error : ''));
      });
    }

    // Clean up - reset to show all elements
    fakeChat.reset();

    return { passed: passCount, total: testCount, results: testResults };
  }

  // Run tests and expose results
  window.fakeChatTestResults = null;
  runTests().then(function(results) {
    window.fakeChatTestResults = results;
  });

})();
