import { View as DefaultView, ViewProps } from 'react-native';

export function View(props: ViewProps) {
  return <DefaultView style={[{ backgroundColor: '#fff' }, props.style]} {...props} />;
} 