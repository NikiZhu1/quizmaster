const { spawn } = require('child_process');

console.log('🧪 Запуск тестов с отладкой...');

const tests = [
  'src/utils/__tests__/categoryUtils.test.jsx',
  'src/hooks/__tests__/useUsers.test.jsx',
  'src/components/__tests__/AuthForm.test.jsx',
  'src/API methods/__tests__/usersMethods.test.js',
  'src/pages/__tests__/Login.test.jsx',
  'src/App.test.jsx',
];

let passed = 0;
let failed = 0;

const runTest = (testFile) => {
  return new Promise((resolve) => {
    const jestProcess = spawn('npx', ['jest', testFile, '--verbose', '--no-coverage'], {
      stdio: 'pipe',
      shell: true,
    });

    let output = '';
    
    jestProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    jestProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    jestProcess.on('close', (code) => {
      console.log(`\n📄 Тест: ${testFile}`);
      console.log('─'.repeat(50));
      
      if (code === 0) {
        console.log('✅ Успешно');
        passed++;
      } else {
        console.log('❌ Провален');
        console.log(output);
        failed++;
      }
      
      resolve();
    });
  });
};

const runAllTests = async () => {
  console.log('🚀 Запускаем тесты по очереди...\n');
  
  for (const testFile of tests) {
    await runTest(testFile);
  }
  
  console.log('\n📊 Итог:');
  console.log('─'.repeat(50));
  console.log(`✅ Успешно: ${passed}`);
  console.log(`❌ Провалено: ${failed}`);
  console.log(`📈 Общий процент: ${Math.round((passed / (passed + failed)) * 100)}%`);
};

runAllTests();