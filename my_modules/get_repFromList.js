function lookUpRep(rep_name, listOfReps) {
  const rep_nameArr = rep_name.trim().split(' ');
  const rep_firstName = rep_nameArr[0];
  const rep_lastName = rep_nameArr[rep_nameArr.length - 1];

  const foundRep = listOfReps.filter((repObj) => {
    const repObj_fullName = repObj.firstName + ' ' + repObj.lastName;
    return (repObj.firstName.includes(rep_firstName) && (repObj.lastName === rep_lastName)) || (repObj_fullName === rep_name.trim());
  });
  return foundRep[0];
}

module.exports = lookUpRep;
