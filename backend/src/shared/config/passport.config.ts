/**
 * Passport.js Configuration
 * Local strategy for email/password authentication
 */

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import db from '../database/connection';
import { comparePassword } from '../utils/password.utils';
import { User, UserWithoutPassword } from '../types/auth.types';

/**
 * Configure Passport.js local strategy
 */
export function configurePassport(): void {
  // Local Strategy for email/password login
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email', // Use email instead of username
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await db<User>('users')
            .where({ email })
            .first();

          // User not found
          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Check if user is active
          if (user.status !== 'active') {
            return done(null, false, { message: 'Account is not active' });
          }

          // Verify password
          const isValidPassword = await comparePassword(password, user.password_hash);

          if (!isValidPassword) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Remove password hash before returning user
          const { password_hash, ...userWithoutPassword } = user;

          // Update last login timestamp
          await db('users')
            .where({ id: user.id })
            .update({ last_login_at: db.fn.now() });

          return done(null, userWithoutPassword as UserWithoutPassword);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user for session (if using sessions)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session (if using sessions)
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await db<User>('users')
        .where({ id })
        .first();

      if (!user) {
        return done(null, false);
      }

      const { password_hash, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });
}

/**
 * Initialize passport middleware
 * @returns passport instance
 */
export function initializePassport() {
  configurePassport();
  return passport;
}
