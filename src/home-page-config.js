/**
 * Home Page Chat Configuration
 *
 * Define the scripted conversation for the Home/Task Hub page demo.
 * Load this file BEFORE home-page-fake-chat.js
 *
 * Each message has:
 *   - role: 'user' or 'assistant'
 *   - text: (for user messages) the text to type
 *   - content: (for assistant messages) object with 'text' property (supports HTML)
 */

window.homePageChatConfig = {
  // Typing speed in ms per character
  typingSpeed: 30,

  // Delay before assistant response appears (after typing indicator)
  aiResponseDelay: 800,

  // The scripted conversation
  conversation: [
    // Step 1: User asks about patient data
    {
      role: 'user',
      text: 'I need to find patient data for a clinical trial analysis'
    },

    // Step 2: Assistant asks clarifying question
    {
      role: 'assistant',
      content: {
        text: 'I can help you find patient data. What kind of analysis are you looking to perform?'
      }
    },

    // Step 3: User explains their goal
    {
      role: 'user',
      text: 'I want to understand who to include in clinical trials'
    },

    // Step 4: Assistant asks about criteria
    {
      role: 'assistant',
      content: {
        text: 'Got it — you\'re looking to build patient cohorts for trial inclusion. Do you have specific eligibility criteria in mind, or would you like me to help identify relevant patient attributes?'
      }
    },

    // Step 5: User wants help identifying attributes
    {
      role: 'user',
      text: 'Help me identify the relevant attributes'
    },

    // Step 6: Assistant recommends dataset with fancy card
    {
      role: 'assistant',
      content: {
        text: `I found a dataset that looks perfect for your analysis:

<div style="background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 12px 0;">
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
    <div>
      <div style="font-weight: 600; color: #1a1a1a; font-size: 15px;">patient_demographics</div>
      <div style="font-size: 12px; color: #666; margin-top: 2px;">Owner: data_team • Updated 2 days ago</div>
    </div>
    <div style="background: #e8f4f3; color: #00a89c; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">RECOMMENDED</div>
  </div>

  <div style="display: flex; gap: 24px; margin-bottom: 12px;">
    <div style="text-align: center;">
      <div style="font-size: 20px; font-weight: 700; color: #1a1a1a;">10,861</div>
      <div style="font-size: 11px; color: #666;">Records</div>
    </div>
    <div style="text-align: center;">
      <div style="font-size: 20px; font-weight: 700; color: #1a1a1a;">12</div>
      <div style="font-size: 11px; color: #666;">Columns</div>
    </div>
    <div style="text-align: center;">
      <div style="font-size: 20px; font-weight: 700; color: #1a1a1a;">98%</div>
      <div style="font-size: 11px; color: #666;">Complete</div>
    </div>
  </div>

  <div style="margin-bottom: 8px; font-size: 12px; color: #666;">Age Distribution</div>
  <div style="display: flex; align-items: flex-end; gap: 2px; height: 32px;">
    <div style="flex: 1; background: #00a89c; height: 40%; border-radius: 2px 2px 0 0;"></div>
    <div style="flex: 1; background: #00a89c; height: 65%; border-radius: 2px 2px 0 0;"></div>
    <div style="flex: 1; background: #00a89c; height: 100%; border-radius: 2px 2px 0 0;"></div>
    <div style="flex: 1; background: #00a89c; height: 85%; border-radius: 2px 2px 0 0;"></div>
    <div style="flex: 1; background: #00a89c; height: 70%; border-radius: 2px 2px 0 0;"></div>
    <div style="flex: 1; background: #00a89c; height: 45%; border-radius: 2px 2px 0 0;"></div>
    <div style="flex: 1; background: #00a89c; height: 25%; border-radius: 2px 2px 0 0;"></div>
  </div>
  <div style="display: flex; justify-content: space-between; font-size: 10px; color: #999; margin-top: 2px;">
    <span>18</span><span>35</span><span>50</span><span>65</span><span>80+</span>
  </div>
</div>

Key attributes for trial eligibility: age, gender, diagnosis codes (ICD-10), lab results, and treatment history.

Would you like me to create a Flow using this dataset?`
      }
    },

    // Step 7: User confirms
    {
      role: 'user',
      text: 'Yes, let\'s do that'
    },

    // Step 8: Assistant creates flow
    {
      role: 'assistant',
      content: {
        text: 'I\'ve created a new project called <strong>Patient Cohort Analysis</strong> with the patient_demographics dataset. I\'ve set up an initial Flow to help you explore and filter the data. <a href="#" style="color: #00a89c;">Open project →</a>'
      }
    }
  ]
};

console.log('[HomePageConfig] Loaded ' + window.homePageChatConfig.conversation.length + ' conversation steps');
