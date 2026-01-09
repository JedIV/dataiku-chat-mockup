"""
Generate fake clinical trial datasets for the Agentic Data Prep Demo.

Datasets:
1. patient_demographics (~12,400 records)
2. lab_results_2024 (~45,000 records)
3. clinical_notes_raw (~28,000 records)

Usage:
    pip install faker pandas
    python generate_datasets.py
"""

import random
from datetime import datetime, timedelta
from faker import Faker
import pandas as pd

fake = Faker()
Faker.seed(42)
random.seed(42)

# Configuration
NUM_PATIENTS = 12400
NUM_LAB_RESULTS = 45000
NUM_CLINICAL_NOTES = 28000

# ============================================
# Dataset 1: patient_demographics
# ============================================
def generate_patient_demographics(num_patients):
    """Generate patient demographics dataset with enrollment_success that correlates with key predictors."""

    regions = ["Northeast", "Midwest", "Southwest", "Southeast", "West", "Pacific"]
    genders = ["Female", "Male", "Non-binary"]
    gender_weights = [0.48, 0.48, 0.04]
    contact_statuses = ["Active", "Inactive", "Deceased"]
    contact_weights = [0.85, 0.12, 0.03]

    records = []
    for i in range(num_patients):
        patient_id = f"PT-2024-{i:05d}"

        # Age distribution: median ~58, range 18-95, concentrated 45-72
        age = int(random.gauss(58, 12))
        age = max(18, min(95, age))

        # Generate predictors
        site_distance_km = round(random.expovariate(1/25) + 1, 1)  # Most close, some far
        enrollment_history = random.choices([0, 1, 2, 3, 4], weights=[0.6, 0.25, 0.1, 0.04, 0.01])[0]

        # Contraindication count (will be used for model correlation)
        contraindication_count = random.choices([0, 1, 2, 3], weights=[0.5, 0.3, 0.15, 0.05])[0]

        # Generate enrollment_success with correlation to key predictors:
        # - Higher enrollment_history -> higher success
        # - Lower site_distance_km -> higher success
        # - Lower contraindication_count -> higher success
        base_prob = 0.5
        prob_adjustment = (
            enrollment_history * 0.15 +          # +15% per prior enrollment
            (1 if site_distance_km < 20 else -0.1 if site_distance_km < 40 else -0.2) +  # Distance effect
            (-0.15 * contraindication_count)     # -15% per contraindication
        )
        success_prob = max(0.1, min(0.95, base_prob + prob_adjustment))
        enrollment_success = 1 if random.random() < success_prob else 0

        records.append({
            "patient_id": patient_id,
            "age": age,
            "gender": random.choices(genders, weights=gender_weights)[0],
            "region": random.choice(regions),
            "site_distance_km": site_distance_km,
            "contact_status": random.choices(contact_statuses, weights=contact_weights)[0],
            "enrollment_history": enrollment_history,
            "contraindication_count": contraindication_count,
            "last_visit_date": fake.date_between(start_date="-2y", end_date="today").isoformat(),
            "enrollment_success": enrollment_success
        })

    return pd.DataFrame(records)


