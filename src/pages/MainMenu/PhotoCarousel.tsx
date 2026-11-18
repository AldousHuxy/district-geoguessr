import { useEffect, useRef } from 'react';
import type { Material, Texture } from 'three';

const PHOTOS = [
  '33rd Street Outfall.jpg',
  'Big Dry Creek (ArapCo).jpg',
  'Boulder Creek.jpg',
  'Cherry Creek.jpg',
  'Clear Creek.jpg',
  'First Creek Park.jpg',
  'Grange Hall Creek.jpg',
  'Little Dry Creek ADCO.jpg',
  'Niver Creek Ruston Park.jpg',
  'Sanderson Gulch.jpg',
  'SPR Confluence Park.jpg',
  'SPR River Run.jpg',
  'SPR.jpg',
  'Van Bibber Drop 2.jpg',
  'West Fork of Kenneys Run.jpg',
  'Wonderland Creek.jpg',
];

const CARD_W = 1.5;
const CARD_H = 2;
const TEX_W = 384;
const TEX_H = Math.round(TEX_W * (CARD_H / CARD_W));
const STEP = (Math.PI * 2) / PHOTOS.length;
const RADIUS = (CARD_W * 1.18) / (2 * Math.tan(STEP / 2));

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

const drawCard = (img: HTMLImageElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const r = 28;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, TEX_W, TEX_H, r);
  ctx.clip();
  const scale = Math.max(TEX_W / img.naturalWidth, TEX_H / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.drawImage(img, (TEX_W - w) / 2, (TEX_H - h) / 2, w, h);
  const fade = ctx.createLinearGradient(0, TEX_H * 0.6, 0, TEX_H);
  fade.addColorStop(0, 'rgba(6,29,37,0)');
  fade.addColorStop(1, 'rgba(6,29,37,0.92)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  ctx.fillStyle = '#ffdd00';
  ctx.font = '800 26px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('WHERE IS THIS?', 24, TEX_H - 36);
  ctx.restore();
  ctx.beginPath();
  ctx.roundRect(2, 2, TEX_W - 4, TEX_H - 4, r - 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.stroke();
  return canvas;
};

type Props = { onSelect: () => void };

const PhotoCarousel = ({ onSelect }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let cleanup = () => {};

    const setup = async () => {
      try {
        const THREE = await import('three');
        if (cancelled) return;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        const canvas = renderer.domElement;
        canvas.setAttribute('aria-hidden', 'true');
        canvas.className = 'h-full w-full cursor-grab touch-pan-y active:cursor-grabbing';
        container.appendChild(canvas);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        const ring = new THREE.Group();
        scene.add(ring);

        const geometry = new THREE.PlaneGeometry(CARD_W, CARD_H);
        const textures: Texture[] = [];
        const cards: import('three').Mesh[] = [];
        PHOTOS.forEach((_, i) => {
          const material = new THREE.MeshBasicMaterial({
            transparent: true, alphaTest: 0.02, color: 0x000000,
          });
          const card = new THREE.Mesh(geometry, material);
          const angle = i * STEP;
          card.position.set(Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS);
          card.rotation.y = angle;
          card.visible = false;
          ring.add(card);
          cards.push(card);
        });

        const pin = new THREE.Group();
        const pinMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 14), pinMaterial);
        head.position.y = 0.16;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 20), pinMaterial);
        tip.rotation.x = Math.PI;
        tip.position.y = -0.1;
        pin.add(head, tip);
        scene.add(pin);

        PHOTOS.forEach(async (name, i) => {
          try {
            const img = await loadImage(`${import.meta.env.BASE_URL}${encodeURIComponent(name)}`);
            if (cancelled) return;
            const texture = new THREE.CanvasTexture(drawCard(img));
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
            textures.push(texture);
            const material = cards[i].material as import('three').MeshBasicMaterial;
            material.map = texture;
            material.needsUpdate = true;
            cards[i].visible = true;
          } catch {
            // a missing photo simply leaves its card hidden
          }
        });

        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let rotation = 0;
        let velocity = 0;
        let dragging = false;
        let lastX = 0;
        let downX = 0;
        let downY = 0;
        let downTime = 0;
        let moved = false;
        let idleSince = 0;
        let frame = 0;
        let lastTime = 0;
        let elapsed = 0;
        let width = 1;
        let contextLost = false;

        const radiansPerPixel = () => (Math.PI * 2) / (Math.max(width, 280) * 1.6);

        const onDown = (e: PointerEvent) => {
          dragging = true;
          moved = false;
          lastX = downX = e.clientX;
          downY = e.clientY;
          downTime = performance.now();
          velocity = 0;
          canvas.setPointerCapture(e.pointerId);
        };
        const onMove = (e: PointerEvent) => {
          if (!dragging) return;
          const dx = e.clientX - lastX;
          lastX = e.clientX;
          if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8) moved = true;
          const delta = dx * radiansPerPixel();
          rotation += delta;
          velocity = delta;
        };
        const onUp = (e: PointerEvent) => {
          if (!dragging) return;
          dragging = false;
          idleSince = performance.now();
          if (!moved && performance.now() - downTime < 500) {
            const rect = canvas.getBoundingClientRect();
            const pointer = new THREE.Vector2(
              ((e.clientX - rect.left) / rect.width) * 2 - 1,
              -((e.clientY - rect.top) / rect.height) * 2 + 1,
            );
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(pointer, camera);
            const hit = raycaster.intersectObjects(cards.filter((c) => c.visible))[0];
            if (hit) {
              const index = cards.indexOf(hit.object as import('three').Mesh);
              const facing = Math.cos(index * STEP + rotation);
              if (facing > 0.9) onSelectRef.current();
            }
          }
        };
        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerup', onUp);
        canvas.addEventListener('pointercancel', onUp);

        const render = (time = 0) => {
          const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
          lastTime = time;
          elapsed += dt;

          if (!dragging) {
            if (Math.abs(velocity) > 0.002) {
              rotation += velocity;
              velocity *= 0.94;
            } else {
              velocity = 0;
              if (performance.now() - idleSince < 1500 || motion.matches) {
                rotation += (Math.round(rotation / STEP) * STEP - rotation) * Math.min(dt * 6, 1);
              } else {
                rotation -= 0.12 * dt;
              }
            }
          }

          ring.rotation.y = rotation;
          camera.position.set(Math.sin(elapsed * 0.5) * 0.25, 0.35 + Math.sin(elapsed * 0.7) * 0.05, RADIUS + camera.userData.distance);
          camera.lookAt(0, 0, RADIUS);

          cards.forEach((card, i) => {
            const facing = Math.cos(i * STEP + rotation);
            const light = 0.28 + 0.72 * Math.max(0, facing) ** 1.5;
            (card.material as import('three').MeshBasicMaterial).color.setScalar(light);
            card.scale.setScalar(0.88 + 0.12 * Math.max(0, facing));
          });

          pin.position.set(0, CARD_H / 2 + 0.45 + Math.sin(elapsed * 2.2) * 0.07, RADIUS);
          pin.rotation.y = elapsed * 1.4;

          renderer.render(scene, camera);
          if (!document.hidden && !contextLost) frame = window.requestAnimationFrame(render);
        };

        const restart = () => {
          window.cancelAnimationFrame(frame);
          lastTime = 0;
          if (!document.hidden && !contextLost) render();
        };
        const resize = () => {
          width = container.clientWidth;
          const height = container.clientHeight;
          if (!width || !height) return;
          camera.aspect = width / height;
          const fovRad = (camera.fov * Math.PI) / 180;
          const fitH = (CARD_H * 1.85) / (2 * Math.tan(fovRad / 2));
          const fitW = (CARD_W * 2.1) / (2 * Math.tan(fovRad / 2) * camera.aspect);
          camera.userData.distance = Math.max(fitH, fitW);
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
        };
        const resizeObserver = new ResizeObserver(() => {
          resize();
          restart();
        });
        resizeObserver.observe(container);
        document.addEventListener('visibilitychange', restart);
        const onContextLost = (e: Event) => {
          e.preventDefault();
          contextLost = true;
          canvas.style.display = 'none';
        };
        canvas.addEventListener('webglcontextlost', onContextLost);
        resize();
        restart();

        cleanup = () => {
          window.cancelAnimationFrame(frame);
          resizeObserver.disconnect();
          document.removeEventListener('visibilitychange', restart);
          canvas.removeEventListener('pointerdown', onDown);
          canvas.removeEventListener('pointermove', onMove);
          canvas.removeEventListener('pointerup', onUp);
          canvas.removeEventListener('pointercancel', onUp);
          canvas.removeEventListener('webglcontextlost', onContextLost);
          geometry.dispose();
          cards.forEach((c) => (c.material as Material).dispose());
          pin.traverse((o) => {
            if (o instanceof THREE.Mesh) o.geometry.dispose();
          });
          pinMaterial.dispose();
          textures.forEach((t) => t.dispose());
          renderer.dispose();
          canvas.remove();
        };
      } catch (error) {
        cleanup();
        console.error('Unable to load the photo carousel:', error);
      }
    };

    void setup();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
};

export default PhotoCarousel;
