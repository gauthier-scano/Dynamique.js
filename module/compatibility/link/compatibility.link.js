D(document).onReady(function() {
	const selector = "link[rel=import]";
	
	const process = function(elem, from = "") {
		elem.map(function(act) {
			let href = act.href; // href is absolute notation, attributes.href.value is real attribute value (relative or absolute)
			
			if(!(/^(http|https|\/)/.test(act.attributes.href.value))) {	// Fix error: href from link is defined from the file itself and not from the main page
				// If the actual link has a relative href, updating the href according to the actual parent link location
				const index = from.lastIndexOf("/");
				
				if(index != -1) {
					from = from.slice(0, index + 1);
				}
				
				href = from + act.attributes.href.value;
			}
			
			Dynamique.module.Ajax({
				method : "GET",
				async : true,
				format : "text/html",
				useDynamique : false,
				url : href,
				
				onsuccess : function(doc) {
					const 	target = D(Array.prototype.slice.call(doc.children)),
							dependencies = target.selector("[tagName=DEPENDENCIES]").removeElement().selectChild(true),
							script = target.selector("[tagName=SCRIPT]");
					
					process(target.selector("[tagName=LINK][rel=import]").concat(target.selector(selector)), href);
					
					act.parentNode.insertBefore(doc, act);
					act.parentNode.removeChild(act);
					
					dependencies.map(elem => {
						if(elem.tagName == "SCRIPT") {
							const src = elem.getAttribute("src");
							elem = document.createElement("script");
							elem.setAttribute("src", src);
						}
						
						if(elem.nodeType == 1 && typeof elem.dataset.index != "undefined") {
							let index = elem.dataset.index * 1;
							delete elem.dataset.index;
							
							if(typeof elem.dataset.relative != "undefined") {
								const relNode = document.evaluate(elem.dataset.relative, document.head, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
								let target = relNode.iterateNext();
								
								while(index--) {
									target = relNode.iterateNext();
								}
								
								document.head.insertBefore(elem, target);
								delete elem.dataset.relative;
							}
							else {
								document.head.insertBefore(elem, document.head.childNodes[index]);
							}
						}
						else {
							document.head.appendChild(elem);
						}
					});
					
					script.map(elem => {
						const 	script = document.createElement("script");
								script.textContent = elem.textContent;
						
						elem.parentNode.insertBefore(script, elem);
						elem.remove();
					});
				}
			});
		});
	};
	
	process(Dynamique(selector));
});
