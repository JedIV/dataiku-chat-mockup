/**
 * Task Hub UI Modifications
 *
 * This script transforms the Dataiku AI Search page into a task/decision-oriented interface.
 * Run this in the browser console on: /home/data-catalog/ai-search
 *
 * Usage: Copy and paste into browser console, or inject via browser extension
 */

(function() {
  'use strict';

  // ============================================
  // 1. Remove left sidebar
  // ============================================

  // Hide the left panel section
  const leftPanel = document.querySelector('HOME-MAIN-MENU.left-panel-section, .left-panel-section');
  if (leftPanel) {
    leftPanel.style.display = 'none';
  }

  // Hide any other left panel elements
  document.querySelectorAll('[class*="left-panel"]').forEach(el => {
    el.style.display = 'none';
  });

  // Fix the grid layout to remove sidebar space
  const container = document.querySelector('.data-catalog-semantic-search-page__container');
  if (container) {
    container.style.gridTemplateColumns = '1fr';
    container.style.display = 'block';
  }

  // ============================================
  // 2. Text replacements
  // ============================================

  const textReplacements = [
    { old: 'Data Catalog', new: 'Task Hub' },
    { old: 'AI Search', new: 'AI Assistant' },
    { old: 'Find the data you need', new: 'What do you need to accomplish?' },
    { old: 'New search', new: 'New task' },
    { old: 'NEW SEARCH', new: 'NEW TASK' },
    {
      old: 'AI Search allows you to find and discover data using natural language.',
      new: 'AI Assistant helps you accomplish tasks and make decisions using natural language.'
    }
  ];

  // Walk through all text nodes and replace content
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while (node = walker.nextNode()) {
    textReplacements.forEach(replacement => {
      if (node.textContent.trim() === replacement.old ||
          node.textContent.includes(replacement.old)) {
        node.textContent = node.textContent.replace(replacement.old, replacement.new);
      }
    });
  }

  // ============================================
  // 3. Update placeholder text
  // ============================================

  // Update input placeholders
  document.querySelectorAll('input[placeholder*="data"], textarea[placeholder*="data"], [placeholder*="data"]').forEach(el => {
    if (el.placeholder) {
      el.placeholder = 'Describe the task or decision you need help with...';
    }
    el.setAttribute('placeholder', 'Describe the task or decision you need help with...');
  });

  // Also check for text containing the old placeholder
  const walker2 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (node = walker2.nextNode()) {
    if (node.textContent.includes('Describe the data you are looking for')) {
      node.textContent = node.textContent.replace(
        'Describe the data you are looking for...',
        'Describe the task or decision you need help with...'
      );
    }
  }

  console.log('Task Hub modifications applied successfully!');
})();
