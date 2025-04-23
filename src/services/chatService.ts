import { db } from '../firebase'
import { collection, onSnapshot, addDoc, query, orderBy, serverTimestamp, limit } from 'firebase/firestore'

/**
 * Generate a consistent conversation ID for two UIDs.
 */
export function getConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_')
}

/**
 * Send a message in a conversation.
 */
export async function sendMessage(
  convoId: string,
  senderId: string,
  text: string
) {
  const messagesRef = collection(db, 'conversations', convoId, 'messages')
  await addDoc(messagesRef, {
    senderId,
    text,
    ts: serverTimestamp(),
  })
}

/**
 * Listen for messages in a conversation (ordered by timestamp).
 */
export function listenMessages(
  convoId: string,
  callback: (msgs: { id: string; senderId: string; text: string; ts: Date }[]) => void
) {
  const messagesRef = collection(db, 'conversations', convoId, 'messages')
  const q = query(messagesRef, orderBy('ts', 'asc'))
  return onSnapshot(q, snapshot => {
    const msgs = snapshot.docs.map(docSnap => {
      const data = docSnap.data()
      const ts = data.ts?.toDate?.() || new Date()
      return {
        id: docSnap.id,
        senderId: data.senderId,
        text: data.text,
        ts,
      }
    })
    callback(msgs)
  })
}

/**
 * Listen to the latest message in a conversation (limit 1, ordered by ts desc).
 */
export function listenLatestMessage(
  convoId: string,
  callback: (msg: { senderId: string; text: string; ts: Date } | null) => void
) {
  const messagesRef = collection(db, 'conversations', convoId, 'messages')
  const q = query(messagesRef, orderBy('ts', 'desc'), limit(1))
  return onSnapshot(q, snapshot => {
    if (snapshot.docs.length > 0) {
      const data = snapshot.docs[0].data()
      const ts = data.ts?.toDate?.() || new Date()
      callback({ senderId: data.senderId, text: data.text, ts })
    } else {
      callback(null)
    }
  })
}
