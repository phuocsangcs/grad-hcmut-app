import { listPois, poisFile } from '@/modules/content';
import { directionsToCampusUrl } from '@/modules/share';
import { Button, Chip, Icon, Page, PageHeading } from '@/ui';
import { CampusMap } from './campus-map';
import s from './map.module.css';

export const metadata = { title: 'Bản đồ trường Bách Khoa ngày lễ' };

export default function MapPage() {
  const { width, height } = poisFile.campus.mapSvg;
  return (
    <Page>
      <PageHeading eyebrow="Bản đồ" title="Trong trường, đi đâu?" lead="Cổng, bãi xe, nhà vệ sinh, chỗ ngồi chờ và góc chụp ảnh quanh Hội trường A5." />
      <div className={s.meta}>
        <Chip tone="primary"><Icon name="pin" size={14} /> {poisFile.campus.address}</Chip>
        <Button href={directionsToCampusUrl()} target="_blank" rel="noreferrer" size="sm" trailing={<Icon name="external" size={14} />}>Chỉ đường đến cổng</Button>
      </div>
      <CampusMap pois={listPois()} types={poisFile.types} width={width} height={height} />
      <p className={s.small}>Bản đồ minh hoạ, không đúng tỉ lệ. Cập nhật {poisFile.updatedAt}.</p>
    </Page>
  );
}
