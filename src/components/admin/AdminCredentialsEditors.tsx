import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  EyeOff,
  FileText,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import type {
  CertificateData,
  EducationData,
  ResumeData,
} from '../../types/portfolio.ts';
import { apiRequest } from '../../lib/api.ts';
import { FileUploadField } from '../ui/FileUploadField.tsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.tsx';

interface CommonProps {
  getToken: () => Promise<string | null>;
  onRefresh: () => Promise<void>;
  notify: (type: 'success' | 'error', text: string) => void;
}

// ============================================================================
// EDUCATION MANAGER
// ============================================================================
const EMPTY_EDU: Omit<EducationData, 'id' | 'sortOrder'> = {
  collegeName: '',
  degree: '',
  branch: '',
  universityName: '',
  academicYear: '',
  currentSemester: '',
  achievements: [],
  description: '',
  logoUrl: '',
  isVisible: true,
};

export function EducationManagerEditor({
  education,
  getToken,
  onRefresh,
  notify,
}: CommonProps & { education: EducationData[] }) {
  const [editing, setEditing] = useState<(Partial<EducationData> & typeof EMPTY_EDU) | null>(null);
  const [achInput, setAchInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EducationData | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.collegeName.trim() || !editing.degree.trim()) return;
    setSaving(true);
    try {
      const token = await getToken();
      const body = {
        collegeName: editing.collegeName.trim(),
        degree: editing.degree.trim(),
        branch: editing.branch.trim(),
        universityName: editing.universityName.trim(),
        academicYear: editing.academicYear.trim(),
        currentSemester: editing.currentSemester.trim(),
        achievements: editing.achievements,
        description: editing.description.trim(),
        logoUrl: editing.logoUrl.trim(),
        isVisible: Boolean(editing.isVisible),
      };
      if (editing.id) {
        await apiRequest(`/api/admin/education/${editing.id}`, { method: 'PUT', token, body });
      } else {
        await apiRequest('/api/admin/education', { method: 'POST', token, body });
      }
      setEditing(null);
      await onRefresh();
      notify('success', 'Education entry saved.');
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (index: number, dir: 'up' | 'down') => {
    const next = [...education];
    const swap = dir === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    try {
      const token = await getToken();
      await apiRequest('/api/admin/education/reorder', {
        method: 'PUT',
        token,
        body: { ids: next.map((e) => e.id) },
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
            Education Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your college, degree, specialization, semester, achievements, and institution logo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing({ ...EMPTY_EDU });
            setAchInput('');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg accent-bg text-white text-xs font-semibold whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Education
        </button>
      </div>

      {editing && (
        <form
          onSubmit={handleSave}
          className="p-6 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">College / Institute Name *</label>
              <input
                type="text"
                required
                value={editing.collegeName}
                onChange={(e) => setEditing({ ...editing, collegeName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">University Name</label>
              <input
                type="text"
                value={editing.universityName}
                onChange={(e) => setEditing({ ...editing, universityName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Degree / Course *</label>
              <input
                type="text"
                required
                value={editing.degree}
                onChange={(e) => setEditing({ ...editing, degree: e.target.value })}
                placeholder="e.g., B.Tech / B.E. / B.Sc"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Branch / Specialization</label>
              <input
                type="text"
                value={editing.branch}
                onChange={(e) => setEditing({ ...editing, branch: e.target.value })}
                placeholder="e.g., Computer Science & Engineering"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Academic Year</label>
              <input
                type="text"
                value={editing.academicYear}
                onChange={(e) => setEditing({ ...editing, academicYear: e.target.value })}
                placeholder="e.g., 2024 – 2028"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Current Semester / Year</label>
              <input
                type="text"
                value={editing.currentSemester}
                onChange={(e) => setEditing({ ...editing, currentSemester: e.target.value })}
                placeholder="e.g., 4th Semester / 2nd Year"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Description</label>
            <textarea
              rows={3}
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Achievements</label>
            <ul className="space-y-1.5 mb-2">
              {editing.achievements.map((a, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <span>{a}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        achievements: editing.achievements.filter((_, i) => i !== idx),
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
                value={achInput}
                onChange={(e) => setAchInput(e.target.value)}
                placeholder="Add achievement or academic highlight"
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
              <button
                type="button"
                onClick={() => {
                  const v = achInput.trim();
                  if (v) {
                    setEditing({ ...editing, achievements: [...editing.achievements, v] });
                    setAchInput('');
                  }
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-900"
              >
                Add
              </button>
            </div>
          </div>

          <FileUploadField
            label="College Logo (optional)"
            value={editing.logoUrl}
            category="college-logo"
            getToken={getToken}
            onUploaded={(res) => setEditing({ ...editing, logoUrl: res.url })}
            onClear={() => setEditing({ ...editing, logoUrl: '' })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
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
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg accent-bg text-white text-xs font-semibold"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Education'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {education.map((edu, idx) => (
          <div
            key={edu.id}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {[edu.academicYear, edu.currentSemester].filter(Boolean).join(' · ')}
              </p>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                {edu.degree}
                {edu.branch ? ` — ${edu.branch}` : ''}
              </h3>
              <p className="text-xs accent-text truncate">
                {[edu.collegeName, edu.universityName].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => void handleReorder(idx, 'up')}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={idx === education.length - 1}
                onClick={() => void handleReorder(idx, 'down')}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setEditing({ ...edu })}
                className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(edu)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Education Entry"
        description={`Delete "${deleteTarget?.degree}" at "${deleteTarget?.collegeName}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            const token = await getToken();
            await apiRequest(`/api/admin/education/${deleteTarget.id}`, {
              method: 'DELETE',
              token,
            });
            setDeleteTarget(null);
            await onRefresh();
            notify('success', 'Education entry deleted.');
          } catch (err: any) {
            notify('error', err.message);
          }
        }}
      />
    </div>
  );
}

// ============================================================================
// CERTIFICATES MANAGER
// ============================================================================
const EMPTY_CERT: Omit<CertificateData, 'id' | 'sortOrder'> = {
  title: '',
  issuer: '',
  badgeType: 'CERTIFICATION',
  issueDate: '',
  credentialId: '',
  credentialIdLabel: 'Credential ID',
  scoreBreakdown: '',
  description: '',
  skillTags: [],
  actionLabel: '',
  fileUrl: '',
  fileType: 'image',
  verificationUrl: '',
  isVisible: true,
};

export function CertificatesManagerEditor({
  certificates,
  getToken,
  onRefresh,
  notify,
}: CommonProps & { certificates: CertificateData[] }) {
  const [editing, setEditing] = useState<(Partial<CertificateData> & typeof EMPTY_CERT) | null>(
    null
  );
  const [skillTagsText, setSkillTagsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CertificateData | null>(null);

  const openEditor = (cert: Partial<CertificateData> & typeof EMPTY_CERT) => {
    setEditing(cert);
    setSkillTagsText((cert.skillTags || []).join(', '));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.title.trim() || !editing.issuer.trim()) return;
    setSaving(true);
    try {
      const token = await getToken();
      const parsedTags = skillTagsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const body = {
        title: editing.title.trim(),
        issuer: editing.issuer.trim(),
        badgeType: editing.badgeType.trim() || 'CERTIFICATION',
        issueDate: editing.issueDate.trim(),
        credentialId: editing.credentialId.trim(),
        credentialIdLabel: editing.credentialIdLabel.trim() || 'Credential ID',
        scoreBreakdown: editing.scoreBreakdown.trim(),
        description: editing.description.trim(),
        skillTags: parsedTags,
        actionLabel: editing.actionLabel.trim(),
        fileUrl: editing.fileUrl.trim(),
        fileType: editing.fileType,
        verificationUrl: editing.verificationUrl.trim(),
        isVisible: Boolean(editing.isVisible),
      };
      if (editing.id) {
        await apiRequest(`/api/admin/certificates/${editing.id}`, { method: 'PUT', token, body });
      } else {
        await apiRequest('/api/admin/certificates', { method: 'POST', token, body });
      }
      setEditing(null);
      await onRefresh();
      notify('success', 'Certificate saved.');
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (index: number, dir: 'up' | 'down') => {
    const next = [...certificates];
    const swap = dir === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    try {
      const token = await getToken();
      await apiRequest('/api/admin/certificates/reorder', {
        method: 'PUT',
        token,
        body: { ids: next.map((c) => c.id) },
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
            Certifications &amp; Credentials Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload certificate images or PDFs, configure credential IDs, skill tags, verification links, reorder, or toggle visibility.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditor({ ...EMPTY_CERT })}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg accent-bg text-white text-xs font-semibold whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Certificate
        </button>
      </div>

      {editing && (
        <form
          onSubmit={handleSave}
          className="p-6 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Certificate Title *</label>
              <input
                type="text"
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Issuing Organization *</label>
              <input
                type="text"
                required
                value={editing.issuer}
                onChange={(e) => setEditing({ ...editing, issuer: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Type Badge</label>
              <input
                type="text"
                value={editing.badgeType}
                onChange={(e) => setEditing({ ...editing, badgeType: e.target.value })}
                placeholder="e.g., VIRTUAL INTERNSHIP"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Issue / Course Date</label>
              <input
                type="text"
                value={editing.issueDate}
                onChange={(e) => setEditing({ ...editing, issueDate: e.target.value })}
                placeholder="e.g., November 1, 2025"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">ID Label</label>
              <input
                type="text"
                value={editing.credentialIdLabel}
                onChange={(e) => setEditing({ ...editing, credentialIdLabel: e.target.value })}
                placeholder="Credential ID or Roll No"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Credential ID / Roll No</label>
              <input
                type="text"
                value={editing.credentialId}
                onChange={(e) => setEditing({ ...editing, credentialId: e.target.value })}
                placeholder="e.g., VIP-BFSI-2026-0228"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Skill Tags (comma-separated)</label>
              <input
                type="text"
                value={skillTagsText}
                onChange={(e) => setSkillTagsText(e.target.value)}
                placeholder="Generative AI, Adobe AI Workflows, Content Creation"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Score Breakdown (optional)</label>
              <input
                type="text"
                value={editing.scoreBreakdown}
                onChange={(e) => setEditing({ ...editing, scoreBreakdown: e.target.value })}
                placeholder="Consolidated Score: 58% (Assignments: 22.5/25 | Exam: 35.25/75)"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Description</label>
            <textarea
              rows={3}
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <FileUploadField
            label="Certificate File (Image or PDF)"
            value={editing.fileUrl}
            category="certificate"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            fileName={editing.fileType === 'pdf' ? 'certificate.pdf' : undefined}
            allowImageEdit={editing.fileType !== 'pdf'}
            helperText="Supports PNG, JPG, WebP images or PDF documents (up to 10 MB)."
            getToken={getToken}
            onUploaded={(res) =>
              setEditing({
                ...editing,
                fileUrl: res.url,
                fileType: res.mimeType === 'application/pdf' ? 'pdf' : 'image',
              })
            }
            onClear={() => setEditing({ ...editing, fileUrl: '' })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Verification URL (optional)</label>
              <input
                type="url"
                value={editing.verificationUrl}
                onChange={(e) => setEditing({ ...editing, verificationUrl: e.target.value })}
                placeholder="https://coursera.org/verify/..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Verify Button Label (optional)</label>
              <input
                type="text"
                value={editing.actionLabel}
                onChange={(e) => setEditing({ ...editing, actionLabel: e.target.value })}
                placeholder="e.g., Verify on Coursera"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={editing.isVisible}
              onChange={(e) => setEditing({ ...editing, isVisible: e.target.checked })}
              className="rounded accent-blue-600"
            />
            <span>Visible on public portfolio</span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
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
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg accent-bg text-white text-xs font-semibold"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Certificate'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {certificates.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-sm text-slate-500">
            No certificates added yet. Click "Add Certificate" to upload your first credential.
          </div>
        ) : (
          certificates.map((cert, idx) => (
            <div
              key={cert.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {cert.issuer}
                  {cert.issueDate ? ` · ${cert.issueDate}` : ''}
                  {!cert.isVisible ? ' · Hidden' : ''}
                </p>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                  {cert.title}
                </h3>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => void handleReorder(idx, 'up')}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === certificates.length - 1}
                  onClick={() => void handleReorder(idx, 'down')}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const token = await getToken();
                      await apiRequest(`/api/admin/certificates/${cert.id}`, {
                        method: 'PUT',
                        token,
                        body: { isVisible: !cert.isVisible },
                      });
                      await onRefresh();
                    } catch (err: any) {
                      notify('error', err.message);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  {cert.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => openEditor({ ...cert })}
                  className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(cert)}
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
        title="Delete Certificate"
        description={`Delete "${deleteTarget?.title}" permanently?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            const token = await getToken();
            await apiRequest(`/api/admin/certificates/${deleteTarget.id}`, {
              method: 'DELETE',
              token,
            });
            setDeleteTarget(null);
            await onRefresh();
            notify('success', 'Certificate deleted.');
          } catch (err: any) {
            notify('error', err.message);
          }
        }}
      />
    </div>
  );
}

// ============================================================================
// RESUME MANAGER
// ============================================================================
export function ResumeManagerEditor({
  resume,
  getToken,
  onRefresh,
  notify,
}: CommonProps & { resume: ResumeData }) {
  const [form, setForm] = useState<ResumeData>(resume);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(resume);
  }, [resume]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      await apiRequest('/api/admin/resume', {
        method: 'PUT',
        token,
        body: {
          title: form.title,
          description: form.description,
          fileUrl: form.fileUrl,
          fileName: form.fileName,
          fileSize: form.fileSize,
        },
      });
      await onRefresh();
      notify('success', 'Resume updated and published.');
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-950 dark:text-white">
            Resume Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload or replace your resume PDF directly. The latest uploaded version automatically
            appears on the public portfolio.
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
        <label className="block text-sm font-medium mb-1.5">Resume Section Title</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
        />
      </div>

      <FileUploadField
        label="Resume PDF File"
        value={form.fileUrl}
        fileName={form.fileName}
        fileSize={form.fileSize}
        category="resume"
        accept="application/pdf"
        allowImageEdit={false}
        helperText="Upload a PDF file (up to 10 MB). Click Save Changes to publish it live."
        getToken={getToken}
        onUploaded={(res) =>
          setForm({
            ...form,
            fileUrl: res.url,
            fileName: res.fileName,
            fileSize: res.sizeBytes,
          })
        }
        onClear={() => setForm({ ...form, fileUrl: '', fileName: '', fileSize: 0 })}
      />

      {form.fileUrl && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Live PDF Preview
            </span>
            <a
              href={`${form.fileUrl}?download=1`}
              download={form.fileName || 'resume.pdf'}
              className="inline-flex items-center gap-1.5 text-xs font-semibold accent-text hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              Test Download
            </a>
          </div>
          <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white">
            <iframe src={form.fileUrl} title="Resume Preview" className="w-full h-full" />
          </div>
        </div>
      )}
    </form>
  );
}
