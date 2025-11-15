import db from '../../../shared/database/connection';
import { Knex } from 'knex';

/**
 * UserCascadeService
 * Handles cascade effects when a user is deleted
 * Manages team removal, captain transfer, challenge cancellation, and stats archival
 */
export class UserCascadeService {
  /**
   * Main cascade handler for user deletion
   * Orchestrates all cascade operations in proper order
   * @param userId - User ID to cascade delete
   */
  async handleUserDeletionCascade(userId: number): Promise<void> {
    if (!userId || userId <= 0) {
      throw new Error('Invalid user ID');
    }

    try {
      // Use transaction to ensure atomicity
      await db.transaction(async (trx) => {
        // Execute cascade operations in order
        await this.cancelPendingChallenges(userId, trx);
        await this.archiveUserStats(userId, trx);
        await this.transferCaptaincy(userId, trx);
        await this.removeFromTeams(userId, trx);
        await this.clearUserSports(userId, trx);
        await this.removeFromPickleballLeagues(userId, trx);
        await this.removeFromPaddleTournaments(userId, trx);
      });
    } catch (error) {
      console.error('Error in handleUserDeletionCascade:', error);
      throw error;
    }
  }

  /**
   * Remove user from all teams
   * If user is sole member, delete the team
   * @param userId - User ID
   * @param trx - Optional transaction
   */
  async removeFromTeams(userId: number, trx?: Knex.Transaction): Promise<void> {
    const query = trx || db;

    try {
      // Get all teams the user is a member of
      const userTeams = await query('team_members')
        .select('team_id')
        .where({ user_id: userId });

      // For each team, check if user is sole member
      for (const { team_id } of userTeams) {
        const memberCount = await query('team_members')
          .count('* as count')
          .where({ team_id })
          .first();

        const count = parseInt(memberCount?.count as string || '0', 10);

        if (count === 1) {
          // User is sole member - delete the team
          await query('teams').where({ id: team_id }).delete();
        }
      }

      // Remove user from all teams
      await query('team_members').where({ user_id: userId }).delete();
    } catch (error: any) {
      // If tables don't exist yet (early development), log but don't fail
      if (error.code === '42P01') {
        console.log('Team tables not yet created - skipping team removal');
        return;
      }
      throw error;
    }
  }

  /**
   * Transfer captaincy if user is captain of any teams
   * Assigns first available team member as new captain
   * @param userId - User ID
   * @param trx - Optional transaction
   */
  async transferCaptaincy(userId: number, trx?: Knex.Transaction): Promise<void> {
    const query = trx || db;

    try {
      // Get all teams where user is captain
      const captainTeams = await query('teams')
        .select('id')
        .where({ captain_id: userId });

      // For each team, transfer captaincy
      for (const team of captainTeams) {
        // Find first team member who isn't the current captain
        const newCaptain = await query('team_members')
          .select('user_id')
          .where({ team_id: team.id })
          .whereNot({ user_id: userId })
          .first();

        if (newCaptain) {
          // Transfer captaincy to new captain
          await query('teams')
            .update({ captain_id: newCaptain.user_id })
            .where({ id: team.id });
        }
        // If no eligible replacement, the team will be deleted by removeFromTeams
      }
    } catch (error: any) {
      // If tables don't exist yet (early development), log but don't fail
      if (error.code === '42P01') {
        console.log('Team tables not yet created - skipping captain transfer');
        return;
      }
      throw error;
    }
  }

  /**
   * Cancel all pending challenges created by or involving the user
   * @param userId - User ID
   * @param trx - Optional transaction
   */
  async cancelPendingChallenges(userId: number, trx?: Knex.Transaction): Promise<void> {
    const query = trx || db;

    try {
      // Cancel challenges where user is challenger
      await query('challenges')
        .update({ status: 'cancelled' })
        .where({ challenger_id: userId, status: 'pending' });

      // Cancel challenges where user is challenged
      await query('challenges')
        .update({ status: 'cancelled' })
        .where({ challenged_id: userId, status: 'pending' });
    } catch (error: any) {
      // If tables don't exist yet (early development), log but don't fail
      if (error.code === '42P01') {
        console.log('Challenge tables not yet created - skipping challenge cancellation');
        return;
      }
      throw error;
    }
  }

