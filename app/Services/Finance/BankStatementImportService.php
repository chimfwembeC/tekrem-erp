<?php

namespace App\Services\Finance;

use App\Models\Finance\BankStatement;
use App\Models\Finance\BankStatementTransaction;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\Csv;

class BankStatementImportService
{
    /**
     * Import bank statement from uploaded file.
     */
    public function importFromFile(UploadedFile $file, array $config): BankStatement
    {
        return DB::transaction(function () use ($file, $config) {
            // Store the uploaded file
            $filePath = $file->store('bank-statements', 'local');
            
            // Create the bank statement record
            $statement = BankStatement::create([
                'account_id' => $config['account_id'],
                'statement_number' => $this->generateStatementNumber($config['account_id']),
                'statement_date' => $config['statement_date'],
                'period_start' => $config['period_start'],
                'period_end' => $config['period_end'],
                'opening_balance' => $config['opening_balance'],
                'closing_balance' => $config['closing_balance'],
                'import_method' => $config['import_method'],
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'status' => 'processing',
                'import_metadata' => [
                    'original_filename' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'column_mapping' => [
                        'date_column' => $config['date_column'],
                        'description_column' => $config['description_column'],
                        'amount_column' => $config['amount_column'],
                        'type_column' => $config['type_column'] ?? null,
                        'reference_column' => $config['reference_column'] ?? null,
                        'balance_column' => $config['balance_column'] ?? null,
                    ],
                    'has_header' => $config['has_header'] ?? false,
                ],
                'imported_by' => auth()->id(),
                'imported_at' => now(),
                'user_id' => auth()->id(),
            ]);

            try {
                // Process the file and create transactions
                $this->processFile($statement, $config);
                
                $statement->markAsProcessed();
                
                return $statement;
            } catch (\Exception $e) {
                $statement->markAsFailed();
                throw $e;
            }
        });
    }

    /**
     * Preview file contents before import.
     */
    public function previewFile(UploadedFile $file, string $importMethod, bool $hasHeader = false): array
    {
        $data = $this->readFileData($file, $importMethod);
        
        // Return first 10 rows for preview
        $preview = array_slice($data, 0, 10);
        
        // If has header, separate header from data
        $headers = null;
        if ($hasHeader && !empty($preview)) {
            $headers = array_shift($preview);
        }

        return [
            'headers' => $headers,
            'preview_data' => $preview,
            'total_rows' => count($data),
            'columns' => !empty($data) ? count($data[0]) : 0,
        ];
    }

    /**
     * Process the uploaded file and create transactions.
     */
    protected function processFile(BankStatement $statement, array $config): void
    {
        $filePath = storage_path('app/' . $statement->file_path);
        $data = $this->readFileData($filePath, $config['import_method']);

        // Skip header row if present
        if ($config['has_header'] ?? false) {
            array_shift($data);
        }

        $transactionCount = 0;
        $runningBalance = $statement->opening_balance;

        foreach ($data as $rowIndex => $row) {
            try {
                $transaction = $this->createTransactionFromRow($statement, $row, $config, $runningBalance);
                if ($transaction) {
                    $transactionCount++;
                    $runningBalance = $transaction->running_balance;
                }
            } catch (\Exception $e) {
                // Log the error but continue processing
                \Log::warning("Failed to process row {$rowIndex} in bank statement {$statement->id}: " . $e->getMessage());
            }
        }

        // Update statement metadata
        $metadata = $statement->import_metadata;
        $metadata['transactions_imported'] = $transactionCount;
        $metadata['processing_completed_at'] = now()->toISOString();
        
        $statement->update(['import_metadata' => $metadata]);
    }

    /**
     * Create a bank statement transaction from a data row.
     */
    protected function createTransactionFromRow(
        BankStatement $statement,
        array $row,
        array $config,
        float $currentBalance
    ): ?BankStatementTransaction {
        $mapping = $config;

        // Extract data from row based on column mapping
        $date = $this->parseDate($row[$mapping['date_column']] ?? '');
        $description = trim($row[$mapping['description_column']] ?? '');
        $amount = $this->parseAmount($row[$mapping['amount_column']] ?? '');
        
        // Skip empty rows
        if (!$date || !$description || $amount === null) {
            return null;
        }

        // Determine transaction type
        $transactionType = 'debit';
        if (isset($mapping['type_column']) && isset($row[$mapping['type_column']])) {
            $typeValue = strtolower(trim($row[$mapping['type_column']]));
            if (in_array($typeValue, ['credit', 'deposit', 'cr', '+'])) {
                $transactionType = 'credit';
            }
        } else {
            // If no type column, determine by amount sign
            $transactionType = $amount >= 0 ? 'credit' : 'debit';
        }

        // Make amount positive
        $amount = abs($amount);

        // Calculate running balance
        $runningBalance = $currentBalance;
        if ($transactionType === 'credit') {
            $runningBalance += $amount;
        } else {
            $runningBalance -= $amount;
        }

        // Use provided balance if available
        if (isset($mapping['balance_column']) && isset($row[$mapping['balance_column']])) {
            $providedBalance = $this->parseAmount($row[$mapping['balance_column']]);
            if ($providedBalance !== null) {
                $runningBalance = $providedBalance;
            }
        }

        return BankStatementTransaction::create([
            'bank_statement_id' => $statement->id,
            'transaction_date' => $date,
            'transaction_type' => $transactionType,
            'amount' => $amount,
            'description' => $description,
            'reference_number' => isset($mapping['reference_column']) && isset($row[$mapping['reference_column']]) 
                ? trim($row[$mapping['reference_column']]) 
                : null,
            'running_balance' => $runningBalance,
            'raw_data' => $row,
        ]);
    }

