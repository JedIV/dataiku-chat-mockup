/**
 * Flow Assistant Fake Chat - Configuration
 *
 * Clinical Trial Enrollment Agent Demo
 * Based on: Agentic Data Prep Demo - Scoping and Planning
 *
 * Paste this into the browser console BEFORE the main script.
 */

window.fakeChatConfig = {
  conversation: [
    // Opening request
    {
      role: 'user',
      text: 'I need to build a dataset for a trial enrollment agent. It should combine patient info with lab results and clinical notes so coordinators can find eligible candidates.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'I found a <em>patient_demographics</em> dataset in the Clinical Operations project that looks like a good starting point. It has <strong>12,400 records</strong> with patient ID, age, location, and contact info.',
        tasks: [
          {
            title: 'Patient Demographics',
            inputs: [],
            outputs: ['patient_demographics'],
            description: 'Source dataset with 12,400 patient records including <span style="color:#28a9dd">patient_id</span>, <span style="color:#28a9dd">age</span>, <span style="color:#28a9dd">location</span>, and contact information'
          }
        ],
        footer: 'Want to start with this one? I can show you a preview.'
      }
    },

    // Age distribution
    {
      role: 'user',
      text: 'Yes, show me a preview. What does the age distribution look like?'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Here\'s what I found: the median age is <strong>58 years</strong>. About 70% of patients fall between 45 and 72, which aligns well with typical Phase III oncology trial criteria. This looks like a solid foundation for your enrollment dataset.',
        tasks: [],
        footer: 'Would you like me to find related datasets with lab results and clinical notes?'
      }
    },

    // Finding additional datasets
    {
      role: 'user',
      text: 'Yes, I need to bring in lab results and clinical notes for these patients.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'I found three related datasets that can be joined on <span style="color:#28a9dd">patient_id</span>:',
        tasks: [
          {
            title: 'Lab Results',
            inputs: [],
            outputs: ['lab_results'],
            description: '<strong>45,000 records</strong> with blood panels, biomarkers, and test dates'
          },
          {
            title: 'Clinical Notes',
            inputs: [],
            outputs: ['clinical_notes'],
            description: '<strong>28,000 records</strong> with free-text physician notes and visit summaries'
          },
          {
            title: 'Prior Trial Participation',
            inputs: [],
            outputs: ['trial_history'],
            description: '<strong>8,500 records</strong> tracking previous enrollment history and outcomes'
          }
        ],
        footer: 'Which ones would you like to include?'
      }
    },

    // Selecting datasets and joining
    {
      role: 'user',
      text: 'Let\'s use the lab results and clinical notes. Join them to the patient dataset on patient_id.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'I\'ll create a join recipe to combine all three datasets on <span style="color:#28a9dd">patient_id</span>.',
        tasks: [
          {
            title: 'Join Datasets',
            inputs: ['patient_demographics', 'lab_results', 'clinical_notes'],
            outputs: ['patient_data_joined'],
            description: 'Left join on <span style="color:#28a9dd">patient_id</span> to combine demographics with lab results and clinical notes'
          }
        ],
        footer: 'Ready to create this flow?'
      }
    },

    // Confirm join results
    {
      role: 'user',
      text: 'Yes, create it.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Done! The join completed with <strong>11,200 matched records</strong>. I\'ve added the recipe to your flow.',
        tasks: [],
        footer: 'I noticed the clinical_notes column contains unstructured text. Would you like me to extract structured fields from it?'
      }
    },

    // LLM extraction from clinical notes
    {
      role: 'user',
      text: 'Yes, the clinical notes are messy. Can you extract prior treatments and any contraindications from the text?'
    },
    {
      role: 'assistant',
      content: {
        intro: 'I\'ll create a prepare recipe with an LLM step to extract structured data from the notes. The LLM will handle spelling variations, abbreviations, and different documentation styles.',
        tasks: [
          {
            title: 'Extract Clinical Entities',
            inputs: ['patient_data_joined'],
            outputs: ['patient_data_enriched'],
            description: 'Use LLM to extract <span style="color:#28a9dd">prior_treatments</span> and <span style="color:#28a9dd">contraindications</span> from the free-text <span style="color:#28a9dd">clinical_notes</span> column'
          }
        ],
        footer: 'Want me to run this on a sample first so you can review the extractions?'
      }
    },

    // Run sample
    {
      role: 'user',
      text: 'Yes, run it on a sample.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Sample extraction complete. The LLM successfully identified treatments and contraindications in <strong>94%</strong> of the records. Before we continue, I\'d recommend reviewing the data quality—I noticed some missing values in the lab results.',
        tasks: [],
        footer: 'Want me to open the statistics view so you can review?'
      }
    },

    // After data quality review, build model
    {
      role: 'user',
      text: 'I reviewed the data and fixed a few outliers. Now I want to predict which patients are most likely to enroll and complete the trial.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'I can build a predictive model for that. I\'ll use <span style="color:#28a9dd">enrollment_success</span> as the target and train on age, location, prior trial history, and the clinical factors we just extracted.',
        tasks: [
          {
            title: 'AutoML Training',
            inputs: ['patient_data_enriched'],
            outputs: ['enrollment_model'],
            description: 'Train classification model to predict enrollment likelihood using patient demographics, lab results, and extracted clinical factors'
          }
        ],
        footer: 'Want me to run AutoML? It\'ll evaluate multiple algorithms and select the best performer.'
      }
    },

    // AutoML results
    {
      role: 'user',
      text: 'Yes, run AutoML.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'AutoML complete! The best model is a <strong>gradient boosted tree</strong> with <strong>84% accuracy</strong>.',
        tasks: [
          {
            title: 'Top Predictors',
            inputs: [],
            outputs: [],
            description: '1. Prior trial participation<br>2. Distance to site<br>3. Contraindication count<br>4. Age<br>5. Recent lab values'
          }
        ],
        footer: 'The model looks solid. Want me to deploy it to your flow so you can score new patients?'
      }
    },

    // Deploy model
    {
      role: 'user',
      text: 'Looks good. Deploy it to the flow.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Model deployed! I\'ve added a scoring recipe to your flow.',
        tasks: [
          {
            title: 'Score Patients',
            inputs: ['patient_data_enriched', 'enrollment_model'],
            outputs: ['trial_candidates_scored'],
            description: 'Apply model to generate <span style="color:#28a9dd">enrollment_likelihood</span> score for each patient'
          }
        ],
        footer: 'Each patient record now has an enrollment likelihood score. Would you like to set up automation so this runs whenever the source data updates?'
      }
    },

    // Set up automation
    {
      role: 'user',
      text: 'Yes, set it up to run automatically whenever the source data updates.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Done! I\'ve created an automation scenario for you.',
        tasks: [
          {
            title: 'Automation Scenario',
            inputs: ['patient_demographics', 'lab_results'],
            outputs: ['trial_candidates_scored'],
            description: 'Triggers when <span style="color:#28a9dd">patient_demographics</span> or <span style="color:#28a9dd">lab_results</span> are updated. Rebuilds the full pipeline and notifies you if anything fails.'
          }
        ],
        footer: 'Your pipeline is now fully automated. Is there anything else you\'d like to configure?'
      }
    },

    // Share with team
    {
      role: 'user',
      text: 'Share the scored dataset with the trial enrollment agent and the clinical ops team.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Done! I\'ve updated the sharing settings:',
        tasks: [
          {
            title: 'Dataset Shared',
            inputs: [],
            outputs: ['trial_candidates_scored'],
            description: '• Trial Enrollment Assistant agent: <strong>read access</strong><br>• Clinical Ops group: <strong>read access</strong>'
          }
        ],
        footer: 'Your team can now access the scored patient list. The enrollment agent will use this to help coordinators identify and reach out to promising candidates.'
      }
    },

    // Request webapp
    {
      role: 'user',
      text: 'Build me a webapp where coordinators can look up individual patients, see their enrollment score, and view their clinical notes and lab results.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'I\'ll create a patient lookup webapp for your coordinators. It will include:',
        tasks: [
          {
            title: 'Patient Lookup Webapp',
            inputs: ['trial_candidates_scored'],
            outputs: ['patient_lookup_webapp'],
            description: '• Search by <span style="color:#28a9dd">patient_id</span><br>• Display enrollment likelihood score with visual indicator<br>• Show lab results chart and clinical notes<br>• Quick lookup buttons for sample patients'
          }
        ],
        footer: 'I\'ll use the scored dataset as the data source and set up reader authorization automatically. Ready to build it?'
      }
    },

    // Confirm webapp build
    {
      role: 'user',
      text: 'Yes, build it.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Building your webapp now...',
        tasks: [
          {
            title: 'Creating Components',
            inputs: [],
            outputs: [],
            description: '✓ Patient search interface<br>✓ Enrollment score visualization<br>✓ Lab results bar chart<br>✓ Clinical notes display<br>✓ Quick lookup sample IDs'
          }
        ],
        footer: 'Give me a moment to configure the data connections and deploy...'
      }
    },

    // Webapp complete with URL
    {
      role: 'user',
      text: 'How\'s it going?'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Done! Your webapp is live and ready to use. 🎉',
        tasks: [
          {
            title: 'Patient Lookup Webapp',
            inputs: ['trial_candidates_scored'],
            outputs: [],
            description: '<strong>Public URL:</strong><br><a href="#" style="color:#28a9dd;text-decoration:none;">http://release-14-design.qa-deployments.dku.sh/webapps/PATIENTCOHORT/bGnJv5A/view</a><br><br>• Reader authorization configured for <span style="color:#28a9dd">trial_candidates_scored</span><br>• No authentication required for internal access'
          }
        ],
        footer: 'Coordinators can now search for any patient and see their full enrollment profile. Want me to add any additional features?'
      }
    }
  ],

  // Timing settings
  typingSpeed: 25,        // slightly faster for longer demo
  aiResponseDelay: 1000   // a bit more pause for realism
};

console.log('[FakeChat] Clinical Trial Demo config loaded with', window.fakeChatConfig.conversation.length, 'messages');
