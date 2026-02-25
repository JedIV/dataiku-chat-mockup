/**
 * Home Page Chat Configuration
 *
 * Define the scripted conversation for the Home/Task Hub page demo.
 * Load this file BEFORE home-page-fake-chat.js
 */

window.homePageChatConfig = {
  typingSpeed: 30,
  aiResponseDelay: 800,

  conversation: [
    // Step 1: User describes the problem
    {
      role: 'user',
      text: 'Our trial recruitment managers are overwhelmed by managing so many sites. They need something on their phones that shows real-time site status, scores candidates, and tells them where to shift outreach.'
    },

    // Step 2: Assistant thinks, then presents workstream cards
    {
      role: 'assistant',
      content: {
        thinking: [
          '12,400 patients across 22 sites — need to score by enrollment likelihood...',
          'Raw data won\'t help coordinators — need a scored, prioritized list...',
          'Field coordinators need a lookup tool, not a dashboard...',
          'Marcus needs real-time status on the go — Slack agent is the right fit...',
          'Three workstreams: enrollment pipeline, patient screening app, Slack agent'
        ],
        preamble: 'This is a classic three-layer problem — data, tooling, and access. Here\'s what I\'d build:',
        cards: [
          {
            icon: '<span class="material-symbols-sharp" style="font-size: 20px;">analytics</span>',
            title: 'Enrollment Prediction Pipeline',
            description: 'Join patient records, lab results, and clinical notes. Train a model to score each patient by enrollment likelihood.'
          },
          {
            icon: '<span class="material-symbols-sharp" style="font-size: 20px;">smartphone</span>',
            title: 'Patient Screening App',
            description: 'A field-ready tool for coordinators to look up patients, see their scores, and prioritize outreach.'
          },
          {
            icon: '<span class="material-symbols-sharp" style="font-size: 20px;">chat</span>',
            title: 'Slack Enrollment Agent',
            description: 'Let Marcus and site managers ask about enrollment status, candidate scores, and pipeline health — wherever they are.'
          }
        ],
        footer: 'Should I kick off all three?'
      }
    },

    // Step 3: User confirms
    {
      role: 'user',
      text: 'Do it.'
    },

    // Step 4: Assistant investigates available data
    {
      role: 'assistant',
      content: {
        thinking: [
          'Scanning data catalog for patient-related datasets...',
          'Found 3 patient datasets with overlapping patient_id keys...',
          'lab_results has the most records — good coverage...',
          'clinical_notes will give us unstructured signal for enrichment...',
          'Also found a sites table — 22 locations, useful for the agent...'
        ],
        preamble: 'Found four datasets that look like a strong foundation for this:',
        chart: {
          title: 'Records available',
          bars: [
            { label: 'patient_demographics', value: 12400, unit: '12.4k' },
            { label: 'lab_results_2025', value: 45000, unit: '45k' },
            { label: 'clinical_notes_raw', value: 28000, unit: '28k' },
            { label: 'sites', value: 22, unit: '22' }
          ]
        },
        footer: 'They cover demographics, lab panels, clinical history, and site locations with enrollment status data — everything we need. Want me to build on top of these?'
      }
    },

    // Step 5: User confirms datasets
    {
      role: 'user',
      text: 'Yeah, use those.'
    },

    // Step 6: Assistant kicks off workstreams, drops project link
    {
      role: 'assistant',
      content: {
        text: 'On it. Spinning up three workstreams...',
        log: [
          'Enrollment Prediction Pipeline — started',
          'Patient Screening App — started',
          'Slack Enrollment Agent — started'
        ],
        footer: 'I\'ve set up a project to house all three — we\'ll build them out there. <a href="https://staging-design.qa.managedinstances.dkucloud-dev.com/projects/PATIENTCOHORT/flow/" style="color: #3EDAB2; font-weight: 500;">Open project →</a>'
      }
    }
  ]
};

console.log('[HomePageConfig] Loaded ' + window.homePageChatConfig.conversation.length + ' conversation steps');
