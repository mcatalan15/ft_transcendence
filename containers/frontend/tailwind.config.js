module.exports = {
	content: [
	  "./src/**/*.{html,ts}",
	  "./public/index.html",
	],
	safelist: [
		'bg-cyan-300', 'border-cyan-300', 'group-hover:text-cyan-300',
		'bg-lime-400', 'border-lime-400', 'group-hover:text-lime-400',
		'bg-amber-400', 'border-amber-400', 'group-hover:text-amber-400',
		'bg-pink-400', 'border-pink-400', 'group-hover:text-pink-400',
		    // Cyan
			'bg-cyan-950', 'text-cyan-400', 'border-cyan-400', 'shadow-cyan-400', 'bg-cyan-400',
			// Lime
			'bg-lime-950', 'text-lime-400', 'border-lime-400', 'shadow-lime-400', 'bg-lime-400',
			// Amber
			'bg-amber-950', 'text-amber-400', 'border-amber-400', 'shadow-amber-400', 'bg-amber-400',
			// Pink
			'bg-pink-950', 'text-pink-400', 'border-pink-400', 'shadow-pink-400', 'bg-pink-400',
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
  