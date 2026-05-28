import { useState } from 'react';
import type { Challenge } from '../services/challenge.service';
import type { User } from '../services/auth.service';
import ChallengeMap from './ChallengeMap';

interface ChallengeDetailModalProps {
  challenge: Challenge;
  currentUser: User;
  onClose: () => void;
  onJoin: (challengeId: string) => Promise<void>;
}

export default function ChallengeDetailModal({ challenge, currentUser, onClose, onJoin }: ChallengeDetailModalProps) {
  const [joining, setJoining] = useState(false);

  const isRetador = challenge.retador_id === currentUser.id;
  const isRetado = challenge.retado_id === currentUser.id;
  const isParticipant = isRetador || isRetado;

  const showJoinButton = !isParticipant && challenge.estado === 'pendiente' && (!challenge.retador_id || !challenge.retado_id);

  const handleJoinClick = async () => {
    setJoining(true);
    try {
      await onJoin(challenge.id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setJoining(false);
    }
  };

  const getRaceTypeLabel = (type: string | null) => {
    switch (type) {
      case 'cuarto_milla': return '1/4 MILLA (ACELERACIÓN)';
      case 'vueltas': return 'VUELTAS (CIRCUITO)';
      case 'derrape': return 'DERRAPE (DRIFT)';
      default: return type?.toUpperCase() || 'CARRERA';
    }
  };

  const renderVotingStatus = (c: Challenge) => {
    const retadorName = c.retador?.username || 'RETADOR';
    const retadoName = c.retado?.username || 'RETADO';

    if (!c.ganador_retador_id && !c.ganador_retado_id) {
      return (
        <div className="text-[10px] text-yellow-500 font-mono mt-1 flex items-center gap-1 uppercase">
          <span className="material-symbols-outlined text-[12px] mr-1">pending</span>
          <span>Falta votar: {retadorName} y {retadoName}</span>
        </div>
      );
    }
    if (c.ganador_retador_id && !c.ganador_retado_id) {
      return (
        <div className="text-[10px] text-yellow-500 font-mono mt-1 flex items-center gap-1 uppercase">
          <span className="material-symbols-outlined text-[12px] mr-1">pending</span>
          <span>Falta votar: {retadoName}</span>
        </div>
      );
    }
    if (!c.ganador_retador_id && c.ganador_retado_id) {
      return (
        <div className="text-[10px] text-yellow-500 font-mono mt-1 flex items-center gap-1 uppercase">
          <span className="material-symbols-outlined text-[12px] mr-1">pending</span>
          <span>Falta votar: {retadorName}</span>
        </div>
      );
    }
    if (c.ganador_retador_id && c.ganador_retado_id && c.ganador_retador_id !== c.ganador_retado_id) {
      return (
        <div className="text-[10px] text-error font-mono mt-1 flex items-center gap-1 uppercase font-bold">
          <span className="material-symbols-outlined text-[12px] mr-1">warning</span>
          <span>Votos en conflicto (No coinciden)</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#20201f] border border-outline-variant p-6 relative max-w-2xl w-full header-notch shadow-[0_0_24px_rgba(255,87,25,0.15)] font-mono flex flex-col gap-5 my-8">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#ff5719]" />
        
        <div className="flex justify-between items-start border-b border-outline-variant/30 pb-3">
          <div>
            <h3 className="text-[18px] italic font-black text-primary-container uppercase">
              DETALLE DE RETO
            </h3>
            <p className="text-[10px] text-on-surface-variant uppercase mt-1">
              ID: {challenge.id}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface cursor-pointer select-none"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-4">
            <div className="bg-[#141413] border border-outline-variant/30 p-4 flex flex-col gap-2.5">
              <div>
                <span className="text-[9px] font-bold text-secondary-container uppercase block">MODALIDAD</span>
                <span className="text-[13px] text-on-surface font-bold">{getRaceTypeLabel(challenge.tipo_carrera)}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-secondary-container uppercase block">PISTA / UBICACIÓN</span>
                <span className="text-[13px] text-on-surface font-bold">{challenge.ubicacion_acordada}</span>
              </div>
              {challenge.location?.descripcion && (
                <div>
                  <span className="text-[9px] font-bold text-secondary-container uppercase block">DESCRIPCIÓN DE PISTA</span>
                  <span className="text-[11px] text-on-surface-variant italic">{challenge.location.descripcion}</span>
                </div>
              )}
              <div>
                <span className="text-[9px] font-bold text-secondary-container uppercase block">FECHA Y HORA</span>
                <span className="text-[13px] text-on-surface">
                  {challenge.fecha_acordada ? new Date(challenge.fecha_acordada).toLocaleString() : 'PENDIENTE DE PROGRAMAR'}
                </span>
              </div>
              {challenge.notas && (
                <div>
                  <span className="text-[9px] font-bold text-secondary-container uppercase block">NOTAS</span>
                  <span className="text-[11px] text-on-surface-variant">{challenge.notas}</span>
                </div>
              )}
              <div>
                <span className="text-[9px] font-bold text-secondary-container uppercase block">ESTADO</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border inline-block mt-1 ${
                  challenge.estado === 'completado'
                    ? 'border-secondary-container/50 bg-secondary-container/10 text-secondary-container'
                    : challenge.estado === 'pendiente'
                    ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500'
                    : 'border-error/50 bg-error/10 text-error'
                }`}>
                  {challenge.estado}
                </span>
                {(challenge.estado === 'aceptado' || challenge.estado === 'en_curso') && (
                  <div className="mt-2.5 pt-2 border-t border-outline-variant/10">
                    <span className="text-[9px] font-bold text-secondary-container uppercase block">CONSENSO DE VOTACIÓN</span>
                    {renderVotingStatus(challenge)}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#141413] border border-outline-variant/30 p-4 flex flex-col gap-3">
              <h4 className="text-[11px] font-bold text-on-surface uppercase border-b border-outline-variant/20 pb-1.5">
                COMPETIDORES
              </h4>
              <div className="flex justify-between items-center text-[12px]">
                <div className="flex flex-col">
                  <span className="font-bold text-on-surface-variant">PILOTO RETADOR:</span>
                  <span className="text-on-surface font-bold uppercase">{challenge.retador?.username || 'DISPONIBLE'}</span>
                  {challenge.vehiculo_retador && (
                    <span className="text-[10px] text-on-surface-variant uppercase">
                      {challenge.vehiculo_retador.marca} {challenge.vehiculo_retador.modelo}
                    </span>
                  )}
                </div>
                {challenge.retador?.rango && (
                  <span className="border border-primary-container/40 bg-primary-container/10 text-primary-container px-2 py-0.5 text-[10px] font-bold">
                    {challenge.retador.rango}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-[12px] border-t border-outline-variant/20 pt-2.5">
                <div className="flex flex-col">
                  <span className="font-bold text-on-surface-variant">PILOTO RETADO:</span>
                  <span className="text-on-surface font-bold uppercase">{challenge.retado?.username || 'DISPONIBLE'}</span>
                  {challenge.vehiculo_retado && (
                    <span className="text-[10px] text-on-surface-variant uppercase">
                      {challenge.vehiculo_retado.marca} {challenge.vehiculo_retado.modelo}
                    </span>
                  )}
                </div>
                {challenge.retado?.rango && (
                  <span className="border border-primary-container/40 bg-primary-container/10 text-primary-container px-2 py-0.5 text-[10px] font-bold">
                    {challenge.retado.rango}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-bold text-on-surface uppercase tracking-wide">
              VISTA DE PISTA
            </h4>
            {challenge.location ? (
              <ChallengeMap location={challenge.location} />
            ) : (
              <div className="w-full h-64 border border-outline-variant/30 bg-[#141413] flex flex-col items-center justify-center text-center p-4">
                <span className="material-symbols-outlined text-on-surface-variant/40 text-[40px] mb-2">map</span>
                <p className="text-[11px] text-on-surface-variant uppercase">Esta carrera no tiene mapa de ruta asociado</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end border-t border-outline-variant/20 pt-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border border-outline-variant hover:bg-surface-variant text-on-surface font-bold px-5 py-2.5 text-[11px] skew-x-[-12deg] cursor-pointer"
          >
            <span className="skew-x-[12deg] block">CERRAR</span>
          </button>
          {showJoinButton && (
            <button
              type="button"
              disabled={joining}
              onClick={handleJoinClick}
              className="bg-primary-container text-on-primary-container font-bold px-6 py-2.5 text-[11px] skew-x-[-12deg] hover:bg-primary cursor-pointer disabled:opacity-50 select-none"
            >
              <span className="skew-x-[12deg] block">
                {joining ? 'UNIÉNDOSE...' : 'UNIRSE AL RETO'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
