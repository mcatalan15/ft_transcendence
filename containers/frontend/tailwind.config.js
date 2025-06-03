module.exports = {
	content: [
	  "./src/**/*.{html,ts}",
	  "./public/index.html",
	],
	theme: {
	  extend: {
		fontFamily: {
			anatol:['"anatol-mn"', 'sans-serif'],
		},
		animation: {
			'float-x': 'floatX 4s ease-in-out infinite',
			'float-y': 'floatY 6s ease-in-out infinite',
		  },
		  keyframes: {
			floatX: {
			  '0%, 100%': { transform: 'translateX(0)' },
			  '50%': { transform: 'translateX(20px)' },
			},
			floatY: {
			  '0%, 100%': { transform: 'translateY(0)' },
			  '50%': { transform: 'translateY(-20px)' },
			},
		  },
		},
	  },
	  plugins: [],
	}

  export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,js}'],
  theme: {
    extend: {},
  },
  plugins: [],
}


//module.exports = {
//	content: ['./src/**/*.{ts,tsx,html}'],
//	theme: {
/*	  extend: {
	  },
	},
	plugins: [],
  };*/
  