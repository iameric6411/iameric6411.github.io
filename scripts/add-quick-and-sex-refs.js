// 1.2 + 2.1:
// - 加性別專屬參考值 (Hb, Cr, +ferritin)
// - 新增 ferritin 一筆
// - 每筆加 quick 一句話處置
const fs=require('fs');
const path='data/labs.json';
const labs=JSON.parse(fs.readFileSync(path,'utf8'));
const find=id=>labs.find(l=>l.id===id);

// ----- 性別專屬參考值 (Harrison's 21e ballpark;依各院 LIS 略異) -----
const hb=find('hb');
hb.refMale=[13.5,17.5];
hb.refFemale=[12.0,15.5];

const cr=find('cr');
cr.refMale=[0.7,1.2];
cr.refFemale=[0.5,1.0];

// ----- 新增 ferritin -----
if(!find('ferritin')){
  labs.push({
    id:'ferritin',name:'血清鐵蛋白',en:'Ferritin',panel:'CBC',unit:'ng/mL',
    refMale:[24,336],refFemale:[11,307],ref:[15,200],critical:null,
    high:{causes:['鐵負荷 / hemochromatosis(原發 HFE、輸血依賴)','急性期蛋白:感染、慢性發炎、自體免疫','急性肝損傷 / 慢性肝病','惡性腫瘤、淋巴瘤、Still 病、HLH(極高)'],
          mgmt:['排除發炎源後評估真鐵負荷','疑 hemochromatosis:HFE 基因、TSat、肝臟 MRI T2*','鐵負荷:放血(目標 ferritin < 50)或鐵螯合劑']},
    low:{causes:['缺鐵性貧血(IDA)— 最特異指標','慢性失血(腸胃道、月經、捐血)','吸收不良(coeliac、PPI 長期、bariatric)','茹素 + 鐵需求高(孕婦 / 青少女)'],
         mgmt:['積極找失血源(腸胃道、月經)','補鐵:口服 ferrous sulfate / fumarate / IV iron','追蹤反應:retic 5–10 日上升、Hb 4–8 週回升']},
    note:'IDA 強烈指標 ferritin < 30 ng/mL(BSH 2021);急性期蛋白,發炎時可假性「正常」遮蔽 IDA。',
    pitfall:[
      '急性期蛋白:感染、發炎、肝病、惡性腫瘤可使 ferritin 假性正常 / 升高 → 遮蔽 IDA',
      'BSH 2021:CRP 升高時,ferritin < 100 仍可能 IDA;搭配 TSat 判讀',
      'IDA 切點:< 30 強烈支持;30–100 需 TSat、CRP 鑑別 vs ACD',
      '輸血後短期升高、停血色素類補品(肝、紅肉)後緩慢下降',
    ],
    aliases:['ferritin','iron stores','SF','serum ferritin','鐵蛋白','血清鐵蛋白','鐵儲存量'],
  });
}

