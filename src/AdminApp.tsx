import { FormEvent, useEffect, useMemo, useState } from 'react';

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type Announcement = {
  id: number;
  title: string;
  content: string;
  published: number;
  created_at: string;
  updated_at: string;
};

type Stats = {
  managedUserCount: number;
  activeUserCount: number;
  publishedAnnouncementCount: number;
};

const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE || 'http://localhost:3100').replace(/\/$/, '');

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `请求失败(${res.status})`;
    try {
      const payload = await res.json();
      if (payload?.message) message = payload.message;
    } catch {}
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export default function AdminApp() {
  const [token, setToken] = useState<string>('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123456');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('editor');
  const [userStatus, setUserStatus] = useState('active');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePublished, setNoticePublished] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginReady = useMemo(() => username.trim() && password.trim(), [username, password]);

  async function loadAll(nextToken: string) {
    const [s, u, a] = await Promise.all([
      request<Stats>('/api/admin/dashboard/stats', {}, nextToken),
      request<AdminUser[]>('/api/admin/users', {}, nextToken),
      request<Announcement[]>('/api/admin/announcements', {}, nextToken),
    ]);
    setStats(s);
    setUsers(u);
    setAnnouncements(a);
  }

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    if (!saved) return;
    setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    loadAll(token)
      .catch((err: Error) => {
        setError(err.message);
        setToken('');
        localStorage.removeItem('admin_token');
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    if (!loginReady) return;
    setLoading(true);
    setError('');
    try {
      const data = await request<{ token: string }>('/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setToken(data.token);
      localStorage.setItem('admin_token', data.token);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onLogout() {
    if (!token) return;
    try {
      await request('/api/admin/auth/logout', { method: 'POST' }, token);
    } catch {}
    setToken('');
    setStats(null);
    setUsers([]);
    setAnnouncements([]);
    localStorage.removeItem('admin_token');
  }

  async function createUser(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      setError('');
      await request('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ name: userName, email: userEmail, role: userRole, status: userStatus }),
      }, token);
      setUserName('');
      setUserEmail('');
      await loadAll(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function toggleUserStatus(user: AdminUser) {
    if (!token) return;
    try {
      const next = user.status === 'active' ? 'disabled' : 'active';
      await request(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: next }),
      }, token);
      await loadAll(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function removeUser(id: number) {
    if (!token) return;
    try {
      await request(`/api/admin/users/${id}`, { method: 'DELETE' }, token);
      await loadAll(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function createAnnouncement(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      await request('/api/admin/announcements', {
        method: 'POST',
        body: JSON.stringify({ title: noticeTitle, content: noticeContent, published: noticePublished }),
      }, token);
      setNoticeTitle('');
      setNoticeContent('');
      setNoticePublished(false);
      await loadAll(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function toggleAnnouncement(item: Announcement) {
    if (!token) return;
    try {
      await request(`/api/admin/announcements/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ published: !item.published }),
      }, token);
      await loadAll(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function removeAnnouncement(id: number) {
    if (!token) return;
    try {
      await request(`/api/admin/announcements/${id}`, { method: 'DELETE' }, token);
      await loadAll(token);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <h1>后台管理系统</h1>
      <p>API Base: {API_BASE}</p>
      {error && <p style={{ color: '#c00' }}>错误：{error}</p>}

      {!token ? (
        <form onSubmit={onLogin} style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
          <h2>管理员登录</h2>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="用户名" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" />
          <button type="submit" disabled={!loginReady || loading}>登录</button>
        </form>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>控制台</h2>
            <button onClick={onLogout}>退出登录</button>
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', marginBottom: 20 }}>
            <div style={{ border: '1px solid #ddd', padding: 12 }}>
              <div>管理用户总数</div>
              <strong>{stats?.managedUserCount ?? (loading ? '...' : 0)}</strong>
            </div>
            <div style={{ border: '1px solid #ddd', padding: 12 }}>
              <div>活跃用户</div>
              <strong>{stats?.activeUserCount ?? (loading ? '...' : 0)}</strong>
            </div>
            <div style={{ border: '1px solid #ddd', padding: 12 }}>
              <div>已发布公告</div>
              <strong>{stats?.publishedAnnouncementCount ?? (loading ? '...' : 0)}</strong>
            </div>
          </div>

          <section style={{ marginBottom: 24 }}>
            <h3>用户管理</h3>
            <form onSubmit={createUser} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <input required placeholder="姓名" value={userName} onChange={(e) => setUserName(e.target.value)} />
              <input required placeholder="邮箱" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
              <select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
                <option value="editor">editor</option>
                <option value="admin">admin</option>
                <option value="viewer">viewer</option>
              </select>
              <select value={userStatus} onChange={(e) => setUserStatus(e.target.value)}>
                <option value="active">active</option>
                <option value="disabled">disabled</option>
              </select>
              <button type="submit">新增用户</button>
            </form>
            <table width="100%" cellPadding={6} style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th align="left">ID</th>
                  <th align="left">姓名</th>
                  <th align="left">邮箱</th>
                  <th align="left">角色</th>
                  <th align="left">状态</th>
                  <th align="left">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderTop: '1px solid #eee' }}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.status}</td>
                    <td>
                      <button onClick={() => toggleUserStatus(u)}>切换状态</button>{' '}
                      <button onClick={() => removeUser(u.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h3>公告管理</h3>
            <form onSubmit={createAnnouncement} style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
              <input required placeholder="公告标题" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} />
              <textarea required placeholder="公告内容" value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} rows={3} />
              <label>
                <input type="checkbox" checked={noticePublished} onChange={(e) => setNoticePublished(e.target.checked)} /> 立即发布
              </label>
              <button type="submit">发布公告</button>
            </form>
            <table width="100%" cellPadding={6} style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th align="left">ID</th>
                  <th align="left">标题</th>
                  <th align="left">状态</th>
                  <th align="left">操作</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((a) => (
                  <tr key={a.id} style={{ borderTop: '1px solid #eee' }}>
                    <td>{a.id}</td>
                    <td>{a.title}</td>
                    <td>{a.published ? '已发布' : '草稿'}</td>
                    <td>
                      <button onClick={() => toggleAnnouncement(a)}>{a.published ? '设为草稿' : '发布'}</button>{' '}
                      <button onClick={() => removeAnnouncement(a.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
