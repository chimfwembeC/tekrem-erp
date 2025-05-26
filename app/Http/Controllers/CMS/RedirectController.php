<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\CMS\Redirect;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RedirectController extends Controller
{
    /**
     * Display a listing of redirects.
     */
    public function index(Request $request): Response
    {
        $query = Redirect::with(['createdBy'])
            ->when($request->search, function ($q, $search) {
                $q->where('from_url', 'like', "%{$search}%")
                  ->orWhere('to_url', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->status_code, function ($q, $statusCode) {
                $q->where('status_code', $statusCode);
            })
            ->when($request->status, function ($q, $status) {
                if ($status === 'active') {
                    $q->where('is_active', true);
                } elseif ($status === 'inactive') {
                    $q->where('is_active', false);
                }
            })
            ->when($request->usage, function ($q, $usage) {
                if ($usage === 'used') {
                    $q->where('hit_count', '>', 0);
                } elseif ($usage === 'unused') {
                    $q->where('hit_count', 0);
                }
            });

        $redirects = $query->orderBy('created_at', 'desc')->paginate(15);

        $statusCodes = Redirect::getStatusCodes();

        return Inertia::render('CMS/Redirects/Index', [
            'redirects' => $redirects,
            'statusCodes' => $statusCodes,
            'filters' => $request->only(['search', 'status_code', 'status', 'usage']),
        ]);
    }

    /**
     * Show the form for creating a new redirect.
     */
    public function create(): Response
    {
        $statusCodes = Redirect::getStatusCodes();

        return Inertia::render('CMS/Redirects/Create', [
            'statusCodes' => $statusCodes,
        ]);
    }

    /**
     * Store a newly created redirect.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'from_url' => ['required', 'string', 'max:255', 'unique:cms_redirects,from_url'],
            'to_url' => ['required', 'string', 'max:255'],
            'status_code' => ['required', 'integer', 'in:301,302,303,307,308'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        // Normalize URLs
        $validated['from_url'] = Redirect::normalizeUrl($validated['from_url']);
        $validated['to_url'] = trim($validated['to_url']);

        // Validate URLs are different
        if ($validated['from_url'] === $validated['to_url']) {
            return redirect()->back()
                ->withErrors(['to_url' => 'Destination URL must be different from source URL.'])
                ->withInput();
        }

        $validated['created_by'] = Auth::id();

        $redirect = Redirect::create($validated);

        // Check for potential loops
        if ($redirect->hasLoop()) {
            $redirect->delete();
            return redirect()->back()
                ->withErrors(['to_url' => 'This redirect would create a loop.'])
                ->withInput();
        }

        return redirect()->route('cms.redirects.show', $redirect)
            ->with('success', 'Redirect created successfully.');
    }

    /**
     * Display the specified redirect.
     */
    public function show(Redirect $redirect): Response
    {
        $redirect->load(['createdBy']);
        $stats = $redirect->getStats();
        $chain = $redirect->getChain();

        return Inertia::render('CMS/Redirects/Show', [
            'redirect' => $redirect,
            'stats' => $stats,
            'chain' => $chain,
        ]);
    }

    /**
     * Show the form for editing the specified redirect.
     */
    public function edit(Redirect $redirect): Response
    {
        $statusCodes = Redirect::getStatusCodes();

        return Inertia::render('CMS/Redirects/Edit', [
            'redirect' => $redirect,
            'statusCodes' => $statusCodes,
        ]);
    }

    /**
     * Update the specified redirect.
     */
    public function update(Request $request, Redirect $redirect): RedirectResponse
    {
        $validated = $request->validate([
            'from_url' => ['required', 'string', 'max:255', 'unique:cms_redirects,from_url,' . $redirect->id],
            'to_url' => ['required', 'string', 'max:255'],
            'status_code' => ['required', 'integer', 'in:301,302,303,307,308'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        // Normalize URLs
        $validated['from_url'] = Redirect::normalizeUrl($validated['from_url']);
        $validated['to_url'] = trim($validated['to_url']);

        // Validate URLs are different
        if ($validated['from_url'] === $validated['to_url']) {
            return redirect()->back()
                ->withErrors(['to_url' => 'Destination URL must be different from source URL.'])
                ->withInput();
        }

        // Temporarily update to check for loops
        $originalToUrl = $redirect->to_url;
        $redirect->update($validated);

        if ($redirect->hasLoop()) {
            $redirect->update(['to_url' => $originalToUrl]);
            return redirect()->back()
                ->withErrors(['to_url' => 'This redirect would create a loop.'])
                ->withInput();
        }

        return redirect()->route('cms.redirects.show', $redirect)
            ->with('success', 'Redirect updated successfully.');
    }

    /**
     * Remove the specified redirect.
     */
    public function destroy(Redirect $redirect): RedirectResponse
    {
        $redirect->delete();

        return redirect()->route('cms.redirects.index')
            ->with('success', 'Redirect deleted successfully.');
    }

    /**
     * Bulk actions on redirects.
     */
    public function bulkAction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'in:activate,deactivate,delete'],
            'redirect_ids' => ['required', 'array'],
            'redirect_ids.*' => ['exists:cms_redirects,id'],
        ]);

        $processed = 0;

        switch ($validated['action']) {
            case 'activate':
                Redirect::whereIn('id', $validated['redirect_ids'])
                    ->update(['is_active' => true]);
                $processed = count($validated['redirect_ids']);
                break;

            case 'deactivate':
                Redirect::whereIn('id', $validated['redirect_ids'])
                    ->update(['is_active' => false]);
                $processed = count($validated['redirect_ids']);
                break;

            case 'delete':
                $processed = Redirect::whereIn('id', $validated['redirect_ids'])->count();
                Redirect::whereIn('id', $validated['redirect_ids'])->delete();
                break;
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully processed {$processed} redirects.",
            'processed' => $processed,
        ]);
    }

    /**
     * Get redirect statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => Redirect::count(),
            'active' => Redirect::active()->count(),
            'inactive' => Redirect::where('is_active', false)->count(),
            'used' => Redirect::withHits()->count(),
            'unused' => Redirect::unused()->count(),
            'total_hits' => Redirect::sum('hit_count'),
            'by_status_code' => [],
            'top_redirects' => [],
            'recent_hits' => [],
        ];

        // Stats by status code
        foreach (Redirect::getStatusCodes() as $code => $description) {
            $stats['by_status_code'][$code] = [
                'count' => Redirect::where('status_code', $code)->count(),
                'description' => $description,
            ];
        }

        // Top redirects by hits
        $stats['top_redirects'] = Redirect::withHits()
            ->orderBy('hit_count', 'desc')
            ->limit(10)
            ->get(['from_url', 'to_url', 'hit_count', 'last_hit_at'])
            ->toArray();

        // Recent hits
        $stats['recent_hits'] = Redirect::whereNotNull('last_hit_at')
            ->orderBy('last_hit_at', 'desc')
            ->limit(10)
            ->get(['from_url', 'to_url', 'hit_count', 'last_hit_at'])
            ->toArray();

        return response()->json($stats);
    }

    /**
     * Import redirects from CSV.
     */
    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'csv_file' => ['required', 'file', 'mimes:csv,txt'],
            'has_headers' => ['boolean'],
        ]);

        try {
            $file = $validated['csv_file'];
            $hasHeaders = $validated['has_headers'] ?? true;
            
            $handle = fopen($file->getPathname(), 'r');
            $redirects = [];
            $lineNumber = 0;

            // Skip headers if present
            if ($hasHeaders) {
                fgetcsv($handle);
                $lineNumber++;
            }

            while (($data = fgetcsv($handle)) !== false) {
                $lineNumber++;
                
                if (count($data) < 2) {
                    continue; // Skip invalid rows
                }

                $redirects[] = [
                    'from_url' => trim($data[0]),
                    'to_url' => trim($data[1]),
                    'status_code' => isset($data[2]) && is_numeric($data[2]) ? (int)$data[2] : 301,
                    'description' => isset($data[3]) ? trim($data[3]) : null,
                    'is_active' => isset($data[4]) ? filter_var($data[4], FILTER_VALIDATE_BOOLEAN) : true,
                ];
            }

            fclose($handle);

            $result = Redirect::bulkImport($redirects, Auth::id());

            $message = "Import completed. {$result['imported']} redirects imported.";
            if (!empty($result['errors'])) {
                $message .= " " . count($result['errors']) . " errors occurred.";
            }

            return redirect()->route('cms.redirects.index')
                ->with('success', $message)
                ->with('import_errors', $result['errors']);

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to import redirects: ' . $e->getMessage());
        }
    }

    /**
     * Export redirects to CSV.
     */
    public function export(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $filename = 'redirects-' . date('Y-m-d-H-i-s') . '.csv';

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            
            // Add headers
            fputcsv($handle, [
                'From URL',
                'To URL',
                'Status Code',
                'Description',
                'Is Active',
                'Hit Count',
                'Last Hit',
                'Created At',
            ]);

            // Add data
            Redirect::chunk(1000, function ($redirects) use ($handle) {
                foreach ($redirects as $redirect) {
                    fputcsv($handle, [
                        $redirect->from_url,
                        $redirect->to_url,
                        $redirect->status_code,
                        $redirect->description,
                        $redirect->is_active ? 'Yes' : 'No',
                        $redirect->hit_count,
                        $redirect->last_hit_at?->toDateTimeString(),
                        $redirect->created_at->toDateTimeString(),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * Test redirect.
     */
    public function test(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'url' => ['required', 'string'],
        ]);

        $redirect = Redirect::findByFromUrl($validated['url']);

        if (!$redirect) {
            return response()->json([
                'found' => false,
                'message' => 'No redirect found for this URL.',
            ]);
        }

        $chain = $redirect->getChain();

        return response()->json([
            'found' => true,
            'redirect' => $redirect,
            'chain' => $chain,
            'has_loop' => $redirect->hasLoop(),
        ]);
    }
}
