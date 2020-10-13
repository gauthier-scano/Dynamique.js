/*****************************************************/
/***************   DragAndDrop.js   ******************/
/**
 * Date : 23/11/2015
 * Version : 1.0
 * Compatiblité : 
 * 
 * Nécessite Dynamique.js et DOM.js
 * 
 * Axe : Y ^
 *  	   |--> X
 * 
	minMoveX : first.minMoveX,
	minMoveY : first.minMoveY,
	
	minWidth : first.minWidth,		// Taille minimale en largeur que la cible peut prendre
	maxWidth : first.maxWidth,		// Taille maximale en largeur que la cible peut prendre
	minHeight : first.minHeight,	// Taille minimale en hauteur que la cible peut prendre
	maxHeight : first.maxHeight,	// Taille maximale en hauteur que la cible peut prendre
	
	shadow : first.shadow,
	gridX : first.gridX,
	gridY : first.gridY,
			
	widthCssName : first.widthCssName,
	heightCssName : first.heightCssName,
 */
/*****************************************************/
/*****************************************************/

(function() {
	const 	capacities = {
				top 	: ["clientY", "height", "top"],
				right 	: ["clientX", "width"],
				bottom 	: ["clientY", "height"],
				left 	: ["clientX", "width", "left"]
			},
			notNeg 		= { width : true, 	 height : true },
			eventMaxMin = { width : "Width", height : "Height" },
			correspXY 	= { clientX : "X", clientY : "Y" },
			docDyna 	= Dynamique(document);
	let		id = 1;
	
	Dynamique.tools.initPlugIn("initResize", function(elemArg, arg, first, elem) {
		const eventName = "PlugInResize" + (id++);
		const userObject = Dynamique.module.Event.createEventObject(Object.assign(first, {
			elem : elem,
			target : first.target || docDyna,
			targetTrig : first.targetTrig || docDyna,
			style : {},
			
			type : first.type || [],
			setType : function(type/*, createTargetMove*/) {
				this.type = type = type.split("-");
				
				for(let i = 0, typeLength = type.length; i < typeLength; i++) {
					if(!capacities[type[i]]) {
						throw new Error("Resize PlugIn Error : type '" + type[i] + "' of '" + newType + "' is not recognized.");
					}
					
					/*if(createTargetMove) {
						if(type[i] == "top") {
							
						}
						else if(type[i] == "right") {
							
						}
						else if(type[i] == "bottom") {
							
						}
						else {
							
						}
					}*/
				}
				
				return this;
			},
			
		//	enable : true,
			setEnable : function(state) {
				userObject.enable = !!state;
				
				if(state) {
					userObject.targetTrig.enableEventByName(eventName, "mousedown");
				}
				else {
					userObject.targetTrig.disableEventByName(eventName, "mousedown");
				}
				
				return this;
			}
		}), {
			 resize : true,
			 mousemove : true,
			 mousedown : true,
			 mouseup : true
		});
		
		let	posStart = { clientX : 0, clientY : 0 },
			validMin = {},
			targetStyle;
		
		userObject.target.setEventByName(eventName, "mousemove", function(event) {
			userObject.dispatchEvent("mousemove", event);
			
			const type = userObject.type;
			for(let i = 0, typeLength = type.length; i < typeLength; i++) {
				const 	capa = capacities[type[i]],
						client = capa[0];
				
				for(let y = 1, capaLength = capa.length; y < capaLength; y++) {
					const 	capaAct = capa[y];
					let		value = posStart[capaAct] + (event[client] - posStart[client]);
					
					if(capaLength > 2 && (capaAct == "width" || capaAct == "height")) {
						value = posStart[capaAct] - (value - posStart[capaAct]);
					}
					
					if(validMin[client] || (!userObject["minMove" + correspXY[client]] || (Math.abs(event[client] - posStart[client]) > userObject["minMove" + correspXY[client]]))) {
						validMin[client] = true;
						
						const 	max = userObject["max" + eventMaxMin[capaAct]],
								min = userObject["min" + eventMaxMin[capaAct]];
						
						if(!userObject.shadow && !posStart.outFlow) {
							if(capaAct == "top") {
								value -= posStart.topM;
							}
							else if(capaAct == "left") {
								value -= posStart.leftM;
							}
						}
						
						if(notNeg[capaAct] && max && value > max) {
							value = max;
						}
						else if(notNeg[capaAct] && min && value < min) {
							value = min;
						}
						else {
							if(userObject["minMove" + correspXY[client]]) {
								value -= userObject["minMove" + correspXY[client]];
							}
							
							value = (value >= 0 || !notNeg[capaAct]) ? value : 0;
						}
						
						if(!userObject["grid" + correspXY[client]] || !(value % userObject["grid" + correspXY[client]])) {
							if(userObject[capaAct + "CssName"]) {
								const name = userObject[capaAct + "CssName"];
								
								for(let z = 0, nameLength = name.length; z < nameLength; z++) {
									style[name[z]] = value + "px";
								}
							}
							else {
								style[capaAct] = value + "px";
							}
						}
					}
				}
			}
			
			targetStyle.setStyle(style);
			userObject.dispatchEvent("resize", style, targetStyle, event);
		}).setEventByName(eventName, "mouseup", function() {
			if(userObject.shadow) {
				if(style.top && posStart.topM) {
					style.top = (parseFloat(style.top) - posStart.topM) + "px";
				}
				
				if(style.left && posStart.leftM) {
					style.left = (parseFloat(style.left) - posStart.leftM) + "px";
				}
				
				elem.setStyle(style);
				targetStyle.removeElement();
				targetStyle = null;
			}
			
			userObject.target.disableEventByName(eventName);
			userObject.dispatchEvent("mouseup", style, event);
		}).disableEventByName(eventName);
		
		userObject.targetTrig.setEventByName(eventName, "mousedown", function(event) {
			const computed = window.getComputedStyle(elem[0]);
			
			posStart.top 	 = elem[0].offsetTop - parseFloat(computed.marginTop);
			posStart.left 	 = elem[0].offsetLeft - parseFloat(computed.marginLeft);
			posStart.width 	 = elem[0].offsetWidth - parseFloat(computed.borderLeftWidth) - parseFloat(computed.borderRightWidth);
			posStart.height  = elem[0].offsetHeight - parseFloat(computed.borderTopWidth) - parseFloat(computed.borderBottomWidth);
			posStart.clientX = event.clientX;
			posStart.clientY = event.clientY;
			posStart.outFlow = computed.position == "absolute" || computed.position == "fixed";
			posStart.topM = posStart.leftM = 0;
			
			if(computed.boxSizing != "border-box") {
				posStart.width -= (parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight));
				posStart.height -= (parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom));
			}
			
			delete validMin.clientX;
			delete validMin.clientY;
			
			style = userObject.style = {};
			
			if(userObject.shadow) {
				if(!posStart.outFlow && computed.position == "relative") {
					posStart.topM  = elem[0].offsetTop - parseFloat(computed.top) - parseFloat(computed.marginTop) - parseFloat(computed.borderTopWidth);
					posStart.leftM = elem[0].offsetLeft - parseFloat(computed.left) - parseFloat(computed.marginLeft) - parseFloat(computed.borderLeftWidth);
				}
				
				targetStyle = elem.save().copyElement().setValue("style", elem[0].attributes.style ? elem[0].attributes.style.textContent : "").setStyle({
					position : posStart.outFlow ? posStart.outFlow : "absolute",
					top 	 : posStart.top + "px",
					left 	 : posStart.left + "px",
					width 	 : posStart.width + "px",
					height 	 : posStart.height + "px"
				}).addClass("resize-shadow").insertFirst(elem.save().selectParent());
				
				if(!posStart.outFlow) {
					if(computed.position != "relative") {
						posStart.topM  = posStart.top = parseFloat(computed.marginTop);
						posStart.leftM = posStart.left = parseFloat(computed.marginLeft);
					}
				}
			}
			else {
				if(!posStart.outFlow) {
					if(computed.position == "relative") {
						posStart.topM  = elem[0].offsetTop - parseFloat(computed.top) - parseFloat(computed.marginTop);
						posStart.leftM = elem[0].offsetLeft - parseFloat(computed.left) - parseFloat(computed.marginLeft);
					}
					else {
						posStart.top  = parseFloat(computed.marginTop);
						posStart.left = parseFloat(computed.marginLeft);
					}
				}
				
				targetStyle = elem;
			}
			
			userObject.target.enableEventByName(eventName);
			userObject.dispatchEvent("mousedown", event);
		});
		
		return userObject.setEnable(typeof first.enable == "undefined" || first.enable).setType(first.type || "bottom-right");
	});
})();
