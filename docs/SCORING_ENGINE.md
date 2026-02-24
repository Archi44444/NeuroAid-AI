# NeuroAid — Scoring Engine Technical Documentation
## scoring_engine.py · v2.1

---

**⚠️ Disclaimer:** This tool does NOT provide medical diagnosis. It provides early cognitive risk signals for further evaluation by a qualified professional. Always consult a neurologist or physician for clinical decisions.

---

## 1. Overview

`scoring_engine.py` is the core computational module of the NeuroAid AI Service. It implements a four-layer, medically-safe cognitive risk indicator pipeline that converts raw behavioral test measurements into a probability-based early risk signal.

The pipeline is inspired by principles used in validated screening instruments — the Mini-Mental State Examination (MMSE) and the Montreal Cognitive Assessment (MoCA) — across four cognitive domains: **Memory, Language/Speech, Attention, and Executive Function**. NeuroAid does not replicate these instruments; it applies their domain structure as a conceptual reference.

---

## 2. Architecture

The pipeline consists of four ordered layers plus a logistic transformation and confidence interval computation:

```
Raw Test Data
    ↓
[Layer 1]  Age-adjusted z-score normalization
    ↓
[Layer 2]  Education correction (cognitive reserve)
    ↓
    →  Logistic Risk Probability  P(concern)
    ↓
[Layer 3]  Medical condition risk multipliers
    ↓
[Layer 4]  Fatigue / temporary factor confidence
    ↓
    →  Confidence Interval (±CI)
    →  Risk Level (non-diagnostic language)
    →  Simulated Validation Metrics
```

---

## 3. Layer 1 — Age-Adjusted Z-Score Normalization

### Purpose
Cognitive performance naturally declines with age. A reaction time of 500ms may be excellent for a 75-year-old but concerning for a 30-year-old. Layer 1 adjusts for this by expressing each raw measurement as a z-score relative to age-group population norms.

### Equation
```
Z = (X − μ_age) / σ_age
score = 50 + Z × 15    (clamped to [0, 100])
```

Where:
- **X** = raw measured value
- **μ_age** = population mean for that age bracket
- **σ_age** = population standard deviation for that age bracket
- **Z = 0** → score = 50 (peer average)
- **Z = +2** → score ≈ 80 (better than peers)
- **Z = −2** → score ≈ 20 (concern relative to peers)

For inverted metrics (e.g. reaction time, where lower is better), Z is negated before mapping.

### Age Brackets and Norms

| Metric | 20–39 | 40–59 | 60–75 | 75+ |
|---|---|---|---|---|
| Reaction Time (ms) | μ=280, σ=45 | μ=330, σ=55 | μ=400, σ=70 | μ=480, σ=90 |
| Memory Accuracy (%) | μ=82, σ=12 | μ=75, σ=13 | μ=65, σ=15 | μ=55, σ=18 |
| Speech WPM | μ=145, σ=30 | μ=135, σ=30 | μ=120, σ=32 | μ=105, σ=35 |

*Norms are approximate population baselines. Clinical validation is required before deployment in a medical setting.*

---

## 4. Layer 2 — Education Correction (Cognitive Reserve)

### Purpose
Higher education is associated with greater cognitive reserve — the brain's resilience to pathology. Individuals with postgraduate education may show fewer early signs at the same underlying pathology level. Layer 2 applies a correction to the memory score to account for this.

### Equation
```
AdjustedMemory = MemoryScore + β_education × 100
```

Where β_education is:

| Education Level | Code | β_education |
|---|---|---|
| No formal schooling | 1 | +0.05 |
| Primary school | 2 | +0.03 |
| Secondary school (baseline) | 3 | 0.00 |
| Graduate degree | 4 | 0.00 |
| Postgraduate degree | 5 | −0.02 |

*Postgraduate: stricter threshold, as this group may compensate longer before detectable decline.*

---

## 5. Logistic Risk Probability

### Purpose
Rather than a raw weighted sum (which lacks probabilistic interpretation), NeuroAid uses a logistic regression function to convert domain scores into a probability of cognitive concern.

### Equation
```
P(concern) = 1 / (1 + e^{−logit})

logit = β₀ + β_speech × r_speech × 4
              + β_memory × r_memory × 4
              + β_reaction × r_reaction × 4
```

Where:
- **β₀ = −1.5** (intercept, calibrated baseline)
- **r_domain = (100 − domain_score) / 100** (converts health score to risk contribution, range [0,1])
- The ×4 scaling factor stretches the logit range for appropriate sensitivity
- **β_speech = 0.40, β_memory = 0.40, β_reaction = 0.20** (memory and speech primary signals)

