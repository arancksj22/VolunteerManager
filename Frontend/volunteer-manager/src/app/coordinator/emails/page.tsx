'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Mail, Send, Users, FileText, Heart, Clock, Megaphone,
  CheckCircle2, XCircle, Loader2,
} from 'lucide-react';
import { volunteerApi, emailApi } from '@/lib/api';
import { toast } from 'sonner';

const templates = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Welcome new volunteers to the platform',
    icon: Heart,
    color: 'text-pink-600 bg-pink-100',
  },
  {
    id: 'reminder',
    name: 'Activity Reminder',
    description: 'Remind inactive volunteers to come back',
    icon: Clock,
    color: 'text-amber-600 bg-amber-100',
  },
  {
    id: 'thankyou',
    name: 'Thank You',
    description: 'Thank volunteers for their contributions',
    icon: CheckCircle2,
    color: 'text-emerald-600 bg-emerald-100',
  },
  {
    id: 'event',
    name: 'Campaign Announcement',
    description: 'Announce a new campaign to volunteers',
    icon: Megaphone,
    color: 'text-purple-600 bg-purple-100',
  },
];

export default function EmailsPage() {
  const [mode, setMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [eventName, setEventName] = useState('');
  const [sentHistory, setSentHistory] = useState<Array<{
    timestamp: string;
    subject: string;
    recipientCount: number;
    status: 'success' | 'failed';
  }>>([]);

  const { data: volunteers } = useQuery({
    queryKey: ['volunteers'],
    queryFn: volunteerApi.getAll,
  });

  const sendTemplateMutation = useMutation({
    mutationFn: (data: { to_emails: string[]; template: string; volunteer_name?: string; custom_message?: string; event_name?: string }) =>
      emailApi.sendTemplate(data),
    onSuccess: (_, variables) => {
      toast.success(`Email sent to ${variables.to_emails.length} volunteer(s)!`);
      setSentHistory(prev => [{
        timestamp: new Date().toISOString(),
        subject: templates.find(t => t.id === variables.template)?.name || 'Template Email',
        recipientCount: variables.to_emails.length,
        status: 'success',
      }, ...prev]);
      setSelectedVolunteers([]);
      setSelectAll(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setSentHistory(prev => [{
        timestamp: new Date().toISOString(),
        subject: 'Failed to send',
        recipientCount: selectedVolunteers.length,
        status: 'failed',
      }, ...prev]);
    },
  });

  const sendCustomMutation = useMutation({
    mutationFn: (data: { to_emails: string[]; subject: string; html_content: string }) =>
      emailApi.sendCustom(data),
    onSuccess: (_, variables) => {
      toast.success(`Custom email sent to ${variables.to_emails.length} volunteer(s)!`);
      setSentHistory(prev => [{
        timestamp: new Date().toISOString(),
        subject: variables.subject,
        recipientCount: variables.to_emails.length,
        status: 'success',
      }, ...prev]);
      setSelectedVolunteers([]);
      setSelectAll(false);
      setCustomSubject('');
      setCustomMessage('');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedVolunteers([]);
      setSelectAll(false);
    } else {
      setSelectedVolunteers(volunteers?.map(v => v.email) || []);
      setSelectAll(true);
    }
  };

  const toggleVolunteer = (email: string) => {
    setSelectedVolunteers(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleSendTemplate = () => {
    if (!selectedTemplate || selectedVolunteers.length === 0) {
      toast.error('Select a template and at least one recipient');
      return;
    }
    sendTemplateMutation.mutate({
      to_emails: selectedVolunteers,
      template: selectedTemplate,
      custom_message: customMessage,
      event_name: eventName,
    });
  };

  const handleSendCustom = () => {
    if (!customSubject || !customMessage || selectedVolunteers.length === 0) {
      toast.error('Fill in all fields and select at least one recipient');
      return;
    }
    sendCustomMutation.mutate({
      to_emails: selectedVolunteers,
      subject: customSubject,
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">${customSubject}</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #374151; white-space: pre-wrap;">${customMessage}</p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">— The MissionMatch Team</p>
          </div>
        </div>
      `,
    });
  };

  const isSending = sendTemplateMutation.isPending || sendCustomMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Volunteers</h1>
        <p className="text-muted-foreground mt-1">
          Send notifications, reminders, and updates to your volunteers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Compose */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
            <Button
              variant={mode === 'template' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('template')}
              className={mode === 'template' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
            >
              <FileText className="h-4 w-4 mr-1" />
              Templates
            </Button>
            <Button
              variant={mode === 'custom' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('custom')}
              className={mode === 'custom' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
            >
              <Mail className="h-4 w-4 mr-1" />
              Custom Email
            </Button>
          </div>

          {/* Template Mode */}
          {mode === 'template' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`
                      text-left p-4 rounded-xl border-2 transition-all
                      ${selectedTemplate === template.id
                        ? 'border-purple-500 bg-purple-50/50 shadow-md'
                        : 'border-border hover:border-purple-200 hover:bg-muted/50'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${template.color}`}>
                        <template.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedTemplate === 'event' && (
                <div>
                  <Label>Campaign Name</Label>
                  <Input
                    placeholder="e.g. Beach Cleanup 2026"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label>Personal Message (optional)</Label>
                <Textarea
                  placeholder="Add a custom message to include in the template..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSendTemplate}
                disabled={!selectedTemplate || selectedVolunteers.length === 0 || isSending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send to {selectedVolunteers.length} Volunteer{selectedVolunteers.length !== 1 ? 's' : ''}
              </Button>
            </div>
          )}

          {/* Custom Mode */}
          {mode === 'custom' && (
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Input
                  placeholder="Email subject line..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Message</Label>
                <Textarea
                  placeholder="Write your email message here..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="mt-1"
                  rows={8}
                />
              </div>

              <Button
                onClick={handleSendCustom}
                disabled={!customSubject || !customMessage || selectedVolunteers.length === 0 || isSending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Custom Email to {selectedVolunteers.length} Volunteer{selectedVolunteers.length !== 1 ? 's' : ''}
              </Button>
            </div>
          )}

          {/* Send History */}
          {sentHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Send History</CardTitle>
                <CardDescription>Emails sent this session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sentHistory.map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {entry.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                      )}
                      <span className="font-medium truncate">{entry.subject}</span>
                      <Badge variant="outline" className="shrink-0 ml-auto">
                        {entry.recipientCount} recipient{entry.recipientCount !== 1 ? 's' : ''}
                      </Badge>
                      <span className="text-muted-foreground text-xs shrink-0">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Recipients */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-base">Recipients</CardTitle>
              </div>
              <Badge variant="outline" className="text-purple-700 border-purple-200">
                {selectedVolunteers.length} selected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Select All */}
              <div className="flex items-center gap-2 pb-3 border-b">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                />
                <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All ({volunteers?.length || 0})
                </Label>
              </div>

              {/* Volunteer List */}
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {volunteers?.map((vol) => (
                  <div key={vol.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedVolunteers.includes(vol.email)}
                      onCheckedChange={() => toggleVolunteer(vol.email)}
                      id={`vol-${vol.id}`}
                    />
                    <Label htmlFor={`vol-${vol.id}`} className="text-sm cursor-pointer flex-1 truncate">
                      <span className="font-medium">{vol.full_name}</span>
                      <span className="text-muted-foreground ml-1 text-xs">({vol.email})</span>
                    </Label>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Loading volunteers...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
