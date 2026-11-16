import { greetingsFile } from '@/modules/content';

export type InvitationInput = {
  /** Câu mời riêng của người nhận (invites.greeting), từ link mời riêng. */
  inviteLead?: string | null;
  /** Tên người nhận (invites.recipient_name), từ link mời riêng. */
  recipientName?: string | null;
  /** Câu mời và người được mời của thiệp (cards.invite_lead / cards.invitee_name). */
  cardLead?: string | null;
  cardInvitee?: string | null;
};

/**
 * Lời mời hiển thị "<lead>: <name>".
 * Link mời riêng thắng thiệp; thiệp bỏ trống thì dùng mặc định trong greetings.json.
 */
export function resolveInvitation(input: InvitationInput): { lead: string; name: string } {
  const pick = (...xs: (string | null | undefined)[]) => xs.map((x) => x?.trim()).find(Boolean);
  return {
    lead: pick(input.inviteLead, input.cardLead) ?? greetingsFile.defaultInviteLead,
    name: pick(input.recipientName, input.cardInvitee) ?? greetingsFile.defaultInvitee,
  };
}
