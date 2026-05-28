import { useState, useEffect } from 'react';
import Auth from './views/Auth/Auth';
import Dashboard from './views/Dashboard/Dashboard';
import Perfil from './views/Perfil/Perfil';
import Retos from './views/Retos/Retos';
import Vehiculos from './views/Vehiculos/Vehiculos';
import Notificaciones from './views/Notificaciones/Notificaciones';
import Chat from './views/Chat/Chat';
import { getMe } from './services/auth.service';
import type { User } from './services/auth.service';

type ActiveView = 'auth' | 'dashboard' | 'perfil' | 'retos' | 'vehiculos' | 'notificaciones' | 'chat';

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-9ZyreVDB-dB884WbELyLQZvabGRBGI3bG4fD758MrfOvj6_q8Yl_WfFHMxNUkuYI920kA_3ipQbK4D3En3E67hHLcl4dbxz5Q9qVl6e8PzSA5Btj-PsAH7QLPcqNcty3jEWi0RpythiiVeCPQ4KjaSgEyw0aMdDB54NQsB60x4ooYNJXN2KCe51lzQT_tJDuIwsJIJgc79VjB372RjmI1GjwDmU-Gq_YdxiLBZebRinJjCgEFI4MxbWmWe1LSLz9ZmuE7HQYqlRs';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(window.innerWidth >= 768);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setActiveView('auth');
      setLoading(false);
      return;
    }

    getMe()
      .then((res) => {
        if (res.success) {
          setCurrentUser(res.data);
          setActiveView('dashboard');
          setSidebarOpen(window.innerWidth >= 768);
        } else {
          handleLogout();
        }
      })
      .catch(() => {
        handleLogout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLoginSuccess = (token: string, user: User) => {
    localStorage.setItem('token', token);
    setCurrentUser(user);
    setActiveView('dashboard');
    setSidebarOpen(window.innerWidth >= 768);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setActiveView('auth');
  };

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleSwitchViewWithRoom = (view: ActiveView, roomId: string | null) => {
    setActiveChatRoomId(roomId);
    setActiveView(view);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center scanlines relative">
        <div 
          className="text-primary-container font-mono text-[14px] tracking-[0.2em] font-bold animate-pulse"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          INITIALIZING SYSTEM...
        </div>
      </div>
    );
  }

  if (activeView === 'auth') {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onSwitchView={handleNavClick} onSwitchViewWithRoom={handleSwitchViewWithRoom} />;
      case 'perfil':
        return <Perfil />;
      case 'retos':
        return <Retos />;
      case 'vehiculos':
        return <Vehiculos />;
      case 'notificaciones':
        return <Notificaciones />;
      case 'chat':
        return currentUser ? (
          <Chat 
            currentUser={currentUser} 
            activeRoomId={activeChatRoomId} 
            setActiveRoomId={setActiveChatRoomId} 
          />
        ) : null;
      default:
        return <Dashboard onSwitchView={handleNavClick} onSwitchViewWithRoom={handleSwitchViewWithRoom} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'New Challenges', icon: 'sports_score' },
    { id: 'chat', label: 'Live Chat', icon: 'chat' },
    { id: 'notificaciones', label: 'Live Alerts', icon: 'bolt' },
    { id: 'vehiculos', label: 'Garage', icon: 'directions_car' },
    { id: 'retos', label: 'Leaderboard', icon: 'leaderboard' },
    { id: 'perfil', label: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="min-h-screen carbon-fiber-hud flex flex-col font-body antialiased selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center px-4 md:px-12 h-16">
        <div className="flex items-center gap-4">
          <span 
            className="material-symbols-outlined text-primary cursor-pointer hover:scale-95 duration-100 select-none" 
            style={{ fontVariationSettings: "'FILL' 1" }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            menu
          </span>
          <h1 
            className="text-[20px] md:text-[24px] italic font-black tracking-tighter text-primary-container m-0 cursor-pointer"
            style={{ fontFamily: '"Anybody", sans-serif' }}
            onClick={() => handleNavClick('dashboard')}
          >
            STREET RACE X
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <span 
            className={`material-symbols-outlined hover:text-secondary-container transition-colors cursor-pointer hover:scale-95 duration-100 ${
              activeView === 'notificaciones' ? 'text-secondary-container' : 'text-on-surface-variant'
            }`} 
            style={{ fontVariationSettings: "'FILL' 1" }}
            onClick={() => handleNavClick('notificaciones')}
          >
            notifications
          </span>
          <span 
            className={`material-symbols-outlined hover:text-secondary-container transition-colors cursor-pointer hover:scale-95 duration-100 ${
              activeView === 'perfil' ? 'text-secondary-container' : 'text-on-surface-variant'
            }`} 
            style={{ fontVariationSettings: "'FILL' 1" }}
            onClick={() => handleNavClick('perfil')}
          >
            account_circle
          </span>
          <span 
            className="material-symbols-outlined text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer hover:scale-95 duration-100" 
            style={{ fontVariationSettings: "'FILL' 1" }}
            onClick={handleLogout}
            title="Log Out"
          >
            logout
          </span>
        </div>
      </nav>

      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`flex flex-col py-8 gap-4 bg-surface-container-lowest border-r border-outline-variant fixed left-0 h-[calc(100vh-64px)] w-80 top-16 z-40 overflow-y-auto transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="px-6 mb-4 flex flex-col gap-2">
          <h2 
            className="text-[18px] italic text-primary uppercase m-0"
            style={{ fontFamily: '"Anybody", sans-serif', fontWeight: 800 }}
          >
            PILOT PROFILE
          </h2>
          <p 
            className="text-[10px] text-on-surface-variant uppercase tracking-[0.1em] font-bold font-mono"
          >
            {currentUser?.rango || 'D'}-RANK STATUS: ACTIVE
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-primary-container glow-primary overflow-hidden bg-[#20201f]">
              <img 
                alt="Pilot Avatar" 
                className="w-full h-full object-cover" 
                src={currentUser?.foto_perfil || DEFAULT_AVATAR} 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                }}
              />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[14px] font-bold text-on-surface truncate uppercase font-mono tracking-wider">
                {currentUser?.username}
              </span>
              <button 
                onClick={() => handleNavClick('dashboard')}
                className="mt-1 bg-primary-container text-on-primary-container text-[10px] px-3 py-1.5 skew-x-[-12deg] glow-primary hover:bg-primary transition-colors cursor-pointer w-fit font-mono font-bold"
              >
                <span className="skew-x-[12deg] block">GO RACE</span>
              </button>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 mt-2">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <div 
                key={item.id}
                onClick={() => handleNavClick(item.id as ActiveView)}
                className={`flex items-center gap-4 py-3 pl-6 cursor-pointer transition-all ${
                  isActive 
                    ? 'text-secondary-container border-l-4 border-secondary-container bg-secondary-container/10 translate-x-1' 
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface group'
                }`}
              >
                <span 
                  className={`material-symbols-outlined transition-colors ${
                    isActive ? '' : 'group-hover:text-secondary-container'
                  }`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
                >
                  {item.icon}
                </span>
                <span 
                  className="text-[11px] uppercase tracking-[0.1em] font-mono font-bold"
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>
      </aside>

      <main className={`mt-16 p-4 md:p-12 max-w-[1280px] w-full mx-auto flex-grow pb-28 md:pb-12 transition-all duration-300 ${
        sidebarOpen ? 'md:ml-80' : 'md:ml-0'
      }`}>
        {renderView()}
      </main>

      <nav className="md:hidden flex justify-around items-center h-20 pb-safe px-4 fixed bottom-0 w-full z-50 bg-[#20201f]/95 backdrop-blur-md border-t border-outline-variant/30 shadow-[0_-4px_10px_rgba(255,87,25,0.15)]">
        {[
          { id: 'dashboard', label: 'Feed', icon: 'speed' },
          { id: 'chat', label: 'Chat', icon: 'chat' },
          { id: 'retos', label: 'Race', icon: 'flag' },
          { id: 'vehiculos', label: 'Garage', icon: 'minor_crash' },
          { id: 'perfil', label: 'Profile', icon: 'person' },
        ].map((item) => {
          const isActive = activeView === item.id;
          if (isActive) {
            return (
              <div 
                key={item.id}
                onClick={() => handleNavClick(item.id as ActiveView)}
                className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1.5 skew-x-[-12deg] shadow-[0_0_12px_#ff5719] scale-90 transition-transform cursor-pointer"
              >
                <span className="material-symbols-outlined skew-x-[12deg]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {item.icon}
                </span>
                <span className="text-[9px] skew-x-[12deg] uppercase mt-0.5 font-mono font-bold">
                  {item.label}
                </span>
              </div>
            );
          } else {
            return (
              <div 
                key={item.id}
                onClick={() => handleNavClick(item.id as ActiveView)}
                className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1.5 hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">
                  {item.icon}
                </span>
                <span className="text-[9px] uppercase mt-0.5 font-mono font-bold">
                  {item.label}
                </span>
              </div>
            );
          }
        })}
      </nav>
    </div>
  );
}
