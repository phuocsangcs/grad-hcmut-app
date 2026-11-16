import s from './blocks.module.css';

/** "Thương mời: Ba Mẹ". Có tên riêng (link mời) thì hiện tên, không thì hiện nhóm. */
export function Invitee({ name }: { name: string }) {
  return (
    <p className={s.invitee}>
      <span className={s.inviteeLead}>Thương mời:</span>
      <strong className={s.inviteeName}>{name}</strong>
    </p>
  );
}
