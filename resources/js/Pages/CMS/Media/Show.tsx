import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Separator } from '@/Components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Download,
  Trash2,
  Copy,
  Share,
  Image,
  FileText,
  Video,
  Calendar,
  User,
  HardDrive,
  Eye,
  ExternalLink
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Media {
  id: number;
  name: string;
  original_name: string;
  file_path: string;
  url: string;
  mime_type: string;
  size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  description?: string;
  folder_id?: number;
  folder?: {
    id: number;
    name: string;
    path: string;
  };
  created_by: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Props {
  media: Media;
  variants?: Array<{
    name: string;
    url: string;
    width: number;
    height: number;
    size: number;
  }>;
}

export default function MediaShow({ media, variants = [] }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    alt_text: media.alt_text || '',
    caption: media.caption || '',
    description: media.description || ''
  });

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        setIsEditing(true);
        break;
      case 'save':
        router.put(route('cms.media.update', media.id), formData, {
          onSuccess: () => {
            toast.success(t('cms.media_updated', 'Media updated successfully'));
            setIsEditing(false);
          },
          onError: () => {
            toast.error(t('cms.media_update_failed', 'Failed to update media'));
          }
        });
        break;
      case 'cancel':
        setFormData({
          alt_text: media.alt_text || '',
          caption: media.caption || '',
          description: media.description || ''
        });
        setIsEditing(false);
        break;
      case 'download':
        window.open(media.url, '_blank');
        break;
      case 'copy-url':
        navigator.clipboard.writeText(media.url);
        toast.success(t('cms.url_copied', 'URL copied to clipboard'));
        break;
      case 'delete':
        if (confirm(t('cms.confirm_delete_media', 'Are you sure you want to delete this media file?'))) {
          router.delete(route('cms.media.destroy', media.id), {
            onSuccess: () => {
              toast.success(t('cms.media_deleted', 'Media deleted successfully'));
              router.visit(route('cms.media.index'));
            }
          });
        }
        break;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = () => {
    if (media.mime_type.startsWith('image/')) return Image;
    if (media.mime_type.startsWith('video/')) return Video;
    return FileText;
  };

  const FileIcon = getFileIcon();

  const isImage = media.mime_type.startsWith('image/');
  const isVideo = media.mime_type.startsWith('video/');

  return (
    <AppLayout>
      <Head title={media.name} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit(route('cms.media.index'))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {media.original_name}
              </h1>
              <p className="text-muted-foreground">
                {media.description || t('cms.no_description', 'No description provided')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleAction('cancel')}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  onClick={() => handleAction('save')}
                >
                  {t('common.save', 'Save')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleAction('copy-url')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t('cms.copy_url', 'Copy URL')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAction('download')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('common.download', 'Download')}
                </Button>
                <Button
                  onClick={() => handleAction('edit')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('common.edit', 'Edit')}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileIcon className="h-5 w-5" />
                  {t('cms.media_preview', 'Media Preview')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  {isImage ? (
                    <img
                      src={media.url}
                      alt={media.alt_text || media.original_name}
                      className="max-w-full max-h-96 rounded-lg shadow-lg"
                    />
                  ) : isVideo ? (
                    <video
                      src={media.url}
                      controls
                      className="max-w-full max-h-96 rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted rounded-lg">
                      <FileIcon className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">{media.original_name}</p>
                      <p className="text-sm text-muted-foreground">{media.mime_type}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Media Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.media_details', 'Media Details')}</CardTitle>
                <CardDescription>
                  {isEditing ? t('cms.edit_media_details', 'Edit media information') : t('cms.media_information', 'Media file information')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('cms.file_name', 'File Name')}
                    </Label>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                      {media.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('cms.original_name', 'Original Name')}
                    </Label>
                    <p className="text-sm">{media.original_name}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alt_text">{t('cms.alt_text', 'Alt Text')}</Label>
                  {isEditing ? (
                    <Input
                      id="alt_text"
                      value={formData.alt_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                      placeholder={t('cms.alt_text_placeholder', 'Describe the image for accessibility')}
                    />
                  ) : (
                    <p className="text-sm bg-muted px-2 py-1 rounded">
                      {media.alt_text || t('cms.no_alt_text', 'No alt text provided')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caption">{t('cms.caption', 'Caption')}</Label>
                  {isEditing ? (
                    <Input
                      id="caption"
                      value={formData.caption}
                      onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                      placeholder={t('cms.caption_placeholder', 'Enter a caption for this media')}
                    />
                  ) : (
                    <p className="text-sm bg-muted px-2 py-1 rounded">
                      {media.caption || t('cms.no_caption', 'No caption provided')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('cms.description', 'Description')}</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('cms.description_placeholder', 'Enter a description for this media')}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm bg-muted px-2 py-1 rounded">
                      {media.description || t('cms.no_description', 'No description provided')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Image Variants */}
            {variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.image_variants', 'Image Variants')}</CardTitle>
                  <CardDescription>
                    {t('cms.image_variants_desc', 'Different sizes and formats of this image')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {variants.map((variant, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{variant.name}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={variant.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Size: {variant.width} × {variant.height}</p>
                          <p>File Size: {formatFileSize(variant.size)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.quick_actions', 'Quick Actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href={media.url} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    {t('cms.view_original', 'View Original')}
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('download')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('common.download', 'Download')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('copy-url')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t('cms.copy_url', 'Copy URL')}
                </Button>
                <Separator />
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => handleAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('common.delete', 'Delete')}
                </Button>
              </CardContent>
            </Card>

            {/* File Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.file_information', 'File Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('cms.file_size', 'File Size')}:</span>
                  <span>{formatFileSize(media.size)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('cms.mime_type', 'MIME Type')}:</span>
                  <Badge variant="outline">{media.mime_type}</Badge>
                </div>
                {media.width && media.height && (
                  <div className="flex items-center gap-2 text-sm">
                    <Image className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('cms.dimensions', 'Dimensions')}:</span>
                    <span>{media.width} × {media.height}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('cms.uploaded_by', 'Uploaded by')}:</span>
                  <span>{media.created_by.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('cms.uploaded_at', 'Uploaded')}:</span>
                  <span>{formatDate(media.created_at)}</span>
                </div>
                {media.folder && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('cms.folder', 'Folder')}:</span>
                    <span>{media.folder.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* URL Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.url_information', 'URL Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t('cms.public_url', 'Public URL')}
                  </Label>
                  <div className="mt-1 p-2 bg-muted rounded text-xs font-mono break-all">
                    {media.url}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t('cms.file_path', 'File Path')}
                  </Label>
                  <div className="mt-1 p-2 bg-muted rounded text-xs font-mono break-all">
                    {media.file_path}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
