# Page snapshot

```yaml
- main [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - img "Fichap" [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e14] [cursor=pointer]: es
        - generic [ref=e15] [cursor=pointer]: ¿No tienes una cuenta?
        - link "Comienza hoy" [ref=e16] [cursor=pointer]:
          - /url: https://fichap.com/
    - generic [ref=e30]:
      - generic [ref=e31]: Bienvenido a Fichap
      - generic [ref=e32]:
        - generic [ref=e33]: Ingresa con tus datos
        - generic [ref=e34]:
          - textbox "Email o Usuario" [ref=e39]: GestionHR
          - generic [ref=e44]:
            - textbox "Contraseña" [ref=e45]: AwTDdFOVki
            - img "eye-invisible" [ref=e47] [cursor=pointer]:
              - img [ref=e48] [cursor=pointer]
          - generic [ref=e53] [cursor=pointer]:
            - checkbox "Recuerdame" [ref=e55] [cursor=pointer]
            - generic [ref=e57] [cursor=pointer]: Recuerdame
          - generic [ref=e61]:
            - button "Ingresar" [active] [ref=e62] [cursor=pointer]
            - generic [ref=e63]:
              - link "¿Olvidaste tu usuario?" [ref=e64] [cursor=pointer]:
                - /url: "#/auth/forgot-username"
              - generic [ref=e65]: .
              - link "¿Olvidaste tu contraseña?" [ref=e66] [cursor=pointer]:
                - /url: "#/auth/forgot-password"
```