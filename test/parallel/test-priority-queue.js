// Flags: --expose-internals
'use strict';

require('../common');

const assert = require('assert');
const PriorityQueue = require('internal/priority_queue');

{
  // Checks that the queue is fundamentally correct.
  const queue = new PriorityQueue();
  for (let i = 15; i > 0; i--)
    queue.insert(i);

  for (let i = 1; i < 16; i++) {
    assert.strictEqual(queue.peek(), i);
    assert.strictEqual(queue.shift(), i);
  }

  assert.strictEqual(queue.shift(), undefined);

  // Reverse the order.
  for (let i = 1; i < 16; i++)
    queue.insert(i);

  for (let i = 1; i < 16; i++) {
    assert.strictEqual(queue.shift(), i);
  }

  assert.strictEqual(queue.shift(), undefined);
}

{
  // Checks that the queue is capable of resizing and fitting more elements.
  const queue = new PriorityQueue();
  for (let i = 2048; i > 0; i--)
    queue.insert(i);

  for (let i = 1; i < 2049; i++) {
    assert.strictEqual(queue.shift(), i);
  }

  assert.strictEqual(queue.shift(), undefined);
}

{
  // Checks that remove works as expected.
  const queue = new PriorityQueue();
  for (let i = 16; i > 0; i--)
    queue.insert(i);

  const removed = [5, 10, 15];
  for (const id of removed)
    assert(queue.remove(id));

  assert(!queue.remove(100));
  assert(!queue.remove(-100));

  for (let i = 1; i < 17; i++) {
    if (removed.indexOf(i) < 0)
      assert.strictEqual(queue.shift(), i);
  }

  assert.strictEqual(queue.shift(), undefined);
}

{
  // Make a max heap with a custom sort function.
  const queue = new PriorityQueue((a, b) => b - a);
  for (let i = 1; i < 17; i++)
    queue.insert(i);

  for (let i = 16; i > 0; i--) {
    assert.strictEqual(queue.shift(), i);
  }

  assert.strictEqual(queue.shift(), undefined);
}

{
  // Make a min heap that accepts objects as values, which necessitates
  // a custom sorting function. In addition, add a setPosition function
  // as 2nd param which provides a reference to the node in the heap
  // and allows speedy deletions.
  const queue = new PriorityQueue((a, b) => {
    return a.value - b.value;
  }, (node, pos) => (node.position = pos));
  for (let i = 1; i < 17; i++)
    queue.insert({ value: i, position: null });

  for (let i = 1; i < 17; i++) {
    assert.strictEqual(queue.peek().value, i);
    queue.removeAt(queue.peek().position);
  }

  assert.strictEqual(queue.peek(), undefined);
}

{
  const queue = new PriorityQueue((a, b) => {
    return a.value - b.value;
  }, (node, pos) => (node.position = pos));

  queue.insert({ value: 1, position: null });
  queue.insert({ value: 2, position: null });
  queue.insert({ value: 3, position: null });
  queue.insert({ value: 4, position: null });
  queue.insert({ value: 5, position: null });

  queue.insert({ value: 2, position: null });
  const secondLargest = { value: 10, position: null };
  queue.insert(secondLargest);
  const largest = { value: 15, position: null };
  queue.insert(largest);

  queue.removeAt(5);
  assert.strictEqual(largest.position, 5);

  // check that removing 2nd to last item works fine
  queue.removeAt(6);
  assert.strictEqual(secondLargest.position, 6);

  // check that removing the last item doesn't throw
  queue.removeAt(6);

  assert.strictEqual(queue.shift().value, 1);
  assert.strictEqual(queue.shift().value, 2);
  assert.strictEqual(queue.shift().value, 2);
  assert.strictEqual(queue.shift().value, 4);
  assert.strictEqual(queue.shift().value, 15);

  assert.strictEqual(queue.shift(), undefined);
}
