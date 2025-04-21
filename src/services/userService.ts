import { db, storage } from '../firebase'
import { doc, onSnapshot, setDoc, getDocs, query, collection, where } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export interface UserProfile {
  username?: string
  about?: string
  photoURL?: string
  gender?: string
  dateOfBirth?: string
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

/**
 * Upload and set a new profile picture for the user.
 */
export const uploadProfilePicture = async (uid: string, file: File) => {
  const storageRef = ref(storage, `profilePictures/${uid}`)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  await updateUserProfile(uid, { photoURL: url })
  return url
}

/** Check if a username already exists */
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  const q = query(collection(db, 'users'), where('username', '==', username))
  const snap = await getDocs(q)
  return !snap.empty
}
