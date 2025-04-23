declare module 'pixi.js' {
	interface Application {
		init(options: any): Promise<void>;
		canvas: HTMLCanvasElement;
	}
}