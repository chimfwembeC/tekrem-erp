<?php

namespace Tests\Unit\Services;

use App\Models\Finance\Account;
use App\Models\Finance\BankReconciliation;
use App\Models\Finance\BankStatement;
use App\Models\Finance\BankTransaction;
use App\Models\Finance\Transaction;
use App\Services\Finance\BankReconciliationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BankReconciliationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected BankReconciliationService $service;
    protected Account $bankAccount;
    protected BankStatement $bankStatement;
    protected BankReconciliation $reconciliation;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new BankReconciliationService();

        $this->bankAccount = Account::factory()->create([
            'name' => 'Test Bank Account',
            'type' => 'checking',
            'balance' => 10000.00,
        ]);

        $this->bankStatement = BankStatement::factory()->create([
            'account_id' => $this->bankAccount->id,
            'statement_number' => 'STMT-001',
            'opening_balance' => 10000.00,
            'closing_balance' => 12000.00,
        ]);

        $this->reconciliation = BankReconciliation::factory()->create([
            'account_id' => $this->bankAccount->id,
            'bank_statement_id' => $this->bankStatement->id,
            'status' => 'in_progress',
        ]);
    }

    /** @test */
    public function it_can_auto_match_exact_amount_and_date_transactions()
    {
        // Create matching transactions
        $bankTransaction = BankTransaction::factory()->create([
            'bank_statement_id' => $this->bankStatement->id,
            'amount' => 500.00,
            'description' => 'Payment to Vendor ABC',
            'transaction_date' => '2024-01-15',
            'is_matched' => false,
        ]);

        $bookTransaction = Transaction::factory()->create([
            'account_id' => $this->bankAccount->id,
            'amount' => 500.00,
            'description' => 'Payment to Vendor ABC',
            'transaction_date' => '2024-01-15',
            'is_reconciled' => false,
        ]);

        $matchedCount = $this->service->autoMatchTransactions($this->reconciliation);

        $this->assertEquals(1, $matchedCount);

        // Verify transactions are marked as matched
        $bankTransaction->refresh();
        $bookTransaction->refresh();

        $this->assertTrue($bankTransaction->is_matched);
        $this->assertTrue($bookTransaction->is_reconciled);

        // Verify match record is created
        $this->assertDatabaseHas('bank_reconciliation_matches', [
            'bank_reconciliation_id' => $this->reconciliation->id,
            'bank_transaction_id' => $bankTransaction->id,
            'book_transaction_id' => $bookTransaction->id,
            'match_type' => 'auto',
            'confidence_score' => 100,
        ]);
    }

    /** @test */
    public function it_can_auto_match_transactions_with_similar_amounts()
    {
        // Create transactions with slightly different amounts (within tolerance)
        $bankTransaction = BankTransaction::factory()->create([
            'bank_statement_id' => $this->bankStatement->id,
            'amount' => 500.00,
            'description' => 'Payment to Vendor',
            'transaction_date' => '2024-01-15',
            'is_matched' => false,
        ]);

        $bookTransaction = Transaction::factory()->create([
            'account_id' => $this->bankAccount->id,
            'amount' => 500.50, // Small difference
            'description' => 'Payment to Vendor',
            'transaction_date' => '2024-01-15',
            'is_reconciled' => false,
        ]);

        $matchedCount = $this->service->autoMatchTransactions($this->reconciliation);

        $this->assertEquals(1, $matchedCount);

        // Verify match with lower confidence score
        $this->assertDatabaseHas('bank_reconciliation_matches', [
            'bank_reconciliation_id' => $this->reconciliation->id,
            'bank_transaction_id' => $bankTransaction->id,
            'book_transaction_id' => $bookTransaction->id,
            'match_type' => 'auto',
        ]);
    }

    /** @test */
    public function it_can_auto_match_transactions_with_similar_dates()
    {
        // Create transactions with dates within tolerance
        $bankTransaction = BankTransaction::factory()->create([
            'bank_statement_id' => $this->bankStatement->id,
            'amount' => 750.00,
            'description' => 'Customer Payment',
            'transaction_date' => '2024-01-15',
            'is_matched' => false,
        ]);

        $bookTransaction = Transaction::factory()->create([
            'account_id' => $this->bankAccount->id,
            'amount' => 750.00,
            'description' => 'Customer Payment',
            'transaction_date' => '2024-01-16', // One day difference
            'is_reconciled' => false,
        ]);

        $matchedCount = $this->service->autoMatchTransactions($this->reconciliation);

        $this->assertEquals(1, $matchedCount);
    }

    /** @test */
    public function it_does_not_match_transactions_with_large_amount_differences()
    {
        $bankTransaction = BankTransaction::factory()->create([
            'bank_statement_id' => $this->bankStatement->id,
            'amount' => 500.00,
            'description' => 'Payment',
            'transaction_date' => '2024-01-15',
            'is_matched' => false,
        ]);

        $bookTransaction = Transaction::factory()->create([
            'account_id' => $this->bankAccount->id,
            'amount' => 600.00, // Large difference
            'description' => 'Payment',
            'transaction_date' => '2024-01-15',
            'is_reconciled' => false,
        ]);

        $matchedCount = $this->service->autoMatchTransactions($this->reconciliation);

        $this->assertEquals(0, $matchedCount);

        // Verify no match record is created
        $this->assertDatabaseMissing('bank_reconciliation_matches', [
            'bank_reconciliation_id' => $this->reconciliation->id,
            'bank_transaction_id' => $bankTransaction->id,
            'book_transaction_id' => $bookTransaction->id,
        ]);
    }

    /** @test */
    public function it_does_not_match_transactions_with_large_date_differences()
    {
        $bankTransaction = BankTransaction::factory()->create([
            'bank_statement_id' => $this->bankStatement->id,
            'amount' => 500.00,
            'description' => 'Payment',
            'transaction_date' => '2024-01-15',
            'is_matched' => false,
        ]);

        $bookTransaction = Transaction::factory()->create([
            'account_id' => $this->bankAccount->id,
            'amount' => 500.00,
            'description' => 'Payment',
            'transaction_date' => '2024-01-25', // 10 days difference
            'is_reconciled' => false,
        ]);

        $matchedCount = $this->service->autoMatchTransactions($this->reconciliation);

        $this->assertEquals(0, $matchedCount);
    }

    /** @test */
    public function it_can_manually_match_transactions()
    {
        $bankTransaction = BankTransaction::factory()->create([
            'bank_statement_id' => $this->bankStatement->id,
            'amount' => 1000.00,
            'is_matched' => false,
        ]);

        $bookTransaction = Transaction::factory()->create([
            'account_id' => $this->bankAccount->id,
            'amount' => 1000.00,
            'is_reconciled' => false,
        ]);

        $result = $this->service->manualMatch(
            $this->reconciliation,
            [$bankTransaction->id],
            [$bookTransaction->id],
            'Manual match for large transaction'
        );

        $this->assertTrue($result);

        // Verify match record
        $this->assertDatabaseHas('bank_reconciliation_matches', [
            'bank_reconciliation_id' => $this->reconciliation->id,
            'bank_transaction_id' => $bankTransaction->id,
            'book_transaction_id' => $bookTransaction->id,
            'match_type' => 'manual',
            'notes' => 'Manual match for large transaction',
        ]);

        // Verify transactions are marked as matched
        $bankTransaction->refresh();
        $bookTransaction->refresh();

        $this->assertTrue($bankTransaction->is_matched);
        $this->assertTrue($bookTransaction->is_reconciled);
    }

    /** @test */
    public function it_can_complete_balanced_reconciliation()
    {
        // Set up balanced reconciliation
        $this->reconciliation->update([
            'statement_opening_balance' => 10000.00,
            'statement_closing_balance' => 12000.00,
            'book_opening_balance' => 10000.00,
            'book_closing_balance' => 12000.00,
        ]);

        $result = $this->service->completeReconciliation($this->reconciliation);

        $this->assertTrue($result);

        $this->reconciliation->refresh();
        $this->assertEquals('completed', $this->reconciliation->status);
        $this->assertNotNull($this->reconciliation->reconciled_at);
    }

    /** @test */
    public function it_cannot_complete_unbalanced_reconciliation()
    {
        // Set up unbalanced reconciliation
        $this->reconciliation->update([
            'statement_opening_balance' => 10000.00,
            'statement_closing_balance' => 12000.00,
            'book_opening_balance' => 10000.00,
            'book_closing_balance' => 11500.00, // Unbalanced
        ]);

        $result = $this->service->completeReconciliation($this->reconciliation);

        $this->assertFalse($result);

        $this->reconciliation->refresh();
        $this->assertEquals('in_progress', $this->reconciliation->status);
        $this->assertNull($this->reconciliation->reconciled_at);
    }

    /** @test */
    public function it_calculates_confidence_score_correctly()
    {
        $bankTransaction = BankTransaction::factory()->create([
            'amount' => 500.00,
            'description' => 'Payment to ABC Corp',
            'transaction_date' => '2024-01-15',
        ]);

        $bookTransaction = Transaction::factory()->create([
            'amount' => 500.00,
            'description' => 'Payment to ABC Corp',
            'transaction_date' => '2024-01-15',
        ]);

        $confidence = $this->service->calculateConfidenceScore($bankTransaction, $bookTransaction);

        // Perfect match should have 100% confidence
        $this->assertEquals(100, $confidence);
    }

    /** @test */
    public function it_calculates_lower_confidence_for_partial_matches()
    {
        $bankTransaction = BankTransaction::factory()->create([
            'amount' => 500.00,
            'description' => 'Payment to ABC',
            'transaction_date' => '2024-01-15',
        ]);

        $bookTransaction = Transaction::factory()->create([
            'amount' => 500.50, // Slightly different amount
            'description' => 'Payment to ABC Corp', // Different description
            'transaction_date' => '2024-01-16', // Different date
        ]);

        $confidence = $this->service->calculateConfidenceScore($bankTransaction, $bookTransaction);

        // Partial match should have lower confidence
        $this->assertLessThan(100, $confidence);
        $this->assertGreaterThan(0, $confidence);
    }

    /** @test */
    public function it_can_unmatch_transactions()
    {
        // Create a matched pair
        $bankTransaction = BankTransaction::factory()->create([
            'bank_statement_id' => $this->bankStatement->id,
            'is_matched' => true,
        ]);

        $bookTransaction = Transaction::factory()->create([
            'account_id' => $this->bankAccount->id,
            'is_reconciled' => true,
        ]);

        // Create match record
        $this->reconciliation->matches()->create([
            'bank_transaction_id' => $bankTransaction->id,
            'book_transaction_id' => $bookTransaction->id,
            'match_type' => 'manual',
            'confidence_score' => 100,
        ]);

        $result = $this->service->unmatchTransactions(
            $this->reconciliation,
            [$bankTransaction->id],
            [$bookTransaction->id]
        );

        $this->assertTrue($result);

        // Verify transactions are unmarked
        $bankTransaction->refresh();
        $bookTransaction->refresh();

        $this->assertFalse($bankTransaction->is_matched);
        $this->assertFalse($bookTransaction->is_reconciled);

        // Verify match record is deleted
        $this->assertDatabaseMissing('bank_reconciliation_matches', [
            'bank_reconciliation_id' => $this->reconciliation->id,
            'bank_transaction_id' => $bankTransaction->id,
            'book_transaction_id' => $bookTransaction->id,
        ]);
    }

    /** @test */
    public function it_gets_suggested_matches_for_bank_transaction()
    {
        $bankTransaction = BankTransaction::factory()->create([
            'bank_statement_id' => $this->bankStatement->id,
            'amount' => 500.00,
            'description' => 'Customer Payment',
            'transaction_date' => '2024-01-15',
            'is_matched' => false,
        ]);

        // Create potential matches
        $exactMatch = Transaction::factory()->create([
            'account_id' => $this->bankAccount->id,
            'amount' => 500.00,
            'description' => 'Customer Payment',
            'transaction_date' => '2024-01-15',
            'is_reconciled' => false,
        ]);

        $partialMatch = Transaction::factory()->create([
            'account_id' => $this->bankAccount->id,
            'amount' => 500.50,
            'description' => 'Customer Payment ABC',
            'transaction_date' => '2024-01-16',
            'is_reconciled' => false,
        ]);

        $suggestions = $this->service->getSuggestedMatches($this->reconciliation, $bankTransaction);

        $this->assertCount(2, $suggestions);

        // Exact match should have higher confidence
        $exactMatchSuggestion = $suggestions->firstWhere('id', $exactMatch->id);
        $partialMatchSuggestion = $suggestions->firstWhere('id', $partialMatch->id);

        $this->assertGreaterThan($partialMatchSuggestion['confidence_score'], $exactMatchSuggestion['confidence_score']);
    }
}