    /**
     * Read data from file based on import method.
     */
    protected function readFileData($file, string $importMethod): array
    {
        $filePath = is_string($file) ? $file : $file->getPathname();

        switch ($importMethod) {
            case 'csv':
                return $this->readCsvFile($filePath);
            case 'excel':
                return $this->readExcelFile($filePath);
            default:
                throw new \Exception("Unsupported import method: {$importMethod}");
        }
    }

    /**
     * Read CSV file.
     */
    protected function readCsvFile(string $filePath): array
    {
        $data = [];
        
        if (($handle = fopen($filePath, 'r')) !== false) {
            while (($row = fgetcsv($handle)) !== false) {
                $data[] = $row;
            }
            fclose($handle);
        }

        return $data;
    }

    /**
     * Read Excel file.
     */
    protected function readExcelFile(string $filePath): array
    {
        $reader = IOFactory::createReaderForFile($filePath);
        $reader->setReadDataOnly(true);
        $spreadsheet = $reader->load($filePath);
        $worksheet = $spreadsheet->getActiveSheet();
        
        return $worksheet->toArray(null, true, true, true);
    }

    /**
     * Parse date from various formats.
     */
    protected function parseDate(string $dateString): ?\Carbon\Carbon
    {
        if (empty(trim($dateString))) {
            return null;
        }

        try {
            // Try common date formats
            $formats = [
                'Y-m-d',
                'm/d/Y',
                'd/m/Y',
                'Y-m-d H:i:s',
                'm/d/Y H:i:s',
                'd/m/Y H:i:s',
                'M d, Y',
                'd-m-Y',
                'd.m.Y',
            ];

            foreach ($formats as $format) {
                $date = \Carbon\Carbon::createFromFormat($format, trim($dateString));
                if ($date !== false) {
                    return $date;
                }
            }

            // Fallback to Carbon's flexible parsing
            return \Carbon\Carbon::parse($dateString);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Parse amount from string, handling various formats.
     */
    protected function parseAmount(string $amountString): ?float
    {
        if (empty(trim($amountString))) {
            return null;
        }

        // Remove currency symbols and spaces
        $cleaned = preg_replace('/[^\d.,\-+]/', '', $amountString);
        
        // Handle negative amounts in parentheses
        if (preg_match('/^\((.*)\)$/', $cleaned, $matches)) {
            $cleaned = '-' . $matches[1];
        }

        // Convert to float
        $amount = str_replace(',', '', $cleaned);
        
        return is_numeric($amount) ? (float) $amount : null;
    }

    /**
     * Generate a unique statement number.
     */
    protected function generateStatementNumber(int $accountId): string
    {
        return BankStatement::generateStatementNumber($accountId);
    }

    /**
     * Reprocess a failed statement.
     */
    public function reprocessStatement(BankStatement $statement): void
    {
        if ($statement->status !== 'failed') {
            throw new \Exception('Can only reprocess failed statements.');
        }

        DB::transaction(function () use ($statement) {
            // Delete existing transactions
            $statement->transactions()->delete();

            // Reset status
            $statement->update(['status' => 'processing']);

            try {
                // Reprocess with original configuration
                $config = array_merge(
                    $statement->import_metadata['column_mapping'] ?? [],
                    [
                        'account_id' => $statement->account_id,
                        'import_method' => $statement->import_method,
                        'has_header' => $statement->import_metadata['has_header'] ?? false,
                        'statement_date' => $statement->statement_date,
                        'period_start' => $statement->period_start,
                        'period_end' => $statement->period_end,
                        'opening_balance' => $statement->opening_balance,
                        'closing_balance' => $statement->closing_balance,
                    ]
                );

                $this->processFile($statement, $config);
                $statement->markAsProcessed();
            } catch (\Exception $e) {
                $statement->markAsFailed();
                throw $e;
            }
        });
    }
}
