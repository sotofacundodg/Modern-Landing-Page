import { useEffect, useMemo, useRef, useState } from 'react';
import { CircleHelp, Info } from 'lucide-react';
import campaignData from '@/data/campana-salud-intestinal.json';

type Province = typeof campaignData.provincias[number];
type MetricId = typeof campaignData.indicadores[number]['id'];

const campaign = campaignData.campana;
const indicators = campaignData.indicadores;
const provinces = campaignData.provincias;
const indicator = (id: MetricId) => indicators.find(item => item.id === id)!;
const num = (id: MetricId) => indicator(id).valor as number;
const thruPlaySeconds = indicator('thruplays').definicion.match(/\d+/)?.[0] ?? campaign.optimizadaPara.match(/\d+/)?.[0] ?? '';
const completeThreshold = indicator('completo').definicion.match(/\d+\s*%/)?.[0] ?? '';
const integer = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const percent = (value: number, digits = 1) => `${new Intl.NumberFormat('es-AR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value)}%`;
const count = (value: number) => integer.format(value);
const ars = (value: number, digits = 0) => `$ ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value)}`;
const ratio = (numerator: number, denominator: number) => denominator ? numerator / denominator : 0;

function InfoButton({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const tooltipId = `tip-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`;
  return <div className="info-wrap">
    <button className="info-button" type="button" aria-label={`Definición: ${label}`} aria-expanded={open} aria-describedby={open ? tooltipId : undefined} onClick={() => setOpen(value => !value)} data-testid={`button-info-${label.toLowerCase().replaceAll(' ', '-')}`}><Info size={14} /></button>
    {open && <div className="info-popover" id={tooltipId} role="tooltip">{text}</div>}
  </div>;
}

function MetricCard({ id, label, value, foot, featured = false }: { id: MetricId; label: string; value: string; foot?: string; featured?: boolean }) {
  const item = indicator(id);
  return <article className={`metric-card ${featured ? 'primary' : ''}`} data-testid={`card-metric-${id}`}>
    <div className="metric-top"><span>{label}</span><InfoButton text={item.definicion} label={label} /></div>
    <strong className="metric-value">{value}</strong>
    {foot && <div className="metric-foot">{foot}</div>}
  </article>;
}

function Funnel({ onVisible }: { onVisible: boolean }) {
  const plays = num('reproducciones');
  const stages = [
    { id: 'impresiones' as MetricId, name: indicator('impresiones').indicador, value: num('impresiones') },
    { id: 'reproducciones' as MetricId, name: indicator('reproducciones').indicador, value: plays },
    { id: 'repro_3s' as MetricId, name: indicator('repro_3s').indicador, value: num('repro_3s') },
    { id: 'thruplays' as MetricId, name: `${indicator('thruplays').indicador.replace(/\s*\([^)]*\)/, '')} (${thruPlaySeconds} s)`, value: num('thruplays') },
    { id: 'completo' as MetricId, name: `Video completo (${completeThreshold})`, value: num('completo') },
  ];
  const maxStage = Math.max(...stages.map(stage => stage.value));
  return <div className="funnel" aria-label="Embudo de visualización">
    {stages.map((stage, index) => {
      const share = ratio(stage.value, plays) * 100;
      const barWidth = ratio(stage.value, maxStage) * 100;
      return <div className="funnel-row" key={stage.id}>
        <div className="funnel-label">{stage.name}</div>
        <div className="funnel-track" aria-hidden="true"><div className={`funnel-fill ${onVisible ? 'is-visible' : ''}`} style={{ '--fill': `${barWidth}%` } as React.CSSProperties} /></div>
        <div className="funnel-number">{count(stage.value)}<small>{percent(share, 1)} de reproducciones</small></div>
      </div>;
    })}
  </div>;
}

type MapMetric = 'investment' | 'reach';

function provinceShare(province: Province, metric: MapMetric) {
  if (!province.tieneEntrega) return null;
  if (metric === 'investment') return province.pctInversion ?? 0;
  return ratio(province.alcance ?? 0, num('alcance'));
}

function provinceFill(province: Province, metric: MapMetric) {
  const share = provinceShare(province, metric);
  if (share == null) return '#E7ECF3';
  if (share >= .4) return '#0F3478';
  if (share >= .1) return '#3B82C2';
  if (share >= .05) return '#7FA9D8';
  if (share >= .01) return '#BCD3EC';
  return '#E7ECF3';
}

function ProvinceStats({ province }: { province: Province }) {
  if (!province.tieneEntrega) return <div className="detail-grid"><span>Estado<b>Sin entrega en esta campaña</b></span></div>;
  return <div className="detail-grid">
    <span>Personas alcanzadas<b>{count(province.alcance ?? 0)}</b></span>
    <span>Inversión<b>{ars(province.inversion ?? 0)}</b></span>
    <span>Participación de inversión<b>{percent((province.pctInversion ?? 0) * 100, 2)}</b></span>
    <span>Costo por persona<b>{ars(province.costoPorPersona ?? 0, 2)}</b></span>
  </div>;
}

function ArgentinaMap() {
  const [metric, setMetric] = useState<MapMetric>('investment');
  const [hovered, setHovered] = useState<Province | null>(null);
  const [pinned, setPinned] = useState<Province | null>(null);
  const [showNoDelivery, setShowNoDelivery] = useState(false);
  const selected = hovered ?? pinned;
  const ordered = useMemo(() => provinces.filter(province => province.tieneEntrega).sort((a, b) => (b.inversion ?? -1) - (a.inversion ?? -1)), []);
  const noDelivery = useMemo(() => provinces.filter(province => !province.tieneEntrega), []);
  const topFour = ordered.slice(0, 4).reduce((sum, province) => sum + (province.pctInversion ?? 0), 0);
  const buenosAires = provinces.find(p => p.provincia === 'Buenos Aires')!;
  const metricTitle = metric === 'investment' ? 'participación de la inversión' : 'participación del alcance total';
  const activate = (province: Province) => { setHovered(province); setPinned(province); };
  return <div className="map-card">
    <div className="map-column">
      <div className="map-sticky">
        <div className="map-visual" onMouseLeave={() => setHovered(null)}>
          <svg className="map-svg" viewBox={`0 0 ${campaignData.mapa.viewBoxAncho} ${campaignData.mapa.viewBoxAlto}`} role="group" aria-label="Mapa interactivo de las provincias argentinas">
            {provinces.map(province => <path key={province.provincia} d={province.svgPath} fill={provinceFill(province, metric)} className={`province-path ${selected?.provincia === province.provincia ? 'is-active' : ''}`} tabIndex={0} role="button" aria-label={`${province.provincia}${province.tieneEntrega ? `, alcance ${count(province.alcance ?? 0)}, inversión ${ars(province.inversion ?? 0)}` : ', Sin entrega en esta campaña'}`} onMouseEnter={() => setHovered(province)} onFocus={() => setHovered(province)} onBlur={() => setHovered(null)} onClick={() => activate(province)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(province); } }}><title>{province.provincia}</title></path>)}
            {provinces.map(p => <text key={`label-${p.provincia}`} x={p.centroX} y={p.centroY} textAnchor="middle" className="map-label" aria-hidden="true">{p.provincia === 'Buenos Aires' ? 'BA' : p.provincia === 'Tierra del Fuego' ? 'TF' : p.provincia === 'Entre Ríos' ? 'ER' : p.provincia === 'Santiago del Estero' ? 'SDE' : p.provincia === 'Santa Cruz' ? 'SC' : p.provincia === 'Río Negro' ? 'RN' : p.provincia === 'La Rioja' ? 'LR' : p.provincia === 'San Juan' ? 'SJ' : p.provincia === 'San Luis' ? 'SL' : p.provincia === 'La Pampa' ? 'LP' : p.provincia === 'Santa Fe' ? 'SF' : p.provincia === 'Córdoba' ? 'CBA' : p.provincia === 'Mendoza' ? 'MZA' : p.provincia === 'Tucumán' ? 'TUC' : p.provincia === 'Catamarca' ? 'CAT' : p.provincia === 'Neuquén' ? 'NQN' : p.provincia === 'Chubut' ? 'CH' : p.provincia === 'Formosa' ? 'FSA' : p.provincia === 'Corrientes' ? 'COR' : p.provincia === 'Misiones' ? 'MIS' : p.provincia === 'Jujuy' ? 'JUJ' : p.provincia === 'Salta' ? 'SAL' : p.provincia === 'Chaco' ? 'CHA' : 'CABA'}</text>)}
            {provinces.filter(p => p.provincia === 'CABA').map(p => <circle key="caba-dot" cx={p.centroX} cy={p.centroY} r="4" className={`caba-marker ${selected?.provincia === p.provincia ? 'is-active' : ''}`} fill="#81BC46" tabIndex={0} role="button" aria-label="CABA" onMouseEnter={() => setHovered(p)} onFocus={() => setHovered(p)} onClick={() => activate(p)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(p); } }} />)}
          </svg>
          {hovered && <aside className="map-tooltip" aria-live="polite">
            <strong>{hovered.provincia}</strong>
            <ProvinceStats province={hovered} />
          </aside>}
        </div>
        <div className="legend" aria-label={`Leyenda de ${metricTitle}`}>
          <span className="legend-heading">Color: {metricTitle}</span>
          {[['#0F3478','40% o más'],['#3B82C2','10 a 40%'],['#7FA9D8','5 a 10%'],['#BCD3EC','1 a 5%'],['#E7ECF3','Sin entrega']].map(([color, text]) => <span className="legend-item" key={text}><i style={{ background: color }} />{text}</span>)}
        </div>
      </div>
    </div>
    <div className="map-side">
      {pinned && <aside className="detail-panel" aria-live="polite">
        <header><span>{pinned.provincia}</span><button type="button" aria-label="Cerrar detalle de provincia" onClick={() => { setPinned(null); setHovered(null); }}>×</button></header>
        <ProvinceStats province={pinned} />
      </aside>}
      <div className="map-toolbar"><h3>Ranking por inversión</h3><div className="switch-control" role="group" aria-label="Métrica del mapa">
        <button type="button" className={metric === 'investment' ? 'active' : ''} aria-pressed={metric === 'investment'} onClick={() => setMetric('investment')}>% de la inversión</button>
        <button type="button" className={metric === 'reach' ? 'active' : ''} aria-pressed={metric === 'reach'} onClick={() => setMetric('reach')}>Personas alcanzadas</button>
      </div></div>
      <div className="province-list" aria-label="Ranking provincial">
        {ordered.map((province, index) => {
          const share = province.pctInversion ?? 0;
          return <button type="button" key={province.provincia} className={`province-row ${selected?.provincia === province.provincia ? 'is-active' : ''}`} onMouseEnter={() => setHovered(province)} onFocus={() => setHovered(province)} onBlur={() => setHovered(null)} onClick={() => activate(province)} data-testid={`button-province-${index}`}>
            <span className="rank">{String(index + 1).padStart(2, '0')}</span>
            <span className="province-copy"><strong>{province.provincia}</strong><small>{count(province.alcance ?? 0)} personas alcanzadas · {ars(province.costoPorPersona ?? 0, 2)} por persona</small></span>
            <i className="ranking-track" aria-hidden="true"><i style={{ width: `${share * 100}%` }} /></i>
            <span className="province-share">{percent(share * 100, 1)}</span>
            <span className="province-value">{ars(province.inversion ?? 0)}</span>
          </button>;
        })}
      </div>
      <div className="no-delivery">
        <div className="no-delivery-line">
          <span><i aria-hidden="true" />{count(noDelivery.length)} provincias sin entrega en esta campaña</span>
          <button type="button" aria-expanded={showNoDelivery} aria-controls="no-delivery-provinces" onClick={() => setShowNoDelivery(value => !value)}>{showNoDelivery ? 'Ocultar' : 'Ver cuáles'}</button>
        </div>
        {showNoDelivery && <div className="no-delivery-chips" id="no-delivery-provinces">
          {noDelivery.map(province => <button type="button" key={province.provincia} className={`no-delivery-chip ${selected?.provincia === province.provincia ? 'is-active' : ''}`} onMouseEnter={() => setHovered(province)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(province)} onBlur={() => setHovered(null)} onClick={() => activate(province)}>{province.provincia}</button>)}
        </div>}
      </div>
      <div className="map-callout">Cuatro jurisdicciones concentran el <strong>{percent(topFour * 100, 0)}</strong> de la inversión. Buenos Aires sola, el <strong>{percent((buenosAires.pctInversion ?? 0) * 100, 0)}</strong>.</div>
      <details className="province-notes">
        <summary>Notas sobre los datos por provincia</summary>
        <div className="province-notes-body">
          <p className="regional-note">{campaignData.avisos.regional}</p>
          <div className="regional-extra"><span>Otras / sin identificar · alcance <b>{count(campaignData.otrasSinIdentificar.alcance)}</b></span><span>Inversión <b>{ars(campaignData.otrasSinIdentificar.inversion)}</b></span></div>
        </div>
      </details>
    </div>
  </div>;
}

