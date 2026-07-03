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
	},

	sh_lili: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shsixing", "shyuxun"],
	},

	sh_xueyong: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shnongwu"],
	},

	sh_zhugui: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shyaomeng", "shdongzhu"],
	},

	sh_dengfei: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shbenjiu"],
	},

	sh_zhoutong: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shduogui", "shdaozhui"],
	},

	sh_muchun: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shzhenwei"],
	},

	sh_oupeng: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shboshi"],
	},

	sh_sunerniang: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shjiepeng", "shjiayao", "shzhenjiu"],
	},

	sh_husanniang: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shwushuang", "shchanjin"],
	},

	sh_baisheng: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shlieri", "shyuyin"],
	},

	sh_yuehe: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shqinhui", "shkangge"],
	},

	sh_malin: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shjingdi"],
	},

	sh_yubaosi: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shpixian", "shpengshuai"],
	},

	sh_baoxu: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shxiongjian", "shbaoshi"],
	},

	sh_xiaorang: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shweishu", "shcangfeng"],
	},

	sh_peixuan: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shdingpan", "shgengzheng"],
	},

	sh_tanglong: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shyebing", "shjianghun"],
	},

	sh_duanjingzhu: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shqiema", "shhuoqi"],
	},

	sh_mengkang: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shzaomeng", "shsuizhen"],
	},

	sh_jiangjing: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shleiju"],
	},

	sh_huangfuduan: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shxiangma", "shshengxi"],
		names: "皇甫|端",
	},

	sh_zhuwu: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shguanshi", "shkunbian"],
	},

	sh_shiqian: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shweibu", "shyafeng"],
	},

	sh_wangdingliu: {
		sex: "female",
		group: "liang",
		hp: 3,
		maxHp: 6,
		skills: ["shhuoshan", "shquexi"],
	},

	sh_huangxin: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shpingyue"],
	},

	sh_sunli: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shxuanzhen"],
	},

	sh_haosiwen: {
		sex: "female",
		group: "liang",
		hp: 4,
		maxHp: 5,
		skills: ["shlingchen", "shguahuo"],
	},

	sh_zhufu: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shfengchun", "shcangren"],
	},

	sh_houjian: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shzhijing", "shmifeng"],
	},

	sh_shantinggui: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shjinbing"],
	},

	sh_weidingguo: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shjianghuo", "shbingyin"],
	},

	sh_yanshun: {
		sex: "female",
		group: "liang",
		hp: 6,
		skills: ["shjierao"],
	},

	sh_lingzhen: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shhongchong", "shchiyan"],
	},

	sh_yanglin: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shfuxing", "shqiuxian"],
	},

	sh_pengqi: {
		sex: "female",
		group: "liang",
		hp: 5,
		skills: ["shshenbing", "shtianmu"],
	},

	sh_hantao: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shlianzheng"],
	},

	sh_caifu: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shguixing"],
	},

	sh_kongming: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shhuixiong"],
	},

	sh_kongliang: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shwunu", "shzhengchou"],
	},

	sh_liutang: {
		sex: "female",
		group: "liang",
		hp: 5,
		skills: ["shpiaopeng", "shhenglue", "shjinchong"],
	},

	sh_wuyong: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shqiongji", "shjiaozhi"],
	},

	sh_caozheng: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shtujie"],
	},

	sh_huyanzhuo: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shlianji", "shyubing"],
		names: "呼延|灼",
	},

	sh_songjiang: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shjuyi", "shtiankui"],
		isZhugong: true,
	},

	sh_dongping: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shpozhen", "shchouni"],
	},

	sh_zhengtianshou: {
		sex: "female",
		group: "liang",
		hp: 3,
		maxHp: 4,
		skills: ["shaiai", "shhanhan"],
	},

	sh_daizong: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shshenxing", "shzoutan"],
	},

	sh_muhong: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shzhiba", "shduofan"],
	},

	sh_taozongwang: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shgengjue"],
	},

	sh_caiqing: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shwoxuan", "shbinhua"],
	},

	sh_zhangheng: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shxingshao", "shjinghun"],
	},

	sh_likui: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shxuanfeng"],
	},

	sh_zouyuan: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shzhebang"],
	},

	sh_zourun: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shtouchui", "shyijiao"],
	},

	sh_zhangqing: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shfeixing", "shzhengxuan"],
	},

	sh_tongwei: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shjilang"],
	},

	sh_tongmeng: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shfanjiang"],
	},

	sh_jiaoting: {
		sex: "female",
		group: "liang",
		hp: 7,
		skills: ["shpudou"],
	},

	sh_suochao: {
		sex: "female",
		group: "liang",
		hp: 5,
		skills: ["shdengfeng"],
	},

	sh_ruanxiaoer: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shqiujin"],
	},

	sh_ruanxiaowu: {
		sex: "female",
		group: "liang",
		hp: 3,
		maxHp: 4,
		skills: ["shduanming", "shzangliu"],
	},

	sh_shien: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shenyu", "shyiduo"],
	},

	sh_zhangqing2: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shshilun", "shcaiyin"],
	},

	sh_shiyong: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shhaoyong", "shshaqian"],
	},

	sh_xuning: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shluanji", "shhuaibi"],
	},

	sh_yangzhi: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shguzhi", "shantu"],
	},

	sh_zhutong: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shfengxuan", "shyishi"],
	},

	sh_sunxin: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shduiying", "shhuisheng"],
	},

	sh_gudasao: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shhufen", "shjianbei"],
	},

	sh_liyun: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shchaqing"],
	},

	sh_yangxiong: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shjizhan", "shxiongqi"],
	},

	sh_shixiu: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shyidan", "shguao"],
	},

	sh_leiheng: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shweiji", "shchongjia"],
	},

	sh_jindajian: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shzhuanfu", "shchisheng"],
	},

	sh_lijun: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shqinghong", "shjiaoqian"],
	},

	sh_xuanzan: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shlianzhu", "shjunjie"],
	},

	sh_xiezhen: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shchuanling", "shfushe"],
	},

	sh_xiebao: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shzhuilie", "shxuci"],
	},

	sh_chaijin: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shjuantu", "shjuxian", "shguiyin"],
	},

	sh_zhangshun: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shduqiu", "shfuyuan"],
	},

	sh_fanrui: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shzuoyao", "shfengqi", "shyangsha"],
		hasHiddenSkill: true,
	},

	sh_ruanxiaoqi: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shjiaolan", "shzonglang", "shnilin"],
	},

	sh_liying: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shyingxi", "shyingshi"],
	},

	sh_yanqing: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shlaiwuying", "shquwuzong"],
	},

	sh_shijin: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shwujin", "shrenxia"],
	},

	sh_huarong: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shyingong", "shshenbi"],
	},

	sh_gongwang: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shhutun", "shguandi"],
	},

	sh_dingdesun: {
		sex: "female",
		group: "liang",
		hp: 4,
		maxHp: 5,
		skills: ["shjianhen", "shfeihu"],
	},

	sh_gongsunsheng: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shyouyun", "shyiqing"],
		names: "公孙|胜",
	},

	sh_guansheng: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shwuyao", "shweizhan"],
	},

	sh_lizhong: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shshuaza", "shshouzi"],
	},

	sh_chaogai: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shxiaxing", "shyijie", "shxueshi"],
		isZhugong: true,
	},

	sh_yanpoxi: {
		sex: "female",
		group: "qun",
		hp: 3,
		skills: ["shdiaoman", "shxindang"],
	},

	sh_panqiaoyun: {
		sex: "female",
		group: "qun",
		hp: 3,
		skills: ["shyufen", "shyanzi"],
	},

	sh_zhuzhuzhu: {
		sex: "female",
		group: "qun",
		hp: 4,
		skills: ["shxiongju"],
	},

	sh_caijing: {
		sex: "female",
		group: "shsong",
		hp: 3,
		skills: ["shduguo", "shshiting", "shqinye"],
		doubleGroup: ["shsong", "qun"],
	},

	sh_lizhu: {
		sex: "female",
		group: "shchu",
		hp: 3,
		skills: ["shjianwu", "shcheying"],
		doubleGroup: ["shchu", "qun"],
	},

	sh_wuyanguang: {
		sex: "female",
		group: "shliao",
		hp: 4,
		hujia: 3,
		skills: ["shqizhen"],
		doubleGroup: ["shliao", "qun"],
	},

	sh_tongguan: {
		sex: "female",
		group: "shsong",
		hp: 3,
		maxHp: 4,
		skills: ["shxuxun", "shxiaojue", "shbitang"],
		doubleGroup: ["shsong", "qun"],
	},

	sh_bianxiang: {
		sex: "female",
		group: "shjin",
		hp: 5,
		skills: ["shchijun", "shbengluan"],
		doubleGroup: ["shjin", "liang"],
	},

	sh_koumie: {
		sex: "female",
		group: "shchu",
		hp: 5,
		skills: ["shyaoyan"],
		doubleGroup: ["shchu", "qun"],
	},

	sh_baodaoyi: {
		sex: "female",
		group: "shnan",
		hp: 3,
		skills: ["shjianlai"],
		doubleGroup: ["shnan", "qun"],
	},

	sh_shibao: {
		sex: "female",
		group: "shnan",
		hp: 4,
		skills: ["shzhaxi", "shpifeng"],
		doubleGroup: ["shnan", "qun"],
	},

	sh_pangwanchun: {
		sex: "female",
		group: "shnan",
		hp: 4,
		skills: ["shjuguan", "shyinyu"],
		doubleGroup: ["shnan", "qun"],
	},

	sh_gaoqiu: {
		sex: "female",
		group: "shsong",
		hp: 3,
		skills: ["shdechong", "shzenzhong", "shyingdang"],
		doubleGroup: ["shsong", "qun"],
	},

	sh_yangjian: {
		sex: "female",
		group: "shsong",
		hp: 3,
		skills: ["shquanfu", "shhaimou"],
		doubleGroup: ["shsong", "qun"],
	},

	sh_zhaoji: {
		sex: "female",
		group: "shsong",
		hp: 3,
		skills: ["shhuijin", "shxuanhe", "shfengheng"],
		doubleGroup: ["shsong", "qun"],
		isZhugong: true,
	},

	sh_qiaodaoqing: {
		sex: "female",
		group: "shjin",
		hp: 3,
		skills: ["shwuyin", "shfulong", "shyishen"],
		doubleGroup: ["shjin", "liang"],
		hasHiddenSkill: true,
	},

	sh_tianhu: {
		sex: "female",
		group: "shjin",
		hp: 4,
		skills: ["shjuluan", "shgemang"],
		doubleGroup: ["shjin", "qun"],
		isZhugong: true,
	},

	sh_qiuqiongying: {
		sex: "female",
		group: "shjin",
		hp: 3,
		skills: ["shsihu", "shmengyuan"],
		doubleGroup: ["shjin", "liang"],
	},

	sh_yelvhui: {
		sex: "female",
		group: "shliao",
		hp: 5,
		skills: ["shtujiang", "shlangsi", "shhaoye"],
		doubleGroup: ["shliao", "qun"],
		isZhugong: true,
	},

	sh_jiutianxuannv: {
		sex: "female",
		group: "shen",
		hp: 3,
		maxHp: 6,
		skills: ["shyingtian", "shxingju", "shdianzhen", "shhuitian"],
	},

	sh_duansanniang: {
		sex: "female",
		group: "shchu",
		hp: 4,
		skills: ["shjieyuan", "shqiangfu"],
		doubleGroup: ["shchu", "qun"],
	},

	sh_zengzengzengzengzeng: {
		sex: "female",
		group: "qun",
		hp: 5,
		skills: ["shguzhai"],
	},

	sh_lishishi: {
		sex: "female",
		group: "shsong",
		hp: 3,
		skills: ["shfangyin", "shwanmeng"],
		doubleGroup: ["shsong", "qun"],
	},

	// ========== 已注释的武将（取消注释即可启用） ==========
	/*
	sh_andaoquan: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shbazhen","shtongmai"],
	},
*/

	/*
	sh_chenda: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shhanzhan","shlvli"],
	},
*/

	/*
	sh_duxing: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shxingbin"],
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
	},
*/

	/*
	sh_guosheng: {
		sex: "female",
		group: "liang",
		hp: 4,
		skills: ["shyoubing","shzhuifeng"],
	},
*/

	/*
	sh_qinming: {
		sex: "female",
		group: "liang",
		hp: 5,
		skills: ["shfengshou","shchimou"],
	},
*/

	/*
	sh_luzhishen: {
		sex: "female",
		group: "liang",
		hp: 5,
		skills: ["shduwo"],
	},
*/

	/*
	sh_wanglun: {
		sex: "female",
		group: "liang",
		hp: 3,
		skills: ["shjixian","shxiaxin","shchizhu"],
		isZhugong: true,
	},
*/

	/*
	sh_ximenqing: {
		sex: "female",
		group: "qun",
		hp: 3,
		maxHp: 4,
		skills: ["shqinyu","shshibi"],
		names: "西门|庆",
	},
*/

	/*
	sh_hongxin: {
		sex: "female",
		group: "shsong",
		hp: 4,
		skills: ["shzoumo"],
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
