function lookUpRep(rep_name, listOfReps) {
  const foundRep = listOfReps.filter((repObj) => {
    const searchRep = rep_name.trim();
    const listRep = repObj.firstName + ' ' + repObj.lastName;

    return checkIfNamesMatch(searchRep, listRep);
  });
  return foundRep[0];
}

function checkIfNamesMatch(nameOne, nameTwo) {
  let name1 = nameOne.split(' ');
  let name2 = nameTwo.split(' ');

  if (name1.length === name2.length) {
    return name1.join(' ') === name2.join(' ');
  } else if (name1.length > name2.length) {
    return name2.every((word) => {
      return name1.includes(word);
    });
  } else if (name2.length > name1.length) {
    return name1.every((word) => {
      return name2.includes(word);
    });
  }
}

module.exports = lookUpRep;
