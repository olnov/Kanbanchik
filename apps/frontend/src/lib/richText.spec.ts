/// <reference types="jest" />
import { htmlToStored } from './richText';

describe('htmlToStored', () => {
  it.each([
    ['', 'empty string'],
    ['<p></p>', 'empty paragraph'],
    ['<p><br></p>', 'paragraph with break'],
    ['<p>   </p>', 'whitespace paragraph'],
    ['<p>&nbsp;</p>', 'nbsp paragraph'],
  ])('returns null for %s (%s)', (html) => {
    expect(htmlToStored(html)).toBeNull();
  });

  it('returns the html unchanged for real text', () => {
    expect(htmlToStored('<p>Hello</p>')).toBe('<p>Hello</p>');
  });

  it('returns the html unchanged for a list', () => {
    expect(htmlToStored('<ul><li>a</li></ul>')).toBe('<ul><li>a</li></ul>');
  });

  it('keeps content that has surrounding markup but real text', () => {
    expect(htmlToStored('<p><strong>Hi</strong></p>')).toBe('<p><strong>Hi</strong></p>');
  });
});
