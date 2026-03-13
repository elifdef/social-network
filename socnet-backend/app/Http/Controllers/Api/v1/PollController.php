<?php

namespace App\Http\Controllers\Api\v1;

use App\Models\Post;
use App\Models\PollVote;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PollController extends Controller
{
    /**
     * проголосувати в пості (якщо є така можливість)
     */
    public function vote(Request $request, Post $post): JsonResponse
    {
        $request->validate([
            'option_ids' => 'required|array|min:1',
            'option_ids.*' => 'integer'
        ]);

        $user = $request->user();
        $entities = $post->entities ?? [];

        if (!isset($entities['poll']))
        {
            return response()->json(['status' => false, 'message' => 'This post does not contain a poll.'], 404);
        }

        $poll = $entities['poll'];

        // перевірка на закриття
        if (isset($poll['is_closed']) && $poll['is_closed'] === true)
        {
            return response()->json(['status' => false, 'message' => 'This poll is closed. Voting is no longer allowed.'], 403);
        }

        $selectedIds = $request->input('option_ids');
        $isMultipleChoice = $poll['is_multiple_choice'] ?? false;
        $canChangeVote = $poll['can_change_vote'] ?? false;

        // якщо це не множинний вибір а юзер надіслав декілька - блокуємо
        if (!$isMultipleChoice && count($selectedIds) > 1)
        {
            return response()->json(['status' => false, 'message' => 'You can only select one option in this poll.'], 422);
        }

        // перевіряємо чи всі вибрані ID дійсно існують в опитуванні
        $validOptionIds = array_column($poll['options'], 'id');
        if (array_diff($selectedIds, $validOptionIds))
        {
            return response()->json(['status' => false, 'message' => 'One or more selected options are invalid.'], 422);
        }

        // шукаємо старі голоси юзера в цьому пості
        $existingVotes = PollVote::where('post_id', $post->id)->where('user_id', $user->id)->pluck('option_id')->toArray();

        if (!empty($existingVotes))
        {
            if (!$canChangeVote)
            {
                return response()->json([
                    'status' => false,
                    'message' => 'You have already voted. Changing your vote is not allowed in this poll.'
                ], 403);
            }

            // якщо можна змінювати: видаляємо старі голоси
            PollVote::where('post_id', $post->id)->where('user_id', $user->id)->delete();
        }

        // записуємо нові голоси
        $votesToInsert = array_map(function ($optionId) use ($post, $user)
        {
            return [
                'post_id' => $post->id,
                'user_id' => $user->id,
                'option_id' => $optionId,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }, $selectedIds);

        PollVote::insert($votesToInsert);

        $results = PollVote::where('post_id', $post->id)
            ->selectRaw('option_id, count(*) as count')
            ->groupBy('option_id')
            ->pluck('count', 'option_id');

        $response = [
            'status' => true,
            'message' => 'Vote successfully recorded.',
            'results' => $results,
            'voted_option_ids' => $selectedIds
        ];

        // якщо це вікторина то віддаємо пояснення
        if (($poll['type'] ?? 'regular') === 'quiz')
        {
            $response['quiz_data'] = [
                'options' => $poll['options'],
                'explanation' => $poll['explanation'] ?? null
            ];
        }

        return response()->json($response);
    }

    /**
     * список тих хто проголосував
     */
    public function voters(Request $request, Post $post): JsonResponse
    {
        $entities = $post->entities ?? [];

        if (!isset($entities['poll']))
        {
            return response()->json([
                'status' => false,
                'message' => 'Poll not found.'
            ], 404);
        }

        $poll = $entities['poll'];

        if (isset($poll['is_anonymous']) && $poll['is_anonymous'] === true)
        {
            return response()->json([
                'status' => false,
                'message' => 'This poll is anonymous.'
            ], 403);
        }

        $votes = PollVote::where('post_id', $post->id)
            ->with('user:id,username,first_name,last_name,avatar')
            ->get()
            ->groupBy('option_id');

        return response()->json([
            'status' => true,
            'voters' => $votes
        ]);
    }

    public function close(Request $request, Post $post): JsonResponse
    {
        $user = $request->user();

        // тільки автор поста може закрити опитування
        if ($user->id !== $post->user_id)
        {
            return response()->json(['status' => false, 'message' => 'You do not have permission to close this poll.'], 403);
        }

        $entities = $post->entities ?? [];

        if (!isset($entities['poll']))
        {
            return response()->json(['status' => false, 'message' => 'This post does not contain a poll.'], 404);
        }

        if (isset($entities['poll']['is_closed']) && $entities['poll']['is_closed'] === true)
        {
            return response()->json(['status' => false, 'message' => 'This poll is already closed.'], 422);
        }

        $entities['poll']['is_closed'] = true;
        $post->update(['entities' => $entities]);

        return response()->json(['status' => true, 'message' => 'Poll successfully closed.']);
    }
}