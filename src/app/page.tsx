'use client';

import { useState, useEffect, useCallback } from 'react';
import { demoApi, type RoomSummary } from '@/lib/bookclub-demo';

const developerLinkGroups = [
  {
    title: 'Developer Links',
    links: [
      { label: 'Personal Page', href: 'https://noahisarider.github.io/' },
      { label: 'GitHub Profile', href: 'https://github.com/NoahIsARider' },
      { label: 'Douban Reading', href: 'https://www.douban.com/people/227017213/' },
    ],
  },
  {
    title: 'Other Projects',
    links: [
      { label: 'Geek RSS', href: 'https://geek-rss.vercel.app/' },
      { label: 'Ark RSS', href: 'https://ark-rss.vercel.app/' },
      { label: 'ClawBot Triton', href: 'https://clawbot-triton.vercel.app/' },
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
        alert('Invite code not found. Please check and try again.');
        return;
      }
      await demoApi.joinRoom(room.id, joinNickname);
      window.location.href = `/room/${room.id}?member=${encodeURIComponent(joinNickname)}`;
    } catch {
      // ignore
    }
  };

  const handleReset = async () => {
    if (!window.confirm('This clears the demo data in your browser and restores the default sample rooms. Continue?')) {
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
          <span>BookClub 2000 - Co-reading Club</span>
          <div style={{ display: 'flex', gap: 2 }}>
            <button className="win-title-button">_</button>
            <button className="win-title-button">□</button>
            <button className="win-title-button">×</button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="win-menu-bar">
          <span className="win-menu-item" onClick={() => { setShowCreate(false); setShowJoin(false); }}>File(F)</span>
          <span className="win-menu-item" onClick={() => setShowCreate(true)}>New Room(N)</span>
          <span className="win-menu-item" onClick={() => setShowJoin(true)}>Join Room(J)</span>
          <span className="win-menu-item"><a href="/reading-log" style={{ color: 'inherit', textDecoration: 'none' }}>Reading Log(L)</a></span>
          <span className="win-menu-item">Help(H)</span>
        </div>

        {/* Content */}
        <div style={{ padding: 8, background: '#D4D0C8' }}>
          {/* Welcome Panel */}
          <div className="win-panel-inset" style={{ padding: 12, marginBottom: 8, background: '#FFFFFF' }}>
            <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>
              Welcome to BookClub 2000
            </div>
            <div style={{ fontSize: 11, color: '#444' }}>
              Demo mode runs entirely in your browser (localStorage) — deploy to Vercel with no database.
              This site also hosts my personal reading log — see the Reading Log tab. 📚
            </div>
          </div>

          {/* Create Room Dialog */}
          {showCreate && (
            <div className="win-window" style={{ marginBottom: 8 }}>
              <div className="win-title-bar">
                <span>New Reading Room</span>
                <button className="win-title-button" onClick={() => setShowCreate(false)}>×</button>
              </div>
              <div style={{ padding: 12, background: '#D4D0C8' }}>
                <table style={{ fontSize: 11, width: '100%' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '2px 4px', textAlign: 'right', width: 100 }}>Your nickname:</td>
                      <td><input className="win-input" style={{ width: '100%' }} value={newNickname} onChange={e => setNewNickname(e.target.value)} placeholder="Enter nickname" /></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 4px', textAlign: 'right' }}>Club name:</td>
                      <td><input className="win-input" style={{ width: '100%' }} value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Sci-Fi Book Club" /></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 4px', textAlign: 'right' }}>Book title:</td>
                      <td><input className="win-input" style={{ width: '100%' }} value={newBook} onChange={e => setNewBook(e.target.value)} placeholder="e.g. Dune" /></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 4px', textAlign: 'right' }}>Author:</td>
                      <td><input className="win-input" style={{ width: '100%' }} value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="e.g. Frank Herbert" /></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 4px', textAlign: 'right', verticalAlign: 'top' }}>Description:</td>
                      <td><textarea className="win-textarea" style={{ width: '100%', height: 60 }} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Briefly describe the club..." /></td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ marginTop: 8, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                  <button className="win-button" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button className="win-button" onClick={handleCreate} style={{ fontWeight: 'bold' }}>Create Room</button>
                </div>
              </div>
            </div>
          )}

          {/* Join Room Dialog */}
          {showJoin && (
            <div className="win-window" style={{ marginBottom: 8 }}>
              <div className="win-title-bar">
                <span>Join Reading Room</span>
                <button className="win-title-button" onClick={() => setShowJoin(false)}>×</button>
              </div>
              <div style={{ padding: 12, background: '#D4D0C8' }}>
                <table style={{ fontSize: 11, width: '100%' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '2px 4px', textAlign: 'right', width: 100 }}>Your nickname:</td>
                      <td><input className="win-input" style={{ width: '100%' }} value={joinNickname} onChange={e => setJoinNickname(e.target.value)} placeholder="Enter nickname" /></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 4px', textAlign: 'right' }}>Invite code:</td>
                      <td><input className="win-input" style={{ width: '100%', textTransform: 'uppercase', fontFamily: 'monospace', fontSize: 13, letterSpacing: 2 }} value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter 6-digit code" maxLength={6} /></td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ marginTop: 8, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                  <button className="win-button" onClick={() => setShowJoin(false)}>Cancel</button>
                  <button className="win-button" onClick={handleJoin} style={{ fontWeight: 'bold' }}>Join</button>
                </div>
              </div>
            </div>
          )}

          {/* Room List */}
          <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 'bold' }}>Existing reading rooms:</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="win-button" onClick={handleReset} style={{ minWidth: 72 }}>Reset Demo</button>
              <button className="win-button" onClick={() => { setShowJoin(false); setShowCreate(!showCreate); }} style={{ minWidth: 60 }}>New</button>
              <button className="win-button" onClick={() => { setShowCreate(false); setShowJoin(!showJoin); }} style={{ minWidth: 60 }}>Join</button>
            </div>
          </div>

          <div className="win-listbox" style={{ minHeight: 200, maxHeight: 400 }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#808080' }}>Loading...</div>
            ) : rooms.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#808080' }}>
                No rooms yet — click "New" above to create the first one
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
            {rooms.length} reading rooms | Demo Mode
          </div>
          <div className="win-status-section" style={{ flex: 'none', width: 120, textAlign: 'center' }}>
            BookClub 2000 v1.1
          </div>
        </div>
      </div>

      <div className="win-window" style={{ width: '100%', maxWidth: 700 }}>
        <div className="win-title-bar win-title-bar-inactive">
          <span>About the Developer</span>
          <div style={{ display: 'flex', gap: 2 }}>
            <button className="win-title-button">_</button>
            <button className="win-title-button">□</button>
            <button className="win-title-button">×</button>
          </div>
        </div>

        <div style={{ padding: 12, background: '#D4D0C8' }}>
          <div style={{ fontSize: 11, marginBottom: 10, color: '#333333' }}>
            This software is built by NoahIsARider. Feel free to browse my personal page, code repositories and other projects.
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
            Invite code:
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>
            {room.invite_code}
          </div>
        </div>
      </div>
    </a>
  );
}
