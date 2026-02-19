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
        text: 'I found several relevant datasets in your data catalog. The <strong>patient_demographics</strong> dataset contains 12,400 patient records with demographics, diagnosis codes, and treatment history. Would you like me to help you build an analysis pipeline?'
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
    '@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes fadeIn{from{opacity:0}to{opacity:1}}',
    '.fake-thinking-line{animation:fadeIn 0.25s ease-out}',
    '.fake-workstream-card{animation:fadeInUp 0.4s ease-out}'
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
    message.style.cssText = 'background: #F8F4E4; color: #1A1A1A; padding: 12px 16px; border-radius: 16px 16px 4px 16px; max-width: 70%; font-size: 14px; line-height: 1.5; box-shadow: 0 1px 2px rgba(0,0,0,0.05);';
    message.textContent = text;

    group.appendChild(message);
    return group;
  }

  function createAssistantMessage(content) {
    var group = document.createElement('div');
    group.className = 'message-group fake-message';
    group.style.cssText = 'display: flex; justify-content: flex-start; margin-bottom: 12px;';

    var message = document.createElement('div');
    message.style.cssText = 'background: #FEFEF9; color: #1A1A1A; padding: 12px 16px; border-radius: 16px 16px 16px 4px; max-width: 85%; font-size: 14px; line-height: 1.5; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.08);';

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
  // THINKING BLOCK + WORKSTREAM CARD BUILDERS
  // ============================================
  function createThinkingBlock(lines) {
    var block = document.createElement('div');
    block.className = 'fake-thinking-block';
    block.style.cssText = 'background: #F8F4E4; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px;';

    // Header row
    var header = document.createElement('div');
    header.style.cssText = 'display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none;';

    var chevron = document.createElement('span');
    chevron.className = 'fake-thinking-chevron';
    chevron.style.cssText = 'font-family: "DM Mono", monospace; font-size: 12px; color: #42485B; transition: transform 0.2s;';
    chevron.textContent = '\u25BE';

    var label = document.createElement('span');
    label.className = 'fake-thinking-label';
    label.style.cssText = 'font-family: "DM Mono", monospace; font-size: 12px; color: #42485B; font-weight: 400;';
    label.textContent = '\u2726 Thinking...';

    header.appendChild(chevron);
    header.appendChild(label);

    // Body with reasoning lines
    var body = document.createElement('div');
    body.className = 'fake-thinking-body';
    body.style.cssText = 'margin-top: 8px; padding-left: 4px;';

    // Toggle behavior
    header.addEventListener('click', function() {
      var isVisible = body.style.display !== 'none';
      body.style.display = isVisible ? 'none' : 'block';
      chevron.textContent = isVisible ? '\u25B8' : '\u25BE';
    });

    block.appendChild(header);
    block.appendChild(body);

    return { block: block, body: body, header: header, chevron: chevron, label: label };
  }

  function createThinkingLine(text) {
    var line = document.createElement('div');
    line.className = 'fake-thinking-line';
    line.style.cssText = 'font-family: "DM Mono", monospace; font-size: 12px; color: #42485B; opacity: 0.8; padding: 2px 0; line-height: 1.5;';
    line.textContent = '\u2013 ' + text;
    return line;
  }

  function createWorkstreamCard(card) {
    var cardEl = document.createElement('div');
    cardEl.className = 'fake-workstream-card';
    cardEl.style.cssText = 'background: #F8F4E4; border-radius: 12px; border: 1px solid #e5e7eb; padding: 14px 16px; display: flex; gap: 12px; align-items: flex-start;';

    var icon = document.createElement('div');
    icon.style.cssText = 'font-size: 20px; line-height: 1; flex-shrink: 0; margin-top: 1px;';
    icon.textContent = card.icon;

    var textWrap = document.createElement('div');
    textWrap.style.cssText = 'flex: 1; min-width: 0;';

    var title = document.createElement('div');
    title.style.cssText = 'font-weight: 600; font-size: 14px; color: #06312E; line-height: 1.3; margin-bottom: 4px;';
    title.textContent = card.title;

    var desc = document.createElement('div');
    desc.style.cssText = 'font-size: 13px; color: #42485B; line-height: 1.4;';
    desc.textContent = card.description;

    textWrap.appendChild(title);
    textWrap.appendChild(desc);
    cardEl.appendChild(icon);
    cardEl.appendChild(textWrap);

    return cardEl;
  }

  // ============================================
  // ANIMATED ASSISTANT SEQUENCE (thinking + cards)
  // ============================================
  async function advanceThinkingAndCards(container, content) {
    // 1. Show typing indicator (800ms)
    var typing = createTypingIndicator();
    container.appendChild(typing);
    scrollToBottom();
    await sleep(config.aiResponseDelay);

    // 2. Remove typing, create assistant bubble wrapper
    typing.remove();

    var group = document.createElement('div');
    group.className = 'message-group fake-message';
    group.style.cssText = 'display: flex; justify-content: flex-start; margin-bottom: 12px;';

    var message = document.createElement('div');
    message.style.cssText = 'background: #FEFEF9; color: #1A1A1A; padding: 12px 16px; border-radius: 16px 16px 16px 4px; max-width: 85%; font-size: 14px; line-height: 1.5; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.08);';

    group.appendChild(message);
    container.appendChild(group);

    // 3. Show thinking block with header
    var thinking = createThinkingBlock(content.thinking);
    message.appendChild(thinking.block);
    scrollToBottom();

    // 4. Stream in reasoning lines one at a time (250ms each)
    for (var i = 0; i < content.thinking.length; i++) {
      var line = createThinkingLine(content.thinking[i]);
      thinking.body.appendChild(line);
      scrollToBottom();
      await sleep(250);
    }

    // 5. Pause 1000ms
    await sleep(1000);

    // 6. Auto-collapse: hide body, update header
    thinking.body.style.display = 'none';
    thinking.chevron.textContent = '\u25B8';
    thinking.label.textContent = '\u2726 Thought for 3s';
    scrollToBottom();

    // 7. Cards fade in one at a time (400ms stagger)
    if (content.cards && content.cards.length > 0) {
      var cardsContainer = document.createElement('div');
      cardsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;';
      message.appendChild(cardsContainer);

      for (var j = 0; j < content.cards.length; j++) {
        var card = createWorkstreamCard(content.cards[j]);
        cardsContainer.appendChild(card);
        scrollToBottom();
        await sleep(400);
      }
    }

    // 8. Footer text appears
    if (content.text) {
      var footer = document.createElement('div');
      footer.style.cssText = 'margin-top: 4px; font-size: 14px; line-height: 1.5;';
      footer.innerHTML = content.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      message.appendChild(footer);
      scrollToBottom();
    }
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
      "//*[contains(text(),'What are we building today')]",
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
      var content = current.content || {};

      // Check if this is a thinking+cards message
      if (content.thinking || content.cards) {
        state.isTyping = true;
        await advanceThinkingAndCards(container, content);
        state.isTyping = false;
      } else {
        // Simple assistant message
        var typing = createTypingIndicator();
        container.appendChild(typing);
        scrollToBottom();

        await sleep(config.aiResponseDelay);

        typing.remove();
        var assistantMsg = createAssistantMessage(content);
        container.appendChild(assistantMsg);
      }
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
        state.fakeMode = !state.fakeMode;
        console.log('[HomeChat] Mode: ' + (state.fakeMode ? 'FAKE' : 'REAL'));
        if (!state.fakeMode) {
          showRealContent();
          clearFakeMessages();
        }
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
  setupStyles();
  setupHotkeys();
  setupFormIntercept();

  console.log('[HomeChat] Ready! (' + config.conversation.length + ' messages loaded)');
  console.log('  Ctrl+Shift+N - Advance to next message');
  console.log('  Ctrl+Shift+T - Toggle fake/real mode');
  console.log('  Ctrl+Shift+R - Reset conversation');
  console.log('  homeChat.clearPage() - Clear all messages');

})();
