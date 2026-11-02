import * as fs from 'fs';
import * as path from 'path';
import { IDS, SYLLABUS } from '../../src/database/seed';

describe('supabase/seed/seed.sql stays in step with the app seed', () => {
  const sql = fs.readFileSync(path.join(__dirname, '../../supabase/seed/seed.sql'), 'utf8');
  it('contains every subject id', () => { for (const id of Object.values(IDS.subject)) expect(sql).toContain(id); });
  it('contains every chapter id with its title and subject', () => {
    for (const c of SYLLABUS) {
      expect(sql).toContain(c.id);
      expect(sql).toContain(`'${c.title}'`);
      expect(sql).toContain(IDS.subject[c.subject]);
    }
  });
  it('is idempotent', () => { expect((sql.match(/on conflict \(id\) do nothing/g) ?? []).length).toBe(2); });
});
