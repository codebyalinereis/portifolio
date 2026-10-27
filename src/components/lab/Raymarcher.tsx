"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useI18n } from "@/contexts/LocaleProvider";

/* Raymarching WebGL puro: um fullscreen triangle + fragment shader GLSL.
   Nenhuma biblioteca 3D — a cena é um campo de distâncias assinadas (SDF)
   avaliado por pixel: prisma triangular de cristal com uma giroide pulsando
   dentro e um mini-prisma sólido girando ao contrário no núcleo — com sombra
   suave, AO e névoa. Câmera orbital: auto-rotação + arraste do usuário.
   Cores lidas dos tokens do tema (--accent/--background) via elemento-probe,
   atualizadas quando o tema muda (MutationObserver na classe do <html>). */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_cam;  // theta, phi
uniform vec3  u_colA; // accent
uniform vec3  u_colB; // ouro fixo
uniform vec3  u_bg;   // background do tema

#define MAX_DIST 22.0
#define SURF 0.0014

// Giroide: |dot(sin, cos)| da família clássica — malha triply-periodic mínima.
float gyroid(vec3 p, float s, float th) {
  return (abs(dot(sin(p * s), cos(p.zxy * s))) - th) / s;
}

// Prisma triangular (seção em XY, extrudado em Z) — iq
float sdTriPrism(vec3 p, vec2 h) {
  vec3 q = abs(p);
  return max(q.z - h.y, max(q.x * 0.866025 + p.y * 0.5, -p.y) - h.x * 0.5);
}

