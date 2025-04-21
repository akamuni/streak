import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, Timestamp } from 'firebase/firestore'

/**
 * Listen to user's cheatDays subcollection in real-time.
 */
export const listenCheatDays = (
  userId: string,
  callback: (data: Record<string, Date>) => void
) => {
  const colRef = collection(db, 'users', userId, 'cheatDays')
  return onSnapshot(colRef, snapshot => {
    const data: Record<string, Date> = {}
    snapshot.docs.forEach(docSnap => {
      const { dateCheat } = docSnap.data()
      data[docSnap.id] = dateCheat instanceof Timestamp
        ? dateCheat.toDate()
        : new Date(dateCheat)
    })
    callback(data)
  })
}

/**
 * Mark or unmark a cheat day in Firestore.
 */
export const updateCheatDay = async (
  userId: string,
  cheatDate: Date,
  checked: boolean
) => {
  const dateStr = cheatDate.toDateString()
  const docRef = doc(db, 'users', userId, 'cheatDays', dateStr)
  if (checked) {
    await setDoc(docRef, { dateCheat: cheatDate })
  } else {
    await deleteDoc(docRef)
  }
}
