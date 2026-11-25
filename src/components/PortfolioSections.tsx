import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowDown,
  ArrowUp,
  Award,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileText,
  FolderGit2,
  Github,
  GraduationCap,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Plus,
  QrCode,
  Send,
  Star,
  Terminal,
  Trash2,
  User,
  X,
} from 'lucide-react';
import type {
  CustomSectionData,
  PortfolioPayload,
  ProjectData,
} from '../types/portfolio.ts';
import { apiRequest } from '../lib/api.ts';
import { DynamicIcon, formatBytes, isValidSafeHref } from '../lib/icons.tsx';
import {
  AnimatedCopyButton,
  ClipRevealMedia,
  EditorialHeading,
  MagneticWrap,
  ScrollSyncedTimeline,
  SectionReveal,
  TiltCard,
} from './TechfestEffects.tsx';
import { HeroChoreography } from './HeroChoreography.tsx';
import { CertificationsSection } from './CertificationsSection.tsx';

export type AdminTabKey =
  | 'overview'
  | 'home'
  | 'about'
  | 'skills'
  | 'projects'
  | 'education'
  | 'certificates'
  | 'resume'
  | 'contact'
  | 'socials'
  | 'custom'
  | 'settings';

interface PortfolioSectionsProps {
  portfolio: PortfolioPayload;
  isAdmin: boolean;
  editMode: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenAdminLogin: () => void;
  onOpenAdminTab: (tab: AdminTabKey) => void;
  onMoveSection: (sectionKey: string, direction: 'up' | 'down') => void;
  onToggleSectionVisibility: (sectionKey: string) => void;
  onQuickDeleteProject: (project: ProjectData) => void;
  onQuickToggleFeatured: (project: ProjectData) => void;
}

const STACK_FOCUS_TABS = [
  {
    key: 'cpp',
    label: 'C / C++',
    title: 'Systems & Algorithmic Foundations',
    description:
      'Writing memory-aware procedural C modules, object-oriented C++ programs, and STL-backed algorithmic solutions for data structures and competitive problem solving.',
    bullets: [
      'Pointers, Memory & Core Procedural Systems',
      'OOP, STL & Asymptotic Complexity Optimization',
      'Data Structures & Algorithmic Problem Solving',
    ],
  },
  {
    key: 'react',
    label: 'REACT / VITE',
    title: 'Modern Full-Stack Web Interfaces',
    description:
      'Building fast, responsive single-page applications and data-driven dashboards with clean component architectures.',
    bullets: ['Component Design Systems', 'Node.js Backend APIs', 'Responsive UI/UX'],
  },
  {
    key: 'capacitor',
    label: 'CAPACITOR / ANDROID',
    title: 'Cross-Platform Mobile & Native APK Builds',
    description:
      'Packaging modern web applications into installable native Android APKs via Capacitor with mobile-first ergonomics and clean offline-ready UX.',
    bullets: [
      'Capacitor Native Android Bridge Tooling',
      'Installable Android APK Packaging (SaveIQ)',
      'Mobile-First Performance & Ergonomics',
    ],
  },
  {
    key: 'github',
    label: 'GITHUB',
    title: 'Open Source & Continuous Delivery',
    description:
      'Maintaining modular repositories, disciplined branching workflows, and live public production deployments on GitHub Pages and Vercel.',
    bullets: [
      'Structured Git Workflows & Code Reviews',
      'Live GitHub Pages & Vercel Deployments',
      'Public Builds at github.com/Aniruddha-Damale',
    ],
  },
] as const;

const ABOUT_METRICS = [
  {
    value: '2+ Live Apps',
    label: 'Production Shipped',
    sublabel: 'Deployed on GitHub Pages & Android APK',
  },
  {
    value: 'Full Stack',
    label: 'End-to-End Engineering',
    sublabel: 'Web, Mobile & Cloud/Edge Architectures',
  },
  {
    value: 'SY B.Tech',
    label: 'Pune, Maharashtra',
    sublabel: 'Computer Engineering Focus',
  },
];

