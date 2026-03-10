'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, Download, Trash2, AlertCircle, File, Image, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import { documentApi } from '@/lib/api';
import { createBrowserClient } from '@supabase/ssr';

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [coordinatorEmail, setCoordinatorEmail] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Get coordinator email
  useState(() => {
    const getEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setCoordinatorEmail(user.email);
      }
    };
    getEmail();
  });

  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', coordinatorEmail],
    queryFn: () => documentApi.list(coordinatorEmail),
    enabled: !!coordinatorEmail,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (s3Key: string) => documentApi.delete(s3Key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !coordinatorEmail) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      await documentApi.upload(coordinatorEmail, file);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document uploaded successfully');
      // Clear input
      e.target.value = '';
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file || !coordinatorEmail) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      await documentApi.upload(coordinatorEmail, file);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document uploaded successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle download
  const handleDownload = async (s3Key: string, filename: string) => {
    try {
      const blobUrl = await documentApi.download(s3Key);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success('Download started');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg'].includes(ext || '')) {
      return <Image className="h-5 w-5" />;
    }
    if (['pdf', 'doc', 'docx'].includes(ext || '')) {
      return <File className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Documents
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Store campaign materials, training docs, and volunteer waivers in one secure place
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <span className="font-semibold text-foreground">{documents?.count || 0}</span> files
          </div>
        </div>
      </div>

      {/* Upload Zone - Sleek drag & drop */}
      <Card className="border-2 border-dashed transition-all duration-200 hover:border-purple-400 hover:bg-purple-50/50">
        <CardContent className="pt-6">
          <div
            className={`relative rounded-xl transition-all duration-200 ${
              dragActive ? 'bg-purple-100 border-purple-400' : 'bg-muted/30'
            } border-2 border-dashed p-12 text-center`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${
              dragActive ? 'text-purple-600' : 'text-muted-foreground'
            }`} />
            <h3 className="text-lg font-semibold mb-2">
              {dragActive ? 'Drop your file here' : 'Upload a document'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Drag and drop or click to browse • PDF, DOCX, DOC, TXT, PNG, JPG, JPEG • Max 10MB
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
              onChange={handleUpload}
              disabled={uploading || !coordinatorEmail}
            />
            <Button
              size="lg"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading || !coordinatorEmail}
              className="shadow-md hover:shadow-lg transition-shadow bg-purple-600 hover:bg-purple-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Choose File'}
            </Button>
            {!coordinatorEmail && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Unable to load coordinator email. Please refresh the page.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid - Modern card layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-32 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : documents?.files.length === 0 ? (
        <Card className="border-none shadow-none bg-muted/30">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
              <FileText className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Upload your first document to get started. Your files will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents?.files.map((file) => (
            <Card
              key={file.s3_key}
              className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-border/50"
            >
              <CardContent className="pt-6">
                {/* File Icon Preview */}
                <div className="flex items-center justify-center w-full h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg mb-4 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                  <div className="text-primary">
                    {getFileIcon(file.filename)}
                  </div>
                </div>

                {/* File Info */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold truncate text-sm mb-1 group-hover:text-primary transition-colors">
                      {file.filename}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatBytes(file.size)}</span>
                      <span>•</span>
                      <span>{new Date(file.last_modified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(file.s3_key, file.filename)}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete "${file.filename}"?`)) {
                          deleteMutation.mutate(file.s3_key);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
