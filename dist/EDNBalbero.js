"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Albero = void 0;
const katex = require("katex");
const THREE = require("three");
const TrackballControls_1 = require("three/examples/jsm/controls/TrackballControls");
const CSS3DRenderer_js_1 = require("three/examples/jsm/renderers/CSS3DRenderer.js");
class Albero {
    constructor(larghezza, altezza, dove) {
        this.opzioni = {
            hCamera: 500,
            posCamera: new THREE.Vector3(0, 0, 500),
            target: 0,
            min: {
                h: 100,
                l: 50
            }
        };
        this.leggiPagina = function () {
            this.nodi = [];
            this.archi = [];
            this.poss = [];
            this.lvls = [];
            //registra nodi, ampiezza e altezza
            let nodiHTML = document.querySelectorAll("nodo-albero-EDNB");
            nodiHTML.forEach((el) => {
                el.style.display = "inline-block";
                let nodo = new Nodo(el.getAttribute("id"));
                this.nodi.push(nodo);
            });
            //dimensionamento
            this.calcolaSpaziature();
            //registra archi
            this.nodi.forEach((padre) => {
                padre.figli.forEach((figlio) => {
                    let arco = new Arco(padre, this.getNodoById(figlio));
                    this.archi.push(arco);
                });
            });
            this.disegna();
        };
        this.dimRender = [larghezza, altezza];
        if (typeof dove == "string")
            this.contenitore = document.getElementById(dove);
        else
            this.contenitore = dove;
        this.camera = new THREE.PerspectiveCamera(50, altezza / altezza, 1, 5000);
        this.scene = new THREE.Scene();
        this.scene.add(this.camera);
        this.renderer = new CSS3DRenderer_js_1.CSS3DRenderer();
        this.renderer.setSize(larghezza, altezza);
        this.contenitore.appendChild(this.renderer.domElement);
        this.controls = new TrackballControls_1.TrackballControls(this.camera, this.renderer.domElement);
        this.setCamera(this.opzioni.posCamera);
        this.controls.noRotate = true;
        this.contenitore.addEventListener("resize", this.onResize);
        this.onResize();
        this.anima();
        this.leggiPagina();
    }
    onResize() {
        let box = this.contenitore.getBoundingClientRect();
        let larghezza = Math.floor(box.width);
        let altezza = Math.floor(box.height);
        this.camera.aspect = larghezza / altezza;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(larghezza, altezza);
        this.renderer.render(this.scene, this.camera);
    }
    anima() {
        requestAnimationFrame(() => { this.anima(); });
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    calcolaSpaziature() {
        let width = this.opzioni.min.l;
        let height = this.opzioni.min.h;
        this.nodi.forEach((el) => {
            width = Math.max(el.dim.x, width);
            height = Math.max(el.dim.y, height);
        });
        //posizione nodi
        this.nodi.forEach((el) => {
            if (el.tipo == "normale")
                el.oggetto3D.position.set(width * (el.pos - .5), -height * el.lvl, 0);
            else
                el.oggetto3D.position.set(width * (el.pos - .5), -height * el.lvl, 0);
        });
        let target = this.getNodoById(this.opzioni.target).oggetto3D.position;
        this.setCamera(target);
    }
    disegna() {
        this.nodi.forEach((el) => {
            this.scene.add(el.oggetto3D);
        });
        this.archi.forEach((el) => {
            this.scene.add(el.oggetto3D);
        });
    }
    setCamera(v) {
        this.camera.position.set(v.x, v.y, this.opzioni.hCamera);
        let target = new THREE.Vector3(v.x, v.y, 0);
        this.controls.target = target;
        console.log(this.camera.position);
        console.log(this.controls.target);
    }
    getScene() {
        return this.scene;
    }
    getNodoById(id) {
        let nodo;
        this.nodi.forEach((el) => {
            if (el.id == id)
                nodo = el;
        });
        return nodo;
    }
    getNodo(lvl, pos) {
        let nodo;
        let candidati = this.getNodiByLvl(lvl);
        candidati.forEach((el) => {
            if (el.pos == pos)
                nodo = el;
        });
        return nodo;
    }
    getNodiByLvl(lvl) {
        let collezione = [];
        this.nodi.forEach((el) => {
            if (el.lvl == lvl)
                collezione.push(el);
        });
        return collezione;
    }
    getNodiByPos(pos) {
        let collezione = [];
        this.nodi.forEach((el) => {
            if (el.pos == pos)
                collezione.push(el);
        });
        return collezione;
    }
    punto(x, y, z) {
        let punto = document.createElement('div');
        punto.style.width = "6px";
        punto.style.height = "6px";
        punto.style.borderRadius = "3px";
        punto.style.backgroundColor = "green";
        let oggetto = new CSS3DRenderer_js_1.CSS3DObject(punto);
        oggetto.position.set(x, y, z);
        this.scene.add(oggetto);
    }
}
exports.Albero = Albero;
class Nodo {
    constructor(id) {
        this.figli = [];
        this.padri = [];
        this.colore = "black";
        this.tipo = "normale";
        this.id = Number(id);
        let elemento = document.getElementById(id);
        this.lvl = Number(elemento.getAttribute("lvl"));
        this.pos = Number(elemento.getAttribute("pos"));
        if (elemento.getAttribute("padri"))
            this.padri = elemento.getAttribute("padri").split(" ").map((el) => { return Number(el); });
        if (elemento.getAttribute("figli"))
            this.figli = elemento.getAttribute("figli").split(" ").map((el) => { return Number(el); });
        if (elemento.getAttribute("colore"))
            this.colore = elemento.getAttribute("colore");
        if (elemento.innerHTML != "") {
            katex.render(this.filtraTesto(elemento.innerHTML), elemento);
            let rect = elemento.getBoundingClientRect();
            this.dim = { x: rect.width, y: rect.height };
            this.contenuto = elemento.innerHTML;
        }
        else {
            this.dim = { x: 0, y: 0 };
            this.tipo = "vuoto";
        }
        elemento.style.display = "none";
        this.creaCSS3DObject();
    }
    creaCSS3DObject() {
        let wrapper = document.createElement('div');
        if (this.tipo != "vuoto") {
            wrapper.innerHTML = this.contenuto;
            wrapper.style.backgroundColor = "white";
            wrapper.style.border = `2px solid ${this.colore}`;
            wrapper.style.borderRadius = "3px";
            wrapper.style.paddingTop = "6px";
        }
        else {
            wrapper.style.display = "none";
        }
        this.oggetto3D = new CSS3DRenderer_js_1.CSS3DObject(wrapper);
        this.oggetto3D.name = "nodo-albero-" + this.id;
        this.oggetto3D.position.set(0, 0, 0);
    }
    posiziona(x, y, z) {
        this.oggetto3D.position.set(x, y, z);
    }
    filtraTesto(testo) {
        if (testo != "") {
            let primoDollaro = testo.indexOf("$");
            let textare = true;
            if (primoDollaro == 0)
                textare = false;
            let testoSplittato = testo.split("$");
            if (testoSplittato[0] == "")
                testoSplittato = testoSplittato.slice(1);
            testo = "";
            for (let i = 0; i < testoSplittato.length; i++) {
                if (textare) {
                    testoSplittato[i] = " \\text{ " + testoSplittato[i].replace(/\\newline/g, " } \\\\ \\text{ ") + " } ";
                    textare = false;
                }
                else {
                    textare = true;
                }
                testo += testoSplittato[i].replace(/\\newline/g, " \\\\ ");
            }
            testo = " \\begin{gathered} " + testo + " \\end{gathered} ";
        }
        return testo;
    }
}
class Arco {
    constructor(padre, figlio) {
        this.colore = "black";
        this.larghezza = 4;
        this.padre = padre;
        this.figlio = figlio;
        let p = this.padre.oggetto3D.position.clone();
        let f = this.figlio.oggetto3D.position.clone();
        let d = f.clone().sub(p);
        this.angolo = d.angleTo(new THREE.Vector3(0, -1, 0));
        if (padre.oggetto3D.position.x > figlio.oggetto3D.position.x)
            this.angolo *= -1;
        this.lunghezza = d.length();
        let medio = d.clone().multiplyScalar(.5).add(p);
        let wrapper = document.createElement('div');
        wrapper.style.height = (this.lunghezza + this.larghezza) + "px";
        wrapper.style.width = this.larghezza + "px";
        wrapper.style.backgroundImage = `linear-gradient(${this.padre.colore},${this.figlio.colore})`;
        wrapper.style.borderRadius = "2px";
        this.oggetto3D = new CSS3DRenderer_js_1.CSS3DObject(wrapper);
        this.oggetto3D.name = `arco-albero-${this.padre.id}-${this.figlio.id}`;
        this.oggetto3D.rotateZ(this.angolo);
        this.oggetto3D.position.set(medio.x, medio.y, -1);
    }
}
//# sourceMappingURL=EDNBalbero.js.map