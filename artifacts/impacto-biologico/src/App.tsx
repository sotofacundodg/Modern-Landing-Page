import { Fragment, useState, type ReactNode } from 'react';
import { AlertCircle, ArrowDownRight, ArrowUpRight, CircleHelp, Info, Leaf, ShieldCheck } from 'lucide-react';
import { speciesProfiles, type Level, type SpeciesKey, type SpeciesProfile } from '@/data/especies';

const levelColors: Record<Level, string> = {
  Crítico: '#f8303b', Alto: '#ff8441', Medio: '#f5c242', Bajo: '#3a994e',
};
const options: Record<'Aves' | 'Cerdos', { key: SpeciesKey; label: string }[]> = {
  Aves: [{ key: 'aves-corta', label: 'Ciclo corto' }, { key: 'aves-larga', label: 'Ciclo largo' }],
  Cerdos: [{ key: 'cerdos-engorde', label: 'Engorde' }, { key: 'cerdos-repro', label: 'Reproducción' }],
};
const infoText = {
  exposure: 'Porcentaje índice de exposición potencial estimada en la combinación seleccionada. La escala y los valores son únicamente ilustrativos.',
  organs: 'Porcentaje de impacto relativo estimado para cada órgano o sistema en este escenario de demostración.',
  updated: 'El recuento y la cobertura geográfica son cifras de muestra; no corresponden a una base de datos real.',
  clinical: 'Nivel orientativo de relevancia clínica para la toxina destacada. No es evaluación clínica ni diagnóstico.',
  technical: 'Descripción de los factores considerados por el modelo ilustrativo. No equivale a metodología veterinaria validada.',
  trend: 'Porcentaje de índice ilustrativo por año entre 2018 y 2025. Las variaciones muestran puntos porcentuales entre años.',
};

function InfoButton({ metric }: { metric: keyof typeof infoText }) {
  const [open, setOpen] = useState(false);
  return <div className="info-wrap">
    <button className="info-button" type="button" aria-label="Información sobre la métrica" aria-expanded={open} aria-describedby={open ? `tip-${metric}` : undefined} onClick={() => setOpen(!open)} data-testid={`button-info-${metric}`}>
      <Info size={14} />
    </button>
    {open && <div className="info-popover" id={`tip-${metric}`} role="tooltip">{infoText[metric]}</div>}
  </div>;
}

function Panel({ title, metric, children, className = '' }: { title: string; metric: keyof typeof infoText; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`} aria-label={title}>
    <header className="panel-head"><h2>{title}</h2><InfoButton metric={metric} /></header>
    {children}
  </section>;
}

function Ring({ value, level }: { value: number; level: Level }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  return <div className="ring-wrap">
    <svg className="exposure-ring" viewBox="0 0 112 112" role="img" aria-label={`Exposición general ${value} por ciento`}>
      <circle cx="56" cy="56" r={radius} fill="none" stroke="rgba(33,55,48,.11)" strokeWidth="8" />
      <circle cx="56" cy="56" r={radius} fill="none" stroke={levelColors[level]} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${circumference * value / 100} ${circumference}`} transform="rotate(-90 56 56)" className="ring-progress" />
      <text x="56" y="54" textAnchor="middle" className="ring-number">{value}%</text>
      <text x="56" y="71" textAnchor="middle" className="ring-caption">ÍNDICE</text>
    </svg>
    <div className="ring-level"><span className="level-dot" style={{ background: levelColors[level] }} />Nivel <b>{level}</b></div>
  </div>;
}

