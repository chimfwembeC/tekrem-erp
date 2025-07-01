<?php

namespace App\Services\Finance;

use App\Models\Finance\Account;
use App\Models\Finance\BankReconciliation;
use App\Models\Finance\BankReconciliationItem;
use App\Models\Finance\BankStatement;
use App\Models\Finance\BankStatementTransaction;
use App\Models\Finance\Transaction;
use Illuminate\Support\Facades\DB;

class BankReconciliationService
{
    /**
     * Create a new bank reconciliation.
     */
    public function createReconciliation(array $data): BankReconciliation
    {
        return DB::transaction(function () use ($data) {
            $reconciliation = BankReconciliation::create([
                ...$data,
                'reconciliation_number' => BankReconciliation::generateReconciliationNumber($data['account_id']),
                'status' => 'in_progress',
                'difference' => $data['statement_closing_balance'] - $data['book_closing_balance'],
                'reconciled_by' => auth()->id(),
                'user_id' => auth()->id(),
            ]);

            // Create initial reconciliation items for unmatched transactions
            $this->createInitialReconciliationItems($reconciliation);

            return $reconciliation;
        });
    }

    /**
     * Create initial reconciliation items for unmatched transactions.
     */
    protected function createInitialReconciliationItems(BankReconciliation $reconciliation): void
    {
        // Create items for bank statement transactions
        $bankTransactions = $reconciliation->bankStatement->transactions;
        foreach ($bankTransactions as $bankTransaction) {
            BankReconciliationItem::create([
                'bank_reconciliation_id' => $reconciliation->id,
                'bank_statement_transaction_id' => $bankTransaction->id,
                'match_type' => 'unmatched_bank',
                'match_method' => null,
                'is_cleared' => false,
            ]);
        }

        // Create items for unreconciled book transactions in the period
        $bookTransactions = Transaction::where('account_id', $reconciliation->account_id)
            ->where('is_reconciled', false)
            ->where('status', 'completed')
            ->whereBetween('transaction_date', [
                $reconciliation->period_start,
                $reconciliation->period_end
            ])
            ->get();

        foreach ($bookTransactions as $bookTransaction) {
            BankReconciliationItem::create([
                'bank_reconciliation_id' => $reconciliation->id,
                'transaction_id' => $bookTransaction->id,
                'match_type' => 'unmatched_book',
                'match_method' => null,
                'is_cleared' => false,
            ]);
        }

        $reconciliation->updateStatistics();
    }

    /**
     * Auto-match transactions based on amount, date, and description similarity.
     */
    public function autoMatchTransactions(BankReconciliation $reconciliation): int
    {
        $matchCount = 0;

        $unmatchedBankItems = $reconciliation->unmatchedBankItems()
            ->with('bankStatementTransaction')
            ->get();

        $unmatchedBookItems = $reconciliation->unmatchedBookItems()
            ->with('transaction')
            ->get();

        foreach ($unmatchedBankItems as $bankItem) {
            $bankTransaction = $bankItem->bankStatementTransaction;
            if (!$bankTransaction) continue;

            $bestMatch = null;
            $bestScore = 0;

            foreach ($unmatchedBookItems as $bookItem) {
                $bookTransaction = $bookItem->transaction;
                if (!$bookTransaction) continue;

                $score = $bankTransaction->calculateSimilarityScore($bookTransaction);

                if ($score > $bestScore && $score >= 80) { // 80% confidence threshold
                    $bestScore = $score;
                    $bestMatch = $bookItem;
                }
            }

            if ($bestMatch) {
                $this->createAutoMatch(
                    $reconciliation,
                    $bankItem,
                    $bestMatch,
                    $bestScore
                );

                // Remove matched items from the pool
                $unmatchedBookItems = $unmatchedBookItems->reject(function ($item) use ($bestMatch) {
                    return $item->id === $bestMatch->id;
                });

                $matchCount++;
            }
        }

        $reconciliation->updateStatistics();

        return $matchCount;
    }

