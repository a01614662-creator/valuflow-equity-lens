// Datos del estudio académico (no de la empresa valuada). Estudio individual: un solo autor.
export const AUTHOR = {
  name: 'Francisco Aarón Ponce Flores',
  id: 'A01614662',
  program: 'Licenciatura en Finanzas',
  institution: 'Tecnológico de Monterrey',
  campus: 'Campus San Luis Potosí',
  course: 'Valuación de Empresas (Bloque de Valuación de Empresas)',
  activity: 'Actividad Sesión 3: Valuación Intrínseca',
  professor: 'Francisco Javier Rueda Castillón',
  context: 'Reto de Valuación de Empresas, Banamex × Tec de Monterrey',
  role: 'Analista de Equity Research',
  /** Apellidos para los nombres de archivo exportados. */
  fileTag: 'Ponce_Flores',
  year: 2026
};

export const APP_TITLE = 'ValuFlow · Estudio individual de Soriana';
export const APP_VERSION = '2.0.0';
/** Pie de página de los documentos exportados. */
export const FOOTER = AUTHOR.name + ' · ' + AUTHOR.id + ' · Tec de Monterrey, ' + AUTHOR.campus;
/** Fuente que acompaña cada tabla y gráfica exportada. */
export const SOURCE = 'Fuente: motor ValuFlow, dataset del Excel SORIANA_FINAL';
