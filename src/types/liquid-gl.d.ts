declare module 'liquid-gl' {
  export interface LiquidGLOptions {
    engine?: 'auto' | 'webgpu' | 'webgl2' | 'webgl';
    snapshot?: string;
    target: string;
    resolution?: number;
    zIndex?: number | undefined;
    content?: string | boolean | undefined;
    refraction?: number;
    aberration?: number;
    bevelDepth?: number;
    bevelWidth?: number;
    frost?: number;
    shadow?: boolean;
    specular?: boolean;
    reveal?: 'none' | 'fade';
    tilt?: boolean;
    tiltFactor?: number;
    tiltEase?: number;
    draggable?: boolean;
    interaction?: 'none' | 'fluid';
    interactionStrength?: number;
    interactionRadius?: number;
    interactionViscosity?: number;
    magnify?: number;
    tint?: string | null;
    helper?: boolean;
    on?: {
      init?: (instance: LiquidGLInstance) => void;
      dragstart?: (instance: LiquidGLInstance, info: { x: number; y: number }) => void;
      drag?: (instance: LiquidGLInstance, info: { x: number; y: number }) => void;
      dragend?: (instance: LiquidGLInstance, info: { x: number; y: number }) => void;
    };
  }

  export interface LiquidGLInstance {
    destroy: () => void;
    setTint: (color: string) => void;
    setDraggable: (draggable: boolean) => void;
  }

  function liquidGL(options: LiquidGLOptions): LiquidGLInstance;
  namespace liquidGL {
    function registerDynamic(elements: string | HTMLElement[] | NodeListOf<Element>): void;
    function syncWith(options: any): void;
  }

  export default liquidGL;
}
