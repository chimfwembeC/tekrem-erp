import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  Upload,
  Search,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  Edit,
  Eye,
  Download,
  Trash2,
  Image,
  Video,
  FileText,
  Folder,
  FolderPlus,
  ArrowUp
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
  uploaded_by: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface MediaFolder {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  media_count: number;
  created_at: string;
}

interface Props {
  media: {
    data: Media[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  folders: MediaFolder[];
  currentFolder?: MediaFolder;
  breadcrumbs: Array<{ id: number; name: string }>;
  statistics: {
    total_files: number;
    total_size: number;
    images: number;
    videos: number;
    documents: number;
  };
  filters?: {
    search?: string;
    type?: string;
    folder?: string;
  };
}

export default function MediaIndex({
  media,
  folders,
  currentFolder,
  breadcrumbs,
  statistics,
  filters
}: Props) {
  const { t } = useTranslate();
  const [selectedMedia, setSelectedMedia] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(filters?.search || '');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleSearch = () => {
    router.get(route('cms.media.index'), {
      ...(filters || {}),
      search: searchQuery,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilter = (key: string, value: string) => {
    router.get(route('cms.media.index'), {
      ...(filters || {}),
      [key]: value || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFolderNavigation = (folderId?: number) => {
    router.get(route('cms.media.index'), {
      ...(filters || {}),
      folder: folderId || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleBulkAction = (action: string) => {
    if (selectedMedia.length === 0) return;

    router.post(route('cms.media.bulk-action'), {
      action,
      media_ids: selectedMedia,
    }, {
      onSuccess: () => {
        setSelectedMedia([]);
      },
    });
  };

  const handleMediaAction = (mediaId: number, action: string) => {
    switch (action) {
      case 'edit':
        router.visit(route('cms.media.show', mediaId));
        break;
      case 'download':
        window.open(route('cms.media.download', mediaId), '_blank');
        break;
      case 'delete':
        if (confirm(t('cms.confirm_delete_media', 'Are you sure you want to delete this media?'))) {
          router.delete(route('cms.media.destroy', mediaId));
        }
        break;
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <AppLayout>
      <Head title={t('cms.media', 'Media Library')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('cms.media', 'Media Library')}
            </h1>
            <p className="text-muted-foreground">
              {t('cms.media_description', 'Manage your media files and assets')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowUploadModal(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              {t('cms.create_folder', 'Create Folder')}
            </Button>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="h-4 w-4 mr-2" />
              {t('cms.upload_media', 'Upload Media')}
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('cms.total_files', 'Total Files')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_files}</div>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(statistics.total_size)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('cms.images', 'Images')}</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.images}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('cms.videos', 'Videos')}</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.videos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('cms.documents', 'Documents')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.documents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('cms.folders', 'Folders')}</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{folders.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFolderNavigation()}
              className="h-auto p-1"
            >
              {t('cms.all_media', 'All Media')}
            </Button>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <span className="text-muted-foreground">/</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFolderNavigation(crumb.id)}
                  className="h-auto p-1"
                >
                  {crumb.name}
                </Button>
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('common.filters', 'Filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex gap-2 flex-1 min-w-64">
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

              <Select value={filters?.type || 'all'} onValueChange={(value) => handleFilter('type', value === 'all' ? '' : value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('cms.all_types', 'All types')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('cms.all_types', 'All types')}</SelectItem>
                  <SelectItem value="image">{t('cms.images', 'Images')}</SelectItem>
                  <SelectItem value="video">{t('cms.videos', 'Videos')}</SelectItem>
                  <SelectItem value="document">{t('cms.documents', 'Documents')}</SelectItem>
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
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedMedia.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedMedia.length} {t('cms.items_selected', 'items selected')}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('move')}>
                    <Folder className="h-4 w-4 mr-2" />
                    {t('cms.move', 'Move')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('tag')}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t('cms.tag', 'Tag')}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('common.delete', 'Delete')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Folders */}
        {folders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('cms.folders', 'Folders')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {currentFolder?.parent_id && (
                  <div
                    className="flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => handleFolderNavigation(currentFolder.parent_id)}
                  >
                    <ArrowUp className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-center">...</span>
                  </div>
                )}
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => handleFolderNavigation(folder.id)}
                  >
                    <Folder className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm text-center font-medium">{folder.name}</span>
                    <span className="text-xs text-muted-foreground">{folder.media_count} files</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Media Grid/List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('cms.media_files', 'Media Files')}</CardTitle>
            <CardDescription>
              {media.total || 0} {t('cms.total_files', 'total files')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {media.data.map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="aspect-square border rounded-lg overflow-hidden bg-gray-50">
                      <Checkbox
                        checked={selectedMedia.includes(item.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMedia(prev => [...prev, item.id]);
                          } else {
                            setSelectedMedia(prev => prev.filter(id => id !== item.id));
                          }
                        }}
                        className="absolute top-2 left-2 z-10"
                      />

                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.alt_text || item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getMediaIcon(item.type)}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleMediaAction(item.id, 'edit')}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t('common.edit', 'Edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMediaAction(item.id, 'download')}>
                              <Download className="h-4 w-4 mr-2" />
                              {t('common.download', 'Download')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleMediaAction(item.id, 'delete')}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('common.delete', 'Delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm font-medium truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.human_file_size}
                      </p>
                      {item.dimensions && (
                        <p className="text-xs text-muted-foreground">
                          {item.dimensions.width} × {item.dimensions.height}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {media.data.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Checkbox
                      checked={selectedMedia.includes(item.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMedia(prev => [...prev, item.id]);
                        } else {
                          setSelectedMedia(prev => prev.filter(id => id !== item.id));
                        }
                      }}
                    />

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
                      <p className="text-xs text-muted-foreground">
                        {t('cms.uploaded_by', 'Uploaded by')} {item.uploaded_by.name}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleMediaAction(item.id, 'edit')}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t('common.edit', 'Edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMediaAction(item.id, 'download')}>
                          <Download className="h-4 w-4 mr-2" />
                          {t('common.download', 'Download')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleMediaAction(item.id, 'delete')}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('common.delete', 'Delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}

            {media.data.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  {t('cms.no_media_found', 'No media files found')}
                </p>
                <p className="text-sm">
                  {t('cms.upload_first_media', 'Upload your first media file to get started')}
                </p>
                <Button className="mt-4" onClick={() => setShowUploadModal(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('cms.upload_media', 'Upload Media')}
                </Button>
              </div>
            )}

            {/* Pagination */}
            {media.links && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {media.from || 0} to {media.to || 0} of {media.total || 0} results
                </div>
                <div className="flex gap-2">
                  {media.links.map((link: any, index: number) => (
                    <Button
                      key={index}
                      variant={link.active ? 'default' : 'outline'}
                      size="sm"
                      disabled={!link.url}
                      onClick={() => link.url && router.visit(link.url)}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
