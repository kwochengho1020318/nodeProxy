const https = require('https');

const httpProxy = require("http-proxy");
var fs = require("fs");

async function getConfig() {
  return new Promise((resolve, reject) => {
    fs.readFile("./data.json", (err, data) => {
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
  const options = {
    key: fs.readFileSync('./privatekey.key'),  // 替換為你的 .key 文件路徑
    cert: fs.readFileSync('./certificate.crt'),  // 替換為你的 .crt 文件路徑

  };
  // 啟動 HTTP 伺服器
  const server = https.createServer(options,(req, res) => {
    req.headers["Referer"] = "https://www.google.com";
    // 將請求轉發到原目標
    proxy.web(req, res, { target: pInfo.target, secure: false }, (e) => {
      console.error("Proxy error:", e);
      res.end("Something went wrong.");
    });
  },);
  
  // 設定代理伺服器監聽某個端口
  server.listen(pInfo.port, () => {
    console.log("Proxy server listening on port " + pInfo.port);
  });
}
main();