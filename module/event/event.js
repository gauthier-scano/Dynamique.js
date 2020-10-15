/******************************************************/
/******************     Event.js     ******************/
/**
 * Framework Dynamique.js
 * Docs/licence : https://www.dynamiquejs.fr
 * 
 * Description:
 * 		Le module Event.js se compose en partie des fonctionnalités qu'avait aupparavant le module DOM.js.
 * 		Il a été créé car la longueur du code dédié aux événements devenait trop important alors que de nouvelles
 * 		fontionnalités allaient en plus	être ajoutées.
 * 		Le module se découpe en 4 parties:
 * 			- 	Ajout d'événements: dédiée à l'ajout et la suppression d'événement pour un ensemble d'éléments Dom donné.
 * 				Cette partie ne prend plus en charge la compatibilité IE. Pour étendre la compatibilité,
 * 				il faudra utiliser compatibility.addEventListener.js du module Compatibility.
 * 			-	Evénements nommés: afin d'éviter à sauvegarder les fonctions d'événements côté code utilisateur.
 * 			- 	Délégation d'événements: le but étant d'optimiser les performances en réduisant le nom d'écouteur d'événement
 * 				sur le document en en utilisant qu'un seul puis de filtrer sur l'événement cible réel de l'événement.
 * 			-	Sauvegarde d'événements: une quatrième partie basée sur la sauvgarde d'événement, afin d'utiliser plusieurs fois une même fonction uniquement avec son nom.
 * 			-	Evénements sur des objets: premettant la création d'objet dont les méthodes permettant l'ajout, la suppression et le déclenchement d'événement est supporté.
 * 			-	Evénements simulés: permettant l'ajout comme événement natif d'événement simulé par JavaScript pour combler un manque d'événement natif.
 * 			-	Création d'événement comme plugIn (uniquement lorsque dynamique est dans le document).
 * 
 * Les événements précédement supportés par le plugIn et supprimés sont:
 * 		- onMouseOutMove: fired when mouse move outside a DOMElement
 * 		- onMouseInMove: fired when mouse move in a DOMElement (deprecated, used onMouseMove instead)
 *		- onMouseIn: replaced by JS Dynamique.build in event onMouseEnter
 *		- onMouseOut: used JS Dynamique.build in event instead
 * 
 * Amélioration:
 *  	- Ajouter les fonctions removeEventDelegation et callEventDelegation
 * 		- Résoudre bug pour les simulateEvent: lorsque qu'un événement utilise un objet d'option (comme pour les événements simulés par exemple), setEventByName ne sauvegarde pas ces options, ce qui empêche enabledEventByName d'être fonctionnelle
 * 		- Permettre l'enchainement d'événement ex: ["mousein", "click", "keydown"], fct => appel fct lorsque qu'un événement mousein, puis clique puis keydown survient
 * 
 * Internal Data:
 * @Name: Event
 * @Type: Parent
 * @Parent: ["Module"]
 * @UseAsParent: true
 * @Dependencies: []
 * @Version: 1.0
 */

"use strict";

