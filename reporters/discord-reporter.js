// Discord Reporter para Playwright
const fs = require('fs');
const path = require('path');

class DiscordReporter {
  constructor(options = {}) {
    this.options = options;
    this.results = [];
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
    this.projectName = process.env.PROJECT_NAME || 'Playwright Tests';
    this.environment = process.env.TEST_ENVIRONMENT || 'local';
    this.reportUrl = process.env.REPORT_URL || '';
    this.repositoryUrl = process.env.REPOSITORY_URL || '';
    this.branchName = process.env.BRANCH_NAME || process.env.GITHUB_REF_NAME || 'main';
    this.buildNumber = process.env.BUILD_NUMBER || process.env.GITHUB_RUN_NUMBER || 'local';
    this.ciUrl = process.env.CI_URL || process.env.GITHUB_SERVER_URL ? 
      `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : '';
    
    // Solo cargar axios si estamos en CI
    this.axios = null;
    if (process.env.CI || process.env.GITHUB_ACTIONS) {
      try {
        this.axios = require('axios');
      } catch (error) {
        console.warn('⚠️ axios no está instalado para Discord reporter');
      }
    }
  }

  onBegin(config, suite) {
    if (this.shouldSendToDiscord()) {
      console.log(`\n🚀 Discord Reporter - Iniciando ejecución`);
      console.log(`📊 Proyecto: ${this.projectName}`);
      console.log(`🌍 Entorno: ${this.environment}`);
      console.log(`🔗 Discord Webhook: ${this.webhookUrl ? '✅ Configurado' : '❌ No configurado'}`);
    }
    this.startTime = new Date();
    this.results = [];
  }

  onTestEnd(test, result) {
    if (!test || !result) {
      return;
    }

    const testResult = {
      name: test.title || 'Test sin título',
      fullTitle: this.getFullTitle(test),
      status: this.mapStatus(result.status),
      duration: result.duration || 0,
      error: result.error ? {
        message: result.error.message,
        stack: result.error.stack
      } : null,
      location: test.location ? {
        file: test.location.file,
        line: test.location.line,
        column: test.location.column
      } : { file: 'unknown', line: 0, column: 0 },
      tags: this.extractTags(test.title || ''),
      startTime: new Date(Date.now() - (result.duration || 0)),
      endTime: new Date(),
      retry: result.retry || 0
    };

    this.results.push(testResult);
  }

  async onEnd(result) {
    this.endTime = new Date();
    
    const summary = {
      total: this.results.length,
      passed: this.results.filter(t => t.status === 'PASSED').length,
      failed: this.results.filter(t => t.status === 'FAILED').length,
      skipped: this.results.filter(t => t.status === 'SKIPPED').length,
      duration: this.endTime - this.startTime,
      retries: this.results.filter(t => t.retry > 0).length
    };

    console.log(`\n📊 Resumen de ejecución:`);
    console.log(`   Total: ${summary.total}`);
    console.log(`   ✅ Pasaron: ${summary.passed}`);
    console.log(`   ❌ Fallaron: ${summary.failed}`);
    console.log(`   ⭐️ Omitidos: ${summary.skipped}`);
    console.log(`   🔄 Reintentos: ${summary.retries}`);
    console.log(`   ⏱️ Duración: ${Math.round(summary.duration / 1000)}s`);

    // Solo enviar a Discord si estamos en CI/CD
    if (this.shouldSendToDiscord()) {
      try {
        await this.sendToDiscord(summary);
        console.log(`✅ Resultados enviados a Discord exitosamente`);
      } catch (error) {
        console.error(`❌ Error enviando a Discord:`, error.message);
      }
    } else {
      console.log(`ℹ️ Ejecución local - Discord deshabilitado`);
    }
  }

  getFullTitle(test) {
    const titles = [];
    let current = test;
    
    while (current) {
      if (current.title) {
        titles.unshift(current.title);
      }
      current = current.parent;
    }
    
    return titles.join(' › ');
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
    const tagRegex = /@(\w+)/g;
    const tags = [];
    let match;
    while ((match = tagRegex.exec(testTitle)) !== null) {
      tags.push(match[1]);
    }
    return tags;
  }

  shouldSendToDiscord() {
    // Solo enviar en CI/CD, no en local
    return !!(this.webhookUrl && this.axios && (process.env.CI || process.env.GITHUB_ACTIONS));
  }

  getStatusEmoji(status) {
    const emojiMap = {
      'PASSED': '✅',
      'FAILED': '❌',
      'SKIPPED': '⭐'
    };
    return emojiMap[status] || '❓';
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  async sendToDiscord(summary) {
    if (!this.axios) {
      throw new Error('axios no está disponible');
    }

    const isSuccess = summary.failed === 0;
    const successRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;
    
    // Crear embed principal
    const mainEmbed = {
      title: `🎭 ${this.projectName} - Resultados de Tests`,
      description: isSuccess ? 
        `**✅ ¡Todos los tests pasaron!**` : 
        `**❌ ${summary.failed} test${summary.failed !== 1 ? 's' : ''} fallaron**`,
      color: isSuccess ? 0x00FF00 : 0xFF0000,
      timestamp: this.endTime.toISOString(),
      fields: [
        {
          name: '📊 Resumen',
          value: `${this.getStatusEmoji('PASSED')} **${summary.passed}** Pasaron\n` +
                 `${this.getStatusEmoji('FAILED')} **${summary.failed}** Fallaron\n` +
                 `${this.getStatusEmoji('SKIPPED')} **${summary.skipped}** Omitidos\n` +
                 `📈 **${successRate}%** Tasa de éxito`,
          inline: true
        },
        {
          name: '⏱️ Duración',
          value: `**${this.formatDuration(summary.duration)}**\n` +
                 `Total: **${summary.total}** tests\n` +
                 `${summary.retries > 0 ? `🔄 **${summary.retries}** reintentos` : ''}`,
          inline: true
        },
        {
          name: '🌍 Entorno',
          value: `**${this.environment}**\n` +
                 `Build: **#${this.buildNumber}**\n` +
                 `Branch: **${this.branchName}**`,
          inline: true
        }
      ],
      footer: {
        text: `Playwright Reporter`,
        icon_url: 'https://playwright.dev/img/playwright-logo.svg'
      }
    };

    // Agregar enlaces
    if (this.repositoryUrl || this.ciUrl || this.reportUrl) {
      let links = [];
      if (this.repositoryUrl) {
        links.push(`[📁 Repositorio](${this.repositoryUrl})`);
      }
      if (this.ciUrl) {
        links.push(`[🔗 Build](${this.ciUrl})`);
      }
      if (this.reportUrl) {
        links.push(`[📄 Reporte HTML](${this.reportUrl})`);
      }
      
      if (links.length > 0) {
        mainEmbed.fields.push({
          name: '🔗 Enlaces',
          value: links.join(' • '),
          inline: false
        });
      }
    }

    const payload = {
      embeds: [mainEmbed]
    };

    // Agregar detalles de tests fallidos
    if (summary.failed > 0) {
      const failedTests = this.results.filter(t => t.status === 'FAILED');
      const failedEmbed = {
        title: `❌ Tests Fallidos (${summary.failed})`,
        color: 0xFF0000,
        fields: []
      };

      const testsToShow = failedTests.slice(0, 8); // Mostrar máximo 8
      
      for (const test of testsToShow) {
        const errorMsg = test.error?.message || 'Error desconocido';
        const truncatedError = errorMsg.length > 150 ? 
          errorMsg.substring(0, 150) + '...' : errorMsg;
        
        failedEmbed.fields.push({
          name: `🔴 ${test.name}`,
          value: `**Archivo:** \`${path.basename(test.location.file)}:${test.location.line}\`\n` +
                 `**Error:** ${truncatedError}`,
          inline: false
        });
      }

      if (failedTests.length > 8) {
        failedEmbed.fields.push({
          name: '⚠️ Más fallos',
          value: `... y ${failedTests.length - 8} tests más fallaron. Ver reporte HTML para detalles completos.`,
          inline: false
        });
      }

      payload.embeds.push(failedEmbed);
    }

    console.log(`📤 Enviando a Discord...`);
    
    const response = await this.axios.post(this.webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000
    });

    return response.data;
  }
}

module.exports = DiscordReporter;