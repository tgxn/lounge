"use strict";

const $ = require("jquery");
const socket = require("../socket");
const render = require("../render");
const chat = $("#chat");

socket.on("msg", function(data) {
	const targetId = data.chan;
	const target = "#chan-" + targetId;
	const channel = chat.find(target);
	const container = channel.find(".messages");

	const activeChannelId = chat.find(".chan.active").data("id");

	if (data.msg.type === "channel_list" || data.msg.type === "ban_list") {
		$(container).empty();
	}

	// Add message to the container
	render.appendMessage(
		container,
		targetId,
		$(target).attr("data-type"),
		data.msg
	);

	container.trigger("msg", [
		target,
		data
	]).trigger("keepToBottom");

	var lastVisible = container.find("div:visible").last();
	if (data.msg.self
		|| lastVisible.hasClass("unread-marker")
		|| (lastVisible.hasClass("date-marker")
		&& lastVisible.prev().hasClass("unread-marker"))) {
		container
			.find(".unread-marker")
			.appendTo(container);
	}

	// Message arrived in a non active channel, trim it to 100 messages
	if (activeChannelId !== targetId && container.find(".msg").slice(0, -100).remove().length) {
		channel.find(".show-more").addClass("show");

		// Remove date-separators that would otherwise
		// be "stuck" at the top of the channel
		channel.find(".date-marker-container").each(function() {
			if ($(this).next().hasClass("date-marker-container")) {
				$(this).remove();
			}
		});
	}
});
