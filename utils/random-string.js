module.exports = (length = 5) => {
  // let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let charactersLength = characters.length;
  let randomString = '';
  for (var i = 0; i < length; i++) {
    var rand = Math.round(Math.random() * charactersLength - 1);
    if (characters[rand]) {
      randomString += characters[rand];
    }
    else {
      randomString += characters[charactersLength - 1];
    }
  }
  return randomString;
};