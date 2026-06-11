<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CraftsmanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
  public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->first_name . ' ' . $this->last_name,
        'rating' => $this->rating,
        'city' => $this->city,
        'bio' => $this->bio,

        'crafts' => $this->crafts->map(function ($craft) {
            return [
                'id' => $craft->id,
                'name' => $craft->name,
            ];
        }),

        'skills' => $this->skills->pluck('name'),

        'services' => $this->services->map(function ($service) {
            return [
                'id' => $service->id,
                'title' => $service->title,
                'price_from' => $service->price_from,
            ];
        }),

        'reviews' => $this->reviews->map(function ($review) {
            return [
                'rating' => $review->rating,
                'comment' => $review->comment,
                'client_name' => $review->client->name ?? null,
                'created_at' => $review->created_at,
            ];
        }),
    ];
}
}
