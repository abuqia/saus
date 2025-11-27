<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Inertia\Inertia;

class SocialAuthController extends Controller
{
    public function redirectToGoogle()
    {
        // Untuk development, kita bisa bypass CORS dengan redirect langsung
        if (app()->environment('local')) {
            return Socialite::driver('google')->redirect();
        }

        // Untuk production, gunakan Inertia redirect
        return Inertia::location(Socialite::driver('google')->redirect()->getTargetUrl());
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Cari user berdasarkan google_id atau email
            $user = User::where('google_id', $googleUser->getId())
                        ->orWhere('email', $googleUser->getEmail())
                        ->first();

            if ($user) {
                // Update existing user dengan Google data
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'google_token' => $googleUser->token,
                    'google_refresh_token' => $googleUser->refreshToken,
                    'google_expires_in' => now()->addSeconds($googleUser->expiresIn),
                    'avatar' => $googleUser->getAvatar() ?? $user->avatar,
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ]);
            } else {
                // Buat user baru
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'google_token' => $googleUser->token,
                    'google_refresh_token' => $googleUser->refreshToken,
                    'google_expires_in' => now()->addSeconds($googleUser->expiresIn),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => Hash::make(Str::random(24)), // Random password
                    'email_verified_at' => now(), // Auto verify untuk social login
                    'type' => 'user',
                    'status' => 'active',
                ]);

                // Buat tenant default untuk user baru
                $this->createDefaultTenant($user);
            }

            // Login user
            Auth::login($user, true);

            // Record login
            $user->recordLogin(request()->ip());

            return redirect()->intended('/dashboard');

        } catch (\Exception $e) {
            \Log::error('Google Auth Error: ' . $e->getMessage());
            return redirect('/login')->withErrors([
                'social_auth' => 'Failed to authenticate with Google. Please try again.'
            ]);
        }
    }

    /**
     * Alternatif: Handle Google auth dengan window.open (Recommended)
     */
    public function getGoogleAuthUrl()
    {
        $url = Socialite::driver('google')
            ->redirect()
            ->getTargetUrl();

        return response()->json([
            'url' => $url
        ]);
    }

    /**
     * Handle Google callback untuk popup window
     */
    public function handleGooglePopupCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Cari user berdasarkan google_id atau email
            $user = User::where('google_id', $googleUser->getId())
                        ->orWhere('email', $googleUser->getEmail())
                        ->first();

            if ($user) {
                // Update existing user dengan Google data
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'google_token' => $googleUser->token,
                    'google_refresh_token' => $googleUser->refreshToken,
                    'google_expires_in' => now()->addSeconds($googleUser->expiresIn),
                    'avatar' => $googleUser->getAvatar() ?? $user->avatar,
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ]);
            } else {
                // Buat user baru
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'google_token' => $googleUser->token,
                    'google_refresh_token' => $googleUser->refreshToken,
                    'google_expires_in' => now()->addSeconds($googleUser->expiresIn),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => Hash::make(Str::random(24)),
                    'email_verified_at' => now(),
                    'type' => 'user',
                    'status' => 'active',
                ]);

                // Buat tenant default untuk user baru
                $this->createDefaultTenant($user);
            }

            // Login user
            Auth::login($user, true);
            $user->recordLogin(request()->ip());

            // Return HTML untuk close window dan redirect parent
            return response(<<<HTML
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Authentication Successful</title>
                    <script>
                        if (window.opener && !window.opener.closed) {
                            window.opener.postMessage({
                                type: 'GOOGLE_AUTH_SUCCESS',
                                user: {
                                    id: $user->id,
                                    name: '$user->name',
                                    email: '$user->email'
                                }
                            }, window.location.origin);
                            window.close();
                        } else {
                            window.location.href = '/dashboard';
                        }
                    </script>
                </head>
                <body>
                    <p>Authentication successful! You can close this window.</p>
                </body>
                </html>
            HTML);

        } catch (\Exception $e) {
            \Log::error('Google Auth Error: ' . $e->getMessage());

            return response(<<<HTML
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Authentication Failed</title>
                    <script>
                        if (window.opener && !window.opener.closed) {
                            window.opener.postMessage({
                                type: 'GOOGLE_AUTH_ERROR',
                                error: 'Failed to authenticate with Google'
                            }, window.location.origin);
                            window.close();
                        } else {
                            window.location.href = '/login?error=google_auth_failed';
                        }
                    </script>
                </head>
                <body>
                    <p>Authentication failed! You can close this window and try again.</p>
                </body>
                </html>
            HTML);
        }
    }

    /**
     * Buat tenant default untuk user baru
     */
    protected function createDefaultTenant(User $user): void
    {
        $tenant = Tenant::create([
            'user_id' => $user->id,
            'name' => $user->name . "'s Workspace",
            'slug' => Str::slug($user->name) . '-' . Str::random(6),
            'domain' => null,
            'is_active' => true,
            'plan' => 'free',
            'trial_ends_at' => now()->addDays(14),
        ]);

        // Attach user ke tenant sebagai owner
        $tenant->users()->attach($user->id, [
            'role' => 'owner',
            'status' => 'active',
            'invitation_accepted_at' => now(),
        ]);
    }

    /**
     * Connect Google account ke existing user
     */
    public function connectGoogle()
    {
        if (!Auth::check()) {
            return redirect('/login');
        }

        return Inertia::location(Socialite::driver('google')->redirect()->getTargetUrl());
    }

    /**
     * Handle Google connect callback
     */
    public function handleGoogleConnectCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            $user = Auth::user();

            // Cek apakah Google account sudah dipakai user lain
            $existingUser = User::where('google_id', $googleUser->getId())
                              ->where('id', '!=', $user->id)
                              ->first();

            if ($existingUser) {
                return redirect('/settings')->withErrors([
                    'social_auth' => 'This Google account is already connected to another user.'
                ]);
            }

            // Update user dengan Google data
            $user->update([
                'google_id' => $googleUser->getId(),
                'google_token' => $googleUser->token,
                'google_refresh_token' => $googleUser->refreshToken,
                'google_expires_in' => now()->addSeconds($googleUser->expiresIn),
                'avatar' => $googleUser->getAvatar() ?? $user->avatar,
            ]);

            return redirect('/settings')->with('success', 'Google account connected successfully!');

        } catch (\Exception $e) {
            \Log::error('Google Connect Error: ' . $e->getMessage());
            return redirect('/settings')->withErrors([
                'social_auth' => 'Failed to connect Google account. Please try again.'
            ]);
        }
    }

    /**
     * Disconnect Google account
     */
    public function disconnectGoogle()
    {
        $user = Auth::user();

        // Hanya disconnect jika user punya password (agar tetap bisa login)
        if (!$user->password) {
            return redirect('/settings')->withErrors([
                'social_auth' => 'Cannot disconnect Google account. Please set a password first.'
            ]);
        }

        $user->update([
            'google_id' => null,
            'google_token' => null,
            'google_refresh_token' => null,
            'google_expires_in' => null,
        ]);

        return redirect('/settings')->with('success', 'Google account disconnected successfully!');
    }
}
