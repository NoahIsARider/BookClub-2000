'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  demoApi,
  type AnnotationView,
  type DiscussionReply,
  type DiscussionThread,
  type ChapterDetail,
  type Member,
} from '@/lib/bookclub-demo';

function ChapterContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chapterId = params.chapterId as string;
  const roomId = params.id as string;
  const memberName = searchParams.get('member') || '';

  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationView[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'annotations' | 'discussion'>('annotations');

  // Annotation form
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [annotationComment, setAnnotationComment] = useState('');
  const [selStart, setSelStart] = useState(0);
  const [selEnd, setSelEnd] = useState(0);

  // Discussion form
  const [newDiscussion, setNewDiscussion] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Selected annotation detail
  const [selectedAnnotation, setSelectedAnnotation] = useState<AnnotationView | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  const fetchChapter = useCallback(async () => {
    try {
      setChapter(await demoApi.getChapter(chapterId));
    } catch { /* ignore */ }
  }, [chapterId]);

  const fetchAnnotations = useCallback(async () => {
    try {
      setAnnotations(await demoApi.listAnnotations(chapterId));
    } catch { /* ignore */ }
  }, [chapterId]);

  const fetchDiscussions = useCallback(async () => {
    try {
      setDiscussions(await demoApi.listDiscussions(chapterId));
    } catch { /* ignore */ }
  }, [chapterId]);

  const fetchMember = useCallback(async () => {
    if (!memberName || !roomId) return;
    try {
      const room = await demoApi.getRoom(roomId);
      if (room?.members) {
        const m = room.members.find((mem: Member) => mem.nickname === memberName);
        if (m) setMember(m);
      }
    } catch { /* ignore */ }
  }, [memberName, roomId]);

  useEffect(() => {
    Promise.all([fetchChapter(), fetchAnnotations(), fetchDiscussions(), fetchMember()])
      .finally(() => setLoading(false));
  }, [fetchChapter, fetchAnnotations, fetchDiscussions, fetchMember]);

  // Handle text selection
  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !contentRef.current) return;

    const text = selection.toString().trim();
    if (!text) return;

    // Calculate offset within the content
    const range = selection.getRangeAt(0);
    const preRange = document.createRange();
    preRange.selectNodeContents(contentRef.current);
    preRange.setEnd(range.startContainer, range.startOffset);
    const startOffset = preRange.toString().length;
    const endOffset = startOffset + text.length;

    setSelectedText(text);
    setSelStart(startOffset);
    setSelEnd(endOffset);
    setShowAnnotationForm(true);
    setAnnotationComment('');
  };

  const handleAddAnnotation = async () => {
    if (!member || !annotationComment || !selectedText) return;
    try {
      await demoApi.addAnnotation(chapterId, {
        member_id: member.id,
        selected_text: selectedText,
        comment: annotationComment,
        start_offset: selStart,
        end_offset: selEnd,
      });
      setShowAnnotationForm(false);
      setSelectedText('');
      setAnnotationComment('');
      window.getSelection()?.removeAllRanges();
      fetchAnnotations();
    } catch { /* ignore */ }
  };

  const handleAddDiscussion = async () => {
    if (!member || !newDiscussion) return;
    try {
      await demoApi.addDiscussion(chapterId, {
        member_id: member.id,
        content: newDiscussion,
      });
      setNewDiscussion('');
      fetchDiscussions();
    } catch { /* ignore */ }
  };

  const handleReply = async (parentId: string) => {
    if (!member || !replyContent) return;
    try {
      await demoApi.addDiscussion(chapterId, {
        member_id: member.id,
        content: replyContent,
        parent_id: parentId,
      });
      setReplyingTo(null);
      setReplyContent('');
      fetchDiscussions();
    } catch { /* ignore */ }
  };

  // Render content with annotation highlights
  const renderContent = () => {
    if (!chapter) return null;
    const content = chapter.content;

    if (annotations.length === 0) {
      return <span>{content}</span>;
    }

    // Sort annotations by start_offset
    const sorted = [...annotations].sort((a, b) => a.start_offset - b.start_offset);
    const parts: Array<{ text: string; annotation?: AnnotationView }> = [];
    let lastEnd = 0;

    for (const ann of sorted) {
      if (ann.start_offset < 0 || ann.end_offset > content.length) continue;
      if (ann.start_offset > lastEnd) {
        parts.push({ text: content.slice(lastEnd, ann.start_offset) });
      }
      if (ann.start_offset >= lastEnd) {
        parts.push({
          text: content.slice(ann.start_offset, ann.end_offset),
          annotation: ann,
        });
        lastEnd = ann.end_offset;
      }
    }
    if (lastEnd < content.length) {
      parts.push({ text: content.slice(lastEnd) });
    }

    return parts.map((part, idx) =>
      part.annotation ? (
        <span
          key={idx}
          className="annotation-highlight"
          title={`${part.annotation.room_members.nickname}: ${part.annotation.comment}`}
          onClick={() => setSelectedAnnotation(part.annotation!)}
          style={{ borderBottom: `2px solid ${part.annotation.room_members.color}` }}
        >
          {part.text}
        </span>
      ) : (
        <span key={idx}>{part.text}</span>
      )
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', padding: 20, textAlign: 'center' }}>
        <div className="win-window" style={{ width: 300, margin: '0 auto', padding: 20 }}>
          正在加载章节...
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div style={{ minHeight: '100vh', padding: 20, textAlign: 'center' }}>
        <div className="win-window" style={{ width: 300, margin: '0 auto' }}>
          <div className="win-title-bar"><span>错误</span></div>
          <div style={{ padding: 20, background: '#D4D0C8' }}>章节不存在</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: 8 }}>
      <div className="win-window" style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Title Bar */}
        <div className="win-title-bar">
          <span>{chapter.title} - 阅读视图</span>
          <div style={{ display: 'flex', gap: 2 }}>
            <button className="win-title-button">_</button>
            <button className="win-title-button">□</button>
            <button className="win-title-button">×</button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="win-menu-bar">
          <span className="win-menu-item">
            <Link href={`/room/${roomId}?member=${encodeURIComponent(memberName)}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              ← 返回房间
            </Link>
          </span>
          <span className="win-menu-item" onClick={() => setActiveTab('annotations')}>批注</span>
          <span className="win-menu-item" onClick={() => setActiveTab('discussion')}>讨论</span>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'flex', minHeight: 550 }}>
          {/* Left: Reading Area */}
          <div style={{ flex: 1, borderRight: '1px solid #808080', display: 'flex', flexDirection: 'column' }}>
            {/* Chapter Title */}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #C0C0C0', background: '#D4D0C8' }}>
              <div style={{ fontSize: 13, fontWeight: 'bold' }}>{chapter.title}</div>
              <div style={{ fontSize: 10, color: '#808080' }}>
                {member && <span>当前用户: <span style={{ color: member.color, fontWeight: 'bold' }}>{member.nickname}</span> | </span>}
                选中文本可添加批注 | {annotations.length} 条批注
              </div>
            </div>

            {/* Content */}
            <div
              ref={contentRef}
              onMouseUp={handleTextSelect}
              style={{
                flex: 1, padding: 16, overflowY: 'auto',
                background: '#FFFFFF',
                fontFamily: "'SimSun', 'Songti SC', serif",
                fontSize: 14,
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                cursor: 'text',
              }}
            >
              {renderContent()}
            </div>
          </div>

          {/* Right: Annotations & Discussion Panel */}
          <div style={{ width: 320, display: 'flex', flexDirection: 'column', background: '#D4D0C8' }}>
            {/* Panel Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #808080' }}>
              <div
                className={`win-tab ${activeTab === 'annotations' ? 'win-tab-active' : ''}`}
                onClick={() => setActiveTab('annotations')}
                style={{ flex: 1, textAlign: 'center' }}
              >
                批注 ({annotations.length})
              </div>
              <div
                className={`win-tab ${activeTab === 'discussion' ? 'win-tab-active' : ''}`}
                onClick={() => setActiveTab('discussion')}
                style={{ flex: 1, textAlign: 'center' }}
              >
                讨论 ({discussions.length})
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 4 }}>
              {activeTab === 'annotations' ? (
                <AnnotationsPanel
                  annotations={annotations}
                  selectedAnnotation={selectedAnnotation}
                  onSelectAnnotation={setSelectedAnnotation}
                />
              ) : (
                <DiscussionPanel
                  discussions={discussions}
                  member={member}
                  newDiscussion={newDiscussion}
                  setNewDiscussion={setNewDiscussion}
                  onAddDiscussion={handleAddDiscussion}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  onReply={handleReply}
                />
              )}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="win-status-bar">
          <div className="win-status-section">
            {annotations.length} 条批注 | {discussions.length} 条讨论
          </div>
          <div className="win-status-section" style={{ flex: 'none', width: 100, textAlign: 'center' }}>
            {member?.nickname || '未登录'}
          </div>
        </div>
      </div>

      {/* Annotation Form Dialog */}
      {showAnnotationForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
        }}>
          <div className="win-window" style={{ width: 400 }}>
            <div className="win-title-bar">
              <span>添加批注</span>
              <button className="win-title-button" onClick={() => { setShowAnnotationForm(false); window.getSelection()?.removeAllRanges(); }}>×</button>
            </div>
            <div style={{ padding: 12, background: '#D4D0C8' }}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>选中的文本:</div>
                <div className="win-panel-inset" style={{
                  padding: 8, background: '#FFFFCC', fontSize: 11,
                  maxHeight: 80, overflowY: 'auto', fontStyle: 'italic',
                }}>
                  &quot;{selectedText}&quot;
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>你的批注:</div>
                <textarea
                  className="win-textarea"
                  style={{ width: '100%', height: 80 }}
                  value={annotationComment}
                  onChange={e => setAnnotationComment(e.target.value)}
                  placeholder="写下你的想法..."
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <button className="win-button" onClick={() => { setShowAnnotationForm(false); window.getSelection()?.removeAllRanges(); }}>取消</button>
                <button className="win-button" onClick={handleAddAnnotation} style={{ fontWeight: 'bold' }}>添加批注</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Annotation Detail Dialog */}
      {selectedAnnotation && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
        }} onClick={() => setSelectedAnnotation(null)}>
          <div className="win-window" style={{ width: 350 }} onClick={e => e.stopPropagation()}>
            <div className="win-title-bar">
              <span>批注详情</span>
              <button className="win-title-button" onClick={() => setSelectedAnnotation(null)}>×</button>
            </div>
            <div style={{ padding: 12, background: '#D4D0C8' }}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#808080', marginBottom: 2 }}>原文:</div>
                <div className="win-panel-inset" style={{
                  padding: 8, background: '#FFFFCC', fontSize: 11, fontStyle: 'italic',
                }}>
                  &quot;{selectedAnnotation.selected_text}&quot;
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#808080', marginBottom: 2 }}>
                  <span style={{
                    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                    background: selectedAnnotation.room_members.color, marginRight: 4,
                  }} />
                  {selectedAnnotation.room_members.nickname} 的批注:
                </div>
                <div style={{ fontSize: 11, padding: '4px 0' }}>
                  {selectedAnnotation.comment}
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#808080' }}>
                {new Date(selectedAnnotation.created_at).toLocaleString('zh-CN')}
              </div>
              <div style={{ marginTop: 8, textAlign: 'right' }}>
                <button className="win-button" onClick={() => setSelectedAnnotation(null)}>关闭</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Annotations Panel Component
function AnnotationsPanel({
  annotations,
  selectedAnnotation,
  onSelectAnnotation,
}: {
  annotations: AnnotationView[];
  selectedAnnotation: AnnotationView | null;
  onSelectAnnotation: (a: AnnotationView | null) => void;
}) {
  if (annotations.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#808080', fontSize: 11 }}>
        暂无批注<br /><br />
        在阅读区选中文本<br />即可添加批注
      </div>
    );
  }

  return (
    <div>
      {annotations.map(ann => (
        <div
          key={ann.id}
          className="win-panel-inset"
          style={{
            padding: 6, marginBottom: 4, cursor: 'pointer',
            background: selectedAnnotation?.id === ann.id ? '#E8E8FF' : '#FFFFFF',
          }}
          onClick={() => onSelectAnnotation(ann)}
        >
          <div style={{ fontSize: 10, color: '#808080', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
              background: ann.room_members.color,
            }} />
            <span style={{ fontWeight: 'bold' }}>{ann.room_members.nickname}</span>
          </div>
          <div style={{
            fontSize: 11, background: '#FFFFCC', padding: '2px 4px', marginBottom: 4,
            fontStyle: 'italic', borderLeft: `3px solid ${ann.room_members.color}`,
          }}>
            &quot;{ann.selected_text.length > 60 ? ann.selected_text.slice(0, 60) + '...' : ann.selected_text}&quot;
          </div>
          <div style={{ fontSize: 11 }}>
            {ann.comment}
          </div>
        </div>
      ))}
    </div>
  );
}

// Discussion Panel Component
function DiscussionPanel({
  discussions,
  member,
  newDiscussion,
  setNewDiscussion,
  onAddDiscussion,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  onReply,
}: {
  discussions: DiscussionThread[];
  member: Member | null;
  newDiscussion: string;
  setNewDiscussion: (v: string) => void;
  onAddDiscussion: () => void;
  replyingTo: string | null;
  setReplyingTo: (v: string | null) => void;
  replyContent: string;
  setReplyContent: (v: string) => void;
  onReply: (parentId: string) => void;
}) {
  return (
    <div>
      {/* New discussion input */}
      {member && (
        <div style={{ marginBottom: 8 }}>
          <textarea
            className="win-textarea"
            style={{ width: '100%', height: 50, marginBottom: 4 }}
            value={newDiscussion}
            onChange={e => setNewDiscussion(e.target.value)}
            placeholder="发起新讨论..."
          />
          <div style={{ textAlign: 'right' }}>
            <button className="win-button" onClick={onAddDiscussion} style={{ fontWeight: 'bold', minWidth: 60 }}>
              发表
            </button>
          </div>
        </div>
      )}

      {/* Discussion threads */}
      {discussions.length === 0 ? (
        <div style={{ padding: 16, textAlign: 'center', color: '#808080', fontSize: 11 }}>
          暂无讨论<br />在上方输入框发起讨论
        </div>
      ) : (
        discussions.map(disc => (
          <div key={disc.id} className="win-panel-inset" style={{ padding: 6, marginBottom: 4, background: '#FFFFFF' }}>
            <div style={{ fontSize: 10, color: '#808080', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                background: disc.room_members.color,
              }} />
              <span style={{ fontWeight: 'bold' }}>{disc.room_members.nickname}</span>
              <span>·</span>
              <span>{new Date(disc.created_at).toLocaleString('zh-CN')}</span>
            </div>
            <div style={{ fontSize: 11, marginBottom: 4, lineHeight: 1.6 }}>
              {disc.content}
            </div>

            {/* Replies */}
            {disc.replies && disc.replies.length > 0 && (
              <div style={{ marginLeft: 12, borderLeft: '2px solid #C0C0C0', paddingLeft: 8, marginBottom: 4 }}>
                {disc.replies.map((reply: DiscussionReply) => (
                  <div key={reply.id} style={{ marginBottom: 4 }}>
                    <div style={{ fontSize: 10, color: '#808080', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                        background: reply.room_members.color,
                      }} />
                      <span style={{ fontWeight: 'bold' }}>{reply.room_members.nickname}</span>
                      <span>·</span>
                      <span>{new Date(reply.created_at).toLocaleString('zh-CN')}</span>
                    </div>
                    <div style={{ fontSize: 11, lineHeight: 1.5 }}>
                      {reply.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply button / form */}
            {member && (
              <div>
                {replyingTo === disc.id ? (
                  <div style={{ marginTop: 4 }}>
                    <input
                      className="win-input"
                      style={{ width: '100%', marginBottom: 4 }}
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      placeholder="回复..."
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') onReply(disc.id); }}
                    />
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button className="win-button" style={{ minWidth: 40, fontSize: 10 }} onClick={() => { setReplyingTo(null); setReplyContent(''); }}>取消</button>
                      <button className="win-button" style={{ minWidth: 40, fontSize: 10 }} onClick={() => onReply(disc.id)}>回复</button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="win-button"
                    style={{ minWidth: 40, fontSize: 10, padding: '1px 6px' }}
                    onClick={() => { setReplyingTo(disc.id); setReplyContent(''); }}
                  >
                    回复
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default function ChapterPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>加载中...</div>}>
      <ChapterContent />
    </Suspense>
  );
}
