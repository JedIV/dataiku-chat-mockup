/**
 * Flow Assistant Fake Chat Script
 *
 * Enables interactive fake conversations in the Dataiku Flow Assistant.
 *
 * HOTKEYS:
 *   Ctrl+Shift+N - Advance to next scripted message
 *   Ctrl+Shift+T - Toggle between fake/real mode
 *   Ctrl+Shift+R - Reset conversation
 *
 * In FAKE mode: User submissions show scripted AI responses
 * In REAL mode: Normal Flow Assistant behavior
 *
 * Usage:
 *   1. Paste flow-assistant-config.js first (optional, for custom conversations)
 *   2. Paste this script into browser console on a Dataiku Flow page
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  // Use existing config if loaded, otherwise use defaults
  var config = window.fakeChatConfig || {
    conversation: [
      { role: 'user', text: 'Hello, can you help me analyze this data?' },
      { role: 'assistant', content: { intro: 'Of course! I can help you build a flow to analyze your data. What would you like to do?' } }
    ],
    typingSpeed: 30,
    aiResponseDelay: 800
  };
  window.fakeChatConfig = config;

  // ============================================
  // CONSTANTS
  // ============================================
  var COLORS = {
    taskBg: '#f8f9fa',
    taskBorder: '#e5e7eb',
    accent: '#00a89c',
    dataset: '#28a9dd',
    text: '#555',
    label: '#888',
    footer: '#444',
    userBg: 'rgb(242,242,242)',
    typingDot: '#666'
  };

  var CSS = [
    '@keyframes typingBounce{0%,80%,100%{transform:scale(0.8);opacity:0.4}40%{transform:scale(1);opacity:1}}',
    '.fake-message{animation:fadeInUp 0.3s ease-out}',
    '@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}'
  ].join('');

  // ============================================
  // STATE
  // ============================================
  window.fakeChatState = {
    fakeMode: true,
    conversationIndex: 0,
    isTyping: false
  };

  // ============================================
  // HELPERS
  // ============================================
  window.fakeChat = window.fakeChat || {};

  function sleep(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
  }

  function getScrollableSection() {
    return document.querySelector('.flow-assistant-scrollable-section');
  }

  function getChatContainer() {
    var container = document.querySelector('.flow-assistant-chat-container');
    var scrollable = getScrollableSection();

    if (!container && scrollable) {
      var emptyState = scrollable.querySelector('flow-assistant-empty-state');
      if (emptyState) emptyState.style.display = 'none';

      container = document.createElement('div');
      container.className = 'flow-assistant-chat-container';
      scrollable.insertBefore(container, scrollable.firstChild);
    }
    return container;
  }

  function scrollToBottom() {
    var scrollable = getScrollableSection();
    if (scrollable) scrollable.scrollTop = scrollable.scrollHeight;
  }

  // ============================================
  // MESSAGE BUILDERS
  // ============================================
  function buildTaskCard(task) {
    var html = '<div style="background:' + COLORS.taskBg + ';border-radius:8px;padding:12px;margin-bottom:12px;border:1px solid ' + COLORS.taskBorder + ';">';

    // Title
    html += '<div style="font-weight:600;color:' + COLORS.accent + ';margin-bottom:8px;font-size:13px;">' + task.title + '</div>';

    // Inputs
    if (task.inputs && task.inputs.length) {
      html += '<div style="font-size:13px;color:' + COLORS.text + ';margin-bottom:4px;">';
      html += '<span style="color:' + COLORS.label + ';">Input:</span> ';
      html += task.inputs.map(function(inp) {
        return '<span style="color:' + COLORS.dataset + ';">' + inp + '</span>';
      }).join(', ');
      html += '</div>';
    }

    // Outputs
    if (task.outputs && task.outputs.length) {
      html += '<div style="font-size:13px;color:' + COLORS.text + ';margin-bottom:4px;">';
      html += '<span style="color:' + COLORS.label + ';">Output:</span> ';
      html += task.outputs.map(function(out) {
        return '<span style="color:' + COLORS.dataset + ';">' + out + '</span>';
      }).join(', ');
      html += '</div>';
    }

    // Description
    if (task.description) {
      html += '<div style="font-size:13px;color:' + COLORS.text + ';line-height:1.5;">' + task.description + '</div>';
    }

    html += '</div>';
    return html;
  }

  function buildBarChart(chart) {
    var barColor = chart.color || '#5B8BD4';
    var chartHeight = 130;
    var data = chart.data || [];
    var maxValue = Math.max.apply(null, data.map(function(d) { return d.value; }));
    var niceMax = Math.ceil(maxValue / 10) * 10;

    var html = '<div style="background:' + COLORS.taskBg + ';border-radius:8px;padding:14px;margin-bottom:12px;border:1px solid ' + COLORS.taskBorder + ';">';

    // Title - scientific style
    if (chart.title) {
      html += '<div style="font-weight:600;color:#333;margin-bottom:10px;font-size:12px;font-family:Helvetica Neue,Arial,sans-serif;">' + chart.title + '</div>';
    }

    // Chart container with Y-axis
    html += '<div style="display:flex;font-family:Courier New,monospace;">';

    // Y-axis labels
    html += '<div style="display:flex;flex-direction:column;justify-content:space-between;height:' + chartHeight + 'px;margin-right:8px;font-size:9px;color:#666;">';
    html += '<span>' + niceMax + '</span>';
    html += '<span>' + Math.round(niceMax * 0.75) + '</span>';
    html += '<span>' + Math.round(niceMax * 0.5) + '</span>';
    html += '<span>' + Math.round(niceMax * 0.25) + '</span>';
    html += '<span>0</span>';
    html += '</div>';

    // Plot area
    html += '<div style="flex:1;display:flex;flex-direction:column;">';

    // Grid background (ggplot style)
    html += '<div style="position:relative;height:' + chartHeight + 'px;background:#EBEBEB;border:1px solid #bbb;">';

    // Horizontal grid lines
    for (var g = 1; g < 4; g++) {
      html += '<div style="position:absolute;left:0;right:0;top:' + (g * 25) + '%;border-top:1px solid #fff;"></div>';
    }

    // Bars container
    html += '<div style="position:absolute;bottom:0;left:0;right:0;top:0;display:flex;align-items:flex-end;justify-content:space-evenly;padding:0 4px;">';
    data.forEach(function(item) {
      var pct = (item.value / niceMax) * 100;
      var color = item.color || barColor;
      html += '<div style="flex:1;max-width:32px;height:' + pct + '%;background:' + color + ';margin:0 2px;border:1px solid rgba(0,0,0,0.15);box-sizing:border-box;"></div>';
    });
    html += '</div>';
    html += '</div>';

    // X-axis labels
    html += '<div style="display:flex;justify-content:space-evenly;padding-top:4px;border-top:1px solid #666;font-size:9px;color:#333;">';
    data.forEach(function(item) {
      html += '<span style="flex:1;max-width:32px;text-align:center;margin:0 2px;">' + item.label + '</span>';
    });
    html += '</div>';

    html += '</div>'; // plot area
    html += '</div>'; // chart container

    // Unit annotation
    if (chart.unit) {
      html += '<div style="font-size:9px;color:#888;margin-top:4px;font-family:Courier New,monospace;text-align:right;">n = ' + chart.unit + '</div>';
    }

    html += '</div>';
    return html;
  }

  function buildPlanSection(content) {
    if (!content.tasks || !content.tasks.length) return '';

    var html = content.tasks.map(buildTaskCard).join('');

    if (content.footer) {
      html += '<div style="margin-top:8px;font-size:13px;color:' + COLORS.footer + ';">' + content.footer + '</div>';
    }
    return html;
  }

  function createUserMessage(text) {
    var container = document.createElement('div');
    container.className = 'flow-assistant-message-container fake-message';
    container.style.cssText = 'display:flex;flex-direction:column;margin-bottom:16px;';

    var message = document.createElement('div');
    message.className = 'flow-assistant-chat-message__user';
    message.style.cssText = 'background-color:' + COLORS.userBg + ';color:#000;font-size:13px;padding:8px;display:flex;font-family:SourceSansPro,sans-serif;line-height:1.4;max-width:80%;align-self:flex-end;border-radius:4px;';
    message.textContent = text;

    container.appendChild(message);
    return container;
  }

  function createAssistantMessage(content) {
    var fragment = document.createDocumentFragment();

    // Intro text
    if (content.intro) {
      var introContainer = document.createElement('div');
      introContainer.className = 'flow-assistant-message-container fake-message';
      var introMessage = document.createElement('div');
      introMessage.className = 'flow-assistant-chat-message__assistant';
      introMessage.innerHTML = content.intro;
      introContainer.appendChild(introMessage);
      fragment.appendChild(introContainer);
    }

    // Plan with task cards
    if (content.tasks && content.tasks.length) {
      var planContainer = document.createElement('div');
      planContainer.className = 'flow-assistant-message-container fake-message';
      var planMessage = document.createElement('div');
      planMessage.className = 'flow-assistant-chat-message__assistant';
      planMessage.innerHTML = buildPlanSection(content);
      planContainer.appendChild(planMessage);
      fragment.appendChild(planContainer);
    }

    // Bar chart
    if (content.chart) {
      var chartContainer = document.createElement('div');
      chartContainer.className = 'flow-assistant-message-container fake-message';
      var chartMessage = document.createElement('div');
      chartMessage.className = 'flow-assistant-chat-message__assistant';
      chartMessage.innerHTML = buildBarChart(content.chart);
      chartContainer.appendChild(chartMessage);
      fragment.appendChild(chartContainer);
    }

    return fragment;
  }

  function createTypingIndicator() {
    var container = document.createElement('div');
    container.className = 'flow-assistant-message-container fake-typing-indicator';

    var inner = document.createElement('div');
    inner.className = 'flow-assistant-chat-message__assistant';
    inner.style.cssText = 'display:flex;gap:4px;padding:12px 16px;';

    for (var i = 0; i < 3; i++) {
      var dot = document.createElement('span');
      dot.style.cssText = 'width:8px;height:8px;background:' + COLORS.typingDot + ';border-radius:50%;animation:typingBounce 1.4s infinite ' + (i * 0.2) + 's;';
      inner.appendChild(dot);
    }

    container.appendChild(inner);
    return container;
  }

  // ============================================
  // ACTION HANDLERS
  // ============================================
  function executeAction(action) {
    if (!action || !action.type) return;

    try {
      var injector = window.angular && angular.element(document.body).injector();
      if (!injector) {
        console.log('[FakeChat] Angular not available for action');
        return;
      }

      var $state = injector.get('$state');
      var projectKey = $state.params.projectKey || 'PATIENTCOHORT';

      switch (action.type) {
        case 'openDataset':
          if (action.dataset) {
            $state.go('projects.project.datasets.dataset.explore', {
              projectKey: projectKey,
              datasetName: action.dataset
            });
            console.log('[FakeChat] Opened dataset: ' + action.dataset);
          }
          break;

        case 'openStatistics':
          if (action.dataset) {
            $state.go('projects.project.datasets.dataset.statistics', {
              projectKey: projectKey,
              datasetName: action.dataset
            });
            console.log('[FakeChat] Opened statistics: ' + action.dataset);
          }
          break;

        case 'goToFlow':
          $state.go('projects.project.flow', {
            projectKey: projectKey,
            zoneId: action.zoneId || 'default'
          });
          console.log('[FakeChat] Returned to flow');
          break;

        default:
          console.log('[FakeChat] Unknown action type: ' + action.type);
      }
    } catch (e) {
      console.log('[FakeChat] Action error:', e);
    }
  }

  // ============================================
  // CORE FUNCTIONS
  // ============================================
  fakeChat.advance = async function() {
    var state = window.fakeChatState;
    var config = window.fakeChatConfig;

    if (state.isTyping || state.conversationIndex >= config.conversation.length) {
      console.log('[FakeChat] End of conversation or currently typing');
      return;
    }

    var current = config.conversation[state.conversationIndex];
    var chatContainer = getChatContainer();
    if (!chatContainer) return;

    if (current.role === 'user') {
      // Type into editor with animation
      var cmContent = document.querySelector('.cm-content');
      if (cmContent) {
        state.isTyping = true;
        cmContent.textContent = '';
        cmContent.focus();

        for (var i = 0; i < current.text.length; i++) {
          cmContent.textContent += current.text[i];
          cmContent.dispatchEvent(new InputEvent('input', { bubbles: true }));
          await sleep(config.typingSpeed);
        }

        state.isTyping = false;
        cmContent.textContent = '';
      }

      chatContainer.appendChild(createUserMessage(current.text));
    } else {
      // Show typing indicator, then response
      var typing = createTypingIndicator();
      chatContainer.appendChild(typing);
      scrollToBottom();

      await sleep(config.aiResponseDelay);

      typing.remove();
      var content = current.content || {};
      chatContainer.appendChild(createAssistantMessage(content));

      // Execute any associated action
      if (content.action) {
        await sleep(500); // Brief pause before action
        executeAction(content.action);
      }
    }

    scrollToBottom();
    state.conversationIndex++;
    console.log('[FakeChat] Advanced to ' + state.conversationIndex + '/' + config.conversation.length);
  };

  fakeChat.reset = function() {
    window.fakeChatState.conversationIndex = 0;
    document.querySelectorAll('.fake-message, .fake-typing-indicator').forEach(function(el) {
      el.remove();
    });
    console.log('[FakeChat] Conversation reset');
  };

  // ============================================
  // UI SETUP
  // ============================================
  function setupModeIndicator() {
    var indicator = document.getElementById('fake-chat-indicator');
    if (indicator) return;

    indicator = document.createElement('div');
    indicator.id = 'fake-chat-indicator';
    indicator.style.cssText = 'position:fixed;top:60px;right:20px;padding:6px 12px;border-radius:4px;font-size:11px;font-weight:600;font-family:-apple-system,sans-serif;z-index:10000;cursor:pointer;background:#ff6b6b;color:#fff;';
    indicator.textContent = 'FAKE MODE';
    indicator.onclick = function() {
      var state = window.fakeChatState;
      state.fakeMode = !state.fakeMode;
      indicator.textContent = state.fakeMode ? 'FAKE MODE' : 'REAL MODE';
      indicator.style.background = state.fakeMode ? '#ff6b6b' : '#51cf66';
    };
    document.body.appendChild(indicator);
  }

  function setupStyles() {
    if (document.getElementById('fake-chat-styles')) return;

    var style = document.createElement('style');
    style.id = 'fake-chat-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function setupHotkeys() {
    if (window.fakeChatHotkeysAdded) return;

    document.addEventListener('keydown', function(e) {
      if (!e.ctrlKey || !e.shiftKey) return;

      var key = e.key.toLowerCase();
      if (key === 'n') {
        e.preventDefault();
        fakeChat.advance();
      } else if (key === 't') {
        e.preventDefault();
        document.getElementById('fake-chat-indicator').click();
      } else if (key === 'r') {
        e.preventDefault();
        fakeChat.reset();
      }
    });

    window.fakeChatHotkeysAdded = true;
  }

  function setupNewTaskHook() {
    function hookButton() {
      var btn = document.querySelector('button[aria-label="Start new task"]');
      if (btn && !btn._fakeHooked) {
        btn.addEventListener('click', function() {
          setTimeout(function() {
            fakeChat.reset();
            console.log('[FakeChat] Cleared on New Task');
          }, 100);
        });
        btn._fakeHooked = true;
      }
    }

    hookButton();

    var observer = new MutationObserver(hookButton);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function setupLayoutFixes() {
    // Add top padding to Flow Assistant header area
    var tabContent = document.querySelector('.object-summary-tab-content');
    if (tabContent) {
      tabContent.style.paddingTop = '8px';
    }
  }

  function setupTitle() {
    // Change "Flow Assistant" title to custom title
    var customTitle = config.panelTitle || 'Patient Cohort Analysis';

    function updateTitle() {
      var titleEl = document.querySelector('.flow-assistant-title span');
      if (titleEl && titleEl.textContent.trim() === 'Flow Assistant') {
        titleEl.textContent = customTitle;
        console.log('[FakeChat] Title updated to: ' + customTitle);
        return true;
      }
      return false;
    }

    // Try immediately
    updateTitle();

    // Keep watching for panel recreation (after navigation)
    var observer = new MutationObserver(function() {
      updateTitle();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ============================================
  // INITIALIZE
  // ============================================
  setupModeIndicator();
  setupStyles();
  setupHotkeys();
  setupNewTaskHook();
  setupLayoutFixes();
  setupTitle();

  console.log('[FakeChat] Ready! (' + config.conversation.length + ' messages loaded)');
  console.log('  Ctrl+Shift+N - Advance to next message');
  console.log('  Ctrl+Shift+T - Toggle fake/real mode');
  console.log('  Ctrl+Shift+R - Reset conversation');

})();
