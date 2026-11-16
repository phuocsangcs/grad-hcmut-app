import Image from 'next/image';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { FacultyMotif } from '../motifs/FacultyMotif';
import s from './portrait.module.css';

/**
 * ẢNH BÌA — trang web có ảnh chân dung làm bìa.
 * Máy tính: ảnh chiếm nửa trái (đứng yên khi cuộn), thông tin cuộn ở nửa phải.
 * Điện thoại: ảnh bìa tràn ngang ở trên, thông tin nối tiếp bên dưới.
 * Dùng container query nên cùng một mẫu đúng cả khi thu nhỏ để xem trước.
 * Chưa có ảnh thì bìa là mảng màu của khoa kèm hình vẽ.
 */
export function PortraitTemplate({ card, faculty, blocks, message, coverPhoto, preview }: TemplateProps) {
  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <div className={s.layout}>
        <header className={s.hero}>
          {coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) hoặc ảnh mẫu, đã nén
            <img className={s.photo} src={coverPhoto} alt={`Ảnh của ${card.displayName}`} decoding="async" fetchPriority="high" />
          ) : (
            <div className={s.placeholder} aria-hidden="true">
              <div className={s.motif}>
                <FacultyMotif motif={faculty.motif} />
              </div>
            </div>
          )}
          <div className={s.shade} aria-hidden="true" />
          <div className={`${s.caption} ${preview ? '' : 'rise'}`}>
            <span className={s.degree}>{faculty.degreeTitle}</span>
            <h1 className={s.name}>{card.displayName}</h1>
            <span className={s.faculty}>{faculty.name}</span>
          </div>
        </header>

        <div className={s.body}>
          <div className={s.school}>
            <Image src="/images/site/logo-bk.png" alt="" width={200} height={191} className={s.logo} />
            <span>Thư mời tham dự lễ tốt nghiệp · Trường Đại học Bách Khoa, ĐHQG-HCM</span>
          </div>

          <div className={s.invitee}>{blocks.invitee}</div>
          <p className={s.message}>{message}</p>

          {blocks.ceremony}
          {blocks.times}

          <div className={s.stack}>
            {blocks.rsvp}
            {blocks.guestbook}
            {blocks.after}
            {blocks.countdown}
            {blocks.meeting}
            {blocks.gallery}
            {blocks.actions}
            {blocks.explore}
          </div>
        </div>
      </div>
    </main>
  );
}
