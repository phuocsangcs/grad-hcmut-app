import { listFaculties, listPois, poisFile } from '@/modules/content';
import { directionsToCampusUrl } from '@/modules/share';
import { Button, Icon, Page, PageHeading } from '@/ui';
import { CampusMap } from './campus-map';
import s from './map.module.css';

export const metadata = { title: 'Bản đồ trường Bách Khoa ngày lễ' };

export default function MapPage() {
  return (
    <Page>
      <PageHeading title="Trong trường, đi đâu?" lead="Toà của từng khoa, Hội trường A5, cổng, bãi xe, nhà vệ sinh và góc chụp ảnh. Bấm vào toà để xem, kéo để xoay." />
      <div className={s.meta}>
        <span className={s.address}>
          <Icon name="pin" size={14} /> {poisFile.campus.address}
        </span>
        <Button href={directionsToCampusUrl()} target="_blank" rel="noreferrer" size="sm" trailing={<Icon name="external" size={14} />}>
          Chỉ đường đến cổng
        </Button>
      </div>
      <CampusMap pois={listPois()} types={poisFile.types} faculties={listFaculties().map((f) => ({ id: f.id, name: f.name }))} />
      <p className={s.small}>Bản đồ minh hoạ vẽ lại từ sơ đồ của Trường, không đúng tỉ lệ. Cập nhật {poisFile.updatedAt}.</p>
    </Page>
  );
}
