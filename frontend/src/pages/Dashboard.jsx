import React, { useState, useEffect } from 'react';
import {
  Layout, Row, Col, Card, Statistic, Timeline,
  Table, Tag, Progress, Typography
} from 'antd';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ProjectOutlined,
  UserOutlined
} from '@ant-design/icons';
// import axios from 'axios';

const { Title, Text } = Typography;
const { Content } = Layout;

const HomePage = () => {
  const [taskStats, setTaskStats] = useState({
    total_tasks: 0,
    task_breakdown: {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0
    }
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [userActivities, setUserActivities] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, tasksResponse, activitiesResponse] = await Promise.all([
          axios.get('/api/tasks/stats/'),
          axios.get('/api/tasks/?limit=5&ordering=-created_at'),
          axios.get('/api/user/activities/')  // Assumed endpoint for user activities
        ]);

        setTaskStats(statsResponse.data);
        setRecentTasks(tasksResponse.data);
        setUserActivities(activitiesResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      }
    };

    fetchDashboardData();
  }, []);

  // Recent Tasks Table Columns
  const taskColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          'TODO': 'blue',
          'IN_PROGRESS': 'orange',
          'DONE': 'green'
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      }
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
    }
  ];

  // Ensure task_breakdown is defined
  const { task_breakdown = {} } = taskStats;
  const { TODO = 0, IN_PROGRESS = 0, DONE = 0 } = task_breakdown;

  return (
    <Layout style={{ minHeight: '100vh', background: 'white' }}>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        {/* Page Header */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                Dashboard Overview
              </Title>
              <Text type="secondary">Welcome to your productivity hub</Text>
            </Card>
          </Col>
        </Row>

        {/* Task Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Tasks"
                value={taskStats.total_tasks}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <Progress
                percent={
                  taskStats.total_tasks > 0
                    ? (DONE / taskStats.total_tasks * 100).toFixed(0)
                    : 0
                }
                status="active"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tasks in Progress"
                value={IN_PROGRESS}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#orange' }}
              />
              <Progress
                percent={
                  taskStats.total_tasks > 0
                    ? (IN_PROGRESS / taskStats.total_tasks * 100).toFixed(0)
                    : 0
                }
                status="active"
                strokeColor="#orange"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Completed Tasks"
                value={DONE}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <Progress
                percent={
                  taskStats.total_tasks > 0
                    ? (DONE / taskStats.total_tasks * 100).toFixed(0)
                    : 0
                }
                status="success"
              />
            </Card>
          </Col>
        </Row>

        {/* Recent Tasks and User Activities */}
        <Row gutter={16}>
          <Col span={14}>
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                    <ProjectOutlined /> Recent Tasks
                  </Title>
                </div>
              }
            >
              <Table
                columns={taskColumns}
                dataSource={recentTasks}
                rowKey="_id"
                pagination={false}
              />
            </Card>
          </Col>
          <Col span={10}>
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                    <UserOutlined /> Recent Activities
                  </Title>
                </div>
              }
            >
              <Timeline
                items={Array.isArray(userActivities) ? userActivities.map((activity, index) => ({
                  key: index,
                  color:
                    activity.type === 'task_completed' ? 'green' :
                    activity.type === 'task_created' ? 'blue' :
                    'gray',
                  children: (
                    <>
                      {activity.description} <Text type="secondary">{activity.timestamp}</Text>
                    </>
                  )
                })) : []}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default HomePage;
