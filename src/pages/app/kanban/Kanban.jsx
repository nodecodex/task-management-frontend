import React, { useState, useEffect, useRef } from "react";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import classNames from "classnames";
import {
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  DropdownItem,
  Badge,
  Spinner,
} from "reactstrap";
import {
  BlockHead,
  BlockBetween,
  BlockHeadContent,
  BlockTitle,
  Button,
  Icon,
  Block,
  UserAvatar,
} from "@/components/Component";
import { findUpper } from "@/utils/Utils";

import {
  DndContext,
  pointerWithin,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import BoardForm from "./partials/BoardForm";
import TaskForm from "./partials/TaskForm";
import TaskDetailModal from "./partials/TaskDetailModal";
import TaskList from "./partials/TaskList";
import { useTaskContext } from "@/layout/provider/TaskContext";
import { PRIORITY_OPTIONS } from "@/utils/constants";
import { toast } from "react-toastify";

const Column = ({ id, className, children, onLoadMore, hasMore, loading, error }) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loading]);

  return (
    <main
      className={className && className}
      ref={setNodeRef}
      style={{ maxHeight: "350px", overflowY: "auto" }}
    >
      {children}
      {hasMore && (
        <div ref={sentinelRef} className="py-2 text-center text-slate-400">
          {loading && (
            <div className="d-flex flex-column align-items-center gap-2">
              <Spinner size="sm" color="primary" />
              <span className="text-xs">Loading more tasks...</span>
            </div>
          )}
        </div>
      )}
      {error && (
        <div className="py-2 text-center text-danger">
          <small>{error}</small>
          <br />
          <Button size="sm" color="light" onClick={onLoadMore} className="mt-1">
            Retry
          </Button>
        </div>
      )}
    </main>
  );
};

const Item = ({ item, children, className }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      className={className && className}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
    >
      {children}
    </div>
  );
};

