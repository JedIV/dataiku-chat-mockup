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
      chatContainer.appendChild(createAssistantMessage(current.content || {}));
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

  // ============================================
  // INITIALIZE
  // ============================================
  setupModeIndicator();
  setupStyles();
  setupHotkeys();
  setupNewTaskHook();
  setupLayoutFixes();

  console.log('[FakeChat] Ready! (' + config.conversation.length + ' messages loaded)');
  console.log('  Ctrl+Shift+N - Advance to next message');
  console.log('  Ctrl+Shift+T - Toggle fake/real mode');
  console.log('  Ctrl+Shift+R - Reset conversation');

})();
