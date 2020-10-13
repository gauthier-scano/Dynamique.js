/*****************************************************/
/***************   focus-content.js   ****************/
/**
 * Date : 18/06/2020
 * Version : 1.0
 */
/*****************************************************/
/*****************************************************/

(function() {
	function FocusContent(target, parent = null) {
		this.unique = "FocusContent-" + Math.round(Math.random() * 10E17);
		
		this.frameTop 	= D({ tagName : "div", className : "focus-content-frame-top" });
		this.frameRight = D({ tagName : "div", className : "focus-content-frame-right" });
		this.frameBottom = D({ tagName : "div", className : "focus-content-frame-bottom" });
		this.frameLeft 	= D({ tagName : "div", className : "focus-content-frame-left" });
		this.frame 		= D({ tagName : "div", className : "focus-content-frame" });
		this.allBorder	= D().concat(this.frameTop, this.frameRight, this.frameBottom, this.frameLeft);
		this.all		= D().concat(this.frameTop, this.frameRight, this.frameBottom, this.frameLeft, this.frame);
		
		this.frame.setEventByName(this.unique, "mouseenter", () => this.frame.setData("mask", true)).disableEventByName(this.unique);
		this.allBorder.setEventByName(this.unique, "mouseleave", () => this.frame.removeData("mask")).disableEventByName(this.unique);
			
		this.setTarget(target);
		this.setParent(parent);
		
		return this;
	};
	
	FocusContent.prototype = {
		target : null,
		getTarget : function() {
			return this.target;
		},
		setTarget : function(target) {
			if(this.target) {
				D(this.target).removeEventByName(this.unique, "mouseleave", () => this.frame.removeData("mask"));
			}
			
			this.target = target instanceof Array ? target[0] : target;
			
			D(this.target).setEventByName(this.unique, "mouseleave", () => this.frame.removeData("mask"));
			
			return this;
		},
		
		parent : null,
		getParent : function() {
			return this.parent;
		},
		setParent : function(parent) {
			this.parent = (parent ? parent instanceof Array ? parent[0] : parent : null) || document.body;
			
			return this;
		},
		
		focusOn : function(maskTarget = false) {
			const 	parent = this.getParent(),
					parentBound = parent.getBoundingClientRect(),
					bound 	= this.getTarget().getBoundingClientRect(),
					top 	= bound.top - parentBound.top,
					right 	= (parentBound.width + parentBound.left) - bound.right,
					bottom 	= (parentBound.height + parentBound.top) - bound.bottom,
					left 	= bound.left - parentBound.left;
			
			this.all.insertLast(parent).forceRedraw();
			
			this.frameTop	.setStyle("height", top + "px");
			this.frameRight	.setStyle("top", top + "px", "width", right + "px", "bottom", bottom + "px");
			this.frameBottom.setStyle("height", bottom + "px");
			this.frameLeft	.setStyle("top", top + "px", "width", left + "px", "bottom", bottom + "px");
			this.frame		.setStyle("top", top + "px", "right", right + "px", "bottom", bottom + "px", "left", left + "px");
			
			if(!maskTarget) {
				this.frame.enableEventByName(this.unique);
				this.allBorder.enableEventByName(this.unique);
			}
			
			return this;
		},
		blur : function() {
			this.frame.disableEventByName(this.unique);
			this.allBorder.disableEventByName(this.unique);
			this.all.removeElement();
			
			return this;
		},
		
		getLargestFrame : function() {
			return this.frameTop.getBoundingClientRect().height > this.frameBottom.getBoundingClientRect().height ? this.frameTop : this.frameBottom;
		}
	};
	
	D.addTools("initFocusContent", () => new FocusContent());
})();
