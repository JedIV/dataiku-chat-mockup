/**
 * Dataiku Flow Title Injection
 * Adds a title above the Generate Flow conversation
 */

(function() {
  'use strict';

  const CONFIG = {
    title: 'Energy Consumption Flow'
  };

  const styles = `
    .injected-flow-title {
      font-size: 20px;
      font-weight: 600;
      color: #333333;
      padding: 16px 20px 8px 20px;
      font-family: 'SourceSansPro', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, sans-serif;
    }
  `;

  function injectStyles() {
    const existing = document.getElementById('injected-title-styles');
    if (existing) existing.remove();

    const styleEl = document.createElement('style');
    styleEl.id = 'injected-title-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  function inject() {
    // Remove existing if present
    document.getElementById('injected-flow-title')?.remove();

    const scrollableSection = document.querySelector('.text-to-flow-scrollable-section');
    if (scrollableSection) {
      injectStyles();

      const titleEl = document.createElement('div');
      titleEl.id = 'injected-flow-title';
      titleEl.className = 'injected-flow-title';
      titleEl.textContent = CONFIG.title;

      scrollableSection.insertAdjacentElement('beforebegin', titleEl);

      console.log('[Dataiku Title Injection] Title injected');
    } else {
      console.warn('[Dataiku Title Injection] .text-to-flow-scrollable-section not found');
    }
  }

  // Expose for manual re-injection
  window.dataikuTitleInjection = { inject, config: CONFIG };

  // Run injection
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(inject, 500));
  } else {
    setTimeout(inject, 100);
  }

})();
