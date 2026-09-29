"use client";

import { useEffect, useRef } from "react";

/*
  Runs a GLSL fragment shader live in the page (WebGL 1, same uniforms as glslCanvas / The Book of Shaders):
    uniform vec2  u_resolution;  // canvas size in pixels
    uniform float u_time;        // seconds since start
    uniform vec2  u_mouse;       // mouse position in pixels, origin bottom-left
  So a shader from VS Code (glsl-canvas) can be pasted in unchanged.
  The loop only runs while the canvas is visible on screen.
*/
const VERT = `attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? "Shader compile error");
    return sh;
};

const ShaderCanvas = ({ frag, ratio = "16 / 9", label }: { frag: string; ratio?: string; label?: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext("webgl");
        if (!gl) return;

        let program: WebGLProgram;
        try {
            program = gl.createProgram()!;
            gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
            gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, frag));
            gl.linkProgram(program);
            gl.useProgram(program);
        } catch (err) {
            console.error("ShaderCanvas:", err);
            return;
        }

        // Fullscreen quad (two triangles as a strip)
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(program, "u_resolution");
        const uTime = gl.getUniformLocation(program, "u_time");
        const uMouse = gl.getUniformLocation(program, "u_mouse");

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let mouse = { x: 0, y: 0 };
        const resize = () => {
            canvas.width = Math.round(canvas.clientWidth * dpr);
            canvas.height = Math.round(canvas.clientHeight * dpr);
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        resize();
        mouse = { x: canvas.width / 2, y: canvas.height / 2 };

        const onMove = (e: PointerEvent) => {
            const r = canvas.getBoundingClientRect();
            mouse.x = (e.clientX - r.left) * dpr;
            mouse.y = canvas.height - (e.clientY - r.top) * dpr; // WebGL: y goes up
        };
        canvas.addEventListener("pointermove", onMove);
        window.addEventListener("resize", resize);

        let frame = 0;
        let running = false;
        const start = performance.now();
        const render = () => {
            if (!running) return;
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uTime, (performance.now() - start) / 1000);
            gl.uniform2f(uMouse, mouse.x, mouse.y);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            frame = requestAnimationFrame(render);
        };
        const io = new IntersectionObserver(([entry]) => {
            running = entry.isIntersecting;
            if (running) frame = requestAnimationFrame(render);
            else cancelAnimationFrame(frame);
        });
        io.observe(canvas);

        return () => {
            running = false;
            cancelAnimationFrame(frame);
            io.disconnect();
            canvas.removeEventListener("pointermove", onMove);
            window.removeEventListener("resize", resize);
            gl.deleteProgram(program);
        };
    }, [frag]);

    return (
        <figure className="shader-figure not-prose">
            <canvas ref={canvasRef} className="shader-canvas" style={{ aspectRatio: ratio }} aria-label={label ?? "Interactive GLSL shader"} role="img" />
            {label && <figcaption>{label}</figcaption>}
        </figure>
    );
};

export default ShaderCanvas;
