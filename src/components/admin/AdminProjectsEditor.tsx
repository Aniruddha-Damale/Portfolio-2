import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Save,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import type { ProjectData } from '../../types/portfolio.ts';
import { apiRequest } from '../../lib/api.ts';
import { FileUploadField } from '../ui/FileUploadField.tsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.tsx';

interface AdminProjectsEditorProps {
  projects: ProjectData[];
  getToken: () => Promise<string | null>;
  onRefresh: () => Promise<void>;
  notify: (type: 'success' | 'error', text: string) => void;
}

const EMPTY_PROJECT: Omit<ProjectData, 'id' | 'sortOrder'> = {
  title: '',
  subtitle: '',
  description: '',
  imageUrl: '',
  technologies: [],
  features: [],
  githubUrl: '',
  liveDemoUrl: '',
  category: 'Software',
  status: 'In Progress',
  isFeatured: false,
  isVisible: true,
};

export function AdminProjectsEditor({
  projects,
  getToken,
  onRefresh,
  notify,
}: AdminProjectsEditorProps) {
  const [editing, setEditing] = useState<(Partial<ProjectData> & typeof EMPTY_PROJECT) | null>(
    null
  );
  const [techInput, setTechInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openNew = () => {
    setEditing({ ...EMPTY_PROJECT });
    setTechInput('');
    setFeatureInput('');
  };

  const openEdit = (p: ProjectData) => {
    setEditing({ ...p });
    setTechInput('');
    setFeatureInput('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.title.trim() || !editing.description.trim()) {
      notify('error', 'Project title and description are required.');
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      const body = {
        title: editing.title.trim(),
        subtitle: (editing.subtitle ?? '').trim(),
        description: editing.description.trim(),
        imageUrl: editing.imageUrl.trim(),
        technologies: editing.technologies,
        features: editing.features,
        githubUrl: editing.githubUrl.trim(),
        liveDemoUrl: editing.liveDemoUrl.trim(),
        category: editing.category.trim() || 'Software',
        status: editing.status.trim() || 'In Progress',
        isFeatured: Boolean(editing.isFeatured),
        isVisible: Boolean(editing.isVisible),
      };

      if (editing.id) {
        await apiRequest(`/api/admin/projects/${editing.id}`, {
          method: 'PUT',
          token,
          body,
        });
        notify('success', `Updated "${body.title}".`);
      } else {
        await apiRequest('/api/admin/projects', {
          method: 'POST',
          token,
          body,
        });
        notify('success', `Added "${body.title}" to your portfolio.`);
      }
      setEditing(null);
      await onRefresh();
    } catch (err: any) {
      notify('error', err.message || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await apiRequest(`/api/admin/projects/${deleteTarget.id}`, {
        method: 'DELETE',
        token,
      });
      notify('success', `Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
      await onRefresh();
    } catch (err: any) {
      notify('error', err.message || 'Failed to delete project.');
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (index: number, dir: 'up' | 'down') => {
    const next = [...projects];
    const swap = dir === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    try {
      const token = await getToken();
      await apiRequest('/api/admin/projects/reorder', {
        method: 'PUT',
        token,
        body: { ids: next.map((p) => p.id) },
      });
      await onRefresh();
      notify('success', 'Project display order updated.');
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const toggleFlag = async (p: ProjectData, field: 'isFeatured' | 'isVisible') => {
    try {
      const token = await getToken();
      await apiRequest(`/api/admin/projects/${p.id}`, {
        method: 'PUT',
        token,
        body: { [field]: !p[field] },
      });
      await onRefresh();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-950 dark:text-white">
            Projects Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add unlimited projects, upload screenshots, manage technologies & features, feature top
            work, reorder, or delete anytime.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg accent-bg text-white text-xs font-semibold whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Project
        </button>
      </div>

      {editing && (
        <form
          onSubmit={handleSave}
          className="p-6 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-display font-semibold text-slate-950 dark:text-white">
              {editing.id ? `Edit Project: ${editing.title}` : 'Add New Project'}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium mb-1">Project Title *</label>
              <input
                type="text"
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="e.g., SmartCity 360"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <input
                type="text"
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                placeholder="Web, AI, IoT, Smart Systems"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Status</label>
              <select
                value={editing.status}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Prototype">Prototype</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Project Subtitle / Tagline</label>
            <input
              type="text"
              value={editing.subtitle ?? ''}
              onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              placeholder="e.g., Urban Telemetry & Real-Time Monitoring Platform"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Project Description *</label>
            <textarea
              rows={4}
              required
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              placeholder="Explain the problem solved, architecture, and outcomes..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <FileUploadField
            label="Project Image / Screenshot"
            value={editing.imageUrl}
            category="project"
            helperText="Upload a 4:3 or 16:9 screenshot or cover image."
            getToken={getToken}
            onUploaded={(res) => setEditing({ ...editing, imageUrl: res.url })}
            onClear={() => setEditing({ ...editing, imageUrl: '' })}
          />

          {/* Technologies */}
          <div>
            <label className="block text-xs font-medium mb-1.5">Technologies</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {editing.technologies.map((tech, idx) => (
                <span
                  key={`${tech}-${idx}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        technologies: editing.technologies.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const v = techInput.trim();
                    if (v) {
                      setEditing({ ...editing, technologies: [...editing.technologies, v] });
                      setTechInput('');
                    }
                  }
                }}
                placeholder="Type a technology (e.g., React, Python, Arduino) and click Add"
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
              <button
                type="button"
                onClick={() => {
                  const v = techInput.trim();
                  if (v) {
                    setEditing({ ...editing, technologies: [...editing.technologies, v] });
                    setTechInput('');
                  }
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-900"
              >
                Add
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-xs font-medium mb-1.5">Key Features</label>
            <ul className="space-y-1.5 mb-2">
              {editing.features.map((feat, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <span>{feat}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        features: editing.features.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const v = featureInput.trim();
                    if (v) {
                      setEditing({ ...editing, features: [...editing.features, v] });
                      setFeatureInput('');
                    }
                  }
                }}
                placeholder="Add a key feature and click Add"
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
              <button
                type="button"
                onClick={() => {
                  const v = featureInput.trim();
                  if (v) {
                    setEditing({ ...editing, features: [...editing.features, v] });
                    setFeatureInput('');
                  }
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-900"
              >
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">GitHub Repository URL</label>
              <input
                type="url"
                value={editing.githubUrl}
                onChange={(e) => setEditing({ ...editing, githubUrl: e.target.value })}
                placeholder="https://github.com/username/project"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Live Demo URL</label>
              <input
                type="url"
                value={editing.liveDemoUrl}
                onChange={(e) => setEditing({ ...editing, liveDemoUrl: e.target.value })}
                placeholder="https://your-project-demo.com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.isFeatured}
                onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })}
                className="rounded accent-blue-600"
              />
              <span>Featured Project</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.isVisible}
                onChange={(e) => setEditing({ ...editing, isVisible: e.target.checked })}
                className="rounded accent-blue-600"
              />
              <span>Visible on Public Portfolio</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg accent-bg text-white text-xs font-semibold disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      )}

      {/* Existing Projects List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-sm text-slate-500">
            No projects yet. Click "Add Project" above to create your first project.
          </div>
        ) : (
          projects.map((p, idx) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  referrerPolicy="no-referrer"
                  className="w-24 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                />
              ) : (
                <div className="w-24 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium accent-text">{p.category}</span>
                  <span>·</span>
                  <span>{p.status}</span>
                  {p.isFeatured && (
                    <>
                      <span>·</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Featured</span>
                    </>
                  )}
                  {!p.isVisible && (
                    <>
                      <span>·</span>
                      <span className="text-red-500 font-medium">Hidden</span>
                    </>
                  )}
                </div>
                <h3 className="mt-0.5 text-base font-display font-semibold text-slate-900 dark:text-white truncate">
                  {p.title}
                </h3>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                  {p.description}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => void handleReorder(idx, 'up')}
                  title="Move up"
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === projects.length - 1}
                  onClick={() => void handleReorder(idx, 'down')}
                  title="Move down"
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void toggleFlag(p, 'isFeatured')}
                  title={p.isFeatured ? 'Unfeature' : 'Mark as featured'}
                  className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    p.isFeatured ? 'text-amber-500' : 'text-slate-400'
                  }`}
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void toggleFlag(p, 'isVisible')}
                  title={p.isVisible ? 'Hide project' : 'Show project'}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  {p.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  title="Edit project"
                  className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(p)}
                  title="Delete project"
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Project"
        description={`Are you sure you want to permanently delete "${deleteTarget?.title}"? It will be removed immediately from the public portfolio.`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
