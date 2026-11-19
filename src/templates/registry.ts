import type { TemplateDefinition } from './types';
import { PrintTemplate } from './print/PrintTemplate';
import { GlassTemplate } from './glass/GlassTemplate';
import { BlueprintTemplate } from './blueprint/BlueprintTemplate';
import { TicketTemplate } from './ticket/TicketTemplate';
import { RoyalTemplate } from './royal/RoyalTemplate';
import { PortraitTemplate } from './portrait/PortraitTemplate';
import { DossierTemplate } from './dossier/DossierTemplate';
import { FeedTemplate } from './feed/FeedTemplate';
import { ScrapbookTemplate } from './scrapbook/ScrapbookTemplate';
import { JourneyTemplate } from './journey/JourneyTemplate';
import { PostcardTemplate } from './postcard/PostcardTemplate';
import { MagazineTemplate } from './magazine/MagazineTemplate';
import { GateTemplate } from './gate/GateTemplate';
import { EnvelopeTemplate } from './envelope/EnvelopeTemplate';
import { MemoriesTemplate } from './memories/MemoriesTemplate';
import { DiplomaTemplate } from './diploma/DiplomaTemplate';
import { StageTemplate } from './stage/StageTemplate';
import { CapflyTemplate } from './capfly/CapflyTemplate';
import { ScratchTemplate } from './scratch/ScratchTemplate';
import { ChatTemplate } from './chat/ChatTemplate';
import { ArcadeTemplate } from './arcade/ArcadeTemplate';
import { CalendarTemplate } from './calendar/CalendarTemplate';
import { CircuitTemplate } from './circuit/CircuitTemplate';
import { TerminalTemplate } from './terminal/TerminalTemplate';
import { GearsTemplate } from './gears/GearsTemplate';
import { LabTemplate } from './lab/LabTemplate';
import { BuildTemplate } from './build/BuildTemplate';

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
  { id: 'feed', scheme: 'light', Component: FeedTemplate },
  { id: 'scrapbook', scheme: 'light', Component: ScrapbookTemplate },
  { id: 'journey', scheme: 'light', Component: JourneyTemplate },
  { id: 'postcard', scheme: 'light', Component: PostcardTemplate },
  { id: 'magazine', scheme: 'light', Component: MagazineTemplate },
  { id: 'portrait', scheme: 'light', Component: PortraitTemplate },
  { id: 'royal', scheme: 'light', Component: RoyalTemplate },
  { id: 'print', scheme: 'light', Component: PrintTemplate },
  { id: 'glass', scheme: 'light', Component: GlassTemplate },
  { id: 'blueprint', scheme: 'dark', Component: BlueprintTemplate },
  { id: 'ticket', scheme: 'light', Component: TicketTemplate },
  // Sắc màu Bách Khoa
  { id: 'gate', scheme: 'dark', Component: GateTemplate },
  { id: 'envelope', scheme: 'dark', Component: EnvelopeTemplate },
  { id: 'memories', scheme: 'light', Component: MemoriesTemplate },
  { id: 'diploma', scheme: 'dark', Component: DiplomaTemplate },
  { id: 'stage', scheme: 'dark', Component: StageTemplate },
  { id: 'capfly', scheme: 'light', Component: CapflyTemplate },
  { id: 'scratch', scheme: 'dark', Component: ScratchTemplate },
  { id: 'chat', scheme: 'light', Component: ChatTemplate },
  { id: 'arcade', scheme: 'dark', Component: ArcadeTemplate },
  { id: 'calendar', scheme: 'light', Component: CalendarTemplate },
  { id: 'circuit', scheme: 'dark', Component: CircuitTemplate },
  { id: 'terminal', scheme: 'dark', Component: TerminalTemplate },
  { id: 'gears', scheme: 'light', Component: GearsTemplate },
  { id: 'lab', scheme: 'light', Component: LabTemplate },
  { id: 'build', scheme: 'light', Component: BuildTemplate },
];

const byId = new Map(TEMPLATES.map((t) => [t.id, t]));

export function getTemplateDefinition(id: string): TemplateDefinition {
  return byId.get(id) ?? TEMPLATES[0];
}
