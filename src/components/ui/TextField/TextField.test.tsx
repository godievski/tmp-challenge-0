import { render, screen, userEvent } from '@testing-library/react-native';
import { useState } from 'react';
import { Text } from 'react-native';
import { ComponentProvider } from '../../../../test/ComponentProvider';
import { TextField } from './TextField';

describe('TextField', () => {
  it('lets the user edit a controlled input identified by its placeholder', async () => {
    function ControlledField() {
      const [value, setValue] = useState('');
      return <TextField inputProps={{ placeholder: 'Email', value, onChangeText: setValue }} />;
    }
    const user = userEvent.setup();
    await render(<ControlledField />, { wrapper: ComponentProvider });
    await user.type(screen.getByPlaceholderText('Email'), 'ana@example.com');
    expect(screen.getByPlaceholderText('Email')).toHaveDisplayValue('ana@example.com');
  });

  it('shows an accessible error and removes it when the field becomes valid', async () => {
    await render(<TextField error="Email inválido" inputProps={{ placeholder: 'Email' }} />,
      { wrapper: ComponentProvider });
    expect(screen.getByRole('alert')).toHaveTextContent('Email inválido');
    await screen.rerender(<TextField inputProps={{ placeholder: 'Email' }} />);
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
  });

  it('keeps the native single-line configuration even if supplied styles set lineHeight', async () => {
    await render(<TextField inputProps={{ placeholder: 'Email', multiline: true,
      style: { lineHeight: 20 } }} trailingAccessory={<Text>Accesorio</Text>} />,
      { wrapper: ComponentProvider });
    const input = screen.getByPlaceholderText('Email');
    expect(input).toHaveProp('multiline', false);
    expect(input).toHaveStyle({ lineHeight: undefined });
    expect(screen.getByText('Accesorio')).toBeOnTheScreen();
  });

  it('does not accept edits when editable is false', async () => {
    const onChangeText = jest.fn();
    const user = userEvent.setup();
    await render(<TextField inputProps={{ placeholder: 'Email', editable: false, onChangeText }} />,
      { wrapper: ComponentProvider });
    await user.type(screen.getByPlaceholderText('Email'), 'ana@example.com');
    expect(onChangeText).not.toHaveBeenCalled();
  });
});
