/// <reference types="jest" />
import { api } from './api';

describe('card-code backfill API', () => {
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ updatedCount: 2, nextCardNumber: 9 }),
      text: async () => '',
    });
    global.fetch = fetchMock as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('posts to the project card-code backfill endpoint', async () => {
    await expect(api.backfillCardCodes('proj-1')).resolves.toEqual({
      updatedCount: 2,
      nextCardNumber: 9,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/projects/proj-1/card-codes/backfill',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
  });
});
