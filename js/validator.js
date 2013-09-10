/**
 * 
 * @authors Damon (398846606@qq.com)
 * @date    2013-09-09 15:26:40
 * @version 0.1.0 - 简单的表单验证插件，暂时能够验证: 1.必填; 
 *          										  2.数字 / 字母 / 数字+字母 / 数字+下划线 / 字母+下划线 / 数字+字母+下划线;
 *          										  3.最大长度和最小长度
 */

;(function(window, document, undefined){
	var defaults = {
		messages: {
			required: 'The %s field is required.',
			alpha_num_dash: 'The %s field can use a-z, A-Z, 0-9, "_" only.',
			alpha_dash: 'The %s field can use a-z, A-Z, "_" only.',
			alpha_num: 'The %s field can use a-z, A-Z, 0-9 only.',
			num_dash: 'The %s field can use 0-9 "_" only.',
			alpha: 'The %s field can use a-z, A-Z only',
			numeric: 'The %s field can use 0-9 only.',
			max_length: 'The %s must not exceed %d characters in length.',
			min_length: 'The %s must be at least %d characters in length.'
		},
		callback: function(errors){ // 默认提示方式：弹窗
			for(var i = 0, len = errors.length; i < len; i++){
				alert(errors[i].message);
				break;
			}
		}
	};

	var ruleReg = /^(.+?)\[(.+?)\]$/,
		numericReg = /^[0-9]+$/,
		alphaNumericReg = /^[a-zA-Z0-9]+$/,
		alphaNumericDashReg = /^[a-zA-Z0-9_]+$/,
		alphaDashReg = /^[a-zA-Z_]$/,
		numDashReg = /^[0-9_]$/,
		alphaReg = /^[a-zA-Z]$/;

	var Validator = function(formNameOrNode, fields, callback){
		this.errors = [];
		this.fields = {}; // property: name, display, rules, value, checked, id, type, message
		// this.fields' structure
		// this.fields = { name: {pro1: val1, pro2: val2}, name2: { pro1: val1, pro2: val2 }, ... }
		this.form = this._formByNameOrNode(formNameOrNode);
		this.callback = callback || defaults.callback;
		this.messages = {}; // custom message
		this.handlers = {}; // custom function
		
		for(var i = 0, len = fields.length; i < len; i++){
			var field = fields[i];
			if(!field.name || !field.rules){
				continue;
			}
			this._addField(field, field.name);
		}

		// 提交表单时触发验证函数
		var _onsubmit = this.form.onsubmit;

		this.form.onsubmit = (function(that) {
			return function(e){
				return that._validateForm(e) && (_onsubmit === undefined || _onsubmit());
			}
        })(this);

	},

	getAttributeValue = function(element, attributeName){
		if(element && element.length > 0 && (element[0].type == 'checkbox' || element[0].type == 'radio')){
			for(var i = 0, len = element.length; i < len; i++){
				if(element[i].checked){
					return element[i][attributeName];
				}
			}
			return;
		}
		return element[attributeName];
	};

	Validator.prototype.registerCallback = function(name, handler){
		if(name && typeof name === 'string' && handler && typeof handler === 'function'){
			this.handlers[name] = handler;
		}
		return this;
	};

	Validator.prototype.setMessage = function(ruleName, message){
		this.messages[ruleName] = message;
		return this;
	};

	Validator.prototype._formByNameOrNode = function(formNameOrNode){
		return typeof formNameOrNode === 'object' ? formNameOrNode : document.forms[formNameOrNode];
	};

	Validator.prototype._addField = function(field, name){
		this.fields[name] = {
			name: name,
			display: field.display || name,
			rules: field.rules,
			message: field.message,
			value: null,
			checked: null,
			id: null,
			type: null
		};
	};

	Validator.prototype._validateForm = function(e){
		this.errors = [];
		for(var p in this.fields){
			if(this.fields.hasOwnProperty(p)){
				var field = this.fields[p],
					element = this.form[field.name];
				field.value = getAttributeValue(element, 'value');
				field.checked = getAttributeValue(element, 'checked');
				field.id = getAttributeValue(element, 'id');
				field.type = element.length > 0 ? element[0].type : element.type;

				this._validateField(field);
			}
		}
		if(this.errors.length > 0){
			if(e && e.preventDefault){
				e.preventDefault();
			} else if(event){
				event.returnValue = false;
			}
		}

		if(typeof this.callback === 'function'){
			this.callback(this.errors);
		}
	};

	Validator.prototype._validateField = function(field){
		var rules = field.rules.split('|'),
			fail = false;

		for(var i = 0, len = rules.length; i < len; i++){
			var rule = rules[i],
				part = ruleReg.exec(rule),
				parm = null;

			if(part){
				rule = part[1];
				parm = part[2];
			}

			if(typeof this._hook[rule] === 'function'){
				if(!this._hook[rule].apply(this, [field, parm])){
					fail = true;
				}
			} else if(rule.substr(0, 9) == 'callback_'){
				rule = rule.substr(9, rule.length - 1);
				if(typeof this.handlers[rule] === 'function'){
					if(this.handlers[rule].apply(this, [field.value, parm]) === false){
						fail = true;
					}
				}			
			}
			if(fail){ break;}
		}

		if(fail){
			if(field.message == undefined){
				field.message = null;
				var source = defaults.messages[rule], message;
				if(source){
					message = source.replace('%s', field.display || field.name);
					if(parm){
						message = message.replace('%d', parm);
					}
				} else {
					message = this.messages[rule];
				}
			}
			this.errors.push({
				id: field.id,
				name: field.name,
				message: field.message || message,
				rule: field.rules
			});
		}
	};

	Validator.prototype._hook = {
		required: function(field){
			if((field.type === 'checkbox') || (field.type === 'radio')){
				return field.checked = true;
			}
			return (field.value != null && field.value != '');
		},
		alpha_num_dash: function(field){
			return alphaNumericDashReg.test(field.value);
		},
		alpha_num: function(field){
			return alphaNumericReg.test(field.value);
		},
		numeric: function(field){
			return numericReg.test(field.value);
		},
		max_length: function(field, parm){
			if(field.value.length > Number(parm)){
				return false;
			}
			return true;
		},
		min_length: function(field, parm){
			if(field.value.length < Number(parm)){
				return false;
			}
			return true;
		},
		alpha_dash: function(field){
			return alphaDashReg.test(field.value);
		},
		num_dash: function(field){
			return numDashReg.test(field.value);
		},
		alpha: function(field){
			return alphaReg.test(field.value);
		}
	};

	window.Validator = Validator;

})(window, document);