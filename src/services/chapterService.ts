import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import { getFriendsList } from './friendService'
import { sendNotification } from './notificationService'
import { updateUserProfile } from './userService'

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

    // Extract book name from chapterId (assuming format 'Book-Name-ChapterNum')
    const parts = chapterId.split('-');
    const bookName = parts.slice(0, -1).join('-'); // Join parts except the last one (chapter number)

    // Update user profile with the last read book
    if (bookName) { // Ensure bookName is not empty
      try {
        await updateUserProfile(userId, { lastReadBook: bookName });
      } catch (error) {
        console.error("Error updating last read book:", error);
      }
    }

    // Send notifications to friends
    try {
      const friends = await getFriendsList(userId)
      const notificationPromises = friends.map(friend => 
        sendNotification(friend.id, {
          type: 'chapter_read',
          fromUserId: userId,
          chapterId: chapterId,
          message: `marked chapter ${chapterId} as read!` // Simple message for now
        })
      )
      await Promise.all(notificationPromises) // Send all notifications concurrently
    } catch (error) {
      console.error("Error sending chapter read notifications:", error)
    }

  } else {
    await deleteDoc(docRef)
  }
}
