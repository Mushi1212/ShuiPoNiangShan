import * as CUSTOM from './src/custom.js'
game.import("extension",function (lib, game, ui, get, ai, _status){
	return {
    name:"水泊娘山",
    content:function(config,pack) {
    //lib
    //势力字：
    game.addGroup("liang","梁",{color:"#F5AD38",image:"ext:水泊娘山/image/group/liang.png"})
    lib.translate.liang2='梁山好汉';
    lib.translate.group_liang='梁势力';
    lib.translate.group_liang_bg='梁';
    game.addGroup("shsong","宋",{color:"#8B008B",image:"ext:水泊娘山/image/group/shsong.png"});
    lib.translate.shsong2='大宋';
    lib.translate.group_shsong='宋势力';
    lib.translate.group_shsong_bg='宋';
    game.addGroup("shchu","楚",{color:"#FF6200",image:"ext:水泊娘山/image/group/shchu.png"});
    lib.translate.shchu2='淮西楚国';
    lib.translate.group_shchu='楚势力';
    lib.translate.group_shchu_bg='楚';
    game.addGroup("shliao","辽",{color:"#00FFFF",image:"ext:水泊娘山/image/group/shliao.png"});
    lib.translate.shliao2='辽国';
    lib.translate.group_shliao='辽势力';
    lib.translate.group_shliao_bg='辽';
    game.addGroup("shjin","晉",{color:"#5a4711",image:"ext:水泊娘山/image/group/shjin.png"});
    lib.translate.shjin2='河北';
    lib.translate.group_shjin='晉势力';
    lib.translate.group_shjin_bg='晉';
    game.addGroup("shnan","南",{color:"#B22222",image:"ext:水泊娘山/image/group/shnan.png"});
    lib.translate.shnan2='南方';
    lib.translate.group_shnan='南势力';
    lib.translate.group_shnan_bg='南';
    
    lib.translate.visible_shjiepeng="解烹";
    lib.translate.shlingchen_backup='凌尘';
    lib.translate.visible_shguzhi='志';
    lib.translate.visible_shxuxun="虚勋";
    lib.translate.visible_shdiaoman='刁蛮';
    lib.translate.visible_shjiaolan='搅澜';
    lib.translate.visible_shyidan='义胆';
    lib.translate.shtalang_tag='踏浪';
    lib.translate.visible_shjiaojiao='皎皎';
    lib.translate.visible_shfangyin='芳吟';
    lib.translate.shweizhan_tag1="威斩-1次";
    lib.translate.shweizhan_tag2="威斩-2次";
    lib.translate.visible_shyanzi='艳姿';
    lib.poptip.add({
        id:"rule_xushiSkill",
        name:"蓄势技",
        info:"使用此标签的技能可看做限定技，但可以通过牌堆洗切或积势后的条件重置技能的发动次数。此标签定义兼容3d版本蓄势技的原始定义，如无写明积势，默认为：“出牌阶段限一次，弃置三张牌”。"
    });
    lib.poptip.add({
        id:"rule_zhuanhuaji",
        name:"转化技",
        info:"使用此标签的技能具有两至多种不同的技能状态，不同于转换技之处在于发动技能不会自动转换技能状态。通常配合“转机：XXX”使用，转机后写明由某一状态转换至下一状态所需的条件。"
    });
    lib.poptip.add({
        id:"rule_sameboatSkill",
        name:"同舟技",
        info:"以下将拥有使用此标签技能的角色称为技能拥有者，则有：①技能拥有者处于某一舟时，同舟的所有角色均可发动此技能；②当技能拥有者不处于某一舟时，自己也不能发动此技能。"
    });
    lib.poptip.add({
        id:"rule_sameboat",
        name:"同舟",
        info:"若存在一组座次连续的横置角色，且再加入场上任意不属于该组的角色后，均不再满足上述条件，则称这些角色组成一舟。若若干角色（至少一名角色）组成一舟，则互相之间称为与对方同舟，且自己也与自己同舟。"
    });
    lib.poptip.add({
        id:"rule_search",
        name:"检索",
        info:"从牌堆检索一张X，即从牌堆顶亮出一张牌，若不为X，则重复此流程；否则获得之。"
    });
    lib.poptip.add({
        id:"rule_centralDisCards",
        name:"中央区",
        info:"本回合进入了弃牌堆且仍在弃牌堆的牌所构成的集合，是弃牌堆的一个子集。"
    });
    
    //普通
    lib.rank.rarity.junk.add(...[
        "sh_kongming","sh_kongliang",
    ]);
    //精品
    lib.rank.rarity.rare.add(...[
        "sh_songqing","sh_zhugui","sh_dengfei","sh_zhoutong",
        "sh_oupeng","sh_sunerniang","sh_husanniang","sh_yuehe",
        "sh_yubaosi","sh_tanglong","sh_duanjingzhu","sh_shiqian",
        "sh_wangdingliu","sh_zhufu","sh_shantinggui","sh_weidingguo",
        "sh_lingzhen","sh_yanglin","sh_caifu","sh_taozongwang",
        "sh_caiqing","sh_lili","sh_wangying","sh_zhengtianshou",
        "sh_yanshun","sh_houjian","sh_zouyuan","sh_zourun",
        "sh_jiaoting","sh_tongwei","sh_tongmeng","sh_shiyong",
        "sh_baisheng","sh_sunxin","sh_mengkang","sh_liyun",
        "sh_yanpoxi","sh_lvfang","sh_guosheng","sh_ximenqing",
        "sh_hongxin","sh_gongwang","sh_dingdesun","sh_xueyong",
        "sh_huangfuduan","sh_duansanniang","sh_andaoquan","sh_duxing",
        "sh_lishishi","sh_lizhong"
    ]);
    //史诗
    lib.rank.rarity.epic.add(...[
        "sh_muchun","sh_malin","sh_baoxu","sh_shixiu",
        "sh_xiaorang","sh_peixuan","sh_jiangjing","sh_huangxin",
        "sh_sunli","sh_haosiwen","sh_pengqi","sh_hantao",
        "sh_liutang","sh_wuyong","sh_caozheng","sh_daizong",
        "sh_muhong","sh_zhangheng","sh_likui","sh_zhangqing",
        "sh_zhuwu","sh_suochao","sh_ruanxiaoer","sh_ruanxiaowu",
        "sh_shien","sh_zhangqing2","sh_xuning","sh_yangzhi",
        "sh_zhutong","sh_gudasao","sh_yangxiong","sh_wanglun",
        "sh_leiheng","sh_jindajian","sh_lijun","sh_xuanzan",
        "sh_zhuzhuzhu","sh_xiezhen","sh_xiebao","sh_chaijin",
        "sh_zhangshun","sh_fanrui","sh_caijing","sh_ruanxiaoqi",
        "sh_lizhu","sh_liying","sh_yanqing","sh_tongguan",
        "sh_shijin","sh_koumie","sh_baodaoyi","sh_huarong",
        "sh_gaoqiu","sh_yangxiong","sh_dalibo","sh_yangjian",
        "sh_panqiaoyun","sh_qiuqiongying"
      
    ]);
    //传说
    lib.rank.rarity.legend.add(...[
        "sh_songjiang","sh_huyanzhuo","sh_dongping","sh_chaogai",
        "sh_wuyanguang","sh_qinming","sh_bianxiang","sh_luzhishen",
        "sh_shibao","sh_qiaodaoqing","sh_yelvhui","sh_gongsunsheng",
        "sh_jiutianxuannv","sh_zengzengzengzengzeng","sh_guansheng",
        "sh_pangwanchun","sh_tianhu"
        
    ]);
    
    
    if(lib.config.extension_水泊娘山_centralDis){
        ui.click.cardPileButton = function(){
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
				"</div>"
		);
        uiintro.add('<div class="text center">中央区</div>');
        var list2 = [];
        game.getGlobalHistory('cardMove',function(evt){
        if(evt.name!='cardsDiscard'){
            if(evt.name!='lose'||evt.position!=ui.discardPile) return false;
        }
        for(var i of evt.cards.filter(card=>get.position(card,true)=='d')){
            list2.unshift(i);
        }
    });
        if(list2.length)uiintro.addSmall([list2, "card"]);
        else uiintro.add('<div class="text center" style="padding-bottom:3px">无</div>');
		uiintro.add('<div class="text center">弃牌堆</div>');
		if (ui.discardPile.childNodes.length) {
			var list = [];
			for (var i = 0; i < ui.discardPile.childNodes.length; i++) {
				list.unshift(ui.discardPile.childNodes[i]);
			}
			uiintro.addSmall([list, "card"]);
		} else {
			uiintro.add('<div class="text center" style="padding-bottom:3px">无</div>');
        }
       
		return uiintro;
        };
    }
    get.shjiefei_tao = function() {
        lib.card.tao.enable = function(card, player) {
            //game.log(card,"enable",card.isCard)
            if(player.hasSkill('shjiefei') && (player?.storage?.shjiefei||0)%3 === 0) {
                var u = player?.storage?.shjiefei_u, storage = player.countMark('shjiefei');
                var num = (storage||0)%3, n = get.number(card), name = get.name(card, player);
                if (
                    num == 0 && typeof n === "number" && n >= 9 &&
                    name == "tao" && card.isCard  
                ) {
                    if(u[0] != '可' ) return game.hasPlayer(current=>{
                        return current != player && current.isDamaged();
                    });
                    return game.hasPlayer(current=>{
                        return current.isDamaged();
                    });
                }
            }
            return player.isDamaged();
        }
        lib.card.tao.selectTarget = function(card) {
            game.log(card,"selectTarget",card.isCard)
            const formattedCard = JSON.stringify(card, null, 2);
            game.log("card 对象完整属性：");
            game.log(formattedCard);
            var player = _status.event?.player;
            if(player.hasSkill('shjiefei') && (player?.storage?.shjiefei||0)%3 === 0) {   
                var storage = player.countMark('shjiefei');
                var num = (storage||0)%3, n = get.number(card), name = get.name(card, player);
                //game.log(name,card.isCard)
                if (
                    num == 0 && typeof n === "number" && n >= 9 &&
                    name == "tao" && card.isCard 
                ) {
                    return 1;
                }
            }
            return -1;
        },
        lib.card.tao.filterTarget = function(card, player, target) {
            game.log(card,"filterTarget",card.isCard)
            const formattedCard = JSON.stringify(card, null, 2);
            game.log("card 对象完整属性：");
            game.log(formattedCard);
            if(player.hasSkill('shjiefei') && (player?.storage?.shjiefei||0)%3 === 0) {
                var u = player?.storage?.shjiefei_u, storage = player.countMark('shjiefei');
                var num = (storage||0)%3, n = get.number(card), name = get.name(card, player);
                if (
                    num == 0 && typeof n === "number" && n >= 9 &&
                    name == "tao" && card.isCard  
                ) {
                    if(u[0] != '可' ) return target !== player && target.isDamaged();
                    return target.isDamaged();
                }
            }
            return target === player && target.isDamaged();
        }
    };
    get.is.xushiSkill = function(skill, player){
        const info = lib.skill[skill];
		if (typeof info.xushiSkill == "function") return info.xushiSkill(skill, player);
		if (info.xushiSkill == true) return true;
        return false;
    };
    //获取从player到target的顺时针路径上的所有角色
    get.clockWisePath = function(player,target) {
        if(!player) player = _status.event.player;
        var players = [];
        var prev = player;
        do{
           prev = prev.getPrevious();
           if(prev != player && prev !=target ) players.add(prev);
        }while(prev != target)
        return players;
    };
    //获取从player到target的逆时针路径上的所有角色
    get.antiClockWisePath = function(player,target) {
        if(!player) player = _status.event.player;
        var players = [];
        var next = player;
        do{
           next = next.getNext();
           if(next != player && next !=target ) players.add(next);
        }while(next != target)
        return players;
    };
    //获取路径所有角色的翻译
    get.pathTranslation = function(targets) {
        var str = '';
        for(var i=0; i<targets.length; i++) {
            str += get.translation(targets[i]);
            if(i!=targets.length-1) str += '->'
        }
        return str;
    }
    get.skillCategoriesOf = function(skill, player) {
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
        if(info.sameboatSkill) list.add("同舟技");
        //
		if (info.categories) list.addArray(info.categories(skill, player));
		return list;
    };
    //获取中央区的牌
    get.centralDisCards = function() {
        var cards=[];
        game.getGlobalHistory('cardMove',function(evt){
            if(evt.name!='cardsDiscard'){
                if(evt.name!='lose'||evt.position!=ui.discardPile) return false;
            }
            cards.addArray(evt.cards.filter(card=>get.position(card,true)=='d'));
        });
        return cards;
    };
    //获取玩家的所有同舟角色
    get.sameBoatPlayer = function(player){
        const list = [];
        if(!player.isLinked())return list;
        var current = player;
        list.add(player);
        while(current.getNext().isLinked() && !list.includes(current.getNext())){
           current = current.getNext();
           list.add(current);
       }
       current = player;
        while(current.getPrevious().isLinked() && !list.includes(current.getPrevious())){
           current = current.getPrevious();
           list.add(current);
       }
       return list;
    };
    //获取所有锦囊牌牌名
    get.Alltrick = function(){
        var list = [
            // 军争
            "guohe", "jiedao", "juedou", "nanman", "shunshou",
            "taoyuan", "wanjian", "wugu", "wuzhong", "lebu",
            "shandian", "huogong", "tiesuo", "bingliang",
            // 国战
            "gz_haolingtianxia", "gz_kefuzhongyuan", "gz_guguoanbang", "gz_wenheluanwu",
            "xietianzi", "shuiyanqijunx", "chiling", "diaohulishan", "lulitongxin",
            "lianjunshengyan", "huoshaolianying", "yuanjiao", "zhibi", "yiyi", 
            //sp
            "jinchan", "qijia", "shengdong", "zengbin",       
            //衍生
            "lx_huoshaolianying", "jingxiangshengshi", "qizhengxiangsheng", "binglinchengxiax",
            "tiaojiyanmei", "wy_meirenji", "wy_xiaolicangdao", "shuiyanqijuny",
            // 应变
            "suijiyingbian", "zhujinqiyuan", "dongzhuxianji", "chuqibuyi",
            // 用间
            "guaguliaodu", "chenghuodajie", "tuixinzhifu",
            // 运筹帷幄
            //"diaobingqianjiang", "caochuanjiejian", "geanguanhuo", "shezhanqunru", "youdishenru",
            //"wangmeizhike", "fudichouxin", "shuiyanqijun", "toulianghuanzhu",
            // 逐鹿天下
            "zhulu_card", "kaihua", "jiejia", "caochuan",
            // 其他....
            "sadouchengbingx", "yihuajiemux"
        ];
        return list;
    };

//_status
   _status.initLiangCards = function(){
    if (!_status.liangcards){
        _status.liangcards = [];
        var card;

        for(var name of [
            'shpodao','shpodao','shpodao',
            'shdiangangqiang',
            'shgoulianqiang','shgoulianqiang',
            'shsaitangni'
        ]){
           if(name=='shpodao'){
             card=game.createCard('shpodao','spade',11);
           }
           else if(name=='shdiangangqiang'){
             card=game.createCard('shdiangangqiang','club',1);
           }
           else if(name=='shgoulianqiang'){
            card=game.createCard('shgoulianqiang','spade',9);
          }
          else if(name=='shsaitangni'){
            card=game.createCard('shsaitangni','heart',1);
          }
          _status.liangcards.add(card);
        }
        card = game.createCard('danshutiequan','diamond',13);
        _status.liangcards.add(card);
    } 
   };
   //game
   
   game.yinni = function(player) {
    var name=player.name||player.name1;
    if(name&&lib.character[name]){
        game.log(player,'隐匿');
        player.storage.rawHp=player.hp;
        player.storage.rawMaxHp=player.maxHp;
        player.hp=0;
        player.maxHp=0;
        player.update();
        var skills=lib.character[name][3];
        if(player.name2){
            for(var i of lib.character[player.name2][3]){
                skills.add(i);
            };
        };
        for(var i=0;i<skills.length;i++){
            if(!lib.translate[skills[i]+'_info'])skills.splice(i--,1);
        };
        for(var i of skills){
            player.removeSkill(i);
        };
        if(!player.hiddenSkills)player.hiddenSkills=[];
        player.hiddenSkills.addArray(skills);
        player.classList.add('unseen');
        if(player.name2)player.classList.add('unseen2');
        player.name='unknown';
        if(!player.node.name_seat&&!_status.video){
            player.node.name_seat=ui.create.div('.name.name_seat',get.verticalStr(get.translation(player.name)),player);
            player.node.name_seat.dataset.nature=get.groupnature(player.group);
        };
        player.sex='male';
        player.storage.nohp=true;
        player.node.hp.hide();
        player.addSkill('g_hidden_ai');
        player.update();
        player.hp=1;
        player.maxHp=1;
        }
    };
    if(CUSTOM) {
        if(CUSTOM.reification) game.reification = CUSTOM.reification;
        if(CUSTOM.unReification) game.unReification = CUSTOM.unReification;
        if(CUSTOM.initCustomStyles) {
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
  

},
precontent:function(){
    window.shuihu_import = function (func) {
        func(lib, game, ui, get, ai, _status);
    };
    lib.init.js(lib.assetURL + 'extension/水泊娘山/character.js', null);
    game.import('card', function () {
        var card={
            name: 'liangcards',
            connect: true,
            card:{
                yihuajiemux: {
                    type: "trick",
                    fullskin: true,
                    image:"ext:水泊娘山/image/card/yihuajiemux.png",
                    enable: true,
                    filterTarget(card, player, target) {
                        return target != player && target.countCards("he");
                    },
                    content() {
                        "step 0";
                        if (target.hasSha()) {
                            target.chooseToUse(function (card, player, event) {
                                return get.name(card) == "sha" && lib.filter.filterCard.apply(this, arguments);
                            }, "使用一张杀，或交给" + get.translation(player) + "两张牌");
                        } else {
                            event.directfalse = true;
                        }
                        "step 1";
                        var nh = target.countCards("he");
                        if ((event.directfalse || !result.bool) && nh) {
                            if (nh <= 2) {
                                event.directcards = true;
                            } else {
                                target.chooseCard("he", 2, true, "将两张牌交给" + get.translation(player));
                            }
                        } else {
                            event.finish();
                        }
                        "step 2";
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
                    image:"ext:水泊娘山/image/card/sadouchengbingx.png",
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
                shdiangangqiang:{
                    fullskin:true,
                    //derivation: 'sh_tanglong',
                    image:"ext:水泊娘山/image/card/shdiangangqiang.png",
                    type: 'equip',
                    subtype: 'equip1',
                    distance: {attackFrom:-2},
                    skills:['shdiangangqiang_skill'],
                    ai:{
                        basic:{
                            equipValue:8,
                            order:(card,player)=>{
                    const equipValue=get.equipValue(card,player)/20;
                    return player&&player.hasSkillTag('reverseEquip')?8.5-equipValue:8+equipValue;
                },
                            useful:2,
                            value:(card,player,index,method)=>{
                    if(!player.getCards('e').includes(card)&&!player.canEquip(card,true)) return 0.01;
                    const info=get.info(card),current=player.getEquip(info.subtype),value=current&&card!=current&&get.value(current,player);
                    let equipValue=info.ai.equipValue||info.ai.basic.equipValue;
                    if(typeof equipValue=='function'){
                        if(method=='raw')return equipValue(card,player);
                        if(method=='raw2')return equipValue(card,player)-value;
                        return Math.max(0.1,equipValue(card,player)-value);
                    }
                    if(typeof equipValue!='number') equipValue=0;
                    if(method=='raw') return equipValue;
                    if(method=='raw2') return equipValue-value;
                    return Math.max(0.1,equipValue-value);
                },
                        },
                        result:{
                            target:(player,target,card)=>get.equipResult(player,target,card.name),
                        },
                    },
                    enable:true,
                    selectTarget:-1,
                    filterTarget:(card,player,target)=>player==target&&target.canEquip(card,true),
                    modTarget:true,
                    allowMultiple:false,
                    content:function(){
                        if(cards.length&&get.position(cards[0],true)=='o')target.equip(cards[0]);
                    },
                    toself:true,
                },
                shpodao:{   
                    fullskin:true,
                    //derivation: 'sh_tanglong',
                    image:"ext:水泊娘山/image/card/shpodao.png",
                    type: 'equip',
                    subtype: 'equip1',
                    distance: {attackFrom:-1},
                    skills:['shpodao_skill'],
                    ai:{
                        basic:{
                            equipValue:7,
                            order:(card,player)=>{
                    const equipValue=get.equipValue(card,player)/20;
                    return player&&player.hasSkillTag('reverseEquip')?8.5-equipValue:8+equipValue;
                },
                            useful:2,
                            value:(card,player,index,method)=>{
                    if(!player.getCards('e').includes(card)&&!player.canEquip(card,true)) return 0.01;
                    const info=get.info(card),current=player.getEquip(info.subtype),value=current&&card!=current&&get.value(current,player);
                    let equipValue=info.ai.equipValue||info.ai.basic.equipValue;
                    if(typeof equipValue=='function'){
                        if(method=='raw')return equipValue(card,player);
                        if(method=='raw2')return equipValue(card,player)-value;
                        return Math.max(0.1,equipValue(card,player)-value);
                    }
                    if(typeof equipValue!='number') equipValue=0;
                    if(method=='raw') return equipValue;
                    if(method=='raw2') return equipValue-value;
                    return Math.max(0.1,equipValue-value);
                },
                        },
                        result:{
                            target:(player,target,card)=>get.equipResult(player,target,card.name),
                        },
                    },
                    enable:true,
                    selectTarget:-1,
                    filterTarget:(card,player,target)=>player==target&&target.canEquip(card,true),
                    modTarget:true,
                    allowMultiple:false,
                    content:function(){
                        if(cards.length&&get.position(cards[0],true)=='o')target.equip(cards[0]);
                    },
                    toself:true,
                },
                shgoulianqiang:{
                    fullskin:true,
                    derivation: 'sh_xuning',
                    image:"ext:水泊娘山/image/card/shgoulianqiang.png",
                    type: 'equip',
                    subtype: 'equip1',
                    distance: {attackFrom:-2},
                    skills:['shgoulianqiang_skill'],
                    ai:{
                        basic:{
                            equipValue:function (card, player) {
                               if(player.hasSkill('shluanji')) return 30;
                                return 5;
                            },
                            order:(card,player)=>{
                    const equipValue=get.equipValue(card,player)/20;
                    return player&&player.hasSkillTag('reverseEquip')?8.5-equipValue:8+equipValue;
                },
                            useful:2,
                            value:(card,player,index,method)=>{
                    if(!player.getCards('e').includes(card)&&!player.canEquip(card,true)) return 0.01;
                    const info=get.info(card),current=player.getEquip(info.subtype),value=current&&card!=current&&get.value(current,player);
                    let equipValue=info.ai.equipValue||info.ai.basic.equipValue;
                    if(typeof equipValue=='function'){
                        if(method=='raw')return equipValue(card,player);
                        if(method=='raw2')return equipValue(card,player)-value;
                        return Math.max(0.1,equipValue(card,player)-value);
                    }
                    if(typeof equipValue!='number') equipValue=0;
                    if(method=='raw') return equipValue;
                    if(method=='raw2') return equipValue-value;
                    return Math.max(0.1,equipValue-value);
                },
                        },
                        result:{
                            target:(player,target,card)=>get.equipResult(player,target,card.name),
                        },
                    },
                    enable:true,
                    selectTarget:-1,
                    filterTarget:(card,player,target)=>player==target&&target.canEquip(card,true),
                    modTarget:true,
                    allowMultiple:false,
                    content:function(){
                        if(cards.length&&get.position(cards[0],true)=='o')target.equip(cards[0]);
                    },
                    toself:true,
                },
                shsaitangni:{
                    fullskin:true,
                    derivation: 'sh_xuning',
                    image:"ext:水泊娘山/image/card/shsaitangni.png",
                    type: 'equip',
                    subtype: 'equip2',
                    skills:['shsaitangni_skill'],
                    ai:{
                        basic:{
                            equipValue:50,
                            order:(card, player) => {
                                const equipValue = get.equipValue(card, player) / 20;
                                return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
                            },
                            useful:2,
                            value:(card, player, index, method) => {
                                if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) return 0.01;
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
                        result:{
                            target:(player, target, card) => get.equipResult(player, target, card.name),
                        },
                    },
                    filterLose:function (card, player) {
                        if (player.hasSkillTag("unequip2")) return false;
                        return true;
                    },
                    loseDelay:false,
                    onLose:function () {
                        var next = game.createEvent("shsaitangni");
                        event.next.remove(next);
                        var evt = event.getParent();
                        if (evt.getlx === false) evt = evt.getParent();
                        evt.after.push(next);
                        next.player = player;
                        next.setContent(lib.card.shsaitangni.onLosex);
                    },
                    onLosex:function () {
                        if(0-player.hujia<0)player.changeHujia(0-player.hujia);
                    },
                    enable:true,
                    selectTarget:-1,
                    filterTarget:(card, player, target) => player == target && target.canEquip(card, true),
                    modTarget:true,
                    allowMultiple:false,
                    content:function () {
                        if (cards.length && get.position(cards[0], true) == "o") target.equip(cards[0]);
                    },
                    toself:true,

                },
            },
//registerDecadeCardSkin
            translate:{
                sadouchengbingx: "撒豆成兵",
                sadouchengbingx_info: "出牌阶段对自己使用，若你的势力为“神”，摸X张牌；否则将你手牌补至X；（X为你的体力上限且至多为5）。",
                yihuajiemux: "移花接木",
			    yihuajiemux_info: "出牌阶段对一名有牌的其他角色使用，令其使用一张【杀】，或交给你两张牌。",
                shdiangangqiang:'浑铁点钢枪',
                shdiangangqiang_info:'锁定技，你使用的【杀】无视目标防具且不能被【闪】抵消。',
                shpodao:'朴刀',
                shpodao_info:'出牌阶段，你可以多出一张【杀】；你于出牌阶段内使用的第二张【杀】伤害+1。',
                shgoulianqiang:'钩镰枪',
                shgoulianqiang_info:'你使用黑色/红色【杀】指定目标后，你可以横置/重置其武将牌，然后弃置其一张牌/对其造成1点伤害。',
                shsaitangni:'赛唐猊',
                shsaitangni_info:'锁定技，你装备区的牌不能被弃置。回合开始时，你进行判定，若结果为红桃，你获得1点护甲；当此装备离开你的装备区后，你失去所有护甲。',
                shxuantianhunyuanjian:"玄天混元剑",
                shxuantianhunyuanjian_info:"转换技，阳：你的【杀】可以当【过河拆桥】使用。阴：你的锦囊牌可以当雷【杀】使用。你以此法使用牌时，“包道乙”摸一张牌。",
            },
            //list:[],
        };
        return card;
    });   
   lib.translate['liangcards'] = '水泊娘山';
    lib.config.all.cards.push('liangcards');
    if (!lib.config.cards.includes('liangcards')) lib.config.cards.remove('liangcards');
    lib.translate['liangcards_card_config'] = '水泊娘山';
},  
    help:{},
    config:{
        version: {
            nopointer: true,
            clear: true,
            name: 
            "扩展版本: 1.2.4<br>更新日期: 2026-5-1<br>更新内容："
            +"<br>1.<b>"+"新增8名武将：<font color=#99FFFF>天罡星</font>：关胜、张顺；<font color=#FF7F00>地煞星</font>：李云、李忠；<font color=#FFD700>其他</font>：杨戬、潘巧云、庞万春、田虎。"+"</b>"
            +"<br>2.<b>"+"部分武将技能调整"+"</b>"
            +"<br>3.<b>"+"优化部分武将ai。"+"</b>"
            +"<br>4.<b>"+"修复诸多bug。"+"</b>"
            +"<br>"
            +"<br>"
            +"<br>"
            +"<br>"
            +"<br>"
            +"<br>"
            +"<br>"
            +"<br>"
            +"<br>自定义概念："
            +"<li><font color=#FFD700>中央区</font>：本回合进入了弃牌堆且仍在弃牌堆的牌所构成的集合，是弃牌堆的一个子集。"
            +'<li><font color=#FFD700>蓄势技</font>：使用此标签的技能可看做限定技，但可以通过牌堆洗切或积势后的条件重置技能的发动次数。此标签定义兼容3d版本蓄势技的原始定义，如无写明积势，默认为：“出牌阶段限一次，弃置三张牌”。'
            +'<li><font color=#FFD700>转化技</font>：使用此标签的技能具有两至多种不同的技能状态，不同于转换技之处在于发动技能不会自动转换技能状态。通常配合“转机：XXX”使用，转机后写明由某一状态转换至下一状态所需的条件。'
            +'<li><font color=#FFD700>舟</font>：若存在一组座次连续的横置角色，且再加入场上任意不属于该组的角色后，均不再满足上述条件，则称这些角色组成一舟。若若干角色（至少一名角色）组成一舟，则互相之间称为与对方同舟，且自己也与自己同舟。'
            +'<li><font color=#FFD700>同舟技</font>：以下将拥有使用此标签技能的角色称为技能拥有者，则有：①技能拥有者处于某一舟时，同舟的所有角色均可发动此技能；②当技能拥有者不处于某一舟时，自己也不能发动此技能。'
            +'<li><font color=#FFD700>路径</font>：你使用牌指定目标后，从你开始，选择从顺时针或逆时针遍历场上角色直到遍历到目标角色，然后将遍历到的所有除你和目标之外角色称为此路径上的角色，若此路径上角色数不多于从另一方向遍历得到的角色数，则称该路径为较短路径；另一路径为较长路径。特别的，若两个方向得到的角色数一样，则由你选定哪一方为较短路径。'
            +'<li><font color=#FFD700>检索</font>：从牌堆检索一张X，即从牌堆顶亮出一张牌，若不为X，则重复此流程；否则获得之。',
        },
        "centralDis":{
            "name": "中央区显示",
            "init": true,
            "intro": "开启后，游戏对局中可在“牌堆”内显示中央区的牌",
            onclick: function (item) {
                game.saveConfig('extension_水泊娘山_centralDis', item);
                game.saveConfig('centralDis', item);
                if(confirm("设置完毕，重启后生效\n是否重启？")) game.reload();
            },
        },
       
    },
    package:{
    intro:
    "推荐使用本体1.11.3及以上版本，欢迎加下群反馈或下载更新版本。"+"<br>"
    +"拓展群："+"<br>"
    +"<img style=width:238px src="+lib.assetURL+"extension/水泊娘山/image/mess/sh_gChat.png>",
    author:"Mushi",
    diskURL:"",
    forumURL:"",
    version:"1.2.4",},files:{"character":[],"card":[],"skill":[],"audio":[]}
    }
})