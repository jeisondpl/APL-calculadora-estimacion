'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant'
interface Message { id: string; role: Role; content: string; loading?: boolean }

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

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar role={msg.role} />
      <div
        className="max-w-[82%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed"
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
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef<HTMLDivElement>(null)
  const textareaRef           = useRef<HTMLTextAreaElement>(null)

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

    // Historial sin mensajes de loading ni welcome
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

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = textareaRef.current
    if (el) { el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 120)}px` }
  }

  return (
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
        {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
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
  )
}
