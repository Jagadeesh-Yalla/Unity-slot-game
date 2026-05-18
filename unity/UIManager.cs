using UnityEngine;
using UnityEngine.UI;
using System.Collections;

/**
 * UIManager.cs (Improved)
 * Updates UI elements and handles win effects.
 */
public class UIManager : MonoBehaviour
{
    [Header("Core UI")]
    public Text balanceText;
    public Text betText;
    public Text streakText;
    public Text freeSpinsText;
    public Text autoSpinBtnText;

    [Header("Panels & Celebrations")]
    public GameObject winCelebrationPanel;
    public Text winAmountText;
    public GameObject messagePanel;
    public Text messageText;

    [Header("Effects")]
    public Transform mainCameraTransform;
    private Vector3 originalCamPos;

    void Start()
    {
        if (mainCameraTransform != null) originalCamPos = mainCameraTransform.localPosition;
    }

    public void UpdateBalance(int balance)
    {
        balanceText.text = "Balance: " + balance;
    }

    public void UpdateBet(int bet)
    {
        betText.text = "Bet: " + bet;
    }

    public void UpdateStreak(int streak)
    {
        if (streakText != null) streakText.text = "Streak: " + streak + "x";
    }

    public void UpdateFreeSpins(int count)
    {
        if (freeSpinsText != null) freeSpinsText.text = "Free Spins: " + count;
    }

    public void UpdateAutoSpinButton(bool active)
    {
        if (autoSpinBtnText != null) autoSpinBtnText.text = active ? "STOP AUTO" : "AUTO SPIN";
    }

    public void ShowWinCelebration(int amount)
    {
        winCelebrationPanel.SetActive(true);
        winAmountText.text = "WIN: " + amount;
        StartCoroutine(HidePanelAfterDelay(winCelebrationPanel, 3f));
    }

    public void ShowMessage(string msg)
    {
        if (messagePanel == null) return;
        messagePanel.SetActive(true);
        messageText.text = msg;
        StartCoroutine(HidePanelAfterDelay(messagePanel, 2.5f));
    }

    private IEnumerator HidePanelAfterDelay(GameObject panel, float delay)
    {
        yield return new WaitForSeconds(delay);
        panel.SetActive(false);
    }

    // Screen Shake Effect
    public void TriggerScreenShake(float duration, float magnitude)
    {
        if (mainCameraTransform != null)
            StartCoroutine(ShakeRoutine(duration, magnitude));
    }

    private IEnumerator ShakeRoutine(float duration, float magnitude)
    {
        float elapsed = 0.0f;

        while (elapsed < duration)
        {
            float x = Random.Range(-1f, 1f) * magnitude;
            float y = Random.Range(-1f, 1f) * magnitude;

            mainCameraTransform.localPosition = new Vector3(originalCamPos.x + x, originalCamPos.y + y, originalCamPos.z);

            elapsed += Time.deltaTime;
            yield return null;
        }

        mainCameraTransform.localPosition = originalCamPos;
    }
}
