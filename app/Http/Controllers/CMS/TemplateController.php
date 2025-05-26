<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\CMS\Template;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
    /**
     * Display a listing of templates.
     */
    public function index(Request $request): Response
    {
        $query = Template::with(['createdBy'])
            ->when($request->search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->category, function ($q, $category) {
                $q->where('category', $category);
            })
            ->when($request->status, function ($q, $status) {
                if ($status === 'active') {
                    $q->where('is_active', true);
                } elseif ($status === 'inactive') {
                    $q->where('is_active', false);
                }
            });

        $templates = $query->orderBy('created_at', 'desc')->paginate(15);

        $categories = Template::getCategories();

        return Inertia::render('CMS/Templates/Index', [
            'templates' => $templates,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new template.
     */
    public function create(): Response
    {
        $categories = Template::getCategories();

        return Inertia::render('CMS/Templates/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created template.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:cms_templates,slug'],
            'description' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'fields' => ['nullable', 'array'],
            'settings' => ['nullable', 'array'],
            'category' => ['required', 'string'],
            'is_active' => ['boolean'],
            'is_default' => ['boolean'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = \Str::slug($validated['name']);
        }

        $validated['created_by'] = Auth::id();

        $template = Template::create($validated);

        if ($validated['is_default'] ?? false) {
            $template->setAsDefault();
        }

        return redirect()->route('cms.templates.show', $template)
            ->with('success', 'Template created successfully.');
    }

    /**
     * Display the specified template.
     */
    public function show(Template $template): Response
    {
        $template->load(['createdBy']);
        $usageStats = $template->getUsageStats();

        return Inertia::render('CMS/Templates/Show', [
            'template' => $template,
            'usageStats' => $usageStats,
        ]);
    }

    /**
     * Show the form for editing the specified template.
     */
    public function edit(Template $template): Response
    {
        $categories = Template::getCategories();

        return Inertia::render('CMS/Templates/Edit', [
            'template' => $template,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified template.
     */
    public function update(Request $request, Template $template): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:cms_templates,slug,' . $template->id],
            'description' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'fields' => ['nullable', 'array'],
            'settings' => ['nullable', 'array'],
            'category' => ['required', 'string'],
            'is_active' => ['boolean'],
            'is_default' => ['boolean'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = \Str::slug($validated['name']);
        }

        $template->update($validated);

        if ($validated['is_default'] ?? false) {
            $template->setAsDefault();
        }

        return redirect()->route('cms.templates.show', $template)
            ->with('success', 'Template updated successfully.');
    }

    /**
     * Remove the specified template.
     */
    public function destroy(Template $template): RedirectResponse
    {
        // Check if template is in use
        if ($template->pages()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete template that is in use by pages.');
        }

        $template->delete();

        return redirect()->route('cms.templates.index')
            ->with('success', 'Template deleted successfully.');
    }

    /**
     * Set template as default.
     */
    public function setDefault(Template $template): JsonResponse
    {
        $success = $template->setAsDefault();

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Template set as default successfully.' : 'Failed to set template as default.',
        ]);
    }

    /**
     * Duplicate a template.
     */
    public function duplicate(Request $request, Template $template): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $data = $template->toArray();
        unset($data['id'], $data['created_at'], $data['updated_at']);

        $data['name'] = $validated['name'] ?? $data['name'] . ' (Copy)';
        $data['slug'] = \Str::slug($data['name']);
        $data['is_default'] = false;
        $data['created_by'] = Auth::id();

        // Ensure unique slug
        $originalSlug = $data['slug'];
        $counter = 1;
        while (Template::where('slug', $data['slug'])->exists()) {
            $data['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        $duplicatedTemplate = Template::create($data);

        return redirect()->route('cms.templates.edit', $duplicatedTemplate)
            ->with('success', 'Template duplicated successfully.');
    }

    /**
     * Preview template.
     */
    public function preview(Template $template): Response
    {
        $sampleData = [
            'title' => 'Sample Page Title',
            'content' => '<p>This is sample content for the template preview.</p>',
            'excerpt' => 'This is a sample excerpt for the template preview.',
        ];

        // Add sample data for custom fields
        if ($template->fields) {
            foreach ($template->fields as $field) {
                switch ($field['type']) {
                    case 'text':
                        $sampleData[$field['name']] = 'Sample text';
                        break;
                    case 'textarea':
                        $sampleData[$field['name']] = 'Sample textarea content';
                        break;
                    case 'image':
                        $sampleData[$field['name']] = '/images/sample-image.jpg';
                        break;
                    case 'url':
                        $sampleData[$field['name']] = 'https://example.com';
                        break;
                    case 'select':
                        $options = $field['options'] ?? [];
                        $sampleData[$field['name']] = !empty($options) ? array_keys($options)[0] : 'option1';
                        break;
                    default:
                        $sampleData[$field['name']] = 'Sample value';
                }
            }
        }

        $renderedContent = $template->render($sampleData);

        return Inertia::render('CMS/Templates/Preview', [
            'template' => $template,
            'renderedContent' => $renderedContent,
            'sampleData' => $sampleData,
        ]);
    }

    /**
     * Export template.
     */
    public function export(Template $template): JsonResponse
    {
        $exportData = [
            'name' => $template->name,
            'description' => $template->description,
            'content' => $template->content,
            'fields' => $template->fields,
            'settings' => $template->settings,
            'category' => $template->category,
            'version' => '1.0',
            'exported_at' => now()->toISOString(),
        ];

        return response()->json($exportData)
            ->header('Content-Disposition', 'attachment; filename="' . $template->slug . '.json"');
    }

    /**
     * Import template.
     */
    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'template_file' => ['required', 'file', 'mimes:json'],
        ]);

        try {
            $content = file_get_contents($validated['template_file']->getPathname());
            $templateData = json_decode($content, true);

            if (!$templateData || !isset($templateData['name'], $templateData['content'])) {
                throw new \Exception('Invalid template file format.');
            }

            $slug = \Str::slug($templateData['name']);
            $originalSlug = $slug;
            $counter = 1;
            while (Template::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            $template = Template::create([
                'name' => $templateData['name'],
                'slug' => $slug,
                'description' => $templateData['description'] ?? null,
                'content' => $templateData['content'],
                'fields' => $templateData['fields'] ?? null,
                'settings' => $templateData['settings'] ?? null,
                'category' => $templateData['category'] ?? 'custom',
                'is_active' => true,
                'is_default' => false,
                'created_by' => Auth::id(),
            ]);

            return redirect()->route('cms.templates.show', $template)
                ->with('success', 'Template imported successfully.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to import template: ' . $e->getMessage());
        }
    }
}
