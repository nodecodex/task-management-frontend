import React, { useState, useEffect } from "react";
import { Badge, Spinner, Card } from "reactstrap";
import { Icon, UserAvatar, Button, PaginationComponent } from "@/components/Component";
import { useTaskContext } from "@/layout/provider/TaskContext";
import { tasksApi } from "@/api/tasks.api";
import { normalizeTask } from "@/utils/normalize";
import { findUpper } from "@/utils/Utils";

const TaskList = ({ setSelectedTask, setDetailModal }) => {
  const { activeBoard, searchQuery, filters } = useTaskContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      if (!activeBoard?.id) return;
      setLoading(true);
      try {
        const params = {
          limit,
          page,
          board_id: activeBoard.id,
          ...(searchQuery ? { search: searchQuery } : {}),
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.priority ? { priority: filters.priority } : {}),
          ...(filters.assignee ? { assignee: filters.assignee } : {}),
          ...(filters.categoryId ? { category_id: filters.categoryId } : {}),
        };

        const response = await tasksApi.getTasks(params);
        if (isMounted) {
          const rawTasks = response?.data?.tasks || response?.data || [];
          const meta = response?.data?.meta || response?.meta || {};
          setTasks(rawTasks.map(normalizeTask));
          setTotal(meta.total || rawTasks.length);
        }
      } catch (error) {
        console.error("Failed to fetch tasks for list view", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, [activeBoard, searchQuery, filters, page, limit]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [activeBoard, searchQuery, filters]);

  const getStatusBadge = (status) => {
    const st = (status || "TODO").toUpperCase();
    const config = {
      TODO: { color: "light", label: "To Do" },
      IN_PROGRESS: { color: "primary", label: "In Progress" },
      REVIEW: { color: "warning", label: "In Review" },
      COMPLETED: { color: "success", label: "Completed" },
      BLOCKED: { color: "danger", label: "Blocked" },
    };
    const current = config[st] || { color: "light", label: st };
    return (
      <Badge color={current.color} className="badge-dim">
        {current.label}
      </Badge>
    );
  };

  const getPriorityBadge = (task) => {
    const pMeta = task?.meta?.priority;
    if (pMeta && pMeta.value) {
      return (
        <Badge color={pMeta.theme || "secondary"} className="badge-dot">
          {pMeta.value}
        </Badge>
      );
    }
    const raw = task?.priority || task?.raw?.priority || "MEDIUM";
    const pr = String(raw).toUpperCase();
    const config = {
      HIGH: { color: "danger", label: "High" },
      MEDIUM: { color: "warning", label: "Medium" },
      LOW: { color: "info", label: "Low" },
    };
    const current = config[pr] || { color: "light", label: raw };
    return (
      <Badge color={current.color} className="badge-dot">
        {current.label}
      </Badge>
    );
  };

  return (
    <div className="nk-block">
      <Card className="card-bordered card-stretch">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 px-4 w-[35%]">
                  <span className="overline-title text-muted">Task Title</span>
                </th>
                <th className="py-3 px-3 w-[15%]">
                  <span className="overline-title text-muted">Status</span>
                </th>
                <th className="py-3 px-3 w-[12%]">
                  <span className="overline-title text-muted">Priority</span>
                </th>
                <th className="py-3 px-3 w-[15%]">
                  <span className="overline-title text-muted">Assignees</span>
                </th>
                <th className="py-3 px-3 w-[15%]">
                  <span className="overline-title text-muted">Due Date</span>
                </th>
                <th className="py-3 px-4 text-end w-[8%]">
                  <span className="overline-title text-muted">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <Spinner size="sm" color="primary" />
                    <span className="ms-2 text-muted fw-medium">Loading tasks...</span>
                  </td>
                </tr>
              ) : tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="py-3 px-4">
                      <div>
                        <span
                          className="fw-bold text-primary cursor-pointer text-[0.95rem]"
                          onClick={() => {
                            setSelectedTask(task);
                            setDetailModal(true);
                          }}
                        >
                          {task.title}
                        </span>
                        {task.desc && (
                          <div className="small text-muted text-truncate mt-1 max-w-[380px]">
                            {task.desc}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">{getStatusBadge(task.status)}</td>
                    <td className="py-3 px-3">{getPriorityBadge(task)}</td>
                    <td className="py-3 px-3">
                      <div className="user-avatar-group">
                        {task.meta?.users && task.meta.users.length > 0 ? (
                          <>
                            {task.meta.users.slice(0, 3).map((user, idx) => (
                              <UserAvatar
                                key={idx}
                                className="xs"
                                theme={user?.theme || "primary"}
                                text={findUpper(user?.name || "User")}
                                image={user?.avatar}
                              />
                            ))}
                            {task.meta.users.length > 3 && (
                              <UserAvatar
                                className="xs"
                                theme="light"
                                text={`+${task.meta.users.length - 3}`}
                              />
                            )}
                          </>
                        ) : (
                          <span className="small text-muted">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {task.dueDate ? (
                        <div className="d-flex align-items-center gap-1 text-soft small">
                          <Icon name="calendar" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="small text-muted">No Date</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-end">
                      <Button
                        size="sm"
                        color="light"
                        className="btn-icon btn-trigger"
                        onClick={() => {
                          setSelectedTask(task);
                          setDetailModal(true);
                        }}
                        title="View Details"
                      >
                        <Icon name="eye" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="text-muted">
                      <Icon name="inbox" className="fs-1 text-soft d-block mb-2" />
                      <span>No tasks found matching your filters.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with pagination & task count */}
        <div className="card-inner py-4 px-4 border-top d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
          <div className="text-muted small">
            {total > 0 ? (
              <span>
                Showing <strong>{(page - 1) * limit + 1}</strong> to{" "}
                <strong>{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> tasks
              </span>
            ) : (
              <span>0 tasks</span>
            )}
          </div>
          {total > limit && (
            <PaginationComponent
              itemPerPage={limit}
              totalItems={total}
              paginate={(pageNumber) => setPage(pageNumber)}
              currentPage={page}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default TaskList;
