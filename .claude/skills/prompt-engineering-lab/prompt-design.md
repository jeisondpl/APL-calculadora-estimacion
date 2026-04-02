# Prompt Design & Optimization

## Prompt Internals

### Tokenization
- Text is split into tokens (subwords) before processing
- Token count affects cost, latency, and context window usage
- Different models use different tokenizers (BPE, SentencePiece, tiktoken)
- Rule of thumb: 1 token ~ 4 characters in English, varies by language

### Embeddings & Context Windows
- Each token maps to a high-dimensional vector (embedding)
- Context window defines max input+output tokens (4K to 1M+)
- Position within context affects attention and recall (primacy/recency effects)
- Long-context models may still exhibit "lost in the middle" degradation

### Decoding Strategies
- **Greedy**: always pick highest-probability token (deterministic, less creative)
- **Sampling**: randomly sample from probability distribution (more diverse)
- **Beam search**: maintain top-k candidates at each step
- **Nucleus (top-p)**: sample from smallest set of tokens whose cumulative probability exceeds p

## Configuration Parameters

| Parameter | Range | Effect |
|-----------|-------|--------|
| **temperature** | 0.0-2.0 | Controls randomness. 0 = deterministic, 1+ = creative |
| **top_p** | 0.0-1.0 | Nucleus sampling threshold. 0.1 = only top 10% probability mass |
| **max_tokens** | 1-model_max | Maximum output length |
| **frequency_penalty** | -2.0-2.0 | Penalizes repeated tokens based on frequency |
| **presence_penalty** | -2.0-2.0 | Penalizes tokens that have appeared at all |
| **stop_sequences** | string[] | Sequences that halt generation |

### Parameter Selection Guidelines
- **Factual/analytical tasks**: temperature 0.0-0.3, top_p 0.9
- **Creative writing**: temperature 0.7-1.2, top_p 0.95
- **Code generation**: temperature 0.0-0.2, top_p 0.95
- **Brainstorming**: temperature 1.0-1.5, top_p 1.0

## Prompting Paradigms

### Zero-Shot
Direct task instruction without examples. Relies on the model's pre-trained knowledge.

```markdown
### Task
Classify the following text as positive, negative, or neutral.

### Input
"The product arrived on time but the packaging was damaged."

### Output Format
Single word: positive, negative, or neutral
```

### One-Shot / Few-Shot
Provide 1 or more examples to establish pattern and expected output format.

```markdown
### Task
Extract the key entities from the text.

### Examples
Input: "Apple announced the new iPhone 16 at their Cupertino headquarters."
Output: {"company": "Apple", "product": "iPhone 16", "location": "Cupertino"}

Input: "Tesla's CEO Elon Musk unveiled the Cybertruck in Austin."
Output: {"company": "Tesla", "person": "Elon Musk", "product": "Cybertruck", "location": "Austin"}

### Input
"Microsoft acquired Activision Blizzard for $69 billion in Redmond."

### Output
```

### Chain-of-Thought (CoT)
Instruct the model to reason step-by-step before producing a final answer.

```markdown
### Task
Solve the following math problem. Think step by step.

### Problem
A store offers 20% off all items. If a jacket costs $85, and there's an additional 10% tax on the discounted price, what is the final cost?

### Steps
1. Calculate the discount amount
2. Calculate the discounted price
3. Calculate the tax
4. Calculate the final price

### Answer
```

### Tree-of-Thought (ToT)
Explore multiple reasoning paths and evaluate which leads to the best solution.

```markdown
### Task
Generate 3 different approaches to solve this problem. For each approach, evaluate its strengths and weaknesses, then select the best one.

### Problem
[Problem description]

### Approach 1
[Reasoning path 1]
Evaluation: [Strengths/Weaknesses]

### Approach 2
[Reasoning path 2]
Evaluation: [Strengths/Weaknesses]

### Approach 3
[Reasoning path 3]
Evaluation: [Strengths/Weaknesses]

### Best Approach
[Selection with justification]
```

### ReAct (Reasoning + Acting)
Interleave reasoning steps with actions (tool calls, searches, calculations).

```markdown
### Task
Answer the question using the available tools.

### Available Tools
- search(query): Search the web
- calculate(expression): Evaluate a math expression
- lookup(term): Look up a definition

### Format
Thought: [Your reasoning about what to do next]
Action: [tool_name(input)]
Observation: [Result of the action]
... (repeat as needed)
Final Answer: [Your conclusion]
```

### RAG (Retrieval-Augmented Generation)
Ground the model's response in retrieved context documents.

```markdown
### Context
The following documents were retrieved from the knowledge base:

[Document 1]: ...
[Document 2]: ...
[Document 3]: ...

### Instructions
Answer the question based ONLY on the provided context. If the answer is not in the context, say "Information not available in the provided documents."

### Question
[User question]

### Answer
```

## Prompt Templates

### Markdown Template (Preferred)

```markdown
### Role
You are an expert in [domain].

### Objective
[Clearly defined task]

### Context
[Relevant background or input data]

### Instructions
- Step 1: ...
- Step 2: ...

### Constraints
- [Constraint 1]
- [Constraint 2]

### Output Format
[Specify structure: Markdown, JSON, table, etc.]

### Examples (optional)
Input: ...
Output: ...
```

### JSON Template

```json
{
  "role": "Expert in [domain]",
  "task": "[Clearly defined task]",
  "context": "[Relevant background]",
  "instructions": [
    "Step 1: ...",
    "Step 2: ..."
  ],
  "constraints": [
    "Constraint 1",
    "Constraint 2"
  ],
  "output_format": {
    "type": "json",
    "schema": {}
  },
  "examples": [
    {"input": "...", "output": "..."}
  ]
}
```

## Effective vs. Ineffective Prompts

### Ineffective
> "Summarize a document."

**Problems**: No length, no tone, no audience, no format specified.

### Improved (Iteration 1)
> "Summarize the following document in 3 bullet points for a technical audience."

### Improved (Iteration 2)
```markdown
### Role
You are a technical writer specializing in executive summaries.

### Task
Summarize the following document.

### Requirements
- Length: 3-5 bullet points
- Audience: Senior engineers
- Tone: Concise, factual
- Focus: Key decisions and their technical implications
- Exclude: Background context already known to the team

### Document
[Document text]

### Output
Bullet-point summary in Markdown
```

## Best Practices

1. **Be specific**: Define role, task, format, and constraints explicitly
2. **Order matters**: Place critical instructions at the beginning and end (primacy/recency)
3. **Use delimiters**: Separate sections with headers, XML tags, or triple backticks
4. **Provide examples**: Even one example dramatically improves output consistency
5. **Iterate**: Refine prompts based on model responses, not assumptions
6. **Test across models**: A prompt optimized for GPT-4 may need adjustment for Claude or Gemini
7. **Control output format**: Specify JSON schema, Markdown structure, or exact format
8. **Use system prompts**: Leverage the system message for persistent role and behavioral instructions