    /**
     * Create an automatic match between bank and book transactions.
     */
    protected function createAutoMatch(
        BankReconciliation $reconciliation,
        BankReconciliationItem $bankItem,
        BankReconciliationItem $bookItem,
        float $confidence
    ): void {
        DB::transaction(function () use ($reconciliation, $bankItem, $bookItem, $confidence) {
            // Delete the unmatched items
            $bankItem->delete();
            $bookItem->delete();

            // Create the matched item
            BankReconciliationItem::create([
                'bank_reconciliation_id' => $reconciliation->id,
                'bank_statement_transaction_id' => $bankItem->bank_statement_transaction_id,
                'transaction_id' => $bookItem->transaction_id,
                'match_type' => 'matched',
                'match_method' => 'auto',
                'match_confidence' => $confidence,
                'amount_difference' => abs($bankItem->bankStatementTransaction->amount - $bookItem->transaction->amount),
                'is_cleared' => true,
                'matched_by' => auth()->id(),
                'matched_at' => now(),
            ]);

            // Mark the book transaction as reconciled
            $bookItem->transaction->markAsReconciled($reconciliation->id);
        });
    }

    /**
     * Create a manual match between bank and book transactions.
     */
    public function createManualMatch(
        BankReconciliation $reconciliation,
        int $bankStatementTransactionId,
        int $transactionId,
        ?string $notes = null
    ): void {
        DB::transaction(function () use ($reconciliation, $bankStatementTransactionId, $transactionId, $notes) {
            // Find and delete the unmatched items
            $bankItem = $reconciliation->unmatchedBankItems()
                ->where('bank_statement_transaction_id', $bankStatementTransactionId)
                ->first();

            $bookItem = $reconciliation->unmatchedBookItems()
                ->where('transaction_id', $transactionId)
                ->first();

            if ($bankItem) $bankItem->delete();
            if ($bookItem) $bookItem->delete();

            // Get the transactions for amount difference calculation
            $bankTransaction = BankStatementTransaction::find($bankStatementTransactionId);
            $bookTransaction = Transaction::find($transactionId);

            // Create the matched item
            BankReconciliationItem::create([
                'bank_reconciliation_id' => $reconciliation->id,
                'bank_statement_transaction_id' => $bankStatementTransactionId,
                'transaction_id' => $transactionId,
                'match_type' => 'matched',
                'match_method' => 'manual',
                'amount_difference' => abs($bankTransaction->amount - $bookTransaction->amount),
                'match_notes' => $notes,
                'is_cleared' => true,
                'matched_by' => auth()->id(),
                'matched_at' => now(),
            ]);

            // Mark the book transaction as reconciled
            $bookTransaction->markAsReconciled($reconciliation->id, $notes);

            $reconciliation->updateStatistics();
        });
    }

    /**
     * Unmatch previously matched transactions.
     */
    public function unmatchTransactions(BankReconciliation $reconciliation, int $reconciliationItemId): void
    {
        DB::transaction(function () use ($reconciliation, $reconciliationItemId) {
            $matchedItem = BankReconciliationItem::where('id', $reconciliationItemId)
                ->where('bank_reconciliation_id', $reconciliation->id)
                ->where('match_type', 'matched')
                ->first();

            if (!$matchedItem) {
                throw new \Exception('Matched item not found.');
            }

            // Create separate unmatched items
            if ($matchedItem->bank_statement_transaction_id) {
                BankReconciliationItem::create([
                    'bank_reconciliation_id' => $reconciliation->id,
                    'bank_statement_transaction_id' => $matchedItem->bank_statement_transaction_id,
                    'match_type' => 'unmatched_bank',
                    'is_cleared' => false,
                ]);
            }

            if ($matchedItem->transaction_id) {
                BankReconciliationItem::create([
                    'bank_reconciliation_id' => $reconciliation->id,
                    'transaction_id' => $matchedItem->transaction_id,
                    'match_type' => 'unmatched_book',
                    'is_cleared' => false,
                ]);

                // Mark the book transaction as unreconciled
                $matchedItem->transaction->markAsUnreconciled();
            }

            // Delete the matched item
            $matchedItem->delete();

            $reconciliation->updateStatistics();
        });
    }

