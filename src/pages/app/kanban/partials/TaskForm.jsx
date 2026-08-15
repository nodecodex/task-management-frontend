import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { Modal, ModalBody, Col, Spinner } from "reactstrap";
import { Icon, Button, RSelect } from "@/components/Component";
import { useForm } from "react-hook-form";
import { useTaskContext } from "@/layout/provider/TaskContext";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/utils/constants";
import { toast } from "react-toastify";
import { commentsApi } from "@/api/comments.api";

const TaskForm = ({ toggle, isOpen, edit, task, defaultStatus }) => {
  const {
    boardOptions,
    categoryOptions,
    tagOptions,
    userOptions,
    activeBoard,
    createTask,
    updateTask,
    deleteTask,
  } = useTaskContext();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(PRIORITY_OPTIONS[1]); // Medium default
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS[0]); // To Do default
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dueDate, setDueDate] = useState(null);

  // Comments for this task (if editing)
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Populate form data
  useEffect(() => {
    if (edit && task) {
      setValue("title", task.title || "");
      setValue("desc", task.desc || task.description || "");

      // Board
      const bOpt = boardOptions.find((b) => b.id === (task.boardId || task.board_id)) ||
        (activeBoard ? { value: activeBoard.id, label: activeBoard.title, id: activeBoard.id } : null);
      setSelectedBoard(bOpt);

      // Category
      const catId = task.meta?.categoryId || task.categoryId;
      const cOpt = categoryOptions.find((c) => c.id === catId) || null;
      setSelectedCategory(cOpt);

      // Priority
      const prioKey = task.meta?.priority?.raw || task.priority || "MEDIUM";
      const pOpt = PRIORITY_OPTIONS.find((p) => p.value === prioKey.toUpperCase()) || PRIORITY_OPTIONS[1];
      setSelectedPriority(pOpt);

      // Status
      const statKey = task.status || "TODO";
      const sOpt = STATUS_OPTIONS.find((s) => s.value === statKey.toUpperCase()) || STATUS_OPTIONS[0];
      setSelectedStatus(sOpt);

      // Tags
      const currentTags = (task.meta?.tags || []).map((t) => {
        const match = tagOptions.find((opt) => opt.id === t.id || opt.label === t.value);
        return match || { value: t.id || t.value, label: t.value, id: t.id };
      });
      setSelectedTags(currentTags);

      // Users / Assignees
      const currentUsers = (task.meta?.users || []).map((u) => {
        const match = userOptions.find((opt) => opt.id === u.id || opt.label === u.value);
        return match || { value: u.id || u.value, label: u.value, id: u.id };
      });
      setSelectedUsers(currentUsers);

      // Due Date
      if (task.meta?.dueDate || task.dueDate) {
        setDueDate(new Date(task.meta?.dueDate || task.dueDate));
      } else {
        setDueDate(null);
      }

      // Fetch comments if editing
      if (task.id) {
        commentsApi.getTaskComments(task.id)
          .then((res) => setComments(res?.data || []))
          .catch(() => setComments([]));
      }
    } else {
      reset({ title: "", desc: "", commentNote: "" });
      const defBoard = activeBoard
        ? { value: activeBoard.id, label: activeBoard.title, id: activeBoard.id }
        : (boardOptions[0] || null);
      setSelectedBoard(defBoard);
      setSelectedCategory(null);
      setSelectedPriority(PRIORITY_OPTIONS[1]);
      const initialStatus = defaultStatus
        ? (STATUS_OPTIONS.find((s) => s.value === defaultStatus) || STATUS_OPTIONS[0])
        : STATUS_OPTIONS[0];
      setSelectedStatus(initialStatus);
      setSelectedTags([]);
      setSelectedUsers([]);
      setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setComments([]);
      setNewCommentText("");
    }
  }, [edit, task, defaultStatus, isOpen, activeBoard, boardOptions, categoryOptions, tagOptions, userOptions, reset, setValue]);

  const handleAddComment = async () => {
    if (!task?.id || !newCommentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await commentsApi.addComment(task.id, { comment: newCommentText.trim() });
      if (res?.data) {
        setComments((prev) => [res.data, ...prev]);
        setNewCommentText("");
        toast.success("Comment added");
      }
    } catch (err) {
      toast.error(err.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Comment deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete comment");
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.desc?.trim() || "",
        board_id: selectedBoard?.id || selectedBoard?.value || activeBoard?.id,
        category_id: selectedCategory?.id || selectedCategory?.value || null,
        priority: selectedPriority?.value || "MEDIUM",
        status: selectedStatus?.value || "TODO",
        due_date: dueDate ? dueDate.toISOString() : null,
        assignee_ids: selectedUsers.map((u) => u.id || u.value).filter(Boolean),
        tag_ids: selectedTags.map((t) => t.id || t.value).filter(Boolean),
      };

      if (!payload.board_id) {
        toast.error("Please select a board");
        setLoading(false);
        return;
      }

      if (edit && task?.id) {
        await updateTask(task.id, payload);
        toast.success("Task updated successfully");
      } else {
        await createTask(payload);
        toast.success("Task created successfully");
      }
      toggle(false);
    } catch (err) {
      toast.error(err.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task?.id) return;
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    setDeleteLoading(true);
    try {
      await deleteTask(task.id);
      toast.success("Task deleted successfully");
      toggle(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete task");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Modal size="lg" isOpen={isOpen} toggle={() => toggle(false)}>
      <ModalBody>
        <a
          href="#cancel"
          className="close"
          onClick={(ev) => {
            ev.preventDefault();
            toggle(false);
          }}
        >
          <Icon name="cross-sm"></Icon>
        </a>
        <div className="p-2">
          <h5 className="title">{edit ? "Update" : "Add"} Task</h5>
          <div className="mt-4">
            <form className="row gy-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Task Title */}
              <Col sm="6">
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    {...register('title', { required: "Title is required" })}
                    placeholder="Enter task title"
                    className="form-control"
                  />
                  {errors.title && <span className="invalid">{errors.title.message}</span>}
                </div>
              </Col>

              {/* Select Board */}
              <Col sm="6">
                <div className="form-group">
                  <label className="form-label">Select Board</label>
                  <RSelect
                    value={selectedBoard}
                    options={boardOptions}
                    placeholder="Select a board"
                    onChange={(option) => setSelectedBoard(option)}
                  />
                </div>
              </Col>

              {/* Task Description */}
              <Col className="col-12">
                <div className="form-group">
                  <label className="form-label">Task Description</label>
                  <textarea
                    {...register('desc')}
                    rows={3}
                    placeholder="Enter task description"
                    className="form-control no-resize"
                  />
                </div>
              </Col>

              {/* Category */}
              <Col sm="6">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <RSelect
                    value={selectedCategory}
                    options={categoryOptions}
                    placeholder="Select a category"
                    isClearable
                    onChange={(option) => setSelectedCategory(option)}
                  />
                </div>
              </Col>

              {/* Status */}
              <Col sm="6">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <RSelect
                    value={selectedStatus}
                    options={STATUS_OPTIONS}
                    onChange={(option) => setSelectedStatus(option)}
                  />
                </div>
              </Col>

              {/* Due Date */}
              <Col sm="6">
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <div className="form-control-wrap">
                    <DatePicker
                      selected={dueDate}
                      onChange={(date) => setDueDate(date)}
                      className="form-control date-picker"
                      wrapperClassName="w-100"
                      dateFormat="dd MMM yyyy"
                      placeholderText="Select due date"
                      autoComplete="off"
                      popperPlacement="bottom-start"
                      popperClassName="task-datepicker-popper"
                    />
                  </div>
                </div>
              </Col>

              {/* Priority */}
              <Col sm="6">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <RSelect
                    value={selectedPriority}
                    options={PRIORITY_OPTIONS}
                    onChange={(option) => setSelectedPriority(option)}
                  />
                </div>
              </Col>

              {/* Task Tags */}
              <Col sm="6">
                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <RSelect
                    options={tagOptions}
                    isMulti
                    value={selectedTags}
                    placeholder="Select tags"
                    onChange={(options) => setSelectedTags(options || [])}
                  />
                </div>
              </Col>

              {/* Assignees */}
              <Col sm="6">
                <div className="form-group">
                  <label className="form-label">Assigned Users</label>
                  <RSelect
                    options={userOptions}
                    isMulti
                    value={selectedUsers}
                    placeholder="Assign users"
                    onChange={(options) => setSelectedUsers(options || [])}
                  />
                </div>
              </Col>

              {/* Comments Section (in Edit mode) */}
              {edit && task && (
                <Col className="col-12">
                  <div className="form-group">
                    <label className="form-label">Comments ({comments.length})</label>
                    <div className="d-flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        className="form-control"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddComment();
                          }
                        }}
                      />
                      <Button
                        color="primary"
                        type="button"
                        onClick={handleAddComment}
                        disabled={commentLoading || !newCommentText.trim()}
                      >
                        {commentLoading ? <Spinner size="sm" /> : "Post"}
                      </Button>
                    </div>

                    {comments.length > 0 && (
                      <div className="p-3 bg-light rounded" style={{ maxHeight: "180px", overflowY: "auto" }}>
                        {comments.map((c) => (
                          <div key={c.id} className="d-flex justify-content-between align-items-start border-bottom pb-2 mb-2">
                            <div>
                              <span className="fw-bold text-dark">{c.user?.name || "User"}</span>
                              <p className="mb-0 text-soft fs-7">{c.comment}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(c.id)}
                              className="btn btn-sm btn-icon text-danger p-0 ms-2"
                              title="Delete comment"
                            >
                              <Icon name="trash" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Col>
              )}

              {/* Form Buttons */}
              <Col className="col-12">
                <div className="d-flex justify-content-between mt-3">
                  <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                    <li>
                      <Button color="primary" size="md" type="submit" disabled={loading}>
                        {loading ? <Spinner size="sm" color="light" /> : `${edit ? "Update" : "Add"} Task`}
                      </Button>
                    </li>
                    <li>
                      <Button
                        onClick={(ev) => {
                          ev.preventDefault();
                          toggle(false);
                        }}
                        className="link link-light"
                      >
                        Cancel
                      </Button>
                    </li>
                  </ul>
                  {edit && (
                    <ul>
                      <li>
                        <Button
                          color="danger"
                          size="md"
                          type="button"
                          onClick={handleDeleteTask}
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? <Spinner size="sm" color="light" /> : "Delete Task"}
                        </Button>
                      </li>
                    </ul>
                  )}
                </div>
              </Col>
            </form>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default TaskForm;