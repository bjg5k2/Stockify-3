
// Fix: Provide content for services/leaderboardService.ts file.

// This is a mock leaderboard service. In a real application, this data
// would be fetched from a backend service that aggregates user net worths.
// For this simulation, we'll generate some static data.

export interface LeaderboardEntry {
  userId: string;
  username: string;
  netWorth: number;
}

const mockLeaderboardData: LeaderboardEntry[] = [
  { userId: 'user1', username: 'CryptoKing', netWorth: 150234 },
  { userId: 'user2', username: 'MusicMogul', netWorth: 125890 },
  { userId: 'user3', username: 'PopProphet', netWorth: 110450 },
  { userId: 'user4', username: 'IndieInvestor', netWorth: 98600 },
  { userId: 'user5', username: 'RockBroker', netWorth: 85200 },
  { userId: 'user6', username: 'EDM_Eagle', netWorth: 76430 },
  { userId: 'user7', username: 'FanFund', netWorth: 68110 },
];

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return sorted data
  return mockLeaderboardData.sort((a, b) => b.netWorth - a.netWorth);
};
