import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';

type StepStatus = 'complete' | 'current' | 'upcoming';

type TextFieldProps = TextInputProps & {
  icon: ReactNode;
  trailing?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export function AuthScaffold({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={authStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={authStyles.flex}>
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={authStyles.frame}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function BrandHeader() {
  return (
    <View style={authStyles.brandWrap}>
      <View style={authStyles.brandRow}>
        <View style={authStyles.logoBox}>
          <MaterialCommunityIcons name="pulse" size={34} color={Palette.surface} />
        </View>
        <Text style={authStyles.brandText}>MediVault</Text>
      </View>
    </View>
  );
}

export function RoleBanner() {
  return (
    <View style={authStyles.roleFrame}>
      <View style={authStyles.rolePill}>
        <Feather name="user" size={24} color={Palette.surface} />
        <Text style={authStyles.roleText}>Patient / Student</Text>
      </View>
    </View>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={authStyles.headingBlock}>
      <Text style={authStyles.headingTitle}>{title}</Text>
      <Text style={authStyles.headingSubtitle}>{subtitle}</Text>
    </View>
  );
}

export function StepProgress({ currentStep }: { currentStep: 1 | 2 }) {
  const firstState: StepStatus = currentStep === 2 ? 'complete' : 'current';
  const secondState: StepStatus = currentStep === 2 ? 'current' : 'upcoming';

  return (
    <View style={authStyles.stepRow}>
      <StepBadge label="Your Info" number={1} status={firstState} />
      <View style={[authStyles.stepLine, currentStep === 2 && authStyles.stepLineActive]} />
      <StepBadge label="Security" number={2} status={secondState} />
    </View>
  );
}

function StepBadge({
  label,
  number,
  status,
}: {
  label: string;
  number: number;
  status: StepStatus;
}) {
  const isComplete = status === 'complete';
  const isCurrent = status === 'current';

  return (
    <View style={authStyles.stepBadge}>
      <View
        style={[
          authStyles.stepCircle,
          isComplete && authStyles.stepCircleComplete,
          isCurrent && authStyles.stepCircleCurrent,
        ]}>
        {isComplete ? (
          <Feather name="check" size={20} color={Palette.surface} />
        ) : (
          <Text
            style={[
              authStyles.stepNumber,
              status === 'upcoming' && authStyles.stepNumberUpcoming,
            ]}>
            {number}
          </Text>
        )}
      </View>
      <Text
        style={[
          authStyles.stepLabel,
          status === 'upcoming' && authStyles.stepLabelUpcoming,
        ]}>
        {label}
      </Text>
    </View>
  );
}

export function AuthCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[authStyles.card, style]}>{children}</View>;
}

export function FieldLabel({ children }: PropsWithChildren) {
  return <Text style={authStyles.fieldLabel}>{children}</Text>;
}

export function TextField({ icon, trailing, containerStyle, style, ...props }: TextFieldProps) {
  return (
    <View style={[authStyles.inputShell, containerStyle]}>
      <View style={authStyles.leadingIcon}>{icon}</View>
      <TextInput
        placeholderTextColor={Palette.textSoft}
        selectionColor={Palette.primary}
        style={[authStyles.input, style as StyleProp<TextStyle>]}
        {...props}
      />
      {trailing ? <View style={authStyles.trailingSlot}>{trailing}</View> : null}
    </View>
  );
}

export function SelectField({
  icon,
  placeholder,
  value,
  onPress,
}: {
  icon: ReactNode;
  placeholder: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [authStyles.inputShell, pressed && authStyles.fieldPressed]}>
      <View style={authStyles.leadingIcon}>{icon}</View>
      <Text style={[authStyles.input, authStyles.selectText, !value && authStyles.selectPlaceholder]}>
        {value || placeholder}
      </Text>
      <Feather name="chevron-down" size={24} color={Palette.textSoft} />
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  icon,
  onPress,
  style,
}: {
  label: string;
  icon?: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [authStyles.primaryButton, style, pressed && authStyles.primaryButtonPressed]}>
      <View style={authStyles.buttonInner}>
        {icon ? <View style={authStyles.buttonIcon}>{icon}</View> : null}
        <Text style={authStyles.primaryButtonText}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon?: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [authStyles.secondaryButton, pressed && authStyles.fieldPressed]}>
      <View style={authStyles.buttonInner}>
        {icon ? <View style={authStyles.buttonIcon}>{icon}</View> : null}
        <Text style={authStyles.secondaryButtonText}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function FooterPrompt({
  prompt,
  actionLabel,
  onPress,
}: {
  prompt: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <View style={authStyles.footerRow}>
      <Text style={authStyles.footerText}>{prompt} </Text>
      <Pressable onPress={onPress}>
        <Text style={authStyles.footerLink}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

export function CopyrightNotice() {
  return <Text style={authStyles.copyright}>(c) 2026 MediVault - All rights reserved</Text>;
}

export function ProfileSummaryCard({
  initial,
  name,
  subtitle,
  onEdit,
}: {
  initial: string;
  name: string;
  subtitle: string;
  onEdit: () => void;
}) {
  return (
    <View style={authStyles.summaryCard}>
      <View style={authStyles.avatarCircle}>
        <Text style={authStyles.avatarText}>{initial}</Text>
      </View>
      <View style={authStyles.summaryTextBlock}>
        <Text numberOfLines={1} style={authStyles.summaryName}>
          {name}
        </Text>
        <Text numberOfLines={1} style={authStyles.summarySubtitle}>
          {subtitle}
        </Text>
      </View>
      <Pressable onPress={onEdit}>
        <Text style={authStyles.inlineLink}>Edit</Text>
      </Pressable>
    </View>
  );
}

export function LegalCheckbox({
  checked,
  onPress,
}: {
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[authStyles.checkbox, checked && authStyles.checkboxChecked]}>
      {checked ? <Feather name="check" size={18} color={Palette.surface} /> : null}
    </Pressable>
  );
}

export const authStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: Palette.background,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  frame: {
    alignSelf: 'center',
    maxWidth: 460,
    width: '100%',
  },
  brandWrap: {
    marginTop: 22,
  },
  brandRow: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 18,
  },
  logoBox: {
    alignItems: 'center',
    backgroundColor: Palette.primary,
    borderRadius: 24,
    elevation: 8,
    height: 74,
    justifyContent: 'center',
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    width: 74,
  },
  brandText: {
    color: Palette.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  roleFrame: {
    backgroundColor: Palette.surface,
    borderColor: Palette.borderSoft,
    borderRadius: 30,
    borderWidth: 1,
    elevation: 5,
    marginTop: 34,
    padding: 10,
    shadowColor: Palette.shadowSoft,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  rolePill: {
    alignItems: 'center',
    backgroundColor: Palette.primary,
    borderRadius: 24,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    minHeight: 78,
    paddingHorizontal: 22,
  },
  roleText: {
    color: Palette.surface,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headingBlock: {
    gap: 8,
    marginTop: 34,
  },
  headingTitle: {
    color: Palette.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1.1,
    lineHeight: 40,
  },
  headingSubtitle: {
    color: Palette.textMuted,
    fontSize: 18,
    lineHeight: 28,
  },
  stepRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    marginTop: 38,
  },
  stepBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  stepCircle: {
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderColor: Palette.disabled,
    borderRadius: 22,
    borderWidth: 2,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  stepCircleCurrent: {
    borderColor: Palette.primary,
  },
  stepCircleComplete: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  stepNumber: {
    color: Palette.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  stepNumberUpcoming: {
    color: Palette.textSoft,
  },
  stepLabel: {
    color: Palette.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  stepLabelUpcoming: {
    color: Palette.textSoft,
  },
  stepLine: {
    backgroundColor: Palette.disabled,
    flex: 1,
    height: 4,
    marginHorizontal: 2,
    minWidth: 40,
  },
  stepLineActive: {
    backgroundColor: Palette.primary,
  },
  card: {
    backgroundColor: Palette.surface,
    borderColor: Palette.borderSoft,
    borderRadius: 32,
    borderWidth: 1,
    elevation: 5,
    marginTop: 26,
    padding: 24,
    shadowColor: Palette.shadowSoft,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  fieldLabel: {
    color: Palette.label,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: Palette.surfaceMuted,
    borderColor: Palette.border,
    borderRadius: 24,
    borderWidth: 1.5,
    flexDirection: 'row',
    minHeight: 74,
    paddingHorizontal: 22,
  },
  leadingIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    width: 24,
  },
  input: {
    color: Palette.text,
    flex: 1,
    fontSize: 17,
    minHeight: 26,
    paddingVertical: 0,
  },
  selectText: {
    paddingVertical: 0,
  },
  selectPlaceholder: {
    color: Palette.textSoft,
  },
  trailingSlot: {
    marginLeft: 14,
  },
  fieldPressed: {
    opacity: 0.82,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Palette.primary,
    borderRadius: 24,
    elevation: 6,
    justifyContent: 'center',
    minHeight: 72,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  primaryButtonPressed: {
    backgroundColor: Palette.primaryPressed,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
    borderRadius: 24,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 72,
  },
  buttonInner: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 24,
  },
  buttonIcon: {
    marginRight: 12,
  },
  primaryButtonText: {
    color: Palette.surface,
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryButtonText: {
    color: Palette.label,
    fontSize: 18,
    fontWeight: '800',
  },
  footerRow: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: Palette.textMuted,
    fontSize: 17,
    textAlign: 'center',
  },
  footerLink: {
    color: Palette.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  copyright: {
    color: Palette.textSoft,
    fontSize: 15,
    marginTop: 14,
    textAlign: 'center',
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: Palette.surfaceMuted,
    borderColor: Palette.borderSoft,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 6,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: Palette.primary,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: {
    color: Palette.surface,
    fontSize: 18,
    fontWeight: '800',
  },
  summaryTextBlock: {
    flex: 1,
    gap: 2,
  },
  summaryName: {
    color: Palette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  summarySubtitle: {
    color: Palette.textSoft,
    fontSize: 15,
  },
  inlineLink: {
    color: Palette.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  checkbox: {
    alignItems: 'center',
    borderColor: Palette.border,
    borderRadius: 14,
    borderWidth: 2,
    height: 34,
    justifyContent: 'center',
    marginTop: 2,
    width: 34,
  },
  checkboxChecked: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
});
