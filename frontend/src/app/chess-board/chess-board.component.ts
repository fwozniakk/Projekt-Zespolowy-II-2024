import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [],
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'], 
})
export class ChessBoardComponent implements OnInit {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls; 

  ngOnInit(): void {
    this.initThree();
    this.createRaumschachBoard();
    this.loadChessPieces();
    this.animate();
  }

  private initThree(): void {
    const width = this.canvasContainer.nativeElement.offsetWidth;
    const height = this.canvasContainer.nativeElement.offsetHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(10, 10, 20);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.canvasContainer.nativeElement.appendChild(this.renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(10, 10, 10).normalize();
    this.scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 2); 
    this.scene.add(ambientLight);    

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; 
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 7; 
    this.controls.maxDistance = 50; 
  }

  private createRaumschachBoard(): void {
    const boardSize = 5;
    const cubeSize = 1;
    const gap = 0.1;
    const totalSize = boardSize * (cubeSize + gap);

    for (let x = 0; x < boardSize; x++) {
      for (let y = 0; y < boardSize; y++) {
        for (let z = 0; z < boardSize; z++) {
          const isDark = (x + y + z) % 2 === 0;
          const color = isDark ? 0x000000 : 0xffffff;
          const material = new THREE.MeshBasicMaterial({ color });
          const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
          const cell = new THREE.Mesh(geometry, material);
          cell.position.set(
            x * (cubeSize + gap) - totalSize / 2 + cubeSize / 2,
            y * (cubeSize + gap) - totalSize / 2 + cubeSize / 2,
            z * (cubeSize + gap) - totalSize / 2 + cubeSize / 2
          );
          this.scene.add(cell);
        }
      }
    }
  }

  private loadChessPieces(): void {
    const loader = new GLTFLoader();
    loader.load(
      'whorse.glb',
      (gltf) => {
        console.log('Model załadowany:', gltf);
        const piece = gltf.scene;
        piece.position.set(0, 0, 5);
        piece.scale.set(0.5, 0.5, 0.5);
        this.scene.add(piece);
      },
      undefined,
      (error) => {
        console.error('Błąd ładowania modelu:', error);
      }
    );
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update(); 
    this.renderer.render(this.scene, this.camera);
  }
}
