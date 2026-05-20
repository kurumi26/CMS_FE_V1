import { useEffect, useRef, useState } from 'react'
import api from '../services/api'
import {
  Search, Upload, Trash2, Copy, Film, FileText, Music,
  Check, X, RefreshCw, Image as ImageIcon, Folder, FolderPlus,
  FolderOpen, Home, ChevronRight, MoveRight
} from 'lucide-react'
import toast from 'react-hot-toast'

interface MediaItem {
  id: number
  name: string
  original_name: string
  url: string
  type: 'image' | 'video' | 'audio' | 'document'
  mime_type: string
  size: number
  alt?: string
  folder?: string | null
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const typeIcon = (type: string) => {
  if (type === 'image') return <ImageIcon size={28} />
  if (type === 'video') return <Film size={28} />
  if (type === 'audio') return <Music size={28} />
  return <FileText size={28} />
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [editAlt, setEditAlt] = useState('')
  const [editName, setEditName] = useState('')
  const [editFolder, setEditFolder] = useState<string>('')
  const [dragging, setDragging] = useState(false)
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [movingTo, setMovingTo] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Derive folder list from media
  const folders: string[] = [...new Set(
    media.filter(m => m.folder).map(m => m.folder as string)
  )].sort()

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/media')
      setMedia(data.data || data)
    } catch {
      toast.error('Failed to load media')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMedia() }, [])

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true)
    let uploaded = 0
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      if (currentFolder) form.append('folder', currentFolder)
      try {
        await api.post('/media', form, { headers: { 'Content-Type': 'multipart/form-data' } })
        uploaded++
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    if (uploaded > 0) {
      toast.success(`${uploaded} file${uploaded > 1 ? 's' : ''} uploaded!`)
      fetchMedia()
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const createFolder = () => {
    const name = newFolderName.trim()
    if (!name) return
    if (folders.includes(name)) { toast.error('Folder already exists'); return }
    // Folder is virtual — it exists as long as files are in it, but we track it locally
    // to allow uploads into it before any files are moved
    setMedia(prev => [...prev]) // trigger re-derive; add a placeholder we can remove later
    toast.success(`Folder "${name}" created`)
    setCurrentFolder(name)
    setNewFolderName('')
    setShowNewFolder(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) uploadFiles(e.target.files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
  }

  const deleteItem = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.original_name}"?`)) return
    try {
      await api.delete(`/media/${item.id}`)
      toast.success('Deleted')
      setMedia(m => m.filter(x => x.id !== item.id))
      if (selected?.id === item.id) setSelected(null)
    } catch {
      toast.error('Failed to delete')
    }
  }

  const saveEdit = async () => {
    if (!selected) return
    try {
      await api.put(`/media/${selected.id}`, { name: editName, alt: editAlt, folder: editFolder || null })
      toast.success('Updated!')
      setMedia(m => m.map(x => x.id === selected.id ? { ...x, name: editName, alt: editAlt, folder: editFolder || null } : x))
      setSelected(s => s ? { ...s, name: editName, alt: editAlt, folder: editFolder || null } : null)
    } catch {
      toast.error('Update failed')
    }
  }

  const moveToFolder = async (item: MediaItem, folder: string | null) => {
    try {
      await api.put(`/media/${item.id}`, { name: item.name, folder: folder })
      setMedia(m => m.map(x => x.id === item.id ? { ...x, folder } : x))
      if (selected?.id === item.id) setSelected(s => s ? { ...s, folder } : null)
      toast.success(folder ? `Moved to "${folder}"` : 'Moved to root')
    } catch {
      toast.error('Failed to move file')
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard!')
  }

  const openItem = (item: MediaItem) => {
    setSelected(item)
    setEditName(item.name)
    setEditAlt(item.alt || '')
    setEditFolder(item.folder || '')
  }

  const filtered = media.filter(m => {
    const nameMatch = (m.original_name || m.name || '').toLowerCase().includes(search.toLowerCase())
    const typeMatch = !typeFilter || m.type === typeFilter
    const folderMatch = currentFolder === null ? !m.folder : m.folder === currentFolder
    return nameMatch && typeMatch && folderMatch
  })

  return (
    <div className="flex h-full overflow-hidden">
      {/* Folder Sidebar */}
      <div className="w-52 flex-shrink-0 flex flex-col border-r overflow-y-auto"
        style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
        <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Folders</p>
          <button onClick={() => setShowNewFolder(v => !v)}
            className="p-1 rounded text-slate-500 hover:text-indigo-400 transition-colors" title="New Folder">
            <FolderPlus size={14} />
          </button>
        </div>

        {showNewFolder && (
          <div className="p-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex gap-1">
              <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                placeholder="Folder name" autoFocus
                className="flex-1 text-xs px-2 py-1.5 rounded outline-none text-slate-200"
                style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}
                onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setShowNewFolder(false) }} />
              <button onClick={createFolder}
                className="px-2 py-1 rounded text-xs font-semibold text-white"
                style={{ background: '#6366f1' }}>
                Add
              </button>
            </div>
          </div>
        )}

        <nav className="flex-1 p-2 space-y-0.5">
          <button onClick={() => setCurrentFolder(null)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
            style={currentFolder === null
              ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8' }
              : { color: '#94a3b8' }}>
            <Home size={14} />
            <span className="truncate">All Files</span>
            <span className="ml-auto text-xs opacity-60">{media.filter(m => !m.folder).length}</span>
          </button>

          {folders.map(f => (
            <button key={f} onClick={() => setCurrentFolder(f)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all group"
              style={currentFolder === f
                ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8' }
                : { color: '#94a3b8' }}>
              {currentFolder === f ? <FolderOpen size={14} /> : <Folder size={14} />}
              <span className="truncate flex-1 text-left">{f}</span>
              <span className="text-xs opacity-60">{media.filter(m => m.folder === f).length}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-white">Media Library</h1>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                <button onClick={() => setCurrentFolder(null)} className="hover:text-slate-300 transition-colors">All Files</button>
                {currentFolder && (
                  <>
                    <ChevronRight size={10} />
                    <span className="text-slate-300">{currentFolder}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{filtered.length} files{currentFolder ? ` in "${currentFolder}"` : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchMedia} className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                style={{ background: 'var(--color-surface-2)' }}>
                <RefreshCw size={15} />
              </button>
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', opacity: uploading ? 0.6 : 1 }}>
                <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
                <input ref={fileInputRef} type="file" multiple
                  accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden" onChange={handleFileInput} disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-0"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <Search size={14} className="text-slate-500 flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..."
                className="outline-none text-sm bg-transparent text-slate-200 placeholder-slate-500 w-full" />
              {search && <button onClick={() => setSearch('')}><X size={13} className="text-slate-500" /></button>}
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: '#94a3b8' }}>
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>
          </div>
        </div>

        {/* Drop zone + grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6"
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}>

          {dragging && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center gap-4 p-12 rounded-3xl"
                style={{ background: 'rgba(99,102,241,0.15)', border: '2px dashed #6366f1', backdropFilter: 'blur(8px)' }}>
                <Upload size={48} style={{ color: '#818cf8' }} />
                <p className="text-lg font-bold text-white">Drop files to upload</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ background: 'var(--color-surface-2)' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4" style={{ color: '#475569' }}>
              <Upload size={48} style={{ opacity: 0.3 }} />
              <p className="font-medium text-slate-400">{search || typeFilter ? 'No files match your filter' : 'No files yet'}</p>
              {!search && !typeFilter && (
                <label className="cursor-pointer text-sm px-4 py-2 rounded-lg font-medium"
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                  Upload your first file
                  <input type="file" multiple className="hidden" onChange={handleFileInput} />
                </label>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map(item => (
                <div key={item.id} onClick={() => openItem(item)}
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all"
                  style={{
                    background: 'var(--color-surface-2)',
                    border: selected?.id === item.id ? '2px solid #6366f1' : '2px solid transparent',
                    boxShadow: selected?.id === item.id ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
                  }}>
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.alt || item.original_name}
                      className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500">
                      {typeIcon(item.type)}
                      <span className="text-xs px-2 truncate w-full text-center">{item.original_name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <button onClick={e => { e.stopPropagation(); copyUrl(item.url) }}
                      className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                      <Copy size={13} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteItem(item) }}
                      className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.5)', color: '#fff' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {selected?.id === item.id && (
                    <div className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: '#6366f1' }}>
                      <Check size={11} style={{ color: '#fff' }} />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 truncate"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: '#e2e8f0', fontSize: '10px' }}>
                    {item.original_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel — selected file details */}
      {selected && (
        <div className="w-72 flex-shrink-0 flex flex-col overflow-y-auto border-l"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
          <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-sm font-semibold text-white">File Details</p>
            <button onClick={() => setSelected(null)} className="p-1 rounded text-slate-500 hover:text-white transition-colors"><X size={14} /></button>
          </div>
          <div className="p-4">
            {selected.type === 'image' ? (
              <img src={selected.url} alt={selected.alt || selected.original_name}
                className="w-full rounded-xl object-cover max-h-48" />
            ) : (
              <div className="w-full rounded-xl flex items-center justify-center py-10"
                style={{ background: 'var(--color-surface-3)', color: '#475569' }}>
                {typeIcon(selected.type)}
              </div>
            )}
          </div>
          <div className="px-4 pb-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">File Name</label>
              <input value={editName} onChange={e => setEditName(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg outline-none text-slate-200"
                style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }} />
            </div>
            {selected.type === 'image' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Alt Text</label>
                <input value={editAlt} onChange={e => setEditAlt(e.target.value)} placeholder="Describe the image"
                  className="w-full text-sm px-3 py-2 rounded-lg outline-none text-slate-200"
                  style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }} />
              </div>
            )}
            <div className="text-xs text-slate-500 space-y-1 pt-1">
              <div className="flex justify-between"><span>Type</span><span className="text-slate-400 capitalize">{selected.type}</span></div>
              <div className="flex justify-between"><span>Size</span><span className="text-slate-400">{formatBytes(selected.size)}</span></div>
              <div className="flex justify-between"><span>MIME</span><span className="text-slate-400 truncate ml-2 max-w-[150px]">{selected.mime_type}</span></div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">URL</label>
              <div className="flex gap-1.5">
                <input readOnly value={selected.url}
                  className="flex-1 text-xs px-2 py-1.5 rounded-lg outline-none text-slate-400 truncate"
                  style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }} />
                <button onClick={() => copyUrl(selected.url)}
                  className="p-1.5 rounded-lg flex-shrink-0"
                  style={{ background: 'var(--color-surface-3)', color: '#818cf8' }}>
                  <Copy size={13} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Move to Folder</label>
              <div className="flex gap-1.5">
                <select value={editFolder} onChange={e => setEditFolder(e.target.value)}
                  className="flex-1 text-xs px-2 py-1.5 rounded-lg outline-none"
                  style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', color: '#94a3b8' }}>
                  <option value="">— Root —</option>
                  {folders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <button onClick={saveEdit}
              className="w-full py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
              Save Changes
            </button>
            <button onClick={() => deleteItem(selected)}
              className="w-full py-2 rounded-lg text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10">
              Delete File
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
