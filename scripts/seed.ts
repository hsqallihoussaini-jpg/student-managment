import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with test users...');

    // Create test student
    const studentResponse = await fetch(`${API_URL}/api/auth/register-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '0612345678',
      }),
    });

    if (studentResponse.ok) {
      console.log('✅ Test student created: student@test.com / password123');
    } else {
      console.log('ℹ️ Student already exists or error:', await studentResponse.text());
    }

    // Create test teacher
    const teacherResponse = await fetch(`${API_URL}/api/auth/register-teacher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'Marie',
        lastName: 'Martin',
        department: 'Informatique',
        specialization: 'Web Development',
        office: 'Room 101',
      }),
    });

    if (teacherResponse.ok) {
      console.log('✅ Test teacher created: teacher@test.com / password123');
    } else {
      console.log('ℹ️ Teacher already exists or error:', await teacherResponse.text());
    }

    console.log('✨ Database seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seedDatabase();
