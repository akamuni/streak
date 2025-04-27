import { db } from '../firebase'
import { doc, onSnapshot, setDoc, getDocs, query, collection, where, limit } from 'firebase/firestore'

export interface UserProfile {
  name?: string
  username?: string
  about?: string
  photoURL?: string
  gender?: string
  dateOfBirth?: string
  lastReadBook?: string; // Add field to store the last read book
}

/**
 * Listen for real-time updates to a user's profile document.
 */
export const listenUserProfile = (uid: string, callback: (profile: UserProfile) => void) => {
  const docRef = doc(db, 'users', uid)
  return onSnapshot(docRef, snapshot => {
    if (snapshot.exists()) callback(snapshot.data() as UserProfile)
    else callback({})
  })
}

/**
 * Update fields in the user's profile document.
 */
export const updateUserProfile = async (uid: string, profile: Partial<UserProfile>) => {
  const docRef = doc(db, 'users', uid)
  await setDoc(docRef, profile, { merge: true })
}

/** Convert image file to base64 data URL */
const fileToDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

/**
 * Upload and set a new profile picture for the user by saving a data URL in Firestore.
 */
export const uploadProfilePicture = async (uid: string, file: File): Promise<string> => {
  const dataUrl = await fileToDataURL(file)
  await updateUserProfile(uid, { photoURL: dataUrl })
  return dataUrl
}

/** Check if a username already exists */
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  const q = query(collection(db, 'users'), where('username', '==', username))
  const snap = await getDocs(q)
  return !snap.empty
}

/**
 * Search for users whose username starts with the given term.
 */
export interface SearchUser {
  uid: string
  username?: string
  photoURL?: string
}
export const searchUsersByUsername = async (term: string): Promise<SearchUser[]> => {
  if (!term) return []
  const q = query(
    collection(db, 'users'),
    where('username', '>=', term),
    where('username', '<=', term + '\uf8ff'),
    limit(10)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    uid: d.id,
    username: (d.data() as any).username,
    photoURL: (d.data() as any).photoURL,
  }))
}
