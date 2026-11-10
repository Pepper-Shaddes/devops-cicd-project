function isValidMessage(message) {
	return typeof message === 'string' && message.trim().length > 0;
}

module.exports = { isValidMessage };
