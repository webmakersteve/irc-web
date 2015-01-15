'use strict';

(function() {
	var socket = io();

	var chats = document.querySelector('chat-box');
	chats.socket = socket;

}());