import React, { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Progress } from '@/Components/ui/progress';
import { Upload, X, File, Image, Video, FileText } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface MediaFolder {
  id: number;
  name: string;
  parent_id?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  folders: MediaFolder[];
  currentFolderId?: number;
  onUploadComplete?: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function UploadModal({
  open,
  onClose,
  folders,
  currentFolderId,
  onUploadComplete
}: Props) {
  const { t } = useTranslate();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [folderId, setFolderId] = useState<string>(currentFolderId?.toString() || 'root');
  const [optimize, setOptimize] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newFiles: UploadFile[] = selectedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending'
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    const newFiles: UploadFile[] = droppedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending'
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();

    files.forEach(({ file }) => {
      formData.append('files[]', file);
    });

    if (folderId && folderId !== 'root') {
      formData.append('folder_id', folderId);
    }

    formData.append('optimize', optimize ? '1' : '0');

    try {
      await new Promise<void>((resolve, reject) => {
        router.post(route('cms.media.upload'), formData, {
          onProgress: (progress) => {
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            setFiles(prev => prev.map(file => ({
              ...file,
              progress: percentage,
              status: 'uploading' as const
            })));
          },
          onSuccess: () => {
            setFiles(prev => prev.map(file => ({
              ...file,
              progress: 100,
              status: 'completed' as const
            })));
            toast.success(t('cms.files_uploaded', 'Files uploaded successfully'));
            onUploadComplete?.();
            resolve();
          },
          onError: (errors) => {
            setFiles(prev => prev.map(file => ({
              ...file,
              status: 'error' as const,
              error: Object.values(errors).flat().join(', ')
            })));
            toast.error(t('cms.upload_failed', 'Upload failed'));
            reject(errors);
          }
        });
      });

      // Close modal after successful upload
      setTimeout(() => {
        handleClose();
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFiles([]);
      setFolderId(currentFolderId?.toString() || '');
      setOptimize(true);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t('cms.upload_media', 'Upload Media')}
          </DialogTitle>
          <DialogDescription>
            {t('cms.upload_description', 'Upload images, videos, and documents to your media library')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Settings */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="folder">{t('cms.folder', 'Folder')}</Label>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cms.select_folder', 'Select folder (optional)')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">{t('cms.root_folder', 'Root Folder')}</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="optimize"
                checked={optimize}
                onCheckedChange={(checked) => setOptimize(checked as boolean)}
              />
              <Label htmlFor="optimize" className="text-sm">
                {t('cms.optimize_images', 'Optimize images')}
              </Label>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {t('cms.drop_files', 'Drop files here or click to browse')}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {t('cms.supported_formats', 'Supports images, videos, and documents up to 10MB')}
            </p>
            <Input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                {t('cms.browse_files', 'Browse Files')}
              </label>
            </Button>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">{t('cms.selected_files', 'Selected Files')}</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((uploadFile) => (
                  <div key={uploadFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {getFileIcon(uploadFile.file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                      {uploadFile.status === 'uploading' && (
                        <Progress value={uploadFile.progress} className="mt-1" />
                      )}
                      {uploadFile.status === 'error' && uploadFile.error && (
                        <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>
                      )}
                    </div>
                    {uploadFile.status === 'completed' && (
                      <div className="text-green-500">✓</div>
                    )}
                    {uploadFile.status !== 'uploading' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={files.length === 0 || isUploading}
            >
              {isUploading ? t('cms.uploading', 'Uploading...') : t('cms.upload', 'Upload')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
