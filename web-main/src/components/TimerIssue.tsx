'use client';
import React, { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';
import { Progress } from '@/components/ui/progress';

interface TimerIssueProps {
    deadline: number | bigint;
}

const TimerIssue = ({ deadline }: TimerIssueProps) => {
    const [timeLeft, setTimeLeft] = useState<string>('Loading...');
    const [progress, setProgress] = useState<number>(0);
    
    // Format deadline date
    const formatDeadlineDate = (timestamp: number | bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        const calculateTimeLeftAndProgress = () => {
            const now = Math.floor(Date.now() / 1000); // Current time in seconds
            const deadlineInSeconds = typeof deadline === 'bigint' ? 
                Number(deadline) : deadline;

            // Calculate time remaining
            const timeRemaining = deadlineInSeconds - now;
            
            if (timeRemaining <= 0) {
                setTimeLeft('Expired');
                setProgress(100);
                return;
            }

            // Calculate hours, minutes, seconds
            const hours = Math.floor(timeRemaining / 3600);
            const minutes = Math.floor((timeRemaining % 3600) / 60);
            const seconds = timeRemaining % 60;

            // Format time string
            const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            setTimeLeft(timeString);

            // Calculate progress (elapsed time from start to deadline)
            // Assuming issue was created 30 days ago for demo purposes
            const assumedStartTime = deadlineInSeconds - (30 * 24 * 60 * 60);
            const totalDuration = deadlineInSeconds - assumedStartTime;
            const elapsedTime = now - assumedStartTime;
            const progressPercentage = (elapsedTime / totalDuration) * 100;
            setProgress(Math.min(Math.max(progressPercentage, 0), 100));
        };

        // Calculate immediately and then set up interval
        calculateTimeLeftAndProgress();
        const interval = setInterval(calculateTimeLeftAndProgress, 1000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, [deadline]);

    const isExpired = timeLeft === 'Expired';
    const isUrgent = !isExpired && progress > 80; // More than 80% time elapsed
    
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-semibold text-gray-900">
                    Deadline: {formatDeadlineDate(deadline)}
                </p>
                <div className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-semibold ${
                    isExpired 
                        ? 'bg-red-100 text-red-700' 
                        : isUrgent 
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                }`}>
                    <FaClock size={14} />
                    <span>{timeLeft}</span>
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Time Elapsed</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="relative">
                    <Progress 
                        value={progress} 
                        className={`h-6 border border-gray-300 ${
                            isExpired 
                                ? 'bg-red-50' 
                                : isUrgent 
                                ? 'bg-yellow-50'
                                : 'bg-green-50'
                        }`}
                        indicatorColor={
                            isExpired 
                                ? 'bg-red-500' 
                                : isUrgent 
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                        }
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xs font-medium ${
                            progress > 50 ? 'text-white' : 'text-gray-700'
                        }`}>
                            {isExpired ? 'Expired' : `${timeLeft} remaining`}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimerIssue;