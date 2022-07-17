const fs = require('fs');
const pdfreader = require('pdfreader');
const https = require('https');

const download = (uri, filename) => {
  return new Promise((resolve, reject) =>
    https
      .request(uri, (res) => {
        res
          .pipe(fs.createWriteStream(filename))
          .on("close", resolve)
          .on("error", reject);
      })
      .end()
  );
};

class Shop {
  constructor(name, area, address, industry) {
    this.name = name;
    this.area = area;
    this.address = address;
    this.industry = industry;
  }
}

const shops = [];
const regexp = /(.+)(千代田区|中央区|港区|新宿区|文京区|台東区|墨田区|江東区|品川区|目黒区|大田区|世田谷区|渋谷区|中野区|杉並区|豊島区|北区|荒川区|板橋区|練馬区|足立区|葛飾区|江戸川区)(.+)(飲食店|ショッピング|サービス|エンターテインメント)/;

function printRows(rows) {
  Object.keys(rows)
    .sort((y1, y2) => parseFloat(y1) - parseFloat(y2))
    .forEach((y) => {
      // '赤坂飯店千代田区一ツ橋１－１－１パレスサイドビル飲食店'.match(/(.+)(千代田区)(.+)(飲食店|ショッピング)/)
      const rowStr = rows[y].join('');
      const matchResult = rowStr.match(regexp);
      if (matchResult == null) return;
      const [all, name, area, address, industry] = matchResult;
      shops.push(new Shop(name, area, address, industry));
    });
}

(async () => {

  const url = 'https://www.americanexpress.com/content/dam/amex/ja-jp/campaigns/shop-small/shop-list/pdf/';
  const pdfNames = [
    "tokyo-chiyoda.pdf",
    "tokyo-chuo.pdf",
    "tokyo-minato.pdf",
    "tokyo-shinjuku.pdf",
    "tokyo-bunkyo.pdf",
    "tokyo-taito.pdf",
    "tokyo-sumida.pdf",
    "tokyo-koto.pdf",
    "tokyo-shinagawa.pdf",
    "tokyo-meguro.pdf",
    "tokyo-ota.pdf",
    "tokyo-setagaya.pdf",
    "tokyo-shibuya.pdf",
    "tokyo-nakano.pdf",
    "tokyo-suginami.pdf",
    "tokyo-toshima.pdf",
    "tokyo-kita.pdf",
    "tokyo-arakawa.pdf",
    "tokyo-itabashi.pdf",
    "tokyo-nerima.pdf",
    "tokyo-adachi.pdf",
    "tokyo-katsushika.pdf",
    "tokyo-edogawa.pdf",
  ];
  const done = [];
  for (const pdfName of pdfNames) {
    // await download(url + pdfName, 'public/' + pdfName);
    let rows = {};
    let y;
    new pdfreader.PdfReader().parseFileItems(
      'public/' + pdfName,
      function (err, item) {
        if (!item || item.page) {
          printRows(rows);
          // clear rows for next page
          rows = {};
          y = null;
          if (item == null) {
            done.push(pdfName);
            if (pdfNames.length === done.length) {
              fs.writeFileSync('public/shops.json', JSON.stringify(shops, null, '\t'));
            }
          }
        } else if (item.text) {
          if (y == null) y = item.y;
          if (item.y - y > 0.4) y = item.y;
          (rows[y] = rows[y] || []).push(item.text.replace(/\r?\n/g, ''));
        }
      }
    );
  }

})()
