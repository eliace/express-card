


Dino.declare('Medic.remote.Object', 'Dino.events.Observer', {
	
	initialize: function(collection, attrs) {
		Medic.remote.Object.superclass.initialize.apply(this, arguments);
		this.attributes = attrs || [];
		this.source = collection;
	},
	
	save: function(val, callback) {
		var path = (this.source) ? this.source.path() : '';
		
		var fields = {};
		Dino.each(this.attributes, function(name){ fields[name] = val[name]; });

		if(val.id) {
			// если ID определен, то этот объект требуется обновить
			return $.post(path + '/' + val.id, {_serialized: $.toJSON(fields)}, callback, 'json');
		}
		else {
			//TODO здесь должно быть создание нового объекта
			return $.post(path, {_method: 'put', _serialized: $.toJSON(fields)}, callback, 'json');
		}		
	}
	
});




Dino.declare('Medic.remote.Collection', 'Dino.events.Observer', {
	
	initialize: function(name, source, o) {
		Medic.remote.Collection.superclass.initialize.apply(this, arguments);
		this.name = name;
		this.source = source;
	},
	
	path: function() {
		return (this.source ? this.source.path() + '/' : '') + this.name;
	},
	
	object: function(attrs) {
		return new Medic.remote.Object(this, attrs);
	},

	load: function(query, callback) {
		$.getJSON(this.path(), {'query': query}, callback)
	},
	
	load_all: function() {
		var target = {
			chain: [].concat(arguments),
			to: function(ds) {	
				this.chain.push(ds)	
			},
			then: function(f) {	
				console.log('then');
				this.chain.push(f)	
			},
			ready: function(json) {
				console.log(this.chain);
				Dino.each(this.chain, function(t){
					if(Dino.isFunction(t)) t.call(this, json);
					else if(t instanceof Dino.data.DataSource) t.set(json);
					else if(Dino.isPlainObject(t)) Dino.merge(t, json);
				});
			}
		};
		
		
		$.getJSON(this.path(), {'query': 'all'}, function(json){ target.ready(json); });
		return target;
	}
	
	
});









