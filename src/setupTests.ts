import '@testing-library/jest-dom';
import { configureGlobal } from 'fast-check';
import { server } from './mocks/server';

configureGlobal({
  numRuns: 100,
  verbose: true,
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
