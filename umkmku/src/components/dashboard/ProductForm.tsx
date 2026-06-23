'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  validateCategoryData,
  type CategoryType,
  type SkincareData,
  type ParfumData,
  type FashionData,
  type FDBData,
} from '@/lib/categories'
import type { Product } from '@/lib/supabase/types'
import { AlertCircle, X, Upload } from 'lucide-react'

type CategoryData = SkincareData | ParfumData | FashionData | FDBData | null

interface ProductFormProps {
  product?: Product | null
  category: CategoryType
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

interface FormState {
  name: string
  description: string
  price: string
  image: File | null
  imagePreview: string
  is_active: boolean
  categoryData: Record<string, any>
  errors: Record<string, string>
}

const categoryFields: Record<CategoryType, { key: string; label: string; type: string }[]> = {
  skincare: [
    { key: 'skin_types', label: 'Skin Types', type: 'multi-checkbox' },
    { key: 'concerns', label: 'Concerns', type: 'multi-checkbox' },
    { key: 'ingredients', label: 'Ingredients (comma-separated)', type: 'textarea' },
    { key: 'usage_step', label: 'Usage Step', type: 'select' },
  ],
  parfum: [
    { key: 'fragrance_family', label: 'Fragrance Family', type: 'multi-checkbox' },
    { key: 'notes_top', label: 'Top Notes (comma-separated)', type: 'textarea' },
    { key: 'notes_middle', label: 'Middle Notes (comma-separated)', type: 'textarea' },
    { key: 'notes_base', label: 'Base Notes (comma-separated)', type: 'textarea' },
    { key: 'size', label: 'Size (ml)', type: 'select' },
    { key: 'longevity', label: 'Longevity', type: 'select' },
  ],
  fashion: [
    { key: 'sizes', label: 'Available Sizes (comma-separated)', type: 'textarea' },
    { key: 'colors', label: 'Colors (comma-separated)', type: 'textarea' },
    { key: 'materials', label: 'Materials (comma-separated)', type: 'textarea' },
    { key: 'fit', label: 'Fit', type: 'select' },
    { key: 'style', label: 'Style (comma-separated)', type: 'textarea' },
  ],
  fdb: [
    { key: 'ingredients', label: 'Ingredients (comma-separated)', type: 'textarea' },
    { key: 'allergens', label: 'Allergens (comma-separated)', type: 'textarea' },
    { key: 'preparation_time', label: 'Preparation Time (minutes)', type: 'number' },
    { key: 'servings', label: 'Servings', type: 'number' },
    { key: 'dietary', label: 'Dietary', type: 'multi-checkbox' },
  ],
}

const fieldOptions: Record<string, string[]> = {
  skin_types: ['oily', 'dry', 'combination', 'sensitive', 'all'],
  concerns: ['acne', 'brightening', 'anti-aging', 'hydrating', 'pores', 'sensitive'],
  usage_step: ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'treatment'],
  fragrance_family: ['floral', 'woody', 'fresh', 'oriental', 'chypre'],
  size: ['30', '50', '100', '200'],
  longevity: ['light', 'moderate', 'long-lasting'],
  fit: ['slim', 'regular', 'relaxed', 'oversized'],
  dietary: ['vegan', 'vegetarian', 'gluten-free', 'halal'],
}

