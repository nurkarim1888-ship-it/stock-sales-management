import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  collection, 
  setDoc, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Product, 
  Salesman, 
  DispatchSession, 
  DamageLog, 
  AppSettings 
} from '../types';

export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign In Error:', err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Sync all app data to Firestore under users/{userId}
export async function syncStateToFirestore(
  userId: string,
  state: {
    products: Product[];
    salesmen: Salesman[];
    dispatches: DispatchSession[];
    damageLogs: DamageLog[];
    settings: AppSettings;
  }
) {
  if (!userId) return;

  try {
    // 1. Settings
    const settingsPath = `users/${userId}/settings/config`;
    await setDoc(doc(db, 'users', userId, 'settings', 'config'), {
      ...state.settings,
      userId,
      updatedAt: new Date().toISOString(),
    });

    // 2. Products
    for (const prod of state.products) {
      await setDoc(doc(db, 'users', userId, 'products', prod.id), {
        ...prod,
        userId,
      });
    }

    // 3. Salesmen
    for (const s of state.salesmen) {
      await setDoc(doc(db, 'users', userId, 'salesmen', s.id), {
        ...s,
        userId,
      });
    }

    // 4. Dispatches
    for (const d of state.dispatches) {
      await setDoc(doc(db, 'users', userId, 'dispatches', d.id), {
        ...d,
        userId,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
}

// Listen to Firestore changes in real-time
export function subscribeToUserData(
  userId: string,
  callbacks: {
    onProducts: (products: Product[]) => void;
    onSalesmen: (salesmen: Salesman[]) => void;
    onDispatches: (dispatches: DispatchSession[]) => void;
    onSettings: (settings: AppSettings) => void;
  }
) {
  if (!userId) return () => {};

  // Settings
  const unsubSettings = onSnapshot(
    doc(db, 'users', userId, 'settings', 'config'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as AppSettings;
        callbacks.onSettings(data);
      }
    },
    (err) => handleFirestoreError(err, OperationType.GET, `users/${userId}/settings/config`)
  );

  // Products
  const unsubProducts = onSnapshot(
    collection(db, 'users', userId, 'products'),
    (snap) => {
      if (!snap.empty) {
        const prods: Product[] = [];
        snap.forEach((docSnap) => prods.push(docSnap.data() as Product));
        callbacks.onProducts(prods);
      }
    },
    (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/products`)
  );

  // Salesmen
  const unsubSalesmen = onSnapshot(
    collection(db, 'users', userId, 'salesmen'),
    (snap) => {
      if (!snap.empty) {
        const list: Salesman[] = [];
        snap.forEach((docSnap) => list.push(docSnap.data() as Salesman));
        callbacks.onSalesmen(list);
      }
    },
    (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/salesmen`)
  );

  // Dispatches
  const unsubDispatches = onSnapshot(
    collection(db, 'users', userId, 'dispatches'),
    (snap) => {
      if (!snap.empty) {
        const list: DispatchSession[] = [];
        snap.forEach((docSnap) => list.push(docSnap.data() as DispatchSession));
        callbacks.onDispatches(list);
      }
    },
    (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/dispatches`)
  );

  return () => {
    unsubSettings();
    unsubProducts();
    unsubSalesmen();
    unsubDispatches();
  };
}
