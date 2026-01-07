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
      { from: 'Data Catalog', to: 'Task Hub' },
      { from: 'AI Search', to: 'Dataiku Agent' },
      { from: 'NEW SEARCH', to: 'NEW TASK' }
    ],
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
    '[class*="breadcrumb"]',
    'button[type="submit"]'
  ]);

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
  // 4. Style Heading
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
  // 5. Style Search Box (Lovable-style)
  // ============================================
  const searchInput = $('textarea, input[placeholder*="Search"]');
  const form = searchInput?.closest('form');

  if (form) {
    applyStyles(form, {
      background: 'transparent',
      boxShadow: 'none',
      padding: '0',
      border: 'none'
    });
  }

  if (searchInput && !$('.lovable-search-wrapper')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'lovable-search-wrapper';
    applyStyles(wrapper, {
      position: 'relative',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      height: '44px'
    });

    const iconWrapper = document.createElement('div');
    iconWrapper.innerHTML = ICONS.search;
    applyStyles(iconWrapper, {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      height: '20px'
    });

    searchInput.parentElement.insertBefore(wrapper, searchInput);
    wrapper.appendChild(iconWrapper);
    wrapper.appendChild(searchInput);

    applyStyles(searchInput, {
      width: '100%',
      height: '44px',
      minHeight: '44px',
      maxHeight: '44px',
      padding: '0 16px 0 44px',
      border: `1px solid ${CONFIG.colors.border}`,
      borderRadius: '8px',
      fontSize: '15px',
      background: 'white',
      outline: 'none',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      lineHeight: '44px',
      overflow: 'hidden'
    });
    searchInput.placeholder = 'Search for anything...';
    searchInput.rows = 1;
  }

  // ============================================
  // 6. Fix Content Layout
  // ============================================
  const mainContent = $('.data-catalog-semantic-search__content, .main-screen-section');
  if (mainContent) {
    applyStyles(mainContent, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0'
    });
  }

  // ============================================
  // 7. Create Feature Cards
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

    const formEl = $('form');
    if (formEl?.parentElement) {
      formEl.parentElement.appendChild(container);
    }
  }

  console.log('Lovable-style modifications applied successfully!');
})();
