<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => \App\Models\Setting::all()->mapWithKeys(function ($item) {
                return [$item->key => $item->value];
            }),
        ]);
    }

    /**
     * Update bulk settings.
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|exists:settings,key',
            'settings.*.value' => 'nullable',
        ]);

        foreach ($request->settings as $setting) {
            \App\Models\Setting::where('key', $setting['key'])->update([
                'value' => $setting['value'],
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Settings updated successfully',
        ]);
    }

    /**
     * Sync settings and active context.
     */
    public function sync()
    {
        return response()->json([
            'school_year' => \App\Models\SchoolYear::where('active', true)->first(),
            'semester' => \App\Models\Semester::where('active', true)->first(),
            'settings' => \App\Models\Setting::all()->pluck('value', 'key'),
        ]);
    }
}
