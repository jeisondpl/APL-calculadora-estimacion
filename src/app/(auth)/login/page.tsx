'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
    } else {
      router.push('/proyectos')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo: Branding ─────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between px-12 py-12 relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-deep-navy)' }}
      >
        {/* Círculos decorativos de fondo */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--color-petroleum)' }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--color-petroleum)' }}
        />
        <div
          className="absolute top-1/2 -right-10 w-40 h-40 rounded-full opacity-5"
          style={{ backgroundColor: '#fff' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Image
            src="/indra-logo.png"
            alt="INDRA GROUP"
            width={200}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        {/* Contenido central */}
        <div className="relative z-10 space-y-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            APL Calculadora de Estimación
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Estima con<br />
            <span style={{ color: 'var(--color-warm-gray)' }}>precisión y velocidad</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Planifica, estima y gestiona el esfuerzo de tus proyectos
            de software con inteligencia y colaboración en tiempo real.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { value: '300+', label: 'Componentes' },
              { value: '3',    label: 'Pasos wizard' },
              { value: '∞',    label: 'Proyectos' },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-xl px-4 py-3 text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} INDRA GROUP · Todos los derechos reservados
          </p>
        </div>
      </div>

      {/* ── Panel derecho: Formulario ─────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div className="w-full max-w-md mx-auto">

          {/* Logo mobile */}
          <div className="lg:hidden mb-8">
            <Image
              src="/indra-logo.png"
              alt="INDRA GROUP"
              width={140}
              height={42}
              className="object-contain"
            />
          </div>

          {/* Encabezado */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              Bienvenido de nuevo
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-soft)' }}>
              Inicia sesión para continuar con tu trabajo
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@indra.com"
                className="w-full px-4 py-3 text-sm rounded-xl border outline-none transition-all"
                style={{
                  borderColor:     'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color:           'var(--color-text)',
                }}
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm rounded-xl border outline-none transition-all"
                style={{
                  borderColor:     'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color:           'var(--color-text)',
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ backgroundColor: 'rgba(192,57,43,0.08)', color: '#C0392B' }}
              >
                <span>⚠</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-petroleum)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verificando…
                </span>
              ) : 'Iniciar sesión'}
            </button>
          </form>

          {/* Hint de prueba */}
          <div
            className="mt-8 p-4 rounded-xl text-xs space-y-1"
            style={{ backgroundColor: 'rgba(0,66,84,0.06)', border: '1px solid var(--color-border)' }}
          >
            <p className="font-semibold mb-2" style={{ color: 'var(--color-text-soft)' }}>
              Usuarios de prueba (contraseña: <code>Indra2025!</code>)
            </p>
            {[
              { email: 'admin@indra.com',  rol: 'Super Admin' },
              { email: 'po@indra.com',     rol: 'Product Owner' },
              { email: 'dev1@indra.com',   rol: 'Desarrollador' },
              { email: 'qa1@indra.com',    rol: 'QA' },
            ].map(u => (
              <div key={u.email} className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword('Indra2025!') }}
                  className="font-mono hover:underline"
                  style={{ color: 'var(--color-petroleum)' }}
                >
                  {u.email}
                </button>
                <span style={{ color: 'var(--color-text-soft)' }}>{u.rol}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
