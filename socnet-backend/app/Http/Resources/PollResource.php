<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PollResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $pollData = $this->entities['poll'] ?? [];
        $user = $request->user('sanctum');

        $pollResults = $this->pollVotes()
            ->selectRaw('option_id, count(*) as count')
            ->groupBy('option_id')
            ->pluck('count', 'option_id');

        $votedOptionIds = [];
        if ($user)
        {
            $votedOptionIds = $this->pollVotes()
                ->where('user_id', $user->id)
                ->pluck('option_id')
                ->toArray();
        }

        $hasVoted = count($votedOptionIds) > 0;
        $isQuiz = ($pollData['type'] ?? 'regular') === 'quiz';

        // приховуємо правильні відповіді якщо юзер ще не голосував
        $options = array_map(function ($opt) use ($hasVoted, $isQuiz)
        {
            if ($isQuiz && !$hasVoted)
            {
                unset($opt['is_correct']);
            }
            return $opt;
        }, $pollData['options'] ?? []);

        // приховуємо пояснення
        $explanation = null;
        if ($isQuiz && $hasVoted)
        {
            $explanation = $pollData['explanation'] ?? null;
        }

        return [
            'question' => $pollData['question'] ?? null,
            'type' => $pollData['type'] ?? 'regular',
            'is_anonymous' => $pollData['is_anonymous'] ?? false,
            'can_change_vote' => $pollData['can_change_vote'] ?? false,
            'is_multiple_choice' => $pollData['is_multiple_choice'] ?? false,
            'is_closed' => $pollData['is_closed'] ?? false,
            'options' => $options,
            'explanation' => $explanation,
            'results' => $pollResults,
            'voted_option_ids' => $votedOptionIds,
        ];
    }
}