<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('users.create');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string', 'max:500'],
            'type' => ['required', Rule::in(['super_admin', 'admin', 'user'])],
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended', 'banned'])],
            'plan' => ['required', Rule::in(['free', 'starter', 'pro', 'enterprise'])],
            'timezone' => ['nullable', 'string', 'timezone'],
            'language' => ['nullable', 'string', 'max:2'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['exists:roles,id'],
            'avatar' => ['nullable', 'image', 'max:2048'], // 2MB max
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'full name',
            'email' => 'email address',
            'phone' => 'phone number',
            'bio' => 'biography',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'This email address is already registered.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
            'avatar.max' => 'Avatar image must not exceed 2MB.',
        ];
    }
}
