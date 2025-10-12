'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface DeleteListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
  } | null;
  onDeleted: () => void; // Callback after successful deletion
}

export const DeleteListingModal = ({
  isOpen,
  onClose,
  listing,
  onDeleted,
}: DeleteListingModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!listing) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Listing deleted successfully');
        onDeleted(); // Callback to refresh listings
        onClose();
      } else {
        alert(data.error || 'Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('An error occurred while deleting the listing');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!listing) return null;

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 p-6 shadow-2xl backdrop-blur-2xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-white">
                        Delete Listing?
                      </Dialog.Title>
                      <p className="mt-1 text-sm text-white/60">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isDeleting}
                    className="rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-medium text-white">
                      {listing.title}
                    </p>
                  </div>

                  <p className="text-sm text-white/80">
                    Are you sure you want to delete this listing? This will permanently remove
                    it from your dashboard and make it unavailable to clients.
                  </p>

                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <p className="text-xs text-amber-200/80">
                      <strong>Note:</strong> This is a soft delete. The listing data will be
                      retained in the system but marked as deleted.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isDeleting}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="h-4 w-4" />
                        Delete Listing
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
