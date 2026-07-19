const STORAGE_KEY = 'bookclub2000.demo.v1';
const MEMBER_COLORS = ['#0000FF', '#FF0000', '#008000', '#800080', '#FF6600', '#006666'];

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface RoomSummary {
  id: string;
  name: string;
  book_title: string;
  author: string | null;
  description: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface Member {
  id: string;
  nickname: string;
  color: string;
  joined_at: string;
}

export interface ChapterSummary {
  id: string;
  title: string;
  sort_order: number;
  created_at: string;
}

export interface RoomDetail extends RoomSummary {
  members: Member[];
  chapters: ChapterSummary[];
}

export interface ChapterDetail {
  id: string;
  title: string;
  content: string;
  room_id: string;
  sort_order: number;
  created_at: string;
}

export interface AnnotationView {
  id: string;
  chapter_id: string;
  selected_text: string;
  comment: string;
  start_offset: number;
  end_offset: number;
  member_id: string;
  created_at: string;
  room_members: { nickname: string; color: string };
}

export interface DiscussionReply {
  id: string;
  content: string;
  member_id: string;
  created_at: string;
  room_members: { nickname: string; color: string };
}

export interface DiscussionThread {
  id: string;
  content: string;
  member_id: string;
  created_at: string;
  room_members: { nickname: string; color: string };
  replies: DiscussionReply[];
}

interface RoomRecord extends RoomSummary {}

interface MemberRecord extends Member {
  room_id: string;
}

interface ChapterRecord extends ChapterDetail {}

interface AnnotationRecord {
  id: string;
  chapter_id: string;
  selected_text: string;
  comment: string;
  start_offset: number;
  end_offset: number;
  member_id: string;
  created_at: string;
}

interface DiscussionRecord {
  id: string;
  chapter_id: string;
  member_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
}

interface DemoState {
  rooms: RoomRecord[];
  members: MemberRecord[];
  chapters: ChapterRecord[];
  annotations: AnnotationRecord[];
  discussions: DiscussionRecord[];
}

interface CreateRoomInput {
  name: string;
  book_title: string;
  author?: string | null;
  description?: string | null;
  created_by: string;
}

interface CreateChapterInput {
  title: string;
  content: string;
}

interface CreateAnnotationInput {
  member_id: string;
  selected_text: string;
  comment: string;
  start_offset?: number;
  end_offset?: number;
}

interface CreateDiscussionInput {
  member_id: string;
  content: string;
  parent_id?: string | null;
}

function createId(prefix: string): string {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}_${randomPart}`;
}

function toIso(dateText: string): string {
  return new Date(dateText).toISOString();
}

function normalizeCode(input: string): string {
  return input.trim().toUpperCase();
}

function pickColor(usedColors: string[]): string {
  return MEMBER_COLORS.find((color) => !usedColors.includes(color)) ?? MEMBER_COLORS[usedColors.length % MEMBER_COLORS.length];
}

function buildMarkdown(room: RoomDetail, state: DemoState): string {
  let markdown = `# ${room.book_title} - 共读纪要\n\n`;
  markdown += `**读书会**: ${room.name}\n`;
  if (room.author) {
    markdown += `**作者**: ${room.author}\n`;
  }
  markdown += `**导出时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
  markdown += `---\n\n`;

  for (const chapter of room.chapters) {
    const chapterDetail = state.chapters.find((item) => item.id === chapter.id);
    const annotations = listAnnotationsFromState(state, chapter.id);
    const discussions = listDiscussionsFromState(state, chapter.id);

    markdown += `## ${chapter.title}\n\n`;
    if (chapterDetail?.content) {
      markdown += `${chapterDetail.content}\n\n`;
    }

    if (annotations.length > 0) {
      markdown += `### 精彩段落与批注\n\n`;
      for (const annotation of annotations) {
        markdown += `> "${annotation.selected_text}"\n\n`;
        markdown += `**${annotation.room_members.nickname}** 的批注: ${annotation.comment}\n\n`;
      }
    }

    if (discussions.length > 0) {
      markdown += `### 讨论记录\n\n`;
      for (const discussion of discussions) {
        markdown += `**${discussion.room_members.nickname}** (${new Date(discussion.created_at).toLocaleString('zh-CN')}):\n`;
        markdown += `${discussion.content}\n\n`;

        for (const reply of discussion.replies) {
          markdown += `  > **${reply.room_members.nickname}** (${new Date(reply.created_at).toLocaleString('zh-CN')}): ${reply.content}\n\n`;
        }

        markdown += `---\n\n`;
      }
    }
  }

  return markdown;
}

