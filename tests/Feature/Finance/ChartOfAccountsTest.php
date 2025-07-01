<?php

namespace Tests\Feature\Finance;

use App\Models\Finance\Account;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ChartOfAccountsTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Run the seeder to set up roles and permissions
        $this->artisan('db:seed', ['--class' => 'RolesAndPermissionsSeeder']);

        // Create admin user
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('admin');

        // Create regular user with staff role (which has finance permissions via seeder)
        $this->user = User::factory()->create();
        $this->user->assignRole('staff');
    }

    /** @test */
    public function it_can_display_chart_of_accounts_index()
    {
        $this->actingAs($this->user);

        // Create some test accounts
        $parentAccount = Account::factory()->create([
            'account_code' => '1000',
            'name' => 'Assets',
            'account_category' => 'assets',
            'type' => 'header',
            'parent_account_id' => null,
            'level' => 0,
            'user_id' => $this->user->id,
        ]);

        $childAccount = Account::factory()->create([
            'account_code' => '1100',
            'name' => 'Current Assets',
            'account_category' => 'assets',
            'type' => 'header',
            'parent_account_id' => $parentAccount->id,
            'level' => 1,
            'user_id' => $this->user->id,
        ]);

        $response = $this->get(route('finance.chart-of-accounts.index'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Finance/ChartOfAccounts/Index')
                ->has('accounts.data', 2)
                ->where('accounts.data.0.account_code', '1000')
                ->where('accounts.data.1.account_code', '1100')
            );
    }

    /** @test */
    public function it_can_create_a_new_chart_of_account()
    {
        $this->actingAs($this->user);

        $accountData = [
            'account_code' => '1000',
            'name' => 'Cash',
            'description' => 'Cash account for daily operations',
            'account_category' => 'assets',
            'account_subcategory' => 'current_assets',
            'type' => 'detail',
            'normal_balance' => 'debit',
            'is_active' => true,
            'is_system_account' => false,
            'parent_id' => null,
        ];

        $response = $this->post(route('finance.chart-of-accounts.store'), $accountData);

        $response->assertRedirect(route('finance.chart-of-accounts.index'));

        $this->assertDatabaseHas('chart_of_accounts', [
            'account_code' => '1000',
            'name' => 'Cash',
            'account_category' => 'assets',
            'type' => 'detail',
            'normal_balance' => 'debit',
        ]);
    }

    /** @test */
    public function it_can_create_hierarchical_accounts()
    {
        $this->actingAs($this->user);

        // Create parent account
        $parentAccount = Account::factory()->create([
            'account_code' => '1000',
            'name' => 'Assets',
            'account_category' => 'assets',
            'type' => 'header',
            'parent_account_id' => null,
            'level' => 0,
            'user_id' => $this->user->id,
        ]);

        // Create child account
        $childData = [
            'account_code' => '1100',
            'name' => 'Current Assets',
            'account_category' => 'assets',
            'account_subcategory' => 'current_assets',
            'type' => 'header',
            'normal_balance' => 'debit',
            'parent_id' => $parentAccount->id,
            'is_active' => true,
            'is_system_account' => false,
        ];

        $response = $this->post(route('finance.chart-of-accounts.store'), $childData);

        $response->assertRedirect(route('finance.chart-of-accounts.index'));

        $childAccount = Account::where('account_code', '1100')->first();
        $this->assertEquals($parentAccount->id, $childAccount->parent_account_id);
        $this->assertEquals(1, $childAccount->level);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_account()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('finance.chart-of-accounts.store'), []);

        $response->assertSessionHasErrors([
            'account_code',
            'name',
            'account_category',
            'type',
            'normal_balance',
        ]);
    }

    /** @test */
    public function it_validates_unique_account_code()
    {
        $this->actingAs($this->user);

        Account::factory()->create(['account_code' => '1000', 'user_id' => $this->user->id]);

        $accountData = [
            'account_code' => '1000', // Duplicate code
            'name' => 'Another Cash Account',
            'account_category' => 'assets',
            'type' => 'detail',
            'normal_balance' => 'debit',
            'is_active' => true,
            'is_system_account' => false,
        ];

        $response = $this->post(route('finance.chart-of-accounts.store'), $accountData);

        $response->assertSessionHasErrors(['account_code']);
    }

    /** @test */
    public function it_can_update_an_existing_account()
    {
        $this->actingAs($this->user);

        $account = Account::factory()->create([
            'account_code' => '1000',
            'name' => 'Cash',
            'account_category' => 'assets',
            'user_id' => $this->user->id,
        ]);

        $updateData = [
            'account_code' => '1000',
            'name' => 'Updated Cash Account',
            'description' => 'Updated description',
            'account_category' => 'assets',
            'account_subcategory' => 'current_assets',
            'type' => 'detail',
            'normal_balance' => 'debit',
            'is_active' => true,
            'is_system_account' => false,
        ];

        $response = $this->put(route('finance.chart-of-accounts.update', $account), $updateData);

        $response->assertRedirect(route('finance.chart-of-accounts.index'));

        $this->assertDatabaseHas('chart_of_accounts', [
            'id' => $account->id,
            'name' => 'Updated Cash Account',
            'description' => 'Updated description',
        ]);
    }

    /** @test */
    public function it_can_delete_an_account_without_children()
    {
        $this->actingAs($this->user);

        $account = Account::factory()->create([
            'account_code' => '1000',
            'name' => 'Cash',
            'is_system_account' => false,
            'user_id' => $this->user->id,
        ]);

        $response = $this->delete(route('finance.chart-of-accounts.destroy', $account));

        $response->assertRedirect(route('finance.chart-of-accounts.index'));
        $this->assertDatabaseMissing('chart_of_accounts', ['id' => $account->id]);
    }

    /** @test */
    public function it_cannot_delete_system_accounts()
    {
        $this->actingAs($this->user);

        $systemAccount = Account::factory()->create([
            'account_code' => '1000',
            'name' => 'System Cash Account',
            'is_system_account' => true,
            'user_id' => $this->user->id,
        ]);

        $response = $this->delete(route('finance.chart-of-accounts.destroy', $systemAccount));

        $response->assertSessionHasErrors(['error']);
        $this->assertDatabaseHas('chart_of_accounts', ['id' => $systemAccount->id]);
    }

    /** @test */
    public function it_cannot_delete_accounts_with_children()
    {
        $this->actingAs($this->user);

        $parentAccount = Account::factory()->create([
            'account_code' => '1000',
            'name' => 'Assets',
            'is_system_account' => false,
            'user_id' => $this->user->id,
        ]);

        $childAccount = Account::factory()->create([
            'account_code' => '1100',
            'name' => 'Current Assets',
            'parent_account_id' => $parentAccount->id,
            'is_system_account' => false,
            'user_id' => $this->user->id,
        ]);

        $response = $this->delete(route('finance.chart-of-accounts.destroy', $parentAccount));

        $response->assertSessionHasErrors(['error']);
        $this->assertDatabaseHas('chart_of_accounts', ['id' => $parentAccount->id]);
    }

    /** @test */
    public function it_can_display_tree_view()
    {
        $this->actingAs($this->user);

        // Create hierarchical structure
        $assets = Account::factory()->create([
            'account_code' => '1000',
            'name' => 'Assets',
            'account_category' => 'assets',
            'type' => 'header',
            'level' => 0,
            'user_id' => $this->user->id,
        ]);

        $currentAssets = Account::factory()->create([
            'account_code' => '1100',
            'name' => 'Current Assets',
            'account_category' => 'assets',
            'type' => 'header',
            'parent_account_id' => $assets->id,
            'level' => 1,
            'user_id' => $this->user->id,
        ]);

        $cash = Account::factory()->create([
            'account_code' => '1110',
            'name' => 'Cash',
            'account_category' => 'assets',
            'type' => 'detail',
            'parent_account_id' => $currentAssets->id,
            'level' => 2,
            'user_id' => $this->user->id,
        ]);

        $response = $this->get(route('finance.chart-of-accounts.tree'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Finance/ChartOfAccounts/Tree')
                ->has('accounts', 3)
            );
    }

    /** @test */
    public function it_requires_finance_permissions()
    {
        $userWithoutPermissions = User::factory()->create();

        $this->actingAs($userWithoutPermissions);

        $response = $this->get(route('finance.chart-of-accounts.index'));
        $response->assertStatus(403);

        $response = $this->post(route('finance.chart-of-accounts.store'), []);
        $response->assertStatus(403);
    }

    /** @test */
    public function it_can_filter_accounts_by_category()
    {
        $this->actingAs($this->user);

        Account::factory()->create(['account_category' => 'assets', 'user_id' => $this->user->id]);
        Account::factory()->create(['account_category' => 'liabilities', 'user_id' => $this->user->id]);
        Account::factory()->create(['account_category' => 'equity', 'user_id' => $this->user->id]);

        $response = $this->get(route('finance.chart-of-accounts.index', ['category' => 'assets']));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Finance/ChartOfAccounts/Index')
                ->has('accounts.data', 1)
                ->where('accounts.data.0.account_category', 'assets')
            );
    }

    /** @test */
    public function it_can_search_accounts_by_name_or_code()
    {
        $this->actingAs($this->user);

        Account::factory()->create([
            'account_code' => '1000',
            'name' => 'Cash Account',
            'user_id' => $this->user->id,
        ]);

        Account::factory()->create([
            'account_code' => '2000',
            'name' => 'Accounts Payable',
            'user_id' => $this->user->id,
        ]);

        // Search by name
        $response = $this->get(route('finance.chart-of-accounts.index', ['search' => 'Cash']));
        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->has('accounts.data', 1)
                ->where('accounts.data.0.name', 'Cash Account')
            );

        // Search by code
        $response = $this->get(route('finance.chart-of-accounts.index', ['search' => '2000']));
        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->has('accounts.data', 1)
                ->where('accounts.data.0.account_code', '2000')
            );
    }
}
