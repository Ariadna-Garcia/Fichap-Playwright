const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
require('dotenv').config();

class TestManagerReporter {
  constructor() {
    this.results = [];
    this.runInfo = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
    };
    this.startTime = null;
  }

  onBegin(config, suite) {
    this.startTime = Date.now();
    console.log(`\n🚀 Iniciando ejecución: ${process.env.TEST_MANAGER_RUN_NAME}`);
    console.log(`📁 Proyecto: ${process.env.TEST_MANAGER_PROJECT_CODE}`);
    console.log(`🌐 Entorno: ${process.env.TEST_ENVIRONMENT}`);
    console.log(`🔗 API Host: ${process.env.TEST_MANAGER_API_HOST?.replace(/\\/g, '')}`);
    console.log(`👤 Usuario: ${process.env.TEST_MANAGER_USERNAME}`);
    console.log(`📊 Test Manager: ✅ Activo\n`);
  }

  onTestEnd(test, result) {
    this.runInfo.total++;
    if (result.status === 'passed') this.runInfo.passed++;
    else if (result.status === 'failed') this.runInfo.failed++;
    else if (result.status === 'skipped') this.runInfo.skipped++;

    this.results.push({
      title: test.title,
      status: result.status,
      duration: result.duration,
      error: result.error,
      projectName: test.parent?.project()?.name,
    });
  }

  async onEnd(result) {
    const endTime = Date.now();
    this.runInfo.duration = Math.round((endTime - this.startTime) / 1000);

    const summary = this.runInfo;
    const timestamp = dayjs().toISOString().replace(/:/g, '-');
    const reportDir = path.join('test-results', 'test-manager');
    const reportPath = path.join(reportDir, `test-manager-report-${timestamp}.json`);

    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify({ summary, results: this.results }, null, 2));

    console.log(`📊 Resumen de ejecución:`);
    console.log(`   Total: ${summary.total}`);
    console.log(`   ✅ Pasaron: ${summary.passed}`);
    console.log(`   ❌ Fallaron: ${summary.failed}`);
    console.log(`   ⏭️  Omitidos: ${summary.skipped}`);
    console.log(`   ⏱️  Duración: ${summary.duration}s`);
    console.log(`📄 Reporte guardado en: ${reportPath}\n`);

    await this.sendToDiscord(summary, process.env.TEST_ENVIRONMENT);
  }

  async sendToDiscord(summary, environment) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    const payload = {
      content: `📢 **Playwright Test Report**\n📁 Proyecto: ${process.env.TEST_MANAGER_PROJECT_CODE || 'Desconocido'}\n🌐 Entorno: ${environment || 'N/A'}\n✅ Pasaron: ${summary.passed}\n❌ Fallaron: ${summary.failed}\n⏱️ Duración: ${summary.duration}s\n🗂️ Total: ${summary.total}`
    };

    try {
      await axios.post(webhookUrl, payload);
      console.log('📨 Reporte enviado a Discord');
    } catch (error) {
      console.error('❌ Error al enviar a Discord:', error.message);
    }
  }
}

module.exports = TestManagerReporter;