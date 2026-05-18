using UnityEngine;

/**
 * PayoutManager.cs (Improved)
 * Handles payout calculations based on symbols, bets, and streaks.
 */
public class PayoutManager : MonoBehaviour
{
    // Symbol IDs: 0, 1, 2, 3 (Standard), 4 (Bonus)
    
    public int GetPayout(int symbolID, int bet, int streak)
    {
        int baseMultiplier = 0;

        switch (symbolID)
        {
            case 0: baseMultiplier = 2; break;  // slot-symbol1
            case 1: baseMultiplier = 3; break;  // slot-symbol2
            case 2: baseMultiplier = 5; break;  // slot-symbol3
            case 3: baseMultiplier = 10; break; // slot-symbol4
            case 4: baseMultiplier = 50; break; // bonus-symbol
            default: baseMultiplier = 0; break;
        }

        // Streak Multiplier: Each streak level adds 0.5x (e.g. 2nd win = 1.5x payout)
        float streakBonus = 1f + (Mathf.Max(0, streak - 1) * 0.5f);
        
        return Mathf.RoundToInt(bet * baseMultiplier * streakBonus);
    }
}
