<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\CMS\Media;
use App\Models\CMS\MediaFolder;
use App\Services\CMS\MediaService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function __construct(
        private MediaService $mediaService
    ) {}

    /**
     * Display media library.
     */
    public function index(Request $request): Response
    {
        $folderId = $request->get('folder');
        $folder = $folderId ? MediaFolder::findOrFail($folderId) : null;

        // Get media in current folder with filters
        $query = Media::query();

        if ($folder) {
            $query->where('folder_id', $folder->id);
        } else {
            $query->whereNull('folder_id');
        }

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('original_name', 'like', '%' . $request->search . '%')
                  ->orWhere('alt_text', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('type')) {
            switch ($request->type) {
                case 'image':
                    $query->where('mime_type', 'like', 'image/%');
                    break;
                case 'video':
                    $query->where('mime_type', 'like', 'video/%');
                    break;
                case 'document':
                    $query->where('mime_type', 'not like', 'image/%')
                          ->where('mime_type', 'not like', 'video/%');
                    break;
            }
        }

        $media = $query->with(['uploadedBy', 'folder'])
                      ->orderBy('created_at', 'desc')
                      ->paginate(24);

        // Get subfolders
        $subfolders = $folder
            ? $folder->children()->orderBy('sort_order')->get()
            : MediaFolder::root()->orderBy('sort_order')->get();

        // Get breadcrumbs
        $breadcrumbs = $folder ? $folder->getBreadcrumbs() : [];

        // Get statistics
        $statistics = $this->mediaService->getStatistics();

        return Inertia::render('CMS/Media/Index', [
            'media' => $media,
            'folders' => $subfolders,
            'currentFolder' => $folder,
            'breadcrumbs' => $breadcrumbs,
            'statistics' => $statistics,
            'filters' => $request->only(['search', 'type', 'folder']),
        ]);
    }

    /**
     * Upload files.
     */
    public function upload(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'files' => ['required', 'array'],
            'files.*' => ['file', 'max:10240'], // 10MB max
            'folder_id' => ['nullable', 'exists:cms_media_folders,id'],
            'optimize' => ['boolean'],
        ]);

        $folder = $validated['folder_id'] ? MediaFolder::find($validated['folder_id']) : null;
        $options = [
            'optimize' => $validated['optimize'] ?? true,
        ];

        try {
            $uploadedMedia = $this->mediaService->uploadMultipleFiles(
                $validated['files'],
                Auth::user(),
                $folder,
                $options
            );

            return response()->json([
                'success' => true,
                'message' => 'Files uploaded successfully.',
                'media' => $uploadedMedia,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show media details.
     */
    public function show(Media $media): Response
    {
        $media->load(['uploadedBy', 'folder']);
        $media->incrementUsage();

        return Inertia::render('CMS/Media/Show', [
            'media' => $media,
        ]);
    }

    /**
     * Update media.
     */
    public function update(Request $request, Media $media): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'tags' => ['nullable', 'array'],
            'folder_id' => ['nullable', 'exists:cms_media_folders,id'],
        ]);

        $media->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Media updated successfully.',
            'media' => $media->fresh(),
        ]);
    }

    /**
     * Delete media.
     */
    public function destroy(Media $media): JsonResponse
    {
        $success = $this->mediaService->deleteMedia($media);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Media deleted successfully.' : 'Failed to delete media.',
        ]);
    }

    /**
     * Create folder.
     */
    public function createFolder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'parent_id' => ['nullable', 'exists:cms_media_folders,id'],
        ]);

        try {
            $folder = $this->mediaService->createFolder($validated, Auth::user());

            return response()->json([
                'success' => true,
                'message' => 'Folder created successfully.',
                'folder' => $folder,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create folder: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update folder.
     */
    public function updateFolder(Request $request, MediaFolder $folder): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'parent_id' => ['nullable', 'exists:cms_media_folders,id'],
        ]);

        // Prevent moving to a child folder
        if ($validated['parent_id']) {
            $newParent = MediaFolder::find($validated['parent_id']);
            if ($folder->isAncestorOf($newParent)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot move folder to its own child.',
                ], 422);
            }
        }

        $folder->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Folder updated successfully.',
            'folder' => $folder->fresh(),
        ]);
    }

    /**
     * Delete folder.
     */
    public function destroyFolder(Request $request, MediaFolder $folder): JsonResponse
    {
        $deleteContents = $request->boolean('delete_contents', false);
        $success = $this->mediaService->deleteFolder($folder, $deleteContents);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Folder deleted successfully.' : 'Failed to delete folder.',
        ]);
    }

    /**
     * Search media.
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'min:2'],
            'type' => ['nullable', 'in:image,video,document'],
            'folder_id' => ['nullable', 'exists:cms_media_folders,id'],
            'tags' => ['nullable', 'array'],
            'uploaded_by' => ['nullable', 'exists:users,id'],
        ]);

        $filters = array_filter([
            'type' => $validated['type'] ?? null,
            'folder_id' => $validated['folder_id'] ?? null,
            'tags' => $validated['tags'] ?? null,
            'uploaded_by' => $validated['uploaded_by'] ?? null,
        ]);

        $results = $this->mediaService->searchMedia($validated['query'], $filters);

        return response()->json([
            'success' => true,
            'results' => $results,
        ]);
    }

    /**
     * Bulk actions on media.
     */
    public function bulkAction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'in:move,tag,delete,optimize'],
            'media_ids' => ['required', 'array'],
            'media_ids.*' => ['exists:cms_media,id'],
            'folder_id' => ['nullable', 'exists:cms_media_folders,id'],
            'tags' => ['nullable', 'array'],
        ]);

        $processed = 0;

        switch ($validated['action']) {
            case 'move':
                $folder = $validated['folder_id'] ? MediaFolder::find($validated['folder_id']) : null;
                $processed = $this->mediaService->bulkMoveMedia($validated['media_ids'], $folder);
                break;

            case 'tag':
                if (!empty($validated['tags'])) {
                    $processed = $this->mediaService->bulkTagMedia($validated['media_ids'], $validated['tags']);
                }
                break;

            case 'delete':
                $processed = $this->mediaService->bulkDeleteMedia($validated['media_ids']);
                break;

            case 'optimize':
                foreach ($validated['media_ids'] as $mediaId) {
                    $media = Media::find($mediaId);
                    if ($media && $this->mediaService->optimizeMedia($media)) {
                        $processed++;
                    }
                }
                break;
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully processed {$processed} items.",
            'processed' => $processed,
        ]);
    }

    /**
     * Generate image variants.
     */
    public function generateVariants(Request $request, Media $media): JsonResponse
    {
        if (!$media->isImage()) {
            return response()->json([
                'success' => false,
                'message' => 'Media is not an image.',
            ], 422);
        }

        $validated = $request->validate([
            'sizes' => ['nullable', 'array'],
            'sizes.*.name' => ['required', 'string'],
            'sizes.*.width' => ['required', 'integer', 'min:1'],
            'sizes.*.height' => ['required', 'integer', 'min:1'],
        ]);

        $sizes = [];
        if (!empty($validated['sizes'])) {
            foreach ($validated['sizes'] as $size) {
                $sizes[$size['name']] = [$size['width'], $size['height']];
            }
        }

        $variants = $this->mediaService->createImageVariants($media, $sizes);

        return response()->json([
            'success' => true,
            'message' => 'Image variants generated successfully.',
            'variants' => $variants,
        ]);
    }

    /**
     * Get media picker data.
     */
    public function picker(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['nullable', 'in:image,video,document'],
            'folder_id' => ['nullable', 'exists:cms_media_folders,id'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Media::query();

        if (!empty($validated['type'])) {
            switch ($validated['type']) {
                case 'image':
                    $query->images();
                    break;
                case 'video':
                    $query->videos();
                    break;
                case 'document':
                    $query->documents();
                    break;
            }
        }

        if (!empty($validated['folder_id'])) {
            $query->inFolder($validated['folder_id']);
        }

        $media = $query->orderBy('created_at', 'desc')
            ->limit($validated['limit'] ?? 20)
            ->get();

        $folders = MediaFolder::orderBy('name')->get(['id', 'name', 'parent_id']);

        return response()->json([
            'media' => $media,
            'folders' => $folders,
        ]);
    }

    /**
     * Cleanup unused media.
     */
    public function cleanup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'days_old' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $daysOld = $validated['days_old'] ?? 30;
        $deleted = $this->mediaService->cleanupUnusedMedia($daysOld);

        return response()->json([
            'success' => true,
            'message' => "Cleaned up {$deleted} unused media files.",
            'deleted' => $deleted,
        ]);
    }
}
