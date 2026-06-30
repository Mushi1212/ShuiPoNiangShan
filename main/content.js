import {
  lib,
  game,
  ui,
  get,
  ai,
  _status,
} from "noname";
import * as CUSTOM from "../src/custom.js";

export function content(config, pack) {
  game.addGroup("liang", "梁", {
    color: "#F5AD38",
    image: "ext:水泊娘山/main/image/group/liang.png",
  });
  lib.translate.liang2 = "梁山好汉";
  lib.translate.group_liang = "梁势力";
  lib.translate.group_liang_bg = "梁";
  game.addGroup("shsong", "宋", {
    color: "#8B008B",
    image: "ext:水泊娘山/main/image/group/shsong.png",
  });
  lib.translate.shsong2 = "大宋";
  lib.translate.group_shsong = "宋势力";
  lib.translate.group_shsong_bg = "宋";
  game.addGroup("shchu", "楚", {
    color: "#FF6200",
    image: "ext:水泊娘山/main/image/group/shchu.png",
  });
  lib.translate.shchu2 = "淮西楚国";
  lib.translate.group_shchu = "楚势力";
  lib.translate.group_shchu_bg = "楚";
  game.addGroup("shliao", "辽", {
    color: "#00FFFF",
    image: "ext:水泊娘山/main/image/group/shliao.png",
  });
  lib.translate.shliao2 = "辽国";
  lib.translate.group_shliao = "辽势力";
  lib.translate.group_shliao_bg = "辽";
  game.addGroup("shjin", "晉", {
    color: "#5a4711",
    image: "ext:水泊娘山/main/image/group/shjin.png",
  });
  lib.translate.shjin2 = "河北";
  lib.translate.group_shjin = "晉势力";
  lib.translate.group_shjin_bg = "晉";
  game.addGroup("shnan", "南", {
    color: "#B22222",
    image: "ext:水泊娘山/main/image/group/shnan.png",
  });
  lib.translate.shnan2 = "南方";
  lib.translate.group_shnan = "南势力";
  lib.translate.group_shnan_bg = "南";

  lib.translate.visible_shjiepeng = "解烹";
  lib.translate.shlingchen_backup = "凌尘";
  lib.translate.visible_shguzhi = "志";
  lib.translate.visible_shxuxun = "虚勋";
  lib.translate.visible_shdiaoman = "刁蛮";
  lib.translate.visible_shjiaolan = "搅澜";
  lib.translate.visible_shyidan = "义胆";
  lib.translate.shtalang_tag = "踏浪";
  lib.translate.visible_shjiaojiao = "皎皎";
  lib.translate.visible_shfangyin = "芳吟";
  lib.translate.shweizhan_tag1 = "威斩-1次";
  lib.translate.shweizhan_tag2 = "威斩-2次";
  lib.translate.visible_shyanzi = "艳姿";
  lib.poptip.add({
    id: "rule_xushiSkill",
    name: "蓄势技",
    info: "使用此标签的技能可看做限定技，但可以通过牌堆洗切或积势后的条件重置技能的发动次数。此标签定义兼容3d版本蓄势技的原始定义，如无写明积势，默认为：“出牌阶段限一次，弃置三张牌”。",
  });
  lib.poptip.add({
    id: "rule_zhuanhuaji",
    name: "转化技",
    info: "使用此标签的技能具有两至多种不同的技能状态，不同于转换技之处在于发动技能不会自动转换技能状态。通常配合“转机：XXX”使用，转机后写明由某一状态转换至下一状态所需的条件。",
  });
  lib.poptip.add({
    id: "rule_sameboatSkill",
    name: "同舟技",
    info: "以下将拥有使用此标签技能的角色称为技能拥有者，则有：①技能拥有者处于某一舟时，同舟的所有角色均可发动此技能；②当技能拥有者不处于某一舟时，自己也不能发动此技能。",
  });
  lib.poptip.add({
    id: "rule_sameboat",
    name: "同舟",
    info: "若存在一组座次连续的横置角色，且再加入场上任意不属于该组的角色后，均不再满足上述条件，则称这些角色组成一舟。若若干角色（至少一名角色）组成一舟，则互相之间称为与对方同舟，且自己也与自己同舟。",
  });
  lib.poptip.add({
    id: "rule_search",
    name: "检索",
    info: "从牌堆检索一张X，即从牌堆顶亮出一张牌，若不为X，则重复此流程；否则获得之。",
  });
  lib.poptip.add({
    id: "rule_centralDisCards",
    name: "中央区",
    info: "本回合进入了弃牌堆且仍在弃牌堆的牌所构成的集合，是弃牌堆的一个子集。",
  });

  //普通
  lib.rank.rarity.junk.add(...["sh_kongming", "sh_kongliang"]);
  //精品
  lib.rank.rarity.rare.add(
    ...[
      "sh_songqing",
      "sh_zhugui",
      "sh_dengfei",
      "sh_zhoutong",
      "sh_oupeng",
      "sh_sunerniang",
      "sh_husanniang",
      "sh_yuehe",
      "sh_yubaosi",
      "sh_tanglong",
      "sh_duanjingzhu",
      "sh_shiqian",
      "sh_wangdingliu",
      "sh_zhufu",
      "sh_shantinggui",
      "sh_weidingguo",
      "sh_lingzhen",
      "sh_yanglin",
      "sh_caifu",
      "sh_taozongwang",
      "sh_caiqing",
      "sh_lili",
      "sh_wangying",
      "sh_zhengtianshou",
      "sh_yanshun",
      "sh_houjian",
      "sh_zouyuan",
      "sh_zourun",
      "sh_jiaoting",
      "sh_tongwei",
      "sh_tongmeng",
      "sh_shiyong",
      "sh_baisheng",
      "sh_sunxin",
      "sh_mengkang",
      "sh_liyun",
      "sh_yanpoxi",
      "sh_lvfang",
      "sh_guosheng",
      "sh_ximenqing",
      "sh_hongxin",
      "sh_gongwang",
      "sh_dingdesun",
      "sh_xueyong",
      "sh_huangfuduan",
      "sh_duansanniang",
      "sh_andaoquan",
      "sh_duxing",
      "sh_lishishi",
      "sh_lizhong",
    ],
  );
  //史诗
  lib.rank.rarity.epic.add(
    ...[
      "sh_muchun",
      "sh_malin",
      "sh_baoxu",
      "sh_shixiu",
      "sh_xiaorang",
      "sh_peixuan",
      "sh_jiangjing",
      "sh_huangxin",
      "sh_sunli",
      "sh_haosiwen",
      "sh_pengqi",
      "sh_hantao",
      "sh_liutang",
      "sh_wuyong",
      "sh_caozheng",
      "sh_daizong",
      "sh_muhong",
      "sh_zhangheng",
      "sh_likui",
      "sh_zhangqing",
      "sh_zhuwu",
      "sh_suochao",
      "sh_ruanxiaoer",
      "sh_ruanxiaowu",
      "sh_shien",
      "sh_zhangqing2",
      "sh_xuning",
      "sh_yangzhi",
      "sh_zhutong",
      "sh_gudasao",
      "sh_yangxiong",
      "sh_wanglun",
      "sh_leiheng",
      "sh_jindajian",
      "sh_lijun",
      "sh_xuanzan",
      "sh_zhuzhuzhu",
      "sh_xiezhen",
      "sh_xiebao",
      "sh_chaijin",
      "sh_zhangshun",
      "sh_fanrui",
      "sh_caijing",
      "sh_ruanxiaoqi",
      "sh_lizhu",
      "sh_liying",
      "sh_yanqing",
      "sh_tongguan",
      "sh_shijin",
      "sh_koumie",
      "sh_baodaoyi",
      "sh_huarong",
      "sh_gaoqiu",
      "sh_yangxiong",
      "sh_dalibo",
      "sh_yangjian",
      "sh_panqiaoyun",
      "sh_qiuqiongying",
      "sh_zhaoji",
    ],
  );
  //传说
  lib.rank.rarity.legend.add(
    ...[
      "sh_songjiang",
      "sh_huyanzhuo",
      "sh_dongping",
      "sh_chaogai",
      "sh_wuyanguang",
      "sh_qinming",
      "sh_bianxiang",
      "sh_luzhishen",
      "sh_shibao",
      "sh_qiaodaoqing",
      "sh_yelvhui",
      "sh_gongsunsheng",
      "sh_jiutianxuannv",
      "sh_zengzengzengzengzeng",
      "sh_guansheng",
      "sh_pangwanchun",
      "sh_tianhu",
    ],
  );

  if (lib.config.extension_水泊娘山_centralDis) {
    ui.click.cardPileButton = function () {
      var uiintro = ui.create.dialog("hidden");
      uiintro.listen(function (e) {
        e.stopPropagation();
      });
      var num;
      if (game.online) {
        num = _status.cardPileNum || 0;
      } else {
        num = ui.cardPile.childNodes.length;
      }
      uiintro.add('剩余 <span style="font-family:' + "xinwei" + '">' + num);
      if (_status.connectMode) return uiintro;
      uiintro.add(
        '<div class="text center">轮数 <span style="font-family:xinwei">' +
          game.roundNumber +
          '</span>&nbsp;&nbsp;&nbsp;&nbsp;洗牌 <span style="font-family:xinwei">' +
          game.shuffleNumber +
          "</div>",
      );
      uiintro.add('<div class="text center">中央区</div>');
      var list2 = [];
      game.getGlobalHistory("cardMove", function (evt) {
        if (evt.name != "cardsDiscard") {
          if (evt.name != "lose" || evt.position != ui.discardPile)
            return false;
        }
        for (var i of evt.cards.filter(
          (card) => get.position(card, true) == "d",
        )) {
          list2.unshift(i);
        }
      });
      if (list2.length) uiintro.addSmall([list2, "card"]);
      else
        uiintro.add(
          '<div class="text center" style="padding-bottom:3px">无</div>',
        );
      uiintro.add('<div class="text center">弃牌堆</div>');
      if (ui.discardPile.childNodes.length) {
        var list = [];
        for (var i = 0; i < ui.discardPile.childNodes.length; i++) {
          list.unshift(ui.discardPile.childNodes[i]);
        }
        uiintro.addSmall([list, "card"]);
      } else {
        uiintro.add(
          '<div class="text center" style="padding-bottom:3px">无</div>',
        );
      }

      return uiintro;
    };
  }
  get.shjiefei_tao = function () {
    lib.card.tao.enable = function (card, player) {
      //game.log(card,"enable",card.isCard)
      if (
        player.hasSkill("shjiefei") &&
        (player?.storage?.shjiefei || 0) % 3 === 0
      ) {
        var u = player?.storage?.shjiefei_u,
          storage = player.countMark("shjiefei");
        var num = (storage || 0) % 3,
          n = get.number(card),
          name = get.name(card, player);
        if (
          num == 0 &&
          typeof n === "number" &&
          n >= 9 &&
          name == "tao" &&
          card.isCard
        ) {
          if (u[0] != "可")
            return game.hasPlayer((current) => {
              return current != player && current.isDamaged();
            });
          return game.hasPlayer((current) => {
            return current.isDamaged();
          });
        }
      }
      return player.isDamaged();
    };
    ((lib.card.tao.selectTarget = function (card) {
      game.log(card, "selectTarget", card.isCard);
      const formattedCard = JSON.stringify(card, null, 2);
      game.log("card 对象完整属性：");
      game.log(formattedCard);
      var player = _status.event?.player;
      if (
        player.hasSkill("shjiefei") &&
        (player?.storage?.shjiefei || 0) % 3 === 0
      ) {
        var storage = player.countMark("shjiefei");
        var num = (storage || 0) % 3,
          n = get.number(card),
          name = get.name(card, player);
        //game.log(name,card.isCard)
        if (
          num == 0 &&
          typeof n === "number" &&
          n >= 9 &&
          name == "tao" &&
          card.isCard
        ) {
          return 1;
        }
      }
      return -1;
    }),
      (lib.card.tao.filterTarget = function (card, player, target) {
        game.log(card, "filterTarget", card.isCard);
        const formattedCard = JSON.stringify(card, null, 2);
        game.log("card 对象完整属性：");
        game.log(formattedCard);
        if (
          player.hasSkill("shjiefei") &&
          (player?.storage?.shjiefei || 0) % 3 === 0
        ) {
          var u = player?.storage?.shjiefei_u,
            storage = player.countMark("shjiefei");
          var num = (storage || 0) % 3,
            n = get.number(card),
            name = get.name(card, player);
          if (
            num == 0 &&
            typeof n === "number" &&
            n >= 9 &&
            name == "tao" &&
            card.isCard
          ) {
            if (u[0] != "可") return target !== player && target.isDamaged();
            return target.isDamaged();
          }
        }
        return target === player && target.isDamaged();
      }));
  };
  get.is.xushiSkill = function (skill, player) {
    const info = lib.skill[skill];
    if (typeof info.xushiSkill == "function")
      return info.xushiSkill(skill, player);
    if (info.xushiSkill == true) return true;
    return false;
  };
  //获取从player到target的顺时针路径上的所有角色
  get.clockWisePath = function (player, target) {
    if (!player) player = _status.event.player;
    var players = [];
    var prev = player;
    do {
      prev = prev.getPrevious();
      if (prev != player && prev != target) players.add(prev);
    } while (prev != target);
    return players;
  };
  //获取从player到target的逆时针路径上的所有角色
  get.antiClockWisePath = function (player, target) {
    if (!player) player = _status.event.player;
    var players = [];
    var next = player;
    do {
      next = next.getNext();
      if (next != player && next != target) players.add(next);
    } while (next != target);
    return players;
  };
  //获取路径所有角色的翻译
  get.pathTranslation = function (targets) {
    var str = "";
    for (var i = 0; i < targets.length; i++) {
      str += get.translation(targets[i]);
      if (i != targets.length - 1) str += "->";
    }
    return str;
  };
  get.skillCategoriesOf = function (skill, player) {
    const list = [],
      info = get.info(skill);
    if (!info) return list;
    if (get.is.locked(skill, player)) list.add("锁定技");
    if (info.zhuSkill) list.add("主公技");
    if (info.limited) list.add("限定技");
    if (info.juexingji) list.add("觉醒技");
    if (get.is.zhuanhuanji(skill, player)) list.add("转换技");
    if (info.hiddenSkill) list.add("隐匿技");
    if (info.clanSkill) list.add("宗族技");
    if (info.groupSkill) list.add("势力技");
    if (info.dutySkill) list.add("使命技");
    if (info.chargeSkill) list.add("蓄力技");
    if (info.zhenfa) list.add("阵法技");
    if (info.mainSkill) list.add("主将技");
    if (info.viceSkill) list.add("副将技");
    if (info.lordSkill) list.add("君主技");
    if (info.chargingSkill) list.add("蓄能技");
    if (info.charlotte) list.add("Charlotte");
    if (info.sunbenSkill) list.add("昂扬技");
    if (info.persevereSkill) list.add("持恒技");
    //拓展新增技能标签在此处
    if (info.zhuanhuaji) list.add("转化技");
    if (get.is.xushiSkill(skill, player)) list.add("蓄势技");
    if (info.sameboatSkill) list.add("同舟技");
    //
    if (info.categories) list.addArray(info.categories(skill, player));
    return list;
  };
  //获取中央区的牌
  get.centralDisCards = function () {
    var cards = [];
    game.getGlobalHistory("cardMove", function (evt) {
      if (evt.name != "cardsDiscard") {
        if (evt.name != "lose" || evt.position != ui.discardPile) return false;
      }
      cards.addArray(
        evt.cards.filter((card) => get.position(card, true) == "d"),
      );
    });
    return cards;
  };
  //获取玩家的所有同舟角色
  get.sameBoatPlayer = function (player) {
    const list = [];
    if (!player.isLinked()) return list;
    var current = player;
    list.add(player);
    while (current.getNext().isLinked() && !list.includes(current.getNext())) {
      current = current.getNext();
      list.add(current);
    }
    current = player;
    while (
      current.getPrevious().isLinked() &&
      !list.includes(current.getPrevious())
    ) {
      current = current.getPrevious();
      list.add(current);
    }
    return list;
  };
  //获取所有锦囊牌牌名
  get.Alltrick = function () {
    var list = [
      // 军争
      "guohe",
      "jiedao",
      "juedou",
      "nanman",
      "shunshou",
      "taoyuan",
      "wanjian",
      "wugu",
      "wuzhong",
      "lebu",
      "shandian",
      "huogong",
      "tiesuo",
      "bingliang",
      // 国战
      "gz_haolingtianxia",
      "gz_kefuzhongyuan",
      "gz_guguoanbang",
      "gz_wenheluanwu",
      "xietianzi",
      "shuiyanqijunx",
      "chiling",
      "diaohulishan",
      "lulitongxin",
      "lianjunshengyan",
      "huoshaolianying",
      "yuanjiao",
      "zhibi",
      "yiyi",
      //sp
      "jinchan",
      "qijia",
      "shengdong",
      "zengbin",
      //衍生
      "lx_huoshaolianying",
      "jingxiangshengshi",
      "qizhengxiangsheng",
      "binglinchengxiax",
      "tiaojiyanmei",
      "wy_meirenji",
      "wy_xiaolicangdao",
      "shuiyanqijuny",
      // 应变
      "suijiyingbian",
      "zhujinqiyuan",
      "dongzhuxianji",
      "chuqibuyi",
      // 用间
      "guaguliaodu",
      "chenghuodajie",
      "tuixinzhifu",
      // 运筹帷幄
      //"diaobingqianjiang", "caochuanjiejian", "geanguanhuo", "shezhanqunru", "youdishenru",
      //"wangmeizhike", "fudichouxin", "shuiyanqijun", "toulianghuanzhu",
      // 逐鹿天下
      "zhulu_card",
      "kaihua",
      "jiejia",
      "caochuan",
      // 其他....
      "sadouchengbingx",
      "yihuajiemux",
    ];
    return list;
  };

  //_status
  _status.initLiangCards = function () {
    if (!_status.liangcards) {
      _status.liangcards = [];
      var card;

      for (var name of [
        "shpodao",
        "shpodao",
        "shpodao",
        "shdiangangqiang",
        "shgoulianqiang",
        "shgoulianqiang",
        "shsaitangni",
      ]) {
        if (name == "shpodao") {
          card = game.createCard("shpodao", "spade", 11);
        } else if (name == "shdiangangqiang") {
          card = game.createCard("shdiangangqiang", "club", 1);
        } else if (name == "shgoulianqiang") {
          card = game.createCard("shgoulianqiang", "spade", 9);
        } else if (name == "shsaitangni") {
          card = game.createCard("shsaitangni", "heart", 1);
        }
        _status.liangcards.add(card);
      }
      card = game.createCard("danshutiequan", "diamond", 13);
      _status.liangcards.add(card);
    }
  };
  //game

  game.yinni = function (player) {
    var name = player.name || player.name1;
    if (name && lib.character[name]) {
      game.log(player, "隐匿");
      player.storage.rawHp = player.hp;
      player.storage.rawMaxHp = player.maxHp;
      player.hp = 0;
      player.maxHp = 0;
      player.update();
      var skills = lib.character[name][3];
      if (player.name2) {
        for (var i of lib.character[player.name2][3]) {
          skills.add(i);
        }
      }
      for (var i = 0; i < skills.length; i++) {
        if (!lib.translate[skills[i] + "_info"]) skills.splice(i--, 1);
      }
      for (var i of skills) {
        player.removeSkill(i);
      }
      if (!player.hiddenSkills) player.hiddenSkills = [];
      player.hiddenSkills.addArray(skills);
      player.classList.add("unseen");
      if (player.name2) player.classList.add("unseen2");
      player.name = "unknown";
      if (!player.node.name_seat && !_status.video) {
        player.node.name_seat = ui.create.div(
          ".name.name_seat",
          get.verticalStr(get.translation(player.name)),
          player,
        );
        player.node.name_seat.dataset.nature = get.groupnature(player.group);
      }
      player.sex = "male";
      player.storage.nohp = true;
      player.node.hp.hide();
      player.addSkill("g_hidden_ai");
      player.update();
      player.hp = 1;
      player.maxHp = 1;
    }
  };
  if (CUSTOM) {
    if (CUSTOM.reification) game.reification = CUSTOM.reification;
    if (CUSTOM.unReification) game.unReification = CUSTOM.unReification;
    if (CUSTOM.initCustomStyles) {
      CUSTOM.initCustomStyles();
    }
  }

  //十周年UI
  /*registerDecadeCardSkin({
            extensionName: "水泊娘山",
            skinKey: "decade",
            cardNames: 
            [
                "sadouchengbingx", "yihuajiemux","shdiangangqiang","shdiangangqiang",
                "shpodao","shgoulianqiang","shsaitangni","shxuantianhunyuanjian",
                "shfenghuo","shjinlun","shzimu","danshutiequan","shjinjiashenren",
                
            ],
        });*/
}