// ----- 每筆 quick 一句話處置(值班看一眼就知道下一步)-----
const QUICK={
  na:'急性症狀(癲癇 / 意識變化)→ 3% NS;否則依血容處理(限水 / 輸液),矯正速度 ≤ 10–12 mEq/L/日',
  k:'高 K → IV calcium + insulin/D50 + 噴霧 β2 + Kayexalate / 利尿 / 透析;低 K → 補 KCl + 先驗 / 補 Mg',
  cl:'多為續發,治療原發病(酸鹼、輸液、嘔吐 / NG drain);結合 AG 判讀',
  ca:'高 Ca → NS 200–300 mL/hr + 必要時 loop diuretic / zoledronate 4 mg;低 Ca → 補鈣 + 矯正 Mg + Vit D',
  mg:'IV MgSO₄(嚴重 / TdP);難治性低 K / 低 Ca 一律先驗 Mg',
  phos:'refeeding 高風險預防性補磷;高磷給 phosphate binder + 治療原發',
  bun:'BUN/Cr > 20 想腎前性(脫水 / 上消化道出血);< 10 想肝病 / 營養不良',
  cr:'停腎毒性藥、算 eGFR 分期;看趨勢比單點重要;肌肉量小者偏低',
  egfr:'分 G1–G5 + 白蛋白尿分級(A1–A3);G4–G5 轉腎臟科;急性期不適用',
  ast:'結合 ALT 看比值 / 來源;AST/ALT > 2 想酒精;> 1000 想病毒 / 藥毒 / 缺血',
  alt:'找肝損傷原因 → 停肝毒性藥;ALT > 1000 想病毒 / acetaminophen 中毒 / 缺血',
  alp:'配合 GGT 區分肝源 vs 骨源;肝源 → 評估膽道阻塞(US / MRCP)',
  ggt:'用於確認 ALP 升高是否為肝膽源;升高常見於酒精 / 酵素誘導藥物',
  tbil:'測 direct/indirect:direct > 50% → 阻塞 / 肝細胞;以 indirect 為主 → 溶血 / Gilbert',
  alb:'治療原發病 + 營養支持;低白蛋白記得校正鈣;急性發炎期下降不等於營養問題',
  wbc:'看 differential + ANC;ANC < 500 → 嚴重 neutropenia,感染防護 + 必要時 G-CSF',
  hb:'依 MCV 分類找病因;急性失血看趨勢與症狀,輸血依閾值 / 症狀決定(穩定 7、心血管病 8)',
  mcv:'< 80 想缺鐵 / 慢性病 / 地中海(看 ferritin、TSat);> 100 想 B12 / 葉酸 / 酒精 / 甲狀腺',
  plt:'< 20 出血風險高、避免侵入性處置 / 必要時輸血小板;TTP 禁忌輸血小板',
  inr:'warfarin 過量:停藥 ± 口服 Vit K;嚴重出血 → PCC(優先)或 FFP + IV Vit K;DOAC 不用 INR',
  aptt:'UFH 用 aPTT 監測;DOAC 不用;lupus AC 延長 aPTT 但實際促血栓',
  ddimer:'用於 rule-out 低 / 中度可能性 VTE;高值需影像確診;> 50 歲用 age × 10 µg/L cut-off',
  trop:'連續看(rise / fall ≥ 20%)走 ESC 0/1h 流程;非 ACS 升高想腎衰 / PE / 心肌炎 / 敗血症',
  bnp:'配合臨床與超音波;ARNi(Entresto)使用者改用 NT-proBNP;肥胖偏低、年長偏高',
  crp:'找感染 / 發炎源 + 追蹤治療反應(下降快,半衰期 ~19 h)',
  esr:'非特異,結合臨床;極高(> 100)想 GCA / 感染性心內膜炎 / 骨髓瘤 / 惡性',
  glu:'DKA:輸液 + IV insulin + 監測血鉀;低血糖 → 清醒口服、意識不清 IV D50 25 g',
  a1c:'多數目標 < 7%(個別化);≥ 6.5% 可診斷 DM,需重複或合併 FPG / OGTT 確認',
  tsh:'高 TSH → 補 levothyroxine 並追蹤;低 TSH → 評估亢進;孕期切點不同',
  ferritin:'低 ferritin(< 30)強烈支持 IDA → 找失血源 + 補鐵;高 ferritin 排除發炎 / 肝病後評估鐵負荷',
};

const missing=labs.filter(l=>!QUICK[l.id]).map(l=>l.id);
if(missing.length){console.error('missing quick for:',missing.join(','));process.exit(1);}

for(const l of labs){l.quick=QUICK[l.id];}
fs.writeFileSync(path,JSON.stringify(labs,null,2));
console.log('updated',labs.length,'entries');
console.log('sex-specific refs:',labs.filter(l=>l.refMale&&l.refFemale).map(l=>l.id).join(','));
console.log('all have quick:',labs.every(l=>l.quick));
