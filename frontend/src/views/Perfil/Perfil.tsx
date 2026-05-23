import { useState, useEffect } from 'react';
import { getMe } from '../../services/auth.service';
import { updateProfile } from '../../services/user.service';
import { 
  listVehicles, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle 
} from '../../services/vehicle.service';
import type { User } from '../../services/auth.service';
import type { Vehicle } from '../../services/vehicle.service';

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYR4VH9Q7lnQMe14FpOwtCRSPQZNWWixixsuyVD5R66ZIHDuSjmDgx3pMoef-nzMhyieLT58_EfzglLFsgH0ePPf0-eKdrMaRlRXkfkI29HCDWjoJu9cZmotB-Gtr3zNjeCKXDyZMUTRz45p1FcdlElppE_WjgaDFVdZ7Qrb1Ofe_LBafAtMvcTY80yPrfrqBVHEbUjA1HjhbuOyEqK8wfjqAEnQFQt1LTTIVPxKhrwTaHycMGtpAr-GxioENhzM1IzYH4ALpPJz-G';

const DEFAULT_VEHICLE_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD-c7bFeSyM5qXSJsoL2SMnK3vCovLtZb7NjnB6zmpeA_b6OASKgYXox_-UTSR8dVKbDlYh0ziV3NQwFeTF7K_DrZFyUS_5n9wJ_DWRgz1V_tb6vEX6sFpkslIJ0Z8XOcn9qVDgLnSP27Xh2X1xyuHwgwJ-LRmvi6SJvF4sKx3K78J9s7AnYKFeVNFcE-Nb4YWfz5LpbcTK4I2bSakCfCgvBDvhjbeLGkLOQcv5bu7cuF4KS2F5kRzEnJPVaTHxtK-pi0nViVwTX-0c',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBuEI4Xr8dIdPHmEFSePtQ2N_wd534Gg7BVjMvPsIt8gRe_tR9ja8wMHKFgMWotNPL3WGSQt6b0BvviIUXfEogJTp21dBH9eWZEplr-X7dMbmxwampsfQQaj-Oa6T_3wJ6BlyVqGkuffLWXu-mOMsAnjq7q_nKLD_JLFP6TFR2qyz_lBul1Dmt-Bls6RZBtTLb5AQmc-00k8OLr8uWlu-oPUgnwXvS04QzjLNDjRAJFjBCbEA6s0Va3UOPoOh-5qtNY9A_XtPDttpf-',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBFDiurjiqiRrDaKsaBGwF2oDdpkl6UjumAX9QK9iSWtVFa8IWnuaPg0OePOMPvQyzXJOWN8FQJgkw8fElgdOAE1_NCyoq1R6ZqeJfLKRrKxQ9zAN9blPDwJThojHjiR458tBFOl8eRIfyVQUcNladc-yeu0waAoZMKHFBNI0FwN2mDHZ6rudpLrGW0BO_D3nKSGkvVE6gnHBrAja7OENL54xAYOf2d0xscuqxiKdaqllb-69LXCyTX9OMZLYkA1uLsF1NSCC1_0AJI'
];
const GEOGRAPHY_DATA = {
  countries: [
    { id: 'Colombia', name: 'Colombia' },
    { id: 'España', name: 'España' },
    { id: 'México', name: 'México' },
    { id: 'Argentina', name: 'Argentina' }
  ],
  states: {
    Colombia: [
      { id: 'Antioquia', name: 'Antioquia' },
      { id: 'Cundinamarca', name: 'Cundinamarca' },
      { id: 'Valle del Cauca', name: 'Valle del Cauca' },
      { id: 'Atlántico', name: 'Atlántico' }
    ],
    España: [
      { id: 'Madrid', name: 'Madrid' },
      { id: 'Cataluña', name: 'Cataluña' },
      { id: 'Andalucía', name: 'Andalucía' }
    ],
    México: [
      { id: 'CDMX', name: 'Ciudad de México' },
      { id: 'Jalisco', name: 'Jalisco' },
      { id: 'Nuevo León', name: 'Nuevo León' }
    ],
    Argentina: [
      { id: 'Buenos Aires', name: 'Buenos Aires' },
      { id: 'Córdoba', name: 'Córdoba' },
      { id: 'Santa Fe', name: 'Santa Fe' }
    ]
  } as Record<string, { id: string; name: string }[]>,
  cities: {
    Antioquia: [
      { id: 'Medellín', name: 'Medellín' },
      { id: 'Envigado', name: 'Envigado' },
      { id: 'Itagüí', name: 'Itagüí' },
      { id: 'Bello', name: 'Bello' },
      { id: 'Sabaneta', name: 'Sabaneta' }
    ],
    Cundinamarca: [
      { id: 'Bogotá', name: 'Bogotá' },
      { id: 'Soacha', name: 'Soacha' },
      { id: 'Chía', name: 'Chía' }
    ],
    'Valle del Cauca': [
      { id: 'Cali', name: 'Cali' },
      { id: 'Palmira', name: 'Palmira' },
      { id: 'Tuluá', name: 'Tuluá' }
    ],
    Atlántico: [
      { id: 'Barranquilla', name: 'Barranquilla' },
      { id: 'Soledad', name: 'Soledad' }
    ],
    Madrid: [
      { id: 'Madrid', name: 'Madrid' },
      { id: 'Alcalá de Henares', name: 'Alcalá de Henares' }
    ],
    Cataluña: [
      { id: 'Barcelona', name: 'Barcelona' },
      { id: 'Girona', name: 'Girona' }
    ],
    Andalucía: [
      { id: 'Sevilla', name: 'Sevilla' },
      { id: 'Málaga', name: 'Málaga' },
      { id: 'Granada', name: 'Granada' }
    ],
    CDMX: [
      { id: 'Ciudad de México', name: 'Ciudad de México' }
    ],
    Jalisco: [
      { id: 'Guadalajara', name: 'Guadalajara' },
      { id: 'Zapopan', name: 'Zapopan' }
    ],
    'Nuevo León': [
      { id: 'Monterrey', name: 'Monterrey' },
      { id: 'San Pedro', name: 'San Pedro' }
    ],
    'Buenos Aires': [
      { id: 'CABA', name: 'CABA' },
      { id: 'La Plata', name: 'La Plata' }
    ],
    Córdoba: [
      { id: 'Córdoba', name: 'Córdoba' },
      { id: 'Villa Carlos Paz', name: 'Villa Carlos Paz' }
    ],
    'Santa Fe': [
      { id: 'Rosario', name: 'Rosario' },
      { id: 'Santa Fe', name: 'Santa Fe' }
    ]
  } as Record<string, { id: string; name: string }[]>,
  localities: {
    Medellín: [
      { id: 'El Poblado', name: 'El Poblado' },
      { id: 'Laureles', name: 'Laureles' },
      { id: 'Belén', name: 'Belén' },
      { id: 'Guayabal', name: 'Guayabal' },
      { id: 'Castilla', name: 'Castilla' },
      { id: 'Robledo', name: 'Robledo' },
      { id: 'La Candelaria', name: 'La Candelaria (Centro)' },
      { id: 'San Javier', name: 'San Javier' },
      { id: 'Buenos Aires', name: 'Buenos Aires' },
      { id: 'Aranjuez', name: 'Aranjuez' }
    ],
    Envigado: [
      { id: 'Las Antillas', name: 'Las Antillas' },
      { id: 'La Sebastiana', name: 'La Sebastiana' },
      { id: 'El Dorado', name: 'El Dorado' },
      { id: 'San Marcos', name: 'San Marcos' }
    ],
    Itagüí: [
      { id: 'Centro', name: 'Centro' },
      { id: 'Santa María', name: 'Santa María' },
      { id: 'El Carmelo', name: 'El Carmelo' }
    ],
    Bello: [
      { id: 'Niquía', name: 'Niquía' },
      { id: 'Cabañas', name: 'Cabañas' },
      { id: 'Centro', name: 'Centro' }
    ],
    Sabaneta: [
      { id: 'Centro', name: 'Centro' },
      { id: 'Aves María', name: 'Aves María' },
      { id: 'Aliadas', name: 'Aliadas' }
    ],
    Bogotá: [
      { id: 'Chapinero', name: 'Chapinero' },
      { id: 'Usaquén', name: 'Usaquén' },
      { id: 'Suba', name: 'Suba' },
      { id: 'Teusaquillo', name: 'Teusaquillo' }
    ],
    Soacha: [
      { id: 'Comuna 1', name: 'Comuna 1' },
      { id: 'Comuna 2', name: 'Comuna 2' },
      { id: 'Comuna 3', name: 'Comuna 3' },
      { id: 'Comuna 4', name: 'Comuna 4' },
      { id: 'Comuna 5', name: 'Comuna 5' },
      { id: 'Comuna 6', name: 'Comuna 6' }
    ],
    Chía: [
      { id: 'Zona Centro', name: 'Zona Centro' },
      { id: 'Fagua', name: 'Fagua' },
      { id: 'Fonquetá', name: 'Fonquetá' },
      { id: 'Yerbabuena', name: 'Yerbabuena' }
    ],
    Cali: [
      { id: 'Comuna 1', name: 'Comuna 1' },
      { id: 'Comuna 2', name: 'Comuna 2' },
      { id: 'Comuna 3', name: 'Comuna 3' },
      { id: 'Comuna 4', name: 'Comuna 4' },
      { id: 'Comuna 5', name: 'Comuna 5' },
      { id: 'Comuna 6', name: 'Comuna 6' },
      { id: 'Comuna 17', name: 'Comuna 17' },
      { id: 'Comuna 22', name: 'Comuna 22' }
    ],
    Palmira: [
      { id: 'Zona Urbana', name: 'Zona Urbana' },
      { id: 'Zona Rural', name: 'Zona Rural' }
    ],
    Tuluá: [
      { id: 'Centro', name: 'Centro' },
      { id: 'Alvernia', name: 'Alvernia' },
      { id: 'Salesianos', name: 'Salesianos' }
    ],
    Barranquilla: [
      { id: 'Norte-Centro Histórico', name: 'Norte-Centro Histórico' },
      { id: 'Metropolitana', name: 'Metropolitana' },
      { id: 'Sur Oriente', name: 'Sur Oriente' },
      { id: 'Sur Occidente', name: 'Sur Occidente' },
      { id: 'Riomar', name: 'Riomar' }
    ],
    Soledad: [
      { id: 'Centro', name: 'Centro' },
      { id: 'El Parque', name: 'El Parque' },
      { id: 'Los Almendros', name: 'Los Almendros' }
    ],
    Madrid: [
      { id: 'Centro', name: 'Centro' },
      { id: 'Chamberí', name: 'Chamberí' },
      { id: 'Salamanca', name: 'Salamanca' },
      { id: 'Retiro', name: 'Retiro' },
      { id: 'Moncloa', name: 'Moncloa' },
      { id: 'Tetúan', name: 'Tetúan' }
    ],
    'Alcalá de Henares': [
      { id: 'Distrito I', name: 'Distrito I' },
      { id: 'Distrito II', name: 'Distrito II' },
      { id: 'Distrito III', name: 'Distrito III' }
    ],
    Barcelona: [
      { id: 'Eixample', name: 'Eixample' },
      { id: 'Gràcia', name: 'Gràcia' },
      { id: 'Gòtic', name: 'Gòtic' },
      { id: 'Sarrià', name: 'Sarrià' },
      { id: 'Les Corts', name: 'Les Corts' },
      { id: 'Poblenou', name: 'Poblenou' }
    ],
    Girona: [
      { id: 'Barri Vell', name: 'Barri Vell' },
      { id: 'Eixample', name: 'Eixample' },
      { id: 'Devesa', name: 'Devesa' }
    ],
    Sevilla: [
      { id: 'Casco Antiguo', name: 'Casco Antiguo' },
      { id: 'Triana', name: 'Triana' },
      { id: 'Nervión', name: 'Nervión' }
    ],
    Málaga: [
      { id: 'Centro', name: 'Centro' },
      { id: 'Teatinos', name: 'Teatinos' },
      { id: 'El Palo', name: 'El Palo' }
    ],
    Granada: [
      { id: 'Albaicín', name: 'Albaicín' },
      { id: 'Centro', name: 'Centro' },
      { id: 'Chana', name: 'Chana' }
    ],
    'Ciudad de México': [
      { id: 'Cuauhtémoc', name: 'Cuauhtémoc' },
      { id: 'Miguel Hidalgo', name: 'Miguel Hidalgo' },
      { id: 'Benito Juárez', name: 'Benito Juárez' },
      { id: 'Coyoacán', name: 'Coyoacán' },
      { id: 'Tlalpan', name: 'Tlalpan' }
    ],
    Guadalajara: [
      { id: 'Centro Histórico', name: 'Centro Histórico' },
      { id: 'Providencia', name: 'Providencia' },
      { id: 'Americana', name: 'Americana' }
    ],
    Zapopan: [
      { id: 'Centro', name: 'Centro' },
      { id: 'Las Fuentes', name: 'Las Fuentes' },
      { id: 'Puerta de Hierro', name: 'Puerta de Hierro' }
    ],
    Monterrey: [
      { id: 'San Jerónimo', name: 'San Jerónimo' },
      { id: 'Centro', name: 'Centro' },
      { id: 'Mitras', name: 'Mitras' },
      { id: 'Tecnológico', name: 'Tecnológico' }
    ],
    'San Pedro': [
      { id: 'Centrito Valle', name: 'Centrito Valle' },
      { id: 'San Pedro Valle', name: 'San Pedro Valle' },
      { id: 'Chipinque', name: 'Chipinque' }
    ],
    CABA: [
      { id: 'Palermo', name: 'Palermo' },
      { id: 'Recoleta', name: 'Recoleta' },
      { id: 'Belgrano', name: 'Belgrano' },
      { id: 'San Telmo', name: 'San Telmo' },
      { id: 'Puerto Madero', name: 'Puerto Madero' }
    ],
    'La Plata': [
      { id: 'Casco Urbano', name: 'Casco Urbano' },
      { id: 'Tolosa', name: 'Tolosa' },
      { id: 'City Bell', name: 'City Bell' }
    ],
    'Córdoba': [
      { id: 'Nueva Córdoba', name: 'Nueva Córdoba' },
      { id: 'Centro', name: 'Centro' },
      { id: 'General Paz', name: 'General Paz' },
      { id: 'Cerro de las Rosas', name: 'Cerro de las Rosas' }
    ],
    'Villa Carlos Paz': [
      { id: 'Centro', name: 'Centro' },
      { id: 'La Cuesta', name: 'La Cuesta' },
      { id: 'Santa Rita', name: 'Santa Rita' }
    ],
    Rosario: [
      { id: 'Centro', name: 'Centro' },
      { id: 'Pichincha', name: 'Pichincha' },
      { id: 'Arroyito', name: 'Arroyito' }
    ],
    'Santa Fe': [
      { id: 'Centro', name: 'Centro' },
      { id: 'El Pozo', name: 'El Pozo' },
      { id: 'Guadalupe', name: 'Guadalupe' }
    ]
  } as Record<string, { id: string; name: string }[]>,
};

