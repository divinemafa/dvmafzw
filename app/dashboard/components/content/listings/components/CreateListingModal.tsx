'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Combobox } from '@headlessui/react';
import {
  XMarkIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
  CheckIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';

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
    category: '',
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
  const [isFetchingListing, setIsFetchingListing] = useState(false); // NEW: Loading state for fetching
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  
  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch('/api/categories?type=service');
        const data = await response.json();
        
        if (response.ok && data.categories) {
          setCategories(data.categories);
        } else {
          console.error('Failed to fetch categories:', data.error);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

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
            category: listing.category || '',
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

          // Set selected category if exists
          if (listing.category_id && categories.length > 0) {
            const category = categories.find(cat => cat.id === listing.category_id);
            if (category) {
              setSelectedCategory(category);
            }
          } else if (listing.category) {
            // Fallback: find by name
            const category = categories.find(cat => cat.name === listing.category);
            if (category) {
              setSelectedCategory(category);
            }
          }
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
  }, [isOpen, mode, listingId, categories, onClose]);

  // Filter categories based on search query
  const filteredCategories =
    categoryQuery === ''
      ? categories.filter(cat => cat.is_featured) // Show only featured when no search
      : categories.filter((category) =>
          category.name.toLowerCase().includes(categoryQuery.toLowerCase())
        );
  
  // Get featured categories for initial display
  const featuredCategories = categories.filter(cat => cat.is_featured).slice(0, 4);

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
      const categoryToSubmit = showCustomCategory ? formData.customCategory : selectedCategory?.name;
      const categoryIdToSubmit = showCustomCategory ? null : selectedCategory?.id;

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
          category: '',
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
        setSelectedCategory(null);
        setCategoryQuery('');
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

                    {/* Category - Searchable Combobox */}
                    <div>
                      <label className="block text-sm font-semibold text-white">
                        Category *
                      </label>
                      {!showCustomCategory ? (
                        <div className="space-y-2">
                          <Combobox value={selectedCategory} onChange={setSelectedCategory}>
                            <div className="relative mt-2">
                              <div className="relative w-full">
                                <Combobox.Input
                                  required={!showCustomCategory}
                                  className="w-full rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl px-4 py-3 pr-10 !text-white placeholder-white/40 transition focus:border-[#BD24DF]/40 focus:outline-none focus:ring-2 focus:ring-[#BD24DF]/20 [color-scheme:dark]"
                                  displayValue={(category: Category | null) => category?.name || ''}
                                  onChange={(e) => setCategoryQuery(e.target.value)}
                                  placeholder={loadingCategories ? 'Loading...' : 'Type to search (e.g., "cleaning", "legal", "tech")...'}
                                  disabled={loadingCategories}
                                />
                                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  <ChevronUpDownIcon className="h-5 w-5 text-white/40" aria-hidden="true" />
                                </Combobox.Button>
                              </div>
                              {!selectedCategory && !categoryQuery && featuredCategories.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="text-xs text-white/50">Popular:</span>
                                  {featuredCategories.map((cat) => (
                                    <button
                                      key={cat.id}
                                      type="button"
                                      onClick={() => setSelectedCategory(cat)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
                                    >
                                      {cat.icon && <span>{cat.icon}</span>}
                                      {cat.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                                afterLeave={() => setCategoryQuery('')}
                              >
                                <Combobox.Options 
                                  className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl py-1 shadow-2xl"
                                  style={{ backgroundColor: 'rgb(15 23 42 / 0.95)', color: 'white' }}
                                >
                                  {loadingCategories ? (
                                    <div className="px-4 py-3 text-sm text-white/60">
                                      <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400"></div>
                                        Loading categories...
                                      </div>
                                    </div>
                                  ) : filteredCategories.length === 0 && categoryQuery !== '' ? (
                                    <div className="px-4 py-3 text-sm">
                                      <p className="text-white/60 mb-2">No categories match "{categoryQuery}"</p>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowCustomCategory(true);
                                          setFormData({ ...formData, customCategory: categoryQuery });
                                        }}
                                        className="w-full rounded-lg bg-cyan-500/10 px-3 py-2 text-left text-cyan-300 hover:bg-cyan-500/20"
                                      >
                                        ➕ Add "{categoryQuery}" as custom category
                                      </button>
                                    </div>
                                  ) : categoryQuery === '' ? (
                                    <>
                                      <div className="px-4 py-2 text-xs font-semibold text-white/40 uppercase">
                                        Featured Categories (★)
                                      </div>
                                      {filteredCategories.map((category) => (
                                        <Combobox.Option
                                          key={category.id}
                                          value={category}
                                          className={({ active }) =>
                                            `relative cursor-pointer select-none py-2 pl-10 pr-4 !bg-transparent ${
                                              active ? '!bg-[#BD24DF]/20 !text-white' : '!text-white/90'
                                            }`
                                          }
                                        >
                                          {({ selected, active }) => (
                                            <>
                                              <div className="flex items-center gap-2 !text-white">
                                                {category.icon && <span className="text-lg">{category.icon}</span>}
                                                <span className={`block truncate !text-white ${selected ? 'font-semibold' : 'font-normal'}`}>
                                                  {category.name}
                                                </span>
                                                {category.is_featured && (
                                                  <span className="text-xs text-cyan-400">★</span>
                                                )}
                                              </div>
                                              {selected && (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-400">
                                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                              )}
                                            </>
                                          )}
                                        </Combobox.Option>
                                      ))}
                                      {categoryQuery !== '' && (
                                        <div className="border-t border-white/10 px-4 py-2 text-xs text-white/50">
                                          Showing {filteredCategories.length} of {categories.length} categories
                                        </div>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => setShowCustomCategory(true)}
                                        className="w-full border-t border-white/10 px-4 py-2 text-left text-sm font-semibold text-cyan-300 hover:bg-white/5"
                                      >
                                        ➕ Add Custom Category
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {filteredCategories.map((category) => (
                                        <Combobox.Option
                                          key={category.id}
                                          value={category}
                                          className={({ active }) =>
                                            `relative cursor-pointer select-none py-2 pl-10 pr-4 !bg-transparent ${
                                              active ? '!bg-[#BD24DF]/20 !text-white' : '!text-white/90'
                                            }`
                                          }
                                        >
                                          {({ selected, active }) => (
                                            <>
                                              <div className="flex items-center gap-2 !text-white">
                                                {category.icon && <span className="text-lg">{category.icon}</span>}
                                                <span className={`block truncate !text-white ${selected ? 'font-semibold' : 'font-normal'}`}>
                                                  {category.name}
                                                </span>
                                              </div>
                                              {selected && (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-400">
                                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                              )}
                                            </>
                                          )}
                                        </Combobox.Option>
                                      ))}
                                      {categoryQuery !== '' && (
                                        <div className="border-t border-white/10 px-4 py-2 text-xs text-white/50">
                                          Showing {filteredCategories.length} of {categories.length} categories
                                        </div>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => setShowCustomCategory(true)}
                                        className="w-full border-t border-white/10 px-4 py-2 text-left text-sm font-semibold text-cyan-300 hover:bg-white/5"
                                      >
                                        ➕ Add Custom Category
                                      </button>
                                    </>
                                  )}
                                </Combobox.Options>
                              </Transition>
                            </div>
                          </Combobox>
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