function createSeedState(): DemoState {
  const roomId = 'room_seed_dune';
  const chapterOneId = 'chapter_seed_arrakis';
  const chapterTwoId = 'chapter_seed_prophecy';
  const liId = 'member_seed_li';
  const chenId = 'member_seed_chen';
  const xuId = 'member_seed_xu';

  return {
    rooms: [
      {
        id: roomId,
        name: '沙丘慢读实验室',
        book_title: '沙丘',
        author: 'Frank Herbert',
        description: '一个用于 Vercel 展示的完整演示房间，预置了章节、批注、讨论与导出能力。',
        invite_code: 'DUNE24',
        created_by: '李燃',
        created_at: toIso('2026-07-01T10:00:00+08:00'),
      },
    ],
    members: [
      {
        id: liId,
        room_id: roomId,
        nickname: '李燃',
        color: '#0000FF',
        joined_at: toIso('2026-07-01T10:00:00+08:00'),
      },
      {
        id: chenId,
        room_id: roomId,
        nickname: '陈未',
        color: '#FF0000',
        joined_at: toIso('2026-07-01T10:05:00+08:00'),
      },
      {
        id: xuId,
        room_id: roomId,
        nickname: '许观',
        color: '#008000',
        joined_at: toIso('2026-07-01T10:09:00+08:00'),
      },
    ],
    chapters: [
      {
        id: chapterOneId,
        room_id: roomId,
        title: '第一章 香料、预言与离开',
        sort_order: 1,
        created_at: toIso('2026-07-01T10:12:00+08:00'),
        content: '保罗意识到，真正令人恐惧的不是前路未知，而是命运似乎早已把他的名字写进沙丘的风里。离开熟悉世界时，他第一次理解了预言并不是答案，而是一种逼迫人行动的压力。',
      },
      {
        id: chapterTwoId,
        room_id: roomId,
        title: '第二章 沙漠中的感知训练',
        sort_order: 2,
        created_at: toIso('2026-07-01T10:20:00+08:00'),
        content: '杰西卡告诉保罗，真正的感知不是看见更多，而是学会分辨哪些细节正在悄悄改变局势。沙漠从不直接给出线索，它只奖励那些足够专注的人。',
      },
    ],
    annotations: [
      {
        id: 'annotation_seed_1',
        chapter_id: chapterOneId,
        member_id: liId,
        selected_text: '预言并不是答案，而是一种逼迫人行动的压力',
        comment: '这句很适合解释为什么人物会被“未来感”反向塑形。',
        start_offset: 44,
        end_offset: 68,
        created_at: toIso('2026-07-01T10:30:00+08:00'),
      },
      {
        id: 'annotation_seed_2',
        chapter_id: chapterTwoId,
        member_id: chenId,
        selected_text: '沙漠从不直接给出线索，它只奖励那些足够专注的人',
        comment: '这像是整本书的方法论，也像在讲阅读本身。',
        start_offset: 43,
        end_offset: 69,
        created_at: toIso('2026-07-01T10:42:00+08:00'),
      },
    ],
    discussions: [
      {
        id: 'discussion_seed_1',
        chapter_id: chapterOneId,
        member_id: chenId,
        parent_id: null,
        content: '这里的“预言”更像是一种社会机制，而不是神秘主义。',
        created_at: toIso('2026-07-01T10:35:00+08:00'),
      },
      {
        id: 'discussion_seed_2',
        chapter_id: chapterOneId,
        member_id: xuId,
        parent_id: 'discussion_seed_1',
        content: '同意，它让角色的每一步都带着被观看的压力。',
        created_at: toIso('2026-07-01T10:37:00+08:00'),
      },
      {
        id: 'discussion_seed_3',
        chapter_id: chapterTwoId,
        member_id: liId,
        parent_id: null,
        content: '这一章把“训练”写得像是在升级人的注意力系统。',
        created_at: toIso('2026-07-01T10:45:00+08:00'),
      },
    ],
  };
}

function parseState(raw: string | null): DemoState {
  if (!raw) {
    return createSeedState();
  }

  try {
    return JSON.parse(raw) as DemoState;
  } catch {
    return createSeedState();
  }
}

