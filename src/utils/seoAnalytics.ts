import { SEODataPoint, TargetKeyword, SEODiagnosis, QuadrantSummary } from '../types/seo';
import { calculateLinearRegression, calculateMean } from './math';

export const DEFAULT_DOMAIN = 'belkacompany.com';

export const DEFAULT_TARGET_KEYWORDS: TargetKeyword[] = [
  {
    id: 'kw-1',
    text: 'agencia marketing digital ecommerce',
    intent: 'Transaccional',
    searchVolume: 18400,
    difficulty: 48,
    currentPosition: 6.4,
    rankingProbability: 82,
    confidenceScore: 88,
    matchedImpressions: 145000,
    matchedClicks: 5200,
    matchedCTR: 3.58,
  },
  {
    id: 'kw-2',
    text: 'auditoria seo tecnica gsc',
    intent: 'Comercial',
    searchVolume: 12100,
    difficulty: 54,
    currentPosition: 9.8,
    rankingProbability: 69,
    confidenceScore: 82,
    matchedImpressions: 89000,
    matchedClicks: 2150,
    matchedCTR: 2.41,
  },
  {
    id: 'kw-3',
    text: 'optimizacion ctr search console',
    intent: 'Informativa',
    searchVolume: 9200,
    difficulty: 38,
    currentPosition: 4.2,
    rankingProbability: 89,
    confidenceScore: 91,
    matchedImpressions: 210000,
    matchedClicks: 9400,
    matchedCTR: 4.47,
  },
  {
    id: 'kw-4',
    text: 'consultor seo internacional',
    intent: 'Transaccional',
    searchVolume: 6500,
    difficulty: 68,
    currentPosition: 14.5,
    rankingProbability: 47,
    confidenceScore: 74,
    matchedImpressions: 34000,
    matchedClicks: 620,
    matchedCTR: 1.82,
  },
  {
    id: 'kw-5',
    text: 'estrategia palabras clave transaccionales',
    intent: 'Informativa',
    searchVolume: 4300,
    difficulty: 31,
    currentPosition: 3.1,
    rankingProbability: 93,
    confidenceScore: 94,
    matchedImpressions: 56000,
    matchedClicks: 2890,
    matchedCTR: 5.16,
  },
];

