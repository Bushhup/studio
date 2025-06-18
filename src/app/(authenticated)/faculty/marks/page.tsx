import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Edit3 } from "lucide-react";

export default function FacultyMarksPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-3">
        <ClipboardList className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Marks Management</h1>
          <p className="text-muted-foreground">Enter, update, and view student marks.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Marks Entry / View</CardTitle>
          <CardDescription> Select class, subject, and exam type to manage marks.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Form for selecting class/subject/exam and table for marks entry/view will be here.</p>
          <Button className="mt-4">
            <Edit3 className="mr-2 h-4 w-4" /> Start Marks Entry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}