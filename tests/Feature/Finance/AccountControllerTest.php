<?php

namespace Tests\Feature\Finance;

use App\Models\Finance\Account;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AccountControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $staff;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'staff']);
        Role::create(['name' => 'customer']);

        // Create users
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->staff = User::factory()->create();
        $this->staff->assignRole('staff');

        $this->customer = User::factory()->create();
        $this->customer->assignRole('customer');
    }

    /** @test */
    public function admin_can_view_accounts_index()
    {
        $response = $this->actingAs($this->admin)->get(route('finance.accounts.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Finance/Accounts/Index'));
    }

    /** @test */
    public function staff_can_view_accounts_index()
    {
        $response = $this->actingAs($this->staff)->get(route('finance.accounts.index'));
        $response->assertStatus(200);
    }

    /** @test */
    public function customer_cannot_view_accounts_index()
    {
        $response = $this->actingAs($this->customer)->get(route('finance.accounts.index'));
        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_view_create_account_form()
    {
        $response = $this->actingAs($this->admin)->get(route('finance.accounts.create'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Finance/Accounts/Create'));
    }

    /** @test */
    public function admin_can_create_account()
    {
        $accountData = [
            'name' => 'Test Account',
            'type' => 'checking',
            'account_number' => '123456789',
            'bank_name' => 'Test Bank',
            'initial_balance' => 1000.00,
            'currency' => 'USD',
            'description' => 'Test account description',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('finance.accounts.store'), $accountData);

        $response->assertRedirect();
        $this->assertDatabaseHas('accounts', [
            'name' => 'Test Account',
            'type' => 'checking',
            'user_id' => $this->admin->id,
        ]);
    }

    /** @test */
    public function account_creation_requires_valid_data()
    {
        $response = $this->actingAs($this->admin)
            ->post(route('finance.accounts.store'), []);

        $response->assertSessionHasErrors(['name', 'type', 'initial_balance', 'currency']);
    }

    /** @test */
    public function account_creation_validates_account_type()
    {
        $accountData = [
            'name' => 'Test Account',
            'type' => 'invalid_type',
            'initial_balance' => 1000.00,
            'currency' => 'USD',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('finance.accounts.store'), $accountData);

        $response->assertSessionHasErrors(['type']);
    }

    /** @test */
    public function admin_can_view_account_details()
    {
        $account = Account::create([
            'name' => 'Test Account',
            'type' => 'checking',
            'initial_balance' => 1000.00,
            'balance' => 1000.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('finance.accounts.show', $account));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Finance/Accounts/Show')
                ->has('account')
                ->where('account.id', $account->id)
        );
    }

    /** @test */
    public function user_cannot_view_other_users_accounts()
    {
        $otherUser = User::factory()->create();
        $otherUser->assignRole('admin');

        $account = Account::create([
            'name' => 'Other User Account',
            'type' => 'checking',
            'initial_balance' => 1000.00,
            'balance' => 1000.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $otherUser->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('finance.accounts.show', $account));

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_edit_account()
    {
        $account = Account::create([
            'name' => 'Test Account',
            'type' => 'checking',
            'initial_balance' => 1000.00,
            'balance' => 1000.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('finance.accounts.edit', $account));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Finance/Accounts/Edit')
                ->has('account')
                ->where('account.id', $account->id)
        );
    }

    /** @test */
    public function admin_can_update_account()
    {
        $account = Account::create([
            'name' => 'Test Account',
            'type' => 'checking',
            'initial_balance' => 1000.00,
            'balance' => 1000.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $this->admin->id,
        ]);

        $updateData = [
            'name' => 'Updated Account Name',
            'type' => 'savings',
            'account_number' => '987654321',
            'bank_name' => 'Updated Bank',
            'initial_balance' => 1500.00,
            'currency' => 'EUR',
            'description' => 'Updated description',
            'is_active' => false,
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('finance.accounts.update', $account), $updateData);

        $response->assertRedirect();
        $this->assertDatabaseHas('accounts', [
            'id' => $account->id,
            'name' => 'Updated Account Name',
            'type' => 'savings',
            'currency' => 'EUR',
            'is_active' => false,
        ]);
    }

    /** @test */
    public function admin_can_delete_account()
    {
        $account = Account::create([
            'name' => 'Test Account',
            'type' => 'checking',
            'initial_balance' => 1000.00,
            'balance' => 1000.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('finance.accounts.destroy', $account));

        $response->assertRedirect();
        $this->assertDatabaseMissing('accounts', ['id' => $account->id]);
    }

    /** @test */
    public function accounts_index_can_be_searched()
    {
        Account::create([
            'name' => 'Checking Account',
            'type' => 'checking',
            'initial_balance' => 1000.00,
            'balance' => 1000.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $this->admin->id,
        ]);

        Account::create([
            'name' => 'Savings Account',
            'type' => 'savings',
            'initial_balance' => 500.00,
            'balance' => 500.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('finance.accounts.index', ['search' => 'Checking']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('accounts.data', 1)
                ->where('accounts.data.0.name', 'Checking Account')
        );
    }

    /** @test */
    public function accounts_index_can_be_filtered_by_type()
    {
        Account::create([
            'name' => 'Checking Account',
            'type' => 'checking',
            'initial_balance' => 1000.00,
            'balance' => 1000.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $this->admin->id,
        ]);

        Account::create([
            'name' => 'Savings Account',
            'type' => 'savings',
            'initial_balance' => 500.00,
            'balance' => 500.00,
            'currency' => 'USD',
            'is_active' => true,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('finance.accounts.index', ['type' => 'savings']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('accounts.data', 1)
                ->where('accounts.data.0.type', 'savings')
        );
    }
}
