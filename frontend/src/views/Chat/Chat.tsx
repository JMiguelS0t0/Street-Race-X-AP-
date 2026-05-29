import { useState, useEffect, useRef } from 'react';
import { socket, connectSocket, disconnectSocket } from '../../services/socket';
import { getRooms, getChatHistory, createRoom } from '../../services/chat.service';
import { getTopRanking } from '../../services/user.service';
import { getChallengeDetail, updateChallenge } from '../../services/challenge.service';
import type { ChatRoom, ChatMessage } from '../../services/chat.service';
import type { User } from '../../services/auth.service';
import type { RankingUser } from '../../services/user.service';
import type { Challenge } from '../../services/challenge.service';
import ChallengeDetailModal from '../../components/ChallengeDetailModal';
import SelectChallengeModal from '../../components/SelectChallengeModal';

interface ChatProps {
  currentUser: User;
  activeRoomId: string | null;
  setActiveRoomId: (id: string | null) => void;
}

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYR4VH9Q7lnQMe14FpOwtCRSPQZNWWixixsuyVD5R66ZIHDuSjmDgx3pMoef-nzMhyieLT58_EfzglLFsgH0ePPf0-eKdrMaRlRXkfkI29HCDWjoJu9cZmotB-Gtr3zNjeCKXDyZMUTRz45p1FcdlElppE_WjgaDFVdZ7Qrb1Ofe_LBafAtMvcTY80yPrfrqBVHEbUjA1HjhbuOyEqK8wfjqAEnQFQt1LTTIVPxKhrwTaHycMGtpAr-GxioENhzM1IzYH4ALpPJz-G';

