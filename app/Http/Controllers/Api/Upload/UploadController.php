<?php

namespace App\Http\Controllers\Api\Upload;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
// ================================================================
// هذا الكنترولر مسؤول عن رفع الصور والمستندات وحذفها
class UploadController extends Controller
{
    /**
     * حد الحجم الأقصى لكل نوع (KB)
     */
    private array $limits = [
        'avatar'        => 2048,
        'profile_photo' => 5120,
        'national_id'   => 5120,
        'portfolio'     => 8192,
        'post_image'    => 5120,
        'chat_file'     => 10240,
        'document'      => 10240,
    ];

    private array $folders = [
        'avatar'        => 'avatars',
        'profile_photo' => 'profiles',
        'national_id'   => 'national_ids',
        'portfolio'     => 'portfolio',
        'post_image'    => 'post_images',
        'chat_file'     => 'chat_files',
        'document'      => 'documents',
    ];

    // ================================================================

    /**
     * POST /api/upload/image  🔒
     *
     * رفع صورة واحدة — multipart/form-data
     *
     * Request:
     *   file  = <image: jpg|jpeg|png|webp>
     *   type  = "avatar"|"profile_photo"|"national_id"|"portfolio"|"post_image"
     *
     * Response 200:
     * {
     *   "url":  "https://app.railway.app/storage/avatars/abc.jpg",
     *   "path": "avatars/abc.jpg",
     *   "size": 204800,
     *   "mime": "image/jpeg"
     * }
     *
     * Response 422:
     *   { "message": "الملف كبير جداً. الحد الأقصى 2MB" }
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $type = $request->get('type', 'avatar');
        $max  = $this->limits[$type] ?? 5120;

        // $request->validate([
        //     'file' => "required|file|mimes:jpg,jpeg,png,webp|max:{$max}",
        //     'type' => 'nullable|in:' . implode(',', array_keys($this->limits)),
        // ], [
        //     'file.required' => 'يجب اختيار ملف',
        //     'file.max'      => 'الملف كبير جداً. الحد الأقصى ' . ($max / 1024) . 'MB',
        //     'file.mimes'    => 'يجب أن تكون الصورة بصيغة JPG أو PNG أو WebP',
        // ]);
        $validator = Validator::make($request->all(), [
    'file' => "required|file|mimes:jpg,jpeg,png,webp|max:{$max}",
    'type' => 'nullable|in:' . implode(',', array_keys($this->limits)),
], [
    'file.required' => 'يجب اختيار ملف',
    'file.max'      => 'الملف كبير جداً. الحد الأقصى ' . ($max / 1024) . 'MB',
    'file.mimes'    => 'يجب أن تكون الصورة بصيغة JPG أو PNG أو WebP',
]);

if ($validator->fails()) {
    return response()->json([
        'message' => 'فشل التحقق من البيانات',
        'errors'  => $validator->errors(),
    ], 422);
}

        $folder = $this->folders[$type] ?? 'uploads';
        $path   = $request->file('file')->store($folder, 'public');

        return response()->json([
            'url'  => asset('storage/' . $path),
            'path' => $path,
            'size' => $request->file('file')->getSize(),
            'mime' => $request->file('file')->getMimeType(),
        ]);
    }

    // ================================================================

    /**
     * POST /api/upload/multiple  🔒
     *
     * رفع عدة صور (حتى 10) — multipart/form-data
     *
     * Request:
     *   files[]  = <File 1>
     *   files[]  = <File 2>
     *   type     = "portfolio" | "post_image"
     *
     * Response 200:
     * {
     *   "uploads": [
     *     { "url": "...", "path": "portfolio/img1.jpg", "size": 204800 },
     *     { "url": "...", "path": "portfolio/img2.jpg", "size": 153600 }
     *   ]
     * }
     */
    public function uploadMultiple(Request $request): JsonResponse
    {
        $type = $request->get('type', 'post_image');
        $max  = $this->limits[$type] ?? 5120;

        // $request->validate([
        //     'files'   => 'required|array|min:1|max:10',
        //     'files.*' => "file|mimes:jpg,jpeg,png,webp|max:{$max}",
        //     'type'    => 'nullable|in:portfolio,post_image,chat_file',
        // ], [
        //     'files.required' => 'يجب اختيار ملف واحد على الأقل',
        //     'files.max'      => 'يمكن رفع 10 ملفات كحد أقصى',
        //     'files.*.max'    => 'حجم كل ملف يجب أن لا يتجاوز ' . ($max / 1024) . 'MB',
        //     'files.*.mimes'  => 'الصور يجب أن تكون بصيغة JPG أو PNG أو WebP',
        // ]);
        $validator = Validator::make($request->all(), [
    'files'   => 'required|array|min:1|max:10',
    'files.*' => "file|mimes:jpg,jpeg,png,webp|max:{$max}",
    'type'    => 'nullable|in:portfolio,post_image,chat_file',
], [
    'files.required' => 'يجب اختيار ملف واحد على الأقل',
    'files.max'      => 'يمكن رفع 10 ملفات كحد أقصى',
    'files.*.max'    => 'حجم كل ملف يجب أن لا يتجاوز ' . ($max / 1024) . 'MB',
    'files.*.mimes'  => 'الصور يجب أن تكون بصيغة JPG أو PNG أو WebP',
]);

if ($validator->fails()) {
    return response()->json([
        'message' => 'فشل التحقق من البيانات',
        'errors'  => $validator->errors(),
    ], 422);
}

        $folder  = $this->folders[$type] ?? 'uploads';
        $uploads = [];

        foreach ($request->file('files') as $file) {
            $path      = $file->store($folder, 'public');
            $uploads[] = [
                'url'  => asset('storage/' . $path),
                'path' => $path,
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
            ];
        }

        return response()->json(['uploads' => $uploads]);
    }

