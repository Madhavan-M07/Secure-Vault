import { useRef, useEffect, useState, useMemo } from 'react';
import { Globe, Radio } from 'lucide-react';

export default function ThreeGlobeTraffic({ geoData = [] }) {
  const canvasRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const nodes = useMemo(() => {
    return geoData.length > 0
      ? geoData
      : [{ country: 'Active Region', flag: '🌐', percentage: 100, lat: 20.59, lng: 78.96, active_nodes: 1 }];
  }, [geoData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight || 260);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 260;
    };
    window.addEventListener('resize', handleResize);

    const globeRadius = Math.min(width, height) * 0.38;
    let rotationY = 0;
    let rotationX = 0.25;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // Mouse & Touch interaction
    const onMouseDown = (e) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      rotationY += deltaX * 0.008;
      rotationX = Math.max(-0.8, Math.min(0.8, rotationX + deltaY * 0.008));
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - lastMouseX;
      const deltaY = e.touches[0].clientY - lastMouseY;
      rotationY += deltaX * 0.008;
      rotationX = Math.max(-0.8, Math.min(0.8, rotationX + deltaY * 0.008));
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    };
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // Generate latitude/longitude grid particles
    const particles = [];
    const latSteps = 14;
    const lngSteps = 28;
    for (let i = 0; i <= latSteps; i++) {
      const lat = (i / latSteps - 0.5) * Math.PI;
      for (let j = 0; j < lngSteps; j++) {
        const lng = (j / lngSteps) * 2 * Math.PI;
        particles.push({
          x: Math.cos(lat) * Math.sin(lng),
          y: Math.sin(lat),
          z: Math.cos(lat) * Math.cos(lng),
        });
      }
    }

    let pulseTime = 0;

    const render = () => {
      pulseTime += 0.03;
      if (!isDragging) {
        rotationY += 0.004; // Smooth continuous auto-rotation
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // 1. Atmosphere Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, globeRadius * 0.7, cx, cy, globeRadius * 1.25);
      glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.12)');
      glowGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.04)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Globe Base Circle
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. Project 3D Sphere Particles
      particles.forEach((p) => {
        // Rotate Y
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;

        // Rotate X
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        // Render only front-facing hemisphere with depth opacity
        if (z2 > -0.2) {
          const depthAlpha = Math.max(0.1, (z2 + 0.4) / 1.4);
          const px = cx + x1 * globeRadius;
          const py = cy + y2 * globeRadius;

          ctx.fillStyle = `rgba(147, 197, 253, ${depthAlpha * 0.45})`;
          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 3. Project Geographic Traffic Hubs (Cities)
      const projectedNodes = nodes.map((node) => {
        const radLat = (node.lat * Math.PI) / 180;
        const radLng = (node.lng * Math.PI) / 180;

        const nx = Math.cos(radLat) * Math.sin(radLng);
        const ny = Math.sin(radLat);
        const nz = Math.cos(radLat) * Math.cos(radLng);

        // Rotate Y
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const x1 = nx * cosY + nz * sinY;
        const z1 = -nx * sinY + nz * cosY;

        // Rotate X
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const y2 = ny * cosX - z1 * sinX;
        const z2 = ny * sinX + z1 * cosX;

        const screenX = cx + x1 * globeRadius;
        const screenY = cy + y2 * globeRadius;

        return { ...node, screenX, screenY, isVisible: z2 > 0, z: z2 };
      });

      // 4. Draw Animated Traffic Arcs between Hubs
      const hub1 = projectedNodes.find((n) => n.country === 'India');
      if (hub1 && hub1.isVisible) {
        projectedNodes.forEach((hub2) => {
          if (hub2.country !== 'India' && hub2.isVisible) {
            ctx.beginPath();
            ctx.moveTo(hub1.screenX, hub1.screenY);
            const midX = (hub1.screenX + hub2.screenX) / 2;
            const midY = (hub1.screenY + hub2.screenY) / 2 - 30; // Arc elevation
            ctx.quadraticCurveTo(midX, midY, hub2.screenX, hub2.screenY);
            ctx.strokeStyle = 'rgba(96, 165, 250, 0.35)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      }

      // 5. Render Glowing Beacon Nodes
      projectedNodes.forEach((node) => {
        if (!node.isVisible) return;

        const pulse = (Math.sin(pulseTime * 2 + node.percentage) + 1) / 2;
        const ringRadius = 4 + pulse * 6;

        // Pulsing outer ripple
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, ringRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${0.4 - pulse * 0.3})`;
        ctx.fill();

        // Solid core
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#60a5fa';
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.font = '10px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(`${node.country} (${node.percentage}%)`, node.screenX + 8, node.screenY + 3);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [nodes]);

  return (
    <div className="bg-white dark:bg-[#0f172a] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white">
            User Distribution & Live Geo-Traffic
          </h3>
        </div>
        <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold border border-blue-200 dark:border-blue-900/50">
          <Radio className="w-3 h-3 text-blue-500 animate-pulse" />
          <span>Interactive 3D Mesh</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        {/* Left 3 Cols: Interactive 3D Canvas */}
        <div className="lg:col-span-3 relative h-64 sm:h-72 w-full bg-slate-950/90 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center cursor-grab active:cursor-grabbing">
          <canvas ref={canvasRef} className="w-full h-full block" />
          <div className="absolute bottom-2.5 left-3 text-[10px] text-zinc-400 font-mono pointer-events-none flex items-center space-x-1">
            <span>Drag to rotate 3D view</span>
          </div>
        </div>

        {/* Right 2 Cols: Country Breakdown List */}
        <div className="lg:col-span-2 space-y-2.5">
          <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
            Traffic Origin Breakdown
          </p>
          <div className="divide-y divide-zinc-100 dark:divide-slate-800/80">
            {nodes.slice(0, 5).map((item) => (
              <div
                key={item.country}
                onMouseEnter={() => setSelectedCountry(item.country)}
                onMouseLeave={() => setSelectedCountry(null)}
                className={`py-2 flex items-center justify-between text-xs transition cursor-pointer px-1 rounded-lg ${
                  selectedCountry === item.country ? 'bg-blue-50/60 dark:bg-slate-850' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{item.flag || '🌐'}</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.country}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-1.5 bg-zinc-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${item.percentage * 2}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

