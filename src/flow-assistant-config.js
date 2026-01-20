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
    // STEP 1: Initial request - show source datasets
    // ========================================
    {
      role: 'user',
      text: 'I need to build a pipeline for clinical trial enrollment prediction. We have patient data, lab results, and clinical notes.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'I found three relevant datasets in this project that we can use:',
        tasks: [
          {
            title: 'patient_demographics_sf',
            inputs: [],
            outputs: [],
            description: '<strong>627 patients</strong> with demographics, contact info, and enrollment history'
          },
          {
            title: 'lab_results_2025_sf',
            inputs: [],
            outputs: [],
            description: '<strong>3,100+ lab records</strong> with blood panels, biomarkers, and test dates'
          },
          {
            title: 'clinical_notes_raw_sf',
            inputs: [],
            outputs: [],
            description: '<strong>1,800+ clinical notes</strong> with physician observations and visit summaries'
          }
        ],
        footer: 'Want me to show you the patient demographics? I can give you a quick overview of the population.',
        action: {
          type: 'revealFlowStep',
          step: 'sources'
        }
      }
    },

    // ========================================
    // STEP 2: Show demographics with histogram
    // ========================================
    {
      role: 'user',
      text: 'Yes, show me the patient data.'
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
        footer: 'The lab results and clinical notes will need some processing before we can join them—they have multiple records per patient and some unstructured text. Want me to set that up?',
        action: {
          type: 'openDataset',
          dataset: 'patient_demographics_sf'
        }
      }
    },

    // ========================================
    // STEP 3: Parse the raw data
    // ========================================
    {
      role: 'user',
      text: 'Yes, process the lab results and clinical notes.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'I\'ll create parsing recipes for both datasets. This will standardize the formats and extract structured fields from the clinical notes.',
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
        footer: 'Ready to create these recipes?',
        action: {
          type: 'goToFlow'
        }
      }
    },

    // ========================================
    // STEP 4: Confirm parsing, show parsed outputs
    // ========================================
    {
      role: 'user',
      text: 'Yes, create them.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Done! Both parsing recipes are running. Since patients have multiple lab tests and clinical visits over time, I\'ll also get the <strong>most recent record</strong> for each patient so we have one row per person for the join.',
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
          }
        ],
        footer: 'This will give us a clean one-to-one relationship for joining. Should I proceed?',
        action: {
          type: 'revealFlowStep',
          step: 'parse'
        }
      }
    },

    // ========================================
    // STEP 5: Create most recent and join
    // ========================================
    {
      role: 'user',
      text: 'Yes, and then join everything together.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Perfect. I\'ll create the aggregation recipes and then join all three data sources on <span style="color:#28a9dd">patient_id</span>.',
        tasks: [
          {
            title: 'Join Patient Data',
            inputs: ['patient_demographics_sf', 'lab_results_2025_most_recent_sf', 'clinical_notes_most_recent_per_patient_sf'],
            outputs: ['patient_all_data_joined_sf'],
            description: 'Left join on <span style="color:#28a9dd">patient_id</span> to create unified patient records with demographics, latest labs, and recent clinical notes'
          }
        ],
        footer: 'Building the pipeline now...',
        action: {
          type: 'revealFlowStep',
          step: 'mostRecent'
        }
      }
    },

    // ========================================
    // STEP 6: Join complete, offer data review
    // ========================================
    {
      role: 'assistant',
      content: {
        intro: 'The join is complete! We now have <strong>627 unified patient records</strong> combining demographics, lab values, and clinical observations.',
        tasks: [],
        footer: 'I\'d recommend reviewing the data quality before we build any models. Want me to open the statistics view?',
        action: {
          type: 'revealFlowStep',
          step: 'join'
        }
      }
    },

    // ========================================
    // STEP 7: Open statistics
    // ========================================
    {
      role: 'user',
      text: 'Yes, show me the statistics.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Opening the statistics worksheet. You can see distributions for all the lab values—LDL Cholesterol, Red Blood Cell Count, Potassium, Hemoglobin, and more.',
        tasks: [
          {
            title: 'Data Quality Summary',
            inputs: [],
            outputs: [],
            description: '• <strong>627</strong> total patients<br>• <strong>94%</strong> have complete lab panels<br>• <strong>12</strong> patients flagged with missing hemoglobin values'
          }
        ],
        footer: 'The data looks good overall. When you\'re ready, I can use AI to enrich this with additional insights from the clinical notes.',
        action: {
          type: 'openStatistics',
          dataset: 'patient_all_data_joined_sf'
        }
      }
    },

    // ========================================
    // STEP 8: AI enrichment
    // ========================================
    {
      role: 'user',
      text: 'Let\'s add the AI enrichment.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'I\'ll add an LLM prompt recipe to extract additional structured information from the clinical notes that might be useful for enrollment prediction.',
        tasks: [
          {
            title: 'AI Enrichment',
            inputs: ['patient_all_data_joined_sf'],
            outputs: ['patient_all_data_joined_sf_generated'],
            description: 'Use LLM to extract:<br>• <span style="color:#28a9dd">trial_eligibility_factors</span><br>• <span style="color:#28a9dd">risk_indicators</span><br>• <span style="color:#28a9dd">recommended_followup</span>'
          }
        ],
        footer: 'This will help the model understand nuances in the clinical notes that simple parsing might miss. Ready to run it?',
        action: {
          type: 'goToFlow'
        }
      }
    },

    // ========================================
    // STEP 9: Run AI, then build model
    // ========================================
    {
      role: 'user',
      text: 'Yes, run it. And then let\'s build the enrollment prediction model.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'AI enrichment complete! Now I\'ll train a model to predict <span style="color:#28a9dd">enrollment_success</span> using all the features we\'ve assembled.',
        tasks: [
          {
            title: 'Enrollment Prediction Model',
            inputs: ['patient_all_data_joined_sf_generated'],
            outputs: ['Predict_enrollment_success'],
            description: 'AutoML classification model using:<br>• Patient demographics (age, location)<br>• Lab values (cholesterol, hemoglobin, etc.)<br>• AI-extracted eligibility factors'
          }
        ],
        footer: 'Training with AutoML to find the best algorithm...',
        action: {
          type: 'revealFlowStep',
          step: 'ai'
        }
      }
    },

    // ========================================
    // STEP 10: Model results
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
        footer: 'Prior trial participation and distance to site are the strongest predictors. Want me to deploy this model to score all patients?',
        action: {
          type: 'revealFlowStep',
          step: 'model'
        }
      }
    },

    // ========================================
    // STEP 11: Deploy scoring
    // ========================================
    {
      role: 'user',
      text: 'Yes, deploy it and score everyone.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Model deployed! I\'ve created a scoring recipe that generates an <span style="color:#28a9dd">enrollment_likelihood</span> score for each patient.',
        tasks: [
          {
            title: 'Score Patients',
            inputs: ['patient_all_data_joined_sf_generated', 'Predict_enrollment_success'],
            outputs: ['patient_all_data_joined_sf_scored'],
            description: 'Each patient now has a score from 0-100 indicating their likelihood of successful enrollment'
          }
        ],
        footer: 'Your pipeline is complete! The scored dataset is ready for your enrollment coordinators.',
        action: {
          type: 'revealFlowStep',
          step: 'scored'
        }
      }
    },

    // ========================================
    // STEP 12: Final summary
    // ========================================
    {
      role: 'user',
      text: 'Great! Show me the full pipeline.'
    },
    {
      role: 'assistant',
      content: {
        intro: 'Here\'s your complete enrollment prediction pipeline:',
        tasks: [
          {
            title: 'Pipeline Summary',
            inputs: [],
            outputs: [],
            description: '1. <strong>Source Data</strong>: 3 datasets (demographics, labs, notes)<br>2. <strong>Processing</strong>: Parse and get most recent records<br>3. <strong>Join</strong>: Unified patient view (627 records)<br>4. <strong>AI Enrichment</strong>: LLM-extracted eligibility factors<br>5. <strong>Model</strong>: 87% accurate enrollment prediction<br>6. <strong>Output</strong>: Scored patient list ready for coordinators'
          }
        ],
        footer: 'Everything is connected and will automatically update when source data changes. Want me to set up any alerts or sharing permissions?',
        action: {
          type: 'goToFlow'
        }
      }
    }
  ],

  // Flow step definitions for progressive reveal
  flowSteps: {
    sources: {
      nodes: [
        'zone__default__dataset__PATIENTCOHORT_46_lab__results__2025__sf',
        'zone__default__dataset__PATIENTCOHORT_46_patient__demographics__sf',
        'zone__default__dataset__PATIENTCOHORT_46_clinical__notes__raw__sf'
      ],
      edges: []
    },
    parse: {
      nodes: [
        'zone__default__recipe__compute__lab__results__2025__sf__parsed',
        'zone__default__dataset__PATIENTCOHORT_46_lab__results__2025__sf__parsed',
        'zone__default__recipe__compute__clinical__notes__parsed__sf',
        'zone__default__dataset__PATIENTCOHORT_46_clinical__notes__parsed__sf'
      ],
      edges: ['edge3', 'edge4', 'edge7', 'edge8']
    },
    mostRecent: {
      nodes: [
        'zone__default__recipe__compute__lab__results__2025__most__recent__sf',
        'zone__default__dataset__PATIENTCOHORT_46_lab__results__2025__most__recent__sf',
        'zone__default__recipe__compute__clinical__notes__most__recent__per__patient__sf',
        'zone__default__dataset__PATIENTCOHORT_46_clinical__notes__most__recent__per__patient__sf'
      ],
      edges: ['edge1', 'edge2', 'edge5', 'edge6']
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
      edges: ['edge15', 'edge16']
    },
    scored: {
      nodes: [
        'zone__default__recipe__score__patient__all__data__joined__sf',
        'zone__default__dataset__PATIENTCOHORT_46_patient__all__data__joined__sf__scored'
      ],
      edges: ['edge17', 'edge18', 'edge19']
    }
  },

  // Timing settings
  typingSpeed: 25,
  aiResponseDelay: 1000
};

console.log('[FakeChat] Clinical Trial Pipeline config loaded with', window.fakeChatConfig.conversation.length, 'messages');
