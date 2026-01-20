# Clinical Trial Enrollment Pipeline

## Overview

This pipeline identifies eligible clinical trial candidates by combining patient demographics, lab results, and clinical notes, then scoring patients by their likelihood to enroll and complete the trial.

## Data Discovery

I started by looking for patient data that could help our trial coordinators find eligible candidates. I found a **patient_demographics** dataset in the Clinical Operations project with about 12,400 records—it had patient IDs, ages, locations, and contact info.

I checked the age distribution and saw the median was 58 years old, with 70% of patients falling between 45 and 72. That's a good fit for our Phase III oncology trials, so I decided to use this as my base dataset.

## Enriching with Clinical Data

Next I needed to enrich this with clinical information. I searched for related datasets and found three that could join on `patient_id`:

| Dataset | Records | Contents |
|---------|---------|----------|
| lab_results | 45,000 | Blood panels, biomarkers, test dates |
| clinical_notes | 28,000 | Free-text physician notes, visit summaries |
| trial_history | 8,500 | Prior trial participation and outcomes |

I decided to pull in the lab results and clinical notes first—the trial history could come later if needed.

## Joining the Data

I created a left join on `patient_id` to combine all three datasets. The join gave me **11,200 matched records**, which meant I lost about 1,200 patients who didn't have corresponding lab or notes data—acceptable for now.

## Extracting Structure from Messy Notes

Looking at the joined data, I noticed the `clinical_notes` column was messy—free-text physician notes with inconsistent formatting, abbreviations, and spelling variations. I needed to extract two key pieces of information:

- **Prior treatments** each patient had received
- **Contraindications** documented in their records

Rather than trying to write regex patterns for all the variations, I used an LLM extraction step in a prepare recipe. The LLM handled the messiness well—it successfully extracted structured data from **94% of the records**.

## Data Quality Review

Before moving on, I reviewed the data quality and noticed some missing values in the lab results. I fixed a few outliers manually.

## Building the Prediction Model

Now I had clean, enriched patient data. The next question was: *which patients are most likely to actually enroll and complete a trial?*

I decided to build a predictive model using `enrollment_success` as the target. I ran AutoML and let it evaluate multiple algorithms. The winner was a **gradient boosted tree with 84% accuracy**.

### Top Predictors

1. **Prior trial participation** — patients who've done trials before are more likely to do them again
2. **Distance to site**
3. **Contraindication count**
4. **Age**
5. **Recent lab values**

I deployed the model to my flow as a scoring recipe, so now every patient record has an `enrollment_likelihood` score.

## Automation

To keep this pipeline fresh, I set up an automation scenario that triggers whenever the source `patient_demographics` or `lab_results` datasets are updated. It rebuilds the entire pipeline and notifies me if anything fails.

## Sharing & Access

I shared the scored dataset with:

- **Trial Enrollment Assistant agent** — uses the data to recommend candidates to coordinators
- **Clinical Ops team** — reviews candidate lists

## Coordinator Webapp

Finally, I built a simple webapp for our coordinators. They needed a way to look up individual patients, see their enrollment score, and review their clinical notes and lab results.

The webapp includes:
- Patient search by ID
- Visual indicator for enrollment likelihood
- Bar chart of lab values
- Clinical notes display

I set it up with reader authorization so coordinators can access it without additional permissions.
