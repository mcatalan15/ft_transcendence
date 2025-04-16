module.exports = {
	content: [
	  "./src/**/*.{html,ts}",
	  "./public/index.html",
	],
	theme: {
	  extend: {},
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
  