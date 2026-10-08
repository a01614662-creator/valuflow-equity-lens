// ARCHIVO GENERADO por tools/excel/extract_dataset.py a partir del Excel maestro integrado. No editar a mano.
// Valores con precisión completa (sin redondear). Las referencias de celda viven en los campos source/cell.
/* eslint-disable */
export const SORIANA_XL = {
 "file": "EXCEL DEFINITIVO DE VALUACION DE SORIANA - MODELO INTEGRADO.xlsx",
 "build": {
  "source": "Excel maestro · hoja 'Proyección Final Soriana' (filas 5–117)",
  "weightsExternal": [
   0.7,
   0.7,
   0.75,
   0.8,
   0.85
  ],
  "sales": {
   "gdp": [
    0.014,
    0.018,
    0.02,
    0.02,
    0.02
   ],
   "elasticity": [
    0.5,
    0.5,
    0.5,
    0.5,
    0.5
   ],
   "consumptionAdj": [
    -0.04,
    -0.015,
    -0.005,
    0,
    0
   ],
   "adjustments": [
    {
     "label": "(±) Pérdida de participación (hard discount y competidores)",
     "cell": "C15:G15",
     "values": [
      -0.03,
      -0.02,
      -0.0125,
      -0.01,
      -0.0075
     ]
    },
    {
     "label": "(±) Cierre y reducción de tiendas",
     "cell": "C16:G16",
     "values": [
      -0.01,
      -0.005,
      0,
      0,
      0
     ]
    },
    {
     "label": "(±) Remesas y política migratoria de EU",
     "cell": "C17:G17",
     "values": [
      -0.003,
      -0.002,
      -0.001,
      0,
      0
     ]
    },
    {
     "label": "(±) T-MEC y aranceles de EU (empleo industrial del Norte)",
     "cell": "C18:G18",
     "values": [
      -0.002,
      -0.003,
      -0.001,
      0,
      0
     ]
    },
    {
     "label": "(±) Programas sociales y salario mínimo (ingreso disponible)",
     "cell": "C19:G19",
     "values": [
      0.002,
      0.003,
      0.003,
      0.002,
      0.002
     ]
    },
    {
     "label": "(±) Omnicanalidad y ventas digitales",
     "cell": "C20:G20",
     "values": [
      0.003,
      0.004,
      0.005,
      0.005,
      0.005
     ]
    },
    {
     "label": "(±) PACIC e IEPS (precio tope y menor volumen)",
     "cell": "C21:G21",
     "values": [
      -0.002,
      -0.002,
      -0.001,
      0,
      0
     ]
    },
    {
     "label": "(±) Ingresos inmobiliarios y financieros (m² liberados, Sofipo)",
     "cell": "C22:G22",
     "values": [
      0.001,
      0.002,
      0.002,
      0.002,
      0.002
     ]
    }
   ],
   "lsSales": [
    174278.0,
    163936.6,
    153151,
    142365.4,
    131579.8,
    120794.2
   ]
  },
  "margin": {
   "base": 0.042542883699969,
   "adjustments": [
    {
     "label": "(±) Austeridad, cierres y eficiencias",
     "cell": "C32:G32",
     "values": [
      0.0055,
      0.003,
      0.002,
      0.001,
      0.001
     ]
    },
    {
     "label": "(±) Salario mínimo +13% y jornada de 40 h",
     "cell": "C33:G33",
     "values": [
      -0.001,
      -0.0015,
      -0.0015,
      -0.001,
      -0.001
     ]
    },
    {
     "label": "(±) Inversión en precio (hard discount, PACIC)",
     "cell": "C34:G34",
     "values": [
      -0.0015,
      -0.001,
      -0.001,
      -0.0005,
      0
     ]
    },
    {
     "label": "(±) Tipo de cambio y aranceles a importaciones de Asia",
     "cell": "C35:G35",
     "values": [
      -0.0005,
      -0.0005,
      0,
      0,
      0
     ]
    },
    {
     "label": "(±) Energía, combustibles y fletes",
     "cell": "C36:G36",
     "values": [
      -0.0005,
      -0.0005,
      0,
      0,
      0
     ]
    },
    {
     "label": "(±) Rentas comerciales (tiendas arrendadas)",
     "cell": "C37:G37",
     "values": [
      -0.0003,
      -0.0003,
      -0.0002,
      -0.0002,
      -0.0002
     ]
    },
    {
     "label": "(±) Ingresos inmobiliarios y servicios financieros",
     "cell": "C38:G38",
     "values": [
      0.0005,
      0.001,
      0.001,
      0.001,
      0.0005
     ]
    },
    {
     "label": "(±) Desapalancamiento operativo por menores ventas",
     "cell": "C39:G39",
     "values": [
      -0.001,
      -0.0005,
      0,
      0,
      0
     ]
    }
   ],
   "ls": [
    0.0492556268703877,
    0.0492556268703877,
    0.0492556268703877,
    0.0492556268703877,
    0.0492556268703877
   ]
  },
  "da": {
   "ext": [
    0.0244599047967777,
    0.0244599047967777,
    0.0244599047967777,
    0.0244599047967777,
    0.0244599047967777
   ],
   "ls": [
    0.024136242913419,
    0.024136242913419,
    0.024136242913419,
    0.024136242913419,
    0.024136242913419
   ]
  },
  "capex": {
   "guide": [
    4000,
    null,
    null,
    null,
    null
   ],
   "add": [
    0.0,
    0.003,
    0.003,
    0.003,
    0.003
   ],
   "basePct": 0.0161507478241275,
   "extAdj": 0.025,
   "ls": [
    0.0202932109120233,
    0.0202932109120233,
    0.0202932109120233,
    0.0202932109120233,
    0.0202932109120233
   ]
  },
  "tax": {
   "base": 0.3,
   "adj": [
    0,
    0.005,
    0.005,
    0.005,
    0.005
   ],
   "ls": [
    0.191734007304675,
    0.191734007304675,
    0.191734007304675,
    0.191734007304675,
    0.191734007304675
   ]
  },
  "invDays": [
   88,
   88,
   87,
   87,
   87
  ],
  "otherCAPct": [
   0.0391572543165366,
   0.0391572543165366,
   0.0391572543165366,
   0.0391572543165366,
   0.0391572543165366
  ],
  "opCLPct": [
   0.200225333070445,
   0.200225333070445,
   0.200225333070445,
   0.200225333070445,
   0.200225333070445
  ],
  "costPct": [
   0.756,
   0.757,
   0.758,
   0.758,
   0.758
  ],
  "interestRate": [
   0.1,
   0.0975,
   0.0975,
   0.0975,
   0.0975
  ],
  "debtAmort": [
   0,
   -1500,
   -1500,
   -1500,
   -1500
  ],
  "payout": [
   0.300144057623049,
   0.300144057623049,
   0.300144057623049,
   0.300144057623049,
   0.300144057623049
  ],
  "otherIncome": [
   0,
   0,
   0,
   0,
   0
  ],
  "base": {
   "revenue": 177515.0,
   "cash": 9295.0,
   "inventory": 32283.0,
   "otherCA": 6951.0,
   "nonCurrent": 107509.0,
   "opCL": 35543.0,
   "debt": 11500.0,
   "lease": 12118.0,
   "otherLT": 12145.0,
   "equity": 84732.0,
   "ebit": 7551.0,
   "da": 4342.0
  }
 },
 "inflation": {
  "source": "Fuente de datos: Banco de México, serie SP74833 (INPC, variación anual, quincenal), consulta 07/10/2026, tomada de \"MODELO DE INFLACION EN LA VALUACION DE EMPRESAS.xlsx\" hoja INFLACION. Unidades: % anual.",
  "default": "base",
  "order": [
   "cautela",
   "base",
   "alcista"
  ],
  "references": [
   "citi"
  ],
  "scenarios": {
   "citi": {
    "label": "Trayectoria Citi — Referencia",
    "kind": "Referencia histórica (no es escenario)",
    "path": [
     0.0393,
     0.0383,
     0.0375,
     0.0375,
     0.0375
    ],
    "source": "Encuesta Citi de Expectativas, 22-sep-2026: cierre 2026 3.93%, 2027 3.83%, promedio 2028–32 3.75% (comentario original de Proyección Final!C10). Pronóstico de consenso por año: REFERENCIA HISTÓRICA del modelo anterior, no escenario oficial.",
    "cell": "Inflación!B9:F9",
    "reference": true
   },
   "cautela": {
    "label": "Cautela",
    "kind": "Escenario derivado de la tendencia larga",
    "value": 0.0326,
    "source": "Valor documentado en el Dossier (\"ventana 2023-2026, trimestral 3.26%\") y en Avances (escenario Cautela). Construcción de clase más cercana: fila 36 (3.268%). Modelos de tendencia larga calculados aquí: fila 34.",
    "cell": "Inflación!B47"
   },
   "base": {
    "label": "Base",
    "kind": "Forecast / resultado de modelo",
    "value": 0.0351,
    "source": "Fila 33 redondeada a 2 decimales en %. Reproduce el 3.51% del Dossier (\"4.0327e^(−0.028x) → 3.51%\") y de Avances. Horizonte: siguiente trimestre; su extensión a 2026–30 es un supuesto.",
    "cell": "Inflación!B48 = ROUND(G33, 4)"
   },
   "alcista": {
    "label": "Alcista",
    "kind": "Supuesto de escenario (no es pronóstico estadístico)",
    "value": 0.04,
    "source": "Avances de valuación intrínseca: \"Alcista: inflación 4.0%\". No proviene de ningún modelo. Referencia de contexto: el promedio trimestral máximo del último año fue 4.33% (fila 38).",
    "cell": "Inflación!B49"
   }
  },
  "series": [
   [
    "2022-01-01",
    7.13
   ],
   [
    "2022-01-16",
    7.01
   ],
   [
    "2022-02-01",
    7.22
   ],
   [
    "2022-02-16",
    7.34
   ],
   [
    "2022-03-01",
    7.29
   ],
   [
    "2022-03-16",
    7.62
   ],
   [
    "2022-04-01",
    7.72
   ],
   [
    "2022-04-16",
    7.65
   ],
   [
    "2022-05-01",
    7.58
   ],
   [
    "2022-05-16",
    7.72
   ],
   [
    "2022-06-01",
    7.88
   ],
   [
    "2022-06-16",
    8.09
   ],
   [
    "2022-07-01",
    8.16
   ],
   [
    "2022-07-16",
    8.14
   ],
   [
    "2022-08-01",
    8.62
   ],
   [
    "2022-08-16",
    8.77
   ],
   [
    "2022-09-01",
    8.76
   ],
   [
    "2022-09-16",
    8.64
   ],
   [
    "2022-10-01",
    8.53
   ],
   [
    "2022-10-16",
    8.28
   ],
   [
    "2022-11-01",
    8.14
   ],
   [
    "2022-11-16",
    7.46
   ],
   [
    "2022-12-01",
    7.77
   ],
   [
    "2022-12-16",
    7.86
   ],
   [
    "2023-01-01",
    7.94
   ],
   [
    "2023-01-16",
    7.88
   ],
   [
    "2023-02-01",
    7.76
   ],
   [
    "2023-02-16",
    7.48
   ],
   [
    "2023-03-01",
    7.12
   ],
   [
    "2023-03-16",
    6.58
   ],
   [
    "2023-04-01",
    6.24
   ],
   [
    "2023-04-16",
    6.27
   ],
   [
    "2023-05-01",
    6.0
   ],
   [
    "2023-05-16",
    5.67
   ],
   [
    "2023-06-01",
    5.18
   ],
   [
    "2023-06-16",
    4.93
   ],
   [
    "2023-07-01",
    4.79
   ],
   [
    "2023-07-16",
    4.78
   ],
   [
    "2023-08-01",
    4.67
   ],
   [
    "2023-08-16",
    4.6
   ],
   [
    "2023-09-01",
    4.44
   ],
   [
    "2023-09-16",
    4.47
   ],
   [
    "2023-10-01",
    4.27
   ],
   [
    "2023-10-16",
    4.25
   ],
   [
    "2023-11-01",
    4.32
   ],
   [
    "2023-11-16",
    4.33
   ],
   [
    "2023-12-01",
    4.46
   ],
   [
    "2023-12-16",
    4.86
   ],
   [
    "2024-01-01",
    4.9
   ],
   [
    "2024-01-16",
    4.87
   ],
   [
    "2024-02-01",
    4.45
   ],
   [
    "2024-02-16",
    4.35
   ],
   [
    "2024-03-01",
    4.48
   ],
   [
    "2024-03-16",
    4.37
   ],
   [
    "2024-04-01",
    4.63
   ],
   [
    "2024-04-16",
    4.67
   ],
   [
    "2024-05-01",
    4.78
   ],
   [
    "2024-05-16",
    4.59
   ],
   [
    "2024-06-01",
    4.78
   ],
   [
    "2024-06-16",
    5.17
   ],
   [
    "2024-07-01",
    5.61
   ],
   [
    "2024-07-16",
    5.52
   ],
   [
    "2024-08-01",
    5.16
   ],
   [
    "2024-08-16",
    4.83
   ],
   [
    "2024-09-01",
    4.66
   ],
   [
    "2024-09-16",
    4.5
   ],
   [
    "2024-10-01",
    4.69
   ],
   [
    "2024-10-16",
    4.83
   ],
   [
    "2024-11-01",
    4.56
   ],
   [
    "2024-11-16",
    4.54
   ],
   [
    "2024-12-01",
    4.44
   ],
   [
    "2024-12-16",
    3.99
   ],
   [
    "2025-01-01",
    3.69
   ],
   [
    "2025-01-16",
    3.48
   ],
   [
    "2025-02-01",
    3.74
   ],
   [
    "2025-02-16",
    3.81
   ],
   [
    "2025-03-01",
    3.67
   ],
   [
    "2025-03-16",
    3.93
   ],
   [
    "2025-04-01",
    3.96
   ],
   [
    "2025-04-16",
    3.9
   ],
   [
    "2025-05-01",
    4.22
   ],
   [
    "2025-05-16",
    4.62
   ],
   [
    "2025-06-01",
    4.51
   ],
   [
    "2025-06-16",
    4.13
   ],
   [
    "2025-07-01",
    3.55
   ],
   [
    "2025-07-16",
    3.48
   ],
   [
    "2025-08-01",
    3.49
   ],
   [
    "2025-08-16",
    3.65
   ],
   [
    "2025-09-01",
    3.74
   ],
   [
    "2025-09-16",
    3.78
   ],
   [
    "2025-10-01",
    3.63
   ],
   [
    "2025-10-16",
    3.5
   ],
   [
    "2025-11-01",
    3.61
   ],
   [
    "2025-11-16",
    3.99
   ],
   [
    "2025-12-01",
    3.72
   ],
   [
    "2025-12-16",
    3.66
   ],
   [
    "2026-01-01",
    3.77
   ],
   [
    "2026-01-16",
    3.82
   ],
   [
    "2026-02-01",
    3.92
   ],
   [
    "2026-02-16",
    4.13
   ],
   [
    "2026-03-01",
    4.63
   ],
   [
    "2026-03-16",
    4.55
   ],
   [
    "2026-04-01",
    4.53
   ],
   [
    "2026-04-16",
    4.37
   ],
   [
    "2026-05-01",
    4.11
   ],
   [
    "2026-05-16",
    3.77
   ],
   [
    "2026-06-01",
    3.55
   ],
   [
    "2026-06-16",
    3.18
   ],
   [
    "2026-07-01",
    3.1
   ],
   [
    "2026-07-16",
    3.14
   ],
   [
    "2026-08-01",
    3.26
   ],
   [
    "2026-08-16",
    3.26
   ],
   [
    "2026-09-01",
    3.42
   ]
  ],
  "models": {
   "immediate": {
    "a": 3.9951135108918,
    "b": -0.00504430315867582,
    "r2": 0.103894520254771,
    "xNext": 26,
    "forecast": 0.0350405233912861,
    "n": 25
   },
   "quarterly": {
    "a": 4.03018985097207,
    "b": -0.0277127996736187,
    "r2": 0.0920820961115119,
    "xNext": 5,
    "forecast": 0.0350871363974646,
    "n": 4
   },
   "long": {
    "a": 5.88119939515127,
    "b": -0.00633371303632891,
    "r2": 0.622648621233629,
    "xNext": 90,
    "forecast": 0.0332585421076777,
    "n": 89
   },
   "classRounded": {
    "a": 5.8812,
    "b": -0.006,
    "r2": null,
    "xNext": 90,
    "forecast": 0.0342725902186191,
    "n": null
   },
   "classS113": {
    "a": null,
    "b": null,
    "r2": null,
    "xNext": null,
    "forecast": 0.0326787650364365,
    "n": null
   }
  },
  "quarterlyAverages": [
   3.70833333333333,
   3.83666666666667,
   4.32666666666667,
   3.24833333333333
  ],
  "chain": [
   [
    "Inflación (fila 13) → Proyección Final!C10:G10",
    "Vínculo directo",
    "Antes: valores capturados de la Encuesta Citi."
   ],
   [
    "→ Crecimiento nominal del mercado (C14)",
    "Crec. mercado = Inflación + PIB × elasticidad + ajuste de consumo",
    "Coeficiente 1.0 sobre la inflación (fórmula existente del Excel)."
   ],
   [
    "→ Crecimiento por variables externas (C23)",
    "C23 = C14 + Σ ajustes (filas 15–22)",
    "Ajustes documentados en comentarios de cada celda."
   ],
   [
    "→ Crecimiento final de ventas (C28)",
    "C28 = peso externo × C23 + peso MC × C27",
    "Traspaso a ventas = 70% / 70% / 75% / 80% / 85% (pesos de la fila 6)."
   ],
   [
    "→ Costo de ventas, gastos, D&A, capital de trabajo",
    "% de ventas / días sobre costo",
    "Variables Externas!E6: 'eleva ventas nominales y costo de mercancía en proporción similar; efecto casi neutral en margen'."
   ],
   [
    "→ Margen EBIT",
    "Sin término de inflación",
    "Margen neutral (documentado)."
   ],
   [
    "→ Capex",
    "2026 = 4,000 mdp (guía de Soriana, monto fijo); 2027–30 = % de ventas",
    "El capex 2026 no escala con la inflación."
   ],
   [
    "→ FCFF → EV → Equity → precio",
    "Fórmulas existentes",
    "El WACC solo cambia por la iteración (peso del equity)."
   ],
   [
    "NO transmitido (sin sustento documental)",
    "Rf / WACC, beta, g, traspaso diferencial a costos",
    "Limitación documentada: con WACC nominal fijo, mayor inflación eleva el valor (menor WACC real)."
   ]
  ],
  "beta": {
   "historical": 0.0414619566109314,
   "r2": 0.000225094026900157,
   "n": 62,
   "reported": 0.414619566109315,
   "wacc": 0.65
  }
 },
 "wacc": {
  "rf": 0.09517,
  "prm": 0.0423,
  "betaU": 0.65,
  "kdPre": 0.1,
  "taxShield": 0.288010101095701,
  "debt": 23618.0,
  "kdMarket": 0.130154966550936,
  "taxMarket": 0.3,
  "start": 0.119198962792971,
  "iterations": 6,
  "prmMature": 0.0423,
  "countryRisk": 0.0246,
  "interestFY": 3074.0
 },
 "valuation": {
  "g": 0.035,
  "exitMultiple": 5.81077201362635,
  "comparablesMedian": 6.45641334847373,
  "multipleDiscount": 0.1,
  "wGordon": 0.5,
  "bridge": {
   "debt": 11500.0,
   "lease": 12118.0,
   "cash": 9295.0
  },
  "roll": {
   "enabled": true,
   "t1": 0.5,
   "t2": 0.252777777777778,
   "fcfGenerated": 1060.497,
   "debt": 11500.0,
   "lease": 12220.588,
   "cash": 6875.384
  }
 },
 "market": {
  "price": 33.48,
  "shares": 1800.0
 },
 "comps": {
  "source": "Fuente: S&P Capital IQ, \"MULTIPLOS DE SORIANA Y COMPETIDORES.xls\" (Quick Comparable Analysis, plantilla Capital IQ Default Comps), as-of 30-Jun-2026, USD al tipo de cambio del día de exportación. Los múltiplos no tienen unidades; las métricas de Soriana son MXN (mdp) del Excel.",
  "asOf": "2026-06-30",
  "peers": [
   {
    "name": "Grupo Comercial Chedraui, S.A.B. de C.V. (BMV:CHDRAUI B)",
    "country": "Mexico",
    "industry": "Food Retail",
    "model": "Autoservicio multiformato",
    "tevUsd": 7428.7,
    "salesUsd": 16018.2,
    "ebitdaMargin": 0.064,
    "growth": -0.0335,
    "leverage": 2.5,
    "classification": "Incluir",
    "include": 1,
    "reason": "Par más cercano: mismo formato y país; margen EBITDA (6.4%) y crecimiento (−3.4%) casi iguales a los de Soriana.",
    "multiples": {
     "evSales": 0.5,
     "evEbitda": 5.7,
     "evEbit": 8.8,
     "pe": 13.1,
     "ptbv": 2.0,
     "evEbitdaNtm": 5.17,
     "peNtm": 11.18
    }
   },
   {
    "name": "Grupo Mateus S.A. (BOVESPA:GMAT3)",
    "country": "Brazil",
    "industry": "Consumer Staples Merchandise Retail",
    "model": "Supermercados y mayoreo",
    "tevUsd": 2853.8,
    "salesUsd": 8146.6,
    "ebitdaMargin": 0.059,
    "growth": 0.1871,
    "leverage": 2.6,
    "classification": "Incluir con reserva",
    "include": 1,
    "reason": "Formato comparable; geografía (Brasil) y crecimiento (18.7%) distintos; P/U 4.7x atípico.",
    "multiples": {
     "evSales": 0.4,
     "evEbitda": 5.3,
     "evEbit": 6.6,
     "pe": 4.7,
     "ptbv": 0.8,
     "evEbitdaNtm": 5.04,
     "peNtm": 6.32
    }
   },
   {
    "name": "El Puerto de Liverpool, S.A.B. de C.V. (BMV:LIVEPOL C-1)",
    "country": "Mexico",
    "industry": "Broadline Retail",
    "model": "Departamentales + crédito + inmobiliario",
    "tevUsd": 9571.4,
    "salesUsd": 12791.2,
    "ebitdaMargin": 0.142,
    "growth": 0.0304,
    "leverage": 1.6,
    "classification": "Excluir",
    "include": 0,
    "reason": "Industria distinta (Broadline Retail); negocio financiero; margen EBITDA del doble (14.2%).",
    "multiples": {
     "evSales": 0.8,
     "evEbitda": 4.9,
     "evEbit": 5.9,
     "pe": 8.2,
     "ptbv": 0.8,
     "evEbitdaNtm": 4.69,
     "peNtm": 6.29
    }
   },
   {
    "name": "Wal-Mart de México, S.A.B. de C.V. (BMV:WALMEX *)",
    "country": "Mexico",
    "industry": "Consumer Staples Merchandise Retail",
    "model": "Autoservicio, descuento y club",
    "tevUsd": 52191.3,
    "salesUsd": 56741.1,
    "ebitdaMargin": 0.096,
    "growth": 0.0287,
    "leverage": 0.8,
    "classification": "Incluir con reserva",
    "include": 1,
    "reason": "Competidor directo; 12 veces el tamaño de Soriana y líder del mercado (prima de múltiplo).",
    "multiples": {
     "evSales": 0.9,
     "evEbitda": 9.1,
     "evEbit": 12.0,
     "pe": 17.8,
     "ptbv": 4.3,
     "evEbitdaNtm": 8.52,
     "peNtm": 16.13
    }
   },
   {
    "name": "La Comer, S.A.B. de C.V. (BMV:LACOMER UBC)",
    "country": "Mexico",
    "industry": "Food Retail",
    "model": "Autoservicio premium",
    "tevUsd": 2140.3,
    "salesUsd": 2735.8,
    "ebitdaMargin": 0.1,
    "growth": 0.086,
    "leverage": 0.5,
    "classification": "Incluir con reserva",
    "include": 1,
    "reason": "Competidor directo; más pequeña, formato premium, más rentable (10.0%) y sin deuda neta.",
    "multiples": {
     "evSales": 0.8,
     "evEbitda": 7.4,
     "evEbit": 10.7,
     "pe": 14.6,
     "ptbv": 1.4,
     "evEbitdaNtm": 7.07,
     "peNtm": 13.9
    }
   },
   {
    "name": "Sendas Distribuidora S.A. (BOVESPA:ASAI3)",
    "country": "Brazil",
    "industry": "Consumer Staples Merchandise Retail",
    "model": "Mayoreo cash & carry",
    "tevUsd": 6909.1,
    "salesUsd": 15576.1,
    "ebitdaMargin": 0.078,
    "growth": 0.0169,
    "leverage": 4,
    "classification": "Incluir con reserva",
    "include": 1,
    "reason": "Formato comparable a City Club; Brasil; apalancamiento alto (4.0x) distorsiona P/U.",
    "multiples": {
     "evSales": 0.4,
     "evEbitda": 5.5,
     "evEbit": 7.6,
     "pe": 16.8,
     "ptbv": 17.1,
     "evEbitdaNtm": 4.77,
     "peNtm": 11.68
    }
   },
   {
    "name": "Cencosud S.A. (SNSE:CENCOSUD)",
    "country": "Chile",
    "industry": "Consumer Staples Merchandise Retail",
    "model": "Supermercados + mejoramiento del hogar + departamentales + centros comerciales",
    "tevUsd": 11831.7,
    "salesUsd": 17028,
    "ebitdaMargin": 0.056,
    "growth": -0.016,
    "leverage": 5.1,
    "classification": "Incluir con reserva",
    "include": 1,
    "reason": "Diversificada (Chile); EBITDA LTM −29.5% infla EV/EBITDA y EV/EBIT.",
    "multiples": {
     "evSales": 0.7,
     "evEbitda": 9.3,
     "evEbit": 14.0,
     "pe": 21.0,
     "ptbv": 2.7,
     "evEbitdaNtm": 6.88,
     "peNtm": 15.27
    }
   },
   {
    "name": "InRetail Perú Corp. (BVL:INRETC1)",
    "country": "Peru",
    "industry": "Consumer Staples Merchandise Retail",
    "model": "Supermercados, farmacias, centros comerciales",
    "tevUsd": 6092.8,
    "salesUsd": 6992.8,
    "ebitdaMargin": 0.11,
    "growth": 0.0785,
    "leverage": 3.2,
    "classification": "Incluir con reserva",
    "include": 1,
    "reason": "Multiformato (Perú) con negocios no comparables (farmacia, inmobiliario).",
    "multiples": {
     "evSales": 0.9,
     "evEbitda": 7.0,
     "evEbit": 10.0,
     "pe": 13.6,
     "ptbv": 4.2,
     "evEbitdaNtm": 6.49,
     "peNtm": 13.1
    }
   },
   {
    "name": "Fomento Económico Mexicano, S.A.B. de C.V. (BMV:FEMSA UBD)",
    "country": "Mexico",
    "industry": "Soft Drinks and Non-alcoholic Beverages",
    "model": "Embotellador Coca-Cola + OXXO + salud + combustible",
    "tevUsd": 49954.9,
    "salesUsd": 48576.5,
    "ebitdaMargin": 0.118,
    "growth": 0.0745,
    "leverage": 2.1,
    "classification": "Excluir",
    "include": 0,
    "reason": "Industria distinta (Soft Drinks); P/U 25.9x.",
    "multiples": {
     "evSales": 1.1,
     "evEbitda": 7.5,
     "evEbit": 11.1,
     "pe": 25.9,
     "ptbv": 11.6,
     "evEbitdaNtm": 6.58,
     "peNtm": 20.88
    }
   },
   {
    "name": "Falabella S.A. (SNSE:FALABELLA)",
    "country": "Chile",
    "industry": "Broadline Retail",
    "model": "Departamentales, mejoramiento del hogar, banca",
    "tevUsd": 20976.5,
    "salesUsd": 14289.2,
    "ebitdaMargin": 0.127,
    "growth": 0.0894,
    "leverage": 3,
    "classification": "Excluir",
    "include": 0,
    "reason": "Industria distinta (Broadline Retail); negocio financiero.",
    "multiples": {
     "evSales": 1.5,
     "evEbitda": 10.4,
     "evEbit": 12.8,
     "pe": 10.4,
     "ptbv": 2.0,
     "evEbitdaNtm": 9.77,
     "peNtm": 18.33
    }
   }
  ],
  "ciqMean": {
   "evSales": 0.8,
   "evEbitda": 7.2,
   "evEbit": 10,
   "pe": 14.6
  },
  "target": {
   "revenue": 174278,
   "ebit": 7631,
   "da": 4179.871,
   "ebitda": 11810.871,
   "netIncome": 3816,
   "shares": 1800,
   "eps": 2.12,
   "cash": 6875.384,
   "debt": 11500,
   "lease": 12220.588,
   "minority": 0,
   "preferred": 0,
   "sources": {
    "revenue": "Datos!C6:F6",
    "ebit": "Datos!C9:F9",
    "da": "Datos!C14:F14",
    "ebitda": "Cálculo (mismo EBITDA que el Excel: incluye D&A de arrendamientos)",
    "netIncome": "Datos!C13:F13",
    "shares": "WACC!B17",
    "eps": "Cálculo",
    "cash": "Datos!F17",
    "debt": "Datos!F25:F26",
    "lease": "Datos!F27:F28 (arrendamientos como deuda, igual que el DCF y el TEV de CIQ)",
    "minority": "NA en MXN: no está en el Excel. CIQ reporta 8.4 USD mm (≈0.3% del capital); convertirlo requeriría un tipo de cambio sin fuente. Se omite, igual que en el puente del DCF.",
    "preferred": "Soriana no tiene capital preferente (CIQ: \"-\")"
   }
  },
  "multiples": [
   {
    "key": "evEbitda",
    "label": "EV/EBITDA LTM",
    "kind": "EV",
    "metric": "ebitda",
    "use": 1,
    "status": "Usado",
    "reason": "Múltiplo central de retail; EBITDA comparable (con arrendamientos)."
   },
   {
    "key": "evEbit",
    "label": "EV/EBIT LTM",
    "kind": "EV",
    "metric": "ebit",
    "use": 1,
    "status": "Usado",
    "reason": "Incorpora la intensidad de capital (D&A)."
   },
   {
    "key": "pe",
    "label": "P/U LTM",
    "kind": "P",
    "metric": "eps",
    "use": 1,
    "status": "Usado",
    "reason": "Múltiplo de precio sobre UPA diluida (CIQ \"P/Diluted EPS Before Extra\")."
   },
   {
    "key": "evSales",
    "label": "EV/Ventas LTM",
    "kind": "EV",
    "metric": "revenue",
    "use": 0,
    "status": "Excluido",
    "reason": "No es NM ni NA: se excluye porque ignora el margen; los pares van de 5.6% a 11.0% de margen EBITDA y Soriana es de los más bajos, lo que sobrevaloraría el resultado."
   },
   {
    "key": "ptbv",
    "label": "P/VL tangible",
    "kind": "P",
    "metric": null,
    "use": 0,
    "status": "NA",
    "reason": "El valor en libros tangible por acción de Soriana en MXN no está en el Excel; además el valor contable no explica el valor en retail (Sendas 17.1x)."
   },
   {
    "key": "evEbitdaNtm",
    "label": "EV/EBITDA NTM",
    "kind": "EV",
    "metric": null,
    "use": 0,
    "status": "NA",
    "reason": "No existe EBITDA NTM de consenso para Soriana en MXN (CIQ lo da en USD; convertirlo requiere un tipo de cambio sin fuente)."
   },
   {
    "key": "peNtm",
    "label": "P/U NTM",
    "kind": "P",
    "metric": null,
    "use": 0,
    "status": "NA",
    "reason": "Ídem: UPA NTM de consenso solo en USD."
   }
  ],
  "note": "Precios de los pares al 30-jun-2026 (as-of CIQ) y puente al 2T26; la metodología de clase no prevé llevarlo a la fecha de valuación del DCF (01-oct-2026)."
 },
 "transactions": {
  "source": "Fuente: S&P Capital IQ, \"TRANSACCIONES INDUSTRIA RETAIL.xls\" (Comparable M&A Transactions para Soriana). TEV y tamaño en MXN mm; múltiplos implícitos de la transacción (publicados con 1 decimal).",
  "criteria": {
   "valuationDate": "2026-10-01",
   "windowYears": 3,
   "geography": "México",
   "minMultiples": 2
  },
  "deals": [
   {
    "date": "2023-10-16",
    "id": "IQTR1859160803",
    "target": "Almacenes Éxito S.A.",
    "buyer": "Super Selectos El Salvador",
    "seller": "Casino, Guichard-Perrachon S.A., Companhia Brasileira De Distribuicao, GÉAnt International B.V., Segisor S.A.S., Helicco Participações Ltda., GPA 2 Empreendimentos E Participacoes LTDA.",
    "tev": 56675.3,
    "size": 35348.1,
    "evSales": 0.3,
    "evEbitda": 5.2,
    "country": "Colombia",
    "industry": "Supermercados / autoservicio (Grupo Éxito)",
    "control": "Sí",
    "include": 1,
    "note": "Oferta por el control de Éxito; varios vendedores del grupo Casino. Única operación dentro de la ventana (por 15 días)."
   },
   {
    "date": "2019-07-11",
    "id": "IQTR629442326",
    "target": "InRetail Perú Corp.",
    "buyer": "-",
    "seller": "Nexus Group",
    "tev": 116983.8,
    "size": 4590.5,
    "evSales": 1.5,
    "evEbitda": 11.4,
    "country": "Perú",
    "industry": "Supermercados, farmacias y centros comerciales",
    "control": "Dudoso",
    "include": 1,
    "note": "Comprador no identificado; tamaño 4,590 = 3.9% del TEV → probable venta minoritaria o secundaria, no de control. Fuera de la ventana."
   },
   {
    "date": "2019-06-26",
    "id": "IQTR626096522",
    "target": "Almacenes Éxito S.A.",
    "buyer": "Sendas Distribuidora S.A.",
    "seller": "Casino, Guichard-Perrachon S.A.",
    "tev": 56675.3,
    "size": 130645,
    "evSales": 0.4,
    "evEbitda": 6.3,
    "country": "Colombia",
    "industry": "Supermercados / autoservicio (Grupo Éxito)",
    "control": "Dudoso",
    "include": 1,
    "note": "Vendedor Casino y comprador Sendas, ambos del grupo Casino según los datos → posible reestructura intra-grupo. Tamaño 130,645 > TEV 56,675 (dato inconsistente). Fuera de la ventana."
   }
  ],
  "ciqMean": {
   "evSales": 0.7,
   "evEbitda": 7.6
  },
  "multiples": [
   {
    "key": "evEbitda",
    "label": "EV/EBITDA",
    "metric": "ebitda",
    "use": 1,
    "status": "Usado",
    "reason": "Mismo criterio que Trading Comps."
   },
   {
    "key": "evSales",
    "label": "EV/Ventas",
    "metric": "revenue",
    "use": 0,
    "status": "Excluido",
    "reason": "Mismo criterio que Trading Comps: ignora el margen; los márgenes implícitos de los objetivos van de 5.8% a 13.2% (fila de margen implícito)."
   }
  ],
  "warning": "ADVERTENCIA: solo 1 de 3 operaciones cumple la ventana de 3 años, ninguna la geografía, y 2 tienen carácter de control dudoso. Con n = 3 (o n = 1 dentro de la ventana) el resultado no es estadísticamente defendible. El método se calcula y se muestra como referencia, con peso 0% en la valuación combinada (decisión del proyecto). Las transacciones de control incluyen una prima de control (diap. 11, nota)."
 },
 "combined": {
  "weights": {
   "dcf": 0.5,
   "comps": 0.5,
   "transactions": 0
  },
  "reasons": {
   "dcf": "Proyección Final Soriana!B265. Metodología principal existente. Peso: con Transactions en 0%, se conserva la regla de clase de pesos iguales entre los métodos activos (50/50).",
   "comps": "Trading Comps (sección 5). Metodología complementaria. Peso igual al DCF por la regla de pesos iguales de la diap. 18.",
   "transactions": "Precedent Transactions (sección 4). Peso 0% por decisión del proyecto: la muestra no es defendible. El método sigue calculándose."
  },
  "classRule": "Diap. 18: pesos iguales (⅓) entre métodos; aquí 50/50 entre los métodos activos y Transactions 0% por decisión del proyecto."
 },
 "registry": [
  [
   "Inflación INPC quincenal",
   "Inflación!A60:B172",
   "113 obs.",
   "07-oct-2026",
   "% anual",
   "Observado",
   "Banco de México, serie SP74833 (vía MODELO DE INFLACION EN LA VALUACION DE EMPRESAS.xlsx)"
  ],
  [
   "Escenario Base 3.51%",
   "Inflación!B48",
   "3.51%",
   "07-oct-2026",
   "% anual",
   "Modelo",
   "Modelo exponencial trimestral de clase (calculado en Inflación!33)"
  ],
  [
   "Escenario Cautela 3.26%",
   "Inflación!B47",
   "3.26%",
   "07-oct-2026",
   "% anual",
   "Supuesto",
   "Escenario derivado de la tendencia larga: Dossier de Soriana / Avances; construcción de clase más cercana Inflación!G36 (3.268%)"
  ],
  [
   "Escenario Alcista 4.00%",
   "Inflación!B49",
   "4.00%",
   "—",
   "% anual",
   "Supuesto",
   "Supuesto de escenario de Avances de valuación intrínseca (no es pronóstico estadístico)"
  ],
  [
   "Trayectoria Citi 2026–2030 — Referencia",
   "Inflación!B9:F9",
   "3.93/3.83/3.75%",
   "22-sep-2026",
   "% anual",
   "Referencia",
   "Encuesta Citi de Expectativas (comentario original de Proyección Final!C10). Referencia histórica del modelo anterior; no es escenario."
  ],
  [
   "Beta desapalancada sectorial (βU)",
   "WACC!B9 ← 'Beta y Kd'!B28",
   "0.65",
   "ene-2026",
   "x",
   "Observado",
   "Damodaran, Betas by Sector (Global), Retail (Grocery and Food): βL 0.87, D/E 45.96%, t marginal 25.37% → βU 0.65; reapalancada con la estructura de Soriana (Hamada)."
  ],
  [
   "Beta heredada (histórico)",
   "'Beta y Kd'!B26",
   "0.80",
   "—",
   "x",
   "Referencia",
   "Excel anterior / Material Maestro; solo para reproducir el baseline $31.16."
  ],
  [
   "Kd antes de impuestos (iteración)",
   "Proyección Final!C61",
   "10.00%",
   "22-sep-2026",
   "%",
   "Supuesto",
   "Comentario original de C61: Encuesta Citi (tasa Banxico 6.50% a fin de 2026 y 2027) y gastos financieros 1S26. Control: intereses 1S26 anualizados / deuda 2T26 = 9.87% ('Beta y Kd'!B58)."
  ],
  [
   "Rf Bono M 10 años",
   "WACC!B5",
   "9.517%",
   "—",
   "%",
   "Pendiente",
   "Input heredado; fecha y fuente exacta pendientes."
  ],
  [
   "Prima de riesgo de mercado",
   "WACC!B6",
   "4.23%",
   "—",
   "%",
   "Pendiente",
   "Input heredado (\"madura\"); fecha y fuente exacta pendientes."
  ],
  [
   "Crecimiento perpetuo g",
   "Proyección Final!B123",
   "3.50%",
   "—",
   "%",
   "Pendiente",
   "Input heredado; no ligado a la inflación (sin sustento documental)."
  ],
  [
   "Múltiplos de comparables",
   "Trading Comps",
   "10 empresas",
   "30-jun-2026",
   "x",
   "Observado",
   "S&P Capital IQ, MULTIPLOS DE SORIANA Y COMPETIDORES.xls"
  ],
  [
   "Transacciones",
   "Precedent Transactions",
   "3 operaciones",
   "—",
   "x / MXN mm",
   "Observado",
   "S&P Capital IQ, TRANSACCIONES INDUSTRIA RETAIL.xls"
  ],
  [
   "Métricas LTM y balance 2T26 de Soriana",
   "Trading Comps sección 2",
   "mdp",
   "30-jun-2026",
   "MXN",
   "Observado",
   "Hoja Datos (reportes trimestrales de Soriana)"
  ],
  [
   "Pesos de la combinada",
   "Valuación Combinada!C6:C8",
   "50/50/0",
   "—",
   "%",
   "Supuesto",
   "Regla de pesos iguales de la diap. 18 entre métodos activos; Transactions 0% por decisión del proyecto."
  ]
 ],
 "beta": {
  "source": "Aswath Damodaran, NYU Stern — Betas by Sector (Global)",
  "url": "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/BetasGlobal.html",
  "date": "Enero de 2026",
  "industry": "Retail (Grocery and Food)",
  "firms": 215,
  "levered": 0.87,
  "de": 0.4596,
  "effTax": 0.2081,
  "marginalTax": 0.2537,
  "unlevered": 0.65,
  "cashFirm": 0.0581,
  "unleveredCash": 0.69,
  "check": 0.647803675992488,
  "inherited": 0.8,
  "used": 0.65,
  "treatment": [
   "El WACC del modelo reapalanca la beta en cada paso: βL = βU × [1 + (1 − t) × D/E] (WACC!B28 a valor de mercado; Proyección Final!E214:E219 en la iteración al valor DCF).",
   "Por eso el insumo correcto es una beta DESAPALANCADA. Usar la βL de 0.87 en esa fórmula aplicaría el apalancamiento dos veces (el de la industria y el de Soriana).",
   "Se usa la βU sin corrección por caja (0.65): Damodaran la obtuvo con D/E bruta y el modelo reapalanca con deuda bruta (bancaria + arrendamientos), así el tratamiento es simétrico; el efectivo se suma por separado en el puente EV → capital.",
   "La beta heredada 0.80 no tenía fuente en el Excel; coincide con la βU de \"Grocery and Food\" del archivo de Estados Unidos de Damodaran (15 empresas), pero la muestra global (215 empresas) es más representativa para una empresa mexicana."
  ],
  "kd": {
   "value": 0.1,
   "check": 0.0986484820696688,
   "fy2025": 0.130154966550936,
   "source": "Fuente (comentario original de la celda C61): Encuesta Citi — tasa Banxico 6.50% a fin de 2026 y 2027 (imagenradio.com.mx, 22-sep-2026) y gastos financieros 1S26 de la hoja Datos.",
   "checkNote": "(588 + 582) × 2 / 23,720.6 (deuda bancaria + arrendamientos al 2T26)."
  }
 },
 "notes": [
  "DCF principal: el DCF de ValuFlow (Proyección Final Soriana): descuento de fin de periodo, valor terminal 50% Gordon / 50% múltiplo de salida, WACC iterado al valor DCF y traslado a la fecha de valuación.",
  "Referencia de Capital IQ (no reemplaza el DCF principal): la metodología de clase de CIQ usa convención de medio año (mid-year) y valor terminal por múltiplo de salida. Se documenta solo como referencia metodológica.",
  "Trading Comps y Precedent Transactions: metodología de la presentación de clase (CIQ Valuations): 6 estadísticos, percentiles inclusivos, puente EV → capital, NM/NA y promedio de precios implícitos a la media.",
  "Valuación combinada: DCF 50% + Trading Comps 50% + Precedent Transactions 0% (referencia). Los pesos son editables y deben sumar 100%."
 ],
 "expected": {
  "dcf": {
   "historico": {
    "inflation": [
     0.0393,
     0.0383,
     0.0375,
     0.0375,
     0.0375
    ],
    "revenue": [
     170043.117005363,
     167793.891012094,
     169495.966502241,
     173233.014215542,
     178318.181982077
    ],
    "ebit": [
     7719.39750073024,
     7582.05333100925,
     7647.83928325854,
     7810.28534043882,
     8038.54711982523
    ],
    "taxEbit": [
     2065.09478019116,
     2054.88962679612,
     2116.03095429571,
     2205.20908437013,
     2315.18276864342
    ],
    "da": [
     4142.72751064788,
     4087.9300536024,
     4132.14035814768,
     4226.04925064282,
     4352.98853502347
    ],
    "capex": [
     3835.21625125831,
     3318.31293561137,
     3345.71310698864,
     3413.08108947276,
     3506.68423149796
    ],
    "nwcRelease": [
     86.0154541666898,
     7.23010557022371,
     274.634513215038,
     -73.2681607750101,
     -99.6992594341728
    ],
    "fcf": [
     6047.82943409534,
     6304.01092777438,
     6592.8700933369,
     6344.77625646374,
     6469.96939527314
    ],
    "netIncome": [
     3924.33193407473,
     3848.50182991039,
     3971.97268406847,
     4162.41032543954,
     4396.2116196747
    ],
    "cash": [
     12434.9937374781,
     14405.2378359507,
     16746.108286229,
     18898.8958874941,
     21222.2157575614
    ],
    "equityBook": [
     87478.4670239218,
     90171.8638988332,
     92951.6725847374,
     95864.7601856075,
     98941.4750115834
    ],
    "balanceCheck": [
     0,
     0,
     0,
     0,
     0
    ],
    "growthExternal": [
     -0.0347,
     0.0093,
     0.037,
     0.0465,
     0.049
    ],
    "growthFinal": [
     -0.0420915584296354,
     -0.0132273862822579,
     0.0101438465958434,
     0.0220480037986758,
     0.0293544956748681
    ],
    "marginFinal": [
     0.0453967066510946,
     0.0451867066510946,
     0.0451210694925737,
     0.0450854323340528,
     0.0450797951755318
    ],
    "ebitda": [
     11862.1250113781,
     11669.9833846117,
     11779.9796414062,
     12036.3345910816,
     12391.5356548487
    ],
    "pvFcf": 22891.7730161719,
    "tvG": 79934.8572153132,
    "pvTvG": 45606.3648286012,
    "evG": 68498.1378447731,
    "tvM": 72004.3885890479,
    "pvTvM": 41081.6823805297,
    "evM": 63973.4553967016,
    "evW": 66235.7966207374,
    "ev2": 71119.4816040789,
    "eq2": 54274.2776040789,
    "eqVal": 56095.9495599756,
    "price": 31.1644164222087,
    "upside": -6.916318930081533,
    "wacc": 11.8773444494561,
    "ke": 13.951380592038701,
    "priceG": 30.0972988026517,
    "priceM": 27.5835863315009,
    "priceW": 28.8404425670763,
    "tvWeight": 66.5804447588808,
    "waccMarket": 12.500800915571899,
    "keMarket": 13.8293538829152,
    "betaMarket": 1.01946900305323,
    "waccIterations": [
     [
      0.125008009155719,
      49499.266090588,
      0.477138387401077,
      1.07177416976724,
      0.140506047381154,
      0.118118803282231
     ],
     [
      0.118118803282231,
      54706.7012627654,
      0.431720419159598,
      1.04590446207389,
      0.139411758745726,
      0.118842906916727
     ],
     [
      0.118842906916727,
      54119.2208513609,
      0.436406874091316,
      1.04857382893233,
      0.139524672963838,
      0.118766071548008
     ],
     [
      0.118766071548008,
      54181.0784703268,
      0.435908635759895,
      1.04829003640496,
      0.13951266853993,
      0.118774216439122
     ],
     [
      0.118774216439122,
      54174.5159239731,
      0.435961440488823,
      1.04832011355185,
      0.139513940803243,
      0.118773352952406
     ],
     [
      0.118773352952406,
      54175.2115969033,
      0.435955842235234,
      1.04831692483184,
      0.139513805920387,
      0.118773444494561
     ]
    ],
    "betaU": 0.8,
    "betaLMarket": 1.01946900305323,
    "betaLIter": 1.04831692483184,
    "sensGordonClose": {
     "waccs": [
      0.108773444494561,
      0.113773444494561,
      0.118773444494561,
      0.123773444494561,
      0.128773444494561
     ],
     "gs": [
      0.025,
      0.03,
      0.035,
      0.04,
      0.045
     ],
     "grid": [
      [
       31.3302501817178,
       33.1321981784271,
       35.1784004605443,
       37.5221307052574,
       40.2333697560713
      ],
      [
       29.136695635071,
       30.7071410511775,
       32.4769487557029,
       34.4866541248488,
       36.7885806243911
      ],
      [
       27.1766799610136,
       28.5547401557756,
       30.0972988026517,
       31.835679614824,
       33.8096981722693
      ],
      [
       25.4147460671493,
       26.6313930874425,
       27.9850908921477,
       29.5003790209552,
       31.2080274227622
      ],
      [
       23.822270185686,
       24.9023259015236,
       26.0975587575055,
       27.4274301715368,
       28.9160477636744
      ]
     ]
    },
    "combined": 32.328628638353
   },
   "citi": {
    "inflation": [
     0.0393,
     0.0383,
     0.0375,
     0.0375,
     0.0375
    ],
    "revenue": [
     170043.117005363,
     167793.891012094,
     169495.966502241,
     173233.014215542,
     178318.181982077
    ],
    "ebit": [
     7719.39750073024,
     7582.05333100925,
     7647.83928325854,
     7810.28534043882,
     8038.54711982523
    ],
    "taxEbit": [
     2065.09478019116,
     2054.88962679612,
     2116.03095429571,
     2205.20908437013,
     2315.18276864342
    ],
    "da": [
     4142.72751064788,
     4087.9300536024,
     4132.14035814768,
     4226.04925064282,
     4352.98853502347
    ],
    "capex": [
     3835.21625125831,
     3318.31293561137,
     3345.71310698864,
     3413.08108947276,
     3506.68423149796
    ],
    "nwcRelease": [
     86.0154541666898,
     7.23010557022371,
     274.634513215038,
     -73.2681607750101,
     -99.6992594341728
    ],
    "fcf": [
     6047.82943409534,
     6304.01092777438,
     6592.8700933369,
     6344.77625646374,
     6469.96939527314
    ],
    "netIncome": [
     3924.33193407473,
     3848.50182991039,
     3971.97268406847,
     4162.41032543954,
     4396.2116196747
    ],
    "cash": [
     12434.9937374781,
     14405.2378359507,
     16746.108286229,
     18898.8958874941,
     21222.2157575614
    ],
    "equityBook": [
     87478.4670239218,
     90171.8638988332,
     92951.6725847374,
     95864.7601856075,
     98941.4750115834
    ],
    "balanceCheck": [
     0,
     0,
     0,
     0,
     0
    ],
    "growthExternal": [
     -0.0347,
     0.0093,
     0.037,
     0.0465,
     0.049
    ],
    "growthFinal": [
     -0.0420915584296354,
     -0.0132273862822579,
     0.0101438465958434,
     0.0220480037986758,
     0.0293544956748681
    ],
    "marginFinal": [
     0.0453967066510946,
     0.0451867066510946,
     0.0451210694925737,
     0.0450854323340528,
     0.0450797951755318
    ],
    "ebitda": [
     11862.1250113781,
     11669.9833846117,
     11779.9796414062,
     12036.3345910816,
     12391.5356548487
    ],
    "pvFcf": 23197.0399350743,
    "tvG": 85288.545922862,
    "pvTvG": 49820.7914853949,
    "evG": 73017.8314204692,
    "tvM": 72004.3885890479,
    "pvTvM": 42060.9308215056,
    "evM": 65257.9707565799,
    "evW": 69137.9010885246,
    "ev2": 74017.0320477038,
    "eq2": 57171.8280477038,
    "eqVal": 58972.8055845486,
    "price": 32.7626697691937,
    "upside": -2.142563413399934,
    "wacc": 11.351486095406301,
    "ke": 13.054217241184901,
    "priceG": 32.6082396780384,
    "priceM": 28.2972059758777,
    "priceW": 30.4527228269581,
    "tvWeight": 68.2309930549766,
    "waccMarket": 11.9198962792971,
    "keMarket": 13.020787529868599,
    "betaMarket": 0.828318564980751,
    "waccIterations": [
     [
      0.119198962792971,
      53834.0421587307,
      0.438718681579992,
      0.853036125334618,
      0.131253428101654,
      0.112940602743662
     ],
     [
      0.112940602743662,
      59225.2508896347,
      0.398782607844275,
      0.834553972618495,
      0.130471633041762,
      0.11357343951465
     ],
     [
      0.11357343951465,
      58641.1595591176,
      0.402754655221136,
      0.836392210065186,
      0.130549390485757,
      0.113508883765615
     ],
     [
      0.113508883765615,
      58700.312436654,
      0.402348795425701,
      0.836204380816617,
      0.130541445308543,
      0.113515463232641
     ],
     [
      0.113515463232641,
      58694.2791838038,
      0.402390153323788,
      0.836223520980308,
      0.130542254937467,
      0.113514792597963
     ],
     [
      0.113514792597963,
      58694.8940975548,
      0.402385937706018,
      0.836221570020082,
      0.130542172411849,
      0.113514860954063
     ]
    ],
    "betaU": 0.65,
    "betaLMarket": 0.828318564980751,
    "betaLIter": 0.836221570020082,
    "sensGordonClose": {
     "waccs": [
      0.103514860954063,
      0.108514860954063,
      0.113514860954063,
      0.118514860954063,
      0.123514860954063
     ],
     "gs": [
      0.025,
      0.03,
      0.035,
      0.04,
      0.045
     ],
     "grid": [
      [
       33.9381711709042,
       36.0378843537719,
       38.4440585224212,
       41.2290690976227,
       44.4900289496049
      ],
      [
       31.4508248075755,
       33.2659977884923,
       35.328083156559,
       37.69113759022,
       40.4262395098024
      ],
      [
       29.2440723102954,
       30.8254503434207,
       32.6082396780384,
       34.6335363521901,
       36.9544326445778
      ],
      [
       27.2729152941398,
       28.6601050311389,
       30.2133957136646,
       31.9645203684665,
       33.9538451139816
      ],
      [
       25.5014904693729,
       26.7258305281102,
       28.0884908695141,
       29.6143150270146,
       31.3344748986665
      ]
     ]
    },
    "combined": 33.1277553118455
   },
   "cautela": {
    "inflation": [
     0.0326,
     0.0326,
     0.0326,
     0.0326,
     0.0326
    ],
    "revenue": [
     169210.571655363,
     166297.207880131,
     167372.959007225,
     170407.096643903,
     174699.565467782
    ],
    "ebit": [
     7681.60268370256,
     7514.42314937559,
     7552.04691454268,
     7682.8776249811,
     7875.42062854202
    ],
    "taxEbit": [
     2054.98390309813,
     2036.56048129553,
     2089.52678627118,
     2169.2359234292,
     2268.20069139756
    ],
    "da": [
     4122.44436960667,
     4051.46665246803,
     4080.3835810878,
     4157.11050423769,
     4264.6532008232
    ],
    "capex": [
     3830.1477457439,
     3288.71434315161,
     3303.806658423,
     3357.4041397421,
     3435.52297733157
    ],
    "nwcRelease": [
     103.665760590801,
     21.6709459167569,
     284.166826031942,
     -59.4869804274649,
     -84.1576881103756
    ],
    "fcf": [
     6022.581165058,
     6262.28592331324,
     6523.26387696823,
     6253.86108562002,
     6352.19247252571
    ],
    "netIncome": [
     3896.64799414008,
     3799.20079377732,
     3902.68448337714,
     4070.97577092275,
     4280.06720563736
    ],
    "cash": [
     12418.0546385037,
     14361.3711455452,
     16653.4318211557,
     18742.7477897767,
     20983.150792796
    ],
    "equityBook": [
     87459.0922540502,
     90117.9855058584,
     92849.3024327722,
     95698.3990173251,
     98693.8294849631
    ],
    "balanceCheck": [
     0,
     0,
     0,
     0,
     0
    ],
    "growthExternal": [
     -0.0414,
     0.0036,
     0.0321,
     0.0416,
     0.0441
    ],
    "growthFinal": [
     -0.0467815584296355,
     -0.0172173862822579,
     0.00646884659584336,
     0.0181280037986758,
     0.0251894956748681
    ],
    "marginFinal": [
     0.0453967066510946,
     0.0451867066510946,
     0.0451210694925737,
     0.0450854323340528,
     0.0450797951755318
    ],
    "ebitda": [
     11804.0470533092,
     11565.8898018436,
     11632.4304956305,
     11839.9881292188,
     12140.0738293652
    ],
    "pvFcf": 22969.1250774403,
    "tvG": 83860.6028460364,
    "pvTvG": 49012.3393131987,
    "evG": 71981.464390639,
    "tvM": 70543.2012510331,
    "pvTvM": 41228.9823661614,
    "evM": 64198.1074436017,
    "evW": 68089.7859171204,
    "ev2": 72907.2628872693,
    "eq2": 56062.0588872693,
    "eqVal": 57829.9080175329,
    "price": 32.1277266764072,
    "upside": -4.0390481588793214,
    "wacc": 11.339818682360999,
    "ke": 13.068375792413,
    "priceG": 32.0324802170217,
    "priceM": 27.7083930242232,
    "priceW": 29.8704366206224,
    "tvWeight": 68.09022257064919,
    "waccMarket": 11.9198962792971,
    "keMarket": 13.020787529868599,
    "betaMarket": 0.828318564980751,
    "waccIterations": [
     [
      0.119198962792971,
      52779.0717764153,
      0.447487975916883,
      0.857094497177068,
      0.13142509723059,
      0.112806318132318
     ],
     [
      0.112806318132318,
      58197.1165930128,
      0.40582766608811,
      0.837814379317917,
      0.130609548245148,
      0.113459189904871
     ],
     [
      0.113459189904871,
      57603.4070780863,
      0.410010469831824,
      0.839750153427422,
      0.13069143148998,
      0.113391897583268
     ],
     [
      0.113391897583268,
      57664.1454997706,
      0.409578600277601,
      0.839550287033259,
      0.130682977141507,
      0.113398826947663
     ],
     [
      0.113398826947663,
      57657.8862136593,
      0.409623063746739,
      0.839570864434841,
      0.130683847565594,
      0.113398113333441
     ],
     [
      0.113398113333441,
      57658.5307695067,
      0.409618484633511,
      0.839568745251305,
      0.13068375792413,
      0.11339818682361
     ]
    ],
    "betaU": 0.65,
    "betaLMarket": 0.828318564980751,
    "betaLIter": 0.839568745251305,
    "sensGordonClose": {
     "waccs": [
      0.10339818682361,
      0.10839818682361,
      0.11339818682361,
      0.11839818682361,
      0.12339818682361
     ],
     "gs": [
      0.025,
      0.03,
      0.035,
      0.04,
      0.045
     ],
     "grid": [
      [
       33.3423252687747,
       35.4110406052986,
       37.7822077219931,
       40.5273866575573,
       43.7426450741603
      ],
      [
       30.8922736477051,
       32.6803056772854,
       34.7119448185614,
       37.0406150999341,
       39.7365940376019
      ],
      [
       28.7188829052907,
       30.27635094505,
       32.0324802170217,
       34.0278700685758,
       36.3149913159781
      ],
      [
       26.7777319437462,
       28.1437408425006,
       29.6735433380683,
       31.398478215844,
       33.3584236507498
      ],
      [
       25.0334282057872,
       26.2389102134733,
       27.5807617611922,
       29.0835102778771,
       30.7779403343489
      ]
     ]
    },
    "combined": 32.8102837654523
   },
   "base": {
    "inflation": [
     0.0351,
     0.0351,
     0.0351,
     0.0351,
     0.0351
    ],
    "revenue": [
     169521.222905363,
     166899.172667645,
     168291.753761357,
     171679.130820352,
     176368.459696609
    ],
    "ebit": [
     7695.70522736961,
     7541.62395564329,
     7593.5039164933,
     7740.22783576996,
     7950.65403854719
    ],
    "taxEbit": [
     2058.75661843135,
     2043.93244930997,
     2100.99725474609,
     2185.42857200854,
     2289.86867341892
    ],
    "da": [
     4130.01270581607,
     4066.13220394458,
     4102.78286859152,
     4188.14199729641,
     4305.39317115882
    ],
    "capex": [
     3832.0389791448,
     3300.61887393722,
     3321.94292275407,
     3382.46608196171,
     3468.34231752008
    ],
    "nwcRelease": [
     97.0798253579187,
     15.3498469656297,
     279.060067797571,
     -66.4125550446124,
     -91.9384841701649
    ],
    "fcf": [
     6032.00216096745,
     6278.55468330631,
     6552.40667538223,
     6294.0626240515,
     6405.89773459684
    ],
    "netIncome": [
     3906.97782247391,
     3819.02963203058,
     3932.67101685285,
     4112.13333313227,
     4333.63263362116
    ],
    "cash": [
     12424.3751978225,
     14378.0089568858,
     16690.2121510789,
     18807.3764604079,
     21085.4073805949
    ],
    "equityBook": [
     87466.3216457933,
     90139.0922278836,
     92891.3954084417,
     95769.2963574806,
     98802.2149081991
    ],
    "balanceCheck": [
     0,
     0,
     0,
     0,
     0
    ],
    "growthExternal": [
     -0.0389,
     0.0061,
     0.0346,
     0.0441,
     0.0466
    ],
    "growthFinal": [
     -0.0450315584296355,
     -0.0154673862822579,
     0.00834384659584337,
     0.0201280037986758,
     0.0273144956748681
    ],
    "marginFinal": [
     0.0453967066510946,
     0.0451867066510946,
     0.0451210694925737,
     0.0450854323340528,
     0.0450797951755318
    ],
    "ebitda": [
     11825.7179331857,
     11607.7561595879,
     11696.2867850848,
     11928.3698330664,
     12256.047209706
    ],
    "pvFcf": 23066.2909319912,
    "tvG": 84512.601913753,
    "pvTvG": 49381.6714228042,
    "evG": 72447.9623547954,
    "tvM": 71217.0961238431,
    "pvTvM": 41612.9566577878,
    "evM": 64679.247589779,
    "evW": 68563.6049722872,
    "ev2": 73408.9439360682,
    "eq2": 56563.7399360682,
    "eqVal": 58346.5694706359,
    "price": 32.41476081702,
    "upside": -3.181717989784927,
    "wacc": 11.3451071262412,
    "ke": 13.0619401464674,
    "priceG": 32.2916457526641,
    "priceM": 27.9756931054328,
    "priceW": 30.1336694290485,
    "tvWeight": 68.16157393215569,
    "waccMarket": 11.9198962792971,
    "keMarket": 13.020787529868599,
    "betaMarket": 0.828318564980751,
    "waccIterations": [
     [
      0.119198962792971,
      53253.4062442849,
      0.44350214691731,
      0.855249881685872,
      0.131347069995312,
      0.112867151058969
     ],
     [
      0.112867151058969,
      58659.9983688201,
      0.402625309525304,
      0.836332349726402,
      0.130546858393427,
      0.113510980198862
     ],
     [
      0.113510980198862,
      58070.517927593,
      0.406712404897935,
      0.838223830630163,
      0.130626868035656,
      0.113444922988274
     ],
     [
      0.113444922988274,
      58130.5545167678,
      0.406292356856623,
      0.838029435154559,
      0.130618645107038,
      0.113451694263669
     ],
     [
      0.113451694263669,
      58124.3957528739,
      0.406335406916161,
      0.838049358439459,
      0.130619487861989,
      0.113451000100325
     ],
     [
      0.113451000100325,
      58125.0270752607,
      0.406330993522278,
      0.838047315949747,
      0.130619401464674,
      0.113451071262412
     ]
    ],
    "betaU": 0.65,
    "betaLMarket": 0.828318564980751,
    "betaLIter": 0.838047315949747,
    "sensGordonClose": {
     "waccs": [
      0.103451071262412,
      0.108451071262412,
      0.113451071262412,
      0.118451071262412,
      0.123451071262412
     ],
     "gs": [
      0.025,
      0.03,
      0.035,
      0.04,
      0.045
     ],
     "grid": [
      [
       33.6105883343644,
       35.6934871131325,
       38.0806760571755,
       40.8440901612588,
       44.0802781674109
      ],
      [
       31.143521731188,
       32.9439697871349,
       34.9895399393294,
       37.3339469270136,
       40.04783656346
      ],
      [
       28.9549164843448,
       30.5233204703713,
       32.2916457526641,
       34.3007197744784,
       36.6032989211596
      ],
      [
       27.0000867033454,
       28.3757817062717,
       29.9163271996848,
       31.6532429234369,
       33.6266311306938
      ],
      [
       25.2434240051874,
       26.4575286463462,
       27.8088961407221,
       29.3221989432892,
       31.0283994052782
      ]
     ]
    },
    "combined": 32.9538008357587
   },
   "alcista": {
    "inflation": [
     0.04,
     0.04,
     0.04,
     0.04,
     0.04
    ],
    "revenue": [
     170130.099355363,
     168082.177631184,
     170102.331539628,
     174192.953054657,
     179676.459366934
    ],
    "ebit": [
     7723.34621295701,
     7595.08005389749,
     7675.19912224838,
     7853.56459801456,
     8099.77798612612
    ],
    "taxEbit": [
     2066.15114048446,
     2058.42013186719,
     2123.60097035682,
     2217.42884431625,
     2332.81787663692
    ],
    "da": [
     4144.84664478651,
     4094.9535246425,
     4146.92292492177,
     4249.46712413578,
     4386.14592715221
    ],
    "capex": [
     3835.74579661056,
     3324.01412777944,
     3357.68226174243,
     3431.99404964764,
     3533.39519184163
    ],
    "nwcRelease": [
     84.1713923014804,
     2.89286692656788,
     268.927485167234,
     -80.2002911993932,
     -107.509042677895
    ],
    "fcf": [
     6050.46731294998,
     6310.49218581992,
     6609.76630023814,
     6373.40853698706,
     6512.20180212189
    ],
    "netIncome": [
     3927.2242860082,
     3857.99804772757,
     3991.7625069972,
     4193.46982306917,
     4439.8073779821
    ],
    "cash": [
     12436.7634940874,
     14410.6386172578,
     16762.4654766839,
     18934.563034826,
     21287.0303039485
    ],
    "equityBook": [
     87480.4912536099,
     90180.5341129907,
     92974.1928240702,
     95909.0175989236,
     99016.2431754134
    ],
    "balanceCheck": [
     0,
     0,
     0,
     0,
     0
    ],
    "growthExternal": [
     -0.034,
     0.011,
     0.0395,
     0.049,
     0.0515
    ],
    "growthFinal": [
     -0.0416015584296355,
     -0.0120373862822579,
     0.0120188465958434,
     0.0240480037986758,
     0.0314794956748681
    ],
    "marginFinal": [
     0.0453967066510946,
     0.0451867066510946,
     0.0451210694925737,
     0.0450854323340528,
     0.0450797951755318
    ],
    "ebitda": [
     11868.1928577435,
     11690.03357854,
     11822.1220471701,
     12103.0317221503,
     12485.9239132783
    ],
    "pvFcf": 23257.8708301971,
    "tvG": 85802.6403230421,
    "pvTvG": 50112.3198051833,
    "evG": 73370.1906353804,
    "tvM": 72552.8572395458,
    "pvTvM": 42373.8939860052,
    "evM": 65631.7648162023,
    "evW": 69500.9777257914,
    "ev2": 74401.446576648,
    "eq2": 57556.242576648,
    "eqVal": 59368.7056203021,
    "price": 32.9826142335012,
    "upside": -1.4856205689928181,
    "wacc": 11.3553863142439,
    "ke": 13.0495166234384,
    "priceG": 32.8039947974336,
    "priceM": 28.5048693423346,
    "priceW": 30.6544320698841,
    "tvWeight": 68.3006536731257,
    "waccMarket": 11.9198962792971,
    "keMarket": 13.020787529868599,
    "betaMarket": 0.828318564980751,
    "waccIterations": [
     [
      0.119198962792971,
      54191.5499198517,
      0.43582440500282,
      0.85169667313769,
      0.131196769273724,
      0.112985282959586
     ],
     [
      0.112985282959586,
      59575.1381719257,
      0.396440540882032,
      0.833470079405706,
      0.130425784358861,
      0.113611676098338
     ],
     [
      0.113611676098338,
      58993.936058622,
      0.400346231797975,
      0.835277607517962,
      0.13050224279801,
      0.113547982990113
     ],
     [
      0.113547982990113,
      59052.6115383637,
      0.399948442325138,
      0.835093513161704,
      0.13049445560674,
      0.113554453794392
     ],
     [
      0.113554453794392,
      59046.6461590556,
      0.399988848416209,
      0.835112212835357,
      0.130495246602936,
      0.113553796344486
     ],
     [
      0.113553796344486,
      59047.2522117577,
      0.399984742986857,
      0.835110312869608,
      0.130495166234384,
      0.113553863142439
     ]
    ],
    "betaU": 0.65,
    "betaLMarket": 0.828318564980751,
    "betaLIter": 0.835110312869608,
    "sensGordonClose": {
     "waccs": [
      0.103553863142439,
      0.108553863142439,
      0.113553863142439,
      0.118553863142439,
      0.123553863142439
     ],
     "gs": [
      0.025,
      0.03,
      0.035,
      0.04,
      0.045
     ],
     "grid": [
      [
       34.1409268045413,
       36.2518779025963,
       38.6707549148582,
       41.4702345990364,
       44.7478176113193
      ],
      [
       31.6402092504793,
       33.4652142905686,
       35.538337507205,
       37.9138686585085,
       40.6631821471626
      ],
      [
       29.4215137668335,
       31.0115476800871,
       32.8039947974336,
       34.8401336857854,
       37.1732855789508
      ],
      [
       27.439630798369,
       28.8344839997195,
       30.3962778006894,
       32.1568898059452,
       34.1568654462348
      ],
      [
       25.6585251490757,
       26.8896848229239,
       28.2598739676681,
       29.7940518369562,
       31.5235323696544
      ]
     ]
    },
    "combined": 33.2377275439993
   },
   "base_beta080": {
    "inflation": [
     0.0351,
     0.0351,
     0.0351,
     0.0351,
     0.0351
    ],
    "revenue": [
     169521.222905363,
     166899.172667645,
     168291.753761357,
     171679.130820352,
     176368.459696609
    ],
    "ebit": [
     7695.70522736961,
     7541.62395564329,
     7593.5039164933,
     7740.22783576996,
     7950.65403854719
    ],
    "taxEbit": [
     2058.75661843135,
     2043.93244930997,
     2100.99725474609,
     2185.42857200854,
     2289.86867341892
    ],
    "da": [
     4130.01270581607,
     4066.13220394458,
     4102.78286859152,
     4188.14199729641,
     4305.39317115882
    ],
    "capex": [
     3832.0389791448,
     3300.61887393722,
     3321.94292275407,
     3382.46608196171,
     3468.34231752008
    ],
    "nwcRelease": [
     97.0798253579187,
     15.3498469656297,
     279.060067797571,
     -66.4125550446124,
     -91.9384841701649
    ],
    "fcf": [
     6032.00216096745,
     6278.55468330631,
     6552.40667538223,
     6294.0626240515,
     6405.89773459684
    ],
    "netIncome": [
     3906.97782247391,
     3819.02963203058,
     3932.67101685285,
     4112.13333313227,
     4333.63263362116
    ],
    "cash": [
     12424.3751978225,
     14378.0089568858,
     16690.2121510789,
     18807.3764604079,
     21085.4073805949
    ],
    "equityBook": [
     87466.3216457933,
     90139.0922278836,
     92891.3954084417,
     95769.2963574806,
     98802.2149081991
    ],
    "balanceCheck": [
     0,
     0,
     0,
     0,
     0
    ],
    "growthExternal": [
     -0.0389,
     0.0061,
     0.0346,
     0.0441,
     0.0466
    ],
    "growthFinal": [
     -0.0450315584296355,
     -0.0154673862822579,
     0.00834384659584337,
     0.0201280037986758,
     0.0273144956748681
    ],
    "marginFinal": [
     0.0453967066510946,
     0.0451867066510946,
     0.0451210694925737,
     0.0450854323340528,
     0.0450797951755318
    ],
    "ebitda": [
     11825.7179331857,
     11607.7561595879,
     11696.2867850848,
     11928.3698330664,
     12256.047209706
    ],
    "pvFcf": 22763.456036212,
    "tvG": 79209.418945604,
    "pvTvG": 45206.6035221023,
    "evG": 67970.0595583143,
    "tvM": 71217.0961238431,
    "pvTvM": 40645.2044633348,
    "evM": 63408.6604995468,
    "evW": 65689.3600289305,
    "ev2": 70539.3316771451,
    "eq2": 53694.1276771451,
    "eqVal": 55497.600188144,
    "price": 30.8320001045245,
    "upside": -7.909199209902917,
    "wacc": 11.8703481777349,
    "ke": 13.9617200207656,
    "priceG": 29.8039219768413,
    "priceM": 27.2698113886371,
    "priceW": 28.5368666827392,
    "tvWeight": 66.5095835075997,
    "waccMarket": 12.500800915571899,
    "keMarket": 13.8293538829152,
    "betaMarket": 1.01946900305323,
    "waccIterations": [
     [
      0.125008009155719,
      48960.6186541156,
      0.482387695442543,
      1.07476413320865,
      0.140632522834726,
      0.118037973482754
     ],
     [
      0.118037973482754,
      54183.1703814936,
      0.435891806140358,
      1.04828045038967,
      0.139512263051483,
      0.118774491657988
     ],
     [
      0.118774491657988,
      53590.3580189392,
      0.44071360731819,
      1.05102690937618,
      0.139628438266612,
      0.118695902551344
     ],
     [
      0.118695902551344,
      53653.1172541089,
      0.440198094886859,
      1.05073327766109,
      0.139616017645064,
      0.118704279612403
     ],
     [
      0.118704279612403,
      53646.4219523593,
      0.440253033482344,
      1.05076457024112,
      0.1396173413212,
      0.118703386576437
     ],
     [
      0.118703386576437,
      53647.1356408505,
      0.440247176626811,
      1.05076123422354,
      0.139617200207656,
      0.118703481777349
     ]
    ],
    "betaU": 0.8,
    "betaLMarket": 1.01946900305323,
    "betaLIter": 1.05076123422354,
    "sensGordonClose": {
     "waccs": [
      0.108703481777349,
      0.113703481777349,
      0.118703481777349,
      0.123703481777349,
      0.128703481777349
     ],
     "gs": [
      0.025,
      0.03,
      0.035,
      0.04,
      0.045
     ],
     "grid": [
      [
       31.0267811850366,
       32.8144142776897,
       34.8445912840826,
       37.1702667068399,
       39.8610203573282
      ],
      [
       28.850961380823,
       30.4087732205809,
       32.1645193581079,
       34.1584830255517,
       36.4426741481201
      ],
      [
       26.9069233782525,
       28.2737742872994,
       29.8039219768413,
       31.5284889798604,
       33.4870431652257
      ],
      [
       25.1594528182165,
       26.3661058076411,
       27.7087909984233,
       29.211885907209,
       30.9059628252834
      ],
      [
       23.5801264408883,
       24.6512318954537,
       25.8366453174766,
       27.1556964951176,
       28.6323338507325
      ]
     ]
    },
    "combined": 32.1624204795109
   }
  },
  "comps": {
   "stats": {
    "evSales": [
     0.4,
     0.45,
     0.657142857142857,
     0.7,
     0.85,
     0.9,
     7
    ],
    "evEbitda": [
     5.3,
     5.6,
     7.04285714285714,
     7,
     8.25,
     9.3,
     7
    ],
    "evEbit": [
     6.6,
     8.2,
     9.95714285714286,
     10,
     11.35,
     14,
     7
    ],
    "pe": [
     4.7,
     13.35,
     14.5142857142857,
     14.6,
     17.3,
     21,
     7
    ]
   },
   "prices": {
    "evSales": [
     29.3699977777778,
     34.2110533333333,
     54.2668549206349,
     58.4163311111111,
     72.9394977777778,
     77.7805533333333
    ],
    "evEbitda": [
     25.4180068333333,
     27.3864853333333,
     36.853929547619,
     36.5727183333333,
     44.7747120833333,
     51.6643868333333
    ],
    "evEbit": [
     18.6218866666667,
     25.4049977777778,
     32.8543073015873,
     33.0359977777778,
     38.7592477777778,
     49.9937755555556
    ],
    "pe": [
     9.964,
     28.302,
     30.7702857142857,
     30.952,
     36.676,
     44.52
    ]
   },
   "value": 33.4928408544974,
   "p25": 27.031161037037,
   "p75": 40.0699866203704,
   "adjustment": -16845.204
  },
  "transactions": {
   "stats": {
    "evSales": [
     0.3,
     0.35,
     0.733333333333333,
     0.4,
     0.95,
     1.5,
     3
    ],
    "evEbitda": [
     5.2,
     5.75,
     7.63333333333333,
     6.3,
     8.85,
     11.4,
     3
    ]
   },
   "prices": {
    "evSales": [
     19.6878866666667,
     24.5289422222222,
     61.6437014814815,
     29.3699977777778,
     82.6216088888889,
     135.87322
    ],
    "evEbitda": [
     24.7618473333333,
     28.3707245833333,
     40.7283951666667,
     31.9796018333333,
     48.7116690833333,
     65.4437363333333
    ]
   },
   "value": 40.7283951666667,
   "lo": 24.7618473333333,
   "hi": 65.4437363333333,
   "windowStart": "2023-10-01",
   "detail": {
    "evSales": [
     0.733333333333333,
     174278,
     127803.866666667,
     -16845.204,
     110958.662666667,
     61.6437014814815
    ],
    "evEbitda": [
     7.63333333333333,
     11810.871,
     90156.3153,
     -16845.204,
     73311.1113,
     40.7283951666667
    ]
   }
  },
  "combined": {
   "value": 32.9538008357587,
   "classRule": 35.5453322793947,
   "dcfLo": 32.1277266764072,
   "dcfHi": 32.9826142335012
  },
  "validation": {
   "summary": "39 PASS de 39",
   "checks": [
    [
     "DCF · balance proyectado cuadra 2025A–2030E",
     "PASS"
    ],
    [
     "DCF · WACC > g",
     "PASS"
    ],
    [
     "DCF · iteración del WACC convergió",
     "PASS"
    ],
    [
     "DCF · Σ VP de FCF = SUMPRODUCT(FCF, factor)",
     "PASS"
    ],
    [
     "DCF · factor año 5 = 1/(1+WACC)^5",
     "PASS"
    ],
    [
     "DCF · VT Gordon = FCF2030 × (1+g) / (WACC − g)",
     "PASS"
    ],
    [
     "DCF · FCF2030 = NOPAT + D&A − Capex − ΔNWC",
     "PASS"
    ],
    [
     "DCF · Equity 2T26 = EV 2T26 − deuda − arrend. + caja",
     "PASS"
    ],
    [
     "DCF · FCF de 1S26 restado del EV (signo)",
     "PASS"
    ],
    [
     "DCF · precio = Equity / acciones",
     "PASS"
    ],
    [
     "DCF · escenario activo = tabla de escenarios",
     "PASS"
    ],
    [
     "DCF · baseline histórico (Citi + βU 0.80) = $31.1644",
     "PASS"
    ],
    [
     "DCF · escenarios ordenados: Cautela < Base < Alcista",
     "PASS"
    ],
    [
     "Beta · control Damodaran: 0.87 desapalancada = 0.65",
     "PASS"
    ],
    [
     "Beta · βU usada = Damodaran global (selector oficial)",
     "PASS"
    ],
    [
     "Beta · βL de mercado = βU × [1 + (1 − t) × D/E]",
     "PASS"
    ],
    [
     "Beta · βL iterada = βU × [1 + (1 − t) × D/E del DCF]",
     "PASS"
    ],
    [
     "Beta · Ke iterado = Rf + βL × PRM",
     "PASS"
    ],
    [
     "Kd · 10% consistente con intereses 1S26 / deuda 2T26 (±0.5 pp)",
     "PASS"
    ],
    [
     "Inflación · fila 10 del DCF = inflación aplicada",
     "PASS"
    ],
    [
     "Inflación · Base = modelo trimestral redondeado",
     "PASS"
    ],
    [
     "Inflación · modelo trimestral reproduce el Dossier (3.51%)",
     "PASS"
    ],
    [
     "Inflación · modelo inmediato reproduce el libro de clase (3.508%)",
     "PASS"
    ],
    [
     "Inflación · construcción de clase S113 (3.268%)",
     "PASS"
    ],
    [
     "Mercado · beta histórica = regresión sin ×10",
     "PASS"
    ],
    [
     "Comps · media de 10 empresas ≈ media publicada por CIQ (EV/EBITDA)",
     "PASS"
    ],
    [
     "Comps · media de 10 empresas ≈ media publicada por CIQ (P/U)",
     "PASS"
    ],
    [
     "Comps · media muestra (EV/EBITDA) = SUMPRODUCT / SUM",
     "PASS"
    ],
    [
     "Comps · precio EV/EBITDA recalculado",
     "PASS"
    ],
    [
     "Comps · valor = promedio de 3 precios a la media",
     "PASS"
    ],
    [
     "Comps · n de la muestra = 7",
     "PASS"
    ],
    [
     "Transactions · media EV/EBITDA ≈ media publicada por CIQ (7.6x)",
     "PASS"
    ],
    [
     "Transactions · media EV/Ventas ≈ media publicada por CIQ (0.7x)",
     "PASS"
    ],
    [
     "Combinada · pesos suman 100%",
     "PASS"
    ],
    [
     "Combinada · precio = Σ peso × precio (recalculo)",
     "PASS"
    ],
    [
     "Transactions · precio EV/EBITDA = (múltiplo × EBITDA + ajuste) / acciones",
     "PASS"
    ],
    [
     "Transactions · equity implícito = EV + ajuste",
     "PASS"
    ],
    [
     "Comps · equity implícito (EV/EBITDA) = EV + ajuste",
     "PASS"
    ],
    [
     "Combinada · Transactions con peso 0%",
     "PASS"
    ]
   ]
  }
 }
};