const getStatesOptions = (country: string, currentValue?: string) => {
  if (!country) return [];
  const list = GEOGRAPHY_DATA.states[country] || [];
  if (currentValue && !list.some(item => item.id === currentValue)) {
    return [...list, { id: currentValue, name: currentValue }];
  }
  return list;
};

const getCitiesOptions = (state: string, currentValue?: string) => {
  if (!state) return [];
  const list = GEOGRAPHY_DATA.cities[state] || [];
  if (currentValue && !list.some(item => item.id === currentValue)) {
    return [...list, { id: currentValue, name: currentValue }];
  }
  return list;
};

const getLocalitiesOptions = (city: string, currentValue?: string) => {
  if (!city) return [];
  const list = GEOGRAPHY_DATA.localities[city] || [];
  if (currentValue && !list.some(item => item.id === currentValue)) {
    return [...list, { id: currentValue, name: currentValue }];
  }
  return list;
};
export default function Perfil() {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionAlert, setActionAlert] = useState<{ success: boolean; message: string } | null>(null);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [zonaLocalidad, setZonaLocalidad] = useState('');
  const [zonaCiudad, setZonaCiudad] = useState('');
  const [zonaEstado, setZonaEstado] = useState('');
  const [zonaPais, setZonaPais] = useState('');
  const [submittingProfile, setSubmittingProfile] = useState(false);

  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [tipoVehiculo, setTipoVehiculo] = useState('Auto');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [año, setAño] = useState<number>(new Date().getFullYear());
  const [color, setColor] = useState('');
  const [placa, setPlaca] = useState('');
  const [fotoVehiculo, setFotoVehiculo] = useState('');
  const [modificaciones, setModificaciones] = useState('');
  const [submittingVehicle, setSubmittingVehicle] = useState(false);

  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editTipoVehiculo, setEditTipoVehiculo] = useState('Auto');
  const [editMarca, setEditMarca] = useState('');
  const [editModelo, setEditModelo] = useState('');
  const [editAño, setEditAño] = useState<number>(new Date().getFullYear());
  const [editColor, setEditColor] = useState('');
  const [editPlaca, setEditPlaca] = useState('');
  const [editFotoVehiculo, setEditFotoVehiculo] = useState('');
  const [editModificaciones, setEditModificaciones] = useState('');
  const [submittingEditVehicle, setSubmittingEditVehicle] = useState(false);

  const fetchProfileData = async () => {
    try {
      const profileRes = await getMe();
      const vehiclesRes = await listVehicles();
      if (profileRes.success) {
        setUser(profileRes.data);
        setFotoPerfil(profileRes.data.foto_perfil || '');
        setZonaLocalidad(profileRes.data.zona_localidad || '');
        setZonaCiudad(profileRes.data.zona_ciudad || '');
        setZonaEstado(profileRes.data.zona_estado || '');
        setZonaPais(profileRes.data.zona_pais || '');
      }
      if (vehiclesRes.success) {
        setVehicles(vehiclesRes.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo obtener la información de perfil');
    } finally {
      setLoading(false);
    }
  };

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
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo supera el límite de 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        const compressed = await compressImage(reader.result, 200, 200);
        setFotoPerfil(compressed);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVehiclePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo supera el límite de 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        const compressed = await compressImage(reader.result, 400, 300);
        setFotoVehiculo(compressed);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditVehiclePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo supera el límite de 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        const compressed = await compressImage(reader.result, 400, 300);
        setEditFotoVehiculo(compressed);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCountryChange = (val: string) => {
    setZonaPais(val);
    setZonaEstado('');
    setZonaCiudad('');
    setZonaLocalidad('');
  };

  const handleStateChange = (val: string) => {
    setZonaEstado(val);
    setZonaCiudad('');
    setZonaLocalidad('');
  };

  const handleCityChange = (val: string) => {
    setZonaCiudad(val);
    setZonaLocalidad('');
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProfile(true);
    setActionAlert(null);
    try {
      const res = await updateProfile({
        foto_perfil: fotoPerfil || undefined,
        zona_localidad: zonaLocalidad,
        zona_ciudad: zonaCiudad,
        zona_estado: zonaEstado,
        zona_pais: zonaPais,
      });
      if (res.success) {
        setActionAlert({ success: true, message: 'PROFILE RE-CALIBRATED SUCCESSFULLY' });
        setShowEditProfile(false);
        fetchProfileData();
      } else {
        setActionAlert({ success: false, message: res.error || 'CALIBRATION FAIL' });
      }
    } catch (err: any) {
      setActionAlert({ success: false, message: err.response?.data?.error || 'CALIBRATION FAIL' });
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleAddVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingVehicle(true);
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
        setActionAlert({ success: true, message: 'NEW RIG INTEGRATED INTO THE GARAGE' });
        setShowAddVehicle(false);
        setMarca('');
        setModelo('');
        setAño(new Date().getFullYear());
        setColor('');
        setPlaca('');
        setFotoVehiculo('');
        setModificaciones('');
        fetchProfileData();
      } else {
        setActionAlert({ success: false, message: res.error || 'RIG ASSEMBLY FAIL' });
      }
    } catch (err: any) {
      setActionAlert({ success: false, message: err.response?.data?.error || 'RIG ASSEMBLY FAIL' });
    } finally {
      setSubmittingVehicle(false);
    }
  };

  const handleStartEditVehicle = (v: Vehicle) => {
    setEditingVehicleId(v.id);
    setEditTipoVehiculo(v.tipo_vehiculo);
    setEditMarca(v.marca || '');
    setEditModelo(v.modelo || '');
    setEditAño(v.año || new Date().getFullYear());
    setEditColor(v.color || '');
    setEditPlaca(v.placa || '');
    setEditFotoVehiculo(v.foto || '');
    setEditModificaciones(v.modificaciones || '');
    setShowAddVehicle(false);
  };

  const handleEditVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicleId) return;
    setSubmittingEditVehicle(true);
    setActionAlert(null);
    try {
      const res = await updateVehicle(editingVehicleId, {
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
        setEditingVehicleId(null);
        fetchProfileData();
      } else {
        setActionAlert({ success: false, message: res.error || 'RIG RE-CALIBRATION FAIL' });
      }
    } catch (err: any) {
      setActionAlert({ success: false, message: err.response?.data?.error || 'RIG RE-CALIBRATION FAIL' });
    } finally {
      setSubmittingEditVehicle(false);
    }
  };

  const handleActivateVehicle = async (id: string) => {
    setActionAlert(null);
    try {
      const res = await updateVehicle(id, { activo: true });
      if (res.success) {
        setActionAlert({ success: true, message: 'RIG DEPLOYED FOR ACTIVE SERVICE' });
        fetchProfileData();
      } else {
        setActionAlert({ success: false, message: res.error || 'DEPLOYMENT FAIL' });
      }
    } catch (err: any) {
      setActionAlert({ success: false, message: err.response?.data?.error || 'DEPLOYMENT FAIL' });
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm('¿Confirmar desmantelamiento de este vehículo?')) return;
    setActionAlert(null);
    try {
      const res = await deleteVehicle(id);
      if (res.success) {
        setActionAlert({ success: true, message: 'RIG DISMANTLED AND RECYCLED' });
        fetchProfileData();
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

  const consecutiveWins = user?.retos_consecutivos || 0;
  const progressPercent = Math.min((consecutiveWins / 2) * 100, 100);

  return (
    <div className="flex flex-col gap-8">
      {actionAlert && (
        <div 
          className={`p-3 font-mono text-[13px] border animate-pulse ${
            actionAlert.success 
              ? 'border-tertiary bg-tertiary/10 text-tertiary-fixed' 
              : 'border-error bg-error/10 text-error'
          }`}
        >
          <span className="font-bold">SYSTEM NOTICE:</span> {actionAlert.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        <div className="col-span-1 md:col-span-12 xl:col-span-8 bg-surface-container-high border border-outline-variant p-6 relative header-notch flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <img 
              alt="Pilot Avatar" 
              className="w-32 h-32 object-cover border-2 border-primary-container neon-glow btn-notch bg-[#20201f]" 
              src={user?.foto_perfil || DEFAULT_AVATAR} 
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
            />
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-surface border-2 border-tertiary flex items-center justify-center font-mono font-bold text-tertiary text-2xl s-rank-pulse btn-notch shadow-lg select-none">
              {user?.rango || 'D'}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left flex flex-col justify-between h-32">
            <div>
              <h1 
                className="text-[28px] md:text-[36px] italic text-primary-container uppercase m-0 leading-tight font-black"
                style={{ fontFamily: '"Anybody", sans-serif' }}
              >
                {user?.username}
              </h1>
              <p className="font-mono text-[11px] text-on-surface-variant mt-2 flex items-center justify-center md:justify-start gap-2 uppercase tracking-wider">
                <span className="material-symbols-outlined text-tertiary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                {user?.rol === 'admin' ? 'ADMIN OVERRIDE' : 'LEGENDARY STATUS'}
              </p>
              <p className="font-mono text-[10px] text-on-surface-variant mt-1 uppercase">
                SECTOR: {user?.zona_ciudad || 'GLOBAL'}, {user?.zona_pais || 'SRX'}
              </p>
            </div>
            <div className="mt-4 flex gap-4 justify-center md:justify-start">
              <button 
                onClick={() => setShowEditProfile(!showEditProfile)}
                className="bg-transparent border-2 border-secondary-container text-secondary-container font-mono text-[11px] font-bold px-6 py-2 btn-notch hover:bg-secondary-container/10 transition-all cursor-pointer"
              >
                EDIT PROFILE
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-12 xl:col-span-4 grid grid-cols-2 gap-3 self-stretch">
          <div className="bg-surface-container border border-outline-variant p-4 flex flex-col justify-center items-center header-notch">
            <span className="material-symbols-outlined text-tertiary text-4xl mb-2" style={{ fontVariationSettings: "'FILL' 0" }}>emoji_events</span>
            <span 
              className="text-[24px] text-primary-container font-black"
              style={{ fontFamily: '"Anybody", sans-serif' }}
            >
              {user?.victorias || 0}
            </span>
            <span className="font-mono text-[10px] font-bold text-on-surface-variant">VICTORIES</span>
          </div>

          <div className="bg-surface-container border border-outline-variant p-4 flex flex-col justify-center items-center header-notch">
            <span className="material-symbols-outlined text-error text-4xl mb-2">cancel</span>
            <span 
              className="text-[24px] text-error font-black"
              style={{ fontFamily: '"Anybody", sans-serif' }}
            >
              {user?.derrotas || 0}
            </span>
            <span className="font-mono text-[10px] font-bold text-on-surface-variant">DEFEATS</span>
          </div>

          <div className="col-span-2 bg-surface-container border border-outline-variant p-4 flex justify-between items-center header-notch font-mono">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant">CURRENT STREAK</p>
                <p className="text-[15px] font-bold text-primary-container italic uppercase">
                  {consecutiveWins} {consecutiveWins === 1 ? 'WIN' : 'WINS'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[8px] text-on-surface-variant font-bold">NEXT RANK UP</span>
              <div className="w-24 h-2 bg-[#131313] border border-outline-variant rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-container shadow-[0_0_8px_#ff5719] transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditProfile && (
        <div className="bg-[#20201f] border border-outline-variant p-6 relative header-notch">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#00e3fd]" />
          <h3 
            className="text-[18px] italic font-black text-secondary-container uppercase mb-4"
            style={{ fontFamily: '"Anybody", sans-serif' }}
          >
            RE-CALIBRATE PILOT SYSTEMS
          </h3>
          <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">AVATAR IMAGE / PILOT PHOTO</label>
              <div className="flex items-center gap-4 bg-[#131313] border border-outline-variant p-3">
                <div className="w-16 h-16 border border-outline-variant overflow-hidden shrink-0 bg-[#20201f] flex items-center justify-center">
                  {fotoPerfil ? (
                    <img src={fotoPerfil} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-[24px]">no_photography</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="bg-secondary-container hover:bg-secondary-container/85 text-on-secondary font-mono text-[11px] font-bold px-4 py-2 skew-x-[-8deg] cursor-pointer w-fit select-none">
                    <span className="skew-x-[8deg] block">ATTACH PHOTO</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={handleProfilePhotoChange}
                    />
                  </label>
                  <span className="text-[8px] font-mono text-on-surface-variant uppercase">MAX SIZE: 2MB. FORMATS: JPG, PNG, WEBP</span>
                </div>
                {fotoPerfil && (
                  <button 
                    type="button"
                    onClick={() => setFotoPerfil('')}
                    className="ml-auto bg-transparent border border-error hover:bg-error/10 text-error font-mono text-[10px] font-bold px-3 py-1.5 btn-notch cursor-pointer"
                  >
                    REMOVE
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">COUNTRY</label>
              <select 
                value={zonaPais}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-secondary-container transition-colors"
              >
                <option value="">SELECT COUNTRY</option>
                {GEOGRAPHY_DATA.countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">STATE / REGION</label>
              <select 
                value={zonaEstado}
                onChange={(e) => handleStateChange(e.target.value)}
                disabled={!zonaPais}
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-secondary-container transition-colors disabled:opacity-50"
              >
                <option value="">SELECT STATE</option>
                {getStatesOptions(zonaPais, zonaEstado).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">CITY</label>
              <select 
                value={zonaCiudad}
                onChange={(e) => handleCityChange(e.target.value)}
                disabled={!zonaEstado}
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-secondary-container transition-colors disabled:opacity-50"
              >
                <option value="">SELECT CITY</option>
                {getCitiesOptions(zonaEstado, zonaCiudad).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">LOCALITY / ZONE</label>
              <select 
                value={zonaLocalidad}
                onChange={(e) => setZonaLocalidad(e.target.value)}
                disabled={!zonaCiudad}
                className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-secondary-container transition-colors disabled:opacity-50"
              >
                <option value="">SELECT LOCALITY</option>
                {getLocalitiesOptions(zonaCiudad, zonaLocalidad).map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end mt-2">
              <button 
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="bg-transparent border border-outline-variant text-on-surface font-mono text-[11px] font-bold px-4 py-2.5 btn-notch cursor-pointer"
              >
                CANCEL
              </button>
              <button 
                type="submit"
                disabled={submittingProfile}
                className="bg-secondary-container hover:bg-secondary-container/85 text-on-secondary font-mono text-[11px] font-bold px-5 py-2.5 glow-secondary btn-notch cursor-pointer"
              >
                {submittingProfile ? 'SAVING...' : 'RE-CALIBRATE'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center justify-between border-b border-outline-variant pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              minor_crash
            </span>
            <h2 
              className="text-[20px] md:text-[22px] italic text-primary-fixed uppercase font-black"
              style={{ fontFamily: '"Anybody", sans-serif' }}
            >
              REGISTERED VEHICLES ({vehicles.length}/3)
            </h2>
          </div>
          {vehicles.length < 3 && (
            <button 
              onClick={() => setShowAddVehicle(!showAddVehicle)}
              className="bg-primary-container hover:bg-primary text-on-primary-container font-mono text-[11px] font-bold px-4 py-2 btn-notch cursor-pointer"
            >
              ADD NEW VEHICLE
            </button>
          )}
        </div>

        {showAddVehicle && (
          <div className="bg-[#20201f] border border-outline-variant p-6 relative header-notch">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#ff5719]" />
            <h3 
              className="text-[18px] italic font-black text-primary-container uppercase mb-4"
              style={{ fontFamily: '"Anybody", sans-serif' }}
            >
              ASSEMBLE NEW COMPETITION RIG
            </h3>
            <form onSubmit={handleAddVehicleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono font-bold text-on-surface-variant">VEHICLE TYPE CLASS</label>
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
                <label className="text-[9px] font-mono font-bold text-on-surface-variant">MANUFACTURER / BRAND</label>
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
                <label className="text-[9px] font-mono font-bold text-on-surface-variant">MODEL NAME</label>
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
                <label className="text-[9px] font-mono font-bold text-on-surface-variant">MODEL YEAR</label>
                <input 
                  type="number" 
                  value={año || ''}
                  onChange={(e) => setAño(parseInt(e.target.value) || new Date().getFullYear())}
                  required
                  className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-primary-container transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono font-bold text-on-surface-variant">COLOR / LIVERY</label>
                <input 
                  type="text" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Midnight Blue"
                  className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-primary-container transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono font-bold text-on-surface-variant">LICENSE PLATE (PLACA)</label>
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
                      <span className="skew-x-[8deg] block">ATTACH VEHICLE PHOTO</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handleVehiclePhotoChange}
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
                <label className="text-[9px] font-mono font-bold text-on-surface-variant">MODIFICATIONS / SPEC SHEET</label>
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
                  onClick={() => setShowAddVehicle(false)}
                  className="bg-transparent border border-outline-variant text-on-surface font-mono text-[11px] font-bold px-4 py-2.5 btn-notch cursor-pointer"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  disabled={submittingVehicle}
                  className="bg-primary-container hover:bg-primary text-on-primary-container font-mono text-[11px] font-bold px-5 py-2.5 glow-primary btn-notch cursor-pointer"
                >
                  {submittingVehicle ? 'REGISTERING...' : 'REGISTER RIG'}
                </button>
              </div>
            </form>
          </div>
        )}

        {editingVehicleId && (
          <div className="bg-[#20201f] border border-outline-variant p-6 relative header-notch">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#00e3fd]" />
            <h3 
              className="text-[18px] italic font-black text-secondary-container uppercase mb-4"
              style={{ fontFamily: '"Anybody", sans-serif' }}
            >
              RE-CALIBRATE COMPETITION RIG
            </h3>
            <form onSubmit={handleEditVehicleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono font-bold text-on-surface-variant">VEHICLE TYPE CLASS</label>
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
                <label className="text-[9px] font-mono font-bold text-on-surface-variant">MANUFACTURER / BRAND</label>
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
                <label className="text-[9px] font-mono font-bold text-on-surface-variant">MODEL NAME</label>
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
                <label className="text-[9px] font-mono font-bold text-on-surface-variant">MODEL YEAR</label>
                <input 
                  type="number" 
                  value={editAño || ''}
                  onChange={(e) => setEditAño(parseInt(e.target.value) || new Date().getFullYear())}
                  required
                  className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-secondary-container transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono font-bold text-on-surface-variant">COLOR / LIVERY</label>
                <input 
                  type="text" 
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  placeholder="e.g. Midnight Blue"
                  className="bg-[#131313] border border-outline-variant text-[14px] text-on-surface font-mono p-2.5 outline-none focus:border-secondary-container transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono font-bold text-on-surface-variant">LICENSE PLATE (PLACA)</label>
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
                      <span className="skew-x-[8deg] block">ATTACH VEHICLE PHOTO</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handleEditVehiclePhotoChange}
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
                <label className="text-[9px] font-mono font-bold text-on-surface-variant">MODIFICATIONS / SPEC SHEET</label>
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
                  onClick={() => setEditingVehicleId(null)}
                  className="bg-transparent border border-outline-variant text-on-surface font-mono text-[11px] font-bold px-4 py-2.5 btn-notch cursor-pointer"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  disabled={submittingEditVehicle}
                  className="bg-secondary-container hover:bg-secondary-container/85 text-on-secondary font-mono text-[11px] font-bold px-5 py-2.5 glow-secondary btn-notch cursor-pointer"
                >
                  {submittingEditVehicle ? 'SAVING...' : 'RE-CALIBRATE'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {vehicles.length === 0 ? (
            <div className="border border-outline-variant bg-[#131313] p-12 text-center">
              <span className="material-symbols-outlined text-on-surface-variant text-[48px] mb-4">
                no_photography
              </span>
              <p className="font-mono text-[14px] text-on-surface-variant uppercase tracking-wider">
                Garage empty. Register your first rig to begin targets scan.
              </p>
            </div>
          ) : (
            vehicles.map((v, i) => {
              const defaultImage = DEFAULT_VEHICLE_IMAGES[i % DEFAULT_VEHICLE_IMAGES.length];
              
              let hp = '350 HP';
              if (v.modificaciones) {
                const match = v.modificaciones.match(/(\d+)\s*hp/i);
                if (match) hp = `${match[1]} HP`;
              }

              return (
                <div 
                  key={v.id}
                  className="bg-[#121212] border border-outline-variant p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-secondary-container transition-colors relative overflow-hidden btn-notch"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${v.activo ? 'bg-tertiary' : 'bg-primary-container'}`} />
                  
                  <img 
                    alt={v.modelo || 'Rig'} 
                    className="w-28 h-20 sm:w-24 sm:h-16 object-cover border border-outline bg-[#20201f]" 
                    src={v.foto || defaultImage}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = defaultImage;
                    }}
                  />
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-[16px] font-bold text-primary-container font-mono uppercase tracking-wide">
                      {v.marca || ''} {v.modelo || ''}
                    </h3>
                    <p className="font-mono text-[10px] text-on-surface-variant mt-1 uppercase">
                      CLASS: {v.tipo_vehiculo} | PWR: {hp} | YEAR: {v.año || 'N/A'} {v.placa ? `| PLATE: ${v.placa}` : ''}
                    </p>
                    {v.modificaciones && (
                      <p className="font-mono text-[9px] text-[#e6beb2] italic mt-1 max-w-[500px] truncate mx-auto sm:mx-0">
                        SPEC: {v.modificaciones}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    {!v.activo ? (
                      <button 
                        onClick={() => handleActivateVehicle(v.id)}
                        className="bg-transparent border border-tertiary text-tertiary hover:bg-tertiary/10 font-mono text-[10px] font-bold px-3 py-2 btn-notch transition-colors cursor-pointer"
                        title="Marcar como Activo para Competir"
                      >
                        ACTIVATE
                      </button>
                    ) : (
                      <span className="border border-tertiary/30 bg-tertiary/10 text-tertiary-fixed font-mono text-[10px] font-bold px-3 py-2 btn-notch uppercase select-none">
                        ACTIVE SERVICE
                      </span>
                    )}

                    <button 
                      onClick={() => handleStartEditVehicle(v)}
                      className="bg-transparent border border-secondary-container text-secondary-container hover:bg-secondary-container/10 p-2 transition-colors cursor-pointer flex items-center justify-center"
                      title="Editar Vehículo"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="bg-transparent border border-error text-error hover:bg-error/10 p-2 transition-colors cursor-pointer flex items-center justify-center"
                      title="Desmantelar Vehículo"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
