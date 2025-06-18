import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, KeyRound, BellRing } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AccountSettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-3">
        <UserCog className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile, password, and notification preferences.</p>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCog className="h-5 w-5"/> Profile Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="Current User Name" />
                </div>
                <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="user@example.com" disabled />
                </div>
            </div>
            <div>
                <Label htmlFor="department">Department (Role Specific)</Label>
                <Input id="department" defaultValue="MCA Department" disabled />
            </div>
            <Button>Save Profile Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5"/> Change Password</CardTitle>
            <CardDescription>Update your account password for better security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
            </div>
            <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
            </div>
            <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
            </div>
            <Button>Update Password</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5"/> Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Receive important updates via email.
                </span>
              </Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
             <div className="flex items-center justify-between">
              <Label htmlFor="inapp-notifications" className="flex flex-col space-y-1">
                <span>In-App Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Show notifications within the MCA Dept app.
                </span>
              </Label>
              <Switch id="inapp-notifications" defaultChecked />
            </div>
            <Button>Save Notification Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}