export interface Item {
    ID: number;
    Type: string;
    name: string;
    index: number;
    canUpgrade: boolean;
    isAmmo: boolean;
    isBomb: boolean;
    isCraft: boolean;
    isDynamicCraft: boolean;
    isSpaceCraft: boolean;
    isLargeCraft: boolean;
    isFighter: boolean;
    isGroundFighter: boolean;
    isSpaceFighter: boolean;
    isSmallSpaceFighter: boolean;
    isLargeSpaceFighter: boolean;
    miningFrom: string;
    produceFrom: string;
    description: string;
    propertyName: string;
    typeString: string;
    fuelTypeString: string;
    StackSize: number;
    Grade: number;
    Upgrades: number[];
    DescFields: number[];
    IsFluid: boolean;
    IsEntity: boolean;
    CanBuild: boolean;
    BuildInGas: boolean;
    isRaw: boolean;
    missingTech: boolean;
    Productive: boolean;
    IconPath: string;
    AmmoType: string;
    ModelIndex: number;
    ModelCount: number;
    HpMax: number;
    Ability: number;
    HeatValue: number;
    Potential: number;
    ReactorInc: number;
    FuelType: number;
    BombType: number;
    CraftType: number;
    BuildIndex: number;
    BuildMode: number;
    GridIndex: number;
    UnlockKey: number;
    PreTechOverride: number;
    MechaMaterialID: number;
    DropRate: number;
    EnemyDropLevel: number;
    EnemyDropCount: number;
    EnemyDropMask: number;
    EnemyDropRange: EnemyDropRange;
    maincraft: Maincraft;
    handcraftProductCount: number;
    maincraftProductCount: number;
    handcrafts: handcrafts[];
    recipes: Maincraft[];
    makes: makes[];
    rawMats: RawMat[];
    preTech: Maincraft;
    prefabDesc: prefabDesc;
}

export interface handcrafts {
    ID: number;
}


export interface makes {
    ID: number;
}

export interface EnemyDropRange {
    x: number;
    y: number;
}

export interface Maincraft {
    ID: number;
}

export interface RawMat {
    id: number;
    count: number;
    inc: number;
}

