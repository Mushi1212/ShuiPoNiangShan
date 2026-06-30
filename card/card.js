import { lib, game, ui, get, ai, _status } from "noname";
const liangcards = {
  yihuajiemux: {
    type: "trick",
    fullskin: true,
    image: "ext:水泊娘山/card/image/yihuajiemux.png",
    enable: true,
    filterTarget(card, player, target) {
      return target != player && target.countCards("he");
    },
    content() {
      "step 0";
      if (target.hasSha()) {
        target.chooseToUse(
          function (card, player, event) {
            return (
              get.name(card) == "sha" &&
              lib.filter.filterCard.apply(this, arguments)
            );
          },
          "使用一张杀，或交给" + get.translation(player) + "两张牌",
        );
      } else {
        event.directfalse = true;
      }
      ("step 1");
      var nh = target.countCards("he");
      if ((event.directfalse || !result.bool) && nh) {
        if (nh <= 2) {
          event.directcards = true;
        } else {
          target.chooseCard(
            "he",
            2,
            true,
            "将两张牌交给" + get.translation(player),
          );
        }
      } else {
        event.finish();
      }
      ("step 2");
      if (event.directcards) {
        target.give(target.getCards("he"), player);
      } else if (result.bool && result.cards && result.cards.length) {
        target.give(result.cards, player);
      }
    },
    ai: {
      order: 7,
      result: {
        target(player, target) {
          if (target.hasSha() && _status.event.getRand() < 0.5) {
            return 1;
          }
          return -2;
        },
      },
    },
  },
  sadouchengbingx: {
    fullskin: true,
    type: "trick",
    enable: true,
    selectTarget: -1,
    cardcolor: "red",
    toself: true,
    image: "ext:水泊娘山/card/image/sadouchengbingx.png",
    filterTarget(card, player, target) {
      return target == player;
    },
    modTarget: true,
    content() {
      var num = Math.min(5, target.maxHp);
      if (target.group == "shen") {
        target.draw(num);
      } else {
        var nh = target.countCards("h");
        if (nh < num) {
          target.draw(num - nh);
        }
      }
    },
    ai: {
      basic: {
        order: 7.2,
        useful: 4.5,
        value: 9.2,
      },
      result: {
        target(player, target) {
          var num = Math.min(5, target.maxHp);
          if (target.group == "shen") {
            return Math.sqrt(num);
          } else {
            var nh = target.countCards("h");
            if (target == player && player.countCards("h", "sadouchengbing")) {
              nh--;
            }
            if (nh < num) {
              return Math.sqrt(num - nh);
            }
          }
          return 0;
        },
      },
      tag: {
        draw: 2,
      },
    },
  },
  shdiangangqiang: {
    fullskin: true,
    //derivation: 'sh_tanglong',
    image: "ext:水泊娘山/card/image/shdiangangqiang.png",
    type: "equip",
    subtype: "equip1",
    distance: { attackFrom: -2 },
    skills: ["shdiangangqiang_skill"],
    ai: {
      basic: {
        equipValue: 8,
        order: (card, player) => {
          const equipValue = get.equipValue(card, player) / 20;
          return player && player.hasSkillTag("reverseEquip")
            ? 8.5 - equipValue
            : 8 + equipValue;
        },
        useful: 2,
        value: (card, player, index, method) => {
          if (
            !player.getCards("e").includes(card) &&
            !player.canEquip(card, true)
          )
            return 0.01;
          const info = get.info(card),
            current = player.getEquip(info.subtype),
            value = current && card != current && get.value(current, player);
          let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
          if (typeof equipValue == "function") {
            if (method == "raw") return equipValue(card, player);
            if (method == "raw2") return equipValue(card, player) - value;
            return Math.max(0.1, equipValue(card, player) - value);
          }
          if (typeof equipValue != "number") equipValue = 0;
          if (method == "raw") return equipValue;
          if (method == "raw2") return equipValue - value;
          return Math.max(0.1, equipValue - value);
        },
      },
      result: {
        target: (player, target, card) =>
          get.equipResult(player, target, card.name),
      },
    },
    enable: true,
    selectTarget: -1,
    filterTarget: (card, player, target) =>
      player == target && target.canEquip(card, true),
    modTarget: true,
    allowMultiple: false,
    content: function () {
      if (cards.length && get.position(cards[0], true) == "o")
        target.equip(cards[0]);
    },
    toself: true,
  },
  shpodao: {
    fullskin: true,
    //derivation: 'sh_tanglong',
    image: "ext:水泊娘山/card/image/shpodao.png",
    type: "equip",
    subtype: "equip1",
    distance: { attackFrom: -1 },
    skills: ["shpodao_skill"],
    ai: {
      basic: {
        equipValue: 7,
        order: (card, player) => {
          const equipValue = get.equipValue(card, player) / 20;
          return player && player.hasSkillTag("reverseEquip")
            ? 8.5 - equipValue
            : 8 + equipValue;
        },
        useful: 2,
        value: (card, player, index, method) => {
          if (
            !player.getCards("e").includes(card) &&
            !player.canEquip(card, true)
          )
            return 0.01;
          const info = get.info(card),
            current = player.getEquip(info.subtype),
            value = current && card != current && get.value(current, player);
          let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
          if (typeof equipValue == "function") {
            if (method == "raw") return equipValue(card, player);
            if (method == "raw2") return equipValue(card, player) - value;
            return Math.max(0.1, equipValue(card, player) - value);
          }
          if (typeof equipValue != "number") equipValue = 0;
          if (method == "raw") return equipValue;
          if (method == "raw2") return equipValue - value;
          return Math.max(0.1, equipValue - value);
        },
      },
      result: {
        target: (player, target, card) =>
          get.equipResult(player, target, card.name),
      },
    },
    enable: true,
    selectTarget: -1,
    filterTarget: (card, player, target) =>
      player == target && target.canEquip(card, true),
    modTarget: true,
    allowMultiple: false,
    content: function () {
      if (cards.length && get.position(cards[0], true) == "o")
        target.equip(cards[0]);
    },
    toself: true,
  },
  shgoulianqiang: {
    fullskin: true,
    derivation: "sh_xuning",
    image: "ext:水泊娘山/card/image/shgoulianqiang.png",
    type: "equip",
    subtype: "equip1",
    distance: { attackFrom: -2 },
    skills: ["shgoulianqiang_skill"],
    ai: {
      basic: {
        equipValue: function (card, player) {
          if (player.hasSkill("shluanji")) return 30;
          return 5;
        },
        order: (card, player) => {
          const equipValue = get.equipValue(card, player) / 20;
          return player && player.hasSkillTag("reverseEquip")
            ? 8.5 - equipValue
            : 8 + equipValue;
        },
        useful: 2,
        value: (card, player, index, method) => {
          if (
            !player.getCards("e").includes(card) &&
            !player.canEquip(card, true)
          )
            return 0.01;
          const info = get.info(card),
            current = player.getEquip(info.subtype),
            value = current && card != current && get.value(current, player);
          let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
          if (typeof equipValue == "function") {
            if (method == "raw") return equipValue(card, player);
            if (method == "raw2") return equipValue(card, player) - value;
            return Math.max(0.1, equipValue(card, player) - value);
          }
          if (typeof equipValue != "number") equipValue = 0;
          if (method == "raw") return equipValue;
          if (method == "raw2") return equipValue - value;
          return Math.max(0.1, equipValue - value);
        },
      },
      result: {
        target: (player, target, card) =>
          get.equipResult(player, target, card.name),
      },
    },
    enable: true,
    selectTarget: -1,
    filterTarget: (card, player, target) =>
      player == target && target.canEquip(card, true),
    modTarget: true,
    allowMultiple: false,
    content: function () {
      if (cards.length && get.position(cards[0], true) == "o")
        target.equip(cards[0]);
    },
    toself: true,
  },
  shsaitangni: {
    fullskin: true,
    derivation: "sh_xuning",
    image: "ext:水泊娘山/card/image/shsaitangni.png",
    type: "equip",
    subtype: "equip2",
    skills: ["shsaitangni_skill"],
    ai: {
      basic: {
        equipValue: 50,
        order: (card, player) => {
          const equipValue = get.equipValue(card, player) / 20;
          return player && player.hasSkillTag("reverseEquip")
            ? 8.5 - equipValue
            : 8 + equipValue;
        },
        useful: 2,
        value: (card, player, index, method) => {
          if (
            !player.getCards("e").includes(card) &&
            !player.canEquip(card, true)
          )
            return 0.01;
          const info = get.info(card),
            current = player.getEquip(info.subtype),
            value = current && card != current && get.value(current, player);
          let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
          if (typeof equipValue == "function") {
            if (method == "raw") return equipValue(card, player);
            if (method == "raw2") return equipValue(card, player) - value;
            return Math.max(0.1, equipValue(card, player) - value);
          }
          if (typeof equipValue != "number") equipValue = 0;
          if (method == "raw") return equipValue;
          if (method == "raw2") return equipValue - value;
          return Math.max(0.1, equipValue - value);
        },
      },
      result: {
        target: (player, target, card) =>
          get.equipResult(player, target, card.name),
      },
    },
    filterLose: function (card, player) {
      if (player.hasSkillTag("unequip2")) return false;
      return true;
    },
    loseDelay: false,
    onLose: function () {
      var next = game.createEvent("shsaitangni");
      event.next.remove(next);
      var evt = event.getParent();
      if (evt.getlx === false) evt = evt.getParent();
      evt.after.push(next);
      next.player = player;
      next.setContent(lib.card.shsaitangni.onLosex);
    },
    onLosex: function () {
      if (0 - player.hujia < 0) player.changeHujia(0 - player.hujia);
    },
    enable: true,
    selectTarget: -1,
    filterTarget: (card, player, target) =>
      player == target && target.canEquip(card, true),
    modTarget: true,
    allowMultiple: false,
    content: function () {
      if (cards.length && get.position(cards[0], true) == "o")
        target.equip(cards[0]);
    },
    toself: true,
  },
};
const cardTranslates = {
  sadouchengbingx: "撒豆成兵",
  sadouchengbingx_info:
    "出牌阶段对自己使用，若你的势力为“神”，摸X张牌；否则将你手牌补至X；（X为你的体力上限且至多为5）。",
  yihuajiemux: "移花接木",
  yihuajiemux_info:
    "出牌阶段对一名有牌的其他角色使用，令其使用一张【杀】，或交给你两张牌。",
  shdiangangqiang: "浑铁点钢枪",
  shdiangangqiang_info:
    "锁定技，你使用的【杀】无视目标防具且不能被【闪】抵消。",
  shpodao: "朴刀",
  shpodao_info:
    "出牌阶段，你可以多出一张【杀】；你于出牌阶段内使用的第二张【杀】伤害+1。",
  shgoulianqiang: "钩镰枪",
  shgoulianqiang_info:
    "你使用黑色/红色【杀】指定目标后，你可以横置/重置其武将牌，然后弃置其一张牌/对其造成1点伤害。",
  shsaitangni: "赛唐猊",
  shsaitangni_info:
    "锁定技，你装备区的牌不能被弃置。回合开始时，你进行判定，若结果为红桃，你获得1点护甲；当此装备离开你的装备区后，你失去所有护甲。",
  shxuantianhunyuanjian: "玄天混元剑",
  shxuantianhunyuanjian_info:
    "转换技，阳：你的【杀】可以当【过河拆桥】使用。阴：你的锦囊牌可以当雷【杀】使用。你以此法使用牌时，“包道乙”摸一张牌。",
};
export { liangcards, cardTranslates };