    /**
     * Get suggested matches for a bank statement transaction.
     */
    public function getSuggestedMatches(
        BankReconciliation $reconciliation,
        BankStatementTransaction $bankTransaction
    ): array {
        $candidates = Transaction::getCandidatesForMatching(
            $reconciliation->account_id,
            $bankTransaction->amount,
            $bankTransaction->transaction_date
        );

        $suggestions = [];

        foreach ($candidates as $candidate) {
            $score = $bankTransaction->calculateSimilarityScore($candidate);
            
            if ($score >= 50) { // Minimum 50% confidence for suggestions
                $suggestions[] = [
                    'transaction' => $candidate,
                    'confidence' => $score,
                    'confidence_level' => $this->getConfidenceLevel($score),
                    'match_criteria' => $this->getMatchCriteria($bankTransaction, $candidate),
                ];
            }
        }

        // Sort by confidence score descending
        usort($suggestions, function ($a, $b) {
            return $b['confidence'] <=> $a['confidence'];
        });

        return array_slice($suggestions, 0, 5); // Return top 5 suggestions
    }

    /**
     * Get confidence level description.
     */
    protected function getConfidenceLevel(float $score): string
    {
        if ($score >= 90) return 'high';
        if ($score >= 70) return 'medium';
        if ($score >= 50) return 'low';
        return 'very_low';
    }

    /**
     * Get match criteria used for scoring.
     */
    protected function getMatchCriteria(BankStatementTransaction $bankTransaction, Transaction $transaction): array
    {
        $criteria = [];

        // Amount match
        if (abs($bankTransaction->amount - abs($transaction->amount)) < 0.01) {
            $criteria[] = 'exact_amount_match';
        } elseif (abs($bankTransaction->amount - abs($transaction->amount)) < 1.00) {
            $criteria[] = 'close_amount_match';
        }

        // Date proximity
        $daysDiff = abs($bankTransaction->transaction_date->diffInDays($transaction->transaction_date));
        if ($daysDiff === 0) {
            $criteria[] = 'same_date';
        } elseif ($daysDiff <= 1) {
            $criteria[] = 'next_day';
        } elseif ($daysDiff <= 3) {
            $criteria[] = 'within_3_days';
        }

        // Description similarity
        $cleanBankDesc = $bankTransaction->clean_description;
        $cleanTransDesc = strtolower(preg_replace('/[^a-z0-9\s]/', '', $transaction->description));
        
        if (strlen($cleanBankDesc) > 0 && strlen($cleanTransDesc) > 0) {
            similar_text($cleanBankDesc, $cleanTransDesc, $percent);
            if ($percent > 70) {
                $criteria[] = 'description_similarity';
            }
        }

        // Reference number match
        if ($bankTransaction->reference_number && $transaction->reference_number) {
            if ($bankTransaction->reference_number === $transaction->reference_number) {
                $criteria[] = 'reference_match';
            }
        }

        return $criteria;
    }

    /**
     * Complete the reconciliation.
     */
    public function completeReconciliation(BankReconciliation $reconciliation): void
    {
        if (!$reconciliation->isBalanced()) {
            throw new \Exception('Cannot complete unbalanced reconciliation.');
        }

        $reconciliation->markAsCompleted();
        $reconciliation->updateStatistics();
    }

    /**
     * Delete a reconciliation and unreconcile all transactions.
     */
    public function deleteReconciliation(BankReconciliation $reconciliation): void
    {
        DB::transaction(function () use ($reconciliation) {
            // Unreconcile all matched transactions
            $matchedItems = $reconciliation->matchedItems;
            foreach ($matchedItems as $item) {
                if ($item->transaction) {
                    $item->transaction->markAsUnreconciled();
                }
            }

            // Delete all reconciliation items
            $reconciliation->items()->delete();

            // Delete the reconciliation
            $reconciliation->delete();
        });
    }
}