export default function Chat({ currentUser, activeRoomId, setActiveRoomId }: ChatProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [opponentTyping, setOpponentTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [availablePilots, setAvailablePilots] = useState<RankingUser[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedDetailChallenge, setSelectedDetailChallenge] = useState<Challenge | null>(null);

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await updateChallenge(challengeId, { estado: 'unirse', action: 'unirse' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenChallengeDetail = async (challengeId: string) => {
    try {
      const res = await getChallengeDetail(challengeId);
      if (res.success && res.data) {
        setSelectedDetailChallenge(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<any>(null);

  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const res = await getTopRanking(50);
        if (res.success) {
          setAvailablePilots(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAvailable();

    const token = localStorage.getItem('token');
    if (token) {
      connectSocket(token);
    }

    const loadRooms = async () => {
      try {
        const res = await getRooms();
        if (res.success) {
          setRooms(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRooms(false);
      }
    };

    loadRooms();

    socket.on('new_message', (msg: ChatMessage) => {
      if (activeRoomId && msg.chat_room_id === activeRoomId) {
        setMessages(prev => [...prev, msg]);
      }
      loadRooms();
    });

    socket.on('user_typing', (data: { chatRoomId: string; userId: string; username: string; isTyping: boolean }) => {
      if (activeRoomId && data.chatRoomId === activeRoomId && data.userId !== currentUser.id) {
        setOpponentTyping(data.isTyping);
        setTypingUser(data.isTyping ? data.username : null);
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      disconnectSocket();
    };
  }, [activeRoomId]);

  const handleStartNewChat = async (recipientId: string) => {
    try {
      const res = await createRoom({ is_grupo: false, recipientId });
      if (res.success && res.data) {
        const newRoom = res.data;
        setRooms(prev => {
          if (prev.some(r => r.id === newRoom.id)) return prev;
          return [newRoom, ...prev];
        });
        setActiveRoomId(newRoom.id);
        setSearchQuery('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!activeRoomId) return;

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        socket.emit('join_room', { chatRoomId: activeRoomId });
        const res = await getChatHistory(activeRoomId, { limit: 50 });
        if (res.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();

    return () => {
      socket.emit('leave_room', { chatRoomId: activeRoomId });
      setMessages([]);
      setOpponentTyping(false);
      setTypingUser(null);
    };
  }, [activeRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoomId) return;

    socket.emit('send_message', {
      chatRoomId: activeRoomId,
      contenido: newMessage.trim()
    });
    setNewMessage('');
    socket.emit('typing', { chatRoomId: activeRoomId, isTyping: false });
  };

  const handleInputChange = (val: string) => {
    setNewMessage(val);
    if (!activeRoomId) return;

    socket.emit('typing', { chatRoomId: activeRoomId, isTyping: true });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing', { chatRoomId: activeRoomId, isTyping: false });
    }, 2000);
  };

  const getOpponent = (room: ChatRoom | undefined | null) => {
    if (!room) return null;
    if (!room.is_grupo) {
      const opp = room.members?.find(m => m.user_id !== currentUser.id);
      return opp?.user;
    }
    return null;
  };

  const getRoomDisplayName = (room: ChatRoom | undefined | null) => {
    if (!room) return 'SYSTEM';
    if (room.is_grupo) {
      return room.nombre || 'GROUP COMMS CHANNEL';
    }
    const opp = getOpponent(room);
    return opp?.username || 'DIRECT LINK';
  };

  const roomOpponents = new Set(
    rooms.map(room => {
      const opp = getOpponent(room);
      return opp?.id;
    }).filter(Boolean)
  );

  const filteredRooms = searchQuery.trim() === ''
    ? rooms
    : rooms.filter(room => 
        getRoomDisplayName(room).toLowerCase().includes(searchQuery.toLowerCase())
      );

  const filteredAvailable = searchQuery.trim() === ''
    ? []
    : availablePilots.filter(pilot => 
        pilot.id !== currentUser.id &&
        !roomOpponents.has(pilot.id) &&
        pilot.username.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="flex border border-outline-variant bg-[#121212] h-[calc(100vh-140px)] min-h-[450px] font-mono header-notch overflow-hidden">
      <aside className="w-full md:w-80 border-r border-outline-variant/30 flex flex-col h-full bg-[#131313]/60">
        <header className="p-4 border-b border-outline-variant/30 shrink-0">
          <h3 className="text-[14px] font-black text-secondary-container flex items-center gap-2 uppercase tracking-wide">
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Comms Channel
          </h3>
        </header>

        <div className="p-3 border-b border-outline-variant/20 shrink-0">
          <div className="relative">
            <input 
              type="text" 
              placeholder="SEARCH PILOTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-outline-variant/40 text-[11px] p-2 pl-8 outline-none focus:border-secondary-container transition-colors font-mono text-on-surface uppercase placeholder:text-on-surface-variant/40"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[14px] text-on-surface-variant">search</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {loadingRooms ? (
            <div className="text-center py-8 text-on-surface-variant text-[11px] uppercase">
              SCANNING COMMS CHANNELS...
            </div>
          ) : searchQuery.trim() !== '' && filteredRooms.length === 0 && filteredAvailable.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant text-[11px] uppercase">
              NO PILOTS DETECTED
            </div>
          ) : (
            <>
              {filteredRooms.length > 0 && (
                <div className="space-y-1">
                  {searchQuery.trim() !== '' && (
                    <div className="text-[9px] text-on-surface-variant uppercase font-bold px-2 mb-1">
                      ACTIVE COMMS
                    </div>
                  )}
                  {filteredRooms.map((room) => {
                    const opp = getOpponent(room);
                    const isSelected = room.id === activeRoomId;
                    const lastMsg = room.messages && room.messages[0];
                    return (
                      <div
                        key={room.id}
                        onClick={() => {
                          setActiveRoomId(room.id);
                          if (searchQuery) setSearchQuery('');
                        }}
                        className={`p-3 border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-secondary-container/15 border-secondary-container text-on-surface'
                            : 'bg-[#151515] border-outline-variant/40 hover:border-on-surface-variant text-on-surface-variant'
                        }`}
                      >
                        {room.is_grupo ? (
                          <div className="w-10 h-10 rounded-full border border-outline bg-[#20201f] flex items-center justify-center text-secondary-container shrink-0">
                            <span className="material-symbols-outlined text-[20px]">groups</span>
                          </div>
                        ) : (
                          <img
                            src={opp?.foto_perfil || DEFAULT_AVATAR}
                            alt={opp?.username || 'Pilot'}
                            className="w-10 h-10 rounded-full border border-outline object-cover bg-[#20201f] shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-[13px] truncate uppercase text-on-surface">
                              {getRoomDisplayName(room)}
                            </span>
                            {!room.is_grupo && opp?.rango && (
                              <span className="text-[9px] border border-tertiary/40 bg-tertiary/10 text-tertiary-fixed px-1 font-bold">
                                {opp.rango}
                              </span>
                            )}
                            {room.is_grupo && (
                              <span className="text-[9px] border border-secondary-container/40 bg-secondary-container/10 text-secondary-container px-1 font-bold">
                                GROUP
                              </span>
                            )}
                          </div>
                          {lastMsg && (
                            <p className="text-[10px] text-on-surface-variant truncate mt-0.5">
                              {lastMsg.contenido}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredAvailable.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[9px] text-on-surface-variant uppercase font-bold px-2 mb-1">
                    START NEW COMMS
                  </div>
                  {filteredAvailable.map((pilot) => (
                    <div
                      key={pilot.id}
                      onClick={() => handleStartNewChat(pilot.id)}
                      className="p-3 border cursor-pointer bg-[#151515] border-outline-variant/40 hover:border-on-surface-variant text-on-surface-variant transition-all flex items-center gap-3"
                    >
                      <img
                        src={pilot.foto_perfil || DEFAULT_AVATAR}
                        alt={pilot.username}
                        className="w-10 h-10 rounded-full border border-outline object-cover bg-[#20201f]"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-[13px] truncate uppercase">
                            {pilot.username}
                          </span>
                          <span className="text-[9px] border border-tertiary/40 bg-tertiary/10 text-tertiary-fixed px-1 font-bold">
                            {pilot.rango}
                          </span>
                        </div>
                        <p className="text-[10px] text-secondary-container font-mono mt-0.5">
                          TAP TO INITIATE LINK
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      <section className="hidden md:flex flex-col flex-1 h-full bg-[#0d0d0d]">
        {activeRoomId ? (
          <>
            <header className="p-4 border-b border-outline-variant/30 bg-[#131313]/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-[14px] uppercase text-on-surface">
                  {getOpponent(rooms.find(r => r.id === activeRoomId))?.username || 'SYSTEM'}
                </h3>
                <span className="w-2 h-2 rounded-full bg-secondary-container shadow-[0_0_8px_#00e3fd] animate-pulse" />
              </div>
              {(() => {
                const activeRoom = rooms.find(r => r.id === activeRoomId);
                const opponent = getOpponent(activeRoom);
                if (activeRoom && !activeRoom.is_grupo && opponent) {
                  return (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="bg-primary-container hover:bg-primary text-on-primary-container font-mono text-[10px] font-bold px-3 py-1.5 skew-x-[-12deg] transition-all cursor-pointer select-none"
                    >
                      <span className="skew-x-[12deg] block flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[13px]">sports_score</span>
                        RETAR AL PILOTO
                      </span>
                    </button>
                  );
                }
                return null;
              })()}
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingHistory ? (
                <div className="text-center py-24 text-on-surface-variant text-[11px] uppercase">
                  RETRIEVING HISTORICAL COMMS...
                </div>
              ) : messages.length === 0 ? (
                <div className="py-24 text-center text-on-surface-variant text-[11px] uppercase">
                  COMMS INTERCEPT ESTABLISHED. TRANSMIT MESSAGE.
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === currentUser.id;
                  const challengeMatch = msg.contenido.match(/\[CHALLENGE_INVITE:([a-zA-Z0-9-]+)\]/);
                  const isChallengeInvite = !!challengeMatch;
                  const challengeId = challengeMatch ? challengeMatch[1] : null;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <span className="text-[8px] text-on-surface-variant uppercase mb-1">
                        {isMe ? 'YOU' : msg.sender.username.toUpperCase()}
                      </span>
                      {isChallengeInvite && challengeId ? (
                        <div
                          className={`p-4 text-[12px] border flex flex-col gap-2 font-mono ${
                            isMe
                              ? 'bg-primary-container/10 border-primary-container/40 text-on-surface rounded-tl-lg rounded-br-lg shadow-[0_0_12px_rgba(255,87,25,0.08)]'
                              : 'bg-[#1e1411] border-[#ff5719]/40 text-on-surface-variant rounded-tr-lg rounded-bl-lg'
                          }`}
                        >
                          <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                            <span className="material-symbols-outlined text-primary-container text-[18px]">sports_score</span>
                            <span className="font-bold uppercase tracking-wider text-primary-container">INVITACIÓN A RETO</span>
                          </div>
                          <p className="text-[11px] text-on-surface-variant mt-1">
                            {isMe 
                              ? 'Has enviado una invitación de carrera.' 
                              : 'Te ha desafiado a una carrera de velocidad.'
                            }
                          </p>
                          <button
                            type="button"
                            onClick={() => handleOpenChallengeDetail(challengeId)}
                            className="mt-1 bg-[#ff5719] hover:bg-primary text-on-primary-container font-bold px-3 py-1.5 text-[10px] skew-x-[-12deg] transition-all cursor-pointer self-start"
                          >
                            <span className="skew-x-[12deg] block flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">visibility</span>
                              VER DETALLES
                            </span>
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`p-3 text-[12px] border ${
                            isMe
                              ? 'bg-secondary-container/10 border-secondary-container/40 text-on-surface rounded-tl-lg rounded-br-lg'
                              : 'bg-[#181818] border-outline-variant/50 text-on-surface-variant rounded-tr-lg rounded-bl-lg'
                          }`}
                        >
                          {msg.contenido}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {opponentTyping && typingUser && (
              <div className="px-4 py-1.5 text-[9px] text-secondary-container animate-pulse uppercase shrink-0">
                {typingUser.toUpperCase()} IS TRANSMITTING COMMS...
              </div>
            )}

            <form onSubmit={handleSendMessage} className="p-4 border-t border-outline-variant/30 bg-[#131313]/60 flex gap-2 shrink-0">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter transmission..."
                className="flex-1 bg-[#0d0d0d] border border-outline-variant/50 text-[13px] p-2.5 outline-none focus:border-secondary-container transition-colors font-mono"
              />
              <button
                type="submit"
                className="bg-secondary-container hover:bg-secondary-fixed text-on-secondary font-mono text-[11px] font-bold px-5 py-2.5 skew-x-[-12deg] cursor-pointer"
              >
                <span className="skew-x-[12deg] block">SEND</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center font-mono text-[12px] text-on-surface-variant uppercase">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-3">terminal</span>
            <p>AWAITING COMMS LOCK. SELECT TRANSMISSION CHANNEL FROM THE SIDEBAR.</p>
          </div>
        )}
      </section>

      {showInviteModal && currentUser && (
        <SelectChallengeModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          currentUser={currentUser}
          onSelect={(challengeId) => {
            socket.emit('send_message', {
              chatRoomId: activeRoomId,
              contenido: `[CHALLENGE_INVITE:${challengeId}]`
            });
          }}
        />
      )}

      {selectedDetailChallenge && currentUser && (
        <ChallengeDetailModal
          challenge={selectedDetailChallenge}
          currentUser={currentUser}
          onClose={() => setSelectedDetailChallenge(null)}
          onJoin={handleJoinChallenge}
        />
      )}
    </div>
  );
}
