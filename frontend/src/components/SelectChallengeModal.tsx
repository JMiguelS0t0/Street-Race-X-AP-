import { useState, useEffect } from 'react';
import { listChallenges, type Challenge } from '../services/challenge.service';
import type { User } from '../services/auth.service';

interface SelectChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelect: (challengeId: string) => void;
}

export default function SelectChallengeModal({
  isOpen,
  onClose,
  currentUser,
  onSelect
}: SelectChallengeModalProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loadEligibleChallenges = async () => {
        setLoading(true);
        setError(null);
        try {
          const [myPendingRes, openRes] = await Promise.all([
            listChallenges({ estado: 'pendiente' }),
            listChallenges({ disponibles: true })
          ]);

          const myPending = myPendingRes.success ? myPendingRes.data.challenges : [];
          const openChallenges = openRes.success ? openRes.data.challenges : [];

          const mySelectable = myPending.filter(
            (c) =>
              (c.retador_id === currentUser.id && !c.retado_id) ||
              (c.retado_id === currentUser.id && !c.retador_id)
          );

          const combined = [...mySelectable, ...openChallenges];
          const uniqueChallengesMap = new Map<string, Challenge>();
          combined.forEach((c) => uniqueChallengesMap.set(c.id, c));

          setChallenges(Array.from(uniqueChallengesMap.values()));
        } catch (err) {
          console.error(err);
          setError('Error al cargar los retos existentes.');
        } finally {
          setLoading(false);
        }
      };

      loadEligibleChallenges();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const getRaceTypeLabel = (type: string | null) => {
    switch (type) {
      case 'cuarto_milla':
        return '1/4 MILLA (ACELERACIÓN)';
      case 'vueltas':
        return 'VUELTAS (CIRCUITO)';
      case 'derrape':
        return 'DERRAPE (DRIFT)';
      default:
        return type?.toUpperCase() || 'CARRERA';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#20201f] border border-outline-variant p-6 relative max-w-xl w-full header-notch shadow-[0_0_24px_rgba(255,87,25,0.15)] font-mono flex flex-col gap-5 my-8">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#ff5719]" />

        <div className="flex justify-between items-start border-b border-outline-variant/30 pb-3">
          <div>
            <h3 className="text-[18px] italic font-black text-primary-container uppercase">
              SELECCIONAR RETO
            </h3>
            <p className="text-[10px] text-on-surface-variant uppercase mt-1">
              Elige un reto existente para enviar al chat
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
          <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
            {challenges.length === 0 ? (
              <div className="p-6 border border-dashed border-outline-variant/50 text-center text-on-surface-variant uppercase text-[11px]">
                No hay retos disponibles para invitar. Consulta con un administrador.
              </div>
            ) : (
              challenges.map((c) => {
                const isCreator = c.retador_id === currentUser.id || c.retado_id === currentUser.id;
                return (
                  <div
                    key={c.id}
                    className="border border-outline-variant bg-[#131313] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#ff5719]/50 transition-colors"
                  >
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-on-surface uppercase">
                          {getRaceTypeLabel(c.tipo_carrera)}
                        </span>
                        <span
                          className={`text-[8px] px-1.5 py-0.5 border font-bold uppercase ${
                            isCreator
                              ? 'border-secondary-container/40 bg-secondary-container/10 text-secondary-container'
                              : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-500'
                          }`}
                        >
                          {isCreator ? 'TU RETO' : 'ABIERTO'}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-1.5 uppercase truncate">
                        Pista: {c.ubicacion_acordada}
                      </p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        Fecha: {c.fecha_acordada ? new Date(c.fecha_acordada).toLocaleString() : 'PENDIENTE'}
                      </p>
                      {c.notas && (
                        <p className="text-[9px] text-on-surface-variant/70 italic mt-1 truncate">
                          "{c.notas}"
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(c.id);
                        onClose();
                      }}
                      className="bg-primary-container hover:bg-primary text-on-primary-container font-mono text-[10px] font-bold px-4 py-2 skew-x-[-12deg] transition-all cursor-pointer shrink-0 w-full sm:w-auto text-center"
                    >
                      <span className="skew-x-[12deg] block">SELECCIONAR</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="flex justify-end border-t border-outline-variant/20 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border border-outline-variant hover:bg-surface-variant text-on-surface font-bold px-5 py-2.5 text-[11px] skew-x-[-12deg] cursor-pointer"
          >
            <span className="skew-x-[12deg] block">CERRAR</span>
          </button>
        </div>
      </div>
    </div>
  );
}
