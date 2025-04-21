import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, Timestamp } from 'firebase/firestore'

/**
 * Listen to user's readChapters subcollection in real-time.
 * @returns unsubscribe function
 */
export const listenReadChapters = (
  userId: string,
  callback: (data: Record<string, Date>) => void
) => {
  const colRef = collection(db, 'users', userId, 'readChapters')
  return onSnapshot(colRef, snapshot => {
    const data: Record<string, Date> = {}
    snapshot.docs.forEach(docSnap => {
      const { dateRead } = docSnap.data()
      data[docSnap.id] = dateRead instanceof Timestamp ? dateRead.toDate() : new Date(dateRead)
    })
    callback(data)
  })
}

/**
 * Mark or unmark a chapter as read in Firestore.
 */
export const updateChapterRead = async (
  userId: string,
  chapterId: string,
  checked: boolean
) => {
  const docRef = doc(db, 'users', userId, 'readChapters', chapterId)
  if (checked) {
    await setDoc(docRef, { dateRead: new Date() })
  } else {
    await deleteDoc(docRef)
  }
}
