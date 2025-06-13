import { expect, test } from 'vitest';
import { Computer } from '../lib/computer';

test('computer lifecycle', async () => {
  const computer = await Computer.create();

  expect(computer.id).toBeDefined();
  expect(computer.state).toBe('starting');

  await computer.waitForState('started');
  expect(computer.state).toBe('started');

  await computer.stop();
  expect(computer.state).toBe('stopping');

  await computer.waitForState('stopped');
  expect(computer.state).toBe('stopped');

  await computer.destroy();
  expect(computer.state).toBe('destroying');

  await computer.waitForState('destroyed');
  expect(computer.state).toBe('destroyed');
});

test('computer fork', async () => {
  const computer = await Computer.create();
  expect(computer.id).toBeDefined();

  const forkedComputer = await computer.fork(computer.id);
  expect(forkedComputer.id).toBeDefined();
  expect(forkedComputer.state).toBe('starting');

  await forkedComputer.waitForState('started');
  expect(forkedComputer.state).toBe('started');

  await computer.destroy();
  expect(computer.state).toBe('destroying');

  await forkedComputer.destroy();
  expect(forkedComputer.state).toBe('destroying');
});
