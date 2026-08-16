import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { tasksApi } from '../../api/tasks.api';
import { boardsApi } from '../../api/boards.api';
import { categoriesApi } from '../../api/categories.api';
import { tagsApi } from '../../api/tags.api';
import { usersApi } from '../../api/users.api';
import socketService from '../../services/socket.service';
import { DEFAULT_COLUMNS, SOCKET_EVENTS, TASK_STATUS } from '../../utils/constants';
import { normalizeTask, mapBoardToOption, mapCategoryToOption, mapTagToOption, mapUserToOption } from '../../utils/normalize';
import { useAuth } from '../../context/AuthContext';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);

  const [columns, setColumns] = useState(() =>
    DEFAULT_COLUMNS.map((col) => ({
      ...col,
      items: [],
      page: 1,
      limit: 20,
      loading: false,
      hasMore: true,
      total: 0,
      error: null,
    }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignee: '',
    categoryId: '',
  });

  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  // Fetch initial metadata (boards, categories, tags, users)
  const fetchMetadata = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [boardsRes, categoriesRes, tagsRes, usersRes] = await Promise.allSettled([
        boardsApi.getBoards({ limit: 100 }),
        categoriesApi.getCategories(),
        tagsApi.getTags(),
        usersApi.getUsers({ limit: 100 }),
      ]);

      if (boardsRes.status === 'fulfilled') {
        const boardList = boardsRes.value?.data || [];
        setBoards(boardList);
        if (boardList.length > 0) {
          setActiveBoard((prev) => {
            if (!prev || !boardList.some((b) => b.id === prev.id)) {
              return boardList[0];
            }
            return prev;
          });
        }
      }

      if (categoriesRes.status === 'fulfilled') {
        setCategories(categoriesRes.value?.data || []);
      }

      if (tagsRes.status === 'fulfilled') {
        setTags(tagsRes.value?.data || []);
      }

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value?.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch task metadata:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  const boardId = activeBoard?.id;
  const filterStatus = filters.status;
  const filterPriority = filters.priority;
  const filterAssignee = filters.assignee;
  const filterCategoryId = filters.categoryId;

  // Fetch tasks for active board and filters
  const loadColumnTasks = useCallback(async (statusId, page = 1) => {
    if (!isAuthenticated) return;
    
    setColumns(prev => prev.map(col => col.id === statusId ? { ...col, loading: true, error: null } : col));
    
    try {
      const params = {
        limit: 20,
        page,
        status: statusId,
        ...(boardId ? { board_id: boardId } : {}),
        ...(searchQuery ? { search: searchQuery } : {}),
        ...(filterPriority ? { priority: filterPriority } : {}),
        ...(filterAssignee ? { assignee: filterAssignee } : {}),
        ...(filterCategoryId ? { category_id: filterCategoryId } : {}),
      };

      const response = await tasksApi.getTasks(params);
      const rawTasks = response?.data?.tasks || response?.data || [];
      const meta = response?.data?.meta || response?.meta || {};
      
      const normalized = rawTasks.map(normalizeTask);
      const hasMore = meta.hasNextPage !== undefined ? meta.hasNextPage : normalized.length === 20;

      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === statusId) {
            return {
              ...col,
              items: page === 1 ? normalized : [...col.items, ...normalized],
              page,
              loading: false,
              hasMore,
              total: meta.total || col.total || 0,
            };
          }
          return col;
        })
      );
    } catch (err) {
      setColumns((prev) =>
        prev.map((col) =>
          col.id === statusId ? { ...col, loading: false, error: err.message || 'Failed' } : col
        )
      );
    }
  }, [isAuthenticated, boardId, searchQuery, filterPriority, filterAssignee, filterCategoryId]);

  const loadInitialTasks = useCallback(() => {
    DEFAULT_COLUMNS.forEach(col => {
      if (filterStatus && filterStatus !== col.id) {
         setColumns(prev => prev.map(c => c.id === col.id ? { ...c, items: [], page: 1, hasMore: false, total: 0 } : c));
      } else {
         loadColumnTasks(col.id, 1);
      }
    });
  }, [filterStatus, loadColumnTasks]);

  const loadMoreTasks = useCallback((statusId) => {
    const col = columnsRef.current.find(c => c.id === statusId);
    if (!col || col.loading || !col.hasMore) return;
    loadColumnTasks(statusId, col.page + 1);
  }, [loadColumnTasks]);

  // Trigger task fetch whenever activeBoard, searchQuery, or filters change
  useEffect(() => {
    if (boardId) {
      loadInitialTasks();
    }
  }, [boardId, searchQuery, filterStatus, filterPriority, filterAssignee, filterCategoryId, loadInitialTasks]);

  // Socket.IO real-time global board synchronization
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleBoardCreated = (newBoard) => {
      if (!newBoard?.id) return;
      setBoards((prev) => {
        if (prev.some((b) => b.id === newBoard.id)) return prev;
        return [...prev, newBoard];
      });
    };

    const handleBoardUpdated = (updatedBoard) => {
      if (!updatedBoard?.id) return;
      setBoards((prev) =>
        prev.map((b) => (b.id === updatedBoard.id ? { ...b, ...updatedBoard } : b))
      );
      setActiveBoard((prev) => {
        if (prev?.id === updatedBoard.id) {
          return { ...prev, ...updatedBoard };
        }
        return prev;
      });
    };

    const handleBoardDeleted = (data) => {
      const boardId = data?.boardId || data?.id || data;
      if (!boardId) return;
      setBoards((prevBoards) => {
        const remaining = prevBoards.filter((b) => b.id !== boardId);
        setActiveBoard((prevActive) => {
          if (prevActive?.id === boardId) {
            return remaining[0] || null;
          }
          return prevActive;
        });
        return remaining;
      });
    };

    socketService.on(SOCKET_EVENTS.BOARD_CREATED, handleBoardCreated);
    socketService.on(SOCKET_EVENTS.BOARD_UPDATED, handleBoardUpdated);
    socketService.on(SOCKET_EVENTS.BOARD_DELETED, handleBoardDeleted);

    return () => {
      socketService.off(SOCKET_EVENTS.BOARD_CREATED, handleBoardCreated);
      socketService.off(SOCKET_EVENTS.BOARD_UPDATED, handleBoardUpdated);
      socketService.off(SOCKET_EVENTS.BOARD_DELETED, handleBoardDeleted);
    };
  }, [isAuthenticated]);

  // Socket.IO real-time task synchronization
  useEffect(() => {
    if (!isAuthenticated || !activeBoard?.id) return;

    socketService.joinBoard(activeBoard.id);

    const handleTaskCreated = (rawTask) => {
      if (!rawTask || !rawTask.id || !rawTask.title) return;
      const task = normalizeTask(rawTask);
      if (task.boardId && task.boardId !== activeBoard.id) return;

      setColumns((prevCols) => {
        const colId = task.status;
        return prevCols.map((col) => {
          if (col.id === colId) {
            if (col.items.some((i) => i.id === task.id)) {
              return {
                ...col,
                items: col.items.map((i) => (i.id === task.id ? task : i)),
              };
            }
            return {
              ...col,
              items: [task, ...col.items],
              total: col.total + 1
            };
          }
          return {
            ...col,
            items: col.items.filter((i) => i.id !== task.id),
          };
        });
      });
    };

    const handleTaskUpdated = (rawTask) => {
      if (!rawTask || !rawTask.id || !rawTask.title) return;
      const task = normalizeTask(rawTask);
      if (task.boardId && task.boardId !== activeBoard.id) {
        setColumns((prevCols) =>
          prevCols.map((col) => ({
            ...col,
            items: col.items.filter((i) => i.id !== task.id),
          }))
        );
        return;
      }

      setColumns((prevCols) => {
        return prevCols.map((col) => {
          if (col.id === task.status) {
            const itemIndex = col.items.findIndex((i) => i.id === task.id);
            if (itemIndex >= 0) {
              const newItems = [...col.items];
              newItems[itemIndex] = task;
              return { ...col, items: newItems };
            }
            return { ...col, items: [task, ...col.items], total: col.total + 1 };
          }
          return {
            ...col,
            items: col.items.filter((i) => i.id !== task.id),
          };
        });
      });
    };

    const handleTaskCommented = (payload) => {
      const targetTaskId = payload?.taskId || payload?.comment?.taskId;
      if (!targetTaskId) return;

      setColumns((prevCols) =>
        prevCols.map((col) => ({
          ...col,
          items: col.items.map((t) => {
            if (t.id === targetTaskId) {
              const currentCount = parseInt(t.meta?.comment || '0', 10) || 0;
              return {
                ...t,
                meta: {
                  ...t.meta,
                  comment: String(currentCount + 1),
                },
              };
            }
            return t;
          }),
        }))
      );
    };

    const handleTaskDeleted = (payload) => {
      const delId = payload?.id || (typeof payload === 'string' ? payload : null);
      if (!delId) return;
      setColumns((prevCols) =>
        prevCols.map((col) => ({
          ...col,
          items: col.items.filter((i) => i.id !== delId),
        }))
      );
    };


    socketService.on(SOCKET_EVENTS.TASK_CREATED, handleTaskCreated);
    socketService.on(SOCKET_EVENTS.TASK_UPDATED, handleTaskUpdated);
    socketService.on(SOCKET_EVENTS.TASK_MOVED, handleTaskUpdated);
    socketService.on(SOCKET_EVENTS.TASK_ASSIGNED, handleTaskUpdated);
    socketService.on(SOCKET_EVENTS.TASK_COMMENTED, handleTaskCommented);
    socketService.on(SOCKET_EVENTS.TASK_DELETED, handleTaskDeleted);
    return () => {
      socketService.off(SOCKET_EVENTS.TASK_CREATED, handleTaskCreated);
      socketService.off(SOCKET_EVENTS.TASK_UPDATED, handleTaskUpdated);
      socketService.off(SOCKET_EVENTS.TASK_MOVED, handleTaskUpdated);
      socketService.off(SOCKET_EVENTS.TASK_ASSIGNED, handleTaskUpdated);
      socketService.off(SOCKET_EVENTS.TASK_COMMENTED, handleTaskCommented);
      socketService.off(SOCKET_EVENTS.TASK_DELETED, handleTaskDeleted);
      socketService.leaveBoard(activeBoard.id);
    };
  }, [isAuthenticated, activeBoard?.id]);

  // Optimistic task status move
  const moveTaskStatus = async (taskId, fromStatus, toStatus, newIndex) => {
    if (fromStatus === toStatus && newIndex === undefined) return;

    const previousColumns = columnsRef.current;
    let movedTask = null;

    // Apply optimistic update immediately
    setColumns((prev) => {
      // Locate task across all columns
      for (const col of prev) {
        const item = col.items.find((i) => i.id === taskId);
        if (item) {
          movedTask = { ...item, status: toStatus };
          break;
        }
      }

      if (!movedTask) return prev;

      return prev.map((col) => {
        if (col.id === toStatus) {
          const itemsWithout = col.items.filter((i) => i.id !== taskId);
          if (typeof newIndex === 'number' && newIndex >= 0 && newIndex <= itemsWithout.length) {
            itemsWithout.splice(newIndex, 0, movedTask);
          } else {
            itemsWithout.push(movedTask);
          }
          return { ...col, items: itemsWithout };
        }
        return {
          ...col,
          items: col.items.filter((i) => i.id !== taskId),
        };
      });
    });

    try {
      const response = await tasksApi.updateTask(taskId, { status: toStatus });
      const updated = normalizeTask(response?.data);

      // Refresh task with full server data
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === (updated?.status || toStatus)) {
            const hasTask = col.items.some((i) => i.id === taskId);
            if (hasTask) {
              return {
                ...col,
                items: col.items.map((i) => (i.id === taskId ? (updated || i) : i)),
              };
            }
            return {
              ...col,
              items: [updated, ...col.items],
            };
          }
          return {
            ...col,
            items: col.items.filter((i) => i.id !== taskId),
          };
        })
      );
      return updated;
    } catch (err) {
      console.error('Failed to move task status:', err);
      // Rollback to previous columns state
      setColumns(previousColumns);
      throw err;
    }
  };

  // CRUD Actions
  const createTask = async (taskData) => {
    const payload = {
      ...taskData,
      board_id: taskData.board_id || activeBoard?.id,
    };
    const response = await tasksApi.createTask(payload);
    const created = normalizeTask(response?.data);
    if (created) {
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === created.status) {
            return { ...col, items: [created, ...col.items.filter((i) => i.id !== created.id)] };
          }
          return col;
        })
      );
    }
    return created;
  };

  const updateTask = async (taskId, updateData) => {
    const response = await tasksApi.updateTask(taskId, updateData);
    const updated = normalizeTask(response?.data);
    if (updated) {
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === updated.status) {
            const exists = col.items.some((i) => i.id === taskId);
            if (exists) {
              return {
                ...col,
                items: col.items.map((i) => (i.id === taskId ? updated : i)),
              };
            }
            return { ...col, items: [updated, ...col.items] };
          }
          return {
            ...col,
            items: col.items.filter((i) => i.id !== taskId),
          };
        })
      );
    }
    return updated;
  };

  const deleteTask = async (taskId) => {
    const previousColumns = columns;
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        items: col.items.filter((i) => i.id !== taskId),
      }))
    );

    try {
      await tasksApi.deleteTask(taskId);
    } catch (err) {
      setColumns(previousColumns);
      throw err;
    }
  };

  // Board CRUD
  const createBoard = async (boardData) => {
    const response = await boardsApi.createBoard(boardData);
    const newBoard = response?.data;
    if (newBoard) {
      setBoards((prev) => [...prev, newBoard]);
      setActiveBoard(newBoard);
    }
    return newBoard;
  };

  const updateBoard = async (boardId, boardData) => {
    const response = await boardsApi.updateBoard(boardId, boardData);
    const updatedBoard = response?.data;
    if (updatedBoard) {
      setBoards((prev) => prev.map((b) => (b.id === boardId ? updatedBoard : b)));
      if (activeBoard?.id === boardId) {
        setActiveBoard(updatedBoard);
      }
    }
    return updatedBoard;
  };

  const deleteBoard = async (boardId) => {
    await boardsApi.deleteBoard(boardId);
    setBoards((prev) => {
      const remaining = prev.filter((b) => b.id !== boardId);
      if (activeBoard?.id === boardId) {
        setActiveBoard(remaining[0] || null);
      }
      return remaining;
    });
  };

  const selectBoard = (boardOrId) => {
    if (typeof boardOrId === 'string') {
      const target = boards.find((b) => b.id === boardOrId);
      if (target) setActiveBoard(target);
    } else if (boardOrId) {
      setActiveBoard(boardOrId);
    }
  };

  const allTasks = columns.flatMap((col) => col.items);

  const value = {
    columns,
    setColumns,
    allTasks,
    boards,
    boardOptions: boards.map(mapBoardToOption),
    activeBoard,
    selectBoard,
    setActiveBoard,
    categories,
    categoryOptions: categories.map(mapCategoryToOption),
    tags,
    tagOptions: tags.map(mapTagToOption),
    users,
    userOptions: users.map(mapUserToOption),
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    loadInitialTasks,
    loadMoreTasks,
    fetchMetadata,
    moveTaskStatus,
    createTask,
    updateTask,
    deleteTask,
    createBoard,
    updateBoard,
    deleteBoard,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext;
