/*********************************************************/
/***************   Event.onVisible.js   ******************/
/**
 * Date : 
 * Version : 1.0
 * 
 * Nécessite IntersectionObserver API
 * https://developer.mozilla.org/fr/docs/Web/API/Intersection_Observer_API
 * 
 * Inspiré de plugIn/scrollLoader.js
 */
/*********************************************************/
/*********************************************************/

"use strict";

(function() {
	const defaultParam = {
		root 		: null,		// Conteneur par défaut possèdant les éléments susceptibles d'être invisible et de devenir visible, null = toute la page
		rootMargin 	: "0px",	// Marge par défaut du conteneur
		precision 	: 0.1,		// Précision par défaut des threshold utilisée
		trigger 	: 0			// Valeur de déclenchement de l'ajout de la propriété
	};
	
	if(window.Dynamique) {
		var target = Dynamique.module.Event;
		
		Dynamique.tools.visibleEvent = defaultParam;
	}
	else {
		var target = Event;
		
		Event.visibleEvent = defaultParam;
	}
	
	target.createSimulateEvent("Visible", function(data, elem, arg, index, option, fromExt) {
		let param = Object.assign({}, defaultParam, fromExt ? option : (typeof arg[0] == "function" ? defaultParam : arg[0])),
			assoc = data.rootAssoc.get(param.root);
		
		if(!assoc || !assoc[param.rootMargin] || !assoc[param.rootMargin][param.precision]) {
			const threshold = [];
			for(let i = 0; i < 1; i += param.precision) {
				threshold[threshold.length] = i;
			}
			
			const observer = new IntersectionObserver(function(list) {
				for(let i = 0, length = list.length; i < length; i++) {
					const 	actList = list[i],
							actRatio = actList.intersectionRatio;
					
					if(actList.isIntersecting) {
						const triggerList = assoc.elem.get(actList.target);
						
						for(let trigger in triggerList) {
							if(triggerList.hasOwnProperty(trigger)) {
								if(actRatio >= trigger * 1) {
									const eventList = triggerList[trigger];
									
									for(let y = 0, eventListLength = eventList.length; y < eventListLength; y++) {
										eventList[y].call(actList.target, actList, observer);
									}
								}
							}
						}
					}
				}
			}, {
				root 		: param.root,
				rootMargin 	: param.rootMargin,
				threshold 	: threshold
			});
			
			if(!assoc) {
				assoc = {};
			}
			
			if(!assoc[param.rootMargin]) {
				assoc[param.rootMargin] = {};
			}
			
			if(!assoc[param.rootMargin][param.precision]) {
				assoc[param.rootMargin][param.precision] = {
					observer : observer,
					elem : new Map()
				};
			}
			
			data.rootAssoc.set(param.root, assoc);
		}
		
		assoc = assoc[param.rootMargin][param.precision];
		
		let trigger = assoc.elem.get(elem);
		
		if(!trigger) {
			trigger = {};
			
			assoc.elem.set(elem, trigger);
			assoc.observer.observe(elem);
		}
		
		let elemAssoc = data.elemAssoc.get(elem);
		
		if(!elemAssoc) {
			elemAssoc = [];
			
			data.elemAssoc.set(elem, elemAssoc);
		}
		
		if(elemAssoc.indexOf(assoc) == -1) {
			elemAssoc[elemAssoc.length] = assoc;
		}
		
		const type = !fromExt && typeof arg[0] != "function";
		
		param.trigger /= 100;
		
		if(!trigger[param.trigger]) {
			trigger[param.trigger] = type ? Array.prototype.slice.call(arg).slice(1) : Array.prototype.slice.call(arg);
		}
		else {
			const eventList = trigger[param.trigger];
			
			for(let i = type * 1, length = arg.length; i < length; i++) {
				eventList[eventList.length] = arg[i];
			}
		}
	}, function(data, elem, index, eventList) {
		const objt = data.elemAssoc.get(elem);	// Tableau contenant l'ensemble des observer auquel est associé l'élément
		
		if(objt) {
			for(let i = 0, length = objt.length; i < length; i++) {
				const 	actObserver = objt[i],
						trigger = actObserver.elem.get(elem);
				
				if(trigger) {
					const eventListLength = eventList.length;
					
					for(let z in trigger) {
						if(trigger.hasOwnProperty(z)) {
							const actEventList = trigger[z];
							
							for(let y = 0, length = eventListLength; y < length; y++) {
								const index = actEventList.indexOf(eventList[y]);
								
								if(index != -1) {
									actEventList.splice(index, 1);
								}
							}
							
							if(!actEventList.length){
								delete trigger[z];
							}
						}
					}
					
					if(!Object.keys(trigger).length) {
						actObserver.elem.delete(elem);
						actObserver.observer.unobserve(elem);
					}
				}
			}
		}
	}, {
		rootAssoc : new Map(
		/*
		 * 	root => {
		 * 		rootMargin : {
		 * 			precision : { => observeObjt
		 * 				observer : observer,
		 * 				elem => {
		 * 					trigger : [event]
		 *				}
		 * 			}
		 * 		}
		 * 	}
		*/
		),
		elemAssoc : new Map(/* elem => observerObjt */)
	});
})();
