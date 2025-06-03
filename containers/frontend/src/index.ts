import './styles/tailwind.css';
import i18n from './i18n';
import { startRouter, navigate } from './utils/router';

const app = document.getElementById('app');
if (!app) throw new Error('App container not found');

// Exponer `navigate()` globalmente para uso en HTML y componentes
(window as any).navigate = navigate;

startRouter(app);
