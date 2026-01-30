import Phaser from 'phaser';

const FRAG_SHADER = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform float uKeyHue;
uniform float uKeyHueRange;
uniform vec3 uTargetColor;
uniform float uIsGrayscale;

varying vec2 outTexCoord;

vec3 rgbToHsl(vec3 color) {
  float maxC = max(max(color.r, color.g), color.b);
  float minC = min(min(color.r, color.g), color.b);
  float delta = maxC - minC;
  
  float h = 0.0;
  float s = 0.0;
  float l = (maxC + minC) / 2.0;
  
  if (delta > 0.0) {
    s = l < 0.5 ? delta / (maxC + minC) : delta / (2.0 - maxC - minC);
    
    if (maxC == color.r) {
      h = (color.g - color.b) / delta + (color.g < color.b ? 6.0 : 0.0);
    } else if (maxC == color.g) {
      h = (color.b - color.r) / delta + 2.0;
    } else {
      h = (color.r - color.g) / delta + 4.0;
    }
    h /= 6.0;
  }
  
  return vec3(h * 360.0, s, l);
}

vec3 hslToRgb(vec3 hsl) {
  float h = hsl.x / 360.0;
  float s = hsl.y;
  float l = hsl.z;
  
  if (s == 0.0) {
    return vec3(l, l, l);
  }
  
  float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;
  
  float r = h + 1.0/3.0;
  float g = h;
  float b = h - 1.0/3.0;
  
  r = r < 0.0 ? r + 1.0 : (r > 1.0 ? r - 1.0 : r);
  g = g < 0.0 ? g + 1.0 : (g > 1.0 ? g - 1.0 : g);
  b = b < 0.0 ? b + 1.0 : (b > 1.0 ? b - 1.0 : b);
  
  float rOut = r < 1.0/6.0 ? p + (q - p) * 6.0 * r :
               r < 1.0/2.0 ? q :
               r < 2.0/3.0 ? p + (q - p) * (2.0/3.0 - r) * 6.0 : p;
  float gOut = g < 1.0/6.0 ? p + (q - p) * 6.0 * g :
               g < 1.0/2.0 ? q :
               g < 2.0/3.0 ? p + (q - p) * (2.0/3.0 - g) * 6.0 : p;
  float bOut = b < 1.0/6.0 ? p + (q - p) * 6.0 * b :
               b < 1.0/2.0 ? q :
               b < 2.0/3.0 ? p + (q - p) * (2.0/3.0 - b) * 6.0 : p;
  
  return vec3(rOut, gOut, bOut);
}

void main() {
  vec4 texel = texture2D(uMainSampler, outTexCoord);
  
  if (texel.a < 0.01) {
    gl_FragColor = texel;
    return;
  }
  
  vec3 hsl = rgbToHsl(texel.rgb);
  float pixelHue = hsl.x;
  float pixelSat = hsl.y;
  float pixelLight = hsl.z;
  
  float hueDiff = abs(pixelHue - uKeyHue);
  if (hueDiff > 180.0) {
    hueDiff = 360.0 - hueDiff;
  }
  
  if (hueDiff <= uKeyHueRange && pixelSat > 0.2) {
    if (uIsGrayscale > 0.5) {
      gl_FragColor = vec4(vec3(pixelLight), texel.a);
    } else {
      vec3 targetHsl = rgbToHsl(uTargetColor);
      vec3 newHsl = vec3(targetHsl.x, targetHsl.y * 0.9, pixelLight);
      vec3 newRgb = hslToRgb(newHsl);
      gl_FragColor = vec4(newRgb, texel.a);
    }
  } else {
    gl_FragColor = texel;
  }
}
`;

export class ColorSwapPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  keyHue: number = 0;
  keyHueRange: number = 30;
  targetR: number = 0.5;
  targetG: number = 0.5;
  targetB: number = 0.5;
  isGrayscale: boolean = true;

  constructor(game: Phaser.Game) {
    super({
      game,
      name: 'ColorSwapPipeline',
      fragShader: FRAG_SHADER,
    });
  }

  onPreRender(): void {
    this.set1f('uKeyHue', this.keyHue);
    this.set1f('uKeyHueRange', this.keyHueRange);
    this.set3f('uTargetColor', this.targetR, this.targetG, this.targetB);
    this.set1f('uIsGrayscale', this.isGrayscale ? 1.0 : 0.0);
  }

  setKeyHue(hue: number, range: number = 30): this {
    this.keyHue = hue;
    this.keyHueRange = range;
    return this;
  }

  setTargetColor(hexColor: number): this {
    this.targetR = ((hexColor >> 16) & 0xFF) / 255;
    this.targetG = ((hexColor >> 8) & 0xFF) / 255;
    this.targetB = (hexColor & 0xFF) / 255;
    this.isGrayscale = false;
    return this;
  }

  setGrayscale(): this {
    this.isGrayscale = true;
    return this;
  }
}
