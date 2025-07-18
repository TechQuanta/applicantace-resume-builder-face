import React from "react";

const AuthErrorDisplay = ({ error }) => {
  // If there's no error message, don't render anything
  if (!error) return null;

  return (
    <div className="mb-4 text-red-600 text-sm font-semibold dark:text-red-400">
      {error}
    </div>
  );
};

export default AuthErrorDisplay;