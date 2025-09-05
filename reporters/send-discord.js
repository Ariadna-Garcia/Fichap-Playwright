const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const dayjs = require('dayjs');

dotenv.config();

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const project = process.env.TEST_MANAGER_PROJECT_CODE || 'Proyecto';
const environment = process.env.TEST_ENVIRONMENT || 'Desconocido';

const reportDir = 'playwright-report';
const runId = process.argv[2] || dayjs().format('YYYYMMDD-HHmmss');

async function sendDiscordMessage() {
  if (!webhookUrl) {
    console.error('❌ DISCORD_WEBHOOK_URL no está definido en el entorno.');
    return;
  }

  // Generamos el link al HTML Report
  const reportUrl = `https://github.com/Ariadna-Garcia/Fichap-Playwright/actions/runs/${runId}`;
  const summaryPath = path.join('test-results', 'test-manager');
  const reportFiles = fs.readdirSync(summaryPath).filter(f => f.endsWith('.json'));
  const latestReport = reportFiles.sort().reverse()[0];
  const report = JSON.parse(fs.readFileSync(path.join(summaryPath, latestReport), 'utf-8'));

  const passed = report.summary.passed || 0;
  const failed = report.summary.failed || 0;
  const total = report.summary.total || passed + failed;
  const duration = report.summary.duration || 0;

  const embed = {
    title: '📢 Playwright Test Report',
    description: `**📁 Proyecto:** ${project}\n**🌐 Entorno:** ${environment}\n\n✅ Pasaron: ${passed}\n❌ Fallaron: ${failed}\n⏱️ Duración: ${duration}s\n🗂️ Total: ${total}\n\n🔗 [Ver reporte en GitHub Actions](${reportUrl})`,
    color: failed > 0 ? 16711680 : 65280, // Rojo si fallaron tests, verde si todos pasaron
    timestamp: new Date().toISOString()
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });

    if (res.ok) {
      console.log('📨 Reporte enviado a Discord');
    } else {
      console.error(`❌ Error al enviar a Discord: ${res.status}`);
    }
  } catch (err) {
    console.error('❌ Error de red al enviar a Discord:', err.message);
  }
}

sendDiscordMessage();
