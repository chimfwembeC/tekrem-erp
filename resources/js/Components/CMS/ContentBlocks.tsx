import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  Plus,
  GripVertical,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Image,
  Type,
  Video,
  Quote,
  List,
  Code,
  Columns
} from 'lucide-react';
import MediaPicker from './MediaPicker';
import useTranslate from '@/Hooks/useTranslate';

interface ContentBlock {
  id: string;
  type: string;
  data: any;
  settings?: any;
}

interface Props {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  readonly?: boolean;
}

const blockTypes = [
  { type: 'text', label: 'Text Block', icon: Type },
  { type: 'image', label: 'Image', icon: Image },
  { type: 'video', label: 'Video', icon: Video },
  { type: 'quote', label: 'Quote', icon: Quote },
  { type: 'list', label: 'List', icon: List },
  { type: 'code', label: 'Code', icon: Code },
  { type: 'columns', label: 'Columns', icon: Columns },
];

export default function ContentBlocks({ blocks, onChange, readonly = false }: Props) {
  const { t } = useTranslate();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);

  const addBlock = (type: string) => {
    const newBlock: ContentBlock = {
      id: `block_${Date.now()}`,
      type,
      data: getDefaultBlockData(type),
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, data: any) => {
    const updatedBlocks = blocks.map(block =>
      block.id === id ? { ...block, data: { ...block.data, ...data } } : block
    );
    onChange(updatedBlocks);
  };

  const duplicateBlock = (index: number) => {
    const blockToDuplicate = blocks[index];
    const newBlock: ContentBlock = {
      ...blockToDuplicate,
      id: `block_${Date.now()}`,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onChange(newBlocks);
  };

  const deleteBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChange(newBlocks);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    onChange(newBlocks);
  };

  const getDefaultBlockData = (type: string) => {
    switch (type) {
      case 'text':
        return { content: '', alignment: 'left' };
      case 'image':
        return { url: '', alt: '', caption: '', alignment: 'center' };
      case 'video':
        return { url: '', caption: '', autoplay: false };
      case 'quote':
        return { text: '', author: '', source: '' };
      case 'list':
        return { items: [''], type: 'unordered' };
      case 'code':
        return { code: '', language: 'javascript' };
      case 'columns':
        return { columns: [{ content: '' }, { content: '' }] };
      default:
        return {};
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveBlock(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const renderBlockEditor = (block: ContentBlock, index: number) => {
    const isEditing = editingBlock === block.id;

    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-3">
            <Textarea
              value={block.data.content || ''}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder={t('cms.enter_text_content', 'Enter text content...')}
              rows={4}
            />
            <Select
              value={block.data.alignment || 'left'}
              onValueChange={(value) => updateBlock(block.id, { alignment: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">{t('cms.align_left', 'Left')}</SelectItem>
                <SelectItem value="center">{t('cms.align_center', 'Center')}</SelectItem>
                <SelectItem value="right">{t('cms.align_right', 'Right')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={block.data.url || ''}
                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                placeholder={t('cms.image_url', 'Image URL')}
              />
              <Button
                variant="outline"
                onClick={() => setShowMediaPicker(true)}
              >
                <Image className="h-4 w-4 mr-2" />
                {t('cms.browse', 'Browse')}
              </Button>
            </div>
            <Input
              value={block.data.alt || ''}
              onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
              placeholder={t('cms.alt_text', 'Alt text')}
            />
            <Input
              value={block.data.caption || ''}
              onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
              placeholder={t('cms.caption', 'Caption')}
            />
            {block.data.url && (
              <div className="mt-2">
                <img
                  src={block.data.url}
                  alt={block.data.alt}
                  className="max-w-full h-auto rounded border"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            )}
          </div>
        );

      case 'quote':
        return (
          <div className="space-y-3">
            <Textarea
              value={block.data.text || ''}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              placeholder={t('cms.quote_text', 'Quote text...')}
              rows={3}
            />
            <Input
              value={block.data.author || ''}
              onChange={(e) => updateBlock(block.id, { author: e.target.value })}
              placeholder={t('cms.author', 'Author')}
            />
            <Input
              value={block.data.source || ''}
              onChange={(e) => updateBlock(block.id, { source: e.target.value })}
              placeholder={t('cms.source', 'Source')}
            />
          </div>
        );

      case 'list':
        return (
          <div className="space-y-3">
            <Select
              value={block.data.type || 'unordered'}
              onValueChange={(value) => updateBlock(block.id, { type: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unordered">{t('cms.bullet_list', 'Bullet List')}</SelectItem>
                <SelectItem value="ordered">{t('cms.numbered_list', 'Numbered List')}</SelectItem>
              </SelectContent>
            </Select>
            <div className="space-y-2">
              {(block.data.items || ['']).map((item: string, itemIndex: number) => (
                <div key={itemIndex} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(block.data.items || [''])];
                      newItems[itemIndex] = e.target.value;
                      updateBlock(block.id, { items: newItems });
                    }}
                    placeholder={`${t('cms.item', 'Item')} ${itemIndex + 1}`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItems = (block.data.items || ['']).filter((_: any, i: number) => i !== itemIndex);
                      updateBlock(block.id, { items: newItems });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newItems = [...(block.data.items || ['']), ''];
                  updateBlock(block.id, { items: newItems });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('cms.add_item', 'Add Item')}
              </Button>
            </div>
          </div>
        );

      case 'code':
        return (
          <div className="space-y-3">
            <Select
              value={block.data.language || 'javascript'}
              onValueChange={(value) => updateBlock(block.id, { language: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={block.data.code || ''}
              onChange={(e) => updateBlock(block.id, { code: e.target.value })}
              placeholder={t('cms.enter_code', 'Enter code...')}
              rows={6}
              className="font-mono"
            />
          </div>
        );

      default:
        return (
          <div className="text-center py-4 text-muted-foreground">
            {t('cms.unsupported_block_type', 'Unsupported block type')}: {block.type}
          </div>
        );
    }
  };

  const renderBlockPreview = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <div className={`text-${block.data.alignment || 'left'}`}>
            {block.data.content || t('cms.empty_text_block', 'Empty text block')}
          </div>
        );

      case 'image':
        return block.data.url ? (
          <div className="text-center">
            <img
              src={block.data.url}
              alt={block.data.alt}
              className="max-w-full h-auto rounded"
              style={{ maxHeight: '200px' }}
            />
            {block.data.caption && (
              <p className="text-sm text-muted-foreground mt-2">{block.data.caption}</p>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded">
            <Image className="h-8 w-8 mx-auto mb-2" />
            {t('cms.no_image_selected', 'No image selected')}
          </div>
        );

      case 'quote':
        return (
          <blockquote className="border-l-4 border-primary pl-4 italic">
            <p>"{block.data.text || t('cms.empty_quote', 'Empty quote')}"</p>
            {(block.data.author || block.data.source) && (
              <footer className="text-sm text-muted-foreground mt-2">
                — {block.data.author} {block.data.source && `(${block.data.source})`}
              </footer>
            )}
          </blockquote>
        );

      case 'list':
        const ListComponent = block.data.type === 'ordered' ? 'ol' : 'ul';
        return (
          <ListComponent className={block.data.type === 'ordered' ? 'list-decimal list-inside' : 'list-disc list-inside'}>
            {(block.data.items || ['']).map((item: string, index: number) => (
              <li key={index}>{item || t('cms.empty_item', 'Empty item')}</li>
            ))}
          </ListComponent>
        );

      case 'code':
        return (
          <div className="bg-gray-100 rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">{block.data.language}</Badge>
            </div>
            <pre className="text-sm overflow-x-auto">
              <code>{block.data.code || t('cms.empty_code_block', 'Empty code block')}</code>
            </pre>
          </div>
        );

      default:
        return (
          <div className="text-center py-4 text-muted-foreground">
            {t('cms.unsupported_block_type', 'Unsupported block type')}: {block.type}
          </div>
        );
    }
  };

  if (readonly) {
    return (
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={block.id} className="border rounded-lg p-4">
            {renderBlockPreview(block)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <Card
          key={block.id}
          className="group"
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                <CardTitle className="text-sm">
                  {blockTypes.find(bt => bt.type === block.type)?.label || block.type}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {block.type}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingBlock(editingBlock === block.id ? null : block.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => duplicateBlock(index)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteBlock(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {editingBlock === block.id ? (
              renderBlockEditor(block, index)
            ) : (
              renderBlockPreview(block)
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add Block Button */}
      <Card className="border-dashed">
        <CardContent className="py-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {t('cms.add_content_block', 'Add Content Block')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {blockTypes.map((blockType) => {
                const IconComponent = blockType.icon;
                return (
                  <DropdownMenuItem
                    key={blockType.type}
                    onClick={() => addBlock(blockType.type)}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {blockType.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPicker
          onSelect={(media) => {
            // Handle media selection
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
