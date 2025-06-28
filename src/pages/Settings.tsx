
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sidebar } from '@/components/Sidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { Crown, Moon, Bell, Shield, Download } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#000000]">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your account and preferences</p>
          </div>

          <div className="grid gap-6">
            {/* Profile Settings */}
            <Card className="dark:bg-[#1F1F1F] dark:border-[#1A1A1A]">
              <CardHeader>
                <CardTitle className="dark:text-white">Profile Information</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-gray-300">Full Name</Label>
                    <Input 
                      id="name" 
                      defaultValue="John Doe" 
                      className="dark:bg-[#2C2C2C] dark:border-[#1A1A1A] dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue="john@example.com" 
                      className="dark:bg-[#2C2C2C] dark:border-[#1A1A1A] dark:text-white"
                    />
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card className="dark:bg-[#1F1F1F] dark:border-[#1A1A1A]">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center">
                  <Moon className="h-5 w-5 mr-2" />
                  Appearance
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Customize how StudyMate AI looks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="dark:text-gray-300">Dark Mode</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <Switch 
                    checked={theme === 'dark'} 
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="dark:bg-[#1F1F1F] dark:border-[#1A1A1A]">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="dark:text-gray-300">Study Reminders</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get reminded to review your flashcards
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="dark:text-gray-300">Quiz Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notifications about new quiz recommendations
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Premium Upgrade */}
            <Card className="border-purple-200 dark:border-purple-600/50 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 dark:bg-[#1F1F1F]">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                  <Crown className="h-5 w-5 mr-2" />
                  Upgrade to Premium
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Unlock unlimited features and advanced AI capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      ✓ Unlimited notes and flashcards
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      ✓ Advanced AI summaries
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      ✓ PDF exports
                    </li>
                    <li className="flex items-center text-gray-700 dark:text-gray-300">
                      ✓ Priority support
                    </li>
                  </ul>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Upgrade Now - $9/month
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data & Privacy */}
            <Card className="dark:bg-[#1F1F1F] dark:border-[#1A1A1A]">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Data & Privacy
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Manage your data and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full dark:border-[#1A1A1A] dark:text-gray-300 dark:hover:bg-[#2C2C2C]">
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