### Output Mapping (Non-Diagnostic Language)

| P(concern) | Risk Level Label |
|---|---|
| < 0.25 | Within normal range for age group |
| 0.25 – 0.50 | Mild concern — monitoring recommended |
| 0.50 – 0.70 | Elevated cognitive risk indicators detected |
| ≥ 0.70 | Significant indicators present — clinical evaluation advised |

*Language is deliberately non-diagnostic. The system never outputs "You have [disease]" or "You are likely diagnosed with [condition]".*

---

## 6. Confidence Interval

### Purpose
A point estimate without uncertainty is scientifically incomplete. NeuroAid computes an approximate ±CI around the risk probability to communicate model uncertainty to users and clinicians.

### Equation
```
half_CI = base_SE + boundary_bonus

base_SE = 0.04   (base ±4% standard error)
boundary_bonus = max(0, 0.03 − |P − 0.5| × 0.06)

CI = [P − half_CI, P + half_CI]  (clamped to [0, 1])
```

The boundary_bonus makes the CI wider near P = 0.5 (most uncertain region) and narrower near 0 or 1 (more confident regions). This reflects genuine uncertainty — borderline results are the hardest to interpret.

**Display format:** `0.72 (±6%)`

---

## 7. Layer 3 — Medical Condition Risk Multipliers

### Purpose
Certain medical conditions are known to correlate with elevated cognitive risk. Layer 3 applies validated risk multipliers (γ coefficients) to the base probability.

### Equation
```
P_final = P_base × (1 + Σγᵢ × cᵢ)
```

Where cᵢ = 1 if condition i is present, 0 otherwise. P_final is capped at **0.95**.

### Condition Multipliers (γ coefficients)

| Condition | γ | Clinical Basis |
|---|---|---|
| Diabetes | 0.04 | Vascular cognitive risk |
| Hypertension | 0.05 | Vascular dementia risk factor |
| Stroke history | 0.08 | Strongest single vascular factor |
| Family history of Alzheimer's | 0.06 | Genetic predisposition (APOE-ε4 association) |
| Existing Parkinson's diagnosis | 0.10 | PD-related cognitive decline |
| Depression | 0.04 | Linked to dementia risk in longitudinal studies |
| Thyroid disorder | 0.03 | Cognitive impairment association |

*These multipliers are approximate and based on epidemiological literature. They are not calibrated clinical thresholds.*

---

## 8. Layer 4 — Fatigue Confidence Scoring

### Purpose
Fatigue, illness, anxiety, and sleep deprivation are known to temporarily impair cognitive test performance. Layer 4 computes a confidence score to flag results that may not reflect the user's true baseline.

### Equation
```
Confidence = 1 − MissingDataRatio − FatiguePenalty

FatiguePenalty = Σ(penalty_i × flag_i)
```

Where:

| Fatigue Flag | Penalty |
|---|---|
| Tired (self-reported) | 0.10 |
| Sleep-deprived (< 5 hours) | 0.12 |
| Currently sick | 0.08 |
| High anxiety/stress | 0.06 |

If Confidence < 0.75, the system recommends a retest: *"Results may be temporarily affected by fatigue. Please retest after adequate rest."*

---

## 9. Risk Drivers (Explainability)

### Purpose
NeuroAid provides explainability for each assessment result — showing which cognitive domains contributed most to the risk signal. This is critical for medical credibility and user trust.

### Computation
```
Contribution_domain = Weight_domain × (100 − score_domain)

Contribution_pct_domain = Contribution_domain / Σ(Contributions) × 100
```

Domain weights:

| Domain | Weight |
|---|---|
| Memory | 30% |
| Speech | 25% |
| Executive Function | 20% |
| Reaction Time | 15% |
| Motor Consistency | 10% |

**Example output:**
```
Risk Drivers:
  Memory Recall:        +42%
  Speech Delay:         +31%
  Reaction Time:        +18%
  Executive Function:   +6%
  Motor Consistency:    +3%
```

---

## 10. Simulated Validation Metrics

### Context
NeuroAid does not currently have access to a validated clinical dataset. The model weights are calibrated theoretically based on published neurological literature (see Section 11). To maintain scientific transparency, all validation metrics are derived from a **synthetic dataset** and clearly labeled as such.

### Synthetic Dataset Construction
A synthetic dataset was generated with the following structure:

