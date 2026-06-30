import { lib, game, ui, get, ai, _status } from "noname";

const dynamicTranslates = {
  shlianzheng: function (player) {
    if (player.storage.shlianzheng == true)
      return '转换技，出牌阶段限一次，你可，：阳：视为使用一张【决斗】，然后于之结算完成后失去1点体力；<span class="bluetext">阴：将X张手牌当【决斗】使用，然后于你因之造成伤害后摸两张牌（X为你本回合造成过的伤害值+1）。</span>当你和体力值大于你的角色【决斗】胜利后，你重置本回合〖连征〗发动次数。';
    return '转换技，出牌阶段限一次，你可，<span class="firetext">阳：视为使用一张【决斗】，然后于之结算完成后失去1点体力；</span>阴：将X张手牌当【决斗】使用，然后于你因之造成伤害后摸两张牌（X为你本回合造成过的伤害值+1）。当你和体力值大于你的角色【决斗】胜利后，你重置本回合〖连征〗发动次数。';
  },
  shfuxing: function (player) {
    var storage = player.storage.shfuxing;
    if ((storage || 0) % 2)
      return '转换技，限定技，你可视为使用，阳：【杀】；<span class="bluetext">阴：【酒】。</span>然后重置〖求闲〗。';
    return '转换技，限定技，你可视为使用，<span class="firetext">阳：【杀】；</span>阴：【酒】。然后重置〖求闲〗。';
  },
  shqiuxian: function (player) {
    var storage = player.storage.shqiuxian;
    if ((storage || 0) % 2)
      return '转换技，限定技，你可视为使用，阳：【闪】；<span class="bluetext">阴：【桃】。</span>然后重置〖福星〗。';
    return '转换技，限定技，你可视为使用，<span class="firetext">阳：【闪】；</span>阴：【桃】。然后重置〖福星〗。';
  },
  shhongchong: function (player) {
    var storage = player.storage.shhongchong;
    var num = (storage || 0) % 3;
    if (num == 0)
      return '转换技，锁定技，准备阶段，若你未装备有:<span class="bluetext">①【风火炮】；</span>②【金轮炮】；③【子母炮】，你从游戏外获得之并将之置入装备区。且这些牌离开你的装备区后移出游戏。';
    if (num == 1)
      return '转换技，锁定技，准备阶段，若你未装备有:①【风火炮】；<span class="bluetext">②【金轮炮】；</span>③【子母炮】，你从游戏外获得之并将之置入装备区。且这些牌离开你的装备区后移出游戏。';
    return '转换技，锁定技，准备阶段，若你未装备有:①【风火炮】；②【金轮炮】；<span class="bluetext">③【子母炮】，</span>你从游戏外获得之并将之置入装备区。且这些牌离开你的装备区后移出游戏。';
  },
  shpixian: function (player) {
    var storage = player.storage.shpixian;
    var num = (storage || 0) % 3;
    if (num == 0)
      return '转换技，出牌阶段，你可和座次小于你的角色交换:<span class="bluetext">①手牌；</span>②装备；③座次。若你以此法交换座次或交换牌差不小于三，〖辟险〗失效至你进入濒死状态。';
    if (num == 1)
      return '转换技，出牌阶段，你可和座次小于你的角色交换:①手牌；<span class="bluetext">②装备；</span>③座次。若你以此法交换座次或交换牌差不小于三，〖辟险〗失效至你进入濒死状态。';
    return '转换技，出牌阶段，你可和座次小于你的角色交换:①手牌；②装备；<span class="bluetext">③座次。</span>若你以此法交换座次或交换牌差不小于三，〖辟险〗失效至你进入濒死状态。';
  },
  shsixing: function (player) {
    var num = player.storage.shsixing;
    if (num == 2)
      return "其他角色进入濒死状态时，你可获得其区域内任意张牌，若如此做，当其脱离濒死状态时，你需交给其等量张牌。";
    return "一名场上有牌的其他角色判定阶段开始时，你可对其造成1点伤害，若如此做，当其本回合对你造成伤害后，其回复1点体力。";
  },
  shjijiu: function (player) {
    var suit = get.suit(player.getExpansions("shbinhua")[0], false);
    if (lib.suit.includes(suit))
      return (
        "你的回合外，你可将一张" + get.translation(suit) + "牌当做【桃】使用。"
      );
    return "你的回合外，你可将一张红色牌当做【桃】使用。";
  },
  shwoxuan: function (player) {
    if (player.storage.shwoxuan == true)
      return '转换技，阳：其他角色出牌阶段结束时，其可交给你任意张牌，若不多于两张，不转换〖斡旋〗；<span class="bluetext">阴：出牌阶段开始时，你可将任意张牌交给一名其他角色，令一名角色回复1点体力并复原武将牌，若不少于两张，不转换〖斡旋〗。</span>';
    return '转换技，<span class="firetext">阳：其他角色出牌阶段结束时，其可交给你任意张牌，若不多于两张，不转换〖斡旋〗；</span>阴：出牌阶段开始时，你可将任意张牌交给一名其他角色，令一名角色回复1点体力并复原武将牌，若不少于两张，不转换〖斡旋〗。';
  },
  shenyu: function (player) {
    if (player.storage.shenyu == true)
      return "蓄势技，其他角色的回合结束时，你可将任意张类型不同的牌交给该角色并令其摸等量牌。若多于一张，你摸一张牌或回复1点体力；多于两张，其执行一个额外回合。";
    return "其他角色的回合结束时，你可将任意张类型不同的牌交给该角色并令其摸等量牌。若多于一张，你摸一张牌或回复1点体力；多于两张，其执行一个额外回合，然后〖恩予〗改为蓄势技。";
  },
  shhufen: function (player) {
    if (player.storage.shhufen == true)
      return '转换技，锁定技，出牌阶段开始或结束时，你须获得场上一张装备牌，然后对，阳：攻击范围内；<span class="bluetext">阴：攻击范围外</span>一名角色造成1点伤害。';
    return '转换技，锁定技，出牌阶段开始或结束时，你须获得场上一张装备牌，然后对，<span class="firetext">阳：攻击范围内</span>；阴：攻击范围外一名角色造成1点伤害。';
  },
  shxiongju: function (player) {
    return (
      "出牌阶段限一次，你可令你攻击范围内至多" +
      get.cnNumber(player.storage.shxiongju) +
      "名角色各弃置一张牌，然后你视为对所有未弃置【杀】的角色依次使用一张【决斗】。你因此【决斗】进入濒死状态时，你令〖雄据〗可选角色数-1，然后将体力回复至1点。"
    );
  },
  shtalang: function (player) {
    var storage = player.storage.shtalang;
    var num = (storage || 0) % 4;
    if (num == 0)
      return '转换技，你可<span class="bluetext">将一张不为本回合获得的牌当①【顺手牵羊】</span>②【顺手牵羊】③【顺手牵羊】④将一张为本回合获得的牌当【出其不意】使用。周始：你翻面。';
    if (num == 1)
      return '转换技，你可<span class="bluetext">将一张不为本回合获得的牌当</span>①【顺手牵羊】<span class="bluetext">②【顺手牵羊】</span>③【顺手牵羊】④将一张为本回合获得的牌当【出其不意】使用。周始：你翻面。';
    if (num == 2)
      return '转换技，你可<span class="bluetext">将一张不为本回合获得的牌当</span>①【顺手牵羊】②【顺手牵羊】<span class="bluetext">③【顺手牵羊】</span>④将一张为本回合获得的牌当【出其不意】使用。周始：你翻面。';
    return '转换技，你可将一张不为本回合获得的牌当①【顺手牵羊】②【顺手牵羊】③【顺手牵羊】<span class="bluetext">④将一张为本回合获得的牌当【出其不意】使用。</span>周始：你翻面。';
  },
  shzuojun: function (player) {
    if (player.storage.shzhuying == true)
      return "出牌或弃牌阶段开始时，你可将至多三张基本牌当指定等量角色的【杀】使用，此【杀】每造成1点伤害，你摸一张牌。";
    return "出牌或弃牌阶段开始时，你可将至多三张基本牌当指定等量角色的【杀】使用，此【杀】每造成1点伤害，你获得一张【影】。";
  },
  shyoubing: function (player) {
    if (!player.storage.shyoubing)
      return "锁定技，回合开始时，你将已损失体力值分配入<>中。你的攻击范围+<>；你使用【杀】可额外指定<>名目标；你的摸牌阶段摸牌数+<>。";
    return (
      '锁定技，回合开始时，你将已损失体力值分配入<>中。你的攻击范围+<<span class="bluetext">' +
      player.storage.shyoubing[0] +
      '</span>>；你使用【杀】可额外指定<<span class="bluetext">' +
      player.storage.shyoubing[1] +
      '</span>>名目标；你的摸牌阶段摸牌数+<<span class="bluetext">' +
      player.storage.shyoubing[2] +
      "</span>>。"
    );
  },
  shqizhen: function (player) {
    var sub = [
      "①",
      "②",
      "③",
      "④",
      "⑤",
      "⑥",
      "⑦",
      "⑧",
      "⑨",
      "⑩",
      "⑪",
      "⑫",
      "⑬",
      "⑭",
      "⑮",
      "⑯",
      "⑰",
      "⑱",
      "⑲",
      "⑳",
      "㉑",
      "㉒",
      "㉓",
      "㉔",
      "㉕",
      "㉖",
      "㉗",
      "㉘",
      "㉙",
      "㉚",
    ];
    var str1 =
      "转换技，你可将任意张点数和为当前序号倍数的牌置于牌堆两端，视为使用一张：";
    var str2 =
      "。且每转换完一轮，便在末尾添加一个你未持有的基本牌或普通锦囊牌转换项；游戏每过一轮，便可重新分配转换项的次序。";
    for (var i = 0; i < player.storage.shqizhen_opqueue.length; i++) {
      var x =
        sub[i] +
        "【" +
        get.translation(player.storage.shqizhen_opqueue[i]) +
        "】" +
        (i < player.storage.shqizhen_opqueue.length - 1 ? "；" : "");
      if (
        i ==
        (player.storage.shqizhen || 0) % player.storage.shqizhen_subnum
      ) {
        x = '<span class="bluetext">' + x + "</span>";
      }
      str1 += x;
    }
    return str1 + str2;
  },
  shduwo: function (player) {
    var str = ["", "", "", ""],
      i = Math.max(0, [["①", "②", "③"].indexOf(player?._shduwo_mark?.name)]);
    var f = function (i) {
      if (player?.storage?.shduwo_locked[i]) return "仅能";
      return "可以";
    };
    ((str[0] =
      `${get.poptip("rule_zhuanhuaji")}，锁定技，你手牌中点数不小于9的牌<u>${f(0)}</u>当：<br>` +
      `<span class="bluetext">① 【桃】使用——<u>${f(1)}</u>指定其他角色；</span><br>` +
      `② 【酒】使用——<u>${f(2)}</u>在濒死时使用；<br>` +
      `③ 【杀】使用——无视目标角色防具。<br>` +
      `转机：你使用与当前项不同的基本牌时，转换至对应项并解除第X个“仅能”限制（X为该项序号），然后若均解除，你删去“转化技”标签和此句。`),
      (str[1] =
        `${get.poptip("rule_zhuanhuaji")}，锁定技，你手牌中点数不小于9的牌<u>${f(0)}</u>当：<br>` +
        `① 【桃】使用——<u>${f(1)}</u>指定其他角色；<br>` +
        `<span class="bluetext">② 【酒】使用——<u>${f(2)}</u>在濒死时使用；</span><br>` +
        `③ 【杀】使用——无视目标角色防具。<br>` +
        `转机：你使用与当前项不同的基本牌时，转换至对应项并解除第X个“仅能”限制（X为该项序号），然后若均解除，你删去“转化技”标签和此句。`),
      (str[2] =
        `${get.poptip("rule_zhuanhuaji")}，锁定技，你手牌中点数不小于9的牌<u>${f(0)}</u>当：<br>` +
        `① 【桃】使用——<u>${f(1)}</u>指定其他角色；<br>` +
        `② 【酒】使用——<u>${f(2)}</u>在濒死时使用；<br>` +
        `<span class="bluetext">③ 【杀】使用——无视目标角色防具。</span><br>` +
        `转机：你使用与当前项不同的基本牌时，转换至对应项并解除第X个“仅能”限制（X为该项序号），然后若均解除，你删去“转化技”标签和此句。`),
      (str[3] =
        `锁定技，你手牌中点数不小于9的牌<u>可以</u>当：<br>` +
        `① 【桃】使用——可以指定其他角色；<br>` +
        `② 【酒】使用——可以在濒死时使用；<br>` +
        `③ 【杀】使用——无视目标角色防具。<br>`));
    if (player.storage.shduwo) return str[3];
    return str[i];
  },
  shdianzhen: function (player) {
    if (!player.storage.shdianzhen)
      return "出牌阶段限一次，你可令一名你所属势力角色从牌堆检索一张【杀】，且你/其各可使用一张途中亮出的锦囊牌/装备牌。";
    return (
      "出牌阶段限" +
      get.cnNumber(1 + player.storage.shdianzhen) +
      "次，你可令一名你所属势力角色从牌堆检索一张【杀】，且你/其各可使用一张途中亮出的锦囊牌/装备牌。"
    );
  },
  shyidan: function (player) {
    var names = player.storage.shyidan;
    if (!player.storage.shyidan)
      "每轮每项限一次，你可以：①明置一张【杀】；②弃置一张【闪】；③分配一张【酒】，并视为使用【桃】。每轮结束时，若你本轮造成过伤害，你可以重新分配上述基本牌的位置。";
    return `每轮每项限一次，你可以：①明置一张【${get.translation(names[0])}】；②弃置一张【${get.translation(names[1])}】；③分配一张【${get.translation(names[2])}】，并视为使用【${get.translation(names[3])}】。每轮结束时，若你本轮造成过伤害，你可以重新分配上述基本牌的位置。`;
  },
};

export default dynamicTranslates;
