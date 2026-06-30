import { lib, game, ui, get, ai, _status } from "noname";
import { content } from "./main/content.js";
import { precontent } from "./main/precontent.js";
import character from "./character/character.js";
import skills from "./character/skill.js";
import { liangcards, cardTranslates } from "./card/card.js";
import translate from "./character/translate.js";
import {
  characterIntros,
  characterTitles,
  characterSort,
} from "./character/intro.js";
import dynamicTranslates from "./character/dynamicTranslate.js";

game.import("character", function () {
  return {
    name: "水泊娘山",
    connect: true,
    connectBanned: [],
    character: { ...character },
    characterTitle: { ...characterTitles },
    dynamicTranslate: { ...dynamicTranslates },
    characterIntro: { ...characterIntros },
    characterSort: {
      水泊娘山: characterSort,
    },
    skill: { ...skills },
    translate: { ...translate },
  };
});
lib.config.all.characters.push("水泊娘山");
lib.config.all.sgscharacters.push("水泊娘山");
lib.translate["水泊娘山_character_config"] = "水泊娘山";
if (!lib.config.characters.includes("水泊娘山"))
  lib.config.characters.remove("水泊娘山");

game.import("card", function () {
  return {
    name: "liangcards",
    connect: true,
    card: { ...liangcards },
    translate: { ...cardTranslates },
  };
});
lib.translate["liangcards"] = "水泊娘山";
lib.config.all.cards.push("liangcards");
if (!lib.config.cards.includes("liangcards"))
  lib.config.cards.remove("liangcards");
lib.translate["liangcards_card_config"] = "水泊娘山";

game.import("extension", function () {
  return {
    name: "水泊娘山",
    connect: true,
    connectBanned: [], 
    content: content,
    precontent: precontent,
    config: {
      version: {
        nopointer: true,
        clear: true,
        name:
          "扩展版本: 1.2.4<br>更新日期: 2026-5-1<br>更新内容：" +
          "<br>1.<b>" +
          "新增10名武将：<font color=#99FFFF>天罡星</font>：关胜、张顺；<font color=#FF7F00>地煞星</font>：李云、李忠；<font color=#FFD700>其他</font>：杨戬、潘巧云、庞万春、田虎、仇琼英、赵佶。" +
          "</b>" +
          "<br>2.<b>" +
          "暂时删除武将鲁智深，加强部分武将技能。" +
          "</b>" +
          "<br>3.<b>" +
          "多数武将新增静态皮肤，可按需下载单独的皮肤包。" +
          "</b>" +
          "<br>4.<b>" +
          "优化部分武将ai。" +
          "</b>" +
          "<br>5.<b>" +
          "修复诸多bug。" +
          "</b>" +
          "<br>" +
          "<br>" +
          "<br>" +
          "<br>" +
          "<br>" +
          "<br>" +
          "<br>" +
          "<br>" +
          "<br>自定义概念：" +
          "<li><font color=#FFD700>中央区</font>：本回合进入了弃牌堆且仍在弃牌堆的牌所构成的集合，是弃牌堆的一个子集。" +
          "<li><font color=#FFD700>蓄势技</font>：使用此标签的技能可看做限定技，但可以通过牌堆洗切或积势后的条件重置技能的发动次数。此标签定义兼容3d版本蓄势技的原始定义，如无写明积势，默认为：“出牌阶段限一次，弃置三张牌”。" +
          "<li><font color=#FFD700>转化技</font>：使用此标签的技能具有两至多种不同的技能状态，不同于转换技之处在于发动技能不会自动转换技能状态。通常配合“转机：XXX”使用，转机后写明由某一状态转换至下一状态所需的条件。" +
          "<li><font color=#FFD700>舟</font>：若存在一组座次连续的横置角色，且再加入场上任意不属于该组的角色后，均不再满足上述条件，则称这些角色组成一舟。若若干角色（至少一名角色）组成一舟，则互相之间称为与对方同舟，且自己也与自己同舟。" +
          "<li><font color=#FFD700>同舟技</font>：以下将拥有使用此标签技能的角色称为技能拥有者，则有：①技能拥有者处于某一舟时，同舟的所有角色均可发动此技能；②当技能拥有者不处于某一舟时，自己也不能发动此技能。" +
          "<li><font color=#FFD700>路径</font>：你使用牌指定目标后，从你开始，选择从顺时针或逆时针遍历场上角色直到遍历到目标角色，然后将遍历到的所有除你和目标之外角色称为此路径上的角色，若此路径上角色数不多于从另一方向遍历得到的角色数，则称该路径为较短路径；另一路径为较长路径。特别的，若两个方向得到的角色数一样，则由你选定哪一方为较短路径。" +
          "<li><font color=#FFD700>检索</font>：从牌堆检索一张X，即从牌堆顶亮出一张牌，若不为X，则重复此流程；否则获得之。",
      },
      centralDis: {
        name: "中央区显示",
        init: true,
        intro: "开启后，游戏对局中可在“牌堆”内显示中央区的牌",
        onclick: function (item) {
          game.saveConfig("extension_水泊娘山_centralDis", item);
          game.saveConfig("centralDis", item);
          if (confirm("设置完毕，重启后生效\n是否重启？")) game.reload();
        },
      },
    },
    help: {},
    package: {
      character: { character: {}, translate: {} },
      card: { card: {}, translate: {}, list: [] },
      skill: { skill: {}, translate: {} },
      intro: "推荐使用本体1.11.3及以上版本，欢迎加下群反馈或下载更新版本。" + "<br>" + "拓展群：" + "<br>" + "<img style=width:238px src=" + lib.assetURL + "extension/水泊娘山/image/mess/sh_gChat.png>",
      author: "Mushi",
      diskURL: "https://github.com/Mushi1212/ShuiPoNiangShan/releases",
      forumURL: "",
      version: "1.2.4",
    },
    files: { character: [], card: [], skill: [], audio: [] },
  };
});
