import { lib, game, ui, get, ai, _status } from "noname";
/** @type { importCharacterConfig["character"] } */
/*
groupInGuozhan
junName
skinPath
isZhugong
isUnseen
isMinskin
hasSkinInGuozhan
isBoss
isChessBoss
isJiangeBoss
isJiangeMech
isBossAllowed
isHiddenBoss
isAiForbidden
isFellowInStoneMode
isHiddenInStoneMode
isSpecialInStoneMode
hasHiddenSkill
groupBorder
dualSideCharacter
doubleGroup
clans
initFilters
img
dieAudios
tempname
*/
const character = {
	// ========== 108将 ==========
	sh_songqing: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shsheyan", "shanxiang"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_songqing.mp3"],
	},

	sh_lili: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shsixing", "shyuxun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_lili.mp3"],
	},

	sh_xueyong: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shnongwu"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_xueyong.mp3"],
	},

	sh_zhugui: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shyaomeng", "shdongzhu"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zhugui.mp3"],
	},

	sh_dengfei: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shbenjiu"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_dengfei.mp3"],
	},

	sh_zhoutong: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shduogui", "shdaozhui"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zhoutong.mp3"],
	},

	sh_muchun: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shzhenwei"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_muchun.mp3"],
	},

	sh_oupeng: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shboshi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_oupeng.mp3"],
	},

	sh_sunerniang: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shjiepeng", "shjiayao", "shzhenjiu"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_sunerniang.mp3"],
	},

	sh_husanniang: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shwushuang", "shchanjin"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_husanniang.mp3"],
	},

	sh_baisheng: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shlieri", "shyuyin"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_baisheng.mp3"],
	},

	sh_yuehe: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shqinhui", "shkangge"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_yuehe.mp3"],
	},

	sh_malin: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shjingdi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_malin.mp3"],
	},

	sh_yubaosi: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shpixian", "shpengshuai"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_yubaosi.mp3"],
	},

	sh_baoxu: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shxiongjian", "shbaoshi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_baoxu.mp3"],
	},

	sh_xiaorang: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shweishu", "shcangfeng"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_xiaorang.mp3"],
	},

	sh_peixuan: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shdingpan", "shgengzheng"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_peixuan.mp3"],
	},

	sh_tanglong: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shyebing", "shjianghun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_tanglong.mp3"],
	},

	sh_duanjingzhu: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shqiema", "shhuoqi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_duanjingzhu.mp3"],
	},

	sh_mengkang: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shzaomeng", "shsuizhen"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_mengkang.mp3"],
	},

	sh_jiangjing: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shleiju"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_jiangjing.mp3"],
	},

	sh_huangfuduan: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shxiangma", "shshengxi"],
		names: "皇甫|端",
		dieAudios: ["ext:水泊娘山/audio/die/sh_huangfuduan.mp3"],
	},

	sh_zhuwu: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shguanshi", "shkunbian"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zhuwu.mp3"],
	},

	sh_shiqian: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shweibu", "shyafeng"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_shiqian.mp3"],
	},

	sh_wangdingliu: {
		sex: "female",
		group: "liang",
		hp: "3/6",
		skills: ["shhuoshan", "shquexi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_wangdingliu.mp3"],
	},

	sh_huangxin: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shpingyue"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_huangxin.mp3"],
	},

	sh_sunli: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shxuanzhen"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_sunli.mp3"],
	},

	sh_haosiwen: {
		sex: "female",
		group: "liang",
		hp: "4/5",
		skills: ["shlingchen", "shguahuo"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_haosiwen.mp3"],
	},

	sh_zhufu: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shfengchun", "shcangren"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zhufu.mp3"],
	},

	sh_houjian: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shzhijing", "shmifeng"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_houjian.mp3"],
	},

	sh_shantinggui: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shjinbing"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_shantinggui.mp3"],
	},

	sh_weidingguo: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shjianghuo", "shbingyin"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_weidingguo.mp3"],
	},

	sh_yanshun: {
		sex: "female",
		group: "liang",
		hp: 6,
		skills: ["shjierao"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_yanshun.mp3"],
	},

	sh_lingzhen: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shhongchong", "shchiyan"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_lingzhen.mp3"],
	},

	sh_yanglin: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shfuxing", "shqiuxian"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_yanglin.mp3"],
	},

	sh_pengqi: {
		sex: "female",
		group: "liang",
		hp: 5,
		skills: ["shshenbing", "shtianmu"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_pengqi.mp3"],
	},

	sh_hantao: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shlianzheng"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_hantao.mp3"],
	},

	sh_caifu: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shguixing"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_caifu.mp3"],
	},

	sh_kongming: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shhuixiong"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_kongming.mp3"],
	},

	sh_kongliang: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shwunu", "shzhengchou"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_kongliang.mp3"],
	},

	sh_liutang: {
		sex: "female",
		group: "liang",
		hp: 5,
		skills: ["shpiaopeng", "shhenglue", "shjinchong"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_liutang.mp3"],
	},

	sh_wuyong: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shqiongji", "shjiaozhi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_wuyong.mp3"],
	},

	sh_caozheng: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shtujie"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_caozheng.mp3"],
	},

	sh_huyanzhuo: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shlianji", "shyubing"],
		names: "呼延|灼",
		dieAudios: ["ext:水泊娘山/audio/die/sh_huyanzhuo.mp3"],
	},

	sh_songjiang: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shjuyi", "shtiankui"],
		isZhugong: true,
		dieAudios: ["ext:水泊娘山/audio/die/sh_songjiang.mp3"],
	},

	sh_dongping: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shpozhen", "shchouni"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_dongping.mp3"],
	},

	sh_zhengtianshou: {
		sex: "female",
		group: "liang",
		hp: "3/4",
		skills: ["shaiai", "shhanhan"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zhengtianshou.mp3"],
	},

	sh_daizong: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shshenxing", "shzoutan"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_daizong.mp3"],
	},

	sh_muhong: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shzhiba", "shduofan"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_muhong.mp3"],
	},

	sh_taozongwang: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shgengjue"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_taozongwang.mp3"],
	},

	sh_caiqing: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shwoxuan", "shbinhua"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_caiqing.mp3"],
	},

	sh_zhangheng: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shxingshao", "shjinghun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zhangheng.mp3"],
	},

	sh_likui: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shxuanfeng"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_likui.mp3"],
	},

	sh_zouyuan: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shzhebang"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zouyuan.mp3"],
	},

	sh_zourun: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shtouchui", "shyijiao"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zourun.mp3"],
	},

	sh_zhangqing: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shfeixing", "shzhengxuan"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zhangqing.mp3"],
	},

	sh_tongwei: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shjilang"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_tongwei.mp3"],
	},

	sh_tongmeng: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shfanjiang"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_tongmeng.mp3"],
	},

	sh_jiaoting: {
		sex: "female",
		group: "liang",
		hp: 7,
		skills: ["shpudou"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_jiaoting.mp3"],
	},

	sh_suochao: {
		sex: "female",
		group: "liang",
		hp: 5,
		skills: ["shdengfeng"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_suochao.mp3"],
	},

	sh_ruanxiaoer: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shqiujin"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_ruanxiaoer.mp3"],
	},

	sh_ruanxiaowu: {
		sex: "female",
		group: "liang",
		hp: "3/4",
		skills: ["shduanming", "shzangliu"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_ruanxiaowu.mp3"],
	},

	sh_shien: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shenyu", "shyiduo"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_shien.mp3"],
	},

	sh_zhangqing2: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shshilun", "shcaiyin"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zhangqing2.mp3"],
	},

	sh_shiyong: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shhaoyong", "shshaqian"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_shiyong.mp3"],
	},

	sh_xuning: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shluanji", "shhuaibi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_xuning.mp3"],
	},

	sh_yangzhi: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shguzhi", "shantu"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_yangzhi.mp3"],
	},

	sh_zhutong: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shfengxuan", "shyishi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zhutong.mp3"],
	},

	sh_sunxin: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shduiying", "shhuisheng"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_sunxin.mp3"],
	},

	sh_gudasao: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shhufen", "shjianbei"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_gudasao.mp3"],
	},

	sh_liyun: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shchaqing"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_liyun.mp3"],
	},

	sh_yangxiong: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shjizhan", "shxiongqi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_yangxiong.mp3"],
	},

	sh_shixiu: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shyidan", "shguao"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_shixiu.mp3"],
	},

	sh_leiheng: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shweiji", "shchongjia"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_leiheng.mp3"],
	},

	sh_jindajian: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shzhuanfu", "shchisheng"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_jindajian.mp3"],
	},

	sh_lijun: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shqinghong", "shjiaoqian"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_lijun.mp3"],
	},

	sh_xuanzan: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shlianzhu", "shjunjie"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_xuanzan.mp3"],
	},

	sh_xiezhen: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shchuanling", "shfushe"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_xiezhen.mp3"],
	},

	sh_xiebao: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shzhuilie", "shxuci"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_xiebao.mp3"],
	},

	sh_chaijin: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shjuantu", "shjuxian", "shguiyin"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_chaijin.mp3"],
	},

	sh_zhangshun: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shduqiu", "shfuyuan"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zhangshun.mp3"],
	},

	sh_fanrui: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shzuoyao", "shfengqi", "shyangsha"],
		hasHiddenSkill: true,
		dieAudios: ["ext:水泊娘山/audio/die/sh_fanrui.mp3"],
	},

	sh_ruanxiaoqi: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shjiaolan", "shzonglang", "shnilin"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_ruanxiaoqi.mp3"],
	},

	sh_liying: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shyingxi", "shyingshi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_liying.mp3"],
	},

	sh_yanqing: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shlaiwuying", "shquwuzong"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_yanqing.mp3"],
	},

	sh_shijin: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shwujin", "shrenxia"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_shijin.mp3"],
	},

	sh_huarong: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shyingong", "shshenbi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_huarong.mp3"],
	},

	sh_gongwang: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shhutun", "shguandi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_gongwang.mp3"],
	},

	sh_dingdesun: {
		sex: "female",
		group: "liang",
		hp: "4/5",
		skills: ["shjianhen", "shfeihu"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_dingdesun.mp3"],
	},

	sh_gongsunsheng: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shyouyun", "shyiqing"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_gongsunsheng.mp3"],
	},

	sh_guansheng: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shwuyao", "shweizhan"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_guansheng.mp3"],
	},

	sh_lizhong: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shshuaza", "shshouzi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_lizhong.mp3"],
	},

	sh_chaogai: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shxiaxing", "shyijie", "shxueshi"],
		isZhugong: true,
		dieAudios: ["ext:水泊娘山/audio/die/sh_chaogai.mp3"],
	},

	sh_yanpoxi: {
		sex: "female",
		group: "qun",
		hp: 3,
		skills: ["shdiaoman", "shxindang"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_yanpoxi.mp3"],
	},

	sh_panqiaoyun: {
		sex: "female",
		group: "qun",
		hp: 3,
		skills: ["shyufen", "shyanzi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_panqiaoyun.mp3"],
	},

	sh_zhuzhuzhu: {
		sex: "female",
		group: "qun",
		hp: 4,
		skills: ["shxiongju"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zhuzhuzhu.mp3"],
	},

	sh_caijing: {
		sex: "female",
		group: "shsong",
		hp: 3,
		skills: ["shduguo", "shshiting", "shqinye"],
		doubleGroup: ["shsong", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_caijing.mp3"],
	},

	sh_lizhu: {
		sex: "female",
		group: "shchu",
		hp: 3,
		skills: ["shjianwu", "shcheying"],
		doubleGroup: ["shchu", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_lizhu.mp3"],
	},

	sh_wuyanguang: {
		sex: "female",
		group: "shliao",
		hp: "4/4/3",
		skills: ["shqizhen"],
		doubleGroup: ["shliao", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_wuyanguang.mp3"],
	},

	sh_tongguan: {
		sex: "female",
		group: "shsong",
		hp: "3/4",
		skills: ["shxuxun", "shxiaojue", "shbitang"],
		doubleGroup: ["shsong", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_tongguan.mp3"],
	},

	sh_bianxiang: {
		sex: "female",
		group: "shjin",
		hp: 5,
		skills: ["shchijun", "shbengluan"],
		doubleGroup: ["shjin", "liang"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_bianxiang.mp3"],
	},

	sh_koumie: {
		sex: "female",
		group: "shchu",
		hp: 5,
		skills: ["shyaoyan"],
		doubleGroup: ["shchu", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_koumie.mp3"],
	},

	sh_baodaoyi: {
		sex: "female",
		group: "shnan",
		hp: 3,
		skills: ["shjianlai"],
		doubleGroup: ["shnan", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_baodaoyi.mp3"],
	},

	sh_shibao: {
		sex: "female",
		group: "shnan",
		hp: 4,
		skills: ["shzhaxi", "shpifeng"],
		doubleGroup: ["shnan", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_shibao.mp3"],
	},

	sh_pangwanchun: {
		sex: "female",
		group: "shnan",
		hp: 4,
		skills: ["shjuguan", "shyinyu"],
		doubleGroup: ["shnan", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_pangwanchun.mp3"],
	},

	sh_gaoqiu: {
		sex: "female",
		group: "shsong",
		hp: 3,
		skills: ["shdechong", "shzenzhong", "shyingdang"],
		doubleGroup: ["shsong", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_gaoqiu.mp3"],
	},

	sh_yangjian: {
		sex: "female",
		group: "shsong",
		hp: 3,
		skills: ["shquanfu", "shhaimou"],
		doubleGroup: ["shsong", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_yangjian.mp3"],
	},

	sh_zhaoji: {
		sex: "female",
		group: "shsong",
		hp: 3,
		skills: ["shhuijin", "shxuanhe", "shfengheng"],
		doubleGroup: ["shsong", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zhaoji.mp3"],
	},

	sh_qiaodaoqing: {
		sex: "female",
		group: "shjin",
		hp: 3,
		skills: ["shwuyin", "shfulong", "shyishen"],
		doubleGroup: ["shjin", "liang"],
		hasHiddenSkill: true,
		dieAudios: ["ext:水泊娘山/audio/die/sh_qiaodaoqing.mp3"],
	},

	sh_tianhu: {
		sex: "female",
		group: "shjin",
		hp: 4,
		skills: ["shjuluan", "shgemang"],
		doubleGroup: ["shjin", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_tianhu.mp3"],
	},

	sh_qiuqiongying: {
		sex: "female",
		group: "shjin",
		hp: 3,
		skills: ["shsihu", "shmengyuan"],
		doubleGroup: ["shjin", "liang"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_qiuqiongying.mp3"],
	},

	sh_yelvhui: {
		sex: "female",
		group: "shliao",
		hp: 5,
		skills: ["shtujiang", "shlangsi", "shhaoye"],
		doubleGroup: ["shliao", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_yelvhui.mp3"],
	},

	sh_jiutianxuannv: {
		sex: "female",
		group: "shen",
		hp: "3/6",
		skills: ["shyingtian", "shxingju", "shdianzhen", "shhuitian"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_jiutianxuannv.mp3"],
	},

	sh_duansanniang: {
		sex: "female",
		group: "shchu",
		hp: 4,
		skills: ["shjieyuan", "shqiangfu"],
		doubleGroup: ["shchu", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_duansanniang.mp3"],
	},

	sh_zengzengzengzengzeng: {
		sex: "female",
		group: "qun",
		hp: 5,
		skills: ["shguzhai"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_zengzengzengzengzeng.mp3"],
	},

	sh_lishishi: {
		sex: "female",
		group: "shsong",
		hp: 3,
		skills: ["shfangyin", "shwanmeng"],
		doubleGroup: ["shsong", "qun"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_lishishi.mp3"],
	},

	// ========== 已注释的武将（取消注释即可启用） ==========
	/*
	sh_andaoquan: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shbazhen","shtongmai"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_andaoquan.mp3"],
	},
*/

	/*
	sh_chenda: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shhanzhan","shlvli"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_chenda.mp3"],
	},
*/

	/*
	sh_duxing: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shxingbin"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_duxing.mp3"],
	},
*/

	/*
	sh_yangchun: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shqiancong"],
	},
*/

	/*
	sh_wangying: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shyinzi"],
	},
*/

	/*
	sh_lvfang: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shzuojun","shzhuying"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_lvfang.mp3"],
	},
*/

	/*
	sh_guosheng: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shyoubing","shzhuifeng"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_guosheng.mp3"],
	},
*/

	/*
	sh_qinming: {
		sex: "female",
		group: "liang",
		hp: 5,
		skills: ["shfengshou","shchimou"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_qinming.mp3"],
	},
*/

	/*
	sh_luzhishen: {
		sex: "female",
		group: "liang",
		hp: 5,
		skills: ["shduwo"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_luzhishen.mp3"],
	},
*/

	/*
	sh_wanglun: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shjixian","shxiaxin","shchizhu"],
		isZhugong: true,
		dieAudios: ["ext:水泊娘山/audio/die/sh_wanglun.mp3"],
	},
*/

	/*
	sh_ximenqing: {
		sex: "female",
		group: "qun",
		hp: "3/4",
		skills: ["shqinyu","shshibi"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_ximenqing.mp3"],
	},
*/

	/*
	sh_hongxin: {
		sex: "female",
		group: "shsong",
		hp: 4,
		skills: ["shzoumo"],
		dieAudios: ["ext:水泊娘山/audio/die/sh_hongxin.mp3"],
	},
*/

	/*
	sh_muban: {
		sex: "female",
		group: "qun",
		hp: 1,
		skills: ["shmuban"],
	},
*/
};
if (lib.device || lib.node) {
	for (var i in character) {
		character[i].img = "extension/水泊娘山/character/image/" + i + ".jpg";
		character[i].dieAudios = ["ext:水泊娘山/character/audio/die/" + i + ".mp3"];
	}
} else {
	for (var i in character) {
		character[i].img = "db:extension-水泊娘山:" + i + ".jpg";
		character[i].dieAudios = ["db:extension-水泊娘山:" + i + ".mp3"];
	}
}
export default character;
