import { render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ComponentProvider } from '../../../../test/ComponentProvider';
import { Button } from './Button';

describe('Button', () => {
  it('shows its label and optional icon and responds to a press', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button title="Continuar" onPress={onPress} icon={<Text>Icono</Text>} />,
      { wrapper: ComponentProvider });
    expect(screen.getByText('Continuar')).toBeOnTheScreen();
    expect(screen.getByText('Icono')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Continuar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('replaces the label and icon with the loader and blocks presses while loading', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button title="Continuar" loading onPress={onPress} icon={<Text>Icono</Text>} />,
      { wrapper: ComponentProvider });
    const button = screen.getByRole('button', { name: 'Continuar' });
    expect(button).toBeDisabled();
    expect(button).toBeBusy();
    expect(screen.queryByText('Continuar')).not.toBeOnTheScreen();
    expect(screen.queryByText('Icono')).not.toBeOnTheScreen();
    await user.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('blocks presses when disabled without displaying the loading state', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button title="Continuar" disabled onPress={onPress} />,
      { wrapper: ComponentProvider });
    const button = screen.getByRole('button', { name: 'Continuar' });
    expect(button).toBeDisabled();
    expect(button).not.toBeBusy();
    expect(screen.getByText('Continuar')).toBeOnTheScreen();
    await user.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
