// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        dark: {
          bg: 'var(--bg-dark)',
          blue: 'var(--bg-blue-dark)',
          text: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
        }
      },
      fontFamily: {
        title: 'var(--font-title)',
        subtitle: 'var(--font-subtitle)',
        body: 'var(--font-body)',
      }
    }
  }
}