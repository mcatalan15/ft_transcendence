// pong.ts
import { Application } from "pixi.js";
import { Menu } from './menu/Menu';
import { Preconfiguration } from "./utils/GameConfig";

class BrowserOptimizer {
  static isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
  static isChrome = navigator.userAgent.toLowerCase().includes('chrome');
  
  static getOptimalSettings(): {
      antialias: boolean;
      resolution: number;
      powerPreference: 'default' | 'high-performance' | 'low-power';
      autoDensity: boolean;
  } {
      if (this.isFirefox) {
          return {
              antialias: false,
              resolution: 1,
              powerPreference: 'default',
              autoDensity: false
          };
      } else {
          return {
              antialias: true,
              resolution: 2,
              powerPreference: 'high-performance',
              autoDensity: true
          };
      }
  }
}

export async function initGame(container: HTMLElement) {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const gameId = urlParams.get('gameId');
    
    if (mode === 'online' && gameId) {
        console.log('Online mode detected, skipping menu initialization');
        return;
    }

    const browserSettings = BrowserOptimizer.getOptimalSettings();
    
    console.log(`Browser detected: ${BrowserOptimizer.isFirefox ? 'Firefox' : 'Chrome'}`);
    console.log('Using settings:', browserSettings);

    const app = new Application();
    await app.init({
        background: '#171717',
        width: 1800,
        height: 750,
        antialias: browserSettings.antialias,
        resolution: browserSettings.resolution,
        autoDensity: browserSettings.autoDensity,
        powerPreference: BrowserOptimizer.isFirefox ? 'high-performance' : 'low-power',
        
        ...(BrowserOptimizer.isFirefox && {
            clearBeforeRender: true,
            preserveDrawingBuffer: false
        })
    });

    const language = localStorage.getItem('i18nextLng') || 'en';
    container.appendChild(app.canvas);

    const url = new URL(window.location.href);
    const pathname = url.pathname;
    const search = url.search;
    let hasPreconfig = false;
    let preconfig: Preconfiguration | null = null;

    if (pathname.endsWith('/pong') && search.length > 0) {
        const params = new URLSearchParams(search);
        const opponent = params.get('opponent');
        const mode = params.get('mode');
        hasPreconfig = search.length > 0;
        if (hasPreconfig) {
            preconfig = {
                mode: url.searchParams.get('mode') as 'local' | 'online' || 'online',
                variant: mode!,
            };
        }
    }

    const menu = new Menu(app, language, BrowserOptimizer.isFirefox, hasPreconfig, preconfig!, );
    await menu.init(false, true);
}