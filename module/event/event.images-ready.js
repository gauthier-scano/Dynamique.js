(function() {
	const target = window.Dynamique ? Dynamique.module.Event : Event;
	
	target.createSimulateEvent("ImagesReady", function(data, elem, arg, index) {
		if(!data.loaded) {
			if(!data.event[index]) {
				data.event[index] = [];
			}
			
			const eventList = data.event[index];
			for(let i = 0, length = arg.length; i < length; i++) {
				eventList[eventList.length] = arg[i];
			}
			
			if(!data.id) {
				data.id = setInterval(function() {
					if(data.isImagesReady()) {
						clearTimeout(data.id);
						
						data.process();
						data.loaded = true;
					}	
				}, 5);
			}
		}
		else {
			const customEvent = new CustomEvent("imagesready");
			
			for(let i = 0, length = arg.length; i < length; i++) {
				arg[i].call(elem, customEvent);
			}
		}
	}, function(data, elem, index, eventList) {
		const eventObjt = data.event[index];
		
		for(let i = 0, length = eventList.length; i < length; i++) {
			const indexList = eventObjt.indexOf(eventList[i]);
			
			if(indexList != -1) {
				eventObjt.splice(index, 1);
			}
		}
		
		if(!Object.keys(eventObjt).length) {
			data.event.splice(index, 1);
		}
		
		if(data.id && !Object.keys(data.event).length) {
			clearInterval(data.id);
		}
	}, {
		id : null,
		event : [],
		loaded : false,
		isImagesReady : function() {
			const 	images = document.images,
					imagesLength = images.length;
			
			for(let y = 0; y < imagesLength; y++) {
				if(!images[y].complete && images[y].src) {		// Vérification de la propriété "src" obligatoire pour IE < 9
					return false;
				}
			}
			
			return true;
		},
		
		process : function() {
			const 	customEvent = new CustomEvent("imagesready"),
					domList = this.elem,
					eventList = this.event;
			
			for(let i = 0, domLength = domList.length; i < domLength; i++) {
				const 	actDom = domList[i],
						actEventList = eventList[i];
				
				for(let y = 0, length = actEventList.length; y < length; y++) {
					actEventList[y].call(actDom, customEvent);
				}
			}
		}
	});
})();
