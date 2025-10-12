'use client';

import { useState } from 'react';
import {
  PencilIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface ListingStatusActionsProps {
  listing: {
    id: string;
    title: string;
    status: 'draft' | 'active' | 'paused';
  };
  onStatusChange: () => void; // Callback to refresh listings
  onEdit: (listingId: string) => void; // Callback to open edit modal
  onDelete: (listingId: string) => void; // Callback to open delete confirmation
}

export const ListingStatusActions = ({
  listing,
  onStatusChange,
  onEdit,
  onDelete,
}: ListingStatusActionsProps) => {
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const handleStatusChange = async (newStatus: 'draft' | 'active' | 'paused') => {
    setIsChangingStatus(true);
    try {
      const response = await fetch(`/api/listings/${listing.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        alert(data.message || `Listing ${newStatus}!`);
        onStatusChange(); // Refresh listings
      } else {
        // Show error with details
        if (data.details && Array.isArray(data.details)) {
          const errorList = data.details.join('\n• ');
          alert(`Cannot publish listing:\n\n• ${errorList}\n\nPlease edit the listing to fix these issues.`);
        } else {
          alert(data.error || 'Failed to update status');
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating the listing status');
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Edit Button - Always visible */}
      <button
        onClick={() => onEdit(listing.id)}
        disabled={isChangingStatus}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
        title="Edit listing"
      >
        <PencilIcon className="h-4 w-4" />
        Edit
      </button>

      {/* Status Change Buttons - Based on current status */}
      {listing.status === 'draft' && (
        <button
          onClick={() => handleStatusChange('active')}
          disabled={isChangingStatus}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
          title="Publish listing to make it live"
        >
          {isChangingStatus ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              Publishing...
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-4 w-4" />
              Publish
            </>
          )}
        </button>
      )}

      {listing.status === 'active' && (
        <button
          onClick={() => handleStatusChange('paused')}
          disabled={isChangingStatus}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
          title="Pause listing to hide it from public"
        >
          {isChangingStatus ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
              Pausing...
            </>
          ) : (
            <>
              <PauseIcon className="h-4 w-4" />
              Pause
            </>
          )}
        </button>
      )}

      {listing.status === 'paused' && (
        <button
          onClick={() => handleStatusChange('active')}
          disabled={isChangingStatus}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
          title="Resume listing to make it live again"
        >
          {isChangingStatus ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              Resuming...
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4" />
              Resume
            </>
          )}
        </button>
      )}

      {/* Delete Button - Always visible */}
      <button
        onClick={() => onDelete(listing.id)}
        disabled={isChangingStatus}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
        title="Delete listing permanently"
      >
        <TrashIcon className="h-4 w-4" />
        Delete
      </button>
    </div>
  );
};
