import React from 'react';
import {
  Award,
  Code2,
  Eye,
  FileText,
  FolderGit2,
  GraduationCap,
  Home,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Pencil,
  Settings,
  Share2,
  User,
} from 'lucide-react';
import type {
  AuthUserInfo,
  ContactMessageData,
  PortfolioPayload,
} from '../../types/portfolio.ts';
import type { AdminTabKey } from '../PortfolioSections.tsx';
import {
  AboutMeEditor,
  HomeSectionEditor,
  SkillsManagerEditor,
} from './AdminCoreEditors.tsx';
import { AdminProjectsEditor } from './AdminProjectsEditor.tsx';
import {
  CertificatesManagerEditor,
  EducationManagerEditor,
  ResumeManagerEditor,
} from './AdminCredentialsEditors.tsx';
import {
  ContactAndInboxEditor,
  CustomSectionsEditor,
  SocialMediaManagerEditor,
  WebsiteSettingsEditor,
} from './AdminSettingsEditors.tsx';

interface AdminDashboardProps {
  portfolio: PortfolioPayload;
  messages: ContactMessageData[];
  authInfo: AuthUserInfo;
  activeTab: AdminTabKey;
  onSelectTab: (tab: AdminTabKey) => void;
  onPreviewPublic: () => void;
  onEnterEditMode: () => void;
  onLogout: () => void;
  getToken: () => Promise<string | null>;
  onRefresh: () => Promise<void>;
  notify: (type: 'success' | 'error', text: string) => void;
}

const NAV_ITEMS: Array<{
  key: AdminTabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
  { key: 'home', label: 'Home Section', icon: Home },
  { key: 'about', label: 'About Me', icon: User },
  { key: 'skills', label: 'Skills Manager', icon: Code2 },
  { key: 'projects', label: 'Projects Manager', icon: FolderGit2 },
  { key: 'education', label: 'Education Manager', icon: GraduationCap },
  { key: 'certificates', label: 'Certificates', icon: Award },
  { key: 'resume', label: 'Resume Manager', icon: FileText },
  { key: 'contact', label: 'Contact & Inbox', icon: Mail },
  { key: 'socials', label: 'Social Media', icon: Share2 },
  { key: 'custom', label: 'Extra Sections', icon: Layers },
  { key: 'settings', label: 'Website Settings', icon: Settings },
];

export function AdminDashboard({
  portfolio,
  messages,
  authInfo,
  activeTab,
  onSelectTab,
  onPreviewPublic,
  onEnterEditMode,
  onLogout,
  getToken,
  onRefresh,
  notify,
}: AdminDashboardProps) {
  const totalSkills = portfolio.skillCategories.reduce((acc, c) => acc + c.skills.length, 0);
  const unreadMessages = messages.filter((m) => !m.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-display font-bold text-base tracking-tight text-slate-950 dark:text-white whitespace-nowrap">
            Portfolio Admin
          </span>
          <span className="hidden sm:inline text-xs text-slate-400">·</span>
          <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 truncate">
            {authInfo.email}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onEnterEditMode}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg accent-bg text-white text-xs font-semibold whitespace-nowrap"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Website Mode
          </button>
          <button
            type="button"
            onClick={onPreviewPublic}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview Site
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 whitespace-nowrap"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar */}
        <aside className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 lg:sticky lg:top-22">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectTab(item.key)}
                  className={`flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 text-left ${
                    active
                      ? 'accent-soft-bg accent-text font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {item.key === 'contact' && unreadMessages > 0 && (
                    <span className="text-[11px] font-mono tabular-nums font-semibold accent-text">
                      {unreadMessages}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Panel */}
        <main className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-2xl font-display font-bold text-slate-950 dark:text-white">
                  Dashboard Overview
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Every section on your portfolio is connected to PostgreSQL. Edit content here or
                  switch to Edit Website Mode to manage sections directly on the live page.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Projects', value: portfolio.projects.length, tab: 'projects' as const },
                  { label: 'Skills', value: totalSkills, tab: 'skills' as const },
                  {
                    label: 'Certificates',
                    value: portfolio.certificates.length,
                    tab: 'certificates' as const,
                  },
                  {
                    label: 'Unread Messages',
                    value: unreadMessages,
                    tab: 'contact' as const,
                  },
                ].map((stat) => (
                  <button
                    key={stat.label}
                    type="button"
                    onClick={() => onSelectTab(stat.tab)}
                    className="text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 hover:border-blue-400 transition-colors"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-3xl font-display font-bold font-mono tabular-nums text-slate-950 dark:text-white">
                      {stat.value}
                    </p>
                  </button>
                ))}
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  Quick Section Access
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {NAV_ITEMS.filter((i) => i.key !== 'overview').map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => onSelectTab(item.key)}
                        className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 text-left transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg accent-soft-bg accent-text flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'home' && (
            <HomeSectionEditor
              profile={portfolio.profile}
              getToken={getToken}
              onRefresh={onRefresh}
              notify={notify}
            />
          )}

          {activeTab === 'about' && (
            <AboutMeEditor
              about={portfolio.about}
              getToken={getToken}
              onRefresh={onRefresh}
              notify={notify}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsManagerEditor
              categories={portfolio.skillCategories}
              getToken={getToken}
              onRefresh={onRefresh}
              notify={notify}
            />
          )}

          {activeTab === 'projects' && (
            <AdminProjectsEditor
              projects={portfolio.projects}
              getToken={getToken}
              onRefresh={onRefresh}
              notify={notify}
            />
          )}

          {activeTab === 'education' && (
            <EducationManagerEditor
              education={portfolio.education}
              getToken={getToken}
              onRefresh={onRefresh}
              notify={notify}
            />
          )}

          {activeTab === 'certificates' && (
            <CertificatesManagerEditor
              certificates={portfolio.certificates}
              getToken={getToken}
              onRefresh={onRefresh}
              notify={notify}
            />
          )}

          {activeTab === 'resume' && (
            <ResumeManagerEditor
              resume={portfolio.resume}
              getToken={getToken}
              onRefresh={onRefresh}
              notify={notify}
            />
          )}

          {activeTab === 'contact' && (
            <ContactAndInboxEditor
              settings={portfolio.settings}
              messages={messages}
              getToken={getToken}
              onRefresh={onRefresh}
              notify={notify}
            />
          )}

          {activeTab === 'socials' && (
            <SocialMediaManagerEditor
              socialLinks={portfolio.socialLinks}
              getToken={getToken}
              onRefresh={onRefresh}
              notify={notify}
            />
          )}

          {activeTab === 'custom' && (
            <CustomSectionsEditor
              customSections={portfolio.customSections}
              getToken={getToken}
              onRefresh={onRefresh}
              notify={notify}
            />
          )}

          {activeTab === 'settings' && (
            <WebsiteSettingsEditor
              settings={portfolio.settings}
              getToken={getToken}
              onRefresh={onRefresh}
              notify={notify}
            />
          )}
        </main>
      </div>
    </div>
  );
}
