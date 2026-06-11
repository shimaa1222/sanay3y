<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OtpCodeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'    => User::factory(),
            'identifier' => $this->faker->safeEmail(),
            'code'       => $this->faker->numerify('######'),
            'type'       => $this->faker->randomElement([
                'email_verification', 'phone_verification', 'password_reset', 'login', 'register'
            ]),
            'expires_at' => now()->addMinutes(5),
            'used'       => false,
            'attempts'   => 0,
        ];
    }

    public function expired(): static
    {
        return $this->state(['expires_at' => now()->subMinutes(10)]);
    }

    public function used(): static
    {
        return $this->state(['used' => true]);
    }
}
