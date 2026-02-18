import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, type User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, onSnapshot, type DocumentData } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

// Firebase configuration
// NOTE: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth helpers
export const registerUser = async (email: string, password: string, username: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: username });
  return userCredential.user;
};

export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

// Firestore helpers for Channels
export const createChannel = async (channelData: DocumentData) => {
  const channelRef = doc(collection(db, 'channels'));
  await setDoc(channelRef, {
    ...channelData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return channelRef.id;
};

export const updateChannel = async (channelId: string, updates: DocumentData) => {
  const channelRef = doc(db, 'channels', channelId);
  await updateDoc(channelRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteChannel = async (channelId: string) => {
  const channelRef = doc(db, 'channels', channelId);
  await deleteDoc(channelRef);
};

export const getAllChannels = async () => {
  const channelsQuery = query(collection(db, 'channels'));
  const snapshot = await getDocs(channelsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToChannels = (callback: (channels: DocumentData[]) => void) => {
  const channelsQuery = query(collection(db, 'channels'));
  return onSnapshot(channelsQuery, (snapshot) => {
    const channels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(channels);
  });
};

// Firestore helpers for Users
export const createUserProfile = async (userId: string, userData: DocumentData) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...userData,
    createdAt: new Date().toISOString(),
  });
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? snapshot.data() : null;
};

export const updateUserProfile = async (userId: string, updates: DocumentData) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, updates);
};

// Storage helpers
export const uploadImage = async (base64Data: string, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadString(storageRef, base64Data, 'data_url');
  return await getDownloadURL(storageRef);
};

export { onAuthStateChanged, type FirebaseUser };
