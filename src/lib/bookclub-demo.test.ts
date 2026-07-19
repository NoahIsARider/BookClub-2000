import test from 'node:test';
import assert from 'node:assert/strict';

import { createDemoStore, type StorageLike } from '@/lib/bookclub-demo';

class MemoryStorage implements StorageLike {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }
}

test('seeds demo data and supports the full collaboration flow', () => {
  const storage = new MemoryStorage();
  const demo = createDemoStore(storage);

  const initialRooms = demo.listRooms();
  assert.ok(initialRooms.length > 0);

  const seededRoom = demo.getRoom(initialRooms[0].id);
  assert.ok(seededRoom);
  assert.ok(seededRoom.members.length > 0);
  assert.ok(seededRoom.chapters.length > 0);

  const createdRoom = demo.createRoom({
    name: '哲学慢读',
    book_title: '存在与时间',
    author: '海德格尔',
    description: '用于演示的新增房间',
    created_by: 'Noah',
  });

  assert.equal(createdRoom.created_by, 'Noah');

  const joinedMember = demo.joinRoom(createdRoom.id, 'Alice');
  assert.equal(joinedMember.nickname, 'Alice');

  const createdChapter = demo.addChapter(createdRoom.id, {
    title: '第一章 导论',
    content: '存在问题在今天已被遗忘，但它仍然要求被重新提出。',
  });

  const annotation = demo.addAnnotation(createdChapter.id, {
    member_id: joinedMember.id,
    selected_text: '存在问题在今天已被遗忘',
    comment: '这个开头直接把问题意识拉满了。',
    start_offset: 0,
    end_offset: 11,
  });

  assert.equal(annotation.room_members.nickname, 'Alice');

  const discussion = demo.addDiscussion(createdChapter.id, {
    member_id: joinedMember.id,
    content: '我觉得这句像是在重新校准阅读姿态。',
  });

  demo.addDiscussion(createdChapter.id, {
    member_id: createdRoom.members[0].id,
    content: '是的，它先打碎熟悉感，再建立问题感。',
    parent_id: discussion.id,
  });

  const discussions = demo.listDiscussions(createdChapter.id);
  assert.equal(discussions.length, 1);
  assert.equal(discussions[0].replies.length, 1);

  const exported = demo.exportRoom(createdRoom.id);
  assert.match(exported.markdown, /存在与时间 - 共读纪要/);
  assert.match(exported.markdown, /Alice/);
  assert.match(exported.markdown, /第一章 导论/);
});

test('reset restores the initial showcase dataset', () => {
  const storage = new MemoryStorage();
  const demo = createDemoStore(storage);

  const originalRoomIds = demo.listRooms().map((room) => room.id);
  demo.createRoom({
    name: '临时房间',
    book_title: '临时书目',
    author: null,
    description: null,
    created_by: 'Temp',
  });

  assert.ok(demo.listRooms().length > originalRoomIds.length);

  demo.reset();

  const resetRoomIds = demo.listRooms().map((room) => room.id);
  assert.deepEqual(resetRoomIds, originalRoomIds);
});
