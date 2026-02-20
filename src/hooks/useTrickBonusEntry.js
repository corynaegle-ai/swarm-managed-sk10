import { useState, useCallback } from 'react';
import { TrickBonusService } from '../services/trickBonusService';

/**
 * Custom hook for managing trick and bonus entry functionality
 * @param {Array} players - Array of player objects
 * @param {Array} playerRoundScores - Current round scores
 * @param {number} handCount - Number of tricks in current hand
 * @param {Function} onUpdate - Callback for when scores are updated
 */
export const useTrickBonusEntry = (players = [], playerRoundScores = [], handCount = 0, onUpdate) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [lastSubmission, setLastSubmission] = useState(null);
  
  /**
   * Submits trick and bonus data, validates and updates player scores
   * @param {Array} submissionData - Array of player trick/bonus data
   * @returns {Promise<boolean>} - Success status
   */
  const submitTrickAndBonus = useCallback(async (submissionData) => {
    setIsLoading(true);
    setErrors([]);
    
    try {
      // Validate submission data
      const validation = TrickBonusService.validateSubmissionData(submissionData, handCount);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        return false;
      }
      
      // Update player round scores
      const updatedScores = TrickBonusService.updatePlayerRoundScores(
        playerRoundScores, 
        submissionData
      );
      
      // Format for submission
      const formattedData = TrickBonusService.formatForSubmission(submissionData);
      
      // Call the update callback
      if (onUpdate) {
        await onUpdate(updatedScores, formattedData);
      }
      
      setLastSubmission(formattedData);
      return true;
      
    } catch (error) {
      setErrors([`Submission failed: ${error.message}`]);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [playerRoundScores, handCount, onUpdate]);
  
  /**
   * Validates current trick data without submitting
   * @param {Object} trickData - Object with playerId as keys
   * @returns {Object} - Validation result
   */
  const validateTrickData = useCallback((trickData) => {
    const submissionData = players.map(player => {
      const playerScore = playerRoundScores.find(score => score.playerId === player.id);
      const actualTricks = parseInt(trickData[player.id], 10);
      const bidMet = playerScore && actualTricks === playerScore.bid;
      
      return {
        playerId: player.id,
        actualTricks: actualTricks || 0,
        bonusPoints: 0, // Will be set separately
        bidMet
      };
    });
    
    return TrickBonusService.validateSubmissionData(submissionData, handCount);
  }, [players, playerRoundScores, handCount]);
  
  /**
   * Gets the current completion status
   * @param {Object} trickData - Current trick data
   * @returns {Object} - Completion status and statistics
   */
  const getCompletionStatus = useCallback((trickData) => {
    const isComplete = TrickBonusService.isDataComplete(players, trickData);
    const totalTricks = Object.values(trickData)
      .map(val => parseInt(val, 10) || 0)
      .reduce((sum, tricks) => sum + tricks, 0);
    
    const playersWithData = players.filter(player => {
      const tricks = trickData[player.id];
      return tricks !== undefined && tricks !== '' && !isNaN(parseInt(tricks, 10));
    }).length;
    
    return {
      isComplete,
      totalTricks,
      playersWithData,
      totalPlayers: players.length,
      tricksRemaining: handCount - totalTricks
    };
  }, [players, handCount]);
  
  /**
   * Calculates preview scores for given data
   * @param {Object} trickData - Trick data by player ID
   * @param {Object} bonusData - Bonus data by player ID
   * @returns {Array} - Array of preview score objects
   */
  const calculatePreviewScores = useCallback((trickData, bonusData) => {
    return players.map(player => {
      const playerScore = playerRoundScores.find(score => score.playerId === player.id);
      const actualTricks = parseInt(trickData[player.id], 10);
      const bonusPoints = parseInt(bonusData[player.id], 10) || 0;
      
      if (!playerScore || isNaN(actualTricks)) {
        return {
          playerId: player.id,
          playerName: player.name,
          previewScore: 0,
          bidMet: false,
          actualTricks: 0,
          bonusPoints: 0
        };
      }
      
      const bidMet = actualTricks === playerScore.bid;
      const effectiveBonusPoints = bidMet ? bonusPoints : 0;
      const roundScore = TrickBonusService.calculateRoundScore(
        playerScore.bid,
        actualTricks,
        effectiveBonusPoints
      );
      
      return {
        playerId: player.id,
        playerName: player.name,
        previewScore: roundScore,
        bidMet,
        actualTricks,
        bonusPoints: effectiveBonusPoints,
        bid: playerScore.bid
      };
    });
  }, [players, playerRoundScores]);
  
  /**
   * Clears current errors
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);
  
  return {
    submitTrickAndBonus,
    validateTrickData,
    getCompletionStatus,
    calculatePreviewScores,
    clearErrors,
    isLoading,
    errors,
    lastSubmission
  };
};

export default useTrickBonusEntry;