# ============================================
# Dataset 2: lab_results_2024
# ============================================
def generate_lab_results(num_results, patient_ids):
    """Generate lab results dataset with realistic medical test data.

    Includes 2-3 obvious data entry errors that Sarah can fix manually during the demo.
    """

    # Test definitions: (test_type, test_name, unit, ref_low, ref_high, typical_mean, typical_std)
    tests = [
        # CBC Panel
        ("CBC", "White Blood Cell Count", "K/uL", 4.5, 11.0, 7.5, 2.0),
        ("CBC", "Red Blood Cell Count", "M/uL", 4.0, 5.5, 4.7, 0.5),
        ("CBC", "Hemoglobin", "g/dL", 12.0, 17.0, 14.0, 1.5),
        ("CBC", "Hematocrit", "%", 36.0, 50.0, 42.0, 4.0),
        ("CBC", "Platelet Count", "K/uL", 150.0, 400.0, 250.0, 50.0),

        # CMP Panel
        ("CMP", "Glucose", "mg/dL", 70.0, 100.0, 95.0, 20.0),
        ("CMP", "Creatinine", "mg/dL", 0.7, 1.3, 1.0, 0.3),
        ("CMP", "BUN", "mg/dL", 7.0, 20.0, 14.0, 4.0),
        ("CMP", "Sodium", "mEq/L", 136.0, 145.0, 140.0, 3.0),
        ("CMP", "Potassium", "mEq/L", 3.5, 5.0, 4.2, 0.4),
        ("CMP", "ALT", "U/L", 7.0, 56.0, 25.0, 15.0),
        ("CMP", "AST", "U/L", 10.0, 40.0, 22.0, 10.0),

        # Lipid Panel
        ("Lipid Panel", "Total Cholesterol", "mg/dL", 0.0, 200.0, 195.0, 40.0),
        ("Lipid Panel", "LDL Cholesterol", "mg/dL", 0.0, 100.0, 115.0, 35.0),
        ("Lipid Panel", "HDL Cholesterol", "mg/dL", 40.0, 60.0, 50.0, 12.0),
        ("Lipid Panel", "Triglycerides", "mg/dL", 0.0, 150.0, 140.0, 60.0),

        # HbA1c
        ("HbA1c", "Hemoglobin A1c", "%", 4.0, 5.6, 5.8, 1.2),

        # Thyroid
        ("Thyroid Panel", "TSH", "mIU/L", 0.4, 4.0, 2.0, 1.2),
        ("Thyroid Panel", "Free T4", "ng/dL", 0.8, 1.8, 1.2, 0.3),
    ]

    records = []

    # Plant obvious data entry errors for Sarah to fix during demo
    # These are clearly wrong values that stand out
    obvious_errors = [
        # Creatinine of 150 when normal is 0.7-1.3 (likely meant 1.50)
        {"test_type": "CMP", "test_name": "Creatinine", "result_value": 150.0, "result_unit": "mg/dL",
         "reference_low": 0.7, "reference_high": 1.3, "flag": "Critical"},
        # Hemoglobin of 140 when normal is 12-17 (likely meant 14.0)
        {"test_type": "CBC", "test_name": "Hemoglobin", "result_value": 140.0, "result_unit": "g/dL",
         "reference_low": 12.0, "reference_high": 17.0, "flag": "Critical"},
        # Glucose of 9500 when normal is 70-100 (likely meant 95)
        {"test_type": "CMP", "test_name": "Glucose", "result_value": 9500.0, "result_unit": "mg/dL",
         "reference_low": 70.0, "reference_high": 100.0, "flag": "Critical"},
    ]

    # Add the obvious errors first
    for error in obvious_errors:
        records.append({
            "patient_id": random.choice(patient_ids),
            "test_date": fake.date_between(start_date="-1y", end_date="today").isoformat(),
            **error
        })

    # Generate the rest of the records
    for _ in range(num_results - len(obvious_errors)):
        patient_id = random.choice(patient_ids)
        test = random.choice(tests)
        test_type, test_name, unit, ref_low, ref_high, mean, std = test

        # Generate result value - mostly normal, some abnormal
        if random.random() < 0.15:  # 15% abnormal
            if random.random() < 0.5:
                result_value = ref_low - abs(random.gauss(0, std))  # Low
            else:
                result_value = ref_high + abs(random.gauss(0, std))  # High
        else:
            result_value = random.gauss(mean, std * 0.5)

        result_value = round(max(0, result_value), 1)

        # Determine flag
        if result_value < ref_low:
            flag = "Low" if result_value >= ref_low * 0.7 else "Critical"
        elif result_value > ref_high:
            flag = "High" if result_value <= ref_high * 1.3 else "Critical"
        else:
            flag = "Normal"

        records.append({
            "patient_id": patient_id,
            "test_date": fake.date_between(start_date="-1y", end_date="today").isoformat(),
            "test_type": test_type,
            "test_name": test_name,
            "result_value": result_value,
            "result_unit": unit,
            "reference_low": ref_low,
            "reference_high": ref_high,
            "flag": flag
        })

    # Shuffle so errors aren't at the top
    random.shuffle(records)
    return pd.DataFrame(records)


