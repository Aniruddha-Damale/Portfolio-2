import React, { useRef, useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  RotateCw,
  Sliders,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { uploadPortfolioFile } from '../../lib/api.ts';
import { formatBytes } from '../../lib/icons.tsx';

interface FileUploadFieldProps {
  label: string;
  value: string;
  category: string;
  accept?: string;
  helperText?: string;
  allowImageEdit?: boolean;
  fileName?: string;
  fileSize?: number;
  getToken: () => Promise<string | null>;
  onUploaded: (result: {
    url: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }) => void;
  onClear?: () => void;
}

export function FileUploadField({
  label,
  value,
  category,
  accept = 'image/png,image/jpeg,image/webp,image/gif',
  helperText,
  allowImageEdit = true,
  fileName,
  fileSize,
  getToken,
  onUploaded,
  onClear,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Built-in Canvas Image Studio (rotate, brightness, contrast, crop aspect)
  const [editorOpen, setEditorOpen] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [applyingEdit, setApplyingEdit] = useState(false);

  const isPdf = accept === 'application/pdf' || fileName?.toLowerCase().endsWith('.pdf');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Please sign in again to upload files.');
      }
      const res = await uploadPortfolioFile(file, category, token);
      onUploaded({
        url: res.url,
        fileName: res.fileName,
        mimeType: res.mimeType,
        sizeBytes: res.sizeBytes,
      });
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const applyCanvasEdits = async () => {
    if (!value) return;
    setApplyingEdit(true);
    setError(null);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Could not load image for editing.'));
        img.src = value;
      });

      const canvas = document.createElement('canvas');
      const rad = (rotation * Math.PI) / 180;
      const swapped = rotation % 180 !== 0;
      const w = swapped ? img.naturalHeight : img.naturalWidth;
      const h = swapped ? img.naturalWidth : img.naturalHeight;
      canvas.width = Math.min(w, 1800);
      canvas.height = Math.round((canvas.width / w) * h);

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable.');

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      const drawW = swapped ? canvas.height : canvas.width;
      const drawH = swapped ? canvas.width : canvas.height;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to export edited image.'))),
          'image/jpeg',
          0.9
        );
      });

      const token = await getToken();
      if (!token) throw new Error('Please sign in again.');

      const editedFile = new File([blob], `edited-${category}.jpg`, { type: 'image/jpeg' });
      const res = await uploadPortfolioFile(editedFile, category, token);
      onUploaded({
        url: res.url,
        fileName: res.fileName,
        mimeType: res.mimeType,
        sizeBytes: res.sizeBytes,
      });
      setEditorOpen(false);
      setBrightness(100);
      setContrast(100);
      setRotation(0);
    } catch (err: any) {
      setError(err.message || 'Could not apply image edits.');
    } finally {
      setApplyingEdit(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
        {value ? (
          isPdf ? (
            <div className="w-16 h-16 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <FileText className="w-7 h-7" />
            </div>
          ) : (
            <img
              src={value}
              alt={label}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-white"
            />
          )
        ) : (
          <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
            {isPdf ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading...' : value ? 'Replace File' : 'Upload File'}
            </button>

            {value && !isPdf && allowImageEdit && (
              <button
                type="button"
                onClick={() => setEditorOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <Sliders className="w-3.5 h-3.5" />
                Adjust Image
              </button>
            )}

            {value && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            )}
          </div>

          {fileName && (
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {fileName}
              {fileSize ? ` · ${formatBytes(fileSize)}` : ''}
            </p>
          )}
          {helperText && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
          )}
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>

      {editorOpen && value && !isPdf && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Adjust & Enhance Image
              </h4>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center h-64 border border-slate-200 dark:border-slate-800">
              <img
                src={value}
                alt="Preview"
                referrerPolicy="no-referrer"
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  transform: `rotate(${rotation}deg)`,
                }}
                className="max-h-full max-w-full object-contain transition-transform"
              />
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span>Brightness</span>
                  <span className="font-mono tabular-nums">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={140}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span>Contrast</span>
                  <span className="font-mono tabular-nums">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={140}
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Rotate 90°
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBrightness(100);
                    setContrast(100);
                    setRotation(0);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={applyingEdit}
                onClick={applyCanvasEdits}
                className="px-4 py-2 text-sm font-medium rounded-lg accent-bg text-white disabled:opacity-50"
              >
                {applyingEdit ? 'Saving...' : 'Save Adjusted Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
