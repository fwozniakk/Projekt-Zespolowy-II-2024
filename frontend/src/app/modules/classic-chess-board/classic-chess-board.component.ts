import { Component, ElementRef, AfterViewInit, OnDestroy  } from '@angular/core';
import { Board } from '../../logic/board';
import { AvailablePositions, FENChar, Move, Side } from '../../logic/models';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SelectedPosition } from './models';


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
  private selectedPosition: SelectedPosition = { unit: null };
  private unitAvailablePositions: Move[] = [];
  public get availablePositions(): AvailablePositions { return this.board.availablePositions}


  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private chessBoard: THREE.Group = new THREE.Group();
  private pieceMeshes: Map<string, THREE.Mesh> = new Map();
  private controls!: OrbitControls;
  private loader = new GLTFLoader();
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  constructor(private elRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.initScene();
    this.addChessBoard();
    this.addPieces();
    this.animate();
    window.addEventListener('click', this.onMouseClick.bind(this));
  }

  ngOnDestroy(): void {
    this.renderer.dispose();
    window.removeEventListener('click', this.onMouseClick.bind(this));
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

              if (piece === 'N') {
                model.rotation.y = Math.PI / 2; // rotate horse
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


  public isPositionAvailableForSelectedUnit(x: number, y: number): boolean {
    return this.unitAvailablePositions.some(position => position.x === x && position.y === y)
  }

  private isWrongFieldSelected(field: FENChar): boolean {
    const isWhiteFieldSelected: boolean = field === field.toUpperCase();
    return isWhiteFieldSelected && this.playerSide === Side.Black ||
    !isWhiteFieldSelected && this.playerSide === Side.White;
  }

  private moveUnit(newX: number, newY: number): void {
    if (!this.selectedPosition.unit) return;
    if (!this.isPositionAvailableForSelectedUnit(newX, newY)) return;

    const { x: prevX, y: prevY } = this.selectedPosition;
    this.board.move(prevX, prevY, newX, newY);
    this.boardView = this.board.playerBoard;

    this.syncPiecesWithBoardView(); 
    console.log(this.boardView)
  }


  private onMouseClick(event: MouseEvent): void {
    const container = this.elRef.nativeElement.querySelector('#chess-board-container');
    const rect = container.getBoundingClientRect();
  
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
    // Update the raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);
  
    // Check intersections with the chessboard squares
    const intersects = this.raycaster.intersectObjects(this.chessBoard.children);
  
    if (intersects.length > 0) {
      const intersectedSquare = intersects[0].object;
  
      // Convert to board coordinates
      const { x, z } = intersectedSquare.position;
      const boardX = Math.round(x);
      const boardY = Math.round(z);
  
      if (this.selectedPosition.unit) {
        if (this.isPositionAvailableForSelectedUnit(boardX, boardY)) {
          this.moveUnit(boardX, boardY); // Move the selected piece
          this.clearHighlight();
          this.selectedPosition = { unit: null }; 
          return;
        }
      }
  
      // Optionally handle unit selection
      const unit = this.boardView[boardX][boardY];
      
      if (unit && !this.isWrongFieldSelected(unit)) {
        this.highlightSquare(intersectedSquare);
        this.selectedPosition = { unit, x: boardX, y: boardY };
        this.unitAvailablePositions = this.availablePositions.get(boardX + "," + boardY) || [];
        
        this.unitAvailablePositions.forEach((move) => {
          const targetSquare = this.chessBoard.children.find(
            (child: any) =>
              Math.round(child.position.x) === move.x && Math.round(child.position.z) === move.y
          );
          if (targetSquare) {
            this.highlightAvailablePositions(targetSquare);
          }
        });
        
        console.log(`Selected unit at position (${boardX}, ${boardY}):`, unit);
      } else {
        console.log(`No unit at position (${boardX}, ${boardY})`);
        //this.clearHighlight();
      }
    } else {
      this.clearHighlight();
    }
  }

  private getPieceFile(piece: string): string | null {
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
      k: 'bking.glb',
    };
  
    return pieceFiles[piece] || null;
  }

private syncPiecesWithBoardView(): void {
  const newPieceMeshes = new Map<string, THREE.Mesh>();

  for (let x = 0; x < this.boardView.length; x++) {
    for (let z = 0; z < this.boardView[x].length; z++) {
      const piece = this.boardView[x][z];
      const key = `${x},${z}`;

      if (piece) {
        if (this.pieceMeshes.has(key)) {
          // Jeśli model już istnieje, zachowaj go
          const mesh = this.pieceMeshes.get(key)!;
          mesh.position.set(x, 0, z); // Ustaw poprawną pozycję
          newPieceMeshes.set(key, mesh);
        } else {
          // Jeśli figura jest nowa, załaduj i dodaj ją
          const fileName = this.getPieceFile(piece);
          if (fileName) {
            this.loader.load(`/${fileName}`, (gltf: any) => {
              const model = gltf.scene.clone();
              model.position.set(x, 0, z);
              model.scale.set(0.8, 0.8, 0.8);

              this.scene.add(model);
              newPieceMeshes.set(key, model);
            });
          }
        }
      }
    }
  }

  // Usuń zbite lub przesunięte figury
  this.pieceMeshes.forEach((mesh, key) => {
    if (!newPieceMeshes.has(key)) {
      this.scene.remove(mesh);

      // Bezpieczne usuwanie geometrii i materiałów
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => mat.dispose());
      } else if (mesh.material) {
        mesh.material.dispose();
      }
    }
  });

  // Zaktualizuj mapę figur
  this.pieceMeshes = newPieceMeshes;
}

  
  
  private highlightedSquare: THREE.Object3D | null = null;
  private highlightedSquares: THREE.Object3D[] = [];
  
  private highlightSquare(square: THREE.Object3D): void {
    this.clearHighlight();
  
    // Apply highlight to the square
    if (square instanceof THREE.Mesh) {
      const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xF79824, transparent: true, opacity: 0.95 }); // selection color
      square.userData['originalMaterial'] = square.material; // Save original material
      square.material = highlightMaterial;
    }
  
    this.highlightedSquare = square;
  }

  private highlightAvailablePositions(square: THREE.Object3D): void {
    if (square instanceof THREE.Mesh) {
      square.userData['originalMaterial'] = square.material;
      // add a circle to the center of the square
      const circleGeometry = new THREE.CircleGeometry(0.3, 32); 
      const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xF79824, transparent: true, opacity: 0.7 });
      const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);

      circleMesh.position.set(square.position.x, square.position.y + 0.06, square.position.z);
      circleMesh.rotation.x = -Math.PI / 2; 

      this.scene.add(circleMesh);

      square.userData['highlightCircle'] = circleMesh;
      this.highlightedSquares.push(square);
    }
  }
  
  
  private clearHighlight(): void {
    if (this.highlightedSquare && this.highlightedSquare instanceof THREE.Mesh) {
      const originalMaterial = this.highlightedSquare.userData['originalMaterial'];
      if (originalMaterial) {
        this.highlightedSquare.material = originalMaterial;
      }
    }
    this.highlightedSquare = null;

    this.highlightedSquares.forEach((square) => {
      if (square instanceof THREE.Mesh) {
        const originalMaterial = square.userData['originalMaterial'];
        if (originalMaterial) {
          square.material = originalMaterial;
        }
        const circleMesh = square.userData['highlightCircle'];
        if (circleMesh) {
          this.scene.remove(circleMesh);
          delete square.userData['highlightCircle'];
        }
      }
    });
    this.highlightedSquares = [];
  }
  
  

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}
