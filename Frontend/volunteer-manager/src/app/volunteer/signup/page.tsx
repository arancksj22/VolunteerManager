'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Heart, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { volunteerApi } from '@/lib/api';

const advocacyInterests = [
  { id: 'protests', label: 'Protests & Demonstrations' },
  { id: 'outreach', label: 'Street Outreach & Leafleting' },
  { id: 'sanctuary', label: 'Sanctuary Work' },
  { id: 'social_media', label: 'Social Media & Content Creation' },
  { id: 'education', label: 'Educational Events' },
  { id: 'fundraising', label: 'Fundraising' },
  { id: 'speaking', label: 'Public Speaking' },
];

const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  bio: z.string().min(20, 'Please tell us a bit more about yourself (at least 20 characters)'),
  skills: z.array(z.string()).min(1, 'Select at least one area of interest'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function VolunteerSignupPage() {
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: '',
      email: '',
      bio: '',
      skills: [],
    },
  });

  const createVolunteer = useMutation({
    mutationFn: volunteerApi.create,
    onSuccess: (data) => {
      localStorage.setItem('volunteer_id', data.id);
      toast.success('Welcome to the movement! 🎉', {
        description: 'Your profile has been created successfully.',
      });
      router.push('/volunteer/dashboard');
    },
    onError: (error: any) => {
      toast.error('Signup failed', {
        description: error.message || 'Please try again later.',
      });
    },
  });

  function onSubmit(data: SignupFormValues) {
    localStorage.setItem('volunteer_name', data.full_name);
    createVolunteer.mutate({
      full_name: data.full_name,
      email: data.email,
      bio: data.bio,
      skills: data.skills,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">MissionMatch</span>
          </Link>
          <div className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/volunteer/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
            Join the Movement
          </h1>
          <p className="text-lg text-muted-foreground">
            Create your profile and start making a difference for animals today.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription className="text-base">
              Tell us about yourself so we can match you with the perfect campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
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
                      <FormLabel>About You</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your background, why you're passionate about animal advocacy, and what you hope to accomplish..."
                          className="min-h-32 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This helps us match you with campaigns that align with your interests.
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
                      <div className="mb-4">
                        <FormLabel>Areas of Interest</FormLabel>
                        <FormDescription>
                          Select all types of advocacy work you&apos;re interested in.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {advocacyInterests.map((interest) => (
                          <FormField
                            key={interest.id}
                            control={form.control}
                            name="skills"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={interest.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(interest.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, interest.id])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== interest.id)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {interest.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={createVolunteer.isPending}>
                  {createVolunteer.isPending ? 'Creating Account...' : 'Join the Movement'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing up, you agree to receive updates about advocacy campaigns and opportunities.
        </p>
      </div>
    </div>
  );
}
