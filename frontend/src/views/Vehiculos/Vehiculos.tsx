import { useState, useEffect } from 'react';
import { 
  listVehicles, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle 
} from '../../services/vehicle.service';
import type { Vehicle } from '../../services/vehicle.service';

const DEFAULT_VEHICLE_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD-c7bFeSyM5qXSJsoL2SMnK3vCovLtZb7NjnB6zmpeA_b6OASKgYXox_-UTSR8dVKbDlYh0ziV3NQwFeTF7K_DrZFyUS_5n9wJ_DWRgz1V_tb6vEX6sFpkslIJ0Z8XOcn9qVDgLnSP27Xh2X1xyuHwgwJ-LRmvi6SJvF4sKx3K78J9s7AnYKFeVNFcE-Nb4YWfz5LpbcTK4I2bSakCfCgvBDvhjbeLGkLOQcv5bu7cuF4KS2F5kRzEnJPVaTHxtK-pi0nViVwTX-0c',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBuEI4Xr8dIdPHmEFSePtQ2N_wd534Gg7BVjMvPsIt8gRe_tR9ja8wMHKFgMWotNPL3WGSQt6b0BvviIUXfEogJTp21dBH9eWZEplr-X7dMbmxwampsfQQaj-Oa6T_3wJ6BlyVqGkuffLWXu-mOMsAnjq7q_nKLD_JLFP6TFR2qyz_lBul1Dmt-Bls6RZBtTLb5AQmc-00k8OLr8uWlu-oPUgnwXvS04QzjLNDjRAJFjBCbEA6s0Va3UOPoOh-5qtNY9A_XtPDttpf-',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBFDiurjiqiRrDaKsaBGwF2oDdpkl6UjumAX9QK9iSWtVFa8IWnuaPg0OePOMPvQyzXJOWN8FQJgkw8fElgdOAE1_NCyoq1R6ZqeJfLKRrKxQ9zAN9blPDwJThojHjiR458tBFOl8eRIfyVQUcNladc-yeu0waAoZMKHFBNI0FwN2mDHZ6rudpLrGW0BO_D3nKSGkvVE6gnHBrAja7OENL54xAYOf2d0xscuqxiKdaqllb-69LXCyTX9OMZLYkA1uLsF1NSCC1_0AJI'
];

