module.exports = {
	"plugins": {
		"posthtml-doctype": {
			"doctype": "HTML 5"
		},
		"posthtml-extend": {
			"root": "./src"
		},
		"posthtml-inline-svg": {
			"cwd": process.cwd() + "/src"
		},
		"posthtml-link-noreferrer": {
			"attr": ['noopener', 'noreferrer']
		}
	}
};
