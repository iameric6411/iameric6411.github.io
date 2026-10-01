// 后翼棄兵課程:驗證所有變化的著法合法性,並預先算好每一步的局面(FEN)。
// 頁面只讀 JSON,不需要在瀏覽器裡跑走子引擎。
// Run from repo root:  npm i --no-save chess.js@0.10.3 && node scripts/build-chess-qg.js
const fs=require('fs');
const {Chess}=require('chess.js');

// notes 的 key = 第幾個半步(1 = 1.d4,2 = 1...d5 …);只標關鍵手
const LESSONS=[
{
  id:'l1',title:'第 1 課 · 后翼接受棄兵 QGA(2…dxc4)',
  goal:'知道「棄兵」其實拿得回來;不要為了守兵而犧牲發展。',
  ideas:[
    '白方 e3 + Bxc4 輕鬆把兵吃回來,同時完成發展。',
    '黑方最常見的錯誤:用 …b5 硬守 c4 兵 → a4! 拆掉兵鏈。',
    '3.e4 直接佔中心是較積極的選擇,但要小心 …e5 的反擊。',
  ],
  lines:[
    {name:'主線:3.Nf3 + e3 吃回兵',side:'w',
     moves:'d4 d5 c4 dxc4 Nf3 Nf6 e3 e6 Bxc4 c5 O-O a6',
     notes:{4:'黑方吃兵。這不是真的棄兵——白方幾乎一定能拿回來。',5:'先出馬,阻止 …e5。',7:'打開 f1 象的線路,準備 Bxc4。',9:'兵拿回來了,而且象已經出動 → 白方發展領先。',10:'黑方標準反擊:攻擊 d4 中心。',12:'…a6 準備 …b5 搶空間。白方常見計畫:Qe2、Rd1、dxc5 或 e4 推進。'},
     plan:['白:Qe2 + Rd1,中線施壓;時機成熟推 e4 或 d5。','黑:…b5、…Bb7、…Nbd7、…Qc7,活躍后翼。']},
    {name:'陷阱:黑方 …b5 硬守兵',side:'w',trap:true,
     moves:'d4 d5 c4 dxc4 e3 b5 a4 c6 axb5 cxb5 Qf3',
     notes:{6:'1000–1500 分段超常見!黑想守住多的兵。',7:'立刻攻擊兵鏈的根部。',8:'看起來守住了……',10:'c6、b7 兩格都空了 → 長斜線 f3–a8 完全打開。',11:'雙重攻擊:后同時攻擊 a8 車,黑方必丟一車或至少一子。'},
     plan:['教訓(黑方):QGA 不要守兵,專心發展 …Nf6、…e6、…c5。','教訓(白方):看到 …b5 先想 a4,再看長斜線。']},
    {name:'3.e4 佔中心 vs …e5 反擊',side:'w',
     moves:'d4 d5 c4 dxc4 e4 e5 Nf3 exd4 Bxc4 Nc6 O-O',
     notes:{5:'直接建立大中心。',6:'黑方最好的回應之一:立刻挑戰中心。',8:'黑吃兵,但白方發展速度更快。',9:'吃回 c4 兵,同時瞄準 f7(黑方最弱點)。',11:'王車易位;下一步 c3 或 Bg5,用發展優勢換回 d4 兵。'},
     plan:['白:快速出子,用 Qb3 / Bxf7+ 等戰術打 f7。','黑:注意 f7,先 …Bc5 / …Nf6 完成發展。']},
  ]
},
{
  id:'l2',title:'第 2 課 · 后翼拒絕棄兵 正統防禦 QGD(2…e6)',
  goal:'學會 QGD 標準佈局,並絕對不要掉進「大象陷阱」。',
  ideas:[
    '黑方 …e6 穩固 d5,代價是 c8 象被自己的兵關住(「壞象」)。',
    '白方典型配置:Nc3、Bg5、e3、Nf3、Rc1、Bd3。',
    '黑方解放手段:…dxc4 + …Nd5 換子(Capablanca 解放法),再 …e5。',
  ],
  lines:[
    {name:'正統主線(Capablanca 解放法)',side:'w',
     moves:'d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 Nbd7 Rc1 c6 Bd3 dxc4 Bxc4 Nd5 Bxe7 Qxe7 O-O Nxc3 Rxc3 e5',
     notes:{4:'QGD:穩守 d5。',7:'牽制 f6 馬,間接對 d5 施壓。',13:'車放在 c 線,c 線遲早會打開。',16:'黑方等白象動了才吃 c4,讓白方「浪費一步」。',18:'Capablanca 的解放法:換掉子力,減輕空間劣勢。',24:'…e5!黑方終於解放 c8 象,局面大致平衡。'},
     plan:['白:中心優勢 + c 線壓力;可考慮 Bb3、Qc2、Rd1。','黑:換子 + …e5 或 …c5 打開局面,讓 c8 象出來。']},
    {name:'陷阱:大象陷阱(Elephant Trap)',side:'b',trap:true,
     moves:'d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5 Nxd5 Bxd8 Bb4+ Qd2 Bxd2+ Kxd2 Kxd8',
     notes:{8:'看起來 d5 只靠 Nf6 守,而 Nf6 被牽制了……',11:'白方以為贏一兵:Nf6 被牽制不能吃?',12:'錯!f6 馬「牽制」只是假象,馬直接吃回來。',13:'白方吃后……',14:'將軍!',16:'黑方吃回后。',18:'結算:黑方淨賺一子(白方丟馬只換到一兵)。白方 1000–1500 分段很常中這招。'},
     plan:['白方記住:Nbd7 之後的 Bg5 牽制是「假牽制」,不要 Nxd5。','黑方:這是你下 QGD 的免費彩蛋。']},
    {name:'黑方武器:劍橋泉變例(Cambridge Springs)',side:'b',
     moves:'d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 e3 c6 Nf3 Qa5 Nd2 Bb4 Qc2 O-O Be2 e5',
     notes:{12:'…Qa5!后沿 a5–e1 斜線牽制 c3 馬,同時盯著 g5 象(…dxc4、…Ne4 的戰術)。',13:'白方最穩的應對:Nd2 守 c4,並解除 …Ne4 威脅。',14:'再加一次牽制 c3。',18:'…e5 打開中心,黑方子力活躍。'},
     plan:['黑:…Qa5 + …Bb4 雙重牽制,找 …Ne4 / …dxc4 戰術。','白:Nd2、Qc2 穩住,不要讓 g5 象懸空。']},
  ]
},
{
  id:'l3',title:'第 3 課 · QGD 交換變例 與 少數兵進攻',
  goal:'理解 Carlsbad 兵型,學會白方最經典的中局計畫:少數兵進攻(b4–b5)。',
  ideas:[
    'cxd5 exd5 之後形成 Carlsbad 兵型:黑方 d5/c6 vs 白方 d4/e3。',
    '白方「少數兵進攻」:用 a、b 兩兵攻擊黑方 a、b、c 三兵 → b5 製造 c6 弱兵。',
    '黑方對策:王翼進攻(…Ne4、…f5、…Ng6),或 …a5 阻止 b4。',
  ],
  lines:[
    {name:'交換變例 → 少數兵進攻',side:'w',
     moves:'d4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 c6 e3 Be7 Bd3 Nbd7 Qc2 O-O Nf3 Re8 O-O Nf8 Rab1 Ng6 b4',
     notes:{7:'先交換,固定兵型。',8:'Carlsbad 兵型成形。',13:'Bd3 + Qc2 瞄準 h7,阻止 …Bf5 換掉白方好象。',20:'Nbd7–f8–g6 是黑方標準調度,支援王翼。',21:'車到 b 線:準備少數兵進攻。',23:'b4!下一步 b5,攻擊 c6,製造弱兵。'},
     plan:['白:b4–b5 → bxc6,把黑方 c 兵變成弱兵或孤兵,然後用車、馬圍攻。','黑:王翼反擊 …Ne4、…Bd6、…Qf6、…h5,速度要夠快。']},
  ]
},
{
  id:'l4',title:'第 4 課 · 斯拉夫防禦 Slav(2…c6)',
  goal:'學會斯拉夫主線,並學會懲罰「太早 …Bf5」的弱點(b7)。',
  ideas:[
    '…c6 守 d5 但不擋 c8 象 → 黑方的「好象」可以出到 f5 / g4。',
    '代價:象出去之後 b7 兵變弱,Qb3 是白方標準手段。',
    '交換斯拉夫(3.cxd5)是穩健、對稱的選擇,適合不想背理論的人。',
  ],
  lines:[
    {name:'斯拉夫主線(4…dxc4 5.a4)',side:'w',
     moves:'d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4 Bb4 O-O O-O Qe2 Nbd7 e4 Bg6 Bd3',
     notes:{8:'黑方吃兵,準備 …b5 守住。',9:'a4!阻止 …b5。代價是 b4 格變弱。',10:'象在兵鏈之外出動——這就是斯拉夫的精神。',13:'兵吃回來了。',14:'利用 b4 弱格牽制 c3。',19:'e4!白方建立中心,攻擊 f5 象。',21:'局面平衡,白方中心較大,黑方子力舒服。'},
     plan:['白:e4–e5 搶空間,或 d5 突破。','黑:…Bh5、…e5 或 …c5 挑戰中心。']},
    {name:'懲罰太早的 …Bf5:Qb3!',side:'w',trap:true,
     moves:'d4 d5 c4 c6 Nc3 Nf6 e3 Bf5 cxd5 cxd5 Qb3 Qb6 Nf3 e6 Nh4 Bg6 Nxg6 hxg6',
     notes:{8:'象出去了 → b7 兵沒人守。',11:'Qb3!同時攻擊 b7(和 d5)。1000–1500 分段黑方常直接丟 b7。',12:'最好的防守,但黑后被牽著走。',15:'Nh4!追殺 f5 象。',17:'白方換掉黑方的好象,拿到雙象優勢。'},
     plan:['白:看到 …Bf5 立刻想「b7 誰在守?」→ Qb3。','黑:先 …e6 / …Qb6 再出象,或改走 …Bg4。']},
    {name:'交換斯拉夫(3.cxd5)',side:'w',
     moves:'d4 d5 c4 c6 cxd5 cxd5 Nc3 Nf6 Bf4 Nc6 e3 Bf5 Nf3 e6 Qb3 Bb4 Bb5 O-O',
     notes:{5:'對稱兵型:風險低、理論少。',9:'Bf4:象先出到兵鏈之外。',15:'又是 Qb3 打 b7 的主題!',16:'黑方用牽制反擊。',17:'白方回敬牽制 c6。對稱局面裡,先手的一方容易多拿到一點主動。'},
     plan:['白:Rc1 + 佔 c 線,O-O 後 Ne5 進入。','黑:同樣爭 c 線,…Qa5 / …Rc8。']},
  ]
},
{
  id:'l5',title:'第 5 課 · 半斯拉夫 Semi-Slav(…c6 + …e6)',
  goal:'認得半斯拉夫的「Meran」結構,知道 e4 / d5 中心突破的意義。',
  ideas:[
    '黑方 …c6 + …e6:極度穩固,但 c8 象又被關住了。',
    'Meran:黑方 …dxc4 + …b5 搶后翼空間,…Bb7 + …c5 解放象。',
    '白方對策:e4 推進,時機到就 d5 打開中心。',
  ],
  lines:[
    {name:'Meran 變例',side:'w',
     moves:'d4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Nbd7 Bd3 dxc4 Bxc4 b5 Bd3 Bb7 O-O a6 e4 c5 d5 Qc7',
     notes:{8:'半斯拉夫:…c6 + …e6。',12:'等白象走了才吃,和 QGD 同一個想法。',14:'…b5 先手攻象,搶后翼空間。',16:'象出到長斜線,準備 …c5 打開它。',19:'e4!白方先在中心行動。',21:'d5!封住 b7 象的斜線,中心戰鬥開始。'},
     plan:['白:e5 / d5 中心突破,Nh4–f5 等王翼進攻。','黑:…c4 / …c5 打開后翼,用 b7 象對準 e4、g2。']},
  ]
},
{
  id:'l6',title:'第 6 課 · 阿爾賓反棄兵 Albin(2…e5)',
  goal:'1000–1500 分段「最危險」的偏門:要知道主線怎麼走,更要避開 Lasker 陷阱。',
  ideas:[
    '黑方棄 e 兵,用 d4 兵卡住白方發展。',
    '白方最穩:Nf3 + g3 + Bg2,之後找機會吃 d4 兵。',
    '絕對不要 4.e3?? —— 會落入黑方「升變成馬」的經典陷阱。',
  ],
  lines:[
    {name:'正確應對:4.Nf3 + 5.g3',side:'w',
     moves:'d4 d5 c4 e5 dxe5 d4 Nf3 Nc6 g3 Bg4 Bg2 Qd7 O-O O-O-O',
     notes:{4:'阿爾賓反棄兵!',6:'d4 兵深入白方陣地,卡住 Nc3 與 e3。',7:'先發展,不急著動 e 兵。',9:'g3 + Bg2:長斜線瞄準 b7,未來配合 Qa4、b4–b5。',14:'黑方異側易位,準備 …h5–h4 王翼衝兵。白方要比快:b4–b5、Qa4 進攻黑王。'},
     plan:['白:多一兵,保持 e5 兵,后翼兵快速推進打黑王。','黑:…h5–h4、…Bh3 換掉 g2 象,王翼強攻。']},
    {name:'陷阱:Lasker 陷阱(4.e3?)',side:'b',trap:true,
     moves:'d4 d5 c4 e5 dxe5 d4 e3 Bb4+ Bd2 dxe3 Bxb4 exf2+ Ke2 fxg1=N+ Ke1 Qh4+ Kd2 Nc6',
     notes:{7:'看起來很自然,但這是錯誤。',8:'將軍!',10:'黑方不理會象被攻擊,兵繼續前進!',11:'白方吃象……',12:'兵將軍,同時攻擊 g1。',13:'(13.Kxf2 Qxd1 黑方吃后)',14:'升變成馬!而且是將軍——升后反而沒將軍,白方就能喘口氣。',16:'黑方子力全面湧入,白王暴露在中央,黑方大優。'},
     plan:['白方:對付阿爾賓,記住「Nf3 + g3」,不要 e3。','黑方:這是你下阿爾賓的最大彩蛋。']},
  ]
},
{
  id:'l7',title:'第 7 課 · 塔拉什防禦 Tarrasch(3…c5)與孤兵',
  goal:'理解「孤立后兵(IQP)」的優缺點——這是所有 d4 開局都會遇到的中局結構。',
  ideas:[
    '黑方換來孤立 d5 兵,換取子力活躍與空間。',
    '白方:g3 + Bg2 長斜線直接壓 d5;換子越多,孤兵越弱。',
    '持孤兵方:避免換子,找 …d4 突破或王翼攻擊。',
  ],
  lines:[
    {name:'塔拉什主線(g3 系統)',side:'w',
     moves:'d4 d5 c4 e6 Nc3 c5 cxd5 exd5 Nf3 Nc6 g3 Nf6 Bg2 Be7 O-O O-O Bg5 cxd4 Nxd4 h6 Be3 Re8',
     notes:{6:'塔拉什:黑方主動接受孤兵。',8:'d5 兵將會成為孤兵。',11:'g3 + Bg2:象在長斜線上直接瞄準 d5。',17:'Bg5 再加壓 f6(d5 的守護者)。',19:'孤兵成形:d5 兩側沒有 c、e 兵了。',22:'典型局面:白方攻 d5,黑方靠子力活躍撐住。'},
     plan:['白:Rc1、Qb3、Rd1 疊壓 d5,換掉守 d5 的子(特別是 f6 馬)。','黑:…Bg4 / …Qd7、…Rad8,伺機 …d4 突破。']},
  ]
},
{
  id:'l8',title:'第 8 課 · 偏門應對大全(低分段很常見)',
  goal:'看到 2…Nc6、2…Bf5、2…Nf6、2…c5 不慌張:每種都有簡單、穩健的應對。',
  ideas:[
    '原則:發展子力、佔中心、看 b7 兵 —— 偏門多半有一個結構性弱點。',
    '對方「不守 d5」的偏門(…Nf6、…c5)→ 用 e4 建大中心。',
    '對方早出象(…Bf5、…Bg4)→ 先想 Qb3。',
  ],
  lines:[
    {name:'奇哥林防禦 Chigorin(2…Nc6)',side:'w',
     moves:'d4 d5 c4 Nc6 Nf3 Bg4 cxd5 Bxf3 gxf3 Qxd5 e3 e5 Nc3 Bb4 Bd2 Bxc3 bxc3',
     notes:{4:'擋住 c 兵、用子力而非兵型守中心。',8:'黑方換掉 f3 馬,白方得雙象。',10:'后吃回兵,佔據中央。',13:'出馬同時攻后(先手發展)。',17:'白方雙象 + 強大中心,長遠佔優;兵型雖亂但值得。'},
     plan:['白:雙象 + 中心,打開局面(c4、e4、Rg1)。','黑:封閉局面,讓馬比象強。']},
    {name:'波羅的海防禦 Baltic(2…Bf5)',side:'w',
     moves:'d4 d5 c4 Bf5 cxd5 Bxb1 Rxb1 Qxd5 a3 Nf6 Nf3 e6 e3',
     notes:{4:'象馬上出來 → 又是 b7 弱點問題。',6:'黑方換掉 b1 馬,不然 Qb3 很難受。',8:'黑后吃回兵。',9:'a3:防止 …Qa5+ / …Bb4+,準備 b4。',13:'白方雙象 + 穩固中心,舒服的優勢。'},
     plan:['白:雙象 + 中心,b4 擴張后翼。','黑:快速 …Nc6、…Bd6、…O-O 追上發展。']},
    {name:'馬歇爾防禦 Marshall(2…Nf6)',side:'w',
     moves:'d4 d5 c4 Nf6 cxd5 Nxd5 e4 Nf6 Nc3',
     notes:{4:'黑方沒有守 d5。',5:'直接吃!',7:'e4 先手趕馬,建立 d4 + e4 理想中心。',9:'白方中心大、發展順,明顯佔優。'},
     plan:['白:Bd3、Nf3、O-O,中心兵是你的資產。','黑:…e5 或 …c5 挑戰中心,但已經落後。']},
    {name:'對稱防禦(2…c5)',side:'w',
     moves:'d4 d5 c4 c5 cxd5 Qxd5 Nf3 cxd4 Nc3 Qa5 Nxd4 Nf6 e4',
     notes:{4:'模仿白方。',6:'黑后太早出動……',9:'Nc3 先手攻后,一邊發展一邊趕后。',13:'白方大幅領先發展、中心強大。'},
     plan:['白:用發展領先追打黑后(Nb3、Bd2)。','黑:盡快 …e6、…Be7、…O-O。']},
  ]
},
];

const out={version:'1.0',built:new Date().toISOString().slice(0,10),lessons:[]};
let bad=0;
for(const L of LESSONS){
  const lessonOut={...L,lines:[]};
  for(const ln of L.lines){
    const g=new Chess();
    const sans=ln.moves.trim().split(/\s+/);
    const plies=[{fen:g.fen()}];
    for(const s of sans){
      const m=g.move(s,{sloppy:false});
      if(!m){console.error(`ILLEGAL in [${L.id}] ${ln.name}: ${s} (after ${plies.length-1} plies)`);bad++;break;}
      plies.push({san:m.san,from:m.from,to:m.to,fen:g.fen()});
    }
    for(const k of Object.keys(ln.notes||{})) if(+k>=plies.length){console.error(`NOTE out of range [${L.id}] ${ln.name}: ${k}`);bad++;}
    const {moves,...rest}=ln;
    lessonOut.lines.push({...rest,plies});
  }
  out.lessons.push(lessonOut);
}
if(bad){console.error(`${bad} error(s)`);process.exit(1);}
fs.writeFileSync('data/chess-qg.json',JSON.stringify(out));
console.log('ok:',out.lessons.reduce((n,l)=>n+l.lines.length,0),'lines');
