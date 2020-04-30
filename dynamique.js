/*****************************************************/
/***************	Dynamique.js	******************/
/**
 * Framework Dynamique.js
 * Docs/licence : https://www.dynamiquejs.org
 * 
 * Historique des versions :
 * 		- Beta:1.0 => Beta:1.1 : Modification de la fonction extend (V1.0 => 1.1) et déplacement des fonctions save, erase et eraseMultiple de selector.js à dynamique.js
 * 		- Beta:1.1 => Beta:1.2 : Modification de la fonction splice (V1.0 => 1.1) et optimisation de celle-ci
 * 		- Beta:1.2 => Beta:1.3 : Modification de la fonction save (V1.0 => 1.1)
 * 		- Beta:1.3 => Beta:1.4 : Modification de l'introduction des plugIns et outils : les plugIns et outils sont introduit directement dans les objets afin d'éviter l'appelle d'une fonction et donc réduire le temps de mise en place de dynamique dans le document
 * 								 Le temps de mise en place est passé en moyenne de 0.250ms à 0.075ms
 *		- Beta:1.4 => Beta:1.5 : Modification de la fonction each, les arguments fournit à la fonction à exécuter sur chaque élément ont changé
 *		- Beta:1.5 => Beta:1.6 - 31/01/13: Modification de la fonction concat, splice et save. Introduction du nouveau plug-in getSave
 * 		- Beta:1.6 => Beta:1.7 - 16/10/13 : Modification de la fonction setSelector
 * 		- Beta:1.7 => Beta:1.8 : Modification de la fonction changeValue (V1.1 => 1.2), concat (V1.1 => 1.2), slice (V1.0 => 1.1), erase (V1.1 => 1.2), introduction du nouvel outil initPlugIn
 * 		- Beta:1.8 => Beta:1.9 - 20/06/16 : Ajout de la fonction callFct et getElement
 * 		- Veta:1.9 => Beta:2.0 - 24/04/17 : Suppression du PlugIn "each" (utiliser .map ou forEach à la place) et de la fonction getSave; Modification des fonctions Dynamique (V1.2 => 1.3), splice (V1.2 => 1.3) et slice (V1.1 => 1.2); application de ES6 au code et ajout du "use strict"; Ajout du fonctionnement extendWith.
 * 		- Veta:2.0 => Beta:2.1 - 31/01/2019 : Suppression du PlugIn "extend" (utiliser Object.assign à la place) et "changeValue"
 * 
 * Internal Data:
 * @Name: DynamiqueObjt
 * @Type: Parent
 * @Parent: []
 * @UseAsParent: true
 * @Dependencies: []
 * @Version: 1.0
 * @Date: 31/01/2019
 * @Compatibilities: ["ES6"]
 */

"use strict";