function ImageWithFallback({
  src,
  alt,
  className,
  fallbackTitle,
  fallbackType = 'project',
}: {
  src: string;
  alt: string;
  className: string;
  fallbackTitle: string;
  fallbackType?: 'avatar' | 'project' | 'about' | 'cert' | 'logo';
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;

  if (!src || failed) {
    return (
      <div
        className={`${className} bg-[#e8e8e8] flex flex-col items-center justify-center text-[#838282] p-4 text-center`}
      >
        {fallbackType === 'avatar' ? (
          <User className="w-10 h-10 mb-2 text-[#111111]" strokeWidth={1.5} />
        ) : fallbackType === 'cert' ? (
          <Award className="w-9 h-9 mb-2 text-[#111111]" strokeWidth={1.5} />
        ) : fallbackType === 'logo' ? (
          <GraduationCap className="w-6 h-6 text-[#111111]" strokeWidth={1.5} />
        ) : (
          <FolderGit2 className="w-9 h-9 mb-2 text-[#111111]" strokeWidth={1.5} />
        )}
        {fallbackType !== 'logo' && (
          <span className="text-xs font-medium text-[#838282] line-clamp-2 max-w-[180px]">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className={className}
    />
  );
}

function EditSectionRibbon({
  sectionKey,
  label,
  visible,
  canMoveUp,
  canMoveDown,
  onEdit,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
}: {
  sectionKey: string;
  label: string;
  visible: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 relative z-20">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 rounded-[2px] border border-[#1e1e1e]/25 bg-white text-xs">
        <div className="flex items-center gap-2 font-bold uppercase tracking-[0.08em] text-[#111111]">
          <span>Section: {label}</span>
          {!visible && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#838282]">Hidden from visitors</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[#1e1e1e] text-[#111111] hover:bg-[#1e1e1e] hover:text-[#f2f2f2] font-bold uppercase tracking-[0.06em] transition-colors whitespace-nowrap"
          >
            <Pencil className="w-3 h-3" strokeWidth={1.5} />
            Edit {label}
          </button>
          {sectionKey !== 'home' && (
            <>
              <button
                type="button"
                disabled={!canMoveUp}
                onClick={onMoveUp}
                title="Move section up"
                className="p-1.5 rounded-full border border-[#1e1e1e]/20 text-[#111111] disabled:opacity-35 hover:border-[#1e1e1e]"
              >
                <ArrowUp className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                disabled={!canMoveDown}
                onClick={onMoveDown}
                title="Move section down"
                className="p-1.5 rounded-full border border-[#1e1e1e]/20 text-[#111111] disabled:opacity-35 hover:border-[#1e1e1e]"
              >
                <ArrowDown className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={onToggleVisibility}
                title={visible ? 'Hide section from visitors' : 'Show section on website'}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#1e1e1e]/20 text-[#111111] hover:border-[#1e1e1e] whitespace-nowrap"
              >
                {visible ? (
                  <EyeOff className="w-3 h-3" strokeWidth={1.5} />
                ) : (
                  <Eye className="w-3 h-3" strokeWidth={1.5} />
                )}
                {visible ? 'Hide' : 'Show'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const SECTION_META: Record<string, { label: string; adminTab: AdminTabKey }> = {
  home: { label: 'Home', adminTab: 'home' },
  about: { label: 'About Me', adminTab: 'about' },
  skills: { label: 'Skills', adminTab: 'skills' },
  projects: { label: 'Projects', adminTab: 'projects' },
  education: { label: 'Education', adminTab: 'education' },
  certificates: { label: 'Certificates', adminTab: 'certificates' },
  resume: { label: 'Resume', adminTab: 'resume' },
  contact: { label: 'Contact', adminTab: 'contact' },
};

function ProjectShowcaseCard({
  project,
  cardIndex = 0,
  isAdmin,
  editMode,
  onSelectProject,
  onOpenQr,
  onOpenAdminTab,
  onQuickToggleFeatured,
  onQuickDeleteProject,
}: {
  project: ProjectData;
  cardIndex?: number;
  isAdmin: boolean;
  editMode: boolean;
  onSelectProject: (p: ProjectData) => void;
  onOpenQr: (p: ProjectData) => void;
  onOpenAdminTab: (tab: AdminTabKey) => void;
  onQuickToggleFeatured: (p: ProjectData) => void;
  onQuickDeleteProject: (p: ProjectData) => void;
}) {
  const [slide, setSlide] = useState<0 | 1>(0);
  const indexLabel = String(cardIndex + 1).padStart(2, '0');

  return (
    <TiltCard
      interactiveCursor
      revealDelay={cardIndex * 0.06}
      layout
      className={`group swiss-card flex flex-col ${!project.isVisible ? 'opacity-55' : ''}`}
    >
      {/* Interactive Carousel Stage with 20% grayscale -> 100% color 1.05x hover + clip-path reveal */}
      <ClipRevealMedia
        delay={cardIndex * 0.08}
        className="relative aspect-[16/10] bg-[#e6e6e6] border-b border-[#1e1e1e]/12 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {slide === 0 ? (
            <motion.div
              key="media-slide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full overflow-hidden"
            >
              <ImageWithFallback
                src={project.imageUrl}
                alt={project.title}
                fallbackTitle={project.title}
                fallbackType="project"
                className="swiss-media w-full h-full object-cover"
              />
            </motion.div>
          ) : (
            <motion.div
              key="spec-slide"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="w-full h-full px-5 sm:px-6 pt-5 pb-16 overflow-y-auto flex flex-col justify-between gap-2 bg-[#f2f2f2]"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#838282]">
                  Architecture &amp; Capability Matrix
                </p>
                <h4 className="mt-1.5 text-xl sm:text-2xl swiss-heading uppercase text-[#111111]">
                  {project.title}
                </h4>
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-[#111111]">
                  {project.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs font-mono text-[#838282]">
                Stack: {project.technologies.join(' · ')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Caption + Slide Controls */}
        <div className="absolute bottom-0 inset-x-0 px-5 py-3 bg-[#111111]/75 backdrop-blur-xs flex items-center justify-between gap-3">
          <span className="text-xs text-[#f2f2f2] font-medium truncate">
            {slide === 0
              ? project.subtitle || project.category
              : 'Interactive Architecture & Capability Overview'}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setSlide((s) => (s === 0 ? 1 : 0))}
              aria-label="Previous preview slide"
              className="w-7 h-7 rounded-full border border-white/30 hover:bg-white hover:text-[#111111] text-white inline-flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            <span className="text-xs font-mono tabular-nums text-white/90 px-1">
              {slide + 1}/2
            </span>
            <button
              type="button"
              onClick={() => setSlide((s) => (s === 0 ? 1 : 0))}
              aria-label="Next preview slide"
              className="w-7 h-7 rounded-full border border-white/30 hover:bg-white hover:text-[#111111] text-white inline-flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </ClipRevealMedia>

      {/* Content Body */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#838282]">
              <span>{project.category}</span>
              <span aria-hidden="true">·</span>
              <span>{project.status}</span>
              {project.isFeatured && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#111111]">Featured</span>
                </>
              )}
            </div>

            <h3 className="mt-3 text-2xl sm:text-3xl swiss-heading uppercase text-[#111111]">
              {project.title}
            </h3>
            {project.subtitle && (
              <p className="mt-1.5 text-sm font-medium text-[#838282]">{project.subtitle}</p>
            )}
          </div>

          <div className="swiss-icon-box text-[#111111]">
            <span className="font-display font-bold text-lg tracking-[-0.04em] tabular-nums">
              {indexLabel}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm sm:text-base font-normal text-[#111111]/85 leading-relaxed">
          {project.description}
        </p>

        {project.features.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#1e1e1e]/12">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#838282] mb-2.5">
              Key Capabilities
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-[#111111]">
              {project.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#111111] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {project.technologies.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#1e1e1e]/10">
            <p className="text-xs font-mono text-[#838282]">
              {project.technologies.join('  /  ')}
            </p>
          </div>
        )}

        <div className="mt-auto pt-6 flex flex-wrap items-center gap-2.5">
          {isValidSafeHref(project.liveDemoUrl) && (
            <MagneticWrap>
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="swiss-pill-btn-solid group/live inline-flex items-center gap-2 px-5 py-2.5 text-xs whitespace-nowrap"
              >
                <span>
                  {project.title.toLowerCase().includes('saveiq')
                    ? 'Visit Live App'
                    : 'Visit Live Site'}
                </span>
                <span
                  aria-hidden="true"
                  className="transition-transform duration-150 group-hover/live:translate-x-0.5"
                >
                  →
                </span>
              </a>
            </MagneticWrap>
          )}

          {isValidSafeHref(project.liveDemoUrl) && (
            <button
              type="button"
              onClick={() => onOpenQr(project)}
              className="swiss-pill-btn inline-flex items-center gap-1.5 px-4 py-2.5 text-xs whitespace-nowrap"
            >
              <QrCode className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>QR Preview</span>
            </button>
          )}

          {isValidSafeHref(project.githubUrl) && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/gh inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#111111] hover:text-[#838282] transition-colors whitespace-nowrap"
            >
              <Github className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>View GitHub Repository</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-150 group-hover/gh:translate-x-0.5"
              >
                →
              </span>
            </a>
          )}

          <button
            type="button"
            onClick={() => onSelectProject(project)}
            className="group/det ml-auto inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[#111111] hover:text-[#838282] transition-colors whitespace-nowrap"
          >
            <span>Details</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-150 group-hover/det:translate-x-0.5"
            >
              →
            </span>
          </button>
        </div>

        {editMode && isAdmin && (
          <div className="mt-5 pt-3.5 border-t border-[#1e1e1e]/15 flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={() => onOpenAdminTab('projects')}
              className="inline-flex items-center gap-1 font-bold uppercase tracking-[0.08em] text-[#111111] hover:underline"
            >
              <Pencil className="w-3 h-3" strokeWidth={1.5} />
              Edit Project
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onQuickToggleFeatured(project)}
                className="inline-flex items-center gap-1 font-medium text-[#111111] hover:text-[#838282]"
              >
                <Star className="w-3 h-3" strokeWidth={1.5} />
                {project.isFeatured ? 'Featured' : 'Feature'}
              </button>
              <button
                type="button"
                onClick={() => onQuickDeleteProject(project)}
                className="inline-flex items-center gap-1 font-medium text-[#111111] hover:underline"
              >
                <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </TiltCard>
  );
}

export function PortfolioSections({
  portfolio,
  isAdmin,
  editMode,
  theme,
  onToggleTheme,
  onOpenAdminLogin,
  onOpenAdminTab,
  onMoveSection,
  onToggleSectionVisibility,
  onQuickDeleteProject,
  onQuickToggleFeatured,
}: PortfolioSectionsProps) {
  const {
    profile,
    about,
    skillCategories,
    projects,
    education,
    certificates,
    socialLinks,
    resume,
    settings,
    customSections,
  } = portfolio;

  const [activeStackTab, setActiveStackTab] = useState<string>('react');
  const [skillFilter, setSkillFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [qrProject, setQrProject] = useState<ProjectData | null>(null);

  useEffect(() => {
    if (!qrProject && !selectedProject) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (qrProject) setQrProject(null);
        else if (selectedProject) setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [qrProject, selectedProject]);

  const [copiedEmail, setCopiedEmail] = useState(false);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactFeedback, setContactFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const visibleProjects = useMemo(
    () => (editMode ? projects : projects.filter((p) => p.isVisible)),
    [projects, editMode]
  );

  const projectFilterOptions = useMemo(() => {
    const categories = new Set<string>();
    const techs = new Set<string>();
    for (const p of visibleProjects) {
      if (p.category) categories.add(p.category);
      for (const t of p.technologies) {
        if (t) techs.add(t);
      }
    }
    return [
      { key: 'ALL', label: 'All Projects' },
      ...Array.from(categories).map((c) => ({ key: `cat:${c}`, label: c })),
      ...Array.from(techs)
        .filter((t) => !categories.has(t))
        .slice(0, 5)
        .map((t) => ({ key: `tech:${t}`, label: t })),
    ];
  }, [visibleProjects]);

  const filteredProjects = useMemo(() => {
    if (projectFilter === 'ALL') return visibleProjects;
    if (projectFilter.startsWith('cat:')) {
      const target = projectFilter.slice(4);
      return visibleProjects.filter((p) => p.category === target);
    }
    if (projectFilter.startsWith('tech:')) {
      const target = projectFilter.slice(5);
      return visibleProjects.filter((p) => p.technologies.includes(target));
    }
    return visibleProjects;
  }, [visibleProjects, projectFilter]);

  const visibleSkillCategories = useMemo(
    () => (editMode ? skillCategories : skillCategories.filter((c) => c.isVisible)),
    [skillCategories, editMode]
  );

  const filteredSkillCategories = useMemo(() => {
    if (skillFilter === 'ALL') return visibleSkillCategories;
    return visibleSkillCategories.filter((c) => String(c.id) === skillFilter);
  }, [visibleSkillCategories, skillFilter]);

  const contactSocials = useMemo(
    () => socialLinks.filter((s) => s.isVisible && s.showInContact),
    [socialLinks]
  );

  const githubSocial = socialLinks.find((s) => s.platform.toLowerCase() === 'github');
  const linkedinSocial = socialLinks.find((s) => s.platform.toLowerCase() === 'linkedin');

  const orderedSectionKeys = useMemo(() => {
    const defaults = [
      'home',
      'about',
      'education',
      'skills',
      'projects',
      'certificates',
      'resume',
      'contact',
    ];
    const base =
      Array.isArray(settings.sectionOrder) && settings.sectionOrder.length > 0
        ? settings.sectionOrder
        : defaults;
    const merged = [...base];
    for (const key of defaults) {
      if (!merged.includes(key)) merged.push(key);
    }
    return merged;
  }, [settings.sectionOrder]);

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      try {
        const el = document.createElement('textarea');
        el.value = email;
        el.setAttribute('readonly', '');
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.focus();
        el.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(el);
        if (ok) {
          setCopiedEmail(true);
          window.setTimeout(() => setCopiedEmail(false), 2200);
          return;
        }
      } catch {
        // Fallback unavailable
      }
      setCopiedEmail(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactFeedback(null);

    if (contactName.trim().length < 2) {
      setContactFeedback({ type: 'error', text: 'Please enter your name (at least 2 characters).' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setContactFeedback({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    if (contactMessage.trim().length < 10) {
      setContactFeedback({
        type: 'error',
        text: 'Please write a message of at least 10 characters.',
      });
      return;
    }

    setContactSubmitting(true);
    try {
      await apiRequest('/api/contact', {
        method: 'POST',
        body: {
          name: contactName.trim(),
          email: contactEmail.trim(),
          subject: contactSubject.trim() || 'Portfolio Inquiry',
          message: contactMessage.trim(),
        },
      });
      setContactFeedback({
        type: 'success',
        text: 'Message delivered! Thank you for reaching out.',
      });
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    } catch (err: any) {
      setContactFeedback({
        type: 'error',
        text: err.message || 'Unable to send your message right now.',
      });
    } finally {
      setContactSubmitting(false);
    }
  };

  const renderSocialHref = (platform: string, rawUrl: string): string | null => {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      if (platform.toLowerCase() === 'email' && settings.contactEmail && settings.showContactEmail) {
        return `mailto:${settings.contactEmail}`;
      }
      return null;
    }
    if (platform.toLowerCase() === 'email' && !trimmed.startsWith('mailto:')) {
      return `mailto:${trimmed}`;
    }
    return isValidSafeHref(trimmed) ? trimmed : null;
  };

  const renderCustomSection = (sec: CustomSectionData) => {
    if (!sec.isVisible && !editMode) return null;
    return (
      <section
        id={sec.slug}
        key={`custom-${sec.id}`}
        className={`relative py-20 sm:py-24 bg-[#f2f2f2] border-b border-[#1e1e1e]/12 ${
          !sec.isVisible ? 'opacity-55' : ''
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              {sec.subtitle && (
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#838282]">
                  {sec.subtitle}
                </p>
              )}
              <h2 className="mt-3 text-4xl sm:text-5xl swiss-heading uppercase text-[#111111] [text-wrap:balance]">
                <EditorialHeading text={sec.title} italicWord="Prototyping" />
              </h2>
            </div>
            {editMode && isAdmin && (
              <button
                type="button"
                onClick={() => onOpenAdminTab('custom')}
                className="swiss-pill-btn inline-flex items-center gap-1.5 px-4 py-2 text-xs"
              >
                <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                Edit Section
              </button>
            )}
          </SectionReveal>

          {sec.sectionType === 'timeline' ? (
            <ScrollSyncedTimeline
              items={sec.items}
              renderItem={(item, idx) => (
                <TiltCard
                  interactiveCursor
                  revealDelay={idx * 0.06}
                  className="group swiss-card p-6 sm:p-8"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {item.date && (
                        <p className="text-xs font-mono font-medium text-[#838282] tabular-nums">
                          {item.date}
                        </p>
                      )}
                      <h3 className="mt-2 text-2xl font-display font-bold tracking-[-0.04em] leading-[1.05] text-[#111111]">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="mt-1.5 text-sm font-medium text-[#838282]">{item.subtitle}</p>
                      )}
                    </div>
                    <div className="swiss-icon-box text-[#111111]">
                      <Terminal className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                  </div>

                  {item.description && (
                    <p className="mt-4 text-sm sm:text-base font-normal text-[#111111]/85 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <ul className="mt-5 pt-4 border-t border-[#1e1e1e]/12 space-y-2 text-sm text-[#111111]">
                      {item.tags.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className="w-4 h-4 text-[#111111] shrink-0 mt-0.5"
                            strokeWidth={1.5}
                          />
                          <span className="font-normal">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.url && isValidSafeHref(item.url) && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[#111111] hover:text-[#838282] transition-colors"
                    >
                      <span>Explore details</span>
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-150 group-hover/link:translate-x-0.5"
                      >
                        →
                      </span>
                    </a>
                  )}
                  <span className="sr-only">Entry {idx + 1}</span>
                </TiltCard>
              )}
            />
          ) : (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sec.items.map((item, idx) => (
                <TiltCard
                  key={item.id}
                  interactiveCursor
                  revealDelay={(Math.floor(idx / 3) + (idx % 3)) * 0.06}
                  className="group swiss-card p-6 sm:p-7"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-xl font-display font-bold tracking-[-0.03em] text-[#111111]">
                      {item.title}
                    </h3>
                    {item.date && (
                      <span className="text-xs font-mono tabular-nums text-[#838282]">
                        {item.date}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <p className="mt-1.5 text-sm font-medium text-[#838282]">{item.subtitle}</p>
                  )}
                  {item.description && (
                    <p className="mt-3 text-sm font-normal text-[#111111]/85 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.url && isValidSafeHref(item.url) && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[#111111] hover:text-[#838282] transition-colors"
                    >
                      <span>Learn more</span>
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-150 group-hover/link:translate-x-0.5"
                      >
                        →
                      </span>
                    </a>
                  )}
                </TiltCard>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  const experienceSection = customSections.find((s) => s.slug === 'experience');
  const otherCustomSections = customSections.filter((s) => s.slug !== 'experience');

  const renderSection = (key: string) => {
    const isVisible = settings.sectionVisibility?.[key] !== false;
    if (!isVisible && !editMode) return null;

    const meta = SECTION_META[key];
    const reorderableIndex = orderedSectionKeys.indexOf(key);
    const ribbon =
      editMode && isAdmin && meta ? (
        <EditSectionRibbon
          sectionKey={key}
          label={meta.label}
          visible={isVisible}
          canMoveUp={reorderableIndex > 1}
          canMoveDown={reorderableIndex < orderedSectionKeys.length - 1}
          onEdit={() => onOpenAdminTab(meta.adminTab)}
          onMoveUp={() => onMoveSection(key, 'up')}
          onMoveDown={() => onMoveSection(key, 'down')}
          onToggleVisibility={() => onToggleSectionVisibility(key)}
        />
      ) : null;

    const dimmedClass = !isVisible ? 'opacity-55' : '';

    switch (key) {
      case 'home':
        return (
          <HeroChoreography
            key="home"
            profile={profile}
            resume={resume}
            theme={theme}
            ribbon={ribbon}
            dimmedClass={dimmedClass}
            stackTabs={STACK_FOCUS_TABS}
            activeStackTab={activeStackTab}
            onSelectStackTab={setActiveStackTab}
            avatarNode={
              <ImageWithFallback
                src={profile.avatarUrl}
                alt={profile.fullName}
                fallbackTitle={profile.fullName}
                fallbackType="avatar"
                className="swiss-media w-full h-full object-cover object-[50%_10%]"
              />
            }
          />
        );

      case 'about':
        return (
          <section
            id="about"
            key="about"
            className={`relative py-20 sm:py-24 bg-[#f2f2f2] border-b border-[#1e1e1e]/12 ${dimmedClass}`}
          >
            {ribbon}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <SectionReveal className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#838282]">
                  WHO I AM
                </p>
                <h2 className="mt-3 text-4xl sm:text-5xl swiss-heading uppercase text-[#111111] [text-wrap:balance]">
                  <EditorialHeading text={about.heading} italicWord="algorithms" />
                </h2>
              </SectionReveal>

              <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Portrait Card with Full Pill Vertical Accent Frame */}
                {about.showImage && (
                  <div className="lg:col-span-5">
                    <TiltCard
                      interactiveCursor
                      className="group swiss-card h-full p-6 flex flex-col justify-between gap-6"
                    >
                      <ClipRevealMedia className="w-full max-w-[280px] mx-auto aspect-[3/4] rounded-full overflow-hidden border border-[#1e1e1e]/15 bg-[#e6e6e6]">
                        <ImageWithFallback
                          src={about.imageUrl}
                          alt={profile.fullName}
                          fallbackTitle={profile.fullName}
                          fallbackType="avatar"
                          className="swiss-media w-full h-full object-cover object-top"
                        />
                      </ClipRevealMedia>
                      <div className="pt-5 border-t border-[#1e1e1e]/12 space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#838282]">
                          SY B.TECH COMPUTER ENGINEERING
                        </p>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-display font-bold tracking-[-0.03em] text-[#111111]">
                              Aniruddha Damale
                            </h3>
                            <p className="text-xs font-normal text-[#838282]">
                              Full Stack &amp; Android Developer · Pune, Maharashtra, India
                            </p>
                          </div>
                          {githubSocial?.url && isValidSafeHref(githubSocial.url) && (
                            <a
                              href={githubSocial.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/gh inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-[#111111] hover:text-[#838282] transition-colors shrink-0"
                            >
                              <span>GitHub</span>
                              <span
                                aria-hidden="true"
                                className="transition-transform duration-150 group-hover/gh:translate-x-0.5"
                              >
                                →
                              </span>
                            </a>
                          )}
                        </div>
                      </div>
                    </TiltCard>
                  </div>
                )}

                {/* Right Summary & Engineering Focus */}
                <div
                  className={`${
                    about.showImage ? 'lg:col-span-7' : 'lg:col-span-12'
                  } flex flex-col justify-between gap-6`}
                >
                  <SectionReveal delay={0.08} className="swiss-card p-6 sm:p-8 space-y-4">
                    {(editMode ? about.blocks : about.blocks.filter((b) => b.isVisible)).map(
                      (block) => (
                        <p
                          key={block.id}
                          className={`text-sm sm:text-base font-normal text-[#111111]/85 leading-relaxed ${
                            !block.isVisible ? 'opacity-45' : ''
                          }`}
                        >
                          {block.content}
                        </p>
                      )
                    )}

                    <div className="pt-5 mt-2 border-t border-[#1e1e1e]/12">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#838282]">
                        CORE ENGINEERING FOCUS
                      </p>
                      <p className="mt-1.5 text-sm font-bold text-[#111111]">
                        {about.subheading ||
                          'Clean Architecture · Algorithmic Efficiency · Cross-Platform Web & Android Delivery'}
                      </p>
                    </div>
                  </SectionReveal>

                  {/* 3 Highlight Metric Cards with 64x64px rotating index boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {ABOUT_METRICS.map((m, idx) => (
                      <TiltCard
                        key={m.value}
                        interactiveCursor
                        revealDelay={idx * 0.06}
                        className="group swiss-card p-6 flex flex-col justify-between gap-5"
                      >
                        <div className="swiss-icon-box text-[#111111]">
                          <span className="font-display font-bold text-lg tracking-[-0.04em] tabular-nums">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <div>
                          <p className="text-2xl swiss-heading uppercase text-[#111111] tabular-nums">
                            {m.value}
                          </p>
                          <p className="mt-2 text-sm font-bold text-[#111111]">{m.label}</p>
                          <p className="mt-1 text-xs font-normal text-[#838282] leading-snug">
                            {m.sublabel}
                          </p>
                        </div>
                      </TiltCard>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'education': {
        const items = editMode ? education : education.filter((e) => e.isVisible);
        return (
          <section
            id="education"
            key="education"
            className={`relative py-20 sm:py-24 bg-[#f2f2f2] border-b border-[#1e1e1e]/12 ${dimmedClass}`}
          >
            {ribbon}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <SectionReveal className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#838282]">
                    ACADEMIC FOUNDATION
                  </p>
                  <h2 className="mt-3 text-4xl sm:text-5xl swiss-heading uppercase text-[#111111] [text-wrap:balance]">
                    <EditorialHeading text="Education & Core Coursework" italicWord="Coursework" />
                  </h2>
                </div>
                {editMode && isAdmin && (
                  <button
                    type="button"
                    onClick={() => onOpenAdminTab('education')}
                    className="swiss-pill-btn-solid inline-flex items-center gap-1.5 px-4 py-2 text-xs whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Edit Education
                  </button>
                )}
              </SectionReveal>

              <div className="mt-12 space-y-6">
                {items.map((edu) => (
                  <div key={edu.id} className={`space-y-6 ${!edu.isVisible ? 'opacity-50' : ''}`}>
                    {/* Degree Card */}
                    <TiltCard interactiveCursor className="group swiss-card p-6 sm:p-8">
                      <div className="flex items-start justify-between gap-6">
                        <div className="space-y-2.5">
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#838282]">
                            {edu.universityName || 'UNDERGRADUATE DEGREE'}
                          </p>
                          <h3 className="text-2xl sm:text-3xl swiss-heading uppercase text-[#111111]">
                            {edu.degree}
                          </h3>
                          {edu.branch && (
                            <p className="text-sm font-bold text-[#111111]">{edu.branch}</p>
                          )}
                          {edu.description && (
                            <p className="pt-1 text-sm sm:text-base font-normal text-[#111111]/80 leading-relaxed max-w-3xl">
                              {edu.description}
                            </p>
                          )}
                          <div className="pt-2 flex flex-wrap items-center gap-5 text-xs font-mono tabular-nums text-[#838282]">
                            {edu.collegeName && (
                              <span className="inline-flex items-center gap-1.5 text-[#111111]">
                                <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                                {edu.collegeName}
                              </span>
                            )}
                            {edu.academicYear && <span>{edu.academicYear}</span>}
                          </div>
                        </div>

                        <div className="w-16 h-16 aspect-square rounded-full border border-[#1e1e1e]/20 bg-white flex items-center justify-center shrink-0 overflow-hidden">
                          <ImageWithFallback
                            src={edu.logoUrl}
                            alt={edu.collegeName}
                            fallbackTitle={edu.collegeName}
                            fallbackType="logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </TiltCard>

                    {/* Academic Highlights 2x2 Grid (01. to 04.) with 64x64px rotating index boxes */}
                    {edu.achievements.length > 0 && (
                      <div className="p-6 sm:p-8 rounded-[2px] border border-[#1e1e1e]/12 bg-transparent">
                        <div className="mb-6">
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#838282]">
                            ACADEMIC HIGHLIGHTS
                          </p>
                          <h4 className="mt-1.5 text-xl sm:text-2xl swiss-heading uppercase text-[#111111]">
                            Core Coursework &amp; Applied Engineering
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {edu.achievements.map((ach, idx) => {
                            const numPrefix = String(idx + 1).padStart(2, '0') + '.';
                            const cleaned = ach.replace(/^\d+\.\s*/, '');
                            const [head, ...rest] = cleaned.split(/\s+—\s+/);
                            const body = rest.join(' — ');
                            const diagIndex = Math.floor(idx / 2) + (idx % 2);
                            return (
                              <TiltCard
                                key={idx}
                                interactiveCursor
                                revealDelay={diagIndex * 0.06}
                                className="group swiss-card p-6 flex items-start gap-5"
                              >
                                <div className="swiss-icon-box text-[#111111]">
                                  <span className="font-display font-bold text-lg tracking-[-0.04em] tabular-nums">
                                    {numPrefix}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-base font-display font-bold tracking-[-0.03em] text-[#111111]">
                                    {head}
                                  </h5>
                                  {body && (
                                    <p className="mt-1.5 text-xs sm:text-sm font-normal text-[#838282] leading-relaxed">
                                      {body}
                                    </p>
                                  )}
                                </div>
                              </TiltCard>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case 'skills':
        return (
          <section
            id="skills"
            key="skills"
            className={`relative py-20 sm:py-24 bg-[#f2f2f2] border-b border-[#1e1e1e]/12 ${dimmedClass}`}
          >
            {ribbon}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <SectionReveal className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#838282]">
                    MY TOOLBOX
                  </p>
                  <h2 className="mt-3 text-4xl sm:text-5xl swiss-heading uppercase text-[#111111] [text-wrap:balance]">
                    <EditorialHeading
                      text="Technical Skills & Engineering Stack"
                      italicWord="Engineering"
                    />
                  </h2>
                </div>
                {editMode && isAdmin && (
                  <button
                    type="button"
                    onClick={() => onOpenAdminTab('skills')}
                    className="swiss-pill-btn-solid inline-flex items-center gap-1.5 px-4 py-2 text-xs whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Manage Skills
                  </button>
                )}
              </SectionReveal>

              {/* Monochromatic Swiss Filter Tabs */}
              <div
                className="mt-8 flex flex-wrap items-center gap-2"
                role="tablist"
                aria-label="Filter skills by discipline"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={skillFilter === 'ALL'}
                  onClick={() => setSkillFilter('ALL')}
                  className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-[0.08em] transition-colors whitespace-nowrap shrink-0 ${
                    skillFilter === 'ALL'
                      ? 'bg-[#1e1e1e] text-[#f2f2f2] border-[#1e1e1e]'
                      : 'bg-transparent border-[#1e1e1e]/20 text-[#111111] hover:border-[#1e1e1e] hover:bg-white'
                  }`}
                >
                  All Disciplines
                </button>
                {visibleSkillCategories.map((cat) => {
                  const active = skillFilter === String(cat.id);
                  const shortLabel =
                    cat.name === 'Web & Mobile Frameworks' ? 'Web & Mobile' : cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSkillFilter(String(cat.id))}
                      className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-[0.08em] transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#1e1e1e] text-[#f2f2f2] border-[#1e1e1e]'
                          : 'bg-transparent border-[#1e1e1e]/20 text-[#111111] hover:border-[#1e1e1e] hover:bg-white'
                      }`}
                    >
                      {shortLabel}
                    </button>
                  );
                })}
              </div>

              <motion.div layout className="mt-10 space-y-6">
                <AnimatePresence mode="popLayout">
                  {filteredSkillCategories.map((cat) => {
                    const items = editMode ? cat.skills : cat.skills.filter((s) => s.isVisible);
                    return (
                      <motion.div
                        layout
                        key={cat.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className={`group p-6 sm:p-8 rounded-[2px] border border-[#1e1e1e]/12 bg-transparent ${
                          !cat.isVisible ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#1e1e1e]/12">
                          <div>
                            <h3 className="text-2xl swiss-heading uppercase text-[#111111]">
                              {cat.name}
                            </h3>
                            {cat.description && (
                              <p className="mt-1.5 text-sm font-normal text-[#838282]">
                                {cat.description}
                              </p>
                            )}
                          </div>
                          <div className="swiss-icon-box text-[#111111]">
                            <DynamicIcon name={cat.icon} className="w-5 h-5" />
                          </div>
                        </div>

                        <motion.div
                          layout
                          className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                          {items.map((skill, idx) => {
                            const diagIndex = Math.floor(idx / 3) + (idx % 3);
                            return (
                              <TiltCard
                                key={skill.id}
                                interactiveCursor
                                layout
                                reveal
                                revealDelay={diagIndex * 0.05}
                                className={`swiss-card p-4 ${!skill.isVisible ? 'opacity-45' : ''}`}
                              >
                                <div className="flex items-start gap-3.5">
                                  <div className="w-9 h-9 rounded-[2px] border border-[#1e1e1e]/15 bg-white flex items-center justify-center shrink-0 mt-0.5 text-[#111111]">
                                    {skill.iconType === 'image' && skill.icon ? (
                                      <img
                                        src={skill.icon}
                                        alt={skill.name}
                                        referrerPolicy="no-referrer"
                                        className="w-4 h-4 object-contain grayscale"
                                      />
                                    ) : (
                                      <DynamicIcon name={skill.icon} className="w-4 h-4 text-[#111111]" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-[#111111]">{skill.name}</p>
                                    {skill.description && (
                                      <p className="mt-1 text-xs font-normal text-[#838282] leading-snug">
                                        {skill.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TiltCard>
                            );
                          })}
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          </section>
        );

      case 'projects':
        return (
          <React.Fragment key="projects">
            <section
              id="projects"
              className={`relative py-20 sm:py-24 bg-[#f2f2f2] border-b border-[#1e1e1e]/12 ${dimmedClass}`}
            >
              {ribbon}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <SectionReveal className="flex flex-wrap items-end justify-between gap-4">
                  <div className="max-w-3xl">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#838282]">
                      FEATURED WORK
                    </p>
                    <h2 className="mt-3 text-4xl sm:text-5xl swiss-heading uppercase text-[#111111] [text-wrap:balance]">
                      <EditorialHeading
                        text="Deployed Web Platforms & Native Android Builds"
                        italicWord="Platforms"
                      />
                    </h2>
                  </div>
                  {editMode && isAdmin && (
                    <button
                      type="button"
                      onClick={() => onOpenAdminTab('projects')}
                      className="swiss-pill-btn-solid inline-flex items-center gap-1.5 px-4 py-2 text-xs whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Add / Manage Projects
                    </button>
                  )}
                </SectionReveal>

                {projectFilterOptions.length > 1 && (
                  <div
                    className="mt-8 flex flex-wrap items-center gap-2"
                    role="tablist"
                    aria-label="Filter projects"
                  >
                    {projectFilterOptions.map((opt) => {
                      const active = projectFilter === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setProjectFilter(opt.key)}
                          className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-[0.08em] transition-colors whitespace-nowrap shrink-0 ${
                            active
                              ? 'bg-[#1e1e1e] text-[#f2f2f2] border-[#1e1e1e]'
                              : 'bg-transparent border-[#1e1e1e]/20 text-[#111111] hover:border-[#1e1e1e] hover:bg-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {filteredProjects.length === 0 ? (
                  <div className="mt-10 p-10 rounded-[2px] border border-[#1e1e1e]/12 text-center">
                    <p className="text-sm font-normal text-[#838282]">
                      No projects match this filter yet.
                    </p>
                  </div>
                ) : (
                  <motion.div layout className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredProjects.map((project, idx) => (
                      <ProjectShowcaseCard
                        key={project.id}
                        project={project}
                        cardIndex={idx}
                        isAdmin={isAdmin}
                        editMode={editMode}
                        onSelectProject={setSelectedProject}
                        onOpenQr={setQrProject}
                        onOpenAdminTab={onOpenAdminTab}
                        onQuickToggleFeatured={onQuickToggleFeatured}
                        onQuickDeleteProject={onQuickDeleteProject}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            </section>

            {/* Place Experience & Activities immediately after Projects */}
            {experienceSection ? renderCustomSection(experienceSection) : null}
          </React.Fragment>
        );

      case 'certificates':
        return (
          <CertificationsSection
            key="certificates"
            certificates={certificates}
            isAdmin={isAdmin}
            editMode={editMode}
            ribbon={ribbon}
            dimmedClass={dimmedClass}
            onOpenAdminCertificates={() => onOpenAdminTab('certificates')}
          />
        );

      case 'resume':
        return (
          <section
            id="resume"
            key="resume"
            className={`relative py-20 sm:py-24 bg-[#f2f2f2] border-b border-[#1e1e1e]/12 ${dimmedClass}`}
          >
            {ribbon}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <SectionReveal className="swiss-card p-8 sm:p-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="max-w-2xl">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#838282]">
                      CURRICULUM VITAE
                    </p>
                    <h2 className="mt-3 text-3xl sm:text-4xl swiss-heading uppercase text-[#111111]">
                      <EditorialHeading text={resume.title} italicWord="Vitae" />
                    </h2>
                    <p className="mt-4 text-sm sm:text-base font-normal text-[#111111]/80 leading-relaxed">
                      {resume.description}
                    </p>
                    {resume.fileName && (
                      <p className="mt-2.5 text-xs font-mono text-[#838282]">
                        Latest file: {resume.fileName}
                        {resume.fileSize ? ` · ${formatBytes(resume.fileSize)}` : ''}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {resume.fileUrl ? (
                      <>
                        <MagneticWrap>
                          <a
                            href={
                              resume.fileUrl.startsWith('/api/files/') && !resume.fileUrl.includes('download=1')
                                ? `${resume.fileUrl}${resume.fileUrl.includes('?') ? '&' : '?'}download=1`
                                : resume.fileUrl
                            }
                            download={resume.fileName || 'Aniruddha_Damale_Resume.pdf'}
                            className="swiss-pill-btn-solid inline-flex items-center gap-2 px-6 py-3 text-xs whitespace-nowrap"
                          >
                            <Download className="w-4 h-4" strokeWidth={1.5} />
                            <span>Download Resume</span>
                          </a>
                        </MagneticWrap>
                        <a
                          href={resume.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="swiss-pill-btn group inline-flex items-center gap-2 px-6 py-3 text-xs whitespace-nowrap"
                        >
                          <span>Open Full PDF</span>
                          <span
                            aria-hidden="true"
                            className="transition-transform duration-150 group-hover:translate-x-0.5"
                          >
                            →
                          </span>
                        </a>
                      </>
                    ) : isAdmin ? (
                      <button
                        type="button"
                        onClick={() => onOpenAdminTab('resume')}
                        className="swiss-pill-btn-solid inline-flex items-center gap-2 px-6 py-3 text-xs whitespace-nowrap"
                      >
                        <FileText className="w-4 h-4" strokeWidth={1.5} />
                        <span>Upload Resume PDF</span>
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-[#838282]">
                        Resume PDF can be uploaded via the Admin Dashboard.
                      </span>
                    )}
                  </div>
                </div>

                {resume.fileUrl && (
                  <div className="mt-8 rounded-[2px] overflow-hidden border border-[#1e1e1e]/15 bg-white h-[520px]">
                    <iframe src={resume.fileUrl} title={resume.title} className="w-full h-full" />
                  </div>
                )}
              </SectionReveal>
            </div>
          </section>
        );

      case 'contact':
        return (
          <section
            id="contact"
            key="contact"
            className={`relative py-20 sm:py-24 bg-[#f2f2f2] ${dimmedClass}`}
          >
            {ribbon}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <SectionReveal className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#838282]">
                  GET IN TOUCH
                </p>
                <h2 className="mt-3 text-4xl sm:text-5xl swiss-heading uppercase text-[#111111] [text-wrap:balance]">
                  <EditorialHeading
                    text="Let's build something practical together"
                    italicWord="practical"
                  />
                </h2>
                {settings.contactIntro && (
                  <p className="mt-4 text-base font-normal text-[#111111]/80 leading-relaxed">
                    {settings.contactIntro}
                  </p>
                )}
              </SectionReveal>

              <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Direct Contact & Social Cards */}
                <div className="lg:col-span-5 space-y-4">
                  {settings.showContactEmail && settings.contactEmail && (
                    <TiltCard interactiveCursor className="group swiss-card p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="swiss-icon-box text-[#111111]">
                            <Mail className="w-5 h-5" strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#838282]">
                              EMAIL ADDRESS
                            </p>
                            <a
                              href={`mailto:${settings.contactEmail}`}
                              className="mt-0.5 text-sm font-bold text-[#111111] hover:text-[#838282] transition-colors truncate block"
                            >
                              {settings.contactEmail}
                            </a>
                          </div>
                        </div>

                        <AnimatedCopyButton
                          copied={copiedEmail}
                          onClick={() => void handleCopyEmail(settings.contactEmail)}
                        />
                      </div>
                    </TiltCard>
                  )}

                  {contactSocials
                    .filter((s) => s.platform.toLowerCase() !== 'email' || !settings.contactEmail)
                    .map((social, idx) => {
                      const href = renderSocialHref(social.platform, social.url);
                      if (!href) return null;
                      return (
                        <TiltCard
                          key={social.id}
                          interactiveCursor
                          revealDelay={(idx + 1) * 0.06}
                          className="group swiss-card"
                        >
                          <a
                            href={href}
                            target={href.startsWith('mailto:') ? undefined : '_blank'}
                            rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                            className="flex items-center gap-4 p-5"
                          >
                            <div className="swiss-icon-box text-[#111111]">
                              <DynamicIcon name={social.icon} className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#111111]">
                                {social.platform}
                              </p>
                              <p className="mt-0.5 text-xs font-mono text-[#838282] truncate">
                                {social.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\?.*$/, '')}
                              </p>
                            </div>
                            <span
                              aria-hidden="true"
                              className="text-sm text-[#111111] transition-transform duration-150 group-hover:translate-x-1 shrink-0"
                            >
                              →
                            </span>
                          </a>
                        </TiltCard>
                      );
                    })}

                  {profile.location && (
                    <div className="pt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#838282]">
                      <MapPin className="w-4 h-4 text-[#111111] shrink-0" strokeWidth={1.5} />
                      <span>Based in {profile.location}</span>
                    </div>
                  )}
                </div>

                {/* Interactive Contact Form */}
                {settings.contactFormEnabled && (
                  <SectionReveal delay={0.1} className="lg:col-span-7">
                    <form
                      onSubmit={handleContactSubmit}
                      className="swiss-card p-6 sm:p-8 space-y-5"
                      noValidate
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="contact-name"
                            className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#838282] mb-2"
                          >
                            NAME
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-4 py-3 text-sm rounded-[2px] border border-[#1e1e1e]/20 bg-white text-[#111111] placeholder:text-[#b6b5b5] focus:outline-none focus:border-[#1e1e1e] transition-colors"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="contact-email"
                            className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#838282] mb-2"
                          >
                            EMAIL
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 text-sm rounded-[2px] border border-[#1e1e1e]/20 bg-white text-[#111111] placeholder:text-[#b6b5b5] focus:outline-none focus:border-[#1e1e1e] transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="contact-subject"
                          className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#838282] mb-2"
                        >
                          SUBJECT (OPTIONAL)
                        </label>
                        <input
                          id="contact-subject"
                          type="text"
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          placeholder="Internship, web/Android project, or hackathon team"
                          className="w-full px-4 py-3 text-sm rounded-[2px] border border-[#1e1e1e]/20 bg-white text-[#111111] placeholder:text-[#b6b5b5] focus:outline-none focus:border-[#1e1e1e] transition-colors"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-message"
                          className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#838282] mb-2"
                        >
                          MESSAGE
                        </label>
                        <textarea
                          id="contact-message"
                          rows={5}
                          required
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="Share details about your project, internship opportunity, or collaboration..."
                          className="w-full px-4 py-3 text-sm rounded-[2px] border border-[#1e1e1e]/20 bg-white text-[#111111] placeholder:text-[#b6b5b5] focus:outline-none focus:border-[#1e1e1e] transition-colors resize-y"
                        />
                      </div>

                      {contactFeedback && (
                        <div className="rounded-[2px] px-4 py-3 text-sm border border-[#1e1e1e] bg-white text-[#111111] flex items-start gap-2.5">
                          {contactFeedback.type === 'success' && (
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
                          )}
                          <span>{contactFeedback.text}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        {settings.contactEmail ? (
                          <p className="text-xs text-[#838282]">
                            Direct reply to{' '}
                            <span className="font-mono font-medium text-[#111111]">
                              {settings.contactEmail}
                            </span>
                          </p>
                        ) : (
                          <span />
                        )}
                        <MagneticWrap>
                          <button
                            type="submit"
                            disabled={contactSubmitting}
                            className="swiss-pill-btn-solid inline-flex items-center gap-2 px-7 py-3.5 text-xs disabled:opacity-50 whitespace-nowrap"
                          >
                            <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>{contactSubmitting ? 'Sending...' : 'Send Message'}</span>
                          </button>
                        </MagneticWrap>
                      </div>
                    </form>
                  </SectionReveal>
                )}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <main>
        {orderedSectionKeys.map((key) => renderSection(key))}
        {otherCustomSections.map((sec) => renderCustomSection(sec))}
      </main>

      {/* Deep Matte Charcoal Footer (#1e1e1e) with 60% #f6f6f6 text and 1px rgba(255,255,255,0.08) top border */}
      <footer className="relative bg-[#1e1e1e] text-[#f6f6f6]/60 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <p className="text-xs font-medium tracking-[0.04em] text-[#f6f6f6]/60">
            {settings.copyrightText}
          </p>

          <div className="flex flex-wrap items-center gap-5 text-xs font-bold uppercase tracking-[0.1em] text-[#f6f6f6]/60">
            {githubSocial?.url && isValidSafeHref(githubSocial.url) && (
              <a
                href={githubSocial.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#f6f6f6] transition-colors duration-[120ms]"
              >
                GitHub →
              </a>
            )}
            {linkedinSocial?.url && isValidSafeHref(linkedinSocial.url) && (
              <a
                href={linkedinSocial.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#f6f6f6] transition-colors duration-[120ms]"
              >
                LinkedIn →
              </a>
            )}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/15 text-[#f6f6f6]/80 hover:bg-[#f6f6f6] hover:text-[#1e1e1e] hover:border-[#f6f6f6] transition-colors"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3 h-3" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            >
              {theme === 'dark' ? 'Light theme' : 'Dark theme'}
            </button>
            <button
              type="button"
              onClick={() => (isAdmin ? onOpenAdminTab('overview') : onOpenAdminLogin())}
              className="inline-flex items-center gap-1.5 text-[#f6f6f6]/45 hover:text-[#f6f6f6] transition-colors"
              title="Owner access"
            >
              <Lock className="w-3 h-3" strokeWidth={1.5} />
              <span>{isAdmin ? 'Admin' : 'Manage'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Scannable QR Code Preview Modal */}
      {qrProject && (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-[#111111]/65 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          onClick={() => setQrProject(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#f2f2f2] border border-[#1e1e1e] rounded-[2px] max-w-sm w-full p-6 text-center space-y-5"
          >
            <div className="flex items-start justify-between gap-2 text-left pb-3 border-b border-[#1e1e1e]/12">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#838282]">
                  MOBILE QUICK SCAN
                </p>
                <h3
                  id="qr-modal-title"
                  className="mt-1 text-xl swiss-heading uppercase text-[#111111]"
                >
                  {qrProject.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQrProject(null)}
                aria-label="Close QR preview"
                className="w-8 h-8 rounded-full border border-[#1e1e1e]/20 text-[#111111] hover:bg-[#1e1e1e] hover:text-[#f2f2f2] inline-flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-5 rounded-[2px] bg-white border border-[#1e1e1e]/15 inline-flex items-center justify-center mx-auto">
              <QRCodeSVG
                value={qrProject.liveDemoUrl}
                size={200}
                level="M"
                bgColor="#ffffff"
                fgColor="#111111"
              />
            </div>

            <p className="text-xs font-mono text-[#838282] break-all">{qrProject.liveDemoUrl}</p>

            <div className="flex items-center justify-center gap-3">
              <a
                href={qrProject.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="swiss-pill-btn-solid inline-flex items-center gap-1.5 px-5 py-2.5 text-xs whitespace-nowrap"
              >
                <span>Open Live Link</span>
                <span aria-hidden="true">→</span>
              </a>
              <button
                type="button"
                onClick={() => setQrProject(null)}
                className="swiss-pill-btn px-5 py-2.5 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111111]/65 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedProject(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#f2f2f2] border border-[#1e1e1e] rounded-[2px] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="relative aspect-[16/9] bg-[#e6e6e6] border-b border-[#1e1e1e]/15 overflow-hidden swiss-media-hover">
              <ImageWithFallback
                src={selectedProject.imageUrl}
                alt={selectedProject.title}
                fallbackTitle={selectedProject.title}
                fallbackType="project"
                className="swiss-media w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f2f2f2] border border-[#1e1e1e] text-[#111111] hover:bg-[#1e1e1e] hover:text-[#f2f2f2] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#838282]">
                  <span>{selectedProject.category}</span>
                  {' · '}
                  <span>{selectedProject.status}</span>
                </p>
                <h3 className="mt-2 text-3xl swiss-heading uppercase text-[#111111]">
                  {selectedProject.title}
                </h3>
                {selectedProject.subtitle && (
                  <p className="mt-1.5 text-sm font-medium text-[#838282]">
                    {selectedProject.subtitle}
                  </p>
                )}
              </div>

              <p className="text-sm sm:text-base font-normal text-[#111111]/85 leading-relaxed whitespace-pre-line">
                {selectedProject.description}
              </p>

              {selectedProject.features.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#838282]">
                    KEY CAPABILITIES
                  </h4>
                  <ul className="mt-2.5 space-y-2 text-sm text-[#111111]">
                    {selectedProject.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span className="font-normal">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedProject.technologies.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#838282]">
                    TECH STACK
                  </h4>
                  <p className="mt-2 text-xs font-mono text-[#111111]">
                    {selectedProject.technologies.join('  /  ')}
                  </p>
                </div>
              )}

              <div className="pt-5 border-t border-[#1e1e1e]/12 flex flex-wrap items-center gap-3">
                {isValidSafeHref(selectedProject.liveDemoUrl) && (
                  <a
                    href={selectedProject.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="swiss-pill-btn-solid inline-flex items-center gap-2 px-5 py-2.5 text-xs whitespace-nowrap"
                  >
                    <span>Visit Live App</span>
                    <span aria-hidden="true">→</span>
                  </a>
                )}
                {isValidSafeHref(selectedProject.githubUrl) && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="swiss-pill-btn inline-flex items-center gap-2 px-5 py-2.5 text-xs whitespace-nowrap"
                  >
                    <Github className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>GitHub Repository</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="ml-auto px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[#838282] hover:text-[#111111]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