  /**
   * Archive user statistics before deletion
   * Moves stats to archive table for historical records
   * @param userId - User ID
   * @param trx - Optional transaction
   */
  async archiveUserStats(userId: number, trx?: Knex.Transaction): Promise<void> {
    const query = trx || db;

    try {
      // Check if user_stats table exists first (avoid transaction abort)
      const tableExists = await query.raw(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'user_stats'
        )
      `);

      if (!tableExists.rows[0].exists) {
        console.log('Stats tables not yet created - skipping stats archival');
        return;
      }

      // Get user stats
      const stats = await query('user_stats')
        .select('*')
        .where({ user_id: userId })
        .first();

      if (stats) {
        // Check if archive table exists
        const archiveTableExists = await query.raw(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'user_stats_archive'
          )
        `);

        if (!archiveTableExists.rows[0].exists) {
          console.log('Stats archive table not yet created - skipping stats archival');
          return;
        }

        // Insert into archive table
        await query('user_stats_archive').insert({
          ...stats,
          archived_at: new Date(),
        });

        // Delete from active stats
        await query('user_stats').where({ user_id: userId }).delete();
      }
    } catch (error: any) {
      // If tables don't exist yet (early development), log but don't fail
      if (error.code === '42P01') {
        console.log('Stats tables not yet created - skipping stats archival');
        return;
      }
      throw error;
    }
  }

  /**
   * Clear user sports associations
   * @param userId - User ID
   * @param trx - Optional transaction
   */
  async clearUserSports(userId: number, trx?: Knex.Transaction): Promise<void> {
    const query = trx || db;

    try {
      await query('user_sports').where({ user_id: userId }).delete();
    } catch (error: any) {
      // If tables don't exist yet (early development), log but don't fail
      if (error.code === '42P01') {
        console.log('User sports table not yet created - skipping sports clearing');
        return;
      }
      throw error;
    }
  }

  /**
   * Remove user from pickleball leagues
   * @param userId - User ID
   * @param trx - Optional transaction
   */
  async removeFromPickleballLeagues(userId: number, trx?: Knex.Transaction): Promise<void> {
    const query = trx || db;

    try {
      // Check if table exists first (avoid transaction abort)
      const tableExists = await query.raw(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'pickleball_league_members'
        )
      `);

      if (!tableExists.rows[0].exists) {
        console.log('Pickleball league tables not yet created - skipping league removal');
        return;
      }

      await query('pickleball_league_members')
        .where({ user_id: userId })
        .delete();
    } catch (error: any) {
      // If tables don't exist yet (early development), log but don't fail
      if (error.code === '42P01') {
        console.log('Pickleball league tables not yet created - skipping league removal');
        return;
      }
      throw error;
    }
  }

  /**
   * Remove user from paddle tournaments
   * @param userId - User ID
   * @param trx - Optional transaction
   */
  async removeFromPaddleTournaments(userId: number, trx?: Knex.Transaction): Promise<void> {
    const query = trx || db;

    try {
      // Check if table exists first (avoid transaction abort)
      const tableExists = await query.raw(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'paddle_tournament_participants'
        )
      `);

      if (!tableExists.rows[0].exists) {
        console.log('Paddle tournament tables not yet created - skipping tournament removal');
        return;
      }

      await query('paddle_tournament_participants')
        .where({ user_id: userId })
        .delete();
    } catch (error: any) {
      // If tables don't exist yet (early development), log but don't fail
      if (error.code === '42P01') {
        console.log('Paddle tournament tables not yet created - skipping tournament removal');
        return;
      }
      throw error;
    }
  }
}
