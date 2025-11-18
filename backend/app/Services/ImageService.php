<?php

namespace App\Services;

use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class ImageService
{
    protected $allowedMimes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
    protected $defaultQuality = 85;

    public function upload(UploadedFile $file, $directory = 'images', $sizes = [])
    {
        $filename = $this->generateFilename($file);
        $paths = [];

        // Original image
        $originalPath = $directory . '/original/' . $filename;
        $this->saveImage($file, $originalPath);
        $paths['original'] = $originalPath;

        // Process other sizes
        foreach ($sizes as $sizeName => $dimensions) {
            $sizePath = $directory . '/' . $sizeName . '/' . $filename;
            $this->resizeAndSave($file, $sizePath, $dimensions['width'], $dimensions['height']);
            $paths[$sizeName] = $sizePath;
        }

        return $paths;
    }

    public function resizeAndSave(UploadedFile $file, $path, $width = null, $height = null)
    {
        $image = Image::make($file->getRealPath());

        if ($width && $height) {
            $image->fit($width, $height);
        } elseif ($width || $height) {
            $image->resize($width, $height, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
        }

        Storage::disk('public')->put($path, $image->encode(null, $this->defaultQuality));

        return $path;
    }

    public function createThumbnail($imagePath, $width = 150, $height = 150)
    {
        $filename = pathinfo($imagePath, PATHINFO_FILENAME);
        $extension = pathinfo($imagePath, PATHINFO_EXTENSION);
        $thumbnailPath = 'thumbnails/' . $filename . '_thumb.' . $extension;

        $image = Image::make(storage_path('app/public/' . $imagePath));

        $image->fit($width, $height);
        Storage::disk('public')->put($thumbnailPath, $image->encode());

        return $thumbnailPath;
    }

    public function addWatermark($imagePath, $watermarkText = null, $position = 'bottom-right')
    {
        $image = Image::make(storage_path('app/public/' . $imagePath));

        if ($watermarkText) {
            $image->text($watermarkText, $image->width() - 20, $image->height() - 20,
                function($font) {
                    $font->file(public_path('fonts/arial.ttf'));
                    $font->size(24);
                    $font->color('#FFFFFF');
                    $font->align('right');
                    $font->valign('bottom');
                });
        }

        $watermarkedPath = 'watermarked/' . pathinfo($imagePath, PATHINFO_BASENAME);
        Storage::disk('public')->put($watermarkedPath, $image->encode());

        return $watermarkedPath;
    }

    public function optimizeImage($imagePath, $quality = 60)
    {
        $image = Image::make(storage_path('app/public/' . $imagePath));
        $optimizedPath = 'optimized/' . pathinfo($imagePath, PATHINFO_BASENAME);

        Storage::disk('public')->put($optimizedPath, $image->encode(null, $quality));

        return $optimizedPath;
    }

    public function convertFormat($imagePath, $format = 'webp', $quality = 80)
    {
        $filename = pathinfo($imagePath, PATHINFO_FILENAME);
        $convertedPath = 'converted/' . $filename . '.' . $format;

        $image = Image::make(storage_path('app/public/' . $imagePath));
        Storage::disk('public')->put($convertedPath, $image->encode($format, $quality));

        return $convertedPath;
    }

    public function cropImage($imagePath, $x, $y, $width, $height)
    {
        $filename = pathinfo($imagePath, PATHINFO_BASENAME);
        $croppedPath = 'cropped/' . $filename;

        $image = Image::make(storage_path('app/public/' . $imagePath));
        $image->crop($width, $height, $x, $y);
        Storage::disk('public')->put($croppedPath, $image->encode());

        return $croppedPath;
    }

    protected function generateFilename(UploadedFile $file)
    {
        return time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
    }

    protected function saveImage(UploadedFile $file, $path)
    {
        $image = Image::make($file->getRealPath());
        Storage::disk('public')->put($path, $image->encode(null, $this->defaultQuality));
    }

    public function deleteImage($path)
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }
        return false;
    }
}
