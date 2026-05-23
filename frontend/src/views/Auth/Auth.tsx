import { useState } from 'react';
import type { FormEvent } from 'react';
import { login, register } from '../../services/auth.service';
import type { User } from '../../services/auth.service';

interface AuthProps {
  onLoginSuccess: (token: string, user: User) => void;
}

const BG_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS78eGry0fnLD4y6dnzvTmWNH2EYm8-c7Sg3SewiJuQyNqL7DTFs9LqDK5Y92nnbVgFSHz--c7Z-OYYCL4OcdI1HB47ZvY-YM4qPtOM8wrMin5H1YLvhFgaxbHoPTzVXYdgwCMvvp5nSgp65BfZPYillYVoWTsQ0HicLd1o5hCFlA7DdFfI-XZg9B57J50QldyGHtEai-ZkJOPZS8n89K1QxdQgzUwcbiMqM0OV3ak1NGHuGjkkLMftH7GDiELxxHPj8HSDKLzXar5';

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.success) {
        onLoginSuccess(res.data.token, res.data.user);
      } else {
        setError(res.message || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await register({
        username,
        email,
        password,
        zona_ciudad: 'Global',
        zona_estado: 'Red',
        zona_pais: 'SRX',
      });
      if (res.success) {
        onLoginSuccess(res.data.token, res.data.user);
      } else {
        setError(res.message || 'Error en el registro');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row antialiased overflow-hidden"
      style={{ backgroundColor: '#131313', color: '#e5e2e1', fontFamily: '"Hanken Grotesk", sans-serif' }}
    >
      {/* Panel Izquierdo - Branding */}
      <div className="hidden lg:flex w-1/2 relative scanlines" style={{ backgroundColor: '#0e0e0e', borderRight: '1px solid rgba(92,64,55,0.3)' }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${BG_IMAGE}')`,
            opacity: 0.6,
            mixBlendMode: 'luminosity',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, #131313, rgba(19,19,19,0.8), transparent)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #131313, transparent, rgba(19,19,19,0.5))' }}
        />
        <div className="relative z-20 flex flex-col justify-center w-full max-w-[600px] ml-auto" style={{ padding: '48px' }}>
          <h1
            style={{
              fontFamily: '"Anybody", sans-serif',
              fontSize: '64px',
              lineHeight: '1.1',
              letterSpacing: '-0.04em',
              fontWeight: 900,
              fontStyle: 'italic',
              color: '#ff5719',
              marginBottom: '16px',
              filter: 'drop-shadow(0 0 15px rgba(255,87,25,0.4))',
            }}
          >
            STREET RACE X
          </h1>
          <p
            style={{
              fontFamily: '"Anybody", sans-serif',
              fontSize: '32px',
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
              fontWeight: 800,
              fontStyle: 'italic',
              color: 'rgba(229,226,225,0.9)',
              textTransform: 'uppercase',
            }}
          >
            Dominate the Asphalt.<br />Claim your Rank.
          </p>
          <div className="flex gap-2" style={{ marginTop: '48px' }}>
            <div style={{ height: '4px', width: '48px', backgroundColor: '#ff5719', transform: 'skewX(-20deg)', boxShadow: '0 0 8px #ff5719' }} />
            <div style={{ height: '4px', width: '32px', backgroundColor: '#00e3fd', transform: 'skewX(-20deg)' }} />
            <div style={{ height: '4px', width: '96px', backgroundColor: '#353535', transform: 'skewX(-20deg)' }} />
          </div>
        </div>
      </div>

      {/* Panel Derecho - Consola de Acceso */}
      <div
        className="w-full lg:w-1/2 min-h-screen flex items-center justify-center relative"
        style={{ backgroundColor: '#131313', padding: '16px' }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120%', height: '120%',
            background: 'radial-gradient(ellipse at center, rgba(255,87,25,0.05), #131313, #131313)',
          }}
        />

        <div
          className="relative w-full max-w-md overflow-hidden"
          style={{
            backgroundColor: 'rgba(42,42,42,0.4)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(92,64,55,0.5)',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          }}
        >
          {/* Corner Notch */}
          <div
            className="absolute"
            style={{
              top: '-16px', right: '-16px',
              width: '32px', height: '32px',
              backgroundColor: '#131313',
              transform: 'rotate(45deg)',
              borderBottom: '1px solid rgba(92,64,55,0.5)',
              borderLeft: '1px solid rgba(92,64,55,0.5)',
            }}
          />

          {/* Logo Móvil */}
          <div className="lg:hidden text-center" style={{ marginBottom: '32px' }}>
            <h1
              style={{
                fontFamily: '"Anybody", sans-serif',
                fontSize: '24px',
                lineHeight: '1.2',
                fontWeight: 800,
                fontStyle: 'italic',
                color: '#ff5719',
                filter: 'drop-shadow(0 0 10px rgba(255,87,25,0.4))',
              }}
            >
              STREET RACE X
            </h1>
          </div>

          {/* Tabs LOGIN / REGISTER */}
          <div className="flex gap-1" style={{ marginBottom: '32px', backgroundColor: '#0e0e0e', padding: '4px', transform: 'skewX(-12deg)' }}>
            <button
              type="button"
              onClick={() => { setTab('login'); setError(null); }}
              style={{
                flex: 1,
                padding: '12px 0',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '12px',
                lineHeight: '1',
                letterSpacing: '0.1em',
                fontWeight: 700,
                transition: 'all 0.2s',
                cursor: 'pointer',
                backgroundColor: tab === 'login' ? 'rgba(255,87,25,0.2)' : 'transparent',
                color: tab === 'login' ? '#ff5719' : '#e6beb2',
                border: tab === 'login' ? '1px solid #ff5719' : '1px solid transparent',
                boxShadow: tab === 'login' ? '0 0 10px rgba(255,87,25,0.2)' : 'none',
              }}
            >
              <span style={{ display: 'block', transform: 'skewX(12deg)' }}>LOGIN</span>
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(null); }}
              style={{
                flex: 1,
                padding: '12px 0',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '12px',
                lineHeight: '1',
                letterSpacing: '0.1em',
                fontWeight: 700,
                transition: 'all 0.2s',
                cursor: 'pointer',
                backgroundColor: tab === 'register' ? 'rgba(255,87,25,0.2)' : 'transparent',
                color: tab === 'register' ? '#ff5719' : '#e6beb2',
                border: tab === 'register' ? '1px solid #ff5719' : '1px solid transparent',
                boxShadow: tab === 'register' ? '0 0 10px rgba(255,87,25,0.2)' : 'none',
              }}
            >
              <span style={{ display: 'block', transform: 'skewX(12deg)' }}>REGISTER</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: 'rgba(147,0,10,0.2)',
                border: '1px solid rgba(255,180,171,0.5)',
                color: '#ffb4ab',
                fontSize: '14px',
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              <span style={{ fontWeight: 700 }}>SYSTEM ALERT:</span> {error.toUpperCase()}
            </div>
          )}

          {/* LOGIN Form */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="input-group" style={{ position: 'relative' }}>
                <input
                  type="email"
                  id="login-identifier"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  required
                  style={{
                    display: 'block',
                    width: '100%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid #5c4037',
                    color: '#e5e2e1',
                    padding: '8px 0',
                    fontSize: '16px',
                    fontFamily: '"JetBrains Mono", monospace',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderBottomColor = '#00e3fd'; }}
                  onBlur={(e) => { e.target.style.borderBottomColor = '#5c4037'; }}
                />
                <label
                  htmlFor="login-identifier"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '8px',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '12px',
                    letterSpacing: '0.1em',
                    fontWeight: 700,
                    color: '#e6beb2',
                    transition: 'all 0.2s',
                    pointerEvents: 'none',
                  }}
                >
                  PILOT ID / EMAIL
                </label>
              </div>

              <div className="input-group" style={{ position: 'relative' }}>
                <input
                  type="password"
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  required
                  style={{
                    display: 'block',
                    width: '100%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid #5c4037',
                    color: '#e5e2e1',
                    padding: '8px 0',
                    fontSize: '16px',
                    fontFamily: '"JetBrains Mono", monospace',
                    letterSpacing: '0.25em',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderBottomColor = '#00e3fd'; }}
                  onBlur={(e) => { e.target.style.borderBottomColor = '#5c4037'; }}
                />
                <label
                  htmlFor="login-password"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '8px',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '12px',
                    letterSpacing: '0.1em',
                    fontWeight: 700,
                    color: '#e6beb2',
                    transition: 'all 0.2s',
                    pointerEvents: 'none',
                  }}
                >
                  SECURITY KEY
                </label>
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: '8px' }}>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    style={{
                      backgroundColor: '#20201f',
                      border: '1px solid #5c4037',
                      width: '16px',
                      height: '16px',
                      accentColor: '#ff5719',
                    }}
                  />
                  <span style={{ fontFamily: '"Hanken Grotesk", sans-serif', fontSize: '14px', color: '#e6beb2' }}>
                    Remember Rig
                  </span>
                </label>
                <a
                  href="#"
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '12px',
                    letterSpacing: '0.1em',
                    fontWeight: 700,
                    color: '#00e3fd',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.textDecoration = 'underline'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.textDecoration = 'none'; }}
                >
                  RECOVER KEY
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group"
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '16px 0',
                  backgroundColor: '#ff5719',
                  color: '#521300',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                  transform: 'skewX(-12deg)',
                  transition: 'all 0.2s',
                  cursor: loading ? 'wait' : 'pointer',
                  border: '1px solid transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget).style.boxShadow = '0 0 15px #ff5719'; }}
                onMouseLeave={(e) => { (e.currentTarget).style.boxShadow = 'none'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transform: 'skewX(12deg)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>electric_bolt</span>
                  {loading ? 'INITIALIZING...' : 'IGNITION SEQUENCE'}
                </span>
              </button>
            </form>
          )}

          {/* REGISTER Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="input-group" style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="reg-pilot"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder=" "
                  required
                  style={{
                    display: 'block', width: '100%', backgroundColor: 'transparent',
                    border: 'none', borderBottom: '2px solid #5c4037', color: '#e5e2e1',
                    padding: '8px 0', fontSize: '16px', fontFamily: '"JetBrains Mono", monospace',
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderBottomColor = '#00e3fd'; }}
                  onBlur={(e) => { e.target.style.borderBottomColor = '#5c4037'; }}
                />
                <label htmlFor="reg-pilot" style={{
                  position: 'absolute', left: 0, top: '8px',
                  fontFamily: '"JetBrains Mono", monospace', fontSize: '12px',
                  letterSpacing: '0.1em', fontWeight: 700, color: '#e6beb2',
                  transition: 'all 0.2s', pointerEvents: 'none',
                }}>NEW PILOT ALIAS</label>
              </div>

              <div className="input-group" style={{ position: 'relative' }}>
                <input
                  type="email"
                  id="reg-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  required
                  style={{
                    display: 'block', width: '100%', backgroundColor: 'transparent',
                    border: 'none', borderBottom: '2px solid #5c4037', color: '#e5e2e1',
                    padding: '8px 0', fontSize: '16px', fontFamily: '"JetBrains Mono", monospace',
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderBottomColor = '#00e3fd'; }}
                  onBlur={(e) => { e.target.style.borderBottomColor = '#5c4037'; }}
                />
                <label htmlFor="reg-email" style={{
                  position: 'absolute', left: 0, top: '8px',
                  fontFamily: '"JetBrains Mono", monospace', fontSize: '12px',
                  letterSpacing: '0.1em', fontWeight: 700, color: '#e6beb2',
                  transition: 'all 0.2s', pointerEvents: 'none',
                }}>COMMS EMAIL</label>
              </div>

              <div className="input-group" style={{ position: 'relative' }}>
                <input
                  type="password"
                  id="reg-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  required
                  style={{
                    display: 'block', width: '100%', backgroundColor: 'transparent',
                    border: 'none', borderBottom: '2px solid #5c4037', color: '#e5e2e1',
                    padding: '8px 0', fontSize: '16px', fontFamily: '"JetBrains Mono", monospace',
                    letterSpacing: '0.25em', outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderBottomColor = '#00e3fd'; }}
                  onBlur={(e) => { e.target.style.borderBottomColor = '#5c4037'; }}
                />
                <label htmlFor="reg-password" style={{
                  position: 'absolute', left: 0, top: '8px',
                  fontFamily: '"JetBrains Mono", monospace', fontSize: '12px',
                  letterSpacing: '0.1em', fontWeight: 700, color: '#e6beb2',
                  transition: 'all 0.2s', pointerEvents: 'none',
                }}>NEW SECURITY KEY</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', marginTop: '16px', padding: '16px 0',
                  backgroundColor: 'transparent', color: '#00e3fd',
                  border: '2px solid #00e3fd',
                  fontFamily: '"JetBrains Mono", monospace', fontSize: '12px',
                  letterSpacing: '0.1em', fontWeight: 700,
                  transform: 'skewX(-12deg)', transition: 'all 0.2s',
                  cursor: loading ? 'wait' : 'pointer', position: 'relative',
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'rgba(0,227,253,0.1)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(0,227,253,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ position: 'absolute', left: '-2px', top: '-2px', bottom: '-2px', width: '8px', backgroundColor: '#00e3fd' }} />
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transform: 'skewX(12deg)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                  {loading ? 'CONNECTING...' : 'ESTABLISH CONNECTION'}
                </span>
              </button>
            </form>
          )}


        </div>
      </div>
    </div>
  );
}
