const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const saltRounds = 10;
const defaultPassword = 'parola123';

const users = [
  { email: 'admin@exemplu.com', first_name: 'Admin', last_name: 'System', role: 'admin', is_approved: true },
  { email: 'editor1@exemplu.com', first_name: 'Elena', last_name: 'Popescu', role: 'editor', is_approved: true },
  { email: 'editor2@exemplu.com', first_name: 'Mihai', last_name: 'Ionescu', role: 'editor', is_approved: true },
  { email: 'recenzor.med@exemplu.com', first_name: 'Andrei', last_name: 'Vasilescu', role: 'reviewer', is_approved: true, expertise: ['Medicina', 'Farmacologie'] },
  { email: 'recenzor.cs@exemplu.com', first_name: 'Ioana', last_name: 'Georgescu', role: 'reviewer', is_approved: true, expertise: ['Informatica', 'Matematica'] },
  { email: 'recenzor.asteptare@exemplu.com', first_name: 'Cristina', last_name: 'Stan', role: 'reviewer', is_approved: false, expertise: ['Biologie'] },
];

const journals = [
  { editorEmail: 'editor1@exemplu.com', title: 'Jurnalul de Studii Cardiologice Avansate', description: 'O publicație dedicată ultimelor cercetări în cardiologie.', domainName: 'Medicina', status: 'pending' },
  { editorEmail: 'editor1@exemplu.com', title: 'Perspective în Farmacoterapia Modernă', description: 'Analize despre medicamente inovatoare.', domainName: 'Farmacologie', status: 'assigned' },
  { editorEmail: 'editor2@exemplu.com', title: 'Algoritmi și Structuri de Date Aplicate', description: 'Cercetare în domeniul optimizării algoritmilor.', domainName: 'Informatica', status: 'in_review' },
  { editorEmail: 'editor2@exemplu.com', title: 'Teoria Jocurilor în Psihologie', description: 'Un review completat.', domainName: 'Psihologie', status: 'completed' },
];

const assignments = [
    { journalTitle: 'Perspective în Farmacoterapia Modernă', reviewerEmail: 'recenzor.med@exemplu.com', status: 'pending' },
    { journalTitle: 'Algoritmi și Structuri de Date Aplicate', reviewerEmail: 'recenzor.cs@exemplu.com', status: 'accepted', reviewer_finished: true, editor_confirmed: false },
    { journalTitle: 'Teoria Jocurilor în Psihologie', reviewerEmail: 'recenzor.cs@exemplu.com', status: 'completed', reviewer_finished: true, editor_confirmed: true, rating_given: 5 },
];


const seedDatabase = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    });
    console.log(' Connected to the database.');

    console.log(' Clearing old data...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.execute('TRUNCATE TABLE notifications');
    await connection.execute('TRUNCATE TABLE reviews');
    await connection.execute('TRUNCATE TABLE forum_messages');
    await connection.execute('TRUNCATE TABLE journal_assignments');
    await connection.execute('TRUNCATE TABLE journals');
    await connection.execute('TRUNCATE TABLE reviewer_expertise');
    await connection.execute('TRUNCATE TABLE users');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1;');
    console.log(' Old data cleared.');
    
    const [domainRows] = await connection.execute('SELECT id, name FROM domains');
    const domainMap = domainRows.reduce((map, d) => ({ ...map, [d.name]: d.id }), {});
    console.log(' Domains mapped.');

    console.log(' Seeding users...');
    const password_hash = await bcrypt.hash(defaultPassword, saltRounds);
    for (const user of users) {
      await connection.execute(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_approved) VALUES (?, ?, ?, ?, ?, ?)`,
        [user.email, password_hash, user.first_name, user.last_name, user.role, user.is_approved]
      );
    }
    
    const [userRows] = await connection.execute('SELECT id, email FROM users');
    const userMap = userRows.reduce((map, u) => ({ ...map, [u.email]: u.id }), {});

    for (const user of users) {
        if (user.role === 'reviewer' && user.expertise) {
            for (const domainName of user.expertise) {
                if (domainMap[domainName]) {
                    await connection.execute('INSERT INTO reviewer_expertise (user_id, domain_id) VALUES (?, ?)', [userMap[user.email], domainMap[domainName]]);
                } else {
                    console.warn(` SKIPPING expertise: Domain "${domainName}" not found in domains table.`);
                }
            }
        }
    }
    console.log(' Users and expertise seeded.');

    console.log(' Seeding journals...');
    for (const journal of journals) {
        if (!userMap[journal.editorEmail]) {
            console.warn(` SKIPPING journal: Editor with email "${journal.editorEmail}" not found.`);
            continue;
        }
        if (!domainMap[journal.domainName]) {
            console.warn(` SKIPPING journal: Domain "${journal.domainName}" not found.`);
            continue;
        }
        await connection.execute(
            'INSERT INTO journals (editor_id, title, description, domain_id, status) VALUES (?, ?, ?, ?, ?)',
            [userMap[journal.editorEmail], journal.title, journal.description, domainMap[journal.domainName], journal.status]
        );
    }
    console.log(' Journals seeded.');

    const [journalRows] = await connection.execute('SELECT id, title, editor_id FROM journals');
    const journalMap = journalRows.reduce((map, j) => ({ ...map, [j.title]: {id: j.id, editor_id: j.editor_id} }), {});

    console.log(' Seeding assignments...');
    for (const a of assignments) {
        const journalData = journalMap[a.journalTitle];
        const reviewerId = userMap[a.reviewerEmail];

        if (!journalData) {
            console.warn(` SKIPPING assignment: Journal with title "${a.journalTitle}" not found.`);
            continue;
        }
        if (!reviewerId) {
            console.warn(` SKIPPING assignment: Reviewer with email "${a.reviewerEmail}" not found.`);
            continue;
        }

        const journalId = journalData.id;
        const editorId = journalData.editor_id;

        await connection.execute(
            `INSERT INTO journal_assignments (journal_id, reviewer_id, editor_id, status, reviewer_finished, editor_confirmed, rating_given) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [journalId, reviewerId, editorId, a.status, a.reviewer_finished || false, a.editor_confirmed || false, a.rating_given || null]
        );
    }
    console.log(' Assignments seeded.');

    console.log(' Calculating average ratings...');
    const [reviewers] = await connection.execute("SELECT id FROM users WHERE role = 'reviewer'");
    for (const reviewer of reviewers) {
        await connection.query(`
            UPDATE users u
            SET average_rating = (SELECT AVG(ja.rating_given) FROM journal_assignments ja WHERE ja.reviewer_id = ? AND ja.rating_given IS NOT NULL)
            WHERE u.id = ?`,
            [reviewer.id, reviewer.id]
        );
    }
    console.log(' Ratings calculated.');

    console.log('\n\n Database seeding completed successfully!');

  } catch (error) {
    console.error('\n Error during database seeding:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n Connection closed.');
    }
  }
};

seedDatabase();