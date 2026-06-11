<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ──────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'admin@sanay3y.com'],
            [
                'name'              => 'مدير النظام',
                'password'          => Hash::make('admin123'),
                'role'              => 'admin',
                'phone'             => '01000000000',
                'is_active'         => true,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );

        // ── Test Client ────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'client@test.com'],
            [
                'name'              => 'عميل تجريبي',
                'password'          => Hash::make('password'),
                'role'              => 'client',
                'phone'             => '01100000001',
                'is_active'         => true,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );

        // ── Test Craftsman User ────────────────────────────────
        User::updateOrCreate(
            ['email' => 'craftsman@test.com'],
            [
                'name'              => 'حرفي تجريبي',
                'password'          => Hash::make('password'),
                'role'              => 'craftsman',
                'phone'             => '01200000002',
                'is_active'         => true,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );

        // ── Random Clients ─────────────────────────────────────
        User::factory()->client()->count(20)->create();

        $this->command->info('✅ Users seeded');
    }
}
