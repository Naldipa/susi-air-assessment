import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { DataService } from '../src/shared/data/data.service';
import { DocumentsService, documentStatus } from '../src/documents/documents.service';

process.env.ASSESSMENT_TODAY = '2026-05-15';
const service = new DocumentsService(new DataService(resolve(process.cwd(), '../data')));

test('document status thresholds cover expired, warning boundary, and safe', () => {
  assert.equal(documentStatus(0, 30), 'expired');
  assert.equal(documentStatus(1, 30), 'soon');
  assert.equal(documentStatus(30, 30), 'soon');
  assert.equal(documentStatus(31, 30), 'safe');
});

test('documents use the assessment date and preserve source reference date', () => {
  const result = service.getDocuments();
  assert.equal(result.referenceDate, '2026-05-15');
  assert.equal(result.sourceReferenceDate, '2026-05-31');
  assert.deepEqual(result.documents.map((document) => document.status), [
    'safe',
    'safe',
    'soon',
    'soon',
    'expired',
  ]);
});
