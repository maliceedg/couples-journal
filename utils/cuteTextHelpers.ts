import type { JournalData, TextMessage } from '../types';

/**
 * Resolve the display name for a cute text's "From" field based on who created it and who is viewing.
 * - Stored sender is "ME" | "PARTNER" (who the creator attributed the quote to).
 * - createdByUserId is who added this entry. We show the viewer-relative name (my name vs partner name).
 */
export function getCuteTextSenderDisplayName(
  msg: TextMessage,
  journal: JournalData | null
): string {
  const senderKey = (msg.sender ?? '').toUpperCase();
  const currentUserId = journal?.currentUser?.id;
  // Card author: show first name when available
  const myName = journal?.currentUser?.firstName ?? journal?.currentUser?.displayName ?? 'Me';
  const partnerName = journal?.partnerFirstName ?? journal?.partnerName ?? 'Partner';
  const createdBy = msg.createdByUserId;

  // Old entries without createdByUserId: treat as current user created → ME = myName, PARTNER = partnerName
  const createdByCurrentUser = createdBy == null || createdBy === currentUserId;

  if (senderKey === 'ME') {
    return createdByCurrentUser ? myName : partnerName;
  }
  if (senderKey === 'PARTNER') {
    return createdByCurrentUser ? partnerName : myName;
  }
  return msg.sender;
}
