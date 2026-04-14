import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, Lock, User, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();

  // Fetch email preferences
  const { data: emailPrefs } = user ? trpc.preferences.getEmailPreferences.useQuery() : { data: null };

  // Update preferences mutation
  const updatePrefs = trpc.preferences.updateEmailPreferences.useMutation({
    onSuccess: () => {
      toast.success("Preferences updated successfully");
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  });

  const [preferences, setPreferences] = useState({
    auctionEndingSoon: emailPrefs?.auctionEndingSoon ?? true,
    outbidAlerts: emailPrefs?.outbidAlerts ?? true,
    newMatchingAuctions: emailPrefs?.newMatchingAuctions ?? true,
    weeklyDigest: emailPrefs?.weeklyDigest ?? false,
  });

  const handleToggle = (key: keyof typeof preferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    updatePrefs.mutate(newPrefs);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Please sign in to access settings</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600">Manage your account and notification preferences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Account Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-900">Account</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Full Name
              </label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-600">
                {user.name || "Not set"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Email Address
              </label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-600">
                {user.email || "Not set"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Account Type
              </label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-600 capitalize">
                {user.role}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Member Since
              </label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </Card>

        {/* Email Notifications */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-900">Email Notifications</h2>
          </div>

          <div className="space-y-4">
            {/* Auction Ending Soon */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h3 className="font-medium text-slate-900">Auction Ending Soon</h3>
                <p className="text-sm text-slate-600">
                  Get notified when watched auctions are ending within 24 hours
                </p>
              </div>
              <Switch
                checked={preferences.auctionEndingSoon}
                onCheckedChange={() => handleToggle("auctionEndingSoon")}
              />
            </div>

            {/* Outbid Alerts */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h3 className="font-medium text-slate-900">Outbid Alerts</h3>
                <p className="text-sm text-slate-600">
                  Get notified when you are outbid on an auction
                </p>
              </div>
              <Switch
                checked={preferences.outbidAlerts}
                onCheckedChange={() => handleToggle("outbidAlerts")}
              />
            </div>

            {/* New Matching Auctions */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h3 className="font-medium text-slate-900">New Matching Auctions</h3>
                <p className="text-sm text-slate-600">
                  Get notified when new auctions matching your interests are added
                </p>
              </div>
              <Switch
                checked={preferences.newMatchingAuctions}
                onCheckedChange={() => handleToggle("newMatchingAuctions")}
              />
            </div>

            {/* Weekly Digest */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h3 className="font-medium text-slate-900">Weekly Digest</h3>
                <p className="text-sm text-slate-600">
                  Receive a weekly summary of top auctions and recommendations
                </p>
              </div>
              <Switch
                checked={preferences.weeklyDigest}
                onCheckedChange={() => handleToggle("weeklyDigest")}
              />
            </div>
          </div>
        </Card>

        {/* In-App Notifications */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-900">In-App Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h3 className="font-medium text-slate-900">Browser Notifications</h3>
                <p className="text-sm text-slate-600">
                  Allow CivicBid to send browser notifications
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h3 className="font-medium text-slate-900">Sound Alerts</h3>
                <p className="text-sm text-slate-600">
                  Play a sound when you receive important alerts
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-900">Security</h2>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
              <div className="text-left">
                <h3 className="font-medium text-slate-900">Change Password</h3>
                <p className="text-sm text-slate-600">Update your password regularly</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
              <div className="text-left">
                <h3 className="font-medium text-slate-900">Two-Factor Authentication</h3>
                <p className="text-sm text-slate-600">Add an extra layer of security</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
              <div className="text-left">
                <h3 className="font-medium text-slate-900">Active Sessions</h3>
                <p className="text-sm text-slate-600">Manage your active login sessions</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold text-red-900 mb-4">Danger Zone</h2>
          <div className="space-y-3">
            <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-100">
              Delete Account
            </Button>
            <p className="text-sm text-red-700">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
