# Multimodal Prompting

## Overview

Multimodal prompting extends prompt engineering to systems that process multiple input types: text, images, audio, video, and code. The core principles of clarity, structure, and specificity apply across all modalities.

## Text-Based Techniques Taxonomy

The Prompt Report (2025) identifies 58 text-based prompting techniques organized into categories:

### In-Context Learning
- Zero-shot, one-shot, few-shot prompting
- Many-shot prompting (10+ examples)
- Example selection and ordering strategies

### Decomposition
- Chain-of-Thought (CoT)
- Tree-of-Thought (ToT)
- Graph-of-Thought (GoT)
- Least-to-Most prompting
- Plan-and-Solve

### Reasoning Enhancement
- Self-Consistency (sample multiple CoT paths, majority vote)
- ReAct (Reasoning + Acting with tools)
- Reflexion (self-reflection and retry)
- Chain-of-Verification (verify each claim)

### Role & Persona
- System prompt persona definition
- Expert role assignment
- Multi-agent debate/discussion

### Format & Structure
- Structured output (JSON, XML, Markdown)
- Template filling
- Constrained generation

### Optimization
- Automatic Prompt Engineering (APE)
- Prompt tuning and soft prompts
- Gradient-based optimization

## Multimodal Techniques (40 techniques)

### Image + Text

#### Image Understanding
```markdown
### Task
Analyze the provided image and answer the question.

### Image
[Image input]

### Question
[Specific question about the image]

### Instructions
- Describe what you observe before answering
- Reference specific regions of the image
- State confidence level in your answer
- If uncertain, explain what additional information would help
```

#### Image-Grounded Generation
```markdown
### Task
Generate a product description based on the product image.

### Image
[Product image]

### Requirements
- Identify the product type, color, material, and key features
- Write a 100-word marketing description
- Highlight 3 unique selling points visible in the image
- Suggest a target audience based on the product's appearance

### Output Format
```json
{
  "product_name": "",
  "description": "",
  "selling_points": [],
  "target_audience": ""
}
```
```

### Code Generation

#### Code from Natural Language
```markdown
### Task
Generate code based on the following specification.

### Language
[Python/JavaScript/TypeScript/etc.]

### Specification
[Natural language description of desired functionality]

### Requirements
- Include type annotations/hints
- Add inline comments for complex logic
- Handle edge cases: [list specific cases]
- Follow [style guide/convention]

### Output
- Complete, runnable code
- Brief explanation of design decisions
- Example usage
```

#### Code Review Prompting
```markdown
### Task
Review the following code for quality, security, and performance.

### Code
```[language]
[Code to review]
```

### Review Dimensions
1. **Correctness**: Logic errors, edge cases
2. **Security**: Injection, data exposure, auth issues
3. **Performance**: Time/space complexity, unnecessary operations
4. **Readability**: Naming, structure, documentation
5. **Maintainability**: Coupling, cohesion, extensibility

### Output Format
For each issue found:
- **Severity**: Critical / Major / Minor / Suggestion
- **Location**: Line number or code reference
- **Issue**: Description
- **Fix**: Suggested correction
```

### Audio Prompting

```markdown
### Task
Transcribe and analyze the audio content.

### Audio
[Audio input]

### Instructions
1. Transcribe the audio accurately
2. Identify speakers (if multiple)
3. Note tone, emotion, and emphasis
4. Summarize key points discussed
5. Flag any unclear or inaudible segments

### Output Format
- **Transcript**: Full text with speaker labels
- **Summary**: 3-5 bullet points
- **Sentiment**: Overall and per-speaker
- **Audio Quality Notes**: Any issues
```

## Diffusion & Latent Models

### Image Generation Prompt Structure

#### Stable Diffusion / DALL-E / Midjourney

```markdown
### Prompt Components (in priority order)
1. **Subject**: What is the main focus?
2. **Style**: Art style, medium, or aesthetic
3. **Composition**: Camera angle, framing, layout
4. **Lighting**: Type, direction, mood
5. **Color palette**: Dominant colors, mood
6. **Quality modifiers**: Resolution, detail level
7. **Negative prompt**: What to exclude

### Example
Prompt: "A serene Japanese garden at sunset, watercolor painting style, wide angle view, warm golden light filtering through maple trees, soft autumn color palette, highly detailed, 4K resolution"

Negative: "blurry, low quality, distorted, oversaturated, photorealistic"
```

### Model-Specific Considerations

| Model | Strength | Prompt Style |
|-------|----------|--------------|
| **DALL-E 3** | Follows natural language well | Descriptive sentences, detailed instructions |
| **Midjourney** | Artistic quality, stylization | Keyword-heavy, parameter flags (--ar, --v, --style) |
| **Stable Diffusion** | Customizable, LoRA support | Weighted keywords, negative prompts, samplers |
| **Flux** | Fast, consistent | Clean descriptions, style references |

## Cross-Modal Prompting Strategies

### 1. Multimodal Chain-of-Thought
```markdown
### Task
Answer the question using both the image and text context.

### Image
[Image input]

### Text Context
[Relevant text]

### Instructions
1. First, describe what you see in the image
2. Then, identify relevant information from the text
3. Reason step by step about how image and text relate
4. Provide your final answer with justification from both sources
```

### 2. Modality Translation
```markdown
### Task
Convert the information from [source modality] to [target modality].

### Input ([source modality])
[Content in source format]

### Target Modality
[Description of desired output format]

### Preservation Requirements
- Maintain factual accuracy
- Preserve relationships between entities
- Adapt presentation for the target medium
- Note any information lost in translation
```

## Best Practices for Multimodal Prompts

1. **Specify modality expectations**: Tell the model which modalities to attend to and how
2. **Ground cross-modal references**: When referring to image regions, use clear spatial language (top-left, center, background)
3. **Order modalities strategically**: Place the most important modality first
4. **Handle missing modalities gracefully**: Include fallback instructions when a modality is absent
5. **Validate cross-modal consistency**: Ensure text descriptions match visual content
6. **Leverage model strengths**: Different models excel at different modality combinations
