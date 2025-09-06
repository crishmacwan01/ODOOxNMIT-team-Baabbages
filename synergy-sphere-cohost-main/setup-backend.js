#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 SynergySphere Backend Setup\n');

const questions = [
  {
    key: 'VITE_SUPABASE_URL',
    question: 'Enter your Supabase Project URL: ',
    validate: (value) => value.includes('supabase.co'),
    error: 'Please enter a valid Supabase URL (should contain supabase.co)'
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    question: 'Enter your Supabase Anon Key: ',
    validate: (value) => value.length > 20,
    error: 'Please enter a valid Supabase anon key (should be longer than 20 characters)'
  }
];

const envContent = [];

function askQuestion(index) {
  if (index >= questions.length) {
    // Add default values
    envContent.push('VITE_DEBUG=true');
    envContent.push('VITE_API_TIMEOUT=10000');
    envContent.push('');
    
    // Write .env file
    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent.join('\n'));
    
    console.log('\n✅ Environment file created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Copy the content from synergy-sphere-cohost-main/database_setup.sql');
    console.log('4. Paste and run the SQL script');
    console.log('5. Run: npm run dev');
    console.log('\n🎉 Your backend is ready!');
    
    rl.close();
    return;
  }

  const question = questions[index];
  rl.question(question.question, (answer) => {
    if (question.validate(answer)) {
      envContent.push(`${question.key}=${answer}`);
      askQuestion(index + 1);
    } else {
      console.log(`❌ ${question.error}\n`);
      askQuestion(index);
    }
  });
}

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  rl.question('⚠️  .env file already exists. Overwrite? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      askQuestion(0);
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  askQuestion(0);
}