(function(DName) {
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: Base
	 * @version: 1.0
	*/
	
		/***** Fonction Dynamique *****/
		// Cette fonction a pour but d'étendre un tableau contenant les éléments retournés par la recherche et étendue des plug-ins alors présent dans Dynamique
		// @param : Tout les paramétres sont directement fournit au sélecteur, pour connaitre les arguments à fournir reportez-vous à la documentation du selecteur utilisé
		// @return : {Array}, le tableau contenant les valeurs retourné par la recherche et étendue des plugIn alors présent dans Dynamique
		// Version : 1.3
		// Version : 1.0 => 1.1 : Le sélecteur est dorénavant appellé avec la fonction .apply pour que la totalité des arguments lui soit donnée
		// Version : 1.1 => 1.2 : Il n'est plus vérifié qu'un sélecteur à bien été déclaré avant son appel via apply
		// Version : 1.2 => 1.3 : Prise en charge de la création d'élément dom si useAsDomCreator est défini et que @param[0] est un objet et de la fonction extendWith
		
			window.Dynamique = window[DName] = function(first) {
				const 	arr = (Dynamique.domCreator && Object.prototype.toString.call(first) == "[object Object]" ? Dynamique.domCreator : Dynamique.selector).apply(this, arguments);
						arr.context = this;
				
				if(Dynamique.extendWith) {
					let length = Dynamique.extendWith.length;
					while(length--) {
						arr[Dynamique.extendWith[length]] = Dynamique.plugIn[Dynamique.extendWith[length]];
					}
					
					Dynamique.extendWith = null;
					
					return arr;
				}
				else {
					return Object.assign(arr, Dynamique.plugIn);
				}
			};
		
		/***** FIN Fonction Dynamique *****/
	
		Dynamique.module = {};
		Dynamique.plugIn = Dynamique.plugin = { selector : Dynamique };
		Dynamique.tools  = {};
		
		Dynamique.addModule = (name, value) => Dynamique.tools.changeValue(Dynamique.module, name, value);
		Dynamique.addPlugIn = (name, value) => Dynamique.tools.changeValue(Dynamique.plugIn, name, value);
		Dynamique.addTools 	= (name, value) => Dynamique.tools.changeValue(Dynamique.tools, name, value);
		Dynamique.version 	= "1.0";
		
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: ExtendWith
	 * @version: 1.0
	*/
	
		/***** Fonction extendWith *****/
		// La fonction extendWith permet de spécifier de quelle(s) méthode(s) le prochain tableau Dynamique doit être étendue
		// Synthaxe: Dynamique.setExtendWith(name1 [, ...nameN]);
		//	 	name1...nameN: {String}, nom du plugin dont il faudra étendre la prochaine sélection Dynamique
		// @return: contexte englobant (Dynamique)
		// Version: 1.0
		
			Dynamique.extendWith = null;
			Dynamique.setExtendWith = function() {
				extendWith = arguments;
				
				return this;
			};
		
		/***** FIN Fonction extendWith *****/
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: SetSelector
	 * @version: 1.0
	*/
	
		/***** Fonction setSelector *****/
		// Synthaxe: Dynamique.setSelector(selector);
		//	 	selector: {Function}, fonction à utiliser pour sélectioner des éléments DOM avec Dynamique
		// @return: contexte englobant (Dynamique)
		// Version: 1.0
		
			Dynamique.selector = document.querySelectorAll;
			Dynamique.setSelector = function(selector) {
				Dynamique.selector = selector;
				
				return this;
			};
		
		/***** FIN Fonction setSelector *****/
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: SetDomCreator
	 * @version: 1.0
	*/
	
		/***** Fonction setDomCreator *****/
		// Synthaxe: Dynamique.setDomCreator(domCreator);
		//	 	domCreator: {Function}, fonction à utiliser pour créer des éléments DOM avec Dynamique
		// @return : contexte englobant
		// Version : 1.0
		
			Dynamique.domCreator = null;
			Dynamique.setDomCreator = function(domCreator) {
				Dynamique.domCreator = domCreator;
				
				return this;
			};
		
		/***** FIN Fonction setDomCreator *****/
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: Build
	 * @version: 1.0
	*/
	
		/***** Fonction build *****/
		// Synthaxe: Dynamique.build(fct, ret);
		//	Où:
		//	 	fct: {Function}, fonction à appeler
		//	 	ret: {Boolean}, indique si le retour doit être le context englobant (false) ou le de retour @fct (true)
		// @return : contexte englobant
		// Version : 1.0
		
			Dynamique.build = function(fct, ret) {
				return ret ? function(...arg) {
					return fct.apply(null, [this].concat(arg));
				} : function(...arg) {
					fct.apply(null, [this].concat(arg));
					
					return this;
				};
			};
		
		/***** FIN Fonction build *****/
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @type: parent
	 * @name: Plugin
	 * @UseAsParent: true
	 * @version: 1.0
	*/
	
		/***** NEW FRAGMENT *****/
		/**
		 * @name: Concat
		 * @version: 1.0
		*/
		
			/***** Fonction concat *****/
			// Le plugin concat permet de fusionner le tableau dynamique avec les N éléments passer en arguments sachant que : si l’argument est un tableau, chaque élément de ce dernier sera étendue dans dynamique et si une entrée de ce tableau est un tableau il sera ajouté directement (il n'y à pas de récursivité), dans tous les autres cas, la variable est directement ajouter au tableau.
			// @param[0] : {All}, l'élément à ajouter au tableau dynamique
			// @param[N] : {All}, le Néme élément à ajouter au tableau dynamique
			// @return : {Array}, la tableau dynamique
			// Version : 1.2
			// Version : 1.0 => 1.1 : Prise en charge de la note de compatibilité n°6
			// Version : 1.1 => 1.2 : Prise en charge de la note de rapidité n°13, remplacement de l'utilisation de getType() par son code (cf. fonction getType)
			// Tests effectués: remplacer l'ajout manuel par l'appel de Array.prototype.concat.call puis remplir this avec les valeurs retournées, finalité: la fonction acutelle est extremement plus rapide (12ms contre 4600ms)
			
				Dynamique.plugin.concat = function() {
					for(let i = 0, length = arguments.length; i < length; i++) {
						if(Object.prototype.toString.call(arguments[i]) == "[object Array]") {
							const elem = arguments[i];
							for(let y = 0, elemLength = elem.length; y < elemLength; y++) {
								this[this.length] = elem[y];
							}
						}
						else {
							this[this.length] = arguments[i];
						}
					}
						
					return this;
				};
			
			/***** FIN Fonction concat *****/
	
		/***** END FRAGMENT *****/
	
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: Slice
		 * @version: 1.0
		*/
		
			/***** Fonction slice *****/
			// La fonction slice permet de récupérer les éléments se trouvant dans les intervalles donnés
			// @param[0] : {Number}, Le début de l'intervalle dont les éléments doivent être récupérer (l'élément portant le nombre indiqué sera également récupéré)
			// @param[1] : {Number}, La fin de l'intervalle commencé en @param[1] (l'élément portant le nombre indiqué NE SERA PAS récupéré)
			// @param[N] :	{Number}, Le début du Néme intervalle dont les éléments doivent être récupérer 
			// @param[N+1] : {Number}, La fin du Néme intervalle commencé en @param[N]
			// @return : {Array}, le tableau dynamique
			// NOTE : le dernier arguments est facultatif, si rien n'est fournit, équivalent à Infinity : .slice(0, 1, 5) == .slice(0, 1, 5, Infinity);
			// Version : 1.2 - 26/04/2017
			// Version : 1.0 => 1.1 : Refonte de la fonction, prise en charge de la note de rapidité n°11
			// Version : 1.1 => 1.2 : Amélioration des performances et mise à niveau ES6
			
				Dynamique.plugin.slice = function() {
					const 	argLength	= arguments.length,
							retour 		= [];
					let 	pos = 0;
					
					B:for(let y = 0, length = this.length; y < length; y++) {
						for(let i = 0; i < argLength; i += 2) {
							const 	start = arguments[i] < 0 ? length + arguments[i] : arguments[i],
									end = (arguments[i+1] < 0 ? length + arguments[i+1] : (arguments[i+1] || Infinity));
							
							if(y >= start && y < end) {
								retour[pos++] = this[y];
								
								continue B;
							}
						}
					}
					
					this.length = 0;
					
					while(pos--) {
						this[pos] = retour[pos];
					}
					
					return this;
				};
					
			/***** FIN Fonction slice *****/
	
		/***** END FRAGMENT *****/
	
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: Splice
		 * @version: 1.0
		*/
		
			/***** Fonction splice *****/
			// La fonction splice permet de supprimer les éléments se trouvant dans l'intervalle donné et de les remplacer
			// @param[0] : {Number}, Le début de l'intervalle dont les éléments doivent être supprimé (l'élément portant le nombre indiqué sera également supprimé)
			// @param[1] : {Number}, La fin de l'intervalle commencé en @param[1] (l'élément portant le nombre indiqué sera également supprimé)
			// @param[2] : {All}, Le premier élément à utiliser pour le remplacement des éléments supprimés
			// @param[N] : {All}, Le Néme élément à utiliser pour le remplacement des éléments supprimés
			// @return : {Array}, le tableau dynamique
			// Version : 1.3
			// Version : 1.0 => 1.1 : Prise en charge de la note de rapidité 5 et optimisation global de la fonction
			// Version : 1.1 => 1.2 : Amélioration du remplacement des éléments du tableau, l'opérateur "+" n'est plus disponible, utiliser Infinity à la place
			// Version : 1.2 => 1.3 : Réécriture ES6, refond de la fonction pour amélioration des performances
			
				Dynamique.plugin.splice = function(start, end) {
					const 	length = this.length,
							argLength = arguments.length,
							retour = [];
					
					let pos = 0,
						done = false;
					
					if(start < 0) {
						start = length - start;
					}
					
					end += start;
					
					for(let i = 0; i < length; i++) {
						if(i >= start && i < end) {
							if(!done) {
								for(let y = 2; y < argLength; y++) {
									retour[pos++] = arguments[y];
								}
							
								done = true;
							}
						}
						else {
							retour[pos++] = this[i];
						}
					}
					
					this.length = 0;
					
					while(pos--) {
						this[pos] = retour[pos];
					}
					
					return this;
				};
			
			/***** FIN Fonction splice *****/
		
		/***** END FRAGMENT *****/
	
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: Save
		 * @version: 1.0
		*/
		
			/***** Fonction save *****/
			// Cette fonction permet de sauvegarder le tableau courant dans un objet donné en argument
			// @param[0] : {String}, le nom à donné à cette sauvegarde
			// @param[1] : {Object|False}:facultatif, l'élément dans lequel doit être stocké le tableau une fois copié. Par défaut ou si une valeur équivalent à false est founie, le tableau dynamique actuel sera utilisé comme lieu de sauvegarde
			// @param[2] : {Boolean}:facultatif, indique si l'élement sauvegardé doit être retourné à la place de l'élément parent
			// @return : {Dynamique}, l'objet parent ou l'élément sauvegardé en fonction de @param[3]
			// Version : 1.4
			// Version 1.1 => 1.2 : Le lieu de stockage par défaut devient le tableau dynamique actuel en lui même (@param[1])
			// Version 1.2 => 1.3 (07/01/2015) : Si aucun argument n'est donné, la fonction se comporte désormé comme si elle recevait "true" comme premier argument :"save(true)"
			// Version 1.3 => 1.4 (26/04/2017) : Ajout du @param[3]. Le context est maintenant modifié. Auparavant, le premier argument devait être un booleen pour faire un copie du tableau, désormais cette copie est faite dès qu'il n'y a pas d'argument
			// NOTE : cette fonction peut-être appliquée à tous les objets js
			
				Dynamique.plugin.save = function(name, where, continu) {
					if(arguments.length) {
						where = where || this;
						
						where[name] = Object.assign([], this, { context : this });
						
						return continu ? where[name] : this;
					}
					else {
						return Object.assign([], this, { context : this });	// Plus rapide que Dynamique(this)
					}
				};
			
			/***** FIN Fonction save *****/
	
		/***** END FRAGMENT *****/
	
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: EraseMultiple
		 * @version: 1.0
		*/
		
			/***** Fonction eraseMultiple *****/
			// Permet de supprimer/filtrer les éléments en doubles dans un tableau tout en gardant les autres propriétés ou méthode de l'objet
			// @param : NONE
			// @this : {Array}, le tableau à filtrer
			// @return : {Array}, le tableau filtrer
			// Version : 1.0
			
				Dynamique.plugin.eraseMultiple = function() {
					for(let i = 0; i < this.length; i++) {
						for(let y = 0; y < this.length; y++) {
							if(i != y && this[i] == this[y]) {
								for(let z = i; z < this.length; z++) {
									this[z] = this[z + 1];
								}
								
								i--;
								this.pop();	// Plus rapide qu'utiliser this.length = 0 et de remplir le tableau à la main
							}
						}
					}
					
					return this;
				};
			
			/***** FIN Fonction eraseMultiple *****/
	
		/***** END FRAGMENT *****/
	
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: Erase
		 * @version: 1.0
		*/
		
			/***** Fonction erase *****/
			// Cette fonction permet de supprimer tout les éléments d'un tableau
			// @param : NONE
			// @this : {Array}, le tableau dont tout les éléments doivent être supprimé
			// @return : {Array}, le tableau dont le fonction à été appellé
			// Version : 1.2
			// Version : 1.0 => 1.1 : Refonte de la fonction, amélioration des performances en modifiant le type de boucle effectué (de for(;i < length;i++) à while(this.length--))
			// Version : 1.1 => 1.2 : Refonte de la fonction, amélioration des performances en n'utilisant plus de boucle
			// NOTE : l'utilisation de slice est à exclure car reprit dans dynamique.js et donc plus lente qu'une boucle avec pop() (test effectué et confirmé)
			
				Dynamique.plugin.erase = function() {
					this.length = 0;
					
					return this;
				};
					
			/***** FIN Fonction erase *****/
	
		/***** END FRAGMENT *****/
	
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: CallFct
		 * @version: 1.0
		*/
		
			/***** Fonction callFct *****/
			// Cette fonction permet de récupérer un élément du tableau
			// @param[0] : {String}, le nom de la fonction à appeler
			// @param[N] : {String}, le Neme nom de la fonction à appeler
			// @return : {Array}, this, le tableau Dynamique
			// Version : 1.0 - 20/06/2016
			
				Dynamique.plugin.callFct = function() {
					const argLength = arguments.length;
					for(let i = 0, length = this.length; i < length; i++) {
						for(let y = 0; y < argLength; y++) {
							this[i][arguments[y]]();
						}
					}
					
					return this;
				};
				
			/***** FIN Fonction callFct *****/
	
		/***** END FRAGMENT *****/
	
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: GetElement
		 * @version: 1.0
		*/
		
			/***** Fonction getElement() *****/
			// Cette fonction retourne l'élement arguments[i] du tableau dynamique ou un tableau vide s'il n'existe pas
			// @arg[0] : {Number}, Le numéro de l'élément à retourner
			// @arg[N] : {Number}, Le Néme élément numéro de l'élément à retourner
			// @arg[Last-1] : {Boolean}, Indique si le tableau d'élément doit écraser (true) ou non le tableau actuel
			// @arg[Last] 	: {Boolean}, Indique dans le cas ou @arg[Last-1] n'indique pas d'écraser le tableau si le tableau retourné est un tableau Dynamique (true) ou un tableau simple
			// @return : {Dynamique|Array}, le tableau avec les éléments
			// Version : 1.2 27/10/2017
			// Version : 1.0 (20/06/2016) => 1.1 : Mise à jour ES6; Les valeurs peuvent désormais être négative, indiquant alors que c'est la case à la position longueur du tableau - arguments qui doit être sélectionnée
			// Version : 1.1 => 1.2 : Si un nouveau tableau doit être remplie, ce sera par défaut un tableau dynamique et non plus un tableau simple qui sera retourné
			
				Dynamique.plugin.getElement = function() {
					const 	replace = arguments.length && arguments[arguments.length - 2] === true,
							type 	= arguments.length && arguments[arguments.length - 1] === true,
							length = arguments.length - replace - type,
							retour = (!replace && type) ? [] : Dynamique(),
							targetLength = this.length;
					
					for(let i = 0; i < length; i++) {
						let pos = arguments[i] < 0 ? targetLength + arguments[i] : arguments[i];
						
						if(this[pos]) {
							retour[i] = this[pos];
						}
					}
					
					if(replace) {
						this.length = 0;
						
						let len = retour.length-1;
						
						while(len >= 0) {
							this[len] = retour[len--];
						}
						
						return this;
					}
					else {
						return retour;
					}
				};
			
			/***** FIN Fonction getElement *****/
	
		/***** END FRAGMENT *****/
	
		
		/***** NEW FRAGMENT *****/
		/**
		 * @name: ForceRedraw
		 * @version: 1.0
		*/
		
			/***** Fonction forceRedraw *****/
			// Force le navigateur à redessiner la page
			// @arg: NONE
			// @return: this
			
				Dynamique.plugin.forceRedraw = function() {
					document.documentElement.offsetWidth;
					
					return this;
				};
				
			/***** FIN Fonction forceRedraw *****/
	
		/***** END FRAGMENT *****/
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @type: parent
	 * @name: Tools
	 * @Parent: ["DynamiqueObjt"]
	 * @UseAsParent: true
	 * @version: 1.0
	*/
	
		/***** NEW FRAGMENT *****/
		/**
		 * @name: ChangeValue
		 * @version: 1.0
		*/
		
			/***** Fonction changeValue *****/
			// La fonction changeValue à pour but de modifier l'élément parent (this) en fonction des arguments donné en suivant la logique :
			//		- si le premier argument est une chaine de caractère et qu'il y à un second argument, la propriété portant le nom du premier argument sera égal au second argument (ce dernier pouvant être de n'importe quelle nature)
			//		- si le premier argument est un objet ou un tableau, l'élément parent sera étendue de tout les arguments donné en utilisant la fonction extend
			// @param[0] : {Object|String}
			// @param[1] : {Object|String}
			// @return : this
			// Version : 1.2
			// Version 1.1 => 1.2 : Amélioration de la compatibilité et des performances : dans la version 1.1, un tableau était créé puis remplit avec les arguments via la fonction push.apply puis il était fournit en paramétres à la fonction extend ci-dessus via extend.apply
				
				Dynamique.tools.changeValue = function(target, objt, value) {
					if(objt instanceof Object) {
						for(let z in objt) {
							if(objt.hasOwnProperty(z)) {
								target[z] = objt[z];
							}
						}
					}
					else if(typeof objt == "string") {
						target[objt] = value;
					}
					
					return target;
				};
					
			/***** FIN Fonction changeValue *****/
			
		/***** END FRAGMENT *****/
		
	
		/***** NEW FRAGMENT *****/
		/**
		 * @name: GetType
		 * @version: 1.0
		*/
		
			/***** Fonction getType *****/
			// Cette fonction permet de connaitre le type réel d'une variable
			// @param : {All}, l'élément à tester
			// @return : {String}, le type de l'élément : "Function", "Array", "Object", "String", "Number", "Boolean"...
			// Version : 1.0
			
				Dynamique.tools.getType = function(elem) {
					return Object.prototype.toString.call(elem).match(/\[\w+ (\w+)\]/)[1];
				};
			
			/***** FIN Fonction getType *****/
			
		/***** END FRAGMENT *****/
		
	
		/***** NEW FRAGMENT *****/
		/**
		 * @name: InitPlugIn
		 * @version: 1.0
		*/
		
			/***** Fonction initPlugIn *****/
			// Cette fonction permet d'initialiser un plug-in en s'occupant de la mise en forme des paramètres et de la mise en forme de la réponse
			// @param[0] : {String}, Le nom du plug-in, si non donné, le nom de la fonction @param[0] sera utilisé
			// @param[1] : {Function}, La fonction à appeller permettant la mise en place du plug-in, cette dernière recevra comme argument :
			// 	@param[0] : {All}, l'élément du tableau dynamique sur lequel il faut appliquer le plug-in
			// 	@param[1] : {Array}, les arguments fournit par l'utilisateur
			// 	@param[2] : {Object|All}, le premier élément fournit par l'utilisateur
			// 	@param[3] : {Array}, la totalité des éléments du tableau dynamique
			// @return : {Object}, Retourne l'objet créé par le plugIn
			// A l'appelle de cette fonction, elle crée un nouveau plug-in qui est une fonction et c'est cette fonction que le développeur voulant utiliser le plug-in utilisera, cette dernière fonctionne avec les arguments suivant :
				// Il y a deux fonctionnement possible pour les arguments, soit le premier argument est un objet dans lequel sont renseigné les paramètres pour le plug-in, soit chaque arguments est renseigné dans un ordre précisé par le plug-in
				// @param[0] : {Object|All}, L'objet contenant tout les paramètre à passer au plug-in ou juste le premier paramètre à lui passer
				// @param[N] : le N-éme paramètre à passer à la fonction
				// @return : {Function}, La fonction à appeller pour mettre en place le plug-in pour chaque élément du tableau dynamique
			// Version : 1.1
			// Version 1.0 => 1.1 : inversement de la position des paramètres pour être similaire à Dynamique.addModule, Dynamique.addPlugIn et Dynamique.addTools
			
				Dynamique.tools.initPlugIn = function(name, fctPlugIn) {
					Dynamique.plugIn[name] = function(first) {
						var i = 0,											// Variable de boucle
							length = this.length,							// Sauvegarde du nombre d'élément
							arg = Array.prototype.slice.call(arguments),	// Conversion des arguments en tableau
							firstReal = first === undefined ? {} : first,	// Mise en forme du premier argument
							retour = [],									// Ce tableau contiendra chaque objet de chaque initialisation du plug-in
							retourPos = 0;
						
						for(; i < length; i++)								// Pour chaque élément du tableau
							retour[retourPos++] = fctPlugIn(this[i], arg, firstReal, this);	// Initialisation du plug-in
						
						if(retourPos == 1)									// Si il n'y a qu'une seule initialisation
							retour = retour[0];								// Retour du seul objet
						
						retour.context = this;								// Ajout du context
						
						return retour;										// Retour du tableau ou si qu'une seule init : l'objet de celle-ci
					};
					
					return Dynamique;
				};
			
			/***** FIN Fonction forAllElem *****/
	
		/***** END FRAGMENT *****/
	
	/***** END FRAGMENT *****/
})("D");