# ============================================
# Dataset 3: clinical_notes_raw
# ============================================
def generate_clinical_notes(num_notes, patient_ids):
    """Generate messy clinical notes with realistic medical text."""

    note_types = ["Progress Note", "Consultation", "Discharge Summary", "Follow-up", "Initial Assessment"]

    # Templates with intentional typos and abbreviations
    note_templates = [
        # Hypertension notes
        "Pt presents w/ hx of hypertension, prev tx w/ {med1} discontinued d/t {side_effect}. Currently on {med2}. No known {typo_allergies}. {trial_history}",
        "{age} yo {gender} w/ HTN, well controlled on current regimen. BP {bp} today. Continue {med1}. {typo_follow} in 3 months.",
        "Hypertensive urgency - BP {bp_high}. Pt reports medication non-adherance. Restarted {med1}, added {med2}. {typo_eligible} for HYPER-2024 study.",

        # Diabetes notes
        "{age} yo {gender} w/ Type 2 DM, on {dm_med} {dm_dose} BID. Contraindications: {contraindication}. Prior treatments incl {prior_med} (d/c for {dc_reason}).",
        "DM follow up. HbA1c {hba1c}%. {typo_patient} tolerating current regimen. Discussed diet modifications. {trial_mention}",
        "Uncontrolled T2DM despite max dose metformin. Adding {dm_med2}. {typo_eligible} for GLUCOSE-001 trial pending insurance auth.",

        # Oncology notes
        "Follow up visit. Patient tolerated {typo_previous} chemo well. No new {typo_symptoms}. Labs reviewed - ANC recovered. {typo_eligible2} for continued treatment. Note: pt has {contraindication2} - {typo_contraindication} for {excluded_procedure}.",
        "Cycle {cycle_num} of {chemo_regimen}. Grade 2 {side_effect2}. Dose reduction discussed. {typo_patient} prefers to continue full dose. Next scan in {weeks} weeks.",
        "Oncology consult for {cancer_type}. Stage {stage}. Discussed treatment options. {typo_recommend} enrollment in {trial_name} trial. Pt {decision}.",

        # Cardiology notes
        "Hx: CAD s/p CABG {year}, CHF (EF {ef}%), CKD stage {ckd_stage}. Current meds: {cardiac_meds}. CONTRAINDICATED for nephrotoxic agents. {trial_history2}",
        "Cardiac clearance for {procedure}. EKG shows {ekg_finding}. Echo {ef2}% EF. {typo_cleared} for procedure. Note: {pacer_note}",
        "CHF exacerbation - {typo_patient} with {weight_gain} lb weight gain, increased {typo_edema}. Diuretics adjusted. {typo_follow} in 1 week.",

        # General/Other
        "New patient eval. PMHx: {conditions}. Medications reviewed - no interactions. {typo_patient} interested in clinical trials for {interest_condition}.",
        "Annual wellness visit. {age} yo {gender} in good health. Vaccines updated. {typo_screening} scheduled. No acute concerns.",
        "Referral from PCP for {specialty} evaluation. {typo_reviewed} outside records. Assessment: {assessment}. Plan: {plan}",
    ]

    # Replacement values
    meds = ["lisinopril 10mg", "amlodipine 5mg", "metoprolol 25mg", "losartan 50mg", "hydrochlorothiazide 12.5mg"]
    dm_meds = ["metformin 1000mg", "metformin 500mg", "glipizide 5mg", "januvia 100mg"]
    dm_meds2 = ["trulicity", "ozempic", "jardiance", "farxiga"]
    side_effects = ["persistent cough", "dizziness", "fatigue", "GI upset", "ankle swelling"]
    contraindications = ["sulfa allergy", "hx of angioedema", "renal impairment", "liver disease", "pregnancy"]
    contraindications2 = ["pacemaker", "metal implant", "claustrophobia", "contrast allergy", "bleeding disorder"]
    chemo_regimens = ["FOLFOX", "FOLFIRI", "carboplatin/paclitaxel", "R-CHOP", "pembrolizumab"]
    cancer_types = ["NSCLC", "breast cancer", "colorectal cancer", "lymphoma", "melanoma"]
    cardiac_meds = ["carvedilol, furosemide, atorvastatin", "metoprolol, lisinopril, aspirin", "diltiazem, warfarin, digoxin"]
    conditions = ["HTN, DM, hyperlipidemia", "COPD, CAD, CKD", "RA, osteoporosis, anxiety", "depression, obesity, sleep apnea"]

    # Typo variations
    typos = {
        "typo_allergies": ["allergeis", "allergies", "alergies", "allergys"],
        "typo_follow": ["Follow up", "Followup", "F/u", "Follow-up"],
        "typo_eligible": ["Eligible", "Eligibile", "Elligible", "eligible"],
        "typo_eligible2": ["Eligible", "Eligibile", "Elligible", "eligible"],
        "typo_patient": ["Patient", "Pt", "Patietn", "patient"],
        "typo_previous": ["previous", "previus", "prior", "prev"],
        "typo_symptoms": ["symptoms", "symtpoms", "sxs", "symptms"],
        "typo_contraindication": ["contraindication", "contrindication", "contra-indication", "CI"],
        "typo_recommend": ["Recommend", "Reccomend", "Recomend", "recommend"],
        "typo_cleared": ["Cleared", "Cleard", "cleared", "OK'd"],
        "typo_edema": ["edema", "oedema", "swelling", "edma"],
        "typo_screening": ["Screening", "Screenings", "screening", "Screeening"],
        "typo_reviewed": ["Reviewed", "Reviwed", "reviewed", "Rev"],
    }

    trial_histories = [
        "Prev enrolled in CARD-2022 trial, completed full protocol.",
        "Previous trial: withdrew from HEART-001 due to transportation issues.",
        "No prior trial participation.",
        "Enrolled in 2 previous studies - good compliance.",
        "Screen failed for ONCO-2023 (abnormal LFTs).",
        "",
        ""
    ]

    records = []
    num_providers = 50
    provider_ids = [f"DR-{i:04d}" for i in range(num_providers)]

    for _ in range(num_notes):
        patient_id = random.choice(patient_ids)
        template = random.choice(note_templates)

        # Fill in template
        note_text = template.format(
            med1=random.choice(meds),
            med2=random.choice(meds),
            dm_med=random.choice(dm_meds),
            dm_med2=random.choice(dm_meds2),
            dm_dose="1000mg" if random.random() > 0.5 else "500mg",
            side_effect=random.choice(side_effects),
            side_effect2=random.choice(["nausea", "fatigue", "neuropathy", "mucositis"]),
            contraindication=random.choice(contraindications),
            contraindication2=random.choice(contraindications2),
            excluded_procedure=random.choice(["MRI-based studies", "contrast CT", "certain chemo agents"]),
            prior_med=random.choice(dm_meds2),
            dc_reason=random.choice(["hypoglycemia", "insurance denial", "GI intolerance", "cost"]),
            age=random.randint(35, 85),
            gender=random.choice(["M", "F"]),
            bp=f"{random.randint(115, 135)}/{random.randint(70, 85)}",
            bp_high=f"{random.randint(170, 200)}/{random.randint(100, 120)}",
            hba1c=round(random.uniform(5.5, 9.5), 1),
            cycle_num=random.randint(1, 8),
            chemo_regimen=random.choice(chemo_regimens),
            cancer_type=random.choice(cancer_types),
            stage=random.choice(["IIA", "IIB", "IIIA", "IIIB", "IV"]),
            trial_name=random.choice(["KEYNOTE-999", "ONCOLOGY-2024", "BEACON-3", "IMMUNOBOOST"]),
            decision=random.choice(["agrees to enrollment", "declines - wants more time", "will discuss with family"]),
            year=random.randint(2015, 2022),
            ef=random.randint(25, 55),
            ef2=random.randint(30, 65),
            ckd_stage=random.randint(2, 4),
            cardiac_meds=random.choice(cardiac_meds),
            procedure=random.choice(["surgery", "colonoscopy", "cardiac cath", "biopsy"]),
            ekg_finding=random.choice(["NSR", "afib", "LBBB", "normal sinus rhythm"]),
            pacer_note=random.choice(["no pacemaker", "ICD in place", "pacemaker - MRI conditional"]),
            weight_gain=random.randint(3, 12),
            weeks=random.randint(4, 12),
            conditions=random.choice(conditions),
            interest_condition=random.choice(["diabetes", "hypertension", "cancer prevention", "arthritis"]),
            specialty=random.choice(["cardiology", "oncology", "endocrinology", "rheumatology"]),
            assessment=random.choice(["stable", "improved", "requires intervention", "monitoring"]),
            plan=random.choice(["continue current management", "start new medication", "order additional testing", "refer to specialist"]),
            trial_history=random.choice(trial_histories),
            trial_history2=random.choice(trial_histories),
            trial_mention=random.choice(["", "Discussed DIABETES-2024 trial.", "May be candidate for research study."]),
            **{k: random.choice(v) for k, v in typos.items()}
        )

        records.append({
            "patient_id": patient_id,
            "note_date": fake.date_between(start_date="-1y", end_date="today").isoformat(),
            "provider_id": random.choice(provider_ids),
            "note_type": random.choice(note_types),
            "note_text": note_text
        })

    return pd.DataFrame(records)


