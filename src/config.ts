// Datos del proyecto académico (no de la empresa valuada). Cambia aquí el equipo o la institución.
export const PROJECT = {
  institution: 'Tecnológico de Monterrey',
  course: 'Valuación de Empresas',
  year: 2026,
  team: [
    ['Adrián Fermín Rodríguez Valades', 'A01614820'], ['Saúl González Loredo', 'A016113349'], ['Miguel Emilio Pérez García', 'A01613516'],
    ['Mauricio Fernandez Juarez', 'A01614732'], ['Francisco Aarón Ponce Flores', 'A01614662']
  ] as [string, string][]
};

/**
 * Enlace público de la demo (código QR de la portada y de 00 · Acerca de). Alias de producción en Vercel del
 * repositorio del equipo; se puede reemplazar al compilar con la variable de entorno VITE_DEMO_URL.
 */
export const DEMO_URL: string = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_DEMO_URL || 'https://valuflow-equity-lens.vercel.app').trim();
