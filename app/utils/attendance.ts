// Keys in your InstitutionSettings table (adjust if yours differ)
type Source = "server" | "default";

const SETTINGS_KEYS = {
    graceLateMin: "attendance.graceLateMin",
    absentAfterMin: "attendance.absentAfterMin",
    earlyLeaveGraceMin: "attendance.earlyLeaveGraceMin",
    checkInWindowBeforeMin: "attendance.checkInWindowBeforeMin",
    checkInWindowAfterMin: "attendance.checkInWindowAfterMin",
  } as const;
  
  type SettingsMap = Record<string, string>;
  
  const DEFAULTS = {
    graceLateMin: 5,
    absentAfterMin: 240,
    earlyLeaveGraceMin: 0,
    checkInWindowBeforeMin: 15,
    checkInWindowAfterMin: 60,
  } as const;
  
  function toNumberWithSource(raw: unknown, def: number): { value: number; source: Source; raw: unknown } {
    const usedDefault = raw === "" || raw === null || raw === undefined || !Number.isFinite(Number(raw));
    return {
      value: usedDefault ? def : Number(raw),
      source: usedDefault ? "default" : "server",
      raw,
    };
  }
  
  // Transform Record<string,string> -> AttendanceValues
  export function buildAttendanceInitialValuesWithMeta(settings: SettingsMap) {
    const graceLate = toNumberWithSource(settings[SETTINGS_KEYS.graceLateMin], DEFAULTS.graceLateMin);
    const absentAfter = toNumberWithSource(settings[SETTINGS_KEYS.absentAfterMin], DEFAULTS.absentAfterMin);
    const earlyLeave = toNumberWithSource(settings[SETTINGS_KEYS.earlyLeaveGraceMin], DEFAULTS.earlyLeaveGraceMin);
    const before = toNumberWithSource(settings[SETTINGS_KEYS.checkInWindowBeforeMin], DEFAULTS.checkInWindowBeforeMin);
    const after = toNumberWithSource(settings[SETTINGS_KEYS.checkInWindowAfterMin], DEFAULTS.checkInWindowAfterMin);
  
    return {
      values: {
        graceLateMin: graceLate.value,
        absentAfterMin: absentAfter.value,
        earlyLeaveGraceMin: earlyLeave.value,
        checkInWindowBeforeMin: before.value,
        checkInWindowAfterMin: after.value,
      },
      meta: {
        graceLateMin: graceLate,
        absentAfterMin: absentAfter,
        earlyLeaveGraceMin: earlyLeave,
        checkInWindowBeforeMin: before,
        checkInWindowAfterMin: after,
      },
    };
  }
  