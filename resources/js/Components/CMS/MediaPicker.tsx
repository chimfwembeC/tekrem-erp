import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Image,
  Video,
  FileText,
  Folder,
  Check,
  X
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface Media {
  id: number;
  name: string;
  original_name: string;
  file_path: string;
  url: string;
  mime_type: string;
  file_size: number;
  human_file_size: string;
  dimensions?: {
    width: number;
    height: number;
  };
  alt_text?: string;
  description?: string;
  tags?: string[];
  type: 'image' | 'video' | 'document';
  created_at: string;
}

interface MediaFolder {
  id: number;
  name: string;
  parent_id?: number;
}

interface Props {
  isOpen?: boolean;
  onSelect: (media: Media) => void;
  onClose: () => void;
  type?: 'image' | 'video' | 'document' | 'all';
  multiple?: boolean;
  maxSelection?: number;
  className?: string;
}

export default function MediaPicker({
  isOpen = true,
  onSelect,
  onClose,
  type = 'all',
  multiple = false,
  maxSelection = 10,
  className = ''
}: Props) {
  const { t } = useTranslate();
  const [media, setMedia] = useState<Media[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, currentFolder, type]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type !== 'all') params.append('type', type);
      if (currentFolder) params.append('folder_id', currentFolder.toString());

      const response = await fetch(`/cms/media/picker?${params}`);
      const data = await response.json();
      
      setMedia(data.media || []);
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMedia();
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        ...(type !== 'all' && { type }),
        ...(currentFolder && { folder_id: currentFolder.toString() })
      });

      const response = await fetch(`/cms/media/search?${params}`);
      const data = await response.json();
      
      setMedia(data.results || []);
    } catch (error) {
      console.error('Failed to search media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files[]', file);
      });
      if (currentFolder) {
        formData.append('folder_id', currentFolder.toString());
      }

      const response = await fetch('/cms/media/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        fetchMedia(); // Refresh media list
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleMediaSelect = (mediaItem: Media) => {
    if (multiple) {
      const isSelected = selectedMedia.some(m => m.id === mediaItem.id);
      if (isSelected) {
        setSelectedMedia(prev => prev.filter(m => m.id !== mediaItem.id));
      } else if (selectedMedia.length < maxSelection) {
        setSelectedMedia(prev => [...prev, mediaItem]);
      }
    } else {
      onSelect(mediaItem);
    }
  };

  const handleConfirmSelection = () => {
    if (multiple && selectedMedia.length > 0) {
      selectedMedia.forEach(media => onSelect(media));
    }
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredMedia = media.filter(item => {
    if (type !== 'all' && item.type !== type) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-6xl max-h-[80vh] ${className}`}>
        <DialogHeader>
          <DialogTitle>{t('cms.select_media', 'Select Media')}</DialogTitle>
          <DialogDescription>
            {multiple 
              ? t('cms.select_multiple_media', 'Select one or more media files')
              : t('cms.select_single_media', 'Select a media file')
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList>
            <TabsTrigger value="browse">{t('cms.browse', 'Browse')}</TabsTrigger>
            <TabsTrigger value="upload">{t('cms.upload', 'Upload')}</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder={t('cms.search_media', 'Search media...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <Select value={currentFolder?.toString() || ''} onValueChange={(value) => setCurrentFolder(value ? parseInt(value) : null)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('cms.all_folders', 'All folders')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('cms.all_folders', 'All folders')}</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Media Grid/List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {filteredMedia.map((item) => {
                    const isSelected = multiple && selectedMedia.some(m => m.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                          isSelected ? 'border-primary' : 'border-transparent hover:border-gray-300'
                        }`}
                        onClick={() => handleMediaSelect(item)}
                      >
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={item.alt_text || item.name}
                            className="w-full h-20 object-cover"
                          />
                        ) : (
                          <div className="w-full h-20 bg-gray-100 flex items-center justify-center">
                            {getMediaIcon(item.type)}
                          </div>
                        )}
                        
                        {multiple && isSelected && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        
                        <div className="p-2">
                          <p className="text-xs truncate" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.human_file_size}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMedia.map((item) => {
                    const isSelected = multiple && selectedMedia.some(m => m.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleMediaSelect(item)}
                      >
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={item.alt_text || item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            {getMediaIcon(item.type)}
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.human_file_size} • {item.mime_type}
                          </p>
                          {item.dimensions && (
                            <p className="text-xs text-muted-foreground">
                              {item.dimensions.width} × {item.dimensions.height}
                            </p>
                          )}
                        </div>
                        
                        {multiple && isSelected && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && filteredMedia.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('cms.no_media_found', 'No media files found')}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
              onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  handleFileUpload(files);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {t('cms.drop_files_here', 'Drop files here')}
              </p>
              <p className="text-muted-foreground mb-4">
                {t('cms.or_click_to_browse', 'or click to browse')}
              </p>
              <input
                type="file"
                multiple
                accept={type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : '*/*'}
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files);
                  }
                }}
                className="hidden"
                id="file-upload"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  {t('cms.choose_files', 'Choose Files')}
                </label>
              </Button>
            </div>

            {uploading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                <span>{t('cms.uploading', 'Uploading...')}</span>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            {multiple && selectedMedia.length > 0 && (
              <Badge variant="secondary">
                {selectedMedia.length} {t('cms.selected', 'selected')}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              {t('common.cancel', 'Cancel')}
            </Button>
            {multiple && (
              <Button 
                onClick={handleConfirmSelection}
                disabled={selectedMedia.length === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                {t('cms.select_files', 'Select Files')} ({selectedMedia.length})
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
