/**
 * Unit Tests: User Update Validation Schema
 * Tests Zod partial validation schema for user updates
 */

import { updateUserSchema } from '../../src/services/user-service/schemas/user.schema';

describe('User Update Validation Schema Tests', () => {
  describe('Partial Schema - Optional Fields', () => {
    it('should allow empty object (all fields optional)', () => {
      const result = updateUserSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.data).length).toBe(0);
      }
    });

    it('should allow partial updates with only one field', () => {
      const result = updateUserSchema.safeParse({ full_name: 'John Doe' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.full_name).toBe('John Doe');
        expect(result.data.username).toBeUndefined();
      }
    });

    it('should allow multiple fields but not require all', () => {
      const result = updateUserSchema.safeParse({
        full_name: 'Jane Smith',
        location_name: 'New York',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.full_name).toBe('Jane Smith');
        expect(result.data.location_name).toBe('New York');
        expect(result.data.username).toBeUndefined();
      }
    });
  });

  describe('Field Validation Rules', () => {
    it('should validate phone_number format (E.164 format)', () => {
      const validPhone = updateUserSchema.safeParse({ phone_number: '+1234567890' });
      expect(validPhone.success).toBe(true);

      const invalidPhone = updateUserSchema.safeParse({ phone_number: 'invalid-phone' });
      expect(invalidPhone.success).toBe(false);
    });

    it('should validate profile_image_url as valid URL', () => {
      const validUrl = updateUserSchema.safeParse({
        profile_image_url: 'https://example.com/avatar.jpg'
      });
      expect(validUrl.success).toBe(true);

      const invalidUrl = updateUserSchema.safeParse({
        profile_image_url: 'not-a-valid-url'
      });
      expect(invalidUrl.success).toBe(false);
    });

    it('should validate skill_level enum values', () => {
      const valid = updateUserSchema.safeParse({ skill_level: 'intermediate' });
      expect(valid.success).toBe(true);

      const invalid = updateUserSchema.safeParse({ skill_level: 'super-expert' });
      expect(invalid.success).toBe(false);
    });

    it('should validate status enum values', () => {
      const valid = updateUserSchema.safeParse({ status: 'active' });
      expect(valid.success).toBe(true);

      const invalid = updateUserSchema.safeParse({ status: 'banned' });
      expect(invalid.success).toBe(false);
    });

    it('should reject invalid data types', () => {
      const invalidType = updateUserSchema.safeParse({
        full_name: 123, // Should be string
      });
      expect(invalidType.success).toBe(false);
    });
  });

  describe('String Field Length Validation', () => {
    it('should validate username min/max length', () => {
      const tooShort = updateUserSchema.safeParse({ username: 'ab' }); // Min 3
      expect(tooShort.success).toBe(false);

      const validLength = updateUserSchema.safeParse({ username: 'johndoe' });
      expect(validLength.success).toBe(true);

      const tooLong = updateUserSchema.safeParse({ username: 'a'.repeat(51) }); // Max 50
      expect(tooLong.success).toBe(false);
    });

    it('should validate full_name min/max length', () => {
      const empty = updateUserSchema.safeParse({ full_name: '' });
      expect(empty.success).toBe(false);

      const valid = updateUserSchema.safeParse({ full_name: 'John Doe' });
      expect(valid.success).toBe(true);

      const tooLong = updateUserSchema.safeParse({ full_name: 'a'.repeat(101) }); // Max 100
      expect(tooLong.success).toBe(false);
    });
  });

  describe('Numeric Field Validation', () => {
    it('should validate location_lat range (-90 to 90)', () => {
      const valid = updateUserSchema.safeParse({ location_lat: 40.7128 });
      expect(valid.success).toBe(true);

      const tooLow = updateUserSchema.safeParse({ location_lat: -91 });
      expect(tooLow.success).toBe(false);

      const tooHigh = updateUserSchema.safeParse({ location_lat: 91 });
      expect(tooHigh.success).toBe(false);
    });

    it('should validate location_lng range (-180 to 180)', () => {
      const valid = updateUserSchema.safeParse({ location_lng: -74.0060 });
      expect(valid.success).toBe(true);

      const tooLow = updateUserSchema.safeParse({ location_lng: -181 });
      expect(tooLow.success).toBe(false);

      const tooHigh = updateUserSchema.safeParse({ location_lng: 181 });
      expect(tooHigh.success).toBe(false);
    });

    it('should validate preferred_radius_km as positive number', () => {
      const valid = updateUserSchema.safeParse({ preferred_radius_km: 10 });
      expect(valid.success).toBe(true);

      const zero = updateUserSchema.safeParse({ preferred_radius_km: 0 });
      expect(zero.success).toBe(false);

      const negative = updateUserSchema.safeParse({ preferred_radius_km: -5 });
      expect(negative.success).toBe(false);
    });
  });
});
