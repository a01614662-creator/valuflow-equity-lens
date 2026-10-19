import { createRoot } from 'react-dom/client';
// Tipografías empaquetadas (sin Google Fonts): Barlow para texto y Barlow Condensed para títulos.
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-500.css';
import '@fontsource/barlow/latin-700.css';
import '@fontsource/barlow/latin-ext-400.css';
import '@fontsource/barlow-condensed/latin-400.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-ext-600.css';
import './styles/industry.css';
import './styles/app.css';
import './styles/deck.css';
import { App } from './ui/App';

createRoot(document.getElementById('root')!).render(<App />);
