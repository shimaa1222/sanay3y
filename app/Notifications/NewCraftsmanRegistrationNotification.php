<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class NewCraftsmanRegistrationNotification extends Notification
{
    use Queueable;

    protected $craftsman;

    public function __construct($craftsman)
    {
        $this->craftsman = $craftsman;
    }

    // طريقة الإشعار
    public function via($notifiable): array
    {
        return ['database'];
    }

    // البيانات اللي هتتحفظ في notifications table
    public function toArray($notifiable): array
    {
        return [
            'craftsman_id' => $this->craftsman->id,
            'name' => $this->craftsman->first_name . ' ' . $this->craftsman->last_name,
            'email' => $this->craftsman->email,
            'message' => 'يوجد طلب تسجيل حرفي جديد بانتظار المراجعة',
        ];
    }
}
