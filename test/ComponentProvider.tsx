import { HeroUINativeProviderRaw } from 'heroui-native/provider-raw';
import type { PropsWithChildren } from 'react';

export function ComponentProvider({ children }: PropsWithChildren) {
  return (
    <HeroUINativeProviderRaw
      config={{ animation: 'disable-all', devInfo: { stylingPrinciples: false } }}
    >
      {children}
    </HeroUINativeProviderRaw>
  );
}
