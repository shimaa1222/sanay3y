<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Craftsman;
use App\Models\User;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $clients   = User::where('role', 'client')->get();
        $craftsmen = Craftsman::where('status', 'approved')->get();

        if ($clients->isEmpty() || $craftsmen->isEmpty()) {
            $this->command->warn('⚠️ Not enough users/craftsmen, skipping BookingSeeder');
            return;
        }

        $statuses = [
            ['status' => 'pending',   'count' => 10],
            ['status' => 'confirmed', 'count' => 8],
            ['status' => 'completed', 'count' => 20],
            ['status' => 'cancelled', 'count' => 7],
            ['status' => 'rejected',  'count' => 5],
        ];

        foreach ($statuses as $group) {
            for ($i = 0; $i < $group['count']; $i++) {
                $client    = $clients->random();
                $craftsman = $craftsmen->random();

                Booking::factory()
                    ->{$group['status'] === 'confirmed' ? 'pending' : $group['status']}()
                    ->create([
                        'client_id'    => $client->id,
                        'craftsman_id' => $craftsman->id,
                        'status'       => $group['status'],
                    ]);
            }
        }

        $this->command->info('✅ Bookings seeded (50 total)');
    }
}
