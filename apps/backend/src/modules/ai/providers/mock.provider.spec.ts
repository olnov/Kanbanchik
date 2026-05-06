import { MockAiProvider } from './mock.provider';

describe('MockAiProvider', () => {
  it('returns 3 card drafts regardless of input', async () => {
    const provider = new MockAiProvider();
    const result = await provider.generateCards('some spec text');
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      summary: expect.any(String),
      description: expect.any(String),
      type: expect.any(String),
      priority: expect.any(String),
    });
  });
});
