<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingStatusUpdatedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
protected $booking;

    public function __construct($booking)
    {
        $this->booking = $booking;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
        // أو ['mail', 'database'] لو عاوز إيميل كمان
    }

    public function toArray(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'status' => $this->booking->status,
            'message' => 'تم تحديث حالة الحجز إلى ' . $this->booking->status,
        ];
    }

    // لو عاوز Mail
    /*
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('تحديث حالة الحجز')
            ->line('تم تحديث حالة الحجز إلى: ' . $this->booking->status);
    }
    */

}
