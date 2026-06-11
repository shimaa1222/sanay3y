<?php

namespace Database\Seeders;

use App\Models\Craft;
use App\Models\Craftsman;
use App\Models\CraftsmanPortfolio;
use App\Models\CraftsmanService;
use App\Models\CraftsmanSkill;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CraftsmanSeeder extends Seeder
{
    public function run(): void
    {
        $crafts = Craft::all();

        // ── Craftsman تجريبي مرتبط بالـ test user ──────────────
        $testUser = User::where('email', 'craftsman@test.com')->first();
        if ($testUser) {
            $craftsman = Craftsman::updateOrCreate(
                ['email' => 'craftsman@test.com'],
                [
                    'user_id'     => $testUser->id,
                    'first_name'  => 'حرفي',
                    'last_name'   => 'تجريبي',
                    'phone'       => '01200000002',
                    'national_id_front' => 'nationals/sample_front.jpg',
                    'national_id_back'  => 'nationals/sample_back.jpg',
                    'country'     => 'مصر',
                    'city'        => 'القاهرة',
                    'district'    => 'المعادي',
                    'full_address'=> 'شارع النيل، المعادي، القاهرة',
                    'bio'         => 'حرفي محترف بخبرة 10 سنوات في مجال السباكة والكهرباء',
                    'hourly_rate' => 150.00,
                    'rating'      => 4.80,
                    'reviews_count' => 25,
                    'status'      => 'approved',
                    'approved_at' => now(),
                    'is_featured' => true,
                    'is_available'=> true,
                ]
            );

            // ربطه بمهنة
            if ($crafts->isNotEmpty()) {
                $craftsman->crafts()->syncWithoutDetaching([
                    $crafts->first()->id => ['is_primary' => true]
                ]);
            }

            // خدماته
            CraftsmanService::updateOrCreate(
                ['craftsman_id' => $craftsman->id, 'title' => 'إصلاح تسربات المياه'],
                ['description' => 'إصلاح شامل لجميع أنواع تسربات المياه', 'price_from' => 150, 'price_label' => 'يبدأ من 150 جنيه']
            );

            // مهاراته
            foreach (['سباكة عامة', 'تركيب أنابيب PVC', 'عزل مائي'] as $skill) {
                CraftsmanSkill::firstOrCreate(['craftsman_id' => $craftsman->id, 'skill' => $skill]);
            }
        }

        // ── 15 حرفي معتمد ──────────────────────────────────────
        for ($i = 0; $i < 15; $i++) {
            $user = User::factory()->craftsman()->create();

            $craftsman = Craftsman::factory()->create([
                'user_id'     => $user->id,
                'email'       => $user->email,
                'phone'       => $user->phone,
                'status'      => 'approved',
                'approved_at' => now(),
            ]);

            // ربط بمهنة أو اثنتين
            if ($crafts->isNotEmpty()) {
                $randomCrafts = $crafts->random(min(2, $crafts->count()));
                $syncData = [];
                foreach ($randomCrafts as $index => $craft) {
                    $syncData[$craft->id] = ['is_primary' => $index === 0];
                }
                $craftsman->crafts()->sync($syncData);
            }

            // 2-4 خدمات لكل حرفي
            CraftsmanService::factory()->count(rand(2, 4))->create(['craftsman_id' => $craftsman->id]);

            // 3-6 مهارات
            $skills = ['سباكة عامة', 'كهرباء', 'نجارة', 'دهانات', 'تكييف', 'بلاط', 'لحام', 'ألومنيوم', 'تنظيف', 'عزل'];
            $selectedSkills = array_slice(array_unique($skills), 0, rand(3, 6));
            foreach ($selectedSkills as $skill) {
                CraftsmanSkill::firstOrCreate(['craftsman_id' => $craftsman->id, 'skill' => $skill]);
            }

            // 2-5 صور بورتفوليو
            CraftsmanPortfolio::factory()->count(rand(2, 5))->create(['craftsman_id' => $craftsman->id]);
        }

        // ── 5 طلبات معلقة (بدون user_id) ──────────────────────
        Craftsman::factory()->pending()->count(5)->create();

        // ── 3 طلبات مرفوضة ────────────────────────────────────
        Craftsman::factory()->rejected()->count(3)->create();

        $this->command->info('✅ Craftsmen seeded (15 approved + 5 pending + 3 rejected)');
    }
}
