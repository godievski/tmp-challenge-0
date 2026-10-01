# Challenge

Aplicación Expo para Android y iOS con autenticación mock y un listado de libros de Open Library.

## Desarrollo

1. Instala las dependencias con `pnpm install`.
2. Copia `.env.example` a `.env`. La variable `EXPO_PUBLIC_OPEN_LIBRARY_SEARCH_URL` apunta al endpoint público de búsqueda.
3. Inicia el proyecto con `npx expo start`.

La URL es pública y Expo la incluye en el bundle de la aplicación. No agregues secretos a variables `EXPO_PUBLIC_`.

## Estructura

- `src/app`: solo rutas y layouts de Expo Router (`_layout.tsx`, `index.tsx`, `main/`).
- `src/services`: servicios transversales compartidos por la aplicación:
  - `http/httpClient.ts`: cliente HTTP centralizado con soporte de `AbortSignal` y serialización de parámetros.
  - `storage/secureStorage.ts`: persistencia cifrada por hardware mediante `expo-secure-store`.
  - `query/`: cliente de TanStack Query y proveedor sincronizado con el ciclo de vida móvil (`AppState`).
- `src/features/auth`: encapsula todo lo relativo a autenticación:
  - `api/authService.ts`: contrato `AuthService`.
  - `api/mockAuthService.ts`: implementación mock intercambiable.
  - `context/AuthProvider.tsx`: gestión de sesión con persistencia en `secureStorage`.
  - `hooks/useLogin.ts`: mutación declarativa del login.
  - `components/` & `screens/`: formulario y pantalla de acceso.
  - `types.ts`: modelos de sesión y credenciales.
- `src/features/home`: catálogo y consumo de la API pública:
  - `api/books.dto.ts`: contrato y validación Zod de la API externa (Open Library).
  - `api/books.mapper.ts`: mapeo explícito de `BookDTO` hacia el modelo interno `Book`.
  - `api/booksApi.ts`: llamadas remotas utilizando `httpClient`.
  - `hooks/useBooks.ts`: consulta paginada infinita con TanStack Query.
  - `components/` & `screens/`: celda `BookCard` y pantalla `HomeScreen`.
  - `types.ts`: modelo interno de la aplicación (`Book`, `BookPage`).
- `src/features/settings`: pantalla de cuenta y cierre de sesión (`signOut`).
- `src/components/ui`: primitivas de diseño reutilizables (`AppText`, `Button`, `TextField`, `Loader`).

La búsqueda en Home consulta Open Library en páginas de 100 libros conforme se llega al final del listado (`fiction`, más de 2000 resultados). Deslizar hacia abajo reinicia la lista y vuelve a consultar la primera página.
