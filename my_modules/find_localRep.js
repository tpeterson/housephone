const http = require('http');
const querystring = require('querystring');
const cheerio = require('cheerio');

function findLocalRep(zip_code) {
  return new Promise(function(resolve, reject) {
    const postData = querystring.stringify({
      'ZIP' : zip_code
    });

    const options = {
      hostname: 'ziplook.house.gov',
      port: 80,
      path: '/htbin/findrep',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      if (res.statusCode !== 200) {
        console.log(`Problem caught in findLocalRep response: ${res.statusCode}`);
        reject('Sorry, I\'m unable to look up representatives by zip code right now.');
      }

      let data = new Buffer(0);

      res.on('data', function(chunk) {
        data += chunk;
      });
      res.on('end', () => {
        const representatives = parseHTML(data);
        resolve(representatives);
      });
    });

    req.on('error', (e) => {
      console.log(`Problem caught in findLocalRep request: ${e.message}`)
      reject('Sorry, I\'m unable to look up representatives by zip code right now.');
    });

    req.write(postData);
    req.end();
  });
}

function parseHTML(html) {
  const $ = cheerio.load(html);
  const rep_boxes = $('div#PossibleReps').children();
  const rep_names = Array.from(rep_boxes).map((rep_el) => {
    return $(rep_el).children().children('a').text();
  });
  return rep_names;
}

module.exports = findLocalRep;
