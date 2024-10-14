const http = require("http");
const httpProxy = require("http-proxy");
var fs = require("fs");

async function getConfig() {
  return new Promise((resolve, reject) => {
    fs.readFile("./proxy_config.json", (err, data) => {
      if (err) {
        return reject(err);
      }
      try {
        const jsonData = JSON.parse(data.toString());
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    });
  });
}
async function main() {
  var pInfo = await getConfig();
  // 建立代理伺服器
  const proxy = httpProxy.createProxyServer({});

  // 啟動 HTTP 伺服器
  const server = http.createServer((req, res) => {
    req.headers["Referer"] = "https://www.google.com";
    // 將請求轉發到原目標
    proxy.web(req, res, { target: pInfo.target, secure: false }, (e) => {
      console.error("Proxy error:", e);
      res.end("Something went wrong.");
    });
  });

  // 設定代理伺服器監聽某個端口
  server.listen(pInfo.port, () => {
    console.log("Proxy server listening on port " + pInfo.port);
  });
}
main();