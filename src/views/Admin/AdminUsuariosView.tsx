'use client'

import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'

interface Usuario {
  id: number
  nombre: string
  email: string
  activo: boolean
  createdAt: string
  rol: { id: number; nombre: string }
}

interface Rol {
  id: number
  nombre: string
}

const ROL_LABELS: Record<string, string> = {
  SUPERUSUARIO:  'Super Admin',
  PRODUCT_OWNER: 'Product Owner',
  DESARROLLADOR: 'Desarrollador',
  QA:            'QA',
}

// Mismo mapeo que Topbar (alineado con .claude/skills/indra-corporate-ui/reference.md)
const ROL_COLORS: Record<string, { fg: string; bg: string }> = {
  SUPERUSUARIO:  { fg: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  PRODUCT_OWNER: { fg: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  DESARROLLADOR: { fg: 'var(--color-petroleum)', bg: 'rgba(0,66,84,0.10)' },
  QA:            { fg: '#10B981', bg: 'rgba(16,185,129,0.12)' },
}
const ROL_FALLBACK = { fg: 'var(--color-text-soft)', bg: 'rgba(170,170,159,0.18)' }

const EMPTY_FORM = { nombre: '', email: '', password: '', rolId: '', activo: true }

// ── helpers ────────────────────────────────────────────────────────────────────
function Avatar({ nombre, rolNombre }: { nombre: string; rolNombre: string }) {
  const rol = ROL_COLORS[rolNombre] ?? ROL_FALLBACK
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none"
      style={{ backgroundColor: rol.fg, color: 'var(--color-text-invert)' }}
      aria-hidden="true"
    >
      {nombre.charAt(0).toUpperCase()}
    </div>
  )
}

function RolBadge({ nombre }: { nombre: string }) {
  const rol = ROL_COLORS[nombre] ?? ROL_FALLBACK
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: rol.bg, color: rol.fg }}
    >
      {ROL_LABELS[nombre] ?? nombre}
    </span>
  )
}

function StatusBadge({ activo }: { activo: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: activo ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        color:           activo ? '#10b981' : '#ef4444',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activo ? '#10b981' : '#ef4444' }} />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div
      className="rounded-2xl px-5 py-4 border"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-soft)' }}>{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: color ?? 'var(--color-text)' }}>{value}</p>
    </div>
  )
}

