import React, { useState, useEffect } from 'react';
import { listAllUsers, adminUpdateUser, adminDeleteUser } from '../../services/user.service';
import type { UserAdmin } from '../../services/user.service';
import { adminListAllChallenges, adminDeleteChallenge, createChallenge } from '../../services/challenge.service';
import type { ChallengeAdmin } from '../../services/challenge.service';
import { adminListAllVehicles, adminDeleteVehicle } from '../../services/vehicle.service';
import type { VehicleAdmin } from '../../services/vehicle.service';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'pilotos' | 'retos' | 'garaje'>('pilotos');

  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAdmin | null>(null);
  const [editRango, setEditRango] = useState('');
  const [editRol, setEditRol] = useState('');
  const [editEstado, setEditEstado] = useState('');
  const [updatingUser, setUpdatingUser] = useState(false);

  const [challenges, setChallenges] = useState<ChallengeAdmin[]>([]);
  const [challengePage, setChallengePage] = useState(1);
  const [challengeTotalPages, setChallengeTotalPages] = useState(1);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [challengeSearch, setChallengeSearch] = useState('');
  const [challengeSearchInput, setChallengeSearchInput] = useState('');

  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [newTipoCarrera, setNewTipoCarrera] = useState('Drag');
  const [newUbicacion, setNewUbicacion] = useState('');
  const [newFecha, setNewFecha] = useState('');
  const [newNotas, setNewNotas] = useState('');
  const [creatingChallenge, setCreatingChallenge] = useState(false);

  const [vehicles, setVehicles] = useState<VehicleAdmin[]>([]);
  const [vehiclePage, setVehiclePage] = useState(1);
  const [vehicleTotalPages, setVehicleTotalPages] = useState(1);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleSearchInput, setVehicleSearchInput] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadUsers = async (page: number) => {
    setUsersLoading(true);
    setError(null);
    try {
      const res = await listAllUsers(page, 10);
      if (res.success) {
        setUsers(res.data.users);
        setUserTotalPages(res.data.pagination.totalPages);
        setUserPage(res.data.pagination.page);
      } else {
        setError(res.error || 'Error loading users');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load user console');
    } finally {
      setUsersLoading(false);
    }
  };

  const loadChallenges = async (page: number, searchVal?: string) => {
    setChallengesLoading(true);
    setError(null);
    try {
      const res = await adminListAllChallenges(page, 10, searchVal);
      if (res.success) {
        setChallenges(res.data.challenges);
        setChallengeTotalPages(res.data.pagination.totalPages);
        setChallengePage(res.data.pagination.page);
      } else {
        setError(res.error || 'Error loading challenges');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load challenges console');
    } finally {
      setChallengesLoading(false);
    }
  };

  const loadVehicles = async (page: number, searchVal?: string) => {
    setVehiclesLoading(true);
    setError(null);
    try {
      const res = await adminListAllVehicles(page, 10, searchVal);
      if (res.success) {
        setVehicles(res.data.vehicles);
        setVehicleTotalPages(res.data.pagination.totalPages);
        setVehiclePage(res.data.pagination.page);
      } else {
        setError(res.error || 'Error loading vehicles');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load vehicles console');
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleOpenCreateChallenge = () => {
    setShowCreateChallengeModal(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCreateChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingChallenge(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await createChallenge({
        tipo_carrera: newTipoCarrera,
        ubicacion_acordada: newUbicacion,
        fecha_acordada: newFecha ? new Date(newFecha).toISOString() : null,
        notas: newNotas || undefined
      });
      if (res.success) {
        setSuccessMessage('CHALLENGE CONFIGURATION DEPLOYED SUCCESSFULLY');
        setShowCreateChallengeModal(false);
        setNewUbicacion('');
        setNewFecha('');
        setNewNotas('');
        loadChallenges(challengePage, challengeSearch);
      } else {
        setError(res.error || 'Error creating challenge');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to inject challenge sequence');
    } finally {
      setCreatingChallenge(false);
    }
  };

  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
    if (activeTab === 'pilotos') {
      loadUsers(userPage);
    } else if (activeTab === 'retos') {
      loadChallenges(challengePage, challengeSearch);
    } else if (activeTab === 'garaje') {
      loadVehicles(vehiclePage, vehicleSearch);
    }
  }, [activeTab]);

  const handleEditUserClick = (user: UserAdmin) => {
    setEditingUser(user);
    setEditRango(user.rango || 'D');
    setEditRol(user.rol || 'piloto');
    setEditEstado(user.estado || 'activo');
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdatingUser(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await adminUpdateUser(editingUser.id, {
        rango: editRango,
        rol: editRol,
        estado: editEstado
      });
      if (res.success) {
        setSuccessMessage('PILOT CONFIGURATION UPDATED SUCCESSFULLY');
        setEditingUser(null);
        loadUsers(userPage);
      } else {
        setError(res.error || 'Error updating user');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to apply configuration override');
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleDeleteUserClick = async (id: string, username: string) => {
    if (!window.confirm(`CONFIRM HARD DELETION FOR PILOT: ${username.toUpperCase()}?\nTHIS WILL PURGE ALL RETOS AND CANNOT BE UNDONE.`)) {
      return;
    }
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await adminDeleteUser(id);
      if (res.success) {
        setSuccessMessage(`PILOT ${username.toUpperCase()} DELETED AND RECORD PURGED`);
        const nextPage = users.length === 1 && userPage > 1 ? userPage - 1 : userPage;
        loadUsers(nextPage);
      } else {
        setError(res.error || 'Error deleting user');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed user termination command');
    }
  };

  const handleDeleteChallengeClick = async (id: string) => {
    if (!window.confirm('ABORT & DELETE THIS CHALLENGE RECORD PERMANENTLY?')) {
      return;
    }
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await adminDeleteChallenge(id);
      if (res.success) {
        setSuccessMessage('CHALLENGE RECORD DELETED & ANNULLMENT LOGGED');
        const nextPage = challenges.length === 1 && challengePage > 1 ? challengePage - 1 : challengePage;
        loadChallenges(nextPage, challengeSearch);
      } else {
        setError(res.error || 'Error deleting challenge');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed challenge deletion command');
    }
  };

  const handleDeleteVehicleClick = async (id: string, brand: string | null, model: string | null, owner: string) => {
    const carName = `${brand || ''} ${model || ''}`.trim() || 'VEHICLE';
    if (!window.confirm(`DISMANTLE & SCRAP ${carName.toUpperCase()} FROM ${owner.toUpperCase()}'S GARAGE?\nTHIS WILL ALSO REMOVE ALL CHALLENGES FEATURING THIS VEHICLE.`)) {
      return;
    }
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await adminDeleteVehicle(id);
      if (res.success) {
        setSuccessMessage('VEHICLE DISMANTLED & SCRAPPED FROM GLOBAL REGISTRY');
        const nextPage = vehicles.length === 1 && vehiclePage > 1 ? vehiclePage - 1 : vehiclePage;
        loadVehicles(nextPage, vehicleSearch);
      } else {
        setError(res.error || 'Error deleting vehicle');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed vehicle scrap command');
    }
  };

  const handleChallengeSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChallengeSearch(challengeSearchInput);
    loadChallenges(1, challengeSearchInput);
  };

  const handleVehicleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVehicleSearch(vehicleSearchInput);
    loadVehicles(1, vehicleSearchInput);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-2 gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="text-[24px] md:text-[32px] italic uppercase text-primary-container font-black flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-container text-3xl">admin_panel_settings</span>
            ADMIN CONSOLE
          </h2>
          <p className="font-mono text-[11px] text-on-surface-variant mt-1 uppercase tracking-wider">
            SYSTEM CONTROL LAYER 
          </p>
        </div>
      </div>

      {error && (
        <div className="border border-error bg-error/10 p-4 font-mono text-[13px] text-[#ffb4ab]">
          <span className="font-bold">SYSTEM ERROR:</span> {error.toUpperCase()}
        </div>
      )}

      {successMessage && (
        <div className="border border-secondary-container bg-secondary-container/10 p-4 font-mono text-[13px] text-secondary-container animate-pulse">
          <span className="font-bold">SUCCESS:</span> {successMessage.toUpperCase()}
        </div>
      )}

      <div className="flex border-b border-outline-variant/30 gap-2 font-mono">
        <button
          onClick={() => setActiveTab('pilotos')}
          className={`px-6 py-2.5 uppercase font-bold text-[12px] skew-x-[-12deg] transition-all border-t border-x border-transparent ${
            activeTab === 'pilotos'
              ? 'bg-surface-container text-secondary-container border-outline-variant/50 border-b-[#1e1e1e]'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/30'
          }`}
        >
          <span className="skew-x-[12deg] block flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">groups</span>
            PILOTOS
          </span>
        </button>

        <button
          onClick={() => setActiveTab('retos')}
          className={`px-6 py-2.5 uppercase font-bold text-[12px] skew-x-[-12deg] transition-all border-t border-x border-transparent ${
            activeTab === 'retos'
              ? 'bg-surface-container text-secondary-container border-outline-variant/50 border-b-[#1e1e1e]'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/30'
          }`}
        >
          <span className="skew-x-[12deg] block flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">sports_score</span>
            RETOS GLOBAL
          </span>
        </button>

        <button
          onClick={() => setActiveTab('garaje')}
          className={`px-6 py-2.5 uppercase font-bold text-[12px] skew-x-[-12deg] transition-all border-t border-x border-transparent ${
            activeTab === 'garaje'
              ? 'bg-surface-container text-secondary-container border-outline-variant/50 border-b-[#1e1e1e]'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/30'
          }`}
        >
          <span className="skew-x-[12deg] block flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">directions_car</span>
            GARAJE GLOBAL
          </span>
        </button>
      </div>

      <div className="bg-surface-container border border-outline-variant/40 p-6 relative header-notch">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff5719]" />

        {activeTab === 'pilotos' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[16px] italic font-black text-on-surface uppercase font-mono">
                REGISTRY: PILOTOS
              </h3>
            </div>

            {usersLoading ? (
              <div className="flex justify-center items-center py-12">
                <span className="material-symbols-outlined text-secondary-container text-[36px] animate-spin">
                  sync
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-outline-variant/20 text-left font-mono text-[12px] bg-[#141413]">
                  <thead>
                    <tr className="bg-[#1f1f1e] text-primary-container border-b border-outline-variant/30">
                      <th className="p-3 uppercase font-black tracking-wider">PILOTO</th>
                      <th className="p-3 uppercase font-black tracking-wider">EMAIL</th>
                      <th className="p-3 uppercase font-black tracking-wider text-center">RANGO</th>
                      <th className="p-3 uppercase font-black tracking-wider">ROL</th>
                      <th className="p-3 uppercase font-black tracking-wider">ESTADO</th>
                      <th className="p-3 uppercase font-black tracking-wider text-right">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                          NO ACTIVE USERS FOUND IN CORE REGISTRY
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-outline-variant/10 hover:bg-surface-container-high/40 transition-colors"
                        >
                          <td className="p-3 font-bold uppercase text-on-surface">{user.username}</td>
                          <td className="p-3 text-on-surface-variant">{user.email}</td>
                          <td className="p-3 text-center">
                            <span className="bg-[#2a2a29] text-primary-container border border-primary-container/40 px-2 py-0.5 text-[11px] font-bold">
                              {user.rango || 'D'}
                            </span>
                          </td>
                          <td className="p-3 uppercase font-bold text-on-surface-variant">
                            {user.rol}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                                user.estado === 'activo'
                                  ? 'border-secondary-container/50 bg-secondary-container/10 text-secondary-container'
                                  : 'border-error/50 bg-error/10 text-error'
                              }`}
                            >
                              {user.estado}
                            </span>
                          </td>
                          <td className="p-3 text-right flex justify-end gap-2">
                            <button
                              onClick={() => handleEditUserClick(user)}
                              className="bg-transparent border border-secondary-container hover:bg-secondary-container/10 text-secondary-container font-bold px-3 py-1 text-[10px] skew-x-[-12deg] cursor-pointer"
                            >
                              <span className="skew-x-[12deg] block">EDIT</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUserClick(user.id, user.username)}
                              className="bg-transparent border border-error hover:bg-error/10 text-error font-bold px-3 py-1 text-[10px] skew-x-[-12deg] cursor-pointer"
                            >
                              <span className="skew-x-[12deg] block">TERMINATE</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {userTotalPages > 1 && (
              <div className="flex justify-between items-center font-mono mt-4">
                <button
                  disabled={userPage <= 1 || usersLoading}
                  onClick={() => loadUsers(userPage - 1)}
                  className="bg-transparent border border-outline-variant hover:bg-surface-container text-on-surface disabled:opacity-30 px-4 py-1.5 text-[11px] skew-x-[-12deg] cursor-pointer"
                >
                  <span className="skew-x-[12deg] block">PREV</span>
                </button>
                <span className="text-[11px] text-on-surface-variant uppercase">
                  PAGE {userPage} OF {userTotalPages}
                </span>
                <button
                  disabled={userPage >= userTotalPages || usersLoading}
                  onClick={() => loadUsers(userPage + 1)}
                  className="bg-transparent border border-outline-variant hover:bg-surface-container text-on-surface disabled:opacity-30 px-4 py-1.5 text-[11px] skew-x-[-12deg] cursor-pointer"
                >
                  <span className="skew-x-[12deg] block">NEXT</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'retos' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-[16px] italic font-black text-on-surface uppercase font-mono">
                  REGISTRY: RETOS GLOBAL
                </h3>
                <button
                  onClick={handleOpenCreateChallenge}
                  className="flex items-center justify-center gap-1.5 bg-[#ff5719] hover:bg-[#ff5719]/80 text-[#521300] font-mono text-[10px] font-bold uppercase py-1.5 px-4 skew-x-[-12deg] transition-all cursor-pointer relative overflow-hidden group select-none"
                >
                  <span className="skew-x-[12deg] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    CREAR RETO
                  </span>
                </button>
              </div>
              <form onSubmit={handleChallengeSearchSubmit} className="flex gap-2 font-mono">
                <input
                  type="text"
                  placeholder="SEARCH PILOTS / VENUE"
                  value={challengeSearchInput}
                  onChange={(e) => setChallengeSearchInput(e.target.value)}
                  className="bg-[#141413] border border-outline-variant text-[12px] text-on-surface p-2 w-64 outline-none focus:border-primary-container"
                />
                <button
                  type="submit"
                  className="bg-primary-container text-on-primary-container font-bold px-4 py-2 text-[10px] skew-x-[-12deg] hover:bg-primary cursor-pointer select-none"
                >
                  <span className="skew-x-[12deg] block">SEARCH</span>
                </button>
              </form>
            </div>

            {challengesLoading ? (
              <div className="flex justify-center items-center py-12">
                <span className="material-symbols-outlined text-secondary-container text-[36px] animate-spin">
                  sync
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-outline-variant/20 text-left font-mono text-[12px] bg-[#141413]">
                  <thead>
                    <tr className="bg-[#1f1f1e] text-primary-container border-b border-outline-variant/30">
                      <th className="p-3 uppercase font-black tracking-wider">RETADOR</th>
                      <th className="p-3 uppercase font-black tracking-wider">RETADO</th>
                      <th className="p-3 uppercase font-black tracking-wider">MODALIDAD</th>
                      <th className="p-3 uppercase font-black tracking-wider">UBICACIÓN / FECHA</th>
                      <th className="p-3 uppercase font-black tracking-wider">ESTADO</th>
                      <th className="p-3 uppercase font-black tracking-wider text-right">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenges.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                          NO MATCHING CHALLENGES RECORDED
                        </td>
                      </tr>
                    ) : (
                      challenges.map((ch) => (
                        <tr
                          key={ch.id}
                          className="border-b border-outline-variant/10 hover:bg-surface-container-high/40 transition-colors"
                        >
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-on-surface uppercase">
                                {ch.retador?.username || 'DISPONIBLE'}
                              </span>
                              {ch.vehiculo_retador && (
                                <span className="text-[10px] text-on-surface-variant uppercase">
                                  {ch.vehiculo_retador.marca} {ch.vehiculo_retador.modelo}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-on-surface uppercase">
                                {ch.retado?.username || 'DISPONIBLE'}
                              </span>
                              {ch.vehiculo_retado && (
                                <span className="text-[10px] text-on-surface-variant uppercase">
                                  {ch.vehiculo_retado.marca} {ch.vehiculo_retado.modelo}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 uppercase text-on-surface">{ch.tipo_carrera}</td>
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="text-on-surface">{ch.ubicacion_acordada}</span>
                              <span className="text-[10px] text-on-surface-variant">
                                {ch.fecha_acordada
                                  ? new Date(ch.fecha_acordada).toLocaleString()
                                  : 'PENDIENTE'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                                ch.estado === 'completado'
                                  ? 'border-secondary-container/50 bg-secondary-container/10 text-secondary-container'
                                  : ch.estado === 'pendiente'
                                  ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500'
                                  : 'border-error/50 bg-error/10 text-error'
                              }`}
                            >
                              {ch.estado}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteChallengeClick(ch.id)}
                              className="bg-transparent border border-error hover:bg-error/10 text-error font-bold px-3 py-1 text-[10px] skew-x-[-12deg] cursor-pointer"
                            >
                              <span className="skew-x-[12deg] block">ABORT</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {challengeTotalPages > 1 && (
              <div className="flex justify-between items-center font-mono mt-4">
                <button
                  disabled={challengePage <= 1 || challengesLoading}
                  onClick={() => loadChallenges(challengePage - 1, challengeSearch)}
                  className="bg-transparent border border-outline-variant hover:bg-surface-container text-on-surface disabled:opacity-30 px-4 py-1.5 text-[11px] skew-x-[-12deg] cursor-pointer"
                >
                  <span className="skew-x-[12deg] block">PREV</span>
                </button>
                <span className="text-[11px] text-on-surface-variant uppercase">
                  PAGE {challengePage} OF {challengeTotalPages}
                </span>
                <button
                  disabled={challengePage >= challengeTotalPages || challengesLoading}
                  onClick={() => loadChallenges(challengePage + 1, challengeSearch)}
                  className="bg-transparent border border-outline-variant hover:bg-surface-container text-on-surface disabled:opacity-30 px-4 py-1.5 text-[11px] skew-x-[-12deg] cursor-pointer"
                >
                  <span className="skew-x-[12deg] block">NEXT</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'garaje' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h3 className="text-[16px] italic font-black text-on-surface uppercase font-mono">
                REGISTRY: GARAJE GLOBAL
              </h3>
              <form onSubmit={handleVehicleSearchSubmit} className="flex gap-2 font-mono">
                <input
                  type="text"
                  placeholder="SEARCH BRAND / OWNER"
                  value={vehicleSearchInput}
                  onChange={(e) => setVehicleSearchInput(e.target.value)}
                  className="bg-[#141413] border border-outline-variant text-[12px] text-on-surface p-2 w-64 outline-none focus:border-primary-container"
                />
                <button
                  type="submit"
                  className="bg-primary-container text-on-primary-container font-bold px-4 py-2 text-[10px] skew-x-[-12deg] hover:bg-primary cursor-pointer select-none"
                >
                  <span className="skew-x-[12deg] block">SEARCH</span>
                </button>
              </form>
            </div>

            {vehiclesLoading ? (
              <div className="flex justify-center items-center py-12">
                <span className="material-symbols-outlined text-secondary-container text-[36px] animate-spin">
                  sync
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-outline-variant/20 text-left font-mono text-[12px] bg-[#141413]">
                  <thead>
                    <tr className="bg-[#1f1f1e] text-primary-container border-b border-outline-variant/30">
                      <th className="p-3 uppercase font-black tracking-wider">PROPILOTO</th>
                      <th className="p-3 uppercase font-black tracking-wider">TIPO</th>
                      <th className="p-3 uppercase font-black tracking-wider">MARCA</th>
                      <th className="p-3 uppercase font-black tracking-wider">MODELO</th>
                      <th className="p-3 uppercase font-black tracking-wider">AÑO / PLACA</th>
                      <th className="p-3 uppercase font-black tracking-wider text-right">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                          NO VEHICLES REGISTERED IN SYSTEM
                        </td>
                      </tr>
                    ) : (
                      vehicles.map((v) => (
                        <tr
                          key={v.id}
                          className="border-b border-outline-variant/10 hover:bg-surface-container-high/40 transition-colors"
                        >
                          <td className="p-3 font-bold uppercase text-on-surface">
                            {v.user?.username}
                          </td>
                          <td className="p-3 uppercase text-on-surface-variant">
                            {v.tipo_vehiculo}
                          </td>
                          <td className="p-3 uppercase text-on-surface">{v.marca}</td>
                          <td className="p-3 uppercase text-on-surface">{v.modelo}</td>
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="text-on-surface">{v.año}</span>
                              <span className="text-[10px] text-on-surface-variant uppercase">
                                PLACA: {v.placa || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() =>
                                handleDeleteVehicleClick(
                                  v.id,
                                  v.marca,
                                  v.modelo,
                                  v.user?.username || 'PILOT'
                                )
                              }
                              className="bg-transparent border border-error hover:bg-error/10 text-error font-bold px-3 py-1 text-[10px] skew-x-[-12deg] cursor-pointer"
                            >
                              <span className="skew-x-[12deg] block">DISMANTLE</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {vehicleTotalPages > 1 && (
              <div className="flex justify-between items-center font-mono mt-4">
                <button
                  disabled={vehiclePage <= 1 || vehiclesLoading}
                  onClick={() => loadVehicles(vehiclePage - 1, vehicleSearch)}
                  className="bg-transparent border border-outline-variant hover:bg-surface-container text-on-surface disabled:opacity-30 px-4 py-1.5 text-[11px] skew-x-[-12deg] cursor-pointer"
                >
                  <span className="skew-x-[12deg] block">PREV</span>
                </button>
                <span className="text-[11px] text-on-surface-variant uppercase">
                  PAGE {vehiclePage} OF {vehicleTotalPages}
                </span>
                <button
                  disabled={vehiclePage >= vehicleTotalPages || vehiclesLoading}
                  onClick={() => loadVehicles(vehiclePage + 1, vehicleSearch)}
                  className="bg-transparent border border-outline-variant hover:bg-surface-container text-on-surface disabled:opacity-30 px-4 py-1.5 text-[11px] skew-x-[-12deg] cursor-pointer"
                >
                  <span className="skew-x-[12deg] block">NEXT</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-container border border-outline-variant p-6 relative max-w-md w-full header-notch shadow-[0_0_24px_rgba(255,87,25,0.15)] font-mono">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#ff5719]" />
            <h3 className="text-[18px] italic font-black text-primary-container uppercase mb-4">
              EDIT PILOT STATE
            </h3>
            <form onSubmit={handleUpdateUserSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase">
                  PILOT USERNAME
                </label>
                <input
                  type="text"
                  disabled
                  value={editingUser.username.toUpperCase()}
                  className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface/50 p-2.5 cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase">
                  RIVAL RATING (RANGO)
                </label>
                <select
                  value={editRango}
                  onChange={(e) => setEditRango(e.target.value)}
                  className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface p-2.5 outline-none focus:border-primary-container"
                >
                  <option value="S">S-RANK</option>
                  <option value="A">A-RANK</option>
                  <option value="B">B-RANK</option>
                  <option value="C">C-RANK</option>
                  <option value="D">D-RANK</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase">
                  SYSTEM SECURITY ACCESS ROLE
                </label>
                <select
                  value={editRol}
                  onChange={(e) => setEditRol(e.target.value)}
                  className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface p-2.5 outline-none focus:border-primary-container"
                >
                  <option value="piloto">PILOTO</option>
                  <option value="administrador">ADMINISTRADOR</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase">
                  PILOT STATUS
                </label>
                <select
                  value={editEstado}
                  onChange={(e) => setEditEstado(e.target.value)}
                  className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface p-2.5 outline-none focus:border-primary-container"
                >
                  <option value="activo">ACTIVE (ACTIVO)</option>
                  <option value="suspendido">SUSPENDED (SUSPENDIDO)</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-transparent border border-error hover:bg-error/10 text-error font-bold px-4 py-2 text-[11px] skew-x-[-12deg] cursor-pointer"
                >
                  <span className="skew-x-[12deg] block">CANCEL</span>
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="bg-primary-container text-on-primary-container font-bold px-5 py-2 text-[11px] skew-x-[-12deg] hover:bg-primary cursor-pointer disabled:opacity-50"
                >
                  <span className="skew-x-[12deg] block">
                    {updatingUser ? 'SAVING...' : 'APPLY'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#20201f] border border-outline-variant p-6 relative max-w-md w-full header-notch shadow-[0_0_24px_rgba(255,87,25,0.15)] font-mono">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#ff5719]" />
            <h3 className="text-[18px] italic font-black text-primary-container uppercase mb-4">
              CREAR RETO ADMINISTRATIVO
            </h3>
            <form onSubmit={handleCreateChallengeSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase">
                  MODALIDAD DE RETO (RACE CLASS)
                </label>
                <select
                  value={newTipoCarrera}
                  onChange={(e) => setNewTipoCarrera(e.target.value)}
                  className="bg-[#131313] border border-outline-variant text-[13px] text-on-surface p-2.5 outline-none focus:border-primary-container"
                >
                  <option value="Drag">DRAG (ACELERACIÓN)</option>
                  <option value="Circuito">CIRCUITO</option>
                  <option value="Sprint">SPRINT</option>
                  <option value="Drift">DRIFT</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase">
                  UBICACIÓN ACORDADA (SECTOR)
                </label>
                <input
                  type="text"
                  value={newUbicacion}
                  onChange={(e) => setNewUbicacion(e.target.value)}
                  required
                  placeholder="e.g. Sector 7, Muelle Central"
                  className="bg-[#131313] border border-outline-variant text-[13px] text-on-surface p-2.5 outline-none focus:border-primary-container"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase">
                  FECHA Y HORA ACORDADA
                </label>
                <input
                  type="datetime-local"
                  value={newFecha}
                  onChange={(e) => setNewFecha(e.target.value)}
                  required
                  className="bg-[#131313] border border-outline-variant text-[13px] text-on-surface p-2.5 outline-none focus:border-primary-container"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase">
                  NOTAS / COMUNICADO OFICIAL
                </label>
                <textarea
                  value={newNotas}
                  onChange={(e) => setNewNotas(e.target.value)}
                  placeholder="Stakes and rules guidelines..."
                  rows={2}
                  className="bg-[#131313] border border-outline-variant text-[13px] text-on-surface p-2.5 outline-none focus:border-primary-container resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateChallengeModal(false)}
                  className="bg-transparent border border-error hover:bg-error/10 text-error font-bold px-4 py-2 text-[11px] skew-x-[-12deg] cursor-pointer"
                >
                  <span className="skew-x-[12deg] block">CANCEL</span>
                </button>
                <button
                  type="submit"
                  disabled={creatingChallenge}
                  className="bg-primary-container text-on-primary-container font-bold px-5 py-2 text-[11px] skew-x-[-12deg] hover:bg-primary cursor-pointer disabled:opacity-50"
                >
                  <span className="skew-x-[12deg] block">
                    {creatingChallenge ? 'INJECTING...' : 'DEPLOY'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
