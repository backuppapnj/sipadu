<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintDisposition extends Model
{
    protected $fillable = [
        'complaint_id',
        'from_user',
        'to_user',
        'note',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_user');
    }
}
