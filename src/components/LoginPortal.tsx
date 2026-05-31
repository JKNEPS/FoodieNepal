import React, { useState, useEffect, useRef } from "react";
import { Shield, Sparkles, Lock, Mail, ArrowRight, CornerDownRight, CheckCircle2, User, KeyRound, Store, Bike, Eye, EyeOff } from "lucide-react";
import { UserRole } from "../types";
import { logAuthToGoogleSheets, sendGmailNotification } from "../utils/googleWorkspace";

interface LoginPortalProps {
  onLoginSuccess: (role: UserRole) => void;
  onCancel: () => void;
  onGoogleSuccess?: (user: any) => void;
  initialResetEmail?: string;
  onClearInitialResetEmail?: () => void;
}

export default function LoginPortal({ 
  onLoginSuccess, 
  onCancel, 
  onGoogleSuccess,
  initialResetEmail = "",
  onClearInitialResetEmail
}: LoginPortalProps) {
  const [activeTab, setActiveTab] = useState<UserRole>("customer");
  const [successAnimRole, setSuccessAnimRole] = useState<UserRole | null>(null);

  // Auto initialize password reset mode if prefilled email parameter exists
  useEffect(() => {
    if (initialResetEmail) {
      setForgotEmail(initialResetEmail);
      setForgotDob("");
      setForgotFavoritePet("");
      setForgotNewPassword("");
      setForgotErrorMsg("");
      setForgotSuccessMsg("💡 Verification link successfully followed. Please provide the matching answers below to reset your password.");
      setForgotStep(2); // Go straight to challenge inputs and new password setup
      setShowForgotModal(true);
      if (onClearInitialResetEmail) {
        onClearInitialResetEmail();
      }
    }
  }, [initialResetEmail]);
  
  // Customer Login & Registration States
  const [customerSubTab, setCustomerSubTab] = useState<"login" | "register">("login");
  const [dbUsername, setDbUsername] = useState("");
  const [dbPassword, setDbPassword] = useState("");
  const [showDbPassword, setShowDbPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDob, setRegDob] = useState("");
  const [regFavoritePet, setRegFavoritePet] = useState("");
  // Real-time password criteria calculations
  const regPasswordMinLength = regPassword.length >= 8;
  const regPasswordUppercase = /[A-Z]/.test(regPassword);
  const regPasswordLowercase = /[a-z]/.test(regPassword);
  const regPasswordDigit = /[0-9]/.test(regPassword);
  const regPasswordSpecial = /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(regPassword);
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regCheckingUsername, setRegCheckingUsername] = useState(false);
  const [regUsernameError, setRegUsernameError] = useState("");
  const [regUsernameSuccess, setRegUsernameSuccess] = useState(false);

  // Forgot Password Multi-Step Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotDob, setForgotDob] = useState("");
  const [forgotFavoritePet, setForgotFavoritePet] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Security QA + New Password, 3: Success
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotErrorMsg, setForgotErrorMsg] = useState("");
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState("");
  const [forgotSandboxLink, setForgotSandboxLink] = useState("");

  // Alternate direct identity challenge states (Username, Phone, DOB, Pet)
  const [useAlternateMethod, setUseAlternateMethod] = useState(false);
  const [altUsername, setAltUsername] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [altDob, setAltDob] = useState("");
  const [altFavoritePet, setAltFavoritePet] = useState("");
  const [altNewPassword, setAltNewPassword] = useState("");
  const [showAltNewPassword, setShowAltNewPassword] = useState(false);

  const latestUsernameRef = useRef("");

  const checkRegUsername = async (val: string) => {
    const trimmed = val.trim();
    latestUsernameRef.current = trimmed;
    if (!trimmed) {
      setRegUsernameError("");
      setRegUsernameSuccess(false);
      return;
    }
    setRegCheckingUsername(true);
    setRegUsernameError("");
    setRegUsernameSuccess(false);
    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(trimmed)}`);
      if (response.ok) {
        const data = await response.json();
        // Shield against out-of-order race responses from keystrokes
        if (latestUsernameRef.current !== trimmed) {
          return;
        }
        if (data.success) {
          if (!data.unique) {
            setRegUsernameError(`The username "${trimmed}" is already claimed! Please choose another unique handle.`);
            setRegUsernameSuccess(false);
          } else {
            setRegUsernameError("");
            setRegUsernameSuccess(true);
          }
        }
      }
    } catch (err) {
      console.warn("Server duplicate username check skipped", err);
    } finally {
      if (latestUsernameRef.current === trimmed) {
        setRegCheckingUsername(false);
      }
    }
  };

  const handleOfflineBypassLogin = () => {
    let targetUser: any = null;
    try {
      const raw = localStorage.getItem("foodienepal_users");
      const localUsers = raw ? JSON.parse(raw) : [];
      const typedUser = dbUsername.trim().toLowerCase();
      if (typedUser) {
        targetUser = localUsers.find((u: any) => 
          (u.username && u.username.toLowerCase() === typedUser) || 
          (u.email && u.email.toLowerCase() === typedUser)
        );
      }
    } catch (e) {
      console.warn("Could not retrieve local users key", e);
    }

    if (!targetUser) {
      targetUser = {
        id: "usr_1",
        name: "Jenish Sapkota",
        username: "jenish",
        password: "password123",
        phone: "+977 98********",
        email: "jenishsapkota272@gmail.com",
        role: "customer",
        address: "Ward 4, Basantapur, Kathmandu, Nepal",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        foodiePoints: 340,
        dob: "2000-01-01",
        favoritePet: "dog"
      };
    }

    localStorage.setItem("foodienepal_current_user", JSON.stringify(targetUser));
    localStorage.setItem("foodienepal_google_user", JSON.stringify(targetUser));

    // Async Workspace Sync: Log security authentication and send alert details
    logAuthToGoogleSheets("Login", targetUser.name, targetUser.username, targetUser.email, targetUser.phone, targetUser.role);
    sendGmailNotification(
      "FoodieNepal Security Alert: Successful Google Sign-In 🔒",
      `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px; max-width: 500px;">
         <h3 style="color: #4f46e5; margin-top: 0;">Successful Google login Alert 🔒</h3>
         <p>Dear <strong>${targetUser.name}</strong>,</p>
         <p>A new sign-in was successfully recorded on your account using Google Authentication.</p>
         <p><strong>Username:</strong> ${targetUser.username}</p>
         <p><strong>Associated Email:</strong> ${targetUser.email}</p>
         <p><strong>Region Scope:</strong> Nepalese Local Market</p>
         <p><strong>Security System status:</strong> SECURE</p>
         <br />
         <p style="font-size: 11px; color: #888; margin-bottom: 0;">If you initiated this session, no further action is necessary.</p>
       </div>`
    );

    setUserLoading(true);
    setErrorMessage("");
    if (onGoogleSuccess) {
      onGoogleSuccess(targetUser);
    }
    setSuccessAnimRole("customer");
    setTimeout(() => {
      onLoginSuccess("customer");
    }, 1800);
  };

  const handleCustomDbLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUsername.trim() || !dbPassword) {
      setErrorMessage("Both Username and Password are required to log in.");
      return;
    }
    setUserLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/customer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: dbUsername.trim(), password: dbPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUserLoading(false);
        if (onGoogleSuccess) {
          onGoogleSuccess(data.user);
        }

        // Async Workspace Sync: Log login events to Google Sheets and send email alert
        logAuthToGoogleSheets("Login", data.user.name, data.user.username, data.user.email, data.user.phone, data.user.role);
        sendGmailNotification(
          "Welcome Back to FoodieNepal! 🍲 Successful Sign-in Alert",
          `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px; max-width: 500px;">
             <h3 style="color: #d9381e; margin-top: 0;">Successful login Alert 🍲</h3>
             <p>Hello <strong>${data.user.name}</strong>,</p>
             <p>Welcome back! You have successfully signed into your FoodieNepal customer account.</p>
             <p><strong>Username:</strong> ${data.user.username}</p>
             <p><strong>Associated Email:</strong> ${data.user.email}</p>
             <p><strong>Timestamp:</strong> ${new Date().toUTCString()}</p>
             <br />
             <p style="font-size: 11px; color: #888; margin-bottom: 0;">Enjoy your favorite delicacies ordered right to your door step!</p>
           </div>`
        );

        setSuccessAnimRole("customer");
        setTimeout(() => {
          onLoginSuccess("customer");
        }, 1800);
      } else {
        setErrorMessage(data.error || "Login Failed: Invalid Unique Username or Password.");
        setUserLoading(false);
      }
    } catch (err) {
      console.warn("Network login issue, applying local standard session fallback:", err);
      
      // Attempt local verification
      let localUser: any = null;
      try {
        const raw = localStorage.getItem("foodienepal_users");
        const localUsers = raw ? JSON.parse(raw) : [];
        const typedUser = dbUsername.trim().toLowerCase();
        
        localUser = localUsers.find((u: any) => 
          ((u.username && u.username.toLowerCase() === typedUser) || (u.email && u.email.toLowerCase() === typedUser)) &&
          u.password === dbPassword
        );
      } catch (e) {
        console.warn("Local storage lookup failed", e);
      }

      if (localUser) {
        // Authenticate seamlessly offline
        localStorage.setItem("foodienepal_current_user", JSON.stringify(localUser));
        localStorage.setItem("foodienepal_google_user", JSON.stringify(localUser));
        
        setUserLoading(false);
        if (onGoogleSuccess) {
          onGoogleSuccess(localUser);
        }
        setSuccessAnimRole("customer");
        setTimeout(() => {
          onLoginSuccess("customer");
        }, 1800);
      } else {
        setErrorMessage("Connection issue with Nepal market database. Please try again.");
        setUserLoading(false);
      }
    }
  };

  const handleCustomDbRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = regUsername.trim();
    if (!regFullName.trim() || !trimmedUsername || !regPassword || !regPhone.trim() || !regEmail.trim() || !regAddress.trim() || !regDob || !regFavoritePet.trim()) {
      setErrorMessage("All profile fields (Full Name, Username, Password, Phone Number, Gmail address, Permanent Address, Date of Birth, and Favourite Pet Name) are strictly required.");
      return;
    }

    // Validate Username Format: 3 to 15 alphanumeric characters and underscores
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!usernameRegex.test(trimmedUsername)) {
      setErrorMessage("Username requirements not met: Username must be 3-15 characters long and contain only letters, numbers, and underscores (no spaces, e.g. Jenish_NP).");
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail.endsWith("@gmail.com")) {
      setErrorMessage("Google Validation Failed: Gmail Address must end with @gmail.com");
      return;
    }

    if (regUsernameError) {
      setErrorMessage("Please solve username clash: specified unique handle is already claimed.");
      return;
    }

    setUserLoading(true);
    setErrorMessage("");

    // Real-time pre-submit validation check to prevent bypassing duplicate checks
    try {
      const checkRes = await fetch(`/api/auth/check-username?username=${encodeURIComponent(trimmedUsername)}`);
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.success && !checkData.unique) {
          setRegUsernameError(`The username "${trimmedUsername}" is already claimed! Please choose another unique handle.`);
          setRegUsernameSuccess(false);
          setErrorMessage(`The username "${trimmedUsername}" is already claimed! Please choose another unique handle.`);
          setUserLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("[Pre-Submit Validation Skipped]", err);
    }

    // Check strength of Password
    const hasMinLength = regPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(regPassword);
    const hasLowercase = /[a-z]/.test(regPassword);
    const hasDigit = /[0-9]/.test(regPassword);
    const hasSpecial = /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(regPassword);

    if (!(hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSpecial)) {
      setErrorMessage("Password Security Validation Failed: Your password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      setUserLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/customer-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regFullName.trim(),
          username: trimmedUsername,
          password: regPassword,
          phone: regPhone.trim(),
          email: cleanEmail,
          address: regAddress.trim(),
          dob: regDob,
          favoritePet: regFavoritePet.trim()
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUserLoading(false);
        if (onGoogleSuccess) {
          onGoogleSuccess(data.user);
        }

        // Async Workspace Sync: Log registration entry to Google Sheet and dispatch personalized Gmail Welcome Email
        logAuthToGoogleSheets("Register", data.user.name, data.user.username, data.user.email, data.user.phone, data.user.role);
        sendGmailNotification(
          "Welcome to FoodieNepal! 🍲 Registered Successfully",
          `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px; max-width: 500px;">
             <h2 style="color: #d9381e; margin-top: 0;">Welcome to FoodieNepal! 🍲</h2>
             <p>Hello <strong>${data.user.name}</strong>,</p>
             <p>Thank you for registering on <strong>FoodieNepal</strong>. Your customer portal profile has been created successfully!</p>
             <hr style="border: 0; border-top: 1px solid #eee;" />
             <p><strong>Your Profile Highlights:</strong></p>
             <ul style="padding-left: 20px; line-height: 1.6;">
               <li><strong>Unique Handle:</strong> ${data.user.username}</li>
               <li><strong>Registered Email:</strong> ${data.user.email}</li>
               <li><strong>Primary Contact:</strong> ${data.user.phone || "Not Provided"}</li>
               <li><strong>Delivery Address:</strong> ${data.user.address || "Not Provided"}</li>
             </ul>
             <hr style="border: 0; border-top: 1px solid #eee;" />
             <p>As a warm greeting, we've loaded your loyalty ledger with starter points!</p>
             <p style="font-size: 11px; color: #888; margin-bottom: 0;">Explore traditional cuisines, set up interactive support form channels, and trace riders live!</p>
           </div>`
        );

        setSuccessAnimRole("customer");
        setTimeout(() => {
          onLoginSuccess("customer");
        }, 1800);
      } else {
        setErrorMessage(data.error || "Registration Rejected by database verification checks.");
        setUserLoading(false);
      }
    } catch (err) {
      console.warn("Registration network issue, saving registration details offline to local catalog.", err);
      
      const newUser = {
        id: `usr_${Date.now()}`,
        name: regFullName.trim(),
        username: trimmedUsername,
        password: regPassword,
        phone: regPhone.trim(),
        email: cleanEmail,
        address: regAddress.trim(),
        dob: regDob,
        favoritePet: regFavoritePet.trim(),
        role: "customer" as const,
        foodiePoints: 120,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
      };

      try {
        const raw = localStorage.getItem("foodienepal_users");
        const localUsers = raw ? JSON.parse(raw) : [];
        localUsers.push(newUser);
        localStorage.setItem("foodienepal_users", JSON.stringify(localUsers));
        localStorage.setItem("foodienepal_current_user", JSON.stringify(newUser));
        localStorage.setItem("foodienepal_google_user", JSON.stringify(newUser));
      } catch (e) {
        console.warn("Offline record keeping failed", e);
      }

      setUserLoading(false);
      if (onGoogleSuccess) {
        onGoogleSuccess(newUser);
      }
      setSuccessAnimRole("customer");
      setTimeout(() => {
        onLoginSuccess("customer");
      }, 1800);
    }
  };

  const handleForgotStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotErrorMsg("Please enter your registered Gmail address.");
      return;
    }
    setForgotLoading(true);
    setForgotErrorMsg("");
    setForgotSuccessMsg("");
    setForgotSandboxLink("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setForgotSuccessMsg(data.message);
        if (data.resetLink) {
          setForgotSandboxLink(data.resetLink);
        }
        setForgotStep(2); // Progress to Verification & Password creation
      } else {
        setForgotErrorMsg(data.error || "We could not find an account associated with this Gmail.");
      }
    } catch (err) {
      setForgotErrorMsg("Server connection problem. Please verify your connection.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotDob || !forgotFavoritePet.trim() || !forgotNewPassword) {
      setForgotErrorMsg("All fields are strictly required.");
      return;
    }

    // Client-side strong password validation for UI parity
    const hasMinLength = forgotNewPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(forgotNewPassword);
    const hasLowercase = /[a-z]/.test(forgotNewPassword);
    const hasDigit = /[0-9]/.test(forgotNewPassword);
    const hasSpecial = /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(forgotNewPassword);

    if (!(hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSpecial)) {
      setForgotErrorMsg("Password requires 8+ characters, an uppercase, a lowercase, a number, and a special character.");
      return;
    }

    setForgotLoading(true);
    setForgotErrorMsg("");

    try {
      const response = await fetch("/api/auth/reset-password-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          dob: forgotDob,
          favoritePet: forgotFavoritePet.trim(),
          newPassword: forgotNewPassword
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setForgotStep(3); // recovery complete page
      } else {
        setForgotErrorMsg(data.error || "Validation answers are incorrect. Access denied.");
      }
    } catch (err) {
      setForgotErrorMsg("Could not submit reset request. Please check server.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleAlternateRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!altUsername.trim() || !altPhone.trim() || !altDob || !altFavoritePet.trim() || !altNewPassword) {
      setForgotErrorMsg("All fields are strictly required for the Alternative Security Challenge.");
      return;
    }

    // Passwords criteria validation
    const hasMinLength = altNewPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(altNewPassword);
    const hasLowercase = /[a-z]/.test(altNewPassword);
    const hasDigit = /[0-9]/.test(altNewPassword);
    const hasSpecial = /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(altNewPassword);

    if (!(hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSpecial)) {
      setForgotErrorMsg("New Password must be 8+ characters, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
      return;
    }

    setForgotLoading(true);
    setForgotErrorMsg("");

    try {
      const response = await fetch("/api/auth/alternate-recovery-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: altUsername.trim(),
          phone: altPhone.trim(),
          dob: altDob,
          favoritePet: altFavoritePet.trim(),
          newPassword: altNewPassword
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Go to success
        setForgotStep(3);
      } else {
        setForgotErrorMsg(data.error || "Bypass challenge failed. Security values do not match registered credentials.");
      }
    } catch (err) {
      setForgotErrorMsg("Problem reaching security gateway. Please verify network status.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Admin Login States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Vendor/Kitchen Login States
  const [vendorCode, setVendorCode] = useState("");
  const [vendorPass, setVendorPass] = useState("");
  const [showVendorCode, setShowVendorCode] = useState(false);
  const [showVendorPass, setShowVendorPass] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<"admin" | "kitchen">("admin");

  // Rider Login States
  const [riderCode, setRiderCode] = useState("");
  const [riderPass, setRiderPass] = useState("");
  const [showRiderUsername, setShowRiderUsername] = useState(false);
  const [showRiderPassword, setShowRiderPassword] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password;

    if (!cleanUser || !cleanPass) {
      setErrorMessage("Username and password are required.");
      return;
    }

    setAdminLoading(true);
    setErrorMessage("");

    // Notify auth sentinel of admin authentication submission
    fetch("/api/auth/notify-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cleanUser,
        password: cleanPass,
        role: "admin",
        action: "login_attempt"
      })
    }).catch(err => console.error("Telemetry failed:", err));

    setTimeout(() => {
      setAdminLoading(false);
      // STRICT authorization rules requested under prompt instructions
      if (cleanUser === "Jenish_Obir_Bibash" && cleanPass === "Foodie*Nepal#Np") {
        setSuccessAnimRole("admin");
        setTimeout(() => {
          onLoginSuccess("admin");
        }, 1800);
      } else {
        setErrorMessage("Access Denied: Incorrect Admin Username or Security Password.");
      }
    }, 750);
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = vendorCode.trim();
    const cleanPass = vendorPass;

    if (!cleanUser || !cleanPass) {
      setErrorMessage("Merchant code and password are required.");
      return;
    }

    setUserLoading(true);
    setErrorMessage("");

    // Notify auth sentinel of vendor authentication submission
    fetch("/api/auth/notify-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cleanUser,
        password: cleanPass,
        role: "vendor",
        action: "login_attempt"
      })
    }).catch(err => console.error("Telemetry failed:", err));

    setTimeout(() => {
      setUserLoading(false);
      if (cleanUser.toLowerCase() === "vendor" && cleanPass === "vendor") {
        setSuccessAnimRole("vendor");
        setTimeout(() => {
          onLoginSuccess("vendor");
        }, 1800);
      } else {
        setErrorMessage("Access Denied: Incorrect Merchant username or password. (Hint: use 'vendor' / 'vendor')");
      }
    }, 500);
  };

  const handleRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = riderCode.trim();
    const cleanPass = riderPass;

    if (!cleanUser || !cleanPass) {
      setErrorMessage("Rider GPS code and password are required.");
      return;
    }

    setUserLoading(true);
    setErrorMessage("");

    // Notify auth sentinel of rider authentication submission
    fetch("/api/auth/notify-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cleanUser,
        password: cleanPass,
        role: "rider",
        action: "login_attempt"
      })
    }).catch(err => console.error("Telemetry failed:", err));

    setTimeout(() => {
      setUserLoading(false);
      if (cleanUser === "Rider_Foodie_Nepal_Np" && cleanPass === "#Rider*Foodie_Nepal.Np") {
        setSuccessAnimRole("rider");
        setTimeout(() => {
          onLoginSuccess("rider");
        }, 1800);
      } else {
        setErrorMessage("Access Denied: Incorrect Rider ID code or security password entry.");
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#FFF8F0] text-gray-950 rounded-3xl overflow-hidden shadow-2xl border border-[#8B1A1A]/10 grid md:grid-cols-12 min-h-[500px] max-h-[92vh] md:max-h-[640px] overflow-y-auto">
        {successAnimRole && (
          <div className="absolute inset-0 z-50 bg-[#8B1A1A] text-white flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
            <div className="relative mb-6">
              <div className="absolute inset-0 w-24 h-24 -m-4 bg-white/10 rounded-full animate-ping" />
              <div className="absolute inset-0 w-20 h-20 -m-2 bg-white/10 rounded-full animate-pulse" />
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-xl relative z-10 animate-bounce">
                <CheckCircle2 className="w-10 h-10 stroke-[3]" />
              </div>
            </div>
            
            <h3 className="text-3xl font-serif italic font-bold tracking-tight text-[#FFF8F0] mb-2 animate-pulse">
              Successfully Logged In!
            </h3>
            <p className="text-xs text-orange-200 uppercase font-mono tracking-widest font-black">
              {successAnimRole === "admin" ? "Enterprise Administrator Workspace" : 
               successAnimRole === "vendor" ? "Momo Kitchen Merchant Board" :
               successAnimRole === "rider" ? "Rider GPS Dispatch Board" :
               "Welcome to Customer Portal Hub"}
            </p>
            <div className="mt-8 flex items-center gap-2 text-xs text-white/70 font-semibold bg-black/20 px-3.5 py-1.5 rounded-full border border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
              <span>Hajur! Loading your custom dashboard...</span>
            </div>
          </div>
        )}
        
        {/* Left Side: App branding & Tab selection */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#8B1A1A] to-[#590C0C] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-black/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="p-1 px-1.5 bg-[#FF6B35] text-white text-[10px] font-mono rounded font-black">SECURE</span>
              <span className="text-white/70 text-xs tracking-widest uppercase font-mono">Gateway</span>
            </div>
            <h2 className="text-2xl font-serif italic text-[#FFF8F0] tracking-tight leading-snug">
              Foodie<span className="text-[#FF6B35] font-sans font-extrabold not-italic">Nepal!</span>
            </h2>
            <p className="text-xxs text-gray-300 font-mono tracking-wider uppercase mt-1">
              Multi-Route Identity Gate
            </p>
          </div>

          {/* Tab buttons */}
          <div className="relative z-10 grid grid-cols-1 gap-2.5 my-6 md:my-8 font-sans">
            <button
              onClick={() => {
                setActiveTab("customer");
                setErrorMessage("");
              }}
              className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-1.5 ${
                activeTab === "customer"
                  ? "bg-white/15 border-white/25 shadow-md text-[#FFF8F0]"
                  : "bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <div>
                <p className="text-[11px] md:text-sm font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" /> Customer
                </p>
                <p className="text-[9px] text-gray-300 hidden md:block">Customer instant check-in</p>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 hidden md:block transition-transform ${activeTab === "customer" ? "translate-x-1" : ""}`} />
            </button>

            <button
              onClick={() => {
                setActiveTab("rider");
                setErrorMessage("");
              }}
              className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-1.5 ${
                activeTab === "rider"
                  ? "bg-white/15 border-white/25 shadow-md text-[#FFF8F0]"
                  : "bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <div>
                <p className="text-[11px] md:text-sm font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5 text-[#FF6B35]" /> Rider
                </p>
                <p className="text-[9px] text-gray-300 hidden md:block">Courier dispatch GPS</p>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 hidden md:block transition-transform ${activeTab === "rider" ? "translate-x-1" : ""}`} />
            </button>

            <button
              onClick={() => {
                setActiveTab("admin");
                setErrorMessage("");
              }}
              className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-1.5 ${
                activeTab === "admin"
                  ? "bg-white/15 border-white/25 shadow-md text-[#FFF8F0]"
                  : "bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <div>
                <p className="text-[11px] md:text-sm font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#FF6B35]" /> Admin Portal
                </p>
                <p className="text-[9px] text-gray-300 hidden md:block">Enterprise & Kitchen Desk</p>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 hidden md:block transition-transform ${activeTab === "admin" ? "translate-x-1" : ""}`} />
            </button>
          </div>

          <div className="relative z-10 text-[10px] text-white/50 font-mono tracking-wide leading-relaxed hidden sm:block">
            Authorized portal security. All sessions logged and secured via SSL signature standards.
          </div>
        </div>

        {/* Right Side: Specific Form rendering */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white relative">
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 font-mono">DUAL SHIELD ACTIVE</span>
            <button
              onClick={onCancel}
              className="text-xs font-bold text-[#8B1A1A] hover:text-[#FF6B35] transition-colors"
            >
              ✕ Exit Portal
            </button>
          </div>

          {/* Form dynamic box */}
          <div className="my-auto py-2">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-3 mb-4 font-medium leading-relaxed space-y-2">
                <div>⚠️ {errorMessage}</div>
                {errorMessage.includes("Connection issue") && (
                  <div className="pt-2 border-t border-red-200/50 flex flex-col gap-2">
                    <p className="text-[10px] text-gray-500 font-normal leading-relaxed">
                      If the database server is taking a moment to boot or is unreachable, click below to bypass server auth and log in locally (as the demo account or the credential you entered) right away.
                    </p>
                    <button
                      type="button"
                      onClick={handleOfflineBypassLogin}
                      className="w-full py-2 px-3 bg-[#8B1A1A] hover:bg-[#FF6B35] text-white font-black text-[10px] rounded-lg tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>⚡</span> Bypass Connection Error & Log In Offline
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "customer" && (
              /* ==============================================
                 CUSTOMER PORTAL - DATABASE LOGIN & SIGNUP
                 ============================================== */
              <div className="animate-fadeIn space-y-4">
                <div className="flex bg-[#FFF8F0] p-1 rounded-2xl border border-[#8B1A1A]/10 w-full mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerSubTab("login");
                      setErrorMessage("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl transition-all ${
                      customerSubTab === "login"
                        ? "bg-[#8B1A1A] text-[#FFF8F0] shadow-sm"
                        : "text-gray-500 hover:text-gray-900 bg-transparent"
                    }`}
                  >
                    🔐 Account Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerSubTab("register");
                      setErrorMessage("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl transition-all ${
                      customerSubTab === "register"
                        ? "bg-[#8B1A1A] text-[#FFF8F0] shadow-sm"
                        : "text-gray-500 hover:text-gray-900 bg-transparent"
                    }`}
                  >
                    📝 New Registration
                  </button>
                </div>

                {customerSubTab === "login" ? (
                  <form onSubmit={handleCustomDbLogin} className="space-y-4">
                    <div className="flex items-center gap-1.5 text-[#FF6B35] font-black text-[9px] uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-full w-max">
                      <Sparkles className="w-3.5 h-3.5" />
                      Sign In to Account
                    </div>

                    <h3 className="text-xl font-serif italic text-[#8B1A1A] font-bold tracking-tight">
                      Welcome Back to FoodieNepal
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Enter your unique registered username and security password to access your foodie dashboard. Standard username for demo: <code className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-xxs font-mono font-bold">jenish</code> with password <code className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-xxs font-mono font-bold">password123</code>.
                    </p>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                          Unique Username or Gmail Address
                        </label>
                        <div className="relative flex items-center">
                          <User className="absolute left-3.5 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={dbUsername}
                            onChange={(e) => setDbUsername(e.target.value)}
                            placeholder="e.g. Jenish_NP"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] text-gray-950 font-medium"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setForgotErrorMsg("");
                              setForgotSuccessMsg("");
                              setForgotEmail("");
                              setForgotDob("");
                              setForgotFavoritePet("");
                              setForgotNewPassword("");
                              setForgotSandboxLink("");
                              setForgotStep(1);
                              setShowForgotModal(true);
                            }}
                            className="text-[10px] font-black text-[#FF6B35] hover:text-[#8B1A1A] tracking-wide transition-colors focus:outline-none cursor-pointer"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative flex items-center">
                          <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                          <input
                            type={showDbPassword ? "text" : "password"}
                            value={dbPassword}
                            onChange={(e) => setDbPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] text-gray-950 font-medium"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowDbPassword(!showDbPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1A1A] transition-colors focus:outline-none cursor-pointer"
                            title={showDbPassword ? "Hide password" : "Show password"}
                          >
                            {showDbPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={userLoading}
                      className="w-full py-3 bg-[#FF6B35] hover:bg-[#8B1A1A] text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#FF6B35]/20 flex items-center justify-center gap-2"
                    >
                      {userLoading ? "Verifying Credentials..." : "Access Account"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCustomDbRegister} className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[#2D6A4F] font-black text-[9px] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full w-max">
                      <Shield className="w-3.5 h-3.5" />
                      Database Customer Registration
                    </div>

                    <h3 className="text-xl font-serif italic text-[#2D6A4F] font-bold tracking-tight">
                      Create Your Foodie Account
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Complete your local profile details below. All fields are required by security policies to provide premium services across Nepal.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-mono mb-1 font-mono">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="e.g. Jenish Sapkota"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-gray-950 font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-mono mb-1 font-mono">
                          Unique Username *
                        </label>
                        <input
                          type="text"
                          value={regUsername}
                          onChange={(e) => {
                            setRegUsername(e.target.value);
                            checkRegUsername(e.target.value);
                          }}
                          placeholder="e.g. Jenish_NP"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-gray-950 font-mono"
                          required
                        />
                        {regCheckingUsername && (
                          <div className="text-[8px] text-[#2D6A4F] animate-pulse font-mono mt-0.5">
                            Verifying uniqueness...
                          </div>
                        )}
                        {regUsernameError && (
                          <div className="text-[8px] text-red-650 font-mono mt-0.5 leading-tight">
                            {regUsernameError}
                          </div>
                        )}
                        {regUsernameSuccess && regUsername && (
                          <div className="text-[8px] text-[#2D6A4F] font-bold mt-0.5 flex items-center gap-0.5">
                            ✓ Unique, safe handle!
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-mono mb-1 font-mono">
                          Password *
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showRegPassword ? "text" : "password"}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-gray-950 font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D6A4F] transition-colors focus:outline-none cursor-pointer"
                            title={showRegPassword ? "Hide password" : "Show password"}
                          >
                            {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-lg p-3 space-y-1.5 flex flex-col justify-center">
                        <span className="text-[9px] font-black text-[#2D6A4F] uppercase tracking-wider block font-mono">
                          🔑 Unique Security Shield
                        </span>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px] font-bold font-mono">
                          <div className={regPasswordMinLength ? "text-[#2D6A4F]" : "text-gray-400"}>
                            {regPasswordMinLength ? "✓" : "○"} 8+ Characters
                          </div>
                          <div className={regPasswordUppercase ? "text-[#2D6A4F]" : "text-gray-400"}>
                            {regPasswordUppercase ? "✓" : "○"} Upper [A-Z]
                          </div>
                          <div className={regPasswordLowercase ? "text-[#2D6A4F]" : "text-gray-400"}>
                            {regPasswordLowercase ? "✓" : "○"} Lower [a-z]
                          </div>
                          <div className={regPasswordDigit ? "text-[#2D6A4F]" : "text-gray-400"}>
                            {regPasswordDigit ? "✓" : "○"} Digit [0-9]
                          </div>
                          <div className={`col-span-2 ${regPasswordSpecial ? "text-[#2D6A4F]" : "text-gray-400"}`}>
                            {regPasswordSpecial ? "✓" : "○"} Special Char (!@#$%&*?)
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-mono mb-1 font-mono">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="e.g. 98********"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-gray-950 font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-mono mb-1 font-mono">
                          Gmail Address *
                        </label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="e.g. j******@gmail.com"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-gray-950 font-mono"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-mono mb-1 font-mono">
                          Permanent Address *
                        </label>
                        <input
                          type="text"
                          value={regAddress}
                          onChange={(e) => setRegAddress(e.target.value)}
                          placeholder="e.g. Ward 4, Basantapur, Kathmandu, Nepal"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-gray-950 font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-[#2D6A4F] uppercase tracking-mono mb-1 font-mono">
                          Date of Birth * (For Password Recovery)
                        </label>
                        <input
                          type="date"
                          value={regDob}
                          onChange={(e) => setRegDob(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-gray-950 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-[#2D6A4F] uppercase tracking-mono mb-1 font-mono">
                          Favourite Pet * (For Password Recovery)
                        </label>
                        <input
                          type="text"
                          value={regFavoritePet}
                          onChange={(e) => setRegFavoritePet(e.target.value)}
                          placeholder="e.g. Dog, Cat, Parrot"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] text-gray-950 font-medium"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={userLoading || !!regUsernameError || regCheckingUsername}
                      className={`w-full py-2.5 text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                        !!regUsernameError || regCheckingUsername
                          ? "bg-gray-300 shadow-none cursor-not-allowed text-gray-500"
                          : "bg-[#2D6A4F] hover:bg-[#1B4332]"
                      }`}
                    >
                      {userLoading ? "Registering & Logging In..." : "Complete Registration"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeTab === "rider" && (
              /* ==============================================
                 RIDER GPS PORTAL
                 ============================================== */
              <div className="animate-fadeIn">
                <div className="flex items-center gap-2 text-blue-600 font-black text-xxs uppercase tracking-wider mb-2 bg-blue-50 px-2.5 py-1 rounded-full w-max">
                  <Bike className="w-3.5 h-3.5 text-blue-500" />
                  Rider GPS Dispatch Node
                </div>
                
                <h3 className="text-2xl font-serif italic text-blue-900 font-bold tracking-tight mb-2">
                  Courier Dispatch Login
                </h3>
                <p className="text-xs text-gray-500 mb-6 font-medium">
                  Authorizations require correct dedicated dispatch registration rider credentials.
                </p>

                <form onSubmit={handleRiderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                      Rider Courier ID Key
                    </label>
                    <div className="relative flex items-center">
                      <Bike className="absolute left-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type={showRiderUsername ? "text" : "password"}
                        value={riderCode}
                        onChange={(e) => setRiderCode(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 text-gray-950 placeholder-gray-300 font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRiderUsername(!showRiderUsername)}
                        className="absolute right-3.5 text-gray-400 hover:text-gray-650 p-1 rounded-lg focus:outline-none transition-colors"
                        title={showRiderUsername ? "Hide Rider ID" : "Show Rider ID"}
                      >
                        {showRiderUsername ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                      Rider Security Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type={showRiderPassword ? "text" : "password"}
                        value={riderPass}
                        onChange={(e) => setRiderPass(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 text-gray-950 placeholder-gray-300 font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRiderPassword(!showRiderPassword)}
                        className="absolute right-3.5 text-gray-400 hover:text-gray-650 p-1 rounded-lg focus:outline-none transition-colors"
                        title={showRiderPassword ? "Hide Rider Password" : "Show Rider Password"}
                      >
                        {showRiderPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 font-mono"
                  >
                    Authorize Rider Dispatch
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === "admin" && (
              /* ==============================================
                 ADMIN PORTAL - INCORPORATING SYSTEM ADMIN & KITCHEN VENDOR
                 ============================================== */
              <div className="animate-fadeIn">
                {/* Embedded Sub-Segment Switcher */}
                <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-150 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminSubTab("admin");
                      setErrorMessage("");
                    }}
                    className={`flex-1 py-2 text-xxs sm:text-xs font-bold font-mono tracking-wider uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      adminSubTab === "admin"
                        ? "bg-[#8B1A1A] text-[#FFF8F0] shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    System Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminSubTab("kitchen");
                      setErrorMessage("");
                    }}
                    className={`flex-1 py-2 text-xxs sm:text-xs font-bold font-mono tracking-wider uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      adminSubTab === "kitchen"
                        ? "bg-[#FF6B35] text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    Kitchen Partner
                  </button>
                </div>

                {adminSubTab === "admin" ? (
                  /* ==============================================
                     ADMIN SUB-PORTAL
                     ============================================== */
                  <div className="animate-fadeIn">
                    <div className="flex items-center gap-2 text-[#8B1A1A] font-black text-xxs uppercase tracking-wider mb-2 bg-[#8B1A1A]/10 px-2.5 py-1 rounded-full w-max">
                      <Shield className="w-3.5 h-3.5" />
                      Enterprise Root Admin Control
                    </div>

                    <h3 className="text-2xl font-serif italic text-[#8B1A1A] font-bold tracking-tight mb-2">
                      Admin System Login
                    </h3>
                    <p className="text-xs text-gray-500 mb-6 font-medium">
                      Authorizations require correct dedicated security key credentials.
                    </p>

                    <form onSubmit={handleAdminSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                          Admin Username
                        </label>
                        <div className="relative flex items-center">
                          <User className="absolute left-3.5 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter Admin Username"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] text-gray-950 placeholder-gray-300 font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                          Admin Password
                        </label>
                        <div className="relative flex items-center">
                          <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] text-gray-950 placeholder-gray-300 font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 text-gray-400 hover:text-gray-650 p-1 rounded-lg focus:outline-none transition-colors animate-fadeIn"
                            title={showPassword ? "Hide Password" : "Show Password"}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={adminLoading}
                        className="w-full py-3 bg-[#8B1A1A] hover:bg-[#590C0C] text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#8B1A1A]/20 flex items-center justify-center gap-2 font-mono"
                      >
                        {adminLoading ? "Requesting Office Ingress..." : "Authorize Enterprise Room"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ) : (
                  /* ==============================================
                     KITCHEN SUB-PORTAL
                     ============================================== */
                  <div className="animate-fadeIn">
                    <div className="flex items-center gap-2 text-[#FF6B35] font-black text-xxs uppercase tracking-wider mb-2 bg-[#FFF8F0] px-2.5 py-1 rounded-full w-max">
                      <Store className="w-3.5 h-3.5 text-[#FF6B35]" />
                      Momo Kitchen Partner Desk
                    </div>

                    <h3 className="text-2xl font-serif italic text-[#FF6B35] font-bold tracking-tight mb-2">
                      Kitchen Partner Login
                    </h3>
                    <p className="text-xs text-gray-500 mb-6 font-medium">
                      Authorizations require correct dedicated partner merchant security credentials.
                    </p>

                    <form onSubmit={handleVendorSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                          Partner Merchant Code
                        </label>
                        <div className="relative flex items-center">
                          <Store className="absolute left-3.5 w-4 h-4 text-gray-400" />
                          <input
                            type={showVendorCode ? "text" : "password"}
                            value={vendorCode}
                            onChange={(e) => setVendorCode(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] text-gray-950 placeholder-gray-300 font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowVendorCode(!showVendorCode)}
                            className="absolute right-3.5 text-gray-400 hover:text-gray-650 p-1 rounded-lg focus:outline-none transition-colors"
                            title={showVendorCode ? "Hide Merchant Code" : "Show Merchant Code"}
                          >
                            {showVendorCode ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-mono">
                          Partner Merchant Password
                        </label>
                        <div className="relative flex items-center">
                          <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                          <input
                            type={showVendorPass ? "text" : "password"}
                            value={vendorPass}
                            onChange={(e) => setVendorPass(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-150 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] text-gray-950 placeholder-gray-300 font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowVendorPass(!showVendorPass)}
                            className="absolute right-3.5 text-gray-400 hover:text-gray-650 p-1 rounded-lg focus:outline-none transition-colors"
                            title={showVendorPass ? "Hide Merchant Password" : "Show Merchant Password"}
                          >
                            {showVendorPass ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={userLoading}
                        className="w-full py-3 bg-[#FF6B35] hover:bg-[#8B1A1A] text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#FF6B35]/20 flex items-center justify-center gap-2 font-mono"
                      >
                        {userLoading ? "Validating Partner Ingress..." : "Authorize Kitchen Terminal"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer of secure panel */}
          <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1.5 border-t border-gray-100 pt-3">
            <CornerDownRight className="w-3.5 h-3.5 text-gray-300 animate-pulse" />
            <span>Secure encryption active. Device viewport synchronized and certified.</span>
          </div>

        </div>

      </div>

      {/* SECURE PASSWORD RECOVERY SYSTEM MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header branding band */}
            <div className="bg-[#8B1A1A] px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-black uppercase tracking-widest font-mono">
                  Nepal Gatekeeper System
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-white/70 hover:text-white transition-colors focus:outline-none cursor-pointer text-sm font-bold"
              >
                &times; Close
              </button>
            </div>
            {forgotStep !== 3 && (
              <div className="flex bg-gray-50 border-b border-gray-100 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setUseAlternateMethod(false);
                    setForgotErrorMsg("");
                  }}
                  className={`flex-1 py-3 text-center text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    !useAlternateMethod
                      ? "bg-white border-t border-t-[#8B1A1A] border-r border-r-gray-100 text-[#8B1A1A]"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Gmail Link Recovery
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseAlternateMethod(true);
                    setForgotErrorMsg("");
                  }}
                  className={`flex-1 py-3 text-center text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    useAlternateMethod
                      ? "bg-white border-t border-t-[#8B1A1A] border-l border-l-gray-100 text-[#8B1A1A]"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Alternative Challenge
                </button>
              </div>
            )}

            <div className="p-5">
              {/* ANIMATED OPT-IN FLASHING FAILURE BANNER */}
              {forgotErrorMsg && !useAlternateMethod && forgotStep !== 3 && (
                <div 
                  onClick={() => {
                    setUseAlternateMethod(true);
                    setForgotErrorMsg("");
                  }}
                  className="bg-gradient-to-r from-red-600 via-[#FF6B35] to-red-600 text-white text-[11px] p-3 rounded-xl font-bold flex items-center justify-between shadow-lg cursor-pointer animate-pulse hover:scale-[1.02] transition-transform mb-4 border-2 border-amber-300"
                  title="Click to switch to direct bypass recovery challenge"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">💡</span>
                    <div className="text-left">
                      <p className="font-extrabold uppercase tracking-wider text-[10px]">Gmail Authentication Fail?</p>
                      <p className="text-[9px] text-white/95 leading-normal">Click here to use Direct Alternative Method instead!</p>
                    </div>
                  </div>
                  <span className="text-amber-200 text-xs font-black font-mono animate-bounce">&rsaquo;&rsaquo;</span>
                </div>
              )}

              {/* ROUTE A: Standard Gmail & Verification Token Link Method */}
              {!useAlternateMethod && (
                <>
                  {/* Step 1: Account identification */}
                  {forgotStep === 1 && (
                    <form onSubmit={handleForgotStep1Submit} className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-base font-serif italic font-bold text-gray-900">
                          Recover Password
                        </h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          Enter your registered Gmail address below, and we will trigger a unique security reset link via SMTP, plus unlock identity verification.
                        </p>
                      </div>

                      {forgotErrorMsg && (
                        <div className="bg-red-50 border border-red-100 text-red-700 text-[10px] p-2.5 rounded-lg font-bold font-mono">
                          ⚠️ {forgotErrorMsg}
                        </div>
                      )}

                      <div className="bg-[#8B1A1A]/5 border border-[#8B1A1A]/10 rounded-xl p-3 text-xs leading-relaxed text-gray-700 flex gap-2 items-start font-sans">
                        <span className="text-sm">📧</span>
                        <div>
                          <p className="font-bold text-gray-900">Forgot your registered Gmail?</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Our system secures email records with format masking. Example layout is <code className="bg-[#8B1A1A]/10 text-[#8B1A1A] px-1 py-0.2 rounded font-bold font-mono">j********@gmail.com</code>.
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-mono font-mono">
                            Registered Gmail Address *
                          </label>
                          <span className="text-[8px] font-mono font-bold text-[#FF6B35] animate-pulse">
                            e.g. j********@gmail.com
                          </span>
                        </div>
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="e.g. j********@gmail.com"
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] font-mono text-gray-900"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full py-2.5 bg-[#8B1A1A] hover:bg-[#FF6B35] text-white text-xs font-black tracking-widest uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        {forgotLoading ? "Initiating Gateway..." : "Verify & Send Reset Link"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* Step 2: Answer Verification & Reset password */}
                  {forgotStep === 2 && (
                    <form onSubmit={handleForgotStep2Submit} className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-base font-serif italic font-bold text-gray-900 flex items-center gap-1.5">
                          🔒 Identity Challenge
                        </h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          Verify Date of Birth and Favourite Pet Name for <span className="font-mono text-gray-900 font-bold bg-amber-50 px-1 py-0.5 rounded">{forgotEmail}</span> to unlock replacement.
                        </p>
                      </div>

                      {forgotErrorMsg && (
                        <div className="bg-red-50 border border-red-100 text-red-700 text-[10px] p-2.5 rounded-lg font-bold font-mono">
                          ⚠️ {forgotErrorMsg}
                        </div>
                      )}

                      {forgotSuccessMsg && (
                        <div className="bg-emerald-50 border border-emerald-100 text-[#2D6A4F] text-[10px] p-2.5 rounded-lg leading-relaxed font-mono">
                          ✉️ {forgotSuccessMsg}
                        </div>
                      )}

                      {forgotSandboxLink && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[10px] p-3 rounded-lg leading-relaxed font-mono space-y-1">
                          <span className="font-bold uppercase tracking-wider text-amber-900 block text-[9px]">💡 Sandbox Live Reset Link:</span>
                          <a 
                            href={forgotSandboxLink} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="underline text-red-800 break-all hover:text-red-900 block font-bold"
                          >
                            {forgotSandboxLink}
                          </a>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-3">
                        <div>
                          <label className="block text-[9px] font-bold text-[#8B1A1A] uppercase tracking-mono mb-1 font-mono">
                            Date of Birth * (Exactly match registered profile)
                          </label>
                          <input
                            type="date"
                            value={forgotDob}
                            onChange={(e) => setForgotDob(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] font-mono text-gray-900"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-[#8B1A1A] uppercase tracking-mono mb-1 font-mono">
                            Favourite Pet Name * (Case-insensitive)
                          </label>
                          <input
                            type="text"
                            value={forgotFavoritePet}
                            onChange={(e) => setForgotFavoritePet(e.target.value)}
                            placeholder="e.g. Dog, Cat, parrot"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] font-medium text-gray-900"
                            required
                          />
                        </div>

                        <div className="border-t border-gray-100 pt-2">
                          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-mono mb-1 font-mono">
                            New Security Password *
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type={showForgotNewPassword ? "text" : "password"}
                              value={forgotNewPassword}
                              onChange={(e) => setForgotNewPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] text-gray-950 font-mono"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1A1A] transition-colors focus:outline-none cursor-pointer"
                              title={showForgotNewPassword ? "Hide password" : "Show password"}
                            >
                              {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Real-time criteria checker */}
                        <div className="bg-orange-50/50 border border-orange-100/50 rounded-lg p-3 space-y-1.5 flex flex-col justify-center">
                          <span className="text-[9px] font-black text-[#8B1A1A] uppercase tracking-wider block font-mono">
                            🛡️ Target Password Strength Requirements
                          </span>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px] font-bold font-mono">
                            <div className={forgotNewPassword.length >= 8 ? "text-emerald-700" : "text-gray-400"}>
                              {forgotNewPassword.length >= 8 ? "✓" : "○"} 8+ Characters
                            </div>
                            <div className={/[A-Z]/.test(forgotNewPassword) ? "text-emerald-700" : "text-gray-400"}>
                              {/[A-Z]/.test(forgotNewPassword) ? "✓" : "○"} Upper [A-Z]
                            </div>
                            <div className={/[a-z]/.test(forgotNewPassword) ? "text-emerald-700" : "text-gray-400"}>
                              {/[a-z]/.test(forgotNewPassword) ? "✓" : "○"} Lower [a-z]
                            </div>
                            <div className={/[0-9]/.test(forgotNewPassword) ? "text-emerald-700" : "text-gray-400"}>
                              {/[0-9]/.test(forgotNewPassword) ? "✓" : "○"} Digit [0-9]
                            </div>
                            <div className={`col-span-2 ${/[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(forgotNewPassword) ? "text-emerald-700" : "text-gray-400"}`}>
                              {/[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(forgotNewPassword) ? "✓" : "○"} Special Char (!@#$%&*?)
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setForgotStep(1)}
                          className="w-1/3 py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={forgotLoading}
                          className="w-2/3 py-2.5 bg-[#8B1A1A] hover:bg-[#FF6B35] text-white text-xs font-black tracking-widest uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          {forgotLoading ? "Writing Changes..." : "Authorize & Save"}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* ROUTE B: Alternative bypass challenge method (No Gmail needed) */}
              {useAlternateMethod && forgotStep !== 3 && (
                <form onSubmit={handleAlternateRecoverySubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-serif italic font-bold text-gray-900 flex items-center gap-1.5">
                      🔑 Alternative Identity challenge
                    </h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Restore credentials without email SMTP verification. Enter your licensed username, phone, Date of Birth, and registered Favourite Pet response below.
                    </p>
                  </div>

                  {forgotErrorMsg && (
                    <div className="bg-red-50 border border-red-100 text-red-700 text-[10px] p-2.5 rounded-lg font-bold font-mono">
                      ⚠️ {forgotErrorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-mono mb-1 font-mono">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={altUsername}
                        onChange={(e) => setAltUsername(e.target.value)}
                        placeholder="e.g. jenish"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] text-gray-900 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-mono mb-1 font-mono">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={altPhone}
                        onChange={(e) => setAltPhone(e.target.value)}
                        placeholder="e.g. 9841234567"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] text-gray-900 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-mono mb-1 font-mono">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        value={altDob}
                        onChange={(e) => setAltDob(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] text-gray-900 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-mono mb-1 font-mono">
                        Favourite Pet *
                      </label>
                      <input
                        type="text"
                        value={altFavoritePet}
                        onChange={(e) => setAltFavoritePet(e.target.value)}
                        placeholder="e.g. Parrot"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] text-gray-900 font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-mono mb-1 font-mono">
                      New Security Password *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showAltNewPassword ? "text" : "password"}
                        value={altNewPassword}
                        onChange={(e) => setAltNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#8B1A1A] text-gray-950 font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAltNewPassword(!showAltNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1A1A] transition-colors focus:outline-none cursor-pointer"
                        title={showAltNewPassword ? "Hide password" : "Show password"}
                      >
                        {showAltNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Real-time criteria checker */}
                  <div className="bg-orange-50/50 border border-orange-100/50 rounded-lg p-3 space-y-1.5 flex flex-col justify-center">
                    <span className="text-[9px] font-black text-[#8B1A1A] uppercase tracking-wider block font-mono">
                      🛡️ Target Password Strength Requirements
                    </span>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px] font-bold font-mono">
                      <div className={altNewPassword.length >= 8 ? "text-emerald-700" : "text-gray-400"}>
                        {altNewPassword.length >= 8 ? "✓" : "○"} 8+ Characters
                      </div>
                      <div className={/[A-Z]/.test(altNewPassword) ? "text-emerald-700" : "text-gray-400"}>
                        {/[A-Z]/.test(altNewPassword) ? "✓" : "○"} Upper [A-Z]
                      </div>
                      <div className={/[a-z]/.test(altNewPassword) ? "text-emerald-700" : "text-gray-400"}>
                        {/[a-z]/.test(altNewPassword) ? "✓" : "○"} Lower [a-z]
                      </div>
                      <div className={/[0-9]/.test(altNewPassword) ? "text-emerald-700" : "text-gray-400"}>
                        {/[0-9]/.test(altNewPassword) ? "✓" : "○"} Digit [0-9]
                      </div>
                      <div className={`col-span-2 ${/[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(altNewPassword) ? "text-emerald-700" : "text-gray-400"}`}>
                        {/[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(altNewPassword) ? "✓" : "○"} Special Char (!@#$%&*?)
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 bg-[#8B1A1A] hover:bg-[#FF6B35] text-white text-xs font-black tracking-widest uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {forgotLoading ? "Verifying & Saving..." : "Verify Bypass & Reset Password"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Step 3: Success Screen */}
              {forgotStep === 3 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-2xl">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-serif italic font-bold text-gray-900">
                      Profile Re-Secured!
                    </h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed px-4">
                      Your replacement password has been written to the database! You can now access your profile dashboard normally.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setCustomerSubTab("login");
                    }}
                    className="px-6 py-2 bg-[#8B1A1A] hover:bg-[#FF6B35] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                  >
                    Done &bull; Log In Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
