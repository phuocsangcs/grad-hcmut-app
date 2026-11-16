import s from './blocks.module.css';

/** Lời mời "<câu mời>: <người được mời>", ví dụ "Thương mời: Ba Mẹ", "Kính mời: Cô Hoa". */
export function Invitee({ lead, name }: { lead: string; name: string }) {
  return (
    <p className={s.invitee}>
      <span className={s.inviteeLead}>{lead}:</span>
      <strong className={s.inviteeName}>{name}</strong>
    </p>
  );
}
