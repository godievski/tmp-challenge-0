import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import type { PropsWithChildren } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ComponentProvider } from '../../../../test/ComponentProvider';
import { LoginForm } from '../components/LoginForm';
import { AuthProvider, useAuth } from '../context/AuthProvider';

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'device-only',
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Disable the external devtools transport, keeping TanStack Form itself real.
jest.mock('@tanstack/devtools-event-client', () => ({
  EventClient: class {
    emit() { return undefined; }
    on() { return () => undefined; }
  },
}), { virtual: true });

const storedItems = new Map<string, string>();
const session = {
  accessToken: 'dummy-access-token', tokenType: 'Bearer', email: 'ana@example.com',
};
let queryClient: QueryClient;

function AuthFlow() {
  const auth = useAuth();
  if (auth.isRestoring) return <Text>Restaurando sesión</Text>;
  if (auth.isAuthenticated) {
    return (
      <View>
        <Text>{auth.session?.email}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar sesión"
          onPress={() => void auth.signOut()}><Text>Cerrar sesión</Text></Pressable>
      </View>
    );
  }
  return <LoginForm />;
}

function Providers({ children }: PropsWithChildren) {
  return (
    <ComponentProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ComponentProvider>
  );
}

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: {
    queries: { retry: false, gcTime: Infinity },
    mutations: { retry: false, gcTime: Infinity },
  } });
  storedItems.clear();
  jest.mocked(SecureStore.getItemAsync).mockReset()
    .mockImplementation(async (key) => storedItems.get(key) ?? null);
  jest.mocked(SecureStore.setItemAsync).mockReset()
    .mockImplementation(async (key, value) => { storedItems.set(key, value); });
  jest.mocked(SecureStore.deleteItemAsync).mockReset()
    .mockImplementation(async (key) => { storedItems.delete(key); });
});

afterEach(() => queryClient.clear());

async function submitLogin(password = '123456') {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText('Correo electrónico'), 'ana@example.com');
  await user.type(screen.getByLabelText('Contraseña'), password);
  await user.press(screen.getByRole('button', { name: 'Iniciar sesión' }));
  return user;
}

describe('Authentication integration', () => {
  it('logs in through the form, persists the session, restores it on remount and signs out', async () => {
    const onSignOut = jest.fn();
    const tree = () => <AuthProvider onSignOut={onSignOut}><AuthFlow /></AuthProvider>;
    await render(tree(), { wrapper: Providers });
    const user = await submitLogin();
    expect(screen.getByRole('button', { name: 'Ingresando' })).toBeBusy();
    expect(await screen.findByText('ana@example.com', {}, { timeout: 2500 })).toBeOnTheScreen();
    expect(JSON.parse(storedItems.get('auth.session')!)).toEqual(session);

    await screen.unmount();
    await render(tree(), { wrapper: Providers });
    expect(await screen.findByText('ana@example.com')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Contraseña')).not.toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(await screen.findByLabelText('Correo electrónico')).toBeOnTheScreen();
    expect(storedItems.has('auth.session')).toBe(false);
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('shows invalid credentials without saving a session, then allows a corrected login', async () => {
    await render(<AuthProvider><AuthFlow /></AuthProvider>, { wrapper: Providers });
    const user = await submitLogin('incorrecta');
    expect(await screen.findByRole('alert', {}, { timeout: 2500 }))
      .toHaveTextContent('Credenciales inválidas.');
    expect(storedItems.has('auth.session')).toBe(false);
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText('Contraseña'));
    await user.type(screen.getByLabelText('Contraseña'), '123456');
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeOnTheScreen());
    await user.press(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByText('ana@example.com', {}, { timeout: 2500 })).toBeOnTheScreen();
  });

  it('does not authenticate if SecureStore cannot persist the successful login', async () => {
    jest.mocked(SecureStore.setItemAsync).mockRejectedValueOnce(new Error('Keychain unavailable'));
    await render(<AuthProvider><AuthFlow /></AuthProvider>, { wrapper: Providers });
    await submitLogin();
    expect(await screen.findByRole('alert', {}, { timeout: 2500 }))
      .toHaveTextContent('No se pudo guardar tu sesión. Inténtalo nuevamente.');
    expect(screen.getByLabelText('Correo electrónico')).toBeOnTheScreen();
    expect(storedItems.has('auth.session')).toBe(false);
  });

  it.each([
    ['invalid JSON', '{broken'],
    ['invalid session', JSON.stringify({ ...session, email: 'invalid' })],
  ])('discards %s from storage and shows the login form', async (_, stored) => {
    storedItems.set('auth.session', stored);
    await render(<AuthProvider><AuthFlow /></AuthProvider>, { wrapper: Providers });
    expect(await screen.findByLabelText('Correo electrónico')).toBeOnTheScreen();
    expect(storedItems.has('auth.session')).toBe(false);
  });

  it('finishes restoration and explains a storage read failure to the user', async () => {
    jest.mocked(SecureStore.getItemAsync).mockRejectedValueOnce(new Error('Keychain unavailable'));
    await render(<AuthProvider><AuthFlow /></AuthProvider>, { wrapper: Providers });
    expect(await screen.findByRole('alert'))
      .toHaveTextContent('No se pudo recuperar tu sesión. Inicia sesión nuevamente.');
    expect(screen.getByLabelText('Correo electrónico')).toBeOnTheScreen();
  });

});
