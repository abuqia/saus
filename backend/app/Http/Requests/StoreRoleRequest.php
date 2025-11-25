<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('roles.create');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z_]+$/',
                'unique:roles,name'
            ],
            'label' => [
                'required',
                'string',
                'max:255'
            ],
            'guard_name' => [
                'required',
                'string',
                Rule::in(['web', 'api'])
            ],
            'description' => [
                'nullable',
                'string',
                'max:500'
            ],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'role name',
            'label' => 'display name',
            'guard_name' => 'guard',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The role name is required.',
            'name.regex' => 'The role name must contain only lowercase letters and underscores.',
            'name.unique' => 'A role with this name already exists.',
            'label.required' => 'The display name is required.',
            'guard_name.required' => 'Please select a guard.',
            'guard_name.in' => 'The selected guard is invalid.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure name is lowercase and uses underscores
        if ($this->has('name')) {
            $this->merge([
                'name' => strtolower($this->name),
            ]);
        }

        // Set default guard if not provided
        if (!$this->has('guard_name') || empty($this->guard_name)) {
            $this->merge([
                'guard_name' => 'web',
            ]);
        }
    }
}
