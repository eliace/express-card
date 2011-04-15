/**
 * @namespace
 * 
 */
var Dino = (function(){

	var D = {};


	/**
	 * Копирование свойств одного объекта в другой (создание примеси)
	 * @param {Object} obj целевой объект, которому будут добавлены новые свойства
	 * @name Dino.override
	 * @function
	 */
	D.override = function(obj) {
		for(var j = 1; j < arguments.length; j++){
			var overrides = arguments[j] || {};
			for(var i in overrides){
				obj[i] = overrides[i];
			}
		}
		return obj;
	};
	
	
	
	/**
	 * Рекурсивное копирование свойств одного объекта в другой (создание примеси)
	 * 
	 * @name Dino.override_r
	 * @function
	 * @param {Object} obj целевой объект, которому будут добавлены новые свойства
	 */
	D.override_r = function(obj) {
		for(var j = 1; j < arguments.length; j++){
			var overrides = arguments[j];
			for(var i in overrides){
				var prop = overrides[i];
				if(D.isPlainObject(prop)){
					if(!(i in obj) || !D.isPlainObject(obj[i])) obj[i] = {};
					D.override_r(obj[i], prop);
				}
				else{
					obj[i] = prop;
				}
			}
		}
		return obj;
	};
	
	/**
	 * Псевдоним для {@link Dino.override}
	 * @name Dino.merge
	 * @function
	 */
	D.merge = D.override;
	/**
	 * Псевдоним для {@link Dino.override_r}
	 * @name Dino.merge_r
	 * @function
	 */
	D.merge_r = D.override_r;
	
	/**
	 * Создание расширенного класса
	 * 
	 * @name Dino.extend
	 * @function
	 * @param {Object} p_ctor
	 * @param {Object} ctor
	 * @param {Object} overrides
	 */
	D.extend = function(p_ctor, ctor, overrides) {
		
		if(typeof ctor == 'object') {
			overrides = ctor;
			ctor = function(){ p_ctor.apply(this, arguments); };
		}
		
		
		var F = function(){};
		F.prototype = p_ctor.prototype;
		ctor.prototype = new F();
		ctor.prototype.constructor = ctor;
		ctor.superclass = p_ctor.prototype;
		ctor.super_ctor = p_ctor;
		
		D.override(ctor.prototype, overrides);

		return ctor;
	};
	
	/**
	 * Рекурсивный обход всех базовых классов 
	 * 
	 * @name Dino.hierarchy
	 * @function
	 * @param {Object} ctor класс, для которого нужно выполнить обход
	 * @param {Function} callback метод, вызывваемый для каждого базового класса
	 */
	D.hierarchy = function(ctor, callback) {
		if(!ctor) return;
		D.hierarchy(ctor.super_ctor, callback);
		callback.call(this, ctor.prototype);
	};
	
	
	var _dtypes = {};
	
	/**
	 * Объявление класса
	 * 
	 * @param {String} class_name полное имя класса
	 * @param {String|Object} base_class базовый класс или имя базового класса
	 * @param {Object} overrides набор свойств и методов нового класса
	 * @param {String} [dtype] dino-тип (если не указан, то новый класс не регистрируется)
	 * 
	 * @name Dino.declare
	 * @function
	 */
	D.declare = function(class_name, base_class, overrides, dtype) {
		
		if(typeof base_class == 'string') base_class = eval(base_class);
		
		var clazz = D.extend(base_class, overrides);
		
		// создаем пространство имен для класса
		var cp_a = class_name.split('.');
		var cp = 'window';
		for(var i = 0; i < cp_a.length; i++){
			cp += '.'+cp_a[i];
			eval( 'if(!'+cp+') '+cp+' = {};' );
		}		
		eval(cp + ' = clazz;');
		
		// регистрируем dtype класса (если он есть)
		if(dtype){
			clazz.prototype.dtype = dtype;
			_dtypes[dtype] = clazz;
		}

		clazz.prototype.className = class_name;
		
		return clazz;
	};
	
	
	/**
	 * Создание экземпляра объекта (должен присутствовать dtype в options либо defaultType)
	 * 
	 * @name Dino.object
	 * @function
	 * @param {Object} options
	 * @param {Object} defaultType
	 */
	D.object = function(options, defaultType) {
		
		if(options instanceof Dino.BaseObject) return options;
		
		var dtype = options.dtype || defaultType;
		
		var ctor = _dtypes[dtype];
		
		if(!ctor ){
			Dino.log('Class for dtype "'+dtype+'" not found');
			return null;
		}
				
		return new ctor(options);	
	};

//	D.widget = D.object;
	
	
	
	D.noop = function(){};
	
/*	
	D.isFunction = function(obj) { return obj instanceof Function; };
	D.isArray = function(obj) {return obj instanceof Array;}
	D.isNumber = function(obj) {return typeof obj == 'number';};
	D.isBoolean = function(obj) {return typeof obj == 'boolean';};
	D.isString = function(obj) {return typeof obj == 'string';};
	D.isObject = function(obj) { return obj.constructor == Object; };
*/


	// в версии jquery 1.4 появились методы, которые раньше реализовывались в Dino
	
	/**
	 * Является ли объект функцией 
	 * 
	 * @name Dino.isFunction
	 * @function
	 * @param {Object} obj
	 */
	D.isFunction = $.isFunction;
	/**
	 * Является ли объект массивом
	 * 
	 * @name Dino.isArray
	 * @function
	 * @param {Object} obj
	 */
	D.isArray = $.isArray;
	/**
	 * Является ли объект простым объектом
	 * 
	 * @name Dino.isPlainObject
	 * @function
	 * @param {Object} obj
	 */
	D.isPlainObject = $.isPlainObject;
	/**
	 * Является ли объект строкой
	 * 
	 * @name Dino.isString
	 * @function
	 * @param {Object} obj
	 */
	D.isString = function(obj) {
		return typeof obj == 'string';
	};
	/**
	 * Является ли объект логической переменной
	 * 
	 * @name Dino.isBoolean
	 * @function
	 * @param {Object} obj
	 */
	D.isBoolean = function(obj) {
		return typeof obj == 'boolean';
	};
	/**
	 * Является ли объект числом
	 * 
	 * @name Dino.isNumber
	 * @function
	 * @param {Object} obj
	 */
	D.isNumber = function(obj) {
		return typeof obj == 'number';
	};	
	
	/**
	 * Последовательный обход каждого элемента массива или хэша
	 * 
	 * в jquery есть функция $.each, но меня не устраивает порядок аргументов в замыкании
	 * 
	 * @name Dino.each
	 * @function
	 * @param {Object|Array} src объект, элементы которого необходимо просмотреть
	 * @param {Function} callback функция, вызываемая для каждого элемента
	 */
	D.each = function(src, callback){
		if(Dino.isArray(src)){
			var arr = src;
			for(var i = 0; i < arr.length; i++){
				if( callback.call(arr, arr[i], i) === false ) break;
			}
		}
		else {
			var obj = src;
			for(var i in obj){
				if( callback.call(obj, obj[i], i) === false ) break;
			}	
		}
	}
	
	/**
	 * Фильтрация (как правило приводит к уменьшению размерности)
	 * 
	 * Элемент попадает в итоговый объект
	 * 
	 * @name Dino.filter
	 * @function
	 * @param {Object|Array} src объект, элементы которого необходимо фильтровать
	 * @param {Function} callback функция, вызываемая для каждого элемента
	 * @returns {Object|Array} отфильтрованный объект или массив, в зависимости типа src 
	 */
	D.filter = function(src, fn){
		return ( D.isArray(src) ) ? _filter_arr(src, fn) : _filter_obj(src, fn);
	};
	
	/**
	 * @ignore
	 */
	var _filter_obj = function(obj, fn) {
		var result = {};
		for(var i in obj)
			if( fn.call(obj, obj[i], i) ) result[i] = obj[i];
		return a;
	}

	/**
	 * @ignore
	 */	
	var _filter_arr = function(arr, fn) {
		var result = [];
		for(var i = 0; i < arr.length; i++)
			if( fn.call(arr, arr[i], i) ) result.push(arr[i]);
		return result;
	}
	
	/**
	 * Псевдоним для {@link Dino.filter}
	 * 
	 * @name Dino.find_all
	 * @function
	 */
	D.find_all = D.filter;
	
	/**
	 * Отображение (размерность сохраняется)
	 * 
	 * @name Dino.map
	 * @function
	 * @param {Object|Array} src коллекция
	 * @param {Function} callback функция, вызываемая для каждого элемента
	 */
	D.map = function(obj, fn) {
		var a = D.isArray(obj) ? [] : {};
		for(var i in obj) a[i] = fn.call(obj, obj[i], i);
		return a;	
	};
	
	/**
	 * Поиск первого элемента, удовлетворяющего критерию
	 * 
	 * @name Dino.find
	 * @function
	 * @param {Object|Array} obj коллекция
	 * @param {Function|Any} criteria критерий 
	 */
	D.find = function(obj, criteria) {
		if(!D.isFunction(criteria)){
			var x = criteria;
			criteria = function(it) { return it == x; };
		}
		for(var i in obj)
			if(criteria.call(obj, obj[i], i)) return obj[i];
		
		return null;
	};
	
	/**
	 * Получение индекса (или ключа) элемента в коллекции
	 * 
	 * Если критерий не является функцией, то используется метод Dino.eq
	 * 
	 * @name Dino.index_of
	 * @function
	 * @param {Object|Array} obj коллекция
	 * @param {Function|Any} criteria критерий 
	 */
	D.index_of = function(obj, criteria) {
		if(!Dino.isFunction(criteria))
			criteria = D.eq.curry(criteria);
		for(var i in obj)
			if(criteria.call(obj, obj[i], i)) return i;
		return -1;
	};
	
	/**
	 * Проверка, содержится ли элемент в массиве
	 * 
	 * @name Dino.in_array
	 * @function
	 * @param {Array} arr массив
	 * @param {Any} val значение
	 */
	D.in_array = function(arr, val) {
		for(var i = 0; i < arr.length; i++)
			if(arr[i] == val) return true;
		return false;
	}
	
	/**
	 * Удаление элемента из массива (массив уменьшает размерность)
	 * 
	 * @name Dino.remove_from_array
	 * @function
	 * @param {Object} arr массив
	 * @param {Object} val удаляемый элемент
	 */
	D.remove_from_array = function(arr, val) {
		var index = -1;
		for(var i = 0; i < arr.length; i++) {
			if(arr[i] == val) {
				index = i;
				break;
			}
		}
		if(index != -1) arr.splice(index, 1);
		
		return (index != -1);
	};
	
	/**
	 * Полное копирование объекта.
	 * 
	 * Копируются вложенные простые объекты и массивы
	 * 
	 * @name Dino.deep_copy
	 * @function
	 * @param {Any} src копируемый объект
	 */
	D.deep_copy = function(src) {
		var copy = null;
		
		var is_po = D.isPlainObject(src);
		if(is_po || D.isArray(src)){
			copy = is_po ? {} : [];
			for(var i in src)
				copy[i] = D.deep_copy(src[i]);				
//			D.each(src, function(item, i){
//				copy[i] = D.deep_copy(item);
//			});
		}
		else{
			copy = src;
		}
		
		return copy;
	};

	
	
	/**
	 * Предикативная функция равенства
	 * 
	 * Используется оператор =
	 * 
	 * @name Dino.eq
	 * @function
	 * @param {Object|Array} obj коллекция
	 * @param {Object} item элемент коллекции
	 * @param {Object} i ключ/индекс элемента
	 */
	D.eq = function(obj, item, i) {
		return obj == item;
	};
	
	/**
	 * Предикативная функция неравенства
	 * 
	 * Используется оператор !=
	 * 
	 * @name Dino.ne
	 * @function
	 * @param {Object|Array} obj коллекция
	 * @param {Object} item элемент коллекции
	 * @param {Object} i ключ/индекс элемента
	 */
	D.ne = function(obj, item, i) {
		return obj != item;
	};
		
	/**
	 * @constructor
	 * @memberOf Dino
	 * @name ObjectTree
	 * @param {Object} obj
	 * @param {Object} factory
	 * @param {Object} ignore
	 */
	// набор методов, позволяющих работать с объектом как с деревом
	D.ObjectTree = function(obj, factory, ignore) {
		this.obj = obj;
		this.factory = factory;
		this.ignore_list = ignore || [];
	};
	
	/**
	 * @name Dino.ObjectTree#ensure
	 * @function
	 * @param {Object} path
	 */
	D.ObjectTree.prototype.ensure = function(path){
		if(D.isString(path)) path = path.split('.');
		
		var obj = this.obj;
		for(var i = 0; i < path.length; i++){
			var key = path[i];
			if(!(key in obj)) obj[key] = (this.factory) ? this.factory() : {};
			obj = obj[key];
		}
		return obj;
	}

	/**
	 * 
	 * @name Dino.ObjectTree#get
	 * @function
	 * @param {Object} path
	 */	
	D.ObjectTree.prototype.get = function(path){
		if(D.isString(path)) path = path.split('.');
		
		var obj = this.obj;
		for(var i = 0; i < path.length; i++){
			var key = path[i];
			obj = obj[key];
		}
		return obj;
	}
	
	/**
	 * 
	 * @name Dino.ObjectTree#del
	 * @function
	 * @param {Object} path
	 */
	D.ObjectTree.prototype.del = function(path) {
		if(D.isString(path)) path = path.split('.');

		var obj = this.obj;
		for(var i = 0; i < path.length; i++){
			var key = path[i];
			// если это последний элемент пути - удаляем
			if(i == path.length-1) 
				delete obj[key];
			else
				obj = obj[key];
		}
	},
	
	
	/**
	 * 
	 * @name Dino.ObjectTree#traverse
	 * @function
	 * @param {Object} callback
	 * @param {Object} obj
	 */
	D.ObjectTree.prototype.traverse = function(callback, obj) {
		if(arguments.length == 1) obj = this.obj;
		else{
			if(obj == null || obj == undefined) return;
			callback.call(this, obj);
		}
		
		for(var i in obj){
			if(D.isPlainObject(obj[i]) && !(D.in_array(this.ignore_list, i))) this.traverse(callback, obj[i]);
		}
	}
	
	
	D.otree = function(obj){
		return new D.ObjectTree(obj);
	};
	
	
	
	/**
	 * Печать объекта в удобочитаемой форме
	 * 
	 * @name Dino.pretty_print
	 * @function
	 * @param {Any} obj любой объект/примитив
	 * @param {Integer} indent отступ
	 * @returns {String}
	 */
	D.pretty_print = function(obj, indent) {
		
		if(obj == undefined) return undefined;
		
		indent = indent || 0;
		var tabs = '';
		for(var i = 0; i < indent; i++) tabs += '\t';
		
		if(obj.pretty_print) return obj.pretty_print(indent);
		
		if(D.isString(obj))
			return '"'+obj.replace(/\n/g, '\\n')+'"';
		else if(D.isBoolean(obj))
			return ''+obj;
		else if(D.isNumber(obj) || Dino.isBoolean(obj))
			return obj;
		else if(D.isArray(obj)){
			var items = [];
			D.each(obj, function(item){
				items.push(D.pretty_print(item, indent));
			});
			return '[' + items.join(', ') + ']';
		}
		else if(D.isFunction(obj)){
			return 'function()';
		}
		else if(D.isPlainObject(obj) || !indent){
			var items = [];
			D.each(obj, function(item, key){
				items.push(tabs + '\t' + key + ':' + D.pretty_print(item, indent+1));					
			});
			return '{\n' + items.join(',\n') + '\n' + tabs + '}';
		}
		else
			return obj
		
	};
	
	
	/**
	 * Экранирование строки для вывода в html
	 * 
	 * @name Dino.escapeHtml
	 * @function
	 * @param {String} s строка
	 * @returns {String} экранированная строка
	 */
	D.escapeHtml = function(s) {
		return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	};
	
	/**
	 * Форматированный вывод значений.
	 * 
	 * @example
	 * Dino.format("%s items from %s selected", 1, 10);
	 * 
	 * @name Dino.format
	 * @function
	 * @param {String} format_str строка форматирования
	 * @return {String}
	 */
	D.format = function(format_str) {
		var values = [];
		for(var i = 1; i < arguments.length; i++) values.push(arguments[i]);
		return format_str.replace(/(%s)/g, function(str) {
			var replace_val = ''
			if(str == '%s') replace_val = ''+values.shift();
			return replace_val;
		});
	}
	
	/**
	 * Форматированный вывод объекта
	 * 
	 * @example
	 * 
	 * var record = {
	 * 	first_name: 'Alice',
	 * 	last_name: 'Green',
	 * 	email_count: 3
	 * }
	 * 
	 * Dino.format_obj("#{first_name} #{last_name} has #{email_count} e-mails", record);
	 * 
	 * Output: Alice Green has 3 e-mails
	 * 
	 * @name Dino.format_obj
	 * @function
	 * @param {Object} format_str строка форматирования
	 * @param {Object} obj объект
	 */
	D.format_obj = function(format_str, obj) {
		if(obj === undefined) return '';
		return format_str.replace(/#{\s*(.+?)\s*}/g, function(str, key) {
			var o = obj;
			var arr = key.split('.');
			for(var i = 0; i < arr.length; i++) o = o[arr[i]]; 
			return o;
		});		
	}
	
	
	
	D.filter_list = function(val, list) {
		for(var i = 0; i < list.length; i++)
			if(!list[i].call(this, val)) return false;
		return true;
	}
	
	
/*	
	
	D.serialize = function(obj, indent) {
		
		if(obj == undefined) return obj;
		
		indent = indent || 0;
		var tabs = '';
		for(var i = 0; i < indent; i++) tabs += '\t';
		
		if(obj.pretty_print) return obj.pretty_print(indent);
		
		switch(typeof obj){
			case 'string':
				return '"'+obj.replace(/\n/g, '\\n')+'"';
			case 'object':
				var items = [];
				if(D.isArray(obj)){
					D.each(obj, function(item){
						items.push(D.pretty_print(item, indent));
					});
					return '[' + items.join(', ') + ']';
				}
				else{
					D.each(obj, function(item, key){
						items.push(tabs + '\t"' + key + '":' + D.pretty_print(item, indent+1));					
					});
					return '{\n' + items.join(',\n') + '\n' + tabs + '}';
				}
			default:
				return obj;
		}
	};
*/	
	
	
	
	/**
	 * @name Dino.timestamp
	 * @function
	 */
	D.timestamp = function() {
		return new Date().getTime();
	};
	
	
	
		
	/**
	 * Добавление карринга к классу Function
	 */
	Function.prototype.curry = function(arg) {
		var F = this;
		var pre_args = arguments;
		return function(){
			var args = [];
			for(var i = 0; i < pre_args.length; i++) args.push(pre_args[i]);
			for(var i = 0; i < arguments.length; i++) args.push(arguments[i]);
//			args.unshift(arg);
			return F.apply(this, args);
		};
	};

	Function.prototype.rcurry = function(arg) {
		var F = this;
		var post_args = arguments;
//		for(var i = 0; i < arguments.length; i++) post_args.push(arguments[i]);
		return function(){
			var args = [];
			for(var i = 0; i < arguments.length; i++) args.push(arguments[i]);
			for(var i = 0; i < post_args.length; i++) args.push(post_args[i]);
//			args.push(arg);
			return F.apply(this, args);
		};
	};
	
	
	/**
	 * Базовый объект
	 * 
	 * @constructor
	 * @memberOf Dino
	 * @name BaseObject
	 */
	D.BaseObject = function() {
		this.initialize.apply(this, arguments);
	};
	
	/** 
	 * @function 
	 * @name Dino.BaseObject#initialize 
	 */
	D.BaseObject.prototype.initialize = function() {};
	/**
	 * @function
	 * @name Dino.BaseObject#destroy
	 */
	D.BaseObject.prototype.destroy = function() {};
	/**
	 * @function
	 * @name Dino.BaseObject#base
	 */
//	D.BaseObject.prototype.base = function(method, args) {
//		eval(this.className + '.superclass.'+method+'.apply(this, args)');
//	};
	
	D.log = function(msg) {
		// Если установлен Firebug, то используем его консоль
		if(console) console.log(msg);
	};
	
	D.constants = {
	};
	
//	$.dino = D;
	
	return D;
})();

//var _dino = Dino;




/**
 * @name Dino.events
 * @namespace
 */


/**
 * @class
 * @name Dino.events.Event
 * @extends Dino.BaseObject
 */
Dino.declare('Dino.events.Event', Dino.BaseObject, /** @lends Dino.events.Event.prototype */{
	
	/**
	 * @param {Object} overrides
	 * @param {Object} baseEvent
	 */
	initialize: function(overrides, baseEvent) {
		Dino.events.Event.superclass.initialize.call(this);
		
		if(overrides) Dino.override(this, overrides);
		
//		this.is_stopped = false;
		this.baseEvent = baseEvent;
	}
	
//	preventDefault: function() {
//		if(this.baseEvent && this.baseEvent.preventDefault)
//			this.baseEvent.preventDefault();
//		this.is_stopped = true;
//	}
	
});


Dino.declare('Dino.events.CancelEvent', 'Dino.events.Event', /** @lends Dino.events.CancelEvent.prototype */{

	/**
	 * @constructs
 	 * @extends Dino.events.Event
	 * @param {Object} overrides
	 * @param {Object} baseEvent
	 */
	initialize: function(overrides, baseEvent) {
		Dino.events.CancelEvent.superclass.initialize.apply(this, arguments);
		this.isCanceled = false;
	},
	
	cancel: function(){
		this.isCanceled = true;
	}
	
});





Dino.declare('Dino.events.Dispatcher', 'Dino.BaseObject', /** @lends Dino.events.Dispatcher.prototype */{
	
	
	/**
	 * @constructs
	 * @extends Dino.BaseObject
	 * @param {Object} target
	 */
	initialize: function(target) {
		Dino.events.Dispatcher.superclass.initialize.apply(this, arguments);
		this.tree = new Dino.ObjectTree({}, function(){ return {handlers:[]}; }, ['handlers']);
		this.target = target;
	},
	
	/**
	 * Регистрируем событие.
	 * 
	 * reg(type, callback, target)
	 */
	reg: function(type, callback, target) {
		var node = this.tree.ensure(type);
		node.handlers.push({'callback': callback, 'target': target});
		return this;
	},
	
	/**
	 * Убираем регистрацию события.
	 * 
	 * unreg(type)
	 * unreg(callback)
	 * unreg(type, callback)
	 * unreg(target)
	 */
	unreg: function(arg, arg2) {
		
		if(arguments.length == 2){
			var node = this.tree.get(arg);
			// с одной стороны это очень "жадный" способ удаления, а с другой - убирает некорректно зарегистрированных слушателей
			node.handlers = Dino.filter(node.handlers, Dino.ne.curry(arg2));
		}
		else if( Dino.isString(arg) ){
			this.tree.del(arg);
		}
		else if( Dino.isFunction(arg) ){
			// с одной стороны это очень "жадный" способ удаления, а с другой - убирает некорректно зарегистрированных слушателей
			this.tree.traverse(function(node){
				node.handlers = Dino.filter(node.handlers, Dino.ne.curry(arg));
			});
		}
		else {
			this.tree.traverse(function(node){
				node.handlers = Dino.filter(node.handlers, function(h) { return (h.target != arg); });
			});
		}
		
		return this;		
	},
	
	/**
	 * Инициируем событие.
	 * 
	 * fire(type, event)
	 * 
	 * type - тип события в формате тип_1.тип_2 ... .тип_N
	 * 
	 */
	fire: function(type, event, baseEvent) {
		
		// "ленивая" генерация базового события
		if(arguments.length == 1) 
			event = new Dino.events.Event();
		else if( Dino.isPlainObject(event) ){
			event = new Dino.events.Event(event, baseEvent);
		}
		
		var self = this;
		
		// получаем узел указанного типа
		var node0 = this.tree.get( type );
		// обходим всех потомков и вызываем все обработчики событий
		this.tree.traverse(function(node){
			Dino.each(node.handlers, function(h){
				h.callback.call(h.target || self.target, event);
			});
		}, node0);
		
		return this;
	},
	
	unreg_all: function(){
		this.tree = new Dino.ObjectTree({}, function(){ return {handlers:[]}; }, ['handlers']);		
	}
	
	
});


/**
 * @class
 * @name Dino.events.Observer
 */
Dino.declare('Dino.events.Observer', 'Dino.BaseObject', /** @lends Dino.events.Observer.prototype */{
	
	initialize: function() {
		Dino.events.Observer.superclass.initialize.apply(this, arguments);
		
		/** @type Dino.events.Dispatcher */
		this.events = new Dino.events.Dispatcher(this);
	}
	
});

/**
 * @name Dino.data
 * @namespace
 */



Dino.declare('Dino.data.DirtyEvent', 'Dino.events.Event', /** @lends Dino.events.CancelEvent.prototype */{

	initialize: function(overrides, baseEvent) {
		Dino.data.DirtyEvent.superclass.initialize.apply(this, arguments);
		this.is_canceled = false;
		this.is_stopped = false;
	},
	
	cancel: function(){
		this.is_canceled = true;
	},
	
	stop: function(){
		this.is_stopped = true;
	}
	
	
});




/**
 * @class
 * @name Dino.data.DataSource
 * @extends Dino.events.Observer
 */
Dino.declare('Dino.data.DataSource', 'Dino.events.Observer', /**@lends Dino.data.DataSource.prototype */{
	
	classOptions: {
		useDirty: false,
		oid: 'id'
	},
	
	/**
	 * @param {Object} src
	 * @param {Object} id
	 * @param {Object} options
	 */
	initialize: function(src, id, options) {
		Dino.data.DataSource.superclass.initialize.apply(this, arguments);

		if(src)	this.source = src;
		
		if(arguments.length == 2){
			this.source = src;
			if(Dino.isPlainObject(id)) options = id;
			else this.id = id;
		}
		else if(arguments.length == 3) {
			this.id = id;
		}
		
/*		
		if(arguments.length < 2){
			this.source = src;
		}
		else {
			this.source = src;
			this.id = id;
		}
*/		
		this.options = Dino.utils.overrideOpts({}, this.classOptions, options);
		this.items = {};
		this.is_dirty = false;
//		this.stop_dirty = false;
//		this.filter_chain = [];
		
	},
	
	
	destroy: function() {
		this.each_item(function(item){ item.destroy(); });
		this.events.unreg_all();
	},
	
	val: function() {
		if(this.source instanceof Dino.data.DataSource){
			return ('id' in this) ? this.source.val()[this.id]: this.source.val();//get(this.id) : this.source.get();
		}
		else{
			return ('id' in this) ? this.source[this.id] : this.source;
		}
	},
	
	// получаем значение
	get: function(i) {
		if(arguments.length == 0)
			return this.val();
		else{
			return this.item(i).val();			
		}
	},
	
	// устанавливаем значение
	set: function(i, newValue) {
		if(arguments.length == 1) {
			newValue = i;
			// удаляем все элементы
			for(var j in this.items){
				this.items[j].destroy();
			}
			// теперь список элементов пуст
			this.items = {};
			
			var oldValue = this.val();//('id' in this) ? this.source.val()[this.id] : this.source.val();				
			
			
			
			if (this.source instanceof Dino.data.DataSource) {
				('id' in this) ? this.source.val()[this.id] = newValue : this.source.set(newValue);
	  	}
			else {
				('id' in this) ? this.source[this.id] = newValue : this.source = newValue;
			}
//			var src = (this.source instanceof Dino.data.DataSource) ? this.source.val() : this,source;
			 
//			('id' in this) ? this.source.val()[this.id] = newValue : this.source = newValue;
			
//			if(this.source instanceof Dino.data.DataSource){
//				('id' in this) ? this.source.set(this.id, newValue) : this.source.set(newValue);
//			}
//			else {
//				('id' in this) ? this.source[this.id] = newValue : this.source = newValue;
//			}
			this.events.fire('onValueChanged', {'oldValue': oldValue, 'newValue': newValue});
			
			if(this.source instanceof Dino.data.DataSource)
				this.source.events.fire('onItemChanged', {item: this});
			
			// помечаем источник данных как "грязный"
			if(this.options.useDirty) this.dirty();
		}
		else {
			this.item(i).set(newValue);
		}
		
	},
	
	
	// обходим все значения
	each: function(callback) {
		var range = this.range;
		var self = this;
		
		var values = this.val();
		
		if(this.filter_chain) {
			var indices = this.filter_chain.call(this, values);
			for(var i = 0; i < indices.length; i++) {
				var id = indices[i];
				var val = values[id];
				callback.call(this, val, id);
			}
		}
		else {
			Dino.each(values, function(val, i){
				callback.call(this, val, i);
			});			
		}
		
	},
	
	/**
	 * Обход всех элементов данных.
	 * 
	 * Обращаем внимание, что количество элементов данных не обязательно совпадает
	 * с количеством значений
	 * 
	 * @param {Object} callback
	 */
	each_item: function(callback) {
		Dino.each(this.items, callback);
	},
	
	
	item: function(i) {
		
		var data_item = this;
		
		// если ключ - строка, то он может быть составным 
		if(Dino.isString(i)) {
			var a = i.split('.');
			var i = a.pop();
			// двигаемся внутрь объекта по элементам ключа
			for(var j = 0; j < a.length; j++) data_item = data_item.item(a[j]);
		}
		
		return data_item.ensure_item(i);
//		//TODO элементы тоже можно получать по составному индексу
//		if(!(i in this.items)) {
//			var item = Dino.isArray(this.get(i)) ? new Dino.data.ArrayDataSource(this, i) : new Dino.data.ObjectDataSource(this, i);
//			this.items[i] = item;
//		}
//		return this.items[i];
	},
	
	
	ensure_item: function(i) {
		// если элемент данных отсутствует, то вызываем метод создания элемента
		if(!(i in this.items))
			this.items[i] = this.create_item(i);
		return this.items[i];		
	},
	
	create_item: function(i) {
		// для массивов используем ArrayDataSource, а для всего остального ObjectDataSource
		return Dino.isArray(this.val()[i]) ? new Dino.data.ArrayDataSource(this, i, this.options) : new Dino.data.ObjectDataSource(this, i, this.options);
	},
	
	dirty: function(flag, target) {

		flag = (arguments.length == 0) ? true : flag;

		if(this.is_dirty) flag = false;
		
		if(flag) {			
			
			this.is_dirty = true;
			
			// выполняем проверку на стоп-критерий
			if(this.options.stopCriteria && this.options.stopCriteria.call(this, this.val())) {
				target = this;
				flag = false;
			}
		}
		
		this.events.fire('onDirty', {'target': target});
		
		if(this.source instanceof Dino.data.DataSource) this.source.dirty(flag, target);
		
		
/*		
		flag = (arguments.length == 0) ? true : flag;
		
		if(flag) {
			if(this.is_dirty) return;

			this.is_dirty = true;
						
			if(this.options.dirtyFilter && !this.options.dirtyFilter.call(this)) {
			}
			else {
				var event = new Dino.events.DirtyEvent();
				this.events.fire('onDirty', event);			
				this.is_dirty = !event.is_canceled; 				
				if(event.is_stopped || event.is_canceled) return true;
			}
			
			
//			if(this.stop_dirty) return true; //FIXME использовать флаг не совсем корректно, поскольку он не может быть опцией
			
			if(this.source instanceof Dino.data.DataSource) if( this.source.dirty(true) ) return true;
		}
		else {
			if(!this.is_dirty) return;

			this.is_dirty = false;

			if(this.options.dirtyFilter && !this.options.dirtyFilter.call(this, this.val())) {
			}
			else {
				var event = new Dino.events.DirtyEvent();
				this.events.fire('onClean', event);			
				this.is_dirty = event.is_canceled; 				
				if(event.is_stopped || event.is_canceled) return true;
			}

//			this.events.fire('onClean', event);
//			if(event.isCanceled) return;
//			
//			this.is_dirty = false;
//
//			if(this.stop_dirty) return;
			
			for(var i in this.items) this.items[i].dirty(false);
		}
*/		
	},
	
	clean: function() {
		this.is_dirty = false;
		for(var i in this.items) this.items[i].clean();		
	},
	
	
	walk: function(callback) {
		if( callback.call(this, this) ) return;
		for(var i in this.items) this.items[i].walk(callback);
	},
	
	find: function(criteria) {
		return Dino.find(this.items, criteria);
	},

	has_source: function(item) {
		var src = this;
		while(src) {
			if(src == item) return true;
			src = src.source;
		}
		return false;
	},
	
	find_by_oid: function(oid) {
		var result = null;
		var oid_key = this.options.oid;
		this.each(function(val){ if(val[oid_key] == oid) {result = val; return false;} });
		return result;
	}
	
		
//	asArray: function() {
//		return new Dino.data.ArrayDataSource(this);
//	},
//	
//	asObject: function() {
//		return new Dino.data.ObjectDataSource(this);
//	}
	
/*	
	eachItem: function(callback){
		Dino.each(this.items, callback);
	}
*/	
	
});










