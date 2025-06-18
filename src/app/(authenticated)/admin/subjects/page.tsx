import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookCopy, PlusCircle } from "lucide-react";

export default function AdminSubjectsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <BookCopy className="h-10 w-10 text-primary" />
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Subject Management</h1>
            <p className="text-muted-foreground">Assign subjects to classes and faculty.</p>
          </div>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Subject
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Subject List & Assignments</CardTitle>
          <CardDescription> Placeholder for subject list and assignment tools.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Subject data table (name, code, assigned faculty, class) will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}