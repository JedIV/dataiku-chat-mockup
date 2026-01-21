/**
 * Lovable-Style UI Modifications for Dataiku AI Search
 *
 * Transforms the Dataiku AI Search page to match the Lovable design.
 * Run in browser console on: /home/data-catalog/ai-search
 */

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    colors: {
      text: {
        primary: '#192034',
        secondary: '#64748b',
        accent: '#00a89c'
      },
      background: {
        gradient: 'linear-gradient(135deg, rgb(249, 248, 246) 0%, rgb(238, 246, 245) 50%, rgb(249, 248, 246) 100%)',
        card: 'white',
        iconBox: '#e6f7f6',
        statBox: '#f8f9fa'
      },
      border: '#e5e7eb'
    },
    textReplacements: [
      { from: 'Find the data you need', to: 'Welcome to Dataiku' },
      { from: 'AI Search', to: 'Dataiku Agent' },
      { from: 'NEW SEARCH', to: 'NEW TASK' }
    ],
    // Left nav configuration
    leftNav: {
      hideSubItems: true,  // Hide Data Catalog sub-items
      addItems: [
        { text: 'Agent Hub', after: 'Dataiku Apps' },
        { text: 'Governance', after: 'Agent Hub' }
      ]
    },
    cards: [
      {
        icon: 'bot',
        title: 'Agent Hub',
        description: 'Manage and monitor enterprise AI assistants',
        stat: '12',
        statLabel: 'Active Agents'
      },
      {
        icon: 'workflow',
        title: 'AI Workflows',
        description: 'Build, deploy, and connect data-to-LLM pipelines',
        stat: '8',
        statLabel: 'Running Workflows'
      },
      {
        icon: 'shield',
        title: 'Governance Center',
        description: 'Track compliance, lineage, and accountability',
        stat: '2',
        statLabel: 'Governance Alerts'
      }
    ]
  };

  const ICONS = {
    bot: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00a89c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>`,
    workflow: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00a89c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>`,
    shield: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00a89c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`
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

  function hideElements(selectors) {
    selectors.forEach(sel => $$(sel).forEach(el => el.style.display = 'none'));
  }

  function makeTransparent(selectors) {
    selectors.forEach(sel => {
      $$(sel).forEach(el => {
        el.style.background = 'transparent';
        el.style.backgroundColor = 'transparent';
      });
    });
  }

  // ============================================
  // Main Styling Function (can be re-applied)
  // ============================================
  function applyLovableStyles() {
    // Remove any previously added custom elements
    document.querySelectorAll('.lovable-search-wrapper, .lovable-cards-container, .custom-subtitle').forEach(el => el.remove());

    // ============================================
    // 1. Apply Gradient Background
    // ============================================
    applyStyles(document.body, {
      background: CONFIG.colors.background.gradient,
      backgroundAttachment: 'fixed'
    });

    applyStyles($('#root-dom-element'), {
      background: CONFIG.colors.background.gradient,
      backgroundAttachment: 'fixed'
    });

    makeTransparent([
      '.main-screen-section',
      '.banner-section',
      '.data-catalog-semantic-search__main-section',
      '.data-catalog-semantic-search-page__container',
      '.data-catalog-semantic-search__content'
    ]);

  // ============================================
  // 2. Hide Unnecessary Elements
  // ============================================
  hideElements([
    '.page-header',
    '[class*="page-header"]',
    '.banner-section',
    '[class*="catalog-header"]',
    '[class*="breadcrumb"]'
  ]);

  // Remove data-catalog-page-header element
  const catalogHeader = document.querySelector('data-catalog-page-header');
  if (catalogHeader) catalogHeader.remove();

  // Remove right panel
  const rightPanel = document.querySelector('div.right-panel');
  if (rightPanel) rightPanel.remove();

  // Remove global finder nav box
  const globalFinderNavBox = document.querySelector('.global-finder-nav-box');
  if (globalFinderNavBox) globalFinderNavBox.remove();

  // Hide blue header bar (but keep main nav)
  $$('div').forEach(el => {
    const bg = getComputedStyle(el).backgroundColor;
    if ((bg === 'rgb(59, 153, 252)' || bg === 'rgb(77, 120, 191)') && !el.classList.contains('master-nav')) {
      el.style.display = 'none';
    }
  });

  // Hide NEW TASK/SEARCH buttons
  $$('button').forEach(btn => {
    if (/NEW (TASK|SEARCH)|New (task|search)/i.test(btn.textContent)) {
      btn.style.display = 'none';
    }
  });

  // ============================================
  // 3. Text Replacements
  // ============================================
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent.trim();
    const replacement = CONFIG.textReplacements.find(r => r.from === text);
    if (replacement) {
      node.textContent = replacement.to;
    }
  }

  // ============================================
  // 4. Modify Left Navigation
  // ============================================

  // Hide all sub-items in left panel (they have class 'left-panel-subitem')
  $$('.left-panel-subitem').forEach(item => {
    item.style.display = 'none';
  });

  // Change highlight from current selection to Home
  $$('.left-panel-item').forEach(item => {
    const text = item.textContent.trim();
    // Remove highlight from all items
    item.classList.remove('left-panel-item--selected');
    item.style.color = '';
    item.style.fontWeight = '';

    // Add highlight to Home
    if (text === 'Home') {
      item.classList.add('left-panel-item--selected');
      item.style.color = CONFIG.colors.text.accent;
      item.style.fontWeight = '600';
    }
  });

  // Add new nav items: Agent Hub and Governance
  if (!document.querySelector('.custom-nav-agent-hub')) {
    // Find "Dataiku Apps" element
    let dataikuAppsEl = null;
    $$('.left-panel-item').forEach(el => {
      if (el.textContent.trim() === 'Dataiku Apps') {
        dataikuAppsEl = el;
      }
    });

    if (dataikuAppsEl) {
      const container = dataikuAppsEl.closest('.left-panel-container') || dataikuAppsEl.parentElement;

      // Styles matching native nav items
      const navItemStyle = 'padding: 4px 8px 4px 16px; display: flex; align-items: center; height: 32px; font-size: 16px; font-weight: 400; font-family: SourceSansPro; line-height: 20px; color: rgb(68, 68, 68); text-decoration: none; margin: 0; box-sizing: content-box;';

      // Create Agent Hub nav item
      const agentHubItem = document.createElement('a');
      agentHubItem.className = 'a--no-style left-panel-item custom-nav-agent-hub';
      agentHubItem.textContent = 'Agent Hub';
      agentHubItem.href = '#';
      agentHubItem.style.cssText = navItemStyle;
      agentHubItem.onclick = (e) => e.preventDefault();

      // Create Governance nav item
      const governanceItem = document.createElement('a');
      governanceItem.className = 'a--no-style left-panel-item custom-nav-governance';
      governanceItem.textContent = 'Governance';
      governanceItem.href = '#';
      governanceItem.style.cssText = navItemStyle;
      governanceItem.onclick = (e) => e.preventDefault();

      // Insert after Dataiku Apps
      dataikuAppsEl.after(agentHubItem);
      agentHubItem.after(governanceItem);
    }
  }

  // ============================================
  // 5. Style Heading
  // ============================================
  const headingEl = document.evaluate(
    "//*[contains(text(),'Welcome to Dataiku')]",
    document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
  ).singleNodeValue;

  if (headingEl) {
    applyStyles(headingEl, {
      color: CONFIG.colors.text.primary,
      fontSize: '36px',
      fontWeight: '700',
      fontFamily: '"Source Sans Pro", sans-serif',
      textAlign: 'center',
      width: '100%',
      display: 'block'
    });

    const parent = headingEl.parentElement;
    if (parent) {
      applyStyles(parent, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      });
      parent.querySelectorAll('svg, [class*="icon"], [class*="sparkle"]').forEach(el => el.style.display = 'none');
    }

    // Add subtitle
    if (!$('.custom-subtitle')) {
      const subtitle = document.createElement('p');
      subtitle.className = 'custom-subtitle';
      subtitle.textContent = 'Orchestrate agents, create AI workflows, and ensure governance across your organization.';
      applyStyles(subtitle, {
        color: CONFIG.colors.text.secondary,
        fontSize: '16px',
        marginTop: '12px',
        marginBottom: '32px',
        textAlign: 'center',
        display: 'block',
        width: '100%'
      });
      parent.insertBefore(subtitle, headingEl.nextSibling);
    }
  }

  // ============================================
  // 5. Style Chat Input Area (clean, modern look)
  // ============================================

  // Style the main chat input container - wide ChatGPT-style
  const chatInputContainer = $('.data-catalog-semantic-search__chat-input');
  if (chatInputContainer) {
    applyStyles(chatInputContainer, {
      background: 'white',
      border: `1px solid ${CONFIG.colors.border}`,
      borderRadius: '24px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      padding: '12px 20px',
      width: '100%',
      maxWidth: '900px',
      margin: '32px auto 0',
      boxSizing: 'border-box'
    });
  }

  // Style the form inside - make it horizontal layout
  const chatForm = $('.data-catalog-semantic-search__chat-input form') || $('.chat-input__container') || $('form');
  if (chatForm) {
    applyStyles(chatForm, {
      background: 'transparent',
      boxShadow: 'none',
      padding: '0',
      border: 'none',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: '12px'
    });
  }

  // Style the textarea
  const searchInput = $('.chat-input__textarea') || $('textarea');
  if (searchInput) {
    applyStyles(searchInput, {
      flex: '1',
      width: 'auto',
      minHeight: '24px',
      maxHeight: '120px',
      padding: '0',
      border: 'none',
      borderRadius: '0',
      fontSize: '15px',
      background: 'transparent',
      outline: 'none',
      boxShadow: 'none',
      lineHeight: '1.5',
      resize: 'none',
      fontFamily: '"Source Sans Pro", -apple-system, sans-serif',
      color: CONFIG.colors.text.primary
    });
    searchInput.placeholder = 'What do you want to do?';
  }

  // Style the actions container
  const actionsDiv = $('.chat-input__actions');
  if (actionsDiv) {
    applyStyles(actionsDiv, {
      marginTop: '0',
      display: 'flex',
      alignItems: 'center'
    });
  }

  // Hide the existing submit button and create a custom one
  const existingSubmitBtn = $('button[type="submit"]');
  if (existingSubmitBtn) {
    existingSubmitBtn.style.display = 'none';
  }

  // Create custom send button if it doesn't exist
  if (!$('.custom-send-btn')) {
    const customBtn = document.createElement('button');
    customBtn.className = 'custom-send-btn';
    customBtn.type = 'button';
    applyStyles(customBtn, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: 'none',
      background: CONFIG.colors.text.accent,
      cursor: 'pointer',
      transition: 'background 0.15s, transform 0.15s',
      flexShrink: '0',
      marginLeft: 'auto'
    });

    // Up arrow SVG icon
    customBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>`;

    customBtn.onmouseenter = () => {
      customBtn.style.background = '#008f85';
      customBtn.style.transform = 'scale(1.05)';
    };
    customBtn.onmouseleave = () => {
      customBtn.style.background = CONFIG.colors.text.accent;
      customBtn.style.transform = 'scale(1)';
    };

    // Click handler - trigger the hidden submit button
    customBtn.onclick = () => {
      if (existingSubmitBtn) existingSubmitBtn.click();
    };

    // Add to form
    if (chatForm) {
      chatForm.appendChild(customBtn);
    }
  }

  // Hide the search icon that's built into the input (we'll use cleaner look)
  $$('.chat-input__icon, .data-catalog-semantic-search__chat-input svg:not(button svg)').forEach(el => {
    el.style.display = 'none';
  });

  // ============================================
  // 6. Fix Content Layout (left-align for search results)
  // ============================================
  const mainContent = $('.data-catalog-semantic-search__content, .main-screen-section');
  if (mainContent) {
    applyStyles(mainContent, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'left',
      padding: '0'
    });
  }

  // ============================================
  // 7. Hide original "New Search" button (users can refresh page manually)
  // ============================================
  $$('.chat-input__new-search').forEach(btn => btn.style.display = 'none');

  // ============================================
  // 8. Create Feature Cards
  // ============================================
  if (!$('.lovable-cards-container')) {
    const container = document.createElement('div');
    container.className = 'lovable-cards-container';
    applyStyles(container, {
      display: 'flex',
      gap: '24px',
      marginTop: '48px',
      justifyContent: 'center',
      padding: '0 20px'
    });

    CONFIG.cards.forEach(cardData => {
      const card = document.createElement('div');
      applyStyles(card, {
        background: CONFIG.colors.background.card,
        borderRadius: '12px',
        padding: '24px',
        width: '260px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        textAlign: 'left'
      });

      card.onmouseenter = () => {
        card.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
        card.style.transform = 'translateY(-2px)';
      };
      card.onmouseleave = () => {
        card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        card.style.transform = 'translateY(0)';
      };

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <div style="width: 48px; height: 48px; background: ${CONFIG.colors.background.iconBox}; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            ${ICONS[cardData.icon]}
          </div>
          <div style="background: ${CONFIG.colors.background.statBox}; border-radius: 8px; padding: 8px 12px; text-align: center;">
            <div style="font-size: 20px; font-weight: 700; color: ${CONFIG.colors.text.primary};">${cardData.stat}</div>
            <div style="font-size: 10px; color: ${CONFIG.colors.text.secondary};">${cardData.statLabel}</div>
          </div>
        </div>
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: ${CONFIG.colors.text.primary}; text-align: left;">${cardData.title}</h3>
        <p style="margin: 0 0 16px 0; font-size: 13px; color: ${CONFIG.colors.text.secondary}; line-height: 1.4; text-align: left;">${cardData.description}</p>
        <div style="color: ${CONFIG.colors.text.accent}; font-size: 14px; font-weight: 500; text-align: left;">Go to.. →</div>
      `;

      container.appendChild(card);
    });

    // Insert cards after the chat input container, not inside it
    const chatInputEl = $('.data-catalog-semantic-search__chat-input');
    if (chatInputEl) {
      chatInputEl.insertAdjacentElement('afterend', container);
    }
  }

    console.log('Lovable-style modifications applied successfully!');
  } // End of applyLovableStyles function

  // ============================================
  // Initialize and set up event listener for re-application
  // ============================================

  // Apply styles initially
  applyLovableStyles();

  // Listen for custom event to re-apply styles (used by New Search button)
  window.addEventListener('applyLovableStyles', () => {
    applyLovableStyles();
  });

  // Watch for textarea to appear and style it (for SPA lazy loading)
  const observer = new MutationObserver((mutations) => {
    const textarea = $('textarea');
    // Check if styles have been applied by looking for our custom send button
    if (textarea && !$('.custom-send-btn')) {
      // Textarea appeared but not yet styled - apply styles
      applyLovableStyles();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Expose function globally for debugging
  window.applyLovableStyles = applyLovableStyles;
})();