/**
 * @class
 * @name Dino.data.ArrayDataSource
 * @extends Dino.data.DataSource
 * @param {Object} src
 * @param {Object} id
 * @param {Object} options
 */
Dino.declare('Dino.data.ArrayDataSource', 'Dino.data.DataSource', /** @lends Dino.data.ArrayDataSource.prototype */{
	
	initialize: function(src, id, options) {
		this.source = [];
		Dino.data.ArrayDataSource.superclass.initialize.apply(this, arguments);
	},
	
	
	del: function(i) {
	
		if(arguments.length == 0) {
			
			if(this.source) this.source.del(this.id);
			
			return;
		}
	
		var item = this.items[i];
	
		// удаляем элемент, если он есть
		if(i in this.items){
			item.destroy();
			delete this.items[i];
		}
		
		var a = this.val();
		// оповещаем элементы о смене индекса и меняем ключ в кэше элементов
		for(var j = i+1; j < a.length; j++){
//			if(j in this.items){
				//this.items[j]
			this.events.fire('onIndexChanged', {'oldIndex': j, 'newIndex': (j-1)});
			if(j in this.items){
				this.items[j].id = j-1;
				this.items[j-1] = this.items[j];
				delete this.items[j];
			}
			
//			}
		}
		
		// удаляем элемент массива
		a.splice(i, 1);
		
		this.events.fire('onItemDeleted', {'index': i, 'item': item});
		
		// помечаем источник данных как "грязный"
//		this.dirty();		
	},
	
	add: function(value, index) {
		var a = this.val();
		
		var isLast = false;
		
		if(index == null){
			a.push(value);
			index = a.length-1;
			isLast = true;
		}
		else {
			// меняем индексы элементов данных
			for(var i = a.length-1; i >= index; i--){
				if(this.items[i]){
//					this.events.fire('onIndexChanged', {'oldIndex': j, 'newIndex': (j-1)});
					this.items[i].id = i+1;
					this.items[i+1] = this.items[i];
				}
			}
			
			delete this.items[index];
			
			// добавляем новый элемент массива
			a.splice(index, 0, value);
		}
		
		var item = this.item(index);
		
		this.events.fire('onItemAdded', {'index': index, 'item': item, 'isLast': isLast});
		
		// помечаем новый источник данных как "грязный" ?
//		this.dirty();
		
		return item;
	},	
	
	size: function() {
		return this.val().length;
	}
	
});


/**
 * @class
 * @name Dino.data.ObjectDataSource
 * @extends Dino.data.DataSource
 * @param {Object} src
 * @param {Object} id
 * @param {Object} options
 */
Dino.declare('Dino.data.ObjectDataSource', 'Dino.data.DataSource', /** @lends Dino.data.ObjectDataSource.prototype */{
	
	initialize: function(src, id, options) {
		this.source = {};
		Dino.data.ObjectDataSource.superclass.initialize.apply(this, arguments);
	},
	
	del: function(i){
	
		if(arguments.length == 0) {
			
			if(this.source) this.source.del(this.id);
			
			return;
		}
	
	
		var item = this.items[i];	
	
		// удаляем элемент из кэша, если он есть
		if(i in this.items){
			item.destroy();
			delete this.items[i];
		}
		
		var obj = this.val();
		delete obj[i];
		
		this.events.fire('onItemDeleted', {'index': i, 'item': item});
		
		// помечаем источник данных как "грязный"
//		this.dirty();
	}
	
	
});














/**
 * @name Dino.widgets
 * @namespace
 */



/**
 * Базовый объект для всех виджетов
 * 
 * @class
 * @extends Dino.events.Observer
 * @param {Object} o параметры
 */
Dino.Widget = Dino.declare('Dino.Widget', 'Dino.events.Observer', /** @lends Dino.Widget.prototype */{
	
	/**
	 * @static
	 * @private
	 */
	defaultOptions: {
		layout: 'plain',
		states: {
			'hidden': 'hidden',
			'visible': ['', 'hidden']
		},
		defaults: {},
		extensions: [],
		binding: 'auto'
	},
	
	
	customOptions: {
	},

			
	initialize: function() {
		
		profiler.start('widget');
		
		Dino.Widget.superclass.initialize.apply(this, arguments);
		
		var html = arguments[0];
		var opts = arguments[1];
		
		// new Dino.Widget('<div/>') или new Dino.Widget({...})
		if(arguments.length == 1){ 
			if(Dino.isString(arguments[0])){
				html = arguments[0];
				opts = undefined;
			}
			else{
				html = undefined;
				opts = arguments[0];
			}
		}
		
		var self = this;

		profiler.tick('widget', 'precreate');		
		
		/** 
		 * Параметры
		 * @type Object
		 */
		this.options = {};
		// определяем параметры как смесь пользовательских параметров и параметров по умолчанию
		// TODO эту часть можно делать только один раз при создании класса
		var o = this.options;
		
		if(!this.constructor.NO_REBUILD_SKELETON) {
			var prevDefaultOptions = null;
			Dino.hierarchy(this.constructor, function(clazz){
				if(clazz.defaultOptions == prevDefaultOptions) return;
				// следуюющие две строчки реализуют синонимизацию defaultOptions и skeleton
				if('defaultOptions' in clazz) Dino.utils.overrideOpts(o, clazz.defaultOptions);
				if('skeleton' in clazz) Dino.utils.overrideOpts(o, clazz.skeleton);
				prevDefaultOptions = clazz.defaultOptions; 
			});
			this.constructor.NO_REBUILD_SKELETON = true;
			this.constructor.prototype.defaultOptions = Dino.deep_copy(o);
			
//			console.log('rebuild_skeleton');
		}
		else {
			this.options = o = Dino.deep_copy(this.defaultOptions);
		}
		
		profiler.tick('widget', 'hierarchy');		
		
		Dino.utils.overrideOpts(o, opts);

		profiler.tick('widget', 'overrideOpts');		
		
		html = o.wrapEl || o.html || html; // оставляем возможность указать html через options
		
		// создаем новый элемент DOM или используем уже существующий
		/** 
		 * Элемент 
		 * @type Element
		 */
		this.el = $(html || this.$html());//('wrapEl' in o) ? o.wrapEl : $(this.$html());
		this.el.data('dino-widget', this);
		if(this.defaultCls) this.el.addClass(this.defaultCls);

		profiler.tick('widget', 'el');		
		
		/** 
		 * Коллекция дочерних компонентов 
		 * @type Dino.WidgetCollectionManager
		 */
		this.children = new Dino.WidgetCollectionManager(this);
		
		/** 
		 * Набор состояний
		 * @type Dino.StateManager
		 */
		this.states = new Dino.StateManager(this);
		
		this.handlers = {};

		profiler.tick('widget', 'create');		
		
		// инициализируем компоновку
		var layoutOpts = o.layout;
		if( Dino.isString(layoutOpts) )
			layoutOpts = {dtype: layoutOpts+'-layout'};
		if(!(layoutOpts instanceof Dino.Layout))
			layoutOpts = Dino.object( layoutOpts );
		/** 
		 * Компоновка 
		 * @type Dino.Layout
		 */
		this.layout = layoutOpts;
		//FIXME костыль
//		if(!this.layout.container) this.layout.attach(this);
		this.layout.attach(this.layout.options.container || this);


		profiler.tick('widget', 'layout');		


		// конструируем виджет
		this.$init(o);//this, arguments);
		
		profiler.tick('widget', 'init');		

		// устанавливаем опциональные параметры
		this.$opt(o);
		
		profiler.tick('widget', 'opt');
		
		// добавляем обработку событий (deprecated)
		this.$events(this);
		// добавляем элемент в документ
		this.$render(o.renderTo);
		
		// сначала подключаем данные, чтобы при конструировании виджета эти данные были доступны
		this.$bind(o.data);		
		
		// обновляем виджет, если к нему были подключены данные
		if(this.data) this.$dataChanged();
		// выполняем темизацию ?
//		this._theme(o.theme);
//		//
		this.$afterBuild();
		
		this.events.fire('onCreated');
		
		if(this.options.debug)	console.log('created');		
		
		
		profiler.tick('widget', 'build');		


		profiler.stop('widget');

	},
	
	
	/**
	 * Хук, вызываемый для инициализации виджета.
	 * 
	 * Чаще всего используется для модификации параметров.
	 * 
	 * @private
	 */
	$init: function() {
		
		var o = this.options;
		
		// "сахарное" определение контента виджета
		if('content' in o){
			Dino.utils.overrideOpts(o, {
				components: {
					content: o.content
				}
			})
//			this.addComponent('content', o.content);
		}
		
		if('extensions' in o) {
			for(i in o.extensions) {
				var ext = o.extensions[i];
				if(Dino.isFunction(ext)) ext.call(this, o);
				else if(Dino.isPlainObject(ext)) Dino.override_r(this, ext);
			}
		}
				
	},
	
//	_theme: function() {
//		if(this.options.ui == 'jquery_ui') this._theme_jquery_ui
//	}
	
	destroy: function() {
		
		// удаляем элемент и все его содержимое (data + event handlers) из документа
		if(this.el) this.el.remove();
		// очищаем регистрацию обработчиков событий
		this.events.unreg_all();
		//
		this.layout.clear();		
		
		// вызываем метод destroy для всех дочерних компонентов
		this.children.each(function(child) { child.destroy(); });
		
		
//		if(this.options.debug)	console.log('destroyed');
	},
	
	/**
	 * Хук, вызываемый для определения тэга, на основе которого будет построен виджет
	 * 
	 * @private
	 */
	$html: function() {
		return '';//'<div/>';
	},
	
	/**
	 * Хук, вызываемый при добавлении виджета на страницу
	 * 
	 * @param {Element|Dino.Widget} target
	 * @private
	 */
	$render: function(target) {
		if(target){
			if(target instanceof Dino.Widget) {
				target.addComponent('content', this);
			}
			else {
				$(target).append(this.el);
			}
			
//			var parentEl = (target instanceof Dino.Widget) ? target.el : $(target);
//			parentEl.append(this.el);
			
			if(this.el.parents().is('body')){
				this.$afterRender();
				this.$layoutChanged();
			}
			
		}
	},
	
	_theme: function(name) {
	},
	
	/**
	 * Хук, вызываемый после построения объекта
	 * 
	 * @private
	 */
	$afterBuild: function() {
		
		var o = this.options;
		var self = this;
		
		// устанавливаем состояния по умолчанию
		if('state' in o) {
			var a = o.state.split(' ');
			Dino.each(a, function(state) { self.states.set(state); });
		}
		
	},

	/**
	 * Хук, вызываемый при обновлении компоновки
	 * 
	 * @private
	 */
	$layoutChanged: function() {
		if(this.layout.options.updateMode == 'auto') this.layout.update();
		this.children.each(function(c) { c.$layoutChanged(); });
	},
	
	$events: function(self){
	},
	
	/**
	 * Хук, вызываемый после отрисовки виджета
	 * 
	 * @private
	 */
	$afterRender: function() {
		this.children.each(function(c) { c.$afterRender(); });
	},

	/**
	 * Установка параметров (options) виджета.
	 * 
	 * Передаваемые параметры применяются и сохраняются в this.options
	 * 
	 * @param {Object} o параметры
	 */
	opt: function(o) {
		var opts = o;
		if(arguments.length == 2){
			opts = {}
			opts[arguments[0]] = arguments[1];
		}
		else if(Dino.isString(o)){
			return this.options[o];
		}
		
		Dino.utils.overrideOpts(this.options, opts);

		this.$opt(opts);
		
		return this.options;
	},
	
	
	/**
	 * Хук, вызываемый для установки параметров.
	 * 
	 * Передаваемые параметры только применяются
	 * 
	 * @private
	 * @param {Object} o параметры
	 */
	$opt: function(o) {
		
		var self = this;
		var el = this.el;
		
		profiler.start('opt');
		
		if('width' in o) el.width(o.width);
		if('height' in o) {
			if(o.height == 'auto' || o.height == 'ignore'){ 
				el.attr('autoheight', o.height);
			}
			else {
				el.removeAttr('autoheight');
				el.height(o.height);
			}
		}
//		if('autoHeight' in o) el.attr('autoheight', o.autoHeight);
		if('x' in o) el.css('left', o.x);
		if('y' in o) el.css('top', o.y);
		if('tooltip' in o) el.attr('title', o.tooltip);
		if('id' in o) el.attr('id', this.id = o.id);
		if('tag' in o) this.tag = o.tag;
		if('style' in o) el.css(o.style);
		if('cls' in o) el.addClass(o.cls);// Dino.each(o.cls.split(' '), function(cls) {el.addClass(cls);});
		if('baseCls' in o) el.addClass(o.baseCls);
		
		profiler.tick('opt', 'style');		
		
		if('innerText' in o) el.text(o.innerText);
		if('innerHtml' in o) el.html(o.innerHtml);
		if('role' in o) el.attr('role', o.role);
		if('opacity' in o){
			if($.support.opacity) 
				el.css('opacity', o.opacity);
			else {
				el.css('filter', 'Alpha(opacity:' + (o.opacity*100.0) + ')');
				el.css('-ms-filter', 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (o.opacity*100.0).toFixed() + ')');				
			}
		}

		profiler.tick('opt', 'ifs');
		
		if('events' in o){
			for(var i in o.events){
				var callback = o.events[i];
//				// Dino события или jQuery события?
//				if(regexp.test(i)){
//					// Dino-события могут быть массивом
//					if( Dino.isArray(callback) ){
//						Dino.each(callback, function(fn){
//							self.events.reg(i, fn);
//						});
//					}
//					else {	
//						this.events.reg(i, callback);
//					}
//				}
//				else{
				el.bind(i, callback.rcurry(self));
//				}
			}
		}
		
		
		if('states' in o){
			// настраиваем особое поведение состояния hover
			if('hover' in o.states){
				this.el.hover(function(){ self.states.set('hover') }, function(){ self.states.clear('hover') });
			}
		}
		
		var regexp = /^on\S/;
		for(var i in o){
			if(regexp.test(i)){
				var chain = ( !Dino.isArray(o[i]) ) ? [o[i]] : o[i];
				for(var j = 0; j < chain.length; j++)
					this.events.reg(i, chain[j]);
			}
		}

		if('components' in o) {
			var arr = [];
			// преобразуем набор компонентов в массив
			for(var i in o.components){
				var c = o.components[i];
				c._cweight = ('weight' in c) ? c.weight : 9999;
				c._cname = i;
				arr.push(c);
			}
			// сортируем массив по весу компонентов
			arr.sort(function(c1, c2){
				var a = c1._cweight;
				var b = c2._cweight;
				if(a < b) return -1;
				else if(a > b) return 1;
				return 0;
			});
			// добавляем компоненты
			Dino.each(arr, function(c){
				self.addComponent(c._cname, c);				
				delete c._cweight;
				delete c._cname;
			});
			
			// задаем "ленивые" классы компонентов
			for(var i in o.components){
				var easyCls = ''+i+'Cls';
				if(easyCls in o) this[i].opt('cls', o[easyCls]);
			}
			
		}
		
		
		
//		if('draggable' in o){
//			this._toggle_handler('draggable_mousedown', 'mousedown', o.draggable);
//			this._toggle_handler('draggable_mousemove', 'mousemove', o.draggable);
//		}
		
		if('contextMenu' in o) {
			
			var cm = o.contextMenu;
			
			if(Dino.isFunction(cm)) cm = cm.call(this);
			if(cm && !(cm instanceof Dino.Widget)) cm = Dino.widget(cm);
			
			if(cm) {
			
				this.contextMenu = cm;
	
			
			}
		}

		
		
		if('format' in o) {
			if(Dino.isString(o.format)) this.options.format = Dino.format_obj.curry(o.format);
		}

		if('validator' in o) {
			if(Dino.isArray(o.validator)) this.options.validator = Dino.filter_list.rcurry(o.validator);
		}
						
		
		//TODO экспериментальная опция
		if('overrides' in o) {
			Dino.override(this, o.overrides);
		}
		
		
		//TODO экспериментальная опция
		for(i in o) {
			if(i in this.customOptions) this.customOptions[i].call(this, o[i]);
		}


		profiler.tick('opt', 'other');

		profiler.stop('opt');
		
	},
	
	
	
	/**
	 * Рекурсивный обход всех компонентов виджета
	 * 
	 * @param {Object} callback метод, вызываемый для каждого компонента
	 */
	walk: function(callback) {
		callback.call(this);
		this.children.each(function(item){
			item.walk(callback);
		});
	},	
	
	//-------------------------------------------
	// Методы для работы с компонентами виджета
	//-------------------------------------------
	
	/**
	 * Добавление компонента
	 * 
	 * Ключ должен соотвествовать требованиям для свойств объектов JavaScript и не должен пересекаться с именами
	 * методов/свойств виджета.
	 * 
	 * @param {String} key ключ (имя) компонента. Если компонент с таким именем уже существует, то он будет удален из компоновки
	 * @param {Object|Dino.Widget} o виджет или параметры виджета
	 */
	addComponent: function(key, o){
		// если компонент уже существует, то удаляем его
		this.removeComponent(key);
		
		// если у виджета определен базовый класс, до его компоненты будут иметь класс-декоратор [baseCls]-[имяКомпонента]
		if('baseCls' in this.options)
			Dino.utils.overrideOpts(o, {cls: this.options.baseCls+'-'+key});
		
		this[key] = (o instanceof Dino.Widget) ? o : Dino.widget(o);
		this.children.add( this[key] );
		
		// В компоновку добавляем элемент только в том случае, если цель рендеринга не определена
		if(!('renderTo' in o))
			this.layout.insert(this[key]);
		
//		this.el.append(this[key].el);
		return this[key];
	},
	
	/**
	 * Удаление компонента
	 * 
	 * @param {Object} key ключ (имя) компонента
	 */
	removeComponent: function(key) {
		var c = this[key];
		if(c) {
			this.layout.remove(c);
			this.children.remove(c);
			delete this[key];
		}
		return c;
	},
	
	
	
	/**
	 * Получение списка всех родителей виджета.
	 * 
	 * Еще здесь применим термин "путь" для деревьев.
	 * 
	 * @returns {Array} список родительских виджетов
	 */
	getParents: function(list) {
		if(arguments.length == 0) list = [];
		if(!this.parent) return list;
		list.push(this.parent);
		return this.parent.getParents(list);
	},
	
	/**
	 * Получение родительского виджета
	 * 
	 * Если критерий не указан, то возвращается непосредственный родитель
	 * 
	 * @example
	 * a.getParent();
	 * b.getParent({'data': dataItem});
	 * c.getParent(Dino.widgets.Box);
	 * d.getParent(function(w) { return w.options.width < 100; });
	 * e.getParent('header');
	 * 
	 * @param {Any} [criteria] критерий 
	 */
	getParent: function(i) {
		
		if(arguments.length == 0) return this.parent;
		
		var parents = this.getParents();
		
		return Dino.find(parents, Dino.utils.create_widget_filter(i));
	},
	
	//---------------------------------------------
	// Методы работы с подсоединенными данными
	//---------------------------------------------
	
//	isBound: function() {
//		return (this.data != null);
//	},
	
	
	/**
	 * Подключение данных к виджету
	 * 
	 * @param {Dino.data.DataSource|Any} data данные
	 * @param {Integer} phase
	 */
	$bind: function(data, phase) {
				
		var o = this.options;
		
		// если данные не определены или биндинг выключен, то биндинг не выполняем
		if(data == undefined || !o.binding) return;
		
		if(this.data)
			this.data.events.unreg(this);
		
		// если фаза автобиндинга не определена, то присваем ей начальное значение
		if(!phase) phase = 1;
		
		this.dataPhase = phase;
		
//		if(this.data) data.destroy(); //<-- экспериментальный код
		
		// если определен параметр dataId, то источником данных будет дочерний элемент, если нет - то сам источник данных 
		if('dataId' in o){
			this.data = (data instanceof Dino.data.DataSource) ? data.item(o.dataId) : new Dino.data.DataSource(data, o.dataId);
		}
		else {
			this.data = (data instanceof Dino.data.DataSource) ? data : new Dino.data.DataSource(data);
		}

		
		
//		if('defaultValue' in o){
//			if(this.data.get() == null) this.data.set(o.defaultValue);
//		}
		var self = this;
	
		// если установлен параметр updateOnValueChange, то при изменении связанных данных, будет вызван метод $dataChanged
		this.data.events.reg('onValueChanged', function() { 
			if(self.options.updateOnValueChange) self.$dataChanged();
//			console.log(self.data.val());
//			// связываем данные с дочерними компонентами виджета
//			self.children.each(function(child){
//				if(child.dataPhase != 1) child.$bind(self.data, 2);
//			});
		}, this);
		
		//FIXME пока непонятный механизм для обработки события onDirty
//		if('onDirty' in this.options){
//			this.data.events.reg('onDirty', function(e){
//				self.events.fire('onDirty', e);
//			}, this);
//		}
//		if('onClean' in this.options){
//			this.data.events.reg('onClean', function(e){
//				self.events.fire('onClean', e);
//			}, this);
//		}
	
		// связываем данные с дочерними компонентами виджета
		this.children.each(function(child){
			if(child.dataPhase != 1) child.$bind(self.data, 2);
		});
	},
	
	
	/**
	 * Получение значения, связанного с виджетом.
	 * 
	 * Если задана функция форматирования (format), то она используется для преобразования результата
	 * 
	 * @returns {Any} undefined, если к виджету данные не подключены
	 */
	getValue: function() {
		var val;
		var o = this.options;
		if(this.data){
			val = this.data.get();
			// если присутствует функция форматирования, то используем ее
			if(this.options.format)
				val = o.format.call(this, val);
		}
		return val;
	},
	
	/**
	 * Установка значения, связанного с виджетом
	 * 
	 * Если задана функция хранения (store_format), то она используется для преобразования значения
	 * 
	 * @param {Any} val значение
	 */
	setValue: function(val, reason) {
		if(this.data){
			if('store_format' in this.options) 
				val = this.options.store_format.call(this, val);
			
			var valid = true;
			var context = {};				
			if('validator' in this.options) {				
				valid = this.options.validator.call(context, val);
/*				
				var self = this;
				var validator = this.options.validator;
				
				if(Dino.isFunction(validator))
					valid = validator.call(this, val, results);
				else if(Dino.isArray(validator)) 
					valid = Dino.find(validator, function(v){ return v.call(self, val, results); })
*/					
			}
				 
			
			if(valid) {
				this.data.set(val);
				this.events.fire('onValueChanged', {'value': val, 'reason': reason});				
			}
			else {
				context.value = val;
				this.events.fire('onValueInvalid', context);
			}
		}
	},
	
	/**
	 * Получение значения, связанного с виджетом без применения форматирования.
	 * 
	 * @returns {Any} undefined, если к виджету данные не подключены
	 */
	getRawValue: function() {
		return (this.data) ? this.data.get() : undefined;
	},
	
	
	
	
/*	
	getFormattedValue: function() {
		var val = this.getValue();
		return (this.options.format) ? this.options.format.call(this, val) : val;
	},
*/	
	
	
//	_dataBound: function(){},
//	_dataUnbound: function() {},

	/**
	 * Хук, вызываемый при изменении связанных данных
	 * 
	 * @private
	 */
	$dataChanged: function() {
//		// если автобиндинг выключен, то прекращаем обновление
//		if(!this.options.autoBinding) return;
//		if(this.suppressDataChange) return;
		
		var binding = this.options.binding;
		
		if(Dino.isFunction(binding)){
//			var o = {};
			var val = this.getValue();
//			if(val !== undefined)	
			if( binding.call(this, val) === false) return;
//			this.opt(o);
		}
/*		
		if(binding.options){
			var o = {};
			binding.options.call(this, o);
			this.opt(o);
		}
		if(binding.states)
			binding.states.call(this, this.states);
*/		
		
//		if(this.options.optBinding) {
//			var o = {};
//			this.options.optBinding.call(this, o);
//			this.opt(o);
//		}
				
//		if(this.options.stateBinding){
//			this.states.set( this.getStateValue() );
//		}
		
		this.children.each(function(child) { child.$dataChanged(); });	
		
//		this.events.fire('onDataChanged');
	}
	
});



Dino.widget = function(){
	if(arguments.length == 1) return Dino.object(arguments[0]);
	return Dino.object( Dino.utils.overrideOpts.apply(this, arguments) ); //FIXME непонятно зачем вызов через apply
};





//------------------------------
// Интегрируемся в jQuery
//------------------------------

$.dino = Dino.widget;

$.fn.dino = function(o) {
	if(this.length > 0){
		var widget = this.data('dino-widget');
		if(widget) return widget;
		if(!o) return undefined;
		o.wrapEl = this;
	}
	else if(arguments.length == 0) return null;
	return Dino.widget(o);
};







/*
 * Далее идет не вполне изящный механизм примешивания предопределенных состояний к классу Dino.Widget
 * 
 * 
 */


var abilityHandlers = {
	'clickable.click': function(e) {
			$(this).dino().events.fire('onClick', {}, e);		
	},
	'clickable.dblclick': function(e) {
			$(this).dino().events.fire('onDblClick', {}, e);		
	},
	'nonselectable.mousedown': function(e) {
		e.preventDefault();
	},
	'editable.dblclick': function(e) {
		var w = $(this).dino();
		if('startEdit' in w) w.startEdit();		
	}
}


Dino.override(Dino.Widget.prototype.defaultOptions.states, {
	'clickable': function(sw) {
		if(sw) {
			this.el.bind('click', abilityHandlers['clickable.click']);		
			this.el.bind('dblclick', abilityHandlers['clickable.dblclick']);					
		}
		else {
			this.el.unbind('click', abilityHandlers['clickable.click']);		
			this.el.unbind('dblclick', abilityHandlers['clickable.dblclick']);					
		}
	},
	'editable': function(enabled) {
		if(enabled) this.el.bind('dblclick', abilityHandlers['editable.dblclick']);
		else this.el.unbind('dblclick', abilityHandlers['editable.dblclick']);
	},
	'nonselectable': function(enabled) {
		if(enabled) this.el.bind('mousedown', abilityHandlers['nonselectable.mousedown']);
		else this.el.unbind('mousedown', abilityHandlers['nonselectable.mousedown']);		
	}
});








/*
 * Тоже не очень изящная (но работающая) реализация простейшего Drag'n'Drop
 * 
 * 
 */


$(document).ready(function(){
	
//	var drag = null;
	
	
	//TODO возможно этот код стоит перенести в другое место
//	if(!Dino.contextMenuReady){
		$(document).bind('contextmenu', function(e){
			var w = $(e.target).dino();
			if(!w || !w.contextMenu) {
				w = undefined;
				$(e.target).parents().each(function(i, el){
					var parent = $(el).dino();
					if(parent && parent.contextMenu){
						w = parent;
						return false;
					}
				});
			}
			
//			if(w){
//				var w = (w.contextMenu) ? w : w.getParent(function(item){ return item.contextMenu; });
				if(w){
					var cancel_event = new Dino.events.CancelEvent({'contextMenu': w.contextMenu});
					w.events.fire('onContextMenu', cancel_event);
					if(!cancel_event.isCanceled){
						w.contextMenu.sourceWidget = w;
						w.contextMenu.show(e.pageX, e.pageY);
					}
					e.preventDefault();
				}
//			}
		});
//		Dino.contextMenuReady = true;
//	}
	
	
		
});


