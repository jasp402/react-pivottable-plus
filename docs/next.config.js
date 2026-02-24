const nextra = require('nextra');

// Manejo resiliente de la importación de Nextra (soporte CJS y ESM)
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
  // BasePath dinámico para GitHub Pages y desarrollo local
  basePath: process.env.NODE_ENV === 'production' ? '/react-pivottable-plus' : '',
  // Desactivamos el trailing slash para evitar problemas con las rutas en GitHub Pages
  trailingSlash: true,
});
