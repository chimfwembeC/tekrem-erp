<?php

namespace Tests\Unit\AI;

use App\Models\AI\PromptTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromptTemplateModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_belongs_to_user()
    {
        $user = User::factory()->create();
        $template = PromptTemplate::factory()->create(['user_id' => $user->id]);

        $this->assertEquals($user->id, $template->user->id);
    }

    public function test_it_can_extract_variables_from_template()
    {
        $template = new PromptTemplate([
            'template' => 'Hello {{name}}, your role is {{role}} at {{company}}. Contact {{email}} for more info.'
        ]);

        $variables = $template->extractVariables();
        $expected = ['name', 'role', 'company', 'email'];

        $this->assertEquals($expected, $variables);
    }

    public function test_it_handles_template_without_variables()
    {
        $template = new PromptTemplate([
            'template' => 'This is a simple template without any variables.'
        ]);

        $variables = $template->extractVariables();
        $this->assertEquals([], $variables);
    }

    public function test_it_handles_duplicate_variables()
    {
        $template = new PromptTemplate([
            'template' => 'Hello {{name}}, {{name}} is your name. Your role is {{role}}.'
        ]);

        $variables = $template->extractVariables();
        $expected = ['name', 'role'];

        $this->assertEquals($expected, $variables);
    }

    public function test_it_can_render_template_with_data()
    {
        $template = PromptTemplate::factory()->create([
            'template' => 'Hello {{name}}, your role is {{role}} at {{company}}.',
            'variables' => ['name', 'role', 'company'],
        ]);

        $data = [
            'name' => 'John Smith',
            'role' => 'Developer',
            'company' => 'Tech Corp'
        ];

        $rendered = $template->render($data);
        $expected = 'Hello John Smith, your role is Developer at Tech Corp.';

        $this->assertEquals($expected, $rendered);
    }

    public function test_it_throws_exception_for_missing_variables()
    {
        $template = PromptTemplate::factory()->create([
            'template' => 'Hello {{name}}, your role is {{role}}.',
            'variables' => ['name', 'role'],
        ]);

        $data = ['name' => 'John']; // Missing 'role'

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Missing required variables: role');

        $template->render($data);
    }

    public function test_it_can_validate_template_data()
    {
        $template = PromptTemplate::factory()->create([
            'template' => 'Hello {{name}}, your role is {{role}}.',
            'variables' => ['name', 'role'],
        ]);

        $validData = ['name' => 'John', 'role' => 'Developer'];
        $invalidData = ['name' => 'John']; // Missing 'role'

        $this->assertTrue($template->validateData($validData));
        $this->assertFalse($template->validateData($invalidData));
    }

    public function test_it_can_get_missing_variables()
    {
        $template = PromptTemplate::factory()->create([
            'template' => 'Hello {{name}}, your role is {{role}} at {{company}}.',
            'variables' => ['name', 'role', 'company'],
        ]);

        $data = ['name' => 'John', 'role' => 'Developer']; // Missing 'company'

        $missing = $template->getMissingVariables($data);
        $this->assertEquals(['company'], $missing);
    }

    public function test_it_can_scope_by_category()
    {
        $crmTemplate = PromptTemplate::factory()->crm()->create();
        $financeTemplate = PromptTemplate::factory()->finance()->create();

        $crmTemplates = PromptTemplate::byCategory('crm')->get();

        $this->assertEquals(1, $crmTemplates->count());
        $this->assertTrue($crmTemplates->contains($crmTemplate));
        $this->assertFalse($crmTemplates->contains($financeTemplate));
    }

    public function test_it_can_scope_public_templates()
    {
        $publicTemplate = PromptTemplate::factory()->public()->create();
        $privateTemplate = PromptTemplate::factory()->private()->create();

        $publicTemplates = PromptTemplate::public()->get();

        $this->assertEquals(1, $publicTemplates->count());
        $this->assertTrue($publicTemplates->contains($publicTemplate));
        $this->assertFalse($publicTemplates->contains($privateTemplate));
    }

    public function test_it_can_scope_system_templates()
    {
        $systemTemplate = PromptTemplate::factory()->system()->create();
        $userTemplate = PromptTemplate::factory()->create(['is_system' => false]);

        $systemTemplates = PromptTemplate::system()->get();

        $this->assertEquals(1, $systemTemplates->count());
        $this->assertTrue($systemTemplates->contains($systemTemplate));
        $this->assertFalse($systemTemplates->contains($userTemplate));
    }

    public function test_it_can_scope_by_tags()
    {
        $template1 = PromptTemplate::factory()->create(['tags' => ['crm', 'sales']]);
        $template2 = PromptTemplate::factory()->create(['tags' => ['finance', 'accounting']]);
        $template3 = PromptTemplate::factory()->create(['tags' => ['crm', 'marketing']]);

        $crmTemplates = PromptTemplate::withTags(['crm'])->get();

        $this->assertEquals(2, $crmTemplates->count());
        $this->assertTrue($crmTemplates->contains($template1));
        $this->assertTrue($crmTemplates->contains($template3));
        $this->assertFalse($crmTemplates->contains($template2));
    }

    public function test_it_can_scope_popular_templates()
    {
        $popularTemplate = PromptTemplate::factory()->popular()->create();
        $unpopularTemplate = PromptTemplate::factory()->create(['usage_count' => 5]);

        $popularTemplates = PromptTemplate::popular(50)->get();

        $this->assertEquals(1, $popularTemplates->count());
        $this->assertTrue($popularTemplates->contains($popularTemplate));
        $this->assertFalse($popularTemplates->contains($unpopularTemplate));
    }

    public function test_it_can_scope_highly_rated_templates()
    {
        $highRatedTemplate = PromptTemplate::factory()->highlyRated()->create();
        $lowRatedTemplate = PromptTemplate::factory()->create(['avg_rating' => 2.5]);

        $highRatedTemplates = PromptTemplate::highlyRated(4.0)->get();

        $this->assertEquals(1, $highRatedTemplates->count());
        $this->assertTrue($highRatedTemplates->contains($highRatedTemplate));
        $this->assertFalse($highRatedTemplates->contains($lowRatedTemplate));
    }

    public function test_it_can_increment_usage_count()
    {
        $template = PromptTemplate::factory()->create(['usage_count' => 5]);

        $template->incrementUsage();

        $this->assertEquals(6, $template->fresh()->usage_count);
    }

    public function test_it_can_add_rating()
    {
        $template = PromptTemplate::factory()->create([
            'avg_rating' => null,
            'rating_count' => 0,
        ]);

        $template->addRating(5);
        $this->assertEquals(5.0, $template->fresh()->avg_rating);
        $this->assertEquals(1, $template->fresh()->rating_count);

        $template->addRating(3);
        $this->assertEquals(4.0, $template->fresh()->avg_rating);
        $this->assertEquals(2, $template->fresh()->rating_count);
    }

    public function test_it_can_duplicate_template()
    {
        $user = User::factory()->create();
        $original = PromptTemplate::factory()->create([
            'user_id' => $user->id,
            'name' => 'Original Template',
            'template' => 'Hello {{name}}',
            'variables' => ['name'],
        ]);

        $duplicate = $original->duplicate($user);

        $this->assertEquals('Original Template (Copy)', $duplicate->name);
        $this->assertEquals($original->template, $duplicate->template);
        $this->assertEquals($original->variables, $duplicate->variables);
        $this->assertEquals($user->id, $duplicate->user_id);
        $this->assertNotEquals($original->id, $duplicate->id);
    }

    public function test_it_casts_variables_to_array()
    {
        $template = PromptTemplate::factory()->create([
            'variables' => ['name', 'role', 'company'],
        ]);

        $this->assertIsArray($template->variables);
        $this->assertContains('name', $template->variables);
        $this->assertContains('role', $template->variables);
        $this->assertContains('company', $template->variables);
    }

    public function test_it_casts_example_data_to_array()
    {
        $template = PromptTemplate::factory()->create([
            'example_data' => ['name' => 'John', 'role' => 'Developer'],
        ]);

        $this->assertIsArray($template->example_data);
        $this->assertEquals('John', $template->example_data['name']);
        $this->assertEquals('Developer', $template->example_data['role']);
    }

    public function test_it_casts_tags_to_array()
    {
        $template = PromptTemplate::factory()->create([
            'tags' => ['crm', 'sales', 'automation'],
        ]);

        $this->assertIsArray($template->tags);
        $this->assertContains('crm', $template->tags);
        $this->assertContains('sales', $template->tags);
        $this->assertContains('automation', $template->tags);
    }

    public function test_it_casts_boolean_fields()
    {
        $template = PromptTemplate::factory()->create([
            'is_public' => 1,
            'is_system' => 0,
        ]);

        $this->assertIsBool($template->is_public);
        $this->assertIsBool($template->is_system);
        $this->assertTrue($template->is_public);
        $this->assertFalse($template->is_system);
    }

    public function test_it_has_fillable_attributes()
    {
        $fillable = [
            'user_id',
            'name',
            'slug',
            'category',
            'description',
            'template',
            'variables',
            'example_data',
            'is_public',
            'is_system',
            'usage_count',
            'avg_rating',
            'rating_count',
            'tags',
        ];

        $template = new PromptTemplate();
        $this->assertEquals($fillable, $template->getFillable());
    }

    public function test_it_generates_unique_slug()
    {
        $user = User::factory()->create();
        $template1 = PromptTemplate::factory()->create([
            'user_id' => $user->id,
            'name' => 'Test Template'
        ]);
        $template2 = PromptTemplate::factory()->create([
            'user_id' => $user->id,
            'name' => 'Test Template'
        ]);

        $this->assertNotEquals($template1->slug, $template2->slug);
        $this->assertEquals('test-template', $template1->slug);
        $this->assertEquals('test-template-1', $template2->slug);
    }

    public function test_it_can_search_templates()
    {
        $template1 = PromptTemplate::factory()->create(['name' => 'Lead Qualification']);
        $template2 = PromptTemplate::factory()->create(['name' => 'Finance Analysis']);
        $template3 = PromptTemplate::factory()->create([
            'name' => 'Support Ticket',
            'description' => 'Lead management template'
        ]);

        $results = PromptTemplate::search('Lead')->get();

        $this->assertEquals(2, $results->count());
        $this->assertTrue($results->contains($template1));
        $this->assertTrue($results->contains($template3));
        $this->assertFalse($results->contains($template2));
    }
}
