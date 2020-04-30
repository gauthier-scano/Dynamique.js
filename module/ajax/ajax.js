/******************************************************/
/*******************	Ajax.js		*******************/
/**
 * Date: 30/09/2018
 * Compatiblité: ES6
 * Version: 2.0
 * Version 1.0 (25/09/2013) => 2.0: refonte du modèle
 * 
 * Une requête est un objet ou un modèle décrivant une requête HTTP et son traitement
 * Une réponse est un objet issu d'une requête qui passe par plusieurs état et dont la finalité est la délivrance du résultat (interprété) de la requête
 * 
 * Liste des propriétés d'une requête:	
 * 		method 					: 	{String}			"GET"			Méthode HTTP à utiliser
 *		async 					: 	{Boolean}			true			Si TURE, enverra la requête de manière asynchrone
 * 		url 					: 	{String}							Adresse de la page a utiliser
 * 
 * 		user 					: 	{String}			undefined		Nom à utiliser
 *		password 				: 	{String}			undefined		Mot de passe à utiliser
 * 		
 * 		header					:	{Object}							Un objet contenant tous les en-têtes de la requête, a noter, la méthode ajouter l'en-tête "Content-Type" si il n'est pas présent		
 * 
 *		encode 					: 	{Boolean}			true			Détermine si les arguments doivent être encodé avant l'envoi
 *		noCache 				: 	{Boolean}			false			Indique si la page doit être chargé sans tenir compte du cache
 * 		
 * 		useParse				:	{Boolean|Function}	true			Défini si la réponse de la requête doit être parsé, uniquement lorsque mimeType == "application/json"
 * 		useEval					:	{Boolean|Function}	true			Défini si la réponse de la requête doit être évalué, uniquement lorsque mimeType == "application/javascript"
 * 		useScript				:	{Boolean}			false			Défini si la réponse de la requête doit être stocké dans une balise script, uniquement lorsque mimeType == "application/javascript" et useEval = false
 * 		useStyle				:	{Boolean}			true			Défini si la réponse de la requête doit être stocké dans une balise <style>, uniquement lorsque mimeType == "text/css"
 * 		useFragment				:	{Boolean}			true			Défini si la réponse de la requête doit être évalué dans un fragment de document, uniquement lorsque mimeType == "text/html"
 * 		useDynamique			:	{Boolean}			true			Défini si les éléments DOM crée doivent être stocké dans un tableau Dynamique directement, uniquement lorsque useFragment = true ou useScript = true ou useStyle = true
 *		
 * 		multiple				:	{Boolean}			true			Indique si il est possible d'envoyer une requête alors qu'une autre est déjà en cours de traitement
 * 		
 * 		withCredentials 		: 	{Boolean}							Indique si l'envoit des cookies et des sessions est possible lorsque une requête est faite en CROSS-DOMAIN
 *		multipart 				: 	{Boolean}		
 * 		format					:	{String}							Indique le format dans lequel doit être traiter la réponse de la requête (= mimeType)
 * 
 * 		history					:	{Boolean}							Indique si la requête doit être stocké dans l'historique du navigateur
 * 		historyURL				:	{String}			""				Indique l'URL à associer avec l'ajout de la requête à l'historique
 * 		
 * 		maxResponse				: 	{Number}			1				Indique le nombre max de réponses qui peuvent être stockées dans une requête
 * 		queue 					: 	{String}			""				Indique si l'utilisateur désire utiliser la liste (queue), true : la liste par défaut sera utilisé; false : la liste ne sera pas utilisé, si {String} indiqu la liste à utiliser
 *		priority 				: 	{Integer}			0				Défini la priorité de la réponse. Plus elle est proche de 0, plus la requête est prioritaire
 * 		
 * 		timeout					:	{Number}							Temps max que peut durer une la requête
 * 
 * Liste des propriétés possible d'une réponse:
 * 	LS	id						:	{Number}							Identifiant unique de la réponse issu de Ajax.id	
 *	LS	arg 					: 	{All}								Arguments finaux envoyé avec la réponse
 * 	LS	state					:	{Number}		[0-10]				Etat de la réponse
 * 
 * 
 * Liste des codes d'erreur:
 * 		- AlreadySending: une réponse est déjà en traitement/envoi pour une requête
 * 		- QueueNotFound: la liste auquelle la requête doit être ajoutée n'a pas été trouvée
 * 		- NoURLSupply: Aucune URL n'a été donnée
 * 		- XHRNotSupported: les requêtes XHR ne sont pas supportés
 * 		- XHRError: une erreur liée à la requête est survenue
 * 		- XHRTimeout: le temps maximal d'envoi d'une requête est atteint
 * 		- QueueError: la requête n'a pas pu être supprimée de la queue auquelle elle appartient
 * 		- XHRUncomplete: la requête a été annulée ou a subie une erreur rendant sa réponse inexploitable
 * 		- MethodNotSupported: la méthode HTTP fournie n'est pas supportée
 * 		- JSONParseError: une erreur dans le parsage de la réponse est survenue
 * 		- JSONEvalError: une erreur est survenue lors de l'éxécution de la réponse
 * 		- JSONScriptError: une erreur est survenue dans l'éxécution par balise de la réponse
 * 		- StyleLoadError: une erreur est survenue lors de l'interprétation de la réponse sous forme de style CSS
 * 		- QueueAbort: la réponse à été annulée alors qu'elle était dans une liste
 * 
 * Internal Data:
 * @Name: Ajax
 * @Type: Parent
 * @Parent: ["Module"]
 * @UseAsParent: true
 * @Dependencies: []
 * @Version: 1.0
 */