const Kanban = () => {
  const [viewMode, setViewMode] = useState("kanban");
  const [smBtn, setSmBtn] = useState(false);
  const [addBoardModal, setAddBoardModal] = useState(false);
  const [editBoardModal, setEditBoardModal] = useState(false);
  const [addTaskModal, setAddTaskModal] = useState(false);
  const [editTaskModal, setEditTaskModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [targetColumnStatus, setTargetColumnStatus] = useState("TODO");

  const [searchInput, setSearchInput] = useState("");
  const searchTimerRef = useRef(null);

  const {
    columns,
    setColumns,
    boards,
    activeBoard,
    selectBoard,
    isLoading,
    setSearchQuery,
    filters,
    setFilters,
    moveTaskStatus,
    deleteTask,
    deleteBoard,
    loadMoreTasks,
  } = useTaskContext();

  const currentSelectedTask = selectedTask
    ? columns.flatMap((c) => c.items).find((t) => t.id === selectedTask.id) || selectedTask
    : null;

  const sensors = [
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor),
  ];

  // Debounced search handler
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setSearchQuery(val.trim());
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const findColumn = (unique) => {
    if (!unique) return null;
    if (columns.some((c) => c.id === unique)) {
      return columns.find((c) => c.id === unique) ?? null;
    }
    const id = String(unique);
    const itemWithColumnId = columns.flatMap((c) => {
      const columnId = c.id;
      return c.items.map((i) => ({ itemId: i.id, columnId: columnId }));
    });
    const columnId = itemWithColumnId.find((i) => i.itemId === id)?.columnId;
    return columns.find((c) => c.id === columnId) ?? null;
  };

  const handleDragOver = (event) => {
    const { active, over, delta } = event;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return null;
    }

    setColumns((prevState) => {
      const activeItems = activeColumn.items;
      const overItems = overColumn.items;
      const activeIndex = activeItems.findIndex((i) => i.id === activeId);
      const overIndex = overItems.findIndex((i) => i.id === overId);

      const newIndex = () => {
        const putOnBelowLastItem = overIndex === overItems.length - 1 && delta.y > 0;
        const modifier = putOnBelowLastItem ? 1 : 0;
        return overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      };

      return prevState.map((c) => {
        if (c.id === activeColumn.id) {
          return {
            ...c,
            items: activeItems.filter((i) => i.id !== activeId),
          };
        } else if (c.id === overColumn.id) {
          const updatedTask = { ...activeItems[activeIndex], status: overColumn.id };
          return {
            ...c,
            items: [
              ...overItems.slice(0, newIndex()),
              updatedTask,
              ...overItems.slice(newIndex(), overItems.length),
            ],
          };
        } else {
          return c;
        }
      });
    });
  };

  const handleManualStatusChange = async (taskId, fromColId, toColId) => {
    if (fromColId === toColId) return;
    try {
      await moveTaskStatus(taskId, fromColId, toColId);
      toast.success("Task status updated");
    } catch (err) {
      toast.error(err.message || "Failed to update task status");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn) {
      return null;
    }

    const activeIndex = activeColumn.items.findIndex((i) => i.id === activeId);
    const overIndex = overColumn.items.findIndex((i) => i.id === overId);

    if (activeColumn.id === overColumn.id) {
      if (activeIndex !== overIndex && activeIndex !== -1 && overIndex !== -1) {
        setColumns((prevState) => {
          return prevState.map((column) => {
            if (column.id === activeColumn.id) {
              return {
                ...column,
                items: arrayMove(column.items, activeIndex, overIndex),
              };
            }
            return column;
          });
        });
      }
    } else {
      // Moved to different column
      try {
        await moveTaskStatus(activeId, activeColumn.id, overColumn.id, overIndex);
      } catch (err) {
        toast.error(err.message || "Failed to persist task position");
      }
    }
  };

  const handleDeleteBoard = async () => {
    if (!activeBoard?.id) return;
    if (!window.confirm(`Are you sure you want to delete board "${activeBoard.title}"?`)) return;
    try {
      await deleteBoard(activeBoard.id);
      toast.success("Board deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete board");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
      toast.success("Task deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete task");
    }
  };

  return (
    <>
      <Head title="Kanban Board" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <div className="d-flex align-items-center gap-3">
                <BlockTitle page>Kanban Board</BlockTitle>
                {boards.length > 0 && (
                  <UncontrolledDropdown>
                    <DropdownToggle
                      tag="a"
                      href="#toggle"
                      onClick={(e) => e.preventDefault()}
                      className="btn btn-outline-primary d-flex align-items-center gap-2 py-2"
                    >
                      <span className="text-truncate" style={{ maxWidth: "200px" }}>
                        {activeBoard?.title || "Select Board"}
                      </span>
                      <Icon name="chevron-down" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <ul className="link-list-opt no-bdr">
                        {boards.map((b) => (
                          <li key={b.id}>
                            <DropdownItem
                              tag="a"
                              href="#board"
                              className={`pe-4 ${activeBoard?.id === b.id ? "active" : ""}`}
                              onClick={(ev) => {
                                ev.preventDefault();
                                selectBoard(b);
                              }}
                            >
                              <span className="text-truncate" style={{ maxWidth: "250px", display: "inline-block" }}>
                                {b.title}
                              </span>
                            </DropdownItem>
                          </li>
                        ))}
                      </ul>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                )}
              </div>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="toggle-wrap nk-block-tools-toggle">
                <a
                  href="#toggle"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setSmBtn(!smBtn);
                  }}
                  className="btn btn-icon btn-trigger toggle-expand me-n1"
                >
                  <Icon name="menu-alt-r" />
                </a>
                <div className={`toggle-expand-content ${smBtn ? "expanded" : ""}`}>
                  <ul className="nk-block-tools g-3 align-items-center">
                    {/* Search box */}
                    <li>
                      <div className="form-control-wrap">
                        <div className="form-icon form-icon-left">
                          <Icon name="search" />
                        </div>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Search tasks..."
                          value={searchInput}
                          onChange={handleSearchChange}
                          style={{ width: "200px" }}
                        />
                      </div>
                    </li>

                    {/* Priority Filter */}
                    <li>
                      <UncontrolledDropdown>
                        <DropdownToggle
                          tag="button"
                          className="btn btn-sm btn-white btn-outline-light"
                        >
                          <Icon name="filter" />
                          <span>{filters.priority ? `Priority: ${filters.priority}` : "All Priorities"}</span>
                        </DropdownToggle>
                        <DropdownMenu end>
                          <ul className="link-list-opt no-bdr">
                            <li>
                              <DropdownItem
                                tag="a"
                                href="#clear"
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  setFilters((prev) => ({ ...prev, priority: "" }));
                                }}
                              >
                                <span>All Priorities</span>
                              </DropdownItem>
                            </li>
                            {PRIORITY_OPTIONS.map((p) => (
                              <li key={p.value}>
                                <DropdownItem
                                  tag="a"
                                  href="#priority"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    setFilters((prev) => ({ ...prev, priority: p.value }));
                                  }}
                                >
                                  <span>{p.label}</span>
                                </DropdownItem>
                              </li>
                            ))}
                          </ul>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </li>

                    {/* View Mode Toggle */}
                    <li>
                      <div className="btn-group ">
                        <Button
                          color={viewMode === "kanban" ? "primary" : "light"}
                          outline={viewMode !== "kanban"}
                          className={`p-1 btn-icon ${viewMode !== "kanban" ? "btn-white" : ""}`}
                          onClick={() => setViewMode("kanban")}
                          title="Kanban View"
                        >
                          <Icon name="kanban" />
                        </Button>
                        <Button
                          color={viewMode === "list" ? "primary" : "light"}
                          outline={viewMode !== "list"}
                          className={`p-1 btn-icon ${viewMode !== "list" ? "btn-white" : ""}`}
                          onClick={() => setViewMode("list")}
                          title="List View"
                        >
                          <Icon name="list" />
                        </Button>
                      </div>
                    </li>

                    {/* Add Task Button */}
                    <li>
                      <Button
                        color="light"
                        outline
                        className="btn-white"
                        onClick={() => {
                          setTargetColumnStatus("TODO");
                          setSelectedTask(null);
                          setAddTaskModal(true);
                        }}
                      >
                        <Icon name="plus" />
                        <span>Add Task</span>
                      </Button>
                    </li>

                    {/* Add Board Button */}
                    <li>
                      <Button
                        color="primary"
                        onClick={() => {
                          setAddBoardModal(true);
                        }}
                      >
                        <Icon name="plus" />
                        <span>Add Board</span>
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {isLoading && columns.every((c) => c.items.length === 0) ? (
          <div className="d-flex justify-content-center align-items-center p-5" style={{ minHeight: "300px" }}>
            <Spinner color="primary" />
          </div>
        ) : (
          <Block>
            {viewMode === "kanban" ? (
              <div className="nk-kanban">
                <DndContext
                  sensors={sensors}
                  collisionDetection={pointerWithin}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                >
                  <div className="kanban-container">
                    {columns.map((column, index) => {
                      return (
                        <div key={column.id || index} className="kanban-board">
                          <header
                            className={classNames({
                              'kanban-board-header': true,
                              [`kanban-${column.theme}`]: column.theme,
                              'kanban-light': !column.theme,
                            })}
                          >
                            <div className="kanban-title-board">
                              <div className="kanban-title-content">
                                <h6 className="title">{column.title}</h6>
                                <span className="badge rounded-pill bg-outline-light text-dark">
                                  {column.items.length}
                                </span>
                              </div>
                              <div className="kanban-title-content">
                                <UncontrolledDropdown>
                                  <DropdownToggle
                                    tag="a"
                                    className="dropdown-toggle btn btn-sm btn-icon btn-trigger me-n1"
                                  >
                                    <Icon name="more-h" />
                                  </DropdownToggle>
                                  <DropdownMenu end>
                                    <ul className="link-list-opt no-bdr">
                                      {activeBoard && (
                                        <>
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#edit-board"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                setEditBoardModal(true);
                                              }}
                                            >
                                              <Icon name="edit" />
                                              <span>Edit Board</span>
                                            </DropdownItem>
                                          </li>
                                          <li>
                                            <DropdownItem
                                              tag="a"
                                              href="#delete-board"
                                              onClick={(ev) => {
                                                ev.preventDefault();
                                                handleDeleteBoard();
                                              }}
                                            >
                                              <Icon name="trash" />
                                              <span>Delete Board</span>
                                            </DropdownItem>
                                          </li>
                                        </>
                                      )}
                                      <li>
                                        <DropdownItem
                                          tag="a"
                                          href="#add-task"
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            setTargetColumnStatus(column.id);
                                            setSelectedTask(null);
                                            setAddTaskModal(true);
                                          }}
                                        >
                                          <Icon name="plus" />
                                          <span>Add Task</span>
                                        </DropdownItem>
                                      </li>
                                    </ul>
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                              </div>
                            </div>
                          </header>

                          <Column
                            key={column.id}
                            id={column.id}
                            className="kanban-drag"
                            onLoadMore={() => loadMoreTasks(column.id)}
                            hasMore={column.hasMore}
                            loading={column.loading}
                            error={column.error}
                          >
                            <SortableContext items={column.items} strategy={verticalListSortingStrategy}>
                              {column.items.map((item) => (
                                <Item key={item.id} item={item} className="kanban-item">
                                  <div className="kanban-item-title">
                                    <h6
                                      className="title cursor-pointer"
                                      style={{ cursor: "pointer" }}
                                      onClick={() => {
                                        setSelectedTask(item);
                                        setDetailModal(true);
                                      }}
                                    >
                                      {item.title}
                                    </h6>
                                    {item.meta.users.length > 0 && (
                                      <UncontrolledDropdown>
                                        <DropdownToggle
                                          tag="a"
                                          href="#toggle"
                                          className="dropdown-toggle"
                                          onClick={(ev) => ev.preventDefault()}
                                        >
                                          <div className="user-avatar-group">
                                            {item.meta.users.map((user, uIdx) => (
                                              <UserAvatar
                                                key={uIdx}
                                                className="xs"
                                                theme={user.theme}
                                                text={findUpper(user.value) || user.value[0]}
                                              />
                                            ))}
                                          </div>
                                        </DropdownToggle>
                                        <DropdownMenu end>
                                          <ul className="link-list-opt no-bdr p-3 g-2">
                                            {item.meta.users.map((user, uIdx) => (
                                              <li key={uIdx}>
                                                <div className="user-card">
                                                  <UserAvatar
                                                    className="sm"
                                                    theme={user.theme}
                                                    text={findUpper(user.value)}
                                                  />
                                                  <div className="user-name">
                                                    <span className="tb-lead">{user.value}</span>
                                                  </div>
                                                </div>
                                              </li>
                                            ))}
                                          </ul>
                                        </DropdownMenu>
                                      </UncontrolledDropdown>
                                    )}
                                  </div>

                                  {item.desc && (
                                    <div className="kanban-item-text">
                                      <p>{item.desc}</p>
                                    </div>
                                  )}

                                  <ul className="kanban-item-tags">
                                    {item.meta.priority && (
                                      <li>
                                        <Badge color={item.meta.priority.theme}>
                                          {item.meta.priority.value}
                                        </Badge>
                                      </li>
                                    )}
                                    {item.meta.tags.map((tag, tIdx) => (
                                      <li key={tIdx}>
                                        <Badge color={tag.theme}>{tag.value}</Badge>
                                      </li>
                                    ))}
                                    <li>
                                      <UncontrolledDropdown>
                                        <DropdownToggle
                                          tag="a"
                                          href="#status"
                                          onClick={(ev) => ev.preventDefault()}
                                          className="text-decoration-none p-0"
                                        >
                                          <Badge
                                            color={column.theme || "light"}
                                            style={{ cursor: 'pointer' }}
                                          >
                                            {column.title} <Icon name="down-sm" />
                                          </Badge>
                                        </DropdownToggle>
                                        <DropdownMenu>
                                          <ul className="link-list-opt no-bdr">
                                            {columns.map((col) => (
                                              <li key={col.id}>
                                                <DropdownItem
                                                  tag="a"
                                                  href="#change"
                                                  onClick={(ev) => {
                                                    ev.preventDefault();
                                                    handleManualStatusChange(
                                                      item.id,
                                                      column.id,
                                                      col.id
                                                    );
                                                  }}
                                                >
                                                  <span>{col.title}</span>
                                                </DropdownItem>
                                              </li>
                                            ))}
                                          </ul>
                                        </DropdownMenu>
                                      </UncontrolledDropdown>
                                    </li>
                                  </ul>

                                  <div className="kanban-item-meta">
                                    <ul className="kanban-item-meta-list">
                                      {item.meta.date ? (
                                        <li>
                                          <Icon name="calendar" />
                                          <span>{item.meta.date}</span>
                                        </li>
                                      ) : item.meta.due ? (
                                        <li className={Number(item.meta.due) < 5 ? "text-danger" : ""}>
                                          <Icon name="calendar" />
                                          <span>{item.meta.due}d Due</span>
                                        </li>
                                      ) : null}

                                      {item.meta.category && (
                                        <li>
                                          <Icon name="notes" />
                                          <span>{item.meta.category}</span>
                                        </li>
                                      )}

                                      {item.meta.comment && item.meta.comment !== "0" && (
                                        <li>
                                          <Icon name="comments" />
                                          <span>{item.meta.comment}</span>
                                        </li>
                                      )}
                                    </ul>
                                    <ul className="kanban-item-meta-list">
                                      <UncontrolledDropdown>
                                        <DropdownToggle
                                          tag="a"
                                          href="#toggle"
                                          onClick={(ev) => ev.preventDefault()}
                                          className="dropdown-toggle btn btn-xs btn-icon btn-trigger me-n1"
                                        >
                                          <Icon name="more-v" />
                                        </DropdownToggle>
                                        <DropdownMenu end>
                                          <ul className="link-list-opt no-bdr">
                                            <li>
                                              <DropdownItem
                                                tag="a"
                                                href="#view"
                                                onClick={(ev) => {
                                                  ev.preventDefault();
                                                  setSelectedTask(item);
                                                  setDetailModal(true);
                                                }}
                                              >
                                                <Icon name="eye" />
                                                <span>View Details</span>
                                              </DropdownItem>
                                            </li>
                                            <li>
                                              <DropdownItem
                                                tag="a"
                                                href="#edit"
                                                onClick={(ev) => {
                                                  ev.preventDefault();
                                                  setSelectedTask(item);
                                                  setEditTaskModal(true);
                                                }}
                                              >
                                                <Icon name="edit" />
                                                <span>Edit Task</span>
                                              </DropdownItem>
                                            </li>
                                            <li>
                                              <DropdownItem
                                                tag="a"
                                                href="#delete"
                                                onClick={(ev) => {
                                                  ev.preventDefault();
                                                  handleDeleteTask(item.id);
                                                }}
                                              >
                                                <Icon name="trash" />
                                                <span>Delete Task</span>
                                              </DropdownItem>
                                            </li>
                                          </ul>
                                        </DropdownMenu>
                                      </UncontrolledDropdown>
                                    </ul>
                                  </div>
                                </Item>
                              ))}
                            </SortableContext>
                          </Column>
                          <footer>
                            <Button
                              className="kanban-add-task btn-block"
                              onClick={() => {
                                setTargetColumnStatus(column.id);
                                setSelectedTask(null);
                                setAddTaskModal(true);
                              }}
                            >
                              <Icon name="plus-sm" />
                              <span>{column.items.length > 0 ? "Add another " : "Add "} task</span>
                            </Button>
                          </footer>
                        </div>
                      );
                    })}
                  </div>
                </DndContext>
              </div>
            ) : (
              <TaskList setSelectedTask={setSelectedTask} setDetailModal={setDetailModal} />
            )}
          </Block>
        )}
      </Content>

      <BoardForm
        toggle={setAddBoardModal}
        isOpen={addBoardModal}
      />
      <BoardForm
        edit={true}
        board={activeBoard}
        toggle={setEditBoardModal}
        isOpen={editBoardModal}
      />
      <TaskForm
        toggle={setAddTaskModal}
        isOpen={addTaskModal}
        defaultStatus={targetColumnStatus}
      />
      <TaskForm
        edit={true}
        task={currentSelectedTask}
        toggle={setEditTaskModal}
        isOpen={editTaskModal}
      />
      <TaskDetailModal
        isOpen={detailModal}
        toggle={setDetailModal}
        task={currentSelectedTask}
        onEditFull={(t) => {
          setSelectedTask(t);
          setEditTaskModal(true);
        }}
      />
    </>
  );
};

export default Kanban;
