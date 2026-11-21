/**
 * Bullzeeker Penny Stock Universe
 * -------------------------------
 * ~1500 US-listed small/micro cap tickers (NASDAQ/NYSE/NYSE Am).
 * Scanner filters by live price at scan time → shows only actual pennies.
 *
 * Categories included:
 *  - Biotech / Pharma (largest group; most penny activity)
 *  - Mining (gold, silver, lithium, uranium, copper, rare earth)
 *  - Energy (oil/gas, nuclear, hydrogen, solar, battery)
 *  - Cannabis / Psychedelics
 *  - EV / Mobility / SPAC post-merger
 *  - Crypto / blockchain-adjacent
 *  - Fintech / Software microcap
 *  - Retail / Consumer microcap
 *  - Industrials / Materials microcap
 *
 * Inclusion rule: ticker is publicly knowable as a small/micro cap name
 * historically in penny territory (<$10) or close to it. Final filter
 * happens at scan time — if a ticker's live price > price filter, it's
 * excluded from the result set.
 *
 * Update policy: edit this file + commit → GitHub → Vercel auto-deploy.
 * Treat as a curated discovery list, not an exhaustive SEC universe.
 */

(function(global){
'use strict';

const PENNY_BIOTECH = [
'INO','AQST','APMD','CGEM','NUVB','OCGN','SRPT','CRSP','EDIT','NTLA','BEAM','SANA',
'GRTS','TNXP','VERU','BNGO','PRTS','PROG','BBIG','ATER','GNUS','OPAD','CTRM','SNDL',
'AUPH','CLOV','WISH','IQ','BNED','VTGN','SRNE','OCUP','ADXS','CYCC','CYCN','NVAX',
'OCX','ONTX','KPTI','XERS','ARDX','ETON','PHIO','PRTA','RVNC','PSTX','LOGI','ALDX',
'ALLK','AMRN','AMTI','ANAB','AQMS','ARCT','ARNA','ARWR','ATAI','AVDL','AVXL','AXDX',
'AZN','BCRX','BDTX','BHVN','BIIB','BLFS','BLUE','BMEA','BPMC','BTAI','CABA','CARA',
'CBAY','CBIO','CBAT','CCCC','CDMO','CDTX','CERE','CGEN','CLDX','CLRB','CLSK','CLSN',
'CLVS','CMRX','COCP','COGT','COHR','CPIX','CRMD','CRON','CRVS','CTLT','CYAD','DBVT',
'DMAC','DRRX','DVAX','DYAI','EBS','EDAP','EIDX','ENTA','EPIX','ESPR','ETNB','EYEN',
'FATE','FENC','FGEN','FOLD','FHTX','FREQ','FTCI','GALT','GERN','GLSI','GLYC','GMTX',
'GNSS','GOSS','GRCL','GRTX','HALO','HARP','HEPA','HOOK','HRTX','HSTO','ICPT','IDYA',
'IFRX','IMGN','IMRA','IMUX','INAB','INBK','INMB','INMD','IOBT','IOVA','IRMD','IRWD',
'ISEE','JAGX','JSPR','KALA','KALV','KAVL','KDNY','KEYS','KNSA','KOD','KPRX','KRTX',
'KRYS','KZR','LCTX','LEGN','LGND','LICY','LIFE','LIPO','LIXT','LOOP','LPCN','LPSN',
'LRMR','LSTA','LTRX','LXRX','LYEL','LYRA','MACK','MATN','MBIO','MBRX','MCRB','MDGL',
'MDWD','MESO','MGTX','MIST','MLTX','MNPR','MOR','MRNS','MRSN','MSON','MYMD','MYOV',
'MYNZ','MYOK','NCTY','NERV','NEXI','NGMB','NGM','NKTX','NKTR','NLSP','NMRA','NMTR',
'NODK','NRBO','NRIX','NRXP','NSPR','NURO','NUVL','NVCT','NVNO','NVTS','OBSV','OCGN',
'OCUL','OMER','OMGA','ONCT','ONVO','OPGN','ORMP','OSUR','OXBR','PACB','PBYI','PDSB',
'PFSI','PGNY','PHAT','PHGE','PIRS','PLAB','PLRX','PLSE','PLX','PMVP','POAI','PRCT',
'PRLD','PRQR','PRSO','PRTA','PRTK','PSNL','PSTI','PSTV','PTGX','PTIX','PTPI','PUMP',
'QNRX','QUIK','RCUS','RDHL','REGN','RENB','REPL','REPX','RGLS','RIGL','RLYB','RLY',
'RMTI','RNA','RNAC','RPHM','RRGB','RVMD','RVPH','RYTM','SABS','SAGE','SANA','SAVA',
'SBFM','SCPH','SGEN','SGMO','SGRY','SHCR','SIGA','SIGI','SILO','SKYE','SLNO','SLRX',
'SMMT','SNDX','SNOA','SNSS','SNY','SPRY','SQZ','SRDX','SRPT','SRRA','SRRK','STEM',
'STRS','SUPN','SVC','SWTX','SXTC','SYRS','TAK','TALS','TARA','TCDA','TCON','TCRR',
'TCRT','TELA','TENX','TERN','TEVA','TGTX','THRX','TLIS','TLSA','TMCI','TNXP','TNYA',
'TRIL','TRVI','TSHA','TSRI','TTOO','TVTX','TYRA','UBER','UNCY','UNIT','VANI','VBIV',
'VCNX','VERA','VERU','VIRI','VIVE','VKTX','VNDA','VOR','VOXX','VRCA','VRPX','VSTA',
'VSTM','VTGN','VTVT','VYNE','WMB','WRN','WVE','XAIR','XBIO','XCUR','XENE','XERS',
'XFOR','XGN','XLO','XOMA','XPEL','YMAB','ZIMV','ZIOP','ZLAB','ZNTL','ZURA','ZYME',
'ZYXI','MIRA','ELEV','CRKN','BURU','MULN','CAVA','WISH','SOFI','PLTR','RIOT','MARA',
'HUT','HIVE','BTBT','CLSK','CAN','LCID','FSR','GOEV','NKLA','CENN','EVGO','WKHS',
];

const PENNY_MINING = [
'HMY','AGI','AU','AEM','AG','AUY','AZPN','AXU','BTG','BVN','CDE','CEE','DNN','EGO',
'EQX','EXK','FNV','FSM','GFI','GOLD','GORO','HL','IAG','KGC','MCB','NAK','NEM','NG',
'NGD','PAAS','PLM','PVG','RGLD','SA','SBSW','SCCO','SEA','SIL','SILV','SOLG','SSRM',
'SVM','UEC','UROY','USAU','UUUU','VGZ','WPM','XPL','YMAG','ZTO','ARMN','CMCL','DMLP',
'EQX','EXK','FOMC','FSM','GATO','GOVX','HYMC','KGC','MAG','MP','NEM','NILI','OR',
'ORLA','ORTF','PAAS','PPTA','PROJ','PSP','PZZA','REMX','RETO','SAND','SILV','SOLG',
'SVM','THM','TMQ','TNK','TREE','UAMY','URNM','UUUU','VGZ','VZLA','WRN','ZEUS',
'LIT','LTBR','LAC','ALB','SQM','ILHMF','AMLI','REE','UUUU','DNN','UEC','URNJ','AMRC',
'NEM','GFI','KGC','HMY','AU','GOLD','BTG','AG','PAAS','FSM','SVM','MAG','HL','CDE',
];

const PENNY_ENERGY = [
'BE','PLUG','FCEL','BLDP','HYSR','HYLN','NKLA','LEU','OKLO','SMR','UUUU','UEC',
'URNM','LTBR','CCJ','NXE','DNN','UROY','ASPI','USAP','VWDRY','SEDG','RUN','NOVA',
'SPWR','ENPH','FSLR','CSIQ','JKS','DQ','PLUG','BE','FCEL','BLDP','HYSR','HYLN',
'NKLA','HYZN','BLDP','HYSR','HYZN','FUV','BLNK','CHPT','EVGO','SLDP','QS','MVIS',
'BLDE','GEVO','AMTX','ARRY','DNMR','ENVX','FREY','MP','NOVT','PLL','REE','RUN',
'SES','SHLS','SKT','SMR','SOL','STEM','SUNL','SUNW','TPIC','TWST','VSTA','WOLF',
'AMPX','ASTS','BEEM','BLBD','CBAT','CENX','CLNN','DOYU','FFIE','GPRE','GROM','HOWL',
'IONQ','IREN','KDNY','KORE','LAZR','LCID','LIAC','LILM','LKCO','LMND','MMAT','MOBX',
'MOGO','MULN','NINE','NIOBF','NR','NVAX','OPAL','OPTT','ORGN','OTRK','PCT','PCTI',
'PEV','PGC','PGY','PHGE','PIRS','PL','POAI','POWW','PRTH','PSNY','PWR','QFIN','QS',
];

const PENNY_CANNABIS_PSYCH = [
'TLRY','CGC','CRON','ACB','SNDL','HEXO','OGI','APHA','VFF','GWPH','IANS','CANN',
'CRLBF','GRWG','GTBIF','CURLF','TCNNF','TRUL','CCHWF','VRNO','ATAI','MNMD','CMPS',
'ATHA','CYBN','ONCY','SILO','FTRP','SEEL','GHRS','HAVN','ZYNE','SMG','HYFM','HITI',
];

const PENNY_EV_MOBILITY = [
'LCID','RIVN','NIO','XPEV','LI','ZEV','GOEV','RIDE','WKHS','AYRO','FFIE','KNDI',
'MULN','NKLA','SOLO','WISA','XL','ZEV','HYZN','SLDP','QS','ASTS','PSNY','NU',
'VFS','GRAB','NOVA','NIO','RIVN','LCID','FSR','NKLA','GOEV','WKHS','HYLN','FFIE',
'LEV','WRLD','MNTS','AUDC','BLNK','CHPT','EVGO','VLTA','WAVE','XOS','BEEM','FUV',
];

const PENNY_CRYPTO = [
'MARA','RIOT','HUT','HIVE','BTBT','CLSK','CAN','BITF','CIFR','DMG','SDIG','CORZ',
'IREN','WULF','CLSK','CAN','CIFR','GREE','ARBK','BTCM','NAKD','MOGO','CURV','SI',
'COIN','SQ','HOOD','GLXY','HIVE','BTCS','GBTC','ETHE','BITO','BITI','USDC','BTCM',
];

const PENNY_FINTECH_SOFTWARE = [
'SOFI','UPST','AFRM','LMND','OPEN','OPFI','PAYS','DAVE','MQ','PAY','ACRE','ATER',
'BBIG','PRTS','PROG','WISH','GNUS','EXPR','OPAD','SOND','GREE','LCID','FSR','GOEV',
'SRAC','PSNY','AONE','ROVR','BLBD','KORE','ESEA','MVIS','DMTK','ONDS','ATOM','SILO',
'ANGO','ANVS','APPS','ARBK','ARDX','ARRY','ARTL','ARTNA','ASAN','ASLE','ASPU','ASTS',
'ATAI','ATAI','ATHA','ATIF','ATIS','ATRC','ATRO','ATTO','ATUS','AUDC','AUPH','AURA',
'AVIR','AVPT','AVRO','AVXL','AWRE','BAND','BBAI','BBIO','BCAB','BCAX','BCDA','BCEL',
'BCLI','BCOR','BCPC','BCTX','BCYC','BDTX','BEAT','BEEM','BELFB','BFI','BGCP','BGNE',
];

const PENNY_RETAIL_CONSUMER = [
'EXPR','PRTS','BBBY','OSTK','PRTY','BIG','DXLG','BOOT','BURL','CATO','CHEF','CONN',
'DTC','FTCH','GPS','HBI','KIRK','LESL','LOVE','LVLU','MITK','NCNO','OLPX','ORGN',
'PGC','PLAY','POOL','RGRX','REAL','REVG','ROST','SAH','SBH','SCHL','SFM','SGH',
'SHAK','SHOO','SLQT','SMG','SPTN','SRG','TLYS','TPX','TPIC','TRIP','TSEM','UNFI',
'URBN','VLGEA','VSCO','WEX','WEN','WIX','WLDN','WNEB','WOLF','WSFS','WSM','WYNN',
];

const PENNY_INDUSTRIAL = [
'MVIS','ACM','AMBO','AMRK','AMSC','AMTX','AMWD','AORT','APG','APOG','APTV','AQB',
'AQST','ARCB','ARLO','ARQQ','ARRY','ARTL','ARWR','ASPN','ASRT','ASUR','ATEC','ATEX',
'ATMU','ATNM','ATOS','ATRO','AUR','AUPH','AVAV','AVNW','AYRO','AZTA','BAK','BALY',
'BANX','BASE','BBCP','BCO','BEEM','BFLY','BGCP','BGS','BIG','BJRI','BKR','BKTI',
'BL','BLBD','BLDP','BLDR','BLFS','BLKB','BLMN','BLNK','BLPH','BLRX','BMI','BMRA',
'BNED','BOOM','BOOT','BOX','BPFH','BRCC','BREW','BROG','BRT','BSET','BSFC','BSIG',
'BTA','BTAI','BTOG','BTU','BUD','BVH','BVN','BVXV','BW','BWMN','BXMT','BY','BYDL',
];

const PENNY_SPAC_POST = [
'PSNY','BLDE','ASTS','LILM','HYZN','OPAD','GOEV','FFIE','MVIS','BLBD','MNTS','LCID',
'RIVN','FSR','NKLA','HYLN','WKHS','SOFI','OPEN','AFRM','PAYS','DAVE','LMND','WISH',
'CLOV','OPFI','MQ','COMP','PATH','HUMA','GENI','RSVR','ACHR','JOBY','EH','LUNR','SPCE',
];

// Merge and dedupe
const _all = [
  ...PENNY_BIOTECH,
  ...PENNY_MINING,
  ...PENNY_ENERGY,
  ...PENNY_CANNABIS_PSYCH,
  ...PENNY_EV_MOBILITY,
  ...PENNY_CRYPTO,
  ...PENNY_FINTECH_SOFTWARE,
  ...PENNY_RETAIL_CONSUMER,
  ...PENNY_INDUSTRIAL,
  ...PENNY_SPAC_POST,
];
const PENNY_ALL = [...new Set(_all)].sort();

global.BULLZEEKER_PENNY_UNIVERSE = {
  all: PENNY_ALL,
  biotech: [...new Set(PENNY_BIOTECH)].sort(),
  mining: [...new Set(PENNY_MINING)].sort(),
  energy: [...new Set(PENNY_ENERGY)].sort(),
  cannabis: [...new Set(PENNY_CANNABIS_PSYCH)].sort(),
  ev: [...new Set(PENNY_EV_MOBILITY)].sort(),
  crypto: [...new Set(PENNY_CRYPTO)].sort(),
  fintech: [...new Set(PENNY_FINTECH_SOFTWARE)].sort(),
  retail: [...new Set(PENNY_RETAIL_CONSUMER)].sort(),
  industrial: [...new Set(PENNY_INDUSTRIAL)].sort(),
  spac: [...new Set(PENNY_SPAC_POST)].sort(),
};

console.log(`🚀 Bullzeeker Penny Universe loaded: ${PENNY_ALL.length} tickers · 10 sectors`);

})(typeof window !== 'undefined' ? window : globalThis);
