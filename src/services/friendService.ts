import { db } from '../firebase'
import {
  doc,
  collection,
  onSnapshot,
  query,
  setDoc,
  deleteDoc,
} from 'firebase/firestore'

/** Send a friend request */
export const sendFriendRequest = async (fromUid: string, toUid: string) => {
  // incoming for target
  await setDoc(doc(db, 'users', toUid, 'incomingRequests', fromUid), { from: fromUid, createdAt: new Date().toISOString() })
  // outgoing for sender
  await setDoc(doc(db, 'users', fromUid, 'outgoingRequests', toUid), { to: toUid, createdAt: new Date().toISOString() })
}

/** Withdraw a sent friend request */
export const withdrawFriendRequest = async (fromUid: string, toUid: string) => {
  await deleteDoc(doc(db, 'users', toUid, 'incomingRequests', fromUid))
  await deleteDoc(doc(db, 'users', fromUid, 'outgoingRequests', toUid))
}

/** Listen to incoming friend requests */
export const listenIncomingRequests = (
  uid: string,
  callback: (reqs: { id: string; from: string }[]) => void
) => {
  const q = query(collection(db, 'users', uid, 'incomingRequests'))
  return onSnapshot(q, snap => {
    const reqs = snap.docs.map(d => ({ id: d.id, from: d.data().from as string }))
    callback(reqs)
  })
}

/** Accept or decline an incoming friend request */
export const respondFriendRequest = async (
  uid: string,
  fromUid: string,
  accept: boolean
) => {
  // remove incoming
  await deleteDoc(doc(db, 'users', uid, 'incomingRequests', fromUid))
  // remove outgoing on sender
  await deleteDoc(doc(db, 'users', fromUid, 'outgoingRequests', uid))
  if (accept) {
    // add friend relationship
    await setDoc(doc(db, 'users', uid, 'friends', fromUid), { since: new Date().toISOString() })
    await setDoc(doc(db, 'users', fromUid, 'friends', uid), { since: new Date().toISOString() })
  }
}

/** Listen to outgoing friend requests */
export const listenOutgoingRequests = (
  uid: string,
  callback: (reqs: { id: string; to: string }[]) => void
) => {
  const q = query(collection(db, 'users', uid, 'outgoingRequests'))
  return onSnapshot(q, snap => {
    const reqs = snap.docs.map(d => ({ id: d.id, to: d.data().to as string }))
    callback(reqs)
  })
}

/** Listen to friends list */
export const listenFriendsList = (
  uid: string,
  callback: (friends: { id: string; since: string }[]) => void
) => {
  const q = query(collection(db, 'users', uid, 'friends'))
  return onSnapshot(q, snap => {
    const friends = snap.docs.map(d => ({ id: d.id, since: d.data().since as string }))
    callback(friends)
  })
}

/** Remove a friend */
export const removeFriend = async (
  uid: string,
  friendUid: string
) => {
  await deleteDoc(doc(db, 'users', uid, 'friends', friendUid))
  await deleteDoc(doc(db, 'users', friendUid, 'friends', uid))
}
