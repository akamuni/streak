import { db } from '../firebase'
import {
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  arrayUnion,
  Timestamp
} from 'firebase/firestore'

export interface Room {
  id: string
  name: string
  description?: string
  members: string[]
  createdAt: Date
}

/** Create a new reading room and add the creator as a member */
export const createRoom = async (
  name: string,
  description: string,
  userId: string
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'rooms'), {
    name,
    description,
    members: [userId],
    createdAt: Timestamp.now()
  })
  return docRef.id
}

/** Listen for rooms where the user is a member */
export const listenUserRooms = (
  userId: string,
  callback: (rooms: Room[]) => void
) => {
  const q = query(
    collection(db, 'rooms'),
    where('members', 'array-contains', userId)
  )
  return onSnapshot(q, snapshot => {
    const data = snapshot.docs.map(docSnap => {
      const d = docSnap.data() as any
      return {
        id: docSnap.id,
        name: d.name,
        description: d.description,
        members: d.members,
        createdAt: (d.createdAt as Timestamp).toDate()
      } as Room
    })
    callback(data)
  })
}

/** Join an existing room */
export const joinRoom = async (
  roomId: string,
  userId: string
) => {
  const roomRef = doc(db, 'rooms', roomId)
  await setDoc(
    roomRef,
    { members: arrayUnion(userId) },
    { merge: true }
  )
}

/** Listen for member changes in a specific room */
export const listenRoomMembers = (
  roomId: string,
  callback: (members: string[]) => void
) => {
  const roomRef = doc(db, 'rooms', roomId)
  return onSnapshot(roomRef, snap => {
    const d = snap.data() as any
    if (d?.members) callback(d.members)
  })
}