(function() {
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: Base
	 * @version: 1.0
	*/
	
		/***** Fonction Event *****/
		// Utiliser comme objet contenant l'ensemble des méthodes du module
		// Ces méthodes sont ensuite encapsulées dans une fonction qui permet leur appel afin de les rendre compatinle avec les plugIn Dynamique
		// Même fonctionnement que la fonction Event.setEvent
		// Version: 1.0
		
			const Event = function() {
				return Event.setEvent.apply(this, arguments);
			};
		
		/***** FIN Fonction Event *****/
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: Extract
	 * @version: 1.0
	 * @dependencies: [{ "name" : "eventSave", "version" : ">= 1.0" }]
	*/
	
		/***** Fonctions générales ******/
			
			/***** Fonction strOnReplace *****/
			// Cette fonction est utilisé tel que String.replace(/^on| on/g, strOnReplace) afin de remplacé les "on" et les " on" par une chaine vide ("")
			// @param[0] : {String}, la chaine qui à déclenché l'appel de la fonction, à savoir "on" ou " on"
			// @return : {String} = "" || " ", la chaine qu'il faut utiliser pour remplacer le @param[0]
			// Version: 1.0
			
				const strOnReplace = function(trigger) {
					return trigger.length == 2 ? "" : " ";
				},
				
			/***** FIN Fonction strOnReplace *****/
			
			
			/***** Fonction extractArg *****/
			// Cette fonction extrait d'une liste d'arguments la liste des événements et les fonctions qui lui sont attachés ainsi que les options éventuels
			// Cette fonction est utilisé par toutes les fonctions qui attribuent des événements dans le module, son comportement est donc celui de setEvent, removeEvent, setEventByName et setEventDelagation
			// @param[0]: le tableau des paramètres peut avoir comme synthaxe:
			//		- [[...arg,] eventString, eventFct1[, ..., eventFctN][, capture]]
			//		- [[...arg,] eventString, eventFct1[, ..., eventFctN][, option]]
			//		- [[...arg,] objt1[, ..., objtN][, capture]]
			//		- [[...arg,] objt1[, ..., objtN][, hasOption, option]]
			//	Où:
			//		arg: sont des cases quelconques à ignorer grâce au paramètre @param[1]
			//		eventString: {String}, est une chaine définissant un ou plusieurs événements séparé par un espace (" ") donc chacun commence ou non par "on" et est insensible à la casse.
			//		eventFct...eventFctN: {Function|Array[Function]}, fonction ou tableau de fonction à associer avec le ou les événements définis par eventString
			//		capture: {Boolean}:strict, correspond à la valeur de capture à utiliser avec addEventListener
			//		option: {Object}, est un objet possédant des informations optionnelles liées soit aux options utilisables avec addEventListener soit avec tous paramètres à fournir à un événement simulé 
			//		objt1...objtN: est un objet sous la forme { eventString : eventFct || [eventFct[, ..., eventFctN]] }
			//		hasOption:  défini si des options sont fournis lors de l'appel de la fonction. Il a mis en place car il est impossible de différencier des objets d'options
			//					(qui peuvent, à cause des événements simulés, avoir n'importe quelles propriétés) des objets objt1...objtN qui peuvent aussi avoir théoriquement n'importe quelles propriétés
			// @param[1]: {Number}:[0, @param[0].length - 1], indique à partir de quel endroit du tableau se trouve eventString ou le premier objet objt
			// @return: {Object}, objet contenant les options et les événements trouvés tel que:
			//		- option: {Boolean|Object}, option trouvée
			//		- event: {Object}, objet contenant l'association événement/fonctions à associer, tel que: {
			//			eventName1 : fctList1[,
			//			...,
			//			eventNameN : fctListN ]
			//		}	où:
			//				eventName1...eventNameN est une chaine représentant le nom d'un événement sans le "on" et en minuscule
			//				fctList1...fctListN est un tableau contenant les fonctions a associer à l'événement eventNameN correspondant
			// Version: 1.0
			
				extractArg = function(arg, indexType) {
					const 	eventExt = {};
					
					if(typeof arg[indexType] == "string") {	// Si l'argument supposé contenir les événements est une chaine de caractère
						var option = arg[arg.length - 1],	// L'objet d'option est le dernier argument
							argLength = arg.length - 1,
							i = 0;							// Le parsage des objets commence à 0 puisque les arguments vont être écrasé
						
						if(option instanceof Array || (typeof option != "object" && typeof option != "boolean")) {
							option = false;
							argLength++;
						}
						
						// Convertion des argument sous forme d'objet
						arg = [{ [arg[indexType]] : Array.prototype.concat.apply([], Array.prototype.slice.call(arg, indexType + 1, argLength)) }];
					}
					else {	// Sinon, seul des objet ont été fournis
						var option = arg[arg.length - 1],	// Les options sont dans le dernier argument
							argLength = arg.length - 1,
							i = indexType;					// Le parsage des objets commence après les premiers arguments à ignorer
						
						if(arg.length > 2 && typeof arg[arg.length - 2] == "boolean") {	// Si l'avant dernier argument est un booléen, il indique si il faut tenir compte u dernier objet comme option
							argLength--;
							
							if(!arg[arg.length - 2]) {
								option = false;
							}
						}
						else if(typeof option != "boolean") {	// Sinon c'est qu'il n'y a pas d'option passé du tout
							option = false;
							argLength++;
						}
					}
					
					for(; i < argLength; i++) {	// Pour chaque objet contenant les événements
						const objt = arg[i];
						
						for(let z in objt) {				// Pour chaque propriété, qui peut être de la forme "click", "onclick", "onClick", "onClick onOther"
							if(objt.hasOwnProperty(z)) {
								const 	eventType = z.replace(/^on| on/g, strOnReplace).toLowerCase().split(" "); // toLowerCase est effectué après le replace car si un "on" est présent dans le nom d'un événement, il aura théoriquement une majuscule (ex: onMouseOnBody)
								let		eventFct = objt[z];
								
								if(eventFct instanceof Array) {
									for(let y = eventFct.length; y--;) {
										eventFct[y] = eventSave[eventFct[y]] || eventFct[y]; // Si la fonction est une chaine de caractère c'est qu'il pointe vers une fonction sauvegardée
									}
								}
								else {
									eventFct = [eventSave[eventFct] || eventFct]; // Les événements sont standardisé comme étant toujours un tableau
								}
								
								for(let y = eventType.length; y--;) {
									const actType = eventChange[eventType[y]] || eventType[y];	// Pour chaque type, on récupére le nom réel de l'événement
									
									eventExt[actType] = eventExt[actType] ? eventExt[actType].concat(eventFct) : eventFct;	// On associe l'événement final aux fonctions correspondante ou on fusionne si nécessaire
								}
							}
						}
					}
					
					return {
						event : eventExt,
						option : option
					};
				},
			
			/***** FIN Fonction extractArg *****/
			
			
			/***** Fonction extractElem *****/
			// Cette fonction ne retourne que les éléments qui supporte la méthode "addEventListener", afin de ne pas provoquer d'erreur si des noeud texte ou autres sont présent dans le tableau donné en argument
			// @param[0]: {Array}, un tableau dont il ne faudra garder que les éléments supportant addEventListener
			// @return: {Array}, un nouveau tableau dont seul les éléments de @param[0] supportant addEventListener ont été sauvegardé
			// Version: 1.0
			
				extractElem = function(elem, method) {
					const elemExt = [];
					
					for(let i = elem.length; i--;) {
						if(elem[i][method]) {
							elemExt[elemExt.length] = elem[i];
						}
					}
					
					return elemExt;
				};
			
			/***** FIN Fonction extractElem *****/
		
		/***** FIN Fonctions générales ******/
	
	/***** END FRAGMENT *****/
	
	
	/***** Gestion de l'ajout et de la suppression d'un événement *****/
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: setEvent
		 * @version: 1.0
		 * @dependencies: [{ "name" : "Extract", "version" : ">= 1.0" }]
		*/
		
			/***** Méthode Event.setEvent *****/
			// Ajoute un ou plusieurs événements à un tableau d'élément
			// Synthaxe: Event.setEvent(domList, ...arg);
			//	 	domList: {Array}, tableau d'élément sur lesquels il faut ajouter un ou plusieurs événements
			// 		...arg: Voir fonctionnement de la fonction extractArg
			// @return: {Array}, retourne @param[0] une fois les événements ajoutés
			// Version: 1.0
			// Note: seuls les éléments supportant la méthode addEventListener subiront l'ajout d'événements
			
				Event.setEvent = function(elemList) {
					const 	extract = extractArg(arguments, 1),
							event = extract.event,
							option = extract.option,
							elem = extractElem(elemList, "addEventListener"),
							elemLength = elem.length;
					
					for(let z in event) {
						if(event.hasOwnProperty(z)) {
							const actEvent = event[z];
							
							if(simulateEvent[z]) {
								simulateEvent[z].deploy(elem, actEvent, option);
							}
							else {
								const actEventLength = actEvent.length;
								
								for(let i = elemLength; i--;) {
									for(let y = 0; y < actEventLength; y++) {
										elem[i].addEventListener(z, actEvent[y], option);
									}
								}
							}
						}
					}
					
					return this;
				};
			
			/***** FIN Méthode Event.setEvent *****/
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: removeEvent
		 * @version: 1.0
		 * @dependencies: [{ "name" : "Extract", "version" : ">= 1.0" }]
		*/
		
			/***** Méthode Event.removeEvent *****/
			// Supprime un ou plusieurs événements sur un tableau d'éléments
			// Synthaxe: Event.removeEvent(domList, ...arg);
			//		domList: {Array}, tableau d'élément sur lesquels il faut supprimer un ou plusieurs événements
			// 		...arg: Voir fonctionnement de la fonction extractArg
			// @return: {Array}, retourne @param[0] une fois les événements ajoutés
			// Version: 1.0
			// Note: seuls les éléments supportant la méthode addEventListener subiront l'ajout d'événements
			
				Event.removeEvent = function(elemList) {
					const 	extract = extractArg(arguments, 1),
							event = extract.event,
							option = extract.option,
							elem = extractElem(elemList, "removeEventListener"),
							elemLength = elem.length;
					
					for(let z in event) {
						if(event.hasOwnProperty(z)) {
							const actEvent = event[z];
							
							if(simulateEvent[z]) {
								simulateEvent[z].retreat(elem, actEvent, option);
							}
							else {
								const actEventLength = actEvent.length;
								
								for(let i = elemLength; i--;) {
									for(let y = actEventLength; y--;) {
										elem[i].removeEventListener(z, actEvent[y], option);
									}
								}
							}
						}
					}
					
					return this;
				};
				
			/***** FIN Méthode Event.removeEvent *****/
		/***** END FRAGMENT *****/
	
	/***** FIN Gestion de la création et de la suppression d'un événement *****/
	
	
	/***** Gestion de l'ajout d'un élément via un nom *****/
	// L'ajout d'événement par nom associe des événements et leurs fonctions à un nom
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: EventNameArray
		 * @version: 1.0
		 * @dependencies: [{ "name" : "Extract", "version" : ">= 1.0" }]
		*/
		
			/***** Création des tableaux de sauvegarde *****/
			
			const	eventNameDis = window.dis = new WeakMap(), /* As eventNameFct */
					eventNameFct = window.fct = new WeakMap();
					/* elem => {
						"eventName" : [{
							"click" : [[fct, ...], opt], [fct, ...], opt], ...],
							"mouseover" : [[fct, ...], opt], [fct, ...], opt], ...]
						}, {
							"click" : [[fct, ...], opt]]
						}
					}*/;
				
			/***** FIN Création des tableaux de sauvegarde *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: setEventByName
		 * @version: 1.0
		 * @dependencies: [{ "name" : "EventNameArray", "version" : ">= 1.0" }]
		*/
		
			/***** Méthode Event.setEventByName *****/
			// Associe un nom à une ou plusieurs fonction d'un événement
			// Synthaxe: Event.setEventByName(domList, assocName, ...arg);
			// 		domList: {String}, tableau d'élément sur lesquels il faut ajouter les événements
			//		assocName: {String}, Nom à associer aux fonctions pour le ou les événements définis dans ...arg
			// 		...arg: Voir fonction extractArg
			// Version: 1.3
			// Version 1.0 => 1.1: Prise en charge de la fonctionnalité de sauvegarde d'événement (saveEvent), désormais, un nom de fonction sauvegardée peut-être fournie à la place d'une fonction
			// Version 1.1 => 1.2: Refonte de la fonction lors de la création d'Event.js, celle-ci suit le comportement de etractArg désormais et possède une architecture différente
			// Version 1.2 => 1.3: Prise en charge de WeakMap pour optimisation du ramasse miette
			// Note: si un événement est ajouté avec un nom déjà utilisé sur un DomElement commun, ceux-ci seront fusionné et donc activé/désactivé/supprimé en même temps
			
				Event.setEventByName = function(elemList, eventName) {
					const 	extract = extractArg(arguments, 2),
							event = extract.event,
							option = extract.option,
							elem = extractElem(elemList, "addEventListener");
					
					for(let i = elem.length; i--;) {
						const actElem = elem[i];
						
						let actElemObjt;
						if(!eventNameFct.has(actElem)) {
							actElemObjt = {};
							
							eventNameFct.set(actElem, actElemObjt);
						}
						else {
							actElemObjt = eventNameFct.get(actElem);
						}
						
						const elemFctName = actElemObjt[eventName] = actElemObjt[eventName] || {};
						for(let z in event) {
							if(event.hasOwnProperty(z)) {
								const 	actEvent = event[z],
										save = [[actEvent, option]];
								
								elemFctName[z] = elemFctName[z] ? elemFctName[z].concat(save) : save;
								
								if(simulateEvent[z]) {
									simulateEvent[z].deploy([actElem], actEvent, option);
								}
								else {
									for(let y = actEvent.length; y--;) {
										actElem.addEventListener(z, actEvent[y], option);
									}
								}
							}
						}
					}
					
					return this;
				};
			
			/***** FIN Méthode Event.setEventByName *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: getEventByName
		 * @version: 1.0
		 * @dependencies: [{ "name" : "setEventByName", "version" : ">= 1.0" }]
		*/
			
			Event.getEventByName = function(elemList, assocName = false, eventName = false, disable = false) {
				const eventList = [];
				
				for(let i = 0, length = elemList.length; i < length; i++) {
					const target = (disable ? eventNameDis : eventNameFct).get(elemList[i]);
					
					if(target) {
						let value = assocName ? target[assocName] : target;
						
						if(value) {
							if(eventName) {
								value = value[eventName] || false;
							}
							
							eventList[i] = value;
						}
						else {
							eventList[i] = false;
						}
						
						continue;
					}
					
					eventList[i] = false;
				}
				
				
				return eventList.length == 1 ? eventList[0] : eventList;
			};
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: EventByNameInit
		 * @version: 1.0
		 * @dependencies: [{ "name" : "EventNameArray", "version" : ">= 1.0" }]
		*/
		
			/***** Fonction initEventByNameMod *****/
			// Synthétise les méthodes Event.removeEventByName, Event.enabledEventByName, Event.disabledEventByName en créant une fontion personnalisé à chacune
			// Synthaxe: initEventByNameMod(sourceSet, sourceDelete, move, simulateMethod, eventMethod);
			// 		sourceSet: {Array}, le tableau sur lequel il faut ajouter la fonction
			// 		sourceDelete: {Array}, le tableau duquel il faut supprimer la fonction
			// 		move: {Boolean}, indique si du code dédié doit être éxécuté (restreint l'éxécution)
			// 		simulateMethod: {String}, nom de la méthode à utiliser pour les événements simulés
			// 		eventMethod: {String}, nom de la méthode à utiliser pour les événements classiques
			// @return: {Function}, une fonction ajoutant/supprimant des fonctions des tableaux des fonctions sauvegardés par nom
			// Version: 1.1
			// Version 1.0 => 1.1: Prise en charge de WeakMap pour optimisation du ramasse miette meilleur nettoyage des Maps lors de la suppression
			
				const initEventByNameMod = function(sourceSet, sourceDelete, move, simulateMethod, eventMethod) {
					return function(elem, eventName) {
						for(let i = 0, elemLength = elem.length; i < elemLength; i++) {
							if(elem[i][eventMethod]) {
								const 	actElem = elem[i],
										targetObjt = sourceDelete.get(actElem);
								
								if(targetObjt) {
									const target = targetObjt[eventName];
									
									if(target) {
										if(arguments.length == 2) {
											var arg = Object.keys(target),
												y = 0;
										}
										else {
											var arg = arguments,
												y = 2;
										}
										
										for(let argLength = arg.length; y < argLength; y++) {
											const actEventName = arg[y];
											
											if(target[actEventName]) {
												const eventList = target[actEventName];
												
												if(simulateEvent[actEventName]) {
													simulateEvent[actEventName][simulateMethod]([actElem], eventList);
												}
												else {
													for(let z = 0, eventLength = eventList.length; z < eventLength; z++) {
														const 	eventFct = eventList[z][0],
																eventOpt = eventList[z][1];
														
														for(let x = 0, eventActLength = eventFct.length; x < eventActLength; x++) {
															actElem[eventMethod](actEventName, eventFct[x], eventOpt);
														}
													}
												}
												
												if(move) {
													let sourceSetObjt = sourceSet.get(actElem);
													if(!sourceSetObjt) {
														sourceSetObjt = {};
														
														sourceSet.set(actElem, sourceSetObjt);
													}
													
													if(!sourceSetObjt[eventName]) {
														sourceSetObjt[eventName] = {};
													}
													
													sourceSetObjt[eventName][actEventName] = sourceSetObjt[eventName][actEventName] ? sourceSetObjt[eventName][actEventName].concat(eventList) : target[actEventName];
												}
												
												delete target[actEventName];
											}
										}
										
										if(!Object.keys(target).length) {
											delete targetObjt[eventName];
										}
										
										if(!Object.keys(targetObjt).length) {
											sourceDelete.delete(actElem);
										}
									}
								}
									
								if(!move) {	// Cleaning Dis map on deletion (move = false only when removeEventByName is called)
									const targetObjt = eventNameDis.get(actElem);
									
									if(targetObjt) {
										const target = targetObjt[eventName];
										
										if(target) {
											if(arguments.length == 2) {
												var arg = Object.keys(target),
													y = 0;
											}
											else {
												var arg = arguments,
													y = 2;
											}
										
											for(let argLength = arg.length; y < argLength; y++) {
												delete target[arg[y]];
											}
											if(!Object.keys(target).length) {
												delete targetObjt[eventName];
											}
											
											if(!Object.keys(targetObjt).length) {
												eventNameDis.delete(actElem);
											}
										}
									}
								}
							}
						}
						
						return this;
					};
				};
				
			/***** FIN Fonction initEventByNameMod *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: removeEventByName
		 * @version: 1.0
		 * @dependencies: [{ "name" : "EventByNameInit", "version" : ">= 1.0" }]
		*/
		
			/***** Méthode Event.removeEventByName *****/
			// Suppirme des fonctions d'événements en fonction du nom qui leur est associé
			// Voir fonctionnement de la fonction initEventByNameMod
			// Version: 1.2 - 12/08/2018
			// Version 1.0 => 1.1: Prise en charge de la fonctionnalité saveEvent
			// Version 1.1 => 1.2: Refonte de la fonction lors de la création de Event.js, simplification par la fonction initEventByNameMod
			
				Event.removeEventByName = initEventByNameMod(eventNameDis, eventNameFct, false, "retreat", "removeEventListener");
			
			/***** FIN Méthode Event.removeEventByName *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: enabledEventByName
		 * @version: 1.0
		 * @dependencies: [{ "name" : "EventByNameInit", "version" : ">= 1.0" }]
		*/
		
			/***** Méthode Event.enableEventByName *****/
			// Rend de nouveau fonctionnel des événements désactivé précédement par la fonction disabledEventByName
			// Voir fonctionnement de la fonction initEventByNameMod
			// Version: : 1.2 12/08/2018 
			// Version 1.0 (30/12/2015) => 1.1: prise en charge de la fonctionnalité saveEvent
			// Version 1.1 => 1.2: Refonte de la fonction lors de la création de Event.js, simplification par la fonction initEventByNameMod
			
				Event.enableEventByName = initEventByNameMod(eventNameFct, eventNameDis, true, "deploy", "addEventListener");
			
			/***** FIN Méthode Event.enableEventByName *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: disabledEventByName
		 * @version: 1.0
		 * @dependencies: [{ "name" : "EventByNameInit", "version" : ">= 1.0" }]
		*/
		
			/***** Méthode Event.disableEventByName *****/
			// Désacive les événements des éléments donnés mais sans les supprimer. Ils peuvent ensuite être réactivé avec la fonction enabledEventByName
			// Voir fonctionnement de la fonction initEventByNameMod
			// Version: : 1.1 12/08/2018 
			// Version 1.1 => 1.1: Refonte de la fonction lors de la création de Event.js, simplification par la fonction initEventByNameMod
			
				Event.disableEventByName = initEventByNameMod(eventNameDis, eventNameFct, true, "retreat", "removeEventListener");
			
			/***** FIN Méthode Event.disableEventByName *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: callEventByName
		 * @version: 1.0
		 * @dependencies: [{ "name" : "EventByNameInit", "version" : ">= 1.0" }]
		*/
		
			/****** Méthode Event.callEventByName *****/
			// Simule l'appel d'un événement par son nom
			// Synthaxe: Event.callEventByName(domList, assocName, eventName, ...arg);
			// 		domList: {Array}, tableau contenant les éléments sur lesquels les événements doivent être appelés
			// 		assocName: {String}, nom de l'événement à simuler
			// 		eventName: {String|Boolean}, indique le nom de l'événement à simuler. Si non spécifié, tous les événements enregistré au nom @param[1] seront éxécuté
			// 		...arg: {All}, les arguments suivants sont ceux qu'il faut donner en arguments des fonctions des événements simulés
			// @return: {Array}, le tableau @param[0]
			// Version: 1.2
			// Version 1.1 => 1.1: Refonte de la fonction lors de la création de Event.js
			// Version 1.1 => 1.2: Prise en charge de WeakMap pour optimisation du ramasse miette
			
				Event.callEventByName = function(elem, eventName, subName, ...fctArg) {
					for(let i = elem.length; i--;) {
						const 	actElem = elem[i];
						const	targetObjt = eventNameFct.get(actElem);
						
						if(targetObjt) {
							const 	target = targetObjt[eventName],
									arg = arguments.length == 2 ? Object.keys(target) : [subName];
							
							for(let y = 0, argLength = arg.length; y < argLength; y++) {
								const 	actSubName = arg[y].toLowerCase(),
										eventList = target[actSubName];
								
								if(eventList) {
									for(let z = 0, eventListLength = eventList.length; z < eventListLength; z++) {
										for(let x = 0, eventListAct = eventList[z], eventListActLength = eventListAct.length; z < eventListActLength; z++) {
											eventListAct[x][0].apply(actElem, fctArg);
										}
									}
								}
							}
						}
					}
					
					return this;
				};
			
			/***** FIN Méthode Event.callEventByName *****/
		
		/***** END FRAGMENT *****/
	
	/***** FIN Gestion de l'ajout d'un élément via un nom *****/


	/***** Gesion de la délégation d'événements *****/
	// Inspired from: https://davidwalsh.name/event-delegate
	// TODO: Add removeEventDelegation
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: setEventDelegation
		 * @version: 1.0
		 * @dependencies: [{ "name" : "Extract", "version" : ">= 1.0" }]
		*/
		
			/***** Méthode Event.setEventDelegation *****/
			// Crée un événement délégué
			// Synthaxe: Event.setEventDelegation(domList, condition, ...arg)
			//		domList: {Array}, tableau contenant les éléments sur lesquels il faut créer l'événement délégué
			//		condition: {Function}, condition à vérifier
			//		...arg: Voir fonction extractArg
			// @return: {Function}, la fonction Event
			// Version: 1.0
			
				Event.setEventDelegation = function(elemList, condition) {
					const 	extract = extractArg(arguments, 2),
							event = extract.event,
							option = extract.option,
							elem = extractElem(elemList, "addEventListener"),
							elemLength = elem.length;
					
					for(let z in event) {
						if(event.hasOwnProperty(z)) {
							const 	actEvent = event[z],
									actEventLength = actEvent.length,
									condEvent = function(event) {
										if(condition(event)) {
											for(let i = 0; i < actEventLength; i++) {
												actEvent[i].call(event.target, event);
											}
										}
									};
							
							if(simulateEvent[z]) {
								simulateEvent[z].deploy(elem, actEvent, option);
							}
							else {
								for(let i = elemLength; i--;) {
									elem[i].addEventListener(z, condEvent, option);
								}
							}
						}
					}
					
					return this;
				};
			
			/***** FIN Méthode Event.setEventDelegation *****/
		
		/***** END FRAGMENT *****/
	
	/***** FIN Gestion de la délégation d'événements *****/
	
	
	/***** Gestion des sauvegardes des fonctions événements *****/
	// La sauvegarde d'événement permet leur utilisation par leur nom lors de leur attribution par la suite
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: eventSave
		 * @version: 1.0
		*/
		
			let eventSave = {};	// const pas possible car modifié par deleteEvent
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: saveEvent
		 * @version: 1.0
		 * @dependencies: [{ "name" : "eventSave", "version" : ">= 1.0" }]
		*/
			
			/***** Méthode Event.saveEvent *****/
			// Associé un nom et une fonction, qui pourra par la suite être utilisé avec les fonctions setEvent, removeEvent, setEventByName, removeEventByName
			// Synthaxe: Event.saveEvent(eventName1, fct1[, ..., eventNameN, fctN]);
			// 		eventName: {String}, si une chaine de caractère est fourni, les associations se feront par paires tel que @param[1] soit la fonction à associer à @param[0], si un objet est fourni, voir @param[1]
			// 		fct: {Function|Array[Function]}, la fonction à associer à @param[0] si ce dernier est une chaine de caractère ou un objet
			// Synthaxe: Event.saveEvent(objt1[, ..., objtN]);
			//		objt1...objtN: un objet tel que chaque propriété sera associée à chaque valeur
			// @return: {Function}, la fonction Event
			// Version: 1.0
			
				Event.saveEvent = function(objt) {
					const length = arguments.length;
					
					if(typeof objt == "string") {						// Si le premier argument est une chaine de caractére
						for(let i = 0; i < length; i += 2) {
							eventSave[arguments[i]] = arguments[i+1]; 	// Association par paires
						}
					}
					else {												// Sinon les arguments doivent être des objets
						for(let i = 0; i < length; i++) {
							const elem = arguments[i];
							
							for(let z in elem) {
								if(elem.hasOwnProperty(z)) {
									eventSave[z] = elem[z];
								}
							}
						}
					}
					
					return this;
				};
			
			/***** FIN Méthode Event.saveEvent *****/
		
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: deleteEvent
		 * @version: 1.0
		 * @dependencies: [{ "name" : "saveEvent", "version" : ">= 1.0" }]
		*/
		
			/***** Méthode Event.deleteEvent *****/
			// Supprime des fonctions précédemment sauvegardés avec Event.saveEvent
			// Synthaxe: Event.deleteEvent(name1[, ..., nameN])
			//		name1...nameN: {String}, nom d'une fonction qu'il faut supprimer
			// @return: {Function}, la fonction Event
			
				Event.deleteEvent = function() {
					if(arguments.length) {
						let i = arguments.length;
						
						while(i--) {
							delete eventSave[arguments[i]];
						}
					}
					else {
						eventSave = {};
					}
					
					return this;
				};
				
			/***** FIN Méthode Event.deleteEvent *****/
			
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: callEvent
		 * @version: 1.0
		 * @dependencies: [{ "name" : "saveEvent", "version" : ">= 1.0" }]
		*/
		
			/***** Méthode Event.callEvent *****/
			// Exécute des fonctions précédemment sauvegardés avec Event.saveEvent
			// Synthaxe: Event.callEvent(name1[, arg1, ..., argN])
			//		name1...nameN: {String}, nom d'une fonction qu'il faut éxécuter
			//		arg1...argN: {All}, les arguments à fournir à la fonction éxécutée
			// @return: {Function}, la fonction Event
			
				Event.callEvent = function(name, ...arg) {
					if(eventSave[name]) {
						const target = eventSave[name];
						
						if(typeof target == "function") {
							target.apply(window, arg);
						}
						else {
							for(let i = 0, length = target.length; i < length; i++) {
								target[i].apply(window, arg);
							}
						}
					}
					
					return this;
				};
				
			/***** FIN Méthode Event.callEvent *****/
			
		/***** END FRAGMENT *****/
		
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: getEvent
		 * @version: 1.0
		 * @dependencies: [{ "name" : "saveEvent", "version" : ">= 1.0" }]
		*/
		
			/***** Méthode Event.getEvent *****/
			// Retoure une fonction précédemment sauvegardée avec Event.saveEvent
			// Synthaxe: Event.getEvent(name)
			//		name1: {String}, nom de la fonction sauvegardée qu'il faut retourner
			// @return: {Function|Undefined}, la fonction sauvegardée avec le nom "name" ou undefined
			
				Event.getEvent = function(name) {
					return eventSave[name];
				};
				
			/***** FIN Méthode Event.getEvent *****/
		
		/***** END FRAGMENT *****/
	
	/***** FIN Gestion des sauvegardes des fonctions événements *****/
	
		
	/***** Gestion des événements simulés *****/
	// Les événements simulés sont des événements non-supportés nativement par les navigateurs et qui ont donc besoins d'être simulés par du JavaScript
	
		/***** NEW FRAGMENT *****/
		/**
		 * @name: simulateEvent
		 * @version: 1.0
		*/
		
			const simulateEvent = {};
			
			/***** Méthode Event.createSimulateEvent *****/
			// Permet la création d'un nouvel événement simulé. Les événements simulés sont traités comme des événements natifs. On pourra donc utiliser les méthodes .setEvent, .removeEvent, .setEventByName etc avec ces événements
			// Synthaxe: Event.createSimulateEvent(name, fctInit, fctRemove, data);
			//		name: {String}, est le nom de l'événement simulé, sans le "on" et non sensible à la casse
			//		fctInit: {Function}, fonction à utiliser pour créer l'événement sur un élément
			//		fctRemove: {Function}, fonction à utiliser pour supprimer l'événement d'un élément
			//		data: {Object}, objet utilisé par l'événement pour stocker diverses données
			// @return: {Function}, la fonction Event
			// Version: 1.0
			
				Event.createSimulateEvent = function(name, init, remove, data = {}) {
					data.elem = [];
					
					data.deploy = function(elem, arg, option, fromExt = true) {
						for(let i = 0, elemLength = elem.length; i < elemLength; i++) {
							let index = data.elem.indexOf(elem[i]);
							
							if(index == -1) {
								index = data.elem.length;
								
								data.elem[index] = elem[i];
							}
							
							init(data, elem[i], arg, index, option, fromExt);	// fromExt indique si l'appel se fait depuis .onMyEvent(...) ou setEvent(name, ...);
						}
						
						return this;
					};
					
					data.retreat = function(elem, eventList) {
						for(let i = 0, elemLength = elem.length; i < elemLength; i++) {
							const index = data.elem.indexOf(elem[i]);
							
							if(index != -1) {
								remove(data, elem[i], index, eventList);
							}
						}
						
						return this;
					};
					
					if(window.Dynamique) {
						Dynamique.addPlugIn("on" + name, function() {
							data.deploy(this, arguments, false, false);
							
							return this;
						});
					}
					
					simulateEvent[name.toLowerCase()] = data;
					
					return this;
				};
			
			/***** FIN Méthode Event.createSimulateEvent *****/
		
		/***** END FRAGMENT *****/
	
	/***** FIN Gestion des événements simulés *****/
	
	
	/***** Gestion des événements sur des objets *****/
	
		/***** NEW FRAGMENT *****/
		/**
		 * @name: createEventObject
		 * @version: 1.0
		*/
		
			/***** Méthode Event.createEventObject *****/
			// Cette fonction permet d'ajouter un ensemble de méthode identique aux méthodes DomElement.addEventListener/removeEventListener/dispatchEvent
			// @param[0]: {Object}, l'objet auquel les méthodes suivantes seronts ajoutées:
			//		- .addEventListener: permet l'ajout d'un nouvel événement
			//			- @param[0]: {String}, le nom du événement
			//			- @param[N]: {Function}, une fonction à associer à cet événement
			//		=> Ajouter support d'un dernier paramètre pour être conforme à Element.addEventListener ?
			//		- .removeEventListener: permet la suppression d'un événement
			//			- @param[0]: {String}, le nom d'un évéement
			//			- @param[N]: {Function}, la fonction qu'il faut dissocier de l'événement
			//		- .dispatchEvent: appel un événement
			//			- @param[0]: {String}, Le nom d'un événement à appeler
			//			- @param[N]: {All}, les arguments à fournir aux fonctions liées à cette événement qui vont être appelés
			//			- @param[N-1]: {Boolean}, identique à la fonction .redispatchOnNewHandler
			//		- .redispatchOnNewHandler: défini le comportement à adopter lors de l'association d'une fonction a un événement après qu'il ait été déjà appelé
			//			- @param[0]: {String}, le nom d'un événement
			//			- @param[1]: {Boolean}, un booléen indiquant si, lorsqu'un événement a déjà été appelé et qu'une nouvelle fonction est associée à cet événement, elle doit être appelée immédiatement (TRUE) ou attendre le prochain dispachEvent (FALSE)
			//		- .copyEventTo: copie les événements de l'objet parent à l'objet @param[0]
			//			- @param[0]: {Object}, l'objet sur lequel doit être copié les événements
			//			- @param[1]: {Function}, Function permettant de filtrer quelle événement doit être copié ou non
			//			- @param[2]: {Boolean}, indique si c'est l'objet source ou l'objet cible qui doit être retourné
			// @param[1]: {Object}, un objet tel que le nom de chaque propriété correspond à un nom d'un événement sans le "on" et non sensible à la casse qui a pour valeur une fonction qui devra être appelée pour créer les arguments qui devront être transmis aux fontions à déclencher, exemple:
			// 			"onClick" : function() {
			//				return [{ event : "this is the event click" }];	// Défini les arguments à utiliser lors de l'appel de chaque événement "click"
			//			}
			//			Les propriétés de @param[1] définissent aussi les propriétés "online" qui seront ajoutées à l'objet @param[0] et qui pourront être utilisées pour associer des événements plus simplement.
			//			L'exemple précédant ajoutera la propriété "onclick" à l'objet @param[0]	et si une fonction est définie pour cette propriété, elle sera appelée lors de l'appel de dispatchEvent.
			//			Seule une fonction peut être associée à un évenement par cette méthode. La liste totale des fonctions à appeler = la fonction définis par la propriété inline + les fonctions définies avec addEventListener.
			// 			Si un événement défini par sa propriété "inline" est ensuite redéfini, la dernière valeur utilisée réécrira la valeur précédante et sera associée à l'événement si c'est une fonction, exemple:
			//					myObjt.onclick = () => {};
			//					myObjt.onclick = null;
			//				supprimera l'association de la première fonction pour l'événement click
			//					myObjt.onclick = () => {};
			//					myObjt.onclick = () => {};
			//				supprimera l'association de la première fonction à l'événement et associera la seconde
			//			dans les deux cas, les événements associés avec addEventListener restent inchangées.
			//			La propriété peut aussi être une valeur autre qu'une fonction, indiquant que la propriété inline doit bien être ajoutée mais qu'aucune fonction de préparation n'est à utiliser.
			// @return: {Object}, l'objet @param[0] une fois les méthodes ajoutées
			// Version: 1.1
			// Version 1.0 => 1.1: Ajout de .copyEventTo permettant de copier des événements d'un objet sur un autre objet
			// Note: si une propriété portant le nom d'un événement online est une fonction dans l'objet @param[0], celui-ci sera bien associé comme événement
			// Amélioration: Ajouter le support d'un objet option comme dernier/troisième paramètre à addEventListener conformément au fonctionnement traditionnel de Element.addEventListener
			
				Event.createEventObject = function(objt, objtCall) {
					Object.defineProperties(objt, {
						addEventListener : {
							value : function(name) {
								name = name.replace(/^on/, "").toLowerCase();
								
								if(!event[name]) {
									event[name] = [];
								}
								
								let length = arguments.length;
								if(typeof arguments[length - 1] != "function") {
									length--;
								}
								
								for(let i = 1; i < length; i++) {
									event[name][event[name].length] = arguments[i];
								}
								
								if(redispatch[name]) {
									const finalArg = prepare[name] ? prepare[name].apply(this) : [];
									
									for(let i = 1, length = arguments.length; i < length; i++) {
										arguments[i].apply(this, finalArg);
									}
								}
								
								return this;
							}
						},
						removeEventListener : {
							value : function(name) {
								name = name.replace(/^on/, "").toLowerCase();
								
								if(event[name]) {
									for(let i = 1, length = arguments.length; i < length; i++) {
										const index = event[name].indexOf(arguments[i]);
										
										if(index != -1) {
											event[name].splice(index, 1);
										}
									}
								}
								
								return this;
							}
						},
						dispatchEvent : {
							value : function(name, ...arg) {
								name = name.replace(/^on/, "").toLowerCase();
								
								if(event[name]) {
									const 	target = [].concat(event[name]),	// Prevent event list changes in event functions
											finalArg = prepare[name] ? prepare[name].apply(this, arg) : arg;
									
									for(let i = 0, length = target.length; i < length; i++) {
										target[i].apply(this, finalArg);
									}
								}
								
								return this;
							}
						},
						dispatchEventAsync : {
							value : async function(name, ...arg) {
								name = name.replace(/^on/, "").toLowerCase();
								
								if(event[name]) {
									const 	target = [].concat(event[name]),	// Prevent event list changes in event functions
											finalArg = prepare[name] ? prepare[name].apply(this, arg) : arg;
									
									for(let i = 0, length = target.length; i < length; i++) {
										await target[i].apply(this, finalArg);
									}
								}
								
								return this;
							}
						},
						redispatchOnNewHandler : {
							value : function(name, bool) {
								redispatch[name.replace(/^on/, "").toLowerCase()] = bool;
								
								return this;
							}
						},
						importEvent : {
							value : function() {
								for(let i = 0, length = arguments.length; i < length; i++) {
									const actArg = arguments[i];
									
									for(let z in objtCall) {
										if(objtCall.hasOwnProperty(z)) {
											const eventName = "on" + z.replace(/^on/, "").toLowerCase();
											
											if(actArg[eventName]) {
												objt[eventName] = actArg[eventName];
											}
										}
									}
								}
								
								return this;
							}
						},
						copyEventTo : {
							value : function(target, filter, ret) {
								for(let z in event) {
									if(event.hasOwnProperty(z)) {
										const 	list = event[z],
												on = this["on" + z];
										
										if(on && (!filter || filter(this["on" + z], z))) {
											target["on" + z] = this["on" + z];
										}
										
										B:for(let i = 0, length = list.length; i < length; i++) {
											if(on == list[i] || (filter && !filter(list[i], z))) {
												continue B;
											}
											
											target.addEventListener(z, list[i]);
										}
									}
								}
								
								return ret ? target : this;
							}
						}
					});
					
					const 	event = {},
							prepare = {},
							redispatch = {},
							inline = {};
					
					for(let z in objtCall) {
						if(objtCall.hasOwnProperty(z)) {
							const 	eventName = z.replace(/^on/, "").toLowerCase(),
									onEventName = "on" + eventName;
							
							if(typeof objtCall[z] == "function") {
								prepare[eventName] = objtCall[z];
							}
							
							if(typeof objt[onEventName] == "function") {
								inline[onEventName] = objt[onEventName];
								
								objt.addEventListener(eventName, objt[onEventName]);
								
								delete objt[onEventName];
							}
							
							Object.defineProperty(objt, onEventName, {
								set : function(fct) {
									if(inline[onEventName]) {
										objt.removeEventListener(eventName, inline[onEventName]);
									}
									
									if(typeof fct == "function") {
										inline[onEventName] = fct;
										
										objt.addEventListener(eventName, fct);
									}
									else {
										delete inline[onEventName];
									}
								},
								
								get : function() {
									return inline[onEventName];
								}
							});
						}
					}
					
					return objt;
				};
				
			/***** FIN Méthode Event.createEventObject *****/
		
		/***** END FRAGMENT *****/
		
	/***** FIN Gestion des événements sur des objets *****/
	
	
	/***** Ajouts des événements par défaut *****/
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: plugInDefaultEvent
		 * @version: 1.0
		 * @condition: ["includeDefaultEvent"]
		*/
		
			const eventConst = [
				"Load", "UnLoad", "BeforeUnload",
				"Abort",
				"Error",
				
				"Click", "DblClick",
				"KeyDown", "KeyUp", "KeyPress",
				
				"MouseDown", "MouseUp", "MouseMove", "MouseOver", "MouseOut", "MouseEnter", "MouseLeave",
				"TouchStart", "TouchEnd", "TouchEnter", "TouchLeave", "TouchMove",
				"PointerOver", "PointerEnter", "PointerDown", "PointerMove", "PointerUp", "PointerCancel", "PointerOut", "PointerLeave",
				"Drag", "DragStart", "DragEnd", "DragOver", "DragEnter", "DragLeave", "Drop",
				
				"Focus", "Blur", "Change", "Input", "BeforeInput",
				"Copy", "Cut", "Paste", "Select",
				"Submit", "Reset",
				"Scroll", "Resize",
				
				"AnimationStart", "AnimationEnd", "AnimationCancel", "AnimationIteration",
				"TransitionStart", "TransitionEnd", "TransitionCancel", "TransitionRun"
			],
			eventChange = {
				"Ready" : "DOMContentLoaded",
				"RightClick" : "contextmenu",
				"MouseScroll" : (/Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel")
			},
			onPlugIn = {};
			
			for(let z in eventChange) {
				if(eventChange.hasOwnProperty(z)) {
					const 	name = z.toLowerCase();
							eventChange[name] = eventChange[z];
					
					onPlugIn["on" + z] = function(...arg) { Event.setEvent(this, name, arg); return this; };
					
					delete eventChange[z];
				}
			}
			
			for(let i = 0, length = eventConst.length; i < length; i++) {
				const name = eventConst[i];
				
				onPlugIn["on" + name] = function(...arg) { Event.setEvent(this, name, arg); return this; };
			}
		
		/***** END FRAGMENT *****/
		
	/***** FIN Ajouts des événements courants *****/
	
	
	/***** Ajout des fonctions à dynamique ou au document *****/
		
		if(window.Dynamique) {
			/***** NEW FRAGMENT *****/
			/**
			 * @name: plugInMethod
			 * @version: 1.0
			 * @condition: ["includePlugInMethod"]
			*/
				
				const plugIn = {
					setEvent 			: Dynamique.build(Event.setEvent),
					removeEvent 		: Dynamique.build(Event.removeEvent),
					
					setEventByName 		: Dynamique.build(Event.setEventByName),
					getEventByName 		: Dynamique.build(Event.getEventByName, true),
					removeEventByName 	: Dynamique.build(Event.removeEventByName),
					callEventByName 	: Dynamique.build(Event.callEventByName),
					enableEventByName 	: Dynamique.build(Event.enableEventByName),
					disableEventByName 	: Dynamique.build(Event.disableEventByName),
					
					setEventDelegation 	: Dynamique.build(Event.setEventDelegation),
					
					saveEvent 			: Event.saveEvent,
					deleteEvent 		: Event.deleteEvent,
					callEvent 			: Event.callEvent,
					getEvent 			: Event.getEvent,
					
					createEventObject 	: Event.createEventObject,
					createSimulateEvent : Event.createSimulateEvent
				};
			
			/***** END FRAGMENT *****/
			
			/***** NEW FRAGMENT *****/
			/**
			 * @name: createEventPlugIn
			 * @version: 1.0
			 * @condition: ["useDynamique"]
			*/
			
				/***** Méthode Event.createEventPlugIn *****/
				// Crée un nouveau plugIn Dynamique portant le nom "on" + nom d'un événement
				// Ce plugIn attendra N fonctions en argument qui seront toutes associées à l'événement défini par @param[1]
				// Synthaxe:
				//		Event.createEventPlugIn(name, eventName);
				// Où:
				// 		name: {String}, nom qui sera utilisé en concaténation avec "on" pour former le nom du plugIn (ex: "MouseMove")
				// 		eventName: {String}:facultatif = @param[0], nom réel de l'événement (ex: "mousemove")
				// @return: {Function}, la fonction Event
				// Version: 1.0
				// Note: méthode uniquement défini lorsque dynamique est dans le document
				
					Event.createEventPlugIn = plugIn.createEventPlugIn = function(name, eventName = name) {
						eventName = eventName.toLowerCase();
						
						Dynamique.addPlugIn("on" + name, function(...arg) { Event.setEvent(this, eventName, arg); return this; });
						
						return this;
					};
				
				/***** FIN Méthode Event.createEventPlugIn *****/
			
			/***** END FRAGMENT *****/
			
			
			/***** NEW FRAGMENT *****/
			/**
			 * @name: DynamiqueAdd
			 * @version: 1.0
			 * @required: true
			 * @condition: ["useDynamique"]
			*/
			
				Dynamique.addPlugIn(plugIn);
				Dynamique.addPlugIn(onPlugIn);
				Dynamique.addModule("Event", Event);
			
			/***** END FRAGMENT *****/
		}
		else {
			/***** NEW FRAGMENT *****/
			/**
			 * @name: WindowAdd
			 * @version: 1.0
			 * @required: true
			 * @condition: ["notUseDynamique"]
			*/
				
				Event.plugInOn = onPlugIn;
				
				window.Event = Event;
			
			/***** END FRAGMENT *****/
		}
		
	/***** FIN Ajout des fonctions à dynamique ou au document *****/
})();
