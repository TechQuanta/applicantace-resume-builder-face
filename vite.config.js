export default {
  optimizeDeps: {
    include: ["jwt-decode"],
  },
  envPrefix: 'GITHUB_',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
};
