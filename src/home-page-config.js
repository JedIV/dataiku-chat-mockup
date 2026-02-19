/**
 * Home Page Chat Configuration
 *
 * Define the scripted conversation for the Home/Task Hub page demo.
 * Load this file BEFORE home-page-fake-chat.js
 *
 * Each message has:
 *   - role: 'user' or 'assistant'
 *   - text: (for user messages) the text to type
 *   - content: (for assistant messages) object with optional thinking, cards, and text
 */

window.homePageChatConfig = {
  // Typing speed in ms per character
  typingSpeed: 30,

  // Delay before assistant response appears (after typing indicator)
  aiResponseDelay: 800,

  // The scripted conversation
  conversation: [
    // Step 1: User describes the problem
    {
      role: 'user',
      text: 'Marcus runs recruitment across 12 trial sites and he\'s always behind on which ones are struggling. He needs something on his phone that shows real-time status, scores candidates, and tells him where to shift outreach.'
    },

    // Step 2: Assistant thinks, then presents workstream cards
    {
      role: 'assistant',
      content: {
        thinking: [
          'Marcus needs real-time visibility, not batch reports...',
          'Candidate scoring requires patient data + eligibility criteria...',
          'Mobile access \u2192 webapp, but also needs push alerts \u2192 Slack agent...',
          'Three distinct workstreams: data pipeline, conversational agent, screening app'
        ],
        cards: [
          { icon: '\uD83D\uDCCA', title: 'Recruitment Analytics Pipeline', description: 'Connect patient records, site performance, and enrollment history. Score candidates, detect gaps, recommend reallocations.' },
          { icon: '\uD83D\uDCAC', title: 'Conversational Agent + Slack', description: 'Let Marcus query recruitment status in natural language, wherever he is.' },
          { icon: '\uD83D\uDCF1', title: 'Mobile Screening App', description: 'Drill into site performance, candidate pipelines, and enrollment funnels.' }
        ],
        text: 'Should I kick off all three?'
      }
    },

    // Step 3: User confirms
    {
      role: 'user',
      text: 'Do it.'
    },

    // Step 4: Assistant kicks off
    {
      role: 'assistant',
      content: {
        text: 'Spinning up three workstreams now...'
      }
    }
  ]
};

console.log('[HomePageConfig] Loaded ' + window.homePageChatConfig.conversation.length + ' conversation steps');
