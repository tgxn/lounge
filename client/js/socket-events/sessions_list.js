"use strict";

const $ = require("jquery");
const socket = require("../socket");
const templates = require("../../views");
const list = $("#session-list");

socket.on("sessions:list", function(data) {
	let html = "";
	data.forEach((connection) => {
		html += templates.session(connection);
	});

	list.html(html);
});
