export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
};

export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  MEMBER: 'MEMBER',
};

export const SOCKET_EVENTS = {
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_MOVED: 'task:moved',
  TASK_ASSIGNED: 'task:assigned',
  TASK_COMMENTED: 'task:commented',
  BOARD_CREATED: 'board:created',
  BOARD_UPDATED: 'board:updated',
  BOARD_DELETED: 'board:deleted',
  JOIN_BOARD: 'join:board',
  LEAVE_BOARD: 'leave:board',
};

export const DEFAULT_COLUMNS = [
  { id: 'TODO', title: 'To Do', theme: 'light' },
  { id: 'IN_PROGRESS', title: 'In Progress', theme: 'primary' },
  { id: 'REVIEW', title: 'To Review', theme: 'warning' },
  { id: 'COMPLETED', title: 'Completed', theme: 'success' },
  { id: 'BLOCKED', title: 'Blocked', theme: 'danger' },
];

export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', theme: 'success' },
  { value: 'MEDIUM', label: 'Medium', theme: 'warning' },
  { value: 'HIGH', label: 'High', theme: 'danger' },
  { value: 'URGENT', label: 'Urgent', theme: 'dark' },
];

export const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do', theme: 'light' },
  { value: 'IN_PROGRESS', label: 'In Progress', theme: 'primary' },
  { value: 'REVIEW', label: 'To Review', theme: 'warning' },
  { value: 'COMPLETED', label: 'Completed', theme: 'success' },
  { value: 'BLOCKED', label: 'Blocked', theme: 'danger' },
];

export const THEME_OPTIONS = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'info', label: 'Info' },
  { value: 'danger', label: 'Danger' },
  { value: 'warning', label: 'Warning' },
  { value: 'success', label: 'Success' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];
