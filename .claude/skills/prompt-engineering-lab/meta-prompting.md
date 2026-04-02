# Meta-Prompting

## What is Meta-Prompting?

Meta-prompting is the discipline of crafting prompts that **generate, evaluate, or refine other prompts**. It treats prompt engineering as a recursive optimization problem where the LLM itself becomes the prompt designer.

## Core Techniques

### 1. Prompt Generation

Use an LLM to generate task-specific prompts from a high-level description.

```markdown
### Task
You are a prompt engineering expert. Generate an optimized prompt for the following task.

### Task Description
[High-level description of what the prompt should accomplish]

### Requirements
- Target model: [model name]
- Expected input: [describe inputs]
- Expected output: [describe desired outputs]
- Constraints: [any limitations]

### Output
Provide the complete prompt in Markdown format, including:
1. Role definition
2. Task instructions
3. Input/output format
4. At least 2 examples
5. Edge case handling instructions
```

### 2. Prompt Evaluation

Use an LLM to critically evaluate an existing prompt.

```markdown
### Task
Evaluate the following prompt for quality, clarity, and effectiveness.

### Prompt to Evaluate
"""
[Paste the prompt here]
"""

### Evaluation Criteria
Rate each dimension 1-5 and explain your rating:
1. **Clarity**: Is the instruction unambiguous?
2. **Completeness**: Are all necessary constraints specified?
3. **Format control**: Is the output format clearly defined?
4. **Example quality**: Are examples diverse and representative?
5. **Robustness**: Will it handle edge cases?
6. **Efficiency**: Is it concise without losing information?

### Output
- Scores table
- Identified weaknesses
- Specific improvement suggestions
- Rewritten version (if score < 4 in any dimension)
```

### 3. Prompt Refinement

Iteratively improve a prompt based on observed failures.

```markdown
### Task
Improve the following prompt based on the failure analysis.

### Original Prompt
"""
[Original prompt]
"""

### Failure Cases
| Input | Expected Output | Actual Output | Failure Type |
|-------|-----------------|---------------|--------------|
| [input1] | [expected1] | [actual1] | [type1] |
| [input2] | [expected2] | [actual2] | [type2] |

### Instructions
1. Analyze each failure to identify the root cause
2. Propose specific modifications to address each failure
3. Rewrite the prompt incorporating all fixes
4. Explain what changed and why
5. Predict potential new failure modes of the revised prompt
```

## Recursive Optimization Loops

### The Optimize-Evaluate-Refine (OER) Loop

```
Round 1:
  Generate: Create initial prompt from task description
  Evaluate: Score prompt on quality rubric
  Refine: Fix identified weaknesses
      |
Round 2:
  Test: Run refined prompt against test cases
  Analyze: Identify remaining failures
  Refine: Address specific failure patterns
      |
Round 3:
  Stress-test: Run against adversarial/edge cases
  Evaluate: Final quality assessment
  Document: Record final prompt + optimization history
```

### Self-Improvement Sequence

```markdown
### Phase 1: Initial Generation
Generate a prompt for: [task description]

### Phase 2: Self-Critique
Now critically evaluate the prompt you just generated:
- What assumptions did you make?
- What edge cases might it miss?
- Is the output format sufficiently constrained?
- Could the role definition be more specific?

### Phase 3: Revision
Based on your critique, rewrite the prompt addressing all identified issues.

### Phase 4: Comparative Analysis
Compare the original and revised prompts:
- What specifically improved?
- Did any quality degrade?
- What trade-offs were made?

### Phase 5: Final Assessment
Rate the final prompt's readiness for production use (1-10) and list any remaining concerns.
```

## Prompt Chaining

### Sequential Chaining
Break a complex task into sequential prompt steps, where each step's output feeds the next.

```markdown
### Chain: Research Report Generation

Step 1 - Topic Analysis:
"Analyze the topic '[topic]' and identify 5 key subtopics to cover."

Step 2 - Outline Generation (input: Step 1 output):
"Create a detailed outline for a research report covering these subtopics: [Step 1 output]"

Step 3 - Section Writing (input: Step 2 output):
"Write section [N] of the report based on this outline: [Step 2 output]"

Step 4 - Review & Polish (input: Step 3 outputs):
"Review and improve coherence across all sections: [combined Step 3 outputs]"
```

### Parallel Chaining
Generate multiple independent outputs and synthesize them.

```markdown
### Chain: Multi-Perspective Analysis

Branch A: "Analyze [topic] from a technical perspective."
Branch B: "Analyze [topic] from a business perspective."
Branch C: "Analyze [topic] from a user experience perspective."

Synthesis: "Combine these three analyses into a unified recommendation:
- Technical: [Branch A output]
- Business: [Branch B output]
- UX: [Branch C output]"
```

## Self-Critique Patterns

### The Critic-Author Pattern

```markdown
### Round 1 (Author)
Write [content] following these requirements: [requirements]

### Round 2 (Critic)
Review the content above. Identify:
1. Factual errors or unsupported claims
2. Logical inconsistencies
3. Missing important points
4. Unclear or ambiguous language
5. Opportunities for improvement

### Round 3 (Author - Revision)
Revise the content based on the critique above. Address each point explicitly.

### Round 4 (Critic - Final Check)
Verify that all critique points were adequately addressed. Rate the improvement 1-10.
```

### The Devil's Advocate Pattern

```markdown
### Step 1
Present [argument/solution/recommendation].

### Step 2
Now argue AGAINST your own proposal. Find the strongest counterarguments.

### Step 3
Respond to the counterarguments. Strengthen your original position or modify it.

### Step 4
Provide a final, balanced assessment that acknowledges both sides.
```

## Meta-Prompt Templates

### Universal Prompt Optimizer

```markdown
### Role
You are an expert prompt engineer specializing in LLM optimization.

### Task
Optimize the following prompt for maximum effectiveness with [target model].

### Input Prompt
"""
[Paste prompt to optimize]
"""

### Optimization Steps
1. Identify the core intent of the prompt
2. Analyze current structure and formatting
3. Check for ambiguity, missing constraints, and edge cases
4. Apply best practices: clear role, specific instructions, output format, examples
5. Consider model-specific optimizations
6. Rewrite the prompt

### Output
1. **Analysis**: Brief assessment of the original prompt
2. **Changes**: Bulleted list of modifications and rationale
3. **Optimized Prompt**: The full rewritten prompt
4. **Confidence**: How much improvement is expected (Low/Medium/High)
```

### Prompt Debugger

```markdown
### Role
You are a prompt debugging specialist.

### Problem
The following prompt produces incorrect/inconsistent results:

### Prompt
"""
[Problematic prompt]
"""

### Observed Behavior
- Expected: [what should happen]
- Actual: [what actually happens]
- Frequency: [always/sometimes/rarely]

### Debug Steps
1. Parse the prompt for ambiguous instructions
2. Identify conflicting requirements
3. Check if examples contradict instructions
4. Assess if the task is within model capabilities
5. Propose a fix with explanation

### Output
- **Root Cause**: [identified issue]
- **Fix**: [specific change]
- **Fixed Prompt**: [complete rewritten prompt]
- **Test Cases**: [3 test inputs to verify the fix]
```
