const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(sourceDir, '..');
const destDir = path.join(workspaceRoot, 'QE190108');
const stagingDir = path.join(workspaceRoot, 'staging_QE190108');
const zipPath = path.join(destDir, 'QE190108.zip');
const docxPath = path.join(destDir, 'QE190108.docx');

console.log('===> Bắt đầu chuẩn bị gói nộp bài QE190108 (2 trong 1)...');

// 1. Reset staging & destDir
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}
if (fs.existsSync(zipPath)) {
  fs.rmSync(zipPath, { force: true });
}

// 2. Copy root files
const rootFiles = [
  'package.json',
  'package-lock.json',
  'app.json',
  'App.js',
  'index.js',
  'eas.json',
  'eslint.config.js',
  'LICENSE',
  'AGENTS.md',
  'firestore.rules',
  '.env.example',
  '.gitignore',
];

for (const file of rootFiles) {
  const src = path.join(sourceDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(stagingDir, file));
  }
}

// 3. Copy directories recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', '.git', '.expo', '.env'].includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(path.join(sourceDir, 'src'), path.join(stagingDir, 'src'));
copyDir(path.join(sourceDir, 'assets'), path.join(stagingDir, 'assets'));
copyDir(path.join(sourceDir, 'scripts'), path.join(stagingDir, 'scripts'));

// 4. Attach QE190108.docx report
if (fs.existsSync(docxPath)) {
  fs.copyFileSync(docxPath, path.join(stagingDir, 'QE190108.docx'));
  console.log('[+] Đã đính kèm file báo cáo QE190108.docx vào thư mục gốc của gói nộp bài.');
} else {
  console.warn('[-] Cảnh báo: Không tìm thấy file báo cáo tại:', docxPath);
}

// 5. Verify NO forbidden files in staging
const forbidden = ['.env', '.git', 'node_modules', '.expo'];
for (const bad of forbidden) {
  if (fs.existsSync(path.join(stagingDir, bad))) {
    throw new Error(`Forbidden file/dir found in staging: ${bad}`);
  }
}

// 6. Create ZIP archive using Windows tar.exe
console.log('===> Đang nén file zip chuẩn UTF-8...');
execSync(`tar -a -c -f "${zipPath}" -C "${stagingDir}" .`, { stdio: 'inherit' });

// 7. Clean staging
try {
  fs.rmSync(stagingDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
} catch (e) {
  // If Windows locks folder temporarily, ignore
}
console.log(`===> [THÀNH CÔNG] Đã tạo file: ${zipPath}`);

// 8. Inspect zip contents using tar -tf
console.log('\n--- Kiểm tra danh sách file trong gói QE190108.zip: ---');
const list = execSync(`tar -tf "${zipPath}"`, { encoding: 'utf8' }).trim().split(/\r?\n/);
console.log(`Tổng số entries: ${list.length}`);
const rootEntries = list.filter((item) => !item.includes('/') && !item.includes('\\'));
console.log('Các file nằm ngay thư mục gốc (Root):');
rootEntries.forEach((e) => console.log(`  * ${e}`));