export function ProductForm({
  product,
  category,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductFormProps) {
  const [formState, setFormState] = useState<FormState>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price ? String(product.price) : '',
    image: null,
    imagePreview: product?.image_url || '',
    is_active: product?.is_active ?? true,
    categoryData: {},
    errors: {},
  })

  // Initialize category data from product if editing
  useEffect(() => {
    if (product) {
      const categoryKey = `${category}_data` as keyof Product
      const data = product[categoryKey] as CategoryData
      if (data) {
        setFormState((prev) => ({
          ...prev,
          categoryData: { ...data },
        }))
      }
    }
  }, [product, category])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormState((prev) => ({
      ...prev,
      [name]: value,
      errors: { ...prev.errors, [name]: '' },
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormState((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCategoryFieldChange = (key: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      categoryData: {
        ...prev.categoryData,
        [key]: value,
      },
      errors: { ...prev.errors, [key]: '' },
    }))
  }

  const handleCheckboxChange = (key: string, option: string, checked: boolean) => {
    setFormState((prev) => {
      const currentArray = (prev.categoryData[key] as string[]) || []
      const newArray = checked
        ? [...currentArray, option]
        : currentArray.filter((item) => item !== option)

      return {
        ...prev,
        categoryData: {
          ...prev.categoryData,
          [key]: newArray,
        },
        errors: { ...prev.errors, [key]: '' },
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate required fields
    const errors: Record<string, string> = {}
    if (!formState.name.trim()) errors.name = 'Name is required'
    if (!formState.price) errors.price = 'Price is required'

    // Validate category data
    const categoryValidation = validateCategoryData(category, formState.categoryData)
    if (!categoryValidation.success) {
      const categoryErrors = categoryValidation.error.errors
      categoryErrors.forEach((err: any) => {
        errors[err.path.join('.')] = err.message
      })
    }

    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({ ...prev, errors }))
      return
    }

    // Prepare FormData
    const formData = new FormData()
    formData.append('name', formState.name.trim())
    formData.append('description', formState.description.trim())
    formData.append('price', formState.price)
    formData.append('is_active', String(formState.is_active))
    formData.append('category_type', category)

    // Add category-specific data
    Object.entries(formState.categoryData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, JSON.stringify(value))
      }
    })

    // Add image if changed
    if (formState.image) {
      formData.append('image', formState.image)
    } else if (product?.image_url) {
      formData.append('image_url', product.image_url)
    }

    try {
      await onSubmit(formData)
    } catch (err) {
      console.error('Form submission error:', err)
      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          submit: err instanceof Error ? err.message : 'Failed to submit form',
        },
      }))
    }
  }

  const renderCategoryField = (field: (typeof categoryFields)[CategoryType][0]) => {
    const { key, label, type } = field
    const value = formState.categoryData[key]
    const error = formState.errors[key]

    switch (type) {
      case 'multi-checkbox':
        const options = fieldOptions[key] || []
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={(e) =>
                      handleCheckboxChange(key, option, e.target.checked)
                    }
                    disabled={isLoading}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-600 capitalize">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'select':
        const selectOptions = fieldOptions[key] || []
        return (
          <div key={key} className="space-y-1">
            <label htmlFor={key} className="text-sm font-medium text-gray-700">
              {label}
            </label>
            <select
              id={key}
              value={value || ''}
              onChange={(e) => handleCategoryFieldChange(key, e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select {label}</option>
              {selectOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={key} className="space-y-1">
            <label htmlFor={key} className="text-sm font-medium text-gray-700">
              {label}
            </label>
            <Textarea
              id={key}
              value={Array.isArray(value) ? value.join(', ') : value || ''}
              onChange={(e) => {
                const items = e.target.value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean)
                handleCategoryFieldChange(key, items.length > 0 ? items : null)
              }}
              disabled={isLoading}
              placeholder={`Enter ${label.toLowerCase()}`}
              className="min-h-20"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'number':
        return (
          <div key={key} className="space-y-1">
            <label htmlFor={key} className="text-sm font-medium text-gray-700">
              {label}
            </label>
            <Input
              id={key}
              type="number"
              value={value || ''}
              onChange={(e) =>
                handleCategoryFieldChange(key, e.target.value ? Number(e.target.value) : null)
              }
              disabled={isLoading}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {product ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Submit Error */}
          {formState.errors.submit && (
            <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  {formState.errors.submit}
                </p>
              </div>
            </div>
          )}

          {/* Common Fields */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Product Name *
              </label>
              <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Enter product name"
              />
              {formState.errors.name && (
                <p className="text-sm text-red-500">{formState.errors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Enter product description"
                className="min-h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="price" className="text-sm font-medium text-gray-700">
                  Price (Rp) *
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formState.price}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="0"
                  min="0"
                />
                {formState.errors.price && (
                  <p className="text-sm text-red-500">{formState.errors.price}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="is_active"
                  name="is_active"
                  value={formState.is_active ? 'true' : 'false'}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      is_active: e.target.value === 'true',
                    }))
                  }
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Product Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isLoading}
                  className="hidden"
                  id="image-input"
                />
                <label
                  htmlFor="image-input"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer transition-colors bg-gray-50"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  </div>
                </label>
              </div>
              {formState.imagePreview && (
                <div className="relative w-full h-32 mt-2 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={formState.imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        image: null,
                        imagePreview: product?.image_url || '',
                      }))
                    }
                    className="absolute top-2 right-2 p-1 bg-white rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category-Specific Fields */}
          {categoryFields[category] && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-gray-900">
                {category.charAt(0).toUpperCase() + category.slice(1)} Details
              </h3>
              {categoryFields[category].map(renderCategoryField)}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
