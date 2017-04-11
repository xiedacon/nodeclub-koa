var fs = require('fs');
var path = require('path');

module.exports = function (template) {

	var cacheStore = template.cache;
	var defaults = template.defaults;
	var rExtname;

	// 提供新的配置字段
	defaults.base = '';
	defaults.extname = '.html';
	defaults.encoding = 'utf-8';
	defaults.async = true;

	async function compileFromFS(filename, async) {
		// 加载模板并编译
		var source = await readTemplate(filename, async);
		if (typeof source === 'string') {
			return template.compile(source, {
				filename: filename
			}, async);
		}
	}


	let _parser = defaults.parser;
	defaults.parser = function(code, options){
		if(options.async){
			code = code.replace(/^\s/, '');

			var split = code.split(' ');
			var key = split.shift();
			// var args = split.join(' ');
			switch(key){
				case 'each':
					var object = split[0] || '$data';
					var as     = split[1] || 'as';
					var value  = split[2] || '$value';
					var index  = split[3] || '$index';
					
					var param   = value + ',' + index;
					
					if (as !== 'as') object = '[]';
					
					return `await $each(${object},async function(${param}){`;
				case 'include':
					var args = split.shift();

					if(split.length > 0){
						args += `,${split.join(' ')}`;
					}
					
					return `await ${key}(${args});`;
			}
		}
		return _parser(code, options);
	}

	// 重写引擎编译结果获取方法
	template.get = function (filename, async) {
		
	    var fn;


	    if (cacheStore.hasOwnProperty(filename)) {
	        // 使用内存缓存
	        fn = cacheStore[filename];
	    } else {
			fn = compileFromFS(filename, async);
	    }

	    return fn;
	};

	
	function readTemplate (id, async) {
	    id = path.join(defaults.base, id + defaults.extname);
		
	    if (id.indexOf(defaults.base) !== 0) {
	        // 安全限制：禁止超出模板目录之外调用文件
	        throw new Error('"' + id + '" is not in the template directory');
	    } else {
			async += '';
	        try {
				if(async === 'true' || (defaults.async && !async)){
					return new Promise((resolve, reject = (e) => {throw e;}) => {
						fs.readFile(id, defaults.encoding, (err, data) => {
							if(err) return reject(err);
							resolve(data);
						});
					});
				}else{
					return fs.readFileSync(id, defaults.encoding);
				}
	        } catch (e) {}
	    }
	}


	// 重写模板`include``语句实现方法，转换模板为绝对路径
	template.utils.$include = function (filename, data, from, async) {
	    
		from = path.dirname(from);
	    filename = path.join(from, filename);
	    return template.renderFile(filename, data, async);
	}

	// 重写模板`each``语句实现方法
	template.utils.$each = async function (data, callback) {
		var i, len;        
		if (Array.isArray(data)) {
			for (i = 0, len = data.length; i < len; i++) {
				await callback.call(data, data[i], i, data);
			}
		} else {
			for (i in data) {
				await callback.call(data, data[i], i);
			}
		}
	};


	// express support
	template.__express = function (file, options, fn) {

	    if (typeof options === 'function') {
	        fn = options;
	        options = {};
	    }


		if (!rExtname) {
			// 去掉 express 传入的路径
			rExtname = new RegExp((defaults.extname + '$').replace(/\./g, '\\.'));
		}


	    file = file.replace(rExtname, '');

	    options.filename = file;
	    fn(null, template.renderFile(file, options));
	};

	template.renderFile = async function (filename, data, async) {
		var fn = await template.get(filename, async) || showDebugInfo({
			filename: filename,
			name: 'Render Error',
			message: 'Template not found'
		});
		return data ? fn(data) : fn;
	};

	// 模板调试器
	var showDebugInfo = function (e) {

		template.onerror(e);
		
		return function () {
			return '{Template Error}';
		};
	};


	return template;
}