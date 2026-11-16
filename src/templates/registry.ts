import type { TemplateDefinition } from './types';
import { PrintTemplate } from './print/PrintTemplate';
import { GlassTemplate } from './glass/GlassTemplate';
import { BlueprintTemplate } from './blueprint/BlueprintTemplate';
import { TicketTemplate } from './ticket/TicketTemplate';
import { RoyalTemplate } from './royal/RoyalTemplate';
import { PortraitTemplate } from './portrait/PortraitTemplate';
import { DossierTemplate } from './dossier/DossierTemplate';

/**
 * Danh bạ template. id phải trùng với `src/content/templates.json`
 * (tên, mô tả, ảnh OG nằm ở JSON; code chỉ giữ phần render).
 *
 * Thêm template mới:
 *   1. tạo thư mục src/templates/<id>/ với <Id>Template.tsx + .module.css
 *   2. thêm vào mảng dưới
 *   3. thêm mục vào templates.json
 */
export const TEMPLATES: TemplateDefinition[] = [
  { id: 'dossier', scheme: 'light', Component: DossierTemplate },
  { id: 'portrait', scheme: 'light', Component: PortraitTemplate },
  { id: 'royal', scheme: 'light', Component: RoyalTemplate },
  { id: 'print', scheme: 'light', Component: PrintTemplate },
  { id: 'glass', scheme: 'light', Component: GlassTemplate },
  { id: 'blueprint', scheme: 'dark', Component: BlueprintTemplate },
  { id: 'ticket', scheme: 'light', Component: TicketTemplate },
];

const byId = new Map(TEMPLATES.map((t) => [t.id, t]));

export function getTemplateDefinition(id: string): TemplateDefinition {
  return byId.get(id) ?? TEMPLATES[0];
}
