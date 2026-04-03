'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant'
interface Message { id: string; role: Role; content: string; loading?: boolean }

// ─── Visor Markdown (modal) ───────────────────────────────────────────────────

function MarkdownViewer({ content, onClose }: { content: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(0,66,84,0.05)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Vista previa · Markdown
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: copied ? 'rgba(16,185,129,0.12)' : 'rgba(0,66,84,0.08)',
                color: copied ? '#10B981' : 'var(--color-petroleum)',
                border: `1px solid ${copied ? '#10B981' : 'var(--color-petroleum)'}`,
              }}
            >
              {copied ? (
                <>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copiado
                </>
              ) : (
                <>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copiar
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:opacity-70"
              style={{ backgroundColor: 'rgba(0,66,84,0.08)', color: 'var(--color-text-soft)' }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido renderizado */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div
            className="prose prose-sm max-w-none"
            style={{
              color: 'var(--color-text)',
              ['--tw-prose-body' as string]: 'var(--color-text)',
              ['--tw-prose-bold' as string]: 'var(--color-text)',
            }}
          >
            <ReactMarkdown
              components={{
                strong: ({ children }) => (
                  <strong style={{ color: 'var(--color-petroleum)', fontWeight: 700 }}>{children}</strong>
                ),
                p: ({ children }) => (
                  <p className="mb-2 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-2 space-y-1 text-sm" style={{ color: 'var(--color-text)' }}>{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="text-sm" style={{ color: 'var(--color-text)' }}>{children}</li>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────

function Avatar({ role }: { role: Role }) {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
      style={
        role === 'assistant'
          ? { backgroundColor: 'var(--color-petroleum)', color: '#fff' }
          : { backgroundColor: 'rgba(0,66,84,0.12)', color: 'var(--color-petroleum)' }
      }
    >
      {role === 'assistant' ? 'AI' : 'TU'}
    </div>
  )
}

function Bubble({
  msg,
  onView,
}: {
  msg: Message
  onView: (content: string) => void
}) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar role={msg.role} />
      <div className="flex flex-col gap-1 max-w-[82%]">
        <div
          className="rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed"
          style={
            isUser
              ? { backgroundColor: 'var(--color-petroleum)', color: '#fff', borderBottomRightRadius: 4 }
              : { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderBottomLeftRadius: 4 }
          }
        >
          {msg.loading ? (
            <span className="flex gap-1 items-center h-4">
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-text-soft)', animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-text-soft)', animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-text-soft)', animationDelay: '300ms' }} />
            </span>
          ) : (
            msg.content
          )}
        </div>

        {/* Botón ver en visor — solo en mensajes del asistente con contenido */}
        {!isUser && !msg.loading && msg.content && (
          <button
            onClick={() => onView(msg.content)}
            className="self-start flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-opacity hover:opacity-70"
            style={{
              color: 'var(--color-text-soft)',
              backgroundColor: 'rgba(0,66,84,0.06)',
              border: '1px solid var(--color-border)',
            }}
            title="Ver en visor Markdown"
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver · MD
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Sugerencias rápidas ──────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { label: 'Generar nota Jira', text: 'Genera la nota de avance para pegar en Jira con el formato indicado.' },
  { label: '¿Cuántas completadas?', text: '¿Cuántas actividades están completadas y cuáles son?' },
  { label: '¿Qué sigue?', text: '¿Cuál es la próxima actividad planificada y quién está asignado?' },
  { label: '¿Vamos en cronograma?', text: '¿El proyecto va en cronograma según las fechas planificadas?' },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export function ChatBox({ proyectoId }: { proyectoId: number }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hola, soy tu asistente de control operacional. Puedo generar la nota de avance para Jira o responder preguntas sobre este proyecto. ¿En qué te ayudo?',
    },
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [viewing, setViewing]   = useState<string | null>(null)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const textareaRef             = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed }
    const loadingMsg: Message = { id: 'loading', role: 'assistant', content: '', loading: true }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setInput('')
    setLoading(true)

    const history = [...messages.filter(m => !m.loading && m.id !== 'welcome'), userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const res = await axios.post<{ content: string }>(
        `/api/proyectos/${proyectoId}/chat`,
        { messages: history }
      )
      const aiMsg: Message = { id: Date.now().toString() + '_ai', role: 'assistant', content: res.data.content }
      setMessages(prev => [...prev.filter(m => m.id !== 'loading'), aiMsg])
    } catch (err) {
      const errText = axios.isAxiosError(err)
        ? (err.response?.data?.msg ?? err.message)
        : 'Error al conectar con el asistente.'
      const errMsg: Message = { id: Date.now().toString() + '_err', role: 'assistant', content: `⚠ ${errText}` }
      setMessages(prev => [...prev.filter(m => m.id !== 'loading'), errMsg])
    } finally {
      setLoading(false)
    }
  }, [messages, loading, proyectoId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = textareaRef.current
    if (el) { el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 120)}px` }
  }

  return (
    <>
      {/* Modal visor Markdown */}
      {viewing && <MarkdownViewer content={viewing} onClose={() => setViewing(null)} />}

      <div
        className="rounded-xl border flex flex-col overflow-hidden"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', height: 480 }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-4 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(0,66,84,0.04)' }}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Asistente operacional
          </span>
          <span className="text-xs ml-auto" style={{ color: 'var(--color-text-soft)' }}>
            qwen2.5 · LM Studio
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map(msg => (
            <Bubble key={msg.id} msg={msg} onView={setViewing} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap shrink-0">
            {QUICK_PROMPTS.map(qp => (
              <button
                key={qp.label}
                onClick={() => sendMessage(qp.text)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:opacity-80 disabled:opacity-40"
                style={{
                  borderColor: 'var(--color-petroleum)',
                  color: 'var(--color-petroleum)',
                  backgroundColor: 'rgba(0,66,84,0.05)',
                }}
              >
                {qp.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div
          className="px-3 pb-3 pt-2 border-t shrink-0 flex gap-2 items-end"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Escribe un mensaje o presiona Enter…"
            className="flex-1 resize-none rounded-lg px-3 py-2 text-sm outline-none transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(0,66,84,0.05)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              minHeight: 38,
              maxHeight: 120,
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="rounded-lg px-3 py-2 text-sm font-medium transition-opacity disabled:opacity-40 shrink-0"
            style={{ backgroundColor: 'var(--color-petroleum)', color: '#fff' }}
          >
            {loading ? '…' : 'Enviar'}
          </button>
        </div>
      </div>
    </>
  )
}
