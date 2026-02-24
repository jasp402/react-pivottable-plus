const nextra = require('nextra');

const withNextra = (typeof nextra === 'function' ? nextra : nextra.default)({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
});

module.exports = withNextra({
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/react-pivottable-plus' : '',
  trailingSlash: true,
  // Desactivamos ESLint durante el build para evitar bloqueos por reglas incompatibles
  eslint: {
    ignoreDuringBuilds: true,
  },
});