export default function Vehiculos() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionAlert, setActionAlert] = useState<{ success: boolean; message: string } | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [tipoVehiculo, setTipoVehiculo] = useState('Auto');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [año, setAño] = useState<number>(new Date().getFullYear());
  const [color, setColor] = useState('');
  const [placa, setPlaca] = useState('');
  const [fotoVehiculo, setFotoVehiculo] = useState('');
  const [modificaciones, setModificaciones] = useState('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  const [editTipoVehiculo, setEditTipoVehiculo] = useState('Auto');
  const [editMarca, setEditMarca] = useState('');
  const [editModelo, setEditModelo] = useState('');
  const [editAño, setEditAño] = useState<number>(new Date().getFullYear());
  const [editColor, setEditColor] = useState('');
  const [editPlaca, setEditPlaca] = useState('');
  const [editFotoVehiculo, setEditFotoVehiculo] = useState('');
  const [editModificaciones, setEditModificaciones] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const fetchVehicles = async () => {
    try {
      const res = await listVehicles();
      if (res.success) {
        setVehicles(res.data);
      } else {
        setError(res.error || 'Failed to list vehicles');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load garage data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const compressImage = (base64Str: string, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('El archivo supera el límite de 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        const compressed = await compressImage(reader.result, 600, 450);
        if (isEdit) {
          setEditFotoVehiculo(compressed);
        } else {
          setFotoVehiculo(compressed);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicles.length >= 3) {
      setActionAlert({ success: false, message: 'LIMIT REACHED: MAX 3 RIGS ALLOWED IN GARAGE' });
      return;
    }
    setSubmittingAdd(true);
    setActionAlert(null);
    try {
      const res = await createVehicle({
        tipo_vehiculo: tipoVehiculo,
        marca: marca || undefined,
        modelo: modelo || undefined,
        año: año || undefined,
        color: color || undefined,
        placa: placa || undefined,
        foto: fotoVehiculo || undefined,
        modificaciones: modificaciones || undefined,
      });

      if (res.success) {
        setActionAlert({ success: true, message: 'NEW COMPETITION RIG INTEGRATED INTO GARAGE' });
        setShowAddForm(false);
        setMarca('');
        setModelo('');
        setAño(new Date().getFullYear());
        setColor('');
        setPlaca('');
        setFotoVehiculo('');
        setModificaciones('');
        fetchVehicles();
      } else {
        setActionAlert({ success: false, message: res.error || 'RIG ASSEMBLY FAIL' });
      }
    } catch (err: any) {
      setActionAlert({ success: false, message: err.response?.data?.error || 'RIG ASSEMBLY FAIL' });
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleStartEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setEditTipoVehiculo(v.tipo_vehiculo);
    setEditMarca(v.marca || '');
    setEditModelo(v.modelo || '');
    setEditAño(v.año || new Date().getFullYear());
    setEditColor(v.color || '');
    setEditPlaca(v.placa || '');
    setEditFotoVehiculo(v.foto || '');
    setEditModificaciones(v.modificaciones || '');
    setShowAddForm(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    setSubmittingEdit(true);
    setActionAlert(null);
    try {
      const res = await updateVehicle(editingVehicle.id, {
        tipo_vehiculo: editTipoVehiculo,
        marca: editMarca || undefined,
        modelo: editModelo || undefined,
        año: editAño || undefined,
        color: editColor || undefined,
        placa: editPlaca || undefined,
        foto: editFotoVehiculo || undefined,
        modificaciones: editModificaciones || undefined,
      });

      if (res.success) {
        setActionAlert({ success: true, message: 'VEHICLE SYSTEMS RE-CALIBRATED SUCCESSFULLY' });
        setEditingVehicle(null);
        fetchVehicles();
      } else {
        setActionAlert({ success: false, message: res.error || 'RIG RE-CALIBRATION FAIL' });
      }
    } catch (err: any) {
      setActionAlert({ success: false, message: err.response?.data?.error || 'RIG RE-CALIBRATION FAIL' });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    if (currentlyActive) return; 
    setActionAlert(null);
    try {
      const res = await updateVehicle(id, { activo: true });
      if (res.success) {
        setActionAlert({ success: true, message: 'VEHICLE ACTIVATED FOR ACTIVE SERVICE' });
        fetchVehicles();
      } else {
        setActionAlert({ success: false, message: res.error || 'ACTIVATION FAIL' });
      }
    } catch (err: any) {
      setActionAlert({ success: false, message: err.response?.data?.error || 'ACTIVATION FAIL' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Confirmar desmantelamiento de este vehículo?')) return;
    setActionAlert(null);
    try {
      const res = await deleteVehicle(id);
      if (res.success) {
        setActionAlert({ success: true, message: 'RIG DISMANTLED AND RECYCLED' });
        fetchVehicles();
      } else {
        setActionAlert({ success: false, message: res.error || 'DISMANTLING FAIL' });
      }
    } catch (err: any) {
      setActionAlert({ success: false, message: err.response?.data?.error || 'DISMANTLING FAIL' });
    }
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
    <div className="flex flex-col gap-6">
      {actionAlert && (
        <div 
          className={`p-3 font-mono text-[13px] border animate-pulse ${
            actionAlert.success 
              ? 'border-tertiary bg-tertiary/10 text-tertiary' 
              : 'border-error bg-error/10 text-error'
          }`}
        >
          <span className="font-bold">SYSTEM NOTICE:</span> {actionAlert.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-4 gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 
            className="text-[24px] md:text-[32px] italic uppercase text-on-surface font-black flex items-center gap-3"
            style={{ fontFamily: '"Anybody", sans-serif' }}
          >
            <span className="material-symbols-outlined text-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>minor_crash</span>
            Garage
          </h2>
          <p className="font-mono text-[11px] text-on-surface-variant mt-1 uppercase tracking-wider">
            Manage your active fleet. {vehicles.length}/3 slots filled.
          </p>
        </div>

        {vehicles.length < 3 && !editingVehicle && (
          <button 
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingVehicle(null);
            }}
            className="flex items-center justify-center gap-2 bg-transparent border-2 border-secondary-container text-secondary-container font-mono text-[11px] font-bold uppercase py-2 px-6 skew-x-[-12deg] hover:bg-secondary-container/10 transition-all cursor-pointer relative overflow-hidden group select-none"
          >
            <div className="absolute inset-y-0 left-0 w-4 speed-lines opacity-50 group-hover:opacity-100"></div>
            <span className="skew-x-[12deg] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">add</span>
              {showAddForm ? 'CANCEL' : 'ADD VEHICLE'}
            </span>
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-surface-container border border-outline-variant p-6 relative header-notch">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#ff5719]" />
          <h3 
            className="text-[18px] italic font-black text-primary-container uppercase mb-4"
            style={{ fontFamily: '"Anybody", sans-serif' }}
          >
            ASSEMBLE NEW COMPETITION RIG
          </h3>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">VEHICLE TYPE CLASS</label>
              <select 
                value={tipoVehiculo}
                onChange={(e) => setTipoVehiculo(e.target.value)}
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-primary-container transition-colors"
              >
                <option value="Auto">AUTO</option>
                <option value="Moto">MOTO</option>
                <option value="Camioneta">CAMIONETA</option>
                <option value="Deportivo">DEPORTIVO</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">MANUFACTURER / BRAND</label>
              <input 
                type="text" 
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                required
                placeholder="e.g. Nissan"
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-primary-container transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">MODEL NAME</label>
              <input 
                type="text" 
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                required
                placeholder="e.g. Skyline GT-R R34"
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-primary-container transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">MODEL YEAR</label>
              <input 
                type="number" 
                value={año || ''}
                onChange={(e) => setAño(parseInt(e.target.value) || new Date().getFullYear())}
                required
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-primary-container transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">COLOR / LIVERY</label>
              <input 
                type="text" 
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Midnight Blue"
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-primary-container transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">LICENSE PLATE (PLACA)</label>
              <input 
                type="text" 
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                placeholder="e.g. SRX-889"
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-primary-container transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">VEHICLE PHOTO</label>
              <div className="flex items-center gap-4 bg-[#131313] border border-outline-variant p-3">
                <div className="w-20 h-14 border border-outline-variant overflow-hidden shrink-0 bg-[#20201f] flex items-center justify-center">
                  {fotoVehiculo ? (
                    <img src={fotoVehiculo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-[24px]">directions_car</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="bg-primary-container hover:bg-primary text-on-primary-container font-mono text-[11px] font-bold px-4 py-2 skew-x-[-8deg] cursor-pointer w-fit select-none">
                    <span className="skew-x-[8deg] block">ATTACH PHOTO</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={(e) => handlePhotoUpload(e, false)}
                    />
                  </label>
                  <span className="text-[8px] font-mono text-on-surface-variant uppercase">MAX SIZE: 2MB. FORMATS: JPG, PNG, WEBP</span>
                </div>
                {fotoVehiculo && (
                  <button 
                    type="button"
                    onClick={() => setFotoVehiculo('')}
                    className="ml-auto bg-transparent border border-error hover:bg-error/10 text-error font-mono text-[10px] font-bold px-3 py-1.5 btn-notch cursor-pointer"
                  >
                    REMOVE
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">MODIFICATIONS / SPEC SHEET</label>
              <textarea 
                value={modificaciones}
                onChange={(e) => setModificaciones(e.target.value)}
                placeholder="e.g. Twin turbo upgrades, custom ECU tune, 850 HP spec"
                rows={2}
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-primary-container transition-colors resize-none"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end mt-2">
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-transparent border border-outline-variant text-on-surface font-mono text-[11px] font-bold px-4 py-2.5 btn-notch cursor-pointer"
              >
                CANCEL
              </button>
              <button 
                type="submit"
                disabled={submittingAdd}
                className="bg-primary-container hover:bg-primary text-on-primary-container font-mono text-[11px] font-bold px-5 py-2.5 glow-primary btn-notch cursor-pointer"
              >
                {submittingAdd ? 'REGISTERING...' : 'REGISTER RIG'}
              </button>
            </div>
          </form>
        </div>
      )}

      {editingVehicle && (
        <div className="bg-surface-container border border-outline-variant p-6 relative header-notch">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#00e3fd]" />
          <h3 
            className="text-[18px] italic font-black text-secondary-container uppercase mb-4"
            style={{ fontFamily: '"Anybody", sans-serif' }}
          >
            RE-CALIBRATE COMPETITION RIG
          </h3>
          <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">VEHICLE TYPE CLASS</label>
              <select 
                value={editTipoVehiculo}
                onChange={(e) => setEditTipoVehiculo(e.target.value)}
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-secondary-container transition-colors"
              >
                <option value="Auto">AUTO</option>
                <option value="Moto">MOTO</option>
                <option value="Camioneta">CAMIONETA</option>
                <option value="Deportivo">DEPORTIVO</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">MANUFACTURER / BRAND</label>
              <input 
                type="text" 
                value={editMarca}
                onChange={(e) => setEditMarca(e.target.value)}
                required
                placeholder="e.g. Nissan"
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-secondary-container transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">MODEL NAME</label>
              <input 
                type="text" 
                value={editModelo}
                onChange={(e) => setEditModelo(e.target.value)}
                required
                placeholder="e.g. Skyline GT-R R34"
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-secondary-container transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">MODEL YEAR</label>
              <input 
                type="number" 
                value={editAño || ''}
                onChange={(e) => setEditAño(parseInt(e.target.value) || new Date().getFullYear())}
                required
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-secondary-container transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">COLOR / LIVERY</label>
              <input 
                type="text" 
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                placeholder="e.g. Midnight Blue"
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-secondary-container transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">LICENSE PLATE (PLACA)</label>
              <input 
                type="text" 
                value={editPlaca}
                onChange={(e) => setEditPlaca(e.target.value)}
                placeholder="e.g. SRX-889"
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-secondary-container transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">VEHICLE PHOTO</label>
              <div className="flex items-center gap-4 bg-[#131313] border border-outline-variant p-3">
                <div className="w-20 h-14 border border-outline-variant overflow-hidden shrink-0 bg-[#20201f] flex items-center justify-center">
                  {editFotoVehiculo ? (
                    <img src={editFotoVehiculo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-[24px]">directions_car</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="bg-secondary-container hover:bg-secondary-container/85 text-on-secondary font-mono text-[11px] font-bold px-4 py-2 skew-x-[-8deg] cursor-pointer w-fit select-none">
                    <span className="skew-x-[8deg] block">ATTACH PHOTO</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={(e) => handlePhotoUpload(e, true)}
                    />
                  </label>
                  <span className="text-[8px] font-mono text-on-surface-variant uppercase">MAX SIZE: 2MB. FORMATS: JPG, PNG, WEBP</span>
                </div>
                {editFotoVehiculo && (
                  <button 
                    type="button"
                    onClick={() => setEditFotoVehiculo('')}
                    className="ml-auto bg-transparent border border-error hover:bg-error/10 text-error font-mono text-[10px] font-bold px-3 py-1.5 btn-notch cursor-pointer"
                  >
                    REMOVE
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">MODIFICATIONS / SPEC SHEET</label>
              <textarea 
                value={editModificaciones}
                onChange={(e) => setEditModificaciones(e.target.value)}
                placeholder="e.g. Twin turbo upgrades, custom ECU tune, 850 HP spec"
                rows={2}
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-secondary-container transition-colors resize-none"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end mt-2">
              <button 
                type="button"
                onClick={() => setEditingVehicle(null)}
                className="bg-transparent border border-outline-variant text-on-surface font-mono text-[11px] font-bold px-4 py-2.5 btn-notch cursor-pointer"
              >
                CANCEL
              </button>
              <button 
                type="submit"
                disabled={submittingEdit}
                className="bg-secondary-container hover:bg-secondary-container/85 text-on-secondary font-mono text-[11px] font-bold px-5 py-2.5 glow-secondary btn-notch cursor-pointer"
              >
                {submittingEdit ? 'SAVING...' : 'RE-CALIBRATE'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {vehicles.length === 0 ? (
          <div className="md:col-span-12 border border-outline-variant bg-[#131313] p-12 text-center header-notch">
            <span className="material-symbols-outlined text-on-surface-variant text-[48px] mb-4">
              no_photography
            </span>
            <p className="font-mono text-[14px] text-on-surface-variant uppercase tracking-wider">
              Garage empty. Register your first rig to begin target acquisition.
            </p>
          </div>
        ) : (
          vehicles.map((v, i) => {
            const defaultImage = DEFAULT_VEHICLE_IMAGES[i % DEFAULT_VEHICLE_IMAGES.length];
            const isMainRide = v.activo;
            
            let hp = '350';
            if (v.modificaciones) {
              const match = v.modificaciones.match(/(\d+)\s*hp/i);
              if (match) hp = match[1];
            }
            
            const handlingLevel = i === 0 ? 4 : (i === 1 ? 3 : 2);

            return (
              <div 
                key={v.id}
                className={`header-notch bg-[#121212] border border-[#333333] relative overflow-hidden flex flex-col group transition-all duration-300 ${
                  isMainRide 
                    ? 'md:col-span-8 border-secondary-container shadow-[0_0_8px_#00e3fd]' 
                    : 'md:col-span-4 hover:border-outline-variant'
                }`}
              >
                
                {isMainRide && (
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-surface/80 backdrop-blur-sm px-3 py-1 border border-tertiary select-none">
                    <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#2ae500] animate-pulse"></span>
                    <span className="font-mono text-[9px] font-bold text-tertiary uppercase">Active Ride</span>
                  </div>
                )}

                <div className="absolute top-4 right-4 z-20 flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleStartEdit(v)}
                    className="bg-[#121212]/90 hover:bg-secondary-container/20 border border-outline-variant hover:border-secondary-container text-on-surface p-1.5 transition-colors cursor-pointer flex items-center justify-center"
                    title="Edit Rig"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(v.id)}
                    className="bg-[#121212]/90 hover:bg-error/20 border border-outline-variant hover:border-error text-error p-1.5 transition-colors cursor-pointer flex items-center justify-center"
                    title="Dismantle Rig"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>

                <div className={`relative w-full bg-surface-container-high overflow-hidden ${
                  isMainRide ? 'h-48 md:h-64' : 'h-40'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent z-10"></div>
                  <img 
                    alt={v.modelo || 'Rig'} 
                    className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700 mix-blend-luminosity hover:mix-blend-normal bg-[#20201f]" 
                    src={v.foto || defaultImage}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = defaultImage;
                    }}
                  />
                </div>

                <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-20 bg-[#121212] flex-grow">
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="material-symbols-outlined text-secondary-container text-[16px]">
                        {v.tipo_vehiculo === 'Moto' ? 'two_wheeler' : 'directions_car'}
                      </span>
                      <span className="font-mono text-[9px] font-bold text-secondary-container uppercase tracking-widest">
                        Class {v.tipo_vehiculo} • {v.placa || 'SRX-SPEC'}
                      </span>
                    </div>
                    <h3 
                      className={`italic font-black text-on-surface uppercase ${
                        isMainRide ? 'text-[20px] md:text-[24px]' : 'text-[18px]'
                      }`}
                      style={{ fontFamily: '"Anybody", sans-serif' }}
                    >
                      {v.marca || ''} {v.modelo || ''}
                    </h3>
                    
                    <div className="flex gap-6 mt-4">
                      <div>
                        <p className="font-mono text-[9px] font-bold text-on-surface-variant uppercase">Power Output</p>
                        <p className="text-[16px] text-primary-container italic font-black" style={{ fontFamily: '"Anybody", sans-serif' }}>
                          {hp} <span className="text-[10px] font-mono text-outline font-normal">HP</span>
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[9px] font-bold text-on-surface-variant uppercase">Handling Specs</p>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div 
                              key={level}
                              className={`w-3.5 h-3 skew-x-[-15deg] ${
                                level <= handlingLevel 
                                  ? 'bg-secondary-container shadow-[0_0_4px_#00e3fd]' 
                                  : 'bg-surface-variant'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {v.modificaciones && (
                      <p className="font-mono text-[9px] text-[#e6beb2] italic mt-3 border-t border-outline-variant/30 pt-2 uppercase">
                        Spec: {v.modificaciones}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 bg-surface-container-low p-3 border border-outline-variant shrink-0 w-full md:w-auto justify-between md:justify-start">
                    <span className="font-mono text-[9px] font-bold text-on-surface uppercase select-none">ACTIVE SERVICE</span>
                    <button 
                      onClick={() => handleToggleActive(v.id, v.activo)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none select-none ${
                        v.activo ? 'bg-tertiary' : 'bg-surface-variant'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#131313] shadow ring-0 transition duration-200 ease-in-out ${
                          v.activo ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {vehicles.length < 3 && !showAddForm && !editingVehicle && (
          <div 
            onClick={() => setShowAddForm(true)}
            className="md:col-span-12 mt-4 bg-surface-container border border-dashed border-outline-variant p-8 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer header-notch select-none"
          >
            <span className="material-symbols-outlined text-outline text-[48px] mb-2">electric_scooter</span>
            <h4 
              className="text-[16px] italic font-black text-on-surface-variant uppercase mb-1"
              style={{ fontFamily: '"Anybody", sans-serif' }}
            >
              Empty Slot ({3 - vehicles.length} Available)
            </h4>
            <p className="font-mono text-[10px] text-outline max-w-md uppercase tracking-wide">
              Expand your garage. Register another rig to dominate the districts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
