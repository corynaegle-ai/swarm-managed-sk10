import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';

const TrickBonusEntry = ({ 
  players = [], 
  handCount = 0, 
  playerRoundScores = [], 
  onSubmit = () => {},
  onCancel = () => {} 
}) => {
  const [trickData, setTrickData] = useState({});
  const [bonusData, setBonusData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize data when component mounts or props change
  useEffect(() => {
    const initialTricks = {};
    const initialBonus = {};
    
    players.forEach(player => {
      const existingScore = playerRoundScores.find(score => score.playerId === player.id);
      initialTricks[player.id] = existingScore?.actualTricks ?? '';
      initialBonus[player.id] = existingScore?.bonusPoints ?? 0;
    });
    
    setTrickData(initialTricks);
    setBonusData(initialBonus);
  }, [players, playerRoundScores]);

  const validateTrickCount = (playerId, value) => {
    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue)) {
      return 'Tricks taken must be a number';
    }
    
    if (numValue < 0) {
      return 'Tricks taken cannot be negative';
    }
    
    if (numValue > handCount) {
      return `Tricks taken cannot exceed hand count (${handCount})`;
    }
    
    return null;
  };

  const validateBonusPoints = (playerId, value) => {
    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue)) {
      return 'Bonus points must be a number';
    }
    
    return null;
  };

  const handleTrickChange = (playerId, value) => {
    setTrickData(prev => ({ ...prev, [playerId]: value }));
    
    const error = validateTrickCount(playerId, value);
    setErrors(prev => ({
      ...prev,
      [`tricks_${playerId}`]: error
    }));
  };

  const handleBonusChange = (playerId, value) => {
    setBonusData(prev => ({ ...prev, [playerId]: parseInt(value, 10) || 0 }));
    
    const error = validateBonusPoints(playerId, value);
    setErrors(prev => ({
      ...prev,
      [`bonus_${playerId}`]: error
    }));
  };

  const validateAllData = () => {
    const newErrors = {};
    let totalTricks = 0;
    
    // Validate each player's data
    players.forEach(player => {
      const trickError = validateTrickCount(player.id, trickData[player.id]);
      const bonusError = validateBonusPoints(player.id, bonusData[player.id]);
      
      if (trickError) {
        newErrors[`tricks_${player.id}`] = trickError;
      }
      
      if (bonusError) {
        newErrors[`bonus_${player.id}`] = bonusError;
      }
      
      // Add to total tricks if valid
      const tricks = parseInt(trickData[player.id], 10);
      if (!isNaN(tricks)) {
        totalTricks += tricks;
      }
    });
    
    // Validate total tricks equals hand count
    if (totalTricks !== handCount) {
      newErrors.total = `Total tricks taken (${totalTricks}) must equal hand count (${handCount})`;
    }
    
    // Check for missing trick data
    players.forEach(player => {
      if (trickData[player.id] === '' || trickData[player.id] === undefined) {
        newErrors[`tricks_${player.id}`] = 'Tricks taken is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAllData()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submissionData = players.map(player => {
        const playerScore = playerRoundScores.find(score => score.playerId === player.id);
        const actualTricks = parseInt(trickData[player.id], 10);
        const bonusPoints = bonusData[player.id] || 0;
        
        // Bonus points only count if bid was met exactly
        const bidMet = playerScore && actualTricks === playerScore.bid;
        const finalBonusPoints = bidMet ? bonusPoints : 0;
        
        return {
          playerId: player.id,
          actualTricks,
          bonusPoints: finalBonusPoints,
          bidMet
        };
      });
      
      await onSubmit(submissionData);
    } catch (error) {
      setErrors({ submit: 'Failed to submit trick and bonus data' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBidMetStatus = (playerId) => {
    const playerScore = playerRoundScores.find(score => score.playerId === playerId);
    const actualTricks = parseInt(trickData[playerId], 10);
    
    if (!playerScore || isNaN(actualTricks)) {
      return null;
    }
    
    return actualTricks === playerScore.bid;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Enter Tricks and Bonus Points</CardTitle>
        <p className="text-sm text-gray-600">
          Hand Count: {handCount} | Enter actual tricks taken and bonus points for each player
        </p>
      </CardHeader>
      <CardContent>
        {errors.total && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {errors.total}
            </AlertDescription>
          </Alert>
        )}
        
        {errors.submit && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {errors.submit}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {players.map(player => {
            const playerScore = playerRoundScores.find(score => score.playerId === player.id);
            const bidMet = getBidMetStatus(player.id);
            
            return (
              <div key={player.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{player.name}</h3>
                  <div className="text-sm text-gray-600">
                    Bid: {playerScore?.bid ?? 'N/A'}
                    {bidMet !== null && (
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        bidMet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bidMet ? 'Bid Met' : 'Bid Missed'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`tricks-${player.id}`}>Actual Tricks Taken *</Label>
                    <Input
                      id={`tricks-${player.id}`}
                      type="number"
                      min="0"
                      max={handCount}
                      value={trickData[player.id] || ''}
                      onChange={(e) => handleTrickChange(player.id, e.target.value)}
                      className={errors[`tricks_${player.id}`] ? 'border-red-500' : ''}
                      placeholder="Enter tricks taken"
                    />
                    {errors[`tricks_${player.id}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`tricks_${player.id}`]}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor={`bonus-${player.id}`}>Bonus Points</Label>
                    <Input
                      id={`bonus-${player.id}`}
                      type="number"
                      value={bonusData[player.id] || 0}
                      onChange={(e) => handleBonusChange(player.id, e.target.value)}
                      className={errors[`bonus_${player.id}`] ? 'border-red-500' : ''}
                      placeholder="Enter bonus points"
                      disabled={bidMet === false}
                    />
                    {errors[`bonus_${player.id}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`bonus_${player.id}`]}
                      </p>
                    )}
                    {bidMet === false && (
                      <p className="text-yellow-600 text-sm mt-1">
                        Bonus points disabled - bid not met exactly
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="min-w-24"
          >
            {isSubmitting ? 'Saving...' : 'Save Tricks & Bonus'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrickBonusEntry;