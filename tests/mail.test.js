const fs = require('fs');
const path = require('path');

const mailJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'mail.js'), 'utf8');
const regexMatch = mailJs.match(/var email_reg = (\/[^;]+\/);/);
if (!regexMatch) throw new Error('email_reg regex not found');
const emailRegex = eval(regexMatch[1]);

describe('email regex from mail.js', () => {
  const valid = [
    'user@example.com',
    'first.last@example.co.uk',
    'user123@test-domain.io',
  ];
  const invalid = [
    'plainaddress',
    'missing@domain',
    'user@.com',
    'user@domain..com',
  ];

  test('accepts valid addresses', () => {
    for (const e of valid) {
      expect(emailRegex.test(e)).toBe(true);
    }
  });

  test('rejects invalid addresses', () => {
    for (const e of invalid) {
      expect(emailRegex.test(e)).toBe(false);
    }
  });
});
