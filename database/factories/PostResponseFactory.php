<?php

namespace Database\Factories;

use App\Models\Craftsman;
use App\Models\ServicePost;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostResponseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'post_id'        => ServicePost::factory(),
            'craftsman_id'   => Craftsman::factory()->approved(),
            'message'        => $this->faker->paragraph(2),
            'offered_price'  => $this->faker->randomFloat(2, 100, 800),
            'estimated_days' => $this->faker->numberBetween(1, 14),
            'status'         => $this->faker->randomElement(['pending', 'accepted', 'rejected']),
        ];
    }
}
