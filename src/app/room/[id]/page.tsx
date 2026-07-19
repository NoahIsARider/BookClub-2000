'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { demoApi, type Member, type ChapterSummary, type RoomDetail } from '@/lib/bookclub-demo';

function RoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.id as string;
  const memberParam = searchParams.get('member') || '';

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterContent, setNewChapterContent] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [joinNickname, setJoinNickname] = useState(memberParam);
  const [activeTab, setActiveTab] = useState<'chapters' | 'members'>('chapters');

  const fetchRoom = useCallback(async () => {
    try {
      setRoom(await demoApi.getRoom(roomId));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // Find current member
  useEffect(() => {
    if (room && memberParam) {
      const member = room.members.find(m => m.nickname === memberParam);
      if (member) setCurrentMember(member);
    }
  }, [room, memberParam]);

  const handleJoin = async () => {
    if (!joinNickname) return;
    try {
      await demoApi.joinRoom(roomId, joinNickname);
      window.location.href = `/room/${roomId}?member=${encodeURIComponent(joinNickname)}`;
    } catch {
      // ignore
    }
  };

  const handleAddChapter = async () => {
    if (!newChapterTitle || !newChapterContent) return;
    try {
      await demoApi.addChapter(roomId, { title: newChapterTitle, content: newChapterContent });
      setShowAddChapter(false);
      setNewChapterTitle('');
      setNewChapterContent('');
      fetchRoom();
    } catch {
      // ignore
    }
  };

  const handleExport = async () => {
    try {
      const exported = await demoApi.exportRoom(roomId);
      const blob = new Blob([exported.markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exported.book_title}-共读纪要.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', padding: 20, display: 'flex', justifyContent: 'center' }}>
        <div className="win-window" style={{ width: 400, padding: 20, textAlign: 'center' }}>
          <div className="win-title-bar" style={{ margin: '-2px -2px 10px -2px' }}>
            <span>加载中...</span>
          </div>
          <div style={{ padding: 20 }}>正在连接读书房间...</div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div style={{ minHeight: '100vh', padding: 20, display: 'flex', justifyContent: 'center' }}>
        <div className="win-window" style={{ width: 400 }}>
          <div className="win-title-bar" style={{ margin: '-2px -2px 0 -2px' }}>
            <span>错误</span>
          </div>
          <div style={{ padding: 20, textAlign: 'center', background: '#D4D0C8' }}>
            <div style={{ marginBottom: 12 }}>房间不存在或已被删除</div>
            <Link href="/" className="win-button" style={{ display: 'inline-block', textDecoration: 'none', color: '#000' }}>返回首页</Link>
          </div>
        </div>
      </div>
    );
  }

  // Not a member yet
  if (!currentMember && !showJoin) {
    return (
      <div style={{ minHeight: '100vh', padding: 20, display: 'flex', justifyContent: 'center' }}>
        <div className="win-window" style={{ width: 400 }}>
          <div className="win-title-bar" style={{ margin: '-2px -2px 0 -2px' }}>
            <span>{room.book_title} - {room.name}</span>
          </div>
          <div style={{ padding: 16, background: '#D4D0C8' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>
                {room.book_title}
                {room.author && <span style={{ fontWeight: 'normal' }}> - {room.author}</span>}
              </div>
              <div style={{ fontSize: 11, color: '#444' }}>{room.name}</div>
              {room.description && <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{room.description}</div>}
            </div>
            <div style={{ fontSize: 11, marginBottom: 8 }}>
              已有 {room.members.length} 位成员 | {room.chapters.length} 个章节
            </div>
            <div style={{ fontSize: 11, marginBottom: 8 }}>
              邀请码: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1 }}>{room.invite_code}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
              <Link href="/" className="win-button" style={{ display: 'inline-block', textDecoration: 'none', color: '#000' }}>返回</Link>
              <button className="win-button" onClick={() => setShowJoin(true)} style={{ fontWeight: 'bold' }}>加入读书会</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Join dialog
  if (!currentMember && showJoin) {
    return (
      <div style={{ minHeight: '100vh', padding: 20, display: 'flex', justifyContent: 'center' }}>
        <div className="win-window" style={{ width: 350 }}>
          <div className="win-title-bar" style={{ margin: '-2px -2px 0 -2px' }}>
            <span>加入读书会</span>
          </div>
          <div style={{ padding: 16, background: '#D4D0C8' }}>
            <div style={{ fontSize: 11, marginBottom: 8 }}>请输入你的昵称:</div>
            <input
              className="win-input"
              style={{ width: '100%', marginBottom: 8 }}
              value={joinNickname}
              onChange={e => setJoinNickname(e.target.value)}
              placeholder="你的昵称"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleJoin(); }}
            />
            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
              <button className="win-button" onClick={() => setShowJoin(false)}>取消</button>
              <button className="win-button" onClick={handleJoin} style={{ fontWeight: 'bold' }}>确认加入</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: 8 }}>
      {/* Main Window */}
      <div className="win-window" style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Title Bar */}
        <div className="win-title-bar">
          <span>{room.book_title} - {room.name}</span>
          <div style={{ display: 'flex', gap: 2 }}>
            <button className="win-title-button">_</button>
            <button className="win-title-button">□</button>
            <button className="win-title-button">×</button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="win-menu-bar">
          <span className="win-menu-item"><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>首页</Link></span>
          <span className="win-menu-item" onClick={() => setShowAddChapter(true)}>添加章节</span>
          <span className="win-menu-item" onClick={handleExport}>导出纪要</span>
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', minHeight: 500 }}>
          {/* Left Panel - Chapter List */}
          <div style={{ width: 220, borderRight: '1px solid #808080', background: '#D4D0C8' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #808080' }}>
              <div
                className={`win-tab ${activeTab === 'chapters' ? 'win-tab-active' : ''}`}
                onClick={() => setActiveTab('chapters')}
                style={{ flex: 1, textAlign: 'center' }}
              >
                章节
              </div>
              <div
                className={`win-tab ${activeTab === 'members' ? 'win-tab-active' : ''}`}
                onClick={() => setActiveTab('members')}
                style={{ flex: 1, textAlign: 'center' }}
              >
                成员
              </div>
            </div>

            <div style={{ padding: 4, maxHeight: 440, overflowY: 'auto' }}>
              {activeTab === 'chapters' ? (
                <>
                  {room.chapters.length === 0 ? (
                    <div style={{ padding: 12, textAlign: 'center', color: '#808080', fontSize: 11 }}>
                      暂无章节<br />点击上方"添加章节"
                    </div>
                  ) : (
                    room.chapters.map((ch: ChapterSummary, idx) => (
                      <a
                        key={ch.id}
                        href={`/room/${roomId}/chapter/${ch.id}?member=${encodeURIComponent(currentMember?.nickname || '')}`}
                        className="win-tree-item"
                        style={{ textDecoration: 'none', color: '#000' }}
                      >
                        <span style={{ fontSize: 10 }}>📖</span>
                        <span>{idx + 1}. {ch.title}</span>
                      </a>
                    ))
                  )}
                </>
              ) : (
                <>
                  <div style={{ padding: '4px 2px', fontSize: 11, fontWeight: 'bold', borderBottom: '1px solid #C0C0C0', marginBottom: 4 }}>
                    当前身份:
                  </div>
                  <div className="win-tree-item selected" style={{ marginBottom: 4 }}>
                    <span style={{
                      display: 'inline-block', width: 8, height: 8,
                      background: currentMember?.color || '#000', borderRadius: '50%'
                    }} />
                    <span>{currentMember?.nickname}</span>
                  </div>
                  <div style={{ padding: '4px 2px', fontSize: 11, fontWeight: 'bold', borderBottom: '1px solid #C0C0C0', marginBottom: 4, marginTop: 8 }}>
                    全部成员 ({room.members.length}):
                  </div>
                  {room.members.map(m => (
                    <div key={m.id} className="win-tree-item">
                      <span style={{
                        display: 'inline-block', width: 8, height: 8,
                        background: m.color, borderRadius: '50%'
                      }} />
                      <span>{m.nickname}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Main Content */}
          <div style={{ flex: 1, background: '#FFFFFF', position: 'relative' }}>
            <div className="win-panel-inset" style={{ margin: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Book Info */}
              <div style={{ padding: 12, borderBottom: '1px solid #C0C0C0' }}>
                <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
                  {room.book_title}
                </div>
                {room.author && (
                  <div style={{ fontSize: 11, color: '#666' }}>作者: {room.author}</div>
                )}
                {room.description && (
                  <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>{room.description}</div>
                )}
                <div style={{ fontSize: 10, color: '#808080', marginTop: 4 }}>
                  邀请码: {room.invite_code} | {room.members.length} 位成员 | {room.chapters.length} 个章节 | 本地演示数据
                </div>
              </div>

              {/* Welcome / Instructions */}
              <div style={{ padding: 16, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>使用说明</div>
                <div style={{ fontSize: 11, lineHeight: 1.8 }}>
                  <div>1. 点击左侧"添加章节"上传书目内容（支持粘贴文本）</div>
                  <div>2. 点击章节进入阅读视图</div>
                  <div>3. 在阅读视图中选中文本，添加批注</div>
                  <div>4. 在讨论区按章节展开讨论</div>
                  <div>5. 点击"导出纪要"下载 Markdown 格式的讨论记录</div>
                </div>

                {room.chapters.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>章节目录</div>
                    {room.chapters.map((ch, idx) => (
                      <a
                        key={ch.id}
                        href={`/room/${roomId}/chapter/${ch.id}?member=${encodeURIComponent(currentMember?.nickname || '')}`}
                        style={{
                          display: 'block', padding: '4px 8px', marginBottom: 2,
                          textDecoration: 'none', color: '#0000FF', fontSize: 11,
                          background: '#F0F0F0',
                          border: '1px solid #E0E0E0',
                        }}
                      >
                        第{idx + 1}章: {ch.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="win-status-bar">
          <div className="win-status-section">
            当前用户: {currentMember?.nickname}
          </div>
          <div className="win-status-section" style={{ flex: 'none', width: 120, textAlign: 'center' }}>
            {room.chapters.length} 章节
          </div>
        </div>
      </div>

      {/* Add Chapter Dialog */}
      {showAddChapter && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
        }}>
          <div className="win-window" style={{ width: 500, maxHeight: '80vh' }}>
            <div className="win-title-bar">
              <span>添加章节</span>
              <button className="win-title-button" onClick={() => setShowAddChapter(false)}>×</button>
            </div>
            <div style={{ padding: 12, background: '#D4D0C8' }}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>章节标题:</label>
                <input
                  className="win-input"
                  style={{ width: '100%' }}
                  value={newChapterTitle}
                  onChange={e => setNewChapterTitle(e.target.value)}
                  placeholder="如：第一章 宇宙闪烁"
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>章节内容:</label>
                <textarea
                  className="win-textarea"
                  style={{ width: '100%', height: 250 }}
                  value={newChapterContent}
                  onChange={e => setNewChapterContent(e.target.value)}
                  placeholder="粘贴或输入章节文本内容..."
                />
              </div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <button className="win-button" onClick={() => setShowAddChapter(false)}>取消</button>
                <button className="win-button" onClick={handleAddChapter} style={{ fontWeight: 'bold' }}>添加</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>加载中...</div>}>
      <RoomContent />
    </Suspense>
  );
}
