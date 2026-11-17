import { useEffect, useRef } from 'react';
import type { Material, Object3D } from 'three';

const heightAt = (x: number, z: number) => (
  0.18 * Math.sin(x * 0.9) * Math.cos(z * 0.7)
  + 1.15 * Math.exp(-((x + 2.7) ** 2 + (z + 1.8) ** 2) / 5)
  + 0.7 * Math.exp(-((x - 2.5) ** 2 + (z - 1.8) ** 2) / 4)
);

const WatershedScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);

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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.setAttribute('aria-hidden', 'true');
        renderer.domElement.className = 'h-full w-full';
        container.appendChild(renderer.domElement);
        cleanup = () => {
          renderer.dispose();
          renderer.domElement.remove();
        };

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-6, 6, 6, -6, 0.1, 100);
        camera.position.set(8, 10, 12);
        camera.lookAt(0, 0, 0);
        scene.add(new THREE.AmbientLight(0xb5eaff, 2));
        const light = new THREE.DirectionalLight(0xffffff, 2.3);
        light.position.set(-4, 8, 5);
        scene.add(light);

        const landscape = new THREE.Group();
        scene.add(landscape);

        const terrain = new THREE.PlaneGeometry(10, 8, 48, 40);
        terrain.rotateX(-Math.PI / 2);
        const positions = terrain.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          positions.setY(i, heightAt(positions.getX(i), positions.getZ(i)));
        }
        terrain.computeVertexNormals();
        landscape.add(new THREE.Mesh(terrain, new THREE.MeshStandardMaterial({
          color: 0x103c48,
          roughness: 0.9,
          metalness: 0.15,
          side: THREE.DoubleSide,
        })));

        const gridMaterial = new THREE.LineBasicMaterial({
          color: 0x3da2a9, transparent: true, opacity: 0.2,
        });
        const gridPoints: import('three').Vector3[] = [];
        for (let line = -5; line <= 5; line += 0.5) {
          for (let step = -4; step < 4; step += 0.2) {
            gridPoints.push(
              new THREE.Vector3(line, heightAt(line, step) + 0.02, step),
              new THREE.Vector3(line, heightAt(line, step + 0.2) + 0.02, step + 0.2),
            );
          }
        }
        for (let line = -4; line <= 4; line += 0.5) {
          for (let step = -5; step < 5; step += 0.2) {
            gridPoints.push(
              new THREE.Vector3(step, heightAt(step, line) + 0.02, line),
              new THREE.Vector3(step + 0.2, heightAt(step + 0.2, line) + 0.02, line),
            );
          }
        }
        landscape.add(new THREE.LineSegments(
          new THREE.BufferGeometry().setFromPoints(gridPoints), gridMaterial,
        ));

        const contourMaterial = new THREE.LineBasicMaterial({
          color: 0x7be6d1, transparent: true, opacity: 0.55,
        });
        for (let radius = 0.55; radius <= 2.2; radius += 0.33) {
          const points = [];
          for (let i = 0; i <= 96; i++) {
            const angle = (i / 96) * Math.PI * 2;
            const x = -2.7 + Math.cos(angle) * radius;
            const z = -1.8 + Math.sin(angle) * radius * 0.8;
            points.push(new THREE.Vector3(x, heightAt(x, z) + 0.04, z));
          }
          landscape.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(points), contourMaterial,
          ));
        }

        const riverPoints = [
          [-4.7, 2.8], [-3.6, 2.2], [-2.7, 1.8], [-1.6, 2.1],
          [-0.5, 1.2], [0.6, 0.8], [1.5, 0.1], [2.4, -0.5],
          [3.2, -1.4], [4.6, -2.2],
        ].map(([x, z]) => new THREE.Vector3(x, heightAt(x, z) + 0.1, z));
        const river = new THREE.CatmullRomCurve3(riverPoints);
        landscape.add(new THREE.Mesh(
          new THREE.TubeGeometry(river, 100, 0.075, 8, false),
          new THREE.MeshBasicMaterial({ color: 0x64edff }),
        ));
        landscape.add(new THREE.Mesh(
          new THREE.TubeGeometry(river, 100, 0.16, 8, false),
          new THREE.MeshBasicMaterial({ color: 0x1ac8ed, transparent: true, opacity: 0.2 }),
        ));

        const pinMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
        const pins = [[-3.5, 2.2], [-0.6, 1.2], [2.5, -0.6]];
        pins.forEach(([x, z]) => {
          const group = new THREE.Group();
          group.position.set(x, heightAt(x, z) + 0.08, z);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.025, 8, 32), pinMaterial);
          ring.rotation.x = Math.PI / 2;
          group.add(ring);
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 8), pinMaterial);
          stem.position.y = 0.35;
          group.add(stem);
          const dot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), pinMaterial);
          dot.position.y = 0.72;
          group.add(dot);
          landscape.add(group);
        });

        const scan = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 12, 8),
          new THREE.MeshBasicMaterial({ color: 0xffffff }),
        );
        landscape.add(scan);

        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
        let frame = 0;
        let elapsed = 0;
        let lastTime = 0;
        let contextIsLost = false;
        const render = (time = 0) => {
          if (lastTime) elapsed += Math.min((time - lastTime) / 1000, 0.05);
          lastTime = time;
          landscape.rotation.y = Math.sin(elapsed * 0.16) * 0.12;
          scan.position.copy(river.getPoint((elapsed * 0.07) % 1));
          scan.position.y += 0.08;
          renderer.render(scene, camera);
          if (!motionPreference.matches && !document.hidden) {
            frame = window.requestAnimationFrame(render);
          }
        };
        const updateAnimation = () => {
          window.cancelAnimationFrame(frame);
          lastTime = 0;
          if (!document.hidden && !contextIsLost) render();
        };
        const resize = () => {
          const width = container.clientWidth;
          const height = container.clientHeight;
          if (!width || !height) return;
          const aspect = width / height;
          const viewHeight = aspect < 1 ? 14 : 11;
          camera.left = -viewHeight * aspect / 2;
          camera.right = viewHeight * aspect / 2;
          camera.top = viewHeight / 2;
          camera.bottom = -viewHeight / 2;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          updateAnimation();
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);
        motionPreference.addEventListener('change', updateAnimation);
        document.addEventListener('visibilitychange', updateAnimation);
        const contextLost = (event: Event) => {
          event.preventDefault();
          console.error('The watershed visualization lost its WebGL context.');
          contextIsLost = true;
          renderer.domElement.style.display = 'none';
          window.cancelAnimationFrame(frame);
        };
        renderer.domElement.addEventListener('webglcontextlost', contextLost);
        resize();

        cleanup = () => {
          window.cancelAnimationFrame(frame);
          resizeObserver.disconnect();
          motionPreference.removeEventListener('change', updateAnimation);
          document.removeEventListener('visibilitychange', updateAnimation);
          renderer.domElement.removeEventListener('webglcontextlost', contextLost);
          const geometries = new Set<import('three').BufferGeometry>();
          const materials = new Set<Material>();
          scene.traverse((object: Object3D) => {
            if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
              geometries.add(object.geometry);
              const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
              objectMaterials.forEach((material) => materials.add(material));
            }
          });
          geometries.forEach((geometry) => geometry.dispose());
          materials.forEach((material) => material.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch (error) {
        cleanup();
        console.error('Unable to load the watershed visualization:', error);
      }
    };

    void setup();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />;
};

export default WatershedScene;
