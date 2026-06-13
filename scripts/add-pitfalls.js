// Augment data/labs.json with pitfall arrays per entry.
// Run from repo root:  node scripts/add-pitfalls.js
const fs=require('fs');
const path='data/labs.json';
const labs=JSON.parse(fs.readFileSync(path,'utf8'));

// 每筆:2–5 個臨床最常踩到的 pitfall;含參考值族群差異
const PF={
  na:[
    '假性低血鈉(pseudohyponatremia):嚴重高血糖(每 ↑Glu 100 mg/dL 約 ↓Na 1.6–2.4)、高三酸甘油酯、高免疫球蛋白(IgM)',
    '矯正速度 > 10–12 mEq/L/日 → 滲透性脫髓鞘症候群(ODS / CPM),嚴重症狀也要慢慢來',
    '判讀低鈉先看血容(低/正常/高容)與血漿/尿滲透壓,不能只看數字',
  ],
  k:[
    '假性高血鉀:溶血檢體(最常見)、止血帶過久 / 握拳、WBC > 100k 或 PLT > 1M 反覆離心',
    '低血鎂時補鉀無效,需先補鎂',
    '急性酸鹼 IC/EC shift:pH 每 ↓0.1 ~ ↑K 0.3–0.6(暫時、非總量改變)',
  ],
  cl:[
    '單看意義有限,須與酸鹼、AG 一起判讀',
    'Bromide / iodide 中毒可造成假性高氯(視檢驗法)',
  ],
  ca:[
    '低白蛋白會低估總鈣 → 必用 corrected Ca 或直接測 ionized Ca',
    '酸鹼影響 ionized:酸中毒 ↑ionized、鹼中毒 ↓ionized(全鈣可正常但症狀已出現)',
    '止血帶過久 / 採血握拳會使 ionized Ca 假性偏高',
  ],
  mg:[
    '血鎂只反映 < 1% 體鎂(細胞外),正常不代表體鎂足夠',
    '難治性低 K、低 Ca 一律先驗 Mg、先補 Mg',
    'PPI 長期使用是常見漏掉的低鎂原因',
  ],
  phos:[
    'Refeeding 高風險族群:餵食前、餵食後 24/48/72 h 要監測',
    '溶血檢體假性升高',
    'IV 葡萄糖 / insulin 後生理性下降,DKA 治療中要追蹤',
  ],
  bun:[
    '上消化道出血(蛋白負荷)+ 脫水 → BUN 不成比例升,BUN/Cr > 20',
    '肝衰竭 / 營養不良時 BUN 偏低,可低估腎損傷',
    '類固醇加速分解代謝可推高 BUN',
  ],
  cr:[
    '受肌肉量、年齡、性別影響大:女性 / 老人 / 截肢者偏低,健身者偏高',
    'Trimethoprim、cimetidine、fenofibrate 阻斷腎小管分泌 → Cr 升但 GFR 沒變',
    'AKI 早期 Cr 還沒上升(滯後 24–48 h);看「趨勢」比單點重要',
    '熟肉攝取、劇烈運動可短期升高',
  ],
  egfr:[
    'CKD-EPI 假設 steady-state,急性 AKI 不適用',
    '2021 去 race 版本對黑人估計值較舊版下調 ~10%',
    '極端肌肉量(健身 / 截肢 / 惡病質)會誤判,改驗 cystatin C',
    '須配合白蛋白尿分級(A1/A2/A3)才完整分期',
  ],
  ast:[
    '非肝特異:心肌、骨骼肌、溶血、橫紋肌溶解都會升高',
    '酒精性肝病典型 AST/ALT > 2 但 AST 多 < 300;> 1000 多為病毒/藥毒/缺血',
    'Macro-AST(與 IgG 結合)可造成 unexplained 持續升高',
  ],
  alt:[
    'ALT > 1000 想:病毒、藥物 / 中毒(acetaminophen)、缺血;單看數值不能分原因',
    '末期肝衰竭酵素反而下降(肝細胞已少)— 看 INR / 膽紅素更準',
    '肥胖、脂肪肝會長期輕度升高,常被忽略',
  ],
  alp:[
    '兒童 / 青少年生理性高(可達成人 3–4×,生長板活躍)',
    '懷孕第三孕期(胎盤來源)、骨折癒合期升高',
    '同工酶區分:GGT 同升 → 肝膽源;GGT 正常 → 骨源 / 生理性',
  ],
  ggt:[
    '酵素誘導藥物(phenytoin、carbamazepine、barbiturate)、酒精明顯升高',
    '非肝膽特異:胰、腎、心也表現;敏感但不特異',
    '兒童 GGT 偏低,不會跟著生長期 ALP 一起升 → 鑑別 ALP 來源的好工具',
  ],
  tbil:[
    '溶血檢體會干擾比色法,可使結果失真',
    'Gilbert(間接 < 5、禁食 / 壓力時升):良性,常被誤當肝病',
    'direct / indirect 分流:direct > 50% → 阻塞 / 肝細胞性;以 indirect 為主 → 溶血 / Gilbert',
    '新生兒生理性 vs 病理性黃疸看「時間點 + 上升速率 + direct 比例」',
  ],
  alb:[
    '半衰期 ~20 天:急性疾病 24 h 內變化不大,不是即時營養指標',
    '負向急性期蛋白 → 急性發炎時短期下降,別當營養問題',
    '大量水化會稀釋,假性下降',
  ],
  wbc:[
    '必看 differential — 左移、嗜中性球比例、有無 atypical / blast',
    '類固醇、腎上腺素(運動 / 壓力)→ demargination 急性升高(可達 2×)',
    'ANC < 500 屬嚴重 neutropenia,感染風險高 — 比 WBC 總數更關鍵',
    '檢體放置過久白血球會自溶,結果失真',
  ],
  hb:[
    '急性失血早期 Hb 因尚未代償稀釋,可正常 → 不能靠 Hb 排除大出血',
    '脫水假性升高、過度水化假性下降',
    '參考值男女不同:男 13.5–17.5、女 12–15.5;懷孕、老人略低',
    '同時缺鐵 + B12 缺乏 MCV 可正常,RDW 升高是線索',
  ],
  mcv:[
    '急性失血 / 急性溶血時 MCV 可正常',
    '同時缺鐵 + B12 / 葉酸缺乏 → MCV 互相抵銷可正常,看 RDW',
    '冷凝集素病(cold agglutinin)會假性高 MCV(室溫加溫後重測)',
  ],
  plt:[
    'EDTA-induced pseudothrombocytopenia(血小板凝集):紫頭管假性低,改 citrate(藍頭管)重抽',
    '血小板上升大多是「反應性」(發炎、感染、缺鐵),不是骨髓增生',
    'TTP 禁忌輸血小板(會惡化血栓);ITP 一般也不必輸,除非危及生命出血',
    'PLT < 20×10³ 自發性出血風險明顯上升',
  ],
  inr:[
    'INR 高 ≠ 出血;肝病的 INR 高 同時 也抗凝下降 — 不代表「天然抗凝保護」',
    'DOAC(dabigatran、rivaroxaban、apixaban)不能用 INR 監測',
    'Warfarin 與抗生素、薑、銀杏、葡萄柚有交互作用;Lupus anticoagulant 也會延 PT/aPTT',
    '採血管未滿、血鈣 / citrate 比例失常會延長',
  ],
  aptt:[
    'Lupus anticoagulant 延 aPTT 但實際促血栓(易誤判出血傾向)',
    'DOAC 不能用 aPTT 監測;UFH 才用',
    '採血管未滿、過久延誤都可延長',
    '因子 VII 缺乏只延 PT 不延 aPTT(可用此鑑別)',
  ],
  ddimer:[
    '老人、孕婦、術後 1–2 週、感染、惡性腫瘤本來就高',
    'Age-adjusted cut-off(> 50 歲):年齡 × 10 µg/L FEU',
    '只能 rule-out(低 / 中度可能性 + 陰性);高值 不能 rule-in',
    '不同單位(FEU vs DDU):FEU ≈ DDU × 2,切點不可互通',
  ],
  trop:[
    '腎衰、心衰、心肌炎、PE、敗血症、SAH、運動後都可升高 — 非 ACS 特異',
    '看「動態變化(rise / fall ≥ 20%)」比單點重要;hs-Tn 用 0/1 h 或 0/3 h 流程',
    '不同檢驗單位 / 切點(ng/mL vs pg/mL、99th percentile 因試劑而異)不可互通',
    'COVID、化療(anthracycline、trastuzumab)後可慢性升高',
  ],
  bnp:[
    '肥胖 → BNP 偏低,可低估心衰',
    '腎衰、年長、心房顫動、女性 → 偏高,切點需調整',
    'Sacubitril (ARNi 如 Entresto) 會 ↑BNP 但 不 影響 NT-proBNP;心衰用 ARNi 者改用 NT-proBNP',
    'NT-proBNP 切點隨年齡調(< 50:300, 50–75:900, > 75:1800 pg/mL)',
  ],
  crp:[
    '免疫抑制 / 類固醇治療下反應可被壓低',
    'hs-CRP 用於心血管風險評估,不是急性發炎指標(用途不同)',
    '病毒感染上升幅度通常較細菌小,但不能單靠 CRP 區分',
    '反應快:6–8 h 開始升、24–48 h peak、治療後下降也快(每天 ~50%)',
  ],
  esr:[
    '受年齡、性別、貧血、懷孕、Ig 升高影響大',
    '極高(> 100)聯想:GCA(巨細胞動脈炎)、感染性心內膜炎、骨髓瘤、惡性腫瘤',
    '反應慢:上升 / 下降都要數日 — 不適合監測急性療效',
    '粗估上限:男 年齡/2、女 (年齡+10)/2',
  ],
  glu:[
    '採血到上機延誤(常溫)→ 紅血球持續代謝 → 假性偏低(用 NaF 灰頭管可減緩)',
    '嚴重高血糖造成假性低血鈉(每 ↑100 mg/dL Glu ≈ ↓Na 1.6–2.4)',
    'DKA 補 insulin 時 K 會下降(IC shift)、磷也降 — 必追蹤',
    '指尖血糖在低血糖 / 末梢循環差時與靜脈血差距大',
  ],
  a1c:[
    '溶血、近期失血 / 輸血、缺鐵治療後 RBC 更新快 → A1c 偏低(假性「控制好」)',
    '缺鐵、B12 缺乏、脾切除 → RBC 老化 → A1c 偏高',
    '血紅素變異(HbS / C / E)— 部分檢驗法失真,改用 fructosamine / glycated albumin',
    '反映 2–3 月平均,但近 1 月權重 ~50%;不能反映血糖變動性',
  ],
  tsh:[
    'Sick euthyroid(非甲狀腺病態):急重症 TSH / T3 / T4 可變動,不代表甲狀腺病,別貿然補充',
    'Dopamine、glucocorticoid、somatostatin、metformin 可壓低 TSH',
    'TSH 反映 ~6–8 週前狀態,調量後 6 週再驗 才有意義',
    '次發性甲狀腺低下:TSH 可不升,須驗 free T4 才不會漏',
    'Biotin(高劑量保健品)會干擾免疫學檢驗 → TSH / FT4 假性異常,停 48–72 h 再驗',
  ],
};

const missing=labs.filter(l=>!PF[l.id]).map(l=>l.id);
if(missing.length){console.error('missing pitfall for:',missing.join(','));process.exit(1);}

for(const l of labs){l.pitfall=PF[l.id];}
fs.writeFileSync(path,JSON.stringify(labs,null,2));
console.error(`added pitfall to ${labs.length} entries`);
console.error('total pitfall bullets:',labs.reduce((s,l)=>s+l.pitfall.length,0));
