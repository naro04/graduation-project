const createDepartment = `
  INSERT INTO departments (name, description, status)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

const getDepartments = `
  SELECT * FROM departments ORDER BY name;
`;

const getDepartmentById = `
  SELECT * FROM departments WHERE id = $1;
`;

const updateDepartment = `
  UPDATE departments
  SET name = $1, description = $2, status = $3, updated_at = NOW()
  WHERE id = $4
  RETURNING *;
`;

const deleteDepartment = `
  DELETE FROM departments WHERE id = $1 RETURNING *;
`;

module.exports = {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
};
