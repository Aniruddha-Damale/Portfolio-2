import React from 'react';
import {
  Award,
  Binary,
  BookOpen,
  Braces,
  Briefcase,
  CircuitBoard,
  Cloud,
  Code2,
  Cpu,
  Database,
  FileCode2,
  FolderGit2,
  GitBranch,
  Github,
  Globe,
  Instagram,
  Laptop,
  Layers,
  Link as LinkIcon,
  Linkedin,
  Mail,
  Palette,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Terminal,
  Twitter,
  Wrench,
  Youtube,
} from 'lucide-react';

export const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  Code2,
  Terminal,
  Cpu,
  Binary,
  FileCode2,
  Braces,
  Globe,
  Palette,
  Sparkles,
  GitBranch,
  Github,
  Laptop,
  CircuitBoard,
  Wrench,
  Database,
  Server,
  Cloud,
  Layers,
  Smartphone,
  Shield,
  FolderGit2,
  BookOpen,
  Briefcase,
  Award,
  Linkedin,
  Mail,
  Twitter,
  Youtube,
  Instagram,
  Link: LinkIcon,
};

export const SKILL_ICON_NAMES = [
  'Code2',
  'Terminal',
  'Cpu',
  'Binary',
  'FileCode2',
  'Braces',
  'Globe',
  'Palette',
  'Sparkles',
  'GitBranch',
  'Github',
  'Laptop',
  'CircuitBoard',
  'Wrench',
  'Database',
  'Server',
  'Cloud',
  'Layers',
  'Smartphone',
  'Shield',
  'FolderGit2',
];

export const SOCIAL_ICON_NAMES = [
  'Github',
  'Linkedin',
  'Mail',
  'Globe',
  'Twitter',
  'Youtube',
  'Instagram',
  'Code2',
  'Link',
];

export function DynamicIcon({
  name,
  className = 'w-4 h-4',
  strokeWidth = 1.5,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = ICON_MAP[name] ?? Code2;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function isValidSafeHref(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return !trimmed.startsWith('//');
  try {
    const u = new URL(trimmed);
    return ['http:', 'https:', 'mailto:'].includes(u.protocol);
  } catch {
    return false;
  }
}
