// Keys in your InstitutionSettings table (adjust if yours differ)
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
  
  function toNumberOrDefault(raw: unknown, def: number) {
    if (raw === "" || raw === null || raw === undefined) return def;
    const n = Number(raw);
    return Number.isFinite(n) ? n : def;
  }
  
  // Transform Record<string,string> -> AttendanceValues
  export function buildAttendanceInitialValues(settings: SettingsMap) {
    return {
      graceLateMin: toNumberOrDefault(settings[SETTINGS_KEYS.graceLateMin], DEFAULTS.graceLateMin),
      absentAfterMin: toNumberOrDefault(settings[SETTINGS_KEYS.absentAfterMin], DEFAULTS.absentAfterMin),
      earlyLeaveGraceMin: toNumberOrDefault(settings[SETTINGS_KEYS.earlyLeaveGraceMin], DEFAULTS.earlyLeaveGraceMin),
      checkInWindowBeforeMin: toNumberOrDefault(settings[SETTINGS_KEYS.checkInWindowBeforeMin], DEFAULTS.checkInWindowBeforeMin),
      checkInWindowAfterMin: toNumberOrDefault(settings[SETTINGS_KEYS.checkInWindowAfterMin], DEFAULTS.checkInWindowAfterMin),
    };
  }
  