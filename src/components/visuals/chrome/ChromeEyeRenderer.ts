/**
 * Olho da HYPNO em cromo, renderizado em tempo real (WebGL1, sem bibliotecas).
 *
 * Como funciona:
 * 1. Desenha a silhueta OFICIAL do símbolo (amêndoa + íris fatiadas em 4 faixas,
 *    pupila inteira) num canvas 2D — a geometria nunca é redesenhada.
 * 2. Um desfoque dessa máscara vira um "mapa de altura": as bordas ganham chanfro,
 *    como uma peça extrudada e polida.
 * 3. O shader calcula as normais desse relevo e reflete um estúdio procedural
 *    (céu, softboxes, linha do horizonte). Resultado: cromo líquido que responde
 *    ao cursor, sem precisar de modelo 3D.
 */

export type EyeState = {
  lid: number // 1 aberto · 0 fechado
  iris: [number, number] // deslocamento da íris/pupila em unidades do símbolo
  bands: [number, number, number, number] // deslocamento extra das 4 faixas (glitch)
  /** desloca só a pupila (ex.: [8,-4] = posição do logo oficial, cx 114 cy 96) */
  pupil?: [number, number]
}

const HIRES = (typeof window !== 'undefined' && (window as unknown as { __CHROME_U?: number }).__CHROME_U) || 0
const U = HIRES || 3 // px por unidade do símbolo no canvas da máscara
/** Renders de alta resolução (brandkit): mapa de altura em 16 bits calculado em JS, sem degraus. */
const PRECISE = !!HIRES
const VB = { x: -24, y: 24, w: 248, h: 152 }
const MW = VB.w * U
const MH = VB.h * U
const BANDS: [number, number, number][] = [
  [54, 20, -8],
  [77, 20, 0],
  [100, 20, -12],
  [123, 23, -4],
]
const IRIS = { cx: 110, cy: 100, r: 36 }
const PUPIL = { cx: 106, cy: 100, r: 16 }

const px = (u: number) => (u - VB.x) * U
const py = (v: number) => (v - VB.y) * U

function almond(ctx: CanvasRenderingContext2D) {
  ctx.moveTo(px(24), py(100))
  ctx.bezierCurveTo(px(62), py(44), px(150), py(40), px(188), py(100))
  ctx.bezierCurveTo(px(150), py(160), px(62), py(156), px(24), py(100))
  ctx.closePath()
}
function lidPath(ctx: CanvasRenderingContext2D, k: number) {
  const u1 = 146 + (44 - 146) * k
  const u2 = 150 + (40 - 150) * k
  ctx.beginPath()
  ctx.moveTo(px(18), py(100))
  ctx.bezierCurveTo(px(62), py(u1), px(150), py(u2), px(194), py(100))
  ctx.bezierCurveTo(px(150), py(166), px(62), py(162), px(18), py(100))
  ctx.closePath()
}

