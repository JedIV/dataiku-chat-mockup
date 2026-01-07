/**
 * Flow Page Conversation Injection Script
 *
 * Injects a fake conversation into the Dataiku Flow page's "Generate Flow" panel.
 * The fake conversation shows a user asking for energy consumption insights
 * and an AI responding with summary statistics.
 *
 * Run in browser console on: /projects/ENERGYSTUFF/flow/
 */

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    colors: {
      userMessageBg: 'rgb(242, 242, 242)',
      userMessageText: 'rgb(0, 0, 0)',
      aiMessageText: '#333',
      statBoxBg: '#f8f9fa',
      statBoxBorder: '#e5e7eb',
      accentColor: '#00a89c',
      headingColor: '#192034',
      secondaryText: '#444',
      statValue: '#192034'
    },
    userMessage: 'Give me insights about the energy consumption data',
    aiResponse: {
      title: 'Energy Consumption Summary',
      intro: 'I analyzed <strong>52,416 records</strong> from your dataset. Here are the key insights:',
      sections: [
        {
          title: 'Consumption Stats',
          stats: [
            { label: 'Avg', value: '1,847 kWh' },
            { label: 'Max', value: '4,892 kWh' },
            { label: 'Min', value: '29 kWh' },
            { label: 'Std Dev', value: '1,203' }
          ]
        },
        {
          title: 'Top Consumers by Sector',
          list: [
            '1. Chemical Industry — <strong>68%</strong>',
            '2. Hotels — <strong>22%</strong>',
            '3. Other — <strong>10%</strong>'
          ]
        },
        {
          title: 'Temperature Correlation',
          text: 'Strong negative correlation (<strong>r = -0.73</strong>) between temperature and consumption. Colder days show significantly higher energy usage.'
        }
      ]
    }
  };

  // ============================================
  // Helper Functions
  // ============================================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function applyStyles(el, styles) {
    if (!el) return;
    Object.assign(el.style, styles);
  }

  // ============================================
  // Build AI Response HTML
  // ============================================
  function buildAIResponseHTML() {
    const { aiResponse, colors } = CONFIG;

    let sectionsHTML = '';

    aiResponse.sections.forEach(section => {
      if (section.stats) {
        // Stats grid section
        const statsHTML = section.stats.map(s =>
          `<div>${s.label}: <strong style="color:${colors.statValue}">${s.value}</strong></div>`
        ).join('');

        sectionsHTML += `
          <div style="background: ${colors.statBoxBg}; border-radius: 8px; padding: 12px; margin-bottom: 12px; border: 1px solid ${colors.statBoxBorder};">
            <div style="font-weight: 600; color: ${colors.accentColor}; margin-bottom: 8px; font-size: 13px;">${section.title}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 13px; color: #555;">
              ${statsHTML}
            </div>
          </div>
        `;
      } else if (section.list) {
        // List section
        const listHTML = section.list.map(item =>
          `<div>${item}</div>`
        ).join('');

        sectionsHTML += `
          <div style="background: ${colors.statBoxBg}; border-radius: 8px; padding: 12px; margin-bottom: 12px; border: 1px solid ${colors.statBoxBorder};">
            <div style="font-weight: 600; color: ${colors.accentColor}; margin-bottom: 8px; font-size: 13px;">${section.title}</div>
            <div style="font-size: 13px; color: #555; line-height: 1.6;">
              ${listHTML}
            </div>
          </div>
        `;
      } else if (section.text) {
        // Text section
        sectionsHTML += `
          <div style="background: ${colors.statBoxBg}; border-radius: 8px; padding: 12px; margin-bottom: 12px; border: 1px solid ${colors.statBoxBorder};">
            <div style="font-weight: 600; color: ${colors.accentColor}; margin-bottom: 8px; font-size: 13px;">${section.title}</div>
            <div style="font-size: 13px; color: #555; line-height: 1.5;">
              ${section.text}
            </div>
          </div>
        `;
      }
    });

    return `
      <div style="font-weight: 600; margin-bottom: 12px; color: ${colors.headingColor}; font-size: 14px;">
        📊 ${aiResponse.title}
      </div>
      <div style="margin-bottom: 14px; color: ${colors.secondaryText};">
        ${aiResponse.intro}
      </div>
      ${sectionsHTML}
    `;
  }

  // ============================================
  // Main Injection Function
  // ============================================
  function injectFakeConversation() {
    // Remove any previously injected fake conversation
    $$('.fake-messages-wrapper').forEach(el => el.remove());

    // Find the panel and scrollable section
    const panel = $('.text-to-flow-container');
    if (!panel) {
      console.error('Generate Flow panel not found');
      return false;
    }

    const scrollableSection = panel.querySelector('.text-to-flow-scrollable-section');
    if (!scrollableSection) {
      console.error('Scrollable section not found');
      return false;
    }

    // Hide empty state elements (but not the chat container)
    Array.from(scrollableSection.children).forEach(child => {
      if (!child.classList.contains('text-to-flow-chat-container')) {
        child.style.display = 'none';
      }
    });

    // Create or get chat container
    let chatContainer = scrollableSection.querySelector('.text-to-flow-chat-container');
    if (!chatContainer) {
      chatContainer = document.createElement('div');
      chatContainer.className = 'text-to-flow-chat-container';
      scrollableSection.insertBefore(chatContainer, scrollableSection.firstChild);
    }

    // Create fake messages wrapper
    const fakeMessages = document.createElement('div');
    fakeMessages.className = 'fake-messages-wrapper';
    applyStyles(fakeMessages, {
      marginBottom: '24px'
    });

    // Build the fake conversation HTML
    fakeMessages.innerHTML = `
      <!-- User Message -->
      <div class="text-to-flow-message-container" style="display: flex; flex-direction: column; margin-bottom: 16px;">
        <div class="text-to-flow-chat-message__user" style="
          background-color: ${CONFIG.colors.userMessageBg};
          color: ${CONFIG.colors.userMessageText};
          font-size: 13px;
          padding: 8px;
          display: flex;
          font-family: SourceSansPro, sans-serif;
          line-height: 1.4;
          max-width: 80%;
          align-self: flex-end;
        ">${CONFIG.userMessage}</div>
      </div>

      <!-- AI Response -->
      <div class="text-to-flow-message-container">
        <div class="text-to-flow-chat-message__assistant" style="
          font-family: SourceSansPro, sans-serif;
          font-size: 13px;
          color: ${CONFIG.colors.aiMessageText};
          line-height: 1.5;
        ">
          ${buildAIResponseHTML()}
        </div>
      </div>
    `;

    // Insert at the beginning of the chat container
    chatContainer.insertBefore(fakeMessages, chatContainer.firstChild);

    // Scroll to top to show the fake conversation
    scrollableSection.scrollTop = 0;

    console.log('Fake conversation injected successfully!');
    return true;
  }

  // ============================================
  // Initialize
  // ============================================

  // Try to inject immediately
  if (!injectFakeConversation()) {
    // If panel not ready, wait for it
    const observer = new MutationObserver((mutations, obs) => {
      if ($('.text-to-flow-container')) {
        injectFakeConversation();
        obs.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Expose function globally for manual re-injection
  window.injectFakeConversation = injectFakeConversation;

})();
