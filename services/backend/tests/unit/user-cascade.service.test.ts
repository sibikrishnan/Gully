/**
 * Unit tests for UserCascadeService
 * Tests cascade operations for user deletion
 * MVP Tier: 4 tests covering team removal, captain transfer, challenge cancellation, and edge cases
 */

import { UserCascadeService } from '../../src/services/user-service/services/user-cascade.service';
import { getTestDb, setupTestDb, cleanTestDb, teardownTestDb } from '../helpers/testDb';
import { Knex } from 'knex';

describe('UserCascadeService - MVP Tests', () => {
  let db: Knex;
  let cascadeService: UserCascadeService;

  beforeAll(async () => {
    await setupTestDb();
    db = getTestDb();
    cascadeService = new UserCascadeService();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  afterEach(async () => {
    await cleanTestDb();
  });

  /**
   * Test 1: Remove user from teams successfully
   * Verifies that a user is removed from all team memberships
   */
  describe('Test 1: Remove user from teams successfully', () => {
    it('should remove user from all teams when user is a regular member', async () => {
      // Arrange - create mock data
      const [user1] = await db('users').insert({
        email: 'member@example.com',
        username: 'member',
        full_name: 'Team Member',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'active',
      }).returning('*');

      const [user2] = await db('users').insert({
        email: 'captain@example.com',
        username: 'captain',
        full_name: 'Team Captain',
        password_hash: 'hash456',
        skill_level: 'advanced',
        status: 'active',
      }).returning('*');

      // Create teams table if not exists (for early development)
      await db.schema.hasTable('teams').then(async (exists) => {
        if (!exists) {
          await db.schema.createTable('teams', (table) => {
            table.increments('id').primary();
            table.string('name', 100).notNullable();
            table.integer('captain_id').notNullable();
            table.timestamp('created_at').defaultTo(db.fn.now());
          });
        }
      });

      await db.schema.hasTable('team_members').then(async (exists) => {
        if (!exists) {
          await db.schema.createTable('team_members', (table) => {
            table.increments('id').primary();
            table.integer('team_id').notNullable();
            table.integer('user_id').notNullable();
            table.timestamp('joined_at').defaultTo(db.fn.now());
          });
        }
      });

      // Create team with captain
      const [team1] = await db('teams').insert({
        name: 'Team Alpha',
        captain_id: user2.id,
      }).returning('*');

      const [team2] = await db('teams').insert({
        name: 'Team Beta',
        captain_id: user2.id,
      }).returning('*');

      // Add user1 as member to both teams
      await db('team_members').insert([
        { team_id: team1.id, user_id: user1.id },
        { team_id: team1.id, user_id: user2.id },
        { team_id: team2.id, user_id: user1.id },
        { team_id: team2.id, user_id: user2.id },
      ]);

      // Act - remove user from teams
      await cascadeService.removeFromTeams(user1.id);

      // Assert - verify user1 is removed from all teams
      const remainingMemberships = await db('team_members')
        .where({ user_id: user1.id });

      expect(remainingMemberships).toHaveLength(0);

      // Verify teams still exist (not deleted)
      const team1Exists = await db('teams').where({ id: team1.id }).first();
      const team2Exists = await db('teams').where({ id: team2.id }).first();

      expect(team1Exists).toBeDefined();
      expect(team2Exists).toBeDefined();
    });
  });

  /**
   * Test 2: Transfer captaincy when user is captain
   * Verifies that captaincy is transferred to another team member
   */
  describe('Test 2: Transfer captaincy when user is captain', () => {
    it('should transfer captaincy to first available team member', async () => {
      // Arrange
      const [captain] = await db('users').insert({
        email: 'oldcaptain@example.com',
        username: 'oldcaptain',
        full_name: 'Old Captain',
        password_hash: 'hash123',
        skill_level: 'expert',
        status: 'active',
      }).returning('*');

      const [newCaptain] = await db('users').insert({
        email: 'newcaptain@example.com',
        username: 'newcaptain',
        full_name: 'New Captain',
        password_hash: 'hash456',
        skill_level: 'advanced',
        status: 'active',
      }).returning('*');

      // Ensure tables exist
      await db.schema.hasTable('teams').then(async (exists) => {
        if (!exists) {
          await db.schema.createTable('teams', (table) => {
            table.increments('id').primary();
            table.string('name', 100).notNullable();
            table.integer('captain_id').notNullable();
            table.timestamp('created_at').defaultTo(db.fn.now());
          });
        }
      });

      await db.schema.hasTable('team_members').then(async (exists) => {
        if (!exists) {
          await db.schema.createTable('team_members', (table) => {
            table.increments('id').primary();
            table.integer('team_id').notNullable();
            table.integer('user_id').notNullable();
            table.timestamp('joined_at').defaultTo(db.fn.now());
          });
        }
      });

      // Create team with captain as captain
      const [team] = await db('teams').insert({
        name: 'Team Gamma',
        captain_id: captain.id,
      }).returning('*');

      // Add both users as members
      await db('team_members').insert([
        { team_id: team.id, user_id: captain.id },
        { team_id: team.id, user_id: newCaptain.id },
      ]);

      // Act - transfer captaincy
      await cascadeService.transferCaptaincy(captain.id);

      // Assert - verify captaincy transferred
      const updatedTeam = await db('teams').where({ id: team.id }).first();

      expect(updatedTeam.captain_id).toBe(newCaptain.id);
      expect(updatedTeam.captain_id).not.toBe(captain.id);
    });

    it('should handle multiple teams where user is captain', async () => {
      // Arrange
      const [captain] = await db('users').insert({
        email: 'multicaptain@example.com',
        username: 'multicaptain',
        full_name: 'Multi Captain',
        password_hash: 'hash123',
        skill_level: 'expert',
        status: 'active',
      }).returning('*');

      const [member1] = await db('users').insert({
        email: 'member1@example.com',
        username: 'member1',
        full_name: 'Member One',
        password_hash: 'hash456',
        skill_level: 'intermediate',
        status: 'active',
      }).returning('*');

      const [member2] = await db('users').insert({
        email: 'member2@example.com',
        username: 'member2',
        full_name: 'Member Two',
        password_hash: 'hash789',
        skill_level: 'advanced',
        status: 'active',
      }).returning('*');

      // Ensure tables exist
      await db.schema.hasTable('teams').then(async (exists) => {
        if (!exists) {
          await db.schema.createTable('teams', (table) => {
            table.increments('id').primary();
            table.string('name', 100).notNullable();
            table.integer('captain_id').notNullable();
            table.timestamp('created_at').defaultTo(db.fn.now());
          });
        }
      });

      await db.schema.hasTable('team_members').then(async (exists) => {
        if (!exists) {
          await db.schema.createTable('team_members', (table) => {
            table.increments('id').primary();
            table.integer('team_id').notNullable();
            table.integer('user_id').notNullable();
            table.timestamp('joined_at').defaultTo(db.fn.now());
          });
        }
      });

      // Create two teams with same captain
      const [team1] = await db('teams').insert({
        name: 'Team Delta',
        captain_id: captain.id,
      }).returning('*');

      const [team2] = await db('teams').insert({
        name: 'Team Epsilon',
        captain_id: captain.id,
      }).returning('*');

      // Add members to teams
      await db('team_members').insert([
        { team_id: team1.id, user_id: captain.id },
        { team_id: team1.id, user_id: member1.id },
        { team_id: team2.id, user_id: captain.id },
        { team_id: team2.id, user_id: member2.id },
      ]);

      // Act - transfer captaincy for all teams
      await cascadeService.transferCaptaincy(captain.id);

      // Assert - verify both teams have new captains
      const updatedTeam1 = await db('teams').where({ id: team1.id }).first();
      const updatedTeam2 = await db('teams').where({ id: team2.id }).first();

      expect(updatedTeam1.captain_id).toBe(member1.id);
      expect(updatedTeam2.captain_id).toBe(member2.id);
      expect(updatedTeam1.captain_id).not.toBe(captain.id);
      expect(updatedTeam2.captain_id).not.toBe(captain.id);
    });
  });

  /**
   * Test 3: Cancel pending challenges
   * Verifies that all pending challenges are cancelled
   */
  describe('Test 3: Cancel pending challenges', () => {
    it('should cancel all pending challenges where user is challenger or challenged', async () => {
      // Arrange
      const [challenger] = await db('users').insert({
        email: 'challenger@example.com',
        username: 'challenger',
        full_name: 'Challenger User',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'active',
      }).returning('*');

      const [challenged] = await db('users').insert({
        email: 'challenged@example.com',
        username: 'challenged',
        full_name: 'Challenged User',
        password_hash: 'hash456',
        skill_level: 'advanced',
        status: 'active',
      }).returning('*');

      const [otherUser] = await db('users').insert({
        email: 'other@example.com',
        username: 'other',
        full_name: 'Other User',
        password_hash: 'hash789',
        skill_level: 'beginner',
        status: 'active',
      }).returning('*');

      // Create challenges table if not exists
      await db.schema.hasTable('challenges').then(async (exists) => {
        if (!exists) {
          await db.schema.createTable('challenges', (table) => {
            table.increments('id').primary();
            table.integer('challenger_id').notNullable();
            table.integer('challenged_id').notNullable();
            table.enu('status', ['pending', 'accepted', 'declined', 'cancelled']).defaultTo('pending');
            table.timestamp('created_at').defaultTo(db.fn.now());
          });
        }
      });

      // Create challenges
      const [challenge1] = await db('challenges').insert({
        challenger_id: challenger.id,
        challenged_id: otherUser.id,
        status: 'pending',
      }).returning('*');

      const [challenge2] = await db('challenges').insert({
        challenger_id: otherUser.id,
        challenged_id: challenger.id,
        status: 'pending',
      }).returning('*');

      const [challenge3] = await db('challenges').insert({
        challenger_id: challenged.id,
        challenged_id: otherUser.id,
        status: 'accepted', // Should NOT be cancelled
      }).returning('*');

      // Act - cancel pending challenges for challenger
      await cascadeService.cancelPendingChallenges(challenger.id);

      // Assert - verify pending challenges are cancelled
      const updatedChallenge1 = await db('challenges').where({ id: challenge1.id }).first();
      const updatedChallenge2 = await db('challenges').where({ id: challenge2.id }).first();
      const updatedChallenge3 = await db('challenges').where({ id: challenge3.id }).first();

      expect(updatedChallenge1.status).toBe('cancelled');
      expect(updatedChallenge2.status).toBe('cancelled');
      expect(updatedChallenge3.status).toBe('accepted'); // Should remain accepted
    });
  });

  /**
   * Test 4: Handle sole team member (delete team)
   * Verifies that when user is the sole team member, the team is deleted
   */
  describe('Test 4: Handle sole team member (delete team)', () => {
    it('should delete team when user is the only member', async () => {
      // Arrange
      const [soloUser] = await db('users').insert({
        email: 'solo@example.com',
        username: 'solo',
        full_name: 'Solo User',
        password_hash: 'hash123',
        skill_level: 'intermediate',
        status: 'active',
      }).returning('*');

      const [otherUser] = await db('users').insert({
        email: 'multi@example.com',
        username: 'multi',
        full_name: 'Multi User',
        password_hash: 'hash456',
        skill_level: 'advanced',
        status: 'active',
      }).returning('*');

      // Ensure tables exist
      await db.schema.hasTable('teams').then(async (exists) => {
        if (!exists) {
          await db.schema.createTable('teams', (table) => {
            table.increments('id').primary();
            table.string('name', 100).notNullable();
            table.integer('captain_id').notNullable();
            table.timestamp('created_at').defaultTo(db.fn.now());
          });
        }
      });

      await db.schema.hasTable('team_members').then(async (exists) => {
        if (!exists) {
          await db.schema.createTable('team_members', (table) => {
            table.increments('id').primary();
            table.integer('team_id').notNullable();
            table.integer('user_id').notNullable();
            table.timestamp('joined_at').defaultTo(db.fn.now());
          });
        }
      });

      // Create solo team (user is only member)
      const [soloTeam] = await db('teams').insert({
        name: 'Solo Team',
        captain_id: soloUser.id,
      }).returning('*');

      await db('team_members').insert({
        team_id: soloTeam.id,
        user_id: soloUser.id,
      });

      // Create multi-member team
      const [multiTeam] = await db('teams').insert({
        name: 'Multi Team',
        captain_id: otherUser.id,
      }).returning('*');

      await db('team_members').insert([
        { team_id: multiTeam.id, user_id: soloUser.id },
        { team_id: multiTeam.id, user_id: otherUser.id },
      ]);

      // Act - remove solo user from teams
      await cascadeService.removeFromTeams(soloUser.id);

      // Assert - verify solo team is deleted
      const deletedTeam = await db('teams').where({ id: soloTeam.id }).first();
      expect(deletedTeam).toBeUndefined();

      // Verify multi-member team still exists
      const existingTeam = await db('teams').where({ id: multiTeam.id }).first();
      expect(existingTeam).toBeDefined();

      // Verify solo user is removed from multi-member team
      const remainingMembers = await db('team_members')
        .where({ team_id: multiTeam.id });
      expect(remainingMembers).toHaveLength(1);
      expect(remainingMembers[0].user_id).toBe(otherUser.id);
    });

    it('should handle user with no teams (no-op)', async () => {
      // Arrange
      const [userWithNoTeams] = await db('users').insert({
        email: 'noteams@example.com',
        username: 'noteams',
        full_name: 'No Teams User',
        password_hash: 'hash123',
        skill_level: 'beginner',
        status: 'active',
      }).returning('*');

      // Ensure tables exist
      await db.schema.hasTable('teams').then(async (exists) => {
        if (!exists) {
          await db.schema.createTable('teams', (table) => {
            table.increments('id').primary();
            table.string('name', 100).notNullable();
            table.integer('captain_id').notNullable();
            table.timestamp('created_at').defaultTo(db.fn.now());
          });
        }
      });

      await db.schema.hasTable('team_members').then(async (exists) => {
        if (!exists) {
          await db.schema.createTable('team_members', (table) => {
            table.increments('id').primary();
            table.integer('team_id').notNullable();
            table.integer('user_id').notNullable();
            table.timestamp('joined_at').defaultTo(db.fn.now());
          });
        }
      });

      // Act - should not throw error
      await expect(cascadeService.removeFromTeams(userWithNoTeams.id)).resolves.not.toThrow();

      // Assert - no memberships should exist
      const memberships = await db('team_members')
        .where({ user_id: userWithNoTeams.id });
      expect(memberships).toHaveLength(0);
    });
  });
});
