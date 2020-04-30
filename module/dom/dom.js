/*****************************************************/
/********************	DOM.js	 *********************/
/**
 * Framework Dynamique.js
 * Docs/licence : https://www.dynamiquejs.fr
 * 
 * Internal Data:
 * @Name: Event
 * @Type: Parent
 * @Parent: ["Module"]
 * @UseAsParent: true
 * @Dependencies: []
 * @Version: 1.0
 */
/*****************************************************/
/*****************************************************/

"use strict";

(function() {
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: Base
	 * @version: 1.0
	*/
	
		/***** Fonction Dom *****/
		// Cette fonction est la base du framework
		// Même fonctionnement que la fonction createElement
		// @return : {Array}, un tableau contenant les éléments une fois créer et étendue des fonctions introduis par dom.js (événements + modifications du dom)
		// Version : 1.0
		
			const Dom = function() {
				return Object.assign(createElement(arguments).list, Dom.plugIn);
			};
		
		/***** FIN fonction Dom *****/
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: System
	 * @version: 1.0
	*/
	
		/***** Fonctions générales *****/
		
		const 	toString = Object.prototype.toString,
				slice = Array.prototype.slice,
				indexOf = Array.prototype.indexOf,
				indexOfString = String.prototype.indexOf;
			
		/***** FIN Fonctions générales *****/
	
	/***** END FRAGMENT *****/
	
	
	/***** Gestion d'ajouts, de suppression, de récupération ou de changement des propriété data, "value", style et attribute *****/
	
		/***** NEW FRAGMENT *****/
		/**
		 * @name: CreateMethods
		 * @version: 1.0
		*/
		
			Dom.createMethods = function(name, setFct, getFct, rmFct) {
				/***** Fonction set *****/
				// Cette fonction la création d'une fonction permettant en fonction d'une fonction fournit d'ajouter, et uniquement l'ajout d'attributs à un élément
				// Le fonctionnement de cette fonction change en fonction du type des arguments :
				// Cas 1 - Si l'argument en cours est un objet (Array|Object}, les attributs de l'élément seront étendue avec les propriétés présente dans cet objet
				// Cas 2 - Si l'argument en cours est une chaine de caractère, les attributs de l'élément seront étendue tel que : attributs.arguments[N] = arguments[N+1];
				// Dans tout les autres cas, le traitement sera le même que le cas 2
				// Exemple : Dynamique("script").setAttribute({oki:"ok"},"a","a");			// Les éléments auront comme nouveaus attributs : "a" : "a", "oki" : "ok"
				//			 Dynamique("script").setAttribute("a", {oki:"ok"}, "b", "b");	// Les éléments auront comme nouveaux atributs : "b" : "b", "a" : "[object Object]"
				
					Dom["set" + name] = function(domList) {
						const elemLength = domList.length;
						
						for(let i = 1, length = arguments.length; i < length; i++) {	// Pour chaque arguments donné, note : on commence par la boucle des arguments pour éviter de faire la vérification typeof en boucle
							const 	arg = arguments[i];
							let 	y = elemLength;
							
							if(typeof arg == "string") {
								while(y--) {
									setFct(domList[y], arg, arguments[i+1]);
								}
								
								i++;
							}
							else {
								while(y--) {
									for(let z in arg) {
										if(arg.hasOwnProperty(z)) {
											setFct(domList[y], z, arg[z]);
										}
									}
								}
							}
						}
						
						return this;
					};

				/***** FIN Fonction set *****/
				
				
				/***** Fonction get *****/
				// Cette fonction permet la création des fonctios permettant la sélection et suppression de propriétés sr des éléments dom
				// @arg[0]: {String|Object}, 	Si l'argument est une chaine de caractère, la propriété ainsi nommée sera récupérée;
				//								Si l'argument est un objet, les propriétés portant le nom de chacune des propriétés de l'objet seront récupérées
				// @arg[N]: =@arg[0]
				// @return: {Array}, un tableau de n entrées, n étant le nombre de propiétés dans le tableau lors de l'appel
				// @return.context : le tableau dynamique utilisé lors de l'appelle de cette fonction
				// Version : 1.2 22/05/2018
				// Version 1.0 => 1.1: Prise en charge de la note de rapidité n°6 et n°11
				// Version 1.1 => 1.2: Prise en charge d'ES6, refont de la fonction en améliorant les fonctionnalités (Backward compatible).
				
					Dom["get" + name] = function(domList) {
						const	argLength 	= arguments.length,
								data 		= [];
								data.context= domList;
						
						for(let i = 0, length = domList.length; i < length; i++) {
							const 	elem = domList[i],
									elemProp = {};
							let 	singleValue = argLength == 2,
									singleName;
							
							for(let y = 1; y < argLength; y++) {
								const prop = arguments[y];
								
								if(prop instanceof Array) {
									const 	propLength = prop.length;
											singleValue &= propLength == 1;
									
									for(let z = 0; z < propLength; z++) {
										elemProp[prop[z]] = getFct(elem, prop[z]);
										singleName = prop[z];
									}
								}
								else if(typeof prop == "string") {
									elemProp[prop] = getFct(elem, prop);
									singleName = prop;
								}
							}
							
							data[data.length] = singleValue ? elemProp[singleName] : elemProp;
						}
						
						return domList.length == 1 ? data[0] : data;
					};
				
				/***** FIN Fonction get *****/
				
				
				/***** Fonction remove *****/
				// Cette fonction permet la création des fonctios permettant la sélection et suppression de propriétés sr des éléments dom
				// @arg[0]: {String|Object}, 	Si l'argument est une chaine de caractère, la propriété ainsi nommée sera récupérée;
				//								Si l'argument est un objet, les propriétés portant le nom de chacune des propriétés de l'objet seront récupérées
				// @arg[N]: =@arg[0]
				// @return: {Array}, un tableau de n entrées, n étant le nombre de propiétés dans le tableau lors de l'appel
				// @return.context : le tableau dynamique utilisé lors de l'appelle de cette fonction. Cette propriété est ajoutée quelle que soit la valeur de @arg[N-2]
				// Version : 1.2 22/05/2018
				// Version 1.0 => 1.1: Prise en charge de la note de rapidité n°6 et n°11
				// Version 1.1 => 1.2: Prise en charge d'ES6, refont de la fonction en améliorant les fonctionnalités (Backward compatible).
				
					Dom["remove" + name] = function(...arg) {
						const 	argLength = arg.length,
								domList = arg[0];
						
						if(typeof arg[argLength - 1] == "boolean" && arg[argLength - 1]) {
							var value = Dom["get" + name].apply(this, arguments);
						}
						
						for(let i = 0, length = domList.length; i < length; i++) {
							const elem = domList[i];
							
							for(let y = 1; y < argLength; y++) {
								const prop = arg[y];
								
								if(prop instanceof Array) {
									for(let z = 0, propLength = prop.length; z < propLength; z++) {
										rmFct(elem, prop[z]);
									}
								}
								else if(typeof prop == "string") {
									rmFct(elem, prop);
								}
							}
						}
						
						return value || arg[0];
					};
				
				/***** FIN Fonction remove *****/
			};
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: AttributeMethods
		 * @version: 1.0
		 * @dependencies: [{ "name" : "CreateMethods", "version" : ">= 1.0" }]
		*/
		
			const attr = Dom.createMethods(
				"Attribute",
				(elem, name, value) => elem.setAttribute(name, value),
				(elem, name) => elem.getAttribute(name),
				(elem, name) => elem.removeAttribute(name)
			);
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: ValueMethods
		 * @version: 1.0
		 * @dependencies: [{ "name" : "CreateMethods", "version" : ">= 1.0" }]
		*/
	
			const value = Dom.createMethods(
				"Value",
				(elem, name, value) => elem[name] = value,
				(elem, name) => elem[name],
				(elem, name) => {
					elem[name] = "";	// For attribute support as "id"
					delete elem[name];	// For others properties
				}
			);
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: DataMethods
		 * @version: 1.0
		 * @dependencies: [{ "name" : "CreateMethods", "version" : ">= 1.0" }]
		*/
		
			const data = Dom.createMethods(
				"Data",
				(elem, name, value) => elem.dataset && (elem.dataset[name] = value),
				(elem, name) => elem.dataset ? elem.dataset[name] : undefined,
				(elem, name) => elem.dataset && (delete elem.dataset[name])
			);
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: StyleMethods
		 * @version: 1.0
		 * @dependencies: [{ "name" : "CreateMethods", "version" : ">= 1.0" }]
		*/
		
			const style = Dom.createMethods(
				"Style",
				(elem, name, value) => elem.style[name] = value,
				(elem, name) => getComputedStyle(elem)[name],
				(elem, name) => {
					elem.style[name] = null;	// To delete, obsolete, compatibility support
					elem.style.removeProperty(name);
				}
			);
		
		/***** END FRAGMENT *****/
		
	/***** FIN Gestion d'ajouts, de suppression, de récupération ou de changement des propriété data, "value", style et attribute *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: CreateHandlingMethods
	 * @version: 1.0
	*/
	
		Dom.createHandlingMethods = function(name, property, defaultValue) {
			Dom["set" + name] = function(domList, value) {
				value = typeof value == "undefined" ? defaultValue : value;
				
				for(let i = 0, length = domList.length; i < length; i++) {
					domList[i][property] = value;
				}
				
				return domList;
			};
			
			Dom["get" + name] = function(domList) {
				return domList.length ? domList[0][property] : undefined;
			};
			
			Dom["has" + name] = function(domList) {
				return domList.length ? !!domList[0][property] : undefined;
			};
		};
		
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: HandlingMethodsTextContent
	 * @version: 1.0
	*/
		
		Dom.createHandlingMethods("Content", "textContent", "");
		
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: HandlingMethodsValue
	 * @version: 1.0
	*/
	
		Dom.createHandlingMethods("Val", "value", "");
		
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: CreateShortMethods
	 * @version: 1.0
	*/
		
		Dom.createShortMethods = function(property, nameState1, state1, nameState2, state2, testName) {
			Dom[nameState1] = function(domList) {
				for(let i = 0, length = domList.length; i < length; i++) {
					domList[i][property] = state1;
				}
				
				return domList;
			};
			
			Dom[nameState2] = function(domList) {
				for(let i = 0, length = domList.length; i < length; i++) {
					domList[i][property] = state2;
				}
				
				return domList;
			};
			
			Dom[testName] = function(domList) {
				return domList.length ? !!domList[0][property] : undefined;
			};
		};
		
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: ShortMethodsDisabled
	 * @version: 1.0
	*/
		
		Dom.createShortMethods("disabled", "setEnabled", false, "setDisabled", true, "isEnabled");
		
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: ShortMethodsChecked
	 * @version: 1.0
	*/
		Dom.createShortMethods("checked", "setChecked", true, "setUnchecked", false, "isChecked");
		
	/***** END FRAGMENT *****/
	
	
	/***** Gestion des classes *****/
	
		/***** NEW FRAGMENT *****/
		/**
		 * @name: addClass
		 * @version: 1.0
		*/
		
			/***** Fonction addClass *****/
			// Cette fonction permet l'ajout de une ou plusieurs classes
			// @param[0] : {String}, La classe à ajouter
			// @param[N] : {String}, La Néme classe à ajouter
			// @return : {Array}, le tableau dynamique
			// Version : 1.2
			// Version 1.0 => 1.1 : Remplacement de match par indexOf pour gain de performance, Ajout des class en une seule fois pour éviter le recalcul successif du style
			// Version 1.1 => 1.2 : Refonte de la fonction pour utilisation de Element.classList, le précédent contenu à été transféré dans compatibility
			
				Dom.addClass = function(domList) {
					for(let i = domList.length; i--;) {
						if(domList[i].classList) {
							for(let y = 1, length = arguments.length; y < length; y++) {
								domList[i].classList.add(arguments[y]);
							}
						}
					}
					
					return this;
				};
			
			/***** FIN Fonction addClass *****/
			
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: removeClass
		 * @version: 1.0
		*/
		
			/***** Fonction removeClass *****/
			// Cette fonction permet de supprimer une ou plusieurs class d'un élément
			// @param[0] : {String}, la class à supprimer
			// @param[N] : {String}, la Néme class à supprimer
			// @return : {Array}, le tableau dynamique
			// Version 1.3
			// Version 1.0 => 1.1 : Si aucun paramètre n'est fournit, toute les classes sont surpprimées
			// Version 1.1 => 1.2 : La fonction trim est désormais appelée avant l'attribution de la class; la class est d'abord calculée puis affectée pour éviter le recalcul successif du style; correctif d'un bug, si la class était "ok oki" et que l'on souhaité supprimer la class "ok", "i" était obtenu au lieu de "oki"
			// Version 1.2 => 1.3 : Refonte de la fonction pour utilisation de Element.classList, le précédent contenu à été transféré dans compatibility
			
				Dom.removeClass = function(domList) {
					for(let i = domList.length; i--;) {
						if(domList[i].classList) {
							for(let y = 1, length = arguments.length; y < length; y++) {
								domList[i].classList.remove(arguments[y]);
							}
						}
					}
					
					return this;
				};
			
			/***** FIN Fonction removeClass *****/
			
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: changeClass
		 * @version: 1.0
		*/
		
			/***** Fonction changeClass *****/
			// Cette fonction permet d'ajouter ou de supprimer une class d'un élément : si la class demander est déjà présente dans l'élément, elle sera supprimé sinon elle sera ajouté
			// @param[0] : {String}, la class à ajouter ou à supprimer
			// @param[N] : {String}, la Néme class à ajouter ou supprimer
			// @return : {Array}, le tableau dynamique
			// Version : 1.2
			// Version 1.0 => 1.1 : Correction d'un bug sur indexOf.call car Array.prototype.indexOf != String.prototype.indexOf
			// Version 1.1 => 1.2 : Refonte de la fonction pour utilisation de Element.classList, le précédent contenu à été transféré dans compatibility
			
				Dom.changeClass = function(domList) {
					for(let i = domList.length; i--;) {
						if(domList[i].classList) {
							for(let y = 1, length = arguments.length; y < length; y++) {
								domList[i].classList.toggle(arguments[y]);
							}
						}
					}
					
					return this;
				};
			
			/***** FIN fonction changeClass *****/
		
		/***** END FRAGMENT *****/
		
	/***** FIN Gestion des classes *****/
	
	
	/***** Fonction lié à la modification de l'élément *****/
		
		const setEvent =
			Dynamique && Dynamique.module.Event ?
				Dynamique.module.Event.setEvent
			:
			function(elem, event) {
				for(let y in event) {
					if(event.hasOwnProperty(y)) {
						const act = event[y];
						
						if(toString.call(act) == "[object Array]") {
							for(let i = 0, length = act.length; i < length; i++) {
								elem[0].addEventListener(type, act[i], false);	
							}
						}
						else {
							elem[0].addEventListener(type, act, false);
						}
					}
				}
			};
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: createText
		 * @version: 1.0
		*/
		
			/***** Fonction createText *****/
			
				Dom.createText = function() {
					const argLength = arguments.length;
					
					for(let i = 0; i < argLength; i++) {
						this[this.length] = document.createTextNode(arguments[i]);
					}
					
					return this;
				};
			
			/***** FIN Fonction createText *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: createElement
		 * @version: 1.0
		*/
		
			/***** Fonction createElement *****/
			// Cette fonction permet la création d'élément(s) de quatre maniéres différentes en fonction du type d'argument fournit
			// Pour les N arguments donnée :
			// 		- Si l'argument est une chaine de caractère : un élément portant comme tagName cette chaine sera créé
			// 		- Si l'argument est un tableau :
			//				- Si l'entrée actuel est une chaine de caractère : un éléments sera créé et portera comme tagName la chaine de l'entrée en question
			//				- Si l'entrée est un object (Array|Object) : createElement est rappellé
			//				- Sinon abondon de l'entrée
			//		- Si l'argument est un objet : un élément DOM ayant pour tagName la valeur de la propriété tagName de cet objet est créé et étendu des propriétés de cet objet
			//		- Si l'argument est un élément dom, si le dernier argument est un type boolean, il indique si les éléments dom doivent être copié ou non lors de leur insertion
			// 		- Dans tout les autres cas rien n'est fait
			// @arg[last] 	: {String|Boolean}:facultatif
			//					=> Si {Boolean}: identique à @arg[last-1]
			//					=> Si {String}: indique quel est le nom de la propriété à utiliser afin de créer une map ou le nom de l'élément = un tableau de longueur 1 contenant l'élement étendue des propriétés de Dynamique si présent dans le document et des fonctionnalités DOM
			// @arg[last-1] : {Boolean}:facultatif sauf si @arg[last] utilisé, indique, lorsque des éléments dom sont passés à la fonction, si ceux-ci doivent être copié ou non
			// @return : {Object}, retourne un objet tel que :
			//					=> "map": {Object}, contient l'association des éléments en fonction de @arg[Last]
			//					=> "list": {NodeArray}, liste de tous les éléments créés (au plus haut niveau, les enfants éventuellement créés ne sont pas présent)
			//					=> "wanted": {Object|Array}, est le format que l'utilisateur souhaite utilisé (= "map" ou "list")
			//					=> "type": {Boolean}, indique si l'utilisateur souhaite récupérer une map ou un tableau
			// NOTE : Dans un soucis de simplicité et pour éviter les createElement.apply|call la totalité des arguments est considéré dans arguments[0]
			// NOTE : La fonction prend en charge saveEvent
			// Version : 1.3
			// Version : 1.0 => 1.1 : Auparavant, lorsque des enfants étaient précisé (propriété "children"), ces-derniers étaient copiés et perdaient donc certaines propriétés (événements notamment), dorénavant, ils sont directement inséré et non copié
			// Version : 1.1 => 1.2 : Ajout du cas où l'élément est un documentFragment (nodeType == 11)
			// Version : 1.2 => 1.3 : Il est désormais possible de choisir si les enfants doivent être copié ou sélectionné tel quel lorsqu'un élément du dom est fourni en valeur de children
			
			const createElement = function(argument) {
					let		length = argument.length,
							isCopy = false,
							mapStr = false;
					const	doc = document.createDocumentFragment(),
							map = {},
							typeLast = typeof argument[length - 1];
					
					if(typeLast == "boolean") {
						isCopy = !!argument[--length];
					}
					else if(typeLast == "string" && typeof argument[length - 2] == "boolean") {
						mapStr = argument[--length];
						isCopy = !!argument[--length];
					}
					
					for(let i = 0; i < length; i++) {
						createElementObject(doc, argument[i], isCopy, map, mapStr);
					}
					
					const list = slice.call(doc.childNodes);
					
					if(mapStr) {
						for(let z in map) {
							if(map.hasOwnProperty(z)) {
								list[z + "Elem"] = map[z + "Elem"] = map[z];
								list[z] = map[z] = Dynamique ? Dynamique(map[z]) : map[z];
							}
						}
					}
					
					return {
						list : list,
						map : map,
						doc : doc
					};
				},
				
			/***** FIN Fonction createElement *****/
			
			/***** Fonction createElementObject *****/
				
				createElementObject = function(doc, elem, isCopy, map, mapStr) {
					const type = toString.call(elem);
					
					if(type == "[object String]") {						// Si l'argument est une chaine de caractére
						doc.appendChild(document.createElement(elem));	// Création et ajout d'un élément au fragment portant comme tagName la chaine spécifié
					}
					else if(type.match("HTML|Element|DocumentFragment")) {
						doc.appendChild((elem.nodeType != Node.DOCUMENT_FRAGMENT_NODE && isCopy) ? elem.cloneNode(true) : elem);
					}
					else if(type == "[object Text]") {
						doc.appendChild(isCopy ? elem.cloneNode(true) : elem);
					}
					else if(type == "[object Array]") {
						const arrayLength = elem.length;
						
						for(let z = 0; z < arrayLength; z++) {
							if(typeof elem[z] == "string") {
								doc.appendChild(document.createElement(elem[z]));
							}
							else {
								createElementObject(doc, elem[z], isCopy, map, mapStr);
							}
						}
					}
					else if(elem) {
						let newElem;
						
						if(elem.nodeType == Node.TEXT_NODE) {
							newElem = document.createTextNode(elem.textContent || "");
							
							for(let z in elem) {
								if(elem.hasOwnProperty(z) && z != "nodeType" && z != "textContent") {
									newElem[z] = elem[z];
								}
							}
							
							if(mapStr && elem[mapStr]) {
								map[elem[mapStr]] = newElem;
								
								delete elem[mapStr];
							}
						}
						else {
							let hasChild = false;
							newElem = document.createElement(elem.tagName);
							
							if(mapStr && elem[mapStr]) {
								map[elem[mapStr]] = newElem;
								
								delete elem[mapStr];
							}
							
							for(let z in elem) {
								if(elem.hasOwnProperty(z)) {
									if(z == "children" || z == "childNodes") {
										if(!hasChild) {
											const 	target = elem.children || elem.childNodes,
													final = toString.call(target) == "[object Array]" ? target : [target],
													length = final.length;
											
											for(let i = 0; i < length; i++) {
												createElementObject(newElem, final[i], isCopy, map, mapStr);
											}
											
											hasChild = true;
										}
									}
									else if(z == "style" || z == "dataset") {
										const target = elem[z];
										
										for(let y in target) {
											if(target.hasOwnProperty(y)) {
												newElem[z][y] = target[y];
											}
										}
									}
									else if(z == "event") {
										setEvent([newElem], elem.event);
									}
									else if(z == "attributes") {
										const attr = elem.attributes;
										
										for(let y in attr) {
											if(attr.hasOwnProperty(y)) {
												newElem.setAttribute(y, attr[y]);
											}
										}
									}
									else if(z != "tagName") {
										newElem[z] = elem[z];
									}
								}
							}
						}
						
						doc.appendChild(newElem);
					}
				};
			
			/***** FIN Fonction createElementObject *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: createElementDyna
		 * @version: 1.0
		 * @dependencies: [{ "name" : "createElement", "version" : ">= 1.0" }]
		*/
		
			/***** Fonction createElementDyna *****/
			// Cette fonction est la même que createElement mais adapté pour être ajoutable en temps que plugin au tableau dynamique
			// @param : Même argument que la fonction createElement
			// @return : Le tableau dynamique utilisé
			// Version : 1.2
			// Version : 1.0 => 1.1, Prise en charge de la note de rapidité n°13
			// Version : 1.1 => 1.2, Si le dernier argument est un boolean, celui-ci indique si c'est l'élement nouvellement créé ou si c'est le tableau dynamique qui doit être retourné
			
			const createElementDyna = function() {
					const 	newElem = createElement(arguments),
							map = newElem.map,
							elem = newElem.list;
					
					for(let i = 0, length = elem.length; i < length; i++) {
						this[this.length] = elem[i];
					}
					
					for(let z in map) {
						if(map.hasOwnProperty(z)) {
							this[z] = map[z];
						}
					}
					
					return this;
				};
			
			/***** FIN Fonction createElementDyna *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: removeElement
		 * @version: 1.0
		*/
		
			/***** Fonction removeElement *****/
			// Cette fonction permet de supprimer les éléments sélectionnés
			// @param : none
			// @return : {Array}, le tableau dynamique
			// Version : 1.0
			
				Dom.removeElement = function(domList) {
					let i = domList.length;
					
					while(i--) {
						if(domList[i].parentNode) {
							domList[i].parentNode.removeChild(domList[i]);
						}
					}
					
					return this;
				};
			
			/***** FIN Fonction removeElement *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: copyElement
		 * @version: 1.0
		*/
		
			/***** Fonction copyElement *****/
			// Cette fonction copie les éléments présents dans le tableau et leur copie remplace les originaux dans le tableau
			// @param[0]: {Boolean:false}, indique si la copy doit être faite en profondeur (des liens entre l'élément cible et la copie peuvent alors existé : la modification d'un entraine la modification de l'autre)
			// @return: {Array}, le tableau dynamique
			// Version: 1.1 - 23/01/2018
			// Version 1.0 - 24/01/2015 => 1.1: Prise en charge ES6
			
				Dom.copyElement = function(domList, deep) {
					let i = domList.length;
					
					while(i--) {
						domList[i] = domList[i].cloneNode(!deep);
					}
					
					return this;
				};
			
			/***** FIN fonction copyElement *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: replaceElement
		 * @version: 1.0
		*/
		
			/***** Fonction replaceElement *****/
			// Cette fonction permet de remplacer un élément par un block d'élément
			// Son fonctionnement est la même que la fonction createElement sauf pour le dernier arguments,
			// si ce dernier est un boolean égal à true, c'est l'élément remplacé qui est retourné sinon c'est l'élément utilisé pour le remplacement qui est retourné
			// @return : {Array}, le tableau dynamique
			// Version : 1.0
			// Prise en charge de la note de rapidité n°11
			// Ajouter: lorsque les capacités à utiliser un nom pour la création d'élément est exploité, celle-ci doit être retourné par replaceElement
			// => Bug pour l'instant: Dynamique("body").replaceElement({ tagName : "a", _name : "ok" }, { tagName : "b", _name : "ok" }, { tagName : "c", _name : "ok" }, true, "_name"); doit retourner un objet avec chaque élément vis-à-vis du _name
			
				Dom.replaceElement = function(domList) {
					const 	last = arguments[arguments.length - 1],
							ret = typeof last == "boolean" && last,
							arg = slice.call(arguments, 1, arguments.length - ret),
							save = [];
					let		savePos = 0;
					
					for(let i = 0, length = domList.length; i < length; i++) {
						const 	child = createElement(arg).list;	// Crée une copie, à enlever ?
						let		childLength = child.length;
						
						if(ret) {
							for(let y = 0; y < childLength; y++) {
								save[savePos++] = child[y];
							}
						}
						
						childLength--;
						for(let y = 0; y < childLength; y++) {
							this[i].parentNode.insertBefore(child[y], domList[i]);
						}
						
						this[i].parentNode.replaceChild(child[childLength], domList[i]);
					}
					
					if(ret) {
						domList.length = 0;
						
						while(savePos--) {
							domList[savePos] = save[savePos];
						}
					}
					
					return this;
				};
			
			/***** FIN Fonction replaceElement *****/
		
		/***** END FRAGMENT *****/
	
	/***** FIN Fonction lié à la modification de l'élément *****/
	
	
	/***** Fonction lié au parent de l'élément *****/
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: createElementDyna
		 * @version: 1.0
		 * @dependencies: [{ "name" : "createElement", "version" : ">= 1.0" }]
		*/
		
			/***** Fonction createParent *****/
			// Crée un parent comun à tous les éléments du tableau donné
			// @param[0] : Même fonctionnement que la fonction createElement
			// @param[1] : {Boolean}, indique si le ou les éléments retournés doivent être le parent nouvellement créé (TRUE) ou les éléments utilisés lors de la création du parent (FALSE)
			// Version : 1.0
			
				Dom.createParent = function(domList, newParent, ret) {
					const parent = createElement([newParent]).list[0];
					
					for(let i = 0, length = domList.length; i < length; i++) {
						parent.appendChild(domList[i]);
					}
					
					if(ret) {
						domList.length = 0;
						domList[0] = parent;
					}
					
					return this;
				};
				
			/***** FIN Fonction createParent *****/
			
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: createParentAll
		 * @version: 1.0
		 * @dependencies: [{ "name" : "createElement", "version" : ">= 1.0" }]
		*/
		
			/***** Fonction createParentAll *****/
			// Cette fonction permet de créer un parent aux éléments sélectionnés. Si deux éléments ont le même parent, un seul parent sera créé pour les deux
			// @param[0] : Meme fonctionnement que la fonction createElement
			// @param[1] : {Boolean}, indique si l'élément parent qui à été créé doit être retourné
			// Version : 1.0
			// NOTE : prise en charge de la note de rapidité n°6 et n°11
			
				Dom.createParentAll = function(domList, newParent, ret) {
					const 	createParent = [],
							parent = [];
					
					newParent = [newParent];
					for(let i = 0, length = domList.length; i < length; i++) {
						const	target = domList[i],
								index = indexOf.call(parent, target.parentNode);
						
						if(index == -1) {
							const 	elemReplace = createParent[createParent.length] = createElement([newParent]).list[0],
									parentNode = parent[parent.length] = target.parentNode;
							
							elemReplace.appendChild(target);
							parentNode.insertBefore(elemReplace, target.nextSibling);
						}
						else {
							createParent[index].appendChild(target);
						}
					}
					
					if(ret) {
						domList.length = 0;
						
						while(i--) {
							domList[i] = createParent[i];
						}
					}
					
					return this;
				};
			
			/***** FIN Fonction createParentAll *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: createParentAll
		 * @version: 1.0
		 * @dependencies: [{ "name" : "createElement", "version" : ">= 1.0" }]
		*/
		
			/***** Fonction removeParent *****/
			// Supprime le parent de chaque élément du tableau fourni
			// @param : {Boolean}, Indique si les éléments supprimé doivent être sauvegardé dans le tableau dynamique fournit lors de l'appel de la fonction
			// @return : {Array}, le tableau dynamique
			// Version : 1.0
			// Prise en charge de la note de rapidité n°11
			
				Dom.removeParent = function(domList, ret) {
					const 	target = [];
					let		savePos = 0;
					
					for(let i = 0, length = domList.length; i < length; i++) {
						if(domList[i].parentNode && indexOf.call(target, domList[i].parentNode) == -1) {
							target[i] = domList[i].parentNode;
						}
					}
					
					for(let i = 0, length = target.length; i < length; i++) {
						const	child = target[i].childNodes,
								doc = document.createDocumentFragment();
						
						while(child.length) {
							doc.appendChild(child[child.length - 1]);
						}
						
						target[i].parentNode.replaceChild(doc, target[i]);
					}
					
					if(ret) {
						domList.length = 0;
						
						for(let i = 0, length = target.length; i < length; i++) {
							domList[i] = target[i];
						}
					}
					
					return this;
				};
			
			/***** FIN Fonction removeParent *****/
		
		/***** END FRAGMENT *****/
		
	/***** FIN Fonction lié au parent de l'élément *****/
	
	
	/***** Fonction lié aux à l'élément suivant ou précédent *****/
	
		/***** NEW FRAGMENT *****/
		/**
		 * @name: createElementAfterBefore
		 * @version: 1.0
		*/
		
			/***** Fonction createElementAfterBefore *****/
			// Cette fonction permet d'ajouter n enfants après ou avant les éléments donnés, elle à été créé pour évité d'avoir un copier coller d'une fonction
			// car elle sera utilisé par createElementAtfer et createElementBefore
			// @param : {Array}, le tableau dynamique
			// @param : {String}, nom de la propriété permettant de récupérer la cible de l'action
			// @param : {Array}, les arguments donné par l'utilisateur
			// @paramUser[0] : le premier élément à rajouter avant ou après l'élément, même fontionnement que la fonction createElement
			// @paramUser[N] : le n-éme élément à rajouter avant ou après l'élément, même fonctionnement que la fonction createElement
			// @paramUser[Last] : {Boolean}, indique quel sont les éléments qui doivent être retourné, si égal true, ce sont les éléments rajouté qui seront retournés
			
				const createElementAfterBefore = function(from) {
					return function(domList) {
						const 	last = arguments[arguments.length - 1],
								ret = typeof last == "boolean" && last,
								arg = slice.call(arguments, 1, arguments.length - ret),
								save = [];
						let		savePos = 0;
						
						for(let i = 0, length = domList.length; i < length; i++) {
							const newElem = createElement(arg).doc;
							
							if(ret) {
								const child = newElem.childNodes;
								for(let y = 0, childLength = child.length; y < childLength; y++) {
									save[savePos++] = child[y];
								}
							}
							
							domList[i].parentNode.insertBefore(newElem, domList[i][from]);
						}
						
						if(ret) {
							while(savePos--) {
								domList[savePos] = save[savePos];
							}
						}
						
						return this;
					};
				};
			
			/***** FIN Fonction createElementAfterBefore *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: createElementAfter
		 * @version: 1.0
		 * @dependencies: [{ "name" : "createElementAfterBefore", "version" : ">= 1.0" }]
		*/
		
			Dom.createElementAfter  = createElementAfterBefore("nextSibling");
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: createElementBefore
		 * @version: 1.0
		 * @dependencies: [{ "name" : "createElementAfterBefore", "version" : ">= 1.0" }]
		*/
		
			Dom.createElementBefore = createElementAfterBefore("previousSibling");
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: removeElementAfterBefore
		 * @version: 1.0
		*/
		
			/***** Fonction removeElementAfterBefore *****/
			// Cette fonction permet la mise en place des fonctions de suppressions de l'élément suivant ou précédents les éléments concernés
			// @param : {Array}, les éléments sur lesquels la fonction doit agir
			// @param : {String}, nom de la propriété permettant la récupération de l'élément concerné
			// @param : {Array}, les arguments fournit par l'utilisateur
			// @return : @param[0]
			// @paramUser[0] : {Boolean}, indique quels éléments doivent être retournés, si égal true, ce sontles éléments supprimé qui seront retourné
			// Prise en charge de la note de rapidité n°11
			
				const removeElementAfterBefore = function(from) {
					return function(domList, ret) {
						const 	save = [];
						let 	savePos = 0;
						
						for(let i = 0, length = domList.length; i < length; i++) {
							const target = domList[i][from];
							
							if(target) {
								save[savePos++] = target;
								
								domList[i].parentNode.removeChild(target);
							}
						}
						
						if(ret) {
							domList.length = 0;
							
							while(savePos--) {
								domList[savePos] = save[savePos];
							}
						}
						
						return this;
					};
				};
			
			/***** FIN Fonction removeElementAfterBefore *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: removeElementAfter
		 * @version: 1.0
		 * @dependencies: [{ "name" : "removeElementAfterBefore", "version" : ">= 1.0" }]
		*/
		
			Dom.removeElementAfter  = removeElementAfterBefore("nextSibling");
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: removeElementBefore
		 * @version: 1.0
		 * @dependencies: [{ "name" : "removeElementAfterBefore", "version" : ">= 1.0" }]
		*/
		
			Dom.removeElementBefore = removeElementAfterBefore("previousSibling");
		
		/***** END FRAGMENT *****/
	
	
	/***** Fonction lié au éléments enfants *****/
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: createChild
		 * @version: 1.0
		 * @dependencies: [{ "name" : "createElement", "version" : ">= 1.0" }]
		*/
		
			/***** Fonction createChild *****/
			// Cette fonction permet la création d'un ou plusieurs enfants dans les éléments sélectionnés
			// @param[0] : {Number}:facultatif(-1), indique la position que doit prendre le premier élément à créer, les autres sont inséré à la suite, un nombre négatif indique que l'insertion se fait de la longueur du tableau moins cette valeur, 0 indique que les enfant doivent être insérer en premier
			// @param[N] : {Object|String}, Les arguments de 1 et suivants permettent la création des enfants, ils sont passés à la fonction createElement
			// @param[N-1] : {Boolean}, indique si les nouveaux enfants créés doivent être retournés (true) ou non (false)
			// @return : {Array}, le tableau dynamique contenant soir les nouveaux enfants créé, soit les éléments parent des nouveaux enfants
			// Version : 1.3 - 19/12/2017
			// Version : 1.0 => 1.1, prise en charge de la note de rapidité n°13
			// Version : 1.1 => 1.2, le premier argument est désormais un nombre positif ou négatif
			// Version : 1.2 => 1.3, le premier argument est désormais facultatif, si abscent, les enfants seront ajoutés à la fin des parents désignés
			
				Dom.createChild = function(pos) {
					const 	argLength = arguments.length,
							save = [],
							posType = typeof pos == "number",
							last = arguments[argLength - 1],
							parite = typeof last == "boolean",
							applySave = parite && last,
							arg = slice.call(arguments, posType * 1, argLength - parite);
					
					if(!posType) {
						pos = -1;
					}
						
					let savePos = 0;
					for(let i = 0, length = this.length; i < length; i++) {
						const 	elem = createElement(arg),
								map = elem.map,
								child = elem.list;
						
						if(applySave) {
							for(let y = 0, childLength = child.length; y < childLength; y++) {
								save[savePos++] = child[y];
							}
						}
						
						for(let z in map) {
							if(map.hasOwnProperty(z)) {
								this[z] = map[z];
							}
						}
						
						this[i].insertBefore(elem.doc, this[i].childNodes[pos < 0 ? this[i].childNodes.length + pos + 1 : pos] || null); // || null pour IE
					}
					
					if(applySave) {
						while(savePos--) {
							this[savePos] = save[savePos];
						}
					}
					
					return this;
				};
			
			/***** FIN Fonction createChild *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: removeChild
		 * @version: 1.0
		*/
		
			/***** Fonction removeChild *****/
			// Cette fonction permet la supression des enfants des éléments en fonction de N interval donné
			// @param[N] :	{Number}, Le début du Néme intervalle dont les éléments doivent être supprimé
			// @param[N+1] : {Number}, La fin du Néme intervalle commencé en @param[N]
			// @param[N-1] : {Boolean}, indique si les éléments supprimé doivent être retournés
			// @return : {Array}, contexte englobant
			// Version : 1.1
			// Version 1.0 => 1.1 : Il n'est plus nécessaire de donner les arguments [0, Infinity] pour supprimer tout les fils, le fait de ne pas fournir d'argument suffit dorénavant
			
				Dom.removeChild = function() {
					const	realArg = arguments.length ? arguments : [0],	// Nécessaire car les valeurs par défaut ne modifie par arguments
							last = realArg[realArg.length - 1],
							ret = typeof last == "boolean" && last,
							save = [];
					
					let i = this.length,
						arg = slice.call(realArg, 0, realArg.length - ret),
						argLength = arg.length,
						savePos = 0;
					
					while(i--) {
						const	elem = this[i],
								child = elem.childNodes;
						let		remove = 0;
						
						B:for(let y = 0; y < child.length; y++) {
							for(let z = 0; z < argLength; z += 2) {
								const 	pos = y + remove,
										start = arg[z] < 0 ? child.length + arg[z] : arg[z],
										end = arg[z+1] < 0 ? child.length + arg[z+1] : (arg[z+1] || Infinity);
								
								if(pos >= start && pos < end) {
									save[savePos++] = elem.removeChild(child[y]);
									remove++;
									y--;
									
									continue B;
								}
							}
						}
					}
					
					if(ret) {
						this.length = 0;
						
						while(savePos--) {
							this[savePos] = save[savePos];
						}
					}
					
					return this;
				};
			
			/***** FIN Fonction removeChild *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: sortChild
		 * @version: 1.0
		*/
		
			/***** Fonction sortChild *****/
			// Cette fonction permet de trier les enfants d'un élément
			// @param[0] : {Function}, la fonction à utiliser pour le tri
			// @return : {Array}, le tableau dynamique
			
				Dom.sortChild = function(domList, fct) {
					for(let i = 0, length = domList.length; i < length; i++) {
						const 	child = domList[i].childNodes,
								doc = document.createDocumentFragment(),	// On peut utiliser un documentFragment car les éléments ne sont pas cloné
								save = slice.call(child).sort(fct);
						
						for(let y = 0, length = save.length; y < length; y++) {
							doc.appendChild(save[y]);
						}
						
						domList[i].appendChild(doc);
					}
					
					return this;
				};
			
			/***** FIN Fonction sortChild *****/
		
		/***** END FRAGMENT *****/
		
	/***** FIN Fonction lié aux éléments enfants *****/
	
	
	/***** Fonction d'insertion et de déplacement *****/
	
		/***** NEW FRAGMENT *****/
		/**
		 * @name: insert
		 * @version: 1.0
		*/
		
			const insert = function(elem, target, target2, hierar = false) {
				const documentElement = document.createDocumentFragment();
				
				for(let i = 0, length = elem.length; i < length; i++) {
					documentElement.appendChild(elem[i]);
				}
				
				let parent = (target2 || target);
				
				if(!hierar) {
					parent = parent.parentNode;
				}
				else {
					target = null;
				}
				
				parent.insertBefore(documentElement, target);
				
				return elem;
			};
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: insertBefore
		 * @version: 1.0
		 * @dependencies: [{ "name" : "insert", "version" : ">= 1.0" }]
		*/
		
			Dom.insertBefore = function(domList, target) {
				return insert(domList, (target instanceof Array) ? target[0] : target);
			};
			
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: insertAfter
		 * @version: 1.0
		 * @dependencies: [{ "name" : "insert", "version" : ">= 1.0" }]
		*/
		
			Dom.insertAfter = function(domList, target) {
				target = (target instanceof Array) ? target[0] : target;
				
				return insert(domList, target.nextSibling, target);
			};
			
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: insertLast
		 * @version: 1.0
		 * @dependencies: [{ "name" : "insert", "version" : ">= 1.0" }]
		*/
		
			Dom.insertLast = function(domList, target) {
				return insert(domList, (target instanceof Array) ? target[0] : target, null, true);
			};
			
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: insertFirst
		 * @version: 1.0
		 * @dependencies: [{ "name" : "insert", "version" : ">= 1.0" }]
		*/
		
			Dom.insertFirst = function(domList, target) {
				target = (target instanceof Array) ? target[0] : target;
				
				return target.childNodes && target.childNodes[0] ? insert(domList, target.childNodes[0]) : Dom.insertLast(domList, target);
			};
			
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: insertAt
		 * @version: 1.0
		 * @dependencies: [{ "name" : "insert", "version" : ">= 1.0" }]
		*/
		
			Dom.insertAt = function(domList, target, pos, childNodes) {
				target = ((target instanceof Array) ? target[0] : target);
				
				return insert(domList, pos == -1 ? target : target[childNodes ? "childNodes" : "children"][pos], false, pos == -1);
			};
			
		/***** END FRAGMENT *****/
	
	/***** FIN Fonction d'insertion et de déplacement *****/
	
	
	/***** Fonction permettant la navigation dans les éléments DOM *****/
	// Les fonctions ci-dessous permettent de sélectionner les éléments parent, enfant, précédent ou suivant des éléments fournies
	// Contrairement à la fonction selector de Selector.js, ces fonctions modifie le tableau fournie pour sélectionner les éléments
	// Si l'on souhaite créer une copie dans un nouveau tableau, utiliser la fonction save de Dynamique.js ou selector de Selector.js
	
		/***** NEW FRAGMENT *****/
		/**
		 * @name: selectParent
		 * @version: 1.0
		*/
		
			/***** Fonction selectParent *****/
			// Cette fonction permet de sélectionner les éléments parents des éléments présent dans le tableau this fourni
			// @param[0] : {Boolean}, indique si les éléments doublons doivent être supprimés ou non, par défaut oui
			// @return : {Array}, le tableau d'élément dom fourni contenant les parents trouvés
			// Version : 1.0
			
				Dom.selectParent = function(domList, eraseMultiple = true) {
					const 	ret = [];
					let		pos = 0;
					
					for(let i = 0, length = domList.length; i < length; i++) {
						const parent = domList[i].parentNode;
						
						if(parent) {
							let valid = true;
							
							if(eraseMultiple) {
								for(let y = 0; y < pos; y++) {
									if(ret[y] == parent) {
										valid = false;
										break;
									}
								}
							}
							
							if(valid) {
								ret[pos++] = parent;
							}
						}
					}
					
					domList.length = 0;
					
					while(pos--) {
						domList[pos] = ret[pos];
					}
					
					return this;
				};
			
			/***** FIN Fonction selectParent *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: selectChild
		 * @version: 1.0
		*/
		
			/***** Fonction selectChild *****/
			// Cette fonction sélectionne les enfants des éléments fournie
			// @param[0] : {Boolean}, indique si les enfants doivent inclure les childnodes ou non
			// @return : le tableau fourni une fois rempli des enfants
			// Version : 1.1 11/11/2017
			// Version 1.0 => 1.1 les enfant peuvent aintenant être soit les children soit les childnodes
			
				Dom.selectChild = function(domList, childnodes) {
					const 	ret = [],
							target = childnodes ? "childNodes" : "children";
					let		pos = 0;
					
					for(let i = 0, length = domList.length; i < length; i++) {
						const child = domList[i][target];
						
						for(let y = 0, childLength = child.length; y < childLength; y++) {
							ret[pos++] = child[y];
						}
					}
					
					domList.length = 0;
					
					while(pos--) {
						domList[pos] = ret[pos];
					}
					
					return this;
				};
			
			/***** FIN Fonction selectChild *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: selectChild
		 * @version: 1.0
		*/
		
			/***** Fonction selectPrevious *****/
			// Cette fonction sélectionne les éléments précédent des éléments founis
			// @param : NONE
			// @return : {Array}, le tableau une fois rempli
			// Version : 1.0
			
				Dom.selectPrevious = function(domList, childNodes) {
					const 	ret = [],
							prev = childNodes ? "previousSibling" : "previousElementSibling";
					let		pos = 0;
					
					for(let i = 0, length = domList.length; i < length; i++) {
						if(domList[i][prev]) {
							ret[pos++] = domList[i][prev];
						}
					}
					
					domList.length = 0;
					
					while(pos--) {
						domList[pos] = ret[pos];
					}
					
					return this;
				};
			
			/***** FIN Fonction selectPrevious *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: selectChild
		 * @version: 1.0
		*/
		
			/***** Fonction selectNext *****/
			// Cette fonction retourne les éléments suivants les éléments founis
			// @param : NONE
			// @return : {Array}, le tableau une fois rempli
			// Version : 1.0
			
				Dom.selectNext = function(domList, childNodes) {
					const 	ret = [],
							prev = childNodes ? "previousSibling" : "previousElementSibling";
					let		pos = 0;
					
					for(let i = 0, length = domList.length; i < length; i++) {
						if(domList[i][prev]) {
							ret[pos++] = domList[i][prev];
						}
					}
					
					domList.length = 0;
					
					while(pos--) {
						domList[pos] = ret[pos];
					}
					
					return this;
				};
			
			/***** Fonction selectNext *****/
	
		/***** END FRAGMENT *****/
		
	/***** FIN Fonction permettant la navigation dans les éléments DOM *****/
	
	
	if(window.Dynamique) {
		Dom.plugIn = {
			createElement 	: createElementDyna,
			createText 		: Dom.createText,
			
			removeElement 	: Dynamique.build(Dom.removeElement),
			copyElement 	: Dynamique.build(Dom.copyElement),
			replaceElement 	: Dynamique.build(Dom.replaceElement),
			
			createParent 	: Dynamique.build(Dom.createParent),
			createParentAll : Dynamique.build(Dom.createParentAll),
			removeParent 	: Dynamique.build(Dom.removeParent),
			
			createChild : Dom.createChild,
			removeChild : Dom.removeChild,
			sortChild 	: Dynamique.build(Dom.sortChild),
			
			createElementBefore : Dynamique.build(Dom.createElementBefore),
			createElementAfter  : Dynamique.build(Dom.createElementAfter),
			
			removeElementBefore : Dynamique.build(Dom.removeElementBefore),
			removeElementAfter  : Dynamique.build(Dom.removeElementAfter),
			
			insertFirst : Dynamique.build(Dom.insertFirst),
			insertLast 	: Dynamique.build(Dom.insertLast),
			insertBefore: Dynamique.build(Dom.insertBefore),
			insertAfter : Dynamique.build(Dom.insertAfter),
			insertAt 	: Dynamique.build(Dom.insertAt),
			
			selectParent 	: Dynamique.build(Dom.selectParent),
			selectChild 	: Dynamique.build(Dom.selectChild),
			selectPrevious 	: Dynamique.build(Dom.selectPrevious),
			selectNext 		: Dynamique.build(Dom.selectNext),
			
			setAttribute 	: Dynamique.build(Dom.setAttribute),
			getAttribute 	: Dynamique.build(Dom.getAttribute, true),
			removeAttribute : Dynamique.build(Dom.removeAttribute),
			
			setValue 	: Dynamique.build(Dom.setValue),
			getValue 	: Dynamique.build(Dom.getValue, true),
			removeValue : Dynamique.build(Dom.removeValue),
			
			setData 	: Dynamique.build(Dom.setData),
			getData 	: Dynamique.build(Dom.getData, true),
			removeData 	: Dynamique.build(Dom.removeData),
			
			setStyle 	: Dynamique.build(Dom.setStyle),
			getStyle 	: Dynamique.build(Dom.getStyle, true),
			removeStyle : Dynamique.build(Dom.removeStyle),
			
			addClass 	: Dynamique.build(Dom.addClass),
			removeClass : Dynamique.build(Dom.removeClass),
			changeClass : Dynamique.build(Dom.changeClass),
			
			setContent : Dynamique.build(Dom.setContent),
			getContent : Dynamique.build(Dom.getContent, true),
			hasContent : Dynamique.build(Dom.hasContent),
			
			setVal 	 : Dynamique.build(Dom.setVal),
			getVal 	 : Dynamique.build(Dom.getVal, true),
			hasValue : Dynamique.build(Dom.hasVal),
			
			setChecked 	 : Dynamique.build(Dom.setChecked),
			setUnchecked : Dynamique.build(Dom.setUnchecked),
			isChecked 	 : Dynamique.build(Dom.isChecked, true),
			
			setEnabled 	: Dynamique.build(Dom.setEnabled),
			setDisabled : Dynamique.build(Dom.setDisabled),
			isEnabled 	: Dynamique.build(Dom.isEnabled, true)
		};
		
		Dynamique.setDomCreator(function() {
			return createElement(arguments).list;
		});
		Dynamique.addModule("DOM", Dom);
		Dynamique.addPlugIn(Dom.plugIn);
	}
	else  {
		window.DOM = Dom;
	}
})();
