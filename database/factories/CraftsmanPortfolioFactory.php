<?php

namespace Database\Factories;

use App\Models\Craftsman;
use Illuminate\Database\Eloquent\Factories\Factory;

class CraftsmanPortfolioFactory extends Factory
{
    public function definition(): array
    {
        return [
            'craftsman_id' => Craftsman::factory()->approved(),
            'image'        => 'portfolio/' . $this->faker->uuid() . '.jpg',
            'title'        => $this->faker->sentence(3),
            'description'  => $this->faker->paragraph(1),
        ];
    }
}