export const PRESET_DATASETS = {
  belkaEcommerce: {
    name: 'Belka Company (Auditoría E-Commerce)',
    domain: 'belkacompany.com',
    keywords: [
      'agencia marketing digital ecommerce',
      'auditoria seo tecnica gsc',
      'optimizacion ctr search console',
      'consultor seo internacional',
      'estrategia palabras clave transaccionales',
    ],
    rawText: `impresiones, clics, query, posicion
850000, 24500, agencia marketing digital ecommerce, 4.2
1250000, 14200, auditoria seo tecnica gsc, 8.6
620000, 29800, optimizacion ctr search console, 3.1
310000, 3800, consultor seo internacional, 12.4
180000, 8900, estrategia palabras clave transaccionales, 2.9
2400000, 31000, servicios seo b2b espana, 7.1
1850000, 16200, como aumentar clics organicos google, 9.3
920000, 34500, arquitectura web seo semrush, 3.8
450000, 4100, migracion de dominio seo sin perder trafico, 14.2
780000, 21000, rich snippets faq schema markup, 5.0
1400000, 11500, canibalizacion palabras clave correccion, 11.8
520000, 19200, intencion de busqueda transaccional vs comercial, 4.4
380000, 2900, presupuesto agencia seo pymes, 15.0
2100000, 48000, guia completa google search console 2026, 2.7
1650000, 18500, core web vitals inp lcp solucion, 8.1
290000, 12800, cluster tematico pillar page seo, 3.5
840000, 9400, enlazado interno pagerank escultura, 10.3
410000, 3100, seo para tiendas shopify plus, 13.5
1150000, 36000, metatitulo seo generador plantilla, 3.2
690000, 7200, reduccion tasa de rebote organic traffic, 12.0
1550000, 22400, seo programatico casos de exito, 6.5
490000, 14800, velocidad de carga web wordpress cdn, 4.8
340000, 2200, penalizacion algoritmica google core update, 16.2
980000, 28900, consultoria seo precio hora europa, 5.2`,
  },

  saasGrowth: {
    name: 'SaaS B2B Tech Growth',
    domain: 'cloudanalytics-saas.io',
    keywords: [
      'software bi empresarial',
      'dashboard kpi ventas saas',
      'analitica predictiva marketing',
      'integracion data warehouse api',
      'plataforma reporting automatizado',
    ],
    rawText: `impresiones, clics, query, posicion
620000, 19500, software bi empresarial, 4.5
940000, 11200, dashboard kpi ventas saas, 8.2
480000, 18400, analitica predictiva marketing, 3.9
310000, 2900, integracion data warehouse api, 13.1
750000, 28100, plataforma reporting automatizado, 3.2
1450000, 18000, herramientas de visualizacion datos 2026, 7.8
1120000, 9200, conector salesforce power bi alternativa, 11.4
390000, 13400, cuadro de mando ejecutivo plantilla, 4.2
880000, 22100, automatizacion pipelines etl postgres, 5.8
540000, 5100, gestion permisos rbac en cloud, 12.7
1680000, 24000, software de business intelligence pymes, 6.9
430000, 3200, monitorizacion de data drift machine learning, 14.5
810000, 29400, informes automatizados semanal slack bot, 3.6
670000, 7800, api rest para extraccion metricas leads, 10.9
1950000, 31200, comparativa metabase tableau looker, 6.3`,
  },

  contentPortal: {
    name: 'Portal de Contenidos & Media',
    domain: 'revistadigitaltech.com',
    keywords: [
      'inteligencia artificial tendencias',
      'desarrollo frontend react 19',
      'cloud computing guias',
      'ciberseguridad empresas pymes',
      'automatizacion no-code herramientas',
    ],
    rawText: `impresiones, clics, query, posicion
2800000, 74000, inteligencia artificial tendencias, 2.8
3400000, 39000, desarrollo frontend react 19, 7.5
1900000, 48000, cloud computing guias, 4.1
1200000, 14000, ciberseguridad empresas pymes, 9.8
1450000, 32000, automatizacion no-code herramientas, 4.6
4100000, 52000, mejores lenguajes programacion 2026, 6.4
2200000, 61000, tutorial typescript avanzado tipos, 3.2
1800000, 18000, arquitectura microservicios vs monolito, 8.9
950000, 8400, regulacion ia union europea compliance, 11.2
1600000, 39500, computacion cuantica que es explicacion, 4.9
3100000, 44000, prompts para desarrollo de software, 6.1
870000, 29000, productividad desarrolladores herramientas, 3.4`,
  },
};

/**
 * Executes full SEO Diagnosis with Quadrant partitioning and actionable recommendations
 */
