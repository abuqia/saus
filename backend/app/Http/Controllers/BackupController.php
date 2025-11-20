<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class BackupController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'can:manage_backups']);
    }

    public function index()
    {
        $disk = Storage::disk('backups');
        $files = $disk->files(config('backup.backup.name'));

        $backups = [];
        foreach ($files as $file) {
            if (substr($file, -4) == '.zip' && $disk->exists($file)) {
                $backups[] = [
                    'file_path' => $file,
                    'file_name' => str_replace(config('backup.backup.name') . '/', '', $file),
                    'file_size' => $this->formatBytes($disk->size($file)),
                    'last_modified' => $disk->lastModified($file),
                ];
            }
        }

        $backups = array_reverse($backups);

        return view('backups.index', compact('backups'));
    }

    public function create()
    {
        try {
            Artisan::call('backup:run', ['--only-db' => true]);

            return redirect()->route('backups.index')
                ->with('success', 'Backup created successfully!');
        } catch (\Exception $e) {
            return redirect()->route('backups.index')
                ->with('error', 'Backup failed: ' . $e->getMessage());
        }
    }

    public function download($file_name)
    {
        $disk = Storage::disk('backups');
        $file = config('backup.backup.name') . '/' . $file_name;

        if ($disk->exists($file)) {
            return $disk->download($file);
        }

        return redirect()->route('backups.index')
            ->with('error', 'Backup file not found.');
    }

    public function delete($file_name)
    {
        $disk = Storage::disk('backups');
        $file = config('backup.backup.name') . '/' . $file_name;

        if ($disk->exists($file)) {
            $disk->delete($file);

            return redirect()->route('backups.index')
                ->with('success', 'Backup deleted successfully!');
        }

        return redirect()->route('backups.index')
            ->with('error', 'Backup file not found.');
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