export interface prefabDesc {
    modelIndex: string;
    subId: string;
    hasObject: string;
    independentCollider: string;
    hasBuildCollider: string;
    roughRadius: string;
    roughHeight: string;
    roughWidth: string;
    barWidth: string;
    barHeight: string;
    allowBuildInWater: string;
    needBuildInWaterTech: string;
    multiLevel: string;
    lapJoint: string;
    multiLevelAllowPortsOrSlots: string;
    multiLevelAllowRotate: string;
    multiLevelAlternativeIds: string;
    multiLevelAlternativeYawTransposes: string;
    addonType: string;
    veinMiner: string;
    oilMiner: string;
    dragBuild: string;
    dragBuildDist: string;
    blueprintBoxSize: string;
    isBelt: string;
    beltSpeed: string;
    beltPrototype: string;
    isSplitter: string;
    isMonitor: string;
    isSpeaker: string;
    isSpraycoster: string;
    isPiler: string;
    isStorage: string;
    storageCol: string;
    storageRow: string;
    minerType: string;
    minerPeriod: string;
    isInserter: string;
    inserterSTT: string;
    inserterDelay: string;
    inserterCanStack: string;
    inserterStackSize: string;
    isAssembler: string;
    assemblerSpeed: string;
    assemblerRecipeType: string;
    isFractionator: string;
    fracFluidInputMax: string;
    fracProductOutputMax: string;
    fracFluidOutputMax: string;
    isLab: string;
    labAssembleSpeed: string;
    labResearchSpeed: string;
    isTank: string;
    fluidStorageCount: string;
    anim_prepare_length: string;
    anim_working_length: string;
    isPowerNode: string;
    powerConnectDistance: string;
    powerCoverRadius: string;
    powerPoint: string;
    isPowerGen: string;
    photovoltaic: string;
    windForcedPower: string;
    gammaRayReceiver: string;
    geothermal: string;
    genEnergyPerTick: string;
    useFuelPerTick: string;
    fuelMask: string;
    powerCatalystId: string;
    powerProductId: string;
    powerProductHeat: string;
    isAccumulator: string;
    inputEnergyPerTick: string;
    outputEnergyPerTick: string;
    maxAcuEnergy: string;
    isPowerConsumer: string;
    isPowerCharger: string;
    workEnergyPerTick: string;
    idleEnergyPerTick: string;
    isPowerExchanger: string;
    exchangeEnergyPerTick: string;
    emptyId: string;
    fullId: string;
    maxExcEnergy: string;
    isStation: string;
    isStellarStation: string;
    stationMaxItemCount: string;
    stationMaxItemKinds: string;
    stationMaxDroneCount: string;
    stationMaxShipCount: string;
    stationMaxEnergyAcc: string;
    stationDronePos: string;
    stationShipPos: string;
    isCollectStation: string;
    stationCollectSpeed: string;
    isVeinCollector: string;
    isDispenser: string;
    dispenserMaxCourierCount: string;
    dispenserMaxEnergyAcc: string;
    isEjector: string;
    ejectorPivotY: string;
    ejectorMuzzleY: string;
    ejectorChargeFrame: string;
    ejectorColdFrame: string;
    ejectorBulletId: string;
    isSilo: string;
    siloChargeFrame: string;
    siloColdFrame: string;
    siloBulletId: string;
    minimapType: string;
    selectCenter: string;
    selectSize: string;
    selectAlpha: string;
    selectDistance: string;
    signHeight: string;
    signSize: string;
    incCapacity: string;
    incItemId: string;
    isRuin: string;
    isSpacecraft: string;
    isEnemy: string;
    enemyProtoId: string;
    enemySelectCircleRadius: string;
    enemySandCount: string;
    isEnemyBuilder: string;
    enemyMinMatter: string;
    enemyMinEnergy: string;
    enemyMaxMatter: string;
    enemyMaxEnergy: string;
    enemySpMatter: string;
    enemySpEnergy: string;
    enemySpMax: string;
    enemyIdleEnergy: string;
    enemyWorkEnergy: string;
    enemyGenMatter: string;
    enemyGenEnergy: string;
    isDFGroundBase: string;
    isDFGroundConnector: string;
    isDFGroundReplicator: string;
    dfReplicatorProductId: string;
    dfReplicatorProductSpMatter: string;
    dfReplicatorProductSpEnergy: string;
    dfReplicatorProductSpMax: string;
    dfReplicatorTurboSpeed: string;
    dfReplicatorUnitSupply: string;
    isDFGroundTurret: string;
    dfTurretType: string;
    dfTurretAttackRange: string;
    dfTurretSensorRange: string;
    dfTurretRangeInc: string;
    dfTurretAttackEnergy: string;
    dfTurretAttackInterval: string;
    dfTurretAttackHeat: string;
    dfTurretAttackDamage: string;
    dfTurretAttackDamageInc: string;
    dfTurretColdSpeed: string;
    dfTurretColdSpeedInc: string;
    dfTurretMuzzleY: string;
    isDFGroundShield: string;
    isDFSpaceCore: string;
    dfsCoreBuildRelaySpMatter: string;
    dfsCoreBuildRelaySpEnergy: string;
    dfsCoreBuildRelaySpMax: string;
    dfsCoreBuildTinderSpMatter: string;
    dfsCoreBuildTinderSpEnergy: string;
    dfsCoreBuildTinderSpMax: string;
    dfsCoreBuildTinderTriggerMinTick: string;
    dfsCoreBuildTinderTriggerKeyTick: string;
    dfsCoreBuildTinderTriggerProbability: string;
    isDFSpaceNode: string;
    isDFSpaceConnector: string;
    isDFSpaceConnectorVertical: string;
    isDFSpaceReplicator: string;
    isDFSpaceGammaReceiver: string;
    isDFSpaceTurret: string;
    isDFRelay: string;
    isDFTinder: string;
    isEnemyUnit: string;
    unitMaxMovementSpeed: string;
    unitMaxMovementAcceleration: string;
    unitMarchMovementSpeed: string;
    unitAssaultArriveRange: string;
    unitEngageArriveRange: string;
    unitSensorRange: string;
    unitAttackRange0: string;
    unitAttackInterval0: string;
    unitAttackHeat0: string;
    unitAttackDamage0: string;
    unitAttackDamageInc0: string;
    unitAttackRange1: string;
    unitAttackInterval1: string;
    unitAttackHeat1: string;
    unitAttackDamage1: string;
    unitAttackDamageInc1: string;
    unitAttackRange2: string;
    unitAttackInterval2: string;
    unitAttackHeat2: string;
    unitAttackDamage2: string;
    unitAttackDamageInc2: string;
    unitColdSpeed: string;
    unitColdSpeedInc: string;
    isFleet: string;
    fleetInitializeUnitSpeedScale: string;
    fleetSensorRange: string;
    fleetMaxActiveArea: string;
    fleetMaxMovementSpeed: string;
    fleetMaxMovementAcceleration: string;
    fleetMaxRotateAcceleration: string;
    fleetMaxAssembleCount: string;
    fleetMaxChargingCount: string;
    isCraftUnit: string;
    craftUnitSize: string;
    craftUnitInitializeSpeed: string;
    craftUnitMaxMovementSpeed: string;
    craftUnitMaxMovementAcceleration: string;
    craftUnitMaxRotateAcceleration: string;
    craftUnitAttackRange0: string;
    craftUnitAttackRange1: string;
    craftUnitSensorRange: string;
    craftUnitROF0: string;
    craftUnitROF1: string;
    craftUnitRoundInterval0: string;
    craftUnitRoundInterval1: string;
    craftUnitMuzzleInterval0: string;
    craftUnitMuzzleInterval1: string;
    craftUnitMuzzleCount0: string;
    craftUnitMuzzleCount1: string;
    craftUnitAttackDamage0: string;
    craftUnitAttackDamage1: string;
    craftUnitEnergyPerTick: string;
    craftUnitFireEnergy0: string;
    craftUnitFireEnergy1: string;
    craftUnitRepairEnergyPerHP: string;
    craftUnitRepairHPPerTick: string;
    craftUnitAddEnemyExppBase: string;
    craftUnitAddEnemyThreatBase: string;
    craftUnitAddEnemyHatredBase: string;
    craftUnitAddEnemyExppCoef: string;
    craftUnitAddEnemyThreatCoef: string;
    craftUnitAddEnemyHatredCoef: string;
    isTurret: string;
    turretType: string;
    turretAmmoType: string;
    turretVSCaps: string;
    turretDefaultDir: string;
    turretROF: string;
    turretRoundInterval: string;
    turretMuzzleInterval: string;
    turretMuzzleCount: string;
    turretMinAttackRange: string;
    turretMaxAttackRange: string;
    turretSpaceAttackRange: string;
    turretPitchUpMax: string;
    turretPitchDownMax: string;
    turretDamageScale: string;
    turretMuzzleY: string;
    turretAimSpeed: string;
    turretUniformAngleSpeed: string;
    turretAngleAcc: string;
    turretAddEnemyExppBase: string;
    turretAddEnemyThreatBase: string;
    turretAddEnemyHatredBase: string;
    turretAddEnemyExppCoef: string;
    turretAddEnemyThreatCoef: string;
    turretAddEnemyHatredCoef: string;
    isBeacon: string;
    beaconSignalRadius: string;
    beaconROF: string;
    beaconSpaceSignalRange: string;
    beaconPitchUpMax: string;
    beaconPitchDownMax: string;
    isFieldGenerator: string;
    fieldGenEnergyCapacity: string;
    fieldGenEnergyRequire0: string;
    fieldGenEnergyRequire1: string;
    isBattleBase: string;
    battleBaseMaxEnergyAcc: string;
    battleBasePickRange: string;
    isAmmo: string;
    AmmoBlastRadius0: string;
    AmmoBlastRadius1: string;
    AmmoBlastFalloff: string;
    AmmoMoveAcc: string;
    AmmoTurnAcc: string;
    AmmoHitIndex: string;
    isConstructionModule: string;
    constructionDroneCount: string;
    constructionRange: string;
    constructionDroneEjectPos: string;
    isConstructionDrone: string;
    isCombatModule: string;
    combatModuleFleetProtoId: string;
  }