mat2 rot2(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float map(vec3 p) {
  // Cristal em pé, girando em torno do próprio eixo vertical (Y)
  float ang = u_time * 0.18;
  vec3 r = p;
  r.xz = rot2(ang) * r.xz;

  // Casca: seção triangular no plano horizontal, extrudada em Y
  // (troca y↔z: o sdTriPrism nativo tem a seção em XY e extruda em Z)
  float prism = sdTriPrism(vec3(r.x, r.z, r.y), vec2(1.7 + 0.06 * sin(u_time * 0.22), 1.05));

  // Giroide viva acondicionada dentro do prisma: cristal com malha interna
  vec3 w = r;
  w.xy += 0.24 * sin(w.z * 1.3 + u_time * 0.3);
  float s = 7.5 + 1.2 * sin(u_time * 0.18);
  float th = 0.55 + 0.18 * sin(u_time * 0.25);
  float g = gyroid(w, s, th);
  float shell = max(prism, g + 0.03 * abs(g));

  // Núcleo: prisma sólido pequeno girando ao contrário
  vec3 c = p;
  c.xz = rot2(-ang * 1.7) * c.xz;
  return min(shell, sdTriPrism(vec3(c.x, c.z, c.y), vec2(0.55, 0.36)));
}

vec3 calcNormal(vec3 p) {
  const vec2 e = vec2(0.0016, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

float softShadow(vec3 ro, vec3 rd) {
  float res = 1.0;
  float t = 0.02;
  for (int i = 0; i < 40; i++) {
    float h = map(ro + rd * t);
    res = min(res, 12.0 * h / t);
    t += clamp(h, 0.02, 0.35);
    if (res < 0.005 || t > 6.0) break;
  }
  return clamp(res, 0.0, 1.0);
}

float calcAO(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float h = 0.015 + 0.13 * float(i);
    float d = map(p + h * n);
    occ += (h - d) * sca;
    sca *= 0.85;
  }
  return clamp(1.0 - 2.2 * occ, 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / u_res.y;

  // Câmera orbital esférica olhando para a origem
  vec3 ro = 3.4 * vec3(
    cos(u_cam.x) * cos(u_cam.y),
    sin(u_cam.y),
    sin(u_cam.x) * cos(u_cam.y)
  );
  vec3 fw = normalize(-ro);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);
  vec3 rd = normalize(uv.x * rt + uv.y * up + 1.7 * fw);

  // Marcha do raio
  float t = 0.0;
  float d = 1e9;
  bool hit = false;
  for (int i = 0; i < 96; i++) {
    vec3 p = ro + rd * t;
    d = map(p);
    if (d < SURF) { hit = true; break; }
    t += d * 0.9;
    if (t > MAX_DIST) break;
  }

  vec3 col;
  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 l = normalize(vec3(0.65, 0.75, -0.4));
    float dif = clamp(dot(n, l), 0.0, 1.0) * softShadow(p + n * 0.02, l);
    float ao = calcAO(p, n);
    float fre = pow(clamp(1.0 + dot(rd, n), 0.0, 1.0), 3.0);
    vec3 hal = normalize(l - rd);
    float spe = pow(clamp(dot(n, hal), 0.0, 1.0), 40.0) * dif;

    vec3 base = mix(u_colB, u_colA, clamp(0.5 + 0.5 * n.y, 0.0, 1.0));
    col = base * (0.14 + 1.15 * dif) * ao;
    col += u_colA * fre * 0.55;
    col += vec3(1.0) * spe * 0.8;
    // Névoa: desaparece na cor de fundo do tema (estúdio no claro, noite no escuro)
    col = mix(col, u_bg * 0.96, 1.0 - exp(-0.10 * t * t));
  } else {
    col = mix(u_bg * 0.55, u_bg * 1.05, smoothstep(-0.4, 0.6, rd.y));
  }

  gl_FragColor = vec4(pow(col, vec3(0.4545)), 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

type RGB = [number, number, number];
const GOLD: RGB = [0.99, 0.72, 0.28];

export function Raymarcher() {
  const { d } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext("webgl2", { antialias: false }) ??
      canvas.getContext("webgl", { antialias: false })) as WebGLRenderingContext | null;
    if (!gl) {
      setSupported(false);
      return;
    }
    // Narrowing não vaza para closures — fixa em consts locais (padrão do FlowField)
    const element = canvas;
    const context = gl;

    const vert = compile(gl, gl.VERTEX_SHADER, VERT);
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = vert && frag ? gl.createProgram() : null;
    if (!vert || !frag || !program) {
      setSupported(false); // canvas preto mudo não conta história
      return;
    }
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Fullscreen triangle (cobre a tela sem índices)
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uCam = gl.getUniformLocation(program, "u_cam");
    const uColA = gl.getUniformLocation(program, "u_colA");
    const uColB = gl.getUniformLocation(program, "u_colB");
    const uBg = gl.getUniformLocation(program, "u_bg");

    // Cores do tema via elemento-probe: o navegador resolve var(--token) em rgb()
    const probe = document.createElement("span");
    probe.style.display = "none";
    document.body.appendChild(probe);
    const cssColor = (token: string, fallback: RGB): RGB => {
      probe.style.color = "";
      probe.style.color = `var(${token})`;
      const match = getComputedStyle(probe).color.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
      return match ? [1, 2, 3].map((i) => Number(match[i]) / 255) as RGB : fallback;
    };
    let colA = cssColor("--accent", [0.55, 0.35, 0.95]);
    let bg = cssColor("--background", [0.06, 0.05, 0.09]);
    const themeObserver = new MutationObserver(() => {
      colA = cssColor("--accent", colA);
      bg = cssColor("--background", bg);
      if (reduced || paused) render(); // modo estático repinta na hora
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Órbita: theta (azimute), phi (elevação)
    let theta = 0.9;
    let phi = 0.42; // vista 3/4: mostra a face triangular do topo
    let time = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let raf = 0;
    let visible = true;
    let last = performance.now();

    function resize() {
      const rect = element.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 1.25); // raymarch pesa: teto baixo
      element.width = Math.max(1, Math.round(rect.width * scale));
      element.height = Math.max(1, Math.round(rect.height * scale));
      context.viewport(0, 0, element.width, element.height);
      if (reduced || paused) render();
    }

    function render() {
      context.uniform2f(uRes, element.width, element.height);
      context.uniform1f(uTime, time);
      context.uniform2f(uCam, theta, phi);
      context.uniform3fv(uColA, colA);
      context.uniform3fv(uColB, GOLD);
      context.uniform3fv(uBg, bg);
      context.drawArrays(context.TRIANGLES, 0, 3);
    }

    function frame(now: number) {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!dragging) theta += dt * 0.12; // o prisma já gira sozinho — câmera mais calma
      time += dt;
      render();
      if (!paused && visible && raf === 0) raf = requestAnimationFrame(frame);
    }

    function wake() {
      if (!paused && !reduced && visible && raf === 0) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    function onDown(event: PointerEvent) {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      element.setPointerCapture(event.pointerId);
    }
    function onMove(event: PointerEvent) {
      if (!dragging) return;
      theta -= (event.clientX - lastX) * 0.005;
      phi = Math.max(-1.2, Math.min(1.2, phi + (event.clientY - lastY) * 0.005));
      lastX = event.clientX;
      lastY = event.clientY;
      if (reduced || paused) render(); // estático: repinta a cada arraste
    }
    function onUp() {
      dragging = false;
    }
    function onLost(lostEvent: Event) {
      lostEvent.preventDefault();
      cancelAnimationFrame(raf);
      setSupported(false);
    }

    resize();
    if (reduced || paused) render();
    else wake();

    const observer = new ResizeObserver(resize);
    observer.observe(element);
    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) wake();
    });
    io.observe(element);
    element.addEventListener("pointerdown", onDown);
    element.addEventListener("pointermove", onMove, { passive: true });
    element.addEventListener("pointerup", onUp);
    element.addEventListener("pointercancel", onUp);
    element.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointercancel", onUp);
      element.removeEventListener("webglcontextlost", onLost);
      probe.remove();
      // Sem loseContext(): o StrictMode desmonta/remonta em dev e o canvas só tem
      // um contexto a vida toda — matar aqui deixaria a 2ª montada com shader morto.
    };
  }, [paused]);

  return (
    <section id="shader" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 data-reveal className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {d.lab.shader.title}
      </h2>
      <span aria-hidden="true" className="heading-underline mt-2 block" />
      <p data-reveal className="mt-3 max-w-2xl text-muted">
        {d.lab.shader.subtitle}
      </p>

      <div data-reveal className="mt-8 overflow-hidden rounded-xl border border-border bg-surface">
        {supported ? (
          <canvas
            ref={canvasRef}
            className="block h-[380px] w-full cursor-grab touch-none active:cursor-grabbing sm:h-[480px]"
            aria-label={d.lab.shader.title}
          />
        ) : (
          <div className="flex h-[380px] items-center justify-center p-6 text-center text-sm text-muted sm:h-[480px]">
            {d.lab.shader.unsupported}
          </div>
        )}
      </div>

      {supported ? (
        <div data-reveal className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-surface-2"
          >
            {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
            {paused ? d.lab.shader.play : d.lab.shader.pause}
          </button>
          <p className="text-xs text-muted">{d.lab.shader.hint}</p>
        </div>
      ) : null}
    </section>
  );
}
