import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Car, 
  User as UserIcon, 
  Bell, 
  Compass,
  LogOut
} from 'lucide-react';
import Auth from './views/Auth/Auth';
import Dashboard from './views/Dashboard/Dashboard';
import Perfil from './views/Perfil/Perfil';
import Retos from './views/Retos/Retos';
import Vehiculos from './views/Vehiculos/Vehiculos';
import Notificaciones from './views/Notificaciones/Notificaciones';
import { getMe } from './services/auth.service';
import type { User } from './services/auth.service';

type ActiveView = 'auth' | 'dashboard' | 'perfil' | 'retos' | 'vehiculos' | 'notificaciones';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setActiveView('auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-primary-container font-label-caps animate-pulse">
          INICIALIZANDO SISTEMA...
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
        return <Dashboard />;
      case 'perfil':
        return <Perfil />;
      case 'retos':
        return <Retos />;
      case 'vehiculos':
        return <Vehiculos />;
      case 'notificaciones':
        return <Notificaciones />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-rose-600 p-2 rounded-lg text-white font-bold italic tracking-wider flex items-center justify-center">
              SRX
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-rose-500 bg-clip-text text-transparent">
              STREET RACE X
            </span>
            {currentUser && (
              <span className="hidden sm:inline-block text-[10px] text-rose-500 font-mono border border-rose-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
                PILOTO: {currentUser.username}
              </span>
            )}
          </div>

          <nav className="flex space-x-1 sm:space-x-2">
            {[
              { id: 'dashboard', label: 'Descubrimiento', icon: Compass },
              { id: 'retos', label: 'Retos', icon: Trophy },
              { id: 'vehiculos', label: 'Garaje', icon: Car },
              { id: 'notificaciones', label: 'Alertas', icon: Bell },
              { id: 'perfil', label: 'Perfil', icon: UserIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as ActiveView)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm min-h-[500px]">
          {renderView()}
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Street Race X. Todos los derechos reservados. Conectado a API Remota.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
