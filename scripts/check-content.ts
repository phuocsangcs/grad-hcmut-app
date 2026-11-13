/**
 * Chạy trước build: kiểm tra 5 file JSON trong src/content.
 * Ngoài Zod còn kiểm tra tham chiếu chéo (defaultId, trùng id...).
 */
import {
  defaultTemplateId,
  eateriesFile,
  facultiesFile,
  getTemplate,
  greetingsFile,
  poisFile,
  templatesFile,
} from '../src/modules/content';

const errors: string[] = [];

function uniqueIds(name: string, ids: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`${name}: id trùng "${id}"`);
    seen.add(id);
  }
}

uniqueIds('faculties', facultiesFile.items.map((i) => i.id));
uniqueIds('pois', poisFile.items.map((i) => i.id));
uniqueIds('eateries', eateriesFile.items.map((i) => i.id));
uniqueIds('templates', templatesFile.items.map((i) => i.id));
uniqueIds('greetings.groups', greetingsFile.groups.map((i) => i.key));

if (!getTemplate(defaultTemplateId)) errors.push(`templates: defaultId "${defaultTemplateId}" không tồn tại`);

const { width, height } = poisFile.campus.mapSvg;
for (const p of poisFile.items) {
  if (p.x > width || p.y > height) errors.push(`pois: "${p.id}" nằm ngoài khung SVG ${width}x${height}`);
}
for (const t of Object.keys(poisFile.types)) {
  if (!poisFile.items.some((p) => p.type === t)) console.warn(`pois: loại "${t}" chưa có POI nào`);
}

if (errors.length) {
  console.error('Nội dung không hợp lệ:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log(
  `Nội dung OK: ${facultiesFile.items.length} khoa, ${poisFile.items.length} POI, ${eateriesFile.items.length} quán, ${templatesFile.items.length} mẫu, ${greetingsFile.groups.length} nhóm khách.`,
);
