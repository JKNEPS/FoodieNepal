import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";

const provider = new GoogleAuthProvider();
// Request Workspace forms scope 
provider.addScope("https://www.googleapis.com/auth/forms");

// In-memory token cache (Do not persist in localStorage as per Workspace security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener
export const initFormsAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in via pop-up requesting forms scope
export const formsGoogleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to receive Google access token from OAuth login popup.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Popup Authentication for Google Forms failed:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getFormsAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setFormsAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const formsLogout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
