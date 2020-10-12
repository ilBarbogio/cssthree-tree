import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
export declare class Tree {
    container: HTMLElement;
    camera: THREE.Camera;
    scene: THREE.Scene;
    renderer: CSS3DRenderer;
    dimRender: number[];
    controls: TrackballControls;
    tree: any;
    nodes: Node[];
    edges: Edge[];
    options: {
        tagName: string;
        camera: {
            height: number;
            position: THREE.Vector3;
            target: number;
        };
        min: {
            h: number;
            w: number;
        };
    };
    /**
     * The tree object
     * @param width width of display, in px. Ignored if resizing is enabled
     * @param height height of display, in px
     * @param wrapper div element to wrap tree with
     */
    constructor(width: number, height: number, wrapper: HTMLElement | string);
    /**
     * Automatic resizing
    */
    onResize(): void;
    /**
     * Render loop
     */
    animate(): void;
    /**
     * Function to search the document for custom tag elements and convert into Nodes
     */
    readPage: () => void;
    /**
     * Compute spacing for nodes
     */
    computeSpacing(): void;
    draw(): void;
    /**
     * Set camera position
     * @param v position ad a THREE.Vector3
     */
    setCamera(v: THREE.Vector3): void;
    /**
     * Scene getter
     */
    getScene(): THREE.Scene;
    /**
     * Get node by id
     * @param id id of desired Node
     */
    getNodeById(id: any): any;
    /**
     * Get a tree's Node with given level and position
     * @param lvl level of desired Node
     * @param pos position of desired Node
     */
    getNodeByLP(lvl: any, pos: any): any;
    /**
     * Get Nodes by level
     * @param lvl level of desired Nodes
     */
    getNodesByLvl(lvl: any): any[];
    /**
     * Get Nodes by position
     * @param pos position of desired Nodes
     */
    getNodesByPos(pos: any): any[];
    /**
     * Draw a point, primarly for debugging
     * @param x point x coord (position)
     * @param y point y coord (level)
     * @param z point z coord (depth)
     */
    point(x: any, y: any, z: any): void;
}
declare class Node {
    id: number;
    lvl: number;
    pos: number;
    children: number[];
    parents: number[];
    color: string;
    type: string;
    dim: {
        x: number;
        y: number;
    };
    coords: {
        x: number;
        y: number;
        z: number;
    };
    content: string;
    object3D: CSS3DObject;
    /**
     * Node object
     * @param id Node's id
     */
    constructor(id: any);
    /**
     * Create the CSS3D Object
     */
    createCSS3DObject(): void;
    /**
     * Set node position
     * @param x point x coord (position)
     * @param y point y coord (level)
     * @param z point z coord (depth)
     */
    setPosition(x: any, y: any, z: any): void;
    /**
     * Filter HTML custom tag content
     * @param text text to filter
     */
    filterText(text: any): any;
}
declare class Edge {
    parent: Node;
    child: Node;
    color: string;
    tree: Tree;
    length: number;
    width: number;
    angle: number;
    object3D: CSS3DObject;
    /**
     * The Edge object
     * @param parent Edge's starting Node
     * @param child Edge's ending Node
     */
    constructor(parent: any, child: any);
}
export {};
