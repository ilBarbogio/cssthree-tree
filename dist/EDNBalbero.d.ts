import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
export declare class Albero {
    contenitore: HTMLElement;
    camera: THREE.Camera;
    scene: THREE.Scene;
    renderer: CSS3DRenderer;
    dimRender: number[];
    controls: TrackballControls;
    albero: any;
    nodi: Nodo[];
    archi: Arco[];
    opzioni: {
        hCamera: number;
        posCamera: THREE.Vector3;
        target: number;
        min: {
            h: number;
            l: number;
        };
    };
    constructor(larghezza: number, altezza: number, dove: HTMLElement | string);
    onResize(): void;
    anima(): void;
    leggiPagina: () => void;
    calcolaSpaziature(): void;
    disegna(): void;
    setCamera(v: THREE.Vector3): void;
    getScene(): THREE.Scene;
    getNodoById(id: any): any;
    getNodo(lvl: any, pos: any): any;
    getNodiByLvl(lvl: any): any[];
    getNodiByPos(pos: any): any[];
    punto(x: any, y: any, z: any): void;
}
declare class Nodo {
    id: number;
    lvl: number;
    pos: number;
    figli: number[];
    padri: number[];
    colore: string;
    tipo: string;
    dim: {
        x: number;
        y: number;
    };
    coord: {
        x: number;
        y: number;
        z: number;
    };
    contenuto: string;
    oggetto3D: CSS3DObject;
    constructor(id: any);
    creaCSS3DObject(): void;
    posiziona(x: any, y: any, z: any): void;
    filtraTesto(testo: any): any;
}
declare class Arco {
    padre: Nodo;
    figlio: Nodo;
    colore: string;
    albero: Albero;
    lunghezza: number;
    larghezza: number;
    angolo: number;
    oggetto3D: CSS3DObject;
    constructor(padre: any, figlio: any);
}
export {};
