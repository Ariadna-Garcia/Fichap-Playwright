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
          - generic [ref=e36]:
            - textbox "Email o Usuario" [ref=e39]
            - alert [ref=e41]: Por favor, ingrese su correo electrónico o usuario
          - generic [ref=e43]:
            - generic [ref=e46]:
              - textbox "Contraseña" [ref=e47]
              - img "eye-invisible" [ref=e49] [cursor=pointer]:
                - img [ref=e50] [cursor=pointer]
            - alert [ref=e54]: Por favor, ingrese su contraseña
          - generic [ref=e57] [cursor=pointer]:
            - checkbox "Recuerdame" [ref=e59] [cursor=pointer]
            - generic [ref=e61] [cursor=pointer]: Recuerdame
          - generic [ref=e65]:
            - button "Ingresar" [active] [ref=e66] [cursor=pointer]
            - generic [ref=e67]:
              - link "¿Olvidaste tu usuario?" [ref=e68] [cursor=pointer]:
                - /url: "#/auth/forgot-username"
              - generic [ref=e69]: .
              - link "¿Olvidaste tu contraseña?" [ref=e70] [cursor=pointer]:
                - /url: "#/auth/forgot-password"
```