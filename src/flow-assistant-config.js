/**
 * Flow Assistant Fake Chat - Configuration
 *
 * Clinical Trial Enrollment Pipeline Demo
 * Matches the actual PATIENTCOHORT flow structure
 *
 * Paste this into the browser console BEFORE the main script.
 */

window.fakeChatConfig = {
  panelTitle: 'Patient Cohort Analysis',

  conversation: [
    // ========================================
    // STEP 1: Assistant introduces the project (from semantic search)
    // ========================================
    {
      role: 'assistant',
      content: {
        intro: 'I\'ve loaded the <strong>patient_demographics</strong> dataset into a new project based on your search. This contains <strong>10,861 patient records</strong> with demographics, contact info, and enrollment history.',
        tasks: [],
        footer: 'We can use this to identify which patients might be good candidates for your clinical trial. Would you like to explore the data?',
        action: {
          type: 'revealFlowStep',
          step: 'initial'
        }
      }
    },

    // ========================================
    // STEP 2: User wants to explore the data
    // ========================================
    {
      role: 'user',
      text: 'Let\'s take a look.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Here\'s an overview of the patient population. The median age is <strong>58 years</strong>, with most patients between 45-72—a good fit for typical Phase III oncology trials.',
        chart: {
          title: 'Age Distribution',
          unit: '%',
          data: [
            { label: '18-34', value: 8 },
            { label: '35-44', value: 12 },
            { label: '45-54', value: 22 },
            { label: '55-64', value: 28 },
            { label: '65-72', value: 20 },
            { label: '73+', value: 10 }
          ]
        },
        tasks: [],
        footer: 'To build a strong enrollment prediction, I\'d recommend enriching this with lab results and clinical history. I can search for related datasets—want me to take a look?',
        action: {
          type: 'openDataset',
          dataset: 'patient_demographics_sf'
        }
      }
    },

    // ========================================
    // STEP 3: User confirms, assistant finds related data
    // ========================================
    {
      role: 'user',
      text: 'What other data do we have on these patients?'
    },
    {
      role: 'assistant',
      content: {
        intro: 'I found two related datasets that would significantly improve our analysis:',
        tasks: [
          {
            title: 'lab_results_2025_sf',
            inputs: [],
            outputs: [],
            description: '<strong>45,000+ lab records</strong> with blood panels, biomarkers, and test dates'
          },
          {
            title: 'clinical_notes_raw_sf',
            inputs: [],
            outputs: [],
            description: '<strong>28,000+ clinical notes</strong> with physician observations and visit summaries'
          }
        ],
        footer: 'These will give us lab values and clinical context for each patient. I recommend adding both—should I bring them in?',
        action: {
          type: 'revealFlowStep',
          step: 'sources'
        }
      }
    },

    // ========================================
    // STEP 4: User confirms, assistant explains processing plan
    // ========================================
    {
      role: 'user',
      text: 'Add them both.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Done. Now, these datasets have multiple records per patient and some unstructured text. Here\'s what I recommend for combining them:',
        tasks: [
          {
            title: 'Parse Lab Results',
            inputs: ['lab_results_2025_sf'],
            outputs: ['lab_results_2025_sf_parsed'],
            description: 'Standardize column names, parse dates, and validate numeric ranges'
          },
          {
            title: 'Parse Clinical Notes',
            inputs: ['clinical_notes_raw_sf'],
            outputs: ['clinical_notes_parsed_sf'],
            description: 'Extract structured fields from free text: <span style="color:#28a9dd">diagnoses</span>, <span style="color:#28a9dd">medications</span>, <span style="color:#28a9dd">contraindications</span>'
          }
        ],
        footer: 'I\'ll also aggregate to get the most recent record per patient, then join everything together. Ready to build this pipeline?',
        action: {
          type: 'goToFlow'
        }
      }
    },

    // ========================================
    // STEP 5: User confirms, assistant builds pipeline
    // ========================================
    {
      role: 'user',
      text: 'Go ahead.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Building the pipeline now. I\'m creating:',
        tasks: [
          {
            title: 'Get Most Recent Lab Results',
            inputs: ['lab_results_2025_sf_parsed'],
            outputs: ['lab_results_2025_most_recent_sf'],
            description: 'Group by <span style="color:#28a9dd">patient_id</span>, keep most recent test date'
          },
          {
            title: 'Get Most Recent Clinical Notes',
            inputs: ['clinical_notes_parsed_sf'],
            outputs: ['clinical_notes_most_recent_per_patient_sf'],
            description: 'Group by <span style="color:#28a9dd">patient_id</span>, keep most recent visit'
          },
          {
            title: 'Join Patient Data',
            inputs: ['patient_demographics_sf', 'lab_results_2025_most_recent_sf', 'clinical_notes_most_recent_per_patient_sf'],
            outputs: ['patient_all_data_joined_sf'],
            description: 'Left join on <span style="color:#28a9dd">patient_id</span> to create unified patient records'
          }
        ],
        footer: '',
        action: {
          type: 'revealFlowStep',
          step: 'parse'
        }
      }
    },

    // ========================================
    // STEP 6: Pipeline complete
    // ========================================
    {
      role: 'assistant',
      content: {
        intro: 'Pipeline complete! We now have <strong>10,861 unified patient records</strong> combining demographics, lab values, and clinical observations.',
        tasks: [],
        footer: '',
        action: {
          type: 'revealFlowStep',
          step: 'join'
        }
      }
    },

    // ========================================
    // STEP 7: User asks for statistics
    // ========================================
    {
      role: 'user',
      text: 'Before we do anything else, show me descriptive statistics on the joined data. I want to check the distributions.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Opening the statistics view. Here\'s a quick summary:',
        tasks: [
          {
            title: 'Data Quality Summary',
            inputs: [],
            outputs: [],
            description: '• <strong>10,861</strong> total patients<br>• <strong>94%</strong> have complete lab panels<br>• <strong>~200</strong> patients flagged with missing hemoglobin values'
          }
        ],
        footer: '',
        action: {
          type: 'openStatistics',
          dataset: 'patient_all_data_joined_sf'
        }
      }
    },

    // ========================================
    // STEP 8: User catches data quality issue
    // ========================================
    {
      role: 'user',
      text: 'Hold on—I see some LDL Cholesterol values at zero. That\'s not possible. We need to filter those out before they corrupt the model.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'You\'re right—LDL Cholesterol of zero indicates missing or bad data from the lab feed. I\'ll add a filter to the lab results parsing step to exclude those records.',
        tasks: [
          {
            title: 'Filter Invalid Lab Results',
            inputs: ['lab_results_2025_sf'],
            outputs: ['lab_results_2025_sf_parsed'],
            description: 'Added filter: <span style="color:#28a9dd">LDL_Cholesterol > 0</span>'
          }
        ],
        footer: 'Let me show you the updated recipe...',
        action: {
          type: 'openRecipe',
          recipe: 'compute_lab_results_2025_sf_parsed'
        }
      }
    },

    // ========================================
    // STEP 9: User confirms, continue with AI enrichment
    // ========================================
    {
      role: 'user',
      text: 'Good. Now let\'s continue with the AI enrichment.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Running AI enrichment on the cleaned data:',
        tasks: [
          {
            title: 'AI Enrichment',
            inputs: ['patient_all_data_joined_sf'],
            outputs: ['patient_all_data_joined_sf_generated'],
            description: 'Use LLM to extract:<br>• <span style="color:#28a9dd">trial_eligibility_factors</span><br>• <span style="color:#28a9dd">risk_indicators</span><br>• <span style="color:#28a9dd">recommended_followup</span>'
          }
        ],
        footer: '',
        action: {
          type: 'goToFlow'
        }
      }
    },

    // ========================================
    // STEP 10: AI enrichment revealed in flow
    // ========================================
    {
      role: 'assistant',
      content: {
        intro: 'AI enrichment complete! We now have structured eligibility data for all 10,861 patients.',
        tasks: [],
        footer: 'With this enriched dataset, we can train a model to predict which patients are most likely to successfully enroll in the trial. Should I build an enrollment prediction model?',
        action: {
          type: 'revealFlowStep',
          step: 'ai'
        }
      }
    },

    // ========================================
    // STEP 11: User confirms, assistant trains model
    // ========================================
    {
      role: 'user',
      text: 'Let\'s see what predicts enrollment.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Training a classification model to predict <span style="color:#28a9dd">enrollment_success</span>:',
        tasks: [
          {
            title: 'Enrollment Prediction Model',
            inputs: ['patient_all_data_joined_sf_generated'],
            outputs: ['Predict_enrollment_success'],
            description: 'AutoML classification using:<br>• Patient demographics (age, location)<br>• Lab values (cholesterol, hemoglobin, etc.)<br>• AI-extracted eligibility factors'
          }
        ],
        footer: 'Training with AutoML to find the best algorithm...',
        action: {
          type: 'revealFlowStep',
          step: 'model'
        }
      }
    },

    // ========================================
    // STEP 12: Model results, suggest deployment
    // ========================================
    {
      role: 'assistant',
      content: {
        intro: 'Model training complete! The best performer is a <strong>Random Forest</strong> with <strong>87% accuracy</strong> on the holdout set.',
        chart: {
          title: 'Feature Importance',
          unit: 'importance',
          data: [
            { label: 'Prior Trials', value: 28 },
            { label: 'Distance', value: 22 },
            { label: 'Age', value: 18 },
            { label: 'Hemoglobin', value: 15 },
            { label: 'Risk Score', value: 12 }
          ]
        },
        tasks: [],
        footer: 'Interesting—prior trial participation and distance to site are the strongest predictors. I can deploy this model to score all patients and generate a prioritized list for your coordinators. Want me to do that?',
        action: {
          type: 'goToFlow'
        }
      }
    },

    // ========================================
    // STEP 13: User confirms scoring
    // ========================================
    {
      role: 'user',
      text: 'Do it—score everyone.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Done! I\'ve deployed the model and scored all patients:',
        tasks: [
          {
            title: 'Score Patients',
            inputs: ['patient_all_data_joined_sf_generated', 'Predict_enrollment_success'],
            outputs: ['patient_all_data_joined_sf_scored'],
            description: 'Each patient now has an <span style="color:#28a9dd">enrollment_likelihood</span> score from 0-100'
          }
        ],
        footer: 'Your pipeline is complete. The scored dataset is ready for your enrollment coordinators—they can sort by likelihood and focus outreach on the highest-probability patients.',
        action: {
          type: 'revealFlowStep',
          step: 'scored'
        }
      }
    },

    // ========================================
    // STEP 14: Final summary
    // ========================================
    {
      role: 'user',
      text: 'Great work. Can you summarize what we built?'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Here\'s your complete clinical trial enrollment pipeline:',
        tasks: [
          {
            title: 'Pipeline Summary',
            inputs: [],
            outputs: [],
            description: '1. <strong>Source Data</strong>: 3 datasets (demographics, labs, notes)<br>2. <strong>Processing</strong>: Parse and get most recent records<br>3. <strong>Join</strong>: Unified patient view (10,861 records)<br>4. <strong>AI Enrichment</strong>: LLM-extracted eligibility factors<br>5. <strong>Model</strong>: 87% accurate enrollment prediction<br>6. <strong>Output</strong>: Scored patient list for coordinators'
          }
        ],
        footer: 'Everything is connected and will automatically update when source data changes. Would you like me to add this summary to the project description so your team knows what this pipeline does?',
        action: {
          type: 'goToFlow'
        }
      }
    },

    // ========================================
    // STEP 15: User confirms project description
    // ========================================
    {
      role: 'user',
      text: 'Sure, add it.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Done! I\'ve added the pipeline summary to the project description.',
        tasks: [],
        footer: 'Is there anything else you\'d like to do with this project?',
        action: {
          type: 'goToFlow'
        }
      }
    },

    // ========================================
    // STEP 16: User requests webapp
    // ========================================
    {
      role: 'user',
      text: 'Actually yes—I want to create a simple webapp that clinical screeners can use in the field. They should be able to enter a patient ID and see whether that patient would be a good fit for the trial, along with some basic patient info.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'I can build that. I\'ll create a webapp with:',
        tasks: [
          {
            title: 'Patient Screening App',
            inputs: ['patient_all_data_joined_sf_scored', 'Predict_enrollment_success'],
            outputs: [],
            description: '• Patient ID lookup field<br>• Enrollment likelihood score with recommendation<br>• Key patient demographics and lab values<br>• Risk factors and eligibility notes'
          }
        ],
        footer: 'Building the webapp now...',
        action: {
          type: 'goToFlow'
        }
      }
    },

    // ========================================
    // STEP 17: Webapp complete
    // ========================================
    {
      role: 'assistant',
      content: {
        intro: 'Your webapp is ready! Clinical screeners can access it here:',
        tasks: [
          {
            title: 'Patient Screening App',
            inputs: [],
            outputs: [],
            description: '<a href="http://release-14-design.qa-deployments.dku.sh/webapps/PATIENTCOHORT/bGnJv5A/" target="_blank" style="color:#28a9dd;">Open Patient Screening App →</a>'
          }
        ],
        footer: 'The app is connected to your pipeline and will use the latest model predictions. You can share this link with your screening team.',
        action: {
          type: 'goToFlow'
        }
      }
    }
  ],

  // Flow step definitions for progressive reveal
  flowSteps: {
    // Initial state: only patient demographics (user came from semantic search)
    initial: {
      nodes: [
        'zone__default__dataset__PATIENTCOHORT_46_patient__demographics__sf'
      ],
      edges: []
    },
    // Add the other two source datasets
    sources: {
      nodes: [
        'zone__default__dataset__PATIENTCOHORT_46_lab__results__2025__sf',
        'zone__default__dataset__PATIENTCOHORT_46_clinical__notes__raw__sf'
      ],
      edges: []
    },
    // Parse + MostRecent combined (revealed together when building the pipeline)
    parse: {
      nodes: [
        'zone__default__recipe__compute__lab__results__2025__sf__parsed',
        'zone__default__dataset__PATIENTCOHORT_46_lab__results__2025__sf__parsed',
        'zone__default__recipe__compute__clinical__notes__parsed__sf',
        'zone__default__dataset__PATIENTCOHORT_46_clinical__notes__parsed__sf',
        'zone__default__recipe__compute__lab__results__2025__most__recent__sf',
        'zone__default__dataset__PATIENTCOHORT_46_lab__results__2025__most__recent__sf',
        'zone__default__recipe__compute__clinical__notes__most__recent__per__patient__sf',
        'zone__default__dataset__PATIENTCOHORT_46_clinical__notes__most__recent__per__patient__sf'
      ],
      edges: ['edge1', 'edge2', 'edge3', 'edge4', 'edge5', 'edge6', 'edge7', 'edge8']
    },
    join: {
      nodes: [
        'zone__default__recipe__compute__patient__all__data__joined__sf',
        'zone__default__dataset__PATIENTCOHORT_46_patient__all__data__joined__sf'
      ],
      edges: ['edge9', 'edge10', 'edge11', 'edge12']
    },
    ai: {
      nodes: [
        'zone__default__recipe__compute__patient__all__data__joined__sf__generated',
        'zone__default__dataset__PATIENTCOHORT_46_patient__all__data__joined__sf__generated'
      ],
      edges: ['edge13', 'edge14']
    },
    model: {
      nodes: [
        'zone__default__recipe__train__Predict__enrollment__success____binary__',
        'zone__default__savedmodel__PATIENTCOHORT_46_Lwq3ieVN'
      ],
      edges: ['edge18', 'edge19']
    },
    scored: {
      nodes: [
        'zone__default__recipe__score__patient__all__data__joined__sf',
        'zone__default__dataset__PATIENTCOHORT_46_patient__all__data__joined__sf__scored'
      ],
      edges: ['edge15','edge16','edge17', 'edge18', 'edge19']
    }
  },

  // Timing settings
  typingSpeed: 25,
  aiResponseDelay: 1000
};

console.log('[FakeChat] Clinical Trial Pipeline config loaded with', window.fakeChatConfig.conversation.length, 'messages');
