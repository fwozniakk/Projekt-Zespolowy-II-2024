import { Component, ElementRef, AfterViewInit, OnDestroy  } from '@angular/core';
import { Board } from '../../logic/board';
import { AvailablePositions, CheckState, FENChar, imagePaths, LastMove, Move, Side } from '../../logic/models';
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
  private lastMove: LastMove | undefined = this.board.lastMove;
  private checkState: CheckState = this.board.checkState;
  public isPromotion: boolean = false;
  private promotionPosition: Move | null = null;
  private promotedUnit: FENChar | null = null;
  public imagePaths = imagePaths;
  public get message(): string | undefined { return this.board.endMessage } 


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

  public isPositionLastMove(x: number, y: number): boolean {
    if (!this.lastMove) return false;
    const { prevX, prevY, currX, currY } = this.lastMove;
    return x === prevX && y === prevY || x === currX && y === currY;
  }

  public promotionUnits(): FENChar[] {
    return this.playerSide === Side.White ?
      [FENChar.WhiteKnight, FENChar.WhiteBishop, FENChar.WhiteRook, FENChar.WhiteQueen] :
      [FENChar.BlackKnight, FENChar.BlackBishop, FENChar.BlackRook, FENChar.BlackQueen];
  }

  public isPositionInCheck(x: number, y: number): boolean {
    return this.checkState.isInCheck && this.checkState.x === x && this.checkState.y === y;
  }

  public isPositionAvailableForSelectedUnit(x: number, y: number): boolean {
    return this.unitAvailablePositions.some(position => position.x === x && position.y === y)
  }

  private isWrongFieldSelected(field: FENChar): boolean {
    const isWhiteFieldSelected: boolean = field === field.toUpperCase();
    return isWhiteFieldSelected && this.playerSide === Side.Black ||
    !isWhiteFieldSelected && this.playerSide === Side.White;
  }

  public promoteUnit(unit: FENChar): void {
    console.log('promocja 1')
    if (!this.promotionPosition || !this.selectedPosition.unit) {
      console.log(this.promotionPosition)
      console.log(this.selectedPosition.unit)
      return;}
    this.promotedUnit = unit;
    console.log("promocja 2")
    const { x: newX, y: newY } = this.promotionPosition;
    const { x: prevX, y: prevY } = this.selectedPosition;
    this.updateBoard(prevX, prevY, newX, newY, this.promotedUnit);
  }

  private updateBoard(x: number, y: number, newX: number, newY: number, promotedUnit: FENChar | null): void {
    this.board.move(x, y, newX, newY, promotedUnit);
    this.boardView = this.board.playerBoard;
    this.checkState = this.board.checkState;
    this.lastMove = this.board.lastMove;
    this.removeSelection();
  }

  public closePromotionDialog(): void {
    this.removeSelection();
  }

  public isPromotionPosition(x: number, y: number): boolean {
    if (!this.promotionPosition) return false;
    return this.promotionPosition.x === x && this.promotionPosition.y === y;
  }

  private removeSelection(): void {
    this.selectedPosition = { unit: null };
    this.unitAvailablePositions = [];

    if (this.isPromotion) {
      this.isPromotion = false;
      this.promotedUnit = null;
      this.promotionPosition = null;
    }
  }

  private moveUnit(newX: number, newY: number): void {
    this.selectingUnit(newX, newY);
    if (!this.selectedPosition.unit) return;
    if (!this.isPositionAvailableForSelectedUnit(newX, newY)) return;

    const isPawn: boolean = this.selectedPosition.unit === FENChar.WhitePawn || this.selectedPosition.unit === FENChar.BlackPawn;
    const isPawnOnFinishLine: boolean = isPawn && (newX === 7 || newX === 0);
    const openDialog: boolean = !this.isPromotion && isPawnOnFinishLine;

    if (openDialog) {
      this.unitAvailablePositions = [];
      this.isPromotion = true;
      this.promotionPosition = { x: newX, y: newY };

      this.highlightPromotionPosition();
      return;
    }

    const { x: prevX, y: prevY } = this.selectedPosition;
    this.updateBoard(prevX, prevY, newX, newY, this.promotedUnit);
    this.syncUnitsWithBoardViewAfterMove(newX, newY);
    
    console.log(this.boardView) 
    console.log(this.pieceMeshes)
  }

  private selectingUnit(x: number, y: number): void {
    if (this.message !== undefined) return;
    const unit: FENChar | null = this.boardView[x][y];
    if (!unit) return;
    if (this.isWrongFieldSelected(unit)) return;

    const isSamePosition: boolean = !!this.selectedPosition.unit && this.selectedPosition.x === x && this.selectedPosition.y === y;
    this.removeSelection();
    if (isSamePosition) return;

    this.selectedPosition = { unit, x, y };
    this.unitAvailablePositions = this.availablePositions.get(x + "," + y) || [];
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
          this.highlightLastMove();
          this.highlightCheck();
        
          this.selectedPosition = { unit: null }; 
          return;
        }
      }

      this.removeSelection();
  
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
      }
    } else {
      this.clearHighlight();
    }
  }

  public getPieceFile(piece: string): string | null {
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

    return pieceFiles[piece] || null;
  }

  private syncUnitsWithBoardViewAfterMove(newX: number, newY: number): void {
    const newPieceMeshes = new Map<string, THREE.Mesh>();

    for (let x = 0; x < this.boardView.length; x++) {
      for (let z = 0; z < this.boardView[x].length; z++) {
        const piece = this.boardView[x][z];
        const key = `${x},${z}`;
        const destinationKey = `${newX},${newY}`

        if (this.pieceMeshes.has(destinationKey)) {
          const meshToRemove = this.pieceMeshes.get(destinationKey)!;
          this.scene.remove(meshToRemove);
  
          if (meshToRemove.geometry) {
            meshToRemove.geometry.dispose();
          }
          if (Array.isArray(meshToRemove.material)) {
            meshToRemove.material.forEach((mat) => mat.dispose());
          } else if (meshToRemove.material) {
            meshToRemove.material.dispose();
          }
  
          this.pieceMeshes.delete(destinationKey);
        }

        if (piece) {
          // Jeśli figura już istnieje w 3D
          if (this.pieceMeshes.has(key)) {
            const mesh = this.pieceMeshes.get(key)!;
            mesh.position.set(x, 0, z);  // Ustaw nową pozycję
            newPieceMeshes.set(key, mesh);
          } else {
            // Jeśli figury nie ma w 3D, załaduj ją
            const fileName = this.getPieceFile(piece);
            if (fileName) {
              this.loader.load(`/${fileName}`, (gltf: any) => {
                const model = gltf.scene.clone();
                model.position.set(x, 0, z);  // Ustaw pozycję figury
                model.scale.set(0.8, 0.8, 0.8);
                this.scene.add(model);
                newPieceMeshes.set(key, model);
              });
            }
          }
        }
      }
    }

    // Usuwanie zbitych figur - sprawdzamy, czy figura powinna zostać usunięta
    this.pieceMeshes.forEach((mesh, key) => {
      if (!newPieceMeshes.has(key)) {
        // Jeśli figura została zbita, usuń ją z 3D
        this.scene.remove(mesh);

        // Zabezpiecz się przed usunięciem używanych zasobów
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

  private highlightCheck(): void {
    if (this.checkState.isInCheck) {
      const { x, y } = this.checkState;
      const square = this.chessBoard.children.find(
        (child: any) => Math.round(child.position.x) === x && Math.round(child.position.z) === y
      );
      if (square && square instanceof THREE.Mesh) {
        const checkMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000, transparent: true, opacity: 0.8 }); // red for check
        square.userData['originalMaterial'] = square.material;
        square.material = checkMaterial;
      }
    }
  }

  private highlightPromotionPosition(): void {
    if (!this.promotionPosition) return;
  
    const { x, y } = this.promotionPosition;
  
    const promotionSquare = this.chessBoard.children.find(
      (child: any) => Math.round(child.position.x) === x && Math.round(child.position.z) === y
    );
  
    if (promotionSquare && promotionSquare instanceof THREE.Mesh) {
      const promotionMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xF79824, 
        transparent: true, 
        opacity: 0.8 
      });
  
      promotionSquare.userData['originalMaterial'] = promotionSquare.material; // Zapisz oryginalny materiał
      promotionSquare.material = promotionMaterial; // Ustaw materiał promocyjny
    }
  }
  

  private highlightLastMove(): void {
    if (!this.lastMove) return;

    const { prevX, prevY, currX, currY } = this.lastMove;

    const startSquare = this.chessBoard.children.find(
        (child: any) => Math.round(child.position.x) === prevX && Math.round(child.position.z) === prevY
    );
    const endSquare = this.chessBoard.children.find(
        (child: any) => Math.round(child.position.x) === currX && Math.round(child.position.z) === currY
    );

    [startSquare, endSquare].forEach((square) => {
        if (square && square instanceof THREE.Mesh) {
            const lastMoveMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00, transparent: true, opacity: 0.6 });
            square.userData['originalMaterial'] = square.material;
            square.material = lastMoveMaterial;
        }
    });
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

    if (this.promotionPosition) {
      const { x, y } = this.promotionPosition;
    
      const promotionSquare = this.chessBoard.children.find(
        (child: any) => Math.round(child.position.x) === x && Math.round(child.position.z) === y
      );
    
      if (promotionSquare && promotionSquare instanceof THREE.Mesh) {
        const originalMaterial = promotionSquare.userData['originalMaterial'];
        if (originalMaterial) {
          promotionSquare.material = originalMaterial; // Przywróć oryginalny materiał
        }
      }
    }
  

    this.clearLastMoveHighlight();
    // Preserve the check highlight
    this.highlightCheck();
  }  
  

  private clearLastMoveHighlight(): void {
    if (!this.lastMove) return;
  
    const { prevX, prevY, currX, currY } = this.lastMove;
  
    const squares = this.chessBoard.children.filter((child: any) => {
      const x = Math.round(child.position.x);
      const z = Math.round(child.position.z);
      return (x === prevX && z === prevY) || (x === currX && z === currY);
    });
  
    squares.forEach((square) => {
      if (square instanceof THREE.Mesh) {
        const originalMaterial = square.userData['originalMaterial'];
        if (originalMaterial) {
          square.material = originalMaterial; // Przywróć oryginalny materiał
        }
      }
    });
  }
  

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}