/**
 * @name Dino.layouts
 * @namespace
 */


/**
 * @class
 * @name Dino.Layout
 * @param {Object} opts
 */
Dino.declare('Dino.Layout', Dino.BaseObject, /** @lends Dino.Layout.prototype */ {
	
	defaultOptions: {
		updateMode: 'auto'	
	},
	
	initialize: function(opts){
		Dino.Layout.superclass.initialize.call(this);
		
		var o = this.options = {}
		Dino.hierarchy(this.constructor, function(clazz){
			if('defaultOptions' in clazz) Dino.utils.overrideOpts(o, clazz.defaultOptions);
		});
		Dino.utils.overrideOpts(o, this.defaultOptions, opts);
//		this.options = Dino.utils.overrideOpts({}, this.defaultOptions, o);
		
//		this.attach(this.options.container);
		
	},
	
	/**
	 * ассоциация компоновки с виджетом
	 * @param {Object} c виджет
	 */
	attach: function(c) { 
		
		var o = this.options;
		
		this.container = c;
				
		if('name' in o) this.container.el.attr('layout', o.name);

		this.el = this.container.el;
		
		if(o.html){
			var html = $(o.html);
			this.el = (o.htmlSelector) ? $(o.htmlSelector, html) : html;
			this.container.el.append(html);
		}
		
	},
	
	/**
	 * удаление ассоциации компоновки с виджетом
	 */
	detach: function() { 
//		if('containerCls' in this.options) this.container.el.removeClass(this.options.containerCls);
		if('name' in this.options) this.container.el.attr('layout', undefined);
		delete this.container; 
	},
	
//	auto_height: function(enable) {
//		this.options.autoHeight = enable;
//		(enable) ? this.el.attr('autoheight', 'true') : this.el.removeAttr('autoheight');
//	},
	
//	add: function(item) {},
	/**
	 * добавление нового элемента-виджета в компоновку
	 * 
	 * @param {Object} item виджет
	 * @param {Object} i (Optional) ключ
	 */
	insert: function(item, i) {},
	
	/**
	 * удаление элемента-виджета из компоновки
	 * @param {Object} item
	 */
	remove: function(item) {},
	
	/**
	 * обновление компоновки (позиции, размеров элементов)
	 */
	update: function() {},
	
	/**
	 * обновление компоновки (порядка, количества элементов)
	 */
	rebuild: function() {},
	
	/**
	 * очистка компоновки от всех элементов (уничтожения дочерних элементов не происходит)
	 */
	clear: function() {}
});




/**
 * @name Dino.containers
 * @namespace
 */


/**
 * Базовый класс для контейнеров.
 * 
 * @class
 * @name Dino.Container
 * @extends Dino.Widget
 * @param {Object} o параметры
 * 
 */
Dino.declare('Dino.Container', 'Dino.Widget', /** @lends Dino.Container.prototype */ {
	
	
	defaultOptions: {
		itemFactory: function(o) {
			return Dino.widget(o); 
		}
	},
	
	$init: function(o) {
		Dino.Container.superclass.$init.apply(this);
		
		var o = this.options;
		
//		this.layout = new Dino.layouts.PlainLayout();
//		this.layout.container = this;
		
//		if('itemFactory' in o) this.itemFactory = o.itemFactory;
		
		
//		// инициализируем метод фабрики объектов
//		this.itemFactory = function(o){
//			return {'widget': Dino.widget(o)};
//		};
		
		/**
		 * Элементы
		 * @type {Array}
		 */
		this.items = [];
//		this.selection = new Dino.SelectionManager();
		
//		this.items = new Dino.utils.ContainerItemManager(this, o.itemFactory);
				
	},	

	$opt: function(o) {
		Dino.Container.superclass.$opt.call(this, o);
		
		if('itemFactory' in o)
			this.itemFactory = o.itemFactory;
		
		if('items' in o){
			for(var i = 0; i < o.items.length; i++)
				this.addItem(o.items[i]);
		}
		
	},

	
//	$afterRender: function() {
//		Dino.Container.superclass.$afterRender.apply(this);
//	},

	//FIXME по идее этот мето должен быть в Dino.Widget
//	$dataChanged: function() {
//		this.children.each(function(item) { item.$dataChanged(); });
//	},
	
	
	/**
	 * Получить элемент контейнера 
	 * 
	 * @param {Object} criteria критерий
	 * @returns {Dino.Widget} элемент контейнера или undefined
	 */
	getItem: function(i){
		return Dino.find(this.items, Dino.utils.create_widget_filter(i));	
	},
	
	/**
	 * Добавить элемент контейнера
	 * 
	 * @param {Object|Dino.Widget} item виджет или параметры виджета
	 * @param {Integer} index индекс, с которым будет добавлен новый элемент
	 * @returns {Dino.Widget} добавленный элемент
	 */
	addItem: function(item, index) {
//		Dino.Container.superclass.addChild.call(this, item);
		
		var itemOpts = item;
		
		// если новый элемент является набором параметров, то строим виджет
		if( Dino.isPlainObject(item) ) item = this.itemFactory( Dino.utils.overrideOpts({}, this.options.defaultItem, item) );
		
		
		if(index == undefined){
			this.items.push( item );
			
			item.index = this.items.length - 1;
			
			this.children.add(item);
			this.layout.insert(item);
		}
		else {
			this.items.splice( index, 0, item );
			
			item.index = index;
			for(var i = index; i < this.items.length; i++) this.items[i].index = i;
			
			this.children.add(item, index);
			this.layout.insert(item, index);
		}
		
		if('show' in item) item.show();
		
		this.events.fire('onItemAdded', {'item': item});
		
		return item;
	},
/*	
	insertItem: function(item, index) {
		
		var itemOpts = item;
		
		// если новый элемент является набором параметров, то строим виджет
		if( Dino.isPlainObject(item) ) item = this.itemFactory( Dino.utils.overrideOpts({}, this.options.defaultItem, item) );

		this.items.splice( index, 0, item );
		item.index = index;
		for(var i = index; i < this.items.length; i++) this.items[i].index = i;
		
		this.children.add(item, index);
		this.layout.insert(item, index);
		
		if('show' in item) item.show();
		
		this.events.fire('onItemAdded', {'item': item});
		
		return item;
	},
*/	


	/**
	 * Удалить элемент.
	 * 
	 * @param {Object} item удаляемый элемент
	 * @returns {Dino.Widget} удаленный элемент
	 */
	removeItem: function(item) {
		
		Dino.remove_from_array(this.items, item);

		var index = item.index;
		
		this.children.remove(item);
		this.layout.remove(item);
		
		for(var i = index; i < this.items.length; i++) this.items[i].index = i;
		
		
		return item;
	},
	
	/**
	 * Уничтожить элемент.
	 * 
	 * После удаления элементы вызывается метод {@link Dino.BaseObject#destroy }
	 * 
	 * @param {Object} item
	 */
	destroyItem: function(item) {
		this.removeItem(item).destroy();
	},
	
	/**
	 * Удаление всех элементов контейнера
	 */
	removeAllItems: function() {
		while(this.items.length > 0)
			this.removeItem(this.items[0]);

//		this.children.removeAll();
//		this.layout.clear(); //FIXME эта очистка вызывала ошибки
	},
	
	/**
	 * Уничтожение всех элементов контейнера
	 */
	destroyAllItems: function() {
//		// очищаем компоновку
//		this.layout.clear(); //FIXME эта очистка вызывала ошибки
//		// уничтожаем элементы
//		this.children.each(function(item){ item.destroy(); });
//		// очищаем список дочерних элементов
//		this.children.removeAll();
		while(this.items.length > 0)
			this.removeItem(this.items[0]).destroy();
		
//		var self = this;
//		Dino.each(this.items, function(item){ self.removeItem(item); item.destroy(); });
	},
	
	/**
	 * Замена элемента
	 * 
	 * @param {Any} criteria критерий
	 * @param {Object|Dino.Widget} newItem 
	 */
	replaceItem: function(criteria, newItem) {
		var item = this.children.get(criteria);
		if(item != null) this.removeItem(item);
		this.addItem(newItem);
	},
	
	/**
	 * Последовательный обход всех элементов.
	 * 
	 * @param {Function} callback 
	 */
	eachItem: function(callback) {
		for(var i = 0; i < this.items.length; i++)
			if( callback.call(this, this.items[i], i) === false ) return false;
	},
/*	
	setSelectedItem: function(item) {
		this.eachItem(function(it){ it.states.clear('selected'); });
		item.states.set('selected');
		this._selected_item = item;
	},
	
	getSelectedItem: function() {
		return this._selected_item;
	},
*/
	
	$bind: function(data, phase) {
		
		if(!this.options.dynamic) {
			Dino.Container.superclass.$bind.apply(this, arguments);
			return;
		}
		
		
		if(data == undefined) return;
		
		
		if(this.data)
			this.data.events.unreg(this);
		
		var o = this.options;
		
		if(!phase) phase = 1;
		
		this.dataPhase = phase;
		
		
		if('dataId' in o)
			this.data = (data instanceof Dino.data.DataSource) ? data.item(o.dataId) : new Dino.data.ArrayDataSource(data, o.dataId);
		else
			this.data = (data instanceof Dino.data.DataSource) ? data : new Dino.data.ArrayDataSource(data);
		
		
		
		var self = this;
		
		// если добавлен новый элемент данных, то добавляем новый виджет
		this.data.events.reg('onItemAdded', function(e){
			self.addItem({'data': e.item}, e.isLast ? null : e.index);
		}, this);
		
		// если элемент данных удален, то удаляем соответствующий виджет
		this.data.events.reg('onItemDeleted', function(e){
			self.destroyItem( self.getItem({data: e.item}) );//e.index) );// {data: self.data.item(e.index)});
		}, this);
		
		// если элемент данных изменен, то создаем новую привязку к данным
		this.data.events.reg('onItemChanged', function(e){
			self.getItem( e.item.id ).$bind(self.data.item(e.item.id), 2);
//			self.getItem( e.item.id ).$dataChanged(); //<-- при изменении элемента обновляется только элемент
		}, this);

		// если изменилось само значение массива, то уничожаем все элементы-виджеты и создаем их заново
		this.data.events.reg('onValueChanged', function(e){
			
			self.layout.immediateRebuild = false;
			
			// уничтожаем все элементы-виджеты
			self.destroyAllItems();

			self.data.each(function(dataItem, i){
				var dataItem = self.data.item(i);
				var item = self.addItem({ 'data': dataItem });//.$bind(dataItem, 2);
				item.dataPhase = 2;
//				item.index = i; // костыль для 
			});

			self.layout.immediateRebuild = true;
			self.layout.rebuild();
			
		}, this);
		

		this.layout.immediateRebuild = false;
		
		this.destroyAllItems();
		
		this.data.each(function(dataItem, i){
			var dataItem = self.data.item(i);
			self.addItem({ 'data': dataItem }).dataPhase = 2;//.$bind(dataItem, 2);
		});
		
		this.layout.immediateRebuild = true;
		this.layout.rebuild();
		
		
//		this.events.fire('onDataBound');
		
		
		
//		console.log('update on data set');
		
//		// всем предопределенным виджетам подсоединяем источники данных
//		this.eachItem(function(item, i){
//			item.$bind( self.data.item(i) )
//		});
//		this.children.each(function(child){
//			if(child.dataPhase != 1) child.$bind(self.data, 2);
//		});
	}/*,

	$dataChanged: function() {
		
		if(!this.options.dynamic) {
			Dino.Container.superclass.$dataChanged.call(this);
			return;	
		}
		
		var self = this;
		this.data.each(function(val, i){
			var dataItem = self.data.item(i);
			var widgetItem = null;
			self.eachItem(function(item) {
				if(item.options.data)
			});
			if(!self.getItem({'data': dataItem}))
				self.addItem({ 'data': dataItem });
		});
	}
*/	
	
}, 'container');






Dino.utils = (function(){
	var U = {};
	
	U.create_widget_filter = function(i) {
		
		var f = null;
		
		if( Dino.isNumber(i) ) f = Dino.filters.by_index.curry(i);//return this.widgets[i]; // упрощаем
		else if( Dino.isString(i) ) f = Dino.filters.by_props.curry({'tag': i});
		else if( Dino.isFunction(i) && ('superclass' in i) ) f = Dino.filters.by_class.curry(i);
		else if( Dino.isFunction(i) ) f = i;
		else if( Dino.isPlainObject(i) ) f = Dino.filters.by_props.curry(i);
		
		return f;
	}
	
	
	
	
	
	return U;
})();




Dino.filters = (function(){
	
	var F = {};
	
	// "пустой" фильтр
	F.nop = function(){ return false };
	// по индексу
	F.by_index = function(index, child, i){ return index == i; };
	// по совпадению набора свойств
	F.by_props = function(props, child){
		for(var i in props)
			if(child[i] != props[i]) return false;
		return true; 
	};
	F.by_class = function(clazz, child){
		return (child instanceof clazz);
	}
		
	return F;
})();



Dino.bindings = (function(){
	
	var B = {};
	
	//Dino.bindings.opt('state').opt('opacity');
	
	
	B.opt = function(i, k) {
		return B.opt_chain(undefined, i, k);
	};
	
	B.opt_chain = function(chain, i, k) {
		var F = function(o){
			if(chain) chain(o);
			o[i] = this.data.get(k);
		};
		
		F.opt = B.opt_chain.curry(F);
		
		return F;
	};
	
	B.optState = function(val) { return {'state': val}; };
	
	return B;
})();


/*
Dino.formats = (function(){
	
	var F = {};
	
//	F.string_format = function(template) {
//		var regexp = /(%s)/g;
//		return;
//	}
	
	return F;
})();
*/





/**
 * 
 * @class
 * @extends Dino.BaseObject
 * @param {Dino.Widget} owner
 */
Dino.WidgetCollectionManager = Dino.declare('Dino.WidgetCollectionManager', 'Dino.BaseObject', /** @lends Dino.WidgetCollectionManager.prototype */{
	
	initialize: function(owner) {
		this.widgets = [];
		this.owner = owner;
	},
	
	
	
	add: function(item, i) {
		// добавляем дочерний виджет
		if(arguments.length == 2)
			this.widgets.splice(i, 0, item);
		else
			this.widgets.push(item);
			
		item.parent = this.owner;	
		
		// выполняем автобиндинг
		if(this.owner.data && !item.data)
			item.$bind(this.owner.data, 2);
		
		return item;
	},
	
	get: function(i) {
		return Dino.find(this.widgets, Dino.utils.create_widget_filter(i));	
	},

	get_all: function(i) {		
		return Dino.find_all(this.widgets, Dino.utils.create_widget_filter(i));	
	},
	
	remove: function(item) {
		var i = Dino.index_of(this.widgets, item);
		
		// если такого элемента среди дочерних нет, то возвращаем false
		if(i == -1) return false;
		
		delete this.widgets[i].parent;
		this.widgets.splice(i, 1);
		
		return true;
	},
	
	removeAll: function() {
		this.widgets = [];
	},
	
	each: function(callback) {
		for(var i = 0; i < this.widgets.length; i++){
			var result = callback.call(this.owner, this.widgets[i], i);
			if(result) return result;
		}
	},
	
	size: function() {
		return this.widgets.length;
	},
	
	empty: function(){
		return this.widgets.length == 0;
	}
	
	
	
});





Dino.utils.overrideProp = function(o, srcObj, i) {

	var shared_opts = {'data': null};

	var p = srcObj[i];
	
	if((i in shared_opts)){//Dino.in_array(ignore, i)){
		o[i] = p;
	}
	else if(i[i.length-1] == '!') {
		j = i.substr(0, i.length-1);
		if(j in o) i = j;
		o[i] = p;
	}
	else if(i[i.length-1] == '+') {
		i = i.substr(0, i.length-1);
		
		if( !Dino.isArray(o[i]) ) o[i] = [o[i]];
		p = o[i].concat(p);
		o[i] = p;
	}
	else{
		//TODO здесь создается полная копия (deep copy) объекта-контейнера
		if( Dino.isPlainObject(p) ){
			if(!(i in o) || !Dino.isPlainObject(o[i])) o[i] = {};
			Dino.utils.overrideOpts(o[i], p);
		}
		else if( Dino.isArray(p) ){
			if(!(i in o) || !Dino.isArray(o[i])) o[i] = [];
			Dino.utils.overrideOpts(o[i], p);
		}
		else {
			//TODO этот участок кода нужно исправить
			
			// если элемент в перегружаемом параметре существует, то он может быть обработан специфически
			if(i in o){
				// классы сливаются в одну строку, разделенную пробелом
				if(i == 'cls') p = o[i] + ' ' + p;
				if( /^on\S/.test(i) ) {
					if( !Dino.isArray(o[i]) ) o[i] = [o[i]];
					p = o[i].concat(p);
				}
				if(i == 'state') {
					p = o[i] + ' ' + p;
				}
			}
			o[i] = p;
		}
	}
	
}


Dino.utils.overrideOpts = function(o) {

	// обходим все аргументы, начиная со второго
	for(var j = 1; j < arguments.length; j++){
		
		var srcObj = arguments[j];
		
		if( Dino.isArray(srcObj) ){
			for(var i = 0; i < srcObj.length; i++)
				Dino.utils.overrideProp(o, srcObj, i);
		}
		else {			
			for(var i in srcObj)
				Dino.utils.overrideProp(o, srcObj, i);
		}		
	}
	
	return o;
}



Dino.utils.deep_override = function(o) {
	
	for(var j = 1; j < arguments.length; j++){
	
		var srcObj = arguments[j];
		
		Dino.each(srcObj, function(p, i){
			if( Dino.isPlainObject(p) ){
				if(!(i in o) || !Dino.isPlainObject(o[i])) o[i] = {};
				Dino.utils.deep_override(o[i], p);
			}
			else if( Dino.isArray(p) ){
				if(!(i in o) || !Dino.isArray(o[i])) o[i] = [];
				Dino.utils.deep_override(o[i], p);
			}
			else {
				o[i] = p;
			}
		});
	
	}
	
	return o;
}











/*
Dino.declare('Dino.events.StateEvent', 'Dino.events.Event', {

	initialize: function(method, args) {
		Dino.events.StateEvent.superclass.initialize.call(this, {'method': method, 'args': args});
	},
	
	translate: function(target, filter){
		if(arguments.length == 1 || Dino.in_array(filter, this.args[0]))
			target.states[this.method].apply(target.states, this.args);
	}
	
});
*/



/**
 * @class
 */
Dino.StateManager = Dino.declare('Dino.StateManager', 'Dino.BaseObject', /** @lends Dino.StateManager.prototype */ {
	
	initialize: function(widget) {
		this.widget = widget;
		this.current_states = {};
	},
	
	/**
	 * Активация состояния
	 * @param {String} name имя состояния
	 */
	set: function(name, change_class) {
		
		// получаем состояние, определенное для виджета
		var state = this.widget.options.states[name];
//		var state_off, state_on = null;
		if(state == null) state = name;//{ state_on = name; state_off = ''; }
//		else if(Dino.isString(state)) { state_on = state; state_off = ''; }
		else if(Dino.isArray(state)) { //{ state_on = state[0]; state_off = state[1]; }
			this.set(state[0]);
			this.clear(state[1]);
			this.current_states[name] = true;
			return this;
		}
		
//		if( Dino.isString(state) ) {
//			this.widget.el.addClass(state);
//			this.widget.el.removeClass(state_off);
//		}

		if(arguments.length == 1) change_class = true;
		
		if(Dino.isFunction(state)) {
			change_class &= (state.call(this.widget, true) !== false);
			state = name;
		}
		
		if(change_class)
			this.widget.el.addClass(state);
		
		this.current_states[name] = true;
		
		this.widget.events.fire('onStateChange', {'state': name, 'op': 'set'});
		this.widget.events.fire('onStateSet', {'state': name});
		
		return this;
	},
	
	/**
	 * Активация указанного состояния и отключение всех остальных состояний
	 * @param {String} name
	 */
	setOnly: function(name) {
		for(var i in this.current_states) this.clear(i);
		this.set(name);	
		
		return this;		
	},
	
	/**
	 * Дезактивация состояния
	 * @param {String} name имя состояния
	 */
	clear: function(name) {
		
		// получаем состояние, определенное для виджета
		var state = this.widget.options.states[name];
//		var state_off, state_on = null;
		if(state == null) state = name;//{ state_on = name; state_off = ''; }
//		else if(Dino.isString(state)) { state_on = state; state_off = ''; }
		else if(Dino.isArray(state)) {//{ state_on = state[0]; state_off = state[1]; }
			this.clear(state[0]);
			this.set(state[1]);
			delete this.current_states[name];
			return this;
		}
		
		var change_class = true;

//		if( Dino.isString(state) ) {
//			this.widget.el.removeClass(state);
////			this.widget.el.addClass(state_off);
//		}
		if(Dino.isFunction(state)) {
			change_class &= (state.call(this.widget, false) !== false);			
			state = name;
		}
		
		if(change_class)
			this.widget.el.removeClass(state);		
		
		delete this.current_states[name];
		
		this.widget.events.fire('onStateChange', {'state': name, 'op': 'clear'});		
		this.widget.events.fire('onStateClear', {'state': name});
		
		return this;		
	},
	
	/**
	 * Переключение состояния
	 * @param {String} name имя состояния
	 * @param {Boolean} sw опциональный флаг, явно указывающий на итоговое состояние (true - включить, false - выключить)
	 */
	toggle: function(name, sw) {
		
		if(sw == null) sw = !this.is(name);
		
		sw ? this.set(name) : this.clear(name);
		
		return sw;
	},
	
	
	/**
	 * Проверка состояния
	 * @param {String} name имя состояния
	 * @returns {Boolean} активно ли состояние
	 */
	is: function(name) {
		return (name in this.current_states);
	}
	
	
	
});




/*
Dino.declare('Dino.utils.WidgetStateManager', 'Dino.BaseObject', {
	
//	defaultOptions: {
//		multistate: true
//	},
	
	initialize: function(widget) {
		this.widget = widget;
//		this.options = Dino.utils.deep_override({}, this.defaultOptions, o);
		this.current_states = {};
//		this.multistate = true;
	},
	
	set_only: function(name) {
		for(var i in this.current_states) this.clear(i);
		this.set(name);
	},
	
	set: function(name) {
		
		// получаем класс или массив
		var cls = this.stateCls(name);
		// если состояние - массив, то второй элемент содержит классы, которые нужно убрать
		if(Dino.isArray(cls)){
			this.widget.el.removeClass(cls[1]);
			cls = cls[0];
		}
		// добавляем класс текущего состояния
		this.widget.el.addClass(cls);
		this.widget.events.fire('onStateChanged', new Dino.events.StateEvent('set', arguments));
		
		// запоминаем установленное состояние
		this.current_states[name] = true;
		
		return this;
	},
	
	clear: function(name){
		var cls = this.stateCls(name);
		
		if(Dino.isArray(cls)){
			this.widget.el.addClass(cls[1]);
			cls = cls[0];
		}
		
		this.widget.el.removeClass( cls );
		this.widget.events.fire('onStateChanged', new Dino.events.StateEvent('clear', arguments));
		
		delete this.current_states[name];
		
		return this;
	},
	
	toggle: function(name, sw) {
		var cls = this.stateCls(name);
		
		if(Dino.isArray(cls)){
			if(arguments.length == 1)
				this.widget.el.toggleClass( cls[1] );
			else
				this.widget.el.toggleClass( cls[1], !sw );
			cls = cls[0];
		}
		
		this.widget.el.toggleClass( cls, sw );
		this.widget.events.fire('onStateChanged', new Dino.events.StateEvent('toggle', arguments));
		
		(name in this.current_states) ? delete this.current_states[name] : this.current_states[name] = true;
		
		return this.widget.el.hasClass(cls);
	},
	
	check: function(name) {
//		var cls = this.stateCls(name);
//		if(Dino.isArray(cls))
//			return (cls[0] == '' || this.widget.el.hasClass(cls[0])) && !this.widget.el.hasClass(cls[1])
//		return this.widget.el.hasClass( cls );
		return this.is(name);
	},

	is: function(name) {
		var cls = this.stateCls(name);
		if(Dino.isArray(cls))
			return (cls[0] == '' || this.widget.el.hasClass(cls[0])) && !this.widget.el.hasClass(cls[1])
		return this.widget.el.hasClass( cls );
	},
	
	
	stateCls: function(name) {
		var stateVal = this.widget.options.states[name];
		// если состояние не определено, то формируем имя класса по имени базового класса
		if(stateVal === undefined) return name;
		// если состояние - функция, то вызываем ее, а значение считаем состоянием
		if(Dino.isFunction(stateVal))
			return stateVal.call(this.widget);
		
		return stateVal;
	}
	
	
});
*/

/**
 * @class
 * @name Dino.layouts.StatefulLayout
 * @extends Dino.Layout
 */
Dino.declare('Dino.layouts.StatefulLayout', 'Dino.Layout', /** @lends Dino.layouts.StatefulLayout.prototype */{
	
	initialize: function(o){
		Dino.layouts.StatefulLayout.superclass.initialize.call(this, o);
		
		this.items = [];
		this.immediateRebuild = true;
	},
	
	insert: function(item, key) {
		this.items.push(item);
		if(this.immediateRebuild) this.rebuild();

	},
	
	remove: function(item) {
		Dino.remove_from_array(this.items, item);
		if(this.immediateRebuild) this.rebuild();
	},
	
	clear: function() {
		Dino.each(this.items, function(item) { item.el.detach(); });
		this.items = [];
	}
	
});

/**
 * Эта компоновка сразу добавляет элемент в контейнер.
 * Методы update и rebuild ничего не выполняют
 * 
 * @class
 * @name Dino.layouts.PlainLayout
 * @extends Dino.Layout
 * 
 */
Dino.declare('Dino.layouts.PlainLayout', Dino.Layout, /** @lends Dino.layouts.PlainLayout.prototype */{
	
	defaultOptions: {
		autoHeight: false
	},
	
	insert: function(item, index) {
		
		if(index == null)
			this.el.append( item.el );
		else if(index == 0)
			this.el.prepend( item.el );
		else
			this.el.children().eq(index-1).after(item.el);
		
		if('itemCls' in this.options) item.el.addClass(this.options.itemCls);
	},
	
	remove: function(item) {
		item.el.remove(); //TODO опасный момент: все дочерние DOM-элементы уничтожаются
		if('itemCls' in this.options) item.el.removeClass(this.options.itemCls);
	},
	
	clear: function() {
		this.el.empty(); //WARN еще опасный момент все дочерние DOM-элементы уничтожаются
	},
	
	update: function() {
		
		// AUTO WIDTH
		if(this.container.options.width == 'auto'){

			// если элемент не отображается - его не надо выравнивать
			if(!this.el.not(':hidden')) return;
			
			// расчитываем отступы
			var dw = this.el.outerWidth() - this.el.width();
			// скрываем элемент
			this.el.hide();
			
			// ищем родителя, у которого определена ширина
			var w = 0;
			this.el.parents().each(function(i, el){
				if(!w) w = $(el).width();
				if(w) return false;
			});
			
			// обходим всех видимых соседей и получаем их ширину
			this.el.siblings().not(':hidden').each(function(i, el){
				w -= $(el).outerWidth(true);
			});

			// задаем ширину элемента (с учетом отступов), если она не нулевая
			if(w - dw) 
				this.el.width(w - dw);
				
			// отображаем элемент
			this.el.show();
		}
		
		// AUTO HEIGHT
		if(this.container.options.height == 'auto'){

			if(!this.el.is(":visible")) return;
			
			this.el.height(0);
			
//			this.el.hide();
			
			var dh = 0;
			var h = 0;
			this.el.parents().each(function(i, el){
				el = $(el);
				var w = el.dino();
				if((w && w.options.height) || el.attr('autoheight') == 'true' || el.is('body')){
					h = el.height();
					return false;
				}
				else {
//					if(dh == 0) dh = el.height();
					dh += (el.outerHeight(true) - el.height());
					el.siblings().not('td, :hidden').each(function(i, sibling){
						sibling = $(sibling);
						if(sibling.attr('autoheight') != 'ignore') 
							dh += sibling.outerHeight(true)
					});
				}
			});

			dh += (this.el.outerHeight(true) - this.el.height());
			this.el.siblings().not('td, :hidden').each(function(i, sibling){
				sibling = $(sibling);
				if(sibling.attr('autoheight') != 'ignore') 
					dh += sibling.outerHeight(true)
			});
			
//			dh -= this.el.height()
			this.el.height(h - dh);

//			this.el.show();
			
		}
		
		// AUTO FIT
		if(this.container.options.autoFit){
			var dw = this.el.outerWidth() - this.el.width();
			var dh = this.el.outerHeight() - this.el.height();
			
			this.el.hide();
			
			var h = 0;
			var w = 0;
			this.el.parents().each(function(i, el){
				if(!h) h = $(el).height();
				if(!w) w = $(el).width();
				if(w && h) return false;
			});
			
			this.el.siblings().not(':hidden').each(function(i, el){
				w -= $(el).outerWidth(true);
			});

			this.el.width(w - dw);
			this.el.height(h - dh);		

			this.el.show();			
		}

	}
		
}, 'plain-layout');
/**
 * @class
 * @extends Dino.Layout
 */
