<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\AI\Service;
use App\Models\AI\AIModel;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ModelController extends Controller
{
    /**
     * Display a listing of AI models.
     */
    public function index(Request $request)
    {
        $query = AIModel::query()
            ->with('service')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('model_identifier', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->service_id, function ($query, $serviceId) {
                $query->where('ai_service_id', $serviceId);
            })
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($request->status !== null, function ($query) use ($request) {
                $query->where('is_enabled', $request->status === 'enabled');
            });

        $models = $query->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $services = Service::enabled()->orderBy('name')->get(['id', 'name']);
        $types = AIModel::distinct()->pluck('type')->sort()->values();

        return Inertia::render('AI/Models/Index', [
            'models' => $models,
            'services' => $services,
            'types' => $types,
            'filters' => $request->only(['search', 'service_id', 'type', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new model.
     */
    public function create()
    {
        $services = Service::enabled()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('AI/Models/Create', [
            'services' => $services,
        ]);
    }

    /**
     * Store a newly created model.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ai_service_id' => ['required', 'exists:ai_services,id'],
            'name' => ['required', 'string', 'max:255'],
            'model_identifier' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:chat,completion,embedding,image,audio'],
            'description' => ['nullable', 'string'],
            'is_enabled' => ['boolean'],
            'is_default' => ['boolean'],
            'capabilities' => ['array'],
            'max_tokens' => ['nullable', 'integer', 'min:1'],
            'temperature' => ['nullable', 'numeric', 'min:0', 'max:2'],
            'top_p' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'frequency_penalty' => ['nullable', 'integer', 'min:-2', 'max:2'],
            'presence_penalty' => ['nullable', 'integer', 'min:-2', 'max:2'],
            'cost_per_input_token' => ['nullable', 'numeric', 'min:0'],
            'cost_per_output_token' => ['nullable', 'numeric', 'min:0'],
            'configuration' => ['array'],
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        // Ensure slug is unique
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (AIModel::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        $model = AIModel::create($validated);

        // If this is set as default, remove default from others of the same type
        if ($validated['is_default'] ?? false) {
            $model->setAsDefault();
        }

        return redirect()->route('ai.models.show', $model)
            ->with('success', 'AI model created successfully.');
    }

    /**
     * Display the specified model.
     */
    public function show(AIModel $model)
    {
        $model->load('service');

        // Get usage statistics
        $usageStats = $model->getUsageStats('30 days');

        return Inertia::render('AI/Models/Show', [
            'model' => $model,
            'usageStats' => $usageStats,
        ]);
    }

    /**
     * Show the form for editing the specified model.
     */
    public function edit(AIModel $model)
    {
        $model->load('service');
        $services = Service::enabled()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('AI/Models/Edit', [
            'model' => $model,
            'services' => $services,
        ]);
    }

    /**
     * Update the specified model.
     */
    public function update(Request $request, AIModel $model)
    {
        $validated = $request->validate([
            'ai_service_id' => ['required', 'exists:ai_services,id'],
            'name' => ['required', 'string', 'max:255'],
            'model_identifier' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:chat,completion,embedding,image,audio'],
            'description' => ['nullable', 'string'],
            'is_enabled' => ['boolean'],
            'is_default' => ['boolean'],
            'capabilities' => ['array'],
            'max_tokens' => ['nullable', 'integer', 'min:1'],
            'temperature' => ['nullable', 'numeric', 'min:0', 'max:2'],
            'top_p' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'frequency_penalty' => ['nullable', 'integer', 'min:-2', 'max:2'],
            'presence_penalty' => ['nullable', 'integer', 'min:-2', 'max:2'],
            'cost_per_input_token' => ['nullable', 'numeric', 'min:0'],
            'cost_per_output_token' => ['nullable', 'numeric', 'min:0'],
            'configuration' => ['array'],
        ]);

        // Update slug if name changed
        if ($validated['name'] !== $model->name) {
            $newSlug = Str::slug($validated['name']);
            
            // Ensure slug is unique (excluding current model)
            $originalSlug = $newSlug;
            $counter = 1;
            while (AIModel::where('slug', $newSlug)->where('id', '!=', $model->id)->exists()) {
                $newSlug = $originalSlug . '-' . $counter;
                $counter++;
            }
            
            $validated['slug'] = $newSlug;
        }

        $model->update($validated);

        // If this is set as default, remove default from others of the same type
        if ($validated['is_default'] ?? false) {
            $model->setAsDefault();
        }

        return redirect()->route('ai.models.show', $model)
            ->with('success', 'AI model updated successfully.');
    }

    /**
     * Remove the specified model.
     */
    public function destroy(AIModel $model)
    {
        // Check if model has conversations
        if ($model->conversations()->count() > 0) {
            return redirect()->route('ai.models.index')
                ->with('error', 'Cannot delete model that has associated conversations.');
        }

        $model->delete();

        return redirect()->route('ai.models.index')
            ->with('success', 'AI model deleted successfully.');
    }

    /**
     * Set the specified model as default for its type.
     */
    public function setDefault(AIModel $model)
    {
        if (!$model->is_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot set disabled model as default.'
            ], 400);
        }

        $model->setAsDefault();

        return response()->json([
            'success' => true,
            'message' => 'Model set as default successfully.'
        ]);
    }

    /**
     * Toggle model enabled status.
     */
    public function toggleStatus(AIModel $model)
    {
        $newStatus = !$model->is_enabled;
        
        // If disabling the default model, we need to set another as default
        if (!$newStatus && $model->is_default) {
            $alternativeModel = AIModel::where('id', '!=', $model->id)
                ->where('type', $model->type)
                ->where('is_enabled', true)
                ->first();
                
            if ($alternativeModel) {
                $alternativeModel->setAsDefault();
            }
        }

        $model->update(['is_enabled' => $newStatus]);

        $status = $newStatus ? 'enabled' : 'disabled';

        return response()->json([
            'success' => true,
            'message' => "Model {$status} successfully.",
            'is_enabled' => $newStatus
        ]);
    }
}
