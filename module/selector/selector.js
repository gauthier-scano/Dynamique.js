/*****************************************************/
/***************	Selector.js		******************/
/**
 * Date : 16/10/2013
 * Version : Beta:1.0
 * Compatiblité : ES6
 * 
 * Les équivalences permettent l'accélération d'une recherche en remplacant des chaines de caractères par d'aure chaine de caractère, par exemple, si "d" à une équivalence d : "div", la recherche "d" renverra tout les div de la page
 */
/*****************************************************/
/*****************************************************/

"use strict";

(function() {
	
	/***** Fonction Selector *****/
	// Cette fonction permet le parcours d'une chaine de caractère et l'appelle de déclencheur
	// @param[0] : {String}, la chaine contenant la recherche à effectuer
	// @param[1] : {Object}, objet d'options tel que:
	//		- .location : {Array|HTMLElement}, le ou les éléments desquelles la recherche doit commencé
	//		- .exclude : {Array}, indique les éléments devant être exclu de la requête
	//		- .cache : {Boolean}, indique si le resultat de la recherche peut être, losque c'est possible, récupéré depuis le cache
	//		- .save : {Boolean}, indique si le resultat de la recherche doit être sauvegardé ou non
	//		- .force : {Boolean}, indique si le résultat de la recherche doit être écrasé si celui-ci a déjà été enregistré
	// @return : {Array}, un tableau contenant les éléments trouvés
	
	const Selector = function(string, options = {}) {
			if(!string) {
				return [];
			}
			else {
				const isString = typeof string == "string";
				
				if(isString) {
					if(typeof options == "string") {
						options = Selector.profil[options];
					}
					
					string = string.replace(/\n/g, " ").trim();	// Remplacement de tout les sauts de ligne par des espaces et des espaces inutiles de début et de fin de chaine
					
					let i = supSpace(string, 0),	// Suppression de tout les caractères inutile en début de chaine ex: "    div" et stockage du début du curseur
						elem = string[i];			// Contiendra chaque caractère un à un
					
					if(!triggersFirst[elem]) {						// Si la chaine ne commence pas par un trigger ex: "div" ou "  div"
						string = !i ? Selector.startWith + string : string.slice(0, i) + Selector.startWith + string.slice(i);
						elem = Selector.startWith;
					}
					
					var	HTMLElem = 	(options.location ? options.location :
									(Selector.isArrayOrCollection(this) ? this :
									(Selector.startWithDom[elem] ? Selector.location : slice.call(document.getElementsByTagName("*")))));
					
					if(!(HTMLElem instanceof Array)) {
						HTMLElem = [HTMLElem];
					}
					
					var location = HTMLElem;
					
					if((options.cache || Selector.cache) && saveQuery[string]) {
						const 	target = saveQuery[string],
								locationLength = location.length;
						
						for(let i = 0, length = target.length; i < length; i++) {
							const 	targetContext = target[i].context,
									length = targetContext.length;
							
							if(targetContext.length == length) {
								let verif = true;
								
								B:for(let y = 0; y < length; y++) {
									const act = targetContext[y];
									
									for(let z = 0; z < locationLength; z++) {
										if(act == location[z]) {
											continue B;
										}
									}
									
									verif = false;
									break;
								}
								
								if(verif) {
									return target[i].result;
								}
							}
						}
					}
					
					for(let triggerString; (elem = string[i++]); ) { // Pour chaque caractère composant la chaine
						triggerString = elem + string[i];			// On stocke la concaténation du caractère actuel et du caracère suivant
						
						if(Selector.triggers[triggerString]) {	// On vérifie que le caractre actuel associé au caractère suvant n'est pas un trigger, si c'est le cas
							elem = triggerString;				// Le caractère actuel deviens l'association de ces deux caractères
							i++;								// Incrémentation du curseur
						}
						
						if(Selector.triggers[elem]) {			// si le trigger existe bien
							HTMLElem = Selector.triggers[elem](string, supSpace(string, i), HTMLElem);
							
							i = HTMLElem.stopAt;				// Mise à jour du curseur
							HTMLElem = HTMLElem.HTMLElem;		// Mise à jour des éléments HTML/XML
						}
					}
				}
				else if(Selector.isArrayOrCollection(string)) {	// Si l'élément donné est un tableau ou une liste d'élément de noeuds
					var HTMLElem = slice.call(string);			// Retour de ces derniers converti en tableau
				}
				else {
					var HTMLElem = [string];					// Transformation de la variable stocké dans un tableau
				}
				
				const exclude = options.exclude || Selector.exclude;
				if(exclude.length) {
					const retour = [];
					
					for(let z = 0, length = HTMLElem.length; z < length; z++) {
						if(arrayIndexOf.call(exclude, HTMLElem[z]) == -1) {
							retour[retour.length] = HTMLElem[z];
						}
					}
					
					HTMLElem = retour;
				}
				
				if(isString && (options.save || Selector.save)) {
					if(!saveQuery[string]) {
						saveQuery[string] = [];
					}
					
					saveQuery[string][saveQuery[string].length] = {
						context : location,
						result : HTMLElem
					};
				}
				
				return HTMLElem;
			}
		},
				
	/***** FIN Fonction Selector *****/
	
	/***** Fonction supSpace *****/
	// Cette fonction incrémente un curseur donné tant que le caractère d'espacement est trouvé en début de chaine
	// @param : {String}, la chaine à traiter
	// @param : {Number}, le curseur à incrémenter
	// @return : {Number}, le curseur
	
		supSpace = function(string, i) {
			while(string[i] == Selector.spaceChar) {
				i++;
			}
			
			return i;
		};
			
	/***** FIN Foncion supSpace *****/
	
	/***** Fonction isArray *****/
	// Cette fonction permet de savoir si l'élément donné est un tableau
	// @param : {All}, l'élément à tester
	// @return : {Boolean}, si true : l'élément est un tableau, si false : l'élément n'est pas un tableau
		
		Selector.isArrayOrCollection = function(elem) {
			const type = toString.call(elem);
			
			return type == "[object HTMLCollection]" || type == "[object Array]" || type == "[object NodeList]";
		};
	
	/***** FIN Fonction isArray *****/
	
	const 	toString = Object.prototype.toString,
			stringIndexOf = String.prototype.indexOf,
			arrayIndexOf = Array.prototype.indexOf,
			slice = Array.prototype.slice,
			triggersFirst = {},			// Contient la première lettre de tout les déclencheurs
			saveQuery = {};
	
	Selector.triggers = {};			// Contient tout les déclencheurs
	Selector.startWithDom = {};		// Contient les déclencheurs pour lesquels la recherche se fait en respectant la descendance du dom
	Selector.startWith = "";		// Indique le caractère correspondant à la fonction qui sera utilisé si aucun trigger n'est employé au début (cf. fonction Selector)
	Selector.spaceChar = " ";		// Indique le caractère qui sert d'espace
	Selector.equivalence = {};		// Contient les caractères et leur équivalence ex: { "b" : "body" }
	Selector.exclude = [];
	Selector.location = [document];
	Selector.save = false;
	Selector.cache = false;
	
	Selector.profil = {
		"save" : { save : true },
		"cache" : { cache : true },
		"sa&ca" : { cache : true, save : true },
		"noCache" : { cache : false },
		"force" : { save : true, force : true }
	};
	Selector.createProfil = function(name, exclude, location, cache, save) {
		const profil = Selector.profil[name] = {};
		
		if(exclude) 	provil.exclude = exclude;
		if(location) 	provil.location = location;
		if(cache) 		provil.cache = cache;
		if(save) 		provil.save = save;
		
		return this;
	};
	Selector.deleteProfil = function() {
		for(let i = 0, length = arguments.length; i < length; i++) {
			delete Selector.profil[arguments[i]];
		}
		
		return this;
	};
	
	/***** Fonction parseString *****/
	// les "condition" annule les "traitment", "close", "conditionPrio" et les "conditionTrait" tant que le caractère de fermeture n'est pas atteint
	// les "conditionPrio" annule les "close" tant que le caractère de fermeture n'est pas atteint
	// Les "conditionTrait" annule les "close" et les "traitment"
	// les "traitment" permettent d'effectuer des opérations sur la chaîne
	// les "close" déterminent les caractéres fermant
	// NOTE : 	- A partir du moment où une conditionPrio est ouverte, il faut qu'elle soit refermé par son caractère désigné mais il est tout à fait possible d'utiliser son caractère fermant sans l'avoir ouvert (Ex: "'(ok', (ok))" renverra "(ok, ok)");
	//			- Les "condition" et "conditionPrio" sont limitées à un caractère en ouverture et en fermeture
	//			- Les "conditionTrait" sont limités à un caractère
	//			- Les "traitment" sont limités à deux caractères
	//			- Les "close" cont limités à deux caractères
	
		const parseString = function(object) {
			var condition = object.condition || {},		// Les "condition" annulent les "traitment", les "conditionPrio" et les "close", une seul condition ne peut-être ouverte à la fois
				willCloseCondition = false,				// Cette variable contiendra le caractère qui fermera la condition
				
				conditionPrio = object.conditionPrio || {},	// Les "conditionPrio" annulent uniquement les "close", plusieurs conditionPrio peuvent être ouverte mais elles doivent toutes être refermé
				conditionPrioClose = [],					// Ce tableau contiendra tout les caractères qui correspondront chacun à une ouverture d'une condition
				
				conditionTrait = object.conditionTrait || {},
				willCloseConditionTrait = false,
				
				traitment = object.traitment || {},
				traitmentWork,
				traitmentString,
				
				close = object.close || {},
				closeString,
				
				toUpper = object.toUpperCase,
				string = object.string,
				i = object.pos,
				
				willRemoveNext,
				hasOpenedConditionTrait,
				
				copySpace = object.copySpace,
				equi = Selector.equivalence,
				
				str = "",
				retour = [],
				actual = [],
				elemA = [];
			
			BStr:for(let length = string.length; i < length; i++) {
				var elem = string[i],
					next = i + 1,
					nextElem = string[next];
				
				if(elem === willCloseConditionTrait && !willCloseCondition) {
					traitment[elem] = conditionTrait[hasOpenedConditionTrait].close;
					willCloseConditionTrait = false;
					willRemoveNext = true;
				}
				
				if(elem === conditionPrioClose[conditionPrioClose.length - 1]) {
					conditionPrioClose.pop();
				}
				else if(elem === willCloseCondition) {
					willCloseCondition = false;
				}
				else if(conditionPrio[elem] && !willCloseCondition) {
					conditionPrioClose[conditionPrioClose.length] = conditionPrio[elem];
				}
				else if(condition[elem]) {
					willCloseCondition = condition[elem];
				}
				else if(!willCloseCondition && !willCloseConditionTrait) {
					if(conditionTrait[elem]) {
						willCloseConditionTrait = conditionTrait[elem].closeChar;
						hasOpenedConditionTrait = elem;
						traitment[elem] = conditionTrait[elem].open;
					}
					else if((!conditionPrioClose.length && (close[elem] || close[elem + nextElem])) || next == string.length) {
						closeString = elem + nextElem;
						
						if(close[closeString]) {
							break;
						}
						else if(close[elem]) {
							closeString = elem;
							break;
						}
						else if(i == string.length) {
							str += elem;
							break;
						}
					}
					
					if(traitment[elem] || traitment[elem + nextElem]) {
						traitmentString = elem + nextElem;
						traitmentWork = traitment[traitmentString];
						
						if(!traitmentWork) {
							traitmentString = elem;
							traitmentWork = traitment[elem];
						}
						else {
							i = next;
						}
						
						if(willRemoveNext) {
							delete traitment[elem];
							willRemoveNext = false;
						}
						if(equi[str] && !condition[string[i - 1]]) // !condition[string[i - 1]] => Nécessaire pour le cas ou les équivalence ne doivent pas être pris en compte dans les sélecteur, exemple pour equi = { d : "div" } : [id = 'd'] ne prend pas compte de l'équi, [id = d] prend compte de l'équi
							str = equi[str];
						
						if(toUpper)
							str = str.toUpperCase();
						
						if(traitmentWork == "save")	{			// Permet de sauvegarder la chaine courante au tableau et d'en créer un nouveau
							elemA[elemA.length] = str;
							actual[actual.length] = elemA;
						}
						else if(traitmentWork == "create") {	// Permet de sauvegarder la chaine courante aux résultats, d'en créer un nouveau, d'y ajouter la chaine activant ce traitement et de créer un nouveau tableau
							elemA[elemA.length] = str;
							actual[actual.length] = elemA;
							retour.push(actual, [traitmentString]);
							actual = [];
						}
						else if(traitmentWork == "ignore") {
							continue BStr;
						}
						else if(traitmentWork == "new") {		// Permet de sauvegarder la chaine couranteaux résultats, d'en créer un nouveau et de créer un nouveau tableau
							elemA[elemA.length] = str;
							actual[actual.length] = elemA;
							retour[retour.length] = actual;
							actual = [];
						}
						else {
							elemA[elemA.length] = str;
						}
							
						if(traitmentWork != true) {
							elemA = [];
						}
							
						str = "";
					}
					else if(elem != " " || copySpace) {
						str += elem;
					}
				}
				else {
					str += elem;
				}
			}
			
			if(willCloseCondition || conditionPrioClose.length || willCloseConditionTrait) {
				throw Error("Selector.js - Bad string format: \"" + object.string + "\".");
			}
			else {
				if(equi[str] && !condition[string[i - 1]]) { // !condition[string[i - 1]] => Nécessaire pour le cas ou les équivalence ne doivent pas être pris en compte dans les sélecteur, exemple pour equi = { d : "div" } : [id = 'd'] ne prend pas compte de l'équi, [id = d] prend compte de l'équi
					str = equi[str];
				}
				
				if(toUpper) {
					str = str.toUpperCase();
				}
				
				elemA[elemA.length] = str;
				actual[actual.length] = elemA;
				retour[retour.length] = actual;
			}
			
			return {
				result : retour,
				lastStr : str,
				closeAt : i,
				close : closeString
			};
		};
	
	/***** FIN fonction parseString *****/
	
	
	/***** Fonction addTrigger *****/
	// Cette fonction permet d'ajouter un trigger, c'est à dire une fonction qui sera déclenché lorsqu'une chaine de caractère donné sera détecté
	// @param : indique le nom que porte le trigger, c'est aussi la chaine qui permettra de déclencher ce trigger
	// @pram : la fonction à appellé lorsque la chaine de caractère fournit en param1 sera trouvé
	// @param : {Object}
	//		- .default : indique si la fonction donnée en argument doit être celle utilisé lorsque la recherche ne commence pas par un filtre
	//		- .startWithDom : indique si la recherche doit se faire en suivant l'arbre Dom ou s'effectué sur l'ensemble des éléments
	//		- .useAdEspChar : indique si le caractère identifiant du trigger doit être considéré comme le caractère de séparation
	// @return : {Function}, selector
	
		Selector.addTrigger = function(name, fct, laws = {}) {
			if(laws.useAsDefault) {						// Si la fonction fournit doit être utilisé par défaut lors d'une recherche (cf. fonction Selector)
				Selector.startWith = name;				// Sauvegarde du nom du trigger
			}
			
			if(laws.startWithDom) {						// Si ce trigger commence sa recherche en utilisant le dom
				Selector.startWithDom[name] = true;		// Sauvegarde de l'élément
			}
			
			if(laws.useAsEspChar) {				// Si la chaine de caractère doit être utilisé comme sépérateur
				Selector.spaceChar = name;		// Sauvegarde de la chaine
			}
			
			Selector.triggers[name] = fct;		// Sauvegarde du déclencheur
			triggersFirst[name[0]] = fct;		// Sauvegarde du premier caractère du déclencheur
			
			return this;
		};
	
	/***** FIN Fonction addTrigger *****/
	
	
	/***** Fonction setDefaultSelector *****/
	// Cette fonction permet d'initialiser un nouveau trigger de départ lorsqu'une chaine est lue, par défaut le trigger est " "
	// @param[0] : {String}, le caractère du trigger (ex: "#", si l'on souhaite utiliser que des id)
	// @return : {Object}, Selector
	
		Selector.setDefaultSelector = function(select) {
			if(Selector.triggers[select]) {
				Selector.startWith = select;
			}
			
			return this;
		};
	
	/***** FIN Fonction setDefaultSelector *****/
	
	
	/***** Partie C : Mise en place des fonctions standard *****/
	
		const basicCondition = {
				"'" : "'",
				'"' : '"'
			},
				
			basicConditionPrio = {
				'(' : ')'
			},
			
			defaultOr = function(string, pos, upper) {
				return parseString({
					string : string,
					pos : pos,
					toUpperCase : !upper,
					close : Selector.triggers,
					condition : basicCondition,
					conditionPrio : basicConditionPrio,
					traitment : {
						"|" : true
					}
				});
			},
				
			defaultAndOr = function(string, pos, close = Selector.triggers) {
				return parseString({
					string : string,
					pos : pos,
					close : close,
					condition : basicCondition,
					conditionPrio : basicConditionPrio,
					traitment : {
						"|" : true,
						"&" : "new"
					}
				});
			},
			
			filterOrStandard = function(string, pos, HTMLElem, prop) {
				const	parseStr = defaultOr(string, pos, true),
						value = parseStr.result[0][0],
						valueLength = value.length,
						retour = [];
				
				BHTML:for(let i = 0, length = HTMLElem.length; i < length; i++) {
					const elem = HTMLElem[i][prop];
					
					for(let y = 0; y < valueLength; y++) {
						if(elem && (elem == value[y] || value[y] == "*")) {
							retour[retour.length] = HTMLElem[i];
							
							continue BHTML;
						}
					}
				}
				
				return { HTMLElem : retour, stopAt : parseStr.closeAt };
			};
			
	/***** FIN Partie C : Mise en place des fonctions standard *****/
	
	
	/***** Selecteurs *****/
	
		/***** Selecteur " " *****/
		// Ce sélecteur permet de sélectionner les éléments descendants d'un élément
		// Opération supporté : "|"
		
			Selector.addTrigger(" ", function(string, pos, HTMLElem) {
				const noValue = Selector.triggers[string[pos]]; // !string
				
				if(noValue) {
					if(Selector.startWithDom[string[pos]]) {
						return { HTMLElem : HTMLElem, stopAt : pos };
					}
					else {
						string = "*";
					}
				}
				
				const 	parseString = defaultOr(string, noValue ? 0 : pos),
						value = parseString.result[0][0],
						valueLength = value.length,
						retour = [];
				
				for(let i = 0, HTMLLength = HTMLElem.length; i < HTMLLength; i++) {
					if(HTMLElem[i].getElementsByTagName) {
						for(let y = 0; y < valueLength; y++) {
							const elem = HTMLElem[i].getElementsByTagName(value[y]);
							
							for(let z = 0, length = elem.length; z < length; z++) {
								if(retour.indexOf(elem[z]) == -1) {
									retour[retour.length] = elem[z];
								}
							}
						}
					}
				}
				
				return { HTMLElem : retour, stopAt : noValue ? pos : parseString.closeAt };
			}, {
				startWithDom : true,	// Démarrera avec le dom
				useAsDefault : true,	// Ce selecteur sera utilisé si aucun trigger n'est spécifié en début de chaine
				useAsEspChar : true		// Le caractère représentant ce trigger sera utilisé comme chaine d'espace (ici : " ")
			});
		
		/***** FIn Selecteur " " *****/
		
		
		/***** Selecteur ">" *****/
		// Ce selecteur permet de selectionner tout les éléments ayant pour nodeName l'argument donné et qui sont le fils d'un des éléments actuel
		// Opération supporté : "|"
		
			Selector.addTrigger(">", function(string, pos, HTMLElem) {
				const	parseString = defaultOr(string, pos),
						value = parseString.result[0][0],
						valueLength = value.length,
						retour = [];
				
				for(let i = 0, HTMLLength = HTMLElem.length; i < HTMLLength; i++) {
					const children = HTMLElem[i].children || (HTMLElem[i].nodeType == 9 ? [document.documentElement] : []);	// on vérifie que l'on ne traite pas le document, si oui, on lui simule deux enfants: body et head (parenthése necessaire !)
					
					BChild:for(let y = 0, childrenLength = children.length; y < childrenLength; y++) {
						const 	child = children[y],
								nodeName = child.nodeName;
						
						for(let z = 0; z < valueLength; z++) {
							if(nodeName == value[z] || value[z] == "*") {
								retour[retour.length] = child;
								
								continue BChild;
							}
						}
					}
				}
				
				return { HTMLElem : retour, stopAt : parseString.closeAt };
			}, {
				startWithDom : true
			});
		
		/***** FIN selecteur ">" *****/
		
		
		/***** Selecteur "+" *****/
		// Ce selecteur permet de selectionner tout les éléments ayant pour nodeName l'argument donné et qui sont immédiatement précédé des éléments précédemmenet selectionné
		// Opération supporté : "|"
		// Faire selecteur immédiatement suivi ?
			
			Selector.addTrigger("+", function(string, pos, HTMLElem) {
				const	parseString = defaultOr(string, pos),
						value = parseString.result[0][0],
						valueLength = value.length,
						retour = [];
				
				BHTML:for(let i = 0, HTMLLength = HTMLElem.length; i < HTMLLength; i++) {
					const nextElem = HTMLElem[i].nextElementSibling;
					
					if(nextElem) {
						const nodeName = nextElem.nodeName;
						for(let y = 0; y < valueLength; y++) {
							if(nodeName == value[y] || value[y] == "*") {
								retour[retour.length] = nextElem;
								
								continue BHTML;
							}
						}
					}
				}
				
				return { HTMLElem : retour, stopAt : parseString.closeAt };
			}, {
				startWithDom : true
			});
				
		/***** FIN Selecteur "+" *****/
		
		
		/***** Selecteur "~" *****/
		// Ce selecteur permet de selectionner tout les éléments ayant pour tagName l'argument donné et qui sont précédé des éléments précédants
		// Opération supporté : "|"
			
			Selector.addTrigger("~", function(string, pos, HTMLElem) {
				var parseString = defaultOr(string, pos),
					value = parseString.result[0][0],
					valueLength = value.length,
					retour = [];
				
				for(let i = 0, HTMLLength = HTMLElem.length; i < HTMLLength; i++) {
					let elem = HTMLElem[i];
					
					if(elem) {
						while((elem = elem.nextElementSibling)) {
							if(elem.nodeType == 1) {
								const index = arrayIndexOf.call(HTMLElem, elem);
								
								if(index != -1) {
									HTMLElem[index] = 0;
								}
								
								for(let y = 0; y < valueLength; y++) {
									if(elem.nodeName == value[y] || value[y] == "*") {
										retour[retour.length] = elem;
									}
								}
							}
						}
					}
				}
				
				return { HTMLElem : retour, stopAt : parseString.closeAt };
			}, {
				startWithDom : true
			});
				
		/***** FIN Selecteur "~" *****/
		
		
		/***** Selecteur "-" *****/
		// Ce selecteur permet de selectionner le parent de chaque élément
		// Opération supporté : "|"
		
			Selector.addTrigger("-", function(string, pos, HTMLElem) {
				var parseString = defaultOr(string, pos),
					value = parseString.result[0][0],
					valueLength = value.length,
					retour = [];
				
				HTMLE:for(let i = 0, length = HTMLElem.length; i < length; i++) {
					const elem = HTMLElem[i].parentNode;
					
					if(elem && retour.indexOf(elem) == -1) {	// On vérifie que l'on a pas déjà traité l'élément
						const nodeName = elem.nodeName;
						
						for(let y = 0; y < valueLength; y++) {
							if(nodeName == value[y] || value[y] == "*") {
								retour[retour.length] = elem;
								
								continue HTMLE;
							}
						}
					}
				}
				
				return { HTMLElem : retour, stopAt : parseString.closeAt };
			}, {
				startWithDom : true
			});
		
		/***** FIN Selecteur "-" *****/
		
		
		/***** Selecteur "/" *****/
		// Ce selecteur permet de selectionner les fils des éléments courants en fonction de leur numéro de noeud (nodeType)
		// Opération supporté : "|"
		
			Selector.addTrigger("/", function(string, pos, HTMLElem) {
				const 	parseString = defaultOr(string, pos),
						value = parseString.result[0][0],
						valueLength = value.length,
						retour = [];
				
				for(let i = 0, length = HTMLElem.length; i < length; i++) {
					const childNodes = HTMLElem[i].childNodes;
					
					BChild:for(let y = 0, childNodesLength = childNodes.length; y < childNodesLength; y++) {
						const 	child = childNodes[y],
								nodeType = child.nodeType;
						
						for(let z = 0; z < valueLength; z++) {
							if(nodeType == value[z] || value[z] == "*") {
								retour[retour.length] = child;
								
								continue BChild;
							}
						}
					}
				}
				
				return { HTMLElem : retour, stopAt : parseString.closeAt };
			}, {
				startWithDom : true
			});
		
		/***** FIN Selecteur "/" *****/
	
	/***** FIN Selecteurs *****/
	
	
	
	/***** Filtres *****/
		
		/***** Filtre "." *****/
		// Ce filtre permet de sélectionner les éléments dont au moins une des classes est égales a(ux) classe(s) donnée(s)
		// Opération supporté : "|", "&"
		
			Selector.addTrigger(".", function(string, pos, HTMLElem) {
				const	parseStr = defaultAndOr(string, pos),
						value = parseStr.result,
						valueAndLength = value.length,
						retour = [];
				
				BHTML:for(let i = 0, length = HTMLElem.length; i < length; i++) {
					const elem = HTMLElem[i];
					
					BAnd:for(let y = 0; y < valueAndLength; y++) {
						const valueOr = value[y][0];
						
						if(elem.className) {
							const classElem = " " + elem.className + " ";
							
							for(let z = 0, valueOrLength = valueOr.length; z < valueOrLength; z++) {
								if(valueOr[z] == "*" || stringIndexOf.call(classElem, " " + valueOr[z] + " ") != -1) {
									continue BAnd;
								}
							}
						}
						
						continue BHTML;
					}
						
					retour[retour.length] = elem;
				}
				
				return { HTMLElem : retour, stopAt : parseStr.closeAt };
			});
				
		/***** FIN Filtre "." *****/
		
		
		/***** Filtre "$" *****/
		// Ce filtre ne gardera que les éléments dont la propriété value est égal au valeur donné
		// Opération supporté : "|"
		
			Selector.addTrigger("$", function(string, pos, HTMLElem) {
				return filterOrStandard(string, pos, HTMLElem, "value");
			});
				
		/***** FIN Filtre "$" *****/
	
	
		/***** Filtre "#" *****/
		// Ce filtre ne gardera que les éléments dont la propriété id est égal à la valeur donnée
		// Opération supporté : "|"
		
			Selector.addTrigger("#", function(string, pos, HTMLElem) {
				return filterOrStandard(string, pos, HTMLElem, "id");
			});
		
		/***** FIN Filtre "#" *****/
		
		
		/***** Filtre "@" *****/
		// Ce filtre ne gardera que les éléments dont la propriété name est égal au valeur donné
		// Opération supporté : "|"
		
			Selector.addTrigger("@", function(string, pos, HTMLElem) {
				return filterOrStandard(string, pos, HTMLElem, "name");
			});
				
		/***** FIN Filtre "@" *****/
		
		
		/***** Filtre "//" *****/
		// Ce filtre ne gardera que les éléments dont la propriété nodeType est égal au valeur donné
		// Opération supporté : "|"
		
			Selector.addTrigger("//", function(string, pos, HTMLElem) {
				return filterOrStandard(string, pos, HTMLElem, "nodeType");
			});
				
		/***** FIN Filtre "//" *****/
		
		
		/***** Filtre "%" *****/
		// Ce filtre ne gardera que les éléments ayant pour nodeName la valeur donnée
		// Opération supporté : "|"
		
			Selector.addTrigger("%", function(string, pos, HTMLElem) {
				return filterOrStandard(string, pos, HTMLElem, "nodeName");
			});
				
		/***** FIN Filtre "%" *****/
		
		
		/***** Filtre "!" *****/
		// Ce filtre ne gardera que les éléments n'étant pas le résultat du filtre donné
		// Opération supporté : dépend du filtre à inverser
		// NOTE : ce filtre attend un filtre comme argument, il sera passer en étant le(s) premier(s) caractère(s) suivant (ex : "!#id", "!$$un_filtre")
		
			Selector.addTrigger("!", function(string, pos, HTMLElem) {
				let y = 0,		// La supression des espaces est fait précédemment
					filtreName = string[0] + string[++y],
					filtre = Selector.triggers[filtreName];
				
				if(!filtre) {
					filtreName = string[--y];
					filtre = Selector.triggers[filtreName];
					y++;
					
					if(!filtre)
						throw "Mauvaise utilisation du filtre '!'";
				}
				
				let value = Selector(string.slice(y, string.length), { location : HTMLElem }),
					filtreElem = value.HTMLElem,
					retour = [];
				
				for(let i = 0, length = HTMLElem.length; i < length; i++) {	// Pour chaque élément trouvé à l'aide du filtre indiqué
					if(arrayIndexOf.call(filtreElem, HTMLElem[i]) == -1) {	// Si l'élément n'est pas dans la liste renvoyé par le filtre
						retour[retour.length] = HTMLElem[i];				// Ajout de l'élément
					}
				}
				
				return { HTMLElem : retour, stopAt : value.stopAt + 1 };
			});
				
		/***** FIN Filtre "!" *****/
		
		
		/***** Filtre ":" *****/
		
		Selector.addTrigger(":", function(string, pos, HTMLElem) {
			var save = Selector.triggers['-'],	// On sauvegarde le trigger "-"
				save2 = Selector.triggers[':'];
				
			delete Selector.triggers['-'];		// On supprime le trigger "-" pour permettre les noms composés tel que "nth-child" par exemple
			delete Selector.triggers[':'];		// On supprime le trigger ":" car on préferera traiter les ":" comme des "&" que d'arrêter la fonction pour la relancer
			
			string = parseString({
				string : string,
				pos : pos,
				close : Selector.triggers,
				condition : basicCondition,
				conditionTrait : {
					"(" : {
						closeChar : ")",
						open : true,
						close : "ignore"
					}
				},
				traitment : {
					"|" : "save",
					"&" : "new",
					":" : "new"
				}
			});
			
			Selector.triggers['-'] = save;		// On remet le trigger "-"
			Selector.triggers[':'] = save2;		// On remet le trigger ":"
			
			var result = string.result,
				retour = [];
			
			const andLength = result.length;
			
			for(let y = 0; y < andLength; y++) {
				const or = result[y];
						
				for(let z = 0, orLength = or.length; z < orLength; z++) {
					if(pseudoClasses[or[z][0]]) {
						const 	actOr = or[z];
								actOr[0] = pseudoClasses[actOr[0]];
								actOr[1] = actOr[1] || null;
						let		arg = actOr[2] = actOr[1] || "";
						
						if(arg == "even") {
							actOr[1] = pseudoEven;
						}
						else if(arg == "odd") {
							actOr[1] = pseudoOdd;
						}
						else if(arg == "n") {
							actOr[1] = pseudoN;
						}
						else {
							const newArg = arg.match(/(((-?)\d*[n])+)[\+]?(.*)/);
							
							if(newArg) {
								let argT = newArg[4] || 0,
									rep = newArg[2].replace("n", "");
								
								actOr[1] = function(pos) {
									arg = (++pos - argT) / rep;
									
									return pos >= argT && Math.round(arg) == arg;
								};
							}
							else {
								actOr[1] = pos => (pos + 1) == arg;
							}
						}
					}
					else {
						throw Error("Selector.js - filter '" + or[z][0] + "' is undefined");
					}
				}
			}
			
			BHTML:for(let i = 0, HTMLLength = HTMLElem.length; i < HTMLLength; i++) {
				const elem = HTMLElem[i];
				
				BAnd:for(let y = 0; y < andLength; y++) {
					const or = result[y];
					
					for(let z = 0, orLength = or.length; z < orLength; z++) {
						if(or[z][0](elem, or[z][2], or[z][1])) {
							continue BAnd;
						}
					}
					
					continue BHTML;
				}
				
				retour[retour.length] = elem;
			}
			
			return { HTMLElem : retour, stopAt: string.closeAt };
		});
		
		var pseudoEven = pos => pos % 2,
			pseudoOdd = pos => !(pos % 2),
			pseudoN = () => true,
			
			pseudoClasses = {
				// L'élément est-il la racine du document
				"root" : function(elem) {
					return elem.parentNode && elem.parentNode.nodeType == 9 && elem == document.documentElement;
				},
				
				// L'élément est-il le n-éme enfant de son parent (la recherche commence à partir de 0)
				"nth-child" : function(elem, arg, calc) {
					return elem.parentNode && calc(arrayIndexOf.call(elem.parentNode.children || [elem], elem));
				},
				
				// "+" correspond à "+oo" et "-" correspond à "-oo"
				"nth-int-child" : function(elem, argOri) {
					const 	arg = argOri.split(","),
							pos = arrayIndexOf.call(elem.parentNode.children || [elem], elem) + 1;
					
					for(let i = 0, length = arg.length; i < length; i++) {
						if((pos >= arg[i] || arg[i] == "-") && (pos <= arg[++i] || arg[i] == "+")) {
							return true;
						}
					}
					
					return false;
				},
				
				// L'élément est-il le n-éme enfant de son parent en commencant par la fin ? (la recherche commence à partir de 0)
				"nth-last-child" : function(elem, arg, calc) {
					var parent = elem.parentNode.children || [elem];
					
					return calc(parent.length - 1 - arrayIndexOf.call(parent, elem));
				},
				
				// L'élément est-il l'enfant "num"-éme de l'élément parent et de son type
				"nth-of-type" : function(elem, arg, calc) {
					const 	parent = elem.parentNode,
							allChild = parent.children ? parent.getElementsByTagName(elem.nodeName) : [];
					let		y = 0;
						
					for(let i = 0, length = allChild.length; i < length; i++) {
						if(parent == allChild[i].parentNode) {
							if(elem == allChild[i]) {
								break;
							}
							else {
								y++;
							}
						}
					}
					
					return calc(y);
				},
				// "+" correspond à "+oo" et "-" correspond à "-oo"
				"nth-int-type" : function(elem, args) {
					const 	parent = elem.parentNode,
							allChild = parent.children ? parent.getElementsByTagName(elem.nodeName) : [document.documentElement];
					let		arg = args.split(","),
							argLength = arg.length,
							y = 0;
					
					for(let i = 0, length = allChild.length; i < length; i++) {
						if(parent == allChild[i].parentNode) {
							if(elem == allChild[i]) {
								for(let z = 0; z < argLength; z++) {
									if((y + 1 >= arg[z] || arg[z] == "-") && (y + 1 <= arg[++z] || arg[z] == "+")) {
										return true;
									}
								}
								
								break;
							}
							else {
								y++;
							}
						}
					}
					
					return false;
				},
				"nth-last-of-type" : function(elem, arg, calc) {
					const 	parent = elem.parentNode,
							allChild = parent.children ? parent.getElementsByTagName(elem.nodeName) : [];
					let		y = 0;
						
					for(let i = allChild.length - 1; i >= 0; i--) {
						if(parent == allChild[i].parentNode) {
							if(elem == allChild[i]) {
								break;
							}
							else {
								y++;
							}
						}
					}
					
					return calc(allChild.length - (allChild.length - y));
				},
				
				// L'élément est-il le premier élément de son parent ne prend pas en charge les noeuds mais que les éléments html (nodeType == 1)
				"first-child" : function(elem) {
					return !elem.previousSibling;
				},
				
				// L'élément est-il le dernier élément de son parent
				"last-child" : function(elem) {
					return !elem.nextSibling;
				},
				
				// L'élément est-il le premier élément de son parent ne prend pas en charge les noeuds mais que les éléments html (nodeType == 1)
				"first-element" : function(elem) {
					return !elem.previousElementSibling;
				},
				
				// L'élément est-il le dernier élément de son parent
				"last-element" : function(elem) {
					return !elem.nextElementSibling;
				},
				
				// L'élément est-il le premier élément de son parent en ne tenant compte que des fils ayants le même tagName que lui ?
				"first-of-type" : function(elem) {
					return elem.parentNode.getElementsByTagName(elem.nodeName)[0] == elem;
				},
				
				// L'élément est-il le dernier élément de son parent en ne tenant compte que des fils ayants le même tagName que lui ?
				"last-of-type" : function(elem, pseudoArg) {
					pseudoArg = elem.parentNode.getElementsByTagName(elem.nodeName);
					
					return pseudoArg[pseudoArg.length - 1] == elem;
				},
				
				// L'élément est-il le seul de son parent a avoir ce nodeName ?
				"only-of-type" : function(elem) {
					return elem.parentNode.getElementsByTagName(elem.nodeName).length == 1;
				},
				
				// L'élément est-il le seul enfant de son parent ?
				"only-child" : function(elem) {
					return elem.parentNode.children.length == 1;
				},
				
				// L'élément est-il le seul noeud de son parent
				"only-node" : function(elem) {
					return elem.parentNode.childNodes.length == 1;
				},
				
				// Un élément ne contenant ni texte ni élément html
				"empty" : function(elem) {
					return !elem.childNodes.length;
				},
				
				// Un élément ne contenant pas d'élément html mais contenant du texte
				"empty-child" : function(elem) {
					return !elem.children.length && elem.childNodes.length > 0;
				},
				
				// Un élément contenant un ou plusieurs éléments html mais ne contenant pas du texte
				"empty-node" : function(elem) {
					return elem.childNodes.length == elem.children.length && elem.children.length > 0;
				},
				
				// L'élément est-il la cible de la page ?
				"target" : function(elem) {
					return ("#" + elem.id) == document.location.hash;
				},
				
				// L'élément a-t-il la langue fournit en argument ?
				"lang" : function(elem, arg) {
					return arg && elem.lang == arg;
				},
				
				// L'élément est-il visible ?
				"hidden" : function(elem) {
					return !!elem.hidden;
				},
				
				"enabled" : function(elem) {				
					return !elem.disabled;
				},
				"disabled" : function(elem) {
					return !!elem.disabled;
				},
				"checked" : function(elem) {
					return !!elem.checked;
				},
				"unchecked" : function(elem) {
					return !elem.checked;
				},
				"indeterminate" : function(elem) {
					return !!elem.indeterminate;
				},
				"valid" : function(elem) {
					return !!elem.validity.valid;
				},
				
				// L'élément contient-il comme chaine l'argument donné ? (Insenssible à la casse)
				"contains" : function(elem, arg) {
					return elem.textContent && elem.textContent.toLowerCase().match(arg.toLowerCase());
				},
				"contains-exactly" : function(elem, arg) {	// Sensible à la casse
					return arg && elem.textContent && elem.textContent.match(arg);
				},
				
				"focus" : function(elem) {
					return elem == document.activeElement;
				},
				"hover" : function(elem, arg) {
					const	found = elem.parentNode.querySelectorAll(":hover"),
							length = found.length;
					
					return ((arg == "form") ? (length ? found[length - 1] : false) : (length >= 2 ? found[length - 2] : false)) == elem;
				},
				
				// Vérifie l'élément en cours est chargé (utilisé pour les images)
				"load" : function(elem) {
					return !!elem.complete;
				}
			};
	
		/***** FIN Filtre ":" *****/
		
		/***** Filtre "[" *****/
		// Ce trigger permet de comparer des objets et des valeurs ou propriété entre elle
		// Opération supporté : "|", ".", "&&", "||"
		// Ex: [a.b|a = h.g|t && f = g || y = o]
		// NOTE : [a.b&e.t = p] => impossible !
		
			Selector.addTrigger("[", function(string, pos, HTMLElem) {
				let result = {
						"||" : [],
						"&&" : []
					},
					next = "||",
					str = string,
					stocke,
					retour = [];
				
				while(!stocke) {
					const parseStr = parseString({
						string : str,
						pos : pos,
						condition : basicCondition,
						conditionPrio : basicConditionPrio,
						close : equalityClose,
						traitment : equalityTrigger
					});
					
					result[next][result[next].length] = parseStr.result;
					
					if(parseStr.close == "&&" || parseStr.close == "||") {
						next = parseStr.close;
						parseStr.closeAt += 2;
					}
					else {
						stocke = true;
					}
					
					str = str.slice(parseStr.closeAt, str.length);
				}
				
				BHTML:for(let i = 0, HTMLLength = HTMLElem.length; i < HTMLLength; i++) {
					const elem = HTMLElem[i];
					
					BType:for(let x in result) {		// Pour chaque type de vérification, dans l'ordre : "&&" et "||"
						if(result.hasOwnProperty(x)) {
							const 	elemResult = result[x],
									arrayOrAndLength = elemResult.length;
							
							BOpe:for(let y = 0; y < arrayOrAndLength; y++) {	// Pour chaque opération trouvé (ex: "id = ok")
								let elemOrAnd = elemResult[y],
									fct = Selector.equality[(elemOrAnd[1] || [""])[0]],
									property = elemOrAnd[0] || [""],
									propertyReal = [];
								
								for(let q = 0, propertyLength = property.length; q < propertyLength; q++) {
									let propertyArrayObject = property[q],
										propertyStart = elem;
									
									for(let w = 0, propertyArrayObjectLength = propertyArrayObject.length; w < propertyArrayObjectLength; w++) {
										if(propertyStart) {
											propertyStart = propertyStart[propertyArrayObject[w]];
										}
										else {
											break;
										}
									}
									
									propertyReal[propertyReal.length] = propertyStart;
								}
								
								const 	value = elemOrAnd[2] || [[""]],
										valueReal = [];
								
								for(let q = 0, valueLength = value.length; q < valueLength; q++) {
									let valueStart = value[q][0];
									
									if(valueStart == "$") {
										const valueArrayObject = value[q];
										
										valueStart = elem;
										for(let w = 1, valueArrayObjectLength = valueArrayObject.length; w < valueArrayObjectLength; w++) {
											valueStart = valueStart[valueArrayObject[w]];
										}
									}
									
									valueReal[valueReal.length] = valueStart;
								}
								
								const valueRealLength = valueReal.length;
								for(let q = 0, propertyRealLength = propertyReal.length; q < propertyRealLength; q++) {
									for(let w = 0; w < valueRealLength; w++) {
										if(fct(propertyReal[q] === 0 ? propertyReal[q] : (propertyReal[q] || ""), valueReal[w], propertyReal[q])) {
											if(x == "||") {
												continue BType;
											}
											else {
												continue BOpe;
											}
										}
									}
								}
								
								if(x == "&&" || (x == "||" && y + 1 == arrayOrAndLength)) {
									continue BHTML;
								}
							}
						}
					}
					
					retour[retour.length] = elem;
				}
				
				return { HTMLElem : retour, stopAt : string.length - str.length };
			});
			
			const equalityTrigger = {
				"|" : "save",	// On crée un nouveau tableau si l'opérateur "|" intervient
				"." : true		// On sauvegarde les propriétés à recherche dans le même tableau
			},
			
			equalityClose = {
				"]" : true,
				"||" : true,
				"&&" : true,
				"][" : true
			};
			
			Selector.equality = {
				"" 	 : (a, b, realProperty) => !!realProperty,
				"#=" : (a, value, realProperty) => typeof realProperty == value,
				"/=" : function(property, value) {
					if(value.match(/\/.+\/(i|g|gi)/))
						value = new RegExp(value.slice(1, value.length - 2), value[value.length - 1]);
					else if(value.match(/\/.+\//))
						value = new RegExp(value.slice(1, value.length - 1));
					else
						value = new RegExp(value);
					
					return !!property.match(value);
				},
				
				"="  : (property, value) => property == value,
				"!=" : (property, value) => property != value,
				">"  : (property, value) => property > value,
				"<"  : (property, value) => property < value,
				">=" : (property, value) => property >= value,
				"<=" : (property, value) => property <= value,
				"<>" : (property, value) => {
					value = value.split(',');
					return (property > (value[0] * 1) || property === value[0]) && (property < (value[1] * 1) || property === value[1]);
				},
				"~=" : (property, value) => (stringIndexOf.call((" " + property + " "), " " + value + " ") != -1) ? true : false,
				"^=" : (property, value) => property.substr(0, value.length) == value,
				"$=" : (property, value) => property.substr(property.length - value.length) == value,
				"*=" : (property, value) =>	stringIndexOf.call(property, value) != -1,
				"%=" : (property, value) =>	stringIndexOf.call(property.toLowerCase(), value.toLowerCase()) != -1,
				"|=" : (property, value) => property == value || property.slice(0, value.length + 1) == (value + '-')
			};
			
			for(let z in Selector.equality) {
				if(Selector.equality.hasOwnProperty(z)) {
					equalityTrigger[z] = "create";
				}
			}
			
			/***** Fonction addEquality *****/
			// Cette fonction permet l'ajout d'égaliteur pour le filtre "["
			
				Selector.addEquality = function(symb, fct) {
					equalityTrigger[symb] = "create";
					Selector.equality[symb] = fct;
					
					return this;
				};
					
			/***** FIN Fonction addEquality *****/
		
		/***** FIN Filtre "[" *****/
		
	/***** FIN Filtres *****/
	
	
	/***** Régles annexes *****/
		
		/***** Trigger "," *****/
		// Ce trigger permet de lancer une nouvelle recherche en ayant sauvegardé les anciens résultats, la nouvelle recherche commencant par la localisation par défaut
		// Ex: "div, span" retournera tout les div de la page et tout les span de la page
		
			Selector.addTrigger(",", function(string, pos, HTMLElem) {
				return {
					HTMLElem : [].concat(HTMLElem, Selector(string.slice(pos, string.length))),
					stopAt : string.length
				};
			});
				
		/***** FIN Trigger "," *****/
		
		
		/***** Trigger ";" *****/
		// Ce trigger permet de lancer une nouvelle recherche en ayant sauvegardé les anciens résultats, la nouvelle recherche étant lancé à partir des derniers éléments trouvés
		// Ex: "div; span" retournera tout les div de la page et les span étant dans ces meme div 
		
			Selector.addTrigger(";", function(string, pos, HTMLElem) {
				return {
					HTMLElem : HTMLElem.concat(Selector(string.slice(pos, string.length), { location : HTMLElem })),
					stopAt : string.length
				};
			});
				
		/***** FIN Trigger ";" *****/
		
		
		/***** Trigger "<" *****/
		// Ce trigger permet de créer une "bulle" de recherche, une fois la bulle refermé (via ">"), la recherche continuera avec les résultats précédents
		// Ex: "div < span > img" retournera tout les éléments portant le tagName "img" qui sont dans les élément div ET span
		// Si l'opérateur "$$" est utilisé, la recherche commencera à partir des éléments trouvé précédemment
		// Ex: "div < $$ span > img" récupérera tout les éléments div de la page et tout les span qui sont dans ces div, puis récupérera tout les éléments img qui sont dans ces éléments
		
			Selector.addTrigger("<", function(string, pos, HTMLElem) {
				string = parseString({
					string : string,
					pos : pos,
					close : { ">" : true },
					condition : basicCondition,
					traitment : { "$$" : true },
					copySpace : true
				});
				
				return {
					HTMLElem : HTMLElem.concat(Selector(string.lastStr, string.result[0][0].length != 1 ? { location : HTMLElem } : undefined)),
					stopAt : string.closeAt + 1
				};
			});
		
		/***** FIN Trigger "<" *****/
			
	/***** FIN Régles annexes *****/
	
	
	if(window.Dynamique) {
		Dynamique.setSelector(Selector);
		Dynamique.addModule("Selector", Selector);
	}
	else {
		window.Selector = Selector;
	}
})();
