'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { volunteerApi } from '@/lib/api';

const skillOptions = [
  { id: 'protests', label: 'Protests & Demonstrations' },
  { id: 'outreach', label: 'Street Outreach & Leafleting' },
  { id: 'sanctuary', label: 'Sanctuary Work' },
  { id: 'social_media', label: 'Social Media & Content Creation' },
  { id: 'education', label: 'Educational Events' },
  { id: 'fundraising', label: 'Fundraising' },
  { id: 'speaking', label: 'Public Speaking' },
];

const formSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewVolunteerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      bio: '',
      skills: [],
    },
  });

  const createVolunteer = useMutation({
    mutationFn: volunteerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      toast.success('Volunteer added successfully');
      router.push('/coordinator/volunteers');
    },
    onError: (error: any) => {
      toast.error('Failed to add volunteer', {
        description: error.message || 'Please try again.',
      });
    },
  });

  function onSubmit(data: FormValues) {
    createVolunteer.mutate(data);
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          className="gap-2 mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Volunteers
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Volunteer</h1>
        <p className="text-muted-foreground mt-1">
          Create a new volunteer profile and generate their AI embedding
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Volunteer Information</CardTitle>
          <CardDescription>
            Fill in the details below. The AI will generate an embedding based on their bio and skills.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
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
                      <Input type="email" placeholder="jane@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about this volunteer's background and interests..."
                        className="min-h-32 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be used for AI-powered campaign matching.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={() => (
                  <FormItem>
                    <FormLabel>Skills & Interests</FormLabel>
                    <FormDescription>Select all areas of interest.</FormDescription>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      {skillOptions.map((skill) => (
                        <FormField
                          key={skill.id}
                          control={form.control}
                          name="skills"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(skill.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, skill.id]);
                                    } else {
                                      field.onChange(field.value?.filter((v) => v !== skill.id));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {skill.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={createVolunteer.isPending}
                >
                  <UserPlus className="h-4 w-4" />
                  {createVolunteer.isPending ? 'Adding...' : 'Add Volunteer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