const VERT = `attribute vec2 p; varying vec2 uv; void main(){ uv = p*0.5+0.5; uv.y = 1.0-uv.y; gl_Position = vec4(p,0.,1.); }`
const FRAG = `
precision highp float;
#define NK ${((1.8 * U * 2) / Math.max(2, U * 0.8)).toFixed(3)}
#define SK ${Math.max(2, U * 0.8).toFixed(3)}
${PRECISE ? '#define PRECISE 1' : ''}
varying vec2 uv;
uniform sampler2D uMask, uHeight;
uniform vec2 uTexel;
uniform float uTime;
uniform vec2 uTilt;
uniform float uGlint;

vec3 env(vec3 r){
  // gira o estúdio com o cursor e muito devagar com o tempo
  float a = uTilt.x*0.55 + sin(uTime*0.13)*0.12;
  float c = cos(a), s = sin(a);
  r.xz = mat2(c,-s,s,c)*r.xz;
  float b = uTilt.y*0.35;
  c = cos(b); s = sin(b);
  r.yz = mat2(c,-s,s,c)*r.yz;
  float y = r.y;
  vec3 sky = mix(vec3(0.42,0.43,0.46), vec3(0.97,0.97,1.0), smoothstep(0.0,0.75,y));
  vec3 floorc = mix(vec3(0.02,0.02,0.025), vec3(0.16,0.16,0.18), smoothstep(-0.9,-0.05,y));
  vec3 col = y>0.0 ? sky : floorc;
  col -= 0.55*exp(-pow(y/0.035,2.0));                         // linha do horizonte
  col += 1.25*exp(-pow((y-0.55)/0.07,2.0));                   // softbox alto
  col += 0.55*exp(-pow((y-0.2)/0.05,2.0));                    // faixa média
  col += 0.9*exp(-pow((r.x-0.55)/0.08,2.0))*smoothstep(-0.2,0.5,y); // softbox vertical
  col += 0.5*exp(-pow((r.x+0.7)/0.12,2.0))*smoothstep(-0.1,0.6,y);
  col -= 0.35*exp(-pow((r.x+0.15)/0.05,2.0))*smoothstep(0.1,0.7,y); // painel escuro
  return max(col, 0.0);
}

float H(vec2 p){
#ifdef PRECISE
  vec4 t = texture2D(uHeight, p); return t.r + t.g/255.0;
#else
  return texture2D(uHeight, p).r;
#endif
}
void main(){
  float m = texture2D(uMask, uv).r;
  if (m < 0.003) { gl_FragColor = vec4(0.0); return; }
  float hc = H(uv);
  // gradiente com 2 distâncias (suaviza os degraus de 8 bits do mapa de altura)
  vec2 dx = vec2(uTexel.x*SK, 0.), dy = vec2(0., uTexel.y*SK);
  float hx = (H(uv+dx) - H(uv-dx)) * 0.5
           + (H(uv+dx*0.5) - H(uv-dx*0.5));
  float hy = (H(uv+dy) - H(uv-dy)) * 0.5
           + (H(uv+dy*0.5) - H(uv-dy*0.5));
  hx *= 0.5; hy *= 0.5;
  vec3 n = normalize(vec3(-hx*NK, hy*NK, 1.0));
  // leve perspectiva: placas planas também refletem um gradiente
  vec3 v = normalize(vec3((uv.x-0.5)*0.7 + uTilt.x*0.15, (0.5-uv.y)*0.5 - uTilt.y*0.12, 1.0));
  vec3 r = reflect(-v, n);
  vec3 col = env(r);
  // fresnel e um toque de iridescência nas bordas (como nas referências)
  float fr = pow(1.0 - clamp(n.z,0.0,1.0), 2.0);
  vec3 film = 0.5+0.5*cos(6.2831*(vec3(0.0,0.33,0.67) + fr*1.6 + uTime*0.02));
  col = mix(col, col*film*1.4, fr*0.18);
  col *= mix(0.55, 1.0, smoothstep(0.03, 0.42, hc));            // oclusão no pé do chanfro
  col *= vec3(0.97,0.98,1.0);
  // brilho em estrela (Y2K) perto da pupila
  vec2 g = (uv - vec2(0.585,0.43)) * vec2(1.0, 0.61);
  float star = exp(-abs(g.x)*90.0 - g.y*g.y*18000.0) + exp(-abs(g.y)*90.0 - g.x*g.x*18000.0);
  star += exp(-dot(g,g)*4000.0)*1.5;
  col += star*uGlint*1.6;
  col = col/(1.0+col*0.12);
  gl_FragColor = vec4(col*m, m);
}`

