export interface LevelMilestone {
  level: number;
  xpRequired: number;
  title: string;
  rewardXP: number;
  perkDescription?: string;
}

export const LEVEL_CONFIG: LevelMilestone[] = [
  { level: 1, xpRequired: 0, title: "Arena Rookie", rewardXP: 100, perkDescription: "Basic Arena Access" },
  { level: 2, xpRequired: 500, title: "Roaster", rewardXP: 150, perkDescription: "Unlocked Custom Reactions" },
  { level: 3, xpRequired: 1200, title: "Heckler", rewardXP: 200, perkDescription: "GIF Comments in Live Arena" },
  { level: 4, xpRequired: 2000, title: "Contender", rewardXP: 250, perkDescription: "Vote Weight Multiplier x1.1" },
  { level: 5, xpRequired: 3000, title: "Savage", rewardXP: 300, perkDescription: "Savage Voter Exclusive Badge" },
  { level: 6, xpRequired: 4200, title: "Flame Spitter", rewardXP: 350, perkDescription: "Profile Glow Effect" },
  { level: 7, xpRequired: 5600, title: "Gladiator", rewardXP: 400, perkDescription: "Access to VIP Sponsor Perks" },
  { level: 8, xpRequired: 7200, title: "Duel Master", rewardXP: 450, perkDescription: "Custom Title Flair" },
  { level: 9, xpRequired: 9000, title: "Arena Veteran", rewardXP: 500, perkDescription: "15% Swiggy/Zomato Vouchers" },
  { level: 10, xpRequired: 11000, title: "Arena Legend", rewardXP: 600, perkDescription: "Legendary Gold Border" },
  { level: 12, xpRequired: 16000, title: "Arena Champion", rewardXP: 700, perkDescription: "Featured Roaster Spot" },
  { level: 15, xpRequired: 23000, title: "Grandmaster", rewardXP: 800, perkDescription: "Access to Creator Rounds" },
  { level: 20, xpRequired: 34000, title: "Roast Master", rewardXP: 1000, perkDescription: "Official Roaster Badge" },
  { level: 25, xpRequired: 48000, title: "Ring General", rewardXP: 1200, perkDescription: "Brand Duel Moderator" },
  { level: 30, xpRequired: 65000, title: "Immortal", rewardXP: 1500, perkDescription: "Double XP Weekend Pass" },
  { level: 40, xpRequired: 90000, title: "Titan", rewardXP: 2000, perkDescription: "Roast Arena Hall of Fame" },
  { level: 50, xpRequired: 125000, title: "Arena Icon", rewardXP: 3000, perkDescription: "Permanent VIP Status" },
];

export interface LevelInfo {
  currentLevel: number;
  currentTitle: string;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpNeededForNext: number;
  progressPercentage: number;
  nextTitle: string;
  nextReward: string;
  isMaxLevel: boolean;
}

export function calculateLevelInfo(totalXP: number): LevelInfo {
  const safeXP = Math.max(0, totalXP || 0);

  let currentTier = LEVEL_CONFIG[0];
  let nextTier = LEVEL_CONFIG[1] || LEVEL_CONFIG[0];

  for (let i = 0; i < LEVEL_CONFIG.length; i++) {
    if (safeXP >= LEVEL_CONFIG[i].xpRequired) {
      currentTier = LEVEL_CONFIG[i];
      nextTier = LEVEL_CONFIG[i + 1] || null!;
    } else {
      break;
    }
  }

  const isMaxLevel = !nextTier;
  const xpForCurrent = currentTier.xpRequired;
  const xpForNext = nextTier ? nextTier.xpRequired : xpForCurrent + 10000;
  const span = Math.max(1, xpForNext - xpForCurrent);
  const currentInTier = safeXP - xpForCurrent;
  const progressPercentage = isMaxLevel
    ? 100
    : Math.min(100, Math.max(0, Math.round((currentInTier / span) * 100)));

  return {
    currentLevel: currentTier.level,
    currentTitle: currentTier.title,
    currentXP: safeXP,
    xpForCurrentLevel: xpForCurrent,
    xpForNextLevel: xpForNext,
    xpNeededForNext: Math.max(0, xpForNext - safeXP),
    progressPercentage,
    nextTitle: nextTier ? nextTier.title : "Max Rank Reached",
    nextReward: nextTier
      ? `Level ${nextTier.level} → +${nextTier.rewardXP} XP & ${nextTier.perkDescription}`
      : "You rule the Arena!",
    isMaxLevel,
  };
}

export function checkLevelUp(oldXP: number, newXP: number): {
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  newTitle: string;
  rewardXP: number;
} {
  const oldInfo = calculateLevelInfo(oldXP);
  const newInfo = calculateLevelInfo(newXP);

  if (newInfo.currentLevel > oldInfo.currentLevel) {
    const tier = LEVEL_CONFIG.find((t) => t.level === newInfo.currentLevel);
    return {
      leveledUp: true,
      oldLevel: oldInfo.currentLevel,
      newLevel: newInfo.currentLevel,
      newTitle: newInfo.currentTitle,
      rewardXP: tier?.rewardXP || 100,
    };
  }

  return {
    leveledUp: false,
    oldLevel: oldInfo.currentLevel,
    newLevel: newInfo.currentLevel,
    newTitle: newInfo.currentTitle,
    rewardXP: 0,
  };
}
