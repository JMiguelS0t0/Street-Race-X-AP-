import { useState, useEffect } from 'react';
import { discoverPilots } from '../services/discover.service';
import { getLocations, type RaceLocation } from '../services/location.service';
import { createChallenge } from '../services/challenge.service';
import CustomDateTimePicker from './CustomDateTimePicker';
import type { User } from '../services/auth.service';

interface RivalSummary {
  id: string;
  username: string;
  rango?: string | null;
  foto_perfil?: string | null;
}

interface InvitePilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  fixedRival?: RivalSummary | null;
  onSuccess: (challengeId: string) => void;
}

export default function InvitePilotModal({
  isOpen,
  onClose,
  currentUser,
  fixedRival,
  onSuccess
}: InvitePilotModalProps) {
  const [pilots, setPilots] = useState<RivalSummary[]>([]);
  const [locations, setLocations] = useState<RaceLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rivalId, setRivalId] = useState('');
  const [tipoCarrera, setTipoCarrera] = useState('cuarto_milla');
  const [locationId, setLocationId] = useState('');
  const [fecha, setFecha] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (fixedRival) {
        setRivalId(fixedRival.id);
      } else {
        setRivalId('');
      }
      setTipoCarrera('cuarto_milla');
      setLocationId('');
      setFecha('');
      setNotas('');
      setError(null);
      
      const loadModalData = async () => {
        setLoading(true);
        try {
          const [pilotsRes, locationsRes] = await Promise.all([
            discoverPilots({ limit: 100 }),
            getLocations()
          ]);
          if (pilotsRes.success) {
            setPilots(pilotsRes.data.pilots || []);
          }
          if (locationsRes.success) {
            setLocations(locationsRes.data || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      loadModalData();
    }
  }, [isOpen, fixedRival]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRivalId = fixedRival ? fixedRival.id : rivalId;
    if (!finalRivalId) {
      setError('Debes seleccionar un rival para retar.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await createChallenge({
        retador_id: currentUser.id,
        retado_id: finalRivalId,
        tipo_carrera: tipoCarrera,
        location_id: locationId || null,
        ubicacion_acordada: locations.find(loc => loc.id === locationId)?.nombre || 'Pista de carreras',
        fecha_acordada: fecha ? new Date(fecha).toISOString() : null,
        notas: notas
      });

      if (res.success && res.data) {
        onSuccess(res.data.id);
        onClose();
      } else {
        setError(res.error || 'Error al enviar la invitación.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear el reto.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedLocation = locations.find(loc => loc.id === locationId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#20201f] border border-outline-variant p-6 relative max-w-xl w-full header-notch shadow-[0_0_24px_rgba(255,87,25,0.15)] font-mono flex flex-col gap-5 my-8">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#ff5719]" />

        <div className="flex justify-between items-start border-b border-outline-variant/30 pb-3">
          <div>
            <h3 className="text-[18px] italic font-black text-primary-container uppercase">
              CREAR RETO / INVITACIÓN
            </h3>
            <p className="text-[10px] text-on-surface-variant uppercase mt-1">
              Desafía a otro piloto a competir
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-on-surface-variant hover:text-on-surface cursor-pointer select-none"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 border border-error bg-error/10 text-error text-[12px] uppercase">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <span
              className="material-symbols-outlined text-secondary-container text-[36px] animate-spin"
              style={{ fontVariationSettings: "'wght' 100" }}
            >
              progress_activity
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant font-bold uppercase">
                RIVAL A RETAR
              </label>
              {fixedRival ? (
                <div className="bg-[#131313] border border-outline-variant text-[13px] text-on-surface p-3 font-bold uppercase">
                  {fixedRival.username} ({fixedRival.rango || 'SIN RANGO'})
                </div>
              ) : (
                <select
                  value={rivalId}
                  onChange={(e) => setRivalId(e.target.value)}
                  required
                  className="bg-[#131313] border border-outline-variant text-[13px] text-on-surface p-2.5 outline-none focus:border-primary-container"
                >
                  <option value="">SELECCIONA UN CONTRINCANTE</option>
                  {pilots
                    .filter((p) => p.id !== currentUser.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.username.toUpperCase()} &mdash; {(p.rango || 'SIN RANGO').toUpperCase()}
                      </option>
                    ))}
                </select>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant font-bold uppercase">
                MODALIDAD DE CARRERA
              </label>
              <select
                value={tipoCarrera}
                onChange={(e) => setTipoCarrera(e.target.value)}
                required
                className="bg-[#131313] border border-outline-variant text-[13px] text-on-surface p-2.5 outline-none focus:border-primary-container"
              >
                <option value="cuarto_milla">1/4 MILLA (ACELERACIÓN)</option>
                <option value="vueltas">VUELTAS (CIRCUITO)</option>
                <option value="derrape">DERRAPE (DRIFT)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant font-bold uppercase">
                PISTA / UBICACIÓN
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                required
                className="bg-[#131313] border border-outline-variant text-[13px] text-on-surface p-2.5 outline-none focus:border-primary-container"
              >
                <option value="">SELECCIONA UNA PISTA</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
              {selectedLocation?.descripcion && (
                <p className="text-[10px] text-on-surface-variant italic mt-1 uppercase">
                  Pista: {selectedLocation.descripcion}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant font-bold uppercase">
                FECHA Y HORA ACORDADA
              </label>
              <CustomDateTimePicker value={fecha} onChange={setFecha} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant font-bold uppercase">
                NOTAS / REGLAS ESPECÍFICAS
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="e.g. Apuesta de reputación, sin nitro, neumáticos de calle"
                rows={3}
                className="bg-[#131313] border border-outline-variant text-[13px] text-on-surface p-2.5 outline-none focus:border-primary-container resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end border-t border-outline-variant/20 pt-4 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-transparent border border-outline-variant hover:bg-surface-variant text-on-surface font-bold px-5 py-2.5 text-[11px] skew-x-[-12deg] cursor-pointer"
              >
                <span className="skew-x-[12deg] block">CANCELAR</span>
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary-container text-on-primary-container font-bold px-6 py-2.5 text-[11px] skew-x-[-12deg] hover:bg-primary cursor-pointer disabled:opacity-50 select-none"
              >
                <span className="skew-x-[12deg] block">
                  {submitting ? 'ENVIANDO...' : 'ENVIAR DESAFÍO'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
