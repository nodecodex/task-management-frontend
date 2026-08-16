import React, { useState, useEffect } from "react";
import { Modal, ModalBody, DropdownToggle, DropdownMenu, UncontrolledDropdown, DropdownItem, Spinner } from "reactstrap";
import DatePicker from "react-datepicker";
import { Icon, UserAvatar, Button } from "@/components/Component";
import { useTaskContext } from "@/layout/provider/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/utils/constants";
import { findUpper, getDateStructured, canDeleteTask } from "@/utils/Utils";
import { toast } from "react-toastify";
import CommentSection from "./CommentSection";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { SectionLabel, FieldRow, DropdownTrigger, IconBtn } from "@/components/partials/TaskComponents/TaskComponents";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const STATUS_META = {
  TODO: { text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-500" },
  IN_PROGRESS: { text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  REVIEW: { text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  COMPLETED: { text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  BLOCKED: { text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
};
const getStatusMeta = (status) => STATUS_META[(status || "TODO").toUpperCase()] || STATUS_META.TODO;

const PRIORITY_META = {
  URGENT: { cls: "bg-rose-600 text-white" },
  HIGH: { cls: "bg-orange-500 text-white" },
  MEDIUM: { cls: "bg-amber-400 text-white" },
  LOW: { cls: "bg-slate-400 text-white" },
};
const getPriorityMeta = (p) => PRIORITY_META[(p || "MEDIUM").toUpperCase()] || PRIORITY_META.MEDIUM;
/* ─── Main Component ──────────────────────────────────────────────────────── */

const TaskDetailModal = ({ isOpen, toggle, task, onEditFull }) => {
  const { activeBoard, userOptions, categoryOptions, tagOptions, updateTask, deleteTask } = useTaskContext();
  const { user: currentUser } = useAuth();

  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [desc, setDesc] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [dueDate, setDueDate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDesc(task.desc || task.description || "");
      setDueDate(task.meta?.dueDate || task.dueDate ? new Date(task.meta?.dueDate || task.dueDate) : null);
      setIsEditingTitle(false);
      setIsEditingDesc(false);
      setShowAddSubtask(false);
    }
  }, [task]);

  const handleUpdateStatus = async (newStatus) => {
    if (!task?.id || task.status === newStatus) return;
    try { await updateTask(task.id, { status: newStatus }); toast.success("Status updated"); }
    catch (e) { toast.error(e.message || "Failed"); }
  };

  const handleUpdatePriority = async (newPriority) => {
    if (!task?.id) return;
    try { await updateTask(task.id, { priority: newPriority }); toast.success("Priority updated"); }
    catch (e) { toast.error(e.message || "Failed"); }
  };

  const handleUpdateDueDate = async (date) => {
    if (!task?.id) return;
    setDueDate(date);
    try { await updateTask(task.id, { due_date: date ? date.toISOString() : null }); toast.success("Due date updated"); }
    catch (e) { toast.error(e.message || "Failed"); }
  };

  const handleAssignToMe = async () => {
    if (!task?.id || !currentUser?.id) return;
    const ids = (task.meta?.users || []).map((u) => u.id || u.value).filter(Boolean);
    if (!ids.includes(currentUser.id)) {
      try { await updateTask(task.id, { assignee_ids: [...ids, currentUser.id] }); toast.success("Assigned to you"); }
      catch (e) { toast.error(e.message || "Failed"); }
    }
  };

  const handleToggleAssignee = async (userId) => {
    if (!task?.id) return;
    const ids = (task.meta?.users || []).map((u) => u.id || u.value).filter(Boolean);
    const updated = ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId];
    try { await updateTask(task.id, { assignee_ids: updated }); toast.success("Assignees updated"); }
    catch (e) { toast.error(e.message || "Failed"); }
  };

  const handleToggleTag = async (tagId) => {
    if (!task?.id) return;
    const ids = (task.meta?.tags || []).map((t) => t.id || t.value).filter(Boolean);
    const updated = ids.includes(tagId) ? ids.filter((id) => id !== tagId) : [...ids, tagId];
    try { await updateTask(task.id, { tag_ids: updated }); toast.success("Tags updated"); }
    catch (e) { toast.error(e.message || "Failed"); }
  };

  const handleUpdateCategory = async (categoryId) => {
    if (!task?.id) return;
    try { await updateTask(task.id, { category_id: categoryId || null }); toast.success("Category updated"); }
    catch (e) { toast.error(e.message || "Failed"); }
  };

  const handleSaveTitle = async () => {
    if (!task?.id || !title.trim()) return;
    setIsSaving(true);
    try { await updateTask(task.id, { title: title.trim() }); setIsEditingTitle(false); toast.success("Title updated"); }
    catch (e) { toast.error(e.message || "Failed"); }
    finally { setIsSaving(false); }
  };

  const handleSaveDesc = async () => {
    if (!task?.id) return;
    setIsSaving(true);
    try { await updateTask(task.id, { description: desc.trim() }); setIsEditingDesc(false); toast.success("Description updated"); }
    catch (e) { toast.error(e.message || "Failed"); }
    finally { setIsSaving(false); }
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    setSubtasks((prev) => [...prev, { id: Date.now(), title: newSubtaskText.trim(), completed: false }]);
    setNewSubtaskText("");
    setShowAddSubtask(false);
  };

  const handleToggleSubtask = (id) =>
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));



  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteTask = async () => {
    if (!task?.id) return;
    if (!canDeleteTask(currentUser, task)) {
      toast.error("You can only delete tasks created by you");
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteTask(task.id);
      toast.success("Task deleted successfully");
      setConfirmDelete(false);
      toggle(false);
    } catch (e) {
      toast.error(e.message || "Failed to delete task");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!task) return null;

  const currentPriority = PRIORITY_OPTIONS.find(
    (p) => p.value === (task.meta?.priority?.raw || task.priority || "MEDIUM").toUpperCase()
  ) || PRIORITY_OPTIONS[1];
  const currentStatus = STATUS_OPTIONS.find(
    (s) => s.value === (task.status || "TODO").toUpperCase()
  ) || STATUS_OPTIONS[0];
  const currentCategory = categoryOptions.find((c) => c.id === (task.meta?.categoryId || task.categoryId));
  const sMeta = getStatusMeta(currentStatus.value);
  const pMeta = getPriorityMeta(currentPriority.value);
  const taskKey = task.id ? "TASK-" + task.id.slice(0, 6).toUpperCase() : "TASK";

  return (
    <>
      <Modal
      size="xl"
      isOpen={isOpen}
      toggle={() => toggle(false)}
      className="task-detail-modal-custom"
      contentClassName="task-detail-modal-content border-0 overflow-hidden shadow-2xl bg-white dark:bg-[#141d2b] text-slate-800 dark:text-slate-100"
    >
      <ModalBody className="p-0">
        {/* ── Header Bar ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#111823]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium min-w-0">
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
              <Icon name="check-square" />
              <span className="truncate max-w-[120px]">{activeBoard?.title || "Board"}</span>
            </span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-mono font-bold">
              {taskKey}
            </code>
            {currentCategory && (
              <>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="truncate max-w-[100px] text-slate-600 dark:text-slate-300">{currentCategory.name}</span>
              </>
            )}
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <IconBtn title="Copy link" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}>
              <Icon name="share" />
            </IconBtn>
            <UncontrolledDropdown>
              <DropdownToggle tag="span">
                <IconBtn title="More options">
                  <Icon name="more-h" />
                </IconBtn>
              </DropdownToggle>
              <DropdownMenu end className="py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl min-w-[160px]">
                {onEditFull && (
                  <DropdownItem tag="a" href="#edit"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={(e) => { e.preventDefault(); toggle(false); onEditFull(task); }}>
                    <Icon name="edit" className="text-indigo-500" /> Edit Full Form
                  </DropdownItem>
                )}
                {canDeleteTask(currentUser, task) && (
                  <DropdownItem tag="a" href="#delete"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    onClick={(e) => { e.preventDefault(); setConfirmDelete(true); }}>
                    <Icon name="trash" className="text-rose-500" /> Delete Task
                  </DropdownItem>
                )}
              </DropdownMenu>
            </UncontrolledDropdown>
            <IconBtn title="Close" onClick={() => toggle(false)}>
              <Icon name="cross" />
            </IconBtn>
          </div>
        </div>

        {/* ── Two-Pane Body ── */}
        <div className="flex flex-col lg:flex-row max-h-[85vh] lg:min-h-[520px] overflow-y-auto lg:overflow-y-visible">

          {/* ── Left Main Panel ── */}
          <div className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-5 space-y-5" style={{ minHeight: 0 }}>

            {/* Title */}
            <div>
              {isEditingTitle ? (
                <div className="flex items-start gap-2">
                  <input type="text" autoFocus
                    className="flex-1 text-lg font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-indigo-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") setIsEditingTitle(false); }}
                  />
                  <Button
                    color="primary"
                    size="sm"
                    className="shrink-0 inline-flex items-center justify-center w-8 h-8 p-0"
                    onClick={handleSaveTitle}
                    disabled={isSaving}
                    title="Save"
                  >
                    {isSaving ? <Spinner size="sm" /> : <Icon name="check" />}
                  </Button>
                  <Button
                    color="light"
                    size="sm"
                    className="shrink-0 inline-flex items-center justify-center w-8 h-8 p-0"
                    onClick={() => setIsEditingTitle(false)}
                    title="Cancel"
                  >
                    <Icon name="cross" />
                  </Button>
                </div>
              ) : (
                <h2 className="text-xl font-bold text-slate-900 dark:text-white cursor-pointer group flex items-start justify-between gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  onClick={() => setIsEditingTitle(true)} title="Click to edit title">
                  <span className="leading-snug">{task.title}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500 transition-opacity shrink-0 mt-0.5">
                    <Icon name="edit-alt" />
                  </span>
                </h2>
              )}
            </div>

            {/* Description */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-1.5">
                <SectionLabel>Description</SectionLabel>
                {!isEditingDesc && (
                  <Button color="light" outline size="sm" onClick={() => setIsEditingDesc(true)}
                    className="py-1 px-2 text-[11px] font-semibold">
                    {task.desc || task.description ? "Edit" : "Add"}
                  </Button>
                )}
              </div>
              {isEditingDesc ? (
                <div className="space-y-2">
                  <textarea autoFocus rows={4}
                    className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-indigo-500 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Add a detailed description..."
                  />
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleSaveDesc} disabled={isSaving}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50">
                      {isSaving ? <Spinner size="sm" /> : "Save"}
                    </Button>
                    <Button type="button" onClick={() => setIsEditingDesc(false)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div onClick={() => setIsEditingDesc(true)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition-colors">
                  {task.desc || task.description ? (
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mb-0">
                      {task.desc || task.description}
                    </p>
                  ) : (
                    <span className="text-sm text-slate-400 dark:text-slate-500 italic">Click to add a description...</span>
                  )}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <SectionLabel>
                  {"Checklist" + (subtasks.length > 0 ? " (" + subtasks.filter((s) => s.completed).length + "/" + subtasks.length + ")" : "")}
                </SectionLabel>
                <Button type="button" onClick={() => setShowAddSubtask(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Icon name="plus" /> Add item
                </Button>
              </div>
              {subtasks.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mb-3">
                    <div className="h-1 bg-indigo-500 rounded-full transition-all"
                      style={{ width: (subtasks.filter((s) => s.completed).length / subtasks.length * 100) + "%" }} />
                  </div>
                  {subtasks.map((st) => (
                    <div key={st.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 group">
                      <label className="flex items-center gap-2.5 text-sm cursor-pointer mb-0 flex-1 min-w-0">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                          checked={st.completed} onChange={() => handleToggleSubtask(st.id)} />
                        <span className={"truncate " + (st.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200")}>
                          {st.title}
                        </span>
                      </label>
                      <Button type="button" onClick={() => setSubtasks((prev) => prev.filter((s) => s.id !== st.id))}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all ml-2 shrink-0">
                        <Icon name="cross" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {showAddSubtask && (
                <form onSubmit={handleAddSubtask} className="flex gap-2 mt-2">
                  <input type="text" autoFocus
                    className="flex-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Checklist item..."
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                  />
                  <Button type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
                    Add
                  </Button>
                  <Button type="button" onClick={() => setShowAddSubtask(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition">
                    Cancel
                  </Button>
                </form>
              )}
            </div>

            {/* ── Comments Section (reusable component) ── */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60">
              <CommentSection taskId={task.id} />
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 overflow-y-auto border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700/60 bg-slate-50/60 dark:bg-[#111822] p-5 space-y-5" style={{ minHeight: 0 }}>

            {/* Status */}
            <FieldRow label="Status">
              <UncontrolledDropdown>
                <DropdownToggle tag="div">
                  <DropdownTrigger>
                    <span className={"inline-flex items-center gap-1.5 text-xs font-bold " + sMeta.text}>
                      <span className={"w-2 h-2 rounded-full " + sMeta.dot} />
                      {currentStatus.label}
                    </span>
                    <Icon name="chevron-down" className="text-slate-400 text-xs" />
                  </DropdownTrigger>
                </DropdownToggle>
                <DropdownMenu className="w-full py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
                  {STATUS_OPTIONS.map((st) => {
                    const m = getStatusMeta(st.value);
                    const isActive = currentStatus.value === st.value;
                    return (
                      <DropdownItem key={st.value} tag="a" href="#status"
                        className={"flex items-center justify-between px-3.5 py-2 text-xs font-semibold " + (isActive ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400" : m.text + " hover:bg-slate-50 dark:hover:bg-slate-800")}
                        onClick={(e) => { e.preventDefault(); handleUpdateStatus(st.value); }}>
                        <span className="flex items-center gap-2">
                          <span className={"w-2 h-2 rounded-full " + m.dot} />
                          {st.label}
                        </span>
                        {isActive && <Icon name="check" className="text-xs" />}
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </UncontrolledDropdown>
            </FieldRow>

            {/* Priority */}
            <FieldRow label="Priority">
              <UncontrolledDropdown>
                <DropdownToggle tag="div">
                  <DropdownTrigger>
                    <span className={"px-2.5 py-0.5 rounded-md text-[11px] font-bold " + pMeta.cls}>
                      {currentPriority.label}
                    </span>
                    <Icon name="chevron-down" className="text-slate-400 text-xs" />
                  </DropdownTrigger>
                </DropdownToggle>
                <DropdownMenu end className="w-40 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
                  {PRIORITY_OPTIONS.map((p) => {
                    const m = getPriorityMeta(p.value);
                    return (
                      <DropdownItem key={p.value} tag="a" href="#priority"
                        className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={(e) => { e.preventDefault(); handleUpdatePriority(p.value); }}>
                        <span className={"px-2 py-0.5 rounded text-[10px] font-bold " + m.cls}>{p.label}</span>
                        {currentPriority.value === p.value && <Icon name="check" className="text-indigo-600 dark:text-indigo-400 text-xs" />}
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </UncontrolledDropdown>
            </FieldRow>

            {/* Due Date */}
            <FieldRow label="Due Date">
              <DatePicker
                selected={dueDate}
                onChange={handleUpdateDueDate}
                className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                wrapperClassName="w-full"
                dateFormat="dd MMM yyyy"
                placeholderText="Set due date"
                popperPlacement="bottom-start"
                popperClassName="task-datepicker-popper"
              />
            </FieldRow>

            <div className="border-t border-slate-200 dark:border-slate-700/60 pt-4 space-y-4">

              {/* Assignee */}
              <FieldRow label="Assignee">
                <UncontrolledDropdown>
                  <DropdownToggle tag="div">
                    <DropdownTrigger>
                      <div className="flex items-center gap-2 min-w-0">
                        {(task.meta?.users || []).length > 0 ? (
                          <>
                            <div className="flex -space-x-1.5">
                              {task.meta.users.slice(0, 3).map((u, i) => (
                                <UserAvatar key={i} className="xs border-2 border-white dark:border-slate-800" theme={u.theme} text={findUpper(u.value) || "U"} />
                              ))}
                            </div>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                              {task.meta.users.map((u) => u.value).join(", ")}
                            </span>
                          </>
                        ) : (
                          <>
                            <Icon name="user" className="text-slate-400 text-sm" />
                            <span className="text-xs text-slate-400 dark:text-slate-500">Unassigned</span>
                          </>
                        )}
                      </div>
                      <Icon name="chevron-down" className="text-slate-400 text-xs shrink-0" />
                    </DropdownTrigger>
                  </DropdownToggle>
                  <DropdownMenu end className="w-56 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl max-h-52 overflow-y-auto">
                    <div className="px-3 pb-1.5 pt-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <Button type="button" onClick={handleAssignToMe}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Assign to me
                      </Button>
                    </div>
                    {userOptions.map((u) => {
                      const isAssigned = (task.meta?.users || []).some((a) => (a.id || a.value) === u.id);
                      return (
                        <DropdownItem key={u.id || u.value} tag="a" href="#user"
                          className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                          onClick={(e) => { e.preventDefault(); handleToggleAssignee(u.id); }}>
                          <div className="flex items-center gap-2">
                            <UserAvatar className="xs" theme={u.theme} text={findUpper(u.name)} />
                            <span className="text-slate-800 dark:text-slate-200 font-medium">{u.name}</span>
                          </div>
                          {isAssigned && <Icon name="check" className="text-indigo-500 dark:text-indigo-400 text-xs" />}
                        </DropdownItem>
                      );
                    })}
                  </DropdownMenu>
                </UncontrolledDropdown>
              </FieldRow>

              {/* Category */}
              <FieldRow label="Category">
                <UncontrolledDropdown>
                  <DropdownToggle tag="div">
                    <DropdownTrigger>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {currentCategory ? currentCategory.name : <span className="text-slate-400 dark:text-slate-500 font-normal">None</span>}
                      </span>
                      <Icon name="chevron-down" className="text-slate-400 text-xs shrink-0" />
                    </DropdownTrigger>
                  </DropdownToggle>
                  <DropdownMenu end className="w-44 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
                    <DropdownItem tag="a" href="#cat"
                      className="px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={(e) => { e.preventDefault(); handleUpdateCategory(null); }}>
                      None
                    </DropdownItem>
                    {categoryOptions.map((c) => (
                      <DropdownItem key={c.id} tag="a" href="#cat"
                        className="flex items-center justify-between px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={(e) => { e.preventDefault(); handleUpdateCategory(c.id); }}>
                        <span>{c.name}</span>
                        {currentCategory?.id === c.id && <Icon name="check" className="text-indigo-500 dark:text-indigo-400 text-xs" />}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </UncontrolledDropdown>
              </FieldRow>

              {/* Labels / Tags */}
              <FieldRow label="Labels">
                <UncontrolledDropdown>
                  <DropdownToggle tag="div">
                    <DropdownTrigger>
                      <div className="flex flex-wrap gap-1 min-w-0">
                        {(task.meta?.tags || []).length > 0 ? (
                          task.meta.tags.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              {t.value}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">None</span>
                        )}
                      </div>
                      <Icon name="chevron-down" className="text-slate-400 text-xs shrink-0 ml-1" />
                    </DropdownTrigger>
                  </DropdownToggle>
                  <DropdownMenu end className="w-44 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl max-h-48 overflow-y-auto">
                    {tagOptions.map((t) => {
                      const isSelected = (task.meta?.tags || []).some((tag) => (tag.id || tag.value) === t.id);
                      return (
                        <DropdownItem key={t.id || t.value} tag="a" href="#tag"
                          className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                          onClick={(e) => { e.preventDefault(); handleToggleTag(t.id); }}>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                            {t.name}
                          </span>
                          {isSelected && <Icon name="check" className="text-indigo-500 dark:text-indigo-400 text-xs" />}
                        </DropdownItem>
                      );
                    })}
                  </DropdownMenu>
                </UncontrolledDropdown>
              </FieldRow>
            </div>

            {/* Metadata Footer */}
            <div className="border-t border-slate-200 dark:border-slate-700/60 pt-3 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500">Created</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {task.raw?.createdAt ? getDateStructured(new Date(task.raw.createdAt)) : "Recently"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500">Reporter</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {task.raw?.createdBy?.name || "System"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>

    <DeleteConfirmationModal
      isOpen={confirmDelete}
      toggle={setConfirmDelete}
      onConfirm={handleDeleteTask}
      taskTitle={task.title}
      loading={deleteLoading}
    />
    </>
  );
};

export default TaskDetailModal;
