module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#476800',
          container: '#97d700',
          'fixed-dim': '#99d907',
          fixed: '#b4f734',
        },
        surface: {
          DEFAULT: '#fcf9f8',
          'container-lowest': '#ffffff',
          'container-low': '#f6f3f2',
          container: '#f0edec',
          'container-high': '#ebe7e7',
          'container-highest': '#e5e2e1',
          dim: '#dcd9d9',
          bright: '#fcf9f8',
        },
        outline: {
          DEFAULT: '#737a63',
          variant: '#c2caaf',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
      },
      fontFamily: {
        headline: ['Hanken Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      spacing: {
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
        gutter: '24px',
        'section-padding': '80px',
        'container-max': '1280px',
        'margin-desktop': '48px',
        'margin-mobile': '16px',
      },
      borderRadius: {
        DEFAULT: '2px',
        lg: '4px',
        xl: '8px',
        full: '12px',
      },
    },
  },
};
