import React, { useCallback, useEffect, useState } from 'react';
import { Eye, LayoutDashboard, LogOut, Pencil } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { apiRequest, fetchAdminBundle, fetchPublicPortfolio } from './lib/api.ts';
import type {
  ContactMessageData,
  PortfolioPayload,
  ProjectData,
} from './types/portfolio.ts';
import { Navbar } from './components/Navbar.tsx';
import { PortfolioSections, type AdminTabKey } from './components/PortfolioSections.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { ChatAssistant } from './components/ChatAssistant.tsx';
import { ToastStack, type ToastMessage } from './components/ui/Toast.tsx';
import { ConfirmDialog } from './components/ui/ConfirmDialog.tsx';
import { MouseSpotlightLayer, TrailingCursorRing } from './components/TechfestEffects.tsx';

function PortfolioApp() {
  const { authInfo, getToken, logout } = useAuth();
  const isAdmin = Boolean(authInfo?.isAdmin);

  const [portfolio, setPortfolio] = useState<PortfolioPayload | null>(null);
  const [messages, setMessages] = useState<ContactMessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'public' | 'dashboard'>('public');
  const [editMode, setEditMode] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTabKey>('overview');
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [quickDeleteProject, setQuickDeleteProject] = useState<ProjectData | null>(null);

  const notify = useCallback((type: 'success' | 'error', text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const loadPortfolio = useCallback(async () => {
    setLoadError(null);
    try {
      const token = await getToken();
      if (isAdmin && token) {
        const bundle = await fetchAdminBundle(token);
        setPortfolio(bundle.portfolio);
        setMessages(bundle.messages);
      } else {
        const data = await fetchPublicPortfolio(token, false);
        setPortfolio(data);
        setMessages([]);
      }
    } catch (err: any) {
      setLoadError(err.message || 'Unable to load portfolio right now.');
    } finally {
      setLoading(false);
    }
  }, [getToken, isAdmin]);

  useEffect(() => {
    void loadPortfolio();
  }, [loadPortfolio]);

  // Sync dynamic document title, favicon, theme, and accent color
  useEffect(() => {
    if (!portfolio) return;
    const { settings } = portfolio;
    document.title = settings.siteTitle || 'Personal Developer Portfolio';
    document.documentElement.dataset.accent = settings.accentColor || 'blue';

    if (settings.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [portfolio]);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, [theme]);

  // Subtle admin shortcut Ctrl+Shift+A or #admin URL hash
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (isAdmin) {
          setViewMode((m) => (m === 'dashboard' ? 'public' : 'dashboard'));
        } else {
          setLoginModalOpen(true);
        }
      }
    };
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        if (isAdmin) {
          setViewMode('dashboard');
        } else {
          setLoginModalOpen(true);
        }
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    handleHash();
    window.addEventListener('keydown', handleKey);
    window.addEventListener('hashchange', handleHash);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('hashchange', handleHash);
    };
  }, [isAdmin]);

  // If user signs out while in dashboard/edit mode, return cleanly to public view
  useEffect(() => {
    if (!isAdmin) {
      setEditMode(false);
      setViewMode('public');
    }
  }, [isAdmin]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleMoveSection = async (sectionKey: string, direction: 'up' | 'down') => {
    if (!portfolio || !isAdmin) return;
    const order = [...portfolio.settings.sectionOrder];
    const idx = order.indexOf(sectionKey);
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    if (idx <= 0 || swap <= 0 || swap >= order.length) return;
    [order[idx], order[swap]] = [order[swap], order[idx]];
    try {
      const token = await getToken();
      await apiRequest('/api/admin/settings', {
        method: 'PUT',
        token,
        body: { sectionOrder: order },
      });
      await loadPortfolio();
      notify('success', 'Section order saved.');
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleToggleSectionVisibility = async (sectionKey: string) => {
    if (!portfolio || !isAdmin || sectionKey === 'home') return;
    const current = portfolio.settings.sectionVisibility?.[sectionKey] !== false;
    try {
      const token = await getToken();
      await apiRequest('/api/admin/settings', {
        method: 'PUT',
        token,
        body: {
          sectionVisibility: {
            ...portfolio.settings.sectionVisibility,
            [sectionKey]: !current,
          },
        },
      });
      await loadPortfolio();
      notify(
        'success',
        !current ? `Section "${sectionKey}" is now visible.` : `Section "${sectionKey}" hidden.`
      );
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleQuickToggleFeatured = async (project: ProjectData) => {
    try {
      const token = await getToken();
      await apiRequest(`/api/admin/projects/${project.id}`, {
        method: 'PUT',
        token,
        body: { isFeatured: !project.isFeatured },
      });
      await loadPortfolio();
      notify(
        'success',
        !project.isFeatured ? `"${project.title}" marked as featured.` : 'Removed from featured.'
      );
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleConfirmQuickDeleteProject = async () => {
    if (!quickDeleteProject) return;
    try {
      const token = await getToken();
      await apiRequest(`/api/admin/projects/${quickDeleteProject.id}`, {
        method: 'DELETE',
        token,
      });
      notify('success', `Deleted "${quickDeleteProject.title}".`);
      setQuickDeleteProject(null);
      await loadPortfolio();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border border-[#1e1e1e]/20 border-t-[#111111] animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#838282]">
            Loading portfolio...
          </p>
        </div>
      </div>
    );
  }

  if (loadError || !portfolio) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-[2px] bg-white border border-[#1e1e1e]/15 text-center space-y-4">
          <h1 className="text-xl swiss-heading uppercase text-[#111111]">
            Unable to Load Portfolio
          </h1>
          <p className="text-sm font-normal text-[#838282]">
            {loadError || 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadPortfolio();
            }}
            className="swiss-pill-btn-solid px-6 py-2.5 text-xs"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'dashboard' && isAdmin && authInfo) {
    return (
      <>
        <AdminDashboard
          portfolio={portfolio}
          messages={messages}
          authInfo={authInfo}
          activeTab={activeAdminTab}
          onSelectTab={setActiveAdminTab}
          onPreviewPublic={() => {
            setEditMode(false);
            setViewMode('public');
          }}
          onEnterEditMode={() => {
            setEditMode(true);
            setViewMode('public');
          }}
          onLogout={() => void logout()}
          getToken={getToken}
          onRefresh={loadPortfolio}
          notify={notify}
        />
        <ToastStack
          toasts={toasts}
          onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        />
      </>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f2f2f2] text-[#111111]">
      {/* Compact Admin Floating Control Bar (visible ONLY to authenticated Admin) */}
      {isAdmin && (
        <div className="bg-[#1e1e1e] text-[#f2f2f2] border-b border-white/10 px-4 py-2 text-xs">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Admin Mode</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">
                {editMode ? 'Live Edit Website Mode active' : 'Viewing public site'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditMode((e) => !e)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                  editMode
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {editMode ? <Eye className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                {editMode ? 'Exit Edit Mode' : 'Edit Website'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveAdminTab('overview');
                  setViewMode('dashboard');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium whitespace-nowrap"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Admin Dashboard
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <MouseSpotlightLayer />
      <TrailingCursorRing />

      <Navbar
        settings={portfolio.settings}
        resume={portfolio.resume}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <PortfolioSections
        portfolio={portfolio}
        isAdmin={isAdmin}
        editMode={editMode && isAdmin}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenAdminLogin={() => setLoginModalOpen(true)}
        onOpenAdminTab={(tab) => {
          setActiveAdminTab(tab);
          setViewMode('dashboard');
        }}
        onMoveSection={(key, dir) => void handleMoveSection(key, dir)}
        onToggleSectionVisibility={(key) => void handleToggleSectionVisibility(key)}
        onQuickDeleteProject={(project) => setQuickDeleteProject(project)}
        onQuickToggleFeatured={(project) => void handleQuickToggleFeatured(project)}
      />

      <ChatAssistant ownerName={portfolio.profile.fullName} />

      <AdminLoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onAdminAuthenticated={() => {
          setLoginModalOpen(false);
          setActiveAdminTab('overview');
          setViewMode('dashboard');
          notify('success', 'Signed in to Portfolio Admin Dashboard.');
        }}
      />

      <ConfirmDialog
        open={Boolean(quickDeleteProject)}
        title="Delete Project"
        description={`Are you sure you want to delete "${quickDeleteProject?.title}"? This removes it immediately from your public portfolio.`}
        onCancel={() => setQuickDeleteProject(null)}
        onConfirm={() => void handleConfirmQuickDeleteProject()}
      />

      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PortfolioApp />
    </AuthProvider>
  );
}
