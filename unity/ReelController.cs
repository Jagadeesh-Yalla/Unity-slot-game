using UnityEngine;
using UnityEngine.UI;
using System.Collections;

/**
 * ReelController.cs (Improved)
 * Handles the visual spinning and stopping of an individual reel.
 */
public class ReelController : MonoBehaviour
{
    public RectTransform reelContainer; // Vertical layout group container
    public float spinSpeed = 1000f;
    public float stopSpeed = 400f;
    
    [HideInInspector] public bool isMoving = false;
    private bool shouldStop = false;
    private float symbolHeight = 150f; // Adjusted for better visual spacing
    private int symbolCount = 5; 

    public void StartSpin()
    {
        if (isMoving) return;
        isMoving = true;
        shouldStop = false;
        StartCoroutine(SpinUpdate());
    }

    public void StopSpin()
    {
        shouldStop = true;
    }

    private IEnumerator SpinUpdate()
    {
        // Continuous spin phase
        while (!shouldStop)
        {
            reelContainer.anchoredPosition -= new Vector2(0, spinSpeed * Time.deltaTime);
            LoopRelatively();
            yield return null;
        }

        // Settle phase - align to nearest symbol center
        float targetY = Mathf.Round(reelContainer.anchoredPosition.y / symbolHeight) * symbolHeight;
        
        while (Mathf.Abs(reelContainer.anchoredPosition.y - targetY) > 0.5f)
        {
            reelContainer.anchoredPosition = Vector2.MoveTowards(
                reelContainer.anchoredPosition, 
                new Vector2(0, targetY), 
                stopSpeed * Time.deltaTime
            );
            LoopRelatively();
            yield return null;
        }

        reelContainer.anchoredPosition = new Vector2(0, targetY);
        isMoving = false;
    }

    private void LoopRelatively()
    {
        float totalHeight = symbolCount * symbolHeight;
        // This modulo-like behavior creates the infinite loop
        if (reelContainer.anchoredPosition.y <= -totalHeight)
        {
            reelContainer.anchoredPosition += new Vector2(0, totalHeight);
        }
        else if (reelContainer.anchoredPosition.y > 0)
        {
            reelContainer.anchoredPosition -= new Vector2(0, totalHeight);
        }
    }

    public int GetStoppedSymbolID()
    {
        // Calculate index based on vertical offset
        int index = Mathf.Abs(Mathf.RoundToInt(reelContainer.anchoredPosition.y / symbolHeight)) % symbolCount;
        return index;
    }
}