Dino.layouts.ThreeColumnLayout = Dino.declare('Dino.layouts.ThreeColumnLayout', Dino.Layout, /** @lends Dino.layouts.ThreeColumnLayout.prototype */{
	
	defaultOptions: {
//		containerCls: 'dino-3c-layout',
		name: '3c',
		updatePolicy: 'manual'
	},
	
	
	insert: function(item) {
		
		var el = item.el;
		
		switch(item.options.position){
			case 'left':
				if(this.left) this.left.el.remove(); // удаляем старый элемент из DOM
				this.left = item;
				el.addClass('dino-3c-left');
				this.container.el.prepend(el);
				break;
			case 'right':
				if(this.right) this.right.el.remove(); // удаляем старый элемент из DOM
				this.right = item;
				el.addClass('dino-3c-right');
				this.container.el.append(el);
				break;
			case 'center':
			default:
				if(this.center) this.center.el.remove(); // удаляем старый элемент из DOM
				
				this.center = item;
				el.addClass('dino-3c-center');
				
				if(this.left) 
					this.left.el.after(el);
				else if(this.right) 
					this.right.el.before(el);
				else
					this.container.el.append(el);
		}
	},
	
	remove: function(item) {
	},
	
	clear: function() {
		// очищаем контейнер от дочерних элементов
		this.container.el.empty();
		
		delete this.left;
		delete this.right;
		delete this.center;
	},
	
	update: function() {
		if(this.left) this.center.el.css({'margin-left': this.left.el.outerWidth()});
		if(this.right) this.center.el.css({'margin-right': this.right.el.outerWidth()});
	}
	
}, '3c-layout');
/**
 * @class
 * @extends Dino.layouts.PlainLayout
 */
Dino.layouts.StackLayout = Dino.declare('Dino.layouts.StackLayout', 'Dino.layouts.PlainLayout', /** @lends Dino.layouts.StackLayout.prototype */{
	
	defaultOptions: {
//		containerCls: 'dino-stack-layout',
		name: 'stack',
		itemCls: 'hidden'
	},
	
	activate: function(i) {
		
		var child = (i instanceof Dino.Widget) ? i : this.container.children.get(i);
		
		this.container.children.each(function(c){
			c.el.toggleClass('hidden', (c != child));
		});
		
		if(child.layout) child.$layoutChanged();
		
		this.active = child;
		
	}
		
}, 'stack-layout');


/**
 * @class
 * @extends Dino.layouts.PlainLayout
 */
Dino.layouts.ColumnLayout = Dino.declare('Dino.layouts.ColumnLayout', 'Dino.layouts.PlainLayout', /** @lends Dino.layouts.ColumnLayout.prototype */{
	
	defaultOptions: {
		name: 'column',
		valign: 'top'
//		autoHeight: true
	},
	
	attach: function() {
		Dino.layouts.ColumnLayout.superclass.attach.apply(this, arguments);
		
		this.el = $('<table cellspacing="0" cellpadding="0" border="0" style="width:100%"><tbody><tr></tr></tbody></table>');
		this.row_el = $('tr', this.el);
		
		this.container.el.append(this.el);
	},
	
	detach: function() {
		Dino.layouts.ColumnLayout.superclass.detach.apply(this, arguments);
		this.el.remove();
	},
	
	insert: function(item, key) {
		var col_el = $('<td style="vertical-align: '+this.options.valign+'"></td>');
//		var col_width = 0;
//		if('columnWidth' in item.options) col_el.width(item.options.width);		
		if('width' in item.options) {
			item.el.css('width', null);
			col_el.width(item.options.width);
		}
		col_el.append( item.el );
		
		this.row_el.append(col_el);
	},
	
	remove: function(item) {
		item.el.parent().remove();
	},
	
	clear: function() {
		this.row_el.empty(); //FIXME
	},
	
	update: function() {
		var self = this;
		this.container.children.each(function(child, i) {
				var col_el = $('td', self.row_el).eq(i);
				col_el.width(child.options.width);
		});
	}
	
}, 'column-layout');



/**
 * @class
 * @extends Dino.Layout
 */
Dino.layouts.FormLayout = Dino.declare('Dino.layouts.FormLayout', 'Dino.Layout', /** @lends Dino.layouts.FormLayout.prototype */{
	
	defaultOptions: {
		name: 'form'
	},
	
	
	
	
	attach: function() {
		Dino.layouts.FormLayout.superclass.attach.apply(this, arguments);
		
		this.el = $('<table cellspacing="0" cellpadding="0" border="0"><tbody><tr></tr></tbody></table>');
		this.body_el = $('tbody', this.el);
		
		this.container.el.append(this.el);
	},
	
	detach: function() {
		Dino.layouts.FormLayout.superclass.detach.apply(this, arguments);
		this.el.remove();
	},
	
	
	
	insert: function(item){
		
		var row = $('<tr><td class="label"></td><td></td></tr>');
		
		$('td.label', row).append('<label>' + item.options.label + ':' + '</label>');
		$('td', row).eq(1).append(item.el);
		
		this.el.append(row);
	}
	
	
	
}, 'form-layout');




/**
 * @class
 * @extends Dino.Layout
 */
Dino.layouts.SimpleFormLayout = Dino.declare('Dino.layouts.SimpleFormLayout', 'Dino.Layout', /** @lends Dino.layouts.SimpleFormLayout.prototype */{
	
	defaultOptions: {
		name: 'simple-form'
	},

	insert: function(item){

		var o = item.options;
		
		var wrapperEl = $('<div class="dino-form-item-wrapper"></div>');
		var labelEl = $('<label>'+(o.label || '')+'</label>');
		var label_pos = o.labelPosition || 'before';
		
		if('id' in item.options) labelEl.attr('for', item.options.id);
		
		if(label_pos == 'before')
			wrapperEl.append(labelEl).append(item.el);
		else if(label_pos == 'after')
			wrapperEl.append(item.el).append(labelEl);
		
		this.container.el.append(wrapperEl);
	}
	
	
}, 'simple-form-layout');	
	


/**
 * @class
 * @name Dino.layouts.DockLayout
 * @extends Dino.Layout
 */
Dino.declare('Dino.layouts.DockLayout', 'Dino.Layout', /** @lends Dino.layouts.DockLayout.prototype */{
	
	defaultOptions: {
//		containerCls: 'dino-dock-layout',
		name: 'dock',
		updateMode: 'none'
	},
	
	insert: function(item) {
		var el = item.el;
		
		if('dock' in item.options){
			if(item.options.dock) {
				var dock_a = item.options.dock.split('-');
				if(dock_a.length == 1) dock_a.push('center');
				
				el.attr('dock', dock_a.join('-'));				
			}
//			el.addClass('dock-'+dock_a.join('-'));
			this.container.el.append(el);
		}
		else {
			if(!this.content){
//				this.content = $('<div class="dino-dock-content"></div>');
				this.content = el;
//				this.content.append(el);
			}
			this.container.el.append(el);//this.content);
		}
		
//		if(Dino.in_array(['top', 'left-top', 'left-center', 'left-bottom', 'bottom', 'right-top', 'right-center', 'right-bottom'], item.options.dock))
//			el.addClass('dock-'+item.options.dock);
		
//		this.container.el.append(el);
	},
	
	remove: function(item) {
		item.el.remove();
	},	
	
	update: function(){
		var margin_left = margin_right = 0;
		$('[dock|=left]', this.container.el).each(function(i, el){
			margin_left = Math.max(margin_left, $(el).outerWidth());
		});
		$('[dock|=right]', this.container.el).each(function(i, el){
			margin_right = Math.max(margin_right, $(el).outerWidth());
		});
//		$('.dock-left-center', this.container.el).each(function(i, el){
//			$(el).css('margin-top', -$(el).outerHeight()/2);
//		});


		var h = this.el.height();
		
		$('[dock$=center]', this.el).each(function(i, el){
			el = $(el);
			el.css('margin-top', -el.outerHeight()/2);//-Math.min(h, el.outerHeight(true))/2);
		});
				
		if(this.content){
			if(margin_left > 0)	this.content.css('margin-left', margin_left);
			if(margin_right > 0)	this.content.css('margin-right', margin_right);
		}
		
/*		
		var margin_left = 0;
		$('.dock-left', this.container.el).each(function(i, el){ 
			margin_left += $(el).outerWidth(); 
		});
		
		var content_el = this.container.el.children(':not(.dock-left, .dock-top)');
		
		if(margin_left > 0)
			content_el.css('margin-left', margin_left);
*/			
	}
	
}, 'dock-layout');
/**
 * @class
 * @extends Dino.layouts.PlainLayout
 */
Dino.layouts.FloatLayout = Dino.declare('Dino.layouts.FloatLayout', 'Dino.layouts.PlainLayout', /** @lends Dino.layouts.FloatLayout.prototype */{
	
	defaultOptions: {
		name: 'float',
		clearfix: true
	},
	
	attach: function(c) {
		Dino.layouts.FloatLayout.superclass.attach.call(this, c);
		// добавляем элемент-clearfix
		if(this.options.clearfix) {
			this.clearfix_el = $('<div class="clearfix"></div>');
			this.container.el.append(this.clearfix_el);
		}
	},
	
	insert: function(item) {
		(this.options.clearfix) ? this.clearfix_el.before(item.el) : this.container.el.append(item.el);
		item.el.addClass('float-item');
	},
	
	clear: function() {
		this.container.el.children().not('.clearfix').remove();
	}
	
	
	
}, 'float-layout');
Dino.topZ = 1;


/**
 * @class
 * @extends Dino.layouts.PlainLayout
 */
Dino.layouts.WindowLayout = Dino.declare('Dino.layouts.WindowLayout', 'Dino.layouts.PlainLayout', /** @lends Dino.layouts.WindowLayout.prototype */{
	
	defaultOptions: {
		name: 'window',
		delay: 300,
		initialWidth: 200,
		initialHeight: 200,
		updateMode: 'manual',
		html: '<div class="dino-window-content"/>'
	},
	
	
	attach: function() {
		Dino.layouts.WindowLayout.superclass.attach.apply(this, arguments);
		
		var o = this.options;
		
		this.overlay_el = $('<div class="dino-overlay" autoheight="ignore"></div>');
						
		this.overlay_el.mousedown(function(e){ e.preventDefault(); return false; });
		
	},
	
	detach: function() {
		Dino.layouts.WindowLayout.superclass.detach.apply(this, arguments);
		this.container.el.empty();
	},
	
	
	reset: function() {

		var w0 = this.options.initialWidth;
		var h0 = this.options.initialHeight;
		
		this.container.el.css({
			width: w0, 
			height: h0,
			'margin-left': -w0/2,
			'margin-top': -h0/2
		});
	},
	
	
	open: function() {

		var z = Dino.topZ++;
		this.overlay_el.css('z-index', z*1000);
		this.container.el.css('z-index', z*1000+1);
	
		$('body').append(this.overlay_el);
		
		this.reset();
		this.container.el.show();
		
	},
	
	
	close: function() {

		Dino.topZ--;
		
		this.overlay_el.detach();
		this.container.el.hide();
	},
	
	
	update: function(callback) {
		
		var box = this.el;
		var wnd = this.container.el;
		
		box.css({'visibility': 'hidden'});
		
		var w0 = wnd.width();
		var h0 = wnd.height();
		wnd.css({width: '', height: ''});
		
//		this.container.el.show();
		
				
		var w = this.container.options.width || box.outerWidth(true);
		var h = this.container.options.height || box.outerHeight(true);
		
		// если указана высота в %, ее еще надо рассчитать
		if(Dino.isString(w) && w[w.length-1] == '%') 
			w = this.container.el.parent().width() * parseFloat(w.substr(0, w.length-1))/100;
		if(Dino.isString(h) && h[h.length-1] == '%') 
			h = this.container.el.parent().height() * parseFloat(h.substr(0, h.length-1))/100;
		
		box.css('display', 'none');
		
		var o = this.options;
		
//		wnd.width(w0);
//		wnd.height(h0);

		wnd.css('width', w0);
		wnd.css('height', h0);
		wnd.css('margin-left', -w0/2);
		wnd.css('margin-top', -h0/2);
//		wnd.width(w0);
//		wnd.height(h0);

//		wnd.css({'visibility': 'visible'});
		
//		console.log(Dino.format("%s, %s", w0, h0));
		
		var self = this;
		
		wnd.animate({'width': w, 'margin-left': -w/2, 'height': h, 'margin-top': -h/2}, o.delay, function(){
			// делаем окно видимым
			box.css({'visibility': '', 'display': 'block'});
			// вызываем функцию-сигнал о том, что окно отображено
			if(callback) callback.call(self);
			// обновляем компоновку окна
			self.container.$layoutChanged();
		});
		
		
		box.focus();
		
	}
		
	
}, 'window-layout');








/*
Dino.layouts.WindowLayout = Dino.declare('Dino.layouts.WindowLayout', 'Dino.layouts.PlainLayout', {
	
	defaultOptions: {
		name: 'window',
		delay: 300,
		initialWidth: 200,
		initialHeight: 200,
		updateMode: 'manual'
	},
	
	
	attach: function() {
		Dino.layouts.WindowLayout.superclass.attach.apply(this, arguments);
		
		var o = this.options;
		
		this.window_el = $('<div class="dino-window" autoheight="true"><div class="dino-window-content"></div></div>');
		this.overlay_el = $('<div class="dino-overlay"></div>');
		this.el = $('.dino-window-content', this.window_el);
						
		this.container.el.append(this.overlay_el).append(this.window_el);

//		this.overlay_el.click(function(e){ e.stopPropagation(); });
		this.overlay_el.mousedown(function(e){ e.preventDefault(); return false; });
		
	},
	
	detach: function() {
		Dino.layouts.WindowLayout.superclass.detach.apply(this, arguments);
		this.container.el.empty();
	},
	
	
	reset: function() {

		var w0 = this.options.initialWidth;
		var h0 = this.options.initialHeight;
		
		this.window_el.css({
			width: w0, 
			height: h0,
			'margin-left': -w0/2,
			'margin-top': -h0/2
		});
	},
	
	update: function(callback) {
		
		var box = this.el;
		var wnd = this.window_el;
		
		box.css({'visibility': 'hidden'});
		
		var w0 = wnd.width();
		var h0 = wnd.height();
		wnd.css({width: '', height: ''});
		
//		this.container.el.show();
		
				
		var w = box.outerWidth(true);
		var h = box.outerHeight(true);
		
		box.css('display', 'none');
		
		var o = this.options;
		
//		wnd.width(w0);
//		wnd.height(h0);

		wnd.css('width', w0);
		wnd.css('height', h0);
		wnd.css('margin-left', -w0/2);
		wnd.css('margin-top', -h0/2);
//		wnd.width(w0);
//		wnd.height(h0);

//		wnd.css({'visibility': 'visible'});
		
//		console.log(Dino.format("%s, %s", w0, h0));
		
		var self = this;
		
		wnd.animate({'width': w, 'margin-left': -w/2, 'height': h, 'margin-top': -h/2}, o.delay, function(){
			// делаем окно видимым
			box.css({'visibility': '', 'display': 'block'});
			// вызываем функцию-сигнал о том, что окно отображено
			if(callback) callback.call(self);
			// обновляем компоновку окна
			self.container.$layoutChanged();
		});
		
		
		box.focus();
		
	}
		
	
}, 'window-layout');
*/


/**
 * @class
 * @extends Dino.layouts.PlainLayout
 */
Dino.layouts.InheritedLayout = Dino.declare('Dino.layouts.InheritedLayout', 'Dino.layouts.PlainLayout', /** @lends Dino.layouts.InheritedLayout.prototype */{
	
//	initialize: function(){
//		Dino.layouts.InheritedLayout.superclass.initialize.apply(this, arguments);
//		
//		this.deferred = [];
//	},
	
	
	attach: function() {
		Dino.layouts.InheritedLayout.superclass.attach.apply(this, arguments);
		
		this.el = this.options.parentLayout.el;
		
	}
	
	
//	insert: function(item) {
//		Dino.layouts.InheritedLayout.superclass.insert.apply(this, arguments);
//		this.container.insert(item);
////		else
////			this.deferred.push(item);
//	},
//	
//	remove: function(item) {
//		Dino.layouts.InheritedLayout.superclass.remove.apply(this, arguments);
//		this.container.remove(item);
//	}
	
//	clear: function() {
//		//TODO здесь интересный вопрос - в принципе нужно запоминать свои элементы и удалять только их
////		this.container.el.empty();
//		this.container.clear();
//	}
	
//	update: function() {
//		while(this.deferred.length > 0) {
//			this.insert( this.deferred.pop() );
//		}
//	}
		
}, 'inherited-layout');


Dino.declare('Dino.layouts.BorderLayout', 'Dino.layouts.PlainLayout', {
	
	defaultOptions: {
		name: 'border'
	},
	
	initialize: function(o){
		Dino.layouts.BorderLayout.superclass.initialize.apply(this, arguments);
//		
//		this.regions = {};

		var self = this;

		this.handlers = {};
		var activeSplit = null;
		var activeSplitSize = 0;
		var activeSplitOffset = 0;
		var activeRegion = '';
		var metrics = {'west': 'width', 'east': 'width', 'north': 'height', 'south': 'height'};
		var splitPane = null;
		
		this.locked = [];

		var adjust_regions = function() {
			var region = activeRegion;
			
//			var metric = (region == 'west' || region == 'east') ? 'width' : 'height'
			self[region].el.css(metrics[region], activeSplitOffset);
			self.update({'regions': [region]});
		};


		this.handlers.split_mousemove = function(e) {
			if(activeSplit) {
//				var newOffset = 0;
				if(activeRegion == 'west') {
					var offset = self.west_region.offset().left;
					var dw = self.west.el.outerWidth(true) - self.west.el.width();
					var left = e.pageX - offset - activeSplitSize/2 - dw;
//					self.west.el.css('width', left);
					
					activeSplit.css('left', left + dw);
					activeSplitOffset = left;
				}
				else if(activeRegion == 'east') {
					var offset = $('body').outerWidth() - self.east_region.offset().left - self.east_region.width();
					var dw = self.east.el.outerWidth(true) - self.east.el.width();
					var right = ($('body').outerWidth() - e.pageX) - offset - activeSplitSize/2 - dw;
//					self.east.el.css('width', right);

					activeSplit.css('right', right + dw);
					activeSplitOffset = right;
				}
				else if(activeRegion == 'north') {
					var offset = self.north_region.offset().top;
					var dh = self.north.el.outerHeight(true) - self.north.el.height();
					var top = e.pageY - offset - activeSplitSize/2 - dh;
//					self.north.el.css('height', top);

					activeSplit.css('top', top + dh);
					activeSplitOffset = top;
				}
				else if(activeRegion == 'south') {
					var offset = $('body').outerHeight() - self.south_region.offset().top - self.south_region.height();
					var dh = self.south.el.outerHeight(true) - self.south.el.height();
					var bottom = ($('body').outerHeight() - e.pageY) - offset - activeSplitSize/2 - dh;
					
//					self.south.el.css('height', bottom);					
					activeSplit.css('bottom', bottom + dh);
					activeSplitOffset = bottom;
				}
//				adjust_regions();
			}
		};


		this.handlers.split_mousedown = function(e) {
			var region_el = $(this);//e.data.splitter;
			activeRegion = region_el.attr('region').split('-')[0];
			
			// если регион заблокирован, то начинать перемещение нельзя
			if(activeRegion in self.locked) return;			
			
			activeSplit = region_el;
			activeSplitSize = (metrics[activeRegion] == 'width') ? activeSplit.width() : activeSplit.height();
			activeSplit.addClass('active');
			$('.split-pane').remove();
			splitPane = $('<div class="split-pane resizable-'+activeRegion+'" autoheight="ignore"></div>')
				.bind('mousemove', self.handlers.split_mousemove)
				.bind('mouseup', self.handlers.split_mouseup);
			$('body').append(splitPane);
			return false;
		};		

		this.handlers.split_mouseup = function() {
			if(activeSplit) {
				$('.split-pane').remove();
				splitPane = null;
				adjust_regions();
				activeSplit.removeClass('active');
				activeSplit = null;
			}			
		};


	},
	
	
	attach: function() {
		Dino.layouts.BorderLayout.superclass.attach.apply(this, arguments);
		
		this.middle_region = $('<div region="middle"></div>');
		this.el.append(this.middle_region);
		
	},
	
	
	insert: function(item) {
		
		var region = item.options.region || 'center';

//		this.regions[region] = item;
		
//		var center = this.regions.center;

		var self = this;
		
		switch(region) {
			case 'center':
				this.center = item;
				this.center_region = $('<div region="center" autoheight="ignore"></div>');
				this.center_region.append(item.el);
				this.middle_region.append(this.center_region);
				break;
			case 'west':
				this.west = item;
				this.west_region = $('<div region="west" autoheight="ignore"></div>');
				this.west_splitter = $('<div region="west-splitter" autoheight="ignore"></div>');
				this.west_splitter.bind('mousedown', this.handlers.split_mousedown);
				this.middle_region.append(this.west_region).append(this.west_splitter);
				this.west_region.append(item.el);
				break;
			case 'east':
				this.east = item;
				this.east_region = $('<div region="east" autoheight="ignore"></div>');
				this.east_splitter = $('<div region="east-splitter" autoheight="ignore"></div>');
				this.east_splitter.bind('mousedown', this.handlers.split_mousedown);
				this.middle_region.append(this.east_region).append(this.east_splitter);
				this.east_region.append(item.el);
				break;
			case 'north':
				this.north = item;
				this.north_region = $('<div region="north"></div>');
				this.north_splitter = $('<div region="north-splitter"></div>');
				this.north_splitter.bind('mousedown', this.handlers.split_mousedown);
				this.el.append(this.north_region).append(this.north_splitter);
				this.north_region.append(item.el);
				break;	
			case 'south':
				this.south = item;
				this.south_region = $('<div region="south"></div>');
				this.south_splitter = $('<div region="south-splitter"></div>');
				this.south_splitter.bind('mousedown', this.handlers.split_mousedown);
				this.el.append(this.south_splitter).append(this.south_region);
				this.south_region.append(item.el);
				break;	
		}
		
	},
	
	
	
	
	
	update: function(o) {
		Dino.layouts.BorderLayout.superclass.update.apply(this, arguments);
		
		var regions_to_upd = (o && o.regions) ? o.regions : ['north', 'south', 'west', 'east', 'center'];
		
		for(var i = 0; i < regions_to_upd.length; i++) {
			var region = regions_to_upd[i];
			
			if(region == 'west' && this.west_region) {
				var w = this.west_region.outerWidth();
				this.west_splitter.css('left', w);
				this.center_region.css('left', w + this.west_splitter.width());
				this.west.$layoutChanged();
				this.center.$layoutChanged();
			}
			else if(region == 'east' && this.east_region) {
				var w = this.east_region.outerWidth();
				this.east_splitter.css('right', w);
				this.center_region.css('right', w + this.east_splitter.width());
				this.east.layout.update();
				this.center.layout.update();
			}
			else if(region == 'north' && this.north_region) {
				var h = this.north_region.outerHeight();
				this.north_splitter.css('top', h);
				h += this.north_splitter.height()
				if(this.west_region){
					this.west.layout.update();
				}
				if(this.east_region){
					this.east.layout.update();
				}
				this.middle_region.css('top', h);
				this.center.layout.update();
			}
			else if(region == 'south' && this.south_region) {
				var h = this.south_region.outerHeight();
				this.south_splitter.css('bottom', h);
				h += this.south_splitter.height()
				if(this.west_region){
					this.west.$layoutChanged();
				}
				if(this.east_region){
					this.east.$layoutChanged();
				}
				this.middle_region.css('bottom', h);
				this.center.$layoutChanged();
				
				this.south.$layoutChanged();
			}
			
		}		
		
	},
	
	
	lock: function(region) {
		this.locked[region] = true;
	},
	
	unlock: function(region) {
		delete this.locked[region];		
	}
	
	
}, 'border-layout');


Dino.declare('Dino.layouts.HBox', 'Dino.layouts.PlainLayout', {
	
	defaultOptions: {
		name: 'hbox'
	}
	
}, 'hbox-layout');


/**
 * @class
 * @name Dino.containers.Box
 * @extends Dino.Container
 */
Dino.declare('Dino.containers.Box', 'Dino.Container', /** @lends Dino.containers.Box.prototype */ {
	
	defaultOptions: {
		defaultItem: {
			dtype: 'box'
		}
	},
	
	$html: function() { return '<div></div>'; }
	
}, 'box');




/**
 * @class
 * @extends Dino.containers.Box
 */
Dino.containers.Tabs = Dino.declare('Dino.containers.Tabs', 'Dino.containers.Box', /** @lends Dino.containers.Tabs.prototype */{
	
	
	defaultOptions: {
		defaultItem: {
			html: '<li/>',
			cls: 'dino-tabs-item',
			content: {
				dtype: 'text'
			},
			state: 'clickable',
			onClick: function() {
				this.parent.setActiveTab(this);
			}
//			events: {
//				'click': function(e, w){
//					w.parent.activateTab(tab);
//				}
//			}
		},
//		itemFactory: function(o){
//			return Dino.widget({
//				wrapEl: $('<li/>')
////				defaultItem: this.options.tabContent
//			}, o);
//		},
//		tabContent: {
//			dtype: 'text'
//		},
		defaultIndex: 0
	},
	
	defaultCls: 'dino-tabs',
	
	$html: function() { return '<ul></ul>' },
	
//	$opt: function(o) {
//		Dino.containers.Tabs.superclass.$opt.apply(this, arguments);
		
/*		
		if('tabs' in o){
			for(var i in o.tabs) this.addTab( o.tabs[i] );
		}
*/		
//		if('dock' in o){
//			this.el.addClass('dock-'+o.dock);
//		}
		/*	
		addTab: function(o){
		
			var self = this;
			
			var tab = new Dino.Widget('<li>'+o.text+'</li>', Dino.override({}, this.options.tabModel));
			this.header.addItem(tab);
			
			tab.el.click(function(e){
				self.showTab(tab);
				self.header.eachItem(function(item){
					if(item != tab) self.hideTab(item);
				});
			});
			
			
			var c = this.options.itemFactory(o);
			this.content.addItem(c);
			
		}
	*/	

//	},
	
//	$afterBuild: function(){
//		Dino.containers.Tabs.superclass.$afterBuild.apply(this, arguments);
//		
//		if('defaultIndex' in this.options)
//			this.changeTab(this.options.defaultIndex);
//	},
	
/*	
	addTab: function(t) {
		// создаем закладку
		var tab = this.options.itemFactory.call(this, {
			wrapEl: $('<li/>'),
			defaultItem: this.options.defaultTabItem,
			content: t
		});
				
		this.addItem(tab);
		
		tab.index = parseInt(this.children.length-1); //FIXME это хорошо работает пока закладки не начинают добавляться произвольно		
	},
*/	
	
	setActiveTab: function(tab){
		
		// если указанный объект не является виджетом, то ищем его через getItem
		if(!(tab instanceof Dino.Widget)) tab = this.getItem(tab);
		
		tab.states.set('active');
		this.eachItem(function(item){
			if(item != tab)
				item.states.clear('active');
		});
		var is_changed = (this.currentTab != tab);
		this.currentTab = tab;
		if(is_changed) this.events.fire('onTabChanged');
		
	},
	
	getActiveTab: function(){
		return this.currentTab;
	}

		
	
}, 'tabs');







/**
 * @class
 * @extends Dino.containers.Box
 */
Dino.containers.DropdownBox = Dino.declare('Dino.containers.DropdownBox', 'Dino.containers.Box', /** @lends Dino.containers.DropdownBox.prototype */ {
	
	defaultOptions: {
		html: '<div autoheight="ignore"></div>',
		effects: {
			'show': 'none',
			'hide': 'none',
			'delay': 200
		},
		baseCls: 'dino-dropdown-box',
		offset: [0, 0],
		hideOn: 'outerClick'
	},
	
	
	$init: function() {
		Dino.containers.DropdownBox.superclass.$init.apply(this, arguments);
		  
		var self = this;
		
		this.glass_box = $.dino({
			dtype: 'glass-box',
			events: {
				'click': function(e) {
		      self.hide();
					e.stopPropagation();					
				}
			}						
		});//(o.glassBox instanceof Dino.Widget) ? o.glassBox : $.dino(o.glassBox);
		
//		// создаем прозрачную панель для перехвата событий
//    this.glass_panel =  $('<div class="dino-glass-pane"></div>');
//    this.glass_panel.bind('click', function(e){
//      self.hide();
//			e.stopPropagation();
//    });
		
		this.el.bind('mouseleave', function(){ 
			if(self.options.hideOn == 'hoverOut') self.hide(); 
		});

		this.el.bind('click', function(e){ 
			 e.stopPropagation();
			 e.preventDefault();
		});
		
	},
	
	show: function(x, y) {
		
		if(arguments.length == 0) return;
		
		var offset = this.options.offset;
		
		this.el.css({'left': x + offset[0], 'top': y + offset[1]});
//		$(this.options.target).append(this.el);
				
		var eff = this.options.effects;
		
		switch(eff['show']){
			case 'fade':
				this.el.fadeIn( eff.delay );
				break;
			case 'slideDown':
				this.el.slideDown( eff.delay );
				break;
			default:
				this.el.show();
		}
		
		this.isShown = true;

		if (this.options.hideOn == 'outerClick') {
			// добавляем прозрачную панель в документ
			$('body').append(this.glass_box.el);
		}
		
		this.events.fire('onShow');
	},
	
	hide: function(eff){
		
		if(this.options.hideOn == 'outerClick') {
			// удаляем прозрачную панель
	    this.glass_box.el.detach();
		}
		
		var effects = this.options.effects;
		
		var self = this;
		
		switch(eff || effects['hide']){
			case 'fade':
				this.el.fadeOut( effects.delay, function(){ self.events.fire('onHide'); } );
				break;
			case 'slideUp':
				this.el.slideUp( effects.delay, function(){ self.events.fire('onHide'); } );
				break;
			default:
				this.el.hide();
				this.events.fire('onHide');
		}
		
		this.isShown = false;
		
		
//		this.el.remove();
//		$(this.options.target).remove(this.el);
	}
	
	
}, 'dropdown-box');




Dino.declare('Dino.widgets.FormItem', 'Dino.containers.Box', {
	
	
	$init: function(o) {
		Dino.widgets.FormItem.superclass.$init.apply(this, arguments);		

		this.label = Dino.widget({
			dtype: 'label',
			text: o.label
		});
		this.addItem(this.label, 0);	
	
	}
	
}, 'form-item')









