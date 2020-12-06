module.exports.generateRandomString = length => {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let charsLength = chars.length;
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * charsLength));
  return result;
};

module.exports.randomNumber = (min, max) => {
  max = max + 1;
  return Math.floor(Math.random() * (max - min) + min);
};