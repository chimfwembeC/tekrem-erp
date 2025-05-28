import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { FolderPlus, Folder } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface MediaFolder {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  folders: MediaFolder[];
  currentFolderId?: number;
  editFolder?: MediaFolder;
  onFolderCreated?: () => void;
}

export default function FolderModal({
  open,
  onClose,
  folders,
  currentFolderId,
  editFolder,
  onFolderCreated
}: Props) {
  const { t } = useTranslate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: currentFolderId?.toString() || 'root'
  });

  useEffect(() => {
    if (editFolder) {
      setFormData({
        name: editFolder.name,
        description: editFolder.description || '',
        parent_id: editFolder.parent_id?.toString() || 'root'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        parent_id: currentFolderId?.toString() || 'root'
      });
    }
  }, [editFolder, currentFolderId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t('cms.folder_name_required', 'Folder name is required'));
      return;
    }

    setIsSubmitting(true);

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      parent_id: formData.parent_id && formData.parent_id !== 'root' ? parseInt(formData.parent_id) : null
    };

    try {
      if (editFolder) {
        // Update existing folder
        await new Promise<void>((resolve, reject) => {
          router.put(route('cms.media.folders.update', editFolder.id), data, {
            onSuccess: () => {
              toast.success(t('cms.folder_updated', 'Folder updated successfully'));
              onFolderCreated?.();
              resolve();
            },
            onError: (errors) => {
              const errorMessage = Object.values(errors).flat().join(', ');
              toast.error(errorMessage || t('cms.folder_update_failed', 'Failed to update folder'));
              reject(errors);
            }
          });
        });
      } else {
        // Create new folder
        await new Promise<void>((resolve, reject) => {
          router.post(route('cms.media.folders.create'), data, {
            onSuccess: () => {
              toast.success(t('cms.folder_created', 'Folder created successfully'));
              onFolderCreated?.();
              resolve();
            },
            onError: (errors) => {
              const errorMessage = Object.values(errors).flat().join(', ');
              toast.error(errorMessage || t('cms.folder_creation_failed', 'Failed to create folder'));
              reject(errors);
            }
          });
        });
      }

      handleClose();
    } catch (error) {
      console.error('Folder operation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        description: '',
        parent_id: currentFolderId?.toString() || 'root'
      });
      onClose();
    }
  };

  // Filter out the current folder and its children from parent options when editing
  const availableParentFolders = editFolder
    ? folders.filter(folder => folder.id !== editFolder.id)
    : folders;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editFolder ? <Folder className="h-5 w-5" /> : <FolderPlus className="h-5 w-5" />}
            {editFolder
              ? t('cms.edit_folder', 'Edit Folder')
              : t('cms.create_folder', 'Create Folder')
            }
          </DialogTitle>
          <DialogDescription>
            {editFolder
              ? t('cms.edit_folder_description', 'Update folder information')
              : t('cms.create_folder_description', 'Create a new folder to organize your media files')
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('cms.folder_name', 'Folder Name')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('cms.folder_name_placeholder', 'Enter folder name')}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('cms.description', 'Description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('cms.folder_description_placeholder', 'Enter folder description (optional)')}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">{t('cms.parent_folder', 'Parent Folder')}</Label>
            <Select
              value={formData.parent_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value }))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('cms.select_parent_folder', 'Select parent folder (optional)')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">{t('cms.root_folder', 'Root Folder')}</SelectItem>
                {availableParentFolders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id.toString()}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? (editFolder ? t('cms.updating', 'Updating...') : t('cms.creating', 'Creating...'))
                : (editFolder ? t('common.update', 'Update') : t('common.create', 'Create'))
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
