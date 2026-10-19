import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  HostListener,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { InventoryService } from '../../../core/services/inventory.service';

interface SectorHighlight {
  name: string;
  code: string;
  capacity: string;
  itemsCount: number;
  status: 'OPTIMAL' | 'WARNING' | 'ALERT';
}

@Component({
  selector: 'app-warehouse-3d',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="warehouse-3d-container liquid-glass-card">
      <div class="viewport-header">
        <div class="header-left">
          <div class="telemetry-badge">
            <span class="web3-pulse-dot"></span>
            <span>GEMEO DIGITAL 3D REAL-TIME</span>
          </div>
          <h3 class="viewport-title">Gêmeo Digital do Armazém (Three.js)</h3>
        </div>

        <div class="viewport-actions">
          <button 
            class="control-pill" 
            [class.active]="isAutoRotate" 
            (click)="toggleAutoRotate()"
            title="Alternar rotação automática da câmera"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
            <span>{{ isAutoRotate ? 'Pausar Órbita' : 'Orbitar' }}</span>
          </button>

          <button 
            class="control-pill" 
            (click)="resetCameraView()"
            title="Redefinir perspectiva da câmera"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Resetar</span>
          </button>
        </div>
      </div>

      <div class="canvas-wrapper" #canvasContainer>
        <canvas #threeCanvas (mousedown)="onPointerDown($event)" (touchstart)="onTouchStart($event)"></canvas>

        <div class="hud-overlay top-left-hud">
          <div class="hud-item">
            <span class="hud-label">Estantes Ativas</span>
            <span class="hud-val font-mono">12 Racks</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Densidade Média</span>
            <span class="hud-val font-mono text-cyan">78.4%</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">Taxa Telemetria</span>
            <span class="hud-val font-mono text-emerald">60 FPS</span>
          </div>
        </div>

        <div class="hud-overlay bottom-right-hud" *ngIf="selectedSector()">
          <div class="sector-card">
            <div class="sector-header">
              <span class="sector-code font-mono">{{ selectedSector()?.code }}</span>
              <span 
                class="badge" 
                [ngClass]="selectedSector()?.status === 'OPTIMAL' ? 'badge-normal' : (selectedSector()?.status === 'WARNING' ? 'badge-low' : 'badge-out')"
              >
                {{ selectedSector()?.status }}
              </span>
            </div>
            <div class="sector-name">{{ selectedSector()?.name }}</div>
            <div class="sector-stats">
              <div>Capacidade: <strong>{{ selectedSector()?.capacity }}</strong></div>
              <div>Itens Alocados: <strong>{{ selectedSector()?.itemsCount }} un</strong></div>
            </div>
          </div>
        </div>

        <div class="interaction-tip font-mono">
          <span>Arraste para orbitar 360° | Scroll para zoom</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .warehouse-3d-container {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
      position: relative;
    }

    .viewport-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-subtle);
      background: rgba(7, 13, 30, 0.65);
      backdrop-filter: blur(8px);
      z-index: 2;
    }

    .telemetry-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--cream-400);
      margin-bottom: 2px;
    }

    .viewport-title {
      font-size: 1.12rem;
      color: var(--cream-50);
      margin: 0;
    }

    .viewport-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .control-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      color: var(--cream-300);
      font-size: 0.78rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: var(--radius-pill);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .control-pill:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border-color: var(--border-medium);
    }
    .control-pill.active {
      background: rgba(37, 99, 235, 0.3);
      color: #93c5fd;
      border-color: var(--royal-400);
    }

    .canvas-wrapper {
      position: relative;
      width: 100%;
      height: 380px;
      background: radial-gradient(circle at 50% 50%, #0d1a3a 0%, #060c1d 85%);
      cursor: grab;
      user-select: none;
    }
    .canvas-wrapper:active {
      cursor: grabbing;
    }

    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }

    .hud-overlay {
      position: absolute;
      z-index: 5;
      pointer-events: none;
    }

    .top-left-hud {
      top: 14px;
      left: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: rgba(5, 10, 24, 0.65);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 8px 12px;
    }

    .hud-item {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: space-between;
      font-size: 0.76rem;
    }
    .hud-label {
      color: var(--cream-400);
    }
    .hud-val {
      font-weight: 700;
      color: var(--cream-100);
    }

    .bottom-right-hud {
      bottom: 14px;
      right: 16px;
      pointer-events: auto;
    }

    .sector-card {
      background: rgba(7, 14, 32, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-royal);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      box-shadow: var(--shadow-glow);
      min-width: 200px;
    }

    .sector-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 4px;
    }

    .sector-code {
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--royal-300);
    }

    .sector-name {
      font-weight: 700;
      font-size: 0.88rem;
      color: var(--cream-50);
      margin-bottom: 6px;
    }

    .sector-stats {
      font-size: 0.76rem;
      color: var(--cream-300);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .interaction-tip {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.7rem;
      color: rgba(238, 232, 218, 0.45);
      background: rgba(0, 0, 0, 0.35);
      padding: 3px 10px;
      border-radius: var(--radius-pill);
      pointer-events: none;
      letter-spacing: 0.04em;
    }
  `]
})
export class Warehouse3dComponent implements OnInit, OnDestroy {
  @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  inventoryService = inject(InventoryService);

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationFrameId: number = 0;
  private resizeObserver!: ResizeObserver;

  private warehouseGroup: THREE.Group = new THREE.Group();
  private particlesGroup: THREE.Group = new THREE.Group();

  isAutoRotate: boolean = true;
  selectedSector = signal<SectorHighlight | null>({
    name: 'Estante A1 - Racks de Servidores',
    code: 'SECTOR-ALPHA-01',
    capacity: '88% Ocupado',
    itemsCount: 42,
    status: 'OPTIMAL'
  });

  private isDragging: boolean = false;
  private previousMousePosition = { x: 0, y: 0 };
  private targetRotationX: number = 0.32;
  private targetRotationY: number = 0.65;
  private currentRotationX: number = 0.32;
  private currentRotationY: number = 0.65;
  private targetCameraZ: number = 24;

  ngOnInit(): void {
    this.initThree();
    this.buildWarehouseRacks();
    this.buildParticles();
    this.animate();
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.disposeHierarchy(this.scene);
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 380;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060c1d, 0.024);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 10, this.targetCameraZ);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x3b82f6, 2.5);
    dirLight1.position.set(15, 25, 20);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xeee8da, 1.2);
    dirLight2.position.set(-20, 15, -15);
    this.scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x60a5fa, 3, 40);
    pointLight.position.set(0, 12, 0);
    this.scene.add(pointLight);

    const gridHelper = new THREE.GridHelper(40, 24, 0x2563eb, 0x142866);
    gridHelper.position.y = -0.05;
    this.scene.add(gridHelper);

    this.scene.add(this.warehouseGroup);
    this.scene.add(this.particlesGroup);
  }

  private buildWarehouseRacks(): void {
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      metalness: 0.85,
      roughness: 0.25
    });

    const palletMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9bca3,
      metalness: 0.1,
      roughness: 0.8
    });

    const boxColors = [0x2563eb, 0x3b82f6, 0xeee8da, 0x10b981, 0xf59e0b];

    const rackRows = [-8, 0, 8];
    const rackBays = [-9, -4.5, 0, 4.5, 9];
    const shelfLevels = [1.2, 3.4, 5.6];

    rackRows.forEach((rowZ, rowIndex) => {
      rackBays.forEach((bayX, bayIndex) => {
        const postGeom = new THREE.BoxGeometry(0.2, 7, 0.2);
        const offsets = [-1.5, 1.5];
        offsets.forEach(ox => {
          offsets.forEach(oz => {
            const post = new THREE.Mesh(postGeom, steelMaterial);
            post.position.set(bayX + ox, 3.5, rowZ + oz);
            this.warehouseGroup.add(post);
          });
        });

        shelfLevels.forEach((levelY, levelIndex) => {
          const beamGeom = new THREE.BoxGeometry(3.1, 0.12, 3.1);
          const beam = new THREE.Mesh(beamGeom, steelMaterial);
          beam.position.set(bayX, levelY, rowZ);
          this.warehouseGroup.add(beam);

          if ((rowIndex + bayIndex + levelIndex) % 7 !== 0) {
            const palletGeom = new THREE.BoxGeometry(2.6, 0.18, 2.6);
            const pallet = new THREE.Mesh(palletGeom, palletMaterial);
            pallet.position.set(bayX, levelY + 0.12, rowZ);
            this.warehouseGroup.add(pallet);

            const randomColor = boxColors[(rowIndex * 3 + bayIndex * 2 + levelIndex) % boxColors.length];
            const boxMat = new THREE.MeshStandardMaterial({
              color: randomColor,
              metalness: 0.2,
              roughness: 0.5
            });

            const boxH = 0.8 + ((bayIndex + levelIndex) % 3) * 0.3;
            const boxGeom = new THREE.BoxGeometry(2.0, boxH, 2.0);
            const box = new THREE.Mesh(boxGeom, boxMat);
            box.position.set(bayX, levelY + 0.2 + boxH / 2, rowZ);
            this.warehouseGroup.add(box);
          }
        });
      });
    });
  }

  private buildParticles(): void {
    const particleCount = 70;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 36;
      positions[i + 1] = Math.random() * 12;
      positions[i + 2] = (Math.random() - 0.5) * 36;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.18,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    this.particlesGroup.add(particles);
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.isAutoRotate && !this.isDragging) {
      this.targetRotationY += 0.0035;
    }

    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.08;
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.08;

    this.warehouseGroup.rotation.x = this.currentRotationX;
    this.warehouseGroup.rotation.y = this.currentRotationY;

    this.particlesGroup.rotation.y += 0.001;

    this.camera.position.z += (this.targetCameraZ - this.camera.position.z) * 0.1;

    this.renderer.render(this.scene, this.camera);
  };

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        if (width > 0 && height > 0) {
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(width, height);
        }
      }
    });
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }

  toggleAutoRotate(): void {
    this.isAutoRotate = !this.isAutoRotate;
  }

  resetCameraView(): void {
    this.targetRotationX = 0.32;
    this.targetRotationY = 0.65;
    this.targetCameraZ = 24;
    this.isAutoRotate = true;
  }

  onPointerDown(event: MouseEvent): void {
    this.isDragging = true;
    this.previousMousePosition = { x: event.clientX, y: event.clientY };
  }

  @HostListener('window:mousemove', ['$event'])
  onPointerMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    const deltaX = event.clientX - this.previousMousePosition.x;
    const deltaY = event.clientY - this.previousMousePosition.y;

    this.targetRotationY += deltaX * 0.008;
    this.targetRotationX = Math.max(0.05, Math.min(1.2, this.targetRotationX + deltaY * 0.008));

    this.previousMousePosition = { x: event.clientX, y: event.clientY };
  }

  @HostListener('window:mouseup')
  onPointerUp(): void {
    this.isDragging = false;
  }

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.isDragging = true;
      this.previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging || event.touches.length !== 1) return;
    const deltaX = event.touches[0].clientX - this.previousMousePosition.x;
    const deltaY = event.touches[0].clientY - this.previousMousePosition.y;

    this.targetRotationY += deltaX * 0.01;
    this.targetRotationX = Math.max(0.05, Math.min(1.2, this.targetRotationX + deltaY * 0.01));

    this.previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }

  @HostListener('window:touchend')
  onTouchEnd(): void {
    this.isDragging = false;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.targetCameraZ = Math.max(14, Math.min(42, this.targetCameraZ + event.deltaY * 0.03));
  }

  private disposeHierarchy(obj: any): void {
    if (!obj) return;
    for (let i = obj.children?.length - 1; i >= 0; i--) {
      this.disposeHierarchy(obj.children[i]);
      obj.remove(obj.children[i]);
    }
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m: any) => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  }
}
