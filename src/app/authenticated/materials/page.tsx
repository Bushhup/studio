
'use client';

import { useState, useEffect } from 'react';
import type { StudyMaterial } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenText, DownloadCloud, FileText, Filter, Search, FileUp, FileType2 } from 'lucide-react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { getMaterials, addMaterial, type AddMaterialInput } from './actions';
import { useSession } from 'next-auth/react';

const FileTypeIcon = ({ type }: { type: StudyMaterial['fileType'] }) => {
  switch (type) {
    case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
    case 'ppt': return <FileType2 className="h-5 w-5 text-orange-500" />;
    case 'doc': return <FileType2 className="h-5 w-5 text-blue-500" />;
    case 'link': return <FileText className="h-5 w-5 text-green-500" />;
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

function UploadForm({ onMaterialAdded }: { onMaterialAdded: (material: StudyMaterial) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, control } = useForm<AddMaterialInput>();
  const { toast } = useToast();
  const { data: session } = useSession();

  const onSubmit: SubmitHandler<AddMaterialInput> = async (data) => {
    try {
      const newMaterial = await addMaterial({ ...data, uploadedBy: session?.user?.name || 'Faculty' });
      if ('error' in newMaterial) {
        throw new Error(newMaterial.error);
      }
      toast({
        title: "Success",
        description: "New study material has been added.",
      });
      onMaterialAdded(newMaterial);
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to add material.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Upload New Material</CardTitle>
        <CardDescription>Share resources with students. Fill in the details below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g., Chapter 1 Notes" {...register("title", { required: "Title is required" })} />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Briefly describe the material." {...register("description", { required: "Description is required" })} />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="e.g., Algorithms" {...register("subject", { required: "Subject is required" })} />
              {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
            </div>
            <div>
              <Label htmlFor="fileType">File Type</Label>
              <Controller
                name="fileType"
                control={control}
                rules={{ required: 'File type is required' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="fileType">
                        <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="ppt">PPT</SelectItem>
                        <SelectItem value="doc">DOC</SelectItem>
                        <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.fileType && <p className="text-sm text-destructive mt-1">{errors.fileType.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="fileUrl">File URL / Link</Label>
            <Input id="fileUrl" placeholder="https://example.com/file.pdf or https://github.com/..." {...register("fileUrl", { required: "File URL is required" })} />
            <p className="text-sm text-muted-foreground mt-1">Provide a direct link to the file or resource.</p>
            {errors.fileUrl && <p className="text-sm text-destructive mt-1">{errors.fileUrl.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? <svg
                viewBox="0 0 24 24"
                className="mr-2 h-4 w-4 animate-pulse"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg> : <FileUp className="mr-2 h-4 w-4" />}
            Upload Material
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


export default function MaterialsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        const fetchedMaterials = await getMaterials();
        setMaterials(fetchedMaterials);
      } catch (error) {
        toast({
            title: "Error",
            description: "Failed to fetch materials.",
            variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchMaterials();
  }, [toast]);

  const handleNewMaterial = (newMaterial: StudyMaterial) => {
    setMaterials(prev => [newMaterial, ...prev]);
  };

  const filteredMaterials = materials.filter(material => 
    (material.title.toLowerCase().includes(searchTerm.toLowerCase()) || material.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (subjectFilter === 'all' || material.subject === subjectFilter)
  );

  const subjects = ['all', ...new Set(materials.map(m => m.subject))];

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
              {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-8 w-8 animate-pulse theme-gradient-stroke"
                      fill="none"
                      stroke="url(#theme-gradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                        <defs>
                            <linearGradient id="theme-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{stopColor: 'hsl(var(--primary))'}} />
                                <stop offset="100%" style={{stopColor: 'hsl(var(--accent))'}} />
                            </linearGradient>
                        </defs>
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                ) : filteredMaterials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMaterials.map(material => <MaterialCard key={material.id} material={material} />)}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-10">No materials found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {(role === 'admin' || role === 'faculty') && (
          <TabsContent value="upload" className="mt-6">
            <UploadForm onMaterialAdded={handleNewMaterial} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
