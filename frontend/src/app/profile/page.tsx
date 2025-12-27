"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Mail,
    Settings,
    BookOpen,
    Calendar,
    Loader2,
    Save,
    Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/providers/auth-provider";
import { api, SubscriberProfile } from "@/lib/api";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { toast } from "sonner";

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [profile, setProfile] = useState<SubscriberProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [displayName, setDisplayName] = useState("");
    const [timezone, setTimezone] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [preferredFormat, setPreferredFormat] = useState("");
    const [pace, setPace] = useState("");

    // Change Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        async function fetchProfile() {
            if (!user) return;

            try {
                const response = await api.getSubscriberProfiles({ limit: 1 });
                const userProfile = response.docs.find(
                    (p) => typeof p.user === "string" ? p.user === user.id : p.user.id === user.id
                );
                if (userProfile) {
                    setProfile(userProfile);
                    setDisplayName(userProfile.displayName || "");
                    setTimezone(userProfile.metadata?.timezone || "");
                    setIsAnonymous(userProfile.isAnonymous || false);
                    setPreferredFormat(userProfile.learningPreferences?.preferredFormat || "");
                    setPace(userProfile.learningPreferences?.pace || "");
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (user) {
            fetchProfile();
        }
    }, [user]);

    const handleSave = async () => {
        if (!profile) return;

        setIsSaving(true);
        try {
            await api.updateSubscriberProfile(profile.id, {
                displayName,
                isAnonymous,
                metadata: {
                    ...profile.metadata,
                    timezone,
                },
                learningPreferences: {
                    preferredFormat: preferredFormat as "video" | "text" | "audio" | "interactive" | undefined,
                    pace: pace as "self-paced" | "scheduled" | "intensive" | undefined,
                },
            });
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!user) return;

        if (newPassword !== confirmNewPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsChangingPassword(true);
        try {
            // Verify current password first by attempting to login
            await api.login(user.email, currentPassword);

            // If login succeeds, update the user with the new password
            await api.updateUser(user.id, { password: newPassword });

            toast.success("Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (error) {
            toast.error("Incorrect current password or update failed");
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-2xl font-semibold">
                        {(profile?.displayName || user.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <h1 className="text-2xl font-bold">
                        {profile?.displayName || user.email.split("@")[0]}
                    </h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <Badge variant="outline" className="mt-2 capitalize">
                        {user.role}
                    </Badge>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="learning" className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        Learning
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Lock className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your public profile information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your display name"
                                    className="max-w-md"
                                />
                                <p className="text-xs text-muted-foreground">
                                    This is how your name will appear in comments and community
                                    features.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="flex items-center gap-2 max-w-md">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between max-w-md">
                                <div className="space-y-0.5">
                                    <Label htmlFor="anonymous">Anonymous Mode</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Hide your identity in community features
                                    </p>
                                </div>
                                <Switch
                                    id="anonymous"
                                    checked={isAnonymous}
                                    onCheckedChange={setIsAnonymous}
                                />
                            </div>

                            <Button onClick={handleSave} disabled={isSaving} className="cursor-pointer">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Learning Tab */}
                <TabsContent value="learning">
                    <Card>
                        <CardHeader>
                            <CardTitle>Learning Preferences</CardTitle>
                            <CardDescription>
                                Customize your learning experience
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="format">Preferred Format</Label>
                                <Select value={preferredFormat} onValueChange={setPreferredFormat}>
                                    <SelectTrigger className="max-w-md">
                                        <SelectValue placeholder="Select your preferred format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="audio">Audio</SelectItem>
                                        <SelectItem value="interactive">Interactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pace">Learning Pace</Label>
                                <Select value={pace} onValueChange={setPace}>
                                    <SelectTrigger className="max-w-md">
                                        <SelectValue placeholder="Select your learning pace" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="self-paced">Self-paced</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="intensive">Intensive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={handleSave} disabled={isSaving} className="cursor-pointer">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Preferences
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                            <CardDescription>
                                Manage your account preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <TimezoneSelect
                                    value={timezone}
                                    onValueChange={setTimezone}
                                    placeholder="Select your timezone"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Used for scheduling and notifications
                                </p>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="text-sm font-medium mb-2">Account Created</h4>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>

                            <Button onClick={handleSave} disabled={isSaving} className="cursor-pointer">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Settings
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    {/* Change Password Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Security
                            </CardTitle>
                            <CardDescription>
                                Update your password
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="max-w-md"
                                />
                            </div>

                            <Separator className="max-w-md" />

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="max-w-md"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Must be at least 8 characters
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmNewPassword"
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="max-w-md"
                                />
                            </div>

                            <Button
                                onClick={handleChangePassword}
                                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword}
                                className="cursor-pointer"
                            >
                                {isChangingPassword ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Password"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
