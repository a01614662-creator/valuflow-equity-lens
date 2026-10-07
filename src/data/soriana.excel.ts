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
   "citi",
   "cautela",
   "base",
   "alcista"
  ],
  "scenarios": {
   "citi": {
    "label": "Trayectoria Citi (histórico)",
    "kind": "Pronóstico de consenso (insumo heredado)",
    "path": [
     0.0393,
     0.0383,
     0.0375,
     0.0375,
     0.0375
    ],
    "source": "Encuesta Citi de Expectativas, 22-sep-2026: cierre 2026 3.93%, 2027 3.83%, promedio 2028–32 3.75% (comentario original de Proyección Final!C10). Pronóstico de consenso por año.",
    "cell": "Inflación!B9:F9"
   },
   "cautela": {
    "label": "Cautela",
    "kind": "Escenario / referencia de tendencia larga",
    "value": 0.0326,
    "source": "Valor documentado en el Dossier (\"ventana 2023-2026, trimestral 3.26%\") y en Avances (escenario Cautela). Construcción de clase más cercana: fila 36 (3.268%). Modelos de tendencia larga calculados aquí: fila 34.",
    "cell": "Inflación!B47"
   },
   "base": {
    "label": "Base",
    "kind": "Resultado de modelo (pronóstico)",
    "value": 0.0351,
    "source": "Fila 33 redondeada a 2 decimales en %. Reproduce el 3.51% del Dossier (\"4.0327e^(−0.028x) → 3.51%\") y de Avances. Horizonte: siguiente trimestre; su extensión a 2026–30 es un supuesto.",
    "cell": "Inflación!B48 = ROUND(G33, 4)"
   },
   "alcista": {
    "label": "Alcista",
    "kind": "Supuesto de escenario (no es pronóstico)",
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
   "wacc": 0.8,
   "damodaranUnverified": 0.65
  }
 },
 "wacc": {
  "rf": 0.09517,
  "prm": 0.0423,
  "betaU": 0.8,
  "kdPre": 0.1,
  "taxShield": 0.288010101095701,
  "debt": 23618.0,
  "kdMarket": 0.130154966550936,
  "taxMarket": 0.3,
  "start": 0.125008009155719,
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
   "Dossier de Soriana / Avances (referencia de tendencia larga)"
  ],
  [
   "Escenario Alcista 4.00%",
   "Inflación!B49",
   "4.00%",
   "—",
   "% anual",
   "Supuesto",
   "Avances de valuación intrínseca (escenario alcista)"
  ],
  [
   "Trayectoria Citi 2026–2030",
   "Inflación!B9:F9",
   "3.93/3.83/3.75%",
   "22-sep-2026",
   "% anual",
   "Observado",
   "Encuesta Citi de Expectativas (comentario original de Proyección Final!C10)"
  ],
  [
   "Beta desapalancada sectorial",
   "WACC!B9",
   "0.80",
   "—",
   "x",
   "Pendiente",
   "Input heredado (Material Maestro, \"Sesión 2\"); sin fuente verificada. Referencia Damodaran global ene-2026 0.65 no verificada."
  ],
  [
   "Kd antes de impuestos (iteración)",
   "Proyección Final!C61",
   "10.00%",
   "22-sep-2026",
   "%",
   "Supuesto",
   "Encuesta Citi (tasa Banxico 6.50%) y gastos financieros 1S26 (comentario original de C61). Verificación: intereses 1S26 anualizados / deuda 2T26 = 9.9%."
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
 "expected": {
  "dcf": {
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
    "pvFcf": 22668.1866812027,
    "tvG": 78599.7178095103,
    "pvTvG": 44870.2434986318,
    "evG": 67538.4301798345,
    "tvM": 70543.2012510331,
    "pvTvM": 40271.0175751273,
    "evM": 62939.2042563301,
    "evW": 65238.8172180823,
    "ev2": 70061.0123998774,
    "eq2": 53215.8083998773,
    "eqVal": 55004.2647837042,
    "price": 30.5579248798357,
    "upside": -8.727822939558838,
    "wacc": 11.864558286325801,
    "ke": 13.970323451345,
    "priceG": 29.5641278776858,
    "priceM": 27.0090023646278,
    "priceW": 28.2865651211568,
    "tvWeight": 66.4366100591261,
    "waccMarket": 12.500800915571899,
    "keMarket": 13.8293538829152,
    "betaMarket": 1.01946900305323,
    "waccIterations": [
     [
      0.125008009155719,
      48521.3371527092,
      0.486754928572311,
      1.0772516739083,
      0.140737745806321,
      0.117971160999132
     ],
     [
      0.117971160999132,
      53755.0816052702,
      0.439363113117932,
      1.05025767879289,
      0.139595899812939,
      0.118717860771002
     ],
     [
      0.118717860771002,
      53158.1100514099,
      0.44429721028755,
      1.05306810066888,
      0.139714780658293,
      0.118637834388525
     ],
     [
      0.118637834388525,
      53221.5809852077,
      0.443767350815158,
      1.05276629699513,
      0.139702014362894,
      0.118646401991685
     ],
     [
      0.118646401991685,
      53214.7800151131,
      0.443824065293372,
      1.05279860110362,
      0.139703380826683,
      0.118645484642083
     ],
     [
      0.118645484642083,
      53215.5081415302,
      0.443817992627006,
      1.05279514216193,
      0.13970323451345,
      0.118645582863258
     ]
    ],
    "sensGordonClose": {
     "waccs": [
      0.108645582863258,
      0.113645582863258,
      0.118645582863258,
      0.123645582863258,
      0.128645582863258
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
       30.778638202291,
       32.5541880803455,
       34.5708318311107,
       36.8812517677061,
       39.5546851032925
      ],
      [
       28.6176982387729,
       30.1648504451806,
       31.908727267273,
       33.8893972213216,
       36.1586028496893
      ],
      [
       26.6870555067259,
       28.0444519366188,
       29.5641278776858,
       31.2770347524862,
       33.2225294904285
      ],
      [
       24.9517015792281,
       26.1499277810472,
       27.4833244181115,
       28.9761313421774,
       30.658752731305
      ],
      [
       23.3833831615566,
       24.4469440586151,
       25.6240779470031,
       26.9340028725039,
       28.4005319940257
      ]
     ]
    },
    "combined": 32.0253828671665
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
    "pvFcf": 22951.2904757299,
    "tvG": 80415.7297247983,
    "pvTvG": 45871.988489665,
    "evG": 68823.2789653949,
    "tvM": 72552.8572395458,
    "pvTvM": 41386.7267458052,
    "evM": 64338.0172215351,
    "evW": 66580.648093465,
    "ev2": 71485.5791586106,
    "eq2": 54640.3751586106,
    "eqVal": 56473.5498315867,
    "price": 31.3741943508815,
    "upside": -6.289742082193839,
    "wacc": 11.8816050519749,
    "ke": 13.945114199022,
    "priceG": 30.2779327585527,
    "priceM": 27.7861206786306,
    "priceW": 29.0320267185917,
    "tvWeight": 66.6518497509105,
    "waccMarket": 12.500800915571899,
    "keMarket": 13.8293538829152,
    "betaMarket": 1.01946900305323,
    "waccIterations": [
     [
      0.125008009155719,
      49829.3881614526,
      0.473977322849623,
      1.06997365294291,
      0.140429885519485,
      0.118167755661678
     ],
     [
      0.118167755661678,
      55029.4430472998,
      0.429188425179944,
      1.04446225876381,
      0.139350753545709,
      0.118884629134743
     ],
     [
      0.118884629134743,
      54444.7796587944,
      0.433797329110598,
      1.04708745319873,
      0.139461799270306,
      0.118808793587177
     ],
     [
      0.118808793587177,
      54506.1571583685,
      0.433308844932464,
      1.04680921655824,
      0.139450029860414,
      0.118816808067781
     ],
     [
      0.118816808067781,
      54499.665401929,
      0.433360458744469,
      1.04683861536848,
      0.139451273430087,
      0.118815960990247
     ],
     [
      0.118815960990247,
      54500.3514790609,
      0.433355003390649,
      1.04683550804302,
      0.13945114199022,
      0.118816050519749
     ]
    ],
    "sensGordonClose": {
     "waccs": [
      0.108816050519749,
      0.113816050519749,
      0.118816050519749,
      0.123816050519749,
      0.128816050519749
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
       31.5172997374052,
       33.3288294955768,
       35.3857706169162,
       37.7416160063448,
       40.4666232869029
      ],
      [
       29.3120539821879,
       30.8909473914709,
       32.6701671808339,
       34.6904212407703,
       37.0042483908038
      ],
      [
       27.3415257372706,
       28.7270750709893,
       30.2779327585527,
       32.0255597180267,
       34.0099410076455
      ],
      [
       25.5700934224855,
       26.7934126152767,
       28.15446808272,
       29.6779095679968,
       31.3946418202216
      ],
      [
       23.968997689483,
       25.055024759452,
       26.2568131585277,
       27.5939136314956,
       29.0905420784825
      ]
     ]
    },
    "combined": 32.4335176026894
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
   "windowStart": "2023-10-01"
  },
  "combined": {
   "value": 32.1624204795109,
   "classRule": 35.0177453752295,
   "dcfLo": 30.5579248798357,
   "dcfHi": 31.3741943508815
  },
  "validation": {
   "summary": "29 PASS de 29",
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
     "DCF · baseline histórico (selector 0) = $31.1644",
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
     "Combinada · Transactions con peso 0%",
     "PASS"
    ]
   ]
  }
 }
};
