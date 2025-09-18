// tests/login.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Login Tests @Regression @Login', () => {
  
    //Login exitoso
  test('@Smoke - Login exitoso', async ({ page }) => {
    // GIVEN - Usuario está en la página de login
    await page.goto('https://dashboard-test.fichap.com/#/auth/login', {
      waitUntil: 'networkidle',
      timeout: 90000
    });

    // WHEN - Usuario ingresa credenciales válidas
    await page.getByRole('textbox', { name: 'Email o Usuario' }).click();
    await page.getByRole('textbox', { name: 'Email o Usuario' }).fill(process.env.LOGIN_EMAIL);
    
    await page.getByRole('textbox', { name: 'Contraseña' }).click();
    await page.getByRole('textbox', { name: 'Contraseña' }).fill(process.env.LOGIN_PASSWORD);
    
    await page.getByRole('button', { name: 'Ingresar' }).click();
    
    // THEN - Usuario es redirigido al dashboard y ve contenido esperado
    await expect(page.locator('a').filter({ hasText: 'HR Core' })).toBeVisible();
  });



  //Login fallido por campos vacios de usuario y contraseña
test('Login fallido por campos vacios', async ({ page }) => {
      // GIVEN - Usuario está en la página de login
  await page.goto('https://dashboard-test.fichap.com/#/auth/login');

   // WHEN - Usuario no ingresa ninguna credenciales 
  await page.getByRole('textbox', { name: 'Email o Usuario' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('button', { name: 'Ingresar' }).click();

  //THEN el usuario no puede iniciar sesion y ve los carteles de advertencia
  await expect(page.locator('form')).toContainText('Por favor, ingrese su correo electrónico o usuario');
    await expect(page.locator('form')).toContainText('Por favor, ingrese su contraseña');
 });



   //Login fallido por usuario invalido
   test('Login fallido por usuario incorrecto', async ({ page }) => {
      // GIVEN - Usuario está en la página de login
  await page.goto('https://dashboard-test.fichap.com/#/auth/login');

        //WHEN - El usuario ingresa un usuario NO válido
    await page.getByRole('textbox', { name: 'Email o Usuario' }).click();
  await page.getByRole('textbox', { name: 'Email o Usuario' }).fill('usuarioFalso');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill(process.env.LOGIN_PASSWORD);
  await page.getByRole('button', { name: 'Ingresar' }).click();

      //THEN - El usuario no podra ingresar y vera el cartel de advertencia
  await expect(page.locator('.ant-notification-notice')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('El usuario no existe en la base de datos o se encuentra deshabilitado.');
});



  //Login fallido por contraseña invalida
   test('Login fallido por contraseña incorrecta', async ({ page }) => {
      // GIVEN - Usuario está en la página de login
  await page.goto('https://dashboard-test.fichap.com/#/auth/login');

    // WHEN - El usuario ingresa una contraseña NO válida
  await page.getByRole('textbox', { name: 'Email o Usuario' }).click();
  await page.getByRole('textbox', { name: 'Email o Usuario' }).fill(process.env.LOGIN_EMAIL);
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('2025CR');
  await page.getByRole('button', { name: 'Ingresar' }).click();
   //THEN - El usuario no podra ingresar y vera el cartel de advertencia
  await expect(page.locator('.ant-notification-notice')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Invalid password');
});

});