import Link from 'next/link';
import { readingLog, readingLogStats } from '@/lib/reading-log';

function Stars({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span style={{ color: '#808080' }}>—</span>;
  }
  return (
    <span style={{ color: '#C08000', letterSpacing: 1, fontSize: 12 }}>
      {'★'.repeat(rating)}
      <span style={{ color: '#C0C0C0' }}>{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

function RatingCell({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span style={{ color: '#808080', fontSize: 10 }}>unrated</span>;
  }
  return <Stars rating={rating} />;
}

const dist = readingLogStats.distribution;

export default function ReadingLogPage() {
  return (
    <div style={{ minHeight: '100vh', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Main Window */}
      <div className="win-window" style={{ width: '100%', maxWidth: 860 }}>
        {/* Title Bar */}
        <div className="win-title-bar">
          <span>BookClub 2000 - Reading Log</span>
          <div style={{ display: 'flex', gap: 2 }}>
            <button className="win-title-button">_</button>
            <button className="win-title-button">□</button>
            <button className="win-title-button">×</button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="win-menu-bar">
          <span className="win-menu-item">
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          </span>
          <span className="win-menu-item">
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Co-reading</Link>
          </span>
          <span className="win-menu-item" style={{ background: '#0A246A', color: '#FFFFFF' }}>Reading Log</span>
          <span className="win-menu-item">Help</span>
        </div>

        {/* Content */}
        <div style={{ padding: 8, background: '#D4D0C8' }}>
          {/* Stats Panel */}
          <div className="win-panel-inset" style={{ padding: 10, marginBottom: 8, background: '#FFFFFF' }}>
            <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 6 }}>
              Personal reading log
            </div>
            <div style={{ fontSize: 11, color: '#444', marginBottom: 8 }}>
              {readingLogStats.total} books logged · {readingLogStats.rated} rated · average{' '}
              {readingLogStats.averageRating.toFixed(2)} / 5 · exported from Douban on 2026-08-11
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#333', flexWrap: 'wrap' }}>
              {([5, 4, 3, 2, 1] as const).map(r => (
                <span key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#C08000' }}>{'★'.repeat(r)}</span>
                  <span>{dist[r]}</span>
                </span>
              ))}
              <span style={{ color: '#808080' }}>unrated {readingLogStats.total - readingLogStats.rated}</span>
            </div>
          </div>

          {/* Book List */}
          <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 'bold' }}>Books ({readingLogStats.total}):</span>
            <span style={{ fontSize: 10, color: '#808080' }}>sorted by date read, newest first</span>
          </div>

          <div className="win-listbox" style={{ minHeight: 200, maxHeight: 560, overflowY: 'auto' }}>
            {readingLog.map((book, idx) => (
              <div
                key={book.url + idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '6px 8px',
                  borderBottom: '1px solid #E0E0E0',
                  background: idx % 2 === 0 ? '#FFFFFF' : '#F8F8F0',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 1 }}>
                    <a
                      href={book.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#0000FF', textDecoration: 'underline' }}
                    >
                      {book.title}
                    </a>
                  </div>
                  <div style={{ fontSize: 11, color: '#444' }}>
                    {book.author || 'Unknown author'}
                    {book.published && <span style={{ color: '#808080' }}> · {book.published}</span>}
                  </div>
                  {book.note && (
                    <div style={{ fontSize: 11, color: '#333', marginTop: 2, fontStyle: 'italic' }}>
                      &quot;{book.note}&quot;
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <RatingCell rating={book.rating} />
                  <div style={{ fontSize: 10, color: '#808080', marginTop: 2 }}>
                    {book.dateRead || 'date unknown'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Bar */}
        <div className="win-status-bar">
          <div className="win-status-section">
            {readingLogStats.total} books | Reading log
          </div>
          <div className="win-status-section" style={{ flex: 'none', width: 140, textAlign: 'center' }}>
            BookClub 2000 v1.1
          </div>
        </div>
      </div>
    </div>
  );
}
