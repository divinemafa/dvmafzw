'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { CategorySelector } from './CategorySelector';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit'; // NEW: Support both create and edit modes
  listingId?: string; // NEW: Required for edit mode
  onSuccess?: () => void; // NEW: Callback after successful save
}

interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'service' | 'product' | 'both';
  description: string | null;
  icon: string | null;
  is_featured: boolean;
}

const CURRENCIES = ['ZAR', 'BTC', 'USD', 'EUR'];

export const CreateListingModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // Default to create mode
  listingId,
  onSuccess 
}: CreateListingModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    categoryId: null as string | null,
    categoryName: '',
    customCategory: '',
    shortDescription: '',
    longDescription: '',
    price: '',
    currency: 'ZAR',
    location: '',
    availability: '',
    features: ['', '', ''],
    tags: '',
    imageUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingListing, setIsFetchingListing] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  // Category handlers
  const handleCategorySelect = (categoryId: string | null, category: Category | null) => {
    setFormData({
      ...formData,
      categoryId,
      categoryName: category?.name || '',
    });
    setShowCustomCategory(false);
  };

  const handleCustomCategory = (categoryName: string) => {
    setShowCustomCategory(true);
    setFormData({
      ...formData,
      customCategory: categoryName,
      categoryId: null,
      categoryName: '',
    });
  };

  // NEW: Fetch listing data if in edit mode
  useEffect(() => {
    const fetchListingData = async () => {
      if (mode !== 'edit' || !listingId || !isOpen) return;

      setIsFetchingListing(true);
      try {
        const response = await fetch(`/api/listings/${listingId}`);
        const data = await response.json();

        if (response.ok && data.listing) {
          const listing = data.listing;
          
          // Pre-fill form with existing data
          setFormData({
            title: listing.title || '',
            categoryId: listing.category_id || null,
            categoryName: listing.category || '',
            customCategory: '',
            shortDescription: listing.short_description || '',
            longDescription: listing.long_description || '',
            price: listing.price?.toString() || '',
            currency: listing.currency || 'ZAR',
            location: listing.location || '',
            availability: listing.availability || '',
            features: Array.isArray(listing.features) && listing.features.length > 0 
              ? listing.features 
              : ['', '', ''],
            tags: Array.isArray(listing.tags) ? listing.tags.join(', ') : '',
            imageUrl: listing.image_url || '',
          });
        } else {
          alert('Failed to load listing data: ' + (data.error || 'Unknown error'));
          onClose();
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        alert('Error loading listing. Please try again.');
        onClose();
      } finally {
        setIsFetchingListing(false);
      }
    };

    fetchListingData();
  }, [isOpen, mode, listingId, onClose]);



  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use custom category if user entered one, otherwise use selected category
      const categoryToSubmit = showCustomCategory ? formData.customCategory : formData.categoryName;
      const categoryIdToSubmit = showCustomCategory ? null : formData.categoryId;

      // Determine API endpoint and method based on mode
      const url = mode === 'create' ? '/api/listings' : `/api/listings/${listingId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      // Call API to create/update listing
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          category: categoryToSubmit,
          categoryId: categoryIdToSubmit,
          shortDescription: formData.shortDescription,
          longDescription: formData.longDescription,
          price: formData.price,
          currency: formData.currency,
          location: formData.location,
          availability: formData.availability,
          features: formData.features.filter((f) => f.trim() !== ''),
          tags: formData.tags,
          imageUrl: formData.imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${mode} listing`);
      }

      // Success! Close modal and reset form
      let successMessage = '';
      if (mode === 'create') {
        successMessage = showCustomCategory 
          ? 'Listing created successfully! Your custom category will be reviewed by admins before going live.'
          : 'Listing created successfully as draft! Click "Publish" to make it live.';
      } else {
        successMessage = 'Listing updated successfully!';
      }
      
      alert(successMessage);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
      
      // Only reset form if in create mode
      if (mode === 'create') {
        setFormData({
          title: '',
          categoryId: null,
          categoryName: '',
          customCategory: '',
          shortDescription: '',
          longDescription: '',
          price: '',
          currency: 'ZAR',
          location: '',
          availability: '',
          features: ['', '', ''],
          tags: '',
          imageUrl: '',
        });
        setShowCustomCategory(false);
      }
      
      // Reload page to show updated/new listing
      window.location.reload();
    } catch (error) {
      console.error('Failed to create listing:', error);
      alert(error instanceof Error ? error.message : 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 p-6 shadow-2xl backdrop-blur-2xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-white/10 pb-4">
                  <div>
                    <Dialog.Title className="flex items-center gap-2 text-2xl font-semibold text-white">
                      <SparklesIcon className="h-6 w-6 text-cyan-400" aria-hidden />
                      {mode === 'create' ? 'Create New Listing' : 'Edit Listing'}
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-white/60">
                      {mode === 'create' 
                        ? 'Fill in the details below to create your service listing. All fields marked with * are required.'
                        : 'Update your listing details below. Changes will be saved immediately.'
                      }
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Loading State for Edit Mode */}
                {isFetchingListing ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-cyan-400"></div>
                      <p className="text-sm text-white/60">Loading listing data...</p>
                    </div>
                  </div>
                ) : (
                  /* Form */
                  <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Title */}
                    <div className="md:col-span-2">
                      <label htmlFor="title" className="block text-sm font-semibold text-white">
                        Service Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Professional Home Cleaning Service"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
                      />
                    </div>

                    {/* Category - Hierarchical Selector */}
                    <div>
                      <label className="block text-sm font-semibold text-white">
                        Category *
                      </label>
                      {!showCustomCategory ? (
                        <div className="mt-2">
                          <CategorySelector
                            value={formData.categoryId}
                            onChange={handleCategorySelect}
                            type="service"
                            required
                            placeholder="Search categories (e.g., cleaning, legal, tech)..."
                            allowCustom
                            onCustomCategory={handleCustomCategory}
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            required={showCustomCategory}
                            value={formData.customCategory}
                            onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                            placeholder="Enter your custom category"
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomCategory(false);
                              setFormData({ ...formData, customCategory: '' });
                            }}
                            className="text-xs text-cyan-300 hover:text-cyan-200"
                          >
                            ← Back to category list
                          </button>
                          <p className="text-xs text-white/50">
                            Note: Custom categories will be reviewed by admins before approval
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div>
                      <label htmlFor="location" className="block text-sm font-semibold text-white">
                        Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Cape Town, Western Cape"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label htmlFor="price" className="block text-sm font-semibold text-white">
                        Price *
                      </label>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="number"
                          id="price"
                          required
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="500"
                          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
                        />
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20 [color-scheme:dark]"
                        >
                          {CURRENCIES.map((curr) => (
                            <option key={curr} value={curr} className="bg-slate-900 text-white">
                              {curr}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Availability */}
                    <div>
                      <label htmlFor="availability" className="block text-sm font-semibold text-white">
                        Availability *
                      </label>
                      <input
                        type="text"
                        id="availability"
                        required
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        placeholder="e.g., Next available: Tomorrow at 09:00"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
                      />
                    </div>

                    {/* Short Description */}
                    <div className="md:col-span-2">
                      <label htmlFor="shortDescription" className="block text-sm font-semibold text-white">
                        Short Description * (Max 120 characters)
                      </label>
                      <input
                        type="text"
                        id="shortDescription"
                        required
                        maxLength={120}
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        placeholder="Brief one-liner about your service"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
                      />
                      <p className="mt-1 text-xs text-white/40">
                        {formData.shortDescription.length}/120 characters
                      </p>
                    </div>

                    {/* Long Description */}
                    <div className="md:col-span-2">
                      <label htmlFor="longDescription" className="block text-sm font-semibold text-white">
                        Detailed Description *
                      </label>
                      <textarea
                        id="longDescription"
                        required
                        rows={4}
                        value={formData.longDescription}
                        onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                        placeholder="Provide a detailed description of your service, what's included, your experience, etc."
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
                      />
                    </div>

                    {/* Features */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-white">
                        Key Features * (Add at least 3)
                      </label>
                      <div className="mt-2 space-y-2">
                        {formData.features.map((feature, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              required={index < 3}
                              value={feature}
                              onChange={(e) => handleFeatureChange(index, e.target.value)}
                              placeholder={`Feature ${index + 1}`}
                              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
                            />
                            {formData.features.length > 3 && (
                              <button
                                type="button"
                                onClick={() => removeFeature(index)}
                                className="rounded-xl border border-white/10 bg-white/5 p-2 text-red-400 transition hover:bg-red-500/10"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addFeature}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Add Feature
                        </button>
                      </div>
                    </div>

                    {/* Image URL */}
                    <div className="md:col-span-2">
                      <label htmlFor="imageUrl" className="block text-sm font-semibold text-white">
                        Image URL (Optional)
                      </label>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="url"
                          id="imageUrl"
                          autoComplete="off"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20 [color-scheme:dark]"
                        />
                        <button
                          type="button"
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition hover:bg-white/10"
                        >
                          <PhotoIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-white/40">
                        Or upload an image (feature coming soon)
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="md:col-span-2">
                      <label htmlFor="tags" className="block text-sm font-semibold text-white">
                        Tags (Optional)
                      </label>
                      <input
                        type="text"
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="e.g., trending, popular, verified (comma-separated)"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#BD24DF]/40 bg-gradient-to-r from-[#BD24DF]/40 via-[#6366f1]/30 to-[#2D6ADE]/40 px-6 py-3 font-semibold text-white shadow-[0_0_30px_-5px_rgba(189,36,223,0.5)] transition hover:from-[#d040f5]/50 hover:to-[#4f82ff]/50 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {mode === 'create' ? 'Creating...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-5 w-5" />
                          {mode === 'create' ? 'Create Listing' : 'Save Changes'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Export with alias for backward compatibility
export { CreateListingModal as ListingModal };
