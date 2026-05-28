import { useState, useEffect } from 'react';
import { getMe } from '../../services/auth.service';
import { 
  listChallenges, 
  updateChallenge 
} from '../../services/challenge.service';
import { getTopRanking } from '../../services/user.service';
import type { User } from '../../services/auth.service';
import type { Challenge } from '../../services/challenge.service';
import type { RankingUser } from '../../services/user.service';
import ChallengeHUD from '../../components/ChallengeHUD';

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYR4VH9Q7lnQMe14FpOwtCRSPQZNWWixixsuyVD5R66ZIHDuSjmDgx3pMoef-nzMhyieLT58_EfzglLFsgH0ePPf0-eKdrMaRlRXkfkI29HCDWjoJu9cZmotB-Gtr3zNjeCKXDyZMUTRz45p1FcdlElppE_WjgaDFVdZ7Qrb1Ofe_LBafAtMvcTY80yPrfrqBVHEbUjA1HjhbuOyEqK8wfjqAEnQFQt1LTTIVPxKhrwTaHycMGtpAr-GxioENhzM1IzYH4ALpPJz-G';

const DEFAULT_CAR_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDVa3D7hcBr4h8_Vif9BsrF9Pomvtox94slOnT4ZZodYuaVKf-htmK4ccRxcml9qY1J8SIv4CE6ql63bRVtmqfsvqbMXa6Wf44k1J74IzE9UMOVrsrwXsf7jTtZqGKHoITds_70PWIVgYPwJvEe_ls5CD8tCwSBvuqYZN5jSM_2AE3i9kxjMESw4tDCjmkouc-4le-nMGcCJ8OCYSbLHgLJCeWO0oQKtBWDaqnxlvyyu_slvWEr3GYzuRvnnkHZlLj5re-Nf1ixuE6_',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDb-LXA6GWHqcFYgsqQC44hywb8qA7T8X-aLiFaDEaj4ucrgvZcGaGUsqYo7-OpfqnNs8pUlOfE7ZEU3XF-5gHLFCRBD2JUnyNQxti6tDQzzTz-RF0XPasiX-0FwEHqKZU-H55sGcSqOJ0zUJZSbY6d93KrXH1TrQD12oRHRG6n3tvMeeqavZx_ZDqN0iDkMDthjE0eL0QEC8pm8N9Cwc56GCBagkqwC-0obTi9wjXSn9_QLBieSIB70p3EAUlsFQ13E6IMcn5IV4_j'
];

type TabType = 'pendientes' | 'activos' | 'completados' | 'leaderboard';

