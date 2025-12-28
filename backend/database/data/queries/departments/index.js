const createDepartment = `
  INSERT INTO departments (name, description, status)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

const getDepartments = `
  SELECT d.*, COUNT(e.id) AS employee_count 
  FROM departments d
  LEFT JOIN employees e ON d.id = e.department_id
  GROUP BY d.id
  ORDER BY d.name;
`;

const getDepartmentById = `
  SELECT d.*, COUNT(e.id) AS employee_count 
  FROM departments d
  LEFT JOIN employees e ON d.id = e.department_id
  WHERE d.id = $1
  GROUP BY d.id;
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

const bulkDeleteDepartments = `
  DELETE FROM departments WHERE id = ANY($1) RETURNING *;
`;

const bulkMarkAsReviewed = `
  UPDATE departments SET is_reviewed = TRUE WHERE id = ANY($1) RETURNING *;
`;

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  bulkDeleteDepartments,
  bulkMarkAsReviewed
};
