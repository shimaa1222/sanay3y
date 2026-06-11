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
class CraftsmanApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
  public $craftsman;
    public $password;

    public function __construct(Craftsman $craftsman, $password)
    {
        $this->craftsman = $craftsman;
        $this->password = $password;
    }

public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تم قبول طلبك',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.craftsman-approved',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
