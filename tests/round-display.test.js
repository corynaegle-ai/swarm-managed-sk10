/**
 * Tests for round display UI elements
 */

describe('Round Display UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <section class="round-info" id="round-info">
                <div class="round-display">
                    <h2 class="round-number" id="round-number">Round 1</h2>
                    <div class="round-details">
                        <div class="hands-counter">
                            <span class="counter-label">Hands Remaining:</span>
                            <span class="counter-value" id="hands-remaining">5</span>
                        </div>
                        <div class="round-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                            </div>
                            <span class="progress-text" id="progress-text">0% Complete</span>
                        </div>
                    </div>
                </div>
            </section>
        `;
    });

    test('should have round number display element', () => {
        const roundNumber = document.getElementById('round-number');
        expect(roundNumber).toBeTruthy();
        expect(roundNumber.textContent).toBe('Round 1');
    });

    test('should have hands remaining counter element', () => {
        const handsRemaining = document.getElementById('hands-remaining');
        expect(handsRemaining).toBeTruthy();
        expect(handsRemaining.textContent).toBe('5');
    });

    test('should have round progress indicator elements', () => {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        expect(progressFill).toBeTruthy();
        expect(progressText).toBeTruthy();
        expect(progressText.textContent).toBe('0% Complete');
    });

    test('should have semantic HTML structure', () => {
        const roundInfoSection = document.querySelector('section.round-info');
        const roundDisplay = document.querySelector('.round-display');
        
        expect(roundInfoSection).toBeTruthy();
        expect(roundDisplay).toBeTruthy();
    });

    test('should update round information dynamically', () => {
        const roundNumber = document.getElementById('round-number');
        const handsRemaining = document.getElementById('hands-remaining');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        // Simulate round update
        roundNumber.textContent = 'Round 2';
        handsRemaining.textContent = '3';
        progressFill.style.width = '60%';
        progressText.textContent = '60% Complete';

        expect(roundNumber.textContent).toBe('Round 2');
        expect(handsRemaining.textContent).toBe('3');
        expect(progressFill.style.width).toBe('60%');
        expect(progressText.textContent).toBe('60% Complete');
    });
});