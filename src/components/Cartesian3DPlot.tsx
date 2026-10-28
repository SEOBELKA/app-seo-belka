import React, { useRef, useEffect, useState } from 'react';
import { SEODataPoint, TargetKeyword } from '../types/seo';
import { formatWideNumber } from '../utils/math';
import { Rotate3d, ZoomIn, ZoomOut, Maximize2, Compass } from 'lucide-react';

interface Cartesian3DPlotProps {
  points: SEODataPoint[];
  targetKeywords: TargetKeyword[];
}

export const Cartesian3DPlot: React.FC<Cartesian3DPlotProps> = ({ points, targetKeywords }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D rotation angles in radians
  const [pitch, setPitch] = useState<number>(0.55); // Rotation around X
  const [yaw, setYaw] = useState<number>(0.75); // Rotation around Y
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<SEODataPoint | null>(null);

  // Z variable selection: CTR or Position
  const [zMetric, setZMetric] = useState<'ctr' | 'position'>('ctr');

  // Normalize points in [0, 1] cube
  const maxImp = Math.max(1, ...points.map(p => p.impressions));
  const maxClicks = Math.max(1, ...points.map(p => p.clicks));
  const maxZ = zMetric === 'ctr' ? Math.max(0.1, ...points.map(p => p.ctr)) : 50;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // 3D parameters
    const centerX = width / 2;
    const centerY = height / 2 + 20;
    const boxSize = Math.min(width, height) * 0.42 * zoom;

    // 3D to 2D projection function
    // coordinate system: X = Impresiones, Y = Clics (up), Z = CTR (depth)
    const project = (xNorm: number, yNorm: number, zNorm: number) => {
      // Center coordinates around (0,0,0) from range [-0.5, 0.5]
      const x = (xNorm - 0.5) * boxSize;
      const y = (0.5 - yNorm) * boxSize; // Invert Y so up is positive
      const z = (zNorm - 0.5) * boxSize;

      // Rotate around Y axis (Yaw)
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      // Rotate around X axis (Pitch)
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y2 = y * cosP - z1 * sinP;
      const z2 = y * sinP + z1 * cosP;

      // Perspective projection
      const cameraDistance = boxSize * 2.5;
      const scale = cameraDistance / (cameraDistance + z2);

      return {
        px: centerX + x1 * scale,
        py: centerY + y2 * scale,
        depth: z2,
        scale,
      };
    };

    // Draw 3D Bounding Box & Grid Lines
    const corners = [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], // Front face
      [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1], // Back face
    ].map(([x, y, z]) => project(x, y, z));

    // Draw floor grid (XZ plane at Y = 0)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    const gridDivs = 4;
    for (let i = 0; i <= gridDivs; i++) {
      const u = i / gridDivs;
      const p1 = project(u, 0, 0);
      const p2 = project(u, 0, 1);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();

      const p3 = project(0, 0, u);
      const p4 = project(1, 0, u);
      ctx.beginPath();
      ctx.moveTo(p3.px, p3.py);
      ctx.lineTo(p4.px, p4.py);
      ctx.stroke();
    }

    // Draw Axes lines
    // Axis X: Impresiones (Red/Orange)
    const o = project(0, 0, 0);
    const xEnd = project(1.1, 0, 0);
    ctx.beginPath();
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2.5;
    ctx.moveTo(o.px, o.py);
    ctx.lineTo(xEnd.px, xEnd.py);
    ctx.stroke();

    // Axis Y: Clics Orgánicos (Green)
    const yEnd = project(0, 1.1, 0);
    ctx.beginPath();
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2.5;
    ctx.moveTo(o.px, o.py);
    ctx.lineTo(yEnd.px, yEnd.py);
    ctx.stroke();

    // Axis Z: CTR / Posición (Purple)
    const zEnd = project(0, 0, 1.1);
    ctx.beginPath();
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 2.5;
    ctx.moveTo(o.px, o.py);
    ctx.lineTo(zEnd.px, zEnd.py);
    ctx.stroke();

    // Axis labels in 3D
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#3B82F6';
    ctx.fillText('Eje X: Impresiones GSC', xEnd.px + 5, xEnd.py + 4);

    ctx.fillStyle = '#10B981';
    ctx.fillText('Eje Y: Clics Orgánicos', yEnd.px - 10, yEnd.py - 8);

    ctx.fillStyle = '#8B5CF6';
    ctx.fillText(zMetric === 'ctr' ? 'Eje Z: CTR (%)' : 'Eje Z: Posición SERP', zEnd.px + 6, zEnd.py + 4);

    // Project and sort data points by depth (painters algorithm)
    const projectedPoints = points.map(pt => {
      const xNorm = pt.impressions / maxImp;
      const yNorm = pt.clicks / maxClicks;
      const zValue = zMetric === 'ctr' ? pt.ctr : Math.max(1, 50 - (pt.position || 10));
      const zNorm = Math.min(1, Math.max(0, zValue / maxZ));

      const proj = project(xNorm, yNorm, zNorm);
      const isTarget = Boolean(pt.targetKeywordId);

      return {
        pt,
        xNorm,
        yNorm,
        zNorm,
        proj,
        isTarget,
      };
    });

    projectedPoints.sort((a, b) => b.proj.depth - a.proj.depth);

    // Draw drop lines to floor for 3D depth perception
    projectedPoints.forEach(({ proj, xNorm, zNorm }) => {
      const floorProj = project(xNorm, 0, zNorm);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
      ctx.setLineDash([2, 3]);
      ctx.moveTo(floorProj.px, floorProj.py);
      ctx.lineTo(proj.px, proj.py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Little shadow dot on floor
      ctx.beginPath();
      ctx.arc(floorProj.px, floorProj.py, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100, 116, 139, 0.3)';
      ctx.fill();
    });

    // Draw 3D Data Spheres
    projectedPoints.forEach(({ pt, proj, isTarget }) => {
      const radius = Math.max(4, Math.min(14, (pt.ctr * 1.5 + 4) * proj.scale));

      // Glow for target keywords
      if (isTarget) {
        ctx.beginPath();
        ctx.arc(proj.px, proj.py, radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(proj.px, proj.py, radius, 0, Math.PI * 2);

      // Color coding based on CTR
      if (isTarget) {
        ctx.fillStyle = '#2563EB'; // Vibrant target blue
      } else if (pt.ctr >= 4.0) {
        ctx.fillStyle = '#10B981'; // High CTR
      } else if (pt.ctr >= 2.0) {
        ctx.fillStyle = '#3B82F6'; // Medium CTR
      } else {
        ctx.fillStyle = '#F59E0B'; // Low CTR
      }
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label for target keywords in 3D
      if (isTarget) {
        ctx.font = '500 10px JetBrains Mono, monospace';
        ctx.fillStyle = '#1E293B';
        ctx.fillText(pt.keyword.slice(0, 18), proj.px + radius + 4, proj.py + 3);
      }
    });

  }, [points, pitch, yaw, zoom, zMetric, maxImp, maxClicks, maxZ]);

  // Handle Mouse Drag for Rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setYaw(prev => prev + deltaX * 0.008);
    setPitch(prev => Math.max(-1.2, Math.min(1.2, prev + deltaY * 0.008)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      {/* 3D View Controls Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Rotate3d className="w-4 h-4 text-blue-400" />
          <span className="font-semibold">Espacio Cartesiano Tridimensional (Ejes X, Y, Z)</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            (Arrastra con el ratón para rotar el gráfico en cualquier ángulo)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
            <span className="text-[10px] text-slate-400">Eje Z:</span>
            <button
              onClick={() => setZMetric('ctr')}
              className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                zMetric === 'ctr' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              CTR %
            </button>
            <button
              onClick={() => setZMetric('position')}
              className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                zMetric === 'position' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Posición
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 rounded p-0.5">
            <button
              onClick={() => setZoom(prev => Math.min(1.8, prev + 0.15))}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded"
              title="Acercar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(0.6, prev - 0.15))}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded"
              title="Alejar Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setPitch(0.55);
                setYaw(0.75);
                setZoom(1.0);
              }}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded"
              title="Restablecer Cámara"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div
        className="w-full h-[400px] cursor-grab active:cursor-grabbing relative select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-4 p-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-lg text-[10px] font-mono text-slate-300 space-y-1 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
            <span>X: Impresiones GSC (Escala hasta {formatWideNumber(maxImp, true)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            <span>Y: Clics Orgánicos (Escala hasta {formatWideNumber(maxClicks, true)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
            <span>Z: {zMetric === 'ctr' ? 'CTR Orgánico (%)' : 'Posición SERP'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
