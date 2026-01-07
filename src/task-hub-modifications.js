/**
 * Lovable-Style UI Modifications for Dataiku AI Search
 *
 * This script transforms the Dataiku AI Search page to match the Lovable design.
 * Run this in the browser console on: /home/data-catalog/ai-search
 */

(function() {
  'use strict';

  // ============================================
  // 1. Remove left sidebar and fix layout
  // ============================================
  const leftPanel = document.querySelector('HOME-MAIN-MENU.left-panel-section, .left-panel-section');
  if (leftPanel) leftPanel.style.display = 'none';
  document.querySelectorAll('[class*="left-panel"]').forEach(el => el.style.display = 'none');

  const container = document.querySelector('.data-catalog-semantic-search-page__container');
  if (container) {
    container.style.gridTemplateColumns = '1fr';
    container.style.display = 'block';
  }

  // ============================================
  // 2. Apply gradient background
  // ============================================
  const gradient = 'linear-gradient(135deg, rgb(249, 248, 246) 0%, rgb(238, 246, 245) 50%, rgb(249, 248, 246) 100%)';

  document.body.style.background = gradient;
  document.body.style.backgroundAttachment = 'fixed';

  const rootEl = document.getElementById('root-dom-element');
  if (rootEl) {
    rootEl.style.background = gradient;
    rootEl.style.backgroundAttachment = 'fixed';
  }

  // Make overlaying elements transparent so gradient shows through
  const transparentSelectors = [
    '.main-screen-section',
    '.banner-section',
    '.data-catalog-semantic-search__main-section',
    '.data-catalog-semantic-search-page__container',
    '.data-catalog-semantic-search__content'
  ];
  transparentSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.style.background = 'transparent';
      el.style.backgroundColor = 'transparent';
    });
  });

  // ============================================
  // 3. Remove Data Catalog header
  // ============================================
  document.querySelectorAll('.page-header, [class*="page-header"], .banner-section, [class*="catalog-header"]').forEach(el => {
    el.style.display = 'none';
  });
  document.querySelectorAll('div').forEach(el => {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg === 'rgb(59, 153, 252)' || bg === 'rgb(77, 120, 191)') {
      if (!el.classList.contains('master-nav')) {
        el.style.display = 'none';
      }
    }
  });

  // ============================================
  // 4. Update heading text to "Welcome to Dataiku"
  // ============================================
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  const textReplacements = [
    { old: 'Find the data you need', new: 'Welcome to Dataiku' },
    { old: 'Data Catalog', new: 'Task Hub' },
    { old: 'AI Search', new: 'Dataiku Agent' },
    { old: 'NEW SEARCH', new: 'NEW TASK' }
  ];

  while (node = walker.nextNode()) {
    textReplacements.forEach(r => {
      if (node.textContent.trim() === r.old) {
        node.textContent = r.new;
      }
    });
  }

  // ============================================
  // 5. Style the heading
  // ============================================
  const headingEl = document.evaluate("//*[contains(text(),'Welcome to Dataiku')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  if (headingEl) {
    headingEl.style.color = 'rgb(25, 32, 52)';
    headingEl.style.fontSize = '36px';
    headingEl.style.fontWeight = '700';
    headingEl.style.fontFamily = '"Source Sans Pro", sans-serif';
    headingEl.style.textAlign = 'center';
    headingEl.style.width = '100%';
    headingEl.style.display = 'block';

    const parent = headingEl.parentElement;
    if (parent) {
      parent.style.display = 'flex';
      parent.style.flexDirection = 'column';
      parent.style.alignItems = 'center';
      parent.style.width = '100%';
      parent.querySelectorAll('svg, [class*="icon"], [class*="sparkle"]').forEach(el => el.style.display = 'none');
    }
  }

  // ============================================
  // 6. Add subtitle
  // ============================================
  if (headingEl && !document.querySelector('.custom-subtitle')) {
    const subtitle = document.createElement('p');
    subtitle.className = 'custom-subtitle';
    subtitle.textContent = 'Orchestrate agents, create AI workflows, and ensure governance across your organization.';
    subtitle.style.cssText = 'color: #64748b; font-size: 16px; margin-top: 12px; margin-bottom: 32px; text-align: center; display: block; width: 100%;';
    headingEl.parentElement.insertBefore(subtitle, headingEl.nextSibling);
  }

  // ============================================
  // 7. Style search box
  // ============================================
  const searchInput = document.querySelector('input[placeholder*="data"], input[placeholder*="task"], textarea');
  if (searchInput) {
    searchInput.placeholder = 'Search for anything...';
    searchInput.style.background = 'rgb(250, 250, 250)';
    searchInput.style.border = '1px solid rgb(226, 228, 233)';
    searchInput.style.borderRadius = '12px';
    searchInput.style.padding = '16px';
    searchInput.style.fontSize = '16px';
  }

  const form = searchInput?.closest('form') || searchInput?.closest('[class*="input"]');
  if (form) {
    form.style.background = 'white';
    form.style.borderRadius = '12px';
    form.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    form.style.maxWidth = '700px';
    form.style.margin = '0 auto';
    form.style.padding = '8px';
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.alignItems = 'center';
  }

  // ============================================
  // 8. Hide breadcrumb, buttons, and submit arrow
  // ============================================
  document.querySelectorAll('[class*="breadcrumb"]').forEach(el => el.style.display = 'none');
  document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent.includes('NEW TASK') || btn.textContent.includes('NEW SEARCH') || btn.textContent.includes('New task') || btn.textContent.includes('New search')) {
      btn.style.display = 'none';
    }
  });
  document.querySelectorAll('button[type="submit"]').forEach(btn => btn.style.display = 'none');

  // ============================================
  // 9. Fix content layout (no padding)
  // ============================================
  const mainContent = document.querySelector('.data-catalog-semantic-search__content, .main-screen-section');
  if (mainContent) {
    mainContent.style.display = 'flex';
    mainContent.style.flexDirection = 'column';
    mainContent.style.alignItems = 'center';
    mainContent.style.justifyContent = 'center';
    mainContent.style.textAlign = 'center';
    mainContent.style.padding = '0';
  }

  // ============================================
  // 10. Add three cards
  // ============================================
  if (!document.querySelector('.lovable-cards-container')) {
    const botIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00a89c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>`;
    const workflowIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00a89c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>`;
    const shieldIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00a89c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`;

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'lovable-cards-container';
    cardsContainer.style.cssText = 'display: flex; gap: 24px; margin-top: 48px; justify-content: center; padding: 0 20px;';

    const cardsData = [
      { icon: botIcon, title: 'Agent Hub', description: 'Manage and monitor enterprise AI assistants', stat: '12', statLabel: 'Active Agents' },
      { icon: workflowIcon, title: 'AI Workflows', description: 'Build, deploy, and connect data-to-LLM pipelines', stat: '8', statLabel: 'Running Workflows' },
      { icon: shieldIcon, title: 'Governance Center', description: 'Track compliance, lineage, and accountability', stat: '2', statLabel: 'Governance Alerts' }
    ];

    cardsData.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.style.cssText = 'background: white; border-radius: 12px; padding: 24px; width: 260px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; transition: box-shadow 0.2s, transform 0.2s;';
      cardEl.onmouseenter = () => { cardEl.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; cardEl.style.transform = 'translateY(-2px)'; };
      cardEl.onmouseleave = () => { cardEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; cardEl.style.transform = 'translateY(0)'; };

      cardEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <div style="width: 48px; height: 48px; background: #e6f7f6; border-radius: 10px; display: flex; align-items: center; justify-content: center;">${card.icon}</div>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 8px 12px; text-align: center;">
            <div style="font-size: 20px; font-weight: 700; color: #192034;">${card.stat}</div>
            <div style="font-size: 10px; color: #64748b;">${card.statLabel}</div>
          </div>
        </div>
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #192034;">${card.title}</h3>
        <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b; line-height: 1.4;">${card.description}</p>
        <div style="color: #00a89c; font-size: 14px; font-weight: 500;">Go to.. →</div>
      `;
      cardsContainer.appendChild(cardEl);
    });

    const formEl = document.querySelector('form');
    if (formEl && formEl.parentElement) {
      formEl.parentElement.appendChild(cardsContainer);
    }
  }

  console.log('Lovable-style modifications applied successfully!');
})();
