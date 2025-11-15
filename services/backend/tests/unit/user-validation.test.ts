/**
 * Unit Tests: User Validation Schemas
 * Tests Zod validation for getUserParamsSchema
 */

import { getUserParamsSchema } from '../../src/services/user-service/schemas/user.schema';

describe('User Validation Schemas', () => {
  describe('getUserParamsSchema', () => {
    it('should validate valid positive integer ID string', () => {
      const result = getUserParamsSchema.safeParse({ id: '123' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(123);
      }
    });

    it('should coerce string to number', () => {
      const result = getUserParamsSchema.safeParse({ id: '42' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(42);
        expect(typeof result.data.id).toBe('number');
      }
    });

    it('should reject ID=0 (not positive)', () => {
      const result = getUserParamsSchema.safeParse({ id: '0' });
      expect(result.success).toBe(false);
    });

    it('should reject negative ID', () => {
      const result = getUserParamsSchema.safeParse({ id: '-5' });
      expect(result.success).toBe(false);
    });

    it('should reject non-numeric string', () => {
      const result = getUserParamsSchema.safeParse({ id: 'abc' });
      expect(result.success).toBe(false);
    });

    it('should reject decimal ID (must be integer)', () => {
      const result = getUserParamsSchema.safeParse({ id: '3.14' });
      expect(result.success).toBe(false);
    });

    it('should reject empty string ID', () => {
      const result = getUserParamsSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
    });
  });
});
