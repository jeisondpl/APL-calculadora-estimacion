# Evaluation Methods

## Evaluation Metrics

### Automated Metrics

| Metric | Purpose | Best For |
|--------|---------|----------|
| **BLEU** | N-gram overlap with reference | Translation, short factual answers |
| **ROUGE** | Recall-oriented overlap | Summarization |
| **BERTScore** | Semantic similarity via embeddings | Paraphrase detection, meaning preservation |
| **Perplexity** | Model confidence in output | Fluency assessment |
| **F1 / Exact Match** | Precision and recall | QA, classification |

### Human-Aligned Metrics

| Metric | Description |
|--------|-------------|
| **Factual Consistency** | Does the output contain only verifiable facts from the input? |
| **Coherence** | Is the output logically structured and internally consistent? |
| **Relevance** | Does the output address the prompt's intent? |
| **Response Diversity** | Does the model produce varied responses across runs? |
| **Helpfulness** | Does the output actually solve the user's problem? |
| **Harmlessness** | Is the output free from bias, toxicity, or unsafe content? |

### Task-Specific Metrics

- **Code generation**: pass@k (percentage of k samples that pass unit tests)
- **Classification**: accuracy, precision, recall, F1, confusion matrix
- **Extraction**: entity-level F1, attribute accuracy
- **Creative writing**: human preference ratings, style consistency

## Evaluation Pipeline

### Step 1: Define Test Cases

```markdown
### Test Suite: [Task Name]

| ID | Input | Expected Output | Evaluation Criteria |
|----|-------|-----------------|---------------------|
| T1 | [input] | [expected] | Exact match |
| T2 | [input] | [expected] | Semantic similarity > 0.85 |
| T3 | [input] | [expected] | Contains all key entities |
```

### Step 2: Run Prompts Across Variants

Test multiple prompt formulations against the same test cases:

```markdown
### Prompt Variants
- **V1**: Zero-shot, simple instruction
- **V2**: Few-shot with 3 examples
- **V3**: CoT with step-by-step reasoning
- **V4**: System prompt + structured template

### Results Matrix
| Test | V1 | V2 | V3 | V4 |
|------|----|----|----|----|
| T1   | Pass | Pass | Pass | Pass |
| T2   | Fail | Pass | Pass | Pass |
| T3   | Fail | Fail | Pass | Pass |
```

### Step 3: Analyze and Iterate

- Identify failure patterns (systematic vs. random)
- Compare token usage and latency across variants
- Select the variant with the best accuracy/cost ratio
- Document winning prompt with rationale

## Iterative Refinement Loop

```
1. Draft prompt (initial version)
      |
2. Run against test suite
      |
3. Analyze failures
      |
4. Identify root cause:
   - Ambiguous instruction? -> Clarify
   - Missing context? -> Add examples
   - Wrong format? -> Specify output schema
   - Hallucination? -> Add grounding constraints
   - Too verbose? -> Add length constraints
      |
5. Revise prompt
      |
6. Re-run tests (go to step 2)
      |
7. Converged? -> Document final prompt + rationale
```

## Cross-Model Comparison Framework

### Comparison Template

```markdown
### Task: [Description]
### Prompt: [Exact prompt used across all models]

| Dimension | GPT-4 | Claude | Gemini | LLaMA | Mistral |
|-----------|-------|--------|--------|-------|---------|
| Accuracy | | | | | |
| Coherence | | | | | |
| Latency (ms) | | | | | |
| Token usage | | | | | |
| Cost | | | | | |
| Format compliance | | | | | |

### Observations
- [Model-specific strengths and weaknesses]
- [Prompt adjustments needed per model]
```

## A/B Testing Prompts

### Methodology
1. Define a clear success metric (accuracy, user satisfaction, task completion)
2. Create two prompt variants (A and B)
3. Run both against identical inputs (minimum 30 samples for statistical significance)
4. Calculate confidence intervals
5. Select the winner based on statistical significance (p < 0.05)

### Documentation Template

```markdown
### A/B Test: [Test Name]
- **Hypothesis**: Variant B will improve [metric] by [X]%
- **Sample size**: N = [number]
- **Metric**: [primary metric]
- **Variant A**: [description]
- **Variant B**: [description]
- **Result**: Variant [A/B] won with [metric] = [value] (p = [p-value])
- **Decision**: Adopt Variant [A/B]
```

## Evaluation Rubric for Prompt Quality

Rate each dimension 1-5:

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|--------------|---------------|
| **Clarity** | Ambiguous, multiple interpretations | Clear but could be more specific | Unambiguous, single interpretation |
| **Completeness** | Missing key constraints | Most constraints specified | All constraints and edge cases covered |
| **Format Control** | No output format specified | Format mentioned informally | Exact schema/template provided |
| **Grounding** | No context or examples | Some examples provided | Rich context with diverse examples |
| **Robustness** | Fails on edge cases | Handles common cases | Handles edge cases and adversarial inputs |
| **Efficiency** | Excessive tokens, redundant | Reasonable token usage | Minimal tokens, maximum signal |
