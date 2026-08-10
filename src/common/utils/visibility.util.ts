import { FilterQuery, Model, Types } from 'mongoose';

/**
 * Public-site visibility cascade.
 *
 * The admin "Active" switch on a project, a building (block) or a unit is a
 * kill-switch: the record and everything under it must disappear from the
 * public site. `isActive` is stored per record and Mongo cannot express the
 * cascade in a single `find()`, so the parents are resolved first and their
 * children excluded by id.
 *
 * Every public list/detail endpoint opts in with `?visibleOnly=true`. Admin
 * requests omit it and keep seeing deactivated records.
 */

/** Ids of the projects and buildings the admin has switched off. */
export interface HiddenIds {
  projects: Types.ObjectId[];
  buildings: Types.ObjectId[];
}

/**
 * Collect the deactivated parents. Reads the *inactive* side on purpose — it is
 * the short list, and it keeps the resulting `$nin` small.
 */
export async function findHiddenIds(
  projectModel: Model<any>,
  buildingModel: Model<any>,
): Promise<HiddenIds> {
  const [projects, buildings] = await Promise.all([
    projectModel.find({ isActive: false }).select('_id').lean().exec(),
    buildingModel.find({ isActive: false }).select('_id').lean().exec(),
  ]);

  const projectIds = projects.map((p) => p._id as Types.ObjectId);

  // A block inside a deactivated project is hidden too, even with its own
  // switch left on — otherwise its units would survive the project's kill.
  const blocksOfHiddenProjects = projectIds.length
    ? await buildingModel
        .find({ project: { $in: projectIds } })
        .select('_id')
        .lean()
        .exec()
    : [];

  const buildingIds = new Map<string, Types.ObjectId>();
  for (const b of [...buildings, ...blocksOfHiddenProjects]) {
    buildingIds.set(String(b._id), b._id as Types.ObjectId);
  }

  return { projects: projectIds, buildings: [...buildingIds.values()] };
}

/**
 * Narrow a filter to the records the public site may show. `parentKeys` names
 * the filter fields holding the project / building references — floors and
 * units both carry `project` + `building`, buildings carry only `project`.
 */
export function applyHiddenIds<T>(
  filter: FilterQuery<T>,
  hidden: HiddenIds,
  parentKeys: { project?: string; building?: string } = {
    project: 'project',
    building: 'building',
  },
): FilterQuery<T> {
  // The record's own switch.
  filter.isActive = { $ne: false };

  const exclude = (key: string, ids: Types.ObjectId[]) => {
    if (!ids.length) return;
    const existing = filter[key];
    if (existing) {
      // An explicit `?project=…` / `?building=…` is already in the filter —
      // AND the exclusion in rather than overwrite it.
      filter.$and = [...(filter.$and ?? []), { [key]: { $nin: ids } }];
    } else {
      filter[key] = { $nin: ids };
    }
  };

  if (parentKeys.project) exclude(parentKeys.project, hidden.projects);
  if (parentKeys.building) exclude(parentKeys.building, hidden.buildings);

  return filter;
}
