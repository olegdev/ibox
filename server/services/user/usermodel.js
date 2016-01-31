/**
 * Сервис модели юзера.
 * @singleton
 */
var config = require(BASE_PATH + '/server/util').getModuleConfig(__filename);
var logger = require(SERVICES_PATH + '/logger/logger')(__filename);
var error = require(SERVICES_PATH + '/error');
var mongoose = require("mongoose");
var fs = require('fs');

var Service = function() {
	var me = this;
	me.addons = {};
	// подключаю все доступные аддоны
	config.addons.forEach(function(addonName) {
		if (fs.existsSync(__dirname + '/addons/' + addonName + '.js')) {
			me.addons[addonName] = require(__dirname + '/addons/' + addonName);
		} else {
			/****/ logger.warn('usermodel@constructor Cannot find addon file', addonName);
		}
	});
}

Service.prototype.factory = function(model) {
	var me = this,
		addons = {};
	Object.keys(me.addons).forEach(function(addonName) {
		addons[addonName] = me.addons[addonName].factory(model);
	});
	return new UserModel(model, addons);
}

/**
 * Класс модели
 */
var UserModel = function(model, addons) {
	this.id = model.id;
	this.model = model;
	this.addons = addons;
}

UserModel.prototype.getConfig = function(callback) {
	var me = this,
		config = {};

	Object.keys(me.addons).forEach(function(addonName) {
		if (typeof me.addons[addonName].getConfig == 'function') {
			config[addonName] = me.addons[addonName].getConfig();
		} else {
			/****/ logger.warn('usermodel@getConfig Addon "' + addonName + '" does not provide method getConfig');	
		}
	});

	callback(null, config);
}

UserModel.prototype.get = function(path) {
	var me = this,
		addons = {},
		result = {};

	path.split(';').forEach(function(addonPath) {
		if (addonPath) {
			var parts = addonPath.split(':');
			if (parts.length > 1) {
				addons[parts.shift()] = parts[0].split(',');
			} else {
				addons[addonPath] = [];
			}
		}
	});

	Object.keys(addons).forEach(function(addonName) {
		if (me.addons[addonName] && typeof me.addons[addonName].get == 'function') {
			result[addonName] = me.addons[addonName].get(addons[addonName]);
		} else {
			/****/ logger.warn('usermodel@get Unknown addon "' + addonName + '" or addon does not provide method get');	
		}
	});

	return result;
}

// Создает только один экземпляр класса
Service.getInstance = function(){
    if (!this.instance) {
    	this.instance = new Service();
    }
    return this.instance;
}

module.exports = Service.getInstance();