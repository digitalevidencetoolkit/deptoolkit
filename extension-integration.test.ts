/**
 * Integration tests for browser extension backend communication
 *
 * These tests verify that the backend correctly handles requests from the browser extension:
 * - GET /list-docs: Retrieve archived documents
 * - POST /form: Archive a webpage with screenshot and HTML
 */

import supertest from 'supertest';
import { ImportMock } from 'ts-mock-imports';
import app from './app';
import * as Ledger from './src/ledger';
import * as Store from './src/store';
import * as Bundle from './src/types/Bundle';

describe('Browser Extension Integration Tests', () => {
  afterEach(() => {
    ImportMock.restore();
  });

  describe('GET /list-docs', () => {
    it('should return list of archived documents', async () => {
      const mockDocs = [
        {
          id: 'doc-123',
          data: { url: 'https://example.com', title: 'Example Page' },
          annotations: { description: 'Test document' },
        },
        {
          id: 'doc-456',
          data: { url: 'https://test.com', title: 'Test Page' },
          annotations: { description: 'Another test' },
        },
      ];

      ImportMock.mockFunction(Ledger, 'listDocs', Promise.resolve(mockDocs));

      const response = await supertest(app).get('/list-docs');

      expect(response.status).toBe(200);
      expect(response.text).toContain('doc-123');
      expect(response.text).toContain('example.com');
    });

    it('should return empty list when no documents exist', async () => {
      ImportMock.mockFunction(Ledger, 'listDocs', Promise.resolve([]));

      const response = await supertest(app).get('/list-docs');

      expect(response.status).toBe(200);
      expect(response.text).toBe('[]');
    });
  });

  describe('POST /form', () => {
    it('should accept and process valid webpage archive from extension', async () => {
      const mockBundle: Bundle.Bundle = [
        { kind: 'screenshot', hash: 'hash-screenshot-123' },
        { kind: 'screenshot_thumbnail', hash: 'hash-thumb-123' },
        { kind: 'one_file', hash: 'hash-html-123' },
      ];

      ImportMock.mockFunction(Store, 'newBundle', Promise.resolve(mockBundle));
      ImportMock.mockFunction(Ledger, 'insertDoc', Promise.resolve(undefined));

      // Create a minimal base64 PNG (1x1 transparent pixel)
      const minimalPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const response = await supertest(app)
        .post('/form')
        .field('url', 'https://example.com/test-page')
        .field('title', 'Test Page Title')
        .field('scr', `data:image/png;base64,${minimalPng}`)
        .field('onefile', '<html><body>Archived page content</body></html>');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Received POST on /form');
    });

    it('should accept multipart form data with all required fields', async () => {
      const mockBundle: Bundle.Bundle = [
        { kind: 'screenshot', hash: 'hash-abc' },
        { kind: 'screenshot_thumbnail', hash: 'hash-def' },
        { kind: 'one_file', hash: 'hash-ghi' },
      ];

      ImportMock.mockFunction(Store, 'newBundle', Promise.resolve(mockBundle));
      ImportMock.mockFunction(Ledger, 'insertDoc', Promise.resolve(undefined));

      const minimalPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const response = await supertest(app)
        .post('/form')
        .field('url', 'https://another-example.com')
        .field('title', 'Another Test Page')
        .field('scr', `data:image/png;base64,${minimalPng}`)
        .field('onefile', '<html><head><title>Test</title></head><body><h1>Content</h1></body></html>');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Received POST on /form');
    });
  });

  describe('Extension Communication Flow', () => {
    it('should handle typical extension workflow', async () => {
      // Step 1: Extension checks document list before archiving
      const initialDocs = [
        { id: 'existing-doc', data: { url: 'https://old.com', title: 'Old Doc' } },
      ];
      ImportMock.mockFunction(Ledger, 'listDocs', Promise.resolve(initialDocs));

      const listResponse = await supertest(app).get('/list-docs');
      expect(listResponse.status).toBe(200);
      expect(listResponse.text).toContain('old.com');

      // Step 2: Extension archives a new page
      const mockBundle: Bundle.Bundle = [
        { kind: 'screenshot', hash: 'new-screenshot' },
        { kind: 'screenshot_thumbnail', hash: 'new-thumb' },
        { kind: 'one_file', hash: 'new-html' },
      ];

      ImportMock.mockFunction(Store, 'newBundle', Promise.resolve(mockBundle));
      ImportMock.mockFunction(Ledger, 'insertDoc', Promise.resolve(undefined));

      const minimalPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const archiveResponse = await supertest(app)
        .post('/form')
        .field('url', 'https://new-page.com')
        .field('title', 'New Page')
        .field('scr', `data:image/png;base64,${minimalPng}`)
        .field('onefile', '<html><body>New content</body></html>');

      expect(archiveResponse.status).toBe(200);
      expect(archiveResponse.text).toBe('Received POST on /form');
    });
  });
});
