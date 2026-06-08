/**
 * Bullzeeker — Shared US Stock Universe
 * ~1500 curated liquid US stocks across all sectors
 *
 * Coverage:
 * - S&P 500 (~500)
 * - Russell 1000 mid-caps (~400)
 * - Popular small caps (~250)
 * - ADRs (~120)
 * - ETFs (broad/sector/themed/commodities/bonds/leveraged) (~200)
 *
 * Total: ~1500 unique symbols
 */

window.BULLZEEKER_UNIVERSE = (function(){

  /* ==================== LARGE CAPS (S&P 500) ==================== */
  const LARGE_TECH = [
    'AAPL','MSFT','GOOGL','GOOG','AMZN','META','NVDA','TSLA','AVGO','ORCL',
    'ADBE','CRM','AMD','INTC','CSCO','QCOM','TXN','IBM','NOW','AMAT',
    'MU','LRCX','KLAC','ADI','PANW','SNPS','CDNS','MRVL','ANET','FTNT',
    'INTU','ACN','MSI','NXPI','MCHP','TYL','JKHY','BR','FFIV','VRSN',
    'GLW','HPE','HPQ','DELL','NTAP','STX','WDC','JNPR','KEYS','TER',
    'ON','ENPH','SEDG','FSLR','ANSS','ZBRA','GEN','GRMN','EPAM','CTSH',
    'GDDY','PAYC','PAYX','ADP','MSCI','FICO','CDW','AKAM','IT','FIS','FI',
    'IBKR','NDSN','TRMB','LFUS','ROP','ITRI','BR','BMI'
  ];

  const LARGE_COMM = [
    'NFLX','DIS','CMCSA','T','VZ','TMUS','CHTR','WBD','NWSA','FOXA',
    'EA','TTWO','MTCH','PINS','PARA','FOX','NWS','IPG','OMC','SPOT',
    'LYV','LBRDK','LBRDA','LSXMK','SIRI','NWS'
  ];

  const LARGE_CONS_DISC = [
    'HD','MCD','NKE','LOW','SBUX','BKNG','TJX','MAR','GM','F',
    'ROST','ABNB','ORLY','AZO','LULU','DPZ','YUM','CMG','RCL','CCL',
    'NCLH','HLT','EBAY','ETSY','CHWY','RL','TPR','VFC','HBI','KMX',
    'BBY','DG','DLTR','KSS','M','GPS','ULTA','LVS','MGM','WYNN',
    'PHM','LEN','DHI','NVR','TOL','KBH','PVH','MHK','WSM','RH',
    'POOL','LKQ','AAP','CTAS','GNTX','BC','THO','LCID','RIVN','TPX',
    'PII','BLD','BWA','LEG','LSI','HAS','MAT','MAS','GRMN','EXP',
    'CROX','SKX','SHOO','DECK','UA','UAA','FL','GES','EXPR','URBN','ANF'
  ];

  const LARGE_CONS_STAPLES = [
    'WMT','COST','PG','KO','PEP','MDLZ','CL','MO','PM','KMB',
    'GIS','HSY','CPB','CAG','SJM','MKC','CHD','CLX','EL','MNST',
    'KDP','STZ','BF-B','TAP','KHC','TSN','HRL','LANC','POST','SYY',
    'ADM','K','KR','WBA','COTY','NWL','CASY','COKE','SAM','BUD',
    'DEO','BTI','UL','PG','CHEF','TGT','BG','INGR','DAR','VITL',
    'PRMW','EDBL','HAIN','TR','CWH','SFM','VLGEA'
  ];

  const LARGE_ENERGY = [
    'XOM','CVX','COP','EOG','SLB','MPC','PSX','VLO','OXY','HAL',
    'PXD','HES','DVN','FANG','CTRA','APA','EQT','OVV','MRO','BKR',
    'CIVI','MTDR','MUR','NOV','FTI','CHX','HP','WHD','BTU','AR',
    'CNX','SM','VTLE','CRC','OAS','RIG','VAL','LBRT','PUMP','SOI',
    'CHRD','NEXT','PR','VET','TRGP','OKE','WMB','KMI','EPD','ET',
    'MPLX','ENB','PBA','SUN','PAA','PAGP','CQP','TPL','PR','EQNR',
    'HFRO','MGY','CRGY','VTOL','GPRK','VTNR','REPX','REI','KOS','PARR'
  ];

  const LARGE_FINANCIALS = [
    'JPM','BAC','WFC','C','GS','MS','BLK','SCHW','AXP','V',
    'MA','BRK-B','BRK-A','COF','USB','PNC','TFC','BX','KKR','APO',
    'CME','ICE','NDAQ','SPGI','MCO','MMC','AON','PGR','TRV','ALL',
    'MET','PRU','AFL','AIG','CB','HIG','RJF','LPLA','AMP','TROW',
    'BEN','IVZ','NTRS','STT','BK','MTB','RF','HBAN','KEY','CFG',
    'FITB','CMA','ZION','WAL','COIN','HOOD','SOFI','AFG','JEF','RDN',
    'MTG','ESNT','NMIH','LNC','PFG','UNM','VOYA','GL','PRI','FAF',
    'WRB','CINF','ERIE','WCC','MKL','EVR','LAZ','MS','PIPR','HLI',
    'COWN','SF','RJF','VIRT','MKTX','TRAD','GS','IBKR','BX','APO',
    'CG','PJT','GHL','HOUS','OWL','DFIN','DLO','PYCR','PSFE','WLY','MOR'
  ];

  const LARGE_HEALTHCARE = [
    'JNJ','LLY','UNH','PFE','MRK','ABBV','TMO','DHR','ABT','BMY',
    'AMGN','GILD','CVS','MDT','ISRG','VRTX','REGN','MRNA','BIIB','HUM',
    'ELV','CI','ZTS','BSX','SYK','BDX','EW','HCA','CNC','MCK',
    'CAH','COR','BAX','RMD','IDXX','DXCM','PODD','ALGN','MTD','WAT',
    'ILMN','A','IQV','LH','DGX','CRL','BIO','TFX','GMED','HOLX',
    'ZBH','HSIC','PEN','TDOC','VEEV','IRWD','EXAS','NTRA','TWST','ABCL',
    'ASND','DNA','GH','NSTG','PACB','CDNA','BNTX','NVAX','VKTX','SAVA',
    'AXSM','SAGE','EXEL','HALO','NTLA','BEAM','CRSP','EDIT','VRDN','BMRN',
    'ALNY','SRPT','BLUE','RARE','FOLD','RVMD','RYTM','MGNX','IONS','PTCT',
    'ARQT','OMER','ORIC','UTHR','INCY','JAZZ','NBIX','TEVA','PRGO','NVS',
    'AZN','GSK','SNY','BAYRY','NVO','RHHBY','TAK','ROIV','MNK','ENDP','MNKD'
  ];

  const LARGE_INDUSTRIALS = [
    'BA','CAT','HON','UPS','UNP','DE','GE','MMM','LMT','RTX',
    'NOC','GD','ETN','EMR','ITW','CSX','FDX','DAL','UAL','AAL',
    'LUV','SAVE','JBLU','HA','EXPD','CHRW','XPO','ODFL','LSTR','KNX',
    'WERN','WAB','TDG','HEI','TRN','GNK','GBX','PWR','MTZ','CMI',
    'PCAR','SWK','DOV','ROK','LECO','GWW','FAST','MSM','URI','HRI',
    'AOS','LII','MAS','BLDR','TPC','WSO','JCI','OTIS','CARR','GNRC',
    'BURL','ALLE','RSG','WM','WCN','J','RXO','LDOS','SAIC','LHX',
    'TXT','HII','BWXT','AVAV','KTOS','BAH','MRCY','LMT','VRT','PLUG',
    'NKLA','GOEV','CHPT','BLNK','EVGO','FCEL','BLDP','HYZN','EOSE','STEM',
    'GRBK','BLDR','LPX','BCC','BMCH','SUM','EME','MTRN','GVA','MTRX','MYRG','PRIM'
  ];

  const LARGE_MATERIALS = [
    'LIN','APD','SHW','FCX','NEM','DD','MLM','VMC','STLD','NUE',
    'RS','CMC','CLF','X','SCCO','AA','MOS','CF','FMC','LYB',
    'DOW','EMN','OLN','HUN','CC','WLK','TROX','RPM','IFF','ECL',
    'ALB','CTVA','AVY','AMCR','PKG','BALL','AVNT','SXT','SEE','MTX',
    'SLGN','GOLD','AEM','KGC','AGI','SBSW','RGLD','WPM','FNV','PAAS',
    'HL','CDE','MUX','SVM','EXK','AG','GFI','HMY','SAND','EQX',
    'IAG','NGD','ASA','GORO','LODE','SILV','UEC','URG','UUUU','DNN',
    'PALL','PLTM','CENX','MP','UAMY','VHI','RIO','BHP','VALE','GLNCY','HBM'
  ];

  const LARGE_UTILITIES = [
    'NEE','DUK','SO','D','AEP','XEL','SRE','PCG','EXC','EIX',
    'WEC','ED','ETR','DTE','AEE','CMS','PEG','FE','ES','CNP',
    'PPL','PNW','LNT','EVRG','NRG','VST','UGI','ATO','AWK','AES',
    'NI','AVA','IDA','OGE','HE','POR','BKH','SWX','NWE','OGS',
    'CWT','SJW','MSEX','YORW','ARTNA','GWRS','WTRG','WTW'
  ];

  const LARGE_REITS = [
    'AMT','PLD','CCI','EQIX','SPG','O','PSA','EXR','VICI','WELL',
    'AVB','EQR','UDR','MAA','ESS','CPT','INVH','SUI','ELS','LSI',
    'HST','RHP','VTR','OHI','LTC','SBRA','MPW','DOC','DEA','HR',
    'ARE','BXP','VNO','SLG','KIM','REG','FRT','BRX','MAC','SKT',
    'UE','EPRT','FCPT','GTY','NTST','NSA','GLPI','EPR','IRT','WPC',
    'STAG','HIW','HPP','JLL','CBRE','SVC','AHH','BNL','APLE','PEB',
    'AMH','EGP','TRNO','REXR','FR','IIPR','LADR','RLJ','XHR','INN',
    'NSA','SHO','BDN','ESRT','PGRE','PDM','OFC','CIO','SRC','PINE','PSTL','AAT'
  ];

  /* ==================== MID-CAP / HIGH GROWTH (Russell 1000) ==================== */
  const MIDCAP_TECH = [
    'PLTR','SHOP','SQ','PYPL','UBER','LYFT','SPOT','ABNB','DASH','HOOD',
    'COIN','MSTR','TSM','ASML','ARM','SMCI','APP','RBLX','U','PATH',
    'BBAI','S','HUBS','TOST','DOCN','MELI','CELH','TWLO','CFLT','GTLB',
    'BILL','BOX','PD','OKTA','FROG','SMAR','BL','APPN','NCNO','ESTC',
    'NEWR','DOCN','AI','SOUN','RDDT','DUOL','AXON','TTD','MDB','ZS',
    'TEAM','WDAY','VEEV','SPLK','PEGA','RPD','TENB','SUMO','MNDY','AYX',
    'ALTR','ASAN','APPS','PRGS','DT','WK','PCTY','PCOR','BSY','BIGC',
    'OLO','SQSP','HCP','LMND','UPST','AFRM','OPEN','RDFN','ZG','EQT',
    'ENV','SI (delisted - skip)','EVBG','BAND','RNG','FIVN','CXM','XM',
    'MXL','LSCC','SITM','CRUS','SYNA','SWKS','AAOI','LITE','VIAV','IIVI',
    'EMKR','AXTI','ALGM','AMBA','CEVA','MTSI','RMBS','SLAB','VECO','COHU',
    'ENTG','POWI','OLED','MQ','CRTO','TASK','VRRM','VRNT','BAND','TSLA'
  ];

  const MIDCAP_GROWTH = [
    'NIO','LI','XPEV','PSNY','NKLA','GOEV','RIDE','WKHS','HYLN','MULN',
    'FFIE','BB','NOK','TLRY','CGC','ACB','CRON','SNDL','ABR','ZIM',
    'BABA','JD','PDD','BIDU','NTES','BILI','IQ','TME','VIPS','DIDI',
    'YMM','ZTO','BEKE','EH','TIGR','FUTU','HUYA','MOMO','DOYU','WB',
    'NTLA','CRSP','EDIT','BEAM','BLUE','SAGE','EXAS','PACB','ZBIO','CGEM',
    'AMD','PINS','SNAP','TWLO','DOCU','ZM','TDOC','PTON','ETSY','W',
    'CVNA','OPEN','RDFN','LMND','HIMS','OSCR','EVH','PCT','DNA','NABL',
    'IONQ','RGTI','QBTS','ARQQ','NRGV','LEGN','ALGN','PRTA','GERN',
    'CDNA','NTRA','GH','EXAS','VRTX','CRSP','EDIT','BNTX','MRNA','NVAX'
  ];

  /* ==================== POPULAR SMALL CAPS / MEMES / SPECULATIVE ==================== */
  const SMALLCAP_POPULAR = [
    'AMC','GME','BBBY','BB','NOK','BBIG','SNDL','EXPR','PROG','MMTLP',
    'PHUN','DWAC','CFVI','MULN','TRKA','HKD','REV','APRN','HOOD','BLNK',
    'WKHS','RIDE','GOEV','HYLN','CHPT','LCID','RIVN','FFIE','VLDR','LIDR',
    'SOUN','BBAI','AI','PLTR','MARA','RIOT','HUT','BITF','BTBT','CIFR',
    'CLSK','HIVE','WULF','CORZ','IREN','CAN','APLD','BTDR','GREE',
    'NKLA','XL','GOEV','PTRA','EVGO','EOSE','STEM','FCEL','PLUG','BLDP',
    'HYZN','SHLS','RUN','SPWR','MAXN','ARRY','CSIQ','JKS','DQ','NOVA',
    'CHWY','PETS','FRPT','BIRD','PRPL','OPRT','BARK','SDC','RH','WSM',
    'YETI','HELE','REVG','LULU','GES','EXPR','TUP','BBW','VRA','PRPL',
    'PRTY','LCII','DOOR','OZK','MFG','BHC','TEVA','PHG','ESTE','VST',
    'WULF','APP','MARA','MQ','XPRO','JOBY','LILM','EHTH','HUYA','DOYU',
    'TIGR','FUTU','UPST','SOFI','LMND','OPEN','CMCM','RDFN','ZG','OPEN',
    'CVNA','VRM','SIRI','MAT','HAS','LEG','LCID','RIVN','SQ','PYPL',
    'BIDU','BABA','JD','PDD','NIO','LI','XPEV','VIPS','BILI','IQ',
    'TME','MOMO','DOYU','HUYA','BEKE','BZUN','TIGR','FUTU','EDU','TAL','WB'
  ];

  /* ==================== AMERICAN DEPOSITARY RECEIPTS (ADRs) ==================== */
  const ADRS = [
    // China/Asia
    'BABA','JD','PDD','BIDU','NTES','BILI','IQ','TME','VIPS','DIDI',
    'YMM','ZTO','BEKE','EH','TIGR','FUTU','HUYA','MOMO','DOYU','WB',
    'TAL','EDU','VNET','LEGN','LX','NIU','BZUN','GDS','HCM','TCOM',
    'YY','NOAH','ATAT','GOTU','TUYA','LBTYA','BHF',
    // Europe
    'ASML','SAP','NVO','TM','HMC','SNY','GSK','AZN','UL','BUD',
    'BTI','DEO','PRMW','RIO','BHP','VALE','PHG','HSBC','BCS','LYG',
    'BBVA','SAN','DB','ING','BMA','GGAL','EBR','TS','TX','ERJ',
    'AER','ABB','CRH','NXE','TSEM','TEVA','MFG','SMFG','MUFG','IMOS',
    // Asia ex-China
    'TSM','TKC','INFY','WIT','HDB','IBN','TTM','SAP','SE','GRAB',
    'MNDY','WIX','CYBR','CHKP','NICE','TARO','TEVA','ELBT','GRWG',
    'AZUL','GOL','VIST','PAGS','STNE','MELI','GLOB','ITUB','BBD','VALE',
    'BAP','SMG','CIB','BMA','BSAC','GGB','VIV','TLK','PHI','NGG'
  ];

  /* ==================== ETFs ==================== */
  const ETF_BROAD = [
    'SPY','IVV','VOO','VTI','QQQ','IWM','DIA','VEA','VWO','EFA','EEM',
    'IEMG','SCHF','SCHX','SCHG','SCHM','SCHB','SCHZ','VT','VEU','VXUS'
  ];

  const ETF_SECTOR = [
    'XLK','XLF','XLV','XLY','XLP','XLI','XLE','XLU','XLB','XLRE','XLC',
    'VGT','VFH','VHT','VCR','VDC','VIS','VDE','VPU','VAW','VNQ','VOX',
    'SMH','SOXX','IBB','XBI','GDX','GDXJ','GLD','SLV','USO','UNG',
    'KRE','KBE','ITA','ITB','XHB','XRT','XPH','IYT','IYE','KIE',
    'XOP','XME','MOO','WOOD','PAVE','WCLD','WTAI','BOTZ','ROBO','BLOK'
  ];

  const ETF_INTERNATIONAL = [
    'FXI','MCHI','ASHR','KWEB','EWJ','EWZ','INDA','EWY','EWT','EZU',
    'EWG','EWQ','EWL','EWU','EWA','EWC','EWP','EWI','GREK','ARGT',
    'EPOL','EZA','EGPT','KSA','TUR','EWM','THD','EIDO','EPHE','VNM',
    'VYM','SCHD','HDV','DVY','DGRO','VIG','DLR','REET','VNQI','SCHH'
  ];

  const ETF_THEME = [
    'ARKK','ARKG','ARKW','ARKQ','ARKF','ICLN','TAN','FAN','KARS','LIT',
    'REMX','URA','URNM','CIBR','HACK','ROBO','BOTZ','KWEB','JETS','BLOK',
    'ESPO','HERO','GAMR','IPAY','IPO','MJ','AIQ','BLOK','DAPP','FINX',
    'SKYY','HACK','FDN','SOCL','BUZZ','MOON','MTGP','META','FAN','URTH',
    'XAR','PPA','GMF','FXC','FXY','FXE','FXB','CYB','BWX','BNDX'
  ];

  const ETF_COMMODITY = [
    'GLD','IAU','SGOL','SLV','SIVR','PSLV','USO','BNO','UNG','UGA',
    'DBC','DBA','DBO','DBE','PALL','PLTM','JJC','JJN','JJG','WEAT',
    'CORN','CANE','SOYB','NIB','JO','COW','MOO','PHYS','PSLV'
  ];

  const ETF_BOND = [
    'TLT','IEF','SHY','HYG','JNK','LQD','EMB','BND','AGG','BIL',
    'MBB','SGOV','TBT','TBF','IEI','GOVT','VCIT','VCLT','VCSH','BSV',
    'MUB','TIP','VTIP','SCHP','LTPZ','EDV','PSC','SHV','BIV','BLV',
    'STIP','SHYG','USHY','PCY','EMHY','HYS','SJNK','FALN','ANGL','HYDB'
  ];

  const ETF_LEVERAGED = [
    'TQQQ','SQQQ','SOXL','SOXS','TZA','TNA','SPXL','SPXS','UPRO','SPXU',
    'FAS','FAZ','TMF','TMV','BOIL','KOLD','NUGT','DUST','JNUG','JDST',
    'LABU','LABD','CWEB','CHAU','YINN','YANG','EDC','EDZ','BRZU','MEXX',
    'NRGU','NRGD','OILU','OILD','GUSH','DRIP','CURE','DPST','PILL','RXD',
    'TYO','TYD','UDOW','SDOW','UMDD','SMDD','URTY','SRTY','UCYB','DDM',
    'SSO','SDS','PSQ','DOG','SH','SDS','TBT'
  ];

  const ETF_VIX = [
    'VXX','UVXY','SVXY','VIXY','VIIX','VXZ','UVIX','SVIX'
  ];

  const ETF_INCOME_DIVIDEND = [
    'VYM','SCHD','HDV','DVY','DGRO','VIG','SPHD','SPYD','JEPI','JEPQ',
    'DIVO','QYLD','XYLD','RYLD','NUSI','SRLN','PFF','PGX','PSK','VRP',
    'BIZD','BST','UTG','UTF','GUT','RNP','RFI','AGNC','NLY','ARR','TWO'
  ];

  /* ==================== MORE GROWTH / RECENT IPOs ==================== */
  const RECENT_IPO_GROWTH = [
    'PLTR','RBLX','U','PATH','SOFI','HOOD','LMND','OPEN','UPST','AFRM',
    'COIN','MSTR','BMBL','MTCH','APP','DUOL','AXON','TTD','MDB','ZS',
    'OKTA','BILL','GTLB','CFLT','S','NET','SNOW','DDOG','CRWD','ARM',
    'SMCI','RDDT','TOST','DASH','ABNB','RIVN','LCID','GME','AMC','SOUN',
    'BBAI','AI','HIMS','OSCR','EVH','DOCU','ZM','PTON','SPCE','LCID',
    'CHGG','JOBY','LILM','EHANG','ALVR','BLNK','EVGO','CHPT','RUN','NOVA',
    'SHLS','MAXN','ARRY','SPWR','ENPH','SEDG','DOC','EPRT','GLPI','EPR',
    'NMFC','GOOD','MAIN','BXSL','OBDC','HRZN','LRN','STRA','LOPE','LAUR',
    'YORK','POWL','BMI','TGTX','GERN','VKTX','SDGR','VYNE','TWST','ANNX'
  ];

  /* ==================== SPECIALTY (Real estate, transports, etc) ==================== */
  const SPECIALTY = [
    // Airlines
    'DAL','UAL','AAL','LUV','SAVE','JBLU','HA','ALK','MESA','SKYW',
    // Cruise lines
    'CCL','RCL','NCLH','TNL','VIK','OSW',
    // Hotels
    'MAR','HLT','H','IHG','HST','RHP','PEB','APLE','SVC','XHR','SOHO',
    // Restaurants beyond
    'CMG','SBUX','MCD','YUM','DPZ','QSR','WEN','JACK','SHAK','CAKE',
    'TXRH','EAT','BLMN','DRI','BJRI','RRGB','CHUY','PZZA','ARKR','LOCO',
    'CMG','BROS','PLNT','PLAY','PTLO','DENN','RICK','CBRL','FRGI',
    // Insurance
    'CB','HIG','TRV','PGR','ALL','MET','PRU','AFL','AIG','CINF',
    'WRB','MKL','RGA','GL','UNM','ANAT','RNR','PRA','BHF','HMN',
    // Defense
    'LMT','RTX','NOC','GD','BA','HII','TXT','LHX','TDG','HEI',
    'KTOS','AVAV','MRCY','LDOS','BAH','SAIC','BWXT','CW','VVX','SPR',
    // Specialty retail
    'AAP','AZO','ORLY','ULTA','BBY','TJX','ROST','BURL','HD','LOW',
    'LULU','DECK','CROX','SKX','SHOO','GES','EXPR','URBN','ANF','PVH',
    // Misc large
    'PFE','MRK','BMY','LLY','PG','UNH','JPM','GS','MS','C'
  ];

  /* ==================== DEDUPLICATE AND ASSEMBLE ==================== */
  function unique(arr){
    return [...new Set(arr.filter(s => s && /^[A-Z][A-Z0-9.\-]*$/.test(s)))];
  }

  const all_large = unique([
    ...LARGE_TECH, ...LARGE_COMM, ...LARGE_CONS_DISC, ...LARGE_CONS_STAPLES,
    ...LARGE_ENERGY, ...LARGE_FINANCIALS, ...LARGE_HEALTHCARE, ...LARGE_INDUSTRIALS,
    ...LARGE_MATERIALS, ...LARGE_UTILITIES, ...LARGE_REITS
  ]);

  const all_mid = unique([...MIDCAP_TECH, ...MIDCAP_GROWTH]);

  const all_small = unique([...SMALLCAP_POPULAR, ...RECENT_IPO_GROWTH, ...SPECIALTY]);

  const all_adrs = unique(ADRS);

  const all_etfs = unique([
    ...ETF_BROAD, ...ETF_SECTOR, ...ETF_INTERNATIONAL, ...ETF_THEME,
    ...ETF_COMMODITY, ...ETF_BOND, ...ETF_LEVERAGED, ...ETF_VIX, ...ETF_INCOME_DIVIDEND
  ]);

  const all_stocks_only = unique([
    ...all_large, ...all_mid, ...all_small, ...all_adrs
  ]);

  const all_everything = unique([
    ...all_stocks_only, ...all_etfs
  ]);

  return {
    // Pre-defined universes (for the dropdown)
    sp100: unique(LARGE_TECH.slice(0,30).concat(['AAPL','MSFT','GOOGL','AMZN','META','NVDA','TSLA','JPM','BAC','V','MA','BRK-B','LLY','UNH','JNJ','PFE','MRK','ABBV','XOM','CVX','HD','PG','WMT','COST','KO','PEP','MCD','DIS','NFLX','BA','CAT','HON','LMT','NEE','LIN'])).slice(0,100),
    sp500: all_large,
    midcap: all_mid,
    smallcap: all_small,
    adrs: all_adrs,
    etfs: all_etfs,
    growth: unique([...MIDCAP_TECH, ...MIDCAP_GROWTH, ...RECENT_IPO_GROWTH]),
    tech: unique([...LARGE_TECH, ...MIDCAP_TECH]),

    // Combined sets
    liquid_500: unique([...LARGE_TECH, ...LARGE_FINANCIALS, ...LARGE_HEALTHCARE, ...LARGE_CONS_DISC, ...LARGE_CONS_STAPLES, ...LARGE_ENERGY, ...LARGE_INDUSTRIALS]).slice(0, 500),
    liquid_1000: unique([...all_large, ...all_mid]).slice(0, 1000),
    market_full: all_everything,  // ~1500+ stocks
    stocks_only: all_stocks_only, // No ETFs
  };
})();

// Quick stats (for debugging in console)
if (typeof console !== 'undefined') {
  const u = window.BULLZEEKER_UNIVERSE;
  console.log('🐂 Bullzeeker Universe loaded:', {
    market_full: u.market_full.length,
    stocks_only: u.stocks_only.length,
    sp500: u.sp500.length,
    midcap: u.midcap.length,
    smallcap: u.smallcap.length,
    adrs: u.adrs.length,
    etfs: u.etfs.length,
  });
}
