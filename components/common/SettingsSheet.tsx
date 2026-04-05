import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Alert, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../../store/useAppStore";
import { useShallow } from "zustand/react/shallow";
import { useThemeColors } from "../../lib/useTheme";
import { useTranslation } from "../../lib/useTranslation";
import { BottomSheet } from "./BottomSheet";
import { GroupManageSheet } from "../groups/GroupManageSheet";
import { ThemeMode, Language } from "../../store/types";
import { radius, spacing, shadow } from "../../lib/theme";
import { NOTIFICATION_PRESETS } from "../../lib/notificationPresets";
import {
  requestNotificationPermission,
  scheduleAllTaskNotifications,
  cancelAllTaskNotifications,
} from "../../lib/notifications";
import { useIAP } from "../../lib/useIAP";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SettingsSheet({ visible, onClose }: Props) {
  const theme = useThemeColors();
  const { t } = useTranslation();
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const addGroup = useAppStore((s) => s.addGroup);
  const addTodo = useAppStore((s) => s.addTodo);
  const groups = useAppStore(useShallow((s) => s.groups));
  const todos = useAppStore(useShallow((s) => s.todos));
  const notificationsEnabled = useAppStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled);
  const defaultNotificationMinutes = useAppStore(
    (s) => s.defaultNotificationMinutes,
  );
  const setDefaultNotificationMinutes = useAppStore(
    (s) => s.setDefaultNotificationMinutes,
  );
  const [showGroups, setShowGroups] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowGroups(false);
    }
  }, [visible]);

  const handleNotifToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      setNotificationsEnabled(true);
      void scheduleAllTaskNotifications(todos, defaultNotificationMinutes);
    } else {
      setNotificationsEnabled(false);
      void cancelAllTaskNotifications(todos);
    }
  };
  const {
    adsRemoved,
    loading: iapLoading,
    purchase,
    restore,
  } = useIAP(visible);

  const handleAddSample = () => {
    const now = new Date();
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    const day = (n: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + n);
      return fmt(d);
    };

    const isEn = language === "en";

    // グループ追加（同名が既存の場合はスキップ）
    const groupWork = { name: isEn ? "Work" : "仕事", color: "#007AFF" };
    const groupPrivate = {
      name: isEn ? "Personal" : "プライベート",
      color: "#34C759",
    };
    const groupStudy = { name: isEn ? "Study" : "勉強", color: "#FF9500" };
    const existingGroupNames = new Set(groups.map((g) => g.name));
    const workNames = ["仕事", "Work"];
    const privateNames = ["プライベート", "Personal"];
    const studyNames = ["勉強", "Study"];
    if (!workNames.some((n) => existingGroupNames.has(n))) addGroup(groupWork);
    if (!privateNames.some((n) => existingGroupNames.has(n)))
      addGroup(groupPrivate);
    if (!studyNames.some((n) => existingGroupNames.has(n)))
      addGroup(groupStudy);

    // タスク追加（グループIDは追加後に取れないので null で追加）
    const sampleTodos = isEn
      ? [
          {
            title: "Submit weekly report",
            priority: "high" as const,
            dueDate: day(1),
          },
          {
            title: "Prepare for team meeting",
            priority: "medium" as const,
            dueDate: day(2),
          },
          {
            title: "Reply to emails in bulk",
            priority: "low" as const,
            dueDate: day(0),
          },
          {
            title: "Make a shopping list",
            priority: "low" as const,
            dueDate: day(1),
          },
          {
            title: "Exercise for 30 minutes",
            priority: "medium" as const,
            dueDate: day(0),
          },
          {
            title: "Memorize 20 vocabulary words",
            priority: "medium" as const,
            dueDate: day(3),
          },
          {
            title: "Read React Native docs",
            priority: "high" as const,
            dueDate: day(5),
          },
        ]
      : [
          {
            title: "週次レポートを提出する",
            priority: "high" as const,
            dueDate: day(1),
          },
          {
            title: "チームミーティングの準備",
            priority: "medium" as const,
            dueDate: day(2),
          },
          {
            title: "メールの返信をまとめてする",
            priority: "low" as const,
            dueDate: day(0),
          },
          {
            title: "買い物リストを作る",
            priority: "low" as const,
            dueDate: day(1),
          },
          { title: "運動 30 分", priority: "medium" as const, dueDate: day(0) },
          {
            title: "英単語を 20 個覚える",
            priority: "medium" as const,
            dueDate: day(3),
          },
          {
            title: "React Native のドキュメントを読む",
            priority: "high" as const,
            dueDate: day(5),
          },
        ];

    // addTodo と Alert をマクロタスクに後退させてアニメーション中のre-render連鎖を防ぐ
    setTimeout(() => {
      const JA_SAMPLE_TITLES = [
        "週次レポートを提出する",
        "チームミーティングの準備",
        "メールの返信をまとめてする",
        "買い物リストを作る",
        "運動 30 分",
        "英単語を 20 個覚える",
        "React Native のドキュメントを読む",
      ];
      const EN_SAMPLE_TITLES = [
        "Submit weekly report",
        "Prepare for team meeting",
        "Reply to emails in bulk",
        "Make a shopping list",
        "Exercise for 30 minutes",
        "Memorize 20 vocabulary words",
        "Read React Native docs",
      ];
      const existingTitles = new Set(
        useAppStore.getState().todos.map((t) => t.title),
      );
      const alreadyHasSamples = [...JA_SAMPLE_TITLES, ...EN_SAMPLE_TITLES].some(
        (title) => existingTitles.has(title),
      );
      if (alreadyHasSamples) {
        Alert.alert(t("settings.addSampleDone"), undefined, [
          { text: "OK", onPress: onClose },
        ]);
        return;
      }
      sampleTodos.forEach((s, i) => {
        addTodo({
          title: s.title,
          memo: "",
          dueDate: s.dueDate,
          isDateOnly: false,
          priority: s.priority,
          categoryId: null,
          groupId: null,
          isCompleted: false,
          orderIndex: i,
          notificationMinutesBefore: null,
        });
      });

      Alert.alert(t("settings.addSampleDone"), undefined, [
        { text: "OK", onPress: onClose },
      ]);
    }, 0);
  };

  const THEME_OPTIONS: { key: ThemeMode; label: string; icon: IoniconsName }[] =
    [
      { key: "light", label: t("settings.themeLight"), icon: "sunny-outline" },
      { key: "dark", label: t("settings.themeDark"), icon: "moon-outline" },
      {
        key: "system",
        label: t("settings.themeSystem"),
        icon: "phone-portrait-outline",
      },
    ];

  const LANGUAGE_OPTIONS: { key: Language; label: string }[] = [
    { key: "ja", label: "日本語" },
    { key: "en", label: "English" },
  ];

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose}>
        <Text style={[styles.title, { color: theme.text }]}>
          {t("settings.title")}
        </Text>

        {/* Theme */}
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>
          {t("settings.theme")}
        </Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => {
            const active = themeMode === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setThemeMode(opt.key)}
                style={({ pressed }) => [
                  styles.themeChip,
                  {
                    backgroundColor: active ? theme.primary : theme.cardBg,
                    borderColor: active ? theme.primary : theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                  !active && shadow.sm,
                ]}
              >
                <Ionicons
                  name={opt.icon}
                  size={16}
                  color={active ? "#FFF" : theme.secondaryText}
                />
                <Text
                  style={[
                    styles.themeChipText,
                    { color: active ? "#FFF" : theme.text },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Language */}
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>
          {t("settings.language")}
        </Text>
        <View style={styles.themeRow}>
          {LANGUAGE_OPTIONS.map((opt) => {
            const active = language === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setLanguage(opt.key)}
                style={({ pressed }) => [
                  styles.themeChip,
                  {
                    backgroundColor: active ? theme.primary : theme.cardBg,
                    borderColor: active ? theme.primary : theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                  !active && shadow.sm,
                ]}
              >
                <Text
                  style={[
                    styles.themeChipText,
                    { color: active ? "#FFF" : theme.text },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Notification */}
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>
          {t("settings.notifications")}
        </Text>
        <View
          style={[
            styles.notifToggleRow,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.notifLabel, { color: theme.text }]}>
            {t("settings.reminder")}
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotifToggle}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFF"
          />
        </View>
        {notificationsEnabled && (
          <View
            style={[
              styles.notifPresetCard,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
          >
            <Text
              style={[styles.notifPresetLabel, { color: theme.secondaryText }]}
            >
              {t("settings.notifTiming")}
            </Text>
            <View style={styles.notifPresetRow}>
              {NOTIFICATION_PRESETS.map((p) => {
                const active = defaultNotificationMinutes === p.minutes;
                return (
                  <Pressable
                    key={p.minutes}
                    onPress={() => setDefaultNotificationMinutes(p.minutes)}
                    style={({ pressed }) => [
                      styles.notifPresetChip,
                      {
                        backgroundColor: active ? theme.primary : theme.pageBg,
                        borderColor: active ? theme.primary : theme.border,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.notifPresetChipText,
                        { color: active ? "#FFF" : theme.text },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Groups */}
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>
          {t("settings.manage")}
        </Text>
        <Pressable
          onPress={() => setShowGroups(true)}
          style={({ pressed }) => [
            styles.menuRow,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons name="layers-outline" size={20} color={theme.primary} />
          <Text style={[styles.menuLabel, { color: theme.text }]}>
            {t("group.manage")}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.secondaryText}
          />
        </Pressable>

        {/* Remove Ads IAP — 広告SDK解決後に復活 */}

        {/* Sample data */}
        <Pressable
          onPress={handleAddSample}
          style={({ pressed }) => [
            styles.menuRow,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons name="flask-outline" size={20} color={theme.primary} />
          <Text style={[styles.menuLabel, { color: theme.text }]}>
            {t("settings.addSample")}
          </Text>
        </Pressable>

        {/* App info */}
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>
          {t("settings.about")}
        </Text>
        <View
          style={[
            styles.infoRow,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.infoLabel, { color: theme.text }]}>
            かんたんタスクカレンダー
          </Text>
          <Text style={[styles.infoValue, { color: theme.secondaryText }]}>
            {t("settings.version")}
          </Text>
        </View>
        <View
          style={[
            styles.infoRow,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.infoLabel, { color: theme.text }]}>
            {t("settings.dataSave")}
          </Text>
          <Text style={[styles.infoValue, { color: theme.secondaryText }]}>
            {t("settings.dataSaveValue")}
          </Text>
        </View>
      </BottomSheet>

      <GroupManageSheet
        visible={showGroups}
        onClose={() => setShowGroups(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  themeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  themeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.button,
    borderWidth: 1,
  },
  themeChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xs,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xs,
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 14,
  },
  notifToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xs,
  },
  notifLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  notifPresetCard: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  notifPresetLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  notifPresetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  notifPresetChip: {
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  notifPresetChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
