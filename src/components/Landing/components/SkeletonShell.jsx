import React from 'react';

const SkeletonCard = () => (
  <div className="animate-pulse bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <div className="h-4 w-24 bg-gray-300 rounded mb-3" />
    <div className="h-5 w-full bg-gray-300 rounded mb-2" />
    <div className="h-5 w-3/4 bg-gray-300 rounded mb-4" />
    <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
    <div className="h-4 w-1/3 bg-gray-200 rounded" />
  </div>
);

export default SkeletonCard;