export class ChromeEyeRenderer {
  private gl: WebGLRenderingContext
  private mask = document.createElement('canvas')
  private height = document.createElement('canvas')
  private mctx: CanvasRenderingContext2D
  private hctx: CanvasRenderingContext2D
  private texM: WebGLTexture
  private texH: WebGLTexture
  private u: Record<string, WebGLUniformLocation | null> = {}
  private dirty = true
  ok = false

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true })
    this.gl = gl as WebGLRenderingContext
    this.mask.width = MW
    this.mask.height = MH
    this.height.width = MW
    this.height.height = MH
    this.mctx = this.mask.getContext('2d')!
    this.hctx = this.height.getContext('2d')!
    if (!gl) {
      this.texM = this.texH = null as unknown as WebGLTexture
      return
    }
    const sh = (t: number, s: string) => {
      const o = gl.createShader(t)!
      gl.shaderSource(o, s)
      gl.compileShader(o)
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn('[ChromeEye]', gl.getShaderInfoLog(o))
      return o
    }
    const pr = gl.createProgram()!
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(pr)
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return
    gl.useProgram(pr)
    const b = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, b)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(pr, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    for (const n of ['uMask', 'uHeight', 'uTexel', 'uTime', 'uTilt', 'uGlint']) this.u[n] = gl.getUniformLocation(pr, n)
    const tex = (unit: number) => {
      const t = gl.createTexture()!
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      return t
    }
    this.texM = tex(0)
    this.texH = tex(1)
    gl.uniform1i(this.u.uMask, 0)
    gl.uniform1i(this.u.uHeight, 1)
    gl.uniform2f(this.u.uTexel, 1 / MW, 1 / MH)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    this.ok = true
  }

  /** Atualiza a silhueta (pálpebra, íris, glitch). */
  setState(s: EyeState) {
    const c = this.mctx
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.clearRect(0, 0, MW, MH)
    c.fillStyle = '#000'
    c.fillRect(0, 0, MW, MH)
    c.save()
    lidPath(c, Math.max(0, Math.min(1, s.lid)))
    c.clip()
    c.fillStyle = '#fff'
    BANDS.forEach(([y, h, dx], i) => {
      c.save()
      c.beginPath()
      c.rect(0, py(y), MW, h * U)
      c.clip()
      c.translate((dx + s.bands[i]) * U, 0)
      c.beginPath()
      almond(c)
      c.moveTo(px(IRIS.cx + s.iris[0] + IRIS.r), py(IRIS.cy + s.iris[1]))
      c.arc(px(IRIS.cx + s.iris[0]), py(IRIS.cy + s.iris[1]), IRIS.r * U, 0, Math.PI * 2, true)
      c.fill('evenodd')
      c.restore()
    })
    c.beginPath()
    const pp = s.pupil ?? [0, 0]
    c.arc(px(PUPIL.cx + pp[0] + s.iris[0]), py(PUPIL.cy + pp[1] + s.iris[1]), PUPIL.r * U, 0, Math.PI * 2)
    c.fill()
    c.restore()
    if (PRECISE) {
      this.preciseHeight(s)
      this.dirty = true
      return
    }
    // mapa de altura = máscara desfocada (chanfro)
    const h = this.hctx
    h.filter = 'none'
    h.fillStyle = '#000'
    h.fillRect(0, 0, MW, MH)
    h.filter = `blur(${U * 3.2}px)`
    h.globalAlpha = 0.68 // deixa espaço para o domo da pupila (sem saturar)
    h.drawImage(this.mask, 0, 0)
    h.globalAlpha = 1
    h.filter = 'none'
    // pupila em domo (bolha de cromo) em vez de plana
    const pcx = px(PUPIL.cx + pp[0] + s.iris[0])
    const pcy = py(PUPIL.cy + pp[1] + s.iris[1])
    const g = h.createRadialGradient(pcx, pcy, 0, pcx, pcy, PUPIL.r * U)
    g.addColorStop(0, 'rgba(255,255,255,0.32)')
    g.addColorStop(0.6, 'rgba(255,255,255,0.14)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    h.globalCompositeOperation = 'lighter'
    h.fillStyle = g
    h.fillRect(pcx - PUPIL.r * U, pcy - PUPIL.r * U, PUPIL.r * U * 2, PUPIL.r * U * 2)
    h.globalCompositeOperation = 'source-over'
    this.dirty = true
  }

  private heightData?: Uint8Array
  private preciseHeight(s: EyeState) {
    const src = this.mctx.getImageData(0, 0, MW, MH).data
    let a = new Float32Array(MW * MH)
    for (let i = 0; i < a.length; i++) a[i] = src[i * 4] / 255
    let b = new Float32Array(MW * MH)
    const sigma = U * 3.2
    const r = Math.max(1, Math.round(Math.sqrt((12 * sigma * sigma) / 3 + 1) / 2))
    const box = (inp: Float32Array, out: Float32Array, horiz: boolean) => {
      const len = horiz ? MW : MH
      const lines = horiz ? MH : MW
      const w = 2 * r + 1
      for (let l = 0; l < lines; l++) {
        const at = (k: number) => (horiz ? l * MW + Math.min(len - 1, Math.max(0, k)) : Math.min(len - 1, Math.max(0, k)) * MW + l)
        let acc = 0
        for (let k = -r; k <= r; k++) acc += inp[at(k)]
        for (let k = 0; k < len; k++) {
          out[at(k)] = acc / w
          acc += inp[at(k + r + 1)] - inp[at(k - r)]
        }
      }
    }
    for (let pass = 0; pass < 3; pass++) {
      box(a, b, true)
      box(b, a, false)
    }
    const pp = s.pupil ?? [0, 0]
    const pcx = px(PUPIL.cx + pp[0] + s.iris[0])
    const pcy = py(PUPIL.cy + pp[1] + s.iris[1])
    const R = PUPIL.r * U
    const out = (this.heightData = this.heightData ?? new Uint8Array(MW * MH * 4))
    for (let y = 0; y < MH; y++)
      for (let x = 0; x < MW; x++) {
        const i = y * MW + x
        let v = a[i] * 0.68
        const d = Math.hypot(x - pcx, y - pcy) / R
        if (d < 1) v += 0.3 * Math.sqrt(1 - d * d)
        v = Math.min(0.9999, v)
        const hi = Math.floor(v * 255)
        out[i * 4] = hi
        out[i * 4 + 1] = Math.floor((v * 255 - hi) * 255)
        out[i * 4 + 2] = 0
        out[i * 4 + 3] = 255
      }
  }

  render(time: number, tilt: [number, number], glint: number) {
    if (!this.ok) return
    const gl = this.gl
    const cw = this.canvas.width
    const ch = this.canvas.height
    gl.viewport(0, 0, cw, ch)
    if (this.dirty) {
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, this.texM)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, this.mask)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, this.texH)
      if (PRECISE && this.heightData) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, MW, MH, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.heightData)
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, this.height)
      this.dirty = false
    }
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform1f(this.u.uTime, time)
    gl.uniform2f(this.u.uTilt, tilt[0], tilt[1])
    gl.uniform1f(this.u.uGlint, glint)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  resize(cssW: number, cssH: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.round(cssW * dpr)
    const hh = Math.round(cssH * dpr)
    if (this.canvas.width !== w || this.canvas.height !== hh) {
      this.canvas.width = w
      this.canvas.height = hh
    }
  }
}

export const CHROME_EYE_ASPECT = VB.w / VB.h
