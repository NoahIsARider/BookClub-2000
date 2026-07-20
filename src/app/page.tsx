'use client';

import { useState, useEffect, useCallback } from 'react';
import { demoApi, type RoomSummary } from '@/lib/bookclub-demo';

const developerLinkGroups = [
  {
    title: '开发者链接',
    links: [
      { label: '个人主页', href: 'https://noahisarider.github.io/' },
      { label: 'GitHub 主页', href: 'https://github.com/NoahIsARider' },
      { label: '豆瓣读书', href: 'https://www.douban.com/people/227017213/' },
    ],
  },
  {
    title: '其他项目',
    links: [
      { label: 'Geek RSS', href: 'https://geek-rss.vercel.app/' },
      { label: 'Ark RSS', href: 'https://ark-rss.vercel.app/' },
      { label: '神秘电子海洋生物', href: 'https://clawbot-triton.vercel.app/' },
    ],
  },
] as const;

export default function HomePage() {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create form
  const [newName, setNewName] = useState('');
  const [newBook, setNewBook] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newNickname, setNewNickname] = useState('');

  // Join form
  const [joinCode, setJoinCode] = useState('');
  const [joinNickname, setJoinNickname] = useState('');

  const fetchRooms = useCallback(async () => {
    try {
      setRooms(await demoApi.listRooms());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleCreate = async () => {
    if (!newName || !newBook || !newNickname) return;
    try {
      const room = await demoApi.createRoom({
        name: newName,
        book_title: newBook,
        author: newAuthor,
        description: newDesc,
        created_by: newNickname,
      });
      window.location.href = `/room/${room.id}?member=${encodeURIComponent(newNickname)}`;
    } catch {
      // ignore
    }
  };

  const handleJoin = async () => {
    if (!joinCode || !joinNickname) return;
    try {
      const room = await demoApi.findRoomByInviteCode(joinCode);
      if (!room) {
        alert('邀请码不存在，请检查后重试');
        return;
      }
      await demoApi.joinRoom(room.id, joinNickname);
      window.location.href = `/room/${room.id}?member=${encodeURIComponent(joinNickname)}`;
    } catch {
      // ignore
    }
  };

  const handleReset = async () => {
    if (!window.confirm('这会清空当前浏览器中的演示操作记录，并恢复默认示例数据。是否继续？')) {
      return;
    }

    await demoApi.reset();
    setShowCreate(false);
    setShowJoin(false);
    fetchRooms();
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Main Window */}
      <div className="win-window" style={{ width: '100%', maxWidth: 700 }}>
        {/* Title Bar */}
        <div className="win-title-bar">
          <span>BookClub 2000 - 共读俱乐部</span>
          <div style={{ display: 'flex', gap: 2 }}>
            <button className="win-title-button">_</button>
            <button className="win-title-button">□</button>
            <button className="win-title-button">×</button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="win-menu-bar">
          <span className="win-menu-item" onClick={() => { setShowCreate(false); setShowJoin(false); }}>文件(F)</span>
          <span className="win-menu-item" onClick={() => setShowCreate(true)}>新建房间(N)</span>
          <span className="win-menu-item" onClick={() => setShowJoin(true)}>加入房间(J)</span>
          <span className="win-menu-item">帮助(H)</span>
        </div>

        {/* Content */}
        <div style={{ padding: 8, background: '#D4D0C8' }}>
          {/* Welcome Panel */}
          <div className="win-panel-inset" style={{ padding: 12, marginBottom: 8, background: '#FFFFFF' }}>
            <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>
              欢迎来到 BookClub 2000
            </div>
            <div style={{ fontSize: 11, color: '#444' }}>
              演示版已切换为浏览器本地数据模式，可直接部署到 Vercel，无需数据库即可完整体验 UI 与交互
            </div>
          </div>

          {/* Create Room Dialog */}
          {showCreate && (
            <div className="win-window" style={{ marginBottom: 8 }}>
              <div className="win-title-bar">
                <span>新建读书房间</span>
                <button className="win-title-button" onClick={() => setShowCreate(false)}>×</button>
              </div>
              <div style={{ padding: 12, background: '#D4D0C8' }}>
                <table style={{ fontSize: 11, width: '100%' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '2px 4px', textAlign: 'right', width: 100 }}>你的昵称:</td>
                      <td><input className="win-input" style={{ width: '100%' }} value={newNickname} onChange={e => setNewNickname(e.target.value)} placeholder="输入昵称" /></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 4px', textAlign: 'right' }}>读书会名称:</td>
                      <td><input className="win-input" style={{ width: '100%' }} value={newName} onChange={e => setNewName(e.target.value)} placeholder="如：科幻读书会" /></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 4px', textAlign: 'right' }}>书名:</td>
                      <td><input className="win-input" style={{ width: '100%' }} value={newBook} onChange={e => setNewBook(e.target.value)} placeholder="如：三体" /></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 4px', textAlign: 'right' }}>作者:</td>
                      <td><input className="win-input" style={{ width: '100%' }} value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="如：刘慈欣" /></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 4px', textAlign: 'right', verticalAlign: 'top' }}>简介:</td>
                      <td><textarea className="win-textarea" style={{ width: '100%', height: 60 }} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="简要描述读书会..." /></td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ marginTop: 8, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                  <button className="win-button" onClick={() => setShowCreate(false)}>取消</button>
                  <button className="win-button" onClick={handleCreate} style={{ fontWeight: 'bold' }}>创建房间</button>
                </div>
              </div>
            </div>
          )}

          {/* Join Room Dialog */}
          {showJoin && (
            <div className="win-window" style={{ marginBottom: 8 }}>
              <div className="win-title-bar">
                <span>加入读书房间</span>
                <button className="win-title-button" onClick={() => setShowJoin(false)}>×</button>
              </div>
              <div style={{ padding: 12, background: '#D4D0C8' }}>
                <table style={{ fontSize: 11, width: '100%' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '2px 4px', textAlign: 'right', width: 100 }}>你的昵称:</td>
                      <td><input className="win-input" style={{ width: '100%' }} value={joinNickname} onChange={e => setJoinNickname(e.target.value)} placeholder="输入昵称" /></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 4px', textAlign: 'right' }}>邀请码:</td>
                      <td><input className="win-input" style={{ width: '100%', textTransform: 'uppercase', fontFamily: 'monospace', fontSize: 13, letterSpacing: 2 }} value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="输入6位邀请码" maxLength={6} /></td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ marginTop: 8, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                  <button className="win-button" onClick={() => setShowJoin(false)}>取消</button>
                  <button className="win-button" onClick={handleJoin} style={{ fontWeight: 'bold' }}>加入</button>
                </div>
              </div>
            </div>
          )}

          {/* Room List */}
          <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 'bold' }}>已有的读书房间:</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="win-button" onClick={handleReset} style={{ minWidth: 72 }}>重置演示</button>
              <button className="win-button" onClick={() => { setShowJoin(false); setShowCreate(!showCreate); }} style={{ minWidth: 60 }}>新建</button>
              <button className="win-button" onClick={() => { setShowCreate(false); setShowJoin(!showJoin); }} style={{ minWidth: 60 }}>加入</button>
            </div>
          </div>

          <div className="win-listbox" style={{ minHeight: 200, maxHeight: 400 }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#808080' }}>正在加载...</div>
            ) : rooms.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#808080' }}>
                暂无读书房间，点击上方"新建"创建第一个吧
              </div>
            ) : (
              rooms.map(room => (
                <RoomListItem key={room.id} room={room} />
              ))
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="win-status-bar">
          <div className="win-status-section">
            {rooms.length} 个读书房间 | Demo Mode
          </div>
          <div className="win-status-section" style={{ flex: 'none', width: 120, textAlign: 'center' }}>
            BookClub 2000 v1.0
          </div>
        </div>
      </div>

      <div className="win-window" style={{ width: '100%', maxWidth: 700 }}>
        <div className="win-title-bar win-title-bar-inactive">
          <span>关于开发者</span>
          <div style={{ display: 'flex', gap: 2 }}>
            <button className="win-title-button">_</button>
            <button className="win-title-button">□</button>
            <button className="win-title-button">×</button>
          </div>
        </div>

        <div style={{ padding: 12, background: '#D4D0C8' }}>
          <div style={{ fontSize: 11, marginBottom: 10, color: '#333333' }}>
            这个软件由 NoahIsARider 开发，欢迎继续浏览我的主页、代码仓库和其他项目。
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
            {developerLinkGroups.map(group => (
              <div key={group.title}>
                <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #808080' }}>
                  {group.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {group.links.map(link => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <span style={{ color: '#000000', textDecoration: 'none' }}>[&gt;</span>
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="win-status-bar">
          <div className="win-status-section" style={{ textAlign: 'center' }}>
            Made with love by NoahIsARider
          </div>
        </div>
      </div>
    </div>
  );
}

function RoomListItem({ room }: { room: RoomSummary }) {
  return (
    <a
      href={`/room/${room.id}`}
      className="win-listbox-item"
      style={{
        display: 'block',
        padding: '6px 8px',
        textDecoration: 'none',
        color: '#000000',
        borderBottom: '1px solid #E0E0E0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 2 }}>
            {room.book_title}
            {room.author && <span style={{ fontWeight: 'normal', color: '#666' }}> - {room.author}</span>}
          </div>
          <div style={{ fontSize: 11, color: '#444' }}>
            {room.name}
            {room.description && <span> | {room.description}</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
          <div style={{ fontSize: 10, color: '#808080' }}>
            邀请码:
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>
            {room.invite_code}
          </div>
        </div>
      </div>
    </a>
  );
}
