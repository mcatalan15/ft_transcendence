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
	  },
	},
	plugins: [],


	// Optional purge
	purge: {
	  content: [
		"./src/**/*.{html,ts}",
		"./public/index.html"
	  ],
	  options: {
		safelist: ['body', 'html'],
	  },
	},
  }
  