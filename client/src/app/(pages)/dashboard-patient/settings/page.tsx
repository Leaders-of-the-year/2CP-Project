"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  Moon,
  Sun,
  Lock,
  Eye,
  UserCircle,
  Smartphone,
  Mail,
  Shield,
  Save,
  Upload,
  Trash2,
  AlertCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account")
  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=128&width=128")

  // Form states
  const [accountForm, setAccountForm] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    language: "english",
    timezone: "utc-8",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    appointments: true,
    reminders: true,
    messages: true,
    newsletters: false,
    marketing: false,
    sms: true,
    email: true,
    push: false,
  })

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "doctors",
    shareData: false,
    anonymousAnalytics: true,
    twoFactorAuth: false,
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    fontSize: "medium",
    reducedMotion: false,
    highContrast: false,
  })

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAccountForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setAccountForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationToggle = (name: string) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: !prev[name as keyof typeof prev] }))
  }

  const handlePrivacyChange = (name: string, value: any) => {
    setPrivacySettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleAppearanceChange = (name: string, value: any) => {
    setAppearanceSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    })
  }

  const handleImageUpload = () => {
    // This would typically trigger a file input, but for this demo we'll just simulate a change
    // In a real implementation, you would handle the file upload here
    toast({
      title: "Profile picture updated",
      description: "Your profile picture has been updated successfully.",
    })
  }

  const handleDeleteAccount = () => {
    toast({
      variant: "destructive",
      title: "Account deletion requested",
      description: "This would typically send a confirmation email before deletion.",
    })
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account preferences and settings</p>
        </div>
        <Button onClick={handleSaveSettings} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <TabsList className="flex flex-col h-auto bg-white shadow-sm rounded-lg p-2 w-full">
              <TabsTrigger
                value="account"
                className="justify-start py-3 px-4 mb-1 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
              >
                <UserCircle className="mr-2 h-5 w-5" />
                Account
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="justify-start py-3 px-4 mb-1 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
              >
                <Bell className="mr-2 h-5 w-5" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="justify-start py-3 px-4 mb-1 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
              >
                <Lock className="mr-2 h-5 w-5" />
                Privacy & Security
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="justify-start py-3 px-4 mb-1 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
              >
                <Eye className="mr-2 h-5 w-5" />
                Appearance
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="col-span-12 md:col-span-9">
            <TabsContent value="account" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your account details and personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6 border-b">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100">
                        <Image
                          src={profileImage || "/placeholder.svg"}
                          alt="Profile"
                          width={128}
                          height={128}
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-4 flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="w-full" onClick={handleImageUpload}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={accountForm.firstName}
                            onChange={handleAccountChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={accountForm.lastName}
                            onChange={handleAccountChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={accountForm.email}
                            onChange={handleAccountChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" name="phone" value={accountForm.phone} onChange={handleAccountChange} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-lg font-medium">Preferences</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={accountForm.language}
                          onValueChange={(value) => handleSelectChange("language", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="chinese">Chinese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Time Zone</Label>
                        <Select
                          value={accountForm.timezone}
                          onValueChange={(value) => handleSelectChange("timezone", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utc-12">UTC-12:00</SelectItem>
                            <SelectItem value="utc-8">UTC-08:00 (Pacific Time)</SelectItem>
                            <SelectItem value="utc-5">UTC-05:00 (Eastern Time)</SelectItem>
                            <SelectItem value="utc">UTC+00:00 (GMT)</SelectItem>
                            <SelectItem value="utc+1">UTC+01:00 (Central European Time)</SelectItem>
                            <SelectItem value="utc+8">UTC+08:00 (China Standard Time)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Delete Account</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>Once you delete your account, there is no going back. Please be certain.</p>
                          </div>
                          <div className="mt-4">
                            <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what notifications you receive and how</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Types</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Appointment Reminders</Label>
                          <p className="text-sm text-gray-500">Receive notifications about upcoming appointments</p>
                        </div>
                        <Switch
                          checked={notificationSettings.appointments}
                          onCheckedChange={() => handleNotificationToggle("appointments")}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Medication Reminders</Label>
                          <p className="text-sm text-gray-500">Receive reminders to take your medication</p>
                        </div>
                        <Switch
                          checked={notificationSettings.reminders}
                          onCheckedChange={() => handleNotificationToggle("reminders")}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Messages</Label>
                          <p className="text-sm text-gray-500">Receive notifications when you get new messages</p>
                        </div>
                        <Switch
                          checked={notificationSettings.messages}
                          onCheckedChange={() => handleNotificationToggle("messages")}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Health Tips & Newsletters</Label>
                          <p className="text-sm text-gray-500">Receive health tips and newsletters</p>
                        </div>
                        <Switch
                          checked={notificationSettings.newsletters}
                          onCheckedChange={() => handleNotificationToggle("newsletters")}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Marketing Communications</Label>
                          <p className="text-sm text-gray-500">Receive marketing and promotional materials</p>
                        </div>
                        <Switch
                          checked={notificationSettings.marketing}
                          onCheckedChange={() => handleNotificationToggle("marketing")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Notification Channels</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Smartphone className="h-5 w-5 text-gray-500" />
                          <Label className="text-base">SMS Notifications</Label>
                        </div>
                        <Switch
                          checked={notificationSettings.sms}
                          onCheckedChange={() => handleNotificationToggle("sms")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <Label className="text-base">Email Notifications</Label>
                        </div>
                        <Switch
                          checked={notificationSettings.email}
                          onCheckedChange={() => handleNotificationToggle("email")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bell className="h-5 w-5 text-gray-500" />
                          <Label className="text-base">Push Notifications</Label>
                        </div>
                        <Switch
                          checked={notificationSettings.push}
                          onCheckedChange={() => handleNotificationToggle("push")}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>Manage your privacy settings and security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Privacy Settings</h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="profileVisibility">Profile Visibility</Label>
                        <Select
                          value={privacySettings.profileVisibility}
                          onValueChange={(value) => handlePrivacyChange("profileVisibility", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Who can see your profile" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="doctors">Only My Doctors</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Share Medical Data with Doctors</Label>
                          <p className="text-sm text-gray-500">Allow your doctors to access your medical records</p>
                        </div>
                        <Switch
                          checked={privacySettings.shareData}
                          onCheckedChange={(checked) => handlePrivacyChange("shareData", checked)}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Anonymous Analytics</Label>
                          <p className="text-sm text-gray-500">Allow anonymous usage data to improve our services</p>
                        </div>
                        <Switch
                          checked={privacySettings.anonymousAnalytics}
                          onCheckedChange={(checked) => handlePrivacyChange("anonymousAnalytics", checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Security</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Two-Factor Authentication</Label>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <Switch
                          checked={privacySettings.twoFactorAuth}
                          onCheckedChange={(checked) => handlePrivacyChange("twoFactorAuth", checked)}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="changePassword">Change Password</Label>
                        <div className="grid grid-cols-1 gap-4">
                          <Input id="currentPassword" type="password" placeholder="Current password" />
                          <Input id="newPassword" type="password" placeholder="New password" />
                          <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                          <Button className="w-full sm:w-auto">
                            <Shield className="mr-2 h-4 w-4" />
                            Update Password
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Sessions</h3>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-gray-500">Chrome on Windows • IP: 192.168.1.1</p>
                          </div>
                          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</div>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full sm:w-auto">
                      Sign Out of All Devices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how the application looks and feels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Theme</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div
                        className={`border rounded-lg p-4 cursor-pointer ${
                          appearanceSettings.theme === "light" ? "border-teal-500 bg-teal-50" : "border-gray-200"
                        }`}
                        onClick={() => handleAppearanceChange("theme", "light")}
                      >
                        <div className="flex justify-center mb-3">
                          <Sun className="h-8 w-8 text-amber-500" />
                        </div>
                        <p className="text-center font-medium">Light</p>
                      </div>

                      <div
                        className={`border rounded-lg p-4 cursor-pointer ${
                          appearanceSettings.theme === "dark" ? "border-teal-500 bg-teal-50" : "border-gray-200"
                        }`}
                        onClick={() => handleAppearanceChange("theme", "dark")}
                      >
                        <div className="flex justify-center mb-3">
                          <Moon className="h-8 w-8 text-indigo-500" />
                        </div>
                        <p className="text-center font-medium">Dark</p>
                      </div>

                      <div
                        className={`border rounded-lg p-4 cursor-pointer ${
                          appearanceSettings.theme === "system" ? "border-teal-500 bg-teal-50" : "border-gray-200"
                        }`}
                        onClick={() => handleAppearanceChange("theme", "system")}
                      >
                        <div className="flex justify-center mb-3">
                          <div className="flex">
                            <Sun className="h-8 w-8 text-amber-500" />
                            <Moon className="h-8 w-8 text-indigo-500 -ml-2" />
                          </div>
                        </div>
                        <p className="text-center font-medium">System</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Text Size</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div
                        className={`border rounded-lg p-4 cursor-pointer ${
                          appearanceSettings.fontSize === "small" ? "border-teal-500 bg-teal-50" : "border-gray-200"
                        }`}
                        onClick={() => handleAppearanceChange("fontSize", "small")}
                      >
                        <p className="text-center text-sm font-medium">Small</p>
                      </div>

                      <div
                        className={`border rounded-lg p-4 cursor-pointer ${
                          appearanceSettings.fontSize === "medium" ? "border-teal-500 bg-teal-50" : "border-gray-200"
                        }`}
                        onClick={() => handleAppearanceChange("fontSize", "medium")}
                      >
                        <p className="text-center text-base font-medium">Medium</p>
                      </div>

                      <div
                        className={`border rounded-lg p-4 cursor-pointer ${
                          appearanceSettings.fontSize === "large" ? "border-teal-500 bg-teal-50" : "border-gray-200"
                        }`}
                        onClick={() => handleAppearanceChange("fontSize", "large")}
                      >
                        <p className="text-center text-lg font-medium">Large</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Accessibility</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Reduced Motion</Label>
                          <p className="text-sm text-gray-500">Minimize animations throughout the application</p>
                        </div>
                        <Switch
                          checked={appearanceSettings.reducedMotion}
                          onCheckedChange={(checked) => handleAppearanceChange("reducedMotion", checked)}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">High Contrast</Label>
                          <p className="text-sm text-gray-500">Increase contrast for better visibility</p>
                        </div>
                        <Switch
                          checked={appearanceSettings.highContrast}
                          onCheckedChange={(checked) => handleAppearanceChange("highContrast", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
