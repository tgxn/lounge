"use strict";

const fs = require("fs");
const Helper = require("../helper");
const requireg = require("requireg");
const colors = require("colors/safe");
const path = require("path");
const themes = new Map();

module.exports = {
	get: get,
	fileName: fileName
};

fs.readdir("client/themes/", (err, dirThemes) => {
	if (err) {
		return;
	}
	dirThemes
		.filter((theme) => theme.endsWith(".css"))
		.map(makeLocalThemeObject)
		.forEach((theme) => themes.set(theme.name, theme));
});

Helper.config.plugins
	.map(makeModuleThemeObject)
	.forEach((theme) => {
		if (theme) {
			themes.set(theme.name, theme);
		}
	});

function get() {
	return Array.from(themes.values());
}

function fileName(module) {
	if (themes.has(module)) {
		return themes.get(module).filename;
	}
}

function makeLocalThemeObject(css) {
	const themeName = css.slice(0, -4);
	return {
		displayName: themeName.charAt(0).toUpperCase() + themeName.slice(1),
		filename: path.join(__dirname, "..", "client", "themes", `${themeName}.css}`),
		name: themeName
	};
}

function getModuleInfo(moduleName) {
	let module;
	try {
		module = requireg(moduleName);
	} catch (e) {
		try {
			module = require(moduleName);
		} catch (e2) {
			log.warn(`Specified theme ${colors.yellow(moduleName)} is not installed locally or globally`);
			return;
		}
	}
	if (!module.lounge) {
		log.warn(`Specified theme ${colors.yellow(moduleName)} doesn't have required information.`);
		return;
	}
	return module.lounge;
}

function makeModuleThemeObject(moduleName) {
	const module = getModuleInfo(moduleName);
	if (!module || module.type !== "theme") {
		return;
	}
	const modulePath = requireg.resolve(moduleName) || require.resolve(moduleName);
	const displayName = module.name || moduleName;
	const filename = path.join(modulePath.substring(0, modulePath.lastIndexOf(path.sep)), module.css);
	return {
		displayName: displayName,
		filename: filename,
		name: moduleName
	};
}
