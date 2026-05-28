import { useState, useEffect } from 'react';
import { 
  listNotifications, 
  updateNotification, 
  bulkUpdateNotifications, 
  deleteNotification 
} from '../../services/notification.service';
import { updateChallenge } from '../../services/challenge.service';
import type { Notification } from '../../services/notification.service';

const DEFAULT_PILOT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUGE293Fb7D8ZqThUZ65v4u5nM2YQgSjYE02lQjRWFc4_DI2AHYaq_0HWzLVcLGAsE3iCrghDAR-UZYpxAT8EdPmhes568N05s-EqB7D_G55ZXe7RFobdil4LKY5_7zw3sNdVadI6WrBbJwdblMbpE3R1vaUx73Uklywi3GbJJ3Ch93pYA_Yrg2VY6ZdZ3PW1_QFxZdCZEmZqB7P38I7xNGsE0oYSRAo8hMewjnve9HG-D62h1htmnonJlk5GUNfHrp7SI-TG8nx8x';

type FilterType = 'ALL' | 'CHALLENGES' | 'SYSTEM';

export default function Notificaciones() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [actionAlert, setActionAlert] = useState<{ success: boolean; message: string } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await listNotifications();
      if (res.success) {
        setNotifications(res.data);
      } else {
        setError(res.error || 'Failed to list notifications');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect to system alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string, leida: boolean) => {
    try {
      const res = await updateNotification(id, leida);
      if (res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, leida } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteNotification(id);
      if (res.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    setActionAlert(null);
    try {
      const res = await bulkUpdateNotifications(true);
      if (res.success) {
        setActionAlert({ success: true, message: 'ALL ALERTS CLEAR' });
        fetchNotifications();
      }
    } catch (err: any) {
      setActionAlert({ success: false, message: err.response?.data?.error || 'FAILED TO CLEAR PANEL' });
    }
  };

  const handleChallengeAction = async (challengeId: string | null, notificationId: string, action: 'aceptado' | 'rechazado') => {
    if (!challengeId) return;
    setProcessingId(notificationId);
    setActionAlert(null);
    try {
      const res = await updateChallenge(challengeId, { estado: action });
      if (res.success) {
        setActionAlert({ 
          success: true, 
          message: `CHALLENGE SUCCESSFULLY ${action === 'aceptado' ? 'ACCEPTED' : 'REJECTED'}` 
        });
        
        await deleteNotification(notificationId);
        fetchNotifications();
      }
    } catch (err: any) {
      setActionAlert({ 
        success: false, 
        message: err.response?.data?.error || 'TRANSMISSION FAILURE' 
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CHALLENGES') {
      return n.tipo?.startsWith('reto_');
    }
    if (activeFilter === 'SYSTEM') {
      return !n.tipo?.startsWith('reto_');
    }
    return true;
  });

  const getUnreadCount = () => {
    return notifications.filter(n => !n.leida).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <span 
          className="material-symbols-outlined text-secondary-container text-[48px] animate-spin"
          style={{ fontVariationSettings: "'wght' 100" }}
        >
          progress_activity
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-error bg-error/10 p-4 font-mono text-[14px] text-[#ffb4ab]">
        <span className="font-bold">SYSTEM ERROR:</span> {error.toUpperCase()}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] overflow-hidden">
      
      <div className="hidden md:flex flex-1 bg-surface-container border border-outline-variant/30 relative items-center justify-center header-notch">
        <div className="absolute inset-0 speed-lines opacity-10 pointer-events-none" />
        <div className="z-10 text-center select-none">
          <h1 
            className="text-[48px] italic text-surface-variant font-black opacity-20 tracking-tighter"
            style={{ fontFamily: '"Anybody", sans-serif' }}
          >
            RACE DASHBOARD
          </h1>
          <p className="font-mono text-[10px] text-surface-variant mt-2 tracking-widest font-bold">
            AWAITING INPUT...
          </p>
        </div>
      </div>

      <div className="w-full md:w-[420px] bg-surface-container-lowest border border-outline-variant/30 flex flex-col h-full relative z-20 header-notch">
        
        <header className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/50 backdrop-blur-md">
          <div>
            <h2 
              className="text-[22px] italic text-primary uppercase font-black tracking-tight"
              style={{ fontFamily: '"Anybody", sans-serif' }}
            >
              ALERTS
            </h2>
            <p className="font-mono text-[9px] font-bold text-secondary-container mt-1 uppercase">
              SYS_STATUS: ONLINE
            </p>
          </div>
          
          <button className="relative p-2 rounded-full hover:bg-surface-variant/50 transition-colors group cursor-pointer">
            <span className="material-symbols-outlined text-on-surface group-hover:text-primary transition-colors text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              notifications
            </span>
            {getUnreadCount() > 0 && (
              <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-surface-container-lowest"></span>
              </span>
            )}
          </button>
        </header>

        {actionAlert && (
          <div 
            className={`p-2.5 font-mono text-[11px] border text-center ${
              actionAlert.success 
                ? 'border-tertiary bg-tertiary/10 text-tertiary-fixed' 
                : 'border-error bg-error/10 text-error'
            }`}
          >
            {actionAlert.message}
          </div>
        )}

        <div className="px-5 py-4 flex gap-2 overflow-x-auto select-none shrink-0 border-b border-outline-variant/10">
          {(['ALL', 'CHALLENGES', 'SYSTEM'] as FilterType[]).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 font-mono text-[10px] font-bold uppercase transition-all skew-x-[-12deg] cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_8px_#ff5719]' 
                    : 'bg-surface-container border border-outline-variant/50 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
                }`}
              >
                <div className="skew-x-[12deg]">{filter}</div>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center font-mono text-[11px] text-on-surface-variant uppercase">
              No alerts found in log
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !notif.leida;
              
              let leftBarColor = 'bg-surface-variant';
              let glowStyle = 'border-outline-variant/30';
              let iconName = 'info';
              let iconColor = 'text-on-surface-variant';
              let titleColor = 'text-on-surface';

              if (notif.tipo === 'reto_recibido') {
                leftBarColor = 'bg-primary';
                glowStyle = 'border-primary-container/20 hover:border-primary-container shadow-[0_0_4px_rgba(255,87,25,0.15)]';
                iconName = 'swords';
                iconColor = 'text-primary';
                titleColor = 'text-primary';
              } else if (notif.tipo === 'reto_aceptado' || notif.tipo === 'reto_en_curso') {
                leftBarColor = 'bg-secondary-container';
                glowStyle = 'border-secondary-container/20 hover:border-secondary-container shadow-[0_0_4px_rgba(0,227,253,0.15)]';
                iconName = 'flag';
                iconColor = 'text-secondary-container';
                titleColor = 'text-secondary-container';
              } else if (notif.tipo === 'rango_alcanzado' || notif.tipo?.includes('streak') || notif.tipo?.includes('victorias')) {
                leftBarColor = 'bg-tertiary';
                glowStyle = 'border-tertiary/20 hover:border-tertiary shadow-[0_0_4px_rgba(42,229,0,0.15)]';
                iconName = 'military_tech';
                iconColor = 'text-tertiary';
                titleColor = 'text-tertiary';
              } else if (notif.tipo === 'reto_rechazado' || notif.tipo === 'reto_cancelado') {
                leftBarColor = 'bg-error';
                glowStyle = 'border-error/20 hover:border-error';
                iconName = 'cancel';
                iconColor = 'text-error';
                titleColor = 'text-error';
              }

              return (
                <div 
                  key={notif.id}
                  onClick={() => isUnread && handleMarkAsRead(notif.id, true)}
                  className={`border relative group transition-all duration-200 overflow-hidden ${glowStyle} ${
                    isUnread ? 'bg-[#181818]' : 'bg-[#121212] opacity-60 hover:opacity-100'
                  }`}
                >
                  
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${leftBarColor}`} />

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-opacity cursor-pointer p-0.5"
                    title="Delete alert"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>

                  <div className="p-4 flex gap-4">
                    
                    <div className="shrink-0 flex items-center justify-center">
                      {notif.tipo === 'reto_recibido' ? (
                        <div className="w-10 h-10 border border-primary/50 flex items-center justify-center overflow-hidden bg-[#20201f]">
                          <img 
                            alt="Rival pilot avatar" 
                            className="w-full h-full object-cover" 
                            src={DEFAULT_PILOT_AVATAR} 
                          />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-surface-container border border-outline-variant/30`}>
                          <span className={`material-symbols-outlined text-[20px] ${iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            {iconName}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0 pr-4">
                      <h3 className={`font-mono text-[13px] font-bold italic uppercase tracking-wider ${titleColor}`}>
                        {notif.tipo?.replace('_', ' ').toUpperCase()}
                      </h3>
                      <p className="font-sans text-[12px] text-on-surface-variant mt-1 leading-snug">
                        {notif.mensaje}
                      </p>

                      {notif.tipo === 'reto_recibido' && (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            disabled={processingId === notif.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChallengeAction(notif.referencia_id, notif.id, 'aceptado');
                            }}
                            className="flex-1 bg-primary-container hover:bg-primary text-on-primary-container font-mono text-[10px] font-bold py-1.5 rounded skew-x-[-12deg] transition-colors cursor-pointer select-none"
                          >
                            <div className="skew-x-[12deg]">ACEPTAR</div>
                          </button>
                          <button
                            type="button"
                            disabled={processingId === notif.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChallengeAction(notif.referencia_id, notif.id, 'rechazado');
                            }}
                            className="flex-1 bg-surface border border-outline-variant text-on-surface-variant font-mono text-[10px] font-bold py-1.5 rounded skew-x-[-12deg] hover:bg-surface-variant transition-colors cursor-pointer select-none"
                          >
                            <div className="skew-x-[12deg]">RECHAZAR</div>
                          </button>
                        </div>
                      )}

                      <div className="mt-2.5 font-mono text-[8px] text-outline-variant uppercase">
                        {notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div className="py-6 text-center select-none">
            <p className="font-mono text-[9px] text-surface-variant tracking-wider font-bold">END OF SECURE LOG</p>
          </div>
        </div>

        <div className="p-4 border-t border-outline-variant/30 bg-surface-container shrink-0">
          <button 
            onClick={handleClearAll}
            className="w-full bg-transparent border-2 border-secondary-container text-secondary-container font-mono text-[11px] font-bold py-3 skew-x-[-8deg] flex items-center justify-center gap-2 hover:bg-secondary-container/10 transition-colors speed-lines cursor-pointer select-none"
          >
            <span className="material-symbols-outlined text-[16px] skew-x-[8deg]">clear_all</span>
            <span className="skew-x-[8deg]">CLEAR LOG PANEL</span>
          </button>
        </div>

      </div>

    </div>
  );
}
