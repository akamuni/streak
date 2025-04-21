import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../firebase'

export const login = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password)

export const signup = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  try {
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user)
    }
  } catch (error) {
    console.error('Email verification error:', error)
  }
  return userCredential
}

export const logout = () => signOut(auth)

// Google OAuth sign-in
export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}
