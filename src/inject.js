/**
 * Dataiku Chat Mockup - Injection Script
 * Injects a mock AI chat assistant into Dataiku's right panel as an accordion
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION - Edit these to customize
  // ============================================
  const CONFIG = {
    title: 'Assistant',
    placeholder: 'Ask about your data...',
    iconText: 'AI',

    // Sample conversation to display
    messages: [
      {
        role: 'assistant',
        text: "Hi! I'm your data assistant. I can help you build flows, explore datasets, and automate tasks. What would you like to do?"
      },
      {
        role: 'user',
        text: "I need to create a flow that combines our customer_orders and product_catalog datasets"
      },
      {
        role: 'assistant',
        text: "I found both datasets in your project. I'll create a flow that joins them together. Which columns would you like to join on?"
      },
      {
        role: 'user',
        text: "Join on product_id"
      },
      {
        role: 'assistant',
        text: "Done! I've created a new flow with a Join recipe connecting customer_orders and product_catalog on the product_id column. The output dataset is called customer_orders_enriched."
      },
      {
        role: 'user',
        text: "Can you also filter out orders older than 2023?"
      },
      {
        role: 'assistant',
        text: "I've added a Filter recipe to the flow. It removes all orders where order_date is before January 1, 2023. Your final dataset now contains 12,847 records. Would you like me to run a quick data quality check?"
      },
      {
        role: 'user',
        text: "Yes please"
      },
      {
        role: 'assistant',
        text: "Data quality check complete:\n\n✓ No duplicate order IDs\n✓ All product_ids have matching catalog entries\n⚠ 23 records have null values in shipping_address\n\nWould you like me to handle those null values?"
      }
    ],

    // Styling - Dataiku native colors
    accentColor: '#3b99fc',      // Dataiku blue
    userBubbleColor: '#3b99fc',  // Dataiku blue
    chatHeight: '900px',
    startExpanded: true
  };

  // ============================================
  // STYLES
  // ============================================
  const styles = `
    /* Accordion content area - show/hide based on collapsed state */
    .dku-chat-accordion .dku-chat-content {
      overflow: hidden;
      transition: max-height 0.3s ease;
      max-height: 1000px;
    }

    .dku-chat-accordion.collapsed .dku-chat-content {
      max-height: 0;
    }

    /* Chat container inside accordion */
    .dku-chat-container {
      display: flex;
      flex-direction: column;
      height: ${CONFIG.chatHeight};
      background: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    /* Messages area */
    .dku-chat-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
    }

    .dku-chat-bubble {
      padding: 14px 18px;
      border-radius: 18px;
      font-size: 15px;
      line-height: 1.5;
      max-width: 85%;
      animation: dku-chat-fade-in 0.3s ease-out;
      white-space: pre-wrap;
    }

    @keyframes dku-chat-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dku-chat-bubble.assistant {
      background: #f4f4f4;
      color: #1a1a1a;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .dku-chat-bubble.user {
      background: linear-gradient(135deg, #3b99fc 0%, #2b7de9 100%);
      color: #ffffff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
      box-shadow: 0 2px 8px rgba(59, 153, 252, 0.3);
    }

    /* Input area */
    .dku-chat-input-area {
      padding: 16px 20px;
      border-top: 1px solid #ebebeb;
      background: #ffffff;
    }

    input.dku-chat-input[type="text"] {
      width: 100%;
      padding: 14px 20px;
      border: 1px solid #e0e0e0;
      border-radius: 24px;
      font-size: 15px;
      color: #1a1a1a;
      outline: none;
      font-family: inherit;
      background: #f9f9f9;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      box-shadow: none;
      height: auto;
      margin-bottom: 0;
      box-sizing: border-box;
    }

    input.dku-chat-input[type="text"]:focus {
      border-color: #c0c0c0;
      background: #ffffff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    input.dku-chat-input[type="text"]::placeholder {
      color: #9a9a9a;
    }

    /* Typing indicator */
    .dku-chat-typing {
      display: flex;
      gap: 6px;
      padding: 14px 18px;
      background: #f4f4f4;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .dku-chat-typing-dot {
      width: 8px;
      height: 8px;
      background: #888888;
      border-radius: 50%;
      animation: dku-typing-bounce 1.4s infinite ease-in-out;
    }

    .dku-chat-typing-dot:nth-child(1) { animation-delay: 0s; }
    .dku-chat-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .dku-chat-typing-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes dku-typing-bounce {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
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
    const collapsedClass = CONFIG.startExpanded ? '' : 'collapsed';
    const chevronIcon = CONFIG.startExpanded ? 'icon-chevron-up' : 'icon-chevron-down';
    return `
      <div class="dku-chat-accordion accordion ${collapsedClass}" id="dku-chat-widget">
        <h4 class="accordion-title" id="dku-chat-toggle">
          <i class="${chevronIcon}" id="dku-chat-chevron"></i>
          ${CONFIG.title}
        </h4>
        <div class="dku-chat-content">
          <div class="dku-chat-container">
            <div class="dku-chat-messages" id="dku-chat-messages">
              ${createMessagesHTML()}
            </div>
            <div class="dku-chat-input-area">
              <input type="text" class="dku-chat-input" id="dku-chat-input" placeholder="${CONFIG.placeholder}">
            </div>
          </div>
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
    const selectors = [
      '.object-right-column-summary',
      '.details-tab.oa',
      '.right-panel__content--object',
      '.right-panel__content',
      '.rightPane'
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
    document.querySelectorAll('.dku-chat-accordion').forEach(el => el.remove());

    injectStyles();

    const panel = findRightPanel();
    if (panel) {
      // Find the first existing accordion to insert before it (to appear alongside Actions/Details)
      const firstAccordion = panel.querySelector('.accordion');
      if (firstAccordion) {
        firstAccordion.insertAdjacentHTML('beforebegin', createChatHTML());
      } else {
        // Fallback: insert at start of panel
        panel.insertAdjacentHTML('afterbegin', createChatHTML());
      }

      setupInteractivity();
      setupAccordionToggle();

      console.log('[Dataiku Chat Mockup] Injected into right panel as accordion');
    } else {
      console.warn('[Dataiku Chat Mockup] Right panel not found. Make sure you have an object selected in the Flow view.');
    }
  }

  // ============================================
  // ACCORDION TOGGLE
  // ============================================
  function setupAccordionToggle() {
    const toggle = document.getElementById('dku-chat-toggle');
    const accordion = document.getElementById('dku-chat-widget');
    const chevron = document.getElementById('dku-chat-chevron');

    if (!toggle || !accordion) return;

    toggle.addEventListener('click', () => {
      const isCollapsed = accordion.classList.toggle('collapsed');
      if (chevron) {
        chevron.className = isCollapsed ? 'icon-chevron-down' : 'icon-chevron-up';
      }
    });
  }

  // ============================================
  // INTERACTIVITY (for demo purposes)
  // ============================================
  function setupInteractivity() {
    const input = document.getElementById('dku-chat-input');
    const messagesContainer = document.getElementById('dku-chat-messages');

    if (!input || !messagesContainer) return;

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