function TrendChart({ values }: { values: number[] }) {
  const width = 350, height = 116, padX = 16, padY = 20;
  const min = Math.min(...values) - 8, max = Math.max(...values) + 8;
  const coords = values.map((value, i) => ({
    x: padX + i * (width - padX * 2) / (values.length - 1),
    y: height - padY - ((value - min) / (max - min)) * (height - padY * 2),
  }));
  const path = coords.map((point, i) => `${i ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const diff = values[values.length - 1] - values[0];
  return <div className="trend-wrap">
    <div className="chart-topline"><span>Índice estimado</span><span className={`trend-change ${diff > 0 ? 'up' : 'down'}`}>{diff > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{diff > 0 ? '+' : ''}{diff} pp</span></div>
    <svg viewBox={`0 0 ${width} ${height}`} className="trend-chart" role="img" aria-label="Evolución ilustrativa de 2018 a 2025">
      <path d={`M ${coords[0].x} ${height - padY} L ${coords.map(p => `${p.x} ${p.y}`).join(' L ')} L ${coords[coords.length - 1].x} ${height - padY} Z`} className="chart-fill" />
      <path d={path} className="chart-line" />
      {coords.map((point, i) => <g key={i}>
        {(i === 0 || i === coords.length - 1) && <><line x1={point.x} x2={point.x} y1={point.y - 16} y2={height - padY} className="chart-guide" /><text x={point.x} y={point.y - 8} className="chart-value" textAnchor={i === 0 ? 'start' : 'end'}>{values[i]}%</text></>}
        <circle cx={point.x} cy={point.y} r={i === coords.length - 1 ? 4 : 2.6} className={i === coords.length - 1 ? 'chart-point current' : 'chart-point'} />
      </g>)}
    </svg>
    <div className="chart-years"><span>2018</span><span>2025</span></div>
    <div className="year-changes">{values.slice(1).map((v, i) => <span key={i} className={v - values[i] >= 0 ? 'change-positive' : 'change-negative'}>{v - values[i] > 0 ? '+' : ''}{v - values[i]}</span>)}</div>
  </div>;
}

function App() {
  const [activeKey, setActiveKey] = useState<SpeciesKey>('aves-corta');
  const [failedVideos, setFailedVideos] = useState<Partial<Record<SpeciesKey, boolean>>>({});
  const profile = speciesProfiles[activeKey];
  const setAnimal = (animal: 'Aves' | 'Cerdos') => {
    setActiveKey(options[animal][0].key);
  };
  const setType = (key: SpeciesKey) => setActiveKey(key);
  return <main className="app-shell" data-species={profile.animal.toLowerCase()}>
    <header className="topbar">
      <a className="brand" href="/" aria-label="Impacto biológico, inicio"><span className="brand-mark"><Leaf size={19} /></span><span>Observatorio<br /><b>BIOLÓGICO</b></span></a>
      <div className="demo-chip"><span />Datos de demostración</div>
    </header>

    <section className="selector-bar" aria-label="Filtros de consulta">
      <div className="filter-tabs" role="tablist" aria-label="Criterio de consulta">
        <button type="button" role="tab" aria-selected="false" disabled>País</button>
        <button type="button" role="tab" aria-selected="true" className="selected-tab" data-testid="tab-species">Especie</button>
        <button type="button" role="tab" aria-selected="false" disabled>Materia prima</button>
      </div>
      <div className="control-divider" aria-hidden="true" />
      <div className="choice-group" role="group" aria-label="Especie">
        {(['Aves', 'Cerdos'] as const).map(animal => <button key={animal} type="button" className={`choice-button ${profile.animal === animal ? 'selected' : ''}`} onClick={() => setAnimal(animal)} aria-pressed={profile.animal === animal} data-testid={`button-animal-${animal.toLowerCase()}`}>{animal}</button>)}
      </div>
      <div className="choice-group stage-choice" role="group" aria-label={`Etapa productiva de ${profile.animal}`}>
        {options[profile.animal].map(option => <button type="button" key={option.key} onClick={() => setType(option.key)} className={`choice-button stage-choice-button ${activeKey === option.key ? 'selected' : ''}`} aria-pressed={activeKey === option.key} data-testid={`button-stage-${option.key}`}>{option.label}</button>)}
      </div>
      <span className="filter-note">País y materia prima estarán disponibles próximamente.</span>
    </section>

    <section className="dashboard" data-profile={profile.key} aria-label="Resumen biológico">
      <div className="visual-backdrop">
        {(['aves-corta', 'aves-larga', 'cerdos-engorde', 'cerdos-repro'] as SpeciesKey[]).map(key => <Fragment key={key}>
          <img src={`/hero/${key}.jpg`} alt="" className={`animal-poster ${activeKey === key && failedVideos[key] ? 'is-active' : ''}`} />
          <video className={`animal-video ${activeKey === key && !failedVideos[key] ? 'is-active' : ''}`} autoPlay muted loop playsInline preload="metadata" poster={`/hero/${key}.jpg`} onError={() => setFailedVideos(current => ({ ...current, [key]: true }))} aria-hidden="true">
            <source src={`/hero/${key}.mp4`} type="video/mp4" />
          </video>
        </Fragment>)}
        <div className="visual-shade" />
        <div className="visual-caption"><span>ESCENARIO ACTIVO</span><b>{profile.animal} <i>·</i> {profile.type}</b></div>
        <div className="animal-word">{profile.animal === 'Aves' ? 'AVES' : 'CERDOS'}</div>
      </div>
      <div className="hero-heading">
        <span className="eyebrow">CENTRO DE LECTURA · 2025</span>
        <h1>Impacto biológico en los animales</h1>
        <p>Resumen ilustrativo de exposición e impacto en animales de producción</p>
      </div>
      <div className="dashboard-grid" key={profile.key}>
        <div className="panel-column left-column">
          <Panel title="Exposición general" metric="exposure" className="exposure-panel">
            <div className="exposure-content"><Ring value={profile.exposure} level={profile.exposureLevel} /><div className="exposure-copy"><span className="mini-label">COMBINACIÓN ACTUAL</span><strong>{profile.animal} <span>·</span> {profile.type}</strong><p>Índice de exposición potencial del escenario.</p></div></div>
          </Panel>
          <Panel title="Impacto por órgano / sistema" metric="organs" className="organs-panel">
            <div className="organ-list">{profile.organImpact.map((organ, i) => <article className="organ-row" key={organ.name} data-testid={`organ-${i}`}>
              <div className="organ-top"><strong>{organ.name}</strong><span className="organ-level"><i style={{ background: levelColors[organ.level] }} />{organ.level}</span><b className="organ-percent">{organ.value}%</b></div>
              <div className="meter"><span style={{ width: `${organ.value}%`, background: levelColors[organ.level] }} /></div>
              <p>{organ.note}</p><div className="toxin-list">{organ.toxins.map(t => <span key={t}>{t}</span>)}</div>
            </article>)}</div>
          </Panel>
          <Panel title="Evolución ilustrativa · 2018–2025" metric="trend" className="trend-panel"><TrendChart values={profile.trend} /></Panel>
        </div>

        <div className="center-column">
          <div className="active-combination"><span className="live-dot" />{profile.animal} <span>/</span> {profile.type}</div>
          <div className="center-callout"><span>PERFIL DE REFERENCIA</span><strong>{profile.title}</strong><p>Lectura visual del escenario activo</p></div>
        </div>

        <div className="panel-column right-column">
          <Panel title="Última actualización" metric="updated" className="update-panel">
            <div className="update-date"><span className="date-mark">25</span><div><b>Actualización de muestra</b><span>Contenido de ejemplo · 2025</span></div></div>
            <div className="update-stats"><div><strong>{profile.analyses}</strong><span>Análisis ilustrativos</span></div><div><strong>{profile.countries}</strong><span>Países de referencia</span></div></div>
            <p className="sample-note"><AlertCircle size={13} />Sin conexión a una base de datos real</p>
          </Panel>
          <Panel title="Relevancia clínica" metric="clinical" className="clinical-panel">
            <div className="clinical-tag"><span className="clinical-symbol"><ShieldCheck size={19} /></span><span>TOXINA DESTACADA</span><b>{profile.clinical.toxin}</b></div>
            <div className="clinical-level"><span>Nivel orientativo</span><b><i style={{ background: levelColors[profile.clinical.level] }} />{profile.clinical.level}</b></div>
            <p className="clinical-note">{profile.clinical.note}</p>
          </Panel>
          <Panel title="Interpretación técnica" metric="technical" className="technical-panel">
            <div className="technical-list">{profile.technical.map((item, i) => <article className="technical-item" key={item.title}><span className="technical-index">0{i + 1}</span><div><b>{item.title}</b><p>{item.body}</p></div></article>)}</div>
          </Panel>
        </div>
      </div>
    </section>

    <section className="conclusion-band" aria-label="Conclusiones ilustrativas">
      <div className="conclusion-kicker"><CircleHelp size={16} /><span>Conclusiones</span></div>
      <p>{profile.conclusion}</p>
      <span className="conclusion-disclaimer">No es consejo veterinario</span>
    </section>
    <footer className="footer"><span>Observatorio biológico · Resumen visual</span><span>Contenido demostrativo · No usar para decisiones clínicas</span></footer>
  </main>;
}

export default App;
