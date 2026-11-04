import { createHash } from 'crypto';
import { canonicalJson, packHash, sha256Hex } from '../../src/services/content/sha256';

describe('sha256', () => {
  it('matches the standard test vectors', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256Hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe('248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
  });
  it('agrees with Node on random text including unicode and long input', () => {
    for (const s of ['π/2 ≠ 3', 'தமிழ் తెలుగు', '😀 emoji', 'x'.repeat(1000), 'é'.repeat(70), '\n\t']) expect(sha256Hex(s)).toBe(createHash('sha256').update(s, 'utf8').digest('hex'));
    for (let n = 0; n < 200; n++) { const s = 'a'.repeat(n); expect(sha256Hex(s)).toBe(createHash('sha256').update(s).digest('hex')); }
  });
  it('canonical JSON ignores key order and hashes identically', () => {
    expect(canonicalJson({ b: 1, a: [{ d: 2, c: 3 }] })).toBe('{"a":[{"c":3,"d":2}],"b":1}');
    expect(packHash({ x: 1, y: [1, 2] })).toBe(packHash({ y: [1, 2], x: 1 }));
    expect(packHash({ x: 1 })).not.toBe(packHash({ x: 2 }));
  });
});
