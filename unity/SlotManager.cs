using UnityEngine;
using System.Collections;
using System.Collections.Generic;

/**
 * SlotManager.cs (Improved)
 * Main controller for the slot machine game logic and state.
 * Features: Save/Load, Free Spins, Auto-Spin, Win Streaks.
 */
public class SlotManager : MonoBehaviour
{
    [Header("Reel Controllers")]
    public ReelController[] reels;
    
    [Header("UI & Managers")]
    public UIManager uiManager;
    public PayoutManager payoutManager;

    [Header("Game Settings")]
    public int currentBalance = 1000;
    public int currentBet = 10;
    public int minBet = 10;
    public int maxBet = 100;

    [Header("State Variables")]
    public int freeSpinsRemaining = 0;
    public int winStreak = 0;
    public bool isAutoSpinning = false;
    private bool isSpinning = false;

    private const string BALANCE_KEY = "SlotBalance";

    void Start()
    {
        LoadGame();
        uiManager.UpdateBalance(currentBalance);
        uiManager.UpdateBet(currentBet);
        uiManager.UpdateFreeSpins(freeSpinsRemaining);
        uiManager.UpdateStreak(winStreak);
    }

    public void Spin()
    {
        if (isSpinning) return;
        
        // If we have free spins, it's free! Otherwise check balance.
        if (freeSpinsRemaining > 0 || currentBalance >= currentBet)
        {
            StartCoroutine(SpinRoutine());
        }
        else
        {
            isAutoSpinning = false; // Stop auto spin if no money
            uiManager.UpdateAutoSpinButton(false);
        }
    }

    public void ToggleAutoSpin()
    {
        isAutoSpinning = !isAutoSpinning;
        uiManager.UpdateAutoSpinButton(isAutoSpinning);
        
        if (isAutoSpinning && !isSpinning)
        {
            Spin();
        }
    }

    private IEnumerator SpinRoutine()
    {
        isSpinning = true;

        if (freeSpinsRemaining > 0)
        {
            freeSpinsRemaining--;
            uiManager.UpdateFreeSpins(freeSpinsRemaining);
        }
        else
        {
            currentBalance -= currentBet;
            uiManager.UpdateBalance(currentBalance);
        }

        // Start all reels
        foreach (var reel in reels) reel.StartSpin();

        // Staggered stop (left to right)
        for (int i = 0; i < reels.Length; i++)
        {
            yield return new WaitForSeconds(0.5f + (i * 0.3f));
            reels[i].StopSpin();
            while (reels[i].isMoving) yield return null;
        }

        CheckWin();
        
        SaveGame();
        isSpinning = false;

        // Handle auto-spin loop
        if (isAutoSpinning)
        {
            yield return new WaitForSeconds(1f);
            if (isAutoSpinning) Spin();
        }
    }

    private void CheckWin()
    {
        int[] results = new int[reels.Length];
        for (int i = 0; i < reels.Length; i++)
        {
            results[i] = reels[i].GetStoppedSymbolID();
        }

        // Free Spins Bonus Condition: 3 Bonus Symbols (ID 4)
        if (results[0] == 4 && results[1] == 4 && results[2] == 4)
        {
            freeSpinsRemaining += 5;
            uiManager.UpdateFreeSpins(freeSpinsRemaining);
            uiManager.ShowMessage("FREE SPINS UNLOCKED!");
            uiManager.TriggerScreenShake(0.5f, 5f);
            return; // Bonus overrides normal win in this simple logic
        }

        // Standard Win Condition: all 3 reels show same symbol
        if (results[0] == results[1] && results[1] == results[2])
        {
            winStreak++;
            int winAmount = payoutManager.GetPayout(results[0], currentBet, winStreak);
            currentBalance += winAmount;
            
            uiManager.UpdateBalance(currentBalance);
            uiManager.UpdateStreak(winStreak);
            uiManager.ShowWinCelebration(winAmount);

            // Screen shake for "Big Wins" (e.g. payout 10x or higher)
            if (winAmount >= currentBet * 10)
            {
                uiManager.TriggerScreenShake(0.4f, 10f);
            }
        }
        else
        {
            winStreak = 0;
            uiManager.UpdateStreak(winStreak);
        }
    }

    public void AdjustBet(int amount)
    {
        if (isSpinning) return;
        currentBet = Mathf.Clamp(currentBet + amount, minBet, maxBet);
        uiManager.UpdateBet(currentBet);
    }

    public void SetMinBet() { AdjustBet(-999); }
    public void SetMaxBet() { AdjustBet(999); }

    private void SaveGame()
    {
        PlayerPrefs.SetInt(BALANCE_KEY, currentBalance);
        PlayerPrefs.Save();
    }

    private void LoadGame()
    {
        if (PlayerPrefs.HasKey(BALANCE_KEY))
        {
            currentBalance = PlayerPrefs.GetInt(BALANCE_KEY);
        }
    }
}
