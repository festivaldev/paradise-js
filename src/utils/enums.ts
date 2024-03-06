export enum ApiVersion {
  Current = '2.0',
  Legacy101 = '1.0.1',
  Legacy102 = '1.0.2',
}

export enum ModerationFlag {
  Muted = 0x1,
  Ghosted = 0x2,
  Banned = 0x4,
  Speed = 0x8,
  Spamming = 0x10,
  CrudeLanguage = 0x20
}

export enum UberstrikeInventoryItem {
  ClanLicense = 1234,
  NameChange = 1294,
  LutzDefaultGearHead = 1084,
  LutzDefaultGearGloves = 1086,
  LutzDefaultGearUpperBody = 1087,
  LutzDefaultGearLowerBody = 1088,
  LutzDefaultGearBoots = 1089,
  Suit007 = 10000,
  Admin = 10001,
  AgentXenonBlue_Boots = 10002,
  AgentXenonBlueGloves = 10003,
  AgentXenonBlueHead = 10004,
  AgentXenonBlueLowerBody = 10005,
  AgentXenonBlueUpperBody = 10006,
  AgentXenonYellowBoots = 10007,
  AgentXenonYellowGloves = 10008,
  AgentXenonYellowHead = 10009,
  AgentXenonYellowLowerBody = 10010,
  AgentXenonYellowUpperBody = 10011,
  ArcticDreadsBoots = 10012,
  ArcticDreadsFace = 10013,
  ArcticDreadsGloves = 10014,
  ArcticDreadsHead = 10015,
  ArcticDreadsLowerbody = 10016,
  ArcticDreadsUpperbody = 10017,
  BaggyPants = 10018,
  BaggyShorts = 10019,
  BandannaFace = 10020,
  BandannaHead = 10021,
  BasketballSneakers = 10022,
  BeardAndMo = 10023,
  BetaHero = 10024,
  BlackCorpsBoots = 10025,
  BlackCorpsFace = 10026,
  BlackCorpsGloves = 10027,
  BlackCorpsHead = 10028,
  BlackCorpsLowerbody = 10029,
  BlackCorpsUpperbody = 10030,
  BlackPants = 10031,
  BreadBeret = 10032,
  CamoHalo_L_Head = 10033,
  CamoHalo_L_LB = 10034,
  CamoHalo_L_UB = 10035,
  CamoHalo_M_Head = 10036,
  CamoHalo_M_LB = 10037,
  CamoHalo_M_UB = 10038,
  Cap = 10039,
  ClanTShirt_C4C = 10040,
  ClanTShirt_DED = 10041,
  ClanTShirt_SLD = 10042,
  ClanTShirt_ST6IX = 10043,
  ClassyCoat = 10044,
  CounterTerrorist_Boots = 10045,
  CounterTerrorist_Face = 10046,
  CounterTerrorist_Gloves = 10047,
  CounterTerrorist_Hat = 10048,
  CounterTerrorist_LB = 10049,
  CounterTerrorist_UB_England = 10050,
  CounterTerrorist_UB_France = 10051,
  CounterTerrorist_UB_Germany = 10052,
  CounterTerrorist_UB_Russia = 10053,
  CounterTerrorist_UB_Usa = 10054,
  CyborgZombieHolo = 10055,
  DefaultShirt = 10056,
  DoveShirt = 10057,
  DrDecayBlueBoots = 10058,
  DrDecayBlueGloves = 10059,
  DrDecayBlueHead = 10060,
  DrDecayBlueLowerBody = 10061,
  DrDecayBlueUpperBody = 10062,
  DrDecayYellowBoots = 10063,
  DrDecayYellowGloves = 10064,
  DrDecayYellowHead = 10065,
  DrDecayYellowLowerBody = 10066,
  DrDecayYellowUpperBody = 10067,
  DundeeHead = 10068,
  DundeeLowerbody = 10069,
  DundeeShoes = 10070,
  DundeeUpperbody = 10071,
  EagleHeadBrown = 10072,
  EagleHeadWhite = 10073,
  FlagMask_Australia = 10074,
  FlagMask_Brazil = 10075,
  FlagMask_Canada = 10076,
  FlagMask_China = 10077,
  FlagMask_Europe = 10078,
  FlagMask_France = 10079,
  FlagMask_Germany = 10080,
  FlagMask_Holand = 10081,
  FlagMask_HongKong = 10082,
  FlagMask_India = 10083,
  FlagMask_Italy = 10084,
  FlagMask_Japan = 10085,
  FlagMask_Jason = 10086,
  FlagMask_Korea = 10087,
  FlagMask_Latvia = 10088,
  FlagMask_Malaysia = 10089,
  FlagMask_Mexico = 10090,
  FlagMask_NewZealand = 10091,
  FlagMask_Philipines = 10092,
  FlagMask_Poland = 10093,
  FlagMask_Portugal = 10094,
  FlagMask_Romania = 10095,
  FlagMask_Russia = 10096,
  FlagMask_Singapore = 10097,
  FlagMask_Spain = 10098,
  FlagMask_Taiwan = 10099,
  FlagMask_Turkey = 10100,
  FlagMask_UK = 10101,
  FlagMask_USA = 10102,
  FourFingerRings = 10103,
  FrogHeadGreen = 10104,
  FrogHeadGreenPrince = 10105,
  FrogHeadRed = 10106,
  FrogHeadRedGlasses = 10107,
  GhostPirate_Face = 10108,
  GhostPirateGloves = 10109,
  GhostPirateHat = 10110,
  GhostPirateLowerbody = 10111,
  GhostPirateShoes = 10112,
  GhostPirateUpperbody = 10113,
  GlobalModeratorTShirt = 10114,
  Godfather = 10115,
  GreenBeret = 10116,
  GreenTShirt = 10117,
  HalloWeenChineseZombie_Head = 10118,
  HalloweenFirePumpkinHead = 10119,
  HalloWeenGreenZombie = 10120,
  HalloweenPapeHeadBlackCop = 10121,
  HalloweenPapeHeadEvilFace = 10122,
  HalloweenPapeHeadJoker = 10123,
  HalloWeenPaperBagheadKnight = 10124,
  HalloWeenPaperBagheadNinja = 10125,
  HalloWeenPaperBagheadSkull = 10126,
  HalloWeenPaperBagheadVampire = 10127,
  HalloweenSkeleton_Head = 10128,
  HalloweenWitchHatHead = 10129,
  Halo_Head = 10130,
  Halo_Heavy_Gloves = 10131,
  Halo_Heavy_Head = 10132,
  Halo_Heavy_Head_Camo = 10133,
  Halo_Heavy_LB = 10134,
  Halo_Heavy_LB_Camo = 10135,
  Halo_Heavy_UB = 10136,
  Halo_Heavy_UB_Camo = 10137,
  Halo_LB = 10138,
  Halo_M_Boots = 10139,
  Halo_M_Gloves = 10140,
  Halo_M_Head = 10141,
  Halo_M_LB = 10142,
  Halo_M_UB = 10143,
  Halo_UB = 10144,
  HandfulRings = 10145,
  Headphone = 10146,
  Holo_Hydra = 10147,
  Holo_Nitric = 10148,
  Holo_Rust = 10149,
  Holo_Terra = 10150,
  HoodieNohat = 10151,
  HorseHeadBrown = 10152,
  HorseHeadUnicorn = 10153,
  HumanZombieHolo = 10154,
  JuggernautBoots = 10155,
  JuggernautBootsDE = 10156,
  JuggernautGloves = 10157,
  JuggernautGlovesDE = 10158,
  JuggernautHead = 10159,
  JuggernautHeadDE = 10160,
  JuggernautLowerbody = 10161,
  JuggernautLowerbodyDE = 10162,
  JuggernautUpperbody = 10163,
  JuggernautUpperbodyDE = 10164,
  JuliaHolo = 10165,
  JuliaNinjaHolo = 10166,
  KnightBootsBlack = 10167,
  KnightBootsGolden = 10168,
  KnightGlovesBlack = 10169,
  KnightGlovesGolden = 10170,
  KnightHead_1_Black = 10171,
  KnightHead_1_Golden = 10172,
  KnightHead_2_Black = 10173,
  KnightHead_2_Golden = 10174,
  KnightHead_3_Black = 10175,
  KnightHead_3_Golden = 10176,
  KnightLowerbodyBlack = 10177,
  KnightLowerbodyGolden = 10178,
  KnightUpperbodyBlack = 10179,
  KnightUpperbodyGolden = 10180,
  KongregateJacketBasic = 10181,
  LeatherCoat = 10182,
  LeatherShoes = 10183,
  LunaticLabjacket = 10184,
  MafiaLowerbody = 10185,
  MafiaUpperbody = 10186,
  MegatronBoots = 10187,
  MegatronGloves = 10188,
  MegatronHead = 10189,
  MegatronLowerbody = 10190,
  MegatronUpperbody = 10191,
  ModeratorTShirt = 10192,
  NinjaBootsBlack_DE = 10193,
  NinjaBootsWhite_DE = 10194,
  NinjaFaceBlack_DE_NinjaFaceBlack_DE = 10195,
  NinjaFaceWhite_DE_NinjaFaceWhite_DE = 10196,
  NinjaGloves = 10197,
  NinjaGlovesBlack_DE = 10198,
  NinjaGlovesWhite_DE = 10199,
  NinjaHead = 10200,
  NinjaHeadBlack_DE = 10201,
  NinjaHeadWhite_DE = 10202,
  NinjaLowerbody = 10203,
  NinjaLowerBodyBlack_DE = 10204,
  NinjaLowerBodyWhite_DE = 10205,
  NinjaMaskBlack_NinjaMaskBlack = 10206,
  NinjaMaskTeeth_NinjaMaskTeeth = 10207,
  NinjaShoes = 10208,
  NinjaUpperbody = 10209,
  NinjaUpperBodyBlack_DE = 10210,
  NinjaUpperBodyWhite_DE = 10211,
  PaperBagheadJuggernaut = 10212,
  PirateEyepatch_PirateEyepatch = 10213,
  PirateGloves = 10214,
  PirateHead = 10215,
  PirateLowerbody = 10216,
  PirateShoes = 10217,
  PirateUpperbody = 10218,
  ProtectivePants = 10219,
  PumpkinHead = 10220,
  QAShirt = 10221,
  RamboGloves = 10222,
  RamboHead = 10223,
  RamboLowerbody = 10224,
  RamboShoes = 10225,
  RamboUpperbody = 10226,
  SantaBeard_SantaBeard = 10227,
  SantaBoots = 10228,
  SantaGloves = 10229,
  SantaHead = 10230,
  SantaLowerbody = 10231,
  SantaUpperbody = 10232,
  Shirt = 10233,
  SkateSneakers = 10234,
  SkeletonGloves = 10235,
  SkeletonLowerBody = 10236,
  SkeletonShoes = 10237,
  SkeletonUpperBody = 10238,
  Skull_Blood = 10239,
  Skull_BlueTooth = 10240,
  Skull_Camouflage = 10241,
  Skull_Comic_Smile = 10242,
  Skull_Comic_Splat = 10243,
  Skull_Gold = 10244,
  Skull_Military_Blue = 10245,
  Skull_Military_Green = 10246,
  Skull_Military_Yellow = 10247,
  Skull_RedStar = 10248,
  Skull_Simple_Blue = 10249,
  Skull_Simple_Green = 10250,
  Skull_Simple_Red = 10251,
  Skull_US = 10252,
  Skull_Yellow = 10253,
  Skull_YellowTooth = 10254,
  Skull_Jonny5 = 10255,
  StratosSuitBoots = 10256,
  StratosSuitGloves = 10257,
  StratosSuitHead = 10258,
  StratosSuitLB = 10259,
  StratosSuitUB = 10260,
  Sunglasses = 10261,
  Sunglasses_Sunglasses = 10262,
  Terrorist_Boots = 10263,
  Terrorist_Face_Terrorist_Face = 10264,
  Terrorist_Gloves = 10265,
  Terrorist_LB_Camo01 = 10266,
  Terrorist_LB_Camo02 = 10267,
  Terrorist_LB_Camo03 = 10268,
  Terrorist_LB_Camo04 = 10269,
  Terrorist_LB_Default = 10270,
  Terrorist_UB_Default = 10271,
  UberCommando_Blue_LB = 10272,
  UberCommando_Blue_UB = 10273,
  UberCommando_Default_Boots = 10274,
  UberCommando_Default_Gloves = 10275,
  UberCommando_Default_LB = 10276,
  UberCommando_Default_UB = 10277,
  UberJacket = 10278,
  UberNinja_Black_Boots = 10279,
  UberNinja_Black_Gloves = 10280,
  UberNinja_Black_LB = 10281,
  UberNinja_Black_UB = 10282,
  UberNinja_White_Boots = 10283,
  UberNinja_White_Gloves = 10284,
  UberNinja_White_LB = 10285,
  UberNinja_White_UB = 10286,
  UberNinja_Yellow_Boots = 10287,
  UberNinja_Yellow_Gloves = 10288,
  UberNinja_Yellow_LB = 10289,
  UberNinja_Yellow_UB = 10290,
  UberNinjia_Balck_Head = 10291,
  UberNinjia_White_Head = 10292,
  UberNinjia_Yellow_Head = 10293,
  Vampire_Boots = 10294,
  Vampire_Face_Vampire_Face = 10295,
  Vampire_Gloves = 10296,
  Vampire_Hair = 10297,
  Vampire_LB = 10298,
  Vampire_UB = 10299,
  WhiteSkull_WhiteSkull = 10300,
  SpringGrenade_x8 = 2001,
  SpringGrenade_x4 = 2002,
  SpringGrenade_x2 = 2003,
  SpringGrenade_Admin = 2004,
  TheSplatbat = 1000,
  MachineGun = 1002,
  ShotGun = 1003,
  SniperRifle = 1004,
  Cannon = 1005,
  SplatterGun = 1006,
  Launcher = 1007,
  AK47 = 20000,
  AK47_Black = 20001,
  AK47_Camo = 20002,
  AK47_Tiger = 20003,
  AK47_Snake = 20004,
  AnnihilatorBlue = 20005,
  AnnihilatorYellow = 20006,
  ArcticLance = 20007,
  ArcticRifle = 20008,
  AssaultRifle_Blue = 20009,
  AssaultRifle_Brown = 20010,
  AssaultRifle_Camo = 20011,
  AssaultRifle_Pimp = 20012,
  Automatic_Shotgun_Black = 20013,
  Automatic_Shotgun_Camo = 20014,
  Automatic_Shotgun_Pimp = 20015,
  Automatic_Shotgun_Roughed = 20016,
  AutomaticShotgunSnake = 20017,
  AWP_Black = 20018,
  AWP_Camo = 20019,
  AWP_Pimp = 20020,
  AWP_Roughed = 20021,
  AWP_Snake = 20022,
  BattleSnake = 20023,
  BattleSnake_DE = 20024,
  Beretta = 20025,
  Beretta_Silver = 20026,
  BioLance = 20027,
  BioLanceYellow = 20028,
  DarkVanquisher = 20029,
  DeathHammer = 20030,
  Deliverator = 20031,
  Demolisher = 20032,
  DundeeKnifeFPS = 20033,
  EnigmaCannon = 20034,
  EnigmaCannon_Valentine = 20035,
  EnigmaCannon_DE = 20036,
  Eradicator = 20037,
  EradicatorYellow = 20038,
  Executioner = 20039,
  ExplosiveShotGun = 20040,
  ExplosiveShotGun_Gold = 20041,
  ExplosiveShotGun_Silver = 20042,
  ExplosiveShotGun_Tiger = 20043,
  FinalWord = 20044,
  FinalWordValentine = 20045,
  Firewave = 20046,
  ForceCannon = 20047,
  ForceCannonPlus = 20048,
  FusionLance = 20049,
  G3SG1_Black = 20050,
  G3SG1_Camo = 20051,
  G3SG1_Military = 20052,
  G3SG1_Tiger = 20053,
  GoldPistol = 20054,
  HaloCannon = 20055,
  HaloCannon_Camo = 20056,
  HaloCannon_Veteran = 20057,
  Hammer = 20058,
  iLauncher = 20059,
  JerichoBlue = 20060,
  JerichoYellow = 20061,
  Judge = 20062,
  Jury = 20063,
  Launcher_AcidGun = 20064,
  M4_Black = 20065,
  M4_Black_S = 20066,
  M4_Camo = 20067,
  M4_Camo_S = 20068,
  M4_Standard = 20069,
  M4_Standard_S = 20070,
  M4_Tiger = 20071,
  M4_Tiger_S = 20072,
  M4_USA = 20073,
  M4Valentine = 20074,
  MagmaRifle = 20075,
  MagmaRifle_NewYearEdition = 20076,
  Melee_Baguette = 20077,
  Melee_Malaysian_Kris = 20078,
  MissileTOW = 20079,
  MortarExporter = 20080,
  MythicEdge_DE = 20081,
  NefariousNeedler = 20082,
  OblivionHammer = 20083,
  OrdinatorRifle = 20084,
  PainHammer = 20085,
  Paintzerfaust = 20086,
  ParticleLance = 20087,
  ParticleLance_DE = 20088,
  ParticleLanceSnake = 20089,
  PirateKnifeFPS = 20090,
  RamboKnifeFPS = 20091,
  Sabertooth = 20092,
  SawedoffShotgun = 20093,
  SawedoffShotgunSilver = 20094,
  ShadowGun = 20095,
  ShotGun_DeathFlower = 20096,
  ShotGun_Spas = 20097,
  Sickle = 20098,
  Snapshot = 20099,
  SniperMSR = 20100,
  SniperMSR_Black = 20101,
  SniperMSR_Camo = 20102,
  SniperMSR_Tiger = 20103,
  SnotGun = 20104,
  SpitefulSkewer = 20105,
  SplatterGun_ManOWar = 20106,
  Tec9_MG = 20107,
  Tec9_Silver_MG = 20108,
  TheSplatbatSnake = 20109,
  Thunderbuss_DE = 20110,
  ThunderbussBlue = 20111,
  UltimaCannon = 20112,
  UMG = 20113,
  UMG_NewYearEdition = 20114,
  USP_Base = 20115,
  USP_BaseNoSilencer = 20116,
  USP_Black = 20117,
  USP_BlackNoSilencer = 20118,
  USP_Camo = 20119,
  USP_CamoNoSilencer = 20120,
  USP_Pimp = 20121,
  USP_PimpNoSilencer = 20122,
  UZI_Base = 20123,
  UZI_Camo = 20124,
  UZI_Gold = 20125,
  UZI_Pimp = 20126,
  UZI_Tiger = 20127,
  Vanquisher = 20128,
  Vanquisher_NewYearEdition = 20129,
  VanquisherValentine = 20130,
  Vlad = 20131,
  WhiteFlag = 20132,
  Wrecker = 20133,
  WreckerYellow = 20134,
  ZombieAxe = 20135,
  Cannon_RocketJumpDay = 20143,
}
