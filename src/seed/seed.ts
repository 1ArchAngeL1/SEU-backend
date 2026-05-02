import 'dotenv/config';
import mongoose from 'mongoose';

import { ProjectSchema } from '@/projects/schemas/project.schema';
import { BuildingSchema } from '@/buildings/schemas/building.schema';
import { FloorSchema } from '@/floors/schemas/floor.schema';
import { UnitSchema } from '@/units/schemas/unit.schema';
import { ProjectStatus } from '@/projects/enums/project-status.enum';
import { BuildingStatus } from '@/buildings/enums/building-status.enum';
import { FurnishingStatus, UnitStatus, UnitType } from '@/units/enums/unit.enums';

type FloorPlan = {
  floors: number;
  unitsPerFloor: number[];
};

type BlockSpec = {
  block: string;
  nameKa: string;
  nameEn: string;
  floors: number;
  unitsPerFloor: number[];
  pricePerSqmBase: number;
  status: BuildingStatus;
  constructionProgress: number;
};

const PROJECT = {
  name: { ka: 'ვაკე რეზიდენსი', en: 'Vake Residences' },
  description: {
    ka: 'პრემიუმ კლასის საცხოვრებელი კომპლექსი ვაკეში სამი კორპუსით.',
    en: 'Premium residential complex in Vake with three blocks.',
  },
  location: { address: 'Chavchavadze Ave 75', city: 'Tbilisi', district: 'Vake' },
  status: ProjectStatus.UNDER_CONSTRUCTION,
  startDate: new Date('2024-03-01'),
  expectedCompletionDate: new Date('2027-09-30'),
  totalLandArea: 8400,
  isActive: true,
  isFeatured: true,
  priceRange: { currency: 'USD', minPrice: 0, maxPrice: 0, minPricePerSqm: 0, maxPricePerSqm: 0 },
};

const BLOCKS: BlockSpec[] = [
  {
    block: 'A',
    nameKa: 'კორპუსი A',
    nameEn: 'Block A',
    floors: 14,
    unitsPerFloor: [8, 8, 8, 7, 7, 6, 6, 6, 5, 5, 4, 4, 3, 3],
    pricePerSqmBase: 1850,
    status: BuildingStatus.UNDER_CONSTRUCTION,
    constructionProgress: 65,
  },
  {
    block: 'B',
    nameKa: 'კორპუსი B',
    nameEn: 'Block B',
    floors: 12,
    unitsPerFloor: [8, 7, 7, 6, 6, 6, 5, 5, 4, 4, 3, 3],
    pricePerSqmBase: 1750,
    status: BuildingStatus.FOUNDATION,
    constructionProgress: 25,
  },
  {
    block: 'C',
    nameKa: 'კორპუსი C',
    nameEn: 'Block C',
    floors: 10,
    unitsPerFloor: [7, 7, 6, 6, 5, 5, 4, 4, 3, 3],
    pricePerSqmBase: 1900,
    status: BuildingStatus.FINISHING,
    constructionProgress: 88,
  },
];

function pickLayout(seed: number): {
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  balconies: number;
  totalSize: number;
  livableArea: number;
  balconySize: number;
} {
  // deterministic-ish variation by seed: cycle through 1BR / 2BR / 3BR / penthouse
  const variants = [
    {
      bedrooms: 1,
      livingRooms: 1,
      bathrooms: 1,
      balconies: 1,
      totalSize: 48,
      livableArea: 42,
      balconySize: 6,
    },
    {
      bedrooms: 1,
      livingRooms: 1,
      bathrooms: 1,
      balconies: 1,
      totalSize: 56,
      livableArea: 49,
      balconySize: 7,
    },
    {
      bedrooms: 2,
      livingRooms: 1,
      bathrooms: 1,
      balconies: 1,
      totalSize: 72,
      livableArea: 64,
      balconySize: 8,
    },
    {
      bedrooms: 2,
      livingRooms: 1,
      bathrooms: 2,
      balconies: 1,
      totalSize: 86,
      livableArea: 76,
      balconySize: 10,
    },
    {
      bedrooms: 3,
      livingRooms: 1,
      bathrooms: 2,
      balconies: 2,
      totalSize: 108,
      livableArea: 95,
      balconySize: 13,
    },
    {
      bedrooms: 3,
      livingRooms: 1,
      bathrooms: 2,
      balconies: 2,
      totalSize: 124,
      livableArea: 110,
      balconySize: 14,
    },
    {
      bedrooms: 4,
      livingRooms: 1,
      bathrooms: 3,
      balconies: 2,
      totalSize: 156,
      livableArea: 138,
      balconySize: 18,
    },
  ];
  const v = variants[seed % variants.length];
  return {
    bedrooms: v.bedrooms,
    bathrooms: v.bathrooms,
    livingRooms: v.livingRooms,
    balconies: v.balconies,
    totalSize: v.totalSize,
    livableArea: v.livableArea,
    balconySize: v.balconySize,
  };
}

function pickStatus(seed: number): UnitStatus {
  // mostly available, sprinkle some sold/reserved
  const r = seed % 11;
  if (r === 2) return UnitStatus.SOLD;
  if (r === 7) return UnitStatus.RESERVED;
  return UnitStatus.AVAILABLE;
}

function pickFurnishing(seed: number): FurnishingStatus {
  const opts = [
    FurnishingStatus.ROUGH_DRAFT,
    FurnishingStatus.SHELL_AND_CORE,
    FurnishingStatus.FINISHING,
    FurnishingStatus.WITHOUT,
  ];
  return opts[seed % opts.length];
}

