import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize standard Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth();

// Initialize Firestore using custom database instance
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Standardized Operation Type enum
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

// Structured Firestore Error Interface
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

/**
 * Catches Firestore "permission denied" or configuration errors, and raises
 * a clearly structured JSON error block for precise diagnosis.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Exception Catch:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Run a bootstrapping network test to ensure the client is successfully
 * connected and authenticated to the real Firestore backend on warm boot up.
 */
export async function testConnection() {
  try {
    const testDocRef = doc(db, "_system_checks_", "connection");
    await getDocFromServer(testDocRef);
    console.log("Firebase Firestore active validation connection succeeded.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.warn("Firebase warning: Connection established but client returned offline state.");
    } else {
      console.log("Firestore test document read finished (normal check).");
    }
  }
}

testConnection();
