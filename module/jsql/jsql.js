/*****************************************************/
/******************     JSQL.js     ******************/
/**
 * Date: 23/10/2018
 * Version: 1.0
 * Compatiblité: ES6
 * 
 * Internal Data:
 * @Name: JSQL
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
	 * @name: Context
	 * @version: 1.0
	*/
	
		if(!window.indexedDB) {
			window.indexedDB 		= window.indexedDB		|| window.mozIndexedDB 			|| window.webkitIndexedDB 	|| window.msIndexedDB;
			window.IDBTransaction 	= window.IDBTransaction || window.webkitIDBTransaction 	|| window.msIDBTransaction;
			window.IDBKeyRange 		= window.IDBKeyRange 	|| window.webkitIDBKeyRange 	|| window.msIDBKeyRange;
		}
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: Base
	 * @version: 1.0
	*/
	
		const JSQL = async function(objt) {
			const version = await JSQL.createDatabase(objt, true);
			
			if(version) {
				return {
					name : objt.name,
					version : objt.version,
					
					insert : function(insert) {
						return JSQL.insertInto(this.name, insert, version);
					},
					select : function(select) {
						return JSQL.selectFrom(this.name, select, version);
					},
					delete : function(delet) {
						return JSQL.deleteFrom(this.name, delet, version);
					},
					remove : function() {
						return JSQL.deleteDatabase(this.name);
					}
				};
			}
			else {
				return false;
			}
		};

	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: WorkerUrl
	 * @version: 1.0
	 * @dependencies: [{ "name" : "JSQL", "version" : ">= 1.0" }]
	*/
		
		/***** Méthode setWorkerUrl *****/
		// Attribue une nouvelle URL pour le Worker en préchargeant la ressource
		// Synthaxe:
		//		JSQL.setWorkerUrl(workerUrl);
		// 	Où:
		//		workerUrl: {String}, nouvelle URL menant au Worker à utiliser
		// Retour: {Function}, JSQL
		// Version: 1.0
		
			JSQL.workerUrl = null;
			JSQL.setWorkerUrl = function(workerUrl) {
				const 	link 		= document.createElement("link");
						link.rel 	= "prefetch";
						link.as 	= "script";
						link.href 	= JSQL.workerUrl = workerUrl;
				//		link.crossorigin = "anonymous";
						link.onload = link.onerror = () => link.parentNode.removeChild(link);
				
				document.head.insertBefore(link, null);
				
				return this;
			};
		
		/***** FIN Méthode setWorkerUrl *****/

	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: createDatabase
	 * @version: 1.0
	 * @dependencies: [{ "name" : "JSQL", "version" : ">= 1.0" }]
	*/
	
		const Ajax = window.Dynamique ? Dynamique.module.Ajax : window.Ajax;
		
		JSQL.createDatabase = function(objt, versionSyst = false) {
			return new Promise(resolve => {
				const	versionTarget = objt.version * 10;
				let		database = indexedDB.open(objt.name, versionTarget + 1),
						needUpdate;
				
				database.addEventListener("error", () => resolve(false));
				database.addEventListener("upgradeneeded", (event) => needUpdate = Math.floor(event.oldVersion / 10) * 10);
				
				database.addEventListener("success", async function(event) {
					database = event.target.result;
					
					if(needUpdate === undefined) {
						databaseReady(database, resolve, objt.onversionchange, versionSyst);
					}
					else {
						database.close();
						
						let error = false;
						if(needUpdate == 0) {	// No previous database found
							indexedDB.deleteDatabase(objt.name);
							
							const description = await Ajax({
								url : objt.source[objt.version].description,
								useParse : true,
								format : "application/json"
							});
							
							if(description) {
								database = indexedDB.open(objt.name, versionTarget + 1);
								
								database.addEventListener("upgradeneeded", function(event) {
									if(objt.onupgradeneeded) {
										objt.onupgradeneeded(event);
									}
									
									error = !JSQL.processDescription(event.target.result, description);
								});
							}
							else {
								return resolve(false);
							}
						}
						else {
							M:for(let version = needUpdate / 10; version != objt.version; version++) {
								const data = objt.source[version + 1];
								
								data.database = await Ajax({
									url : data.description,
									useParse : true,
									format : "application/json"
								});
								
								if(data.database) {
									const script = await Ajax({
										url : data.update,
										format : "text/plain"
									});
									
									if(script) {
										data.process = new Function(script);
									}
									else {
										return resolve(false);
									}
								}
								else {
									return resolve(false);
								}
							}
							
							database = indexedDB.open(objt.name, versionTarget + 1);
							
							database.addEventListener("upgradeneeded", async function(event) {
								if(objt.onupgradeneeded) {
									objt.onupgradeneeded(event);
								}
								
								database = event.target.result;
								
								for(let version = needUpdate; version < SSO.database.version; version++) {
									if(!(await source[version].process(database, source[version].database, objt))) {
										return error = true;
									}
								}
							});
						}
						
						database.addEventListener("error", () => resolve(false));
						database.addEventListener("success", function(event) {
							database = event.target.result;
							database.close();
							
							if(error) {
								indexedDB.deleteDatabase(objt.name);
								
								resolve(false);
							}
							else {
								databaseReady(database, resolve, objt.onversionchange, versionSyst);
							}
						});
					}
				});
			});
		};
		
		const databaseReady = function(database, resolve, versionchange, versionSyst) {
			database.addEventListener("versionchange", () => database.close());
			
			if(versionchange) {
				database.addEventListener("versionchange", versionchange);
			}
			
			resolve(versionSyst ? database.version : (Math.floor(database.version / 10) * 10));
		};
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: processDescription
	 * @version: 1.0
	 * @dependencies: [{ "name" : "JSQL", "version" : ">= 1.0" }]
	*/
	
		JSQL.processDescription = function(database, description) {
			try {
				for(let z in description) {
					if(description.hasOwnProperty(z)) {
						const created = database.createObjectStore(z, {
							keyPath 		: description[z].primaryKey,
							autoIncrement 	: description[z].autoIncrement
						});
						
						const index = description[z].index;
						for(let i = 0, length = index.length; i < length; i++) {
							const act = index[i];
							
							created.createIndex(act.name, act.key, {
								unique 		: act.unique,
								multiEntry 	: act.multiEntry,
								locale 		: act.locale
							});
						}
					}
				}
				
				return true;
			}
			catch(e) {
				console.log(e);
				
				return false;
			}
		};
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: selectFrom
	 * @version: 1.0
	 * @dependencies: [{ "name" : "JSQL", "version" : ">= 1.0" }, { "name" : "WorkerUrl", "version" : ">= 1.0" }]
	*/
	
		JSQL.selectFrom = function(database, select, version) {
			return new Promise(async resolve => {
				if(typeof select.from != "string") {
					throw new Error("Missing property 'from' in select request.");
				}
				
				if(typeof select.colum == "undefined") {
					select.colum = "*";
				}
				
				const worker = new Worker(JSQL.workerUrl);
				
				worker.addEventListener("message", function(event) {
					worker.terminate();
					
					if(event.data.state == 2) {
						resolve(event.data.result);
					}
					else {
						resolve(false);
					}
				});
				
				worker.addEventListener("error", function(e) {
					console.error(e);
					
					worker.terminate();
					resolve(false);
				});
				
				worker.postMessage({
					action : 2,
					database : database,
					version : version || await JSQL.getDatabaseVersion(database, false),
					request : select
				});
			});
		};
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: insertInto
	 * @version: 1.0
	 * @dependencies: [{ "name" : "JSQL", "version" : ">= 1.0" }, { "name" : "WorkerUrl", "version" : ">= 1.0" }]
	*/
	
		JSQL.insertInto = function(database, upsert, version) {
			return new Promise(async resolve => {
				if(typeof upsert.into != "string") {
					throw new Error("Missing property 'into' in insert request.");
				}
				
				if(typeof upsert.data == "undefined") {
					throw new Error("Missing property 'data' in insert request.");
				}
				
				const worker = new Worker(JSQL.workerUrl);
				
				worker.addEventListener("message", function(event) {
					worker.terminate();
					resolve(event.data.state);
				});
				
				worker.addEventListener("error", function(e) {
					console.error(e);
					
					worker.terminate();
					resolve(false);
				});
				
				worker.postMessage({
					action : 1,
					database : database,
					version : version || await JSQL.getDatabaseVersion(database, false),
					request : upsert
				});
			});
		};
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: deleteFrom
	 * @version: 1.0
	 * @dependencies: [{ "name" : "JSQL", "version" : ">= 1.0" }, { "name" : "WorkerUrl", "version" : ">= 1.0" }]
	*/
	
		JSQL.deleteFrom = function(database, delet, version) {
			return new Promise(async resolve => {
				if(typeof delet.from != "string") {
					throw new Error("Missing property 'from' in delete request.");
				}
				
				const worker = new Worker(JSQL.workerUrl);
				
				worker.addEventListener("message", function(event) {
					worker.terminate();
					resolve(event.data.state == 2);
				});
				
				worker.addEventListener("error", function(e) {
					console.error(e);
					
					worker.terminate();
					resolve(false);
				});
				
				worker.postMessage({
					action : 3,
					database : database,
					version : version || await JSQL.getDatabaseVersion(database, false),
					request : delet
				});
			});
		};
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: deleteDatabase
	 * @version: 1.0
	 * @dependencies: [{ "name" : "JSQL", "version" : ">= 1.0" }]
	*/
	
		JSQL.deleteDatabase = function() {
			return new Promise(resolve => {
				let length = arguments.length,
					deleted = 0,
					done = 0;
				
				function event() {
					if(++done == length) {
						resolve(deleted == length);
					}
				}
				
				for(let i = 0; i < length; i++) {
					const request = indexedDB.deleteDatabase(arguments[i]);
					
					request.addEventListener("error", event);
					request.addEventListener("success", () => deleted++);
					request.addEventListener("success", event);
				}
			});
		};
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: getDatabaseVersion
	 * @version: 1.0
	 * @dependencies: [{ "name" : "JSQL", "version" : ">= 1.0" }]
	*/
	
		JSQL.getDatabaseVersion = async function(name, type = true) {
			let version = 1;
			
			for(; await (new Promise(resolve => {
				const database = indexedDB.open(name, version);
				
				database.addEventListener("error", () => resolve(true));
				database.addEventListener("upgradeneeded", function(event) {
					indexedDB.deleteDatabase(name);
					version = 0;
					
					resolve(false);
				});
				
				database.addEventListener("success", function(event) {
					event.target.result.close();
					
					resolve(false);
				});
			})); version++);
			
			return type ? Math.floor(version / 10) : version;
		};
	
	/***** END FRAGMENT *****/
	
	
	/***** NEW FRAGMENT *****/
	/**
	 * @name: defaultWorkerUrl
	 * @version: 1.0
	*/
	
		JSQL.setWorkerUrl("./JSQL-Worker.js");
	
	/***** END FRAGMENT *****/
	
	
	if(window.Dynamique) {
		Dynamique.addModule("JSQL", JSQL);
	}
	else {
		window.JSQL = JSQL;
	}
})();
