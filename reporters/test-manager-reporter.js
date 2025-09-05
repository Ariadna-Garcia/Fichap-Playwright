const axios = require('axios');
const fs = require('fs');
const path = require('path');

class TestManagerReporter {
  constructor(options = {}) {
    this.options = options;
    this.results = [];
    this.runName = process.env.TEST_MANAGER_RUN_NAME || 'Playwright Automation';
    this.projectCode = process.env.TEST_MANAGER_PROJECT_CODE || '';
    this.apiHost = process.env.TEST_MANAGER_API_HOST || '';
    this.username = process.env.TEST_MANAGER_USERNAME || '';
    this.password = process.env.TEST_MANAGER_PASSWORD || '';
    this.repositoryUrl = process.env.TEST_MANAGER_REPOSITORY_URL || '';
    this.repositoryBranch = process.env.TEST_MANAGER_REPOSITORY_BRANCH || 'main';
    this.environment = process.env.TEST_ENVIRONMENT || 'Dev';
  }

  onBegin(config, suite) {
    console.log(`🚀 Iniciando ejecución: ${this.runName}`);
    console.log(`📁 Proyecto: ${this.projectCode}`);
    console.log(`🌐 Entorno: ${this.environment}`);
    this.startTime = new Date();
  }

  onTestEnd(test, result) {
    const testResult = {
      name: test.title,
      fullTitle: `${test.parent.title} ${test.title}`,
      status: this.mapStatus(result.status),
      duration: result.duration,
      error: result.error ? {
        message: result.error.message,
        stack: result.error.stack
      } : null,
      steps: result.steps ? result.steps.map(step => ({
        title: step.title,
        duration: step.duration,
        error: step.error
      })) : [],
      attachments: result.attachments ? result.attachments.map(att => ({
        name: att.name,
        path: att.path,
        contentType: att.contentType
      })) : [],
      location: {
        file: test.location.file,
        line: test.location.line,
        column: test.location.column
      },
      tags: this.extractTags(test.title),
      startTime: new Date(Date.now() - result.duration),
      endTime: new Date()
    };

    this.results.push(testResult);
  }

  async onEnd(result) {
    this.endTime = new Date();
    
    const summary = {
      total: result.allTests.length,
      passed: this.results.filter(t => t.status === 'PASSED').length,
      failed: this.results.filter(t => t.status === 'FAILED').length,
      skipped: this.results.filter(t => t.status === 'SKIPPED').length,
      duration: this.endTime - this.startTime
    };

    console.log(`\n📊 Resumen de ejecución:`);
    console.log(`   Total: ${summary.total}`);
    console.log(`   ✅ Pasaron: ${summary.passed}`);
    console.log(`   ❌ Fallaron: ${summary.failed}`);
    console.log(`   ⏭️  Omitidos: ${summary.skipped}`);
    console.log(`   ⏱️  Duración: ${Math.round(summary.duration / 1000)}s`);

    // Guardar resultados localmente
    await this.saveLocalResults(summary);

    // Enviar a Test Manager si está configurado
    if (this.shouldSendToTestManager()) {
      try {
        await this.sendToTestManager(summary);
        console.log(`✅ Resultados enviados a Test Manager exitosamente`);
      } catch (error) {
        console.error(`❌ Error enviando a Test Manager:`, error.message);
      }
    } else {
      console.log(`ℹ️  Test Manager no configurado - resultados guardados localmente`);
    }
  }

  mapStatus(playwrightStatus) {
    const statusMap = {
      'passed': 'PASSED',
      'failed': 'FAILED',
      'timedOut': 'FAILED',
      'skipped': 'SKIPPED'
    };
    return statusMap[playwrightStatus] || 'FAILED';
  }

  extractTags(testTitle) {
    // Extraer tags del título como @tag1 @tag2
    const tagRegex = /@(\w+)/g;
    const tags = [];
    let match;
    while ((match = tagRegex.exec(testTitle)) !== null) {
      tags.push(match[1]);
    }
    return tags;
  }

  shouldSendToTestManager() {
    return this.apiHost && this.projectCode && this.username && this.password;
  }

  async saveLocalResults(summary) {
    const reportData = {
      runInfo: {
        name: this.runName,
        projectCode: this.projectCode,
        environment: this.environment,
        startTime: this.startTime,
        endTime: this.endTime,
        duration: this.endTime - this.startTime,
        repositoryUrl: this.repositoryUrl,
        repositoryBranch: this.repositoryBranch
      },
      summary,
      results: this.results
    };

    // Crear directorio de reportes si no existe
    const reportsDir = 'test-results/test-manager';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Guardar reporte completo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportsDir, `test-manager-report-${timestamp}.json`);
    
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    console.log(`📄 Reporte guardado en: ${reportFile}`);
  }

  async sendToTestManager(summary) {
    const payload = {
      runName: this.runName,
      projectCode: this.projectCode,
      environment: this.environment,
      repositoryUrl: this.repositoryUrl,
      repositoryBranch: this.repositoryBranch,
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString(),
      summary: {
        total: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        skipped: summary.skipped,
        duration: summary.duration
      },
      testResults: this.results.map(result => ({
        testName: result.name,
        fullName: result.fullTitle,
        status: result.status,
        duration: result.duration,
        errorMessage: result.error ? result.error.message : null,
        stackTrace: result.error ? result.error.stack : null,
        tags: result.tags,
        location: result.location,
        steps: result.steps,
        attachments: result.attachments,
        startTime: result.startTime.toISOString(),
        endTime: result.endTime.toISOString()
      }))
    };

    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    
    const response = await axios.post(this.apiHost, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      timeout: 30000
    });

    return response.data;
  }
}

module.exports = TestManagerReporter;