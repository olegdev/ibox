/**
 * Модуль боя.
 *
 */
define([
	'jquery',
	'underscore',
	'backbone',
	'sockets/sockets',
	'battle/views/battle_container',
], function($, _, Backbone, sockets, BattleContainerView) {

	var channel = sockets.createChannel('battle'),
		battle;

	/*** API listeners */
	channel.on('start', function(data) {
		showBattle(data);
	});

	/*** Старт боя */
	var showBattle = function(data) {
		var side1, side2;

		if (data.battle.sides[0].u.id == APP.user.attributes.id) {
			side1 = data.battle.sides[0];
			side2 = data.battle.sides[1];
		} else {
			side1 = data.battle.sides[1];
			side2 = data.battle.sides[0];
		}

		var battleContainerView = new BattleContainerView({
			side1: side1,
			side2: side2,
			fieldSize: data.battle.fieldSize,
		});

		battleContainerView.on('submit', function(word) {
			channel.push('word', {word});
		});
	}

	return {
		loadAndShow: function() {
			channel.push('get_battle', {}, function(data) {
				showBattle(data);
			});
		}
	};
});