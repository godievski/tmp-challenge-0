import { FieldError } from "heroui-native/field-error";
import { InputGroup } from "heroui-native/input-group";
import { TextField as HeroTextField } from "heroui-native/text-field";
import type { ReactNode } from "react";
import { Platform, type TextInputProps } from "react-native";

export type TextFieldProps = {
  error?: string | null;
  inputProps: TextInputProps;
  trailingAccessory?: ReactNode;
};

export function TextField({
  error,
  inputProps,
  trailingAccessory,
}: TextFieldProps) {
  const { style, ...props } = inputProps;
  const isDisabled = inputProps.editable === false;

  return (
    <HeroTextField
      isInvalid={Boolean(error)}
      isDisabled={isDisabled}
      className="w-full gap-2"
    >
      <InputGroup isDisabled={isDisabled}>
        <InputGroup.Input
          {...props}
          variant="primary"
          multiline={false}
          className={`h-12 min-w-0 px-3 py-0 text-base ios:shadow-none android:shadow-none ${
            error ? "" : "android:border-field-border"
          }`}
          style={[
            { includeFontPadding: Platform.OS === "android" ? false : undefined },
            style,
            // A native single-line input must keep its own line height.
            { lineHeight: undefined },
          ]}
        />
        {trailingAccessory ? (
          <InputGroup.Suffix className="px-3">
            {trailingAccessory}
          </InputGroup.Suffix>
        ) : null}
      </InputGroup>
      <FieldError textProps={{ accessibilityRole: "alert" }}>
        {error}
      </FieldError>
    </HeroTextField>
  );
}