Dino.declare('Dino.containers.Form', Dino.Container, {

	defaultOptions: {
//		layout: 'form-layout'
	},
	
	
	$html: function() { return '<form method="post"></form>'; },
	
	$opt: function(o) {
		Dino.containers.Form.superclass.$opt.apply(this, arguments);
		
		if('action' in o) this.el.attr('action', o.action);
	},
	
	
	ajaxSubmit: function(callback) {
		
		var url = this.el.attr('action');
		var data = this.el.serialize();
		
		$.post(url, data, callback);
	}
	
}, 'form');




/**
 * @class
 * @extends Dino.Container
 */
Dino.containers.GroupBox = Dino.declare('Dino.containers.GroupBox', 'Dino.Container', /** @lends Dino.containers.GroupBox.prototype */{
	
	defaultOptions: {
		baseCls: 'dino-group-box',
		defaultItem: {
			dtype: 'box'
		},
		components: {
			title: {
				dtype: 'container',
				html: '<legend/>'
//				cls: 'dino-group-title'// dino-panel'
			}
		}
	},
	
	$html: function() { return '<fieldset/>'; },
	
	$opt: function(o) {
		Dino.containers.GroupBox.superclass.$opt.apply(this, arguments);
		
		if('title' in o) this.title.opt('innerText', o.title);
	}
	
}, 'group-box');

Dino.declare('Dino.containers.GlassBox', 'Dino.containers.Box', {
	
//	defaultClass: 'dino-glass-box',
	
	defaultOptions: {
		html: '<div class="dino-glass-box" autoheight="ignore"/>',
		events: {
			'mousedown': function(e) {
				e.preventDefault();
				return false;
			}
			
//    this.glass_panel.bind('click', function(e){
//      self.hide();
//			e.stopPropagation();
//    });
		}
	}
	
}, 'glass-box');


Dino.declare('Dino.widgets.ControlBox', 'Dino.containers.Box', {
	
	defaultOptions: {
		cls: 'dino-control-box'
	}
	
	
}, 'control-box');



/**
 * @class
 * @extends Dino.Widget
 */
Dino.widgets.Split = Dino.declare('Dino.widgets.Split', 'Dino.Widget', /** @lends Dino.widgets.Split.prototype */{
	
	$html: function() { return '<div>&nbsp;</div>' },
	
	defaultOptions: {
		cls: 'dino-split'
	}	
	
}, 'split');





Dino.SelectionManager = Dino.declare('Dino.SelectionManager', 'Dino.BaseObject', {
	
	initialize: function(widget) {
		Dino.SelectionManager.superclass.initialize.apply(this, arguments);
		
		this.widget = widget
		this.selection_a = [];
		
	},
	
	get: function() {
		return this.selection_a[0];
	},
	
	get_all: function() {
		return this.selection_a;		
	},
	
	add: function(w, ctrlKey, shiftKey) {
		
    if(shiftKey && this.selection_a.length > 0) {
      // создаем выборку
      var i0 = Math.min(this.selection_a[0].index, this.selection_a[this.selection_a.length-1].index);
      i0 = Math.min(i0, w.index);
      var i1 = Math.max(this.selection_a[0].index, this.selection_a[this.selection_a.length-1].index);
      i1 = Math.max(i1, w.index);
      
      this.selection_a = [];
      
			var self = this;
			
      w.parent.eachItem(function(item, i){
        if(i >= i0 && i <= i1) {
          item.states.set('selected');
          self.selection_a.push(item);
        }
      });
    }
    else if(ctrlKey) {
      ( w.states.toggle('selected') ) ? this.selection_a.push(w) : Dino.remove_from_array(this.selection_a, w);
    }
    else {
      Dino.each(this.selection_a, function(item){ item.states.clear('selected'); });
      w.states.set('selected');
      this.selection_a = [w];                  
    }
    
		this.widget.events.fire('onSelectionChanged');
		
	},
	
	clear: function() {
		Dino.each(this.selection_a, function(item){ item.states.clear('selected'); });
		this.selection_a = [];
		this.widget.events.fire('onSelectionChanged');
	},
	
	
	each: function(callback) {
		for(var i = 0; i < this.selection_a.length; i++) callback.call(this, this.selection_a[i], i);
	},
	
	size: function() {
		return this.selection_a.length;
	}
	
});






Dino.Selectable = function() {
	this.selection = new Dino.SelectionManager(this);
}






Dino.Editable = function(o) {

	this.startEdit = function() {
		
		this.layout.el.empty();
		
		var editorOpts = this.options.editor;
		if(Dino.isString(editorOpts)) editorOpts = {dtype: editorOpts};
		this.addComponent('_editor', editorOpts);
		
		this._editor.$layoutChanged();

		this._editor.$bind(this.data);
		this._editor.$dataChanged(); // явно вызываем обновление данных
		if(this._editor.options.focusable) this._editor.setFocus();
		$('input,select', this.layout.el).focus().select();
		
//		var self = this;
//		
//		this._key_handler = function(e) {
//			self_editor.events.fire('onWindowKeyPress', {baseEvent: e});
//		}
//		
//		$(window).bind('keypress', this._key_handler);

//		this.events.fire('onBeforeEdit');
	};
	
	this.stopEdit = function(reason) {
//		$(window).unbind('keypress', this._key_handler);
		if(this._editor.options.focusable) this._editor.clearFocus();
		this.removeComponent('_editor').destroy(); // удаляем и уничтожаем компонент
		this.$dataChanged(); // явно вызываем обновление данных
		this.events.fire('onEdit', {'reason': reason});
	};
	
	o.editor = o.editor || 'text-editor';
	
//	o.editor = Dino.utils.overrideOpts({}, Dino.Editable.defaultEditor, o.editor);
	
	//TODO имеет смысл перенести это в состояния
	o.editable = ('editable' in o) ? o.editable : true;
	
};




/*
Dino.Editable.defaultEditor = {
	dtype: 'textfield',
	autoFit: true,
	cls: 'dino-text-editor',
	changeOnBlur: true,
	events: {
		'keypress': function(e, w) {
			if(e.keyCode == 27) w.parent.stopEdit(); 
		}
	},
	onValueChanged: function(e) {
		if(this.parent) this.parent.stopEdit(e.reason);
	}			
};
*/

Dino.drag = null;
//Dino.Draggable.dragPane = $.dino({dtype: 'glass-box'});//$('<div class="split-pane" autoheight="ignore"></div>');
//Dino.droppableList = [];

Dino.Draggable = function(o) {
	
	this.el.bind('mousedown', function(e) {
		if(!Dino.drag) {
			var w = $(this).dino();
			Dino.drag = {
				started: false,
				source: w,
				offset: [8, 8]
			}
		}
		return false;
	}).bind('mouseup', function(e){
		if(Dino.drag) {
			Dino.drag = null;
		}
	}).bind('mousemove', function(e) {
			
		var drag = Dino.drag;
		
		if(drag) {
			
			var element = $(this);
			
			if(!drag.started) {
				drag.started = true;
				
				var event = new Dino.events.CancelEvent({dragContext: drag});
				drag.source.events.fire('onDrag', event);
				
				if(event.isCanceled){
					if(drag.proxy) drag.proxy.destroy();
					Dino.drag = null;
					return;
				}
				
				if(drag.proxy){
					drag.proxy.el.css({'position': 'absolute', 'z-index': '9999', 'left': e.pageX+drag.offset[0], 'top': e.pageY+drag.offset[1]});

//					drag.dragPane = $('<div class="split-pane"></div>');
					
					$('body').append(Dino.Draggable.dragPane.el);
					$('body').append(drag.proxy.el);
				}
				
			}
		}
	});
	
	if(!Dino.Draggable.dragReady) {
		
		Dino.Draggable.dragPane = $.dino({dtype: 'glass-box'});
		
		Dino.Draggable.dragReady = true;
//		$('body').append(Dino.dragPane);
		
		//FIXME здесь было бы правильней создавать glass pane, а не использовать body
		
		Dino.Draggable.dragPane.el.mousemove(function(e){
			var drag = Dino.drag;
	
			if(!drag) return;
			
			if(drag && drag.started && drag.proxy) {
				drag.proxy.el.css({'left': e.pageX+drag.offset[0], 'top': e.pageY+drag.offset[1]});
				
				$('.droppable:visible').each(function(i, el){
					el = $(el);
					var target = el.dino();
					
					if(!target) return; // эта строка появилась после возникновения ошибки в TreeGridLayout
					
 					var bounds = {};
					if(target.cached_bounds) {
						bounds = target.cached_bounds;
					}
					else {
						var offset = target.el.offset();
						var w = target.el.width();
						var h = target.el.height();
						bounds.left = offset.left;
						bounds.top = offset.top;
						bounds.right = offset.left + w;
						bounds.bottom = offset.top + h;						
					}
					if(e.pageX >= bounds.left && e.pageX < bounds.right && e.pageY >= bounds.top && e.pageY < bounds.bottom) 
						target.states.set('hover');
					else
						target.states.clear('hover');
						
					target.cached_bounds = bounds;
				});
				
//				Dino.each(Dino.droppableList, function(target){
//					var bounds = {};
//					if(target.cached_bounds) {
//						bounds = target.cached_bounds;
//					}
//					else {
//						var offset = target.el.offset();
//						var w = target.el.width();
//						var h = target.el.height();
//						bounds.left = offset.left;
//						bounds.top = offset.top;
//						bounds.right = offset.left + w;
//						bounds.bottom = offset.top + h;						
//					}
//					if(e.pageX >= bounds.left && e.pageX < bounds.right && e.pageY >= bounds.top && e.pageY < bounds.bottom) 
//						target.states.set('hover');
//					else
//						target.states.clear('hover');
//						
//					target.cached_bounds = bounds;
//				});
				
			}
			
		});
					
		Dino.Draggable.dragPane.el/*$('body')*/.mouseup(function(e){
			
			// отсоединяем прозрачную панель от страницы
			Dino.Draggable.dragPane.el.detach();
//			Dino.dragPane.addClass('hidden');
			
			var drag = Dino.drag;		
			
			if(drag && drag.started) {
				// уничтожаем прокси-объект
				if(drag.proxy) drag.proxy.destroy();
				
				// ищем цель переноса под курсором (если виджет имеет опцию dropTarget)
				var target = $(document.elementFromPoint(e.clientX, e.clientY));//e.originalTarget);
//				var w = target.dino();
//				if(!w || !Dino.droppable){
//				var path = target.parents().andSelf();
				var path = [];
				target.parents().andSelf().each(function(i, el){	path.push(el);	});
				target = null;
				Dino.each(path.reverse(), function(el){
					var w = $(el).dino();
					if(w && w.states.is('droppable')) {
						target = w;
						return false;
					}					
				});
//				}
				
				if(target) target.events.fire('onDrop', {source: drag.source});			
			}
			
			Dino.drag = null;
			$('.droppable:visible').each(function(i, el){
				var target = $(el).dino();
				if(target) {
					delete target['cached_bounds'];
					target.states.clear('hover');					
				}
			});
			
//			Dino.each(Dino.droppableList, function(tgt){ delete tgt['cached_bounds']; tgt.states.clear('hover'); });
		});	
		
	}
	
	
};


Dino.Draggable.dragReady = false;
Dino.Draggable.dragPane = null;




Dino.Droppable = function() {
	this.states.set('droppable');
//	this.droppable = true;
//	Dino.droppableList.push(this);
}

Dino.Clickable = function(o) {
	
	Dino.utils.overrideOpts(o, {events: {
		'click': function(e, w) {
			w.events.fire('onClick');
		},
		'dblclick': function(e, w) {
			w.events.fire('onDoubleClick');
		}
	}});
	
}





Dino.RClickable = function(o) {
	
	Dino.utils.overrideOpts(o, {events: {
		'mousedown': function(e, w) {
			// если нажата правая кнопка мыши
			if(e.button == 2) {
				Dino.RClickable.click_timestamp = Dino.timestamp();
			}
		},
		'mouseup': function(e, w) {
			// если отпущена правая кнопка мыши
			if(e.button == 2) {
				var t = Dino.timestamp()
				if(t - Dino.RClickable.click_timestamp < 200) {
					w.events.fire('onClick', {button: 2});					
				}
			}			
		},
		'contextmenu': function(e) {
			return false;
		}
	}});
	
}


Dino.RClickable.click_timestamp = 0;

Dino.Focusable = function(o) {
	
	this.setFocus = function() {
		Dino.Focusable.focusManager.enter(this);		
	};
	
	this.hasFocus = function() {
		return Dino.Focusable.focusManager.current == this;
	};
	
	this.clearFocus = function() {
		Dino.Focusable.focusManager.clear(this);
	}
	
	var self = this;
	this.el.click(function(e) {
		self.setFocus();
		e.stopPropagation();
	});
	
	o.focusable = true;
}



Dino.Focusable.focusManager = {
	
	current: null,
	
	enter: function(w) {
		if(this.current == w) return;
		if (this.current) {
			this.current.states.clear('focus');
		}
		this.current = w;
		w.states.set('focus');
		w.events.fire('onFocus');
	},
	
	clear: function() {
		this.current = null;
	},
	
	leave: function() {
		if(this.current) this.current.states.clear('focus');
		this.current = null;		
	},
	
	input: function(e) {
		if(this.current) this.current.events.fire('onKeyDown', {keyCode: e.keyCode}, e);
		if(e.keyCode == 27) this.leave();
	}
	
}


$(window).click(function(e){
	// убираем фокус по щелчку левой кнопкой мыши
	if(e.button == 0) Dino.Focusable.focusManager.leave();
});

$(window).bind('keypress', function(e){
	Dino.Focusable.focusManager.input(e);
});



Dino.declare('Dino.widgets.ComboField', 'Dino.Widget', {
	
	$html: function() {return '<div/>';},
	
	defaultOptions: {
		cls: 'dino-combo-field',
		layout: 'hbox',
    components: {
      input: {
        dtype: 'input',
				width: 'auto'
      }
    }		
	}
	
}, 'combo-field');





Dino.declare('Dino.widgets.Input', 'Dino.Widget', /** @lends Dino.widgets.form.InputField.prototype */{
	
	defaultOptions: {
		html: '<input type="text"></input>'
	},
	
	$opt: function(o) {
		Dino.widgets.Input.superclass.$opt.call(this, o);
		
		if('text' in o) this.el.val(o.text);
		if('readOnly' in o) this.el.attr('readonly', o.readOnly);
		if('name' in o) this.el.attr('name', o.name);
		if('value' in o) this.el.attr('value', o.value);
		if('disabled' in o) this.el.attr('disabled', o.disabled);
		if('tabindex' in o) this.el.attr('tabindex', o.tabindex);

/*
		var self = this;
		
		if(o.changeOnBlur) {
			this.el.blur(function() { 
				self.setValue(self.el.val(), 'blur'); 
			});			
		}
		
		if(o.rawValueOnFocus){
			this.el.focus(function() { self.hasFocus = true; self.el.val(self.getRawValue()) });
			this.el.blur(function() { self.hasFocus = false; self.el.val(self.getValue()) });
		}
*/		
	},
	
	$events: function(self) {
		Dino.widgets.Input.superclass.$events.call(this, self);

		this.el.keydown(function(e) {
			if(!self.options.readOnly) {
				if(e.keyCode == 13) 
					self.setValue( self.el.val(), 'enterKey');
				else if(e.keyCode == 27) 
					self.el.val(self.getValue());				
			}
		});
		
//		this.el.change(function() {
//			self.setValue( self.el.val());
//		});
	}
	
//	$dataChanged: function() {
//		Dino.widgets.Input.superclass.$dataChanged.apply(this);
//		
//		if(this.options.rawValueOnFocus && this.hasFocus) 
//			this.el.val( this.getRawValue() );
//		else
//			this.el.val( this.getValue() );
//	}
	
	
	
});




Dino.declare('Dino.widgets.TextInput', 'Dino.widgets.Input', /** @lends Dino.widgets.form.PasswordField.prototype */{

	$opt: function(o) {
		Dino.widgets.TextInput.superclass.$opt.call(this, o);
		
		var self = this;
		
		if(o.changeOnBlur) {
			this.el.blur(function() { 
				self.setValue(self.el.val(), 'blur'); 
			});			
		}
		
		if(o.rawValueOnFocus){
			this.el.focus(function() { self.hasFocus = true; self.el.val(self.getRawValue()); self.states.set('raw-value'); });
			this.el.blur(function() { self.hasFocus = false; self.el.val(self.getValue()); self.states.clear('raw-value'); });
		}

//		if(o.initText){
//			this.el.focus(function() { self.hasFocus = true; self.el.val(self.getRawValue()) });
//			this.el.blur(function() { self.hasFocus = false; self.el.val(self.getValue()) });
//		}
		
	},
		
	$dataChanged: function() {
		Dino.widgets.TextInput.superclass.$dataChanged.apply(this);
		
		if(this.options.rawValueOnFocus && this.hasFocus) 
			this.el.val( this.getRawValue() );
		else
			this.el.val( this.getValue() );
	}	
		
}, 'input');




/**
 * Поле текстового ввода
 * 
 * @class
 * @name Dino.widgets.form.PasswordField
 * @extends Dino.widgets.form.InputField
 */
Dino.declare('Dino.widgets.Password', 'Dino.widgets.TextInput', /** @lends Dino.widgets.form.PasswordField.prototype */{
	
	defaultOptions: {
		html: '<input type="password"></input>'
	}
		
}, 'password');


Dino.declare('Dino.widgets.Submit', Dino.widgets.Input, {
	
	defaultOptions: {
		html: '<input type="submit"></input>'
	},
	
	$init: function(o) {
		Dino.widgets.Submit.superclass.$init.call(this, o);
		
		var self = this;
		
		this.el.click(function(e){
			self.events.fire('onAction', {}, e);
		});
		
//		var button_type = this.options.buttonType || 'button';// ('buttonType' in this.options) this.el.attr('type', this.options.buttonType);
//		this.el.attr('type', button_type);
		
	}
	
}, 'submit');


/**
 * Файл
 *
 * @class
 * @name Dino.widgets.form.File
 * @extends Dino.widgets.form.InputField
 */
Dino.declare('Dino.widgets.File', Dino.widgets.TextInput, {
	
	defaultOptions: {
		html: '<input name="file-input" type="file"></input>'
	},
	
	$opt: function(o) {
		Dino.widgets.File.superclass.$opt.call(this, o);

		if('name' in o) this.el.attr('name', o.name);
	}
	
}, 'file');


/**
 * Radio
 * 
 * @class
 * @name Dino.widgets.form.Radio
 * @extends Dino.widgets.form.InputField
 */
Dino.declare('Dino.widgets.Radio', Dino.widgets.Input, /** @lends Dino.widgets.form.Radio.prototype */{
	
	defaultOptions: {
		html: '<input type="radio"></input>'
	}
	
}, 'radio');


/**
 * Checkbox
 * 
 * @class
 * @name Dino.widgets.form.Checkbox
 * @extends Dino.widgets.form.InputField
 */
Dino.declare('Dino.widgets.Checkbox', Dino.widgets.Input, /** @lends Dino.widgets.form.Checkbox.prototype */{
	
	defaultOptions: {
		html: '<input type="checkbox"></input>'
	},
	
	$events: function(self) {
//		Dino.widgets.form.Checkbox.superclass.$events.call(this, self);
		this.el.change(function(){
			self.setValue(self.el.attr('checked') ? true : false);
			self.events.fire('onAction');
		});
	},
	
	
	$opt: function(o) {
		Dino.widgets.Checkbox.superclass.$opt.apply(this, arguments);
		
		if('checked' in o)
			this.el.attr('checked', o.checked);	
	},
	
	$dataChanged: function() {
		Dino.widgets.Checkbox.superclass.$dataChanged.apply(this);
		this.el.attr('checked', this.getValue() );
	},
	
	isChecked: function() {
		return this.el.attr('checked');
	}
	
		
}, 'checkbox');





/**
 * TextArea
 * 
 * @class
 * @name Dino.widgets.form.TextArea
 * @extends Dino.widgets.form.TextField
 */
Dino.declare('Dino.widgets.TextArea', Dino.widgets.TextInput, /** @lends Dino.widgets.form.TextArea.prototype */{
	
	defaultOptions: {
		html: '<textarea></textarea>'
	}
	
}, 'textarea');



/**
 * @class
 * @name Dino.widgets.form.Label
 * @extends Dino.Widget
 */
Dino.declare('Dino.widgets.Label', Dino.Widget, /** @lends Dino.widgets.form.Label.prototype */{

	$html: function() { return '<label></label>'; },
	
	$opt: function(o) {
		Dino.widgets.Label.superclass.$opt.call(this, o);
		
		if('text' in o)
			this.el.text(o.text);
		if('forName' in o)
			this.el.attr('for', o.forName);
	},
	
	$dataChanged: function() {
		this.el.text(this.getValue());		
	}
	
}, 'label');



/**
 * @class
 * @name Dino.widgets.form.Anchor
 * @extends Dino.Widget
 */
Dino.declare('Dino.widgets.Anchor', 'Dino.Widget', /** @lends Dino.widgets.form.Anchor.prototype */{
	
	$html: function() { return '<a href="#" click="return false" />'; },
	
	$init: function(o) {
		Dino.widgets.Anchor.superclass.$init.call(this, o);
		
		var self = this;
		
		this.el.click(function(e){
			self.events.fire('onAction', {}, e);
		});		
	},
	
	$opt: function(o) {
		Dino.widgets.Anchor.superclass.$opt.call(this, o);
		
		if('text' in o)
			this.el.text(o.text);
	},
	
	$dataChanged: function() {
		this.el.attr('href',this.getValue());
//		this.el.text(this.getValue());
	}	
	
}, 'anchor');





/**
 * @class
 * @name Dino.widgets.form.SelectOption
 * @extends Dino.Widget
 */
Dino.declare('Dino.widgets.SelectOption', 'Dino.Widget', /** @lends Dino.widgets.form.SelectOption.prototype */{
	
	$html: function() { return '<option/>'; },
	
	$opt: function(o) {
		Dino.widgets.SelectOption.superclass.$opt.apply(this, arguments);
		
		if('value' in o) this.el.attr('value', o.value);
		if('text' in o) this.el.text(o.text);
	}
	
}, 'select-option')



/**
 * @class
 * @name Dino.widgets.form.Select
 * @extends Dino.Container
 */
Dino.declare('Dino.widgets.Select', 'Dino.Container', /** @lends Dino.widgets.form.Select.prototype */{
	$html: function() { return '<select/>'; },
	
	defaultOptions: {
		components: {
			optionsList: {
				dtype: 'container',
				defaultItem: {
					dtype: 'select-option'
				}
			}
		},
		optionsKey: 0,
		optionsValue: 1
	},
	
	$init: function(o) {
		Dino.widgets.Select.superclass.$init.call(this, o);
		
		o.components.optionsList.layout = new Dino.layouts.InheritedLayout({parentLayout: this.layout });
		
		if('options' in o) {
			var items = [];
			var opt_key = o.optionsKey; 
			var opt_val = o.optionsValue;
			for(var i = 0; i < o.options.length; i++) {
				var opt = o.options[i];
				if(Dino.isArray(opt) || Dino.isPlainObject(opt))
					items.push({ value: opt[opt_key], text: opt[opt_val] });
				else
					items.push({ value: i, text: opt });				
			}
			o.components.optionsList.items = items;
		}
	},
	
	
	$opt: function(o) {
		Dino.widgets.Select.superclass.$opt.call(this, o);
/*		
		if('options' in o){
			this.el.empty();
			for(var i in o.options){
				var option_el = $('<option/>');
				option_el.attr('value', i);
				option_el.text(o.options[i]);
				this.el.append(option_el);
			}
		}
*/		
		if('disabled' in o) this.el.attr('disabled', o.disabled);
		
	},
	
	$events: function(self) {
		Dino.widgets.Select.superclass.$events.call(this, self);
		
		this.el.change(function() { self.setValue( self.el.val() ); });
	},
	
	$dataChanged: function() {
		Dino.widgets.Select.superclass.$dataChanged.call(this);
		this.el.val( this.getValue() );
	}
	
}, 'select');





Dino.declare('Dino.widgets.Text', 'Dino.Widget', {
	
	defaultOptions: {
		html: '<span/>'
	},
	
	$opt: function(o) {
		Dino.widgets.Text.superclass.$opt.apply(this, arguments);
		
		if('text' in o) {
			(o.text) ? this.el.text(o.text) : this.el.html('&nbsp;');
		}
	},
	
	$dataChanged: function() {
		Dino.widgets.Text.superclass.$dataChanged.apply(this, arguments);
		this.el.text( this.getValue() );
//		this.states.set( this.getStateValue() );
	},
	
	getText: function() {
		return this.el.text();
	}
		
}, 'text');







Dino.widgets.Button = Dino.declare('Dino.widgets.Button', 'Dino.Widget', /** @lends Dino.widgets.Button.prototype */{
	
	$html: function() { return '<button type="button"/>'; },
	
	
	$init: function() {
		Dino.widgets.Button.superclass.$init.apply(this, arguments);

		var self = this;
		
		this.el.click(function(e){
			self.events.fire('onAction', {}, e);
		});		
		
	},
	
	
	$opt: function(o) {
		Dino.widgets.Button.superclass.$opt.apply(this, arguments);

		if('buttonType' in o)
			this.el.attr('type', o.buttonType);
		if('disabled' in o){
			(o.disabled) ? this.el.attr('disabled', 'disabled') : this.el.removeAttr('disabled');
		}
	}

}, 'button');





/**
 * Изображение.
 * 
 * @class
 * @extends Dino.Widget
 */
Dino.widgets.Image = Dino.declare('Dino.widgets.Image', Dino.Widget, /** @lends Dino.widgets.Image.prototype */{
	
	$html: function() { return '<img></img>';},
	
	$opt: function(o) {
		Dino.widgets.Image.superclass.$opt.call(this, o);
		
		if('imageUrl' in o) this.el.attr('src', o.imageUrl);
	},
	
	$dataChanged: function() {
		this.el.attr( 'src', this.getValue() );
	}
	
	
}, 'image');







/**
 * Изображение, загружаемое асинхронно.
 * 
 * Как правило используется в тех случаях, огда заранее неизвестны размеры изображения
 *
 * @class
 * @extends Dino.Widget
 */
Dino.utils.AsyncImage = Dino.declare('Dino.utils.AsyncImage', Dino.Widget, /** @lends Dino.utils.AsyncImage.prototype */{
	
	$html: function() { return '<div></div>';},
	
	$init: function(o) {
		Dino.utils.AsyncImage.superclass.$init.call(this, o);
		
		this.load(o.imageUrl, o.renderTo, o.stub, o.maxWidth, o.maxHeight);
		
//		delete o.renderTo;
	},
	
	
	load: function(url, target, stubObj, maxWidth, maxHeight) {
		
		if(url){
			// ставим заглушку на место, куда будет помещено загруженное изображение
//			if(target && stubObj)
//				stubObj.render(target);
			
			// проверяем, есть ли хранилище изображений на странице, и, если его нет, то создаем новое
			var storeEl = $('#image-loader-store');
			if(storeEl.length == 0){
				storeEl = $('<div id="image-loader-store" style="width:0;height:0;position:absolute"></div>');
				$('body').append(storeEl);
			}
			
			var el = $('<img></img>'); //this.el;
			var self = this;
	
			el.css({'width':'', 'height': '', 'display': 'none'});
			storeEl.append(el);
			
			// добавляем единовременный перехват события загрузки изображения
			el.one('load', function(){
				
				var w = self.options.width;//.el.width(); 
				var h = self.options.height;//.el.height();
		
//				if(maxWidth){
					w = Math.min(w, el.width());
					h = Math.min(h, el.height());
//				}
//				else{
//					w = self.el.width();
//					h = self.el.height();
//				}
				
				var sx = w / el.width();
				var sy = h / el.height();
				
				if(sx < sy) 
					el.width(w); 
				else
					el.height(h); 

				el.css({'display': ''});
				
				self.el.replaceWith(el);
				self.el = el;
//				if(target && stubObj)
//					stubObj.el.replaceWith(el);
				
				self.events.fire('onComplete');
			});
		
			el.attr('src', url);
		}
	
	},
	
	$dataChanged: function() {
		var o = this.options;
		this.load(this.getValue(), o.renderTo, o.stub, o.maxWidth, o.maxHeight);
	}
	
	
	
	
}, 'async-image');




//Dino.constants.ICON_16 = 16;


/**
 * @class
 * @extends Dino.Widget
 */
Dino.widgets.Icon = Dino.declare('Dino.widgets.Icon', Dino.Widget, /** @lends Dino.widgets.Icon.prototype */{
	
	defaultCls: 'dino-icon',
	
	$html: function() { return '<div/>'; }
	
	
}, 'icon');





Dino.widgets.ActionIcon = Dino.declare('Dino.widgets.ActionIcon', 'Dino.widgets.Icon', {

//	defaultCls: 'dino-action-icon',
	
	defaultOptions: {
		opacity: .7,
		states: {
			'hover': function(is_set) {
				this.opt('opacity', is_set ? 1 : .7);
			}
		},
		events: {
			'click': function(e, w){
				w.events.fire('onAction');
			}
		}
		
	}
	
}, 'action-icon');





/**
 * @class
 * @extends Dino.widgets.Icon
 */
