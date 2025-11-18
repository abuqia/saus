<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('users.edit');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string', 'max:500'],
            'type' => ['sometimes', 'required', Rule::in(['super_admin', 'admin', 'user'])],
            'status' => ['sometimes', 'required', Rule::in(['active', 'inactive', 'suspended', 'banned'])],
            'plan' => ['sometimes', 'required', Rule::in(['free', 'starter', 'pro', 'enterprise'])],
            'plan_expires_at' => ['nullable', 'date', 'after:today'],
            'timezone' => ['nullable', 'string', 'timezone'],
            'language' => ['nullable', 'string', 'max:2'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['exists:roles,name'],
            'avatar' => ['nullable', 'image', 'max:2048'],
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
            'plan_expires_at' => 'plan expiration date',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Only update password if provided
        if ($this->password === null) {
            $this->request->remove('password');
            $this->request->remove('password_confirmation');
        }
    }
}