/******************************************************/
/******************************************************/

"use strict";

(function() {
	
	/***** Fonction Ajax *****/
	// Fonction base du framework. Permet de créer et d'envoyer une requête ajax
	// Synthaxe:
	//		Ajax(objt, arg);
	// Où:
	//		objt: {Object}{String}, objet comportant les propriétés de la requête ou nom d'un modèle à utiliser (voir propriété d'une requête)
	//		arg: {All}, argument à envoyer avec la requête
	// @return: {Promise}, promesse qui sera résolu lorsque la requête sera terminé ou rejeté pour toute erreur qui survient
	// Version: 1.0

		const Ajax = function(objt, arg) {
			return Ajax.send.apply(Ajax, arguments);
		};

	/***** FIN Fonction Ajax *****/

		
	const Event = (window.Dynamique ? Dynamique.module.Event : window.Event);
	
	Ajax.id = 0;
	Ajax.httpStatus = ["Unknow", "Informational", "Success", "RedirectionError", "NetworkError", "ServerError"];
	
	
	/***** Fonction getTime *****/
	// Retourne la date actuelle en ms
	// @param: NONE
	// @return: {Number}, date actuelle en ms
	// Version: 1.0

		const getTime = () => new Date().getTime();

	/***** FIN Fonction getTime *****/
	
	
	/***** Gestion des méthodes HTTP *****/
	
		Ajax.method = {};
		
		Ajax.method.GET = function(request, prepare) {
			const 	arg = prepare.arg,
					encode = (typeof request.encode == "undefined" || request.encode) ? (typeof request.encode == "function" ? request.encode : encodeURIComponent) : false;
			let		newArg = request.noCache ? "&" : "?";
			
			if(arg instanceof Element) {
				if(arg.tagName == "FORM") {
					arg = arg.elements;
					
					for(let i = 0, elem; (elem = arg[i]); i++) {
						if(elem.type != "submit" && elem.type != "reset") {
							newArg += elem.name + "=" + (encode ? encode(elem.value) : elem.value) + "&";
						}
					}
				}
			}
			else if(arg instanceof Object) {
				for(let elem in arg) {
					if(arg.hasOwnProperty(elem)) {
						const value = (JSON.stringify(arg[elem]) + "").replace(/^"|"$/g, '');
					
						newArg += elem + "=" + (encode ? encode(value) : value) + "&";
					}
				}
			}
			else if(arg) {
				newArg += (encode ? encode(prepare.arg) : prepare.arg);
			}
			
			prepare.arg = null;
			prepare.url += (newArg.length > 1 ? newArg.replace(/&$/, '') : '');
		};
			
		Ajax.method.POST = function(request, prepare) {
			const	arg = prepare.arg,
					encode = (typeof request.encode == "undefined" || request.encode) ? (typeof request.encode == "function" ? request.encode : encodeURIComponent) : false;
			let		newArg = request.noCache ? "&" : "";
			
			if(arg instanceof Element) {
				if(arg.tagName == "FORM") {
					newArg = new FormData(arg);
				}
			}
			else if(arg instanceof Object) {
				for(let elem in arg) {
					if(arg.hasOwnProperty(elem)) {
						const str = (JSON.stringify(arg[elem]) + "").replace(/^"|"$/g, '');
						
						newArg += elem + "=" + (encode ? encode(str) : str) + "&";
					}
				}
			}
			else if(arg) {
				newArg += (encode ? encode(prepare.arg) : prepare.arg);
			}
			
			prepare.arg = newArg.replace(/&$/, '');
			prepare.url = request.url;
		};
		
		/***** Méthode Ajax.getMethod *****/
		// Retourne une méthode par son nom
		// Synthaxe:
		//		Ajax.getMethod(name)
		// Où:
		//		name: {String}, nom de la méthode à récupérer
		// @return: {Function}, La méthode demandée ou undefined si non-trouvée
		// Version: 1.0
		
			Ajax.getMethod = function(name) {
				return Ajax.method[name.toUpperCase()];
			};
				
		/***** FIN Méthode Ajax.getMethod *****/
		
		
		/***** Méthode Ajax.addMethod *****/
		// Ajoute une fonction
		// Synthaxe:
		//		Ajax.addMethod(name, callBack);
		// Où:
		//		name: {String}, nom de la méthode, non-sensible à la casse
		//		callBack: {Function}, fonction qui sera appelée lorsque la méthode utilisé par une requête
		// @return: {Object}, la fonction Ajax
		// Version: 1.0
		
			Ajax.addMethod = function(name, callBack) {
				Ajax.method[name.toUpperCase()] = callBack;
				
				return this;
			};
		
		/***** FIN Méthode Ajax.addMethod *****/
		
	/***** FIN Gestion des méthodes HTTP *****/
	
	
	/******* Gestion des modèles *****/
	
		Ajax.model = {};
		
		/***** Méthode Ajax.createModel *****/
		// Crée un nouveau modèle
		// Synthaxe:
		//		Ajax.createModel(name[, arg1[, ..., argN]]);
		//	Où
		//		name: {String}, chaine représentant le nom du modèle à créer
		// 		arg1...argN : {String|Object} : nom d'un modèle dont il faut copier les propriétés (et les événements) ou objet dont le nouveau modèle doit copier les propriétés
		// @return: {Function} : la fonction Ajax générale
		// Version: 1.0 - 28/09/2018
		
			Ajax.createModel = function(name, ...arg) {
				const model = Event.createEventObject({}, eventDefault);
				
				for(let i = 0, length = arg.length; i < length; i++) {
					Object.assign(model, typeof arg[i] == "string" ? Ajax.model[arg[i]].copyEventTo(model) : arg[i]);
				}
				
				return Ajax.model[name] = model;
			};
				
		/***** FIN Méthode Ajax.createModel *****/
		
		
		/***** Méthode Ajax.deleteModel *****/
		// Supprime un modèle précédamment créé avec Ajax.createModel
		// Synthaxe:
		//		Ajax.deleteModel(modelName1[, ...modelNameN]);
		//	Où:
		//		modelName1...modelNameN: {String}, nom des modèles à supprimer
		// @return: {Function}, la fonction Ajax générale
		// Version: 1.0
		
			Ajax.deleteModel = function() {
				for(let i = 0, length = arguments.length; i < length; i++) {
					delete Ajax.model[arguments[i]];
				}
				
				return this;
			};
		
		/***** FIN Méthode Ajax.deleteModel *****/
		
	/***** FIN Gestion des modèles *****/
	

	Ajax.stateList = ["create", "init", "queue", "prepare", "send", "receive", "load", "prepareData", "history", "complete"];
	
	const eventDefault = {
		success : true, error : true, statechange : true,
		create : true, init: true, queue : true, prepare : true, send : true, receive : true, load : true, prepareData : true, history : true, complete : true, maxResponse : true, alreadySending : true,
		opened : true, headersReceived : true, loading : true, done : true,
		progress : true, prepareArg : true,
		statusUnknow : true, statusInformational : true, statusSuccess : true, statusRedirectionError : true, statusNetworkError : true, statusServerError : true,
		modified : true, checkData : true,
		queueAdd : true, queueRemove : true, queueMove : true
	},
	
	/***** Fonction setResponseState *****/
	// Met une réponse dans un état donné
	// Synthaxe:
	//		setResponseState(response, state)
	// Où:
	//		response: {Object}, Objet réponse dont il faut changer l'état
	//		state: {Number}, Etat dans lequel la réponse doit être mise, la valeur doit être compris de 0 à Ajax.stateList.length
	// @return: NONE
	// Version: 1.0

		setResponseState = function(response, state) {
			response.state 		= state;
			response.stateText 	= Ajax.stateList[state];
			response.stat.load 	= Math.round(state / Ajax.stateList.length * 100);
			
			response.request.dispatchEvent("statechange", response, response.stateText);
			response.request.dispatchEvent(response.stateText, response);
		},

	/***** FIN Fonction setResponseState *****/
	
	
	/***** Fonction newError *****/
	// Crée une nouvelle erreur pour une réponse donnée
	// Synthaxe:
	//		newError(response, errorName)
	// Où:
	//		response: {Object}, réponse concernée par l'erreur
	//		errorName: {String}, nom de l'erreur (voir liste des erreur possible en en-tête)
	// @return : NONE
	// Version : 1.0

		newError = function(response, errorName) {
			delete response.abort;
			
			if(typeof response.queue != "undefined") {
				Ajax.removeResponseFromQueue(response.queue, response);
			}
			
			response.request.dispatchEvent("error", errorName, response);
			
			if(response.reject) {
				response.reject(new Error(errorName));
			}
		};

	/***** FIN Fonction newError *****/
	

	/***** Méthode Ajax.send *****/
	// Cette fonction permet la création de l'objet objectRequest, qui permettra par la suite l'envoi de la requête au serveur
	// Synthaxe: Ajax.send(modelName, arg)
	//		modelName: {String|Object}, nom du modèle à utiliser pour envoyer la requête
	//		arg: {All}, arguments à envoyer avec la réponse
	// @return : {Promise}, promesse qui sera résolue lorsque la requête sera terminée et rejeté si une erreur survient
	// Version : 1.0

		Ajax.send = function(modelName, arg) {
			const response = {
				id : ++Ajax.id,
				
				request : null,
				arg : null,
				
				data : null,
				dataText : null,
				isDataValid : false,
				
				state : 0,
				stateText : null,
				header : {},
				
				stat : {
					load : 0,
					headerSize : 0,
					bodySize : 0,
					fileSize : 0,
					byteLoaded : 0,
					byteRemaining : 0,
					timeLoadRemaining : 0,
					
					time : 0,
					timeStart : 0,
					timeOpen : 0,
					timeHeaders : 0,
					timePayload : 0,
					timeEnd : 0
				}
			};
			
			if(typeof modelName == "string") {
				var request = response.request = Ajax.model[modelName];
				
				if(request) {
					if(typeof request.maxResponse == "undefined" || (request.maxResponse > -1)) {	// Si non indiqué, aucune réponse n'est sauvegardée
						if(!request.response) {
							request.response = [];
						}
						
						if(typeof request.multiple != "undefined" && !request.multiple) {
							for(let i = 0, length = request.response.length; i < length; i++) {
								if(request.response[i].state != 0 && request.response[i].state != 10) {
									newError(response, "AlreadySending");
									
									return false;
								}
							}
						}
						
						if(request.response.length == (typeof request.maxResponse != "undefined" ? request.maxResponse : 1)) {
							request.response.shift();
						}
						
						request.response[request.response.length] = response;
					}
				}
				else {
					throw new Error("Model named '" + modelName + "' was not found.");
				}
			}
			else {
				var request = response.request = Object.assign(Event.createEventObject({}, eventDefault), modelName);
				
				request.response = response;
			}
			
			response.arg = typeof arg == "undefined" ? request.arg : arg;
			
			return response.promise = new Promise((resolve, reject) => {
				response.resolve = resolve;
				response.reject = reject;
				
				setResponseState(response, 1);
				
				if(typeof request.queue == "string") {
					const selectQueue = Ajax.queue[request.queue];
					response.queue = request.queue;
					
					if(!Ajax.addResponseToQueue(request.queue, response)) {
						newError(response, "QueueNotFound");
					}
				}
				else {
					sendResponse(response);
				}
			});
		};
		
	/***** FIN Méthode Ajax.send *****/
	
		
	/***** Fonction sendRequest *****/
	// Envoi d'une réponse
	// Synthaxe:
	//		sendResponse(response)
	// Où:
	//		response: {Object}, réponse à envoyer
	// @return : NONE
	// Version : 1.0
		
		const sendResponse = function(response) {
			const request = response.request;
			
			if(!request.url) {
				return newError(response, "NoURLSupply");
			}
			
			const XHR = new XMLHttpRequest();
			
			if(!XHR) {
				return newError(response, "XHRNotSupported");	
			}
			
			response.abort = () => { XHR.abort(); return this; };
			
			setResponseState(response, 3);
			
			XHR.addEventListener("error", function() {
				newError(response, "XHRError");
			}, false);
			
			XHR.addEventListener("abort", function() {
				newError(response, "XHRAbort");
			}, false);
			
			XHR.addEventListener("timeout", function() {
				newError(response, "XHRTimeout");
			}, false);
			
			let prevState;
			XHR.addEventListener("readystatechange", function(event) {
				const readyState = XHR.readyState;
				
				if(prevState != readyState) {
					if(readyState == XHR.OPENED) {
						response.stat.timeOpen = getTime();
						
						request.dispatchEvent("opened", event);
					}
					else if(readyState == XHR.HEADERS_RECEIVED) {
						response.stat.timeHeaders = getTime();
						
						const header = XHR.getAllResponseHeaders();
						
						if(header.length) {
							const headerSplit = header.trim().split(/[\r\n]+/);
							
							for(let i = 0, length = headerSplit.length; i < length; i++) {
								const act = headerSplit[i].split(": ");
								
								response.header[act[0].trim().toLowerCase()] = act[1].trim();
							}
						}
						
						response.headerSize = header.length;
						response.bodySize = (response.header["content-length"] * 1) || 0;
						
						request.dispatchEvent("headersReceived", event);
					}
					else if(readyState == XHR.LOADING) {
						response.stat.timePayload = getTime();
						
						request.dispatchEvent("loading", event);
						setResponseState(response, 5);
					}
					else if(readyState == XHR.DONE) {
						response.stat.timeEnd = getTime();
						response.stat.time = response.stat.timeEnd - response.stat.timeStart;
						
						if(!response.bodySize) {
							response.bodySize = XHR.responseText.length;
						}
						
						delete response.abort;
						
						if(XHR.status) {
							request.dispatchEvent("done", event);
							setResponseState(response, 6);
							
							response.load = 100;
							response.stat.byteRemaining = response.stat.timeLoadRemaining = 0;
							response.stat.fileSize 		= response.stat.byteLoaded = response.stat.headerSize + response.stat.bodySize;
							
							response.status 	= XHR.status;
							response.statusText = XHR.statusText;
							response.statusType = Ajax.httpStatus[Math.floor(XHR.status / 100)];
							response.dataText 	= XHR.responseText;
							
							setResponseState(response, 7);
							
							response.data = Ajax.buildData(response, request.format || response.header["content-type"], XHR.responseXML);
				
							request.dispatchEvent(response.status + "");
							request.dispatchEvent("status" + response.statusType);
							
							if(request.response) {
								let i = request.response.length;
								while(i--) {
									if(request.response[i].state == 10) {
										if(request.response[i].responseText !== response.responseText) {
											request.dispatchEvent("modified", response, request.response[i]);
											
											break;
										}
									}
								}
							}
							
							if(request.history) {
								history.pushState(JSON.parse(JSON.stringify(response)), "", request.historyURL || "");
								
								setResponseState(response, 8);
							}
							
							if(response.queue && !Ajax.removeResponseFromQueue(response.queue, response)) {
								return newError(response, "QueueError");
							}
							
							response.stat.timeEnd = getTime();
							response.stat.time = response.stat.timeEnd - response.stat.timeStart;
							
							setResponseState(response, 9);
							
							if(request.dispatchEvent("checkData", response) && response.isDataValid) {
								request.dispatchEvent("success", response.data, response);
								response.resolve(response.data, response);
							}
							else {
								newError(response, "InvalidData");
							}
						}
						else {
							newError(response, "XHRUncomplete");
						}
					}
				}
				
				prevState = readyState;
			}, false);
			
			XHR.addEventListener("progress", function(event) {
				response.stat.load = Math.round((event.loaded / event.total) * 100);
				response.stat.fileSize = event.total;
				response.stat.byteLoaded = event.loaded;
				response.stat.byteRemaining = Math.max(event.total - event.loaded, 0);
				response.stat.timeLoadRemaining = Math.round((event.total / event.loaded) * getTime() - response.stat.timeStart);
				
				request.dispatchEvent("progress", event);
			}, false);
			
			
			if(typeof request.multipart == "boolean") {	// Avant open
				XHR.multipart = request.multipart;
			}
			
			const methodReal = request.method ? request.method.toUpperCase() : "GET";
			
			if(!Ajax.method[methodReal]) {
				return newError(response, "MethodNotSupported");
			}
			
			const prepare = {
				url : request.url + (request.noCache ? "?" + getTime() + "=0" : ""),
				arg : response.arg
			};
			
			request.dispatchEvent("prepareArg", prepare);
			
			Ajax.method[methodReal](request, prepare);
			
			XHR.open(methodReal, prepare.url, typeof request.async == "undefined" ? true : !!request.async, request.user || undefined, request.password || undefined);
			
			if(typeof request.format == "string") {
				XHR.overrideMimeType(request.format);
			}
			
			const header = request.header;
			for(let z in header) {
				if(header.hasOwnProperty(z)) {
					XHR.setRequestHeader(z, header[z]);		// Après open
				}
			}
			
			if(typeof request.withCredentials == "boolean") {	// Après open
				XHR.withCredentials = request.withCredentials;
			}
			
			if(typeof request.timeout == "number") {
				XHR.timeout = request.timeout;
			}
			
			response.stat.timeStart = getTime();
			
			XHR.send(prepare.arg);
			
			setResponseState(response, 4);
		};

	/***** Fin Fonction sendRequest *****/
	
		
	/***** Méthode Ajax.buildData *****/
	// Transforme une réponse texte d'une réponse en fonction d'un content-type
	// Synthaxe:
	//		Ajax.buildData(response, contentType, responseText, responseXML
	// Où:
	//		response: {Object}, objet réponse
	//		contentType: {String}, content-type valide, indiquant sous quel format la réponse textuelle doit être transformée
	//		responseXML: {Object}, réponse par défaut à utiliser lorsque le content-type vaut "text/xml" ou "application/xml"
	// @return: {All}, la donnée textuelle une fois transformé
	// Version: 1.0
	
		Ajax.buildData = function(response, contentType, responseXML) {
			const 	request = response.request,
					responseText = response.dataText;
			
			response.isDataValid = true;
			contentType = contentType.toLowerCase();
			
			if(contentType == "text/xml" || contentType == "application/xml") {
				return responseXML;
			}
			else if(contentType == "application/json") {
				if(typeof request.useParse == "undefined" || request.useParse) {
					try {
						return (typeof request.useParse == "function" ? request.useParse : JSON.parse)(responseText);
					}
					catch(e) {
						newError(response, "JSONParseError");
						
						return request.isDataValid = false;
					}
				}
			}
			else if(contentType == "application/javascript") {
				if(request.useEval) {
					try {
						return (typeof request.useEval == "function" ? request.useEval(responseText) : eval(responseText));
					}
					catch(e) {
						newError(response, "JSEvalError");
						
						return request.isDataValid = false;
					}
				}
				else if(request.useScript) {
					const 	script = document.createElement("script");
							script.textContent = responseText;
							script.onerror = function() {
								newError(response, "JSScriptError");
							};
					
					if(window.Dynamique && (typeof request.useDynamique == "undefined" || request.useDynamique)) {
						return Dynamique(script);
					}
					else {
						return script;
					}
				}
				else if(typeof request.useFunct == "undefined" || request.useFunct) {
					return Function.apply(window, request.functArg ? request.functArg.concat([responseText]) : [responseText]);
				}
			}
			else if(contentType == "text/css") {
				if(typeof request.useStyle == "undefined" || request.useStyle) {
					const 	style = document.createElement("style");
							style.textContent = responseText;
							style.onerror = function() {
								newError(response, "StyleLoadError");
							};
					
					if(window.Dynamique && (typeof request.useDynamique == "undefined" || request.useDynamique)) {
						return Dynamique(style);
					}
					else {
						return style;
					}
				}
			}
			else if(contentType == "text/html") {
				if(typeof request.useFragment == "undefined" || request.useFragment) {
					const 	frag = document.createDocumentFragment(),
							div = document.createElement("div");
							div.innerHTML = responseText;
					
					frag.appendChild(div);
					
					while(div.childNodes.length) {
						frag.appendChild(div.childNodes[0]);
					}
					
					frag.removeChild(div);
					
					if(window.Dynamique && (typeof request.useDynamique == "undefined" || request.useDynamique)) {
						return Dynamique(frag.childNodes);
					}
					else {
						return frag;
					}
				}
			}
			
			return responseText;
		};

	/***** FIN Méthode Ajax.buildData *****/
	
	/***** Gestion des listes *****/
		
		Ajax.queue = {};
		
		/***** Méthode Ajax.createQueue *****/
		// Crée une nouvelle liste
		// Synthaxe: Ajax.createQueue(name[, option]);
		//		name: {String}, nom de la nouvelle queue à créer
		//		option: {Object}, objet de paramètrage de la nouvelle queue
		//			.minLength: {Number}:facultatif (0), nombre de requête auquel la liste commence à en envoyer
		//			.maxLength: {Number}:facultatif (5), nombre de requête max que peu contenir la liste
		//			.maxLoading: {Number}:facultatif (Inifnity), nombre de requête de la liste pouvant être envoyées simultanément
		//			.onchange: {Function}:facultatif, événement déclenché lorsque la liste change. Le premier argument est la réponse qui provoque cette modification et le second est un boolean indiquant si le réponse est ajoutée ou supprimée de la liste
		//			.maxloading: {Function}:facultatif, événement déclenché lorsque le nombre de requête pouvant chargé simultanément est atteint
		//			.requeststart: {Function}:facultatif, événement déclenché lorsqu'une réponse est envoyée
		// @return : {Object}, le tableau représentant la nouvelle queue créé est retourné
		// Version : 1.0

			Ajax.createQueue = function(name, option) {
				const queue = Ajax.queue[name] = Object.assign(Event.createEventObject([], {
					change : true,
					maxLoading : true,
					requestStart : true
				}), {
					minLength : 0,
					maxLength : 5,
					maxLoading : Infinity
				}, option);
				
				queue.name 		= name;
				queue.loading 	= 0;
				
				return queue;
			};
		
		/***** FIN Méthode Ajax.createQueue *****/
		
		
		/***** Méthode Ajax.deleteQueue *****/
		
			Ajax.deleteQueue = function(name) {
				if(Ajax.queue[name] && Akax.queue[name].loading == 0) {
					delete Ajax.queue[name];
					
					return true;
				}
				else {
					return false;
				}
			};
			
		/***** FIN Méthode Ajax.createQueue *****/
		
		
		/***** Méthode Ajax.addResponseToQueue *****/
		// Ajoute une réponse à une liste
		// Synthaxe:
		//		Ajax.addResponseToQueue(name, response);
		//	Où:
		//		name: {String}, nom de la liste à laquelle il faut ajouter la réponse
		//		response: {Object}, objet réponse à ajouter à la liste
		// @return : {Boolean}, retourne true si la réponse à bien été ajoutée à la liste, false sinon
		// Version : 1.0
		
			Ajax.addResponseToQueue = function(name, response) {
				const queue = Ajax.queue[name];
				
				if(queue && queue.length < queue.maxLength) {
					response.abort = function() {
						newError(response, "QueueAbort");
						
						return Ajax.removeResponseFromQueue(name, response);
					};
					
					queue[queue.length] = response;
					queue.dispatchEvent("change", response, true);
					
					response.request.dispatchEvent("queueAdd", response);
					setResponseState(response, 2);
					
					Ajax.verifQueue(name, response);
					
					return true;
				}
				else {
					return false;
				}
			};
		
		/***** FIN Méthode queueAdd *****/
		
		
		/***** Méthode Ajax.removeResponseFromQueue *****/
		// Supprime une réponse d'une liste
		// Synthaxe: Ajax.removeResponseFromQueue(name, response);
		//		name: {String}, nom de la queue d'où response doit être supprimée
		//		response: {Object}, réponse à supprimer de la liste
		// @return: {Boolean}, retourne true si la requête a bien été supprimée de la liste, false sinon
		// Version : 1.0
		
			Ajax.removeResponseFromQueue = function(name, response) {
				const queue = Ajax.queue[name];
				
				if(queue) {
					const index = queue.indexOf(response);
					
					if(index != -1) {
						const response = queue[index];
						
						for(let i = index+1, length = queue.length; i < length; i++) {
							queue[i-1] = queue[i];
							
							queue[i].dispatchEvent("queueMove", i-1, i);
						}
						
						if(response.state > 2 && response.state < Ajax.stateList.length) {
							queue.loading--;
						}
						
						queue.pop();
						queue.dispatchEvent("change", response, false);
						response.request.dispatchEvent("queueRemove", response);
						
						return true;
					}
				}
				
				return false;
			};
		
		/***** FIN Méthode Ajax.removeResponseFromQueue *****/
		
		
		/***** Méthode Ajax.verifQueue *****/
		// Tri et envoi des réponses si possible
		// Synthaxe: Ajax.verifQueue(name);
		//		name: {String}, nom de la liste qu'il faut vérifier
		// @return : {Object}, l'objet Ajax
		// Version : 1.0
		
			Ajax.verifQueue = function(name) {
				const queue = Ajax.queue[name];
				
				if(queue) {
					queue.sort(Ajax.sortQueue);
					
					if(queue.length >= queue.minLength) {
						for(let i = 0, length = queue.length; i < length; i++) {
							const act = queue[i];
							
							if(queue.loading == queue.maxLoading) {
								queue.dispatchEvent("maxLoading");
								break;
							}
							
							if(act.state == 2) {
								queue.loading++;
								queue.dispatchEvent("requestStart", act);
								
								sendResponse(act);
							}
						}
					}
				}
				
				return this;
			};
		
		/***** FIN Méthode Ajax.verifQueue *****/
		
		
		/***** Méthode Ajax.sortQueue *****/
		// Méthode utilisée par la méthode Ajax.verifQueue afin de trier les réponses composant une liste
		
			Ajax.sortQueue = (elem1, elem2) => elem1.priority * 1 - elem2.priority * 1;
			
		/***** FIN Méthode Ajax.sortQueue *****/

	/***** FIN Gestion des listes *****/
	
	if(window.Dynamique) {
		window.Dynamique.addModule("Ajax", Ajax);
	}
	else {
		window.Ajax = Ajax;
	}
})();
