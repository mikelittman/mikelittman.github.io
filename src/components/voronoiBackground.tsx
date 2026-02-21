"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
#extension GL_OES_standard_derivatives : enable
precision highp float;

varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_theme;
uniform float u_density;

vec2 hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(1.0, u_resolution.y);

  vec2 centered = uv - 0.5;
  mat2 rot = mat2(0.8623, -0.5064, 0.5064, 0.8623);
  vec2 gridUv = rot * vec2(centered.x * aspect, centered.y);
  gridUv += vec2(
    sin((uv.y + u_time * 0.010) * 2.8),
    cos((uv.x - u_time * 0.008) * 2.4)
  ) * 0.035;
  gridUv *= u_density;

  vec2 i = floor(gridUv);
  vec2 f = fract(gridUv);

  float f1 = 10.0;
  float f2 = 10.0;
  float f3 = 10.0;
  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 n = vec2(float(x), float(y));
      vec2 cell = i + n;
      vec2 rnd = hash2(cell);

      float speed = 0.12 + rnd.x * 0.16;
      float phase = 6.2831853 * rnd.y;
      vec2 offset = 0.5 + 0.35 * vec2(
        cos(u_time * speed + phase),
        sin(u_time * (speed * 0.86) + phase)
      );

      vec2 p = n + offset;
      vec2 d = p - f;
      float dist = dot(d, d);

      if (dist < f1) {
        f3 = f2;
        f2 = f1;
        f1 = dist;
      } else if (dist < f2) {
        f3 = f2;
        f2 = dist;
      } else if (dist < f3) {
        f3 = dist;
      }
    }
  }

  float d1 = sqrt(max(0.000001, f1));
  float d2 = sqrt(max(0.000001, f2));
  float d3 = sqrt(max(0.000001, f3));
  float edgeMetric = (d2 - d1) / max(d2, 0.0001);
  float lineWidth = 0.060;
  float aa = max(fwidth(edgeMetric), 0.0025);
  float edgeLine = 1.0 - smoothstep(lineWidth - aa, lineWidth + aa, edgeMetric);

  float tripleProximity = 1.0 - smoothstep(
    0.065,
    0.22,
    (d3 - d1) / max(d3, 0.0001)
  );
  edgeLine *= 1.0 - tripleProximity * 0.72;

  vec2 flow = vec2(
    sin((uv.y + u_time * 0.022) * 3.5),
    cos((uv.x - u_time * 0.018) * 3.0)
  ) * 0.008;

  float hueBase = 0.56 + sin((uv.x + uv.y) * 2.0 + u_time * 0.025) * 0.012;
  float sat = mix(0.42, 0.34, u_theme);
  float light = mix(0.70, 0.28, u_theme);

  float grad = dot(uv + flow, vec2(0.66, 0.78));
  float smoothBand = sin((uv.y + u_time * 0.012) * 3.0) * 0.015;
  float aurora = sin((uv.x * 1.4 - uv.y * 0.8 + u_time * 0.018) * 8.0) * 0.010;
  light += grad * mix(0.082, 0.054, u_theme) + smoothBand + aurora;

  vec3 base = vec3(hueBase, sat, clamp(light, 0.0, 1.0));

  float c = base.z * base.y;
  float h6 = mod(base.x * 6.0, 6.0);
  float x = c * (1.0 - abs(mod(h6, 2.0) - 1.0));
  vec3 rgb1;

  if (h6 < 1.0) rgb1 = vec3(c, x, 0.0);
  else if (h6 < 2.0) rgb1 = vec3(x, c, 0.0);
  else if (h6 < 3.0) rgb1 = vec3(0.0, c, x);
  else if (h6 < 4.0) rgb1 = vec3(0.0, x, c);
  else if (h6 < 5.0) rgb1 = vec3(x, 0.0, c);
  else rgb1 = vec3(c, 0.0, x);

  vec3 rgb = rgb1 + vec3(base.z - c);

  float vignette = smoothstep(1.0, 0.07, dot(uv - 0.5, uv - 0.5));
  rgb *= mix(0.80, 1.07, vignette);

  vec3 edgeColor = mix(vec3(0.87, 0.98, 1.00), vec3(0.16, 0.24, 0.35), u_theme);
  rgb = mix(rgb, edgeColor, edgeLine * 0.92);

  vec3 tintA = mix(vec3(0.84, 0.96, 1.00), vec3(0.08, 0.13, 0.22), u_theme);
  vec3 tintB = mix(vec3(0.68, 0.86, 1.00), vec3(0.12, 0.20, 0.31), u_theme);
  rgb = mix(rgb, mix(tintA, tintB, uv.y), 0.26);

  vec3 accentA = mix(vec3(0.60, 0.84, 1.00), vec3(0.20, 0.33, 0.52), u_theme);
  vec3 accentB = mix(vec3(0.98, 0.86, 0.78), vec3(0.40, 0.30, 0.22), u_theme);
  float accentMix = smoothstep(0.12, 0.88, uv.x + flow.x * 8.0);
  rgb = mix(rgb, mix(accentA, accentB, accentMix), 0.10);

  float grain = hash2(uv * u_resolution + vec2(u_time * 50.0, 0.0)).x - 0.5;
  rgb += grain * mix(0.012, 0.008, u_theme);

  gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), 0.72);
}
`;

function prefersDarkMode(): boolean {
  const explicitTheme = document.documentElement.getAttribute(
    "data-theme",
  );

  if (explicitTheme === "dark") {
    return true;
  }

  if (explicitTheme === "light") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)")
    .matches;
}

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram | null {
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentSource,
  );

  if (!vertex || !fragment) {
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return null;
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function VoronoiBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      return;
    }

    gl.getExtension("OES_standard_derivatives");

    const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    if (!program) {
      return;
    }

    const positionAttrib = gl.getAttribLocation(program, "a_position");
    const resolutionUniform = gl.getUniformLocation(
      program,
      "u_resolution",
    );
    const timeUniform = gl.getUniformLocation(program, "u_time");
    const themeUniform = gl.getUniformLocation(
      program,
      "u_theme",
    );
    const densityUniform = gl.getUniformLocation(
      program,
      "u_density",
    );

    if (
      positionAttrib < 0 ||
      !resolutionUniform ||
      !timeUniform ||
      !themeUniform ||
      !densityUniform
    ) {
      gl.deleteProgram(program);
      return;
    }

    const quad = gl.createBuffer();
    if (!quad) {
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1,
        -1,
        1,
        -1,
        -1,
        1,
        -1,
        1,
        1,
        -1,
        1,
        1,
      ]),
      gl.STATIC_DRAW,
    );

    let reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const onMotionPrefChange = (
      event: MediaQueryListEvent,
    ) => {
      reducedMotion = event.matches;
    };

    reducedMotionQuery.addEventListener(
      "change",
      onMotionPrefChange,
    );

    window.addEventListener("resize", resize);

    let rafId = 0;
    let lastFrame = 0;
    const start = performance.now();

    const render = (now: number) => {
      const frameBudget = reducedMotion ? 130 : 28;
      if (now - lastFrame < frameBudget) {
        rafId = requestAnimationFrame(render);
        return;
      }

      lastFrame = now;

      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(positionAttrib);
      gl.vertexAttribPointer(
        positionAttrib,
        2,
        gl.FLOAT,
        false,
        0,
        0,
      );

      gl.uniform2f(
        resolutionUniform,
        canvas.width,
        canvas.height,
      );
      gl.uniform1f(timeUniform, (now - start) / 1000);
      gl.uniform1f(themeUniform, prefersDarkMode() ? 1 : 0);
      gl.uniform1f(densityUniform, reducedMotion ? 16 : 28);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      reducedMotionQuery.removeEventListener(
        "change",
        onMotionPrefChange,
      );

      gl.deleteBuffer(quad);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      aria-hidden="true"
      className="voronoi-bg"
      ref={canvasRef}
    />
  );
}
