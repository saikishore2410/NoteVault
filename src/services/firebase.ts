import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudySession, StudyHistoryItem, Note } from '../types/notes';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with specific databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection verification (as per firebase-skill requirements)
let connectionTested = false;
export async function testFirestoreConnection() {
  if (connectionTested) return;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, local cache will be used.');
    }
  }
}
testFirestoreConnection();

// Auth Operations
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await syncUserProfile(user);
    return user;
  } catch (error: any) {
    console.error('Error during Google sign-in:', error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await fbSignOut(auth);
  } catch (error: any) {
    console.error('Error during sign-out:', error);
    throw error;
  }
}

// User Profile & Data Sync
export async function syncUserProfile(user: FirebaseUser) {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'STEM Student',
        photoURL: user.photoURL || '',
        createdAt: Date.now(),
        lastSeen: Date.now(),
        bookmarkedNoteIds: [],
        upvotedNoteIds: [],
      });
    } else {
      await setDoc(userRef, {
        lastSeen: Date.now(),
        displayName: user.displayName || 'STEM Student',
        photoURL: user.photoURL || '',
      }, { merge: true });
    }
  } catch (err: any) {
    console.warn('Could not sync user profile to Firestore:', err);
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  }
}

// User Study Session in Firestore
export async function saveStudySessionToFirestore(userId: string, session: StudySession) {
  if (!userId || !session) return;
  const userRef = doc(db, 'users', userId);
  try {
    await setDoc(userRef, { studySession: session, lastSeen: Date.now() }, { merge: true });
  } catch (err: any) {
    console.warn('Error saving study session to Firestore:', err);
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  }
}

export async function addStudyHistoryItemToFirestore(userId: string, item: StudyHistoryItem) {
  if (!userId || !item) return;
  const historyRef = doc(db, 'users', userId, 'history', item.noteId);
  try {
    await setDoc(historyRef, item);
  } catch (err: any) {
    console.warn('Error saving history item to Firestore:', err);
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}/history/${item.noteId}`);
    }
  }
}

export async function fetchUserStudyDataFromFirestore(userId: string): Promise<{
  studySession: StudySession | null;
  history: StudyHistoryItem[];
  bookmarkedNoteIds: string[];
  upvotedNoteIds: string[];
} | null> {
  if (!userId) return null;
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    let studySession: StudySession | null = null;
    let bookmarkedNoteIds: string[] = [];
    let upvotedNoteIds: string[] = [];

    if (userSnap.exists()) {
      const data = userSnap.data();
      studySession = (data.studySession as StudySession) || null;
      bookmarkedNoteIds = data.bookmarkedNoteIds || [];
      upvotedNoteIds = data.upvotedNoteIds || [];
    }

    // Fetch history subcollection
    const historyCol = collection(db, 'users', userId, 'history');
    const q = query(historyCol, orderBy('timestamp', 'desc'), limit(15));
    const historySnap = await getDocs(q);
    const history: StudyHistoryItem[] = [];
    historySnap.forEach((docItem) => {
      history.push(docItem.data() as StudyHistoryItem);
    });

    return { studySession, history, bookmarkedNoteIds, upvotedNoteIds };
  } catch (err: any) {
    console.warn('Error loading user data from Firestore:', err);
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.GET, `users/${userId}`);
    }
    return null;
  }
}

// Save community uploaded notes
export async function saveCommunityNoteToFirestore(note: Note, authorUid: string) {
  try {
    const noteRef = doc(db, 'communityNotes', note.id);
    await setDoc(noteRef, {
      ...note,
      authorUid,
      uploadedAt: Date.now(),
    });
  } catch (err: any) {
    console.warn('Error saving community note to Firestore:', err);
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, `communityNotes/${note.id}`);
    }
  }
}

// Fetch community uploaded notes
export async function fetchCommunityNotesFromFirestore(): Promise<Note[]> {
  try {
    const notesCol = collection(db, 'communityNotes');
    const q = query(notesCol, orderBy('uploadedAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    const loadedNotes: Note[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      loadedNotes.push(data as Note);
    });
    return loadedNotes;
  } catch (err: any) {
    console.warn('Error fetching community notes from Firestore:', err);
    return [];
  }
}

export { onAuthStateChanged };
export type { FirebaseUser };
