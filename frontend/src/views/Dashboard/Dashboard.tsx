import { useState, useEffect } from 'react';
import { discoverPilots } from '../../services/discover.service';
import { createRoom } from '../../services/chat.service';
import type { Pilot } from '../../services/discover.service';

interface DashboardProps {
  onSwitchView?: (view: 'auth' | 'dashboard' | 'perfil' | 'retos' | 'vehiculos' | 'notificaciones' | 'chat') => void;
  onSwitchViewWithRoom?: (view: 'auth' | 'dashboard' | 'perfil' | 'retos' | 'vehiculos' | 'notificaciones' | 'chat', roomId: string | null) => void;
}

const DEFAULT_BG_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ9kGpTYMUmuixb17l8gMVrjdwDUpWlS-0hYria1dwM63sFQ7YbCiqO7qnjTTB0FFm_rvvOwTv0HZUomglrUHM5dJh4z9CnJ4R45q3t8Srt6Fv0v-lG_9Pxf1rLMEe6nioG5kFKpSo1fymGhwGP13q7IyQ6ytRrRiA9fgqu55Vec8O2mdgoAjKa772pQOgs3puvXGDRzSo3moPjRjbSsMXGXqnJJQf2SsXX54xE10nopde33H2cCVWEmIyeeTJI06kV0t8l0_Dq-zL',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBJHY5IbrBUf3GIsZibnu3FzCG2OEjgme_SDLDwDMBEJzwULbTVzH_nkF8t-lAsJwGNDQSGtf7-b0JZF9w8S1ButwM-y6HInkSetQ73p97rNJRgUyymSlMETA2H2YyiW12abB3AMPLYHkpesdbQ4dgem3PnEpanbd2b4xQxHApJClWKPF6FuNziu9Vofo6horySUysXSeDdcWoKwbCnUVP2D7pLFtr3asSa1sixZgPr1nkzW30R28grGpYVXrAN3RQcN5YAir_PscnW',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCLU6PCXrDAkWxVg1FZDcSymVE1tPGEM8w32s7mzceAT5o-Pjz_M_-wtksMj0sTzULAz0y749_s6NENMuaVP0M1qCVXWpBT_Z63ZYDFn1ssqRAb7HDlQ-jodnHPMA-JU88khFmQxR88Np3hwnXKSYK3pSTwc6e0rTylw3MsVW_MVG1wl425oibkS7H5NVDIEja8asiEwlV7gY_zm0IOHFSVore4Dfu_FAeYbQMHlfdWENgggLLnmz-U7mk3-zVR_nrx_9O_buUBXSNt'
];

const DEFAULT_PILOT_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAkb13l3vxJaz983wuiRWaxnkB_3d2z7apq5aAAKMxKRN3IcsG1GNsEn1wLZUyaIHeDUZZJ6a3PEEd0nJY_gGgGe1aMvcDW78gcbrQ5pvSTow-qefnSnweA8xwafa4WyiZT1iaW3qsbzo1vTMrqSnTcQfDifJdK4zawp1KaqLPoGHoII2mrgAqVQhktWHri3mBxNsZBd5BA3gcHHALXeDrbfQfN3T7EkNTvrMfeOxfAyK7AbaU-tn8OwktJjWm-UltabaubDytBgc_2',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBw2tSqKZIS4pWjAoeOKYaR0xh0yau7A5gWX0nGsnz9zOTcSSXrk5f_2Hnz8SI0RicTZrPB5wEJvACRInzoX1YbNFdZNS26Rc87fL9jr09LuAf_CenrufJgrOIKssG-4y6Q2fSFpEw2NWd4dWbW9jNvjGxlRI4YCDTE-jf6wHZPrlehkPSAPWKOgg6T-a9-tcB5u4KmTmgW3zFd0ZIymnovrzcW6QHAmW03ul4a3A1iRVojiQAsELwYZIwstJ6nOJBKtTpVUP9vRiDf',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA0txy4dB6b9FTsxHZ8WtqDDVvR5G6cryW0tt5lnPZ9eQPEYWMDQ9fqWcIk5Nop2TMv7DRf299f8kKJVhr17KH37JxK1YQ76ViYyrss4zgdwSO9cZ5MXKLr4XFc_7Yu-tav1ip7iR59En8gsflt4w3w8VLH-PDkH5NP55rTECZCE0U-Ir7bMrGPs3Q74cTjKuoNUfFUr2hXPdRegh9xr0-FK9jZPryrFTyxVmX24n9jRiUZLbyf9omxm8fn2W-BDEu-wMMe8GgoMtl4'
];

