// tests/documents.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Fichap Dashboard - Documents', () => {


//Visualizacion de tag documento en el dashboard y entrar a la card
      test('Visualizacion de tag documento en el dashboard', async ({ page }) => {
    // GIVEN - Usuario está en la página de login
      await page.goto('https://dashboard-test.fichap.com/#/auth/login');

      //WHEN - el usuario visualiza el tag documentos
  await expect(page.getByRole('link', { name: 'Documentos 11 Disconformidades' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Documentos 11 Disconformidades' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Documentos');

  //THEN - el usuario ingresa a la pantalla documentos
   await page.getByRole('link', { name: 'Documentos 11 Disconformidades' }).click();
  await expect(page.locator('.right-panel')).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Documentos');
  await expect(page.getByRole('heading', { name: 'Sobres' })).toBeVisible();
});





});

















    });