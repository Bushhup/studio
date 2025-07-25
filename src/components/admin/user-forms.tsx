
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from '@/lib/utils';
import { Check, Edit, GraduationCap, UserPlus } from 'lucide-react';
import type { IClass } from '@/models/class.model';
import { ExtendedSubject } from '@/app/(authenticated)/admin/subjects/actions';
import { addUser, AddUserInput, updateUser, UpdateUserInput, ExtendedUser } from '@/app/(authenticated)/admin/users/actions';

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


export function AddUserForm({ setIsOpen, classList, subjectList, role, onUserAdded }: { 
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
            {isSubmitting ? <GraduationCap className="mr-2 h-4 w-4 animate-pulse" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Add User
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function EditUserForm({ user, setIsOpen, classList, subjectList, onUserUpdated }: { 
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
            {isSubmitting ? <GraduationCap className="mr-2 h-4 w-4 animate-pulse" /> : <Edit className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
