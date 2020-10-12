import * as katex from 'katex'

import * as THREE from 'three'
import {TrackballControls} from 'three/examples/jsm/controls/TrackballControls'
import { CSS3DRenderer, CSS3DObject, CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

const HTML_TAG_NAME="tree-node"

export class Tree{
  container:HTMLElement

  camera:THREE.Camera
  scene:THREE.Scene
  renderer:CSS3DRenderer
  dimRender:number[]
  controls:TrackballControls

  tree:any
  nodes:Node[]
  edges:Edge[]

  options={
    tagName:"tree-node",
    camera:{
      height:500,
      position:new THREE.Vector3(0,0,500),
      target:0
    },
    min:{
      h:100,
      w:50
    }
  }

  /**
   * The tree object
   * @param width width of display, in px. Ignored if resizing is enabled
   * @param height height of display, in px
   * @param wrapper div element to wrap tree with
   */
  constructor(width:number, height:number, wrapper:HTMLElement|string){
    this.dimRender=[width,height]
    if(typeof wrapper == "string") this.container=document.getElementById(wrapper)
    else this.container=wrapper

    this.camera = new THREE.PerspectiveCamera( 50, height/height, 1, 5000 );

    this.scene=new THREE.Scene();
    this.scene.add(this.camera)

    this.renderer=new CSS3DRenderer();
    this.renderer.setSize(width,height);
    this.container.appendChild(this.renderer.domElement)

    this.controls=new TrackballControls(this.camera, this.renderer.domElement);
    this.setCamera(this.options.camera.position)
    this.controls.noRotate=true

    this.container.addEventListener("resize",this.onResize)
    this.onResize()

    this.animate()

    this.readPage()
  }

  /**
   * Automatic resizing
  */
  onResize() {
    let box=this.container.getBoundingClientRect();
    let width=Math.floor(box.width);
    let height=Math.floor(box.height);
    (this.camera as any).aspect = width / height;
    (this.camera as any).updateProjectionMatrix()
    this.renderer.setSize(width, height)
    this.renderer.render( this.scene, this.camera )
  }

  /**
   * Render loop
   */
  animate(){
    requestAnimationFrame(()=>{this.animate()})
    this.controls.update()
    this.renderer.render( this.scene, this.camera );
  }

  /**
   * Function to search the document for custom tag elements and convert into Nodes
   */
  readPage=function(){
    this.nodes=[]
    this.edges=[]
    this.poss=[]
    this.lvls=[]
    //retrieve nodes
    let nodesHTML=document.querySelectorAll(HTML_TAG_NAME)
    nodesHTML.forEach((el:HTMLElement)=>{
      el.style.display="inline-block"
      let node=new Node(el.getAttribute("id"))
      this.nodes.push(node)
    })

    //compute spacing
    this.computeSpacing()

    //create edges
    this.nodes.forEach((parent)=>{
      parent.children.forEach((desc)=>{
        let edge=new Edge(parent,this.getNodeById(desc))
        this.edges.push(edge)
      })
    })

    this.draw()
  }

  /**
   * Compute spacing for nodes
   */
  computeSpacing(){
    let width=this.options.min.w
    let height=this.options.min.h
    this.nodes.forEach((el)=>{
      width=Math.max(el.dim.x,width)
      height=Math.max(el.dim.y,height)
    })
    //nodes positions
    this.nodes.forEach((el)=>{
      if(el.type=="standard") el.object3D.position.set(width*(el.pos-.5),-height*el.lvl,0)
      else el.object3D.position.set(width*(el.pos-.5),-height*el.lvl,0)
    })

    let target=this.getNodeById(this.options.camera.target).object3D.position
    this.setCamera(target)

  }

  draw(){
    this.nodes.forEach((el)=>{
      this.scene.add(el.object3D)
    })
    this.edges.forEach((el)=>{
      this.scene.add(el.object3D)
    })
  }

  /**
   * Set camera position
   * @param v position ad a THREE.Vector3
   */
  setCamera(v:THREE.Vector3){
    this.camera.position.set(v.x,v.y,this.options.camera.height)
    let target=new THREE.Vector3(v.x,v.y,0)
    this.controls.target=target
  }

  /**
   * Scene getter
   */
  getScene(){
    return this.scene
  }
  /**
   * Get node by id
   * @param id id of desired Node
   */
  getNodeById(id){
    let node
    this.nodes.forEach((el)=>{
      if(el.id==id) node=el
    })
    return node
  }
  /**
   * Get a tree's Node with given level and position
   * @param lvl level of desired Node
   * @param pos position of desired Node
   */
  getNodeByLP(lvl,pos){
    let node
    let candidates=this.getNodesByLvl(lvl)
    candidates.forEach((el)=>{
      if(el.pos==pos) node=el
    })
    return node
  }
  /**
   * Get Nodes by level
   * @param lvl level of desired Nodes
   */
  getNodesByLvl(lvl){
    let collection=[]
    this.nodes.forEach((el)=>{
      if(el.lvl==lvl) collection.push(el)
    })
    return collection
  }
  /**
   * Get Nodes by position
   * @param pos position of desired Nodes
   */
  getNodesByPos(pos){
    let collection=[]
    this.nodes.forEach((el)=>{
      if(el.pos==pos) collection.push(el)
    })
    return collection
  }
  /**
   * Draw a point, primarly for debugging
   * @param x point x coord (position)
   * @param y point y coord (level)
   * @param z point z coord (depth)
   */
  point(x,y,z){
    let point = document.createElement('div')
    point.style.width="6px"
    point.style.height="6px"
    point.style.borderRadius="3px"
    point.style.backgroundColor="green"

    let object=new CSS3DObject(point);

    object.position.set(x,y,z)
    this.scene.add(object)
  }
}


class Node{
  id:number
  lvl:number
  pos:number
  children:number[]=[]
  parents:number[]=[]
  color:string="black"
  type:string="standard"

  dim:{x:number,y:number}
  coords:{x:number,y:number,z:number}
  content:string
  object3D:CSS3DObject

  /**
   * Node object
   * @param id Node's id
   */
  constructor(id){
    this.id=Number(id)
    let element=document.getElementById(id)
    this.lvl=Number(element.getAttribute("lvl"))
    this.pos=Number(element.getAttribute("pos"))

    if(element.getAttribute("parents")) this.parents=element.getAttribute("parents").split(" ").map((el)=>{return Number(el)})
    if(element.getAttribute("children")) this.children=element.getAttribute("children").split(" ").map((el)=>{return Number(el)})
    if(element.getAttribute("color")) this.color=element.getAttribute("color")

    if(element.innerHTML!=""){
      katex.render(this.filterText(element.innerHTML),element)
      let rect=element.getBoundingClientRect()
      this.dim={x:rect.width,y:rect.height}

      this.content=element.innerHTML
    }else{
      this.dim={x:0,y:0}
      this.type="empty"
    }

    element.style.display="none"

    this.createCSS3DObject()
  }
  /**
   * Create the CSS3D Object
   */
  createCSS3DObject(){
    let wrapper = document.createElement('div')
    if(this.type!="empty"){
      wrapper.innerHTML=this.content

      wrapper.style.backgroundColor="white"
      wrapper.style.border=`2px solid ${this.color}`
      wrapper.style.borderRadius="3px"
      wrapper.style.paddingTop="6px"
    }else{
      wrapper.style.display="none"
    }

    this.object3D=new CSS3DObject(wrapper);
    this.object3D.name=HTML_TAG_NAME+"-"+this.id
    this.object3D.position.set(0,0,0)
  }
  /**
   * Set node position
   * @param x point x coord (position)
   * @param y point y coord (level)
   * @param z point z coord (depth)
   */
  setPosition(x,y,z){
    this.object3D.position.set(x,y,z)
  }
  /**
   * Filter HTML custom tag content
   * @param text text to filter
   */
  filterText(text){
    if(text!=""){
      let firstDollar=text.indexOf("$");
      let teXate=true;
      if(firstDollar==0) teXate=false;

      let splittedText=text.split("$");
      if(splittedText[0]=="") splittedText=splittedText.slice(1);

      text="";
      for(let i=0;i<splittedText.length;i++){
        if(teXate){
          splittedText[i]=" \\text{ "+splittedText[i].replace(/\\newline/g," } \\\\ \\text{ ")+" } "
          teXate=false;
        }else{
          teXate=true;
        }
        text+=splittedText[i].replace(/\\newline/g," \\\\ ");
      }
      text=" \\begin{gathered} "+text+" \\end{gathered} ";
    }
    return text;
  }
}

class Edge{
  parent:Node
  child:Node
  color:string="black"
  tree:Tree

  length:number
  width:number=4
  angle:number
  object3D:CSS3DObject

  /**
   * The Edge object
   * @param parent Edge's starting Node
   * @param child Edge's ending Node
   */
  constructor(parent,child){
    this.parent=parent
    this.child=child

    let p=this.parent.object3D.position.clone()
    let c=this.child.object3D.position.clone()
    let d=c.clone().sub(p)

    this.angle=d.angleTo(new THREE.Vector3(0,-1,0))
    if(parent.object3D.position.x>child.object3D.position.x) this.angle*=-1

    this.length=d.length()

    let median=d.clone().multiplyScalar(.5).add(p)


    let wrapper = document.createElement('div')
    wrapper.style.height=(this.length+this.width)+"px"
    wrapper.style.width=this.width+"px"
    wrapper.style.backgroundImage=`linear-gradient(${this.parent.color},${this.child.color})`
    wrapper.style.borderRadius="2px"


    this.object3D=new CSS3DObject(wrapper);
    this.object3D.name=`tree-edge-${this.parent.id}-${this.child.id}`

    this.object3D.rotateZ(this.angle)
    this.object3D.position.set(median.x,median.y,-1)

  }
}