Dino.widgets.PulseIcon = Dino.declare('Dino.widgets.PulseIcon', 'Dino.widgets.Icon', /** @lends Dino.widgets.PulseIcon.prototype */{
	
	defaultCls: 'dino-pulse-icon',
	
	defaultOptions: {
		pulseDelay: 200,
		components: {
			image: {
				dtype: 'image'
			}
		}
	},
	
	
	$events: function(self) {
		Dino.widgets.PulseIcon.superclass.$events.apply(this, arguments);
		
		this.image.el.bind('mouseenter', function(){
			$(this).clearQueue();
			$(this).animate({'width': self.maxW, 'height': self.maxH, 'left': 0, 'top': 0}, self.options.pulseDelay, function(){ 
				self.events.fire('onAfterPulseUp'); 
			});
		});
		
		this.image.el.bind('mouseleave', function(e){
			var o = self.options;
			var event = new Dino.events.CancelEvent({}, e);
			self.events.fire('onBeforePulseDown', event);
			
			if(!event.isCanceled) self.pulseDown();
		});
		
	},
	
	$opt: function(o){
		Dino.widgets.PulseIcon.superclass.$opt.apply(this, arguments);
		
		if('imageUrl' in o) this.image.el.attr('src', o.imageUrl);
		if(!('imageHeight' in o)) o.imageHeight = o.imageWidth;
		if(!('imageWidth' in o)) o.imageWidth = o.imageHeight;

		this.maxW = o.imageWidth * o.pulseValue;
		this.maxH = o.imageHeight * o.pulseValue;
		this.dx = (this.maxW - o.imageWidth)/2;
		this.dy = (this.maxH - o.imageHeight)/2;
		
		this.el.css({'width': this.maxW, 'height': this.maxH});
		
		this.image.opt({'width': o.imageWidth, 'height': o.imageHeight, 'x': this.dx, 'y': this.dy});
	},
	
	pulseDown: function(){
		var o = this.options;
		this.image.el.animate({'width': o.imageWidth, 'height': o.imageHeight, 'left': this.dx, 'top': this.dy}, o.pulseDelay);
	}
	
	
}, 'pulse-icon');




/**
 * @class
 * @extends Dino.Widget
 */
Dino.widgets.Uploader = Dino.declare('Dino.widgets.Uploader', 'Dino.Widget', /** @lends Dino.widgets.Uploader.prototype */{
	
	defaultOpions: {
		components: {
			'content': {
				dtype: 'text',
				text: 'Upload'
			}
		}
	},
	
	$html: function() { return '<div class="dino-uploader"></div>' },
	
	$init: function() {
		Dino.widgets.Uploader.superclass.$init.apply(this, arguments);
		
		var self = this;
		
		var init_file = function() {
			
			var fileId = 'file-' + Dino.timestamp();
			
			self.addComponent('file', {
				dtype: 'file',
				opacity: 0,
				id: fileId,
				name: 'file'
			});
			
			self.file.el.change(function(e){
								
				if($(this).val() != '/') {
				
					$.ajaxFileUpload({
						url: self.options.url,
						fileElementId: fileId,
						dataType: 'text',
						success: function(data, status) { 
							self.events.fire('onComplete', {'data':data});
							$('#'+fileId).remove();
							init_file();
						},
						error: function(data, status, err) { 
							self.events.fire('onError', {'data': data, 'message': err}); 
							$('#'+fileId).remove();
							init_file();
						}
					});
					
					self.events.fire('onLoad');
				
				}
			});
			
			
		}
		
		init_file();
		
	}
	
	
	
}, 'uploader');

/**
 * @class
 * @extends Dino.Widget
 */
Dino.widgets.TextItem = Dino.declare('Dino.widgets.TextItem', 'Dino.Widget', /** @lends Dino.widgets.TextItem.prototype */{
	
	$html: function() { return '<span></span>'; },	
	
	defaultOptions: {
		cls: 'dino-text-item',
//		layout: 'dock',
		layout: 'hbox',
		components: {
			leftIcon: {
				dtype: 'icon',
				dock: 'left'
			},
			content: {
				dtype: 'text'
			},
			rightIcon: {
				dtype: 'icon',
				dock: 'right'
			}
		},
		// Финт ушами.Такой способ обработки событий занимает меньше места, чем метод $events
		events: {
			'click': function() {
				$(this).dino().events.fire('onAction');
			}
		},
//		editor: {
//			dtype: 'input',
//			events: {
//				'blur': function(e, w) { w.parent.stopEdit(); }
//			},
//			onValueChanged: function() {
//				this.parent.stopEdit();
//			}
//		},
		text: ''
//		showText: true
	},

	$init: function(o) {
		Dino.widgets.TextItem.superclass.$init.apply(this, arguments);
		
		var key_a = [];
		if(o.icon) key_a.push('icon');
		if(o.text || o.text === '') key_a.push('text');
		if(o.xicon) key_a.push('xicon');
		
		
		var o_mod = {leftIcon:{}, content:{}, rightIcon:{}};
		
		switch(key_a.join('-')) {
			case 'icon':
				o_mod.rightIcon.state = 'hidden';
				o_mod.leftIcon.dock = 'center';
				o_mod.content.innerHtml = '&nbsp;';
				o_mod.content.cls = 'l-icon-only';
				break;
			case 'text':
				o_mod.leftIcon.state = 'hidden';
				o_mod.rightIcon.state = 'hidden';
				break;
			case 'xicon':
				o_mod.leftIcon.state = 'hidden';
				o_mod.rightIcon.dock = 'center';
				o_mod.content.innerHtml = '&nbsp;';
				o_mod.content.cls = 'r-icon-only';
				break;
			case 'icon-text':
				o_mod.rightIcon.state = 'hidden';
				o_mod.content.cls = 'l-icon';
				break;
			case 'text-xicon':
				o_mod.leftIcon.state = 'hidden';
				o_mod.content.cls = 'r-icon';				
				break;
			case 'icon-xicon':
				o_mod.content.cls = 'l-icon r-icon';				
				o_mod.content.innerHtml = '&nbsp;';
				break;
			case 'icon-text-xicon':
				o_mod.content.cls = 'l-icon r-icon';
				break;
		}
		
		
		Dino.utils.overrideOpts(o.components, o_mod);
		
//		console.log();
		
	},
	
	$opt: function(o) {
		Dino.widgets.TextItem.superclass.$opt.apply(this, arguments);
		
		if('text' in o) {
			this.content.opt('text', o.text);
//			(o.text) ? this.content.opt('innerText', o.text) : this.content.opt('innerHtml', '&nbsp;');
		}
		if('textFormat' in o) this.content.opt('format', o.textFormat);
		
		if('icon' in o) 
			this.leftIcon.states.setOnly(o.icon);
		if('xicon' in o) {
			this.rightIcon.states.setOnly(o.xicon);
		} 
			
		
/*		
		if('pattern' in o) {
			
			
			switch(o.pattern) {
				case 'icon':
					this.content.states.set('l-icon-only');
					this.leftIcon.states.clear('hidden', !o.showLeftIcon);					
					break;
				case 'text':
					break;
				case 'xicon':
					break;
				case 'icon-text':
					break;
				case 'text-xicon':
					break;
				case 'icon-xicon':
					break;
				case 'icon-text-xicon':
					break;
			}
		}
*/		
/*		
		if('showLeftIcon' in o) {
			var state = (this.options.text) ? 'l-icon' : 'l-icon-only';
			this.content.states.toggle(state, o.showLeftIcon);
			this.leftIcon.states.toggle('hidden', !o.showLeftIcon);
			
//			// экспериментальный код
//			var dock = (this.options.text) ? 'left' : 'center';
//			if(this.leftIcon.options.dock != dock) {
//				this.leftIcon.opt('dock', dock);
//				this.layout.insert(this.leftIcon);
//			}
		}
		if('showRightIcon' in o) {
			var state = (this.options.text) ? 'r-icon' : 'r-icon-only';
			this.content.states.toggle(state, o.showRightIcon);
			this.rightIcon.states.toggle('hidden', !o.showRightIcon);
//			this.content.rightIcon.states.toggle('hidden', !(o.showRightIcon || false));

//			// экспериментальный код
//			var dock = (this.options.text) ? 'right' : 'center';
//			if(this.rightIcon.options.dock != dock) {
//				this.rightIcon.opt('dock', dock);
//				this.layout.insert(this.rightIcon); 				
//			}
		}
*/		
//		if('showCenterIcon' in o) {
			
//		}
		
		
		//WARN экспериментальный код
//		if(!o.showText) {
//			this.content.opt('innerHtml', '&nbsp;');
//		}
	},
	
	getText: function() {
		return this.content.getText();
	}
	
/*	
	startEdit: function() {
		this.content.states.set('hidden');			
		this.addComponent('_editor', this.options.editor);
		
		if(this.options.showLeftIcon) this._editor.el.addClass('l-icon');
		if(this.options.showRightIcon) this._editor.el.addClass('r-icon');
		
		this._editor.$bind(this.content.data);
		this._editor.$dataChanged(); // явно вызываем обновление данных
		this._editor.el.focus();
		this._editor.el.select();
	},
	
	stopEdit: function() {
		this.removeComponent('_editor');
		this.content.$dataChanged(); // явно вызываем обновление данных
		this.content.states.clear('hidden');
		this.events.fire('onEdit');
	}	
*/	
	
	
}, 'text-item');

/**
 * @class
 * @extends Dino.Widget
 */
Dino.widgets.Table = Dino.declare('Dino.widgets.Table', 'Dino.Widget', /** @lends Dino.widgets.Table.prototype */{
	
	defaultOptions: {
		components: {
//			colgroup: {
//				dtype: 'box',
//				wrapEl: '<colgroup></colgroup>',
//				defaultItem: {
//					dtype: 'box',
//					wrapEl: '<col></col>'
//				}
//			},
			head: {
				dtype: 'box',
				wrapEl: '<thead></thead>',
				defaultItem: {
					dtype: 'box',
					wrapEl: '<tr></tr>',
					defaultItem: {
						dtype: 'table-header-cell'
//						wrapEl: '<th></th>'
					}
				},
				binding: false
			},
			body: {
				dtype: 'box',
				dynamic: true,
				wrapEl: '<tbody></tbody>',
				defaultItem: {
					dtype: 'table-row'
				}
			}
		},
		tableModel: {
			row: {},
			cell: {},
//			header: {},
			columns: []
		},
		headerModel: {
			row: {},
			cell: {},
			columns: []
		}
	},
	
	$html: function() { return '<table cellspacing="0" cellpadding="0" border="0"></table>'; },

	
	$init: function() {
		Dino.widgets.Table.superclass.$init.apply(this, arguments);
		
		var o = this.options;
		
		var h_columns = o.headerModel.columns;
		var columns = o.tableModel.columns;
		var g_columns = [];
		
		
		
//		for(var i = 0; i < h_columns.length; i++) {
//			var col = {}
//			if('width' in h_columns[i]) col.width = h_columns[i].width;
//			g_columns[i] = col;
//		}
//		
//		
//		for(var i = 0; i < columns.length; i++) {
//			var col = {}
//			if('width' in columns[i]) col.width = columns[i].width;
//			g_columns[i] = col;
//		}
//		
//		
//		
//		Dino.utils.overrideOpts(
//				o.components.colgroup, 
//				{items: g_columns}
//				);
		
		
		Dino.utils.overrideOpts(
				o.components.body.defaultItem, 
				o.tableModel.row, 
				{defaultItem: o.tableModel.cell},
				{items: columns}
				);
		
		Dino.utils.overrideOpts(
				o.components.head.defaultItem, 
				o.headerModel.row,
				{defaultItem: o.headerModel.cell},
				{items: h_columns}
				);
		
		o.components.head.items = [{}];
		
	},
	
	
	_updateEvenOdd: function() {
		var i = 0;
		$('tr:visible', this.body.el).each(function(i, el){
			if(i%2)
				$(el).removeClass('even').addClass('odd');
			else
				$(el).addClass('even').removeClass('odd');
		});
	},
	
	eachRow: function(callback) {
		this.body.eachItem(callback);
	},
	
	getRow: function(i) {
		return this.body.getItem(i);
	}
	
	
//	$opt: function(o) {
//		Dino.containers.Table.superclass.$opt.call(this, o);
//		
//		
//	}
	
	
}, 'table');



/**
 * @class
 * @extends Dino.Container
 */
Dino.widgets.TableRow = Dino.declare('Dino.widgets.TableRow', 'Dino.Container', /** @lends Dino.widgets.TableRow.prototype */{
	
	$html: function() { return '<tr></tr>'; },
	
	defaultOptions: {
		defaultItem: {
			dtype: 'table-cell'
		}
	},
	
	getTable: function() {
		return this.el.parents('table').dino(); 
		//TODO хотя здесь можно сделать быстрее
//		return this.getParent().getParent();
	},
	
	getColumn: function(i) {
		return this.getItem(i);
	}
	
	
}, 'table-row');




/**
 * @class
 * @extends Dino.Widget
 */
Dino.widgets.TableCell = Dino.declare('Dino.widgets.TableCell', 'Dino.Widget', /** @lends Dino.widgets.TableCell.prototype */{
	
	$html: function() { return '<td></td>'; },
	
	defaultOptions: {
//		binding: 'skip'		
	},
		
	$dataChanged: function() {
		
		if(this.options.binding == 'auto')
			this.layout.el.text( this.getValue() );
		
		Dino.widgets.TableCell.superclass.$dataChanged.apply(this);
	},
	
	getRow: function() {
		return this.parent;
	}
	
//	startEdit: function() {
//		
//		this.layout.el.empty(); //FIXME на соотв. метод компоновки
//		
//		this.addComponent('_editor', this.options.editor);
//		
//		var dw = this._editor.el.outerWidth(true) - this._editor.el.width();
//		var w = this._editor.el.parent().width();
//		this._editor.el.width(w - dw);
//
//		var dh = this._editor.el.outerHeight(true) - this._editor.el.height();
//		var h = this._editor.el.parent().height();
//		this._editor.el.height(h - dh);
//
//		this._editor.$bind(this.data);
//		this._editor.$dataChanged(); // явно вызываем обновление данных
//		this._editor.el.focus();
//		this._editor.el.select();
//	},
//	
//	stopEdit: function() {
//		this.removeComponent('_editor').destroy(); // удаляем и уничтожаем компонент
//		this.$dataChanged(); // явно вызываем обновление данных
//		this.events.fire('onEdit');
//	}	
	
	
}, 'table-cell');



/**
 * @class
 * @extends Dino.Widget
 */
Dino.widgets.TableHeaderCell = Dino.declare('Dino.widgets.TableHeaderCell', 'Dino.Widget', /** @lends Dino.widgets.TableHeaderCell.prototype */{
	
	$html: function() { return '<th></th>'; },
	
	defaultOptions: {
		binding: 'skip'
	},
	
	$opt: function(o) {
		Dino.widgets.TableHeaderCell.superclass.$opt.apply(this, arguments);
		
		if('text' in o) this.layout.el.text(o.text);
		
	},
	
	
	$dataChanged: function() {
		
		if(this.options.binding == 'auto')
			this.layout.el.text( this.getValue() );
		
		Dino.widgets.TableCell.superclass.$dataChanged.apply(this);
	}
	
}, 'table-header-cell');








/**
 * @class
 * @extends Dino.containers.Box
 */
Dino.widgets.Pager = Dino.declare('Dino.widgets.Pager', 'Dino.containers.Box', /** @lends Dino.widgets.Pager.prototype */{
	
	defaultOptions: {
		cls: 'dino-pager',
//		style: {'display': 'inline-block'},
		binding: false,
		count: 1,
		items: [{
			dtype: 'icon-button',
//			cls: 'dino-corner-all dino-border-none',
			icon: 'dino-icon-pager-first', //'led-icon-control-rewind',
			onAction: function() {
				this.parent.setIndex(0);
			}
		}, {
			dtype: 'icon-button',
//			cls: 'dino-corner-all dino-border-none',
			icon: 'dino-icon-pager-prev', //'led-icon-control-backward',
			onAction: function() {
				this.parent.setIndex(this.parent.getIndex()-1);
			}
		}, {
			dtype: 'split',
			width: 2
		}, {
			dtype: 'text',
			innerText: 'Страница'
		}, {
			dtype: 'input',
			width: 30,
			tag: 'current_page',
			value: '1',
			events: {
				'change': function(e, w) {
					w.parent.setIndex(w.el.val()-1);
				}
			}
		}, {
			dtype: 'text',
			tag: 'num_pages',
			innerText: 'из 10'
		}, {
			dtype: 'split',
			width: 2
		}, {
			dtype: 'icon-button',
//			cls: 'dino-corner-all dino-border-none',
			icon: 'dino-icon-pager-next', //'led-icon-control-play',			
			onAction: function() {
				this.parent.setIndex(this.parent.getIndex()+1);
			}
		}, {
			dtype: 'icon-button',
//			cls: 'dino-corner-all dino-border-none',
			icon: 'dino-icon-pager-last', //'led-icon-control-fastforward',			
			onAction: function() {
				this.parent.setIndex(this.parent.getMaxIndex());
			}
		}/*, {
			dtype: 'split',
			width: 2
		}, {
			dtype: 'icon-button',
			cls: 'dino-corner-all dino-border-none',
			icon: 'led-icon-refresh',
			onAction: function() {
				this.parent.events.fire('onRefresh');
			}
		}*/]
	},
	
	
	
	$init: function(o) {
		Dino.widgets.Pager.superclass.$init.apply(this, arguments);
		
		this.total_size = this.offset = 0;
		this.page_size = 1;
	},
	
	$opt: function(o) {
		Dino.widgets.Pager.superclass.$opt.apply(this, arguments);
		
		if('pageSize' in o){
			this.page_size = o.pageSize || 1;
		} 
		if('count' in o){
			this.setCount(o.count);
		}
		
	},
	
	
	setCount: function(count) {
		this.total_size = count;
		this.getItem('num_pages').opt('innerText', 'из ' + Math.ceil(this.total_size/this.page_size));		
	},
	
	getCount: function() {
		return this.total_size;
	},
		
	setIndex: function(i) {
		
		var i0 = i*this.page_size;
		var i1 = Math.min( (i+1)*this.page_size, this.total_size );
		
		if(i0 >= 0 && i0 < this.total_size){
			this.offset = i0;
			this.getItem('current_page').opt('value', i+1);
			this.events.fire('onIndexChanged', {from: i0, to: i1});
			return true;
		}
		return false;
	},
	
	getIndex: function() {
		return this.offset/this.page_size;
	},
	
	getMaxIndex: function() {
		return Math.ceil(this.total_size/this.page_size)-1;
	}
	
	
}, 'pager');

/**
 * @class
 * @extends Dino.containers.Box
 */
Dino.widgets.LoadingBox = Dino.declare('Dino.widgets.LoadingBox', 'Dino.containers.Box', /** @lends Dino.widgets.LoadingOverlay.prototype */{
	
	defaultOptions: {
		components: {
			overlay: {
				weight: 1,
				dtype: 'box',
				cls: 'dino-loading-overlay',
				opacity: .7				
			},
			message: {
				weight: 2,
				dtype: 'box',
				opacity: 1,
				cls: 'dino-loading-message',
				content: {
					dtype: 'text-item',
					text: 'Загрузка...',
					showLeftIcon: true,
					leftIconCls: 'dino-icon-loader'			
				}				
			}
		}
	}
	
}, 'loading-overlay');

/**
 * @class
 * @extends Dino.containers.Box
 */
Dino.widgets.ListBox = Dino.declare('Dino.widgets.ListBox', 'Dino.containers.Box', /** @lends Dino.widgets.List.prototype */{
	
	defaultCls: 'dino-list-box',
	
	defaultOptions: {
    dynamic: true,
		defaultItem: {
			dtype: 'text-item',
			cls: 'dino-list-box-item'
		}
	},
	
	
	$init: function(o) {
		Dino.widgets.ListBox.superclass.$init.apply(this, arguments);
		
	},
	
	
	
	$opt: function(o) {
		Dino.widgets.ListBox.superclass.$opt.apply(this, arguments);
		
	}
	
	
	
}, 'list-box');





Dino.declare('Dino.widgets.SelectField', 'Dino.widgets.ComboField', {
	
	defaultOptions: {
		cls: 'dino-select-field',
    components: {
			input: {
				updateOnValueChange: true,
				readOnly: true,
				format: function(val) { 
					return (val === '' || val === undefined) ? '' : this.parent.dropdown.data.get(val); 
				}
			},
      button: {
        dtype: 'icon-button',
        onAction: function() {
					this.parent.showDropdown();
        }
      },
	    dropdown: {
	      dtype: 'dropdown-box',
				renderTo: 'body',
	      cls: 'dino-border-all dino-dropdown-shadow',
				style: {'display': 'none'},
				content: {
					dtype: 'list-box',
					defaultItem: {
						events: {
							'click': function(e, w) {
								var dd = w.parent.parent;
								dd.parent.setValue(w.data.id);
		          	dd.hide();
							}
						}						
					}
				}
	    }

    },
		dropdownOnClick: false,
		dropdownOnFocus: false
	},
	
	
	
	$init: function(o) {
		Dino.widgets.SelectField.superclass.$init.apply(this, arguments);
		
		var self = this;
		
		if(o.dropdownOnClick) {
			this.el.click(function(){	self.showDropdown(); });
		}
		if(o.dropdownOnFocus) {
			this.el.focus(function(){	self.showDropdown(); });
		}
	},
	
	
	showDropdown: function() {
    var dd = this.dropdown;
							
    dd.el.css('min-width', this.el.width());//.width(this.el.width());

		var offset = this.el.offset();
    dd.show(offset.left, offset.top + this.el.outerHeight());	
	}
	
	
}, 'select-field');


Dino.declare('Dino.widgets.TextEditor', 'Dino.widgets.ComboField', {
	
	defaultOptions: {
		autoFit: true,
		cls: 'dino-text-editor',
		events: {
			'click': function(e) {
				e.stopPropagation();
			}
		},
		components: {
			input: {
        updateOnValueChange: true,
				autoFit: true,
				width: undefined //FIXME костыль пока нормально не заработает PlainLayout
			}			
		},
		extensions: [Dino.Focusable],
		states: {
			'focus': function(f) {
				if(f) {
					
				}
				else {
					this.parent.stopEdit();
				}
			}
		},
		onKeyDown: function(e) {
			if(e.keyCode == 13) {
				this.parent.stopEdit('enterKey');
			}
		}
	}	
	
}, 'text-editor');





/*
Dino.declare('Dino.widgets.TextEditor', 'Dino.widgets.Editor', {
	
}, 'text-editor');
*/



/**
 * По умолчанию редактор получает список кортежей, содержащих ключ и отображаемое значение
 * 
 * 
 * @param {Object} val
 */
Dino.declare('Dino.widgets.DropdownEditor', 'Dino.widgets.TextEditor', {
	
	defaultOptions: {
		components: {
			input: {
				readOnly: true,				
				format: function(val) {
					if(val === '' || val === undefined || val === null) return '';
					return this.parent.options.formatValue.call(this.parent, val);
				}
			},			
      button: {
        dtype: 'action-icon',
        cls: 'dino-clickable',
				role: 'actor',
				onAction: function() {
					this.parent.showDropdown();
					this.parent.hasDropdown = true;
				}
      },
			dropdown: {
	      dtype: 'dropdown-box',
				renderTo: 'body',
	      cls: 'dino-border-all dino-dropdown-shadow',
				style: {'display': 'none'},
				content: {
					dtype: 'list-box',
					defaultItem: {
						events: {
							'click': function(e, w) {
								var dd = w.parent.parent;
								dd.parent.events.fire('onSelect', {target: w});
								dd.parent.setValue( dd.parent.options.selectValue.call(dd.parent, w) );
//								dd.parent.setValue(w.data.get(dd.parent.options.dropdownModel.id));
		          	dd.hide();
							}
						}						
					}
				},
				onHide: function() {
					if(this.parent.parent) this.parent.parent.stopEdit();
				},
				effects: {
					show: 'slideDown',
					hide: 'slideUp',
					delay: 200
				}
			}
		},
		formatValue: function(val) { return this.dropdown.data.get(val); },
		selectValue: function(w){ return w.data.id; },
		onKeyDown: function(e) {
			if(e.keyCode == 40) this.showDropdown();
		},
		dropdownOnClick: true,
		dropdownOnFocus: false
	},
	
	$init: function(o) {
		Dino.widgets.DropdownEditor.superclass.$init.apply(this, arguments);
		
		var self = this;
		
		if(o.dropdownOnClick) {
			this.el.click(function(){	self.showDropdown(); });
		}
		if(o.dropdownOnFocus) {
			this.events.reg('onFocus', function(){	self.showDropdown(); });
//			this.el.focus(function(){	self.showDropdown(); });
		}
	},
	
	
	showDropdown: function() {
    var dd = this.dropdown;
							
    dd.el.css('min-width', this.el.width());//.width(this.el.width());
//    dd.el.width(this.el.width());

		var offset = this.el.offset();
    dd.show(offset.left, offset.top + this.el.outerHeight());	
	},
	
	hideDropdown: function() {
		this.dropdown.hide();
	}
	
}, 'dropdown-editor');






Dino.declare('Dino.widgets.SpinnerEditor', 'Dino.widgets.TextEditor', {
	
	defaultOptions: {
    components: {
      buttons: {
        dtype: 'box',
				role: 'actor',
        defaultItem: {
          cls: 'dino-clickable',
          dtype: 'action-icon',
          style: {'display': 'block', 'border': 'none', 'padding': 0},
          height: 8,
          width: 16,
          onAction: function() {
						var n = this.data.get();
						if(Dino.isString(n)) n = parseFloat(n); //FIXME 
            if(this.tag == 'up')
              this.data.set(n+1);
            else if(this.tag == 'down')
              this.data.set(n-1);
          },
					events: {
						'dblclick': function(e) { 
							e.preventDefault(); return false; 
						}
					}
        },
        items: [{
          cls: 'dino-icon-spinner-up',
          tag: 'up'
        }, {
          cls: 'dino-icon-spinner-down',
          tag: 'down'
        }]        
      }
    },
		onKeyDown: function(e) {
			if(e.keyCode == 38) this.spinUp();
			else if(e.keyCode == 40) this.spinDown();
		}
	},
	
	
	spinUp: function() {
//		var n = this.data.get();
//		if(Dino.isString(n)) n = parseFloat(n);
		var n = parseFloat(this.input.el.val()); 
		this.setValue(n+1);
	},
	
	spinDown: function() {
//		var n = this.data.get();
//		if(Dino.isString(n)) n = parseFloat(n); 
		var n = parseFloat(this.input.el.val()); 
		this.setValue(n-1);		
	}
	
	
}, 'spinner-editor');





Dino.widgets.TextButton = Dino.declare('Dino.widgets.TextButton', 'Dino.widgets.Button', /** @lends Dino.widgets.TextButton.prototype */{
	
	defaultOptions: {
		cls: 'dino-text-button',
		layout: 'hbox',
		components: {
			icon: {
				dtype: 'icon',
				state: 'hidden'
			},
			content: {
				dtype: 'text',
				state: 'hidden'
			},
			xicon: {
				dtype: 'icon',
				state: 'hidden'
			}
		},
		text: ''
	},
	
	
	$opt: function(o) {
		Dino.widgets.TextButton.superclass.$opt.apply(this, arguments);
		
		if('text' in o) {
			this.content.opt('text', o.text);
			this.content.states.toggle('hidden', !o.text);
		}
		if('icon' in o) {
			this.icon.states.setOnly(o.icon);
			this.icon.states.toggle('hidden', !o.icon);
		}
		if('xicon' in o) {
			this.xicon.states.setOnly(o.xicon);
			this.xicon.states.toggle('hidden', !o.xicon);
		}
	}
	
	
}, 'text-button');



Dino.declare('Dino.widgets.IconButton', 'Dino.widgets.Button', {
	
	defaultOptions: {
		cls: 'dino-icon-button',
		content: {
			dtype: 'icon'
		},
		events: {
			'mousedown': function(e, self) {
				self.el.addClass('clicked');
				return false;
			},
			'mouseup': function(e, self) {
				self.el.removeClass('clicked');
			},
			'mouseleave': function(e, self) {
				self.el.removeClass('clicked');
			}
		}
	},

	$opt: function(o) {
		Dino.widgets.IconButton.superclass.$opt.apply(this, arguments);
		
		if('icon' in o) {
			this.content.states.set(o.icon);
		}
		
	}

}, 'icon-button');



Dino.declare('Dino.widgets.DropdownButton', 'Dino.widgets.TextButton', {
	
	defaultOptions: {
		components: {
			dropdown: {
				dtype: 'menu-dropdown-box',
				style: {'display': 'none'},
				hideOn: 'outerClick',
//				renderTo: 'body',
				menuModel: {
					item: {
						content: {
							dataId: 'name'							
						},
						onAction: function() {
							this.getParent(Dino.widgets.DropdownButton).events.fire('onSelect', {target: this});
						}
					}
				},
				onHide: function() {
					this.parent.states.clear('selected');
				}
			}
		},
		onAction: function() {
			
			var dd = this.dropdown;

			$('body').append(dd.el);
			
			var offset = this.el.offset();
			dd.show(offset.left, offset.top + this.el.outerHeight());
			
			this.states.set('selected');
//			dd.show(0, this.el.outerHeight());
			
		}
	}
	
	
}, 'dropdown-button');





/**
 * @class
 * @name Dino.widgets.Panel
 * @extends Dino.Widget
 */
Dino.declare('Dino.widgets.Panel', 'Dino.Widget', /** @lends Dino.widgets.Panel.prototype */{
	
	defaultCls: 'dino-panel',
	
	$html: function() { return '<div></div>'; },
	
	defaultOptions: {
//		cls: 'dino-border-all dino-corner-top',
		components: {
			header: {
				weight: 1,
				dtype: 'box',
	      layout: {
	        dtype: 'dock-layout',
	        updateMode: 'auto'
	      },				
				cls: 'dino-panel-header',
				components: {
					title: {
						dtype: 'text-item',
						dock: false
					},
	        buttons: {
		        dtype: 'box',
		        dock: 'right',
		        layout: 'float',
						style: {'margin-right': '3px'},
		        defaultItem: {
		          dtype: 'icon-button',
		          cls: 'dino-header-button dino-corner-all',
		          onAction: function(){
								this.getParent(Dino.widgets.Panel).events.fire('onHeaderButton', {'button': this.tag});
		          }
		        }
		      }
				}
			},
			content: {
/*				cls: 'dino-panel-content',*/
				weight: 2,
				dtype: 'box'
			}
//			footer: {
//				dtype: 'box'
//			}
		},
		headerButtonSet: {
//			'close': {icon: 'dino-icon-dialog-close', tag: 'close'},
//			'minimize': {icon: 'dino-icon-dialog-minimize', tag: 'minimize'},
//			'maximize': {icon: 'dino-icon-dialog-maximize', tag: 'maximize'}
		}		
	},
	
	
	$init: function(o) {
		Dino.widgets.Panel.superclass.$init.apply(this, arguments);		
	},
	
	$opt: function(o) {
		Dino.widgets.Panel.superclass.$opt.apply(this, arguments);
		
		if('title' in o) this.header.title.opt('text', o.title);
		
		if('headerButtons' in o) {
			var self = this;
			// формируем указанный порядок кнопок
			Dino.each(o.headerButtons, function(name){
				self.header.buttons.addItem(self.options.headerButtonSet[name]);//layout.el.append( self.buttons.getItem(name).el );
			});
//			// включаем указанные кнопки
//			this.buttons.eachItem(function(item) {
//				item.states.toggle('hidden', !Dino.in_array(o.buttons, item.tag)); 
//			});
		}		
		
		
	}
	
	
	
	
}, 'panel');
/**
 * @class
 * @name Dino.panels.TabPanel
 * @extends Dino.Widget
 */
