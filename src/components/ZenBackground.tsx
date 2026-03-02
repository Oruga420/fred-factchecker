"use client";

import { useEffect, useRef } from 'react';

export default function ZenBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const drawGradient = () => {
            time += 0.002;

            const gradient = ctx.createLinearGradient(
                0,
                0,
                canvas.width,
                canvas.height
            );

            const offset1 = (Math.sin(time) + 1) / 2;
            const offset2 = (Math.sin(time + 2) + 1) / 2;

            gradient.addColorStop(0, '#faf8f5');
            gradient.addColorStop(offset1 * 0.3 + 0.1, 'rgba(154, 184, 158, 0.15)');
            gradient.addColorStop(offset2 * 0.3 + 0.4, 'rgba(139, 90, 43, 0.08)');
            gradient.addColorStop(0.7, 'rgba(212, 168, 83, 0.06)');
            gradient.addColorStop(1, '#f0ebe3');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawOrbs(ctx, time);

            animationId = requestAnimationFrame(drawGradient);
        };

        const orbs = Array.from({ length: 8 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: Math.random() * 150 + 80,
            speed: Math.random() * 0.3 + 0.1,
            offset: Math.random() * Math.PI * 2,
            color: ['rgba(74, 124, 89, 0.08)', 'rgba(154, 184, 158, 0.1)', 'rgba(139, 90, 43, 0.06)', 'rgba(124, 106, 156, 0.05)'][Math.floor(Math.random() * 4)]
        }));

        const drawOrbs = (ctx: CanvasRenderingContext2D, t: number) => {
            orbs.forEach(orb => {
                const x = orb.x + Math.sin(t * orb.speed + orb.offset) * 50;
                const y = orb.y + Math.cos(t * orb.speed + orb.offset) * 30;

                const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.radius);
                gradient.addColorStop(0, orb.color);
                gradient.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.arc(x, y, orb.radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            });
        };

        resize();
        drawGradient();

        window.addEventListener('resize', resize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #faf8f5 0%, #f0ebe3 100%)' }}
        />
    );
}
