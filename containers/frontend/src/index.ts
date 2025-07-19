import './styles/tailwind.css';
import { startRouter, navigate } from './utils/router';

const app = document.getElementById('app');
if (!app) throw new Error('App container not found');

(window as any).navigate = navigate;

startRouter(app);