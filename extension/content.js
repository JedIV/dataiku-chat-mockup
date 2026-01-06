/**
 * Dataiku Chat Mockup - Injection Script
 * Injects a mock AI chat assistant into Dataiku's right panel
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION - Edit these to customize
  // ============================================
  const CONFIG = {
    title: 'Data Assistant',
    placeholder: 'Ask about your data...',
    iconText: 'AI',
    
    // Sample conversation to display
    messages: [
      { 
        role: 'assistant', 
        text: 'Hi! I can help you explore this flow. What would you like to know?' 
      },
      { 
        role: 'user', 
        text: 'What does the Visual Agent do?' 
      },
      { 
        role: 'assistant', 
        text: 'The Visual Agent processes your input_dataset and produces output_dataset. It appears to be running a transformation recipe.' 
      }
    ],

    // Styling
    accentColor: '#D97757',      // Anthropic orange
    accentGradient: 'linear-gradient(135deg, #D97757, #E89B7B)',
    userBubbleColor: '#0078D4',  // Dataiku blue
    chatHeight: '320px'
  };

  // ============================================
  // STYLES
  // ============================================
  const styles = `
    .dku-chat-section {
      margin: 8px;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      height: ${CONFIG.chatHeight};
      font-family: "Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
    }

    .dku-chat-header {
      padding: 10px 12px;
      font-weight: 600;
      font-size: 13px;
      color: #333;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fafafa;
    }

    .dku-chat-icon {
      width: 24px;
      height: 24px;
      background: ${CONFIG.accentGradient};
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: bold;
      letter-spacing: -0.5px;
    }

    .dku-chat-messages {
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #fafafa;
    }

    .dku-chat-bubble {
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      line-height: 1.4;
      max-width: 90%;
      animation: dku-chat-fade-in 0.3s ease-out;
    }

    @keyframes dku-chat-fade-in {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dku-chat-bubble.assistant {
      background: #fff;
      border: 1px solid #e0e0e0;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .dku-chat-bubble.user {
      background: ${CONFIG.userBubbleColor};
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .dku-chat-input-area {
      padding: 10px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 8px;
      background: #fff;
    }

    .dku-chat-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 12px;
      outline: none;
      font-family: inherit;
    }

    .dku-chat-input:focus {
      border-color: ${CONFIG.userBubbleColor};
      box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.1);
    }

    .dku-chat-send {
      padding: 8px 14px;
      background: ${CONFIG.userBubbleColor};
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      font-family: inherit;
      transition: background 0.2s;
    }

    .dku-chat-send:hover {
      background: #006cbd;
    }

    .dku-chat-send:active {
      background: #005a9e;
    }

    /* Typing indicator */
    .dku-chat-typing {
      display: flex;
      gap: 4px;
      padding: 12px;
      align-self: flex-start;
    }

    .dku-chat-typing-dot {
      width: 6px;
      height: 6px;
      background: #999;
      border-radius: 50%;
      animation: dku-typing-bounce 1.4s infinite ease-in-out;
    }

    .dku-chat-typing-dot:nth-child(1) { animation-delay: 0s; }
    .dku-chat-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .dku-chat-typing-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes dku-typing-bounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }
  `;

  // ============================================
  // HTML GENERATION
  // ============================================
  function createMessagesHTML() {
    return CONFIG.messages
      .map(m => `<div class="dku-chat-bubble ${m.role}">${escapeHtml(m.text)}</div>`)
      .join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function createChatHTML() {
    return `
      <div class="dku-chat-section" id="dku-chat-widget">
        <div class="dku-chat-header">
          <div class="dku-chat-icon">${CONFIG.iconText}</div>
          <span>${CONFIG.title}</span>
        </div>
        <div class="dku-chat-messages" id="dku-chat-messages">
          ${createMessagesHTML()}
        </div>
        <div class="dku-chat-input-area">
          <input type="text" class="dku-chat-input" id="dku-chat-input" placeholder="${CONFIG.placeholder}">
          <button class="dku-chat-send" id="dku-chat-send">Send</button>
        </div>
      </div>
    `;
  }

  // ============================================
  // INJECTION LOGIC
  // ============================================
  function injectStyles() {
    const existing = document.getElementById('dku-chat-styles');
    if (existing) existing.remove();

    const styleEl = document.createElement('style');
    styleEl.id = 'dku-chat-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  function findRightPanel() {
    // Target the specific Dataiku right panel content area
    // .details-tab.oa is the scrollable content area inside the right panel
    const selectors = [
      '.details-tab.oa',
      '.right-panel__content--object',
      '.right-panel__content',
      '.rightPane',
      '.object-right-column-summary'
    ];
    
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function inject() {
    // Remove existing widgets if present (cleanup duplicates)
    document.getElementById('dku-chat-widget')?.remove();
    document.getElementById('dku-chat-styles')?.remove();
    document.querySelectorAll('.dku-chat-section').forEach(el => el.remove());

    injectStyles();
    
    const panel = findRightPanel();
    if (panel) {
      panel.insertAdjacentHTML('beforeend', createChatHTML());
      setupInteractivity();
      
      // Scroll to make the chat visible
      const widget = document.getElementById('dku-chat-widget');
      if (widget) {
        widget.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      
      console.log('[Dataiku Chat Mockup] Injected into right panel');
    } else {
      console.warn('[Dataiku Chat Mockup] Right panel not found. Make sure you have an object selected in the Flow view.');
    }
  }

  // ============================================
  // INTERACTIVITY (for demo purposes)
  // ============================================
  function setupInteractivity() {
    const input = document.getElementById('dku-chat-input');
    const sendBtn = document.getElementById('dku-chat-send');
    const messagesContainer = document.getElementById('dku-chat-messages');

    if (!input || !sendBtn || !messagesContainer) return;

    const handleSend = () => {
      const text = input.value.trim();
      if (!text) return;

      // Add user message
      const userBubble = document.createElement('div');
      userBubble.className = 'dku-chat-bubble user';
      userBubble.textContent = text;
      messagesContainer.appendChild(userBubble);
      
      input.value = '';
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // Show typing indicator
      const typing = document.createElement('div');
      typing.className = 'dku-chat-typing';
      typing.innerHTML = '<div class="dku-chat-typing-dot"></div><div class="dku-chat-typing-dot"></div><div class="dku-chat-typing-dot"></div>';
      messagesContainer.appendChild(typing);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // Simulate response after delay
      setTimeout(() => {
        typing.remove();
        const assistantBubble = document.createElement('div');
        assistantBubble.className = 'dku-chat-bubble assistant';
        assistantBubble.textContent = generateMockResponse(text);
        messagesContainer.appendChild(assistantBubble);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 1200);
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  function generateMockResponse(userText) {
    const responses = [
      "I can see this flow has 3 datasets and 2 recipes. Would you like me to explain any specific component?",
      "Based on the flow structure, the Visual Agent appears to be transforming data from input_dataset to create output_dataset.",
      "This project was created recently. I can help you understand the data lineage or suggest optimizations.",
      "I notice there are grouped datasets in this flow. These are typically used for aggregation operations.",
      "The flow looks well-structured. Would you like me to analyze the data quality or suggest improvements?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    // Wait for Dataiku's Angular app to render
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(inject, 500));
    } else {
      setTimeout(inject, 500);
    }
  }

  // Expose for manual re-injection
  window.dataikuChatMockup = {
    inject,
    config: CONFIG
  };

  init();

})();
