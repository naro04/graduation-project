import React, { useState, useMemo } from "react";
import { getLocationActivities, assignTeamToActivity } from "../services/locationActivities";

const STEP_SELECT_EMPLOYEES = 1;
const STEP_SELECT_ACTIVITY = 2;

/**
 * Two-step modal for Manager: (1) Select team members, (2) Select activity and assign.
 * Used on Team Activities page; only team members are shown in step 1.
 */
const ManagerAssignActivityModal = ({ isOpen, onClose, teamMembers = [], onSuccess, preselectedActivityId = null }) => {
  const [step, setStep] = useState(STEP_SELECT_EMPLOYEES);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);

  const teamList = useMemo(() => (Array.isArray(teamMembers) ? teamMembers : []), [teamMembers]);

  const toggleEmployee = (id) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const selectAllEmployees = () => {
    if (selectedEmployeeIds.length === teamList.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(teamList.map((m) => m.id));
    }
  };

  const goToStep2 = () => {
    setError(null);
    setActivities([]);
    setLoadingActivities(true);
    getLocationActivities()
      .then((list) => {
        const arr = Array.isArray(list) ? list : list?.activities ?? [];
        setActivities(arr);
        const id = preselectedActivityId && arr.some((a) => a.id === preselectedActivityId) ? preselectedActivityId : (arr.length ? arr[0].id : "");
        setSelectedActivityId(id);
        setStep(STEP_SELECT_ACTIVITY);
      })
      .catch((err) =>
        setError(err?.response?.data?.message || err?.message || "Failed to load activities")
      )
      .finally(() => setLoadingActivities(false));
  };

  const handleAssign = async () => {
    if (!selectedActivityId || selectedEmployeeIds.length === 0) return;
    setError(null);
    setAssigning(true);
    try {
      await assignTeamToActivity(selectedActivityId, {
        employee_ids: selectedEmployeeIds,
      });
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to assign");
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setStep(STEP_SELECT_EMPLOYEES);
    setSelectedEmployeeIds([]);
    setSelectedActivityId("");
    setActivities([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-[10px] shadow-lg w-full max-w-[480px] max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-[#E0E0E0]">
          <h2 className="text-[18px] font-semibold text-[#004D40]" style={{ fontFamily: "Inter, sans-serif" }}>
            {step === STEP_SELECT_EMPLOYEES ? "Select your employees" : "Select activity"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F5F7FA] text-[#6B7280]"
            aria-label="Close"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === STEP_SELECT_EMPLOYEES && (
            <>
              <p className="text-[14px] text-[#6B7280] mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                Choose team members to assign to an activity.
              </p>
              {teamList.length === 0 ? (
                <p className="text-[14px] text-[#6B7280] py-4">No team members found.</p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[14px] font-medium text-[#374151]">Assign Employee</label>
                    <button
                      type="button"
                      onClick={selectAllEmployees}
                      className="text-[12px] text-[#027066] hover:underline"
                    >
                      {selectedEmployeeIds.length === teamList.length ? "Deselect all" : "Select all"}
                    </button>
                  </div>
                  <div className="border border-[#E0E0E0] rounded-[10px] overflow-hidden max-h-[240px] overflow-y-auto">
                    {teamList.map((m) => {
                      const name = m.full_name || [m.first_name, m.last_name].filter(Boolean).join(" ") || "—";
                      const sub = [m.department_name, m.position_title].filter(Boolean).join(" • ") || "";
                      const checked = selectedEmployeeIds.includes(m.id);
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#E0E0E0] last:border-b-0 hover:bg-[#F9FAFB] ${checked ? "bg-[#E9F6F8B2]" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleEmployee(m.id)}
                            className="w-4 h-4 rounded border-[#E0E0E0] text-[#027066]"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[14px] font-medium text-[#333333]">{name}</span>
                            {sub && <p className="text-[12px] text-[#6B7280] truncate">{sub}</p>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-[12px] text-[#6B7280] mt-2">
                    {selectedEmployeeIds.length} employee(s) selected
                  </p>
                </>
              )}
            </>
          )}

          {step === STEP_SELECT_ACTIVITY && (
            <>
              {loadingActivities ? (
                <p className="text-[14px] text-[#6B7280] py-4">Loading activities...</p>
              ) : (
                <>
                  <p className="text-[14px] text-[#6B7280] mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                    Choose an activity to assign the selected employees to.
                  </p>
                  <label className="block text-[14px] font-medium text-[#374151] mb-2">Activity</label>
                  <select
                    value={selectedActivityId}
                    onChange={(e) => setSelectedActivityId(e.target.value)}
                    className="w-full h-[44px] px-4 rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] text-[#333333] focus:outline-none focus:border-[#004D40]"
                  >
                    <option value="">Select activity</option>
                    {activities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name || "Unnamed"} {a.location ? ` • ${a.location}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-[12px] text-[#6B7280] mt-2">
                    Assigning {selectedEmployeeIds.length} employee(s) to this activity.
                  </p>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E0E0E0] bg-[#F9FAFB]">
          {step === STEP_SELECT_ACTIVITY && (
            <button
              type="button"
              onClick={() => { setError(null); setStep(STEP_SELECT_EMPLOYEES); }}
              className="px-4 py-2 rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] font-medium text-[#333333] hover:bg-[#F5F7FA]"
            >
              Back
            </button>
          )}
          {step === STEP_SELECT_EMPLOYEES ? (
            <button
              type="button"
              onClick={goToStep2}
              disabled={selectedEmployeeIds.length === 0 || teamList.length === 0}
              className="px-5 py-2 rounded-[8px] bg-[#027066] text-white text-[14px] font-semibold hover:bg-[#004D40] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAssign}
              disabled={!selectedActivityId || assigning || loadingActivities}
              className="px-5 py-2 rounded-[8px] bg-[#027066] text-white text-[14px] font-semibold hover:bg-[#004D40] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assigning ? "Assigning…" : "Assign"}
            </button>
          )}
          {step === STEP_SELECT_EMPLOYEES && (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] font-medium text-[#333333] hover:bg-[#F5F7FA]"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerAssignActivityModal;
