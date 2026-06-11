<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewPostResponseNotification extends Notification
{
    use Queueable;

    protected $post;
    protected $response;

    public function __construct($post, $response)
    {
        $this->post = $post;
        $this->response = $response;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'post_id' => $this->post->id,
            'response_id' => $this->response->id,
            'message' => 'تم إضافة رد جديد على منشورك',
            'craftsman_id' => $this->response->craftsman_id,
            'offered_price' => $this->response->offered_price,
        ];
    }
}
