
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { IClass } from '@/models/class.model';
import type { IUser } from '@/models/user.model';
import { getClasses } from '../classes/actions';
import { getUsers, addUser, deleteUser, updateUser, type AddUserInput, type UpdateUserInput } from './actions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Loader2, Edit, Trash2, MoreHorizontal, Eye, EyeOff } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const addUserSchema = z.object({
  name: z.string().min(2, "Username must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(['student', 'faculty']),
  classId: z.string().optional(),
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
});


function AddUserForm({ setIsOpen, classList, role, onUserAdded }: { setIsOpen: (open: boolean) => void, classList: IClass[], role: 'student' | 'faculty', onUserAdded: () => void }) {
  const { toast } = useToast();
  const form = useForm<AddUserInput>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: role,
      classId: "",
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

function EditUserForm({ user, setIsOpen, classList, onUserUpdated }: { user: IUser, setIsOpen: (open: boolean) => void, classList: IClass[], onUserUpdated: () => void }) {
  const { toast } = useToast();
  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: "",
      classId: user.role === 'student' ? (user as any).classId : "",
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


function UsersTable({ users, onSelectEdit, onSelectDelete }: { users: IUser[], onSelectEdit: (user: IUser) => void, onSelectDelete: (user: IUser) => void }) {
  return (
     <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Password</TableHead>
          <TableHead>Assigned Class</TableHead>
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
            <TableCell>{user.role === 'student' ? (user as any).className || 'N/A' : 'N/A'}</TableCell>
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
            <TableCell colSpan={5} className="h-24 text-center">
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
  const [users, setUsers] = useState<IUser[]>([]);
  const [classList, setClassList] = useState<IClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userToEdit, setUserToEdit] = useState<IUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch {
      toast({ title: "Error", description: "Could not fetch users.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isAddDialogOpen || isEditDialogOpen) {
      getClasses().then(setClassList);
    }
  }, [isAddDialogOpen, isEditDialogOpen]);
  
  const handleOpenAddDialog = (role: 'student' | 'faculty') => {
    setDialogRole(role);
    setIsAddDialogOpen(true);
  };
  
  const handleOpenEditDialog = (user: IUser) => {
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
      fetchUsers(); // Refresh the user list
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
    setUserToDelete(null);
  };
  
  const studentUsers = users.filter(u => u.role === 'student');
  const facultyUsers = users.filter(u => u.role === 'faculty');

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
            <div className="py-4">
              <AddUserForm setIsOpen={setIsAddDialogOpen} classList={classList} role={dialogRole} onUserAdded={fetchUsers} />
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
            <div className="py-4">
              {userToEdit && <EditUserForm user={userToEdit} setIsOpen={setIsEditDialogOpen} classList={classList} onUserUpdated={fetchUsers} />}
            </div>
          </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>User Lists</CardTitle>
          <CardDescription>A list of all student and faculty accounts.</CardDescription>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="students" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="faculty">Faculty</TabsTrigger>
              </TabsList>
              <TabsContent value="students">
                 {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <UsersTable users={studentUsers} onSelectEdit={handleOpenEditDialog} onSelectDelete={setUserToDelete} />
                  )}
              </TabsContent>
              <TabsContent value="faculty">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <UsersTable users={facultyUsers} onSelectEdit={handleOpenEditDialog} onSelectDelete={setUserToDelete} />
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
