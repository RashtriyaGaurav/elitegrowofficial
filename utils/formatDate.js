function formatDate(date) {
  const options = { year: 'numeric', month: 'long' }; // e.g., "August 2025"
  return new Date(date).toLocaleDateString('en-IN', options);
}
