'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, AlertCircle, Loader2 } from 'lucide-react'
import { ProductTable } from './ProductTable'
import { ProductForm } from './ProductForm'
import type { Product, Tenant } from '@/lib/supabase/types'

export function ProductsPage() {
  const params = useParams()
  const slug = params.slug as string

  const [products, setProducts] = useState<Product[]>([])
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch tenant and products on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch tenant data
        const tenantRes = await fetch(`/api/tenants?slug=${slug}`)
        if (!tenantRes.ok) throw new Error('Failed to fetch tenant')
        const tenantData = await tenantRes.json()
        setTenant(tenantData.data)

        // Fetch products
        const productsRes = await fetch(`/api/products?slug=${slug}`)
        if (!productsRes.ok) throw new Error('Failed to fetch products')
        const productsData = await productsRes.json()
        setProducts(productsData.data || [])
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchData()
    }
  }, [slug])

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowForm(true)
    setError(null)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
    setError(null)
  }

  const handleFormSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Parse category-specific data
      const categoryFields = formData.getAll('keys') || []
      const categoryData: Record<string, any> = {}

      // Extract category fields from formData
      const name = formData.get('name') as string
      const description = formData.get('description') as string
      const price = formData.get('price') as string
      const is_active = formData.get('is_active') as string
      const category_type = formData.get('category_type') as string
      const image = formData.get('image') as File | null

      // Collect all category-specific fields
      for (const [key, value] of formData.entries()) {
        if (!['name', 'description', 'price', 'is_active', 'category_type', 'image', 'image_url'].includes(key)) {
          try {
            categoryData[key] = JSON.parse(value as string)
          } catch {
            categoryData[key] = value
          }
        }
      }

      // Handle image upload if present
      let image_url = formData.get('image_url') as string | null

      if (image) {
        // For now, we'll store the image as base64 or a URL
        // In a real implementation, you'd upload to Supabase Storage
        const reader = new FileReader()
        await new Promise((resolve) => {
          reader.onloadend = () => {
            image_url = reader.result as string
            resolve(null)
          }
          reader.readAsDataURL(image)
        })
      }

      // Prepare request body
      const body = {
        slug,
        name,
        description: description || null,
        price: price ? Number(price) : null,
        image_url: image_url || null,
        is_active: is_active === 'true',
        category_type: category_type || tenant?.category,
        ...categoryData,
      }

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${editingProduct ? 'update' : 'create'} product`)
      }

      const result = await response.json()

      // Update products list
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? result.data : p))
        )
        setSuccessMessage('Product updated successfully')
      } else {
        setProducts((prev) => [...prev, result.data])
        setSuccessMessage('Product created successfully')
      }

      setShowForm(false)
      setEditingProduct(null)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch(`/api/products/${productId}?slug=${slug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId))
      setDeleteConfirm(null)
      setSuccessMessage('Product deleted successfully')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete product')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-800">
            Tenant not found. Please check the URL.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            Manage your store products and inventory.
          </p>
        </div>
        <Button
          onClick={handleAddProduct}
          disabled={showForm || isSubmitting}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">{successMessage}</div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && tenant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-h-[90vh] overflow-y-auto max-w-2xl w-full">
            <ProductForm
              product={editingProduct}
              category={tenant.category}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false)
                setEditingProduct(null)
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Delete Product</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteProduct(deleteConfirm)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Table */}
      <ProductTable
        products={products}
        onEdit={handleEditProduct}
        onDelete={(productId) => setDeleteConfirm(productId)}
        isLoading={isSubmitting}
      />
    </div>
  )
}
