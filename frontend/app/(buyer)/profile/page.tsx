"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, User, Mail, Phone, Lock, LogOut } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";
import { AuthRequiredGuard } from "@/app/utils/RoleGuard";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  mobile: string;
  account_type: "buyer" | "seller";
  profile_picture?: string;
  created_at: string;
}

export default function ProfilePage() {
  return (
    <AuthRequiredGuard>
      <ProfileContent />
    </AuthRequiredGuard>
  );
}

function ProfileContent() {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateUser, logout } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.get<UserProfile>("/api/users/profile");
      setProfile(data);
      setFullName(data.full_name);
      setMobile(data.mobile);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updated = await api.put<UserProfile>("/api/users/profile", {
        full_name: fullName,
        mobile: mobile,
      });
      setProfile(updated);
      updateUser({
        ...user!,
        full_name: updated.full_name,
        mobile: updated.mobile,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("Password must contain at least one number");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      setSaving(true);
      await api.put("/api/users/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await api.postFormData<{ url: string }>("/api/users/profile-picture", formData);
      
      setProfile((prev) => prev ? { ...prev, profile_picture: response.url } : null);
      updateUser({
        ...user!,
        profile_picture: response.url,
      });
      toast.success("Profile picture updated");
    } catch (error) {
      toast.error("Failed to upload profile picture");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card>
          <div className="flex items-center gap-6 mb-8">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <Card className="mb-6">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#F3F4F6] border-2 border-[#E5E7EB]">
              {profile.profile_picture ? (
                <Image
                  src={profile.profile_picture}
                  alt={profile.full_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-[#9CA3AF]" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-[#1a1a1a] transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">{profile.full_name}</h2>
            <p className="text-[#6B7280]">{profile.email}</p>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Member since {formatDate(profile.created_at)}
            </p>
          </div>
        </div>

        {/* Profile Form */}
        {isEditing ? (
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            />
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setFullName(profile.full_name);
                  setMobile(profile.mobile);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} isLoading={saving}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg">
              <Mail className="w-5 h-5 text-[#6B7280]" />
              <div>
                <p className="text-sm text-[#6B7280]">Email</p>
                <p className="font-medium text-[#111827]">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg">
              <Phone className="w-5 h-5 text-[#6B7280]" />
              <div>
                <p className="text-sm text-[#6B7280]">Mobile</p>
                <p className="font-medium text-[#111827]">{profile.mobile}</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          </div>
        )}
      </Card>

      {/* Change Password */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-[#6B7280]" />
          <h3 className="font-semibold text-[#111827]">Password</h3>
        </div>

        {showPasswordForm ? (
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Min 8 chars, 1 uppercase, 1 number"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={passwordError}
            />
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleChangePassword} isLoading={saving}>
                Change Password
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setShowPasswordForm(true)}>
            Change Password
          </Button>
        )}
      </Card>

      {/* Logout */}
      <Card>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-[#EF4444] hover:text-[#DC2626] transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </Card>
    </div>
  );
}
