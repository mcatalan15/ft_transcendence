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

export async function initGame(container: HTMLElement, preconfiguration?: Preconfiguration) {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const gameId = urlParams.get('gameId');
    
    // Early exit for direct online game connections (bypassing menu)
    if (mode === 'online' && gameId) {
        console.log('Direct online game detected, skipping menu initialization');
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

    // Use the preconfiguration passed from showPong, or create default
    const finalPreconfiguration: Preconfiguration = preconfiguration || {
        mode: 'local',
        variant: '1v1',
        classicMode: true,
        hasInvitationContext: false,
        invitationData: null
    };

    console.log('🎮 initGame received preconfiguration:', finalPreconfiguration);

    // Create menu with preconfiguration
    const menu = new Menu(app, language, BrowserOptimizer.isFirefox, finalPreconfiguration);
    await menu.init(false, true);
}