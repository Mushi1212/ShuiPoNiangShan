//import { effect } from "../../../game/vue.esm-browser.js";
import { lib, game, ui, get, ai, _status } from "noname";
/** @type { importCharacterConfig['skill'] } */
const skills = {
	// ... 从旧文件第830行起复制
	shqinhui: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseUseBegin",
		},
		direct: true,
		filter: function (event, player) {
			return player.countCards("he") > 0;
		},
		async content(event, trigger, player) {
			const result = await player
				.chooseToDiscard(get.prompt2("shqinhui"), [1, player.countCards("he")], "he")
				.set("ai", function (card) {
					return 3 - get.value(card);
				})
				.set("logSkill", "shqinhui")
				.forResult();
			if (result.bool) {
				const num = result.cards.length;
				player.storage.shqinhui_draw = num;
				player.addSkill("shqinhui_draw");
				game.addVideo("storage", player, ["shqinhui_draw", num]);
			}
		},
		subSkill: {
			draw: {
				mod: {
					aiOrder: function (player, card, num) {
						if (typeof card == "object" && player == _status.currentPhase) {
							var suits = lib.skill.shmifeng.getSuit();
							const numx = suits.length;
							if (numx < player.storage.shqinhui_draw && !suits.includes(get.suit(card, false))) return num + 3;
							if (suits.includes(get.suit(card, false))) return num;
							if (player.countCards("h") <= player.getHandcardLimit()) return 0;
						}
					},
				},
				forced: true,
				trigger: {
					player: "phaseAfter",
				},
				mark: true,
				audio: false,
				async content(event, trigger, player) {
					var suits = lib.skill.shmifeng.getSuit();
					const numx = suits.length;
					//game.log(numx)
					if (player.storage.shqinhui_draw == numx) {
						game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shqinhui_draw.mp3");
						await player.draw(3);
					}
					player.removeSkill("shqinhui_draw");
					delete player.storage.shqinhui_draw;
				},

				intro: {
					content: function (num) {
						return "回合结束时，若本回合共有" + get.cnNumber(num) + "种花色的牌进入了弃牌堆，你摸三张牌";
					},
				},
			},
		},
	},

	shxingbin: {
		enable: "phaseUse",
		usable: 1,
		filterTarget: function (card, player, target) {
			return target != player;
		},
		selectTarget: [1, 3],
		filter: function (event, player) {
			return player.countCards("h") > 0;
		},
		multitarget: true,
		multiline: true,
		content: function () {
			"step 0";
			player.showHandcards();
			var cards = player.getCards("h");
			event.cards = cards;
			event.recover = [];
			event.num2 = cards.length - targets.length;
			("step 1");
			var target = targets.shift();
			event.target = target;
			var next = target.chooseButton(["选择获得一张牌", event.cards.slice(0)]);
			next.set("num", event.num2);
			next.set("goon", event.cards.length <= targets.length + 1);
			next.set("ai", function (button) {
				var player = _status.event.player;
				var target = _status.event.getParent().player;
				var num = target.countCards("h");
				var card = button.link;
				var att = get.attitude(player, target);
				var val = card.name == "tao" || card.name == "jiu" ? 10 : get.value(card);
				if (_status.event.goon) {
					if (att > 1 && _status.event.num <= 0) return val;
					return val - 7;
				}
				return 0;
			});
			("step 2");
			if (result.bool && event.cards.length) {
				var card = result.links[0];
				event.target.gain(card, player, "gain2");
				event.cards.remove(card);
			} else {
				player.draw();
				event.recover.push(event.target);
			}
			if (targets.length) event.goto(1);
			("step 3");
			if (event.recover.length) {
				var num = 0;
				for (var i of event.recover) num += get.recoverEffect(i, player, player);
				var next = player.chooseBool("是否让" + get.translation(event.recover) + "回复一点体力？");
				next.set("goon", num > 0);
				next.set("ai", function (event, player) {
					return _status.event.goon;
				});
			} else event.goto(5);
			("step 4");
			if (result.bool) {
				for (var i of event.recover) {
					i.recover();
				}
			}
			("step 5");
			if (event.cards.length) {
				player.discard(event.cards, "notBySelf");
			} else {
				//var stat=player.getStat().skill;
				//delete stat.兴宾;
				player.draw(2);
			}
		},
		ai: {
			expose: 0.3,
			order: function () {
				var player = _status.event.player;
				var x = Math.min(3, game.filterPlayer(current => get.attitude(player, current) > 1).length - 1);
				if (player.getCards("h").length > x) return 0;
				return 10 - player.getCards("h").length;
			},
			result: {
				target: 1,
			},
		},
	},
	shfengyuan: {
		init: function (player) {
			player.storage.shfengyuan = 0;
		},
		trigger: {
			global: ["phaseJudgeBegin", "phaseDrawBegin", "phaseUseBegin", "phaseDiscardBegin"],
		},
		filter: function (event, player) {
			if (player == event.player) return false;
			var X = player.storage.shfengyuan;
			if (X) X++;
			else X = 1;
			return player.countCards("he") >= X && event.player.countCards("h") < event.player.hp;
		},
		logTarget: "player",
		check: function (event, player) {
			if (get.attitude(player, event.player) < 3) return false;
			return true;
		},
		content: function () {
			"step 0";
			player.storage.shfengyuan++;
			var num2 = player.storage.shfengyuan;
			player.chooseCard(num2, "he", true, "交给" + get.translation(trigger.player) + get.cnNumber(num2) + "张牌").set("ai", function (card) {
				var att = get.attitude(player, target);
				if (att > 0) return att * 6 - get.value(card);
				return 0;
			});
			("step 1");
			player.give(result.cards, trigger.player);
			event.cards = result.cards;
			event.type = [];
			for (var i of event.cards) {
				var typex = get.type2(i);
				if (!event.type.includes(typex)) event.type.push(typex);
			}
			("step 2");
			trigger.player.chooseBool("是否摸两张牌并交给" + get.translation(player) + "一张牌（不能是" + get.translation(event.type) + "）").ai = function (event, player) {
				var target = _status.event.getTrigger().player;
				if (get.attitude(player, target) < 1) return 0;
				return 1;
			};
			("step 3");
			if (result.bool) {
				trigger.player.draw(2);
				var next = trigger.player.chooseCard(
					"he",
					function (card) {
						var type = get.type2(card);
						return !event.type.includes(type);
					},
					true,
					"交给" + get.translation(player) + "一张牌（不能是" + get.translation(event.type) + "）"
				);
				next.set("target", player);
				next.set("player", trigger.player);
				next.set("ai", function (card) {
					var player = _status.event.player;
					var target = _status.event.target;
					var att = get.attitude(player, target) > 1 ? 2 : 0.5;
					var val1 = att * get.value(card, target) - get.value(card, player);
					return val1 + 10;
				});
			} else event.finish();
			("step 4");
			if (result.bool) {
				trigger.player.give(result.cards, player);
			}
		},
		ai: {
			expose: 0.5,
		},
		group: "shfengyuan_clear",
		subSkill: {
			clear: {
				trigger: {
					global: "phaseBefore",
				},
				forced: true,
				silent: true,
				popup: false,
				content: function () {
					player.storage.shfengyuan = 0;
				},
				sub: true,
				_priority: 1,
			},
		},
	},
	shboshi: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			target: "useCardToTargeted",
		},
		usable: 1,
		filter: function (event, player) {
			if (event.player == player || !event.cards.length) return false;
			return (get.type(event.card) == "basic" || get.type2(event.card) == "trick") && event.targets && event.targets.length == 1;
		},
		prompt: function (event, player) {
			return "是否无效" + get.translation(event.card) + "？";
		},
		async content(event, trigger, player) {
			await player.gain(trigger.cards, "gain2");
			trigger.getParent().excluded.add(player);
			trigger.player.addTempSkill("shboshi_buff");
		},
		ai: {
			effect: {
				target_use: function (card, player, target, current) {
					//if(target==player||)) return;
					if ((get.type(card) == "basic" || get.type2(card) == "trick") && target != player && !target.hasHistory("useSkill", evt => evt.skill == "shboshi")) {
						if (_status.event.name == "shboshi") return;
						if (get.attitude(player, target) > 0 && current < 0) return "zerotarget";
						var hs = player.getCards("h", card => {
							if (get.type(card) == "equip" || get.type(card) == "delay") return false;
							return player.hasValueTarget(card, null, true);
						});
						hs.remove(card);
						if (card.cards) hs.removeArray(card.cards);
						else hs.removeArray(ui.selected.cards);
						if (!hs.length) return "zerotarget";
						if (player.hasSkill("jiu") || player.hasSkill("tianxianjiu")) return;
						return [1, 0, 1, -0.5];
					}
				},
			},
		},
		subSkill: {
			buff: {
				mod: {
					aiOrder: function (player, card, num) {
						if (typeof card == "object" && player == _status.currentPhase) {
							if (get.type(card) == "basic" || get.type(card) == "trick") return num * 3;
							return num / 5;
						}
					},
				},
				mark: true,
				trigger: {
					global: "useCard",
				},
				forced: true,
				popup: false,
				content: function () {
					trigger.effectCount++;
					player.removeSkill("shboshi_buff");
				},
				intro: {
					content: "本回合下一张牌额外结算一次",
				},
				sub: true,
			},
		},
	},
	shzhenwei: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "phaseBegin",
		},
		filter: function (event, player) {
			return player.inRange(event.player);
		},
		logTarget: "player",
		check: function (event, player) {
			if (get.attitude(_status.event.player, event.player) > 1) return event.player.countCards("j");
			return !event.player.countCards("j") || event.player.countCards("e");
		},
		async content(event, trigger, player) {
			const list = [];
			let choiceList = ["交给" + get.translation(player) + "一张手牌", "令" + get.translation(player) + "移动你场上一张牌", "令" + get.translation(player) + "视为对你使用刺【杀】", "背水！对" + get.translation(player) + "造成1点伤害并执行所有选项"];
			const target = trigger.player;
			if (target.countCards("h") > 0) list.push("选项一");
			else choiceList[0] = '<span style="opacity:0.5; ">' + choiceList[0] + "</span>";

			if (
				target.countCards("ej") > 0 &&
				player.canMoveCard(
					null,
					false,
					target,
					game.filterPlayer(i => i != target)
				)
			)
				list.push("选项二");
			else choiceList[1] = '<span style="opacity:0.5; ">' + choiceList[1] + "</span>";

			list.push("选项三");
			if (list.length == 3) list.push("背水！");
			else choiceList[3] = '<span style="opacity:0.5; ">' + choiceList[3] + "</span>";

			const { control } = await target
				.chooseControl(list)
				.set("choiceList", choiceList)
				.set("ai", function () {
					const num = Math.max(4 - target.hp, 1);
					if (get.attitude(target, player) > 1 && target.countCards("ej") > 0) return "选项二";
					if (target.countCards("j") && !target.countCards("e")) return "选项二";
					let bool1 = target.hasCard(card => get.value(card, target) < num * 5, "h");
					let bool2 = target.hasCard(card => get.value(card, target) < num * 3, "e");
					if (bool1 && bool2 && get.damageEffect(player, target, target) > 1 && list.includes("背水！")) return "背水！";
					if (bool1 && list.includes("选项一")) return "选项一";
					if (bool2 && list.includes("选项二")) return "选项二";
					if (list.includes("选项三")) return "选项三";
					return list[0];
				})
				.forResult();
			if (control) {
				if (control == "背水！") await player.damage(target);
				if (control == "选项一" || control == "背水！") {
					const cards = (await target.chooseCard("交给" + get.translation(player) + "一张手牌", "h", true).forResult()).cards;
					if (cards && cards.length) {
						await target.give(cards, player);
					}
				}
				if (control == "选项二" || control == "背水！") {
					player.moveCard(true, [target]).set("prompt", "移动" + get.translation(target) + "场上一张牌");
				}
				if (control == "选项三" || control == "背水！") {
					let sha = { name: "sha", nature: "stab", isCard: true };
					if (player.canUse(sha, target, false, false)) {
						await player.useCard(sha, target, false);
					}
				}
			}
		},
	},
	shduogui: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		filter: function (event, player) {
			return player.countCards("h", { type: "equip" }) > 0 && !player.hasSkill("shduogui_block");
		},
		filterCard: function (card) {
			return get.type(card) == "equip";
		},
		position: "h",
		check: function (card) {
			var player = _status.currentPhase;
			if (player.countCards("h", { subtype: get.subtype(card) }) > 1) {
				return 11 - get.equipValue(card);
			}
			return 6 - get.value(card);
		},
		filterTarget: function (card, player, target) {
			if (target.isMin()) return false;
			return player != target && target.canEquip(card, true);
		},
		async content(event, trigger, player) {
			const cards = event.cards;
			const target = event.target;
			await target.equip(cards[0]);
			const hs = target.getCards("h");
			const result = await target
				.chooseCard("h", 2, "交给" + get.translation(player) + "两张手牌,或者失去1点体力并令其“夺闺”失效")
				.set("ai", function (card) {
					if (get.event().goon) return 7 - get.value(card);
					return 0;
				})
				.set("goon", get.attitude(target, player) > 1 || target.hp <= 1)
				.forResult();
			if (result?.bool && result.cards?.length) {
				target.give(result.cards, player);
			} else {
				await target.loseHp();
				await player.addTempSkill("shduogui_block");
			}
		},
		discard: false,
		lose: false,
		prepare: function (cards, player, targets) {
			player.$give(cards, targets[0], false);
		},
		ai: {
			basic: {
				order: 10,
			},
			result: {
				player: 1,
				target: function (player, target) {
					var card = ui.selected.cards[0];
					if (!card) return 0;
					if (get.attitude(player, target) > 2 && target.countCards("h") < 3) return 0;
					var val = get.value(card, target);
					if (val > 6) return val;
					return val - 6;
				},
			},
			threaten: 1.35,
		},
		subSkill: {
			block: {
				sub: true,
			},
		},
	},
	shdaozhui: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			global: "damageEnd",
		},
		direct: true,
		filter: function (event, player) {
			return event.player.isIn() && event.player.getCards("e").length > 0;
		},
		async content(event, trigger, player) {
			const result = await player
				.gainPlayerCard(trigger.player, "e", get.prompt("shdaozhui", trigger.player))
				.set("ai", function (button) {
					const card = button.link,
						player = get.event().player;
					if (get.attitude(player, trigger.player) < 0) return get.value(card, trigger.player);
					if (trigger.player == player) return 7 - get.value(card, trigger.player);
					return 4 - get.value(card, trigger.player);
				})
				.set("logSkill", ["shdaozhui", trigger.player])
				.forResult();
			if (result.bool) {
				trigger.player.draw();
				if (trigger.player.inRange(player)) {
					await trigger.player
						.chooseToUse(
							function (card, player, event) {
								if (get.name(card) != "sha") return false;
								return lib.filter.filterCard.apply(this, arguments);
							},
							"是否对" + get.translation(player) + "使用一张杀"
						)
						.set("targetRequired", true)
						.set("complexSelect", true)
						.set("filterTarget", function (card, player, target) {
							if (target != _status.event.sourcex && !ui.selected.targets.includes(_status.event.sourcex)) return false;
							return lib.filter.filterTarget.apply(this, arguments);
						})
						.set("sourcex", player);
				}
			} else event.finish();
		},
	},
	shyaomeng: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "useCardAfter",
		},
		filter: function (event, player) {
			//var type=get.type(event.card);
			// if(type=='equip'||type=='delay') return false;
			if (_status.currentPhase != event.player) return false;
			var Previous = player.getPrevious();
			var Next = player.getNext();
			if (event.player != Previous && event.player != Next) return false;
			var evt = event.getParent("phaseUse");
			if (!evt || evt.player != event.player) return false;
			return (
				event.player
					.getHistory("useCard", function (evtt) {
						return evtt.getParent("phaseUse") == evt;
					})
					.indexOf(event) <= 1 && event.cards.filterInD().length > 0
			);
		},
		check: function (event, player) {
			var Previous = player.getPrevious();
			var Next = player.getNext();
			var player2 = event.player == Previous ? Next : Previous;
			if (get.attitude(player, player2) < 2) return false;
			return true;
		},
		logTarget: "player",
		prompt: function (event, player) {
			var Previous = player.getPrevious();
			var Next = player.getNext();
			return "将" + get.translation(event.cards.filterInD()) + "交给" + get.translation(event.player == Next ? Previous : Next);
		},
		content: function () {
			"step 0";
			var Previous = player.getPrevious();
			var Next = player.getNext();
			event.cards = trigger.cards.filterInD().slice(0);
			if (trigger.player == Previous) {
				Next.gain(trigger.cards.filterInD(), "gain2");
				event.target = Next;
			} else {
				Previous.gain(trigger.cards.filterInD(), "gain2");
				event.target = Previous;
			}
			("step 1");
			var flag = false;
			for (var i of event.cards) {
				var name = get.name(i, event.target);
				if (name == "sha" || name == "jiu") flag = true;
			}
			if (flag) player.draw();
		},
	},
	shdongzhu: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		init: function (player) {
			player.markSkill("shdongzhu");
		},
		mark: true,
		intro: {
			mark: function (dialog, content, player) {
				if (player != game.me) return get.translation(player) + "观看牌堆中...";
				if (get.itemtype(_status.pileTop) != "card") return "牌堆顶无牌";
				var list = [];
				list.push(ui.cardPile.childNodes[0]);
				list.push(ui.cardPile.childNodes[1]);
				dialog.addSmall(list);
			},
		},
		trigger: {
			global: "phaseJudgeBegin",
		},
		round: 1,
		check: function (event, player) {
			var cs = [ui.cardPile.childNodes[0], ui.cardPile.childNodes[1]].concat(player.getCards("h"));
			var judge = event.player.getCards("j")[0];
			if (!judge && !player.countCards("h")) return false;
			if (get.attitude(player, event.player) > 0 && !event.player.getCards("j").length) return false;
			for (var i of cs) {
				if (judge) {
					if (get.judge(judge)(i) * get.attitude(player, event.player) > 0) return true;
				} else break;
			}
			//return Math.abs(get.attitude(player,event.player))>2;
			return !judge && player.countCards("h");
		},
		logTarget: "player",
		content: function () {
			"step 0";
			event.cards = get.cards(2);
			var next = player.chooseToMove(prompt, true);
			next.set("list", [
				["牌堆顶", event.cards],
				["手牌", player.getCards("h")],
			]);
			next.set("filterMove", function (from, to, moved) {
				if ((to == 0 && moved[0].length > 2) || (from == 1 && to == 1)) return false;
				if (to == 1 && moved[0].length < 2) return false;
				return true;
			});
			next.set("filterOk", function (moved) {
				return moved[0].length == 2;
			});
			next.processAI = function (list) {
				var check = function (card) {
					var player = _status.event.player;
					var target = _status.currentPhase;
					var att = get.attitude(player, target);
					var judge = target.getCards("j")[0];
					if (judge) {
						return get.judge(judge)(card) * att;
					}
					//return target.getUseValue(card)*att;
					var num2 = player.hp,
						num1 = target.hp;
					var val = (num1 * get.value(card, player) + num2 * get.value(card, target)) / (num1 + num2);
					return val * att;
				};
				var player = _status.event.player;
				var cards = list[0][1].concat(list[1][1]).sort(function (a, b) {
						return check(b) - check(a);
					}),
					cards2 = cards.splice(0, 2);
				return [cards2, cards];
			};
			("step 1");
			if (result.bool) {
				var list = result.moved[0];
				var num = list.length - 1;
				var gcards = result.moved[1].slice(0);
				for (var i = 0; i < list.length; i++) {
					event.cards.remove(list[num - i]);
					ui.cardPile.insertBefore(list[num - i], ui.cardPile.firstChild);
				}
				for (var i of player.getCards("h")) {
					if (gcards.includes(i)) gcards.remove(i);
				}
				if (gcards) player.gain(gcards, "draw");
			}
		},
		group: ["shdongzhu_roundcount"],
	},
	shzhanji: {
		init: function (player) {
			player.storage.shzhanji = [3, 0, 0];
		},
		trigger: {
			player: "phaseUseBegin",
		},
		frequent: true,
		content: function () {
			"step 0";
			player.draw(player.storage.shzhanji[0]);
			player.showHandcards();
			("step 1");
			var lists = [];
			var hs = player.getCards("h");
			for (var i of hs) lists.add(get.suit(i, player));
			var num = lists.length;
			player
				.chooseToDiscard("h", "请弃置手牌已有花色各一张", true, num, function (card, player) {
					if (!ui.selected.cards.length) return true;
					var suit = get.suit(card, player);
					if (!lists.includes(suit)) return false;
					for (var i of ui.selected.cards) {
						if (get.suit(i, player) == suit) return false;
					}
					return true;
				})
				.set("complexCard", true)
				.set("ai", function (card) {
					if (!player.hasValueTarget(card)) return 5;
					return 5 - get.value(card);
				});
			("step 2");
			if (result.bool && result.cards) {
				var X = result.cards.length;
				player.addTempSkill("shzhanji_2", "phaseUseEnd");
				player.storage.shzhanji[1] = 4 - X;
				player.storage.shzhanji[2] = X;

				if (X >= 3) player.addTempSkill("wushuang", "phaseUseEnd");
				if (X >= 4 && player.storage.shzhanji[0] <= 4) player.storage.shzhanji[0]++;
			} else {
				player.addTempSkill("shzhanji_2", "phaseUseEnd");
				player.storage.shzhanji[1] = 4;
				player.storage.shzhanji[2] = 0;
			}
		},
		group: "shzhanji_clear",
		subSkill: {
			2: {
				mod: {
					selectTarget: function (card, player, range) {
						if (card.name == "sha" && range[1] != -1) range[1] += player.storage.shzhanji[2];
					},
					cardUsable: function (card, player, num) {
						if (card.name == "sha") return num + player.storage.shzhanji[1];
					},
				},
				charlotte: true,
				sub: true,
			},
			clear: {
				trigger: {
					player: "phaseUseEnd",
				},
				forced: true,
				silent: true,
				popup: false,
				content: function () {
					player.storage.shzhanji[1] = 0;
					player.storage.shzhanji[2] = 0;
				},
				sub: true,
				_priority: 1,
			},
		},
	},
	shlingwu: {
		trigger: {
			source: "damageBegin1",
		},
		filter: function (event, player) {
			var players = game.filterPlayer(function (current) {
				return player.inRange(current);
			});
			return players.length > 0 && event.card && (event.card.name == "sha" || event.card.name == "juedou");
		},
		check: function (event, player) {
			if (game.countPlayer(current => player.inRange(current)) < 2) return false;
			return player.countCards("h") > 1;
		},
		content: function () {
			"step 0";
			event.num2 = 0;
			var targets = game
				.filterPlayer(function (current) {
					return player.inRange(current);
				})
				.sortBySeat();
			event.targets = targets;
			("step 1");
			var target = targets.shift();
			event.target = target;
			target
				.chooseCard("he", "将一张牌交给" + get.translation(player) + "或令其弃置一张手牌")
				.set("ai", function (card) {
					if (_status.event.goon) return 7 - get.value(card);
					return 0;
				})
				.set("goon", (get.attitude(target, trigger.player) > 1 && event.num2 > 1) || (get.attitude(target, player) > 2 && player.countCards("h") < 2));
			("step 2");
			if (result.bool) {
				event.target.give(result.cards, player, true);
			} else {
				event.num2++;
				if (player.countCards("h") > 0) player.chooseToDiscard("h", 1, true);
				else {
					if (event.num2 > 0) event.num2--;
				}
			}
			if (targets.length) event.goto(1);
			("step 3");
			trigger.num = event.num2;
		},
	},
	shsixing: {
		init: function (player) {
			player.storage.shsixing = 1;
		},
		locked: false,
		group: ["shsixing1", "shsixing2"],
	},
	shsixing1: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			global: "phaseJudgeBefore",
		},
		filter: function (event, player) {
			return event.player != player && event.player.countCards("ej") > 0 && player.storage.shsixing == 1;
		},
		logTarget: "player",
		check: function (event, player) {
			return get.attitude(player, event.player) < 0;
		},
		async content(event, trigger, player) {
			trigger.player.damage(1);
			trigger.player.addTempSkill("shsixing1_back");
		},
		subSkill: {
			back: {
				trigger: {
					source: "damageSource",
				},
				forced: true,
				popup: false,
				filter: function (event, player) {
					return (
						player.isDamaged() &&
						event.player.getHistory("useSkill", function (evt) {
							return evt.skill == "shsixing1";
						}).length
					);
				},
				content: function () {
					player.recover();
				},
				sub: true,
			},
		},
	},
	shsixing2: {
		onremove: function (player, skill) {
			player.storage.shsixing = 1;
		},
		trigger: {
			global: "dying",
		},
		direct: true,
		filter: function (event, player) {
			if (event.player.countCards("he") <= 0 || event.player == player) return false;
			return event.player.isIn() && player.storage.shsixing == 2;
		},
		async content(event, trigger, player) {
			const result = await player
				.gainPlayerCard(trigger.player, "hej", [1, Infinity], get.prompt("shsixing", trigger.player))
				.set("ai", function (button) {
					const card = button.link,
						player = get.event().player;
					if (get.attitude(player, trigger.player) < 0) return get.value(card, trigger.player);
					return 4 - get.value(card, trigger.player);
				})
				.set("logSkill", ["shsixing", trigger.player])
				.forResult();
			if (result.bool) {
				game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shsixing21.mp3");
				const num = result.cards.length;
				player
					.when({ global: "dyingAfter" })
					.filter(evt => evt.player == trigger.player && evt.player.isIn())
					.vars({
						num: num,
					})
					.then(() => {
						player.chooseCard("he", true, num, "交给" + get.translation(trigger.player) + get.cnNumber(num) + "张牌");
					})
					.then(() => {
						if (result.bool) {
							player.give(result.cards, trigger.player);
						}
					});
			}
		},
	},
	shyuxun: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		unique: true,
		trigger: {
			global: ["phaseZhunbeiSkipped", "phaseZhunbeiCancelled", "phaseDrawSkipped", "phaseDrawCancelled", "phaseJudgeSkipped", "phaseJudgeCancelled", "phaseUseSkipped", "phaseUseCancelled", "phaseDiscardSkipped", "phaseDiscardCancelled", "phaseJieshuSkipped", "phaseJieshuCancelled"],
		},
		logTarget: "player",
		forced: true,
		skillAnimation: true,
		animationColor: "gray",
		filter: function (event, player) {
			var moreMax = game.hasPlayer(current => {
				return current != event.player && current.countCards("hej") >= event.player.countCards("hej");
			});
			return !moreMax && event.player.isIn() && event.player != player;
		},
		content: function () {
			"step 0";
			player.awakenSkill("shyuxun");
			if (player.storage.shsixing && player.storage.shsixing < 2) player.storage.shsixing++;
			("step 1");
			if (trigger.player.isIn()) trigger.player.damage(2);
		},
	},
	shsheyan: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			return game.hasPlayer(current => {
				return (
					current.getHistory("lose", function (evt) {
						return evt.cards2 && evt.cards2.length > 0;
					}).length > 0
				);
			});
		},
		selectTarget: -1,
		filterTarget: function (card, player, current) {
			return (
				current.getHistory("lose", function (evt) {
					return evt.cards2 && evt.cards2.length > 0;
				}).length > 0
			);
		},
		multitarget: true,
		multiline: true,
		async content(event, trigger, player) {
			const target2s = event.targets.sortBySeat();
			if (!target2s) return;
			for (const current of target2s) {
				const cards = [];
				game.getGlobalHistory("cardMove", function (evt) {
					if (evt.name != "cardsDiscard") {
						if (evt.name != "lose" || evt.position != ui.discardPile) return false;
					}
					cards.addArray(evt.cards.filter(card => get.position(card, true) == "d" && get.type(card, false) == "basic"));
				});
				if (cards.length) {
					const result = await current
						.chooseButton(["是否获得其中一张牌？或回复1点体力，然后弃置一张牌。", cards])
						.set("ai", function (button) {
							const player = get.event().player;
							if (get.recoverEffect(player, player, player) > get.value(button.link, player)) return 0;
							return get.value(button.link, player);
						})
						.forResult();
					if (result.bool) {
						await current.gain(result.links, "gain2");
						continue;
					}
				}
				await current.recover();
				await current.chooseToDiscard(true, "he", "请弃置一张牌");
			}
		},
		ai: {
			order: function () {
				var player = _status.event.player;
				var targets = game.filterPlayer(current => {
					return (
						current.getHistory("lose", function (evt) {
							return evt.cards2 && evt.cards2.length > 0;
						}).length > 0
					);
				});
				var cards = [];
				game.getGlobalHistory("cardMove", function (evt) {
					if (evt.name != "cardsDiscard") {
						if (evt.name != "lose" || evt.position != ui.discardPile) return false;
					}
					cards.addArray(evt.cards.filter(card => get.position(card, true) == "d" && get.type(card, false) == "basic"));
				});
				var num = 0;
				if (targets && targets.length > 0) {
					var gainvalue = 0;
					for (var current of targets) {
						var att = Math.min(get.attitude(player, current), get.attitude(current, player));
						if (cards.length) gainvalue += att * (get.value(cards) / cards.length);
						if (get.attitude(current, player) < 0 || get.attitude(player, current) < 0) num += Math.min(gainvalue, get.recoverEffect(current, player, player) - att + get.effect(current, { name: "guohe_copy2" }, player, player) / 6);
						else num += Math.max(gainvalue, get.recoverEffect(current, player, player) + get.effect(current, { name: "guohe_copy2" }, player, player) / 3);
					}
				}
				return Math.min(10, Math.ceil(num / targets.length));
			},
			result: {
				player: function (player, target) {
					var player = _status.event.player;
					var targets = game.filterPlayer(current => {
						return (
							current.getHistory("lose", function (evt) {
								return evt.cards2 && evt.cards2.length > 0;
							}).length > 0
						);
					});
					var cards = [];
					game.getGlobalHistory("cardMove", function (evt) {
						if (evt.name != "cardsDiscard") {
							if (evt.name != "lose" || evt.position != ui.discardPile) return false;
						}
						cards.addArray(evt.cards.filter(card => get.position(card, true) == "d" && get.type(card, false) == "basic"));
					});
					var num = 0;
					if (targets && targets.length > 0) {
						var gainvalue = 0;

						for (var current of targets) {
							var att = Math.min(get.attitude(player, current), get.attitude(current, player));
							if (cards.length) gainvalue += att * (get.value(cards) / cards.length);
							if (get.attitude(current, player) < 0 || get.attitude(player, current) < 0) num += Math.min(gainvalue, get.recoverEffect(current, player, player) - att + get.effect(current, { name: "guohe_copy2" }, player, player) / 6);
							else num += Math.max(gainvalue, get.recoverEffect(current, player, player) + get.effect(current, { name: "guohe_copy2" }, player, player) / 3);
						}
					}
					return num / targets.length;
				},
			},
		},
	},
	shanxiang: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseUseEnd",
		},
		filter: function (event, player) {
			return player.hasUseTarget({ name: "jiejia" });
		},
		direct: true,
		async content(event, trigger, player) {
			const result = await player
				.chooseUseTarget(
					{
						name: "jiejia",
					},
					get.prompt("shanxiang"),
					"视为使用一张【解甲归田】",
					false
				)
				.set("ai", function (target) {
					const player = get.event().player;
					const card = { name: "jiejia", isCard: true };
					const over = player.countCards("h") + player.getCards("e") - player.getHandcardLimit();
					const val = get.value(player.getCards("e"));
					if (target == player) {
						if (over < 2) return 10;
						else if (val < 10) return 15 - val;
						return 1;
					}
					return get.effect(player, card, target, player);
				})
				.set("logSkill", "shanxiang")
				.forResult();
			if (result.bool) {
				if (
					player.hasHistory("useCard", evt => {
						return evt.card.name == "jiejia" && evt.getParent(2).name == "shanxiang" && evt.targets.includes(player);
					})
				) {
					await player.addTempSkill("shanxiang_draw", {
						player: "phaseDrawEnd",
					});
					await player.addMark("shanxiang_draw", 2, false);
				}
			}
		},
		subSkill: {
			draw: {
				trigger: {
					player: "phaseDrawBegin",
				},
				forced: true,
				mark: true,
				audio: false,
				onremove: true,
				charlotte: true,
				intro: {
					content: "下回合的摸牌阶段额外摸#张牌",
				},
				content: function () {
					trigger.num += player.countMark("shanxiang_draw");
				},
				sub: true,
			},
		},
	},
	shpixian: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		zhuanhuanji: "number",
		mark: true,
		marktext: "Ⅲ",
		zhuanhuanLimit: 3,
		intro: {
			markcount: () => 0,
			content: function (storage, player) {
				var list = ["手牌", "装备", "座次"];
				var num = (storage || 0) % 3;
				return "转换技，出牌阶段，你可以和座次小于你的角色交换" + list[num] + "。若你以此法交换座次或交换牌差不小于3，辟险失效至你进入濒死状态。";
			},
		},
		enable: "phaseUse",
		filter: function (event, player) {
			return player.getSeatNum() > 1 && !player.hasSkill("shpixian_block");
		},
		filterTarget: function (card, player, target) {
			let storage = player.countMark("shpixian");
			let list = ["手牌", "装备", "座次"];
			let num = (storage || 0) % 3;
			if (list[num] == "手牌" && target.countCards("h") == 0 && player.countCards("h") == 0) return false;
			if (list[num] == "装备" && target.countCards("e") == 0 && player.countCards("e") == 0) return false;
			return target.getSeatNum() < player.getSeatNum();
		},
		async content(event, trigger, player) {
			const target = event.target;
			const storage = player.countMark("shpixian");
			const list = ["手牌", "装备", "座次"];
			const num = (storage || 0) % 3;
			var dif = 3;
			if (list[num] == "手牌") {
				dif = Math.abs(player.countCards("h") - target.countCards("h"));
				await player.swapHandcards(target);
			} else if (list[num] == "装备") {
				dif = Math.abs(player.countCards("e") - target.countCards("e"));
				await player.swapEquip(target);
			} else {
				game.swapSeat(player, target);
			}
			player.changeZhuanhuanji("shpixian");
			if (dif > 2) await player.addTempSkill("shpixian_block", { player: "dying" });
		},
		ai: {
			threaten: 2.4,
			order: 1,
			result: {
				target: function (player, target) {
					let att = get.attitude(player, target);
					let storage = player.countMark("shpixian");
					let list = ["手牌", "装备", "座次"];
					let num = (storage || 0) % 3;
					let value = 0;
					if (list[num] == "手牌") value = get.value(player.getCards("h"), player) - get.value(target.getCards("h"), target);
					if (list[num] == "装备") value = get.value(player.getCards("e"), player) - get.value(target.getCards("e"), target);
					if (att > 2) value = value / 3;
					return value;
				},
			},
		},
		subSkill: {
			block: {
				sub: true,
			},
		},
	},
	shpengshuai: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		hasPhase: function (player) {
			var history = player.actionHistory;
			for (var i = history.length - 1; i >= 0; i--) {
				if (history[i].isMe && !history[i].isSkipped) return true;
				if (history[i].isRound) break;
			}
			return false;
		},
		filter: function (event, player) {
			if (!player.countCards("h", card => get.type2(card) == "trick")) return false;
			return (
				game.countPlayer(current => {
					return !lib.skill.shpengshuai.hasPhase(current);
				}) > 0
			);
		},
		direct: true,
		async content(event, trigger, player) {
			const num = Math.min(
				game.countPlayer(current => {
					return !lib.skill.shpengshuai.hasPhase(current);
				}),
				player.countCards("h", card => get.type2(card) == "trick")
			);
			const result = await player
				.chooseCardTarget({
					prompt: get.prompt("shpengshuai"),
					prompt2: "展示任意张锦囊牌并选择等量角色",
					selectCard: [1, num],
					filterCard: function (card, player) {
						return get.type2(card) == "trick";
					},
					selectTarget: function () {
						if (!ui.selected.cards) return [1, num];
						return ui.selected.cards.length;
					},
					position: "h",
					filterTarget: function (card, player, target) {
						if (!ui.selected.cards.length) return false;
						return !lib.skill.shpengshuai.hasPhase(target);
					},
					complexTarget: true,
					complexSelect: true,
					ai1: function (card) {
						return get.value(card);
					},
					ai2: function (target) {
						const player = get.event().player;
						if (!ui.selected.targets.length) {
							let att = get.attitude(player, target);
							if (att < 0) return 0;
							return att;
						}
						return get.attitude(player, target);
					},
				})
				.forResult();
			if (!result?.bool || !result?.cards?.length || !result?.targets?.length) return;
			if (result.cards.length == result.targets.length) {
				const cards = result.cards,
					targets = result.targets;
				await player.showCards(cards);
				player.logSkill("shpengshuai", targets);
				for (let current of targets) {
					await current.addTempSkill("shpengshuai_buff", {
						player: "phaseEnd",
					});
					await current.addMark("shpengshuai_buff", 1, false);
				}
			}
		},
		subSkill: {
			buff: {
				trigger: {
					player: "phaseDrawBegin",
				},
				forced: true,
				mark: true,
				audio: false,
				onremove: true,
				charlotte: true,
				intro: {
					content: "下回合的摸牌阶段额外摸牌、出牌阶段额外出【杀】、弃牌阶段额外存牌",
				},
				content: function () {
					trigger.num += player.countMark("shpengshuai_buff") * 2;
				},
				mod: {
					cardUsable: function (card, player, num) {
						if (card.name == "sha") return num + player.countMark("shpengshuai_buff");
					},
					maxHandcard: function (player, num) {
						if (_status.event.name == "phaseDiscard" || _status.event.getParent("phaseDiscard").name == "phaseDiscard") return num + player.countMark("shpengshuai_buff") * 3;
					},
				},
				sub: true,
			},
		},
	},
	shxiongjian: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			source: "damageBegin",
		},
		forced: true,
		filter: function (event, player) {
			return event.num >= event.player.hp && event.notLink();
		},
		content: function () {
			trigger.num++;
		},
		ai: {
			threaten: 3.5,
		},
	},
	shbaoshi: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "damageEnd",
			source: "damageEnd",
		},
		usable: 1,
		filter: function (event, player) {
			if (player == event.source) return player.countCards("he") > 0;
			return true;
		},
		check: function (event, player) {
			if (!event.card || !event.cards || !event.cards.length) return false;
			if (event.card.name == "sha") return player == event.player;
			return true;
		},
		content: function () {
			"step 0";
			if (trigger.player == player) {
				if (get.itemtype(trigger.cards) == "cards" && get.position(trigger.cards[0], true) == "o") {
					player.gain(trigger.cards, "gain2");
				}
				player.draw("nodelay");
				event.finish();
			}
			("step 1");
			var next = player.chooseToDiscard("he", "弃置一张牌并获得" + get.translation(trigger.cards), true);
			next.set("ai", function (card) {
				var cards = _status.event.getTrigger().cards;
				return get.value(cards) - get.value(card) + 100;
			});
			("step 2");
			if (get.itemtype(trigger.cards) == "cards" && get.position(trigger.cards[0], true) == "o") {
				player.gain(trigger.cards, "gain2");
			}
		},
	},
	shweishu: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "useCardToTargeted",
		},
		direct: true,
		filter: function (event, player) {
			if (event.player == player || event.targets.length != 1) return false;
			return get.type2(event.card) == "trick" && lib.suit.includes(get.suit(event.card)) && player.countCards("he", card => (get.suit(card) == get.suit(event.card)) > 0);
		},
		async content(event, trigger, player) {
			const suit = get.suit(trigger.card);
			const result = await player
				.chooseToDiscard("he", { suit: suit })
				.set("prompt", get.prompt("shweishu"))
				.set("ai", card => {
					const player = get.event().player;
					const target = trigger.target;
					const list = lib.skill.shweishu.getCanChangeList(trigger.card, card);
					var max = 0;
					if (list.length) {
						max = get.effect(target, { name: list[0][2], nature: list[0][3], isCard: true }, trigger.player, player) - get.effect(target, trigger.card, trigger.player, player);
						for (var i of list) {
							if (get.effect(target, { name: i[2], nature: i[3], isCard: true }, trigger.player, player) - get.effect(target, trigger.card, trigger.player, player) > max) max = get.effect(target, { name: i[2], nature: i[3], isCard: true }, player, player) - get.effect(target, trigger.card, player, player);
						}
					}
					if (max > 0) return max * 3 - get.value(card);
					return 0;
				})
				.set("logSkill", "shweishu")
				.forResult();
			if (result?.cards?.length) {
				const cards = result.cards,
					list = lib.skill.shweishu.getCanChangeList(trigger.card, cards[0]);
				if (!list || !list.length) return;
				const resultx = await player
					.chooseButton(["请声明一张即时牌，此后按你所声明的牌结算", [list, "vcard"]], true)
					.set("ai", function (button) {
						const card = { name: button.link[2], nature: button.link[3] };
						const player = get.event().player,
							target = trigger.target;
						return get.effect(target, card, trigger.player, player);
					})
					.forResult();
				if (resultx.bool) {
					trigger.card.name = resultx.links[0][2];
					const card = {
						name: resultx.links[0][2],
						nature: resultx.links[0][3],
					};
					if (trigger.card.name == "sha") trigger.card.nature = resultx.links[0][3];
					game.log(player, "声明了", card);
				}
			}
		},
		getCanChangeList: function (cardx, card) {
			var list = [];
			var num = get.cardNameLength(card);
			for (var name of lib.inpile) {
				if (name == "shan" || name == "wuxie") continue;
				var cardy = {
					name: name,
					isCard: true,
				};
				if (get.type(name) == "basic" || get.type(name) == "trick") {
					if ((get.name(cardx) == name && name != "sha") || get.cardNameLength(cardy) != num) continue;
					list.push([get.translation(get.type(name)), "", name]);
					if (name == "sha") {
						for (var j of lib.inpile_nature) {
							if (j != get.nature(cardx) || get.name(cardx) != "sha") list.push(["基本", "", "sha", j]);
						}
					}
				}
			}
			return list;
			//return get.effect(target,cardy,player,player)-get.effect(target,cardx,player,player);
		},
	},
	shcangfeng: {
		trigger: {
			player: "phaseDiscardBefore",
		},
		audio: "ext:水泊娘山/character/audio/skill:2",
		forced: true,
		firstDo: true,
		filter(event, player) {
			return player.countCards("h", { color: "black" }) > 0 && player.countCards("h") > player.hp;
		},
		async content() {},
		mod: {
			ignoredHandcard: function (card, player) {
				if (get.color(card) == "black") {
					return true;
				}
			},
			cardDiscardable: function (card, player, name) {
				if (name == "phaseDiscard" && get.color(card) == "black") return false;
			},
		},
	},

	shdingpan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		usable: 2,
		multitarget: true,
		filterTarget: function (card, player, target) {
			if (ui.selected.targets.length) return false;
			if (!target.isLinked()) return target.countCards("h") >= player.countCards("h");
			return target.countCards("h") <= player.countCards("h");
		},
		targetprompt: function (target) {
			if (!target.isLinked()) return "造成伤害";
			return "调整手牌";
		},
		selectTarget: [1, 2],
		async content(event, trigger, player) {
			const target = event.target;
			if (!target.isLinked()) {
				target.link(true);
				await target.damage();
			} else {
				target.link();
				let num = target.countCards("h");
				if (num > 4) target.chooseToDiscard("h", true, num - 4);
				else target.drawTo(4);
			}
		},

		ai: {
			order: 8,
			result: {
				target: function (player, target) {
					var num = Math.min(player.countCards("h"), 4);
					if (target.countCards("h") < 4 && target.isLinked()) {
						return 3;
					} else if (target == player && player.countCards("he") && player.countCards("he") < 2) {
						return 4;
					} else {
						return -3;
					}
				},
			},
			expose: 0.4,
			threaten: 3,
		},
	},

	shjianghun: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			player: "damageEnd",
		},
		filter: function (event, player) {
			return player.getExpansions("shyebing").length > 0;
		},
		async content(event, trigger, player) {
			const { bool, links } = await player.chooseCardButton("将一张除外牌置于牌堆顶", player.getExpansions("shyebing"), true).forResult();
			if (!bool) return;
			const suit = get.suit(links[0], false);
			const card = links[0];
			game.log(player, "将", card, "置于了牌堆顶");
			ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
			const targets = (
				await player
					.chooseTarget(2, function (card, player, target) {
						if (ui.selected.targets.length) {
							var from = ui.selected.targets[0];
							if (target.isMin()) return false;
							var es = from.getCards("e", { suit: suit });
							for (var i = 0; i < es.length; i++) {
								if (target.canEquip(es[i])) return true;
							}
							return false;
						} else {
							return target.countCards("e", { suit: suit }) > 0;
						}
					})
					.set("ai", function (target) {
						var player = _status.event.player;
						var att = get.attitude(player, target);
						var sgnatt = get.sgn(att);
						if (ui.selected.targets.length == 0) {
							if (att > 0) {
								if (
									!_status.event.nojudge &&
									target.countCards("j", function (card) {
										return game.hasPlayer(function (current) {
											return current != target && current.canAddJudge(card) && get.attitude(player, current) < 0;
										});
									})
								)
									return 14;
								if (
									target.countCards("e", function (card) {
										return (
											get.value(card, target) < 0 &&
											game.hasPlayer(function (current) {
												return current != target && get.attitude(player, current) < 0 && current.canEquip(card) && get.effect(target, card, player, player) < 0;
											})
										);
									}) > 0
								)
									return 9;
							} else if (att < 0) {
								if (
									game.hasPlayer(function (current) {
										if (current != target && get.attitude(player, current) > 0) {
											var es = target.getCards("e");
											for (var i = 0; i < es.length; i++) {
												if (get.value(es[i], target) > 0 && current.canEquip(es[i]) && get.effect(current, es[i], player, player) > 0) return true;
											}
										}
									})
								) {
									return -att;
								}
							}
							return 0;
						}
						var es = ui.selected.targets[0].getCards("e");
						var i;
						var att2 = get.sgn(get.attitude(player, ui.selected.targets[0]));
						for (i = 0; i < es.length; i++) {
							if (sgnatt != 0 && att2 != 0 && sgnatt != att2 && get.sgn(get.value(es[i], ui.selected.targets[0])) == -att2 && get.sgn(get.effect(target, es[i], player, target)) == sgnatt && target.canEquip(es[i])) {
								return Math.abs(att);
							}
						}
						if (
							i == es.length &&
							(_status.event.nojudge ||
								!ui.selected.targets[0].countCards("j", function (card) {
									return target.canAddJudge(card);
								}) ||
								att2 <= 0)
						) {
							return 0;
						}
						return -att * att2;
					})
					.set("multitarget", true)
					.set("targetprompt", ["被移走", "移动目标"])
					.set("prompt", "是否移动场上的一张" + get.translation(suit) + "牌？否则回复1点体力。")
					.forResult()
			).targets;
			if (targets && targets.length == 2) {
				player.line2(targets, "green");
				const targets0 = targets[0],
					targets1 = targets[1];
				const result = await player
					.choosePlayerCard(
						"e",
						true,
						function (button) {
							const player = get.event().player;
							if (get.attitude(player, targets0) > 0 && get.attitude(player, targets1) < 0) {
								if (get.value(button.link, targets0) < 0 && get.effect(targets1, button.link, player, targets1) > 0) return 10;
								return 0;
							} else {
								return get.value(button.link) * get.effect(targets1, button.link, player, targets1);
							}
						},
						targets0
					)
					.set("filterButton", function (button) {
						return targets1.canEquip(button.link) && get.suit(button.link) == suit;
					})
					.forResult();
				if (result?.cards?.length) {
					const equip = result.cards[0];
					if (get.position(equip) == "e") {
						targets1.equip(equip);
					}
					await targets0.$give(equip, targets1, false);
					game.log(targets0, "的", equip, "被移动给了", targets1);
					return;
				}
			}
			await player.recover();
		},
		ai: {
			combo: "shyebing",
		},
	},
	shqiema: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			return game.hasPlayer(current => {
				return current.countCards("e", card => ["equip4", "equip3", "equip6"].includes(get.subtype(card))) > 0;
			});
		},
		filterTarget: function (card, player, target) {
			if (ui.selected.targets.length == 1) {
				var from = ui.selected.targets[0];
				if (target.isMin()) return false;
				var es = from.getCards("e", card => ["equip4", "equip3", "equip6"].includes(get.subtype(card)));
				for (var i = 0; i < es.length; i++) {
					if (target.canEquip(es[i])) return true;
				}
				return false;
			}
			return target.countCards("e", card => ["equip4", "equip3", "equip6"].includes(get.subtype(card))) > 0;
		},
		targetprompt: ["被移走", "移动目标"],
		selectTarget: 2,
		multitarget: true,
		content: function () {
			"step 0";
			event.noSha = true;
			var max = targets[0].getSeatNum() > targets[1].getSeatNum() ? targets[0].getSeatNum() : targets[1].getSeatNum();
			var min = targets[0].getSeatNum() < targets[1].getSeatNum() ? targets[0].getSeatNum() : targets[1].getSeatNum();
			event.targets2 = game
				.filterPlayer(current => {
					return current.getSeatNum() < max && current.getSeatNum() > min;
				})
				.sortBySeat();
			("step 1");
			//game.log(event.targets2)
			if (event.targets2.length) {
				var current = event.targets2.shift();
				event.current = current;
				//game.log(current)
				current
					.chooseToUse(
						function (card, player, event) {
							if (get.name(card) != "sha") return false;
							return lib.filter.filterCard.apply(this, arguments);
						},
						"是否对" + get.translation(targets[0]) + "或" + get.translation(targets[1]) + "使用一张无距离限制的【杀】？"
					)
					.set("targetRequired", true)
					.set("complexSelect", true)
					.set("filterTarget", function (card, player, target) {
						var Targets = _status.event.Targets;
						if (target != Targets[0] && target != Targets[1] && !ui.selected.targets.includes(Targets[0]) && !ui.selected.targets.includes(Targets[1])) return false;
						return lib.filter.targetEnabled.apply(this, arguments);
					})
					.set("Targets", [targets[0], targets[1]]);
			} else {
				event.goto(4);
			}
			("step 2");
			if (result.bool == true) {
				//game.log('杀')
				event.noSha = false;
			}
			("step 3");
			event.goto(1);
			("step 4");
			player
				.choosePlayerCard(
					"e",
					true,
					function (button) {
						var player = _status.event.player;
						var targets0 = _status.event.targets0;
						var targets1 = _status.event.targets1;
						if (get.attitude(player, targets0) > 0 && get.attitude(player, targets1) < 0) {
							if (get.value(button.link, targets0) < 0 && get.effect(targets1, button.link, player, targets1) > 0) return 10;
							return 0;
						} else {
							return get.value(button.link) * get.effect(targets1, button.link, player, targets1);
						}
					},
					targets[0]
				)
				.set("targets0", targets[0])
				.set("targets1", targets[1])
				.set("filterButton", function (button) {
					var targets1 = _status.event.targets1;
					return targets1.canEquip(button.link) && ["equip4", "equip3", "equip6"].includes(get.subtype(button.link));
				});
			("step 5");
			if (result.bool && result.links.length && targets[0].isIn() && targets[1].isIn()) {
				var link = result.links[0];
				if (get.position(link) == "e") {
					event.targets[1].equip(link);
				}
				targets[0].$give(link, targets[1], false);
				game.log(targets[0], "的", link, "被移动给了", targets[1]);
			}
			("step 6");
			if (event.noSha) {
				game.asyncDraw([player, targets[1]]);
			}
			("step 7");
			game.delayx();
		},
		ai: {
			order: 8,
			result: {
				target: function (player, target) {
					if (ui.selected.targets.length == 0) {
						return -3;
					} else {
						return 3;
					}
				},
			},
			expose: 0.4,
			threaten: 3,
		},
	},
	shhuoqi: {
		locked: true,
		global: "shhuoqi_fqjz",
		subSkill: {
			fqjz: {
				trigger: {
					source: "damageBegin1",
				},
				forced: true,
				filter: function (event, player) {
					if (event.source == _status.currentPhase) return false;
					return game.hasPlayer(function (current) {
						return current.hasSkill("shhuoqi") && current == _status.currentPhase;
					});
				},
				content: function () {
					game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shhuoqi1.mp3");
					trigger.num++;
				},
				sub: true,
			},
		},
	},
	shjianjian: {
		enable: "phaseUse",
		usable: 1,
		filterTarget: function (card, player, target) {
			return target.countCards("e") > 0 && target != player && target.isLinked() == false;
		},
		selectTarget: [1, 3],
		multiline: true,
		multitarget: true,
		filter: function (event, player) {
			return game.countPlayer(current => current.countCards("e") > 0);
		},
		content: function () {
			"step 0";
			event.targets = targets;
			event.num1 = 0;
			("step 1");
			if (event.num1 < event.targets.length) {
				event.targets[event.num1].link();
				event.num1++;
				event.redo();
			} else event.goto(2);
			("step 2");
			event.num2 = 0;
			event.red = [];
			event.unequip = [];
			("step 3");
			if (event.num2 < event.targets.length) {
				event.current = event.targets[event.num2];
				if (!event.current.countCards("he")) event.goto(5);
				else
					event.current.chooseCard("交给" + get.translation(player) + "一张牌", "he", true).set("ai", function (card) {
						var evt = _status.event.getParent();
						return 100 - get.value(card);
					});
			}
			("step 4");
			if (result.bool && result.cards && result.cards.length) {
				event.current.give(result.cards, player);
				if (get.color(result.cards[0]) == "red") event.red.push(event.targets[event.num2]);
				if (get.type(result.cards[0]) != "equip") event.unequip.push(event.targets[event.num2]);
			}
			("step 5");
			event.num2++;
			if (event.num2 < event.targets.length) event.goto(3);
			else event.goto(6);
			("step 6");
			var list = [];
			if (event.unequip.length > 0) list.push("选项一");
			if (event.red.length > 0) list.push("选项二");
			list.push("cancel2");
			if (list.length > 1) {
				player
					.chooseControl(list)
					.set("choiceList", ["弃置未交给你装备的角色各一张牌", "令交给你红色牌的角色各摸一张牌"])
					.set("ai", function () {
						// var player=_status.event.player;
						return "选项一";
					});
			} else event.finish();
			("step 7");
			if (result.control != "cancel2") {
				event.control = result.control;
			} else {
				event.finish();
			}
			("step 8");
			if (event.control == "选项一") {
				if (event.unequip.length) {
					var target = event.unequip.shift();
					if (target.countCards("he")) {
						player.discardPlayerCard(target, "he", true);
					}
					event.redo();
				}
			}
			("step 9");
			if (event.control == "选项二") {
				game.asyncDraw(event.red);
			}
		},
		ai: {
			order: 9,
			result: {
				target: -1,
			},
			expose: 0.4,
		},
	},
	shleiju: {
		trigger: {
			player: "phaseChange",
		},
		check: function (event, player) {
			if (event.phaseList[event.num].startsWith("phaseDraw")) return false;
			if (event.phaseList[event.num].startsWith("phaseUse") && player.countCards("h", card => player.hasValueTarget(card)) > 0) return false;
			return true;
		},
		content: function () {
			"step 0";
			if (!trigger.phaseList[trigger.num].startsWith("phaseUse")) {
				var next = player.chooseToDiscard("弃置一张牌改为执行出牌阶段,或摸两张牌改为执行弃牌阶段", "he");
				next.set("ai", function (card) {
					var num = player.countCards("h", card => player.hasValueTarget(card));
					if (num < 2) return 0;
					return 20 - player.getUseValue(card);
				});
			}
			("step 1");
			if (result.bool) {
				game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shleiju1.mp3");
				trigger.phaseList[trigger.num] = "phaseUse|shleiju";
			} else {
				if (!trigger.phaseList[trigger.num].startsWith("phaseDiscard ")) {
					game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shleiju2.mp3");
					player.draw(2);
					trigger.phaseList[trigger.num] = "phaseDiscard|shleiju";
				}
			}
			("step 2");
			game.delayx();
		},
		group: "shleiju_ai",
	},
	shleiju_ai: {
		trigger: {
			player: "phaseDiscardBefore",
		},
		filter(event, player) {
			return event.getParent().num != 5;
		},
		forced: true,
		popup: false,
		charlotte: true,
		content: function () {
			trigger.setContent(lib.skill.shleiju_ai.phaseDiscard);
		},
		phaseDiscard: function () {
			"step 0";
			game.log(player, "进入了弃牌阶段");
			event.num = player.needsToDiscard();
			if (event.num <= 0) event.finish();
			else {
				game.broadcastAll(function (player) {
					if (lib.config.show_phase_prompt) {
						player.popup("弃牌阶段", null, false);
					}
				}, player);
			}
			event.trigger("phaseDiscard");
			("step 1");
			player.chooseToDiscard(num, true).ai = function (card) {
				return 100 - _status.event.player.getUseValue(card);
			};
			("step 2");
			event.cards = result.cards;
		},
	},
	shweibu: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseDrawBegin1",
		},
		check: function (event, player) {
			var cards = player.getCards("h").filter(card => get.color(card) == "black" && game.hasPlayer(current => current != player && player.canUse(card, current)));
			if (cards.length < 1 || player.hasSkill("shweibu_blocker")) return false;
			var useful = game.filterPlayer(current => get.attitude(player, current) <= 0 && get.distance(player, current) > 1);
			return player.countCards("h") > 0 && useful.length > 0;
		},
		filter: function (event, player) {
			return !event.numFixed;
		},
		content: function () {
			trigger.changeToZero();
			player.addTempSkill("shweibu_blocker", "roundStart");
		},
		subSkill: {
			blocker: {
				charlotte: true,
				mod: {
					globalFrom: function (from, to, distance) {
						return -Infinity;
					},
				},
				mark: true,
				intro: {
					content: "本轮内你与其他角色距离视为1",
				},
				sub: true,
			},
		},
	},
	shyafeng: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		locked: false,
		enable: "phaseUse",
		filterCard(card) {
			return get.color(card) == "black";
		},
		position: "hes",
		filter: function (event, player) {
			if (!player.countCards("hes", { color: "black" })) return false;
			if (player.getStat("skill").shyafeng > 0) return lib.skill.shmifeng.getSuit().includes("club") && lib.skill.shmifeng.getSuit().length == 1;
			return true;
		},
		viewAs: {
			name: "shunshou",
		},
		viewAsFilter(player) {
			if (!player.countCards("hes", { color: "black" })) return false;
		},
		prompt: "将一张黑色牌当顺手牵羊使用",
		check(card) {
			var player = _status.event.player;
			if (get.suit(card, false) == "club") return 20 - get.value(card);
			return get.value({ name: "shunshou" }, player) - get.value(card);
		},

		mod: {
			aiOrder: function (player, card, num) {
				if (typeof card == "object" && player == _status.currentPhase) {
					if (get.name(card) == "shunshou" && get.suit(card, false) == "club") return num + 10;
				}
			},
		},
	},
	shhuoshan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: ["chooseToRespond", "chooseToUse"],
		filterCard: true,
		viewAs: {
			name: "shan",
		},
		viewAsFilter: function (player) {
			if (!player.countCards("hs")) return false;
		},
		position: "hs",
		selectCard: function () {
			var player = _status.event.player;
			return Math.ceil(player.countCards("hs") / 2);
		},
		prompt: function () {
			var player = _status.event.player;
			var num = Math.ceil(player.countCards("hs") / 2);
			return "将" + get.cnNumber(num) + "张手牌当闪使用或打出";
		},
		check: function () {
			return 1;
		},
		ai: {
			order: 3,
			respondShan: true,
			skillTagFilter: function (player) {
				if (!player.countCards("hs")) return false;
			},
			effect: {
				target: function (card, player, target, current) {
					if (get.tag(card, "respondShan") && current < 0) return 0.6;
				},
			},
			basic: {
				useful: [7, 5.1, 2],
				value: [7, 5.1, 2],
			},
			result: {
				player: 1,
			},
		},
		group: "shhuoshan_buff",
		subSkill: {
			buff: {
				trigger: {
					player: "useCard",
				},
				forced: true,
				popup: false,
				filter: function (event) {
					return event.card.name == "shan" && event.skill == "shhuoshan" && event.cards && event.cards.length > 1;
				},
				content: function () {
					player.addTempSkill("shhuoshan_blocker", "roundStart");
					if (!player.storage.shhuoshan_blocker || player.storage.shhuoshan_blocker == 0) player.setStorage("shhuoshan_blocker", 1);
					else player.storage.shhuoshan_blocker++;
				},
				sub: true,
			},
			blocker: {
				charlotte: true,
				mod: {
					globalTo: function (from, to, distance) {
						return distance + to.getStorage("shhuoshan_blocker");
					},
				},
				onremove: function (player, skill) {
					player.storage.shhuoshan_blocker = 0;
				},
				mark: true,
				intro: {
					content: "本轮内其他角色计算与你距离+$",
				},
				sub: true,
			},
		},
	},
	shquexi: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "useCard",
		},
		frequent: true,
		filter: function (event, player) {
			return event.cards && event.cards.length >= player.hp;
		},
		content: function () {
			"step 0";
			event.num = player.hp;
			var list = ["摸牌"];
			if (player.countCards("he", lib.filter.cardRecastable) > 0) list.add("重铸");
			var next = player.chooseControl(list).set("prompt", "摸一张牌或重铸所有牌，然后回复1点体力");
			next.set("ai", function (button) {
				var player = _status.event.player;
				if (player.countCards("he") > 8) return "重铸";
				return "摸牌";
			});
			("step 1");
			if (result.control == "重铸") {
				player.recast(player.getCards("he", lib.filter.cardRecastable));
				if (trigger.cards.length == event.num) player.draw();
			} else {
				if (trigger.cards.length == event.num) player.draw(2);
				else player.draw();
			}
			("step 2");
			player.recover();
		},
	},
	shjingdi: {
		audio: "ext:水泊娘山/character/audio/skill:3",
		init: function (player) {
			player.storage.shjingdi = [];
		},
		locked: false,
		mod: {
			aiOrder: function (player, card, num) {
				if (typeof card == "object" && player == _status.currentPhase) {
					if (player.storage.shjingdi.includes(get.suit(card))) return num + 10;
				}
			},
		},
		enable: "phaseUse",
		filter: function (event, player) {
			var lists = [];
			var hs = player.getCards("h");
			for (var i of hs) lists.add(get.suit(i, player));
			if (lists.length != 3 && lists.length != 1) return false;
			if (lists.length == 1) return !player.storage.shjingdi.includes(lists[0]);
			var suit = lib.suit.filter(function (val) {
				return lists.indexOf(val) === -1;
			});
			return !player.storage.shjingdi.includes(suit[0]);
		},
		content: function () {
			"step 0";
			//player.line(player,'green');
			var lists = [];
			var hs = player.getCards("h");
			for (var i of hs) lists.add(get.suit(i, player));
			event.lists = lists;
			player.showHandcards();
			("step 1");
			if (event.lists.length == 1) {
				player.draw();
				var suit = event.lists[0];
				player.storage.shjingdi.push(suit);
				player.addTempSkill("shjingdi_mark", "phaseUseAfter");
			} else if (event.lists.length == 3) {
				player.chooseToDiscard(true).set("ai", function (card) {
					var player = _status.event.player;
					var evt = _status.event.getParent();
					var num = 5;
					if (!player.hasUseTarget(card)) num += 4;
					if (player.storage.shjingdi.includes(get.suit(card))) num += 2;
					return num - get.value(card);
				});
				var suit = lib.suit.filter(function (val) {
					return event.lists.indexOf(val) === -1;
				});
				player.storage.shjingdi.push(suit[0]);
				player.addTempSkill("shjingdi_mark", "phaseUseAfter");
			} else event.finish();
			("step 2");
			if (player.storage.shjingdi.length) {
				player.chooseUseTarget({ name: "sha", nature: "thunder" }, false);
				//player.markSkill('shdiyin');
			} else event.finish();
		},
		ai: {
			threaten: 3.5,
			order: function () {
				var player = _status.event.player;
				var lists = [];
				var hs = player.getCards("h");
				for (var i of hs) lists.add(get.suit(i, player));
				if (lists.length != 3 && lists.length != 1) return 0;
				return 9;
			},
			result: {
				player: function (player) {
					if (player.hasValueTarget({ name: "sha", nature: "thunder" }, false)) return 1;
					return 0;
				},
			},
		},
		subSkill: {
			mark: {
				mod: {
					globalFrom: function (from, to, distance) {
						if (_status.currentPhase == from) {
							return distance - from.storage.shjingdi.length;
						}
					},
				},
				onremove: function (player, skill) {
					player.storage.shjingdi = [];
				},
				mark: true,
				intro: {
					content: function (storage, player) {
						var str = "";
						if (player.storage.shjingdi) {
							str += "<br><li>当前花色：";
							str += get.translation(player.storage.shjingdi);
						}
						return str;
					},
				},
				sub: true,
			},
		},
	},
	shjiepeng: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: ["dying", "die"],
		},
		filter: function (event, player) {
			if (event.name != "die" && _status.currentPhase != player) return false;
			if (event.player == player) return false;
			return event.player.countCards("e") > 0;
		},
		logTarget: "player",
		async content(event, trigger, player) {
			const cards = trigger.player.getCards("e");
			if (_status.connectMode)
				game.broadcastAll(function () {
					_status.noclearcountdown = true;
				});
			event.given_map = {};
			event.target2s = [];
			if (!cards || !cards.length) return;
			do {
				const { bool, links } =
					cards.length == 1
						? { links: cards.slice(0), bool: true }
						: await player
								.chooseCardButton("请选择要分配的牌", true, cards, [1, cards.length])
								.set("ai", () => {
									if (ui.selected.buttons.length == 0) return 1;
									return 0;
								})
								.forResult();
				if (!bool) return;
				cards.removeArray(links);
				event.togive = links.slice(0);
				const result = await player
					.chooseTarget("选择一名角色获得" + get.translation(links), true)
					.set("ai", function (target) {
						var att = get.attitude(get.event().player, target);
						if (_status.event.enemy) {
							return -att;
						} else if (att > 0) {
							return att / (1 + target.countCards("h"));
						} else {
							return att / 100;
						}
					})
					.set("enemy", get.value(event.togive[0], player, "raw") < 0)
					.forResult();
				if (result.targets.length) {
					const targets = result.targets;
					event.target2s.add(targets[0]);
					const id = targets[0].playerid,
						map = event.given_map;
					if (!map[id]) map[id] = [];
					map[id].addArray(event.togive);
				}
			} while (cards.length > 0);
			if (_status.connectMode) {
				game.broadcastAll(function () {
					delete _status.noclearcountdown;
					game.stopCountChoose();
				});
			}
			const list = [];
			for (const i in event.given_map) {
				const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
				player.line(source, "green");
				if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) player.addExpose(0.2);
				list.push([source, event.given_map[i]]);
			}
			game.loseAsync({
				gain_list: list,
				giver: player,
				animate: "gain2",
			}).setContent("gaincardMultiple");
			for (var i in event.given_map) {
				var source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
				await source.addShownCards(event.given_map[i], "visible_shjiepeng");
			}
		},
	},
	shjiayao: {
		global: "shjiayao_global",
		locked: true,
		subSkill: {
			global: {
				trigger: {
					player: "useCard",
				},
				forced: true,
				popup: false,
				filter: function (event, player) {
					var card = event.card;
					if (get.name(card) != "jiu" || get.color(card) == "none") return false;
					return event.player.hasHistory("lose", function (evt) {
						if (evt.getParent() != event) return false;
						for (var i in evt.gaintag_map) {
							if (evt.gaintag_map[i].includes("visible_shjiepeng")) return true;
						}
						return false;
					});
				},
				content: function () {
					//var targets = trigger.targets;
					if (get.color(trigger.card) == "red" && _status.dying.includes(player)) player.recover();
					else if (get.color(trigger.card) == "black" && !_status.dying.includes(player)) player.loseHp();
				},
				mod: {
					cardname: function (card) {
						if (card.hasGaintag("visible_shjiepeng")) return "jiu";
					},
				},
				sub: true,
			},
		},
		ai: {
			combo: "shjiepeng",
		},
	},
	shpingyue: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		usable: 3,
		filter: function (event, player) {
			if (player.hasSkill("shpingyue_fire") && player.hasSkill("shpingyue_thunder") && player.hasSkill("shpingyue_ice")) return false;
			return player.countCards("h") > 0;
		},
		async content(event, trigger, player) {
			const togives = player.getCards("h");
			const togiver = [];
			if (_status.connectMode)
				game.broadcastAll(function () {
					_status.noclearcountdown = true;
				});
			event.given_map = {};
			if (!togives || !togives.length) return;
			do {
				const { bool, cards, targets } = await player
					.chooseCardTarget({
						filterCard: function (card) {
							return togives.includes(card);
						},
						selectCard: [1, togives.length],
						filterTarget: function (card, player, target) {
							return player != target;
						},
						ai1: function (card) {
							if (ui.selected.cards.length > 0) return -1;
							if (card.name == "du") return 20;
							return 20 - get.value(card);
						},
						ai2: function (target) {
							var att = get.attitude(get.event().player, target);
							if (togiver.includes(target)) return -1;
							return 2 - att;
						},
						prompt: "请选择要送人的卡牌",
					})
					.set("forced", true)
					.forResult();
				if (bool) {
					togiver.add(targets[0]);
					player.line(targets, "green");
					togives.removeArray(cards);
					const id = targets[0].playerid,
						map = event.given_map;
					if (!map[id]) map[id] = [];
					map[id].addArray(cards);
				}
			} while (togives.length > 0);
			if (_status.connectMode) {
				game.broadcastAll(function () {
					delete _status.noclearcountdown;
					game.stopCountChoose();
				});
			}
			const list = [];
			for (const i in event.given_map) {
				const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
				player.line(source, "green");
				if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) player.addExpose(0.2);
				list.push([source, event.given_map[i]]);
			}
			game.loseAsync({
				gain_list: list,
				giver: player,
				animate: "giveAuto",
			}).setContent("gaincardMultiple");
			await player.draw(3);
			const list2 = [];
			const natures = ["thunder", "fire", "ice"];
			for (var i of natures) {
				if (!player.hasSkill("shpingyue_" + i)) list2.push(["基本", "", "sha", i]);
			}
			if (list2.length > 0) {
				togiver.sortBySeat();
				const { bool, links } = await player
					.chooseButton(["视为对" + get.translation(togiver) + "使用一张【杀】？", [list2, "vcard"]])
					.set("ai", function (button) {
						if (button.link[3] == "ice") return 1.5 + Math.random();
						return 0.8 + Math.random();
					})
					.set("forced", true)
					.forResult();
				if (bool) {
					await player.addTempSkill("shpingyue_" + links[0][3], "phaseUseAfter");
					await player.useCard({ name: links[0][2], nature: links[0][3], isCard: true }, togiver, false);
					if (
						player.hasHistory("sourceDamage", function (evt) {
							var card = evt.card;
							if (!card || card.name != "sha") return false;
							var evtx = evt.getParent("useCard");
							return evtx.card == card && evtx.getParent() == event;
						})
					) {
						player.addTempSkill("shpingyue_ice", "phaseUseAfter");
						player.addTempSkill("shpingyue_fire", "phaseUseAfter");
						player.addTempSkill("shpingyue_thunder", "phaseUseAfter");
					}
				}
			}
		},
		ai: {
			threaten: 1.5,
			order: function () {
				var player = _status.event.player;
				if (player.countCards("h") == 1) return 8;
				return 1;
			},
			result: {
				player: function (player, target) {
					var targets = game.filterPlayer(current => {
						return (
							get.attitude(player, current) < 0 &&
							player.canUse(
								{
									name: "sha",
									isCard: true,
								},
								current,
								false
							)
						);
					});
					var num = player.getCards("h").reduce((sum, card) => sum + get.value(card), 0);
					var bool2 =
						player.countCards("h", card => {
							return card.name == "tao" || card.name == "jiu";
						}) > 0;
					if (num / 6 > targets.length || bool2) return 0;
					return 1;
				},
			},
		},
		subSkill: {
			thunder: {
				sub: true,
			},
			fire: {
				sub: true,
			},
			ice: {
				sub: true,
			},
		},
	},
	shxuanzhen: {
		enable: "phaseUse",
		filter: function (event, player) {
			if (player.hasSkill("shxuanzhen_blocker")) return false;
			return game.hasPlayer(current => {
				return current.countCards("e", card => !player.storage.shxuanzhen || !player.storage.shxuanzhen.includes(card)) > 0;
			});
		},
		filterTarget: function (card, player, target) {
			if (ui.selected.targets.length == 1) {
				var from = ui.selected.targets[0];
				if (target.isMin()) return false;
				var es = from.getCards("e", card => !player.storage.shxuanzhen || !player.storage.shxuanzhen.includes(card));
				for (var i = 0; i < es.length; i++) {
					if (target.canEquip(es[i])) return true;
				}
				return false;
			}
			return target.countCards("e", card => !player.storage.shxuanzhen || !player.storage.shxuanzhen.includes(card)) > 0;
		},
		targetprompt: ["被移走", "移动目标"],
		selectTarget: 2,
		multitarget: true,
		content: function () {
			"step 0";
			if (!player.storage.shxuanzhen) player.storage.shxuanzhen = [];
			event.num1 = game.filterPlayer(current => player.inRange(current)).length;
			("step 1");
			player
				.choosePlayerCard(
					"e",
					true,
					function (button) {
						var player = _status.event.player;
						var targets0 = _status.event.targets0;
						var targets1 = _status.event.targets1;
						if (get.attitude(player, targets0) > 0 && get.attitude(player, targets1) < 0) {
							if (get.value(button.link, targets0) < 0 && get.effect(targets1, button.link, player, targets1) > 0) return 10;
							return 0;
						} else {
							return get.value(button.link) * get.effect(targets1, button.link, player, targets1);
						}
					},
					targets[0]
				)
				.set("targets0", targets[0])
				.set("targets1", targets[1])
				.set("filterButton", function (button) {
					var targets1 = _status.event.targets1;
					var suit = _status.event.suit;
					return targets1.canEquip(button.link) && (!player.storage.shxuanzhen || !player.storage.shxuanzhen.includes(button.link));
				});
			("step 2");
			if (result.bool && result.links.length) {
				var link = result.links[0];
				if (get.position(link) == "e") {
					event.targets[1].equip(link);
				}
				event.targets[0].$give(link, event.targets[1], false);
				player.storage.shxuanzhen.add(link);
				game.log(event.targets[0], "的", link, "被移动给了", event.targets[1]);
				player.addTempSkill("shxuanzhen_mark");
				//event.result.card=link;
				// event.result.position=get.position(link);
				game.delay();
			}
			("step 3");
			var num2 = game.filterPlayer(current => player.inRange(current)).length;
			if (num2 > event.num1) {
				game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shxuanzhen1.mp3");
				player.chooseUseTarget({ name: "sha" }, "视为使用一张【杀】", false);
			} else if (num2 < event.num1) {
				game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shxuanzhen2.mp3");
				player.draw(2);
			} else player.addTempSkill("shxuanzhen_blocker");
		},
		ai: {
			order: 8,
			result: {
				target: function (player, target) {
					var players = game.filterPlayer(current => {
						return current.countCards("e") > 0 && get.attitude(player, current) < 0;
					});
					if (ui.selected.targets.length == 0 && players.length > 0) {
						return -3;
					} else {
						return 3;
					}
				},
			},
			expose: 0.4,
			threaten: 3,
		},
		subSkill: {
			blocker: {
				sub: true,
			},
			mark: {
				onremove: function (player, skill) {
					player.storage.shxuanzhen = [];
				},
				mark: true,
				/*intro: {
                                content:function (storage,player) {
                                    return get.translation(player.getStorage('shxuanzhen'));
                                },
                            },*/
				intro: {
					mark: function (dialog, content, player) {
						dialog.addText("本回合移动过的装备牌");
						dialog.add(player.getStorage("shxuanzhen"));
					},
				},
				sub: true,
			},
		},
	},
	shlingchen: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		chooseButton: {
			dialog: function (event, player) {
				var dialog = ui.create.dialog("凌尘：选择一项", "hidden");
				var list = [];
				list.add(["横置", "视为使用【杀】"]);
				list.add(["重置", "视为使用【酒】"]);
				list.add(["翻面", "本轮使用基本牌额外结算且多选择目标"]);
				dialog.add([list, "textbutton"]);
				return dialog;
			},
			filter: function (button, player) {
				var link = button.link;
				if (link == "横置") return !player.isLinked();
				if (link == "重置") return player.isLinked();
				return !player.classList.contains("turnedover");
			},
			check(button) {
				var player = _status.event.player;
				var hs = player.getCards("h", card => {
					return get.type(card) == "basic" && player.hasValueTarget(card);
				});
				switch (button.link) {
					case "横置":
						if (player.hasValueTarget("sha", false)) return 8 + Math.random();
						return 0.8 + Math.random();
					case "重置":
						if (player.hasValueTarget("jiu")) return 8 + Math.random();
						return 1 + Math.random();
					case "翻面":
						if (hs.length > 1) return hs.length + Math.random();
						return 0;
				}
			},
			backup: function (links, player) {
				var next = get.copy(lib.skill["shlingchen_backupx"]);
				next.choice = links[0];
				return next;
			},
		},
		ai: {
			order: function () {
				var player = _status.event.player;
				if (!player.isLinked()) return get.order({ name: "sha" }) + 0.1;
				return get.order({ name: "jiu" }) + 0.1;
			},
			result: {
				player: 1,
			},
		},
		subSkill: {
			blocker: {
				trigger: {
					player: "useCard",
				},
				forced: true,
				charlotte: true,
				popup: false,
				filter: function (event, player) {
					return get.type(event.card) == "basic";
				},
				content: function () {
					trigger.effectCount++;
				},
				mod: {
					selectTarget: function (card, player, range) {
						var type = get.type(card);
						if (type == "basic" && range[1] != -1) {
							range[1]++;
						}
					},
				},
				mark: true,
				intro: {
					content: "本轮使用基本牌可额外指定一名目标且多结算一次",
				},
				sub: true,
			},
			backupx: {
				content: function () {
					"step 0";
					var choice = lib.skill.shlingchen_backup.choice;
					event.choice = choice;

					("step 1");
					if (event.choice == "横置") {
						game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shlingchen1.mp3");
						player.link(true);
						player.chooseUseTarget({ name: "sha" }, "视为使用一张【杀】", false);
					}
					("step 2");
					if (event.choice == "重置") {
						game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shlingchen2.mp3");
						player.link();
						player.chooseUseTarget("jiu", true);
					}
					("step 3");
					if (event.choice == "翻面") {
						game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shlingchen1.mp3");
						game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shlingchen2.mp3");
						player.turnOver();
						player.addTempSkill("shlingchen_blocker", "roundStart");
					}
				},
				sub: true,
			},
		},
	},
	shzhenjiu: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			global: "phaseUseBegin",
		},
		direct: true,
		filter: function (event, player) {
			if (event.player == player || event.player.isDead() || player.hasSkill("shzhenjiu_round")) return false;
			return player.countCards("he") > 0;
		},
		content: function () {
			"step 0";
			player
				.chooseToDiscard(get.prompt2("shzhenjiu", trigger.player), "he")
				.set("ai", function (card) {
					var player = _status.event.player;
					var target = _status.event.getTrigger().player;
					var num = target.countCards("h", card => get.name(card, target) == "jiu");
					var num1 = target.countCards("h", card => card.hasGaintag("visible_shjiepeng") && get.color(card) == "black");
					var att = get.attitude(player, target);
					if (num1 / num > 0.4 && att > 0) return 0;
					if (num1 / num < 0.3 && att < 1) return 0;
					return 6 - get.value(card);
				})
				.set("logSkill", ["shzhenjiu", trigger.player]);
			("step 1");
			if (result.bool) {
				var target = trigger.player;
				target.showHandcards();
				var cards = target.getCards("h").filter(function (card) {
					return (
						get.name(card, trigger.player) == "jiu" &&
						trigger.player.canUse(
							{
								name: "jiu",
								isCard: true,
								cards: [card],
							},
							trigger.player,
							false
						)
					);
				});
				if (!cards.length) {
					player.addTempSkill("shzhenjiu_exchange");
					event.finish();
				}
				event.cards = cards;
			} else event.finish();
			("step 2");

			if (cards.length) {
				var card = cards.randomRemove(1)[0];
				trigger.player.chooseUseTarget(card, true, false);
				event.redo();
			}
		},
		subSkill: {
			exchange: {
				trigger: {
					global: "phaseEnd",
				},
				charlotte: true,
				direct: true,
				content: function () {
					game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shzhenjiu_exchange1.mp3");
					player.swapHandcards(trigger.player);
					player.addTempSkill("shzhenjiu_round", "roundStart");
				},
				sub: true,
			},
			round: {
				charlotte: true,
				sub: true,
			},
		},
	},
	shfengchun: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		position: "h",
		enable: "phaseUse",
		usable: 1,
		filterCard: true,
		selectCard: -1,
		filter: function (event, player) {
			var hs = player.getCards("h");
			if (!hs.length) return false;
			for (var i = 0; i < hs.length; i++) {
				var mod2 = game.checkMod(hs[i], player, "unchanged", "cardEnabled2", player);
				if (mod2 === false) return false;
			}
			return true;
		},
		viewAs: {
			name: "wugu",
			storage: {
				shfengchun: true,
			},
		},
		group: ["shfengchun_1", "shfengchun_2"],
		subSkill: {
			1: {
				trigger: {
					player: "useCard1",
				},
				forced: true,
				popup: false,
				filter: function (event, player) {
					return event.card.name == "wugu" && event.card.storage && event.card.storage.shfengchun;
				},
				content: function () {
					var num = trigger.targets.length;
					var cards = get.bottomCards(num);
					//event.cards2=cards;
					game.cardsGotoOrdering(cards);
					game.cardsGotoPile(cards, "insert");
					//game.log(player,'将',cards,'置于了牌堆顶');
				},
				sub: true,
			},
			2: {
				trigger: {
					player: "useCardToPlayered",
				},
				filter: function (event, player) {
					return event.card.name == "wugu" && event.card.storage && event.card.storage.shfengchun && event.isFirstTarget;
				},
				direct: true,
				popup: false,
				content: function () {
					"step 0";
					player
						.chooseTarget("令【五谷丰登】对至多" + get.cnNumber(Math.min(trigger.targets.length, trigger.cards.length)) + "名目标无效", [1, Math.min(trigger.targets.length, trigger.cards.length)], function (card, player, target) {
							return _status.event.targets.includes(target);
						})
						.set("ai", function (target) {
							var trigger = _status.event.getTrigger();
							if (game.phaseNumber > game.players.length * 2 && trigger.targets.length >= game.players.length - 1 && !trigger.excluded.includes(target)) {
								return -get.effect(target, trigger.card, trigger.player, _status.event.player);
							}
							return -1;
						})
						.set("targets", trigger.targets);
					("step 1");
					if (result.bool) {
						trigger.getParent().excluded.addArray(result.targets);
						game.delay();
					}
				},
				sub: true,
			},
		},
		ai: {
			wuxie: function () {
				if (Math.random() < 0.5) return 0;
			},
			basic: {
				order: 3,
				useful: 0.5,
			},
			result: {
				target: function (player, target) {
					var sorter = _status.currentPhase || player;
					if (get.is.versus()) {
						if (target == sorter) return 1.5;
						return 1;
					}
					if (player.hasUnknown(2)) {
						return 0;
					}
					return (1 - get.distance(sorter, target, "absolute") / game.countPlayer()) * get.attitude(player, target) > 0 ? 0.5 : 0.7;
				},
			},
			tag: {
				draw: 1,
				multitarget: 1,
			},
		},
	},
	shcangren: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			global: "gainAfter",
		},
		filter: function (event, player) {
			var cards = event.getg(event.player);
			if (player == event?.player || cards?.length != 1) return false;
			if (get.type(cards[0]) == "delay" || get.type(cards[0]) == "equip") return false;
			var name = get.name(cards[0], event.player);
			var card = {
				name: name,
				isCard: true,
			};
			if (!lib.filter.targetEnabled2(card, player, event.player)) return false;
			return event.getParent().name == "wugu";
		},
		logTarget: "player",
		check: function (event, player) {
			var cards = event.getg(event.player);
			var name = get.name(cards[0], event.player);
			if (get.effect(event.player, { name: name }, player, player) > 0) return true;
			return false;
		},
		prompt: function (event, player) {
			var cards = event.getg(event.player);
			return "藏刃：是否视为对" + get.translation(event.player) + "使用一张" + get.translation(get.name(cards[0], event.player)) + "？";
		},
		content: function () {
			var cards = trigger.getg(trigger.player);
			var name = get.name(cards[0], trigger.player);
			player
				.useCard({ name: name, isCard: true }, trigger.player)
				.set("oncard", function (card) {
					card.storage.shcangren = true;
				})
				.set("addCount", false);
		},
		group: ["shcangren_damage"],
		subSkill: {
			damage: {
				trigger: {
					player: "useCardAfter",
				},
				charlotte: true,
				direct: true,
				filter: function (event, player) {
					var history = player.hasHistory("sourceDamage", function (evt) {
						return evt.card == event.card;
					});
					return event.card && event.card.storage && event.card.storage["shcangren"] && !history;
				},
				content: function () {
					"step 0";
					var cards = get.cards(2);
					event.cards = cards;
					game.cardsGotoOrdering(cards);
					var next = player.chooseToMove();
					next.set("list", [["牌堆顶", cards], ["牌堆底"]]);
					next.set("prompt", "点击将牌移动到牌堆顶或牌堆底");
					next.processAI = function (list) {
						var cards = list[0][1],
							player = _status.event.player;
						var top = [];
						var judges = player.getCards("j");
						var stopped = false;
						if (!player.hasWuxie()) {
							for (var i = 0; i < judges.length; i++) {
								var judge = get.judge(judges[i]);
								cards.sort(function (a, b) {
									return judge(b) - judge(a);
								});
								if (judge(cards[0]) < 0) {
									stopped = true;
									break;
								} else {
									top.unshift(cards.shift());
								}
							}
						}
						if (!stopped) {
							cards.sort(function (a, b) {
								return get.value(b, player) - get.value(a, player);
							});
							while (cards.length) {
								if (get.value(cards[0], player) <= 5) break;
								top.unshift(cards.shift());
							}
						}
						bottom = cards;
						return [top, bottom];
					};
					("step 1");
					var top = result.moved[0];
					var bottom = result.moved[1];
					top.reverse();
					for (var i = 0; i < top.length; i++) {
						ui.cardPile.insertBefore(top[i], ui.cardPile.firstChild);
					}
					for (i = 0; i < bottom.length; i++) {
						ui.cardPile.appendChild(bottom[i]);
					}
					player.popup(get.cnNumber(top.length) + "上" + get.cnNumber(bottom.length) + "下");
					game.log(player, "将" + get.cnNumber(top.length) + "张牌置于牌堆顶");

					game.updateRoundNumber();
					game.delayx();
				},
				sub: true,
			},
		},
	},
	shzhijing: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			global: "phaseEnd",
		},
		direct: true,
		filter: function (event, player) {
			if (player.hasSkill("shzhijing_round")) return false;
			return game.getGlobalHistory("cardMove").some(function (evt) {
				if (evt.name != "cardsDiscard") {
					if (evt.name != "lose" || evt.position != ui.discardPile) return false;
				}
				return evt.cards.some(card => get.position(card, true) == "d");
			});
		},
		content: function () {
			"step 0";
			var cards = [];
			game.getGlobalHistory("cardMove", function (evt) {
				if (evt.name != "cardsDiscard") {
					if (evt.name != "lose" || evt.position != ui.discardPile) return false;
				}
				cards.addArray(evt.cards.filter(card => get.position(card, true) == "d"));
			});
			if (!cards.length) event.finish();
			else {
				var next = player.chooseButton([get.prompt("shzhijing"), "令" + get.translation(trigger.player) + "获得任意张花色不同的牌", cards], [1, 4]).set("ai", function (button) {
					var player = _status.event.player,
						target = _status.event.getTrigger().player;
					var att = get.attitude(player, target) - 0.1;
					return get.sgn(att) * get.value(button.link, target);
				});
				next.set("filterButton", function (button) {
					if (ui.selected.buttons.length) {
						for (var i of ui.selected.buttons) {
							if (get.suit(button.link, false) == get.suit(i, false)) return false;
						}
					}
					return true;
				});
				next.set("complexSelect", true);
			}
			("step 1");
			if (result.bool) {
				var suits = [];
				for (var i of result.links) {
					suits.add(get.suit(i, false));
				}
				player.logSkill("shzhijing", trigger.player);
				trigger.player.gain(result.links, "gain2");
				trigger.player.addSkill("shzhijing_buff");
				player.addTempSkill("shzhijing_round", "roundStart");
				if (!trigger.player.storage.shzhijing_buff) trigger.player.storage.shzhijing_buff = [];
				for (var i of suits) trigger.player.storage.shzhijing_buff.add(i);
			}
		},
		subSkill: {
			round: {
				charlotte: true,
				sub: true,
			},
			buff: {
				mark: true,
				intro: {
					content: "不能使用或打出$手牌直到新的轮次开始",
				},
				trigger: {
					global: "roundStart",
					//player: "damageEnd",
				},
				firstDo: true,
				forced: true,
				popup: false,
				content: function () {
					player.removeSkill("shzhijing_buff");
				},
				mod: {
					cardEnabled: function (card, player) {
						if (player.getStorage("shzhijing_buff").includes(get.suit(card))) return false;
					},
					cardUsable: function (card, player) {
						if (player.getStorage("shzhijing_buff").includes(get.suit(card))) return false;
					},
					cardRespondable: function (card, player) {
						if (player.getStorage("shzhijing_buff").includes(get.suit(card))) return false;
					},
					cardSavable: function (card, player) {
						if (player.getStorage("shzhijing_buff").includes(get.suit(card))) return false;
					},
				},
				onremove: function (player) {
					player.storage.shzhijing_buff = [];
				},
				ai: {
					threaten: 0.6,
				},
				sub: true,
			},
		},
	},
	shmifeng: {
		global: "shmifeng_viewas",
		subSkill: {
			viewas: {
				enable: "chooseToUse",
				filter: function (event, player) {
					if (
						!game.hasPlayer(function (current) {
							return current.hasSkill("shmifeng");
						})
					)
						return false;
					if (!event.filterCard({ name: "shan", isCard: true }, player, event)) return false;
					if (event.shmifeng) return false;
					return player.hasCard(card => player.canRecast(card), "he") > 0 && player.hp == 1;
				},
				hiddenCard: function (player, name) {
					return name == "shan" && player.hasCard(card => player.canRecast(card), "he");
				},
				delay: false,
				checkx: function (player) {
					if (player.hasCard(card => get.value(card) < 10, "he")) return true;
					return false;
				},
				content: function () {
					"step 0";
					var suits = lib.skill.shmifeng.getSuit();
					event.num1 = suits.length;
					player
						.chooseCard("he", get.prompt2("shmifeng"), lib.filter.cardRecastable, true)
						.set("ai", function (card) {
							if (!_status.event.suits.includes(get.suit(card))) return 100 - get.value(card);
							if (get.name(card) == "shan" || get.name(card) == "tao" || get.name(card) == "jiu") return 0;
							return 60 - get.value(card);
						})
						.set("suits", suits);
					("step 1");
					if (result.bool) {
						player.recast(result.cards);
					} else event.finish();
					("step 2");
					var suits = lib.skill.shmifeng.getSuit();
					event.num2 = suits.length;
					var evt = event.getParent(2);
					if (event.num2 <= event.num1) {
						evt.set("shmifeng", true);
						evt.goto(0);
					} else {
						evt.result = {
							bool: true,
							card: { name: "shan", isCard: true },
							cards: [],
						};
						evt.redo();
					}
				},
				ai: {
					combo: "shmifeng",
					respondShan: true,
					skillTagFilter: function (player) {
						return lib.skill["shmifeng_viewas"].hiddenCard(player, "shan");
					},
					order: 10,
					result: {
						player: 1,
					},
				},
				sub: true,
			},
		},
		getSuit: function () {
			var cards = get.centralDisCards();
			var suits = [];
			for (var i of cards) suits.add(get.suit(i, false));
			return suits;
		},
	},
	shyaofa: {
		trigger: {
			global: "useCardToTarget",
		},
		filter: function (event, player) {
			if (!event.target.countCards("ej")) return false;
			else if (event.card.name != "sha" || !player.countCards("he") || event.target == player) return false;
			var ejs = event.target.getCards("ej");
			for (var i of ejs) {
				var suit = get.suit(i);
				if (player.countCards("he", { suit: suit }) > 0) return true;
			}
			return false;
		},
		direct: true,
		async content(event, trigger, player) {
			const target1 = trigger.target;
			const target2s = trigger.targets;
			const { bool, cards, targets } = await player
				.chooseCardTarget({
					prompt: get.prompt("shyaofa"),
					prompt2: lib.translate.shyaofa_info,
					position: "he",
					//animate:false,
					filterCard(card, player) {
						var suit = get.suit(card);
						return target1.countCards("ej", { suit: suit }) > 0 && lib.filter.cardDiscardable(card, player);
					},
					filterTarget(card, player, target) {
						if (!ui.selected.cards) return false;
						var suit = get.suit(ui.selected.cards[0]);
						var es = target1.getCards("ej", { suit: suit });
						for (var i of es) {
							if (get.position(i) == "j") {
								if (target.canAddJudge(i) && !target2s.includes(target)) return true;
							}
							if (target.canEquip(i) && !target2s.includes(target)) return true;
						}
						return false;
					},
					ai1(card) {
						return 10 - get.value(card);
					},
					ai2(target) {
						return get.attitude(player, target);
					},
				})
				.forResult();
			if (!bool) return;
			const target2 = targets[0];
			const suit = get.suit(cards[0]);
			await player.discard(cards);
			player.logSkill("shyaofa", [target1, target2]);
			const result = await player
				.choosePlayerCard("将" + get.translation(target1) + "场上一张" + get.translation(suit) + "牌移动给" + get.translation(target2), "ej", true, target1)
				.set("filterButton", function (button) {
					if (get.position(button.link) == "j") return target2.canAddJudge(button.link) && get.suit(button.link) == suit;
					return target2.canEquip(button.link) && get.suit(button.link) == suit;
				})
				.forResult();
			if (result.bool) {
				var moved = result.buttons[0].link;
				if (get.position(moved) == "e") {
					target2.equip(moved);
				} else if (moved.viewAs) {
					target2.addJudge({ name: moved.viewAs }, [moved]);
				} else {
					target2.addJudge(moved);
				}
				target1.$give(moved, target2, false);
				game.log(target1, "的", moved, "被移动给了", target2);
				if (trigger.player != target2) {
					trigger.getParent().targets.push(target2);
					trigger.getParent().triggeredTargets2.push(target2);
					game.log(target2, "成为了", trigger.card, "的额外目标");
				} else {
					player.draw(3);
					player.turnOver();
				}
			}
		},
	},
	shguahuo: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "dying",
		},
		forced: true,
		filter: function (event, player) {
			return player.countCards("h") > 0;
		},
		async content(event, trigger, player) {
			const togives = player.getCards("h");
			const togiver = [];
			if (_status.connectMode)
				game.broadcastAll(function () {
					_status.noclearcountdown = true;
				});
			event.given_map = {};
			if (!togives || !togives.length) return;
			do {
				const { bool, cards, targets } = await player
					.chooseCardTarget({
						filterCard: function (card) {
							return togives.includes(card);
						},
						selectCard: [1, togives.length],
						filterTarget: function (card, player, target) {
							return player != target;
						},
						ai1: function (card) {
							if (ui.selected.cards.length > 0) return -1;
							if (card.name == "du") return 20;
							return 20 - get.value(card);
						},
						ai2: function (target) {
							var att = get.attitude(get.event().player, target);
							return att + 100;
						},
						prompt: "请选择要送人的卡牌",
					})
					.set("forced", true)
					.forResult();
				if (bool) {
					togiver.add(targets[0]);
					targets[0].addTempSkill("shguahuo_alloc", "dyingAfter");
					player.line(targets, "green");
					togives.removeArray(cards);
					const id = targets[0].playerid,
						map = event.given_map;
					if (!map[id]) map[id] = [];
					map[id].addArray(cards);
				}
			} while (togives.length > 0);
			if (_status.connectMode) {
				game.broadcastAll(function () {
					delete _status.noclearcountdown;
					game.stopCountChoose();
				});
			}
			const list = [];
			for (const i in event.given_map) {
				const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
				player.line(source, "green");
				if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) player.addExpose(0.2);
				list.push([source, event.given_map[i]]);
			}
			game.loseAsync({
				gain_list: list,
				giver: player,
				animate: "giveAuto",
			}).setContent("gaincardMultiple");
		},
		mod: {
			targetEnabled: function (card, player, target, now) {
				if (card.name == "tao" && !player.hasSkill("shguahuo_alloc") && target.isDying()) return false;
			},
		},
		subSkill: {
			alloc: {
				mark: true,
				intro: {
					content: "可使用【桃】",
				},
				sub: true,
			},
		},
	},
	shjianghuo: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		viewAs: {
			name: "huogong",
			isCard: true,
			storage: {
				shjianghuo: true,
			},
		},
		filterCard: () => false,
		selectCard: -1,
		prompt: "视为对任意名武将牌横置的角色使用一张【火攻】",
		filterTarget(card, player, target) {
			if (!target.isLinked()) return false;
			return player.canUse(card, target);
		},
		selectTarget: [1, Infinity],
		precontent() {
			const card = event.result.card;
			player
				.when("useCard")
				.filter(evt => evt.skill == "shjianghuo" && evt.card.storage && evt.card.storage.shjianghuo)

				.then(() => {
					player.storage.shjianghuo_discard = [];
					player.addTempSkill("shjianghuo_discard", "phaseUseAfter");
				});
		},
		ai: {
			order: 10,
			basic: {
				order: 9.2,
				value: [3, 1],
				useful: 0.6,
			},
			wuxie: function (target, card, player, viewer, status) {
				if (get.attitude(viewer, player._trueMe || player) > 0) return 0;
				if (status * get.attitude(viewer, target) * get.effect(target, card, player, target) >= 0) return 0;
				if (_status.event.getRand("huogong_wuxie") * 4 > player.countCards("h")) return 0;
			},
			result: {
				player: 1,
			},
			tag: {
				damage: 1,
				fireDamage: 1,
				natureDamage: 1,
				norepeat: 1,
			},
		},
		subSkill: {
			discard: {
				trigger: {
					player: "loseAfter",
				},
				forced: true,
				popup: false,
				filter: function (event, player) {
					let evt2 = event.getl(player);
					let evt3 = event.getParent("useCard");
					let card2 = evt3.card;
					if (!card2 || card2.name != "huogong") return false;
					let bool1 = event.type == "discard" && evt2 && evt2.player == player && evt2.hs && evt2.hs.length == 1;
					let bool2 = card2.storage && card2.storage.shjianghuo && card2.name == "huogong";
					return bool1 && bool2;
				},
				async content(event, trigger, player) {
					const evt = trigger.getParent("useCard");
					const card = evt.card;
					const cards = trigger.getl(player).hs;
					const suit = get.suit(cards[0], false);
					if (!player.storage.shjianghuo_discard.includes(suit)) {
						await player.draw(3);
					}
					player.storage.shjianghuo_discard.add(suit);
				},
				sub: true,
			},
		},
	},
	shbingyin: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "damageBegin4",
		},
		filter: function (event, player) {
			//&&!player.hasSkill('shbingyin_add')
			return game.hasPlayer(current => !current.isLinked() && current.countCards("e") > 0);
		},
		direct: true,
		content: function () {
			"step 0";
			player
				.chooseTarget(get.prompt("shbingyin"), "横置一名装备区有牌的角色", (card, player, target) => {
					return !target.isLinked() && target.countCards("e") > 0;
				})
				.set("ai", target => {
					var player = _status.event.player;
					if (target == player) return 7 - player.hp;
					return -get.attitude(player, target);
				});
			("step 1");
			if (result.bool) {
				var target = result.targets[0];
				player.logSkill("shbingyin", target);
				player.addTempSkill("shbingyin_add");
				target.link(true);
				if (target == player) trigger.cancel();
			}
		},
		ai: {
			expose: 0.1,
		},
		subSkill: {
			add: {
				sub: true,
			},
		},
	},
	shjinbing: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "phaseUseBegin",
		},
		filter: function (event, player) {
			return event.player.hasSkill("shjinbing_can");
		},
		direct: true,
		content: function () {
			"step 0";
			player
				.chooseTarget(get.prompt("shjinbing"), "是否视为对一名装备区牌数最多的角色使用一张【水淹七军】？", (card, player, target) => {
					return target.isMaxEquip() && player.canUse({ name: "shuiyanqijunx", isCard: true }, target);
				})
				.set("ai", target => {
					var player = _status.event.player;
					return get.effect(target, { name: "shuiyanqijunx" }, player, player);
				});
			("step 1");
			if (result.bool) {
				var target = result.targets[0];
				event.target = target;
				var card = { name: "shuiyanqijunx", isCard: true };
				player.useCard(card, target).set("oncard", function (card) {
					card.storage.shjinbing = true;
				});
				player.logSkill("shjinbing", target);
			}
		},
		group: ["shjinbing_can", "shjinbing_damage"],
		subSkill: {
			can: {
				mark: true,
				intro: {
					content: "浸兵目标",
				},
				sub: true,
			},
			damage: {
				trigger: {
					source: "damageSource",
				},
				forced: true,
				popup: false,
				filter: function (event, player) {
					if (!event.card || !event.card.storage || !event.card.storage.shjinbing) return false;
					return event.card.name == "shuiyanqijunx" && event.player != player && event.player.isIn();
				},
				content: function () {
					trigger.player.addTempSkill("shjinbing_can", {
						player: "phaseUseEnd",
					});
				},
				sub: true,
			},
		},
	},
	shjierao: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		shaRelated: true,
		trigger: {
			player: "useCardToPlayered",
		},
		filter: function (event, player) {
			return event.card.name == "sha" && event.target.countCards("he") > 0;
		},
		check: function (event, player) {
			return get.attitude(player, event.target) < 0;
		},
		logTarget: "target",
		content: function () {
			"step 0";
			var target = trigger.target;
			event.target = target;
			player.gainPlayerCard(target, "he", true, [1, 2]);
			("step 1");
			if (result.bool && target.isIn()) {
				var num = result.cards.length,
					hs = player.getCards("he");
				var bool1 = false,
					bool2 = false;
				var numx = num;
				var cards = result.cards.slice(0);
				for (var card of cards) {
					if (get.name(card) == "sha") bool1 = true;
					else if (get.name(card) == "shan") bool2 = true;
				}
				player.showCards(result.cards);
				if (bool1 == true) numx--;
				if (bool2 == true) numx++;
				if (!hs.length || numx < 1) event.finish();
				else {
					var prompt = get.cnNumber(numx) + "张牌";
					if (numx > 0) player.chooseCard("he", true, numx, "交给" + get.translation(target) + prompt);
				}
			} else event.finish();
			("step 2");
			if (result.bool) {
				player.give(result.cards, target);
			}
		},
	},
	shhongchong: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		zhuanhuanji: "number",
		mark: true,
		zhuanhuanLimit: 3,
		marktext: "Ⅲ",
		intro: {
			markcount: () => 0,
			content: function (storage, player) {
				var list = ["shfenghuo", "shjinlun", "shzimu"];
				var num = (storage || 0) % 3;
				return "转换技,锁定技。准备阶段，若你没有装备" + get.translation(list[num]) + "，你将之置入装备区。";
			},
		},
		filter: function (event, player) {
			var storage = player.countMark("shhongchong");
			var list = ["shfenghuo", "shjinlun", "shzimu"];
			var num = (storage || 0) % 3;
			return !player.getEquip(list[num]);
		},
		forced: true,
		content: function () {
			var storage = player.countMark("shhongchong");
			var list = ["shfenghuo", "shjinlun", "shzimu"];
			var list2 = ["diamond", "heart", "club"];
			var num = (storage || 0) % 3;
			var card = game.createCard(list[num], list2[num], 2 * num + 1);
			player.$gain2(card);
			game.delayx();
			player.equip(card);
			player.changeZhuanhuanji("shhongchong");
		},
	},
	shfenghuo_skill: {
		equipSkill: true,
		trigger: {
			player: "phaseUseBegin",
		},
		direct: true,
		filter: function (event, player) {
			return player.countCards("h") > 1;
		},
		content: function () {
			"step 0";
			var next = player.chooseCardTarget({
				prompt: get.prompt2("shfenghuo_skill"),
				position: "h",
				filterCard: function (card) {
					if (!ui.selected.cards.length) return true;
					var type = get.type2(card);
					for (var i of ui.selected.cards) {
						if (get.type2(i, player) == type) return false;
					}
					return true;
				},
				selectCard: [2, 3],
				ai1: function (card) {
					return 12 - get.value(card);
				},
				ai2: function (target) {
					var player = _status.event.player;
					return get.damageEffect(target, player, target, "fire");
				},
				filterTarget: function (card, player, target) {
					return player != target && player.inRange(target);
				},
			});
			next.set("complexCard", true);
			("step 1");
			if (result.bool) {
				var num = result.cards.length - 1;
				player.discard(result.cards);
				var target = result.targets[0];
				player.logSkill("shfenghuo_skill", target);
				target.damage(num, "fire", "nocard");
			}
		},
		_priority: -25,
	},

	shjinlun_skill: {
		equipSkill: true,
		enable: "phaseUse",
		viewAs: {
			name: "sha",
			nature: "fire",
		},
		position: "hs",
		filterCard: function (card, player, event) {
			return get.color(card) == "red" && get.type(card) == "basic";
		},
		check: function (card) {
			return 8 - get.value(card);
		},
		discard: false,
		lose: false,
		filter: function (event, player) {
			if (player.countCards("h", card => get.color(card) == "red" && get.type(card) == "basic")) {
				return true;
			}
			return false;
		},
		content: function () {
			player.useCard({ name: "tao" }, cards, targets[0]).animate = false;
		},
		ai: {
			order: 9.5,
		},
		group: "shjinlun_skill_choose",
		subSkill: {
			choose: {
				trigger: {
					player: "useCard",
				},
				forced: true,
				popup: false,
				filter: function (event) {
					var evt = event;
					return evt.card.name == "sha" && evt.skill == "shjinlun_skill" && evt.cards;
				},
				content: function () {
					"step 0";
					player
						.chooseControl(["选项一", "选项二"])
						.set("choiceList", ["摸一张牌", "令此【杀】不计入使用次数"])
						.set("ai", function () {
							var player = _status.event.player;
							if (player.countCards("h", card => get.color(card) == "red" && get.type(card) == "basic") > 0) return 1;
							return 0;
						});
					("step 1");
					if (result.control == "选项一") player.draw();
					else if (result.control == "选项二") {
						if (trigger.addCount !== false) {
							trigger.addCount = false;
							player.getStat().card.sha--;
						}
					}
				},
				sub: true,
			},
		},
		_priority: -25,
	},
	shzimu_skill: {
		equipSkill: true,
		mod: {
			selectTarget: function (card, player, range) {
				if (card.name == "sha" && range[1] != -1) {
					range[1]++;
				}
			},
		},
		ai: {
			threaten: 1.4,
		},
		_priority: -25,
	},
	shdiangangqiang_skill: {
		inherit: "qinggang_skill",
		audio: true,
		equipSkill: true,
		trigger: {
			player: "useCardToPlayered",
		},
		filter: function (event) {
			return event.card.name == "sha";
		},
		forced: true,
		logTarget: "target",
		content: function () {
			trigger.target.addTempSkill("qinggang2");
			trigger.target.storage.qinggang2.add(trigger.card);
			trigger.target.markSkill("qinggang2");
			trigger.directHit.add(trigger.target);
		},
		ai: {
			unequip_ai: true,
			skillTagFilter: function (player, tag, arg) {
				if (arg && arg.name == "sha") return true;
				return false;
			},
		},
		_priority: -25,
	},
	shpodao_skill: {
		equipSkill: true,
		trigger: {
			player: "useCard",
		},
		forced: true,
		filter: function (event, player) {
			if (event.card.name != "sha") return false;
			var evt = event.getParent("phaseUse");
			if (!evt || evt.player != player) return false;
			var index = player
				.getHistory("useCard", function (evtx) {
					return evtx.card.name == "sha" && evtx.getParent("phaseUse") == evt;
				})
				.indexOf(event);
			return index == 1;
		},
		content: function () {
			var evt = trigger.getParent("phaseUse");
			var index = player
				.getHistory("useCard", function (evtx) {
					return evtx.card.name == "sha" && evtx.getParent("phaseUse") == evt;
				})
				.indexOf(trigger);
			if (index == 1) {
				game.log(trigger.card, "伤害+1");
				if (typeof trigger.baseDamage != "number") trigger.baseDamage = 1;
				trigger.baseDamage++;
			}
		},
		mod: {
			cardUsable: function (card, player, num) {
				if (card.name == "sha") return num + 1;
			},
		},
		_priority: -25,
	},
	shgoulianqiang_skill: {
		mod: {
			aiOrder(player, card, num) {
				if (get.color(card) === "red" && get.name(card) === "sha") return get.order({ name: "sha" }) + 0.15;
			},
		},
		equipSkill: true,
		shaRelated: true,
		locked: false,
		trigger: {
			player: "useCardToPlayered",
		},
		logTarget: "target",
		filter: function (event, player) {
			if (event.card.name != "sha") return false;
			if (!event.target.isLinked()) return get.color(event.card) == "black";
			return get.color(event.card) == "red";
		},
		async content(event, trigger, player) {
			const target = trigger.target;
			if (get.color(trigger.card) == "black" && !target.isLinked()) {
				await target.link(true);
				await player.discardPlayerCard(target, "弃置" + get.translation(target) + "一张牌").set("ai", function (button) {
					let val = get.buttonValue(button);
					if (get.attitude(_status.event.player, get.owner(button.link)) > 0) return 0;
					if (player.hasSkill("shluanji") && get.position(button.link) == "e" && target.countCards("e") == 1) return 0.1;
					return val;
				});
			} else {
				await target.link();
				await target.damage();
			}
		},
		ai: {
			unequip_ai: true,
			skillTagFilter(player, tag, arg) {
				if ((arg && arg.name == "sha" && arg.target.getEquip(2) && arg.target.isLinked() && get.color(arg.card) == "red") || (!arg.target.isLinked() && get.color(arg.card) == "black")) return true;
				return false;
			},
		},
		_priority: -25,
	},
	shsaitangni_skill: {
		equipSkill: true,
		trigger: {
			player: "phaseBegin",
		},
		forced: true,
		/*filter:function (event, player) {
                      return player.hujia<5;
                    },*/
		content: function () {
			"step 0";
			player.judge(function (card) {
				var suit = get.suit(card);
				if (suit == "heart") return 1;
				return 0;
			});
			("step 1");
			if (result.suit == "heart" && player.hujia < 5) {
				player.changeHujia(1, null, true);
			}
		},
		mod: {
			canBeDiscarded: function (card) {
				if (get.position(card) == "e") return false;
			},
		},
		_priority: -25,
	},
	danshutiequan_skill: {
		equipSkill: true,
		trigger: {
			player: "phaseDrawBegin1",
		},
		filter(event, player) {
			return !event.numFixed;
		},
		forced: true,
		async content(event, trigger, player) {
			if (player.countCards("h") < player.getHandcardLimit()) {
				trigger.num += 2;
				return;
			}
			const result = await player
				.chooseTarget(
					"是否选择至多三名装备区有牌的其他角色与你一起使用【树上开花】？取消则仅你使用。",
					[1, 3],
					(card, player, target) => {
						return target.countCards("e") > 0 && player != target;
					},
					target => {
						const player = _status.event.player;
						const card = { name: "kaihua", isCard: true };
						return get.effect(target, card, player, player);
					}
				)
				.forResult();
			await player.chooseUseTarget("kaihua", true);
			if (result.bool) {
				const targets = result.targets.sortBySeat();
				for (const target of targets) await target.chooseUseTarget("kaihua", true);
			}
			trigger.changeToZero();
			await game.delay();
		},
		mod: {
			maxHandcardBase: function (player, num) {
				var zhu = game.filterPlayer2(current => current.getSeatNum() == 1)[0];
				if (zhu) return zhu.maxHp;
			},
		},

		_priority: -25,
	},
	danshutiequan_skill2: {
		equipSkill: true,
		trigger: {
			player: "damageBegin4",
		},
		filter: function (event, player) {
			if (event.num < player.hp) return false;
			let cards = player.getEquips("danshutiequan");
			if (!cards.length) return false;
			if (player.hasSkillTag("unequip5")) return false;
			if (
				event.source &&
				event.source.hasSkillTag("unequip", false, {
					name: event.card ? event.card.name : null,
					target: player,
					card: event.card,
				})
			)
				return false;
			return true;
		},
		content: function () {
			trigger.cancel();
			var e2 = player.getEquips("danshutiequan");
			if (e2.length) {
				player.discard(e2);
			}
			player.removeSkill("danshutiequan_skill2");
		},
		_priority: -25,
	},
	shxuantianhunyuanjian_skill: {
		locked: false,
		equipSkill: true,
		zhuanhuanji: true,
		mark: true,
		marktext: "☯",
		intro: {
			content(storage) {
				return "转换技。" + (storage === true ? "你的锦囊牌可以当雷【杀】使用。" : "你的【杀】可以当【过河拆桥】使用。");
			},
		},
		enable: "chooseToUse",
		viewAs(cards, player) {
			var storage = player.storage.shxuantianhunyuanjian_skill;
			var name = storage === true ? "sha" : "guohe";
			var nature = storage === true ? "thunder" : null;
			return {
				name: name,
				nature: nature,
				storage: {
					shxuantianhunyuanjian_skill: true,
				},
			};
		},
		hiddenCard: function (player, name) {
			var storage = player.storage.shxuantianhunyuanjian_skill;
			var name2 = storage === true ? "sha" : "guohe";
			if (name == name2) return true;
			return false;
		},
		filter: function (event, player) {
			var storage = player.storage.shxuantianhunyuanjian_skill;
			var name = storage === true ? "sha" : "guohe";
			if (!player.countCards("hs") || event.type == "wuxie") return false;
			return event.filterCard({ name: name, isCard: true }, player, event);
		},
		viewAsFilter: function (player) {
			return player.countCards("hs") > 0;
		},
		filterCard: function (card, player, event) {
			event = event || _status.event;
			var filter = event._backup.filterCard;
			var storage = player.storage.shxuantianhunyuanjian_skill;
			var name = storage === true ? "sha" : "guohe";
			if (!filter({ name: name, cards: [card] }, player, event)) return false;
			if (name == "sha") return get.type(card, "trick") == "trick";
			return get.name(card) == "sha";
		},
		position: "hs",
		check: function (card) {
			return 7 - get.value(card);
		},
		prompt() {
			var player = _status.event.player;
			var storage = player.storage.shxuantianhunyuanjian_skill;
			var name = storage === true ? "sha" : "guohe";
			if (name == "sha") return "将一张锦囊牌当雷【杀】使用";
			return "将一张【杀】当【过河拆桥】使用";
		},
		async precontent(event, trigger, player) {
			var skill = "shxuantianhunyuanjian_skill";
			player.changeZhuanhuanji(skill);
			player
				.when("useCard")
				.filter(evt => evt.skill == "shxuantianhunyuanjian_skill")
				.then(() => {
					var targets = game.filterPlayer(current => {
						return current.name == "sh_baodaoyi";
					});
					if (targets && targets.length) for (var c of targets) c.draw();
				});
		},
		ai: {
			order: function () {
				var storage = _status.event.player.storage.shxuantianhunyuanjian_skill;
				var name = storage === true ? "sha" : "guohe";
				return get.order({ name: name }) + 0.2;
			},
			result: {
				player: 1,
			},
		},
		_priority: -25,
	},
	shjinjiashenren_skill: {
		init: function (player) {
			if (game.online) return;
			player.removeAdditionalSkill("shjinjiashenren_skill");
			if (player.storage.shjinjiashenren) {
				player.addAdditionalSkill("shjinjiashenren_skill", [player.storage.shjinjiashenren[1] + "_skill"]);
			}
		},

		forced: true,
		mod: {
			attackRangeBase(player) {
				var num = 1;
				var card = game.createCard(player.storage.shjinjiashenren[1]);
				var info = get.info(card, false);
				if (info && info.distance && typeof info.distance.attackFrom == "number") num -= info.distance.attackFrom;
				if (typeof num != "number") return;
				return Math.max(player.getEquipRange(player.getCards("e")), num);
			},
		},
	},

	shchiyan: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			global: "phaseBefore",
			player: "enterGame",
		},
		forced: true,
		filter: function (event, player) {
			return (event.name != "phase" || game.phaseNumber == 0) && player.hasEnabledSlot(4);
		},
		content: function () {
			player.disableEquip(4);
			player.expandEquip(1);
		},
	},
	shfuxing: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		unique: true,
		enable: "chooseToUse",
		limited: true,
		zhuanhuanji: "number",
		mark: true,
		marktext: "☯",
		intro: {
			markcount: () => 0,
			content(storage) {
				return "转换技，限定技。你可以视为使用一张" + ((storage || 0) % 2 ? "【酒】。" : "【杀】。");
			},
		},
		hiddenCard: function (player, name) {
			var storage = player.storage.shfuxing;
			var name2 = (storage || 0) % 2 ? "jiu" : "sha";
			if (name == name2) return true;
			return false;
		},
		filter: function (event, player) {
			if (event.type == "wuxie") return false;
			var storage = player.storage.shfuxing;
			var name = (storage || 0) % 2 ? "jiu" : "sha";
			if (event.filterCard({ name: name, isCard: true }, player, event)) return true;
			return false;
		},
		viewAs(cards, player) {
			var storage = player.storage.shfuxing;
			var name = (storage || 0) % 2 ? "jiu" : "sha";
			return {
				name: name,
				isCard: true,
			};
		},
		filterCard: () => false,
		selectCard: -1,
		prompt() {
			var storage = _status.event.player.storage.shfuxing;
			if ((storage || 0) % 2) return "视为使用一张【酒】";
			return "视为使用一张【杀】";
		},
		skillAnimation: true,
		animationColor: "wood",
		precontent() {
			"step 0";
			var skill = "shfuxing";
			player.logSkill(skill);
			player.changeZhuanhuanji(skill);
			player.restoreSkill("shqiuxian");
			game.log(player, "重置了", "#g【求闲】");
			player.awakenSkill(skill, true);
			delete event.result.skill;
		},
		ai: {
			combo: "shqiuxian",
			order: 10,
			result: {
				player: 1,
			},
		},
		init: (player, skill) => (player.storage[skill] = false),
	},
	shshenbing: {
		trigger: {
			player: ["phaseBefore", "changeHp"],
		},
		forced: true,
		popup: false,
		init: function (player) {
			if (game.online) return;
			var list = lib.skill.shshenbing.getEquip1Skill(player.hp);
			if (list.length) {
				player.addAdditionalSkill("shshenbing", list);
				player.addEquipTrigger();
			}
		},
		content: function () {
			var list = lib.skill.shshenbing.getEquip1Skill(player.hp);
			if (list.length) {
				player.addAdditionalSkill("shshenbing", list);
				player.addEquipTrigger();
			}
		},
		ai: {
			effect: {
				target: function (card, player, target) {
					if (get.tag(card, "damage")) {
						if (!target.hasFriend()) return;
						if (target.hp >= 4) return [0, 1];
					}
					if (get.tag(card, "recover") && player.hp >= player.maxHp - 1) return [0, 0];
				},
			},
		},
		getEquip1Skill: function (i) {
			var list = [];
			for (var name of lib.inpile) {
				if (get.subtype(name) != "equip1") continue;
				var num = 1;
				const card = game.createCard(name);
				const info = get.info(card, false);
				if (info && info.distance && typeof info.distance.attackFrom == "number") num -= info.distance.attackFrom;
				if (i == num) list.addArray(get.skillsFromEquips([card]));
			}
			list.addArray(get.info({ name: "sanjian" }, false).skills);
			return list;
		},
	},
	shtianmu: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		forced: true,
		trigger: {
			player: "useCard",
		},
		filter: function (event, player) {
			return event.card && event.card.name == "sha";
		},
		content: function () {
			if (player.hp > player.getAttackRange()) player.draw();
			else if (player.hp == player.getAttackRange()) trigger.effectCount++;
			else {
				trigger.directHit.addArray(game.filterPlayer());
			}
		},
		ai: {
			directHit_ai: true,
			skillTagFilter: function (player, tag, arg) {
				if (arg && arg.card && arg.card.name == "sha" && player.hp < player.getAttackRange()) return true;
				return false;
			},
		},
	},
	shlianzheng: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		mark: true,
		locked: false,
		zhuanhuanji: true,
		marktext: "☯",
		intro: {
			content: function (storage, player, skill) {
				var str = player.storage.shlianzheng ? "出牌阶段限一次，你可以将X张手牌当【决斗】使用，然后于你因之造成伤害后摸两张牌（X为你本回合造成过的伤害值+1）。" : "出牌阶段限一次，你可以视为使用一张【决斗】，然后于之结算完成后失去1点体力。";
				return str;
			},
		},
		enable: "phaseUse",
		usable: 1,
		filterCard: function (card, player) {
			if (player.storage.shlianzheng == true) return true;
			return false;
		},
		selectCard: function () {
			var player = _status.event.player;
			var num = player.getStat().damage || 0;
			if (player.storage.shlianzheng == true) return num + 1;
			return -1;
		},
		filter: function (event, player) {
			var num = player.getStat().damage || 0;
			if (player.storage.shlianzheng == true) return player.countCards("h") >= num + 1;
			return true;
		},
		prompt: function () {
			var player = _status.event.player;
			var num = player.getStat().damage || 0;
			if (player.storage.shlianzheng == true) return "将" + get.cnNumber(num + 1) + "张牌当【决斗】使用";
			return "视为使用一张【决斗】";
		},
		check(card) {
			const val = get.value(card);
			return 20 - val;
		},
		precontent: function () {
			player.changeZhuanhuanji("shlianzheng");
			var card = event.result.card;
			if (player.storage.shlianzheng == true) {
				card.storage.shlianzheng_lose = true;
				player.addTempSkill("shlianzheng_lose");
			} else {
				card.storage.shlianzheng_draw = true;
				player.addTempSkill("shlianzheng_draw");
			}
		},
		viewAs: {
			name: "juedou",
		},
		group: ["shlianzheng_1"],
		subSkill: {
			1: {
				trigger: {
					player: "juedouAfter",
					target: "juedouAfter",
				},
				forced: true,
				charlotte: true,
				popup: false,
				filter(event, player) {
					if (event.turn === player || event.turn == undefined) return false;
					const opposite = event.player === player ? event.target : event.player;
					return opposite && opposite.isIn() && opposite.hp > player.hp;
				},
				content() {
					delete player.getStat().skill.shlianzheng;
					game.log(player, "重置了", "#g【连征】");
				},
				sub: true,
			},
			lose: {
				trigger: {
					player: "useCardAfter",
				},
				forced: true,
				charlotte: true,
				popup: false,
				filter: function (event, player) {
					if (event.card.storage.shlianzheng_draw == true) return false;
					return event.card.storage && event.card.storage.shlianzheng_lose && event.card.storage.shlianzheng_lose == true;
				},
				content: function () {
					player.loseHp();
				},
				sub: true,
			},
			draw: {
				trigger: {
					source: "damageSource",
				},
				forced: true,
				charlotte: true,
				popup: false,
				filter: function (event, player) {
					if (event.card.storage.shlianzheng_lose == true) return false;
					return event.card.storage && event.card.storage.shlianzheng_draw && event.card.storage.shlianzheng_draw == true && event.player != player;
				},
				content: function () {
					player.draw(2);
				},
				sub: true,
			},
		},
		ai: {
			wuxie: function (target, card, player, viewer, status) {
				if (player === game.me && get.attitude(viewer, player._trueMe || player) > 0) return 0;
				if (status * get.attitude(viewer, target) * get.effect(target, card, player, target) >= 0) return 0;
			},
			basic: {
				order: 5,
				useful: 1,
				value: 5.5,
			},
			result: {
				target: -1.5,
				player: function (player, target, card) {
					if (
						player.hasSkillTag(
							"directHit_ai",
							true,
							{
								target: target,
								card: card,
							},
							true
						)
					) {
						return 0;
					}
					if (get.damageEffect(target, player, target) > 0 && get.attitude(player, target) > 0 && get.attitude(target, player) > 0) {
						return 0;
					}
					var hs1 = target.getCards("h", "sha");
					var hs2 = player.getCards("h", "sha");
					if (hs1.length > hs2.length + 1) {
						return -2;
					}
					var hsx = target.getCards("h");
					if (hsx.length > 2 && hs2.length == 0 && hsx[0].number < 6) {
						return -2;
					}
					if (hsx.length > 3 && hs2.length == 0) {
						return -2;
					}
					if (hs1.length > hs2.length && (!hs2.length || hs1[0].number > hs2[0].number)) {
						return -2;
					}
					return -0.5;
				},
			},
			tag: {
				respond: 2,
				respondSha: 2,
				damage: 1,
			},
		},
	},
	shguixing: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filterTarget(card, player, target) {
			if (target.hp >= player.hp || target == player) return false;
			return true;
		},
		async content(event, trigger, player) {
			event.target.damage(2);
			event.target.addTempSkill("shguixing_tao");
		},
		ai: {
			order: 9,
			result: {
				target(player, target) {
					return get.damageEffect(target, player);
				},
			},
			threaten: 2,
		},
		subSkill: {
			tao: {
				hiddenCard: function (player, name) {
					if (name == "tao") return player.countCards("he", { color: "red" }) > 0 && _status.currentPhase != player;
					return false;
				},
				enable: "chooseToUse",
				filter: function (event, player) {
					if (!player.countCards("he", { color: "red" }) || _status.currentPhase == player) return false;
					return event.filterCard({ name: "tao", isCard: true }, player, event);
				},
				check: function (card) {
					var val = get.value(card);
					if (get.type(card) == "basic") val = 0.1;
					return 1 / Math.max(0.1, val);
				},
				filterCard: function (card) {
					return get.color(card) == "red";
				},
				viewAs: {
					name: "tao",
					suit: "none",
					number: null,
					isCard: true,
				},
				position: "he",
				popname: true,
				ignoreMod: true, //忽略mod技
				precontent: function () {
					var card = event.result.cards[0];
					var target = _status.currentPhase;
					player.give(card, target);
					if (get.type(card, target) == "basic") player.recover();
					event.result.card = { name: event.result.card.name };
					event.result.cards = [];
				},
				prompt: function (links, player) {
					return "将一张红色牌交给" + get.translation(_status.currentPhase) + "并视为使用一张【桃】";
				},
				sub: true,
				ai: {
					basic: {
						order: (card, player) => {
							if (player.hasSkillTag("pretao")) return 9;
							return 2;
						},
						useful: (card, i) => {
							let player = _status.event.player;
							if (!game.checkMod(card, player, "unchanged", "cardEnabled2", player)) return 2 / (1 + i);
							let fs = game.filterPlayer(current => {
									return get.attitude(player, current) > 0 && current.hp <= 2;
								}),
								damaged = 0,
								needs = 0;
							fs.forEach(f => {
								if (f.hp > 3 || !lib.filter.cardSavable(card, player, f)) return;
								if (f.hp > 1) damaged++;
								else needs++;
							});
							if (needs && damaged) return 5 * needs + 3 * damaged;
							if (needs + damaged > 1 || player.hasSkillTag("maixie")) return 8;
							if (player.hp / player.maxHp < 0.7) return 7 + Math.abs(player.hp / player.maxHp - 0.5);
							if (needs) return 7;
							if (damaged) return Math.max(3, 7.8 - i);
							return Math.max(1, 7.2 - i);
						},
						value: (card, player) => {
							let fs = game.filterPlayer(current => {
									return get.attitude(_status.event.player, current) > 0;
								}),
								damaged = 0,
								needs = 0;
							fs.forEach(f => {
								if (!player.canUse("tao", f)) return;
								if (f.hp <= 1) needs++;
								else if (f.hp == 2) damaged++;
							});
							if ((needs && damaged) || player.hasSkillTag("maixie")) return Math.max(9, 5 * needs + 3 * damaged);
							if (needs || damaged > 1) return 8;
							if (damaged) return 7.5;
							return Math.max(5, 9.2 - player.hp);
						},
					},
					result: {
						target: (player, target) => {
							if (target.hasSkillTag("maixie")) return 3;
							return 2;
						},
						target_use: (player, target, card) => {
							if (
								player === _status.currentPhase &&
								player.hasSkillTag(
									"nokeep",
									true,
									{
										card: card,
										target: target,
									},
									true
								)
							)
								return 2;
							let mode = get.mode(),
								taos = player.getCards("hs", i => get.name(i) === "tao" && lib.filter.cardEnabled(i, target, "forceEnable"));
							if (target.hp > 0) {
								if (!player.isPhaseUsing()) return 0;
								let min = 7.2 - (4 * player.hp) / player.maxHp,
									nd = player.needsToDiscard(0, (i, player) => {
										return !player.canIgnoreHandcard(i) && (taos.includes(i) || get.value(i) >= min);
									}),
									keep = nd ? 0 : 2;
								if (nd > 2 || (taos.length > 1 && (nd > 1 || (nd && player.hp < 1 + taos.length))) || (target.identity === "zhu" && (nd || target.hp < 3) && (mode === "identity" || mode === "versus" || mode === "chess")) || !player.hasFriend()) return 2;
								if (
									game.hasPlayer(current => {
										return player !== current && current.identity === "zhu" && current.hp < 3 && (mode === "identity" || mode === "versus" || mode === "chess") && get.attitude(player, current) > 0;
									})
								)
									keep = 3;
								else if (nd === 2 || player.hp < 2) return 2;
								if (nd === 2 && player.hp <= 1) return 2;
								if (keep === 3) return 0;
								if (taos.length <= player.hp / 2) keep = 1;
								if (
									keep &&
									game.countPlayer(current => {
										if (player !== current && current.hp < 3 && player.hp > current.hp && get.attitude(player, current) > 2) {
											keep += player.hp - current.hp;
											return true;
										}
										return false;
									})
								) {
									if (keep > 2) return 0;
								}
								return 2;
							}
							if (target.isZhu2() || target === game.boss) return 2;
							if (player !== target) {
								if (target.hp < 0 && taos.length + target.hp <= 0) return 0;
								if (Math.abs(get.attitude(player, target)) < 1) return 0;
							}
							if (!player.getFriends().length) return 2;
							let tri = _status.event.getTrigger(),
								num = game.countPlayer(current => {
									if (get.attitude(current, target) > 0) return current.countCards("hs", i => get.name(i) === "tao" && lib.filter.cardEnabled(i, target, "forceEnable"));
								}),
								dis = 1,
								t = _status.currentPhase || game.me;
							while (t !== target) {
								let att = get.attitude(player, t);
								if (att < -2) dis++;
								else if (att < 1) dis += 0.45;
								t = t.next;
							}
							if (mode === "identity") {
								if (tri && tri.name === "dying") {
									if (target.identity === "fan") {
										if ((!tri.source && player !== target) || (tri.source && tri.source !== target && player.getFriends().includes(tri.source.identity))) {
											if (num > dis || (player === target && player.countCards("hs", { type: "basic" }) > 1.6 * dis)) return 2;
											return 0;
										}
									} else if (tri.source && tri.source.isZhu && (target.identity === "zhong" || target.identity === "mingzhong") && (tri.source.countCards("he") > 2 || (player === tri.source && player.hasCard(i => i.name !== "tao", "he")))) return 2;
									//if(player!==target&&!target.isZhu&&target.countCards('hs')<dis) return 0;
								}
								if (player.identity === "zhu") {
									if (
										player.hp <= 1 &&
										player !== target &&
										taos + player.countCards("hs", "jiu") <=
											Math.min(
												dis,
												game.countPlayer(current => {
													return current.identity === "fan";
												})
											)
									)
										return 0;
								}
							} else if (mode === "stone" && target.isMin() && player !== target && tri && tri.name === "dying" && player.side === target.side && tri.source !== target.getEnemy()) return 0;
							return 2;
						},
					},
					tag: {
						recover: 1,
						save: 1,
					},
				},
			},
		},
	},
	shwanzui: {
		trigger: {
			global: "dying",
		},
		filter: function (event, player) {
			return event.player.hp <= 0 && !player.hasSkill("shwanzui_round");
		},
		direct: true,
		content: function () {
			"step 0";
			if (trigger.player.isHealthy()) event._result = { index: 0 };
			else
				player
					.chooseControl(["选项一", "选项二", "cancel2"])
					.set("choiceList", ["令" + get.translation(trigger.player) + "摸两张牌", "令" + get.translation(trigger.player) + "回复1点体力"])
					.set("prompt", get.prompt2("shwanzui", trigger.player))
					.set("ai", function () {
						var evt = _status.event.getTrigger();
						if (get.attitude(evt.player, player) < -1) return "cancel2";
						if (get.attitude(evt.player, player) > 3) return 1;
						return 0;
					});
			("step 1");
			if (result.index == 1) {
				trigger.player.recover();
				player.addTempSkill("shwanzui_round", "roundStart");
				player.logSkill("shwanzui", trigger.player);
				player.addTempSkill("shwanzui_used");
				player.setStorage("shwanzui_used", "wugu");
			} else if (result.index == 0) {
				trigger.player.draw(2);
				player.addTempSkill("shwanzui_round", "roundStart");
				player.logSkill("shwanzui", trigger.player);
				player.addTempSkill("shwanzui_used");
				player.setStorage("shwanzui_used", "taoyuan");
			}
		},
		logTarget: "player",
		subSkill: {
			round: {
				charlotte: true,
				sub: true,
			},
			used: {
				trigger: {
					global: "phaseEnd",
				},
				charlotte: true,
				direct: true,
				content: function () {
					player.chooseUseTarget(player.getStorage("shwanzui_used"), true);
				},
				sub: true,
			},
		},
	},
	shqiuxian: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		unique: true,
		enable: "chooseToUse",
		limited: true,
		zhuanhuanji: "number",
		mark: true,
		marktext: "☯",
		intro: {
			markcount: () => 0,
			content(storage) {
				return "转换技，限定技。你可以视为使用一张" + ((storage || 0) % 2 ? "【桃】。" : "【闪】。");
			},
		},
		hiddenCard: function (player, name) {
			var storage = player.storage.shqiuxian;
			var name2 = (storage || 0) % 2 ? "tao" : "shan";
			if (name == name2) return true;
			return false;
		},
		filter: function (event, player) {
			if (event.type == "wuxie") return false;
			var storage = player.storage.shqiuxian;
			var name = (storage || 0) % 2 ? "tao" : "shan";
			if (event.filterCard({ name: name, isCard: true }, player, event)) return true;
			return false;
		},
		viewAs(cards, player) {
			var storage = player.storage.shqiuxian;
			var name = (storage || 0) % 2 ? "tao" : "shan";
			return {
				name: name,
				isCard: true,
			};
		},
		filterCard: () => false,
		selectCard: -1,
		prompt() {
			var storage = _status.event.player.storage.shqiuxian;
			if ((storage || 0) % 2) return "视为使用一张【桃】";
			return "视为使用一张【闪】";
		},
		skillAnimation: true,
		animationColor: "wood",
		precontent() {
			"step 0";
			var skill = "shqiuxian";
			player.logSkill(skill);
			player.changeZhuanhuanji(skill);
			player.restoreSkill("shfuxing");
			game.log(player, "重置了", "#g【福星】");
			player.awakenSkill(skill, true);
			delete event.result.skill;
		},
		ai: {
			combo: "shfuxing",
			respondShan: true,
			skillTagFilter(player) {
				var storage = player.storage.shqiuxian;
				return !(storage || 0) % 2;
			},
			order: 10,
			result: {
				player: 1,
			},
		},
		init: (player, skill) => (player.storage[skill] = false),
	},
	shhuixiong: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		unique: true,
		limited: true,
		enable: "phaseUse",
		animationColor: "gray",
		skillAnimation: "epic",
		filterTarget: function (card, player, target) {
			return target.countCards("h") >= player.countCards("h");
		},
		prompt: "令一名手牌数不少于你的角色弃置至多两张牌",
		mark: true,
		async content(event, trigger, player) {
			await player.awakenSkill("shhuixiong");
			await player.addSkill("shhuixiong_reset");
			const target1 = event.target;
			await target1.chooseToDiscard([1, 2], "he", "弃置至多两张牌", true);
			const resultx = await player
				.chooseTarget("令一名手牌数多于你的角色交给你至少两张牌", (card, player, target) => {
					return target.countCards("h") > player.countCards("h");
				})
				.set("ai", target => {
					return -get.attitude(get.player(), target);
				})
				.forResult();
			if (resultx?.bool && resultx.targets?.length) {
				const target2 = resultx.targets[0];
				const cards = (
					await target2
						.chooseCard("he", [2, Infinity], true)
						.set("ai", get.unuseful)
						.set("prompt", "交给" + get.translation(player) + "至少" + get.cnNumber(2) + "张牌")
						.forResult()
				).cards;
				await target2.give(cards, player);
				if (target1.countCards("h") <= player.countCards("h") && target2.countCards("h") <= player.countCards("h")) {
					const result = await player
						.chooseTarget(
							"对其中一名目标角色造成1点伤害",
							function (card, player, target) {
								return _status.event.targets.includes(target);
							},
							true
						)
						.set("targets", [target1, target2])
						.set("ai", function (target) {
							var player = _status.event.player;
							return get.damageEffect(target, player, player);
						})
						.forResult();
					if (result?.bool && result.targets?.length) {
						const target = result.targets[0];
						player.line(target, "thunder");
						await target.damage("nocard");
					}
				}
			}
		},
		intro: {
			content: "limited",
		},
		ai: {
			order: 1,
			result: {
				target: (player, target) => {
					if (get.attitude(player, target) > -1) return 0;
					if (target.countCards("h") + 2 <= player.countCards("h")) return 0;
					return -(5 / target.hp);
				},
			},
		},
		init: (player, skill) => (player.storage[skill] = false),
		subSkill: {
			reset: {
				trigger: {
					source: "dieAfter",
				},
				forced: true,
				charlotte: true,
				popup: false,
				content: function () {
					player.restoreSkill("shhuixiong");
					game.log(player, "重置了", "#g【彗凶】");
					player.draw(3);
					player.removeSkill("shhuixiong_reset");
				},
				mark: true,
				intro: {
					content: "可重置",
				},
				sub: true,
			},
		},
	},
	shwunu: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			target: "useCardToTargeted",
		},
		filter: function (event, player) {
			return event.card.name == "sha";
		},
		logTarget: "player",
		async content(event, trigger, player) {
			const target = trigger.player;
			await target.damage();
			player
				.when({ global: "useCardAfter" })
				.filter(evt => evt == trigger.getParent())
				.then(() => {
					const card = trigger.card;
					if (
						!trigger.player.getHistory("sourceDamage", function (evt) {
							//game.log(card);
							return card == evt.card && evt.player == player;
						}).length
					) {
						game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shwunu_2.mp3");
						trigger.player.recover();
					}
				});
		},
		ai: {
			maixie_defend: true,
		},
	},
	shzhengchou: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		enable: "phaseUse",
		viewAs: {
			name: "jiedao",
		},
		viewAsFilter: function (player) {
			if (!player.countCards("h", { name: "sha" })) return false;
		},
		filterCard: function (card, player, target) {
			return get.name(card) == "sha";
		},
		position: "h",
		check: function (card) {
			return 7 - get.value(card);
		},
		precontent() {
			player
				.when("useCardToTargeted")
				.filter(evt => evt.getParent().skill == "shzhengchou")
				.then(() => {
					//delete player.storage.olsbweilin_backup;
					const target = trigger.targets[0];
					target.addTempSkill("shzhengchou_respond");
				});
		},
		prompt: "将一张【杀】当【借刀杀人】使用",
		ai: {
			order: 10,
			result: {
				player: 1,
				target: (player, target, card) => {
					let targets = [].concat(ui.selected.targets);
					if (_status.event.preTarget) targets.add(_status.event.preTarget);
					if (targets.length) {
						let preTarget = targets.lastItem,
							pre = _status.event.getTempCache("jiedao_result", preTarget.playerid);
						if (pre && pre.card === card && pre.target.isIn()) return target === pre.target ? pre.eff : 0;
						return get.effect(target, { name: "sha" }, preTarget, player) / get.attitude(player, target);
					}
					let arms =
						(target.hasSkillTag("noe") ? 0.32 : -0.15) *
						target.getEquips(1).reduce((num, i) => {
							return num + get.value(i, target);
						}, 0);
					if (!target.mayHaveSha(player, "use")) return arms;
					let sha = game.filterPlayer(get.info({ name: "jiedao" }).filterAddedTarget),
						addTar = null;
					sha = sha.reduce((num, current) => {
						let eff = get.effect(current, { name: "sha" }, target, player);
						if (eff <= num) return num;
						addTar = current;
						return eff;
					}, -100);
					if (!addTar) return arms;
					sha /= get.attitude(player, target);
					_status.event.putTempCache("jiedao_result", target.playerid, {
						card: card,
						target: addTar,
						eff: sha,
					});
					return Math.max(arms, sha);
				},
			},
			wuxie: function (target, card, player, viewer) {
				if (player == game.me && get.attitude(viewer, player._trueMe || player) > 0) return 0;
			},
			basic: {
				order: 8,
				value: 2,
				useful: 1,
			},
			tag: {
				gain: 1,
				use: 1,
				useSha: 1,
				loseCard: 1,
			},
		},
		subSkill: {
			respond: {
				hiddenCard: function (player, name) {
					if (name == "sha") return true;
					return false;
				},
				enable: "chooseToUse",
				filter: function (event, player) {
					if (
						!event.filterCard ||
						!event.filterCard(
							{
								name: "sha",
								isCard: true,
							},
							player,
							event
						)
					)
						return false;
					var evt = event.getParent();
					return evt.name == "jiedao" && evt.skill == "shzhengchou";
				},
				viewAs: function (cards, player) {
					return {
						name: "sha",
						isCard: true,
						storage: {
							shzhengchou: true,
						},
					};
				},
				filterCard: () => false,
				selectCard: -1,
				precontent() {
					delete event.result.skill;
				},
				prompt: "视为使用一张【杀】响应之",
				ai: {
					order: 10,
					result: {
						player: 1,
					},
				},
				sub: true,
			},
		},
	},
	shjinchong: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "linkAfter",
		},
		forced: true,
		filter: function (event, player) {
			if (player.isLinked()) return !player.isTurnedOver();
			return player.isTurnedOver() && !_status.dying.length;
		},
		async content(event, trigger, player) {
			if (player.isLinked() && !player.isTurnedOver()) {
				await player.turnOver();
				await player.draw(3);
			} else {
				await player.turnOver();
				const result = await player
					.chooseTarget("对一名角色造成1点火焰伤害？")
					.set("ai", target => {
						return get.damageEffect(target, _status.event.player, _status.event.player, "fire");
					})
					.set("forced", true)
					.forResult();
				if (result.bool) {
					const target = result.targets[0];
					await target.damage("fire");
				}
			}
		},
	},
	shhenglue: {
		enable: "phaseUse",
		viewAs(cards, player) {
			var name = player.isLinked() ? "shunshou" : "tiesuo";
			return {
				name: name,
				storage: {
					shhenglue: true,
				},
			};
		},
		viewAsFilter: function (player) {
			return player.countCards("h", { color: "red" }) > 0;
		},
		filterCard: function (card, player, target) {
			return get.color(card) == "red";
		},
		selectTarget: function () {
			var player = _status.event.player;
			if (player.isLinked()) return 1;
			if (!ui.selected.targets || !ui.selected.targets.includes(player)) return ui.selected.targets.length + 2;
			return [1, 3];
		},
		filterTarget: function (card, player, target) {
			if (player.isLinked()) return target != player && target.hasCard(card => lib.filter.canBeGained(card, player, target), get.is.single() ? "e" : "ej");
			if (!ui.selected.targets || !ui.selected.targets.includes(player)) return target == player;
			return true;
		},
		position: "h",
		check: function (card) {
			return 7 - get.value(card);
		},
		prompt: function () {
			var player = _status.event.player;
			if (player.isLinked()) return "将一张红色手牌当无距离限制但仅可选择场上牌的【顺手牵羊】使用";
			return "将一张红色手牌当目标须包含你但可额外指定一名其他角色的【铁索连环】使用";
		},
		onuse: function (links, player) {
			if (player.isLinked()) game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shhenglue1.mp3");
			else game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shhenglue2.mp3");
		},
		shunshouContent: function () {
			let pos = get.is.single() ? "e" : "ej";
			if (target.countGainableCards(player, pos)) player.gainPlayerCard(pos, target, true).set("target", target).set("ai", lib.card.shunshou.ai.button);
		},
		ai: {
			order: function (item, player) {
				if (player.isLinked()) return get.order({ name: "shunshou" });
				return get.order({ name: "tiesuo" }) + 0.2;
			},
			result: {
				player: 1,
			},
			effect: {
				target: function (card, player, target) {
					if (card.name == "tiesuo" && target.hasSkill("shjinchong")) {
						if (get.attitude(target, player) < 0) return;
						if (!target.isLinked() && !target.isTurnedOver()) return [-0.5, 3 * get.effect(target, { name: "draw" }, player, player)];
						else if (target.isLinked() && target.isTurnedOver()) return [1, 3];
					}
					if (card.name == "shunshou") {
						const es = target.getGainableCards(player, "e");
						const js = target.getGainableCards(player, "j");
						if (get.attitude(player, target) <= 0) {
							return es.some(card => {
								return get.value(card, target) > 0 && card !== target.getEquip("jinhe");
							}) ||
								js.some(card => {
									var cardj = card.viewAs ? { name: card.viewAs } : card;
									if (cardj.name === "xumou_jsrg") {
										return true;
									}
									return get.effect(target, cardj, target, player) < 0;
								})
								? -1.5
								: 1.5;
						}
						return es.some(card => {
							return get.value(card, target) <= 0;
						}) ||
							js.some(card => {
								var cardj = card.viewAs ? { name: card.viewAs } : card;
								if (cardj.name === "xumou_jsrg") {
									return false;
								}
								return get.effect(target, cardj, target, player) < 0;
							})
							? 1.5
							: -1.5;
						return 0;
					}
				},
			},
		},
		group: "shhenglue_shunshou",
		subSkill: {
			shunshou: {
				trigger: {
					player: "shunshouBegin",
				},
				forced: true,
				locked: false,
				popup: false,
				filter: function (event, player) {
					return event.card.storage && event.card.storage.shhenglue;
				},
				content: function () {
					trigger.setContent(lib.skill.shhenglue.shunshouContent);
				},
				sub: true,
			},
		},
	},
	shpiaopeng: {
		global: "shpiaopeng_global",
		audio: "ext:水泊娘山/character/audio/skill:1",
		subSkill: {
			global: {
				audio: 2,
				enable: "phaseUse",
				filter: function (event, player) {
					return (
						player.countCards("he") &&
						game.hasPlayer(function (current) {
							return current.hasSkill("shpiaopeng") && current != player;
						})
					);
				},
				filterCard: true,
				position: "he",
				usable: 1,
				check(card) {
					return 4.5 - get.value(card);
				},
				filterTarget(card, player, target) {
					if (target == player) return false;
					return !target.hasSkill("shpiaopeng_round") && target.hasSkill("shpiaopeng");
				},
				prompt: "弃置一张牌并令一名有飘蓬的其他角色横置或重置武将牌",
				async content(event, trigger, player) {
					game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shpiaopeng1.mp3");
					const target = event.target;
					await target.addTempSkill("shpiaopeng_round", "roundStart");
					if (target.isLinked()) target.link();
					else target.link(true);
				},
				ai: {
					order: 1,
					result: {
						target: function (player, target) {
							var att = get.attitude(player, target);
							if (att > 0) {
								if (!target.isLinked() && !target.isTurnedOver()) return 0;
								if (target.isLinked() && target.isTurnedOver()) return 1.5;
								return 0.5;
							}
							if (!target.isLinked() && !target.isTurnedOver()) return -1.1;
							return 0;
						},
					},
				},
				sub: true,
			},
			round: {
				charlotte: true,
				sub: true,
			},
		},
	},
	shqiongji: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filterTarget: function (card, player, target) {
			if (target == player) return false;
			return target.countDiscardableCards(player, "h") + player.countDiscardableCards(player, "h") >= 2;
		},
		async content(event, trigger, player) {
			const dialog = [],
				target = event.target;
			dialog.push("穷计：弃置你与" + get.translation(player) + "的共计两张手牌");
			if (player.countCards("h")) {
				dialog.add('<div class="text center">' + get.translation(player) + "的手牌</div>");
				if (target.hasSkillTag("viewHandcard", null, player, true)) dialog.push(player.getCards("h"));
				else {
					dialog.push([player.getCards("h"), "blank"]);
				}
			}
			if (target.countCards("h")) {
				dialog.add('<div class="text center">' + get.translation(target) + "的手牌</div>");
				dialog.push(target.getCards("h"));
			}
			const { bool, links } = await target
				.chooseButton(2, true)
				.set("createDialog", dialog)
				.set("filterButton", button => {
					if (!lib.filter.canBeDiscarded(button.link, _status.event.player, get.owner(button.link))) return false;
					return true;
				})
				.set("filterOk", () => {
					return ui.selected.buttons.length == 2;
				})
				.set("ai", button => {
					var card = button.link;
					if (get.owner(card) == player) return 1;
					if (get.owner(card) == target) {
						if (get.attitude(player, target) > 0) return 0;
						return 1;
					}
				})
				.forResult();
			if (bool) {
				const list1 = [],
					list2 = [];
				const players = [player, target];
				for (var card of links) {
					if (get.owner(card) == player) list1.add(card);
					else list2.add(card);
				}
				const num = list1.length;
				if (list1.length && list2.length) {
					await game
						.loseAsync({
							lose_list: [
								[player, list1],
								[target, list2],
							],
							discarder: target,
						})
						.setContent("discardMultiple");
				} else if (list2.length) await target.discard(list2);
				else await player.discard(list1);
				const name = get.color(links[0], false) == get.color(links[1], false) ? "wuzhong" : "guohe";
				if (player.hasUseTarget({ name: name })) {
					await player.addTempSkill("shqiongji_effect");
					await player.chooseUseTarget(name, "视为使用一张" + (num <= 0 ? "" : "可额外指定至多" + get.cnNumber(num) + "名目标的") + "【" + get.translation(name) + "】", true).set("oncard", function (card) {
						card.storage.shqiongji = num;
					});
				}
			}
		},
		ai: {
			order: 1,
			result: {
				player: 0,
				target: function (player, target) {
					var att = get.attitude(player, target);
					var num1 = player.countCards("h");
					var num2 = target.countCards("h");
					if (target == player || num1 + num2 < 2) return 0;
					if (num1 < 1 && att > 0) return 0;
					if (att < 0) {
						if (num1 >= 2) {
							return num2 - 8;
						} else return -1;
					}
					return 0.7;
				},
			},
		},
		subSkill: {
			effect: {
				trigger: {
					player: "useCard2",
				},
				forced: true,
				charlotte: true,
				direct: true,
				onremove: true,
				filter: function (event, player) {
					var evt = event;
					return evt.card.storage && evt.card.storage.shqiongji && evt.card.storage.shqiongji > 0;
				},
				content: function () {
					"step 0";
					player.removeSkill("shqiongji_effect");
					var filter = function (event, player) {
						var card = event.card,
							info = get.info(card);
						if (info.allowMultiple == false) return false;
						if (event.targets && !info.multitarget) {
							if (
								game.hasPlayer(function (current) {
									return !event.targets.includes(current) && lib.filter.targetEnabled2(card, player, current);
								})
							) {
								return true;
							}
						}
						return false;
					};
					if (!filter(trigger, player)) event.finish();
					else {
						var num2 = trigger.card.storage.shqiongji;
						var prompt = "为" + get.translation(trigger.card) + "增加至多" + get.cnNumber(num2) + "个目标？";
						trigger.player
							.chooseTarget(prompt, [1, num2], function (card, player, target) {
								var player = _status.event.player;
								return !_status.event.targets.includes(target) && lib.filter.targetEnabled2(_status.event.card, player, target);
							})
							.set("ai", function (target) {
								var trigger = _status.event.getTrigger();
								var player = _status.event.player;
								return get.effect(target, trigger.card, player, player);
							})
							.set("card", trigger.card)
							.set("targets", trigger.targets);
					}
					("step 1");
					if (result.bool) {
						if (!event.isMine() && !event.isOnline()) game.delayx();
					} else event.finish();
					("step 2");
					game.log(result.targets, "也成为了", trigger.card, "的目标");
					trigger.targets.addArray(result.targets);
				},
				sub: true,
			},
		},
	},
	shjiaozhi: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			target: "useCardToTargeted",
		},
		filter: function (event, player) {
			return event.player != player && !player.countCards("h");
		},
		check: function (event, player) {
			return get.effect(player, event.card, event.player, player) <= 0;
		},
		async content(event, trigger, player) {
			const target1s = trigger.targets;
			const cards = get.cards(3);
			await game.cardsGotoOrdering(cards);
			if (_status.connectMode)
				game.broadcastAll(function () {
					_status.noclearcountdown = true;
				});
			event.given_map = {};
			event.target2s = [];
			if (!cards.length) return;
			do {
				const { bool, links } =
					cards.length == 1
						? { links: cards.slice(0), bool: true }
						: await player
								.chooseCardButton("狡智：请选择要分配的牌", true, cards, [1, cards.length])
								.set("ai", () => {
									if (ui.selected.buttons.length == 0) return 1;
									return 0;
								})
								.forResult();
				if (!bool) return;
				cards.removeArray(links);
				event.togive = links.slice(0);
				const targets = (
					await player
						.chooseTarget(
							"选择" + get.translation(trigger.card) + "一名目标获得" + get.translation(links),
							function (card, player, target) {
								return target1s.includes(target);
							},
							true
						)
						.set("ai", function (target) {
							var att = get.attitude(_status.event.player, target);
							if (_status.event.enemy) {
								return -att;
							} else if (att > 0) {
								return att / (1 + target.countCards("h"));
							} else {
								return att / 100;
							}
						})
						.set("enemy", get.value(event.togive[0], player, "raw") < 0)
						.forResult()
				).targets;
				if (targets.length) {
					event.target2s.add(targets[0]);
					const id = targets[0].playerid,
						map = event.given_map;
					if (!map[id]) map[id] = [];
					map[id].addArray(event.togive);
				}
			} while (cards.length > 0);
			if (_status.connectMode) {
				game.broadcastAll(function () {
					delete _status.noclearcountdown;
					game.stopCountChoose();
				});
			}
			const list = [];
			for (const i in event.given_map) {
				const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
				player.line(source, "green");
				if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) player.addExpose(0.2);
				list.push([source, event.given_map[i]]);
			}
			game.loseAsync({
				gain_list: list,
				giver: player,
				animate: "draw",
			}).setContent("gaincardMultiple");
			trigger.getParent().excluded.addArray(event.target2s);
			game.delay();
		},
		ai: {
			noh: true,
			nokeep: true,
			skillTagFilter(player, tag) {
				if (tag == "noh") {
					if (player.countCards("h") != 1) return false;
				}
			},
			effect: {
				target(card, player, target, current) {
					var list = ["sha", "juedou", "nanman", "wanjian", "guohe", "shunshou", "jiedao", "lebu", "bingliang"];
					if (target.countCards("h") == 0 && list.includes(card.name)) return "zeroplayertarget";
				},
			},
		},
	},
	shguanshi: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		frequent: true,
		async content(event, trigger, player) {
			//const {cards}=await game.cardsGotoOrdering(get.cards(5));
			var cards = [];
			var target1x = player;
			const result = await player
				.chooseTarget("是否观看一名其他角色的手牌，或点“取消”观看牌堆顶的牌", function (card, player, target) {
					if (target == player) return false;
					var nh = target.countCards("h");
					if (nh == 0) return false;
					return true;
				})
				.set("ai", target => {
					return target.countCards("h") - get.attitude(get.event().player, target);
				})
				.forResult();
			if (result.bool) {
				target1x = result.targets[0];
				cards = target1x.getCards("h");
				player.line(target1x, "green");
			} else {
				cards = get.cards(5);
				game.cardsGotoOrdering(cards);
			}
			const csbool = cards.filter(card => get.name(card) == "sha").length > 1;
			const { bool, links } = await player
				.chooseCardButton("弃置其中任意张【杀】或将其中一张【杀】交给一名角色", cards, [1, cards.length])
				.set("filterButton", function (button) {
					return get.name(button.link) == "sha";
				})
				.set("ai", function (button) {
					if (get.attitude(get.event().player, get.event().target) < 1) return 2;
					return 0;
				})
				.set("target", target1x)
				.forResult();
			if (!bool) {
				if (target1x == player) {
					for (var i = cards.length - 1; i >= 0; i--) {
						ui.cardPile.insertBefore(cards[i], ui.cardPile.firstChild);
					}
				}
				return;
			}
			const cards2 = links;
			var bool2 = false;
			var target2x;
			if (cards2.length == 1) {
				const target1 = target1x;
				const result = await player
					.chooseTarget("是否将" + get.translation(cards2) + "交给一名角色", function (card, player, target) {
						if (get.owner(cards2[0]) == target1) return target != target1;
						return true;
					})
					.set("ai", target => {
						if (get.attitude(get.player(), target) < 0.9) return 0;
						return get.value(cards2, target);
					})
					.forResult();
				if (result.bool) {
					bool2 = true;
					target2x = result.targets[0];
				}
			}
			if (bool2) {
				//player.give(cards2,target2x,'give');
				const gainEvent = target2x.gain(cards2, "draw");
				gainEvent.giver = player;
			} else {
				if (get.owner(cards2[0]) == target1x) target1x.discard(cards2);
				else game.cardsDiscard(cards2);
			}
			if (target1x == player) {
				for (var i = cards.length - 1; i >= 0; i--) {
					if (!cards2.includes(cards[i])) {
						ui.cardPile.insertBefore(cards[i], ui.cardPile.firstChild);
					}
				}
			}
		},
	},
	shkunbian: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "useCardToTargeted",
		},
		filter: function (event, player) {
			return event.card.name == "sha" && event.targets.length == 1 && get.distance(player, event.target) <= 1 && event.target.isIn();
		},
		check: function (event, player) {
			return get.attitude(player, event.target) > 1.5;
		},
		logTarget: "target",
		content: function () {
			trigger.target.draw(2, "visible").gaintag = ["shkunbian"];
			player
				.when({ global: "shaMiss" })
				.filter(evt => evt.card.name == "sha" && evt.card == trigger.card && evt.target == trigger.target)
				.then(() => {
					// game.log(1)
					var cards = trigger.target.getCards("h", card => card.hasGaintag("shkunbian") && lib.filter.cardDiscardable(card, trigger.target, "shkunbian"));
					if (cards.length) trigger.target.discard(cards);
				});
		},
	},
	shtujie: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		shaRelated: true,
		trigger: {
			player: "useCardToPlayered",
		},
		filter(event, player) {
			return event.card.name == "sha" && event.target.countDiscardableCards(player, "he") > 0;
		},
		direct: true,
		async content(event, trigger, player) {
			const result = await player
				.discardPlayerCard(trigger.target, get.prompt("shtujie", trigger.target) + "弃置" + get.translation(trigger.target) + "至多三张牌", [1, 3])
				.set("ai", function (button) {
					if (!get.event().att) return 0;
					return get.value(button.link);
				})
				.set("logSkill", ["shtujie", trigger.target])
				.set("att", get.attitude(player, trigger.target) <= 0)
				.forResult();
			if (result.bool && result.links && result.links.length) {
				const num = result.links.length;
				if (num < 1) return;
				trigger.card.storage = [num, result.links.slice(0)];
				player
					.when({ source: "damageSource" })
					.filter(evt => evt.card && evt.card.storage && evt.card.storage[0] > 0 && evt.card.name == "sha" && evt.card == trigger.card && evt.player == trigger.target)
					.then(() => {
						if (trigger.player.isIn()) trigger.player.draw(trigger.card.storage[0]);
						else player.draw(trigger.card.storage[0]);
					});
			}
		},
		ai: {
			unequip_ai: true,
		},
		group: "shtujie_assign",
		subSkill: {
			assign: {
				trigger: {
					source: "dying",
				},
				filter: function (event, player) {
					var evt = event.getParent("damage");
					return evt && evt.card && evt.card.storage && evt.card.storage[1] && evt.card.name == "sha";
				},
				forced: true,
				popup: false,
				async content(event, trigger, player) {
					const cards = trigger.getParent("damage").card.storage[1];
					if (_status.connectMode)
						game.broadcastAll(function () {
							_status.noclearcountdown = true;
						});
					event.given_map = {};
					if (!cards || !cards.length) return;
					do {
						const { bool, links } =
							cards.length == 1
								? { links: cards.slice(0), bool: true }
								: await player
										.chooseCardButton("请选择要分配的牌", true, cards, [1, cards.length])
										.set("ai", () => {
											if (ui.selected.buttons.length == 0) return 1;
											return 0;
										})
										.forResult();
						if (!bool) return;
						cards.removeArray(links);
						event.togive = links.slice(0);
						const targets = (
							await player
								.chooseTarget("选择" + get.translation(trigger.card) + "一名角色获得" + get.translation(links), true)
								.set("ai", function (target) {
									var att = get.attitude(get.event().player, target);
									if (_status.event.enemy) {
										return -att;
									} else if (att > 0) {
										return att / (1 + target.countCards("h"));
									} else {
										return att / 100;
									}
								})
								.set("enemy", get.value(event.togive[0], player, "raw") < 0)
								.forResult()
						).targets;
						if (targets.length) {
							const id = targets[0].playerid,
								map = event.given_map;
							if (!map[id]) map[id] = [];
							map[id].addArray(event.togive);
						}
					} while (cards.length > 0);
					if (_status.connectMode) {
						game.broadcastAll(function () {
							delete _status.noclearcountdown;
							game.stopCountChoose();
						});
					}
					const list = [];
					for (const i in event.given_map) {
						const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
						player.line(source, "green");
						if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) player.addExpose(0.2);
						list.push([source, event.given_map[i]]);
					}
					game.loseAsync({
						gain_list: list,
						giver: player,
						animate: "draw",
					}).setContent("gaincardMultiple");
				},
				sub: true,
			},
		},
	},
	shlianji: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		direct: true,
		async content(event, trigger, player) {
			var log = false;
			const result1 = await player
				.chooseTarget("是否令至多三名角色各使用一张牌？", [1, 3])
				.set("ai", function (target) {
					const player = get.event().player;
					if (get.attitude(player, target) > 1) return 1;
					return 0;
				})
				.forResult();
			if (result1.bool) {
				player.logSkill(event.name);
				log = true;
				for (const target of result1.targets.sortBySeat()) await target.chooseToUse();
			}
			if (!game.hasPlayer(target => target.countCards("e") > 0)) return;
			const result2 = await lib.skill.shlianji.moveZuoJi(trigger, player);
			if (result2 && !log) {
				player.logSkill(event.name);
				log = true;
			}
			if ((result1.bool && result2) || !game.hasPlayer(cur => cur.countCards("e") > 0)) return;
			const { bool, targets } = await player
				.chooseTarget("是否横置任意名装备区有牌的角色？", [1, Infinity], function (card, player, target) {
					return target.countCards("e") && !target.isLinked();
				})
				.set("ai", function (target) {
					return 1;
				})
				.forResult();
			if (bool) {
				if (!log) player.logSkill(event.name);
				targets.sortBySeat();
				targets.forEach(i => i.link());
			}
			// await current.chooseToUse()
		},
		subSkill: {
			remove: {
				init: function (player) {
					player.storage.shlianji = [];
				},
				onremove: function (player, skill) {
					delete player.storage.shlianj;
				},
				sub: true,
			},
			sha: {
				sub: true,
			},
		},
		moveZuoJi: async function (trigger, player) {
			await player.addTempSkill("shlianji_remove", "phaseZhunbeiAfter");
			var Result = false;
			while (
				game.hasPlayer(current => {
					return (
						current.countCards("e", card => {
							return ["equip4", "equip3", "equip6"].includes(get.subtype(card)) && !player.storage?.shlianji.includes(card);
						}) > 0
					);
				})
			) {
				const targets = (
					await player
						.chooseTarget(2, function (card, player, target) {
							if (ui.selected.targets.length == 1) {
								var from = ui.selected.targets[0];
								if (target.isMin()) return false;
								var es = from.getCards("e", card => {
									return ["equip4", "equip3", "equip6"].includes(get.subtype(card)) && !player.storage?.shlianji.includes(card);
								});
								for (var i = 0; i < es.length; i++) {
									if (target.canEquip(es[i])) return true;
								}
								return false;
							}
							return (
								target.countCards("e", card => {
									return ["equip4", "equip3", "equip6"].includes(get.subtype(card)) && !player.storage?.shlianji.includes(card);
								}) > 0
							);
						})
						.set("ai", function (target) {
							var player = _status.event.player;
							var att = get.attitude(player, target);
							var sgnatt = get.sgn(att);
							if (ui.selected.targets.length == 0) {
								if (att > 0) {
									if (
										target.countCards("e", function (card) {
											return (
												get.value(card, target) < 0 &&
												game.hasPlayer(function (current) {
													return current != target && get.attitude(player, current) < 0 && current.canEquip(card) && get.effect(target, card, player, player) < 0;
												})
											);
										}) > 0
									)
										return 9;
								} else if (att < 0) {
									if (
										game.hasPlayer(function (current) {
											if (current != target && get.attitude(player, current) > 0) {
												var es = target.getCards("e");
												for (var i = 0; i < es.length; i++) {
													if (get.value(es[i], target) > 0 && current.canEquip(es[i]) && get.effect(current, es[i], player, player) > 0) return true;
												}
											}
										})
									) {
										if (target.countCards("e") > 1) att -= 3;
										return -att;
									}
								}
								return 0;
							}
							var es = ui.selected.targets[0].getCards("e");
							var i;
							var att2 = get.sgn(get.attitude(player, ui.selected.targets[0]));
							for (i = 0; i < es.length; i++) {
								if (sgnatt != 0 && att2 != 0 && sgnatt != att2 && get.sgn(get.value(es[i], ui.selected.targets[0])) == -att2 && get.sgn(get.effect(target, es[i], player, target)) == sgnatt && target.canEquip(es[i])) {
									return Math.abs(att);
								}
							}
							if (i == es.length || att2 <= 0) {
								return 0;
							}
							return -att * att2;
						})
						.set("multitarget", true)
						.set("targetprompt", ["被移走", "移动目标"])
						.set("prompt", "是否移动场上的一张坐骑牌？")
						.forResult()
				).targets;
				if (targets && targets.length == 2) {
					player.line2(targets, "green");
					const targets0 = targets[0];
					const targets1 = targets[1];
					const result = await player
						.choosePlayerCard(
							"e",
							true,
							function (button) {
								const player = get.event().player;
								if (get.attitude(player, targets0) > 0 && get.attitude(player, targets1) < 0) {
									if (get.value(button.link, targets0) < 0 && get.effect(targets1, button.link, player, targets1) > 0) return 10;
									return 0;
								} else {
									return get.value(button.link) * get.effect(targets1, button.link, player, targets1);
								}
							},
							targets0
						)
						.set("filterButton", function (button) {
							if (player.storage.shlianji.includes(button.link)) return false;
							return targets1.canEquip(button.link) && ["equip4", "equip3", "equip6"].includes(get.subtype(button.link));
						})
						.forResult();
					if (result.bool) {
						Result = true;
						const equip = result.buttons[0].link;
						player.storage.shlianji.add(equip);
						if (get.position(equip) == "e") {
							targets1.equip(equip);
						}
						await targets0.$give(equip, targets1, false);
						game.log(targets0, "的", equip, "被移动给了", targets1);
					} else break;
				} else break;
			}
			return Result;
		},
	},
	shyubing: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			global: "damageBegin4",
		},
		filter: function (event, player) {
			return event.player.isLinked() && event.notLink();
		},
		async cost(event, trigger, player) {
			const list = ["选项一", "选项二", "选项三", "cancel2"];
			let choiceList = ["令任意名处于连环状态的角色摸一张牌", "重置" + get.translation(trigger.player) + "的武将牌并防止此伤害", "摸三张牌，然后重置场上所有角色武将牌"];
			const result = await player
				.chooseControl(list)
				.set("prompt", get.prompt("shyubing"))
				.set("choiceList", choiceList)
				.set("ai", () => {
					const target = get.event().target,
						player = get.event().player;
					if (get.attitude(player, target) > 3 && target.hp + target.hujia <= get.event().num && !player.countCards("h", { name: "tao" })) return list[1];
					if (get.event().targets.length > 2 && !get.event().hasNature) return list[0];
					return list[2];
				})
				.set("target", trigger.player)
				.set("num", trigger.num)
				.set("hasNature", trigger.hasNature())
				.set(
					"targets",
					game.filterPlayer(cur => cur.isLinked() && get.attitude(player, cur) > 1)
				)
				.forResult();
			event.result = {
				bool: result.control != "cancel2",
				cost_data: result.control,
			};
		},
		async content(event, trigger, player) {
			if (event.cost_data == "选项一") {
				const { bool, targets } = await player
					.chooseTarget(
						"令任意名处于连环状态的角色摸一张牌",
						[1, Infinity],
						function (card, player, target) {
							return target.isLinked();
						},
						true
					)
					.set("ai", function (target) {
						return get.attitude(get.event().player, target);
					})
					.forResult();
				if (bool) {
					targets.sortBySeat();
					await game.asyncDraw(targets);
				}
			} else if (event.cost_data == "选项二") {
				await trigger.player.link();
				if (!trigger.player.isLinked()) trigger.cancel();
			} else {
				await player.draw(3);
				game.filterPlayer()
					.sortBySeat()
					.forEach(target => {
						if (target.isLinked()) target.link();
					});
			}
		},
	},
	shjuyi: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		init: function (player) {
			if (!player.storage.shjuyi) player.storage.shjuyi = [];
		},

		dutySkill: true,
		unique: true,
		locked: false,
		trigger: {
			player: "phaseUseBegin",
		},
		filter: function (event, player) {
			return game.hasPlayer(function (current) {
				return current != player && current.countCards("he") > 0;
			});
		},
		async content(event, trigger, player) {
			const target1s = game
				.filterPlayer(function (current) {
					return current != player;
				})
				.sortBySeat();
			if (!target1s.length) event.finish();
			for (const current of target1s) {
				const resultx = await current
					.chooseCard("是否交给" + get.translation(player) + "一张牌，然后回复1点体力或摸一张牌", "he")
					.set("ai", function (card) {
						const evt = get.event().getParent();
						if (get.attitude(get.player(), evt.player) > 0) {
							//if(card.name=='jiu') return 120;
							//if(card.name=='tao') return 110;
							return player.getUseValue(card) + get.value(card) + 50;
						}
						return (get.player().getDamagedHp() + 1) * 2 - get.value(card);
					})
					.forResult();
				if (resultx.bool) {
					current.give(resultx.cards, player);
					player.storage.shjuyi.add(current);
					player.storage.shjuyi.sortBySeat();
					player.markSkill("shjuyi");
					const result = await current
						.chooseBool("是否改为由" + get.translation(player) + "执行,然后变更为梁山势力？")
						.set("ai", function () {
							const evt = get.event().getParent();
							const num1 = Math.max(get.effect(get.event().player, { name: "draw" }, get.event().player, get.event().player), get.recoverEffect(get.event().player, get.event().player, get.event().player));
							const num2 = Math.max(get.effect(evt.player, { name: "draw" }, evt.player, get.event().player), get.recoverEffect(evt.player, evt.player, get.event().player));
							if (get.attitude(get.event().player, evt.player) < 1) return false;
							if (get.event().player.group != "liang") return get.attitude(get.event().player, evt.player) > 0;
							return num2 - num1 > 0;
						})
						.forResult();
					if (result.bool) {
						current.addExpose(0.3);
						await player.chooseDrawRecover(true);
						await current.changeGroup("liang");
					} else await current.chooseDrawRecover(true);
				}
			}
		},
		/*intro: {
                        content: "$已响应过“聚义”",
                    },*/
		intro: {
			mark: function (dialog, content, player) {
				dialog.addText("已响应过聚义的角色");
				dialog.add(content);
			},
		},
		group: ["shjuyi_achieve"],
		subSkill: {
			achieve: {
				trigger: {
					player: "phaseUseEnd",
				},
				forced: true,
				skillAnimation: true,
				animationColor: "thunder",
				filter: function (event, player) {
					const players = player.storage.shjuyi.filter(current => game.filterPlayer().includes(current));
					return players.length >= game.countPlayer() / 2;
				},
				async content(event, trigger, player) {
					game.log(player, "成功完成使命");
					await player.awakenSkill("shjuyi");

					await player.addSkills("shtiankui");
				},
				sub: true,
			},
		},
	},
	shtiankui: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		init: function (player) {
			if (!player.storage.shtiankui) player.storage.shtiankui = [];
		},
		unique: true,
		trigger: {
			global: "roundStart",
		},
		zhuSkill: true,
		forced: true,
		async content(event, trigger, player) {
			let LinagArray = game.filterPlayer().sortBySeat();
			LinagArray.sort(function (a, b) {
				return b.hp - a.hp;
			});
			player.storage.shtiankui = LinagArray;
		},
		mark: true,
		marktext: "星位",
		intro: {
			content: "“星位”排序为：$",
		},
		group: "shtiankui_liang",
		subSkill: {
			liang: {
				trigger: {
					global: "phaseBegin",
				},
				filter(event, player) {
					return event.player.group == "liang" && player.storage.shtiankui.includes(event.player);
				},
				forced: true,
				async content(event, trigger, player) {
					let num = player.storage.shtiankui.length;
					const target = trigger.player;
					while (num--) {
						if (player.storage.shtiankui[num] == target) break;
					}
					num++;
					//game.log('座位号=',target.getSeatNum(),'星位=',num);
					if (target.getSeatNum() >= num) {
						target.chooseUseTarget("视为使用一张无距离限制的雷【杀】", { name: "sha", nature: "thunder" }, false, "nodistance");
					}
					if (target.getSeatNum() <= num) await game.asyncDraw([target, player]);
				},
				sub: true,
			},
		},
	},

	shpozhen: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		locked: false,
		enable: "phaseUse",
		usable: 2,
		filterCard: function (card) {
			return get.type(card) == "basic";
		},
		selectCard: [1, Infinity],
		check: function (card) {
			let player = _status.event.player;
			let ss = ui.selected.cards;
			if (ss.length) {
				let list = game
					.filterPlayer(function (current) {
						return current !== player && player.canUse({ name: "sha", nature: "thunder" }, current, false) && get.effect(current, { name: "sha", nature: "thunder" }, player, player) > 0;
					})
					.sort(function (a, b) {
						return get.effect(b, { name: "sha", nature: "thunder" }, player, player) - get.effect(a, { name: "sha", nature: "thunder" }, player, player);
					});
				if (!list.length) return 0;
				let suits = [];
				let hs = player.getCards("h");
				for (let i = 0; i < ss.length; i++) {
					suits.add(get.suit(ss[i], false));
				}
				if (suits.length == 2 || suits.includes(get.suit(card, false))) return 0;
				return 5 - get.value(card);
			}
			return 6.5 - get.value(card);
		},
		position: "hs",
		viewAs: {
			name: "sha",
			nature: "thunder",
			storage: {
				shpozhen: true,
			},
		},
		precontent() {
			const cards = event.result.cards;
			// var bool=true;
			const hs = player.getCards("h");
			player
				.when("useCard")
				.filter(evt => evt.skill == "shpozhen" && evt.card.storage && evt.card.storage.shpozhen)
				.vars({
					cards: cards,
					hs: hs,
				})
				.then(() => {
					let num = 1;
					if (!hs.length) num = 0;
					for (let i = 0; i < hs.length; i++) {
						if (!cards.includes(hs[i])) {
							num = 0;
							break;
						}
					}
					const list = [];
					for (let i = 0; i < cards.length; i++) {
						list.add(get.suit(cards[i], false));
					}
					if (typeof trigger.baseDamage != "number") trigger.baseDamage = 1;
					trigger.baseDamage += num;
					if (list.length == 2) {
						trigger.directHit.addArray(game.filterPlayer());
					}
				});
		},
		prompt: "将任意张基本牌当无距离与次数限制的雷【杀】使用",
		ai: {
			directHit_ai: true,
			skillTagFilter: function (player, tag, arg) {
				if (arg && arg.card && arg.card.name == "sha" && arg.card.storage && arg.card.storage.shpozhen) return true;
				return false;
			},
			yingbian: function (card, player, targets, viewer) {
				if (get.attitude(viewer, player) <= 0) return 0;
				var base = 0,
					hit = false;
				if (get.cardtag(card, "yingbian_hit")) {
					hit = true;
					if (
						targets.some(target => {
							return (
								target.mayHaveShan(
									viewer,
									"use",
									target.getCards("h", i => {
										return i.hasGaintag("sha_notshan");
									})
								) &&
								get.attitude(viewer, target) < 0 &&
								get.damageEffect(target, player, viewer, get.natureList(card)) > 0
							);
						})
					)
						base += 5;
				}
				if (get.cardtag(card, "yingbian_add")) {
					if (
						game.hasPlayer(function (current) {
							return !targets.includes(current) && lib.filter.targetEnabled2(card, player, current) && get.effect(current, card, player, player) > 0;
						})
					)
						base += 5;
				}
				if (get.cardtag(card, "yingbian_damage")) {
					if (
						targets.some(target => {
							return (
								get.attitude(player, target) < 0 &&
								(hit ||
									!target.mayHaveShan(
										viewer,
										"use",
										target.getCards("h", i => {
											return i.hasGaintag("sha_notshan");
										})
									) ||
									player.hasSkillTag(
										"directHit_ai",
										true,
										{
											target: target,
											card: card,
										},
										true
									)) &&
								!target.hasSkillTag("filterDamage", null, {
									player: player,
									card: card,
									jiu: true,
								})
							);
						})
					)
						base += 5;
				}
				return base;
			},
			canLink: function (player, target, card) {
				if (!target.isLinked() && !player.hasSkill("wutiesuolian_skill")) return false;
				if (player.hasSkill("jueqing") || player.hasSkill("gangzhi") || target.hasSkill("gangzhi")) return false;
				return true;
			},
			basic: {
				useful: [5, 3, 1],
				value: [5, 3, 1],
			},
			order: function (item, player) {
				if (player.hasSkillTag("presha", true, null, true)) return 10;
				if (typeof item === "object" && game.hasNature(item, "linked")) {
					if (
						game.hasPlayer(function (current) {
							return current != player && lib.card.sha.ai.canLink(player, current, item) && player.canUse(item, current, null, true) && get.effect(current, item, player, player) > 0;
						}) &&
						game.countPlayer(function (current) {
							return current.isLinked() && get.damageEffect(current, player, player, get.nature(item)) > 0;
						}) > 1
					)
						return 3.1;
					return 3;
				}
				return 3.05;
			},
			result: {
				target: function (player, target, card, isLink) {
					let eff = -1.5,
						odds = 1.35,
						num = 1;
					if (isLink) {
						let cache = _status.event.getTempCache("sha_result", "eff");
						if (typeof cache !== "object" || cache.card !== get.translation(card)) return eff;
						if (cache.odds < 1.35 && cache.bool) return 1.35 * cache.eff;
						return cache.odds * cache.eff;
					}
					if (
						player.hasSkill("jiu") ||
						player.hasSkillTag("damageBonus", true, {
							target: target,
							card: card,
						})
					) {
						if (
							target.hasSkillTag("filterDamage", null, {
								player: player,
								card: card,
								jiu: true,
							})
						)
							eff = -0.5;
						else {
							num = 2;
							if (get.attitude(player, target) > 0) eff = -7;
							else eff = -4;
						}
					}
					if (
						!player.hasSkillTag(
							"directHit_ai",
							true,
							{
								target: target,
								card: card,
							},
							true
						)
					)
						odds -=
							0.7 *
							target.mayHaveShan(
								player,
								"use",
								target.getCards("h", i => {
									return i.hasGaintag("sha_notshan");
								}),
								"odds"
							);
					_status.event.putTempCache("sha_result", "eff", {
						bool: target.hp > num && get.attitude(player, target) > 0,
						card: get.translation(card),
						eff: eff,
						odds: odds,
					});
					return odds * eff;
				},
			},
			tag: {
				respond: 1,
				respondShan: 1,
				damage: function (card) {
					if (game.hasNature(card, "poison")) return;
					return 1;
				},
				natureDamage: function (card) {
					if (game.hasNature(card, "linked")) return 1;
				},
				fireDamage: function (card, nature) {
					if (game.hasNature(card, "fire")) return 1;
				},
				thunderDamage: function (card, nature) {
					if (game.hasNature(card, "thunder")) return 1;
				},
				poisonDamage: function (card, nature) {
					if (game.hasNature(card, "poison")) return 1;
				},
			},
		},
		mod: {
			targetInRange: function (card) {
				if (card.storage && card.storage.shpozhen) return true;
			},
			cardUsable: function (card) {
				if (card.storage && card.storage.shpozhen) return Infinity;
			},
		},
	},
	shchouni: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		unique: true,
		trigger: {
			player: "phaseBegin",
		},
		filter(event, player) {
			var players = player.getFriends();
			return !game.hasPlayer(function (current) {
				return current != player && players.includes(current);
			});
		},
		limited: true,
		skillAnimation: true,
		animationColor: "thunder",
		check(event, player) {
			if (player.countCards("h", { name: "tao" }) > 0 || player.hp > 2) return false;
			return true;
		},
		async content(event, trigger, player) {
			let num = player.hp - 1;
			if (num > 0) await player.loseHp(num);
			await player.awakenSkill("shchouni");
			if (get.mode() != "doudizhu" || player.identity == "fan") await player.addSkills(["jsrgfeiyang", "jsrgbahu"]);
			player.addSkill("shchouni_bloodrage");
			player.addTempSkill("shchouni_clear", { player: "die" });
			lib.skill.shchouni.window(player);
			game.countPlayer(function (current) {
				current.addSkill("aozhan");
			});
		},
		subSkill: {
			bloodrage: {
				forced: true,
				mark: true,
				trigger: {
					player: "drawBefore",
				},
				popup: false,
				content() {
					trigger.num *= 2;
				},
				mod: {
					cardUsable: function (card, player, num) {
						if (card.name == "sha") return num * 2;
					},
					maxHandcard: function (player, num) {
						return num * 2;
					},
				},
				intro: {
					content: function () {
						return "战斗至死，这便是你残暴人生的终结";
					},
				},
				sub: true,
			},
			clear: {
				charlotte: true,
				onremove: function () {
					game.countPlayer2(function (current) {
						current.removeSkill("aozhan");
					});
					_status._aozhan = false;
					game.playBackgroundMusic();
				},
				sub: true,
			},
		},
		mark: true,
		intro: {
			content: "limited",
		},
		init: (player, skill) => (player.storage[skill] = false),
		window: function (player) {
			var color = get.groupnature(player.group, "raw");
			if (player.isUnseen()) color = "fire";
			player.$fullscreenpop("鏖战模式", color);
			game.broadcastAll(function () {
				_status._aozhan = true;
				ui.aozhan = ui.create.div(".touchinfo.left", ui.window);
				ui.aozhan.innerHTML = "鏖战模式";
				if (ui.time3) ui.time3.style.display = "none";
				ui.aozhanInfo = ui.create.system("鏖战模式", null, true);
				lib.setPopped(
					ui.aozhanInfo,
					function () {
						var uiintro = ui.create.dialog("hidden");
						uiintro.add("鏖战模式");
						var list = ["在鏖战模式下，任何角色均不是非转化的【桃】的合法目标。【桃】可以被当做【杀】或【闪】使用或打出。"];
						var intro = '<ul style="text-align:left;margin-top:0;width:450px">';
						for (var i = 0; i < list.length; i++) {
							intro += "<li>" + list[i];
						}
						intro += "</ul>";
						uiintro.add('<div class="text center">' + intro + "</div>");
						var ul = uiintro.querySelector("ul");
						if (ul) {
							ul.style.width = "180px";
						}
						uiintro.add(ui.create.div(".placeholder"));
						return uiintro;
					},
					250
				);
				game.playBackgroundMusic();
			});
		},
	},
	shgengzheng: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			source: "damageBegin1",
		},
		forced: true,
		filter(event, player) {
			if (!player.inRange(event.player)) return !event.hasNature("ice");
			return true;
		},
		async content(event, trigger, player) {
			if (!player.inRange(trigger.player)) {
				game.setNature(trigger, "ice");
				// game.log(1)
			} else await trigger.player.addTempSkill("fengyin");
		},
		ai: {
			ignoreSkill: true,
		},
	},
	shwushuang: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseDiscardAfter",
		},
		filter: function (event, player) {
			return (
				player.getHistory("lose", function (evt) {
					return evt.type == "discard" && evt.getParent("phaseDiscard") == event && evt.hs.someInD("d");
				}).length > 0
			);
		},
		direct: true,
		async content(event, trigger, player) {
			const cards = [],
				cards2 = [];
			game.getGlobalHistory("cardMove", function (evt) {
				if (evt.name == "cardsDiscard") {
					if (evt.getParent("phaseDiscard") == trigger) {
						let moves = evt.cards.filterInD("d");
						cards.addArray(moves);
						cards2.removeArray(moves);
					}
				}
				if (evt.name == "lose") {
					if (evt.type != "discard" || evt.position != ui.discardPile || evt.getParent("phaseDiscard") != trigger) return;
					var moves = evt.cards.filterInD("d");
					cards.addArray(moves);
					if (evt.player == player) cards2.addArray(moves);
					else cards2.removeArray(moves);
				}
			});
			if (!cards2.length) return;
			const list = [];
			for (let c of cards) {
				list.add(get.suit(c, false));
			}
			const num = list.length;
			if (!num) return;
			let card = { name: "sha", nature: "ice", isCard: true };
			await player
				.chooseUseTarget(card, get.prompt("shwushuang"), "视为使用一张需" + get.cnNumber(num) + "张【闪】才能抵消的冰【杀】", false, "nodistance")
				.set("logSkill", "shwushuang")
				.set("oncard", function (card) {
					const evt = _status.event;
					for (let target of game.filterPlayer(null, null, true)) {
						let id = target.playerid;
						let map = evt.customArgs;
						if (!map[id]) map[id] = {};
						map[id].shanRequired = num;
					}
				});
		},
	},
	shchanjin: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		hiddenCard: (player, name) => {
			return name == "tiesuo" && player.hasCard(card => get.color(card) == "red" || get.type2(card) == "trick", "she");
		},
		enable: "chooseToUse",
		filter: function (event, player) {
			if (!player.hasCard(card => get.color(card) == "red" || get.type2(card) == "trick", "she")) return false;
			return event.type == "phase" || event.filterCard(get.autoViewAs({ name: "tiesuo" }, "unsure"), player, event);
		},
		position: "hes",
		viewAs: {
			name: "tiesuo",
			storage: {
				chanjin: true,
			},
		},
		filterCard: function (card, player, target) {
			return get.color(card) == "red" || get.type2(card) == "trick";
		},
		check: function (card) {
			if (get.color(card) == "red" && get.type2(card) == "trick") return 7 - get.value(card);
			return 5 - get.value(card);
		},
		precontent() {
			var cards = event.result.cards.slice();
			if (cards.length && cards.length == 1 && get.color(cards[0]) == "red" && get.type2(cards[0]) == "trick") {
				const suit = get.suit(cards[0], false);
				player
					.when("useCardToTargeted")
					.filter(evt => evt.getParent().skill == "shchanjin")
					.vars({
						suit: suit,
					})
					.then(() => {
						const targets = trigger.targets;
						for (var target of targets) {
							target.storage.shchanjin_link = suit;
							target.addTempSkill("shchanjin_link");
							player.line(target, "green");
							game.addVideo("storage", target, ["shchanjin_link", suit]);
						}
					});
			}
		},
		prompt: "将一张红色牌或锦囊牌当【铁索连环】使用",
		subSkill: {
			link: {
				trigger: {
					player: "linkAfter",
				},
				forced: true,
				popup: false,
				filter: function (event, player) {
					let evt = event.getParent("useCard");
					let card = evt.cards[0];
					if (!card) return false;
					return evt.skill == "shchanjin" && get.color(card) == "red" && get.type2(card) == "trick";
				},
				async content(event, trigger, player) {
					if (player.isLinked()) {
						player.addTempSkill("shchanjin_islink", { player: "linkAfter" });
					} else {
						player.draw(2);
					}
				},
				sub: true,
			},
			islink: {
				forced: true,
				popup: false,
				mark: true,
				audio: false,
				onremove: true,
				mod: {
					cardEnabled2: function (card, player) {
						if (get.suit(card) == player.storage.shchanjin_link && get.position(card) == "h") return false;
					},
				},
				intro: {
					content: function (storage, player) {
						return "不能使用或打出" + get.translation(player.storage.shchanjin_link) + "手牌";
					},
				},
				sub: true,
			},
		},
		ai: {
			wuxie: (target, card, player, viewer, status) => {
				if (status * get.attitude(viewer, player._trueMe || player) > 0 || target.hasSkillTag("nodamage") || target.hasSkillTag("nofire") || target.hasSkillTag("nothunder") || get.attitude(viewer, player) > 0 || (1 + target.countCards("hs")) * _status.event.getRand() > 1.57) return 0;
			},
			basic: {
				order: 7.3,
				useful: 1.2,
				value: 4,
			},
			result: {
				target: (player, target) => {
					if (target.hasSkillTag("link")) return 0;
					let curs = game.filterPlayer(current => {
						if (current.hasSkillTag("nodamage")) return false;
						return !current.hasSkillTag("nofire") || !current.hasSkillTag("nothunder");
					});
					if (curs.length < 2) return 0;
					let f = target.hasSkillTag("nofire"),
						t = target.hasSkillTag("nothunder"),
						res = 0.9;
					if ((f && t) || target.hasSkillTag("nodamage")) return 0;
					if (f || t) res = 0.45;
					if (!f && target.getEquip("tengjia")) res *= 2;
					if (!target.isLinked()) res = -res;
					if (ui.selected.targets.length) return res;
					let fs = 0,
						es = 0,
						att = get.attitude(player, target),
						linkf = false,
						alink = true;
					curs.forEach(i => {
						let atti = get.attitude(player, i);
						if (atti > 0) {
							fs++;
							if (i.isLinked()) linkf = true;
						} else if (atti < 0) {
							es++;
							if (!i.isLinked()) alink = false;
						}
					});
					if (es < 2 && !alink) {
						if (att <= 0 || (att > 0 && linkf && fs < 2)) return 0;
					}
					return res;
				},
			},
			tag: {
				multitarget: 1,
				multineg: 1,
				norepeat: 1,
			},
		},
	},
	shbenjiu: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		init: function (player) {
			if (!player.storage.shbenjiu) player.storage.shbenjiu = [];
		},
		trigger: {
			global: "damageBegin4",
		},
		direct: true,
		filter: function (event, player) {
			if (!player.inRange(event.player)) return false;
			return player.countCards("h") > 0 || event.num > 0;
		},
		async content(event, trigger, player) {
			const target = trigger.player;
			const list = [];
			let choiceList = ["将所有手牌交给" + get.translation(target) + ",然后其回复1点体力", "将" + get.translation(target) + "受到的伤害转移给你，然后与其各摸一张牌", "背水！此后对" + get.translation(target) + "强制发动奔救并执行所有选项"];
			if (player.countCards("h") > 0) list.push("选项一");
			else choiceList[0] = '<span style="opacity:0.5; ">' + choiceList[0] + "</span>";
			if (trigger.num > 0) list.push("选项二");
			else choiceList[1] = '<span style="opacity:0.5; ">' + choiceList[1] + "</span>";
			if (list.length == 2) list.push("背水！");
			else choiceList[2] = '<span style="opacity:0.5; ">' + choiceList[2] + "</span>";
			if (!list.length) return;
			if (!player.storage.shbenjiu.includes(target)) list.push("cancel2");
			const { control } = await player
				.chooseControl(list)
				.set("choiceList", choiceList)
				.set("prompt", player.storage.shbenjiu.includes(target) ? "请选择一项" : get.prompt("shbenjiu", target))
				.set("ai", function () {
					const player = get.event().player;
					let att = get.attitude(player, target);
					let bool = ["君", "主"].includes(lib.translate[target.identity]) && !["野", "内"].includes(lib.translate[player.identity]);
					let bool1 = (get.value(player.getCards("h"), player) < get.value(player.getCards("h"), target) && get.recoverEffect(target, player, player) > 1) || bool;
					let bool2 = player.hp + player.hujia - trigger.num > 0 || bool;
					let unbool2 = get.damageEffect(target, trigger.source, player) > 0 || (get.attitude(player, target) > 0 && get.damageEffect(target, trigger.source, target) > 0);
					if (list.includes("cancel2") && att < 1) return "cancel2";
					if (list.includes("背水！") && bool1 && bool2 && !unbool2 && att > 1.5 && bool) return "背水！";
					if (list.includes("选项一") && bool1) return "选项一";
					if (list.includes("选项二") && bool2 && !unbool2 && !trigger.hasNature()) return "选项二";
					return list[0];
				})
				.forResult();
			if (control && control != "cancel2") {
				player.logSkill("shbenjiu", target);
				if (control == "背水！") {
					if (!player.storage.shbenjiu) player.storage.shbenjiu = [];
					player.storage.shbenjiu.add(target);
					player.storage.shbenjiu.sortBySeat();
					player.markSkill("shbenjiu");
				}
				if (control == "选项一" || control == "背水！") {
					await player.give(player.getCards("h"), target);
					await target.recover();
				}
				if (control == "选项二" || control == "背水！") {
					trigger.cancel();
					player
						.damage(trigger.source ? trigger.source : "nosource", trigger.nature, trigger.num)
						.set("card", trigger.card)
						.set("cards", trigger.cards).shbenjiu = true;
					await game.asyncDraw([player, target]);
				}
			}
		},
		intro: {
			mark: function (dialog, content, player) {
				dialog.addText("强制发动奔救的角色");
				dialog.add(content);
			},
		},
	},
	shyebing: {
		init: function (player) {
			if (!player.storage.shyebing) player.storage.shyebing = [];
			_status.initLiangCards();
		},
		//derivation:'shyebing_faq',
		enable: "phaseUse",
		audio: "ext:水泊娘山/character/audio/skill:2",
		usable: 1,
		position: "hes",
		discard: false,
		delay: false,
		filterCard: function (card) {
			if (get.name(card, false) == "tiesuo") return true;
			return get.subtype(card) == "equip1" || get.subtype(card) == "equip2";
		},
		filter: function (event, player) {
			if (!_status.liangcards || !_status.liangcards.length) return false;
			return player.countCards("she") > 0;
		},
		check: function (card) {
			return 6 - get.value(card);
		},
		filterTarget: true,
		async content(event, trigger, player) {
			const target = event.target;
			const cards = event.cards;
			const list = _status.liangcards.slice(0);
			player.addToExpansion(cards, player, "give").gaintag.add("shyebing");
			// var equip;
			const { bool, links } = await player.chooseButton(["令" + get.translation(target) + "获得“梁山兵甲库中的一件装备”", list], true).forResult();
			if (bool) {
				await target.$gain2(links);
				_status.liangcards.remove(links[0]);
				target.equip(links[0]);
			}
		},
		ai: {
			order: function () {
				var player = _status.event.player;
				var hs = player.getCards("h");
				if (hs.some(card => get.name(card) == "baiyin") && player.hp < player.maxHp) return 1;
				return 10;
			},
			result: {
				target(player, target) {
					var card = _status.liangcards[0];
					if (get.attitude(player, target) < 1) return 0;
					return get.effect(target, card, player, player);
				},
			},
			threaten: 1.3,
		},
		onremove: function (player, skill) {
			var cards = player.getExpansions(skill);
			if (cards.length) player.loseToDiscardpile(cards);
		},
		mark: true,
		intro: {
			content: "expansion",
			markcount: "expansion",
		},
	},
	shbazhen: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "useCardToPlayered",
		},
		logTarget: "target",
		filter: function (event, player) {
			if (!event.cards || !event.cards.some(card => get.name(card, false) == "sha")) return false;
			return player.countCards("h") > 0 || event.target.countCards("h") > 0;
		},
		async content(event, trigger, player) {},
	},
	shtongmai: {
		mod: {
			aiValue: function (player, card, num) {
				if (num <= 0 || get.itemtype(card) !== "card") return;
				if (card.name != "sha" && card.name != "tao") return;
				var geti = function () {
					var cards = player.getCards("hs", function (card) {
						return card.name == "sha" || card.name == "tao";
					});
					if (cards.includes(card)) {
						return cards.indexOf(card);
					}
					return cards.length;
				};
				return Math.max(num, [7, 5, 5, 3][Math.min(geti(), 3)]);
			},
			aiUseful: function () {
				return lib.skill.shtongmai.mod.aiValue.apply(this, arguments);
			},
		},
		locked: false,
		hiddenCard: function (player, name) {
			if (name == "tao") return player.countCards("hs", "sha") > 0;
			if (name == "sha") return player.countCards("hs", "tao") > 0;
			return false;
		},
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "chooseToUse",
		position: "hs",
		prompt: "将【杀】当做桃，或将【桃】当做刺【杀】使用",
		viewAs: function (cards, player) {
			if (cards.length) {
				var name = false,
					nature = null;
				switch (get.name(cards[0], player)) {
					case "sha":
						name = "tao";
						break;
					case "tao":
						name = "sha";
						nature = "stab";
						break;
				}
				if (name)
					return {
						name: name,
						nature: nature,
						storage: {
							shtongmai: true,
						},
					};
			}
			return null;
		},
		check: function (card) {
			return 7 - get.value(card);
		},
		filterCard: function (card, player, event) {
			event = event || _status.event;
			var filter = event._backup.filterCard;
			var name = get.name(card, player);
			if (name == "sha" && filter({ name: "tao", cards: [card] }, player, event)) return true;
			if (name == "tao" && filter({ name: "sha", nature: "stab", cards: [card] }, player, event)) return true;
			return false;
		},
		filter: function (event, player) {
			var filter = event.filterCard;
			if (filter(get.autoViewAs({ name: "sha", nature: "stab" }, "unsure"), player, event) && player.countCards("hs", "tao")) return true;
			if (filter(get.autoViewAs({ name: "tao" }, "unsure"), player, event) && player.countCards("hs", "sha")) return true;
			return false;
		},
		precontent() {
			player
				.when("useCardToTargeted")
				.filter(evt => evt.getParent().skill == "shtongmai")
				.then(() => {
					const target = trigger.targets[0];
					if (target.countDiscardableCards(player, "hej") > 0) player.discardPlayerCard("hej", true, target);
					if (target.hasSex("female")) player.draw();
				});
		},
		ai: {
			order: function (item, player) {
				if (player && _status.event.type == "phase") {
					var max = 0;
					var list = ["sha", "tao"];
					var map = { sha: "tao", tao: "sha" };
					for (var i = 0; i < list.length; i++) {
						var name = list[i];
						if (player.countCards("hs", map[name]) > (name == "jiu" ? 1 : 0) && player.getUseValue({ name: name }) > 0) {
							var temp = get.order({ name: name });
							if (temp > max) max = temp;
						}
					}
					if (max > 0) max += 0.3;
					return max;
				}
				return 4;
			},
		},
	},
	shaiai: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		locked: false,
		global: "shaiai2",
		init: function (player) {
			if (!player.storage.shaiai) player.storage.shaiai = [];
			if (!player.storage.shaiai2) player.storage.shaiai2 = [];
		},
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			return player.countCards("h", { suit: "club" }) > 0;
		},
		filterCard: function (card, player) {
			var cardx = {
				name: "baiyin",
				cards: card,
			};
			return get.suit(card) == "club" && player.canEquip(cardx, true);
		},
		position: "h",
		discard: false,
		lose: false,
		delay: false,
		check: function (card) {
			const player = _status.event.player;
			return 7 - get.value(card, player);
		},
		async content(event, trigger, player) {
			const card = event.cards[0];
			const namex = card.name;
			const cardx = {
				name: card.name,
				suit: card.suit,
				number: card.number,
				isCard: true,
			};

			game.addVideo("skill", player, ["shaiai", [false, get.cardInfo(card)]]);
			game.broadcastAll(function (card) {
				card.init([card.suit, card.number, "baiyin"]);
				card.storage.shaiai = [card.suit, card.number, namex];
				player.storage.shaiai2.add([card.cardid, card.suit, card.number, namex]);
			}, card);
			var info = get.info(card);
			if (info.onLose) {
				info.onLose = function () {
					if (card.storage && card.storage.shaiai) {
						const card2 = card.cards ? card.cards[0] : card;
						if (player.storage && player.storage.shaiai2) {
							player.storage.shaiai2 = player.storage.shaiai2.filter(function (elem) {
								return elem[0] == card2.cardid;
							});
						}
						card2.init([card.storage.shaiai[0], card.storage.shaiai[1], card.storage.shaiai[2]]);
						player.addToExpansion(card2, player, "give").gaintag.add("shaiai");
						var next = game.createEvent("baiyin_skill_lose");
						event.next.remove(next);
						var evt = event.getParent();
						if (evt.getlx === false) evt = evt.getParent();
						evt.after.push(next);
						next.player = player;
						next.setContent(lib.skill.shaiai.onLosex);
					} else {
						player.addTempSkill("baiyin_skill_lose");
					}
				};
			}
			game.log(player, "将", cardx, "转化为了", card);
			await player.equip(card);
		},
		onLosex: function () {
			"step 0";
			if (!player.isHealthy() && !player.hasSkillTag("unequip2")) {
				player.logSkill("baiyin_skill_lose");
				player.recover();
			}
			("step 1");
			player.logSkill("shaiai");
			player.draw(2);
		},
		ai: {
			order: 10,
			result: {
				player: 1,
			},
		},
		mod: {
			aiValue(player, card, num) {
				if (num <= 0 || get.itemtype(card) !== "card") return;
				if (card.name === "baiyin" && card.storage.shaiai) return -1;
			},
		},
		onremove: function (player, skill) {
			var cards = player.getExpansions(skill);
			if (cards.length) player.loseToDiscardpile(cards);
		},
		mark: true,
		intro: {
			content: "expansion",
			markcount: "expansion",
		},
	},
	shaiai2: {
		audio: 2,
		trigger: { global: "die" },
		forced: true,
		charlotte: true,
		popup: false,
		//preHidden: true,
		filter: function (event) {
			if (!event.player.storage || !event.player.storage.shaiai2) return false;
			return (
				event.player.countCards("shej", function (card) {
					for (var elem of event.player.storage.shaiai2) {
						if (elem[0] == card) return true;
					}
					return false;
				}) > 0
			);
		},
		async content(event, trigger, player) {
			const cards = trigger.player.getCards("shej");
			for (const elem of trigger.player.storage.shaiai2) {
				for (const card of cards) {
					if (elem[0] == card) {
						card.init([elem[1], elem[2], elem[3]]);
						//game.log(card)
					}
				}
			}
		},
		mark: true,
	},
	shhanhan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "damageEnd",
			source: "damageSource",
		},
		forced: true,
		filter: function (event, player) {
			if (!event.source) return false;
			return player.getExpansions("shaiai").length > 0;
		},
		async content(event, trigger, player) {
			const { bool, links } = await trigger.source.chooseCardButton("获得一张除外牌", player.getExpansions("shaiai"), true).forResult();
			if (!bool) return;
			const card = links[0];
			trigger.source.gain(card, "give", player, "bySelf");
		},
		ai: {
			combo: "shaiai",
		},
	},
	shkangge: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			player: "useCardAfter",
		},
		direct: true,
		filter: function (event, player) {
			return game.hasPlayer(current => {
				return current.countCards("h") > player.countCards("h") && !current.hasSkill("shkangge_blocker");
			});
		},
		async content(event, trigger, player) {
			const suit = get.suit(trigger.card, false);
			const { bool, targets } = await player
				.chooseTarget(get.prompt("shkangge"), "选择一名手牌多于你的角色", (card, player, target) => {
					if (target.hasSkill("shkangge_blocker")) return false;
					return target != player && target.countCards("h") > player.countCards("h");
				})
				.set("ai", target => {
					const player = get.event().player;
					var num = target.countCards("h", card => get.suit(card, false) == suit);
					if (!target.hasSkill("shkangge")) num = num * 2;
					if (num > 0) return num * get.attitude(player, target);
					return -get.attitude(player, target);
				})
				.forResult();
			if (!bool) return;
			const target = targets[0];
			player.logSkill("shkangge", target);
			const result = await target
				.chooseToUse({
					filterCard: function (card, player, event) {
						if (get.suit(card, false) != suit || get.itemtype(card) != "card") return false;
						return lib.filter.filterCard.apply(this, arguments);
					},
					prompt: "是否使用一张" + get.translation(suit) + "牌？",
					ai1: function (card) {
						const att = get.attitude(target, player);
						if (att > 0) return target.getUseValue(card);
						return target.getUseValue(card) + 100;
					},
				})
				.forResult();
			if (result.bool) {
				target.addTempSkills("shkangge", "roundStart");
			} else {
				const resulty = await target
					.chooseCard("he", true, "将一张牌交给" + get.translation(player))
					.set("ai", function (card) {
						const att = get.attitude(target, player);
						if (att > 0) return player.getUseValue(card) + 100;
						return 100 - player.getUseValue(card);
					})
					.forResult();
				if (resulty?.bool && resulty.cards?.length) {
					target.give(resulty.cards, player, true);
					target.addTempSkill("shkangge_blocker");
				}
			}
		},
		subSkill: {
			blocker: {
				sub: true,
			},
		},
	},
	shshenxing: {
		group: "shshenxing2",
		derivation: "new_zhixi",
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseDrawEnd",
		},
		direct: true,
		filter: function (event, player) {
			return player.countCards("h", card => get.type2(card) == "trick") > 0;
		},
		async content(event, trigger, player) {
			//const togives=player.getCards('h',card=>get.type2(card)=='trick');
			const togiver = [];
			const togives = [];
			const cresult = await player
				.chooseCard(
					"h",
					[
						1,
						Math.min(
							4,
							player.countCards("h", card => get.type2(card) == "trick")
						),
					],
					get.prompt2("shshenxing"),
					"将至多四张锦囊牌置为“甲马”"
				)
				.set("filterCard", card => {
					return get.type2(card) == "trick";
				})
				.set("ai", card => {
					return 7 - get.value(card);
				})
				.forResult();
			if (cresult.bool) {
				player.addGaintag(cresult.cards, "shjiama");
				cresult.cards.forEach(card => {
					togives.push(card);
				});
			}
			if (_status.connectMode)
				game.broadcastAll(function () {
					_status.noclearcountdown = true;
				});
			event.given_map = {};
			if (!togives || !togives.length) return;
			do {
				const { bool, cards, targets } = await player
					.chooseCardTarget({
						filterCard: function (card) {
							return togives.includes(card);
						},
						selectCard: [1, togives.length],
						filterTarget: true,
						ai1: function (card) {
							if (ui.selected.cards.length > 0) return 100;
							return 100 - get.value(card);
						},
						ai2: function (target) {
							var att = get.attitude(get.event().player, target);
							return att;
						},
						prompt: "请选择将任意张“甲马”分配给一名角色",
					})
					.set("forced", true)
					.forResult();
				if (bool) {
					togiver.add(targets[0]);
					//targets[0].addTempSkill('shguahuo_alloc','dyingAfter');
					player.line(targets, { color: [255, 255, 0] });
					togives.removeArray(cards);
					const id = targets[0].playerid,
						map = event.given_map;
					if (!map[id]) map[id] = [];
					map[id].addArray(cards);
				}
			} while (togives.length > 0);
			if (_status.connectMode) {
				game.broadcastAll(function () {
					delete _status.noclearcountdown;
					game.stopCountChoose();
				});
			}
			player.logSkill("shshenxing", togiver);
			for (var i in event.given_map) {
				var source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
				await source.addToExpansion(event.given_map[i], "gain2").gaintag.add("shshenxing");
			}
		},
		onremove: function (player, skill) {
			var cards = player.getExpansions(skill);
			if (cards.length) player.loseToDiscardpile(cards);
		},
		intro: {
			name: "甲马",
			content: "expansion",
			markcount: "expansion",
		},
	},
	shshenxing2: {
		audio: "ext:水泊娘山/character/audio/skill/shshenxing2.mp3",
		trigger: {
			global: "phaseAfter",
		},
		filter: function (event, player) {
			return event.player.getExpansions("shshenxing").length > 1;
		},
		logTarget: "player",
		check: function (event, player) {
			if (get.attitude(_status.event.player, event.player) < 1) return false;
			return true;
		},
		async content(event, trigger, player) {
			const exs = trigger.player.getExpansions("shshenxing");
			trigger.player.loseToDiscardpile([exs[0], exs[1]]);
			trigger.player.insertPhase();
			trigger.player
				.when("phaseBegin")
				.filter(evt => evt.player == trigger.player)
				.then(() => {
					trigger.player.addTempSkills("new_zhixi");
				});
		},
	},
	shzoutan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "gainAfter",
		},
		frequent: true,
		filter: function (event, player) {
			if (event.getParent().name != "draw") return false;
			if (event.player == player || get.distance(player, event.player) != 1) return false;
			var cards = event.cards;
			return cards.length > 0 && !player.hasSkill("shzoutan_blocker");
		},
		logTarget: "player",
		async content(event, trigger, player) {
			var hs = trigger.player.getCards("h");
			const cards = trigger.cards.filter(function (i) {
				return hs.includes(i);
			});
			if (!cards.length) return;
			const { bool, links } = await player
				.chooseCardButton("是否展示其中一张锦囊牌并获得之？", cards)
				.set("filterButton", function (button) {
					return get.type2(button.link) == "trick";
				})
				.set("ai", function (button) {
					const player = get.event().player;
					const target = trigger.player;
					if (get.attitude(player, target) > 1) return get.value(button.link, player) - get.value(button.link, target);
					return get.value(button.link);
				})
				.forResult();
			if (!bool) return;
			player.addTempSkill("shzoutan_blocker");
			player.showCards(links, get.translation(player) + "对" + get.translation(trigger.player) + "发动了【走探】");
			await player.gain(links, "draw");
		},
		subSkill: {
			blocker: {
				sub: true,
			},
		},
	},
	shzhiba: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		forced: true,
		trigger: {
			player: "useCard",
		},
		filter: function (event, player) {
			return (
				event.card &&
				(get.type(event.card) == "trick" || (get.type(event.card) == "basic" && !["shan", "tao", "jiu", "du"].includes(event.card.name))) &&
				game.hasPlayer(function (current) {
					return player.inRange(current);
				})
			);
		},
		async content(event, trigger, player) {
			trigger.directHit.addArray(
				game.filterPlayer(function (current) {
					return current != player && player.inRange(current);
				})
			);
		},
		mod: {
			maxHandcard: function (player, num) {
				var players = game.filterPlayer(function (current) {
					return current != player && player.inRange(current);
				});
				return num + players.length;
			},
			cardUsable: function (card, player, num) {
				var players = game.filterPlayer(function (current) {
					return current != player && player.inRange(current);
				});
				if (card.name == "sha") return num + players.length;
			},
		},

		ai: {
			unequip: true,
			unequip_ai: true,
			directHit_ai: true,
			skillTagFilter: function (player, tag, arg) {
				if (tag == "directHit_ai") return player.inRange(arg.target);
				return tag.card;
			},
		},
	},
	shduofan: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			player: "phaseUseBegin",
		},
		direct: true,
		/*filter:function (event, player) {
                        return player.countCards("he") > 0;
                    },*/
		async content(event, trigger, player) {
			const card = { name: "juedou", isCard: true };
			const Pro_targets = game.filterPlayer(current => {
				return !player.inRange(current) && player.canUse(card, current);
			});
			if (!Pro_targets || !Pro_targets.length) return;
			const targets = (
				await player
					.chooseTarget([1, Pro_targets.length], get.prompt2("shduofan"), function (card, player, target) {
						return Pro_targets.includes(target);
					})
					.set("ai", function (target) {
						var player = get.event().player;
						return get.effect(target, { name: "juedou" }, player, player);
					})
					.forResult()
			).targets;
			if (targets && targets.length) {
				targets.sortBySeat();
				player.line(targets, "green");
				player.logSkill("shduofan", targets);
				await player.useCard({ name: "juedou", isCard: true }, targets);
				await player.draw(targets.length);
				if (targets.length == Pro_targets.length) {
					if (typeof player.storage.shduofan_range !== "number") player.storage.shduofan_range = 0;
					await player.addSkill("shduofan_range");
					player.storage.shduofan_range += 1;
					if (player.storage.shduofan_range != 0) player.markSkill("shduofan_range");
					game.log(player, "的攻击范围+1");
				}
			}
		},
		subSkill: {
			range: {
				charlotte: true,
				intro: {
					content: function (storage, player) {
						var num = player.storage.shduofan_range;
						return "攻击范围" + (num >= 0 ? "+" : "") + num;
					},
				},
				mod: {
					attackRange: function (player, num) {
						return num + player.countMark("shduofan_range");
					},
				},
			},
		},
	},
	shgengjue1: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "chooseToUse",
		hiddenCard: function (player, name) {
			if (get.type(name) != "basic") return false;
			return player.canMoveCard(null, true);
		},
		filter: function (event, player) {
			if (event.type == "wuxie" || !lib.skill.shgengjue1.getBasicList1(event, player).length) return false;
			return player.canMoveCard(null, true) && game.roundNumber == 1;
		},
		chooseButton: {
			dialog: function (event, player) {
				const vcards = lib.skill.shgengjue1.getBasicList1(event, player);
				return ui.create.dialog("耕掘①", [vcards, "vcard"], "hidden");
			},
			check: function (button) {
				const player = _status.event.player;
				const card = { name: button.link[2], nature: button.link[3] };
				if (
					game.hasPlayer(function (current) {
						return player.canUse(card, current) && get.effect(current, card, player, player) > 0;
					})
				) {
					switch (button.link[2]) {
						case "tao":
							return 5;
						case "jiu":
							return 3.01;
						case "sha":
							if (button.link[3] == "fire") return 2.95;
							else if (button.link[3] == "thunder") return 2.92;
							else return 2.9;
						case "shan":
							return 1;
					}
				}
				return 0;
			},
			backup: function (links, player) {
				return {
					check: function (card) {
						return 1 / Math.max(0.1, get.value(card));
					},
					filterCard() {
						return false;
					},
					selectCard: -1,
					viewAs: {
						name: links[0][2],
						nature: links[0][3],
						isCard: true,
					},
					popname: true,
					precontent: function () {
						player.logSkill("shgengjue");
						player.moveCard(true).nojudge = true;
						var viewAs = {
							name: event.result.card.name,
							nature: event.result.card.nature,
						};
						player.markAuto("shgengjue1", viewAs);
					},
				};
			},
			prompt: function (links, player) {
				return "移动场上一张装备牌并视为使用一张" + get.translation(links[0][3] || "") + get.translation(links[0][2]);
			},
		},
		ai: {
			respondSha: true,
			respondShan: true,
			order: 10,
			result: {
				player(player) {
					if (_status.event.dying) {
						return get.attitude(player, _status.event.dying);
					}
					return 1;
				},
			},
		},
		marktext: "①",
		intro: {
			content: "已因〖耕掘①〗使用过$",
			onunmark: true,
		},
		getBasicList1: function (event, player) {
			const history = player.getAllHistory("useCard", function (evt) {
				return get.type(evt.card, null, false) == "basic";
			});
			const vcards = [];
			for (let name of lib.inpile) {
				if (get.type(name) != "basic" || history.some(evt => evt.card.name == name)) continue;
				let card = { name: name, isCard: true };
				if (event.filterCard(card, player, event)) vcards.push(["基本", "", name]);
				if (name == "sha") {
					for (let nature of lib.inpile_nature) {
						card.nature = nature;
						if (event.filterCard(card, player, event) && !history.some(evt => evt.card.name == "sha" && get.nature(evt.card) == nature)) vcards.push(["基本", "", name, nature]);
					}
				}
			}
			return vcards;
		},
	},
	shgengjue2: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "chooseToUse",
		hiddenCard: function (player, name) {
			if (get.type(name) != "basic") return false;
			return player.hasEnabledSlot();
		},
		filter: function (event, player) {
			if (event.type == "wuxie" || !lib.skill.shgengjue2.getBasicList2(event, player).length) return false;
			return player.hasEnabledSlot() && game.roundNumber == 2;
		},
		chooseButton: {
			dialog: function (event, player) {
				const vcards = lib.skill.shgengjue2.getBasicList2(event, player);
				var dialog = ui.create.dialog("耕掘②", "hidden");
				const equips = [];
				for (let i = 1; i < 6; i++) {
					if (!player.hasEnabledSlot(i)) continue;
					equips.push([i, get.translation("equip" + i)]);
				}
				if (equips.length > 0) dialog.add([equips, "tdnodes"]);
				dialog.add([vcards, "vcard"]);
				return dialog;
			},
			filter: function (button) {
				if (ui.selected.buttons.length && typeof button.link == typeof ui.selected.buttons[0].link) return false;
				return true;
			},
			select: 2,
			check: function (button) {
				var player = _status.event.player;
				if (typeof button.link == "number") {
					var card = player.getEquip(button.link);
					if (card) {
						var val = get.value(card);
						if (val > 0) return 0;
						return 5 - val;
					}
					switch (button.link) {
						case 3:
							return 4.5;
						case 4:
							return 4.4;
						case 5:
							return 4.3;
						case 2:
							return (3 - player.hp) * 1.5;
						case 1: {
							if (
								game.hasPlayer(function (current) {
									return (get.realAttitude || get.attitude)(player, current) < 0 && get.distance(player, current) > 1;
								})
							)
								return 0;
							return 3.2;
						}
					}
				}
				var name = button.link[2];
				var evt = _status.event.getParent();
				if (evt.type == "phase") {
					var card = { name: name, nature: button.link[3], isCard: true };
					if (name == "shan") return 2;
					if (evt.type == "dying") {
						if (get.attitude(player, evt.dying) < 2) return false;
						if (name == "jiu") return 2.1;
						return 1.9;
					}
					return player.getUseValue(card);
				}
				return 0;
			},
			backup: function (links, player) {
				if (typeof links[1] == "number") links.reverse();
				var equip = links[0];
				var name = links[1][2];
				var nature = links[1][3];
				return {
					check: function (card) {
						return 1 / Math.max(0.1, get.value(card));
					},
					filterCard() {
						return false;
					},
					selectCard: -1,
					equip: equip,
					viewAs: {
						name: name,
						nature: nature,
						isCard: true,
					},
					popname: true,
					precontent: function () {
						player.logSkill("shgengjue");
						player.disableEquip(lib.skill.shgengjue2_backup.equip);
						delete event.result.skill;
						var viewAs = {
							name: event.result.card.name,
							nature: event.result.card.nature,
						};
						player.markAuto("shgengjue2", viewAs);
					},
				};
			},
			prompt: function (links, player) {
				if (typeof links[1] == "number") links.reverse();
				var equip = "equip" + links[0];
				var name = links[1][2];
				var nature = links[1][3];
				return "废除自己的" + get.translation(equip) + "栏，视为使用" + get.translation(nature || "") + get.translation(name);
			},
		},
		ai: {
			respondSha: true,
			respondShan: true,
			order: 5,
			result: {
				player(player) {
					if (_status.event.dying) {
						return get.attitude(player, _status.event.dying);
					}
					return 1;
				},
			},
		},
		marktext: "②",
		intro: {
			content: "已因〖耕掘②〗使用过$",
			onunmark: true,
		},
		getBasicList2: function (event, player) {
			const vcards = [];
			for (let name of lib.inpile) {
				if (get.type(name) != "basic") continue;
				var inDiscardPile = function (name, nature) {
					for (var i = 0; i < ui.discardPile.childElementCount; i++) {
						if (name == "sha" && ui.discardPile.childNodes[i].name == name && get.nature(ui.discardPile.childNodes[i], false) == nature) return true;
						else if (ui.discardPile.childNodes[i].name == name) return true;
					}
					return false;
				};
				let card = { name: name, isCard: true };
				if (event.filterCard(card, player, event) && inDiscardPile(name, null)) vcards.push(["基本", "", name]);
				if (name == "sha") {
					for (let nature of lib.inpile_nature) {
						card.nature = nature;
						if (event.filterCard(card, player, event) && inDiscardPile(name, nature)) vcards.push(["基本", "", name, nature]);
					}
				}
			}
			return vcards;
		},
	},
	shgengjue3: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: ["chooseToUse", "chooseToRespond"],
		filter: function (event, player) {
			if (!player.countCards("hes", { type: "basic" }) || !player.storage || player.hasSkill("shgengjue3_blocker")) return false;
			return lib.skill.shgengjue3.getBasicList3(event, player).length && game.roundNumber >= 3;
		},
		chooseButton: {
			dialog: function (event, player) {
				const vcards = lib.skill.shgengjue3.getBasicList3(event, player);
				return ui.create.dialog("耕掘③", [vcards, "vcard"], "hidden");
			},
			filter: function (button, player) {
				return _status.event.getParent().filterCard(get.autoViewAs({ name: button.link[2], nature: button.link[3] }, "unsure"), player, _status.event.getParent());
			},
			check: function (button) {
				const player = _status.event.player;
				return player.getUseValue({
					name: button.link[2],
					nature: button.link[3],
				});
			},
			backup: function (links, player) {
				return {
					filterCard: card => get.type(card) == "basic",
					popname: true,
					check: function (card) {
						return 8 - get.value(card);
					},
					position: "hes",
					viewAs: { name: links[0][2], nature: links[0][3] },
					precontent: function () {
						player.logSkill("shgengjue");
						//delete event.result.skill;
						const cardx = event.result.card;
						player
							.when({ player: ["useCardAfter", "respondAfter"] })
							.filter(evt => evt.skill == "shgengjue3_backup")
							.vars({
								cardx: cardx,
							})
							.then(() => {
								var num = 0;
								if (player.storage.shgengjue1 && player.storage.shgengjue1.length && player.storage.shgengjue1.some(card => card.name == cardx.name)) {
									//game.log(player.storage.shgengjue1);
									num++;
								}
								if (player.storage.shgengjue2 && player.storage.shgengjue2.length && player.storage.shgengjue2.some(card => card.name == cardx.name)) {
									//game.log(player.storage.shgengjue2);
									num++;
								}
								if (num == 2) {
									player.draw();
									player.addTempSkill("shgengjue3_blocker");
								}
							});
					},
				};
			},
			prompt: function (links, player) {
				return "将一张基本牌当做" + (get.translation(links[0][3]) || "") + get.translation(links[0][2]) + "使用";
			},
		},
		hiddenCard: function (player, name) {
			if (!lib.inpile.includes(name)) return false;
			var type = get.type2(name);
			return type == "basic" && player.countCards("hes", { type: "basic" }) > 0;
		},
		ai: {
			respondSha: true,
			respondShan: true,
			skillTagFilter: function (player) {
				if (!player.countCards("hes", { type: "basic" })) return false;
			},
			order: 7,
			result: {
				player(player) {
					if (_status.event.dying) {
						return get.attitude(player, _status.event.dying);
					}
					return 1;
				},
			},
		},
		getBasicList3: function (event, player) {
			const list = [];
			for (let name of lib.inpile) {
				if (!player.storage.shgengjue1) player.storage.shgengjue1 = [];
				if (!player.storage.shgengjue2) player.storage.shgengjue2 = [];
				if (!player.storage.shgengjue1.some(card => get.name(card) == name) && !player.storage.shgengjue2.some(card => get.name(card) == name)) continue;
				if (name == "sha") {
					if (event.filterCard(get.autoViewAs({ name }, "unsure"), player, event)) list.push(["基本", "", "sha"]);
					for (var nature of lib.inpile_nature) {
						if (event.filterCard(get.autoViewAs({ name, nature }, "unsure"), player, event)) list.push(["基本", "", "sha", nature]);
					}
				} else if (get.type(name) == "basic" && event.filterCard(get.autoViewAs({ name }, "unsure"), player, event)) list.push(["基本", "", name]);
			}
			return list;
		},
		subSkill: {
			blocker: {},
		},
	},
	shgengjue: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		group: ["shgengjue1", "shgengjue2", "shgengjue3"],
	},
	shwoxuan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseUseBegin",
			global: "phaseUseEnd",
		},
		direct: true,
		filter: function (event, player) {
			return event.player.countCards("he") > 0;
		},
		async content(event, trigger, player) {
			const suit = get.suit(player.getExpansions("shbinhua")[0], false) | 0;
			if (event.triggername == "phaseUseBegin") {
				if (trigger.player != player || !player.storage.shwoxuan) return;
				const { bool, cards, targets } = await player
					.chooseCardTarget({
						prompt: get.prompt("shwoxuan"),
						prompt2: "将任意张牌交给一名其他角色，若交出牌不少于2，你不转换〖斡旋〗。",
						filterCard: true,
						selectCard: [1, Infinity],
						position: "he",
						filterTarget: lib.filter.notMe,
						ai1: function (card) {
							if (ui.selected.cards.length == 1 && get.event().player.getFriends().length > 2) return 12 - get.value(card);
							return 5 - get.value(card);
						},
						ai2: function (target) {
							var att = get.attitude(get.event().player, target);
							return att;
						},
					})
					.forResult();
				if (bool) {
					const target1 = targets[0];
					player.logSkill("shwoxuan");
					await player.give(cards, target1);
					if (cards.length < 2) player.changeZhuanhuanji("shwoxuan");
					const targets2 = (
						await player
							.chooseTarget(
								"令一名角色回复1点体力并复原武将牌",
								function (card, player, target) {
									return target.isDamaged();
								},
								true
							)
							.set("ai", function (target) {
								var player = get.event().player;
								var num = 0;
								var att = get.attitude(player, target);
								if (target.isTurnedOver()) num += Math.sign(att) * 5;
								if (target.isLinked()) num += Math.sign(att) * 1;
								return get.recoverEffect(target, player, player) + num;
							})
							.forResult()
					).targets;
					if (targets2.length) {
						await targets2[0].recover();
						await targets2[0].turnOver(false);
						await targets2[0].link(false);
					}
					return;
				}
			} else if (event.triggername == "phaseUseEnd") {
				if (trigger.player == player || player.storage.shwoxuan) return;
				const current = trigger.player;
				const cresult = await current
					.chooseCard("he", get.prompt("shwoxuan"), [1, Infinity], "交给" + get.translation(player) + "任意张牌，若交出牌数不多于2，其不转换〖斡旋〗。")
					.set("ai", card => {
						if (get.attitude(current, player) <= 0) return 0;
						else if (get.suit(card, player) == suit) return 12 - get.value(card);
						return 5 - get.value(card);
					})
					.forResult();
				if (cresult.bool) {
					current.logSkill("shwoxuan");
					await current.give(cresult.cards, player);
					if (cresult.cards.length > 2) player.changeZhuanhuanji("shwoxuan");
					return;
				}
			}
		},
		mark: true,
		locked: false,
		zhuanhuanji: true,
		marktext: "☯",
		intro: {
			content(storage, player, skill) {
				if (player.storage.shwoxuan == true) return "出牌阶段开始时，你可以将任意张牌交给一名其他角色，令一名角色回复1点体力并复原武将牌，若不少于两张，不转换〖斡旋〗。";
				return "其他角色出牌阶段结束时，其可以交给你任意张牌，若不多于两张，不转换〖斡旋〗。";
			},
		},
	},
	shbinhua: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			global: "phaseBefore",
			player: "enterGame",
		},
		forced: true,
		locked: false,
		direct: true,
		filter: function (event, player) {
			return event.name != "phase" || game.phaseNumber == 0;
		},
		async content(event, trigger, player) {
			const { bool, cards } = await player
				.chooseCard(get.prompt("shbinhua"), "将一张牌置于武将牌上")
				.set("ai", card => 20 - get.value(card))
				.forResult();
			if (bool) {
				player.logSkill("shbinhua");
				player.addToExpansion(cards, player, "give").gaintag.add("shbinhua");
				player.removeAdditionalSkill("shbinhua");
				player.addAdditionalSkill("shbinhua", ["shjijiu"]);
			}
		},
		marktext: "花",
		intro: {
			name: "花",
			name2: "花",
			content: "expansion",
			markcount: "expansion",
		},
	},
	shjijiu: {
		mod: {
			aiValue(player, card, num) {
				if (num <= 0 || get.itemtype(card) !== "card") return;
				if (!player.getExpansions("shbinhua").length || player.getExpansions("shbinhua").length != 1) return;
				const suit = get.suit(player.getExpansions("shbinhua")[0], false);
				if (get.name(card) != "tao" && get.suit(card) != suit) return;
				const cards = player.getCards("hs", card => get.name(card) == "tao" || get.suit(card) != suit);
				cards.sort((a, b) => (get.name(a) == "tao" ? 1 : 2) - (get.name(b) == "tao" ? 1 : 2));
				var geti = () => {
					if (cards.includes(card)) cards.indexOf(card);
					return cards.length;
				};
				return Math.max(num, [6.5, 4, 3, 2][Math.min(geti(), 2)]);
			},
			aiUseful() {
				return lib.skill.kanpo.mod.aiValue.apply(this, arguments);
			},
		},
		locked: false,
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "chooseToUse",
		viewAsFilter(player) {
			const suit = get.suit(player.getExpansions("shbinhua")[0], false);
			return player != _status.currentPhase && player.countCards("hes", { suit: suit }) > 0;
		},
		filterCard(card, player) {
			const suit = get.suit(player.getExpansions("shbinhua")[0], false);
			return get.suit(card) == suit;
		},
		position: "hes",
		viewAs: { name: "tao" },
		//prompt: "将一张红色牌当桃使用",
		prompt: function () {
			const suit = get.suit(_status.event.player.getExpansions("shbinhua")[0], false);
			return "将一张" + get.translation(suit) + "牌当桃使用";
		},
		check(card) {
			return 15 - get.value(card);
		},
		ai: {
			threaten: 1.5,
		},
	},
	shxingshao: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filterTarget: function (card, player, target) {
			return !target.isLinked() && target != player;
		},
		filter: function (event, player) {
			return !player.isLinked();
		},
		async content(event, trigger, player) {
			const target1 = event.target;
			await player.link(true);
			await target1.link(true);
			const result = await player
				.chooseTarget("对一名其他角色造成1点雷电伤害", lib.filter.notMe)
				.set("ai", target => {
					if (target == target1 && player.hp > 1) return 2 * target.countCards("he", card => get.value(card, player) > 5);
					return get.damageEffect(target, _status.event.player, _status.event.player, "thunder");
				})
				.set("forced", true)
				.forResult();
			if (result.bool) {
				const target2 = result.targets[0];
				await target2.damage("thunder");
				if (target1 != target2 || !target1.countCards("he")) return;
				await player.gainPlayerCard(target1, "he", true, [1, 2]);
			}
		},
		ai: {
			order: 9,
			result: {
				player(player, target) {
					if (
						player.hp == 1 &&
						!game.hasPlayer(current => {
							return current != player && current != target && get.damageEffect(current, player, player, "thunder") > 0;
						})
					)
						return 0;
					return 1;
				},
				target: -1,
			},
		},
	},
	shjinghun: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		unique: true,
		trigger: {
			global: "dieAfter",
		},
		filter: function (event, player) {
			return event.player != player;
		},
		direct: true,
		limited: true,
		skillAnimation: true,
		animationColor: "water",
		async content(event, trigger, player) {
			const list = [player.name];
			const chooselist = [];
			const target = trigger.player;
			if (!_status.characterlist) lib.skill.pingjian.initList();
			if (target.name1 && !target.isUnseen(0) && _status.characterlist.includes(target.name1)) {
				chooselist.push(target.name1);
			}
			if (target.name2 && !target.isUnseen(1) && _status.characterlist.includes(target.name1)) {
				chooselist.push(target.name2);
			}
			if (!chooselist.length) return;
			const result = await target
				.chooseBool("是否发动" + get.translation(player) + "的【鲸魂】，令其将你的一张武将牌置为其副将？")
				.set("ai", function () {
					return get.attitude(target, player) > 0;
				})
				.forResult();
			if (result.bool) {
				await target.logSkill("shjinghun", player);
				player.awakenSkill("shjinghun");
				target.addExpose(0.4);
				await player.draw(2);
				if (chooselist.length == 1) {
					list.push(chooselist[0]);
					lib.skill.shjinghun.addCharacter2(list, player);
				} else {
					const { bool, links } = await target
						.chooseButton(["鲸魂：选择一张武将牌置为" + get.translation(player) + "的副将", [chooselist, "character"]], true)
						.set("ai", button => {
							const character = button.link;
							const Rarity = game.getRarity(character);
							//game.log(Rarity)
							var num = 1;
							switch (Rarity) {
								case "junk": {
									num += -1;
									break;
								}
								case "common": {
									num += 0;
									break;
								}
								case "rare": {
									num += 2;
									break;
								}
								case "epic": {
									num += 4;
									break;
								}
								case "legend": {
									num += 8;
									break;
								}
							}
							return num;
						})
						.forResult();
					if (bool) {
						const character = links[0];
						list.push(character);
						lib.skill.shjinghun.addCharacter2(list, player);
					}
				}
				const jinghunCards = player.getCards("h");
				await player.addShownCards(jinghunCards, "visible_shjinghun");
				player.addSkill("shjinghun_sha");
				player.addSkill("shjinghun_clear");
			}

			//lib.skill.shjinghun.removeCharacter2(player);
		},
		ai: {
			threaten: 4,
		},
		subSkill: {
			sha: {
				mod: {
					cardname: function (card) {
						if (card.hasGaintag("visible_shjinghun")) return "sha";
					},
					cardnature(card, player) {
						if (card.hasGaintag("visible_shjinghun")) return "thunder";
					},
					targetInRange: function (card, player, target) {
						if (!card.cards || card.cards.length != 1) return;
						for (var i of card.cards) {
							if (i.hasGaintag("visible_shjinghun")) return true;
						}
					},
					cardUsable: function (card, player) {
						if (!card.cards || card.cards.length != 1) return;
						for (var i of card.cards) {
							if (i.hasGaintag("visible_shjinghun")) return true;
						}
					},
				},
				ai: {
					effect: {
						target(card, player, target, current) {
							if (get.tag(card, "respondSha") && current < 0) return 0.6;
						},
					},
					respondSha: true,
				},
				sub: true,
			},
			clear: {
				trigger: {
					player: "loseAfter",
					global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
				},
				forced: true,
				popup: false,
				charlotte: true,
				filter: function (event, player) {
					if (player.countCards("h", card => card.hasGaintag("visible_shjinghun"))) return false;
					var evt = event.getl(player);
					return evt && evt.hs && evt.hs.length;
				},
				async content(event, trigger, player) {
					lib.skill.shjinghun.removeCharacter2(player);
					player.removeSkill("shjinghun_sha");
					player.removeSkill("shjinghun_clear");
				},
				sub: true,
			},
		},
		addCharacter2: function (list, player) {
			game.broadcastAll(
				function (player, list) {
					if (player.name2) {
						const skills2 = lib.character[player.name2][3].filter(skill => {
							return !lib.character[player.name1][3].includes(skill);
						});
						_status.characterlist.add(player.name2);
						player.removeSkill(skills2);
					}
					player.name1 = list[0];
					player.node.avatar.setBackground(list[0], "character");
					player.node.name.innerHTML = get.slimName(list[0]);
					player.name2 = list[1];
					player.classList.add("fullskin2");
					player.node.avatar2.classList.remove("hidden");
					player.node.avatar2.setBackground(list[1], "character");
					player.node.name2.innerHTML = get.slimName(list[1]);
					game.log(list[1], "成为了", player, "的副将");
					_status.characterlist.remove(list[1]);
					const skills = lib.character[list[1]][3].filter(skill => {
						var info = get.info(skill);
						if (info && info.zhuSkill && !player.isZhu2()) return false;
						return true;
					});
					player.addSkill(skills);
					if (player == game.me && ui.fakeme) {
						ui.fakeme.style.backgroundImage = player.node.avatar.style.backgroundImage;
					}
				},
				player,
				list
			);
			/*if(player.name)game.log('name=',player.name)
                    if(player.name1)game.log('name1=',player.name1)
                    if(player.name2)game.log('name2=',player.name2)*/
		},
		removeCharacter2: function (player) {
			game.broadcastAll(function (player) {
				//player.name=list[0];
				const name2 = player.name2;
				const name1 = player.name;
				player.name1 = player.name;
				player.smoothAvatar(false);
				player.node.avatar.setBackground(player.name, "character");
				player.node.name.innerHTML = get.slimName(player.name);
				delete player.name2;
				player.classList.remove("fullskin2");
				player.node.avatar2.classList.add("hidden");
				player.node.name2.innerHTML = "";
				game.log(player, "移去了副将");
				_status.characterlist.add(name2);
				const skills = lib.character[name2][3].filter(skill => {
					return !lib.character[name1][3].includes(skill);
				});
				player.removeSkill(skills);
				if (player == game.me && ui.fakeme) {
					ui.fakeme.style.backgroundImage = player.node.avatar.style.backgroundImage;
				}
			}, player);
			/*if(player.name)game.log('name=',player.name)
                    if(player.name1)game.log('name1=',player.name1)
                    if(player.name2)game.log('name2=',player.name2)*/
		},
	},
	shyinzi: {
		trigger: {
			player: "phaseDrawBegin2",
		},
		frequent: true,
		filter(event, player) {
			return !event.numFixed;
		},
		async content(event, trigger, player) {
			trigger.num += 3;
			player.addTempSkill("shyinzi_End");
		},
		ai: {
			threaten: 1.3,
		},
		subSkill: {
			End: {
				trigger: {
					player: "phaseDrawEnd",
				},
				forced: true,
				popup: false,
				audio: false,
				async content(event, trigger, player) {
					player.removeSkill("shyinzi_End");
					if (
						game.hasPlayer(current => {
							return current != player && current.hasSex("female");
						})
					) {
						const result = await player
							.chooseControl()
							.set("choiceList", ["将两张牌交给一名其他女性角色，与其各回复1点体力", "弃置两张牌"])
							.set("ai", function () {
								if (
									game.hasPlayer(function (current) {
										return current != player && current.hasSex("female") && get.attitude(player, current) > 2;
									})
								)
									return 0;
								return 1;
							})
							.forResult();
						if (result?.index == 0) {
							const { bool, cards, targets } = await player
								.chooseCardTarget({
									position: "he",
									filterCard: true,
									selectCard: 2,
									filterTarget: function (card, player, target) {
										return player != target && target.hasSex("female");
									},
									ai1: function (card) {
										return 1;
									},
									ai2: function (target) {
										var att = get.attitude(_status.event.player, target);
										return att;
									},
									prompt: "请选择要送人的卡牌",
									forced: true,
								})
								.forResult();
							if (!bool || !targets || !targets.length || !cards || !cards.length) return;
							await player.give(cards, targets[0]);
							//await player.recover();
							await targets[0].recover();
						} else if (result.index == 1) await player.chooseToDiscard(2, true, "he");
					} else {
						await player.chooseToDiscard(2, true, "he");
					}
				},
			},
		},
	},
	shxuanfeng: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseDiscardAfter",
		},
		async cost(event, trigger, player) {
			const chooseList = lib.skill.shxuanfeng.getChooseMaxValueList(trigger, player);
			const list = [];
			let choiceList = ["弃置任意名角色共计两张牌", "移动场上一张牌"];
			if (
				game.hasPlayer(current =>
					current.hasCard(function (card) {
						return lib.filter.canBeDiscarded(card, player, current);
					}, "he")
				)
			)
				list.push("弃牌");
			else choiceList[0] = '<span style="opacity:0.5; ">' + choiceList[0] + "</span>";
			if (player.canMoveCard()) list.push("移动牌");
			else choiceList[1] = '<span style="opacity:0.5; ">' + choiceList[1] + "</span>";
			list.push("cancel2");
			const result = await player
				.chooseControl(list)
				.set("prompt", get.prompt("shxuanfeng"))
				.set("choiceList", choiceList)
				.set("ai", () => {
					if (list.includes("移动牌") && chooseList[0][0] == "移动牌" && player.canMoveCard(true)) return "移动牌";
					if (list.includes("弃牌") && chooseList[0][0] == "弃牌") return "弃牌";
					if (chooseList[0][0] == "cancel2") return "cancel2";
					return list[0];
				})
				.forResult();
			event.result = {
				bool: result.control != "cancel2",
				cost_data: result.control,
			};
		},
		async content(event, trigger, player) {
			const chooseList = lib.skill.shxuanfeng.getChooseMaxValueList(trigger, player);
			if (event.cost_data == "弃牌") {
				var count = 2;
				do {
					const result = await player
						.chooseTarget(
							"弃置一名角色的" + (count == 2 ? "一至两" : "一") + "张牌",
							function (card, player, target) {
								return target.countDiscardableCards(player, "he");
							},
							true
						)
						.set("ai", function (target) {
							if (ui.selected.cards.length) return 0;
							if (chooseList[0][1].includes(target)) return 30;
							return -get.attitude(_status.event.player, target);
						})
						.forResult();
					if (result.bool) {
						player.line(result.targets[0], "green");
						const result2 = await player.discardPlayerCard([1, count], result.targets[0], "he", true).forResult();
						count -= result2.links.length | 1;
					}
				} while (
					count > 0 &&
					game.hasPlayer(current =>
						current.hasCard(function (card) {
							return lib.filter.canBeDiscarded(card, player, current);
						}, "he")
					)
				);
			} else if (event.cost_data == "移动牌") await player.moveCard(true);
			var min =
				player
					.getHistory("lose")
					.map(evt => {
						if (evt.getParent("phaseDiscard") != trigger || evt.player != player) return 0;
						return evt.cards2.length;
					})
					.reduce((p, c) => p + c, 0) | 0;
			const targets = [];
			for (const current of game.filterPlayer()) {
				const num =
					current
						.getHistory("lose")
						.map(evt => {
							if (evt.getParent("phaseDiscard") != trigger || evt.player != current) return 0;
							return evt.cards2.length;
						})
						.reduce((p, c) => p + c, 0) | 0;
				//game.log(current,':',num);
				if (num <= min) {
					min = num;
					targets.add(current);
				}
			}
			targets.sortBySeat();
			//game.log('min=',min)
			for (const current of targets) {
				const num =
					current
						.getHistory("lose")
						.map(evt => {
							if (evt.getParent("phaseDiscard") != trigger || evt.player != current) return 0;
							return evt.cards2.length;
						})
						.reduce((p, c) => p + c, 0) | 0;
				if (num == min) {
					//game.log(current,':',num);
					await current.damage();
				}
			}
		},
		getChooseMaxValueList: function (event, player) {
			var choosesList = [];
			var valueList = [["cancel2"], 0];
			const isMinLosePlayer = function (event, target, loseList00, loseList01, loseList10, loseList11) {
				const loseList = [
					[loseList00, loseList01],
					[loseList10, loseList11],
				];
				var num =
					target
						.getHistory("lose")
						.map(evt => {
							if (evt.getParent("phaseDiscard") != event || evt.player != target) return 0;
							return evt.cards2.length;
						})
						.reduce((p, c) => p + c, 0) | 0;
				if (loseList[0].includes(target)) num += loseList[0][1];
				if (loseList[1].includes(target)) num += loseList[1][1];
				const bool = game.hasPlayer(current => {
					var numx =
						current
							.getHistory("lose")
							.map(evt => {
								if (evt.getParent("phaseDiscard") != event || evt.player != current) return 0;
								return evt.cards2.length;
							})
							.reduce((p, c) => p + c, 0) | 0;
					if (loseList[0].includes(current)) numx += loseList[0][1];
					if (loseList[1].includes(current)) numx += loseList[1][1];
					return numx < num;
				});
				return !bool;
			};
			const chooseBoolList = [[true, true, true], [true, true, false], [true, false], [false]];
			const getChooseMaxList = function (event, player, chooseBool) {
				if (chooseBool[0] == false) {
					return [["cancel2"], 0];
				} else if (chooseBool[0] == true) {
					if (chooseBool[1] == false) {
						player.canMoveCard(true, true);
						choosesList = [["移动牌", [player]], 0];
						var targetList = [player];
						var MaxValue = -5;
						for (const target of game.filterPlayer(current => player.canMoveCard(null, true, [current], game.filterPlayer()))) {
							var Value = 0;
							if (get.attitude(player, target) < 0) Value += 3;
							const loseList = [
								[target, 1],
								[target, 0],
							];
							for (var current of game.filterPlayer()) {
								if (isMinLosePlayer(event, current, loseList[0][0], loseList[0][1], loseList[1][0], loseList[1][1])) {
									if (current == player) Value -= 9 * (5 - player.hp);
									if (get.attitude(player, current) < 0) Value += Math.abs(2 * get.damageEffect(current, player, current));
									else Value -= get.attitude(player, current) * (5 - current.hp);
								}
							}
							if (Value > MaxValue) {
								MaxValue = Value;
								targetList[0] = target;
							}
						}
						choosesList[0][1] = targetList;
						choosesList[1] = MaxValue;
					} else if (chooseBool[1] == true) {
						choosesList = [["弃牌", [player, player]], 0];
						var targetList = [player, player];
						var MaxValue = -5;
						for (const target1 of game.filterPlayer(current =>
							current.hasCard(function (card) {
								return lib.filter.canBeDiscarded(card, player, current);
							}, "he")
						)) {
							var Value = 0;
							if (get.attitude(player, target1) < 0) Value += Math.abs(get.effect(target1, { name: "guohe_copy2" }, player, player));
							else {
								Value -= get.attitude(player, target1) / 2;
							}
							if (chooseBool[2] == false) {
								for (const target2 of game.filterPlayer(
									current =>
										current != target1 &&
										current.hasCard(function (card) {
											return lib.filter.canBeDiscarded(card, player, current);
										}, "he")
								)) {
									if (get.attitude(player, target2) < 0) Value += Math.abs(get.effect(target2, { name: "guohe_copy2" }, player, player));
									else Value -= get.attitude(player, target2) / 3;
									const loseList = [
										[target1, 1],
										[target2, 1],
									];
									for (var current of game.filterPlayer()) {
										if (isMinLosePlayer(event, current, loseList[0][0], loseList[0][1], loseList[1][0], loseList[1][1])) {
											if (current == player) Value -= 9 * (5 - player.hp);
											else if (get.attitude(player, current) < 0) Value += Math.abs(2 * get.damageEffect(current, player, current));
											else Value -= get.attitude(player, current) * (5 - current.hp);
										}
									}
									if (Value > MaxValue) {
										MaxValue = Value;
										targetList[0] = target1;
										targetList[1] = target2;
									}
									// game.log('操作：',choosesList[0][0],'对象：',get.translation(targetList),'收益：',Value)
								}
							} else if (chooseBool[2] == true) {
								if (get.attitude(player, target1) < 0) Value += Math.abs(get.effect(target1, { name: "guohe_copy2" }, player, player));
								else Value -= get.attitude(player, target1) / 3;
								const loseList = [
									[target1, 1],
									[target1, 1],
								];
								for (var current of game.filterPlayer()) {
									if (isMinLosePlayer(event, current, loseList[0][0], loseList[0][1], loseList[1][0], loseList[1][1])) {
										if (current == player) Value -= 9 * (5 - player.hp);
										if (get.attitude(player, current) < 0) Value += Math.abs(2 * get.damageEffect(current, player, current));
										else Value -= get.attitude(player, current) * (5 - current.hp);
										//if()
									}
								}

								if (Value > MaxValue) {
									MaxValue = Value;
									targetList[0] = target1;
									targetList[1] = target1;
								}
								//game.log('操作：',choosesList[0][0],'对象：',get.translation(targetList),'收益：',Value)
							}
						}
						choosesList[0][1] = targetList;
						choosesList[1] = MaxValue;
					}
				}
				return choosesList;
			};
			var maxvalue = -10;
			for (var chooseBool of chooseBoolList) {
				var list = getChooseMaxList(event, player, chooseBool);
				var value = list[1];
				//game.log('操作：',list[0][0],'对象：',get.translation(list[0][1]),'收益：',list[1])
				if (value > maxvalue) {
					maxvalue = value;
					valueList = list;
				}
			}
			// game.log('最终操作：',valueList[0][0],'对象：',get.translation(valueList[0][1]),'收益：',valueList[1])
			return valueList;
		},
	},
	shzhebang: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		enable: "phaseUse",
		usable: 1,
		filter(event, player) {
			return player.countCards("h", { name: "sha" });
		},
		filterCard: {
			name: "sha",
		},
		selectCard: [1, Infinity],
		check: function (card) {
			if (ui.selected.cards.length) return 0;
			return 6.5 - get.value(card);
		},
		discard: false,
		lose: false,
		delay: false,
		async content(event, trigger, player) {
			const num = 2 * event.cards.length;
			await player.discard(event.cards);
			player.addTempSkill("shzhebang_draw");
			player.chooseUseTarget(
				{
					name: "juedou",
					isCard: true,
					storage: { shzhebang: num },
				},
				true
			);
		},
		ai: {
			order: 10,
			result: {
				player: 1,
			},
			threaten: 1.5,
		},
		subSkill: {
			draw: {
				trigger: {
					global: "damageSource",
				},
				filter: function (event, player) {
					return event.card && event.card.storage && event.card.storage.shzhebang && event.card.storage.shzhebang > 0 && player.isIn() && event.getParent(2).targets.includes(event.player);
				},
				direct: true,
				forced: true,
				charlotte: true,
				async content(event, trigger, player) {
					await player.draw(trigger.card.storage.shzhebang);
				},
				sub: true,
			},
		},
	},
	shyijiao: {
		locked: true,
		mod: {
			cardname: function (card, player) {
				if (player.countCards("h") % 2 != 0) return "sha";
			},
			targetInRange: function (card, player, target) {
				if (player.countCards("h") % 2 != 0) return true;
			},
		},
		ai: {
			unequip: true,
			unequip_ai: true,
			skillTagFilter: function (player, tag, arg) {
				if (arg && arg.name == "sha") return true;
				return false;
			},
			respondSha: true,
		},
	},
	shtouchui: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			target: "useCardToTargeted",
		},
		filter: function (event, player) {
			return get.tag(event.card, "damage") && player.countCards("h", { name: "sha" });
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseToDiscard(get.prompt("shtouchui", trigger.player), "弃置一张杀并对" + get.translation(trigger.player) + "造成1点伤害", { name: "sha" })
				.set("ai", function (card) {
					if (get.attitude(_status.event.player, trigger.player) >= 0) return 0;
					return 7 - get.value(card);
				})
				.setHiddenSkill(event.name)
				.forResult();
		},
		popup: false,
		async content(event, trigger, player) {
			player.logSkill(event.name, trigger.player);
			await trigger.player.damage("nocard");
		},
	},
	shfeixing: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		mod: {
			aiOrder: function (player, card, num) {
				if (typeof card == "object" && player == _status.currentPhase) {
					if (player.hasSkill("shzhengxuan")) {
						if (
							get.name(card) == "sha" &&
							game.hasPlayer(current => {
								return get.distance(current, player) <= 1 && get.attitude(player, current) <= 0;
							})
						)
							return num + 8;
					}
					if (get.subtype(card) == "equip3") return num + 10;
				}
			},
		},
		locked: false,
		trigger: {
			player: "useCardToPlayered",
		},
		filter(event, player) {
			const suit = get.suit(event.card);
			//game.log(player.getHistory("useCard", evt => (evt != event.getParent() && get.suit(evt.card) == suit && evt.targets && evt.targets.length)).length)
			if (!event.isFirstTarget || _status.dying.length) return false;
			if (!lib.suit.includes(suit)) return false;
			if (player.getHistory("useCard", evt => evt != event.getParent() && get.suit(evt.card) == suit && evt.targets && evt.targets.length).length) return false;
			return game.hasPlayer(current => {
				return get.distance(current, player) > 1 && player.inRange(current);
			});
		},
		async cost(event, trigger, player) {
			const suit = get.suit(trigger.card);
			event.result = await player
				.chooseTarget(get.prompt("shfeixing"), "令攻击范围内一名与你距离大于1的角色打出一张" + get.translation(get.suit(trigger.card)) + "杀或闪，否则受到你造成的1点伤害。", (card, player, target) => {
					return get.distance(target, player) > 1 && player.inRange(target);
				})
				.set("ai", target => {
					const player = get.event().player;
					return get.damageEffect(target, player, player);
				})
				.forResult();
		},
		async content(event, trigger, player) {
			const target = event.targets[0];
			const suit = get.suit(trigger.card);
			const result = await target
				.chooseToRespond((card, player) => {
					return get.suit(card) == suit && (get.name(card) == "sha" || get.name(card) == "shan");
				})
				.set("ai", function (card) {
					const player = get.event().player;
					if (player.hasSkillTag("nodamage")) return 0;
					return get.order(card);
				})
				.forResult();
			await game.delay();
			if (!result.bool) {
				await target.damage("nocard");
			}
		},
	},
	shzhengxuan: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			player: ["useCardAfter", "respondAfter"],
		},
		usable: 1,
		filter: function (event, player) {
			return event.card.name == "sha" || event.card.name == "shan";
		},
		async content(event, trigger, player) {
			await player.draw();
			const { control } = await player
				.chooseControl(["进攻", "防御"])
				.set("ai", function () {
					const player = get.event().player;
					if (
						!game.hasPlayer(current => {
							return get.distance(current, player) <= 1 && get.attitude(player, current) <= 0;
						}) &&
						player == _status.currentPhase
					)
						return "进攻";
					return "防御";
				})
				.forResult();
			if (control) {
				if (control == "进攻") {
					if (!player.storage.shzhengxuan_blocker) player.setStorage("shzhengxuan_blocker", [0, 0]);
					player.addTempSkill("shzhengxuan_blocker", "roundStart");
					player.storage.shzhengxuan_blocker[0]++;
				} else if (control == "防御") {
					if (!player.storage.shzhengxuan_blocker) player.setStorage("shzhengxuan_blocker", [0, 0]);
					player.addTempSkill("shzhengxuan_blocker", "roundStart");
					player.storage.shzhengxuan_blocker[1]++;
				}
			}
		},
		subSkill: {
			blocker: {
				charlotte: true,
				mod: {
					globalFrom(from, to, distance) {
						return distance - from.getStorage("shzhengxuan_blocker")[0];
					},
					globalTo: function (from, to, distance) {
						return distance + to.getStorage("shzhengxuan_blocker")[1];
					},
				},
				onremove: function (player, skill) {
					player.storage.shzhengxuan_blocker = [0, 0];
				},
				mark: true,
				intro: {
					content: (storage, player) => {
						var str = ``;
						if (player.storage.shzhengxuan_blocker[0] > 0) str += `<li>本轮内你计算与其他角色距离-${player.storage.shzhengxuan_blocker[0]}`;
						if (player.storage.shzhengxuan_blocker[1] > 0) str += `<li>本轮内其他角色计算与你距离+${player.storage.shzhengxuan_blocker[1]}`;
						return str;
					},
				},
				sub: true,
			},
		},
	},

	shjilang: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		filter: function (event, player) {
			return game.hasPlayer(current => lib.skill.shjilang.filterTarget(null, player, current));
		},
		filterTarget: function (card, player, target) {
			return target.countCards("h") == player.countCards("h") - 1;
		},
		async content(event, trigger, player) {
			const target = event.target;
			await player.swapHandcards(target);
			const result = await player
				.chooseBool("是否对" + get.translation(target) + "造成1点雷电伤害？")
				.set("ai", function () {
					const player = get.event().player;
					return get.damageEffect(target, player, player, "thunder") > 0;
				})
				.forResult();
			if (result?.bool) {
				target.damage("thunder");
			}
		},
		ai: {
			order: 10,
			result: {
				player: 1,
			},
		},
	},
	shfanjiang: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseJieshuBegin",
		},
		filter(event, player) {
			return !player.isMaxHandcard();
		},
		check: function (event, player) {
			const num = game.findPlayer(current => current.isMaxHandcard()).countCards("h");
			const x = num - player.countCards("h");
			if (x < 3) return false;
			return true;
		},
		async content(event, trigger, player) {
			const num = game.findPlayer(current => current.isMaxHandcard()).countCards("h");
			await player.drawTo(num);
			const list = [];
			let choiceList = ["翻面", "将手牌弃至全场最低", "背水！翻面一名其他角色并执行所有选项"];
			list.push("选项一");
			if (!player.isMinHandcard()) list.push("选项二");
			else choiceList[1] = '<span style="opacity:0.5; ">' + choiceList[1] + "</span>";
			if (list.length == 2) list.push("背水！");
			else choiceList[2] = '<span style="opacity:0.5; ">' + choiceList[1] + "</span>";
			const { control } = await player
				.chooseControl(list)
				.set("choiceList", choiceList)
				.set("ai", function () {
					const num = game.findPlayer(current => current.isMinHandcard()).countCards("h");
					if (list.includes("选项二") && player.countCards("h") - num < 2) return "选项二";
					return list[0];
				})
				.forResult();
			if (control) {
				if (control == "背水！") {
					const targets = (
						await player
							.chooseTarget(
								"令一名其他角色翻面",
								(card, player, target) => {
									return target != get.event().player;
								},
								true
							)
							.set("ai", target => {
								const player = get.event().player;
								if (target.hasSkillTag("noturn")) return 0;
								if (target.isTurnedOver()) return get.attitude(player, target) / 2;
								return -get.attitude(player, target);
							})
							.forResult()
					).targets;
					if (targets && targets.length > 0) {
						await targets[0].turnOver();
					}
				}
				if (control == "选项一" || control == "背水！") {
					await player.turnOver();
				}
				if (control == "选项二" || control == "背水！") {
					const num = game.findPlayer(current => current.isMinHandcard()).countCards("h");
					if (num < player.countCards("h")) {
						player.chooseToDiscard(player.countCards("h") - num, true, "h");
					}
				}
			}
		},
	},
	shpudou: {
		mod: {
			aiValue(player, card, num) {
				if (num <= 0 || get.itemtype(card) !== "card") return;
				if (get.name(card) == "sha") return num + 10;
				if (get.name(card) == "shan") return num / 10;
				return num;
			},
			aiUseful() {
				return lib.skill.shpudou.mod.aiValue.apply(this, arguments);
			},
			aiOrder(player, card, num) {
				if (typeof card == "object" && player.isPhaseUsing()) {
					if ((get.position(card) == "h" || get.position(card) == "s") && get.name(card) == "sha" && player.countCards("h") <= player.getHandcardLimit()) return -1;
				}
			},
		},
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			target: "useCardToTargeted",
		},
		forced: true,
		filter: function (event, player) {
			if (event.targets.length != 1) return false;
			return event.card.name == "sha" && get.color(event.card) == "black";
		},
		async content(event, trigger, player) {
			trigger.card.name = "juedou";
		},
	},
	shdengfeng: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		group: ["shdengfeng1", "shdengfeng_draw", "shdengfeng_use", "shdengfeng_discard"],
		subSkill: {
			draw: {
				trigger: {
					player: "phaseDrawBegin1",
				},
				direct: true,
				filter: function (event, player) {
					const card = { name: "juedou", isCard: true };
					return player.hasUseTarget(card);
				},
				async content(event, trigger, player) {
					const phasename = get.translation(trigger.name);
					const card = { name: "juedou", isCard: true };
					//game.log(phasename);
					const result = await player
						.chooseUseTarget(card, get.prompt("shdengfeng"), "跳过下个回合的" + phasename + "视为使用一张【决斗】，然后将此阶段摸牌数改为你已损失体力值。", false)
						.set("ai", function (target) {
							const player = get.event().player;
							const card = { name: "juedou", isCard: true };
							const num = Math.max(0, player.getDamagedHp() - 2);
							return get.effect(player, card, target, player) + num;
						})
						.set("logSkill", "shdengfeng")
						.forResult();
					if (result.bool) {
						player.storage.shdengfeng_nextSkips.add(phasename);
						await player.draw(player.getDamagedHp());
						trigger.changeToZero();
					}
				},
			},
			use: {
				trigger: {
					player: "phaseUseBegin",
				},
				direct: true,
				filter: function (event, player) {
					const card = { name: "juedou", isCard: true };
					return player.hasUseTarget(card);
				},
				async content(event, trigger, player) {
					const phasename = get.translation(trigger.name);
					const card = { name: "juedou", isCard: true };
					//game.log(phasename);
					const result = await player
						.chooseUseTarget(card, get.prompt("shdengfeng"), "跳过下个回合的" + phasename + "视为使用一张【决斗】，然后将此阶段出杀数改为你已损失体力值。", false)
						.set("ai", function (target) {
							const player = get.event().player;
							const card = { name: "juedou", isCard: true };
							return get.effect(player, card, target, player);
						})
						.set("logSkill", "shdengfeng")
						.forResult();
					if (result.bool) {
						player.storage.shdengfeng_nextSkips.add(phasename);
						player.addTempSkill("shdengfeng2", "phaseUseAfter");
					}
				},
			},
			discard: {
				trigger: {
					player: "phaseDiscardBegin",
				},
				direct: true,
				filter: function (event, player) {
					const card = { name: "juedou", isCard: true };
					return player.hasUseTarget(card);
				},
				async content(event, trigger, player) {
					const list = [];
					const phasename = get.translation(trigger.name);
					const card = { name: "juedou", isCard: true };
					//game.log(phasename);
					const result = await player
						.chooseUseTarget(card, get.prompt("shdengfeng"), "跳过下个回合的" + phasename + "视为使用一张【决斗】，然后将此阶段摸牌数改为你已损失体力值。", false)
						.set("ai", function (target) {
							const player = get.event().player;
							const card = { name: "juedou", isCard: true };
							const num = Math.max(0, player.getDamagedHp() - player.hp);
							return get.effect(player, card, target, player) + num;
						})
						.set("logSkill", "shdengfeng")
						.forResult();
					if (result.bool) {
						player.storage.shdengfeng_nextSkips.add(phasename);
						player.addTempSkill("shdengfeng2", "phaseDiscardAfter");
					}
				},
			},
		},
	},
	shdengfeng1: {
		trigger: {
			player: "phaseBegin",
		},
		charlotte: true,
		forced: true,
		popup: false,
		async content(event, trigger, player) {
			if (!player.storage.shdengfeng_Skips) player.storage.shdengfeng_Skips = [];
			if (!player.storage.shdengfeng_nextSkips) player.storage.shdengfeng_nextSkips = [];
			player.storage.shdengfeng_Skips.addArray(player.storage.shdengfeng_nextSkips);
			player.storage.shdengfeng_nextSkips = [];
			player.addTempSkill("shdengfeng3");
		},
	},
	shdengfeng2: {
		mod: {
			cardUsable: function (card, player, num) {
				if (card.name == "sha") return player.getDamagedHp();
			},
			maxHandcardBase: function (player, num) {
				if (_status.event.name == "phaseDiscard" || _status.event.getParent("phaseDiscard").name == "phaseDiscard") return player.getDamagedHp();
			},
		},
	},
	shdengfeng3: {
		charlotte: true,
		onremove: function (player, skill) {
			player.storage.shdengfeng_Skips = [];
		},
		mark: true,
		intro: {
			content: (storage, player) => {
				var str = "";
				if (player.storage.shdengfeng_Skips && player.storage.shdengfeng_Skips.length) str += "<li>跳过本回合的" + get.translation(player.storage.shdengfeng_Skips);
				if (player.storage.shdengfeng_nextSkips && player.storage.shdengfeng_nextSkips.length) str += "<li>跳过下回合的" + get.translation(player.storage.shdengfeng_nextSkips);
				return str;
			},
		},
		trigger: {
			player: ["phaseDrawBefore", "phaseUseBefore", "phaseDiscardBefore"],
		},
		direct: true,
		async content(event, trigger, player) {
			const phasename = get.translation(trigger.name);
			if (player.storage.shdengfeng_Skips.includes(phasename)) {
				player.logSkill("shdengfeng");
				await trigger.cancel();
			}
		},
	},
	shqiujin: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		filter: function (event, player) {
			return !player.hasSkill("shqiujin_blocker");
		},
		filterTarget: function (card, player, target) {
			return target != player && (target.hp > player.hp || target.countCards("h") > player.countCards("h"));
		},
		filterCard: function (card, player) {
			if (ui.selected.cards.length) {
				for (var i of ui.selected.cards) {
					if (get.suit(card) == get.suit(i)) return false;
				}
			}
			return lib.suit.includes(get.suit(card));
		},
		selectCard: function () {
			return (_status.event.player.getStat("skill").shqiujin | 0) + 1;
		},
		position: "he",
		complexCard: true,
		discard: false,
		visible: true,
		prepare: "throw",
		loseTo: "discardPile",
		delay: 0.5,
		check: function (card) {
			return 7 - get.value(card);
		},
		async content(event, trigger, player) {
			const target = event.target;
			const suits = event.cards.map(card => get.suit(card, false));
			const cmpsuits = lib.suit.filter(suit => !suits.includes(suit));
			const num = 4 - event.cards.length;
			await player.draw(event.cards.length);
			if (num > 0) {
				const result = await target
					.chooseCard("he", num, "交给" + get.translation(player) + get.translation(cmpsuits) + "花色的牌各一张并令其本回合虬劲失效，否则你受到其1点雷电伤害", function (card) {
						if (ui.selected.cards.length) {
							for (var i of ui.selected.cards) {
								if (get.suit(card) == get.suit(i)) return false;
							}
						}
						return cmpsuits.includes(get.suit(card, false));
					})
					.set("complexCard", true)
					.set("ai", function (card) {
						if (num < 3) return 10 - get.value(card);
						return 7 - get.value(card);
					})
					.forResult();
				if (result.bool) {
					target.give(result.cards, player, "give");
					await player.addTempSkill("shqiujin_blocker");
				} else {
					await target.damage("thunder");
				}
			} else await target.damage("thunder");
		},
		ai: {
			order: 10,
			threaten: 2.4,
			expose: 0.2,
			result: {
				target: -1,
			},
		},
		subSkill: {
			blocker: {},
		},
	},
	shduanming: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		locked: false,
		enable: "chooseToUse",
		filterCard(card) {
			return get.color(card) == "black";
		},
		position: "hes",
		viewAs: {
			name: "sha",
			nature: "thunder",
			storage: {
				shduanming: true,
			},
		},
		viewAsFilter(player) {
			if (!player.countCards("hes", { color: "black" })) return false;
		},
		prompt: "将一张黑色牌当雷杀使用",
		check(card) {
			const val = get.value(card);
			return 5 - val;
		},
		ai: {
			order: function () {
				return Math.max(get.order({ name: "sha", nature: "thunder" }), get.order({ name: "sha" })) + 0.7;
			},
			result: {
				player: 1,
			},
		},
		mod: {
			selectTarget: function (card, player, range) {
				if (card.storage && card.storage.shduanming && range[1] != -1) range[1]++;
			},
			targetInRange: function (card) {
				if (card.storage && card.storage.shduanming) return true;
			},
			aiOrder(player, card, num) {
				if (get.name(card) == "tiesuo") return num + 10;
			},
			aiValue(player, card, num) {
				if (num <= 0 || get.itemtype(card) !== "card") return;
				if (get.color(card) == "black") return num + 1.5;
				else if (get.name(card) == "tiesuo") return num + 3;
				return num;
			},
			aiUseful() {
				return lib.skill.shduanming.mod.aiValue.apply(this, arguments);
			},
		},
		group: "shduanming_miss",
		subSkill: {
			miss: {
				trigger: {
					player: "shaMiss",
				},
				forced: true,
				filter: function (event, player) {
					if (!event.targets || !event.targets.some(current => !current.isLinked())) return false;
					return event.card.storage && event.card.storage.shduanming;
				},
				async content(event, trigger, player) {
					const candidates = trigger.targets;
					const { bool, targets } = await player
						.chooseTarget("横置任意名目标角色", [1, candidates.length], function (card, player, target) {
							return candidates.includes(target) && !target.isLinked();
						})
						.set("ai", function (target) {
							return -get.attitude(_status.event.player, target);
						})
						.forResult();
					if (bool) {
						targets.sortBySeat();
						targets.forEach(i => i.link());
					}
				},
				sub: true,
			},
		},
	},
	shzangliu: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		unique: true,
		limited: true,
		enable: "phaseUse",
		animationColor: "water",
		skillAnimation: true,
		filter: function (event, player) {
			return game.hasPlayer(current => !current.hasSkill("nzry_jieying") && current.isLinked());
		},
		filterTarget: function (card, player, target) {
			if (!ui.selected.targets.length) return !target.hasSkill("nzry_jieying") && target.isLinked();
			for (var i of ui.selected.targets) {
				if (i.getNext() == target || i.getPrevious() == target) return !target.hasSkill("nzry_jieying") && target.isLinked();
			}
			return false;
		},
		selectTarget: [1, Infinity],
		multitarget: true,
		multiline: true,
		complexSelect: true,
		complexTarget: true,
		async content(event, trigger, player) {
			await player.awakenSkill("shzangliu");
			await player.turnOver();
			const targets = event.targets.sortBySeat();
			for (const current of targets) {
				await current.link();
				current.addSkill("shzangliu_debuff");
			}
		},
		ai: {
			order: 10,
			result: {
				target(player, target) {
					if (get.attitude(player, target) > -2) return 0;
					return -1;
				},
			},
		},
		subSkill: {
			debuff: {
				mark: true,
				marktext: "溺",
				intro: {
					content: "受到伤害后弃置两张牌或失去1点体力",
				},
				trigger: {
					player: "damageEnd",
				},
				forced: true,
				async content(event, trigger, player) {
					await game.delay();
					const result = await player
						.chooseToDiscard("he", 2)
						.set("ai", card => {
							if (card.name == "tao") return -10;
							if (card.name == "jiu" && _status.event.player.hp == 1) return -10;
							return get.unuseful(card) + 2.5 * (5 - get.owner(card).hp);
						})
						.forResult();
					if (!result?.bool) player.loseHp();
				},
				sub: true,
			},
		},
	},
	shenyu: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		init: function (player) {
			player.storage.shenyu = false;
			player.storage.shenyu_targets = [];
			lib.onwash.push(function () {
				if (player.hasSkill("shenyu_jishi")) {
					player.removeSkill("shenyu_jishi");
					player.popup("恩予");
					game.log(player, "恢复了技能", "#g【恩予】");
				}
			});
		},
		xushiSkill: function (skill, player) {
			return player.storage.shenyu;
		},
		trigger: {
			global: "phaseEnd",
		},
		filter(event, player) {
			if (event.player == player || !player.countCards("he")) return false;
			if (!player.storage.shenyu) return true;
			return !player.hasSkill("shenyu_jishi") && event.player.isIn();
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseCard("he", get.prompt("shenyu", trigger.player), [1, 3], "将任意张类型不同的牌交给" + get.translation(trigger.player), function (card) {
					if (!ui.selected.cards.length) return true;
					var type = get.type2(card);
					for (var i of ui.selected.cards) {
						if (get.type2(i) == type) return false;
					}
					return true;
				})
				.set("complexCard", true)
				.set("ai", function (card) {
					const player = get.event().player;
					if (get.attitude(player, trigger.player) < 3) return 0;
					return get.value(card, trigger.player);
				})
				.forResult();
		},
		popup: false,
		async content(event, trigger, player) {
			//player.line(trigger.player);
			player.logSkill("shenyu", trigger.player);
			player.storage.shenyu_targets.add(trigger.player);
			if (player.hasSkill("shyiduo") && player.hasSkill("shyiduo_jishi")) {
				player.storage.shyiduo_jishi++;
				if (player.storage.shyiduo_jishi === 3) {
					player.removeSkill("shyiduo_jishi");
					player.popup("义夺");
					game.log(player, "恢复了技能", "#g【义夺】");
				}
			}
			if (player.storage.shenyu) {
				player.addSkill("shenyu_jishi");
			}
			await player.give(event.cards, trigger.player, "give");
			await trigger.player.draw(event.cards.length);
			if (event.cards.length > 1) {
				//await player.draw();
				await player.chooseDrawRecover(true);
			}
			if (event.cards.length > 2) {
				player.storage.shenyu = true;
				trigger.player.insertPhase();
			}
		},
		subSkill: {
			jishi: {
				charlotte: true,
				onremove: true,
				mark: true,
				intro: {
					content: "积势：出牌阶段限一次，弃置三张牌。",
				},
				enable: "phaseUse",
				usable: 1,
				filter(event, player) {
					return player.storage.shenyu && player.countCards("he") > 2;
				},
				popup: false,
				position: "he",
				filterCard: true,
				selectCard: 3,
				prompt: "弃置三张牌并重置恩予",
				check(card) {
					return 4 - get.value(card);
				},
				async content(event, trigger, player) {
					player.removeSkill("shenyu_jishi");
					player.popup("恩予");
					game.log(player, "恢复了技能", "#g【恩予】");
				},
				ai: {
					order: 1,
					result: {
						player: 1,
					},
				},
				sub: true,
			},
		},
	},
	shyiduo: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		init: function (player) {
			lib.onwash.push(function () {
				if (player.hasSkill("shyiduo_jishi")) {
					player.removeSkill("shyiduo_jishi");
					player.popup("义夺");
					game.log(player, "恢复了技能", "#g【义夺】");
				}
			});
		},
		enable: "phaseUse",
		xushiSkill: true,
		filter(event, player) {
			return !player.hasSkill("shyiduo_jishi") && player.hasSkill("shenyu");
		},
		filterTarget: function (card, player, target) {
			return player.storage.shenyu_targets.includes(target) && target.hasUseTarget({ name: "juedou", isCard: true });
		},
		async content(event, trigger, player) {
			player.addSkill("shyiduo_jishi");
			player.addTempSkill("shyiduo_swap");
			await event.target
				.chooseUseTarget(
					{
						name: "juedou",
						isCard: true,
						storage: { shyiduo: true },
					},
					true
				)
				.set("ai", function (target) {
					const player = get.event().player;
					const card = { name: "juedou", isCard: true };
					return -get.attitude(player, target) * target.countCards("h");
				});
		},
		ai: {
			combo: "shenyu",
			order: 1,
			result: {
				target: 1,
			},
		},
		subSkill: {
			swap: {
				trigger: {
					global: "damageSource",
				},
				filter: function (event, player) {
					return event.card && event.card.storage && event.card.storage.shyiduo && player.isIn() && event.player.isIn() && event.player != player;
				},
				direct: true,
				forced: true,
				charlotte: true,
				async content(event, trigger, player) {
					await player.swapHandcards(trigger.player);
				},
				sub: true,
			},
			jishi: {
				charlotte: true,
				init: function (player) {
					player.storage.shyiduo_jishi = 0;
				},
				onremove: true,
				mark: true,
				intro: {
					markcount: function (num) {
						return (num || 0).toString();
					},
					content: "积势：发动三次〖恩予〗<br>当前进度：#/3。",
				},
				sub: true,
			},
		},
	},
	shshilun: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseTarget(get.prompt2("shshilun"), (card, player, target) => {
					return target.countCards("he");
				})
				.set("ai", target => {
					const player = get.event().player;
					if (target == player) return 1;
					return 0;
				})
				.forResult();
		},
		popup: false,
		async content(event, trigger, player) {
			const target = event.targets[0];
			player.line(target);
			player.logSkill("shshilun", target);
			await target
				.chooseToDiscard([1, Infinity], "he", "弃置任意张牌", true)
				.set("ai", card => {
					if (get.position(card) != "h") return 0;
					const num = game.findPlayer(current => current.isMinHandcard()).countCards("h");
					if (!ui.selected.cards.length) return 200 - get.value(card);
					if (player.countCards("h") - ui.selected.cards.length > num) return 250 - get.value(card);
					return 0;
				})
				.set("complexCard", true);
			var num = 0;
			if (!target.getAllHistory("sourceDamage").length) {
				//game.log('未造成过伤害')
				num++;
			}
			if (target.getDamagedHp() > player.getDamagedHp()) {
				//game.log('已损失体力值大于你')
				num++;
			}
			if (target.isMinHandcard()) {
				//game.log('手牌数为全场最低')
				num++;
			}
			if (num > 0) await game.asyncDraw([player, target], num);
			else await target.damage();
		},
	},
	shcaiyin: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		group: "shcaiyin_die",
		trigger: {
			player: "phaseJieshuBegin",
		},
		filter(event, player) {
			return player.countCards("h") + get.centralDisCards().length > 0 && !player.hasSkill("shcaiyin_yearban");
		},
		check: function (event, player) {
			return get.value(player.getCards("h")) < get.value(get.centralDisCards());
		},
		async content(event, trigger, player) {
			player.addSkills("shcaiyin_yearban");
			const hs = player.getCards("h").slice();
			const cs = get.centralDisCards().slice();
			if (hs.length) await player.loseToDiscardpile(hs);
			if (cs.length) await player.gain(cs, "gain2");
		},
		subSkill: {
			die: {
				trigger: {
					source: "dieAfter",
				},
				forced: true,
				async content(event, trigger, player) {
					await player.addSkills("shjiepeng");
					await player.removeSkill("shcaiyin");
				},
				sub: true,
			},
			yearban: {},
		},
		init: function (player) {
			lib.onwash.push(function () {
				if (player.hasSkill("shcaiyin_yearban")) {
					player.removeSkill("shcaiyin_yearban");
				}
			});
		},
	},

	washCard: {
		enable: "phaseUse",
		async content(event, trigger, player) {
			game.washCard();
		},
	},
	shluanji: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		init: function (player) {
			if (_status.currentPhase && _status.currentPhase == player) {
				game.countPlayer(function (current) {
					current.addSkillBlocker("shluanji_fengyin");
				});
				player.when({ player: ["phaseEnd", "die"] }).then(() => {
					game.countPlayer2(function (current) {
						current.removeSkillBlocker("shluanji_fengyin");
					});
				});
			}
		},
		onremove: function (player, skill) {
			game.countPlayer(function (current) {
				current.removeSkillBlocker("shluanji_fengyin");
			});
		},
		trigger: {
			player: "phaseBefore",
		},
		forced: true,
		popup: false,
		content: function () {
			game.countPlayer(function (current) {
				current.addSkillBlocker("shluanji_fengyin");
			});
			// player.addTempSkill('shluanji_clear');
			player.when({ player: ["phaseEnd", "die"] }).then(() => {
				game.countPlayer2(function (current) {
					current.removeSkillBlocker("shluanji_fengyin");
				});
			});
		},
		priority: 100,
		group: ["shluanji_unrespon", "shluanji_damage", "shluanjiAudio"],
		subSkill: {
			fengyin: {
				inherit: "fengyin",
				sub: true,
				init: function (player, skill) {
					player.addSkillBlocker(skill);
				},
				onremove: function (player, skill) {
					player.removeSkillBlocker(skill);
				},
				charlotte: true,
				skillBlocker: function (skill, player) {
					return lib.skill[skill] && !lib.skill[skill].charlotte && !get.is.locked(skill, player) && player.isLinked();
				},
				mark: true,
				intro: {
					content: function (storage, player, skill) {
						var list = player.getSkills(null, false, false).filter(function (i) {
							return lib.skill.shluanji_fengyin.skillBlocker(i, player);
						});
						if (list.length) return "失效技能：" + get.translation(list);
						return "无失效技能";
					},
				},
			},
			unrespon: {
				forced: true,
				trigger: {
					player: "useCard",
					global: "useCardToTargeted",
				},
				filter: function (event, player) {
					if (player != _status.currentPhase) return false;
					return event.card && (get.type(event.card) == "trick" || (get.type(event.card) == "basic" && !["shan", "tao", "jiu", "du"].includes(event.card.name)));
				},
				direct: true,
				async content(event, trigger, player) {
					const targets = game.filterPlayer(function (current) {
						return (
							current.getHistory("lose", function (evt) {
								return evt.cards2 && evt.cards2.length > 0;
							}).length > 0
						);
					});
					if (!targets || !targets.length) return;
					if (event.triggername == "useCard") {
						if (!trigger.targets || !trigger.targets.length) game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shluanji2.mp3");
						trigger.directHit.addArray(targets);
					} else {
						if (trigger.isFirstTarget && get.type(trigger.card) == "trick") game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shluanji2.mp3");
						else if (targets.includes(trigger.target)) game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shluanji2.mp3");
						if (trigger.player == player) trigger.getParent("useCard").directHit.addArray(targets);
					}
					//game.log(targets);
				},
				ai: {
					directHit_ai: true,
					skillTagFilter: function (player, tag, arg) {
						return (
							arg.target.getHistory("lose", function (evt) {
								return evt.cards2 && evt.cards2.length > 0;
							}).length > 0
						);
					},
				},
				sub: true,
			},
			damage: {
				trigger: {
					source: "damageBegin1",
				},
				forced: true,
				filter: function (event, player) {
					return player == _status.currentPhase && event.player.countCards("e") > 0;
				},
				content: function () {
					game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shluanji1.mp3");
					trigger.num++;
				},
				sub: true,
			},
		},
	},
	shluanjiAudio: {
		trigger: {
			player: "phaseBegin",
			global: "linkAfter",
		},
		charlotte: true,
		forced: true,
		direct: true,
		filter: function (event, player) {
			if (_status.currentPhase != player) return false;
			if (event.name == "link") return event.player.isLinked();
			return game.hasPlayer(function (current) {
				return current.isLinked();
			});
		},
		content: function () {
			if (trigger.name == "link") {
				player.logSkill("shluanji", trigger.player);
			} else {
				const targets = game.filterPlayer(function (current) {
					return current.isLinked();
				});
				player.logSkill("shluanji", targets);
			}
			game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shluanji1.mp3");
		},
	},
	shhuaibi: {
		init: function (player) {
			_status.initLiangCards();
		},
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "phaseBefore",
			player: "enterGame",
		},
		filter(event, player) {
			return event.name != "phase" || game.phaseNumber == 0;
		},
		forced: true,
		async content(event, trigger, player) {
			const list = [];
			const cards = _status.liangcards.slice(0);
			for (let card of cards) {
				var name = get.name(card);
				if ((name == "shgoulianqiang" || name == "shsaitangni") && !list.includes(name)) {
					list.add(name);
					await player.$gain2(card);
					_status.liangcards.remove(card);
					await player.equip(card);
				}
			}
		},
		mod: {
			globalFrom: function (from, to, current) {
				if (from.getEquip(1)) return current - 1;
			},
			globalTo: function (from, to, current) {
				if (to.getEquip(2)) return current + 1;
			},
		},
	},
	shguzhi: {
		locked: false,
		mod: {
			ignoredHandcard: function (card, player) {
				if (get.is.shownCard(card)) {
					return true;
				}
			},
			cardDiscardable: function (card, player, name) {
				if (name == "phaseDiscard" && get.is.shownCard(card)) return false;
			},
			aiOrder: function (player, card, num) {
				if (typeof card == "object") {
					if (get.is.shownCard(card) && player.countCards("h", card2 => !get.is.shownCard(card2))) {
						if (player._shantu_mark.name == "暗" && !player.countCards("h", { name: "ying" })) return num + 1;
						if (get.type(card) == "equip" || player.getUseValue(card) < 17) return Math.max(0, num / 10 - 10) + 0.5;
						return num / 5 + 1;
					}
				}
			},
			aiValue(player, card, num) {
				if (num <= 0 || get.itemtype(card) !== "card") return;
				if (get.is.shownCard(card)) return 2 * num;
				if (get.name(card) == "ying" && player.hasSkill("shantu") && player._shantu_mark.name == "暗") {
					if (player.countCards("h", { name: "ying" }) == 1) {
						return num + 6.5;
					}
				}
			},
		},

		trigger: {
			player: "phaseUseBegin",
		},
		filter(event, player) {
			return player.countCards("h", card => !get.is.shownCard(card));
		},
		audio: "ext:水泊娘山/character/audio/skill:2",
		async cost(event, trigger, player) {
			event.result = await player
				.chooseCard("h", get.prompt("shguzhi"), "明置一张手牌", function (card) {
					return !get.is.shownCard(card);
				})
				.set("ai", function (card) {
					const player = get.event().player;
					const list = ["nanman", "wanjian", "wuzhong", "juedou"];
					if (player.getDamagedHp > 1) list.add("tao");
					if (list.includes(get.name(card))) return player.getUseValue(card) + 4;
					if (player.getUseValue(card) < 2) return 4;
					if (get.type(card) == "basic" || get.type(card) == "trick") return player.getUseValue(card);
					return 1;
				})
				.forResult();
		},
		async content(event, trigger, player) {
			//await player.damage(null);
			player.addShownCards(event.cards, "visible_shguzhi");
			player.addSkill("shguzhi_view");
		},
		group: "shguzhi_ai",
	},
	shguzhi_ai: {
		trigger: { player: "phaseDiscardBefore" },
		filter(event, player) {
			return player.countCards("h", { name: "ying" }) && player.hasSkill("shantu") && player._shantu_mark.name == "暗";
		},
		forced: true,
		popup: false,
		charlotte: true,
		content: function () {
			trigger.setContent(lib.skill.shguzhi_ai.phaseDiscard);
		},
		phaseDiscard: function () {
			"step 0";
			game.log(player, "进入了弃牌阶段");
			event.num = player.needsToDiscard();
			if (event.num <= 0) event.finish();
			else {
				game.broadcastAll(function (player) {
					if (lib.config.show_phase_prompt) {
						player.popup("弃牌阶段", null, false);
					}
				}, player);
			}
			event.trigger("phaseDiscard");
			("step 1");
			player.chooseToDiscard(num, true).ai = function (card) {
				if (!ui.selected.cards) ui.selected.cards = [];
				var val = 100 - get.value(card);
				if (
					player.countCards("h", card => {
						return get.name(card) == "ying" && !ui.selected.cards.includes(card);
					}) == 1 &&
					get.name(card) == "ying"
				)
					val -= 6.5;
				return val;
			};
			("step 2");
			event.cards = result.cards;
		},
	},
	shguzhi_view: {
		locked: false,
		enable: "chooseToUse",
		filter: function (event, player) {
			if (!player.countCards("h", card => !get.is.shownCard(card)) || !player.countCards("h", card => get.is.shownCard(card))) return false;
			const cards = player.getCards("h", card => get.is.shownCard(card));
			for (var i of cards) {
				var type = get.type(i);
				if ((type == "basic" || type == "trick") && event.filterCard(get.autoViewAs({ name: get.name(i) }, "unsure"), player, event)) return true;
			}
			return false;
		},
		chooseButton: {
			dialog: function (event, player) {
				var list = [];
				const cards = player.getCards("h", card => get.is.shownCard(card));
				for (var i = 0; i < cards.length; i++) {
					var name = get.name(cards[i]);
					if (name == "sha") {
						var nature = get.nature(cards[i]);
						if (event.filterCard(get.autoViewAs({ name, nature }, "unsure"), player, event)) {
							if (typeof nature === "string") list.push(["基本", "", "sha", nature]);
							else list.push(["基本", "", "sha"]);
						}
					} else if (get.type(name) == "trick" && event.filterCard(get.autoViewAs({ name }, "unsure"), player, event)) list.push(["锦囊", "", name]);
					else if (get.type(name) == "basic" && event.filterCard(get.autoViewAs({ name }, "unsure"), player, event)) list.push(["基本", "", name]);
				}
				const uniqueList = [...new Set(list.map(item => JSON.stringify(item)))].map(str => JSON.parse(str));
				return ui.create.dialog("孤志", [uniqueList, "vcard"]);
			},
			check: function (button) {
				if (_status.event.getParent().type != "phase") return 1;
				var player = _status.event.player;
				if (["wugu", "zhulu_card", "yiyi", "lulitongxin", "lianjunshengyan", "diaohulishan"].includes(button.link[2])) return 0;
				return player.getUseValue({
					name: button.link[2],
					nature: button.link[3],
				});
			},
			backup: function (links, player) {
				return {
					filterCard: card => !get.is.shownCard(card),
					popname: true,
					position: "h",
					viewAs: { name: links[0][2], nature: links[0][3] },
					ai1: function (card) {
						const player = _status.event.player;
						const list = ["shan", "jiedao", "shandian"];
						let val = get.value(card);
						val += player.getUseValue(card) / 5;
						if (list.includes(get.name(card))) val -= 2;
						if (get.name(card) == "ying") val -= 2.5;
						return 7 - val;
					},
				};
			},
			prompt: function (links, player) {
				return "将一张暗置牌当做" + (get.translation(links[0][3]) || "") + get.translation(links[0][2]) + "使用";
			},
		},
		hiddenCard: function (player, name) {
			if (
				!player
					.getCards("h", card => get.is.shownCard(card))
					.map(function (card) {
						return get.name(card);
					})
					.includes(name)
			)
				return false;
			var type = get.type(name);
			return (type == "basic" || type == "trick") && player.countCards("h", card => !get.is.shownCard(card)) > 0;
		},
		ai: {
			fireAttack: true,
			respondSha: true,
			respondShan: true,
			skillTagFilter: function (player) {
				if (!player.countCards("h", card => !get.is.shownCard(card)) || !player.countCards("h", card => get.is.shownCard(card))) return false;
			},
			order: function (item, player) {
				if (!player) player = get.player();
				var cards = player.getCards("h", card => get.is.shownCard(card));
				var list1 = ["shan", "tao", "jiu", "wuxie"];
				let maxUseValue = { name: get.name(cards[0]), isCard: true };
				for (var card of cards) {
					if (get.type(card) == "equip" || get.type(card) == "delay" || list1.includes(get.name(card))) continue;
					if (player.getUseValue({ name: get.name(card), isCard: true }) > player.getUseValue(maxUseValue)) maxUseValue = { name: get.name(card), isCard: true };
				}
				if (player.getUseValue(maxUseValue) > 5) return get.order(maxUseValue) + 0.1;
				return 0;
			},
			result: {
				player: function (player) {
					if (_status.event.dying) return get.attitude(player, _status.event.dying);
					return 1;
				},
			},
		},
		group: "shguzhi_view_hideShown",
		subSkill: {
			hideShown: {
				trigger: {
					player: "useCardAfter",
				},
				forced: true,
				charlotte: true,
				popup: false,
				filter: function (event, player) {
					return event.skill == "shguzhi_view_backup" && player.countCards("h", card => get.is.shownCard(card));
				},
				async content(event, trigger, player) {
					const result = await player
						.chooseCard(
							"h",
							"暗置一张手牌",
							function (card) {
								return get.is.shownCard(card);
							},
							true
						)
						.set("ai", function (card) {
							const player = get.event().player;
							const list = ["nanman", "wanjian", "wuzhong", "juedou"];
							if (player.getDamagedHp > 1) list.add("tao");
							if (list.includes(get.name(card))) return 1;
							if (get.type(card) == "delay" || get.type(card) == "equip") return 10;
							if (get.name(card) == "sha") return 7;
							if (player.getUseValue(card) < 2) return 5;
							return Math.max(1, 10 - player.getUseValue(card));
						})
						.forResult();
					if (result.bool && result.cards && result.cards.length) {
						player.hideShownCards(result.cards, "visible_shguzhi");
					}
				},
				sub: true,
			},
		},
	},
	shantu: {
		zhuanhuaji: true,
		init2: function (player) {
			game.broadcastAll(function (player) {
				player._shantu_mark = player.mark("暗", {
					content: "你失去明置手牌后，你获得两张【影】",
				});
			}, player);
		},
		trigger: {
			player: "loseAfter",
			global: ["gainAfter", "equipAfter", "addJudgeAfter", "loseAsyncAfter", "addToExpansionAfter"],
		},
		forced: true,
		filter(event, player, name) {
			if (player._shantu_mark.name == "暗") {
				var num = 0;
				const evt = event.getl(player);
				if (!evt || !evt.gaintag_map) return false;
				for (var i in evt.gaintag_map) {
					if (evt.gaintag_map[i].some(tag => tag.indexOf("visible_") == 0)) num++;
				}
				return num > 0;
			} else {
				const evt = event.getl(player);
				return evt && evt.hs && evt.hs.filter(h => get.name(h, false) == "ying").length && !player.countCards("h", card => get.name(card, false) == "ying");
			}
		},
		async content(event, trigger, player) {
			if (player._shantu_mark.name == "暗") {
				game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shantu1.mp3");
				await player.gain(lib.card.ying.getYing(2), "gain2");
			} else {
				game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shantu2.mp3");
				const cards = (await player.draw(3).forResult()).cards;
				player.addShownCards(cards, "visible_shguzhi");
			}
		},

		group: "shantu_changeZhuanhuaji",
		subSkill: {
			changeZhuanhuaji: {
				trigger: {
					player: "phaseJieshuBegin",
				},
				forced: true,
				content: function () {
					"step 0";
					player.judge();
					("step 1");
					if (result.color == "black" && player._shantu_mark.name == "明") {
						game.broadcastAll(function (player) {
							if (!player._shantu_mark) return;
							player._shantu_mark.name = "暗";
							player._shantu_mark.skill = "暗";
							player._shantu_mark.firstChild.innerHTML = "暗";
							player._shantu_mark.info.content = "你失去明置手牌后，你获得两张【影】";
						}, player);
					} else if (result.color == "red" && player._shantu_mark.name == "暗") {
						game.broadcastAll(function (player) {
							if (!player._shantu_mark) return;
							player._shantu_mark.name = "明";
							player._shantu_mark.skill = "明";
							player._shantu_mark.firstChild.innerHTML = "明";
							player._shantu_mark.info.content = "你失去所有【影】后，你摸三张牌并明置";
						}, player);
					}
				},
			},
		},
	},
	shlieri: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseUseBegin",
		},
		filter: function (event, player) {
			return player.countCards("h") > 1 && player.countCards("h", lib.filter.cardRecastable) > 0;
		},
		async content(event, trigger, player) {
			await player.showHandcards();
			const { bool, cards } = await player
				.chooseCard("h", "重铸至多半数手牌", [1, Math.floor(player.countCards("h") / 2)], lib.filter.cardRecastable, true)
				.set("ai", function (card) {
					var player = _status.event.player,
						cards = ui.selected.cards;
					if (!player.hasSkill("shyuyin")) return 5 - get.value(card);
					if (get.color(card) == "red") return 7 - get.value(card);
					return 3 - get.value(card);
				})
				.forResult();
			if (bool) {
				await player.recast(cards);
				player.addTempSkill("shlieri_jiu", "phaseUseEnd");
			}
		},

		subSkill: {
			jiu: {
				trigger: {
					player: "useCardAfter",
				},
				charlotte: true,
				forced: true,
				filter: function (event, player) {
					if (!event.targets) return false;
					return event.targets.filter(current => current != player && current.isIn()).length;
				},
				async content(event, trigger, player) {
					const targets = trigger.targets.filter(current => current != player && current.isIn()).sortBySeat();
					for (const current of targets) {
						const result = await current
							.chooseToUse({
								filterCard: function (card, player, event) {
									if (get.name(card) != "jiu") return false;
									return lib.filter.filterCard.apply(this, arguments);
								},
								prompt: "使用一张【酒】，否则失去1点体力。",
								ai1: function (card) {
									return get.order(card) + 0.1;
								},
							})
							.forResult();
						if (result.bool == false) {
							current.loseHp();
						}
					}
				},
				mod: {
					aiOrder(player, card, num) {
						if (typeof card == "object") {
							if (get.color(card) == "red") return num + 7;
						}
					},
				},

				sub: true,
			},
		},
	},
	shyuyin: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		global: "shyuyin2",
	},
	shyuyin2: {
		locked: false,
		mod: {
			cardUsable: function (card, player, num) {
				if (card.name == "jiu" && player != _status.currentPhase) return Infinity;
			},
		},
		enable: "chooseToUse",
		filter(event, player) {
			var players = game.filterPlayer(function (current) {
				return current.hasSkill("shyuyin");
			});
			for (var source of players) {
				var cards = source.getCards("h");
				for (var i of cards) {
					var card = get.autoViewAs({ name: "jiu" }, [i]);
					if (event.filterCard(card, player, event)) return true;
				}
			}
			return false;
		},
		hiddenCard(player, name) {
			var players = game.filterPlayer(function (current) {
				return current.hasSkill("shyuyin");
			});
			for (var source of players) {
				var cards = source.getCards("h");
				for (var i of cards) {
					var card = get.autoViewAs({ name: "jiu" }, [i]);
					if (name == card.name) return true;
				}
			}
			return false;
		},
		chooseButton: {
			dialog(event, player) {
				var dialog = ui.create.dialog("欲饮", "hidden");
				var players = game
					.filterPlayer(function (current) {
						return current.hasSkill("shyuyin");
					})
					.sortBySeat();
				for (var source of players) {
					var cards = source.getCards("h");
					if (cards.length) {
						var str = '<div class="text center">';
						str += get.translation(source);
						var num = source.getSeatNum();
						if (num > 0) str += "（" + get.cnNumber(num, true) + "号位）";
						str += "</div>";
						dialog.add(str);
						if (source == player || player.hasSkillTag("viewHandcard", null, source, true)) dialog.add(cards);
						else dialog.add([cards, "blank"]);
					}
				}
				return dialog;
			},
			filter(button, player) {
				var card = get.autoViewAs({ name: "jiu" }, [button.link]),
					evt = _status.event.getParent();
				return evt.filterCard(card, player, evt);
			},
			check(button) {
				const player = _status.event.player,
					card = button.link;
				const source = get.owner(card);
				if (lib.skill.shdiaoman.isVisable(player, source, card)) {
					if (get.color(card) == "black") {
						return +(player.hp === 0 && !player.countCards("h", c => get.name(c) === "jiu" || get.name(c) === "tao").length);
					}
					return get.attitude(player, source) > 1 ? 7 - get.value(card, source) : get.value(card, source);
				}
				if (!!_status.currentPhase && _status.currentPhase.hasSkill("shlieri_jiu") && _status.currentPhase != player) {
					if (player == source && get.color(button.link) == "black") return 0;
					else if (player != source && (player.countCards("h", card => get.name(card) == "jiu" || get.name(card) == "tao") || (player.hasSkill("shlieri") && player.countCards("h", { color: "red" }) > player.countCards("h", { color: "black" })))) return 0;
				}
				if (_status.event.getParent().type != "phase") return 1;

				return player.getUseValue(get.autoViewAs({ name: "jiu" }, [button.link]), null, true) - get.attitude(player, source);
			},
			backup(links, player) {
				return {
					card: links[0],
					viewAs: get.autoViewAs({ name: "jiu" }, [links[0]]),
					filterCard: () => false,
					selectCard: -1,
					precontent() {
						var card = lib.skill["shyuyin2_backup"].card;
						event.card = card;
						event.result.cards = [card];
						event.source = get.owner(card);
						if (!event.result.card.storage) event.result.card.storage = {};
						event.result.card.storage.yuyin_owner = event.source;
						delete event.result.skill;
						player.logSkill("shyuyin", event.source);
						if (event.source.isIn()) event.source.addTempSkill("shyuyin2_draw");
						if (get.color(card, false) == "black") player.addTempSkill("shyuyin2_unUR", { player: "phaseAfter" });
					},
				};
			},
		},
		ai: {
			order: () => {
				var sources = game.filterPlayer(source => {
					return source.hasSkill("shyuyin");
				});
				const player = _status.event.player;
				if (_status.event.dying) {
					return 1;
				}
				let jiu = get.order({ name: "jiu" });
				if (
					sources.filter(source => {
						return (
							source.countCards("h", card => {
								return lib.skill.shdiaoman.isVisable(player, source, card) && get.color(card) == "red";
							}) > 0
						);
					}).length
				)
					return jiu + 0.2;
				if (
					game.countPlayer2(function (current) {
						return current.getHistory("damage").length > 0;
					}) != 0 &&
					sources.filter(source => {
						return get.attitude(player, source) < 0;
					}).length > 0
				)
					return 1;
				return 0;
			},
			result: {
				player(player, target) {
					if (
						!game.hasPlayer(function (current) {
							return current.hasSkill("shyuyin");
						})
					)
						return 0;
					return 1;
				},
			},
			tag: {
				save: 1,
				recover: 0.1,
			},
		},
		subSkill: {
			unUR: {
				forced: true,
				popup: false,
				mark: true,
				audio: false,
				onremove: true,
				mod: {
					cardEnabled(card) {
						return false;
					},
					cardRespondable(card) {
						return false;
					},
					cardSavable(card) {
						return false;
					},
				},
				intro: {
					content: "不能使用或打出牌直到你的回合结束",
				},
				sub: true,
			},
			draw: {
				charlotte: true,
				trigger: {
					global: "phaseEnd",
				},
				forced: true,
				popup: false,
				filter(event, player) {
					return (
						game.countPlayer2(function (current) {
							return current.getHistory("damage").length > 0;
						}) == 0
					);
				},
				content() {
					player.draw();
				},
				sub: true,
			},
		},
	},
	shlvli: {
		trigger: {
			player: "compare",
			target: "compare",
		},
		filter: function (event, player) {
			if (event.player == player) return !event.iwhile;
			return true;
		},
		forced: true,
		async content(event, trigger, player) {
			if (player == trigger.player) {
				trigger.num1 += player.hp;
				if (trigger.num1 > 13) trigger.num1 = 13;
			} else {
				trigger.num2 += player.hp;
				if (trigger.num2 > 13) trigger.num2 = 13;
			}
			game.log(player, "的拼点牌点数+" + get.translation(player.hp));
			await player.loseHp();
		},
	},
	shhanzhan: {
		enable: "phaseUse",
		filter: function (event, player) {
			return (
				player.countCards("h") > 0 &&
				game.hasPlayer(function (current) {
					return player.canCompare(current) && player.hp != current.hp;
				})
			);
		},
		filterTarget: function (card, player, target) {
			return player.canCompare(target) && target.hp != player.hp;
		},
		async content(event, trigger, player) {
			const target = event.target;
			const tag = player.hp > target.hp ? 1 : 2;
			const result = await player.chooseToCompare(target).forResult();
			if (tag == 1) {
				const targets = [player, target];
				if (result.bool) targets.reverse();
				await targets[0].damage("nosource");
				if (result.tie) await targets[1].damage("nosource");
			} else if (tag == 2 && !result.tie) {
				const targets = [target, player];
				if (result.bool) targets.reverse();
				await targets[0].draw(2);
			}
		},
		ai: {
			order: 10,
			result: {
				target: -1,
			},
		},
	},
	shfengxuan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "chooseToUseBegin",
		},
		filter(event, player) {
			if (event._shfengxuan) return false;
			const evt = event.getParent(2);
			return evt.card && evt.card.name == "sha" && evt.player.hasSkill("shfengxuan");
		},
		forced: true,
		async content(event, trigger, player) {
			trigger._shfengxuan = true;
			const targets = [trigger.player.getPrevious()];
			if (trigger.player.getPrevious() != trigger.player.getNext()) targets.add(trigger.player.getNext());
			targets.filter(target => target != trigger.player).sortBySeat();
			if (targets.length) {
				for (const target of targets) {
					if (!target.isIn()) continue;
					const result = await target
						.chooseToUse("锋旋：是否替" + get.translation(trigger.player) + "使用一张【闪】？", { name: "shan" })
						.set("ai1", () => {
							const event = _status.event;
							if (event.source.hasSkill("shyishi")) {
								if (get.attitude(event.player, event.source) < 0 && (get.attitude(event.player, event.target) > 2 || (get.attitude(event.player, event.target) < 0 && event.target.isDamaged()))) return 1;
								return -1;
							}
							return get.attitude(event.player, event.source) - 2;
						})
						.set("skillwarn", "替" + get.translation(trigger.player) + "打出一张闪")
						.set("source", player)
						.set("target", trigger.player)
						.forResult();
					if (result.bool) {
						if (result.cards && result.cards.length)
							trigger.result = {
								bool: true,
								card: {
									name: "shan",
									isCard: true,
									cards: result.cards.slice(),
								},
								cards: result.cards.slice(),
							};
						else
							trigger.result = {
								bool: true,
								card: { name: "shan", isCard: true },
							};
						trigger.responded = true;
						trigger.animate = false;
						break;
					}
				}
			}
		},
		mod: {
			cardUsable: function (card, player, num) {
				if (card.name == "sha") return Infinity;
			},
			selectTarget: function (card, player, range) {
				if (card.name == "sha" && range[1] != -1) range[1] = Infinity;
			},
		},
		group: "shfengxuan2",
	},
	shyishi: {
		global: "shyishi_ai",
		trigger: {
			player: "useCard",
		},
		filter: function (event, player) {
			return event.card && event.card.name == "sha";
		},
		popup: false,
		check: function (event, player) {
			var val = 0;
			for (var target of event.targets) {
				if (get.recoverEffect(target, player, player) > 0) val += get.recoverEffect(target, player, player);
				else if (get.attitude(player, target) < 0 && target.isDamaged()) val -= 2;
			}
			return val > 0;
		},
		prompt: "是否发动【义释】？",
		async content(event, trigger, player) {
			trigger.card.storage.shyishi = true;
		},
		ai: {
			effect: {
				player: function (card, player, target) {
					if (!ui.selected.targets.length) {
						var recover = 0;
						var recoverTargets = [];
						var damage = 0;
						var damgeTargets = [];
						const allTargets = game.filterPlayer(current => lib.filter.targetEnabled({ name: "sha" }, player, current));
						if (card.name != "sha") return;
						for (const current of allTargets) {
							if (get.recoverEffect(current, player, player) > 0) {
								recoverTargets.push(current);
								recover += 1.5;
							} else if (get.attitude(player, current) < 0) {
								damgeTargets.push(current);
								damage++;
							}
						}
						if (recover >= damage) return [0, get.recoverEffect(target, player, player), 0, get.recoverEffect(target, player, target)];
					}
					if (ui.selected.targets.length) {
						for (var i of ui.selected.targets) {
							if (get.attitude(player, i) * get.attitude(player, target) <= 0) return [-1, -2, -3, -3];
						}
					}
				},
			},
		},
		group: ["shyishi_recover"],
		subSkill: {
			recover: {
				trigger: {
					player: "shaBegin",
				},
				filter: function (event, player) {
					return event.card.storage && event.card.storage.shyishi;
				},
				forced: true,
				locked: false,
				popup: false,
				content: function () {
					trigger.setContent(lib.skill.shyishi.shaOtherContent);
				},
				sub: true,
			},
			ai: {
				charlotte: true,
				ai: {
					effect: {
						target: function (card, player, target) {
							if (card.name == "sha" && player.hasSkill("shyishi")) {
								if (get.attitude(target, player) < 0 || !target.isDamaged()) return;
								return [0, 1 + get.recoverEffect(target, player, player)];
							}
						},
					},
				},
				sub: true,
			},
			noshan: {
				charlotte: true,
				ai: {
					noShan: true,
				},
				sub: true,
			},
		},
		shaOtherContent: function () {
			"step 0";
			if (typeof event.shanRequired != "number" || !event.shanRequired || event.shanRequired < 0) {
				event.shanRequired = 1;
			}
			if (typeof event.baseDamage != "number") event.baseDamage = 1;
			if (typeof event.extraDamage != "number") event.extraDamage = 0;
			("step 1");
			if (event.directHit || event.directHit2 || (!_status.connectMode && lib.config.skip_shan && !target.hasShan())) {
				event._result = { bool: false };
			} else if (event.skipShan) {
				event._result = { bool: true, result: "shaned" };
			} else {
				var next = target.chooseToUse("请使用一张闪响应杀");
				next.set("type", "respondShan");
				next.set("filterCard", function (card, player) {
					if (get.name(card) != "shan") return false;
					return lib.filter.cardEnabled(card, player, "forceEnable");
				});
				if (event.shanRequired > 1) {
					next.set("prompt2", "（共需使用" + event.shanRequired + "张闪）");
				} else if (game.hasNature(event.card, "stab")) {
					next.set("prompt2", "（在此之后仍需弃置一张手牌）");
				}
				next.set("ai1", function (card) {
					if (_status.event.useShan) return get.order(card);
					return 0;
				}).set("shanRequired", event.shanRequired);
				next.set("respondTo", [player, card]);
				next.set(
					"useShan",
					(() => {
						if (target.hasSkillTag("noShan", null, event)) return false;
						if (target.hasSkillTag("useShan", null, event)) return true;
						if (target.isLinked() && game.hasNature(event.card) && get.attitude(target, player._trueMe || player) > 0) return false;
						if (event.baseDamage + event.extraDamage <= 0 && !game.hasNature(event.card, "ice")) return false;
						if (event.baseDamage + event.extraDamage >= target.hp + (player.hasSkillTag("jueqing", false, target) || target.hasSkill("gangzhi") ? target.hujia : 0)) return true;
						if (!game.hasNature(event.card, "ice") && get.damageEffect(target, player, target, get.nature(event.card)) >= 0) return false;
						if (event.shanRequired > 1 && target.mayHaveShan(target, "use", null, "count") < event.shanRequired - (event.shanIgnored || 0)) return false;
						return true;
					})()
				);
				//next.autochoose=lib.filter.autoRespondShan;
			}
			("step 2");
			if (!result || !result.bool || !result.result || result.result != "shaned") {
				event.trigger("shaHit");
			} else {
				event.shanRequired--;
				if (event.shanRequired > 0) {
					event.goto(1);
				} else if (game.hasNature(event.card, "stab") && target.countCards("h") > 0) {
					event.responded = result;
					event.goto(4);
				} else {
					event.trigger("shaMiss");
					event.responded = result;
				}
			}
			("step 3");
			if ((!result || !result.bool || !result.result || result.result != "shaned") && !event.unhurt) {
				if (!event.directHit && !event.directHit2 && lib.filter.cardEnabled(new lib.element.VCard({ name: "shan" }), target, "forceEnable") && target.countCards("hs") > 0 && get.damageEffect(target, player, target) < 0) target.addGaintag(target.getCards("hs"), "sha_notshan");
				//target.damage(get.nature(event.card));
				target.recover(1, player);
				game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shyishi.mp3");
				event.result = { bool: true };
				//event.trigger("shaDamage");
			} else {
				event.result = { bool: false };
				event.trigger("shaUnhirt");
			}
			event.finish();
			("step 4");
			target.chooseToDiscard("刺杀：请弃置一张牌，否则此【杀】依然造成伤害").set("ai", function (card) {
				var target = _status.event.player;
				var evt = _status.event.getParent();
				var bool = true;
				if (get.damageEffect(target, evt.player, target, evt.card.nature) >= 0) bool = false;
				if (bool) {
					return 8 - get.useful(card);
				}
				return 0;
			});
			("step 5");
			if ((!result || !result.bool) && !event.unhurt) {
				//target.damage(get.nature(event.card));
				target.recover(1, player);
				game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shyishi.mp3");
				event.result = { bool: true };
				//event.trigger("shaDamage");
				event.finish();
			} else {
				event.trigger("shaMiss");
			}
			("step 6");
			if ((!result || !result.bool) && !event.unhurt) {
				//target.damage(get.nature(event.card));
				target.recover(1, player);
				game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shyishi.mp3");
				event.result = { bool: true };
				//event.trigger("shaDamage");
				event.finish();
			} else {
				event.result = { bool: false };
				event.trigger("shaUnhirt");
			}
		},
	},
	shfengxuan2: {
		trigger: {
			player: "useCardToPlayered",
		},
		filter: function (event, player) {
			return event.card && event.card.name == "sha";
		},
		popup: false,
		charlotte: true,
		forced: true,
		async content(event, trigger, player) {
			if (!player.hasSkill("shyishi_noshan")) {
				player.addTempSkill("shyishi_noshan", "useCardEnd");
			}
			if (!trigger.target.hasSkill("shyishi_noshan") && get.attitude(player, trigger.target) >= 0 && player.hasSkill("shyishi")) {
				trigger.target.addTempSkill("shyishi_noshan", "useCardEnd");
			}
			if (get.attitude(player, trigger.target) < 0) {
				for (var current of game.filterPlayer()) {
					if (current.hasSkill("shyishi_noshan")) continue;
					if (get.attitude(current, player) > 1 || get.attitude(current, trigger.target) < -1) current.addTempSkill("shyishi_noshan", "useCardEnd");
				}
			}
		},
	},
	shduiying: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		locked: false,
		mod: {
			aiOrder: function (player, card, num) {
				if (typeof card == "object" && player == _status.currentPhase) {
					if (get.name(card) == "sha") return 1;
				}
			},
		},
		trigger: {
			player: "useCardAfter",
		},
		filter: function (event, player) {
			return event.card.name == "sha" && player.countCards("h", card => get.color(card) != get.color(event.card)) && event.targets.filter(target => target.isIn()).length;
		},
		check: function (event, player) {
			var eff = -2;
			for (var target of event.targets.filter(target => target.isIn())) {
				eff += get.damageEffect(target, player, player);
			}
			return eff > 0;
		},
		async content(event, trigger, player) {
			const targets = trigger.targets.filter(target => target.isIn()).sortBySeat();
			const cards = player.getCards("h", card => get.color(card) != get.color(trigger.card));
			if (!targets.length || !cards.length) return;
			await player.showHandcards();
			await player.discard(cards);
			for (const target of targets) {
				await target.damage();
			}
		},
	},
	shhuisheng: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: ["phaseZhunbeiBegin", "phaseJieshuBegin"],
		},
		filter: function (event, player) {
			return !player.countCards("h");
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseTarget(get.prompt("shhuisheng"), "令一名角色摸两张牌，然后移动其装备区的一张牌")
				.set("ai", target => {
					if (target.countCards("e")) return get.effect(target, { name: "draw" }, player, player);
					return get.effect(target, { name: "draw" }, player, player) * 2;
				})
				.forResult();
		},
		async content(event, trigger, player) {
			const target = event.targets[0];
			await target.draw(2);
			if (player.canMoveCard(null, true, target))
				player
					.moveCard(true, [target])
					.set("nojudge", true)
					.set("prompt", "移动" + (target == player ? "你" : get.translation(target)) + "装备区一张牌");
		},
	},
	shhufen: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		mark: true,
		zhuanhuanji: true,
		marktext: "☯",
		intro: {
			content: function (storage, player, skill) {
				var str = player.storage.shhufen ? "出牌阶段开始或结束时，你须获得场上一张装备牌，然后对攻击范围外一名角色造成1点伤害。" : "出牌阶段开始或结束时，你须获得场上一张装备牌，然后对攻击范围内一名角色造成1点伤害。";
				return str;
			},
		},
		trigger: {
			player: ["phaseUseBegin", "phaseUseEnd"],
		},
		forced: true,
		filter: function (event, player) {
			return game.hasPlayer(current => current.countGainableCards(player, "e") > 0);
		},
		async content(event, trigger, player) {
			const isYang = player.storage.shhufen ? true : false;
			const targets = (
				await player
					.chooseTarget("虎忿：获得一名角色装备区里的一张牌", true, (card, player, target) => {
						return target.countGainableCards(player, "e");
					})
					.set("ai", target => {
						const player = _status.event.player;
						if (get.attitude(player, target) > 1 && target.hasSkill("xiaoji")) return 10;
						if (get.attitude(player, target) < 0) {
							if (
								target.hasCard(card => {
									return get.value(card, player) >= 6;
								})
							)
								return 12;
							return 8;
						}
						return 1;
					})
					.forResult()
			).targets;
			if (!targets.length) return;
			await player.gainPlayerCard("e", targets[0], true);
			player.changeZhuanhuanji("shhufen");
			const result2 = await player
				.chooseTarget("对一名攻击范围" + (isYang === true ? "外" : "内") + "的角色造成1点伤害", true, (card, player, target) => {
					if (isYang === true) return !player.inRange(target);
					return player.inRange(target);
				})
				.set("ai", target => {
					const player = _status.event.player;
					if (get.damageEffect(target, player, player) > 0) return get.damageEffect(target, player, player);
					return 1;
				})
				.forResult();
			if (result2.bool && result2.targets && result2.targets[0] && result2.targets[0].isIn()) await result2.targets[0].damage();
		},
	},
	shjianbei: {
		init2: function (player) {
			game.broadcastAll(function (player) {
				player._shjianbei_mark = player.mark("智", {
					content: "拥有技能【集智】",
				});
			}, player);
			player.addAdditionalSkill("shjianbei", ["jizhi"]);
		},
		onremove: function (player) {
			game.broadcastAll(function (player) {
				if (player._shjianbei_mark) {
					player._shjianbei_mark.delete();
					delete player._shjianbei_mark;
				}
			}, player);
			player.removeAdditionalSkills("shjianbei");
		},
		trigger: {
			player: "useCardAfter",
		},
		forced: true,
		zhuanhuaji: true,
		filter: function (event, player) {
			if (!player._shjianbei_mark || !player._shjianbei_mark.name) return false;
			if (get.type(event.card) != "equip") return false;
			if (player._shjianbei_mark.name == "智") return get.color(event.card) == "black";
			return get.color(event.card) == "red";
		},
		async content(event, trigger, player) {
			game.broadcastAll(function (player) {
				if (!player._shjianbei_mark) return;
				const newName = player._shjianbei_mark.name == "智" ? "勇" : "智";
				const newContent = player._shjianbei_mark.name == "智" ? "拥有技能【枭姬】" : "拥有技能【集智】";
				player._shjianbei_mark.name = newName;
				player._shjianbei_mark.skill = newName;
				player._shjianbei_mark.firstChild.innerHTML = newName;
				player._shjianbei_mark.info.content = newContent;
			}, player);
			const newSkill = player._shjianbei_mark.name == "智" ? ["jizhi"] : ["xiaoji"];
			player.addAdditionalSkills("shjianbei", newSkill);
		},
		derivation: ["jizhi", "xiaoji"],
	},
	shzaomeng: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseJieshuBegin",
		},
		filter: function (event, player) {
			return player.countCards("he", { type: "equip" });
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseCardTarget({
					position: "he",
					filterCard: card => get.type(card) == "equip",
					selectTarget: [1, 2],
					filterTarget: (card, player, target) => {
						return !target.isLinked();
					},
					ai1: card => get.unuseful(card) + 9,
					ai2: target => {
						const player = _status.event.player;
						if ((player.isLinked() || ui.selected.targets.includes(player)) && get.attitude(player, target) > 2) {
							if (player.getPrevious() == target || player.getNext() == target) return 1;
						} else if (target == player) return 1;
						return 0;
					},
					prompt: get.prompt("shzaomeng"),
					prompt2: "弃置一张装备牌，横置一至两名角色",
				})
				.setHiddenSkill(event.name)
				.forResult();
		},
		async content(event, trigger, player) {
			const targets = event.targets.sortBySeat();
			//player.logSkill(event.name, targets);
			await player.discard(event.cards);
			for (const current of targets) {
				await current.link(true);
				if (current.isLinked()) current.addTempSkill("shzaomeng_lock", { player: "linkAfter" });
			}
		},
		subSkill: {
			lock: {
				charlotte: true,
				popup: false,
				mark: true,
				audio: false,
				onremove: true,
				marktext: "艨",
				intro: {
					content: function (storage, player) {
						return "仅能因为火焰伤害而重置武将牌";
					},
				},
				trigger: {
					player: "linkBefore",
				},
				forced: true,
				async content(event, trigger, player) {
					const damageEvent = trigger?.getParent("damage");
					if (player.isLinked() && (!damageEvent || typeof damageEvent.hasNature !== "function" || !damageEvent.hasNature("fire"))) {
						trigger.cancel();
					}
				},
				ai: {
					effect: {
						target(card) {
							if (card.name == "tiesuo") return "zeroplayertarget";
						},
					},
				},
				sub: true,
			},
		},
	},

	shsuizhen2: {
		audio: "ext:水泊娘山/audio/shsuizhen1.mp3",
		locked: true,
		enable: "chooseToUse",
		filter(event, player) {
			if (event._shsuizhen2_refused) return false;
			var skillSources = game.filterPlayer(current => current.hasSkill("shsuizhen"));
			if (!player.storage.shsuizhen2_refused) player.storage.shsuizhen2_refused = [];
			for (var skillSource of skillSources) {
				if (get.sameBoatPlayer(skillSource).includes(player)) {
					var players = get.sameBoatPlayer(player).filter(current => current != player && !player.storage.shsuizhen2_refused.includes(current));
					if (!players.length) return false;
					for (var source of players) {
						var cards = source.getCards("h");
						for (var i of cards) {
							var card = get.autoViewAs(i);
							if (event.filterCard(card, player, event)) return true;
						}
					}
				}
			}
			return false;
		},
		hiddenCard(player, name) {
			if (player.hasSkill("shsuizhen2_refused")) return false;
			var skillSources = game.filterPlayer(current => current.hasSkill("shsuizhen"));
			for (var skillSource of skillSources) {
				if (get.sameBoatPlayer(skillSource).includes(player)) {
					var players = get.sameBoatPlayer(player).filter(current => current != player && !player.storage.shsuizhen2_refused.includes(current));
					if (!players.length) return false;
					for (var source of players) {
						var cards = source.getCards("h");
						for (var i of cards) {
							var card = get.autoViewAs(i);
							if (name == card.name) return true;
						}
					}
				}
			}

			return false;
		},
		chooseButton: {
			dialog(event, player) {
				var dialog = ui.create.dialog("随征", "hidden");
				var players = get.sameBoatPlayer(player).filter(current => current != player && !player.storage.shsuizhen2_refused.includes(current));
				for (var source of players) {
					var cards = source.getCards("h");
					if (cards.length) {
						var str = '<div class="text center">';
						str += get.translation(source);
						var num = source.getSeatNum();
						if (num > 0) str += "（" + get.cnNumber(num, true) + "号位）";
						str += "</div>";
						dialog.add(str);
						dialog.add(cards);
					}
				}
				return dialog;
			},
			filter(button, player) {
				var card = get.autoViewAs(button.link),
					evt = _status.event.getParent();
				return evt.filterCard(card, player, evt);
			},
			check(button) {
				if (_status.event.getParent().type != "phase") return 1;
				return _status.event.player.getUseValue(get.autoViewAs(button.link), null, true);
			},
			backup(links, player) {
				return {
					card: links[0],
					viewAs: get.autoViewAs(links[0]),
					filterCard: () => false,
					selectCard: -1,
					precontent() {
						"step 0";
						var card = lib.skill["shsuizhen2_backup"].card;
						event.card = card;
						event.result.cards = [card];
						event.source = get.owner(card);
						if (!event.result.card.storage) event.result.card.storage = {};
						event.result.card.storage._shsuizhen_owner = event.source;
						delete event.result.skill;
						player.logSkill("shsuizhen", event.source);
						if (player.storage.shsuizhen2_allowed.includes(event.source)) event.finish();
						("step 1");
						if (event.result.targets && event.result.targets.length) player.line(event.result.targets, event.result.card.nature);
						player.showCards([card], get.translation(player) + "向" + get.translation(source) + "发动【随征】");
						source
							.chooseButton(
								[
									"是否同意" + get.translation(player) + "使用" + get.translation(card) + "？",
									'<div class="text center">' +
										(function () {
											if (event.result.targets && event.result.targets.length) return "（目标角色：" + get.translation(event.result.targets) + "）";
											return "（无目标角色）";
										})() +
										"</div>",
									[["　　 同意 　　", "　　不同意　　"], "tdnodes"],
									[["　　 同意且本回合内不再提示 　　"], "tdnodes"],
									[["　　不同意且本回合内不再提示　　"], "tdnodes"],
									"forcebutton",
								],
								true
							)
							.set("ai", button => {
								//game.log(button.link);
								//game.log(_status.event.player,_status.event.requester,get.attitude(_status.event.player,_status.event.requester))
								if (button.link == "　　 同意且本回合内不再提示 　　") {
									if (get.attitude(_status.event.player, _status.event.requester) > 2) return 1.6 + Math.random();
									return 0;
								} else if (button.link == "　　 同意 　　") {
									if (get.attitude(_status.event.player, _status.event.requester) > 1) return 1.2 + Math.random();
									return 0;
								} else if (button.link == "　　不同意且本回合内不再提示　　") {
									if (get.attitude(_status.event.player, _status.event.requester) < 0) return 1.8 + Math.random();
									return 0;
								}
								return 0;
							})
							.set("requester", player)
							.set("forceAuto", true);
						("step 2");
						if (result.links[0].indexOf("不同意") == -1) {
							source.chat("同意");
							if (result.links[0].indexOf("本回合内不再提示") > 0) {
								player.addTempSkill("shsuizhen2_allowed");
								player.storage.shsuizhen2_allowed.add(event.source);
							}
						} else if (result.links[0].indexOf("不同意") != -1) {
							source.chat("不同意");
							if (result.links[0].indexOf("本回合内不再提示") > 0) {
								player.addTempSkill("shsuizhen2_refused");
								player.storage.shsuizhen2_refused.add(event.source);
							} else if (event.result.card.name == "wuxie") {
								player.addTempSkill("shsuizhen2_refused", "_wuxieAfter");
								player.storage.shsuizhen2_refused.add(event.source);
							}
							var evt = event.getParent();
							evt.set("_shsuizhen2_refused", true);
							evt.goto(0);
						}
					},
				};
			},
			prompt(links, player) {
				return "请选择" + get.translation(links[0]) + "的目标";
			},
		},
		ai: {
			order: 10,
			result: {
				player(player, target) {
					if (!get.sameBoatPlayer(player).filter(current => current != player).length) return 0;
					if (_status.event.dying) return get.attitude(player, _status.event.dying);
					return 1;
				},
			},
			respondSha: true,
			respondShan: true,
			skillTagFilter(player, tag, arg) {
				var name;
				switch (tag) {
					case "respondSha":
						name = "sha";
						break;
					case "respondShan":
						name = "shan";
						break;
				}
				return lib.skill["shsuizhen2"].hiddenCard(player, name);
			},
		},
		subSkill: {
			refused: {
				charlotte: true,
				init: function (player) {
					if (!player.storage.shsuizhen2_refused) player.storage.shsuizhen2_refused = [];
				},
				onremove: function (player, skill) {
					player.storage.shsuizhen2_refused = [];
				},
				mark: true,
				sub: true,
			},
			allowed: {
				charlotte: true,
				init: function (player) {
					if (!player.storage.shsuizhen2_allowed) player.storage.shsuizhen2_allowed = [];
				},
				onremove: function (player, skill) {
					player.storage.shsuizhen2_allowed = [];
				},
				mark: true,
				sub: true,
			},
		},
	},
	shsuizhen3: {
		trigger: {
			player: "phaseDrawBegin2",
		},
		forced: true,
		filter: function (event, player) {
			var skillSources = game.filterPlayer(current => current.hasSkill("shsuizhen"));
			for (var skillSource of skillSources) {
				//game.log(get.sameBoatPlayer(skillSource),player);
				if (get.sameBoatPlayer(skillSource).includes(player)) {
					return !event.numFixed;
				}
			}
			return false;
		},
		content: function () {
			trigger.num++;
		},
		ai: {
			threaten: 1.3,
		},
	},
	shsuizhen: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		init: function (player) {
			for (var i of game.filterPlayer()) {
				i.addTempSkill("shsuizhen2_refused");
				i.addTempSkill("shsuizhen2_allowed");
			}
		},
		locked: true,
		sameboatSkill: true,
		global: ["shsuizhen2", "shsuizhen3"],
	},
	shxufa: {
		trigger: {
			player: "damageEnd",
			source: "damageSource",
		},
		filter: function (event, player) {
			return !player.hasSkill("shxufa_blocker");
		},
		async cost(event, trigger, player) {
			const list = [];
			const X =
				player.getHistory("useSkill", evt => {
					return evt.skill == "shxufa";
				}).length + 1;
			let choiceList = ["弃置" + get.cnNumber(X) + "张牌", "对一名手牌数不小于你的角色造成1点伤害，然后将手牌摸至" + get.cnNumber(X) + "张"];
			if (player.countCards("he") >= X) list.push("弃牌");
			else choiceList[0] = '<span style="opacity:0.5; ">' + choiceList[0] + "</span>";
			list.push("打伤害");
			list.push("cancel2");
			const result = await player
				.chooseControl(list)
				.set("prompt", get.prompt("shxufa"))
				.set("choiceList", choiceList)
				.set("ai", () => {
					if (
						game.hasPlayer(current => {
							return player.countCards("h") <= current.countCards("h") && get.damageEffect(current, player, player) > 0;
						})
					)
						return "打伤害";
					return "cancel2";
				})
				.forResult();
			event.result = {
				bool: result.control != "cancel2",
				cost_data: result.control,
			};
		},
		async content(event, trigger, player) {
			const X = player.getHistory("useSkill", evt => {
				return evt.skill == "shxufa";
			}).length;
			if (!X) return;
			if (event.cost_data == "弃牌") {
				await player.chooseToDiscard("he", X, true);
				if (player.storage.shxufa_last && player.storage.shxufa_last == 1) {
					if (!player.storage.shxufa_damage) player.setStorage("shxufa_damage", 0);
					player.addTempSkill("shxufa_damage", "roundStart");
					player.storage.shxufa_damage++;
				}
				player.storage.shxufa_last = 1;
				player.markSkill("shxufa");
			} else {
				const targets = (
					await player
						.chooseTarget(
							"对一名手牌数不小于你的角色造成1点伤害",
							(card, player, target) => {
								return _status.event.player.countCards("h") <= target.countCards("h");
							},
							true
						)
						.set("ai", target => {
							const player = get.event().player;
							return get.damageEffect(target, player, player);
						})
						.forResult()
				).targets;
				if (targets && targets.length > 0) {
					if (player.storage.shxufa_last && player.storage.shxufa_last == 2) {
						player.addTempSkill("shxufa_blocker", "roundStart");
					}
					player.storage.shxufa_last = 2;
					player.markSkill("shxufa");
					await targets[0].damage();
					await player.drawTo(X);
				}
			}
		},
		intro: {
			content: function (storage, player) {
				let str = "上次选择的项:";
				if (player.storage.shxufa_last == 1) str += "弃牌";
				else str += "打伤害";
				if (player.hasSkill("shxufa_blocker")) str += "<br>蓄发本轮已失效";
				if (player.storage.shxufa_damage) str += "<br>本轮造成的伤害+" + player.storage.shxufa_damage + "<br>本轮受到的伤害-" + player.storage.shxufa_damage;
				return str;
			},
		},
		subSkill: {
			blocker: {
				charlotte: true,
				sub: true,
			},
			damage: {
				onremove: function (player, skill) {
					player.storage.shxufa_damage = 0;
				},
				mark: true,
				trigger: {
					player: "damageBegin3",
					source: "damageBegin1",
				},
				forced: true,
				filter: function (event, player) {
					return player.storage.shxufa_damage;
				},
				content: function () {
					if (trigger.source == player && event.triggername == "damageBegin1") trigger.num += player.storage.shxufa_damage;
					if (trigger.player == player && event.triggername == "damageBegin3") trigger.num -= player.storage.shxufa_damage;
				},
				sub: true,
			},
		},
	},
	shhaoyong: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			return (
				player.countCards("h") > 0 &&
				!player.hasSkillTag("noCompareSource") &&
				game.hasPlayer(function (current) {
					return current != player && current.countCards("h") > 0 && !current.hasSkillTag("noCompareTarget");
				})
			);
		},
		selectCard: [1, Infinity],
		filterCard: function (card, player) {
			var num = 0;
			for (var i = 0; i < ui.selected.cards.length; i++) {
				num += get.number(ui.selected.cards[i]);
			}
			return num + get.number(card) <= 13;
		},
		check: function (card) {
			return get.number(card) / 1.4 - get.value(card);
		},
		discard: false,
		lose: false,
		complexCard: true,
		complexSelect: true,
		filterTarget: function (card, player, target) {
			return target != player && target.countCards("h") > 0 && !target.hasSkillTag("noCompareTarget");
		},
		async content(event, trigger, player) {
			const target = event.target;
			const exs = event.cards;
			const next = player.addToExpansion(exs, player, "giveAuto");
			next.gaintag.add("shhaoyong");
			await next;
			while (player.canCompare(target) && player.getExpansions("shhaoyong").length > 0) {
				const cards = player.getExpansions("shhaoyong");
				game.log(cards);
				const { bool, links } = await player.chooseButton(["选择一张作为拼点牌", cards], true).forResult();
				if (!bool) continue;
				const result2 = await player
					.chooseToCompare(target)
					.set("fixedResult", { [player.playerid]: links[0] })
					.forResult();
				if (!result2.tie) {
					if (result2.bool) {
						await player.draw(player.getExpansions("shhaoyong").length + 1);
					} else {
						if (player.getExpansions("shhaoyong").length > 0) await player.chooseToDiscard(player.getExpansions("shhaoyong").length, true, "he");
					}
				} else {
					await player.draw(player.getExpansions("shhaoyong").length + 1);
					if (player.getExpansions("shhaoyong").length > 0) await player.chooseToDiscard(player.getExpansions("shhaoyong").length, true, "he");
				}
			}
		},
		ai: {
			order: 10,
			result: {
				target: -1,
			},
		},
		marktext: "资",
		intro: {
			markcount: "expansion",
			mark: function (dialog, content, player) {
				var content = player.getExpansions("shhaoyong");
				if (content && content.length) {
					if (player == game.me || player.isUnderControl()) {
						dialog.addAuto(content);
					} else {
						return "剩余" + get.cnNumber(content.length) + "张";
					}
				}
			},
		},
	},
	shshaqian: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseJieshuBegin",
		},
		filter: function (event, player) {
			return game.hasPlayer(function (current) {
				return (
					current != player &&
					current.getHistory("lose", function (evt) {
						return (
							evt.cards2 &&
							evt.cards2.length > 0 &&
							evt.cards2.filter(card => {
								return get.number(card, false) > 10 || get.number(card, false) == 1;
							}).length > 0
						);
					}).length > 0
				);
			});
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseTarget(get.prompt("shshaqian"), "对一名本回合失去过字母牌的其他角色造成1点伤害。", (card, player, target) => {
					return (
						target != player &&
						target.getHistory("lose", function (evt) {
							return (
								evt.cards2 &&
								evt.cards2.length > 0 &&
								evt.cards2.filter(card => {
									return get.number(card, false) > 10 || get.number(card, false) == 1;
								}).length > 0
							);
						}).length > 0
					);
				})
				.set("ai", target => {
					const player = get.event().player;
					return get.damageEffect(target, player, player);
				})
				.forResult();
		},
		async content(event, trigger, player) {
			const target = event.targets[0];
			await target.damage();
		},
	},
	shchaqing: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "phaseZhunbeiBegin",
		},
		round: 1,
		filter(event, player) {
			return event.player !== player;
		},
		async cost(event, trigger, player) {
			const list = [];
			let choiceList = ["与" + get.translation(trigger.player) + "各失去1点体力", "与" + get.translation(trigger.player) + "各弃置两张手牌"];
			list.push("失去体力");
			if (player.countCards("h") > 0 && trigger.player.countCards("h") > 0) list.push("弃置手牌");
			else choiceList[1] = '<span style="opacity:0.5; ">' + choiceList[1] + "</span>";
			list.push("cancel2");
			const result = await player
				.chooseControl(list)
				.set("prompt", get.prompt("shchaqing"))
				.set("choiceList", choiceList)
				.set("ai", () => {
					const player = get.event().player,
						target = get.event().target;
					if (get.attitude(player, target) > -1 || player.hp < 2) return "cancel2";
					return list[0];
				})
				.set("target", trigger.player)
				.forResult();
			event.result = {
				bool: result.control != "cancel2",
				cost_data: result.control,
			};
		},
		async content(event, trigger, player) {
			if (event.cost_data == "失去体力") {
				await player.loseHp();
				await trigger.player.loseHp();
				await player.addTempSkill("shchaqing_lose");
			} else if (event.cost_data == "弃置手牌") {
				if (player.countCards("h")) {
					await player.chooseToDiscard(2, true, "h");
				}
				if (trigger.player.countCards("h")) {
					await trigger.player.chooseToDiscard(2, true, "h");
				}
				await player.addTempSkill("shchaqing_dis");
			}
		},
		ai: {
			threaten: 6,
		},
		subSkill: {
			lose: {
				trigger: {
					global: ["loseAfter", "loseAsyncAfter"],
				},
				forced: true,
				filter(event, player) {
					if (event.type != "discard") return false;
					return game.hasPlayer(current => {
						var evt = event.getl(current);
						if (!evt || !evt.cards2) {
							return false;
						}
						return true;
					});
				},
				async content(event, trigger, player) {
					const targets = [],
						players = game.filterPlayer().sortBySeat(_status.currentPhase);
					for (const current of players) {
						const evt = trigger.getl(current);
						if (!evt || !evt.cards2) {
							continue;
						}
						if (evt.cards2.length) {
							await player.recover(evt.cards2.length);
						}
					}
				},
				sub: true,
			},
			dis: {
				trigger: {
					global: "changeHpAfter",
				},
				filter(event, player) {
					return event.num < 0;
				},
				forced: true,
				async content(event, trigger, player) {
					await player.draw(-1 * trigger.num);
				},
				sub: true,
			},
		},
	},
	shjianyun: {
		trigger: {
			target: "useCardToTargeted",
		},
		filter: function (event, player) {
			return event.card.name == "jiu";
		},
		forced: true,
		locked: false,
		async content(event, trigger, player) {
			if (trigger.player.isIn() && player.hp > 0) await player.damage(trigger.player);
		},
	},
	shjixian: {
		enable: "phaseUse",
		usable: 2,
		filter: function (event, player) {
			return game.hasPlayer(function (current) {
				return current.hp > player.hp || current.countCards("h") > player.countCards("h");
			});
		},
		filterTarget: function (card, player, target) {
			return target.hp > player.hp || target.countCards("h") > player.countCards("h");
		},
		async content(event, trigger, player) {
			const target = event.target;
			var flag = true;
			if (target.countCards("h") > player.countCards("h")) {
				const forced = target.hp > player.hp ? false : true;
				if (target.countDiscardableCards(player, "he") > 0) {
					const result = await player.discardPlayerCard(target, 2, "he", forced).forResult();
					if (result?.bool && result.links?.length) {
						flag = false;
						if (target.countCards("h") > player.countCards("h")) await player.draw();
					}
				}
			}
			if (target.hp > player.hp && flag) {
				await target.damage();
				if (target.hp > player.hp) await player.recover();
			}
			if (player.storage.shjixian_last && player.storage.shjixian_last == target) {
				const result2 = await target
					.chooseBool("是否视为对" + get.translation(player) + "使用一张【杀】？")
					.set("ai", function () {
						const player1 = get.event().player;
						const player2 = _status.event.getParent().player;
						return get.effect(player2, { name: "sha" }, player1, player1);
					})
					.forResult();
				if (result2.bool) {
					target.useCard({ name: "sha", isCard: true }, player, false);
				}
			}
			player.storage.shjixian_last = target;
			player.markSkill("shjixian");
		},
		intro: {
			mark: function (dialog, content, player) {
				dialog.addText("上次嫉贤选择的角色");
				dialog.add([player.storage.shjixian_last]);
			},
		},
		ai: {
			order: 10,
			result: {
				target: -1,
			},
		},
	},
	shxiaxin: {
		locked: true,
		mod: {
			maxHandcard: function (player, num) {
				if (
					game.hasPlayer(current => {
						return player.inRange(current) && current.hp > player.hp && current.countCards("h") > player.countCards("h");
					})
				)
					return num - 1;
			},
		},
	},
	shchizhu: {
		unique: true,
		trigger: {
			player: "useCardToPlayer",
			target: "useCardToTarget",
		},
		zhuSkill: true,
		filter: function (event, player) {
			if (get.type(event.card) != "trick" && get.type(event.card) != "basic") return false;
			if (player.hasSkill("shchizhu_blocker")) return false;
			return game.hasPlayer(function (current) {
				if (current.group != "liang") return false;
				return !event.targets.includes(current) && lib.filter.targetEnabled2(event.card, event.player, current);
			});
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseTarget(get.prompt("shchizhu"), "令一名梁山势力角色成为" + get.translation(trigger.card) + "的额外目标。", (card, player, target) => {
					if (target.group != "liang") return false;
					return !trigger.targets.includes(target) && lib.filter.targetEnabled2(trigger.card, trigger.player, target);
				})
				.set("ai", target => {
					const player = get.event().player;
					return get.effect(target, trigger.card, player, player);
				})
				.forResult();
		},
		async content(event, trigger, player) {
			trigger.targets.addArray(event.targets);
			player.addTempSkill("shchizhu_blocker");
			if (get.tag(trigger.card, "damage")) await player.draw(2);
		},
		subSkill: {
			blocker: {
				charlotte: true,
				sub: true,
			},
		},
	},
	shweiji: {
		locked: false,
		global: "shweiji_global",
		subSkill: {
			global: {
				trigger: {
					global: ["linkBegin", "turnOverBefore"],
				},
				filter(event, player) {
					//game.log(event.name)
					if (!player.isMaxHandcard()) return false;
					if (
						!game.hasPlayer(current => {
							return current.hasSkill("shweiji") && current == _status.currentPhase;
						}) &&
						event.player != _status.currentPhase
					)
						return false;
					if (event.name == "link") return !event.player.isLinked();
					return true;
				},
				async cost(event, trigger, player) {
					event.result = await player
						.chooseToDiscard(get.prompt("shweiji", trigger.player), "弃置至多两张手牌并令一名有伪缉的角色摸等量牌，然后取消" + get.translation(trigger.player) + (trigger.name == "link" ? "的横置" : "的翻面"), "h", [1, 2])
						.set("ai", function (card) {
							const target = trigger.player;
							const player = get.event().player;
							const sources = game.filterPlayer(current => {
								return current.hasSkill("shweiji");
							});
							if (trigger.name != "link" && get.attitude(player, target) > 2 && !ui.selected.cards.length && !trigger.player.hasSkill("shjinchong")) return 8 - get.value(card);
							for (const source of sources) {
								if (get.attitude(player, source) > 2) return 4 - get.value(card);
							}
							return 0;
						})
						.set("complexCard", true)
						.forResult();
				},
				async content(event, trigger, player) {
					const sources = game.filterPlayer(current => {
						return current.hasSkill("shweiji");
					});
					const num = event.cards.length;
					if (!sources.length || !num) return;
					var source = sources[0];
					//game.log(sources,num);
					if (sources.length > 1 && trigger.player == _status.currentPhase) {
						const result = await player
							.chooseTarget("令一名有伪缉的角色摸" + get.cnNumber(num) + "张牌", (card, player, target) => {
								return target.hasSkill("shweiji");
							})
							.set("ai", target => {
								return get.attitude(get.event().player, target) + 20;
							})
							.set("forced", true)
							.forResult();
						if (!result.bool) return;
						source = result.targets[0];
					}
					if (!source.isIn()) return;
					//game.log(source,num);
					await source.draw(num);
					trigger.cancel();
				},
				sub: true,
			},
		},
	},
	shchongjia: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "damageEnd",
		},
		filter(event, player, name) {
			if (player.hasSkill("shchongjia_blocker")) return false;
			const bool1 = event.player && event.player.isIn() && !event.player.isLinked();
			const bool2 = event.source && event.source.isIn() && !event.source.isLinked();
			if (!bool1 && !bool2 && (!event.source || !event.source.isIn())) return false;
			//if(player.storage.shchongjia && !bool1 && !bool2) return false;
			return event.player && get.distance(player, event.player) <= 1;
		},
		direct: true,
		async content(event, trigger, player) {
			var maxChoose = trigger.source && trigger.source.isIn() && trigger.source != player ? 2 : 1;
			var canRepeat = trigger.player && trigger.player != player ? true : false;
			var hasRepeat = false;
			const list = [`摸一张牌并横置${trigger.source ? get.translation(trigger.source) : "伤害来源"}或${trigger.player ? get.translation(trigger.player) : "受伤角色"}`, `对${trigger.source ? get.translation(trigger.source) : "伤害来源"}造成1点雷电伤害`];
			const links2 = [];
			if (!player.storage.shchongjia) {
				const { bool, links } = await player
					.chooseButton([get.prompt("shchongjia"), maxChoose == 1 ? "请选择一项" : "请选择一至两项", [list.slice(0, 1), "tdnodes"], [list.slice(1, 2), "tdnodes"]])
					.set("selectButton", [1, maxChoose])
					.set("filterButton", function (button) {
						if (button.link[0] == "摸") {
							const bool1 = trigger.source && trigger.source.isIn() && !trigger.source.isLinked();
							const bool2 = trigger.player && trigger.player.isIn() && !trigger.player.isLinked();
							return bool1 || bool2;
						}
						return trigger.source && trigger.source.isIn() && !player.storage.shchongjia;
					})
					.set("ai", function (button) {
						if (button.link[0] == "摸") {
							return 1.6 + Math.random();
						}
						if (get.damageEffect(trigger.source, _status.event.player, _status.event.player, "thunder") <= 0) return 0;
						return get.damageEffect(trigger.source, _status.event.player, _status.event.player, "thunder") + Math.random();
					})
					.forResult();
				if (!bool) return;
				player.logSkill("shchongjia");
				player.addTempSkill("shchongjia_blocker");
				for (var link of links) links2.push(link[0]);
			}
			if (links2.includes("摸")) {
				do {
					const preTargets = [];
					if (trigger.source && trigger.source.isIn() && !trigger.source.isLinked()) preTargets.push(trigger.source);
					if (trigger.player && trigger.player.isIn() && !trigger.player.isLinked()) preTargets.push(trigger.player);
					if (!preTargets.length) break;
					var target = preTargets[0];
					if (preTargets.length > 1) {
						const result1 = await player
							.chooseTarget(list[0], (card, player, target) => {
								return !target.isLinked() && preTargets.includes(target);
							})
							.set("ai", target => {
								const player = get.event().player;
								if (player == _status.currentPhase || target == _status.currentPhase) return 10 - get.attitude(player, target);
								return -get.attitude(player, target);
							})
							.set("forced", true)
							.forResult();
						if (!result1.bool) break;
						target = result1.targets[0];
					}
					await player.draw();
					await target.link(true);
					if (canRepeat && !hasRepeat && ((trigger.source && trigger.source.isIn() && !trigger.source.isLinked()) || (trigger.player && trigger.player.isIn() && !trigger.player.isLinked()))) {
						const result2 = await player
							.chooseBool("是否再次执行横置项？")
							.set("ai", function () {
								const player = get.event().player;
								const source = trigger.source;
								return get.attitude(player, source) > 0;
							})
							.forResult();
						canRepeat = result2.bool;
						hasRepeat = result2.bool;
					} else break;
				} while (canRepeat);
			}
			if (links2.includes("对")) {
				canRepeat = trigger.player && trigger.player != player ? true : false;
				do {
					if (!trigger.source || !trigger.source.isIn()) break;
					var num = 1;
					await trigger.source.damage(num, "thunder");
					if (canRepeat && !hasRepeat && trigger.source && trigger.source.isIn()) {
						const result2 = await player
							.chooseBool("是否再次执行打伤害项？")
							.set("ai", function () {
								const player = get.event().player;
								return true;
							})
							.forResult();
						canRepeat = result2.bool;
						hasRepeat = result2.bool;
					} else break;
				} while (canRepeat);
			}
		},
		subSkill: {
			blocker: {
				charlotte: true,
				sub: true,
			},
		},
		ai: {
			maixie_defend: true,
		},
	},
	shxiaxing: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			player: "gainAfter",
		},
		filter: function (event, player) {
			return event.getParent().name != "draw";
		},
		logTarget() {
			return _status.currentPhase;
		},
		check(event, player) {
			return get.attitude(player, _status.currentPhase) > 2;
		},
		async content(event, trigger, player) {
			//await game.asyncDraw([player, _status.currentPhase]);
			await _status.currentPhase.draw();
			if (player.inRange(_status.currentPhase)) await player.draw();
			if (player != _status.currentPhase) {
				_status.currentPhase.addTempSkill("shxiaxing_maxHd");
				if (!_status.currentPhase.storage.shxiaxing_maxHd) _status.currentPhase.setStorage("shxiaxing_maxHd", 0);
				_status.currentPhase.storage.shxiaxing_maxHd++;
			}
		},
		subSkill: {
			maxHd: {
				charlotte: true,
				onremove: function (player, skill) {
					player.storage.shxiaxing_maxHd = 0;
				},
				mod: {
					maxHandcard: function (player, num) {
						return num + player.storage.shxiaxing_maxHd;
					},
				},
				mark: true,
				intro: {
					content: "本回合手牌上限+#",
				},
			},
		},
	},
	shyijie: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		locked: false,
		enable: "phaseUse",
		viewAs(cards, player) {
			var source = game.findPlayer(current => current.hasSkill("shxueshi") && current.hp == 1);
			var name = source ? "sha" : "tuixinzhifu";
			return {
				name: name,
				storage: {
					shyijie: true,
				},
			};
		},
		filterCard: {
			type: "basic",
		},
		position: "hs",
		filter: function (event, player) {
			const num = game.countPlayer(function (current) {
				return current.hasSkill("shyijie");
			});
			if ((player.getStat("skill").shyijie || 0) >= num) return false;
			return player.countCards("hs", { type: "basic" }) > 0;
		},
		filterTarget: function (card, player, target) {
			var source = game.findPlayer(current => current.hasSkill("shxueshi") && current.hp == 1);
			var name = source ? "sha" : "tuixinzhifu";
			if (!card) card = get.card();
			if (!player.inRange(target)) return false;
			return player.canUse({ name: name, cards: ui.selected.cards }, target, false);
		},
		check(card) {
			var source = game.findPlayer(current => current.hasSkill("shxueshi") && current.hp == 1);
			if (source) return 6 - get.value(card);
			var num = 4 - (_status.event.player.getStat("skill").shyijie || 0);
			if (_status.event.player.hasSkill("shxiaxing") || game.hasPlayer(target => _status.event.player.inRange(target) && target.hasSkill("shxiaxing") && get.attitude(_status.event.player, target) > 2)) num += 3;
			return num - get.value(card);
		},
		prompt: function () {
			var player = _status.event.player;
			var source = game.findPlayer(current => current.hasSkill("shxueshi") && current.hp == 1);
			if (source) return "将一张基本牌当【杀】对攻击范围内的角色使用";
			return "将一张基本牌当【推心置腹】对攻击范围内的角色使用";
		},
		mod: {
			cardUsable: function (card, player) {
				if (card.storage && card.storage.shyijie) return Infinity;
			},
		},
		ai: {
			order: function (item, player) {
				var source = game.findPlayer(current => current.hasSkill("shxueshi") && current.hp == 1);
				if (source) return get.order({ name: "sha" }) + 0.2;
				return get.order({ name: "tuixinzhifu" }) + 0.2;
			},
			ai: {
				effect: {
					player: function (card, player, target) {
						if (!player) player = _status.event.player;
						if (!player.hasSkill("shxiaxing") && !target.hasSkill("shxiaxing")) return;
						if (card.name == "tuixinzhifu") {
							if (player.hasSkill("shxiaxing")) return [1, get.effect(player, { name: "draw" }, player, player)];
							if (target.hasSkill("shxiaxing") && get.attitude(player, target) > 1) {
								var eff = get.effect(player, { name: "draw" }, player, player);
								if (target.inRange(player)) eff += get.effect(target, { name: "draw" }, player, player);
								return [1, eff];
							}
						}
					},
				},
			},
		},
		tuixinzhifuContent: function () {
			"step 0";
			player.gainPlayerCard(target, "hej", true, [1, 2]).set("ai", function (button) {
				var val = get.buttonValue(button);
				if (get.attitude(_status.event.player, get.owner(button.link)) > 0) {
					if (get.position(button.link) == "e") val += 5;
					return -val;
				}
				return val;
			});
			("step 1");
			if (result.bool && target.isIn()) {
				var num = result.cards.length,
					hs = player.getCards("h");
				event.num = num;
				if (!hs.length) event.finish();
				else if (hs.length < num) event._result = { bool: true, cards: hs };
				else
					player
						.chooseCard("h", true, [num, num + 1], "交给" + get.translation(target) + get.cnNumber(num) + "张牌" + "且你可以多交一张牌令其获得义结")
						.set("ai", function (card) {
							var player = _status.event.player;
							var target = _status.event.target;
							var num = _status.event.num;
							var val = get.value(card, target) + 90;
							if (["jiedao", "shunshou", "wugu"].includes(get.name(card)) && target.hasSkill("shxiaxing")) val += 5;
							//game.log(num,ui.selected.cards.length|0);
							if (ui.selected.cards && num == ui.selected.cards.length && (get.attitude(player, target) < 1.5 || target.hasSkill("shyijie"))) return 0;
							if (get.attitude(player, target) > 1.5) return val - get.value(card, player);
							return 100 - get.value(card, player);
						})
						.set("target", target)
						.set("num", num);
			} else event.finish();
			("step 2");
			if (result.bool) {
				player.give(result.cards, target);
				if (event.num < result.cards.length && !target.hasSkill("shyijie")) target.addSkills("shyijie");
			}
		},
		global: "shyijie_global_ai",
		group: "shyijie_tuixinzhifu",
		subSkill: {
			tuixinzhifu: {
				trigger: {
					player: "tuixinzhifuBegin",
				},
				forced: true,
				locked: false,
				popup: false,
				filter: function (event, player) {
					return event.card.storage && event.card.storage.shyijie;
				},
				content: function () {
					trigger.setContent(lib.skill.shyijie.tuixinzhifuContent);
				},
				sub: true,
			},
			global_ai: {
				charlotte: true,
				ai: {
					effect: {
						target: function (card, player, target) {
							if (card.name == "tuixinzhifu" && get.attitude(target, player) > 0) {
								if (card.storage.shyijie && !target.hasSkill("shyijie") && player.hasSkill("shyijie")) return [1, get.attitude(target, player)];
								if (target.hasSkill("shxiaxing") && get.attitude(player, target) > 1) {
									var eff = get.effect(player, { name: "draw" }, player, player);
									if (target.inRange(player)) eff += get.effect(target, { name: "draw" }, player, player);
									return [1, eff];
								}
							}
						},
					},
				},
				sub: true,
			},
		},
	},

	shxueshi: {
		unique: true,
		global: "shxueshi2",
		zhuSkill: true,
		forced: true,
		trigger: {
			player: "changeHp",
		},
		firstDo: true,
		filter(event, player) {
			return player.hasZhuSkill("shxueshi");
		},
		async content() {},
		mark: true,
	},
	shxueshi2: {
		mod: {
			attackFrom(from, to, distance) {
				if (from.group != "liang" && !from.hasSkill("shxueshi")) return;
				const sources = game.filterPlayer(current => current.hasSkill("shxueshi"));
				if (!sources.length) return;
				var num1 = Math.max(1, sources[0].hp);
				var num2 = Math.max(1, sources[0].getDamagedHp());
				var source1 = sources[0];
				var source2 = sources[0];
				for (var current of sources) {
					if (current.hp > num1) {
						num1 = Math.max(1, current.hp);
						source1 = current;
					}
					if (Math.max(1, current.getDamagedHp()) > num2) {
						num2 = Math.max(1, current.getDamagedHp());
						source2 = current;
					}
				}
				if (source1 && source1 == from && from.hasSkill("shxueshi")) return distance - Math.max(1, source1.hp) + 1;
				else if (source2 && source2 != from && from.group == "liang") return distance - Math.max(1, source2.getDamagedHp()) + 1;
			},
		},
	},
	shzhuanfu: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		unique: true,
		limited: true,
		enable: "phaseUse",
		animationColor: "metal",
		skillAnimation: true,
		filter: function (event, player) {
			return (
				player.countCards("h", card => {
					return get.type(card) != "delay";
				}) > 0
			);
		},
		position: "h",
		filterCard: function (card) {
			return get.type(card) != "delay";
		},
		check: function (card) {
			if (_status.event.player.getUseValue(card) < 6 || get.type(card) == "equip") return 0;
			return _status.event.player.getUseValue(card) / 5;
		},
		discard: false,
		lose: false,
		delay: false,
		async content(event, trigger, player) {
			player.awakenSkill("shzhuanfu");
			const card = event.cards[0];
			const name = get.name(card, false);
			const info = get.info(card);
			if (get.type(card) != "equip") {
				const yingbian_Condition = ["yingbian_fujia", "yingbian_kongchao", "yingbian_canqu", "yingbian_zhuzhan"];
				const yingbian_Effect = [];
				if (info.allowMultiple != false && !info.notarget) yingbian_Effect.add("yingbian_add");
				if (lib.skill.xunshi.isXunshi(card)) yingbian_Effect.add("yingbian_remove");
				if (name == "sha") yingbian_Effect.add("yingbian_damage");
				yingbian_Effect.add("yingbian_draw");
				if (name == "shan" || name == "wuxie") yingbian_Effect.add("yingbian_gain");
				if (!["shan", "tao", "jiu", "du"].includes(name)) yingbian_Effect.add("yingbian_hit");
				const buttonList1 = yingbian_Condition.map(i => get.translation(i + "_tag"));
				const buttonList2 = yingbian_Effect.map(i => get.translation(i + "_tag"));
				if (!buttonList1.length || !buttonList2.length) return;
				const retranslation = function (translate) {
					var conditions = ["yingbian_fujia", "yingbian_kongchao", "yingbian_canqu", "yingbian_zhuzhan"];
					var effects = Array.from(lib.yingbian.effect.keys());
					for (var condition of conditions) {
						if (get.translation(condition + "_tag") == translate) return condition;
					}
					for (var effect of effects) {
						if (get.translation("yingbian_" + effect + "_tag") == translate) return "yingbian_" + effect;
					}
				};
				const { bool, links } = await player
					.chooseButton(2, ["篆符：请选择为" + get.translation(card) + (get.is.yingbian(card) ? "修改" : "添加") + "应变条件及应变效果", [buttonList1, "tdnodes"], [buttonList2, "tdnodes"]], true)
					.set("filterButton", function (button) {
						if (ui.selected.buttons.length) {
							var flag = buttonList1.includes(button.link) ? 1 : 2;
							var sflag = buttonList1.includes(ui.selected.buttons[0].link) ? 1 : 2;
							return flag != sflag;
						}
						return buttonList1.includes(button.link);
					})
					.set("ai", function (button) {
						const user = _status.event.player;
						const bLink = retranslation(button.link);
						switch (bLink) {
							case "yingbian_fujia": {
								if (user.isMaxHandcard(true)) return 1.2 + Math.random();
								return 0.2;
							}
							case "yingbian_kongchao": {
								if (user.countCards("h") <= 1) return 1.35 + Math.random();
								return 0.2;
							}
							case "yingbian_canqu": {
								if (user.hp == 1) return 1.3 + Math.random();
								return 0.5;
							}
							case "yingbian_zhuzhan": {
								if (user.getFriends().length) return 1.4 + Math.random();
								return 0;
							}
							case "yingbian_add": {
								if (!lib.skill.xunshi.isXunshi(card)) return 0.7 + Math.random();
								return 0;
							}
							case "yingbian_remove": {
								return 0.5 + Math.random();
							}
							case "yingbian_damage": {
								return 1.2 + Math.random();
							}
							case "yingbian_draw": {
								return 2 + Math.random();
							}
							case "yingbian_gain": {
								return 0.6 + Math.random();
							}
							case "yingbian_hit": {
								if (get.tag(card, "damage")) return 1.5 + Math.random();
								return 0.7;
							}
						}
					})
					.forResult();
				if (!bool) return;
				if (!buttonList1.includes(links[0])) links.reverse();
				if (!_status.cardtag[retranslation(links[0])]) _status.cardtag[retranslation(links[0])] = [];
				if (!_status.cardtag[retranslation(links[1])]) _status.cardtag[retranslation(links[1])] = [];
				for (var i in _status.cardtag) {
					if (!yingbian_Condition.includes(i) && !["yingbian_add", "yingbian_remove", "yingbian_damage", "yingbian_draw", "yingbian_gain", "yingbian_hit", "yingbian_all"].includes(i)) continue;
					if (_status.cardtag[i].includes(card.cardid)) {
						var newValue = _status.cardtag[i].slice(0);
						newValue.remove(card.cardid);
						_status.cardtag[i] = newValue;
					}
				}
				var newValue1 = _status.cardtag[retranslation(links[0])].slice(0);
				var newValue2 = _status.cardtag[retranslation(links[1])].slice(0);
				newValue1.push(card.cardid);
				newValue2.push(card.cardid);
				_status.cardtag[retranslation(links[0])] = newValue1;
				_status.cardtag[retranslation(links[1])] = newValue2;
				card.$init([card.suit, card.number, card.name, card.nature]);
				game.log(player, "为", card, "添加了应变标签");
				var newList = [];
				if (Array.isArray(card[4])) newList = card[4].slice(0);
				if (!newList.includes(retranslation(links[0]))) newList.push(retranslation(links[0]));
				if (!newList.includes(retranslation(links[1]))) newList.push(retranslation(links[1]));
				card[4] = newList;
				//card[4] = [retranslation(links[0]),retranslation(links[1])];
			} else {
				if (!_status.cardtag["gifts"]) _status.cardtag["gifts"] = [];
				var newValue = _status.cardtag["gifts"].slice(0);
				if (!newValue.includes(card.cardid)) newValue.push(card.cardid);
				else newValue.remove(card.cardid);
				_status.cardtag["gifts"] = newValue;
				card.$init([card.suit, card.number, card.name, card.nature]);
				game.log(player, "为", card, "添加了赠物标签");
				var newList = [];
				if (Array.isArray(card[4])) newList = card[4].slice(0);
				if (!newList.includes("gifts")) newList.push("gifts");
				else newList.remove("gifts");
				card[4] = newList;
			}
			if (!player.countCards("h")) return;
			const { bool, cards, targets } = await player
				.chooseCardTarget({
					prompt: "交给一名其他角色一张手牌",
					filterCard: true,
					position: "h",
					filterTarget: lib.filter.notMe,
					ai1: function (card) {
						return 1 / Math.max(0.1, get.value(card));
					},
					ai2: function (target) {
						var player = _status.event.player,
							att = get.attitude(player, target);
						if (att < 0) return 0;
						if (ui.selected.cards.length) {
							var val = get.value(ui.selected.cards[0]);
							att *= val >= 0 ? 1 : -1;
						}
						if (target.hasSkillTag("nogain")) att /= 9;
						return 15 + att;
					},
				})
				.forResult();
			if (!bool || !targets || !targets.length || !cards || !cards.length) return;
			await player.give(cards, targets[0]);
			await player.drawTo(4);
		},
		ai: {
			order: function () {
				const player = _status.event.player;
				if (player.isMaxHandcard(true) || player.hp == 1 || player.countCards("h") == 1) return 10;
				return 1;
			},
			result: {
				player: 1,
			},
		},
	},
	shchisheng: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		global: "shchisheng_global",
		init: function (player) {
			player.storage.shchisheng = [];
		},
		enable: "phaseUse",
		usable: 1,
		position: "he",
		filterCard: true,
		selectCard: function () {
			const player = _status.event.player;
			return Math.max(
				1,
				game.countPlayer(function (current) {
					return !player.storage.shchisheng.includes(current);
				})
			);
		},
		filter: function (event, player) {
			const X = Math.max(
				1,
				game.countPlayer(function (current) {
					return !player.storage.shchisheng.includes(current);
				})
			);
			return player.countCards("he") >= X && player.awakenedSkills.includes("shzhuanfu");
		},
		complexSelect: true,
		check: function (card) {
			return 3.5 - get.value(card);
		},
		prompt: "弃置X张牌并重置〖篆符〗（X为场上未对你发动过〖驰声〗的角色数）",
		async content(event, trigger, player) {
			player.restoreSkill("shzhuanfu");
		},
		intro: {
			mark: function (dialog, content, player) {
				dialog.addText("已对你发动过驰声的角色");
				dialog.add(content);
			},
		},
		ai: {
			order: 1,
			result: {
				player: 1,
			},
		},
		subSkill: {
			global: {
				enable: "phaseUse",
				filter: function (event, player) {
					return (
						player.countCards("h") &&
						game.hasPlayer(function (current) {
							return current.hasSkill("shchisheng") && current != player;
						})
					);
				},
				filterCard: true,
				position: "h",
				usable: 1,
				check(card) {
					var val = _status.event.player.getUseValue(card);
					if (get.type(card) == "equip" || get.type(card) == "delay") val = 2;
					if (get.is.yingbian(card)) val = 0.5;
					return val + 1;
				},
				delay: false,
				discard: false,
				lose: false,
				filterTarget(card, player, target) {
					if (target == player) return false;
					return target.hasSkill("shchisheng");
				},
				prompt: "将一张手牌交给有驰声的角色，然后其可以对此牌执行〖篆符〗效果并交给你",
				async content(event, trigger, player) {
					game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shchisheng1.mp3");
					const target = event.targets[0];
					const card = event.cards[0];
					const name = get.name(card, false);
					const info = get.info(card);
					await player.give(event.cards, target);
					if (!target.storage.shchisheng) target.storage.shchisheng = [];
					target.storage.shchisheng.add(player);
					target.storage.shchisheng.sortBySeat();
					target.markSkill("shchisheng");
					if (get.type(card) == "delay") return;
					const result = await target
						.chooseBool("是否对" + get.translation(player) + "的" + get.translation(card) + "执行篆符并交给其？")
						.set("ai", function () {
							return get.attitude(_status.event.player, _status.event.target) > 2 && get.type(_status.event.card) != "equip";
						})
						.set("target", player)
						.set("card", card)
						.forResult();
					if (result.bool) {
						if (get.type(card) != "equip") {
							const yingbian_Condition = ["yingbian_fujia", "yingbian_kongchao", "yingbian_canqu", "yingbian_zhuzhan"];
							const yingbian_Effect = [];
							if (info.allowMultiple != false && !info.notarget) yingbian_Effect.add("yingbian_add");
							if (lib.skill.xunshi.isXunshi(card)) yingbian_Effect.add("yingbian_remove");
							if (name == "sha") yingbian_Effect.add("yingbian_damage");
							yingbian_Effect.add("yingbian_draw");
							if (name == "shan" || name == "wuxie") yingbian_Effect.add("yingbian_gain");
							if (!["shan", "tao", "jiu", "du"].includes(name)) yingbian_Effect.add("yingbian_hit");
							const buttonList1 = yingbian_Condition.map(i => get.translation(i + "_tag"));
							const buttonList2 = yingbian_Effect.map(i => get.translation(i + "_tag"));
							if (!buttonList1.length || !buttonList2.length) return;
							const retranslation = function (translate) {
								var conditions = ["yingbian_fujia", "yingbian_kongchao", "yingbian_canqu", "yingbian_zhuzhan"];
								var effects = Array.from(lib.yingbian.effect.keys());
								for (var condition of conditions) {
									if (get.translation(condition + "_tag") == translate) return condition;
								}
								for (var effect of effects) {
									if (get.translation("yingbian_" + effect + "_tag") == translate) return "yingbian_" + effect;
								}
							};
							const { bool, links } = await target
								.chooseButton(2, ["篆符：请选择为" + get.translation(card) + (get.is.yingbian(card) ? "修改" : "添加") + "应变条件及应变效果", [buttonList1, "tdnodes"], [buttonList2, "tdnodes"]], true)
								.set("filterButton", function (button) {
									if (ui.selected.buttons.length) {
										var flag = buttonList1.includes(button.link) ? 1 : 2;
										var sflag = buttonList1.includes(ui.selected.buttons[0].link) ? 1 : 2;
										return flag != sflag;
									}
									return buttonList1.includes(button.link);
								})
								.set("ai", function (button) {
									const user = _status.event.user;
									const bLink = retranslation(button.link);
									switch (bLink) {
										case "yingbian_fujia": {
											if (user.isMaxHandcard(true)) return 1.2 + Math.random();
											return 0.2;
										}
										case "yingbian_kongchao": {
											if (user.countCards("h") <= 1) return 1.35 + Math.random();
											return 0.2;
										}
										case "yingbian_canqu": {
											if (user.hp == 1) return 1.3 + Math.random();
											return 0.5;
										}
										case "yingbian_zhuzhan": {
											if (user.getFriends().length) return 1.4 + Math.random();
											return 0;
										}
										case "yingbian_add": {
											if (!lib.skill.xunshi.isXunshi(card)) return 0.7 + Math.random();
											return 0;
										}
										case "yingbian_remove": {
											return 0.5 + Math.random();
										}
										case "yingbian_damage": {
											return 1.2 + Math.random();
										}
										case "yingbian_draw": {
											return 2 + Math.random();
										}
										case "yingbian_gain": {
											return 0.6 + Math.random();
										}
										case "yingbian_hit": {
											if (get.tag(card, "damage")) return 1.5 + Math.random();
											return 0.7;
										}
									}
								})
								.set("user", player)
								.forResult();
							if (!bool) return;
							if (!buttonList1.includes(links[0])) links.reverse();
							if (!_status.cardtag[retranslation(links[0])]) _status.cardtag[retranslation(links[0])] = [];
							if (!_status.cardtag[retranslation(links[1])]) _status.cardtag[retranslation(links[1])] = [];
							for (var i in _status.cardtag) {
								if (!yingbian_Condition.includes(i) && !["yingbian_add", "yingbian_remove", "yingbian_damage", "yingbian_draw", "yingbian_gain", "yingbian_hit", "yingbian_all"].includes(i)) continue;
								if (_status.cardtag[i].includes(card.cardid)) {
									var newValue = _status.cardtag[i].slice(0);
									newValue.remove(card.cardid);
									_status.cardtag[i] = newValue;
								}
							}
							var newValue1 = _status.cardtag[retranslation(links[0])].slice(0);
							var newValue2 = _status.cardtag[retranslation(links[1])].slice(0);
							newValue1.push(card.cardid);
							newValue2.push(card.cardid);
							_status.cardtag[retranslation(links[0])] = newValue1;
							_status.cardtag[retranslation(links[1])] = newValue2;
							card.$init([card.suit, card.number, card.name, card.nature]);
							game.log(target, "为", card, "添加了应变标签");
							var newList = [];
							if (Array.isArray(card[4])) newList = card[4].slice(0);
							if (!newList.includes(retranslation(links[0]))) newList.push(retranslation(links[0]));
							if (!newList.includes(retranslation(links[1]))) newList.push(retranslation(links[1]));
							card[4] = newList;
							//card[4] = [retranslation(links[0]),retranslation(links[1])];
						} else {
							if (!_status.cardtag["gifts"]) _status.cardtag["gifts"] = [];
							var newValue = _status.cardtag["gifts"].slice(0);
							if (!newValue.includes(card.cardid)) newValue.push(card.cardid);
							else newValue.remove(card.cardid);
							_status.cardtag["gifts"] = newValue;
							card.$init([card.suit, card.number, card.name, card.nature]);
							game.log(target, "为", card, "添加了赠物标签");
							var newList = [];
							if (Array.isArray(card[4])) newList = card[4].slice(0);
							if (!newList.includes("gifts")) newList.push("gifts");
							else newList.remove("gifts");
							card[4] = newList;
						}
						//if(card.isIn())
						await target.give(card, player);
					}
				},
				ai: {
					order: 10,
					expose: 0.2,
					result: {
						target: function (player, target) {
							var att = get.attitude(player, target);
							if (att > 0) return 1;
							return 0;
						},
					},
				},
				sub: true,
			},
		},
	},
	shqinghong: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		filter: function (event, player) {
			return player.countCards("he");
		},
		async cost(event, trigger, player) {
			const num = Math.min(
				player.countCards("he"),
				game
					.filterPlayer(current => current != player)
					.map(target => {
						return target.countDiscardableCards(player, "he");
					})
					.reduce((p, c) => p + c, 0) | 0
			);
			const preTargets = game.filterPlayer(current => {
				return current != player && current.countDiscardableCards(player, "he") && get.effect(current, { name: "guohe_copy2" }, player, player) > 0;
			});
			if (num < 1) return;
			event.result = await player
				.chooseCardTarget({
					prompt: get.prompt("shqinghong"),
					prompt2: "弃置任意张牌并弃置任意名其他角色等量张牌",
					position: "he",
					selectCard: [1, num],
					filterCard: lib.filter.cardDiscardable,
					selectTarget: function () {
						//if(!ui.selected.cards) return [1,num];
						if (!ui.selected.cards) return 0;
						var num = 0;
						if (ui.selected.targets) {
							num +=
								ui.selected.targets
									.map(target => {
										return target.countDiscardableCards(_status.event.player, "he");
									})
									.reduce((p, c) => p + c, 0) | 0;
							//game.log(num)
							if (ui.selected.cards.length > num) return ui.selected.targets.length + 2;
						}
						return [1, ui.selected.cards.length];
					},
					filterTarget: (card, player, target) => {
						return target != player && target.countDiscardableCards(player, "he");
					},
					ai1: function (card) {
						var val = get.value(card);
						var hs = _status.event.player.getCards("h");
						var es = _status.event.player.getCards("e");
						var selectCards = [card];
						if (ui.selected.cards) selectCards.addArray(ui.selected.cards);
						if (hs.every(card => selectCards.includes(card)) || es.every(card => selectCards.includes(card))) val += 3;
						else if (get.name(card) == "guohe") val = 0;
						if (!ui.selected.cards) return 7 - val;
						return 6.5 - val;
					},
					ai2: function (target) {
						const player = _status.event.player;
						return get.effect(target, { name: "guohe_copy2" }, player, player);
					},
				})
				.setHiddenSkill(event.name)
				.forResult();
		},
		async content(event, trigger, player) {
			const cards = event.cards;
			const targets = event.targets.sortBySeat();
			const list = [];
			if (cards.length < targets.length) return;
			const isLoseALL = function (hs, es, cards) {
				let num1 = 1,
					num2 = 1;
				if (!hs.length) num1 = 0;
				if (!es.length) num2 = 0;
				for (var i = 0; i < hs.length; i++) {
					if (!cards.includes(hs[i])) {
						num1 = 0;
						break;
					}
				}
				for (var i = 0; i < es.length; i++) {
					if (!cards.includes(es[i])) {
						num2 = 0;
						break;
					}
				}
				return num1 == 1 || num2 == 1;
			};
			var hs = player.getCards("h");
			var es = player.getCards("e");
			var num = cards.length;
			if (isLoseALL(hs, es, cards)) list.add(player);
			await player.discard(event.cards);
			for (var i = 0; i < targets.length; i++) {
				const target = targets[i];
				if (num == 0) break;
				var hs = target.getCards("h");
				var es = target.getCards("e");
				var min = 1;
				var max = Math.min(num + i - targets.length + 1, target.countDiscardableCards(player, "he"));
				const result = await player
					.discardPlayerCard(target == targets[targets.length - 1] ? num : [min, max], target, "he", true)
					.set("ai", function (button) {
						var card = button.link;
						var target = _status.event.target;
						if ((get.position(card) == "h" && target.countCards("h") == 1) || (get.position(card) == "e" && target.countCards("e") == 1)) return get.value(card) + 60;
						return get.value(card) + 50;
					})
					.set("target", target)
					.forResult();
				if (result?.bool && result.links?.length) {
					num -= result.links.length;
					if (isLoseALL(hs, es, result.links)) list.add(target);
				}
			}
			if (!list.length) return;
			list.sortBySeat();
			for (const current of list) {
				await current.damage("thunder", "nocard");
			}
		},
	},
	shjiaoqian: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseJieshuBegin",
		},
		limited: true,
		skillAnimation: true,
		animationColor: "water",
		unique: true,
		filter: function (event, player) {
			return player.hp == 1;
		},
		async content(event, trigger, player) {
			await player.awakenSkill("shjiaoqian");
			await player.draw(3);
			player.addSkill("shjiaoqian_show");
			game.yinni(player);
		},
		derivation: "shtaian",
		subSkill: {
			show: {
				trigger: {
					player: "showCharacterAfter",
				},
				forced: true,
				hiddenSkill: true,
				filter(event, player, name) {
					if (_status.currentPhase != player) return false;
					return event.toShow && event.toShow.includes("sh_lijun");
				},
				async content(event, trigger, player) {
					const list = lib.group.slice(0);
					var preGroup = list[0];
					var maxNum = 0;
					for (var currentGroup of list) {
						var num = game.countPlayer(current => {
							if (player == current) return false;
							return get.attitude(player, current) > 0 && current.group == currentGroup;
						});
						if (num > maxNum) {
							preGroup = currentGroup;
							maxNum = num;
						}
					}
					const { control } = await player
						.chooseControl(list)
						.set("prompt", "请选择你想成为的势力")
						.set("ai", function () {
							if (_status.event.num > 0) return _status.event.group;
							return list.randomGet();
						})
						.set("num", maxNum)
						.set("group", preGroup)
						.forResult();
					if (control && player.group != control) {
						await player.changeGroup(control);
					}
					await player.gainMaxHp();
					await player.recover();
					await player.addSkills("shtaian");
					player.removeSkill("shjiaoqian_show");
				},
				sub: true,
			},
		},
	},
	shtaian: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		init: function (player) {
			player.storage.shtaian = [];
			player.storage.shtaian_num = 0;
		},
		locked: false,
		zhuSkill: true,
		enable: "phaseUse",
		viewAs: {
			name: "dongzhuxianji",
			storage: {
				shtaian: true,
			},
		},
		viewAsFilter: function (player) {
			return (
				player.countCards("he", card => {
					return !player.storage.shtaian.includes(get.suit(card));
				}) > 0
			);
		},
		filterCard: function (card, player, target) {
			return !player.storage.shtaian.includes(get.suit(card));
		},
		filterTarget: function (card, player, target) {
			return target.group == player.group;
		},
		selectTarget: 1,
		position: "he",
		check: function (card) {
			return 8 - get.value(card);
		},
		prompt: function () {
			return "每种花色限一次，将一张牌当【洞烛先机】对一名与你势力相同的角色使用";
		},
		precontent() {
			const suit = get.suit(event.result.cards[0]);
			player.storage.shtaian.add(suit);
			if (event.result.targets[0] != player) player.storage.shtaian_num++;
			player.addTempSkill("shtaian_mark");
		},
		subSkill: {
			mark: {
				mod: {
					maxHandcard: function (player, num) {
						return num + player.storage.shtaian_num;
					},
					attackRange: function (player, num) {
						return num + player.storage.shtaian_num;
					},
				},
				onremove: function (player, skill) {
					player.storage.shtaian = [];
					player.storage.shtaian_num = 0;
				},
				mark: true,
				intro: {
					content: function (storage, player) {
						var str = "";
						if (player.storage.shtaian_num > 0) str += "<li>你的攻击范围和手牌上限+" + player.storage.shtaian_num;
						if (player.storage.shtaian) {
							str += "<br><li>已使用过的花色：<br>";
							str += "<br>" + get.translation(player.storage.shtaian);
						}
						return str;
					},
				},
				sub: true,
			},
		},
	},
	shlianzhu: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		init: function (player) {
			player.storage.shlianzhu = 0;
		},
		trigger: {
			target: "useCardToTargeted",
		},
		filter(event, player) {
			if (!player.countCards("he", { color: "red" })) return false;
			return event.card.name == "sha" && !player.inRange(event.player);
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseToDiscard("he", get.prompt("shlianzhu"), "弃置一张红色牌，令此杀无效", { color: "red" })
				.set("ai", function (card) {
					if (get.attitude(_status.event.player, _status.event.getTrigger().player) > 2) return 0;
					return 7 - get.value(card);
				})
				.setHiddenSkill(event.name)
				.forResult();
		},
		async content(event, trigger, player) {
			player.addTempSkill("shlianzhu_remove");
			//game.log(player.storage.shlianzhu)
			if (player.storage.shlianzhu == 1) await player.draw();
			var evt = trigger.getParent();
			evt.targets.length = 0;
			evt.all_excluded = true;
			game.log(evt.card, "被无效了");
			player.storage.shlianzhu = 1;
		},
		group: "shlianzhu_noshan",
		subSkill: {
			noshan: {
				audio: "ext:水泊娘山/character/audio/skill/shlianzhu1.mp3",
				trigger: {
					global: "useCard",
				},
				filter: function (event, player) {
					if (!player.countCards("he", { color: "black" })) return false;
					return event.card.name == "shan" && player.inRange(event.player);
				},
				async cost(event, trigger, player) {
					event.result = await player
						.chooseToDiscard("he", get.prompt("shlianzhu", trigger.player), "弃置一张黑色牌，令" + get.translation(trigger.player) + "使用的闪无效", { color: "black" })
						.set("ai", function (card) {
							if (get.attitude(_status.event.player, trigger.player) >= 0) return 0;
							return 7 - get.value(card);
						})
						.setHiddenSkill(event.name)
						.forResult();
				},
				async content(event, trigger, player) {
					player.addTempSkill("shlianzhu_remove");
					//game.log(player.storage.shlianzhu)
					if (player.storage.shlianzhu == 2) await player.draw();
					//evt.targets.length = 0;
					trigger.all_excluded = true;
					game.log(trigger.card, "被无效了");
					player.storage.shlianzhu = 2;
				},
				sub: true,
			},
			remove: {
				charlotte: true,
				onremove: function (player, skill) {
					player.storage.shlianzhu = 0;
				},
				sub: true,
			},
		},
	},
	shjunjie: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		init: function (player) {
			player.storage.shjunjie = [0, 0, 0, 0];
		},
		trigger: {
			global: "phaseBefore",
			player: "enterGame",
		},
		filter(event, player) {
			return event.name != "phase" || game.phaseNumber == 0;
		},
		forced: true,
		async content(event, trigger, player) {
			const { bool: bool2, cards } = await player
				.chooseToDiscard([1, 4], "he", true)
				.set("ai", function (card) {
					if (!ui.selected.cards.length || ui.selected.cards.length == 1) return 200 - get.value(card);
					var num = -2 * ui.selected.cards.length + 6;
					return num - get.value(card);
				})
				.set("complexCard", true)
				.forResult();
			if (!bool2 || !cards.length) return;
			const num = Math.min(cards.length, 4);
			const list = ["摸牌阶段多摸一张牌", "使用【杀】额外结算一次", "手牌上限+2", "攻击范围+1"];
			const { bool, links } = await player
				.chooseButton(["郡杰：请选择获得下列" + get.cnNumber(num) + "项效果", [list.slice(0, 2), "tdnodes"], [list.slice(2, 4), "tdnodes"]], true)
				.set("selectButton", num)
				.set("ai", function (button) {
					const firstChar = button.link[0];
					switch (firstChar) {
						case "摸": {
							return 2.5 + Math.random();
						}
						case "使": {
							return 2.5 + Math.random();
						}
						case "手": {
							return 1.0 + Math.random();
						}
						case "攻": {
							if (game.countPlayer() > 5) return 1.2 + Math.random();
							return 0.2;
						}
					}
				})
				.forResult();
			if (!bool) return;
			for (var i = 0; i < 4; i++) {
				if (links.includes(list[i])) player.storage.shjunjie[i] = 1;
			}
		},
		mod: {
			maxHandcard: function (player, num) {
				return num + player.storage.shjunjie[2] * 2;
			},
			attackRange: function (player, num) {
				return num + player.storage.shjunjie[3];
			},
		},
		group: ["shjunjie_draw", "shjunjie_useSha"],
		subSkill: {
			draw: {
				trigger: {
					player: "phaseDrawBegin2",
				},
				forced: true,
				filter: function (event) {
					return !event.numFixed && event.player.storage.shjunjie && event.player.storage.shjunjie[0] == 1;
				},
				content: function () {
					trigger.num++;
				},
				ai: {
					threaten: 1.3,
				},
				sub: true,
			},
			useSha: {
				trigger: {
					player: "useCard",
				},
				forced: true,
				filter: function (event) {
					if (event.card.name != "sha") return false;
					return event.player.storage.shjunjie && event.player.storage.shjunjie[1] == 1;
				},
				content: function () {
					trigger.effectCount++;
					game.log(trigger.card, "额外结算一次");
				},
				ai: {
					threaten: 1.3,
				},
				sub: true,
			},
		},
	},
	shdiaoman: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		group: ["shdiaoman1", "shdiaoman2", "shdiaoman3"],
		isVisable: function (player, target, card) {
			var owner = get.owner(card);
			if (owner && owner == player) return true;
			return get.is.shownCard(card) || get.position(card) == "e" || (get.position(card) == "j" && (card.viewAs || card.name) != "xumou_jsrg") || player.hasSkillTag("viewHandcard", null, target, true);
		},
	},
	shdiaoman1: {
		trigger: {
			player: "useCard",
		},
		usable: 1,
		filter: function (event, player) {
			if (
				!game.hasPlayer(current => {
					return (
						current != player &&
						current.countCards("h", card => {
							return !get.is.shownCard(card);
						})
					);
				})
			)
				return false;
			return get.type(event.card) == "basic";
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseTarget(get.prompt("shdiaoman"), "明置一名其他角色一张手牌。", (card, player, target) => {
					if (target == player) return false;
					return target.countCards("h", card => {
						return !get.is.shownCard(card);
					});
				})
				.set("ai", target => {
					const player = get.event().player;
					return -get.attitude(player, target);
				})
				.forResult();
		},
		async content(event, trigger, player) {
			game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shdiaoman1.mp3");
			const target = event.targets[0];
			const result = await player
				.choosePlayerCard(target, "h", true)
				.set("filterButton", function (button) {
					return !get.is.shownCard(button.link);
				})
				.forResult();
			if (result.bool) {
				await target.showCards(result.links, get.translation(target) + "因【刁蛮】展示");
				await target.addShownCards(result.links, "visible_shdiaoman");
			}
		},
	},
	shdiaoman2: {
		trigger: {
			player: "gainAfter",
			global: "loseAsyncAfter",
		},
		usable: 1,
		filter(event, player, name) {
			var cards = [];
			event.getg(player).forEach(card => {
				if (get.type2(card) == "trick") cards.push(card);
			});
			if (event.getParent().name == "draw") return false;
			return cards.length && !_status.dying.length;
		},
		async content(event, trigger, player) {
			game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shdiaoman2.mp3");
			var hs = player.getCards("h");
			const cards = trigger.getg(player).filter(function (i) {
				return hs.includes(i) && get.type2(i) == "trick";
			});
			if (!cards || !cards.length) return;
			await player.showCards(cards);
			const result = await player
				.chooseTarget("对一名角色造成1点伤害？")
				.set("ai", target => {
					return get.damageEffect(target, _status.event.player, _status.event.player);
				})
				.set("forced", true)
				.forResult();
			if (result.bool) {
				const target = result.targets[0];
				await target.damage();
			}
		},
	},
	shdiaoman3: {
		trigger: {
			player: "loseAfter",
			global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
		},
		usable: 1,
		filter(event, player) {
			var evt = event.getl(player);
			return evt && evt.es && evt.es.length > 0;
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseTarget(get.prompt("shdiaoman"), "获得一名其他角色区域内一张可见牌", (card, player, target) => {
					if (target == player) return false;
					return target.countCards("hej", card => {
						return lib.skill.shdiaoman.isVisable(player, target, card);
					});
				})
				.set("ai", target => {
					const player = get.event().player;
					return -get.attitude(player, target);
				})
				.forResult();
		},
		async content(event, trigger, player) {
			game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shdiaoman1.mp3");
			const target = event.targets[0];
			await player
				.gainPlayerCard(target, "hej", true)
				.set("filterButton", function (button) {
					return lib.skill.shdiaoman.isVisable(get.event().player, get.event().target, button.link);
				})
				.set("target", target);
		},
	},
	shxindang: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		mark: true,
		intro: {
			markcount: (_, player) => [1, 2, 3, 4, 5].map(i => player.countEmptySlot(i)).reduce((p, c) => p + c, 0) - player.countMark("shxindang_used"),
			content: (_, player) => "当前剩余发动次数：" + ([1, 2, 3, 4, 5].map(i => player.countEmptySlot(i)).reduce((p, c) => p + c, 0) - player.countMark("shxindang_used")),
		},
		global: "shxindangx",
		trigger: {
			global: "damageEnd",
		},
		filter: function (event, player) {
			if (player.countMark("shxindang_used") >= [1, 2, 3, 4, 5].map(i => player.countEmptySlot(i)).reduce((p, c) => p + c, 0)) return false;
			return event.source && event.source.hasSex("male") && player.countCards("he") && event.source.countCards("he");
		},
		async cost(event, trigger, player) {
			const dialog = [];
			const target = trigger.source;
			dialog.push(get.prompt("shxindang", target) + "交换你与" + get.translation(target) + "一张牌");
			if (target.countCards("h")) {
				dialog.add('<div class="text center">' + get.translation(target) + "的手牌</div>");
				if (player.hasSkillTag("viewHandcard", null, target, true)) dialog.push(target.getCards("h"));
				else {
					if (target.countCards("h", card => !get.is.shownCard(card))) dialog.push([target.getCards("h").filter(card => !get.is.shownCard(card)), "blank"]);
					if (target.countCards("h", card => get.is.shownCard(card))) dialog.push(target.getCards("h").filter(card => get.is.shownCard(card)));
				}
			}
			if (target.countCards("e")) {
				dialog.add('<div class="text center">' + get.translation(target) + "的装备牌</div>");
				dialog.push(target.getCards("e"));
			}
			if (player.countCards("h")) {
				dialog.add('<div class="text center">' + get.translation(player) + "的手牌</div>");
				dialog.push(player.getCards("h"));
			}
			if (player.countCards("e")) {
				dialog.add('<div class="text center">' + get.translation(player) + "的装备牌</div>");
				dialog.push(player.getCards("e"));
			}
			event.result = await player
				.chooseButton(2)
				.set("createDialog", dialog)
				.set("filterButton", button => {
					const player = get.player(),
						target = get.event().target;
					if (get.itemtype(button.link) != "card") return false;
					if (!ui.selected.buttons.length && get.owner(button.link) != target) return false;
					if (ui.selected.buttons.length && get.owner(ui.selected.buttons[0].link) == get.owner(button.link)) return false;
					return true;
				})
				.set("target", target)
				.set("ai", button => {
					const player = get.player(),
						target = get.event().target,
						owner = get.owner(button.link),
						suit = get.suit(button.link, owner),
						value = get.value(button.link, owner),
						att = get.attitude(player, target);
					if (att <= 2) {
						if (owner == player) {
							if (suit == "heart" && target.isDamaged()) return 0;
							return 5 - value + (get.position(button.link) == "e") ? 5 : 0;
						} else {
							if (lib.skill.shdiaoman.isVisable(player, target, button.link) && ((suit == "heart" && player.isDamaged()) || get.type2(button.link) == "trick")) return value * 3;
							return value;
						}
					} else {
						if (owner == player) {
							if ((suit == "heart" && target.isDamaged()) || get.position(button.link) == "e") return value * 3;
							return value;
						} else {
							if (lib.skill.shdiaoman.isVisable(player, target, button.link) && ((suit == "heart" && player.isDamaged()) || get.type2(button.link) == "trick")) return value * 3;
							return value;
						}
					}
				})
				.forResult();
			if (event.result.bool) {
				event.result.cards = event.result.links;
			}
		},
		logTarget(event, player) {
			return event.source;
		},
		async content(event, trigger, player) {
			var links = event.cards.slice();
			player.addMark("shxindang_used", 1, false);
			player.addTempSkill("shxindang_used", "roundStart");
			if (get.owner(links[0]) != player) links.reverse();
			var card1 = links[0],
				card2 = links[1];
			await player.swapHandcards(trigger.source, [card1], [card2]);

			if (get.suit(card2) == "heart") {
				var list = [];
				for (var name of ["tao", "jiu"])
					if (lib.filter.cardEnabled({ name: name }, player)) {
						list.push(["基本", "", name]);
					}
				if (list.length) {
					var dialog = ui.create.dialog("心荡", [list, "vcard"]);
					const result = await player
						.chooseButton(dialog)
						.set("ai", button => {
							if (button.link[2] == "tao") return 2;
							return 1;
						})
						.forResult();
					if (result.bool) await player.chooseUseTarget(true, result.links[0][2]);
				}
			}
			if (get.suit(card1) == "heart") {
				var list = [];
				for (var name of ["tao", "jiu"])
					if (lib.filter.cardEnabled({ name: name }, trigger.source)) {
						list.push(["基本", "", name]);
					}
				if (list.length) {
					var dialog = ui.create.dialog("心荡", [list, "vcard"]);
					const result = await trigger.source
						.chooseButton(dialog)
						.set("ai", button => {
							if (button.link[2] == "tao") return 2;
							return 1;
						})
						.forResult();
					if (result.bool) await trigger.source.chooseUseTarget(true, result.links[0][2]);
				}
			}
		},
		subSkill: {
			used: {
				charlotte: true,
				onremove: true,
				sub: true,
			},
		},
	},
	shxindangx: {
		trigger: {
			global: "damageEnd",
		},
		filter: function (event, player) {
			if (!player.hasSex("male") || !event.player.hasSkill("shxindang")) return false;
			if (event.player.countMark("shxindang_used") >= [1, 2, 3, 4, 5].map(i => event.player.countEmptySlot(i)).reduce((p, c) => p + c, 0)) return false;
			return player.countCards("he") && event.player.countCards("he");
		},
		async cost(event, trigger, player) {
			const dialog = [];
			const target = trigger.player;
			dialog.push(get.prompt("shxindang", target) + "交换你与" + get.translation(target) + "一张牌");
			if (target.countCards("h")) {
				dialog.add('<div class="text center">' + get.translation(target) + "的手牌</div>");
				if (player.hasSkillTag("viewHandcard", null, target, true)) dialog.push(target.getCards("h"));
				else {
					if (target.countCards("h", card => !get.is.shownCard(card))) dialog.push([target.getCards("h").filter(card => !get.is.shownCard(card)), "blank"]);
					if (target.countCards("h", card => get.is.shownCard(card))) dialog.push(target.getCards("h").filter(card => get.is.shownCard(card)));
					//dialog.push([target.getCards('h'),'blank']);
				}
			}
			if (target.countCards("e")) {
				dialog.add('<div class="text center">' + get.translation(target) + "的装备牌</div>");
				dialog.push(target.getCards("e"));
			}
			if (player.countCards("h")) {
				dialog.add('<div class="text center">' + get.translation(player) + "的手牌</div>");
				dialog.push(player.getCards("h"));
			}
			if (player.countCards("e")) {
				dialog.add('<div class="text center">' + get.translation(player) + "的装备牌</div>");
				dialog.push(player.getCards("e"));
			}
			event.result = await player
				.chooseButton(2)
				.set("createDialog", dialog)
				.set("filterButton", button => {
					const player = get.player(),
						target = get.event().target;
					if (get.itemtype(button.link) != "card") return false;
					//game.log(get.owner(button.link))
					if (!ui.selected.buttons.length && get.owner(button.link) != target) return false;
					if (ui.selected.buttons.length && get.owner(ui.selected.buttons[0].link) == get.owner(button.link)) return false;
					return true;
				})
				.set("target", target)
				.set("ai", button => {
					const player = get.player(),
						target = get.event().target,
						owner = get.owner(button.link),
						suit = get.suit(button.link, owner),
						value = get.value(button.link, owner),
						att = get.attitude(player, target);
					if (att <= 2) {
						if (owner == player) {
							if (suit == "heart" && target.isDamaged()) return 0;
							return 5 - value;
						} else {
							if (lib.skill.shdiaoman.isVisable(player, target, button.link) && suit == "heart" && player.isDamaged()) return value * 3;
							return value - (get.position(button.link) == "e") ? 5 : 0;
						}
					} else {
						if (owner == target) {
							if ((lib.skill.shdiaoman.isVisable(player, target, button.link) && suit == "heart" && player.isDamaged()) || get.position(button.link) == "e") return value * 3;
							return value;
						} else {
							if ((suit == "heart" && target.isDamaged()) || get.type2(button.link) == "trick") return value * 3;
							return value;
						}
					}
				})
				.forResult();
			if (event.result.bool) {
				event.result.cards = event.result.links;
			}
		},
		logTarget(event, player) {
			return event.player;
		},
		async content(event, trigger, player) {
			var links = event.cards.slice();
			trigger.player.addMark("shxindang_used", 1, false);
			trigger.player.addTempSkill("shxindang_used", "roundStart");
			if (get.owner(links[0]) != player) links.reverse();
			var card1 = links[0],
				card2 = links[1];
			await player.swapHandcards(trigger.player, [card1], [card2]);
			if (get.suit(card2) == "heart") {
				var list = [];
				for (var name of ["tao", "jiu"])
					if (lib.filter.cardEnabled({ name: name }, player)) {
						list.push(["基本", "", name]);
					}
				if (list.length) {
					var dialog = ui.create.dialog("心荡", [list, "vcard"]);
					const result = await player
						.chooseButton(dialog)
						.set("ai", button => {
							if (button.link[2] == "tao") return 2;
							return 1;
						})
						.forResult();
					if (result.bool) await player.chooseUseTarget(true, result.links[0][2]);
				}
			}
			if (get.suit(card1) == "heart") {
				var list = [];
				for (var name of ["tao", "jiu"])
					if (lib.filter.cardEnabled({ name: name }, trigger.player)) {
						list.push(["基本", "", name]);
					}
				if (list.length) {
					var dialog = ui.create.dialog("心荡", [list, "vcard"]);
					const result = await trigger.player
						.chooseButton(dialog)
						.set("ai", button => {
							if (button.link[2] == "tao") return 2;
							return 1;
						})
						.forResult();
					if (result.bool) await trigger.player.chooseUseTarget(true, result.links[0][2]);
				}
			}
		},
	},
	shxiongju: {
		audio: "ext:水泊娘山/character/audio/skill:3",
		init: function (player) {
			player.storage.shxiongju = 3;
		},
		enable: "phaseUse",
		usable: 1,
		filter: function (event, player) {
			if (!player.storage.shxiongju) return false;
			return game.hasPlayer(function (current) {
				return current != player && player.inRange(current);
			});
		},
		filterTarget: function (card, player, target) {
			return player != target && player.inRange(target);
		},
		selectTarget: function () {
			return [1, _status.event.player.storage.shxiongju];
		},
		multitarget: true,
		multiline: true,
		async content(event, trigger, player) {
			const targets = event.targets.sortBySeat();
			const targets2 = [];
			for (const target of targets) {
				const { bool, cards } = await target
					.chooseToDiscard("he", true)
					.set("ai", card => {
						if (get.name(card, false) == "sha") {
							var num = _status.event.player.countCards("h", { name: "sha" }) / _status.event.source.countCards("h");
							var randomNumber = Math.random();
							if (randomNumber < num) return 85 - get.value(card);
							return 100 - get.value(card);
						}
						if (get.name(card) == "wuxie") return 80 - get.value(card);
						return 90 - get.value(card);
					})
					.set("source", player)
					.forResult();
				if (bool && cards.length) {
					if (get.name(cards[0], false) == "sha") continue;
				}
				targets2.add(target);
			}
			if (!targets2.length) return;
			targets2.sortBySeat();
			for (const target2 of targets2) {
				await player.useCard({ name: "juedou", isCard: true, storage: { shxiongju: true } }, target2);
			}
		},
		ai: {
			result: {
				target: -1,
			},
			order: function () {
				return get.order({ name: "juedou" }) + 0.2;
			},
			expose: 0.3,
		},
		group: "shxiongju_dying",
		subSkill: {
			dying: {
				trigger: {
					player: "dying",
				},
				filter: function (event, player) {
					var evt = event.getParent("damage");
					if (!player.storage.shxiongju && player.hp >= 1) return false;
					return evt && evt.card && evt.card.storage && evt.card.storage.shxiongju;
				},
				forced: true,
				popup: false,
				async content(event, trigger, player) {
					player.storage.shxiongju--;
					game.log(player, "令雄据可选角色数-1");
					await player.recover(1 - player.hp);
				},
				sub: true,
			},
		},
	},
	shchuanling: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "useCardToPlayered",
		},
		filter: function (event, player) {
			if (event.targets.length != 1 || event.card.name != "sha") return false;
			var players1 = get.clockWisePath(player, event.target);
			var players2 = get.antiClockWisePath(player, event.target);
			var sourceTargets = [];
			if (players1.length >= players2.length) sourceTargets.addArray(players2);
			if (players1.length <= players2.length) sourceTargets.addArray(players1);
			if (!sourceTargets.length) return false;
			for (var current of sourceTargets) {
				if (player.canMoveCard(null, false, current)) return true;
			}
			return false;
		},
		async cost(event, trigger, player) {
			var players1 = get.clockWisePath(player, trigger.target);
			var players2 = get.antiClockWisePath(player, trigger.target);
			var sourceTargets = [];
			if (players1.length >= players2.length) sourceTargets.addArray(players2);
			if (players1.length <= players2.length) sourceTargets.addArray(players1);
			event.result = await player
				.chooseTarget(2, function (card, player, target) {
					if (ui.selected.targets.length == 1) {
						var from = ui.selected.targets[0];
						var js = from.getCards("j");
						for (var i = 0; i < js.length; i++) {
							if (target.canAddJudge(js[i])) return true;
						}
						if (target.isMin()) return false;
						var es = from.getCards("e");
						for (var i = 0; i < es.length; i++) {
							if (target.canEquip(es[i], false)) return true;
						}
						return false;
					} else {
						if (!get.event().sourceTargets.includes(target)) return false;
						return target.countCards("ej") > 0;
					}
				})
				.set("ai", function (target) {
					var player = _status.event.player;
					var att = get.attitude(player, target);
					var sgnatt = get.sgn(att);
					if (ui.selected.targets.length == 0) {
						if (att > 0) {
							if (
								target.countCards("j", function (card) {
									return game.hasPlayer(function (current) {
										return current != target && current.canAddJudge(card) && get.attitude(player, current) < 0;
									});
								})
							)
								return 14;
							if (
								target.countCards("e", function (card) {
									return (
										get.value(card, target) < 0 &&
										game.hasPlayer(function (current) {
											return current != target && get.attitude(player, current) < 0 && current.canEquip(card, false) && get.effect(target, card, player, player) < 0;
										})
									);
								}) > 0
							)
								return 9;
						} else if (att < 0) {
							if (
								game.hasPlayer(function (current) {
									if (current != target && get.attitude(player, current) > 0) {
										var es = target.getCards("e");
										for (var i = 0; i < es.length; i++) {
											if (get.value(es[i], target) > 0 && current.canEquip(es[i], false) && get.effect(current, es[i], player, player) > 0) return true;
										}
									}
								})
							) {
								return -att;
							}
						}
						return 0;
					}
					var es = ui.selected.targets[0].getCards("e");
					var i;
					var att2 = get.sgn(get.attitude(player, ui.selected.targets[0]));
					for (i = 0; i < es.length; i++) {
						if (sgnatt != 0 && att2 != 0 && sgnatt != att2 && get.sgn(get.value(es[i], ui.selected.targets[0])) == -att2 && get.sgn(get.effect(target, es[i], player, target)) == sgnatt && target.canEquip(es[i])) {
							return Math.abs(att);
						}
					}
					if (
						i == es.length &&
						(!ui.selected.targets[0].countCards("j", function (card) {
							return target.canAddJudge(card);
						}) ||
							att2 <= 0)
					) {
						return 0;
					}
					return -att * att2;
				})
				.set("sourceTargets", sourceTargets)
				.set("multitarget", true)
				.set("targetprompt", ["被移走", "移动目标"])
				.set("prompt", get.prompt2("shchuanling"))
				.forResult();
		},
		async content(event, trigger, player) {
			if (!event.targets || event.targets.length != 2) return;
			const targets = event.targets;
			var players1 = get.clockWisePath(player, trigger.target);
			var players2 = get.antiClockWisePath(player, trigger.target);
			const shorterPath = players1.includes(targets[0]) ? players1 : players2;
			const otherPath = !players1.includes(targets[0]) ? players1 : players2;
			//game.log('较短路径：',shorterPath,'较长路径：',otherPath)
			const result = await player
				.choosePlayerCard(
					"ej",
					true,
					function (button) {
						var player = _status.event.player;
						var targets0 = _status.event.targets0;
						var targets1 = _status.event.targets1;
						if (get.attitude(player, targets0) > 0 && get.attitude(player, targets1) < 0) {
							if (get.position(button.link) == "j") return 12;
							if (get.value(button.link, targets0) < 0 && get.effect(targets1, button.link, player, targets1) > 0) return 10;
							return 0;
						} else {
							if (get.position(button.link) == "j") return -10;
							return get.value(button.link) * get.effect(targets1, button.link, player, targets1);
						}
					},
					targets[0]
				)
				.set("targets0", targets[0])
				.set("targets1", targets[1])
				.set("filterButton", function (button) {
					var targets1 = _status.event.targets1;
					if (get.position(button.link) == "j") {
						return targets1.canAddJudge(button.link);
					} else {
						return targets1.canEquip(button.link, false);
					}
				})
				.forResult();
			if (result.bool) {
				const link = result.buttons[0].link;
				if (get.position(link) == "e") {
					await targets[1].equip(link);
				} else if (link.viewAs) {
					await targets[1].addJudge({ name: link.viewAs }, [link]);
				} else {
					await targets[1].addJudge(link);
				}
				await targets[0].$give(link, event.targets[1], false);
				game.log(targets[0], "的", link, "被移动给了", targets[1]);
				if (shorterPath.length) {
					if (shorterPath.every(short => short.countCards("ej") == 0)) {
						trigger.getParent().directHit.addArray(game.players);
					}
				}
				if (otherPath.length) {
					if (otherPath.every(other => other.countCards("ej"))) {
						if (typeof trigger.getParent().baseDamage != "number") trigger.getParent().baseDamage = 1;
						trigger.getParent().baseDamage++;
					}
				}
			}
		},
	},

	shfushe: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "phaseZhunbeiBegin",
		},
		round: 1,
		filter: function (event, player) {
			return player.hasUseTarget({ name: "sha", nature: "stab" }, false) && !player.isTurnedOver();
		},
		check: function (event, player) {
			return game.hasPlayer(target => {
				return get.effect(target, { name: "sha", nature: "stab", isCard: true }, player, player) > 0;
			});
		},
		async content(event, trigger, player) {
			await player.turnOver();
			await player.chooseUseTarget({ name: "sha", nature: "stab" }, "视为使用一张无距离限制的刺【杀】", true, "nodistance");
			player.addTempSkill("shfushe_draw");
		},
		subSkill: {
			draw: {
				trigger: {
					global: "phaseJieshuBegin",
				},
				filter: function (event, player) {
					var num = player.getStat().damage || 0;
					game.countPlayer(function (current) {
						if (current == player) {
							current.getHistory("damage", function (evt) {
								num += evt.num;
							});
						}
					});
					return num > 0;
				},
				forced: true,
				async content(event, trigger, player) {
					var num = player.getStat().damage || 0;
					game.countPlayer(function (current) {
						if (current == player) {
							current.getHistory("damage", function (evt) {
								num += evt.num;
							});
						}
					});
					if (!num) return;
					for (var i = 0; i < num; i++) await player.turnOver();
					await player.draw(num);
				},
				mark: true,
				intro: {
					content: function (storage, player) {
						var num = player.getStat().damage || 0;
						game.countPlayer(function (current) {
							if (current == player) {
								current.getHistory("damage", function (evt) {
									num += evt.num;
								});
							}
						});
						if (num) return "本回合造成和受到过" + num + "点伤害";
					},
					markcount: function (storage, player) {
						var num = player.getStat().damage || 0;
						game.countPlayer(function (current) {
							if (current == player) {
								current.getHistory("damage", function (evt) {
									num += evt.num;
								});
							}
						});
						return num;
					},
				},
				sub: true,
			},
		},
	},
	shzhuilie: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "chooseToUse",
		viewAs: {
			name: "diaohulishan",
		},
		filterCard: function (card, player) {
			return get.name(card) == "sha" || get.name(card) == "shan";
		},
		check(card) {
			var player = _status.event.player;
			if (get.name(card) == "sha") {
				if (player.countCards("h", { name: "sha" }) > 2) return 8 - get.value(card);
				return 4 - get.value(card);
			}
			return 6 - get.value(card);
		},
		viewAsFilter: function (player) {
			if (
				!player.countCards("hs", function (card) {
					return get.name(card) == "sha" || get.name(card) == "shan";
				})
			)
				return false;
		},
		position: "hs",
		precontent() {
			const card = event.result.card;
			card.storage.shzhuilie = true;
			player.addTempSkill("shzhuilie_sha");
		},
		ai: {
			order: function (item, player) {
				var cards = player.getCards("h", { name: "sha" });
				if (!cards.length || game.filterPlayer().length < 3) return 0;
				for (const card of cards) {
					if (
						game.hasPlayer(target => {
							return get.effect(target, card, player, player) > 0 && player.inRange(target);
						})
					)
						return get.order({ name: "diaohulishan" }) + 0.2;
				}
				return 0;
			},
			ai: {
				effect: {
					player: function (card, player, target) {
						if (!player) player = _status.event.player;
						if (get.name(card) == "diaohulishan" && card.storage && card.storage.shzhuilie) {
							var num = game.filterPlayer(target => {
								return get.effect(target, card, player, player) > 0 && player.inRange(target);
							}).length;
							if (!player.countCards("h", { name: "sha" })) return [1, 0];
							return [1, num];
						}
					},
					target: function (card, player, target) {
						if (!player) player = _status.event.player;
						if (ui.selected.targets.length && game.filterPlayer().length < 4) return [0, 0];
						if (get.name(card) == "diaohulishan" && card.storage && card.storage.shzhuilie) {
							var num = get.effect(target, { name: "sha" }, player, player) > 0 ? 0.5 : get.effect(target, { name: "sha" }, player, player);
							return [0, num];
						}
					},
				},
			},
		},
	},
	shzhuilie_sha: {
		trigger: {
			player: "useCardAfter",
		},
		filter: function (event, player) {
			if (!game.hasPlayer(current => player.inRange(current))) return false;
			return event.card && event.card.storage && event.card.storage.shzhuilie && event.card.name == "diaohulishan";
		},
		direct: true,
		async content(event, trigger, player) {
			const targets = game.filterPlayer(current => player.inRange(current));
			await player
				.chooseToUse({
					filterCard: function (card, player, event) {
						if (get.name(card) != "sha") return false;
						return lib.filter.filterCard.apply(this, arguments);
					},
					prompt: "是否对" + get.translation(targets) + "使用一张杀",
				})
				.set("filterTarget", function (card, player, target) {
					if (!_status.event.player.inRange(target)) return false;
					return lib.filter.filterTarget.apply(this, arguments);
				})
				.set("oncard", function (card) {
					var evt = _status.event;
					card.storage.shzhuilie = true;
				})
				.set("selectTarget", -1)
				.set("targetRequired", true)
				.set("complexSelect", true);
		},
		group: ["shzhuilie_sha_target"],
		subSkill: {
			target: {
				trigger: {
					player: "useCardToPlayered",
				},
				filter: function (event, player) {
					if (event.targets.length != 1 || !event.target.countCards("he")) return false;
					return event.card.name == "sha" && event.card.storage && event.card.storage.shzhuilie;
				},
				direct: true,
				forced: true,
				charlotte: true,

				async content(event, trigger, player) {
					await player.gainPlayerCard("he", trigger.target, Math.min(2, trigger.target.countCards("he")), true);
				},
				sub: true,
			},
		},
	},
	shxuci: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		filter: function (event, player) {
			return player.countCards("ej") > 0;
		},
		check: function (event, player) {
			return player.countCards("j") > 0;
		},
		async content(event, trigger, player) {
			var cards = player.getCards("ej");
			player.gain(cards, "gain2").gaintag.add("shxuci");
			player.addTempSkill("shxuci_add");
		},
		group: "shxuci_draw",
		subfrequent: ["draw"],
		subSkill: {
			draw: {
				trigger: {
					player: "phaseJieshuBegin",
				},
				frequent: true,
				async content(event, trigger, player) {
					await player.draw();
					if (!player.canMoveCard(null, true)) return;
					const result = await player
						.chooseToDiscard("是否弃置一张手牌，移动场上一张装备牌？", "h")
						.set("ai", function (card) {
							if (!player.canMoveCard(true, true)) return 0;
							return 6 - get.value(card);
						})
						.forResult();
					if (result.bool) player.moveCard(true).nojudge = true;
				},
				sub: true,
			},
			add: {
				onremove: function (player) {
					player.removeGaintag("shxuci");
				},
				mod: {
					cardname: function (card) {
						if (card.hasGaintag("shxuci")) return "sha";
					},
					cardnature(card, player) {
						if (card.hasGaintag("shxuci")) return "stab";
					},
				},
				sub: true,
			},
		},
	},
	shjuantu: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "loseAfter",
			global: "loseAsyncAfter",
		},
		filter(event, player) {
			if (player.hasSkill("shjuantu_used")) return false;
			if (event.type != "discard" || event.getlx === false) return false;
			const evt = event.getl(player);
			return evt && evt.cards2 && evt.cards2.length && evt.cards2.length <= game.filterPlayer(current => current != player).length;
		},
		async cost(event, trigger, player) {
			var num = trigger.getl(player).cards2.length;
			if (!num) return;
			event.result = await player
				.chooseTarget(num, get.prompt("shjuantu"), "令" + get.cnNumber(num) + "名其他角色摸或弃置一张牌。", (card, player, target) => {
					return target != player;
				})
				.set("ai", target => {
					if (get.attitude(_status.event.player, target) < 0) return get.effect(target, { name: "guohe_copy2" }, player, player) / 1.2;
					return get.effect(target, { name: "draw" }, player, player);
				})
				.forResult();
		},
		async content(event, trigger, player) {
			player.addTempSkill("shjuantu_used", ["phaseZhunbeiAfter", "phaseDrawAfter", "phaseJudgeAfter", "phaseUseAfter", "phaseDiscardAfter", "phaseJieshuAfter"]);
			const targets = event.targets.sortBySeat();
			for (const target of targets) {
				let list = ["摸牌"];
				if (target.countCards("he")) list.push("弃牌");
				const { control } = await player
					.chooseControl(list)
					.set("prompt", "令" + get.translation(target) + "执行其中一项")
					.set("ai", () => {
						const player = get.event().player;
						if (get.event().controls.includes("弃牌") && get.effect(_status.event.target, { name: "guohe_copy2" }, player, player) > 0) return "弃牌";
						return "摸牌";
					})
					.set("target", target)
					.forResult();
				if (control == "摸牌") await target.draw();
				else {
					await target
						.chooseToDiscard("he", true)
						.set("ai", function (card) {
							var player = _status.event.player,
								source = _status.event.source;
							var val = get.value(card);
							var suits = lib.skill.shmifeng.getSuit();
							var num = suits.length + 2;
							if (get.attitude(player, source) < 0 && !suits.includes(get.suit(card, false))) val += num;
							else if (get.attitude(player, source) > 1 && !suits.includes(get.suit(card, false))) val -= num;
							//game.log(card,'原有价值：',get.value(card),'现有价值：',val,'增量',val - get.value(card));
							return 100 - val;
						})
						.set("source", player);
				}
			}
			var suits = lib.skill.shmifeng.getSuit();
			if (suits.length == 4) {
				const cards = get.centralDisCards();
				event.given_map = {};
				var assign_Max = 3;
				if (!cards.length) return;
				do {
					const { bool, links } =
						cards.length == 1
							? { links: cards.slice(0), bool: true }
							: await player
									.chooseCardButton("卷土：请选择要分配的牌", true, cards, [1, Math.min(cards.length, assign_Max)])
									.set("ai", () => {
										if (ui.selected.buttons.length == 0) return 1;
										return 0;
									})
									.forResult();
					if (!bool) return;
					cards.removeArray(links);
					assign_Max -= links.length;
					event.togive = links.slice(0);
					const targets = (
						await player
							.chooseTarget("选择一名角色获得" + get.translation(links), true)
							.set("ai", function (target) {
								var att = get.attitude(_status.event.player, target);
								if (_status.event.enemy) {
									return -att;
								} else if (att > 0) {
									return att / (1 + target.countCards("h"));
								} else {
									return att / 100;
								}
							})
							.set("enemy", get.value(event.togive[0], player, "raw") < 0)
							.forResult()
					).targets;
					if (targets.length) {
						const id = targets[0].playerid,
							map = event.given_map;
						if (!map[id]) map[id] = [];
						map[id].addArray(event.togive);
					}
				} while (cards.length > 0 && assign_Max > 0);
				if (_status.connectMode) {
					game.broadcastAll(function () {
						delete _status.noclearcountdown;
						game.stopCountChoose();
					});
				}
				const list = [];
				for (const i in event.given_map) {
					const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
					player.line(source, "green");
					if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) player.addExpose(0.2);
					list.push([source, event.given_map[i]]);
				}
				game.loseAsync({
					gain_list: list,
					giver: player,
					animate: "draw",
				}).setContent("gaincardMultiple");
				game.delay();
			}
		},
		subSkill: {
			used: {
				charlotte: true,
				sub: true,
			},
		},
	},
	shjuxian: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "phaseBegin",
		},
		filter: function (event, player) {
			if (event.player == player) return false;
			return player.countCards("he", { type: "equip" });
		},
		popup: false,
		async cost(event, trigger, player) {
			event.result = await player
				.chooseCard("he", get.prompt("shjuxian", trigger.player), "将一张装备牌置入" + get.translation(trigger.player) + "的装备区并摸一张牌", function (card) {
					return get.type(card) == "equip" && _status.event.target.canEquip(card, true);
				})
				.set("ai", function (card) {
					const player = get.event().player;
					if (get.attitude(player, trigger.player) < 1) return 0;
					return 7 - get.value(card);
				})
				.set("target", trigger.player)
				.forResult();
		},
		async content(event, trigger, player) {
			const target = trigger.player;
			player.logSkill("shjuxian", target);
			var subType = get.subtype(event.cards[0], false);
			var skills = [];
			player.$give(event.cards, target, false);
			await target.equip(event.cards[0]);
			await player.draw();
			if (subType == "equip1") {
				if (get.mode() == "doudizhu" && target.identity != "fan") skills.add("bahu");
				else skills.add("jsrgbahu");
			} else if (subType == "equip2") skills.add("xiangle");
			if (skills.length) target.addTempSkills(skills, { player: "phaseBefore" });
		},
	},
	/*shguiyin: {
                    audio:'ext:水泊娘山/character/audio/skill:2',
                    derivation:'shguiyin_faq',
                    group: "shguiyin_danshutiequan",
                    locked: true,
                    trigger: {
                        player: "dying",
                    },
                    forced: true,
                    filter:function (event,player) {
                        return player.hasEnabledSlot(5);
                    },
                    async content(event,trigger,player) {
                        player.disableEquip(5);
                    },
                    mod: {
                        aiOrder(player, card, num) {
                            if (get.subtype(card) == 'equip5') return 0;
                        },
                    }
                },*/
	shguiyin: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		group: "shguiyin_danshutiequan",
		init(player, skill) {
			player.addExtraEquip(skill, "danshutiequan", true, player => player.hasEmptySlot(5) && lib.card.danshutiequan);
		},
		onremove(player, skill) {
			player.removeExtraEquip(skill);
		},
		locked: true,
		trigger: {
			player: "dying",
		},
		forced: true,
		filter: function (event, player) {
			return player.hasEnabledSlot(5);
		},
		async content(event, trigger, player) {
			player.disableEquip(5);
		},
		mod: {
			aiOrder(player, card, num) {
				if (get.subtype(card) == "equip5") return 0;
			},
		},
	},
	shguiyin_danshutiequan: {
		equipSkill: true,
		inherit: "danshutiequan_skill",
		trigger: {
			player: "phaseDrawBegin1",
		},
		filter(event, player) {
			return !event.numFixed && player.hasEmptySlot(5);
		},
		forced: true,
		async content(event, trigger, player) {
			if (player.countCards("h") < player.getHandcardLimit()) {
				trigger.num += 2;
				return;
			}
			const result = await player
				.chooseTarget(
					"是否选择至多三名装备区有牌的其他角色与你一起使用【树上开花】？取消则仅你使用。",
					[1, 3],
					(card, player, target) => {
						return target.countCards("e") > 0 && player != target;
					},
					target => {
						const player = _status.event.player;
						const card = { name: "kaihua", isCard: true };
						return get.effect(target, card, player, player);
					}
				)
				.forResult();
			await player.chooseUseTarget("kaihua", true);
			if (result.bool) {
				const targets = result.targets.sortBySeat();
				for (const target of targets) await target.chooseUseTarget("kaihua", true);
			}
			trigger.changeToZero();
			await game.delay();
		},
		mod: {
			maxHandcardBase: function (player, num) {
				var zhu = game.filterPlayer2(current => current.getSeatNum() == 1)[0];
				if (zhu && player.hasEmptySlot(5)) return zhu.maxHp;
			},
		},
	},

	shzuoyao: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		global: "shzuoyao_global",
		enable: "chooseToUse",
		prompt: "将【杀】当做【无懈可击】，【闪】当做【无中生有】，【桃】当做【闪电】使用",
		viewAs(cards, player) {
			if (cards.length) {
				var name = false;
				switch (get.name(cards[0], player)) {
					case "sha":
						name = "wuxie";
						break;
					case "shan":
						name = "wuzhong";
						break;
					case "tao":
						name = "shandian";
						break;
				}
				if (name) return { name: name };
			}
			return null;
		},
		check(card) {
			if (_status.event.getParent().name == "shfengqi" && get.name(card) != "sha") return 9 - get.value(card);
			return 5 - get.value(card);
		},
		position: "hs",
		filterCard(card, player, event) {
			event = event || _status.event;
			var filter = event._backup.filterCard;
			var name = get.name(card, player);
			if (name == "sha" && filter({ name: "wuxie", cards: [card] }, player, event)) return true;
			if (name == "shan" && filter({ name: "wuzhong", cards: [card] }, player, event)) return true;
			if (name == "tao" && filter({ name: "shandian", cards: [card] }, player, event)) return true;
			return false;
		},
		filter(event, player) {
			var filter = event.filterCard;
			var sha = game.createCard("sha"),
				shan = game.createCard("shan"),
				tao = game.createCard("tao");
			if (filter(get.autoViewAs({ name: "wuxie" }, [sha]), player, event) && player.countCards("hs", { name: "sha" })) return true;
			if (filter(get.autoViewAs({ name: "wuzhong" }, [shan]), player, event) && player.countCards("hs", { name: "shan" })) return true;
			if (filter(get.autoViewAs({ name: "shandian" }, [tao]), player, event) && player.countCards("hs", { name: "tao" })) return true;
			return false;
		},
		precontent() {
			if (!player.storage.shzuoyao) player.storage.shzuoyao = [];
			switch (event.result.card.name) {
				case "wuxie":
					player.storage.shzuoyao.add("sha");
					break;
				case "wuzhong":
					player.storage.shzuoyao.add("shan");
					break;
				case "shandian":
					player.storage.shzuoyao.add("tao");
					break;
			}
			player.addTempSkill("shzuoyao_clear");
		},
		ai: {
			order(item, player) {
				if (_status.event.getParent().name == "shfengqi") return 10;
				return 7;
			},
		},
		hiddenCard(player, name) {
			if (name == "wuxie") return player.countCards("hs", { name: "sha" }) > 0;
		},
		subSkill: {
			global: {
				onremove: true,
				charlotte: true,
				mod: {
					cardEnabled(card, player) {
						var list = [];
						game.countPlayer(function (current) {
							if (current.storage.shzuoyao && current.storage.shzuoyao.length) list.addArray(current.storage.shzuoyao);
						});
						if (!card.cards || !list.length) return;
						for (var i of card.cards) {
							if (list.includes(i.name)) return false;
						}
					},
					cardRespondable(card, player) {
						var list = [];
						game.countPlayer(function (current) {
							if (current.storage.shzuoyao && current.storage.shzuoyao.length) list.addArray(current.storage.shzuoyao);
						});
						card = get.autoViewAs(card);
						if (!card.cards || !list.length) return;
						for (var i of card.cards) {
							if (list.includes(i.name)) return false;
						}
					},
					cardSavable(card, player) {
						var list = [];
						game.countPlayer(function (current) {
							if (current.storage.shzuoyao && current.storage.shzuoyao.length) list.addArray(current.storage.shzuoyao);
						});
						card = get.autoViewAs(card);
						if (!card.cards || !list.length) return;
						for (var i of card.cards) {
							if (list.includes(i.name)) return false;
						}
					},
				},
				sub: true,
			},
			clear: {
				charlotte: true,
				onremove: function (player, skill) {
					delete player.storage.shzuoyao;
				},
				sub: true,
			},
		},
	},

	shfengqi: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		direct: true,
		async content(event, trigger, player) {
			var bool = false;
			var num = 1;
			do {
				var h = player.countCards("h"),
					e = player.countCards("e"),
					j = player.countCards("j");
				bool = false;
				const result = await player
					.chooseToUse({
						filterCard: function (card, player, event) {
							//if (get.itemtype(card) != "card") return false;
							return lib.filter.filterCard.apply(this, arguments);
						},
						prompt: get.prompt("shfengqi"),
						prompt2: "使用一张牌",
						ai1: function (card) {
							if (get.type(card) == "equip" && player.canEquip(card)) return 10;
							if (get.name(card) == "shandian") return 9;
							if (get.tag(card, "gain") || get.tag(card, "draw")) return 8;
							return get.order(card);
						},
					})
					.forResult();
				if (result.bool) {
					player.logSkill("shfengqi");
					if (num == 1) await player.draw();
					if (player.countCards("h") > h || player.countCards("e") > e || player.countCards("j") > j) {
						bool = true;
						num++;
						await player.moveCard().set("forced", false);
					}
				}
			} while (bool);
		},
	},
	shyangsha: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "showCharacterAfter",
		},
		hiddenSkill: true,
		filter: function (event, player) {
			return event.toShow?.some(i => get.character(i).skills?.includes("shyangsha"));
		},
		forced: true,
		async content(event, trigger, player) {
			const nanman = get.autoViewAs({ name: "nanman", isCard: true });
			await player.chooseUseTarget(nanman, true, false);
			var cards = [];
			cards.addArray(
				Array.from(ui.discardPile.childNodes).filter(card => {
					return card.name === "sha" && get.nature(card, false);
				})
			);
			player.addSkill("shyangsha_maxHandcard");
			if (!cards.length) return;
			await player.gain(cards, "gain2");
		},
		subSkill: {
			maxHandcard: {
				mod: {
					maxHandcard: function (player, num) {
						var suits = [];
						game.countPlayer(function (current) {
							var ej = current.getCards("ej");
							for (var i of ej) suits.add(get.suit(i));
						});
						return num + Math.min(4, suits.length);
					},
				},
				sub: true,
			},
		},
	},
	shzuojun: {
		mod: {
			aiValue(player, card, num) {
				if (num <= 0 || get.itemtype(card) !== "card") return;
				if (card.name === "ying" && !player.storage.shzhuying) return num + 5;
			},
		},

		trigger: {
			player: ["phaseUseBegin", "phaseDiscardBegin"],
		},
		filter: function (event, player) {
			return player.countCards("h");
		},
		async cost(event, trigger, player) {
			const num = Math.min(
				game.countPlayer(current => {
					return player.canUse("sha", current);
				}),
				player.countCards("h")
			);

			event.result = await player
				.chooseCardTarget({
					prompt: get.prompt("shzuojun"),
					prompt2: "将至多三张基本牌当指定等量角色的【杀】使用",
					position: "hs",
					filterCard: { type: "basic" },
					selectCard: [1, num],
					filterTarget: (card, player, target) => {
						if (!ui.selected.cards) return false;
						var card = { name: "sha", cards: ui.selected.cards };
						return player.canUse(card, target);
					},
					selectTarget: function () {
						if (!ui.selected.cards) return [1, num];
						return ui.selected.cards.length;
					},
					complexTarget: true,
					complexSelect: true,
					ai1: function (card) {
						const player = _status.event.player;
						var prenum = game.countPlayer(current => {
							return player.canUse("sha", current) && get.effect(current, { name: "sha" }, player, player) > 0;
						});
						var val = get.name(card) == "sha" ? get.value(card) - 1 : get.value(card);
						if (ui.selected.cards.length >= prenum) return 0;
						return 6.5 - val;
					},
					ai2: function (target) {
						const player = _status.event.player;
						return get.effect(target, { name: "sha", cards: ui.selected.cards }, player, player);
					},
				})
				.setHiddenSkill(event.name)
				.forResult();
		},
		async content(event, trigger, player) {
			await player.useCard(
				{
					name: "sha",
					storage: {
						shzuojun: true,
					},
				},
				event.cards,
				event.targets,
				false
			);
		},
		group: "shzuojun_damage",
		subSkill: {
			damage: {
				trigger: {
					source: "damageSource",
				},
				filter(event, player) {
					return event.num > 0 && event.card && event.card.storage && event.card.storage.shzuojun;
				},
				getIndex(event, player, triggername) {
					return event.num;
				},
				forced: true,
				popup: false,
				async content(event, trigger, player) {
					if (!player.storage.shzhuying) await player.gain(lib.card.ying.getYing(1), "gain2");
					else await player.draw();
				},
				sub: true,
			},
		},
	},
	shzhuying: {
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		forced: true,
		skillAnimation: true,
		animationColor: "fire",
		filter(event, player) {
			return player.countCards("h", { name: "ying" }) > 1;
		},
		async content(event, trigger, player) {
			player.awakenSkill("shzhuying");
			await player.showHandcards();
			player.addSkills(["mashu", "wushuang"]);
			if (player.hasSkill("shzuojun")) player.storage.shzhuying = true;
		},
		derivation: ["mashu", "wushuang"],
	},
	shyoubing: {
		mod: {
			attackRange: function (player, num) {
				var x = player.storage.shyoubing[0] | 0;
				return num + x;
			},
			selectTarget: function (card, player, range) {
				if (card.name == "sha" && range[1] != -1) {
					var x = player.storage.shyoubing[1] | 0;
					range[1] += x;
				}
			},
		},
		trigger: {
			player: "phaseBegin",
		},
		forced: true,
		async content(event, trigger, player) {
			var X = player.getDamagedHp();
			if (!X || !player.storage.shyoubing) {
				player.storage.shyoubing = [0, 0, 0, 0];
				if (!X) return;
			}
			var prompts = ["攻击范围+<>", "额外指定<>名目标"];
			for (var n of [0, 1]) {
				const list = [];
				var map = {};
				for (var i = 0; i <= X; i++) {
					var cn = get.cnNumber(i, true);
					map[cn] = i;
					list.push(cn);
				}
				const result = await player
					.chooseControl(list)
					.set("ai", function (event, player) {
						return list[0];
					})
					.set("prompt", "将一个数字分配入" + prompts[n] + "内")
					.set("n", n)
					.forResult();
				var num = map[result.control];
				player.storage.shyoubing[n] = num;
				X -= num;
			}
			player.storage.shyoubing[2] = X;
		},
		group: "shyoubing_draw",
		subSkill: {
			draw: {
				trigger: {
					player: "phaseDrawBegin2",
				},
				forced: true,
				filter: function (event, player) {
					return !event.numFixed && player.storage.shyoubing && player.storage.shyoubing[2];
				},
				content: function () {
					trigger.num += player.storage.shyoubing[2];
				},
				sub: true,
			},
		},
	},
	shzhuifeng: {
		enable: "phaseUse",
		filter(event, player) {
			return game.hasPlayer(target => !player.inRange(target));
		},
		filterTarget(card, player, target) {
			return !player.inRange(target);
		},
		async content(event, trigger, player) {
			const target = event.target;
			await target.damage();
			player.tempBanSkill("shzhuifeng", "forever");
			await player.addSkills("shfeiying");
		},
		ai: {
			order: 10,
			result: {
				target(player, target) {
					return get.sgn(get.attitude(player, target)) * get.damageEffect(target, player, player);
				},
			},
		},
	},
	shfeiying: {
		charlotte: true,
		onremove: true,
		mod: {
			globalTo(from, to, distance) {
				return distance + 1;
			},
		},
		trigger: {
			global: "useCard",
		},
		filter: function (event, player) {
			return event.card.name == "shan" && player.inRange(event.player);
		},
		forced: true,
		popup: false,
		async content(event, trigger, player) {
			delete player.storage[`temp_ban_shzhuifeng`];
			player.popup("追风");
			game.log(player, "恢复了技能", "#g【追风】");
			player.removeSkill("shfeiying");
		},
	},
	shduguo: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: ["loseAfter", "loseAsyncAfter", "equipAfter"],
		},
		filter: function (event, player) {
			var cards = [];
			for (var current of game.filterPlayer()) {
				var evt = event.getl(current);
				if (evt && evt.js && evt.js.length && evt.js.some(card => get.type(card, false) == "equip")) cards.addArray(evt.js.filter(card => get.type(card, false) == "equip"));
				if (evt && evt.es && evt.es.length && evt.es.some(card => get.type(card, false) == "equip")) cards.addArray(evt.es.filter(card => get.type(card, false) == "equip"));
			}
			return (
				cards.length &&
				cards.some(card => {
					return get.position(card, true) == "d";
				})
			);
		},
		async content(event, trigger, player) {
			var cards = [];
			for (var current of game.filterPlayer()) {
				var evt = trigger.getl(current);
				if (evt && evt.js && evt.js.length && evt.js.some(card => get.type(card, false) == "equip")) cards.addArray(evt.js.filter(card => get.type(card, false) == "equip"));
				if (evt && evt.es && evt.es.length && evt.es.some(card => get.type(card, false) == "equip")) cards.addArray(evt.es.filter(card => get.type(card, false) == "equip"));
			}
			cards = cards.filter(card => get.position(card, true) == "d");
			if (!cards && !cards.length) return;
			await game.cardsGotoSpecial(cards);
			game.log(cards, "被移出了游戏");
			await player.draw();
		},
	},
	shshiting: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		viewAs: {
			name: "wuzhong",
			storage: {
				shshiting: true,
			},
		},
		viewAsFilter: function (player) {
			return player.countCards("he", { suit: "spade" }) > 0;
		},
		filterCard: function (card, player, target) {
			return get.suit(card) == "spade";
		},
		filterTarget: function (card, player, target) {
			return target != player;
		},
		selectTarget: 1,
		position: "he",
		check: function (card) {
			return 8 - get.value(card);
		},
		prompt: function () {
			return "将一张黑桃牌当【无中生有】对一名其他角色使用";
		},
		precontent() {
			player.addTempSkill("shshiting_effect");
		},
		ai: {
			wuxie: function (target, card, player, viewer) {
				if (get.mode() == "guozhan") {
					if (!_status._aozhan) {
						if (!player.isMajor()) {
							if (!viewer.isMajor()) return 0;
						}
					}
				}
			},
			basic: {
				order: 7,
				useful: 4.5,
				value: 9.2,
			},
			result: {
				target: function (player, target, card) {
					var att = get.attitude(player, target) - 1;
					if (att > 0) {
						if (player.countCards("h") >= target.countCards("h") + 2) return 2.5;
						else if (player.hp >= target.hp - 1 && target.hp > 1) return (2 * (target.hp - 0.91)) / target.maxHp;
						return -1;
					} else {
						if (player.countCards("h") >= target.countCards("h") + 2) return 0;
						else if (player.hp >= target.hp - 1) return 2 * ((target.countCards("h") + 2) * 0.11 - 1) + att;
						return -2.5 + att;
					}
				},
			},
			tag: {
				draw: 2,
			},
		},
		subSkill: {
			effect: {
				trigger: {
					player: "useCardAfter",
				},
				forced: true,
				popup: false,
				charlotte: true,
				filter: function (event, player) {
					return (
						event.card.storage &&
						event.card.storage.shshiting &&
						event.targets.some(target => {
							return target.isIn() && target.countCards("h") > player.countCards("h");
						})
					);
				},
				async content(event, trigger, player) {
					var targets = trigger.targets
						.filter(target => {
							return target.isIn() && target.countCards("h") > player.countCards("h");
						})
						.sortBySeat();
					for (var target of targets) {
						if (target.countCards("h") > player.countCards("h")) {
							await target.damage();
							if (target.hp > player.hp && target.countDiscardableCards(player, "he") > 0) await player.discardPlayerCard(target, 2, "he", true);
						}
					}
				},
				sub: true,
			},
		},
	},
	shqinye: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		global: "shqinye_ai",
		trigger: {
			global: "roundStart",
		},
		forced: true,
		locked: false,
		async content(event, trigger, player) {
			const targets = game.filterPlayer().sortBySeat();
			targets.remove(player);
			player.storage.shqinye = targets.slice(0);
			if (!targets || !targets.length) return;
			for (let target of targets) {
				const result = await target
					.chooseCard("he", "侵野：将一张基本牌交给" + get.translation(player) + "，或本轮内对你生效的锦囊牌效果改为【杀】。", function (card) {
						return get.type(card) == "basic";
					})
					.set("ai", function (card) {
						if (get.attitude(_status.event.player, _status.event.source) > 1.5) return 50 - get.value(card) + (get.suit(card, false) == "spade" ? 50 : 0);
						return 5.5 - get.value(card);
					})
					.set("source", player)
					.forResult();
				if (result?.bool && result.cards?.length) {
					await target.give(result.cards, player);
					player.storage.shqinye.remove(target);
				}
			}
			if (player.storage.shqinye && player.storage.shqinye.length) player.addTempSkills("shqinye2", "roundStart");
		},
		subSkill: {
			ai: {
				charlotte: true,
				ai: {
					threaten: 4.5,
					effect: {
						target: function (card, player, target) {
							if (
								get.type2(card) == "trick" &&
								game.hasPlayer(source => {
									return source.hasSkill("shqinye") && source.storage.shqinye && source.storage.shqinye.includes(target);
								})
							) {
								return [0, get.effect(target, { name: "sha" }, player, target)];
							}
						},
					},
				},
				sub: true,
			},
		},
	},
	shqinye2: {
		onremove: function (player, skill) {
			player.storage.shqinye = [];
		},
		mark: true,
		intro: {
			mark: function (dialog, content, player) {
				dialog.addText("本轮未给你牌的角色");
				dialog.add(player.getStorage("shqinye"));
			},
		},
		trigger: {
			global: [
				//军争
				"guoheBegin",
				"jiedaoBegin",
				"juedouBegin",
				"nanmanBegin",
				"shunshouBegin",
				"taoyuanBegin",
				"wanjianBegin",
				"wuguBegin",
				"wuzhongBegin",
				"lebuBegin",
				"shandianBegin",
				"huogongBegin",
				"tiesuoBegin",
				"bingliangBegin",
				//国战
				"gz_haolingtianxiaBegin",
				"gz_kefuzhongyuanBegin",
				"gz_guguoanbangBegin",
				"gz_wenheluanwuBegin",
				"xietianziBegin",
				"shuiyanqijunxBegin",
				"chilingBegin",
				"diaohulishanBegin",
				"lulitongxinBegin",
				"lianjunshengyanBegin",
				"huoshaolianyingBegin",
				"yuanjiaoBegin",
				"zhibiBegin",
				"yiyiBegin",
				//古剑奇谭
				/*
                            "jinlianzhuBegin","heilonglinpianBegin","shatangBegin","shujinsanBegin","liufengsanBegin","shihuifenBegin",
                            */
				//炉石
				/*
                            "linghunzhihuoBegin","jihuocardBegin","zhaomingdanBegin","shijieshuBegin","shandianjianBegin",
                            "siwangchanraoBegin","dunpaigedangBegin","chuansongmenBegin","tanshezhirenBegin","xingjiegoutongBegin",
                            "shenenshuBegin","zhiliaoboBegin","yuansuhuimieBegin",
                            */
				//sp
				"jinchanBegin",
				"qijiaBegin",
				"shengdongBegin",
				"zengbinBegin",
				//轩辕剑
				/*
                            "liuxinghuoyuBegin","yangpijuanBegin","shencaojieBegin","guisheqiBegin","xianluhuiBegin",
                            "zhufangshenshiBegin","jingleishanBegin","chiyuxiBegin",
                            */
				//衍生
				"lx_huoshaolianyingBegin",
				"jingxiangshengshiBegin",
				"qizhengxiangshengBegin",
				"binglinchengxiaxBegin",
				"tiaojiyanmeiBegin",
				"wy_meirenjiBegin",
				"wy_xiaolicangdaoBegin",
				"shuiyanqijunyBegin",
				//应变
				"suijiyingbianBegin",
				"zhujinqiyuanBegin",
				"dongzhuxianjiBegin",
				"chuqibuyiBegin",
				//用间
				"guaguliaoduBegin",
				"chenghuodajieBegin",
				"tuixinzhifuBegin",
				//运筹帷幄
				"diaobingqianjiangBegin",
				"caochuanjiejianBegin",
				"geanguanhuoBegin",
				"shezhanqunruBegin",
				"youdishenruBegin",
				"wangmeizhikeBegin",
				"chenhuodajieBegin",
				"fudichouxinBegin",
				"shuiyanqijunBegin",
				"toulianghuanzhuBegin",
				//逐鹿天下
				"zhulu_cardBegin",
				"kaihuaBegin",
				"jiejiaBegin",
				"caochuanBegin",
				//其他....
				"sadouchengbingxBegin",
				"yihuajiemuxBegin",
			],
		},
		forced: true,
		locked: false,
		//popup: false,
		filter: function (event, player) {
			return player.storage.shqinye && player.storage.shqinye.includes(event.target);
		},
		content: function () {
			trigger.setContent(lib.skill.shqinye2.shaContent);
		},
		shaContent: function () {
			"step 0";
			if (typeof event.shanRequired != "number" || !event.shanRequired || event.shanRequired < 0) {
				event.shanRequired = 1;
			}
			if (typeof event.baseDamage != "number") event.baseDamage = 1;
			if (typeof event.extraDamage != "number") event.extraDamage = 0;
			("step 1");
			if (event.directHit || event.directHit2 || (!_status.connectMode && lib.config.skip_shan && !target.hasShan())) {
				event._result = { bool: false };
			} else if (event.skipShan) {
				event._result = { bool: true, result: "shaned" };
			} else {
				var next = target.chooseToUse("请使用一张闪响应杀");
				next.set("type", "respondShan");
				next.set("filterCard", function (card, player) {
					if (get.name(card) != "shan") return false;
					return lib.filter.cardEnabled(card, player, "forceEnable");
				});
				if (event.shanRequired > 1) {
					next.set("prompt2", "（共需使用" + event.shanRequired + "张闪）");
				} else if (game.hasNature(event.card, "stab")) {
					next.set("prompt2", "（在此之后仍需弃置一张手牌）");
				}
				next.set("ai1", function (card) {
					if (_status.event.useShan) return get.order(card);
					return 0;
				}).set("shanRequired", event.shanRequired);
				next.set("respondTo", [player, card]);
				next.set(
					"useShan",
					(() => {
						if (target.hasSkillTag("noShan", null, event)) return false;
						if (target.hasSkillTag("useShan", null, event)) return true;
						if (target.isLinked() && game.hasNature(event.card) && get.attitude(target, player._trueMe || player) > 0) return false;
						if (event.baseDamage + event.extraDamage <= 0 && !game.hasNature(event.card, "ice")) return false;
						if (event.baseDamage + event.extraDamage >= target.hp + (player.hasSkillTag("jueqing", false, target) || target.hasSkill("gangzhi") ? target.hujia : 0)) return true;
						if (!game.hasNature(event.card, "ice") && get.damageEffect(target, player, target, get.nature(event.card)) >= 0) return false;
						if (event.shanRequired > 1 && target.mayHaveShan(target, "use", null, "count") < event.shanRequired - (event.shanIgnored || 0)) return false;
						return true;
					})()
				);
				//next.autochoose=lib.filter.autoRespondShan;
			}
			("step 2");
			if (!result || !result.bool || !result.result || result.result != "shaned") {
				event.trigger("shaHit");
			} else {
				event.shanRequired--;
				if (event.shanRequired > 0) {
					event.goto(1);
				} else if (game.hasNature(event.card, "stab") && target.countCards("h") > 0) {
					event.responded = result;
					event.goto(4);
				} else {
					event.trigger("shaMiss");
					event.responded = result;
				}
			}
			("step 3");
			if ((!result || !result.bool || !result.result || result.result != "shaned") && !event.unhurt) {
				if (!event.directHit && !event.directHit2 && lib.filter.cardEnabled(new lib.element.VCard({ name: "shan" }), target, "forceEnable") && target.countCards("hs") > 0 && get.damageEffect(target, player, target) < 0) target.addGaintag(target.getCards("hs"), "sha_notshan");
				target.damage(get.nature(event.card));
				event.result = { bool: true };
				event.trigger("shaDamage");
			} else {
				event.result = { bool: false };
				event.trigger("shaUnhirt");
			}
			event.finish();
			("step 4");
			target.chooseToDiscard("刺杀：请弃置一张牌，否则此【杀】依然造成伤害").set("ai", function (card) {
				var target = _status.event.player;
				var evt = _status.event.getParent();
				var bool = true;
				if (get.damageEffect(target, evt.player, target, evt.card.nature) >= 0) bool = false;
				if (bool) {
					return 8 - get.useful(card);
				}
				return 0;
			});
			("step 5");
			if ((!result || !result.bool) && !event.unhurt) {
				target.damage(get.nature(event.card));
				event.result = { bool: true };
				event.trigger("shaDamage");
				event.finish();
			} else {
				event.trigger("shaMiss");
			}
			("step 6");
			if ((!result || !result.bool) && !event.unhurt) {
				target.damage(get.nature(event.card));
				event.result = { bool: true };
				event.trigger("shaDamage");
				event.finish();
			} else {
				event.result = { bool: false };
				event.trigger("shaUnhirt");
			}
		},
	},
	shjiaolan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		global: "shjiaolan_ai",
		trigger: {
			player: "phaseBegin",
		},
		async content(event, trigger, player) {
			const card = get.bottomCards(4, true);
			const { cards } = game.cardsGotoOrdering(card);
			if (_status.connectMode)
				game.broadcastAll(function () {
					_status.noclearcountdown = true;
				});
			event.given_map = {};
			if (!cards || !cards.length) return;
			const givetoEnemy = [];
			do {
				const { bool, links } = await player
					.chooseCardButton("搅澜：请选择要分配的牌", cards.filter(card => get.type(card) == "basic").length > 0, cards, [1, cards.length])
					.set("filterButton", function (button) {
						return get.type(button.link, false) == "basic";
					})
					.set("ai", () => {
						if (ui.selected.buttons.length == 0) return 1;
						return 0;
					})
					.forResult();
				if (!bool) return;
				cards.removeArray(links);
				event.togive = links.slice(0);
				const targets = (
					await player
						.chooseTarget("选择一名角色获得" + get.translation(links), true)
						.set("ai", function (target) {
							var att = get.attitude(get.event().player, target);
							var bool = get.name(links[0]) == "shan" || get.name(links[0]) == "sha";
							if (bool) {
								var val = 0;
								if (!givetoEnemy.includes(target) && !target.hasCard(card => card.hasGaintag("visible_shjiaolan"), "h")) val += 1;
								else val -= 1;
								if (lib.skill.shpengshuai.hasPhase(target) || get.name(card) == "shan") val += 1;
								if (get.damageEffect(target, player, player, "thunder") > 0) val += 2;
								if (val > 2) return -val * att;
								return att / 50;
							} else {
								var val = 0;
								if (target.hp > 2 || target.countCards("h") > 2) val += 2.5;
								if (!lib.skill.shpengshuai.hasPhase(target) || target == player) val += 1.8;
								if (get.name(card) == "tao") val += 2;
								if (get.damageEffect(target, player, player, "thunder") > 0 && att > 0) val += 1;
								if (val > 3.5) return val * att;
								return att / 100;
							}
						})
						.set("enemy", get.value(event.togive[0], player, "raw") < 0)
						.forResult()
				).targets;
				if (targets.length) {
					const id = targets[0].playerid,
						map = event.given_map;
					if (!map[id]) map[id] = [];
					if (get.attitude(player, targets[0]) < 0) givetoEnemy.push(targets[0]);
					map[id].addArray(event.togive);
				}
			} while (cards.filter(card => get.type(card, false) == "basic").length > 0);
			if (_status.connectMode) {
				game.broadcastAll(function () {
					delete _status.noclearcountdown;
					game.stopCountChoose();
				});
			}
			const list = [];
			for (const i in event.given_map) {
				const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
				player.line(source, "green");
				if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) player.addExpose(0.2);
				list.push([source, event.given_map[i]]);
			}
			game.loseAsync({
				gain_list: list,
				giver: player,
				animate: "gain2",
			}).setContent("gaincardMultiple");
			for (var i in event.given_map) {
				var source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
				await source.addShownCards(event.given_map[i], "visible_shjiaolan");
			}
			await player.addSkill("shjiaolan_damage");
			game.delay();
		},
		subSkill: {
			damage: {
				trigger: {
					global: "roundEnd",
				},
				firstDo: true,
				forced: true,
				filter(event, player) {
					return game.hasPlayer(current => {
						return current.countCards("h", card => card.hasGaintag("visible_shjiaolan"));
					});
				},
				async content(event, trigger, player) {
					const targets = game
						.filterPlayer(current => {
							return current.countCards("h", card => card.hasGaintag("visible_shjiaolan"));
						})
						.sortBySeat();
					for (let target of targets) {
						await target.damage("thunder");
					}
					await player.removeSkill("shjiaolan_damage");
				},
				sub: true,
			},
		},
	},
	shjiaolan_ai: {
		mod: {
			aiValue(player, card, num) {
				if (num <= 0 || get.itemtype(card) !== "card") return;
				if (card.hasGaintag("visible_shjiaolan")) return 0;
			},
			aiOrder: function (player, card, num) {
				if (get.itemtype(card) == "card" && card.hasGaintag("visible_shjiaolan")) return num + 1;
			},
		},
	},
	shzonglang: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		init: function (player) {
			player.storage.shzonglang = [];
			for (let i = 1; i <= game.countPlayer2(); i++) {
				player.storage.shzonglang.push(i);
			}
		},
		trigger: {
			global: "roundStart",
		},
		forced: true,
		unique: true,
		filter(event, player) {
			return player.storage.shzonglang.length;
		},
		async content(event, trigger, player) {
			const list = player.storage.shzonglang.slice(0);
			if (!list.length) return;
			const result = await player
				.chooseControl(list)
				.set("prompt", "请选择一个座次作为行动次序")
				.set("ai", function (event, player) {
					return Math.floor(Math.random() * list.length);
				})
				.forResult();
			let seat = lib.skill.shzonglang.getNumber(result.control);
			game.log(player, "选择了", get.cnNumber(seat, true), "号位作为行动次序");
			if (seat == 1) {
				await player.gainMaxHp();
				await player.removeSkill("shzonglang");
			}
			player.storage.shzonglang.remove(seat);
			if (!lib.onround.includes(lib.skill.shzonglang.onRound)) {
				lib.onround.push(lib.skill.shzonglang.onRound);
			}
			await player.addTempSkill("shzonglang_phase", "roundStart");
			player.storage.shzonglang_phase = seat;
		},
		onRound(event) {
			return (event.relatedEvent || event.getParent(2)).name != "shzonglang_phase";
		},
		getNumber: function (num) {
			for (let i = 0; i < 10; i++) {
				if (num == i || num == get.cnNumber(i)) return i;
			}
			return -1;
		},
	},
	shzonglang_phase: {
		onRound(event) {
			return !event.shzonglangs_phase;
		},
		trigger: {
			player: "phaseBeforeStart",
		},
		firstDo: true,
		popup: false,
		charlotte: true,
		forced: true,
		filter(event, player) {
			return !event.skill;
		},
		async content(event, trigger, player) {
			if (!trigger._finished) {
				trigger.finish();
				trigger.untrigger(true);
				trigger._triggered = 5;
			}
		},
		check(source, player) {
			const players = game.players
				.slice()
				.concat(game.dead)
				.filter(target => {
					return target.isAlive() || [source, player].includes(target);
				})
				.sort((a, b) => parseInt(a.dataset.position) - parseInt(b.dataset.position));
			const num = players.indexOf(source),
				num2 = players.indexOf(player);
			return num2 - num == 1 || (num == players.length - 1 && num2 == 0);
		},
		group: ["shzonglang_phase_start", "shzonglang_phase_over"],
		subSkill: {
			start: {
				charlotte: true,
				trigger: {
					global: "phaseBeforeStart",
				},
				filter: function (event, player) {
					if (event.player.seatNum >= player.seatNum || event.shzonglangs_phase) return false;
					return !event.skill && event.player.seatNum == player.getStorage("shzonglang_phase");
				},
				forced: true,
				popup: false,
				async content(event, trigger, player) {
					player.storage.shzonglang_phase = 0;
					const next = player.insertPhase();
					if (!trigger._finished) {
						trigger.finish();
						trigger.untrigger(true);
						trigger._triggered = 5;
						game.players
							.slice()
							.concat(game.dead)
							.forEach(current => {
								current.getHistory().isSkipped = true;
								current.getStat().isSkipped = true;
							});
						const evt = trigger.player.insertPhase();
						evt.relatedEvent = trigger.relatedEvent || trigger.getParent(2);
						if (trigger.skill) evt.skill = trigger.skill;
						else delete evt.skill;
						evt.shzonglangs_phase = true;
						if (!lib.onround.includes(lib.skill.shzonglang_phase.onRound)) {
							lib.onround.push(lib.skill.shzonglang_phase.onRound);
						}
						game.broadcastAll(function (player) {
							player.classList.remove("glow_phase");
							delete _status.currentPhase;
						}, player);
					}
				},
				sub: true,
			},
			over: {
				charlotte: true,
				trigger: {
					global: "phaseOver",
				},
				filter(event, player) {
					var targets = game.players
						.slice()
						.concat(game.dead)
						.filter(current => current.seatNum == player.getStorage("shzonglang_phase"));
					if (event.player.seatNum == player.getStorage("shzonglang_phase")) {
						return event.player.seatNum >= player.seatNum;
					}
					return targets && lib.skill.shzonglang_phase.check(event.player, targets[0]) && !targets[0].isAlive();
				},
				forced: true,
				popup: false,
				async content(event, trigger, player) {
					player.storage.shzonglang_phase = 0;
					const next = player.insertPhase();
				},
				sub: true,
			},
		},
	},
	shnilin: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "useCardAfter",
		},
		filter: function (event, player) {
			if (event.player == player) return false;
			return (
				["sha", "shan"].includes(event.card.name) &&
				player.countCards("h", card => {
					return ["sha", "shan"].remove(event.card.name).includes(get.name(card));
				})
			);
		},
		direct: true,
		content: function () {
			card = { name: "juedou" };
			if (player.hasUseTarget(card, true, true)) {
				var next = player.chooseToUse();
				next.logSkill = "shnilin";
				next.set("_proto", ["sha", "shan"].remove(trigger.card.name));
				next.set("openskilldialog", get.prompt2("shnilin"));
				next.set("norestore", true);
				next.set("_backupevent", "shnilinx");
				next.set("custom", {
					add: {},
					replace: { window: function () {} },
				});
				next.backup("shnilinx");
			}
		},
	},
	shnilinx: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		filterCard: function (card) {
			return get.itemtype(card) == "card" && get.name(card) == _status.event._proto[0];
		},
		position: "hs",
		viewAs: {
			name: "juedou",
		},
		prompt: function () {
			return "将一张" + get.translation(_status.event._proto[0]) + "当决斗使用";
		},
		check: function (card) {
			return 7 - get.value(card);
		},
	},

	shjianwu: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		init: function (player) {
			player.storage.shjianwu = [];
		},
		changeToQueue: async function (player, content) {
			while (player.storage.shjianwu.length >= 3) {
				player.storage.shjianwu.shift();
			}
			player.storage.shjianwu.push(content);
			player.markSkill("shjianwu");
		},
		enable: "phaseUse",
		comboSkill: true,
		direct: true,
		async content(event, trigger, player) {
			player.addTempSkill("shjianwu_aicount", "phaseUseAfter");
			//game.log("是否打出一张杀？")
			const result = await player
				.chooseToRespond((card, player) => {
					return get.name(card) == "sha";
				}, "是否打出一张杀")
				.set("ai", function (card) {
					const player = get.event().player;
					const cardx = { name: "sha", nature: `thunder|stab`, Card: true };
					if (player.storage.shjianwu.length > 1 && get.type2(player.storage.shjianwu[player.storage.shjianwu.length - 2]) == "trick" && player.storage.shjianwu[player.storage.shjianwu.length - 1] == "重铸闪" && player.hasValueTarget(cardx, false)) return get.order(card) + 0.15;
					var validTricks = player.getCards("h", function (c) {
						if (get.type(c) !== "trick") return false;
						var info = get.info(c);
						if (info.notarget || info.selectTarget !== 1 || info.allowMultiple === false) return false;
						var positiveCount = game.countPlayer(function (target) {
							return lib.filter.targetEnabled2(c, player, target) && get.effect(target, c, player, player) > 0;
						});
						return positiveCount >= 2;
					});
					if (validTricks.length > 0) return 3;
					if (!player.countCards("h", { name: "shan" }) && player.countCards("h", { name: "sha" }).length > 1 && !player.getCardUsable("sha")) return 1;
					return 0;
				})
				.forResult();
			if (!result.bool) {
				//game.log("是否打出一张杀？否！")
				//game.log("是否重铸一张闪？")
				if (!player.countCards("he", { name: "shan" })) return;
				const { bool, cards } = await player
					.chooseCard("he", "是否重铸一张闪", function (card) {
						return get.name(card) == "shan";
					})
					.set("ai", function (card) {
						return 100 - get.value(card);
					})
					.forResult();
				if (bool) {
					//game.log("是否重铸一张闪？是")
					player.logSkill("shjianwu");
					await player.recast(cards);
					lib.skill.shjianwu.changeToQueue(player, "重铸闪");
					player.addTempSkill("shjianwux");
					player.addMark("shjianwux", 1, false);
				} else {
					//game.log("是否重铸一张闪？否")
					player.storage.shjianwu_aicount++;
					game.log(player.storage.shjianwu_aicount);
				}
			} else {
				//game.log("是否打出一张杀？是！")
				player.logSkill("shjianwu");
				player.addTempSkill("shjianwux");
				player.addMark("shjianwux", 1, false);
				if (player.storage.shjianwu.length > 1) {
					if (player.storage.shjianwu[player.storage.shjianwu.length - 1] == "重铸闪" && get.type2(player.storage.shjianwu[player.storage.shjianwu.length - 2]) == "trick") {
						const result2 = await player
							.chooseUseTarget(
								{
									name: "sha",
									nature: `thunder|stab`,
									Card: true,
								},
								get.prompt("shjianwu"),
								"视为使用一张雷刺【杀】",
								false,
								"nodistance"
							)
							.set("logSkill", "shjianwu")
							.forResult();
						if (result2.bool) {
							player.storage.shjianwu = [];
							player.unmarkSkill("shjianwu");
							return;
						}
					}
				}
				lib.skill.shjianwu.changeToQueue(player, "打出杀");
			}
		},
		ai: {
			order: function () {
				const player = _status.event.player,
					cnt = player.storage.shjianwu_aicount | 0;
				var validTricks = player.getCards("h", function (card) {
					if (get.type(card) !== "trick") return false;
					var info = get.info(card);
					if (info.notarget || info.selectTarget !== 1 || info.allowMultiple === false) return false;
					var positiveCount = game.countPlayer(function (target) {
						return lib.filter.targetEnabled2(card, player, target) && get.effect(target, card, player, player) > 0;
					});
					return positiveCount >= 2;
				});
				var maxOrder = 0.1 + Math.max(...validTricks.map(card => get.order(card)));
				//game.log("cnt=",cnt,"maxOrder=" ,maxOrder," 10 - Math.min(10, 3 * cnt)=",10 - Math.min(10, 3 * cnt)," maxOrder - Math.min(maxOrder, 3 * cnt)=",maxOrder - Math.min(maxOrder, 3 * cnt))
				if (player.countCards("h", { name: "shan" })) return 10 - Math.min(10, 3 * cnt);
				if (player.countCards("h", { name: "sha" }) > 0 && validTricks.length > 0 && last != "打出杀") return maxOrder - Math.min(maxOrder, 3 * cnt);
				if (!player.countCards("h", { name: "shan" }) && player.countCards("h", { name: "sha" }).length > 1 && !player.getCardUsable("sha")) return get.order({ name: "sha" }) - Math.min(5, 3 * cnt);
				return 1 - Math.min(1, cnt);
			},
			result: {
				player(player, target) {
					const cnt = player.storage.shjianwu_aicount | 0;
					var history = player.storage.shjianwu;
					var last = history[history.length - 1];
					if (cnt > 3) return -1;
					var validTricks = player.getCards("h", function (card) {
						if (get.type(card) !== "trick") return false;
						var info = get.info(card);
						if (info.notarget || info.selectTarget !== 1 || info.allowMultiple === false) return false;
						var positiveCount = game.countPlayer(function (target) {
							return lib.filter.targetEnabled2(card, player, target) && get.effect(target, card, player, player) > 0;
						});
						return positiveCount >= 2;
					});
					if (player.countCards("h", { name: "shan" })) return 1;
					if (player.countCards("h", { name: "sha" }) > 0 && validTricks.length > 0 && last != "打出杀") return 0.7;
					if (!player.countCards("h", { name: "shan" }) && player.countCards("h", { name: "sha" }).length > 1 && !player.getCardUsable("sha")) return 0.5;
					return -1;
				},
			},
		},
		locked: false,
		mod: {
			aiOrder: function (player, card, num) {
				if (typeof card !== "object" || get.type2(card) !== "trick" || !player.storage.shjianwu.length) return num;
				var history = player.storage.shjianwu;
				var last = history[history.length - 1];
				var hasSha = player.countCards("h", { name: "sha" }) > 0;
				var hasShan = player.countCards("h", { name: "shan" }) > 0;
				// 1. 上一步重铸了闪，且自己受伤 → 使用锦囊可回血，收益最高
				if (last === "重铸闪" && player.isDamaged()) {
					return num + 10;
				}
				// 2. 上一步打出了杀，且锦囊可以被技能增加目标，且有额外正收益目标
				if (last === "打出杀") {
					var info = get.info(card);
					// 排除无法被扩展目标的锦囊：无目标、多目标、明确禁止多选
					if (!info.notarget && info.selectTarget === 1 && info.allowMultiple !== false) {
						var effectTargets = game.filterPlayer(function (target) {
							return lib.filter.targetEnabled2(card, player, target) && get.effect(target, card, player, player) > 0;
						});
						if (effectTargets.length > 1) {
							return num + 7;
						}
					}
				}
				// 3. 手中有杀有闪，保证技能不会空发 → 适当提高顺序
				if (hasSha && hasShan) {
					return num + 5;
				}
				return num;
			},
		},
		intro: {
			content: "$",
		},
		group: ["shjianwu_combo13", "shjianwu_combo23"],
		subSkill: {
			aicount: {
				init(player, skill) {
					player.storage[skill] = 0;
				},
				onremove: true,
				trigger: {
					player: "gainAfter",
				},
				charlotte: true,
				forced: true,
				popup: false,
				filter(event, player) {
					return (
						event.cards.filter(card => {
							return get.name(card) == "sha" || get.name(card) == "shan";
						}).length > 0
					);
				},
				async content(event, trigger, player) {
					if (
						trigger.cards.filter(card => {
							return get.name(card) == "shan";
						}).length > 0
					)
						player.storage.shjianwu_aicount = 0;
					else if (
						trigger.cards.filter(card => {
							return get.name(card) == "sha";
						}).length > 0
					)
						player.storage.shjianwu_aicount = 1;
				},
				sub: true,
			},
			combo23: {
				trigger: {
					player: "useCard1",
				},
				forced: true,
				popup: false,
				direct: true,
				async content(event, trigger, player) {
					if (get.type2(trigger.card) == "trick") {
						if (player.storage.shjianwu[player.storage.shjianwu.length - 1] == "重铸闪") {
							player.logSkill("shjianwu");
							await player.recover();
							player.storage.shjianwu = [];
							player.unmarkSkill("shjianwu");
							return;
						} else if (player.storage.shjianwu[player.storage.shjianwu.length - 1] == "打出杀") {
							trigger.card.storage.shjianwu = true;
							//return;
						}
					}
					lib.skill.shjianwu.changeToQueue(player, trigger.card);
				},
				sub: true,
			},
			combo13: {
				trigger: {
					player: "useCard2",
				},
				filter(event, player) {
					if (get.type(event.card) != "trick" || !event.card.storage.shjianwu) return false;
					return game.hasPlayer(current => !event.targets.includes(current) && lib.filter.targetEnabled2(event.card, player, current));
				},
				async cost(event, trigger, player) {
					event.result = await player
						.chooseTarget(get.prompt2("shjianwu"), function (card, player, target) {
							const trigger = get.event().getTrigger();
							if (trigger.targets.includes(target)) return false;
							return lib.filter.targetEnabled2(trigger.card, get.player(), target);
						})
						.set("ai", target => {
							const trigger = get.event().getTrigger();
							const eff1 = get.effect(target, trigger.card, trigger.player, get.player());
							return eff1;
						})
						.forResult();
				},
				async content(event, trigger, player) {
					player.storage.shjianwu = [];
					player.unmarkSkill("shjianwu");
					trigger.targets.addArray(event.targets);
					game.log(event.targets, "成为了", trigger.card, "的额外目标");
				},
				sub: true,
			},
		},
	},
	shjianwux: {
		mod: {
			cardUsable(card, player, num) {
				if (card.name == "sha") return num + player.storage.shjianwux;
			},
		},
		charlotte: true,
		onremove: true,
	},
	shcheying: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		forced: true,
		trigger: {
			player: "useCard",
		},
		filter: function (event, player) {
			var evt = player.getLastUsed(1);
			if (!evt) return false;
			return event.card && get.type2(evt.card) == "trick";
		},
		content: function () {
			trigger.directHit.addArray(game.filterPlayer());
		},
		ai: {
			directHit_ai: true,
			skillTagFilter: function (player, tag, arg) {
				var evt = player.getLastUsed(1);
				if (arg && arg.card && arg.card.name == "sha" && evt && get.type2(evt.card) == "trick") return true;
				return false;
			},
		},
		mod: {
			aiOrder: function (player, card, num) {
				if (typeof card == "object" && get.name(card) == "sha") {
					var evt = player.getLastUsed(1);
					if (evt && get.type2(evt.card) == "trick") return num + 3;
				}
			},
		},
		group: "shcheying_target",
		subSkill: {
			target: {
				trigger: {
					target: "useCardToTargeted",
				},
				forced: true,
				filter: function (event, player) {
					var evt = event.player.getLastUsed(1);
					if (!evt) return false;
					return event.card && get.type2(evt.card) != "trick";
				},
				content() {
					if ([true, false].randomGet()) game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shcheying1.mp3");
					else game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shcheying2.mp3");
					player.draw();
				},
				sub: true,
			},
		},
	},
	shqizhen_func: {
		reinit: function (player) {
			player.storage.shqizhen_subnum = 4;
			player.storage.shqizhen_opqueue = ["sha", "shan", "wuxie", "juedou"];
		},
		error: function (player) {
			if (!player.storage.shqizhen_subnum || !player.storage.shqizhen_opqueue.length) lib.skill.shqizhen_func.reinit(player);
		},
		shqizhen_zhuanhuanji: async function (event, trigger, player) {
			lib.skill.shqizhen_func.error(player);
			await player.changeZhuanhuanji("shqizhen");
			var storage = (player.storage.shqizhen || 0) % player.storage.shqizhen_subnum;
			if (!storage) {
				var list = [];
				for (var i = 0; i < lib.inpile.length; i++) {
					var name = lib.inpile[i];
					if (name == "sha") {
						if (!player.storage.shqizhen_opqueue.includes(name)) list.push(["基本", "", "sha"]);
					} else if (get.type(name) == "trick" && !player.storage.shqizhen_opqueue.includes(name)) list.push(["锦囊", "", name]);
					else if (get.type(name) == "basic" && !player.storage.shqizhen_opqueue.includes(name)) list.push(["基本", "", name]);
				}
				if (!list.length) return;
				const result = await player
					.chooseButton(["请选择为奇阵增加一个转换项", [list, "vcard"]])
					.set("forced", true)
					.set("ai", button => {
						const card = { name: button.link[2], nature: button.link[3] };
						const player = get.event().player;
						return player.getUseValue(card);
					})
					.forResult();
				if (result.bool) {
					player.storage.shqizhen_opqueue.push(result.links[0][2]);
					player.storage.shqizhen_subnum = player.storage.shqizhen_opqueue.length;
					player.storage.shqizhen = 0;
				}
			}
		},
		checkMin: function (player) {
			var list = [];
			var hes = player.getCards("he");
			if (!hes || !hes.length) return list;
			var storage = player.storage.shqizhen;
			const Q = 1 + ((storage || 0) % player.storage.shqizhen_subnum);
			let dp = new Array(Q).fill().map(() => ({
				weight: Infinity,
				path: [],
			}));
			dp[0] = { weight: 0, path: [] };
			const next = dp.map(item => ({ ...item, path: [...item.path] }));
			next[0].weight = Infinity;
			for (const card of hes) {
				const rem = get.number(card) % Q;
				for (let r = 0; r < Q; r++) {
					if (dp[r].weight === Infinity) continue;
					const newR = (r + rem) % Q;
					const newWeight = dp[r].weight + get.value(card);
					if (newWeight < next[newR].weight) {
						next[newR] = {
							weight: newWeight,
							path: [...dp[r].path, card],
						};
					}
				}
				if (get.value(card) < next[rem].weight) {
					next[rem] = { weight: get.value(card), path: [card] };
				}

				dp = next;
			}
			return dp[0].path.length > 0 ? dp[0].path : [];
		},
		opsort: function (player, vcards, i) {
			const weights = vcards.map(vcard => player.getUseValue({ name: vcard[2] }));
			const maxWeight = Math.max(...weights);
			const maxIndex = vcards.findIndex(vcard => player.getUseValue({ name: vcard[2] }) === maxWeight);
			const maxVcard = vcards[maxIndex];
			const remaining = vcards.filter((vcard, index) => index !== maxIndex);
			remaining.sort((a, b) => player.getUseValue({ name: b[2] }) - player.getUseValue({ name: a[2] }));
			const rightPartLength = vcards.length - 1 - i;
			const rightPart = remaining.slice(0, rightPartLength);
			const leftPart = remaining.slice(rightPartLength);
			return [...leftPart, maxVcard, ...rightPart];
		},
	},
	shqizhen: {
		init: function (player) {
			player.storage.shqizhen_subnum = 4;
			player.storage.shqizhen_opqueue = ["sha", "shan", "wuxie", "juedou"];
		},
		audio: "ext:水泊娘山/character/audio/skill:4",
		zhuanhuanji: "number",
		mark: true,
		marktext: "☯",
		intro: {
			markcount: (storage, player) => 1 + ((storage || 0) % player.storage.shqizhen_subnum),
			content(storage, player) {
				var num = 1 + ((storage || 0) % player.storage.shqizhen_subnum);
				return "转换技。你可以将任意张点数和为" + num + "的倍数的牌置于牌堆两端，视为使用一张" + "【" + get.translation(player.storage.shqizhen_opqueue[num - 1]) + "】。";
			},
		},
		enable: "chooseToUse",
		hiddenCard: function (player, name) {
			var storage = player.storage.shqizhen;
			var name2 = player.storage.shqizhen_opqueue[(storage || 0) % player.storage.shqizhen_subnum];
			if (name == name2) return true;
			return false;
		},
		filter: function (event, player) {
			var storage = player.storage.shqizhen;
			var name = player.storage.shqizhen_opqueue[(storage || 0) % player.storage.shqizhen_subnum];
			if (event.filterCard({ name: name, isCard: true }, player, event)) return player.countCards("he");
			return false;
		},
		viewAs(cards, player) {
			var storage = player.storage.shqizhen;
			var name = player.storage.shqizhen_opqueue[(storage || 0) % player.storage.shqizhen_subnum];
			return {
				name: name,
				suit: "none",
				number: null,
				isCard: true,
			};
		},
		filterCard: true,
		selectCard: [1, Infinity],
		filterOk() {
			var player = _status.event.player;
			var storage = player.storage.shqizhen;
			var num = 1 + ((storage || 0) % player.storage.shqizhen_subnum);
			var numx = 0;
			for (var i = 0; i < ui.selected.cards.length; i++) {
				numx += get.number(ui.selected.cards[i]);
			}
			return !(numx % num);
		},
		complexCard: true,
		position: "he",
		check(card) {
			var player = _status.event.player;
			const precards = lib.skill.shqizhen_func.checkMin(player);
			if (precards.includes(card) && get.value(precards) < 9) return 7 - get.value(card);
			return 0;
		},
		popname: true,
		ignoreMod: true,
		async precontent(event, trigger, player) {
			var card = event.result.cards[0];
			event.card = card;
			const cards = event.result.cards;
			event.result.card = { name: event.result.card.name, isCard: true };
			event.result.cards = [];
			const result = await player
				.chooseToMove()
				.set("list", [["牌堆顶", cards], ["牌堆底"]])
				.set("prompt", "奇阵：将这些牌置于牌堆顶或牌堆底")
				.set("processAI", function (list) {
					var cards = list[0][1],
						player = _status.event.player;
					var target = _status.currentPhase.next;
					var att = get.sgn(get.attitude(player, target));
					var top = [];
					var judges = target.getCards("j");
					var stopped = false;
					if (player != target || !target.hasWuxie()) {
						for (var i = 0; i < judges.length; i++) {
							var judge = get.judge(judges[i]);
							cards.sort(function (a, b) {
								return (judge(b) - judge(a)) * att;
							});
							if (judge(cards[0]) * att < 0) {
								stopped = true;
								break;
							} else {
								top.unshift(cards.shift());
							}
						}
					}
					var bottom;
					if (!stopped) {
						cards.sort(function (a, b) {
							return (get.value(b, player) - get.value(a, player)) * att;
						});
						while (cards.length) {
							if (get.value(cards[0], player) <= 5 == att > 0) break;
							top.unshift(cards.shift());
						}
					}
					bottom = cards;
					return [top, bottom];
				})
				.forResult();
			if (result.bool) {
				var top = result.moved[0];
				var bottom = result.moved[1];
				top.reverse();
				player.popup(get.cnNumber(top.length) + "上" + get.cnNumber(bottom.length) + "下");
				var cards2 = top.slice(0).addArray(bottom);
				player.$throw(cards2.length, 1000);
				player.lose(cards2, ui.cardPile).set("top", top).insert_index = function (event, card) {
					if (event.top.includes(card)) {
						return ui.cardPile.firstChild;
					}
					return null;
				};
			}
			await lib.skill.shqizhen_func.shqizhen_zhuanhuanji(event, trigger, player);
		},
		prompt() {
			var player = _status.event.player;
			var storage = player.storage.shqizhen;
			var num = 1 + ((storage || 0) % player.storage.shqizhen_subnum);
			return "将任意张点数和为" + num + "的倍数的牌置于牌堆两端，视为使用一张" + "【" + get.translation(player.storage.shqizhen_opqueue[num - 1]) + "】";
		},
		ai: {
			order: function () {
				var player = _status.event.player;
				var storage = player.storage.shqizhen;
				var name = player.storage.shqizhen_opqueue[(storage || 0) % player.storage.shqizhen_subnum];
				return get.order({ name: name }) + 0.2;
			},
			result: {
				player: 1,
			},
		},
		group: ["shqizhen_resort"],
	},
	shqizhen_resort: {
		trigger: {
			global: "roundStart",
		},
		forced: true,
		filter(event, player) {
			const curLen = player.actionHistory.length;
			if (curLen <= 2) return false;
			return true;
		},
		async content(event, trigger, player) {
			var list = [];
			game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shqizhen3.mp3");
			for (var i = 0; i < player.storage.shqizhen_opqueue.length; i++) {
				var name = player.storage.shqizhen_opqueue[i];
				if (name == "sha") {
					list.push(["基本", "", "sha"]);
				} else if (get.type2(name) == "trick") list.push(["锦囊", "", name]);
				else if (get.type(name) == "basic") list.push(["基本", "", name]);
			}
			const result = await player
				.chooseToMove("奇阵：是否重新调整转换项顺序？")
				.set("list", [
					[
						"",
						[list, "vcard"],
						function (list) {
							var sub = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩", "⑪", "⑫", "⑬", "⑭", "⑮", "⑯", "⑰", "⑱", "⑲", "⑳", "㉑", "㉒", "㉓", "㉔", "㉕", "㉖", "㉗", "㉘", "㉙", "㉚"];
							var list2 = list.map(function (i) {
								return "【" + get.translation(i[2]) + "】";
							});
							var prompt = "";
							var player = get.event().player;
							for (var i = 0; i < list2.length; i++) {
								var x = sub[i] + list2[i];
								if (i == (player.storage.shqizhen || 0) % player.storage.shqizhen_subnum) x = '<span class="bluetext">' + x + "</span>";
								prompt = prompt + x;
							}
							return prompt;
						},
					],
				])
				.set("processAI", function () {
					var player = _status.event.player;
					var listx = _status.event.listx;
					return [lib.skill.shqizhen_func.opsort(player, listx, (player.storage.shqizhen || 0) % player.storage.shqizhen_subnum)];
				})
				.set("listx", list.slice(0))
				.forResult();
			if (result.bool) {
				player.storage.shqizhen_opqueue = result.moved[0].map(function (i) {
					return i[2];
				});
			}
		},
	},
	shyingxi: {
		audio: "ext:水泊娘山/character/audio/skill:4",
		trigger: {
			global: ["phaseZhunbeiEnd", "phaseJudgeEnd", "phaseDrawEnd", "phaseUseEnd", "phaseDiscardEnd", "phaseJieshuEnd"],
		},
		usable: 1,
		filter(event, player) {
			return (
				player.hasHistory("gain", function (evt) {
					return evt.getParent(event.name) == event;
				}) ||
				player.getHistory("lose", evt => {
					return evt.cards2 && evt.getParent(event.name) == event;
				}).length
			);
		},
		async content(event, trigger, player) {
			await player.draw();
			const result = await player
				.chooseBool("是否失去1点体力？展示牌堆底五张牌，无距离限制的使用其中所有【杀】且分配剩余基本牌。")
				.set("ai", function () {
					if (player.hp < 2) return false;
					var num = Math.min(5, ui.cardPile.childNodes.length);
					var cards = [];
					for (var i = ui.cardPile.childNodes.length - 1; i >= ui.cardPile.childNodes.length - num; i--) {
						cards.push(ui.cardPile.childNodes[i]);
					}
					cards = cards.filter(card => get.type(card) == "basic");
					return (
						get.value(cards) > 12 ||
						cards.filter(card => {
							return card.name == "sha" && player.hasValueTarget(card);
						}).length > 1
					);
				})
				.forResult();
			if (!result?.bool) return;
			await player.loseHp();
			var cards = get.bottomCards(5, true);
			await player.showCards(cards, get.skillTranslation(event.name));
			const basic = cards.filter(card => get.type(card) == "basic");
			if (!basic || !basic.length) return;
			for (var card of basic.slice(0)) {
				if (card.name == "sha" && player.hasUseTarget(card, false, false)) {
					await player.chooseUseTarget(card, false, "nodistance").set("forced", true);
					basic.remove(card);
				}
			}
			if (_status.connectMode)
				game.broadcastAll(function () {
					_status.noclearcountdown = true;
				});
			event.given_map = {};
			if (!basic.length) return;
			do {
				const { bool, links } = await player
					.chooseCardButton("鹰袭：请选择要分配的牌", basic.length > 0, basic, [1, basic.length])
					.set("ai", () => {
						if (ui.selected.buttons.length == 0) return 1;
						return 0;
					})
					.forResult();
				if (!bool) return;
				basic.removeArray(links);
				event.togive = links.slice(0);
				const targets = (
					await player
						.chooseTarget("选择一名角色获得" + get.translation(links), true)
						.set("ai", function (target) {
							var att = get.attitude(get.event().player, target);
							if (_status.event.enemy) {
								return -att;
							} else if (att > 0) {
								return att / (1 + target.countCards("h"));
							} else {
								return att / 100;
							}
						})
						.set("enemy", get.value(event.togive[0], player, "raw") < 0)
						.forResult()
				).targets;
				if (targets.length) {
					const id = targets[0].playerid,
						map = event.given_map;
					if (!map[id]) map[id] = [];

					map[id].addArray(event.togive);
				}
			} while (basic.length > 0);
			if (_status.connectMode) {
				game.broadcastAll(function () {
					delete _status.noclearcountdown;
					game.stopCountChoose();
				});
			}
			const list = [];
			for (const i in event.given_map) {
				const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
				player.line(source, "green");
				if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) player.addExpose(0.2);
				list.push([source, event.given_map[i]]);
			}
			game.loseAsync({
				gain_list: list,
				giver: player,
				animate: "gain2",
			}).setContent("gaincardMultiple");
			game.delay();
		},
	},
	shyingshi: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "drawBegin",
		},
		forced: true,
		locked: false,
		filter(event, player) {
			return event.getParent(1).name != "shyingshi";
		},
		async content(event, trigger, player) {
			const num = trigger.num;
			if (!num) return;
			const list = [];
			const map = {};
			for (let i = 0; i <= num; i++) {
				const n = get.translation(i);
				map[n] = i;
				list.push(n);
			}
			const result = await player
				.chooseControl(list, function () {
					return "1";
				})
				.set("prompt", "鹰视：选择本次从牌堆底摸牌的数量")
				.forResult();
			const dn = map[result.control];
			if (dn == 0 || dn == num) {
				var cards = [];
				if (dn == 0) {
					trigger.bottom = false;
					cards = get.bottomCards(3);
				} else {
					trigger.bottom = true;
					cards = get.cards(3);
				}
				if (!cards || !cards.length) return;
				game.cardsGotoOrdering(cards);
				const result = await player
					.chooseToMove("鹰视：将卡牌以任意顺序置于" + (!dn ? "牌堆底" : "牌堆顶"))
					.set("list", [[!dn ? "牌堆底" : "牌堆顶", cards]])
					.set("processAI", function (list) {
						var cards = list[0][1].slice(0);
						cards.sort(function (a, b) {
							return get.value(b) - get.value(a);
						});
						return [cards];
					})
					.forResult();
				if (result.bool) {
					var cs = result.moved[0];
					while (cs.length && dn) {
						ui.cardPile.insertBefore(cs.pop(), ui.cardPile.firstChild);
					}
					for (let i = cs.length - 1; i >= 0 && !dn; i--) {
						ui.cardPile.appendChild(cs[i]);
					}
				}
			} else {
				trigger.cancel();
				await trigger.player.draw(dn, "bottom");
				await trigger.player.draw(num - dn);
			}
		},
		ai: {
			abnormalDraw: true,
			skillTagFilter(player, tag, arg) {
				if (tag === "abnormalDraw") return !arg || arg === "bottom";
			},
		},
	},
	shqinyu: {
		enable: "phaseUse",
		viewAs: {
			name: "toulianghuanzhu",
		},
		viewAsFilter: function (player) {
			if (!player.countCards("hs", card => get.name(card) == "sha" && get.color(card) == "black")) return false;
			return !player.hasSkill("shqinyu_ban");
		},
		filterCard: function (card, player, target) {
			return get.name(card) == "sha" && get.color(card) == "black";
		},
		position: "hs",
		check: function (card) {
			return 7 - get.value(card);
		},
		precontent() {
			player
				.when("useCardToTargeted")
				.filter(evt => evt.getParent().skill == "shqinyu")
				.then(() => {
					const target = trigger.target;
					if (target.sex == "male") {
						target.damage(player);
						player.addTempSkill("shqinyu_ban");
					}
				})
				.then(() => {
					if (trigger.target.sex == "female") {
						trigger.target
							.chooseBool("是否允许" + get.translation(player) + "使用的偷梁换柱可与你交换任意数量的手牌")
							.set("ai", function () {
								return get.attitude(_status.event.player, _status.event.source) > 2.5;
							})
							.set("source", player);
					} else event.finish();
				})
				.then(() => {
					if (result.bool) {
						trigger.target.chat("同意");
						player.addTempSkill("shqinyu_toulianghuanzhu");
						if (!trigger.card.storage.shqinyu) trigger.card.storage.shqinyu = [trigger.target];
						else trigger.card.storage.shqinyu.add(trigger.target);
					} else trigger.target.chat("不同意");
				});
		},
		prompt: "将一张黑色【杀】当【偷梁换柱】使用",
		subSkill: {
			ban: {},
			toulianghuanzhu: {
				trigger: {
					player: "toulianghuanzhuBegin",
				},
				forced: true,
				locked: false,
				popup: false,
				filter: function (event, player) {
					return event.card.storage && event.card.storage.shqinyu && event.card.storage.shqinyu.includes(event.target);
				},
				content: function () {
					trigger.setContent(lib.skill.shqinyu.toulianghuanzhuContent);
				},
				sub: true,
				sourceSkill: "shhenglue",
				_priority: 0,
			},
		},
		toulianghuanzhuContent: function () {
			"step 0";
			if (!target.countCards("h")) {
				event.finish();
				return;
			}
			var hs = player.getCards("h");
			if (hs.length) {
				var minval = get.value(hs[0]);
				var colors = [get.color(hs[0])];
				for (var i = 1; i < hs.length; i++) {
					var val = get.value(hs[i], player, "raw");
					if (val < minval) {
						minval = val;
						colors = [get.color(hs[i])];
					} else if (val == minval) {
						colors.add(get.color(hs[i]));
					}
				}
				player.chooseCardButton("偷梁换柱", [1, target.countCards("h")], target.getCards("h")).ai = function (button) {
					var val = get.value(button.link, player, "raw") - minval;
					if (val >= 0) {
						if (colors.includes(get.color(button.link))) {
							val += 3;
						}
					}
					return val;
				};
			} else {
				player.viewHandcards(target);
				event.finish();
			}
			("step 1");
			if (result.bool) {
				event.cards = result.links;
				player.chooseCard("h", [1, player.countCards("h")], true, "用任意张手牌替换" + get.translation(event.cards)).ai = function (card) {
					return -get.value(card);
				};
			} else {
				event.finish();
			}
			("step 2");
			if (result.bool) {
				player.gain(event.cards, target);
				target.gain(result.cards, player);
				player.$giveAuto(result.cards, target);
				target.$giveAuto(event.cards, player);
				game.log(player, "与", target, "交换了手牌");
				var color = get.color(result.cards[0], false);
				if (
					!event.cards.some(card => {
						return get.color(card, false) != color;
					}) &&
					!result.cards.some(card => {
						return get.color(card, false) != color;
					})
				) {
					player.draw();
				}
				target.addTempSkill("toulianghuanzhu_ai1");
			} else {
				target.addTempSkill("toulianghuanzhu_ai2");
			}
		},
	},
	shshibi: {
		trigger: {
			player: ["phaseJieshuBegin", "damageEnd"],
		},
		filter(event, player) {
			return game.hasPlayer(current => current != player && current.isMaxHp()) && player.countCards("he");
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseCardTarget({
					position: "he",
					selectTarget: 1,
					filterTarget: (card, player, target) => {
						return target != player && target.isMaxHp();
					},
					ai1: card => {
						return 6 - get.value(card);
					},
					ai2: target => {
						return get.attitude(_status.event.player, target);
					},
					prompt: get.prompt("shshibi"),
					prompt2: "交出一张牌，其可令你回复体力或获得杀",
				})
				.setHiddenSkill(event.name)
				.forResult();
		},
		async content(event, trigger, player) {
			const target = event.targets[0];
			await player.give(event.cards, target);
			const result = await target
				.chooseControl(["选项一", "选项二", "cancel2"])
				.set("choiceList", ["令" + get.translation(player) + "回复1点体力", "令" + get.translation(player) + "从弃牌堆获得一张【杀】"])
				.set("ai", function () {
					if (get.attitude(get.event().player, get.event().target) < 2) return "cancel2";
					if (get.event().target.getDamagedHp() < 2) return "选项二";
					return "选项一";
				})
				.set("target", player)
				.forResult();
			if (result.control == "选项一") await player.recover();
			else if (result.control == "选项二") {
				var card = get.discardPile(function (i) {
					return i.name == "sha";
				});
				if (card) await player.gain(card, "gain2");
			}
		},
	},
	shfengshou: {
		group: ["shfengshou1"],
		trigger: {
			global: "roundStart",
		},
		forced: true,
		async content(event, trigger, player) {
			player.insertPhase().set("phaseList", ["phaseUse", "phaseZhunbei", "phaseJudge", "phaseDraw", "phaseDiscard", "phaseJieshu"]);
			if (!trigger._finished) {
				trigger.finish();
				trigger.untrigger(true);
				trigger._triggered = 5;
				game.players
					.slice()
					.concat(game.dead)
					.forEach(current => {
						current.getHistory().isSkipped = true;
						current.getStat().isSkipped = true;
					});
				const evt = trigger.player.insertPhase();
				evt.relatedEvent = trigger.relatedEvent || trigger.getParent(2);
				if (trigger.skill) evt.skill = trigger.skill;
				else delete evt.skill;
				evt.shfengshous_phase = true;
				if (!lib.onround.includes(lib.skill.shfengshou.onRound)) {
					lib.onround.push(lib.skill.shfengshou.onRound);
				}
				game.broadcastAll(function (player) {
					player.classList.remove("glow_phase");
					delete _status.currentPhase;
				}, player);
			}
		},
		onRound(event) {
			return !event.shfengshous_phase;
		},
	},
	shfengshou1: {
		trigger: {
			player: "phaseUseEnd",
		},
		popup: false,
		filter(event, player) {
			return (
				player.getHistory("sourceDamage", function (evt) {
					return evt.isPhaseUsing(player) && evt.getParent("phaseUse") == event;
				}).length > 0
			);
		},
		forced: true,
		async content(event, trigger, player) {
			player.addTempSkill("shfengshou2");
		},
	},
	shfengshou2: {
		forced: true,
		trigger: {
			player: "phaseChange",
		},
		filter(event, player) {
			return !event.phaseList[event.num].startsWith("phaseUse");
		},
		async content(event, trigger, player) {
			trigger.phaseList[trigger.num] = "phaseUse|shfengshou2";
			await player.removeSkill("shfengshou2");
		},
	},
	shchimou: {
		/*trigger: { 
                        player: "useCard",
                    },	
                    filter(event, player) {
                        if(!event.cards || event.cards.length !=1 || get.type(event.cards[0], "trick", false) != "trick") return false;
                        return event.card.isCard && ['sha','juedou'].includes(get.name(event.card));
                    },
                    forced: true,
                    async content(event, trigger, player) {
                       if(get.name(trigger.card) == 'sha') trigger.baseDamage++;
                       trigger.card.storage.shchimou = true;
                    },*/
		mod: {
			cardname: function (card, player) {
				if (get.type(card, "trick", false) != "trick") return;
				if (get.color(card) == "red") {
					return "sha";
				} else {
					return "juedou";
				}
			},
			cardnature(card, player) {
				if (get.type(card, "trick", false) == "trick" && get.color(card) == "red") return "fire";
			},
			targetInRange: function (card, player, target) {
				if (!card.cards || card.cards.length != 1) return;
				if (["trick", "delay"].includes(lib.card[card.cards[0].name].type) && get.color(card) == "red") return true;
			},
			selectTarget: function (card, player, range) {
				if (!card.cards || card.cards.length != 1) return;
				if (card.name != "juedou") return;
				if (!["trick", "delay"].includes(lib.card[card.cards[0].name].type) || get.color(card) != "black") return;
				if (range[1] == -1) return;
				range[1] = Infinity;
			},
			/*ignoredHandcard: function (card, player) {
                            if (get.type(card, "trick", false) == "trick") {
                                return true;
                            }
                        },
                        cardDiscardable: function (card, player, name) {
                            if (name == "phaseDiscard" && get.type(card, "trick", false) == "trick") return false;
                        },*/
		},
		//group:['shchimou_miss'],
		subSkill: {
			miss: {
				trigger: {
					player: ["shaMiss", "eventNeutralized"],
				},
				forced: true,
				filter(event, player) {
					if (event.type != "card" && event.name != "_wuxie") return false;
					return event.card.storage && event.card.storage.shchimou;
				},
				async content(event, trigger, player) {
					await player.loseHp();
				},
				sub: true,
			},
		},
	},
	shlaiwuying: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		nobracket: true,
		trigger: {
			player: "useCardToPlayered",
			target: "useCardToTargeted",
		},
		filter(event, player) {
			if (event.targets.length != 1 || event.card.name != "sha" || !event.target.isIn()) return false;
			return event.target.countCards("he");
		},
		async cost(event, trigger, player) {
			event.result = await player
				.choosePlayerCard(trigger.target, "he", get.prompt2("shlaiwuying"))
				.set("filterButton", function (button) {
					var card = button.link,
						owner = get.owner(card);
					return !owner || owner.canRecast(card, _status.event.player);
				})
				.set("ai", function (card) {
					if (!get.event().player.countCards("hs", { name: "sha" }) && get.event().player.countCards("hs", { name: "shan" })) return 0;
					if (get.attitude(get.event().player, get.event().source) >= 0) return -get.buttonValue(card);
					return get.buttonValue(card);
				})
				.set("source", trigger.player)
				.forResult();
		},
		async content(event, trigger, player) {
			if (!trigger.target.isIn()) return;
			await player.draw();
			await trigger.target.recast(event.cards);
			trigger.card.name = "juedou";
		},
	},
	shquwuzong: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		nobracket: true,
		trigger: {
			global: "phaseJieshuBegin",
		},
		filter(event, player) {
			var suits = lib.skill.shmifeng.getSuit().filter(st => lib.suit.includes(st));
			return suits.length + 1 == lib.suit.length;
		},
		direct: true,
		async content(event, trigger, player) {
			const suits = lib.skill.shmifeng.getSuit().filter(st => lib.suit.includes(st));
			const suit = lib.suit.filter(st => !suits.includes(st))[0];
			const result = await player
				.chooseToUse({
					filterCard: function (card, player, event) {
						return lib.filter.filterCard.apply(this, arguments);
					},
					prompt: get.prompt("shquwuzong"),
					prompt2: "使用一张牌",
					ai1: function (card) {
						if (lib.suit.includes(get.suit(card, false)) && !suits.includes(get.suit(card, false))) return get.order(card) + 1;
						return get.order(card);
					},
				})
				.forResult();
			if (result.bool) {
				player.logSkill("shquwuzong");
				if (lib.skill.shmifeng.getSuit().length == 4 && player.isIn()) {
					const num = lib.skill.shmifeng.getSuit().filter(st => st != suit).length;
					const cards = get.centralDisCards();
					const result2 = await player
						.chooseButton(["获得" + (lib.suit.includes(suit) ? "除" + get.translation(suit) + "外" : "") + "每种花色的牌各一张", cards], num, true)
						.set("ai", function (button) {
							return get.value(button.link, _status.event.player);
						})
						.set("filterButton", function (button) {
							if (ui.selected.buttons.length) {
								for (var i of ui.selected.buttons) {
									if (get.suit(button.link, false) == get.suit(i, false)) return false;
								}
							}
							return get.suit(button.link, false) != suit;
						})
						.set("complexSelect", true)
						.forResult();
					if (result2.bool) {
						await player.gain(result2.links, "gain2");
					}
				}
			}
		},
	},
	shxuxun: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "dieAfter",
		},
		frequent: true,
		locked: false,
		async content(event, trigger, player) {
			let cards = await player.draw(2).forResult();
			player.addShownCards(cards, "visible_shxuxun");
			await player.changeHujia(1, null, true);
		},
		group: "shxuxun_loseHuJia",
		subSkill: {
			loseHuJia: {
				trigger: {
					player: "damageEnd",
				},
				forced: true,
				filter(event, player) {
					return event.hujia && player.isIn() && player.countCards("he");
				},
				async content(event, trigger, player) {
					await player.discard(player.getCards("he"));
				},
			},
		},
		mod: {
			ignoredHandcard: function (card, player) {
				if (get.is.shownCard(card) && card.hasGaintag("visible_shxuxun")) {
					return true;
				}
			},
			cardDiscardable: function (card, player, name) {
				if (name == "phaseDiscard" && get.is.shownCard(card) && card.hasGaintag("visible_shxuxun")) return false;
			},
		},
		ai: {
			threaten: 5.5,
		},
	},
	shxiaojue: {
		audio: "ext:水泊娘山/character/audio/skill:3",
		trigger: {
			global: "dyingAfter",
		},
		usable: 1,
		logTarget: "player",
		filter(event, player) {
			return event.player != player && event.player.isIn();
		},
		check(event, player) {
			if (get.damageEffect(event.player, player, player) > 0 && player.countCards("h", { color: "black" })) return true;
			return _status.currentPhase && _status.currentPhase.isIn() && get.damageEffect(_status.currentPhase, player, player) > 0 && player.countCards("h", { color: "red" });
		},
		async content(event, trigger, player) {
			if (!_status.currentPhase || !_status.currentPhase.isIn() || !player.isIn()) return;
			const targetx = trigger.player;
			var list = [player];
			if (player != _status.currentPhase) list.push(_status.currentPhase);
			await player
				.chooseToDebate(list)
				.set("callback", async event => {
					const { debateResult: result } = event;
					const { bool, opinion, targets, opinions } = result;
					if (bool) {
						if (opinion == "red") await _status.currentPhase.damage();
						else if (opinion == "black") await targetx.damage();
						else {
							if (!player.storage.shxiaojue2) {
								player.storage.shxiaojue2 = 1;
								player.addSkill("shxiaojue2");
							} else player.storage.shxiaojue2++;
						}
					}
				})
				.set("ai", card => {
					var color = get.damageEffect(targetx, player, player) > 0 ? "black" : "red";
					if (get.color(card) == color) return 3 + Math.random();
					return Math.random();
				})
				.set("aiCard", target => {
					var color = get.damageEffect(targetx, target, target) > 0 ? "black" : "red";
					var hs = target.getCards("h", { color: color });
					if (!hs.length) hs = target.getCards("h");
					return { bool: true, cards: [hs.randomGet()] };
				});
		},
	},
	shxiaojue2: {
		trigger: {
			source: "damageBegin2",
		},
		forced: true,
		silent: true,
		charlotte: true,
		content: function () {
			trigger.num += player.storage.shxiaojue2;
			player.removeSkill("shxiaojue2");
		},
		onremove: function (player, skill) {
			delete player.storage.shxiaojue2;
		},
		mark: true,
		intro: {
			content: (storage, player) => {
				return "下次伤害+" + storage;
			},
		},
	},
	shbitang: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		mode: ["identity"],
		unique: true,
		$createButton(item, type, position, noclick, node) {
			node = ui.create.identityCard(item, position, noclick);
			node.link = item;
			return node;
		},
		init: function (player) {
			player.storage.shbitang = [];
		},
		trigger: {
			global: "dieAfter",
		},
		forced: true,
		priority: -1,
		filter: function (event, player) {
			return event.player != player && !event.reserveOut;
		},
		async content(event, trigger, player) {
			var choice = trigger.player.identity == "mingzhong" ? "zhong" : trigger.player.identity;
			player.storage.shbitang.push(choice);
			var color = "";
			if (choice == "zhong") color = "#y";
			else if (choice == "fan") color = "#g";
			else if (choice == "nei") color = "#b";
			game.log(player, "获得了", trigger.player, "的", `${color}${get.translation(trigger.player.identity + "2")}`, "身份牌");
			player.markSkill("shbitang");
		},
		intro: {
			markcount: storage => storage.length,
			mark: function (dialog, storage, player) {
				if (storage && storage.length) {
					if (player.isUnderControl(true)) {
						dialog.addSmall([storage, (item, type, position, noclick, node) => lib.skill.shbitang.$createButton(item, type, position, noclick, node)]);
					} else {
						dialog.addText("共有" + get.cnNumber(storage.length) + "张身份牌");
					}
				} else {
					return "没有身份牌";
				}
			},
		},
		removeIDC: async function (player, choice) {
			var color = "";
			if (choice == "zhong") color = "#y";
			else if (choice == "fan") color = "#g";
			else if (choice == "nei") color = "#b";
			player.storage.shbitang.remove(choice);
			game.log(player, "移去了", `${color}${get.translation(choice + "2")}`, "的身份牌");
			player.markSkill("shbitang");
		},
		group: ["shbitang_zhiheng", "shbitang_zaowang", "shbitang_luanwu"],
	},
	shbitang_zhiheng: {
		audio: 1,
		audioname2: {},
		inherit: "zhiheng",
		filter(event, player) {
			return player.storage.shbitang && player.storage.shbitang.includes("fan");
		},
		prompt: "移去一张“反贼”身份牌，然后弃置任意张牌并摸等量的牌。",
		async content(event, trigger, player) {
			lib.skill.shbitang.removeIDC(player, "fan");
			player.draw(event.cards.length);
		},
		ai: {
			order: 1,
			result: {
				player: 1,
			},
			threaten: 1.5,
		},
	},
	shbitang_zaowang: {
		inherit: "olzaowang",
		filter(event, player) {
			return player.storage?.shbitang?.includes("zhong") || player.storage?.shbitang?.includes("mingzhong");
		},
		prompt: "出牌阶段，你可以移去一张“忠臣”身份牌，令一名角色加1点体力上限，回复1点体力并摸三张牌，且获得如下效果：主公死亡时，若其身份为忠臣，则其和主公交换身份牌；其死亡时，若其身份为反贼且伤害来源的身份为主公或忠臣，则以主忠胜利结束本局游戏。",
		content() {
			lib.skill.shbitang.removeIDC(player, "zhong");
			target.gainMaxHp();
			target.recover();
			target.draw(3);
			target.addSkills("olzaowang2");
		},
		ai: {
			order: 10,
			result: {
				target(player, target) {
					if (player == target) return 10;
					return 0;
				},
			},
		},
	},
	shbitang_luanwu: {
		inherit: "luanwu",
		filter(event, player) {
			if (!game.hasPlayer(current => player != current)) return false;
			return player.storage.shbitang?.includes("nei");
		},
		limited: true,
		skillAnimation: "epic",
		animationColor: "thunder",
		filterTarget: function (card, player, target) {
			return player != target;
		},
		selectTarget: -1,
		multiline: true,
		async contentBefore(event, trigger, player) {
			lib.skill.shbitang.removeIDC(player, "nei");
			player.awakenSkill(event.skill);
		},
		prompt: "出牌阶段，你可以移去一张“内奸”身份牌，你可令除你外的所有角色依次对与其距离最近的另一名角色使用一张【杀】，否则失去1点体力。",
		async content(event, trigger, player) {
			const currented = [player];
			const { target } = event;
			const result = await target
				.chooseToUse(
					"乱武：使用一张【杀】或失去1点体力",
					function (card) {
						if (get.name(card) != "sha") {
							return false;
						}
						return lib.filter.filterCard.apply(this, arguments);
					},
					function (card, player, target) {
						if (player == target) {
							return false;
						}
						var dist = get.distance(player, target);
						if (dist > 1) {
							if (
								game.hasPlayer(function (current) {
									return current != player && get.distance(player, current) < dist;
								})
							) {
								return false;
							}
						}
						return lib.filter.filterTarget.apply(this, arguments);
					}
				)
				.set("ai2", function () {
					return get.effect_use.apply(this, arguments) - get.event().effect;
				})
				.set("effect", get.effect(target, { name: "losehp" }, target, target))
				.set("addCount", false)
				.forResult();
			if (!result?.bool) {
				await target.loseHp();
			}
		},
	},
	shwujin: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		comboSkill: true,
		init(player, skill) {
			player.storage.shwujin = [];
		},
		getUsed(player, launching) {
			let historys;
			if (!launching) {
				historys = player.getAllHistory("useCard").slice(-2);
			} else {
				historys = player.getAllHistory("useCard").slice(0, -1).slice(-2);
			}
			if (historys.length < 2) {
				return [];
			}
			return historys;
		},
		checkUsed(player, historys) {
			if (historys.length < 2) return false;
			return get.subtype(historys[0].card) == "equip1" && get.tag(historys[1].card, "damage") > 0.5;
		},
		onremove(player, skill) {
			player.removeTip(skill);
		},
		trigger: {
			player: "useCardAfter",
		},
		direct: true,
		filter(event, player) {
			if (!player.storage.shwujin_comboList || player.storage.shwujin_comboList.length != 3) return false;
			return event == player.storage.shwujin_comboList[2];
		},
		async content(event, trigger, player) {
			const Historys = player.storage.shwujin_comboList.slice(0);
			delete player.storage.shwujin_comboList;
			if (get.tag(trigger.card, "damage") <= 0.5) {
				return;
			}
			const Trg = trigger,
				num1 = player.getAllHistory("sourceDamage", function (evt) {
					var card = evt.card;
					if (!card || get.tag(card, "damage") <= 0.5) return false;
					var evtx = evt.getParent("useCard");
					return evtx.card == card && evtx == Historys[1];
				}).length,
				num2 = player.getAllHistory("sourceDamage", function (evt) {
					var card = evt.card;
					if (!card || get.tag(card, "damage") <= 0.5) return false;
					var evtx = evt.getParent("useCard");
					return evtx.card == card && evtx == Trg;
				}).length;
			if (num1 && num2) {
				await player.addSkills(get.name(Historys[0].card) + "_skill");
			}
		},
		group: "shwujin_mark",
		subSkill: {
			mark: {
				charlotte: true,
				trigger: {
					player: "useCard",
				},
				forced: true,
				direct: true,
				firstDo: true,
				async content(event, trigger, player) {
					if (lib.skill.shwujin.checkUsed(player, lib.skill.shwujin.getUsed(player, false))) {
						player.storage.shwujin_comboList = lib.skill.shwujin.getUsed(player, false);
						player.addTip("shwujin", "武进 可连击");
					} else if (player.storage.shwujin_comboList && player.storage.shwujin_comboList.length == 2) {
						if (lib.skill.shwujin.checkUsed(player, player.storage.shwujin_comboList) && get.tag(trigger.card, "damage") > 0.5) {
							player.logSkill("shwujin");
							await player.draw(3);
						}
						player.storage.shwujin_comboList.push(trigger);
						player.removeTip("shwujin");
					} else {
						player.removeTip("shwujin");
					}
				},
				sub: true,
			},
		},
	},
	shrenxia: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "damageEnd",
		},
		usable: 1,
		filter(event, player) {
			return (player.inRange(event.player) || player == event.player) && player.countCards("h") != player.getAttackRange();
		},
		async content(event, trigger, player) {
			//const target = trigger.source;
			let numx = player.getAttackRange();
			let num = player.countCards("h");
			if (num > numx) {
				const cards = (await player.chooseToDiscard("h", true, num - numx).forResult()).cards;
				if (cards.length >= 1) {
					player.when({ global: "phaseEnd" }).step(async (event, trigger, player) => {
						var ds = Array.from(ui.discardPile.childNodes).filter(i => {
							var bool = get.tag(i, "damage") > 0.5 && player.hasUseTarget(i, false, false);
							return get.subtype(i) == "equip1" || bool;
						});
						if (!ds || !ds.length) return;
						const result = await player
							.chooseButton(["任侠： 请使用其中一张牌", ds], true)
							.set("ai", function (button) {
								return get.event().player.getUseValue(button.link);
							})
							.forResult();
						if (result.bool) {
							player.chooseUseTarget(false, "nodistance", result.links[0]);
						}
					});
				}
			} else await player.drawTo(numx);
		},
	},
	shchijun: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "useCardToPlayered",
			target: "useCardToTargeted",
		},
		filter(event, player) {
			var players1 = get.clockWisePath(event.player, event.target);
			var players2 = get.antiClockWisePath(event.player, event.target);
			if (event.targets.length != 1 || event.card.name != "sha" || !event.target.isIn() || !event.player.isIn()) return false;
			return players1.length || players2.length;
		},
		async content(event, trigger, player) {
			var Targets = [];
			var targetxs = [];
			const another = player == trigger.player ? trigger.target : trigger.player;
			const players1 = get.clockWisePath(trigger.player, trigger.target);
			const players2 = get.antiClockWisePath(trigger.player, trigger.target);
			if (players1.length && players2.length) {
				const list = ["路径一", "路径二"];
				let choiceList = [get.pathTranslation(players1), get.pathTranslation(players2)];
				const { control } = await player
					.chooseControl(list)
					.set("choiceList", choiceList)
					.set("prompt", "选择一个路径，令该路径上所有角色交给你或" + get.translation(another) + "一张牌")
					.set("ai", function () {
						var player = _status.event.player;
						var p1 = players1.filter(current => {
							return get.attitude(player, current) > 0;
						}).length;
						var p2 = players2.filter(current => {
							return get.attitude(player, current) > 0;
						}).length;
						if (2 * (p1 - p2) > players1.length - players2.length) return list[0];
						return list[1];
					})
					.forResult();
				if (control) {
					if (control == "路径一") Targets.addArray(players1);
					else if (control == "路径二") Targets.addArray(players2);
				}
			} else if (players1.length || players2.length) {
				Targets.addArray(players1.length ? players1 : players2);
			} else return;
			if (!Targets || !Targets.length) return;
			for (const current of Targets) {
				if (!current.countCards("he")) {
					targetxs.add(current);
					continue;
				}
				const { bool, cards, targets } = await current
					.chooseCardTarget({
						prompt: "将一张牌交给" + get.translation(trigger.player) + "或" + get.translation(trigger.target),
						filterCard: true,
						filterTarget(card, player, target) {
							var evt = _status.event.getTrigger();
							return target == evt.player || target == evt.target;
						},
						position: "he",
						ai1(card) {
							if (get.name(card, false) == "shan" || get.name(card, false) == "jiu") return 100;
							return 100 - get.value(card);
						},
						ai2(target) {
							var player = _status.event.player,
								card = ui.selected.cards[0];
							if (get.value(card, target) < 0) return -get.attitude(player, target);
							return Math.max(1, get.value(card, target) - get.value(card, player)) * get.attitude(player, target);
						},
					})
					.set("forced", true)
					.forResult();
				if (bool) {
					if (targets[0] != player) targetxs.add(current);
					if (cards) await current.give(cards, targets[0]);
				}
			}
			if (!targetxs || !targetxs.length) return;
			trigger.card.storage.shchijun = targetxs;
			player.addTempSkill("shchijun_damage");
		},
		subSkill: {
			damage: {
				trigger: {
					global: "damageSource",
				},
				forced: true,
				popup: false,
				filter(evt) {
					if (!evt.card || !evt.card.storage || !evt.card.storage.shchijun) return false;
					return evt.card.storage.shchijun.length && evt.card.name == "sha";
				},
				async content(event, trigger, player) {
					for (var current of trigger.card.storage.shchijun) {
						await current.chooseToDiscard(2, "he", true);
					}
				},
				sub: true,
			},
		},
	},
	shbengluan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		locked: true,
		trigger: {
			player: "damageBegin3",
			source: "damageBegin1",
		},
		forced: true,
		filter(event, player) {
			if (event.getParent().name != "sha") return false;
			return player.isMaxHandcard() || player.isMaxHp();
		},
		content() {
			trigger.num++;
		},
		init(player, skill) {
			player.addExtraEquip(skill, "guanshi", true, player => lib.card.guanshi);
		},
		onremove(player, skill) {
			player.removeExtraEquip(skill);
		},
		group: "shbengluan_guanshi",
		subSkill: {
			guanshi: {
				nobracket: true,
				equipSkill: true,
				trigger: {
					player: ["shaMiss", "eventNeutralized"],
				},
				filter(event, player) {
					if (player.hasSkillTag("unequip_equip1")) return false;
					if (event.type != "card" || event.card.name != "sha" || !event.target.isIn()) return false;
					return player.countCards("he") >= 2;
				},
				direct: true,
				locked: false,
				content() {
					"step 0";
					player
						.chooseToDiscard(get.prompt2("guanshi_skill"), "弃置两张牌，令" + get.translation(trigger.card) + "强制命中", 2, "he")
						.set("ai", function (card) {
							var evt = _status.event.getTrigger();
							if (get.attitude(evt.player, evt.target) < 0) {
								if (player.needsToDiscard()) return 15 - get.value(card);
								if (evt.baseDamage + evt.extraDamage >= Math.min(2, evt.target.hp)) return 8 - get.value(card);
								return 5 - get.value(card);
							}
							return -1;
						})
						.set("complexCard", true).logSkill = "guanshi_skill";
					("step 1");
					if (result.bool) {
						if (event.triggername == "shaMiss") {
							trigger.untrigger();
							trigger.trigger("shaHit");
							trigger._result.bool = false;
							trigger._result.result = null;
						} else trigger.unneutralize();
					}
				},
				mod: {
					attackRangeBase(player) {
						var num = lib.card?.guanshi?.distance?.attackFrom;
						if (typeof num != "number") return;
						return Math.max(player.getEquipRange(player.getCards("e")), 1 - num);
					},
				},
				ai: {
					directHit_ai: true,
					skillTagFilter(player, tag, arg) {
						if (player.hasSkillTag("unequip_equip1")) return;
						var bool =
							get.attitude(player, arg.target) < 0 &&
							arg.card &&
							arg.card.name == "sha" &&
							player.countCards("he", card => {
								return card != arg.card && (!arg.card.cards || !arg.card.cards.includes(card)) && get.value(card) < 5;
							}) > 1;
						return bool;
					},
				},
				sub: true,
			},
		},
	},
	shyaoyan: {
		audio: "ext:水泊娘山/character/audio/skill:3",
		enable: "phaseUse",
		usable: 1,
		viewAs: {
			name: "huogong",
			isCard: true,
		},
		filterCard: () => false,
		selectCard: -1,
		prompt: "视为对至多三名其他角色使用一张【火攻】",
		filterTarget(card, player, target) {
			return target != player;
		},
		selectTarget: [1, 3],
		async precontent(event, trigger, player) {
			const targets = event.result.targets.slice(0).add(player).sortBySeat();
			var list = [];
			for (var i = 0; i < targets.length; i++) {
				list.push([targets[i], [game.createCard("du", "heart", Math.floor(Math.random() * 13) + 1)]]);
			}
			await game
				.loseAsync({
					gain_list: list,
					giver: player,
					animate: "gain2",
				})
				.setContent("gaincardMultiple");
		},
		ai: {
			order: 10,
			result: {
				target: -1,
			},
		},
	},

	shduwo: {
		audio: "ext:水泊娘山/character/audio/skill:3",
	},

	shdingli: {
		audio: "ext:水泊娘山/character/audio/skill:4",
		trigger: {
			player: "useCardAfter",
		},
		forced: true,
		filter(event, player) {
			const x = player.getRoundHistory("useCard").length;
			return ["shan", "tao"].includes(event.card.name) && Math.max(x, player.countCards("h")) < player.hp;
		},
		async content(event, trigger, player) {
			await player.drawTo(player.hp);
		},
		mod: {
			cardUsable(card, player, num) {
				const x = player.getRoundHistory("useCard").length;
				if (["sha", "jiu"].includes(card.name) && x < player.hp) {
					return Infinity;
				}
			},
		},
		group: ["shdingli_audio"],
		subSkill: {
			audio: {
				trigger: {
					player: "useCard1",
				},
				forced: true,
				filter(event, player) {
					return !event.audioed && ["sha", "jiu"].includes(event.card.name) && player.countUsed(event.card.name, true) > 1 && event.getParent().type == "phase";
				},
				async content(event, trigger, player) {
					trigger.audioed = true;
				},
				sub: true,
			},
		},
	},
	shzoumo: {
		enable: "phaseUse",
		skillAnimation: true,
		animationColor: "thunder",
		filter: function (event, player) {
			return !player.hasSkill("shzoumo_blocker");
		},
		chooseButton: {
			dialog(event, player) {
				return ui.create.dialog(get.prompt2("shzoumo"));
			},
			chooseControl(event, player) {
				return [1, 2, 3, 4, 5, 6, "cancel2"];
			},
			check() {
				return 2;
			},
			backup(result, player) {
				return {
					num: result.control,
					log: false,
					delay: false,
					async content(event, trigger, player) {
						const num = lib.skill.shzoumo_backup.num;
						const cards = get.bottomCards(num);
						game.cardsGotoOrdering(cards);
						const rs = cards.filter(card => {
							return get.color(card, false) == "red";
						});
						const bs = cards.filter(card => {
							return get.color(card, false) == "black";
						});
						player.logSkill("shzoumo", null, null, null);
						await player.showCards(cards, get.translation(player) + "发动了走魔");
						if (rs.length == num) {
							await player.gain(cards, "gain2");
						}
						if (!bs.length) return;
						await player.addTempSkill("shzoumo_blocker");
						var targets = [];
						if (bs.length > 1) {
							var n = Math.min(bs.length - 1, game.countPlayer() - 1);
							targets = (
								await player
									.chooseTarget(n, "选择" + get.cnNumber(n) + "名其他角色与你各受到1点雷电伤害", function (card, player, target) {
										return target != player;
									})
									.set("ai", function (target) {
										var player = _status.event.player;
										return get.damageEffect(target, player, player, "thunder");
									})
									.forResult()
							).targets;
						}
						targets.add(player).sortBySeat();
						for (const target of targets) {
							await target.damage("thunder", "nocard");
						}
					},
				};
			},
		},
		ai: {
			order: 10,
			result: {
				player: 1,
			},
		},
		subSkill: {
			blocker: {
				charlotte: true,
				sub: true,
			},
		},
	},
	shjianlai: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "phaseBefore",
			player: "enterGame",
		},
		forced: true,
		filter(event, player) {
			return event.name != "phase" || game.phaseNumber == 0;
		},
		async content(event, trigger, player) {
			var card = game.createCard("shxuantianhunyuanjian", "spade", 7);
			await player.gain(card, "visible");
			await player.$gain2(card);
		},
		group: ["shjianlai_gain", "shjianlai_move"],
		subSkill: {
			gain: {
				trigger: {
					global: ["loseEnd", "equipEnd", "addJudgeEnd", "gainEnd", "loseAsyncEnd", "addToExpansionEnd"],
				},
				forced: true,
				filter(event, player) {
					return event.getd()?.some(i => i.name == "shxuantianhunyuanjian");
				},
				async content(event, trigger, player) {
					await player.gain(
						trigger.getd().filter(i => i.name == "shxuantianhunyuanjian"),
						"gain2"
					);
				},
				sub: true,
			},
			move: {
				trigger: {
					player: "useCardAfter",
				},
				filter: function (event, player) {
					if (event.card.name != "sha" && get.type(event.card, "trick") != "trick") return false;
					var tgs = game.filterPlayer(i => {
						return i.countCards("e", c => get.name(c) == "shxuantianhunyuanjian");
					});
					if (!tgs || !tgs.length) return false;
					for (var j of tgs) {
						if (
							player.canMoveCard(
								null,
								true,
								j,
								game.filterPlayer(i => i != j),
								"canReplace"
							)
						)
							return true;
					}
					return false;
				},
				check: function (event, player) {
					for (var target of game.filterPlayer()) {
						const es = target.getEquips(1).filter(e => {
							return get.name(e) == "shxuantianhunyuanjian";
						});
						if (!es.length) continue;
						if (get.attitude(player, target) < 2) return true;
						if (
							target == player &&
							game.filterPlayer(current => {
								if (current == player) return false;
								return get.attitude(player, current) >= 2 && current.canEquip(es[0], true);
							}).length
						)
							return true;
					}
					return false;
				},
				async content(event, trigger, player) {
					player
						.moveCard(
							true,
							game.filterPlayer(i => {
								return i.countCards("e", card => get.name(card) == "shxuantianhunyuanjian");
							}),
							game.filterPlayer(),
							card => {
								return get.name(card) == "shxuantianhunyuanjian";
							},
							"canReplace"
						)
						.set("prompt", "移动场上的【玄天混元剑】")
						.set("nojudge", true);
				},
				sub: true,
			},
		},
	},
	shyingong: {
		audio: "ext:水泊娘山/character/audio/skill:3",
		init: function (player) {
			player.storage.shyingong = [];
			player.storage.shyingong_buff = [];
		},
		enable: "phaseUse",
		filter: (event, player) => {
			var hes = player.getCards("he", card => {
					var suits = player.getStorage("shyingong"),
						suit = get.suit(card, player);
					if (get.type(card) == "basic" && get.name(card) != "sha") return false;
					return !suits.includes(suit) && lib.suit.includes(suit) && player.canRecast(card);
				}),
				suits = player.getStorage("shyingong");
			if (!hes.length) {
				return false;
			}
			for (var i = 0; i < hes.length; i++) {
				var suit = get.suit(hes[i]);
				if (!lib.suit.includes(suit)) continue;
				if (!suits.includes(suit, player)) {
					return true;
				}
			}
			return false;
		},
		filterCard: (card, player) => {
			var suits = player.getStorage("shyingong"),
				suit = get.suit(card, player);
			if (get.type(card) == "basic" && get.name(card) != "sha") return false;
			return !suits.includes(suit) && lib.suit.includes(suit) && player.canRecast(card);
		},
		selectCard: 1,
		position: "he",
		check: card => {
			if (get.name(card) == "sha") return 5.5 + _status.event.player.countCards("h", { name: "sha" }) - get.value(card);
			return 4.5 + Math.min(6.5, 2.5 * _status.event.player.countCards("h", { name: "sha" })) - get.value(card);
		},
		discard: false,
		lose: false,
		delay: false,
		async content(event, trigger, player) {
			const cur_InRangers = game.filterPlayer(current => player.inRange(current));
			if (lib.suit.includes(get.suit(event.cards[0], player))) {
				player.storage.shyingong.add(get.suit(event.cards[0], player));
			} else return;
			await player.recast(event.cards);
			await player.addTempSkill("shyingong_buff", "phaseChange");
			const InRangers = game.filterPlayer(current => player.inRange(current));
			for (var current of InRangers) {
				if (!cur_InRangers.includes(current)) player.storage.shyingong_buff.add(current);
			}
		},
		ai: {
			order: 10,
			result: {
				player: 1,
			},
		},
		subSkill: {
			buff: {
				intro: {
					content: "$不能响应你使用的牌",
				},
				mark: true,
				onremove: function (player, skill) {
					player.storage.shyingong = [];
					player.storage.shyingong_buff = [];
				},
				trigger: {
					player: "useCard",
				},
				forced: true,
				filter(event, player) {
					return game.hasPlayer(function (current) {
						return player.storage.shyingong_buff.includes(current);
					});
				},
				async content(event, trigger, player) {
					trigger.directHit.addArray(
						game.filterPlayer(function (current) {
							return player.storage.shyingong_buff.includes(current);
						})
					);
				},
				ai: {
					directHit_ai: true,
					skillTagFilter(player, tag, arg) {
						return player.storage.shyingong_buff.includes(arg.target);
					},
				},
				mod: {
					attackRange: function (player, num) {
						return num + player.storage.shyingong.length;
					},
					cardUsable(card, player, num) {
						if (card.name == "sha") {
							return num + player.storage.shyingong.length;
						}
					},
				},
				sub: true,
			},
		},
	},
	shshenbi: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "useCardToPlayered",
		},
		forced: true,
		filter(event, player) {
			if (
				game.hasPlayer(cur => {
					return cur !== player && !player.inRange(cur);
				})
			)
				return false;
			return event.isFirstTarget && event.targets.length == 1 && event.card.name == "sha";
		},
		async content(event, trigger, player) {
			trigger.getParent().baseDamage += 1;
		},
	},
	shzhaxi: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			target: "useCardToTargeted",
		},
		filter(event, player) {
			if (player.hasSkill("shzhaxi_blocker")) return false;
			return event.card.name == "sha";
		},
		async cost(event, trigger, player) {
			let choiceList = ["令你使用的下张【杀】伤害+1，直到其他角色对你使用【杀】", "令下张以你为目标的【杀】无效且你获得之，直到你使用【杀】"];
			const list = ["选项一", "选项二", "cancel2"];
			const result = await player
				.chooseControl(list)
				.set("prompt", get.prompt("shzhaxi"))
				.set("choiceList", choiceList)
				.set("ai", () => {
					var randomNum = Math.random();
					if (_status.event.player.hp <= 2 || randomNum > 0.5) return list[1];
					return list[0];
				})
				.forResult();
			event.result = {
				bool: result.control != "cancel2",
				cost_data: result.control,
			};
		},
		async content(event, trigger, player) {
			if (event.cost_data == "选项一") {
				player.addSkill("shzhaxi_1");
			} else if (event.cost_data == "选项二") {
				player.addSkill("shzhaxi_2");
			}
			player.markSkill("shzhaxi");
			player.addTempSkill("shzhaxi_blocker", "roundStart");
		},
		intro: {
			content: function (content, player) {
				if (player == game.me || player.isUnderControl()) {
					return player.hasSkill("shzhaxi_1") ? "加伤" : "防杀";
				}
				return "不给你看！😊";
			},
		},
		subSkill: {
			1: {
				onremove(player) {
					player.unmarkSkill("shzhaxi");
				},
				trigger: {
					player: "useCard",
					target: "useCardToTarget",
				},
				forced: true,
				filter(event, player) {
					return event.card.name == "sha";
				},
				async content(event, trigger, player) {
					if (trigger.player == player) trigger.baseDamage += 1;
					player.removeSkill("shzhaxi_1");
				},
				sub: true,
			},
			2: {
				onremove(player) {
					player.unmarkSkill("shzhaxi");
				},
				trigger: {
					player: "useCard",
					target: "useCardToTarget",
				},
				forced: true,
				filter(event, player) {
					return event.card.name == "sha";
				},
				async content(event, trigger, player) {
					if (trigger.player != player) {
						var evt = trigger.getParent();
						evt.targets.length = 0;
						evt.all_excluded = true;
						game.log(evt.card, "被无效了");
						await player.gain(trigger.cards, "gain2");
					}
					player.removeSkill("shzhaxi_2");
				},

				sub: true,
			},
			blocker: {},
		},
	},
	shpifeng: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filterTarget: function (card, player, target) {
			if (!ui.selected.targets.length) return target.countCards("h");
			for (var i of ui.selected.targets) {
				if (i.getNext() == target || i.getPrevious() == target) return target.countCards("h");
			}
			return false;
		},
		selectTarget: [1, 3],
		multitarget: true,
		async content(event, trigger, player) {
			var sha = [];
			for (const current of event.targets.sortBySeat()) {
				const result = await player
					.discardPlayerCard(current, "h", true)
					.set("ai", function (button) {
						var card = button.link;
						if (get.name(card) == "sha") return 100;
						if (get.name(card) == "shan") return 70;
						if (get.event().target == get.event().player) return 50 - get.value(card);
						return get.value(card) + 50;
					})
					.set("target", current)
					.forResult();
				if (result?.bool && result.links?.length) {
					if (get.name(result.links[0], false) == "sha") sha.add(result.links[0]);
					else if (get.name(result.links[0], false) == "shan") player.addTempSkill("shpifeng_buff");
				}
			}
			await player.draw(event.targets.length);
			if (!sha.length) return;
			for (const s of sha) {
				if (player.hasUseTarget(s, true, false)) {
					await player.chooseUseTarget(s, false);
				}
			}
		},
		ai: {
			order(item, player) {
				player ??= get.player();
				return get.order({ name: "sha" }, player) + 0.2;
			},
			result: {
				player: 1,
				target: function (player, target) {
					//game.log(target,-get.attitude(player, target));
					if (target == player) return 1;
					if (get.attitude(player, target) > 1) return -1;
					return 0.7;
				},
			},
		},
		subSkill: {
			buff: {
				trigger: {
					player: "useCard",
				},
				filter(event, player) {
					return event.card.name == "sha";
				},
				forced: true,
				content() {
					trigger.directHit.addArray(game.players);
					game.log(trigger.card, "不可被响应");
				},
				ai: {
					directHit_ai: true,
				},
				sub: true,
			},
		},
	},
	shjianhen: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "damageEnd",
			source: "damageEnd",
		},
		forced: true,
		filter(event, player) {
			if (!event.card || !event.cards?.length || !event.cards.filter(card => get.name(card, false) == "sha").length) return false;
			if (player == event.player) {
				return true;
			}
			return event.card.isCard && event.card.name == "sha";
		},
		async content(event, trigger, player) {
			var cards = [];
			if (trigger.player == player) cards = trigger.cards.filter(card => get.name(card, false) == "sha");
			else cards.push(trigger.cards[0]);
			if (!cards.length) return;
			player.addToExpansion(cards, "gain2").gaintag.add("shjianhen");
		},
		intro: {
			content: "expansion",
			markcount: "expansion",
		},
	},
	shfeihu: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		filter(event, player) {
			return player.getExpansions("shjianhen").length > 0 && event.filterCard({ name: "juedou" }, player, event);
		},
		chooseButton: {
			dialog(event, player) {
				return ui.create.dialog("飞虎", player.getExpansions("shjianhen"), "hidden");
			},
			filter(button, player) {
				const card = button.link;
				if (!game.checkMod(card, player, "unchanged", "cardEnabled2", player)) {
					return false;
				}
				const evt = _status.event.getParent();
				return evt.filterCard(get.autoViewAs({ name: "juedou" }, [card]), player, evt);
			},
			backup(links, player) {
				const skill = _status.event.buttoned;
				return {
					selectCard: -1,
					position: "x",
					filterCard: card => card == lib.skill.shfeihu_backup.card,
					viewAs: { name: "juedou" },
					card: links[0],
				};
			},
			prompt(links, player) {
				return "选择 决斗（" + get.translation(links[0]) + "）的目标";
			},
		},
		ai: {
			order(item, player) {
				player ??= get.player();
				if (player.hp > 3) return 10;
				return get.order({ name: "juedou" }, player) + 0.1 * player.hp;
			},
			result: {
				player: 1,
			},
			combo: "shjianhen",
		},
	},
	shhutun: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: ["useCardAfter", "respondAfter"],
		},
		filter: function (event, player) {
			var suits = player.getStorage("shhutun_used");
			if (!event.cards || !event.cards.length) return false;
			return event.card.name == "sha" && lib.suit.includes(get.suit(event.card)) && !suits.includes(get.suit(event.card));
		},
		async content(event, trigger, player) {
			await player.gain(trigger.cards, "gain2");
			player.markAuto("shhutun_used", [get.suit(trigger.card)]);
			player.addTempSkill("shhutun_used", "roundStart");
		},
		subSkill: {
			used: {
				charlotte: true,
				onremove: true,
				sub: true,
			},
		},
	},
	shguandi: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		locked: false,
		mod: {
			cardUsable(card, player, num) {
				if (
					card.name == "sha" &&
					player.getEquips(1).length &&
					player.getEquips(1).filter(e => {
						return get.suit(e) == get.suit(card);
					}).length
				) {
					return Infinity;
				}
			},
		},
		trigger: {
			source: "damageBegin1",
		},
		filter(event, player) {
			return (
				event.card?.name == "sha" &&
				player.getEquips(1).length &&
				player.getEquips(1).filter(e => {
					return get.suit(e) == get.suit(event.card);
				}).length
			);
		},
		async content(event, trigger, player) {
			const cards = player.getEquips(1).filter(e => {
				return get.suit(e) == get.suit(trigger.card);
			});
			if (!cards.length) return;
			await player.discard(cards);
			trigger.num++;
		},
	},
	shnongwu: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "chooseToUse",
		filter(event, player) {
			return player.countCards("h") == 1;
		},
		filterCard: true,
		position: "h",
		viewAs: {
			name: "juedou",
			storage: {
				shnongwu: true,
			},
		},
		precontent() {
			player.addTempSkill("shnongwu_effect");
			player
				.when({ global: "damageBegin3" })
				.filter(evt => evt.card && evt.card.storage && evt.card.storage.shnongwu)
				.then(() => {
					trigger.num--;
				});
		},
		prompt: "将最后一张手牌当伤害-1的【决斗】使用",
		subSkill: {
			effect: {
				trigger: {
					player: "useCardToPlayered",
				},
				//forced: true,
				filter(event, player) {
					const card = event.card;
					if (!card || !card.storage || !card.storage.shnongwu) return false;
					return (
						event.isFirstTarget &&
						game.filterPlayer(function (current) {
							return player.inRange(current);
						}).length
					);
				},
				async cost(event, trigger, player) {
					event.result = await player
						.chooseTarget(
							(card, player, target) => {
								return player.inRange(target);
							},
							[1, 3]
						)
						.set("ai", target => {
							const player = get.event().player;
							return 7 - get.attitude(player, target);
						})
						.set("forced", true)
						.forResult();
				},
				async content(event, trigger, player) {
					const targets = event.targets;
					var count = 0;
					if (!targets.length) return;
					for (const current of targets) {
						const result = await current
							.chooseCard("he", 2, "交给" + get.translation(player) + "两张牌,或者令该“决斗”伤害+1")
							.set("ai", function (card) {
								var val = card.name == "shan" ? 40 : 7;
								if (get.attitude(get.event().player, get.event().target) >= 1 && (get.event().count > 1 || get.event().count >= get.event().target.hp)) {
									if ((get.event().target.getEquip(2) || []).some(card => get.name(card) === "baiyin")) return 0;
									return val - player.getUseValue(card) / 5;
								} else if (get.attitude(get.event().player, get.event().source) > 1 && get.event().target.countCards("h") > get.event().source.countCards("h")) return player.getUseValue(card) + (get.name(card) == "sha" ? 3.8 : 0.6);
								return 0;
							})
							.set("target", trigger.target)
							.set("source", player)
							.set("count", count)
							.forResult();
						if (result?.bool && result.cards?.length) {
							current.give(result.cards, player);
						} else {
							count++;
							trigger.getParent().baseDamage++;
						}
					}
				},
				sub: true,
			},
		},
	},
	shxiangma: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filter: (event, player) => {
			var es = Array.from(ui.discardPile.childNodes).filter(i => {
				return get.type(i, false) == "equip";
			});
			es = es.filter(c => get.number(c, false) === Math.max(...es.map(c => get.number(c, false))));
			return (
				es.length &&
				game.filterPlayer(current => {
					for (var card of es) {
						if (current.canEquip(card, true)) return true;
					}
					return false;
				}).length
			);
		},
		chooseButton: {
			dialog(event, player) {
				var es = Array.from(ui.discardPile.childNodes).filter(i => {
					return get.type(i, false) == "equip";
				});
				es = es.filter(c => get.number(c, false) === Math.max(...es.map(c => get.number(c, false))));
				return ui.create.dialog("将一张装备牌置于场上", es, "hidden");
			},
			backup(links, player) {
				return {
					card: links[0],
					filterTarget(card, player, target) {
						return target.canEquip(links[0], true);
					},
					content: lib.skill.shxiangma.contentx,
					ai: {
						result: {
							target: 1,
						},
					},
				};
			},
			prompt(links, player) {
				return "将" + get.translation(links[0]) + "置于一名角色装备区";
			},
		},
		async contentx(event, trigger, player) {
			const card = lib.skill.shxiangma_backup.card;
			await event.target.equip(card);
			var allCards = game.filterPlayer().flatMap(p => p.getCards("ej"));
			//var minNum = Math.min(...allCards.map(c => get.number(c, false) || 0));
			if (!allCards.length) return;
			const result = await player
				.chooseTarget("弃置场上的一张点数最小的牌", function (card, player, target) {
					return target.getCards("ej").some(
						c =>
							get.number(c, false) ===
							Math.min(
								...game
									.filterPlayer()
									.flatMap(p => p.getCards("ej"))
									.map(c => get.number(c, false) || 0)
							)
					);
				})
				.set("ai", function (target) {
					return -get.attitude(player, target);
				})
				.set("forced", true)
				.forResult();
			if (result.bool) {
				await player.discardPlayerCard("ej", true, result.targets[0]).set("filterButton", function (button) {
					var card = button.link;
					return (
						get.number(card, false) ==
						Math.min(
							...game
								.filterPlayer()
								.flatMap(p => p.getCards("ej"))
								.map(c => get.number(c, false) || 0)
						)
					);
				});
			}
		},
	},

	shshengxi: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			global: ["loseAfter", "equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
		},
		filter(event, player, name, target) {
			if (!target || !target.isIn()) {
				return false;
			}
			const evt = event.getl(target);
			return evt && evt.es && evt.es.length;
		},
		logTarget: (event, player, name, target) => target,
		getIndex(event, player) {
			return game.filterPlayer(target => {
				if (!target || !target.isIn()) {
					return false;
				}
				const evt = event.getl(target);
				return evt && evt.es && evt.es.length;
			});
		},
		async cost(event, trigger, player) {
			const list = ["+1", "-1", "cancel2"];
			const target = event.indexedData;
			let choiceList = ["令" + get.translation(target) + "进攻距离+1(正面效果)", "令" + get.translation(target) + "进攻距离-1(负面效果)"];
			const result = await player
				.chooseControl(list)
				.set("prompt", get.prompt("shshengxi"))
				.set("choiceList", choiceList)
				.set("ai", () => {
					if (get.attitude(get.event().player, get.event().target) > 1) return list[0];
					else if (get.attitude(get.event().player, get.event().target) < -0.5) return list[1];
					return "cancel2";
				})
				.set("target", target)
				.forResult();
			event.result = {
				bool: result.control != "cancel2",
				cost_data: result.control,
			};
		},
		async content(event, trigger, player) {
			const target = event.indexedData;
			const num = game.filterPlayer(current => target.inRange(current)).length;
			if (!target.storage.shshengxi_dist) target.setStorage("shshengxi_dist", 0);
			target.addTempSkill("shshengxi_dist", "roundStart");
			target.storage.shshengxi_dist += event.cost_data == "+1" ? 1 : -1;
			const es = trigger.getl(target).es;
			if (
				es.length &&
				es.filter(i => {
					var subtype = get.subtype(i);
					return subtype == "equip3" || subtype == "equip4" || subtype == "equip6";
				}).length
			)
				await player.draw(2);
			if (!target.isDamaged()) return;
			if (num && !game.filterPlayer(current => target.inRange(current)).length) {
				const result = await player
					.chooseBool("是否令" + get.translation(target) + "回复1点体力")
					.set("ai", () => get.recoverEffect(target, _status.event.player, _status.event.player) > 0)
					.forResult();
				if (result?.bool) target.recover();
			}
		},
		subSkill: {
			dist: {
				charlotte: true,
				mod: {
					globalFrom(from, to, distance) {
						return distance - from.getStorage("shshengxi_dist");
					},
				},
				onremove: function (player, skill) {
					delete player.storage.shshengxi_dist;
				},
				mark: true,
				intro: {
					content: (storage, player) => {
						var str = ``;
						if (player.storage.shshengxi_dist > 0) str += `<li>本轮内你计算与其他角色距离-${player.storage.shshengxi_dist}`;
						else if (player.storage.shshengxi_dist < 0) str += `<li>本轮内你计算与其他角色距离+${-1 * player.storage.shshengxi_dist}`;
						return str;
					},
				},
				sub: true,
			},
		},
	},
	shdechong: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: "roundStart",
		},
		direct: true,
		async content(event, trigger, player) {
			const host1 = game.findPlayer(current => current.isMaxHandcard(true));
			const host2 = game.findPlayer(current => current.isMaxHp(true));
			const host3 = game.findPlayer(current => current.isMaxEquip(true));
			const hosts = [host1, , host2, host3];
			for (var current of hosts) {
				if (!current || !current.isIn()) continue;
				const list = ["选项一"];
				let choiceList = ["令" + get.translation(player) + "摸两张牌", "令" + get.translation(player) + "回复1点体力", "令" + get.translation(player) + "移动场上一张牌"];
				if (player.isDamaged()) list.push("选项二");
				else choiceList[1] = '<span style="opacity:0.5; ">' + choiceList[1] + "</span>";
				if (player.canMoveCard()) list.push("选项三");
				else choiceList[2] = '<span style="opacity:0.5; ">' + choiceList[2] + "</span>";
				list.push("cancel2");
				const { control } = await current
					.chooseControl(list)
					.set("prompt", get.prompt("shdechong"))
					.set("choiceList", choiceList)
					.set("ai", () => {
						if (get.attitude(get.event().player, get.event().source) < 2) return "cancel2";
						else if (get.event().source.hp == 1 && list.includes("选项二")) return "选项二";
						else if (get.event().source.canMoveCard(true)) return list[(Math.floor(Math.sqrt(Math.random()) * (list.length - 1)) % list.length) - 1];
						return list[0];
					})
					.set("source", player)
					.forResult();
				if (control && control != "cancel2") {
					current.logSkill("shdechong", player);
					if (control == "选项一") {
						await player.draw(2);
					}
					if (control == "选项二") {
						await player.recover();
					}
					if (control == "选项三") {
						await player.moveCard();
					}
				}
			}
		},
	},

	shzenzhong: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "useCardToPlayered",
		},
		filter(event, player) {
			return event.targets.length == 1 && event.target.isIn() && event.target != player;
		},
		async content(event, trigger, player) {
			if (!trigger.target.isIn()) return;
			await trigger.target.gain(lib.card.ying.getYing(1), "gain2");
		},
		group: ["shzenzhong_lose"],
		subSkill: {
			lose: {
				trigger: {
					global: ["loseAfter", "equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
				},
				filter(event, player, name, target) {
					if (!target || !target.isIn() || !target.countCards("he")) {
						return false;
					}
					const evt = event.getl(target);
					return evt && evt.hs && evt.hs.filter(h => get.name(h, false) == "ying").length && target != player;
				},
				logTarget: (event, player, name, target) => target,
				check: (event, player, name, target) => get.attitude(player, target) < 0,
				getIndex(event, player) {
					return game.filterPlayer(target => {
						if (!target || !target.isIn() || !target.countCards("he")) {
							return false;
						}
						const evt = event.getl(target);
						return evt && evt.hs && evt.hs.filter(h => get.name(h, false) == "ying").length && target != player;
					});
				},
				async content(event, trigger, player) {
					const target = event.indexedData;
					await player.discardPlayerCard(target, 2, "he", true);
				},
				sub: true,
			},
		},
	},
	shyingdang: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		unique: true,
		enable: "phaseUse",
		filter: function (event, player) {
			return !player.isLinked();
		},
		filterTarget: function (card, player, target) {
			return !target.isLinked() && target != player;
		},
		selectTarget: [0, 3],
		multitarget: true,
		multiline: true,
		limited: true,
		skillAnimation: true,
		animationColor: "gray",
		async content(event, trigger, player) {
			player.awakenSkill("shyingdang");
			const targets = [player];
			if (event.targets.length) targets.addArray(event.targets);
			targets.sortBySeat();
			for (let current of targets) {
				if (current.isLinked()) continue;
				await current.link(true);
				await current.recover();
				current.addSkill("shyingdang_use");
				current.addSkill("shyingdang_use_clear");
				current.storage.shyingdang_use = targets;
				current.storage.shyingdang_use_source = player;
			}
		},
	},
	shyingdang_use: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		locked: true,
		enable: "chooseToUse",
		filter(event, player) {
			if (!player.storage || !player.storage.shyingdang_use || !player.storage.shyingdang_use.length) return false;
			var players = player.storage.shyingdang_use.filter(cur => {
				return cur.isIn() && cur.countCards("h") && cur != player;
			});
			if (!players.length) return false;
			for (var current of players) {
				var cards = current.getCards("h");
				for (var i of cards) {
					var card = get.autoViewAs(i);
					if (event.filterCard(card, player, event)) return true;
				}
			}
			return false;
		},
		hiddenCard(player, name) {
			if (!player.storage || !player.storage.shyingdang_use || !player.storage.shyingdang_use.length) return false;
			var players = player.storage.shyingdang_use.filter(cur => {
				return cur.isIn() && cur.countCards("h") && cur != player;
			});
			if (!players.length) return false;
			for (var current of players) {
				var cards = current.getCards("h");
				for (var i of cards) {
					var card = get.autoViewAs(i);
					if (name == card.name) return true;
				}
			}
			return false;
		},
		chooseButton: {
			dialog(event, player) {
				var dialog = ui.create.dialog("营党", "hidden");
				var players = player.storage.shyingdang_use.filter(cur => {
					return cur.isIn() && cur.countCards("h") && cur != player;
				});
				for (var current of players) {
					var cards = current.getCards("h");
					if (cards.length) {
						var str = '<div class="text center">';
						str += get.translation(current);
						var num = current.getSeatNum();
						if (num > 0) str += "（" + get.cnNumber(num, true) + "号位）";
						str += "</div>";
						dialog.add(str);
						dialog.add(cards);
					}
				}
				return dialog;
			},
			filter(button, player) {
				var card = get.autoViewAs(button.link),
					evt = _status.event.getParent();
				return evt.filterCard(card, player, evt);
			},
			check(button) {
				var source = get.owner(button.link);
				var val = get.attitude(_status.event.player, source) > 1 ? 0 : 7;
				if (_status.event.getParent().type != "phase") return 1;
				return _status.event.player.getUseValue(get.autoViewAs(button.link), null, true) + val;
			},
			backup(links, player) {
				return {
					card: links[0],
					viewAs: get.autoViewAs(links[0]),
					filterCard: () => false,
					selectCard: -1,
					precontent() {
						var card = lib.skill["shyingdang_use_backup"].card;
						event.card = card;
						event.result.cards = [card];
						event.source = get.owner(card);
						delete event.result.skill;
					},
				};
			},
			prompt(links, player) {
				return "请选择" + get.translation(links[0]) + "的目标";
			},
		},
		ai: {
			order: 10,
			result: {
				player(player, target) {
					if (_status.event.dying) return get.attitude(player, _status.event.dying);
					return 1;
				},
			},
			respondSha: true,
			respondShan: true,
			skillTagFilter(player, tag, arg) {
				var name;
				switch (tag) {
					case "respondSha":
						name = "sha";
						break;
					case "respondShan":
						name = "shan";
						break;
				}
				return lib.skill["shyingdang_use"].hiddenCard(player, name);
			},
		},
	},
	shyingdang_use_clear: {
		trigger: {
			global: "linkAfter",
		},
		forced: true,
		popup: false,
		filter: function (event, player) {
			if (event.player.isLinked()) return false;
			return event.player == player || event.player == player.storage.shyingdang_use_source;
		},
		async content(event, trigger, player) {
			for (var current of player.storage.shyingdang_use) {
				current.storage.shyingdang_use.remove(player);
			}
			delete player.storage.shyingdang_use;
			delete player.storage.shyingdang_use_source;
			player.removeSkill("shyingdang_use");
			player.removeSkill("shyingdang_use_clear");
		},
	},

	shwuyin: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseJieshuBegin",
		},
		filter: function (event, player) {
			return player.countCards("h");
		},
		check: function (event, player) {
			if (get.value(player.getCards("h")) > 15) return false;
			return player.countCards("h") < 3 || player.group != "shen";
		},
		async content(event, trigger, player) {
			var cards = player.getCards("h");
			var num = cards.length;
			await player.discard(cards);
			const result = await player
				.chooseTarget("请选择角色，令其隐匿", [1, num], true, (card, player, target) => {
					return !target.isUnseen(2);
				})
				.set("ai", target => {
					const player = get.player();
					if (target == player) return 20;
					return get.attitude(player, target);
				})
				.forResult();
			if (result.bool) {
				for (const current of result.targets.sortBySeat()) game.yinni(current);
			}
		},
	},
	shfulong: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		async content(event, trigger, player) {
			var card;
			const cards = [];
			do {
				card = get.cards()[0];
				game.cardsGotoOrdering(card);
				await player.showCards(card);
				if (get.color(card, false) == "black") await player.gain(card, "gain2");
				else cards.push(card);
			} while (get.color(card, false) != "black");
			var list = ["sadouchengbingx", "tiesuo", "shuiyanqijunx"];
			for (var i = 0; i < 3 && cards.filter(card => get.color(card, false) == "red").length > 0; i++) {
				const { bool, links } = await player
					.chooseCardButton("将任意张牌当" + get.translation(list[i]) + "使用", cards.filter(card => get.color(card, false) == "red").length > 0, cards, [1, cards.length])
					.set("filterButton", function (button) {
						return get.color(button.link, false) == "red";
					})
					.set("ai", () => {
						const count = get.event().count;
						switch (count) {
							case 0: {
								const x = game.countPlayer(function (current) {
									return lib.filter.targetEnabled2({ name: "sadouchengbingx", isCard: true }, player, current) && get.effect(current, { name: "sadouchengbingx" }, player, player) > 1;
								});
								//game.log(player.hasValueTarget("shuiyanqijunx"),"sadouchengbingx",x,ui.selected.buttons.length);
								if (ui.selected.buttons.length < x || !player.hasValueTarget("shuiyanqijunx")) return 1;
								return 0;
							}
							case 1: {
								const x = game.countPlayer(function (current) {
									return lib.filter.targetEnabled2({ name: "shuiyanqijunx", isCard: true }, player, current) && get.effect(current, { name: "shuiyanqijunx" }, player, player) > 0;
								});
								//game.log(player.hasValueTarget("shuiyanqijunx"),"shuiyanqijunx",x,ui.selected.buttons.length);
								if (cards.length - ui.selected.buttons.length > x) return 1;
								return 0;
							}
							case 2: {
								return 1;
							}
						}
					})
					.set("count", i)
					.forResult();
				if (!bool) return;
				cards.removeArray(links);
				await player.chooseUseTarget({ name: list[i], isCard: true }, links, true).set("oncard", () => {
					const event = get.event();
					event.card.storage.shfulong = true;
					_status.event.player.addTempSkill("shfulong_effect");
				});
			}
		},
		ai: {
			threaten: 1.5,
			order: function () {
				if (_status.event.player.group != "shen") return 1;
				return 10;
			},
			result: {
				player: 1,
			},
		},
		subSkill: {
			effect: {
				trigger: {
					player: "useCard2",
				},
				forced: true,
				charlotte: true,
				direct: true,
				onremove: true,
				filter: function (event, player) {
					var evt = event;
					return evt.card.storage && evt.card.storage.shfulong && event.cards && event.cards.length > 1;
				},
				content: function () {
					"step 0";
					player.removeSkill("shfulong_effect");
					var filter = function (event, player) {
						var card = event.card,
							info = get.info(card);
						if (info.allowMultiple == false) return false;
						if (event.targets && !info.multitarget) {
							if (
								game.hasPlayer(function (current) {
									return !event.targets.includes(current) && lib.filter.targetEnabled2(card, player, current);
								})
							) {
								return true;
							}
						}
						return false;
					};
					if (!filter(trigger, player)) event.finish();
					else {
						var num = trigger.cards.length - 1;
						var prompt = "为" + get.translation(trigger.card) + "增加至多" + get.cnNumber(num) + "个目标？";
						trigger.player
							.chooseTarget(prompt, [1, num], function (card, player, target) {
								var player = _status.event.player;
								return !_status.event.targets.includes(target) && lib.filter.targetEnabled2(_status.event.card, player, target);
							})
							.set("ai", function (target) {
								var trigger = _status.event.getTrigger();
								var player = _status.event.player;
								return get.effect(target, trigger.card, player, player);
							})
							.set("card", trigger.card)
							.set("targets", trigger.targets);
					}
					("step 1");
					if (result.bool) {
						if (!event.isMine() && !event.isOnline()) game.delayx();
					} else event.finish();
					("step 2");
					game.log(result.targets, "也成为了", trigger.card, "的目标");
					trigger.targets.addArray(result.targets);
				},
				sub: true,
			},
		},
	},
	shyishen: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "showCharacterAfter",
		},
		hiddenSkill: true,
		filter: function (event, player) {
			return event.toShow?.some(i => get.character(i).skills?.includes("shyishen"));
		},
		async cost(event, trigger, player) {
			const suit = ["heart", "diamond", "club", "spade"][Math.floor(Math.random() * 4)];
			const number = Math.floor(Math.random() * 13) + 1;
			const Card = game.createCard("shjinjiashenren", suit, number);
			event.result = await player
				.chooseTarget(get.prompt("shyishen"), "将" + get.translation(Card) + "置于一名角色的装备区", (card, player, target) => {
					return target.canEquip(Card);
				})
				.set("ai", target => {
					const player = get.event().player;
					if (target == player) return 20;
					return get.attitude(player, target);
				})
				.forResult();
			event.result.cost_data = Card;
		},
		async content(event, trigger, player) {
			const target = event.targets[0];
			await target.equip(event.cost_data);
		},
	},
	shtujiang: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		direct: true,
		async content(event, trigger, player) {
			const cur_InRangers = game.filterPlayer(current => player.inRange(current));
			const result = await player
				.chooseToUse({
					filterCard: function (card, player, event) {
						if (get.subtype(card) != "equip1") return false;
						return lib.filter.filterCard.apply(this, arguments);
					},
					prompt: get.prompt("shtujiang"),
					prompt2: "使用一张武器牌",
					ai1: function (card) {
						var num = 1;
						var info = get.info(card, false);
						if (info && info.distance && typeof info.distance.attackFrom == "number") num -= info.distance.attackFrom;
						if (typeof num != "number") return 0;
						if (get.event().player.identity != "zhu") return get.order(card);
						return num;
					},
				})
				.forResult();
			if (result.bool) {
				player.logSkill("shtujiang");
				const InRangers = game.filterPlayer(current => player.inRange(current));
				for (var current of InRangers.sortBySeat()) {
					if (cur_InRangers.includes(current)) continue;
					const resultx = await current
						.chooseToUse(
							function (card, player, event) {
								if (get.name(card) != "sha") {
									return false;
								}
								return lib.filter.filterCard.apply(this, arguments);
							},
							"是否对" + get.translation(player) + "使用一张无距离限制的【杀】？"
						)
						.set("targetRequired", true)
						.set("complexTarget", true)
						.set("complexSelect", true)
						.set("filterTarget", function (card, player, target) {
							if (target != _status.event.sourcex && !ui.selected.targets.includes(_status.event.sourcex)) {
								return false;
							}
							return lib.filter.targetEnabled.apply(this, arguments);
						})
						.set("sourcex", player)
						.forResult();
					if (!resultx.bool) {
						await player.draw();
						await current.changeGroup("shliao");
					}
				}
			}
		},
	},
	shlangsi: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		filterCard(card) {
			var num = 0;
			for (var i = 0; i < ui.selected.cards.length; i++) {
				num += get.number(ui.selected.cards[i]);
			}
			return get.number(card) + num <= 13;
		},
		selectCard: [1, Infinity],
		filterOk() {
			var num = 0;
			for (var i = 0; i < ui.selected.cards.length; i++) {
				num += get.number(ui.selected.cards[i]);
			}
			return num == 13;
		},
		complexCard: true,
		check(card) {
			var num = 0;
			for (var i = 0; i < ui.selected.cards.length; i++) {
				num += get.number(ui.selected.cards[i]);
			}
			if (num + get.number(card) == 13) {
				return 5.5 - get.value(card);
			}
			if (ui.selected.cards.length == 0) {
				var cards = _status.event.player.getCards("h");
				for (var i = 0; i < cards.length; i++) {
					for (var j = i + 1; j < cards.length; j++) {
						if (get.number(cards[i]) + get.number(cards[j]) == 13) {
							if (cards[i] == card || cards[j] == card) {
								return 6 - get.value(card);
							}
						}
					}
				}
			}
			return 0;
		},
		position: "hes",
		viewAs: {
			name: "juedou",
			storage: {
				shlangsi: true,
			},
		},
		precontent() {
			player.addTempSkill("shlangsi_effect");
		},
		group: "shlangsi_damage",
		subSkill: {
			effect: {
				trigger: {
					player: "useCard2",
				},
				forced: true,
				charlotte: true,
				direct: true,
				onremove: true,
				filter: function (event, player) {
					var evt = event;
					return evt.card.storage && evt.card.storage.shlangsi;
				},
				content: function () {
					"step 0";
					player.removeSkill("shlangsi_effect");
					var filter = function (event, player) {
						var card = event.card,
							info = get.info(card);
						if (info.allowMultiple == false) return false;
						if (event.targets && !info.multitarget) {
							if (
								game.hasPlayer(function (current) {
									return !event.targets.includes(current) && lib.filter.targetEnabled2(card, player, current) && player.inRange(current);
								})
							) {
								return true;
							}
						}
						return false;
					};
					if (!filter(trigger, player)) event.finish();
					else {
						var prompt = "为" + get.translation(trigger.card) + "增加一个目标？";
						trigger.player
							.chooseTarget(prompt, 1, function (card, player, target) {
								var player = _status.event.player;
								return !_status.event.targets.includes(target) && lib.filter.targetEnabled2(_status.event.card, player, target) && player.inRange(target);
							})
							.set("ai", function (target) {
								var trigger = _status.event.getTrigger();
								var player = _status.event.player;
								return get.effect(target, trigger.card, player, player);
							})
							.set("card", trigger.card)
							.set("targets", trigger.targets);
					}
					("step 1");
					if (result.bool) {
						if (!event.isMine() && !event.isOnline()) game.delayx();
					} else event.finish();
					("step 2");
					game.log(result.targets, "也成为了", trigger.card, "的目标");
					trigger.targets.addArray(result.targets);
				},
				sub: true,
			},
			damage: {
				trigger: {
					source: "damageSource",
				},
				filter: function (event, player) {
					if (!event.player.countCards("e")) return false;
					return event.card && event.card.storage && event.card.storage.shlangsi && player.isIn() && event.getParent(2).targets.includes(event.player);
				},
				direct: true,
				forced: true,
				charlotte: true,
				async content(event, trigger, player) {
					await player.gainPlayerCard(trigger.player, "e", true);
				},
				sub: true,
			},
		},
	},
	shhaoye: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		unique: true,
		zhuSkill: true,
		trigger: {
			player: "phaseUseBegin",
		},
		direct: true,
		async content(event, trigger, player) {
			for (var current of game
				.filterPlayer(current => {
					return current.group == "shliao";
				})
				.sortBySeat()) {
				await current.chooseToUse().set("addCount", false).set("logSkill", "shliao");
			}
		},
		group: "shhaoye_victory",
		subSkill: {
			victory: {
				trigger: {
					player: "phaseJieshuBegin",
				},
				forced: true,
				filter(event, player) {
					return !game.hasPlayer(function (current) {
						return current.group != "shliao";
					});
				},
				skillAnimation: true,
				animationColor: "ice",
				async content(event, trigger, player) {
					var winners = player.getFriends();
					game.over(player == game.me || winners.includes(game.me));
				},
				sub: true,
			},
		},
	},
	shyingtian: {
		init: function (player) {
			player.storage._shyingtian = [];
		},
		audio: "ext:水泊娘山/character/audio/skill:9",
		unique: true,
		trigger: {
			global: "roundStart",
		},
		filter(event, player) {
			if (game.roundNumber < 2) return false;
			return game.roundNumber > game.countPlayer(current => current.group == player.group);
		},
		limited: true,
		skillAnimation: true,
		animationColor: "legend",
		async content(event, trigger, player) {
			player.awakenSkill("shyingtian");
			game.addGlobalSkill("shyingtian_global");
			if (!_status.shyingtian) _status._shyingtian = {};
			const _shyingtian = [];
			var list = get.Alltrick().filter(name => {
				return !lib.inpile.includes(name);
			});
			var vcards = [];
			for (var i = 0; i < list.length; i++) {
				var name = list[i];
				vcards.push(["锦囊", "", name]);
			}
			if (!vcards.length) return;
			if (_status.connectMode)
				game.broadcastAll(function () {
					_status.noclearcountdown = true;
				});
			event.given_map = {};
			var n = 3;
			do {
				const result = await player
					.chooseButton([1, n], ["应天：请选择要分配的锦囊牌给一名" + get.translation(player.group) + "势力角色", [vcards, "vcard"]])
					.set("forced", true)
					.set("ai", button => {
						const card = { name: button.link[2], nature: button.link[3] };
						const player = get.event().player;
						if (button.link[2] == "gz_guguoanbang") return 0;
						return player.getUseValue(card) + 17 * Math.random();
					})
					.forResult();
				if (!result.bool) return;
				vcards.removeArray(result.links);
				n -= result.links.length;
				var cards = [];
				for (var link of result.links) {
					const suit = ["heart", "diamond", "club", "spade"][Math.floor(Math.random() * 4)];
					const number = Math.floor(Math.random() * 13) + 1;
					var Card = game.createCard2(link[2], suit, number);
					cards.push(Card);
				}
				event.togive = cards.slice(0);
				_shyingtian.addArray(event.togive);
				const targets = (
					await player
						.chooseTarget(
							"选择一名同势力角色获得" + get.translation(cards),
							function (card, player, target) {
								return player.group == target.group;
							},
							true
						)
						.set("ai", function (target) {
							var att = get.attitude(_status.event.player, target);
							if (_status.event.enemy) {
								return -att;
							} else if (att > 0) {
								return att / (1 + target.countCards("h"));
							} else {
								return att / 100;
							}
						})
						.set("enemy", get.value(event.togive[0], player, "raw") < 0)
						.forResult()
				).targets;
				if (targets.length) {
					const id = targets[0].playerid,
						map = event.given_map;
					if (!map[id]) map[id] = [];
					map[id].addArray(event.togive);
				}
			} while (n > 0);
			if (_status.connectMode) {
				game.broadcastAll(function () {
					delete _status.noclearcountdown;
					game.stopCountChoose();
				});
			}
			const giv = [];
			if (!_status._shyingtian[player.playerid]) _status._shyingtian[player.playerid] = [];
			_status._shyingtian[player.playerid].addArray(_shyingtian);
			player.storage._shyingtian.addArray(_shyingtian);
			for (const i in event.given_map) {
				const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
				player.line(source, "green");
				if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) player.addExpose(0.2);
				giv.push([source, event.given_map[i]]);
			}
			game.loseAsync({
				gain_list: giv,
				giver: player,
				animate: "draw",
			}).setContent("gaincardMultiple");
		},
	},
	shyingtian_global: {
		charlotte: true,
		mod: {
			cardEnabled(card, player) {
				if (!_status._shyingtian || !card.cards || !card.cards.length || get.is.convertedCard(card) || get.is.virtualCard(card)) return;
				for (const [playerid, cards] of Object.entries(_status._shyingtian)) {
					const source = (_status.connectMode ? lib.playerOL : game.playerMap)[playerid];
					if (cards.includes(card.cards[0])) {
						if (source.group != player.group) return false;
					}
				}
			},
		},
	},
	shxingju: {
		audio: "ext:水泊娘山/character/audio/skill:3",
		trigger: {
			global: "dieAfter",
		},
		async cost(event, trigger, player) {
			const quns = game.filterPlayer(current => current.group != "qun");
			const players = game.filterPlayer(current => current.group != player.group);
			const {
				bool,
				targets,
				links: cost_data,
			} = await player
				.chooseButtonTarget({
					createDialog: [
						`###${get.prompt(event.skill)}###选择一名角色执行一项`,
						[
							[
								["qun", "令其势力变更至群"],
								["players", "令其势力变更至与你相同"],
							],
							"textbutton",
						],
					],
					//complexSelect: true,
					filterButton(button) {
						return get.event()[button.link]?.length;
					},
					filterTarget(card, player, target) {
						const type = ui.selected.buttons?.[0]?.link;
						if (!type) {
							return false;
						}
						return get.event()[type]?.includes(target);
					},
					ai1(button) {
						switch (button.link) {
							case "qun":
								return 1;

							case "players":
								return 5;
						}
					},
					ai2(target) {
						const player = get.player();
						return get.attitude(player, target);
					},
				})
				.set("qun", quns)
				.set("players", players)
				.set("complexTarget", true)
				.forResult();
			event.result = {
				bool: bool,
				targets: targets,
				cost_data: cost_data,
			};
		},
		async content(event, trigger, player) {
			const choice = event.cost_data;
			const target = event.targets[0];
			var group = choice == "qun" ? "qun" : player.group;
			await target.changeGroup(group);
		},
	},
	shdianzhen: {
		audio: "ext:水泊娘山/character/audio/skill:5",
		init: function (player) {
			player.storage.shdianzhen = 0;
		},
		enable: "phaseUse",
		usable(skill, player) {
			return player.storage.shdianzhen + 1;
		},
		filterTarget: function (card, player, target) {
			return target.group == player.group;
		},
		async content(event, trigger, player) {
			var card,
				cards = [];
			const target = event.target;
			do {
				card = get.cards()[0];
				game.cardsGotoOrdering(card);
				await target.showCards(card);
				if (get.name(card) == "sha") await target.gain(card, "gain2");
				else cards.push(card);
			} while (get.name(card) != "sha");
			var cards1 = cards.filter(card => {
				return player.hasUseTarget(card, true, false) && get.type2(card) == "trick";
			});
			var cards2 = cards.filter(card => {
				return target.hasUseTarget(card) && get.type(card) == "equip";
			});
			if (cards1.length) {
				const result = await player
					.chooseButton(["请选择其中一张牌", cards1], true)
					.set("ai", function (button) {
						return get.event().player.getUseValue(button.link);
					})
					.forResult();
				if (result.bool) {
					player.chooseUseTarget(false, result.links[0]);
				}
			}
			if (cards2.length) {
				const result = await target
					.chooseButton(["请选择其中一张牌", cards2], true)
					.set("ai", function (button) {
						return get.event().player.getUseValue(button.link);
					})
					.forResult();
				if (result.bool) {
					target.chooseUseTarget(false, result.links[0]);
				}
			}
		},
		ai: {
			order: 10,
			result: {
				target: 1,
			},
		},
	},
	shhuitian: {
		audio: "ext:水泊娘山/character/audio/skill:5",
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		filter(event, player) {
			if (!player.storage?._shyingtian || !player.storage._shyingtian.length) return false;
			var ds = Array.from(ui.discardPile.childNodes).filter(i => {
				return player.storage._shyingtian.includes(i);
			});
			return ds.length == player.storage._shyingtian.length;
		},
		async cost(event, trigger, player) {
			var cards = Array.from(ui.discardPile.childNodes).filter(i => {
				return player.storage._shyingtian.includes(i);
			});
			const {
				bool,
				targets,
				links: cost_data,
			} = await player
				.chooseButtonTarget({
					createDialog: [get.prompt("shhuitian"), `请选择要分配的牌和目标`, cards],
					cardsx: cards,
					filterTarget: true,
					ai1(button) {
						return get.value(button.link);
					},
					ai2(target) {
						const player = get.player();
						const card = ui.selected.buttons[0].link;
						if (card && target.group == player.group) {
							return get.value(card, target) * get.attitude(player, target);
						}
						return 0;
					},
				})
				.forResult();
			event.result = {
				bool: bool,
				targets: targets,
				cost_data: cost_data,
			};
		},
		async content(event, trigger, player) {
			const { targets, cost_data: cards } = event;
			await targets[0].gain(cards, "gain2");
			await game.washCard();
			if (!player.storage.shdianzhen) player.storage.shdianzhen = 0;
			player.storage.shdianzhen++;
		},
	},
	shjieyuan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		filter(event, player) {
			return player.countCards("he", { type: "equip" });
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseCardTarget({
					filterCard(card) {
						return get.type(card) == "equip";
					},
					position: "he",
					filterTarget(card, player, target) {
						return target.canEquip(card) && target.hasSex("male");
					},
					ai1(card) {
						return 6 - get.value(card);
					},
					ai2(target) {
						return get.attitude(_status.event.player, target) - 3;
					},
					prompt: get.prompt2(event.skill),
				})
				.forResult();
		},
		async content(event, trigger, player) {
			const target = event.targets[0];
			const card = event.cards[0];
			await target.equip(card);
			if (target != player) {
				player.$give(card, target, false);
			}
			await player.draw(2);
			if (player == target) return;
			const result = await target
				.chooseToDiscard("e", "弃置装备区的所有牌，否则" + get.translation(player) + "可与你交换所有手牌", target.countCards("e"))
				.set("ai", card => {
					if (get.attitude(_status.event.player, _status.event.source) < 3 && !_status.event.source.awakenedSkills.includes("shqiangfu")) {
						return 7 - get.value(card);
					}
					return 0;
				})
				.set("source", player)
				.forResult();
			if (!result.bool) {
				const resultx = await player
					.chooseBool("是否与" + get.translation(target) + "交换手牌")
					.set("ai", () => {
						return get.value(get.event().target.getCards("h")) > get.value(get.event().player.getCards("h")) + 5;
					})
					.set("target", target)
					.forResult();
				if (resultx.bool) await player.swapHandcards(target);
			}
		},
	},
	shqiangfu: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		unique: true,
		trigger: {
			player: "phaseJieshuBegin",
		},
		limited: true,
		skillAnimation: true,
		animationColor: "orange",
		filter: function (event, player) {
			return game.hasPlayer(function (current) {
				var cards = current.getCards("e");
				if (!current.hasSex("male")) return false;
				return current.countCards("e") && player.canUse({ name: "sha", cards: cards }, current, false);
			});
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseTarget(get.prompt("shqiangfu"), "将一名男性角色装备区所有牌当伤害基数为转化牌数的【杀】对其使用。", (card, player, target) => {
					var cards = target.getCards("e");
					if (!target.hasSex("male")) return false;
					return target.countCards("e") && player.canUse({ name: "sha", cards: cards }, target, false);
				})
				.set("ai", target => {
					const player = get.event().player;
					var cards = target.getCards("e");
					const vcard = new lib.element.VCard({ name: "sha", cards: cards });
					return get.effect(target, vcard, player, player);
				})
				.forResult();
		},
		async content(event, trigger, player) {
			const target = event.targets[0];
			var cards = target.getCards("e");
			player.awakenSkill(event.name);
			await player.useCard({ name: "sha" }, cards, target, false).set("oncard", function (card) {
				const evt = get.event();
				evt.baseDamage = evt.cards.length;
			});
		},
	},

	shdaocheng: {
		skillAnimation: true,
		animationColor: "legend",
		derivation: ["shwuleifa"],
	},
	shjizhan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		filter(event, player) {
			return player.countCards("he", card => {
				if (!player.canRecast(card)) return false;
				return get.name(card) == "sha" || get.name(card) == "shan";
			});
		},
		direct: true,
		async content(event, trigger, player) {
			player.addTempSkill("shjizhan_ainum");
			if (!player.storage.shjizhan) player.storage.shjizhan = 0;
			const result = await player
				.chooseCard("he", [1, Infinity], get.prompt2("shjizhan"), function (card) {
					if (!_status.event.player.canRecast(card)) return false;
					return get.name(card) == "sha" || get.name(card) == "shan";
				})
				.set("ai", function (card) {
					if (!player.storage.shjizhan || get.centralDisCards().filter(card => get.name(card) == "sha" || get.name(card) == "shan").length < 3) return 100 - get.value(card);
					return 5.5 - get.value(card);
				})
				.forResult();
			if (result?.bool && result.cards?.length) {
				player.storage.shjizhan++;
				player.logSkill("shjizhan");
				await player.recast(result.cards);
				player.addTempSkill("shjizhan_sha");
			} else {
				player.storage.shjizhan_ainum++;
			}
		},
		ai: {
			basic: {
				order: function () {
					const player = _status.event.player;
					if (!player.storage.shjizhan) return 10;
					else if (player.storage.shjizhan_ainum < 5) return Math.max(0, Math.max(get.order({ name: "sha" }) - 0.5, 1) - player.storage.shjizhan_ainum);
					return 0;
				},
			},
			result: {
				player: 1,
			},
		},
		group: ["shjizhan_damage", "shjizhan_2"],
		subSkill: {
			sha: {
				onremove: function (player, skill) {
					delete player.storage.shjizhan;
				},
				trigger: {
					global: "phaseEnd",
				},
				direct: true,
				async content(event, trigger, player) {
					await player
						.chooseUseTarget(
							"是否视为使用一张雷【杀】",
							{
								name: "sha",
								nature: "thunder",
								storage: {
									shjizhan: true,
								},
							},
							false
						)
						.set("logSkill", "shjizhan")
						.set("oncard", function (card) {
							if (get.player().storage.shxiongqi ?? false) _status.event.directHit.addArray(game.players);
						})
						.set("nodistance", player.storage.shxiongqi ?? false);
				},
				sub: true,
			},
			ainum: {
				charlotte: true,
				init: function (player, skill) {
					player.storage.shjizhan_ainum = 0;
				},
				onremove: function (player, skill) {
					delete player.storage.shjizhan_ainum;
				},
				sub: true,
			},
			damage: {
				trigger: {
					source: "damageSource",
				},
				charlotte: true,
				forced: true,
				popup: false,
				filter(event, player) {
					return event.card && event.card.storage && event.card.storage.shjizhan;
				},
				async content(event, trigger, player) {
					var cs = get.centralDisCards().filter(card => get.name(card) == "sha" || get.name(card) == "shan");
					const hs = player.getCards("h");
					if (!cs.length) {
						if (hs.length) await player.loseToDiscardpile(hs);
						return;
					}
					const { bool, links } =
						cs.length <= 3
							? { links: cs.slice(0), bool: true }
							: await player
									.chooseCardButton("请选择要获得的牌", true, cs, 3)
									.set("ai", function (button) {
										return get.value(button.link);
									})
									.forResult();
					if (!bool) return;

					if (hs.length) await player.loseToDiscardpile(hs);
					if (links.length) await player.gain(links, "gain2");
				},
				sub: true,
			},
			2: {
				trigger: {
					player: "damageEnd",
				},
				filter(event, player) {
					return player.countCards("he", card => {
						if (!player.canRecast(card)) return false;
						return get.name(card) == "sha" || get.name(card) == "shan";
					});
				},
				direct: true,
				async content(event, trigger, player) {
					await player.useSkill("shjizhan");
				},
			},
		},
	},
	shxiongqi: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: { source: "dieAfter" },
		filter(event, player) {
			if (event.reason && event.reason.card && event.reason.card.name == "sha") {
				return event.reason.card.storage && event.reason.card.storage.shjizhan;
			}
			return false;
		},
		forced: true,
		locked: false,
		async content(event, trigger, player) {
			if (!player.storage.shxiongqi) player.storage.shxiongqi = true;
		},
	},
	shyidan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		init: function (player) {
			player.storage.shyidan = ["sha", "shan", "jiu", "tao"];
			player.storage.shyidan_blocker = [true, true, true];
		},
		enable: "chooseToUse",
		hiddenCard: function (player, name) {
			return name == player.storage.shyidan[3];
		},
		filter: function (event, player) {
			var name = player.storage.shyidan[3];
			if (event.filterCard({ name: name, isCard: true }, player, event))
				return player.countCards("h", card => {
					var List = player.storage.shyidan.slice(0, 3);
					if (List[0] == get.name(card, false)) return !get.is.shownCard(card) && player.storage.shyidan_blocker[0];
					return List.includes(get.name(card, false)) && player.storage.shyidan_blocker[List.indexOf(get.name(card, false))];
				});
			return false;
		},
		viewAs(cards, player) {
			var name = player.storage.shyidan[3];
			return {
				name: name,
				suit: "none",
				number: null,
				isCard: true,
			};
		},
		filterCard(card) {
			const player = _status.event.player;
			var List = player.storage.shyidan.slice(0, 3);
			if (List[0] == get.name(card, false)) return !get.is.shownCard(card) && player.storage.shyidan_blocker[0];
			return List.includes(get.name(card, false)) && player.storage.shyidan_blocker[List.indexOf(get.name(card, false))];
		},
		position: "h",
		popname: true,
		ignoreMod: true,
		async precontent(event, trigger, player) {
			var card = event.result.cards[0];
			var name = get.name(card, false);
			event.card = card;
			const cards = event.result.cards;
			event.result.card = { name: event.result.card.name, isCard: true };
			event.result.cards = [];
			var index = player.storage.shyidan.indexOf(name);
			player.storage.shyidan_blocker[index] = false;
			player.addTempSkill("shyidan_blocker", "roundStart");
			//game.log(cards,index)
			switch (index) {
				case 0: {
					player.addShownCards(cards, "visible_shyidan");
					break;
				}
				case 1: {
					player.discard(cards);
					break;
				}
				case 2: {
					const result = await player
						.chooseTarget(
							"选择一名其他角色获得" + get.translation(cards),
							(card, player, target) => {
								return player != target;
							},
							true
						)
						.set("ai", function (target) {
							let att = get.attitude(player, target);
							if (att < 3) {
								return 0.1;
							}
							if (target.hasSkillTag("nogain")) {
								att /= 10;
							}
							return Math.max(0.1, att / Math.sqrt(1 + target.countCards("h")));
						})
						.forResult();
					if (!result || !result.targets || !result.targets.length) return;
					await player.give(cards, result.targets[0]);
					break;
				}
			}
		},
		prompt() {
			var player = _status.event.player;
			var names = player.storage.shyidan;
			return `你可以：①明置一张【${get.translation(names[0])}】；②弃置一张【${get.translation(names[1])}】；③分配一张【${get.translation(names[2])}】，并视为使用【${get.translation(names[3])}】。`;
		},
		ai: {
			order: function () {
				var player = _status.event.player;
				var name = player.storage.shyidan[3];
				return get.order({ name: name }) + 0.2;
			},
			result: {
				player: 1,
			},
		},
		group: "shyidan_round",
		subSkill: {
			blocker: {
				charlotte: true,
				onremove: function (player, skill) {
					player.storage.shyidan_blocker = [true, true, true];
				},
				sub: true,
			},
			round: {
				trigger: {
					global: "roundEnd",
				},
				filter(event, player) {
					return player.getRoundHistory("sourceDamage").length > 0;
				},
				forced: true,
				locked: false,
				async content(event, trigger, player) {
					var list = [];
					for (var i = 0; i < player.storage.shyidan.length; i++) {
						var name = player.storage.shyidan[i];
						list.push(["基本", "", name]);
					}
					const result = await player
						.chooseToMove("义胆：是否重新调整顺序？")
						.set("list", [
							[
								"",
								[list, "vcard"],
								function (list) {
									var list2 = list.map(function (i) {
										return "【" + get.translation(i[2]) + "】";
									});
									var player = get.event("player");
									//'<span class="bluetext">'+x+'</span>'
									return `每轮每项限一次，你可以：①明置一张<span class="bluetext">${list2[0]}</span>；②弃置一张<span class="bluetext">${list2[1]}</span>；③分配一张<span class="bluetext">${list2[2]}</span>，并视为使用<span class="bluetext">${list2[3]}</span>。每轮结束时，若你本轮造成过伤害，你可以重新分配上述基本牌的位置。`;
								},
							],
						])
						.forResult();
					if (result.bool) {
						player.storage.shyidan = result.moved[0].map(function (i) {
							return i[2];
						});
					}
				},
				sub: true,
			},
		},
	},
	shguao: {
		audio: "ext:水泊娘山/character/audio/skill:1",
		trigger: {
			player: "phaseAfter",
		},
		limited: true,
		unique: true,
		skillAnimation: true,
		animationColor: "fire",
		check: function (event, player) {
			if (player.hp < 2 && !player.countCards("hs", { name: "tao" })) return false;
			return game.hasPlayer(current => {
				return get.attitude(player, current) < -1 && current.hp == 1;
			});
		},
		async content(event, trigger, player) {
			player.awakenSkill(event.name);
			await player.loseHp();
			await player.draw(3);
			if (!player.isIn()) return;
			player.insertPhase();
			player
				.when("phaseBegin")
				.filter(evt => evt.player == player)
				.then(() => {
					player.addTempSkills("shpaoxiao");
					player.addTempSkill("shguao_reset");
				});
		},
		subSkill: {
			reset: {
				trigger: {
					source: "dieAfter",
				},
				forced: true,
				charlotte: true,
				popup: false,
				content: function () {
					player.restoreSkill("shguao");
					game.log(player, "重置了", "#g【孤鏖】");
					//player.draw(3);
					player.removeSkill("shguao_reset");
				},
				mark: true,
				intro: {
					content: "可重置",
				},
				sub: true,
			},
		},
	},
	shpaoxiao: {
		audio: "ext:水泊娘山/character/audio/skill:3",
		trigger: {
			player: "useCard1",
		},
		forced: true,
		filter(event, player) {
			return !event.audioed && event.card.name == "sha" && player.countUsed("sha", true) > 1 && event.getParent().type == "phase";
		},
		async content(event, trigger, player) {
			trigger.audioed = true;
		},
		mod: {
			cardUsable(card, player, num) {
				if (card.name == "sha") {
					return Infinity;
				}
			},
		},
		ai: {
			unequip: true,
			skillTagFilter(player, tag, arg) {
				if (!get.zhu(player, "shouyue")) {
					return false;
				}
				if (arg && arg.name == "sha") {
					return true;
				}
				return false;
			},
		},
	},

	shguzhai: {
		audio: "ext:水泊娘山/character/audio/skill:3",
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		direct: true,
		content: function () {
			card = { name: "gz_guguoanbang" };
			if (player.hasUseTarget(card)) {
				var next = player.chooseToUse();
				next.logSkill = "shguzhai";
				next.set("openskilldialog", get.prompt2("shguzhai"));
				next.set("norestore", true);
				next.set("_backupevent", "shguzhaix");
				next.set("custom", {
					add: {},
					replace: { window: function () {} },
				});
				next.backup("shguzhaix");
			}
		},
		async gz_guguoanbangContent(event, trigger, player) {
			const { target } = event,
				judge = get.mode() == "guozhan" ? "identity" : "group";
			await target.draw(8);
			if (!target.countDiscardableCards(target, "h")) {
				return;
			}
			const targets = game.filterPlayer(current => current != target && current[judge] == "wu");
			const result = await target
				.chooseToDiscard("请弃置至少六张手牌", [6, target.countCards("h")], true, "h", "allowChooseAll")
				.set("ai", card => {
					const { player, targetx } = get.event();
					if (get.type(card) == "equip") return 6;
					if (2 * ui.selected.targets >= targetx.filter(current => get.attitude(player, current) > 0).length) {
						return 0;
					}
					return 6 - get.value(card);
				})
				.set("targetx", targets)
				.forResult();
			const es = result.cards.filter(c => get.type(c) == "equip");
			if (es.length) {
				for (const e of es) {
					if (player.canEquip(e)) {
						await player.equip(e);
					} else {
						if (!game.hasPlayer(target => target !== player && target.countGainableCards(player, "he"))) continue;
						const targetxs = (
							await player
								.chooseTarget("是否获得一名其他角色一张牌", (card, player, target) => {
									return player != target && target.countGainableCards(player, "he") > 0;
								})
								.set("ai", function (target) {
									return 10 - get.attitude(_status.event.player, target);
								})
								.forResult()
						).targets;
						if (targetxs?.length) {
							await player.gainPlayerCard(targetxs[0], "he", true);
						}
					}
				}
			}
			if (target[judge] != "wu" || !result.cards?.someInD("d")) {
				return;
			}
			const give_cards = result.cards.filterInD("d");
			while (targets.length && give_cards.length) {
				let result;
				result = await target
					.chooseButton(["是否将弃置的牌交给其他吴势力角色？", give_cards], [1, 2])
					.set("ai", button => {
						const { player, targetx, cards } = get.event();
						const { link } = button;
						if (targetx.some(current => get.attitude(player, current) > 0)) {
							return get.value(link);
						}
						if (!ui.selected.buttons.length && get.name(link) == "du" && targetx.some(current => get.attitude(player, current) < 0 && !current.hasSkillTag("nodu"))) {
							return 1;
						}
						return 0;
					})
					.set("targetx", targets)
					.set("cards", give_cards)
					.forResult();
				if (result?.bool && result?.links?.length) {
					const { links } = result;
					result = await target
						.chooseTarget(true, `选择获得${get.translation(links)}的角色`, (card, player, target) => {
							return get.event().targetx.includes(target);
						})
						.set("targetx", targets)
						.set("ai", target => {
							const { player, toEnemy } = get.event();
							let att = get.attitude(player, target);
							if (toEnemy) {
								if (target.hasSkillTag("nodu")) {
									return 0;
								}
								return 1 - att;
							}
							if (att < 3) {
								return 0;
							}
							if (target.hasSkillTag("nogain")) {
								att /= 10;
							}
							return Math.max(0.1, att / Math.sqrt(1 + target.countCards("h")));
						})
						.set("toEnemy", get.name(links[0]) == "du")
						.forResult();
					if (result?.bool && result?.targets?.length) {
						const [current] = result.targets;
						target.line(current, "green");
						targets.remove(current);
						give_cards.removeArray(links);
						const next = current.gain(links, "gain2");
						next.giver = target;
						await next;
					} else {
						break;
					}
				} else {
					break;
				}
			}
		},
		group: ["shguzhai_guguo", "shguzhai_damagesource", "shguzhai_damage"],
		subSkill: {
			guguo: {
				trigger: {
					player: "gz_guguoanbangBegin",
				},
				filter: function (event, player) {
					return event.card.storage?.shguzhai;
				},
				forced: true,
				locked: false,
				popup: false,
				content: function () {
					trigger.setContent(lib.skill.shguzhai.gz_guguoanbangContent);
				},
				sub: true,
			},
			damagesource: {
				trigger: {
					source: "damageSource",
				},
				forced: true,
				filter: function (event, player, name) {
					return player.getHistory("sourceDamage", evt => evt.num > 0).indexOf(event) == 0;
				},
				async content(event, trigger, player) {
					game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shguzhai4.mp3");
					await player.draw();
					var card = get.discardPile(function (i) {
						return i.name == "sha";
					});
					if (card) await player.gain(card, "gain2");
				},
			},
			damage: {
				trigger: {
					player: "damageEnd",
				},
				forced: true,
				filter: function (event, player, name) {
					return player.getHistory("damage", evt => evt.num > 0).indexOf(event) == 0;
				},
				async content(event, trigger, player) {
					game.playAudio("..", "extension", "水泊娘山/character/audio/skill/shguzhai5.mp3");
					await player.draw();
					var card = get.discardPile(function (i) {
						return i.name == "shan";
					});
					if (card) await player.gain(card, "gain2");
				},
			},
		},
	},
	shguzhaix: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		filterCard: function (card) {
			if (get.itemtype(card) != "card") return false;
			if (!ui.selected.cards.length) {
				return get.name(card) == "sha" || get.name(card) == "shan";
			}
			return ["sha", "shan"].remove(get.name(ui.selected.cards[0]))[0] == get.name(card);
		},
		selectCard: 2,
		position: "hs",
		viewAs: {
			name: "gz_guguoanbang",
			storage: {
				shguzhai: true,
			},
		},
		prompt: function () {
			return "将【杀】和【闪】各一张当【固国安邦】使用";
		},
		check: function (card) {
			return 7 - get.value(card);
		},
	},
	shjiaojiao: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filter(event, player) {
			return player.hasCard(lib.skill.shjiaojiao.filterCard, "h");
		},
		position: "h",
		filterCard(card) {
			return !get.is.shownCard(card);
		},
		discard: false,
		lose: false,
		check(card) {
			return Math.max(1, get.value(card));
		},
		async content(event, trigger, player) {
			await player.addShownCards(event.cards, "visible_shjiaojiao");
			var cards = player.getCards("h").filter(card => !get.is.shownCard(card));
			await player.discard(cards);
			await player.draw(cards.length);
		},
		ai: {
			order: 3,
			result: {
				player: 1,
			},
			viewHandcard: true,
			skillTagFilter(player, tag, arg) {
				if (player == arg) {
					return false;
				}
				return !player.countCards("h", card => !get.is.shownCard(card)) && player.countCards("h") > 0;
			},
		},
	},
	shhuisu: {
		derivation: ["shyinzhen"],
		audio: "ext:水泊娘山/character/audio/skill:2",
		skillAnimation: true,
		animationColor: "ice",
		limited: true,
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		filter(event, player) {
			return game.hasPlayer(current => current.hasSex("female"));
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseTarget(get.prompt2(event.skill), [1, 3], (card, player, target) => {
					return target.hasSex("female");
				})
				.set("ai", target => {
					return get.attitude(get.player(), target);
				})
				.forResult();
		},
		async content(event, trigger, player) {
			player.awakenSkill(event.name);
			for (const target of event.targets.sortBySeat()) {
				var card1 = game.createCard("yinyueqiang", "diamond", 12);
				var card2 = game.createCard("baiyin", "club", 1);
				await target.$gain2(card1);
				await target.equip(card1);
				await target.$gain2(card2);
				await target.equip(card2);
				await target.addSkills("shyinzhen");
			}
		},
	},
	shyinzhen: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: ["chooseToUse", "chooseToRespond"],
		hiddenCard(player, name) {
			if (player != _status.currentPhase && (name == "sha" || name == "shan")) {
				return !player.hasSkill("shyinzhen_" + name);
			}
		},
		filter(event, player) {
			if (event.responded || event.type == "wuxie") {
				return false;
			}
			if (
				game.hasPlayer(function (current) {
					return (
						current.countCards("he", card => {
							return lib.skill.shdiaoman.isVisable(player, current, card);
						}) > 0
					);
				}) &&
				event.filterCard(
					get.autoViewAs(
						{
							name: "sha",
							storage: { shyinzhen: true },
						},
						"unsure"
					),
					player,
					event
				)
			) {
				return !player.hasSkill("shyinzhen_sha");
			}
			if (
				game.hasPlayer(function (current) {
					return (
						current.countCards("he", card => {
							return lib.skill.shdiaoman.isVisable(player, current, card);
						}) > 0
					);
				}) &&
				event.filterCard(
					get.autoViewAs(
						{
							name: "shan",
							storage: { shyinzhen: true },
						},
						"unsure"
					),
					player,
					event
				)
			) {
				return !player.hasSkill("shyinzhen_shan");
			}
			return false;
		},
		delay: false,
		locked: true,
		filterTarget(card, player, target) {
			var event = _status.event,
				evt = event;
			if (event._backup) {
				evt = event._backup;
			}
			const vscard = target.getCards("he", card => lib.skill.shdiaoman.isVisable(player, target, card));
			//var equip3 = target.getCards("e", card => get.is.defendingMount(card, false));
			//var equip4 = target.getCards("e", card => get.is.attackingMount(card, false));
			if (
				vscard.length &&
				vscard.some(card =>
					evt.filterCard(
						get.autoViewAs(
							{
								name: "shan",
								storage: { shyinzhen: true },
							},
							[card]
						),
						player,
						event
					)
				)
			) {
				return true;
			}
			return vscard.some(card => {
				var sha = get.autoViewAs(
					{
						name: "sha",
						storage: { shyinzhen: true },
					},
					[card]
				);
				if (evt.filterCard(sha, player, event)) {
					if (!evt.filterTarget) {
						return true;
					}
					return game.hasPlayer(function (current) {
						return evt.filterTarget(sha, player, current);
					});
				}
			});
		},
		prompt: "将场上角色的一张对你可见的牌当做【杀】或【闪】使用或打出",
		content() {
			"step 0";
			var evt = event.getParent(2);
			evt.set("shyinzhen", true);
			var list = [];
			const vscard = target.getCards("he", card => lib.skill.shdiaoman.isVisable(player, target, card));
			//var equip4 = target.getCards("e", card => get.is.attackingMount(card, false));
			var backupx = _status.event;
			_status.event = evt;
			try {
				if (
					vscard.length &&
					vscard.some(card => {
						var shan = get.autoViewAs(
							{
								name: "shan",
								storage: { shyinzhen: true },
							},
							[card]
						);
						if (evt.filterCard(shan, player, event)) {
							return true;
						}
						return false;
					})
				) {
					list.push("shan");
				}
				if (
					vscard.length &&
					vscard.some(card => {
						var sha = get.autoViewAs(
							{
								name: "sha",
								storage: { shyinzhen: true },
							},
							[card]
						);
						if (
							evt.filterCard(sha, player, evt) &&
							(!evt.filterTarget ||
								game.hasPlayer(function (current) {
									return evt.filterTarget(sha, player, current);
								}))
						) {
							return true;
						}
						return false;
					})
				) {
					list.push("sha");
				}
			} catch (e) {
				game.print(e);
			}
			_status.event = backupx;

			event.cardName = list[0];
			var cards = vscard;
			if (cards.length == 1) {
				event._result = {
					bool: true,
					links: [cards[0]],
				};
			} else {
				player
					.choosePlayerCard(true, target, "he")
					.set("filterButton", function (button) {
						return _status.event.cards.includes(button.link);
					})
					.set("ai", ({ link }) => {
						const { player, target } = get.event();
						if (get.attitude(player, target) > 0) {
							return 10 - get.value(link, target);
						}
						return get.value(link, target);
					})
					.set("cards", cards)
					.set("target", target);
			}

			("step 1");
			var evt = event.getParent(2);
			if (result.bool && result.links && result.links.length) {
				var name = event.cardName;
				player.addTempSkill("shyinzhen_" + name, "roundStart");
				if (evt.name == "chooseToUse") {
					game.broadcastAll(
						function (result, name) {
							lib.skill.shyinzhen_backup.viewAs = {
								name: name,
								cards: [result],
								storage: { shyinzhen: target },
							};
							lib.skill.shyinzhen_backup.prompt = "选择" + get.translation(name) + "（" + get.translation(result) + "）的目标";
						},
						result.links[0],
						name
					);
					evt.set("_backupevent", "shyinzhen_backup");
					evt.backup("shyinzhen_backup");
					evt.set("openskilldialog", "选择" + get.translation(name) + "（" + get.translation(result.links[0]) + "）的目标");
					evt.set("norestore", true);
					evt.set("custom", {
						add: {},
						replace: { window() {} },
					});
				} else {
					delete evt.result.used;
					delete evt.result.skill;
					evt.result.card = get.autoViewAs(
						{
							name: name,
							cards: [result.links[0]],
							storage: { shyinzhen: target },
						},
						result.links
					);
					evt.result.cards = [result.links[0]];
					target.$give(result.links[0], player, false);
					target
						.when("respond")
						.filter(evt => evt.skill == "shweizhan" && evt.card?.storage?.shweizhan)
						.then(() => {
							if (trigger.card?.storage?.shweizhan === 2) {
								if (typeof trigger.baseDamage != "number") trigger.baseDamage = 1;
								trigger.baseDamage++;
								trigger.card.storage.shweizhan = 1;
							}
						});
					player.addTempSkill("shyinzhen_draw");
					evt.redo();
					return;
				}
			}
			evt.goto(0);
		},
		ai: {
			respondSha: true,
			respondShan: true,
			skillTagFilter(player, tag) {
				return game.hasPlayer(function (current) {
					return current.hasCard(card => lib.skill.shdiaoman.isVisable(player, current, card), "he");
				});
			},
			order: function () {
				return Math.max(get.order({ name: "sha" }), get.order({ name: "shan" })) + 0.2;
			},
			result: {
				player(player, target) {
					var att = Math.max(8, get.attitude(player, target));
					if (_status.event.type != "phase") {
						return 20 - att;
					}
					if (!player.hasValueTarget({ name: "sha" })) {
						return 0;
					}
					return 20 - att;
				},
			},
		},
		subSkill: {
			sha: {
				charlotte: true,
				onremove: true,
				sub: true,
			},
			shan: {
				charlotte: true,
				onremove: true,
				sub: true,
			},
			backup: {
				precontent() {
					player.addTempSkill("shyinzhen_draw");
					var cards = event.result.card.cards;
					event.result.cards = cards;
					event.result._apply_args = { addSkillCount: false };
					var owner = get.owner(cards[0]);
					event.target = owner;
					owner.$give(cards[0], player, false);
					player.popup(event.result.card.name, "metal");
					game.delayx();
				},
				filterCard: () => false,
				prompt: "请选择【杀】的目标",
				selectCard: -1,
				log: false,
			},
			draw: {
				charlotte: true,
				trigger: {
					player: ["useCardAfter", "respondAfter"],
				},
				forced: true,
				popup: false,
				filter(event, player) {
					return event.card?.storage && event.card?.storage.shyinzhen && event.card?.storage.shyinzhen.isIn();
				},
				content() {
					trigger.card.storage.shyinzhen.draw();
				},
				sub: true,
			},
		},
	},
	shfangyin: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		isSomeVisibility: function (cards) {
			var bool = get.is.shownCard(cards[0]);
			for (var card of cards) {
				if (bool ^ get.is.shownCard(card)) return false;
			}
			return true;
		},
		isDifferentSuit: function (cards) {
			const suits = cards.map(card => get.suit(card, false));
			return suits.every((suit, index) => suits.indexOf(suit) === index);
		},
		init(player) {
			player.storage.shfangyin = [];
		},
		enable: "phaseUse",
		filter(event, player) {
			return player.hasCard(lib.skill.shfangyin.filterCard, "h");
		},
		position: "h",
		filterCard(card) {
			const name = get.name(card, false),
				nature = get.nature(card, false),
				player = get.event().player;
			if (!ui.selected.cards.length) {
				if (!player.hasUseTarget(get.autoViewAs({ name: name, nature: nature, isCard: true }), true, true)) return false;
				return (get.type(name) == "trick" && get.is.shownCard(card)) || (get.type(name) == "basic" && !get.is.shownCard(card));
			}
			const cards = ui.selected.cards.slice(0).add(card);
			return lib.skill.shfangyin.isSomeVisibility(cards) && lib.skill.shfangyin.isDifferentSuit(cards);
		},
		filterOk() {
			const cards = ui.selected.cards,
				player = get.event().player;
			const cardSuits = cards.map(card => get.suit(card, false));
			for (const suitItem of player.storage.shfangyin) {
				if (suitItem.length !== cardSuits.length) continue;
				if (suitItem.every(suit => cardSuits.includes(suit))) return false;
			}
			return (
				lib.skill.shfangyin.isSomeVisibility(cards) &&
				lib.skill.shfangyin.isDifferentSuit(cards) &&
				cards.filter(card => {
					return (get.type(card) == "trick" && get.is.shownCard(card)) || (get.type(card) == "basic" && !get.is.shownCard(card));
				}).length
			);
		},
		complexCard: true,
		selectCard: [1, 3],
		discard: false,
		lose: false,
		check(card) {
			return Math.max(1, get.value(card));
		},
		async content(event, trigger, player) {
			var list = [],
				cards = event.cards;
			player.storage.shfangyin.push(cards.map(card => get.suit(card, false)));
			player.markSkill("shfangyin");
			if (get.is.shownCard(cards[0])) {
				player.hideShownCards(cards, "visible_shfangyin");
				for (var i = 0; i < cards.length; i++) {
					const name = get.name(cards[i], false);
					if (get.type(name) == "trick" && player.hasUseTarget(get.autoViewAs({ name: name, isCard: true }), true, true)) list.add(["锦囊", "", name]);
				}
			} else {
				player.addShownCards(cards, "visible_shfangyin");
				for (var i = 0; i < cards.length; i++) {
					const name = get.name(cards[i], false);
					if (name == "sha") {
						const nature = get.nature(cards[i], false);
						if (player.hasUseTarget(get.autoViewAs({ name: name, nature: nature, isCard: true }), true, true)) {
							if (typeof nature === "string") list.push(["基本", "", "sha", nature]);
							else list.push(["基本", "", "sha"]);
						}
					} else if (get.type(name) == "basic" && player.hasUseTarget(get.autoViewAs({ name: name, isCard: true }), true, true)) list.add(["基本", "", name]);
				}
			}
			const uniqueList = [...new Set(list.map(item => JSON.stringify(item)))].map(str => JSON.parse(str));
			if (!uniqueList.length) return;
			const { bool, links } =
				uniqueList.length > 1
					? await player
							.chooseButton(["视为使用其中一张牌", [uniqueList, "vcard"]], true)
							.set("ai", function (button) {
								return get.event().player.getUseValue({
									name: button.link[2],
									nature: button.link[3],
								});
							})
							.forResult()
					: {
							bool: true,
							links: uniqueList,
						};
			if (!bool) return;
			await player
				.chooseUseTarget(
					{
						name: links[0][2],
						nature: links[0][3],
						isCard: true,
					},
					true
				)
				.set("nodistance", false)
				.set("addCount", true);
		},
		intro: {
			content(storage, player, skill) {
				const suitSortMap = { heart: 1, diamond: 2, club: 3, spade: 4 };
				let str = "已触发过的组合：";
				const getColoredSuit = suit => {
					if (["heart", "diamond"].includes(suit)) {
						return `<span style="color:red">${get.translation(suit)}</span>`;
					}
					return `<span style="color:black">${get.translation(suit)}</span>`;
				};
				const sortedList = storage
					.slice()
					.sort((a, b) => a.length - b.length)
					.map(suitItem => suitItem.slice().sort((s1, s2) => suitSortMap[s1] - suitSortMap[s2]));
				if (!sortedList.length) {
					str += "无";
				} else {
					for (const suitGroup of sortedList) {
						const coloredGroup = suitGroup.map(suit => getColoredSuit(suit)).join("、");
						str += `<br><li>${coloredGroup}`;
					}
				}
				return str;
			},
		},
	},
	shwanmeng: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseDiscardAfter",
		},
		async cost(event, trigger, player) {
			const prompt = get.prompt2(event.skill) + " <font color=#FFD700>(若仅选择自己则自己摸两张)</font>";
			event.result = await player
				.chooseTarget(prompt, (card, player, target) => {
					if (!ui.selected.targets?.length) return player.getSeatNum() >= target.getSeatNum();
					return player.getSeatNum() <= target.getSeatNum();
				})
				.set("selectTarget", function () {
					if (!ui.selected.targets?.length || ui.selected.targets?.includes(get.player())) return [1, 2];
					return 2;
				})
				.set("multitarget", true)
				.set("ai", target => {
					return get.attitude(get.player(), target);
				})
				.forResult();
		},
		async content(event, trigger, player) {
			const targets = event.targets[0].getSeatNum() <= player.getSeatNum() ? event.targets : event.targets.reverse();
			await game.asyncDraw([targets[0], targets.at(-1)]);
			if (targets[0].getSeatNum() < player.getSeatNum()) {
				const list = ["选项二"];
				let choiceList = ["令" + get.translation(targets.at(-1)) + "回复1点体力", "令" + get.translation(targets.at(-1)) + "失去1点体力"];
				if (targets.at(-1).isDamaged()) list.unshift("选项一");
				else choiceList[0] = '<span style="opacity:0.5; ">' + choiceList[0] + "</span>";
				list.push("cancel2");
				const result = await targets[0]
					.chooseControl(list)
					.set("choiceList", choiceList)
					.set("ai", function () {
						var player = get.event().player,
							target = targets.at(-1);
						if (get.recoverEffect(target, player, player) > get.effect(target, { name: "losehp" }, player, player) && list[0] == "选项一") {
							return 0;
						} else if (get.attitude(player, target) > 0) return "cancel2";
						return 1;
					})
					.forResult();
				if (result?.control == "选项一") await targets.at(-1).recover();
				else if (result?.control == "选项二") await targets.at(-1).loseHp();
			}
		},
	},
	shyouyun: {
		audio: "ext:水泊娘山/character/audio/skill:4",
		onChooseToUse(event) {
			if (game.online) {
				return;
			}
			const player = event.player,
				storage = player.storage.shyouyun_round;
			const list = get.inpileVCardList(info => {
				if (info[0] != "trick") return false;
				const name = info[2];
				var num = game.countPlayer(current => {
					return player.canUse({ name: name, isCard: true }, current, true, true);
				});
				return !storage || num < storage[1];
			});
			event.set("shyouyun", list);
		},
		canMoveCard(player) {
			const storage = player.storage.shyouyun_round;
			return (
				game.filterPlayer(target => {
					return player.canMoveCard(
						null,
						null,
						target,
						game.filterPlayer(i => i != target),
						card => {
							var num = (card.viewAs || card.name) == "xumou_jsrg" ? 1 : get.cardNameLength(card);
							return !storage || num > storage[0];
						}
					);
				}).length > 0
			);
		},
		enable: "chooseToUse",
		hiddenCard: function (player, name) {
			if (get.type(name) != "trick" || !lib.inpile.includes(name)) return false;
			return lib.skill.shyouyun.canMoveCard(player);
		},
		filter: function (event, player) {
			return event.shyouyun?.length && lib.skill.shyouyun.canMoveCard(player);
		},
		chooseButton: {
			dialog: function (event, player) {
				const list = event.shyouyun;
				return ui.create.dialog("游云", [list, "vcard"]);
			},
			filter(button, player) {
				var card = { name: button.link[2], isCard: true };
				return _status.event.getParent().filterCard(card, player, _status.event.getParent());
			},
			check: function (button) {
				var player = _status.event.player;
				var card = { name: button.link[2], isCard: true };
				return _status.event.getParent().type == "phase" ? player.getUseValue(card) : 1;
			},
			backup: function (links, player) {
				return {
					selectCard: -1,
					filterCard: () => false,
					viewAs: {
						name: links[0][2],
						isCard: true,
					},
					popname: true,
					log: false,
					async precontent(event, trigger, player) {
						player.logSkill("shyouyun");
						const result = await player
							.moveCard(true, card => {
								var player = get.event().player,
									storage = get.event().player.storage.shyouyun_round;
								var num = (card.viewAs || card.name) == "xumou_jsrg" ? 1 : get.cardNameLength(card);
								return !storage || num > storage[0];
							})
							.forResult();
						if (result?.card) {
							if (!player.storage?.shyouyun_round) {
								player.storage.shyouyun_round = [0, 0];
								player.addTempSkill("shyouyun_round", "roundStart");
							}
							player.storage.shyouyun_round[0] = (result.card.viewAs || result.card.name) == "xumou_jsrg" ? 1 : get.cardNameLength(result.card);
							player.storage.shyouyun_round[1] = game.countPlayer(current => {
								return player.canUse({ name: event.result.card.name, isCard: true }, current, true, true);
							});
						}
					},
				};
			},
			prompt: function (links, player) {
				return "视为使用一张" + get.translation(links[0][3] || "") + get.translation(links[0][2]);
			},
		},
		ai: {
			order: 1,
			result: {
				player: 1,
			},
		},
		subSkill: {
			round: {
				charlotte: true,
				onremove: function (player, skill) {
					delete player.storage.shyouyun_round;
				},
				mark: true,
				intro: {
					content: (storage, player) => {
						return `<li>上次移动牌的字数：${storage[0]}<br><li>上次使用牌的合法目标数：${storage[1]}`;
					},
				},
				sub: true,
			},
		},
	},
	shyiqing: {
		audio: "ext:水泊娘山/character/audio/skill:3",
		enable: "phaseUse",
		usable: 1,
		filter(event, player) {
			return player.countCards("h") > 1 && !player.isDisabledJudge();
		},
		async content(event, trigger, player) {
			var bool = false;
			const reserve = [...player.getCards("h")].sort((a, b) => {
				const getVal = c => (player.hasValueTarget(c, true, true) > 0 ? 10 * player.getUseValue(c, true, true) : get.value(c));
				return getVal(b) - getVal(a);
			})[0];

			while (player.countCards("h") > 1 && !player.isDisabledJudge()) {
				const result = await player
					.chooseCard("蓄谋一张手牌", true)
					.set("ai", card => {
						if (reserve != card) return 2;
						return 1;
					})
					.forResult();
				if (result?.bool && result?.cards?.length) {
					await player.addJudge({ name: "xumou_jsrg" }, result.cards);
					bool = true;
				} else {
					break;
				}
			}
			if (bool)
				await player.addTempSkill("shyiqing_lose", {
					player: "phaseBeginStart",
				});
		},
		ai: {
			order: 7,
			result: {
				player: 1,
			},
		},
		subSkill: {
			lose: {
				trigger: {
					player: "loseAfter",
					global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
				},
				frequent: true,
				filter(event, player) {
					if (player.countCards("h")) {
						return false;
					}
					const evt = event.getl(player);
					return evt && evt.player == player && evt.hs && evt.hs.length > 0;
				},
				async content(event, trigger, player) {
					await player.draw(2);
				},
				ai: {
					threaten: 0.8,
					effect: {
						player_use(card, player, target) {
							if (player.countCards("h") === 1) {
								return [2, 1.6];
							}
						},
						target(card, player, target) {
							if (get.tag(card, "loseCard") && target.countCards("h") === 1) {
								return 0.5;
							}
						},
					},
					noh: true,
					freeSha: true,
					freeShan: true,
					skillTagFilter(player, tag) {
						if (player.countCards("h") !== 1) {
							return false;
						}
					},
				},
				sub: true,
			},
		},
	},
	shwuyao: {
		audio: "ext:水泊娘山/character/audio/skill:4",
		trigger: {
			player: "phaseUseBegin",
		},
		filter: function (event, player) {
			return player.countCards("h", { color: "red" }) > 0;
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseCard(
					get.prompt2(event.skill),
					function (card) {
						return get.color(card) == "red";
					},
					"h"
				)
				.set("ai", card => {
					if (get.name(card) == "shan") return 10;
					return 10 - get.value(card);
				})
				.forResult();
		},
		async content(event, trigger, player) {
			const card = event.cards[0];
			await player.showCards(card, `${get.translation(player)}发动了〖${get.translation(event.name)}〗`);
			await player.draw(3);
			const juedou = new lib.element.VCard({ name: "juedou", isCard: true });
			const target = (
				await player
					.chooseTarget(
						"令一名其他角色选择一项：与你拼点，或视为对你使用【决斗】。拼点或决斗没赢的角色展示所有手牌。",
						function (card, player, target) {
							if (!target.canUse(juedou, player) && !target.canCompare(player)) return false;
							return target != player;
						},
						true
					)
					.forResult()
			).targets[0];
			const list = ["拼点", "决斗"];

			if (!target?.isIn()) return;
			let choiceList = ["与" + get.translation(player) + "拼点", "视为对" + get.translation(player) + "使用一张【决斗】"];
			if (!target?.canCompare(player)) {
				list.remove("拼点");
				choiceList[0] = '<span style="opacity:0.5; ">' + choiceList[0] + "</span>";
			}
			if (!target?.canUse(juedou, player)) {
				list.remove("决斗");
				choiceList[1] = '<span style="opacity:0.5; ">' + choiceList[1] + "</span>";
			}
			const { control } = await target
				.chooseControl(list)
				.set("choiceList", choiceList)
				.set("ai", function () {
					const player = get.event().player,
						source = get.event().source;
					const CARD_DIFF = 2,
						SHAN_FEW = 1,
						SHAN_MANY = 2,
						SHA_MANY = 2,
						LOW_HP = 2,
						LOW_CARD = 2;
					const BASE_FAVOR = 0.7,
						BASE_UNFAVOR = 0.3,
						NORMAL = 0.5;
					const selfCard = player.countCards("h"),
						gsCard = source.countCards("h");
					const selfHp = player.hp,
						gsHp = source.hp,
						cardDiff = gsCard - selfCard;
					const selfSha = player.countCards("h", { name: "sha" }),
						selfShan = player.countCards("h", { name: "shan" });
					const hasSmall = player.getCards("h").some(c => [1, 2].includes(get.number(c)));
					const centerShan = get.centralDisCards().filter(c => get.name(c, false) == "shan").length;
					const hasBig = player.getCards("h").some(c => get.number(c) >= 10);
					const normalize = r => Math.max(0, Math.min(1, r));
					const [isSelfLowHp, isSelfLowCard] = [selfHp <= LOW_HP, selfCard <= LOW_CARD];
					const [gsMore, gsLess] = [cardDiff >= CARD_DIFF, cardDiff <= -CARD_DIFF];
					const [selfFewShan, selfMoreShan, selfMoreSha] = [selfShan <= SHAN_FEW, selfShan >= SHAN_MANY, selfSha >= SHA_MANY];
					let pinDian = NORMAL,
						jueDou = NORMAL;
					if (gsMore && selfFewShan && hasSmall) {
						pinDian = BASE_FAVOR;
						jueDou = BASE_UNFAVOR;
					} else if (gsLess && (selfMoreShan || selfMoreSha)) {
						pinDian = BASE_UNFAVOR;
						jueDou = BASE_FAVOR;
					} else {
						let adj = 0;
						isSelfLowHp && (adj += 0.15);
						isSelfLowCard && (adj -= 0.15);
						hasBig && (adj += 0.2);
						hasSmall && Math.abs(cardDiff) < CARD_DIFF && (adj += 0.1);
						centerShan >= 2 && (adj += 0.2);
						selfSha < 1 && selfShan < 1 && (adj += 0.2);
						gsHp <= LOW_HP && (adj -= 0.15);
						selfMoreShan && selfSha < 1 && (adj -= 0.1);
						pinDian = normalize(NORMAL + adj);
						jueDou = normalize(1 - pinDian);
					}
					if (list.length === 1) return list[0];
					if (get.attitude(player, source) > 2) return source.hp <= 2 ? "拼点" : "决斗";
					return Math.random() < pinDian ? "拼点" : "决斗";
				})
				.set("source", player)
				.forResult();
			if (control) {
				if (control == "拼点") {
					const result = await target
						.chooseToCompare(player)
						.set("small", get.attitude(target, player) < 2)
						.forResult();
					const targets = [player, target];
					if (!result.bool) targets.reverse();
					await targets[0].showHandcards();
					if (result.tie) {
						await targets[1].showHandcards();
					}
				} else if (control == "决斗") {
					player.addTempSkill("shwuyao_juedou");
					await target.useCard(juedou, player).set("oncard", function (card) {
						card.storage.shwuyao_juedou = true;
					});
				}
			}
		},

		subSkill: {
			juedou: {
				trigger: {
					player: "juedouAfter",
					target: "juedouAfter",
				},
				forced: true,
				charlotte: true,
				popup: false,
				filter(event, player) {
					if (!event?.card?.storage?.shwuyao_juedou) return false;
					return event.turn && event.turn.isIn();
				},
				async content(event, trigger, player) {
					trigger.turn.showHandcards();
				},
				sub: true,
			},
		},
	},
	shweizhan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		locked: false,
		group: ["shweizhan_show", "shweizhan_clear"],
		enable: ["chooseToRespond", "chooseToUse"],
		filterCard(card, player) {
			return card.hasGaintag("shweizhan_tag1") || card.hasGaintag("shweizhan_tag2");
		},
		position: "hes",
		viewAs: {
			name: "sha",
			storage: {
				shweizhan: 1,
			},
		},
		viewAsFilter(player) {
			if (
				!player.countCards("hes", card => {
					return card.hasGaintag("shweizhan_tag1") || card.hasGaintag("shweizhan_tag2");
				})
			)
				return false;
		},
		check(card) {
			const val = get.name(card, false) == "shan" ? 0 : card.hasGaintag("shweizhan_tag2") ? 1 : get.value(card);
			if (_status.event.name == "chooseToRespond") {
				return 1 / Math.max(0.1, get.value(card));
			}
			return 9 - val;
		},
		async precontent(event, trigger, player) {
			if (!event.result.card.storage) event.result.card.storage = {};
			var cards = event.result.cards;
			const card = event.result.card;
			card.storage.shweizhan = cards[0].hasGaintag("shweizhan_tag2") ? 2 : 1;
			player
				.when("useCard")
				.filter(evt => evt.skill == "shweizhan" && evt.card?.storage?.shweizhan)
				.then(() => {
					if (trigger.card?.storage?.shweizhan === 2) {
						if (typeof trigger.baseDamage != "number") trigger.baseDamage = 1;
						trigger.baseDamage++;
						trigger.card.storage.shweizhan = 1;
					}
				});
		},
		ai: {
			respondSha: true,
			order(item, player) {
				return get.order({ name: "sha" }) + 0.2;
			},
			result: {
				player: 1,
			},
		},
		mod: {
			cardUsable(card, player, num) {
				if (card.name == "sha") {
					var x = get.centralDisCards().filter(c => c.name == "shan").length;
					return num + x;
				}
			},
			targetInRange(card, player, target) {
				//game.log(card,card?.storage?.shweizhan)
				if (card?.storage?.shweizhan > 0 && get.color(card) == "red") {
					return true;
				}
			},
		},
		subSkill: {
			clear: {
				trigger: {
					global: "roundEnd",
				},
				forced: true,
				charlotte: true,
				popup: false,
				firstDo: true,
				async content(event, trigger, player) {
					player.removeGaintag("shweizhan_tag1");
					player.removeGaintag("shweizhan_tag2");
				},
			},
			show: {
				trigger: {
					global: "showCardsEnd",
				},
				forced: true,
				charlotte: true,
				popup: false,
				firstDo: true,
				filter(event, player) {
					return event.cards.some(i => get.owner(i) == player);
				},
				async content(event, trigger, player) {
					game.broadcastAll(
						function (cards) {
							cards.forEach(card => {
								if (!card.hasGaintag("shweizhan_tag1") && !card.hasGaintag("shweizhan_tag2")) card.addGaintag("shweizhan_tag1");
								else if (card.hasGaintag("shweizhan_tag1") && !card.hasGaintag("shweizhan_tag2")) {
									card.removeGaintag("shweizhan_tag1");
									card.addGaintag("shweizhan_tag2");
								}
							});
						},
						trigger.cards.filter(i => get.owner(i) == player)
					);
				},
				sub: true,
			},
		},
	},
	shjuguan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		filter: function (event, player) {
			if ((player.getStat("skill").shjuguan || 0) >= Math.max(1, player.countCards("e"))) return false;
			return player.hasUseTarget({ name: "wanjian", isCard: true });
		},
		viewAs: {
			name: "wanjian",
			storage: {
				shjuguan: true,
			},
		},
		filterCard: () => false,
		selectCard: -1,
		log: false,
		async precontent(event, trigger, player) {
			player.logSkill("shjuguan");
			const cards = get.cards(2),
				name = event.result.card.name;
			event.result.card = get.autoViewAs({ name: name }, cards);
			event.result.cards = cards;
			game.cardsGotoOrdering(cards);
			player.addTempSkill("shjuguan_top");
		},
		subSkill: {
			top: {
				trigger: {
					player: "useCardAfter",
				},
				forced: true,
				silent: true,
				popup: false,
				filter(event, player) {
					return event.skill == "shjuguan";
				},
				async content(event, trigger, player) {
					const result = await player
						.chooseCard("he", true, 2, "将两张牌置于牌堆顶（先选择的在下）")
						.set("complexSelect", player.countCards("he") > 1)
						.set("ai", card => {
							if (ui.selected.cards.length) {
								if (get.color(card) == get.color(ui.selected.cards[0])) return 100 - get.value(card);
								return 90 - get.value(card);
							}
							return 90 - get.value(card);
						})
						.forResult();
					if (result?.bool && result?.cards?.length) {
						await player.lose(result.cards.reverse(), ui.cardPile, "insert");
					}
				},
				sub: true,
			},
		},
	},
	shyinyu: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			source: "damageBegin1",
		},
		filter(event, player) {
			if (!event.card || !event.player.hasCard(card => lib.filter.canBeDiscarded(card, player, event.player), "hej")) return false;
			return player != event.player && event.player.isIn();
		},
		async cost(event, trigger, player) {
			event.result = await player
				.discardPlayerCard(trigger.player, "hej")
				.set("prompt", get.prompt(event.skill))
				.set("prompt2", "弃置" + get.translation(trigger.player) + "区域内一张牌，若颜色为" + get.translation(get.color(trigger.card)) + "你获得之")
				.set("ai", button => {
					const player = get.player(),
						card = button.link;
					const event = get.event().getTrigger(),
						target = event.player;
					let eff = get.effect(target, { name: "guohe_copy" }, player, player);
					if (eff <= 0) {
						return 0;
					}
					if (get.color(card) == get.color(event.card)) eff += get.value(card);
					if (get.position(card) == "j") eff += get.attitude(player, target) * 2;
					return Math.max(eff * (0.1 + Math.random()), 0);
				})
				.forResult();
		},
		logTarget: "player",
		async content(event, trigger, player) {
			const card = event.cards[0];
			await trigger.player.modedDiscard(event.cards, player);
			if (get.color(card) == get.color(trigger.card) && get.position(card, true) == "d") {
				await player.gain(card, "gain2");
			}
		},
	},
	shquanfu: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: ["loseAfter", "loseAsyncAfter", "cardsDiscardAfter", "equipAfter", "addJudgeAfter", "addToExpansionAfter"],
		},
		forced: true,
		filter(event, player) {
			if (_status?.currentPhase != player) return false;
			return event
				.getd()
				?.filterInD("od")
				?.some(i => {
					return (get.name(i, false) === "sha" && get.color(i, false) === "black") || (get.subtype(i, false) === "equip1" && get.name(i, false) !== "zheji") || (get.subtype(i, false) === "equip2" && get.name(i, false) !== "nvzhuang");
				});
		},
		async content(event, trigger, player) {
			const cards = trigger
				.getd()
				.filterInD("od")
				.filter(i => {
					return (get.name(i, false) === "sha" && get.color(i, false) === "black") || (get.subtype(i, false) === "equip1" && get.name(i, false) !== "zheji") || (get.subtype(i, false) === "equip2" && get.name(i, false) !== "nvzhuang");
				});
			if (!cards.length) return;
			for (const i of cards) {
				if (get.name(i, false) === "sha" && get.color(i, false) === "black") {
					var card = game.createCard2("du", i.suit, i.number),
						index = (() => {
							const max = Math.min(ui.cardPile.childNodes.length - 1, 2);
							return max >= 0 ? Array.from({ length: max + 1 }, (_, i) => i).randomGet() : null;
						})();
					await game.cardsGotoSpecial(i);
					ui.cardPile.insertBefore(card, ui.cardPile.childNodes[index]);
				} else if (get.subtype(i, false) === "equip1" && get.name(i, false) !== "zheji") {
					var card = game.createCard2("zheji", i.suit, i.number),
						index = (() => {
							const max = Math.min(ui.cardPile.childNodes.length - 1, 2);
							return max >= 0 ? Array.from({ length: max + 1 }, (_, i) => i).randomGet() : null;
						})();
					await game.cardsGotoSpecial(i);
					ui.cardPile.insertBefore(card, ui.cardPile.childNodes[index]);
				} else if (get.subtype(i, false) === "equip2" && get.name(i, false) !== "nvzhuang") {
					var card = game.createCard2("nvzhuang", i.suit, i.number),
						index = (() => {
							const max = Math.min(ui.cardPile.childNodes.length - 1, 2);
							return max >= 0 ? Array.from({ length: max + 1 }, (_, i) => i).randomGet() : null;
						})();
					await game.cardsGotoSpecial(i);
					ui.cardPile.insertBefore(card, ui.cardPile.childNodes[index]);
				}
				await player.draw();
			}
		},
	},
	shhaimou: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		filter(event, player) {
			const List = ["jiedao", "guohe", "wuzhong"].removeArray(player.getStorage("shhaimou_used") || []);
			for (let name of List) {
				if (event.filterCard({ name: name }, player, event) && player.countCards("hes", { color: "black" })) return true;
			}
			return false;
		},
		chooseButton: {
			dialog(event, player) {
				return ui.create.dialog("骇谋", [["jiedao", "guohe", "wuzhong"].removeArray(player.getStorage("shhaimou_used") || []), "vcard"]);
			},
			filter(button, player) {
				var evt = _status.event.getParent();
				return evt.filterCard({ name: button.link[2] }, player, evt);
			},
			check(button) {
				var player = _status.event.player;
				return Math.max(0, player.getUseValue(button.link[2]));
			},
			backup(links, player) {
				return {
					name: links[0][2],
					filterCard(card) {
						return get.color(card) == "black";
					},
					popname: true,
					log: false,
					check(card) {
						var player = _status.event.player,
							name = lib.skill["shhaimou_backup"].name;
						let checkCombo = function (i, player) {
							if (!player.hasSkill("shquanfu")) return false;
							return (get.name(i, false) === "sha" && get.color(i, false) === "black") || (get.subtype(i, false) === "equip1" && get.name(i, false) !== "zheji") || (get.subtype(i, false) === "equip2" && get.name(i, false) !== "nvzhuang");
						};
						if (!player.getStorage("shhaimou_used").includes("wuzhong") && checkCombo(name, player)) val -= 5;
						return 6 - val;
					},
					position: "hes",
					viewAs: { name: links[0][2] },
					onuse(result, player) {
						player.logSkill("shhaimou");
						player.markAuto("shhaimou_used", [result.card.name]);
						player.addTempSkill("shhaimou_used", "phaseUseEnd");
					},
				};
			},
			prompt(links, player) {
				return "将一张黑色牌当做" + get.translation(links[0][2]) + "使用";
			},
		},
		ai: {
			order() {
				return Math.max(get.order({ name: "guohe" }), get.order({ name: "wuzhong" }));
			},
			result: {
				player: 1,
			},
		},
		subSkill: {
			used: {
				charlotte: true,
				onremove: true,
				sub: true,
			},
		},
	},
	shhuijin: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "chooseToUse",
		filter(event, player) {
			if (!player.countCards("e")) return false;
			return (
				get.inpileVCardList(info => {
					if (info[0] != "basic") return false;
					return event.filterCard(get.autoViewAs({ name: info[2], nature: info[3] }, "unsure"), player, event);
				}).length > 0
			);
		},
		hiddenCard(player, name) {
			if (!lib.inpile.includes(name)) {
				return false;
			}
			let type = get.type2(name);
			return type == "basic" && player.countCards("e") > 0;
		},
		chooseButton: {
			dialog(event, player) {
				const list = get.inpileVCardList(info => {
					if (info[0] != "basic") return false;
					return event.filterCard(get.autoViewAs({ name: info[2], nature: info[3] }, "unsure"), player, event);
				});
				return ui.create.dialog("挥金", [list, "vcard"]);
			},
			check(button) {
				const player = get.player();
				return player.getUseValue({
					name: button.link[2],
					nature: button.link[3],
				});
			},
			backup(links, player) {
				return {
					filterCard: true,
					check(card) {
						return 7 - get.value(card);
					},
					position: "e",
					viewAs: { name: links[0][2], nature: links[0][3] },
					async precontent(event, trigger, player) {
						player.logSkill("shhuijin");
						const { cards } = event.result;
						await player.discard({ cards });
						event.result.cards = [];
						player
							.when({ player: "useCardAfter" })
							.filter(evt => evt.getParent() == event.getParent())
							.step(async (evt, trigger, player) => {
								player.removeSkill(evt.name);
								const targets = game.filterPlayer(current => {
									if (current == player) return false;
									return current.isIn() && !player.inRange(current);
								});
								await game.asyncDraw(targets);
							});
					},
				};
			},
			prompt(links, player) {
				return "弃置装备区一张牌视为使用一张" + (get.translation(links[0][3]) || "") + get.translation(links[0][2]);
			},
		},
		ai: {
			order: 7,
			fireAttack: true,
			respondSha: true,
			respondShan: true,
			skillTagFilter(player) {
				if (!player.countCards("e")) return false;
			},
			result: {
				player(player) {
					if (_status.event.dying) return get.attitude(player, _status.event.dying);
					var num = game.countPlayer(current => {
						!player.inRange(current) && get.attitude(player, current) >= 0;
					});
					return num;
				},
			},
		},
	},
	shxuanhe: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			target: "useCardToTarget",
		},
		forced: true,
		round: 1,
		filter(event, player) {
			return event.card.name == "sha";
		},
		async content(event, trigger, player) {
			trigger.card.name = "binglinchengxiax";
			trigger.card.storage.shxuanhe = true;
			player.storage.shxuanhe_show = [];
			await player.addTempSkill("shxuanhe_show");
			player
				.when({ global: "useCardAfter" })
				.filter(evt => evt == trigger.getParent())
				.step(async (evt, trigger, player) => {
					if (player.storage.shxuanhe_show && player.storage.shxuanhe_show.length) {
						const result = await player
							.chooseBool("是否获得" + get.translation(player.storage.shxuanhe_show) + "，令喧和视为未发动过？")
							.set("ai", () => true)
							.forResult();
						if (result?.bool) {
							await player.gain(player.storage.shxuanhe_show, "gain2");
							player.refreshSkill("shxuanhe");
						}
					}
					delete player.storage.shxuanhe_show;
					player.removeSkill("shxuanhe_show");
				});
		},
		ai: {
			effect: {
				target(card, player, target, current) {
					if (card.name !== "sha") return;
					const N = 160,
						nSha = 44,
						nTrick = 50,
						nEquip = 25,
						nOther = 41;
					let remain = {
						sha: nSha,
						trick: nTrick,
						equip: nEquip,
						other: nOther,
					};
					let total = N;
					let shaCount = 0,
						trickCount = 0,
						equipCount = 0;
					for (let i = 0; i < 4; i++) {
						const r = Math.random() * total;
						if (r < remain.sha) {
							shaCount++;
							remain.sha--;
						} else if (r < remain.sha + remain.trick) {
							trickCount++;
							remain.trick--;
						} else if (r < remain.sha + remain.trick + remain.equip) {
							equipCount++;
							remain.equip--;
						} else {
							remain.other--;
						}
						total--;
					}
					const allyValue = trickCount * 1.1 + equipCount * 1.5 - Math.max(0, shaCount - 1) * 1.5;
					const attackerValue = -allyValue;
					const att = get.attitude(player, target);
					if (att > 0) {
						//game.log(player, target, allyValue - 1.8);
						return [1, allyValue - 1.8];
					} else {
						//game.log(player, target, attackerValue);
						return [1, attackerValue];
					}
				},
			},
		},
		subSkill: {
			show: {
				getcard(event, player) {
					const evt = event.getParent(evt => evt.name == "binglinchengxiax", true);
					if (!evt || !evt.showCards.length || !evt?.card?.storage?.shxuanhe) {
						return [];
					}
					return evt.showCards;
				},
				trigger: {
					global: "showCardsEnd",
				},
				charlotte: true,
				forced: true,
				filter(event, player) {
					const evt = event.getParent(evt => evt.name == "binglinchengxiax", true);
					return get.info("shxuanhe_show").getcard(event, player)?.length;
				},
				async content(event, trigger, player) {
					const evt = trigger.getParent(evt => evt.name == "binglinchengxiax", true);
					const source = evt.player;
					if (!player.storage.shxuanhe_show) player.storage.shxuanhe_show = [];
					player.storage.shxuanhe_show.addArray(
						get
							.info("shxuanhe_show")
							.getcard(trigger, player)
							.filter(c => get.type(c) != "basic")
					);
				},
				sub: true,
			},
		},
	},
	shfengheng: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		zhuSkill: true,
		forced: true,
		global: "shfengheng2",
		trigger: {
			player: ["useCard", "phaseBegin"],
		},
		filter(event, player) {
			if (event.name != "useCard") return player.group == "shsong" && !event.audioed;
			return player.group == "shsong" && !event.audioed && event.card.name == "tao" && event.card.isCard && event.cards[0] == "sha";
		},
		async content(event, trigger, player) {
			trigger.audioed = true;
		},
	},
	shfengheng2: {
		mod: {
			cardname(card, player) {
				if (card.name != "sha" || !player || player.group != "shsong") return;
				const current = _status.currentPhase;
				if (current && current.hasSkill("shfengheng")) return "tao";
			},
		},
	},
	shyufen: {
		audio: "ext:水泊娘山/character/audio/skill:3",
		trigger: {
			player: "phaseUseBegin",
		},
		forced: true,
		filter: function (event, player) {
			return player.hasUseTarget({ name: "huogong", isCard: true });
		},
		async content(event, trigger, player) {
			const targets = [];
			player.storage.shyufen = [];
			await player.addTempSkill("shyufen_show");
			for (let i = 0; i < 3; i++) {
				const result = await player
					.chooseUseTarget(
						{
							name: "huogong",
							isCard: true,
							storage: { shyufen: true },
						},
						true
					)
					.forResult();
				if (!result.bool) return;
				if (result?.targets) targets.addArray(result.targets);
			}

			if (!player?.storage?.shyufen.length) return;
			targets.sortBySeat();
			for (const target of targets.filter(current => current.isIn() && current.countCards("he"))) {
				const cards = (
					await target
						.chooseCard(
							[1, 3],
							"选择一至三张牌，按数量执行：一张，交给" + get.translation(player) + "；两张，弃置；三张，重铸并对" + get.translation(player) + "造成1点伤害",
							function (card) {
								const source = get.event().source;
								return source?.storage?.shyufen.includes(card);
							},
							"he",
							true
						)
						.set("filterOk", () => {
							const player = get.event().player;
							if (ui.selected.cards.length == 1) return true;
							if (ui.selected.cards.length == 2) {
								return ui.selected.cards.every(card => {
									return lib.filter.cardDiscardable(card, player, "shyufen");
								});
							}
							return ui.selected.cards.every(card => {
								return _status.event.player.canRecast(card);
							});
						})
						.set("ai", function (card) {
							const player = get.event().player,
								source = get.event().source;
							var val1 = get.value(card, player),
								val2 = get.color(card) == "red" ? get.value({ name: "tao" }, source) : get.value(card, source);
							if (ui.selected.cards.length == 1 && get.attitude(player, source) > 1) return 0;
							if (get.attitude(player, source) > 1) return 5.5 + val2 - val1;
							return 11 - val1 - val2;
						})
						.set("source", player)
						.forResult()
				).cards;
				if (cards && cards.length) {
					if (cards.length == 1) await target.give(cards, player);
					else if (cards.length == 2) {
						await target.discard(cards);
					} else if (cards.length == 3) {
						await player.damage(target);
						await target.recast(cards);
					}
				}
			}
			delete player.storage.shyufen;
		},
		subSkill: {
			show: {
				getcard(event, player) {
					const evt = event.getParent(evt => evt.name == "huogong", true);
					if (!evt || !evt.showResult?.cards.length || !evt?.card?.storage?.shyufen) {
						return [];
					}
					return evt.showResult?.cards;
				},
				trigger: {
					global: "showCardsEnd",
				},
				charlotte: true,
				forced: true,
				filter(event, player) {
					const evt = event.getParent(evt => evt.name == "huogong", true);
					if (!evt?.player?.storage?.shyufen) return false;
					return get.info("shyufen_show").getcard(event, player)?.length;
				},
				async content(event, trigger, player) {
					const evt = trigger.getParent(evt => evt.name == "huogong", true);
					const source = evt.player;
					if (!source.storage.shyufen) source.storage.shyufen = [];
					source.storage.shyufen.addArray(get.info("shyufen_show").getcard(trigger, player));
				},
				sub: true,
			},
		},
	},
	shyanzi: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		global: "shyanzi_global",
		trigger: {
			player: "gainAfter",
			global: "loseAsyncAfter",
		},
		forced: true,
		filter: function (event, player) {
			if (event.name == "draw" || event.getParent().name == "draw") return false;
			const hs = player.getCards("h"),
				cards = event.getg(player).filter(i => hs.includes(i) && get.color(i) == "red");
			return cards.length;
		},
		async content(event, trigger, player) {
			const hs = player.getCards("h"),
				cards = trigger.getg(player).filter(i => hs.includes(i) && get.color(i) == "red");
			if (!cards?.length) return;
			await player.addShownCards(cards, "visible_shyanzi");
		},
		mod: {
			cardname: function (card) {
				if (card.hasGaintag("visible_shyanzi")) return "tao";
			},
			cardDiscardable: function (card, player, name) {
				if (card.hasGaintag("visible_shyanzi")) return false;
			},
		},
	},
	shyanzi_global: {
		locked: true,
		enable: "chooseToUse",
		filter(event, player) {
			var skillSources = game.filterPlayer(current => current != player && current.hasSkill("shyanzi") && current.countCards("h", card => card.hasGaintag("visible_shyanzi")));
			for (var source of skillSources) {
				var cards = source.getCards("h", card => card.hasGaintag("visible_shyanzi"));
				for (var i of cards) {
					var card = get.autoViewAs(get.autoViewAs({ name: "tao" }, [i]));
					if (event.filterCard(card, player, event) && (!player.hasSkill("shyanzi_global_refused") || !player?.storage?.shyanzi_global_refused?.includes(source) || source.getRoundHistory("damage").length > 0)) return true;
				}
			}
			return false;
		},
		hiddenCard(player, name) {
			var skillSources = game.filterPlayer(current => current != player && current.hasSkill("shyanzi") && current.countCards("h", card => card.hasGaintag("visible_shyanzi")));
			for (var source of skillSources) {
				var cards = source.getCards("h", card => card.hasGaintag("visible_shyanzi"));
				for (var i of cards) {
					if (name == "tao" && (!player.hasSkill("shyanzi_global_refused") || !player?.storage?.shyanzi_global_refused?.includes(source) || source.getRoundHistory("damage").length > 0)) return true;
				}
			}
			return false;
		},
		chooseButton: {
			dialog(event, player) {
				var dialog = ui.create.dialog("艳姿", "hidden");
				var skillSources = game.filterPlayer(current => current != player && current.hasSkill("shyanzi") && current.countCards("h", card => card.hasGaintag("visible_shyanzi")));
				for (var source of skillSources) {
					var cards = source.getCards("h", card => card.hasGaintag("visible_shyanzi"));
					if (cards.length) {
						var str = '<div class="text center">';
						str += get.translation(source);
						var num = source.getSeatNum();
						if (num > 0) str += "（" + get.cnNumber(num, true) + "号位）";
						str += "</div>";
						dialog.add(str);
						dialog.add(cards);
					}
				}
				return dialog;
			},
			filter(button, player) {
				var card = get.autoViewAs({ name: "tao" }, [button.link]),
					evt = _status.event.getParent();
				return evt.filterCard(card, player, evt);
			},
			check(button) {
				if (_status.event.getParent().type != "phase") return 1;
				return _status.event.player.getUseValue("tao", null, true);
			},
			backup(links, player) {
				return {
					card: links[0],
					viewAs: get.autoViewAs({ name: "tao" }, links),
					filterCard: () => false,
					selectCard: -1,
					precontent() {
						"step 0";
						var card = lib.skill["shyanzi_global_backup"].card;
						event.card = card;
						event.result.card.name = "tao";
						event.result.cards = [card];
						event.result.card.isCard = true;
						event.source = get.owner(card);
						if (!event.result.card.storage) event.result.card.storage = {};
						//event.result.card.storage._shsuizhen_owner = event.source;
						delete event.result.skill;
						player.logSkill("shyanzi_global", event.source);
						("step 1");
						if (event.result.targets && event.result.targets.length) player.line(event.result.targets, event.result.card.nature);
						if (event.source.getRoundHistory("damage").length > 0) {
							event.goto(4);
						}
						("step 2");
						source
							.chooseButton(
								[
									"是否同意" + get.translation(player) + "使用" + get.translation(event.result.card) + "？",
									'<div class="text center">' +
										(function () {
											if (event.result.targets && event.result.targets.length) return "（目标角色：" + get.translation(event.result.targets) + "）";
											return "（无目标角色）";
										})() +
										"</div>",
									[["　　 同意 　　", "　　不同意　　"], "tdnodes"],
									"forcebutton",
								],
								true
							)
							.set("ai", button => {
								if (button.link == "　　 同意 　　") {
									if (get.attitude(_status.event.player, _status.event.requester) > 1) return 1.2 + Math.random();
									return 0;
								} else if (button.link == "　　不同意　　") {
									if (get.attitude(_status.event.player, _status.event.requester) < 0) return 1.8 + Math.random();
									return 0;
								}
								return 0;
							})
							.set("requester", player)
							.set("forceAuto", true);
						("step 3");
						if (result.links[0].indexOf("不同意") == -1) {
							source.chat("同意");
						} else if (result.links[0].indexOf("不同意") != -1) {
							source.chat("不同意");
							player.addTempSkill("shyanzi_global_refused");
							player.storage.shyanzi_global_refused.add(event.source);
							var evt = event.getParent();
							evt.goto(0);
						}
						event.finish();
						("step 4");
					},
				};
			},
		},
		ai: {
			order: 10,
			result: {
				player(player, target) {
					if (_status.event.dying) return get.attitude(player, _status.event.dying);
					return 1;
				},
			},
		},
		subSkill: {
			refused: {
				charlotte: true,
				init: function (player) {
					if (!player.storage.shyanzi_global_refused) player.storage.shyanzi_global_refused = [];
				},
				onremove: function (player, skill) {
					player.storage.shyanzi_global_refused = [];
				},
				mark: true,
				sub: true,
			},
		},
	},
	shjuluan: {
		audio: "ext:水泊娘山/character/audio/skill:3",
		init: function (player) {
			lib.onwash.push(function () {
				if (player.hasSkill("shjuluan_jishi")) {
					player.removeSkill("shjuluan_jishi");
					player.popup("举乱");
					game.log(player, "恢复了技能", "#g【举乱】");
				}
			});
		},
		unique: true,
		xushiSkill: true,
		enable: "phaseUse",
		animationColor: "soil",
		skillAnimation: true,
		selectTarget: [1, 2],
		filterTarget: true,
		filter(event, player) {
			return !player.hasSkill("shjuluan_jishi");
		},
		async contentBefore(event, trigger, player) {
			player.addSkill("shjuluan_jishi");
			const List = ["选项一"];
			let choiceList = ["对" + get.translation(event.targets) + "各造成1点伤害", "弃置" + get.translation(event.targets) + "共三张牌"];
			if (event.targets.reduce((sum, item) => sum + item.countDiscardableCards(player, "he"), 0) >= 3) List.push("选项二");
			else choiceList[1] = '<span style="opacity:0.5; ">' + choiceList[1] + "</span>";
			const result =
				List.length > 1
					? await player
							.chooseControl(List)
							.set("choiceList", choiceList)
							.set("ai", () => {
								return List[0];
							})
							.set("prompt", "请选择执行一项")
							.forResult()
					: { control: List[0] };
			const evt = event.getParent();
			evt.control = result?.control;
			evt._num = 3;
		},
		async content(event, trigger, player) {
			const evt = event.getParent();
			if (evt.control) {
				if (evt.control == "选项一") {
					event.target.damage();
				} else if (evt.control == "选项二" && evt._num > 0) {
					var min = Math.max(3 - event.targets[event.targets.length - 1].countDiscardableCards(player, "he"), 0);
					const result = await player.discardPlayerCard(event.target == event.targets[event.targets.length - 1] ? evt._num : [min, evt._num], event.target, "he", true).forResult();
					evt._num -= result?.links?.length || 0;
				}
			}
		},
		async contentAfter(event, trigger, player) {
			const evt = event.getParent();
			const players = game.filterPlayer(current => {
				if (evt.control == "选项一") return current.hp == player.hp;
				return current.countCards("h") == player.countCards("h");
			});
			for (let current of players.sortBySeat()) {
				const card = new lib.element.VCard({ name: "sha", isCard: true });
				await current.chooseUseTarget(card, true).set("addCount", false);
			}
		},
		ai: {
			order(item, player) {
				if (!player.hasValueTarget({ name: "sha" })) return 0;
				return get.order({ name: "sha" }) + 0.2;
			},
			result: {
				target(player, target) {
					return player.hp == target.hp + 1 ? -0.5 : get.damageEffect(target, player, target);
				},
			},
		},
		subSkill: {
			jishi: {
				charlotte: true,
				init: function (player) {
					player.storage.shjuluan_jishi = 0;
				},
				onremove: true,
				mark: true,
				intro: {
					markcount: function (num) {
						return (num || 0).toString();
					},
					content: "积势：造成五次伤害<br>当前进度：#/5。",
				},
				trigger: {
					source: "damageSource",
				},
				forced: true,
				popup: false,
				async content(event, trigger, player) {
					player.storage.shjuluan_jishi++;
					if (player.storage.shjuluan_jishi >= 5) {
						player.removeSkill("shjuluan_jishi");
						player.popup("举乱");
						game.log(player, "恢复了技能", "#g【举乱】");
					}
				},
				sub: true,
			},
		},
	},

	shgemang: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: ["loseAfter", "loseAsyncAfter", "cardsDiscardAfter", "equipAfter"],
		},
		filter(event, player) {
			return event.getd()?.filterInD("od")?.length > 1 && _status.currentPhase.isIn();
		},
		zhuSkill: true,
		//frequent: true,
		async cost(event, trigger, player) {
			event.result = await player
				.chooseButton(["割莽：选择获得一张牌", trigger.getd()?.filterInD("od").slice(0)])
				.set("ai", function (button) {
					return get.value(button.link, _status.event.player);
				})
				.forResult();
			if (event.result.bool) {
				event.result.cards = event.result.links;
			}
		},
		async content(event, trigger, player) {
			await player.gain(event.cards, "gain2");
			const cards = trigger.getd()?.filterInD("od").slice(0).removeArray(event.cards);
			switch (_status.currentPhase?.group) {
				case "qun": {
					if (!!player.storage.shjuluan_jishi) player.storage.shjuluan_jishi++;
					if (!!player.storage.shjuluan_jishi && player.storage.shjuluan_jishi >= 5) {
						player.removeSkill("shjuluan_jishi");
						player.popup("举乱");
						game.log(player, "恢复了技能", "#g【举乱】");
					}
					break;
				}
				case "shjin": {
					if (_status.connectMode)
						game.broadcastAll(function () {
							_status.noclearcountdown = true;
						});
					event.given_map = {};
					if (!cards.length) return;
					do {
						const { bool, links } = await player
							.chooseCardButton("割莽：请选择要分配的牌", cards.length > 0, cards, [1, cards.length])
							.set("ai", () => {
								if (ui.selected.buttons.length == 0) return 1;
								return 0;
							})
							.forResult();
						if (!bool) return;
						cards.removeArray(links);
						event.togive = links.slice(0);
						const targets = (
							await player
								.chooseTarget(
									"选择一名其他角色获得" + get.translation(links),
									function (card, player, target) {
										return target != player;
									},
									true
								)
								.set("ai", function (target) {
									var att = get.attitude(get.event().player, target);
									if (_status.event.enemy) {
										return -att;
									} else if (att > 0) {
										return att / (1 + target.countCards("h"));
									} else {
										return att / 100;
									}
								})
								.set("enemy", get.value(event.togive[0], player, "raw") < 0)
								.forResult()
						).targets;
						if (targets.length) {
							const id = targets[0].playerid,
								map = event.given_map;
							if (!map[id]) map[id] = [];

							map[id].addArray(event.togive);
						}
					} while (cards.length > 0);
					if (_status.connectMode) {
						game.broadcastAll(function () {
							delete _status.noclearcountdown;
							game.stopCountChoose();
						});
					}
					const list = [];
					for (const i in event.given_map) {
						const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
						player.line(source, "green");
						if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) player.addExpose(0.2);
						list.push([source, event.given_map[i]]);
					}
					game.loseAsync({
						gain_list: list,
						giver: player,
						animate: "gain2",
					}).setContent("gaincardMultiple");
					game.delay();
					break;
				}
			}
		},
	},

	shshuaza: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		enable: "phaseUse",
		usable: 1,
		filter(event, player) {
			return event.filterCard(get.autoViewAs({ name: "wuzhong", isCard: true }), player, event);
		},
		async content(event, trigger, player) {
			await player.chooseUseTarget(get.autoViewAs({ name: "wuzhong", isCard: true }), true);
			const targets = game
				.filterPlayer(function (current) {
					return player.inRange(current);
				})
				.sortBySeat();
			for (let target of targets) {
				const List = ["选项一"];
				let choiceList = ["令" + get.translation(player) + "摸一张牌", "视为对" + get.translation(player) + "使用【过河拆桥】"];
				if (target.canUse("guohe", player)) List.push("选项二");
				else choiceList[1] = '<span style="opacity:0.5; ">' + choiceList[1] + "</span>";
				const result =
					List.length > 1
						? await target
								.chooseControl(List)
								.set("choiceList", choiceList)
								.set("ai", () => {
									if (get.effect(get.event().source, { name: "guohe" }, get.event().player, get.event().player) > 0) return List[List.length - 1];
									return List[0];
								})
								.set("source", player)
								.set("prompt", "请选择执行一项")
								.forResult()
						: { control: List[0] };
				if (result?.control == "选项一") await player.draw();
				if (result?.control == "选项二") await target.useCard({ name: "guohe", isCard: true }, player);
			}
		},
	},
	shshouzi: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "loseAfter",
			global: "loseAsyncAfter",
		},
		//usable: 1,
		filter(event, player) {
			if (event.type != "discard" || event.getlx === false) return false;
			const evt = event.getl(player);
			return evt && evt.cards2 && evt.cards2.length;
		},
		async content(event, trigger, player) {
			const evt = trigger.getl(player);
			let result = await player.draw(2 * evt.cards2.length).forResult();
			//game.log(result?.cards);
			if (result?.cards?.length > 1) {
				player.storage.shshouzi_draw = result.cards.length / 2;
				player.addSkill("shshouzi_draw");
			}
		},
		subSkill: {
			draw: {
				trigger: {
					player: "drawBefore",
				},
				filter(event, player) {
					return event.num > 0 && player?.storage?.shshouzi_draw > 0;
				},
				forced: true,
				async content(event, trigger, player) {
					trigger.cancel();
					player.storage.shshouzi_draw--;
					if (player.storage.shshouzi_draw == 0) {
						//delete player.storage.shshouzi_draw;
						player.removeSkill("shshouzi_draw");
					}
				},
				mark: true,
				onremove: true,
				intro: {
					content: "下#次摸牌时，取消之",
				},
				sub: true,
			},
		},
	},
	shduqiu: {
		audio: "ext:水泊娘山/character/audio/skill:3",
		trigger: {
			player: ["phaseUseBegin", "damageEnd"],
		},
		charlotte: true,
		filter(event, player) {
			if (["name", "name1", "name2"].every(key => player[key] !== "sh_zhangshun")) return false;
			if (player.name === "sh_zhangshun" && !player.classList?.contains("reification")) return true;
			return player?.name2 === "sh_zhangshun" && !player.classList?.contains("reification2");
		},
		async content(event, trigger, player) {
			lib.skill.shduqiu.set(player);
		},
		set(player) {
			if (["name", "name1", "name2"].every(key => player[key] !== "sh_zhangshun")) return;
			if (!game?.reification) return;
			const card = game.createCard2("sha", "club", 1, "thunder");
			player.storage.shduqiu = card;
			card.setBackgroundImage("extension/水泊娘山/card/image/sh_zhangshun.png");
			if (player.name === "sh_zhangshun") {
				game.reification(player, { coverMain: true, coverDeputy: false });
				if (!player.storage.shyueyong) {
					game.log(player, "将", card, "（张顺）置于牌堆顶首张牌下");
					ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
					if (ui.cardPile.childElementCount > 1) ui.cardPile.insertBefore(ui.cardPile.childNodes[1], ui.cardPile.childNodes[0]);
				} else {
					game.log(player, "将", card, "（张顺）置于牌堆底首张牌上");
					ui.cardPile.insertBefore(card, ui.cardPile.childNodes[ui.cardPile.childElementCount - 1]);
				}
				player.markSkill("shfuyuan");
			} else if (player?.name2 === "sh_zhangshun") {
				game.reification(player, { coverMain: false, coverDeputy: true });
				if (!player.storage.shyueyong) {
					game.log(player, "将", card, "（副将：张顺）置于牌堆顶首张牌下");
					ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
					if (ui.cardPile.childElementCount > 1) ui.cardPile.insertBefore(ui.cardPile.childNodes[1], ui.cardPile.childNodes[0]);
				} else {
					game.log(player, "将", card, "（副将：张顺）置于牌堆底首张牌上");
					ui.cardPile.insertBefore(card, ui.cardPile.childNodes[ui.cardPile.childElementCount - 1]);
				}
				player.markSkill("shfuyuan");
			} else {
				delete player.storage.shduqiu;
			}
		},
		reset(player) {
			if (["name", "name1", "name2"].every(key => player[key] !== "sh_zhangshun")) return;
			if (!game?.unReification) return;
			if (player.name === "sh_zhangshun" && player.classList?.contains("reification")) {
				game.unReification(player, { uncoverMain: true, uncoverDeputy: false });
				player.unmarkSkill("shfuyuan");
				return;
			} else if (player?.name2 == "sh_zhangshun" && player.classList?.contains("reification2")) {
				game.unReification(player, { uncoverMain: false, uncoverDeputy: true });
				player.unmarkSkill("shfuyuan");
			}
		},
		group: ["shduqiu_use"],
		subSkill: {
			use: {
				trigger: {
					player: "useCard",
				},
				//forced: true,
				filter(event, player) {
					if (!player.storage.shduqiu || get.itemtype(player.storage.shduqiu) != "card" || ui.cardPile.hasChildNodes() == false) return false;
					const card = get.cardPile2(c => {
						return c == player.storage.shduqiu;
					});
					if (card) return card != ui.cardPile.lastChild;
					return false;
				},
				async content(event, trigger, player) {
					var i = 0;
					for (; i < ui.cardPile.childElementCount; i++) {
						if (ui.cardPile.childNodes[i] == player.storage.shduqiu) break;
					}
					if (i >= ui.cardPile.childElementCount) return;
					if (!player.storage.shyueyong) {
						if (ui.cardPile.childNodes[i] == ui.cardPile.lastChild || i >= ui.cardPile.childElementCount - 1) return;
						ui.cardPile.insertBefore(ui.cardPile.childNodes[i + 1], ui.cardPile.childNodes[i]);
					} else {
						if (ui.cardPile.childNodes[i] == ui.cardPile.firstChild || i <= 0) return;
						ui.cardPile.insertBefore(ui.cardPile.childNodes[i], ui.cardPile.childNodes[i - 1]);
					}
					player.markSkill("shfuyuan");
					const history = player.getHistory("useCard");
					var x = 0,
						color = get.color(trigger.card);
					var current = history[history.length - 1].card == trigger.card ? history.length - 2 : history.length - 1;
					while (current >= 0 && get.color(history[current].card) == color) {
						x++;
						current--;
					}
					const randomNum = Math.floor(Math.random() * 3) + 1;
					game.playAudio("..", "extension", `水泊娘山/character/audio/skill/shduqiu${randomNum}.mp3`);
					await player.draw(Math.min(3, x));
				},
				sub: true,
			},
		},
	},
	shfuyuan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			global: ["loseAfter", "loseAsyncAfter", "cardsDiscardAfter", "equipAfter", "addJudgeAfter", "addToExpansionAfter", "gainAfter"],
		},
		forced: true,
		charlotte: true,
		firstDo: true,
		priority: Infinity,
		filter(event, player) {
			if (!player.storage.shduqiu || get.itemtype(player.storage.shduqiu) != "card") return false;
			return (
				event.cards?.some(i => i == player.storage.shduqiu) ||
				event
					.getd()
					?.filterInD("od")
					?.some(j => j == player.storage.shduqiu)
			);
		},
		async content(event, trigger, player) {
			await player.showCards(player?.storage?.shduqiu);
			player.storage.shduqiu.remove();
			delete player.storage.shduqiu;
			lib.skill.shduqiu.reset(player);
			const result = await player
				.chooseTarget("对一名角色造成1点雷电伤害？")
				.set("ai", target => {
					if (target == _status.currentPhase) return 1.5 * get.damageEffect(target, _status.event.player, _status.event.player, "thunder");
					return get.damageEffect(target, _status.event.player, _status.event.player, "thunder");
				})
				.set("forced", true)
				.forResult();
			if (result.bool) {
				const target = result.targets[0];
				await target.damage("thunder");
				if (!_status.currentPhase || target != _status.currentPhase) await player.loseHp();
			}
		},
		ai: {
			combo: "shduqiu",
		},
		intro: {
			content(storage, player) {
				var i = 0;
				for (; i < ui.cardPile.childElementCount; i++) {
					if (ui.cardPile.childNodes[i] == player?.storage?.shduqiu) break;
				}
				if (i < ui.cardPile.childElementCount) return `你的武将牌在牌堆第${get.cnNumber(i + 1, true)}张`;
				return "你的武将牌未在牌堆";
			},
			markcount(storage, player) {
				var i = 0;
				for (; i < ui.cardPile.childElementCount; i++) {
					if (ui.cardPile.childNodes[i] == player?.storage?.shduqiu) break;
				}
				if (i < ui.cardPile.childElementCount) return i + 1;
				return 0;
			},
		},
		group: ["shfuyuan_update", "shfuyuan_invalid"],
		subSkill: {
			update: {
				trigger: {
					global: "gainAfter",
				},
				forced: true,
				popup: false,
				async content(event, trigger, player) {
					player.markSkill("shfuyuan");
				},
			},
			invalid: {
				trigger: {
					target: "useCardToTargeted",
				},
				forced: true,
				filter(event, player) {
					if (!player.storage.shduqiu || get.itemtype(player.storage.shduqiu) != "card") return false;
					const card = get.cardPile2(c => {
						return c == player.storage.shduqiu;
					});
					if (card) return event.targets.length == 1;
					return false;
				},
				async content(event, trigger, player) {
					var evt = trigger.getParent();
					evt.targets.length = 0;
					evt.all_excluded = true;
					game.log(evt.card, "被无效了");
				},
				ai: {
					effect: {
						target(card, player, target) {
							const zhangshun = get.cardPile2(c => {
								return target?.storage?.shduqiu && c == target.storage.shduqiu;
							});
							if (get.itemtype(card) != "vcard" || !["basic", "trick", "equip"].includes(get.type(card, "trick"))) return;
							if (zhangshun && player != target) {
								if (!ui.selected.targets.length && !["nanman", "wanjian", "wugu", "taoyuan"].includes(card.name)) return "zeroplayertarget";
								if (game.countPlayer() == 2 && ["nanman", "wanjian"].includes(card.name)) return "zeroplayertarget";
								if (target.hp < 1) return "zeroplayertarget";
							}
						},
					},
				},
			},
		},
	},
	shyueyong: {
		skillAnimation: true,
		animationColor: "water",
		limited: true,
		unique: true,
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		filter(event, player) {
			var zhu = get.zhu(player);
			return player.hasSkill("shduqiu") && !player.storage.shyueyong && (player.hp == 1 || zhu?.hp == 1);
		},
		async content(event, trigger, player) {
			player.awakenSkill(event.name);
			await player.draw(2);
			player.storage.shyueyong = true;
			player.when({ global: "roundEnd" }).step(async () => delete player.storage.shyueyong);
			player.addSkill("shyueyong2");
			player.when({ source: "dieAfter" }).step(async () => player.removeSkill("shyueyong2"));
		},
		ai: {
			combo: "shduqiu",
		},
	},
	shyueyong2: {
		charlotte: true,
		mark: true,
		intro: {
			content: "受到伤害后，若没有副将直接死亡！",
		},
		trigger: {
			player: "damageEnd",
		},
		forced: true,
		firstDo: true,
		async content(event, trigger, player) {
			if (player.name2 && player.name2?.indexOf("gz_shibing") != 0) {
				//有副将
				const name = player.name2;
				var info = lib.character[name];
				if (!info) return;
				var to = "gz_shibing" + (info[0] == "male" ? 1 : 2) + info[1];
				game.log(player, "移除了副将", "#b" + name);
				if (!lib.character[to]) {
					lib.character[to] = [info[0], info[1], 0, [], [`character:${to.slice(3, 11)}`, "unseen"]];
					lib.translate[to] = `${get.translation(info[1])}兵`;
				}
				player.reinit(name, to, false);
				player.showCharacter(1, false);
				_status.characterlist.add(name);
			} else await player.die();
		},
	},
	shsihu: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseUseBegin",
		},
		groupSkill: "shjin",
		filter(event, player) {
			return player.group == "shjin";
		},
		async cost(event, trigger, player) {
			event.result = await player
				.chooseTarget(get.prompt2(event.skill))
				.set("ai", target => {
					const player = get.player();
					if (
						player.countCards("h", card => {
							if (get.name(card) != "sha" || !player.inRange(target)) return false;
							return get.effect(target, card, player, player) > 0;
						}) > 0
					)
						return get.effect(target, { name: "sha" }, player, player);
					return get.attitude(player, target) / 10;
				})
				.forResult();
		},
		async content(event, trigger, player) {
			const { bool, numbers } = await player
				.chooseNumbers(
					[
						{
							prompt: "请选择令" + get.translation(event.targets[0]) + "摸一到三张牌，然后其等量轮内受到【杀】的伤害+1。",
							min: 1,
							max: 3,
						},
					],
					true
				)
				.set("processAI", () => {
					const player = get.player(),
						target = get.event().target;
					var num = 1;
					if (get.attitude(player, target) > 1) num += 2;
					return [num];
				})
				.set("target", event.targets[0])
				.forResult();
			if (!bool) return;
			const x = numbers[0];
			await event.targets[0].draw(x);
			lib.skill.shsihu.updateMark(event.targets[0]);
			if (!event.targets[0].storage.shsihu2) {
				event.targets[0].addSkill("shsihu2");
			}
			event.targets[0].storage.shsihu2.push(game.roundNumber + x - 1);
		},
		updateMark(player) {
			if (!player.storage.shsihu2) return;
			player.storage.shsihu2 = player.storage.shsihu2.filter(r => r >= game.roundNumber);
			if (player.storage.shsihu2.length == 0) {
				player.removeSkill("shsihu2");
				return;
			}
			player.markSkill("shsihu2");
		},
		group: ["shsihu_update", "shsihu_die"],
		subSkill: {
			update: {
				trigger: {
					global: "roundStart",
				},
				forced: true,
				popup: false,
				charlotte: true,
				async content(event, trigger, player) {
					game.players.forEach(p => {
						lib.skill.shsihu.updateMark(p);
					});
				},
				sub: true,
			},
			die: {
				trigger: {
					global: "die",
				},
				forced: true,
				filter(event, player) {
					if (player.group != "shjin" || event.player == player) return false;
					return event.player.hasSkill("shsihu2");
				},
				async content(event, trigger, player) {
					await player.changeGroup("liang");
				},
				sub: true,
			},
		},
	},
	shsihu2: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		init(player, skill) {
			player.storage.shsihu2 = [];
		},
		onremove(player, skill) {
			delete player.storage.shsihu2;
		},
		trigger: {
			player: "damageBegin3",
		},
		forced: true,
		filter(event, player) {
			return event.getParent().name == "sha";
		},
		async content(event, trigger, player) {
			var num = player.storage.shsihu2.filter(r => r >= game.roundNumber).length;
			trigger.num += num;
		},
		mark: true,
		intro: {
			content(storage, player) {
				var num = storage.filter(r => r >= game.roundNumber).length;
				return `本轮受到【杀】的伤害+${num}`;
			},
		},
	},
	shmengyuan: {
		audio: "ext:水泊娘山/character/audio/skill:2",
		trigger: {
			player: "phaseZhunbeiBegin",
		},
		async cost(event, trigger, player) {
			const list = ["出杀"];
			let choiceList = ["视为使用一张无距离限制的【杀】", "回复1点体力"];
			if (player.isDamaged()) list.push("回血");
			else choiceList[1] = '<span style="opacity:0.5; ">' + choiceList[1] + "</span>";
			list.push("cancel2");
			const result = await player
				.chooseControl(list)
				.set("prompt", get.prompt(event.skill))
				.set("choiceList", choiceList)
				.set("ai", () => {
					return list[list.length - 2];
				})
				.forResult();
			event.result = {
				bool: result.control != "cancel2",
				cost_data: result.control,
			};
		},
		async content(event, trigger, player) {
			if (event.cost_data == "出杀") {
				let card = { name: "sha", isCard: true };
				await player.chooseUseTarget(card, true, "nodistance");
			} else if (event.cost_data == "回血") {
				await player.recover();
			}
			player.addTempSkill("shmengyuan2");
			player.storage.shmengyuan2 = event.cost_data;
		},
	},
	shmengyuan2: {
		onremove(player, skill) {
			delete player.storage.shmengyuan2;
		},
		trigger: {
			player: "phaseJieshuBegin",
		},
		forced: true,
		filter(event, player) {
			const targets = [];
			player.checkHistory("useCard", evt => targets.addArray(evt.targets));
			return targets.length > 0;
		},
		async content(event, trigger, player) {
			let targetCount = {};
			player.checkHistory("useCard", function (evt) {
				evt.targets.forEach(current => {
					targetCount[current.playerid] = (targetCount[current.playerid] || 0) + 1;
				});
			});
			const maxCount = Math.max(...Object.values(targetCount), 0);
			const targets = Object.keys(targetCount)
				.filter(id => targetCount[id] === maxCount)
				.map(id => {
					return (_status.connectMode ? lib.playerOL : game.playerMap)[id];
				});
			for (const target of targets.sortBySeat()) {
				if (!target.isIn()) continue;
				if (player.group == "liang") {
					const list = ["出杀"];
					let choiceList = ["令" + get.translation(target) + "视为使用一张无距离限制的【杀】", "令" + get.translation(target) + "回复1点体力"];
					if (target.isDamaged()) list.push("回血");
					else choiceList[1] = '<span style="opacity:0.5; ">' + choiceList[1] + "</span>";
					list.push("cancel2");
					const result = await player
						.chooseControl(list)
						.set("choiceList", choiceList)
						.set("ai", () => {
							const player = get.event().player,
								tar = get.event().target;
							if (get.attitude(player, tar) < 2) return "cancel2";
							return list[list.length - 2];
						})
						.set("target", target)
						.forResult();
					if (result.control == "出杀") {
						let card = { name: "sha", isCard: true };
						await target.chooseUseTarget(card, true, "nodistance");
					} else if (result.control == "回血") {
						await target.recover();
					}
				} else if (player?.storage?.shmengyuan2 == "出杀") {
					await target.recover();
				} else {
					let card = { name: "sha", isCard: true };
					await target.chooseUseTarget(card, true, "nodistance");
				}
			}
		},
	},
	//从此处开始添加新技能
	newSkill: {},
	//测试函数
	sh_look1: {
		mark: true,
		intro: {
			mark: function (dialog, content, player) {
				if (player != game.me) return get.translation(player) + "观看牌堆中...";
				if (get.itemtype(_status.pileTop) != "card") return "牌堆顶无牌";
				var list = [];
				for (var i = 0; i < 6; i++) {
					list.push(ui.cardPile.childNodes[i]);
				}

				dialog.addSmall(list);
			},
		},
	},
	sh_look2: {
		mark: true,
		intro: {
			mark: function (dialog, content, player) {
				if (player != game.me) return get.translation(player) + "观看牌堆中...";
				if (get.itemtype(_status.pileTop) != "card") return "牌堆底无牌";
				var list = [];
				for (var i = ui.cardPile.childNodes.length - 1; i > ui.cardPile.childNodes.length - 7; i--) {
					list.push(ui.cardPile.childNodes[i]);
				}

				dialog.addSmall(list);
			},
		},
	},
	shmuban: {
		init: function (player) {
			player.storage.shmuban = 2;
		},
		trigger: {
			global: "phaseBefore",
			player: "enterGame",
		},
		forced: true,
		filter: function (event, player) {
			return event.name != "phase" || game.phaseNumber == 0;
		},
		async content(event, trigger, player) {
			const { bool, numbers } = await player
				.chooseNumbers(get.prompt2(event.name), [
					{
						prompt: "请选择X",
						min: 1,
						max: 10000,
					},
					{
						prompt: "请选择Y",
						min: 0,
						max: 100,
					},
				])
				.forResult();
			var x = numbers[0],
				y = numbers[1];
			player.storage.shmuban = y;
			var dx1 = x - player.maxHp,
				dx2 = x - player.hp;
			if (dx1 < 0) {
				await player.loseMaxHp(-1 * dx1, true);
			} else if (dx1 > 0) {
				await player.gainMaxHp(dx1, true);
			}
			if (dx2 < 0) {
				await player.loseHp(-1 * dx2);
			} else if (dx2 > 0) {
				await player.recoverTo(x);
			}
		},
		group: "shmuban_draw",
		subSkill: {
			draw: {
				trigger: {
					player: "phaseDrawBegin2",
				},
				forced: true,
				filter(event, player) {
					return !event.numFixed;
				},
				async content(event, trigger, player) {
					trigger.num = player.storage.shmuban;
				},
				sub: true,
			},
		},
	},
};
export default skills;