Dino.declare('Dino.panels.TabPanel', 'Dino.Widget', /** @lends Dino.panels.TabPanel.prototype */{
	
	$html: function() { return '<div></div>'; },
	
	defaultCls: 'dino-tab-panel',
	
	defaultOptions: {
		tabPosition: 'top',
		components: {
			tabs: {
				weight: 1,
				dtype: 'tabs',
				defaultItem: {
					cls: 'dino-bg-3 dino-border-all',// dino-corner-top',
					content: {
						dtype: 'text-item'
//						selectable: false
					}
				},
				onTabChanged: function(){
					// переключаем страницу при смене закладки
					this.parent.pages.layout.activate( this.currentTab.index );
					this.parent.events.fire('onTabChanged', {'tab': this.parent.getCurrentTab(), 'page': this.parent.getCurrentPage()});
				}
			},
			tabFooter: {
				weight: 2,
				dtype: 'box',
				cls: 'dino-tab-footer'// dino-border-top dino-border-bottom'// dino-border-no-bottom'
			},
			pages: {
				weight: 3,
				dtype: 'box',
				layout: 'stack',
				cls: 'dino-tab-pages',// dino-border-all',
				defaultItem: {
					dtype: 'box'
				}
			}
		}
	},
	
	
	$init: function() {
		Dino.panels.TabPanel.superclass.$init.apply(this, arguments);
				
		var o = this.options;

		if('tabWidth' in o) {
			if(o.tabPosition == 'left' || o.tabPosition == 'right'){
				var s = {};
				s['margin-'+o.tabPosition] = o.tabWidth+1;
				Dino.utils.overrideOpts(this.options, {
					components: {
						tabs: {defaultItem: {width: o.tabWidth}},
						pages: {style: s}
					}
				});
			}			
		}

		if('tabPosition' in o){
			if(o.tabPosition == 'bottom'){
				Dino.utils.overrideOpts(this.options, {
					components: {
						tabs: {weight: 3},
						tabFooter: {weight: 2},
						pages: {weight: 1}
					}
				});
			}
		}
		
		
		if('tab' in o.defaults)
			Dino.utils.overrideOpts(o.components.tabs.defaultItem, o.defaults.tab);
		
		if('page' in o.defaults)
			Dino.utils.overrideOpts(o.components.pages.defaultItem, o.defaults.page);
		
	},
	
	
	$afterBuild: function() {
		Dino.panels.TabPanel.superclass.$afterBuild.apply(this, arguments);
		
		// активируем закладку
		if(!this.tabs.currentTab) this.tabs.setActiveTab(0);
	},
	
	
	$opt: function(o) {
		Dino.panels.TabPanel.superclass.$opt.apply(this, arguments);
		
		if('pages' in o){
			for(var i = 0; i < o.pages.length; i++) this.addPage(o.pages[i]);
		}
		
		if('tabPosition' in o){
			this.tabs.opt('cls', o.tabPosition);
			this.pages.opt('cls', o.tabPosition);
		}
		
	},
	
	addPage: function(item) {
		
		var tabOpts = (item instanceof Dino.Widget) ? item.options.tab : item.tab;
		if(Dino.isString(tabOpts)) tabOpts = {text: tabOpts};
		var tab = this.tabs.addItem( {content: tabOpts || {}} );
		
		var page = this.pages.addItem( item );
		page.tab = tab;
	},
	
	removePage: function(i) {
		//TODO
	},
	
	setCurrentTab: function(i) {
		this.tabs.activateTab(i);
	},
	
	getCurrentTab: function() {
		return this.tabs.currentTab;
	},
	
	getCurrentPage: function() {
		return this.pages.getItem(this.tabs.currentTab.index);
	},
	
	setCurrentPage: function(i) {
		this.tabs.setActiveTab( this.pages.getItem(i).tab );
	}
	
		
	
//	getPage: function(i) {
//		return this.pages.getItem(i);
//	}
	
	
}, 'tab-panel');



/**
 * @class
 * @extends Dino.containers.Box
 */
Dino.widgets.Dialog = Dino.declare('Dino.widgets.Dialog', 'Dino.widgets.Panel', /** @lends Dino.widgets.Dialog.prototype */{
	
	defaultOptions: {
		baseCls: 'dino-dialog',
		layout: 'window',
		renderTo: 'body',
		components: {
			buttons: {
				weight: 3,
				dtype: 'control-box',
				cls: 'center',
				defaultItem: {
					dtype: 'text-button',
					state: 'hidden',
					width: 80,
					onAction: function() {
						var dlg = this.parent.parent;
						dlg.dialogButton = this.tag;
						dlg.close();
					}
				}
			}
		},
		buttonSet: {
			'ok': {text: 'ОК', tag: 'ok'},
			'cancel': {text: 'Отмена', tag: 'cancel'},
			'save': {text: 'Сохранить', tag: 'save'}
		},
		headerButtonSet: {
			'close': {icon: 'dino-icon-dialog-close', tag: 'close'},
			'minimize': {icon: 'dino-icon-dialog-minimize', tag: 'minimize'},
			'maximize': {icon: 'dino-icon-dialog-maximize', tag: 'maximize'}
		},		
		closeOnOverlayClick: false,
		closeOnEsc: false,
		onHeaderButton: function(e) {
			if(e.button == 'close') this.close();
		}
	},
	
	
	$init: function(o) {
		Dino.widgets.Dialog.superclass.$init.apply(this, arguments);
		
		var self = this;
		
		if(o.closeOnOverlayClick) {
			this.layout.overlay_el.click(function(){
				self.close();
			});			
		}

		if(o.closeOnEsc) {
			$(window).keydown(function(e){
				if(e.keyCode == 27) self.close();
			});			
		}
		
		var buttons = [];
		for(var i in o.buttonSet)
			buttons.push( o.buttonSet[i] );
		
		o.components.buttons.items = buttons;
		
		this.dialogButton = null;
	},

	$opt: function(o) {
		Dino.widgets.Dialog.superclass.$opt.apply(this, arguments);
		
		if('title' in o) this.header.opt('title', o.title);
	
//		if('buttonsAlign' in o) this.buttons.states.set_only(o.buttonsAlign);
		if('buttons' in o) {
			var self = this;
			// формируем указанный порядок кнопок
			Dino.each(o.buttons, function(name){
				self.buttons.layout.el.append( self.buttons.getItem(name).el );
			});
			// включаем указанные кнопки
			this.buttons.eachItem(function(item) {
				item.states.toggle('hidden', !Dino.in_array(o.buttons, item.tag)); 
			});
		}		
	},
	
	
	open: function(resultCallback){
		
		this.events.fire('onBeforeOpen');

		var self = this;
		this.layout.open();
		this.layout.update(function(){
			self.events.fire('onOpen');
		});
		this.dialogButton = null;
		this.resultCallback = resultCallback;
		this.dialogResult = null;
	},
	
	close: function() {
		var e = new Dino.events.CancelEvent();
		e.button = this.dialogButton;
		
		this.events.fire('onClose', e);
		
		if(!e.isCanceled) {
			this.layout.close();
			if(this.options.destroyOnClose) this.destroy();
			if(this.dialogResult && this.resultCallback) this.resultCallback.call(this, this.dialogResult);
		}
		
		this.dialogButton = null;
	}
	
	
	
	
	
}, 'dialog');

/**
 * @class
 * @extends Dino.widgets.Dialog
 */
Dino.widgets.MessageBox = Dino.declare('Dino.widgets.MessageBox', 'Dino.widgets.Dialog', /** @lends Dino.widgets.MessageBox.prototype */{
	
	defaultOptions: {
		components: {
			content: {
				dtype: 'box',
				layout: {
					dtype: 'column-layout',
					valign: 'middle'
				},
				components: {
					icon: {
						dtype: 'icon',
						cls: 'dino-messagebox-icon icon32'
					},
					message: {
						dtype: 'text'
					}
				}	
			}
		},
	
//		buttonsAlign: 'center',
		buttonSet: {
			'yes': {text: 'Да', tag: 'yes'},
			'no': {text: 'Нет', tag: 'no'}
//			'ok': {text: 'ОК', tag: 'ok'},
//			'cancel': {text: 'Отмена', tag: 'cancel'}
		},
		iconSet: {
			'info': 'dino-icon-messagebox-info',
			'critical': 'dino-icon-messagebox-critical',
			'warning': 'dino-icon-messagebox-warning'
		}
	},
		
	
	$opt: function(o) {
		Dino.widgets.MessageBox.superclass.$opt.apply(this, arguments);
		
		if('icon' in o) this.content.icon.states.setOnly(this.options.iconSet[o.icon]);
		if('message' in o) this.content.message.opt('text', o.message);
		
	}
	
	
	
	
}, 'message-box');


Dino.widgets.Growl = Dino.declare('Dino.widgets.Growl', 'Dino.Widget', {

	defaultOptions: {
		html: '<div/>',
		cls: 'dino-growl dino-border-all dino-corner-all dino-widget-shadow',
		components: {
			content: {
				dtype: 'box',
				layout: {
					dtype: 'column-layout',
					valign: 'middle'
				},
				components: {
				}		
			},
			buttons: {
				dtype: 'control-box',
				cls: 'center',
				defaultItem: {
					dtype: 'text-button',
					onAction: function() {
						var growl = this.parent.parent;
						growl.growlButton = this.tag;
						growl.hide();
					}
				}
			}
		},
		state: 'clickable',
		onClick: function() {
			if(this.options.hideOnClick) this.hide();
		},
		buttonSet: {
			'ok': {text: 'ОК', tag: 'ok'},
			'cancel': {text: 'Отмена', tag: 'cancel'},
			'save': {text: 'Сохранить', tag: 'save'}
		},
		hideOnClick: true,
		hideOnTimeout: true,
		delay: 500,
		timeout: 10000
	},
	
	
	$init: function(o) {
		Dino.widgets.GrowlBox.superclass.$init.apply(this, arguments);
		
		// Добавляем иконку
		if('icon' in o) {
			o.components.content.components.messageIcon = {
				dtype: 'icon',
				cls: 'icon32 dino-center-align ' + o.icon,
				style: {'margin': '0 10px'}
//				width: 50
			}
		}
		
		// Добавляем сообщение
		if('message' in o) {
			o.components.content.components.messageContent = {
				dtype: 'text',
//				cls: 'dino-widget-content',
				text: o.message
			}			
		}

		// Добавляем html
		if('htmlMessage' in o) {
			o.components.content.components.htmlContent = {
				dtype: 'box',
//				html: '<iframe>'+o.htmlMessage+'</iframe>',
//				cls: 'dino-widget-content',
				innerHtml: o.htmlMessage
			}			
		}
		
		// добавляем кнопки
		if('buttons' in o) {
			var buttons = [];
			Dino.each(o.buttons, function(key){
				buttons.push( o.buttonSet[key] );
			})
			o.components.buttons.items = buttons;
		}		
		
	},
	
	
	show: function() {
		var o = this.options;
		
		this.el.fadeIn(o.delay);
		
		var self = this;
		if(o.hideOnTimeout){
			setTimeout(function(){ self.hide(); }, o.timeout);			
		}
	},
	
	
	hide: function() {
		var o = this.options;
		var self = this;
		this.el.fadeOut(o.delay, function(){ self.events.fire('onHide', {'source': self});});
	}
	
}, 'growl');




Dino.declare('Dino.widgets.GrowlBox', 'Dino.containers.Box', {
	
	defaultOptions: {
		cls: 'dino-growl-box',
		height: 'ignore',
		defaultItem: {
			dtype: 'growl',
			onHide: function() {
				this.parent.destroyItem(this); 				
			}
		}
	}
	
	
/*	
	addMessage: function(msg, icon, boxState) {
		
		var o = this.options;
		
		this.addItem({
			delay: o.delay,
			timeout: o.timeout,
			hideOnTimeout: o.hideOnTimeout,
			state: boxState,
			hideOnClick: true,
			components: {
				messageIcon: {
					dtype: 'icon',
					cls: 'icon32 dino-center-align ' + icon,
					width: 50
				},
				messageText: {
					dtype: 'text',
					cls: 'dino-widget-content',
					text: msg
				}
			}
		});
		
	},
	
	addPrompt: function(icon, msg, buttons) {

		var o = this.options;
		
		this.addItem({
			delay: o.delay,
			timeout: o.timeout,
			hideOnTimeout: o.hideOnTimeout,
			state: boxState,
			hideOnClick: true,
			components: {
				messageIcon: {
					dtype: 'icon',
					cls: 'icon32 dino-center-align ' + icon,
					width: 50
				},
				messageText: {
					dtype: 'text',
					cls: 'dino-widget-content',
					text: msg
				}
			}
		});
		
	},
	
	addHtml: function(html) {
		
	}
*/	
	
	
	
	
}, 'growl-box');





/*
Dino.declare('Dino.widgets.Growl', 'Dino.Widget', {
	
	$html: function() { return '<div></div>'; },
	
//	defaultCls: 'dino-growl-box',
	
	defaultOptions: {
		components: {
			icon: {
				dock: 'left',
				dtype: 'icon',
				cls: 'dino-growl-icon'
			}, 
			contentBox: {
				dtype: 'box',
				cls: 'dino-growl-content',
				content: {
					dtype: 'text'
				}
			}, 
			button: {
				dock: 'right',
				dtype: 'box',
				cls: 'dino-growl-button',
				clickable: true,
				onClick: function(e) {
					this.parent.hide();
				}			
			}
		},
		delay: 500,
		cls: 'dino-growl',
		styles: {'display': 'none'},
		layout: 'dock-layout',
		closeOnClick: false,
		timeout: 5000

	},
	
	$events: function(self){
		Dino.widgets.Growl.superclass.$events.apply(this, arguments);
		
//		this.el.click(function(){ 
//			self.hide();
//		});
	},
	
	$opt: function(o) {
		Dino.widgets.Growl.superclass.$opt.apply(this, arguments);
		
		if('message' in o)
			this.contentBox.content.opt('innerHtml', o.message);
		
		if('iconCls' in o)
			this.icon.opt('cls', o.iconCls);
		if('buttonCls' in o)
			this.button.opt('cls', o.buttonCls);
		
		var self = this;
		
		if(o.closeOnClick){
			this.el.click(function(){
				self.hide();
			});
		}
	},
	
	show: function(html){
		
		var o = this.options;
		
		this.el.html(html);
		this.el.fadeIn(o.delay);
		
		var self = this;
		if(o.hideOnTimeout){
			setTimeout(function(){ self.hide(); }, o.timeout);			
		}
	},
	
	hide: function(){
		var self = this;
		this.el.fadeOut(this.options.delay, function(){ self.events.fire('onHide', {'source': self}); });
	}
	
	
}, 'growl');


// TODO на самом деле этот виджет должен наследовать от списка, а не бокса
Dino.declare('Dino.widgets.GrowlBox', 'Dino.containers.Box', {
	
	defaultOptions: {
		defaultItem: {
			dtype: 'growl',
			components: {
				button: {
					states: {
						'hover': ['', 'dino-off']
					}
				}
			},	
		    buttonCls: 'dino-icon dino-icon-close dino-off',
			onHide: function() {
				if(this.parent) this.parent.removeItem(this);
			}
		}
	},
	
	addMessage: function(msg, type) {
		
		if(arguments.length == 1) type = 'info';
		
		this.addItem({
			cls: 'growl-item-'+type,
			iconCls: 'dino-icon-'+type,
			message: msg
		});
		
	}
	
}, 'growl-box');

*/



/*
 * hideOnTimeout
 * 
 */

/*
function init_default_growl(o) {

	o = o || {};

	Dino.growl = $.dino({
		dtype: 'growl',
		renderTo: 'body'
	});


	growl = {
			info: function(m, isHtml) {this.msg(m, 'info', isHtml);},
			err: function(m, isHtml) {this.msg(m, 'critical', isHtml);},
			warn: function(m, isHtml) {this.msg(m, 'warning', isHtml);},
			html: function(m, isHtml) { Dino.growl.addItem({html: m, icon: 'dino-icon-growlbox-info'}) },
			msg: function(m, type, isHtml) {
				var s = (Dino.isString(m)) ? m : Dino.pretty_print(m);
				var o = {
					icon: 'dino-icon-growlbox-'+type,
					state: type					
				};
				(isHtml) ? o.htmlMessage = m : o.message = m;
				Dino.growl.addItem(o);
//				Dino.messagePanel.addMessage(s, type);		
			}
		}
	
}
*/










/**
 * @class
 * @extends Dino.Widget
 */
Dino.widgets.Grid = Dino.declare('Dino.widgets.Grid', 'Dino.Widget', /** @lends Dino.widgets.Grid.prototype */{
	
	defaultOptions: {
		wrapEl: '<div></div>',
		baseCls: 'dino-grid',
		components: {
			header: {
				dtype: 'box',
				content: {
					dtype: 'table',
					width: '100%',
					binding: false,
					headerModel: {
						cell: {
							cls: 'dino-grid-h-cell',
							layout: {
								dtype: 'plain-layout',
								html: '<div class="nowrap"></div>'
							}
						}						
					}
				}
			},
			content: {
				// скроллируемый контейнер
				dtype: 'box',
				style: {'overflow-y': 'auto', 'overflow-x': 'hidden'},
				content: {
					dtype: 'table',
					width: '100%',
					tableModel: {
						row: {
							cls: 'dino-grid-row'
						},
						cell: {
							cls: 'dino-grid-cell',
							layout: {
								dtype: 'plain-layout',
								html: '<div class="nowrap"></div>'
							}
						}
					}
				}
			}
//			footer: {
//				dtype: 'control-bar'
//			}
		}
	},
	
	
	
	$init: function() {
		Dino.widgets.Grid.superclass.$init.apply(this, arguments);
		
		var o = this.options;
		
		// переносим параметр width из колонок в заголовки
		var h_columns = [];
		Dino.each(o.tableModel.columns, function(column, i){
			h_col = {};
			if('width' in column) h_col.width = column.width;
			if('header' in column) {
				if(Dino.isString(column.header)) h_col.text = column.header;
				else Dino.utils.overrideOpts(h_col, column.header);
			}
			h_columns[i] = h_col;
		})
		
		
		Dino.utils.overrideOpts(o.components.content.content, {'tableModel': o.tableModel});
		Dino.utils.overrideOpts(o.components.header.content, {'headerModel': o.headerModel || {}}, {headerModel: {columns: h_columns}});
		
	},
	
//	$opt: function(o) {
//		Dino.widgets.Grid.superclass.$opt.apply(this, arguments);
//		
//		if('isDynamic' in o) this.content.body.opt('dynamic', true);
//	},
	
	
	$layoutChanged: function() {
		Dino.widgets.Grid.superclass.$layoutChanged.apply(this, arguments);
		
		// выполняем настройку ширины полей
		var body = this.content.content.body;
		var head = this.header.content.head;
		var total_w = body.el.innerWidth();
//		var htotal_w = this.content.content.el.width();

		// если максимальная ширина контейнера равна 0 (как правило, это означает, что он еще не виден), 
		// расчет ширины колонок не выполняем  
		if(total_w == 0) return;
		
		this.header.content.el.width(total_w);
		
		
		var t_columns = [];
//		var h_columns = [];
		var t_nowrap = [];
		var w = 0;
		var n = 0;
		Dino.each(body.options.defaultItem.items, function(column, i){
			h_col = {};
			if('width' in column) {
				t_columns[i] = column.width;
				w += column.width;
			}
			else {
				t_columns[i] = null;
				n++;
			}
			t_nowrap[i] = column.nowrap;
		});
		
		if(n > 0) {
			var eq_w = (total_w - w) / n;
			for(var i = 0; i < t_columns.length; i++) if(t_columns[i] === null) t_columns[i] = eq_w;
		}

		var real_width = [];
		
		for(var i = 0; i < t_columns.length; i++) {
			// определим фактическую ширину поля
			var th = head.getItem(0).getItem(i).el;
			var dw = th.outerWidth() - th.innerWidth();
			real_width[i] = t_columns[i] - dw;
			
			head.getItem(0).getItem(i).layout.el.width(real_width[i]);//.opt('width', t_columns[i]);
			
//			if(t_nowrap[i])
			body.options.defaultItem.items[i].layout = {html: '<div class="nowrap" style="width:'+real_width[i]+'px"></div>'};//.width = t_columns[i];
//			else
//				body.options.defaultItem.items[i].width = t_columns[i];
//			head.options.defaultItem.items[i].width = h_columns[i];
		}
		
		// обходим все строки
		body.eachItem(function(row){
			// обходим все поля
			row.eachItem(function(col, i){
				col.layout.el.width(real_width[i]);//t_columns[i]);
//				col.opt('width', t_columns[i]);
			});
		});
		
		
		
//		var tableWidth = this.content.content.el.width();
	},
	
	
	eachRow: function(callback) {
		this.content.content.eachRow(callback);
	}
	
//	$dataChanged: function() {
//		Dino.widgets.Grid.superclass.$dataChanged.apply(this, arguments);
//		
////		this.$layoutChanged();
//		
//	}
	
	
	
	
}, 'grid');










/**
 * @class
 * @extends Dino.layouts.StatefulLayout
 */
Dino.layouts.TreeGridLayout = Dino.declare('Dino.layouts.TreeGridLayout', 'Dino.layouts.StatefulLayout', /** @lends Dino.layouts.TreeGridLayout.prototype */{
	
//	initialize: function(){
//		Dino.layouts.TreeGridLayout.superclass.initialize.apply(this, arguments);
//		
//		this.items = [];
//	},
	
	
	insert: function(item) {
		Dino.layouts.TreeGridLayout.superclass.insert.apply(this, arguments);
		
		// если эта компоновка является дочерней/зависимой, то передаем элемент родителю
		if(this.container instanceof Dino.Layout)
			this.container.insert(item);
		else {
//			Dino.layouts.TreeGridLayout.superclass.insert.apply(this, arguments);
			if(this.container.el.parents().is('body')) item.$afterRender();
		}
		
//		else
//		console.log(this.container);
//		this.items.push(item);
	},
	
	remove: function(item) {		
		Dino.layouts.TreeGridLayout.superclass.remove.apply(this, arguments);			

		// если эта компоновка является дочерней/зависимой, то удаляем элемент из родителя
		if(this.container instanceof Dino.Layout) {
			this.container.remove(item);
		}
//		else {
//			Dino.layouts.TreeGridLayout.superclass.remove.apply(this, arguments);
//		}
		
//		Dino.remove_from_array(this.items, item)
		
//		item.el.detach();
		
//		console.log('item removed from layout');
	},
	
	clear: function() {
//		var self = this;
		if(this.container instanceof Dino.Layout) {
			while(this.items.length > 0) this.remove(this.items[0]);
		}
		Dino.layouts.TreeGridLayout.superclass.clear.apply(this, arguments);		
	},
	
	
	rebuild: function() {

		// если эта компоновка является дочерней/зависимой, то обновление выполнять не нужно
		if(this.container instanceof Dino.Layout) return;
		
		var self = this;
		var n = 0;
		
		this.container.walk(function() {
			if(Dino.in_array(self.items, this))
				this.order = n++;
		});
		
		this.items.sort(function(w1, w2){
			var a = w1.order;
			var b = w2.order;
			if(a < b) return -1;
			else if(a > b) return 1;
			return 0;
		});
				
		Dino.each(this.items, function(item, i){
			self.container.el.append(item.el);
		});
		
//		console.log('rebuild tree-grid')
//		console.log(this.container.data.get());
	}
	
//	clear: function() {
//		
//	}
	
}, 'tree-grid-layout');



/*
Dino.declare('Dino.layouts.IndentLayout', Dino.Layout, {

	
	
	
	
	insert: function(item) {
		
		// если эта компоновка является дочерней/зависимой, то передаем элемент родителю
		if(this.container instanceof Dino.Layout)
			this.container.insert(item);
		
		this.items.push(item);
	},
	
	
	
}, 'indent-layout');
*/




/**
 * @class
 * @extends Dino.Widget
 */
Dino.widgets.TreeGrid = Dino.declare('Dino.widgets.TreeGrid', 'Dino.widgets.Grid', /** @lends Dino.widgets.TreeGrid.prototype */{
	
	defaultOptions: {
//		wrapEl: '<div></div>',
//		baseCls: 'dino-tree-grid',
		components: {
//			header: {
//				dtype: 'box',
//				content: {
//					dtype: 'table',
//					width: '100%',
//					binding: false,
//					headerModel: {
//						cell: {
//							cls: 'dino-grid-h-cell',
//							layout: {
//								dtype: 'plain-layout',
//								html: '<div class="nowrap"></div>'
//							}
//						}						
//					}
//				}
//			},
			content: {
				// скроллируемый контейнер
//				dtype: 'box',
//				style: {'overflow-y': 'auto', 'overflow-x': 'hidden'},
				content: {
					dtype: 'tree-table',
					tableModel: {
						row: {
							cls: 'dino-tree-grid-row'
						},
						cell: {
							cls: 'dino-tree-grid-cell',
							layout: {
								dtype: 'plain-layout',
								html: '<div class="nowrap"></div>'
							}
						}
					}
//					width: '100%'
				}
			}
		}
	}
	
	
/*	
	$init: function() {
		Dino.widgets.TreeGrid.superclass.$init.apply(this, arguments);
		
		var o = this.options;
		
		// переносим параметр width из колонок в заголовки
		var h_columns = [];
		Dino.each(o.tableModel.columns, function(column, i){
			h_col = {};
			if('width' in column) h_col.width = column.width;
			h_columns[i] = h_col;
		})
		
		Dino.utils.overrideOpts(o.components.content.content, {'tableModel': o.tableModel});
		Dino.utils.overrideOpts(o.components.header.content, {'headerModel': o.headerModel || {}}, {headerModel: {columns: h_columns}});
		
	},
	
	
	$layoutChanged: function() {
		Dino.widgets.TreeGrid.superclass.$layoutChanged.apply(this, arguments);
		
		var tableWidth = this.content.content.el.width();
		this.header.content.el.width(tableWidth);
		
	}
*/	
	
	
	
}, 'tree-grid');




/**
 * @class
 * @extends Dino.widgets.Table
 */
Dino.widgets.TreeTable = Dino.declare('Dino.widgets.TreeTable', 'Dino.widgets.Table', /** @lends Dino.widgets.TreeTable.prototype */{
	
	defaultOptions: {
		cls: 'dino-tree-table',
		components: {
			body: {
				defaultItem: {
					dtype: 'tree-table-row'
				}
			}
		}
	},
	
	
	$init: function(o) {
		Dino.widgets.TreeTable.superclass.$init.apply(this, arguments);

		var bodyLayout = new Dino.layouts.TreeGridLayout(/*{updateMode: 'manual'}*/);
//		bodyLayout.immediateRebuild = false;
		
		o.components.body.layout = bodyLayout;

		// определяем, 
		var defaultNode = {
			components: {
				subtree: {
					layout: {
						dtype: 'tree-grid-layout',
						container: bodyLayout
					}
				}
			}			
		};

		Dino.utils.overrideOpts(o.components.body.defaultItem, defaultNode, {defaultSubItem: defaultNode});
		
		
		Dino.utils.overrideOpts(
				o.components.body.defaultItem.defaultSubItem,
				o.tableModel.row, 
				{defaultItem: o.tableModel.cell},
				{items: o.tableModel.columns}
		);
		
		
	}

	
//	$layoutChanged: function() {
//		Dino.widgets.TreeTable.superclass.$layoutChanged.apply(this, arguments);
//		
//		this.body.layout.update();
//	}

	
	
	
}, 'tree-table');



/**
 * @class
 * @extends Dino.widgets.TableRow
 */
Dino.widgets.TreeTableRow = Dino.declare('Dino.widgets.TreeTableRow', 'Dino.widgets.TableRow', /** @lends Dino.widgets.TreeTableRow.prototype */{
	
//	$html: function() { return '<tr></tr>'; },
	
	defaultOptions: {
//		cls: 'dino-tree-grid-row',
		indent: 0,
		defaultItem: {
			dtype: 'table-cell'
		},
		components: {
			subtree: {
				dataId: 'children',
				dtype: 'container',
				dynamic: true,
				defaultItem: {
					dtype: 'tree-table-row'
				}
			}
		},
		states: {
//			'collapsed_trigger': ['collapsed', 'expanded'],
			'expand_trigger': ['expanded', 'collapsed']
		}
	},
	
	$init: function() {
		this.constructor.superclass.$init.apply(this, arguments);
		
		var o = this.options;

		if('subtree' in o){
			o.components.subtree.items = o.subtree;
		}
		
		this.indent = o.indent;

		if('defaultSubItem' in o){
			Dino.utils.overrideOpts(o.components.subtree.defaultItem, o.defaultSubItem, {'defaultSubItem': o.defaultSubItem});
		}
		
		o.defaultItem.indent = this.indent;
		o.components.subtree.defaultItem.indent = this.indent+1;
	},
	
//	$opt: function(o) {
//		Dino.widgets.TreeGridRow.superclass.$opt.apply(this, arguments);
//		
//		this.isLeaf = o.isLeaf;
//				
//	},
	
		
	
	eachDescendantRow: function(callback) {
		if(arguments.length == 2){
			callback.call(this, this);
		}
				
		this.subtree.eachItem(function(item){
			item.eachDescendantRow(callback, 0);
		});
	},
	
//	eachSubItem: function(callback) {
//		this.subtree.eachItem(callback);
//	},
	
	collapse: function() {
		this.states.clear('expand_trigger');
		this.eachDescendantRow(function(item){
			item.states.set('hidden');
		});
	},
	
	expand: function(x0) {
		if(arguments.length == 0){
			this.states.set('expand_trigger');
			x0 = true;
		}

		if(!x0) return;
		
		var x = this.states.is('expanded');
		
//		if( this.states.is('expanded') ){
		this.states.clear('hidden');
		this.subtree.eachItem(function(item){
			item.expand(x);
		});			
//		}
	},
	
	getParentRow: function() {
		var w = this.parent.parent;
		return (w instanceof Dino.widgets.TreeTableRow) ? w : undefined;
	}
	
	
	
	
}, 'tree-table-row');



