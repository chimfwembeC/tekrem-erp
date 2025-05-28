import React, { useState } from 'react';
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
import { Badge } from '@/Components/ui/badge';
import { Folder, Tag, Trash2, Move } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface MediaFolder {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  action: 'move' | 'tag' | 'delete' | null;
  selectedCount: number;
  selectedIds: number[];
  folders: MediaFolder[];
  onActionComplete?: () => void;
}

export default function BulkActionModal({
  open,
  onClose,
  action,
  selectedCount,
  selectedIds,
  folders,
  onActionComplete
}: Props) {
  const { t } = useTranslate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [folderId, setFolderId] = useState('root');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!action) return;

    // Validation
    if (action === 'move' && !folderId) {
      toast.error(t('cms.select_folder_required', 'Please select a folder'));
      return;
    }

    if (action === 'tag' && tags.length === 0) {
      toast.error(t('cms.add_tags_required', 'Please add at least one tag'));
      return;
    }

    setIsSubmitting(true);

    const data: any = {
      action,
      media_ids: selectedIds
    };

    if (action === 'move') {
      data.folder_id = folderId && folderId !== 'root' ? parseInt(folderId) : null;
    } else if (action === 'tag') {
      data.tags = tags;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        router.post(route('cms.media.bulk-action'), data, {
          onSuccess: () => {
            let message = '';
            switch (action) {
              case 'move':
                message = t('cms.media_moved', 'Media files moved successfully');
                break;
              case 'tag':
                message = t('cms.media_tagged', 'Media files tagged successfully');
                break;
              case 'delete':
                message = t('cms.media_deleted', 'Media files deleted successfully');
                break;
            }
            toast.success(message);
            onActionComplete?.();
            resolve();
          },
          onError: (errors) => {
            const errorMessage = Object.values(errors).flat().join(', ');
            toast.error(errorMessage || t('cms.bulk_action_failed', 'Bulk action failed'));
            reject(errors);
          }
        });
      });

      handleClose();
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFolderId('root');
      setTags([]);
      setNewTag('');
      onClose();
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case 'move': return <Move className="h-5 w-5" />;
      case 'tag': return <Tag className="h-5 w-5" />;
      case 'delete': return <Trash2 className="h-5 w-5" />;
      default: return null;
    }
  };

  const getActionTitle = () => {
    switch (action) {
      case 'move': return t('cms.move_media', 'Move Media');
      case 'tag': return t('cms.tag_media', 'Tag Media');
      case 'delete': return t('cms.delete_media', 'Delete Media');
      default: return '';
    }
  };

  const getActionDescription = () => {
    switch (action) {
      case 'move':
        return t('cms.move_media_description', `Move ${selectedCount} selected media files to a folder`);
      case 'tag':
        return t('cms.tag_media_description', `Add tags to ${selectedCount} selected media files`);
      case 'delete':
        return t('cms.delete_media_description', `Permanently delete ${selectedCount} selected media files`);
      default: return '';
    }
  };

  if (!action) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getActionIcon()}
            {getActionTitle()}
          </DialogTitle>
          <DialogDescription>
            {getActionDescription()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {action === 'move' && (
            <div className="space-y-2">
              <Label htmlFor="folder">{t('cms.destination_folder', 'Destination Folder')} *</Label>
              <Select value={folderId} onValueChange={setFolderId} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cms.select_folder', 'Select folder')} />
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
          )}

          {action === 'tag' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-tag">{t('cms.add_tags', 'Add Tags')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder={t('cms.enter_tag', 'Enter tag')}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={!newTag.trim() || isSubmitting}
                  >
                    {t('cms.add', 'Add')}
                  </Button>
                </div>
              </div>

              {tags.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('cms.selected_tags', 'Selected Tags')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                          disabled={isSubmitting}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {action === 'delete' && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                {t('cms.delete_warning', 'Warning: This action cannot be undone!')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('cms.delete_confirmation', `${selectedCount} media files will be permanently deleted.`)}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant={action === 'delete' ? 'destructive' : 'default'}
            >
              {isSubmitting
                ? t('cms.processing', 'Processing...')
                : getActionTitle()
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
