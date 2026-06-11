<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Craftsman;
class CraftsmanRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public $craftsman;

    public function __construct(Craftsman $craftsman)
    {
        $this->craftsman = $craftsman;
    }

    public function build()
    {
        return $this->subject('تم رفض طلبك')
                    ->view('emails.craftsman-rejected');
    }

    /**
     * Get the message envelope.
     */
    /**
     * Get the message content definition.
     */


    /**
     * Get the attachments for the message.
     *
     */

}
