


Dino.declare('Medic.remote.Object', 'Dino.events.Observer', {
	
	initialize: function(collection, attrs) {
		Medic.remote.Object.superclass.initialize.apply(this, arguments);
		this.attributes = attrs || [];
		this.source = collection;
	},
	
	save: function(val, callback) {
		('id' in val) ? this.update(val, callback) : this.create(val, callback);
	},
	
	create: function(val, callback) {
		var fields = {};
		Dino.each(this.attributes, function(name){ fields[name] = val[name]; });

		$.post(this.path(), {_method: 'put', _serialized: $.toJSON(fields)}, callback, 'json');		
	},

	update: function(val, callback) {
		var fields = {};
		Dino.each(this.attributes, function(name){ fields[name] = val[name]; });

		$.post(this.path() + '/' + val.id, {_serialized: $.toJSON(fields)}, callback, 'json');
	},
	
	remove: function(arg, callback) {
		var id = Dino.isPlainObject(arg) ? id = arg.id : arg;
		$.post(this.path() + '/' + id, {_method: 'delete'}, callback, 'json');
	},
	
	path: function() {
		return (this.source) ? this.source.path() : '';
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

	load: function(query, params, callback) {
		$.getJSON(this.path(), Dino.merge({'query': query}, params), callback)
	},
	
	load_all: function() {
		var target = {
			chain: [].concat(arguments),
			to: function(ds) {	
				this.chain.push(ds)	
				return this;
			},
			then: function(f) {	
				this.chain.push(f);
				return this;
			},
			ready: function(json) {
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









