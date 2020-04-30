const 	indexedDB 		= self.indexedDB || self.mozIndexedDB || self.webkitIndexedDB || self.msIndexedDB,
		IDBTransaction 	= self.IDBTransaction || self.webkitIDBTransaction || self.msIDBTransaction;

const getValue = function(path, tuple, data) {
	if(path instanceof Array) {
		return tuple[path[1]];
	}
	else {
		return path;
	}
};

const conditionOperator = {
	"=" : function(a, b, data) {
		return function(tuple) {
			return getValue(a, tuple, data) == getValue(b, tuple, data);
		};
	},
	"!=" : function(a, b, data) {
		return function(tuple) {
			return getValue(a, tuple, data) != getValue(b, tuple, data);
		};
	},
	">" : function(a, b, data) {
		return function(tuple) {
			return getValue(a, tuple, data) < getValue(b, tuple, data);
		};
	},
	">=" : function(a, b, data) {
		return function(tuple) {
			return getValue(a, tuple, data) >= getValue(b, tuple, data);
		};
	},
	"<" : function(a, b, data) {
		return function(tuple) {
			return getValue(a, tuple, data) < getValue(b, tuple, data);
		};
	},
	"<=" : function(a, b, data) {
		return function(tuple) {
			return getValue(a, tuple, data) <= getValue(b, tuple, data);
		};
	}
};

const createCondition = function(cond, data) {
	if(cond instanceof Array) {
		cond = {
			type : "AND",
			condition : [cond]
		};
	}
	
	const list = cond.condition;
	
	const subCond = [];
	for(let i = 0, length = list.length; i < length; i++) {
		const act = list[i];
		
		if(act instanceof Array) {
			subCond[subCond.length] = conditionOperator[act[1]](act[0], act[2]);
		}
		else {
			const newCond = createCondition(list[i], data);
			
			if(newCond) {
				subCond[subCond.length] = newCond;
			}
		}
	}
	
	if(cond.type == "AND") {
		return function(tuple) {
			for(let i = 0, length = subCond.length; i < length; i++) {
				if(!subCond[i](tuple)) {
					return false;
				}
			}
			
			return true;
		};
	}
	else if(cond.type == "OR") {
		return function(tuple) {
			for(let i = 0, length = subCond.length; i < length; i++) {
				if(subCond[i](tuple)) {
					return true;
				}
			}
			
			return false;
		};
	}
	else {
		return false;
	}
};

const sendError = function(id, database) {
	database.close();
	
	postMessage({ state : id });
};

self.onmessage = function(event) {
	const 	data = event.data;
	let		database = indexedDB.open(data.database, data.version);
	
	database.addEventListener("error", () => postMessage({ state : 0 }));
	database.addEventListener("upgradeneeded", () => postMessage({ state : 1 }));
	
	database.addEventListener("success", function(event) {
		database = event.target.result;
		const request = data.request;
		
		try {
			if(data.action == 1) {	// Insert/Update
				const 	transaction = database.transaction(request.into, "readwrite"),
						store = transaction.objectStore(request.into),
						data = request.data,
						method = typeof data.upsert == "undefined" || data.upsert ? "put" : "add";
				let		i = 0;
				
				(function insertData() {
					if(typeof data[i] != "undefined") {
						const insertion = store[method](data[i++]);
						
						insertion.addEventListener("success", insertData);
						insertion.addEventListener("error", () => sendError(0, database));
					}
					else {
						database.close();
						
						postMessage({ state : 2 });
					}
				})();
				
				// TODO: Add support of where
			}
			else if(data.action == 2) {	// Select
				const 	result 	= [],
						offset 	= typeof request.offset != "number" ? 0 : request.offset,
						limit 	= typeof request.limit != "number" ? Infinity : request.limit;
				
				const 	transaction = database.transaction(request.from, "readonly"),
						data = {
							table : {}
						};
				
				if(typeof request.from == "string") {
					request.from = [request.from];
				}
				
				for(let i = 0, length = request.from.length; i < length; i++) {
					data.table["t" + (i+1)] = transaction.objectStore(request.from[i]);
				}
				
				const 	condition = request.where ? createCondition(request.where, data) : false,
						colum = request.colum,
						columLength = colum.length;
				
				const cursor = data.table["t1"].openCursor();
				
				cursor.addEventListener("success", function(event) {
					const cursor = event.target.result;
					
					if(cursor) {
						const tuple = cursor.value;
						
						if(!condition || condition(tuple)) {
							if(request.colum == "*") {
								result[result.length] = tuple;
							}
							else {
								const temp = result[result.length] = {};
								
								for(let i = 0; i < columLength; i++) {
									 temp[colum[i]] = tuple[colum[i]];
								}
							}
						}
						
						cursor.continue();
					}
					else {
						database.close();
						postMessage({ state : 2, result : result.slice(offset, limit) });
					}
				});
				
				cursor.addEventListener("error", function() {
					
				});
			}
			else if(data.action == 3) {	// Delete
				const 	transaction = database.transaction(request.from, "readwrite"),
						condition = request.where ? createCondition(request.where, data) : false,
						cursor = transaction.objectStore(request.from).openCursor();
				
				cursor.addEventListener("success", function(event) {
					const cursor = event.target.result;
					
					if(cursor) {
						if(!condition || condition(cursor.value)) {
							cursor.delete();
						}
						
						cursor.continue();
					}
					else {
						database.close();
						postMessage({ state : 2 });
					}
				});
				
				cursor.addEventListener("error", function() {
					sendError(0, database);
				});
			}
			else {
				sendError(0, database);
			}
		}
		catch(e) {
			throw new Error(e);
			
			sendError(0, database);
		}
	});
};
