import { PRIORITY_OPTIONS } from './constants';
import { getDateStructured, setDeadlineDays } from './Utils';

const userThemes = ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'dark', 'pink', 'purple', 'blue'];

export const getUserTheme = (userId = '') => {
  if (!userId) return 'primary';
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % userThemes.length;
  return userThemes[index];
};

export const mapPriorityToUI = (priority) => {
  const normalized = (priority || 'MEDIUM').toUpperCase();
  const option = PRIORITY_OPTIONS.find(p => p.value === normalized) || PRIORITY_OPTIONS[1];
  return {
    value: option.label,
    label: option.label,
    raw: option.value,
    theme: option.theme,
  };
};

export const mapUserToOption = (user) => {
  if (!user) return null;
  return {
    value: user.id || user.name,
    label: user.name || user.email,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    theme: getUserTheme(user.id || user.name),
  };
};

export const mapTagToOption = (tag) => {
  if (!tag) return null;
  return {
    value: tag.id || tag.name,
    label: tag.name,
    id: tag.id,
    name: tag.name,
    theme: tag.theme || 'info',
  };
};

export const mapCategoryToOption = (category) => {
  if (!category) return null;
  return {
    value: category.id,
    label: category.name,
    id: category.id,
    name: category.name,
  };
};

export const mapBoardToOption = (board) => {
  if (!board) return null;
  return {
    value: board.id,
    label: board.title,
    id: board.id,
    title: board.title,
    theme: board.theme || 'light',
  };
};

export const normalizeTask = (task) => {
  if (!task) return null;

  const users = (task.assignees || []).map((a) => {
    const u = a.user || a;
    return {
      value: u.name || u.email || 'User',
      label: u.name || u.email || 'User',
      id: u.id,
      email: u.email,
      theme: getUserTheme(u.id || u.name),
    };
  });

  const tags = (task.tags || []).map((t) => {
    const tag = t.tag || t;
    return {
      value: tag.name,
      label: tag.name,
      id: tag.id,
      theme: tag.theme || 'info',
    };
  });

  let formattedDate = '';
  let dueDays = null;
  if (task.dueDate) {
    const d = new Date(task.dueDate);
    if (!isNaN(d.getTime())) {
      formattedDate = getDateStructured(d);
      dueDays = setDeadlineDays(d);
    }
  }

  const priorityMeta = mapPriorityToUI(task.priority);

  return {
    id: task.id,
    title: task.title || '',
    desc: task.description || '',
    status: (task.status || 'TODO').toUpperCase(),
    boardId: task.boardId || task.board_id || '',
    boardTitle: task.board?.title || '',
    meta: {
      users,
      tags,
      date: formattedDate,
      dueDate: task.dueDate || null,
      due: dueDays !== null ? String(dueDays) : undefined,
      category: task.category?.name || (typeof task.category === 'string' ? task.category : ''),
      categoryId: task.categoryId || task.category?.id || null,
      comment: String(task._count?.comments ?? (Array.isArray(task.comments) ? task.comments.length : 0)),
      priority: priorityMeta,
    },
    raw: task,
  };
};