// ── Modal shell ────────────────────────────────────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl"
        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
      >
        {children}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function AdminUsuariosView() {
  const [usuarios,   setUsuarios]   = useState<Usuario[]>([])
  const [roles,      setRoles]      = useState<Rol[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filterRol,  setFilterRol]  = useState('')
  const [filterActivo, setFilterActivo] = useState<'all' | 'activo' | 'inactivo'>('all')

  // modal create/edit
  const [modal,    setModal]    = useState<'create' | 'edit' | null>(null)
  const [editId,   setEditId]   = useState<number | null>(null)
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [showPass, setShowPass] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [formErr,  setFormErr]  = useState<string | null>(null)

  // modal delete
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  // notificación toast
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  // ── carga ──────────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true)
    try {
      const [u, r] = await Promise.all([
        axios.get<Usuario[]>('/api/admin/usuarios'),
        axios.get<Rol[]>('/api/admin/roles'),
      ])
      setUsuarios(u.data)
      setRoles(r.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── filtrado ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return usuarios.filter(u => {
      if (q && !u.nombre.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
      if (filterRol && u.rol.nombre !== filterRol) return false
      if (filterActivo === 'activo'   && !u.activo) return false
      if (filterActivo === 'inactivo' &&  u.activo) return false
      return true
    })
  }, [usuarios, search, filterRol, filterActivo])

  // ── stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    usuarios.length,
    po:       usuarios.filter(u => u.rol.nombre === 'PRODUCT_OWNER').length,
    devs:     usuarios.filter(u => u.rol.nombre === 'DESARROLLADOR').length,
    qa:       usuarios.filter(u => u.rol.nombre === 'QA').length,
  }), [usuarios])

  // ── create/edit ────────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setFormErr(null)
    setShowPass(false)
    setModal('create')
  }

  const openEdit = (u: Usuario) => {
    setForm({ nombre: u.nombre, email: u.email, password: '', rolId: String(u.rol.id), activo: u.activo })
    setEditId(u.id)
    setFormErr(null)
    setShowPass(false)
    setModal('edit')
  }

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.email.trim() || !form.rolId) {
      setFormErr('Nombre, email y rol son obligatorios.')
      return
    }
    if (modal === 'create' && !form.password) {
      setFormErr('La contraseña es obligatoria al crear un usuario.')
      return
    }
    setSaving(true)
    setFormErr(null)
    try {
      if (modal === 'create') {
        await axios.post('/api/admin/usuarios', form)
        showToast('Usuario creado correctamente.')
      } else {
        await axios.patch(`/api/admin/usuarios/${editId}`, form)
        showToast('Usuario actualizado correctamente.')
      }
      setModal(null)
      load()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
      setFormErr(msg ?? 'Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  // ── toggle activo ──────────────────────────────────────────────────────────
  const toggleActivo = async (u: Usuario) => {
    await axios.patch(`/api/admin/usuarios/${u.id}`, { activo: !u.activo })
    showToast(`Usuario ${!u.activo ? 'activado' : 'desactivado'}.`)
    load()
  }

  // ── delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await axios.delete(`/api/admin/usuarios/${deleteTarget.id}`)
      showToast('Usuario eliminado.')
      setDeleteTarget(null)
      load()
    } catch {
      showToast('No se pudo eliminar el usuario.', false)
    } finally {
      setDeleting(false)
    }
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-all"
          style={{
            backgroundColor: toast.ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color:           toast.ok ? '#10b981' : '#ef4444',
            border:          `1px solid ${toast.ok ? '#10b98144' : '#ef444444'}`,
          }}
        >
          {toast.ok ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Gestión de usuarios</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-soft)' }}>
            Administra accesos, roles y estado de los usuarios del sistema
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-petroleum)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total usuarios"  value={stats.total} />
        <StatCard label="Product Owner"   value={stats.po}    color="#3B82F6" />
        <StatCard label="Desarrolladores" value={stats.devs}  color="var(--color-petroleum)" />
        <StatCard label="QA"              value={stats.qa}    color="#10B981" />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-56">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-soft)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoComplete="off"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
        </div>

        {/* Filtro rol */}
        <select
          value={filterRol}
          onChange={e => setFilterRol(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border outline-none"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
        >
          <option value="">Todos los roles</option>
          {roles.map(r => <option key={r.id} value={r.nombre}>{ROL_LABELS[r.nombre] ?? r.nombre}</option>)}
        </select>

        {/* Filtro estado */}
        <select
          value={filterActivo}
          onChange={e => setFilterActivo(e.target.value as typeof filterActivo)}
          className="px-3 py-2.5 text-sm rounded-xl border outline-none"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
        >
          <option value="all">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>

        {/* Contador */}
        <div className="flex items-center px-3 py-2 rounded-xl text-xs font-medium" style={{ color: 'var(--color-text-soft)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-24">
          <span className="w-9 h-9 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-petroleum)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3" style={{ color: 'var(--color-text-soft)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-1a4 4 0 0 0-4-4h-1M9 20H4v-1a4 4 0 0 1 4-4h1m4-4a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
          </svg>
          <p className="text-sm">No se encontraron usuarios con esos filtros.</p>
          <button onClick={() => { setSearch(''); setFilterRol(''); setFilterActivo('all') }} className="text-xs underline" style={{ color: 'var(--color-petroleum)' }}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                {['Usuario', 'Email', 'Rol', 'Estado', 'Creado', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-soft)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr
                  key={u.id}
                  className="group transition-colors"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Usuario */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar nombre={u.nombre} rolNombre={u.rol.nombre} />
                      <span className="font-medium" style={{ color: 'var(--color-text)' }}>{u.nombre}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--color-text-soft)' }}>{u.email}</td>

                  {/* Rol */}
                  <td className="px-4 py-3"><RolBadge nombre={u.rol.nombre} /></td>

                  {/* Estado — clic para toggle */}
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActivo(u)} title={`Clic para ${u.activo ? 'desactivar' : 'activar'}`} className="transition-opacity hover:opacity-75">
                      <StatusBadge activo={u.activo} />
                    </button>
                  </td>

                  {/* Creado */}
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-soft)' }}>
                    {new Date(u.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all hover:opacity-80"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'var(--color-surface)' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all hover:bg-red-50"
                        style={{ borderColor: '#ef444433', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.06)' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal Crear / Editar ─────────────────────────────────────────────── */}
      {modal && (
        <Modal onClose={() => setModal(null)}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                {modal === 'create' ? 'Nuevo usuario' : 'Editar usuario'}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-soft)' }}>
                {modal === 'create' ? 'Completa todos los campos para crear el acceso.' : 'Modifica los datos del usuario.'}
              </p>
            </div>
            <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--color-text-soft)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-soft)' }}>Nombre completo</label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez García"
                value={form.nombre}
                onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                autoComplete="off"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-soft)' }}>Correo electrónico</label>
              <input
                type="email"
                placeholder="usuario@indra.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                autoComplete="off"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-soft)' }}>
                {modal === 'create' ? 'Contraseña' : 'Nueva contraseña'}
                {modal === 'edit' && <span className="ml-1 font-normal normal-case">(dejar vacío para no cambiar)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="new-password"
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border outline-none"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--color-text)' }}
                >
                  {showPass ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.9 9.9 0 015.657 1.757M15 12a3 3 0 11-6 0 3 3 0 016 0zm3.536-3.536L4.464 19.536" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Rol */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-soft)' }}>Rol</label>
              <select
                value={form.rolId}
                onChange={e => setForm(p => ({ ...p, rolId: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
              >
                <option value="">— Seleccionar rol —</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{ROL_LABELS[r.nombre] ?? r.nombre}</option>
                ))}
              </select>
            </div>

            {/* Estado (solo en edición) */}
            {modal === 'edit' && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Usuario activo</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>Los usuarios inactivos no pueden iniciar sesión</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, activo: !p.activo }))}
                  className="relative w-11 h-6 rounded-full transition-all"
                  style={{ backgroundColor: form.activo ? 'var(--color-petroleum)' : '#d1d5db' }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                    style={{ transform: form.activo ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
            )}

            {/* Error */}
            {formErr && (
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(192,57,43,0.08)', color: '#C0392B' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {formErr}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={() => setModal(null)}
              className="px-4 py-2.5 text-sm rounded-xl border transition-all hover:opacity-80"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'var(--color-surface)' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-60 transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-petroleum)' }}
            >
              {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? 'Guardando…' : modal === 'create' ? 'Crear usuario' : 'Guardar cambios'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal Confirmar Eliminación ──────────────────────────────────────── */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Eliminar usuario</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-soft)' }}>
                  ¿Estás seguro de que deseas eliminar a <strong style={{ color: 'var(--color-text)' }}>{deleteTarget.nombre}</strong>?
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <Avatar nombre={deleteTarget.nombre} rolNombre={deleteTarget.rol.nombre} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{deleteTarget.nombre}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>{deleteTarget.email} · <RolBadge nombre={deleteTarget.rol.nombre} /></p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 text-sm rounded-xl border transition-all hover:opacity-80"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'var(--color-surface)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-60"
                style={{ backgroundColor: '#ef4444' }}
              >
                {deleting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {deleting ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
