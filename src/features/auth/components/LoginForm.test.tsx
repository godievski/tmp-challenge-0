import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { ComponentProvider } from '../../../../test/ComponentProvider';
import { useLogin } from '../hooks/useLogin';
import { LoginForm } from './LoginForm';

// The form is tested against its login controller; no network or session storage.
jest.mock('../hooks/useLogin', () => ({ useLogin: jest.fn() }));

// TanStack's devtools transport schedules reconnects after rendering; it is not
// part of the form's behavior. Mock that transport before the form is loaded.
jest.mock('@tanstack/devtools-event-client', () => ({
  EventClient: class {
    emit() { return undefined; }
    on() { return () => undefined; }
  },
}), { virtual: true });

const mockedUseLogin = jest.mocked(useLogin);
const login = jest.fn();
const clearError = jest.fn();

beforeEach(() => {
  login.mockReset();
  clearError.mockReset();
  mockedUseLogin.mockReturnValue({ error: null, isLoading: false, login, clearError });
});

describe('LoginForm', () => {
  it('validates only after submit, then clears the error as the email is corrected', async () => {
    const user = userEvent.setup();
    await render(<LoginForm />, { wrapper: ComponentProvider });
    await user.type(screen.getByLabelText('Correo electrónico'), 'invalid');
    await user.type(screen.getByLabelText('Contraseña'), '123456');
    expect(screen.queryByText('Ingresa un email válido.')).not.toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByText('Ingresa un email válido.')).toBeOnTheScreen();
    expect(login).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText('Correo electrónico'));
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    expect(screen.queryByText('Ingresa un email válido.')).not.toBeOnTheScreen();
    expect(login).not.toHaveBeenCalled();
  });

  it('requires both fields before calling login', async () => {
    const user = userEvent.setup();
    await render(<LoginForm />, { wrapper: ComponentProvider });
    await user.press(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByText('Ingresa tu email.')).toBeOnTheScreen();
    expect(screen.getByText('Ingresa tu contraseña.')).toBeOnTheScreen();
    expect(login).not.toHaveBeenCalled();
  });

  it('submits valid credentials to the login controller', async () => {
    const user = userEvent.setup();
    await render(<LoginForm />, { wrapper: ComponentProvider });
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.type(screen.getByLabelText('Contraseña'), '123456');
    await user.press(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await waitFor(() => expect(login).toHaveBeenCalledWith({
      email: 'ana@example.com', password: '123456',
    }));
    expect(login).toHaveBeenCalledTimes(1);
  });

  it('lets the user show and hide the password', async () => {
    const user = userEvent.setup();
    await render(<LoginForm />, { wrapper: ComponentProvider });
    expect(screen.getByLabelText('Contraseña')).toHaveProp('secureTextEntry', true);
    await user.press(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(screen.getByLabelText('Contraseña')).toHaveProp('secureTextEntry', false);
    await user.press(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(screen.getByLabelText('Contraseña')).toHaveProp('secureTextEntry', true);
  });

  it('presents an authentication error and requests clearing it when the user edits', async () => {
    mockedUseLogin.mockReturnValue({ error: 'Credenciales inválidas.', isLoading: false,
      login, clearError });
    const user = userEvent.setup();
    await render(<LoginForm />, { wrapper: ComponentProvider });
    expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas.');
    await user.type(screen.getByLabelText('Contraseña'), '1');
    expect(clearError).toHaveBeenCalled();
  });

  it('locks the fields and password toggle while the login is loading', async () => {
    mockedUseLogin.mockReturnValue({ error: null, isLoading: true, login, clearError });
    const user = userEvent.setup();
    await render(<LoginForm />, { wrapper: ComponentProvider });
    expect(screen.getByLabelText('Correo electrónico')).toHaveProp('editable', false);
    expect(screen.getByLabelText('Contraseña')).toHaveProp('editable', false);
    expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeDisabled();
    const button = screen.getByRole('button', { name: 'Ingresando' });
    expect(button).toBeDisabled();
    expect(button).toBeBusy();
    expect(screen.queryByText('Iniciar sesión')).not.toBeOnTheScreen();
    await user.press(button);
    expect(login).not.toHaveBeenCalled();
  });
});
