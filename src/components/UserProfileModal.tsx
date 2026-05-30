import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { X, User, Mail, MapPin, Award, PenSquare, Camera, Check, Loader2, Sparkles, Lock, Eye, EyeOff, Shield, UploadCloud } from "lucide-react";
import { User as UserType } from "../types";

interface UserProfileModalProps {
  user: UserType;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserType) => void;
}

// Client-side lightweight image resizing & compression to keep local/GCP payloads optimal
const resizeAndCompressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Target bounds e.g. 150x150 for user avatar
        const maxDimension = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG to make it highly lightweight
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        resolve(compressedBase64);
      };
      img.onerror = (e) => reject(e);
      img.src = event.target?.result as string;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

const PRESET_AVATARS = [
  {
    name: "Momo Master",
    url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=150"
  },
  {
    name: "Spicy Chef",
    url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=150"
  },
  {
    name: "Chiya Lover",
    url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=150"
  },
  {
    name: "Gurung Boy",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150"
  },
  {
    name: "Newari Queen",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  },
  {
    name: "Everest Explorer",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  }
];

export default function UserProfileModal({ user, onClose, onUpdateUser }: UserProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [address, setAddress] = useState(user.address || "Pokhara, Nepal");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [bio, setBio] = useState(user.bio || "Namaste! Foodie from Nepal. Loving standard Himalayan spices!");
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Image Upload / Drag 'n' Drop States
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        await processUploadedFile(file);
      } else {
        setErrorMsg("Invalid file type. Please upload an image file (PNG/JPEG/GIF).");
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processUploadedFile(file);
    }
  };

  const processUploadedFile = async (file: File) => {
    setUploadProgress(true);
    setErrorMsg("");
    try {
      const compressedUrl = await resizeAndCompressImage(file);
      setAvatar(compressedUrl);
      setSuccessMsg("Profile photo uploaded and optimized successfully! Make sure to click 'Save Changes' to update your permanent identity.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to process your image file. Please try another copy.");
    } finally {
      setUploadProgress(false);
    }
  };

  // Change Password Inner States
  const [showPassChanger, setShowPassChanger] = useState(false);
  const [passDob, setPassDob] = useState("");
  const [passPet, setPassPet] = useState("");
  const [passNew, setPassNew] = useState("");
  const [showPassNewToggle, setShowPassNewToggle] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passDob || !passPet.trim() || !passNew) {
      setPassError("Date of Birth, Favourite Pet Answer, and New Password are all strictly required.");
      return;
    }

    // Strong password validations
    const hasMinLength = passNew.length >= 8;
    const hasUppercase = /[A-Z]/.test(passNew);
    const hasLowercase = /[a-z]/.test(passNew);
    const hasDigit = /[0-9]/.test(passNew);
    const hasSpecial = /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passNew);

    if (!(hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSpecial)) {
      setPassError("Security Policy Violation: Password requires 8+ characters, premium upper, lower, numbers, and special symbol.");
      return;
    }

    setPassLoading(true);
    setPassError("");
    setPassSuccess("");

    try {
      const response = await fetch("/api/auth/change-profile-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          dob: passDob,
          favoritePet: passPet.trim(),
          newPassword: passNew
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPassSuccess(data.message);
        setPassDob("");
        setPassPet("");
        setPassNew("");
        // collapse after brief timeout
        setTimeout(() => {
          setShowPassChanger(false);
          setPassSuccess("");
        }, 3000);
      } else {
        setPassError(data.error || "Verification failed: security answers did not match current profile records.");
      }
    } catch (err) {
      setPassError("Network connectivity problem. Please verify database connection.");
    } finally {
      setPassLoading(false);
    }
  };

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameCheckMsg, setUsernameCheckMsg] = useState("");
  const [isNameTaken, setIsNameTaken] = useState(false);

  const performUsernameCheck = async (typedName: string) => {
    const trimmed = typedName.trim();
    if (!trimmed || trimmed.toLowerCase() === (user.name || "").toLowerCase()) {
      setUsernameCheckMsg("");
      setIsNameTaken(false);
      return;
    }
    setCheckingUsername(true);
    setUsernameCheckMsg("");
    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(trimmed)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (!data.unique) {
            setIsNameTaken(true);
            setUsernameCheckMsg(`⚠️ The username "${trimmed}" is already claimed by another food lover. Please choose another handle.`);
          } else {
            setIsNameTaken(false);
            setUsernameCheckMsg(`✓ Username "${trimmed}" is unique & safe to claim!`);
          }
        }
      }
    } catch (e) {
      console.warn("Real-time uniqueness lookup skipped", e);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Full Name cannot be empty.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Email address cannot be empty.");
      return;
    }

    if (isNameTaken) {
      setErrorMsg("Cannot save details: Specified display username is claimed by another user. Please choose a different unique username to proceed.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          address: address.trim(),
          avatar: avatar,
          bio: bio.trim()
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg("Profile updated successfully!");
        onUpdateUser(data.user);
        
        // Also update standard local storage
        localStorage.setItem("foodienepal_google_user", JSON.stringify(data.user));
        localStorage.setItem("foodienepal_customer_address", data.user.address || "Pokhara, Nepal");

        setTimeout(() => {
          setIsEditing(false);
          setSuccessMsg("");
        }, 1200);
      } else {
        setErrorMsg(data.error || "Failed to update profile. Please try again.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMsg("Network error updating profile. Please make sure the server is healthy.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectPresetAvatar = (url: string) => {
    setAvatar(url);
    setShowAvatarSelector(false);
  };

  const handleCustomAvatarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAvatarUrl.trim()) {
      setAvatar(customAvatarUrl.trim());
      setCustomAvatarUrl("");
      setShowAvatarSelector(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay with fade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        id="profile_modal_backdrop"
      />

      {/* Profile Card Container */}
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-lg bg-[#FFF8F0] rounded-3xl overflow-hidden border border-[#8B1A1A]/10 shadow-2xl z-10 font-sans"
        id="profile_modal_container"
      >
        {/* Colorful header band with Steaming Himalayan theme */}
        <div className="bg-gradient-to-r from-[#8B1A1A] to-[#FF6B35] h-28 relative flex items-end px-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 text-white/90 hover:text-white hover:bg-black/40 rounded-full transition-all"
            title="Close Profile"
            id="profile_close_btn"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-white/90">
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-150">FoodieNepal Member Since 2026</span>
          </div>
        </div>

        {/* Profile Avatar overlay */}
        <div className="relative px-6">
          <div className="absolute -top-12 left-6 flex items-end">
            <div className="relative group">
              <img
                src={avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                alt="Profile Avatar"
                className="w-24 h-24 rounded-2xl object-cover border-4 border-[#FFF8F0] shadow-md bg-white select-none"
                referrerPolicy="no-referrer"
                id="profile_avatar_img"
              />
              
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowAvatarSelector(!showAvatarSelector);
                }}
                className="absolute inset-0 bg-black/45 hover:bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white transition-all border border-white/20 cursor-pointer"
                type="button"
                title="Change Avatar"
                id="profile_change_avatar_badge_btn"
              >
                <Camera className="w-5 h-5 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Change Photo</span>
              </button>
            </div>

            {/* Profile Info Summary Banner */}
            <div className="ml-5 mb-1">
              <h2 className="text-xl font-bold text-[#8B1A1A] tracking-tight truncate max-w-[200px]" id="profile_display_name_header">
                {user.name}
              </h2>
              <div className="flex items-center gap-1.5 bg-[#2D6A4F]/10 px-2.5 py-0.5 rounded-full border border-[#2D6A4F]/20 text-[#2D6A4F] text-[10px] font-black w-fit mt-1">
                <Award className="w-3 h-3" />
                <span>{user.foodiePoints} Loyalty Pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Space Spacer for avatar */}
        <div className="h-16" />

        {/* Main Content Pane */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl font-medium" id="profile_error_message">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-semibold bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-bold" id="profile_success_message">
              🎉 {successMsg}
            </div>
          )}

          {/* Avatar preset selector panel drawer */}
          {showAvatarSelector && isEditing && (
            <div className="mb-5 p-4 bg-white rounded-2xl border border-[#8B1A1A]/10 shadow-inner flex flex-col gap-4" id="avatar_select_pane">
              <div>
                <div className="flex justify-between items-center mb-3.5">
                  <span className="text-xs font-bold text-[#8B1A1A] uppercase tracking-wider">Select Nepal Custom Avatar</span>
                  <button 
                    type="button"
                    onClick={() => setShowAvatarSelector(false)} 
                    className="text-gray-400 hover:text-[#8B1A1A] text-xs font-black transition-all"
                  >
                    Cancel
                  </button>
                </div>

                {/* Curated Previews Grid */}
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectPresetAvatar(p.url)}
                      className={`relative rounded-xl overflow-hidden hover:scale-105 duration-200 transition-all border ${avatar === p.url ? "border-[#FF6B35] ring-2 ring-[#FF6B35]/20 scale-105" : "border-gray-200"}`}
                      title={p.name}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-11 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Separator line */}
              <div className="border-t border-gray-100 flex items-center justify-center my-0.5 relative">
                <span className="absolute bg-white px-2.5 text-[8px] text-gray-400 font-bold uppercase tracking-wider">Or Upload Your Own Photo</span>
              </div>

              {/* Drag and Drop Upload Area */}
              <div className="space-y-1">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer relative group text-center min-h-[90px] ${
                    isDragging 
                      ? "border-[#FF6B35] bg-[#FF6B35]/5 scale-[0.98]" 
                      : "border-gray-200 bg-gray-50/50 hover:border-[#8B1A1A]/30 hover:bg-gray-100/50"
                  }`}
                  id="profile_picture_upload_zone"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="profile_picture_file_input"
                  />
                  
                  {uploadProgress ? (
                    <div className="flex flex-col items-center justify-center py-2 animate-pulse">
                      <Loader2 className="w-6 h-6 text-[#FF6B35] animate-spin mb-1.5" />
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-mono">Optimizing image quality...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-[#8B1A1A] transition-colors mb-1.5" />
                      <p className="text-xs font-bold text-gray-700">
                        Drag & Drop profile image
                      </p>
                      <p className="text-[8px] text-gray-400 mt-0.5 font-mono tracking-wide uppercase">
                        Or click to browse from device (PNG, JPEG, GIF)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Or specify custom URL */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Or Paste Direct Image Web Address</span>
                <form onSubmit={handleCustomAvatarSubmit} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/your-image.png"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-[#FFF8F0] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#FF6B35] font-sans"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#8B1A1A] text-white rounded-xl text-xs font-bold hover:bg-[#FF6B35] transition"
                  >
                    Apply Address
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Form wrapper */}
          {!isEditing ? (
            /* VIEW RESUME MODE */
            <div className="space-y-4" id="view_profile_pane">
              {/* Bio block */}
              <div className="bg-white p-4 rounded-2xl border border-[#8B1A1A]/5 shadow-xs">
                <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-wider block mb-1">My Bio</span>
                <p className="text-xs text-gray-700 leading-relaxed italic pr-2 font-sans" id="profile_display_bio">
                  "{bio || "No custom bio yet."}"
                </p>
              </div>

              {/* Context list */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-[#8B1A1A]/5">
                  <User className="w-4 h-4 text-[#8B1A1A] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] text-[#FF6B35] font-bold tracking-wider block uppercase">Full Name</span>
                    <span className="text-xs font-semibold text-gray-800 block truncate" id="profile_display_name">{user.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-[#8B1A1A]/5">
                  <Mail className="w-4 h-4 text-[#8B1A1A] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] text-[#FF6B35] font-bold tracking-wider block uppercase">Verified Email</span>
                    <span className="text-xs font-semibold text-gray-800 block truncate" id="profile_display_email">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-[#8B1A1A]/5">
                  <MapPin className="w-4 h-4 text-[#8B1A1A] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] text-[#FF6B35] font-bold tracking-wider block uppercase">Delivery / Drop Address</span>
                    <span className="text-xs font-semibold text-gray-800 block truncate" id="profile_display_address">
                      {address || "No active address configured"}
                    </span>
                  </div>
                </div>
              </div>

              {/* CHANGE PASSWORD CHALLENGE DRAWER */}
              <div className="mt-4 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPassChanger(!showPassChanger);
                    setPassError("");
                    setPassSuccess("");
                  }}
                  className="w-full flex items-center justify-between py-2 text-xs font-black text-[#8B1A1A] hover:text-[#FF6B35] transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-mono tracking-wider uppercase">
                    🔒 Change My Password
                  </span>
                  <span className="text-[10px] bg-[#8B1A1A]/10 px-2 py-0.5 rounded-full font-bold font-mono">
                    {showPassChanger ? "Hide Form" : "Expand Form"}
                  </span>
                </button>

                {showPassChanger && (
                  <form onSubmit={handleChangePasswordSubmit} className="mt-3 bg-white p-4 rounded-2xl border border-[#8B1A1A]/5 space-y-3 animate-in slide-in-from-top-2 duration-150">
                    <span className="text-[10px] text-gray-500 leading-relaxed block mb-1">
                      Provide your security challenge answers below to unlock profile password reset.
                    </span>

                    {passError && (
                      <div className="bg-red-50 border border-red-100 text-red-700 text-[10px] p-2.5 rounded-lg font-bold font-mono">
                        ⚠️ {passError}
                      </div>
                    )}

                    {passSuccess && (
                      <div className="bg-emerald-50 border border-emerald-100 text-[#2D6A4F] text-[10px] p-2.5 rounded-lg font-bold font-mono">
                        ✓ {passSuccess}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-mono mb-1 font-mono">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          value={passDob}
                          onChange={(e) => setPassDob(e.target.value)}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none font-mono text-gray-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-mono mb-1 font-mono">
                          Favourite Pet *
                        </label>
                        <input
                          type="text"
                          value={passPet}
                          onChange={(e) => setPassPet(e.target.value)}
                          placeholder="e.g. Dog"
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none font-medium text-gray-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="text-left font-sans">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-mono mb-1 font-mono">
                        New Security Password *
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showPassNewToggle ? "text" : "password"}
                          value={passNew}
                          onChange={(e) => setPassNew(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-2 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none font-mono text-gray-950"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassNewToggle(!showPassNewToggle)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1A1A] transition-colors focus:outline-none cursor-pointer"
                        >
                          {showPassNewToggle ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Criteria checks for new password */}
                    <div className="bg-orange-50/50 border border-orange-100/50 rounded-lg p-2.5 space-y-1 flex flex-col justify-center text-left">
                      <span className="text-[8px] font-black text-[#8B1A1A] uppercase tracking-wider block font-mono">
                        🛡️ Password Requirements
                      </span>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[7px] font-bold font-mono">
                        <div className={passNew.length >= 8 ? "text-emerald-700" : "text-gray-400"}>
                          {passNew.length >= 8 ? "✓" : "○"} 8+ chars
                        </div>
                        <div className={/[A-Z]/.test(passNew) ? "text-emerald-700" : "text-gray-400"}>
                          {/[A-Z]/.test(passNew) ? "✓" : "○"} Upper [A-Z]
                        </div>
                        <div className={/[a-z]/.test(passNew) ? "text-emerald-700" : "text-gray-400"}>
                          {/[a-z]/.test(passNew) ? "✓" : "○"} Lower [a-z]
                        </div>
                        <div className={/[0-9]/.test(passNew) ? "text-emerald-700" : "text-gray-400"}>
                          {/[0-9]/.test(passNew) ? "✓" : "○"} Digit [0-9]
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={passLoading}
                      className="w-full py-2 bg-[#8B1A1A] hover:bg-[#FF6B35] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1 bg-opacity-95"
                    >
                      {passLoading ? "Validating QA Answers..." : "Verify & Update Password"}
                    </button>
                  </form>
                )}
              </div>

              {/* Edit Activation button */}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-[#8B1A1A] hover:bg-[#FF6B35] text-white font-bold text-xs rounded-2xl transition-all shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                id="profile_edit_btn"
              >
                <PenSquare className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          ) : (
            /* MUTATION EDIT MODE */
            <form onSubmit={handleSave} className="space-y-4" id="edit_profile_pane">
              {/* Full name input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B1A1A] uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B1A1A]/40" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      performUsernameCheck(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#FF6B35] font-sans"
                    placeholder="E.g. Jenish Sapkota"
                    id="profile_edit_name_input"
                  />
                </div>
                {checkingUsername && (
                  <div className="text-[9px] text-[#2D6A4F] font-mono animate-pulse pl-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] animate-ping" />
                    Checking display handle uniqueness...
                  </div>
                )}
                {usernameCheckMsg && (
                  <div className={`p-1.5 text-[9px] font-bold rounded-lg ${isNameTaken ? "bg-red-50 text-red-800 border border-red-150 animate-pulse mt-0.5" : "bg-emerald-50 text-emerald-800 border border-emerald-150 mt-0.5"}`}>
                    {usernameCheckMsg}
                  </div>
                )}
              </div>

              {/* Email input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B1A1A] uppercase tracking-wider block">Email Address (Readonly)</label>
                <div className="relative opacity-65">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B1A1A]/40" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none font-sans cursor-not-allowed"
                    id="profile_edit_email_input"
                  />
                </div>
              </div>

              {/* Bio details */}
              <div className="space-y-1 font-sans">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] font-bold text-[#8B1A1A] uppercase tracking-wider block">Foodie Bio</label>
                  <span className="text-[9px] font-mono text-gray-400">{bio.length}/120 chars</span>
                </div>
                <textarea
                  maxLength={120}
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#FF6B35] resize-none font-sans"
                  placeholder="Share your favorite cuisines or spice preferences..."
                  id="profile_edit_bio_input"
                />
              </div>

              {/* Active Delivery address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8B1A1A] uppercase tracking-wider block">Primary Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B1A1A]/40" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#FF6B35] font-sans"
                    placeholder="E.g. Lakeside Ward 6, Pokhara"
                    id="profile_edit_address_input"
                  />
                </div>
              </div>

              {/* Action operations buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name);
                    setAddress(user.address || "Pokhara, Nepal");
                    setAvatar(user.avatar || "");
                    setBio(user.bio || "Namaste! Foodie from Nepal. Loving standard Himalayan spices!");
                    setErrorMsg("");
                  }}
                  className="w-1/3 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-2xl transition"
                  id="profile_edit_cancel_btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-[#FF6B35] hover:bg-[#8B1A1A] text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  id="profile_edit_save_btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
