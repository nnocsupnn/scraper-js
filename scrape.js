const settings = require("./connection.js");
const puppeteer = require("puppeteer");
const con = require("mysql").createConnection(settings);
const fs = require("fs");
const Parser = require("./components/Parser");

const path = `${process.cwd()}/crawled/`;
con.connect((err) => {
  if (err) {
    console.log("Error connecting to database.");
    process.exit(0);
  }
  console.log("Connected to database..");
});

let parser = new Parser(con);
let sql = `SELECT fs.eventFK, e.name, fs.flashscore_link
FROM event e
LEFT JOIN flashscore_source fs ON fs.eventFK = e.id
WHERE e.id IN (1405703);`;

/**
 * @param {*} err
 * @param {*} result
 */
con.query(sql, (err, result) => {
  var isScraping = true;
  for (let i in result) {
    if (result.length - 1 == i && isScraping == false) process.exit(0);

    let url = result[i].flashscore_link;
    let filename = result[i].eventFK;

    let _path = `${path}html/${filename}.html`;
    fs.exists(_path, (boolExists) => {
      if (boolExists == false) {
        console.log("not exists");
        scrape(url, filename)
          .then((_path) => {
            // parser.match_details(_path, filename).then((isParsing) => {
            // 	if (isParsing == false) {
            // 		isScraping = false;
            // 		process.exit(0)
            // 	}
            // }).catch(err => console.log(err))
          })
          .catch((err) => console.log(err));
      } else {
        console.log("exists");
        scrape(url, filename)
          .then((_path) => {
            // parser.match_details(_path, filename).then((isParsing) => {
            // 	if (isParsing == false) {
            // 		isScraping = false;
            // 		process.exit(0)
            // 	}
            // }).catch(err => console.log(err))
          })
          .catch((err) => console.log(err));
        // parser.match_details(_path, filename).then((isParsing) => {
        // 	if (isParsing == false) {
        // 		isScraping = false;
        // 		process.exit(0)
        // 	}
        // }).catch(err => console.log(err))
      }
    });
  }
  // result.map(match => {
  // 	console.log(`Event: ${match.name}`);
  // 	let url = match.flashscore_link;
  // 	let filename = match.eventFK;

  // 	var _file = `./crawled/html/${filename}.html`
  // 	fs.exists(_file, (boolExists) => {
  // 		if (boolExists == false) {
  // 			console.log('not exists');
  // 			scrape(url, filename).then((_path) => {
  // 				parser.match_details(_path, match.eventFK).then((isParsing) => {
  // 					if (isParsing == false) {
  // 						process.exit(0)
  // 					}
  // 				}).catch(err => console.log(err))
  // 			}).catch(err => console.log(err));
  // 		} else {
  // 			console.log('exists');
  // 			parser.match_details(_file, match.eventFK).then((isParsing) => {
  // 				if (isParsing == false) {
  // 					process.exit(0)
  // 				}
  // 			}).catch(err => console.log(err))
  // 		}
  // 	})
  // })
});
/**
 * End Query
 *
 */

parseMatch = (_file, eventFK) => {
  return new Promise((resolve, reject) => {
    parser
      .match_details(_file, match.eventFK)
      .then((isParsing) => {
        if (isParsing == false) {
          process.exit(0);
        }
      })
      .catch((err) => reject(err));
  });
};

// Start scraping using puppeteer
/**
 *
 * @param {*} url
 * @param {*} filename
 */
const scrape = async (url, filename) => {
  console.log("scraping...");
  const browser = await puppeteer.launch({
    headless: true
  });

  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "load"
  });
  // Take screenshot to check if its loaded all the contents
  await page.screenshot({
    path: `${path}/screenshots/${filename}.png`
  });

  // Pass the content to a variable
  let html = await page.content();

  // Close after scrape
  await browser.close();

  return new Promise((resolve, reject) => {
    resolve(`${path}html/${filename}.txt`);
    fs.open(`${path}/html/${filename}.txt`, "w", (err, file) => {
      if (err) console.log(err);
      fs.writeFile(file, html, (err) => {
        if (err) reject(err);
        resolve(`${path}html/${filename}.txt`);
      });
    });
  });
};
/**
 * End Scraping
 */
