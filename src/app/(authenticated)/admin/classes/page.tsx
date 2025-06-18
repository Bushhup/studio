import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, PlusCircle } from "lucide-react";

export default function AdminClassesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <School className="h-10 w-10 text-primary" />
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Class Management</h1>
            <p className="text-muted-foreground">Create and manage classes (e.g., MCA I Year).</p>
          </div>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Class
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Class List</CardTitle>
          <CardDescription> Placeholder for class list and management tools.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Class data table (name, year, student count) and actions will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}