    // ================================================================

    /**
     * POST /api/upload/document  🔒
     *
     * رفع مستند PDF أو Word — multipart/form-data
     *
     * Request:
     *   file = <pdf|doc|docx|xls|xlsx|txt>
     *
     * Response 200:
     * {
     *   "url":           "https://.../storage/documents/file.pdf",
     *   "path":          "documents/file.pdf",
     *   "original_name": "invoice.pdf",
     *   "size":          204800,
     *   "mime":          "application/pdf"
     * }
     */
    public function uploadDocument(Request $request): JsonResponse
    {
        // $request->validate([
        //     'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,txt|max:10240',
        // ], [
        //     'file.required' => 'يجب اختيار ملف',
        //     'file.mimes'    => 'يجب أن يكون الملف بصيغة PDF أو Word أو Excel',
        //     'file.max'      => 'حجم الملف يجب أن لا يتجاوز 10MB',
        // ]);
        $validator = Validator::make($request->all(), [
    'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,txt|max:10240',
], [
    'file.required' => 'يجب اختيار ملف',
    'file.mimes'    => 'يجب أن يكون الملف بصيغة PDF أو Word أو Excel',
    'file.max'      => 'حجم الملف يجب أن لا يتجاوز 10MB',
]);

if ($validator->fails()) {
    return response()->json([
        'message' => 'فشل التحقق من البيانات',
        'errors'  => $validator->errors(),
    ], 422);
}

        $path = $request->file('file')->store('documents', 'public');

        return response()->json([
            'url'           => asset('storage/' . $path),
            'path'          => $path,
            'original_name' => $request->file('file')->getClientOriginalName(),
            'size'          => $request->file('file')->getSize(),
            'mime'          => $request->file('file')->getMimeType(),
        ]);
    }

    // ================================================================

    /**
     * DELETE /api/upload  🔒
     *
     * حذف ملف مرفوع
     *
     * Request:
     *   { "path": "avatars/abc123.jpg" }
     *
     * Response 200:
     *   { "message": "تم حذف الملف" }
     *
     * Response 404:
     *   { "message": "الملف غير موجود" }
     *
     * Response 422:
     *   { "message": "مسار غير صالح" }
     */
    public function deleteFile(Request $request): JsonResponse
    {
        // $request->validate([
        //     'path' => 'required|string|max:500',
        // ]);
$validator = Validator::make($request->all(), [
    'path' => 'required|string|max:500',
]);

if ($validator->fails()) {
    return response()->json([
        'message' => 'فشل التحقق من البيانات',
        'errors'  => $validator->errors(),
    ], 422);
}
        $safePath = ltrim($request->path, '/');

        // Security: منع directory traversal
        if (str_contains($safePath, '..') || str_starts_with($safePath, '/')) {
            return response()->json(['message' => 'مسار غير صالح'], 422);
        }

        if (!Storage::disk('public')->exists($safePath)) {
            return response()->json(['message' => 'الملف غير موجود'], 404);
        }

        Storage::disk('public')->delete($safePath);

        return response()->json(['message' => 'تم حذف الملف']);
    }
}