function getMemberView(state: DemoState, memberId: string): { nickname: string; color: string } {
  const member = state.members.find((item) => item.id === memberId);
  return {
    nickname: member?.nickname ?? 'Unknown',
    color: member?.color ?? '#000000',
  };
}

function listAnnotationsFromState(state: DemoState, chapterId: string): AnnotationView[] {
  return state.annotations
    .filter((item) => item.chapter_id === chapterId)
    .sort((a, b) => a.start_offset - b.start_offset)
    .map((item) => ({
      ...item,
      room_members: getMemberView(state, item.member_id),
    }));
}

function listDiscussionsFromState(state: DemoState, chapterId: string): DiscussionThread[] {
  const chapterDiscussions = state.discussions
    .filter((item) => item.chapter_id === chapterId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const replies = chapterDiscussions.filter((item) => item.parent_id);
  const topLevel = chapterDiscussions.filter((item) => !item.parent_id);

  return topLevel.map((item) => ({
    id: item.id,
    content: item.content,
    member_id: item.member_id,
    created_at: item.created_at,
    room_members: getMemberView(state, item.member_id),
    replies: replies
      .filter((reply) => reply.parent_id === item.id)
      .map((reply) => ({
        id: reply.id,
        content: reply.content,
        member_id: reply.member_id,
        created_at: reply.created_at,
        room_members: getMemberView(state, reply.member_id),
      })),
  }));
}

export function createDemoStore(storage: StorageLike) {
  const loadState = (): DemoState => {
    const state = parseState(storage.getItem(STORAGE_KEY));
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  };

  const saveState = (state: DemoState): void => {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const listRooms = (): RoomSummary[] => {
    const state = loadState();
    return [...state.rooms].sort((a, b) => b.created_at.localeCompare(a.created_at));
  };

  const getRoom = (roomId: string): RoomDetail | null => {
    const state = loadState();
    const room = state.rooms.find((item) => item.id === roomId);
    if (!room) {
      return null;
    }

    return {
      ...room,
      members: state.members
        .filter((item) => item.room_id === roomId)
        .sort((a, b) => a.joined_at.localeCompare(b.joined_at))
        .map(({ room_id: _roomId, ...member }) => member),
      chapters: state.chapters
        .filter((item) => item.room_id === roomId)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(({ content: _content, room_id: _roomId, ...chapter }) => chapter),
    };
  };

  const createRoom = (input: CreateRoomInput): RoomDetail => {
    const state = loadState();
    const roomId = createId('room');
    const createdAt = new Date().toISOString();
    const invite_code = createId('invite').replace('invite_', '').slice(0, 6).toUpperCase();

    const room: RoomRecord = {
      id: roomId,
      name: input.name,
      book_title: input.book_title,
      author: input.author ?? null,
      description: input.description ?? null,
      invite_code,
      created_by: input.created_by,
      created_at: createdAt,
    };

    const creator: MemberRecord = {
      id: createId('member'),
      room_id: roomId,
      nickname: input.created_by,
      color: MEMBER_COLORS[0],
      joined_at: createdAt,
    };

    state.rooms.push(room);
    state.members.push(creator);
    saveState(state);

    return getRoom(roomId)!;
  };

  const joinRoom = (roomId: string, nickname: string): Member => {
    const state = loadState();
    const existingMember = state.members.find((item) => item.room_id === roomId && item.nickname === nickname);
    if (existingMember) {
      const { room_id: _roomId, ...member } = existingMember;
      return member;
    }

    const usedColors = state.members.filter((item) => item.room_id === roomId).map((item) => item.color);
    const member: MemberRecord = {
      id: createId('member'),
      room_id: roomId,
      nickname,
      color: pickColor(usedColors),
      joined_at: new Date().toISOString(),
    };

    state.members.push(member);
    saveState(state);

    const { room_id: _roomId, ...result } = member;
    return result;
  };

  const addChapter = (roomId: string, input: CreateChapterInput): ChapterDetail => {
    const state = loadState();
    const sort_order =
      state.chapters
        .filter((item) => item.room_id === roomId)
        .reduce((max, item) => Math.max(max, item.sort_order), 0) + 1;

    const chapter: ChapterRecord = {
      id: createId('chapter'),
      room_id: roomId,
      title: input.title,
      content: input.content,
      sort_order,
      created_at: new Date().toISOString(),
    };

    state.chapters.push(chapter);
    saveState(state);
    return chapter;
  };

  const getChapter = (chapterId: string): ChapterDetail | null => {
    const state = loadState();
    return state.chapters.find((item) => item.id === chapterId) ?? null;
  };

  const listAnnotations = (chapterId: string): AnnotationView[] => {
    const state = loadState();
    return listAnnotationsFromState(state, chapterId);
  };

  const addAnnotation = (chapterId: string, input: CreateAnnotationInput): AnnotationView => {
    const state = loadState();
    const annotation: AnnotationRecord = {
      id: createId('annotation'),
      chapter_id: chapterId,
      member_id: input.member_id,
      selected_text: input.selected_text,
      comment: input.comment,
      start_offset: input.start_offset ?? 0,
      end_offset: input.end_offset ?? 0,
      created_at: new Date().toISOString(),
    };

    state.annotations.push(annotation);
    saveState(state);

    return {
      ...annotation,
      room_members: getMemberView(state, input.member_id),
    };
  };

  const listDiscussions = (chapterId: string): DiscussionThread[] => {
    const state = loadState();
    return listDiscussionsFromState(state, chapterId);
  };

  const addDiscussion = (chapterId: string, input: CreateDiscussionInput): DiscussionThread | DiscussionReply => {
    const state = loadState();
    const discussion: DiscussionRecord = {
      id: createId('discussion'),
      chapter_id: chapterId,
      member_id: input.member_id,
      parent_id: input.parent_id ?? null,
      content: input.content,
      created_at: new Date().toISOString(),
    };

    state.discussions.push(discussion);
    saveState(state);

    if (discussion.parent_id) {
      return {
        id: discussion.id,
        content: discussion.content,
        member_id: discussion.member_id,
        created_at: discussion.created_at,
        room_members: getMemberView(state, discussion.member_id),
      };
    }

    return {
      id: discussion.id,
      content: discussion.content,
      member_id: discussion.member_id,
      created_at: discussion.created_at,
      room_members: getMemberView(state, discussion.member_id),
      replies: [],
    };
  };

  const exportRoom = (roomId: string): { room_name: string; book_title: string; markdown: string } => {
    const state = loadState();
    const room = getRoom(roomId);
    if (!room) {
      throw new Error('房间不存在');
    }

    return {
      room_name: room.name,
      book_title: room.book_title,
      markdown: buildMarkdown(room, state),
    };
  };

  const reset = (): void => {
    saveState(createSeedState());
  };

  const findRoomByInviteCode = (inviteCode: string): RoomSummary | null => {
    const state = loadState();
    return state.rooms.find((item) => item.invite_code === normalizeCode(inviteCode)) ?? null;
  };

  return {
    listRooms,
    getRoom,
    createRoom,
    joinRoom,
    addChapter,
    getChapter,
    listAnnotations,
    addAnnotation,
    listDiscussions,
    addDiscussion,
    exportRoom,
    findRoomByInviteCode,
    reset,
  };
}

function getBrowserStore() {
  if (typeof window === 'undefined') {
    throw new Error('BookClub demo store is only available in the browser');
  }

  return createDemoStore(window.localStorage);
}

export const demoApi = {
  async listRooms() {
    return getBrowserStore().listRooms();
  },
  async getRoom(roomId: string) {
    return getBrowserStore().getRoom(roomId);
  },
  async createRoom(input: CreateRoomInput) {
    return getBrowserStore().createRoom(input);
  },
  async joinRoom(roomId: string, nickname: string) {
    return getBrowserStore().joinRoom(roomId, nickname);
  },
  async addChapter(roomId: string, input: CreateChapterInput) {
    return getBrowserStore().addChapter(roomId, input);
  },
  async getChapter(chapterId: string) {
    return getBrowserStore().getChapter(chapterId);
  },
  async listAnnotations(chapterId: string) {
    return getBrowserStore().listAnnotations(chapterId);
  },
  async addAnnotation(chapterId: string, input: CreateAnnotationInput) {
    return getBrowserStore().addAnnotation(chapterId, input);
  },
  async listDiscussions(chapterId: string) {
    return getBrowserStore().listDiscussions(chapterId);
  },
  async addDiscussion(chapterId: string, input: CreateDiscussionInput) {
    return getBrowserStore().addDiscussion(chapterId, input);
  },
  async exportRoom(roomId: string) {
    return getBrowserStore().exportRoom(roomId);
  },
  async findRoomByInviteCode(inviteCode: string) {
    return getBrowserStore().findRoomByInviteCode(inviteCode);
  },
  async reset() {
    getBrowserStore().reset();
  },
};
