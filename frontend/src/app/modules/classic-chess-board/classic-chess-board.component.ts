import { Component, ElementRef, AfterViewInit, OnDestroy  } from '@angular/core';
import { Board } from '../../logic/board';
import { FENChar, Side } from '../../logic/models';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


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
  private pieceMeshes: Map<string, THREE.Mesh> = new Map(); // mapowanie figur
  private controls!: OrbitControls;

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
  }

  private addChessBoard(): void {
    const squareSize = 1;
    for (let x = 0; x < this.boardView.length; x++) {
      for (let z = 0; z < this.boardView[x].length; z++) {
        const color = (x + z) % 2 === 0 ? 0xffffff : 0x000000;
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
    const materials = {
      p: new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // Pawn
      r: new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Rook
      n: new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Knight
      b: new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Bishop
      q: new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Queen
      k: new THREE.MeshBasicMaterial({ color: 0xff00ff }), // King
    };

    const geometry = new THREE.CylinderGeometry(0.4, 0.4, 1, 32);

    for (let x = 0; x < this.boardView.length; x++) {
      for (let z = 0; z < this.boardView[x].length; z++) {
        const piece = this.boardView[x][z];
        if (piece) {
          const material = materials[piece.toLowerCase() as keyof typeof materials];
          if (material) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, 0.5, z);
            this.scene.add(mesh);
            this.pieceMeshes.set(`${x},${z}`, mesh);
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
