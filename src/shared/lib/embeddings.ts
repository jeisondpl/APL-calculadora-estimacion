import OpenAI from 'openai'

const client = new OpenAI({
  apiKey:  'lm-studio',
  baseURL: 'http://172.29.112.1:1234/v1',
})

const EMBED_MODEL = 'text-embedding-nomic-embed-text-v1.5'

/** Genera un vector de 768 dimensiones para un texto. */
export async function embed(text: string): Promise<number[]> {
  const res = await client.embeddings.create({
    model: EMBED_MODEL,
    input: text.slice(0, 8000), // límite de seguridad
  })
  return res.data[0].embedding
}

/** Similitud coseno entre dos vectores. Retorna valor entre -1 y 1. */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}