export function calculateSEODiagnosis(
  points: SEODataPoint[],
  domain: string,
  targetKeywords: TargetKeyword[]
): SEODiagnosis {
  if (points.length === 0) {
    const emptyQuad = (type: QuadrantSummary['type'], title: string): QuadrantSummary => ({
      type,
      title,
      description: '',
      count: 0,
      totalImpressions: 0,
      totalClicks: 0,
      avgCTR: 0,
      recommendation: '',
      points: [],
    });

    return {
      totalImpressions: 0,
      totalClicks: 0,
      globalCTR: 0,
      benchmarkCTR: 2.8,
      ctrDifference: 0,
      regressionSlope: 0,
      expectedClicksPer1kImpressions: 0,
      quadrants: {
        champions: emptyQuad('champions', 'Términos Estrella'),
        ctr_opportunity: emptyQuad('ctr_opportunity', 'Oportunidades de CTR'),
        zombie: emptyQuad('zombie', 'Contenido Zombie'),
        niche_power: emptyQuad('niche_power', 'Joyas de Nicho'),
      },
      keyInsights: [],
      actionPlan: [],
    };
  }

  const totalImpressions = points.reduce((acc, p) => acc + p.impressions, 0);
  const totalClicks = points.reduce((acc, p) => acc + p.clicks, 0);
  const globalCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const benchmarkCTR = 2.85; // Standard healthy organic search benchmark
  const ctrDifference = Number((globalCTR - benchmarkCTR).toFixed(2));

  // Thresholds for quadrants: using median or averages
  const medianImp = calculateMean(points.map(p => p.impressions));
  const medianClicks = calculateMean(points.map(p => p.clicks));

  // Regress clicks vs impressions
  const regression = calculateLinearRegression(
    points.map(p => ({ x: p.impressions, y: p.clicks }))
  );
  const expectedClicksPer1kImpressions = Math.max(0, regression.slope * 1000);

  // Group by Quadrants
  const championsPts: SEODataPoint[] = [];
  const ctrOpportunityPts: SEODataPoint[] = [];
  const zombiePts: SEODataPoint[] = [];
  const nichePowerPts: SEODataPoint[] = [];

  points.forEach(pt => {
    const isHighImp = pt.impressions >= medianImp;
    const isHighClicks = pt.clicks >= medianClicks;

    if (isHighImp && isHighClicks) {
      championsPts.push(pt);
    } else if (isHighImp && !isHighClicks) {
      ctrOpportunityPts.push(pt);
    } else if (!isHighImp && !isHighClicks) {
      zombiePts.push(pt);
    } else {
      nichePowerPts.push(pt);
    }
  });

  const makeQuad = (
    type: QuadrantSummary['type'],
    title: string,
    description: string,
    pts: SEODataPoint[],
    rec: string
  ): QuadrantSummary => {
    const imp = pts.reduce((acc, p) => acc + p.impressions, 0);
    const clk = pts.reduce((acc, p) => acc + p.clicks, 0);
    const ctr = imp > 0 ? (clk / imp) * 100 : 0;
    return {
      type,
      title,
      description,
      count: pts.length,
      totalImpressions: imp,
      totalClicks: clk,
      avgCTR: Number(ctr.toFixed(2)),
      recommendation: rec,
      points: pts.sort((a, b) => b.impressions - a.impressions),
    };
  };

  const quadrants = {
    champions: makeQuad(
      'champions',
      'Términos Estrella (Champions)',
      'Máximo rendimiento con alto volumen y alta tracción de clics orgánicos.',
      championsPts,
      'Proteger la posición TOP 1-3 mediante actualización continua de contenidos y refuerzo de enlaces internos.'
    ),
    ctr_opportunity: makeQuad(
      'ctr_opportunity',
      'Oportunidades Críticas de CTR',
      'Gran exposición en impresiones GSC pero tasa de clics por debajo del potencial.',
      ctrOpportunityPts,
      'Reescribir Title Tags y Meta Descriptions con llamadas a la acción irresistibles, números y marcado Rich Snippets.'
    ),
    zombie: makeQuad(
      'zombie',
      'Contenido Latente o Larga Cola',
      'Baja visibilidad e impresiones reducidas.',
      zombiePts,
      'Evaluar si fusionar con páginas pilares (content pruning) o enfocar intención de búsqueda.'
    ),
    niche_power: makeQuad(
      'niche_power',
      'Joyas de Alta Eficiencia (Nicho)',
      'Impresiones moderadas pero un CTR excepcional que convierte muy bien.',
      nichePowerPts,
      'Expandir el clúster semántico con palabras clave secundarias para multiplicar su volumen de impresiones.'
    ),
  };

  // Build Key Insights
  const keyInsights: SEODiagnosis['keyInsights'] = [];

  // Insight 1: Global CTR
  if (globalCTR >= benchmarkCTR) {
    keyInsights.push({
      headline: `CTR Global Saludable (${globalCTR.toFixed(2)}%)`,
      details: `Tu CTR supera el benchmark del sector (${benchmarkCTR}%) por +${ctrDifference} pp. Excelente relevancia de snippets frente a las intenciones de búsqueda de Google.`,
      impact: 'Alta',
      type: 'positive',
    });
  } else {
    const potentialLostClicks = Math.round(((benchmarkCTR - globalCTR) / 100) * totalImpressions);
    keyInsights.push({
      headline: `Déficit de CTR Detectado (${globalCTR.toFixed(2)}% vs ${benchmarkCTR}%)`,
      details: `Existe una brecha de ${Math.abs(ctrDifference)} pp respecto al estándar. Podrías captar aproximadamente +${potentialLostClicks.toLocaleString('es-ES')} clics mensuales adicionales solo optimizando el atractivo en SERP.`,
      impact: 'Alta',
      type: 'warning',
    });
  }

  // Insight 2: High Impression Low CTR Leak
  if (quadrants.ctr_opportunity.count > 0) {
    const leakQueries = quadrants.ctr_opportunity.points.slice(0, 3).map(p => `"${p.keyword}"`).join(', ');
    keyInsights.push({
      headline: `${quadrants.ctr_opportunity.count} términos con fuga de clics en SERP`,
      details: `Términos como ${leakQueries} acumulan ${quadrants.ctr_opportunity.totalImpressions.toLocaleString('es-ES')} impresiones pero solo logran un CTR de ${quadrants.ctr_opportunity.avgCTR}%. Son Quick Wins inmediatos.`,
      impact: 'Alta',
      type: 'opportunity',
    });
  }

  // Insight 3: Target Keywords Momentum
  const activeTargetsWithData = targetKeywords.filter(tk => tk.text && tk.matchedImpressions > 0);
  if (activeTargetsWithData.length > 0) {
    const highestCTRTarget = [...activeTargetsWithData].sort((a, b) => b.matchedCTR - a.matchedCTR)[0];
    keyInsights.push({
      headline: `Palabra Clave Líder: "${highestCTRTarget.text}"`,
      details: `Alcanza un CTR de ${highestCTRTarget.matchedCTR}% en ${domain}. Presenta el mayor momentum para consolidar primeros puestos orgánicos.`,
      impact: 'Media',
      type: 'positive',
    });
  }

  // Build Action Plan
  const actionPlan: SEODiagnosis['actionPlan'] = [
    {
      title: 'Optimización de Title Tags & Meta Descriptions en Términos con Bajo CTR',
      category: 'Title & Snippets',
      description: `Aplicar la fórmula [Beneficio Clave] + [Número/Año] + [CTA de Intención] en las ${quadrants.ctr_opportunity.count} URLs del cuadrante de Oportunidad para elevar el CTR al menos un 1.2%.`,
      targetItems: quadrants.ctr_opportunity.points.slice(0, 4).map(p => `${p.keyword} (${p.impressions.toLocaleString('es-ES')} imp / ${p.ctr}% CTR)`),
      priority: 'Inmediata',
    },
    {
      title: 'Implementación de Rich Snippets (Schema.org FAQ & Product/Review)',
      category: 'Arquitectura & CTR',
      description: `Integrar marcado estructurado JSON-LD en ${domain} para ganar espacio visual en la página de resultados de Google y capturar clics por encima de competidores tradicionales.`,
      targetItems: targetKeywords.map(tk => tk.text).filter(Boolean).slice(0, 3),
      priority: 'Alta',
    },
    {
      title: 'Alineación de Intención de Búsqueda (Search Intent Match)',
      category: 'Intención & Contenido',
      description: `Revisar páginas en posición 6 a 15 con baja tasa de clics para asegurar que el formato (guía, catálogo, comparativa) coincide exactamente con lo que Google premia en las primeras 3 posiciones.`,
      targetItems: points.filter(p => (p.position || 0) >= 6 && (p.position || 0) <= 15).slice(0, 3).map(p => p.keyword),
      priority: 'Alta',
    },
    {
      title: 'Estrategia de Enlazado Interno desde Páginas Estrella',
      category: 'Canibalización & Enlazado',
      description: `Transferir PageRank interno desde las páginas en el Cuadrante Estrella (${quadrants.champions.points.slice(0, 2).map(p => p.keyword).join(', ')}) hacia las 5 palabras clave target de la estrategia.`,
      targetItems: targetKeywords.map(t => t.text).filter(Boolean),
      priority: 'Media',
    },
  ];

  return {
    totalImpressions,
    totalClicks,
    globalCTR: Number(globalCTR.toFixed(2)),
    benchmarkCTR,
    ctrDifference,
    regressionSlope: Number(regression.slope.toFixed(5)),
    expectedClicksPer1kImpressions: Number(expectedClicksPer1kImpressions.toFixed(1)),
    quadrants,
    keyInsights,
    actionPlan,
  };
}