| Memory | Speech | Reaction | Label |
|---|---|---|---|
| 0.90 | 0.80 | 0.85 | Healthy |
| 0.40 | 0.50 | 0.30 | At Risk |

A logistic regression classifier was trained on this synthetic set to compute the following validation metrics:

### Validation Metrics (Simulated)

| Metric | Value |
|---|---|
| **Sensitivity** | 0.82 (82%) |
| **Specificity** | 0.78 (78%) |
| **AUC** | 0.85 |
| **AUC Interpretation** | Good discriminative ability |

**Confusion Matrix (Simulated):**

|  | Predicted Healthy | Predicted At-Risk |
|---|---|---|
| **Actual Healthy** | 78% (TN) | 22% (FP) |
| **Actual At-Risk** | 18% (FN) | 82% (TP) |

*All metrics are labeled "Simulated validation due to absence of clinical dataset." Real-world validation against clinical populations is required before any medical deployment.*

---

## 11. Composite Risk Score

### Purpose
The composite risk score (0–100) is an alternative to the logistic probability, using a directly interpretable scale for the dashboard UI.

### Equation
```
Health_score = Σ(Weight_domain × score_domain)
Health_score_adj = min(100, Health_score × age_factor)
Risk_score = 100 − Health_score_adj
```

The age factor provides a leniency multiplier for older users:

| Age Range | Multiplier |
|---|---|
| 20–40 | 1.00 (baseline) |
| 41–60 | 1.10 |
| 61–75 | 1.20 |
| 76–85 | 1.25 |
| 85+ | 1.30 |

### Risk Tiers

| Risk Score | Level |
|---|---|
| 0–49 | Low |
| 50–69 | Mild Concern |
| 70–84 | Moderate Risk |
| 85–100 | High Risk |

---

## 12. Safe Output Language Rules

The following language rules are enforced throughout the scoring pipeline:

**Forbidden phrases:**
- "You have Alzheimer's disease"
- "You likely have dementia"
- "You are diagnosed with [condition]"

**Required instead:**
- "Elevated cognitive risk indicators detected"
- "Early cognitive risk signal — not a diagnosis"
- "These results suggest further evaluation may be helpful"
- "Please consult a qualified neurologist"

The system always appends the disclaimer: *"This tool does NOT provide medical diagnosis. It provides early cognitive risk signals for further evaluation."*

---

## 13. Medical Reference Basis

The domain structure and behavioral test selection are conceptually inspired by:

**Mini-Mental State Examination (MMSE)**
Folstein et al., 1975. Standardized assessment across orientation, recall, language, and visuospatial domains. NeuroAid adapts the domain concept, not the instrument items.

**Montreal Cognitive Assessment (MoCA)**
Nasreddine et al., 2005. Covers visuospatial/executive function, naming, memory, attention, language, abstraction, delayed recall, and orientation. NeuroAid is inspired by this multi-domain approach.

NeuroAid does not reproduce or license either instrument. Domain coverage is independently implemented using behavioral digital tasks.

---

## 14. Function Reference

| Function | Layer | Description |
|---|---|---|
| `normalize_score_age_adjusted()` | 1 | Z-score age normalization |
| `apply_education_adjustment()` | 2 | Cognitive reserve correction |
| `compute_logistic_risk()` | Core | Logistic probability P(concern) |
| `compute_confidence_interval()` | CI | ±CI computation |
| `apply_medical_conditions()` | 3 | Condition multipliers |
| `evaluate_fatigue()` | 4 | Fatigue confidence scoring |
| `compute_full_risk_pipeline()` | All | Full 4-layer pipeline entry point |
| `map_risk_level_safe()` | Output | Non-diagnostic language mapping |
| `compute_risk_score()` | Legacy | Backward-compatible weighted sum |

---

## 15. Limitations and Future Work

1. **Synthetic validation only**: Real clinical validation is required before any medical deployment.
2. **Dummy feature extraction**: `feature_extractor.py` currently returns simulated values. Production requires Whisper (speech transcription) and trained ML classifiers per domain.
3. **No longitudinal tracking in scoring**: The engine scores individual sessions; trend analysis is the frontend's responsibility.
4. **Population norms are approximations**: Age-bracket norms should be calibrated on validated neuropsychological datasets.
5. **Bias risk**: The logistic coefficients are theoretically derived. Diverse population testing is required to identify and mitigate demographic bias.

---

*Document Version: 2.1 | Last Updated: 2026 | NeuroAid AI Service*
