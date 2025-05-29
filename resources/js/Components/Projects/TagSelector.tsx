import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent } from '@/Components/ui/card';
import { X, Plus, Tag as TagIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tag {
  id: number;
  name: string;
  color?: string;
  slug?: string;
}

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTags: (Tag | string)[];
  onTagsChange: (tags: (Tag | string)[]) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export default function TagSelector({
  availableTags,
  selectedTags,
  onTagsChange,
  placeholder = "Search or create tags...",
  className,
  error
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter available tags based on search term and exclude already selected ones
  const filteredTags = availableTags.filter(tag => {
    const isAlreadySelected = selectedTags.some(selectedTag => 
      typeof selectedTag === 'object' ? selectedTag.id === tag.id : selectedTag === tag.name
    );
    return !isAlreadySelected && tag.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Check if search term would create a new tag
  const isNewTag = searchTerm.trim() && 
    !availableTags.some(tag => tag.name.toLowerCase() === searchTerm.toLowerCase()) &&
    !selectedTags.some(selectedTag => 
      typeof selectedTag === 'string' ? selectedTag.toLowerCase() === searchTerm.toLowerCase() : 
      selectedTag.name.toLowerCase() === searchTerm.toLowerCase()
    );

  const options = [
    ...filteredTags,
    ...(isNewTag ? [{ id: -1, name: searchTerm.trim(), isNew: true }] : [])
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          selectTag(options[highlightedIndex]);
        } else if (isNewTag) {
          selectTag({ id: -1, name: searchTerm.trim(), isNew: true });
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

  const selectTag = (tag: any) => {
    if (tag.isNew) {
      // Add as string for new tags
      onTagsChange([...selectedTags, tag.name]);
    } else {
      // Add as tag object for existing tags
      onTagsChange([...selectedTags, tag]);
    }
    setSearchTerm('');
    setHighlightedIndex(-1);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: Tag | string) => {
    onTagsChange(selectedTags.filter(tag => 
      typeof tag === 'string' ? tag !== tagToRemove : 
      typeof tagToRemove === 'string' ? tag.name !== tagToRemove : tag.id !== tagToRemove.id
    ));
  };

  const getTagColor = (tag: Tag | string) => {
    if (typeof tag === 'string') return 'bg-blue-100 text-blue-800';
    return tag.color ? `bg-${tag.color}-100 text-${tag.color}-800` : 'bg-gray-100 text-gray-800';
  };

  const getTagName = (tag: Tag | string) => {
    return typeof tag === 'string' ? tag : tag.name;
  };

  return (
    <div className={cn("space-y-2", className)} ref={dropdownRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "pr-10",
            error && "border-red-500 focus:border-red-500"
          )}
        />
        <TagIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {isOpen && (
          <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto border shadow-lg">
            <CardContent className="p-0">
              {options.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  {searchTerm ? 'No tags found' : 'Start typing to search or create tags'}
                </div>
              ) : (
                <div className="py-1">
                  {options.map((option, index) => (
                    <div
                      key={option.id === -1 ? `new-${option.name}` : option.id}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 cursor-pointer text-sm",
                        "hover:bg-gray-100",
                        highlightedIndex === index && "bg-gray-100"
                      )}
                      onClick={() => selectTag(option)}
                    >
                      <div className="flex items-center gap-2">
                        {(option as any).isNew ? (
                          <>
                            <Plus className="h-4 w-4 text-green-600" />
                            <span>Create "{option.name}"</span>
                            <Badge variant="outline" className="text-xs">New</Badge>
                          </>
                        ) : (
                          <>
                            <div 
                              className={cn(
                                "w-3 h-3 rounded-full",
                                option.color ? `bg-${option.color}-500` : 'bg-gray-400'
                              )}
                            />
                            <span>{option.name}</span>
                          </>
                        )}
                      </div>
                      {highlightedIndex === index && (
                        <Check className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag, index) => (
            <Badge
              key={typeof tag === 'string' ? `string-${tag}` : `tag-${tag.id}`}
              variant="secondary"
              className={cn(
                "flex items-center gap-1 pr-1",
                getTagColor(tag)
              )}
            >
              <span>{getTagName(tag)}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
