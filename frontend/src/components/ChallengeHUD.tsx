import { useState, useEffect, useRef } from 'react';
import { socket, connectSocket, disconnectSocket } from '../services/socket';
import { createRoom, getChatHistory } from '../services/chat.service';
import type { ChatMessage } from '../services/chat.service';
import type { Challenge } from '../services/challenge.service';
import type { User } from '../services/auth.service';

interface ChallengeHUDProps {
  challenge: Challenge;
  currentUser: User;
  onClose: () => void;
}

interface GPSCoordinates {
  userId: string;
  username: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  timestamp: string;
}

export default function ChallengeHUD({ challenge, currentUser, onClose }: ChallengeHUDProps) {
  const isRetador = challenge.retador_id === currentUser.id;
  const opponent = isRetador ? challenge.retado : challenge.retador;
  const opponentId = (isRetador ? challenge.retado_id : challenge.retador_id) || '';

  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [opponentTyping, setOpponentTyping] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [myLat, setMyLat] = useState(6.2442);
  const [myLng, setMyLng] = useState(-75.5812);
  const [mySpeed, setMySpeed] = useState(0);
  const [myHeading, setMyHeading] = useState(0);
  
  const [rivalLocation, setRivalLocation] = useState<GPSCoordinates | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const simulationInterval = useRef<any>(null);
  const typingTimeout = useRef<any>(null);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; 
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      connectSocket(token);
    }

    const setupChat = async () => {
      try {
        const roomRes = await createRoom({ is_grupo: false, recipientId: opponentId });
        if (roomRes.success && roomRes.data) {
          const roomId = roomRes.data.id;
          setChatRoomId(roomId);
          
          socket.emit('join_room', { chatRoomId: roomId });
          socket.emit('join_location_sharing', { challengeId: challenge.id });

          const historyRes = await getChatHistory(roomId, { limit: 30 });
          if (historyRes.success) {
            setMessages(historyRes.data.messages);
          }
        }
      } catch (err) {
        setChatError('No se pudo establecer el enlace de comunicación.');
      }
    };

    setupChat();

    socket.on('new_message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('user_typing', (data: { chatRoomId: string; userId: string; isTyping: boolean }) => {
      if (data.userId === opponentId) {
        setOpponentTyping(data.isTyping);
      }
    });

    socket.on('location_updated', (data: GPSCoordinates) => {
      if (data.userId === opponentId) {
        setRivalLocation(data);
      }
    });

    socket.on('player_joined_location', () => {
      
      shareLocation(myLat, myLng, mySpeed, myHeading);
    });

    return () => {
      if (chatRoomId) {
        socket.emit('leave_room', { chatRoomId });
        socket.emit('leave_location_sharing', { challengeId: challenge.id });
      }
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('location_updated');
      socket.off('player_joined_location');
      disconnectSocket();

      if (simulationInterval.current) clearInterval(simulationInterval.current);
    };
  }, [chatRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (rivalLocation) {
      const dist = calculateDistance(myLat, myLng, rivalLocation.lat, rivalLocation.lng);
      setDistanceMeters(dist);
    }
  }, [myLat, myLng, rivalLocation]);

  const shareLocation = (lat: number, lng: number, speed: number, heading: number) => {
    socket.emit('update_location', {
      challengeId: challenge.id,
      lat,
      lng,
      speed,
      heading
    });
  };

  const startSimulation = () => {
    if (isSimulating) {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
      setIsSimulating(false);
      setMySpeed(0);
      shareLocation(myLat, myLng, 0, myHeading);
      return;
    }

    setIsSimulating(true);
    let lat = myLat;
    let lng = myLng;
    let heading = myHeading;

    simulationInterval.current = setInterval(() => {
      
      const speedKmh = Math.floor(Math.random() * (260 - 180 + 1)) + 180; 
      const speedMps = speedKmh / 3.6; 
      
      const latChange = (Math.cos((heading * Math.PI) / 180) * speedMps) / 111000;
      const lngChange = (Math.sin((heading * Math.PI) / 180) * speedMps) / (111000 * Math.cos((lat * Math.PI) / 180));
      
      lat += latChange;
      lng += lngChange;
      heading = (heading + (Math.random() * 20 - 10) + 360) % 360; 

      setMyLat(lat);
      setMyLng(lng);
      setMySpeed(speedKmh);
      setMyHeading(Math.round(heading));

      shareLocation(lat, lng, speedKmh, Math.round(heading));
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatRoomId) return;

    socket.emit('send_message', {
      chatRoomId,
      contenido: newMessage.trim()
    });
    setNewMessage('');
    
    socket.emit('typing', { chatRoomId, isTyping: false });
  };

  const handleInputChange = (val: string) => {
    setNewMessage(val);
    if (!chatRoomId) return;

    socket.emit('typing', { chatRoomId, isTyping: true });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing', { chatRoomId, isTyping: false });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0e0e]/95 backdrop-blur-lg flex flex-col font-mono text-on-surface select-none">
      
      <header className="h-16 border-b border-outline-variant/30 flex items-center justify-between px-6 bg-surface/50 backdrop-blur-md relative shrink-0">
        <div className="absolute top-0 left-0 w-24 h-[2px] bg-secondary-container shadow-[0_0_8px_#00e3fd]" />
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary-container shadow-[0_0_10px_#00e3fd] animate-ping" />
          <h2 
            className="text-[18px] md:text-[22px] italic text-[#ff5719] font-black uppercase tracking-wider"
            style={{ fontFamily: '"Anybody", sans-serif' }}
          >
            ACTIVE TELEMETRY LINK
          </h2>
          <span className="border border-outline-variant px-2 py-0.5 text-[9px] text-on-surface-variant font-bold">
            CHALLENGE_ID: {challenge.id.substring(0, 8).toUpperCase()}
          </span>
        </div>
        
        <button 
          onClick={onClose}
          className="bg-transparent border border-error hover:bg-error/10 text-error font-mono text-[10px] font-bold px-4 py-2 btn-notch cursor-pointer select-none transition-colors"
        >
          ABORT HUD CONNECTION
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden">
        
        <section className="xl:col-span-4 border-r border-outline-variant/30 flex flex-col h-full bg-[#121212]/50">
          <div className="p-4 border-b border-outline-variant/30 bg-[#131313]/60 flex items-center justify-between shrink-0">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-secondary-container flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
              LIVE COMMS LINK
            </h3>
            <span className="text-[9px] text-on-surface-variant uppercase">
              RIVAL: {opponent?.username.toUpperCase()}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatError && (
              <div className="border border-error bg-error/10 p-3 text-[10px] text-error text-center uppercase">
                {chatError}
              </div>
            )}
            
            {messages.length === 0 ? (
              <div className="py-24 text-center text-on-surface-variant text-[11px] uppercase">
                Comms channel quiet. Awaiting transmission...
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === currentUser.id;
                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <span className="text-[8px] text-on-surface-variant uppercase mb-1">
                      {isMe ? 'YOU' : msg.sender.username.toUpperCase()} • R{msg.sender.rango}
                    </span>
                    <div 
                      className={`p-3 text-[12px] border ${
                        isMe 
                          ? 'bg-secondary-container/10 border-secondary-container/40 text-on-surface rounded-tl-lg rounded-br-lg' 
                          : 'bg-[#181818] border-outline-variant/50 text-on-surface-variant rounded-tr-lg rounded-bl-lg'
                      }`}
                    >
                      {msg.contenido}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {opponentTyping && (
            <div className="px-4 py-1.5 text-[9px] text-secondary-container animate-pulse uppercase">
              {opponent?.username.toUpperCase()} IS TRANSMITTING COMMS...
            </div>
          )}

          <form onSubmit={handleSendMessage} className="p-4 border-t border-outline-variant/30 bg-[#131313]/60 flex gap-2 shrink-0">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter comms transmission..."
              className="flex-1 bg-[#0d0d0d] border border-outline-variant/50 text-[13px] p-2.5 outline-none focus:border-secondary-container transition-colors font-mono"
            />
            <button 
              type="submit"
              className="bg-secondary-container hover:bg-secondary-fixed text-on-secondary font-mono text-[11px] font-bold px-4 py-2.5 skew-x-[-12deg] cursor-pointer"
            >
              <span className="skew-x-[12deg] block">SEND</span>
            </button>
          </form>
        </section>

        <section className="xl:col-span-8 flex flex-col h-full overflow-hidden p-6 gap-6 justify-between bg-asphalt">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
            
            <div className="bg-[#121212] border border-outline-variant/30 p-4 header-notch relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-secondary-container shadow-[0_0_8px_#00e3fd]" />
              <div className="pl-3">
                <span className="text-[9px] text-on-surface-variant uppercase font-bold">PILOT RIG TELEMETRY (YOU)</span>
                <h4 className="text-[16px] font-black text-on-surface mt-1 uppercase" style={{ fontFamily: '"Anybody", sans-serif' }}>
                  {currentUser.username}
                </h4>
                
                <div className="flex items-end gap-6 mt-4">
                  <div>
                    <span className="text-[8px] text-on-surface-variant uppercase font-bold block">Live Velocity</span>
                    <span className="text-[32px] font-black italic text-secondary-container" style={{ fontFamily: '"Anybody", sans-serif' }}>
                      {mySpeed}
                    </span>
                    <span className="text-[11px] text-outline ml-1">KM/H</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-on-surface-variant uppercase font-bold block">Heading Direction</span>
                    <span className="text-[18px] font-black italic text-on-surface">
                      {myHeading}°
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-[7px] text-on-surface-variant mb-1 font-bold">
                    <span>ENGINE RPM</span>
                    <span>{mySpeed > 0 ? Math.floor(4000 + Math.random() * 3500) : 1000} RPM</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0d0d0d] border border-outline-variant/30 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-secondary-container via-primary-container to-error transition-all duration-300"
                      style={{ width: `${mySpeed > 0 ? Math.min(50 + (mySpeed / 2.6), 100) : 12}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#121212] border border-outline-variant/30 p-4 header-notch relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#ff5719] shadow-[0_0_8px_#ff5719]" />
              <div className="pl-3">
                <span className="text-[9px] text-on-surface-variant uppercase font-bold">RIVAL PILOT TELEMETRY</span>
                <h4 className="text-[16px] font-black text-on-surface mt-1 uppercase" style={{ fontFamily: '"Anybody", sans-serif' }}>
                  {opponent?.username || 'AWAITING RIVAL...'}
                </h4>
                
                {rivalLocation ? (
                  <div className="flex items-end gap-6 mt-4">
                    <div>
                      <span className="text-[8px] text-on-surface-variant uppercase font-bold block">Live Velocity</span>
                      <span className="text-[32px] font-black italic text-[#ff5719]" style={{ fontFamily: '"Anybody", sans-serif' }}>
                        {rivalLocation.speed}
                      </span>
                      <span className="text-[11px] text-outline ml-1">KM/H</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-on-surface-variant uppercase font-bold block">Heading Direction</span>
                      <span className="text-[18px] font-black italic text-on-surface">
                        {rivalLocation.heading}°
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-on-surface-variant text-[11px] uppercase animate-pulse">
                    LINKING TRANSPONDER BEACON...
                  </div>
                )}

                {rivalLocation && (
                  <div className="mt-4">
                    <div className="flex justify-between text-[7px] text-on-surface-variant mb-1 font-bold">
                      <span>ENGINE RPM</span>
                      <span>{rivalLocation.speed > 0 ? Math.floor(4000 + Math.random() * 3200) : 1000} RPM</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0d0d0d] border border-outline-variant/30 rounded overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#ff5719] to-error transition-all duration-300"
                        style={{ width: `${rivalLocation.speed > 0 ? Math.min(50 + (rivalLocation.speed / 2.6), 100) : 12}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="flex-1 border border-outline-variant/30 bg-[#0e0e0e] relative flex items-center justify-center p-6 header-notch min-h-[220px]">
            
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_95%)] pointer-events-none z-10" />
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                backgroundSize: '30px 30px'
              }}
            />
            
            {isSimulating && (
              <div className="absolute w-[90%] h-[90%] border border-secondary-container/10 rounded-full animate-pulse pointer-events-none flex items-center justify-center">
                <div className="w-3/4 h-3/4 border border-secondary-container/5 rounded-full" />
                <div className="w-1/2 h-1/2 border border-secondary-container/5 rounded-full" />
              </div>
            )}

            <div className="z-10 w-full max-w-lg flex flex-col gap-6 font-mono relative">
              <div className="flex justify-between text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                <span>Racetrack: Medellín Docks</span>
                <span>Distance Margin</span>
              </div>

              <div className="h-16 relative bg-[#131313]/90 border border-outline-variant/50 p-4 flex items-center">
                <div className="absolute inset-x-0 h-0.5 bg-outline-variant/50" />
                
                <div className="absolute left-4 top-2 text-[8px] text-outline font-bold">START</div>
                <div className="absolute right-4 top-2 text-[8px] text-primary-container font-bold">FINISH</div>

                <div 
                  className="absolute transition-all duration-1000 flex flex-col items-center gap-1 shrink-0 z-20"
                  style={{ left: `${isSimulating ? '45%' : '15%'}` }}
                >
                  <span className="material-symbols-outlined text-secondary-container text-[20px] shadow-[0_0_8px_#00e3fd]">
                    navigation
                  </span>
                  <span className="text-[8px] bg-secondary-container/90 text-on-secondary px-1 text-[8px] uppercase select-none font-bold">YOU</span>
                </div>

                <div 
                  className="absolute transition-all duration-1000 flex flex-col items-center gap-1 shrink-0 z-20"
                  style={{ left: `${isSimulating ? (rivalLocation ? '48%' : '20%') : '25%'}` }}
                >
                  <span 
                    className="material-symbols-outlined text-[#ff5719] text-[20px] shadow-[0_0_8px_#ff5719] rotate-45"
                  >
                    navigation
                  </span>
                  <span className="text-[8px] bg-[#ff5719]/90 text-on-primary-container px-1 text-[8px] uppercase select-none font-bold">RIVAL</span>
                </div>
              </div>

              <div className="text-center mt-2">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Estimated Delta Distance</p>
                <h3 className="text-[28px] font-black italic text-[#ff5719]" style={{ fontFamily: '"Anybody", sans-serif' }}>
                  {distanceMeters !== null && isSimulating ? `${distanceMeters} METERS` : 'CALIBRATING LINK...'}
                </h3>
              </div>
            </div>

          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#121212] border border-outline-variant/30 p-4 shrink-0">
            <div>
              <span className="text-[9px] text-on-surface-variant uppercase font-bold block">Live GPS Transponder sharing</span>
              <p className="text-[11px] text-[#e6beb2] italic uppercase">
                {isSimulating ? 'TRANSMITTING CONTINUOUS TELEMETRY...' : 'TRANSPONDER SHUTDOWN. STANDBY.'}
              </p>
            </div>
            
            <button
              onClick={startSimulation}
              className={`font-mono text-[11px] font-bold px-6 py-3 skew-x-[-12deg] cursor-pointer transition-all flex items-center gap-2 select-none ${
                isSimulating 
                  ? 'bg-transparent border-2 border-[#ff5719] text-[#ff5719] hover:bg-[#ff5719]/10' 
                  : 'bg-primary-container hover:bg-primary text-on-primary-container glow-primary'
              }`}
            >
              <span className="skew-x-[12deg] flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">
                  {isSimulating ? 'portable_wifi_off' : 'wifi'}
                </span>
                {isSimulating ? 'STOP BEACON SIMULATION' : 'START LIVE GPS SIMULATION'}
              </span>
            </button>
          </div>

        </section>

      </div>

    </div>
  );
}