export default function Retos() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('pendientes');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionAlert, setActionAlert] = useState<{ success: boolean; message: string } | null>(null);

  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [score, setScore] = useState('');
  const [outcome, setOutcome] = useState<'win' | 'loss'>('win');
  const [submittingResult, setSubmittingResult] = useState(false);
  const [hudChallenge, setHudChallenge] = useState<Challenge | null>(null);

  const fetchUserData = async () => {
    try {
      const res = await getMe();
      if (res.success) {
        setCurrentUser(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadChallenges = async (tab: TabType) => {
    setLoading(true);
    setActionAlert(null);
    try {
      if (tab === 'leaderboard') {
        const res = await getTopRanking(15);
        if (res.success) {
          setLeaderboard(res.data);
        }
      } else {
        let estadoFilter = '';
        if (tab === 'pendientes') estadoFilter = 'pendiente';
        else if (tab === 'activos') estadoFilter = 'aceptado';
        else if (tab === 'completados') estadoFilter = 'completado';

        const res = await listChallenges({ estado: estadoFilter });
        if (res.success) {
          setChallenges(res.data.challenges);
        }
      }
    } catch (err: any) {
      setActionAlert({ 
        success: false, 
        message: err.response?.data?.error || 'No se pudieron cargar los datos' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    loadChallenges(activeTab);
    setSelectedChallengeId('');
    setScore('');
  }, [activeTab]);

  const handleUpdateStatus = async (challengeId: string, nextStatus: 'aceptado' | 'rechazado' | 'cancelado') => {
    setActionAlert(null);
    try {
      const res = await updateChallenge(challengeId, { estado: nextStatus });
      if (res.success) {
        setActionAlert({ 
          success: true, 
          message: `RETO ${nextStatus === 'aceptado' ? 'ACEPTADO' : nextStatus === 'rechazado' ? 'RECHAZADO' : 'CANCELADO'} CON ÉXITO` 
        });
        loadChallenges(activeTab);
        fetchUserData();
      }
    } catch (err: any) {
      setActionAlert({ 
        success: false, 
        message: err.response?.data?.error || 'No se pudo actualizar el reto' 
      });
    }
  };

  const handleRegisterResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId) {
      alert('Selecciona un reto activo del listado para registrar su resultado.');
      return;
    }

    const selectedChallenge = challenges.find(c => c.id === selectedChallengeId);
    if (!selectedChallenge || !currentUser) return;

    setSubmittingResult(true);
    setActionAlert(null);

    const opponentId = selectedChallenge.retador_id === currentUser.id 
      ? selectedChallenge.retado_id 
      : selectedChallenge.retador_id;
    const winnerId = outcome === 'win' ? currentUser.id : opponentId;

    try {
      const res = await updateChallenge(selectedChallengeId, {
        estado: 'completado',
        ganador_id: winnerId
      });

      if (res.success) {
        setActionAlert({ 
          success: true, 
          message: `SISTEMA: CARRERA REGISTRADA. ${outcome === 'win' ? '¡VICTORIA CONFIRMADA!' : 'DERROTA REGISTRADA.'}` 
        });
        setSelectedChallengeId('');
        setScore('');
        loadChallenges(activeTab);
        fetchUserData();
      }
    } catch (err: any) {
      setActionAlert({ 
        success: false, 
        message: err.response?.data?.error || 'Error al registrar el resultado de la carrera' 
      });
    } finally {
      setSubmittingResult(false);
    }
  };

  const getRaceTypeLabel = (type: string | null) => {
    switch (type) {
      case 'cuarto_milla': return '1/4 MILLA';
      case 'vueltas': return 'VUELTAS';
      case 'derrape': return 'DERRAPE';
      default: return type?.toUpperCase() || 'CARRERA';
    }
  };

  const getRaceTypeIcon = (type: string | null) => {
    switch (type) {
      case 'cuarto_milla': return 'straight';
      case 'vueltas': return 'sync';
      case 'derrape': return 'route';
      default: return 'flag';
    }
  };

  const activeSelectedChallenge = challenges.find(c => c.id === selectedChallengeId);
  const selectedOpponentName = activeSelectedChallenge 
    ? (activeSelectedChallenge.retador_id === currentUser?.id 
        ? activeSelectedChallenge.retado?.username 
        : activeSelectedChallenge.retador?.username)
    : '';

  return (
    <div className="flex flex-col gap-6">
      {actionAlert && (
        <div 
          className={`p-3 font-mono text-[13px] border animate-pulse ${
            actionAlert.success 
              ? 'border-tertiary bg-tertiary/10 text-tertiary-fixed' 
              : 'border-error bg-error/10 text-error'
          }`}
        >
          <span className="font-bold">SYSTEM NOTICE:</span> {actionAlert.message.toUpperCase()}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <h2 
            className="text-[28px] md:text-[36px] italic text-primary-container uppercase m-0 leading-tight font-black"
            style={{ fontFamily: '"Anybody", sans-serif' }}
          >
            RETOS
          </h2>
          <p className="font-mono text-[11px] text-on-surface-variant mt-2 max-w-lg uppercase tracking-wider">
            Gestiona tus desafíos callejeros. Acepta rivales, registra tus tiempos y sube en el ranking de la ciudad.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container border border-outline-variant px-4 py-2.5 header-notch shrink-0">
          <span className="material-symbols-outlined text-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_fire_department
          </span>
          <div>
            <p className="font-mono text-[9px] font-bold text-on-surface-variant uppercase">RACHA ACTUAL</p>
            <p 
              className="text-[18px] font-black italic text-primary-container uppercase tracking-wide"
              style={{ fontFamily: '"Anybody", sans-serif' }}
            >
              {currentUser?.retos_consecutivos || 0} {currentUser?.retos_consecutivos === 1 ? 'VICTORIA' : 'VICTORIAS'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-outline-variant/20 scrollbar-hide">
        {(['pendientes', 'activos', 'completados', 'leaderboard'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 font-mono text-[11px] font-bold uppercase transition-all tracking-wider cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'border-b-2 border-secondary-container text-secondary-container bg-secondary-container/10'
                : 'border-b-2 border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <span 
                className="material-symbols-outlined text-secondary-container text-[48px] animate-spin"
                style={{ fontVariationSettings: "'wght' 100" }}
              >
                progress_activity
              </span>
            </div>
          ) : activeTab === 'leaderboard' ? (
            <div className="bg-[#121212] border border-outline-variant p-6 header-notch">
              <h3 
                className="text-[18px] italic font-black text-secondary-container uppercase mb-6 flex items-center gap-2"
                style={{ fontFamily: '"Anybody", sans-serif' }}
              >
                <span className="material-symbols-outlined">leaderboard</span>
                TOP 15 PILOTOS DE LA CIUDAD
              </h3>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse font-mono text-[12px]">
                  <thead>
                    <tr className="border-b border-outline-variant text-[10px] text-on-surface-variant uppercase tracking-wider">
                      <th className="py-3 px-4">POS</th>
                      <th className="py-3 px-4">PILOTO</th>
                      <th className="py-3 px-4 text-center">RANGO</th>
                      <th className="py-3 px-4 text-center">VICTORIAS</th>
                      <th className="py-3 px-4 text-center">DERROTAS</th>
                      <th className="py-3 px-4 text-center">TASA W/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-on-surface-variant uppercase">
                          No hay pilotos registrados en el ranking
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((pilot, idx) => {
                        const isSelf = pilot.id === currentUser?.id;
                        const winLossRatio = pilot.derrotas === 0 
                          ? pilot.victorias 
                          : parseFloat((pilot.victorias / pilot.derrotas).toFixed(2));

                        let posStyle = 'text-on-surface-variant';
                        if (idx === 0) posStyle = 'text-[#ffd700] font-black';
                        else if (idx === 1) posStyle = 'text-[#c0c0c0] font-black';
                        else if (idx === 2) posStyle = 'text-[#cd7f32] font-black';

                        return (
                          <tr 
                            key={pilot.id}
                            className={`border-b border-outline-variant/30 hover:bg-surface-container/20 transition-colors ${
                              isSelf ? 'bg-secondary-container/5 border-l-2 border-l-secondary-container' : ''
                            }`}
                          >
                            <td className={`py-3 px-4 font-bold ${posStyle}`}>
                              {idx === 0 ? '🏆 01' : idx < 9 ? `0${idx + 1}` : idx + 1}
                            </td>
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img 
                                src={pilot.foto_perfil || DEFAULT_AVATAR} 
                                alt={pilot.username}
                                className="w-8 h-8 rounded-full border border-outline object-cover bg-[#20201f]"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                                }}
                              />
                              <span className={`font-bold ${isSelf ? 'text-secondary-container' : 'text-on-surface'}`}>
                                {pilot.username} {isSelf && '(TÚ)'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="border border-tertiary/40 bg-tertiary/10 text-tertiary-fixed px-2 py-0.5 text-[11px] font-bold">
                                {pilot.rango}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-primary-container">{pilot.victorias}</td>
                            <td className="py-3 px-4 text-center text-on-surface-variant">{pilot.derrotas}</td>
                            <td className="py-3 px-4 text-center text-secondary-container">{winLossRatio}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {challenges.length === 0 ? (
                <div className="border border-outline-variant bg-[#131313] p-12 text-center header-notch">
                  <span className="material-symbols-outlined text-on-surface-variant text-[48px] mb-4">
                    flag
                  </span>
                  <p className="font-mono text-[12px] text-on-surface-variant uppercase tracking-wider">
                    No tienes retos en esta sección
                  </p>
                </div>
              ) : (
                challenges.map((c, i) => {
                  const defaultImage = DEFAULT_CAR_IMAGES[i % DEFAULT_CAR_IMAGES.length];
                  const isSentByMe = c.retador_id === currentUser?.id;
                  const opponent = isSentByMe ? c.retado : c.retador;
                  
                  let leftLineColor = 'bg-primary-container';
                  if (activeTab === 'activos') {
                    leftLineColor = 'bg-secondary-container';
                  } else if (activeTab === 'completados') {
                    const iWon = c.ganador_id === currentUser?.id;
                    leftLineColor = iWon ? 'bg-tertiary' : 'bg-error';
                  }

                  return (
                    <div 
                      key={c.id}
                      className={`bg-[#121212] border border-outline-variant p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden transition-colors header-notch group ${
                        selectedChallengeId === c.id ? 'border-secondary-container ring-1 ring-secondary-container/40' : 'hover:border-outline-variant'
                      }`}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${leftLineColor}`} />
                      
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <div className="w-16 h-16 bg-surface-variant overflow-hidden border border-outline-variant bg-[#20201f]">
                            <img 
                              alt="Rival avatar" 
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" 
                              src={defaultImage}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = defaultImage;
                              }}
                            />
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-surface border border-outline-variant px-1 text-[10px] font-bold text-tertiary-fixed font-mono select-none">
                            {opponent?.rango || 'D'}
                          </div>
                        </div>

                        <div className="text-left font-mono">
                          <h4 className="text-[15px] font-bold text-on-surface uppercase tracking-wide">
                            {opponent?.username}
                            <span className="text-[9px] text-on-surface-variant lowercase font-normal ml-2 italic">
                              ({isSentByMe ? 'enviado' : 'recibido'})
                            </span>
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-on-surface-variant text-[11px]">
                            <span className="material-symbols-outlined text-[15px] text-secondary-container">
                              {getRaceTypeIcon(c.tipo_carrera)}
                            </span>
                            <span>
                              {getRaceTypeLabel(c.tipo_carrera)} &mdash; {c.ubicacion_acordada}
                            </span>
                          </div>
                          {c.notas && (
                            <p className="text-[9px] text-on-surface-variant mt-1.5 max-w-[400px] truncate italic">
                              SPEC: "{c.notas}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
                        {activeTab === 'pendientes' && (
                          <>
                            {isSentByMe ? (
                              <button 
                                onClick={() => handleUpdateStatus(c.id, 'cancelado')}
                                className="bg-transparent border border-error hover:bg-error/10 text-error font-mono text-[10px] font-bold px-4 py-2 btn-notch transition-colors cursor-pointer select-none"
                              >
                                CANCELAR RETO
                              </button>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(c.id, 'rechazado')}
                                  className="bg-transparent border border-outline-variant hover:bg-surface-variant text-on-surface-variant font-mono text-[10px] font-bold px-4 py-2 btn-notch transition-colors cursor-pointer select-none"
                                >
                                  RECHAZAR
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(c.id, 'aceptado')}
                                  className="bg-primary-container hover:bg-primary text-on-primary-container font-mono text-[10px] font-bold px-5 py-2 glow-primary btn-notch transition-all cursor-pointer select-none"
                                >
                                  ACEPTAR
                                </button>
                              </>
                            )}
                          </>
                        )}

                        {activeTab === 'activos' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setHudChallenge(c)}
                              className="font-mono text-[10px] font-bold px-4 py-2 btn-notch bg-secondary-container text-on-secondary shadow-[0_0_8px_#00e3fd] hover:bg-secondary-fixed transition-all cursor-pointer select-none"
                            >
                              INICIAR HUD
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedChallengeId(c.id);
                                setOutcome('win');
                                setScore('');
                              }}
                              className={`font-mono text-[10px] font-bold px-4 py-2 btn-notch transition-all cursor-pointer select-none ${
                                selectedChallengeId === c.id 
                                  ? 'bg-secondary-container text-on-secondary shadow-[0_0_8px_#00e3fd]' 
                                  : 'bg-transparent border border-secondary-container text-secondary-container hover:bg-secondary-container/10'
                              }`}
                            >
                              {selectedChallengeId === c.id ? 'SELECCIONADO' : 'REGISTRAR'}
                            </button>
                          </div>
                        )}

                        {activeTab === 'completados' && (
                          <div className="text-right font-mono flex flex-col items-end gap-1.5">
                            {c.ganador_id === currentUser?.id ? (
                              <span className="border border-tertiary bg-tertiary/10 text-tertiary-fixed text-[10px] font-bold px-3 py-1 btn-notch uppercase select-none">
                                VICTORIA
                              </span>
                            ) : (
                              <span className="border border-error bg-error/10 text-error text-[10px] font-bold px-3 py-1 btn-notch uppercase select-none">
                                DERROTA
                              </span>
                            )}
                            <span className="text-[8px] text-on-surface-variant uppercase">
                              COMPLETADO: {c.updated_at ? new Date(c.updated_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="xl:col-span-4 w-full">
          <div className="bg-surface-container border border-outline-variant p-6 header-notch sticky top-24">
            <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined text-secondary-container text-3xl">timer</span>
              <h3 
                className="text-[16px] italic font-black text-on-surface uppercase"
                style={{ fontFamily: '"Anybody", sans-serif' }}
              >
                REGISTRAR RESULTADO
              </h3>
            </div>
            
            {activeTab !== 'activos' ? (
              <div className="p-4 border border-dashed border-outline-variant/50 text-center font-mono text-[11px] text-on-surface-variant uppercase">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40 mb-2">sports_score</span>
                <p>Navega a la pestaña de retos "ACTIVOS" y selecciona una carrera para registrar el resultado final.</p>
              </div>
            ) : !selectedChallengeId ? (
              <div className="p-4 border border-dashed border-outline-variant/50 text-center font-mono text-[11px] text-on-surface-variant uppercase">
                <span className="material-symbols-outlined text-[32px] text-secondary-container/40 mb-2">touch_app</span>
                <p>Selecciona un reto activo de la lista para rellenar este panel de telemetría.</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterResult} className="flex flex-col gap-5">
                <div className="bg-[#131313] border border-outline-variant/50 p-3 font-mono text-[11px] text-on-surface-variant flex flex-col gap-1.5 uppercase">
                  <div>
                    <span className="font-bold text-secondary-container">RIVAL:</span> {selectedOpponentName}
                  </div>
                  <div>
                    <span className="font-bold text-secondary-container">MODALIDAD:</span> {getRaceTypeLabel(activeSelectedChallenge?.tipo_carrera || '')}
                  </div>
                  <div>
                    <span className="font-bold text-secondary-container">PISTA:</span> {activeSelectedChallenge?.ubicacion_acordada}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">
                    TIEMPO / PUNTUACIÓN (TELEMETRÍA)
                  </label>
                  <input 
                    type="text" 
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    required
                    placeholder="e.g. 00:12.894 o 8,500 pts"
                    className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-secondary-container transition-colors placeholder:text-on-surface-variant/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">RESULTADO</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOutcome('win')}
                      className={`flex-1 py-2 font-mono text-[11px] font-bold uppercase transition-all btn-notch cursor-pointer ${
                        outcome === 'win'
                          ? 'bg-tertiary-fixed/20 text-tertiary border border-tertiary shadow-[0_0_8px_rgba(42,229,0,0.2)]'
                          : 'bg-[#131313] border border-outline-variant text-on-surface-variant'
                      }`}
                    >
                      VICTORIA
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutcome('loss')}
                      className={`flex-1 py-2 font-mono text-[11px] font-bold uppercase transition-all btn-notch cursor-pointer ${
                        outcome === 'loss'
                          ? 'bg-error-container/20 text-error border border-error shadow-[0_0_8px_rgba(255,84,84,0.2)]'
                          : 'bg-[#131313] border border-outline-variant text-on-surface-variant'
                      }`}
                    >
                      DERROTA
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={submittingResult}
                  className="mt-2 w-full py-3.5 bg-transparent border-2 border-secondary-container text-secondary-container font-mono text-[11px] font-bold uppercase hover:bg-secondary-container/10 transition-all skew-x-[-8deg] cursor-pointer"
                >
                  <span className="skew-x-[8deg] block">
                    {submittingResult ? 'REGISTRANDO...' : 'CONFIRMAR RESULTADO'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {hudChallenge && currentUser && (
        <ChallengeHUD 
          challenge={hudChallenge} 
          currentUser={currentUser} 
          onClose={() => setHudChallenge(null)} 
        />
      )}
    </div>
  );
}
