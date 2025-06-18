'use client';

import { useState } from 'react';
import type { PlacementOpportunity, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Filter, Search, PlusCircle, ExternalLink, Bookmark, Edit, Trash2, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMockAuth } from '@/hooks/use-mock-auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const mockPlacements: PlacementOpportunity[] = [
  { id: '1', title: 'Software Engineer Intern', company: 'Innovatech Solutions', description: 'Work on cutting-edge projects using modern technologies. Great learning opportunity.', batchYear: '2025', eligibility: { cgpa: 7.5, skills: ['React', 'Node.js', 'Python'] }, applyLink: '#', postedDate: new Date().toISOString() },
  { id: '2', title: 'Data Analyst Intern', company: 'Data Insights Co.', description: 'Analyze large datasets and generate insights. Exposure to real-world data problems.', batchYear: '2024', eligibility: { cgpa: 8.0, skills: ['SQL', 'Python', 'Tableau'] }, applyLink: '#', postedDate: new Date().toISOString() },
  { id: '3', title: 'Full Stack Developer (Fresher)', company: 'WebCrafters Ltd.', description: 'Join a dynamic team to build and maintain web applications. Excellent growth path.', batchYear: '2024', eligibility: { skills: ['JavaScript', 'HTML', 'CSS', 'MongoDB'] }, applyLink: '#', postedDate: new Date().toISOString() },
];

function PlacementCard({ placement, userRole }: { placement: PlacementOpportunity, userRole: Role | null }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="font-headline text-xl mb-1">{placement.title}</CardTitle>
          <Building className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardDescription className="font-semibold text-primary">{placement.company}</CardDescription>
        <div className="text-xs text-muted-foreground">Posted: {new Date(placement.postedDate).toLocaleDateString()}</div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground/80 line-clamp-3 mb-3">{placement.description}</p>
        {placement.eligibility && (
          <div className="space-y-1 text-xs">
            {placement.eligibility.cgpa && <p><strong>CGPA:</strong> {placement.eligibility.cgpa}+</p>}
            {placement.eligibility.skills && <p><strong>Skills:</strong> {placement.eligibility.skills.join(', ')}</p>}
            {placement.batchYear && <p><strong>Batch:</strong> {placement.batchYear}</p>}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <Button asChild size="sm" className="w-full sm:w-auto">
          <a href={placement.applyLink} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" /> Apply Now
          </a>
        </Button>
        {userRole === 'student' && (
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Bookmark className="mr-2 h-4 w-4" /> Save
          </Button>
        )}
        {userRole === 'admin' && (
          <div className="flex gap-2 w-full sm:w-auto">
             <Button variant="outline" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
             </Button>
             <Button variant="destructive" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4" />
             </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default function PlacementsPage() {
  const { role } = useMockAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredPlacements = mockPlacements.filter(p =>
    (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (batchFilter === 'all' || p.batchYear === batchFilter)
  );

  const batchYears = ['all', ...new Set(mockPlacements.map(p => p.batchYear).filter(Boolean) as string[])];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
            <Briefcase className="h-10 w-10 text-primary" />
            <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Placement & Internship Hub</h1>
            <p className="text-muted-foreground">Explore career opportunities and internships.</p>
            </div>
        </div>
        {role === 'admin' && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-5 w-5" /> Add Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle className="font-headline">Add New Opportunity</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new placement or internship listing.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="opp-title" className="text-right">Title</Label>
                  <Input id="opp-title" placeholder="e.g., Software Engineer Intern" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="opp-company" className="text-right">Company</Label>
                  <Input id="opp-company" placeholder="Company Name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="opp-description" className="text-right">Description</Label>
                  <Textarea id="opp-description" placeholder="Job details..." className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="opp-batch" className="text-right">Batch Year</Label>
                  <Input id="opp-batch" placeholder="e.g., 2025" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="opp-cgpa" className="text-right">Min CGPA</Label>
                  <Input id="opp-cgpa" type="number" step="0.1" placeholder="e.g., 7.5" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="opp-skills" className="text-right">Skills</Label>
                  <Input id="opp-skills" placeholder="e.g., React, Node.js (comma-separated)" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="opp-link" className="text-right">Apply Link</Label>
                  <Input id="opp-link" placeholder="https://example.com/apply" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" onClick={() => setIsFormOpen(false)}>Save Opportunity</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline">Filter Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title or company..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by batch year" />
            </SelectTrigger>
            <SelectContent>
              {batchYears.map(year => <SelectItem key={year} value={year}>{year === 'all' ? 'All Batches' : year}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {filteredPlacements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlacements.map(placement => <PlacementCard key={placement.id} placement={placement} userRole={role} />)}
        </div>
      ) : (
        <div className="text-center py-10">
          <Briefcase className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-xl font-medium text-muted-foreground">No opportunities found matching your criteria.</p>
          {role === 'admin' && <p className="text-sm text-muted-foreground">Try adding new opportunities or adjusting filters.</p>}
          {role !== 'admin' && <p className="text-sm text-muted-foreground">Check back later or adjust your filters.</p>}
        </div>
      )}
    </div>
  );
}
