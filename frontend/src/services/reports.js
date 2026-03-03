import { apiClient } from "./apiClient";

const BASE = "/reports";

/**
 * GET http://localhost:5000/api/v1/reports/team
 * تقرير الفريق (للمدير) – Team Reports
 * @param {Object} params - { from?, to? } (date range)
 * @returns {Promise<{ teamMembersCount?, activeEmployeesCount?, completedTasks?, overdueTasks?, attendanceCommitmentRate?, members?, activities?, attendance? }>}
 */
export async function getTeamReports(params = {}) {
  const res = await apiClient.get(`${BASE}/team`, { params });
  const data = res.data?.data ?? res.data;
  return data && typeof data === "object" ? data : {};
}
