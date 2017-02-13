function lookUpRep(rep_name, listOfReps) {
  const foundRep = listOfReps.filter((repObj) => {
    const repObj_fullName = repObj.firstName + ' ' + repObj.lastName;
    return repObj_fullName === rep_name.trim();
  });
  return foundRep[0];
}

module.exports = lookUpRep;
