# Development Integration

## API Integration Patterns

### OpenAI API (Python)

```python
from openai import OpenAI

client = OpenAI()

def structured_prompt(system_prompt: str, user_input: str, model: str = "gpt-4", **kwargs):
    """Execute a structured prompt with configurable parameters."""
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ],
        temperature=kwargs.get("temperature", 0.7),
        max_tokens=kwargs.get("max_tokens", 1024),
        top_p=kwargs.get("top_p", 0.9),
    )
    return response.choices[0].message.content
```

### OpenAI API (JavaScript/TypeScript)

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

async function structuredPrompt(
  systemPrompt: string,
  userInput: string,
  options: { model?: string; temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const response = await client.chat.completions.create({
    model: options.model ?? 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput },
    ],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1024,
  });
  return response.choices[0].message.content ?? '';
}
```

### Anthropic Claude API (Python)

```python
import anthropic

client = anthropic.Anthropic()

def claude_prompt(system_prompt: str, user_input: str, model: str = "claude-sonnet-4-6"):
    """Execute a prompt using Anthropic Claude API."""
    message = client.messages.create(
        model=model,
        max_tokens=1024,
        system=system_prompt,
        messages=[
            {"role": "user", "content": user_input}
        ]
    )
    return message.content[0].text
```

### Anthropic Claude API (TypeScript)

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

async function claudePrompt(
  systemPrompt: string,
  userInput: string,
  model: string = 'claude-sonnet-4-6'
): Promise<string> {
  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userInput }],
  });
  return message.content[0].type === 'text' ? message.content[0].text : '';
}
```

## LangChain Integration

### Prompt Templates

```python
from langchain.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate

system_template = SystemMessagePromptTemplate.from_template(
    "You are an expert {role}. {instructions}"
)

human_template = HumanMessagePromptTemplate.from_template(
    "{input}"
)

prompt = ChatPromptTemplate.from_messages([system_template, human_template])

# Usage
formatted = prompt.format_messages(
    role="data analyst",
    instructions="Provide insights based on the data provided.",
    input="Analyze sales trends for Q1 2025."
)
```

### Chain with Output Parser

```python
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI

class AnalysisResult(BaseModel):
    summary: str = Field(description="Brief summary of the analysis")
    key_findings: list[str] = Field(description="List of key findings")
    recommendations: list[str] = Field(description="Actionable recommendations")
    confidence: float = Field(description="Confidence score 0-1")

parser = PydanticOutputParser(pydantic_object=AnalysisResult)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a data analyst. {format_instructions}"),
    ("human", "Analyze: {input}")
]).partial(format_instructions=parser.get_format_instructions())

chain = prompt | ChatOpenAI(model="gpt-4") | parser
result: AnalysisResult = chain.invoke({"input": "Q1 sales data..."})
```

## Evaluation Pipeline

### Automated Prompt Testing

```python
import json
from dataclasses import dataclass

@dataclass
class TestCase:
    input: str
    expected_output: str
    evaluation_type: str  # "exact", "contains", "semantic", "rubric"

@dataclass
class TestResult:
    test_case: TestCase
    actual_output: str
    passed: bool
    score: float
    notes: str

def run_prompt_evaluation(
    prompt_template: str,
    test_cases: list[TestCase],
    model_fn,
) -> list[TestResult]:
    """Run a prompt against a suite of test cases."""
    results = []
    for tc in test_cases:
        output = model_fn(prompt_template.format(input=tc.input))
        passed, score, notes = evaluate(output, tc)
        results.append(TestResult(tc, output, passed, score, notes))
    return results

def evaluate(output: str, tc: TestCase) -> tuple[bool, float, str]:
    """Evaluate output against expected result."""
    if tc.evaluation_type == "exact":
        passed = output.strip() == tc.expected_output.strip()
        return passed, 1.0 if passed else 0.0, ""
    elif tc.evaluation_type == "contains":
        passed = tc.expected_output.lower() in output.lower()
        return passed, 1.0 if passed else 0.0, ""
    # Add semantic and rubric evaluation as needed
    return False, 0.0, "Unknown evaluation type"
```

### Meta-Prompt Optimization Loop

