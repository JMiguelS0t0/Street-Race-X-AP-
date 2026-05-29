import { useState, useEffect, useMemo } from 'react';
import { getMetricsDashboard } from '../../services/metrics.service';
import type { DashboardData, TrendPoint } from '../../services/metrics.service';

// ==================== MINI CHART COMPONENTS ====================

function BarChart({ data, colorClass, maxBarHeight = 80 }: { data: { label: string; value: number }[]; colorClass: string; maxBarHeight?: number }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-full w-full">
      {data.map((d, i) => {
        const h = Math.max((d.value / maxVal) * maxBarHeight, 2);
        return (
          <div key={i} className="flex flex-col items-center flex-1 min-w-0 group relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#131313] border border-outline-variant px-2 py-0.5 text-[9px] text-on-surface font-mono whitespace-nowrap z-10">
              {d.value}
            </div>
            <div
              className={`w-full ${colorClass} transition-all duration-300 group-hover:opacity-80`}
              style={{ height: `${h}px`, minWidth: '6px' }}
            />
            <span className="text-[8px] text-on-surface-variant font-mono mt-1 truncate w-full text-center uppercase">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SparkLine({ data, color = '#00e3fd', height = 48 }: { data: TrendPoint[]; color?: string; height?: number }) {
  const values = data.map(d => d.count);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const width = 280;

  const points = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * width;
    const y = height - ((v - min) / range) * (height - 4);
    return `${x},${y}`;
  });

  const areaPoints = [...points, `${width},${height}`, `0,${height}`];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: `${height}px` }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints.join(' ')} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DonutChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const size = 120;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1f1f1e" strokeWidth={strokeWidth} />
        {data.map((d, i) => {
          const pct = d.value / total;
          const dashLen = pct * circumference;
          const dashOff = circumference - offset * circumference / total * (total / total);
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={-offset * circumference / total}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-500"
            />
          );
          offset += d.value;
          return el;
        })}
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-on-surface font-mono text-[18px] font-bold">{total}</text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px] font-mono uppercase">
            <div className="w-2.5 h-2.5" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-on-surface-variant">{d.label}</span>
            <span className="text-on-surface font-bold ml-auto pl-3">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== STAT CARD ====================

function StatCard({ icon, label, value, subValue, accentColor = 'text-secondary-container' }: {
  icon: string;
  label: string;
  value: string | number;
  subValue?: string;
  accentColor?: string;
}) {
  return (
    <div className="bg-surface-container border border-outline-variant/40 p-4 relative group hover:border-primary-container/40 transition-all">
      <div className="absolute top-0 left-0 w-1 h-full bg-outline-variant/30 group-hover:bg-primary-container transition-colors" />
      <div className="flex items-start gap-3">
        <span className={`material-symbols-outlined ${accentColor} text-[22px]`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] text-on-surface-variant font-mono font-bold uppercase tracking-wider">{label}</span>
          <span className="text-[22px] font-black text-on-surface font-mono leading-tight">{value}</span>
          {subValue && <span className="text-[9px] text-on-surface-variant font-mono uppercase mt-0.5">{subValue}</span>}
        </div>
      </div>
    </div>
  );
}

// ==================== SECTION WRAPPER ====================

function Section({ title, icon, children, className = '' }: {
  title: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface-container border border-outline-variant/40 relative ${className}`}>
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff5719]" />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary-container text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
          <h3 className="text-[13px] italic font-black text-primary-container uppercase font-display tracking-wider"
            style={{ fontFamily: '"Anybody", sans-serif' }}>
            {title}
          </h3>
        </div>
        {children}
      </div>
    </div>
  );
}

// ==================== ACTIVITY TYPE HELPERS ====================

const ACTIVITY_ICONS: Record<string, { icon: string; color: string }> = {
  user_registered: { icon: 'person_add', color: 'text-secondary-container' },
  challenge_completed: { icon: 'emoji_events', color: 'text-primary-container' },
  challenge_created: { icon: 'add_circle', color: 'text-tertiary' },
  rank_change: { icon: 'military_tech', color: 'text-[#ffd700]' },
};

const STATUS_COLORS: Record<string, string> = {
  pendiente: '#ff5719',
  aceptado: '#00e3fd',
  en_curso: '#2ae500',
  completado: '#ffd700',
  cancelado: '#ff4444',
  rechazado: '#888888',
};

const RANK_COLORS: Record<string, string> = {
  D: '#888888',
  C: '#00e3fd',
  B: '#2ae500',
  A: '#ff5719',
  S: '#ffd700',
};

// ==================== MAIN COMPONENT ====================

export default function Metricas() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMetricsDashboard(days);
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error || 'Error al obtener métricas');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  // Trend summary helpers
  const trendSummary = useMemo(() => {
    if (!data) return null;
    const regTrend = data.trends.registrations;
    const chTrend = data.trends.challenges;
    const totalReg = regTrend.reduce((s, d) => s + d.count, 0);
    const totalCh = chTrend.reduce((s, d) => s + d.count, 0);
    const avgRegPerDay = regTrend.length > 0 ? (totalReg / regTrend.length).toFixed(1) : '0';
    const avgChPerDay = chTrend.length > 0 ? (totalCh / chTrend.length).toFixed(1) : '0';
    return { totalReg, totalCh, avgRegPerDay, avgChPerDay };
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined text-secondary-container text-[36px] animate-spin">sync</span>
        <span className="font-mono text-[12px] text-on-surface-variant uppercase tracking-wider animate-pulse">LOADING METRICS DATA...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-error bg-error/10 p-6 font-mono text-[13px] text-[#ffb4ab]">
        <span className="font-bold">SYSTEM ERROR: </span>{error.toUpperCase()}
        <button
          onClick={fetchData}
          className="ml-4 bg-transparent border border-error hover:bg-error/10 text-error font-bold px-4 py-1 text-[10px] skew-x-[-12deg] cursor-pointer"
        >
          <span className="skew-x-[12deg] block">RETRY</span>
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { overview: ov, distributions: dist, topPilots, recentActivity, locationStats, categoryStats } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2
            className="text-[24px] md:text-[32px] italic uppercase text-primary-container font-black flex items-center gap-3"
            style={{ fontFamily: '"Anybody", sans-serif' }}
          >
            <span className="material-symbols-outlined text-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              monitoring
            </span>
            METRICS HQ
          </h2>
          <p className="font-mono text-[11px] text-on-surface-variant mt-1 uppercase tracking-wider">
            PLATFORM ANALYTICS & PERFORMANCE DASHBOARD
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-on-surface-variant font-mono font-bold uppercase">PERIOD:</span>
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-[10px] font-bold font-mono skew-x-[-12deg] transition-all cursor-pointer ${
                days === d
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-transparent border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary-container/50'
              }`}
            >
              <span className="skew-x-[12deg] block">{d}D</span>
            </button>
          ))}
          <button
            onClick={fetchData}
            className="px-3 py-1.5 text-[10px] font-bold font-mono skew-x-[-12deg] bg-transparent border border-secondary-container text-secondary-container hover:bg-secondary-container/10 transition-all cursor-pointer ml-2"
          >
            <span className="skew-x-[12deg] block flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">refresh</span>
              REFRESH
            </span>
          </button>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <StatCard icon="group" label="Total Pilotos" value={ov.totalPilots} subValue={`${ov.activeUsers} activos`} accentColor="text-secondary-container" />
        <StatCard icon="sports_score" label="Total Retos" value={ov.totalChallenges} subValue={`${ov.completedChallenges} completados`} accentColor="text-primary-container" />
        <StatCard icon="directions_car" label="Vehículos" value={ov.totalVehicles} accentColor="text-tertiary" />
        <StatCard icon="location_on" label="Ubicaciones" value={ov.totalLocations} accentColor="text-on-surface-variant" />
        <StatCard icon="category" label="Categorías" value={ov.totalCategories} accentColor="text-[#ffd700]" />
      </div>

      {/* Secondary KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="pending" label="Pendientes" value={ov.pendingChallenges} accentColor="text-primary-container" />
        <StatCard icon="play_arrow" label="En Curso" value={ov.activeChallenges} accentColor="text-tertiary" />
        <StatCard icon="cancel" label="Cancelados" value={ov.cancelledChallenges} accentColor="text-error" />
        <StatCard icon="admin_panel_settings" label="Admins" value={ov.totalAdmins} subValue={`${ov.inactiveUsers} inactivos`} accentColor="text-on-surface-variant" />
      </div>

      {/* Charts Row 1: Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Users by Rank */}
        <Section title="PILOTOS POR RANGO" icon="military_tech">
          <div className="h-[120px] flex items-end">
            <BarChart
              data={dist.usersByRank.map(d => ({ label: d.rango, value: d.count }))}
              colorClass="bg-secondary-container"
              maxBarHeight={90}
            />
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {dist.usersByRank.map(d => (
              <span key={d.rango} className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className="w-2 h-2" style={{ backgroundColor: RANK_COLORS[d.rango] || '#888' }} />
                <span className="text-on-surface-variant uppercase">{d.rango}</span>
                <span className="text-on-surface font-bold">{d.count}</span>
              </span>
            ))}
          </div>
        </Section>

        {/* Challenges by Status */}
        <Section title="RETOS POR ESTADO" icon="flag">
          <DonutChart
            data={dist.challengesByStatus.filter(d => d.count > 0).map(d => ({ label: d.estado, value: d.count }))}
            colors={dist.challengesByStatus.filter(d => d.count > 0).map(d => STATUS_COLORS[d.estado] || '#888')}
          />
        </Section>
      </div>

      {/* Charts Row 2: Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Challenges by Type */}
        <Section title="RETOS POR TIPO" icon="speed">
          {dist.challengesByType.length > 0 ? (
            <div className="h-[100px] flex items-end">
              <BarChart
                data={dist.challengesByType.map(d => ({ label: d.tipo_carrera, value: d.count }))}
                colorClass="bg-primary-container"
                maxBarHeight={80}
              />
            </div>
          ) : (
            <p className="text-[11px] text-on-surface-variant font-mono uppercase">NO DATA AVAILABLE</p>
          )}
        </Section>

        {/* Vehicles by Type */}
        <Section title="VEHÍCULOS POR TIPO" icon="garage">
          {dist.vehiclesByType.length > 0 ? (
            <div className="h-[100px] flex items-end">
              <BarChart
                data={dist.vehiclesByType.map(d => ({ label: d.tipo_vehiculo, value: d.count }))}
                colorClass="bg-tertiary"
                maxBarHeight={80}
              />
            </div>
          ) : (
            <p className="text-[11px] text-on-surface-variant font-mono uppercase">NO DATA AVAILABLE</p>
          )}
        </Section>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title={`REGISTROS (${days}D)`} icon="trending_up">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-[20px] font-black text-on-surface font-mono">{trendSummary?.totalReg}</span>
            <span className="text-[9px] text-on-surface-variant font-mono uppercase">TOTAL · ~{trendSummary?.avgRegPerDay}/DÍA</span>
          </div>
          <SparkLine data={data.trends.registrations} color="#00e3fd" height={56} />
        </Section>

        <Section title={`RETOS CREADOS (${days}D)`} icon="show_chart">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-[20px] font-black text-on-surface font-mono">{trendSummary?.totalCh}</span>
            <span className="text-[9px] text-on-surface-variant font-mono uppercase">TOTAL · ~{trendSummary?.avgChPerDay}/DÍA</span>
          </div>
          <SparkLine data={data.trends.challenges} color="#ff5719" height={56} />
        </Section>
      </div>

      {/* Top Pilots & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Pilots */}
        <Section title="TOP PILOTOS" icon="emoji_events">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-outline-variant/20 text-left font-mono text-[11px] bg-[#141413]">
              <thead>
                <tr className="bg-[#1f1f1e] text-primary-container border-b border-outline-variant/30">
                  <th className="p-2.5 uppercase font-black tracking-wider">#</th>
                  <th className="p-2.5 uppercase font-black tracking-wider">PILOTO</th>
                  <th className="p-2.5 uppercase font-black tracking-wider text-center">RANGO</th>
                  <th className="p-2.5 uppercase font-black tracking-wider text-center">V</th>
                  <th className="p-2.5 uppercase font-black tracking-wider text-center">D</th>
                  <th className="p-2.5 uppercase font-black tracking-wider text-center">WIN%</th>
                </tr>
              </thead>
              <tbody>
                {topPilots.map((pilot, idx) => (
                  <tr key={pilot.id} className="border-b border-outline-variant/10 hover:bg-surface-container-high/40 transition-colors">
                    <td className="p-2.5 text-on-surface-variant font-bold">{idx + 1}</td>
                    <td className="p-2.5 font-bold uppercase text-on-surface">{pilot.username}</td>
                    <td className="p-2.5 text-center">
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold border"
                        style={{
                          borderColor: RANK_COLORS[pilot.rango || 'D'] + '80',
                          backgroundColor: RANK_COLORS[pilot.rango || 'D'] + '15',
                          color: RANK_COLORS[pilot.rango || 'D'],
                        }}
                      >
                        {pilot.rango}
                      </span>
                    </td>
                    <td className="p-2.5 text-center text-secondary-container font-bold">{pilot.victorias || 0}</td>
                    <td className="p-2.5 text-center text-error font-bold">{pilot.derrotas || 0}</td>
                    <td className="p-2.5 text-center">
                      <span className={`font-bold ${pilot.winRate >= 50 ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                        {pilot.winRate}%
                      </span>
                    </td>
                  </tr>
                ))}
                {topPilots.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-on-surface-variant uppercase">NO PILOTS FOUND</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Recent Activity */}
        <Section title="ACTIVIDAD RECIENTE" icon="history">
          <div className="flex flex-col gap-0 max-h-[360px] overflow-y-auto">
            {recentActivity.map((act, i) => {
              const meta = ACTIVITY_ICONS[act.type] || { icon: 'info', color: 'text-on-surface-variant' };
              return (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-outline-variant/10 last:border-b-0 group hover:bg-surface-container/50 px-1 transition-colors">
                  <span className={`material-symbols-outlined ${meta.color} text-[16px] mt-0.5 shrink-0`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {meta.icon}
                  </span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[11px] text-on-surface font-mono leading-snug uppercase">{act.description}</span>
                    <span className="text-[9px] text-on-surface-variant font-mono mt-0.5">
                      {new Date(act.timestamp).toLocaleString('es-MX', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            {recentActivity.length === 0 && (
              <p className="text-[11px] text-on-surface-variant font-mono uppercase py-4 text-center">NO RECENT ACTIVITY</p>
            )}
          </div>
        </Section>
      </div>

      {/* Location & Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Location Stats */}
        <Section title="UBICACIONES" icon="map">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-outline-variant/20 text-left font-mono text-[11px] bg-[#141413]">
              <thead>
                <tr className="bg-[#1f1f1e] text-primary-container border-b border-outline-variant/30">
                  <th className="p-2.5 uppercase font-black tracking-wider">NOMBRE</th>
                  <th className="p-2.5 uppercase font-black tracking-wider">TIPO</th>
                  <th className="p-2.5 uppercase font-black tracking-wider text-center">RETOS</th>
                </tr>
              </thead>
              <tbody>
                {locationStats.map(loc => (
                  <tr key={loc.id} className="border-b border-outline-variant/10 hover:bg-surface-container-high/40 transition-colors">
                    <td className="p-2.5 font-bold uppercase text-on-surface">{loc.nombre}</td>
                    <td className="p-2.5 text-on-surface-variant uppercase">{loc.tipo}</td>
                    <td className="p-2.5 text-center">
                      <span className="text-secondary-container font-bold">{loc.challengeCount}</span>
                    </td>
                  </tr>
                ))}
                {locationStats.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-on-surface-variant uppercase">NO LOCATIONS</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Category Stats */}
        <Section title="CATEGORÍAS" icon="category">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-outline-variant/20 text-left font-mono text-[11px] bg-[#141413]">
              <thead>
                <tr className="bg-[#1f1f1e] text-primary-container border-b border-outline-variant/30">
                  <th className="p-2.5 uppercase font-black tracking-wider">NOMBRE</th>
                  <th className="p-2.5 uppercase font-black tracking-wider text-center">ESTADO</th>
                  <th className="p-2.5 uppercase font-black tracking-wider text-center">PILOTOS</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.map(cat => (
                  <tr key={cat.id} className="border-b border-outline-variant/10 hover:bg-surface-container-high/40 transition-colors">
                    <td className="p-2.5 font-bold uppercase text-on-surface">{cat.nombre}</td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        cat.activo
                          ? 'border-secondary-container/50 bg-secondary-container/10 text-secondary-container'
                          : 'border-error/50 bg-error/10 text-error'
                      }`}>
                        {cat.activo ? 'ACTIVA' : 'INACTIVA'}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="text-secondary-container font-bold">{cat.userCount}</span>
                    </td>
                  </tr>
                ))}
                {categoryStats.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-on-surface-variant uppercase">NO CATEGORIES</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <span className="text-[9px] text-on-surface-variant font-mono uppercase tracking-wider">
          STREET RACE X — METRICS DASHBOARD v1.0 — DATA PERIOD: LAST {days} DAYS
        </span>
      </div>
    </div>
  );
}
