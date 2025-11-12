import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Delete existing data (in reverse order due to foreign keys)
  await knex('user_sports').del();
  await knex('users').del();

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Insert test users
  const users = await knex('users')
    .insert([
      {
        username: 'john_cricket',
        email: 'john@example.com',
        password_hash: hashedPassword,
        full_name: 'John Smith',
        bio: 'Cricket enthusiast and weekend warrior',
        location_city: 'Mumbai',
        location_country: 'India',
        date_of_birth: '1995-05-15',
        is_verified: true,
        is_active: true,
      },
      {
        username: 'sarah_football',
        email: 'sarah@example.com',
        password_hash: hashedPassword,
        full_name: 'Sarah Johnson',
        bio: 'Football player, team captain',
        location_city: 'Bangalore',
        location_country: 'India',
        date_of_birth: '1998-08-22',
        is_verified: true,
        is_active: true,
      },
      {
        username: 'mike_tennis',
        email: 'mike@example.com',
        password_hash: hashedPassword,
        full_name: 'Mike Chen',
        bio: 'Tennis player looking for doubles partner',
        location_city: 'Delhi',
        location_country: 'India',
        date_of_birth: '1992-03-10',
        is_verified: true,
        is_active: true,
      },
      {
        username: 'priya_badminton',
        email: 'priya@example.com',
        password_hash: hashedPassword,
        full_name: 'Priya Sharma',
        bio: 'Badminton enthusiast and tournament player',
        location_city: 'Chennai',
        location_country: 'India',
        date_of_birth: '1997-11-30',
        is_verified: false,
        is_active: true,
      },
      {
        username: 'alex_multisport',
        email: 'alex@example.com',
        password_hash: hashedPassword,
        full_name: 'Alex Kumar',
        bio: 'Multi-sport athlete, love competing',
        location_city: 'Pune',
        location_country: 'India',
        date_of_birth: '1994-07-18',
        is_verified: true,
        is_active: true,
      },
    ])
    .returning(['id', 'username']);

  // Insert user sports preferences
  await knex('user_sports').insert([
    // John - Cricket
    {
      user_id: users.find((u) => u.username === 'john_cricket')?.id,
      sport_name: 'Cricket',
      skill_level: 'advanced',
      years_experience: 8,
      preferred_position: 'Batsman',
    },
    // Sarah - Football
    {
      user_id: users.find((u) => u.username === 'sarah_football')?.id,
      sport_name: 'Football',
      skill_level: 'advanced',
      years_experience: 6,
      preferred_position: 'Midfielder',
    },
    // Mike - Tennis
    {
      user_id: users.find((u) => u.username === 'mike_tennis')?.id,
      sport_name: 'Tennis',
      skill_level: 'intermediate',
      years_experience: 4,
      preferred_position: 'Singles/Doubles',
    },
    // Priya - Badminton
    {
      user_id: users.find((u) => u.username === 'priya_badminton')?.id,
      sport_name: 'Badminton',
      skill_level: 'expert',
      years_experience: 10,
      preferred_position: 'Singles',
    },
    // Alex - Multiple sports
    {
      user_id: users.find((u) => u.username === 'alex_multisport')?.id,
      sport_name: 'Football',
      skill_level: 'intermediate',
      years_experience: 5,
      preferred_position: 'Forward',
    },
    {
      user_id: users.find((u) => u.username === 'alex_multisport')?.id,
      sport_name: 'Cricket',
      skill_level: 'beginner',
      years_experience: 2,
      preferred_position: 'Bowler',
    },
    {
      user_id: users.find((u) => u.username === 'alex_multisport')?.id,
      sport_name: 'Basketball',
      skill_level: 'intermediate',
      years_experience: 3,
      preferred_position: 'Guard',
    },
  ]);

  console.log('✅ Seeded 5 test users with sports preferences');
}