# ============================================
# Main
# ============================================
def main():
    print("Generating clinical trial datasets...")

    # Generate patient demographics first (we need patient IDs for other datasets)
    print(f"\n1. Generating patient_demographics ({NUM_PATIENTS:,} records)...")
    patient_df = generate_patient_demographics(NUM_PATIENTS)
    patient_ids = patient_df["patient_id"].tolist()
    patient_df.to_csv("patient_demographics.csv", index=False)
    print(f"   Saved: patient_demographics.csv")
    print(f"   Age distribution: mean={patient_df['age'].mean():.1f}, median={patient_df['age'].median()}")
    print(f"   Enrollment success rate: {patient_df['enrollment_success'].mean()*100:.1f}%")
    print(f"   Contraindication counts: {patient_df['contraindication_count'].value_counts().sort_index().to_dict()}")

    # Generate lab results
    print(f"\n2. Generating lab_results_2024 ({NUM_LAB_RESULTS:,} records)...")
    lab_df = generate_lab_results(NUM_LAB_RESULTS, patient_ids)
    lab_df.to_csv("lab_results_2024.csv", index=False)
    print(f"   Saved: lab_results_2024.csv")
    print(f"   Flag distribution: {lab_df['flag'].value_counts().to_dict()}")
    # Show the planted obvious errors
    obvious = lab_df[lab_df['result_value'].isin([150.0, 140.0, 9500.0])]
    print(f"   Planted {len(obvious)} obvious data entry errors for manual correction")

    # Generate clinical notes
    print(f"\n3. Generating clinical_notes_raw ({NUM_CLINICAL_NOTES:,} records)...")
    notes_df = generate_clinical_notes(NUM_CLINICAL_NOTES, patient_ids)
    notes_df.to_csv("clinical_notes_raw.csv", index=False)
    print(f"   Saved: clinical_notes_raw.csv")
    print(f"   Note types: {notes_df['note_type'].value_counts().to_dict()}")

    print("\n✓ All datasets generated successfully!")
    print(f"\nSummary:")
    print(f"  - patient_demographics.csv: {len(patient_df):,} records")
    print(f"  - lab_results_2024.csv: {len(lab_df):,} records")
    print(f"  - clinical_notes_raw.csv: {len(notes_df):,} records")


if __name__ == "__main__":
    main()
