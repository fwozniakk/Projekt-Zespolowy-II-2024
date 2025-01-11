import { Component, ElementRef, AfterViewInit, OnDestroy  } from '@angular/core';
import { Board } from '../../logic/board';
import { FENChar, Side } from '../../logic/models';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


@Component({
  selector: 'app-classic-chess-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './classic-chess-board.component.html',
  styleUrl: './classic-chess-board.component.scss'
})
export class ClassicChessBoardComponent {
  private board = new Board();
  public boardView: (FENChar | null)[][] = this.board.playerBoard;
  public get playerSide(): Side { return this.board.playerSide }

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private chessBoard: THREE.Group = new THREE.Group();
  private pieceMeshes: Map<string, THREE.Mesh> = new Map();
  private controls!: OrbitControls;
  private loader = new GLTFLoader();

  constructor(private elRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.initScene();
    this.addChessBoard();
    this.addPieces();
    this.animate();
  }

  ngOnDestroy(): void {
    this.renderer.dispose();
  }

  private getBoardCenter(): THREE.Vector3 {
    const centerX = (this.boardView.length / 2) - 0.5; 
    const centerZ = (this.boardView[0].length / 2) - 0.5; 
    return new THREE.Vector3(centerX, 0, centerZ); 
  }  

  private initScene(): void {
    const container = this.elRef.nativeElement.querySelector('#chess-board-container');
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x164D95);
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    this.camera.position.set(10, 10, 10);
    const boardCenter = this.getBoardCenter();
    this.camera.lookAt(boardCenter);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; 
    this.controls.dampingFactor = 0.05; 
    this.controls.maxPolarAngle = Math.PI / 2; 
    this.controls.minDistance = 5; 
    this.controls.maxDistance = 16; 
    this.controls.enablePan = false; // if we want to disable moving the camera 

    this.controls.target.copy(boardCenter);
    this.controls.update(); 

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambientLight);
  
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true; 
    this.scene.add(directionalLight);
  
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 50);
    pointLight.position.set(0, 10, 0);
    this.scene.add(pointLight);
    
  }

  private addChessBoard(): void {
    const squareSize = 1;
    for (let x = 0; x < this.boardView.length; x++) {
      for (let z = 0; z < this.boardView[x].length; z++) {
        const color = (x + z) % 2 === 0 ? 0xffffff : 0x222932;
        const geometry = new THREE.BoxGeometry(squareSize, 0.1, squareSize);
        const material = new THREE.MeshBasicMaterial({ color });
        const square = new THREE.Mesh(geometry, material);
        square.position.set(x, 0, z);
        this.chessBoard.add(square);
      }
    }
    this.scene.add(this.chessBoard);
  }

  private addPieces(): void {
    const pieceFiles: { [key: string]: string } = {
      P: 'wpawn.glb',
      R: 'wrook.glb',
      N: 'whorse.glb',
      B: 'wbishop.glb',
      Q: 'wqueen.glb',
      K: 'wking.glb',
      p: 'bpawn.glb',
      r: 'brook.glb',
      n: 'bhorse.glb',
      b: 'bbishop.glb',
      q: 'bqueen.glb',
      k: 'vking.glb',
    };

    for (let x = 0; x < this.boardView.length; x++) {
      for (let z = 0; z < this.boardView[x].length; z++) {
        const piece = this.boardView[x][z];
        if (piece) {
          const fileName = pieceFiles[piece as keyof typeof pieceFiles];
          if (fileName) {
            this.loader.load(`/${fileName}`, (gltf: any) => {
              const model = gltf.scene.clone();
              model.position.set(x, 0, z);
              model.scale.set(0.8, 0.8, 0.8); 

              /*model.traverse((child: any) => {
                if (child.isMesh) {
                  child.material = new THREE.MeshStandardMaterial({
                    color: piece === piece.toUpperCase() ? 0xffffff : 0x000000,
                    metalness: 0.5,
                    roughness: 0.5,
                  });
                }
              });*/

              if (piece === 'N') {
                model.rotation.y = Math.PI / 2; // Obrót konia
              } else if (piece === 'n') {
                model.rotation.y = -Math.PI / 2;
              }

              this.scene.add(model);
              this.pieceMeshes.set(`${x},${z}`, model);
            },  undefined,
            (error) => {
              console.error(`Error loading ${fileName}:`, error);
            });
          }
        }
      }
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}
