<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Craft;
use Illuminate\Http\Request;

class AdminCraftsController extends Controller
{
    /**
     * GET /admin/crafts
     * نفس AdminController::craftsList
     */
    public function index()
    {
        $crafts = Craft::withCount('craftsmen')->get();

        return view('admin.crafts.index', compact('crafts'));
    }

    /**
     * POST /admin/crafts
     * نفس AdminController::storeCraft
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:100|unique:crafts,name',
            'name_en'     => 'nullable|string|max:100',
            'icon'        => 'nullable|string|max:50',
            'description' => 'nullable|string|max:255',
        ], [
            'name.required' => 'اسم المهنة مطلوب',
            'name.unique'   => 'هذه المهنة موجودة مسبقاً',
        ]);

        Craft::create($request->only(['name', 'name_en', 'icon', 'description']) + ['is_active' => true]);

        return back()->with('success', 'تمت إضافة المهنة');
    }

    /**
     * PUT /admin/crafts/{id}
     * نفس AdminController::updateCraft
     */
    public function update(Request $request, int $id)
    {
        $craft = Craft::findOrFail($id);

        $request->validate([
            'name'      => 'sometimes|string|max:100|unique:crafts,name,' . $id,
            'is_active' => 'sometimes|boolean',
        ]);

        $craft->update($request->only(['name', 'name_en', 'icon', 'description', 'is_active']));

        return back()->with('success', 'تم تحديث المهنة');
    }

    /**
     * DELETE /admin/crafts/{id}
     * نفس AdminController::deleteCraft — مع نفس فحص الحماية
     */
    public function destroy(int $id)
    {
        $craft = Craft::findOrFail($id);

        if ($craft->craftsmen()->count() > 0) {
            return back()->with('error', 'لا يمكن حذف المهنة لأنها مرتبطة بحرفيين');
        }

        $craft->delete();

        return back()->with('success', 'تم حذف المهنة');
    }
}