export default function Dashboard({ onSwitchView, onSwitchViewWithRoom }: DashboardProps) {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);

  const handleStartChat = async (recipientId: string) => {
    try {
      const res = await createRoom({ is_grupo: false, recipientId });
      if (res.success && res.data) {
        onSwitchViewWithRoom?.('chat', res.data.id);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const [error, setError] = useState<string | null>(null);

  const [noActiveVehicle, setNoActiveVehicle] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [ciudadFilter, setCiudadFilter] = useState('');
  const [tipoVehiculoFilter, setTipoVehiculoFilter] = useState('');

  const fetchDiscover = async () => {
    setLoading(true);
    setError(null);
    setNoActiveVehicle(false);
    try {
      const res = await discoverPilots({
        ciudad: ciudadFilter || undefined,
        tipo_vehiculo: tipoVehiculoFilter || undefined,
        page: 1,
        limit: 12
      });
      if (res.success) {
        setPilots(res.data.pilots);
      } else {
        setError('Error al recuperar rivales');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || '';
      if (errMsg.includes('vehículo marcado como activo') || err.response?.status === 400) {
        setNoActiveVehicle(true);
      } else {
        setError(errMsg || 'Error en conexión al servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscover();
  }, [ciudadFilter, tipoVehiculoFilter]);

  const getPilotStats = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const wins = Math.abs(hash % 450) + 50;
    const streak = Math.abs(hash % 8) === 0 ? 0 : Math.abs(hash % 12);
    const rep = (wins * 0.15 + streak * 2).toFixed(1) + 'k';
    const bgIndex = Math.abs(hash) % DEFAULT_BG_IMAGES.length;
    const avatarIndex = Math.abs(hash) % DEFAULT_PILOT_AVATARS.length;
    return { wins, streak, rep, bg: DEFAULT_BG_IMAGES[bgIndex], avatar: DEFAULT_PILOT_AVATARS[avatarIndex] };
  };

  return (
    <div className="flex flex-col gap-8 relative">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 
            className="text-[28px] md:text-[32px] italic text-on-surface uppercase mb-2 font-black tracking-tight"
            style={{ fontFamily: '"Anybody", sans-serif' }}
          >
            Target Acquisition
          </h2>
          <p className="text-[14px] text-on-surface-variant border-l-2 border-secondary-container pl-3 font-mono">
            Scanning sector for viable opponents. Filter locks engaged.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-outline-variant px-3 py-1.5 rounded-sm skew-x-[-8deg]">
            <span className="material-symbols-outlined text-secondary-container text-[16px] skew-x-[8deg]">filter_list</span>
            <span className="font-mono text-[10px] font-bold text-on-surface skew-x-[8deg] uppercase">
              SECTOR: {ciudadFilter || 'GLOBAL'}
            </span>
          </div>
          {tipoVehiculoFilter && (
            <div className="flex items-center gap-2 bg-surface border border-outline-variant px-3 py-1.5 rounded-sm skew-x-[-8deg]">
              <span className="material-symbols-outlined text-secondary-container text-[16px] skew-x-[8deg]">directions_car</span>
              <span className="font-mono text-[10px] font-bold text-on-surface skew-x-[8deg] uppercase">
                CLASS: {tipoVehiculoFilter}
              </span>
            </div>
          )}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-surface-container-high border border-outline px-3 py-1.5 rounded-sm hover:bg-surface-variant transition-colors skew-x-[-8deg] cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[16px] skew-x-[8deg]">tune</span>
            <span className="font-mono text-[10px] font-bold text-on-surface-variant skew-x-[8deg] uppercase">
              Modify
            </span>
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="bg-surface-container border border-outline-variant p-4 flex flex-wrap gap-4 items-center skew-x-[-2deg]">
          <div className="skew-x-[2deg] flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-[10px] font-mono font-bold text-on-surface-variant uppercase">FILTER BY CITY / AREA</label>
            <input 
              type="text" 
              value={ciudadFilter}
              onChange={(e) => setCiudadFilter(e.target.value)}
              placeholder="e.g. Madrid, Global"
              className="bg-surface border border-outline-variant text-[14px] text-on-surface font-mono p-2 outline-none focus:border-secondary-container transition-colors"
            />
          </div>
          <div className="skew-x-[2deg] flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-[10px] font-mono font-bold text-on-surface-variant uppercase">VEHICLE TYPE</label>
            <select 
              value={tipoVehiculoFilter}
              onChange={(e) => setTipoVehiculoFilter(e.target.value)}
              className="bg-surface border border-outline-variant text-[14px] text-on-surface font-mono p-2 outline-none focus:border-secondary-container transition-colors"
            >
              <option value="">ALL CLASSES</option>
              <option value="Auto">AUTO</option>
              <option value="Moto">MOTO</option>
              <option value="Camioneta">CAMIONETA</option>
              <option value="Deportivo">DEPORTIVO</option>
            </select>
          </div>
          <button 
            onClick={() => {
              setCiudadFilter('');
              setTipoVehiculoFilter('');
              setShowFilters(false);
            }}
            className="skew-x-[2deg] self-end bg-surface border border-error px-4 py-2 hover:bg-error/10 text-error text-[12px] font-mono font-bold transition-all cursor-pointer h-[38px]"
          >
            RESET
          </button>
        </div>
      )}

      {noActiveVehicle && (
        <div className="border border-[#ff5719] bg-[#ff5719]/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_15px_rgba(255,87,25,0.1)]">
          <div className="flex gap-4 items-start">
            <span className="material-symbols-outlined text-[#ff5719] text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
            <div className="flex flex-col gap-1">
              <h3 
                className="text-[18px] font-bold text-[#ff5719] uppercase tracking-wide"
                style={{ fontFamily: '"Anybody", sans-serif' }}
              >
                SYSTEM ALERT: NO ACTIVE VEHICLE
              </h3>
              <p className="text-[13px] text-on-surface-variant font-mono">
                You must register and set at least one vehicle as active in your Garage to acquire targets in this sector.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onSwitchView && onSwitchView('vehiculos')}
            className="bg-[#ff5719] hover:bg-[#ff5719]/80 text-[#521300] font-mono text-[12px] font-bold px-6 py-3 skew-x-[-12deg] glow-primary transition-all cursor-pointer shrink-0"
          >
            <span className="skew-x-[12deg] block">ACCESS GARAGE</span>
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-24">
          <span 
            className="material-symbols-outlined text-secondary-container text-[48px] animate-spin"
            style={{ fontVariationSettings: "'wght' 100" }}
          >
            progress_activity
          </span>
        </div>
      )}

      {error && !loading && (
        <div className="border border-error bg-error/10 p-4 font-mono text-[14px] text-[#ffb4ab]">
          <span className="font-bold">SYSTEM ERROR:</span> {error.toUpperCase()}
        </div>
      )}

      {!loading && !noActiveVehicle && !error && (
        <>
          {pilots.length === 0 ? (
            <div className="border border-outline-variant bg-[#131313] p-12 text-center">
              <span className="material-symbols-outlined text-on-surface-variant text-[48px] mb-4">
                search_off
              </span>
              <p className="font-mono text-[14px] text-on-surface-variant uppercase tracking-wider">
                No rival pilots detected in this sector. Try resetting filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pilots.map((pilot) => {
                const stats = getPilotStats(pilot.id);
                const vehicle = pilot.vehicles[0];

                return (
                  <article 
                    key={pilot.id}
                    className="hud-notch bg-[#131313] border border-outline-variant flex flex-col group hover:border-secondary-container transition-colors duration-300 relative"
                  >
                    <div 
                      className="absolute top-3 right-3 z-10 bg-tertiary text-on-tertiary-container font-mono text-[10px] px-2 py-0.5 skew-x-[-12deg] glow-tertiary animate-pulse font-bold"
                    >
                      <span className="skew-x-[12deg] block font-bold uppercase">
                        Class {pilot.rango}
                      </span>
                    </div>

                    <div className="h-32 relative overflow-hidden bg-surface-container-highest border-b border-outline-variant/30">
                      <div className="absolute inset-0 bg-black/60 z-10"></div>
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:opacity-60 transition-opacity duration-500"
                        style={{ backgroundImage: `url('${vehicle?.foto || stats.bg}')` }}
                      ></div>
                      <div className="absolute bottom-[-24px] left-4 z-20 flex items-end gap-3">
                        <div className="w-16 h-16 rounded-sm border-2 border-[#131313] bg-[#0e0e0e] overflow-hidden shadow-lg glow-secondary transition-all">
                          <img 
                            alt="Rival Pilot Avatar" 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                            src={pilot.foto_perfil || stats.avatar}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = stats.avatar;
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 pb-4 px-4 flex-grow flex flex-col gap-3 relative">
                      <div className="absolute left-0 top-8 bottom-4 w-[2px] bg-gradient-to-b from-secondary-container to-transparent opacity-50"></div>
                      
                      <div className="pl-2">
                        <h3 className="text-[18px] md:text-[20px] font-bold italic text-on-surface uppercase leading-none" style={{ fontFamily: '"Anybody", sans-serif' }}>
                          {pilot.username}
                        </h3>
                        <p className="text-[10px] font-mono font-bold text-secondary mt-1 uppercase tracking-wider">
                          {vehicle ? `${vehicle.marca || ''} ${vehicle.modelo || ''}`.toUpperCase() : 'NO VEHICLE'}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-[#0e0e0e] p-2 border border-surface-variant mt-2 font-mono">
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] text-on-surface-variant font-bold">WINS</span>
                          <span className="text-[13px] text-on-surface font-bold">{stats.wins}</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-r border-surface-variant">
                          <span className="text-[8px] text-on-surface-variant font-bold">STREAK</span>
                          <div className="flex items-center gap-0.5">
                            {stats.streak > 0 && (
                              <span className="material-symbols-outlined text-primary-container text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                local_fire_department
                              </span>
                            )}
                            <span className={`text-[13px] font-bold ${stats.streak > 0 ? 'text-primary-container' : 'text-on-surface-variant'}`}>
                              {stats.streak}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] text-on-surface-variant font-bold">REP</span>
                          <span className="text-[13px] text-secondary-container font-bold">{stats.rep}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full mt-auto">
                      <button 
                        onClick={() => handleStartChat(pilot.id)}
                        className="flex-grow bg-secondary-container hover:bg-secondary-fixed text-on-secondary py-3 flex justify-center items-center gap-2 cursor-pointer font-bold"
                        style={{ fontFamily: '"Anybody", sans-serif' }}
                      >
                        <span className="skew-x-[-12deg] text-[12px] italic uppercase tracking-wider">CHALLENGER COMMUNICATIONS</span>
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
}