/**
 * @class
 * @extends Dino.widgets.TableCell
 */
Dino.widgets.TreeTableCell = Dino.declare('Dino.widgets.TreeTableCell', 'Dino.widgets.TableCell', /** @lends Dino.widgets.TreeTableCell.prototype */{
	
	defaultOptions: {
//		cls: 'dino-tree-grid-cell',
		layout: {
//			dtype: 'plain-layout',
//			html: '<div style="position: relative;"></div>'
			dtype: 'plain-layout',
			html: '<div class="nowrap"></div>'
		},
//		components: {
//			content: {
//				// этот контейнер нужен, чтобы работал стиль position: absolute
//				dtype: 'box',
				components: {
					content: {
						// контейнер для вставки отступов
						dtype: 'box',
						style: {'display': 'inline', 'position': 'relative'},
						cls: 'dino-tree-node',
						components: {
							button: {
								dtype: 'icon',
								weight: 1,
								cls: 'dino-tree-node-button',
								state: 'clickable',
								onClick: function() {
									var row = this.parent.parent.getRow();
									if(row.states.is('collapsed')){
										this.parent.states.set('expand_trigger');
										row.expand();
									}
									else{
										this.parent.states.clear('expand_trigger');
										row.collapse();
									}
								},
								states: {
									'leaf': 'hidden'
								}
							},
							content: {
								dtype: 'text-item',
								cls: 'dino-tree-node-content'
							}
						},
						states: {
							'expand_trigger': ['expanded', 'collapsed'],
							'expanded': function(on) {
								this.button.states.toggle('expanded', on);
							},
							'collapsed': function(on) {
								this.button.states.toggle('collapsed', on);
							}
							
						}
					}
				},
//			}
//		},
		expandOnShow: false
	},
	
	
	$opt: function(o) {
		Dino.widgets.TreeTableCell.superclass.$opt.apply(this, arguments);
		
		if('indent' in o){
			for(var i = 0; i < o.indent; i++){
				this.layout.el.prepend('<span class="indent"></span>');
			}
		}
		
		if('isLeaf' in o) {
			this.content.button.states.toggle('leaf', o.isLeaf);
		}
	},
	
	
	$afterRender: function() {
		Dino.widgets.TreeTableCell.superclass.$afterRender.apply(this, arguments);

//		var expand = this.options.expandOnShow;
		
		// если родительская строка скрыта или свернута, то этот узел является свернутым
		var parentRow = this.getRow().getParentRow();
		if(parentRow) {
			(parentRow.states.is('collapsed')) ? parentRow.collapse() : parentRow.expand();
		}
//		if(parentRow.states.is('hidden') || parentRow.states.is('collapsed')) expand = false;
		
		if(this.options.expandOnShow) {
			this.content.states.set('expand_trigger');
			this.getRow().expand();
		}
		else {
			this.content.states.clear('expand_trigger');
			this.getRow().collapse();
		}
		
	}
	
	
//	$afterBuild: function() {
//		var o = this.options;
//		this.children.each(function(child){ child.opt('indent', o.indent); });
//	}
	
}, 'tree-table-cell');








/**
 * @class
 * @extends Dino.Widget
 */
Dino.widgets.MenuItem = Dino.declare('Dino.widgets.MenuItem', 'Dino.containers.Box', /** @lends Dino.widgets.MenuItem.prototype */{
	
	defaultCls: 'dino-menu-item',
	
	defaultOptions: {
		showOnEnter: true,
		hideOnLeave: true,
		layout:'dock',
		components: {
			// выпадающее подменю
			content: {
				dtype: 'text'
			},
			icon: {
				dtype: 'icon',
				cls: 'dino-icon-right',
				dock: 'right',
				state: 'hidden'
			},
			submenu: {
				dtype: 'menu-dropdown-box',
				dataId: 'children',
				binding: function(val) {
					if(val && val.length > 0) this.parent.states.set('submenu');
				}
			}
		},
		states: {
			'submenu': function(on) {
				if(this.icon) this.icon.states.toggle('hidden', !on);
			}
		},
		events: {
			'click': function(e, w) {
				var event = new Dino.events.CancelEvent();
				w.events.fire('onAction', event);
				if(!event.isCanceled) w.hideSubmenu(true);
			}
		}
	},
	
	$init: function(o) {
		
		if('menuModel' in o) {
			Dino.utils.overrideOpts(o, o.menuModel.item);
			o.components.submenu.menuModel = o.menuModel;
		}		
		
		Dino.widgets.MenuItem.superclass.$init.apply(this, arguments);
		
		if('submenu' in o){
			o.components.submenu.items = o.submenu;
			//FIXME подозрительный код, потому что состояние submenu влияет на компонент icon, которого пока не создано
			this.states.set('submenu');
			o.components.icon.state = '';
		}

//		if('submenuWidth' in o){
//			o.components.submenu.width = o.submenuWidth;
//		}
		
//		if('subItem' in o.defaults){
//			Dino.utils.overrideOpts(o.components.submenu.defaultItem, o.defaults.subItem, {defaults: {'subItem': o.defaults.subItem}});
//		}		
		
	},
	
	
	$opt: function(o) {
		Dino.widgets.MenuItem.superclass.$opt.apply(this, arguments);
		
		if('text' in o) this.content.opt('text', o.text);
	},
	
	
	$events: function(self) {
		Dino.widgets.MenuItem.superclass.$events.apply(this, arguments);
		
		this.el.bind('mouseenter', function(){
			self.hoverSubmenu = true;
			if(self.intention) clearTimeout(self.intention);
			if(self.options.showOnEnter){
				self.intention = setTimeout(function(){
					self.intention = null;
					self.showSubmenu();					
				}, 300);
			}
		});
		
		this.el.bind('mouseleave', function(){
			self.hoverSubmenu = false;
			if(self.options.hideOnLeave){
				if(self.intention) clearTimeout(self.intention);
				if(self.submenu){
					self.intention = setTimeout(function(){
						self.intention = null;
						self.submenu.hide();
						self.events.fire('onSubmenuHide');
					}, 300);					
				}
			}
		});
		
	},
	
	hasSubmenu: function() {
		return !this.submenu.children.empty();
	},
	
	showSubmenu: function() {
		if(this.hasSubmenu()){
			if(this.submenu.options.anchor == 'bottom')
				this.submenu.show( 0, $(this.el).height());
			else
				this.submenu.show( $(this.el).outerWidth(), 0);
		}
	},
	
	hideSubmenu: function(hideAll) {
		if(this.hasSubmenu()){
			this.submenu.hide();
			this.events.fire('onSubmenuHide');
		}
		if(hideAll) {
			if(this.parent instanceof Dino.widgets.MenuDropdownBox) this.parent.hideAll();
		}
//		if(hideAll) {// && this.options.isLeaf)
//			var parentMenuItem = this.getParent(Dino.widgets.MenuItem);
//			if(parentMenuItem) parentMenuItem.hideSubmenu(true);
//		}	
//			if(this.parent)this.parent.parent.hideSubmenu(true);
	}
	
	
	
}, 'menu-item');







Dino.declare('Dino.widgets.MenuDropdownBox', 'Dino.containers.DropdownBox', {
	
	defaultCls: 'dino-menu-dropdown',
	
	defaultOptions: {
		cls: 'dino-menu-shadow',
		hideOn: 'hoverOut',
		offset: [-1, 1],
		dynamic: true,
		style: {'overflow-y': 'visible'},
		defaultItem: {
			dtype: 'menu-item'
		}
	},
	
	
	$init: function(o) {
		
		if('menuModel' in o) {
			Dino.utils.overrideOpts(o, o.menuModel.dropdown);
			o.defaultItem.menuModel = o.menuModel;
		}		
		
		Dino.widgets.MenuDropdownBox.superclass.$init.apply(this, arguments);
				
//		if('defaultItem' in o)
//			Dino.utils.overrideOpts(o.defaultItem.components.submenu.defaultItem, o.defaultItem);//o.defaults.subItem, {defaults: {'subItem': o.defaults.subItem}});
		
	},
	
	hideAll: function() {
		this.hide();
		if(this.parent instanceof Dino.widgets.MenuItem) this.parent.hideSubmenu(true)
	}
	
	
//	defaultOptions: {
//		html: '<table cellspacing="0" cellpadding="0" border="0"><tbody/></table>',
//		defaultItem: {
//			dtype: 'box',
//			html: '<tr/>',
//			cls: 'menu-item',
//			defaultItem: {
//				dtype: 'box',
//				html: '<td/>'
//			},
//			items: [{
//				width: 24
//			}, {
//				dtype: 'text',							
//				width: 16
//			}, {
//			}]
//		}
//	}
	
	
	
}, 'menu-dropdown-box');



















/*
Dino.widgets.TextMenuItem = Dino.declare('Dino.widgets.TextMenuItem', 'Dino.widgets.MenuItem', {
	
	defaultOptions: {
		baseCls: 'dino-menu-item',
		components: {
			content: {
				dtype: 'text-item',
				xicon: 'dino-submenu-icon'
			},
			submenu: {
				defaultItem: {
					dtype: 'text-menu-item'
				}
			}
		},
		showLeftPanel: false
	},
	
	$opt: function(o) {
		Dino.widgets.TextMenuItem.superclass.$opt.call(this, o);
		
		if('text' in o) this.content.opt('text', o.text);
		if('format' in o) this.content.opt('format', o.format);
		
		if(o.showLeftPanel) this.content.states.set('left-panel');
	},
	
	getText: function() {
		return this.content.getText();
	}
	
	
}, 'text-menu-item');
*/


/*
Dino.widgets.CheckMenuItem = Dino.declare('Dino.widgets.CheckMenuItem', 'Dino.widgets.TextMenuItem', {
	
	defaultOptions: {
		components: {
			content: {
				components: {
					leftIcon: {
						dtype: 'checkbox'
					}
				}
			}
		}
	},
	
	getText: function() {
		return this.content.getText();
	}
	
	
}, 'check-menu-item');
*/






/**
 * @class
 * @extends Dino.containers.DropdownBox
 */
Dino.widgets.ContextMenu = Dino.declare('Dino.widgets.ContextMenu', 'Dino.widgets.MenuDropdownBox', /** @lends Dino.widgets.ContextMenu.prototype */{
	
	defaultOptions: {
//		hideOn: 'hoverOut',
		baseCls: 'dino-context-menu',
		renderTo: 'body',
		menuModel: {
			item: {
				onAction: function() {
					this.getParent(Dino.widgets.ContextMenu).events.fire('onSelect', {target: this});
				}
			}
		},
//		defaultItem: {
//			dtype: 'menu-item',
//			onAction: function(e) {
//				this.parent.events.fire('onAction', {target: e.target});
//				this.parent.hide();
//			}			
//		},
		offset: [-2, -2]
	}
	
/*	
	$events: function(self){
		Dino.widgets.ContextMenu.superclass.$events.call(this, self);
		
		this.el.bind('mouseleave', function(){ 
			if(self.options.hideOn == 'hoverOut') self.hide(); 
		});
	}
	
/*		
	show: function(x, y) {
		Dino.widgets.ContextMenu.superclass.show.apply(this, arguments);

		var self = this;
		
		if(this.options.hideOn == 'outerClick')
			$('body').one('click', function(){ self.hide(); });
				
	}
*/	
	
	
}, 'context-menu');





/**
 * @class
 * @extends Dino.Widget
 */
Dino.widgets.TreeNode = Dino.declare('Dino.widgets.TreeNode', 'Dino.Widget', /** @lends Dino.widgets.TreeNode.prototype */{

	defaultOptions: {
		cls: 'dino-tree-node',
		components: {
			subtree: {
				dtype: 'container',
				html: '<ul></ul>',
				defaultItem: {
					dtype: 'tree-node'
				}
			}
		},
		states: {
			'expand_collapse': ['expanded', 'collapsed']
		}
	},
	
	
	$html: function() { return '<li></li>'; },
	
	$init: function() {
		Dino.widgets.TreeNode.superclass.$init.apply(this, arguments);
		
		var o = this.options;
		
		if('subtree' in o){
			o.components.subtree.items = o.subtree;
		}

		if('defaultSubItem' in o){
			Dino.utils.overrideOpts(o.components.subtree.defaultItem, o.defaultSubItem, {'defaultSubItem': o.defaultSubItem});
		}
		
	},
	
	
//	$opt: function(o) {
//		Dino.widgets.TreeNode.superclass.$opt.apply(this, arguments);
//		
//	},
	
	collapse: function() {
		this.states.clear('expand_collapse');
	},
	
	expand: function() {
		this.states.set('expand_collapse');
	},
	
//	isSelected: function() {
//		return this.states.is('selected');
//	},
	
	walkSubtree: function(callback) {
		if( callback.call(this, this) === false ) return false;
		return this.subtree.eachItem(function(node){
			return node.walkSubtree(callback);
		});		
	},
	
	getParentNode: function() {
		var w = this.parent.parent;
		return (w instanceof Dino.widgets.TreeNode) ? w : undefined;
	}
	
}, 'tree-node');




/**
 * @class
 * @extends Dino.widgets.TreeNode
 */
Dino.widgets.BasicTreeNode = Dino.declare('Dino.widgets.BasicTreeNode', 'Dino.widgets.TreeNode', /** @lends Dino.widgets.BasicTreeNode.prototype */{
	
	
	defaultOptions: {
//		baseCls: 'dino-basic-tree-node',
		components: {
			button: {
				weight: 1,
				dtype: 'icon',
				cls: 'dino-tree-node-button',
				states: {
					'leaf': 'hidden'
				},
				events: {
					'click': function(e, w) {
						w.parent.states.toggle('expand_collapse');
					}
				}
			},
			content: {
				dtype: 'text-item',
				cls: 'dino-tree-node-content',
				weight: 2
			},
			subtree: {
				weight: 3,
				defaultItem: {
					dtype: 'basic-tree-node'
				}
			}
		},
		states: {
			'expanded': function(on) {
				this.button.states.toggle('expanded', on);
			},
			'collapsed': function(on) {
				this.button.states.toggle('collapsed', on);
			}
		},
		expandOnShow: false
	},
	
	
	$init: function(o) {
		Dino.widgets.BasicTreeNode.superclass.$init.apply(this, arguments);		
	},
	
	$opt: function(o) {
		Dino.widgets.BasicTreeNode.superclass.$opt.call(this, o);
		
		if('isLeaf' in o) this.button.states.set('leaf');
		
		if('icon' in o) this.content.opt('icon', o.icon);
		if('text' in o) this.content.opt('text', o.text);
		if('format' in o) this.content.opt('format', o.format);

	},
	
	$events: function(self) {
		Dino.widgets.BasicTreeNode.superclass.$events.apply(this, arguments);
		
//		this.events.reg('onStateChanged', function(e) {
//			e.translate(this.button);
//			e.translate(this.content.leftIcon);
//		});

//		this.content.el.click(function(){
//			if(self.options.toggleOnClick)
//				self.states.toggle('collapsed');
//		});		
	},
	
	$afterBuild: function() {
		Dino.widgets.BasicTreeNode.superclass.$afterBuild.apply(this, arguments);
		
		(this.options.expandOnShow) ? this.states.set('expand_collapse') : this.states.clear('expand_collapse');
		
//		this.states.set( (this.options.expandOnShow) ? 'expanded': 'collapsed' );
	},
	
	getText: function() {
		return this.content.getText();
	}
	
	
}, 'basic-tree-node');






/*
Dino.declare('Dino.widgets.Tree', 'Dino.Widget', {
	
	$html: function() { return '<div></div>'; },
	
	defaultOptions: {
		cls: 'tree',
		components: {
			content: {
				dtype: 'basic-tree-node',
				indent: 0,
				expandOnShow: true,
				defaultSubItem: {}
			}
		},
		treeModel: {
			node: {},
			indent: {}
		}
	},
	
	$init: function(o) {
//		Dino.widgets.Tree.superclass.$init.apply(this, arguments);
		this.constructor.superclass.$init.apply(this, arguments);
		
		Dino.utils.overrideOpts(o.components.content.defaultSubItem, o.treeModel.node, {
			components: {
				content: {
					components: {
						indent: {
							defaultItem: o.treeModel.indent
						}
					}
				}			
			}
		});
		
		if('subtree' in o)
			o.components.content.subtree = o.subtree;
			
	}
	
	
	
}, 'tree');
*/

/*
Dino.declare('Dino.widgets.XTree', 'Dino.widgets.TextTreeItem', {
	
	$html: function() { return '<div></div>'; },
	
	defaultOptions: {
		cls: 'tree',
		defaultSubItem: {
			dtype: 'text-tree-item'
			
//			components: {
//				button: {
//					states: {
//						'collapsed': function() { if(!this.parent.isLeaf) return ['ui-icon ui-icon-triangle-1-e', 'ui-icon ui-icon-triangle-1-se'] },
//						'expanded': function() { if(!this.parent.isLeaf) return ['ui-icon ui-icon-triangle-1-se', 'ui-icon ui-icon-triangle-1-e'] },
//						'hover': function() { if(!this.parent.isLeaf) return ['ui-icon-lightgray', 'ui-icon']; }
//					}
//				}
//			}
			
		},
		indent: 0,
		expandOnShow: true
	},
	
	$init: function() {
		Dino.widgets.Tree.superclass.$init.apply(this, arguments);		
		
		var o = this.options;
		
		if('isDynamic' in o) {
			o.components.subtree.dynamic = true;
			
			var dynamicSubItem = { 
				components: { 
					subtree: {
						dataId: 'children', 
						dynamic: true
					}
				}
			};
			
			//сложная перегрузка опции для того, чтобы приоритет пользовательских опций был выше
			o.components.subtree.defaultItem = Dino.utils.overrideOpts({}, dynamicSubItem, {'defaultSubItem': dynamicSubItem}, o.components.subtree.defaultItem);
		}
		
	},
	
	$opt: function(o) {
		Dino.widgets.Tree.superclass.$opt.apply(this, arguments);
		
//		var self = this;
				
	},
	
	setSelectedNode: function(node_to_select) {
		this.walkSubtree(function(node){
			if(node.isSelected()) node.states.clear('selected');
		});
		node_to_select.states.set('selected');
		
		//TODO  здесь еще можно запомнить выбранный узел
	}
	
}, 'xtree');
*/








/**
 * Простое дерево с отступами.
 * 
 * @class
 * @extends Dino.containers.Box
 */
Dino.widgets.Tree = Dino.declare('Dino.widgets.Tree', 'Dino.containers.Box', /** @lends Dino.widgets.Tree.prototype */{
	
	defaultOptions: {
		cls: 'dino-tree',
		defaultItem: {
			dtype: 'basic-tree-node',
			indent: 0,
			expandOnShow: true,
			defaultSubItem: {}
		},
		treeModel: {
			node: {}
		}		
	},
	
	
	$init: function(o){
		Dino.widgets.Tree.superclass.$init.apply(this, arguments);
		
		
		if('subtree' in o) 
			o.items = o.subtree;
		
		if('isDynamic' in o) {
			
			o.dynamic = true;
			
			var dynamicItem = {
				components: {
					subtree: {
						dynamic: true,
						dataId: 'children'
					}
				}
			};
			
			Dino.utils.overrideOpts(o.defaultItem, dynamicItem);
			Dino.utils.overrideOpts(o.defaultItem.defaultSubItem, dynamicItem);
		}
		
		
		Dino.utils.overrideOpts(o.defaultItem, o.treeModel.node);
		Dino.utils.overrideOpts(o.defaultItem.defaultSubItem, o.treeModel.node);
		
	},
	
	setSelected: function(node_to_select) {
		
		this.eachItem(function(item){
			item.walkSubtree(function(node){
				if(node.isSelected()){
					node.states.clear('selected');
					node.events.fire('onUnselected');
				}
			});
		});
		
		if(node_to_select) {
			node_to_select.states.set('selected');
			node_to_select.events.fire('onSelected');
			
			this.selected_node = node_to_select;
		}
		
	},
	
	getSelected: function() {
		return this.selected_node;
	},
	
	
	
	walkTree: function(callback) {
		this.eachItem(function(item){
			return item.walkSubtree(function(node){
				return callback.call(this, node);
			});
		});		
	}
	
	
/*	
	getNode: function(criteria) {
		
		var f = null;
		
		if( _dino.isString(i) ) f = _dino.filters.by_props.curry({'tag': i});
		else if( _dino.isFunction(i) ) f = i;
		else if( _dino.isPlainObject(i) ) f = _dino.filters.by_props.curry(i);
		
		var result = null;
		
		this.eachItem(function(item){
			return item.walkSubtree(function(node){
				if( f.call(node) ) {
					result = node;
					return false;
				}
			});
		});
	}
*/	
	
}, 'tree');


/*
Dino.declare('Dino.widgets.Tree', 'Dino.Widget', {
	
	defaultOptions: {
		cls: 'tree'
	
	
	}
	
	
	
}, 'tree');
*/






Dino.declare('Dino.framework.Application', 'Dino.BaseObject', {
	
	initialize: function(o) {
		Dino.framework.Application.superclass.initialize.apply(this, arguments);		
		
		var self = this;
		
//		$(window).ready(function() {
			
			// Растягиваем страницу на всю высоту окна	
		var h = $(window).height();
		var dh = $('body').outerHeight(true) - $('body').height();
		$('body').height(h - dh);
		$('body').attr('autoheight', true);	
		

		$(document).ajaxError(function(e, xhr, ajaxOpts, err) {
			growl.err(xhr.responseText, true);
		});
		
		
		this.root = $.dino(Dino.utils.overrideOpts({
			dtype: 'box',
			renderTo: 'body',
			cls: 'application'
		}, o));
		
		
		$(window).resize(function(){
			
			var dh = $('body').outerHeight(true) - $('body').height();
			$('body').hide();
			var h = $(window).height();			
			$('body').height(h - dh);
			$('body').show();
			
			self.root.$layoutChanged();
		});	
		
		this.init_default_growl();	 //<-- инициализируем growl	
			
//		});
		
	},
	
	
	init_default_growl: function() {
		
		this.growl = $.dino({
			dtype: 'growl-box',
			renderTo: 'body'
		});
	
		var self = this;
	
		growl = {
				info: function(m, isHtml) {this.msg(m, 'info', isHtml);},
				err: function(m, isHtml) {this.msg(m, 'critical', isHtml);},
				warn: function(m, isHtml) {this.msg(m, 'warning', isHtml);},
//				html: function(m, isHtml) { Dino.growl.addItem({html: m, icon: 'dino-icon-growlbox-info'}) },
				msg: function(m, type, isHtml) {
					var s = (Dino.isString(m)) ? m : Dino.pretty_print(m);
					var o = {
						icon: 'dino-icon-growlbox-'+type,
						state: type,
						cls: 'dino-dropdown-shadow'					
					};
					(isHtml) ? o.htmlMessage = s : o.message = s;
					self.growl.addItem(o);
				}
			}
		
		
	}
		
});



Dino.declare('Dino.remote.Collection', 'Dino.events.Observer', {
	
	initialize: function(name, source, o) {
		Dino.remote.Collection.superclass.initialize.apply(this, arguments);
		this.name = name;
		this.source = source;
		this.backend = o.backend;
	},
	
	/**
	 * Добавление объекта в коллекцию
	 * 
	 * @param {Object} val
	 * @param {Object} callback
	 */
	add: function(val, callback) {
		var self = this;
		val['_method'] = 'put';
		$.post(this.path(), val, function(data){
			if(self.backend) self.backend.add(data);
			if(callback) callback.call(this, data);
		}, 'json');
	},
	
	/**
	 * Удаление объекта из коллекции
	 * 
	 * @param {Object} id
	 * @param {Object} callback
	 */
	remove: function(id, callback) {
		var self = this;
		$.post(this.path() + '/'+id, {'_method': 'delete'}, function(data){
//			if(self.backend) 
//				self.backend.find(function(item){ return item.get('id') == id; }).del();
			if(callback) callback.call(this, data);
		}, 'json');		
	},
	
	
	/**
	 * Обновление объекта
	 * 
	 * @param {Object} id
	 * @param {Object} val
	 * @param {Object} callback
	 */
	update: function(id, val, callback) {
		var self = this;
		$.post(this.path() + '/'+id, val, function(data){
			//TODO
			if(callback) callback.call(this, data);
		}, 'json');		
	},
	
	/**
	 * Загрузка объекта
	 * 
	 * @param {Object} id
	 * @param {Object} callback
	 */
	load: function(id, callback) {
		var self = this;
		$.getJSON(this.path()+'/'+id, {}, function(data){
			if(callback) callback.call(this, data);
		});
	},
	
	/**
	 * Загрузка всех объектов
	 * 
	 * @param {Object} callback
	 */
	load_all: function(callback) {
		var self = this;
		$.getJSON(this.path(), {'query': 'all'}, function(data){
			if(self.backend) 
				self.backend.set(data);
			if(callback) 
				callback.call(this, data);
		});		
	},
	
	load_subtree: function(id, callback) {
		var self = this;
		$.getJSON(this.path(), {'subtree': 'all', 'id': id}, function(data){
			if(callback) 
				callback.call(this, data);
		});				
	},
	
	/**
	 * Загрузка подмножества объектов
	 * 
	 * @param {Object} fromIndex
	 * @param {Object} toIndex
	 * @param {Object} orderField
	 * @param {Object} callback
	 */
	load_range: function(fromIndex, toIndex, orderField, callback) {
		$.getJSON(this.path(), {'query': 'range', 'from': fromIndex, 'to': toIndex, 'order': orderField}, function(data){
			//TODO
			if(callback) 
				callback.call(this, data.data, data.from, data.to, data.count);
		});				
	},
	
	path: function() {
		return (this.source ? this.source.path() + '/' : '') + this.name;
	}
	
});

Dino.validators = {};



Dino.validators.RangeValidator = function(val, min, max) {
	return (val >= min && val <= max);
}


Dino.validators.RegexpValidator = function(val, regexp) {
	return regexp.test(val);
}



Dino.declare('Dino.utils.UpdateBuffer', 'Dino.events.Observer', {
	
	initialize: function(o){
		Dino.utils.UpdateBuffer.superclass.initialize.apply(this, arguments);
		this.buffer = {};
		
		if(o) {
			if('onAdd' in o) this.events.reg('onAdd', o.onAdd);
			if('onDelete' in o) this.events.reg('onDelete', o.onDelete);
			if('onUpdate' in o) this.events.reg('onUpdate', o.onUpdate);			
		}
		
		this.id_counter = 1;
	},
	
	add: function(val) {
		// если ID не указан, то задаем временный
		if(!('id' in val)) val.id = 'temp-'+this.id_counter++;

		this.buffer[val.id] = {event: 'Add', value: val};
	},

	upd: function(val) {		
		if(val.id in this.buffer)
			this.buffer[val.id].value = val;
		else
			this.buffer[val.id] = {event: 'Update', value: val};			
	},
	
	del: function(val) {
		this.buffer[val.id] = {event: 'Delete', value: val}
	},
	
	flush: function(callback) {
		var self = this;
		if(arguments.length > 0)
			Dino.each(this.buffer, function(item){ callback.call(self, item.value, item.event); });
		else
			Dino.each(this.buffer, function(item){ self.events.fire('on' + item.event, item); });
			
		this.clear();
	},
	
	clear: function() {
		this.buffer = {};		
	},
	
	each: function(callback) {
		for (var i in this.buffer) {
			var item = this.buffer[i];
			callback.call(this, item.value, item.event);
		}		
	}
	
});



Dino.formats = {}


Dino.format_currency = function(val, sign) {
//	if(Dino.isString(val)) val = parseFloat(val);
	return sign + val.toFixed(2);
}


Dino.format_date = function(date) {
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	if(month < 10) month = '0'+month;
	var day = date.getDate();
	if(day < 10) day = '0'+day;
	return Dino.format('%s-%s-%s', year, month,day);
}


var profiler = {
	enabled: false,
	
	results: {},
	counters: {},
	
	clear: function(name) {
		delete this.results[name];
		delete this.counters[name];
	},
	
	start: function(name) {
		this.counters[name] = {};
		if(!(name in this.results)) this.results[name] = {};
		// инициализируем первоначальное значение
		this.counters[name].times = [Dino.timestamp()];
	},
	
	stop: function(name) {
		var c = this.counters[name];
		var r = this.results[name];
		var t = c.times[0];
		for(var i = 1; i < c.times.length; i++) {
			var key = c.times[i][0];
			if(!(key in r)) r[key] = 0;
			r[key] += c.times[i][1] - t;
			t = c.times[i][1];
		}
	},
	
	tick: function(counter, name) {
		this.counters[counter].times.push([name, Dino.timestamp()]);
	},
	
	print_result: function(counter) {
		var a = [];
		var tot = 0;
		Dino.each(this.results[counter], function(dt, i){ a.push(''+i+': '+dt); tot+=dt; });
		return a.join(', ') + ' ('+tot+')';
	}
	
};
