(function() {
	// Permet de détecter lorsque une ou plusieurs touche du clavier sont enfoncées simultanément
	// Cet événement rajoute une complexité car chaque domElem à un événement associé à N fonctions pour un chemin donné
	
	const 
		target = window.Dynamique ? Dynamique.module.Event : Event,
		data = {
			assoc : new Map(),	// Associera une fonction à l'objet qui la contient
			event : [],
			
			eventMultKeyDown : function(event) {
				const 	actKey = event.key,
						index = data.elem.indexOf(this),
						desc = data.event[index],
						pathList = desc.pathList,
						pathObjt = desc.pathObjt;
				
				for(let i = 0, length = pathList.length; i < length; i++) {
					const 	desc = pathObjt[pathList[i]],
							state = desc.state,
							path = desc.pathArr;
					
					for(let y = 0, pathLength = path.length; y < pathLength; y++) {
						if(!state[y]) {
							if(path[y](event)) {
								state[y] = true;
								
								if(y+1 == pathLength) {
									const eventList = desc.event;
									for(let z = 0, eventLength = eventList.length; z < eventLength; z++) {
										eventList[z].call(this, event, path);
									}
								}
							}
							else {
								break;
							}
						}
					}
				}
			},
			eventMultKeyUp : function(event) {
				const 	actKey = event.key,
						index = data.elem.indexOf(this),
						desc = data.event[index],
						pathList = desc.pathList,
						pathObjt = desc.pathObjt;
				
				B:for(let i = 0, length = pathList.length; i < length; i++) {
					const 	desc = pathObjt[pathList[i]],
							state = desc.state,
							path = desc.pathArr;
					
					for(let y = 0, pathLength = path.length; y < pathLength; y++) {
						if(path[y](event)) {
							state[y] = false;
							
							continue B;
						}
					}
				}
			}
		};
	
	target.createSimulateEvent("KeyIs", function(data, elem, arg, index, option, fromExt) {
		const 	isNew = !data.event[index],
				path = fromExt ? option.path : arg[0],				// Récupère le chemin défini par l'utilisateur en fonction de là où est ajouté l'événement (onKeyIs ou setEvent, setEventByName etc, la position du chemin n'est pas la même dans tous les cas)
				pathArr = path instanceof Array ? path : [path],	// Le chemin est forcément un tableua, même si il n'a qu'une seule case
				pathStr = pathArr.join("_");
		
		for(let i = 0, length = pathArr.length; i < length; i++) {
			const actCase = pathArr[i];
			
			// Chaque étape du chemin peut être soit une chaine de caractère, soit une RegExp soit une fonction qui prend comme argument l'événement du keydown
			pathArr[i] = (typeof actCase == "string") ?
							event => event.key == actCase
						:(actCase instanceof RegExp) ?
							event => event.key.match(actCase)
						: // path instanceof Function
							event => actCase.call(this, event);
		}
		
		if(isNew) {
			data.event[index] = {
				pathList : [],	// Contient tous les chemins sous la forme: [["a", "b"], ["c", "d"]], Object.keys non-utilisé pour améliorer les performances car les fonctions sont appelées à chaque frappe du clavier
				pathObjt : {}	// Contient tous les chemins sous la forme: { "a_b": {}, "c_d": {} ]
			};
			
			target.setEvent([elem], "keydown", data.eventMultKeyDown);
			target.setEvent([elem], "keyup", data.eventMultKeyUp);
		}
		
		const 	elemDesc = data.event[index],
				pathObjt = elemDesc.pathObjt;
		
		if(!pathObjt[pathStr]) {
			pathObjt[pathStr] = {
				pathArr : pathArr,	// Chemin sous forme de tableau, nécessaire pour vérifier que le chamin est bon ou non
				pathStr : pathStr,	// Chemin sous forme de chaine de caractère, nécessaire pour pouvoir supprimer cet objet de l'objet pathObjt correspondant au domElem
				state : [],			// Tableau contenant l'état du chemin pour chaque case (true/false)
				event : []			// Contient toutes les fonctions à appeler lorsque le chemin correspond
			};
			
			elemDesc.pathList[elemDesc.pathList.length] = pathStr;
		}
		
		const eventList = pathObjt[pathStr].event;
		for(let i = !fromExt * 1, length = arg.length; i < length; i++) {
			eventList[eventList.length] = arg[i];
			
			data.assoc.set(arg[i], pathObjt[pathStr]);	// Associe chaque FunctionEvent à son objet pathObjt
		}
	}, function(data, elem, index, eventList) {
		const eventObjt = data.event[index];
		
		for(let i = 0, length = eventList.length; i < length; i++) {
			const location = data.assoc.get(eventList[i]);
			
			if(location) {
				location.event.splice(location.event.indexOf(eventList[i]), 1);
				
				if(!location.event.length) {
					delete eventObjt.pathObjt[location.pathStr];
					
					eventObjt.pathList.splice(eventObjt.pathList.indexOf(location.pathStr), 1);
				}
				
				data.assoc.delete(eventList[i]);
			}
		}
		
		if(!eventObjt.pathList.length) {
			target.removeEvent([elem], "keydown", data.eventMultKeyDown);
			target.removeEvent([elem], "keyup", data.eventMultKeyUp);
			
			data.event.splice(data.event.indexOf(eventObjt), 1);
			data.elem.splice(data.elem.indexOf(elem), 1);
		}
	}, data);
})();
