import React, { useState, useEffect } from "react";
import { getLocationActivities } from "../services/locationActivities";

/**
 * Second form for Manager: choose an activity from the list.
 * On "Assign team to this activity" the parent opens the employee-selection flow with this activity pre-selected.
 */
const ManagerChooseActivityModal = ({ isOpen, onClose, onSelectActivity }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSelectedActivityId("");
    setLoading(true);
    getLocationActivities()
      .then((list) => {
        const arr = Array.isArray(list) ? list : list?.activities ?? [];
        setActivities(arr);
        if (arr.length) setSelectedActivityId(arr[0].id);
      })
      .catch((err) => setError(err?.message || "Failed to load activities"))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleAssignTeam = () => {
    if (!selectedActivityId) return;
    onSelectActivity?.(selectedActivityId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-[10px] shadow-lg w-full max-w-[480px] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-[#E0E0E0]">
          <h2 className="text-[18px] font-semibold text-[#004D40]" style={{ fontFamily: "Inter, sans-serif" }}>
            Choose activity
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F5F7FA] text-[#6B7280]"
            aria-label="Close"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          {loading ? (
            <p className="text-[14px] text-[#6B7280] py-4">Loading activities...</p>
          ) : (
            <>
              <p className="text-[14px] text-[#6B7280] mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                Select an activity, then assign your team to it.
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
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E0E0E0] bg-[#F9FAFB]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] font-medium text-[#333333] hover:bg-[#F5F7FA]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssignTeam}
            disabled={!selectedActivityId || loading}
            className="px-5 py-2 rounded-[8px] bg-[#027066] text-white text-[14px] font-semibold hover:bg-[#004D40] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Assign team to this activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerChooseActivityModal;
