
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { IClass } from '@/models/class.model';
import type { IUser } from '@/models/user.model';
import { getClasses } from '../classes/actions';
import { getUsers, addUser, deleteUser, updateUser, type AddUserInput, type UpdateUserInput } from './actions';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Loader2, Edit, Trash2, MoreHorizontal, Eye, EyeOff, Check, Filter, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ExtendedUser } from './actions';
import { ExtendedSubject, getSubjects } from '../subjects/actions';


const addUserSchema = z.object({
  name: z.string().min(2, "Username must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(['student', 'faculty']),
  classId: z.string().optional(),
  inchargeOfClasses: z.array(z.string()).optional(),
  handlingSubjects: z.array(z.string()).optional(),
}).refine(data => {
    if (data.role === 'student' && (!data.classId || data.classId.length === 0)) {
        return false;
    }
    return true;
}, {
    message: "A class must be selected for students.",
    path: ["classId"],
});

const updateUserSchema = z.object({
  name: z.string().min(2, "Username must be at least 2 characters.").optional(),
  email: z.string().email("Invalid email address.").optional(),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal('')),
  classId: z.string().optional(),
  inchargeOfClasses: z.array(z.string()).optional(),
  handlingSubjects: z.array(z.string()).optional(),
});


function AddUserForm({ setIsOpen, classList, subjectList, role, onUserAdded }: { 
    setIsOpen: (open: boolean) => void, 
    classList: IClass[], 
    subjectList: ExtendedSubject[],
    role: 'student' | 'faculty', 
    onUserAdded: () => void 
}) {
  const { toast } = useToast();
  const form = useForm<AddUserInput>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: role,
      classId: "",
      inchargeOfClasses: [],
      handlingSubjects: [],
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (data: AddUserInput) => {
    const result = await addUser(data);
    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      });
      onUserAdded(); // Refresh the user list
      setIsOpen(false);
      form.reset();
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };
  
  const selectedClasses = form.watch('inchargeOfClasses') || [];
  const classMap = new Map(classList.map(c => [c.id, c.name]));

  const selectedSubjects = form.watch('handlingSubjects') || [];
  const subjectMap = new Map(subjectList.map(s => [s.id, `${s.name} (${s.code})`]));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="e.g., john.doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {role === 'student' && (
          <FormField
            control={form.control}
            name="classId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign to Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classList.length > 0 ? (
                      classList.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name} ({cls.academicYear})</SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-muted-foreground">No classes found. Create a class first.</div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {role === 'faculty' && (
            <>
                <FormField control={form.control} name="inchargeOfClasses" render={({ field }) => (
                    <FormItem>
                        <FormLabel>In-charge of Classes (Optional)</FormLabel>
                        <FormControl>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <div className="truncate">
                                            {selectedClasses.length > 0 ? selectedClasses.map(id => classMap.get(id)).join(', ') : "Select classes..."}
                                        </div>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search classes..." />
                                        <CommandList>
                                            <CommandEmpty>No results found.</CommandEmpty>
                                            <CommandGroup>
                                                {classList.map((cls) => {
                                                    const isSelected = selectedClasses.includes(cls.id);
                                                    return (
                                                        <CommandItem
                                                            key={cls.id}
                                                            onSelect={() => {
                                                                const newSelection = isSelected 
                                                                    ? selectedClasses.filter(id => id !== cls.id)
                                                                    : [...selectedClasses, cls.id];
                                                                field.onChange(newSelection);
                                                            }}
                                                        >
                                                            <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                                <Check className="h-4 w-4" />
                                                            </div>
                                                            <span>{cls.name}</span>
                                                        </CommandItem>
                                                    )
                                                })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="handlingSubjects" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subjects Handled (Optional)</FormLabel>
                        <FormControl>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <div className="truncate">
                                            {selectedSubjects.length > 0 ? selectedSubjects.map(id => subjectMap.get(id)).join(', ') : "Select subjects..."}
                                        </div>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search subjects..." />
                                        <CommandList>
                                            <CommandEmpty>No results found.</CommandEmpty>
                                            <CommandGroup>
                                                {subjectList.map((sub) => {
                                                    const isSelected = selectedSubjects.includes(sub.id);
                                                    return (
                                                        <CommandItem
                                                            key={sub.id}
                                                            onSelect={() => {
                                                                const newSelection = isSelected
                                                                    ? selectedSubjects.filter(id => id !== sub.id)
                                                                    : [...selectedSubjects, sub.id];
                                                                field.onChange(newSelection);
                                                            }}
                                                        >
                                                            <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                                <Check className="h-4 w-4" />
                                                            </div>
                                                            <span>{sub.name} ({sub.code})</span>
                                                        </CommandItem>
                                                    )
                                                })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Add User
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function EditUserForm({ user, setIsOpen, classList, subjectList, onUserUpdated }: { 
    user: ExtendedUser, 
    setIsOpen: (open: boolean) => void, 
    classList: IClass[], 
    subjectList: ExtendedSubject[], 
    onUserUpdated: () => void 
}) {
  const { toast } = useToast();
  
  const initialInchargeClasses = user.inchargeOfClasses?.map(c => c.id) || [];
  const initialHandlingSubjects = user.handlingSubjects?.map(s => s.id) || [];
  
  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: "",
      classId: user.role === 'student' ? user.classId : "",
      inchargeOfClasses: initialInchargeClasses,
      handlingSubjects: initialHandlingSubjects,
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (data: UpdateUserInput) => {
    const result = await updateUser(user.id, data);
    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      });
      onUserUpdated();
      setIsOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const selectedClasses = form.watch('inchargeOfClasses') || [];
  const classMap = new Map(classList.map(c => [c.id, c.name]));

  const selectedSubjects = form.watch('handlingSubjects') || [];
  const subjectMap = new Map(subjectList.map(s => [s.id, `${s.name} (${s.code})`]));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="e.g., john.doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Leave blank to keep current password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {user.role === 'student' && (
          <FormField
            control={form.control}
            name="classId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign to Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classList.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name} ({cls.academicYear})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {user.role === 'faculty' && (
            <>
                <FormField control={form.control} name="inchargeOfClasses" render={({ field }) => (
                    <FormItem>
                        <FormLabel>In-charge of Classes (Optional)</FormLabel>
                        <FormControl>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <div className="truncate">
                                            {selectedClasses.length > 0 ? selectedClasses.map(id => classMap.get(id)).join(', ') : "Select classes..."}
                                        </div>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search classes..." />
                                        <CommandList>
                                            <CommandEmpty>No results found.</CommandEmpty>
                                            <CommandGroup>
                                                {classList.map((cls) => {
                                                    const isSelected = selectedClasses.includes(cls.id);
                                                    return (
                                                        <CommandItem
                                                            key={cls.id}
                                                            onSelect={() => {
                                                                const newSelection = isSelected 
                                                                    ? selectedClasses.filter(id => id !== cls.id)
                                                                    : [...selectedClasses, cls.id];
                                                                field.onChange(newSelection);
                                                            }}
                                                        >
                                                            <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                                <Check className="h-4 w-4" />
                                                            </div>
                                                            <span>{cls.name}</span>
                                                        </CommandItem>
                                                    )
                                                })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="handlingSubjects" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subjects Handled (Optional)</FormLabel>
                        <FormControl>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <div className="truncate">
                                            {selectedSubjects.length > 0 ? selectedSubjects.map(id => subjectMap.get(id)).join(', ') : "Select subjects..."}
                                        </div>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search subjects..." />
                                        <CommandList>
                                            <CommandEmpty>No results found.</CommandEmpty>
                                            <CommandGroup>
                                                {subjectList.map((sub) => {
                                                    const isSelected = selectedSubjects.includes(sub.id);
                                                    return (
                                                        <CommandItem
                                                            key={sub.id}
                                                            onSelect={() => {
                                                                const newSelection = isSelected
                                                                    ? selectedSubjects.filter(id => id !== sub.id)
                                                                    : [...selectedSubjects, sub.id];
                                                                field.onChange(newSelection);
                                                            }}
                                                        >
                                                            <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                                <Check className="h-4 w-4" />
                                                            </div>
                                                            <span>{sub.name} ({sub.code})</span>
                                                        </CommandItem>
                                                    )
                                                })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
           </>
        )}
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}


function PasswordCell({ password }: { password?: string }) {
  const [isVisible, setIsVisible] = useState(false);

  if (!password) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono">{isVisible ? password : '••••••••'}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => setIsVisible(!isVisible)}
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}


function UsersTable({ users, onSelectEdit, onSelectDelete, role }: { users: ExtendedUser[], onSelectEdit: (user: ExtendedUser) => void, onSelectDelete: (user: ExtendedUser) => void, role: 'student' | 'faculty' }) {
  const isFacultyRole = role === 'faculty';

  return (
     <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Password</TableHead>
          {isFacultyRole ? (
            <>
              <TableHead>In-charge Of</TableHead>
              <TableHead>Subjects Handled</TableHead>
            </>
          ) : (
            <TableHead>Assigned Class</TableHead>
          )}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length > 0 ? users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <PasswordCell password={user.password} />
            </TableCell>
            {isFacultyRole ? (
              <>
                <TableCell>
                  {user.inchargeOfClasses && user.inchargeOfClasses.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.inchargeOfClasses.map(c => <Badge key={c.id} variant="secondary">{c.name}</Badge>)}
                    </div>
                  ) : <span className="text-muted-foreground">N/A</span>}
                </TableCell>
                <TableCell>
                  {user.handlingSubjects && user.handlingSubjects.length > 0 ? (
                     <div className="flex flex-col gap-1 items-start">
                      {user.handlingSubjects.map(s => (
                        <Badge key={s.id} variant="outline" className="font-normal">
                          {s.name} <span className="text-muted-foreground ml-1.5">({s.className})</span>
                        </Badge>
                      ))}
                    </div>
                  ) : <span className="text-muted-foreground">N/A</span>}
                </TableCell>
              </>
            ) : (
              <TableCell>
                <Badge variant="secondary">{user.className || 'N/A'}</Badge>
              </TableCell>
            )}
            <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => onSelectEdit(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={() => onSelectDelete(user)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={isFacultyRole ? 6 : 5} className="h-24 text-center">
              No users found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}


export default function AdminUsersPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [dialogRole, setDialogRole] = useState<'student' | 'faculty'>('student');
  
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [classList, setClassList] = useState<IClass[]>([]);
  const [subjectList, setSubjectList] = useState<ExtendedSubject[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [userToEdit, setUserToEdit] = useState<ExtendedUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<ExtendedUser | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  const { toast } = useToast();

  const fetchPageData = async () => {
    setIsLoading(true);
    try {
      const [fetchedUsers, fetchedClasses, fetchedSubjects] = await Promise.all([
          getUsers(),
          getClasses(),
          getSubjects(),
      ]);
      setUsers(fetchedUsers);
      const plainClasses = fetchedClasses.map(c => ({
        ...c,
        id: c.id.toString(),
        inchargeFaculty: c.inchargeFaculty?.toString() || '',
      }))
      setClassList(plainClasses as IClass[]);
      setSubjectList(fetchedSubjects);
    } catch {
      toast({ title: "Error", description: "Could not fetch page data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPageData();
  }, []);
  
  const handleOpenAddDialog = (role: 'student' | 'faculty') => {
    setDialogRole(role);
    setIsAddDialogOpen(true);
  };
  
  const handleOpenEditDialog = (user: ExtendedUser) => {
    setUserToEdit(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const result = await deleteUser(userToDelete.id);
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      fetchPageData(); // Refresh the user list
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
    setUserToDelete(null);
  };
  
  const filteredUsers = useMemo(() => {
      return users.filter(user => {
          const nameMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
          const classMatch = user.role === 'student' ? (classFilter === 'all' || user.classId === classFilter) : true;
          return nameMatch && classMatch;
      });
  }, [users, searchTerm, classFilter]);
  
  const studentUsers = filteredUsers.filter(u => u.role === 'student');
  const facultyUsers = filteredUsers.filter(u => u.role === 'faculty');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-10 w-10 text-primary" />
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">User Management</h1>
            <p className="text-muted-foreground">Manage student and faculty accounts.</p>
          </div>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => handleOpenAddDialog('student')}>
              <UserPlus className="mr-2 h-5 w-5" /> Add Student
            </Button>
            <Button onClick={() => handleOpenAddDialog('faculty')} variant="secondary">
              <UserPlus className="mr-2 h-5 w-5" /> Add Faculty
            </Button>
        </div>
      </div>
      
      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline capitalize">Add New {dialogRole}</DialogTitle>
              <DialogDescription>
                Enter the details below to create a new {dialogRole} account.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
              <AddUserForm setIsOpen={setIsAddDialogOpen} classList={classList} subjectList={subjectList} role={dialogRole} onUserAdded={fetchPageData} />
            </div>
          </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline capitalize">Edit {userToEdit?.role}</DialogTitle>
              <DialogDescription>
                Update the details for {userToEdit?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
              {userToEdit && <EditUserForm user={userToEdit} setIsOpen={setIsEditDialogOpen} classList={classList} subjectList={subjectList} onUserUpdated={fetchPageData} />}
            </div>
          </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>User Lists & Filters</CardTitle>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by username..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="students" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="faculty">Faculty</TabsTrigger>
              </TabsList>
              <TabsContent value="students" className="space-y-4">
                 <div className="mt-4 flex justify-end">
                    <Select value={classFilter} onValueChange={setClassFilter}>
                        <SelectTrigger className="w-full sm:w-[250px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by class" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            {classList.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
                 {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <UsersTable users={studentUsers} onSelectEdit={handleOpenEditDialog} onSelectDelete={setUserToDelete} role="student" />
                  )}
              </TabsContent>
              <TabsContent value="faculty">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <UsersTable users={facultyUsers} onSelectEdit={handleOpenEditDialog} onSelectDelete={setUserToDelete} role="faculty" />
                  )}
              </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
       <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account for{' '}
              <span className="font-semibold">{userToDelete?.name}</span> and remove all their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteUser}
            >
              Yes, delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
