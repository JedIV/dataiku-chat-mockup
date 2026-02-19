/**
 * postMessage bridge for communication with parent Dataiku page.
 *
 * Chat UI -> Parent:
 *   { source: 'dataiku-chat-ui', type: 'revealFlowStep', step: '...' }
 *   { source: 'dataiku-chat-ui', type: 'openDataset', dataset: '...' }
 *   { source: 'dataiku-chat-ui', type: 'openStatistics', dataset: '...' }
 *   { source: 'dataiku-chat-ui', type: 'openRecipe', recipe: '...' }
 *   { source: 'dataiku-chat-ui', type: 'goToFlow', zoneId: '...' }
 *
 * Parent -> Chat UI:
 *   { source: 'dataiku-bridge', type: 'hotkey', key: 'n'|'r'|'t' }
 *   { source: 'dataiku-bridge', type: 'state', revealedSteps: [...] }
 */
window.ChatBridge = (function() {
  'use strict';

  var listeners = {};

  function send(type, payload) {
    var msg = Object.assign({ source: 'dataiku-chat-ui', type: type }, payload || {});
    if (window.parent !== window) {
      window.parent.postMessage(msg, '*');
    }
    // Also log for standalone debugging
    console.log('[ChatBridge] sent:', type, payload || '');
  }

  function on(type, callback) {
    if (!listeners[type]) listeners[type] = [];
    listeners[type].push(callback);
  }

  window.addEventListener('message', function(e) {
    var data = e.data;
    if (!data || data.source !== 'dataiku-bridge') return;

    var cbs = listeners[data.type] || [];
    cbs.forEach(function(cb) { cb(data); });
  });

  return { send: send, on: on };
})();
