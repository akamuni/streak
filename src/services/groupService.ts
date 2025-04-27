import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export interface Group {
  id?: string;
  name: string;
  description?: string;
  privacy: 'public' | 'private';
  imageUrl?: string;
  createdBy: string;
  createdAt?: any;
  inviteToken: string;
}

export async function createGroup({ name, description, privacy, imageUrl, createdBy }: Omit<Group, 'id' | 'createdAt' | 'inviteToken'>) {
  const inviteToken = uuidv4();
  const docRef = await addDoc(collection(db, 'groups'), {
    name,
    description: description || '',
    privacy,
    imageUrl: imageUrl || '',
    createdBy,
    createdAt: serverTimestamp(),
    inviteToken,
    members: {
      [createdBy]: { role: 'admin' }
    }
  });
  return { id: docRef.id, inviteToken };
}

// Get all groups where user is a member
export async function getUserGroups(userId: string): Promise<Group[]> {
  const q = query(collection(db, 'groups'), where(`members.${userId}`, '!=', null));
  const snap = await getDocs(q);
  return snap.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name || '',
      description: data.description || '',
      privacy: data.privacy || 'public',
      imageUrl: data.imageUrl || '',
      createdBy: data.createdBy || '',
      createdAt: data.createdAt,
      inviteToken: data.inviteToken || '',
      members: data.members || {},
    };
  });
}

// Join a group by invite code
export async function joinGroupByInviteCode(inviteCode: string, userId: string) {
  const q = query(collection(db, 'groups'), where('inviteToken', '==', inviteCode));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Invalid invite code.');
  const groupDoc = snap.docs[0];
  const groupData = groupDoc.data();
  if (groupData.members && groupData.members[userId]) {
    throw new Error('You are already a member of this group.');
  }
  const groupRef = doc(db, 'groups', groupDoc.id);
  await updateDoc(groupRef, {
    [`members.${userId}`]: { role: 'member' }
  });
  return { id: groupDoc.id, ...groupData };
}
