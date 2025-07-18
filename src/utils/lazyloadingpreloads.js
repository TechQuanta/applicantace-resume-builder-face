// utils/lazyWithPreload.js
import React from 'react';

function lazyWithPreload(factory) {
  const Component = React.lazy(factory);
  // We attach the factory function itself as a 'preload' method.
  // Calling it will trigger the import().
  Component.preload = factory;
  return Component;
}

export default lazyWithPreload;