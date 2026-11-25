import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  Mail,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import type {
  ContactMessageData,
  CustomSectionData,
  CustomSectionItemData,
  SocialLinkData,
  WebsiteSettingsData,
} from '../../types/portfolio.ts';
import { apiRequest } from '../../lib/api.ts';
import { DynamicIcon, SOCIAL_ICON_NAMES } from '../../lib/icons.tsx';
import { FileUploadField } from '../ui/FileUploadField.tsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.tsx';

interface CommonProps {
  getToken: () => Promise<string | null>;
  onRefresh: () => Promise<void>;
  notify: (type: 'success' | 'error', text: string) => void;
}

// ============================================================================
// CONTACT & MESSAGES EDITOR
// ============================================================================
export function ContactAndInboxEditor({
  settings,
  messages,
  getToken,
  onRefresh,
  notify,
}: CommonProps & {
  settings: WebsiteSettingsData;
  messages: ContactMessageData[];
}) {
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [showContactEmail, setShowContactEmail] = useState(settings.showContactEmail);
  const [contactIntro, setContactIntro] = useState(settings.contactIntro);
  const [contactFormEnabled, setContactFormEnabled] = useState(settings.contactFormEnabled);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setContactEmail(settings.contactEmail);
    setShowContactEmail(settings.showContactEmail);
    setContactIntro(settings.contactIntro);
    setContactFormEnabled(settings.contactFormEnabled);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      await apiRequest('/api/admin/settings', {
        method: 'PUT',
        token,
        body: {
          contactEmail,
          showContactEmail,
          contactIntro,
          contactFormEnabled,
        },
      });
      await onRefresh();
      notify('success', 'Contact settings saved.');
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-950 dark:text-white">
              Contact Information Editor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure your public email, intro text, contact form toggle, and review incoming
              messages.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg accent-bg text-white text-xs font-semibold disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Public Email Address</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Enter your real email address"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Contact Section Intro</label>
          <textarea
            rows={3}
            value={contactIntro}
            onChange={(e) => setContactIntro(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showContactEmail}
              onChange={(e) => setShowContactEmail(e.target.checked)}
              className="rounded accent-blue-600"
            />
            <span>Show email address publicly</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={contactFormEnabled}
              onChange={(e) => setContactFormEnabled(e.target.checked)}
              className="rounded accent-blue-600"
            />
            <span>Enable public contact form</span>
          </label>
        </div>
      </form>

      {/* Incoming Visitor Messages */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 accent-text" />
            Visitor Messages ({messages.length})
          </h3>
        </div>

        {messages.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Messages sent through your public contact form will appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-xl border ${
                  m.isRead
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    : 'border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {m.subject}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      From {m.name} ({m.email}) ·{' '}
                      <span className="font-mono tabular-nums">
                        {new Date(m.createdAt).toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const token = await getToken();
                          await apiRequest(`/api/admin/messages/${m.id}`, {
                            method: 'PATCH',
                            token,
                            body: { isRead: !m.isRead },
                          });
                          await onRefresh();
                        } catch (err: any) {
                          notify('error', err.message);
                        }
                      }}
                      title={m.isRead ? 'Mark unread' : 'Mark as read'}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <Check className="w-3 h-3" />
                      {m.isRead ? 'Unread' : 'Mark Read'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const token = await getToken();
                          await apiRequest(`/api/admin/messages/${m.id}`, {
                            method: 'DELETE',
                            token,
                          });
                          await onRefresh();
                          notify('success', 'Message deleted.');
                        } catch (err: any) {
                          notify('error', err.message);
                        }
                      }}
                      className="p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-2.5 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {m.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SOCIAL MEDIA MANAGER
// ============================================================================
export function SocialMediaManagerEditor({
  socialLinks,
  getToken,
  onRefresh,
  notify,
}: CommonProps & { socialLinks: SocialLinkData[] }) {
  const [editing, setEditing] = useState<Partial<SocialLinkData> | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.platform?.trim() || !editing.label?.trim()) return;
    setSaving(true);
    try {
      const token = await getToken();
      const body = {
        platform: editing.platform.trim(),
        label: editing.label.trim(),
        url: (editing.url ?? '').trim(),
        icon: editing.icon ?? 'Link',
        showInHero: editing.showInHero ?? true,
        showInContact: editing.showInContact ?? true,
        isVisible: editing.isVisible ?? true,
      };
      if (editing.id) {
        await apiRequest(`/api/admin/social-links/${editing.id}`, { method: 'PUT', token, body });
      } else {
        await apiRequest('/api/admin/social-links', { method: 'POST', token, body });
      }
      setEditing(null);
      await onRefresh();
      notify('success', 'Social link saved.');
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-950 dark:text-white">
            Social Media Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update your real GitHub, LinkedIn, Email, or add new social profiles.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              platform: '',
              label: '',
              url: '',
              icon: 'Link',
              showInHero: true,
              showInContact: true,
              isVisible: true,
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg accent-bg text-white text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Social Link
        </button>
      </div>

      {editing && (
        <form
          onSubmit={handleSave}
          className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Platform *</label>
              <input
                type="text"
                required
                value={editing.platform ?? ''}
                onChange={(e) => setEditing({ ...editing, platform: e.target.value })}
                placeholder="GitHub, LinkedIn, LeetCode"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Display Label *</label>
              <input
                type="text"
                required
                value={editing.label ?? ''}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                placeholder="GitHub"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Icon</label>
              <select
                value={editing.icon ?? 'Link'}
                onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                {SOCIAL_ICON_NAMES.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Profile URL (or mailto:email)</label>
            <input
              type="text"
              value={editing.url ?? ''}
              onChange={(e) => setEditing({ ...editing, url: e.target.value })}
              placeholder="https://github.com/your-username"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="flex flex-wrap gap-4 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.showInHero ?? true}
                onChange={(e) => setEditing({ ...editing, showInHero: e.target.checked })}
                className="rounded accent-blue-600"
              />
              <span>Show in Hero</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.showInContact ?? true}
                onChange={(e) => setEditing({ ...editing, showInContact: e.target.checked })}
                className="rounded accent-blue-600"
              />
              <span>Show in Contact Section</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.isVisible ?? true}
                onChange={(e) => setEditing({ ...editing, isVisible: e.target.checked })}
                className="rounded accent-blue-600"
              />
              <span>Visible</span>
            </label>
          </div>

          <div className="flex justify-end gap-2">
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
              className="px-4 py-2 rounded-lg accent-bg text-white text-xs font-semibold"
            >
              Save Link
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2.5">
        {socialLinks.map((link) => (
          <div
            key={link.id}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg accent-soft-bg accent-text flex items-center justify-center shrink-0">
                <DynamicIcon name={link.icon} className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {link.platform}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {link.url || 'Not configured yet — click edit to add your real URL'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setEditing(link)}
                className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const token = await getToken();
                    await apiRequest(`/api/admin/social-links/${link.id}`, {
                      method: 'DELETE',
                      token,
                    });
                    await onRefresh();
                    notify('success', 'Social link removed.');
                  } catch (err: any) {
                    notify('error', err.message);
                  }
                }}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CUSTOM SECTIONS (FUTURE EXPANSION)
// ============================================================================
const EXPANSION_PRESETS = [
  { title: 'Internships & Work Experience', slug: 'experience', sectionType: 'timeline' as const },
  { title: 'Hackathons & Competitions', slug: 'hackathons', sectionType: 'cards' as const },
  { title: 'Awards & Honors', slug: 'awards', sectionType: 'cards' as const },
  { title: 'Research & Publications', slug: 'publications', sectionType: 'articles' as const },
  { title: 'Blog & Technical Notes', slug: 'blog', sectionType: 'articles' as const },
  { title: 'Testimonials', slug: 'testimonials', sectionType: 'cards' as const },
];

export function CustomSectionsEditor({
  customSections,
  getToken,
  onRefresh,
  notify,
}: CommonProps & { customSections: CustomSectionData[] }) {
  const [editing, setEditing] = useState<Partial<CustomSectionData> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomSectionData | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.title?.trim() || !editing.slug?.trim()) return;
    setSaving(true);
    try {
      const token = await getToken();
      const body = {
        slug: editing.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        title: editing.title.trim(),
        subtitle: editing.subtitle?.trim() ?? '',
        sectionType: editing.sectionType ?? 'cards',
        items: editing.items ?? [],
        isVisible: editing.isVisible ?? true,
      };
      if (editing.id) {
        await apiRequest(`/api/admin/custom-sections/${editing.id}`, {
          method: 'PUT',
          token,
          body,
        });
      } else {
        await apiRequest('/api/admin/custom-sections', { method: 'POST', token, body });
      }
      setEditing(null);
      await onRefresh();
      notify('success', 'Custom section saved.');
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    if (!editing) return;
    const item: CustomSectionItemData = {
      id: `item-${Date.now()}`,
      title: '',
      subtitle: '',
      date: '',
      description: '',
      url: '',
      tags: [],
    };
    setEditing({ ...editing, items: [...(editing.items ?? []), item] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-950 dark:text-white">
            Additional Portfolio Sections
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Expand your portfolio anytime with Internships, Work Experience, Hackathons, Blog,
            Awards, Testimonials, or Publications.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              title: '',
              slug: '',
              subtitle: '',
              sectionType: 'cards',
              items: [],
              isVisible: true,
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg accent-bg text-white text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          New Section
        </button>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {EXPANSION_PRESETS.map((preset) => (
          <button
            key={preset.slug}
            type="button"
            onClick={() =>
              setEditing({
                ...preset,
                subtitle: '',
                items: [
                  {
                    id: `item-${Date.now()}`,
                    title: '',
                    subtitle: '',
                    date: '',
                    description: '',
                    url: '',
                    tags: [],
                  },
                ],
                isVisible: true,
              })
            }
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500"
          >
            + {preset.title}
          </button>
        ))}
      </div>

      {editing && (
        <form
          onSubmit={handleSave}
          className="p-6 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Section Title *</label>
              <input
                type="text"
                required
                value={editing.title ?? ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={editing.slug ?? ''}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                placeholder="e.g., internships"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Layout Style</label>
              <select
                value={editing.sectionType ?? 'cards'}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    sectionType: e.target.value as 'timeline' | 'cards' | 'articles',
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="cards">Grid Cards</option>
                <option value="timeline">Vertical Timeline</option>
                <option value="articles">Editorial Articles</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Subtitle</label>
            <input
              type="text"
              value={editing.subtitle ?? ''}
              onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Entries</span>
              <button
                type="button"
                onClick={addItem}
                className="text-xs font-medium accent-text hover:underline"
              >
                + Add Entry
              </button>
            </div>
            {(editing.items ?? []).map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Entry {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        items: (editing.items ?? []).filter((_, i) => i !== idx),
                      })
                    }
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Title *"
                    value={item.title}
                    onChange={(e) => {
                      const items = [...(editing.items ?? [])];
                      items[idx] = { ...item, title: e.target.value };
                      setEditing({ ...editing, items });
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                  <input
                    type="text"
                    placeholder="Organization / Subtitle"
                    value={item.subtitle}
                    onChange={(e) => {
                      const items = [...(editing.items ?? [])];
                      items[idx] = { ...item, subtitle: e.target.value };
                      setEditing({ ...editing, items });
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                  <input
                    type="text"
                    placeholder="Date / Year"
                    value={item.date}
                    onChange={(e) => {
                      const items = [...(editing.items ?? [])];
                      items[idx] = { ...item, date: e.target.value };
                      setEditing({ ...editing, items });
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => {
                    const items = [...(editing.items ?? [])];
                    items[idx] = { ...item, description: e.target.value };
                    setEditing({ ...editing, items });
                  }}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
                <input
                  type="url"
                  placeholder="Optional reference URL (https://...)"
                  value={item.url ?? ''}
                  onChange={(e) => {
                    const items = [...(editing.items ?? [])];
                    items[idx] = { ...item, url: e.target.value };
                    setEditing({ ...editing, items });
                  }}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              className="px-5 py-2 rounded-lg accent-bg text-white text-xs font-semibold"
            >
              Save Section
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {customSections.map((sec) => (
          <div
            key={sec.id}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4"
          >
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {sec.title}
              </h3>
              <p className="text-xs text-slate-500">
                #{sec.slug} · {sec.items.length} items · {sec.isVisible ? 'Visible' : 'Hidden'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditing(sec)}
                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(sec)}
                className="p-2 rounded-lg hover:bg-red-50 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Custom Section"
        description={`Delete "${deleteTarget?.title}" and all its entries?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            const token = await getToken();
            await apiRequest(`/api/admin/custom-sections/${deleteTarget.id}`, {
              method: 'DELETE',
              token,
            });
            setDeleteTarget(null);
            await onRefresh();
            notify('success', 'Custom section deleted.');
          } catch (err: any) {
            notify('error', err.message);
          }
        }}
      />
    </div>
  );
}

// ============================================================================
// WEBSITE APPEARANCE & SETTINGS EDITOR
// ============================================================================
const SECTION_LABELS: Record<string, string> = {
  home: 'Home / Hero',
  about: 'About Me',
  skills: 'Skills',
  projects: 'Projects',
  education: 'Education',
  certificates: 'Certificates & Achievements',
  resume: 'Resume',
  contact: 'Contact',
};

export function WebsiteSettingsEditor({
  settings,
  getToken,
  onRefresh,
  notify,
}: CommonProps & { settings: WebsiteSettingsData }) {
  const [form, setForm] = useState<WebsiteSettingsData>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      await apiRequest('/api/admin/settings', {
        method: 'PUT',
        token,
        body: {
          siteTitle: form.siteTitle,
          logoText: form.logoText,
          logoUrl: form.logoUrl,
          faviconUrl: form.faviconUrl,
          defaultTheme: form.defaultTheme,
          accentColor: form.accentColor,
          navLabels: form.navLabels,
          sectionOrder: form.sectionOrder,
          sectionVisibility: form.sectionVisibility,
          footerContent: form.footerContent,
          copyrightText: form.copyrightText,
        },
      });
      await onRefresh();
      notify('success', 'Website appearance & settings saved.');
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const moveSection = (index: number, dir: 'up' | 'down') => {
    const next = [...form.sectionOrder];
    const swap = dir === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setForm({ ...form, sectionOrder: next });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-950 dark:text-white">
            Website Appearance & Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize site title, logo, favicon, theme, accent color, navigation labels, section
            order, visibility, and footer.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg accent-bg text-white text-xs font-semibold disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Browser Tab Title</label>
          <input
            type="text"
            required
            value={form.siteTitle}
            onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Navbar Logo Text</label>
          <input
            type="text"
            required
            value={form.logoText}
            onChange={(e) => setForm({ ...form, logoText: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploadField
          label="Website Logo Image (optional)"
          value={form.logoUrl}
          category="logo"
          getToken={getToken}
          onUploaded={(res) => setForm({ ...form, logoUrl: res.url })}
          onClear={() => setForm({ ...form, logoUrl: '' })}
        />
        <FileUploadField
          label="Favicon (optional)"
          value={form.faviconUrl}
          category="favicon"
          accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/webp"
          allowImageEdit={false}
          getToken={getToken}
          onUploaded={(res) => setForm({ ...form, faviconUrl: res.url })}
          onClear={() => setForm({ ...form, faviconUrl: '' })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Default Theme</label>
          <select
            value={form.defaultTheme}
            onChange={(e) =>
              setForm({ ...form, defaultTheme: e.target.value as 'light' | 'dark' })
            }
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
          >
            <option value="light">Light Theme (Recommended)</option>
            <option value="dark">Dark Theme</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Accent Color</label>
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                { key: 'blue', label: 'Blue', swatch: '#2563eb' },
                { key: 'indigo', label: 'Indigo', swatch: '#4f46e5' },
                { key: 'violet', label: 'Violet', swatch: '#7c3aed' },
                { key: 'cobalt', label: 'Cobalt', swatch: '#1d4ed8' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setForm({ ...form, accentColor: opt.key })}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-medium ${
                  form.accentColor === opt.key
                    ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: opt.swatch }}
                />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Labels */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold mb-3">Navigation Bar Labels</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['about', 'skills', 'projects', 'education', 'certificates', 'resume', 'contact'].map(
            (key) => (
              <div key={key}>
                <label className="block text-xs text-slate-500 mb-1 capitalize">{key}</label>
                <input
                  type="text"
                  value={form.navLabels?.[key] ?? key}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      navLabels: { ...form.navLabels, [key]: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* Section Order & Visibility */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold mb-3">Section Order & Visibility</h3>
        <div className="space-y-2">
          {form.sectionOrder.map((key, idx) => {
            const visible = form.sectionVisibility?.[key] !== false;
            return (
              <div
                key={key}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
              >
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {SECTION_LABELS[key] || key}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={idx === 0 || key === 'home'}
                    onClick={() => moveSection(idx, 'up')}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === form.sectionOrder.length - 1 || key === 'home'}
                    onClick={() => moveSection(idx, 'down')}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  {key !== 'home' && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          sectionVisibility: {
                            ...form.sectionVisibility,
                            [key]: !visible,
                          },
                        })
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        visible
                          ? 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          : 'border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40'
                      }`}
                    >
                      {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {visible ? 'Visible' : 'Hidden'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Settings */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Footer Note</label>
          <input
            type="text"
            value={form.footerContent}
            onChange={(e) => setForm({ ...form, footerContent: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Copyright Text</label>
          <input
            type="text"
            value={form.copyrightText}
            onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>
      </div>
    </form>
  );
}
