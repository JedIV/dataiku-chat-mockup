/**
 * Chat Panel Injection Script
 *
 * Creates a persistent 50/50 split: Dataiku on the left, chat UI iframe on the right.
 * The split is a fixed overlay so it survives Angular navigation.
 *
 * Also sets up:
 *   - postMessage bridge (iframe → parent) for Dataiku navigation actions
 *   - Flow visibility control (hide/reveal flow nodes progressively)
 *   - Hotkey forwarding (Ctrl+Shift+N/R/T)
 *
 * Usage: Paste into browser console on a Dataiku Flow page.
 *        Requires chat-ui dev server running at localhost:3333.
 */
(function() {
  'use strict';

  var CHAT_URL = 'http://localhost:3333';

  // ============================================
  // Prevent double injection
  // ============================================
  if (document.getElementById('chat-panel-split')) {
    console.log('[ChatPanel] Already injected');
    return;
  }

  // ============================================
  // FLOW VISIBILITY
  // ============================================
  var flowSteps = {
    initial: {
      nodes: ['zone__default__dataset__PATIENTCOHORT_46_patient__demographics__sf'],
      edges: []
    },
    sources: {
      nodes: [
        'zone__default__dataset__PATIENTCOHORT_46_lab__results__2025__sf',
        'zone__default__dataset__PATIENTCOHORT_46_clinical__notes__raw__sf'
      ],
      edges: []
    },
    parse: {
      nodes: [
        'zone__default__recipe__compute__lab__results__2025__sf__parsed',
        'zone__default__dataset__PATIENTCOHORT_46_lab__results__2025__sf__parsed',
        'zone__default__recipe__compute__clinical__notes__parsed__sf',
        'zone__default__dataset__PATIENTCOHORT_46_clinical__notes__parsed__sf',
        'zone__default__recipe__compute__lab__results__2025__most__recent__sf',
        'zone__default__dataset__PATIENTCOHORT_46_lab__results__2025__most__recent__sf',
        'zone__default__recipe__compute__clinical__notes__most__recent__per__patient__sf',
        'zone__default__dataset__PATIENTCOHORT_46_clinical__notes__most__recent__per__patient__sf'
      ],
      edges: ['edge1','edge2','edge3','edge4','edge5','edge6','edge7','edge8']
    },
    join: {
      nodes: [
        'zone__default__recipe__compute__patient__all__data__joined__sf',
        'zone__default__dataset__PATIENTCOHORT_46_patient__all__data__joined__sf'
      ],
      edges: ['edge9','edge10','edge11','edge12']
    },
    ai: {
      nodes: [
        'zone__default__recipe__compute__patient__all__data__joined__sf__generated',
        'zone__default__dataset__PATIENTCOHORT_46_patient__all__data__joined__sf__generated'
      ],
      edges: ['edge13','edge14']
    },
    model: {
      nodes: [
        'zone__default__recipe__train__Predict__enrollment__success____binary__',
        'zone__default__savedmodel__PATIENTCOHORT_46_Lwq3ieVN'
      ],
      edges: ['edge18','edge19']
    },
    scored: {
      nodes: [
        'zone__default__recipe__score__patient__all__data__joined__sf',
        'zone__default__dataset__PATIENTCOHORT_46_patient__all__data__joined__sf__scored'
      ],
      edges: ['edge15','edge16','edge17','edge18','edge19']
    },
    agent: {
      nodes: [
        'zone__default__savedmodel__PATIENTCOHORT_46_RGqjivfB'
      ],
      edges: []
    }
  };

  var revealedSteps = [];

  // CSS to hide all flow elements when active
  var style = document.createElement('style');
  style.id = 'chat-panel-styles';
  style.textContent = [
    'body.chat-panel-active g[id^="zone__"]{display:none}',
    'body.chat-panel-active g[id^="edge"]{display:none}'
  ].join('');
  document.head.appendChild(style);

  function showFlowElements(nodeIds, edgeIds) {
    (nodeIds || []).forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.setProperty('display', 'block', 'important');
    });
    (edgeIds || []).forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.setProperty('display', 'block', 'important');
    });
  }

  function clearInlineDisplayStyles() {
    document.querySelectorAll('g[id^="zone__"]').forEach(function(el) {
      el.style.removeProperty('display');
    });
    document.querySelectorAll('g[id^="edge"]').forEach(function(el) {
      el.style.removeProperty('display');
    });
  }

  function applyFlowState() {
    clearInlineDisplayStyles();
    revealedSteps.forEach(function(step) {
      var stepConfig = flowSteps[step];
      if (stepConfig) showFlowElements(stepConfig.nodes, stepConfig.edges);
    });
  }

  function revealFlowStep(stepName) {
    if (!flowSteps[stepName]) {
      console.log('[ChatPanel] Unknown flow step: ' + stepName);
      return;
    }
    if (revealedSteps.indexOf(stepName) === -1) {
      revealedSteps.push(stepName);
    }
    applyFlowState();
    console.log('[ChatPanel] Revealed: ' + revealedSteps.join(', '));
  }

  // ============================================
  // ANGULAR NAVIGATION
  // ============================================
  function executeAction(action) {
    if (!action || !action.type) return;

    try {
      if (action.type === 'revealFlowStep') {
        revealFlowStep(action.step);
        return;
      }

      if (action.type === 'reset') {
        revealedSteps = [];
        clearInlineDisplayStyles();
        revealFlowStep('initial');
        console.log('[ChatPanel] Flow reset');
        return;
      }

      var injector = window.angular && angular.element(document.body).injector();
      if (!injector) {
        console.log('[ChatPanel] Angular not available');
        return;
      }

      var $state = injector.get('$state');
      var projectKey = $state.params.projectKey || 'PATIENTCOHORT';

      switch (action.type) {
        case 'openDataset':
          if (action.dataset) {
            $state.go('projects.project.datasets.dataset.explore', {
              projectKey: projectKey, datasetName: action.dataset
            });
          }
          break;

        case 'openStatistics':
          if (action.dataset) {
            $state.go('projects.project.datasets.dataset.statistics', {
              projectKey: projectKey, datasetName: action.dataset
            });
          }
          break;

        case 'goToFlow':
          $state.go('projects.project.flow', {
            projectKey: projectKey, zoneId: action.zoneId || 'default'
          });
          break;

        case 'openRecipe':
          if (action.recipe) {
            $state.go('projects.project.recipes.recipe', {
              projectKey: projectKey, recipeName: action.recipe
            });
          }
          break;

        case 'openAgent':
          if (action.modelId && action.versionId) {
            $state.go('projects.project.savedmodels.savedmodel.agent', {
              projectKey: projectKey,
              smId: action.modelId,
              mVersionId: action.versionId
            });
          }
          break;

        default:
          console.log('[ChatPanel] Unknown action: ' + action.type);
      }
    } catch (e) {
      console.log('[ChatPanel] Action error:', e);
    }
  }

  // ============================================
  // LAYOUT: FIXED 50/50 SPLIT OVERLAY
  // ============================================

  // Constrain all Dataiku content to the left half
  var constrainStyle = document.createElement('style');
  constrainStyle.id = 'chat-panel-constrain';
  constrainStyle.textContent = [
    // Force the entire Dataiku app into the left 50%
    'body.chat-panel-active .mainzone { width: 50vw !important; overflow: hidden !important; }',
    // Hide the native right panel so it doesn't overlap
    'body.chat-panel-active .right-panel { display: none !important; }',
    // Constrain any fixed/absolute positioned Dataiku elements
    'body.chat-panel-active .universe-main-panel { right: 50vw !important; }',
    'body.chat-panel-active .top-nav { width: 50vw !important; }'
  ].join('\n');
  document.head.appendChild(constrainStyle);

  // Chat panel on the right half
  var chatPanel = document.createElement('div');
  chatPanel.id = 'chat-panel-split';
  chatPanel.style.cssText = [
    'position: fixed',
    'top: 0',
    'right: 0',
    'width: 50vw',
    'height: 100vh',
    'z-index: 10000',
    'border-left: 1px solid #e5e7eb',
    'background: #fafafa',
    'transition: transform 0.3s ease'
  ].join(';');

  var iframe = document.createElement('iframe');
  iframe.id = 'chat-panel-iframe';
  iframe.src = CHAT_URL;
  iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';

  chatPanel.appendChild(iframe);
  document.body.appendChild(chatPanel);

  // Toggle button (tab on the left edge of the chat panel)
  var toggleBtn = document.createElement('div');
  toggleBtn.id = 'chat-panel-toggle';
  toggleBtn.style.cssText = [
    'position: absolute',
    'left: -28px',
    'top: 50%',
    'transform: translateY(-50%)',
    'width: 28px',
    'height: 56px',
    'background: #fff',
    'border: 1px solid #e5e7eb',
    'border-right: none',
    'border-radius: 6px 0 0 6px',
    'cursor: pointer',
    'display: flex',
    'align-items: center',
    'justify-content: center',
    'font-size: 14px',
    'color: #666',
    'z-index: 10001',
    'box-shadow: -2px 0 4px rgba(0,0,0,0.05)'
  ].join(';');
  toggleBtn.innerHTML = '&#10094;'; // left chevron when open
  toggleBtn.title = 'Toggle chat panel (Ctrl+Shift+T)';
  chatPanel.appendChild(toggleBtn);

  // ============================================
  // OPEN / CLOSE
  // ============================================
  var panelOpen = true;

  function openPanel() {
    panelOpen = true;
    chatPanel.style.transform = 'translateX(0)';
    document.body.classList.add('chat-panel-active');
    toggleBtn.innerHTML = '&#10094;'; // left chevron
    applyFlowState();
  }

  function closePanel() {
    panelOpen = false;
    chatPanel.style.transform = 'translateX(100%)';
    document.body.classList.remove('chat-panel-active');
    toggleBtn.innerHTML = '&#10095;'; // right chevron
    // Show all flow elements
    document.querySelectorAll('g[id^="zone__"]').forEach(function(el) {
      el.style.setProperty('display', 'block', 'important');
    });
    document.querySelectorAll('g[id^="edge"]').forEach(function(el) {
      el.style.setProperty('display', 'block', 'important');
    });
  }

  function togglePanel() {
    if (panelOpen) closePanel();
    else openPanel();
  }

  toggleBtn.addEventListener('click', togglePanel);

  // Activate
  document.body.classList.add('chat-panel-active');

  // ============================================
  // POSTMESSAGE BRIDGE
  // ============================================
  window.addEventListener('message', function(e) {
    var data = e.data;
    if (!data || data.source !== 'dataiku-chat-ui') return;

    console.log('[ChatPanel] Received:', data.type, data);
    executeAction(data);
  });

  // Forward hotkeys to iframe
  document.addEventListener('keydown', function(e) {
    if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;

    var key = e.key.toLowerCase();
    if (key === 'n' || key === 'r' || key === 't') {
      e.preventDefault();

      // Forward to iframe
      iframe.contentWindow.postMessage({
        source: 'dataiku-bridge',
        type: 'hotkey',
        key: key
      }, '*');

      // Handle toggle locally
      if (key === 't') {
        togglePanel();
      }

      // Handle reset locally
      if (key === 'r') {
        revealedSteps = [];
        clearInlineDisplayStyles();
        revealFlowStep('initial');
      }
    }
  });

  // Re-apply flow state when navigating back to the flow page
  // (SVG gets re-rendered by Angular, losing our inline styles)
  var flowObserver = new MutationObserver(function() {
    var testNode = document.getElementById('zone__default__dataset__PATIENTCOHORT_46_patient__demographics__sf');
    if (testNode && !testNode.style.display && revealedSteps.length > 0) {
      applyFlowState();
    }
  });
  flowObserver.observe(document.body, { childList: true, subtree: true });

  // Initialize flow to starting state once SVG nodes exist
  function initFlowWhenReady() {
    var testNode = document.getElementById('zone__default__dataset__PATIENTCOHORT_46_patient__demographics__sf');
    if (testNode) {
      revealFlowStep('initial');
      console.log('[ChatPanel] Flow initialized');
      return;
    }
    // SVG not ready yet, watch for it
    var observer = new MutationObserver(function(mutations, obs) {
      var node = document.getElementById('zone__default__dataset__PATIENTCOHORT_46_patient__demographics__sf');
      if (node) {
        obs.disconnect();
        revealFlowStep('initial');
        console.log('[ChatPanel] Flow initialized (deferred)');
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    // Fallback timeout
    setTimeout(function() { observer.disconnect(); revealFlowStep('initial'); }, 5000);
  }
  initFlowWhenReady();

  console.log('[ChatPanel] Chat panel injected (fixed overlay)');
  console.log('  Ctrl+Shift+N — advance conversation');
  console.log('  Ctrl+Shift+R — reset');
  console.log('  Ctrl+Shift+T — toggle flow visibility');

})();
