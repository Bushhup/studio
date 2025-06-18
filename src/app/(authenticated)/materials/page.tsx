'use client';

import { useState } from 'react';
import type { StudyMaterial, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpenText, DownloadCloud, FileText, Filter, Search, UploadCloud, FileUp, FileType2 } from 'lucide-react';
import Image from 'next/image';
import { useMockAuth } from '@/hooks/use-mock-auth';

const mockMaterials: StudyMaterial[] = [
  { id: '1', title: 'Introduction to Algorithms Notes', description: 'Comprehensive notes for the first unit.', subject: 'Algorithms', fileType: 'pdf', fileUrl: '#', uploadedBy: 'Dr. Ada Lovelace', uploadDate: new Date().toISOString() , fileName: 'algo_unit1.pdf'},
  { id: '2', title: 'Operating Systems Concepts PPT', description: 'Lecture slides for OS concepts.', subject: 'Operating Systems', fileType: 'ppt', fileUrl: '#', uploadedBy: 'Prof. Linus Torvalds', uploadDate: new Date().toISOString(), fileName: 'os_concepts.ppt' },
  { id: '3', title: 'Database Design Document Template', description: 'Template for database design projects.', subject: 'DBMS', fileType: 'doc', fileUrl: '#', uploadedBy: 'Dr. Charles Babbage', uploadDate: new Date().toISOString(), fileName: 'db_design_template.doc' },
  { id: '4', title: 'Advanced Java Programming Examples', description: 'Code examples for advanced Java topics.', subject: 'Java Programming', fileType: 'link', fileUrl: 'https://github.com/example/java-examples', uploadedBy: 'Prof. James Gosling', uploadDate: new Date().toISOString() },
];

const FileTypeIcon = ({ type }: { type: StudyMaterial['fileType'] }) => {
  switch (type) {
    case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
    case 'ppt': return <FileType2 className="h-5 w-5 text-orange-500" />; // Using FileType2 as placeholder
    case 'doc': return <FileType2 className="h-5 w-5 text-blue-500" />;
    case 'link': return <UploadCloud className="h-5 w-5 text-green-500" />; // Link could be different
    default: return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

function MaterialCard({ material }: { material: StudyMaterial }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl mb-1">{material.title}</CardTitle>
          <FileTypeIcon type={material.fileType} />
        </div>
        <CardDescription>Subject: {material.subject}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{material.description}</p>
        <p className="text-xs text-muted-foreground mt-2">Uploaded by: {material.uploadedBy}</p>
        <p className="text-xs text-muted-foreground">Date: {new Date(material.uploadDate).toLocaleDateString()}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm">
          <a href={material.fileUrl} target={material.fileType === 'link' ? '_blank' : '_self'} download={material.fileName} rel="noopener noreferrer">
            <DownloadCloud className="mr-2 h-4 w-4" />
            {material.fileType === 'link' ? 'Open Link' : 'Download'}
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function MaterialsPage() {
  const { role } = useMockAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const filteredMaterials = mockMaterials.filter(material => 
    (material.title.toLowerCase().includes(searchTerm.toLowerCase()) || material.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (subjectFilter === 'all' || material.subject === subjectFilter)
  );

  const subjects = ['all', ...new Set(mockMaterials.map(m => m.subject))];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center gap-3">
        <BookOpenText className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Study Materials</h1>
          <p className="text-muted-foreground">Access notes, presentations, and other learning resources.</p>
        </div>
      </div>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 max-w-md">
          <TabsTrigger value="view">View Materials</TabsTrigger>
          {(role === 'admin' || role === 'faculty') && (
            <TabsTrigger value="upload">Upload Material</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="view" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Available Materials</CardTitle>
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search materials..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredMaterials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMaterials.map(material => <MaterialCard key={material.id} material={material} />)}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-10">No materials found matching your criteria.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {(role === 'admin' || role === 'faculty') && (
          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Upload New Material</CardTitle>
                <CardDescription>Share resources with students. Fill in the details below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="e.g., Chapter 1 Notes" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Briefly describe the material." />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="algorithms">Algorithms</SelectItem>
                      <SelectItem value="os">Operating Systems</SelectItem>
                      <SelectItem value="dbms">DBMS</SelectItem>
                      <SelectItem value="java">Java Programming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="file">File Upload</Label>
                  <Input id="file" type="file" />
                  <p className="text-sm text-muted-foreground mt-1">Supported formats: PDF, PPT, DOC, DOCX. Max size: 10MB.</p>
                </div>
                <Button className="w-full sm:w-auto">
                  <FileUp className="mr-2 h-4 w-4" /> Upload Material
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
