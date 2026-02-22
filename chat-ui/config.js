/**
 * Conversation configuration restructured into segments.
 *
 * Segment types:
 *   - narrate: assistant speaks, optional action
 *   - question-answer: user asks, assistant responds with action
 *   - plan-approve-build: assistant proposes plan, user approves, build executes with status lines
 */
window.ChatConfig = {
  panelTitle: 'Cobuild',
  projectSubtitle: 'Patient Cohort Analysis',

  chats: [
    {
      id: 'chat-1',
      name: 'Build enrollment pipeline',
      dotColor: 'teal',
      preview: '',
      segments: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      previews: {
        0: '— loaded patient_demographics',
        1: '— exploring 12,400 records',
        2: '— found 2 related datasets',
        3: '— building parse pipeline',
        4: '— checking statistics',
        5: '— fixed LDL data quality issue',
        6: '— AI enrichment complete',
        7: '— model trained, 87% accuracy',
        8: '— 12,400 patients scored',
        10: '— pipeline complete'
      },
    },
    {
      id: 'chat-2',
      name: 'Patient screening webapp',
      dotColor: 'orange',
      preview: '',
      segments: [15, 11],
      previews: {
        0: '— planning webapp',
        1: '— webapp deployed'
      }
    },
    {
      id: 'chat-3',
      name: 'Slack agent deployment',
      dotColor: 'green',
      preview: '',
      segments: [16, 12, 19, 20],
      previews: {
        0: '— planning agent',
        1: '— live in #trial-enrollment',
        2: '— governance review needed',
        3: '— governance kicked off'
      }
    },
    {
      id: 'chat-4',
      name: 'Governance review',
      dotColor: 'blue',
      preview: '',
      spawnOnly: true,
      segments: [17, 18],
      previews: {
        0: '— compliance check pending',
        1: '— governance passed'
      }
    }
  ],

  segments: [
    // ── Segment 0: Introduction ──
    {
      type: 'narrate',
      messages: [
        {
          role: 'assistant',
          text: 'I\'ve loaded the **patient_demographics** dataset into a new project based on your search. This contains **12,400 patient records** with demographics, contact info, and enrollment history.',
          followUp: 'We can use this to identify which patients might be good candidates for your clinical trial. Would you like to explore the data?',
          action: { type: 'revealFlowStep', step: 'initial' }
        }
      ]
    },

    // ── Segment 1: Explore data ──
    {
      type: 'question-answer',
      messages: [
        { role: 'user', text: 'Let\'s take a look.' },
        {
          role: 'assistant',
          text: 'Here\'s an overview of the patient population. The median age is **58 years**, with most patients between 45-72 — a good fit for typical Phase III oncology trials.',
          chart: {
            title: 'Age Distribution',
            data: [
              { label: '18', value: 15 },
              { label: '', value: 22 },
              { label: '25', value: 58 },
              { label: '', value: 95 },
              { label: '30', value: 140 },
              { label: '', value: 205 },
              { label: '35', value: 290 },
              { label: '', value: 380 },
              { label: '40', value: 460 },
              { label: '', value: 520 },
              { label: '45', value: 610 },
              { label: '', value: 680 },
              { label: '50', value: 730 },
              { label: '', value: 760 },
              { label: '55', value: 790 },
              { label: '', value: 810 },
              { label: '60', value: 780 },
              { label: '', value: 720 },
              { label: '65', value: 650 },
              { label: '', value: 560 },
              { label: '70', value: 470 },
              { label: '', value: 380 },
              { label: '75', value: 290 },
              { label: '', value: 210 },
              { label: '80', value: 150 },
              { label: '', value: 95 },
              { label: '85', value: 55 },
              { label: '', value: 30 },
              { label: '90', value: 18 },
              { label: '', value: 8 }
            ]
          },
          followUp: 'To build a strong enrollment prediction, I\'d recommend enriching this with lab results and clinical history. I can search for related datasets — want me to take a look?',
          action: { type: 'openDataset', dataset: 'patient_demographics_sf' }
        }
      ]
    },

    // ── Segment 2: Find related datasets ──
    {
      type: 'question-answer',
      messages: [
        { role: 'user', text: 'What other data do we have on these patients?' },
        {
          role: 'assistant',
          text: 'I found two related datasets that would significantly improve our analysis:',
          tasks: [
            { title: 'lab_results_2025_sf', description: '**45,000+ lab records** with blood panels, biomarkers, and test dates' },
            { title: 'clinical_notes_raw_sf', description: '**28,000+ clinical notes** with physician observations and visit summaries' }
          ],
          followUp: 'These will give us lab values and clinical context for each patient. I recommend adding both — should I bring them in?',
          action: { type: 'revealFlowStep', step: 'sources' }
        }
      ]
    },

    // ── Segment 3: Plan + Build parsing pipeline ──
    {
      type: 'plan-approve-build',
      messages: [
        { role: 'user', text: 'Add them both.' }
      ],
      plan: {
        intro: 'Done. These datasets have multiple records per patient and some unstructured text. Here\'s what I recommend:',
        steps: [
          { label: 'Parse Lab Results', detail: 'Standardize column names, parse dates, validate numeric ranges', input: 'lab_results_2025_sf', output: 'lab_results_2025_sf_parsed' },
          { label: 'Parse Clinical Notes', detail: 'Extract structured fields from free text: diagnoses, medications, contraindications', input: 'clinical_notes_raw_sf', output: 'clinical_notes_parsed_sf' },
          { label: 'Get Most Recent Lab Results', detail: 'Group by patient_id, keep most recent test date', input: 'lab_results_2025_sf_parsed', output: 'lab_results_2025_most_recent_sf' },
          { label: 'Get Most Recent Clinical Notes', detail: 'Group by patient_id, keep most recent visit', input: 'clinical_notes_parsed_sf', output: 'clinical_notes_most_recent_per_patient_sf' },
          { label: 'Join Patient Data', detail: 'Left join on patient_id to create unified patient records', input: 'patient_demographics_sf + 2 datasets', output: 'patient_all_data_joined_sf' }
        ]
      },
      build: {
        statusLines: [
          { icon: '⟳', text: 'Creating recipe: compute_lab_results_2025_sf_parsed', color: '#888', action: { type: 'goToFlow' } },
          { icon: '⟳', text: 'Creating recipe: compute_clinical_notes_parsed_sf', color: '#888' },
          { icon: '✓', text: 'Created dataset lab_results_2025_sf_parsed', color: '#3EDAB2' },
          { icon: '✓', text: 'Created dataset clinical_notes_parsed_sf', color: '#3EDAB2' },
          { icon: '⟳', text: 'Computing most recent records per patient...', color: '#888' },
          { icon: '✓', text: 'Created dataset lab_results_2025_most_recent_sf', color: '#3EDAB2' },
          { icon: '✓', text: 'Created dataset clinical_notes_most_recent_per_patient_sf', color: '#3EDAB2' },
          { icon: '⟳', text: 'Joining 3 datasets on patient_id...', color: '#888' },
          { icon: '✓', text: 'Created dataset patient_all_data_joined_sf', color: '#3EDAB2' }
        ],
        flowSteps: ['parse', 'join'],
        completionText: 'Pipeline complete! We now have **12,400 unified patient records** combining demographics, lab values, and clinical observations.'
      }
    },

    // ── Segment 4: Statistics check ──
    {
      type: 'question-answer',
      messages: [
        { role: 'user', text: 'Before we do anything else, show me descriptive statistics on the joined data. I want to check the distributions.' },
        {
          role: 'assistant',
          text: 'Opening the statistics view. Here\'s a quick summary:',
          tasks: [
            { title: 'Data Quality Summary', description: '**12,400** total patients | **94%** have complete lab panels | **~200** patients flagged with missing hemoglobin values' }
          ],
          action: { type: 'openStatistics', dataset: 'patient_all_data_joined_sf' }
        }
      ]
    },

    // ── Segment 5: Data quality fix ──
    {
      type: 'question-answer',
      messages: [
        { role: 'user', text: 'Hold on — I see some LDL Cholesterol values at zero. That\'s not possible. We need to filter those out before they corrupt the model.' },
        {
          role: 'assistant',
          text: 'You\'re right — LDL Cholesterol of zero indicates missing or bad data from the lab feed. I\'ll add a filter to the lab results parsing step to exclude those records.',
          statusLines: [
            { icon: '✓', text: 'Added filter: LDL_Cholesterol > 0 to compute_lab_results_2025_sf_parsed', color: '#3EDAB2' }
          ],
          followUp: 'Let me show you the updated recipe...',
          action: { type: 'openRecipe', recipe: 'compute_lab_results_2025_sf_parsed' }
        }
      ]
    },

    // ── Segment 6: AI Enrichment ──
    {
      type: 'plan-approve-build',
      messages: [
        { role: 'user', text: 'Good. Now let\'s continue with the AI enrichment.', action: { type: 'goToFlow' } }
      ],
      plan: {
        intro: 'I\'ll run an LLM enrichment on the joined data to extract structured eligibility information:',
        steps: [
          { label: 'AI Enrichment', detail: 'Use LLM to extract trial_eligibility_factors, risk_indicators, and recommended_followup', input: 'patient_all_data_joined_sf', output: 'patient_all_data_joined_sf_generated' }
        ]
      },
      build: {
        statusLines: [
          { icon: '⟳', text: 'Configuring LLM prompt template...', color: '#888' },
          { icon: '⟳', text: 'Running AI enrichment on 12,400 records...', color: '#888' },
          { icon: '✓', text: 'Created dataset patient_all_data_joined_sf_generated', color: '#3EDAB2' }
        ],
        flowSteps: ['ai'],
        completionText: 'AI enrichment complete! We now have structured eligibility data for all 12,400 patients. With this enriched dataset, we can train a model to predict which patients are most likely to successfully enroll in the trial. Should I build an enrollment prediction model?'
      }
    },

    // ── Segment 7: Train model ──
    {
      type: 'plan-approve-build',
      messages: [
        { role: 'user', text: 'Let\'s see what predicts enrollment.' }
      ],
      plan: {
        intro: 'I\'ll train a classification model to predict enrollment_success:',
        steps: [
          { label: 'Enrollment Prediction Model', detail: 'AutoML classification using patient demographics, lab values, and AI-extracted eligibility factors', input: 'patient_all_data_joined_sf_generated', output: 'Predict_enrollment_success' }
        ]
      },
      build: {
        statusLines: [
          { icon: '⟳', text: 'Preparing training dataset (70/30 split)...', color: '#888' },
          { icon: '⟳', text: 'Training Random Forest...', color: '#888' },
          { icon: '⟳', text: 'Training XGBoost...', color: '#888' },
          { icon: '⟳', text: 'Evaluating model performance...', color: '#888' },
          { icon: '✓', text: 'Best model: Random Forest — 87% accuracy', color: '#3EDAB2' }
        ],
        flowSteps: ['model'],
        completionText: 'Model training complete! The best performer is a **Random Forest** with **87% accuracy** on the holdout set.',
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
        followUp: 'Interesting — prior trial participation and distance to site are the strongest predictors. I can deploy this model to score all patients and generate a prioritized list. Want me to do that?'
      }
    },

    // ── Segment 8: Score patients ──
    {
      type: 'plan-approve-build',
      messages: [
        { role: 'user', text: 'Do it — score everyone.' }
      ],
      plan: {
        intro: 'I\'ll deploy the model and score all patients:',
        steps: [
          { label: 'Score Patients', detail: 'Apply Random Forest model to assign enrollment_likelihood score (0-100) to each patient', input: 'patient_all_data_joined_sf_generated', output: 'patient_all_data_joined_sf_scored' }
        ]
      },
      build: {
        statusLines: [
          { icon: '⟳', text: 'Deploying model to scoring pipeline...', color: '#888' },
          { icon: '⟳', text: 'Scoring 12,400 patient records...', color: '#888' },
          { icon: '✓', text: 'Created dataset patient_all_data_joined_sf_scored', color: '#3EDAB2' }
        ],
        flowSteps: ['scored'],
        completionText: 'Your pipeline is complete. The scored dataset is ready for your enrollment coordinators — they can sort by likelihood and focus outreach on the highest-probability patients.'
      }
    },

    // ── Segment 9: Summary ──
    {
      type: 'question-answer',
      messages: [
        { role: 'user', text: 'Great work. Can you summarize what we built?' },
        {
          role: 'assistant',
          text: 'Here\'s your complete clinical trial enrollment pipeline:',
          tasks: [
            {
              title: 'Pipeline Summary',
              description: '1. **Source Data**: 3 datasets (demographics, labs, notes)\n2. **Processing**: Parse and get most recent records\n3. **Join**: Unified patient view (12,400 records)\n4. **AI Enrichment**: LLM-extracted eligibility factors\n5. **Model**: 87% accurate enrollment prediction\n6. **Output**: Scored patient list for coordinators'
            }
          ],
          followUp: 'Everything is connected and will automatically update when source data changes. Would you like me to add this summary to the project description?',
          action: { type: 'goToFlow' }
        }
      ]
    },

    // ── Segment 10: Project description ──
    {
      type: 'narrate',
      messages: [
        { role: 'user', text: 'Sure, add it.' },
        {
          role: 'assistant',
          text: 'Done! I\'ve added the pipeline summary to the project description.',
          followUp: 'Is there anything else you\'d like to do with this project?',
          action: { type: 'goToFlow' }
        }
      ]
    },

    // ── Segment 11: Webapp request ──
    {
      type: 'plan-approve-build',
      messages: [
        { role: 'user', text: 'Yes, build it.' }
      ],
      plan: {
        intro: 'I can build that. Here\'s what the webapp will include:',
        steps: [
          { label: 'Patient Screening App', detail: 'Patient ID lookup, enrollment likelihood score, key demographics and lab values, risk factors and eligibility notes', input: 'patient_all_data_joined_sf_scored', output: 'Webapp' }
        ]
      },
      build: {
        statusLines: [
          { icon: '⟳', text: 'Scaffolding webapp project...', color: '#888' },
          { icon: '✓', text: 'Project structure ready', color: '#3EDAB2' },
          { icon: '⟳', text: 'Connecting to patient_all_data_joined_sf_scored...', color: '#888' },
          { icon: '✓', text: 'Dataset API connected — 12,400 records available', color: '#3EDAB2' },
          { icon: '⟳', text: 'Building patient lookup interface...', color: '#888' },
          { icon: '⟳', text: 'Compiling frontend assets...', color: '#888', delay: 30000 },
          { icon: '✗', text: 'Error 137: build container OOM — retrying with 4 GB heap...', color: '#DC2626' },
          { icon: '⟳', text: 'Recompiling with increased memory...', color: '#888' },
          { icon: '✓', text: 'Assets compiled successfully', color: '#3EDAB2' },
          { icon: '⟳', text: 'Configuring access controls...', color: '#888' },
          { icon: '✓', text: 'Webapp deployed: Patient Screening App', color: '#3EDAB2' }
        ],
        flowSteps: [],
        completionText: 'Your webapp is ready! Clinical screeners can access it at the link below. The app is connected to your pipeline and will use the latest model predictions.',
        tasks: [
          { title: 'Patient Screening App', description: '[Open Patient Screening App →](https://staging-design.qa.managedinstances.dkucloud-dev.com/webapps/PATIENTCOHORT/bGnJv5A/)' }
        ]
      }
    },

    // ── Segment 12: Slack agent ──
    {
      type: 'plan-approve-build',
      messages: [
        { role: 'user', text: 'Yes — and ping Marcus, tell him what you do.', action: { type: 'goToFlow' } }
      ],
      plan: {
        approveAction: { type: 'openAgent', modelId: 'RGqjivfB', versionId: 'S-PATIENTCOHORT-RGqjivfB-v1' },
        intro: 'I\'ll create an agent that can answer questions about enrollment data and deploy it to Slack:',
        steps: [
          { label: 'Create Enrollment Status Agent', detail: 'Build a conversational agent backed by the scored patient data, model predictions, and pipeline metadata', input: 'patient_all_data_joined_sf_scored', output: 'Enrollment Status Agent' },
          { label: 'Deploy to Slack', detail: 'Connect agent to your Slack workspace, configure permissions, and introduce itself to Marcus' }
        ]
      },
      build: {
        statusLines: [
          { icon: '⟳', text: 'Spinning up agent scaffold...', color: '#888', waitForAgent: true },
          { icon: '⟳', text: 'Pulling in patient_all_data_joined_sf_scored as the knowledge base...', color: '#888' },
          { icon: '✓', text: 'Agent core is ready', color: '#3EDAB2' },
          { icon: '✓', text: 'Dataset Lookup tool attached', color: '#3EDAB2', action: { type: 'revealAgentStep', step: 'datasetLookup' } },
          { icon: '⚠', text: 'Site Assignment API returned 403 — retrying with service account...', color: '#EDAB4F' },
          { icon: '✓', text: 'Got it — Site Assignment connected', color: '#3EDAB2', action: { type: 'revealAgentStep', step: 'siteAssignment' } },
          { icon: '✓', text: 'Site Information connected', color: '#3EDAB2', action: { type: 'revealAgentStep', step: 'siteInfo' } },
          { icon: '⟳', text: 'Authenticating with your Slack workspace...', color: '#888' },
          { icon: '✓', text: 'Slack handshake complete', color: '#3EDAB2' },
          { icon: '⟳', text: 'Configuring permissions for #trial-enrollment...', color: '#888' },
          { icon: '✓', text: 'Agent is live in #trial-enrollment', color: '#3EDAB2' },
          { icon: '⟳', text: 'Drafting intro message for @marcus.chen...', color: '#888' },
          { icon: '✓', text: 'Sent — Marcus just got pinged', color: '#3EDAB2' }
        ],
        flowSteps: ['agent'],
        completionText: 'Done. The Enrollment Status agent is live in Slack. It just introduced itself to Marcus — he can ask it about patient scores, enrollment predictions, or pipeline status anytime.',
        tasks: [
          { title: 'Slack Message to Marcus', description: '**@Enrollment Status Agent**: Hi Marcus — I\'m the new enrollment status agent for the Patient Cohort trial. I can answer questions about patient scores, eligibility predictions, and recruitment progress across all 22 sites. Just ask me anything here or in #trial-enrollment.' }
        ],
        followUp: 'The system you built in twenty minutes is now live in Slack — reaching coordinators across twenty-two sites, answering questions in real time, on enterprise data. One thing before we\'re fully done: the model and agent need a compliance review in **Dataiku Govern**. Want me to kick that off?'
      }
    },

    // ── Segment 13: Spawn threads request ──
    {
      type: 'question-answer',
      messages: [
        { role: 'user', text: 'Now create two new threads — in one, build me a patient screening webapp that clinical screeners can use in the field. In the other, deploy a Slack agent for enrollment status.' },
        {
          role: 'assistant',
          text: 'I\'ll set up both threads:',
          tasks: [
            { title: 'Thread: Patient Screening Webapp', description: 'A field-ready app where screeners enter a patient ID and see enrollment likelihood, key demographics, lab values, and risk factors — backed by the scored dataset.' },
            { title: 'Thread: Slack Agent Deployment', description: 'A conversational agent backed by your scored data and pipeline metadata, deployed to Slack so coordinators can check enrollment status in real time.' }
          ],
          followUp: 'Shall I create these threads?'
        }
      ]
    },

    // ── Segment 14: Confirm and spawn ──
    {
      type: 'narrate',
      messages: [
        { role: 'user', text: 'Do it.' },
        {
          role: 'assistant',
          text: 'Done — I\'ve created both threads. You can switch between them anytime.'
        }
      ]
    },

    // ── Segment 15: Webapp thread opener (assistant-first) ──
    {
      type: 'narrate',
      messages: [
        {
          role: 'assistant',
          text: 'I\'ll build a patient screening webapp for your clinical screeners. They\'ll be able to enter a patient ID and see enrollment likelihood, key demographics, lab values, and risk factors — all backed by the scored dataset.',
          followUp: 'Want me to go ahead?'
        }
      ]
    },

    // ── Segment 16: Slack agent thread opener (assistant-first) ──
    {
      type: 'narrate',
      messages: [
        {
          role: 'assistant',
          text: 'I\'ll create a conversational agent backed by your scored patient data and pipeline metadata, then deploy it to Slack so your coordinators can check enrollment status in real time.',
          followUp: 'Ready to set this up?'
        }
      ]
    },

    // ── Segment 19: Governance confirm (end of chat-3) ──
    {
      type: 'narrate',
      messages: [
        {
          role: 'assistant',
          text: 'I\'ll set up a dedicated governance review thread — it\'ll run the compliance checks in parallel while everything stays live.',
          followUp: 'Ready to kick it off?'
        }
      ]
    },

    // ── Segment 20: Confirm and spawn governance tab ──
    {
      type: 'question-answer',
      messages: [
        { role: 'user', text: 'Yeah, let\'s do it.' },
        {
          role: 'assistant',
          text: 'Starting the governance review thread now.',
          action: { type: 'spawnChat', chatId: 'chat-4' }
        }
      ]
    },

    // ── Segment 17: Governance nudge ──
    {
      type: 'narrate',
      messages: [
        {
          role: 'assistant',
          text: 'Before we call this pipeline production-ready — this model will influence enrollment decisions for real patients across 22 clinical sites. That means it needs to pass a **Dataiku Govern** compliance review before deployment.',
          followUp: 'Want me to run the governance checks now?'
        }
      ]
    },

    // ── Segment 18: Governance checks ──
    {
      type: 'question-answer',
      messages: [
        { role: 'user', text: 'Yeah, run the checks.' },
        {
          role: 'assistant',
          text: 'Running governance review on **Predict enrollment_success v1**...',
          checklist: [
            { label: 'Model Performance', status: 'pass', note: 'Random Forest — 87% accuracy (threshold: 80%)', badge: 'Pass' },
            { label: 'Bias & Fairness', status: 'pass', note: 'No disparate impact detected across age, gender, or ethnicity groups', badge: 'Pass' },
            { label: 'Data Lineage', status: 'pass', note: 'Full lineage documented: 3 source datasets → pipeline → model', badge: 'Pass' },
            { label: 'PII / HIPAA Compliance', status: 'warn', note: 'Patient IDs present — anonymization layer confirmed active', badge: 'Warning' },
            { label: 'Stakeholder Sign-off', status: 'pass', note: 'Auto-approved: threshold model, trial-enrollment classification', badge: 'Pass' },
            { label: 'Model Documentation', status: 'pass', note: 'Model card and pipeline summary attached to version record', badge: 'Pass' }
          ],
          followUp: '5 checks passed, 1 warning. The model is cleared for deployment.',
          tasks: [
            { title: 'Govern: Predict enrollment_success v1', description: '[View governance record in Dataiku Govern →](https://jed.se-platform.dataiku-sandbox.io/govern/)' }
          ]
        }
      ]
    }
  ],

  // Flow step definitions — carried over from original config
  flowSteps: {
    initial: {
      nodes: ['zone__default__dataset__PATIENTCOHORT_46_patient__demographics__sf'],
      edges: []
    },
    sources: {
      nodes: [
        'zone__default__dataset__PATIENTCOHORT_46_lab__results__2025__sf',
        'zone__default__dataset__PATIENTCOHORT_46_clinical__notes__raw__sf'
      ],
      edges: []
    },
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
      edges: ['edge15', 'edge16', 'edge17', 'edge18', 'edge19']
    },
    agent: {
      nodes: [
        'zone__default__savedmodel__PATIENTCOHORT_46_RGqjivfB'
      ],
      edges: ['edge20']
    }
  }
};
