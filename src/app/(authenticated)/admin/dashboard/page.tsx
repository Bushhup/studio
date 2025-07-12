import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings, Briefcase, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserCounts } from "../users/actions";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const { students, faculty } = await getUserCounts();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Oversee and manage all department activities.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students}</div>
            <p className="text-xs text-muted-foreground">Live count from database</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faculty}</div>
            <p className="text-xs text-muted-foreground">Live count from database</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Next event in 3 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
            <CardDescription>Manage core department functions.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button asChild variant="outline" className="justify-start text-left">
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4"/> Manage Users
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start text-left">
              <Link href="/settings/account">
                <Settings className="mr-2 h-4 w-4"/> System Settings
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start text-left">
              <Link href="/placements">
                <Briefcase className="mr-2 h-4 w-4"/> Placement Hub
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start text-left">
              <Link href="/home">
                <Bell className="mr-2 h-4 w-4"/> Post Notice
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
