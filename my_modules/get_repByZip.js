const findLocalRep = require('./find_localRep');
const lookUpRep = require('./get_repFromList');
const listOfReps = require('./list_repsFull');

function getRepByZip(zip) {
  // const listOfReps = JSON.parse(fs.readFileSync('./list_repsFull.json', {
  //   encoding: 'utf8'
  // }));
  return new Promise(function(resolve, reject) {
    const zip_num = parseInt(zip, 10);
    const zip_toQuery = ((typeof zip_num === 'number') && (zip_num.toString().length === 5)) ?  zip_num : reject('Zip code must be 5 numbers');
    findLocalRep(zip_toQuery)
      .then((res) => {
        const repObjects = res.map((rep) => {
          let repObj = lookUpRep(rep, listOfReps);
          return repObj;
        });

        if (repObjects.length > 0) {
          resolve(repObjects);
        } else {
          reject('No representatives returned');
        }
      })
      .catch((err) => reject(err));
  });
}

module.exports = getRepByZip;