async function run() {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/seu';
  console.log(`> connecting to ${uri.replace(/\/\/[^@]+@/, '//***@')}`);
  await mongoose.connect(uri);

  const ProjectModel = mongoose.model('Project', ProjectSchema);
  const BuildingModel = mongoose.model('Building', BuildingSchema);
  const FloorModel = mongoose.model('Floor', FloorSchema);
  const UnitModel = mongoose.model('Unit', UnitSchema);

  console.log('> wiping existing projects/buildings/floors/units');
  await Promise.all([
    ProjectModel.deleteMany({}),
    BuildingModel.deleteMany({}),
    FloorModel.deleteMany({}),
    UnitModel.deleteMany({}),
  ]);

  console.log('> creating project');
  const project = await ProjectModel.create(PROJECT);

  let projectTotalUnits = 0;
  let projectAvailableUnits = 0;
  let minPrice = Infinity;
  let maxPrice = 0;
  let minPpsm = Infinity;
  let maxPpsm = 0;

  for (const spec of BLOCKS) {
    console.log(`> creating block ${spec.block}`);
    const totalUnits = spec.unitsPerFloor.reduce((a, b) => a + b, 0);

    const building = await BuildingModel.create({
      project: project._id,
      name: { ka: spec.nameKa, en: spec.nameEn },
      block: spec.block,
      status: spec.status,
      basementFloors: 1,
      parkingSpaces: Math.round(totalUnits * 0.8),
      constructionProgress: spec.constructionProgress,
      isActive: true,
      description: {
        ka: `${spec.nameKa} — ${spec.floors} სართული, ${totalUnits} ბინა.`,
        en: `${spec.nameEn} — ${spec.floors} floors, ${totalUnits} apartments.`,
      },
    });

    const floorDocs = await FloorModel.insertMany(
      Array.from({ length: spec.floors }, (_, i) => ({
        building: building._id,
        project: project._id,
        floorNumber: i + 1,
      })),
    );
    const floorIdByNumber = new Map<number, mongoose.Types.ObjectId>();
    for (const f of floorDocs) floorIdByNumber.set(f.floorNumber, f._id);

    const unitDocs: any[] = [];
    let unitNumberCounter = 1;
    let availableInBuilding = 0;

    for (let floorIdx = 0; floorIdx < spec.floors; floorIdx++) {
      const floorNumber = floorIdx + 1;
      const floorId = floorIdByNumber.get(floorNumber)!;
      const unitsOnThisFloor = spec.unitsPerFloor[floorIdx];

      // higher floors slightly pricier
      const floorMultiplier = 1 + floorIdx * 0.012;

      for (let i = 0; i < unitsOnThisFloor; i++) {
        const seed = unitNumberCounter + spec.block.charCodeAt(0);
        const layout = pickLayout(seed);
        const status = pickStatus(seed);
        const furnishingStatus = pickFurnishing(seed);

        const ppsm = Math.round(spec.pricePerSqmBase * floorMultiplier);
        const amount = Math.round(ppsm * layout.totalSize);

        if (status === UnitStatus.AVAILABLE) {
          availableInBuilding++;
          if (amount < minPrice) minPrice = amount;
          if (amount > maxPrice) maxPrice = amount;
          if (ppsm < minPpsm) minPpsm = ppsm;
          if (ppsm > maxPpsm) maxPpsm = ppsm;
        }

        unitDocs.push({
          building: building._id,
          project: project._id,
          unitNumber: String(unitNumberCounter),
          block: spec.block,
          floor: floorId,
          floorNumber,
          status,
          type: UnitType.LIVING,
          bedrooms: layout.bedrooms,
          bathrooms: layout.bathrooms,
          livingRooms: layout.livingRooms,
          balconies: layout.balconies,
          terraces: floorNumber === spec.floors ? 1 : 0,
          totalSize: layout.totalSize,
          livableArea: layout.livableArea,
          balconySize: layout.balconySize,
          terraceSize: floorNumber === spec.floors ? 18 : 0,
          price: { currency: 'USD', amount, pricePerSqm: ppsm },
          furnishingStatus,
          isActive: true,
        });

        unitNumberCounter++;
      }
    }

    await UnitModel.insertMany(unitDocs);

    const floorCounters = new Map<number, { total: number; available: number }>();
    for (const u of unitDocs) {
      const c = floorCounters.get(u.floorNumber) ?? { total: 0, available: 0 };
      c.total += 1;
      if (u.status === UnitStatus.AVAILABLE) c.available += 1;
      floorCounters.set(u.floorNumber, c);
    }
    await Promise.all(
      Array.from(floorCounters.entries()).map(([floorNumber, c]) =>
        FloorModel.updateOne(
          { building: building._id, floorNumber },
          { $set: { totalUnits: c.total, availableUnits: c.available } },
        ),
      ),
    );

    await BuildingModel.findByIdAndUpdate(building._id, {
      $set: { totalUnits: unitDocs.length, availableUnits: availableInBuilding },
    });

    projectTotalUnits += unitDocs.length;
    projectAvailableUnits += availableInBuilding;
    console.log(
      `  block ${spec.block}: ${unitDocs.length} units (${availableInBuilding} available)`,
    );
  }

  await ProjectModel.findByIdAndUpdate(project._id, {
    $set: {
      totalBuildings: BLOCKS.length,
      totalUnits: projectTotalUnits,
      availableUnits: projectAvailableUnits,
      priceRange: {
        currency: 'USD',
        minPrice: minPrice === Infinity ? 0 : minPrice,
        maxPrice,
        minPricePerSqm: minPpsm === Infinity ? 0 : minPpsm,
        maxPricePerSqm: maxPpsm,
      },
    },
  });

  console.log(
    `> done. project=${project._id} buildings=${BLOCKS.length} units=${projectTotalUnits} available=${projectAvailableUnits}`,
  );
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
