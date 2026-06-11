<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'              => $this->faker->name(),
            'email'             => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password'          => bcrypt('password'),
            'role'              => 'client',
            'phone'             => '010' . $this->faker->numerify('########'),
            'avatar'            => null,
            'is_active'         => true,
            'phone_verified_at' => now(),
            'remember_token'    => Str::random(10),
        ];
    }

    public function client(): static
    {
        return $this->state(['role' => 'client']);
    }

    public function craftsman(): static
    {
        return $this->state(['role' => 'craftsman']);
    }

    public function admin(): static
    {
        return $this->state([
            'role'  => 'admin',
            'email' => 'admin@sanay3y.com',
        ]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
