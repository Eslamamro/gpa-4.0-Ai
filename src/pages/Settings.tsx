
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Bell, Crown, Moon, Sun } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

const Settings = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    university: 'MIT',
    major: 'Computer Science'
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    studyReminders: true
  });

  const handleProfileUpdate = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceToggle = (preference: string) => {
    setPreferences(prev => ({ ...prev, [preference]: !prev[preference as keyof typeof prev] }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Settings */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-purple-600" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and academic details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="text-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline">Change Photo</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => handleProfileUpdate('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleProfileUpdate('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Input
                        id="university"
                        value={profile.university}
                        onChange={(e) => handleProfileUpdate('university', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">Major</Label>
                      <Input
                        id="major"
                        value={profile.major}
                        onChange={(e) => handleProfileUpdate('major', e.target.value)}
                      />
                    </div>
                  </div>

                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-blue-600" />
                    Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your StudyMate AI experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive study reminders via email</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={() => handlePreferenceToggle('emailNotifications')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Get notifications in your browser</p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={() => handlePreferenceToggle('pushNotifications')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex items-center">
                      <div className="mr-3">
                        {preferences.darkMode ? (
                          <Moon className="h-5 w-5 text-gray-600" />
                        ) : (
                          <Sun className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-gray-500">Toggle between light and dark themes</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.darkMode}
                      onCheckedChange={() => handlePreferenceToggle('darkMode')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Study Reminders</Label>
                      <p className="text-sm text-gray-500">Daily reminders to review flashcards</p>
                    </div>
                    <Switch
                      checked={preferences.studyReminders}
                      onCheckedChange={() => handlePreferenceToggle('studyReminders')}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription */}
            <div>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-yellow-600" />
                    Subscription
                  </CardTitle>
                  <CardDescription>
                    Current plan: Free
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Upgrade to Premium</h3>
                    <ul className="text-sm text-purple-800 space-y-1 mb-4">
                      <li>• Unlimited notes</li>
                      <li>• Advanced AI features</li>
                      <li>• PDF exports</li>
                      <li>• Priority support</li>
                    </ul>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      Upgrade Now - $9/month
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Usage This Month</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Notes processed</span>
                        <span className="font-medium">3 / 5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Flashcards created</span>
                        <span className="font-medium">24 / 50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quizzes taken</span>
                        <span className="font-medium">8 / 10</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
