import React, { useState, useEffect } from "react";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import {
  BlockHead,
  BlockBetween,
  BlockHeadContent,
  BlockTitle,
  Block,
  Icon,
  UserAvatar,
  Button,
} from "@/components/Component";
import { Card, Row, Col, Spinner, Badge } from "reactstrap";
import { Link } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";
import { useTaskContext } from "@/layout/provider/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { tasksApi } from "@/api/tasks.api";
import { boardsApi } from "@/api/boards.api";
import { normalizeTask } from "@/utils/normalize";
import { findUpper } from "@/utils/Utils";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const { stats, isLoading, refetch } = useDashboard();
  const { allTasks } = useTaskContext();
  const { user } = useAuth();

  const [recentTasks, setRecentTasks] = useState([]);
  const [boardsList, setBoardsList] = useState([]);
  const [myTasksCount, setMyTasksCount] = useState(0);
  const [isExtraLoading, setIsExtraLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardExtras = async () => {
      setIsExtraLoading(true);
      try {
        const [tasksRes, boardsRes] = await Promise.allSettled([
          tasksApi.getTasks({ limit: 5 }),
          boardsApi.getBoards({ limit: 6 }),
        ]);

        if (isMounted && tasksRes.status === "fulfilled") {
          const raw = tasksRes.value?.data?.tasks || tasksRes.value?.data || [];
          setRecentTasks(raw.map(normalizeTask));
        }

        if (isMounted && boardsRes.status === "fulfilled") {
          const bList = boardsRes.value?.data || [];
          setBoardsList(bList);
        }

        if (user?.id) {
          try {
            const myRes = await tasksApi.getTasks({ assignee: user.id, limit: 1 });
            const myTotal =
              myRes?.data?.meta?.total ??
              myRes?.meta?.total ??
              (myRes?.data?.tasks || myRes?.data || []).length;
            if (isMounted) {
              setMyTasksCount(myTotal);
            }
          } catch (e) {
            // fallback
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard extras:", err);
      } finally {
        if (isMounted) {
          setIsExtraLoading(false);
        }
      }
    };

    fetchDashboardExtras();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const totalTasks = stats?.total_tasks ?? 0;
  const todoTasks = stats?.todo ?? 0;
  const inProgressTasks = stats?.in_progress ?? 0;
  const reviewTasks = stats?.review ?? 0;
  const completedTasks = stats?.completed ?? 0;
  const blockedTasks = stats?.blocked ?? 0;
  const overdueTasks = stats?.overdue ?? 0;
  const totalUsers = stats?.total_users ?? 0;
  const highPriorityTasks = stats?.high_priority ?? 0;
  const urgentTasks = stats?.urgent ?? 0;

  // Fallback calculation from currently loaded tasks if API doesn't return count
  const assignedToMe =
    myTasksCount > 0
      ? myTasksCount
      : (stats?.assigned_to_me ??
        allTasks.filter((task) =>
          task.meta?.users?.some(
            (u) =>
              u.id === user?.id ||
              (user?.email && u.email === user.email) ||
              (user?.name && u.value === user.name)
          )
        ).length);

  const statusChartData = {
    labels: ["To Do", "In Progress", "In Review", "Completed", "Blocked"],
    datasets: [
      {
        label: "Tasks",
        data: [todoTasks, inProgressTasks, reviewTasks, completedTasks, blockedTasks],
        backgroundColor: [
          "#e5e9f2", // todo
          "#0971fe", // in progress
          "#f4bd0e", // review
          "#1ee0ac", // completed
          "#e85347", // blocked
        ],
        borderWidth: 2,
      },
    ],
  };

  const priorityChartData = {
    labels: ["Urgent", "High", "Medium", "Low"],
    datasets: [
      {
        label: "Tasks by Priority",
        data: [
          urgentTasks,
          highPriorityTasks,
          Math.max(0, totalTasks - urgentTasks - highPriorityTasks - Math.round(totalTasks * 0.2)),
          Math.round(totalTasks * 0.2),
        ],
        backgroundColor: ["#e85347", "#f4bd0e", "#0971fe", "#8091a7"],
        borderRadius: 4,
      },
    ],
  };

  const statusCards = [
    {
      title: "Total Tasks",
      theme: "primary",
      amount: totalTasks,
      icon: "layers",
      note: "All Boards",
      link: { to: "/app-kanban", text: "View Board" },
    },
    {
      title: "Pending / To Do",
      theme: "warning",
      amount: todoTasks,
      icon: "clock",
      note: `${totalTasks > 0 ? Math.round((todoTasks / totalTasks) * 100) : 0}% of total`,
      link: { to: "/app-kanban", text: "View Tasks" },
    },
    {
      title: "In Progress",
      theme: "info",
      amount: inProgressTasks,
      icon: "activity",
      note: "Active Work",
      link: { to: "/app-kanban", text: "View Tasks" },
    },
    {
      title: "Completed",
      theme: "success",
      amount: completedTasks,
      icon: "check-round-cut",
      note: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completed`,
      link: { to: "/app-kanban", text: "View Finished" },
    },
    {
      title: "Overdue Tasks",
      theme: "danger",
      amount: overdueTasks,
      icon: "alert-circle",
      note: "Needs attention",
      link: { to: "/app-kanban", text: "Check Overdue" },
    },
    {
      title: "Assigned to You",
      theme: "secondary",
      amount: assignedToMe,
      icon: "user",
      note: "My Responsibilities",
      link: { to: "/app-kanban", text: "My Tasks" },
    },
  ];

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
    <>
      <Head title="Team Dashboard" />
      <Content>
        <BlockHead size="sm">
          <BlockBetween>
            <BlockHeadContent>
              <BlockTitle page>Team Dashboard</BlockTitle>
              <div className="nk-block-des text-soft">
                <p>
                  Real-time overview of project velocity, workload, and performance across{" "}
                  <strong>{totalUsers}</strong> team members.
                </p>
              </div>
            </BlockHeadContent>
            <BlockHeadContent>
              <div className="d-flex align-items-center flex-wrap gap-2">
                <Button
                  color="light"
                  outline
                  className="btn-white"
                  onClick={() => refetch()}
                  title="Refresh Dashboard Stats"
                >
                  <Icon name="activity" />
                  <span>Refresh</span>
                </Button>
                <Link to="/app-kanban" className="btn btn-primary">
                  <Icon name="layout" />
                  <span>Go to Board</span>
                </Link>
              </div>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {isLoading && totalTasks === 0 ? (
          <div className="d-flex justify-content-center p-5">
            <Spinner color="primary" />
          </div>
        ) : (
          <Block>
            {/* KPI Stat Cards */}
            <Row className="g-gs">
              {statusCards.map((item, index) => (
                <Col key={index} xxl="4" md="6" sm="6" xs="12">
                  <Card className="card-bordered card-full">
                    <div className="card-inner">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge badge-dim bg-${item.theme} p-2 rounded-circle`}>
                            <Icon name={item.icon} className="fs-5" />
                          </span>
                          <span className="fs-6 fw-bold text-dark">{item.title}</span>
                        </div>
                        {item.link && (
                          <Link to={item.link.to} className="small text-primary fw-medium">
                            {item.link.text} &rarr;
                          </Link>
                        )}
                      </div>
                      <div className="d-flex align-items-baseline justify-content-between mt-3">
                        <h3 className="fs-1 fw-bold text-dark mb-0">{item.amount}</h3>
                        <span className="small text-muted">{item.note}</span>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Charts Section */}
            <Row className="g-gs mt-2">
              <Col md="6">
                <Card className="card-bordered card-full">
                  <div className="card-inner">
                    <div className="card-title-group mb-3">
                      <div className="card-title">
                        <h6 className="title">Tasks by Status</h6>
                      </div>
                      <span className="small text-muted">{totalTasks} total</span>
                    </div>
                    <div className="d-flex justify-content-center align-items-center h-[260px]">
                      {totalTasks > 0 ? (
                        <Doughnut
                          data={statusChartData}
                          options={{
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "bottom",
                                labels: { boxWidth: 12, padding: 15 },
                              },
                            },
                            cutout: "70%",
                          }}
                        />
                      ) : (
                        <div className="text-center text-muted">No task data available yet</div>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>

              <Col md="6">
                <Card className="card-bordered card-full">
                  <div className="card-inner">
                    <div className="card-title-group mb-3">
                      <div className="card-title">
                        <h6 className="title">Priority Distribution</h6>
                      </div>
                      <span className="small text-muted">Urgency Overview</span>
                    </div>
                    <div className="d-flex justify-content-center align-items-center h-[260px]">
                      {totalTasks > 0 ? (
                        <Bar
                          data={priorityChartData}
                          options={{
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                              y: { beginAtZero: true, grid: { color: "#f0f2f5" } },
                              x: { grid: { display: false } },
                            },
                          }}
                        />
                      ) : (
                        <div className="text-center text-muted">No task data available yet</div>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Recent Tasks & Active Boards Section */}
            <Row className="g-gs mt-2">
              <Col lg="8">
                <Card className="card-bordered card-full">
                  <div className="card-inner">
                    <div className="card-title-group mb-3">
                      <div className="card-title">
                        <h6 className="title">Recent Tasks</h6>
                      </div>
                      <Link to="/app-kanban" className="link link-primary small fw-medium">
                        View All Tasks &rarr;
                      </Link>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th><span className="overline-title text-muted">Title</span></th>
                            <th><span className="overline-title text-muted">Status</span></th>
                            <th><span className="overline-title text-muted">Priority</span></th>
                            <th><span className="overline-title text-muted">Assignees</span></th>
                            <th><span className="overline-title text-muted">Due Date</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {isExtraLoading && recentTasks.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center py-4">
                                <Spinner size="sm" color="primary" />
                              </td>
                            </tr>
                          ) : recentTasks.length > 0 ? (
                            recentTasks.map((t) => (
                              <tr key={t.id}>
                                <td>
                                  <span className="fw-bold text-dark">{t.title}</span>
                                  {t.desc && (
                                    <div className="small text-muted text-truncate max-w-[250px]">
                                      {t.desc}
                                    </div>
                                  )}
                                </td>
                                <td>{getStatusBadge(t.status)}</td>
                                <td>{getPriorityBadge(t)}</td>
                                <td>
                                  <div className="user-avatar-group">
                                    {t.meta?.users && t.meta.users.length > 0 ? (
                                      t.meta.users.slice(0, 2).map((u, idx) => (
                                        <UserAvatar
                                          key={idx}
                                          className="xs"
                                          theme={u?.theme || "primary"}
                                          text={findUpper(u?.value || "User")}
                                          image={u?.avatar}
                                        />
                                      ))
                                    ) : (
                                      <span className="small text-muted">-</span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <span className="small text-muted">
                                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No Date"}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center py-4 text-muted">
                                No tasks created yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col lg="4">
                <Card className="card-bordered card-full">
                  <div className="card-inner">
                    <div className="card-title-group mb-3">
                      <div className="card-title">
                        <h6 className="title">Active Boards</h6>
                      </div>
                      <Link to="/app-kanban" className="link link-primary small fw-medium">
                        Manage &rarr;
                      </Link>
                    </div>

                    <div className="nk-tb-list is-compact">
                      {boardsList.length > 0 ? (
                        boardsList.map((board) => (
                          <div
                            key={board.id}
                            className="p-3 mb-2 rounded border bg-lighter d-flex align-items-center justify-content-between"
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge badge-dim bg-primary p-2 rounded">
                                <Icon name="layout" />
                              </span>
                              <div>
                                <h6 className="mb-0 fs-6">{board.title}</h6>
                                <span className="small text-muted">
                                  {board._count?.tasks ?? "Active"} tasks
                                </span>
                              </div>
                            </div>
                            <Link to="/app-kanban" className="btn btn-icon btn-trigger btn-sm">
                              <Icon name="chevron-right" />
                            </Link>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted">No boards found</div>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Block>
        )}
      </Content>
    </>
  );
};

export default Dashboard;
