<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMajorRequest;
use App\Http\Requests\UpdateMajorRequest;
use App\Models\Major;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MajorController extends Controller
{
    /**
     * List Majors
     *
     * Retrieve a list of all majors.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 10);

        $query = Major::query()->orderBy('id', 'desc');

        return \App\Http\Resources\MajorResource::collection($query->paginate($perPage > 0 ? $perPage : 10))->response();
    }

    /**
     * Create Major
     *
     * Create a new major/department.
     */
    public function store(StoreMajorRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Map camelCase to snake_case for database
        if (isset($data['programKeahlian'])) {
            $data['program_keahlian'] = $data['programKeahlian'];
        }
        if (isset($data['bidangKeahlian'])) {
            $data['bidang_keahlian'] = $data['bidangKeahlian'];
        }

        $major = Major::create($data);

        return response()->json($major, 201);
    }

    /**
     * Show Major
     *
     * Retrieve a specific major by ID.
     */
    public function show(Major $major): JsonResponse
    {
        return response()->json($major->load('classes'));
    }

    /**
     * Update Major
     *
     * Update a specific major by ID.
     */
    public function update(UpdateMajorRequest $request, Major $major): JsonResponse
    {
        $data = $request->validated();

        // Map camelCase to snake_case for database
        if (isset($data['programKeahlian'])) {
            $data['program_keahlian'] = $data['programKeahlian'];
        }
        if (isset($data['bidangKeahlian'])) {
            $data['bidang_keahlian'] = $data['bidangKeahlian'];
        }

        $major->update($data);

        return response()->json($major);
    }

    /**
     * Delete Major
     *
     * Delete a specific major by ID.
     */
    public function destroy(Major $major): JsonResponse
    {
        try {
            $major->delete();

            return response()->json(['message' => 'Deleted']);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1451 || $e->getCode() == 23000) {
                return response()->json(['message' => 'Data tidak dapat dihapus karena masih terelasi dengan data lain'], 409);
            }
            throw $e;
        }
    }
}
