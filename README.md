# Challenge

Aplicación Expo para Android y iOS con autenticación mock y un catálogo de libros de Open Library.

## Desarrollo

1. Instala las dependencias con `pnpm install`.
2. Copia `.env.example` a `.env`. La variable `EXPO_PUBLIC_OPEN_LIBRARY_SEARCH_URL` define el endpoint público de búsqueda.
3. Inicia el proyecto con `npx expo start`.

## Usuario demo

- Email: cualquier email válido.
- Contraseña: `123456`.

Otra contraseña devuelve un error de autenticación. El mock demora un segundo para mostrar el estado de carga.

## Decisiones técnicas

- Expo Router para la navegación, con rutas protegidas y tabs nativos para Inicio y Ajustes.
- Organización por features (`auth`, `home`, `settings`), separando componentes, hooks, servicios de API y modelos. Los servicios HTTP, almacenamiento y consultas se comparten desde `src/services`.
- HeroUI Native y Uniwind para los componentes y estilos, con tokens de Tailwind, tipografía Geist y una paleta cálida con temas claro y oscuro.
- TanStack Form y Zod para validar el login. La validación comienza al enviar el formulario y se actualiza al editar después del primer submit.
- Zustand para la preferencia de tamaño de página compartida entre Ajustes y el listado.
- TanStack Query para las peticiones, caché, paginación y estados de carga/error. Los datos de Open Library se validan y se adaptan al modelo de libros de la aplicación.
- React Native Keyboard Controller para el teclado y Reanimated para el loader compartido por botones y lista.

## Manejo de sesión/autorización

`AuthProvider` usa Context API para compartir la sesión y los estados de autenticación y restauración. El estado es pequeño y compartido entre las pantallas, por lo que no requiere otro gestor de estado.

El servicio mock acepta cualquier email válido con la contraseña `123456` y devuelve un token dummy de tipo `Bearer`. `useLogin` gestiona la mutación y sus estados mediante TanStack Query.

La sesión, incluido el token y el email, se guarda con `expo-secure-store`. Al iniciar la aplicación se recupera y valida antes de mostrar las rutas. Si no puede guardarse, el login muestra un error y no activa la sesión. Al cerrar sesión se elimina la sesión persistida y se limpia la caché de consultas.

`Stack.Protected` de Expo Router habilita el login cuando no hay sesión y las rutas de `main` cuando el usuario está autenticado. Esta protección controla la navegación; el mock no implementa autorización de un backend ni verifica expiración del token.

## Renderizado de lista

Home usa Legend List para reciclar las filas y evitar renders innecesarios. Carga 2000 libros por página, solicita más al llegar al final y permite actualizar deslizando hacia abajo.

En Ajustes se puede cambiar el tamaño de página a 100, 200, 500, 1000 o 2000 libros. El cambio limpia la caché y reinicia la lista desde la primera página.

## Posibles mejoras

- Revisar un posible problema con las safe areas en Android al usar native tabs. Evaluar si Expo SDK 58 lo corrige y verificarlo en dispositivos antes de migrar.
- Agregar portadas al catálogo. Por ahora se omitieron para reducir las peticiones a los servicios de Open Library.
- Agregar una pantalla de detalle del libro, con un servicio para consultar sus datos completos y una animación de transición desde el catálogo para ofrecer una experiencia nativa.
- Agregar un selector de tema claro/oscuro para que no dependa solamente del sistema.
- Configurar i18n y soporte para varios idiomas.
- Ampliar el mock de autenticación para probar refresh tokens, expiración de sesión e inactividad.

## Estructura

- `src/app`: rutas y layouts de Expo Router.
- `src/features`: autenticación, catálogo y ajustes.
- `src/services`: HTTP, SecureStore y TanStack Query.
- `src/shared/store`: preferencias compartidas por el catálogo y ajustes.
- `src/components/ui`: componentes compartidos, cada uno en su carpeta junto a sus tests.
- `src/theme` y `global.css`: colores y tokens de estilo.
- `test`: configuración y utilidades de testing.

## Tests

| Script                  | Qué prueba                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`             | Todos los tests: validación y mock de login, mapeo y paginación de libros, componentes UI y flujos de integración.              |
| `pnpm test:watch`       | Los mismos tests, ejecutados al editar archivos.                                                                                |
| `pnpm test:integration` | Login, persistencia, restauración y cierre de sesión; consulta de 2010 libros, refresh, caché, cambios de tamaño de página y recuperación ante errores HTTP. |

Las respuestas HTTP y el almacenamiento nativo se simulan para que los tests no dependan de servicios externos ni de un dispositivo.
