
	/**
   * @class
   * l'alberone di eduniba
	 * @param  {} id
	 * @param  {} larghezza
	 * @param  {} altezza
	 * @param  {} fonte
	 * @param  {} dove
	 * @param  {} opzioni
	 */  
  
	export function Albero(id,larghezza,altezza,fonte,dove,opzioni){
		let canvasId=id;
		let canvas,ctx;
		let canX,canY;
		let contenitore;
		let canvasOverlay;
		let angolinoExtras;
		//mouse e spostamento
		let centro=[0,0];
    let trascinamento=false; //trascinamento in corso, controllo per listeners

		//albero
		let albero;

		//dimensioni disegno
		let spaziaturaX,spaziaturaY;

		//tipi di esercizio:
		//nessuno: nodi presentati con solo testo e colore standard
		//flaggaNodi: nodi con alternativa possono essere giusti o meno, l'utente deve flggarli se ritiene sbagliati
		let globalOpt={
      debug:false,
			zoom:1,
			fattoreDimTesto:10, //il testo è funzione dello zoom
      sogliaZoom:[0.5,5],
      sogliaClick:20,
      offsetIniziale:null,
      coloreDefaultTesto:"black",
      coloreDefaultBordo:"black",
      coloreDefaultSfondo:"white",
			coloreFisso:"white",
			coloreSelezionato:"cyan",
      coloreModificabile:"lightgray",
			coloreSbagliato:"red",
			coloreGiusto:"lime",
			margineContenitore:"solid 1px rgb(230,230,230)",
      tipoEsercizio:"nessuno",
      margineDisegno:15,
      raggioNodiPallino:5,
      spessoreArchi:2,
      bordoNodi:2,
      staccoPosizioni:20,
      staccoLivelli:20,
      bordoNodi:2,
      paddingNodi:6,//padding non sul lato inferiore
		}
		//sovrascrivo il default con eventuali opzioni, se inserite
		if(opzioni!=null){
			Object.keys(opzioni).forEach(function(key){
				globalOpt[key]=opzioni[key];
			})
		}
		//risistemo alcune opzioni interdipendenti
		if(globalOpt.offsetIniziale==null) centro=[larghezza/2,altezza/2];

    //helper duplicato per filtro testi

    /**
     * calcola qualcosa di ingombro
     * @param  {} nodo
     * @method filtraTesto
     * @memberof Albero
     */
    function filtraTesto(testo){
      if(testo!=""){
        let primoDollaro=testo.indexOf("$");
        let textare=true;
        if(primoDollaro==0) textare=false;

        let testoSplittato=testo.split("$");
        if(testoSplittato[0]=="") testoSplittato=testoSplittato.slice(1);

        testo="";
        for(let i=0;i<testoSplittato.length;i++){
          if(textare){
            testoSplittato[i]=" \\text{ "+testoSplittato[i].replace(/\\newline/g," } \\\\ \\text{ ")+" } "
            textare=false;
          }else{
            textare=true;
          }
          testo+=testoSplittato[i].replace(/\\newline/g," \\\\ ");
        }
        testo=" \\begin{gathered} "+testo+" \\end{gathered} ";
      }
      return testo;
    }
    //helper per dimensioni nodo renderizzato, con rendering integrato
    function renderizza(nodo,testo){//nodo jquery con primo figlio per il render
      katex.render(testo,nodo[0],{throwOnError:false});
    }
    function calcolaIngombro(nodo){
      let dim=[0,0];
      $(nodo).find("span").each(function(){
        dim[0]=Math.max(dim[0],$(this).outerWidth());
        dim[1]=Math.max(dim[1],$(this).outerHeight());
      });
      return dim;
    }
    function calcolaSpaziature(){
      //scansione spazi in base al numero di nodi e livelli
      spaziaturaX=canX/(albero.ampiezza+1);
      spaziaturaY=canY/(albero.livelli+1);
      //ed aggiustamento in base agli ingombri
      albero.nodi.forEach(nodo=>{
        let dim=nodo.dimensioni;
        if(dim[0]>spaziaturaX) spaziaturaX=dim[0]+globalOpt.staccoPosizioni;
        if(dim[1]>spaziaturaY) spaziaturaY=dim[1]+globalOpt.staccoLivelli;
      })
    }
    
    //GETTERS
		this.recuperaNodo=function(id){
			var temp;
			for(var i=0;i<albero.nodi.length;i++){
				if(albero.nodi[i].id==id){
					temp=albero.nodi[i]; //ritorna l'indirizzo
					break;
				}
			}
			return temp;
    }
    this.recuperaNodoHTML=function(id){
      return $(document.getElementById("albero"+canvasId+"nodo"+id));
		}
		this.recuperaTesto=function(id){
			return this.recuperaNodo(id).testo;
    }
    //fine GETTERS

    //SETTERS
    /**
     * calcola qualcosa di ingombro
     * @param  {} id
     * @method modificaTestoNodo
     * @memberof Albero
     */
		this.modificaTestoNodo=function(id,testo){
      let nodo=this.recuperaNodo(id);

      if(testo!=""){
        testo=filtraTesto(testo);
        nodo.testo=testo;
      }else{
        nodo.testo="";
        nodo.dimensioni=[0,0];
      }

      nodo.aggiornato=true;
      this.disegna();
    }
    //fine SETTERS

    //FUNZIONI DISEGNO
    function calcolaPosizione(nodo){
      let medio=Math.floor((albero.ampiezza+1)/2);
      let posX=((nodo.pos-medio)*spaziaturaX)*globalOpt.zoom+centro[0];
      let posY=((nodo.lvl-medio)*spaziaturaY)*globalOpt.zoom+centro[1];
      return [posX,posY];
    }
    function calcolaOffset(pos,nodo){
      let dim=nodo.dimensioni;
      let offX=pos[0]-(0.5*dim[0])*globalOpt.zoom;
      let offY=pos[1]-(0.5*dim[1])*globalOpt.zoom;
      return [offX,offY];
    }
		this.disegnaNodo=function(nodo){
      let testo=nodo.testo;
      if(testo!=""){//disegno qualcosa solo se c'è un testo
        //singolo nodo, creo se ancora non esiste
        let childNodo;
        //solo dipendenti da zoom e leggere
        let paddingNodi=globalOpt.paddingNodi*globalOpt.zoom;
        let dimTesto=globalOpt.fattoreDimTesto*globalOpt.zoom;//la dimensione del testo influisce sulle dimensioni del render
          
        if(!nodo.creato){//se non ho già creato il nodo
          childNodo=$(document.createElement("div"));
          childNodo.attr("id",`albero${canvasId}nodo${nodo.id}`);
          childNodo.addClass("singoloNodoAlbero");
          childNodo.css("position","absolute");
          childNodo.css("box-sizing","border-box");
          childNodo.css("background-color",this.recuperaNodo(nodo.id).sfondoCol);
          childNodo.css("border",`${globalOpt.bordoNodi}px solid ${this.recuperaNodo(nodo.id).bordoCol}`);
          childNodo.css("border-radius",globalOpt.bordoNodi+"px");
          childNodo.css("text-align","center");
          childNodo.css("white-space","nowrap");
          childNodo.css("user-select","none");
          childNodo.css("font-size",dimTesto+"px");

          canvasOverlay.append(childNodo);

          //predispongo gli aggiornamenti
          nodo.creato=true;
          nodo.aggiornato=true;
        }else{//altrimenti lo recupero
          childNodo=this.recuperaNodoHTML(nodo.id);
        }
        
        
        if(nodo.aggiornato){//se ci sono stati aggironamenti lo renderizzo e aggiorno dimesnioni
          renderizza(childNodo,testo);
          nodo.dimensioni=calcolaIngombro(childNodo);
          nodo.aggiornato=false;
        }

        //necessari a verificare se siamo nei bordi
        let pos=calcolaPosizione(nodo);
        let marg=globalOpt.margineDisegno;
        if(pos[0]>marg && (canX-pos[0])>marg && pos[1]>marg &&(canY-pos[1])>marg){//se il nodo è entro i limiti
          //mostro il nodo
          childNodo.show();
          
          

          //dipendenti da dimensioni nuove
          let offset=calcolaOffset(pos,nodo);//necessita dimensioni ricalcolate
          let offX=offset[0];
          let offY=offset[1];
          let h=globalOpt.zoom*nodo.dimensioni[1];

          //applico spostamenti e dimensioni
          childNodo.css("line-height",h+"px");
          childNodo.css("font-size",dimTesto+"px");
          childNodo.css("padding",`${paddingNodi}px ${paddingNodi}px 0 ${paddingNodi}px`);          
          childNodo.css("top",offY+"px");
          childNodo.css("left",offX+"px");
          
        }else{//fuori e quasi fuori dai margini: nodo a pallino
          childNodo.hide();
        }

      }
		}

    this.disegnaArco=function(A,B){//disegni su canvas
      
      let posA=calcolaPosizione(A);
      let posAX=posA[0];
      let posAY=posA[1];
      let posB=calcolaPosizione(B);
      let posBX=posB[0];
      let posBY=posB[1];
      
      //gradiente per i nodi, secondo loro colori
			// var gradiente=ctx.createLinearGradient(A.pos*spaziaturaX-canX/2,A.lvl*spaziaturaY-canY/2,B.pos*spaziaturaX-canX/2,B.lvl*spaziaturaY-canY/2);
			// gradiente.addColorStop("0",A.col);
			// gradiente.addColorStop("1",B.col);

      
      let spessore=globalOpt.spessoreArchi;
      ctx.beginPath();
      ctx.moveTo(posAX,posAY);
      ctx.lineTo(posAX,posAY+0.5*(posBY-posAY));
      ctx.lineTo(posBX,posBY);
			ctx.strokeStyle=A.bordoCol;
			ctx.lineWidth=spessore;
      ctx.stroke();
      
      //nodi a pallino
      
      let raggio=globalOpt.raggioNodiPallino;
      //nodo partenza
      if(A.testo!=""){
        ctx.beginPath();
        ctx.arc(posAX,posAY,raggio,0,2*Math.PI);
        ctx.closePath();
        ctx.fillStyle=A.bordoCol;
        ctx.fill();
      }
      //nodo arrivo
      if(B.testo!=""){
        ctx.beginPath();
        ctx.arc(posBX,posBY,raggio,0,2*Math.PI);
        ctx.closePath();
        ctx.fillStyle=B.bordoCol;
        ctx.fill();
      }
		}

		this.disegna=function(){
			ctx.clearRect(0,0,canX,canY);

			for(var i=0;i<albero.nodi.length;i++){
				this.disegnaNodo(albero.nodi[i]);
      }

      for(var i=0;i<albero.archi.discendenti.length;i++){
				this.disegnaArco(this.recuperaNodo(albero.archi.discendenti[i][0]),this.recuperaNodo(albero.archi.discendenti[i][1]));
			}
		}
		//FINE DISEGNO

    
		//FUNZIONI TECNICHE DI SETUP
		this.leggiTeoremaDaPagina=function(){
			albero={
				livelli:0,
				ampiezza:0,
				nodi:[],
				archi:{
          ascendenti:[],
          discendenti:[]
        }
      }
      
      let nodi=$("#"+fonte+">nodo-albero-EDNB");
            
      nodi.each(function(){
        let el=$(this);
        el.show();
        //nodo
        let nodoTemp={
          creato:false,
          id:Number(el.attr("id")),
          lvl:Number(el.attr("livello")),
          pos:Number(el.attr("posizione")),
          bordoCol:globalOpt.coloreDefaultBordo,
          sfondoCol:globalOpt.coloreDefaultSfondo,
          dimensioni:[],
          testo:"",
          aggiornato:true
        }
        if(el.attr("colore")){
          nodoTemp.bordoCol=el.attr("colore");
        }

        //archi
        if(el.attr("padri")){
          let padri=el.attr("padri").split(" ");
          padri.forEach(pad=>{
            albero.archi.ascendenti.push([pad,el.attr("id")]);
          })
        }
        if(el.attr("figli")){
          let padri=el.attr("figli").split(" ");
          padri.forEach(fig=>{
            albero.archi.discendenti.push([el.attr("id"),fig]);
          })
        }

        //testi
        function filtraTestoConDebug(testo){
          if(testo!=""){
            testo=filtraTesto(testo);
            if(globalOpt.debug) testo=" \\begin{gathered} "+" \\textbf{\\color{red}ID:"+el.attr("id")+"}\\color{red}("+nodoTemp.pos+","+nodoTemp.lvl+")\\color{black} "+testo+" \\end{gathered} ";
          }
          return testo;
        }
        el.css("font-size",(globalOpt.fattoreDimTesto*globalOpt.zoom)+"px");

        //renderizzo testi per le dimensioni
        el.children().each(function(){
          let subnd=$(this);
          if(subnd[0].nodeName.toUpperCase()=="TESTO-NODO-EDNB"){
            let testo=filtraTestoConDebug(subnd.html());
            nodoTemp.testo=testo;
            if(testo!=""){
              renderizza(subnd,testo);
              nodoTemp.dimensioni=calcolaIngombro(subnd);
            }else nodoTemp.dimensioni=[0,0];
          }
        })

        //ampiezza e livelli
        if(albero.livelli<Number(el.attr("livello"))){
          albero.livelli=Number(el.attr("livello"));
        }
        if(albero.ampiezza<Number(el.attr("posizione"))){
          albero.ampiezza=Number(el.attr("posizione"));
        }

        //inserisco nodi e testi
        albero.nodi.push(nodoTemp);
      });

      //torno a collassare i nodi
      nodi.each(function(){$(this).hide()});
		}

		this.leggiTeorema=function(){
			//scorro la pagina per leggere il teorema
			this.leggiTeoremaDaPagina();
      //calcolo spaziature su una div temporanea
      calcolaSpaziature();
		}

		this.listeners=function(callback){
			//ausiliaria per localizzare eventi
			function getMouseXY(e,o,tipo){
        let x,y;
        let off=$(o).offset();
				if(tipo=="touch") e=e.touches[0];
        x=e.pageX-off.left;
        y=e.pageY-off.top;
				return [x,y];
      }

			//imposto i listeners per il drag
      let self=this;
      let sogliaClick=globalOpt.sogliaClick;
      let inizioClick;
      let spostato=false;

			//TOUCH
			canvasOverlay.on('touchstart', function iniziaTouch(e) {
				if(!trascinamento){
					trascinamento=true;
          spostato=false;
          inizioClick=getMouseXY(e,this,"touch").slice();
					e.preventDefault();
				}
			});
			canvasOverlay.on('touchmove', function muoviTouch(e) {
				if(trascinamento){
          let p=getMouseXY(e,this,"touch");
          console.log(e)
          centro[0]+=e.originalEvent.movementX;
          centro[1]+=e.originalEvent.movementY;
          if(Math.hypot(p[0]-inizioClick[0],p[1]-inizioClick[1])>sogliaClick) spostato=true;
					self.disegna();
					e.preventDefault();
				}
			});
			canvasOverlay.on('touchend', function finisciTouch(e) {
        trascinamento=false;
        e.preventDefault();
			});
			canvasOverlay.on('touchcancel', function interrompiTouch(e) {
				trascinamento=false;
			});
			//MOUSE
			canvasOverlay.on("mousedown",function(e){
				if(!trascinamento){
          trascinamento=true;
          spostato=false;
          inizioClick=getMouseXY(e,this,"mouse").slice();
				}
			});
			canvasOverlay.on("mousemove",function(e){
				if(trascinamento){
          let p=getMouseXY(e,this,"mouse");
          centro[0]+=e.originalEvent.movementX;
          centro[1]+=e.originalEvent.movementY;
          if(Math.hypot(p[0]-inizioClick[0],p[1]-inizioClick[1])>sogliaClick) spostato=true;
					self.disegna();
				}
			});
			canvasOverlay.on("mouseup",function(e){
        trascinamento=false;
			});	
			canvasOverlay.on("mouseleave",function(e){
					trascinamento=false;
			});
			canvasOverlay.on("wheel",function(e){
				if(e.originalEvent.deltaY<0){//rotellina verso l'alto ingrandisco
          globalOpt.zoom+=0.1;
          // offset=0.1*globalOpt.zoom;
					if(globalOpt.zoom>globalOpt.sogliaZoom[1]){
            globalOpt.zoom=globalOpt.sogliaZoom[1];
            // offset=0;
          }
				}else{
					globalOpt.zoom-=0.1;
          // offset=-0.1*globalOpt.zoom;
					if(globalOpt.zoom<globalOpt.sogliaZoom[0]){
            globalOpt.zoom=globalOpt.sogliaZoom[0];
            // offset=0;
          }
        }
        albero.nodi.forEach((n)=>{
          n.dimensioniAggiornate=true;
        })
				self.disegna();
				e.preventDefault();
      });
      
      //fisso il callback per i nodi
      if(callback!=null){
        $(`[id^=albero${canvasId}nodo]`).each(function(){
          let id=$(this).attr("id").replace(`albero${canvasId}nodo`,"");
          $(this).on("click",function(){
            if(!spostato) callback(id)
          });
        })
      }
		}
		//FINE TECNICHE
		
    
		//FASE SETUP
			canX=larghezza;
			canY=altezza;
		
			//sistemo il contenitore
			contenitore=$("#"+dove);
			contenitore.css("width",larghezza+"px");
			contenitore.css("height",altezza+"px");
			contenitore.css("position","relative");
			contenitore.css("border",globalOpt.margineContenitore);

			//canvas
			canvas=$(document.createElement("canvas"));
			canvas.attr("id","canvasAlbero"+canvasId);
			canvas.attr("width",canX);
			canvas.attr("height",canY);
			canvas.css("position","absolute");
			canvas.css("left","0px");
			canvas.css("top","0px");
			canvas.css("pointerEvents","none");
			contenitore.append(canvas);
				
			//overlay
			canvasOverlay=$(document.createElement("div"));
			canvasOverlay.attr("id","overlayAlbero"+canvasId);
			canvasOverlay.css("width",canX+"px");
			canvasOverlay.css("height",canY+"px");
			canvasOverlay.css("position","absolute");
			canvasOverlay.css("textAlign","center");
			contenitore.append(canvasOverlay);
				
			//angolino misurazioni ecc
			angolinoExtras=$(document.createElement("div"));
			angolinoExtras.css("display","none");
			contenitore.append(angolinoExtras);

			//setto il contesto
			ctx=canvas[0].getContext("2d");

			//leggo il teorema
			this.leggiTeorema();
		//FINE SETUP
	}

	

	// 	return _libreria;
	// }
