/**
 * Home Page Fake Chat Script
 *
 * Enables interactive fake conversations on the Dataiku Home/Task Hub page.
 *
 * HOTKEYS:
 *   Ctrl+Shift+N - Advance to next scripted message
 *   Ctrl+Shift+T - Toggle between fake/real mode
 *   Ctrl+Shift+R - Reset conversation
 *
 * In FAKE mode: User submissions show scripted AI responses
 * In REAL mode: Normal behavior
 *
 * Usage:
 *   1. Paste home-page-config.js first (optional, for custom conversations)
 *   2. Paste this script into browser console on the Home/Task Hub page
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  var config = window.homePageChatConfig || {
    conversation: [
      { role: 'user', text: 'I need to find patient data for a clinical trial analysis' },
      { role: 'assistant', content: {
        text: 'I found several relevant datasets in your data catalog. The <strong>patient_demographics</strong> dataset contains 10,861 patient records with demographics, diagnosis codes, and treatment history. Would you like me to help you build an analysis pipeline?'
      }}
    ],
    typingSpeed: 30,
    aiResponseDelay: 800
  };
  window.homePageChatConfig = config;

  // ============================================
  // CONSTANTS
  // ============================================
  var CSS = [
    '@keyframes typingBounce{0%,80%,100%{transform:scale(0.8);opacity:0.4}40%{transform:scale(1);opacity:1}}',
    '.fake-message{animation:fadeInUp 0.3s ease-out}',
    '@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}'
  ].join('');

  // ============================================
  // STATE
  // ============================================
  window.homePageChatState = window.homePageChatState || {
    fakeMode: true,
    conversationIndex: 0,
    isTyping: false
  };
  var state = window.homePageChatState;

  // ============================================
  // HELPERS
  // ============================================
  window.homeChat = window.homeChat || {};

  function sleep(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
  }

  function getOrCreateMessagesContainer() {
    var container = document.querySelector('.messages-container');
    if (container) return container;

    // Create the chat output structure if it doesn't exist
    var chatInput = document.querySelector('.data-catalog-semantic-search__chat-input');
    if (!chatInput) return null;

    // Create wrapper and container
    var wrapper = document.createElement('div');
    wrapper.className = 'messages-container-wrapper fake-chat-wrapper';
    wrapper.style.cssText = 'max-height: 400px; overflow-y: auto; padding: 16px 0;';

    container = document.createElement('div');
    container.className = 'messages-container';
    wrapper.appendChild(container);

    // Insert before the chat input
    chatInput.parentElement.insertBefore(wrapper, chatInput);

    return container;
  }

  function scrollToBottom() {
    var wrapper = document.querySelector('.messages-container-wrapper');
    if (wrapper) {
      wrapper.scrollTop = wrapper.scrollHeight;
    }
  }

  // ============================================
  // MESSAGE BUILDERS (custom styled bubbles)
  // ============================================
  function createUserMessage(text) {
    var group = document.createElement('div');
    group.className = 'message-group fake-message';
    group.style.cssText = 'display: flex; justify-content: flex-end; margin-bottom: 12px;';

    var message = document.createElement('div');
    message.style.cssText = 'background: #e8f4f3; color: #1a1a1a; padding: 12px 16px; border-radius: 16px 16px 4px 16px; max-width: 70%; font-size: 14px; line-height: 1.5; box-shadow: 0 1px 2px rgba(0,0,0,0.05);';
    message.textContent = text;

    group.appendChild(message);
    return group;
  }

  function createAssistantMessage(content) {
    var group = document.createElement('div');
    group.className = 'message-group fake-message';
    group.style.cssText = 'display: flex; justify-content: flex-start; margin-bottom: 12px;';

    var message = document.createElement('div');
    message.style.cssText = 'background: #ffffff; color: #333; padding: 12px 16px; border-radius: 16px 16px 16px 4px; max-width: 70%; font-size: 14px; line-height: 1.5; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.08);';

    // Parse markdown-like formatting (bold)
    var text = content.text || '';
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    message.innerHTML = text;

    group.appendChild(message);
    return group;
  }

  function createTypingIndicator() {
    var group = document.createElement('div');
    group.className = 'message-group fake-typing-indicator';
    group.style.cssText = 'display: flex; justify-content: flex-start; margin-bottom: 12px;';

    var message = document.createElement('div');
    message.style.cssText = 'background: #ffffff; padding: 12px 16px; border-radius: 16px 16px 16px 4px; border: 1px solid #e5e7eb; display: flex; gap: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);';

    for (var i = 0; i < 3; i++) {
      var dot = document.createElement('span');
      dot.style.cssText = 'width: 8px; height: 8px; background: #999; border-radius: 50%; animation: typingBounce 1.4s infinite ' + (i * 0.2) + 's;';
      message.appendChild(dot);
    }

    group.appendChild(message);
    return group;
  }

  // ============================================
  // CONTENT MANAGEMENT
  // ============================================
  function hideRealContent() {
    // Hide all non-fake message groups
    document.querySelectorAll('.message-group:not(.fake-message):not(.fake-typing-indicator)').forEach(function(group) {
      group.style.display = 'none';
      group.setAttribute('data-hidden-by-fake', 'true');
    });

    // Hide feature cards when chatting
    var cards = document.querySelector('.lovable-cards-container');
    if (cards) {
      cards.style.display = 'none';
      cards.setAttribute('data-hidden-by-fake', 'true');
    }

    // Hide welcome heading and subtitle
    var heading = document.evaluate(
      "//*[contains(text(),'Welcome to Dataiku')]",
      document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    ).singleNodeValue;
    if (heading) {
      var parent = heading.parentElement;
      if (parent) {
        parent.style.display = 'none';
        parent.setAttribute('data-hidden-by-fake', 'true');
      }
    }

    // Also hide the custom subtitle
    var subtitle = document.querySelector('.custom-subtitle');
    if (subtitle) {
      subtitle.style.display = 'none';
      subtitle.setAttribute('data-hidden-by-fake', 'true');
    }
  }

  function showRealContent() {
    // Show all hidden content
    document.querySelectorAll('[data-hidden-by-fake="true"]').forEach(function(el) {
      el.style.display = '';
      el.removeAttribute('data-hidden-by-fake');
    });

    // Show feature cards
    var cards = document.querySelector('.lovable-cards-container');
    if (cards) cards.style.display = 'flex';
  }

  function clearFakeMessages() {
    document.querySelectorAll('.fake-message, .fake-typing-indicator').forEach(function(el) {
      el.remove();
    });
  }

  // ============================================
  // CORE FUNCTIONS
  // ============================================
  homeChat.advance = async function() {
    if (state.isTyping || state.conversationIndex >= config.conversation.length) {
      console.log('[HomeChat] End of conversation or currently typing');
      return;
    }

    var current = config.conversation[state.conversationIndex];
    var container = getOrCreateMessagesContainer();
    if (!container) {
      console.log('[HomeChat] Could not create messages container');
      return;
    }

    // Hide real content and cards on first advance
    if (state.conversationIndex === 0) {
      hideRealContent();
    }

    if (current.role === 'user') {
      // Type into search box with animation
      var textarea = document.querySelector('.chat-input__textarea') || document.querySelector('textarea');
      if (textarea) {
        state.isTyping = true;
        textarea.value = '';
        textarea.focus();

        for (var i = 0; i < current.text.length; i++) {
          textarea.value += current.text[i];
          textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
          await sleep(config.typingSpeed);
        }

        state.isTyping = false;
        textarea.value = '';
      }

      var userMsg = createUserMessage(current.text);
      container.appendChild(userMsg);
    } else {
      // Show typing indicator, then response
      var typing = createTypingIndicator();
      container.appendChild(typing);
      scrollToBottom();

      await sleep(config.aiResponseDelay);

      typing.remove();
      var content = current.content || {};
      var assistantMsg = createAssistantMessage(content);
      container.appendChild(assistantMsg);
    }

    scrollToBottom();
    state.conversationIndex++;
    console.log('[HomeChat] Advanced to ' + state.conversationIndex + '/' + config.conversation.length);
  };

  homeChat.reset = function() {
    state.conversationIndex = 0;
    clearFakeMessages();
    showRealContent();

    // Clear the search input
    var textarea = document.querySelector('.chat-input__textarea') || document.querySelector('textarea');
    if (textarea) textarea.value = '';

    // Remove created wrapper if empty
    var wrapper = document.querySelector('.fake-chat-wrapper');
    if (wrapper) {
      var container = wrapper.querySelector('.messages-container');
      if (container && container.children.length === 0) {
        wrapper.remove();
      }
    }

    console.log('[HomeChat] Conversation reset');
  };

  homeChat.clearPage = function() {
    // Clear all message content (both real and fake)
    var container = document.querySelector('.messages-container');
    if (container) {
      container.innerHTML = '';
    }
    state.conversationIndex = 0;
    showRealContent();
    console.log('[HomeChat] Page cleared');
  };

  // ============================================
  // UI SETUP
  // ============================================
  function setupModeIndicator() {
    var indicator = document.getElementById('home-chat-indicator');
    if (indicator) return;

    indicator = document.createElement('div');
    indicator.id = 'home-chat-indicator';
    indicator.style.cssText = 'position:fixed;top:60px;right:20px;padding:6px 12px;border-radius:4px;font-size:11px;font-weight:600;font-family:-apple-system,sans-serif;z-index:10000;cursor:pointer;background:#ff6b6b;color:#fff;';
    indicator.textContent = 'FAKE MODE';
    indicator.onclick = function() {
      state.fakeMode = !state.fakeMode;
      indicator.textContent = state.fakeMode ? 'FAKE MODE' : 'REAL MODE';
      indicator.style.background = state.fakeMode ? '#ff6b6b' : '#51cf66';

      if (!state.fakeMode) {
        // Switching to real mode - show real content, hide fake
        showRealContent();
        clearFakeMessages();
      }
    };
    document.body.appendChild(indicator);
  }

  function setupStyles() {
    if (document.getElementById('home-chat-styles')) return;

    var style = document.createElement('style');
    style.id = 'home-chat-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function setupHotkeys() {
    if (window.homeChatHotkeysAdded) return;

    document.addEventListener('keydown', function(e) {
      if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;

      var key = e.key.toLowerCase();
      if (key === 'n') {
        e.preventDefault();
        homeChat.advance();
      } else if (key === 't') {
        e.preventDefault();
        document.getElementById('home-chat-indicator').click();
      } else if (key === 'r') {
        e.preventDefault();
        homeChat.reset();
      }
    });

    window.homeChatHotkeysAdded = true;
  }

  function setupFormIntercept() {
    var form = document.querySelector('.chat-input__container') || document.querySelector('form');
    if (!form || form._homeHooked) return;

    form.addEventListener('submit', function(e) {
      if (state.fakeMode) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[HomeChat] Form submission intercepted (fake mode)');
      }
    }, true);

    // Also intercept Enter key in textarea
    var textarea = document.querySelector('.chat-input__textarea') || document.querySelector('textarea');
    if (textarea && !textarea._homeHooked) {
      textarea.addEventListener('keydown', function(e) {
        if (state.fakeMode && e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          console.log('[HomeChat] Enter key intercepted (fake mode)');
        }
      }, true);
      textarea._homeHooked = true;
    }

    form._homeHooked = true;
  }

  // ============================================
  // INITIALIZE
  // ============================================
  setupModeIndicator();
  setupStyles();
  setupHotkeys();
  setupFormIntercept();

  console.log('[HomeChat] Ready! (' + config.conversation.length + ' messages loaded)');
  console.log('  Ctrl+Shift+N - Advance to next message');
  console.log('  Ctrl+Shift+T - Toggle fake/real mode');
  console.log('  Ctrl+Shift+R - Reset conversation');
  console.log('  homeChat.clearPage() - Clear all messages');

})();
