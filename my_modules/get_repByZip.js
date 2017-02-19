const findLocalRep = require('./find_localRep');
const lookUpRep = require('./get_repFromList');
const listOfReps = require('./list_repsFull');

function getRepByZip(zip) {
  return new Promise(function(resolve, reject) {
    const zip_num = parseInt(zip, 10);
    const zip_toQuery = ((typeof zip_num === 'number') && (zip.length === 5)) ?  zip : reject('Please enter a 5-digit zip code.');
    findLocalRep(zip_toQuery)
      .then((res) => {
        const repObjects = res.map((rep) => {
          let repObj = lookUpRep(rep, listOfReps);
          return repObj;
        });

        if (repObjects.includes(undefined)) {
          console.log(`Zip code ${zip} returns an undefined representative.`);
        }

        if (repObjects.length > 0) {
          resolve(repObjects);
        } else {
          reject('I couldn\'t find any representatives for that zip code.');
        }
      })
      .catch((err) => {
        console.log(`Problem caught in findLocalRep: ${err}`);
        reject(err);
      });
  });
}

module.exports = getRepByZip;
