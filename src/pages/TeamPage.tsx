import { useEffect, useState, useCallback } from 'react'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import {
  UserPlus, Crown, Edit2, Eye, Trash2, Users, Plus, X, RefreshCw,
  ChevronDown, Check, Shield, AlertTriangle, Pencil, Copy
} from 'lucide-react'
import type { Team, TeamMember } from '../types'
import { motion, AnimatePresence } from 'framer-motion'

// â”€â”€â”€ Role config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ROLES = {
  admin:  { label: 'Admin',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Crown,  desc: 'Full access â€” manage members, settings, all sites' },
  editor: { label: 'Editor', color: '#818cf8', bg: 'rgba(99,102,241,0.12)',  icon: Edit2,  desc: 'Can create and edit sites and pages' },
  viewer: { label: 'Viewer', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: Eye,    desc: 'Read-only access to team sites' },
} as const

type RoleKey = keyof typeof ROLES

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLES[role as RoleKey] || ROLES.viewer
  const Icon = cfg.icon
  return (
    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={11} /> {cfg.label}
    </span>
  )
}

// â”€â”€â”€ Avatar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const colors = ['#6366f1,#7c3aed', '#0ea5e9,#6366f1', '#10b981,#0ea5e9', '#f59e0b,#ef4444']
  const idx = name.charCodeAt(0) % colors.length
  const [a, b] = colors[idx].split(',')
  return (
    <div className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${a}, ${b})`, fontSize: size * 0.38 }}>
      {(name[0] || '?').toUpperCase()}
    </div>
  )
}

// â”€â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function TeamPage() {
  const { user } = useAuthStore()
  const [teams, setTeams] = useState<Team[]>([])
  const [selected, setSelected] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<RoleKey>('editor')
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [inviting, setInviting] = useState(false)

  // Create form
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)

  // Edit team name
  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState('')

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // â”€â”€â”€ Loaders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadMembers = useCallback(async (t: Team) => {
    setLoadingMembers(true)
    try {
      const { data } = await api.get(`/teams/${t.id}`)
      setMembers(data.members || [])
      // Update member count in list
      setTeams(prev => prev.map(tm => tm.id === t.id ? { ...tm, members_count: (data.members || []).length } : tm))
    } catch {
      toast.error('Failed to load members')
    } finally {
      setLoadingMembers(false)
    }
  }, [])

  const pickTeam = useCallback((t: Team) => {
    setSelected(t)
    setEditingName(false)
    setConfirmDelete(false)
    loadMembers(t)
  }, [loadMembers])

  const loadTeams = useCallback(async () => {
    try {
      const { data } = await api.get('/teams')
      const list: Team[] = data.data || data
      setTeams(list)
      if (list.length && !selected) pickTeam(list[0])
    } catch {
      toast.error('Failed to load teams')
    }
  }, [])

  useEffect(() => { loadTeams() }, [])

  // â”€â”€â”€ Create â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const createTeam = async () => {
    if (!newName.trim()) { toast.error('Team name is required'); return }
    setCreating(true)
    try {
      const { data } = await api.post('/teams', { name: newName, description: newDesc })
      const newTeam: Team = data
      setTeams(prev => [newTeam, ...prev])
      setNewName(''); setNewDesc(''); setShowCreate(false)
      toast.success('Team created!')
      pickTeam(newTeam)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create team')
    } finally {
      setCreating(false)
    }
  }

  // â”€â”€â”€ Rename â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const renameTeam = async () => {
    if (!selected || !editName.trim()) return
    try {
      await api.put(`/teams/${selected.id}`, { name: editName })
      const updated = { ...selected, name: editName }
      setSelected(updated)
      setTeams(prev => prev.map(t => t.id === selected.id ? updated : t))
      setEditingName(false)
      toast.success('Team renamed!')
    } catch {
      toast.error('Failed to rename team')
    }
  }

  // â”€â”€â”€ Delete â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const deleteTeam = async () => {
    if (!selected) return
    setDeleting(true)
    try {
      await api.delete(`/teams/${selected.id}`)
      const remaining = teams.filter(t => t.id !== selected.id)
      setTeams(remaining)
      setSelected(null)
      setMembers([])
      setConfirmDelete(false)
      toast.success('Team deleted')
      if (remaining.length) pickTeam(remaining[0])
    } catch {
      toast.error('Failed to delete team')
    } finally {
      setDeleting(false)
    }
  }

  // â”€â”€â”€ Invite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const invite = async () => {
    if (!selected || !inviteEmail.trim()) return
    setInviting(true)
    try {
      await api.post(`/teams/${selected.id}/invite`, { email: inviteEmail, role: inviteRole })
      toast.success(`${inviteEmail} added as ${inviteRole}!`)
      setInviteEmail('')
      loadMembers(selected)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to invite â€” make sure they have a Jay CMS account')
    } finally {
      setInviting(false)
    }
  }

  // â”€â”€â”€ Remove member â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const removeMember = async (m: TeamMember) => {
    if (!selected || !confirm(`Remove ${m.name} from the team?`)) return
    try {
      await api.delete(`/teams/${selected.id}/members/${m.id}`)
      toast.success(`${m.name} removed`)
      loadMembers(selected)
    } catch {
      toast.error('Failed to remove member')
    }
  }

  // â”€â”€â”€ Change role â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const changeRole = async (userId: number, role: string) => {
    if (!selected) return
    try {
      await api.put(`/teams/${selected.id}/members/${userId}/role`, { role })
      toast.success('Role updated')
      loadMembers(selected)
    } catch {
      toast.error('Failed to update role')
    }
  }

  const isOwner = selected?.owner_id === user?.id

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Teams</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage workspace members and permissions</p>
        </div>
        <button onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
          <Plus size={14} /> New Team
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5">
            <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-white text-sm">Create New Team</p>
                <button onClick={() => setShowCreate(false)}><X size={14} className="text-slate-500" /></button>
              </div>
              <div className="flex flex-col gap-3">
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Team name *" autoFocus
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                  style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}
                  onKeyDown={e => e.key === 'Enter' && createTeam()} />
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)"
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }} />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400"
                    style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
                    Cancel
                  </button>
                  <button onClick={createTeam} disabled={creating || !newName.trim()}
                    className="px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                    {creating ? 'Creating...' : 'Create Team'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* â”€â”€ Team list â”€â”€ */}
        <div className="rounded-2xl p-4" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: '#64748b' }}>Your Teams</p>
          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              <Users size={28} style={{ color: '#334155' }} />
              <p className="text-sm text-slate-500">No teams yet</p>
              <button onClick={() => setShowCreate(true)} className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                Create first team
              </button>
            </div>
          ) : (
            teams.map(t => (
              <button key={t.id} onClick={() => pickTeam(t)}
                className="w-full text-left px-3 py-3 rounded-xl mb-1 transition-all"
                style={{
                  background: selected?.id === t.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: selected?.id === t.id ? '#818cf8' : '#94a3b8',
                  border: selected?.id === t.id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                    {t.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{t.name}</p>
                    <p className="text-xs opacity-60">{t.members_count ?? 0} member{(t.members_count ?? 0) !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* â”€â”€ Members panel â”€â”€ */}
        {selected ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Team header with name + actions */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                        className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                        style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}
                        onKeyDown={e => { if (e.key === 'Enter') renameTeam(); if (e.key === 'Escape') setEditingName(false) }} />
                      <button onClick={renameTeam} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10"><Check size={14} /></button>
                      <button onClick={() => setEditingName(false)} className="p-1.5 rounded-lg text-slate-500 hover:bg-white/5"><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-white text-lg truncate">{selected.name}</h2>
                      {isOwner && (
                        <button onClick={() => { setEditName(selected.name); setEditingName(true) }}
                          className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors" title="Rename team">
                          <Pencil size={13} />
                        </button>
                      )}
                    </div>
                  )}
                  {selected.description && <p className="text-sm text-slate-400 mt-0.5">{selected.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500">{members.length} member{members.length !== 1 ? 's' : ''}</span>
                    {isOwner && <span className="text-xs px-1.5 py-0.5 rounded text-amber-400" style={{ background: 'rgba(245,158,11,0.1)' }}>You own this team</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => loadMembers(selected)} title="Refresh"
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-300 transition-colors hover:bg-white/5">
                    <RefreshCw size={14} />
                  </button>
                  {isOwner && (
                    <button onClick={() => setConfirmDelete(v => !v)} title="Delete team"
                      className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Delete confirmation */}
              <AnimatePresence>
                {confirmDelete && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden">
                    <div className="p-4 rounded-xl mb-4 flex items-start gap-3"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-400">Delete team "{selected.name}"?</p>
                        <p className="text-xs text-slate-400 mt-0.5">This will permanently remove the team and all its members. Sites won't be deleted.</p>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-400"
                            style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
                            Cancel
                          </button>
                          <button onClick={deleteTeam} disabled={deleting}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
                            style={{ background: '#ef4444' }}>
                            {deleting ? 'Deleting...' : 'Yes, delete team'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Members list */}
              {loadingMembers ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--color-surface-3)' }} />)}
                </div>
              ) : members.length === 0 ? (
                <div className="py-8 text-center">
                  <Users size={28} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No members yet. Invite someone below.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {members.map(m => {
                    const isMe = m.id === user?.id
                    const isTeamOwner = m.id === selected.owner_id
                    return (
                      <div key={m.id} className="flex items-center justify-between py-3 px-3 rounded-xl"
                        style={{ background: 'var(--color-surface-3)', border: isMe ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent' }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={m.name || '?'} size={36} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-white truncate">{m.name}</p>
                              {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded text-indigo-400" style={{ background: 'rgba(99,102,241,0.12)' }}>You</span>}
                              {isTeamOwner && <Crown size={11} style={{ color: '#f59e0b' }} />}
                            </div>
                            <p className="text-xs text-slate-500 truncate">{m.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <RoleBadge role={m.pivot?.role || 'viewer'} />
                          {isOwner && !isTeamOwner && (
                            <>
                              <select value={m.pivot?.role || 'viewer'} onChange={e => changeRole(m.id, e.target.value)}
                                className="text-xs px-2 py-1 rounded-lg outline-none"
                                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: '#94a3b8' }}>
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                                <option value="viewer">Viewer</option>
                              </select>
                              <button onClick={() => removeMember(m)}
                                className="p-1.5 rounded-lg transition-colors text-slate-600 hover:text-red-400 hover:bg-red-500/10">
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Invite form */}
            {isOwner && (
              <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus size={15} className="text-indigo-400" />
                  <p className="font-semibold text-white text-sm">Invite Member</p>
                </div>

                {/* Role explanation */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {Object.entries(ROLES).map(([key, cfg]) => {
                    const Icon = cfg.icon
                    return (
                      <button key={key} type="button" onClick={() => setInviteRole(key as RoleKey)}
                        className="p-2.5 rounded-xl text-left transition-all"
                        style={inviteRole === key
                          ? { background: cfg.bg, border: `1px solid ${cfg.color}50` }
                          : { background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon size={11} style={{ color: cfg.color }} />
                          <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                          {inviteRole === key && <Check size={10} className="ml-auto" style={{ color: cfg.color }} />}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">{cfg.desc}</p>
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-2">
                  <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email address"
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                    style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}
                    onKeyDown={e => e.key === 'Enter' && invite()} />
                  <button onClick={invite} disabled={inviting || !inviteEmail.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                    <UserPlus size={14} />
                    {inviting ? 'Adding...' : 'Invite'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">The user must already have a Jay CMS account with this email.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center rounded-2xl"
            style={{ background: 'var(--color-surface-2)', border: '2px dashed var(--color-border)', minHeight: 280 }}>
            <div className="text-center p-8">
              <Users size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">Select a team</p>
              <p className="text-sm text-slate-500">Choose a team from the left to manage its members.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