```python
def optimize_prompt(
    initial_prompt: str,
    test_cases: list[TestCase],
    model_fn,
    optimizer_fn,
    max_iterations: int = 5,
    target_score: float = 0.95,
) -> tuple[str, list[dict]]:
    """Iteratively optimize a prompt using meta-prompting."""
    current_prompt = initial_prompt
    history = []

    for i in range(max_iterations):
        # Evaluate current prompt
        results = run_prompt_evaluation(current_prompt, test_cases, model_fn)
        avg_score = sum(r.score for r in results) / len(results)
        failures = [r for r in results if not r.passed]

        history.append({
            "iteration": i + 1,
            "prompt": current_prompt,
            "avg_score": avg_score,
            "failures": len(failures),
        })

        if avg_score >= target_score:
            break

        # Use meta-prompting to improve
        failure_report = "\n".join(
            f"Input: {f.test_case.input}\n"
            f"Expected: {f.test_case.expected_output}\n"
            f"Got: {f.actual_output}"
            for f in failures
        )

        improvement = optimizer_fn(
            f"Improve this prompt based on failures:\n\n"
            f"Current prompt:\n{current_prompt}\n\n"
            f"Failures:\n{failure_report}\n\n"
            f"Return ONLY the improved prompt."
        )
        current_prompt = improvement

    return current_prompt, history
```

## Hugging Face Integration

### Using Transformers Pipeline

```python
from transformers import pipeline

generator = pipeline("text-generation", model="meta-llama/Llama-3-8B-Instruct")

def hf_prompt(prompt: str, max_length: int = 512) -> str:
    result = generator(
        prompt,
        max_length=max_length,
        temperature=0.7,
        do_sample=True,
        top_p=0.9,
    )
    return result[0]["generated_text"]
```

## Fine-Tuning Workflows

### When to Fine-Tune vs. Prompt Engineer

| Scenario | Approach |
|----------|----------|
| Task follows standard patterns | Prompt engineering |
| Need consistent specialized format | Fine-tuning |
| Limited training data (<100 examples) | Few-shot prompting |
| Abundant training data (>1000 examples) | Fine-tuning |
| Rapidly changing requirements | Prompt engineering |
| Production latency critical | Fine-tuning (shorter prompts) |
| Cost optimization needed | Fine-tuning (smaller model) |

### Data Preparation for Fine-Tuning

```python
import json

def prepare_training_data(examples: list[dict]) -> list[dict]:
    """Convert examples to fine-tuning format (OpenAI style)."""
    training_data = []
    for ex in examples:
        training_data.append({
            "messages": [
                {"role": "system", "content": ex["system_prompt"]},
                {"role": "user", "content": ex["input"]},
                {"role": "assistant", "content": ex["expected_output"]},
            ]
        })
    return training_data

def save_jsonl(data: list[dict], filepath: str):
    """Save training data in JSONL format."""
    with open(filepath, "w") as f:
        for item in data:
            f.write(json.dumps(item) + "\n")
```

## Prompt Version Control

### Prompt Registry Pattern

```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class PromptVersion:
    version: str
    template: str
    parameters: dict
    created_at: datetime = field(default_factory=datetime.now)
    test_score: float = 0.0
    notes: str = ""

class PromptRegistry:
    """Track and manage prompt versions."""

    def __init__(self):
        self._prompts: dict[str, list[PromptVersion]] = {}

    def register(self, name: str, version: PromptVersion):
        if name not in self._prompts:
            self._prompts[name] = []
        self._prompts[name].append(version)

    def get_latest(self, name: str) -> PromptVersion:
        return self._prompts[name][-1]

    def get_best(self, name: str) -> PromptVersion:
        return max(self._prompts[name], key=lambda v: v.test_score)

    def compare(self, name: str, v1: str, v2: str) -> dict:
        versions = {v.version: v for v in self._prompts[name]}
        return {
            "v1": {"version": v1, "score": versions[v1].test_score},
            "v2": {"version": v2, "score": versions[v2].test_score},
            "improvement": versions[v2].test_score - versions[v1].test_score,
        }
```

## Best Practices for Production Prompts

1. **Version control**: Track all prompt changes with git or a prompt registry
2. **Test suites**: Maintain comprehensive test cases for each prompt
3. **Monitoring**: Log inputs, outputs, latency, and token usage in production
4. **Fallbacks**: Define graceful degradation when the model fails
5. **Rate limiting**: Implement proper rate limiting and retry logic
6. **Cost tracking**: Monitor API costs per prompt and optimize token usage
7. **A/B testing**: Test prompt changes against production traffic before full rollout
8. **Documentation**: Document each prompt's purpose, parameters, and expected behavior
