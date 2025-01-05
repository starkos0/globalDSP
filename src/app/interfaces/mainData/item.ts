export interface Item {
  Type: string;
  StackSize: number;
  Grade: number;
  Upgrades: number[];
  IsEntity: boolean;
  CanBuild: boolean;
  IconPath: string;
  ModelIndex: number;
  ModelCount: number;
  HpMax: number;
  BuildIndex: number;
  BuildMode: number;
  GridIndex: number;
  DescFields: number[];
  handcraft: Handcraft;
  maincraft: Handcraft;
  handcraftProductCount: number;
  maincraftProductCount: number;
  handcrafts: Handcraft[];
  recipes: Handcraft[];
  makes: Handcraft[];
  rawMats: RawMat[];
  preTech: Handcraft;
  prefabDesc: PrefabDesc;
  ID: number;
  description: string;
  index: number;
  iconSprite: string;
  canUpgrade: boolean;
  typeString: string;
  fuelTypeString: string;
  name: string;
  IsFluid?: boolean;
  miningFrom?: string;
  isRaw: boolean;
}

export interface Handcraft {
  ID: number;
  name: string;
}

export interface PrefabDesc {
  modelIndex: number;
  hasObject: boolean;
  lodCount: number;
  lodDistances: number[];
  startInstCapacity: number;
  batchCapacity: number;
  cullingHeight: number;
  castShadow: number;
  recvShadow: number;
  colliders: Collider[];
  hasBuildCollider: boolean;
  buildCollider: Collider;
  buildColliders: Collider[];
  roughRadius: number;
  roughHeight: number;
  roughWidth: number;
  colliderComplexity: number;
  barWidth: number;
  barHeight: number;
  landPoints: SelectSize[];
  dragBuild: boolean;
  dragBuildDist: BlueprintBoxSize;
  blueprintBoxSize: BlueprintBoxSize;
  isAssembler: boolean;
  assemblerSpeed: number;
  assemblerRecipeType: string;
  anim_working_length: number;
  isPowerConsumer: boolean;
  workEnergyPerTick: number;
  idleEnergyPerTick: number;
  minimapType: number;
  slotPoses: SlotPose[];
  selectCenter: SelectCenter;
  selectSize: SelectSize;
  selectAlpha: number;
  selectDistance: number;
  signHeight: number;
  signSize: number;
  audioProtoId0: number;
  audioRadius0: number;
  audioRadius1: number;
  audioFalloff: number;
  audioVolume: number;
  audioPitch: number;
  audioDoppler: number;
  minerPeriod: number;
  labAssembleSpeed: number;
  beltSpeed: number;
}

export interface BlueprintBoxSize {
  x: number;
  y: number;
}

export interface Collider {
  idType: number;
  pos: SelectCenter;
  ext: SelectSize;
  q: Q;
  shape: string;
  usage?: string;
  isForBuild?: boolean;
  notForBuild?: boolean;
}

export interface SelectSize {
  x?: number;
  y?: number;
  z?: number;
  w?: number;
}

export interface SelectCenter {
  y: number;
}

export interface Q {
  w: number;
}

export interface SlotPose {
  position: SelectSize;
  rotation: SelectSize;
  forward: SelectSize;
  right: SelectSize;
  up: SelectSize;
}

export interface RawMat {
  id: number;
  count: number;
}
