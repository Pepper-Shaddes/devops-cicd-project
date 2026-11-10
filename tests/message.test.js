const { isValidMessage } = require('../messageValidator');

describe('Message validation', () => {

    test('Accepts a valid message', () => {
        expect(isValidMessage('Hello DevOps')).toBe(true);
    });

    test('Rejects an empty message', () => {
        expect(isValidMessage('')).toBe(false);
    });

    test('Rejects a message containing only spaces', () => {
        expect(isValidMessage('   ')).toBe(false);
    });

    test('Rejects non-string values', () => {
        expect(isValidMessage(123)).toBe(false);
    });

});
