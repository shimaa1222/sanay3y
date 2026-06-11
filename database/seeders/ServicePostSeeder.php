<?php

namespace Database\Seeders;

use App\Models\Craftsman;
use App\Models\PostResponse;
use App\Models\ServicePost;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServicePostSeeder extends Seeder
{
    public function run(): void
    {
        $clients    = User::where('role', 'client')->get();
        $craftsmen  = Craftsman::where('status', 'approved')->get();

        if ($clients->isEmpty()) {
            $this->command->warn('⚠️ No clients found, skipping ServicePostSeeder');
            return;
        }

        // ── 20 منشور نشط ──────────────────────────────────────
        ServicePost::factory()
            ->count(20)
            ->state(['client_id' => fn() => $clients->random()->id, 'is_approved' => true, 'status' => 'active'])
            ->create()
            ->each(function ($post) use ($craftsmen) {
                // كل منشور يحصل على 1-4 ردود من حرفيين
                if ($craftsmen->isNotEmpty()) {
                    $respondents = $craftsmen->random(min(rand(1, 4), $craftsmen->count()));
                    foreach ($respondents as $craftsman) {
                        PostResponse::factory()->create([
                            'post_id'      => $post->id,
                            'craftsman_id' => $craftsman->id,
                        ]);
                    }
                }
            });

        // ── 5 منشور في انتظار الموافقة ─────────────────────────
        ServicePost::factory()
            ->pending()
            ->count(5)
            ->state(['client_id' => fn() => $clients->random()->id])
            ->create();

        // ── 5 منشور مغلق ──────────────────────────────────────
        ServicePost::factory()
            ->closed()
            ->count(5)
            ->state(['client_id' => fn() => $clients->random()->id])
            ->create();

        $this->command->info('✅ ServicePosts seeded (20 active + 5 pending + 5 closed)');
    }
}
