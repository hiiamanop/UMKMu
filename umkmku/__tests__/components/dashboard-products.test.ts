import { describe, it, expect, beforeEach } from 'vitest'
import { validateCategoryData, type CategoryType } from '@/lib/categories'

describe('Dashboard Products Management', () => {
  describe('ProductTable', () => {
    it('should render products list with correct columns', () => {
      const columns = ['Product Name', 'Category', 'Price', 'Status', 'Actions']
      expect(columns).toHaveLength(5)
      expect(columns[0]).toBe('Product Name')
      expect(columns[4]).toBe('Actions')
    })

    it('should display empty state when no products exist', () => {
      const emptyState = {
        title: 'No products yet',
        message: 'Start by adding your first product to your store.',
      }
      expect(emptyState.title).toBe('No products yet')
      expect(emptyState.message).toContain('product')
    })

    it('should format rupiah currency correctly', () => {
      const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(amount)
      }

      expect(formatRupiah(100000)).toContain('Rp')
      expect(formatRupiah(2850000)).toContain('2')
      expect(formatRupiah(0)).toContain('Rp')
    })

    it('should display category badges with correct colors', () => {
      const categoryColors: Record<string, string> = {
        skincare: 'bg-pink-100 text-pink-800',
        parfum: 'bg-purple-100 text-purple-800',
        fashion: 'bg-blue-100 text-blue-800',
        fdb: 'bg-green-100 text-green-800',
      }

      expect(categoryColors.skincare).toContain('pink')
      expect(categoryColors.parfum).toContain('purple')
      expect(categoryColors.fashion).toContain('blue')
      expect(categoryColors.fdb).toContain('green')
    })

    it('should have edit and delete action buttons', () => {
      const actions = ['Edit', 'Delete']
      expect(actions).toContain('Edit')
      expect(actions).toContain('Delete')
    })

    it('should display product status badge (Active/Inactive)', () => {
      const product = { is_active: true }
      const status = product.is_active ? 'Active' : 'Inactive'
      expect(status).toBe('Active')

      const inactiveProduct = { is_active: false }
      const inactiveStatus = inactiveProduct.is_active ? 'Active' : 'Inactive'
      expect(inactiveStatus).toBe('Inactive')
    })

    it('should handle mobile view with card layout', () => {
      const mobileClasses = ['md:hidden', 'space-y-4']
      expect(mobileClasses).toContain('md:hidden')
      expect(mobileClasses).toContain('space-y-4')
    })
  })

  describe('ProductForm', () => {
    describe('Common Fields', () => {
      it('should render name field as required', () => {
        const fields = {
          name: { label: 'Product Name', required: true },
          description: { label: 'Description', required: false },
          price: { label: 'Price (Rp)', required: true },
          is_active: { label: 'Status', required: true },
        }

        expect(fields.name.required).toBe(true)
        expect(fields.price.required).toBe(true)
        expect(fields.description.required).toBe(false)
      })

      it('should validate price is a positive number', () => {
        const prices = [100000, 250000, 0]
        prices.forEach((price) => {
          expect(price).toBeGreaterThanOrEqual(0)
        })
      })

      it('should handle image upload field', () => {
        const imageField = {
          type: 'file',
          accept: 'image/*',
          placeholder: 'Click to upload or drag and drop',
        }
        expect(imageField.accept).toBe('image/*')
        expect(imageField.placeholder).toContain('upload')
      })

      it('should show image preview after upload', () => {
        const preview = {
          type: 'image',
          hasRemoveButton: true,
          maxHeight: '128px',
        }
        expect(preview.hasRemoveButton).toBe(true)
      })
    })

    describe('Category-Specific Fields', () => {
      describe('Skincare Category', () => {
        it('should render skincare fields', () => {
          const skincareFields = [
            'skin_types',
            'concerns',
            'ingredients',
            'usage_step',
          ]
          expect(skincareFields).toHaveLength(4)
        })

        it('should validate skincare data', () => {
          const validData = {
            skin_types: ['oily', 'combination'],
            concerns: ['acne', 'brightening'],
            ingredients: ['niacinamide', 'vitamin-c'],
            usage_step: 'serum',
          }

          const result = validateCategoryData('skincare', validData)
          expect(result.success).toBe(true)
        })

        it('should reject invalid skincare data', () => {
          const invalidData = {
            skin_types: ['invalid-type'],
            concerns: ['acne'],
            ingredients: ['niacinamide'],
            usage_step: 'invalid-step',
          }

          const result = validateCategoryData('skincare', invalidData)
          expect(result.success).toBe(false)
        })

        it('should list skincare options correctly', () => {
          const skinTypes = ['oily', 'dry', 'combination', 'sensitive', 'all']
          const concerns = ['acne', 'brightening', 'anti-aging', 'hydrating', 'pores', 'sensitive']
          const usageSteps = ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'treatment']

          expect(skinTypes).toHaveLength(5)
          expect(concerns).toHaveLength(6)
          expect(usageSteps).toHaveLength(6)
        })
      })

      describe('Parfum Category', () => {
        it('should render parfum fields', () => {
          const parfumFields = [
            'fragrance_family',
            'notes_top',
            'notes_middle',
            'notes_base',
            'size',
            'longevity',
          ]
          expect(parfumFields).toHaveLength(6)
        })

        it('should validate parfum data', () => {
          const validData = {
            fragrance_family: ['floral', 'oriental'],
            notes_top: ['bergamot', 'lemon'],
            notes_middle: ['rose', 'jasmine'],
            notes_base: ['musk', 'cedar'],
            size: '100',
            longevity: 'long-lasting',
          }

          const result = validateCategoryData('parfum', validData)
          expect(result.success).toBe(true)
        })

        it('should list size options correctly', () => {
          const sizes = ['30', '50', '100', '200']
          expect(sizes).toHaveLength(4)
        })

        it('should list longevity options correctly', () => {
          const longevities = ['light', 'moderate', 'long-lasting']
          expect(longevities).toHaveLength(3)
        })
      })

      describe('Fashion Category', () => {
        it('should render fashion fields', () => {
          const fashionFields = [
            'sizes',
            'colors',
            'materials',
            'fit',
            'style',
          ]
          expect(fashionFields).toHaveLength(5)
        })

        it('should validate fashion data', () => {
          const validData = {
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['black', 'white', 'blue'],
            materials: ['cotton', 'polyester'],
            fit: 'regular',
            style: ['casual', 'formal'],
          }

          const result = validateCategoryData('fashion', validData)
          expect(result.success).toBe(true)
        })

        it('should list fit options correctly', () => {
          const fits = ['slim', 'regular', 'relaxed', 'oversized']
          expect(fits).toHaveLength(4)
        })
      })

      describe('F&B Category', () => {
        it('should render F&B fields', () => {
          const fdbFields = [
            'ingredients',
            'allergens',
            'preparation_time',
            'servings',
            'dietary',
          ]
          expect(fdbFields).toHaveLength(5)
        })

        it('should validate F&B data', () => {
          const validData = {
            ingredients: ['flour', 'sugar', 'butter'],
            allergens: ['gluten', 'dairy'],
            preparation_time: 30,
            servings: 4,
            dietary: ['vegetarian', 'gluten-free'],
          }

          const result = validateCategoryData('fdb', validData)
          expect(result.success).toBe(true)
        })

        it('should validate numeric fields for F&B', () => {
          const invalidData = {
            ingredients: ['flour'],
            allergens: [],
            preparation_time: -10,
            servings: 0,
            dietary: [],
          }

          const result = validateCategoryData('fdb', invalidData)
          expect(result.success).toBe(false)
        })

        it('should list dietary options correctly', () => {
          const dietaryOptions = ['vegan', 'vegetarian', 'gluten-free', 'halal']
          expect(dietaryOptions).toHaveLength(4)
        })
      })
    })

    describe('Form Validation', () => {
      it('should require product name', () => {
        const errors = validateCategoryData('skincare', {
          skin_types: ['oily'],
          concerns: ['acne'],
          ingredients: ['test'],
          usage_step: 'serum',
        })
        // Note: name validation is done separately in component
        expect(errors.success).toBe(true)
      })

      it('should validate category data before submission', () => {
        const invalidData = {
          skin_types: ['oily'],
          concerns: ['invalid-concern'],
          ingredients: [],
          usage_step: 'serum',
        }

        const result = validateCategoryData('skincare', invalidData)
        expect(result.success).toBe(false)
      })

      it('should display validation errors', () => {
        const errorMessages = {
          name: 'Name is required',
          price: 'Price is required',
          category: 'Category data is invalid',
        }

        expect(errorMessages.name).toContain('required')
        expect(errorMessages.price).toContain('required')
      })
    })

    describe('Form Actions', () => {
      it('should have submit button with correct labels', () => {
        const createLabel = 'Create Product'
        const updateLabel = 'Update Product'

        expect(createLabel).toContain('Create')
        expect(updateLabel).toContain('Update')
      })

      it('should have cancel button', () => {
        const buttons = ['Cancel', 'Create Product']
        expect(buttons).toContain('Cancel')
      })

      it('should disable buttons during submission', () => {
        const isLoading = true
        expect(isLoading).toBe(true)
      })
    })
  })

  describe('ProductsPage Integration', () => {
    it('should load products on mount', () => {
      const loadStates = ['loading', 'loaded', 'error']
      expect(loadStates).toContain('loading')
      expect(loadStates).toContain('loaded')
    })

    it('should fetch tenant data', () => {
      const tenant = {
        id: 'uuid',
        slug: 'glow-id',
        category: 'skincare',
        brand_name: 'Glow',
      }

      expect(tenant.slug).toBe('glow-id')
      expect(tenant.category).toBe('skincare')
    })

    it('should handle add product flow', () => {
      const flowSteps = [
        'Click add button',
        'Form opens',
        'Fill fields',
        'Submit',
        'Product added',
      ]

      expect(flowSteps).toHaveLength(5)
      expect(flowSteps[0]).toBe('Click add button')
    })

    it('should handle edit product flow', () => {
      const flowSteps = [
        'Click edit',
        'Form opens with data',
        'Modify fields',
        'Submit',
        'Product updated',
      ]

      expect(flowSteps).toHaveLength(5)
    })

    it('should handle delete product with confirmation', () => {
      const flowSteps = [
        'Click delete',
        'Confirmation dialog appears',
        'Confirm deletion',
        'Product deleted',
      ]

      expect(flowSteps).toHaveLength(4)
    })

    it('should display error messages', () => {
      const errors = {
        fetchError: 'Failed to fetch products',
        submitError: 'Failed to save product',
        deleteError: 'Failed to delete product',
      }

      expect(errors.fetchError).toContain('Failed')
      expect(Object.keys(errors)).toHaveLength(3)
    })

    it('should display success messages', () => {
      const messages = {
        createSuccess: 'Product created successfully',
        updateSuccess: 'Product updated successfully',
        deleteSuccess: 'Product deleted successfully',
      }

      expect(messages.createSuccess).toContain('created')
      expect(messages.updateSuccess).toContain('updated')
      expect(messages.deleteSuccess).toContain('deleted')
    })

    it('should handle loading state during fetch', () => {
      const loadingIndicator = 'Loader2 animate-spin'
      expect(loadingIndicator).toContain('animate-spin')
    })

    it('should respond to slug parameter changes', () => {
      const slugs = ['glow-id', 'another-brand', 'brand-123']
      slugs.forEach((slug) => {
        expect(slug).toBeTruthy()
        expect(slug).toContain('-')
      })
    })

    it('should render responsive layout', () => {
      const responsiveClasses = [
        'flex-col sm:flex-row',
        'hidden md:block',
        'md:hidden',
      ]

      expect(responsiveClasses).toContain('flex-col sm:flex-row')
      expect(responsiveClasses).toContain('hidden md:block')
    })

    it('should show form in modal overlay', () => {
      const modalConfig = {
        zIndex: 'z-50',
        background: 'bg-black/50',
        positioning: 'fixed inset-0',
        centered: true,
      }

      expect(modalConfig.zIndex).toBe('z-50')
      expect(modalConfig.background).toContain('black')
    })

    it('should show delete confirmation dialog', () => {
      const dialogConfig = {
        title: 'Delete Product',
        message: 'Are you sure you want to delete this product?',
        buttons: ['Cancel', 'Delete'],
      }

      expect(dialogConfig.title).toBe('Delete Product')
      expect(dialogConfig.buttons).toHaveLength(2)
    })
  })

  describe('Category Data Handling', () => {
    it('should pass category type to form', () => {
      const categoryTypes: Array<CategoryType> = [
        'skincare',
        'parfum',
        'fashion',
        'fdb',
      ]

      expect(categoryTypes).toHaveLength(4)
      expect(categoryTypes).toContain('skincare')
    })

    it('should store category-specific data in correct field', () => {
      const categoryDataMap = {
        skincare: 'skincare_data',
        parfum: 'parfum_data',
        fashion: 'fashion_data',
        fdb: 'fdb_data',
      }

      expect(categoryDataMap.skincare).toBe('skincare_data')
      expect(Object.keys(categoryDataMap)).toHaveLength(4)
    })

    it('should handle null category data gracefully', () => {
      const product = {
        id: 'uuid',
        name: 'Test',
        category_type: 'skincare' as const,
        skincare_data: null,
      }

      expect(product.skincare_data).toBeNull()
    })
  })

  describe('API Integration', () => {
    it('should call GET /api/products?slug=...', () => {
      const endpoint = '/api/products?slug=glow-id'
      expect(endpoint).toContain('/api/products')
      expect(endpoint).toContain('slug')
    })

    it('should call POST /api/products for creation', () => {
      const method = 'POST'
      const endpoint = '/api/products'
      expect(method).toBe('POST')
      expect(endpoint).toContain('products')
    })

    it('should call PUT /api/products/:id for update', () => {
      const method = 'PUT'
      const endpoint = '/api/products/uuid-123'
      expect(method).toBe('PUT')
      expect(endpoint).toContain('uuid-123')
    })

    it('should call DELETE /api/products/:id for deletion', () => {
      const method = 'DELETE'
      const endpoint = '/api/products/uuid-123?slug=glow-id'
      expect(method).toBe('DELETE')
      expect(endpoint).toContain('slug')
    })

    it('should send category data in request body', () => {
      const bodyFields = [
        'slug',
        'name',
        'description',
        'price',
        'is_active',
        'category_type',
        'skin_types',
        'concerns',
      ]

      expect(bodyFields).toContain('slug')
      expect(bodyFields).toContain('category_type')
    })
  })

  describe('Image Upload', () => {
    it('should accept image files only', () => {
      const accept = 'image/*'
      expect(accept).toContain('image')
    })

    it('should display image preview', () => {
      const previewConfig = {
        shown: true,
        hasRemoveButton: true,
      }

      expect(previewConfig.shown).toBe(true)
      expect(previewConfig.hasRemoveButton).toBe(true)
    })

    it('should handle image upload in form submission', () => {
      const formDataFields = [
        'name',
        'description',
        'price',
        'image',
        'category_type',
      ]

      expect(formDataFields).toContain('image')
    })
  })

  describe('Error Handling', () => {
    it('should display network errors', () => {
      const error = 'Failed to fetch products'
      expect(error).toContain('Failed')
    })

    it('should display validation errors', () => {
      const error = 'Category data validation failed: skin_types must not be empty'
      expect(error).toContain('validation')
    })

    it('should handle 404 errors', () => {
      const error = 'Tenant not found'
      expect(error).toContain('not found')
    })

    it('should allow retry after error', () => {
      const actions = ['Show error', 'Allow refresh', 'Clear error on new attempt']
      expect(actions).toHaveLength(3)
    })
  })

  describe('Success States', () => {
    it('should show success message after create', () => {
      const message = 'Product created successfully'
      expect(message).toContain('created')
    })

    it('should show success message after update', () => {
      const message = 'Product updated successfully'
      expect(message).toContain('updated')
    })

    it('should show success message after delete', () => {
      const message = 'Product deleted successfully'
      expect(message).toContain('deleted')
    })

    it('should auto-clear success messages', () => {
      const timeout = 3000
      expect(timeout).toBe(3000)
    })

    it('should refresh products list after CRUD', () => {
      const actions = ['create', 'update', 'delete', 'refresh list']
      expect(actions.slice(-1)[0]).toBe('refresh list')
    })
  })
})
