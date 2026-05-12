'use client';

import React, { useState } from 'react';
import { createVipUser } from '@/libs/actions';

// Define the shape of the form data to match the DTO
interface CreateVipManagementDto {
  name: string;
  email: string;
  password: string;
  credit: number;
}

// Define the shape for validation errors
interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  credit?: string;
  api?: string;
}

// Define InputField outside the main component to prevent recreation on each render
const InputField = React.memo(({
  name,
  type,
  label,
  value,
  error,
  onChange,
  required = true
}: {
  name: string,
  type: string,
  label: string,
  value: string | number,
  error: string | undefined,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  required?: boolean
}) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'
        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
));

// Set display name for easier debugging
InputField.displayName = 'InputField';

const initialFormData: CreateVipManagementDto = {
  name: '',
  email: '',
  password: '',
  credit: 0,
};

export default function CreateVipUserForm() {
  const [formData, setFormData] = useState<CreateVipManagementDto>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }

    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.match(emailRegex)) {
      newErrors.email = 'A valid email is required.';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (formData.credit <= 0) {
      newErrors.credit = 'Credit must be a positive number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'credit' ? parseInt(value, 10) || 0 : value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrors({});

    if (!validate()) {
      setLoading(false);
      return;
    }

    try {
      const result = await createVipUser(
        formData.name,
        formData.email,
        formData.password,
        formData.credit
      );

      if (result.status !== 201 && result.status !== 200) {
        const errorMessage = result.data?.message || 'An unexpected error occurred during creation.';
        setErrors({ api: errorMessage });
        return;
      }

      setSuccessMessage(` User "${formData.name}" created successfully!`);
      setFormData(initialFormData);
      setErrors({});

    } catch (error) {
      console.error('Submission Error:', error);
      setErrors({ api: 'Network error or unable to connect to the server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg shadow-xl min-w-[350px]">
      <h2 className="text-2xl font-bold text-center mb-6 ">أضف مستخدمًا جديدًا</h2>
      {errors.api && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {errors.api}
        </div>
      )}
      {successMessage && (
        <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <InputField
          name="name"
          type="text"
          label="الاسم"
          value={formData.name}
          error={errors.name}
          onChange={handleChange}
        />

        <InputField
          name="email"
          type="email"
          label="البريد الإلكتروني"
          value={formData.email}
          error={errors.email}
          onChange={handleChange}
        />

        <InputField
          name="password"
          type="password"
          label="كلمة المرور"
          value={formData.password}
          error={errors.password}
          onChange={handleChange}
        />

        <InputField
          name="credit"
          type="text"
          label="الرصيد المبدئي"
          value={formData.credit}
          error={errors.credit}
          onChange={handleChange}
        />

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
          >
            {loading ? 'جاري الإضافة...' : 'أضف'}
          </button>
        </div>
      </form>
    </div>
  );
}