function App() {
  const [funnelVisible, setFunnelVisible] = useState(false);
  const funnelRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const node = funnelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setFunnelVisible(true); observer.disconnect(); }
    }, { threshold: .2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const playsShare = ratio(num('thruplays'), num('reproducciones')) * 100;
  const products = campaign.estrategia.split(':').at(-1)?.split('+').map(name => name.trim()) ?? [];
  const topCards = [
    { id: 'thruplays' as MetricId, title: indicator('thruplays').indicador, value: count(num('thruplays')), foot: `${percent(playsShare, 1)} de las reproducciones`, featured: true },
    { id: 'costo_thruplay' as MetricId, title: indicator('costo_thruplay').indicador, value: ars(num('costo_thruplay'), 2), foot: undefined },
    { id: 'alcance' as MetricId, title: indicator('alcance').indicador, value: count(num('alcance')), foot: undefined },
    { id: 'inversion' as MetricId, title: indicator('inversion').indicador, value: ars(num('inversion')), foot: undefined },
  ];
  const smaller = [
    { id: 'cpm' as MetricId, title: indicator('cpm').indicador, value: ars(num('cpm')) },
    { id: 'frecuencia' as MetricId, title: indicator('frecuencia').indicador, value: `${decimal.format(num('frecuencia'))} veces` },
    { id: 'costo_alcance' as MetricId, title: indicator('costo_alcance').indicador, value: ars(num('costo_alcance'), 2) },
    { id: 'interacciones' as MetricId, title: indicator('interacciones').indicador, value: count(num('interacciones')) },
  ];
  const campaignDetails = [
    { label: 'Estrategia', content: <><p>{campaign.estrategia.split(':')[0]}</p><div className="product-chips">{products.map(product => <b key={product}>{product}</b>)}</div></> },
    { label: 'Audiencia', text: campaign.publico },
    { label: 'Objetivo', text: campaign.objetivo },
    { label: 'Optimización', text: campaign.optimizadaPara },
    { label: 'Cómo se evalúa', text: campaign.comoSeEvalua },
    { label: 'Comparación', text: campaign.conQueSeCompara },
    { label: 'Período', text: campaign.periodo },
    { label: 'Lanzamiento', text: campaign.lanzamiento },
    { label: 'Presupuesto diario', text: `${campaign.presupuestoDiario} · ${campaign.ajustePresupuesto}` },
    { label: 'Duración del video', text: campaign.duracionVideo },
    { label: 'Nombre de campaña en Meta', text: campaign.nombreMeta },
    { label: 'Conjunto de anuncios', text: campaign.conjuntoAnuncios },
  ];
  const pendingClass = (status: string) => status.startsWith('Cargado') ? 'loaded' : status.startsWith('Parcial') ? 'partial' : 'pending-status';
  const pendingLabel = (status: string) => status.startsWith('Cargado') ? 'Cargado' : status.startsWith('Parcial') ? 'Parcial' : status.startsWith('Sin fecha') ? 'Sin fecha' : 'Pendiente';

  return <main className="dashboard">
    <header className="topbar">
      <div className="brand-logos" aria-label={campaign.marca}>
        <img className="logo-vetanco" src="/logos/logo-vetanco.png" alt="Vetanco" />
        <span className="brand-divider" aria-hidden="true" />
        <img className="logo-compromiso" src="/logos/logo-compromiso-vetanco.png" alt="Compromiso Vetanco" />
      </div>
      <div className="head-meta"><span className="live-chip"><span />{campaign.estado}</span><span>Datos al {campaign.fechaCorte}</span></div>
    </header>

    <section className="hero" aria-labelledby="hero-title">
      <video autoPlay muted loop playsInline preload="metadata" poster="/hero/portada.jpg" aria-hidden="true"><source src="/hero/portada.mp4" type="video/mp4" /></video>
      <div className="hero-shade" />
      <div className="hero-content">
        <span className="eyebrow">{campaign.plataforma.toUpperCase()} · {campaign.estrategia.split(':')[0].toUpperCase()}</span>
        <h1 id="hero-title">{campaign.nombre}: seguimiento de campaña</h1>
        <p className="hero-quote">“{campaign.mensaje}”</p>
        <p className="hero-summary-copy">La campaña acumula <strong>{count(num('thruplays'))} ThruPlays</strong> a <strong>{ars(num('costo_thruplay'), 2)} cada uno</strong>. El <strong>{percent(playsShare, 0)}</strong> de las reproducciones llegó a los <strong>{thruPlaySeconds} segundos</strong>.</p>
        <div className="hero-strip"><span>Período <b>{campaign.periodo}</b></span><span>Presupuesto diario <b>{campaign.presupuestoDiario}</b></span><span>Conjunto <b>{campaign.conjuntoAnuncios}</b></span></div>
      </div>
    </section>

    <div className="content">
      <section className="section" aria-labelledby="results-title">
        <div className="section-heading"><div><span className="section-kicker">Rendimiento acumulado · ARS</span><h2 className="section-title" id="results-title">Resultados principales</h2></div></div>
        <div className="results-grid">{topCards.map(card => <MetricCard key={card.id} id={card.id} label={card.title} value={card.value} foot={card.foot} featured={card.featured} />)}</div>
      </section>

      <section className="section" aria-labelledby="funnel-title" ref={funnelRef}>
        <div className="section-heading"><div><span className="section-kicker">Atención de audiencia</span><h2 className="section-title" id="funnel-title">Embudo de visualización</h2><p className="section-desc">Recorrido del anuncio desde su aparición hasta el final del video de {campaign.duracionVideo}. Campaña optimizada para {campaign.optimizadaPara}.</p></div></div>
        <Funnel onVisible={funnelVisible} />
        <p className="funnel-note">El video dura {campaign.duracionVideo}. La campaña está optimizada para {campaign.optimizadaPara}.</p>
      </section>

      <section className="section" aria-labelledby="map-title">
        <div className="section-heading"><div><span className="section-kicker">Cobertura geográfica</span><h2 className="section-title" id="map-title">Dónde llegó la campaña</h2><p className="section-desc">Distribución del alcance y la inversión reportados por Meta Ads en Argentina.</p></div></div>
        <ArgentinaMap />
      </section>

      <section className="section" aria-labelledby="efficiency-title">
        <div className="section-heading"><div><span className="section-kicker">Lectura complementaria</span><h2 className="section-title" id="efficiency-title">Eficiencia e interacción</h2></div></div>
        <div className="small-metrics">{smaller.map(item => <article className="small-card" key={item.id}><span>{item.title}</span><strong>{item.value}</strong>{item.id === 'interacciones' && <p className="interaction-note"><CircleHelp size={13} aria-hidden="true" /> Campaña de awareness: no se mide por interacciones. {campaign.comoSeEvalua}</p>}</article>)}</div>
      </section>

      <section className="section" aria-labelledby="sheet-title">
        <div className="section-heading"><div><span className="section-kicker">Ficha de campaña</span><h2 className="section-title" id="sheet-title">Criterios y configuración</h2></div></div>
        <div className="sheet">{campaignDetails.map(detail => <article className="sheet-item" key={detail.label}><span>{detail.label}</span>{detail.content ?? <p>{detail.text}</p>}</article>)}</div>
      </section>

      <section className="section" aria-labelledby="pending-title">
        <details className="pending">
          <summary id="pending-title">Datos pendientes de Meta Ads <span>{count(campaignData.pendientes.length)} registros</span></summary>
          <div className="pending-list">{campaignData.pendientes.map(item => <div className="pending-row" key={item.dato}><span><strong>{item.dato}</strong><br />{item.estado}</span><span className={`status ${pendingClass(item.estado)}`}>{pendingLabel(item.estado)}</span></div>)}</div>
        </details>
      </section>
      {campaignData.retencionVideo.disponible && <section className="section retention" aria-labelledby="retention-title">
        <div className="section-heading"><div><span className="section-kicker">Atención de audiencia</span><h2 className="section-title" id="retention-title">Retención del video</h2></div></div>
        <p className="section-desc">{campaignData.retencionVideo.nota}</p>
      </section>}
    </div>
    <footer className="footer">
      <p>{campaignData.avisos.general}<br /><br />{campaignData.avisos.datoAnterior}</p>
      <div className="footer-brand">Documento de uso interno · PACTA · Compromiso Vetanco</div>
    </footer>
  </main>;
}

export default App;
