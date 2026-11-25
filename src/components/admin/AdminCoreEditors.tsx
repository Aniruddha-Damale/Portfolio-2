import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import type {
  AboutBlockData,
  AboutMeData,
  ProfileData,
  SkillCategoryData,
  SkillItemData,
} from '../../types/portfolio.ts';
import { apiRequest } from '../../lib/api.ts';
import { DynamicIcon, SKILL_ICON_NAMES } from '../../lib/icons.tsx';
import { FileUploadField } from '../ui/FileUploadField.tsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.tsx';

interface EditorCommonProps {
  getToken: () => Promise<string | null>;
  onRefresh: () => Promise<void>;
  notify: (type: 'success' | 'error', text: string) => void;
}

// ============================================================================
// HOME / HERO EDITOR
// ============================================================================
export function HomeSectionEditor({
  profile,
  getToken,
  onRefresh,
  notify,
}: EditorCommonProps & { profile: ProfileData }) {
  const [form, setForm] = useState<ProfileData>(profile);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      await apiRequest('/api/admin/profile', { method: 'PUT', token, body: form });
      await onRefresh();
      notify('success', 'Home section saved to PostgreSQL.');
    } catch (err: any) {
      notify('error', err.message || 'Failed to save Home section.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-950 dark:text-white">
            Home Section Editor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update your name, headline, bio, portrait, buttons, and visibility toggles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setForm(profile)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg accent-bg text-white text-xs font-semibold disabled:opacity-50 whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Professional Title
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Short Introduction
        </label>
        <textarea
          rows={4}
          required
          value={form.intro}
          onChange={(e) => setForm({ ...form, intro: e.target.value })}
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
        />
      </div>

      <FileUploadField
        label="Profile Picture"
        value={form.avatarUrl}
        category="avatar"
        helperText="Upload PNG, JPG, or WebP. You can also adjust brightness, contrast, and rotation."
        getToken={getToken}
        onUploaded={(res) => setForm({ ...form, avatarUrl: res.url })}
        onClear={() => setForm({ ...form, avatarUrl: '' })}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Primary Button Text
          </label>
          <input
            type="text"
            value={form.primaryCtaText}
            onChange={(e) => setForm({ ...form, primaryCtaText: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Secondary Button Text
          </label>
          <input
            type="text"
            value={form.secondaryCtaText}
            onChange={(e) => setForm({ ...form, secondaryCtaText: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Hero Background Style
          </label>
          <select
            value={form.heroBgStyle}
            onChange={(e) => setForm({ ...form, heroBgStyle: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
          >
            <option value="editorial">Subtle Soft Gradient</option>
            <option value="grid">Architectural Grid</option>
            <option value="minimal">Clean Minimal Solid</option>
            <option value="custom">Custom Background Image</option>
          </select>
        </div>
      </div>

      {form.heroBgStyle === 'custom' && (
        <FileUploadField
          label="Custom Hero Background Image"
          value={form.heroBgImageUrl}
          category="hero"
          getToken={getToken}
          onUploaded={(res) => setForm({ ...form, heroBgImageUrl: res.url })}
          onClear={() => setForm({ ...form, heroBgImageUrl: '' })}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Location (optional)
        </label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="City, Country"
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
        />
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">
          Element Visibility
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          {[
            { key: 'showAvatar', label: 'Show Profile Picture' },
            { key: 'showPrimaryCta', label: 'Show Primary Button' },
            { key: 'showSecondaryCta', label: 'Show Resume Button' },
            { key: 'showSocialIcons', label: 'Show Social Icons' },
            { key: 'showLocation', label: 'Show Location' },
          ].map((toggle) => (
            <label
              key={toggle.key}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={Boolean((form as any)[toggle.key])}
                onChange={(e) =>
                  setForm({ ...form, [toggle.key]: e.target.checked } as ProfileData)
                }
                className="rounded accent-blue-600"
              />
              <span className="text-slate-700 dark:text-slate-300">{toggle.label}</span>
            </label>
          ))}
        </div>
      </div>
    </form>
  );
}

// ============================================================================
// ABOUT ME EDITOR
// ============================================================================
export function AboutMeEditor({
  about,
  getToken,
  onRefresh,
  notify,
}: EditorCommonProps & { about: AboutMeData }) {
  const [heading, setHeading] = useState(about.heading);
  const [subheading, setSubheading] = useState(about.subheading);
  const [imageUrl, setImageUrl] = useState(about.imageUrl);
  const [showImage, setShowImage] = useState(about.showImage);
  const [interests, setInterests] = useState<string[]>(about.areasOfInterest);
  const [newInterest, setNewInterest] = useState('');
  const [savingHeader, setSavingHeader] = useState(false);

  const [editingBlock, setEditingBlock] = useState<Partial<AboutBlockData> | null>(null);
  const [savingBlock, setSavingBlock] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AboutBlockData | null>(null);

  useEffect(() => {
    setHeading(about.heading);
    setSubheading(about.subheading);
    setImageUrl(about.imageUrl);
    setShowImage(about.showImage);
    setInterests(about.areasOfInterest);
  }, [about]);

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHeader(true);
    try {
      const token = await getToken();
      await apiRequest('/api/admin/about', {
        method: 'PUT',
        token,
        body: {
          heading,
          subheading,
          imageUrl,
          showImage,
          areasOfInterest: interests,
        },
      });
      await onRefresh();
      notify('success', 'About Me overview saved.');
    } catch (err: any) {
      notify('error', err.message || 'Failed to save About Me.');
    } finally {
      setSavingHeader(false);
    }
  };

  const handleSaveBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock?.title?.trim() || !editingBlock?.content?.trim()) return;
    setSavingBlock(true);
    try {
      const token = await getToken();
      if (editingBlock.id) {
        await apiRequest(`/api/admin/about-blocks/${editingBlock.id}`, {
          method: 'PUT',
          token,
          body: {
            title: editingBlock.title.trim(),
            content: editingBlock.content.trim(),
            isVisible: editingBlock.isVisible ?? true,
          },
        });
      } else {
        await apiRequest('/api/admin/about-blocks', {
          method: 'POST',
          token,
          body: {
            title: editingBlock.title.trim(),
            content: editingBlock.content.trim(),
            isVisible: editingBlock.isVisible ?? true,
          },
        });
      }
      setEditingBlock(null);
      await onRefresh();
      notify('success', 'About Me content block saved.');
    } catch (err: any) {
      notify('error', err.message || 'Failed to save content block.');
    } finally {
      setSavingBlock(false);
    }
  };

  const handleMoveBlock = async (index: number, direction: 'up' | 'down') => {
    const next = [...about.blocks];
    const swap = direction === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    try {
      const token = await getToken();
      await apiRequest('/api/admin/about-blocks/reorder', {
        method: 'PUT',
        token,
        body: { ids: next.map((b) => b.id) },
      });
      await onRefresh();
      notify('success', 'About Me block order updated.');
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleDeleteBlock = async () => {
    if (!deleteTarget) return;
    try {
      const token = await getToken();
      await apiRequest(`/api/admin/about-blocks/${deleteTarget.id}`, {
        method: 'DELETE',
        token,
      });
      setDeleteTarget(null);
      await onRefresh();
      notify('success', 'About Me block deleted.');
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSaveHeader} className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-950 dark:text-white">
              About Me Editor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Edit headings, image, areas of interest, and reorderable narrative blocks.
            </p>
          </div>
          <button
            type="submit"
            disabled={savingHeader}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg accent-bg text-white text-xs font-semibold disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {savingHeader ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Section Heading
            </label>
            <input
              type="text"
              required
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 cursor-pointer w-full">
              <input
                type="checkbox"
                checked={showImage}
                onChange={(e) => setShowImage(e.target.checked)}
                className="rounded accent-blue-600"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Display About Me image
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Subheading
          </label>
          <textarea
            rows={2}
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>

        <FileUploadField
          label="About Me Image"
          value={imageUrl}
          category="about"
          getToken={getToken}
          onUploaded={(res) => setImageUrl(res.url)}
          onClear={() => setImageUrl('')}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Areas of Interest
          </label>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {interests.map((item, idx) => (
              <span
                key={`${item}-${idx}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                {item}
                <button
                  type="button"
                  onClick={() => setInterests(interests.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-red-500"
                  aria-label={`Remove ${item}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const v = newInterest.trim();
                  if (v && !interests.includes(v)) {
                    setInterests([...interests, v]);
                    setNewInterest('');
                  }
                }
              }}
              placeholder="Add area of interest (e.g., Cloud Computing)"
              className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
            <button
              type="button"
              onClick={() => {
                const v = newInterest.trim();
                if (v && !interests.includes(v)) {
                  setInterests([...interests, v]);
                  setNewInterest('');
                }
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              Add Interest
            </button>
          </div>
        </div>
      </form>

      {/* Narrative Blocks Manager */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white">
            About Paragraphs & Headings
          </h3>
          <button
            type="button"
            onClick={() => setEditingBlock({ title: '', content: '', isVisible: true })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg accent-bg text-white text-xs font-medium whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Content Block
          </button>
        </div>

        {editingBlock && (
          <form
            onSubmit={handleSaveBlock}
            className="p-5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Block Heading
              </label>
              <input
                type="text"
                required
                value={editingBlock.title ?? ''}
                onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                placeholder="e.g., Career Goals"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Paragraph Content
              </label>
              <textarea
                rows={4}
                required
                value={editingBlock.content ?? ''}
                onChange={(e) => setEditingBlock({ ...editingBlock, content: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingBlock(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingBlock}
                className="px-4 py-1.5 rounded-lg accent-bg text-white text-xs font-semibold disabled:opacity-50"
              >
                {savingBlock ? 'Saving...' : 'Save Block'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {about.blocks.map((block, idx) => (
            <div
              key={block.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {block.title}
                  </h4>
                  {!block.isVisible && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">· Hidden</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {block.content}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => void handleMoveBlock(idx, 'up')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                  title="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === about.blocks.length - 1}
                  onClick={() => void handleMoveBlock(idx, 'down')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                  title="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const token = await getToken();
                      await apiRequest(`/api/admin/about-blocks/${block.id}`, {
                        method: 'PUT',
                        token,
                        body: { isVisible: !block.isVisible },
                      });
                      await onRefresh();
                    } catch (err: any) {
                      notify('error', err.message);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={block.isVisible ? 'Hide' : 'Show'}
                >
                  {block.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBlock(block)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(block)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Content Block"
        description={`Remove "${deleteTarget?.title}" from your About Me section?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDeleteBlock()}
      />
    </div>
  );
}

// ============================================================================
// SKILLS MANAGER
// ============================================================================
export function SkillsManagerEditor({
  categories,
  getToken,
  onRefresh,
  notify,
}: EditorCommonProps & { categories: SkillCategoryData[] }) {
  const [catForm, setCatForm] = useState<Partial<SkillCategoryData> | null>(null);
  const [skillForm, setSkillForm] = useState<Partial<SkillItemData> | null>(null);
  const [deleteCatTarget, setDeleteCatTarget] = useState<SkillCategoryData | null>(null);
  const [deleteSkillTarget, setDeleteSkillTarget] = useState<SkillItemData | null>(null);
  const [busy, setBusy] = useState(false);

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm?.name?.trim()) return;
    setBusy(true);
    try {
      const token = await getToken();
      if (catForm.id) {
        await apiRequest(`/api/admin/skill-categories/${catForm.id}`, {
          method: 'PUT',
          token,
          body: {
            name: catForm.name.trim(),
            description: catForm.description ?? '',
            icon: catForm.icon ?? 'Code2',
            isVisible: catForm.isVisible ?? true,
          },
        });
      } else {
        await apiRequest('/api/admin/skill-categories', {
          method: 'POST',
          token,
          body: {
            name: catForm.name.trim(),
            description: catForm.description ?? '',
            icon: catForm.icon ?? 'Code2',
            isVisible: catForm.isVisible ?? true,
          },
        });
      }
      setCatForm(null);
      await onRefresh();
      notify('success', 'Skill category saved.');
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm?.name?.trim() || !skillForm.categoryId) return;
    setBusy(true);
    try {
      const token = await getToken();
      const payload = {
        categoryId: Number(skillForm.categoryId),
        name: skillForm.name.trim(),
        description: (skillForm.description ?? '').trim(),
        icon: skillForm.icon ?? 'Code2',
        iconType: skillForm.iconType ?? 'lucide',
        isVisible: skillForm.isVisible ?? true,
      };
      if (skillForm.id) {
        await apiRequest(`/api/admin/skills/${skillForm.id}`, {
          method: 'PUT',
          token,
          body: payload,
        });
      } else {
        await apiRequest('/api/admin/skills', {
          method: 'POST',
          token,
          body: payload,
        });
      }
      setSkillForm(null);
      await onRefresh();
      notify('success', 'Skill saved.');
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setBusy(false);
    }
  };

  const reorderCategory = async (index: number, dir: 'up' | 'down') => {
    const next = [...categories];
    const swap = dir === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    try {
      const token = await getToken();
      await apiRequest('/api/admin/skill-categories/reorder', {
        method: 'PUT',
        token,
        body: { ids: next.map((c) => c.id) },
      });
      await onRefresh();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const reorderSkill = async (cat: SkillCategoryData, index: number, dir: 'up' | 'down') => {
    const next = [...cat.skills];
    const swap = dir === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    try {
      const token = await getToken();
      await apiRequest('/api/admin/skills/reorder', {
        method: 'PUT',
        token,
        body: { ids: next.map((s) => s.id) },
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
            Skills Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create categories, add/edit/delete skills, move skills between categories, choose or
            upload icons, and toggle visibility.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setCatForm({ name: '', description: '', icon: 'Code2', isVisible: true })
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            New Category
          </button>
          <button
            type="button"
            disabled={categories.length === 0}
            onClick={() =>
              setSkillForm({
                categoryId: categories[0]?.id,
                name: '',
                icon: 'Code2',
                iconType: 'lucide',
                isVisible: true,
              })
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg accent-bg text-white text-xs font-semibold disabled:opacity-40 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Skill
          </button>
        </div>
      </div>

      {/* Category Form */}
      {catForm && (
        <form
          onSubmit={saveCategory}
          className="p-5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {catForm.id ? 'Edit Skill Category' : 'Create Skill Category'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Category Name</label>
              <input
                type="text"
                required
                value={catForm.name ?? ''}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="e.g., Cloud & DevOps"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Category Icon</label>
              <select
                value={catForm.icon ?? 'Code2'}
                onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                {SKILL_ICON_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Short Description</label>
            <input
              type="text"
              value={catForm.description ?? ''}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCatForm(null)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-1.5 rounded-lg accent-bg text-white text-xs font-semibold"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* Skill Form */}
      {skillForm && (
        <form
          onSubmit={saveSkill}
          className="p-5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {skillForm.id ? 'Edit Skill' : 'Add New Skill'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Skill Name</label>
              <input
                type="text"
                required
                value={skillForm.name ?? ''}
                onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                placeholder="e.g., TypeScript"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={skillForm.categoryId ?? categories[0]?.id}
                onChange={(e) =>
                  setSkillForm({ ...skillForm, categoryId: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Icon Mode</label>
              <select
                value={skillForm.iconType ?? 'lucide'}
                onChange={(e) =>
                  setSkillForm({
                    ...skillForm,
                    iconType: e.target.value as 'lucide' | 'image',
                    icon: e.target.value === 'lucide' ? 'Code2' : '',
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="lucide">Built-in Icon</option>
                <option value="image">Upload Custom Icon</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Short Description</label>
            <input
              type="text"
              value={skillForm.description ?? ''}
              onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
              placeholder="e.g., Hooks, modular state & component trees"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          {skillForm.iconType === 'image' ? (
            <FileUploadField
              label="Skill Icon Image"
              value={skillForm.icon ?? ''}
              category="skill-icon"
              allowImageEdit={false}
              getToken={getToken}
              onUploaded={(res) => setSkillForm({ ...skillForm, icon: res.url })}
              onClear={() => setSkillForm({ ...skillForm, icon: '' })}
            />
          ) : (
            <div>
              <label className="block text-xs font-medium mb-1.5">Choose Icon</label>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_ICON_NAMES.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSkillForm({ ...skillForm, icon: iconName })}
                    className={`p-2 rounded-lg border text-xs inline-flex items-center gap-1.5 ${
                      skillForm.icon === iconName
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300'
                    }`}
                    title={iconName}
                  >
                    <DynamicIcon name={iconName} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSkillForm(null)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-1.5 rounded-lg accent-bg text-white text-xs font-semibold"
            >
              Save Skill
            </button>
          </div>
        </form>
      )}

      {/* Categories & Skills List */}
      <div className="space-y-4">
        {categories.map((cat, catIdx) => (
          <div
            key={cat.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
          >
            <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <DynamicIcon name={cat.icon} className="w-4 h-4 accent-text" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {cat.name}
                </span>
                {!cat.isVisible && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">· Hidden</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setSkillForm({
                      categoryId: cat.id,
                      name: '',
                      icon: 'Code2',
                      iconType: 'lucide',
                      isVisible: true,
                    })
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium accent-text hover:bg-blue-50 dark:hover:bg-blue-950/40"
                >
                  <Plus className="w-3 h-3" />
                  Add Skill
                </button>
                <button
                  type="button"
                  disabled={catIdx === 0}
                  onClick={() => void reorderCategory(catIdx, 'up')}
                  className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-30"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={catIdx === categories.length - 1}
                  onClick={() => void reorderCategory(catIdx, 'down')}
                  className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-30"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCatForm(cat)}
                  className="p-1.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 text-blue-600"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteCatTarget(cat)}
                  className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {cat.skills.length === 0 ? (
                <p className="px-5 py-4 text-xs text-slate-500">No skills in this category yet.</p>
              ) : (
                cat.skills.map((skill, sIdx) => (
                  <div
                    key={skill.id}
                    className="px-5 py-3 flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {skill.iconType === 'image' && skill.icon ? (
                        <img
                          src={skill.icon}
                          alt={skill.name}
                          referrerPolicy="no-referrer"
                          className="w-4 h-4 object-contain"
                        />
                      ) : (
                        <DynamicIcon name={skill.icon} className="w-4 h-4 text-slate-500" />
                      )}
                      <span
                        className={`font-medium truncate ${
                          skill.isVisible
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400 line-through'
                        }`}
                      >
                        {skill.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={sIdx === 0}
                        onClick={() => void reorderSkill(cat, sIdx, 'up')}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={sIdx === cat.skills.length - 1}
                        onClick={() => void reorderSkill(cat, sIdx, 'down')}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const token = await getToken();
                            await apiRequest(`/api/admin/skills/${skill.id}`, {
                              method: 'PUT',
                              token,
                              body: { isVisible: !skill.isVisible },
                            });
                            await onRefresh();
                          } catch (err: any) {
                            notify('error', err.message);
                          }
                        }}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        title={skill.isVisible ? 'Hide skill' : 'Show skill'}
                      >
                        {skill.isVisible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSkillForm(skill)}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteSkillTarget(skill)}
                        className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteCatTarget)}
        title="Delete Skill Category"
        description={`Delete "${deleteCatTarget?.name}" and all skills inside it?`}
        onCancel={() => setDeleteCatTarget(null)}
        onConfirm={async () => {
          if (!deleteCatTarget) return;
          try {
            const token = await getToken();
            await apiRequest(`/api/admin/skill-categories/${deleteCatTarget.id}`, {
              method: 'DELETE',
              token,
            });
            setDeleteCatTarget(null);
            await onRefresh();
            notify('success', 'Category deleted.');
          } catch (err: any) {
            notify('error', err.message);
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteSkillTarget)}
        title="Delete Skill"
        description={`Remove "${deleteSkillTarget?.name}" from your portfolio?`}
        onCancel={() => setDeleteSkillTarget(null)}
        onConfirm={async () => {
          if (!deleteSkillTarget) return;
          try {
            const token = await getToken();
            await apiRequest(`/api/admin/skills/${deleteSkillTarget.id}`, {
              method: 'DELETE',
              token,
            });
            setDeleteSkillTarget(null);
            await onRefresh();
            notify('success', 'Skill deleted.');
          } catch (err: any) {
            notify('error', err.message);
          }
        }}
      />
    </div>
  );
}
