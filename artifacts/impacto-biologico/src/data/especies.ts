export type SpeciesKey = 'aves-corta' | 'aves-larga' | 'cerdos-engorde' | 'cerdos-repro';
export type Level = 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

export interface SpeciesProfile {
  key: SpeciesKey;
  animal: 'Aves' | 'Cerdos';
  type: string;
  title: string;
  exposure: number;
  exposureLevel: Level;
  organImpact: { name: string; value: number; level: Level; toxins: string[]; note: string }[];
  analyses: string;
  countries: string;
  clinical: { toxin: string; level: Level; note: string };
  technical: { title: string; body: string }[];
  trend: number[];
  conclusion: string;
}

// Valores exclusivamente ilustrativos. Editables para prototipado; no representan evidencia real.
export const speciesProfiles: Record<SpeciesKey, SpeciesProfile> = {
  'aves-corta': {
    key: 'aves-corta', animal: 'Aves', type: 'Ciclo corto', title: 'Pollo de engorde',
    exposure: 38, exposureLevel: 'Medio',
    organImpact: [
      { name: 'Hígado', value: 46, level: 'Medio', toxins: ['DON', 'Zearalenona'], note: 'Posible carga metabólica en dietas con exposición combinada.' },
      { name: 'Intestino', value: 62, level: 'Alto', toxins: ['DON', 'Fumonisinas'], note: 'La barrera intestinal concentra la señal de impacto estimada.' },
      { name: 'Inmunidad', value: 31, level: 'Bajo', toxins: ['Aflatoxina B₁'], note: 'Señal comparativamente baja en el conjunto ilustrativo.' },
      { name: 'Rendimiento', value: 54, level: 'Medio', toxins: ['DON', 'T-2'], note: 'El impacto potencial puede reflejarse en la eficiencia alimentaria.' },
    ],
    analyses: '2.846', countries: '18',
    clinical: { toxin: 'Deoxinivalenol (DON)', level: 'Alto', note: 'La exposición acumulada merece atención en el seguimiento de lotes.' },
    technical: [
      { title: 'Exposición estimada', body: 'Índice combinado de presencia y concentración potencial en materias primas.' },
      { title: 'Respuesta biológica', body: 'Pondera sensibilidad por etapa productiva y órgano diana.' },
      { title: 'Lectura contextual', body: 'El nivel es orientativo; no reemplaza análisis de alimento ni evaluación profesional.' },
    ],
    trend: [34, 36, 33, 41, 39, 43, 37, 38],
    conclusion: 'La señal intestinal y la exposición a DON destacan en este escenario ilustrativo. Conviene interpretar estos indicadores junto con la composición real de la dieta y el contexto del lote.',
  },
  'aves-larga': {
    key: 'aves-larga', animal: 'Aves', type: 'Ciclo largo', title: 'Ponedoras',
    exposure: 29, exposureLevel: 'Bajo',
    organImpact: [
      { name: 'Hígado', value: 35, level: 'Medio', toxins: ['Aflatoxina B₁', 'DON'], note: 'Atención a la exposición sostenida durante ciclos prolongados.' },
      { name: 'Intestino', value: 42, level: 'Medio', toxins: ['DON'], note: 'La respuesta intestinal estimada permanece en rango intermedio.' },
      { name: 'Inmunidad', value: 27, level: 'Bajo', toxins: ['Ocratoxina A'], note: 'Señal baja en el escenario de exposición de demostración.' },
      { name: 'Producción', value: 49, level: 'Medio', toxins: ['Zearalenona', 'DON'], note: 'La persistencia puede influir en la estabilidad productiva.' },
    ],
    analyses: '1.972', countries: '14',
    clinical: { toxin: 'Aflatoxina B₁', level: 'Medio', note: 'Considerar la exposición acumulada a lo largo del ciclo productivo.' },
    technical: [
      { title: 'Horizonte del ciclo', body: 'La lectura contempla una ventana productiva de mayor duración.' },
      { title: 'Exposición acumulada', body: 'Integra la posible continuidad de contaminantes en la dieta.' },
      { title: 'Interpretación', body: 'Indicadores demostrativos, no constituyen diagnóstico ni recomendación veterinaria.' },
    ],
    trend: [31, 28, 33, 30, 34, 27, 32, 29],
    conclusion: 'La duración del ciclo da relevancia a la exposición acumulada. El resultado no predice desempeño: es una referencia visual para explorar escenarios.',
  },
  'cerdos-engorde': {
    key: 'cerdos-engorde', animal: 'Cerdos', type: 'Engorde', title: 'Porcino de engorde',
    exposure: 51, exposureLevel: 'Medio',
    organImpact: [
      { name: 'Hígado', value: 58, level: 'Alto', toxins: ['Aflatoxina B₁', 'DON'], note: 'El metabolismo hepático muestra una señal destacada.' },
      { name: 'Intestino', value: 67, level: 'Alto', toxins: ['DON', 'Fumonisinas'], note: 'Posible afectación de integridad intestinal en este ejemplo.' },
      { name: 'Inmunidad', value: 43, level: 'Medio', toxins: ['Ocratoxina A'], note: 'La respuesta inmune estimada aparece en rango medio.' },
      { name: 'Rendimiento', value: 61, level: 'Alto', toxins: ['DON', 'Zearalenona'], note: 'La eficiencia de crecimiento concentra una señal elevada.' },
    ],
    analyses: '3.418', countries: '21',
    clinical: { toxin: 'Fumonisinas', level: 'Alto', note: 'La combinación de exposición requiere lectura contextual de la ración.' },
    technical: [
      { title: 'Ponderación por etapa', body: 'El modelo ilustrativo prioriza sensibilidad durante el crecimiento.' },
      { title: 'Exposición combinada', body: 'Considera la coexistencia potencial de varias familias de micotoxinas.' },
      { title: 'Uso responsable', body: 'Confirmar cualquier hallazgo mediante métodos analíticos adecuados.' },
    ],
    trend: [46, 49, 44, 53, 48, 56, 50, 51],
    conclusion: 'En este ejemplo, intestino y rendimiento muestran las señales más altas. Un análisis representativo del alimento es esencial antes de extraer conclusiones.',
  },
  'cerdos-repro': {
    key: 'cerdos-repro', animal: 'Cerdos', type: 'Reproducción', title: 'Porcino reproductor',
    exposure: 44, exposureLevel: 'Medio',
    organImpact: [
      { name: 'Hígado', value: 47, level: 'Medio', toxins: ['DON', 'Aflatoxina B₁'], note: 'Señal metabólica intermedia en el escenario mostrado.' },
      { name: 'Intestino', value: 39, level: 'Medio', toxins: ['DON'], note: 'La respuesta intestinal estimada mantiene un nivel moderado.' },
      { name: 'Reproducción', value: 64, level: 'Alto', toxins: ['Zearalenona'], note: 'La sensibilidad reproductiva destaca en esta combinación ilustrativa.' },
      { name: 'Inmunidad', value: 36, level: 'Medio', toxins: ['Ocratoxina A'], note: 'Posible presión inmune bajo exposición combinada.' },
    ],
    analyses: '1.536', countries: '16',
    clinical: { toxin: 'Zearalenona', level: 'Alto', note: 'La sensibilidad reproductiva orienta la atención del escenario.' },
    technical: [
      { title: 'Foco reproductivo', body: 'Se pondera la sensibilidad específica de hembras y machos reproductores.' },
      { title: 'Variabilidad', body: 'La respuesta potencial depende de dosis, duración y condición del animal.' },
      { title: 'Alcance', body: 'Datos de demostración; no inferir causalidad ni sustituir criterio veterinario.' },
    ],
    trend: [39, 42, 40, 46, 43, 48, 41, 44],
    conclusion: 'La señal reproductiva asociada a zearalenona sobresale en este escenario de demostración. La interpretación debe apoyarse en datos analíticos y asesoramiento especializado.',
  },
};
