const deleteLocationActivityQuery = `
  DELETE FROM activities
  WHERE id = $1;
`;

module.exports = deleteLocationActivityQuery;

